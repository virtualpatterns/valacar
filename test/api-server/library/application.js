'use strict';

const Asynchronous = require('async');
const ChildProcess = require('child_process');
const HTTP = require('http');
const Utilities = require('util');

const _Application = require('../../client/library/application');
const Database = require('./database');
const FileSystem = require('../../../client/library/file-system');
const Log = require('../../../client/library/log');
const Package = require('../../../package.json');
const Path = require('../../../client/library/path');
const Process = require('../../../client/library/process');

const ProcessError = require('../../../client/library/errors/process-error');

const PAUSE = 500;
const REGEXP_SPLIT = /(?:[^\s"]+|"[^"]*")+/g;
const REGEXP_QUOTE = /^"|"$/g;
const TYPEOF_FUNCTION = 'function';
const TYPEOF_NUMBER = 'number';

const Application = Object.create(_Application);

Object.defineProperty(Application, 'ADDRESS', {
  'enumerable': true,
  'writable': false,
  'value': '0.0.0.0'
});

Object.defineProperty(Application, 'PORT', {
  'enumerable': true,
  'writable': false,
  'value': 8081
});

Object.defineProperty(Application, 'DATABASE_PATH', {
  'enumerable': true,
  'writable': false,
  'value': Database.DATABASE_PATH
});

Object.defineProperty(Application, 'LOG_PATH', {
  'enumerable': true,
  'writable': false,
  'value': Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.server.test.log', Package.name))
});

Object.defineProperty(Application, 'MASTER_LOG_PATH', {
  'enumerable': true,
  'writable': false,
  'value': Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.master.test.log', Package.name))
});

Object.defineProperty(Application, 'WORKER_LOG_PATH', {
  'enumerable': true,
  'writable': false,
  'value': Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.worker.test.log', Package.name))
});

Object.defineProperty(Application, 'MASTER_PID_PATH', {
  'enumerable': true,
  'writable': false,
  'value': Path.join(Process.cwd(), 'process', 'pid', Utilities.format('%s.master.test.pid', Package.name))
});

Object.defineProperty(Application, 'NUMBER_OF_WORKERS', {
  'enumerable': true,
  'writable': false,
  'value': 1
});

Application.executeCommand = function(command, callback) {
  Log.debug('> Application.executeCommand(%j, callback) { ... }', command);

  let _command = command;
  _command = _command.match(REGEXP_SPLIT);
  _command = _command.map(function(item) {
    return item.replace(REGEXP_QUOTE, '');
  });

  _command = _command.shift();

  if (_command != 'start' &&
      _command != 'stop') {
    // Log.debug('> Object.getPrototypeOf(this).executeCommand.call(this, %j, callback)', command);
    Object.getPrototypeOf(this).executeCommand.call(this, command, callback);
  }
  else {

    Log.info('> ./api-server.js %s', command);
    ChildProcess.exec(Utilities.format('./api-server.js %s', command), function(error, stdout, stderr) {
      Asynchronous.series([
        function(callback) {
          FileSystem.writeFile(Path.join(Process.cwd(), 'process', 'output', 'server', Utilities.format('%s.out', _command)), stdout, callback);
        },
        function(callback) {
          FileSystem.writeFile(Path.join(Process.cwd(), 'process', 'output', 'server', Utilities.format('%s.err', _command)), stderr, callback);
        },
        function(callback) {
          Log.info('< ./api-server.js %s', command);
          if (error) {
            Log.info('    error.message=%j\n\n%s\n\n', error.message, error.stack);
            callback(new ProcessError(Utilities.format('An error occurred executing the command %j (%s).', command, stderr)), stdout, stderr);
          }
          else
            callback(null, stdout, stderr);
        }
      ], callback);
    });

  }

};

Application.executeStart = function(callback) {
  this.executeCommand(Utilities.format('start %j  --fork \
                                                  --address %s \
                                                  --port %d \
                                                  --masterLogPath %j \
                                                  --workerLogPath %j \
                                                  --masterPIDPath %j \
                                                  --numberOfWorkers %d',  this.DATABASE_PATH,
                                                                          this.ADDRESS,
                                                                          this.PORT,
                                                                          this.MASTER_LOG_PATH,
                                                                          this.WORKER_LOG_PATH,
                                                                          this.MASTER_PID_PATH,
                                                                          this.NUMBER_OF_WORKERS), callback);
};

Application.executeStop = function(callback) {
  this.executeCommand(Utilities.format('stop  --masterLogPath %j \
                                              --masterPIDPath %j',  this.MASTER_LOG_PATH,
                                                                    this.MASTER_PID_PATH), callback);
};

Application.request = function(method, path, requestData, callback) {

  if (typeof requestData == TYPEOF_FUNCTION) {
    callback = requestData;
    requestData = null;
  }

  let _this = this;

  if (requestData)
    Log.info('> Application.request(%j, %j, requestData, callback)\n\n%s\n', method, path, Utilities.inspect(requestData));
  else
    Log.info('> Application.request(%j, %j, requestData, callback)', method, path);

  let options = {
    'hostname': this.ADDRESS,
    'port': this.PORT,
    'path': path,
    'method': method,
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': Utilities.format('%s/%s', Package.name, Package.version)
    }
  };

  // Log.info('> HTTP.request(options, function(response) { ... }');
  // Log.info('> HTTP.request(options, function(response) { ... }\n\n%s\n', Utilities.inspect(options));
  let request = HTTP.request(options, function(response) {
    // Log.info('= HTTP.request(options, function(response) { ... }');
    // Log.info('    response.statusCode=%d\n\n%s\n', response.statusCode, Utilities.inspect(response.headers));

    let responseData = '';

    response.setEncoding('utf8');
    response.on('data', function(_responseData) {
      responseData += _responseData;
    });

    response.once('end', function() {
      Asynchronous.series([
        function(callback) {
          FileSystem.mkdirp(Path.join(Process.cwd(), 'process', 'output', 'server', path), callback)
        },
        function(callback) {
          FileSystem.writeFile(Path.join(Process.cwd(), 'process', 'output', 'server', path, Utilities.format('%s.json', method)), responseData, callback);
        }
      ], function(error) {
        if (error) {
          Log.info('< HTTP.ServerResponse.once("end", function() { ... })');
          Log.info('    error.message=%j\n\n%s\n\n', error.message, error.stack);
          callback(error)
        }
        else if (responseData) {

          let data = JSON.parse(responseData);

          Log.info('< HTTP.ServerResponse.on("end", function() { ... })\n\n%s\n', Utilities.inspect(data));
          callback(null, response.statusCode, response.headers, data);

        }
        else {
          Log.info('< HTTP.ServerResponse.on("end", function() { ... })');
          callback(null, response.statusCode, response.headers, null);
        }
      });
    });

  });

  request.once('error', function(error) {
    // if (error.code == 'ECONNREFUSED')
    //   _this.request(method, path, requestData, callback);
    // else {
      Log.info('< HTTP.ServerRequest.on("error", function(error) { ... })');
      Log.info('    error.code=%j', error.code);
      Log.info('    error.message=%j\n\n%s\n\n', error.message, error.stack);
      callback(error);
    // }
  });

  if (requestData)
    request.write(JSON.stringify(requestData));

  request.end();

};

Application.waitReady = function(callback) {

  let _this = this;

  this.HEAD('/', function(error, statusCode, headers, data) {
    if (error &&
        error.code == 'ECONNREFUSED')
      setTimeout(function() {
        _this.waitReady(callback);
      }, PAUSE);
    else
      callback(error);
  });

};

Application.waitNotReady = function(callback) {

  let _this = this;

  this.HEAD('/', function(error, statusCode, headers, data) {
    if (error &&
        error.code == 'ECONNREFUSED')
      callback(null);
    else
      setTimeout(function() {
        _this.waitNotReady(callback);
      }, PAUSE);
  });

};

Application.isHEAD = function(path, callback) {
  this.request('HEAD', path, function(error, statusCode, headers, data) {
    if (error) {
      Log.info('< Application.existsHEAD(%j, callback) { ... }', path);
      Log.info('    error.message=%j\n\n%s\n\n', error.message, error.stack);
      callback(error);
    }
    else
      callback(null);
  });
};

Application.isNotHEAD = function(path, callback) {
  this.request('HEAD', path, function(error, statusCode, headers, data) {
    if (error) {
      // Log.info('< Application.notExistsHEAD(%j, callback) { ... }', path);
      // Log.info('    error.message=%j\n\n%s\n\n', error.message, error.stack);
      callback(null);
    }
    else
      callback(new URIError(Utilities.format('HEAD\'ing %j succeeded.', path)));
  });
};

Application.HEAD = function(path, callback) {
  this.request('HEAD', path, callback);
};

Application.GET = function(path, callback) {
  this.request('GET', path, callback);
};

Application.POST = function(path, requestData, callback) {
  this.request('POST', path, requestData, callback);
};

Application.DELETE = function(path, callback) {
  this.request('DELETE', path, callback);
};

Application.isRequest = function(method, path, requestData, matchFn, callback) {

  if (typeof requestData == TYPEOF_FUNCTION) {
    callback = matchFn;
    matchFn = requestData;
    requestData = null;
  }

  this.request(method, path, requestData, function(error, statusCode, headers, data) {
    if (error)
      callback(error);
    else
      matchFn(statusCode, headers, data, function(error, isMatch) {
        // Log.debug('Application.isRequest(%j, %j, requestData, matchFn, callback) { ... } isMatch=%j', method, path, isMatch);
        if (error)
          callback(error);
        else if (!isMatch)
          callback(new Error('The server response does not match what is expected.'));
        else
          callback(null, true);
      });
  });

};

Application.isGET = function(path, matchFn, callback) {
  this.isRequest('GET', path, matchFn, callback);
};

Application.isPOST = function(path, requestData, matchFn, callback) {
  this.isRequest('POST', path, requestData, matchFn, callback);
};

Application.isRequestStatusCode = function(method, path, requestData, expectedStatusCode, callback) {

  if (typeof requestData == TYPEOF_NUMBER) {
    callback = expectedStatusCode;
    expectedStatusCode = requestData;
    requestData = null;
  }

  this.isRequest(method, path, requestData, function(actualStatusCode, headers, data, callback) {
    callback(null, actualStatusCode == expectedStatusCode);
  }, callback);

};

Application.isHEADStatusCode = function(path, statusCode, callback) {
  this.isRequestStatusCode('HEAD', path, statusCode, callback);
};

Application.isGETStatusCode = function(path, statusCode, callback) {
  this.isRequestStatusCode('GET', path, statusCode, callback);
};

Application.isPOSTStatusCode = function(path, requestData, statusCode, callback) {
  this.isRequestStatusCode('POST', path, requestData, statusCode, callback);
};

Application.isDELETEStatusCode = function(path, statusCode, callback) {
  this.isRequestStatusCode('DELETE', path, statusCode, callback);
};

module.exports = Application;

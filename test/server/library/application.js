

var Asynchronous = require('async');
var ChildProcess = require('child_process');
var HTTP = require('http');
var Is = require('@pwn/is');
var Utilities = require('util');

var _Application = require('../../client/library/application');
var Database = require('./database');
var FileSystem = require('../../../client/library/file-system');
var Log = require('../../../client/library/log');
var Package = require('../../../package.json');
var Path = require('../../../client/library/path');
var Process = require('../../../client/library/process');

var ProcessError = require('../../../client/library/errors/process-error');

var REGEXP_SPLIT = /(?:[^\s"]+|"[^"]*")+/g;
var REGEXP_QUOTE = /^"|"$/g;
var TYPEOF_FUNCTION = 'function';
var TYPEOF_NUMBER = 'number';
var WAIT_DURATION = 15000;
var WAIT_TIMEOUT = 500;

var Application = Object.create(_Application);

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
  'value': Path.join(Process.LOG_PATH, Utilities.format('%s.test.log', Package.name))
});

Object.defineProperty(Application, 'MASTER_LOG_PATH', {
  'enumerable': true,
  'writable': false,
  'value': Path.join(Process.LOG_PATH, Utilities.format('%s.master.test.log', Package.name))
});

Object.defineProperty(Application, 'WORKER_LOG_PATH', {
  'enumerable': true,
  'writable': false,
  'value': Path.join(Process.LOG_PATH, Utilities.format('%s.worker.test.log', Package.name))
});

Object.defineProperty(Application, 'MASTER_PID_PATH', {
  'enumerable': true,
  'writable': false,
  'value': Path.join(Process.PID_PATH, Utilities.format('%s.master.test.pid', Package.name))
});

Object.defineProperty(Application, 'NUMBER_OF_WORKERS', {
  'enumerable': true,
  'writable': false,
  'value': 1
});

Application.executeCommand = function(command, callback) {
  Log.debug('> Application.executeCommand(%j, callback) { ... }', command);

  var _command = command;
  _command = _command.match(REGEXP_SPLIT);
  _command = _command.map(function(item) {
    return item.replace(REGEXP_QUOTE, '');
  });

  _command = _command.shift();

  if (_command != 'start' &&
      _command != 'stop') {
    Log.debug('> _Application.executeCommand.call(this, %j, callback)', command);
    _Application.executeCommand.call(this, command, callback);
  }
  else {

    Log.info('> ./server.js %s', command);
    ChildProcess.exec(Utilities.format('./server.js %s', command), function(error, stdout, stderr) {
      Asynchronous.series([
        function(callback) {
          FileSystem.writeFile(Path.join(Process.OUTPUT_PATH, Utilities.format('%s.out', _command)), stdout, callback);
        },
        function(callback) {
          FileSystem.writeFile(Path.join(Process.OUTPUT_PATH, Utilities.format('%s.err', _command)), stderr, callback);
        },
        function(callback) {
          if (error) {
            Log.error('< ./server.js %s', command);
            Log.error('    error.message=%j\n\n%s\n\n', error.message, error.stack);
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

  var _this = this;

  Asynchronous.series([
    function(callback) {
      _this.executeCommand(Utilities.format('start %j --fork \
                                                      --address %s \
                                                      --port %d \
                                                      --masterLogPath %j \
                                                      --workerLogPath %j \
                                                      --masterPIDPath %j \
                                                      --numberOfWorkers %d',  _this.DATABASE_PATH,
                                                                              _this.ADDRESS,
                                                                              _this.PORT,
                                                                              _this.MASTER_LOG_PATH,
                                                                              _this.WORKER_LOG_PATH,
                                                                              _this.MASTER_PID_PATH,
                                                                              _this.NUMBER_OF_WORKERS), callback);
    },
    function(callback) {
      FileSystem.waitUntilFileExists(WAIT_TIMEOUT, WAIT_DURATION, _this.MASTER_PID_PATH, callback);
    }
  ], callback);

};

Application.executeStop = function(callback) {

  var _this = this;

  Asynchronous.series([
    function(callback) {
      _this.executeCommand(Utilities.format('stop --masterLogPath %j \
                                                  --masterPIDPath %j',  _this.MASTER_LOG_PATH,
                                                                        _this.MASTER_PID_PATH), callback);
    },
    function(callback) {
      FileSystem.waitUntilFileNotExists(WAIT_TIMEOUT, WAIT_DURATION, _this.MASTER_PID_PATH, callback);
    }
  ], callback);

};

Application.request = function(method, path, requestData, callback) {

  if (Is.function(requestData)) {
    callback = requestData;
    requestData = null;
  }

  var _this = this;

  if (requestData)
    Log.info('> Application.request(%j, %j, requestData, callback)\n\n%s\n', method, path, Utilities.inspect(requestData));
  else
    Log.info('> Application.request(%j, %j, requestData, callback)', method, path);

  var options = {
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

  Log.info('> HTTP.request(options, function(response) { ... }\n\n%s\n', Utilities.inspect(options));
  var request = HTTP.request(options, function(response) {
    Log.info('= HTTP.request(options, function(response) { ... }');
    Log.info('    response.statusCode=%d\n\n%s\n', response.statusCode, Utilities.inspect(response.headers));

    var responseData = '';

    response.setEncoding('utf8');
    response.on('data', function(_responseData) {
      responseData += _responseData;
    });

    response.once('end', function() {
      Asynchronous.series([
        function(callback) {
          FileSystem.mkdirp(Path.join(Process.OUTPUT_PATH, path), callback)
        },
        function(callback) {
          FileSystem.writeFile(Path.join(Process.OUTPUT_PATH, path, Utilities.format('%s.json', method)), responseData, callback);
        }
      ], function(error) {
        if (error) {
          Log.info('< HTTP.ServerResponse.once("end", function() { ... })');
          Log.info('    error.message=%j\n\n%s\n', error.message, error.stack);
          callback(error)
        }
        else if (responseData) {

          var data = JSON.parse(responseData);

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
    Log.info('< HTTP.ServerRequest.on("error", function(error) { ... })');
    Log.info('    error.message=%j\n\n%s\n', error.message, error.stack);
    callback(error);
  });

  if (requestData)
    request.write(JSON.stringify(requestData));

  request.end();

};

Application.HEAD = function(path, callback) {
  this.request('HEAD', path, callback);
};

Application.waitUntilReady = function(callback) {

  Log.info('> Application.waitUntilReady(callback) { ... }');

  var _this = this;

  Process.waitUntil(WAIT_TIMEOUT, WAIT_DURATION, function(callback) {
    Log.info('> Application.HEAD("/", callback)');
    _this.HEAD('/', callback);
  }, function(error) {
    if (error) {
      Log.error('< Application.waitUntilReady(callback) { ... }');
      Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
      callback(new ProcessError('Duration exceeded waiting for the server to be ready.'));
    }
    else {
      Log.info('< Application.waitUntilReady(callback) { ... }');
      callback(null);
    }
  });

};

Application.waitUntilNotReady = function(callback) {

  Log.info('> Application.waitUntilNotReady(callback) { ... }');

  var _this = this;

  Process.waitUntil(WAIT_TIMEOUT, WAIT_DURATION, function(callback) {
    Log.info('> Application.HEAD("/", callback)');
    _this.HEAD('/', function(error) {
      if (error)
        callback(null);
      else
        callback(new ArgumentError('The request HEAD / suceeded.'));
    });
  }, function(error) {
    if (error) {
      Log.error('< Application.waitUntilNotReady(callback) { ... }');
      Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
      callback(new ProcessError('Duration exceeded waiting for the server to be not ready.'));
    }
    else {
      Log.info('< Application.waitUntilNotReady(callback) { ... }');
      callback(null);
    }
  });

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

  if (Is.function(requestData)) {
    callback = matchFn;
    matchFn = requestData;
    requestData = null;
  }

  this.request(method, path, requestData, function(error, statusCode, headers, data) {
    if (error)
      callback(error);
    else
      matchFn(statusCode, headers, data, function(error, isMatch, reason) {
        // Log.debug('Application.isRequest(%j, %j, requestData, matchFn, callback) { ... } isMatch=%j', method, path, isMatch);
        if (error)
          callback(error);
        else if (!isMatch)
          callback(new Error(reason || 'The server response does not match what is expected.'));
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

  if (Is.number(requestData)) {
    callback = expectedStatusCode;
    expectedStatusCode = requestData;
    requestData = null;
  }

  this.isRequest(method, path, requestData, function(actualStatusCode, headers, data, callback) {
    callback(null, actualStatusCode == expectedStatusCode, Utilities.format('The status code of the server response is %d %s but the response expected is %d %s.', actualStatusCode, HTTP.STATUS_CODES[actualStatusCode], expectedStatusCode, HTTP.STATUS_CODES[expectedStatusCode]));
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

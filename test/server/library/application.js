'use strict';

const Asynchronous = require('async');
const ChildProcess = require('child_process');
const HTTP = require('http');
const Query = require('json-query');
const Utilities = require('util');

const _Application = require('../../library/application');
const Database = require('./database');
const FileSystem = require('../../../library/file-system');
const Log = require('../../../library/log');
const Package = require('../../../package.json');
const Path = require('../../../library/path');
const Process = require('../../../library/process');

const ProcessError = require('../../../library/errors/process-error');

const PAUSE = 5000;
const REGEXP_SPLIT = /(?:[^\s"]+|"[^"]*")+/g;
const REGEXP_QUOTE = /^"|"$/g;
const TYPEOF_FUNCTION = 'function';

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

  let _command = command;
  _command = _command.match(REGEXP_SPLIT);
  _command = _command.map(function(item) {
    return item.replace(REGEXP_QUOTE, '');
  });

  _command = _command.shift();

  if (_command != 'start' &&
      _command != 'stop')
    Object.getPrototypeOf(this).executeCommand.call(this, command, callback);
  else {

    Log.info('> ./server.js %s', command);
    ChildProcess.exec(Utilities.format('./server.js %s', command), function(error, stdout, stderr) {
      Asynchronous.series([
        function(callback) {
          FileSystem.writeFile(Path.join(Process.cwd(), 'process', 'output', 'server', Utilities.format('%s.out', _command)), stdout, callback);
        },
        function(callback) {
          FileSystem.writeFile(Path.join(Process.cwd(), 'process', 'output', 'server', Utilities.format('%s.err', _command)), stderr, callback);
        },
        function(callback) {
          Log.info('< ./server.js %s', command);
          if (error) {
            Log.info('       error.code=%j', error.code);
            Log.info('    error.message=%j', error.message);
            Log.info('       error.name=%j', error.name);
            Log.info('           stderr=%j', stderr);
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
                                                                          this.NUMBER_OF_WORKERS), function(error) {
                                                                            if (error)
                                                                              callback(error);
                                                                            else
                                                                              setTimeout(function() {
                                                                                callback(null);
                                                                              }, PAUSE);
                                                                          });
};

Application.executeStop = function(callback) {
  this.executeCommand(Utilities.format('stop  --masterLogPath %j \
                                              --masterPIDPath %j',  this.MASTER_LOG_PATH,
                                                                    this.MASTER_PID_PATH), function(error) {
                                                                      if (error)
                                                                        callback(error);
                                                                      else
                                                                        setTimeout(function() {
                                                                          callback(null);
                                                                        }, PAUSE);
                                                                    });
};

Application.request = function(method, path, requestData, callback) {

  if (typeof requestData == TYPEOF_FUNCTION) {
    callback = requestData;
    requestData = null;
  }

  if (requestData)
    Log.info('> Application.request(%j, %j, requestData, callback)\n\n%s\n', method, path, Log.render(requestData));
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

  Log.info('> HTTP.request(options, function(response) { ... }\n\n%s\n', Log.render(options));
  let request = HTTP.request(options, function(response) {
    Log.info('= HTTP.request(options, function(response) { ... }');
    Log.info('    response.statusCode=%d\n\n%s\n', response.statusCode, Log.render(response.headers));

    let responseData = '';

    response.setEncoding('utf8');
    response.on('data', function(_responseData) {
      Log.info('= HTTP.ServerResponse.on("data", function(%j) { ... })', _responseData);
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
          Log.info('< HTTP.ServerResponse.on("end", function() { ... })');
          Log.info('    error.message=%s', error.message);
          callback(error)
        }
        else if (responseData) {

          let data = JSON.parse(responseData);
          data.query = function(name, query) {

            let _data = {};
            _data['data'] = {};
            _data['data'][name] = this;

            let result = Query(query, _data);
            Log.info('< Query(%j, _data)\n\n_data\n-----\n%s\n\nresult.value\n------------\n%s\n', query, Log.render(_data), Log.render(result.value));

            return result.value;

          };

          Log.info('< HTTP.ServerResponse.on("end", function() { ... })\n\n%s\n', Log.render(data));
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
    Log.info('    error.message=%s', error.message);
    callback(error);
  });

  if (requestData)
    request.write(JSON.stringify(requestData));

  request.end();

};

Application.existsHEAD = function(path, callback) {
  this.request('HEAD', path, function(error, statusCode, headers, data) {
    if (error) {
      Log.info('< Application.existsHEAD(%j, callback) { ... }', path);
      Log.info('    error.message=%s', error.message);
      callback(error);
    }
    else
      callback(null);
  });
};

Application.notExistsHEAD = function(path, callback) {
  this.request('HEAD', path, function(error, statusCode, headers, data) {
    if (error) {
      Log.info('< Application.notExistsHEAD(%j, callback) { ... }', path);
      Log.info('    error.message=%s', error.message);
      callback(null);
    }
    else
      callback(new URIError(Utilities.format('HEAD\'ing %j succeeded.', path)));
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

Application.isRequest = function(method, path, requestData, statusCode, callback) {

  if (typeof statusCode == TYPEOF_FUNCTION) {
    callback = statusCode;
    statusCode = requestData;
    requestData = null;
  }

  this.request(method, path, requestData, function(error, actualStatusCode, headers, data) {
    if (error)
      callback(error);
    else if (actualStatusCode != statusCode)
      callback(new Error(Utilities.format('The status code of the server response (%d %s) is not the expected status code (%d %s).', actualStatusCode, HTTP.STATUS_CODES[actualStatusCode], statusCode, HTTP.STATUS_CODES[statusCode])));
    else
      callback(null);
  });

};

Application.isGET = function(path, statusCode, callback) {
  this.isRequest('GET', path, statusCode, callback);
};

Application.isPOST = function(path, requestData, statusCode, callback) {
  this.isRequest('POST', path, requestData, statusCode, callback);
};

Application.isDELETE = function(path, statusCode, callback) {
  this.isRequest('DELETE', path, statusCode, callback);
};

module.exports = Application;

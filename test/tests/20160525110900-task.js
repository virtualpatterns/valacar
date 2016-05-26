'use strict';

const Asynchronous = require('async');
const FileSystem = require('fs');
const Stream = require('stream');
const Utilities = require('util');

const Log = require('library/log');
const Path = require('library/path');
const Process = require('library/process');
const Task = require('task/library/task');

const ArgumentError = require('library/errors/argument-error');
const ProcessError = require('library/errors/process-error');

const OPTIONS_STDIO_STDOUT_PATH = Path.join(Process.cwd(), 'process', 'output', 'task.out');
const OPTIONS_STDIO_STDERR_PATH = Path.join(Process.cwd(), 'process', 'output', 'task.err');

const REGEXP_FILE = /^.*20160525110900-task\.js.*$/m;

const RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');

describe('Task (without options)', function() {

  it('should execute a command without substitutions and without options', function (callback) {
    Task.createTask()
      .add('ls -al ./test/tests')
      .execute(callback);
  });

  it('should execute a command with substitutions and without options', function (callback) {
    Task.createTask()
      .add('ls -al %j', __dirname)
      .execute(callback);
  });

  it('should execute a function without arguments', function (callback) {
    Task.createTask()
      .add(function() {
        Log.info('= should execute a function without arguments');
      })
      .execute(callback);
  });

  it('should execute a function with a callback', function (callback) {
    Task.createTask()
      .add(function(callback) {
        Log.info('= should execute a function with a callback');
        callback(null);
      })
      .execute(callback);
  });

  it('should generate an ArgumentError when adding a function with more than one argument', function (callback) {

    let error = null;

    try {
      Task.createTask()
        .add(function(a, b) {
          Log.info('= should generate an ArgumentError when adding a function with more than one argument');
          callback(null);
        })
        .execute(callback);
    }
    catch (_error) {
      error = _error;
    }

    if (!error)
      callback(new Error(Utilities.format('The function is invalid but did not generate an ArgumentError.', INVALID_ADDRESS)));
    else if (!(error instanceof ArgumentError))
      callback(new Error(Utilities.format('The function is invalid but the generated error (%s) is the wrong type.', _error)));
    else
      callback(null);

  });

});

describe('Task (with options)', function() {

  let options = null;

  beforeEach(function(callback) {

    options = {
      'stdio': [
        Task.INHERIT,
        FileSystem.createWriteStream(OPTIONS_STDIO_STDOUT_PATH),
        FileSystem.createWriteStream(OPTIONS_STDIO_STDERR_PATH)
      ]
    };

    Asynchronous.each(options.stdio, function(stream, callback) {
      if (stream instanceof Stream.Writable) {
        stream.once('open', function() {
          Log.info('< Stream.Writable.once("open", function() { ... }) Stream.Writable.path=%j', Path.trim(stream.path));
          callback(null);
        });
      }
      else
        callback(null);
    }, callback);

  });

  it('should output the current file on a command without substitutions and with options', function (callback) {
    Asynchronous.waterfall([
      function(callback) {
        Task.createTask()
          .add('ls -al ./test/tests', options)
          .execute(callback);
      },
      function(callback) {
        FileSystem.readFile(OPTIONS_STDIO_STDOUT_PATH, callback);
      },
      function(data, callback) {
        if (!REGEXP_FILE.test(data))
          callback(new Error(Utilities.format('The file %j is not part of the output.', __filename)));
        else
          callback(null);
      }
    ], callback);
  });

  it('should output the current file on a command with substitutions and with options', function (callback) {
    Asynchronous.waterfall([
      function(callback) {
        Task.createTask()
          .add('ls -al %j', __dirname, options)
          .execute(callback);
      },
      function(callback) {
        FileSystem.readFile(OPTIONS_STDIO_STDOUT_PATH, callback);
      },
      function(data, callback) {
        if (!REGEXP_FILE.test(data))
          callback(new Error(Utilities.format('The file %j is not part of the output.', __filename)));
        else
          callback(null);
      }
    ], callback);
  });

  it('should generate a ProcessError on a command that returns a non-zero result', function (callback) {
    Task.createTask()
      .add('%j', Path.join(RESOURCES_PATH, Utilities.format('%s.sh', Path.basename(__filename, '.js'))), options)
      .execute(function(error) {
        if (!error)
          callback(new Error('The command returned a non-zero result but did not generate a ProcessError.'));
        else if (!(error instanceof ProcessError))
          callback(new Error(Utilities.format('The command returned a non-zero result but the generated error (%s) is the wrong type.', error.name)));
        else if (!(error.code != 0))
          callback(new Error(Utilities.format('The command returned a non-zero result but the value of ProcessError.code (%d) is not non-zero.', error.code)));
        else
          callback(null);
      });
  });

  it('should execute a function without arguments and with (ignored) options', function (callback) {
    Task.createTask()
      .add(function() {
        Log.info('= should execute a function without arguments and with (ignored) options');
      }, options)
      .execute(callback);
  });

  it('should execute a function with a callback and with (ignored) options', function (callback) {
    Task.createTask()
      .add(function(callback) {
        Log.info('= should execute a function with a callback and with (ignored) options');
        callback(null);
      }, options)
      .execute(callback);
  });

  afterEach(function(callback) {
    Asynchronous.each(options.stdio, function(stream, callback) {
      if (stream instanceof Stream.Writable) {
        stream.end(function() {
          Log.info('< Stream.Writable.end(function() { ... }) Stream.Writable.path=%j', Path.trim(stream.path));
          callback(null);
        });
      }
      else
        callback(null);
    }, callback);
  });

});

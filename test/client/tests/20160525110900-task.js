

var Asynchronous = require('async');
var Stream = require('stream');
var Utilities = require('util');

var FileSystem = require('../../../client/library/file-system');
var Log = require('../../../client/library/log');
var Path = require('../../../client/library/path');
var Process = require('../../../client/library/process');
var Task = require('../../../task/library/task');

var ArgumentError = require('../../../client/library/errors/argument-error');
var ProcessError = require('../../../client/library/errors/process-error');

var OPTIONS_STDIO_STDOUT_PATH = Path.join(Process.OUTPUT_PATH, 'task.out');
var OPTIONS_STDIO_STDERR_PATH = Path.join(Process.OUTPUT_PATH, 'task.err');

var REGEXP_FILE = /^.*20160525110900-task\.js.*$/m;

var RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');

var NON_ZERO_RESULT_PATH = Utilities.format('%j', Path.join(RESOURCES_PATH, 'non-zero-result.sh'));
var ZERO_RESULT_PATH = Utilities.format('%j', Path.join(RESOURCES_PATH, 'zero-result.sh'));

describe('Task (without options)', function() {

  it('should execute a command without substitutions and without options', function(callback) {
    Task.createTask('Task', Task.OPTIONS_STDIO_IGNORE)
      .add(ZERO_RESULT_PATH)
      .execute(callback);
  });

  it('should execute a command with substitutions and without options', function(callback) {
    Task.createTask('Task', Task.OPTIONS_STDIO_IGNORE)
    .add('%s', ZERO_RESULT_PATH)
      .execute(callback);
  });

  it('should execute a command with two substitutions and without options', function(callback) {
    Task.createTask('Task', Task.OPTIONS_STDIO_IGNORE)
    .add('%s %d', ZERO_RESULT_PATH, 123)
      .execute(callback);
  });

  it('should execute a function without arguments', function(callback) {
    Task.createTask('Task', Task.OPTIONS_STDIO_IGNORE)
      .add(function() {
        Log.info('= should execute a function without arguments');
      })
      .execute(callback);
  });

  it('should execute a function with a callback', function(callback) {
    Task.createTask('Task', Task.OPTIONS_STDIO_IGNORE)
      .add(function(callback) {
        Log.info('= should execute a function with a callback');
        callback(null);
      })
      .execute(callback);
  });

  it('should generate an ArgumentError when adding a function with more than one argument', function(callback) {

    var error = null;

    try {
      Task.createTask('Task', Task.OPTIONS_STDIO_IGNORE)
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

  var options = null;

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

  it('should output the current file on a command without substitutions and with options', function(callback) {
    Asynchronous.waterfall([
      function(callback) {
        Task.createTask('Task', Task.OPTIONS_STDIO_IGNORE)
          .add('ls -al ./test/client/tests', options)
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

  it('should output the current file on a command with substitutions and with options', function(callback) {
    Asynchronous.waterfall([
      function(callback) {
        Task.createTask('Task', Task.OPTIONS_STDIO_IGNORE)
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

  it('should generate a ProcessError on a command that returns a non-zero result', function(callback) {
    Task.createTask('Task', Task.OPTIONS_STDIO_IGNORE)
      .add(NON_ZERO_RESULT_PATH, options)
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

  it('should execute a function without arguments and with (ignored) options', function(callback) {
    Task.createTask('Task', Task.OPTIONS_STDIO_IGNORE)
      .add(function() {
        Log.info('= should execute a function without arguments and with (ignored) options');
      }, options)
      .execute(callback);
  });

  it('should execute a function with a callback and with (ignored) options', function(callback) {
    Task.createTask('Task', Task.OPTIONS_STDIO_IGNORE)
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

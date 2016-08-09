var Is = require( '@pwn/is' );
var Utilities = require('util');

var Path = require('./path');

var ArgumentError = require('./errors/argument-error');
var ProcessError = require('./errors/process-error');

var EXIT_TIMEOUT = 5000;

var Process = Object.create(process);

Object.defineProperty(Process, 'DATA_PATH', {
  get: function() {
    return Process.createPath(Path.join(Process.cwd(), 'process', 'data'));
  }
});

Object.defineProperty(Process, 'LOG_PATH', {
  get: function() {
    return Process.createPath(Path.join(Process.cwd(), 'process', 'log'));
  }
});

Object.defineProperty(Process, 'OUTPUT_PATH', {
  get: function() {
    return Process.createPath(Path.join(Process.cwd(), 'process', 'output'));
  }
});

Object.defineProperty(Process, 'PID_PATH', {
  get: function() {
    return Process.createPath(Path.join(Process.cwd(), 'process', 'pid'));
  }
});

Object.defineProperty(Process, 'exitCode', {
  get: function() {
    return process.exitCode;
  },
  set: function(value) {
    process.exitCode = value;
  },
  enumerable: true
});

Process.createPath = function(path) {

  var FileSystem = require('./file-system');
  FileSystem.mkdirp.sync(path);

  return path;

};

Process.waitUntil = function(timeout, maximumDuration, testFn, callback) {

  var Log = require('./log');

  Log.info('> Process.waitUntil(%d, %d, testFn, callback) { ... }', timeout, maximumDuration);

  var waitLoop = function(start) {

    var duration = (new Date()) - start;

    testFn(function(error) {
      if (error &&
          duration < maximumDuration)
        setTimeout(function() {
          waitLoop(start, testFn, callback);
        }, timeout);
      else if (duration >= maximumDuration) {
        Log.error('< Process.waitUntil(%d, %d, testFn, callback) { ... } duration=%d', timeout, maximumDuration, duration);
        callback(new ProcessError('Duration exceeded.'));
      }
      else {
        Log.info('< Process.waitUntil(%d, %d, testFn, callback) { ... }', timeout, maximumDuration);
        callback(null);
      }
    });

  }

  waitLoop(new Date());

};

// Process.notExistsPID = function(path) {
//
//   var FileSystem = require('./file-system');
//   var Log = require('./log');
//
//   Log.info('> Process.notExistsPID(%j)', Path.trim(path));
//
//   var error = null;
//
//   try {
//     Log.info('> FileSystem.accessSync(%j, FileSystem.F_OK)', Path.trim(path));
//     FileSystem.accessSync(path, FileSystem.F_OK);
//   }
//   catch (_error) {
//     error = _error;
//     // Log.info('< FileSystem.accessSync(%j, FileSystem.F_OK)', Path.trim(path));
//     // Log.info('    error.message=%j\n\n%s\n\n', error.message, error.stack);
//   }
//
//   if (!error)
//     throw new ArgumentError(Utilities.format('The path %j already exists.', Path.trim(path)));
//
// };

Process.existsPID = function(path) {

  var FileSystem = require('./file-system');
  var Log = require('./log');

  // Log.info('> Process.existsPID(%j)', Path.trim(path));

  try {
    // Log.info('> FileSystem.accessSync(%j, FileSystem.F_OK)', Path.trim(path));
    FileSystem.accessSync(path, FileSystem.F_OK);
  }
  catch (error) {
    // Log.info('< Process.existsPID(%j)', Path.trim(path));
    // Log.info('    error.message=%j\n\n%s\n\n', error.message, error.stack);
    return false;
    // throw new ArgumentError(Utilities.format('The path %j does not exist.', Path.trim(path)));
  }

  // Log.info('> FileSystem.readFileSync(%j, ...)', Path.trim(path));
  var pid = FileSystem.readFileSync(path, {
    encoding: 'utf-8'
  });

  try {
    this.kill(pid, 0);
  } catch (error) {

    // Log.info('= Process.existsPID(%j)', Path.trim(path));
    // Log.info('    error.message=%j\n\n%s\n\n', error.message, error.stack);

    Log.info('> FileSystem.unlinkSync(%j)', Path.trim(path));
    FileSystem.unlinkSync(path);

    return false;

  }

  return true;

};

Process.createPID = function(path, _process) {

  var FileSystem = require('./file-system');
  var Log = require('./log');

  _process = _process || this;

  // Log.info('> Process.createPID(%j, _process) _process.pid=%d', Path.trim(path), _process.pid);

  if (this.existsPID(path))
    throw new ArgumentError(Utilities.format('The path %j exists.', Path.trim(path)));
  else {

    // Log.info('> FileSystem.writeFileSync(%j, %j, ...)', Path.trim(path), _process.pid);
    FileSystem.writeFileSync(path, _process.pid, {
      encoding: 'utf-8'
    });

    _process.once('exit', function() {
      console.log('> Process.once("exit", function() { ... }');
      try {
        FileSystem.accessSync(path, FileSystem.F_OK);
        FileSystem.unlinkSync(path);
        console.log('< Process.once("exit", function() { ... }');
      }
      catch (error) {
        console.log('< Process.once("exit", function() { ... }');
        console.log('    error.message=%j\n\n%s\n\n', error.message, error.stack);
      }
    });

  }

};

Process.killPID = function(path) {

  var FileSystem = require('./file-system');
  var Log = require('./log');

  // Log.info('> Process.killPID(%j)', Path.trim(path));

  if (this.existsPID(path)) {

    // Log.info('> FileSystem.readFileSync(%j, ...)', Path.trim(path));
    var pid = FileSystem.readFileSync(path, {
      encoding: 'utf-8'
    });

    // Log.info('> Process.kill(%d, "SIGTERM")', pid);
    this.kill(pid, 'SIGTERM');

  }
  else
    throw new ArgumentError(Utilities.format('The path %j does not exist.', Path.trim(path)));

};

Process.exit = function(code) {

  var Log = require('./log');

  Log.info('> Process.exit(%j)', code);

  var self = this;

  setTimeout(function() {
    console.log('< Process.exit(%j)', code);
    process.exit(code);
    // process.exit.call(code);
  }, EXIT_TIMEOUT);

};

module.exports = Process;

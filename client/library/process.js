'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const FileSystem = require('./file-system');
const Path = require('./path');

const ArgumentError = require('./errors/argument-error');

const Process = Object.create(process);

Object.defineProperty(Process, 'exitCode', {
  get: function() {
    return Object.getPrototypeOf(this).exitCode;
  },
  set: function(value) {
    Object.getPrototypeOf(this).exitCode = value;
  },
  enumerable: true
});

Process.createPID = function(path) {

  const Log = require('./log');

  Log.info('> Process.createPID(%j)', Path.trim(path));

  let error = null;

  try {
    // Log.info('> FileSystem.accessSync(%j, FileSystem.F_OK)', Path.trim(path));
    FileSystem.accessSync(path, FileSystem.F_OK);
  }
  catch (_error) {
    error = _error;
    // Log.info('< FileSystem.accessSync(%j, FileSystem.F_OK)', Path.trim(path));
    // Log.info('    error.message=%j\n\n%s\n\n', error.message, error.stack);
  }

  if (!error)
    throw new ArgumentError(Utilities.format('The PID file %j cannot be created because it already exists.', Path.trim(path)));

  Log.info('> FileSystem.writeFileSync(%j, %j, ...)', Path.trim(path), this.pid);
  FileSystem.writeFileSync(path, this.pid, {
    encoding: 'utf-8'
  });

  this.once('exit', function() {
    try {
      FileSystem.accessSync(path, FileSystem.F_OK);
      FileSystem.unlinkSync(path);
    }
    catch (error) {
      console.log('< Process.once("exit", function() { ... }');
      console.log('    error.message=%j\n\n%s\n\n', error.message, error.stack);
    }
  });

};

Process.killPID = function(path) {

  const Log = require('./log');

  Log.info('> Process.killPID(%j)', Path.trim(path));

  try {
    // Log.info('> FileSystem.accessSync(%j, FileSystem.F_OK)', Path.trim(path));
    FileSystem.accessSync(path, FileSystem.F_OK);
  }
  catch (error) {
    // Log.info('< FileSystem.accessSync(%j, FileSystem.F_OK)', Path.trim(path));
    // Log.info('    error.message=%j\n\n%s\n\n', error.message, error.stack);
    throw new ArgumentError(Utilities.format('The PID cannot be killed because the PID file %j does not exist.', Path.trim(path)));
  }

  // Log.info('> FileSystem.readFileSync(%j, ...)', Path.trim(path));
  let pid = FileSystem.readFileSync(path, {
    encoding: 'utf-8'
  });

  Log.info('> Process.kill(%d, "SIGTERM")', pid);
  this.kill(pid, 'SIGTERM');

  Log.info('> FileSystem.unlinkSync(%j)', Path.trim(path));
  FileSystem.unlinkSync(path);

};

module.exports = Process;

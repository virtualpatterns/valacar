'use strict';

const Asynchronous = require('async');
const FileSystem = require('fs');
const Utilities = require('util');

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
    Log.info('> FileSystem.accessSync(%j, FileSystem.F_OK)', Path.trim(path));
    FileSystem.accessSync(path, FileSystem.F_OK);
  }
  catch (_error) {
    error = _error;
    Log.info('< FileSystem.accessSync(%j, FileSystem.F_OK)', Path.trim(path));
    Log.info('    error.message=%j', error.message);
    Log.info('       error.name=%j', error.name);
  }

  if (!error)
    throw new ArgumentError(Utilities.format('The PID file %j cannot be created because it already exists.', Path.trim(path)));

  Log.info('> FileSystem.writeFileSync(%j, %j, ...)', Path.trim(path), this.pid);
  FileSystem.writeFileSync(path, this.pid, {
    encoding: 'utf-8'
  });

  this.once('exit', function() {
    FileSystem.accessSync(path, FileSystem.F_OK);
    FileSystem.unlinkSync(path);
  });

};

Process.killPID = function(path) {

  const Log = require('./log');

  Log.info('> Process.killPID(%j)', Path.trim(path));

  try {
    Log.info('> FileSystem.accessSync(%j, FileSystem.F_OK)', Path.trim(path));
    FileSystem.accessSync(path, FileSystem.F_OK);
  }
  catch (error) {
    Log.info('< FileSystem.accessSync(%j, FileSystem.F_OK)', Path.trim(path));
    Log.info('    error.message=%j', error.message);
    Log.info('       error.name=%j', error.name);
    throw new ArgumentError(Utilities.format('The PID cannot be killed because the PID file %j does not exist.', Path.trim(path)));
  }

  Log.info('> FileSystem.readFileSync(%j, ...)', Path.trim(path));
  let pid = FileSystem.readFileSync(path, {
    encoding: 'utf-8'
  });
  Log.info('< FileSystem.readFileSync(%j, ...) pid=%d', Path.trim(path), pid);

  Log.info('> Process.kill(%d, "SIGTERM")', pid);
  this.kill(pid, 'SIGTERM');
  Log.info('< Process.kill(%d, "SIGTERM")', pid);

};

Process.trimPath = function(path) {
  return path.replace(process.cwd(), '.');
};

module.exports = Process;

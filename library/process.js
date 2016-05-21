'use strict';

const Asynchronous = require('async');
const FileSystem = require('fs');
const Utilities = require('util');

const Log = require('library/log');

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

Process.createPID = function(path, callback) {

  let _this = this;

  Asynchronous.series([
    function(callback) {
      Log.info('> FileSystem.access(%j, FileSystem.F_OK, function(error) { ... })', path);
      FileSystem.access(path, FileSystem.F_OK, function(error) {
        Log.info('< FileSystem.access(%j, FileSystem.F_OK, function(%j) { ... }) %s', path, error ? error.message : error);
        if (error)
          callback(null);
        else
          callback(new Error(Utilities.format('The PID file %j cannot be created because it already exists.', path)));
      });
    },
    function(callback) {
      Log.info('> FileSystem.writeFile(%j, %j, ...)', path, _this.pid);
      FileSystem.writeFile(path, _this.pid, {
        encoding: 'utf-8'
      }, callback);
    },
    function(callback) {

      process.once('exit', function() {

        try {
          FileSystem.accessSync(path, FileSystem.F_OK);
          FileSystem.unlinkSync(path);
        }
        catch(error) {
          console.log(Utilities.format('An error occured exiting the process (%s).', error.message));
        }

      });

      callback();

    }
  ], callback);

};

Process.trimPath = function(path) {
  return path.replace(process.cwd(), '.');
}

module.exports = Process;

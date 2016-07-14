

var Directory = require('mkdirp');
var _FileSystem = require('fs');
var Utilities = require('util');

var Path = require('./path');

var ArgumentError = require('./errors/argument-error');
var ProcessError = require('./errors/process-error');

var FileSystem = Object.create(_FileSystem);

FileSystem.mkdirp = Directory;

FileSystem.waitUntilFileExists = function(timeout, maximumDuration, path, callback) {

  var Log = require('./log');
  var Process = require('./process');

  Log.info('> FileSystem.waitUntilFileExists(%d, %d, %j, callback) { ... }', timeout, maximumDuration, Path.trim(path));

  Process.waitUntil(timeout, maximumDuration, function(callback) {
    Log.info('> FileSystem.access(%j, FileSystem.F_OK, callback)', Path.trim(path));
    FileSystem.access(path, FileSystem.F_OK, callback);
  }, function(error) {
    if (error) {
      Log.error('< FileSystem.waitUntilFileExists(%d, %d, %j, callback) { ... }', timeout, maximumDuration, Path.trim(path));
      Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
      callback(new ProcessError(Utilities.format('Duration exceeded waiting for the file %j to be created.', Path.trim(path))));
    }
    else {
      Log.info('< FileSystem.waitUntilFileExists(%d, %d, %j, callback) { ... }', timeout, maximumDuration, Path.trim(path));
      callback(null);
    }
  });

};

FileSystem.waitUntilFileNotExists = function(timeout, maximumDuration, path, callback) {

  var Log = require('./log');
  var Process = require('./process');

  Log.info('> FileSystem.waitUntilFileNotExists(%d, %d, %j, callback) { ... }', timeout, maximumDuration, Path.trim(path));

  Process.waitUntil(timeout, maximumDuration, function(callback) {
    Log.info('> FileSystem.access(%j, FileSystem.F_OK, callback)', Path.trim(path));
    FileSystem.access(path, FileSystem.F_OK, function(error) {
      if (error)
        callback(null);
      else
        callback(new ArgumentError(Utilities.format('The file %j exists.', Path.trim(path))));
    });
  }, function(error) {
    if (error) {
      Log.error('< FileSystem.waitUntilFileNotExists(%d, %d, %j, callback) { ... }', timeout, maximumDuration, Path.trim(path));
      Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
      callback(new ProcessError(Utilities.format('Duration exceeded waiting for the file %j to be deleted.', Path.trim(path))));
    }
    else {
      Log.info('< FileSystem.waitUntilFileNotExists(%d, %d, %j, callback) { ... }', timeout, maximumDuration, Path.trim(path));
      callback(null);
    }
  });

};

module.exports = FileSystem;

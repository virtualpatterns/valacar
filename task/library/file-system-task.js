

var Utilities = require('util');

var FileSystem = require('../../client/library/file-system');
var Log = require('../../client/library/log');
var Path = require('../../client/library/path');

var Task = require('./task');

var taskPrototype = Object.create(Task.getTaskPrototype());

taskPrototype.removeFile = function(path, options) {
  try {
    FileSystem.accessSync(path, FileSystem.F_OK);
    this.add(Utilities.format('rm -rv %j', path), options || Task.OPTIONS_STDIO_IGNORE);
  }
  catch (error) {
    Log.error('< FileSystemTask.removeFile(%j, options) { ... }', path);
    Log.error('    error.message=%j\n\n%s\n\n', error.message, error.stack);
  }
  return this;
};

taskPrototype.removeFiles = function(path, options) {

  var _this = this;
  var files = FileSystem.readdirSync(path);

  files.forEach(function(file) {
    _this.removeFile(Path.join(path, file), options || Task.OPTIONS_STDIO_IGNORE);
  });

  return _this;

};

var FileSystemTask = Object.create(Task);

FileSystemTask.createTask = function(name, options, prototype) {
  return Task.createTask.call(this, name, options, prototype || taskPrototype);
};

FileSystemTask.isTask = function(task) {
  return taskPrototype.isPrototypeOf(task);
};

FileSystemTask.getTaskPrototype = function() {
  return taskPrototype;
};

module.exports = FileSystemTask;

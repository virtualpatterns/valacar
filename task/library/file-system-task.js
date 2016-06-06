'use strict';

const Utilities = require('util');

const FileSystem = require('../../library/file-system');
const Path = require('../../library/path');

const Task = require('./task');

const taskPrototype = Object.create(Task.getTaskPrototype());

taskPrototype.removeFiles = function(path, options) {

  let _this = this;
  let files = FileSystem.readdirSync(path);

  files.forEach(function(file) {
    _this.add(Utilities.format('rm -r %j', Path.join(path, file)), options || Task.OPTIONS_STDIO_IGNORE);
  });

  return _this;

};

const FileSystemTask = Object.create(Task);

FileSystemTask.createTask = function(name, prototype) {
  return Object.getPrototypeOf(this).createTask.call(this, name, prototype || taskPrototype);
};

FileSystemTask.isTask = function(task) {
  return taskPrototype.isPrototypeOf(task);
};

FileSystemTask.getTaskPrototype = function() {
  return taskPrototype;
};

module.exports = FileSystemTask;

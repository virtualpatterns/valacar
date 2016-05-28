'use strict';


const Utilities = require('util');

const Path = require('library/path');
const Task = require('task/library/task');

const RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');

const taskPrototype = Object.create(Task.getTaskPrototype());

taskPrototype.addIsDirty = function(options) {
  return this.add(Utilities.format('%j', Path.join(RESOURCES_PATH, 'git-is-dirty.sh')), options || Task.OPTIONS_STDIO_IGNORE);
};

taskPrototype.addExistsStash = function(options) {
  return this.add(Utilities.format('%j', Path.join(RESOURCES_PATH, 'git-exists-stash.sh')), options || Task.OPTIONS_STDIO_IGNORE);
};

const GitTask = Object.create(Task);

GitTask.createTask = function(name, prototype) {
  return Object.getPrototypeOf(this).createTask.call(this, name, prototype || taskPrototype);
};

GitTask.isTask = function(task) {
  return taskPrototype.isPrototypeOf(task);
};

GitTask.getTaskPrototype = function() {
  return taskPrototype;
};

module.exports = GitTask;

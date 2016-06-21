


var Utilities = require('util');

var Path = require('../../client/library/path');
var Task = require('./task');

var RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');

var taskPrototype = Object.create(Task.getTaskPrototype());

taskPrototype.addIsDirty = function(options) {
  return this.add(Utilities.format('%j', Path.join(RESOURCES_PATH, 'git-is-dirty.sh')), options || Task.OPTIONS_STDIO_IGNORE);
};

taskPrototype.addExistsStash = function(options) {
  return this.add(Utilities.format('%j', Path.join(RESOURCES_PATH, 'git-exists-stash.sh')), options || Task.OPTIONS_STDIO_IGNORE);
};

var GitTask = Object.create(Task);

GitTask.createTask = function(name, options, prototype) {
  return Task.createTask.call(this, name, options, prototype || taskPrototype);
};

GitTask.isTask = function(task) {
  return taskPrototype.isPrototypeOf(task);
};

GitTask.getTaskPrototype = function() {
  return taskPrototype;
};

module.exports = GitTask;

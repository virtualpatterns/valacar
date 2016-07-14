var Utilities = require('util');

var Path = require('../../client/library/path');
var Task = require('./task');

var RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');

var taskPrototype = Task.getTaskPrototype();
var gitTaskPrototype = Object.create(taskPrototype);

gitTaskPrototype.addIsDirty = function(options) {
  return this
    .addLine()
    .add('echo "The next step will fail if there are any uncommitted or unstashed changes."')
    .add(Utilities.format('%j', Path.join(RESOURCES_PATH, 'git-is-dirty.sh')), options || Task.OPTIONS_STDIO_IGNORE)
    .add('echo "All changes are committed or stashed."');
};

gitTaskPrototype.addExistsStash = function(options) {
  return this
    .addLine()
    .add('echo "The next step will fail if there are any stashed changes."')
    .add(Utilities.format('%j', Path.join(RESOURCES_PATH, 'git-exists-stash.sh')), options || Task.OPTIONS_STDIO_IGNORE)
    .add('echo "The stash is empty."');
};

var GitTask = Object.create(Task);

GitTask.createTask = function(name, options, prototype) {
  return Task.createTask.call(this, name, options, prototype || gitTaskPrototype);
};

GitTask.isTask = function(task) {
  return gitTaskPrototype.isPrototypeOf(task);
};

GitTask.getTaskPrototype = function() {
  return gitTaskPrototype;
};

module.exports = GitTask;

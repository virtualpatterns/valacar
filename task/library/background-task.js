var Task = require('./task');

var taskPrototype = Task.getTaskPrototype();
var backgroundTaskPrototype = Object.create(taskPrototype);

var BackgroundTask = Object.create(Task);

BackgroundTask.createTask = function(name, options, prototype) {
  return Task.createTask.call(this, name, options, prototype || backgroundTaskPrototype);
};

BackgroundTask.isTask = function(task) {
  return backgroundTaskPrototype.isPrototypeOf(task);
};

BackgroundTask.getTaskPrototype = function() {
  return backgroundTaskPrototype;
};

BackgroundTask.createOptions = function(stdin, stdout, stderr, callback) {
  Task.createOptions.call(this, stdin, stdout, stderr, function(error, options) {
    if (error)
      callback(error);
    else {
      options.detached = true;
      callback(error, options);
    }
  });
};

module.exports = BackgroundTask;

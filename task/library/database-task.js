var Utilities = require('util');

var Application = require('../../client/library/application');
var Database = require('../../client/library/database');
var Log = require('../../client/library/log');
var Path = require('../../client/library/path');
var Package = require('../../package.json');
var Path = require('../../client/library/path');
var Process = require('../../client/library/process');
var Task = require('./task');

var DATABASE_PATH = Path.join(Process.DATA_PATH, Utilities.format('%s.db', Package.name));

var taskPrototype = Task.getTaskPrototype();
var databaseTaskPrototype = Object.create(taskPrototype);

databaseTaskPrototype.addRunFile = function(path, parameters) {

  var self = this;

  self.add(function(callback) {
    Log.info('> [%s] Database.runFile(connection, %j, parameters, function(error) { ... })\n\n%s\n\n', self.name, Path.trim(path), Utilities.inspect(parameters || []));
    Database.runFile(self.connection, path, parameters || [], function(error) {
      if (!error)
        Log.info('< [%s] Database.runFile(connection, %j, parameters, function(error) { ... }) this.changes=%d\n\n%s\n', self.name, Path.trim(path), this.changes, Utilities.inspect(parameters || []));
      callback(error);
    });
  });

  return this;

};

databaseTaskPrototype.execute = function(resolve, reject) {

  var self = this;

  Application.openDatabase(self.databasePath, {
    'enableTrace': true,
    'enableProfile': false
  }, function(connection, callback) {
    self.connection = connection;
    taskPrototype.execute.call(self, callback);
  }, function(error) {
    if (error) {
      Log.error('< [%s] DatabaseTask.execute(resolve, reject) { ... }', self.name);
      Log.error('         error.message=%j\n\n%s\n\n', error.message, error.stack);
      (reject || resolve)(error);
    }
    else
      resolve(null);
  });

};

var DatabaseTask = Object.create(Task);

DatabaseTask.createTask = function(name, databasePath, options, prototype) {

  var task = Task.createTask.call(this, name, options, prototype || databaseTaskPrototype);

  Object.defineProperty(task, 'databasePath', {
    'enumerable': true,
    'writable': false,
    'value': databasePath || DATABASE_PATH
  });

  return task;

};

DatabaseTask.isTask = function(task) {
  return databaseTaskPrototype.isPrototypeOf(task);
};

DatabaseTask.getTaskPrototype = function() {
  return databaseTaskPrototype;
};

module.exports = DatabaseTask;

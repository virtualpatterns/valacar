

var Asynchronous = require('async');
var ChildProcess = require('child_process');
var Is = require('@pwn/is');
var Utilities = require('util');

var FileSystem = require('../../client/library/file-system');
var Log = require('../../client/library/log');
var Path = require('../../client/library/path');
var Process = require('../../client/library/process');

var ArgumentError = require('../../client/library/errors/argument-error');
var ProcessError = require('../../client/library/errors/process-error');

var REGEXP_PLACEHOLDER = /%d|%j|%s/g;
var REGEXP_SPLIT = /(?:[^\s"]+|"[^"]*")+/g;
var REGEXP_QUOTE = /^"|"$/g;

var taskPrototype = Object.create({});

var tasksSymbol = Symbol();
taskPrototype[tasksSymbol] = [];

taskPrototype.add = function(task, options) {

  var _this = this;
  var argumentsObject = Task.getAddArguments(task, options, arguments);

  Log.info('> [%s] Task.add(task, options) { ... }\n\n%s\n\n', _this.name, Utilities.inspect(argumentsObject));

  if (argumentsObject.isCommand) {

    this[tasksSymbol].push(function(callback) {

      var _options = argumentsObject.options || _this.options || Task.OPTIONS_STDIO_INHERIT;

      Log.debug('> [%s] %s', _this.name, argumentsObject.command.concat(' ', argumentsObject.arguments.map(function(argument) {
        return '"'.concat(argument, '"');
      }).join(' ')));

      Log.info('> [%s] ChildProcess.spawn(%j, %j, options)', _this.name, argumentsObject.command, argumentsObject.arguments);
      var _process = ChildProcess.spawn(argumentsObject.command, argumentsObject.arguments, _options);

      if (_options.detached) {

        _process.unref();

        Log.info('< [%s] ChildProcess.spawn(%j, %j, options)', _this.name, argumentsObject.command, argumentsObject.arguments);
        callback(null);

      }
      else {

        var error = null;

        _process.once('error', function(_error) {
          error = _error;
        });

        _process.once('close', function(code) {
          Log.info('< [%s] ChildProcess.spawn(%j, %j, options)', _this.name, argumentsObject.command, argumentsObject.arguments);
          if (error) {
            Log.info('         error.message=%j\n\n%s\n\n', error.message, error.stack);
            callback(error);
          }
          else if (code > 0) {
            Log.info('         code=%d', code);
            callback(new ProcessError(Utilities.format('The command returned a non-zero result (code=%d).', code), code));
          }
          else {
            callback(null);
          }
        });

      }

    });

  }
  else if (argumentsObject.isFunction) {

    var argumentsFunction = argumentsObject.function;

    if (argumentsObject.function.length == 0) {
      argumentsObject.function = function(callback) {
        try {
          argumentsFunction();
        }
        catch (error) {
          callback(error);
          return;
        }
        callback(null);
      };
    }

    this[tasksSymbol].push(argumentsObject.function);

  }

  return this;

};

taskPrototype.addLine = function(options) {
  return this.add('echo', options);
};

taskPrototype.execute = function(resolve, reject) {

  var _this = this;

  _this.add('echo "FINISH %j"', _this.name, _this.options);

  Log.info('> [%s] Task.execute(resolve, reject) { ... }', _this.name);
  Asynchronous.series(this[tasksSymbol], function(error) {
    if (error) {
      Log.error('< [%s] Task.execute(resolve, reject) { ... }', _this.name);
      Log.error('         error.message=%j\n\n%s\n\n', error.message, error.stack);
      (reject || resolve)(error);
    }
    else
      resolve(null);
  });
};

taskPrototype.executeToLog = function() {

  var _this = this;

  this.execute(function(error) {
    if (error) {
      Log.error('< [%s] Task.executeToLog() { ... }', _this.name);
      Log.error('         error.message=%j\n\n%s\n', error.message, error.stack);
    }
  });

};

taskPrototype.executeToConsole = function() {

  var _this = this;

  this.execute(function(error) {
    if (error) {
      console.error('< [%s] Task.executeToConsole() { ... }', _this.name);
      console.error('         error.message=%j\n\n%s\n', error.message, error.stack);
    }
  });

};

var Task = Object.create({});

Object.defineProperty(Task, 'IGNORE', {
  'enumerable': true,
  'writable': false,
  'value': 'ignore'
});

Object.defineProperty(Task, 'INHERIT', {
  'enumerable': true,
  'writable': false,
  'value': 'inherit'
});

Object.defineProperty(Task, 'OPTIONS_STDIO_INHERIT', {
  'enumerable': true,
  'writable': false,
  'value': {
    'stdio': [
      Task.INHERIT,
      Task.INHERIT,
      Task.INHERIT
    ]
  }
});

Object.defineProperty(Task, 'OPTIONS_STDIO_IGNORE', {
  'enumerable': true,
  'writable': false,
  'value': {
    'stdio': [
      Task.IGNORE,
      Task.IGNORE,
      Task.IGNORE
    ]
  }
});

Task.createTask = function(name, options, prototype) {

  var task = Object.create(prototype || taskPrototype);

  Object.defineProperty(task, 'name', {
    'enumerable': true,
    'writable': false,
    'value': name || 'Task'
  });

  Object.defineProperty(task, 'options', {
    'enumerable': true,
    'writable': false,
    'value': options || Task.OPTIONS_STDIO_INHERIT
  });

  task[tasksSymbol] = [];

  task.add('echo -n "START %j ... "', task.name, task.options);

  return task;

};

Task.isTask = function(task) {
  return taskPrototype.isPrototypeOf(task);
};

Task.getTaskPrototype = function() {
  return taskPrototype;
};

Task.getAddArguments = function(task, options, _arguments) {

  var argumentsArray = Array.prototype.slice.call(_arguments).slice(2);

  if (Is.string(task)) {

    var command = task;
    var notOptions = options;

    if (REGEXP_PLACEHOLDER.test(command)) {

      var format = command;
      var numberOfPlaceholders = format.match(REGEXP_PLACEHOLDER).length;

      var formatArguments = [
        notOptions
      ].concat(argumentsArray.slice(0, numberOfPlaceholders - 1));
      notOptions = argumentsArray[numberOfPlaceholders - 1];

      command = Utilities.format.apply(Utilities.format, [format].concat(formatArguments));

    }

    var commandArray = command;
    commandArray = commandArray.match(REGEXP_SPLIT);
    commandArray = commandArray.map(function(item) {
      return item.replace(REGEXP_QUOTE, '');
    });

    command = commandArray.shift();
    var commandArguments = commandArray;

    return {
      'isCommand': true,
      'isFunction': false,
      'command': command,
      'arguments': commandArguments,
      'options': notOptions
    };

  }
  else if (Is.function(task)) {

    switch (task.length) {
      case 0:
      case 1:

        return {
          'isCommand': false,
          'isFunction': true,
          'function': task
        };

      default:
        throw new ArgumentError('The function takes too many arguments.');
    }

  }
  else
    throw new TypeError('The task is invalid.');

}

module.exports = Task;

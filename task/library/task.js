'use strict';

const Asynchronous = require('async');
const ChildProcess = require('child_process');
const FileSystem = require('fs');
const Utilities = require('util');

const Log = require('library/log');
const Path = require('library/path');
const Process = require('library/process');

const ArgumentError = require('library/errors/argument-error');
const ProcessError = require('library/errors/process-error');

const REGEXP_PLACEHOLDER = /%d|%j|%s/g;
const REGEXP_SPLIT = /(?:[^\s"]+|"[^"]*")+/g;
const REGEXP_QUOTE = /^"|"$/g;
const TYPEOF_STRING = 'string';
const TYPEOF_FUNCTION = 'function';

const taskPrototype = Object.create({});

const tasksSymbol = Symbol();
taskPrototype[tasksSymbol] = [];

taskPrototype.add = function(task, options) {

  let argumentsObject = Task.getAddArguments(task, options, arguments);

  let _task = task;
  let _options = options || Task.OPTIONS_STDIO_INHERIT;

  if (argumentsObject.isCommand) {
    this[tasksSymbol].push(function(callback) {

      let error = null;

      Log.info('> ChildProcess.spawn(%j, %j, options)', argumentsObject.command, argumentsObject.arguments);
      ChildProcess
        .spawn(argumentsObject.command, argumentsObject.arguments, argumentsObject.options)
        .on('error', function(_error) {
          error = _error;
        })
        .on('close', function(code) {
          Log.info('< ChildProcess.spawn(%j, %j, options)', argumentsObject.command, argumentsObject.arguments);
          if (error) {
            Log.info('             code=%d', code);
            Log.info('    error.message=%s', error.message);
            callback(error);
          }
          if (code > 0) {
            Log.info('    code=%d', code);
            callback(new ProcessError(Utilities.format('The command %j returned a non-zero result (code=%d).', Utilities.format('%s %s', argumentsObject.command, argumentsObject.arguments.join(' ')), code), code));
          }
          else {
            callback(null);
          }
        });

    });
  }
  else if (argumentsObject.isFunction) {

    let _function = argumentsObject.function;

    if (argumentsObject.function.length == 0) {
      argumentsObject.function = function(callback) {
        try {
          _function();
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

taskPrototype.execute = function(resolve, reject) {
  Asynchronous.series(this[tasksSymbol], function(error) {
    if (error)
      (reject || resolve)(error);
    else
      resolve(null);
  });
};

const Task = Object.create({});

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

Task.createTask = function() {

  let task = Object.create(taskPrototype);
  task[tasksSymbol] = [];

  return task;

};

Task.isTask = function(task) {
  return taskPrototype.isPrototypeOf(task);
};

Task.getTaskPrototype = function() {
  return taskPrototype;
};

Task.getAddArguments = function(task, options, _arguments) {

  let argumentsArray = Array.prototype.slice.call(_arguments).slice(2);

  switch (typeof task) {
    case TYPEOF_STRING:

      let command = task;
      let notOptions = options;

      if (REGEXP_PLACEHOLDER.test(command)) {

        let format = command;
        let numberOfPlaceholders = format.match(REGEXP_PLACEHOLDER).length;

        let formatArguments = [
          notOptions
        ].concat(argumentsArray.slice(0, numberOfPlaceholders - 1));
        notOptions = argumentsArray[numberOfPlaceholders - 1];

        command = Utilities.format.apply(Utilities.format, [format].concat(formatArguments));

      }

      let commandArray = command;
      commandArray = commandArray.match(REGEXP_SPLIT);
      commandArray = commandArray.map(function(item) {
        return item.replace(REGEXP_QUOTE, '');
      });

      command = commandArray.shift();
      let commandArguments = commandArray;

      return {
        'isCommand': true,
        'isFunction': false,
        'command': command,
        'arguments': commandArguments,
        'options': notOptions || Task.OPTIONS_STDIO_INHERIT
      };

    case TYPEOF_FUNCTION:

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

      break;
    default:
      throw new TypeError('The task is invalid.');
  }

}

module.exports = Task;

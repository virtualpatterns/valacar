'use strict';

const Asynchronous = require('async');
const ChildProcess = require('child_process');
const FileSystem = require('fs');
const Utilities = require('util');

const Log = require('library/log');
const Process = require('library/process');

const REGEXP_SPLIT = /(?:[^\s"]+|"[^"]*")+/g;
const REGEXP_QUOTE = /^"|"$/g;
const TYPEOF_STRING = 'string';
const TYPEOF_FUNCTION = 'function';

const taskPrototype = Object.create({});

const tasksSymbol = Symbol();
taskPrototype[tasksSymbol] = [];

taskPrototype.add = function(task, options) {

  let _task = task;
  let _options = options || Task.STDIO_INHERIT_OPTIONS;

  switch (typeof task) {
    case TYPEOF_STRING:

      _task = _task.match(REGEXP_SPLIT);
      _task = _task.map(function(item) {
        return item.replace(REGEXP_QUOTE, '');
      });

      let command = _task.shift();
      let _arguments = _task;

      // if (command != 'echo') {
      //   this.addEcho('--------------------------------------------------------------------------------', _options);;
      //   this.addEcho(Utilities.format(' ChildProcess.spawn(%j, %j, %j)', command, _arguments, _options), _options);;
      //   this.addEcho('--------------------------------------------------------------------------------', _options);;
      // }

      this[tasksSymbol].push(function(callback) {

        let error = null;

        Log.info('> ChildProcess.spawn(%j, %j, %j)', command, _arguments, _options, {});
        ChildProcess
          .spawn(command, _arguments, _options)
          .on('error', function(_error) {
            error = _error;
          })
          .on('close', function(code) {
            Log.info('= ChildProcess.on("close", ...)');
            if (error)
              Log.info('    error.message=%s', error.message);
            callback(error);
          });

        // Log.info('> ChildProcess.exec(%j, options, callback)', task, _options);
        // ChildProcess.exec(task, _options, function(error, stdout, stderr) {
        //   Log.info('< ChildProcess.exec(%j, options, callback)', task, _options);
        //   if (error) {
        //     Log.info('<   error.message=...\n\n%s', error.message);
        //     Log.info('<          stderr=...\n\n%s', stderr);
        //     Log.info('<          stdout=...\n\n%s', stdout);
        //   }
        //   callback(error, stdout, stderr);
        // });

      });

      break;
    case TYPEOF_FUNCTION:

      switch (task.length) {
        case 0:
          _task = function(callback) {
            try {
              task();
            }
            catch (error) {
              callback(error);
              return;
            }
            callback(null);
          };
          break;
        case 1:
          _task = task;
          break;
        default:
          throw new TypeError('The given task takes too many arguments.');
      }

      this[tasksSymbol].push(_task);

      break;
    default:
      throw new TypeError('The given task is invalid.');
  }

  return this;

};

taskPrototype.addEcho = function(message, options) {
  this.add(Utilities.format('echo "%s"', message), options);
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

Object.defineProperty(Task, 'STDIO_INHERIT_OPTIONS', {
  'enumerable': true,
  'writable': false,
  'value': {
    'stdio': [
      'inherit',
      'inherit',
      'inherit'
    ]
  }
});

Object.defineProperty(Task, 'STDIO_IGNORE_OPTIONS', {
  'enumerable': true,
  'writable': false,
  'value': {
    'stdio': [
      'ignore',
      'ignore',
      'ignore'
    ]
  }
});

Task.createTask = function() {
  return Object.create(taskPrototype);
};

Task.isTask = function(task) {
  return taskPrototype.isPrototypeOf(task);
};

Task.getTaskPrototype = function() {
  return taskPrototype;
};

module.exports = Task;

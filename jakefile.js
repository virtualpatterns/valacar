'use strict';

const Index = require('./index');

const Asynchronous = require('async');
const ChildProcess = require('child_process');
const Utilities = require('util');

const Log = require('library/log');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');
const Task = require('tasks/library/task');

const LOG_PATH = Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.jake.log', Package.name));

desc(Utilities.format('Log.addFile(%j)', Path.trim(LOG_PATH)));
task('Log.addFile', function () {
  Log.addFile(LOG_PATH);
});

task('default', ['Log.addFile'], function () {
  complete();
});

desc('Push to development');
task('push', ['Log.addFile'], function () {
  Task.createTask(this.name)
    .add('git checkout development')
    .add('git pull origin development')
    .add('git push origin development')
    .execute(complete, fail);
});

namespace('test', function() {

  desc('Run all tests');
  task('all', ['Log.addFile'], function () {
    Task.createTask(this.name)
      .add('mocha --require index.js tests', Task.STDIO_INHERIT_OPTIONS)
      .execute(complete, fail);
  });

  desc('Run install tests');
  task('install', ['Log.addFile'], function () {
    Task.createTask(this.name)
      .add('mocha --require index.js tests/00000000000000-begin.js tests/00000000000001-install.js', Task.STDIO_INHERIT_OPTIONS)
      .execute(complete, fail);
  });

  desc('Run install/uninstall tests');
  task('uninstall', ['Log.addFile'], function () {
    Task.createTask(this.name)
      .add('jake test:install', Task.STDIO_INHERIT_OPTIONS)
      .add('mocha --require index.js tests/00000000000000-begin.js tests/00000000000002-uninstall.js', Task.STDIO_INHERIT_OPTIONS)
      .execute(complete, fail);
  });

});

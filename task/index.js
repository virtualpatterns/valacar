'use strict';

require('../index');

const Utilities = require('util');

const Log = require('library/log');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');
const Task = require('task/library/task');

const LOG_PATH = Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.jake.log', Package.name));

task('default', function () {
  complete();
});

desc(Utilities.format('Log.addFile(%j)', Path.trim(LOG_PATH)));
task('Log.addFile', function () {
  Log.addFile(LOG_PATH);
});

desc('Push to development');
task('push', ['Log.addFile'], function () {
  Task.createTask(this.name)
    .add('git checkout development', Task.OPTIONS_STDIO_IGNORE)
    .add('git pull origin development', Task.OPTIONS_STDIO_IGNORE)
    .add('git push origin development', Task.OPTIONS_STDIO_IGNORE)
    .add('git status')
    .execute(complete, fail);
});

require('task/tasks/test')



var Asynchronous = require('async');
var Utilities = require('util');

var BackgroundTask = require('./library/background-task');
var FileSystemTask = require('./library/file-system-task');
var Log = require('../client/library/log');
var Package = require('../package.json');
var Path = require('../client/library/path');
var Process = require('../client/library/process');
var Task = require('./library/task');

var LOG_PATH = Path.join(Process.LOG_PATH, Utilities.format('%s.jake.log', Package.name));

task('log', function () {
  Log.addFile(LOG_PATH);
});

task('default', ['log'], {'async': true}, function () {
  Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
    .add('jake --tasks', Task.OPTIONS_STDIO_INHERIT)
    .execute(complete, fail);
});

task('clean', {'async': true}, function () {
  FileSystemTask.createTask(this.fullName)
    .removeFile(Path.join(Process.LOG_PATH, Utilities.format('%s.jake.log', Package.name)))
    .removeFile(Path.join(Process.LOG_PATH, Utilities.format('%s.mocha.log', Package.name)))
    .removeFile(Path.join(Process.LOG_PATH, Utilities.format('%s.log', Package.name)))
    .removeFile(Path.join(Process.LOG_PATH, Utilities.format('%s.master.log', Package.name)))
    .removeFile(Path.join(Process.LOG_PATH, Utilities.format('%s.worker.log', Package.name)))
    .removeFile(Path.join(Process.LOG_PATH, Utilities.format('%s.test.log', Package.name)))
    .removeFile(Path.join(Process.LOG_PATH, Utilities.format('%s.master.test.log', Package.name)))
    .removeFile(Path.join(Process.LOG_PATH, Utilities.format('%s.worker.test.log', Package.name)))
    .execute(complete, fail);
});

desc(Utilities.format('Hard-link %j to "%s/Library/Logs/%s"', Path.trim(Process.LOG_PATH), Process.env['HOME'], Package.name));
task('link', ['log'], {'async': true}, function () {
  Task.createTask(this.fullName)
    .add('hln %j "%s/Library/Logs/%s"', Process.LOG_PATH, Process.env['HOME'], Package.name)
    .execute(complete, fail);
});

desc(Utilities.format('Hard-unlink %j from "%s/Library/Logs/%s"', Path.trim(Process.LOG_PATH), Process.env['HOME'], Package.name));
task('unlink', ['log'], {'async': true}, function () {
  Task.createTask(this.fullName)
    .add('hln -u "%s/Library/Logs/%s"', Process.env['HOME'], Package.name)
    .execute(complete, fail);
});

require('./tasks/watch')
require('./tasks/client')
require('./tasks/server')
require('./tasks/data')
require('./tasks/test')
require('./tasks/git')

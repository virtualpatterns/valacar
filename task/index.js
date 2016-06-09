'use strict';

const Utilities = require('util');

const FileSystemTask = require('./library/file-system-task');
const Log = require('../client/library/log');
const Package = require('../package.json');
const Path = require('../client/library/path');
const Process = require('../client/library/process');
const Task = require('./library/task');

const LOG_PATH = Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.jake.log', Package.name));
const RESOURCES_PATH = Path.join(__dirname, 'resources');

task('default', {'async': true}, function () {
  Task.createTask(this.fullName)
    .add('jake --tasks')
    .execute(complete, fail);
});

task('clean', {'async': true}, function () {
  Process.stdout.write(Utilities.format('Deleting contents of %j ... ', Path.join(Process.cwd(), 'process', 'log')));
  FileSystemTask.createTask(this.fullName)
    .removeFiles(Path.join(Process.cwd(), 'process', 'log'))
    .execute(function() {
      Process.stdout.write('done.\n');
      complete();
    }, function(error) {
      Process.stdout.write(Utilities.format('failed (%s).\n', error.message));
      fail(error);
    });
});

task('log', function () {
  Log.addFile(LOG_PATH);
});

require('./tasks/client')
require('./tasks/api-server')
require('./tasks/data')

desc('Run all application and server tests');
task('test', ['clean', 'log'], {'async': true}, function () {
  Task.createTask(this.fullName)
    .add('mocha --require test/index.js \
                test/client/tests')
    .add('mocha --require test/index.js \
                --timeout 0 \
                test/api-server/tests')
    .execute(complete, fail);
});

require('./tasks/test/index')
require('./tasks/git')

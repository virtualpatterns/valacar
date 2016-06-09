'use strict';

const Utilities = require('util');

const Package = require('../../package.json');
const Path = require('../../client/library/path');
const Process = require('../../client/library/process');
const Task = require('../library/task');

const COPY_SOURCE_COMPUTER = 'PIGWIDGEON.local';
const COPY_SOURCE_DATABASE_PATH = Path.join(Path.sep, 'home', 'fficnar', 'data', Utilities.format('%s.db', Package.name));
const COPY_SOURCE_LOG_PATH = Path.join(Path.sep, 'home', 'fficnar', 'data', Utilities.format('%s.log', Package.name));
const COPY_TARGET_DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.db', Package.name));
const COPY_TARGET_LOG_PATH = Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.log', Package.name));

namespace('data', function() {

  desc('Copy database and log from production');
  task('copy', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('echo -n "Copying %s from %s to %s ... "', COPY_SOURCE_DATABASE_PATH, COPY_SOURCE_COMPUTER, Path.trim(COPY_TARGET_DATABASE_PATH))
      .add('scp "%s:%s" %j', COPY_SOURCE_COMPUTER, COPY_SOURCE_DATABASE_PATH, COPY_TARGET_DATABASE_PATH, Task.OPTIONS_STDIO_IGNORE)
      .add('echo    "done"')
      .add('echo -n "Copying %s from %s to %s ... "', COPY_SOURCE_LOG_PATH, COPY_SOURCE_COMPUTER, Path.trim(COPY_TARGET_LOG_PATH))
      .add('scp "%s:%s" %j', COPY_SOURCE_COMPUTER, COPY_SOURCE_LOG_PATH, COPY_TARGET_LOG_PATH, Task.OPTIONS_STDIO_IGNORE)
      .add('echo    "done"')
      .execute(complete, fail);
  });

});

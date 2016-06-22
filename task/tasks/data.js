

var Utilities = require('util');

var Package = require('../../package.json');
var Path = require('../../client/library/path');
var Process = require('../../client/library/process');
var Task = require('../library/task');

var COPY_SOURCE_COMPUTER = 'PIGWIDGEON.local';
var COPY_SOURCE_DATABASE_PATH = Path.join(Path.sep, 'home', 'fficnar', 'data', Utilities.format('%s.db', Package.name));
var COPY_SOURCE_LOG_PATH = Path.join(Path.sep, 'home', 'fficnar', 'data', Utilities.format('%s.log', Package.name));
var COPY_TARGET_DATABASE_PATH = Path.join(Process.DATA_PATH, Utilities.format('%s.db', Package.name));
var COPY_TARGET_LOG_PATH = Path.join(Process.LOG_PATH, Utilities.format('%s.log', Package.name));

namespace('data', function() {

  desc('Copy database and log from production');
  task('copy', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .addLine()
      .add('echo -n "Copying %s from %s to %s ... "', COPY_SOURCE_DATABASE_PATH, COPY_SOURCE_COMPUTER, Path.trim(COPY_TARGET_DATABASE_PATH))
      .add('scp "%s:%s" %j', COPY_SOURCE_COMPUTER, COPY_SOURCE_DATABASE_PATH, COPY_TARGET_DATABASE_PATH, Task.OPTIONS_STDIO_IGNORE)
      .add('echo    "done"')
      .add('echo -n "Copying %s from %s to %s ... "', COPY_SOURCE_LOG_PATH, COPY_SOURCE_COMPUTER, Path.trim(COPY_TARGET_LOG_PATH))
      .add('scp "%s:%s" %j', COPY_SOURCE_COMPUTER, COPY_SOURCE_LOG_PATH, COPY_TARGET_LOG_PATH, Task.OPTIONS_STDIO_IGNORE)
      .add('echo    "done"')
      .execute(complete, fail);
  });

});

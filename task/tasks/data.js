var Jake = jake;

var Utilities = require('util');

var Application = require('../../client/library/application');
var Database = require('../../client/library/database');
var DatabaseTask = require('../library/database-task');
var Package = require('../../package.json');
var Path = require('../../client/library/path');
var Process = require('../../client/library/process');
var Task = require('../library/task');

var COPY_SOURCE_COMPUTER = 'PIGWIDGEON.local';
var COPY_SOURCE_DATABASE_PATH = Path.join(Path.sep, 'home', 'fficnar', 'data', Utilities.format('%s.db', Package.name));
var COPY_SOURCE_LOG_PATH = Path.join(Path.sep, 'home', 'fficnar', 'data', Utilities.format('%s.log', Package.name));
var DATABASE_PATH = Path.join(Process.DATA_PATH, Utilities.format('%s.db', Package.name));
var LOG_PATH = Path.join(Process.LOG_PATH, Utilities.format('%s.log', Package.name));

var RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');

namespace('data', function() {

  desc('Copy database and log from production');
  task('copy', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .addLine()
      .add('echo -n "Copying %s from %s to %s ... "', COPY_SOURCE_DATABASE_PATH, COPY_SOURCE_COMPUTER, Path.trim(DATABASE_PATH))
      .add('scp "%s:%s" %j', COPY_SOURCE_COMPUTER, COPY_SOURCE_DATABASE_PATH, DATABASE_PATH, Task.OPTIONS_STDIO_IGNORE)
      .add('echo    "done"')
      .add('echo -n "Copying %s from %s to %s ... "', COPY_SOURCE_LOG_PATH, COPY_SOURCE_COMPUTER, Path.trim(LOG_PATH))
      .add('scp "%s:%s" %j', COPY_SOURCE_COMPUTER, COPY_SOURCE_LOG_PATH, LOG_PATH, Task.OPTIONS_STDIO_IGNORE)
      .add('echo    "done"')
      .add(function(callback) {

        var task = Jake.Task['client:install'];
        task.addListener('complete', function () {
          callback(null);
        });
        task.addListener('error', function (error) {
          callback(error);
        });
        task.invoke();

      })
      .execute(complete, fail);
  });

  namespace('update', function() {

    desc('Update all current leases\' to expiry');
    task('leases', ['log', 'data:copy'], {'async': true}, function (duration) {
      DatabaseTask.createTask(this.fullName, DATABASE_PATH)
        .addRunFile(Path.join(RESOURCES_PATH, 'update-tlease-to.sql'), {$Duration: duration || '+1 day'})
        .execute(complete, fail);
    });

  });

});

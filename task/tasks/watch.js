var Asynchronous = require('async');
var Utilities = require('util');

var BackgroundTask = require('../library/background-task');
var Package = require('../../package.json');
var Path = require('../../client/library/path');
var Process = require('../../client/library/process');
var Task = require('../library/task');

var OPTIONS_STDIO_STDOUT_PATH = Path.join(Process.OUTPUT_PATH, 'watch.out');
var OPTIONS_STDIO_STDERR_PATH = Path.join(Process.LOG_PATH, Utilities.format('%s.watch.log', Package.name));
var SOURCE_PATH = Path.join(Process.cwd(), 'server', 'www', 'library', 'index.js');
var TARGET_PATH = Path.join(Process.cwd(), 'server', 'www', 'library', Utilities.format('%s.js', Package.name));

var REQUIRE_TEST = Path.join(Process.cwd(), 'server', 'www', 'library', 'test.js');

namespace('watch', function() {

  desc(Utilities.format('Run watch process once %j, output to %j', Path.trim(SOURCE_PATH), Path.trim(TARGET_PATH)));
  task('once', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('browserify %j "--outfile=%s" --debug', SOURCE_PATH, TARGET_PATH)
      .execute(complete, fail);
  });

  desc(Utilities.format('Run the watch process on %j, output to %j', Path.trim(SOURCE_PATH), Path.trim(TARGET_PATH)));
  task('run', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('watchify %j "--outfile=%s" --debug --verbose', SOURCE_PATH, TARGET_PATH, Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  desc(Utilities.format('Start the watch process on %j, output to %j', Path.trim(SOURCE_PATH), Path.trim(TARGET_PATH)));
  task('start', ['log'], {'async': true}, function () {

    var _this = this;

    Asynchronous.waterfall([
      function(callback) {
        BackgroundTask.createOptions(Task.IGNORE, OPTIONS_STDIO_STDOUT_PATH, OPTIONS_STDIO_STDERR_PATH, callback);
      },
      function(options, callback) {
        BackgroundTask.createTask(_this.fullName)
          .add('watchify %j "--outfile=%s" --debug --verbose', SOURCE_PATH, TARGET_PATH, options)
          .execute(callback);
      }
    ], function(error) {
      if (error)
        fail(error);
      else
        complete();
    });

  });

  desc('Stop the watch process');
  task('stop', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('pkill -f watchify')
      .execute(complete, fail);
  });

  desc(Utilities.format('Restart the watch process on %j, output to %j', Path.trim(SOURCE_PATH), Path.trim(TARGET_PATH)));
  task('restart', ['log'], {'async': true}, function () {

    Asynchronous.eachSeries([
      'watch:stop',
      'watch:start'
    ], function(taskName, callback) {
      var task = jake.Task[taskName];
      task.addListener('complete', function () {
        callback(null);
      });
      task.addListener('error', function (error) {
        callback(error);
      });
      task.invoke();
    }, function(error) {
      if (error)
        fail(error);
      else
        complete()
    });

  });

});

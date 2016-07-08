var Asynchronous = require('async');
var Utilities = require('util');

var BackgroundTask = require('../library/background-task');
var Package = require('../../package.json');
var Path = require('../../client/library/path');
var Process = require('../../client/library/process');
var Task = require('../library/task');

var OPTIONS_STDIO_STDOUT_PATH = Path.join(Process.LOG_PATH, Utilities.format('%s.watch.log', Package.name));

var DEFAULT_SOURCE_PATH = Path.join(Process.cwd(), 'server', 'www', 'library', 'default.js');
var DEFAULT_TARGET_PATH = Path.join(Process.cwd(), 'server', 'www', 'library', 'bundles', 'default.js');
var TEST_SOURCE_PATH = Path.join(Process.cwd(), 'server', 'www', 'library', 'test.js');
var TEST_TARGET_PATH = Path.join(Process.cwd(), 'server', 'www', 'library', 'bundles', 'test.js');

namespace('watch', function() {

  desc(Utilities.format('Run watch process once %j, output to %j', Path.trim(DEFAULT_SOURCE_PATH), Path.trim(DEFAULT_TARGET_PATH)));
  task('once', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      // .addExistsProcess('watchify')
      .add('browserify %j "--outfile=%s" --debug', DEFAULT_SOURCE_PATH, DEFAULT_TARGET_PATH)
      .add('browserify %j "--outfile=%s" --debug', TEST_SOURCE_PATH, TEST_TARGET_PATH)
      .execute(complete, fail);
  });

  namespace('run', function() {

    desc(Utilities.format('Run the watch process on %j, output to %j', Path.trim(DEFAULT_SOURCE_PATH), Path.trim(DEFAULT_TARGET_PATH)));
    task('default', ['log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .addLine()
        .add('watchify %j "--outfile=%s" --debug --verbose', DEFAULT_SOURCE_PATH, DEFAULT_TARGET_PATH)
        .execute(complete, fail);
    });

    desc(Utilities.format('Run the watch process on %j, output to %j', Path.trim(TEST_SOURCE_PATH), Path.trim(TEST_TARGET_PATH)));
    task('test', ['log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .addLine()
        .add('watchify %j "--outfile=%s" --debug --verbose', TEST_SOURCE_PATH, TEST_TARGET_PATH)
        .execute(complete, fail);
    });

  });

  desc(Utilities.format('Start the watch processes on %j and %j, output to %j and %j', Path.trim(DEFAULT_SOURCE_PATH), Path.trim(TEST_SOURCE_PATH), Path.trim(DEFAULT_TARGET_PATH), Path.trim(TEST_TARGET_PATH)));
  task('start', ['log', 'clean:watch'], {'async': true}, function () {

    var self = this;

    Asynchronous.waterfall([
      function(callback) {
        BackgroundTask.createOptions(Task.IGNORE, OPTIONS_STDIO_STDOUT_PATH, OPTIONS_STDIO_STDOUT_PATH, callback);
      },
      function(options, callback) {
        BackgroundTask.createTask(self.fullName)
          // .addExistsProcess('watchify')
          .add('echo "Starting PID\'s ... "', options)
          .add('watchify %j "--outfile=%s" --debug --verbose', DEFAULT_SOURCE_PATH, DEFAULT_TARGET_PATH, options)
          .add('watchify %j "--outfile=%s" --debug --verbose', TEST_SOURCE_PATH, TEST_TARGET_PATH, options)
          .add('pgrep -f watchify', options)
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

    var self = this;

    Asynchronous.waterfall([
      function(callback) {
        Task.createOptions(Task.IGNORE, OPTIONS_STDIO_STDOUT_PATH, OPTIONS_STDIO_STDOUT_PATH, callback);
      },
      function(options, callback) {
        Task.createTask(self.fullName)
          .add('echo "Killing PID\'s ... "', options)
          .add('pgrep -f watchify', options)
          .add('pkill -f watchify', options)
          .execute(callback);
      }
    ], function(error) {
      if (error)
        fail(error);
      else
        complete();
    });

  });

  desc(Utilities.format('Restart the watch process on %j, output to %j', Path.trim(DEFAULT_SOURCE_PATH), Path.trim(DEFAULT_TARGET_PATH)));
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

var Asynchronous = require('async');
var Utilities = require('util');

var BackgroundTask = require('../library/background-task');
var Package = require('../../package.json');
var Path = require('../../client/library/path');
var Process = require('../../client/library/process');
var Task = require('../library/task');

var OPTIONS_STDIO_STDOUT_PATH = Path.join(Process.LOG_PATH, Utilities.format('%s.bundle.log', Package.name));

var SOURCE_PATH = Path.join(Process.cwd(), 'server', 'www', 'library');
var TARGET_PATH = Path.join(SOURCE_PATH, 'bundles');
var DEFAULT_SOURCE_PATH = Path.join(SOURCE_PATH, 'default.js');
var DEFAULT_TARGET_PATH = Path.join(TARGET_PATH, 'default.js');
var DEFAULT_TARGET_MIN_PATH = Path.join(TARGET_PATH, 'default.min.js');
var TEST_SOURCE_PATH = Path.join(SOURCE_PATH, 'test.js');
var TEST_TARGET_PATH = Path.join(TARGET_PATH, 'test.js');
var TEST_TARGET_MIN_PATH = Path.join(TARGET_PATH, 'test.min.js');

namespace('bundle', function() {

  desc(Utilities.format('Run bundle process once on %j, output to %j', Path.trim(DEFAULT_SOURCE_PATH), Path.trim(DEFAULT_TARGET_PATH)));
  task('once', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('browserify %j --debug --full-paths --outfile %j', DEFAULT_SOURCE_PATH, DEFAULT_TARGET_PATH)
      .add('browserify %j --debug --full-paths --outfile %j', TEST_SOURCE_PATH, TEST_TARGET_PATH)
      .execute(complete, fail);
  });

  namespace('run', function() {

    desc(Utilities.format('Run the bundle process on %j, output to %j', Path.trim(DEFAULT_SOURCE_PATH), Path.trim(DEFAULT_TARGET_PATH)));
    task('default', ['log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .addLine()
        .add('watchify %j "--outfile=%s" --debug --verbose', DEFAULT_SOURCE_PATH, DEFAULT_TARGET_PATH)
        .execute(complete, fail);
    });

    desc(Utilities.format('Run the bundle process on %j, output to %j', Path.trim(TEST_SOURCE_PATH), Path.trim(TEST_TARGET_PATH)));
    task('test', ['log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .addLine()
        .add('watchify %j "--outfile=%s" --debug --verbose', TEST_SOURCE_PATH, TEST_TARGET_PATH)
        .execute(complete, fail);
    });

  });

  desc(Utilities.format('Start the bundle processes on %j, output to %j', Path.trim(DEFAULT_SOURCE_PATH), Path.trim(DEFAULT_TARGET_PATH), Path.trim(TEST_TARGET_PATH)));
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

  desc('Stop the bundle processes');
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

  desc(Utilities.format('Restart the bundle processes on %j, output to %j', Path.trim(DEFAULT_SOURCE_PATH), Path.trim(DEFAULT_TARGET_PATH)));
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

  desc(Utilities.format('Shrink the bundle at %j, output to %j', Path.trim(DEFAULT_TARGET_PATH), Path.trim(DEFAULT_TARGET_MIN_PATH)));
  task('shrink', ['log', 'watch:once'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .addLine()
      .add('uglifyjs --output %j %j', DEFAULT_TARGET_MIN_PATH, DEFAULT_TARGET_PATH)
      .add('uglifyjs --output %j %j', TEST_TARGET_MIN_PATH, TEST_TARGET_PATH)
      .add('ls -al %j', TARGET_PATH)
      .execute(complete, fail);
  });

});

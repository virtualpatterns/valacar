var Jake = jake;

var Asynchronous = require('async');
var Utilities = require('util');

var Package = require('../../package.json');
var Path = require('../../client/library/path');
var Process = require('../../client/library/process');
var FileSystemTask = require('../library/file-system-task');

namespace('clean', function() {

  desc('Delete jake-related log files');
  task('jake', {'async': true}, function () {
    FileSystemTask.createTask(this.fullName)
      .addRemoveFile(Path.join(Process.LOG_PATH, Utilities.format('%s.jake.log', Package.name)))
      .execute(complete, fail);
  });

  desc('Delete bundle-related log files');
  task('bundle', ['log'], {'async': true}, function () {
    FileSystemTask.createTask(this.fullName)
      .addRemoveFile(Path.join(Process.LOG_PATH, Utilities.format('%s.bundle.log', Package.name)))
      .execute(complete, fail);
  });

  desc('Delete client-related log files');
  task('client', ['log'], {'async': true}, function () {
    FileSystemTask.createTask(this.fullName)
      .addRemoveFile(Path.join(Process.LOG_PATH, Utilities.format('%s.log', Package.name)))
      .execute(complete, fail);
  });

  desc('Delete server-related log files');
  task('server', ['log'], {'async': true}, function () {
    FileSystemTask.createTask(this.fullName)
      .addRemoveFile(Path.join(Process.LOG_PATH, Utilities.format('%s.master.log', Package.name)))
      .addRemoveFile(Path.join(Process.LOG_PATH, Utilities.format('%s.worker.log', Package.name)))
      .execute(complete, fail);
  });

  desc('Delete test-related log files');
  task('test', ['log'], {'async': true}, function () {

    Asynchronous.eachSeries([
      'clean:test:client',
      'clean:test:server',
      'clean:test:www'
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

  namespace('test', function() {

    desc('Delete client test-related log files');
    task('client', ['log'], {'async': true}, function () {
      FileSystemTask.createTask(this.fullName)
        .addRemoveFile(Path.join(Process.LOG_PATH, Utilities.format('%s.mocha.log', Package.name)))
        .addRemoveFile(Path.join(Process.LOG_PATH, Utilities.format('%s.test.log', Package.name)))
        .execute(complete, fail);
    });

    desc('Delete server test-related log files');
    task('server', ['log'], {'async': true}, function () {
      FileSystemTask.createTask(this.fullName)
        .addRemoveFile(Path.join(Process.LOG_PATH, Utilities.format('%s.mocha.log', Package.name)))
        .addRemoveFile(Path.join(Process.LOG_PATH, Utilities.format('%s.test.log', Package.name)))
        .addRemoveFile(Path.join(Process.LOG_PATH, Utilities.format('%s.master.test.log', Package.name)))
        .addRemoveFile(Path.join(Process.LOG_PATH, Utilities.format('%s.worker.test.log', Package.name)))
        .execute(complete, fail);
    });

    desc('Delete www test-related log files');
    task('www', ['log'], {'async': true}, function () {
      FileSystemTask.createTask(this.fullName)
        .addRemoveFile(Path.join(Process.LOG_PATH, Utilities.format('%s.www.test.log', Package.name)))
        .execute(complete, fail);
    });

  });

});

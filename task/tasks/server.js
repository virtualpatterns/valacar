var Asynchronous = require('async');
var Utilities = require('util');

var FileSystem = require('../../client/library/file-system');
var Log = require('../../client/library/log');
var Package = require('../../package.json');
var Path = require('../../client/library/path');
var Process = require('../../client/library/process');
var Task = require('../library/task');

var PORT = 31470;
var DATABASE_PATH = Path.join(Process.DATA_PATH, Utilities.format('%s.db', Package.name));
var MASTER_LOG_PATH = Path.join(Process.LOG_PATH, Utilities.format('%s.master.log', Package.name));
var WORKER_LOG_PATH = Path.join(Process.LOG_PATH, Utilities.format('%s.worker.log', Package.name));
var MASTER_PID_PATH = Path.join(Process.PID_PATH, Utilities.format('%s.master.pid', Package.name));
var NUMBER_OF_WORKERS = 1;
var WAIT_DURATION = 240000;
var WAIT_TIMEOUT = 1000;

namespace('server', function() {

  desc(Utilities.format('Run/debug server on %j, log to %j, pid to %j', Path.trim(DATABASE_PATH), Path.trim(MASTER_LOG_PATH), Path.trim(MASTER_PID_PATH)));
  task('debug', ['log', 'clean:server'], {'async': true}, function (numberOfWorkers) {
    Task.createTask(this.fullName)
      .addLine()
      .add('node-debug ./server.js start %j --port %d \
                                            --masterLogPath %j \
                                            --workerLogPath %j \
                                            --masterPIDPath %j \
                                            --numberOfWorkers %d \
                                            --enableTrace', DATABASE_PATH,
                                                            PORT,
                                                            MASTER_LOG_PATH,
                                                            WORKER_LOG_PATH,
                                                            MASTER_PID_PATH,
                                                            numberOfWorkers || NUMBER_OF_WORKERS)
      .execute(complete, fail);
  });

  desc(Utilities.format('Run server on %j, log to %j, pid to %j', Path.trim(DATABASE_PATH), Path.trim(MASTER_LOG_PATH), Path.trim(MASTER_PID_PATH)));
  task('run', ['log', 'clean:server'], {'async': true}, function (numberOfWorkers) {
    Task.createTask(this.fullName)
      .addLine()
      .add('./server.js start %j  --port %d \
                                  --masterLogPath %j \
                                  --workerLogPath %j \
                                  --masterPIDPath %j \
                                  --numberOfWorkers %d \
                                  --enableTrace', DATABASE_PATH,
                                                  PORT,
                                                  MASTER_LOG_PATH,
                                                  WORKER_LOG_PATH,
                                                  MASTER_PID_PATH,
                                                  numberOfWorkers || NUMBER_OF_WORKERS)
      .execute(complete, fail);
  });

  desc(Utilities.format('Start server on %j, log to %j, pid to %j', Path.trim(DATABASE_PATH), Path.trim(MASTER_LOG_PATH), Path.trim(MASTER_PID_PATH)));
  task('start', ['log', 'bundle:start', 'clean:server'], {'async': true}, function (numberOfWorkers) {
    Task.createTask(this.fullName)
      .add('./server.js start %j  --fork \
                                  --port %d \
                                  --masterLogPath %j \
                                  --workerLogPath %j \
                                  --masterPIDPath %j \
                                  --numberOfWorkers %d \
                                  --enableTrace', DATABASE_PATH,
                                                  PORT,
                                                  MASTER_LOG_PATH,
                                                  WORKER_LOG_PATH,
                                                  MASTER_PID_PATH,
                                                  numberOfWorkers || NUMBER_OF_WORKERS)
      .add(function(callback){
        FileSystem.waitUntilFileExists(WAIT_TIMEOUT, WAIT_DURATION, MASTER_PID_PATH, callback);
      })
      .execute(complete, fail);
  });

  desc(Utilities.format('Stop server, log to %j, pid from %j', Path.trim(MASTER_LOG_PATH), Path.trim(MASTER_PID_PATH)));
  task('stop', ['log', 'bundle:stop'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('./server.js stop  --masterLogPath %j \
                                  --masterPIDPath %j',  MASTER_LOG_PATH,
                                                        MASTER_PID_PATH)
      .add(function(callback){
        FileSystem.waitUntilFileNotExists(WAIT_TIMEOUT, WAIT_DURATION, MASTER_PID_PATH, callback);
      })
      .execute(complete, fail);
  });

  desc(Utilities.format('Restart the server on %j, log to %j, pid to %j', Path.trim(DATABASE_PATH), Path.trim(MASTER_LOG_PATH), Path.trim(MASTER_PID_PATH)));
  task('restart', ['log', 'bundle:restart'], {'async': true}, function () {

    Asynchronous.eachSeries([
      'server:stop',
      'server:start'
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

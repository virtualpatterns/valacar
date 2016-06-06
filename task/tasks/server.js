'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Package = require('../../package.json');
const Path = require('../../library/path');
const Process = require('../../library/process');
const Task = require('../library/task');

const PORT = 31470;
const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.db', Package.name));
const MASTER_LOG_PATH = Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.master.%s', Package.name, 'log'));
const WORKER_LOG_PATH = Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.worker.%s', Package.name, 'log'));
const MASTER_PID_PATH = Path.join(Process.cwd(), 'process', 'pid', Utilities.format('%s.master.%s', Package.name, 'pid'));
const NUMBER_OF_WORKERS = 1;
const PAUSE = 5000;

namespace('server', function() {

  desc(Utilities.format('Run server on %j, log to %j, pid to %j', Path.trim(DATABASE_PATH), Path.trim(MASTER_LOG_PATH), Path.trim(MASTER_PID_PATH)));
  task('run', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('./server.js start %j  --port %d \
                                  --masterLogPath %j \
                                  --workerLogPath %j \
                                  --masterPIDPath %j \
                                  --numberOfWorkers %d',  DATABASE_PATH,
                                                          PORT,
                                                          MASTER_LOG_PATH,
                                                          WORKER_LOG_PATH,
                                                          MASTER_PID_PATH,
                                                          NUMBER_OF_WORKERS)
      .execute(complete, fail);
  });

  desc(Utilities.format('Start server on %j, log to %j, pid to %j', Path.trim(DATABASE_PATH), Path.trim(MASTER_LOG_PATH), Path.trim(MASTER_PID_PATH)));
  task('start', ['log'], {'async': true}, {
    'async': true
  }, function () {
    Task.createTask(this.fullName)
      .add('./server.js start %j  --fork \
                                  --port %d \
                                  --masterLogPath %j \
                                  --workerLogPath %j \
                                  --masterPIDPath %j \
                                  --numberOfWorkers %d',  DATABASE_PATH,
                                                          PORT,
                                                          MASTER_LOG_PATH,
                                                          WORKER_LOG_PATH,
                                                          MASTER_PID_PATH,
                                                          NUMBER_OF_WORKERS)
      .execute(complete, fail);
  });

  desc(Utilities.format('Stop server, log to %j, pid from %j', Path.trim(MASTER_LOG_PATH), Path.trim(MASTER_PID_PATH)));
  task('stop', ['log'], {'async': true}, {
    'async': true
  }, function () {
    Task.createTask(this.fullName)
      .add('./server.js stop  --masterLogPath %j \
                              --masterPIDPath %j',  MASTER_LOG_PATH,
                                                    MASTER_PID_PATH)
      .execute(complete, fail);
  });

  desc(Utilities.format('Pause for %dms', PAUSE));
  task('pause', ['log'], {'async': true}, {
    'async': true
  }, function () {
    Process.stdout.write(Utilities.format('Pausing for %dms ... ', PAUSE));
    setTimeout(function() {
      Process.stdout.write('done\n');
      complete();
    }, PAUSE);
  });

  desc(Utilities.format('Restart the server on %j, log to %j, pid to %j', Path.trim(DATABASE_PATH), Path.trim(MASTER_LOG_PATH), Path.trim(MASTER_PID_PATH)));
  task('restart', ['log'], {'async': true}, function () {

    Asynchronous.eachSeries([
      'server:stop',
      'server:pause',
      'server:start'
    ], function(taskName, callback) {
      let task = jake.Task[taskName];
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

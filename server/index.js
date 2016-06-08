'use strict';

const Cluster = require('cluster');
const Command = require('commander');
const Daemon = require('daemon');
const System = require('os');
const Utilities = require('util');

const Application = require('./library/application');
const Log = require('../library/log');
const Package = require('../package.json');
const Path = require('../library/path');
const Process = require('../library/process');

const ADDRESS = '0.0.0.0';
const PORT = 8080;
const DATABASE_PATH = Path.join(Process.cwd(), Utilities.format('%s.%s', Package.name, 'db'));
const MASTER_LOG_PATH = Path.join(Process.cwd(), Utilities.format('%s.master.log', Package.name));
const WORKER_LOG_PATH = Path.join(Process.cwd(), Utilities.format('%s.worker.log', Package.name));
const MASTER_PID_PATH = Path.join(Process.cwd(), Utilities.format('%s.master.pid', Package.name));
const NUMBER_OF_WORKERS = System.cpus().length;

Command
  .version(Package.version);

Command
  .command('start [databasePath]')
  .description(Utilities.format('Start the server, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--fork', 'Fork the server process, by default the server process is not forked')
  .option('--address <address>', Utilities.format('Listening IPv4 or IPv6 address, defaults to %s', ADDRESS))
  .option('--port <number>', Utilities.format('Listening port, defaults to %s', PORT))
  .option('--masterLogPath <path>', Utilities.format('Master process log file path, defaults to %s', Path.trim(MASTER_LOG_PATH)))
  .option('--workerLogPath <path>', Utilities.format('Worker process log file path, defaults to %s', Path.trim(WORKER_LOG_PATH)))
  .option('--masterPIDPath <path>', Utilities.format('Master process PID file path, defaults to %s', Path.trim(MASTER_PID_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .option('--numberOfWorkers <number>', Utilities.format('Number of worker processes, defaults to the number of processors (%d)', NUMBER_OF_WORKERS))
  .action(function (databasePath, options) {

    if (Cluster.isMaster) {

      if (options.fork) Daemon();

      Log.addFile(options.masterLogPath || MASTER_LOG_PATH);

      Log.info('--------------------------------------------------------------------------------');
      Log.info('> Command.command("start [databasePath]")');
      Log.info('> Command.action(function (%j, options) { ... }', Path.trim(databasePath));
      Log.info('--------------------------------------------------------------------------------');

      try {

        Application.startMaster(  options.numberOfWorkers || NUMBER_OF_WORKERS,
                                  options.masterPIDPath || MASTER_PID_PATH);

        Application.waitUntilAllWorkersListening(function() {});

      }
      catch(error) {

        Log.error('= %j\n\n%s\n', error.message, error.stack);

        Process.exitCode = 1;
        console.log('An error occured starting the server processes.');
        console.log(error.stack);

      }

    }
    else {

      Log.addFile(options.workerLogPath || WORKER_LOG_PATH);

      try {

        Application.startWorker(  options.address || ADDRESS,
                                  options.port || PORT,
                                  databasePath || DATABASE_PATH,
                                  {
                                    'enableTrace': !!options.enableTrace,
                                    'enableProfile': !!options.enableProfile
                                  });

      }
      catch(error) {
        Log.error('= %j\n\n%s\n', error.message, error.stack);
        Process.exitCode = 1;
      }

    }

  });

Command
  .command('stop')
  .description('Stop the server.')
  .option('--masterLogPath <path>', Utilities.format('Master process log file path, defaults to %s', Path.trim(MASTER_LOG_PATH)))
  .option('--masterPIDPath <path>', Utilities.format('Master process PID file path, defaults to %s', Path.trim(MASTER_PID_PATH)))
  .action(function (options) {

    Log.addFile(options.masterLogPath || MASTER_LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('> Command.command("stop")');
    Log.info('> Command.action(function (options) { ... }');
    Log.info('--------------------------------------------------------------------------------');

    try {
      Application.stopMaster(options.masterPIDPath || MASTER_PID_PATH);
    }
    catch(error) {

      Log.error('= %j\n\n%s\n', error.message, error.stack);

      Process.exitCode = 1;
      console.log('An error occured stopping the server processes.');
      console.log(error.stack);

    }

  });

Command.parse(process.argv);

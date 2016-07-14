

var Cluster = require('cluster');
var Command = require('commander');
var Daemon = require('daemon');
var System = require('os');
var Utilities = require('util');

var Application = require('./library/application');
var Log = require('../client/library/log');
var Package = require('../package.json');
var Path = require('../client/library/path');
var Process = require('../client/library/process');

var ADDRESS = '0.0.0.0';
var PORT = 8080;
var STATIC_PATH = __dirname;
var DATABASE_PATH = Path.join(Process.cwd(), Utilities.format('%s.%s', Package.name, 'db'));
var MASTER_LOG_PATH = Path.join(Process.cwd(), Utilities.format('%s.master.log', Package.name));
var WORKER_LOG_PATH = Path.join(Process.cwd(), Utilities.format('%s.worker.log', Package.name));
var MASTER_PID_PATH = Path.join(Process.cwd(), Utilities.format('%s.master.pid', Package.name));
var NUMBER_OF_WORKERS = System.cpus().length;

var EXIT_TIMEOUT = 5000;

Command
  .version(Package.version);

Command
  .command('start [databasePath]')
  .description(Utilities.format('Start the server, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--fork', 'Fork the server process, by default the server process is not forked')
  .option('--address <address>', Utilities.format('Listening IPv4 or IPv6 address, defaults to %s', ADDRESS))
  .option('--port <number>', Utilities.format('Listening port, defaults to %s', PORT))
  .option('--staticPath <path>', Utilities.format('Static file path (path containing but not including www), defaults to %s', Path.trim(STATIC_PATH)))
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

        Application.waitUntilListening(function(error) {
          if (error)  {
            Log.error('< Application.waitUntilListening(function(error) { ... })');
            Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
            Process.kill(Process.pid, 'SIGHUP');
            Application.waitNotListening(function(error) {
              if (error) {
                Log.error('< Application.waitUntilListening(function(error) { ... })');
                Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
              }
              Process.exit(1);
            });
          }
        });

      }
      catch(error) {

        Log.error('= %j\n\n%s\n', error.message, error.stack);

        Process.exitCode = 1;
        console.log('An error occured starting the master process.');
        console.log(error.stack);

      }

    }
    else {

      Log.addFile(options.workerLogPath || WORKER_LOG_PATH);

      try {

        Application.startWorker(  options.address || ADDRESS,
                                  options.port || PORT,
                                  options.staticPath || STATIC_PATH,
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

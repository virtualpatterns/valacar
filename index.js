#!/usr/bin/env node

'use strict';

const Asynchronous = require('async');
const Command = require('commander');
const Utilities = require('util');

const Modules = require('app-module-path/register');

const Database = require('lib/database');
const DHCP = require('lib/dhcp');
const Log = require('lib/log');
const Migration = require('lib/migration');
const Package = require('package.json');
const Path = require('lib/path');
const Process = require('lib/process');

const DATABASE_PATH = Path.join(process.cwd(), 'data', Utilities.format('%s.%s', Package.name, 'db'));
const LEASES_PATH = Path.join(process.cwd(), 'dhcpd.leases');
const LOG_PATH = Path.join(process.cwd(), 'process', 'log', Utilities.format('%s.%s', Package.name, 'log'));
const PID_PATH = Path.join(process.cwd(), 'process', Utilities.format('%s.%s', Package.name, 'pid'));
const RESOURCES_PATH = Path.join(__dirname, 'resources');
const TRANSACTION_NAME = 'sDefault';

const ADDRESS_REGEXP = new RegExp('^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
const DEVICE_REGEXP = new RegExp('^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$');
const HOST_REGEXP = new RegExp('^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$');

Command
  .version(Package.version);

Command
  .command('install [databasePath]')
  .description(Utilities.format('Create (or migrate to the current version) the database, tables, and indexes, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--pidPath', Utilities.format('PID file path, defaults to %s', Path.trim(PID_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('= Command.command("install [databasePath]")');
    Log.info('= Command.action(function (%j, options) { ... }', databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Asynchronous.series([
      function(callback) {
        Process.createPID(options.pidPath || PID_PATH, callback);
      },
      function(callback) {
        Database.openConnection(
          databasePath || DATABASE_PATH, {
            'enableTrace': options.enableTrace ? true : false,
            'enableProfile': options.enableProfile ? true : false
          }, function(connection, callback) {

            Database.startTransaction(
              connection,
              TRANSACTION_NAME,
              function(connection, callback) {
                Migration.installAll(connection, callback);
              },
              callback
            );

          }, callback);
      }
    ], function (error) {
      if (error) {
        Log.error(error.message);
        console.log(Utilities.format('An error occured installing the database to %s (%s).', Path.trim(databasePath || DATABASE_PATH), error.message));
      }
      else
        console.log(Utilities.format('Successfully installed the database to (or updated the database at) %s.', Path.trim(databasePath || DATABASE_PATH)));
    });

  });

Command
  .command('uninstall [databasePath]')
  .description(Utilities.format('Drop the tables and indexes, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--pidPath', Utilities.format('PID file path, defaults to %s', Path.trim(PID_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('= Command.command("uninstall [databasePath]")');
    Log.info('= Command.action(function (%j, options) { ... }', databasePath);
    Log.info('--------------------------------------------------------------------------------');
    Asynchronous.series([
      function(callback) {
        Process.createPID(options.pidPath || PID_PATH, callback);
      },
      function(callback) {
        Database.openConnection(
          databasePath || DATABASE_PATH, {
            'enableTrace': options.enableTrace ? true : false,
            'enableProfile': options.enableProfile ? true : false
          }, function(connection, callback) {

            Database.startTransaction(
              connection,
              TRANSACTION_NAME,
              function(connection, callback) {
                Migration.uninstallAll(connection, callback);
              },
              callback
            );

          }, callback);
      }
    ], function (error) {
      if (error) {
        Log.error(error.message);
        console.log(Utilities.format('An error occured uninstalling the database at %s (%s).', Path.trim(databasePath || DATABASE_PATH), error.message));
      }
      else
        console.log(Utilities.format('Successfully uninstalled the database at %s.', Path.trim(databasePath || DATABASE_PATH)));
    });

  });

Command
  .command('import [filePath] [databasePath]')
  .description(Utilities.format('Import DHCP leases from file, file defaults to %s and database defaults to %s.', Path.trim(LEASES_PATH), Path.trim(DATABASE_PATH)))
  .option('--logPath', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--pidPath', Utilities.format('PID file path, defaults to %s', Path.trim(PID_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (filePath, databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('= Command.command("import <filePath> [databasePath]")');
    Log.info('= Command.action(function (%j, %j, options) { ... }', filePath, databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Asynchronous.series([
      function(callback) {
        Process.createPID(options.pidPath || PID_PATH, callback);
      },
      function(callback) {
        Database.openConnection(
          databasePath || DATABASE_PATH, {
            'enableTrace': options.enableTrace ? true : false,
            'enableProfile': options.enableProfile ? true : false
          }, function(connection, callback) {

            Database.startTransaction(
              connection,
              TRANSACTION_NAME,
              function(connection, callback) {
                DHCP.importLeases(connection, filePath || LEASES_PATH, callback);
              },
              callback
            );

          }, callback);
      }
    ], function (error) {
      if (error) {
        Log.error(error.message);
        console.log(Utilities.format('An error occured importing to the database at %s (%s).', Path.trim(databasePath || DATABASE_PATH), error.message));
      }
      else
        console.log(Utilities.format('Successfully imported to the database %s.', Path.trim(databasePath || DATABASE_PATH)));
    });

  });

Command
  .command('clean [databasePath]')
  .description(Utilities.format('Empty relevant tables, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--pidPath', Utilities.format('PID file path, defaults to %s', Path.trim(PID_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('= Command.command("clean [databasePath]")');

    Log.info('= Command.action(function (%j, options) { ... }', databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Asynchronous.series([
      function(callback) {
        Process.createPID(options.pidPath || PID_PATH, callback);
      },
      function(callback) {
        Database.openConnection(
          databasePath || DATABASE_PATH, {
            'enableTrace': options.enableTrace ? true : false,
            'enableProfile': options.enableProfile ? true : false
          }, function(connection, callback) {

            Database.startTransaction(
              connection,
              TRANSACTION_NAME,
              function(connection, callback) {
                Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease.sql'), [], callback);
              },
              callback
            );

          }, callback);
      }
    ], function (error) {
      if (error) {
        Log.error(error.message);
        console.log(Utilities.format('An error occured cleaning the database at %s (%s).', Path.trim(databasePath || DATABASE_PATH), error.message));
      }
      else
        console.log(Utilities.format('Successfully cleaned the database at %s.', Path.trim(databasePath || DATABASE_PATH)));
    });

  });

Command
  .command('add <IPAddress> <MACAddress> <hostName> [databasePath]')
  .description(Utilities.format('Add a static IP IPAddress (static IP addresses do not appear from an import), database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--pidPath', Utilities.format('PID file path, defaults to %s', Path.trim(PID_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (IPAddress, MACAddress, hostName, databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('= Command.command("add <IPAddress> <MACAddress> <hostName> [databasePath]")');
    Log.info('= Command.action(function (%j, %j, %j, %j, options) { ... }', IPAddress, MACAddress, hostName, databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Asynchronous.series([
      function(callback) {
        Process.createPID(options.pidPath || PID_PATH, callback);
      },
      function(callback) {

        if (!ADDRESS_REGEXP.test(IPAddress))
          callback(new Error(Utilities.format('The IP address %j is invalid.', IPAddress)));
        else if (!DEVICE_REGEXP.test(MACAddress))
          callback(new Error(Utilities.format('The MAC address %j is invalid.', MACAddress)));
        else if (!HOST_REGEXP.test(hostName))
          callback(new Error(Utilities.format('The host name %j is invalid.', hostName)));
        else
          callback(null);

      },
      function(callback) {
        Database.openConnection(
          databasePath || DATABASE_PATH, {
            'enableTrace': options.enableTrace ? true : false,
            'enableProfile': options.enableProfile ? true : false
          }, function(connection, callback) {

            Database.startTransaction(
              connection,
              TRANSACTION_NAME,
              function(connection, callback) {
                Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tlease-static.sql'), {
                  $Address: IPAddress,
                  $Device: MACAddress,
                  $Host: hostName
                }, callback);
              },
              callback
            );

          }, callback);
      }
    ], function (error) {
      if (error) {
        Log.error(error.message);
        console.log(Utilities.format('An error occured adding the static IP address %j to the database at %s (%s).', IPAddress, Path.trim(databasePath || DATABASE_PATH), error.message));
      }
      else
        console.log(Utilities.format('Successfully added the static IP address %j to the database at %s.', IPAddress, Path.trim(databasePath || DATABASE_PATH)));
    });

  });

Command
  .command('remove <IPAddress> [databasePath]')
  .description(Utilities.format('Remove a static IP IPAddress, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--pidPath', Utilities.format('PID file path, defaults to %s', Path.trim(PID_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (IPAddress, databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('= Command.command("add <IPAddress> [databasePath]")');
    Log.info('= Command.action(function (%j, %j, options) { ... }', IPAddress, databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Asynchronous.series([
      function(callback) {
        Process.createPID(options.pidPath || PID_PATH, callback);
      },
      function(callback) {

        if (!ADDRESS_REGEXP.test(IPAddress))
          callback(new Error(Utilities.format('The IP address %j is invalid.', IPAddress)));
        else
          callback(null);

      },
      function(callback) {
        Database.openConnection(
          databasePath || DATABASE_PATH, {
            'enableTrace': options.enableTrace ? true : false,
            'enableProfile': options.enableProfile ? true : false
          }, function(connection, callback) {

            Database.startTransaction(
              connection,
              TRANSACTION_NAME,
              function(connection, callback) {
                Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease-static.sql'), {
                  $Address: IPAddress
                }, callback);
              },
              callback
            );

          }, callback);
      }
    ], function (error) {
      if (error) {
        Log.error(error.message);
        console.log(Utilities.format('An error occured removing the static IP address %j from the database at %s (%s).', IPAddress, Path.trim(databasePath || DATABASE_PATH), error.message));
      }
      else
        console.log(Utilities.format('Successfully removed the static IP address %j from the database at %s.', IPAddress, Path.trim(databasePath || DATABASE_PATH)));
    });

  });

Command.parse(process.argv);

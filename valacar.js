#!/usr/bin/env node

'use strict';

require('./index');

const Asynchronous = require('async');
const Command = require('commander');
const Utilities = require('util');

const Application = require('./library/application');
const Log = require('./library/log');
const Package = require('./package.json');
const Path = require('./library/path');
const Process = require('./library/process');

// const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.%s', Package.name, 'db'));
// const LOG_PATH = Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.%s', Package.name, 'log'));

const DATABASE_PATH = Path.join(Process.cwd(), Utilities.format('%s.%s', Package.name, 'db'));
const LEASES_PATH = Path.join(Process.cwd(), 'dhcpd.leases');
const LOG_PATH = Path.join(Process.cwd(), Utilities.format('%s.%s', Package.name, 'log'));

Command
  .version(Package.version);

Command
  .command('install [databasePath]')
  .description(Utilities.format('Create (or migrate to the current version) the database, tables, and indexes, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath <path>', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('> Command.command("install [databasePath]")');
    Log.info('> Command.action(function (%j, options) { ... }', databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Application.install(databasePath || DATABASE_PATH, {
      'enableTrace': !!options.enableTrace,
      'enableProfile': !!options.enableProfile
    }, function(error) {

      if (error) {

        Log.error(Utilities.format('= %s', error.message));

        Process.exitCode = 1;
        console.error(error.message);
        console.log('An error occured installing the database to %s (%s).', Path.trim(databasePath || DATABASE_PATH), error.message);

      }
      else {

        Process.exitCode = 0;
        console.log('Successfully installed the database to (or updated the database at) %s.', Path.trim(databasePath || DATABASE_PATH));

      }

      Log.info('< Command.command("install [databasePath]")');
      Log.info('--------------------------------------------------------------------------------');

    });

  });

Command
  .command('uninstall [databasePath]')
  .description(Utilities.format('Drop the tables and indexes, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath <path>', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('> Command.command("uninstall [databasePath]")');
    Log.info('> Command.action(function (%j, options) { ... }', databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Application.uninstall(databasePath || DATABASE_PATH, {
      'enableTrace': !!options.enableTrace,
      'enableProfile': !!options.enableProfile
    }, function(error) {
      if (error) {

        Log.error(Utilities.format('= %s', error.message));

        Process.exitCode = 1;
        console.error(error.message);
        console.log('An error occured uninstalling the database at %s (%s).', Path.trim(databasePath || DATABASE_PATH), error.message);

      }
      else {

        Process.exitCode = 0;
        console.log('Successfully uninstalled the database at %s.', Path.trim(databasePath || DATABASE_PATH));

      }

      Log.info('< Command.command("uninstall [databasePath]")');
      Log.info('--------------------------------------------------------------------------------');

    });

  });

Command
  .command('import <filePath> [databasePath]')
  .description(Utilities.format('Import DHCP leases from file, file defaults to %s and database defaults to %s.', Path.trim(LEASES_PATH), Path.trim(DATABASE_PATH)))
  .option('--logPath <path>', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (filePath, databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('> Command.command("import <filePath> [databasePath]")');
    Log.info('> Command.action(function (%j, %j, options) { ... }', filePath, databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Application.import(filePath, databasePath || DATABASE_PATH, {
      'enableTrace': !!options.enableTrace,
      'enableProfile': !!options.enableProfile
    }, function(error) {
      if (error) {

        Log.error(Utilities.format('= %s', error.message));

        Process.exitCode = 1;
        console.error(error.message);
        console.log('An error occured importing to the database at %s (%s).', Path.trim(databasePath || DATABASE_PATH), error.message);

      }
      else {

        Process.exitCode = 0;
        console.log('Successfully imported to the database %s.', Path.trim(databasePath || DATABASE_PATH));

      }

      Log.info('< Command.command("import <filePath> [databasePath]")');
      Log.info('--------------------------------------------------------------------------------');

    });

  });

Command
  .command('clean [databasePath]')
  .description(Utilities.format('Remove all imported DHCP leases, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath <path>', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('> Command.command("clean [databasePath]")');
    Log.info('> Command.action(function (%j, options) { ... }', databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Application.clean(databasePath || DATABASE_PATH, {
      'enableTrace': !!options.enableTrace,
      'enableProfile': !!options.enableProfile
    }, function(error) {
      if (error) {

        Log.error(Utilities.format('= %s', error.message));

        Process.exitCode = 1;
        console.error(error.message);
        console.log('An error occured cleaning the database at %s (%s).', Path.trim(databasePath || DATABASE_PATH), error.message);

      }
      else {

        Process.exitCode = 0;
        console.log('Successfully cleaned the database at %s.', Path.trim(databasePath || DATABASE_PATH));

      }

      Log.info('< Command.command("clean [databasePath]")');
      Log.info('--------------------------------------------------------------------------------');

    });

  });

Command
  .command('addTranslation <from> <to> [databasePath]')
  .description(Utilities.format('Add a translation for a MAC address or host name, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath <path>', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (_from, _to, databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('> Command.command("addTranslation <from> <to> [databasePath]")');
    Log.info('> Command.action(function (%j, %j, %j, options) { ... }', _from, _to, databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Asynchronous.series([
      function(callback) {
        Application.validateAddTranslation(_from, callback);
      },
      function(callback) {
        Application.addTranslation(_from, _to, databasePath || DATABASE_PATH, {
          'enableTrace': !!options.enableTrace,
          'enableProfile': !!options.enableProfile
        }, callback);
      }
    ], function (error) {
      if (error) {

        Log.error(Utilities.format('= %s', error.message));

        Process.exitCode = 1;
        console.error(error.message);
        console.log('An error occured adding the translation for %j to the database at %s (%s).', _from, Path.trim(databasePath || DATABASE_PATH), error.message);

      }
      else {

        Process.exitCode = 0;
        console.log('Successfully added the translation for %j to the database at %s.', _from, Path.trim(databasePath || DATABASE_PATH));

      }

      Log.info('< Command.command("addTranslation <from> <to> [databasePath]")');
      Log.info('--------------------------------------------------------------------------------');

    });

  });

Command
  .command('removeTranslation <from> [databasePath]')
  .description(Utilities.format('Remove a translation for a MAC address or host name, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath <path>', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (_from, databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('> Command.command("removeTranslation <from> [databasePath]")');
    Log.info('> Command.action(function (%j, %j, options) { ... }', _from, databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Asynchronous.series([
      function(callback) {
        Application.validateRemoveTranslation(_from, callback);
      },
      function(callback) {
        Application.removeTranslation(_from, databasePath || DATABASE_PATH, {
          'enableTrace': !!options.enableTrace,
          'enableProfile': !!options.enableProfile
        }, callback);
      }
    ], function (error) {
      if (error) {

        Log.error(Utilities.format('= %s', error.message));

        Process.exitCode = 1;
        console.error(error.message);
        console.log('An error occured removing the translation for %j to the database at %s (%s).', _from, Path.trim(databasePath || DATABASE_PATH), error.message);

      }
      else {

        Process.exitCode = 0;
        console.log('Successfully removed the translation for %j to the database at %s.', _from, Path.trim(databasePath || DATABASE_PATH));

      }

      Log.info('< Command.command("removeTranslation <from> [databasePath]")');
      Log.info('--------------------------------------------------------------------------------');

    });

  });

Command
  .command('dumpTranslations [databasePath]')
  .description(Utilities.format('Output a table of active leases, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath <path>', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('> Command.command("dumpTranslations [databasePath]")');
    Log.info('> Command.action(function (%j, options) { ... }', databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Application.dumpTranslations(databasePath || DATABASE_PATH, {
      'enableTrace': !!options.enableTrace,
      'enableProfile': !!options.enableProfile
    }, function (error) {
      if (error) {

        Log.error(Utilities.format('= %s', error.message));

        Process.exitCode = 1;
        console.error(error.message);
        console.log('An error occured outputting a table of translations from the database at %s (%s).', Path.trim(databasePath || DATABASE_PATH), error.message);

      }
      else
        Process.exitCode = 0;

      Log.info('< Command.command("dumpTranslations [databasePath]")');
      Log.info('--------------------------------------------------------------------------------');

    });

  });

Command
  .command('addLease <IPAddress> <MACAddress> <hostName> [databasePath]')
  .description(Utilities.format('Add a static DHCP lease (static leases do not appear in an import), database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath <path>', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (IPAddress, MACAddress, hostName, databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('> Command.command("addLease <IPAddress> <MACAddress> <hostName> [databasePath]")');
    Log.info('> Command.action(function (%j, %j, %j, %j, options) { ... }', IPAddress, MACAddress, hostName, databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Asynchronous.series([
      function(callback) {
        Application.validateAddLease(IPAddress, MACAddress, hostName, callback);
      },
      function(callback) {
        Application.addLease(IPAddress, MACAddress, hostName, databasePath || DATABASE_PATH, {
          'enableTrace': !!options.enableTrace,
          'enableProfile': !!options.enableProfile
        }, callback);
      }
    ], function (error) {
      if (error) {

        Log.error(Utilities.format('= %s', error.message));

        Process.exitCode = 1;
        console.error(error.message);
        console.log('An error occured adding the static DHCP lease %j to the database at %s (%s).', IPAddress, Path.trim(databasePath || DATABASE_PATH), error.message);

      }
      else {

        Process.exitCode = 0;
        console.log('Successfully added the static DHCP lease %j to the database at %s.', IPAddress, Path.trim(databasePath || DATABASE_PATH));

      }

      Log.info('< Command.command("addLease <IPAddress> <r> [databasePath]")');
      Log.info('--------------------------------------------------------------------------------');

    });

  });

Command
  .command('removeLease <IPAddress> [databasePath]')
  .description(Utilities.format('Remove a static DHCP lease, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath <path>', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (IPAddress, databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('> Command.command("removeLease <IPAddress> [databasePath]")');
    Log.info('> Command.action(function (%j, %j, options) { ... }', IPAddress, databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Asynchronous.series([
      function(callback) {
        Application.validateRemoveLease(IPAddress, callback);
      },
      function(callback) {
        Application.removeLease(IPAddress, databasePath || DATABASE_PATH, {
          'enableTrace': !!options.enableTrace,
          'enableProfile': !!options.enableProfile
        }, callback);
      }
    ], function (error) {
      if (error) {

        Log.error(Utilities.format('= %s', error.message));

        Process.exitCode = 1;
        console.error(error.message);
        console.log('An error occured removing the static DHCP lease %j from the database at %s (%s).', IPAddress, Path.trim(databasePath || DATABASE_PATH), error.message);

      }
      else {

        Process.exitCode = 0;
        console.log('Successfully removed the static DHCP lease %j from the database at %s.', IPAddress, Path.trim(databasePath || DATABASE_PATH));

      }

      Log.info('< Command.command("removeLease <IPAddress> [databasePath]")');
      Log.info('--------------------------------------------------------------------------------');

    });

  });

Command
  .command('dumpLeases [databasePath]')
  .description(Utilities.format('Output a table of active leases, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath <path>', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('> Command.command("dumpLeases [databasePath]")');
    Log.info('> Command.action(function (%j, options) { ... }', databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Application.dumpLeases(databasePath || DATABASE_PATH, {
      'enableTrace': !!options.enableTrace,
      'enableProfile': !!options.enableProfile
    }, function (error) {
      if (error) {

        Log.error(Utilities.format('= %s', error.message));

        Process.exitCode = 1;
        console.error(error.message);
        console.log('An error occured outputting a table of active leases from the database at %s (%s).', Path.trim(databasePath || DATABASE_PATH), error.message);

      }
      else
        Process.exitCode = 0;

      Log.info('< Command.command("dumpLeases [databasePath]")');
      Log.info('--------------------------------------------------------------------------------');

    });

  });

Command
  .command('dumpLeasesWhere <filter> [databasePath]')
  .description(Utilities.format('Output one or more leases whose MAC address or host name, direct or translated, match the filter, database defaults to %s.', Path.trim(DATABASE_PATH)))
  .option('--logPath <path>', Utilities.format('Log file path, defaults to %s', Path.trim(LOG_PATH)))
  .option('--enableTrace', 'Enable database tracing')
  .option('--enableProfile', 'Enable database profiling')
  .action(function (filter, databasePath, options) {

    Log.addFile(options.logPath || LOG_PATH);

    Log.info('--------------------------------------------------------------------------------');
    Log.info('> Command.command("dumpLeasesWhere <filter> [databasePath]")');
    Log.info('> Command.action(function (%j, %j, options) { ... }', filter, databasePath);
    Log.info('--------------------------------------------------------------------------------');

    Application.dumpLeasesWhere(filter, databasePath || DATABASE_PATH, {
      'enableTrace': !!options.enableTrace,
      'enableProfile': !!options.enableProfile
    }, function (error) {
      if (error) {

        Log.error(Utilities.format('= %s', error.message));

        Process.exitCode = 1;
        console.error(error.message);
        console.log('An error occured outputting one or more matching leases from the database at %s (%s).', Path.trim(databasePath || DATABASE_PATH), error.message);

      }
      else
        Process.exitCode = 0;

      Log.info('< Command.command("dumpLeasesWhere <filter> [databasePath]")');
      Log.info('--------------------------------------------------------------------------------');

    });

  });

Command.parse(process.argv);

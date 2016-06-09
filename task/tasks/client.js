'use strict';

const Utilities = require('util');

const Package = require('../../package.json');
const Path = require('../../client/library/path');
const Process = require('../../client/library/process');
const Task = require('../library/task');

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.db', Package.name));
const LOG_PATH = Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.log', Package.name));
const IMPORT_SOURCE_COMPUTER = 'PIGWIDGEON.local';
const IMPORT_SOURCE_LEASES_PATH = Path.join('var', 'lib', 'dhcp', 'dhcpd.leases');
const IMPORT_TARGET_LEASES_PATH = Path.join(Process.cwd(), 'process', 'data', 'dhcpd.leases');

namespace('client', function() {

  desc(Utilities.format('Install to %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('install', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('./client.js install %j --logPath %j', DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  desc(Utilities.format('Uninstall from %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('uninstall', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('./client.js uninstall %j --logPath %j', DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  desc(Utilities.format('Import from %j on %j to %j, log to %j', IMPORT_SOURCE_LEASES_PATH, IMPORT_SOURCE_COMPUTER, Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('import', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('echo -n "Copying %s from %s to %s ... "', IMPORT_SOURCE_LEASES_PATH, IMPORT_SOURCE_COMPUTER, Path.trim(IMPORT_TARGET_LEASES_PATH))
      .add('scp "%s:%s" %j', IMPORT_SOURCE_COMPUTER, IMPORT_SOURCE_LEASES_PATH, IMPORT_TARGET_LEASES_PATH, Task.OPTIONS_STDIO_IGNORE)
      .add('echo    "done"')
      .add('./client.js import %j %j --logPath %j', IMPORT_TARGET_LEASES_PATH, DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  desc(Utilities.format('Clean at %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('clean', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('./client.js clean %j --logPath %j', DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  namespace('dump', function() {

    desc(Utilities.format('Dump leases in %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
    task('leases', ['log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .add('./client.js dumpLeases %j --logPath %j', DATABASE_PATH, LOG_PATH)
        .execute(complete, fail);
    });

    namespace('leases', function() {

      desc(Utilities.format('Dump leases matching filter in %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
      task('where', ['log'], {'async': true}, function (filter) {
        Task.createTask(this.fullName)
          .add(function(callback) {
            if (!filter)
              callback(new Error('A filter must be provided (e.g. jake run:dump:leases:where[PIGWIDGEON]).'));
            else
              callback(null);
          })
          .add('./client.js dumpLeasesWhere %j %j --logPath %j', filter, DATABASE_PATH, LOG_PATH)
          .execute(complete, fail);
      });

    });

    desc(Utilities.format('Dump translations in %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
    task('translations', ['log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .add('./client.js dumpTranslations %j --logPath %j', DATABASE_PATH, LOG_PATH)
        .execute(complete, fail);
    });

  });

});

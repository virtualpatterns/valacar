'use strict';

const Utilities = require('util');

const Package = require('../../package.json');
const Path = require('../../library/path');
const Process = require('../../library/process');
const Task = require('../library/task');

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.db', Package.name));
const LOG_PATH = Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.log', Package.name));
const IMPORT_SOURCE_COMPUTER = 'PIGWIDGEON.local';
const IMPORT_SOURCE_LEASES_PATH = Path.join('var', 'lib', 'dhcp', 'dhcpd.leases');
const IMPORT_TARGET_LEASES_PATH = Path.join(Process.cwd(), 'process', 'data', 'dhcpd.leases');

namespace('run', function() {

  desc(Utilities.format('Install to %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('install', ['log'], function () {
    Task.createTask(this.fullName)
      .add('./valacar.js install %j --logPath %j', DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  desc(Utilities.format('Uninstall from %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('uninstall', ['log'], function () {
    Task.createTask(this.fullName)
      .add('./valacar.js uninstall %j --logPath %j', DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  desc(Utilities.format('Import from %j on %j to %j, log to %j', IMPORT_SOURCE_LEASES_PATH, IMPORT_SOURCE_COMPUTER, Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('import', ['log'], function () {
    Task.createTask(this.fullName)
      .add('echo -n "Copying %s from %s to %s ... "', IMPORT_SOURCE_LEASES_PATH, IMPORT_SOURCE_COMPUTER, Path.trim(IMPORT_TARGET_LEASES_PATH))
      .add('scp "%s:%s" %j', IMPORT_SOURCE_COMPUTER, IMPORT_SOURCE_LEASES_PATH, IMPORT_TARGET_LEASES_PATH, Task.OPTIONS_STDIO_IGNORE)
      .add('echo    "done"')
      .add('./valacar.js import %j %j --logPath %j', IMPORT_TARGET_LEASES_PATH, DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  desc(Utilities.format('Clean at %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('clean', ['log'], function () {
    Task.createTask(this.fullName)
      .add('./valacar.js clean %j --logPath %j', DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  namespace('dump', function() {

    desc(Utilities.format('Dump leases in %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
    task('leases', ['log'], function () {
      Task.createTask(this.fullName)
        .add('./valacar.js dumpLeases %j --logPath %j', DATABASE_PATH, LOG_PATH)
        .execute(complete, fail);
    });

    namespace('leases', function() {

      desc(Utilities.format('Dump leases matching filter in %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
      task('where', ['log'], function (filter) {
        Task.createTask(this.fullName)
          .add(function(callback) {
            if (!filter)
              callback(new Error('A filter must be provided (e.g. jake run:dump:leases:where[PIGWIDGEON]).'));
            else
              callback(null);
          })
          .add('./valacar.js dumpLeasesWhere %j %j --logPath %j', filter, DATABASE_PATH, LOG_PATH)
          .execute(complete, fail);
      });

    });

    desc(Utilities.format('Dump translations in %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
    task('translations', ['log'], function () {
      Task.createTask(this.fullName)
        .add('./valacar.js dumpTranslations %j --logPath %j', DATABASE_PATH, LOG_PATH)
        .execute(complete, fail);
    });

  });

});

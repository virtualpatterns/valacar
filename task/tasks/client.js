

var Utilities = require('util');

var Package = require('../../package.json');
var Path = require('../../client/library/path');
var Process = require('../../client/library/process');
var Task = require('../library/task');

var DATABASE_PATH = Path.join(Process.DATA_PATH, Utilities.format('%s.db', Package.name));
var LOG_PATH = Path.join(Process.LOG_PATH, Utilities.format('%s.log', Package.name));
var IMPORT_SOURCE_COMPUTER = 'PIGWIDGEON.local';
var IMPORT_SOURCE_LEASES_PATH = Path.join('/var', 'lib', 'dhcp', 'dhcpd.leases');
var IMPORT_TARGET_LEASES_PATH = Path.join(Process.DATA_PATH, 'dhcpd.leases');

namespace('client', function() {

  desc(Utilities.format('Install to %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('install', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .addLine()
      .add('./client.js install %j --logPath %j', DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  desc(Utilities.format('Uninstall from %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('uninstall', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .addLine()
      .add('./client.js uninstall %j --logPath %j', DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  desc(Utilities.format('Import from %j on %j to %j, log to %j', IMPORT_SOURCE_LEASES_PATH, IMPORT_SOURCE_COMPUTER, Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('import', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .addLine()
      .add('echo -n "Copying %s from %s to %s ... "', IMPORT_SOURCE_LEASES_PATH, IMPORT_SOURCE_COMPUTER, Path.trim(IMPORT_TARGET_LEASES_PATH))
      .add('scp "%s:%s" %j', IMPORT_SOURCE_COMPUTER, IMPORT_SOURCE_LEASES_PATH, IMPORT_TARGET_LEASES_PATH, Task.OPTIONS_STDIO_IGNORE)
      .add('echo    "done"')
      .add('./client.js import %j %j --logPath %j', IMPORT_TARGET_LEASES_PATH, DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  desc(Utilities.format('Clean at %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('_clean', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .addLine()
      .add('./client.js clean %j --logPath %j', DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  namespace('dump', function() {

    desc(Utilities.format('Dump leases in %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
    task('leases', ['clean', 'log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .addLine()
        .add('./client.js dumpLeases %j --logPath %j', DATABASE_PATH, LOG_PATH)
        .execute(complete, fail);
    });

    namespace('leases', function() {

      desc(Utilities.format('Dump leases matching filter in %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
      task('where', ['clean', 'log'], {'async': true}, function (filter) {
        Task.createTask(this.fullName)
          .addLine()
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
    task('translations', ['clean', 'log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .addLine()
        .add('./client.js dumpTranslations %j --logPath %j', DATABASE_PATH, LOG_PATH)
        .execute(complete, fail);
    });

  });

});

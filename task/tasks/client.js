var Utilities = require('util');

var Log = require('../../client/library/log');
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
  task('install', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .addLine()
      .add('./client.js install %j --logPath %j', DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  desc(Utilities.format('Uninstall from %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('uninstall', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .addLine()
      .add('./client.js uninstall %j --logPath %j', DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  desc(Utilities.format('Import from %j on %j to %j, log to %j', IMPORT_SOURCE_LEASES_PATH, IMPORT_SOURCE_COMPUTER, Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('import', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .addLine()
      .add('echo -n "Copying %s from %s to %s ... "', IMPORT_SOURCE_LEASES_PATH, IMPORT_SOURCE_COMPUTER, Path.trim(IMPORT_TARGET_LEASES_PATH))
      .add('scp "%s:%s" %j', IMPORT_SOURCE_COMPUTER, IMPORT_SOURCE_LEASES_PATH, IMPORT_TARGET_LEASES_PATH, Task.OPTIONS_STDIO_IGNORE)
      .add('echo    "done"')
      .add('./client.js import %j %j --logPath %j', IMPORT_TARGET_LEASES_PATH, DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  desc(Utilities.format('Clean at %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
  task('_clean', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .addLine()
      .add('./client.js clean %j --logPath %j', DATABASE_PATH, LOG_PATH)
      .execute(complete, fail);
  });

  namespace('dump', function() {

    desc(Utilities.format('Dump leases in %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
    task('leases', ['log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .addLine()
        .add('./client.js dumpLeases %j --logPath %j', DATABASE_PATH, LOG_PATH)
        .execute(complete, fail);
    });

    namespace('leases', function() {

      desc(Utilities.format('Dump leases matching filter in %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
      task('where', ['log'], {'async': true}, function (filter) {

        var _filter = filter;

        // try {
        //   _filter = new Date(_filter).toISOString();
        // }
        // catch (error) {
        //   Log.error('< [%s] _filter = new Date(%j).toISOString()', this.fullName, _filter);
        //   Log.error('         error.message=%j\n\n%s\n\n', error.message, error.stack);
        //   _filter = filter;
        // }
        
        Task.createTask(this.fullName)
          .addLine()
          .add(function(callback) {
            if (!_filter)
              callback(new Error('A filter must be provided (e.g. jake run:dump:leases:where[PIGWIDGEON]).'));
            else
              callback(null);
          })
          .add('./client.js dumpLeasesWhere %j %j --logPath %j', _filter, DATABASE_PATH, LOG_PATH)
          .execute(complete, fail);
      });

    });

    desc(Utilities.format('Dump translations in %j, log to %j', Path.trim(DATABASE_PATH), Path.trim(LOG_PATH)));
    task('translations', ['log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .addLine()
        .add('./client.js dumpTranslations %j --logPath %j', DATABASE_PATH, LOG_PATH)
        .execute(complete, fail);
    });

  });

});

require('datejs');

var Assert = require('assert');
var Asynchronous = require('async');
var Cluster = require('cluster');
var Is = require('@pwn/is');
var Server = require('restify');
var Utilities = require('util');

var _Application = require('../../client/library/application');
var Database = require('../../client/library/database');
var Log = require('../../client/library/log');
var Package = require('../../package.json');
var Path = require('../../client/library/path');
var Process = require('../../client/library/process');

var ProcessError = require('../../client/library/errors/process-error');

var RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');
var WAIT_DURATION = 120000;
var WAIT_TIMEOUT = 1000;

var Application = Object.create(_Application);

Application.numberOfWorkers = 0;
Application.numberOfWorkersListening = 0;
Application.allWorkersListening = false;
Application.disconnecting = false;

Application.waitUntilListening = function(callback) {

  Log.info('> Application.waitUntilListening(callback) { ... }');

  Process.waitUntil(WAIT_TIMEOUT, WAIT_DURATION, function(callback) {
    if (Application.allWorkersListening)
      callback(null);
    else
      callback(new ProcessError('All workers processes are not started.'));
  }, function(error) {
    if (error) {
      Log.error('< Application.waitUntilListening(callback) { ... }');
      Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
      callback(new ProcessError('Duration exceeded waiting for all worker processes to start.'));
    }
    else {
      Log.info('< Application.waitUntilListening(callback) { ... }');
      callback(null);
    }
  });

};

Application.waitUntilNotListening = function(callback) {

  Log.info('> Application.waitUntilNotListening(callback) { ... }');

  Process.waitUntil(WAIT_TIMEOUT, WAIT_DURATION, function(callback) {
    if (Application.numberOfWorkersListening <= 0)
      callback(null);
    else
      callback(new ProcessError('All workers processes are not stopped.'));
  }, function(error) {
    if (error) {
      Log.error('< Application.waitUntilNotListening(callback) { ... }');
      Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
      callback(new ProcessError('Duration exceeded waiting for all worker processes to stop.'));
    }
    else {
      Log.info('< Application.waitUntilNotListening(callback) { ... }');
      callback(null);
    }
  });

};

Application.startMaster = function (numberOfWorkers, pidPath) {
  Log.info('> Application.startMaster(%d, %j) { ... }', numberOfWorkers, Path.trim(pidPath));

  Process.createPID(pidPath);

  Application.numberOfWorkers = numberOfWorkers;

  for (var i = 0; i < Application.numberOfWorkers; i++) {
    Cluster.fork();
  }

  Cluster.on('listening', function(worker, address) {

    Application.numberOfWorkersListening ++;
    Application.allWorkersListening = (Application.numberOfWorkersListening == Application.numberOfWorkers ? true : false);

    Log.info('< Cluster.on("listening", function(worker, address) { ... })');
    Log.info('    worker.process.pid=%d', worker.process.pid);
    Log.info('    Application.numberOfWorkers=%d', Application.numberOfWorkers);
    Log.info('    Application.numberOfWorkersListening=%d', Application.numberOfWorkersListening);
    Log.info('    Application.allWorkersListening=%s', Application.allWorkersListening);

  });

  Cluster.on('exit', function(worker, code, signal) {

    if (Application.numberOfWorkersListening > 0) {
      Application.numberOfWorkersListening --;
      Application.allWorkersListening = false;
    }

    Log.info('< Cluster.on("exit", function(worker, %d, %j) { ... })', code, signal || '(none)');
    Log.info('    worker.process.pid=%d', worker.process.pid);
    Log.info('    Application.numberOfWorkers=%d', Application.numberOfWorkers);
    Log.info('    Application.numberOfWorkersListening=%d', Application.numberOfWorkersListening);
    Log.info('    Application.allWorkersListening=%s', Application.allWorkersListening);

    if (!Application.disconnecting)
      Cluster.fork();

  });

  Process.once('SIGHUP', function() {
    Log.info('> Process.once("SIGHUP", function() { ... })');
    Application.disconnecting = true;
    Cluster.disconnect(function() {});
  });

  Process.once('SIGINT', function() {
    Log.info('> Process.once("SIGINT", function() { ... })');
    Process.kill(Process.pid, 'SIGHUP');
    Application.waitUntilNotListening(function(error) {
      if (error) {
        Log.error('< Process.once("SIGINT", function() { ... })');
        Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
      }
      Process.exit(3);
    });
  });

  Process.once('SIGTERM', function() {
    Log.info('> Process.once("SIGTERM", function() { ... })');
    Process.kill(Process.pid, 'SIGHUP');
    Application.waitUntilNotListening(function(error) {
      if (error) {
        Log.error('< Process.once("SIGTERM", function() { ... })');
        Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
      }
      Process.exit(4);
    });
  });

  Process.once('uncaughtException', function(error) {
    Log.error('> Process.once("uncaughtException", function(error) { ... })\n\n%s\n', error.stack);
    Process.kill(Process.pid, 'SIGHUP');
    Application.waitUntilNotListening(function(error) {
      if (error) {
        Log.error('< Process.once("uncaughtException", function(error) { ... })');
        Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
      }
      Process.exit(2);
    });
  });

};

Application.startWorker = function (address, port, staticPath, databasePath, options) {
  Log.info('> Application.startWorker(%j, %d, %j, %j) { ... }', address, port, Path.trim(staticPath), Path.trim(databasePath), options, {});

  var History = require('./routes/history');
  var Leases = require('./routes/leases');
  var Static = require('./routes/static');
  var Status = require('./routes/status');
  var Translations = require('./routes/translations');

  var server = Server.createServer({
    'name': Utilities.format('%s v%s', Package.name, Package.version)
  });

  server.pre(Server.pre.userAgentConnection());

  server.use(Server.queryParser());
  server.use(Server.bodyParser());

  Static.createRoutes(server, staticPath, options);
  Status.createRoutes(server, databasePath, options);
  Translations.createRoutes(server, databasePath, options);
  Leases.createRoutes(server, databasePath, options);
  History.createRoutes(server, databasePath, options);

  server.listen(port, address);

  Cluster.worker.on('disconnect', function() {
    Log.info('< Worker.on("disconnect", function() { ... }) process.pid=%d', Process.pid);
  });

  Process.once('uncaughtException', function(error) {
    Log.error('> Process.once("uncaughtException", function(error) { ... })\n\n%s\n', error.stack);
    Process.exit(1);
  });

};

Application.stopMaster = function (pidPath) {
  Log.info('> Application.stopMaster(%j) { ... }', Path.trim(pidPath));

  try {
    Process.killPID(pidPath);
  } catch (error) {
    Log.info('< Application.stopMaster(%j) { ... }', Path.trim(pidPath));
    Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
  }

};

Application.getStatus = function (databasePath, options, callback) {
  Log.info('> Application.getStatus(%j, options, callback) { ... }', Path.trim(databasePath));
  this.openDatabase(databasePath, options, function(connection, callback) {
    Database.getFile(connection, Path.join(RESOURCES_PATH, 'select-status.sql'), [], function(error, data) {
      if (error)
        callback(error);
      else {

        Log.info('= Application.getStatus(databasePath, options, callback) { ... }\n\n%s\n\n', Utilities.inspect(data));

        var memory = Process.memoryUsage();

        var status = {
          'name': Package.name,
          'version': Package.version,
          'heap': {
            'total': memory.heapTotal,
            'used': memory.heapUsed
          },
          'database': {
            'now': data.now,
            'version': data.version
          }
        };

        callback(null, status);

      }
    });
  }, callback);
};

Application.getTranslations = function (databasePath, options, callback) {
  this.openDatabase(databasePath, options, function(connection, callback) {
    Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-ttranslation.sql'), [], callback);
  }, callback);
};

Application._getTranslation = function (from, connection, callback) {
  Database.getFile(connection, Path.join(RESOURCES_PATH, 'select-ttranslation-where.sql'), {
    $From: from
  }, callback);
};

Application.getTranslation = function (from, databasePath, options, callback) {

  var self = this;

  self.openDatabase(databasePath, options, function(connection, callback) {
    self._getTranslation(from, connection, callback);
  }, callback);

};

Application.postTranslation = function (from, to, databasePath, options, callback) {

  var self = this;

  self.openDatabase(databasePath, options, function(connection, callback) {
    // Leave it like this ... required to pass data from _getTranslation to callback!
    Asynchronous.waterfall([
      function(callback) {
        self.validateAddTranslation(from, to, callback);
      },
      function(callback) {
        self._addTranslation(from, to, connection, callback);
      },
      function(callback) {
        self._getTranslation(from, connection, callback);
      }
    ], callback);
  }, callback);

};

Application.deleteTranslations = function (databasePath, options, callback) {
  this.openDatabase(databasePath, options, function(connection, callback) {
    Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-ttranslation.sql'), [], function(error) {
      callback(error, this.changes);
    });
  }, callback);
};

Application.deleteTranslation = function (from, databasePath, options, callback) {

  var self = this;

  Asynchronous.waterfall([
    function(callback) {
      self.validateRemoveTranslation(from, callback);
    },
    function(callback) {
      self.removeTranslation(from, databasePath, options, callback);
    }
  ], callback);

};

Application.getLeases = function (databasePath, options, callback) {
  Log.info('> Application.getLeases(%j, options, callback) { ... }', Path.trim(databasePath));
  this.openDatabase(databasePath, options, function(connection, callback) {
    Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-tlease.sql'), [], callback);
  }, callback);
};

// Application.getLeases = function (filter, databasePath, options, callback) {
//   Log.info('> Application.getLeases(%j, %j, options, callback) { ... }', filter, Path.trim(databasePath));
//   this.openDatabase(databasePath, options, function(connection, callback) {
//
//     if (filter) {
//
//       var _filter = filter;
//
//       try {
//
//         _filter = new Date(_filter);
//
//         // Leave it like this ... required to complete validation!
//         Log.info('=   _filter.toISOString()=%j', _filter.toISOString());
//
//       }
//       catch (error) {
//         Log.error('< Application.getLeases(%j, %j, options, callback) { ... }', filter, Path.trim(databasePath));
//         Log.error('    error.message=%j\n\n%s\n\n', error.message, error.stack);
//         _filter = filter;
//       }
//
//       Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-tlease-filter.sql'), {
//         $Filter: Is.date(_filter) ? _filter.toISOString() : Utilities.format('%%%s%%', _filter)
//       }, callback);
//
//     }
//     else {
//       Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-tlease.sql'), [], callback);
//     }
//
//   }, callback);
// };

Application._getLease = function (address, from, to, connection, callback) {
  Database.getFile(connection, Path.join(RESOURCES_PATH, 'select-tlease-where.sql'), {
    $Address: address,
    $From: from.toISOString(),
    $To: to.toISOString()
  }, callback);
};

Application.getLease = function (address, from, to, databasePath, options, callback) {

  var self = this;

  self.openDatabase(databasePath, options, function(connection, callback) {
    self._getLease(address, from, to, connection, callback);
  }, callback);

};

Application.postLease = function (address, from, to, device, host, databasePath, options, callback) {

  var self = this;

  self.openDatabase(databasePath, options, function(connection, callback) {
    // Leave it like this ... required to pass data from _getLease to callback!
    Asynchronous.waterfall([
      function(callback) {
        self.validateAddLease(address, device, host, callback);
      },
      function(callback) {
        self._addLease(address, from, to, device, host, connection, callback);
      },
      function(callback) {
        self._getLease(address, from, to, connection, callback);
      }
    ], callback);
  }, callback);

};

Application.deleteLeases = function (databasePath, options, callback) {
  this.openDatabase(databasePath, options, function(connection, callback) {
    Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease.sql'), [], function(error) {
      callback(error, this.changes);
    });
  }, callback);
};

Application.deleteLease = function (address, from, to, databasePath, options, callback) {

  var self = this;

  Asynchronous.waterfall([
    function(callback) {
      self.validateRemoveLease(address, callback);
    },
    function(callback) {
      self.removeLease(address, from, to, databasePath, options, callback);
    }
  ], callback);

};

Application.getHistoryRange = function (databasePath, options, callback) {
  this.openDatabase(databasePath, options, function(connection, callback) {
    Database.getFile(connection, Path.join(RESOURCES_PATH, 'select-history-range.sql'), [], callback);
  }, callback);
};

Application.getHistory = function (filterDate, filterString, filterNull, databasePath, options, callback) {
  Log.info('> Application.getHistory(%j. %j, %j, options, callback) { ... }', filterDate, filterString, Path.trim(databasePath));
  this.openDatabase(databasePath, options, function(connection, callback) {

    var filterFrom = null;
    var filterTo = null;

    if (filterDate) {
      filterFrom = filterDate; //new Date(filterDate).clearTime();
      filterTo = new Date(filterFrom).add(1).days();
    }

    Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-history.sql'), {
      $FilterFrom: filterFrom ? filterFrom.toISOString() : null,
      $FilterTo: filterTo ? filterTo.toISOString() : null,
      $FilterString: filterString ? Utilities.format('%%%s%%', filterString) : null,
      $FilterNull: filterNull
    }, callback);

  }, callback);
};

module.exports = Application;

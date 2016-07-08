var Assert = require('assert');
var Asynchronous = require('async');
var Cluster = require('cluster');
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
var TYPEOF_FUNCTION = 'function';
var TYPEOF_NUMBER = 'number';
var TYPEOF_STRING = 'string';
var WAIT_DURATION = 120000;
var WAIT_TIMEOUT = 1000;

var Application = Object.create(_Application);

Application.numberOfWorkersListening = 0;
Application.allWorkersListening = false;

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

  for (var i = 0; i < numberOfWorkers; i++) {
    Cluster.fork();
  }

  Cluster.on('listening', function(worker, address) {
    Application.numberOfWorkersListening ++;
    Application.allWorkersListening = (Application.numberOfWorkersListening == numberOfWorkers ? true : false);
    Log.info('< Cluster.on("listening", function(worker, address) { ... }) worker.process.pid=%d Application.numberOfWorkersListening=%d Application.allWorkersListening=%s', worker.process.pid, Application.numberOfWorkersListening, Application.allWorkersListening);
  });

  Cluster.on('exit', function(worker, code, signal) {
    if (Application.numberOfWorkersListening > 0) {
      Application.numberOfWorkersListening --;
      Application.allWorkersListening = false;
    }
    Log.info('< Cluster.on("exit", function(worker, %d, %j) { ... }) worker.process.pid=%d Application.numberOfWorkersListening=%d Application.allWorkersListening=%s', code, signal, worker.process.pid, Application.numberOfWorkersListening, Application.allWorkersListening);
  });

  Process.once('SIGHUP', function() {
    Log.info('> Process.once("SIGHUP", function() { ... })');
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

Application.startWorker = function (address, port, databasePath, options) {
  Log.info('> Application.startWorker(%j, %d, %j, %j) { ... }', address, port, Path.trim(databasePath), options, {});

  var Leases = require('../routes/leases');
  var Static = require('../routes/static');
  var Status = require('../routes/status');
  var Translations = require('../routes/translations');

  var server = Server.createServer({
    'name': Utilities.format('%s v%s', Package.name, Package.version)
  });

  server.pre(Server.pre.userAgentConnection());

  server.use(Server.bodyParser());

  Status.createRoutes(server, databasePath, options);
  Translations.createRoutes(server, databasePath, options);
  Leases.createRoutes(server, databasePath, options);
  Static.createRoutes(server, databasePath, options);

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
  Process.killPID(pidPath);
};

Application.getTranslations = function (databasePath, options, callback) {
  this.openDatabase(databasePath, options, function(connection, callback) {
    Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-ttranslation.sql'), [], callback);
  }, callback);
};

Application._getTranslation = function (_from, connection, callback) {
  Database.getFile(connection, Path.join(RESOURCES_PATH, 'select-ttranslation-where.sql'), {
    $From: _from
  }, callback);
};

Application.getTranslation = function (_from, databasePath, options, callback) {

  var self = this;

  self.openDatabase(databasePath, options, function(connection, callback) {
    self._getTranslation(_from, connection, callback);
  }, callback);

};

Application.postTranslation = function (_from, _to, databasePath, options, callback) {

  var self = this;

  self.openDatabase(databasePath, options, function(connection, callback) {
    Asynchronous.waterfall([
      function(callback) {
        self.validateAddTranslation(_from, _to, callback);
      },
      function(callback) {
        self._addTranslation(_from, _to, connection, callback);
      },
      function(callback) {
        self._getTranslation(_from, connection, callback);
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

Application.deleteTranslation = function (_from, databasePath, options, callback) {

  var self = this;

  Asynchronous.waterfall([
    function(callback) {
      self.validateRemoveTranslation(_from, callback);
    },
    function(callback) {
      self.removeTranslation(_from, databasePath, options, callback);
    }
  ], callback);

};

Application.getLeases = function (databasePath, options, callback) {
  this.openDatabase(databasePath, options, function(connection, callback) {
    Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-tlease.sql'), [], callback);
  }, callback);
};

Application._getLease = function (address, _from, _to, connection, callback) {
  Database.getFile(connection, Path.join(RESOURCES_PATH, 'select-tlease-where.sql'), {
    $Address: address,
    $From: _from.toISOString(),
    $To: _to.toISOString()
  }, callback);
};

Application.getLease = function (address, _from, _to, databasePath, options, callback) {

  var self = this;

  self.openDatabase(databasePath, options, function(connection, callback) {
    self._getLease(address, _from, _to, connection, callback);
  }, callback);

};

Application.postLease = function (address, device, host, databasePath, options, callback) {

  var self = this;

  self.openDatabase(databasePath, options, function(connection, callback) {
    Asynchronous.waterfall([
      function(callback) {
        self.validateAddLease(address, device, host, callback);
      },
      function(callback) {
        self._addLease(address, device, host, connection, callback);
      },
      function(callback) {
        self._getLease(address, Database.MINIMUM_DATE, Database.MINIMUM_DATE, connection, callback);
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

Application.deleteLease = function (address, databasePath, options, callback) {

  var self = this;

  Asynchronous.waterfall([
    function(callback) {
      self.validateRemoveLease(address, callback);
    },
    function(callback) {
      self.removeLease(address, databasePath, options, callback);
    }
  ], callback);

};

module.exports = Application;

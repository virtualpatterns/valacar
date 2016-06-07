'use strict';

const Asynchronous = require('async');
const Cluster = require('cluster');
const Server = require('restify');
const Utilities = require('util');

const _Application = require('../../library/application');
const Database = require('../../library/database');
const Log = require('../../library/log');
const Package = require('../../package.json');
const Path = require('../../library/path');
const Process = require('../../library/process');

const PAUSE = 2500;
const RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');

const Application = Object.create(_Application);

Application.startMaster = function (numberOfWorkers, pidPath) {
  Log.info('> Application.startMaster(%d, %j) { ... }', numberOfWorkers, Path.trim(pidPath));

  Process.createPID(pidPath);

  for (let i = 0; i < numberOfWorkers; i++) {

    let worker = Cluster.fork();

    worker.on('exit', function(code, signal) {
      Log.info('< worker.on("exit", function(%d, %j) { ... }) worker.process.pid=%d', code, signal, worker.process.pid);
    });

  }

  Process.once('SIGHUP', function() {
    Log.info('> Process.once("SIGHUP", function() { ... })');
    Cluster.disconnect(function() {});
  });

  Process.once('SIGINT', function() {
    Log.info('> Process.once("SIGINT", function() { ... })');
    Process.kill(Process.pid, 'SIGHUP');
    setTimeout(function() {
        Process.exit(1);
    }, PAUSE);
  });

  Process.once('SIGTERM', function() {
    Log.info('> Process.once("SIGTERM", function() { ... })');
    Process.kill(Process.pid, 'SIGHUP');
    setTimeout(function() {
      Process.exit(1);
    }, PAUSE);
  });

  Process.once('uncaughtException', function(error) {
    Log.error('> Process.once("uncaughtException", function(error) { ... })\n\n%s\n', error.stack);
    Process.kill(Process.pid, 'SIGHUP');
    setTimeout(function() {
        Process.exit(1);
    }, PAUSE);
  });

};

Application.startWorker = function (address, port, databasePath, options) {
  Log.info('> Application.startWorker(%j, %d, %j, %j) { ... }', address, port, Path.trim(databasePath), options, {});

  const Default = require('../routes/default');
  const Translation = require('../routes/translation');

  const server = Server.createServer({
    'acceptable': [
      'application/json'
    ],
    'name': Utilities.format('%s v%s', Package.name, Package.version)
  });

  server.pre(Server.pre.userAgentConnection());

  server.use(Server.bodyParser());

  Default.createRoutes(server, databasePath, options);
  Translation.createRoutes(server, databasePath, options);

  server.listen(port, address, function() {
    Log.info('< server.listen(%d, %s, function() { ... })', port, address);
  });

  Process.once('uncaughtException', function(error) {
    Log.error('> Process.once("uncaughtException", function(error) { ... })\n\n%s\n', error.stack);
    setTimeout(function() {
        Process.exit(1);
    }, PAUSE);
  });

};

Application.getTranslations = function (databasePath, options, callback) {
  this.openDatabase(databasePath, options, function(connection, callback) {
    Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-ttranslation.sql'), [], function(error, rows) {
      if (error)
        callback(error);
      else {
        // Log.debug('= Application.getTranslations(databasePath, options, callback) { ... }\n\nrows\n----\n%s\n\n', Utilities.inspect(rows));
        callback(null, rows);
      }
    });
  }, callback);
};

Application._getTranslation = function (_from, connection, callback) {
  Database.getFile(connection, Path.join(RESOURCES_PATH, 'select-ttranslation-where.sql'), {
    $From: _from
  }, function(error, row) {
    if (error)
      callback(error);
    else {
      // Log.debug('= Application._getTranslation(_from, connection, callback) { ... }\n\nrow\n---\n%s\n\n', Utilities.inspect(row));
      callback(null, row);
    }
  });
};

Application.getTranslation = function (_from, databasePath, options, callback) {

  let _this = this;

  _this.openDatabase(databasePath, options, function(connection, callback) {
    _this._getTranslation(_from, connection, callback);
  }, callback);

};

Application.postTranslation = function (_from, _to, databasePath, options, callback) {

  let _this = this;

  _this.openDatabase(databasePath, options, function(connection, callback) {
    Asynchronous.waterfall([
      function(callback) {
        _this.validateAddTranslation(_from, callback);
      },
      function(callback) {
        _this._addTranslation(_from, _to, connection, callback);
      },
      function(callback) {
        _this._getTranslation(_from, connection, function(error, row) {
          if (error)
            callback(error);
          else {
            // Log.debug('= Application.postTranslation(_from, _to, databasePath, options, callback) { ... }\n\nrow\n---\n%s\n\n', Utilities.inspect(row));
            callback(null, row);
          }
        });
      }
    ], callback);
  }, callback);

};

Application.deleteTranslation = function (_from, databasePath, options, callback) {

  let _this = this;

  Asynchronous.waterfall([
    function(callback) {
      _this.validateRemoveTranslation(_from, callback);
    },
    function(callback) {
      _this.removeTranslation(_from, databasePath, options, callback);
    }
  ], callback);

};

module.exports = Application;

'use strict';

const Asynchronous = require('async');
const FileSystem = require('fs');
const SQLite = require('sqlite3');
const Utilities = require('util');

const Log = require('library/log');
const Path = require('library/path');

const Database = Object.create(SQLite);

Database.MINIMUM_DATE = new Date(0);

Database.createConnection = function(path, callback) {

  let connection = new SQLite.Database(path, function(error) {
    if (error)
      callback(error);
    else
      callback(error, connection);
  });

};

Database.openConnection = function(path, options, task, callback) {

  Asynchronous.waterfall([
    function(callback) {
      Log.info('> OPEN %s', Path.trim(path), options);
      Database.createConnection(path, callback);
    },
    function(connection, callback) {

      if (options.enableTrace) {
        connection
          .on('trace', function(statement) {
            Log.debug('= SQLite.Database.on("trace", function(statement) { ... })\n\n%s\n', statement);
          });
      }

      if (options.enableProfile) {
        connection
          .on('profile', function(statement, duration) {
            Log.debug('= SQLite.Database.on("profile", function(statement, %j ms) { ... })\n\n%s\n', duration, statement);
          });
      }

      Asynchronous.waterfall([
        function(callback) {
          task(connection, callback);
        }
      ], function(error) {
        connection.close(function(_error) {
          if (!_error)
            Log.info('< CLOSE %s', Path.trim(path));
          callback(error || _error);
        });
      });

    }
  ], callback);

}

Database.startTransaction = function(connection, transactionName, task, callback) {

  Asynchronous.waterfall([
    function(callback) {
      Log.info('> SAVEPOINT %s', transactionName);
      connection.run(Utilities.format('SAVEPOINT %s;', transactionName), [], callback);
    },
    function(callback) {

      Asynchronous.waterfall([
        function(callback) {
          task(connection, callback);
        }
      ], function(error) {
        if (error) {
          connection.run(Utilities.format('ROLLBACK TO %s;', transactionName), [], function(_error) {
            if (!_error)
              Log.info('< ROLLBACK TO %s', transactionName);
            callback(error || _error);
          });
        }
        else {
          connection.run(Utilities.format('RELEASE %s;', transactionName), [], function(_error) {
            if (!_error)
              Log.info('< RELEASE %s', transactionName);
            callback(_error);
          });
        }
      });


    }
  ], callback);

}

Database.runFile = function(connection, path, parameters, callback) {

  Asynchronous.waterfall([
    function(callback) {
      FileSystem.readFile(path, {
        encoding: 'utf-8'
      }, callback);
    }
  ], function(error, statement) {
    if (error)
      callback(error)
    else {
      Log.info('> SQLite.Database.run(statement, %j, callback)\n\n%s', parameters, statement);
      connection.run(statement, parameters, callback);
    }
  });

}

Database.getFile = function(connection, path, parameters, callback) {

  Asynchronous.waterfall([
    function(callback) {
      FileSystem.readFile(path, {
        encoding: 'utf-8'
      }, callback);
    }
  ], function(error, statement) {
    if (error)
      callback(error);
    else {
      Log.info('> SQLite.Database.get(statement, %j, callback)\n\n%s', parameters, statement);
      connection.get(statement, parameters, callback);
    }
  });

}

Database.allFile = function(connection, path, parameters, callback) {

  Asynchronous.waterfall([
    function(callback) {
      FileSystem.readFile(path, {
        encoding: 'utf-8'
      }, callback);
    }
  ], function(error, statement) {
    if (error)
      callback(error);
    else {
      Log.info('> SQLite.Database.all(statement, %j, callback)\n\n%s', parameters, statement);
      connection.all(statement, parameters, callback);
    }
  });

}

module.exports = Database;

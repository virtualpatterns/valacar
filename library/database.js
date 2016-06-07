'use strict';

const Asynchronous = require('async');
const FileSystem = require('fs');
const SQLite = require('sqlite3');
const Utilities = require('util');

const Log = require('./log');
const Path = require('./path');

const Database = Object.create(SQLite);

Object.defineProperty(Database, 'MINIMUM_DATE', {
  'enumerable': true,
  'writable': false,
  'value': new Date(0)
});

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
      Log.info('> OPEN %s %j', Path.trim(path), options, {});
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

      task(connection, function(error) {
        // Log.debug('= Database.openConnection(path, options, task, callback) { ... }\n\narguments\n---------\n%s\n\n', Utilities.inspect(arguments, {'depth': null}));

        let argumentsArray = Array.prototype.slice.call(arguments);

        connection.close(function(_error) {
          if (!_error)
            Log.info('< CLOSE %s %j', Path.trim(path), options, {});
          argumentsArray[0] = error || _error;
          // Log.debug('= Database.openConnection(path, options, task, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray, {'depth': null}));
          callback.apply(callback, argumentsArray);
        });

      });

      // Asynchronous.series([
      //   function(callback) {
      //     task(connection, callback);
      //   }
      // ], function(error) {
      //   // Log.debug('= Database.openConnection(path, options, task, callback) { ... }\n\narguments\n---------\n%s\n\n', Utilities.inspect(arguments, {'depth': null}));
      //
      //   let argumentsArray = Array.prototype.slice.call(arguments);
      //
      //   connection.close(function(_error) {
      //     if (!_error)
      //       Log.info('< CLOSE %s %j', Path.trim(path), options, {});
      //     argumentsArray[0] = error || _error;
      //     Log.debug('= Database.openConnection(path, options, task, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray, {'depth': null}));
      //     callback.apply(callback, argumentsArray);
      //   });
      //
      // });

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

      task(connection, function(error) {
        // Log.debug('= Database.startTransaction(connection, transactionName, task, callback) { ... }\n\narguments\n---------\n%s\n\n', Utilities.inspect(arguments, {'depth': null}));

        let argumentsArray = Array.prototype.slice.call(arguments);

        if (error) {
          connection.run(Utilities.format('ROLLBACK TO %s;', transactionName), [], function(_error) {
            if (!_error)
              Log.info('< ROLLBACK TO %s', transactionName);
            argumentsArray[0] = error || _error;
            // Log.debug('= Database.startTransaction(connection, transactionName, task, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray, {'depth': null}));
            callback.apply(callback, argumentsArray);
          });
        }
        else {
          connection.run(Utilities.format('RELEASE %s;', transactionName), [], function(_error) {
            if (!_error)
              Log.info('< RELEASE %s', transactionName);
            argumentsArray[0] = _error;
            // Log.debug('= Database.startTransaction(connection, transactionName, task, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray, {'depth': null}));
            callback.apply(callback, argumentsArray);
          });
        }

      });

      // Asynchronous.waterfall([
      //   function(callback) {
      //     task(connection, callback);
      //   }
      // ], function(error) {
      //   // Log.debug('= Database.startTransaction(connection, transactionName, task, callback) { ... }\n\narguments\n---------\n%s\n\n', Utilities.inspect(arguments, {'depth': null}));
      //
      //   let argumentsArray = Array.prototype.slice.call(arguments);
      //
      //   if (error) {
      //     connection.run(Utilities.format('ROLLBACK TO %s;', transactionName), [], function(_error) {
      //       if (!_error)
      //         Log.info('< ROLLBACK TO %s', transactionName);
      //       argumentsArray[0] = error || _error;
      //       Log.debug('= Database.startTransaction(connection, transactionName, task, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray, {'depth': null}));
      //       callback.apply(callback, argumentsArray);
      //     });
      //   }
      //   else {
      //     connection.run(Utilities.format('RELEASE %s;', transactionName), [], function(_error) {
      //       if (!_error)
      //         Log.info('< RELEASE %s', transactionName);
      //       argumentsArray[0] = _error;
      //       Log.debug('= Database.startTransaction(connection, transactionName, task, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray, {'depth': null}));
      //       callback.apply(callback, argumentsArray);
      //     });
      //   }
      //
      // });

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
      connection.get(statement, parameters, function(error, row) {
        if (error)
          callback(error);
        else if (!row)
          callback(null, null);
        else
          callback(null, row);
      });
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

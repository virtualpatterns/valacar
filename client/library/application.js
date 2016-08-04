var Asynchronous = require('async');
var Assert = require('assert');
var Is = require('@pwn/is');
var Table = require('cli-table');
var Utilities = require('util');

var Database = require('./database');
var Leases = require('./leases');
var Log = require('./log');
var Migration = require('./migration');
var Path = require('./path');

var ValidationError = require('./errors/validation-error');

var Application = Object.create({});

var RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');
var TRANSACTION_NAME = 'sDefault';

var REGEXP_ADDRESS = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
var REGEXP_DEVICE = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/;
var REGEXP_HOST = /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$/;
var REGEXP_TO = /\S+/;

Application.openDatabase = function(databasePath, options, taskFn, callback) {
  Database.openConnection(databasePath, options, function(connection, callback) {
    Database.startTransaction(
      connection,
      TRANSACTION_NAME,
      taskFn,
      callback
    );
  }, callback);
};

Application.install = function(databasePath, options, callback) {
  this.openDatabase(databasePath, options, Migration.installAll, callback);
};

Application.uninstall = function(databasePath, options, callback) {
  this.openDatabase(databasePath, options, Migration.uninstallAll, callback);
};

Application.import = function(filePath, databasePath, options, callback) {
  this.openDatabase(databasePath, options, function(connection, callback) {
    Leases.import(connection, filePath, callback);
  }, callback);
};

Application.clean = function(databasePath, options, callback) {
  this.openDatabase(databasePath, options, function(connection, callback) {
    Asynchronous.series([
      function(callback) {
        Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease.sql'), [], callback);
      },
      function(callback) {
        Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tdevicehost.sql'), [], callback);
      }
    ], callback);
  }, callback);
};

Application.validateAddTranslation = function(from, to, callback) {

  if (!REGEXP_DEVICE.test(from) &&
      !REGEXP_HOST.test(from))
    callback(new ValidationError(Utilities.format('The translation from %j is invalid.', from)));
  else if (!REGEXP_TO.test(to))
    callback(new ValidationError(Utilities.format('The translation to %j is invalid.', to)));
  else
    callback(null);

};

Application._addTranslation = function(from, to, connection, callback) {
  Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-ttranslation.sql'), {
    $From: from,
    $To: to
  }, callback);
};

Application.addTranslation = function(from, to, databasePath, options, callback) {

  var self = this;

  self.openDatabase(databasePath, options, function(connection, callback) {
    self._addTranslation(from, to, connection, callback);
  }, callback);

};

Application.validateRemoveTranslation = function(from, callback) {

  if (!REGEXP_DEVICE.test(from) &&
      !REGEXP_HOST.test(from))
    callback(new ValidationError(Utilities.format('The translation from %j is invalid.', from)));
  else
    callback(null);

};

Application.removeTranslation = function(from, databasePath, options, callback) {
  this.openDatabase(databasePath, options, function(connection, callback) {
    Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-ttranslation.sql'), {
      $From: from
    }, function(error) {
      if (!error)
        Assert.ok(this.changes <= 1, Utilities.format('The number of rows deleted from tTranslation should be 0 or 1 but is instead %d.', this.changes));
      callback(error, this.changes);
    });
  }, callback);
};

Application.dumpTranslations = function(databasePath, options, callback) {
  this.openDatabase(databasePath, options, function(connection, callback) {
    Asynchronous.waterfall([
      function(callback) {
        Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-ttranslation.sql'), [], callback);
      },
      function(rows, callback) {

        var table = new Table({
          head: [
            'From',
            'To'
          ],
          colWidths: [
            30,
            30
          ]
        });

        rows.forEach(function(row) {

          table.push([
            row.cFrom,
            row.cTo
          ]);

        });

        console.log(table.toString());

        callback(null);

      }
    ], callback);
  }, callback);
};

Application.validateAddLease = function(address, device, host, callback) {

  if (!REGEXP_ADDRESS.test(address))
    callback(new ValidationError(Utilities.format('The IP address %j is invalid.', address)));
  else if (!REGEXP_DEVICE.test(device))
    callback(new ValidationError(Utilities.format('The MAC address %j is invalid.', device)));
  else if (!REGEXP_HOST.test(host))
    callback(new ValidationError(Utilities.format('The host name %j is invalid.', host)));
  else
    callback(null);

};

Application._addLease = function(address, from, to, device, host, connection, callback) {

  Leases.insert(  connection,
                  address,
                  from,
                  to,
                  device,
                  host,
                  callback);

  // Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tlease.sql'), {
  //   $Address: address,
  //   $From: from.toISOString(),
  //   $To: to.toISOString(),
  //   $Device: device,
  //   $Host: host
  // }, callback);

};

Application.addLease = function(address, from, to, device, host, databasePath, options, callback) {

  var self = this;

  self.openDatabase(databasePath, options, function(connection, callback) {
    self._addLease(address, from, to, device, host, connection, callback);
  }, callback);

};

Application.validateRemoveLease = function(address, callback) {

  if (!REGEXP_ADDRESS.test(address))
    callback(new ValidationError(Utilities.format('The IP address %j is invalid.', address)));
  else
    callback(null);

};

Application._removeLease = function(address, from, to, connection, callback) {

  Leases.delete(  connection,
                  address,
                  from,
                  to,
                  callback);

  // Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease-where.sql'), {
  //   $Address: address,
  //   $From: from.toISOString(),
  //   $To: to.toISOString()
  // }, function(error) {
  //   if (!error)
  //     Assert.ok(this.changes <= 1, Utilities.format('The number of rows deleted from tLease should be 0 or 1 but is instead %d.', this.changes));
  //   callback(error, this.changes);
  // });

};

Application.removeLease = function(address, from, to, databasePath, options, callback) {

  var self = this;

  self.openDatabase(databasePath, options, function(connection, callback) {
    self._removeLease(address, from, to, connection, callback);
  }, callback);

};

Application.dumpLeases = function(databasePath, options, callback) {
  this.openDatabase(databasePath, options, function(connection, callback) {
    Asynchronous.waterfall([
      function(callback) {
        Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-tlease.sql'), [], callback);
      },
      function(rows, callback) {

        var table = new Table({
          head: [
            'IP Address',
            'From/To',
            'Device'
          ],
          colWidths: [
            15,
            45,
            30
          ]
        });

        rows.forEach(function(row) {

          var cFrom = new Date(row.cFrom);
          var cTo = new Date(row.cTo);
          var isStatic = cFrom.getTime() == cTo.getTime();

          table.push([
            row.cAddress,
            isStatic ? '' : Utilities.format('%s\n%s', cFrom, cTo),
            row.cHost ? row.cHost : row.cDevice
          ]);

        });

        console.log(table.toString());

        callback(null);

      }
    ], callback);
  }, callback);
};

Application.dumpLeasesWhere = function(filter, databasePath, options, callback) {
  this.openDatabase(databasePath, options, function(connection, callback) {
    Asynchronous.waterfall([
      function(callback) {

        var _filter = filter;

        try {

          _filter = new Date(_filter);

          // Leave it like this ... required to complete validation!
          Log.info('=   _filter.toISOString()=%j', _filter.toISOString());

        }
        catch (error) {
          Log.error('< Application.dumpLeasesWhere(%j, %j, options, callback) { ... }', _filter, Path.trim(databasePath));
          Log.error('    error.message=%j\n\n%s\n\n', error.message, error.stack);
          _filter = filter;
        }

        Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-tlease-where.sql'), {
          $Filter: Is.date(_filter) ? _filter.toISOString() : Utilities.format('%%%s%%', _filter)
        }, callback);

      },
      function(rows, callback) {

        var table = new Table({
          head: [
            'IP Address',
            'From/To',
            'Device/Host'
          ],
          colWidths: [
            15,
            45,
            30
          ]
        });

        rows.forEach(function(row) {

          var cFrom = new Date(row.cFrom);
          var cTo = new Date(row.cTo);
          var isStatic = cFrom.getTime() == cTo.getTime();

          table.push([
            row.cAddress,
            isStatic ? '' : Utilities.format('%s\n%s', cFrom, cTo),
            Utilities.format('%s\n%s', row.cDevice, row.cHost)
            // row.cHost ? row.cHost : row.cDevice
          ]);

        });

        console.log(table.toString());

        callback(null);

      }
    ], callback);
  }, callback);
};

Application.dumpDevices = function(databasePath, options, callback) {
  this.openDatabase(databasePath, options, function(connection, callback) {
    Asynchronous.waterfall([
      function(callback) {
        Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-tdevicehost.sql'), [], callback);
      },
      function(rows, callback) {

        var table = new Table({
          head: [
            'MAC Address',
            'Host Name',
            'Inserted'
          ],
          colWidths: [
            25,
            30,
            45
          ]
        });

        rows.forEach(function(row) {

          var cInserted = new Date(row.cInserted);

          table.push([
            row.cDevice,
            row.cHost,
            cInserted
          ]);

        });

        console.log(table.toString());

        callback(null);

      }
    ], callback);
  }, callback);
};

module.exports = Application;

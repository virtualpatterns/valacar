'use strict';

const Asynchronous = require('async');
const Assert = require('assert');
const Table = require('cli-table');
const Utilities = require('util');

const Database = require('./database');
const Leases = require('./leases');
const Log = require('./log');
const Migration = require('./migration');
const Path = require('./path');

const ValidationError = require('./errors/validation-error');

const Application = Object.create({});

const RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');
const TRANSACTION_NAME = 'sDefault';

const REGEXP_ADDRESS = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const REGEXP_DEVICE = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/;
const REGEXP_HOST = /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$/;

Application.executeTask = function(databasePath, options, task, callback) {
  Database.openConnection(databasePath, options, function(connection, callback) {
    Database.startTransaction(
      connection,
      TRANSACTION_NAME,
      task,
      callback
    );
  }, callback);
};

Application.install = function(databasePath, options, callback) {
  this.executeTask(databasePath, options, Migration.installAll, callback);
};

Application.uninstall = function(databasePath, options, callback) {
  this.executeTask(databasePath, options, Migration.uninstallAll, callback);
};

Application.import = function(filePath, databasePath, options, callback) {
  this.executeTask(databasePath, options, function(connection, callback) {
    Leases.import(connection, filePath, callback);
  }, callback);
};

Application.clean = function(databasePath, options, callback) {
  this.executeTask(databasePath, options, function(connection, callback) {
    Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease.sql'), {
      $From: Database.MINIMUM_DATE.toISOString(),
      $To: Database.MINIMUM_DATE.toISOString()
    }, callback);
  }, callback);
};

Application.validateAddTranslation = function(_from, callback) {

  if (!REGEXP_DEVICE.test(_from) &&
      !REGEXP_HOST.test(_from))
    callback(new ValidationError(Utilities.format('The translation from %j is invalid.', _from)));
  else
    callback(null);

};

Application._addTranslation = function(_from, _to, connection, callback) {
  Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-ttranslation.sql'), {
    $From: _from,
    $To: _to
  }, callback);
};

Application.addTranslation = function(_from, _to, databasePath, options, callback) {

  let _this = this;

  _this.executeTask(databasePath, options, function(connection, callback) {
    _this._addTranslation(_from, _to, connection, callback);
  }, callback);

};

Application.validateRemoveTranslation = function(_from, callback) {
  this.validateAddTranslation(_from, callback);
};

Application.removeTranslation = function(_from, databasePath, options, callback) {
  this.executeTask(databasePath, options, function(connection, callback) {
    Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-ttranslation.sql'), {
      $From: _from
    }, function(error) {
      if (!error)
        Assert.ok(this.changes <= 1, Utilities.format('The number of rows deleted from tTranslation should be 0 or 1 but is instead %d.', this.changes));
      callback(error, this.changes);
    });
  }, callback);
};

Application.dumpTranslations = function(databasePath, options, callback) {
  this.executeTask(databasePath, options, function(connection, callback) {
    Asynchronous.waterfall([
      function(callback) {
        Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-ttranslation.sql'), [], callback);
      },
      function(rows, callback) {

        let table = new Table({
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

Application.addLease = function(address, device, host, databasePath, options, callback) {
  this.executeTask(databasePath, options, function(connection, callback) {
    Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tlease-static.sql'), {
      $Address: address,
      $From: Database.MINIMUM_DATE.toISOString(),
      $To: Database.MINIMUM_DATE.toISOString(),
      $Device: device,
      $Host: host
    }, callback);
  }, callback);
};

Application.validateRemoveLease = function(address, callback) {

  if (!REGEXP_ADDRESS.test(address))
    callback(new ValidationError(Utilities.format('The IP address %j is invalid.', address)));
  else
    callback(null);

};

Application._removeLease = function(address, connection, callback) {
  Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease-static.sql'), {
    $Address: address,
    $From: Database.MINIMUM_DATE.toISOString(),
    $To: Database.MINIMUM_DATE.toISOString()
  }, function(error) {
    if (!error)
      Assert.ok(this.changes <= 1, Utilities.format('The number of rows deleted from tLease should be 0 or 1 but is instead %d.', this.changes));
    callback(error, this.changes);
  });
};

Application.removeLease = function(address, databasePath, options, callback) {

  let _this = this;

  _this.executeTask(databasePath, options, function(connection, callback) {
    _this._removeLease(address, connection, callback);
  }, callback);

};

Application.dumpLeases = function(databasePath, options, callback) {
  this.executeTask(databasePath, options, function(connection, callback) {
    Asynchronous.waterfall([
      function(callback) {
        Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-tlease.sql'), [], callback);
      },
      function(rows, callback) {

        let table = new Table({
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

          let cFrom = new Date(row.cFrom);
          let cTo = new Date(row.cTo);
          let isStatic = cFrom.getTime() == cTo.getTime();

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
  this.executeTask(databasePath, options, function(connection, callback) {
    Asynchronous.waterfall([
      function(callback) {
        Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-tlease-where.sql'), {
          $Filter: Utilities.format('%%%s%%', filter)
        }, callback);
      },
      function(rows, callback) {

        let table = new Table({
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

          let cFrom = new Date(row.cFrom);
          let cTo = new Date(row.cTo);
          let isStatic = cFrom.getTime() == cTo.getTime();

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

module.exports = Application;

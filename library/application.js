'use strict';

const Asynchronous = require('async');
const Assert = require('assert');
const Moment = require('moment');
const Table = require('cli-table');
const Utilities = require('util');

const Database = require('library/database');
const Leases = require('library/leases');
const Log = require('library/log');
const Migration = require('library/migration');
const Path = require('library/path');

const ValidationError = require('library/errors/validation-error');

const Application = Object.create({});

const RESOURCES_PATH = Path.join(__dirname, 'resources');
const TRANSACTION_NAME = 'sDefault';

const ADDRESS_REGEXP = new RegExp('^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
const DEVICE_REGEXP = new RegExp('^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$');
const HOST_REGEXP = new RegExp('^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$');

Application.executeTask = function (databasePath, options, task, callback) {
  Database.openConnection(databasePath, options, function(connection, callback) {
    Database.startTransaction(
      connection,
      TRANSACTION_NAME,
      task,
      callback
    );
  }, callback);
};

Application.install = function (databasePath, options, callback) {
  this.executeTask(databasePath, options, Migration.installAll, callback);
};

Application.uninstall = function (databasePath, options, callback) {
  this.executeTask(databasePath, options, Migration.uninstallAll, callback);
};

Application.import = function (filePath, databasePath, options, callback) {
  this.executeTask(databasePath, options, function(connection, callback) {
    Asynchronous.waterfall([
      function(callback) {
        Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease.sql'), {
          $From: Database.MINIMUM_DATE.toISOString(),
          $To: Database.MINIMUM_DATE.toISOString()
        }, callback);
      },
      function(callback) {
        Leases.import(connection, filePath, callback);
      }
    ], callback);
  }, callback);
};

Application.clean = function (databasePath, options, callback) {
  this.executeTask(databasePath, options, function(connection, callback) {
    Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease.sql'), {
      $From: Database.MINIMUM_DATE.toISOString(),
      $To: Database.MINIMUM_DATE.toISOString()
    }, callback);
  }, callback);
};

Application.validateAdd = function(address, device, host, callback) {

  if (!ADDRESS_REGEXP.test(address))
    callback(new ValidationError(Utilities.format('The IP address %j is invalid.', address)));
  else if (!DEVICE_REGEXP.test(device))
    callback(new ValidationError(Utilities.format('The MAC address %j is invalid.', device)));
  else if (!HOST_REGEXP.test(host))
    callback(new ValidationError(Utilities.format('The host name %j is invalid.', host)));
  else
    callback(null);

};

Application.add = function (address, device, host, databasePath, options, callback) {
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

Application.validateRemove = function(address, callback) {

  if (!ADDRESS_REGEXP.test(address))
    callback(new ValidationError(Utilities.format('The IP address %j is invalid.', address)));
  else
    callback(null);

};

Application.remove = function (address, databasePath, options, callback) {
  this.executeTask(databasePath, options, function(connection, callback) {
    Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease-static.sql'), {
      $Address: address,
      $From: Database.MINIMUM_DATE.toISOString(),
      $To: Database.MINIMUM_DATE.toISOString()
    }, function(error) {
      if (!error)
        Assert.ok(this.changes <= 1, Utilities.format('The number of rows deleted from tLease should be 0 or 1 but is instead %d.', this.changes));
      callback(error);
    });
  }, callback);
};

Application.dumpLeases = function (databasePath, options, callback) {
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

module.exports = Application;

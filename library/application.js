'use strict';

const Utilities = require('util');

const Database = require('library/database');
const Leases = require('library/leases');
const Migration = require('library/migration');
const Path = require('library/path');

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
    Leases.import(connection, filePath, callback);
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
    callback(new Error(Utilities.format('The IP address %j is invalid.', address)));
  else if (!DEVICE_REGEXP.test(device))
    callback(new Error(Utilities.format('The MAC address %j is invalid.', device)));
  else if (!HOST_REGEXP.test(host))
    callback(new Error(Utilities.format('The host name %j is invalid.', host)));
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
    callback(new Error(Utilities.format('The IP address %j is invalid.', address)));
  else
    callback(null);

};

Application.remove = function (address, databasePath, options, callback) {
  this.executeTask(databasePath, options, function(connection, callback) {
    Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease-static.sql'), {
      $Address: address,
      $From: Database.MINIMUM_DATE.toISOString(),
      $To: Database.MINIMUM_DATE.toISOString()
    }, callback);
  }, callback);
};

module.exports = Application;

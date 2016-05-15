'use strict';

const _Database = require('library/database');
const Log = require('library/log');
const Path = require('library/path');
const Utilities = require('util');

const RESOURCES_PATH = Path.join(__dirname, 'resources');

const Database = Object.create(_Database);

Database.existsTable = function(connection, tableName, callback) {
  this.getFile(connection, Path.join(RESOURCES_PATH, 'exists-table.sql'), {
    $Name: tableName
  }, function(error, row) {
    if (error)
      callback(error);
    else if (!row)
      callback(new Error(Utilities.format('The table %j does not exist.', tableName)), false);
    else
      callback(null, true);
  });
};

Database.notExistsTable = function(connection, tableName, callback) {
  this.existsTable(connection, tableName, function(error, exists) {
    if (exists)
      callback(new Error(Utilities.format('The table %j exists.', tableName))), false;
    else if (exists == undefined)
      callback(error);
    else
      callback(null, true);
  });
};

Database.existsLease = function(connection, address, _from, _to, device, host, callback) {
  this.getFile(connection, Path.join(RESOURCES_PATH, 'exists-tlease.sql'), {
    $Address: address,
    $From: _from.toISOString(),
    $To: _to.toISOString(),
    $Device: device,
    $Host: host
  }, function(error, row) {
    if (error)
      callback(error);
    else if (!row)
      callback(new Error(Utilities.format('The lease %j from %j to %j does not exist.', address, _from, _to)), false);
    else
      callback(null, true);
  });
};

Database.notExistsLease = function(connection, address, _from, _to, device, host, callback) {
  this.existsLease(connection, address, _from, _to, device, host, function(error, exists) {
    if (exists)
      callback(new Error(Utilities.format('The lease %j from %j to %j exists.', address, _from, _to))), false;
    else if (exists == undefined)
      callback(error);
    else
      callback(null, true);
  });
};

Database.existsStaticLease = function(connection, address, device, host, callback) {
  this.existsLease(connection, address, this.MINIMUM_DATE, this.MINIMUM_DATE, device, host, callback);
};

Database.notExistsStaticLease = function(connection, address, device, host, callback) {
  this.notExistsLease(connection, address, this.MINIMUM_DATE, this.MINIMUM_DATE, device, host, callback);
};

module.exports = Database;

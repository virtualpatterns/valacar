'use strict'

var Asynchronous = require('async');
var _Leases = require('dhcpd-leases');
var Path = require('path');

var Database = require('./database');
var FileSystem = require('./file-system');
var Log = require('./log');

var RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');

var Leases = Object.create({});

Leases.insert = function(connection, address, from, to, device, host, callback) {
  Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tlease.sql'), {
    $Address: address,
    $From: from.toISOString(),
    $To: to.toISOString(),
    $Device: device,
    $Host: host
  }, callback);
};

Leases.import = function(connection, path, callback) {

  var self = this;

  Asynchronous.waterfall([
    function(callback) {
      Log.info('> FileSystem.readFile(%j, ...)', path);
      FileSystem.readFile(path, {
        encoding: 'utf-8'
      }, callback);
    },
    function(dataRaw, callback) {

      var data = _Leases(dataRaw);

      Asynchronous.forEachOfSeries(data, function(lease, address, callback) {

        // Log.info('= Asynchronous.forEachOfSeries(data, function(lease, %j, callback) { ... }', address);
        // Log.info('    address=%j', address);
        // Log.info('       from=%j', lease['starts'].toISOString());
        // Log.info('         to=%j', lease['ends'].toISOString());
        // Log.info('     device=%j', lease['hardware ethernet']);
        // Log.info('       host=%j', lease['client-hostname']);

        self.insert(  connection,
                      address,
                      lease['starts'],
                      lease['ends'],
                      lease['hardware ethernet'],
                      lease['client-hostname'],
                      callback);

        // Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tlease.sql'), {
        //   $Address: address,
        //   $From: lease['starts'].toISOString(),
        //   $To: lease['ends'].toISOString(),
        //   $Device: lease['hardware ethernet'],
        //   $Host: lease['client-hostname']
        // }, callback);

      }, callback);

    }
  ], callback);

};

module.exports = Leases;

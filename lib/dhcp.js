'use strict'

const Asynchronous = require('async');
const FileSystem = require('fs');
const Leases = require('dhcpd-leases');

const Database = require('lib/database');
const Log = require('lib/log');
const Path = require('lib/path');

const RESOURCES_PATH = Path.join(__dirname, 'resources');

const DHCP = Object.create({});

DHCP.importLeases = function(connection, path, callback) {
  Asynchronous.waterfall([
    function(callback) {
      Log.info('FileSystem.readFile(%j, ...)', path);
      FileSystem.readFile(path, {
        encoding: 'utf-8'
      }, callback);
    },
    function(dataRaw, callback) {

      let data = Leases(dataRaw);

      Asynchronous.forEachOf(data, function(lease, address, callback) {

        Log.info('= Asynchronous.forEachOf(data, function(lease, %j, callback) { ... }', address);
        // Log.info('  address=%j', address);
        // Log.info('     from=%j', lease['starts']);
        // Log.info('       to=%j', lease['ends']);
        // Log.info('   device=%j', lease['hardware ethernet']);
        // Log.info('     host=%j', lease['client-hostname']);

        Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tlease.sql'), {
          $Address: address,
          $From: lease['starts'].toISOString(),
          $To: lease['ends'].toISOString(),
          $Device: lease['hardware ethernet'],
          $Host: lease['client-hostname']
        }, callback);

        // callback(null);

      }, callback);

    }
  ], callback);
};

module.exports = DHCP;

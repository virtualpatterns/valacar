'use strict'

const Asynchronous = require('async');
const FileSystem = require('fs');
const _Leases = require('dhcpd-leases');
const Path = require('path');

const Database = require('library/database');
const Log = require('library/log');

const RESOURCES_PATH = Path.join(__dirname, 'resources');

const Leases = Object.create({});

Leases.import = function(connection, path, callback) {
  Asynchronous.waterfall([
    function(callback) {
      Log.info('> FileSystem.readFile(%j, ...)', path);
      FileSystem.readFile(path, {
        encoding: 'utf-8'
      }, callback);
    },
    function(dataRaw, callback) {

      let data = _Leases(dataRaw);

      Asynchronous.forEachOfSeries(data, function(lease, address, callback) {

        // Log.info('= Asynchronous.forEachOfSeries(data, function(lease, %j, callback) { ... }', address);
        // Log.info('    address=%j', address);
        // Log.info('       from=%j', lease['starts'].toISOString());
        // Log.info('         to=%j', lease['ends'].toISOString());
        // Log.info('     device=%j', lease['hardware ethernet']);
        // Log.info('       host=%j', lease['client-hostname']);

        Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tlease.sql'), {
          $Address: address,
          $From: lease['starts'].toISOString(),
          $To: lease['ends'].toISOString(),
          $Device: lease['hardware ethernet'],
          $Host: lease['client-hostname']
        }, callback);

      }, callback);

    }
  ], callback);
};

module.exports = Leases;

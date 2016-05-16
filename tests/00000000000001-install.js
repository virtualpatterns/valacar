'use strict';

const Asynchronous = require('async');
const ChildProcess = require('child_process');
const Utilities = require('util');

const Application = require('library/application');
const Database = require('tests/library/database');
const Log = require('library/log');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.%s.%s', Package.name, 'install', 'db'));
const DATABASE_OPTIONS = {
  'enableTrace': true,
  'enableProfile': false
};

// describe('Application.install', function() {
//
//   before(function(callback) {
//     Application.install(DATABASE_PATH, DATABASE_OPTIONS, callback);
//   });
//
//   after(function(callback) {
//     Application.uninstall(DATABASE_PATH, DATABASE_OPTIONS, callback);
//   });
//
// });

describe('Command.command("install [databasePath]")', function() {

  before(function(callback) {
    Log.info('> node index.js install --enableTrace %j', Path.trim(DATABASE_PATH));
    ChildProcess.exec(Utilities.format('node index.js install --enableTrace %j', DATABASE_PATH), {
      'cwd': Process.cwd(),
      'env': Process.env
    }, callback);
  });

  it('should have created the tMigration table', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.existsTable(connection, 'tMigration', callback);
    }, callback);
  });

  it('should have created the tVersion table', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.existsTable(connection, 'tVersion', callback);
    }, callback);
  });

  it('should have created the tLease table', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.existsTable(connection, 'tLease', callback);
    }, callback);
  });

  it('should have added a static lease for BUCKBEAK', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.101', 'c8:2a:14:57:bb:1b', 'BUCKBEAK', callback);
    }, callback);
  });

  it('should have added a static lease for LOVEGOOD', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.100', '00:22:68:0e:3c:b3', 'LOVEGOOD', callback);
    }, callback);
  });

  it('should have added a static lease for PIGWIDGEON', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.2', '00:1c:23:b3:07:f6', 'PIGWIDGEON', callback);
    }, callback);
  });

  after(function(callback) {
    Log.info('> node index.js uninstall --enableTrace %j', Path.trim(DATABASE_PATH));
    ChildProcess.exec(Utilities.format('node index.js uninstall --enableTrace %j', DATABASE_PATH), {
      'cwd': Process.cwd(),
      'env': Process.env
    }, callback);
  });

});

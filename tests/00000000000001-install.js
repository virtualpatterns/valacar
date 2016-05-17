'use strict';

const Utilities = require('util');

const Application = require('tests/library/application');
const Database = require('tests/library/database');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.%s.%s', Package.name, 'install', 'db'));
const DATABASE_OPTIONS = {
  'enableTrace': true,
  'enableProfile': false
};

describe('Command.command("install [databasePath]")', function() {

  before(function(callback) {
    Application.executeInstall(DATABASE_PATH, callback);
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
    Application.executeUninstall(DATABASE_PATH, callback);
  });

});

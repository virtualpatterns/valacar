'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('tests/library/application');
const Database = require('tests/library/database');
const Log = require('library/log');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.%s.%s', Package.name, 'clean', 'db'));
const DATABASE_OPTIONS = {
  'enableTrace': true,
  'enableProfile': false
};

const TEST_NAME = Path.basename(__filename, '.js');
const RESOURCES_PATH = Path.join(__dirname, TEST_NAME, 'resources');
const LEASES_PATH = Path.join(RESOURCES_PATH, 'dhcpd.leases');

describe('Command.command("clean [databasePath]")', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(DATABASE_PATH, callback);
      },
      function(callback) {
        Application.executeImport(LEASES_PATH, DATABASE_PATH, callback);
      },
      function(callback) {
        Application.executeClean(DATABASE_PATH, callback);
      }
    ], callback);
  });

  it('should have removed the lease for HOST1', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsLease(connection, '192.168.2.29', new Date('2016/04/13 22:25:07 +0000'), new Date('2016/04/14 10:25:07 +0000'), '9c:35:eb:4e:73:4f', 'HOST1', callback);
    }, callback);
  });

  it('should have not changed the static lease for BUCKBEAK', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.101', 'c8:2a:14:57:bb:1b', 'BUCKBEAK', callback);
    }, callback);
  });

  it('should have not changed the static lease for LOVEGOOD', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.100', '00:22:68:0e:3c:b3', 'LOVEGOOD', callback);
    }, callback);
  });

  it('should have not changed the static lease for PIGWIDGEON', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.2', '00:1c:23:b3:07:f6', 'PIGWIDGEON', callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(DATABASE_PATH, callback);
  });

});

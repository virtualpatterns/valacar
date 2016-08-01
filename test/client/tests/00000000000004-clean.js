

var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../library/application');
var Database = require('../library/database');
var Path = require('../../../client/library/path');

var RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');
var LEASES_PATH = Path.join(RESOURCES_PATH, 'dhcpd.leases');

describe('Command.command("clean [databasePath]")', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeImport(LEASES_PATH, callback);
      },
      function(callback) {
        Application.executeClean(callback);
      }
    ], callback);
  });

  it('should have removed the lease for HOST1', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsLease(connection, '192.168.2.29', new Date('2016/04/13 22:25:07 +0000'), new Date('2016/04/14 10:25:07 +0000'), '9c:35:eb:4e:73:4f', 'HOST1', callback);
    }, callback);
  });

  it('should have removed the device for 9c:35:eb:4e:73:4f/HOST1', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsDevice(connection, '9c:35:eb:4e:73:4f', 'HOST1', callback);
    }, callback);
  });

  it('should have not changed the static lease for BUCKBEAK', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.101', 'c8:2a:14:57:bb:1b', 'BUCKBEAK', callback);
    }, callback);
  });

  it('should have not changed the static lease for LOVEGOOD', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.100', '00:22:68:0e:3c:b3', 'LOVEGOOD', callback);
    }, callback);
  });

  it('should have not changed the static lease for PIGWIDGEON', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.2', '00:1c:23:b3:07:f6', 'PIGWIDGEON', callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

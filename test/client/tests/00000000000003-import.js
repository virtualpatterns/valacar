

var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../library/application');
var Database = require('../library/database');
var Path = require('../../../client/library/path');

var RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');
var LEASES_PATH = Path.join(RESOURCES_PATH, 'dhcpd.leases');

describe('Command.command("import [filePath] [databasePath]")', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeImport(LEASES_PATH, callback);
      }
    ], callback);
  });

  it('should have added the lease for HOST1', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsLease(connection, '192.168.2.29', new Date('2016/04/13 22:25:07 +0000'), new Date('2016/04/14 10:25:07 +0000'), '9c:35:eb:4e:73:4f', 'HOST1', callback);
    }, callback);
  });

  it('should have added the device for 9c:35:eb:4e:73:4f/HOST1', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsDevice(connection, '9c:35:eb:4e:73:4f', 'HOST1', callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

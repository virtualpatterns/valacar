'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('tests/library/application');
const Database = require('tests/library/database');
const Path = require('library/path');
const Test = require('test');

const RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');
const LEASES_PATH = Path.join(RESOURCES_PATH, 'dhcpd.leases');

describe('Command.command("import [filePath] [databasePath]")', function() {
  this.timeout(Test.TIMEOUT);

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

  it('should have added the lease for HOST1', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsLease(connection, '192.168.2.29', new Date('2016/04/13 22:25:07 +0000'), new Date('2016/04/14 10:25:07 +0000'), '9c:35:eb:4e:73:4f', 'HOST1', callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('tests/library/application');
const Database = require('tests/library/database');
const Path = require('library/path');
const Test = require('test');

const RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');
const LEASES_PATH = Path.join(RESOURCES_PATH, 'dhcpd.leases');

const HOST1_REGEXP = new RegExp('^.*HOST1.*$', 'm');
const HOST2_REGEXP = new RegExp('^.*HOST2.*$', 'm');
const HOST3_REGEXP = new RegExp('^.*HOST3.*$', 'm');

describe('Command.command("dumpLeases [databasePath]")', function() {
  this.timeout(Test.TIMEOUT);

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeImport(LEASES_PATH, callback);
      },
      function(callback) {
        Database.openConnection(function(connection, callback) {
          Asynchronous.series([
            function(callback) {
              Database.runFile(connection, Path.join(RESOURCES_PATH, 'update-tlease-HOST1.sql'), [], callback);
            },
            function(callback) {
              Database.runFile(connection, Path.join(RESOURCES_PATH, 'update-tlease-HOST2.sql'), [], callback);
            },
            function(callback) {
              Database.runFile(connection, Path.join(RESOURCES_PATH, 'update-tlease-HOST3.sql'), [], callback);
            }
          ], callback);
        }, callback);
      }
    ], callback);
  });

  it('should output the lease for HOST1', function (callback) {
    Application.executeDumpLeases(function(error, stdout, stderr) {
      if (error)
        callback(error);
      else if (!HOST1_REGEXP.test(stdout))
        callback(new Error('The lease for HOST1 is not part of the output.'));
      else
        callback(null);
    });
  });

  it('should not output the lease for HOST2', function (callback) {
    Application.executeDumpLeases(function(error, stdout, stderr) {
      if (error)
        callback(error);
      else if (HOST2_REGEXP.test(stdout))
        callback(new Error('The lease for HOST2 is part of the output.'));
      else
        callback(null);
    });
  });

  it('should not output the lease for HOST3', function (callback) {
    Application.executeDumpLeases(function(error, stdout, stderr) {
      if (error)
        callback(error);
      else if (HOST3_REGEXP.test(stdout))
        callback(new Error('The lease for HOST3 is part of the output.'));
      else
        callback(null);
    });
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

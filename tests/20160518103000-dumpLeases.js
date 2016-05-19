'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('tests/library/application');
const Database = require('tests/library/database');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.%s.%s', Package.name, 'dumpLeases', 'db'));
const DATABASE_OPTIONS = {
  'enableTrace': true,
  'enableProfile': false
};

const TEST_NAME = Path.basename(__filename, '.js');
const RESOURCES_PATH = Path.join(__dirname, TEST_NAME, 'resources');
const LEASES_PATH = Path.join(RESOURCES_PATH, 'dhcpd.leases');

const HOST1_REGEXP = new RegExp('^.*HOST1.*$', 'm');
const HOST2_REGEXP = new RegExp('^.*HOST2.*$', 'm');
const HOST3_REGEXP = new RegExp('^.*HOST3.*$', 'm');

describe('Command.command("dumpLeases [databasePath]")', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(DATABASE_PATH, callback);
      },
      function(callback) {
        Application.executeImport(LEASES_PATH, DATABASE_PATH, callback);
      },
      function(callback) {
        Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
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
    Application.executeDumpLeases(DATABASE_PATH, function(error, stdout, stderr) {
      if (error)
        callback(error);
      else if (!HOST1_REGEXP.test(stdout))
        callback(new Error('The lease for HOST1 is not part of the output.'));
      else
        callback(null);
    });
  });

  it('should not output the lease for HOST2', function (callback) {
    Application.executeDumpLeases(DATABASE_PATH, function(error, stdout, stderr) {
      if (error)
        callback(error);
      else if (HOST2_REGEXP.test(stdout))
        callback(new Error('The lease for HOST2 is part of the output.'));
      else
        callback(null);
    });
  });

  it('should not output the lease for HOST3', function (callback) {
    Application.executeDumpLeases(DATABASE_PATH, function(error, stdout, stderr) {
      if (error)
        callback(error);
      else if (HOST3_REGEXP.test(stdout))
        callback(new Error('The lease for HOST3 is part of the output.'));
      else
        callback(null);
    });
  });

  after(function(callback) {
    Application.executeUninstall(DATABASE_PATH, callback);
  });

});

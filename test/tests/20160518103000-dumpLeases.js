'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('test/library/application');
const Database = require('test/library/database');
const Path = require('library/path');

const RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');
const LEASES_PATH = Path.join(RESOURCES_PATH, 'dhcpd.leases');
const LEASES_HOST4_1_PATH = Path.join(RESOURCES_PATH, 'dhcpd.leases.HOST4.1');
const LEASES_HOST4_2_PATH = Path.join(RESOURCES_PATH, 'dhcpd.leases.HOST4.2');

const REGEXP_HOST1 = /^.*HOST1.*$/m;
const REGEXP_HOST2 = /^.*HOST2.*$/m;
const REGEXP_HOST3 = /^.*HOST3.*$/m;
const REGEXP_HOST4 = /^(.|[\r\n])*HOST4(.|[\r\n])*HOST4(.|[\r\n])*$/m;

describe('Command.command("dumpLeases [databasePath]")', function() {

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
      else if (!REGEXP_HOST1.test(stdout))
        callback(new Error('The lease for HOST1 is not part of the output.'));
      else
        callback(null);
    });
  });

  it('should not output the lease for HOST2', function (callback) {
    Application.executeDumpLeases(function(error, stdout, stderr) {
      if (error)
        callback(error);
      else if (REGEXP_HOST2.test(stdout))
        callback(new Error('The lease for HOST2 is part of the output.'));
      else
        callback(null);
    });
  });

  it('should not output the lease for HOST3', function (callback) {
    Application.executeDumpLeases(function(error, stdout, stderr) {
      if (error)
        callback(error);
      else if (REGEXP_HOST3.test(stdout))
        callback(new Error('The lease for HOST3 is part of the output.'));
      else
        callback(null);
    });
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

describe('Command.command("dumpLeasesWhere <filter> [databasePath]")', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeImport(LEASES_HOST4_1_PATH, callback);
      },
      function(callback) {
        Application.executeImport(LEASES_HOST4_2_PATH, callback);
      }
    ], callback);
  });

  it('should output two leases for HOST4', function (callback) {
    Application.executeDumpLeasesWhere('HOST', function(error, stdout, stderr) {
      if (error)
        callback(error);
      else if (!REGEXP_HOST4.test(stdout))
        callback(new Error('Two leases for HOST4 are not part of the output.'));
      else
        callback(null);
    });
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

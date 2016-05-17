'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('tests/library/application');
const Database = require('tests/library/database');
const Log = require('library/log');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const MigrationError = require('library/errors/migration-error');

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.%s.%s', Package.name, 'uninstall', 'db'));
const DATABASE_OPTIONS = {
  'enableTrace': true,
  'enableProfile': false
};

describe('20160516171700-tlease.uninstall', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(DATABASE_PATH, callback);
      },
      function(callback) {

        let migration = require('library/migrations/20160516171700-tlease');

        Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
          migration.uninstall(connection, callback);
        }, callback);

      }
    ], callback);
  });

  it('should have removed the static lease for JORKINS', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsStaticLease(connection, '192.168.2.201', '08:00:27:66:5c:05', 'JORKINS', callback);
    }, callback);
  });

  it('should have removed the static lease for VANCE', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsStaticLease(connection, '192.168.2.200', '08:00:27:08:67:43', 'VANCE', callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(DATABASE_PATH, callback);
  });

});

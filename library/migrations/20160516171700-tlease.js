'use strict';

const Assert = require('assert');
const Asynchronous = require('async');
const Utilities = require('util');

const Database = require('library/database');
const Migration = require('library/migration');
const Path = require('library/path');

const MIGRATION_NAME = Path.basename(__filename, '.js');
const RESOURCES_PATH = Path.join(__dirname, MIGRATION_NAME, 'resources');

let migration = Migration.createMigration(MIGRATION_NAME);

migration.install = function(connection, callback) {
  Asynchronous.series([
    function(callback) {
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tlease-JORKINS.sql'), {
        $From: Database.MINIMUM_DATE.toISOString(),
        $To: Database.MINIMUM_DATE.toISOString()
      }, callback);
    },
    function(callback) {
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tlease-VANCE.sql'), {
        $From: Database.MINIMUM_DATE.toISOString(),
        $To: Database.MINIMUM_DATE.toISOString()
      }, callback);
    }
  ], callback);
};

migration.uninstall = function(connection, callback) {
  Asynchronous.series([
    function(callback) {
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease-VANCE.sql'), {
        $From: Database.MINIMUM_DATE.toISOString(),
        $To: Database.MINIMUM_DATE.toISOString()
      }, function(error) {
        if (!error)
          Assert.ok(this.changes <= 1, Utilities.format('The number of rows deleted from tLease should be 0 or 1 but is instead %d.', this.changes));
        callback(error);
      });
    },
    function(callback) {
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease-JORKINS.sql'), {
        $From: Database.MINIMUM_DATE.toISOString(),
        $To: Database.MINIMUM_DATE.toISOString()
      }, function(error) {
        if (!error)
          Assert.ok(this.changes <= 1, Utilities.format('The number of rows deleted from tLease should be 0 or 1 but is instead %d.', this.changes));
        callback(error);
      });
    },
  ], callback);
};

module.exports = migration;

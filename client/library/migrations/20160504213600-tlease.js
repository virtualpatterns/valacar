

var Asynchronous = require('async');

var Database = require('../database');
var Migration = require('../migration');
var Path = require('../path');

var MIGRATION_NAME = Path.basename(__filename, '.js');
var RESOURCES_PATH = Path.join(__dirname, MIGRATION_NAME, 'resources');

var migration = Migration.createMigration(MIGRATION_NAME);

migration.install = function(connection, callback) {
  Asynchronous.series([
    function(callback) {
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'create-tlease.sql'), [], callback);
    },
    function(callback) {
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tlease-BUCKBEAK.sql'), {
        $From: Database.MINIMUM_DATE.toISOString(),
        $To: Database.MINIMUM_DATE.toISOString()
      }, callback);
    },
    function(callback) {
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tlease-LOVEGOOD.sql'), {
        $From: Database.MINIMUM_DATE.toISOString(),
        $To: Database.MINIMUM_DATE.toISOString()
      }, callback);
    },
    function(callback) {
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tlease-PIGWIDGEON.sql'), {
        $From: Database.MINIMUM_DATE.toISOString(),
        $To: Database.MINIMUM_DATE.toISOString()
      }, callback);
    }
  ], callback);
};

migration.uninstall = function(connection, callback) {
  Database.runFile(connection, Path.join(RESOURCES_PATH, 'drop-tlease.sql'), [], callback);
};

module.exports = migration;

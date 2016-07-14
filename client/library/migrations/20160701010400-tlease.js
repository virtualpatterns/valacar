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
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tlease-34:a3:95:8a:71:ef.sql'), [], callback);
    },
    function(callback) {
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tlease-90:b6:86:6c:c4:e2.sql'), [], callback);
    }
  ], callback);
};

migration.uninstall = function(connection, callback) {
  Asynchronous.series([
    function(callback) {
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease-90:b6:86:6c:c4:e2.sql'), [], callback);
    },
    function(callback) {
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tlease-34:a3:95:8a:71:ef.sql'), [], callback);
    }
  ], callback);
};

module.exports = migration;

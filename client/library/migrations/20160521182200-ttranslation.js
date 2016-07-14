

var Assert = require('assert');
var Utilities = require('util');

var Database = require('../database');
var Migration = require('../migration');
var Path = require('../path');

var MIGRATION_NAME = Path.basename(__filename, '.js');
var RESOURCES_PATH = Path.join(__dirname, MIGRATION_NAME, 'resources');

var migration = Migration.createMigration(MIGRATION_NAME);

migration.install = function(connection, callback) {
  Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-ttranslation-tv4622148de6a5.sql'), [], callback);
};

migration.uninstall = function(connection, callback) {
  Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-ttranslation-tv4622148de6a5.sql'), [], callback);
};

module.exports = migration;

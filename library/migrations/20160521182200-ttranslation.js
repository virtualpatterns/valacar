'use strict';

const Assert = require('assert');
const Utilities = require('util');

const Database = require('library/database');
const Migration = require('library/migration');
const Path = require('library/path');

const MIGRATION_NAME = Path.basename(__filename, '.js');
const RESOURCES_PATH = Path.join(__dirname, MIGRATION_NAME, 'resources');

let migration = Migration.createMigration(MIGRATION_NAME);

migration.install = function(connection, callback) {
  Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-ttranslation-tv4622148de6a5.sql'), [], callback);
};

migration.uninstall = function(connection, callback) {
  Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-ttranslation-tv4622148de6a5.sql'), [], callback);
};

module.exports = migration;

'use strict';

const Package = require('package.json');
const Utilities = require('util');

const Database = require('library/database');
const Migration = require('library/migration');
const Path = require('library/path');

const MIGRATION_NAME = Path.basename(__filename, '.js');
const RESOURCES_PATH = Path.join(__dirname, MIGRATION_NAME, 'resources');

let migration = Migration.createMigration(MIGRATION_NAME);

migration.preInstall = function(connection, callback) {
  callback();
};

migration.install = function(connection, callback) {
  Database.runFile(connection, Path.join(RESOURCES_PATH, 'create-tmigration.sql'), [], callback);
};

migration.postInstall = function(connection, callback) {
  Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tmigration.sql'), {
    $Name: this.name,
    $Version: Package.version
  }, callback);
};

migration.preUninstall = function(connection, callback) {
  callback();
};

migration.uninstall = function(connection, callback) {
  Database.getFile(connection, Path.join(RESOURCES_PATH, 'select-tmigration-count.sql'), {
    $Name: this.name
  }, function(error, row) {
    if (error)
      callback(error);
    else if (row.cCountOfMigrations > 0)
      callback(new Error('The tMigration table cannot be uninstalled until all migrations are uninstalled.'));
    else
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'drop-tmigration.sql'), [], callback);
  });
};

migration.postUninstall = function(connection, callback) {
  callback();
};

migration.isInstalled = function(connection, callback) {
  Database.getFile(connection, Path.join(RESOURCES_PATH, 'exists-tmigration.sql'), [], function(error, row) {
    if (error)
      callback(error);
    else
      callback(error, row == undefined ? false : true);
  });
};

module.exports = migration;

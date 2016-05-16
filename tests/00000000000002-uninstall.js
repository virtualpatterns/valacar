'use strict';

const Asynchronous = require('async');
const ChildProcess = require('child_process');
const Utilities = require('util');

const Application = require('library/application');
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

// describe('Application.uninstall', function() {
//
//   before(function(callback) {
//     Asynchronous.series([
//       function(callback) {
//         Application.install(DATABASE_PATH, DATABASE_OPTIONS, callback);
//       },
//       function(callback) {
//         Application.uninstall(DATABASE_PATH, DATABASE_OPTIONS, callback);
//       }
//     ], callback);
//   });
//
// });

describe('Command.command("uninstall [databasePath]")', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Log.info('> node index.js install --enableTrace %j', Path.trim(DATABASE_PATH));
        ChildProcess.exec(Utilities.format('node index.js install --enableTrace %j', DATABASE_PATH), {
          'cwd': Process.cwd(),
          'env': Process.env
        }, callback);
      },
      function(callback) {
        Log.info('> node index.js uninstall --enableTrace %j', Path.trim(DATABASE_PATH));
        ChildProcess.exec(Utilities.format('node index.js uninstall --enableTrace %j', DATABASE_PATH), {
          'cwd': Process.cwd(),
          'env': Process.env
        }, callback);
      }
    ], callback);
  });

  it('should have dropped the tLease table', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsTable(connection, 'tLease', callback);
    }, callback);
  });

  it('should have dropped the tVersion table', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsTable(connection, 'tVersion', callback);
    }, callback);
  });

  it('should have dropped the tMigration table', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsTable(connection, 'tMigration', callback);
    }, callback);
  });

});

describe('Migration.uninstall', function() {

  before(function(callback) {
    Application.install(DATABASE_PATH, DATABASE_OPTIONS, callback);
  });

  it('should generate a MigrationError if 00000000000000-tmigration alone is uninstalled', function (callback) {

    let migration = require('library/migrations/00000000000000-tmigration');

    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      migration.uninstall(connection, function(error) {
        if (!error)
          callback(new Error('The migration 00000000000000-tmigration alone was uninstalled but did not generate a MigrationError.'));
        else if (!(error instanceof MigrationError))
          callback(new Error(Utilities.format('The migration 00000000000000-tmigration alone was uninstalled but the generated error (%s) is the wrong type.', error)));
        else
          callback(null);
      });
    }, callback);


  });

  after(function(callback) {
    Application.uninstall(DATABASE_PATH, DATABASE_OPTIONS, callback);
  });

});

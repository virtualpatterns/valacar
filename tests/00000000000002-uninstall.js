'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('tests/library/application');
const Database = require('tests/library/database');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const MigrationError = require('library/errors/migration-error');

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.%s.%s', Package.name, 'uninstall', 'db'));
const DATABASE_OPTIONS = {
  'enableTrace': true,
  'enableProfile': false
};

describe('Command.command("uninstall [databasePath]")', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(DATABASE_PATH, callback);
      },
      function(callback) {
        Application.executeUninstall(DATABASE_PATH, callback);
      }
    ], callback);
  });

  it('should have dropped the tTranslation table', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsTable(connection, 'tTranslation', callback);
    }, callback);
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

describe('00000000000000-tmigration.uninstall', function() {

  before(function(callback) {
    Application.executeInstall(DATABASE_PATH, callback);
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
    Application.executeUninstall(DATABASE_PATH, callback);
  });

});

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

describe('20160517132700-ttranslation.uninstall', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(DATABASE_PATH, callback);
      },
      function(callback) {

        let migration = require('library/migrations/20160517132700-ttranslation');

        Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
          migration.uninstall(connection, callback);
        }, callback);

      }
    ], callback);
  });

  it('should have removed the translation for 02AA01AB44120TQ1', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsTranslation(connection, '02AA01AB44120TQ1', '(Nest)', callback);
    }, callback);
  });

  it('should have removed the translation for 18:b4:30:21:c4:45', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsTranslation(connection, '18:b4:30:21:c4:45', '(Nest Protect)', callback);
    }, callback);
  });

  it('should have removed the translation for aragog', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsTranslation(connection, 'aragog', '(Bell Connection Hub)', callback);
    }, callback);
  });

  it('should have removed the translation for FLITWICK.local', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsTranslation(connection, 'FLITWICK.local', 'FLITWICK', callback);
    }, callback);
  });

  it('should have removed the translation for Jefs-iPad', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsTranslation(connection, 'Jefs-iPad', '(Jeffy\'s iPad)', callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(DATABASE_PATH, callback);
  });

});

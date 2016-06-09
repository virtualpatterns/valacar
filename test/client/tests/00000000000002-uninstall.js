'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('../library/application');
const Database = require('../library/database');

const MigrationError = require('../../../client/library/errors/migration-error');

describe('Command.command("uninstall [databasePath]")', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeUninstall(callback);
      }
    ], callback);
  });

  it('should have dropped the tTranslation table', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsTable(connection, 'tTranslation', callback);
    }, callback);
  });

  it('should have dropped the tLease table', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsTable(connection, 'tLease', callback);
    }, callback);
  });

  it('should have dropped the tVersion table', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsTable(connection, 'tVersion', callback);
    }, callback);
  });

  it('should have dropped the tMigration table', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsTable(connection, 'tMigration', callback);
    }, callback);
  });

});

describe('00000000000000-tmigration.uninstall', function() {

  before(function(callback) {
    Application.executeInstall(callback);
  });

  it('should generate a MigrationError if 00000000000000-tmigration alone is uninstalled', function(callback) {

    let migration = require('../../../client/library/migrations/00000000000000-tmigration');

    Database.openConnection(function(connection, callback) {
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
    Application.executeUninstall(callback);
  });

});

describe('20160516171700-tlease.uninstall', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {

        let migration = require('../../../client/library/migrations/20160516171700-tlease');

        Database.openConnection(function(connection, callback) {
          migration.uninstall(connection, callback);
        }, callback);

      }
    ], callback);
  });

  it('should have removed the static lease for JORKINS', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsStaticLease(connection, '192.168.2.201', '08:00:27:66:5c:05', 'JORKINS', callback);
    }, callback);
  });

  it('should have removed the static lease for VANCE', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsStaticLease(connection, '192.168.2.200', '08:00:27:08:67:43', 'VANCE', callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

describe('20160517132700-ttranslation.uninstall', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {

        let migration = require('../../../client/library/migrations/20160517132700-ttranslation');

        Database.openConnection(function(connection, callback) {
          migration.uninstall(connection, callback);
        }, callback);

      }
    ], callback);
  });

  it('should have removed the translation for 02AA01AB44120TQ1', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsTranslation(connection, '02AA01AB44120TQ1', '(Nest)', callback);
    }, callback);
  });

  it('should have removed the translation for 18:b4:30:21:c4:45', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsTranslation(connection, '18:b4:30:21:c4:45', '(Nest Protect)', callback);
    }, callback);
  });

  it('should have removed the translation for aragog', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsTranslation(connection, 'aragog', '(Bell Connection Hub)', callback);
    }, callback);
  });

  it('should have removed the translation for FLITWICK.local', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsTranslation(connection, 'FLITWICK.local', 'FLITWICK', callback);
    }, callback);
  });

  it('should have removed the translation for Jefs-iPad', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsTranslation(connection, 'Jefs-iPad', '(Jeffy\'s iPad)', callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

describe('20160521182200-ttranslation.uninstall', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {

        let migration = require('../../../client/library/migrations/20160521182200-ttranslation');

        Database.openConnection(function(connection, callback) {
          migration.uninstall(connection, callback);
        }, callback);

      }
    ], callback);
  });

  it('should have removed the translation for tv4622148de6a5', function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsTranslation(connection, 'tv4622148de6a5', '(TV)', callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

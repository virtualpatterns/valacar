'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('tests/library/application');
const Database = require('tests/library/database');
const Log = require('library/log');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const ValidationError = require('library/errors/validation-error');

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.%s.%s', Package.name, 'addTranslation', 'db'));
const DATABASE_OPTIONS = {
  'enableTrace': true,
  'enableProfile': false
};

const VALID_FROM = '01:ab:23:cd:45:ef';
const INVALID_FROM = '@1:ab:23:cd:45:ef';
const VALID_TO = '(ABC)';

describe('Application.validateAddTranslation', function() {

  it('should not generate an error for a valid translation', function (callback) {
    Application.validateAddTranslation(VALID_FROM, callback);
  });

  it('should generate a ValidationError for an invalid translation', function (callback) {
    Application.validateAddTranslation(INVALID_FROM, function(error) {
      if (!error)
        callback(new Error(Utilities.format('The translation from %j is invalid but did not generate a ValidationError.', INVALID_FROM)));
      else if (!(error instanceof ValidationError))
        callback(new Error(Utilities.format('The translation from %j is invalid but the generated error (%s) is the wrong type.', INVALID_FROM, error.name)));
      else
        callback(null);
    });
  });

});

describe('Command.command("addTranslation <from> <to> [databasePath]")', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(DATABASE_PATH, callback);
      },
      function(callback) {
        Application.executeAddTranslation(VALID_FROM, VALID_TO, DATABASE_PATH, callback);
      }
    ], callback);
  });

  it(Utilities.format('should have added the translation from %j to %j', VALID_FROM, VALID_TO), function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.existsTranslation(connection, VALID_FROM, VALID_TO, callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(DATABASE_PATH, callback);
  });

});

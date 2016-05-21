'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('tests/library/application');
const Database = require('tests/library/database');
const Test = require('test');

const ValidationError = require('library/errors/validation-error');

const VALID_FROM = '01:ab:23:cd:45:ef';
const INVALID_FROM = '@1:ab:23:cd:45:ef';
const VALID_TO = '(ABC)';

describe('Application.validateAddTranslation', function() {
  this.timeout(Test.TIMEOUT);

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
  this.timeout(Test.TIMEOUT);

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeAddTranslation(VALID_FROM, VALID_TO, callback);
      }
    ], callback);
  });

  it(Utilities.format('should have added the translation from %j to %j', VALID_FROM, VALID_TO), function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsTranslation(connection, VALID_FROM, VALID_TO, callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

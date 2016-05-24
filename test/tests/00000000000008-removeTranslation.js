'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('test/library/application');
const Database = require('test/library/database');

const ValidationError = require('library/errors/validation-error');

const VALID_FROM = '01:ab:23:cd:45:ef';
const INVALID_FROM = '@1:ab:23:cd:45:ef';
const VALID_TO = '(ABC)';

describe('Application.validateRemoveTranslation', function() {

  it('should not generate an error for a valid translation', function (callback) {
    Application.validateRemoveTranslation(VALID_FROM, callback);
  });

  it('should generate a ValidationError for an invalid translation', function (callback) {
    Application.validateRemoveTranslation(INVALID_FROM, function(error) {
      if (!error)
        callback(new Error(Utilities.format('The translation from %j is invalid but did not generate a ValidationError.', INVALID_FROM)));
      else if (!(error instanceof ValidationError))
        callback(new Error(Utilities.format('The translation from %j is invalid but the generated error (%s) is the wrong type.', INVALID_FROM, error)));
      else
        callback(null);
    });
  });


});

describe('Command.command("removeTranslation <from> [databasePath]")', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeAddTranslation(VALID_FROM, VALID_TO, callback);
      },
      function(callback) {
        Application.executeRemoveTranslation(VALID_FROM, callback);
      }
    ], callback);
  });

  it(Utilities.format('should have removed the translation from %j', VALID_FROM), function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsTranslation(connection, VALID_FROM, VALID_TO, callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

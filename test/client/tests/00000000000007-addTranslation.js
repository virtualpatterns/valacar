

var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../library/application');
var Database = require('../library/database');

var ValidationError = require('../../../client/library/errors/validation-error');

var VALID_FROM = '01:ab:23:cd:45:ef';
var INVALID_FROM = '@1:ab:23:cd:45:ef';
var VALID_TO = '( ABC\'123.123 )';
var INVALID_TO = '                                         ';

describe.only('Application.validateAddTranslation', function() {

  it('should not generate an error for a valid translation', function(callback) {
    Application.validateAddTranslation(VALID_FROM, VALID_TO, callback);
  });

  it('should generate a ValidationError for an invalid translation from', function(callback) {
    Application.validateAddTranslation(INVALID_FROM, VALID_TO, function(error) {
      if (!error)
        callback(new Error(Utilities.format('The translation from %j is invalid but did not generate a ValidationError.', INVALID_FROM)));
      else if (!(error instanceof ValidationError))
        callback(new Error(Utilities.format('The translation from %j is invalid but the generated error (%s) is the wrong type.', INVALID_FROM, error.name)));
      else
        callback(null);
    });
  });

  it('should generate a ValidationError for an invalid translation to', function(callback) {
    Application.validateAddTranslation(VALID_FROM, INVALID_TO, function(error) {
      if (!error)
        callback(new Error(Utilities.format('The translation to %j is invalid but did not generate a ValidationError.', INVALID_TO)));
      else if (!(error instanceof ValidationError))
        callback(new Error(Utilities.format('The translation to %j is invalid but the generated error (%s) is the wrong type.', INVALID_TO, error.name)));
      else
        callback(null);
    });
  });

});

describe('Command.command("addTranslation <from> <to> [databasePath]")', function() {

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

  it(Utilities.format('should have added the translation from %j to %j', VALID_FROM, VALID_TO), function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsTranslation(connection, VALID_FROM, VALID_TO, callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

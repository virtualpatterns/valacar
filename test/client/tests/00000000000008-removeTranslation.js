

var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../library/application');
var Database = require('../library/database');

var ValidationError = require('../../../client/library/errors/validation-error');

var VALID_FROM = '01:ab:23:cd:45:ef';
var INVALID_FROM = '@1:ab:23:cd:45:ef';
var VALID_TO = '(ABC)';

describe('Application.validateRemoveTranslation', function() {

  it('should not generate an error for a valid translation', function(callback) {
    Application.validateRemoveTranslation(VALID_FROM, callback);
  });

  it('should generate a ValidationError for an invalid translation', function(callback) {
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

  it(Utilities.format('should have removed the translation from %j', VALID_FROM), function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsTranslation(connection, VALID_FROM, VALID_TO, callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

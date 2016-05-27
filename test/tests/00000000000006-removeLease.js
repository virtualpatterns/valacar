'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('../library/application');
const Database = require('../library/database');

const ValidationError = require('../../library/errors/validation-error');

const VALID_ADDRESS = '1.2.3.4';
const INVALID_ADDRESS = 'a.b.c.d';
const VALID_DEVICE = '01:ab:23:cd:45:ef';
const VALID_HOST = 'ABC';

describe('Application.validateRemoveLease', function() {

  it('should not generate an error for a valid address', function (callback) {
    Application.validateRemoveLease(VALID_ADDRESS, callback);
  });

  it('should generate a ValidationError for an invalid address', function (callback) {
    Application.validateRemoveLease(INVALID_ADDRESS, function(error) {
      if (!error)
        callback(new Error(Utilities.format('The address %j is invalid but did not generate a ValidationError.', INVALID_ADDRESS)));
      else if (!(error instanceof ValidationError))
        callback(new Error(Utilities.format('The address %j is invalid but the generated error (%s) is the wrong type.', INVALID_ADDRESS, error)));
      else
        callback(null);
    });
  });


});

describe('Command.command("removeLease <IPAddress> [databasePath]")', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeAddLease(VALID_ADDRESS, VALID_DEVICE, VALID_HOST, callback);
      },
      function(callback) {
        Application.executeRemoveLease(VALID_ADDRESS, callback);
      }
    ], callback);
  });

  it(Utilities.format('should have removed the static lease %j', VALID_ADDRESS), function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.notExistsStaticLease(connection, VALID_ADDRESS, VALID_DEVICE, VALID_HOST, callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

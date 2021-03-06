

var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../library/application');
var Database = require('../library/database');

var ValidationError = require('../../../client/library/errors/validation-error');

var VALID_ADDRESS = '1.2.3.4';
var INVALID_ADDRESS = 'a.b.c.d';
var VALID_DEVICE = '01:ab:23:cd:45:ef';
var INVALID_DEVICE = '67:gh:89:ij:01:kl';
var VALID_HOST = 'ABC';
var INVALID_HOST = '@ABC';

describe('Application.validateAddLease', function() {

  it('should not generate an error for a valid address, device, and host', function(callback) {
    Application.validateAddLease(VALID_ADDRESS, VALID_DEVICE, VALID_HOST, callback);
  });

  it('should generate a ValidationError for an invalid address', function(callback) {
    Application.validateAddLease(INVALID_ADDRESS, VALID_DEVICE, VALID_HOST, function(error) {
      if (!error)
        callback(new Error(Utilities.format('The address %j is invalid but did not generate a ValidationError.', INVALID_ADDRESS)));
      else if (!(error instanceof ValidationError))
        callback(new Error(Utilities.format('The address %j is invalid but the generated error (%s) is the wrong type.', INVALID_ADDRESS, error)));
      else
        callback(null);
    });
  });

  it('should generate a ValidationError for an invalid device', function(callback) {
    Application.validateAddLease(VALID_ADDRESS, INVALID_DEVICE, VALID_HOST, function(error) {
      if (!error)
        callback(new Error(Utilities.format('The device %j is invalid but did not generate a ValidationError.', INVALID_DEVICE)));
      else if (!(error instanceof ValidationError))
        callback(new Error(Utilities.format('The device %j is invalid but the generated error (%s) is the wrong type.', INVALID_DEVICE, error.name)));
      else
        callback(null);
    });
  });

  it('should generate a ValidationError for an invalid host', function(callback) {
    Application.validateAddLease(VALID_ADDRESS, VALID_DEVICE, INVALID_HOST, function(error) {
      if (!error)
        callback(new Error(Utilities.format('The host %j is invalid but did not generate a ValidationError.', INVALID_HOST)));
      else if (!(error instanceof ValidationError))
        callback(new Error(Utilities.format('The host %j is invalid but the generated error (%s) is the wrong type.', INVALID_HOST, error.name)));
      else
        callback(null);
    });
  });

});

describe('Command.command("addLease <IPAddress> <MACAddress> <hostName> [databasePath]")', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeAddLease(VALID_ADDRESS, VALID_DEVICE, VALID_HOST, callback);
      }
    ], callback);
  });

  it(Utilities.format('should have added the static lease %j', VALID_ADDRESS), function(callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsStaticLease(connection, VALID_ADDRESS, VALID_DEVICE, VALID_HOST, callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

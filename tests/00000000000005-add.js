'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('library/application');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const Database = require('tests/library/database');

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.%s.%s', Package.name, 'add', 'db'));
const DATABASE_OPTIONS = {
  'enableTrace': true,
  'enableProfile': false
};

const VALID_ADDRESS = '1.2.3.4';
const INVALID_ADDRESS = 'a.b.c.d';
const VALID_DEVICE = '01:ab:23:cd:45:ef';
const INVALID_DEVICE = '67:gh:89:ij:01:kl';
const VALID_HOST = 'ABC';
const INVALID_HOST = '@ABC';

describe('Application.validateAdd', function() {

  it('should generate no error for a valid address, device, and host', function (callback) {
    Application.validateAdd(VALID_ADDRESS, VALID_DEVICE, VALID_HOST, function(error) {
      if (error)
        callback(new Error(Utilities.format('One or more of the address, device, and host %j, %j, and %j are invalid.', VALID_ADDRESS, VALID_DEVICE, VALID_HOST)));
      else
        callback(null);
    });
  });

  it('should generate an error for an invalid address', function (callback) {
    Application.validateAdd(INVALID_ADDRESS, VALID_DEVICE, VALID_HOST, function(error) {
      if (!error)
        callback(new Error(Utilities.format('The address %j is valid.', INVALID_ADDRESS)));
      else
        callback(null);
    });
  });

  it('should generate an error for an invalid device', function (callback) {
    Application.validateAdd(VALID_ADDRESS, INVALID_DEVICE, VALID_HOST, function(error) {
      if (!error)
        callback(new Error(Utilities.format('The device %j is valid.', INVALID_DEVICE)));
      else
        callback(null);
    });
  });

  it('should generate an error for an invalid host', function (callback) {
    Application.validateAdd(VALID_ADDRESS, VALID_DEVICE, INVALID_HOST, function(error) {
      if (!error)
        callback(new Error(Utilities.format('The host %j is valid.', INVALID_HOST)));
      else
        callback(null);
    });
  });

});

describe('Application.add', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.install(DATABASE_PATH, DATABASE_OPTIONS, callback);
      },
      function(callback) {
        Application.add(VALID_ADDRESS, VALID_DEVICE, VALID_HOST, DATABASE_PATH, DATABASE_OPTIONS, callback);
      }
    ], callback);
  });

  it(Utilities.format('should have added the static lease %j', VALID_ADDRESS), function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.existsStaticLease(connection, VALID_ADDRESS, VALID_DEVICE, VALID_HOST, callback);
    }, callback);
  });

  after(function(callback) {
    Application.uninstall(DATABASE_PATH, DATABASE_OPTIONS, callback);
  });

});

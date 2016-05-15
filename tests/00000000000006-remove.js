'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('library/application');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const Database = require('tests/library/database');

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.%s.%s', Package.name, 'remove', 'db'));
const DATABASE_OPTIONS = {
  'enableTrace': true,
  'enableProfile': false
};

const VALID_ADDRESS = '1.2.3.4';
const INVALID_ADDRESS = 'a.b.c.d';
const VALID_DEVICE = '01:ab:23:cd:45:ef';
const VALID_HOST = 'ABC';

describe('Application.validateRemove', function() {

  it('should generate no error for a valid address', function (callback) {
    Application.validateRemove(VALID_ADDRESS, function(error) {
      if (error)
        callback(new Error(Utilities.format('The address %j is invalid.', VALID_ADDRESS)));
      else
        callback(null);
    });
  });

  it('should generate an error for an invalid address', function (callback) {
    Application.validateRemove(INVALID_ADDRESS, function(error) {
      if (!error)
        callback(new Error(Utilities.format('The address %j is valid.', INVALID_ADDRESS)));
      else
        callback(null);
    });
  });

});

describe('Application.remove', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.install(DATABASE_PATH, DATABASE_OPTIONS, callback);
      },
      function(callback) {
        Application.add(VALID_ADDRESS, VALID_DEVICE, VALID_HOST, DATABASE_PATH, DATABASE_OPTIONS, callback);
      },
      function(callback) {
        Application.remove(VALID_ADDRESS, DATABASE_PATH, DATABASE_OPTIONS, callback);
      }
    ], callback);
  });

  it(Utilities.format('should have removed the static lease %j', VALID_ADDRESS), function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsStaticLease(connection, VALID_ADDRESS, VALID_DEVICE, VALID_HOST, callback);
    }, callback);
  });

  after(function(callback) {
    Application.uninstall(DATABASE_PATH, DATABASE_OPTIONS, callback);
  });

});

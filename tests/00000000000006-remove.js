'use strict';

const Asynchronous = require('async');
const ChildProcess = require('child_process');
const Utilities = require('util');

const Application = require('library/application');
const Database = require('tests/library/database');
const Log = require('library/log');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const ValidationError = require('library/errors/validation-error');

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

  it('should not generate an error for a valid address', function (callback) {
    Application.validateRemove(VALID_ADDRESS, callback);
  });

  it('should generate a ValidationError for an invalid address', function (callback) {
    Application.validateRemove(INVALID_ADDRESS, function(error) {
      if (!error)
        callback(new Error(Utilities.format('The address %j is invalid but did not generate a ValidationError.', INVALID_ADDRESS)));
      else if (!(error instanceof ValidationError))
        callback(new Error(Utilities.format('The address %j is invalid but the generated error (%s) is the wrong type.', INVALID_ADDRESS, error)));
      else
        callback(null);
    });
  });


});

// describe('Application.remove', function() {
//
//   before(function(callback) {
//     Asynchronous.series([
//       function(callback) {
//         Application.install(DATABASE_PATH, DATABASE_OPTIONS, callback);
//       },
//       function(callback) {
//         Application.add(VALID_ADDRESS, VALID_DEVICE, VALID_HOST, DATABASE_PATH, DATABASE_OPTIONS, callback);
//       },
//       function(callback) {
//         Application.remove(VALID_ADDRESS, DATABASE_PATH, DATABASE_OPTIONS, callback);
//       }
//     ], callback);
//   });
//
//   after(function(callback) {
//     Application.uninstall(DATABASE_PATH, DATABASE_OPTIONS, callback);
//   });
//
// });

describe('Command.command("remove <IPAddress> [databasePath]")', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Log.info('> node index.js install --enableTrace %j', Path.trim(DATABASE_PATH));
        ChildProcess.exec(Utilities.format('node index.js install --enableTrace %j', DATABASE_PATH), {
          'cwd': Process.cwd(),
          'env': Process.env
        }, callback);
      },
      function(callback) {
        Log.info('> node index.js add --enableTrace %j %j %j %j', VALID_ADDRESS, VALID_DEVICE, VALID_HOST, Path.trim(DATABASE_PATH));
        ChildProcess.exec(Utilities.format('node index.js add --enableTrace %j %j %j %j', VALID_ADDRESS, VALID_DEVICE, VALID_HOST, DATABASE_PATH), {
          'cwd': Process.cwd(),
          'env': Process.env
        }, callback);
      },
      function(callback) {
        Log.info('> node index.js remove --enableTrace %j %j', VALID_ADDRESS, Path.trim(DATABASE_PATH));
        ChildProcess.exec(Utilities.format('node index.js remove --enableTrace %j %j', VALID_ADDRESS, DATABASE_PATH), {
          'cwd': Process.cwd(),
          'env': Process.env
        }, callback);
      }
    ], callback);
  });

  it(Utilities.format('should have removed the static lease %j', VALID_ADDRESS), function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsStaticLease(connection, VALID_ADDRESS, VALID_DEVICE, VALID_HOST, callback);
    }, callback);
  });

  after(function(callback) {
    Log.info('> node index.js uninstall --enableTrace %j', Path.trim(DATABASE_PATH));
    ChildProcess.exec(Utilities.format('node index.js uninstall --enableTrace %j', DATABASE_PATH), {
      'cwd': Process.cwd(),
      'env': Process.env
    }, callback);
  });

});

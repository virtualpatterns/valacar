'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('library/application');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const Database = require('tests/library/database');

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.%s.%s', Package.name, 'uninstall', 'db'));
const DATABASE_OPTIONS = {
  'enableTrace': true,
  'enableProfile': false
};

describe('Application.uninstall', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.install(DATABASE_PATH, DATABASE_OPTIONS, callback);
      },
      function(callback) {
        Application.uninstall(DATABASE_PATH, DATABASE_OPTIONS, callback);
      }
    ], callback);
  });

  it('should have dropped the tLease table', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsTable(connection, 'tLease', callback);
    }, callback);
  });

  it('should have dropped the tVersion table', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsTable(connection, 'tVersion', callback);
    }, callback);
  });

  it('should have dropped the tMigration table', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.notExistsTable(connection, 'tMigration', callback);
    }, callback);
  });

});

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

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.%s.%s', Package.name, 'install', 'db'));
const DATABASE_OPTIONS = {
  'enableTrace': true,
  'enableProfile': false
};

// describe('Application.install', function() {
//
//   before(function(callback) {
//     Application.install(DATABASE_PATH, DATABASE_OPTIONS, callback);
//   });
//
//   after(function(callback) {
//     Application.uninstall(DATABASE_PATH, DATABASE_OPTIONS, callback);
//   });
//
// });

describe('20160516171700-tlease.install', function() {

  before(function(callback) {
    Log.info('> node index.js install --enableTrace %j', Path.trim(DATABASE_PATH));
    ChildProcess.exec(Utilities.format('node index.js install --enableTrace %j', DATABASE_PATH), {
      'cwd': Process.cwd(),
      'env': Process.env
    }, callback);
  });

  it('should have added a static lease for JORKINS', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.201', '08:00:27:66:5c:05', 'JORKINS', callback);
    }, callback);
  });

  it('should have added a static lease for VANCE', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.200', '08:00:27:08:67:43', 'VANCE', callback);
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

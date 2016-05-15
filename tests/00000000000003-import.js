'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('library/application');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const Database = require('tests/library/database');

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.%s.%s', Package.name, 'import', 'db'));
const DATABASE_OPTIONS = {
  'enableTrace': true,
  'enableProfile': false
};

const RESOURCES_PATH = Path.join(__dirname, 'resources');
const LEASES_PATH = Path.join(RESOURCES_PATH, 'dhcpd.leases');

describe('Application.import', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.install(DATABASE_PATH, DATABASE_OPTIONS, callback);
      },
      function(callback) {
        Application.import(LEASES_PATH, DATABASE_PATH, DATABASE_OPTIONS, callback);
      }
    ], callback);
  });

  it('should have added a lease for HOST1', function (callback) {
    Database.openConnection(DATABASE_PATH, DATABASE_OPTIONS, function(connection, callback) {
      Database.existsLease(connection, '192.168.2.29', new Date('2016/04/13 22:25:07 +0000'), new Date('2016/04/14 10:25:07 +0000'), '9c:35:eb:4e:73:4f', 'HOST1', callback);
    }, callback);
  });

  after(function(callback) {
    Application.uninstall(DATABASE_PATH, DATABASE_OPTIONS, callback);
  });

});

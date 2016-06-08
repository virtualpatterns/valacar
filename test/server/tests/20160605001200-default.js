'use strict';

const Asynchronous = require('async');

const Application = require('../library/application');
const Database = require('../library/database');

describe('GET /', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeStart(callback);
      },
      function(callback) {
        Application.waitReady(callback);
      }
    ], callback);
  });

  it('should respond to GET / with a name', function(callback) {
    Application.isGET('/', function(statusCode, headers, data, callback) {
      callback(null, data.name);
    }, callback);
  });

  it('should respond to GET / with a version', function(callback) {
    Application.isGET('/', function(statusCode, headers, data, callback) {
      callback(null, data.version);
    }, callback);
  });

  it('should respond to GET / with a database path', function(callback) {
    Application.isGET('/', function(statusCode, headers, data, callback) {
      callback(null, data.databasePath);
    }, callback);
  });

  after(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeStop(callback);
      },
      function(callback) {
        Application.waitNotReady(callback);
      },
      function(callback) {
        Application.executeUninstall(callback);
      }
    ], callback);
  });

});

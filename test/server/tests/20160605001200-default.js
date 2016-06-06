'use strict';

const Asynchronous = require('async');

const Application = require('../library/application');
const Database = require('../library/database');

const PAUSE = 5000;

describe('GET /', function() {
 this.timeout(PAUSE * 2);

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeStart(callback);
      }
    ], callback);
  });

  it('should respond to GET / with a name', function(callback) {
    Application.GET('/', function(error, statusCode, headers, data) {
      if (error)
        callback(error);
      else {
        if (!data.name)
          callback(new Error('The server responded to GET / but did not respond with a name.'));
        else
          callback(null);
      }
    });
  });

  it('should respond to GET / with a version', function(callback) {
    Application.GET('/', function(error, statusCode, headers, data) {
      if (error)
        callback(error);
      else {
        if (!data.version)
          callback(new Error('The server responded to GET / but did not respond with a version.'));
        else
          callback(null);
      }
    });
  });

  it('should respond to GET / with a database path', function(callback) {
    Application.GET('/', function(error, statusCode, headers, data) {
      if (error)
        callback(error);
      else {
        if (!data.databasePath)
          callback(new Error('The server responded to GET / but did not respond with a database path.'));
        else
          callback(null);
      }
    });
  });

  after(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeStop(callback);
      },
      function(callback) {
        Application.executeUninstall(callback);
      }
    ], callback);
  });

});

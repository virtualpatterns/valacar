

var Asynchronous = require('async');

var Application = require('../library/application');
var Database = require('../library/database');

describe('/api/status', function() {

  // before(function(callback) {
  //   Asynchronous.series([
  //     function(callback) {
  //       Application.executeInstall(callback);
  //     },
  //     function(callback) {
  //       Application.executeStart(callback);
  //     },
  //     function(callback) {
  //       Application.waitUntilReady(callback);
  //     }
  //   ], callback);
  // });

  describe('HEAD', function() {

    it('should respond to HEAD /api/status with 200 OK', function(callback) {
      Application.isHEADStatusCode('/api/status', 200, callback);
    });

    it('should respond to HEAD /api/error with 500 Internal Server Error', function(callback) {
      Application.isHEADStatusCode('/api/error', 500, callback);
    });

  });

  describe('GET', function() {

    it('should respond to GET /api/status with 200 OK', function(callback) {
      Application.isGETStatusCode('/api/status', 200, callback);
    });

    it('should respond to GET /api/status with a name', function(callback) {
      Application.isGET('/api/status', function(statusCode, headers, data, callback) {
        callback(null, data.name);
      }, callback);
    });

    it('should respond to GET /api/status with a version', function(callback) {
      Application.isGET('/api/status', function(statusCode, headers, data, callback) {
        callback(null, data.version);
      }, callback);
    });

  });

  // after(function(callback) {
  //   Asynchronous.series([
  //     function(callback) {
  //       Application.executeStop(callback);
  //     },
  //     function(callback) {
  //       Application.waitUntilNotReady(callback);
  //     },
  //     function(callback) {
  //       Application.executeUninstall(callback);
  //     }
  //   ], callback);
  // });

});

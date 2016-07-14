

var Asynchronous = require('async');

var Application = require('../library/application');
var Database = require('../library/database');

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
        Application.waitUntilReady(callback);
      }
    ], callback);
  });

  it('should respond to GET / with 302 Found', function(callback) {
    Application.isGETStatusCode('/', 302, callback);
  });

  it('should respond to GET /www with 302 Found', function(callback) {
    Application.isGETStatusCode('/www', 302, callback);
  });

  after(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeStop(callback);
      },
      function(callback) {
        Application.waitUntilNotReady(callback);
      },
      function(callback) {
        Application.executeUninstall(callback);
      }
    ], callback);
  });

});

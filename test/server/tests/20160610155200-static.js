

var Asynchronous = require('async');

var Application = require('../library/application');
var Database = require('../library/database');

describe('HEAD /static', function() {

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

  it('should respond to HEAD /www/index.html with 200 OK', function(callback) {
    Application.isHEADStatusCode('/www/index.html', 200, callback);
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

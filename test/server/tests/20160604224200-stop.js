

var Asynchronous = require('async');

var Application = require('../library/application');
var Database = require('../library/database');

describe('Command.command("stop")', function() {

  before(function(callback) {
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
  //     },
  //     function(callback) {
  //       Application.executeStop(callback);
  //     }
  //   ], callback);
  // });

  it('should not be ready', function(callback) {
    Application.waitUntilNotReady(callback);
  });

  after(function(callback) {
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

  // after(function(callback) {
  //     Application.executeUninstall(callback);
  // });

});

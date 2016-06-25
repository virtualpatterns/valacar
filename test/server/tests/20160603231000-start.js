var Asynchronous = require('async');

var Application = require('../library/application');
var Database = require('../library/database');

describe('Command.command("start [databasePath]")', function() {

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

  it('should be ready', function(callback) {
    Application.waitUntilReady(callback);
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

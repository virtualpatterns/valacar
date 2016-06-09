'use strict';

const Asynchronous = require('async');

const Application = require('../library/application');
const Database = require('../library/database');

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
    Application.waitReady(callback);
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

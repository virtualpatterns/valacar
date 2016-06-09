'use strict';

const Asynchronous = require('async');

const Application = require('../library/application');
const Database = require('../library/database');

describe('Command.command("stop")', function() {

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
      },
      function(callback) {
        Application.executeStop(callback);
      }
    ], callback);
  });

  it('should not be ready', function(callback) {
    Application.waitNotReady(callback);
  });

  after(function(callback) {
      Application.executeUninstall(callback);
  });

});

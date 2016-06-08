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
      },
      function(callback) {
        Application.waitNotReady(callback);
      }
    ], callback);
  });

  it('should not respond to HEAD /', function(callback) {
    Application.isNotHEAD('/', callback);
  });

  it('should not respond to HEAD /translations', function(callback) {
    Application.isNotHEAD('/translations', callback);
  });

  after(function(callback) {
      Application.executeUninstall(callback);
  });

});

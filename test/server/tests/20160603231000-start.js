'use strict';

const Asynchronous = require('async');

const Application = require('../library/application');
const Database = require('../library/database');

const PAUSE = 5000;

describe('Command.command("start [databasePath]")', function() {
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

  it('should respond to HEAD /', function(callback) {
    Application.existsHEAD('/', callback);
  });

  it('should respond to HEAD /translations', function(callback) {
    Application.existsHEAD('/translations', callback);
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

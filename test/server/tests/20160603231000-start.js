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
      },
      function(callback) {
        Application.waitReady(callback);
      }
    ], callback);
  });

  it('should respond to HEAD /', function(callback) {
    Application.isHEAD('/', callback);
  });

  it('should respond to HEAD /translations', function(callback) {
    Application.isHEAD('/translations', callback);
  });

  after(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeStop(callback);
      },
      function(callback) {
        Application.waitNotReady(callback);
      },
      function(callback) {
        Application.executeUninstall(callback);
      }
    ], callback);
  });

});

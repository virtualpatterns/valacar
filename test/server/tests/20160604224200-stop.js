'use strict';

const Asynchronous = require('async');

const Application = require('../library/application');
const Database = require('../library/database');

const PAUSE = 5000;

describe('Command.command("stop")', function() {
 this.timeout(PAUSE * 4);

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeStart(callback);
      },
      function(callback) {
        Application.executeStop(function(error) {
          if (error)
            callback(error);
          else
            setTimeout(function() {
              callback(null);
            }, PAUSE);
        });
      },
    ], callback);
  });

  it('should not respond to HEAD /', function(callback) {
    Application.notExistsHEAD('/', callback);
  });

  it('should not respond to HEAD /translations', function(callback) {
    Application.notExistsHEAD('/translations', callback);
  });

  after(function(callback) {
      Application.executeUninstall(callback);
  });

});

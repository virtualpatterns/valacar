var Utilities = require('util');
var Asynchronous = require('async');

var Application = require('../library/application');
var Database = require('../library/database');
var Log = require('../../../client/library/log');
var Package = require('../../../package.json');
var Path = require('../../../client/library/path');
var Process = require('../../../client/library/process');

var LOG_PATH = Path.join(Process.LOG_PATH, Utilities.format('%s.mocha.log', Package.name));

before(function(callback) {
  Asynchronous.series([
    function(callback) {

      Log.addFile(LOG_PATH);
      Log.info('--------------------------------------------------------------------------------');
      Log.info('> %s', new Date());
      Log.info('--------------------------------------------------------------------------------');

      callback(null);

    },
    function(callback) {
      Database.delete(callback);
    },
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
    },
    function(callback) {

      Log.info('--------------------------------------------------------------------------------');
      Log.removeFile(LOG_PATH);

      callback(null);

    }
  ], callback);
});

describe('Begin', function() {
  it('should begin the tests', function() {});
});

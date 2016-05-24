'use strict';

const Utilities = require('util');
const Asynchronous = require('async');

const Database = require('test/library/database');
const Log = require('library/log');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const LOG_PATH = Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.mocha.log', Package.name));

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
    }
  ], callback);
});

after(function(callback) {
  Asynchronous.series([
    function(callback) {
      Database.delete(callback);
    },
    function(callback) {

      Log.info('--------------------------------------------------------------------------------');
      Log.removeFile(LOG_PATH);

      callback(null);

    }
  ], callback);
});

describe('Begin', function() {
  it('should do nothing', function () {});
});
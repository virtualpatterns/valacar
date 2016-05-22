'use strict';

const Asynchronous = require('async');

const Application = require('tests/library/application');
const Database = require('tests/library/database');
const Log = require('library/log');
const Test = require('test');

before(function(callback) {
  Asynchronous.series([
    function(callback) {

      Log.addFile(Test.TEST_LOG_PATH);
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
      Log.removeFile(Test.TEST_LOG_PATH);

      callback(null);

    }
  ], callback);
});

describe('Begin', function() {

  it('should do nothing', function () {});

});

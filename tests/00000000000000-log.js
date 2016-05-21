'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Log = require('library/log');
const Package = require('package.json');
const Path = require('library/path');
const Test = require('test');

before(function() {
  Log.addFile(Test.TEST_LOG_PATH);
});

after(function() {
  Log.removeFile(Test.TEST_LOG_PATH);
});

describe('Log', function() {
  
  it('should add a log entry', function () {
    Log.info('--------------------------------------------------------------------------------');
    Log.info(' %s', new Date());
    Log.info('--------------------------------------------------------------------------------');
  });

});

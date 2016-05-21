'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Log = require('library/log');
const Package = require('package.json');
const Path = require('library/path');
const Test = require('test');

before(function() {
  // Log.addConsole();
  Log.addFile(Test.LOG_PATH);
});

after(function() {
  Log.removeFile(Test.LOG_PATH);
  // Log.removeConsole();
});

describe('Log', function() {
  this.timeout(Test.TIMEOUT);

  it('should add a log entry', function () {
    Log.info('--------------------------------------------------------------------------------');
    Log.info(' %s', new Date());
    Log.info('--------------------------------------------------------------------------------');
  });

});

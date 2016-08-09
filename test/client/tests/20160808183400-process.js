var Assert = require('assert');
var Asynchronous = require('async');
var Utilities = require('util');

var FileSystem = require('../../../client/library/file-system');
var Log = require('../../../client/library/log');
var Path = require('../../../client/library/path');
var Process = require('../../../client/library/process');

var ArgumentError = require('../../../client/library/errors/argument-error');

var PID_PATH = Path.join(Process.OUTPUT_PATH, 'process.pid');

describe('Process', function() {

  describe('Process (no existing path)', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          try {
            FileSystem.accessSync(PID_PATH, FileSystem.F_OK);
            callback(null, true);
          }
          catch (error) {
            callback(null, false);
          }
        },
        function(exists, callback) {
          if (exists)
            FileSystem.unlink(PID_PATH, callback);
          else
            callback(null);
        }
      ], callback);
    })

    it(Utilities.format('%j should not exist', Path.trim(PID_PATH)), function() {
      Assert.equal(Process.existsPID(PID_PATH), false);
    });

  });

  describe('Process (existing path, invalid)', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          try {
            FileSystem.accessSync(PID_PATH, FileSystem.F_OK);
            callback(null, true);
          }
          catch (error) {
            callback(null, false);
          }
        },
        function(exists, callback) {
          if (exists)
            FileSystem.unlink(PID_PATH, callback);
          else
            callback(null);
        },
        function(callback) {
          FileSystem.writeFile(PID_PATH, 99999, {
            encoding: 'utf-8'
          }, callback);
        }
      ], callback);
    })

    it(Utilities.format('%j should not exist', Path.trim(PID_PATH)), function() {
      Assert.equal(Process.existsPID(PID_PATH), false);
    });

  });

  describe('Process (existing path, invalid, no existing path)', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          try {
            FileSystem.accessSync(PID_PATH, FileSystem.F_OK);
            callback(null, true);
          }
          catch (error) {
            callback(null, false);
          }
        },
        function(exists, callback) {
          if (exists)
            FileSystem.unlink(PID_PATH, callback);
          else
            callback(null);
        },
        function(callback) {
          FileSystem.writeFile(PID_PATH, 99999, {
            encoding: 'utf-8'
          }, callback);
        },
        function(callback) {
          Process.existsPID(PID_PATH);
          callback(null);
        }
      ], callback);
    })

    it(Utilities.format('%j should not exist', Path.trim(PID_PATH)), function() {
      Assert.equal(Process.existsPID(PID_PATH), false);
    });

  });

  describe('Process (no existing path, create)', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          try {
            FileSystem.accessSync(PID_PATH, FileSystem.F_OK);
            callback(null, true);
          }
          catch (error) {
            callback(null, false);
          }
        },
        function(exists, callback) {
          if (exists)
            FileSystem.unlink(PID_PATH, callback);
          else
            callback(null);
        },
        function(callback) {
          Process.createPID(PID_PATH);
          callback(null);
        }
      ], callback);
    })

    it(Utilities.format('%j should exist', Path.trim(PID_PATH)), function() {
      Assert.equal(Process.existsPID(PID_PATH), true);
    });

    // after(function(callback) {
    //   FileSystem.unlink(PID_PATH, callback);
    // })

  });

});

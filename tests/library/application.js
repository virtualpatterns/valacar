'use strict';

const ChildProcess = require('child_process');
const Utilities = require('util');

const _Application = require('library/application');
const Log = require('library/log');
const Process = require('library/process');
const Test = require('test');

const PROCESS_OPTIONS = {
  'killSignal': 'SIGTERM',
  'timeout': 2000
};

const Application = Object.create(_Application);

Application.execute = function(command, callback) {
  Log.info('> node index.js %s', command);
  ChildProcess.exec(Utilities.format('node index.js %s', command), Test.PROCESS_OPTIONS, function(error, stdout, stderr) {
      Log.info('< node index.js %s', command);
      Log.info('        stdout=%j', stdout);
      if (error) {
        Log.info('        stderr=%j', stderr);
        Log.info('    error.code=%j', stderr);
        callback(new Error(Utilities.format('An error occurred executing the command %j (%s).', command, stderr)), stdout, stderr);
      }
      else
        callback(null, stdout, stderr);
  });
};

Application.executeInstall = function(callback) {
  this.execute(Utilities.format('install %j', Test.DATABASE_PATH), callback);
};

Application.executeUninstall = function(callback) {
  this.execute(Utilities.format('uninstall %j', Test.DATABASE_PATH), callback);
};

Application.executeImport = function(filePath, callback) {
  this.execute(Utilities.format('import %j %j', filePath, Test.DATABASE_PATH), callback);
};

Application.executeClean = function(callback) {
  this.execute(Utilities.format('clean %j', Test.DATABASE_PATH), callback);
};

Application.executeAddTranslation = function(_from, _to, callback) {
  this.execute(Utilities.format('addTranslation %j %j %j', _from, _to, Test.DATABASE_PATH), callback);
};

Application.executeRemoveTranslation = function(_from, callback) {
  this.execute(Utilities.format('removeTranslation %j %j', _from, Test.DATABASE_PATH), callback);
};

Application.executeDumpTranslations = function(callback) {
  this.execute(Utilities.format('dumpTranslations %j', Test.DATABASE_PATH), callback);
};

Application.executeAddLease = function(address, device, host, callback) {
  this.execute(Utilities.format('addLease %j %j %j %j', address, device, host, Test.DATABASE_PATH), callback);
};

Application.executeRemoveLease = function(address, callback) {
  this.execute(Utilities.format('removeLease %j %j', address, Test.DATABASE_PATH), callback);
};

Application.executeDumpLeases = function(callback) {
  this.execute(Utilities.format('dumpLeases %j', Test.DATABASE_PATH), callback);
};

module.exports = Application;

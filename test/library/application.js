'use strict';

const Asynchronous = require('async');
const ChildProcess = require('child_process');
const FileSystem = require('fs');

const Utilities = require('util');

const _Application = require('../../library/application');
const Database = require('./database');
const Log = require('../../library/log');
const Package = require('../../package.json');
const Path = require('../../library/path');
const Process = require('../../library/process');

const ProcessError = require('../../library/errors/process-error');

const REGEXP_SPLIT = /(?:[^\s"]+|"[^"]*")+/g;
const REGEXP_QUOTE = /^"|"$/g;

const Application = Object.create(_Application);

Object.defineProperty(Application, 'DATABASE_PATH', {
  'enumerable': true,
  'writable': false,
  'value': Database.DATABASE_PATH
});

Object.defineProperty(Application, 'LOG_PATH', {
  'enumerable': true,
  'writable': false,
  'value': Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.test.log', Package.name))
});

Application.executeCommand = function(command, callback) {

  let _this = this;

  Log.info('> ./valacar.js %s %j --logPath %j', command, _this.DATABASE_PATH, _this.LOG_PATH);
  ChildProcess.exec(Utilities.format('./valacar.js %s %j --logPath %j', command, _this.DATABASE_PATH, _this.LOG_PATH), function(error, stdout, stderr) {

    let _command = command;
    _command = _command.match(REGEXP_SPLIT);
    _command = _command.map(function(item) {
      return item.replace(REGEXP_QUOTE, '');
    });

    _command = _command.shift();

    Asynchronous.series([
      function(callback) {
        FileSystem.writeFile(Path.join(Process.cwd(), 'process', 'output', Utilities.format('%s.out', _command)), stdout, callback);
      },
      function(callback) {
        FileSystem.writeFile(Path.join(Process.cwd(), 'process', 'output', Utilities.format('%s.err', _command)), stderr, callback);
      },
      function(callback) {
        Log.info('< ./valacar.js %s %j --logPath %j', command, _this.DATABASE_PATH, _this.LOG_PATH);
        if (error) {
          Log.info('       error.code=%j', error.code);
          Log.info('    error.message=%j', error.message);
          Log.info('       error.name=%j', error.name);
          Log.info('           stderr=%j', stderr);
          callback(new ProcessError(Utilities.format('An error occurred executing the command %j (%s).', command, stderr)), stdout, stderr);
        }
        else
          callback(null, stdout, stderr);
      }
    ], callback);
  });

};

Application.executeInstall = function(callback) {
  this.executeCommand('install', callback);
};

Application.executeUninstall = function(callback) {
  this.executeCommand('uninstall', callback);
};

Application.executeImport = function(filePath, callback) {
  this.executeCommand(Utilities.format('import %j', filePath), callback);
};

Application.executeClean = function(callback) {
  this.executeCommand('clean', callback);
};

Application.executeAddTranslation = function(_from, _to, callback) {
  this.executeCommand(Utilities.format('addTranslation %j %j', _from, _to), callback);
};

Application.executeRemoveTranslation = function(_from, callback) {
  this.executeCommand(Utilities.format('removeTranslation %j', _from), callback);
};

Application.executeDumpTranslations = function(callback) {
  this.executeCommand('dumpTranslations', callback);
};

Application.executeAddLease = function(address, device, host, callback) {
  this.executeCommand(Utilities.format('addLease %j %j %j', address, device, host), callback);
};

Application.executeRemoveLease = function(address, callback) {
  this.executeCommand(Utilities.format('removeLease %j', address), callback);
};

Application.executeDumpLeases = function(callback) {
  this.executeCommand('dumpLeases', callback);
};

Application.executeDumpLeasesWhere = function(filter, callback) {
  this.executeCommand(Utilities.format('dumpLeasesWhere %j', filter), callback);
};

module.exports = Application;

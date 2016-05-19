'use strict';

const Asynchronous = require('async');
const ChildProcess = require('child_process');
const Utilities = require('util');

const _Application = require('library/application');
const Log = require('library/log');
const Path = require('library/path');
const Process = require('library/process');

const Application = Object.create(_Application);

Application.executeInstall = function(databasePath, callback) {
  Log.info('> node index.js install --enableTrace %j', Path.trim(databasePath));
  ChildProcess.exec(Utilities.format('node index.js install --enableTrace %j', databasePath), {
    'cwd': Process.cwd(),
    'env': Process.env
  }, callback);
};

Application.executeUninstall = function(databasePath, callback) {
  Log.info('> node index.js uninstall --enableTrace %j', Path.trim(databasePath));
  ChildProcess.exec(Utilities.format('node index.js uninstall --enableTrace %j', databasePath), {
    'cwd': Process.cwd(),
    'env': Process.env
  }, callback);
};

Application.executeImport = function(filePath, databasePath, callback) {
  Log.info('> node index.js import --enableTrace %j %j', Path.trim(filePath), Path.trim(databasePath));
  ChildProcess.exec(Utilities.format('node index.js import --enableTrace %j %j', filePath, databasePath), {
    'cwd': Process.cwd(),
    'env': Process.env
  }, callback);
};

Application.executeClean = function(databasePath, callback) {
  Log.info('> node index.js clean --enableTrace %j', Path.trim(databasePath));
  ChildProcess.exec(Utilities.format('node index.js clean --enableTrace %j', databasePath), {
    'cwd': Process.cwd(),
    'env': Process.env
  }, callback);
};

Application.executeAddLease = function(address, device, host, databasePath, callback) {
  Log.info('> node index.js addLease --enableTrace %j %j %j %j', address, device, host, Path.trim(databasePath));
  ChildProcess.exec(Utilities.format('node index.js addLease --enableTrace %j %j %j %j', address, device, host, databasePath), {
    'cwd': Process.cwd(),
    'env': Process.env
  }, callback);
};

Application.executeRemoveLease = function(address, databasePath, callback) {
  Log.info('> node index.js removeLease --enableTrace %j %j', address, Path.trim(databasePath));
  ChildProcess.exec(Utilities.format('node index.js removeLease --enableTrace %j %j', address, databasePath), {
    'cwd': Process.cwd(),
    'env': Process.env
  }, callback);
};

Application.executeDumpLeases = function(databasePath, callback) {
  Log.info('> node index.js dumpLeases --enableTrace %j', Path.trim(databasePath));
  ChildProcess.exec(Utilities.format('node index.js dumpLeases --enableTrace %j', databasePath), {
    'cwd': Process.cwd(),
    'env': Process.env
  }, callback);
};

Application.executeAddTranslation = function(_from, _to, databasePath, callback) {
  Log.info('> node index.js addTranslation --enableTrace %j %j %j %j', _from, _to, Path.trim(databasePath));
  ChildProcess.exec(Utilities.format('node index.js addTranslation --enableTrace %j %j %j %j', _from, _to, databasePath), {
    'cwd': Process.cwd(),
    'env': Process.env
  }, callback);
};

Application.executeRemoveTranslation = function(_from, databasePath, callback) {
  Log.info('> node index.js removeTranslation --enableTrace %j %j', _from, Path.trim(databasePath));
  ChildProcess.exec(Utilities.format('node index.js removeTranslation --enableTrace %j %j', _from, databasePath), {
    'cwd': Process.cwd(),
    'env': Process.env
  }, callback);
};

Application.executeDumpTranslations = function(databasePath, callback) {
  Log.info('> node index.js dumpTranslations --enableTrace %j', Path.trim(databasePath));
  ChildProcess.exec(Utilities.format('node index.js dumpTranslations --enableTrace %j', databasePath), {
    'cwd': Process.cwd(),
    'env': Process.env
  }, callback);
};

module.exports = Application;

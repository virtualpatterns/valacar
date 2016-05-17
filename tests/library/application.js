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

Application.executeAdd = function(address, device, host, databasePath, callback) {
  Log.info('> node index.js add --enableTrace %j %j %j %j', address, device, host, Path.trim(databasePath));
  ChildProcess.exec(Utilities.format('node index.js add --enableTrace %j %j %j %j', address, device, host, databasePath), {
    'cwd': Process.cwd(),
    'env': Process.env
  }, callback);
};

Application.executeRemove = function(address, databasePath, callback) {
  Log.info('> node index.js remove --enableTrace %j %j', address, Path.trim(databasePath));
  ChildProcess.exec(Utilities.format('node index.js remove --enableTrace %j %j', address, databasePath), {
    'cwd': Process.cwd(),
    'env': Process.env
  }, callback);
};

module.exports = Application;

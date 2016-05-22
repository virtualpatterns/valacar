'use strict';

const Utilities = require('util');
const Winston = require('winston');

const Path = require('library/path');

const Log = Object.create(Winston);

Log.addConsole = function() {
  this.add(Winston.transports.Console, {
    'level': 'debug',
    'timestamp': true
  });
};

Log.removeConsole = function() {
  this.remove(Winston.transports.Console);
};

Log.addFile = function (path) {
  this.add(Winston.transports.File, {
    'name': path,
    'filename': path,
    'json': false,
    'level': 'debug',
    'timestamp': true
  });
  this.info('< Log.add(Winston.transports.File, { name: %j, ...})', Path.trim(path));
};

Log.removeFile = function(path) {
  this.info('> Log.remove(%j)', Path.trim(path));
  this.remove(path);
};

Log.removeConsole();

module.exports = Log

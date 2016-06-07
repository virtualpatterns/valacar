'use strict';

const Cluster = require('cluster');
const Pad = require('pad');
const Utilities = require('util');
const Winston = require('winston');

const Path = require('./path');

const Log = Object.create(Winston);

Log.format = function(options) {

  const Process = require('./process');

  return Utilities.format(  '%s [%s:%d] %s %s',
                            new Date().toISOString(),
                            Cluster.isMaster ? 'master': 'worker',
                            Process.pid,
                            Pad(options.level.toUpperCase(), 5),
                            (options.message ? options.message : ''));

};

Log.addConsole = function() {
  this.add(Winston.transports.Console, {
    'formatter': this.format,
    'level': 'debug',
    'timestamp': true
  });
};

Log.removeConsole = function() {
  this.remove(Winston.transports.Console);
};

Log.addFile = function(path) {
  this.add(Winston.transports.File, {
    'name': path,
    'filename': path,
    'formatter': this.format,
    'json': false,
    'level': 'debug',
    'timestamp': true
  });
  // this.info('< Log.add(Winston.transports.File, { name: %j, ...})', Path.trim(path));
};

Log.removeFile = function(path) {
  // this.info('> Log.remove(%j)', Path.trim(path));
  this.remove(path);
};

Log.removeConsole();

module.exports = Log

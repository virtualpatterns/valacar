var Cluster = require('cluster');
var Pad = require('pad');
var Utilities = require('util');
var Winston = require('winston');

var Path = require('./path');

var Log = Object.create(Winston);

Log.format = function(options) {

  var Process = require('./process');

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
};

Log.removeFile = function(path) {
  this.remove(path);
};

Log.removeConsole();

module.exports = Log

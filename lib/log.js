'use strict';

const Winston = require('winston');

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
    'filename': path,
    'json': false,
    'level': 'debug',
    'timestamp': true
    });
};

Log.removeFile = function() {
  this.remove(Winston.transports.File);
};

Log.removeConsole();

module.exports = Log

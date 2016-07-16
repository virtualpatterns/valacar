var Is = require('@pwn/is');
var Pad = require('pad');
var Utilities = require('util');

var Log = Object.create({});

Log.log = function() {

  if (window.callPhantom) {
    // Do nothing
  }
  else {

    var argumentsArray = Array.prototype.slice.call(arguments);
    var level = argumentsArray.shift().toUpperCase();
    var levelFn = console.log;

    switch (level) {
      case 'LOG':
        levelFn = console.log;
        break;
      case 'ERROR':
        levelFn = console.error;
        break;
      case 'WARN':
        levelFn = console.warn;
        break;
      case 'INFO':
        levelFn = console.info;
        break;
      case 'DEBUG':
        levelFn = console.debug;
        break;
      default:
        levelFn = console.log;
    }

    if (Is.string(argumentsArray[0])) {

      var message = null;
      message = Utilities.format.apply(Utilities.format, argumentsArray);
      message = Utilities.format('%s %s %s', new Date().toISOString(), Pad(level, 5), message || '');

      levelFn.call(console, message);

    }
    else {

      var object = argumentsArray.shift();

      var message = null;
      message = Utilities.format('%s %s ...\n', new Date().toISOString(), Pad(level, 5));

      levelFn.call(console, message);
      levelFn.call(console, object);

    }

  }

};

Log.info = function() {

  var argumentsArray = null;
  argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('info');

  this.log.apply(this, argumentsArray);

};

Log.debug = function() {

  var argumentsArray = null;
  argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('debug');

  this.log.apply(this, argumentsArray);

};

Log.error = function() {

  var argumentsArray = null;
  argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('error');

  this.log.apply(this, argumentsArray);

};

module.exports = Log;

var Is = require('@pwn/is');
var Pad = require('pad');
var Utilities = require('util');

var Log = Object.create({});

Log.log = function() {

  var argumentsArray = Array.prototype.slice.call(arguments);
  var level = argumentsArray.shift().toUpperCase();
  var levelFn = console.log.bind(console);

  if (window.callPhantom)
    levelFn = this.logPhantom.bind(this);
  else
    switch (level) {
      case 'LOG':
        levelFn = console.log.bind(console);
        break;
      case 'ERROR':
        levelFn = console.error.bind(console);
        break;
      case 'WARN':
        levelFn = console.warn.bind(console);
        break;
      case 'INFO':
        levelFn = console.info.bind(console);
        break;
      case 'DEBUG':
        levelFn = console.debug.bind(console);
        break;
      default:
        levelFn = console.log.bind(console);
    }

  if (Is.string(argumentsArray[0])) {

    var message = null;
    message = Utilities.format.apply(Utilities.format, argumentsArray);
    message = Utilities.format('%s %s %s', new Date().toISOString(), Pad(level, 5), message || '');

    levelFn(message);

  }
  else {

    var object = argumentsArray.shift();

    var message = null;
    message = Utilities.format('%s %s ...\n', new Date().toISOString(), Pad(level, 5));

    levelFn(message);
    levelFn(object);

  }

};

Log.logPhantom = function(message) {
  window.callPhantom({
    'message': message
  });
};

Log.info = function() {

  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('info');

  this.log.apply(this, argumentsArray);

};

Log.debug = function() {

  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('debug');

  this.log.apply(this, argumentsArray);

};

Log.error = function() {

  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('error');

  this.log.apply(this, argumentsArray);

};

module.exports = Log;

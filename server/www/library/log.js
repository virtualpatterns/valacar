var Is = require('@pwn/is');
var Pad = require('pad');
var Utilities = require('util');

var Log = Object.create({});

Log.log = function() {

  var argumentsArray = Array.prototype.slice.call(arguments);
  var level = argumentsArray.shift();

  if (Is.string(argumentsArray[0])) {

    var message = Utilities.format.apply(Utilities.format, argumentsArray);

    console.log(  '%s %s %s',
                  new Date().toISOString(),
                  Pad(level.toUpperCase(), 5),
                  message || '');

  }
  else {

    var object = argumentsArray.shift();

    console.log(  '%s %s ...\n',
                  new Date().toISOString(),
                  Pad(level.toUpperCase(), 5));
    console.log(  object);

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

'use strict';

function ArgumentError(message) {
  Error.call(this);
  Error.captureStackTrace(this, ArgumentError);

  this.message = message;

}

ArgumentError.prototype = Object.create(Error.prototype);
ArgumentError.prototype.constructor = ArgumentError;
ArgumentError.prototype.name = ArgumentError.name;

module.exports = ArgumentError;

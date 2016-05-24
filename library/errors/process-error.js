'use strict';

function ProcessError(message) {
  Error.call(this);
  Error.captureStackTrace(this, ProcessError);

  this.message = message;

}

ProcessError.prototype = Object.create(Error.prototype);
ProcessError.prototype.constructor = ProcessError;
ProcessError.prototype.name = ProcessError.name;

module.exports = ProcessError;

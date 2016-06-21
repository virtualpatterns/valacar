

function ValidationError(message) {
  Error.call(this);
  Error.captureStackTrace(this, ValidationError);

  this.message = message;

}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;
ValidationError.prototype.name = ValidationError.name;

module.exports = ValidationError;

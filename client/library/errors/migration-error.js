

function MigrationError(message) {
  Error.call(this);
  Error.captureStackTrace(this, MigrationError);

  this.message = message;

}

MigrationError.prototype = Object.create(Error.prototype);
MigrationError.prototype.constructor = MigrationError;
MigrationError.prototype.name = MigrationError.name;

module.exports = MigrationError;

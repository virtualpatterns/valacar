var Utilities = require('util');

var _Database = require('../../../client/library/database');
var FileSystem = require('../../../client/library/file-system');
var Log = require('../../../client/library/log');
var Package = require('../../../package.json');
var Path = require('../../../client/library/path');
var Process = require('../../../client/library/process');

var RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');

var Database = Object.create(_Database);

Object.defineProperty(Database, 'DATABASE_PATH', {
  'enumerable': true,
  'writable': false,
  'value': Path.join(Process.DATA_PATH, Utilities.format('%s.test.db', Package.name))
});

Object.defineProperty(Database, 'DATABASE_OPTIONS', {
  'enumerable': true,
  'writable': false,
  'value': {
    'enableTrace': true,
    'enableProfile': false
  }
});

Database.openConnection = function(taskFn, callback) {
  _Database.openConnection.call(this, this.DATABASE_PATH, this.DATABASE_OPTIONS, taskFn, callback);
};

Database.existsTable = function(connection, tableName, callback) {
  this.getFile(connection, Path.join(RESOURCES_PATH, 'exists-table.sql'), {
    $Name: tableName
  }, function(error, row) {
    if (error)
      callback(error);
    else if (!row)
      callback(new Error(Utilities.format('The table %j does not exist.', tableName)), false);
    else
      callback(null, true);
  });
};

Database.notExistsTable = function(connection, tableName, callback) {
  this.existsTable(connection, tableName, function(error, exists) {
    if (exists)
      callback(new Error(Utilities.format('The table %j exists.', tableName))), false;
    else if (exists == undefined)
      callback(error);
    else
      callback(null, true);
  });
};

Database.existsLease = function(connection, address, from, to, device, host, callback) {
  this.getFile(connection, Path.join(RESOURCES_PATH, 'exists-tlease.sql'), {
    $Address: address,
    $From: from.toISOString(),
    $To: to.toISOString(),
    $Device: device,
    $Host: host
  }, function(error, row) {
    if (error)
      callback(error);
    else if (!row)
      callback(new Error(Utilities.format('The lease %j from %j to %j does not exist.', address, from, to)), false);
    else
      callback(null, true);
  });
};

Database.notExistsLease = function(connection, address, from, to, device, host, callback) {
  this.existsLease(connection, address, from, to, device, host, function(error, exists) {
    if (exists)
      callback(new Error(Utilities.format('The lease %j from %j to %j exists.', address, from, to))), false;
    else if (exists == undefined)
      callback(error);
    else
      callback(null, true);
  });
};

Database.existsStaticLease = function(connection, address, device, host, callback) {
  this.existsLease(connection, address, this.MINIMUM_DATE, this.MINIMUM_DATE, device, host, callback);
};

Database.notExistsStaticLease = function(connection, address, device, host, callback) {
  this.notExistsLease(connection, address, this.MINIMUM_DATE, this.MINIMUM_DATE, device, host, callback);
};

Database.existsDevice = function(connection, device, host, callback) {
  this.getFile(connection, Path.join(RESOURCES_PATH, 'exists-tdevicehost.sql'), {
    $Device: device,
    $Host: host
  }, function(error, row) {
    if (error)
      callback(error);
    else if (!row)
      callback(new Error(Utilities.format('The device %j/%j does not exist.', device, host)), false);
    else
      callback(null, true);
  });
};

Database.notExistsDevice = function(connection, device, host, callback) {
  this.existsDevice(connection, device, host, function(error, exists) {
    if (exists)
      callback(new Error(Utilities.format('The device %j/%j exists.', device, host))), false;
    else if (exists == undefined)
      callback(error);
    else
      callback(null, true);
  });
};

Database.existsTranslation = function(connection, from, to, callback) {
  this.getFile(connection, Path.join(RESOURCES_PATH, 'exists-ttranslation.sql'), {
    $From: from,
    $To: to
  }, function(error, row) {
    if (error)
      callback(error);
    else if (!row)
      callback(new Error(Utilities.format('The translation from %j to %j does not exist.', from, to)), false);
    else
      callback(null, true);
  });
};

Database.notExistsTranslation = function(connection, from, to, callback) {
  this.existsTranslation(connection, from, to, function(error, exists) {
    if (exists)
      callback(new Error(Utilities.format('The translation from %j to %j exists.', from, to)), false);
    else if (exists == undefined)
      callback(error);
    else
      callback(null, true);
  });
};

Database.delete = function(callback) {

  var self = this;

  // Log.info('> FileSystem.access(%j, FileSystem.F_OK, callback)', Path.trim(self.DATABASE_PATH));
  FileSystem.access(self.DATABASE_PATH, FileSystem.F_OK, function(error) {
    // Log.info('< FileSystem.access(%j, FileSystem.F_OK, callback)', Path.trim(self.DATABASE_PATH));
    if (error) {
      // Log.info('    error.message=%j\n\n%s\n\n', error.message, error.stack);
      callback(null);
    }
    else {
      Log.info('> FileSystem.unlink(%j, callback)', Path.trim(self.DATABASE_PATH));
      FileSystem.unlink(self.DATABASE_PATH, callback);
    }
  });

};

module.exports = Database;

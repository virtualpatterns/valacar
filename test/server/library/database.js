

var Utilities = require('util');

var _Database = require('../../client/library/database');
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

Database.existsTranslations = function(connection, callback) {
  this.getFile(connection, Path.join(RESOURCES_PATH, 'select-ttranslation-count.sql'), [], function(error, row) {
    if (error)
      callback(error);
    else if (row.cCountOfTranslations <= 0)
      callback(new Error('No translations exist.'), false);
    else
      callback(null, true);
  });
};

Database.notExistsTranslations = function(connection, callback) {
  this.existsTranslations(connection, function(error, exists) {
    if (exists)
      callback(new Error('At least one translation exists.'), false);
    else if (exists == undefined)
      callback(error);
    else
      callback(null, true);
  });
};

Database.existsLeases = function(connection, callback) {
  this.getFile(connection, Path.join(RESOURCES_PATH, 'select-tlease-count.sql'), [], function(error, row) {
    if (error)
      callback(error);
    else if (row.cCountOfLeases <= 0)
      callback(new Error('No leases exist.'), false);
    else
      callback(null, true);
  });
};

Database.notExistsLeases = function(connection, callback) {
  this.existsLeases(connection, function(error, exists) {
    if (exists)
      callback(new Error('At least one lease exists.'), false);
    else if (exists == undefined)
      callback(error);
    else
      callback(null, true);
  });
};

module.exports = Database;

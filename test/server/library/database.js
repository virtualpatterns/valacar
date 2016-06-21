

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

// Database.openConnection = function(taskFn, callback) {
//   _Database.openConnection.call(this, this.DATABASE_PATH, this.DATABASE_OPTIONS, taskFn, callback);
// };

module.exports = Database;

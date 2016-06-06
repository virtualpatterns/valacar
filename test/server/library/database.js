'use strict';

const Utilities = require('util');

const _Database = require('../../library/database');
const Package = require('../../../package.json');
const Path = require('../../../library/path');
const Process = require('../../../library/process');

const RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');

const Database = Object.create(_Database);

Object.defineProperty(Database, 'DATABASE_PATH', {
  'enumerable': true,
  'writable': false,
  'value': Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.server.test.db', Package.name))
});

Object.defineProperty(Database, 'DATABASE_OPTIONS', {
  'enumerable': true,
  'writable': false,
  'value': {
    'enableTrace': true,
    'enableProfile': false
  }
});

Database.openConnection = function(task, callback) {
  Object.getPrototypeOf(Object.getPrototypeOf(this)).openConnection.call(this, this.DATABASE_PATH, this.DATABASE_OPTIONS, task, callback);
};

module.exports = Database;

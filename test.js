'use strict';

const Path = require('path');
const Utilities = require('util');

const Modules = require('app-module-path/register');

const Package = require('package.json');
const Process = require('library/process');

const Test = Object.create({});

Test.DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.test.db', Package.name));
Test.DATABASE_OPTIONS = {
  'enableTrace': true,
  'enableProfile': false
};
Test.LOG_PATH = Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.test.log', Package.name));
Test.TIMEOUT = 5000000;

module.exports = Test;

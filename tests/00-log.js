'use strict';

const Utilities = require('util');

const Log = require('library/log');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const LOG_PATH = Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.%s.%s', Package.name, 'test', 'log'));

before(function() {
  Log.addFile(LOG_PATH);
});

after(function() {
  Log.removeFile(LOG_PATH);
});

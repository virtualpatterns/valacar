'use strict';

const _Path = require('path');

const Path = Object.create(_Path);

Path.trim = function(path) {
  const Process = require('./process');
  return path.replace(Process.cwd(), '.');
}

module.exports = Path;

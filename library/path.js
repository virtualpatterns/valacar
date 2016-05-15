'use strict';

const Path = require('path');

const _Path = Object.create(Path);

_Path.trim = function(path) {
  return path.replace(process.cwd(), '.');
}

module.exports = _Path;

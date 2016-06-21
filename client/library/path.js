

var _Path = require('path');

var Path = Object.create(_Path);

Path.trim = function(path) {
  var Process = require('./process');
  return path.replace(Process.cwd(), '.');
}

module.exports = Path;



var Asynchronous = require('async');
var Stream = require('stream');

var FileSystem = require('../../client/library/file-system');
var Log = require('../../client/library/log');
var Path = require('../../client/library/path');
var Process = require('../../client/library/process');

var Task = require('./task');

var taskPrototype = Object.create(Task.getTaskPrototype());

var BackgroundTask = Object.create(Task);

BackgroundTask.createOptions = function(stdin, stdout, stderr, callback) {

  var options = {
    'detached': true,
    'stdio': [
      (stdin == Task.INHERIT || stdin == Task.IGNORE) ? stdin : FileSystem.createReadStream(stdin),
      (stdout == Task.INHERIT || stdout == Task.IGNORE) ? stdout : FileSystem.createWriteStream(stdout),
      (stderr == Task.INHERIT || stderr == Task.IGNORE) ? stderr : FileSystem.createWriteStream(stderr)
    ]
  };

  Asynchronous.each(options.stdio, function(stream, callback) {
    if (stream instanceof Stream.Writable ||
        stream instanceof Stream.Readable) {
      stream.once('open', function() {
        Log.info('< Stream.Writable.once("open", function() { ... }) Stream.Writable.path=%j', Path.trim(stream.path));
        callback(null);
      });
    }
    else
      callback(null);
  }, function(error) {
    callback(error, options);
  });

};

BackgroundTask.createTask = function(name, options, prototype) {
  return Task.createTask.call(this, name, options, prototype || taskPrototype);
};

BackgroundTask.isTask = function(task) {
  return taskPrototype.isPrototypeOf(task);
};

BackgroundTask.getTaskPrototype = function() {
  return taskPrototype;
};

module.exports = BackgroundTask;



// var Template = require('pug');
var Server = require('restify');
var Utilities = require('util');

var Log = require('../../client/library/log');
var Path = require('../../client/library/path');
var Process = require('../../client/library/process');

var REGEXP_STATIC = /^(\/www.*)$/;

var RESOURCES_PATH = Path.join(Process.cwd(), 'server', 'www', 'resources');
var STATIC_PATH = Path.join(Process.cwd(), 'server');

var Static = Object.create({});

Static.createRoutes = function(server, databasePath, options) {

  server.get('/favicon.ico', function(request, response, next) {
    Log.info('> server.get("/favicon.ico", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Utilities.inspect(request.headers));
    Server.serveStatic({
      directory: RESOURCES_PATH,
      file: 'valacar.ico'
    })(request, response, next);
  });

  server.head(REGEXP_STATIC, function(request, response, next) {
    Log.info('> server.head(%j, function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', REGEXP_STATIC.toString(), Utilities.inspect(request.headers), Utilities.inspect(request.params));
    response.send(200);
    next();
  });

  server.get(REGEXP_STATIC, function(request, response, next) {
    Log.info('> server.get(%j, function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', REGEXP_STATIC.toString(), Utilities.inspect(request.headers), Utilities.inspect(request.params));
    Server.serveStatic({
      'directory': STATIC_PATH,
      'maxAge': 0
    })(request, response, next);
  });

};

module.exports = Static;

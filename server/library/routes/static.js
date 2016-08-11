var Server = require('restify');
var Utilities = require('util');

var Log = require('../../../client/library/log');
var Path = require('../../../client/library/path');
var Process = require('../../../client/library/process');

var REGEXP_STATIC = /^(\/www.*)$/;

var Static = Object.create({});

Static.createRoutes = function(server, staticPath, options) {

  server.get('/favicon.ico', function(request, response, next) {
    Log.info('> server.get("/favicon.ico", function(request, response, next) { ... })');
    Server.serveStatic({
      directory: Path.join(staticPath, 'www', 'resources'),
      file: 'valacar.ico'
    })(request, response, next);
  });

  server.head('/', function(request, response, next) {
    Log.info('> server.head("/", function(request, response, next) { ... })');
    response.send(200);
  });

  server.get('/', function(request, response, next) {
    Log.info('> server.get("/", function(request, response, next) { ... })');
    response.redirect('/www/default.min.html', next);
  });

  server.head('/www', function(request, response, next) {
    Log.info('> server.head("/www", function(request, response, next) { ... })');
    response.send(200);
  });

  server.get('/www', function(request, response, next) {
    Log.info('> server.get("/www", function(request, response, next) { ... })');
    response.redirect('/www/default.min.html', next);
  });

  server.head(REGEXP_STATIC, function(request, response, next) {
    Log.info('> server.head(%j, function(request, response, next) { ... })\n\nrequest.params\n--------------\n%s\n', REGEXP_STATIC.toString(), Utilities.inspect(request.params));
    response.send(200);
    next();
  });

  server.get(REGEXP_STATIC, function(request, response, next) {
    Log.info('> server.get(%j, function(request, response, next) { ... })\n\nrequest.params\n--------------\n%s\n', REGEXP_STATIC.toString(), Utilities.inspect(request.params));
    Server.serveStatic({
      'directory': staticPath,
      'maxAge': 0
    })(request, response, next);
  });

};

module.exports = Static;

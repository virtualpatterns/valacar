

// var Template = require('pug');
var Server = require('restify');
var Utilities = require('util');

var Log = require('../../client/library/log');
var Path = require('../../client/library/path');
var Process = require('../../client/library/process');

var REGEXP_STATIC = /^(\/www.*)$/;
// var REGEXP_STATIC_TEMPLATE = /^(\/www.*\.jade)$/;

var RESOURCES_PATH = Path.join(Process.cwd(), 'server', 'www', 'resources');
var STATIC_PATH = Path.join(Process.cwd(), 'server');

var Static = Object.create({});

Static.createRoutes = function(server, databasePath, options) {

  server.get('/favicon.ico', function(request, response, next) {
    Log.info('> server.get("/favicon.ico", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Utilities.inspect(request.headers));
    Server.serveStatic({
      directory: RESOURCES_PATH,
      file: 'favicon.ico'
    })(request, response, next);
  });

  server.head(REGEXP_STATIC, function(request, response, next) {
    Log.info('> server.head(%j, function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', REGEXP_STATIC.toString(), Utilities.inspect(request.headers), Utilities.inspect(request.params));
    response.send(200);
    next();
  });

  // server.get(REGEXP_STATIC_TEMPLATE, function(request, response, next) {
  //   Log.info('> server.get(%j, function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', REGEXP_STATIC_TEMPLATE.toString(), Utilities.inspect(request.headers), Utilities.inspect(request.params));
  //
  //   try {
  //
  //     var templatePath = Path.join(STATIC_PATH, request.params[0]);
  //     var options = {
  //       'filename': templatePath,
  //       'doctype': 'html',
  //       'pretty': true,
  //       'self': true,
  //       'debug': true,
  //       'compileDebug':true
  //     };
  //
  //     Log.info('> Template.compileFile(%j, options)\n\n%s\n', templatePath, Utilities.inspect(options));
  //     var templateFn = Template.compileFile(templatePath, options);
  //
  //     var rendered = templateFn({});
  //
  //     response.send(rendered);
  //
  //   } catch (error) {
  //     Log.error('< server.get(%j, function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n\nerror.stack\n-----------\n\n%s\n', REGEXP_STATIC_TEMPLATE.toString(), Utilities.inspect(request.headers), Utilities.inspect(request.params), error.stack);
  //     response.send(error);
  //   } finally {
  //     next();
  //   }
  //
  // });

  server.get(REGEXP_STATIC, function(request, response, next) {
    Log.info('> server.get(%j, function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', REGEXP_STATIC.toString(), Utilities.inspect(request.headers), Utilities.inspect(request.params));
    Server.serveStatic({
      'directory': STATIC_PATH,
      'maxAge': 0
    })(request, response, next);
  });

};

module.exports = Static;

var Utilities = require('util');

var Application = require('../application');
var Log = require('../../../client/library/log');

var Status = Object.create({});

Status.createRoutes = function(server, databasePath, options) {

  server.head('/api/status', function(request, response, next) {
    Log.info('> server.head("/api/status", function(request, response, next) { ... })');
    response.send(200);
    next();
  });

  server.get('/api/status', function(request, response, next) {
    Log.info('> server.get("/api/status", function(request, response, next) { ... })');
    Application.getStatus(databasePath, options, function(error, status) {
      if (error)
        response.send(error);
      else
        response.send(status);
      next();
    });
  });

  server.head('/api/error', function(request, response, next) {
    Log.info('> server.head("/api/error", function(request, response, next) { ... })');
    throw new Error('server.head("/api/error", function(request, response, next) { ... })');
  });

  // server.head('/api/crash', function(request, response, next) {
  //   Log.info('> server.head("/api/crash", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Utilities.inspect(request.headers));
  //   throw new Error('server.head("/api/crash", function(request, response, next) { ... })');
  // });

  server.on('uncaughtException', function(request, response, route, error) {
    Log.error('> server.on("uncaughtException", function(request, response, route, error) { ... })\n\nrequest.params\n--------------\n%s\n\nroute\n-----\n%s\n\nerror.stack\n-----------\n%s\n', Utilities.inspect(request.params), Utilities.format(route), error.stack);

    if (route.spec.method == 'HEAD' &&
        route.spec.path == '/api/error' &&
        request.params.throw)
      throw error;
    else
      response.send(error);

  });

};

module.exports = Status;

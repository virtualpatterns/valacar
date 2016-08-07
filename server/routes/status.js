var Utilities = require('util');

var Application = require('../library/application');
var Log = require('../../client/library/log');

var Status = Object.create({});

Status.createRoutes = function(server, databasePath, options) {

  server.head('/api/status', function(request, response, next) {
    Log.info('> server.head("/api/status", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Utilities.inspect(request.headers));
    response.send(200);
    next();
  });

  server.get('/api/status', function(request, response, next) {
    Log.info('> server.get("/api/status", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Utilities.inspect(request.headers));
    Application.getStatus(databasePath, options, function(error, status) {
      if (error)
        response.send(error);
      else
        response.send(status);
      next();
    });
  });

};

module.exports = Status;

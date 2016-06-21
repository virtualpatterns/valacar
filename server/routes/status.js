

var Utilities = require('util');

var Log = require('../../client/library/log');
var Package = require('../../package.json');

var Status = Object.create({});

Status.createRoutes = function(server, databasePath, options) {

  server.head('/api/status', function(request, response, next) {
    Log.info('> server.head("/api/status", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Utilities.inspect(request.headers));
    response.send(200);
    next();
  });

  server.get('/api/status', function(request, response, next) {
    Log.info('> server.get("/api/status", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Utilities.inspect(request.headers));
    response.send({
      'name': Package.name,
      'version': Package.version
    });
    next();
  });

};

module.exports = Status;

var Utilities = require('util');

var Application = require('../library/application');
var Log = require('../../client/library/log');

var Leases = Object.create({});

Leases.createRoutes = function(server, databasePath, options) {

  server.head('/api/leases', function(request, response, next) {
    Log.info('> server.head("/api/leases", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Utilities.inspect(request.headers));
    response.send(200);
    next();
  });

  server.get('/api/leases', function(request, response, next) {
    Log.info('> server.get("/api/leases", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Utilities.inspect(request.headers));
    Application.getLeases(databasePath, options, function(error, rows) {
      if (error)
        response.send(error);
      else
        response.send(rows);
      next();
    });
  });

  server.get('/api/leases/:address/:from/:to', function(request, response, next) {
    Log.info('> server.get("/api/leases/:address/:from/:to", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.headers), Utilities.inspect(request.params));

    try {

      var _from = new Date(request.params.from);
      var _to = new Date(request.params.to);

      // Leave it like this ... required to complete validation!
      Log.info('=   _from.toISOString()=%j', _from.toISOString());
      Log.info('=   _to.toISOString()=%j', _to.toISOString());

      Application.getLease(request.params.address, _from, _to, databasePath, options, function(error, row) {
        if (error)
          response.send(error);
        else if (row)
          response.send(row);
        else
          response.send(404);
      });

    }
    catch (error) {
      response.send(error);
    }
    finally {
      next();
    }

  });

  server.post('/api/leases', function(request, response, next) {
    Log.info('> server.post("/api/leases", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.headers), Utilities.inspect(request.params));
    Application.postLease(request.params.address, request.params.device, request.params.host, databasePath, options, function(error, row) {
      if (error)
        response.send(error);
      else {

        try {

          var _from = new Date(row.from);
          var _to = new Date(row.to);

          // Leave it like this ... required to complete validation!
          Log.info('=   _from.toISOString()=%j', _from.toISOString());
          Log.info('=   _to.toISOString()=%j', _to.toISOString());

          response.header('Location', Utilities.format('/api/leases/%s/%s/%s', row.address, _from.toISOString(), _to.toISOString()));
          response.send(201, row);

        }
        catch (error) {
          response.send(error);
        }

      }
      next();
    });
  });

  server.del('/api/leases', function(request, response, next) {
    Log.info('> server.del("/api/leases", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.headers), Utilities.inspect(request.params));
    Application.deleteLeases(databasePath, options, function(error, numberOfChanges) {
      if (error)
        response.send(error);
      else if (numberOfChanges <= 0)
        response.send(404);
      else
        response.send(204);
      next();
    });
  });

  server.del('/api/leases/:address', function(request, response, next) {
    Log.info('> server.del("/api/leases/:address", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.headers), Utilities.inspect(request.params));
    Application.deleteLease(request.params.address, databasePath, options, function(error, numberOfChanges) {
      if (error)
        response.send(error);
      else if (numberOfChanges <= 0)
        response.send(404);
      else
        response.send(204);
      next();
    });
  });

};

module.exports = Leases;

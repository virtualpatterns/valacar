require('datejs');

var Utilities = require('util');

var Application = require('../application');
var Database = require('../../../client/library/database');
var Log = require('../../../client/library/log');

var Leases = Object.create({});

Leases.createRoutes = function(server, databasePath, options) {

  server.head('/api/exists/leases', function(request, response, next) {
    Log.info('> server.head("/api/exists/leases", function(request, response, next) { ... })');
    response.send(200);
    next();
  });

  server.get('/api/exists/leases/:address', function(request, response, next) {
    Log.info('> server.get("/api/exists/leases/:address", function(request, response, next) { ... })\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.params));

    var from = Database.MINIMUM_DATE;
    var to = Database.MINIMUM_DATE;

    Application.getLease(request.params.address, from, to, databasePath, options, function(error, row) {
      if (error)
        response.send(error);
      else if (row)
        response.send({
          'exists': true
        });
      else
        response.send({
          'exists': false
        });
      next();
    });

  });

  server.get('/api/exists/leases/:address/:from/:to', function(request, response, next) {
    Log.info('> server.get("/api/exists/leases/:address/:from/:to", function(request, response, next) { ... })\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.params));

    try {

      var from = Date.parse(request.params.from);
      var to = Date.parse(request.params.to);

      // Leave it like this ... required to complete validation!
      Log.info('=   from.toISOString()=%j', from.toISOString());
      Log.info('=   to.toISOString()=%j', to.toISOString());

      Application.getLease(request.params.address, from, to, databasePath, options, function(error, row) {
        if (error)
          response.send(error);
        else if (row)
          response.send({
            'exists': true
          });
        else
          response.send({
            'exists': false
          });
      });

    }
    catch (error) {
      Log.error('< server.post("/api/leases", function(request, response, next) { ... })');
      Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
      response.send(error);
    }
    finally {
      next();
    }

  });

  server.head('/api/leases', function(request, response, next) {
    Log.info('> server.head("/api/leases", function(request, response, next) { ... })');
    response.send(200);
    next();
  });

  server.get('/api/leases', function(request, response, next) {
    Log.info('> server.get("/api/leases", function(request, response, next) { ... })');
    Application.getLeases(databasePath, options, function(error, rows) {
      if (error)
        response.send(error);
      else
        response.send(rows);
      next();
    });
  });

  server.get('/api/leases/:address', function(request, response, next) {
    Log.info('> server.get("/api/leases/:address", function(request, response, next) { ... })\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.params));

    var from = Database.MINIMUM_DATE;
    var to = Database.MINIMUM_DATE;

    Application.getLease(request.params.address, from, to, databasePath, options, function(error, row) {
      if (error)
        response.send(error);
      else if (row)
        response.send(row);
      else
        response.send(404);
      next();
    });

  });

  server.get('/api/leases/:address/:from/:to', function(request, response, next) {
    Log.info('> server.get("/api/leases/:address/:from/:to", function(request, response, next) { ... })\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.params));

    try {

      var from = Date.parse(request.params.from);
      var to = Date.parse(request.params.to);

      // Leave it like this ... required to complete validation!
      Log.info('=   from.toISOString()=%j', from.toISOString());
      Log.info('=   to.toISOString()=%j', to.toISOString());

      Application.getLease(request.params.address, from, to, databasePath, options, function(error, row) {
        if (error)
          response.send(error);
        else if (row)
          response.send(row);
        else
          response.send(404);
      });

    }
    catch (error) {
      Log.error('< server.post("/api/leases", function(request, response, next) { ... })');
      Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
      response.send(error);
    }
    finally {
      next();
    }

  });

  server.post('/api/leases', function(request, response, next) {
    Log.info('> server.post("/api/leases", function(request, response, next) { ... })\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.params));
    Application.postLease(request.params.address, request.params.from ? Date.parse(request.params.from) : Database.MINIMUM_DATE, request.params.to ? Date.parse(request.params.to) : Database.MINIMUM_DATE, request.params.device, request.params.host, databasePath, options, function(error, row) {
      if (error)
        response.send(error);
      else {

        try {

          var from = Date.parse(row.from);
          var to = Date.parse(row.to);

          // Leave it like this ... required to complete validation!
          Log.info('=   from.toISOString()=%j', from.toISOString());
          Log.info('=   to.toISOString()=%j', to.toISOString());

          response.header('Location', Utilities.format('/api/leases/%s/%s/%s', row.address, from.toISOString(), to.toISOString()));
          response.send(201, row);

        }
        catch (error) {
          Log.error('< server.post("/api/leases", function(request, response, next) { ... })');
          Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
          response.send(error);
        }

      }
      next();
    });
  });

  server.del('/api/leases', function(request, response, next) {
    Log.info('> server.del("/api/leases", function(request, response, next) { ... })\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.params));
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
    Log.info('> server.del("/api/leases/:address", function(request, response, next) { ... })\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.params));

    var from = Database.MINIMUM_DATE;
    var to = Database.MINIMUM_DATE;

    Application.deleteLease(request.params.address, from, to, databasePath, options, function(error, numberOfChanges) {
      if (error)
        response.send(error);
      else if (numberOfChanges <= 0)
        response.send(404);
      else
        response.send(204);
      next();
    });

  });

  server.del('/api/leases/:address/:from/:to', function(request, response, next) {
    Log.info('> server.del("/api/leases/:address/:from/:to", function(request, response, next) { ... })\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.params));

    try {

      var from = Date.parse(request.params.from);
      var to = Date.parse(request.params.to);

      // Leave it like this ... required to complete validation!
      Log.info('=   from.toISOString()=%j', from.toISOString());
      Log.info('=   to.toISOString()=%j', to.toISOString());

      Application.deleteLease(request.params.address, from, to, databasePath, options, function(error, numberOfChanges) {
        if (error)
          response.send(error);
        else if (numberOfChanges <= 0)
          response.send(404);
        else
          response.send(204);
      });

    }
    catch (error) {
      Log.error('< server.post("/api/leases", function(request, response, next) { ... })');
      Log.error('    error.message=%j\n\n%s\n', error.message, error.stack);
      response.send(error);
    }
    finally {
      next();
    }

  });

};

module.exports = Leases;

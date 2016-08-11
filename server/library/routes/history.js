require('datejs');

var Utilities = require('util');

var Application = require('../application');
var Database = require('../../../client/library/database');
var Log = require('../../../client/library/log');

var History = Object.create({});

History.createRoutes = function(server, databasePath, options) {

  server.head('/api/range/history', function(request, response, next) {
    Log.info('> server.head("/api/range/history", function(request, response, next) { ... })');
    response.send(200);
    next();
  });

  server.get('/api/range/history', function(request, response, next) {
    Log.info('> server.get("/api/range/history", function(request, response, next) { ... })');
    Application.getHistoryRange(databasePath, options, function(error, row) {
      if (error)
        response.send(error);
      else
        response.send(row);
      next();
    });
  });

  server.head('/api/history', function(request, response, next) {
    Log.info('> server.head("/api/history", function(request, response, next) { ... })');
    response.send(200);
    next();
  });

  server.get('/api/history', function(request, response, next) {
    Log.info('> server.get("/api/history", function(request, response, next) { ... })\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.params));

    try {

      var filterDate = request.params.filterDate ? Date.parse(request.params.filterDate) : null;
      var filterString = request.params.filterString || null;
      var filterNull = !!request.params.filterNull;

      // Leave it like this ... required to complete validation!
      if (filterDate)
        Log.info('=   filterDate.toISOString()=%j', filterDate.toISOString());

      Log.info('=   filterString=%j', filterString);
      Log.info('=   filterNull=%j', filterNull);

      Application.getHistory(filterDate, filterString, filterNull, databasePath, options, function(error, rows) {
        if (error)
          response.send(error);
        else
          response.send(rows);
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

module.exports = History;

var Utilities = require('util');

var Application = require('../library/application');
var Log = require('../../client/library/log');

var Translations = Object.create({});

Translations.createRoutes = function(server, databasePath, options) {

  server.head('/api/translations', function(request, response, next) {
    Log.info('> server.head("/api/translations", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Utilities.inspect(request.headers));
    response.send(200);
    next();
  });

  server.get('/api/translations', function(request, response, next) {
    Log.info('> server.get("/api/translations", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Utilities.inspect(request.headers));
    Application.getTranslations(databasePath, options, function(error, rows) {
      if (error)
        response.send(error);
      else {
        // Log.debug('= server.get("/api/translations", function(request, response, next) { ... })\n\nrows\n----\n%s\n', Utilities.inspect(rows));
        response.send(rows);
      }
      next();
    });
  });

  server.get('/api/translations/:from', function(request, response, next) {
    Log.info('> server.get("/api/translations/:from", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.headers), Utilities.inspect(request.params));
    Application.getTranslation(request.params.from, databasePath, options, function(error, row) {
      if (error)
        response.send(error);
      else if (row)
        response.send(row);
      else
        response.send(404);
      next();
    });
  });

  server.post('/api/translations', function(request, response, next) {
    Log.info('> server.post("/api/translations", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.headers), Utilities.inspect(request.params));
    Application.postTranslation(request.params.from, request.params.to, databasePath, options, function(error, row) {
      if (error)
        response.send(error);
      else {
        // Log.debug('= server.post("/api/translations", function(request, response, next) { ... })\n\nrow\n---\n%s\n', Utilities.inspect(row));
        response.header('Location', Utilities.format('/api/translations/%s', row.from));
        response.send(201, row);
      }
      next();
    });
  });

  server.del('/api/translations', function(request, response, next) {
    Log.info('> server.del("/api/translations", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.headers), Utilities.inspect(request.params));
    Application.deleteTranslations(databasePath, options, function(error, numberOfChanges) {
      if (error)
        response.send(error);
      else if (numberOfChanges <= 0)
        response.send(404);
      else
        response.send(204);
      next();
    });
  });

  server.del('/api/translations/:from', function(request, response, next) {
    Log.info('> server.del("/api/translations/:from", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.headers), Utilities.inspect(request.params));
    Application.deleteTranslation(request.params.from, databasePath, options, function(error, numberOfChanges) {
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

module.exports = Translations;

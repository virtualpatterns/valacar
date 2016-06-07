'use strict';

const Utilities = require('util');

const Application = require('../library/application');
const Log = require('../../library/log');

const Translation = Object.create({});

Translation.createRoutes = function(server, databasePath, options) {

  server.head('/translations', function(request, response, next) {
    Log.info('> server.head("/translations", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Utilities.inspect(request.headers));
    response.send(200);
    next();
  });

  server.get('/translations', function(request, response, next) {
    Log.info('> server.get("/translations", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Utilities.inspect(request.headers));
    Application.getTranslations(databasePath, options, function(error, rows) {
      if (error)
        response.send(error);
      else {
        // Log.debug('= server.get("/translations", function(request, response, next) { ... })\n\nrows\n----\n%s\n', Utilities.inspect(rows));
        response.send(rows);
      }
      next();
    });
  });

  server.get('/translations/:from', function(request, response, next) {
    Log.info('> server.get("/translations/:from", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.headers), Utilities.inspect(request.params));
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

  server.post('/translations', function(request, response, next) {
    Log.info('> server.post("/translations", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.headers), Utilities.inspect(request.params));
    Application.postTranslation(request.params.from, request.params.to, databasePath, options, function(error, row) {
      if (error)
        response.send(error);
      else {
        // Log.debug('= server.post("/translations", function(request, response, next) { ... })\n\nrow\n---\n%s\n', Utilities.inspect(row));
        response.header('Location', Utilities.format('/translations/%s', row.from));
        response.send(201, row);
        next();
      }
    });
  });

  // server.post('/translations', function(request, response, next) {
  //   Log.info('> server.post("/translations", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.headers), Utilities.inspect(request.params));
  //   Application.postTranslation(request.params.from, request.params.to, databasePath, options, function(row, callback) {
  //     response.header('Location', Utilities.format('/translations/%s', row.from));
  //     response.send(201, row);
  //     callback(null);
  //   }, function(error) {
  //     if (error)
  //       response.send(error);
  //     next();
  //   });
  // });

  server.del('/translations/:from', function(request, response, next) {
    Log.info('> server.del("/translations/:from", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Utilities.inspect(request.headers), Utilities.inspect(request.params));
    Application.deleteTranslation(request.params.from, databasePath, options, function(error, numberOfChanges) {
      if (error)
        response.send(error);
      else if (numberOfChanges <= 0)
        response.send(404);
      else
        response.send(200);
      next();
    });
  });

};

module.exports = Translation;

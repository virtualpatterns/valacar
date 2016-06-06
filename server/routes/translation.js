'use strict';

const Utilities = require('util');

const Application = require('../library/application');
const Log = require('../../library/log');

const Translation = Object.create({});

Translation.createRoutes = function(server, databasePath, options) {

  server.head('/translations', function(request, response, next) {
    Log.info('> server.head("/translations", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Log.render(request.headers));
    response.send(200);
    next();
  });

  server.get('/translations', function(request, response, next) {
    Log.info('> server.get("/translations", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Log.render(request.headers));
    Application.getTranslations(databasePath, options, function(rows, callback) {
      response.send(rows);
      callback(null);
    }, function(error) {
      if (error)
        response.send(error);
      next();
    });
  });

  server.get('/translations/:from', function(request, response, next) {
    Log.info('> server.get("/translations/:from", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Log.render(request.headers), Log.render(request.params));
    Application.getTranslation(request.params.from, databasePath, options, function(row, callback) {
      if (row)
        response.send(row);
      else
        response.send(404);
      callback(null);
    }, function(error) {
      if (error)
        response.send(error);
      next();
    });
  });

  server.post('/translations', function(request, response, next) {
    Log.info('> server.post("/translations", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Log.render(request.headers), Log.render(request.params));
    Application.postTranslation(request.params.from, request.params.to, databasePath, options, function(row, callback) {
      response.header('Location', Utilities.format('/translations/%s', row.from));
      response.send(201, row);
      callback(null);
    }, function(error) {
      if (error)
        response.send(error);
      next();
    });
  });

  server.del('/translations/:from', function(request, response, next) {
    Log.info('> server.del("/translations/:from", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n\nrequest.params\n--------------\n%s\n', Log.render(request.headers), Log.render(request.params));
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

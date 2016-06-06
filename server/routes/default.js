'use strict';

const Utilities = require('util');

const Log = require('../../library/log');
const Package = require('../../package.json');

const Default = Object.create({});

Default.createRoutes = function(server, databasePath, options) {

  server.head('/', function(request, response, next) {
    Log.info('> server.head("/", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Log.render(request.headers));
    response.send(200);
    next();
  });

  server.get('/', function(request, response, next) {
    Log.info('> server.get("/", function(request, response, next) { ... })\n\nrequest.headers\n---------------\n%s\n', Log.render(request.headers));
    response.send({
      'name': Package.name,
      'version': Package.version,
      'databasePath': databasePath
    });
    next();
  });

};

module.exports = Default;

var Assert = require('assert');
var Is = require('@pwn/is');
var Utilities = require('util');

var Body = require('./elements/body');
var Log = require('./log');
var Pages = require('./collections/pages');

var applicationPrototype = Object.create({});

applicationPrototype.addPage = function(newPage, callback) {
  Log.info('> Application.addPage(newPage, callback) { ... }');

  var _this = this;

  newPage.render(function(error, newContent) {
    if (error)
      callback(error);
    else {

      if (_this.pages.isNotEmpty()) {

        var currentPage = _this.pages.top();

        currentPage.hide();
        currentPage.triggerHidden({
          'isFinal': false
        });

        currentPage.unbind();

      }

      _this.pages.addToTop(newPage);
      _this.body.addContent(newContent);

      newPage.bind();

      newPage.show();
      newPage.triggerShown({
        'isInitial': true
      });

    }
  });

};

applicationPrototype.removePage = function() {
  Log.info('> Application.removePage() { ... }');

  if (this.pages.isNotAlmostEmpty()) {

    var currentPage = this.pages.removeFromTop();

    currentPage.hide();
    currentPage.triggerHidden({
      'isFinal': true
    });

    currentPage.unbind();

    currentPage.removeContent();

    var newPage = this.pages.top();

    newPage.bind();

    newPage.show();
    newPage.triggerShown({
      'isInitial': false
    });

  }

};

var Application = Object.create({});

Application.createApplication = function(prototype, callback) {
  Log.info('> Application.createApplication(callback)');

  if (Is.function(prototype)) {
    callback = prototype;
    prototype = applicationPrototype;
  }

  var application = Object.create(prototype);

  Object.defineProperty(application, 'pages', {
    'enumerable': false,
    'writable': false,
    'value': Pages.createPages()
  });

  Object.defineProperty(application, 'body', {
    'enumerable': false,
    'writable': false,
    'value': Body.createElement()
  });

  var actualId = jQuery('html > body').attr('id');
  var expectedId = application.body.id;

  Assert.equal(actualId, expectedId, Utilities.format('The <body/> element id (%s) is not the expected value (%s).', actualId, expectedId));

  Application.GET('/api/status', function(error, data) {
    if (error)
      callback(error);
    else {
      document.title = Utilities.format('%s v%s', data.name, data.version);
      callback(null, application);
    }
  });

};

Application.isApplication = function(application) {
  return applicationPrototype.isPrototypeOf(application);
};

Application.getApplicationPrototype = function() {
  return applicationPrototype;
};

Application.ifNotError = function(ifNotFn) {
  return function(error) {
    if (error) {
      Log.error('> Element.ifNotError(ifNotFn) { ... }');
      Log.error('    error.message=%j', error.message);
      UIkit.modal.alert(error.message);
    }
    else if (ifNotFn) {

      var argumentsArray = Array.prototype.slice.call(arguments);
      var error = argumentsArray.shift();

      ifNotFn.apply(ifNotFn, argumentsArray);

    }
  };
};

Application.request = function(method, path, requestData, callback) {

  if (Is.function(requestData)) {
    callback = requestData;
    requestData = null;
  }

  if (requestData)
    Log.info('> Application.request(%j, %j, requestData, callback) { ... }\n\n%s\n\n', method, path, Utilities.inspect(requestData));
  else
    Log.info('> Application.request(%j, %j, requestData, callback) { ... }', method, path);

  var settings = {};
  settings.method = method;
  settings.url = path;
  settings.dataType = 'json';

  if (requestData) {

    Assert.ok(jQuery.isPlainObject(requestData), 'jQuery.isPlainObject(requestData) should be true but it is instead false.');

    settings.data = JSON.stringify(requestData);
    settings.contentType = 'application/json';
    settings.processData = false;

  }

  Log.info('> jQuery.ajax(settings)\n\n%s\n\n', Utilities.inspect(settings));
  jQuery.ajax(settings)
    .done(function(responseData) {
      Log.info('< Application.request(%j, %j, requestData, callback) { ... }\n\n%j\n\n', method, path, Utilities.inspect(responseData));
      callback(null, responseData);
    })
    .fail(function(request, status, error) {
      Log.error('< Application.request(%j, %j, requestData, callback) { ... }', method, path);
      Log.error('    request.status=%j', request.status);
      Log.error('    request.statusText=%j', request.statusText);
      Log.error('    request.responseJSON.message=%j', (request.responseJSON && request.responseJSON.message) ? request.responseJSON.message : '(none)');
      Log.error(request);
      callback(new URIError((request.responseJSON && request.responseJSON.message) ? request.responseJSON.message : Utilities.format('An error occurred with the request %s %j (%d %s).', method, path, request.status, request.statusText)));
      // callback(new URIError(Utilities.format('An error occurred with the request %s %j (%d %s ... %s).', method, path, request.status, request.statusText)));
    });

};

Application.GET = function(path, callback) {
  this.request('GET', path, callback);
};

Application.POST = function(path, data, callback) {
  this.request('POST', path, data, callback);
};

Application.DELETE = function(path, callback) {
  this.request('DELETE', path, callback);
};

module.exports = Application;

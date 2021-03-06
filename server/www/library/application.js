var Asynchronous = require('async');
var Assert = require('assert');
var Is = require('@pwn/is');
var Utilities = require('util');

var AlertModal = require('./elements/modals/alert-modal');
var Body = require('./elements/body');
var ConfirmationModal = require('./elements/modals/confirmation-modal');
var Log = require('./log');
var Pages = require('./collections/pages');

var applicationPrototype = Object.create({});

applicationPrototype.showPage = function(newPage, callback) {
  // Log.info('> Application.showPage(newPage, callback) { ... }');

  var self = this;

  newPage.render(function(error, newContent) {
    if (error)
      callback(error);
    else {

      if (self.pages.isNotEmpty()) {

        var currentPage = self.pages.top();

        currentPage.hide(false);
        self.triggerPageHidden({
          'page': currentPage,
          'isFinal': false
        });
        currentPage.unbind();

      }

      self.pages.addToTop(newPage);
      self.body.addContent(newContent);

      newPage.bind();
      newPage.show(true);
      self.triggerPageShown({
        'page': newPage,
        'isInitial': true
      });

      callback(null);

    }
  });

};

applicationPrototype.waitForPageShown = function(waitFn, callback) {
  // Log.info('> Application.waitForPageShown(waitFn, callback) { ... }');

  var self = this;

  Asynchronous.waterfall([
    function(callback) {
      Log.info('> jQuery(self).one("v-page-shown", function(event) { ... }');
      jQuery(self).one('v-page-shown', function(event) {
        Log.info('< jQuery(self).one("v-page-shown", function(event) { ... }');
        callback(null, event.page);
      });
    },
    function(page, callback) {
      if (page.hasElements()) {
        Asynchronous.each(page.getElements(), function(element, callback) {
          Log.info('> jQuery(element).one("v-shown", function(event) { ... }');
          jQuery(element).one('v-shown', function(event) {
            Log.info('< jQuery(element).one("v-shown", function(event) { ... }');
            callback(null);
          });
        }, callback);
      }
      else
        callback(null);
    }
  ], callback);

  waitFn(Application.ifNotError());

};

applicationPrototype.triggerPageShown = function(data) {
  jQuery(this).trigger(new jQuery.Event('v-page-shown', data));
};

applicationPrototype.hidePage = function() {
  // Log.info('> Application.hidePage() { ... }');

  if (this.pages.isNotAlmostEmpty()) {

    var currentPage = this.pages.top();

    currentPage.hide(true);
    this.triggerPageHidden({
      'page': currentPage,
      'isFinal': true
    });
    currentPage.unbind();

    currentPage.removeContent();
    this.pages.removeFromTop();

    var newPage = this.pages.top();

    newPage.bind();
    newPage.show(false);
    this.triggerPageShown({
      'page': newPage,
      'isInitial': false
    });

    return newPage;

  }

};

applicationPrototype.waitForPageHidden = function(callback) {
  // Log.info('> Application.waitForPageHidden(callback) { ... }');

  var self = this;

  self.waitForPageShown(function() {
    self.hidePage();
  }, callback);

};

applicationPrototype.triggerPageHidden = function(data) {
  jQuery(this).trigger(new jQuery.Event('v-page-hidden', data));
};

applicationPrototype.showModal = function(modal, options, callback) {

  if (Is.function(options)) {
    callback = options;
    options = {};
  }

  // Log.info('> Application.showModal(modal, options, callback) { ... }\n\n%s\n\n', Utilities.inspect(options));

  var self = this;

  modal.render(function(error, content) {
    if (error)
      callback(error);
    else {

      self.pages.addToTop(modal);
      self.body.addContent(content);

      // Log.info('> jQuery(modal).on("v-hidden", function(event) { ... }');
      jQuery(modal).on('v-hidden', function(event) {
        // Log.info('< jQuery(modal).on("v-hidden", function(event) { ... }\n\n%s\n\n', Utilities.inspect(event.results));
        callback(null, event.results);
      });

      modal.bind();
      modal.show(options);

    }
  });

};

applicationPrototype.onModalShown = function(event) {

  var modal = jQuery(event.target).data('Modal');

  if (modal) {
    Log.info('> Application.onModalShown(event) { ... } modal.id=%j', modal.id);

    modal.triggerShown();
    this.triggerModalShown({
      'modal': modal
    });
  }
  else {
    Log.info('> Application.onModalShown(event) { ... }');
    this.triggerModalShown();
  }

};

applicationPrototype.triggerModalShown = function(data) {
  jQuery(this).trigger(new jQuery.Event('v-modal-shown', data || {}));
};

applicationPrototype.hideModal = function(results) {
  Log.info('> Application.hideModal(results) { ... }\n\n%s\n\n', Utilities.inspect(results));

  if (this.pages.isNotAlmostEmpty()) {
    var modal = this.pages.top();
    modal.hide(results);
  }

};

applicationPrototype.onModalHidden = function(event) {

  var modal = jQuery(event.target).data('Modal');

  if (modal) {

    var results = jQuery(event.target).data('results');

    Log.info('> Application.onModalHidden(event) { ... } modal.id=%j\n\n%s\n\n', modal.id, Utilities.inspect(results));

    modal.unbind();

    modal.removeContent();
    this.pages.removeFromTop();

    modal.triggerHidden({
      'results': results
    });
    this.triggerModalHidden({
      'modal': modal,
      'results': results
    });

  }
  else {
    Log.info('> Application.onModalHidden(event) { ... }');
    this.triggerModalHidden();
  }

};

applicationPrototype.triggerModalHidden = function(data) {
  jQuery(this).trigger(new jQuery.Event('v-modal-hidden', data || {}));
};

applicationPrototype.showAlert = function(message, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  callback = argumentsArray.pop();
  message = Utilities.format.apply(Utilities.format, argumentsArray);

  this.showModal(AlertModal.createElement(message), callback);

};

applicationPrototype.showConfirmation = function(message, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  callback = argumentsArray.pop();
  message = Utilities.format.apply(Utilities.format, argumentsArray);

  this.showModal(ConfirmationModal.createElement(message), callback);

};

applicationPrototype.getPage = function() {
  // Log.info('> Application.getPage() { ... }');
  return this.pages.top();
};

var Application = Object.create({});

Object.defineProperty(Application, 'noop', {
  'enumerable': true,
  'writable': false,
  'value': function() {}
});

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

  application.body.bind();

  // Application.GET('/api/status', function(error, data) {
  //   if (error)
  //     callback(error);
  //   else {
  //     document.title = Utilities.format('%s v%s', data.name, data.version);
      callback(null, application);
  //   }
  // });

};

Application.isApplication = function(application) {
  return applicationPrototype.isPrototypeOf(application);
};

Application.getApplicationPrototype = function() {
  return applicationPrototype;
};

Application.alert = function(message) {

  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.push(function(error) {
    if (error) {
      Log.error('< Application.alert(message) { ... }\n\n%s\n\n', Utilities.inspect(argumentsArray));
      Log.error('    error.message=%j', error.message);
      alert(error.message);
    }
  })

  window.application.showAlert.apply(window.application, argumentsArray);

};

Application.confirm = function(message, yesFn, noFn) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  if (Is.function(argumentsArray[argumentsArray.length - 2]))
    noFn = argumentsArray.pop();
  else
    noFn = this.noop;

  yesFn = argumentsArray.pop();

  var self = this;

  argumentsArray.push(function(error, isConfirmed) {
    if (error) {
      Log.error('< Application.confirm(message, yesFn, noFn) { ... }\n\n%s\n\n', Utilities.inspect(argumentsArray));
      Log.error('    error.message=%j', error.message);
      self.alert(error.message);
    }
    else if (isConfirmed)
      yesFn();
    else
      noFn();
  })

  window.application.showConfirmation.apply(window.application, argumentsArray);

};

Application.ifNotError = function(ifNotFn) {

  var self = this;

  return function(error) {
    if (error) {
      Log.error('< Application.ifNotError(ifNotFn) { ... }');
      Log.error('    error.message=%j', error.message);
      self.alert(error.message);
    }
    else if (ifNotFn) {

      var argumentsArray = Array.prototype.slice.call(arguments);
      var error = argumentsArray.shift();

      ifNotFn.apply(ifNotFn, argumentsArray);

    }
  };

};

Application.RequestError = function(method, path, status, statusText) {

  this.name = 'RequestError';

  this.message = Utilities.format('An error occurred with the request %s %j (%d %s).', method, path, status, statusText);
  this.method = method;
  this.path = path;
  this.status = status;
  this.statusText = statusText;

  this.stack = (new Error()).stack;

}

Application.RequestError.prototype = Object.create(Error.prototype);
Application.RequestError.prototype.constructor = Application.RequestError;

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

  var url = window.localStorage.getItem('url');

  if (url)
    settings.url = Utilities.format('%s%s', url, path);
  else
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
    .done(function(responseData, status, request) {
      Log.debug('> jQuery.ajax(settings).done(function(responseData, %j, request) { ... })', status);
      if (!Is.undefined(request.responseJSON)) {
      // if (request.responseJSON) {
        Log.info('< Application.request(%j, %j, requestData, callback) { ... }\n\n%s\n\n', method, path, Utilities.inspect(request.responseJSON));
        callback(null, request.responseJSON);
      }
      else {
        Log.info('< Application.request(%j, %j, requestData, callback) { ... }', method, path);
        callback(null);
      }
    })
    .fail(function(request, status, error) {
      Log.error('< Application.request(%j, %j, requestData, callback) { ... }', method, path);
      Log.error('    request.status=%j', request.status);
      Log.error('    request.statusText=%j', request.statusText);
      Log.error('    request.responseJSON.message=%j', (request.responseJSON && request.responseJSON.message) ? request.responseJSON.message : '(none)');
      // Log.error(request);
      callback((request.responseJSON && request.responseJSON.message) ? new Error(Utilities.format('%s (%d %s)', request.responseJSON.message, request.status, request.statusText)) : new Application.RequestError(method, path, request.status, request.statusText));
      // callback(new URIError((request.responseJSON && request.responseJSON.message) ? request.responseJSON.message : Utilities.format('An error occurred with the request %s %j (%d %s).', method, path, request.status, request.statusText)));
      // callback(new URIError(Utilities.format('An error occurred with the request %s %j (%d %s ... %s).', method, path, request.status, request.statusText)));
    });

};

Application.GET = function(path, callback) {
  this.request('GET', path, callback);
};

Application.POST = function(path, data, callback) {
  // Log.debug('> Application.POST(%j, data, callback) { ... }\n\n%s\n\n', path, Utilities.inspect(data));
  this.request('POST', path, data, callback);
};

Application.DELETE = function(path, callback) {
  this.request('DELETE', path, callback);
};

module.exports = Application;

var Assert = require('assert');
var Is = require('@pwn/is');
var Template = require('pug');
var Utilities = require('util');

var Log = require('./log');

var elementPrototype = Object.create({});

elementPrototype.getElement = function() {
  var element = jQuery(Utilities.format('#%s', this.id));
  Assert.equal(element.length, 1, Utilities.format('The value of jQuery("#%s").length should be 1 but is instead %d.', this.id, element.length));
  return element;
};

elementPrototype.hasElements = function() {
  return false;
};

elementPrototype.getElements = function() {
  return [];
};

elementPrototype.show = function() {
  this.getElement()
    .toggleClass('uk-hidden', false);
  this.triggerShown();
};

elementPrototype.triggerShown = function(data) {
  jQuery(this).trigger(new jQuery.Event('shown', data || {}));
};

elementPrototype.hide = function() {
  this.getElement()
    .toggleClass('uk-hidden', true);
  this.triggerHidden();
};

elementPrototype.triggerHidden = function(data) {
  Log.debug('> Element.triggerHidden(data) { ... }\n\n%s\n\n', Utilities.inspect(data));
  jQuery(this).trigger(new jQuery.Event('hidden', data || {}));
};

elementPrototype.addContent = function(content) {
  this.getElement().prepend(content);
};

elementPrototype.removeContent = function() {
  this.getElement().remove();
};

elementPrototype.render = function(data, callback) {

  if (Is.function(data)) {
    callback = data;
    data = {};
  }

  var self = this;

  jQuery.get(self.templateURL)
    .done(function(templateData) {

      var content = null;

      try {

        var options = {
          'filename': self.templateURL,
          'doctype': 'html',
          'pretty': true,
          'self': false,
          'debug': false,
          'compileDebug':true
        };

        Log.info('> Template.compile(%j, options)\n\n%s\n\n', self.templateURL, Utilities.inspect(options));
        var templateFn = Template.compile(templateData, options);

        data.element = self;

        Log.info('> templateFn(data)\n\n%s\n\n', Utilities.inspect(data));
        content = templateFn(data);
        content = Element.hide(content);
        Log.info('< templateFn(data)\n\n%s\n\n', content);

      } catch (error) {
        Log.error('< Element.render(data, callback)\n\n%s\n\n', error.message);
        callback(new URIError(Utilities.format('An error occurred rendering the element template at %j.', self.templateURL)));
      }

      callback(null, content);

    })
    .fail(function(request, status, error) {
      Log.error('< Element.render(data, callback)');
      Log.error('    request.status=%j', request.status);
      Log.error('    request.statusText=%j', request.statusText);
      callback(new URIError(Utilities.format('An error occurred retrieving the element template from %j (%d %s).', self.templateURL, request.status, request.statusText)));
    });

};

elementPrototype.bind = function() {};

elementPrototype.unbind = function() {};

var Element = Object.create({});

Element.nextId = 0;

Element.createElement = function(templateURL, prototype) {
  Log.info('> Element.createElement(%j, prototype) { ... }', templateURL);

  var element = Object.create(prototype || elementPrototype);

  Object.defineProperty(element, 'id', {
    'enumerable': true,
    'writable': false,
    'value': Utilities.format('id_%d', Element.nextId++)
  });

  Object.defineProperty(element, 'templateURL', {
    'enumerable': true,
    'writable': false,
    'value': templateURL || '/www/views/element.jade'
  });

  return element;

};

Element.isElement = function(element) {
  return elementPrototype.isPrototypeOf(element);
};

Element.getElementPrototype = function() {
  return elementPrototype;
};

Element.show = function(content) {
  return jQuery(content).toggleClass('uk-hidden', false)[0].outerHTML;
};

Element.hide = function(content) {
  return jQuery(content).toggleClass('uk-hidden', true)[0].outerHTML;
};

module.exports = Element;

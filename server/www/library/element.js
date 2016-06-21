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

elementPrototype.show = function() {
  this.getElement().toggleClass('uk-hidden', false);
};

elementPrototype.hide = function() {
  this.getElement().toggleClass('uk-hidden', true);
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

  var _this = this;

  jQuery.get(_this.templateURL)
    .done(function(templateData) {

      try {

        var options = {
          'filename': _this.templateURL,
          'doctype': 'html',
          'pretty': true,
          'self': false,
          'debug': false,
          'compileDebug':true
        };

        Log.info('> Template.compile(%j, options)\n\n%s\n\n', _this.templateURL, Utilities.inspect(options));
        var templateFn = Template.compile(templateData, options);

        data.element = _this;

        Log.info('> templateFn(data)\n\n%s\n\n', Utilities.inspect(data));
        var content = templateFn(data);
        Log.info('< templateFn(data)\n%s\n\n', content);

        callback(null, content);

      } catch (error) {
        Log.error('< Element.render(data, callback)\n\n%s\n\n', error.message);
        callback(new URIError(Utilities.format('An error occurred rendering the element template at %j.', _this.templateURL)));
      }

    })
    .fail(function(request, status, error) {
      Log.error('< Element.render(data, callback)');
      Log.error('    request.status=%j', request.status);
      Log.error('    request.statusText=%j', request.statusText);
      callback(new URIError(Utilities.format('An error occurred retrieving the element template from %j (%d %s).', _this.templateURL, request.status, request.statusText)));
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

Element.show = function(content) {
  return jQuery(content).toggleClass('uk-hidden', false)[0].outerHTML;
};

Element.hide = function(content) {
  return jQuery(content).toggleClass('uk-hidden', true)[0].outerHTML;
};

Element.isElement = function(element) {
  return elementPrototype.isPrototypeOf(element);
};

Element.getElementPrototype = function() {
  return elementPrototype;
};

module.exports = Element;

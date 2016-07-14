var Assert = require('assert');
var Is = require('@pwn/is');
var Template = require('pug');
var Utilities = require('util');

var Log = require('./log');

var elementSourcePrototype = Object.create({});

var ElementSource = Object.create({});

ElementSource.createSourceId = function() {
  // Log.info('> ElementSource.createSourceId() { ... }');
  return null;
};

ElementSource.createSource = function(id, prototype) {
  // Log.info('> ElementSource.createSource(prototype) { ... }');

  var elementSource = Object.create(prototype || elementSourcePrototype);

  Object.defineProperty(elementSource, 'id', {
    'enumerable': true,
    'writable': false,
    'value': id
  });

  return elementSource;

};

ElementSource.isSource = function(elementSource) {
  return elementSourcePrototype.isPrototypeOf(elementSource);
};

ElementSource.getSourcePrototype = function() {
  return elementSourcePrototype;
};

var elementPrototype = Object.create({});

elementPrototype.show = function() {
  Element.show(this.getContent());
  this.triggerShown();
};

elementPrototype.triggerShown = function(data) {
  jQuery(this).trigger(new jQuery.Event('v-shown', data || {}));
};

elementPrototype.hide = function() {
  Element.hide(this.getContent());
  this.triggerHidden();
};

elementPrototype.triggerHidden = function(data) {
  // Log.debug('> Element.triggerHidden(data) { ... }\n\n%s\n\n', Utilities.inspect(data));
  jQuery(this).trigger(new jQuery.Event('v-hidden', data || {}));
};

elementPrototype.addContent = function(content) {
  this.getContent().prepend(content);
};

elementPrototype.removeContent = function() {
  this.getContent().remove();
};

elementPrototype.render = function(data, callback) {

  if (Is.function(data)) {
    callback = data;
    data = {};
  }

  // Log.info('> Element.render(data, callback) { ... }\n\n%s\n\n', Utilities.inspect(data));

  var self = this;

  jQuery.get(self.templateURL)
    .done(function(templateData) {

      var error = null;
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

        // Log.info('> Template.compile(%j, options)', self.templateURL);
        // Log.info('> Template.compile(%j, options)\n\n%s\n\n', self.templateURL, Utilities.inspect(options));
        var templateFn = Template.compile(templateData, options);

        data.element = self;

        Log.info('> templateFn(data)\n\n%s\n\n', Utilities.inspect(data));
        content = templateFn(data);
        content = Element.hide(content);
        Log.info('< templateFn(data)\n\n%s\n\n', content);

      } catch (_error) {
        // Leave it like this!
        Log.error('< Element.render(data, callback)\n\nerror.message\n-------------\n%s\n\nerror.stack\n-------------\n%s\n\n', _error.message, _error.stack);
        error = new URIError(Utilities.format('An error occurred rendering the element template at %j.', self.templateURL));
      }

      callback(error, content);

    })
    .fail(function(request, status) {
      Log.error('< Element.render(data, callback)');
      Log.error('    request.status=%j', request.status);
      Log.error('    request.statusText=%j', request.statusText);
      callback(new URIError(Utilities.format('An error occurred retrieving the element template from %j (%d %s).', self.templateURL, request.status, request.statusText)));
    });

};

elementPrototype.existsContent = function() {
  var element = jQuery(Utilities.format('#%s', this.id));
  Assert.ok(element.length == 0 || element.length == 1, Utilities.format('The value of jQuery("#%s").length should be 0 or 1 but is instead %d.', this.id, element.length));
  return element.length == 1;
};

elementPrototype.getContent = function() {
  var element = jQuery(Utilities.format('#%s', this.id));
  Assert.equal(element.length, 1, Utilities.format('The value of jQuery("#%s").length should be 1 but is instead %d.', this.id, element.length));
  return element;
};

elementPrototype.bind = function() {};

elementPrototype.unbind = function() {};

elementPrototype.getElements = function(Class) {
  // Log.debug('< Element.getElements(Class) { ... }');
  return Element.filter([], Class);
};

elementPrototype.hasElements = function(Class) {
  return this.getElements(Class).length > 0;
};

elementPrototype.refreshElements = function(Class, callback) {};

var Element = Object.create({});

Object.defineProperty(Element, 'nextId', {
  'enumerable': false,
  'writable': true,
  'value': 0
});

Element.Source = ElementSource;

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

Element.filter = function(elements, Class) {
  // Log.debug('< Element.filter(elements, Class) { ... }');
  return elements.filter(function(element) {
    return !Class || Class.isElement(element);
  });
};

module.exports = Element;

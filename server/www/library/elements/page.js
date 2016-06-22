var Is = require('@pwn/is');

var Element = require('../element');
var Log = require('../log');

var elementPrototype = Element.getElementPrototype();
var pagePrototype = Object.create(elementPrototype);

pagePrototype.render = function(data, callback) {

  if (Is.function(data)) {
    callback = data;
    data = {};
  }

  Log.info('> Page.render(callback)');
  elementPrototype.render.call(this, data, function(error, content) {
    if (error)
      callback(error);
    else {
      content = Element.hide(content);
      Log.info('< Page.render(callback)\n\n%s\n\n', content);
      callback(null, content);
    }
  });
};

pagePrototype.triggerShown = function(data) {
  this.getElement().trigger(new jQuery.Event('shown', data));
};

pagePrototype.triggerHidden = function(data) {
  this.getElement().trigger(new jQuery.Event('hidden', data));
};

var Page = Object.create(Element);

Page.createElement = function(templateURL, prototype) {
  return Element.createElement.call(this, templateURL || '/www/views/elements/page.jade', prototype || pagePrototype);
};

Page.isElement = function(page) {
  return pagePrototype.isPrototypeOf(page);
};

Page.getElementPrototype = function() {
  return pagePrototype;
};

module.exports = Page;

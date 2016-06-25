var Is = require('@pwn/is');

var Element = require('../element');
var Log = require('../log');

var elementPrototype = Element.getElementPrototype();
var pagePrototype = Object.create(elementPrototype);

pagePrototype.show = function(isInitial) {
  this.getElement()
    .toggleClass('uk-hidden', false)
    .toggleClass('v-page-top', true);
  this.triggerShown({
    'isInitial': isInitial || false
  });
};

pagePrototype.hide = function(isFinal) {
  this.getElement()
    .toggleClass('uk-hidden', true)
    .toggleClass('v-page-top', false);
  this.triggerHidden({
    'isFinal': isFinal || false
  });
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

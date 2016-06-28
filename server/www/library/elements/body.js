var Element = require('../element');
var Log = require('../log');

var elementPrototype = Element.getContentPrototype();
var bodyPrototype = Object.create(elementPrototype);

bodyPrototype.bind = function() {

  elementPrototype.bind.call(this);

  this.getContent().on('show.uk.modal', {
    'this': this
  }, this.onModalShown);
  this.getContent().on('hide.uk.modal', {
    'this': this
  }, this.onModalHidden);

};

bodyPrototype.unbind = function() {

  this.getContent().off('hide.uk.modal', this.onModalHidden);
  this.getContent().off('show.uk.modal', this.onModalShown);

  elementPrototype.unbind.call(this);

};

bodyPrototype.onModalShown = function(event) {
  Log.info('> Body.onModalShown(event) { ... }');
  window.application.triggerModalShown();
};

bodyPrototype.onModalHidden = function(event) {
  Log.info('> Body.onModalHidden(event) { ... }');
  window.application.triggerModalHidden();
};

var Body = Object.create(Element);

Body.createElement = function(templateURL, prototype) {
  return Element.createElement.call(this, templateURL || '/www/views/elements/body.jade', prototype || bodyPrototype);
};

Body.isElement = function(body) {
  return bodyPrototype.isPrototypeOf(body);
};

Body.getContentPrototype = function() {
  return bodyPrototype;
};

module.exports = Body;

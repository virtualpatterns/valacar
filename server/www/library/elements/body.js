var Element = require('../element');
var Log = require('../log');

var elementPrototype = Element.getElementPrototype();
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

  this.getContent().off('hide.uk.modal', window.application.onModalHidden);
  this.getContent().off('show.uk.modal', window.application.onModalShown);

  elementPrototype.unbind.call(this);

};

bodyPrototype.onModalShown = function(event) {
  window.application.onModalShown(event);
};

bodyPrototype.onModalHidden = function(event) {
  window.application.onModalHidden(event);
};

var Body = Object.create(Element);

Body.createElement = function(templateURL, prototype) {
  return Element.createElement.call(this, templateURL || '/www/views/elements/body.jade', prototype || bodyPrototype);
};

Body.isElement = function(body) {
  return bodyPrototype.isPrototypeOf(body);
};

Body.getElementPrototype = function() {
  return bodyPrototype;
};

module.exports = Body;

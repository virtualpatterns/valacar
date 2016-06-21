var Element = require('../element');

var elementPrototype = Element.getElementPrototype();
var bodyPrototype = Object.create(elementPrototype);

bodyPrototype.render = function(callback) {
  callback(null, '');
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

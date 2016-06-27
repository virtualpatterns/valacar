var Element = require('../element');
var Log = require('../log');

var elementPrototype = Element.getContentPrototype();
var bodyPrototype = Object.create(elementPrototype);

bodyPrototype.render = function(data, callback) {
  Log.info('< Body.render(data, callback) { ... }');
  callback(null, '');
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

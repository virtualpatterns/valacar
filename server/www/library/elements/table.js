var Element = require('../element');

var elementPrototype = Element.getContentPrototype();
var tablePrototype = Object.create(elementPrototype);

var Table = Object.create(Element);

Table.createElement = function(templateURL, prototype) {
  return Element.createElement.call(this, templateURL || '/www/views/elements/table.jade', prototype || tablePrototype);
};

Table.isElement = function(table) {
  return tablePrototype.isPrototypeOf(table);
};

Table.getContentPrototype = function() {
  return tablePrototype;
};

module.exports = Table;

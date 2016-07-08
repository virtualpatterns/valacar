var Element = require('../element');

var elementPrototype = Element.getElementPrototype();
var tablePrototype = Object.create(elementPrototype);

var Table = Object.create(Element);

Table.createElement = function(templateURL, prototype) {
  return Element.createElement.call(this, templateURL || '/www/views/elements/table.jade', prototype || tablePrototype);
};

Table.isElement = function(table) {
  return tablePrototype.isPrototypeOf(table);
};

Table.getElementPrototype = function() {
  return tablePrototype;
};

module.exports = Table;

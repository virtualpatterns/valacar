var Utilities = require('util');

var Application = require('../../application');
var Log = require('../../log');
var Table = require('../table');

var tablePrototype = Table.getElementPrototype();
var translationsTablePrototype = Object.create(tablePrototype);

var TranslationsTable = Object.create(Table);

TranslationsTable.createElement = function(templateURL, prototype) {
  return Table.createElement.call(this, templateURL || '/www/views/elements/tables/translations-table.jade', prototype || translationsTablePrototype);
};

TranslationsTable.isElement = function(translationsTable) {
  return translationsTablePrototype.isPrototypeOf(translationsTable);
};

TranslationsTable.getElementPrototype = function() {
  return translationsTablePrototype;
};

module.exports = TranslationsTable;

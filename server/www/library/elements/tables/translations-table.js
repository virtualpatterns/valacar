var Utilities = require('util');

var Application = require('../../application');
var Log = require('../../log');
var Table = require('../table');

var tablePrototype = Table.getElementPrototype();
var translationsTablePrototype = Object.create(tablePrototype);

translationsTablePrototype.bind = function() {
  this.getElement().find('tbody > tr').on('click', {
    'this': this
  }, this.onSelected);
};

translationsTablePrototype.unbind = function() {
  this.getElement().find('tbody > tr').off('click', this.onSelected);
};

translationsTablePrototype.onSelected = function(event) {
  Log.info('> TranslationsTable.onSelected(event) { ... } ...translationFrom=%j', event.currentTarget.dataset.translationFrom);
  event.data.this.triggerSelected({
    'translationFrom': event.currentTarget.dataset.translationFrom
  });
};

translationsTablePrototype.triggerSelected = function(data) {
  Log.info('> TranslationsTable.triggerSelected(data) { ... }\n\n%s\n\n', Utilities.inspect(data));
  this.getElement().trigger(new jQuery.Event('selected', data));
};

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

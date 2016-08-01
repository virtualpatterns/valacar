require('datejs');

var Moment = require('moment');
var Utilities = require('util');

var Application = require('../../application');
var Log = require('../../log');
var Table = require('../table');

var tableSourcePrototype = Table.Source.getSourcePrototype();
var historyTableSourcePrototype = Object.create(tableSourcePrototype);

var HistoryTableSource = Object.create(Table.Source);

HistoryTableSource.createSourceId = function(item) {
  // Log.debug('> HistoryTableSource.createSourceId(item) { ... }\n\n%s\n\n', Utilities.inspect(item));

  var itemId = {
    'address': item.address,
    'fromAsISOString': Date.parse(item.from).toISOString(),
    'toAsISOString': Date.parse(item.to).toISOString()
  };

  // Log.debug('< HistoryTableSource.createSourceId(item) { ... }\n\n%s\n\n', Utilities.inspect(itemId));

  return itemId;

};

HistoryTableSource.createSource = function(item, prototype) {
  // Log.debug('> HistoryTableSource.createSource(item, prototype) { ... }\n\n%s\n\n', Utilities.inspect(item));

  var historyTableSource = Table.Source.createSource.call(this, this.createSourceId(item), prototype || historyTableSourcePrototype);

  Object.assign(historyTableSource, item);

  historyTableSource.fromAsDate = Date.parse(item.from);
  historyTableSource.toAsDate = Date.parse(item.to);

  historyTableSource.fromAsISOString = historyTableSource.fromAsDate.toISOString(); // Moment(historyTableSource.fromAsDate).fromNow();
  historyTableSource.fromAsString = Moment(historyTableSource.fromAsDate).format('LLLL');
  historyTableSource.toAsISOString = historyTableSource.toAsDate.toISOString();
  historyTableSource.toAsString = Moment(historyTableSource.toAsDate).format('LLLL');

  // Log.debug('< HistoryTableSource.createSource(history, prototype) { ... }\n\n%s\n\n', Utilities.inspect(historyTableSource));

  return historyTableSource;

};

HistoryTableSource.isSource = function(source) {
  return historyTableSourcePrototype.isPrototypeOf(source);
};

HistoryTableSource.getSourcePrototype = function() {
  return historyTableSourcePrototype;
};

var tablePrototype = Table.getElementPrototype();
var historyTablePrototype = Object.create(tablePrototype);

var HistoryTable = Object.create(Table);

HistoryTable.Source = HistoryTableSource;

HistoryTable.createElement = function(templateURL, prototype) {
  return Table.createElement.call(this, templateURL || '/www/views/elements/tables/history-table.jade', prototype || historyTablePrototype);
};

HistoryTable.isElement = function(historyTable) {
  return historyTablePrototype.isPrototypeOf(historyTable);
};

HistoryTable.getElementPrototype = function() {
  return historyTablePrototype;
};

module.exports = HistoryTable;

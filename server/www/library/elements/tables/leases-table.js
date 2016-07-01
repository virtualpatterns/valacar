var Utilities = require('util');

var Application = require('../../application');
var Log = require('../../log');
var Table = require('../table');

var tablePrototype = Table.getContentPrototype();
var leasesTablePrototype = Object.create(tablePrototype);

var LeasesTable = Object.create(Table);

LeasesTable.createElement = function(templateURL, prototype) {
  return Table.createElement.call(this, templateURL || '/www/views/elements/tables/leases-table.jade', prototype || leasesTablePrototype);
};

LeasesTable.isElement = function(leasesTable) {
  return leasesTablePrototype.isPrototypeOf(leasesTable);
};

LeasesTable.getContentPrototype = function() {
  return leasesTablePrototype;
};

module.exports = LeasesTable;

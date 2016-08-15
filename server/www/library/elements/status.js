require('datejs');

var Format = require('human-format');
var Utilities = require('util');

var Application = require('../application');
var Element = require('../element');
var Log = require('../log');

var elementSourcePrototype = Element.Source.getSourcePrototype();
var statusSourcePrototype = Object.create(elementSourcePrototype);

var StatusSource = Object.create(Element.Source);

StatusSource.createSource = function(status, prototype) {
  // Log.info('> StatusSource.createSource(status, prototype) { ... }\n\n%s\n\n', Utilities.inspect(status));

  var statusSource = Element.Source.createSource.call(this, null, prototype || statusSourcePrototype);

  Object.assign(statusSource, status);

  statusSource.nowAsDate = Date.parse(statusSource.now);
  statusSource.nowAsString = statusSource.nowAsDate.toUTCString();

  statusSource.database.nowAsDate = Date.parse(statusSource.database.now);
  statusSource.database.nowAsString = statusSource.database.nowAsDate.toUTCString();

  statusSource.heap.totalAsString = Format(statusSource.heap.total, {
   scale: 'binary',
   unit: 'B'
  });
  statusSource.heap.usedAsString = Format(statusSource.heap.used, {
   scale: 'binary',
   unit: 'B'
  });

  return statusSource;

};

StatusSource.isSource = function(source) {
  return statusSourcePrototype.isPrototypeOf(source);
};

StatusSource.getSourcePrototype = function() {
  return statusSourcePrototype;
};

var elementPrototype = Element.getElementPrototype();
var statusPrototype = Object.create(elementPrototype);

statusPrototype.bind = function() {

  elementPrototype.bind.call(this);

  this.nowInterval = setInterval(this.onNowInterval.bind(this), 1000);

};

statusPrototype.unbind = function() {

  clearInterval(this.nowInterval);

  elementPrototype.unbind.call(this);

};

statusPrototype.onNowInterval = function() {
  // Log.info('> Status.onNowInterval() { ... }');
  this.getContent().find('dd#now').html(new Date().toUTCString());
};

var Status = Object.create(Element);

Status.Source = StatusSource;

Status.createElement = function(templateURL, prototype) {
  return Element.createElement.call(this, templateURL || '/www/views/elements/status.jade', prototype || statusPrototype);
};

Status.isElement = function(status) {
  return statusPrototype.isPrototypeOf(status);
};

Status.getElementPrototype = function() {
  return statusPrototype;
};

module.exports = Status;

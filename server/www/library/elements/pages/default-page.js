var Format = require('human-format');
var Is = require('@pwn/is');

var Application = require('../../application');
var Element = require('../../element');
var Log = require('../../log');
var Page = require('../page');

var HistoryPage = require('./history-page');
var LeasesPage = require('./leases-page');
var TranslationsPage = require('./translations-page');

var pagePrototype = Page.getElementPrototype();
var defaultPagePrototype = Object.create(pagePrototype);

defaultPagePrototype.render = function(data, callback) {

  if (Is.function(data)) {
    callback = data;
    data = {};
  }

  var self = this;

  Application.GET('/api/status', function(error, status) {
    if (error)
      callback(error);
    else {

      data.status = status;

      data.status.heap.totalAsString = Format(data.status.heap.total, {
       scale: 'binary',
       unit: 'B'
      });
      data.status.heap.usedAsString = Format(data.status.heap.used, {
       scale: 'binary',
       unit: 'B'
      });

      pagePrototype.render.call(self, data, callback);

    }
  });

};

defaultPagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  jQuery(this).on('v-shown', {
    'this': this
  }, this.onShown);

  this.getContent().find('#close').on('click', {
    'this': this
  }, this.onClose);
  this.getContent().find('#goLeases').on('click', {
    'this': this
  }, this.onGoLeases);
  this.getContent().find('#goTranslations').on('click', {
    'this': this
  }, this.onGoTranslations);
  this.getContent().find('#goHistory').on('click', {
    'this': this
  }, this.onGoHistory);

  this.getContent().find('#goTest').on('click', {
    'this': this
  }, this.onGoTest);

};

defaultPagePrototype.unbind = function() {

  this.getContent().find('#goTest').off('click', this.onGoTest);
  this.getContent().find('#goHistory').off('click', this.onGoHistory);
  this.getContent().find('#goTranslations').off('click', this.onGoTranslations);
  this.getContent().find('#goLeases').off('click', this.onGoLeases);
  this.getContent().find('#close').off('click', this.onClose);

  jQuery(this).off('v-shown', this.onShown);

  pagePrototype.unbind.call(this);

};

defaultPagePrototype.onShown = function(event) {
  Log.info('> DefaultPage.onShown(event) { ... }');

  var self = event.data.this;

  if (window.application.pages.isNotAlmostEmpty())
    Element.show(self.getContent().find('#close'));
  else
    Element.hide(self.getContent().find('#close'));

};

defaultPagePrototype.onClose = function(event) {
  Log.info('> DefaultPage.onClose(event) { ... }');
  window.application.hidePage();
};

defaultPagePrototype.onGoLeases = function(event) {
  Log.info('> DefaultPage.onGoLeases(event) { ... }');
  window.application.showPage(LeasesPage.createElement(), Application.ifNotError());
};

defaultPagePrototype.onGoTranslations = function(event) {
  Log.info('> DefaultPage.onGoTranslations(event) { ... }');
  window.application.showPage(TranslationsPage.createElement(), Application.ifNotError());
};

defaultPagePrototype.onGoHistory = function(event) {
  Log.info('> DefaultPage.onGoHistory(event) { ... }');
  window.application.showPage(HistoryPage.createElement(), Application.ifNotError());
};

defaultPagePrototype.onGoTest = function(event) {
  Log.info('> DefaultPage.onGoTest(event) { ... } window.location.href=%j', window.location.href);

  if (window.location.href.match(/default\.html/))
    window.location.href = '/www/test.html';
  else if (window.location.href.match(/default\.min\.html/))
    window.location.href = '/www/test.min.html';

};

var DefaultPage = Object.create(Page);

DefaultPage.createElement = function(templateURL, prototype) {
  return Page.createElement.call(this, templateURL || '/www/views/elements/pages/default-page.jade', prototype || defaultPagePrototype);
};

DefaultPage.isElement = function(defaultPage) {
  return defaultPagePrototype.isPrototypeOf(defaultPage);
};

DefaultPage.getElementPrototype = function() {
  return defaultPagePrototype;
};

module.exports = DefaultPage;

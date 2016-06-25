var Application = require('../../application');
var Log = require('../../log');
var Page = require('../page');

var LeasesPage = require('./leases-page');
var TranslationsPage = require('./translations-page');

var pagePrototype = Page.getElementPrototype();
var defaultPagePrototype = Object.create(pagePrototype);

defaultPagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  // this.getElement().find('#close').on('click', {
  //   'this': this
  // }, this.onClose);

  this.getElement().find('#goLeases').on('click', {
    'this': this
  }, this.onGoLeases);
  this.getElement().find('#goTranslations').on('click', {
    'this': this
  }, this.onGoTranslations);

  this.getElement().find('#goTest').on('click', {
    'this': this
  }, this.onGoTest);

};

defaultPagePrototype.unbind = function() {

  this.getElement().find('#goTest').off('click', this.onGoTest);
  this.getElement().find('#goTranslations').off('click', this.onGoTranslations);
  this.getElement().find('#goLeases').off('click', this.onGoLeases);
  // this.getElement().find('#close').off('click', this.onClose);

  pagePrototype.unbind.call(this);

};

// defaultPagePrototype.onClose = function(event) {
//   Log.info('> DefaultPage.onClose(event) { ... }');
//   window.application.hidePage();
// };

defaultPagePrototype.onGoLeases = function(event) {
  Log.info('> DefaultPage.onGoLeases(event) { ... }');
  window.application.showPage(LeasesPage.createElement(), Application.ifNotError());
};

defaultPagePrototype.onGoTranslations = function(event) {
  Log.info('> DefaultPage.onGoTranslations(event) { ... }');
  window.application.showPage(TranslationsPage.createElement(), Application.ifNotError());
};

defaultPagePrototype.onGoTest = function(event) {
  Log.info('> DefaultPage.onGoTest(event) { ... }');
  window.location.href = '/www/test.html';
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

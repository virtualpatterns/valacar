var Application = require('../../application');
var Log = require('../../log');
var Page = require('../page');

var BlankPage = require('./blank-page');
var TranslationsPage = require('./translations-page');

var pagePrototype = Page.getElementPrototype();
var defaultPagePrototype = Object.create(pagePrototype);

defaultPagePrototype.bind = function() {

  this.getElement().find('#goLeases').on('click', {
    'this': this
  }, this.onGoLeases);
  this.getElement().find('#goTranslations').on('click', {
    'this': this
  }, this.onGoTranslations);

};

defaultPagePrototype.unbind = function() {
  this.getElement().find('#goLeases').off('click', this.onGoLeases);
  this.getElement().find('#goTranslations').off('click', this.onGoTranslations);
};

defaultPagePrototype.onGoLeases = function(event) {
  Log.info('> DefaultPage.onGoLeases(event) { ... }');
  window.application.addPage(BlankPage.createElement(), Application.ifNotError());
};

defaultPagePrototype.onGoTranslations = function(event) {
  Log.info('> DefaultPage.onGoTranslations(event) { ... }');
  window.application.addPage(TranslationsPage.createElement(), Application.ifNotError());
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

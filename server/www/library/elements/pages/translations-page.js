var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../../application');
var Log = require('../../log');
var Page = require('../page');

var TranslationPage = require('./translation-page');
var TranslationsTable = require('../tables/translations-table');

var pagePrototype = Page.getElementPrototype();
var translationsPagePrototype = Object.create(pagePrototype);

translationsPagePrototype.bind = function() {

  this.getElement().on('shown', {
    'this': this
  }, this.onShown);

  this.getElement().on('hidden', {
    'this': this
  }, this.onHidden);

  this.getElement().find('#goBack').on('click', {
    'this': this
  }, this.onGoBack);
  this.getElement().find('#addTranslation').on('click', {
    'this': this
  }, this.onAddTranslation);

};

translationsPagePrototype.unbind = function() {

  this.getElement().find('#addTranslation').off('click', this.onAddTranslation);
  this.getElement().find('#goBack').off('click', this.onGoBack);

  this.getElement().off('hidden', this.onHidden);
  this.getElement().off('shown', this.onShown);

};

translationsPagePrototype.onShown = function(event) {
  Log.info('> TranslationsPage.onShown(event) { ... } event.isInitial=%s', event.isInitial);

  var _this = event.data.this;

  Asynchronous.waterfall([
    function(callback) {
      Application.GET('/api/translations', callback);
    },
    function(translations, callback) {
      _this.translationsTable.render({
        'translations': translations
      }, callback);
    }
  ], Application.ifNotError(function(content) {

    _this.getElement().find('> div').append(content);
    _this.translationsTable.bind();

    _this.translationsTable.getElement().on('selected', {
      'this': _this
    }, _this.onSelected);

  }));

};

translationsPagePrototype.onHidden = function(event) {
  Log.info('> TranslationsPage.onHidden(event) { ... } event.isFinal=%s', event.isFinal);

  var _this = event.data.this;

  _this.translationsTable.getElement().off('selected', _this.onSelected);

  _this.translationsTable.unbind();
  _this.translationsTable.removeContent();

};

translationsPagePrototype.onGoBack = function(event) {
  Log.info('> TranslationsPage.onGoBack(event) { ... }');
  window.application.removePage();
};

translationsPagePrototype.onAddTranslation = function(event) {
  Log.info('> TranslationsPage.onAddTranslation(event) { ... }');
  window.application.addPage(TranslationPage.createElement({}), Application.ifNotError());
};

translationsPagePrototype.onSelected = function(event) {
  Log.info('> TranslationsPage.onSelected(event) { ... } event.translationFrom=%j', event.translationFrom);

  var _this = event.data.this;

  Asynchronous.waterfall([
    function(callback) {
      Application.GET(Utilities.format('/api/translations/%s', event.translationFrom), callback);
    },
    function(translation, callback) {
      window.application.addPage(TranslationPage.createElement(translation), Application.ifNotError());
    }
  ], Application.ifNotError());

};

var TranslationsPage = Object.create(Page);

TranslationsPage.createElement = function(templateURL, prototype) {

  var translationsPage = Page.createElement.call(this, templateURL || '/www/views/elements/pages/translations-page.jade', prototype || translationsPagePrototype);

  Object.defineProperty(translationsPage, 'translationsTable', {
    'enumerable': false,
    'writable': false,
    'value': TranslationsTable.createElement()
  });

  return translationsPage;

};

TranslationsPage.isElement = function(translationsPage) {
  return translationsPagePrototype.isPrototypeOf(translationsPage);
};

TranslationsPage.getElementPrototype = function() {
  return translationsPagePrototype;
};

module.exports = TranslationsPage;

var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../../application');
var Log = require('../../log');
var Page = require('../page');

var TranslationPage = require('./translation-page');
var TranslationsTable = require('../tables/translations-table');

var pagePrototype = Page.getElementPrototype();
var translationsPagePrototype = Object.create(pagePrototype);

translationsPagePrototype.hasElements = function() {
  return true;
};

translationsPagePrototype.getElements = function() {
  return pagePrototype.getElements.call(this).concat([
    this.translationsTable
  ]);
};

translationsPagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  jQuery(this).on('v-shown', {
    'this': this
  }, this.onShown);

  jQuery(this).on('v-hidden', {
    'this': this
  }, this.onHidden);

  this.getElement().find('#goBack').on('click', {
    'this': this
  }, this.onGoBack);
  this.getElement().find('#refresh').on('click', {
    'this': this
  }, this.onRefresh);
  this.getElement().find('#addTranslation').on('click', {
    'this': this
  }, this.onAddTranslation);

};

translationsPagePrototype.unbind = function() {

  this.getElement().find('#addTranslation').off('click', this.onAddTranslation);
  this.getElement().find('#refresh').off('click', this.onRefresh);
  this.getElement().find('#goBack').off('click', this.onGoBack);

  jQuery(this).off('v-hidden', this.onHidden);
  jQuery(this).off('v-shown', this.onShown);

  pagePrototype.unbind.call(this);

};

translationsPagePrototype.onShown = function(event) {
  Log.info('> TranslationsPage.onShown(event) { ... } event.isInitial=%s', event.isInitial);

  var self = event.data.this;

  Asynchronous.waterfall([
    function(callback) {
      Application.GET('/api/translations', callback);
    },
    function(translations, callback) {
      self.translationsTable.render({
        'translations': translations
      }, callback);
    }
  ], Application.ifNotError(function(content) {

    self.getElement().find('> div').append(content);

    self.translationsTable.getElement().find('tbody > tr').on('click', {
      'this': self
    }, self.onSelected);

    self.translationsTable.bind();
    self.translationsTable.show();

  }));

};

translationsPagePrototype.onHidden = function(event) {
  Log.info('> TranslationsPage.onHidden(event) { ... } event.isFinal=%s', event.isFinal);

  var self = event.data.this;

  self.translationsTable.hide();
  self.translationsTable.unbind();

  self.translationsTable.getElement().find('tbody > tr').off('click', self.onSelected);

  self.translationsTable.removeContent();

};

translationsPagePrototype.onGoBack = function(event) {
  Log.info('> TranslationsPage.onGoBack(event) { ... }');
  window.application.hidePage();
};

translationsPagePrototype.onRefresh = function(event) {
  Log.info('> TranslationsPage.onRefresh(event) { ... }');

  var self = event.data.this;

  self.translationsTable.hide();
  self.translationsTable.unbind();

  self.translationsTable.getElement().find('tbody > tr').off('click', self.onSelected);

  self.translationsTable.removeContent();

  Asynchronous.waterfall([
    function(callback) {
      Application.GET('/api/translations', callback);
    },
    function(translations, callback) {
      self.translationsTable.render({
        'translations': translations
      }, callback);
    }
  ], Application.ifNotError(function(content) {

    self.getElement().find('> div').append(content);

    self.translationsTable.getElement().find('tbody > tr').on('click', {
      'this': self
    }, self.onSelected);

    self.translationsTable.bind();
    self.translationsTable.show();

  }));

};

translationsPagePrototype.onAddTranslation = function(event) {
  Log.info('> TranslationsPage.onAddTranslation(event) { ... }');
  window.application.showPage(TranslationPage.createElement({}), Application.ifNotError());
};

translationsPagePrototype.onSelected = function(event) {
  Log.info('> TranslationsPage.onSelected(event) { ... } event.currentTarget.dataset.translationFrom=%j', event.currentTarget.dataset.translationFrom);

  var self = event.data.this;

  Asynchronous.waterfall([
    function(callback) {
      Application.GET(Utilities.format('/api/translations/%s', event.currentTarget.dataset.translationFrom), callback);
    },
    function(translation, callback) {
      window.application.showPage(TranslationPage.createElement(translation), Application.ifNotError());
    }
  ], Application.ifNotError());

};

var TranslationsPage = Object.create(Page);

TranslationsPage.createElement = function(templateURL, prototype) {

  var translationsPage = Page.createElement.call(this, templateURL || '/www/views/elements/pages/translations-page.jade', prototype || translationsPagePrototype);

  Object.defineProperty(translationsPage, 'translationsTable', {
    'enumerable': false,
    'writranslationsTable': false,
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

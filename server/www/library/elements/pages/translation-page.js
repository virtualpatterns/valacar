var Is = require('@pwn/is');
var Utilities = require('util');

var Application = require('../../application');
var Log = require('../../log');
var Page = require('../page');

var pagePrototype = Page.getElementPrototype();
var translationPagePrototype = Object.create(pagePrototype);

translationPagePrototype.render = function(data, callback) {

  if (Is.function(data)) {
    callback = data;
    data = {};
  }

  data.translation = this.translation;

  Log.info('> Page.render(data, callback)\n\n%s\n\n', Utilities.inspect(data));
  pagePrototype.render.call(this, data, callback);

};

translationPagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  this.getElement().find('#goBack').on('click', {
    'this': this
  }, this.onGoBack);
  this.getElement().find('#done').on('click', {
    'this': this
  }, this.onDone);

  this.getElement().find('#delete').on('click', {
    'this': this
  }, this.onDelete);

};

translationPagePrototype.unbind = function() {

  this.getElement().find('#goBack').off('click', this.onGoBack);
  this.getElement().find('#done').off('click', this.onDone);

  this.getElement().find('#delete').off('click', this.onDelete);

  pagePrototype.unbind.call(this);

};

translationPagePrototype.onGoBack = function(event) {
  Log.info('> TranslationPage.onGoBack(event) { ... }');
  window.application.hidePage();
};

translationPagePrototype.onDone = function(event) {
  Log.info('> TranslationPage.onDone(event) { ... }');

  var self = event.data.this;

  Application.POST('/api/translations', {
    'from': self.getElement().find('#from').val(),
    'to': self.getElement().find('#to').val()
  }, Application.ifNotError(function() {
    window.application.hidePage();
  }));

};

translationPagePrototype.onDelete = function(event) {
  Log.info('> TranslationPage.onDelete(event) { ... }');

  var self = event.data.this;

  UIkit.modal.confirm(Utilities.format('Are you sure you want to delete the translation from %j to %j?', self.getElement().find('#from').val(), self.getElement().find('#to').val()), function(){
    Application.DELETE(Utilities.format('/api/translations/%s', self.getElement().find('#from').val()), Application.ifNotError(function() {
      window.application.hidePage();
    }));
  }, {
    labels: {
     'Ok': 'Yes',
     'Cancel': 'No'
    }
  });

};

var TranslationPage = Object.create(Page);

TranslationPage.createElement = function(translation, templateURL, prototype) {

  var translationPage = Page.createElement.call(this, templateURL || '/www/views/elements/pages/translation-page.jade', prototype || translationPagePrototype);

  Object.defineProperty(translationPage, 'translation', {
    'enumerable': false,
    'writable': false,
    'value': translation
  });

  return translationPage;

};

TranslationPage.isElement = function(translationPage) {
  return translationPagePrototype.isPrototypeOf(translationPage);
};

TranslationPage.getElementPrototype = function() {
  return translationPagePrototype;
};

module.exports = TranslationPage;

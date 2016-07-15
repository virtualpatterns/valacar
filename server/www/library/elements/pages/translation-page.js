var Utilities = require('util');

var Application = require('../../application');
var Log = require('../../log');
var Page = require('../page');

var pageSourcePrototype = Page.Source.getSourcePrototype();
var translationPageSourcePrototype = Object.create(pageSourcePrototype);

var TranslationPageSource = Object.create(Page.Source);

TranslationPageSource.createSourceId = function(translation) {
  // Log.info('> TranslationPageSource.createSourceId(translation) { ... }\n\n%s\n\n', Utilities.inspect(translation));
  return {
    'from': translation.from
  };
};

TranslationPageSource.createSource = function(translation, prototype) {
  // Log.info('> TranslationPageSource.createSource(translation, prototype) { ... }\n\n%s\n\n', Utilities.inspect(translation));

  var translationPageSource = Page.Source.createSource.call(this, this.createSourceId(translation), prototype || translationPageSourcePrototype);

  Object.assign(translationPageSource, translation);

  translationPageSource.insertedAsDate = (translation.inserted ? Date.parse(translation.inserted) : new Date());

  translationPageSource.isNew = !translationPageSource.inserted
  translationPageSource.isExisting = !!translationPageSource.inserted

  return translationPageSource;

};

TranslationPageSource.isSource = function(source) {
  return translationPageSourcePrototype.isPrototypeOf(source);
};

TranslationPageSource.getSourcePrototype = function() {
  return translationPageSourcePrototype;
};

var pagePrototype = Page.getElementPrototype();
var translationPagePrototype = Object.create(pagePrototype);

translationPagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  this.getContent().find('#goBack').on('click', {
    'this': this
  }, this.onGoBack);
  this.getContent().find('#done').on('click', {
    'this': this
  }, this.onDone);

  this.getContent().find('#delete').on('click', {
    'this': this
  }, this.onDelete);

};

translationPagePrototype.unbind = function() {

  this.getContent().find('#goBack').off('click', this.onGoBack);
  this.getContent().find('#done').off('click', this.onDone);

  this.getContent().find('#delete').off('click', this.onDelete);

  pagePrototype.unbind.call(this);

};

translationPagePrototype.onGoBack = function(event) {
  Log.info('> TranslationPage.onGoBack(event) { ... }');
  window.application.hidePage();
};

translationPagePrototype.onDone = function(event) {
  Log.info('> TranslationPage.onDone(event) { ... }');

  var self = event.data.this;
  var source = Object.assign({}, self.source);

  source.from = self.getContent().find('#from').val();
  source.to = self.getContent().find('#to').val();

  Application.POST('/api/translations', source, Application.ifNotError(function(translation) {
    // Log.debug('= TranslationPage.onDone(event) { ... }\n\n%s\n\n', Utilities.inspect(translation));
    window.application.hidePage();
  }));

};

translationPagePrototype.onDelete = function(event) {
  Log.info('> TranslationPage.onDelete(event) { ... }');

  var self = event.data.this;
  var source = Object.assign({}, self.source);

  source.from = self.getContent().find('#from').val();
  source.to = self.getContent().find('#to').val();

  Application.confirm('Are you sure you want to delete the translation from %j?', source.from, function() {
    Application.DELETE(Utilities.format('/api/translations/%s', source.from), Application.ifNotError(function() {
      window.application.hidePage();
    }));
  });

};

var TranslationPage = Object.create(Page);

TranslationPage.createElement = function(source, templateURL, prototype) {

  var translationPage = Page.createElement.call(this, templateURL || '/www/views/elements/pages/translation-page.jade', prototype || translationPagePrototype);

  Object.defineProperty(translationPage, 'source', {
    'enumerable': false,
    'writable': false,
    'value': source
  });

  return translationPage;

};

TranslationPage.isElement = function(translationPage) {
  return translationPagePrototype.isPrototypeOf(translationPage);
};

TranslationPage.getElementPrototype = function() {
  return translationPagePrototype;
};

TranslationPage.Source = TranslationPageSource;

module.exports = TranslationPage;

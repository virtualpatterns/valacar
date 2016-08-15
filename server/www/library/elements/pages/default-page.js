var Asynchronous = require('async');
var Is = require('@pwn/is');
var Utilities = require('util');

var Application = require('../../application');
var Element = require('../../element');
var Log = require('../../log');
var Page = require('../page');
var Status = require('../status');

var HistoryPage = require('./history-page');
var LeasesPage = require('./leases-page');
var SettingsPage = require('./settings-page');
var TranslationsPage = require('./translations-page');

var pagePrototype = Page.getElementPrototype();
var defaultPagePrototype = Object.create(pagePrototype);

// defaultPagePrototype.render = function(data, callback) {
//
//   if (Is.function(data)) {
//     callback = data;
//     data = {};
//   }
//
//   var self = this;
//
//   Application.GET('/api/status', function(error, status) {
//     if (error)
//       callback(error);
//     else {
//
//       data.status = status;
//
//       // data.status.database.nowAsDate = Date.parse(data.status.database.now);
//       // data.status.database.nowAsString = data.status.database.nowAsDate.toUTCString();
//
//       // data.status.nowAsDate = new Date();
//       // data.status.nowAsString = data.status.nowAsDate.toUTCString();
//
//       data.status.heap.totalAsString = Format(data.status.heap.total, {
//        scale: 'binary',
//        unit: 'B'
//       });
//       data.status.heap.usedAsString = Format(data.status.heap.used, {
//        scale: 'binary',
//        unit: 'B'
//       });
//
//       pagePrototype.render.call(self, data, callback);
//
//     }
//   });
//
// };

defaultPagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  jQuery(this).on('v-shown', {
    'this': this
  }, this.onShown);

  jQuery(this).on('v-hidden', {
    'this': this
  }, this.onHidden);

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

  this.getContent().find('#goSettings').on('click', {
    'this': this
  }, this.onGoSettings);
  this.getContent().find('#goTest').on('click', {
    'this': this
  }, this.onGoTest);

};

defaultPagePrototype.unbind = function() {

  this.getContent().find('#goTest').off('click', this.onGoTest);
  this.getContent().find('#goSettings').off('click', this.onGoSettings);
  this.getContent().find('#goHistory').off('click', this.onGoHistory);
  this.getContent().find('#goTranslations').off('click', this.onGoTranslations);
  this.getContent().find('#goLeases').off('click', this.onGoLeases);
  this.getContent().find('#close').off('click', this.onClose);

  jQuery(this).off('v-hidden', this.onHidden);
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

  self.refreshElements(Status, Application.ifNotError());

};

defaultPagePrototype.onHidden = function(event) {
  Log.info('> DefaultPage.onHidden(event) { ... } event.isFinal=%s', event.isFinal);

  var self = event.data.this;

  if (self.status.existsContent()) {

    self.status.hide();
    self.status.unbind();

    self.status.removeContent();

  }

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

defaultPagePrototype.onGoSettings = function(event) {
  Log.info('> DefaultPage.onGoSettings(event) { ... }');
  window.application.showPage(SettingsPage.createElement(), Application.ifNotError());
};

defaultPagePrototype.onGoTest = function(event) {
  Log.info('> DefaultPage.onGoTest(event) { ... } window.location.href=%j', window.location.href);

  if (window.location.href.match(/default\.html/))
    window.location.href = '/www/test.html';
  else if (window.location.href.match(/default\.min\.html/))
    window.location.href = '/www/test.min.html';

};

defaultPagePrototype.hasElements = function() {
  return true;
};

defaultPagePrototype.getElements = function(Class) {
  return pagePrototype.getElements.call(this, Class).concat(Element.filter([
    this.status
  ], Class));
};

defaultPagePrototype.refreshElements = function(Class, callback) {

  if (Is.function(Class)) {
    callback = Class;
    Class = null;
  }

  var self = this;

  Asynchronous.each(this.getElements(Class), function(element, callback) {
    switch (element) {
      case self.status:
        self.refreshStatus(callback);
        break;
    }
  }, function(error) {
    if (error)
      callback(error);
    else
      pagePrototype.refreshElements.call(this, Class, callback);
  });

};

defaultPagePrototype.refreshStatus = function(callback) {
  Log.info('> DefaultPage.refreshStatus(callback) { ... }');

  var self = this;
  var element = self.status;

  if (element.existsContent()) {

    element.hide();
    element.unbind();

    element.removeContent();

  }

  Asynchronous.waterfall([
    function(callback) {
      Application.GET('/api/status', callback);
    },
    function(status, callback) {

      status = Status.Source.createSource(status);

      document.title = Utilities.format('%s v%s', status.name, status.version);

      element.render({
        'status': status
      }, callback);

    }
  ], function(error, content) {

    if (error)
      callback(error)
    else {

      self.getContent().find('> div > div > div:has(h3)').append(content);

      element.bind();
      element.show();

    }

  });

};

var DefaultPage = Object.create(Page);

DefaultPage.createElement = function(templateURL, prototype) {

  var defaultPage = Page.createElement.call(this, templateURL || '/www/views/elements/pages/default-page.jade', prototype || defaultPagePrototype);

  Object.defineProperty(defaultPage, 'status', {
    'enumerable': false,
    'writable': false,
    'value': Status.createElement()
  });

  return defaultPage;

};

DefaultPage.isElement = function(defaultPage) {
  return defaultPagePrototype.isPrototypeOf(defaultPage);
};

DefaultPage.getElementPrototype = function() {
  return defaultPagePrototype;
};

module.exports = DefaultPage;

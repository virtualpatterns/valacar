var Utilities = require('util');

var Application = require('../../application');
var Log = require('../../log');
var Page = require('../page');
var SettingsInstructionsModal = require('../modals/settings-instructions-modal');

var pageSourcePrototype = Page.Source.getSourcePrototype();
var settingsPageSourcePrototype = Object.create(pageSourcePrototype);

var SettingsPageSource = Object.create(Page.Source);

SettingsPageSource.createSource = function(prototype) {
  // Log.info('> SettingsPageSource.createSource(settings, prototype) { ... }\n\n%s\n\n', Utilities.inspect(settings));

  var settingsPageSource = Page.Source.createSource.call(this, null, prototype || settingsPageSourcePrototype);

  settingsPageSource.url = window.localStorage.getItem('url');

  var staticUrl = Utilities.format('%s//%s', window.location.protocol, window.location.host);

  // settingsPageSource.urlPlaceholderAsString = Utilities.format('e.g. %s', staticUrl);
  settingsPageSource.urlNullAsString = staticUrl;

  return settingsPageSource;

};

SettingsPageSource.isSource = function(source) {
  return settingsPageSourcePrototype.isPrototypeOf(source);
};

SettingsPageSource.getSourcePrototype = function() {
  return settingsPageSourcePrototype;
};

var pagePrototype = Page.getElementPrototype();
var settingsPagePrototype = Object.create(pagePrototype);

settingsPagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  this.getContent().find('#goBack').on('click', {
    'this': this
  }, this.onGoBack);
  this.getContent().find('#done').on('click', {
    'this': this
  }, this.onDone);
  // this.getContent().find('#urlNull').on('change', {
  //   'this': this
  // }, this.onUrlNullChange);

};

settingsPagePrototype.unbind = function() {

  // this.getContent().find('#urlNull').off('change', this.onUrlNullChange);
  this.getContent().find('#goBack').off('click', this.onGoBack);
  this.getContent().find('#done').off('click', this.onDone);

  pagePrototype.unbind.call(this);

};

settingsPagePrototype.onGoBack = function(event) {
  Log.info('> SettingsPage.onGoBack(event) { ... }');
  window.application.hidePage();
};

settingsPagePrototype.onDone = function(event) {
  Log.info('> SettingsPage.onDone(event) { ... }');

  var self = event.data.this;

  if (self.getContent().find('#urlNull').prop('checked') ||
      !self.getContent().find('#url').val())
    window.localStorage.removeItem('url');
  else
    window.localStorage.setItem('url', self.getContent().find('#url').val());

  window.application.showModal(SettingsInstructionsModal.createElement(), Application.ifNotError(function () {
    window.location.reload(true);
  }));

  // window.application.hidePage();

};

// settingsPagePrototype.onUrlNullChange = function(event) {
//   Log.info('> SettingsPage.onUrlNullChange(event) { ... }');
//   var self = event.data.this;
//
//   Log.info('= SettingsPage.onUrlNullChange(event) { ... } #urlNull=%s', self.getContent().find('#urlNull').prop('checked'));
//
//   self.getContent().find('#url').prop('disabled', self.getContent().find('#urlNull').prop('checked'));
//
// };

var SettingsPage = Object.create(Page);

SettingsPage.Source = SettingsPageSource;

SettingsPage.createElement = function(templateURL, prototype) {

  var settingsPage = Page.createElement.call(this, templateURL || '/www/views/elements/pages/settings-page.jade', prototype || settingsPagePrototype);

  Object.defineProperty(settingsPage, 'source', {
    'enumerable': false,
    'writable': false,
    'value': SettingsPage.Source.createSource()
  });

  return settingsPage;

};

SettingsPage.isElement = function(settingsPage) {
  return settingsPagePrototype.isPrototypeOf(settingsPage);
};

SettingsPage.getElementPrototype = function() {
  return settingsPagePrototype;
};

module.exports = SettingsPage;

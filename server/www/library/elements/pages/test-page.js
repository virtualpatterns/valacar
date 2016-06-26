var Log = require('../../log');
var Page = require('../page');

var pagePrototype = Page.getElementPrototype();
var testPagePrototype = Object.create(pagePrototype);

testPagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  jQuery(this).on('v-shown', {
    'this': this
  }, this.onShown);

  this.getElement().find('#goDefault').on('click', {
    'this': this
  }, this.onGoDefault);
  this.getElement().find('#refresh').on('click', {
    'this': this
  }, this.onRefresh);

};

testPagePrototype.unbind = function() {

  this.getElement().find('#refresh').off('click', this.onRefresh);
  this.getElement().find('#goDefault').off('click', this.onGoDefault);

  jQuery(this).off('v-shown', this.onShown);

  pagePrototype.unbind.call(this);

};

testPagePrototype.onShown = function(event) {
  Log.info('> TestPage.onShown(event) { ... } event.isInitial=%s', event.isInitial);

  var self = event.data.this;

  if (event.isInitial) {

    try {

      mocha.setup({
        'bail': true,
        // 'reporter': WebConsole,
        'timeout': 5000,
        'ui': 'bdd'
      });

      require('../../../tests/20160622163300-begin');
      require('../../../tests/20160622173800-default');
      require('../../../tests/20160625023000-translations');
      require('../../../tests/99999999999999-end');

      mocha.run();

    }
    catch (error) {
      Log.error('> TestPage.onShown(event) { ... }');
      Log.error('    error.message=%j', error.message);
      UIkit.modal.alert(error.message);
    }

  }

};

testPagePrototype.onGoDefault = function(event) {
  Log.info('> TestPage.onGoDefault(event) { ... }');
  window.location.href = '/www/default.html';
};

testPagePrototype.onRefresh = function(event) {
  Log.info('> TestPage.onRefresh(event) { ... }');
  window.location.reload(true);
};

var TestPage = Object.create(Page);

TestPage.createElement = function(templateURL, prototype) {
  return Page.createElement.call(this, templateURL || '/www/views/elements/pages/test-page.jade', prototype || testPagePrototype);
};

TestPage.isElement = function(testPage) {
  return testPagePrototype.isPrototypeOf(testPage);
};

TestPage.getElementPrototype = function() {
  return testPagePrototype;
};

module.exports = TestPage;

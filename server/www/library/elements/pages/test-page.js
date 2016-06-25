var Log = require('../../log');
var Page = require('../page');

var pagePrototype = Page.getElementPrototype();
var testPagePrototype = Object.create(pagePrototype);

testPagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  this.getElement().find('#run').on('click', {
    'this': this
  }, this.onRun);

  this.getElement().find('#reload').on('click', {
    'this': this
  }, this.onReload);

  this.getElement().find('#goDefault').on('click', {
    'this': this
  }, this.onGoDefault);

};

testPagePrototype.unbind = function() {

  this.getElement().find('#goDefault').off('click', this.onGoDefault);
  this.getElement().find('#reload').off('click', this.onReload);
  this.getElement().find('#run').off('click', this.onRun);

  pagePrototype.unbind.call(this);

};

testPagePrototype.onRun = function(event) {
  Log.info('> TestPage.onRun(event) { ... }');

  var self = event.data.this;

  try {

    self.getElement()
      .find('#run')
      .toggleClass('uk-hidden', true);

    mocha.setup({
      'bail': true,
      'reporter': WebConsole,
      'timeout': 5000,
      'ui': 'bdd'
    });

    require('../../../tests/20160622163300-begin');
    require('../../../tests/20160622173800-default');
    require('../../../tests/99999999999999-end');

    mocha.run();

    self.getElement()
      .find('#reload')
      .toggleClass('uk-hidden', false);

  }
  catch (error) {
    Log.error('> TestPage.onRun(event) { ... }');
    Log.error('    error.message=%j', error.message);
    UIkit.modal.alert(error.message);
  }

};

testPagePrototype.onReload = function(event) {
  Log.info('> TestPage.onReload(event) { ... }');
  window.location.href = '/www/test.html';
};

testPagePrototype.onGoDefault = function(event) {
  Log.info('> TestPage.onGoDefault(event) { ... }');
  window.location.href = '/www/default.html';
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

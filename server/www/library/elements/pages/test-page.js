var Mocha = mocha;

var Is = require('@pwn/is');
var QueryString = require('query-string');
var Utilities = require('util');

var Application = require('../../application');
var Log = require('../../log');
var Page = require('../page');

var pagePrototype = Page.getElementPrototype();
var testPagePrototype = Object.create(pagePrototype);

testPagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  jQuery(this).on('v-shown', {
    'this': this
  }, this.onShown);

  this.getContent().find('#goDefault').on('click', {
    'this': this
  }, this.onGoDefault);
  this.getContent().find('#start').on('click', {
    'this': this
  }, this.onStart);
  this.getContent().find('#refresh').on('click', {
    'this': this
  }, this.onRefresh);

};

testPagePrototype.unbind = function() {

  this.getContent().find('#refresh').off('click', this.onRefresh);
  this.getContent().find('#start').off('click', this.onStart);
  this.getContent().find('#goDefault').off('click', this.onGoDefault);

  jQuery(this).off('v-shown', this.onShown);

  pagePrototype.unbind.call(this);

};

testPagePrototype.onShown = function(event) {
  Log.info('> TestPage.onShown(event) { ... } event.isInitial=%s', event.isInitial);

  var self = event.data.this;

  if (event.isInitial) {

    var query = QueryString.parse(window.location.search);

    Log.info('= TestPage.onShown(event) { ... }\n\nwindow.location.search\n----------------------\n%s\n\n', Utilities.inspect(query));

    if (query.start)
      self.getContent().find('#start').click();

  }

};

testPagePrototype.onGoDefault = function(event) {
  Log.info('> TestPage.onGoDefault(event) { ... } window.location.href=%j', window.location.href);

  if (window.location.href.match(/test\.html/))
    window.location.href = '/www/default.html';
  else if (window.location.href.match(/test\.min\.html/))
    window.location.href = '/www/default.min.html';

};

testPagePrototype.onStart = function(event) {
  Log.info('> TestPage.onStart(event) { ... }');

  var self = event.data.this;

  try {

    self.getContent().find('div.v-status').toggleClass('uk-hidden', true);
    self.getContent().find('li:has(#start)').toggleClass('uk-hidden', true);

    if (Is.function(window.initMochaPhantomJS)) {
      // console.log('> window.initMochaPhantomJS()');
      window.initMochaPhantomJS();
      // console.log('< window.initMochaPhantomJS()');
    }

    Mocha.setup({
      'bail': true,
      'timeout': 0,
      'ui': 'bdd'
    });

    require('../../../test/tests/20160622163300-begin');
    require('../../../test/tests/20160622173800-default');
    require('../../../test/tests/20160625023000-translations');
    require('../../../test/tests/20160627004000-translation');
    require('../../../test/tests/20160706232900-leases');
    require('../../../test/tests/20160707002900-lease');
    require('../../../test/tests/20160731022800-history');
    require('../../../test/tests/99999999999999-end');

    var tests = Mocha.run();

    tests.on('end', self.onFinished.bind(self, tests.stats));

  }
  catch (error) {
    Log.error('> TestPage.onShown(event) { ... }');
    Log.error('    error.message=%j\n\n%s\n\n', error.message, error.stack);
    Application.alert(error.message);
  }

};

testPagePrototype.onFinished = function(status) {
  Log.info('> TestPage.onFinished() { ... }');

  if (status.failures > 0)
    this.getContent().find('div.v-status-failed').toggleClass('uk-hidden', false);
  else if (status.pending > 0)
    this.getContent().find('div.v-status-pending').toggleClass('uk-hidden', false);
  else
    this.getContent().find('div.v-status-passed').toggleClass('uk-hidden', false);

  // Log.info(this.getContent().find('li:has(#refresh)'));

  this.getContent().find('li:has(#refresh)').toggleClass('uk-hidden', false);

}

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

var Mocha = mocha;

var Log = require('../../log');
var Page = require('../page');

var pagePrototype = Page.getContentPrototype();
var testPagePrototype = Object.create(pagePrototype);

testPagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  jQuery(this).on('v-shown', {
    'this': this
  }, this.onShown);

  this.getContent().find('#goDefault').on('click', {
    'this': this
  }, this.onGoDefault);
  this.getContent().find('#refresh').on('click', {
    'this': this
  }, this.onRefresh);

};

testPagePrototype.unbind = function() {

  this.getContent().find('#refresh').off('click', this.onRefresh);
  this.getContent().find('#goDefault').off('click', this.onGoDefault);

  jQuery(this).off('v-shown', this.onShown);

  pagePrototype.unbind.call(this);

};

testPagePrototype.onShown = function(event) {
  Log.info('> TestPage.onShown(event) { ... } event.isInitial=%s', event.isInitial);

  var self = event.data.this;

  if (event.isInitial) {

    try {

      Mocha.setup({
        'bail': true,
        'timeout': 30000,
        'ui': 'bdd'
      });

      require('../../../test/tests/20160622163300-begin');
      require('../../../test/tests/20160622173800-default');
      require('../../../test/tests/20160625023000-translations');
      require('../../../test/tests/20160627004000-translation');
      require('../../../test/tests/99999999999999-end');

      var tests = Mocha.run();

      // 'start'     execution started
      // 'end'       execution complete
      // 'suite'     (suite) test suite execution started
      // 'suite end' (suite) all tests (and sub-suites) have finished
      // 'test'      (test) test execution started
      // 'test end'  (test) test completed
      // 'hook'      (hook) hook execution started
      // 'hook end'  (hook) hook complete
      // 'pass'      (test) test passed
      // 'fail'      (test, err) test failed

      tests.on('end', self.onFinished.bind(this, tests.stats));

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

testPagePrototype.onStarted = function() {
  Log.info('> TestPage.onStarted() { ... }');
}

testPagePrototype.onFinished = function(status) {
  Log.info('> TestPage.onFinished() { ... }');

  this.getContent().find('div.v-status').toggleClass('uk-hidden', true);

  if (status.failures > 0)
    this.getContent().find('div.v-status-failed').toggleClass('uk-hidden', false);
  else if (status.pending > 0)
    this.getContent().find('div.v-status-pending').toggleClass('uk-hidden', false);
  else
    this.getContent().find('div.v-status-passed').toggleClass('uk-hidden', false);

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

TestPage.getContentPrototype = function() {
  return testPagePrototype;
};

module.exports = TestPage;

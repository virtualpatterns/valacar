var _Assert = require('assert');
var Asynchronous = require('async');
var Is = require('@pwn/is');
var Path = require('../../../../client/library/path');
var Utilities = require('util');

var Application = require('../../library/application');
var Log = require('../../library/log');

var TestPage = require('../../library/elements/pages/test-page');

var REGEXP_PLACEHOLDER = /%d|%j|%s/g;

var Assert = Object.create(_Assert);

Assert.onPage = function(text, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('div.uk-navbar-content:visible:contains(%j)');
  return this.existsSelector.apply(this, argumentsArray);
};

Assert.existsButton = function(text, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('button:not([disabled]):visible:contains(%j)');
  return this.existsSelector.apply(this, argumentsArray);
};

Assert.existsDisabledButton = function(text, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('button[disabled]:visible:contains(%j)');
  return this.existsSelector.apply(this, argumentsArray);
};

Assert.notExistsButton = function(text, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('button:visible:contains(%j)');
  return this.notExistsSelector.apply(this, argumentsArray);
};

Assert.existsLink = function(text, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('a:visible:contains(%j)');
  return this.existsSelector.apply(this, argumentsArray);
};

Assert.notExistsLink = function(text, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('a:visible:contains(%j)');
  return this.notExistsSelector.apply(this, argumentsArray);
};

Assert.existsLinkId = function(id, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('a#%s:visible');
  return this.existsSelector.apply(this, argumentsArray);
};

Assert.notExistsLinkId = function(id, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('a:visible:contains(%j)');
  return this.notExistsSelector.apply(this, argumentsArray);
};

Assert.existsRow = function(text, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('table > tbody > tr:visible:contains(%j)');
  return this.existsSelector.apply(this, argumentsArray);
};

Assert.existsRowIndex = function(text, index, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('table > tbody > tr:visible:contains(%j):eq(%d)');
  return this.existsSelector.apply(this, argumentsArray);
};

Assert.notExistsRow = function(text, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('table > tbody > tr:visible:contains(%j)');
  return this.notExistsSelector.apply(this, argumentsArray);
};

Assert.notExistsRowIndex = function(text, index, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('table > tbody > tr:visible:contains(%j):eq(%d)');
  return this.notExistsSelector.apply(this, argumentsArray);
};

Assert.existsInput = function(text, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  // argumentsArray.unshift('input[type="text"][value=%j]:visible:not([disabled])');
  argumentsArray.unshift('input[value=%j]:visible:not([disabled])');
  return this.existsSelector.apply(this, argumentsArray);
};

Assert.existsInputId = function(id, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  return this.existsVisibleInputId.apply(this, argumentsArray);
};

Assert.existsVisibleInputId = function(id, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  // argumentsArray.unshift('input#%s[type="text"]:visible:not([disabled])');
  argumentsArray.unshift('input#%s:visible:not([disabled])');
  return this.existsSelector.apply(this, argumentsArray);
};

Assert.existsHiddenInputId = function(id, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  // argumentsArray.unshift('input#%s[type="text"]:hidden:not([disabled])');
  argumentsArray.unshift('input#%s:hidden:not([disabled])');
  return this.existsSelector.apply(this, argumentsArray);
};

Assert.existsInputValue = function(id, value, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);

  if (Is.emptyString(value)) {
    // argumentsArray.unshift('input#%s[type="text"]:visible:not([value][disabled])');
    argumentsArray.unshift('input#%s:visible:not([value][disabled])');
  }
  else {
    // argumentsArray.unshift('input#%s[type="text"][value=%j]:visible:not([disabled])');
    argumentsArray.unshift('input#%s[value=%j]:visible:not([disabled])');
  }

  return this.existsSelector.apply(this, argumentsArray);

};

Assert.existsDisabledInputValue = function(id, value, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);

  if (Is.emptyString(value)) {
    // argumentsArray.unshift('input#%s[type="text"][disabled]:visible:not([value])');
    argumentsArray.unshift('input#%s[disabled]:visible:not([value])');
  }
  else {
    // argumentsArray.unshift('input#%s[type="text"][value=%j][disabled]:visible');
    argumentsArray.unshift('input#%s[value=%j][disabled]:visible');
  }

  return this.existsSelector.apply(this, argumentsArray);

};

Assert.existsAlert = function(text, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('div.uk-modal > div.uk-modal-dialog:has(div.uk-modal-footer > button:contains("Ok")):contains(%j)');
  return this.existsSelector.apply(this, argumentsArray);
};

Assert.existsConfirmation = function(text, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('div.uk-modal > div.uk-modal-dialog:has(div.uk-modal-footer > button:contains("No")):has(div.uk-modal-footer > button:contains("Yes")):contains(%j)');
  return this.existsSelector.apply(this, argumentsArray);
};

Assert.existsSelector = function(selector, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  var results = this.select.apply(this, argumentsArray);
  var error = null;

  try {
    this.equal(results.selected.length, 1, Utilities.format('The selector %j exists %d times.', results.selector, results.selected.length));
  }
  catch (_error) {
    error = _error;
  }

  if (results.callback)
    results.callback(error, results);
  else if (error)
    throw error

  return results;

};

Assert.notExistsSelector = function(selector, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  var results = this.select.apply(this, argumentsArray);
  var error = null;

  try {
    this.equal(results.selected.length, 0, Utilities.format('The selector %j exists %d times.', results.selector, results.selected.length));
  }
  catch (_error) {
    error = _error;
  }

  if (results.callback)
    results.callback(error, results);
  else if (error)
    throw error

  return results;

};

Assert.clickButton = function(text, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('button:visible:contains(%j)');
  return this.clickSelector.apply(this, argumentsArray);
};

Assert.clickLink = function(text, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('a:visible:contains(%j)');
  return this.clickSelector.apply(this, argumentsArray);
};

Assert.clickLinkId = function(id, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('a#%s:visible');
  return this.clickSelector.apply(this, argumentsArray);
};

Assert.clickRow = function(text, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('table > tbody > tr:visible:contains(%j)');
  return this.clickSelector.apply(this, argumentsArray);
};

Assert.clickOk = function(callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('div.uk-modal > div.uk-modal-dialog > div.uk-modal-footer > button:contains("Ok")');
  return this.clickSelector.apply(this, argumentsArray);
};

Assert.clickYes = function(callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('div.uk-modal > div.uk-modal-dialog > div.uk-modal-footer > button:contains("Yes")');
  return this.clickSelector.apply(this, argumentsArray);
};

Assert.clickNo = function(callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('div.uk-modal > div.uk-modal-dialog > div.uk-modal-footer > button:contains("No")');
  return this.clickSelector.apply(this, argumentsArray);
};

Assert.clickClose = function(callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('div.uk-modal > div.uk-modal-dialog button.uk-close');
  return this.clickSelector.apply(this, argumentsArray);
};

Assert.clickSelector = function(selector, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);
  var results = this.select.apply(this, argumentsArray);
  var error = null;

  try {
    this.equal(results.selected.length, 1, Utilities.format('The selector %j exists %d times.', results.selector, results.selected.length));
    results.selected.click();
  }
  catch (_error) {
    error = _error;
  }

  if (results.callback)
    results.callback(error, results);
  else if (error)
    throw error

  return results;

};

Assert.inputValue = function(id, value, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  // argumentsArray.unshift('input#%s[type="text"]:visible');
  argumentsArray.unshift('input#%s:visible');
  return this.inputSelector.apply(this, argumentsArray);
};

Assert.inputSelector = function(selector, value, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  selector = argumentsArray.shift();
  var numberOfPlaceholders = selector.match(REGEXP_PLACEHOLDER).length;
  value = argumentsArray.splice(numberOfPlaceholders, 1)[0];
  argumentsArray.unshift(selector);

  var results = this.select.apply(this, argumentsArray);
  var error = null;

  try {
    this.equal(results.selected.length, 1, Utilities.format('The selector %j exists %d times.', results.selector, results.selected.length));

    if (Is.boolean(value))
      results.selected.prop('checked', value);
    else
      results.selected.val(value);

  }
  catch (_error) {
    error = _error;
  }

  if (results.callback)
    results.callback(error, results);
  else if (error)
    throw error

  return results;

};

Assert.submitForm = function(id, callback) {
  var argumentsArray = Array.prototype.slice.call(arguments);
  argumentsArray.unshift('form#%s:visible');
  return this.submitSelector.apply(this, argumentsArray);
};

Assert.submitSelector = function(selector, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  var results = this.select.apply(this, argumentsArray);
  var error = null;

  try {
    this.equal(results.selected.length, 1, Utilities.format('The selector %j exists %d times.', results.selector, results.selected.length));
    results.selected.submit();
  }
  catch (_error) {
    error = _error;
  }

  if (results.callback)
    results.callback(error, results);
  else if (error)
    throw error

  return results;

};

Assert.select = function(selector, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  Log.debug('> Assert.select(selector, callback) { ... }\n\n%s\n\n', Utilities.inspect(argumentsArray));

  // if (!argumentsArray[argumentsArray.length - 1]) {
  //   argumentsArray.pop();
  //   callback = null;
  // }
  // else
  if (Is.function(argumentsArray[argumentsArray.length - 1]))
    callback = argumentsArray.pop();
  else
    callback = null;

  // Log.debug('> Utilities.format( ... )\n\n%s\n\n', Utilities.inspect(argumentsArray));
  selector = Utilities.format.apply(Utilities.format, argumentsArray);
  var selected = jQuery(selector);

  Log.info('> jQuery(%j).length=%d', selector, selected.length);

  return {
    'selector': selector,
    'selected': selected,
    'callback': callback
  };

};

Assert.showPage = function(page, callback) {
  // Log.info('> Assert.showPage(page, callback) { ... }');
  this.waitForPageShown(function(callback) {
    window.application.showPage(page, callback);
  }, callback);
};

Assert.hidePage = function(callback) {
  this.waitForPageShown(function() {
    window.application.hidePage();
  }, callback);
}

Assert.hideAllPages = function(callback) {

  var self = this;

  if (TestPage.isElement(window.application.getPage()))
    callback(null);
  else {
    this.waitForPageShown(function() {
      window.application.hidePage();
    }, function(error) {
      if (error)
        callback(error);
      else
        self.hideAllPages(callback);
    });
  }

}

Assert.waitForPageShown = function(duration, waitFn, callback) {

  if (Is.function(duration)) {
    callback = waitFn;
    waitFn = duration;
    duration = 0;
  }

  Log.info('> Assert.waitForPageShown(%d, waitFn, callback) { ... }', duration);

  var self = this;

  jQuery(window.application).one('v-page-shown', function(event) {
    self.waitForElementsShown(event.page, null, Application.noop, callback);
  });

  setTimeout(function() {
    waitFn(Application.ifNotError());
  }, duration);

};

Assert.waitForElementsShown = function(page, Class, waitFn, callback) {

  if (Is.function(page)) {
    callback = Class;
    waitFn = page;
    Class = null;
    page = window.application.getPage();
  }
  else if (Is.function(Class)) {
    callback = waitFn;
    waitFn = Class;
    Class = page;
    page = window.application.getPage();
  }

  Log.info('> Assert.waitForElementsShown(page, Class, waitFn, callback) { ... }');

  if (page.hasElements(Class)) {
    Asynchronous.each(page.getElements(Class), function(element, callback) {
      jQuery(element).one('v-shown', function(event) {
        callback(null);
      });
    }, callback);
  }
  else
    callback(null);

  waitFn(Application.ifNotError());

};

Assert.waitForModalShown = function(duration, waitFn, callback) {

  if (Is.function(duration)) {
    callback = waitFn;
    waitFn = duration;
    duration = 0;
  }

  Log.info('> Assert.waitForModalShown(%d, waitFn, callback) { ... }', duration);

  jQuery(window.application).one('v-modal-shown', function(event) {
    Log.info('< Assert.waitForModalShown(%d, waitFn, callback) { ... }', duration);
    setTimeout(function() {
      callback(null);
    }, duration);
  });

  setTimeout(function() {
    waitFn(Application.ifNotError());
  }, duration);

};

Assert.waitForModalHidden = function(duration, waitFn, callback) {

  if (Is.function(duration)) {
    callback = waitFn;
    waitFn = duration;
    duration = 0;
  }

  Log.info('> Assert.waitForModalHidden(%d, waitFn, callback) { ... }', duration);

  jQuery(window.application).one('v-modal-hidden', function(event) {
    Log.info('< Assert.waitForModalHidden(%d, waitFn, callback) { ... }', duration);
    setTimeout(function() {
      callback(null);
    }, duration);
  });

  setTimeout(function() {
    waitFn(Application.ifNotError());
  }, duration);

};

Assert.capture = function(name) {
  if (Is.function(window.callPhantom)) {
    var path = Path.join('process', 'output', 'capture', Utilities.format('%s-%s', name, new Date().toISOString()));
    callPhantom({'screenshot': path})
  }
}

module.exports = Assert;

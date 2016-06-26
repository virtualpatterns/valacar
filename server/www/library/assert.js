var _Assert = require('assert');
var Asynchronous = require('async');
var Is = require('@pwn/is');
var Utilities = require('util');

var Log = require('./log');

var Assert = Object.create(_Assert);

Assert.onPage = function(text, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  Log.info('> Assert.onPage(text, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray));

  argumentsArray.unshift('div.uk-navbar-content:visible:contains(%j)');
  return this.existsSelector.apply(this, argumentsArray);

};

Assert.existsButton = function(text, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  Log.info('> Assert.existsButton(text, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray));

  argumentsArray.unshift('button:visible:contains(%j)');
  return this.existsSelector.apply(this, argumentsArray);

};

Assert.existsLink = function(text, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  Log.info('> Assert.existsButton(text, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray));

  argumentsArray.unshift('a:visible:contains(%j)');
  return this.existsSelector.apply(this, argumentsArray);

};

Assert.existsRow = function(text, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  Log.info('> Assert.existsRow(text, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray));

  argumentsArray.unshift('table > tbody > tr:visible:contains(%j)');
  return this.existsSelector.apply(this, argumentsArray);

};

Assert.notExistsRow = function(text, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  Log.info('> Assert.notExistsRow(text, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray));

  argumentsArray.unshift('table > tbody > tr:visible:contains(%j)');
  return this.notExistsSelector.apply(this, argumentsArray);

};

Assert.existsSelector = function(selector, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  Log.info('> Assert.existsSelector(selector, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray));

  var results = this.select.apply(this, argumentsArray);
  var error = null;

  try {
    this.equal(results.selected.length, 1, Utilities.format('The selector %j does not exist.', results.selector));
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

  Log.info('> Assert.motExistsSelector(selector, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray));

  var results = this.select.apply(this, argumentsArray);
  var error = null;

  try {
    this.equal(results.selected.length, 0, Utilities.format('The selector %j exists.', results.selector));
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

  Log.info('> Assert.clickButton(text, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray));

  argumentsArray.unshift('button:visible:contains(%j)');
  return this.clickSelector.apply(this, argumentsArray);

};

Assert.clickLink = function(text, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  Log.info('> Assert.clickLink(text, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray));

  argumentsArray.unshift('a:visible:contains(%j)');
  return this.clickSelector.apply(this, argumentsArray);

};

Assert.clickRow = function(text, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  Log.info('> Assert.clickRow(text, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray));

  argumentsArray.unshift('table > tbody > tr:visible:contains(%j)');
  return this.clickSelector.apply(this, argumentsArray);

};

Assert.clickSelector = function(selector, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);

  Log.info('> Assert.clickSelector(selector, callback) { ... }\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray));

  var results = this.select.apply(this, argumentsArray);
  var error = null;

  try {
    this.equal(results.selected.length, 1, Utilities.format('The selector %j cannot be clicked as it does not exist.', results.selector));
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

Assert.select = function(selector, callback) {

  var argumentsArray = Array.prototype.slice.call(arguments);
  var _selector = null;
  var _callback = null;

  Log.info('> Assert.select(selector, callback)\n\nargumentsArray\n--------------\n%s\n\n', Utilities.inspect(argumentsArray));

  if (!argumentsArray[argumentsArray.length - 1])
    argumentsArray.pop();
  else if (Is.function(argumentsArray[argumentsArray.length - 1]))
    _callback = argumentsArray.pop();

  var _selector = Utilities.format.apply(Utilities.format, argumentsArray);
  var selected = jQuery(_selector);

  Log.info('> jQuery(%j).length=%d', _selector, selected.length);

  return {
    'selector': _selector,
    'selected': selected,
    'callback': _callback
  };

};

Assert.showPage = function(page, callback) {
  Log.info('> Assert.showPage(page, callback) { ... }');
  this.waitForPageShown(function(callback) {
    window.application.showPage(page, callback);
  }, callback);
};

Assert.hidePage = function(callback) {
  Log.info('> Assert.hidePage(callback) { ... }');
  this.waitForPageShown(function() {
    window.application.hidePage();
  }, callback);
}

Assert.waitForPageShown = function(waitFn, callback) {
  Log.info('> Assert.waitForPageShown(waitFn, callback) { ... }');

  // Log.debug('> jQuery(window.application).one("v-page-shown", function(event) { ... }');
  jQuery(window.application).one('v-page-shown', function(event) {
    // Log.debug('< jQuery(window.application).one("v-page-shown", function(event) { ... }');
    var page = event.page;
    if (page.hasElements()) {
      Asynchronous.each(page.getElements(), function(element, callback) {
        // Log.debug('> jQuery(element).one("v-shown", function(event) { ... }');
        jQuery(element).one('v-shown', function(event) {
          // Log.debug('< jQuery(element).one("v-shown", function(event) { ... }');
          callback(null);
        });
      }, callback);
    }
    else
      callback(null);
  });
  waitFn(function(error) {
    if (error) {
      Log.error('< Assert.waitForPage(waitFn, callback) { ... }');
      Log.error('    error.message=%j', error.message);
      UIkit.modal.alert(error.message);
    }
  });

};

Assert.waitForElementsShown = function(waitFn, callback) {
  Log.info('> Assert.waitForElementsShown(waitFn, callback) { ... }');

  var page = window.application.getPage();
  if (page.hasElements()) {
    Asynchronous.each(page.getElements(), function(element, callback) {
      Log.debug('> jQuery(element).one("v-shown", function(event) { ... }');
      jQuery(element).one('v-shown', function(event) {
        Log.debug('< jQuery(element).one("v-shown", function(event) { ... }');
        callback(null);
      });
    }, callback);
  }
  else
    callback(null);

  waitFn(function(error) {
    if (error) {
      Log.error('< Assert.waitForPage(waitFn, callback) { ... }');
      Log.error('    error.message=%j', error.message);
      UIkit.modal.alert(error.message);
    }
  });

};

module.exports = Assert;

// define(function() {
//
//     var Script = {
//         nextStep: function() {
//             if (_.isFunction(window.callPhantom)) {
//                 // console.log('NEXT');
//                 window.callPhantom('nextStep');
//             }
//         },
//         savePage: function() {
//             if (_.isFunction(window.callPhantom)) {
//                 // console.log('SAVE');
//                 window.callPhantom('savePage');
//             }
//             this.nextStep();
//         },
//         stop: function() {
//             if (_.isFunction(window.callPhantom)) {
//                 // console.log('STOP');
//                 window.callPhantom('savePage');
//                 window.callPhantom('stop');
//             }
//         },
//         execute: function(name, _function) {
//             console.log('EXECUTE ' + name);
//             var self = this;
//             _function(function(error) {
//                 if (error) {
//                     console.log('        "' + error + '"');
//                     self.stop();
//                 }
//                 else
//                     self.nextStep();
//             });
//         },
//         sleep: function(count) {
//             console.log('SLEEP   Sleep ' + count + 'ms');
//             var self = this;
//             window.setTimeout(function() {
//                 self.nextStep();
//             }, count);
//         },
//         clickButton: function(text) {
//             this.clickSelector('Click the visible button "' + text + '" on the active page', '.ui-page-active button:visible:contains("' + text + '")');
//         },
//         clickLink: function(text) {
//             this.clickSelector('Click the visible link "' + text + '" on the active page', '.ui-page-active a:visible:contains("' + text + '")');
//         },
//         clickSelector: function(name, selector) {
//             console.log('ACTION  ' + name);
//             var elements = jQuery(selector);
//             if (elements.length > 0)
//                 elements.click();
//             else {
//                 console.log('FAIL    ' + name);
//                 this.stop();
//             }
//         },
//         updateInputValue: function(text, value) {
//             var name = 'Update the field labelled "' + text + '" on the active page to ' + JSON.stringify(value);
//             console.log('ACTION  ' + name);
//             var elements = this._getInput(text);
//             if (elements.length > 0) {
//                 elements.val(value);
//                 elements.change();
//             }
//             else {
//                 console.log('FAIL    ' + name);
//                 this.stop();
//             }
//         },
//         assertExistsText: function(text) {
//             this.assertExistsSelector('The text "' + text + '" is visible on the active page', '.ui-page-active *:visible:contains("' + text + '")');
//         },
//         assertNotExistsText: function(text) {
//             this.assertNotExistsSelector('The text "' + text + '" is not visible on the active page', '.ui-page-active *:visible:contains("' + text + '")');
//         },
//         assertExistsButton: function(text) {
//             this.assertExistsSelector('The button "' + text + '" is visible on the active page', '.ui-page-active button:visible:contains("' + text + '")');
//         },
//         assertNotExistsButton: function(text) {
//             this.assertNotExistsSelector('The button "' + text + '" is not visible on the active page', '.ui-page-active button:visible:contains("' + text + '")');
//         },
//         assertExistsLink: function(text) {
//             this.assertExistsSelector('The link "' + text + '" is visible on the active page', '.ui-page-active a:visible:contains("' + text + '")');
//         },
//         assertNotExistsLink: function(text) {
//             this.assertNotExistsSelector('The link "' + text + '" is not visible on the active page', '.ui-page-active a:visible:contains("' + text + '")');
//         },
//         assertExistsSelector: function(name, selector) {
//             this.assertTrue(name, jQuery(selector).length > 0);
//         },
//         assertNotExistsSelector: function(name, selector) {
//             this.assertTrue(name, jQuery(selector).length == 0);
//         },
//         assertExistsInput: function(text) {
//             var input = this._getInput(text);
//             this.assertTrue('The field labelled "' + text + '" is visible on the active page', input.length > 0);
//         },
//         assertNotExistsInput: function(text) {
//             var input = this._getInput(text);
//             this.assertTrue('The field labelled "' + text + '" is not visible on the active page', input.length == 0);
//         },
//         assertInputValue: function(text, value) {
//             var input = this._getInput(text);
//             this.assertTrue('The field labelled "' + text + '" has the value "' + value + '"', input.val() == value);
//         },
//         assertNotInputValue: function(text, value) {
//             var input = this._getInput(text);
//             this.assertTrue('The field labelled "' + text + '" does not have the value "' + value + '"', input.val() != value);
//         },
//         assertTrue: function(name, value) {
//             console.log('ASSERT  ' + name);
//             if (value)
//                 this.nextStep();
//             else {
//                 console.log('FAIL    ' + name);
//                 this.stop();
//             }
//         },
//         _getInput: function(text) {
//             return jQuery('#' + jQuery('.ui-page-active label:visible:contains("' + text + '")').attr('for'));
//         }
//     };
//
//     return Script;
//
// });

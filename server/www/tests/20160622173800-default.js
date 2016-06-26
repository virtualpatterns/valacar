var Asynchronous = require('async');

var Assert = require('../library/assert');
var Log = require('../library/log');

var DefaultPage = require('../library/elements/pages/default-page');

describe('DefaultPage', function() {

  before(function(callback) {
    Assert.showPage(DefaultPage.createElement(), callback);
  });

  it('should contain a button labelled Leases', function() {
    Assert.existsButton('Leases');
  });

  it('should go to the Leases page when the Leases button is clicked', function(callback) {
    Asynchronous.series([
      function(callback) {
        Assert.waitForPageShown(function() {
          Assert.clickButton('Leases');
        }, callback);
      },
      function(callback) {
        Assert.onPage('Leases', callback);
      },
      function(callback) {
        Assert.hidePage(callback);
      }
    ], callback);
  });

  it('should return to the default page when the Leases and Back buttons are clicked', function(callback) {
    Asynchronous.series([
      function(callback) {
        Assert.waitForPageShown(function() {
          Assert.clickButton('Leases');
        }, callback);
      },
      function(callback) {
        Assert.waitForPageShown(function() {
          Assert.clickLink('Back');
        }, callback);
      },
      function(callback) {
        Assert.existsButton('Leases', callback);
      }
    ], callback);
  });

  it('should contain a button labelled Translations', function() {
    Assert.existsButton('Translations');
  });

  it('should go to the Translations page when the Translations button is clicked', function(callback) {
    Asynchronous.series([
      function(callback) {
        Assert.waitForPageShown(function() {
          Assert.clickButton('Translations');
        }, callback);
      },
      function(callback) {
        Assert.onPage('Translations', callback);
      },
      function(callback) {
        Assert.hidePage(callback);
      }
    ], callback);
  });

  it('should return to the default page when the Translations and Back buttons are clicked', function(callback) {
    Asynchronous.series([
      function(callback) {
        Assert.waitForPageShown(function() {
          Assert.clickButton('Translations');
        }, callback);
      },
      function(callback) {
        Assert.waitForPageShown(function() {
          Assert.clickLink('Back');
        }, callback);
      },
      function(callback) {
        Assert.existsButton('Translations', callback);
      }
    ], callback);
  });

  after(function(callback) {
    Assert.hidePage(callback);
  });

});

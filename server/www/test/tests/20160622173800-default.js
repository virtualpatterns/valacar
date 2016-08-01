var Asynchronous = require('async');

var Assert = require('../library/assert');
var Log = require('../../library/log');

var DefaultPage = require('../../library/elements/pages/default-page');

describe('DefaultPage', function() {

  before(function(callback) {
    Assert.showPage(DefaultPage.createElement(), callback);
  });

  it('should contain a button labelled Leases', function() {
    Assert.existsButton('Leases');
  });

  it('should contain a button labelled Translations', function() {
    Assert.existsButton('Translations');
  });

  it('should contain a button labelled History', function() {
    Assert.existsButton('History');
  });

  describe('DefaultPage to LeasesPage', function() {

    before(function(callback) {
      Assert.waitForPageShown(function() {
        Assert.clickButton('Leases');
      }, callback);
    });

    it('should go to the Leases page when the Leases button is clicked', function() {
      Assert.onPage('Leases');
    });

    after(function(callback) {
      Assert.hidePage(callback);
    });

  });

  describe('DefaultPage to TranslationsPage', function() {

    before(function(callback) {
      Assert.waitForPageShown(function() {
        Assert.clickButton('Translations');
      }, callback);
    });

    it('should go to the Translations page when the Translations button is clicked', function() {
      Assert.onPage('Translations');
    });

    after(function(callback) {
      Assert.hidePage(callback);
    });

  });

  describe('DefaultPage to HistoryPage', function() {

    before(function(callback) {
      Assert.waitForPageShown(function() {
        Assert.clickButton('History');
      }, callback);
    });

    it('should go to the History page when the History button is clicked', function() {
      Assert.onPage('History');
    });

    after(function(callback) {
      Assert.hidePage(callback);
    });

  });

  describe('DefaultPage to LeasesPage and Back', function() {

    before(function(callback) {
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
        }
      ], callback);
    });

    it('should return to the default page when the Leases and Back buttons are clicked', function() {
      Assert.existsButton('Leases');
    });

  });

  describe('DefaultPage to TranslationsPage and Back', function() {

    before(function(callback) {
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
        }
      ], callback);
    });

    it('should return to the default page when the Translations and Back buttons are clicked', function() {
      Assert.existsButton('Translations');
    });

  });

  describe('DefaultPage to HistoryPage and Back', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickButton('History');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickLink('Back');
          }, callback);
        }
      ], callback);
    });

    it('should return to the default page when the History and Back buttons are clicked', function() {
      Assert.existsButton('History');
    });

  });

  after(function(callback) {
    Assert.hidePage(callback);
  });

});

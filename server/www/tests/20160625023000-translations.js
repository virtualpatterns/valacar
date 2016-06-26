var Asynchronous = require('async');

var Application = require('../library/application');
var Assert = require('../library/assert');
var Log = require('../library/log');

var TranslationsPage = require('../library/elements/pages/translations-page');

describe('TranslationsPage', function() {

  before(function(callback) {
    Assert.showPage(TranslationsPage.createElement(), callback);
  });

  it('should be on the Translations page', function() {
    Assert.onPage('Translations');
  });

  it('should contain a link labelled Back', function() {
    Assert.existsLink('Back');
  });

  it('should contain a link labelled Add', function() {
    Assert.existsLink('Add');
  });

  it('should go to the Translation page when the Add button is clicked', function(callback) {
    Asynchronous.series([
      function(callback) {
        Assert.waitForPageShown(function() {
          Assert.clickLink('Add');
        }, callback);
      },
      function(callback) {
        Assert.onPage('Translation', callback);
      },
      function(callback) {
        Assert.hidePage(callback);
      }
    ], callback);
  });

  it('should return to the Translations page when the Add and Back buttons are clicked', function(callback) {
    Asynchronous.series([
      function(callback) {
        Assert.waitForPageShown(function() {
          Assert.clickLink('Add');
        }, callback);
      },
      function(callback) {
        Assert.waitForPageShown(function() {
          Assert.clickLink('Back');
        }, callback);
      },
      function(callback) {
        Assert.onPage('Translations', callback);
      }
    ], callback);
  });

  it('should show created translations', function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.POST('/api/translations', {
          'from': 'from01',
          'to': 'to01'
        }, callback);
      },
      function(callback) {
        Assert.waitForElementsShown(function() {
          Assert.clickSelector('#refresh');
        }, callback);
      },
      function(callback) {
        Assert.existsRow('from01', callback);
      },
      function(callback) {
        Assert.existsRow('to01', callback);
      }
    ], callback);
  });

  it('should not show deleted translations', function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.DELETE('/api/translations/from01', callback);
      },
      function(callback) {
        Assert.waitForElementsShown(function() {
          Assert.clickSelector('#refresh');
        }, callback);
      },
      function(callback) {
        Assert.notExistsRow('from01', callback);
      },
      function(callback) {
        Assert.notExistsRow('to01', callback);
      }
    ], callback);
  });

  it('should go to the Translation page when a translation is clicked', function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.POST('/api/translations', {
          'from': 'from02',
          'to': 'to02'
        }, callback);
      },
      function(callback) {
        Assert.waitForElementsShown(function() {
          Assert.clickSelector('#refresh');
        }, callback);
      },
      function(callback) {
        Assert.waitForPageShown(function() {
          Assert.clickRow('from02');
        }, callback);
      },
      function(callback) {
        Assert.onPage('Translation', callback);
      },
      function(callback) {
        Assert.hidePage(callback);
      }
    ], callback);
  });

  it('should return to the Translations page when a translation and Back buttons are clicked', function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.POST('/api/translations', {
          'from': 'from03',
          'to': 'to03'
        }, callback);
      },
      function(callback) {
        Assert.waitForElementsShown(function() {
          Assert.clickSelector('#refresh');
        }, callback);
      },
      function(callback) {
        Assert.waitForPageShown(function() {
          Assert.clickRow('from02');
        }, callback);
      },
      function(callback) {
        Assert.waitForPageShown(function() {
          Assert.clickLink('Back');
        }, callback);
      },
      function(callback) {
        Assert.onPage('Translations', callback);
      }
    ], callback);
  });

  after(function(callback) {
    Assert.hidePage(callback);
  });

});

var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../../library/application');
var Assert = require('../library/assert');
var Log = require('../../library/log');

var TranslationsPage = require('../../library/elements/pages/translations-page');
var TranslationsTable = require('../../library/elements/tables/translations-table');

describe('TranslationsPage', function() {

  before(function(callback) {
    // Asynchronous.waterfall([
    //   function(callback) {
    //     Application.GET('/api/translations', callback);
    //   },
    //   function(translations, callback) {
    //     if (translations.length > 0)
    //       Application.DELETE('/api/translations', callback);
    //     else
    //       callback(null);
    //   },
    //   function(callback) {
        Assert.showPage(TranslationsPage.createElement(), callback);
    //   }
    // ], callback);
  });

  it('should be on the Translations page', function() {
    Assert.onPage('Translations');
  });

  it('should contain a link labelled Back', function() {
    Assert.existsLink('Back');
  });

  it('should contain a Refresh link', function() {
    Assert.existsLinkId('refresh');
  });

  it('should contain a link labelled Add', function() {
    Assert.existsLink('Add');
  });

  describe('TranslationsPage to TranslationPage on Add', function() {

    before(function(callback) {
      Assert.waitForPageShown(function() {
        Assert.clickLink('Add');
      }, callback);
    });

    it('should go to the Translation page when the Add button is clicked', function() {
      Assert.onPage('Translation');
    });

    it('should contain a blank From on the Translation page when the Add button is clicked', function() {
      Assert.existsInputValue('from', '');
    });

    it('should contain a blank To on the Translation page when the Add button is clicked', function() {
      Assert.existsInputValue('to', '');
    });

    after(function(callback) {
      Assert.hidePage(callback);
    });

  });

  describe('TranslationsPage to TranslationPage on Add and Back', function() {

    before(function(callback) {
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
        }
      ], callback);
    });

    it('should return to the Translations page when the Add and Back buttons are clicked', function() {
      Assert.onPage('Translations');
    });

  });

  describe('TranslationsPage POST/Refresh', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'from01',
            'to': 'to01'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(TranslationsTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        }
      ], callback);
    });

    it('should show the translation From', function() {
      Assert.existsRow('from01');
    });

    it('should show the translation To', function() {
      Assert.existsRow('to01');
    });

    after(function(callback) {
      Application.DELETE('/api/translations/from01', callback);
    });

  });

  describe('TranslationsPage DELETE/Refresh', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'from01',
            'to': 'to01'
          }, callback);
        },
        function(callback) {
          Application.DELETE('/api/translations/from01', callback);
        },
        function(callback) {
          Assert.waitForElementsShown(TranslationsTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        }
      ], callback);
    });

    it('should not show the translation From', function() {
      Assert.notExistsRow('from01');
    });

    it('should not show the translation To', function() {
      Assert.notExistsRow('to01');
    });

  });

  describe('TranslationsPage to TranslationPage on Selected', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'from01',
            'to': 'to01'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(TranslationsTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickRow('from01');
          }, callback);
        },
      ], callback);
    });

    it('should go to the Translation page when the translation is clicked', function() {
      Assert.onPage('Translation');
    });

    it('should contain the From on the Translation page when the translation is clicked', function() {
      Assert.existsDisabledInputValue('from', 'from01');
    });

    it('should contain the To on the Translation page when the translation is clicked', function() {
      Assert.existsInputValue('to', 'to01');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.hidePage(callback);
        },
        function(callback) {
          Application.DELETE('/api/translations/from01', callback);
        }
      ], callback);
    });

  });

  describe('TranslationsPage to TranslationPage on Selected and Back', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'from01',
            'to': 'to01'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(function() {
            Assert.clickLinkId('refresh');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickRow('from01');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickLink('Back');
          }, callback);
        },
      ], callback);
    });

    it('should return to the Translations page when the translation and Back button are clicked', function() {
      Assert.onPage('Translations');
    });

  });

  after(function(callback) {
    Assert.hidePage(callback);
  });

});

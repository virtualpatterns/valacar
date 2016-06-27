var Asynchronous = require('async');

var Application = require('../../library/application');
var Assert = require('../library/assert');
var Log = require('../../library/log');

var TranslationsPage = require('../../library/elements/pages/translations-page');

describe('TranslationsPage', function() {

  beforeEach(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.POST('/api/translations', {
          'from': 'from00',
          'to': 'to00'
        }, callback);
      },
      function(callback) {
        Application.DELETE('/api/translations', callback);
      },
      function(callback) {
        Assert.showPage(TranslationsPage.createElement(), callback);
      }
    ], callback);
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

    beforeEach(function(callback) {
      Assert.waitForPageShown(function() {
        Assert.clickLink('Add');
      }, callback);
    });

    it('should go to the Translation page when the Add button is clicked', function() {
      Assert.onPage('Translation');
    });

    it('should contain a blank from on the Translation page when the Add button is clicked', function() {
      Assert.existsInput('from', '');
    });

    it('should contain a blank to on the Translation page when the Add button is clicked', function() {
      Assert.existsInput('from', '');
    });

    afterEach(function(callback) {
      Assert.hidePage(callback);
    });

  });

  describe('TranslationsPage to TranslationPage on Add and Back', function() {

    beforeEach(function(callback) {
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

    beforeEach(function(callback) {
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
        }
      ], callback);
    });

    it('should show the translation from from01', function() {
      Assert.existsRow('from01');
    });

    it('should show the translation to to01', function() {
      Assert.existsRow('to01');
    });

  });

  describe('TranslationsPage DELETE/Refresh', function() {

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'from02',
            'to': 'to02'
          }, callback);
        },
        function(callback) {
          Application.DELETE('/api/translations/from02', callback);
        },
        function(callback) {
          Assert.waitForElementsShown(function() {
            Assert.clickLinkId('refresh');
          }, callback);
        }
      ], callback);
    });

    it('should not show the translation from from02', function() {
      Assert.notExistsRow('from02');
    });

    it('should not show the translation to to02', function() {
      Assert.notExistsRow('to02');
    });

  });

  describe('TranslationsPage to TranslationsPage on Selected', function() {

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'from03',
            'to': 'to03'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(function() {
            Assert.clickLinkId('refresh');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickRow('from03');
          }, callback);
        },
      ], callback);
    });

    it('should go to the Translation page when the from03 translation is clicked', function() {
      Assert.onPage('Translation');
    });

    it('should contain the from from03 on the Translation page when the from03 translation is clicked', function() {
      Assert.existsInput('from', 'from03');
    });

    it('should contain the to to03 on the Translation page when the from03 translation is clicked', function() {
      Assert.existsInput('to', 'to03');
    });

    afterEach(function(callback) {
      Assert.hidePage(callback);
    });

  });


  describe('TranslationsPage to TranslationPage on Selected and Back', function() {

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'from04',
            'to': 'to04'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(function() {
            Assert.clickLinkId('refresh');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickRow('from04');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickLink('Back');
          }, callback);
        },
      ], callback);
    });

    it('should return to the Translations page when the from02 translation and Back button are clicked', function() {
      Assert.onPage('Translations');
    });

  });

  after(function(callback) {
    Assert.hideAllPages(callback);
  });

});

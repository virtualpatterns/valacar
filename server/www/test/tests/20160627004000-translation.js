var Asynchronous = require('async');

var Application = require('../../library/application');
var Assert = require('../library/assert');
var Log = require('../../library/log');

var TranslationPage = require('../../library/elements/pages/translation-page');
var TranslationsPage = require('../../library/elements/pages/translations-page');

describe('TranslationPage', function() {

  before(function(callback) {
    Asynchronous.waterfall([
      function(callback) {
        Application.GET('/api/translations', callback);
      },
      function(translations, callback) {
        if (translations.length > 0)
          Application.DELETE('/api/translations', callback);
        else
          callback(null);
      }
    ], callback);
  });

  describe('TranslationPage (blank translation)', function() {

    before(function(callback) {
      Assert.showPage(TranslationPage.createElement(TranslationPage.Source.createSource({})), callback);
    });

    it('should be on the Translation page', function() {
      Assert.onPage('Translation');
    });

    it('should contain a link labelled Back', function() {
      Assert.existsLink('Back');
    });

    it('should contain a link labelled Done', function() {
      Assert.existsLink('Done');
    });

    it('should contain a blank input for From', function() {
      Assert.existsInputValue('from', '');
    });

    it('should contain a blank input for To', function() {
      Assert.existsInputValue('to', '');
    });

    it('should not contain a delete link', function() {
      Assert.notExistsLinkId('delete');
    });

    after(function(callback) {
      Assert.hidePage(callback);
    });

  });

  describe('TranslationPage (existing translation)', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'from01',
            'to': 'to01'
          }, callback);
        },
        function(translation, callback) {
          Assert.showPage(TranslationPage.createElement(TranslationPage.Source.createSource(translation)), callback);
        }
      ], callback);
    });

    it('should be on the Translation page', function() {
      Assert.onPage('Translation');
    });

    it('should contain a link labelled Back', function() {
      Assert.existsLink('Back');
    });

    it('should contain a link labelled Done', function() {
      Assert.existsLink('Done');
    });

    it('should contain an input for From', function() {
      Assert.existsDisabledInputValue('from', 'from01');
    });

    it('should contain an input for To', function() {
      Assert.existsInputValue('to', 'to01');
    });

    it('should contain a delete link', function() {
      Assert.existsLinkId('delete');
    });

    after(function(callback) {
      Assert.hidePage(callback);
    });

  });

  describe('TranslationPage (blank translation) on valid From and To on Done', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.showPage(TranslationPage.createElement(TranslationPage.Source.createSource({})), callback);
        },
        function(callback) {
          Assert.inputValue('from', 'from01', callback);
        },
        function(callback) {
          Assert.inputValue('to', 'to01', callback);
        },
        function(callback) {
          Assert.clickLink('Done', callback);
        }
      ], callback);
    });

    it('should save the From for the translation', function(callback) {
      Application.GET('/api/translations/from01', function(error, translation) {
        if (error)
          callback(error);
        else {
          Assert.equal(translation.from, 'from01');
          callback(null);
        }
      });
    });

    it('should save the To for the translation', function(callback) {
      Application.GET('/api/translations/from01', function(error, translation) {
        if (error)
          callback(error);
        else {
          Assert.equal(translation.to, 'to01');
          callback(null);
        }
      });
    });

    after(function(callback) {
      Application.DELETE('/api/translations/from01', callback);
    });

  });

  describe('TranslationPage (blank translation) on invalid From on Done', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.showPage(TranslationPage.createElement(TranslationPage.Source.createSource({})), callback);
        },
        function(callback) {
          Assert.inputValue('from', '@from01', callback);
        },
        function(callback) {
          Assert.inputValue('to', 'to01', callback);
        },
        function(callback) {
          Assert.waitForModalShown(function() {
            Assert.clickLink('Done');
          }, callback);
        }
      ], callback);
    });

    it('should display an alert', function() {
      Assert.existsAlert('The translation from "@from01" is invalid.');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForModalHidden(function() {
            Assert.clickOk();
          }, callback);
        },
        function(callback) {
          Assert.hidePage(callback);
        }
      ], callback);
    });

  });

  describe('TranslationPage (blank translation) on invalid To on Done', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.showPage(TranslationPage.createElement(TranslationPage.Source.createSource({})), callback);
        },
        function(callback) {
          Assert.inputValue('from', 'from01', callback);
        },
        function(callback) {
          Assert.inputValue('to', '', callback);
        },
        function(callback) {
          Assert.waitForModalShown(function() {
            Assert.clickLink('Done');
          }, callback);
        }
      ], callback);
    });

    it('should display an alert', function() {
      Assert.existsAlert('The translation to "" is invalid.');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForModalHidden(function() {
            Assert.clickOk();
          }, callback);
        },
        function(callback) {
          Assert.hidePage(callback);
        }
      ], callback);
    });

  });

  describe('TranslationPage (existing translation) on Delete', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'from01',
            'to': 'to01'
          }, callback);
        },
        function(translation, callback) {
          Assert.showPage(TranslationPage.createElement(TranslationPage.Source.createSource(translation)), callback);
        },
        function(callback) {
          Assert.waitForModalShown(function() {
            Assert.clickLinkId('delete');
          }, callback);
        }
      ], callback);
    });

    it('should display a confirmation', function() {
      Assert.existsConfirmation('Are you sure you want to delete the translation from "from01"?');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForModalHidden(function() {
            Assert.clickNo();
          }, callback);
        },
        function(callback) {
          Assert.hidePage(callback);
        },
        function(callback) {
          Application.DELETE('/api/translations/from01', callback);
        }
      ], callback);
    });

  });

  describe('TranslationPage (existing translation) on Delete and Yes', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'from01',
            'to': 'to01'
          }, callback);
        },
        function(translation, callback) {
          Assert.showPage(TranslationPage.createElement(TranslationPage.Source.createSource(translation)), callback);
        },
        function(callback) {
          Assert.waitForModalShown(function() {
            Assert.clickLinkId('delete');
          }, callback);
        },
        function(callback) {
          Assert.waitForModalHidden(function() {
            Assert.clickYes();
          }, callback);
        }
      ], callback);
    });

    it('should delete the translation', function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.GET('/api/translations', callback);
        },
        function(translations, callback) {
          Assert.equal(translations.length, 0);
          callback(null);
        }
      ], callback);
    });

  });

  describe('TranslationPage (existing translation) on Delete and No', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'from01',
            'to': 'to01'
          }, callback);
        },
        function(translation, callback) {
          Assert.showPage(TranslationPage.createElement(TranslationPage.Source.createSource(translation)), callback);
        },
        function(callback) {
          Assert.waitForModalShown(function() {
            Assert.clickLinkId('delete');
          }, callback);
        },
        function(callback) {
          Assert.waitForModalHidden(function() {
            Assert.clickNo();
          }, callback);
        }
      ], callback);
    });

    it('should not delete the translation', function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.GET('/api/translations', callback);
        },
        function(translations, callback) {
          Assert.equal(translations.length, 1);
          callback(null);
        }
      ], callback);
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

});

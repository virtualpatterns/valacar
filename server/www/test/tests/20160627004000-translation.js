var Asynchronous = require('async');

var Application = require('../../library/application');
var Assert = require('../library/assert');
var Log = require('../../library/log');

var TranslationPage = require('../../library/elements/pages/translation-page');
var TranslationsPage = require('../../library/elements/pages/translations-page');

describe('TranslationPage', function() {

  beforeEach(function(callback) {
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

    beforeEach(function(callback) {
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

    it('should contain a blank input for from', function() {
      Assert.existsInputValue('from', '');
    });

    it('should contain a blank input for to', function() {
      Assert.existsInputValue('to', '');
    });

    it('should not contain a delete link', function() {
      Assert.notExistsLinkId('delete');
    });

    afterEach(function(callback) {
      Assert.hidePage(callback);
    });

  });

  describe('TranslationPage (existing translation)', function() {

    beforeEach(function(callback) {
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

    it('should contain an input for from containing "from01"', function() {
      Assert.existsInputValue('from', 'from01');
    });

    it('should contain an input for to containing "to01"', function() {
      Assert.existsInputValue('to', 'to01');
    });

    it('should contain a delete link', function() {
      Assert.existsLinkId('delete');
    });

    afterEach(function(callback) {
      Assert.hidePage(callback);
    });

  });

  describe('TranslationPage (blank translation) on valid From and To on Done', function() {

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.showPage(TranslationPage.createElement(TranslationPage.Source.createSource({})), callback);
        },
        function(callback) {
          Assert.inputValue('from', 'from02', callback);
        },
        function(callback) {
          Assert.inputValue('to', 'to02', callback);
        },
        function(callback) {
          Assert.clickLink('Done', callback);
        }
      ], callback);
    });

    it('should save the from "from02" for the translation "from02" to "to02"', function(callback) {
      Application.GET('/api/translations/from02', function(error, translation) {
        if (error)
          callback(error);
        else {
          Assert.equal(translation.from, 'from02');
          callback(null);
        }
      });
    });

    it('should save the to "to02" for the translation "from02" to "to02"', function(callback) {
      Application.GET('/api/translations/from02', function(error, translation) {
        if (error)
          callback(error);
        else {
          Assert.equal(translation.to, 'to02');
          callback(null);
        }
      });
    });

  });

  describe('TranslationPage (blank translation) on invalid From on Done', function() {

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.showPage(TranslationPage.createElement(TranslationPage.Source.createSource({})), callback);
        },
        function(callback) {
          Assert.inputValue('from', '@from03', callback);
        },
        function(callback) {
          Assert.inputValue('to', 'to03', callback);
        },
        function(callback) {
          Assert.waitForModalShown(function() {
            Assert.clickLink('Done');
          }, callback);
        }
      ], callback);
    });

    it('should display the alert "The translation from \'@from03\' is invalid."', function() {
      Assert.existsAlert('The translation from "@from03" is invalid.');
    });

    afterEach(function(callback) {
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

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.showPage(TranslationPage.createElement(TranslationPage.Source.createSource({})), callback);
        },
        function(callback) {
          Assert.inputValue('from', 'from03.5', callback);
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

    it('should display the alert "The translation to \'\' is invalid."', function() {
      Assert.existsAlert('The translation to "" is invalid.');
    });

    afterEach(function(callback) {
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

    beforeEach(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'from04',
            'to': 'to04'
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

    it('should display the confirmation "Are you sure you want to delete the translation from \'from04\'?"', function() {
      Assert.existsConfirmation('Are you sure you want to delete the translation from "from04"?');
    });

    afterEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForModalHidden(function() {
            Assert.clickNo();
          }, callback);
        },
        function(callback) {
          Assert.hidePage(callback);
        }
      ], callback);
    });

  });

  describe('TranslationPage (existing translation) on Delete and Yes', function() {

    beforeEach(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'from05',
            'to': 'to05'
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

    beforeEach(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'from06',
            'to': 'to06'
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

    afterEach(function(callback) {
      Assert.hidePage(callback);
    });

  });

});

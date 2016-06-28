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
      Assert.showPage(TranslationPage.createElement({}), callback);
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

    afterEach(function(callback) {
      Assert.hidePage(callback);
    });

  });

  describe('TranslationPage (blank translation) on valid From on Done', function() {

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.showPage(TranslationPage.createElement({}), callback);
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

    it('should save the from "from01" for the translation "from01" to "to01"', function(callback) {
      Application.GET('/api/translations/from01', function(error, translation) {
        if (error)
          callback(error);
        else {
          Assert.equal(translation.from, 'from01');
          callback(null);
        }
      });
    });

    it('should save the to "to01" for the translation "from01" to "to01"', function(callback) {
      Application.GET('/api/translations/from01', function(error, translation) {
        if (error)
          callback(error);
        else {
          Assert.equal(translation.to, 'to01');
          callback(null);
        }
      });
    });

  });

  describe('TranslationPage (blank translation) on invalid From on Done', function() {

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.showPage(TranslationPage.createElement({}), callback);
        },
        function(callback) {
          Assert.inputValue('from', '@from02', callback);
        },
        function(callback) {
          Assert.inputValue('to', 'to02', callback);
        },
        function(callback) {
          Assert.waitForModalShown(function() {
            Assert.clickLink('Done');
          }, callback);
        }
      ], callback);
    });

    it('should display the alert "The translation from \'@from02\' is invalid."', function() {
      Assert.existsAlert('The translation from "@from02" is invalid.');
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

  // describe('TranslationPage to TranslationsPage on Done', function() {
  //
  //   beforeEach(function(callback) {
  //     Assert.waitForPageShown(function() {
  //       Assert.clickLink('Done');
  //     }, callback);
  //   });
  //
  //   it('should go to the Translations page when the Done button is clicked', function() {
  //     Assert.onPage('Translation');
  //   });
  //
  //   afterEach(function(callback) {
  //     Assert.hidePage(callback);
  //   });
  //
  // });
  //
  // describe('TranslationPage to TranslationPage on Done and Back', function() {
  //
  //   beforeEach(function(callback) {
  //     Asynchronous.series([
  //       function(callback) {
  //         Assert.waitForPageShown(function() {
  //           Assert.clickLink('Done');
  //         }, callback);
  //       },
  //       function(callback) {
  //         Assert.waitForPageShown(function() {
  //           Assert.clickLink('Back');
  //         }, callback);
  //       }
  //     ], callback);
  //   });
  //
  //   it('should return to the Translations page when the Done and Back buttons are clicked', function() {
  //     Assert.onPage('Translations');
  //   });
  //
  // });
  //
  // describe('TranslationPage POST/Refresh', function() {
  //
  //   beforeEach(function(callback) {
  //     Asynchronous.series([
  //       function(callback) {
  //         Application.POST('/api/translations', {
  //           'from': 'from01',
  //           'to': 'to01'
  //         }, callback);
  //       },
  //       function(callback) {
  //         Assert.waitForElementsShown(function() {
  //           Assert.clickLinkId('refresh');
  //         }, callback);
  //       }
  //     ], callback);
  //   });
  //
  //   it('should show the translation from from01', function() {
  //     Assert.existsRow('from01');
  //   });
  //
  //   it('should show the translation to to01', function() {
  //     Assert.existsRow('to01');
  //   });
  //
  // });
  //
  // describe('TranslationPage DELETE/Refresh', function() {
  //
  //   beforeEach(function(callback) {
  //     Asynchronous.series([
  //       function(callback) {
  //         Application.POST('/api/translations', {
  //           'from': 'from02',
  //           'to': 'to02'
  //         }, callback);
  //       },
  //       function(callback) {
  //         Application.DELETE('/api/translations/from02', callback);
  //       },
  //       function(callback) {
  //         Assert.waitForElementsShown(function() {
  //           Assert.clickLinkId('refresh');
  //         }, callback);
  //       }
  //     ], callback);
  //   });
  //
  //   it('should not show the translation from from02', function() {
  //     Assert.notExistsRow('from02');
  //   });
  //
  //   it('should not show the translation to to02', function() {
  //     Assert.notExistsRow('to02');
  //   });
  //
  // });
  //
  // describe('TranslationPage to TranslationsPage on Selected', function() {
  //
  //   beforeEach(function(callback) {
  //     Asynchronous.series([
  //       function(callback) {
  //         Application.POST('/api/translations', {
  //           'from': 'from03',
  //           'to': 'to03'
  //         }, callback);
  //       },
  //       function(callback) {
  //         Assert.waitForElementsShown(function() {
  //           Assert.clickLinkId('refresh');
  //         }, callback);
  //       },
  //       function(callback) {
  //         Assert.waitForPageShown(function() {
  //           Assert.clickRow('from03');
  //         }, callback);
  //       },
  //     ], callback);
  //   });
  //
  //   it('should go to the Translation page when the from03 translation is clicked', function() {
  //     Assert.onPage('Translation');
  //   });
  //
  //   it('should contain the from from03 on the Translation page when the from03 translation is clicked', function() {
  //     Assert.existsInput('from', 'from03');
  //   });
  //
  //   it('should contain the to to03 on the Translation page when the from03 translation is clicked', function() {
  //     Assert.existsInput('to', 'to03');
  //   });
  //
  //   afterEach(function(callback) {
  //     Assert.hidePage(callback);
  //   });
  //
  // });
  //
  //
  // describe('TranslationPage to TranslationPage on Selected and Back', function() {
  //
  //   beforeEach(function(callback) {
  //     Asynchronous.series([
  //       function(callback) {
  //         Application.POST('/api/translations', {
  //           'from': 'from04',
  //           'to': 'to04'
  //         }, callback);
  //       },
  //       function(callback) {
  //         Assert.waitForElementsShown(function() {
  //           Assert.clickLinkId('refresh');
  //         }, callback);
  //       },
  //       function(callback) {
  //         Assert.waitForPageShown(function() {
  //           Assert.clickRow('from04');
  //         }, callback);
  //       },
  //       function(callback) {
  //         Assert.waitForPageShown(function() {
  //           Assert.clickLink('Back');
  //         }, callback);
  //       },
  //     ], callback);
  //   });
  //
  //   it('should return to the Translations page when the from02 translation and Back button are clicked', function() {
  //     Assert.onPage('Translations');
  //   });
  //
  // });

  // afterEach(function(callback) {
  //   Assert.hideAllPages(callback);
  // });

});

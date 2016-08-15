var Asynchronous = require('async');

var Application = require('../../library/application');
var Assert = require('../library/assert');
var Log = require('../../library/log');

var SettingsPage = require('../../library/elements/pages/settings-page');

describe('SettingsPage', function() {

  describe('SettingsPage (existing settings)', function() {

    before(function(callback) {
      Assert.showPage(SettingsPage.createElement(), callback);
    });

    it('should be on the Settings page', function() {
      Assert.onPage('Settings');
    });

    it('should contain a link labelled Back', function() {
      Assert.existsLink('Back');
    });

    it('should contain a link labelled Done', function() {
      Assert.existsLink('Done');
    });

    it('should contain an input for API URL', function() {
      Assert.existsInputId('url');
    });

    after(function(callback) {
      Assert.hidePage(callback);
    });

  });

});

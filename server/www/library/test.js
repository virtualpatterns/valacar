var Asynchronous = require('async');

var Application = require('./application');

var TestPage = require('./elements/pages/test-page');

jQuery.noConflict();

jQuery(function() {

  Asynchronous.waterfall([
    function(callback) {
      Application.createApplication(callback);
    },
    function(application, callback) {
      window.application = application;
      window.application.showPage(TestPage.createElement(), callback);
    }
  ], Application.ifNotError());

});

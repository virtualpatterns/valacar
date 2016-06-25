var Asynchronous = require('async');

var Application = require('./application');
var Log = require('./log');

var DefaultPage = require('./elements/pages/default-page');

jQuery.noConflict();

jQuery(function() {

  Asynchronous.waterfall([
    function(callback) {
      Application.createApplication(callback);
    },
    function(application, callback) {
      window.application = application;
      window.application.showPage(DefaultPage.createElement(), callback);
    }
  ], Application.ifNotError());

});

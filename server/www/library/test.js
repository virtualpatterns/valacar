require('./object-assign');

var Asynchronous = require('async');

var Application = require('./application');
var Log = require('./log');
var TestPage = require('./elements/pages/test-page');

jQuery.noConflict();


  window.onerror = function (errorMsg, url, lineNumber) {
    alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
  };

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

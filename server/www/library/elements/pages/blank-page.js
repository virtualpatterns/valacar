var Page = require('../page');

var pagePrototype = Page.getElementPrototype();
var blankPagePrototype = Object.create(pagePrototype);

blankPagePrototype.bind = function() {
  this.getElement().find('#goBack').on('click', {
    'this': this
  }, this.onGoBack);
};

blankPagePrototype.unbind = function() {
  this.getElement().find('#goBack').off('click', this.onGoBack);
};

blankPagePrototype.onGoBack = function(event) {
  window.application.removePage();
};

var BlankPage = Object.create(Page);

BlankPage.createElement = function(templateURL, prototype) {
  return Page.createElement.call(this, templateURL || '/www/views/elements/pages/blank-page.jade', prototype || blankPagePrototype);
};

BlankPage.isElement = function(blankPage) {
  return blankPagePrototype.isPrototypeOf(blankPage);
};

BlankPage.getElementPrototype = function() {
  return blankPagePrototype;
};

module.exports = BlankPage;

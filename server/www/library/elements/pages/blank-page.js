var Page = require('../page');

var pagePrototype = Page.getContentPrototype();
var blankPagePrototype = Object.create(pagePrototype);

blankPagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  this.getContent().find('#goBack').on('click', {
    'this': this
  }, this.onGoBack);

};

blankPagePrototype.unbind = function() {
  
  this.getContent().find('#goBack').off('click', this.onGoBack);

  pagePrototype.unbind.call(this);

};

blankPagePrototype.onGoBack = function(event) {
  window.application.hidePage();
};

var BlankPage = Object.create(Page);

BlankPage.createElement = function(templateURL, prototype) {
  return Page.createElement.call(this, templateURL || '/www/views/elements/pages/blank-page.jade', prototype || blankPagePrototype);
};

BlankPage.isElement = function(blankPage) {
  return blankPagePrototype.isPrototypeOf(blankPage);
};

BlankPage.getContentPrototype = function() {
  return blankPagePrototype;
};

module.exports = BlankPage;

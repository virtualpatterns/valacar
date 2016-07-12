var Is = require('@pwn/is');
var Utilities = require('util');

var Element = require('../element');
var Page = require('./page');
var Log = require('../log');

var pagePrototype = Page.getElementPrototype();
var modalPrototype = Object.create(pagePrototype);

modalPrototype.show = function(options) {

  options = options || {};
  options.bgclose = false;

  Log.info('> Modal.show(options) { ... }\n\n%s\n\n', Utilities.inspect(options));

  this.Modal = UIkit.modal(Utilities.format('#%s', this.id), options);

  if (!this.Modal.isActive())
    this.Modal.show();

};

modalPrototype.hide = function(results) {
  Log.info('> Modal.hide(results) { ... }\n\n%s\n\n', Utilities.inspect(results));

  this.getContent().data('results', results);

  if (this.Modal.isActive())
    this.Modal.hide();

  this.Modal = null;

};

modalPrototype.render = function(data, callback) {

  if (Is.function(data)) {
    callback = data;
    data = {};
  }

  Log.info('> Modal.render(data, callback) { ... }\n\n%s\n\n', Utilities.inspect(data));

  pagePrototype.render.call(this, data, function(error, content) {
    if (error)
      callback(error);
    else {
      content = Element.show(content);
      Log.info('< Modal.render(data, callback) { ... }\n\n%s\n\n', content);
      callback(null, content);
    }
  });

};

modalPrototype.bind = function() {
  pagePrototype.bind.call(this);
  this.getContent().data('Modal', this);
};

modalPrototype.unbind = function() {
  this.getContent().removeData('Modal');
  pagePrototype.unbind.call(this);
};

var Modal = Object.create(Page);

Modal.createElement = function(templateURL, prototype) {
  return Page.createElement.call(this, templateURL || '/www/views/elements/modal.jade', prototype || modalPrototype);
};

Modal.isElement = function(modal) {
  return modalPrototype.isPrototypeOf(modal);
};

Modal.getElementPrototype = function() {
  return modalPrototype;
};

module.exports = Modal;

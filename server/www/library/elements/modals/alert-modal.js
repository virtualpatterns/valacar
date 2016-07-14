var Log = require('../../log');
var Modal = require('../modal');

var modalPrototype = Modal.getElementPrototype();
var alertModalPrototype = Object.create(modalPrototype);

alertModalPrototype.bind = function() {

  modalPrototype.bind.call(this);

  this.getContent().find('#ok').on('click', {
    'this': this
  }, this.onOk);

};

alertModalPrototype.unbind = function() {

  this.getContent().find('#ok').off('click', this.onOk);

  modalPrototype.unbind.call(this);

};

alertModalPrototype.onOk = function(event) {
  Log.info('> AlertModal.onOk(event) { ... }');
  window.application.hideModal(true);
};

var AlertModal = Object.create(Modal);

AlertModal.createElement = function(message, templateURL, prototype) {

  var alertModal = Modal.createElement.call(this, templateURL || '/www/views/elements/modals/alert-modal.jade', prototype || alertModalPrototype);

  Object.defineProperty(alertModal, 'message', {
    'enumerable': false,
    'writable': false,
    'value': message
  });

  return alertModal;

};

AlertModal.isElement = function(alertModal) {
  return alertModalPrototype.isPrototypeOf(alertModal);
};

AlertModal.getElementPrototype = function() {
  return alertModalPrototype;
};

module.exports = AlertModal;

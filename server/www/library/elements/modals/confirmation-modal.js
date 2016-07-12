var Log = require('../../log');
var Modal = require('../modal');

var modalPrototype = Modal.getElementPrototype();
var confirmationModalPrototype = Object.create(modalPrototype);

confirmationModalPrototype.bind = function() {

  modalPrototype.bind.call(this);

  this.getContent().find('#yes').on('click', {
    'this': this
  }, this.onYes);
  this.getContent().find('#no').on('click', {
    'this': this
  }, this.onNo);

};

confirmationModalPrototype.unbind = function() {

  this.getContent().find('#yes').off('click', this.onYes);
  this.getContent().find('#no').off('click', this.onNo);

  modalPrototype.unbind.call(this);

};

confirmationModalPrototype.onYes = function(event) {
  Log.info('> ConfirmationModal.onYes(event) { ... }');
  window.application.hideModal(true);
};

confirmationModalPrototype.onNo = function(event) {
  Log.info('> ConfirmationModal.onNo(event) { ... }');
  window.application.hideModal(false);
};

var ConfirmationModal = Object.create(Modal);

ConfirmationModal.createElement = function(message, templateURL, prototype) {

  var confirmationModal = Modal.createElement.call(this, templateURL || '/www/views/elements/modals/confirmation-modal.jade', prototype || confirmationModalPrototype);

  Object.defineProperty(confirmationModal, 'message', {
    'enumerable': false,
    'writable': false,
    'value': message
  });

  return confirmationModal;

};

ConfirmationModal.isElement = function(confirmationModal) {
  return confirmationModalPrototype.isPrototypeOf(confirmationModal);
};

ConfirmationModal.getElementPrototype = function() {
  return confirmationModalPrototype;
};

module.exports = ConfirmationModal;

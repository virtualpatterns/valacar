var Log = require('../../log');
var Modal = require('../modal');

var modalPrototype = Modal.getElementPrototype();
var leaseInstructionsModalPrototype = Object.create(modalPrototype);

leaseInstructionsModalPrototype.bind = function() {

  modalPrototype.bind.call(this);

  this.getContent().find('#close').on('click', {
    'this': this
  }, this.onClose);

};

leaseInstructionsModalPrototype.unbind = function() {

  this.getContent().find('#close').off('click', this.onClose);

  modalPrototype.unbind.call(this);

};

leaseInstructionsModalPrototype.onClose = function(event) {
  Log.info('> LeaseInstructionsModal.onClose(event) { ... }');
  window.application.hideModal();
};

var LeaseInstructionsModal = Object.create(Modal);

LeaseInstructionsModal.createElement = function(source, templateURL, prototype) {

  var leaseInstructionsModal = Modal.createElement.call(this, templateURL || '/www/views/elements/modals/lease-instructions-modal.jade', prototype || leaseInstructionsModalPrototype);

  Object.defineProperty(leaseInstructionsModal, 'source', {
    'enumerable': false,
    'writable': false,
    'value': source
  });

  return leaseInstructionsModal;

};

LeaseInstructionsModal.isElement = function(leaseInstructionsModal) {
  return leaseInstructionsModalPrototype.isPrototypeOf(leaseInstructionsModal);
};

LeaseInstructionsModal.getElementPrototype = function() {
  return leaseInstructionsModalPrototype;
};

module.exports = LeaseInstructionsModal;

var Log = require('../../log');
var Modal = require('../modal');

var modalPrototype = Modal.getElementPrototype();
var settingsInstructionsModalPrototype = Object.create(modalPrototype);

settingsInstructionsModalPrototype.bind = function() {

  modalPrototype.bind.call(this);

  this.getContent().find('#ok').on('click', {
    'this': this
  }, this.onOk);

};

settingsInstructionsModalPrototype.unbind = function() {

  this.getContent().find('#ok').off('click', this.onOk);

  modalPrototype.unbind.call(this);

};

settingsInstructionsModalPrototype.onOk = function(event) {
  Log.info('> SettingsInstructionsModal.onClose(event) { ... }');
  window.application.hideModal(false);
};

var SettingsInstructionsModal = Object.create(Modal);

SettingsInstructionsModal.createElement = function(templateURL, prototype) {
  return Modal.createElement.call(this, templateURL || '/www/views/elements/modals/settings-instructions-modal.jade', prototype || settingsInstructionsModalPrototype);
};

SettingsInstructionsModal.isElement = function(settingsInstructionsModal) {
  return settingsInstructionsModalPrototype.isPrototypeOf(settingsInstructionsModal);
};

SettingsInstructionsModal.getElementPrototype = function() {
  return settingsInstructionsModalPrototype;
};

module.exports = SettingsInstructionsModal;

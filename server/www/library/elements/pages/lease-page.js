require('../../../vendor/DateJS');

var Asynchronous = require('async');var Utilities = require('util');

var Moment = require('../../../vendor/moment/moment')

var Application = require('../../application');
var Element = require('../../element');
var Log = require('../../log');
var Page = require('../page');

var LeaseInstructionsModal = require('../modals/lease-instructions-modal');
var TranslationPage = require('./translation-page');

var pageSourcePrototype = Page.Source.getSourcePrototype();
var leasePageSourcePrototype = Object.create(pageSourcePrototype);

var LeasePageSource = Object.create(Page.Source);

LeasePageSource.createSourceId = function(lease) {
  // Log.info('> LeasePageSource.createSourceId(lease) { ... }\n\n%s\n\n', Utilities.inspect(lease));
  return {
    'address': lease.address,
    'from': lease.from,
    'fromAsISOString': (lease.from ? Date.parse(lease.from) : new Date(0)).toISOString(),
    'to': lease.to,
    'toAsISOString': (lease.to ? Date.parse(lease.to) : new Date(0)).toISOString()
  };
};

LeasePageSource.createSource = function(lease, prototype) {
  // Log.info('> LeasePageSource.createSource(lease, prototype) { ... }\n\n%s\n\n', Utilities.inspect(lease));

  var leasePageSource = Page.Source.createSource.call(this, this.createSourceId(lease), prototype || leasePageSourcePrototype);

  Object.assign(leasePageSource, lease);

  leasePageSource.fromAsDate = (lease.from ? Date.parse(lease.from) : new Date(0));
  leasePageSource.toAsDate = (lease.to ? Date.parse(lease.to) : new Date(0));

  leasePageSource.fromNowAsString = Moment(leasePageSource.fromAsDate).fromNow();
  leasePageSource.toNowAsString = Moment(leasePageSource.toAsDate).fromNow();
  leasePageSource.toAsString = Moment(leasePageSource.toAsDate).format('h:mm a');

  leasePageSource.isStatic = leasePageSource.fromAsDate.getTime() == leasePageSource.toAsDate.getTime();
  leasePageSource.isSystem = (!leasePageSource.isStatic && leasePageSource.inserted)
  leasePageSource.isNewStatic = (leasePageSource.isStatic && !leasePageSource.inserted)
  leasePageSource.isExistingStatic = (leasePageSource.isStatic && leasePageSource.inserted)

  return leasePageSource;

};

LeasePageSource.isSource = function(source) {
  return leasePageSourcePrototype.isPrototypeOf(source);
};

LeasePageSource.getSourcePrototype = function() {
  return leasePageSourcePrototype;
};

var pagePrototype = Page.getElementPrototype();
var leasePagePrototype = Object.create(pagePrototype);

leasePagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  this.getContent().find('#goBack').on('click', {
    'this': this
  }, this.onGoBack);
  this.getContent().find('#done').on('click', {
    'this': this
  }, this.onDone);

  this.getContent().find('#delete').on('click', {
    'this': this
  }, this.onDelete);

  this.getContent().find('#addLease').on('click', {
    'this': this
  }, this.onAddLease);
  this.getContent().find('#copyLease').on('click', {
    'this': this
  }, this.onAddLease);
  this.getContent().find('#addTranslation').on('click', {
    'this': this
  }, this.onAddTranslation);


};

leasePagePrototype.unbind = function() {

  this.getContent().find('#addTranslation').off('click', this.onAddTranslation);
  this.getContent().find('#copyLease').off('click', this.onAddLease);
  this.getContent().find('#addLease').off('click', this.onAddLease);

  this.getContent().find('#delete').off('click', this.onDelete);

  this.getContent().find('#done').off('click', this.onDone);
  this.getContent().find('#goBack').off('click', this.onGoBack);

  pagePrototype.unbind.call(this);

};

leasePagePrototype.onGoBack = function(event) {
  Log.info('> LeasePage.onGoBack(event) { ... }');
  window.application.hidePage();
};

leasePagePrototype.onDone = function(event) {
  Log.info('> LeasePage.onDone(event) { ... }');

  var self = event.data.this;
  var source = Object.assign({}, self.source);

  source.address = self.getContent().find('#address').val();
  source.device = self.getContent().find('#device').val();
  source.host = self.getContent().find('#host').val();

  Application.POST('/api/leases', source, Application.ifNotError(function(lease) {
    Log.debug('= LeasePage.onDone(event) { ... }\n\n%s\n\n', Utilities.inspect(lease));
    window.application.hidePage();
  }));

};

leasePagePrototype.onDelete = function(event) {
  Log.info('> LeasePage.onDelete(event) { ... }');

  var self = event.data.this;
  var source = Object.assign({}, self.source);

  source.address = self.getContent().find('#address').val();
  source.device = self.getContent().find('#device').val();
  source.host = self.getContent().find('#host').val();

  UIkit.modal.confirm(Utilities.format('Are you sure you want to delete the static DHCP lease for %j?', source.address), function() {

    Asynchronous.series([
      function(callback) {
        Application.DELETE(Utilities.format('/api/leases/%s', source.address), callback);
      },
      function(callback) {
        window.application.showModal(LeaseInstructionsModal.createElement(source), callback);
      }
    ], Application.ifNotError(function() {
      window.application.hidePage();
    }));

  }, {
    labels: {
     'Ok': 'Yes',
     'Cancel': 'No'
    }
  });

};

leasePagePrototype.onAddLease = function(event) {
  Log.info('> LeasePage.onAddLease(event) { ... }');

  var self = event.data.this;
  var lease = {};

  lease.address = null;
  lease.device = self.lease.device;
  lease.host = self.lease.host;

  Asynchronous.series([
    function(callback) {
      window.application.waitForPageHidden(callback);
    },
    function(callback) {
      window.application.showPage(LeasePage.createElement(LeasePage.Source.createSource(lease)), callback);
    }
  ], Application.ifNotError());

  // Asynchronous.series([
  //   function(callback) {
  //     window.application.waitForPageShown(function() {
  //       window.application.hidePage();
  //     }, callback);
  //   },
  //   function(callback) {
  //     window.application.showPage(LeasePage.createElement(LeasePage.createLease(lease)), callback);
  //   }
  // ], Application.ifNotError());

  // window.application.hidePage();
  // window.application.showPage(LeasePage.createElement(LeasePage.createLease(lease)), Application.ifNotError());

};

leasePagePrototype.onAddTranslation = function(event) {
  Log.info('> LeasePage.onAddTranslation(event) { ... }');

  var self = event.data.this;
  var translation = {};

  translation.from = self.source.device;
  translation.to = null;

  Asynchronous.series([
    function(callback) {
      window.application.waitForPageHidden(callback);
    },
    function(callback) {
      window.application.showPage(TranslationPage.createElement(TranslationPage.Source.createSource(translation)), callback);
    }
  ], Application.ifNotError());

};

var LeasePage = Object.create(Page);

LeasePage.createElement = function(source, templateURL, prototype) {

  var leasePage = Page.createElement.call(this, templateURL || '/www/views/elements/pages/lease-page.jade', prototype || leasePagePrototype);

  Object.defineProperty(leasePage, 'source', {
    'enumerable': false,
    'writable': false,
    'value': source
  });

  return leasePage;

};

LeasePage.isElement = function(leasePage) {
  return leasePagePrototype.isPrototypeOf(leasePage);
};

LeasePage.getElementPrototype = function() {
  return leasePagePrototype;
};

LeasePage.Source = LeasePageSource;

// LeasePage.createLeaseId = function(leaseId) {
//   // Log.debug('> LeasePage.createLeaseId(leaseId) { ... }\n\n%s\n\n', Utilities.inspect(leaseId));
//
//   leaseId.fromAsDate = Date.parse(leaseId.from);
//   leaseId.toAsDate = Date.parse(leaseId.to);
//
//   // Log.debug('< LeasePage.createLeaseId(leaseId) { ... }\n\n%s\n\n', Utilities.inspect(leaseId));
//
//   return leaseId;
//
// };
//
// LeasePage.createLease = function(lease) {
//   // Log.debug('> LeasePage.createLease(lease) { ... }\n\n%s\n\n', Utilities.inspect(lease));
//
//   lease = lease || {};
//
//   lease.fromAsDate = lease.from ? Date.parse(lease.from) : new Date(0);
//   lease.toAsDate = lease.from ? Date.parse(lease.to) : new Date(0);
//
//   lease.fromNowAsString = Moment(lease.fromAsDate).fromNow();
//   lease.toNowAsString = Moment(lease.toAsDate).fromNow();
//   lease.toAsString = Moment(lease.toAsDate).format('h:mm a');
//
//   lease.id = {
//     'address': lease.address,
//     'from': lease.fromAsDate,
//     'to': lease.toAsDate
//   };
//
//   // Log.debug('< LeasePage.createLease(lease) { ... }\n\n%s\n\n', Utilities.inspect(lease));
//
//   return lease;
//
// };

module.exports = LeasePage;

require('../../../vendor/DateJS');

var Asynchronous = require('async');var Utilities = require('util');

var Moment = require('../../../vendor/moment/moment');

var Application = require('../../application');
var Element = require('../../element');
var Log = require('../../log');
var Page = require('../page');

var LeaseInstructionsModal = require('../modals/lease-instructions-modal');
var AlertModal = require('../modals/alert-modal');
var TranslationPage = require('./translation-page');

var pageSourcePrototype = Page.Source.getSourcePrototype();
var leasePageSourcePrototype = Object.create(pageSourcePrototype);

var LeasePageSource = Object.create(Page.Source);

LeasePageSource.createSourceId = function(lease) {
  // Log.debug('> LeasePageSource.createSourceId(lease) { ... }\n\n%s\n\n', Utilities.inspect(lease));

  var leaseId = {
    'address': lease.address,
    'fromAsISOString': (lease.from ? Date.parse(lease.from) : new Date(0)).toISOString(),
    'toAsISOString': (lease.to ? Date.parse(lease.to) : new Date(0)).toISOString()
  };

  // Log.debug('< LeasePageSource.createSourceId(lease) { ... }\n\n%s\n\n', Utilities.inspect(leaseId));

  return leaseId;

};

LeasePageSource.createSource = function(lease, translation, prototype) {
  // Log.debug('> LeasePageSource.createSource(lease, prototype) { ... }\n\n%s\n\n', Utilities.inspect(lease));

  var leasePageSource = Page.Source.createSource.call(this, this.createSourceId(lease), prototype || leasePageSourcePrototype);

  Object.assign(leasePageSource, lease);

  leasePageSource.fromAsDate = (lease.from ? Date.parse(lease.from) : new Date(0));
  leasePageSource.toAsDate = (lease.to ? Date.parse(lease.to) : new Date(0));

  leasePageSource.fromNowAsString = Moment(leasePageSource.fromAsDate).fromNow();
  leasePageSource.toNowAsString = Moment(leasePageSource.toAsDate).fromNow();
  leasePageSource.toAsString = Moment(leasePageSource.toAsDate).format('h:mm a');

  leasePageSource.insertedAsDate = (lease.inserted ? Date.parse(lease.inserted) : new Date());

  leasePageSource.isStatic = leasePageSource.fromAsDate.getTime() == leasePageSource.toAsDate.getTime();
  leasePageSource.isSystem = (!leasePageSource.isStatic && leasePageSource.inserted)
  leasePageSource.isNewStatic = (leasePageSource.isStatic && !leasePageSource.inserted)
  leasePageSource.isExistingStatic = (leasePageSource.isStatic && leasePageSource.inserted)

  if (translation)
    leasePageSource.translation = translation;

  // Log.debug('< LeasePageSource.createSource(lease, prototype) { ... }\n\n%s\n\n', Utilities.inspect(leasePageSource));

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
  this.getContent().find('#editTranslation').on('click', {
    'this': this
  }, this.onEditTranslation);

  this.getContent().find('#address').mask('0NN.0NN.0NN.0NN', {
    'translation': {
      'N': {
        'optional': true,
        'pattern': /[0-9]/
      }
    }
  });

  this.getContent().find('#device').mask('NN:NN:NN:NN:NN:NN', {
    'translation': {
      'N': {
        'optional': false,
        'pattern': /[0-9a-f]/
      }
    }
  });

};

leasePagePrototype.unbind = function() {

  this.getContent().find('#device').unmask();
  this.getContent().find('#address').unmask();

  this.getContent().find('#editTranslation').off('click', this.onEditTranslation);
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

  Asynchronous.waterfall([
    function(callback) {
      // Log.debug('> Application.POST("/api/leases", source, function(error, lease) { ... })\n\n%s\n\n', Utilities.inspect(source));
      Application.POST('/api/leases', source, function(error, lease) {
        // if (!error)
          // Log.debug('< Application.POST("/api/leases", source, function(error, lease) { ... })\n\n%s\n\n', Utilities.inspect(lease));
        callback(error, lease);
      });
    },
    function(lease, callback) {
      // Log.debug('> window.application.showModal(LeaseInstructionsModal.createElement(LeasePage.Source.createSource(lease)), callback)\n\n%s\n\n', Utilities.inspect(source));
      window.application.showModal(LeaseInstructionsModal.createElement(LeasePage.Source.createSource(lease)), function(error) {
        // Log.debug('< window.application.showModal(LeaseInstructionsModal.createElement(LeasePage.Source.createSource(lease)), callback)');
        callback(error);
      });
    }
  ], Application.ifNotError(function() {
    // Log.debug('> window.application.hidePage()');
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

  Application.confirm('Are you sure you want to delete the static DHCP lease for %j?', source.address, function() {
    Asynchronous.series([
      function(callback) {
        Application.DELETE(Utilities.format('/api/leases/%s/%s/%s', source.address, source.fromAsDate.toISOString(), source.toAsDate.toISOString()), callback);
      },
      function(callback) {
        window.application.showModal(LeaseInstructionsModal.createElement(source), callback);
      }
    ], Application.ifNotError(function() {
      window.application.hidePage();
    }));
  });

};

leasePagePrototype.onAddLease = function(event) {
  Log.info('> LeasePage.onAddLease(event) { ... }');

  var self = event.data.this;
  var lease = {};

  lease.address = null;
  lease.device = self.source.device;
  lease.host = self.source.host;

  Asynchronous.series([
    function(callback) {
      window.application.waitForPageHidden(callback);
    },
    function(callback) {
      window.application.showPage(LeasePage.createElement(LeasePage.Source.createSource(lease)), callback);
    }
  ], Application.ifNotError());

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

leasePagePrototype.onEditTranslation = function(event) {
  Log.info('> LeasePage.onEditTranslation(event) { ... }');

  var self = event.data.this;
  var translation = self.source.translation;

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

module.exports = LeasePage;

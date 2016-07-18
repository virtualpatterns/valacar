var Asynchronous = require('async');
var Is = require('@pwn/is');
var Utilities = require('util');

var Application = require('../../application');
var Element = require('../../element');
var Log = require('../../log');
var Page = require('../page');

var LeasePage = require('./lease-page');
var LeasesTable = require('../tables/leases-table');

var pagePrototype = Page.getElementPrototype();
var leasesPagePrototype = Object.create(pagePrototype);

leasesPagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  jQuery(this).on('v-shown', {
    'this': this
  }, this.onShown);

  jQuery(this).on('v-hidden', {
    'this': this
  }, this.onHidden);

  this.getContent().find('#goBack').on('click', {
    'this': this
  }, this.onGoBack);
  this.getContent().find('#refresh').on('click', {
    'this': this
  }, this.onRefresh);
  this.getContent().find('#addLease').on('click', {
    'this': this
  }, this.onAddLease);

};

leasesPagePrototype.unbind = function() {

  this.getContent().find('#addLease').off('click', this.onAddLease);
  this.getContent().find('#refresh').off('click', this.onRefresh);
  this.getContent().find('#goBack').off('click', this.onGoBack);

  jQuery(this).off('v-hidden', this.onHidden);
  jQuery(this).off('v-shown', this.onShown);

  pagePrototype.unbind.call(this);

};

leasesPagePrototype.onShown = function(event) {
  Log.info('> LeasesPage.onShown(event) { ... } event.isInitial=%s', event.isInitial);
  var self = event.data.this;
  self.refreshElements(LeasesTable, Application.ifNotError());
};

leasesPagePrototype.onHidden = function(event) {
  Log.info('> LeasesPage.onHidden(event) { ... } event.isFinal=%s', event.isFinal);

  var self = event.data.this;

  self.leasesTable.hide();
  self.leasesTable.unbind();

  self.leasesTable.getContent().find('tbody > tr').off('click', self.onSelected);

  self.leasesTable.removeContent();

};

leasesPagePrototype.onGoBack = function(event) {
  Log.info('> LeasesPage.onGoBack(event) { ... }');
  window.application.hidePage();
};

leasesPagePrototype.onRefresh = function(event) {
  Log.info('> LeasesPage.onRefresh(event) { ... }');
  var self = event.data.this;
  self.refreshElements(LeasesTable, Application.ifNotError());
};

leasesPagePrototype.onAddLease = function(event) {
  Log.info('> LeasesPage.onAddLease(event) { ... }');
  window.application.showPage(LeasePage.createElement(LeasePage.Source.createSource({})), Application.ifNotError());
};

leasesPagePrototype.onSelected = function(event) {
  Log.info('> LeasesPage.onSelected(event) { ... }\n\n%s\n\n', Utilities.inspect(JSON.parse(event.currentTarget.dataset.leaseId)));

  var self = event.data.this;
  var leaseId = JSON.parse(event.currentTarget.dataset.leaseId);

  Asynchronous.waterfall([
    function(callback) {
      Application.GET(Utilities.format('/api/leases/%s/%s/%s', leaseId.address, leaseId.fromAsISOString, leaseId.toAsISOString), callback);
    },
    function(lease, callback) {
      Application.GET(Utilities.format('/api/exists/translations/%s', lease.device), function(error, deviceTranslation) {
        callback(error, lease, deviceTranslation);
      });
    },
    function(lease, deviceTranslation, callback) {
      Application.GET(Utilities.format('/api/exists/translations/%s', lease.host), function(error, hostTranslation) {
        callback(error, lease, deviceTranslation, hostTranslation);
      });
    },
    function(lease, deviceTranslation, hostTranslation, callback) {
      if (deviceTranslation.exists)
        Application.GET(Utilities.format('/api/translations/%s', lease.device), function(error, deviceTranslation) {
            callback(error, lease, deviceTranslation);
        });
      else if (hostTranslation.exists)
        Application.GET(Utilities.format('/api/translations/%s', lease.host), function(error, hostTranslation) {
            callback(error, lease, hostTranslation);
        });
      else
        callback(null, lease, null)
    },
    function(lease, translation, callback) {
      window.application.showPage(LeasePage.createElement(LeasePage.Source.createSource(lease, translation)), callback);
    }
  ], Application.ifNotError());

};

leasesPagePrototype.hasElements = function() {
  return true;
};

leasesPagePrototype.getElements = function(Class) {
  return pagePrototype.getElements.call(this, Class).concat(Element.filter([
    this.leasesTable
  ], Class));
};

leasesPagePrototype.refreshElements = function(Class, callback) {

  if (Is.function(Class)) {
    callback = Class;
    Class = null;
  }

  var self = this;

  Asynchronous.each(this.getElements(Class), function(element, callback) {
    switch (element) {
      case self.leasesTable:
        self.refreshLeasesTable(callback);
        break;
    }
  }, function(error) {
    if (error)
      callback(error);
    else
      pagePrototype.refreshElements.call(this, Class, callback);
  });

};

leasesPagePrototype.refreshLeasesTable = function(callback) {
  // Log.info('> LeasesPage.refreshLeasesTable(callback) { ... }');

  var self = this;
  var element = self.leasesTable;

  if (element.existsContent()) {

    element.hide();
    element.unbind();

    element.getContent().find('tbody > tr').off('click', this.onSelected);

    element.removeContent();

  }

  Asynchronous.waterfall([
    function(callback) {
      Application.GET('/api/leases', callback);
    },
    function(leases, callback) {
      callback(null, leases.map(function(lease) {
        return LeasePage.Source.createSource(lease);
      }));
    },
    function(leases, callback) {
      element.render({
        'leases': leases
      }, callback);
    }
  ], function(error, content) {

    if (error)
      callback(error)
    else {

      self.getContent().find('> div').append(content);

      element.getContent().find('tbody > tr').on('click', {
        'this': self
      }, self.onSelected);

      element.bind();
      element.show();

    }

  });

};

var LeasesPage = Object.create(Page);

LeasesPage.createElement = function(templateURL, prototype) {

  var leasesPage = Page.createElement.call(this, templateURL || '/www/views/elements/pages/leases-page.jade', prototype || leasesPagePrototype);

  Object.defineProperty(leasesPage, 'leasesTable', {
    'enumerable': false,
    'wrileasesTable': false,
    'value': LeasesTable.createElement()
  });

  return leasesPage;

};

LeasesPage.isElement = function(leasesPage) {
  return leasesPagePrototype.isPrototypeOf(leasesPage);
};

LeasesPage.getElementPrototype = function() {
  return leasesPagePrototype;
};

module.exports = LeasesPage;

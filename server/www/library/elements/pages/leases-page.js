var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../../application');
var Log = require('../../log');
var Page = require('../page');

// var LeasePage = require('./lease-page');
// var LeasesTable = require('../tables/leases-table');

var pagePrototype = Page.getElementPrototype();
var leasesPagePrototype = Object.create(pagePrototype);

// leasesPagePrototype.hasElements = function() {
//   return true;
// };
//
// leasesPagePrototype.getElements = function() {
//   return pagePrototype.getElements.call(this).concat([
//     this.leasesTable
//   ]);
// };

leasesPagePrototype.bind = function() {

  pagePrototype.bind.call(this);

  // jQuery(this).on('shown', {
  //   'this': this
  // }, this.onShown);
  //
  // jQuery(this).on('hidden', {
  //   'this': this
  // }, this.onHidden);

  this.getElement().find('#goBack').on('click', {
    'this': this
  }, this.onGoBack);
  this.getElement().find('#addLease').on('click', {
    'this': this
  }, this.onAddLease);

};

leasesPagePrototype.unbind = function() {

  this.getElement().find('#addLease').off('click', this.onAddLease);
  this.getElement().find('#goBack').off('click', this.onGoBack);

  // jQuery(this).off('hidden', this.onHidden);
  // jQuery(this).off('shown', this.onShown);

  pagePrototype.unbind.call(this);

};

// leasesPagePrototype.onShown = function(event) {
//   Log.info('> LeasesPage.onShown(event) { ... } event.isInitial=%s', event.isInitial);
//
//   var self = event.data.this;
//
//   Asynchronous.waterfall([
//     function(callback) {
//       Application.GET('/api/leases', callback);
//     },
//     function(leases, callback) {
//       self.leasesTable.render({
//         'leases': leases
//       }, callback);
//     }
//   ], Application.ifNotError(function(content) {
//
//     self.getElement().find('> div').append(content);
//
//     self.leasesTable.getElement().find('tbody > tr').on('click', {
//       'this': self
//     }, self.onSelected);
//
//     self.leasesTable.bind();
//     self.leasesTable.show();
//
//   }));
//
// };
//
// leasesPagePrototype.onHidden = function(event) {
//   Log.info('> LeasesPage.onHidden(event) { ... } event.isFinal=%s', event.isFinal);
//
//   var self = event.data.this;
//
//   self.leasesTable.hide();
//   self.leasesTable.unbind();
//
//   self.leasesTable.getElement().find('tbody > tr').off('click', self.onSelected);
//
//   self.leasesTable.removeContent();
//
// };

leasesPagePrototype.onGoBack = function(event) {
  Log.info('> LeasesPage.onGoBack(event) { ... }');
  window.application.hidePage();
};

// leasesPagePrototype.onAddLease = function(event) {
//   Log.info('> LeasesPage.onAddLease(event) { ... }');
//   window.application.showPage(LeasePage.createElement({}), Application.ifNotError());
// };

// leasesPagePrototype.onSelected = function(event) {
//   Log.info('> LeasesPage.onSelected(event) { ... } event.currentTarget.dataset.leaseFrom=%j', event.currentTarget.dataset.leaseFrom);
//
//   var self = event.data.this;
//
//   Asynchronous.waterfall([
//     function(callback) {
//       Application.GET(Utilities.format('/api/leases/%s', event.currentTarget.dataset.leaseFrom), callback);
//     },
//     function(lease, callback) {
//       window.application.showPage(LeasePage.createElement(lease), Application.ifNotError());
//     }
//   ], Application.ifNotError());
//
// };

var LeasesPage = Object.create(Page);

LeasesPage.createElement = function(templateURL, prototype) {

  var leasesPage = Page.createElement.call(this, templateURL || '/www/views/elements/pages/leases-page.jade', prototype || leasesPagePrototype);

  // Object.defineProperty(leasesPage, 'leasesTable', {
  //   'enumerable': false,
  //   'wrileasesTable': false,
  //   'value': LeasesTable.createElement()
  // });

  return leasesPage;

};

LeasesPage.isElement = function(leasesPage) {
  return leasesPagePrototype.isPrototypeOf(leasesPage);
};

LeasesPage.getElementPrototype = function() {
  return leasesPagePrototype;
};

module.exports = LeasesPage;

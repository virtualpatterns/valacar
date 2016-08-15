require('datejs');

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

// leasesPagePrototype.render = function(data, callback) {
//
//   if (Is.function(data)) {
//     callback = data;
//     data = {};
//   }
//
//   var self = this;
//
//   // Log.info('> LeasesPage.render(data, callback) { ... }');
//
//   Application.GET('/api/range/leases', function(error, range) {
//     if (error)
//       callback(error);
//     else {
//
//       data.range = range;
//
//       var now = new Date();
//       var minimumValue = Date.parse(data.range.minimumFrom);
//       var maximumValue = Date.parse(data.range.maximumTo);
//       var defaultValue = Date.compare(now, maximumValue) <= 0 ? now : maximumValue;
//
//       data.range.defaultDateAsString = defaultValue.toString('yyyy-MM-dd');
//       data.range.defaultTimeAsString = defaultValue.toString('hh:00 tt');
//       data.range.minimumValueAsISOString = minimumValue.toISOString();
//       data.range.maximumValueAsISOString = maximumValue.toISOString();
//
//       pagePrototype.render.call(self, data, callback);
//
//     }
//   });
//
// };

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
  // this.getContent().find('#filterLink').on('click', {
  //   'this': this
  // }, this.onFilterLink);
  this.getContent().find('#refresh').on('click', {
    'this': this
  }, this.onRefresh);
  this.getContent().find('#addLease').on('click', {
    'this': this
  }, this.onAddLease);
  // this.getContent().find('#filterDate').on('change', {
  //   'this': this
  // }, this.onFilterDateChange);
  // this.getContent().find('#filterForm').on('submit', {
  //   'this': this
  // }, this.onFilterSubmit);

};

leasesPagePrototype.unbind = function() {

  // this.getContent().find('#filterForm').off('submit', this.onFilterSubmit);
  // this.getContent().find('#filterDate').off('change', this.onFilterDateChange);
  this.getContent().find('#addLease').off('click', this.onAddLease);
  this.getContent().find('#refresh').off('click', this.onRefresh);
  // this.getContent().find('#filterLink').off('click', this.onFilterLink);
  this.getContent().find('#goBack').off('click', this.onGoBack);

  jQuery(this).off('v-hidden', this.onHidden);
  jQuery(this).off('v-shown', this.onShown);

  pagePrototype.unbind.call(this);

};

leasesPagePrototype.onShown = function(event) {
  Log.info('> LeasesPage.onShown(event) { ... } event.isInitial=%s', event.isInitial);

  var self = event.data.this;

  // if (event.isInitial) {
  //
  //   var now = new Date();
  //   var minimumValue = Date.parse(self.getContent().find('#filterDate').data('minimumValue'));
  //   var maximumValue = Date.parse(self.getContent().find('#filterDate').data('maximumValue'));
  //   var defaultValue = Date.compare(now, maximumValue) <= 0 ? now : maximumValue;
  //
  //   var minDate = minimumValue.toString('yyyy-MM-dd');
  //   var maxDate = new Date(maximumValue).add(1).days().toString('yyyy-MM-dd');
  //
  //   Log.info('    minimumValue=%j', minimumValue);
  //   Log.info('    maximumValue=%j', maximumValue);
  //   Log.info('    defaultValue=%j', defaultValue);
  //   Log.info('    minDate=%j', minDate);
  //   Log.info('    maxDate=%j', maxDate);
  //
  //   self.DatePicker = UIkit.datepicker(Utilities.format('#%s #filterDate', self.id), {
  //     'format': 'YYYY-MM-DD',
  //     'minDate': minDate,
  //     'maxDate': maxDate
  //   });
  //
  //   // var minimumDateValue = new Date(minimumValue).clearTime();
  //   // var maximumDateValue = new Date(maximumValue).clearTime();
  //   // var defaultDateValue = new Date(defaultValue).clearTime();
  //   //
  //   // var start = 0;
  //   // var end = 24;
  //   //
  //   // if (Date.equals(defaultDateValue, minimumDateValue))
  //   //   start = minimumValue.getHours();
  //   // else if (Date.equals(defaultDateValue, maximumDateValue))
  //   //   end = new Date(maximumValue).add(1).hours().getHours();
  //   //
  //   // Log.info('    minimumDateValue=%j', minimumDateValue);
  //   // Log.info('    maximumDateValue=%j', maximumDateValue);
  //   // Log.info('    defaultDateValue=%j', defaultDateValue);
  //   // Log.info('    start=%j', start);
  //   // Log.info('    end=%j', end);
  //   //
  //   // self.TimePicker = UIkit.timepicker(Utilities.format('#%s #filterTime', self.id), {
  //   //   'format': '12h',
  //   //   'start': start,
  //   //   'end': end
  //   // });
  //
  // }

  self.refreshElements(LeasesTable, Application.ifNotError());

};

leasesPagePrototype.onHidden = function(event) {
  Log.info('> LeasesPage.onHidden(event) { ... } event.isFinal=%s', event.isFinal);

  var self = event.data.this;

  if (self.leasesTable.existsContent()) {

    self.leasesTable.hide();
    self.leasesTable.unbind();

    self.leasesTable.getContent().find('tbody > tr').off('click', self.onSelected);

    self.leasesTable.removeContent();

  }

  // if (event.isFinal) {
  //   // self.TimePicker = null;
  //   self.DatePicker = null;
  // }

};

leasesPagePrototype.onGoBack = function(event) {
  Log.info('> LeasesPage.onGoBack(event) { ... }');
  window.application.hidePage();
};

// leasesPagePrototype.onFilterLink = function(event) {
//   Log.info('> LeasesPage.onFilterLink(event) { ... }');
//   var self = event.data.this;
//   self.getContent().find('li:has(#filterLink)').toggleClass('uk-active');
//   self.getContent().find('#filterPanel').toggleClass('uk-hidden');
// };

leasesPagePrototype.onRefresh = function(event) {
  Log.info('> LeasesPage.onRefresh(event) { ... }');
  var self = event.data.this;
  self.refreshElements(LeasesTable, Application.ifNotError());
};

leasesPagePrototype.onAddLease = function(event) {
  Log.info('> LeasesPage.onAddLease(event) { ... }');
  window.application.showPage(LeasePage.createElement(LeasePage.Source.createSource({})), Application.ifNotError());
};

// leasesPagePrototype.onFilterDateChange = function(event) {
//   Log.info('> LeasesPage.onFilterDateChange(event) { ... }');
//
//   var self = event.data.this;
//
//   self.getContent().find('#filterForm').submit();
//
//   // var minimumValue = Date.parse(self.getContent().find('#filterDate').data('minimumValue'));
//   // var maximumValue = Date.parse(self.getContent().find('#filterDate').data('maximumValue'));
//   //
//   // var minimumDateValue = new Date(minimumValue).clearTime();
//   // var maximumDateValue = new Date(maximumValue).clearTime();
//   // var currentDateValue = Date.parse(self.getContent().find('#filterDate').val());
//   //
//   // var start = 0;
//   // var end = 24;
//   //
//   // if (Date.equals(currentDateValue, minimumDateValue))
//   //   start = minimumValue.getHours();
//   // else if (Date.equals(currentDateValue, maximumDateValue))
//   //   end = new Date(maximumValue).add(1).hours().getHours();
//   //
//   // Log.info('    minimumValue=%j', minimumValue);
//   // Log.info('    maximumValue=%j', maximumValue);
//   // Log.info('    minimumDateValue=%j', minimumDateValue);
//   // Log.info('    maximumDateValue=%j', maximumDateValue);
//   // Log.info('    start=%j', start);
//   // Log.info('    end=%j', end);
//
//   // self.TimePicker = UIkit.timepicker(Utilities.format('#%s #filterTime', self.id), {
//   //   'format': '12h',
//   //   'start': start,
//   //   'end': end
//   // });
//
//   // self.TimePicker.options.start = start;
//   // self.TimePicker.options.end = end;
//   //
//   // self.TimePicker.init();
//
// };

// leasesPagePrototype.onFilterSubmit = function(event) {
//   Log.info('> LeasesPage.onFilterSubmit(event) { ... }');
//
//   event.preventDefault();
//
//   var self = event.data.this;
//   self.refreshElements(LeasesTable, Application.ifNotError());
//
// };

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

      // var filter = self.getContent().find('li:has(#filterLink)').hasClass('uk-active') ? Date.parse(self.getContent().find('#filterDate').val()) : null;
      //
      // if (filter)
      //   Application.GET(Utilities.format('/api/leases?filter=%s', filter.toISOString()), callback);
      // else
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
    'writable': false,
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

require('datejs');

var Asynchronous = require('async');
var Is = require('@pwn/is');
var Utilities = require('util');

var Application = require('../../application');
var Element = require('../../element');
var HistoryTable = require('../tables/history-table');
var Log = require('../../log');
var Page = require('../page');

var pagePrototype = Page.getElementPrototype();
var historyPagePrototype = Object.create(pagePrototype);

historyPagePrototype.render = function(data, callback) {

  if (Is.function(data)) {
    callback = data;
    data = {};
  }

  var self = this;

  Application.GET('/api/range/history', function(error, range) {
    if (error)
      callback(error);
    else {

      data.range = range;

      var now = new Date();
      var minimumValue = data.range.numberOfSystemLeases > 0 ? Date.parse(data.range.minimumFrom) : now;
      var maximumValue = data.range.numberOfSystemLeases > 0 ? Date.parse(data.range.maximumTo) : now;
      var defaultValue = Date.compare(now, maximumValue) <= 0 ? now : maximumValue;

      data.range.defaultDateAsString = defaultValue.toString('yyyy-MM-dd');
      // data.range.defaultTimeAsString = defaultValue.toString('hh:00 tt');
      data.range.minimumValueAsISOString = minimumValue.toISOString();
      data.range.maximumValueAsISOString = maximumValue.toISOString();

      pagePrototype.render.call(self, data, callback);

    }
  });

};

historyPagePrototype.bind = function() {

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
  this.getContent().find('#filterLink').on('click', {
    'this': this
  }, this.onFilterLink);
  this.getContent().find('#refresh').on('click', {
    'this': this
  }, this.onRefresh);
  this.getContent().find('#filterForm').on('submit', {
    'this': this
  }, this.onFilterFormSubmit);
  this.getContent().find('#filterDate').on('change', {
    'this': this
  }, this.onFilterDateChange);
  this.getContent().find('#filterString').on('change', {
    'this': this
  }, this.onFilterStringChange);
  this.getContent().find('#filterNull').on('change', {
    'this': this
  }, this.onFilterNullChange);

};

historyPagePrototype.unbind = function() {

  this.getContent().find('#filterNull').off('change', this.onFilterNullChange);
  this.getContent().find('#filterString').off('change', this.onFilterStringChange);
  this.getContent().find('#filterDate').off('change', this.onFilterDateChange);
  this.getContent().find('#filterForm').off('submit', this.onFilterFormSubmit);
  this.getContent().find('#addLease').off('click', this.onAddLease);
  this.getContent().find('#refresh').off('click', this.onRefresh);
  this.getContent().find('#goBack').off('click', this.onGoBack);

  jQuery(this).off('v-hidden', this.onHidden);
  jQuery(this).off('v-shown', this.onShown);

  pagePrototype.unbind.call(this);

};

historyPagePrototype.onShown = function(event) {
  Log.info('> HistoryPage.onShown(event) { ... } event.isInitial=%s', event.isInitial);

  var self = event.data.this;

  if (event.isInitial) {

    var now = new Date();
    var minimumValue = Date.parse(self.getContent().find('#filterDate').data('minimumValue'));
    var maximumValue = Date.parse(self.getContent().find('#filterDate').data('maximumValue'));
    var defaultValue = Date.compare(now, maximumValue) <= 0 ? now : maximumValue;

    var minDate = minimumValue.toString('yyyy-MM-dd');
    var maxDate = new Date(maximumValue).add(1).days().toString('yyyy-MM-dd');

    Log.info('    minimumValue=%j', minimumValue);
    Log.info('    maximumValue=%j', maximumValue);
    Log.info('    defaultValue=%j', defaultValue);
    Log.info('    minDate=%j', minDate);
    Log.info('    maxDate=%j', maxDate);

    self.DatePicker = UIkit.datepicker(Utilities.format('#%s #filterDate', self.id), {
      'format': 'YYYY-MM-DD',
      'minDate': minDate,
      'maxDate': maxDate
    });

  }

  self.refreshElements(HistoryTable, Application.ifNotError());

};

historyPagePrototype.onHidden = function(event) {
  Log.info('> HistoryPage.onHidden(event) { ... } event.isFinal=%s', event.isFinal);

  var self = event.data.this;

  if (self.historyTable.existsContent()) {

    self.historyTable.hide();
    self.historyTable.unbind();

    self.historyTable.getContent().find('a[data-filter-string]').off('click', self.onFilterString);
    self.historyTable.getContent().find('a[data-filter-string]').off('click', self.onFilterDate);

    self.historyTable.removeContent();

  }

  if (event.isFinal)
    self.DatePicker = null;

};

historyPagePrototype.onGoBack = function(event) {
  Log.info('> HistoryPage.onGoBack(event) { ... }');
  window.application.hidePage();
};

historyPagePrototype.onFilterLink = function(event) {
  Log.info('> HistoryPage.onFilterLink(event) { ... }');
  var self = event.data.this;
  self.getContent().find('li:has(#filterLink)').toggleClass('uk-active');
  self.getContent().find('#filterPanel').toggleClass('uk-hidden');
  self.getContent().find('#filterForm').submit();
};

historyPagePrototype.onRefresh = function(event) {
  Log.info('> HistoryPage.onRefresh(event) { ... }');
  var self = event.data.this;
  self.refreshElements(HistoryTable, Application.ifNotError());
};

historyPagePrototype.onFilterFormSubmit = function(event) {
  Log.info('> HistoryPage.onFilterFormSubmit(event) { ... }');

  event.preventDefault();

  var self = event.data.this;
  self.refreshElements(HistoryTable, Application.ifNotError());

};

historyPagePrototype.onFilterDateChange = function(event) {
  Log.info('> HistoryPage.onFilterDateChange(event) { ... }');
  var self = event.data.this;
  self.getContent().find('#filterForm').submit();
};

historyPagePrototype.onFilterStringChange = function(event) {
  Log.info('> HistoryPage.onFilterStringChange(event) { ... }');
  var self = event.data.this;
  self.getContent().find('#filterForm').submit();
};

historyPagePrototype.onFilterNullChange = function(event) {
  Log.info('> HistoryPage.onFilterNullChange(event) { ... }');
  var self = event.data.this;

  Log.info('= HistoryPage.onFilterNullChange(event) { ... } #filterNull=%s', self.getContent().find('#filterNull').prop('checked'));

  self.getContent().find('#filterString').prop('disabled', self.getContent().find('#filterNull').prop('checked'));
  self.getContent().find('#filterForm').submit();

};

historyPagePrototype.onFilterDate = function(event) {
  Log.info('> HistoryPage.onFilterDate(event) { ... }');

  var self = event.data.this;

  self.getContent().find('li:has(#filterLink)').toggleClass('uk-active', true);
  self.getContent().find('#filterPanel').toggleClass('uk-hidden', false);

  var filterDate = Date.parse(jQuery(event.target).data('filterDate'));

  Log.info('= HistoryPage.onFilterDate(event) { ... } #filterDate=%j', filterDate);

  self.getContent().find('#filterDate').val(filterDate.toString('yyyy-MM-dd'));
  self.getContent().find('#filterString').val('');
  self.getContent().find('#filterString').prop('disabled', false);
  self.getContent().find('#filterNull').prop('checked', false);

  self.getContent().find('#filterForm').submit();

};

historyPagePrototype.onFilterString = function(event) {
  Log.info('> HistoryPage.onFilterString(event) { ... }');

  var self = event.data.this;

  self.getContent().find('li:has(#filterLink)').toggleClass('uk-active', true);
  self.getContent().find('#filterPanel').toggleClass('uk-hidden', false);

  var filterString = jQuery(event.target).data('filterString');

  Log.info('= HistoryPage.onFilterString(event) { ... } #filterString=%j', filterString);

  self.getContent().find('#filterDate').val('');
  self.getContent().find('#filterString').val(filterString);
  self.getContent().find('#filterString').prop('disabled', false);
  self.getContent().find('#filterNull').prop('checked', false);

  self.getContent().find('#filterForm').submit();

};

historyPagePrototype.hasElements = function() {
  return true;
};

historyPagePrototype.getElements = function(Class) {
  return pagePrototype.getElements.call(this, Class).concat(Element.filter([
    this.historyTable
  ], Class));
};

historyPagePrototype.refreshElements = function(Class, callback) {

  if (Is.function(Class)) {
    callback = Class;
    Class = null;
  }

  var self = this;

  Asynchronous.each(this.getElements(Class), function(element, callback) {
    switch (element) {
      case self.historyTable:
        self.refreshHistoryTable(callback);
        break;
    }
  }, function(error) {
    if (error)
      callback(error);
    else
      pagePrototype.refreshElements.call(this, Class, callback);
  });

};

historyPagePrototype.refreshHistoryTable = function(callback) {
  Log.info('> HistoryPage.refreshHistoryTable(callback) { ... }');

  var self = this;
  var element = self.historyTable;

  if (element.existsContent()) {

    element.hide();
    element.unbind();

    element.getContent().find('a[data-filter-string]').off('click', self.onFilterString);
    element.getContent().find('a[data-filter-date]').off('click', self.onFilterDate);

    element.removeContent();

  }

  Asynchronous.waterfall([
    function(callback) {

      var filterDate = self.getContent().find('li:has(#filterLink)').hasClass('uk-active') ? Date.parse(self.getContent().find('#filterDate').val()) : null;
      var filterString = self.getContent().find('li:has(#filterLink)').hasClass('uk-active') && !self.getContent().find('#filterString').prop('disabled') ? self.getContent().find('#filterString').val() : null;
      var filterNull = self.getContent().find('#filterNull').prop('checked');

      var url = '/api/history?null';

      if (filterDate)
        url = Utilities.format('%s&filterDate=%s', url, filterDate.toISOString());

      if (filterString)
        url = Utilities.format('%s&filterString=%s', url, filterString);

      if (filterNull)
        url = Utilities.format('%s&filterNull=%s', url, filterNull);

      Log.info('=   filterDate=%j', filterDate);
      Log.info('=   filterString=%j', filterString);
      Log.info('=   filterNull=%j', filterNull);

      Application.GET(url, callback);

    },
    function(history, callback) {
      callback(null, history.map(function(item) {
        return HistoryTable.Source.createSource(item);
      }));
    },
    function(history, callback) {
      element.render({
        'history': history
      }, callback);
    }
  ], function(error, content) {

    if (error)
      callback(error)
    else {

      self.getContent().find('> div').append(content);

      element.getContent().find('a[data-filter-date]').on('click', {
        'this': self
      }, self.onFilterDate);
      element.getContent().find('a[data-filter-string]').on('click', {
        'this': self
      }, self.onFilterString);

      element.bind();
      element.show();

    }

  });

};

var HistoryPage = Object.create(Page);

HistoryPage.createElement = function(templateURL, prototype) {

  var historyPage = Page.createElement.call(this, templateURL || '/www/views/elements/pages/history-page.jade', prototype || historyPagePrototype);

  Object.defineProperty(historyPage, 'historyTable', {
    'enumerable': false,
    'writable': false,
    'value': HistoryTable.createElement()
  });

  return historyPage;

};

HistoryPage.isElement = function(historyPage) {
  return historyPagePrototype.isPrototypeOf(historyPage);
};

HistoryPage.getElementPrototype = function() {
  return historyPagePrototype;
};

module.exports = HistoryPage;

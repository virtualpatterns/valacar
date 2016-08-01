var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../../library/application');
var Assert = require('../library/assert');
var Log = require('../../library/log');

var HistoryPage = require('../../library/elements/pages/history-page');
var HistoryTable = require('../../library/elements/tables/history-table');

describe('HistoryPage', function() {

  before(function(callback) {
    Assert.showPage(HistoryPage.createElement(), callback);
  });

  it('should be on the History page', function() {
    Assert.onPage('History');
  });

  it('should contain a link labelled Back', function() {
    Assert.existsLink('Back');
  });

  it('should contain a Refresh link', function() {
    Assert.existsLinkId('refresh');
  });

  it('should contain a hidden input for Filter by date', function() {
    Assert.existsHiddenInputId('filterDate');
  });

  it('should contain a hidden input for Filter by IP address, ...', function() {
    Assert.existsHiddenInputId('filterString');
  });

  it('should contain a hidden input for Filter by (unknown) host name', function() {
    Assert.existsHiddenInputId('filterNull');
  });

  describe('HistoryPage POST/Refresh', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'from': Date.parse('yesterday').toISOString(),
            'to': Date.parse('today').toISOString(),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(data, callback) {
          Application.POST('/api/leases', {
            'address': '2.3.4.5',
            'from': Date.parse('today').toISOString(),
            'to': Date.parse('tomorrow').toISOString(),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host02'
          }, callback);
        },
        function(data, callback) {
          Application.GET('/api/exists/translations/aa:11:bb:22:cc:33', callback);
        },
        function(data, callback) {
          if (data.exists)
            Application.DELETE('/api/translations/aa:11:bb:22:cc:33', callback);
          else
            callback(null);
        },
        function(callback) {
          Application.GET('/api/exists/translations/host01', callback);
        },
        function(data, callback) {
          if (data.exists)
            Application.DELETE('/api/translations/host01', callback);
          else
            callback(null);
        },
        function(callback) {
          Application.GET('/api/exists/translations/host02', callback);
        },
        function(data, callback) {
          if (data.exists)
            Application.DELETE('/api/translations/host02', callback);
          else
            callback(null);
        },
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        }
      ], callback);
    });

    it('should show the first IP address', function() {
      Assert.existsRow('1.2.3.4');
    });

    it('should show the second IP address', function() {
      Assert.existsRow('2.3.4.5');
    });

    it('should show the MAC address a first time', function() {
      Assert.existsRowIndex('aa:11:bb:22:cc:33', 0);
    });

    it('should show the MAC address a second time', function() {
      Assert.existsRowIndex('aa:11:bb:22:cc:33', 1);
    });

    it('should not show the MAC address a third time', function() {
      Assert.notExistsRowIndex('aa:11:bb:22:cc:33', 2);
    });

    it('should not show the first host name', function() {
      Assert.notExistsRow('host01');
    });

    it('should show the second host name a first time', function() {
      Assert.existsRowIndex('host02', 0);
    });

    it('should show the second host name a second time', function() {
      Assert.existsRowIndex('host02', 1);
    });

    it('should not show the second host name a third time', function() {
      Assert.notExistsRowIndex('host02', 2);
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '2.3.4.5',
              Date.parse('today').toISOString(),
              Date.parse('tomorrow').toISOString()
            ), callback
          );
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '1.2.3.4',
              Date.parse('yesterday').toISOString(),
              Date.parse('today').toISOString()
            ), callback
          );
        }
      ], callback);
    });

  });

  describe('HistoryPage POST/Refresh (w/ device translation)', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'from': Date.parse('yesterday').toISOString(),
            'to': Date.parse('today').toISOString(),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(data, callback) {
          Application.POST('/api/leases', {
            'address': '2.3.4.5',
            'from': Date.parse('today').toISOString(),
            'to': Date.parse('tomorrow').toISOString(),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host02'
          }, callback);
        },
        function(data, callback) {
          Application.POST('/api/translations', {
            'from': 'aa:11:bb:22:cc:33',
            'to': 'host001'
          }, callback);
        },
        function(data, callback) {
          Application.GET('/api/exists/translations/host01', callback);
        },
        function(data, callback) {
          if (data.exists)
            Application.DELETE('/api/translations/host01', callback);
          else
            callback(null);
        },
        function(callback) {
          Application.GET('/api/exists/translations/host02', callback);
        },
        function(data, callback) {
          if (data.exists)
            Application.DELETE('/api/translations/host02', callback);
          else
            callback(null);
        },
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        }
      ], callback);
    });

    it('should not show the first host name', function() {
      Assert.notExistsRow('host01');
    });

    it('should not show the second host name', function() {
      Assert.notExistsRow('host02');
    });

    it('should show the translated host name a first time', function() {
      Assert.existsRowIndex('host001', 0);
    });

    it('should show the translated host name a second time', function() {
      Assert.existsRowIndex('host001', 1);
    });

    it('should not show the translated host name a third time', function() {
      Assert.notExistsRowIndex('host001', 2);
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.DELETE('/api/translations/aa:11:bb:22:cc:33', callback);
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '2.3.4.5',
              Date.parse('today').toISOString(),
              Date.parse('tomorrow').toISOString()
            ), callback
          );
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '1.2.3.4',
              Date.parse('yesterday').toISOString(),
              Date.parse('today').toISOString()
            ), callback
          );
        }
      ], callback);
    });

  });

  describe('HistoryPage POST/Refresh (w/ host translation)', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'from': Date.parse('yesterday').toISOString(),
            'to': Date.parse('today').toISOString(),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(data, callback) {
          Application.POST('/api/leases', {
            'address': '2.3.4.5',
            'from': Date.parse('today').toISOString(),
            'to': Date.parse('tomorrow').toISOString(),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host02'
          }, callback);
        },
        function(data, callback) {
          Application.POST('/api/translations', {
            'from': 'host01',
            'to': 'host001'
          }, callback);
        },
        function(data, callback) {
          Application.POST('/api/translations', {
            'from': 'host02',
            'to': 'host002'
          }, callback);
        },
        function(data, callback) {
          Application.GET('/api/exists/translations/aa:11:bb:22:cc:33', callback);
        },
        function(data, callback) {
          if (data.exists)
            Application.DELETE('/api/translations/aa:11:bb:22:cc:33', callback);
          else
            callback(null);
        },
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        }
      ], callback);
    });

    it('should not show the first host name', function() {
      Assert.notExistsRow('host01');
    });

    it('should not show the second host name', function() {
      Assert.notExistsRow('host02');
    });

    it('should not show the first translated host name', function() {
      Assert.notExistsRow('host001');
    });

    it('should show the second translated host name a first time', function() {
      Assert.existsRowIndex('host002', 0);
    });

    it('should show the second translated host name a second time', function() {
      Assert.existsRowIndex('host002', 1);
    });

    it('should not show the second translated host name a third time', function() {
      Assert.notExistsRowIndex('host002', 2);
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.DELETE('/api/translations/host02', callback);
        },
        function(callback) {
          Application.DELETE('/api/translations/host01', callback);
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '2.3.4.5',
              Date.parse('today').toISOString(),
              Date.parse('tomorrow').toISOString()
            ), callback
          );
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '1.2.3.4',
              Date.parse('yesterday').toISOString(),
              Date.parse('today').toISOString()
            ), callback
          );
        }
      ], callback);
    });

  });

  after(function(callback) {
    Assert.hidePage(callback);
  });

});

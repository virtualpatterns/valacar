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
          Application.POST('/api/leases', {
            'address': '3.4.5.6',
            'from': Date.parse('today').toISOString(),
            'to': Date.parse('tomorrow').toISOString(),
            'device': 'cc:33:dd:44:ee:55',
            'host': 'host03'
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
          Application.GET('/api/exists/translations/cc:33:dd:44:ee:55', callback);
        },
        function(data, callback) {
          if (data.exists)
            Application.DELETE('/api/translations/cc:33:dd:44:ee:55', callback);
          else
            callback(null);
        },
        function(callback) {
          Application.GET('/api/exists/translations/host03', callback);
        },
        function(data, callback) {
          if (data.exists)
            Application.DELETE('/api/translations/host03', callback);
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

    it('should contain the first IP address', function() {
      Assert.existsRow('1.2.3.4');
    });

    it('should contain the second IP address', function() {
      Assert.existsRow('2.3.4.5');
    });

    it('should contain the third IP address', function() {
      Assert.existsRow('3.4.5.6');
    });

    it('should contain the first MAC address a first time', function() {
      Assert.existsRowIndex('aa:11:bb:22:cc:33', 0);
    });

    it('should contain the first MAC address a second time', function() {
      Assert.existsRowIndex('aa:11:bb:22:cc:33', 1);
    });

    it('should not contain the first MAC address a third time', function() {
      Assert.notExistsRowIndex('aa:11:bb:22:cc:33', 2);
    });

    it('should contain a link labelled cc:33:dd:44:ee:55', function() {
      Assert.existsLink('cc:33:dd:44:ee:55');
    });

    it('should not contain the first host name', function() {
      Assert.notExistsRow('host01');
    });

    it('should contain the second host name a first time', function() {
      Assert.existsRowIndex('host02', 0);
    });

    it('should contain the second host name a second time', function() {
      Assert.existsRowIndex('host02', 1);
    });

    it('should not contain the second host name a third time', function() {
      Assert.notExistsRowIndex('host02', 2);
    });

    it('should contain a link labelled host03', function() {
      Assert.existsLink('host03');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '3.4.5.6',
              Date.parse('today').toISOString(),
              Date.parse('tomorrow').toISOString()
            ), callback
          );
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

    it('should not contain the first host name', function() {
      Assert.notExistsRow('host01');
    });

    it('should not contain the second host name', function() {
      Assert.notExistsRow('host02');
    });

    it('should contain the translated host name a first time', function() {
      Assert.existsRowIndex('host001', 0);
    });

    it('should contain the translated host name a second time', function() {
      Assert.existsRowIndex('host001', 1);
    });

    it('should not contain the translated host name a third time', function() {
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

    it('should not contain the first host name', function() {
      Assert.notExistsRow('host01');
    });

    it('should not contain the second host name', function() {
      Assert.notExistsRow('host02');
    });

    it('should not contain the first translated host name', function() {
      Assert.notExistsRow('host001');
    });

    it('should contain the second translated host name a first time', function() {
      Assert.existsRowIndex('host002', 0);
    });

    it('should contain the second translated host name a second time', function() {
      Assert.existsRowIndex('host002', 1);
    });

    it('should not contain the second translated host name a third time', function() {
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

  describe('HistoryPage on Filter', function() {

    before(function(callback) {
      Assert.waitForElementsShown(HistoryTable, function() {
        Assert.clickLinkId('filterLink');
      }, callback);
    });

    it('should contain a visible input for Filter by date', function() {
      Assert.existsVisibleInputId('filterDate');
    });

    it('should contain a visible input for Filter by IP address, ...', function() {
      Assert.existsVisibleInputId('filterString');
    });

    it('should contain a visible input for Filter by (unknown) host name', function() {
      Assert.existsVisibleInputId('filterNull');
    });

    after(function(callback) {
      Assert.waitForElementsShown(HistoryTable, function() {
        Assert.clickLinkId('filterLink');
      }, callback);
    });

  });

  describe('HistoryPage on Filter on Filter by date', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'from': Date.parse('yesterday').toISOString(),
            'to': Date.parse('today').add(-1).minutes().toISOString(),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(callback) {
          Application.POST('/api/leases', {
            'address': '2.3.4.5',
            'from': Date.parse('today').toISOString(),
            'to': Date.parse('tomorrow').add(-1).minutes().toISOString(),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host02'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLinkId('filterLink');
          }, callback);
        },
        function(callback) {
          Assert.inputValue('filterDate', Date.parse('yesterday').toString('yyyy-MM-dd'), callback);
        },
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.submitForm('filterForm');
          }, callback);
        }
      ], callback);
    });

    it('should contain the first IP address', function() {
      Assert.existsRow('1.2.3.4');
    });

    it('should not contain the second IP address', function() {
      Assert.notExistsRow('2.3.4.5');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLinkId('filterLink');
          }, callback);
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '2.3.4.5',
              Date.parse('today').toISOString(),
              Date.parse('tomorrow').add(-1).minutes().toISOString()
            ), callback
          );
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '1.2.3.4',
              Date.parse('yesterday').toISOString(),
              Date.parse('today').add(-1).minutes().toISOString()
            ), callback
          );
        }
      ], callback);
    });

  });

  describe('HistoryPage on Filter on Filter by IP address, ...', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'from': Date.parse('yesterday').toISOString(),
            'to': Date.parse('today'),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(callback) {
          Application.POST('/api/leases', {
            'address': '2.3.4.5',
            'from': Date.parse('today').toISOString(),
            'to': Date.parse('tomorrow'),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host02'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLinkId('filterLink');
          }, callback);
        },
        function(callback) {
          Assert.inputValue('filterDate', '', callback);
        },
        function(callback) {
          Assert.inputValue('filterString', '2.3.4.5', callback);
        },
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.submitForm('filterForm');
          }, callback);
        }
      ], callback);
    });

    it('should not contain the first IP address', function() {
      Assert.notExistsRow('1.2.3.4');
    });

    it('should contain the second IP address', function() {
      Assert.existsRow('2.3.4.5');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLinkId('filterLink');
          }, callback);
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '2.3.4.5',
              Date.parse('today').toISOString(),
              Date.parse('tomorrow')
            ), callback
          );
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '1.2.3.4',
              Date.parse('yesterday').toISOString(),
              Date.parse('today')
            ), callback
          );
        }
      ], callback);
    });

  });

  describe('HistoryPage on Filter on Filter by (unknown) host name', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'from': Date.parse('yesterday').toISOString(),
            'to': Date.parse('today'),
            'device': 'aa:11:bb:22:cc:33',
            'host': null
          }, callback);
        },
        function(callback) {
          Application.POST('/api/leases', {
            'address': '2.3.4.5',
            'from': Date.parse('today').toISOString(),
            'to': Date.parse('tomorrow'),
            'device': 'bb:22:cc:33:dd:44',
            'host': 'host02'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLinkId('filterLink');
          }, callback);
        },
        function(callback) {
          Assert.inputValue('filterDate', '', callback);
        },
        function(callback) {
          Assert.inputValue('filterNull', true, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.submitForm('filterForm');
          }, callback);
        }
      ], callback);
    });

    it('should contain the first IP address', function() {
      Assert.existsRow('1.2.3.4');
    });

    it('should not contain the second IP address', function() {
      Assert.notExistsRow('2.3.4.5');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLinkId('filterLink');
          }, callback);
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '2.3.4.5',
              Date.parse('today').toISOString(),
              Date.parse('tomorrow')
            ), callback
          );
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '1.2.3.4',
              Date.parse('yesterday').toISOString(),
              Date.parse('today')
            ), callback
          );
        }
      ], callback);
    });

  });

  describe('HistoryPage on Filter by MAC Address', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'from': Date.parse('yesterday').toISOString(),
            'to': Date.parse('today'),
            'device': 'aa:11:bb:22:cc:33',
            'host': null
          }, callback);
        },
        function(callback) {
          Application.POST('/api/leases', {
            'address': '2.3.4.5',
            'from': Date.parse('today').toISOString(),
            'to': Date.parse('tomorrow'),
            'device': 'bb:22:cc:33:dd:44',
            'host': 'host02'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLink('aa:11:bb:22:cc:33');
          }, callback);
        }
      ], callback);
    });

    it('should contain the first IP address', function() {
      Assert.existsRow('1.2.3.4');
    });

    it('should not contain the second IP address', function() {
      Assert.notExistsRow('2.3.4.5');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLinkId('filterLink');
          }, callback);
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '2.3.4.5',
              Date.parse('today').toISOString(),
              Date.parse('tomorrow')
            ), callback
          );
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '1.2.3.4',
              Date.parse('yesterday').toISOString(),
              Date.parse('today')
            ), callback
          );
        }
      ], callback);
    });

  });

  describe('HistoryPage on Filter by Host Name', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'from': Date.parse('yesterday').toISOString(),
            'to': Date.parse('today'),
            'device': 'aa:11:bb:22:cc:33',
            'host': null
          }, callback);
        },
        function(callback) {
          Application.POST('/api/leases', {
            'address': '2.3.4.5',
            'from': Date.parse('today').toISOString(),
            'to': Date.parse('tomorrow'),
            'device': 'bb:22:cc:33:dd:44',
            'host': 'host02'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLink('host02');
          }, callback);
        }
      ], callback);
    });

    it('should not contain the first IP address', function() {
      Assert.notExistsRow('1.2.3.4');
    });

    it('should contain the second IP address', function() {
      Assert.existsRow('2.3.4.5');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForElementsShown(HistoryTable, function() {
            Assert.clickLinkId('filterLink');
          }, callback);
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '2.3.4.5',
              Date.parse('today').toISOString(),
              Date.parse('tomorrow')
            ), callback
          );
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '1.2.3.4',
              Date.parse('yesterday').toISOString(),
              Date.parse('today')
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

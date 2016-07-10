var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../../library/application');
var Assert = require('../library/assert');
var Log = require('../../library/log');

var LeasesPage = require('../../library/elements/pages/leases-page');
var LeasesTable = require('../../library/elements/tables/leases-table');

describe('LeasesPage', function() {

  beforeEach(function(callback) {
    Asynchronous.waterfall([
      function(callback) {
        Application.GET('/api/leases', callback);
      },
      function(leases, callback) {
        if (leases.length > 0)
          Application.DELETE('/api/leases', callback);
        else
          callback(null);
      },
      function(callback) {
        Assert.showPage(LeasesPage.createElement(), callback);
      }
    ], callback);
  });

  it('should be on the Leases page', function() {
    Assert.onPage('Leases');
  });

  it('should contain a link labelled Back', function() {
    Assert.existsLink('Back');
  });

  it('should contain a Refresh link', function() {
    Assert.existsLinkId('refresh');
  });

  it('should contain a link labelled Add', function() {
    Assert.existsLink('Add');
  });

  describe('LeasesPage to LeasePage on Add', function() {

    beforeEach(function(callback) {
      Assert.waitForPageShown(function() {
        Assert.clickLink('Add');
      }, callback);
    });

    it('should go to the Lease page when the Add button is clicked', function() {
      Assert.onPage('Lease');
    });

    it('should contain a blank IP Address on the Lease page when the Add button is clicked', function() {
      Assert.existsInputValue('address', '');
    });

    it('should contain a blank MAC Address on the Lease page when the Add button is clicked', function() {
      Assert.existsInputValue('device', '');
    });

    it('should contain a blank Host Name on the Lease page when the Add button is clicked', function() {
      Assert.existsInputValue('host', '');
    });

    afterEach(function(callback) {
      Assert.hidePage(callback);
    });

  });

  describe('LeasesPage to LeasePage on Add and Back', function() {

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickLink('Add');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickLink('Back');
          }, callback);
        }
      ], callback);
    });

    it('should return to the Leases page when the Add and Back buttons are clicked', function() {
      Assert.onPage('Leases');
    });

  });

  describe('LeasesPage POST/Refresh', function() {

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(LeasesTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        }
      ], callback);
    });

    it('should show the lease for 1.2.3.4', function() {
      Assert.existsRow('1.2.3.4');
    });

    it('should show the lease for aa:11:bb:22:cc:33', function() {
      Assert.existsRow('aa:11:bb:22:cc:33');
    });

    it('should show the lease for host01', function() {
      Assert.existsRow('host01');
    });

  });

  describe('LeasesPage POST/Refresh (w/ device translation)', function() {

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.5',
            'device': 'aa:11:bb:22:cc:34',
            'host': 'host01.1'
          }, callback);
        },
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'aa:11:bb:22:cc:34',
            'to': 'host001.1'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(LeasesTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        }
      ], callback);
    });

    it('should show the lease for 1.2.3.5', function() {
      Assert.existsRow('1.2.3.5');
    });

    it('should show the lease for aa:11:bb:22:cc:34', function() {
      Assert.existsRow('aa:11:bb:22:cc:34');
    });

    it('should not show the lease for host01.1', function() {
      Assert.notExistsRow('host01.1');
    });

    it('should show the lease for host001.1', function() {
      Assert.existsRow('host001.1');
    });

  });

  describe('LeasesPage POST/Refresh (w/ host translation)', function() {

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.6',
            'device': 'aa:11:bb:22:cc:35',
            'host': 'host01.2'
          }, callback);
        },
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'host01.2',
            'to': 'host001.2'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(LeasesTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        }
      ], callback);
    });

    it('should show the lease for 1.2.3.6', function() {
      Assert.existsRow('1.2.3.6');
    });

    it('should show the lease for aa:11:bb:22:cc:35', function() {
      Assert.existsRow('aa:11:bb:22:cc:35');
    });

    it('should not show the lease for host01.2', function() {
      Assert.notExistsRow('host01.2');
    });

    it('should show the lease for host001.2', function() {
      Assert.existsRow('host001.2');
    });

  });

  describe('LeasesPage DELETE/Refresh', function() {

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '2.3.4.5',
            'device': 'bb:22:cc:33:dd:44',
            'host': 'host02'
          }, callback);
        },
        function(callback) {
          Application.DELETE('/api/leases/2.3.4.5', callback);
        },
        function(callback) {
          Assert.waitForElementsShown(LeasesTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        }
      ], callback);
    });

    it('should not show the lease for 2.3.4.5', function() {
      Assert.notExistsRow('2.3.4.5');
    });

    it('should not show the lease for bb:22:cc:33:dd:44', function() {
      Assert.notExistsRow('bb:22:cc:33:dd:44');
    });

    it('should not show the lease for host02', function() {
      Assert.notExistsRow('host02');
    });

  });

  describe('LeasesPage to LeasePage on Selected', function() {

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '3.4.5.6',
            'device': 'cc:33:dd:44:ee:55',
            'host': 'host03'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(LeasesTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickRow('3.4.5.6');
          }, callback);
        },
      ], callback);
    });

    it('should go to the Lease page when the 3.4.5.6 lease is clicked', function() {
      Assert.onPage('Lease');
    });

    it('should contain the disabled IP Address 3.4.5.6 on the Lease page when the 3.4.5.6 lease is clicked', function() {
      Assert.existsDisabledInputValue('address', '3.4.5.6');
    });

    it('should contain the MAC Address cc:33:dd:44:ee:55 on the Lease page when the 3.4.5.6 lease is clicked', function() {
      Assert.existsInputValue('device', 'cc:33:dd:44:ee:55');
    });

    it('should contain the Host Name host03 on the Lease page when the 3.4.5.6 lease is clicked', function() {
      Assert.existsInputValue('host', 'host03');
    });

    afterEach(function(callback) {
      Assert.hidePage(callback);
    });

  });

  describe('LeasesPage to LeasePage on Selected and Back', function() {

    beforeEach(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '4.5.6.7',
            'device': 'dd:44:ee:55:ff:66',
            'host': 'host04'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(function() {
            Assert.clickLinkId('refresh');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickRow('4.5.6.7');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickLink('Back');
          }, callback);
        },
      ], callback);
    });

    it('should return to the Leases page when the 4.5.6.7 lease and Back button are clicked', function() {
      Assert.onPage('Leases');
    });

  });

  afterEach(function(callback) {
    Assert.hidePage(callback);
  });

});

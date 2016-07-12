var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../../library/application');
var Assert = require('../library/assert');
var Log = require('../../library/log');

var LeasesPage = require('../../library/elements/pages/leases-page');
var LeasesTable = require('../../library/elements/tables/leases-table');

describe('LeasesPage', function() {

  before(function(callback) {
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

    before(function(callback) {
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

    after(function(callback) {
      Assert.hidePage(callback);
    });

  });

  describe('LeasesPage to LeasePage on Add and Back', function() {

    before(function(callback) {
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

    before(function(callback) {
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

    it('should show the IP address', function() {
      Assert.existsRow('1.2.3.4');
    });

    it('should show the MAC address', function() {
      Assert.existsRow('aa:11:bb:22:cc:33');
    });

    it('should show the host name', function() {
      Assert.existsRow('host01');
    });

    after(function(callback) {
      Application.DELETE('/api/leases/1.2.3.4', callback);
    });

  });

  describe('LeasesPage POST/Refresh (w/ device translation)', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'aa:11:bb:22:cc:33',
            'to': 'host001'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(LeasesTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        }
      ], callback);
    });

    it('should show the IP address', function() {
      Assert.existsRow('1.2.3.4');
    });

    it('should show the MAC address', function() {
      Assert.existsRow('aa:11:bb:22:cc:33');
    });

    it('should not show the host name', function() {
      Assert.notExistsRow('host01');
    });

    it('should show the translation', function() {
      Assert.existsRow('host001');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.DELETE('/api/translations/aa:11:bb:22:cc:33', callback);
        },
        function(callback) {
          Application.DELETE('/api/leases/1.2.3.4', callback);
        }
      ], callback);
    });

  });

  describe('LeasesPage POST/Refresh (w/ host translation)', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(callback) {
          Application.POST('/api/translations', {
            'from': 'host01',
            'to': 'host001'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(LeasesTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        }
      ], callback);
    });

    it('should show the IP address', function() {
      Assert.existsRow('1.2.3.4');
    });

    it('should show the MAC address', function() {
      Assert.existsRow('aa:11:bb:22:cc:33');
    });

    it('should not show the host name', function() {
      Assert.notExistsRow('host01');
    });

    it('should show the translation', function() {
      Assert.existsRow('host001');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.DELETE('/api/translations/host01', callback);
        },
        function(callback) {
          Application.DELETE('/api/leases/1.2.3.4', callback);
        }
      ], callback);
    });

  });

  describe('LeasesPage DELETE/Refresh', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(callback) {
          Application.DELETE('/api/leases/1.2.3.4', callback);
        },
        function(callback) {
          Assert.waitForElementsShown(LeasesTable, function() {
            Assert.clickLinkId('refresh');
          }, callback);
        }
      ], callback);
    });

    it('should not show the IP address', function() {
      Assert.notExistsRow('1.2.3.4');
    });

    it('should not show the MAC address', function() {
      Assert.notExistsRow('aa:11:bb:22:cc:33');
    });

    it('should not show the host name', function() {
      Assert.notExistsRow('host01');
    });

  });

  describe('LeasesPage to LeasePage on Selected', function() {

    before(function(callback) {
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
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickRow('1.2.3.4');
          }, callback);
        },
      ], callback);
    });

    it('should go to the Lease page when the lease is clicked', function() {
      Assert.onPage('Lease');
    });

    it('should contain the disabled IP Address on the Lease page when the lease is clicked', function() {
      Assert.existsDisabledInputValue('address', '1.2.3.4');
    });

    it('should contain the MAC Address on the Lease page when the lease is clicked', function() {
      Assert.existsInputValue('device', 'aa:11:bb:22:cc:33');
    });

    it('should contain the Host Name on the Lease page when the lease is clicked', function() {
      Assert.existsInputValue('host', 'host01');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.hidePage(callback);
        },
        function(callback) {
          Application.DELETE('/api/leases/1.2.3.4', callback);
        }
      ], callback);
    });

  });

  describe('LeasesPage to LeasePage on Selected and Back', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(callback) {
          Assert.waitForElementsShown(function() {
            Assert.clickLinkId('refresh');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickRow('1.2.3.4');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickLink('Back');
          }, callback);
        },
      ], callback);
    });

    it('should return to the Leases page when the lease and Back button are clicked', function() {
      Assert.onPage('Leases');
    });

  });

  after(function(callback) {
    Assert.hidePage(callback);
  });

});

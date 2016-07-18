require('../../vendor/DateJS');

var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../../library/application');
var Assert = require('../library/assert');
var Log = require('../../library/log');

var LeasePage = require('../../library/elements/pages/lease-page');
var LeasesPage = require('../../library/elements/pages/leases-page');

describe('LeasePage', function() {

  // before(function(callback) {
  //   Asynchronous.waterfall([
  //     function(callback) {
  //       Application.GET('/api/leases', callback);
  //     },
  //     function(leases, callback) {
  //       if (leases.length > 0)
  //         Application.DELETE('/api/leases', callback);
  //       else
  //         callback(null);
  //     }
  //   ], callback);
  // });

  describe('LeasePage (new static lease)', function() {

    before(function(callback) {
      Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource({})), callback);
    });

    it('should be on the Lease page', function() {
      Assert.onPage('Lease');
    });

    it('should contain a link labelled Back', function() {
      Assert.existsLink('Back');
    });

    it('should contain a link labelled Done', function() {
      Assert.existsLink('Done');
    });

    it('should contain a blank input for IP Address', function() {
      Assert.existsInputValue('address', '');
    });

    it('should contain a blank input for MAC Address', function() {
      Assert.existsInputValue('device', '');
    });

    it('should contain a blank input for Host Name', function() {
      Assert.existsInputValue('host', '');
    });

    it('should not contain a delete link', function() {
      Assert.notExistsLinkId('delete');
    });

    it('should not contain a button labelled Create static lease', function() {
      Assert.notExistsButton('Create static lease');
    });

    it('should contain a disabled button labelled Copy static lease', function() {
      Assert.existsDisabledButton('Copy static lease');
    });

    it('should contain a disabled button labelled Create translation', function() {
      Assert.existsDisabledButton('Create translation');
    });

    it('should not contain a button labelled Edit translation', function() {
      Assert.notExistsButton('Edit translation');
    });

    after(function(callback) {
      Assert.hidePage(callback);
    });

  });

  describe('LeasePage (new static lease) on valid IP Address, MAC Address, and Host Name on Done', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource({})), callback);
        },
        function(callback) {
          Assert.inputValue('address', '1.2.3.4', callback);
        },
        function(callback) {
          Assert.inputValue('device', 'aa:11:bb:22:cc:33', callback);
        },
        function(callback) {
          Assert.inputValue('host', 'host01', callback);
        },
        function(callback) {
          Assert.waitForModalShown(function() {
            Assert.clickLink('Done');
          }, callback);
        },
        function(callback) {
          Assert.waitForModalHidden(function() {
            Assert.clickClose();
          }, callback);
        }
      ], callback);
    });

    it('should save the IP Address', function(callback) {
      Application.GET('/api/leases/1.2.3.4', function(error, lease) {
        if (error)
          callback(error);
        else {
          Assert.equal(lease.address, '1.2.3.4');
          callback(null);
        }
      });
    });

    it('should save the MAC Address', function(callback) {
      Application.GET('/api/leases/1.2.3.4', function(error, lease) {
        if (error)
          callback(error);
        else {
          Assert.equal(lease.device, 'aa:11:bb:22:cc:33');
          callback(null);
        }
      });
    });

    it('should save the Host Name', function(callback) {
      Application.GET('/api/leases/1.2.3.4', function(error, lease) {
        if (error)
          callback(error);
        else {
          Assert.equal(lease.host, 'host01');
          callback(null);
        }
      });
    });

    after(function(callback) {
      Application.DELETE('/api/leases/1.2.3.4', callback);
    });

  });

  describe('LeasePage (new static lease) on invalid IP Address on Done', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource({})), callback);
        },
        function(callback) {
          Assert.inputValue('address', 'a.b.c.d', callback);
        },
        function(callback) {
          Assert.inputValue('device', 'aa:11:bb:22:cc:33', callback);
        },
        function(callback) {
          Assert.inputValue('host', 'host01', callback);
        },
        function(callback) {
          Assert.waitForModalShown(function() {
            Assert.clickLink('Done');
          }, callback);
        }
      ], callback);
    });

    it('should display an alert', function() {
      Assert.existsAlert('The IP address "a.b.c.d" is invalid.');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForModalHidden(function() {
            Assert.clickOk();
          }, callback);
        },
        function(callback) {
          Assert.hidePage(callback);
        }
      ], callback);
    });

  });

  describe('LeasePage (new static lease) on invalid MAC Address on Done', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource({})), callback);
        },
        function(callback) {
          Assert.inputValue('address', '1.2.3.4', callback);
        },
        function(callback) {
          Assert.inputValue('device', 'aa:11:bb:22:cc:zz', callback);
        },
        function(callback) {
          Assert.inputValue('host', 'host01', callback);
        },
        function(callback) {
          Assert.waitForModalShown(function() {
            Assert.clickLink('Done');
          }, callback);
        }
      ], callback);
    });

    it('should display an alert', function() {
      Assert.existsAlert('The MAC address "aa:11:bb:22:cc:zz" is invalid.');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForModalHidden(function() {
            Assert.clickOk();
          }, callback);
        },
        function(callback) {
          Assert.hidePage(callback);
        }
      ], callback);
    });

  });

  describe('LeasePage (new static lease) on invalid Host Name on Done', function() {

    before(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource({})), callback);
        },
        function(callback) {
          Assert.inputValue('address', '1.2.3.4', callback);
        },
        function(callback) {
          Assert.inputValue('device', 'aa:11:bb:22:cc:33', callback);
        },
        function(callback) {
          Assert.inputValue('host', '@host01', callback);
        },
        function(callback) {
          Assert.waitForModalShown(function() {
            Assert.clickLink('Done');
          }, callback);
        }
      ], callback);
    });

    it('should display an alert', function() {
      Assert.existsAlert('The host name "@host01" is invalid.');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForModalHidden(function() {
            Assert.clickOk();
          }, callback);
        },
        function(callback) {
          Assert.hidePage(callback);
        }
      ], callback);
    });

  });

  describe('LeasePage (existing static lease)', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(lease, callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource(lease)), callback);
        }
      ], callback);
    });

    it('should be on the Lease page', function() {
      Assert.onPage('Lease');
    });

    it('should contain a link labelled Back', function() {
      Assert.existsLink('Back');
    });

    it('should contain a link labelled Done', function() {
      Assert.existsLink('Done');
    });

    it('should contain a disabled input for IP Address', function() {
      Assert.existsDisabledInputValue('address', '1.2.3.4');
    });

    it('should contain an input for MAC Address', function() {
      Assert.existsInputValue('device', 'aa:11:bb:22:cc:33');
    });

    it('should contain an input for Host Name', function() {
      Assert.existsInputValue('host', 'host01');
    });

    it('should contain a delete link', function() {
      Assert.existsLinkId('delete');
    });

    it('should not contain a button labelled Create static lease', function() {
      Assert.notExistsButton('Create static lease');
    });

    it('should contain a button labelled Copy static lease', function() {
      Assert.existsButton('Copy static lease');
    });

    it('should contain a disabled button labelled Create translation', function() {
      Assert.existsDisabledButton('Create translation');
    });

    it('should not contain a button labelled Edit translation', function() {
      Assert.notExistsButton('Edit translation');
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

  describe('LeasePage (existing static lease w/ translation)', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(lease, callback) {
          Application.POST('/api/translations', {
            'from': 'aa:11:bb:22:cc:33',
            'to': 'host001'
          }, function(error, translation) {
            callback(error, lease, translation);
          });
        },
        function(lease, translation, callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource(lease, translation)), callback);
        }
      ], callback);
    });

    it('should be on the Lease page', function() {
      Assert.onPage('Lease');
    });

    it('should contain a link labelled Back', function() {
      Assert.existsLink('Back');
    });

    it('should contain a link labelled Done', function() {
      Assert.existsLink('Done');
    });

    it('should contain a disabled input for IP Address', function() {
      Assert.existsDisabledInputValue('address', '1.2.3.4');
    });

    it('should contain an input for MAC Address', function() {
      Assert.existsInputValue('device', 'aa:11:bb:22:cc:33');
    });

    it('should contain an input for Host Name', function() {
      Assert.existsInputValue('host', 'host01');
    });

    it('should contain a disabled input for Translation', function() {
      Assert.existsDisabledInputValue('translation', 'host001');
    });

    it('should contain a delete link', function() {
      Assert.existsLinkId('delete');
    });

    it('should not contain a button labelled Create static lease', function() {
      Assert.notExistsButton('Create static lease');
    });

    it('should contain a button labelled Copy static lease', function() {
      Assert.existsButton('Copy static lease');
    });

    it('should not contain a button labelled Create translation', function() {
      Assert.notExistsButton('Create translation');
    });

    it('should contain a button labelled Edit translation', function() {
      Assert.existsButton('Edit translation');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.hidePage(callback);
        },
        function(callback) {
          Application.DELETE('/api/translations/aa:11:bb:22:cc:33', callback);
        },
        function(callback) {
          Application.DELETE('/api/leases/1.2.3.4', callback);
        }
      ], callback);
    });

  });

  describe('LeasePage (existing static lease) on Delete', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(lease, callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource(lease)), callback);
        },
        function(callback) {
          Assert.waitForModalShown(function() {
            Assert.clickLinkId('delete');
          }, callback);
        }
      ], callback);
    });

    it('should display a confirmation', function() {
      Assert.existsConfirmation('Are you sure you want to delete the static DHCP lease for "1.2.3.4"?');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.waitForModalHidden(function() {
            Assert.clickNo();
          }, callback);
        },
        function(callback) {
          Assert.hidePage(callback);
        },
        function(callback) {
          Application.DELETE('/api/leases/1.2.3.4', callback);
        }
      ], callback);
    });

  });

  describe('LeasePage (existing static lease) on Delete and Yes', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(lease, callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource(lease)), callback);
        },
        function(callback) {
          Assert.waitForModalShown(function() {
            Assert.clickLinkId('delete');
          }, callback);
        },
        function(callback) {
          Assert.waitForModalShown(function(callback) {
            Assert.waitForModalHidden(function() {
              Assert.clickYes();
            }, callback);
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
          // Assert.waitForModalHidden(function() {
            Assert.clickClose();
          }, callback);
        }
      ], callback);
    });

    it('should delete the lease', function(callback) {
      Application.GET('/api/exists/leases/1.2.3.4', function(error, data) {
        if (error)
          callback(error);
        else {
          Assert.ok(!data.exists, 'The leases exists.');
          callback(null);
        }
      });
      // Application.GET('/api/leases/1.2.3.4', function(error, lease) {
      //   Assert.ok(error instanceof Application.RequestError);
      //   Assert.equal(error.status, 404);
      //   callback(null);
      // });
      // Asynchronous.waterfall([
      //   function(callback) {
      //     Application.GET('/api/leases', callback);
      //   },
      //   function(leases, callback) {
      //     Assert.equal(leases.length, 0);
      //     callback(null);
      //   }
      // ], callback);
    });

  });

  describe('LeasePage (existing static lease) on Delete and No', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(lease, callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource(lease)), callback);
        },
        function(callback) {
          Assert.waitForModalShown(function() {
            Assert.clickLinkId('delete');
          }, callback);
        },
        function(callback) {
          Assert.waitForModalHidden(function() {
            Assert.clickNo();
          }, callback);
        }
      ], callback);
    });

    it('should not delete the lease', function(callback) {
      Application.GET('/api/leases/1.2.3.4', function(error, lease) {
        Assert.ok(!error);
        Assert.ok(lease);
        callback(null);
      });
      // Asynchronous.waterfall([
      //   function(callback) {
      //     Application.GET('/api/leases', callback);
      //   },
      //   function(leases, callback) {
      //     Assert.equal(leases.length, 1);
      //     callback(null);
      //   }
      // ], callback);
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

  describe('LeasePage (existing system lease)', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'from': Date.parse('yesterday').toISOString(),
            'to': Date.parse('tomorrow').toISOString(),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(lease, callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource(lease)), callback);
        }
      ], callback);
    });

    it('should be on the Lease page', function() {
      Assert.onPage('Lease');
    });

    it('should contain a link labelled Back', function() {
      Assert.existsLink('Back');
    });

    it('should not contain a link labelled Done', function() {
      Assert.notExistsLink('Done');
    });

    it('should contain a disabled input for IP Address', function() {
      Assert.existsDisabledInputValue('address', '1.2.3.4');
    });

    it('should contain a disabled input for MAC Address', function() {
      Assert.existsDisabledInputValue('device', 'aa:11:bb:22:cc:33');
    });

    it('should contain a disabled input for Host Name', function() {
      Assert.existsDisabledInputValue('host', 'host01');
    });

    it('should not contain a delete link', function() {
      Assert.notExistsLinkId('delete');
    });

    it('should contain a button labelled Create static lease', function() {
      Assert.existsButton('Create static lease');
    });

    it('should not contain a button labelled Copy static lease', function() {
      Assert.notExistsButton('Copy static lease');
    });

    it('should contain a button labelled Create translation', function() {
      Assert.existsButton('Create translation');
    });

    it('should not contain a button labelled Edit translation', function() {
      Assert.notExistsButton('Edit translation');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.hidePage(callback);
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '1.2.3.4',
              Date.parse('yesterday').toISOString(),
              Date.parse('tomorrow').toISOString()
            ), callback
          );
        }
      ], callback);
    });

  });

  describe('LeasePage (existing system lease w/ translation)', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'from': Date.parse('yesterday').toISOString(),
            'to': Date.parse('tomorrow').toISOString(),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(lease, callback) {
          Application.POST('/api/translations', {
            'from': 'aa:11:bb:22:cc:33',
            'to': 'host001'
          }, function(error, translation) {
            callback(error, lease, translation);
          });
        },
        function(lease, translation, callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource(lease, translation)), callback);
        }
      ], callback);
    });

    it('should be on the Lease page', function() {
      Assert.onPage('Lease');
    });

    it('should contain a link labelled Back', function() {
      Assert.existsLink('Back');
    });

    it('should not contain a link labelled Done', function() {
      Assert.notExistsLink('Done');
    });

    it('should contain a disabled input for IP Address', function() {
      Assert.existsDisabledInputValue('address', '1.2.3.4');
    });

    it('should contain a disabled input for MAC Address', function() {
      Assert.existsDisabledInputValue('device', 'aa:11:bb:22:cc:33');
    });

    it('should contain a disabled input for Host Name', function() {
      Assert.existsDisabledInputValue('host', 'host01');
    });

    it('should contain a disabled input for Translation', function() {
      Assert.existsDisabledInputValue('translation', 'host001');
    });

    it('should not contain a delete link', function() {
      Assert.notExistsLinkId('delete');
    });

    it('should contain a button labelled Create static lease', function() {
      Assert.existsButton('Create static lease');
    });

    it('should not contain a button labelled Copy static lease', function() {
      Assert.notExistsButton('Copy static lease');
    });

    it('should not contain a button labelled Create translation', function() {
      Assert.notExistsButton('Create translation');
    });

    it('should contain a button labelled Edit translation', function() {
      Assert.existsButton('Edit translation');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.hidePage(callback);
        },
        function(callback) {
          Application.DELETE('/api/translations/aa:11:bb:22:cc:33', callback);
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '1.2.3.4',
              Date.parse('yesterday').toISOString(),
              Date.parse('tomorrow').toISOString()
            ), callback);
        }
      ], callback);
    });

  });

  describe('LeasePage (existing static lease) on Copy static lease', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(lease, callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource(lease)), callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickButton('Copy static lease');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
          }, callback);
        }
      ], callback);
    });

    it('should be on the Lease page', function() {
      Assert.onPage('Lease');
    });

    it('should contain a link labelled Back', function() {
      Assert.existsLink('Back');
    });

    it('should contain a link labelled Done', function() {
      Assert.existsLink('Done');
    });

    it('should contain a blank input for IP Address', function() {
      Assert.existsInputValue('address', '');
    });

    it('should contain an input for MAC Address', function() {
      Assert.existsInputValue('device', 'aa:11:bb:22:cc:33');
    });

    it('should contain an input for Host Name', function() {
      Assert.existsInputValue('host', 'host01');
    });

    it('should noy contain a delete link', function() {
      Assert.notExistsLinkId('delete');
    });

    it('should not contain a button labelled Create static lease', function() {
      Assert.notExistsButton('Create static lease');
    });

    it('should contain a disabled button labelled Copy static lease', function() {
      Assert.existsDisabledButton('Copy static lease');
    });

    it('should contain a disabled button labelled Create translation', function() {
      Assert.existsDisabledButton('Create translation');
    });

    it('should not contain a button labelled Edit translation', function() {
      Assert.notExistsButton('Edit translation');
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

  describe('LeasePage (existing system lease) on Create static lease', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'from': Date.parse('yesterday').toISOString(),
            'to': Date.parse('tomorrow').toISOString(),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(lease, callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource(lease)), callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickButton('Create static lease');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
          }, callback);
        }
      ], callback);
    });

    it('should be on the Lease page', function() {
      Assert.onPage('Lease');
    });

    it('should contain a link labelled Back', function() {
      Assert.existsLink('Back');
    });

    it('should contain a link labelled Done', function() {
      Assert.existsLink('Done');
    });

    it('should contain a blank input for IP Address', function() {
      Assert.existsInputValue('address', '');
    });

    it('should contain an input for MAC Address', function() {
      Assert.existsInputValue('device', 'aa:11:bb:22:cc:33');
    });

    it('should contain an input for Host Name', function() {
      Assert.existsInputValue('host', 'host01');
    });

    it('should not contain a delete link', function() {
      Assert.notExistsLinkId('delete');
    });

    it('should not contain a button labelled Create static lease', function() {
      Assert.notExistsButton('Create static lease');
    });

    it('should contain a disabled button labelled Copy static lease', function() {
      Assert.existsDisabledButton('Copy static lease');
    });

    it('should contain a disabled button labelled Create translation', function() {
      Assert.existsDisabledButton('Create translation');
    });

    it('should not contain a button labelled Edit translation', function() {
      Assert.notExistsButton('Edit translation');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.hidePage(callback);
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '1.2.3.4',
              Date.parse('yesterday').toISOString(),
              Date.parse('tomorrow').toISOString()
            ), callback
          );
        }
      ], callback);
    });

  });

  describe('LeasePage (existing system lease) on Create translation', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'from': Date.parse('yesterday').toISOString(),
            'to': Date.parse('tomorrow').toISOString(),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(lease, callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource(lease)), callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickButton('Create translation');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
          }, callback);
        }
      ], callback);
    });

    it('should be on the Translation page', function() {
      Assert.onPage('Translation');
    });

    it('should contain a link labelled Back', function() {
      Assert.existsLink('Back');
    });

    it('should contain a link labelled Done', function() {
      Assert.existsLink('Done');
    });

    it('should contain an input for From', function() {
      Assert.existsInputValue('from', 'aa:11:bb:22:cc:33');
    });

    it('should contain a blank input for To', function() {
      Assert.existsInputValue('to', '');
    });

    it('should not contain a delete link', function() {
      Assert.notExistsLinkId('delete');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.hidePage(callback);
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '1.2.3.4',
              Date.parse('yesterday').toISOString(),
              Date.parse('tomorrow').toISOString()
            ), callback
          );
        }
      ], callback);
    });

  });

  describe('LeasePage (existing system lease w/ translation) on Edit translation', function() {

    before(function(callback) {
      Asynchronous.waterfall([
        function(callback) {
          Application.POST('/api/leases', {
            'address': '1.2.3.4',
            'from': Date.parse('yesterday').toISOString(),
            'to': Date.parse('tomorrow').toISOString(),
            'device': 'aa:11:bb:22:cc:33',
            'host': 'host01'
          }, callback);
        },
        function(lease, callback) {
          Application.POST('/api/translations', {
            'from': 'aa:11:bb:22:cc:33',
            'to': 'host001'
          }, function(error, translation) {
            callback(error, lease, translation);
          });
        },
        function(lease, translation, callback) {
          Assert.showPage(LeasePage.createElement(LeasePage.Source.createSource(lease, translation)), callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
            Assert.clickButton('Edit translation');
          }, callback);
        },
        function(callback) {
          Assert.waitForPageShown(function() {
          }, callback);
        }
      ], callback);
    });

    it('should be on the Translation page', function() {
      Assert.onPage('Translation');
    });

    it('should contain a link labelled Back', function() {
      Assert.existsLink('Back');
    });

    it('should contain a link labelled Done', function() {
      Assert.existsLink('Done');
    });

    it('should contain an input for From', function() {
      Assert.existsDisabledInputValue('from', 'aa:11:bb:22:cc:33');
    });

    it('should contain an input for To', function() {
      Assert.existsInputValue('to', 'host001');
    });

    it('should contain a delete link', function() {
      Assert.existsLinkId('delete');
    });

    after(function(callback) {
      Asynchronous.series([
        function(callback) {
          Assert.hidePage(callback);
        },
        function(callback) {
          Application.DELETE('/api/translations/aa:11:bb:22:cc:33', callback);
        },
        function(callback) {
          Application.DELETE(
            Utilities.format(
              '/api/leases/%s/%s/%s',
              '1.2.3.4',
              Date.parse('yesterday').toISOString(),
              Date.parse('tomorrow').toISOString()
            ), callback
          );
        }
      ], callback);
    });

  });

});

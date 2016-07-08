var Asynchronous = require('async');

var Application = require('../../library/application');
var Assert = require('../library/assert');
var Log = require('../../library/log');

var LeasePage = require('../../library/elements/pages/lease-page');
var LeasesPage = require('../../library/elements/pages/leases-page');

describe.only('LeasePage', function() {

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
      }
    ], callback);
  });

  describe('LeasePage (new static lease)', function() {

    beforeEach(function(callback) {
      Assert.showPage(LeasePage.createElement(LeasePage.createLease({})), callback);
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

    afterEach(function(callback) {
      Assert.hidePage(callback);
    });

  });

  // describe('LeasePage (existing lease)', function() {
  //
  //   beforeEach(function(callback) {
  //     Asynchronous.waterfall([
  //       function(callback) {
  //         Application.POST('/api/leases', {
  //           'from': 'from01',
  //           'to': 'to01'
  //         }, callback);
  //       },
  //       function(lease, callback) {
  //         Assert.showPage(LeasePage.createElement(lease), callback);
  //       }
  //     ], callback);
  //   });
  //
  //   it('should be on the Lease page', function() {
  //     Assert.onPage('Lease');
  //   });
  //
  //   it('should contain a link labelled Back', function() {
  //     Assert.existsLink('Back');
  //   });
  //
  //   it('should contain a link labelled Done', function() {
  //     Assert.existsLink('Done');
  //   });
  //
  //   it('should contain an input for from containing "from01"', function() {
  //     Assert.existsInputValue('from', 'from01');
  //   });
  //
  //   it('should contain an input for to containing "to01"', function() {
  //     Assert.existsInputValue('to', 'to01');
  //   });
  //
  //   it('should contain a delete link', function() {
  //     Assert.existsLinkId('delete');
  //   });
  //
  //   afterEach(function(callback) {
  //     Assert.hidePage(callback);
  //   });
  //
  // });
  //
  // describe('LeasePage (new static lease) on valid From and To on Done', function() {
  //
  //   beforeEach(function(callback) {
  //     Asynchronous.series([
  //       function(callback) {
  //         Assert.showPage(LeasePage.createElement({}), callback);
  //       },
  //       function(callback) {
  //         Assert.inputValue('from', 'from02', callback);
  //       },
  //       function(callback) {
  //         Assert.inputValue('to', 'to02', callback);
  //       },
  //       function(callback) {
  //         Assert.clickLink('Done', callback);
  //       }
  //     ], callback);
  //   });
  //
  //   it('should save the from "from02" for the lease "from02" to "to02"', function(callback) {
  //     Application.GET('/api/leases/from02', function(error, lease) {
  //       if (error)
  //         callback(error);
  //       else {
  //         Assert.equal(lease.from, 'from02');
  //         callback(null);
  //       }
  //     });
  //   });
  //
  //   it('should save the to "to02" for the lease "from02" to "to02"', function(callback) {
  //     Application.GET('/api/leases/from02', function(error, lease) {
  //       if (error)
  //         callback(error);
  //       else {
  //         Assert.equal(lease.to, 'to02');
  //         callback(null);
  //       }
  //     });
  //   });
  //
  // });
  //
  // describe('LeasePage (new static lease) on invalid From on Done', function() {
  //
  //   beforeEach(function(callback) {
  //     Asynchronous.series([
  //       function(callback) {
  //         Assert.showPage(LeasePage.createElement({}), callback);
  //       },
  //       function(callback) {
  //         Assert.inputValue('from', '@from03', callback);
  //       },
  //       function(callback) {
  //         Assert.inputValue('to', 'to03', callback);
  //       },
  //       function(callback) {
  //         Assert.waitForModalShown(function() {
  //           Assert.clickLink('Done');
  //         }, callback);
  //       }
  //     ], callback);
  //   });
  //
  //   it('should display the alert "The lease from \'@from03\' is invalid."', function() {
  //     Assert.existsAlert('The lease from "@from03" is invalid.');
  //   });
  //
  //   afterEach(function(callback) {
  //     Asynchronous.series([
  //       function(callback) {
  //         Assert.waitForModalHidden(function() {
  //           Assert.clickOk();
  //         }, callback);
  //       },
  //       function(callback) {
  //         Assert.hidePage(callback);
  //       }
  //     ], callback);
  //   });
  //
  // });
  //
  // describe('LeasePage (new static lease) on invalid To on Done', function() {
  //
  //   beforeEach(function(callback) {
  //     Asynchronous.series([
  //       function(callback) {
  //         Assert.showPage(LeasePage.createElement({}), callback);
  //       },
  //       function(callback) {
  //         Assert.inputValue('from', 'from03.5', callback);
  //       },
  //       function(callback) {
  //         Assert.inputValue('to', '', callback);
  //       },
  //       function(callback) {
  //         Assert.waitForModalShown(function() {
  //           Assert.clickLink('Done');
  //         }, callback);
  //       }
  //     ], callback);
  //   });
  //
  //   it('should display the alert "The lease to \'\' is invalid."', function() {
  //     Assert.existsAlert('The lease to "" is invalid.');
  //   });
  //
  //   afterEach(function(callback) {
  //     Asynchronous.series([
  //       function(callback) {
  //         Assert.waitForModalHidden(function() {
  //           Assert.clickOk();
  //         }, callback);
  //       },
  //       function(callback) {
  //         Assert.hidePage(callback);
  //       }
  //     ], callback);
  //   });
  //
  // });
  //
  // describe('LeasePage (existi ng lease) on Delete', function() {
  //
  //   beforeEach(function(callback) {
  //     Asynchronous.waterfall([
  //       function(callback) {
  //         Application.POST('/api/leases', {
  //           'from': 'from04',
  //           'to': 'to04'
  //         }, callback);
  //       },
  //       function(lease, callback) {
  //         Assert.showPage(LeasePage.createElement(lease), callback);
  //       },
  //       function(callback) {
  //         Assert.waitForModalShown(function() {
  //           Assert.clickLinkId('delete');
  //         }, callback);
  //       }
  //     ], callback);
  //   });
  //
  //   it('should display the confirmation "Are you sure you want to delete the lease from \'from04\'?"', function() {
  //     Assert.existsConfirmation('Are you sure you want to delete the lease from "from04"?');
  //   });
  //
  //   afterEach(function(callback) {
  //     Asynchronous.series([
  //       function(callback) {
  //         Assert.waitForModalHidden(function() {
  //           Assert.clickNo();
  //         }, callback);
  //       },
  //       function(callback) {
  //         Assert.hidePage(callback);
  //       }
  //     ], callback);
  //   });
  //
  // });
  //
  // describe('LeasePage (existing lease) on Delete and Yes', function() {
  //
  //   beforeEach(function(callback) {
  //     Asynchronous.waterfall([
  //       function(callback) {
  //         Application.POST('/api/leases', {
  //           'from': 'from05',
  //           'to': 'to05'
  //         }, callback);
  //       },
  //       function(lease, callback) {
  //         Assert.showPage(LeasePage.createElement(lease), callback);
  //       },
  //       function(callback) {
  //         Assert.waitForModalShown(function() {
  //           Assert.clickLinkId('delete');
  //         }, callback);
  //       },
  //       function(callback) {
  //         Assert.waitForModalHidden(function() {
  //           Assert.clickYes();
  //         }, callback);
  //       }
  //     ], callback);
  //   });
  //
  //   it('should delete the lease', function(callback) {
  //     Asynchronous.waterfall([
  //       function(callback) {
  //         Application.GET('/api/leases', callback);
  //       },
  //       function(leases, callback) {
  //         Assert.equal(leases.length, 0);
  //         callback(null);
  //       }
  //     ], callback);
  //   });
  //
  // });
  //
  // describe('LeasePage (existing lease) on Delete and No', function() {
  //
  //   beforeEach(function(callback) {
  //     Asynchronous.waterfall([
  //       function(callback) {
  //         Application.POST('/api/leases', {
  //           'from': 'from06',
  //           'to': 'to06'
  //         }, callback);
  //       },
  //       function(lease, callback) {
  //         Assert.showPage(LeasePage.createElement(lease), callback);
  //       },
  //       function(callback) {
  //         Assert.waitForModalShown(function() {
  //           Assert.clickLinkId('delete');
  //         }, callback);
  //       },
  //       function(callback) {
  //         Assert.waitForModalHidden(function() {
  //           Assert.clickNo();
  //         }, callback);
  //       }
  //     ], callback);
  //   });
  //
  //   it('should not delete the lease', function(callback) {
  //     Asynchronous.waterfall([
  //       function(callback) {
  //         Application.GET('/api/leases', callback);
  //       },
  //       function(leases, callback) {
  //         Assert.equal(leases.length, 1);
  //         callback(null);
  //       }
  //     ], callback);
  //   });
  //
  //   afterEach(function(callback) {
  //     Assert.hidePage(callback);
  //   });
  //
  // });

});

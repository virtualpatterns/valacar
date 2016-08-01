var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../library/application');
var Database = require('../library/database');
var Log = require('../../../client/library/log');

describe('/api/leases', function() {

  // before(function(callback) {
  //   Asynchronous.series([
  //     function(callback) {
  //       Application.executeInstall(callback);
  //     },
  //     function(callback) {
  //       Application.executeStart(callback);
  //     },
  //     function(callback) {
  //       Application.waitUntilReady(callback);
  //     }
  //   ], callback);
  // });

  describe('HEAD', function() {

    it('should respond to HEAD /api/exists/leases with 200 OK', function(callback) {
      Application.isHEADStatusCode('/api/exists/leases', 200, callback);
    });

    it('should respond to HEAD /api/leases with 200 OK', function(callback) {
      Application.isHEADStatusCode('/api/leases', 200, callback);
    });

  });

  describe('GET', function() {

    it('should respond to GET /api/exists/leases/192.168.2.201/1970-01-01T00:00:00.000Z/1970-01-01T00:00:00.000Z with true', function(callback) {
      Application.isGET('/api/exists/leases/192.168.2.201/1970-01-01T00:00:00.000Z/1970-01-01T00:00:00.000Z', function(statusCode, headers, data, callback) {
        callback(null, data.exists);
      }, callback);
    });

    it('should respond to GET /api/exists/leases/192.168.2.201 with true', function(callback) {
      Application.isGET('/api/exists/leases/192.168.2.201', function(statusCode, headers, data, callback) {
        callback(null, data.exists);
      }, callback);
    });

    it('should respond to GET /api/exists/leases/192.168.2.292/1970-01-01T00:00:00.000Z/1970-01-01T00:00:00.000Z (a non-existent lease) with false', function(callback) {
      Application.isGET('/api/exists/leases/192.168.2.292/1970-01-01T00:00:00.000Z/1970-01-01T00:00:00.000Z', function(statusCode, headers, data, callback) {
        callback(null, !data.exists);
      }, callback);
    });

    it('should respond to GET /api/exists/leases/192.168.2.292 (a non-existent lease) with false', function(callback) {
      Application.isGET('/api/exists/leases/192.168.2.292', function(statusCode, headers, data, callback) {
        callback(null, !data.exists);
      }, callback);
    });

    it('should respond to GET /api/exists/leases/192-168-2-201/1970-01-01T00:00:00.000Z/1970-01-01T00:00:00.000Z (an invalid address/lease) with false', function(callback) {
      Application.isGET('/api/exists/leases/192-168-2-201/1970-01-01T00:00:00.000Z/1970-01-01T00:00:00.000Z', function(statusCode, headers, data, callback) {
        callback(null, !data.exists);
      }, callback);
    });

    it('should respond to GET /api/exists/leases/192-168-2-201 (an invalid address/lease) with false', function(callback) {
      Application.isGET('/api/exists/leases/192-168-2-201', function(statusCode, headers, data, callback) {
        callback(null, !data.exists);
      }, callback);
    });

    it('should respond to GET /api/exists/leases/192-168-2-201/1970.01.01T00-00-00.000R/1970.01.01T00-00-00.000R (an invalid address/from/to/lease) with 500 Internal Server Error', function(callback) {
      Application.isGETStatusCode('/api/exists/leases/192-168-2-201/1970.01.01T00-00-00.000R/1970.01.01T00-00-00.000R', 500, callback);
    });

    it('should respond to GET /api/exists/leases/192.168.2.201/a/a (an invalid address/from/to/lease) with 500 Internal Server Error', function(callback) {
      Application.isGETStatusCode('/api/exists/leases/192.168.2.201/a/a', 500, callback);
    });

    it('should respond to GET /api/leases with the static lease for JORKINS', function(callback) {
      Application.isGET('/api/leases', function(statusCode, headers, data, callback) {
        callback(null, data.filter(function(lease) {
          return  lease.address == '192.168.2.201' &&
                  new Date(lease.from).getTime() == Database.MINIMUM_DATE.getTime() &&
                  new Date(lease.to).getTime() == Database.MINIMUM_DATE.getTime() &&
                  lease.device == '08:00:27:66:5c:05' &&
                  lease.host == 'JORKINS';
        }).length > 0);
      }, callback);
    });

    it('should respond to GET /api/leases/192.168.2.201/1970-01-01T00:00:00.000Z/1970-01-01T00:00:00.000Z with the static lease for JORKINS', function(callback) {
      Application.isGET('/api/leases/192.168.2.201/1970-01-01T00:00:00.000Z/1970-01-01T00:00:00.000Z', function(statusCode, headers, data, callback) {
        callback(null,  data.address == '192.168.2.201' &&
                        new Date(data.from).getTime() == Database.MINIMUM_DATE.getTime() &&
                        new Date(data.to).getTime() == Database.MINIMUM_DATE.getTime() &&
                        data.device == '08:00:27:66:5c:05' &&
                        data.host == 'JORKINS');
      }, callback);
    });

    it('should respond to GET /api/leases/192.168.2.201 with the static lease for JORKINS', function(callback) {
      Application.isGET('/api/leases/192.168.2.201', function(statusCode, headers, data, callback) {
        callback(null,  data.address == '192.168.2.201' &&
                        new Date(data.from).getTime() == Database.MINIMUM_DATE.getTime() &&
                        new Date(data.to).getTime() == Database.MINIMUM_DATE.getTime() &&
                        data.device == '08:00:27:66:5c:05' &&
                        data.host == 'JORKINS');
      }, callback);
    });

    it('should respond to GET /api/leases/192.168.2.292/1970-01-01T00:00:00.000Z/1970-01-01T00:00:00.000Z (a non-existent lease) with 404 Not Found', function(callback) {
      Application.isGETStatusCode('/api/leases/192.168.2.292/1970-01-01T00:00:00.000Z/1970-01-01T00:00:00.000Z', 404, callback);
    });

    it('should respond to GET /api/leases/192.168.2.292 (a non-existent lease) with 404 Not Found', function(callback) {
      Application.isGETStatusCode('/api/leases/192.168.2.292', 404, callback);
    });

    it('should respond to GET /api/leases/192-168-2-201/1970-01-01T00:00:00.000Z/1970-01-01T00:00:00.000Z (an invalid address/lease) with 404 Not Found', function(callback) {
      Application.isGETStatusCode('/api/leases/192-168-2-201/1970-01-01T00:00:00.000Z/1970-01-01T00:00:00.000Z', 404, callback);
    });

    it('should respond to GET /api/leases/192-168-2-201 (an invalid address/lease) with 404 Not Found', function(callback) {
      Application.isGETStatusCode('/api/leases/192-168-2-201', 404, callback);
    });

    it('should respond to GET /api/leases/192-168-2-201/1970.01.01T00-00-00.000R/1970.01.01T00-00-00.000R (an invalid address/from/to/lease) with 500 Internal Server Error', function(callback) {
      Application.isGETStatusCode('/api/leases/192-168-2-201/1970.01.01T00-00-00.000R/1970.01.01T00-00-00.000R', 500, callback);
    });

    it('should respond to GET /api/leases/192.168.2.201/a/a (an invalid address/from/to/lease) with 500 Internal Server Error', function(callback) {
      Application.isGETStatusCode('/api/leases/192.168.2.201/a/a', 500, callback);
    });

  });

  describe('POST', function() {

    describe('Creating the translation', function() {

      before(function(callback) {
        Application.POST('/api/leases', {
          'address': '1.2.3.4',
          'device': '11:aa:22:bb:33:cc',
          'host': 'host01'
        }, callback);
      });

      it('should respond to POST /api/leases by creating the static lease', function(callback) {
        Database.openConnection(function(connection, callback) {
          Database.existsStaticLease(connection, '1.2.3.4', '11:aa:22:bb:33:cc', 'host01', callback);
        }, callback);
      });

      after(function(callback) {
        Application.DELETE('/api/leases/1.2.3.4', callback);
      });

    });

    describe('201 Created, etc.', function() {

      it('should respond to POST /api/leases with 201 Created', function(callback) {
        Application.isPOSTStatusCode('/api/leases', {
          'address': '1.2.3.4',
          'device': '11:aa:22:bb:33:cc',
          'host': 'host01'
        }, 201, callback);
      });

      it('should respond to POST /api/leases with a Location header', function(callback) {
        Application.isPOST('/api/leases', {
          'address': '1.2.3.4',
          'device': '11:aa:22:bb:33:cc',
          'host': 'host01'
        }, function(statusCode, headers, data, callback) {
          callback(null, !!headers.location);
        }, callback);
      });

      it('should respond to POST /api/leases with a URI for the created static lease in a Location header', function(callback) {
        Application.isPOST('/api/leases', {
          'address': '1.2.3.4',
          'device': '11:aa:22:bb:33:cc',
          'host': 'host01'
        }, function(statusCode, headers, data, callback) {
          Application.isGET(headers.location, function(statusCode, headers, data, callback) {
            callback(null,  data.address &&
                            data.address == '1.2.3.4' &&
                            data.device &&
                            data.device == '11:aa:22:bb:33:cc' &&
                            data.host &&
                            data.host == 'host01');
          }, callback);
        }, callback);
      });

      it('should respond to POST /api/leases with the created static lease', function(callback) {
        Application.isPOST('/api/leases', {
          'address': '1.2.3.4',
          'device': '11:aa:22:bb:33:cc',
          'host': 'host01'
        }, function(statusCode, headers, data) {
          callback(null,  data.address &&
                          data.address == '1.2.3.4' &&
                          data.device &&
                          data.device == '11:aa:22:bb:33:cc' &&
                          data.host &&
                          data.host == 'host01');
        }, callback);
      });

      afterEach(function(callback) {
        Application.DELETE('/api/leases/1.2.3.4', callback);
      });

    });

    it('should respond to POST /api/leases with an invalid address with 500 Internal Server Error', function(callback) {
      Application.isPOSTStatusCode('/api/leases', {
        'address': 'a.b.c.d',
        'device': '11:aa:22:bb:33:cc',
        'host': 'host01'
      }, 500, callback);
    });

    it('should respond to POST /api/leases with an invalid device with 500 Internal Server Error', function(callback) {
      Application.isPOSTStatusCode('/api/leases', {
        'address': '1.2.3.4',
        'device': '11:gg:22:hh:33:ii',
        'host': 'host01'
      }, 500, callback);
    });

    it('should respond to POST /api/leases with an invalid host with 500 Internal Server Error', function(callback) {
      Application.isPOSTStatusCode('/api/leases', {
        'address': '1.2.3.4',
        'device': '11:aa:22:bb:33:cc',
        'host': '@host01'
      }, 500, callback);
    });

  });

  describe('DELETE', function() {

    describe('Deleting the lease, etc.', function() {

      beforeEach(function(callback) {
        Application.POST('/api/leases', {
          'address': '1.2.3.4',
          'device': '11:aa:22:bb:33:cc',
          'host': 'host01'
        }, callback);
      });

      it('should respond to DELETE /api/leases/1.2.3.4 by deleting the static lease', function(callback) {
        Asynchronous.series([
          function(callback) {
            Application.DELETE('/api/leases/1.2.3.4', callback);
          },
          function(callback) {
            Database.openConnection(function(connection, callback) {
              Database.notExistsStaticLease(connection, '1.2.3.4', '11:aa:22:bb:33:cc', 'host01', callback);
            }, callback);
          }
        ], callback);
      });

      it('should respond to DELETE /api/leases/1.2.3.4 with 204 No Content', function(callback) {
        Application.isDELETEStatusCode('/api/leases/1.2.3.4', 204, callback);
      });

      it('should respond to DELETE /api/leases/1.2.3.4 by responding to later GET /api/leases/1.2.3.4/1970-01-01T00:00:00.000Z/1970-01-01T00:00:00.000Z with 404 Not Found', function(callback) {
        Asynchronous.waterfall([
          function(callback) {
            Application.DELETE('/api/leases/1.2.3.4', callback);
          },
          function(statusCode, headers, data, callback) {
            Application.isGETStatusCode('/api/leases/1.2.3.4/1970-01-01T00:00:00.000Z/1970-01-01T00:00:00.000Z', 404, callback);
          }
        ], callback);
      });

      it('should respond to DELETE /api/leases with 204 No Content', function(callback) {
        Application.isDELETEStatusCode('/api/leases', 204, callback);
      });

      it('should respond to DELETE /api/leases by deleting all leases', function(callback) {
        Asynchronous.series([
          function(callback) {
            Application.DELETE('/api/leases', callback);
          },
          function(callback) {
            Database.openConnection(function(connection, callback) {
              Database.notExistsLeases(connection, callback);
            }, callback);
          }
        ], callback);
      });

      afterEach(function(callback) {
        Application.DELETE('/api/leases/1.2.3.4', callback);
      });

    });

    it('should respond to DELETE /api/leases/a.b.c.d (an invalid address/lease) with 500 Internal Server Error', function(callback) {
      Application.isDELETEStatusCode('/api/leases/a.b.c.d', 500, callback);
    });

    it('should respond to DELETE /api/leases/2.3.4.5 (a non-existent lease) with 404 Not Found', function(callback) {
      Application.isDELETEStatusCode('/api/leases/22.33.44.55', 404, callback);
    });

  });

  // after(function(callback) {
  //   Asynchronous.series([
  //     function(callback) {
  //       Application.executeStop(callback);
  //     },
  //     function(callback) {
  //       Application.waitUntilNotReady(callback);
  //     },
  //     function(callback) {
  //       Application.executeUninstall(callback);
  //     }
  //   ], callback);
  // });

});

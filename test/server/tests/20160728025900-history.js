require('datejs');

var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../library/application');
var Database = require('../library/database');
var Log = require('../../../client/library/log');

describe('/api/history', function() {

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

    it('should respond to HEAD /api/range/history with 200 OK', function(callback) {
      Application.isHEADStatusCode('/api/range/history', 200, callback);
    });

    it('should respond to HEAD /api/history with 200 OK', function(callback) {
      Application.isHEADStatusCode('/api/history', 200, callback);
    });

  });

  describe('GET', function() {

    describe('w/o data', function() {

      it('should respond to GET /api/range/history on no data with default values', function(callback) {
        Application.isGET('/api/range/history', function(statusCode, headers, data, callback) {
          callback(null, data.numberOfSystemLeases == 0);
        }, callback);
      });

      it('should respond to GET /api/history with no data', function(callback) {
        Application.isGET('/api/history', function(statusCode, headers, data, callback) {
          callback(null,  data.length == 0);
        }, callback);
      });

    });

    describe('w/ data', function() {

      before(function(callback) {
        Asynchronous.series([
          function(callback) {
            Application.POST('/api/leases', {
              'address': '1.2.3.4',
              'from': Date.parse('yesterday').toISOString(),
              'to': Date.parse('today').toISOString(),
              'device': 'aa:11:bb:22:cc:33',
              'host': 'host01'
            }, callback);
          },
          function(callback) {
            Application.POST('/api/leases', {
              'address': '2.3.4.5',
              'from': Date.parse('today').toISOString(),
              'to': Date.parse('tomorrow').toISOString(),
              'device': 'aa:11:bb:22:cc:33',
              'host': 'host02'
            }, callback);
          }
        ], callback);
      });

      it('should respond to GET /api/range/history with the range', function(callback) {
        Application.isGET('/api/range/history', function(statusCode, headers, data, callback) {
          callback(null,  data.numberOfSystemLeases == 2 &&
                          Date.equals(Date.parse(data.minimumFrom), Date.parse('yesterday')) &&
                          Date.equals(Date.parse(data.maximumTo), Date.parse('tomorrow')));
        }, callback);
      });

      it('should respond to GET /api/history with the history', function(callback) {
        Application.isGET('/api/history', function(statusCode, headers, data, callback) {
          callback(null,  data.length == 2 &&
                          data[0].device == 'aa:11:bb:22:cc:33' &&
                          data[0].address == '1.2.3.4' &&
                          Date.equals(Date.parse(data[0].from), Date.parse('yesterday')) &&
                          Date.equals(Date.parse(data[0].to), Date.parse('today')) &&
                          data[0].host == 'host02' &&
                          data[1].device == 'aa:11:bb:22:cc:33' &&
                          data[1].address == '2.3.4.5' &&
                          Date.equals(Date.parse(data[1].from), Date.parse('today')) &&
                          Date.equals(Date.parse(data[1].to), Date.parse('tomorrow')) &&
                          data[1].host == 'host02');
        }, callback);
      });

      after(function(callback) {
        Asynchronous.series([
          function(callback) {
            Application.DELETE(
              Utilities.format(
                '/api/leases/%s/%s/%s',
                '1.2.3.4',
                Date.parse('yesterday').toISOString(),
                Date.parse('today').toISOString()
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
          }
        ], callback);
      });

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

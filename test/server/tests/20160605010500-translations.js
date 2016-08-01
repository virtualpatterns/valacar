var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../library/application');
var Database = require('../library/database');
var Log = require('../../../client/library/log');

describe('/api/translations', function() {

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

    it('should respond to HEAD /api/exists/translations with 200 OK', function(callback) {
      Application.isHEADStatusCode('/api/exists/translations', 200, callback);
    });

    it('should respond to HEAD /api/translations with 200 OK', function(callback) {
      Application.isHEADStatusCode('/api/translations', 200, callback);
    });

  });

  describe('GET', function() {

    it('should respond to GET /api/exists/translations/tv4622148de6a5 with true', function(callback) {
      Application.isGET('/api/exists/translations/tv4622148de6a5', function(statusCode, headers, data, callback) {
        callback(null, data.exists);
      }, callback);
    });

    it('should respond to GET /api/exists/translations/18:b4:30:21:c4:45 with true', function(callback) {
      Application.isGET('/api/exists/translations/18:b4:30:21:c4:45', function(statusCode, headers, data, callback) {
        callback(null, data.exists);
      }, callback);
    });

    it('should respond to GET /api/exists/translations/from01 (a non-existent translation) with false', function(callback) {
      Application.isGET('/api/exists/translations/from01', function(statusCode, headers, data, callback) {
        callback(null, !data.exists);
      }, callback);
    });

    it('should respond to GET /api/exists/translations/@from01 (an invalid translation) with false', function(callback) {
      Application.isGET('/api/exists/translations/@from01', function(statusCode, headers, data, callback) {
        callback(null, !data.exists);
      }, callback);
    });

    it('should respond to GET /api/translations with a translation from tv4622148de6a5 to (TV)', function(callback) {
      Application.isGET('/api/translations', function(statusCode, headers, data, callback) {
        callback(null, data.filter(function(translation) {
          return  translation.from == 'tv4622148de6a5' &&
                  translation.to == '(TV)';
        }).length > 0);
      }, callback);
    });

    it('should respond to GET /api/translations/tv4622148de6a5 with the translation from tv4622148de6a5 to (TV)', function(callback) {
      Application.isGET('/api/translations/tv4622148de6a5', function(statusCode, headers, data, callback) {
        callback(null,  data.from == 'tv4622148de6a5' &&
                        data.to == '(TV)');
      }, callback);
    });

    it('should respond to GET /api/translations/18:b4:30:21:c4:45	with the translation from 18:b4:30:21:c4:45 to (Nest Protect)', function(callback) {
      Application.isGET('/api/translations/18:b4:30:21:c4:45', function(statusCode, headers, data, callback) {
        callback(null,  data.from == '18:b4:30:21:c4:45' &&
                        data.to == '(Nest Protect)');
      }, callback);
    });

    it('should respond to GET /api/translations/from01 (a non-existent translation) with 404 Not Found', function(callback) {
      Application.isGETStatusCode('/api/translations/from01', 404, callback);
    });

    it('should respond to GET /api/translations/@from01 (an invalid translation) with 404 Not Found', function(callback) {
      Application.isGETStatusCode('/api/translations/@from01', 404, callback);
    });

  });

  describe('POST', function() {

    describe('Creating the translation', function() {

      before(function(callback) {
        Application.POST('/api/translations', {
          'from': 'from01',
          'to': 'to01'
        }, callback);
      });

      it('should respond to POST /api/translations by creating the translation', function(callback) {
        Database.openConnection(function(connection, callback) {
          Database.existsTranslation(connection, 'from01', 'to01', callback);
        }, callback);
      });

      after(function(callback) {
        Application.DELETE('/api/translations/from01', callback);
      });

    });

    describe('201 Created, etc.', function() {

      it('should respond to POST /api/translations with 201 Created', function(callback) {
        Application.isPOSTStatusCode('/api/translations', {
          'from': 'from01',
          'to': 'to01'
        }, 201, callback);
      });

      it('should respond to POST /api/translations with a Location header', function(callback) {
        Application.isPOST('/api/translations', {
          'from': 'from01',
          'to': 'to01'
        }, function(statusCode, headers, data, callback) {
          callback(null, !!headers.location);
        }, callback);
      });

      it('should respond to POST /api/translations with a URI for the created translation in a Location header', function(callback) {
        Application.isPOST('/api/translations', {
          'from': 'from01',
          'to': 'to01'
        }, function(statusCode, headers, data, callback) {
          Application.isGET(headers.location, function(statusCode, headers, data, callback) {
            callback(null,  data.from &&
                            data.from == 'from01' &&
                            data.to &&
                            data.to == 'to01');
          }, callback);
        }, callback);
      });

      it('should respond to POST /api/translations with the created translation', function(callback) {
        Application.isPOST('/api/translations', {
          'from': 'from01',
          'to': 'to01'
        }, function(statusCode, headers, data) {
          callback(null,  data.from &&
                          data.from == 'from01' &&
                          data.to &&
                          data.to == 'to01');
        }, callback);
      });

      afterEach(function(callback) {
        Application.DELETE('/api/translations/from01', callback);
      });

    });

    it('should respond to POST /api/translations with an invalid translation from with 500 Internal Server Error', function(callback) {
      Application.isPOSTStatusCode('/api/translations', {
        'from': '@from01',
        'to': 'to01'
      }, 500, callback);
    });

    it('should respond to POST /api/translations with an invalid translation to with 500 Internal Server Error', function(callback) {
      Application.isPOSTStatusCode('/api/translations', {
        'from': 'from01',
        'to': ''
      }, 500, callback);
    });

  });

  describe('DELETE', function() {

    describe('Deleting the translation, etc.', function() {

      beforeEach(function(callback) {
        Application.POST('/api/translations', {
          'from': 'from01',
          'to': 'to01'
        }, callback);
      });

      it('should respond to DELETE /api/translations/from01 by deleting the translation', function(callback) {
        Asynchronous.series([
          function(callback) {
            Application.DELETE('/api/translations/from01', callback);
          },
          function(callback) {
            Database.openConnection(function(connection, callback) {
              Database.notExistsTranslation(connection, 'from01', 'to01', callback);
            }, callback);
          }
        ], callback);
      });

      it('should respond to DELETE /api/translations/from01 with 204 No Content', function(callback) {
        Application.isDELETEStatusCode('/api/translations/from01', 204, callback);
      });

      it('should respond to DELETE /api/translations/from01 by responding to later GET /api/translations/from01 with 404 Not Found', function(callback) {
        Asynchronous.waterfall([
          function(callback) {
            Application.DELETE('/api/translations/from01', callback);
          },
          function(statusCode, headers, data, callback) {
            Application.isGETStatusCode('/api/translations/from01', 404, callback);
          }
        ], callback);
      });

      it('should respond to DELETE /api/translations with 204 No Content', function(callback) {
        Application.isDELETEStatusCode('/api/translations', 204, callback);
      });

      it('should respond to DELETE /api/translations by deleting all translations', function(callback) {
        Asynchronous.series([
          function(callback) {
            Application.DELETE('/api/translations', callback);
          },
          function(callback) {
            Database.openConnection(function(connection, callback) {
              Database.notExistsTranslations(connection, callback);
            }, callback);
          }
        ], callback);
      });

      afterEach(function(callback) {
        Application.DELETE('/api/translations/from01', callback);
      });

    });

    it('should respond to DELETE /api/translations/@from01 (an invalid translation) with 500 Internal Server Error', function(callback) {
      Application.isDELETEStatusCode('/api/translations/@from01', 500, callback);
    });

    it('should respond to DELETE /api/translations/from02 (a non-existent translation) with 404 Not Found', function(callback) {
      Application.isDELETEStatusCode('/api/translations/from02', 404, callback);
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

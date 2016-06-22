

var Asynchronous = require('async');
var HTTP = require('http');
var Utilities = require('util');

var Application = require('../library/application');
var Database = require('../library/database');
var Log = require('../../../client/library/log');

describe('HEAD /api/translations', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeStart(callback);
      },
      function(callback) {
        Application.waitUntilReady(callback);
      }
    ], callback);
  });

  it('should respond to HEAD /api/translations with 200 OK', function(callback) {
    Application.isHEADStatusCode('/api/translations', 200, callback);
  });

  after(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeStop(callback);
      },
      function(callback) {
        Application.waitUntilNotReady(callback);
      },
      function(callback) {
        Application.executeUninstall(callback);
      }
    ], callback);
  });

});

describe('GET /api/translations', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeStart(callback);
      },
      function(callback) {
        Application.waitUntilReady(callback);
      }
    ], callback);
  });

  it('should respond to GET /api/translations with a translation from tv4622148de6a5 to (TV)', function(callback) {
    Application.isGET('/api/translations', function(statusCode, headers, data, callback) {
      callback(null, data.filter(function(translation) {
        return  translation.from == 'tv4622148de6a5' &&
                translation.to == '(TV)';
      }));
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

  after(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeStop(callback);
      },
      function(callback) {
        Application.waitUntilNotReady(callback);
      },
      function(callback) {
        Application.executeUninstall(callback);
      }
    ], callback);
  });

});

describe('POST /api/translations', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeStart(callback);
      },
      function(callback) {
        Application.waitUntilReady(callback);
      }
    ], callback);
  });

  it('should respond to POST /api/translations by creating the translation', function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.POST('/api/translations', {
          'from': 'from07',
          'to': 'to07'
        }, callback);
      },
      function(callback) {
        Database.openConnection(function(connection, callback) {
          Database.existsTranslation(connection, 'from07', 'to07', callback);
        }, callback);
      }
    ], callback);
  });

  it('should respond to POST /api/translations with 201 Created', function(callback) {
    Application.isPOSTStatusCode('/api/translations', {
      'from': 'from02',
      'to': 'to02'
    }, 201, callback);
  });

  it('should respond to POST /api/translations with an invalid translation with 500 Internal Server Error', function(callback) {
    Application.isPOSTStatusCode('/api/translations', {
      'from': '@from08',
      'to': 'to08'
    }, 500, callback);
  });

  it('should respond to POST /api/translations with a Location header', function(callback) {
    Application.isPOST('/api/translations', {
      'from': 'from03',
      'to': 'to03'
    }, function(statusCode, headers, data, callback) {
      callback(null, !!headers.location);
    }, callback);
  });

  it('should respond to POST /api/translations with a URI for the created translation in a Location header', function(callback) {
    Application.isPOST('/api/translations', {
      'from': 'from03',
      'to': 'to03'
    }, function(statusCode, headers, data, callback) {
      Application.isGET(headers.location, function(statusCode, headers, data, callback) {
        callback(null,  data.from &&
                        data.from == 'from03' &&
                        data.to &&
                        data.to == 'to03');
      }, callback);
    }, callback);
  });

  it('should respond to POST /api/translations with the created translation', function(callback) {
    Application.isPOST('/api/translations', {
      'from': 'from04',
      'to': 'to04'
    }, function(statusCode, headers, data) {
      callback(null,  data.from &&
                      data.from == 'from04' &&
                      data.to &&
                      data.to == 'to04');
    }, callback);
  });

  after(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeStop(callback);
      },
      function(callback) {
        Application.waitUntilNotReady(callback);
      },
      function(callback) {
        Application.executeUninstall(callback);
      }
    ], callback);
  });

});

describe('DELETE /api/translations', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeStart(callback);
      },
      function(callback) {
        Application.waitUntilReady(callback);
      }
    ], callback);
  });

  beforeEach(function(callback) {
    Application.POST('/api/translations', {
      'from': 'from05',
      'to': 'to05'
    }, callback);
  });

  it('should respond to DELETE /api/translations/from05 by deleting the translation', function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.DELETE('/api/translations/from05', callback);
      },
      function(callback) {
        Database.openConnection(function(connection, callback) {
          Database.notExistsTranslation(connection, 'from05', 'to05', callback);
        }, callback);
      }
    ], callback);
  });

  it('should respond to DELETE /api/translations/from05 with 204 No Content', function(callback) {
    Application.isDELETEStatusCode('/api/translations/from05', 204, callback);
  });

  it('should respond to DELETE /api/translations@from09 (an invalid translation) with 500 Internal Server Error', function(callback) {
    Application.isDELETEStatusCode('/api/translations/@from09', 500, callback);
  });

  it('should respond to DELETE /api/translations/from06 (a non-existent translation) with 404 Not Found', function(callback) {
    Application.isDELETEStatusCode('/api/translations/from06', 404, callback);
  });

  it('should respond to DELETE /api/translations/from05 by responding to later GET /api/translations/from05 with 404 Not Found', function(callback) {
    Asynchronous.waterfall([
      function(callback) {
        Application.DELETE('/api/translations/from05', callback);
      },
      function(statusCode, headers, data, callback) {
        Application.isGETStatusCode('/api/translations/from05', 404, callback);
      }
    ], callback);
  });

  afterEach(function(callback) {
    Application.DELETE('/api/translations/from05', callback);
  });

  after(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeStop(callback);
      },
      function(callback) {
        Application.waitUntilNotReady(callback);
      },
      function(callback) {
        Application.executeUninstall(callback);
      }
    ], callback);
  });

});

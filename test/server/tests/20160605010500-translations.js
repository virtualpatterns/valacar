'use strict';

const Asynchronous = require('async');
const HTTP = require('http');
const Utilities = require('util');

const Application = require('../library/application');
const Database = require('../library/database');
const Log = require('../../../library/log');

describe('GET /translations', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeStart(callback);
      },
      function(callback) {
        Application.waitReady(callback);
      }
    ], callback);
  });

  it('should respond to GET /translations with a translation from tv4622148de6a5 to (TV)', function(callback) {
    Application.isGET('/translations', function(statusCode, headers, data, callback) {
      callback(null, data.filter(function(translation) {
        return  translation.from == 'tv4622148de6a5' &&
                translation.to == '(TV)';
      }));
    }, callback);
  });

  it('should respond to GET /translations/tv4622148de6a5 with the translation from tv4622148de6a5 to (TV)', function(callback) {
    Application.isGET('/translations/tv4622148de6a5', function(statusCode, headers, data, callback) {
      callback(null,  data.from == 'tv4622148de6a5' &&
                      data.to == '(TV)');
    }, callback);
  });

  it('should respond to GET /translations/from01 (a non-existent translation) with 404 Not Found', function(callback) {
    Application.isGETStatusCode('/translations/from01', 404, callback);
  });

  after(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeStop(callback);
      },
      function(callback) {
        Application.waitNotReady(callback);
      },
      function(callback) {
        Application.executeUninstall(callback);
      }
    ], callback);
  });

});

describe('POST /translations', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeStart(callback);
      },
      function(callback) {
        Application.waitReady(callback);
      }
    ], callback);
  });

  it('should respond to POST /translations by creating the translation', function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.POST('/translations', {
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

  it('should respond to POST /translations with 201 Created', function(callback) {
    Application.isPOSTStatusCode('/translations', {
      'from': 'from02',
      'to': 'to02'
    }, 201, callback);
  });

  it('should respond to POST /translations with an invalid translation with 500 Internal Server Error', function(callback) {
    Application.isPOSTStatusCode('/translations', {
      'from': '@from08',
      'to': 'to08'
    }, 500, callback);
  });

  it('should respond to POST /translations with a Location header', function(callback) {
    Application.isPOST('/translations', {
      'from': 'from03',
      'to': 'to03'
    }, function(statusCode, headers, data, callback) {
      callback(null, !!headers.location);
    }, callback);
  });

  it('should respond to POST /translations with a URI for the created translation in a Location header', function(callback) {
    Application.isPOST('/translations', {
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

  it('should respond to POST /translations with the created translation', function(callback) {
    Application.isPOST('/translations', {
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
        Application.waitNotReady(callback);
      },
      function(callback) {
        Application.executeUninstall(callback);
      }
    ], callback);
  });

});

describe('DELETE /translations', function() {

  before(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeInstall(callback);
      },
      function(callback) {
        Application.executeStart(callback);
      },
      function(callback) {
        Application.waitReady(callback);
      }
    ], callback);
  });

  beforeEach(function(callback) {
    Application.POST('/translations', {
      'from': 'from05',
      'to': 'to05'
    }, callback);
  });

  it('should respond to DELETE /translations/from05 by deleting the translation', function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.DELETE('/translations/from05', callback);
      },
      function(callback) {
        Database.openConnection(function(connection, callback) {
          Database.notExistsTranslation(connection, 'from05', 'to05', callback);
        }, callback);
      }
    ], callback);
  });

  it('should respond to DELETE /translations/from05 with 200 OK', function(callback) {
    Application.isDELETEStatusCode('/translations/from05', 200, callback);
  });

  it('should respond to DELETE /translations@from09 (an invalid translation) with 500 Internal Server Error', function(callback) {
    Application.isDELETEStatusCode('/translations/@from09', 500, callback);
  });

  it('should respond to DELETE /translations/from06 (a non-existent translation) with 404 Not Found', function(callback) {
    Application.isDELETEStatusCode('/translations/from06', 404, callback);
  });

  it('should respond to DELETE /translations/from05 by responding to later GET /translations/from05 with 404 Not Found', function(callback) {
    Asynchronous.waterfall([
      function(callback) {
        Application.DELETE('/translations/from05', callback);
      },
      function(statusCode, headers, data, callback) {
        Application.isGETStatusCode('/translations/from05', 404, callback);
      }
    ], callback);
  });

  afterEach(function(callback) {
    Application.DELETE('/translations/from05', callback);
  });

  after(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeStop(callback);
      },
      function(callback) {
        Application.waitNotReady(callback);
      },
      function(callback) {
        Application.executeUninstall(callback);
      }
    ], callback);
  });

});

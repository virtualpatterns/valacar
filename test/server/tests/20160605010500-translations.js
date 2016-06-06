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
      }
    ], callback);
  });

  it('should respond to GET /translations with a translation from tv4622148de6a5 to (TV)', function(callback) {
    Application.GET('/translations', function(error, statusCode, headers, data) {
      if (error)
        callback(error);
      else {

        let translation = data.query('translations', 'translations[from=tv4622148de6a5 & to=(TV)]');

        if (!translation)
          callback(new Error('The server response did not include a translation from tv4622148de6a5 to (TV).'));
        else
          callback(null);
      }
    });
  });

  it('should respond to GET /translations/tv4622148de6a5 with the translation from tv4622148de6a5 to (TV)', function(callback) {
    Application.GET('/translations/tv4622148de6a5', function(error, statusCode, headers, data) {
      if (error)
        callback(error);
      else if ( data.from != 'tv4622148de6a5' ||
                data.to != '(TV)')
        callback(new Error('The server response is not the translation from tv4622148de6a5 to (TV).'));
      else
        callback(null);
    });
  });

  it('should respond to GET /translations/from01 (a non-existent translation) with 404 Not Found', function(callback) {
    Application.isGET('/translations/from01', 404, callback);
  });

  after(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeStop(callback);
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
    Application.isPOST('/translations', {
      'from': 'from02',
      'to': 'to02'
    }, 201, callback);
  });

  it('should respond to POST /translations with an invalid translation with 500 Internal Server Error', function(callback) {
    Application.isPOST('/translations', {
      'from': '@from08',
      'to': 'to08'
    }, 500, callback);
  });

  it('should respond to POST /translations with a URI for the created translation in a Location header', function(callback) {
    Application.POST('/translations', {
      'from': 'from03',
      'to': 'to03'
    }, function(error, statusCode, headers, data) {
      if (error)
        callback(error);
      else if (!headers.location)
        callback(new Error('The server response does not contain a Location header.'));
      else
        Application.GET(headers.location, function(error, statusCode, headers, data) {
          if (error)
            callback(error);
          else if ( data.from != 'from03' ||
                    data.to != 'to03')
            callback(new Error('The Location header is not a URI for the created translation.'));
          else
            callback(null);
        });
    });
  });

  it('should respond to POST /translations with the created translation', function(callback) {
    Application.POST('/translations', {
      'from': 'from04',
      'to': 'to04'
    }, function(error, statusCode, headers, data) {
      if (error)
        callback(error);
      else if ( data.from != 'from04' ||
                data.to != 'to04')
        callback(new Error('The server response is not the created translation.'));
      else
        callback(null);
    });
  });

  after(function(callback) {
    Asynchronous.series([
      function(callback) {
        Application.executeStop(callback);
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
    Application.isDELETE('/translations/from05', 200, callback);
  });

  it('should respond to DELETE /translations/from06 (a non-existent translation) with 404 Not Found', function(callback) {
    Application.isDELETE('/translations/from06', 404, callback);
  });

  it('should respond to DELETE /translations/from05 by responding to later GET /translations/from05 with 404 Not Found', function(callback) {
    Asynchronous.waterfall([
      function(callback) {
        Application.DELETE('/translations/from05', callback);
      },
      function(statusCode, headers, data, callback) {
        Application.isGET('/translations/from05', 404, callback);
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
        Application.executeUninstall(callback);
      }
    ], callback);
  });

});

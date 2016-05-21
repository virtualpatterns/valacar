'use strict';

const Application = require('tests/library/application');
const Database = require('tests/library/database');
const Test = require('test');

describe('Command.command("install [databasePath]")', function() {
  this.timeout(Test.TIMEOUT);

  before(function(callback) {
    Application.executeInstall(callback);
    // callback(null);
  });

  it('should have created the tMigration table', function (callback) {
    Database.openConnection(function(connection, callback) {
        Database.existsTable(connection, 'tMigration', callback);
    }, callback);
  });

  it('should have created the tVersion table', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsTable(connection, 'tVersion', callback);
    }, callback);
  });

  it('should have created the tLease table', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsTable(connection, 'tLease', callback);
    }, callback);
  });

  it('should have added the static lease for BUCKBEAK', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.101', 'c8:2a:14:57:bb:1b', 'BUCKBEAK', callback);
    }, callback);
  });

  it('should have added the static lease for LOVEGOOD', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.100', '00:22:68:0e:3c:b3', 'LOVEGOOD', callback);
    }, callback);
  });

  it('should have added the static lease for PIGWIDGEON', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.2', '00:1c:23:b3:07:f6', 'PIGWIDGEON', callback);
    }, callback);
  });

  it('should have added the static lease for JORKINS', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.201', '08:00:27:66:5c:05', 'JORKINS', callback);
    }, callback);
  });

  it('should have added the static lease for VANCE', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsStaticLease(connection, '192.168.2.200', '08:00:27:08:67:43', 'VANCE', callback);
    }, callback);
  });

  it('should have created the tTranslation table', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsTable(connection, 'tTranslation', callback);
    }, callback);
  });

  it('should have added the translation for JeffStetsiPhone', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsTranslation(connection, 'JeffStetsiPhone', '(Jeffy\'s iPhone)', callback);
    }, callback);
  });

  it('should have added the translation for 02AA01AB44120TQ1', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsTranslation(connection, '02AA01AB44120TQ1', '(Nest)', callback);
    }, callback);
  });

  it('should have added the translation for 18:b4:30:21:c4:45', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsTranslation(connection, '18:b4:30:21:c4:45', '(Nest Protect)', callback);
    }, callback);
  });

  it('should have added the translation for aragog', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsTranslation(connection, 'aragog', '(Bell Connection Hub)', callback);
    }, callback);
  });

  it('should have added the translation for FLITWICK.local', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsTranslation(connection, 'FLITWICK.local', 'FLITWICK', callback);
    }, callback);
  });

  it('should have added the translation for Jefs-iPad', function (callback) {
    Database.openConnection(function(connection, callback) {
      Database.existsTranslation(connection, 'Jefs-iPad', '(Jeffy\'s iPad)', callback);
    }, callback);
  });

  after(function(callback) {
    Application.executeUninstall(callback);
    // callback(null);
  });

});

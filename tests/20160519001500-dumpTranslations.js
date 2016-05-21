'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('tests/library/application');
const Database = require('tests/library/database');
const Test = require('test');

describe('Command.command("dumpTranslations [databasePath]")', function() {
  this.timeout(Test.TIMEOUT);

  before(function(callback) {
    Application.executeInstall(callback);
  });

  it('should output the translation for 02AA01AB44120TQ1', function (callback) {
    Application.executeDumpTranslations(function(error, stdout, stderr) {
      if (error)
        callback(error);
      else if (!(new RegExp('^.*02AA01AB44120TQ1.*$', 'm').test(stdout)) &&
               !(new RegExp('^.*\(Nest\).*$', 'm').test(stdout)))
        callback(new Error('The translation for 02AA01AB44120TQ1 is not part of the output.'));
      else
        callback(null);
    });
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

'use strict';

const Asynchronous = require('async');
const Utilities = require('util');

const Application = require('tests/library/application');
const Database = require('tests/library/database');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');

const DATABASE_PATH = Path.join(Process.cwd(), 'process', 'data', Utilities.format('%s.%s.%s', Package.name, 'dumpTranslations', 'db'));
const DATABASE_OPTIONS = {
  'enableTrace': true,
  'enableProfile': false
};

describe('Command.command("dumpTranslations [databasePath]")', function() {

  before(function(callback) {
    Application.executeInstall(DATABASE_PATH, callback);
  });

  it('should output the translation for 02AA01AB44120TQ1', function (callback) {
    Application.executeDumpTranslations(DATABASE_PATH, function(error, stdout, stderr) {
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
    Application.executeUninstall(DATABASE_PATH, callback);
  });

});

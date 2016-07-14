

var Asynchronous = require('async');
var Utilities = require('util');

var Application = require('../library/application');
var Database = require('../library/database');

var REGEXP_02AA01AB44120TQ1 = /.*02AA01AB44120TQ1.*/m;
var REGEXP_NEST = /.*\(Nest\).*/m;

describe('Command.command("dumpTranslations [databasePath]")', function() {

  before(function(callback) {
    Application.executeInstall(callback);
  });

  it('should output the translation for 02AA01AB44120TQ1', function(callback) {
    Application.executeDumpTranslations(function(error, stdout, stderr) {
      if (error)
        callback(error);
      else if (!REGEXP_02AA01AB44120TQ1.test(stdout) &&
               !REGEXP_NEST.test(stdout))
        callback(new Error('The translation for 02AA01AB44120TQ1 is not part of the output.'));
      else
        callback(null);
    });
  });

  after(function(callback) {
    Application.executeUninstall(callback);
  });

});

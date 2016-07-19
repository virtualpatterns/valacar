var Jake = jake;

var Path = require('../../../client/library/path');
var Task = require('../../library/task');

var RESOURCES_PATH = Path.join(__dirname, Path.basename(__filename, '.js'), 'resources');

namespace('www', function() {

  desc('Run filtered tests');
  task('filter', ['log', 'clean:test:server:www'], {'async': true}, function (filter) {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha-phantomjs --grep %j \
                            --hooks %j \
                            --ignore-resource-errors \
                            http://localhost:31470/www/test.html',  filter || '',
                                                                    Path.join(RESOURCES_PATH, 'hooks.js'),
                                                                    Task.OPTIONS_STDIO_INHERIT)
      .add('mocha-phantomjs --grep %j \
                            --hooks %j \
                            --ignore-resource-errors \
                            http://localhost:31470/www/test.min.html',  filter || '',
                                                                        Path.join(RESOURCES_PATH, 'hooks.js'),
                                                                        Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  desc('Run DefaultPage tests');
  task('default', ['log'], function () {
    Jake.Task['test:server:www:filter'].invoke('DefaultPage');
  });

  desc('Run TranslationsPage tests');
  task('translations', ['log'], function () {
    Jake.Task['test:server:www:filter'].invoke('TranslationsPage');
  });

  desc('Run TranslationPage tests');
  task('translation', ['log'], function () {
    Jake.Task['test:server:www:filter'].invoke('TranslationPage');
  });

  desc('Run LeasesPage tests');
  task('leases', ['log'], function () {
    Jake.Task['test:server:www:filter'].invoke('LeasesPage');
  });

  desc('Run LeasePage tests');
  task('lease', ['log'], function () {
    Jake.Task['test:server:www:filter'].invoke('LeasePage');
  });

});

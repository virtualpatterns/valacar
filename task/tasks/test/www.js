var Task = require('../../library/task');

namespace('www', function() {

  desc('Run DefaultPage tests');
  task('default', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha-phantomjs --ignore-resource-errors \
                            http://localhost:31470/www/test.html?grep=DefaultPage', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  desc('Run TranslationsPage tests');
  task('translations', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha-phantomjs --ignore-resource-errors \
                            http://localhost:31470/www/test.html?grep=TranslationsPage', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  desc('Run TranslationPage tests');
  task('translation', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha-phantomjs --ignore-resource-errors \
                            http://localhost:31470/www/test.html?grep=TranslationPage', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  desc('Run LeasesPage tests');
  task('leases', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha-phantomjs --ignore-resource-errors \
                            http://localhost:31470/www/test.html?grep=LeasesPage', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  desc('Run LeasePage tests');
  task('lease', ['log'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha-phantomjs --ignore-resource-errors \
                            http://localhost:31470/www/test.html?grep=LeasePage', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

});

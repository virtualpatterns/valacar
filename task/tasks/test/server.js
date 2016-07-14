

var Task = require('../../library/task');

namespace('server', function() {

  desc('Run start tests');
  task('start', ['log', 'clean:test:server'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha --timeout 0 \
                  test/server/tests/00000000000000-begin.js \
                  test/server/tests/20160603231000-start.js \
                  test/server/tests/99999999999999-end.js', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  desc('Run start/stop tests');
  task('stop', ['log', 'clean:test:server'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha --timeout 0 \
                  test/server/tests/00000000000000-begin.js \
                  test/server/tests/20160603231000-start.js \
                  test/server/tests/20160604224200-stop.js \
                  test/server/tests/99999999999999-end.js', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  desc('Run /api/status tests');
  task('status', ['log', 'clean:test:server'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha --timeout 0 \
                  test/server/tests/00000000000000-begin.js \
                  test/server/tests/20160610163500-status.js \
                  test/server/tests/99999999999999-end.js', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  desc('Run /api/translations tests');
  task('translations', ['log', 'clean:test:server'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha --timeout 0 \
                  test/server/tests/00000000000000-begin.js \
                  test/server/tests/20160605010500-translations.js \
                  test/server/tests/99999999999999-end.js', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  desc('Run /api/leases tests');
  task('leases', ['log', 'clean:test:server'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha --timeout 0 \
                  test/server/tests/00000000000000-begin.js \
                  test/server/tests/20160630010900-leases.js \
                  test/server/tests/99999999999999-end.js', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  // desc('Run /www/test.html tests');
  // task('www', ['log', 'clean:test:server'], {'async': true}, function () {
  //   Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
  //     .add('mocha-phantomjs --timeout 0 \
  //                           http://localhost:31470/www/test.html', Task.OPTIONS_STDIO_INHERIT)
  //     .execute(complete, fail);
  // });

});



var Task = require('../../library/task');

namespace('server', function() {
      
  desc('Run start tests');
  task('start', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha --require test/index.js \
                  --timeout 0 \
                  test/server/tests/00000000000000-begin.js \
                  test/server/tests/20160603231000-start.js \
                  test/server/tests/99999999999999-end.js', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  desc('Run start/stop tests');
  task('stop', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha --require test/index.js \
                  --timeout 0 \
                  test/server/tests/00000000000000-begin.js \
                  test/server/tests/20160603231000-start.js \
                  test/server/tests/20160604224200-stop.js \
                  test/server/tests/99999999999999-end.js', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  desc('Run /api/status tests');
  task('status', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha --require test/index.js \
                  --timeout 0 \
                  test/server/tests/00000000000000-begin.js \
                  test/server/tests/20160610163500-status.js \
                  test/server/tests/99999999999999-end.js', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  desc('Run /api/translations tests');
  task('translations', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha --require test/index.js \
                  --timeout 0 \
                  test/server/tests/00000000000000-begin.js \
                  test/server/tests/20160605010500-translations.js \
                  test/server/tests/99999999999999-end.js', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  desc('Run /www tests');
  task('static', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha --require test/index.js \
                  --timeout 0 \
                  test/server/tests/00000000000000-begin.js \
                  test/server/tests/20160610155200-static.js \
                  test/server/tests/99999999999999-end.js', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

});

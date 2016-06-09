'use strict';

const Task = require('../../library/task');

namespace('api-server', function() {

  desc('Run start tests');
  task('start', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  --timeout 0 \
                  test/api-server/tests/00000000000000-begin.js \
                  test/api-server/tests/20160603231000-start.js \
                  test/api-server/tests/99999999999999-end.js')
      .execute(complete, fail);
  });

  desc('Run start/stop tests');
  task('stop', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  --timeout 0 \
                  test/api-server/tests/00000000000000-begin.js \
                  test/api-server/tests/20160603231000-start.js \
                  test/api-server/tests/20160604224200-stop.js \
                  test/api-server/tests/99999999999999-end.js')
      .execute(complete, fail);
  });

  desc('Run / tests');
  task('default', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  --timeout 0 \
                  test/api-server/tests/00000000000000-begin.js \
                  test/api-server/tests/20160605001200-default.js \
                  test/api-server/tests/99999999999999-end.js')
      .execute(complete, fail);
  });

  desc('Run /translations tests');
  task('translations', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  --timeout 0 \
                  test/api-server/tests/00000000000000-begin.js \
                  test/api-server/tests/20160605010500-translations.js \
                  test/api-server/tests/99999999999999-end.js')
      .execute(complete, fail);
  });

});

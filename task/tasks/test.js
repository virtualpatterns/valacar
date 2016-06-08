'use strict';

const Path = require('../../library/path');
const Process = require('../../library/process');
const Task = require('../library/task');

namespace('test', function() {

  desc('Run all application and server tests');
  task('both', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  test/tests')
      .add('mocha --require test/index.js \
                  --timeout 0 \
                  test/server/tests')
      .execute(complete, fail);
  });

  desc('Run all application tests');
  task('all', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  test/tests')
      .execute(complete, fail);
  });

  desc('Run task tests');
  task('task', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  test/tests/00000000000000-begin.js \
                  test/tests/20160525110900-task.js \
                  test/tests/99999999999999-end.js')
      .execute(complete, fail);
  });

  desc('Run install tests');
  task('install', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  test/tests/00000000000000-begin.js \
                  test/tests/00000000000001-install.js \
                  test/tests/99999999999999-end.js')
      .execute(complete, fail);
  });

  desc('Run install/uninstall tests');
  task('uninstall', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  test/tests/00000000000000-begin.js \
                  test/tests/00000000000001-install.js \
                  test/tests/00000000000002-uninstall.js \
                  test/tests/99999999999999-end.js')
      .execute(complete, fail);
  });

  desc('Run translation tests');
  task('translation', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  test/tests/00000000000000-begin.js \
                  test/tests/00000000000001-install.js \
                  test/tests/00000000000002-uninstall.js \
                  test/tests/00000000000007-addTranslation.js \
                  test/tests/00000000000008-removeTranslation.js \
                  test/tests/20160519001500-dumpTranslations.js \
                  test/tests/99999999999999-end.js')
      .execute(complete, fail);
  });

  desc('Run leases tests');
  task('leases', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  test/tests/00000000000000-begin.js \
                  test/tests/00000000000000-begin.js \
                  test/tests/00000000000001-install.js \
                  test/tests/00000000000002-uninstall.js \
                  test/tests/00000000000005-addLease.js \
                  test/tests/00000000000006-removeLease.js \
                  test/tests/20160518103000-dumpLeases.js \
                  test/tests/99999999999999-end.js')
      .execute(complete, fail);
  });

  namespace('server', function() {

    desc('Run all server tests');
    task('all', ['clean', 'log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .add('mocha --require test/index.js \
                    --timeout 0 \
                    test/server/tests')
        .execute(complete, fail);
    });

    desc('Run start tests');
    task('start', ['clean', 'log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .add('mocha --require test/index.js \
                    --timeout 0 \
                    test/server/tests/00000000000000-begin.js \
                    test/server/tests/20160603231000-start.js \
                    test/server/tests/99999999999999-end.js')
        .execute(complete, fail);
    });

    desc('Run start/stop tests');
    task('stop', ['clean', 'log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .add('mocha --require test/index.js \
                    --timeout 0 \
                    test/server/tests/00000000000000-begin.js \
                    test/server/tests/20160603231000-start.js \
                    test/server/tests/20160604224200-stop.js \
                    test/server/tests/99999999999999-end.js')
        .execute(complete, fail);
    });

    desc('Run / tests');
    task('default', ['clean', 'log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .add('mocha --require test/index.js \
                    --timeout 0 \
                    test/server/tests/00000000000000-begin.js \
                    test/server/tests/20160605001200-default.js \
                    test/server/tests/99999999999999-end.js')
        .execute(complete, fail);
    });

    desc('Run /translations tests');
    task('translations', ['clean', 'log'], {'async': true}, function () {
      Task.createTask(this.fullName)
        .add('mocha --require test/index.js \
                    --timeout 0 \
                    test/server/tests/00000000000000-begin.js \
                    test/server/tests/20160605010500-translations.js \
                    test/server/tests/99999999999999-end.js')
        .execute(complete, fail);
    });

  });

});

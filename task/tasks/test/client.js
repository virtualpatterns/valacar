'use strict';

const Task = require('../../library/task');

namespace('client', function() {

  desc('Run task tests');
  task('task', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  test/client/tests/00000000000000-begin.js \
                  test/client/tests/20160525110900-task.js \
                  test/client/tests/99999999999999-end.js')
      .execute(complete, fail);
  });

  desc('Run install tests');
  task('install', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  test/client/tests/00000000000000-begin.js \
                  test/client/tests/00000000000001-install.js \
                  test/client/tests/99999999999999-end.js')
      .execute(complete, fail);
  });

  desc('Run install/uninstall tests');
  task('uninstall', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  test/client/tests/00000000000000-begin.js \
                  test/client/tests/00000000000001-install.js \
                  test/client/tests/00000000000002-uninstall.js \
                  test/client/tests/99999999999999-end.js')
      .execute(complete, fail);
  });

  desc('Run translation tests');
  task('translation', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  test/client/tests/00000000000000-begin.js \
                  test/client/tests/00000000000001-install.js \
                  test/client/tests/00000000000002-uninstall.js \
                  test/client/tests/00000000000007-addTranslation.js \
                  test/client/tests/00000000000008-removeTranslation.js \
                  test/client/tests/20160519001500-dumpTranslations.js \
                  test/client/tests/99999999999999-end.js')
      .execute(complete, fail);
  });

  desc('Run leases tests');
  task('leases', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  test/client/tests/00000000000000-begin.js \
                  test/client/tests/00000000000000-begin.js \
                  test/client/tests/00000000000001-install.js \
                  test/client/tests/00000000000002-uninstall.js \
                  test/client/tests/00000000000005-addLease.js \
                  test/client/tests/00000000000006-removeLease.js \
                  test/client/tests/20160518103000-dumpLeases.js \
                  test/client/tests/99999999999999-end.js')
      .execute(complete, fail);
  });

});

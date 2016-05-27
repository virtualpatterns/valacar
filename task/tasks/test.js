'use strict';

const Task = require('../library/task');

namespace('test', function() {

  desc('Run all tests');
  task('all', ['log'], function () {
    Task.createTask(this.name)
      .add('mocha --require test/index.js \
                  test/tests')
      .execute(complete, fail);
  });

  desc('Run task tests');
  task('task', ['log'], function () {
    Task.createTask(this.name)
      .add('mocha --require test/index.js \
                  test/tests/00000000000000-begin.js \
                  test/tests/20160525110900-task.js')
      .execute(complete, fail);
  });

  desc('Run install tests');
  task('install', ['log'], function () {
    Task.createTask(this.name)
      .add('mocha --require test/index.js \
                  test/tests/00000000000000-begin.js \
                  test/tests/00000000000001-install.js')
      .execute(complete, fail);
  });

  desc('Run install/uninstall tests');
  task('uninstall', ['log'], function () {
    Task.createTask(this.name)
      .add('mocha --require test/index.js \
                  test/tests/00000000000000-begin.js \
                  test/tests/00000000000001-install.js \
                  test/tests/00000000000002-uninstall.js')
      .execute(complete, fail);
  });

  desc('Run translation tests');
  task('translation', ['log'], function () {
    Task.createTask(this.name)
      .add('mocha --require test/index.js \
                  test/tests/00000000000000-begin.js \
                  test/tests/00000000000001-install.js \
                  test/tests/00000000000002-uninstall.js \
                  test/tests/00000000000007-addTranslation.js \
                  test/tests/00000000000008-removeTranslation.js \
                  test/tests/20160519001500-dumpTranslations.js')
      .execute(complete, fail);
  });

});

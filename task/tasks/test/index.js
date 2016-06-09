'use strict';

const Task = require('../../library/task');

namespace('test', function() {

  desc('Run all application tests');
  task('client', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  test/client/tests')
      .execute(complete, fail);
  });

  require('./client')

  desc('Run all API server tests');
  task('api-server', ['clean', 'log'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --require test/index.js \
                  --timeout 0 \
                  test/api-server/tests')
      .execute(complete, fail);
  });

  require('./api-server')

})

var Task = require('../library/task');

desc('Run all application and server tests');
task('test', ['log', 'clean:test'], {'async': true}, function () {
  Task.createTask(this.fullName)
    .add('mocha test/client/tests')
    .add('mocha --timeout 0 \
                test/server/tests')
    .execute(complete, fail);
});

namespace('test', function() {

  desc('Run all application tests');
  task('client', ['log', 'clean:test:client'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha test/client/tests')
      .execute(complete, fail);
  });

  require('./test/client')

  desc('Run all API server tests');
  task('server', ['log', 'clean:test:server'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --timeout 0 \
                  test/server/tests')
      .execute(complete, fail);
  });

  require('./test/server')

})

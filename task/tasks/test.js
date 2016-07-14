var Task = require('../library/task');

desc('Run all application and server tests');
task('test', ['log', 'clean:test'], {'async': true}, function () {
  Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
    .add('mocha test/client/tests', Task.OPTIONS_STDIO_INHERIT)
    .add('mocha --timeout 0 \
                test/server/tests', Task.OPTIONS_STDIO_INHERIT)
    .execute(complete, fail);
});

namespace('test', function() {

  desc('Run all application tests');
  task('client', ['log', 'clean:test:client'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha test/client/tests', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  require('./test/client')

  desc('Run all API server tests');
  task('server', ['log', 'clean:test:server'], {'async': true}, function () {
    Task.createTask(this.fullName, Task.OPTIONS_STDIO_IGNORE)
      .add('mocha --timeout 0 \
                  test/server/tests', Task.OPTIONS_STDIO_INHERIT)
      .execute(complete, fail);
  });

  require('./test/server')

})

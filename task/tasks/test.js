var Task = require('../library/task');

desc('Run all client and server tests');
task('test', ['log', 'clean:test', 'test:client', 'test:server'], {'async': true}, function () {
  Task.createTask(this.fullName)
    // .add('mocha test/client/tests')
    // .add('mocha --timeout 0 \
    //             test/server/tests')
    // .add('mocha-phantomjs --ignore-resource-errors \
    //                       http://dumbledore.local:31470/www/test.html')
    .execute(complete, fail);
});

namespace('test', function() {

  desc('Run all client tests');
  task('client', ['log', 'clean:test:client'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha test/client/tests')
      .execute(complete, fail);
  });

  require('./test/client')

  desc('Run all server tests');
  task('server', ['log', 'clean:test:server', 'test:server:www'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --timeout 0 \
                  test/server/tests')
      // .add('mocha-phantomjs --ignore-resource-errors \
      //                       http://dumbledore.local:31470/www/test.html')
      .execute(complete, fail);
  });

  require('./test/server')

})

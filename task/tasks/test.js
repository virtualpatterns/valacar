var Jake = jake;

var Asynchronous = require('async');

var Task = require('../library/task');

desc('Run all client and server tests');
task('test', ['log', 'clean:test'], {'async': true}, function () {

  Asynchronous.eachSeries([
    'test:client',
    'test:server',
    'test:www'
  ], function(taskName, callback) {
    var task = Jake.Task[taskName];
    task.addListener('complete', function () {
      callback(null);
    });
    task.addListener('error', function (error) {
      callback(error);
    });
    task.invoke();
  }, function(error) {
    if (error)
      fail(error);
    else
      complete()
  });

});

namespace('test', function() {

  // desc('Run all client and server tests');
  // task('both', ['log', 'clean:test:client', 'clean:test:server'], {'async': true}, function () {
  //   Task.createTask(this.fullName)
  //     .add('mocha --bail \
  //                 --timeout 0 \
  //                 test/client/tests \
  //                 test/server/tests')
  //     .execute(complete, fail);
  // });

  desc('Run all client tests');
  task('client', ['log', 'clean:test:client'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --bail \
                  --timeout 0 \
                  test/client/tests')
      .execute(complete, fail);
  });

  require('./test/client')

  desc('Run all server tests');
  task('server', ['log', 'clean:test:server'], {'async': true}, function () {
    Task.createTask(this.fullName)
      .add('mocha --bail \
                  --timeout 0 \
                  test/server/tests')
      .execute(complete, fail);
  });

  require('./test/server')

  // Leave it like this!
  desc('Run all www tests');
  task('www', ['log', 'clean:test:www'], {'async': true}, function () {

    var task = Jake.Task['test:www:filter'];
    task.addListener('complete', function () {
      complete();
    });
    task.addListener('error', function (error) {
      fail(error);
    });
    task.invoke();

  });

  require('./test/www')

})

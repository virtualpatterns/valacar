'use strict';

const Asynchronous = require('async');
const ChildProcess = require('child_process');
const Utilities = require('util');

const Modules = require('app-module-path/register');

const Log = require('library/log');

// desc('This is the default task.');
// task('default', function (params) {
//   console.log('This is the default task.');
// });
//
// desc('This task has prerequisites.');
// task('hasPrereqs', ['foo', 'bar', 'baz'], function (params) {
//   console.log('Ran some prereqs first.');
// });
//
// desc('This is an asynchronous task.');
// task('asyncTask', {async: true}, function () {
//   setTimeout(complete, 1000);
// });

desc('Push to development');
task('push', {
  'async': true
}, function () {
  Asynchronous.series([
    function(callback) {
      ChildProcess.exec('git checkout development', callback);
    },
    function(callback) {
      ChildProcess.exec('git pull origin development', callback);
    },
    function(callback) {
      ChildProcess.exec('git push origin development', callback);
    }
  ], complete);
});

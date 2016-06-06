'use strict';

require('../index');

const Utilities = require('util');

const FileSystemTask = require('./library/file-system-task');
const Log = require('../library/log');
const Package = require('../package.json');
const Path = require('../library/path');
const Process = require('../library/process');
const Task = require('./library/task');

const LOG_PATH = Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.jake.log', Package.name));
const RESOURCES_PATH = Path.join(__dirname, 'resources');

task('log', function () {
  Log.addFile(LOG_PATH);
});

task('clean', {'async': true}, function () {
  // Process.stdout.write(Utilities.format('Deleting contents of %j ... ', Path.join(Process.cwd(), 'process', 'log')));
  FileSystemTask.createTask(this.fullName)
    .removeFiles(Path.join(Process.cwd(), 'process', 'log'))
    .execute(function() {
      // Process.stdout.write('done.\n');
      complete();
    }, function(error) {
      // Process.stdout.write(Utilities.format('failed (%s).\n', error.message));
      fail(error);
    });
});

task('default', {'async': true}, function () {
  Task.createTask(this.fullName)
    .add('jake --tasks')
    .execute(complete, fail);
});

// desc 'Pull development, tag, push to development, and increment version'
// task :push do |task|
//   system("git checkout development; git pull origin development; git tag -a -m 'Tag #{Pike::VERSION}' '#{Pike::VERSION}'; git push --tags origin development")
//   version_file = File.join(Pike::ROOT, %w[lib pike version.rb])
//   Pike::VERSION =~ /(\d+)\.(\d+)\.(\d+)/
//   system("sed 's|[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*|#{$1}.#{$2}.#{$3.to_i + 1}|g' < '#{version_file}' > '#{version_file}.out'; rm '#{version_file}'; mv '#{version_file}.out' '#{version_file}'")
//   system("git commit --all --message='Version #{$1}.#{$2}.#{$3.to_i + 1}'")
// end

// desc('Push to production, release, and increment version');
// task('release', ['log'], function () {
//   Task.createTask(this.fullName)
//     .add('git checkout production')
//     .add('git pull origin production')
//     .add('git merge origin development')
  //     .add('git push origin production')
//     // .add('npm release')
//     .add('git checkout development')
//     .add('git status')
//     .execute(complete, fail);
// });

// desc 'Push to production, release, and increment version'
// task :release do |task|
//     system('git checkout production; git pull origin production; git merge origin/development; git push origin production; rake release; git checkout development')
//     version_file = File.join(RubyApp::ROOT, %w[version.rb])
//     RubyApp::VERSION =~ /(\d+)\.(\d+)\.(\d+)/
//     system("sed 's|[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*|#{$1}.#{$2}.#{$3.to_i + 1}|g' < '#{version_file}' > '#{version_file}.out'; rm '#{version_file}'; mv '#{version_file}.out' '#{version_file}'")
//     system("git commit --all --message=\'Version #{$1}.#{$2}.#{$3.to_i + 1}\'")
// end

require('./tasks/data')
require('./tasks/run')
require('./tasks/server')
require('./tasks/test')
require('./tasks/git')

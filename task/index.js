'use strict';

require('../index');

const Utilities = require('util');

const Log = require('library/log');
const Package = require('package.json');
const Path = require('library/path');
const Process = require('library/process');
const Task = require('task/library/task');

const LOG_PATH = Path.join(Process.cwd(), 'process', 'log', Utilities.format('%s.jake.log', Package.name));

task('default', function () {
  Task.createTask(this.name)
    .add('jake --tasks')
    .execute(complete, fail);
});

desc(Utilities.format('Log.addFile(%j)', Path.trim(LOG_PATH)));
task('log', function () {
  Log.addFile(LOG_PATH);
});

desc('Push to development');
task('push', ['log'], function (version) {
  Task.createTask(this.name)
    .add('mocha --require test/index.js test/tests')
    .add('git checkout development', Task.OPTIONS_STDIO_IGNORE)
    .add('git pull origin development', Task.OPTIONS_STDIO_IGNORE)
    .add('echo -n "Tagging v%s ... "', Package.version)
    .add('git tag --annotate "v%s" --message "Pushing v%s"', Package.version, Package.version, Task.OPTIONS_STDIO_IGNORE)
    .add('echo "done"')
    .add('git push origin development --tags', Task.OPTIONS_STDIO_IGNORE)
    .add('npm version %s --no-git-tag-version', version || 'prerelease', Task.OPTIONS_STDIO_IGNORE)
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
//   Task.createTask(this.name)
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

require('task/tasks/test')

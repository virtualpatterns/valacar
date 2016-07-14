var GitTask = require('../library/git-task');

namespace('git', function() {

  desc('Fail if there are any uncommitted or unstashed changes');
  task('is-dirty', ['log'], {'async': true}, function () {
    GitTask.createTask(this.fullName)
      .add('echo "The next step will fail if there are any uncommitted or unstashed changes."')
      .addIsDirty()
      .add('echo "All changes are committed or stashed."')
      .execute(complete, fail);
  });

  desc('Fail if there are any stashed changes');
  task('exists-stash', ['log'], {'async': true}, function () {
    GitTask.createTask(this.fullName)
      .add('echo "The next step will fail if there are any stashed changes."')
      .addExistsStash()
      .add('echo "The stash is empty."')
      .execute(complete, fail);
  });

  desc('Merge origin, test, increment version, commit/tag, push');
  task('push', ['log'], {'async': true}, function (version) {
    GitTask.createTask(this.fullName)
      .addIsDirty()
      .add('git checkout development', Task.OPTIONS_STDIO_IGNORE)
      .add('git pull origin development')
      .add('mocha --require test/index.js test/tests')
      .add('npm version %s --message "Creating v%s"', version || 'prerelease', '%s', Task.OPTIONS_STDIO_IGNORE)
      .add('git push origin development --tags', Task.OPTIONS_STDIO_IGNORE)
      .execute(complete, fail);
  });

  desc('Stage development');
  task('stage', ['log'], {'async': true}, function () {
    GitTask.createTask(this.fullName)
      .addIsDirty()
      .add('git checkout staging', Task.OPTIONS_STDIO_IGNORE)
      .add('git pull origin staging')
      .add('git merge development')
      .add('mocha --require test/index.js test/tests')
      .add('git push origin staging --tags', Task.OPTIONS_STDIO_IGNORE)
      .add('git checkout development', Task.OPTIONS_STDIO_IGNORE)
      .execute(complete, fail);
  });

  desc('Release staging');
  task('release', ['log'], {'async': true}, function () {
    GitTask.createTask(this.fullName)
      .addIsDirty()
      .add('git checkout staging', Task.OPTIONS_STDIO_IGNORE)
      .add('git pull origin staging')
      .add('git checkout production', Task.OPTIONS_STDIO_IGNORE)
      .add('git pull origin production')
      .add('git merge staging')
      .add('mocha --require test/index.js test/tests')
      .add('git push origin production --tags', Task.OPTIONS_STDIO_IGNORE)
      .add('npm publish', Task.OPTIONS_STDIO_IGNORE)
      .add('git checkout development', Task.OPTIONS_STDIO_IGNORE)
      .execute(complete, fail);
  });

});

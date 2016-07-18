var GitTask = require('../library/git-task');
var Task = require('../library/task');

namespace('git', function() {

  desc('Fail if there are any uncommitted or unstashed changes');
  task('is-dirty', ['log'], {'async': true}, function () {
    GitTask.createTask(this.fullName)
      .addIsDirty()
      .execute(complete, fail);
  });

  desc('Fail if there are any stashed changes');
  task('exists-stash', ['log'], {'async': true}, function () {
    GitTask.createTask(this.fullName)
      .addExistsStash()
      .execute(complete, fail);
  });

  desc('Merge origin, test, increment version, commit/tag, push');
  task('push', ['log', 'bundle:shrink'], {'async': true}, function (version) {
    GitTask.createTask(this.fullName)
      .addIsDirty()
      .add('git checkout development')
      .add('git pull origin development')
      .add('jake test')
      .add('npm version %s --message "Creating v%s"', version || 'prerelease', '%s')
      .add('git push origin development --tags')
      .execute(complete, fail);
  });

  desc('Stage development');
  task('stage', ['log'], {'async': true}, function () {
    GitTask.createTask(this.fullName)
      .addIsDirty()
      .add('git checkout staging')
      .add('git pull origin staging')
      .add('git merge development')
      .add('jake test')
      .add('git push origin staging --tags')
      .add('git checkout development')
      .execute(complete, fail);
  });

  desc('Release staging');
  task('release', ['log'], {'async': true}, function () {
    GitTask.createTask(this.fullName)
      .addIsDirty()
      .add('git checkout staging')
      .add('git pull origin staging')
      .add('git checkout production')
      .add('git pull origin production')
      .add('git merge staging')
      .add('jake test')
      .add('git push origin production --tags')
      .add('npm publish')
      .add('git checkout development')
      .execute(complete, fail);
  });

});

'use strict';

const GitTask = require('../library/git-task');

namespace('git', function() {

  desc('Fail if there are any uncommitted or unstashed changes');
  task('is-dirty', ['log'], function () {
    GitTask.createTask(this.fullName)
      .add('echo "The next step will fail if there are any uncommitted or unstashed changes."')
      .addIsDirty()
      .add('echo "All changes are committed or stashed."')
      .execute(complete, fail);
  });

  desc('Fail if there are any stashed changes');
  task('exists-stash', ['log'], function () {
    GitTask.createTask(this.fullName)
      .add('echo "The next step will fail if there are any stashed changes."')
      .addExistsStash()
      .add('echo "The stash is empty."')
      .execute(complete, fail);
  });

});

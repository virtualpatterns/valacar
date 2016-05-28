'use strict';

const Assert = require('assert');
const Asynchronous = require('async');
const FileSystem = require('fs');
const Package = require('../package.json');
const Utilities = require('util');

const Database = require('./database');
const Log = require('./log');
const Path = require('./path');

const RESOURCES_PATH = Path.join(__dirname, 'resources');
const MIGRATIONS_PATH = Path.join(__dirname, 'migrations');

const migrationPrototype = Object.create({});

migrationPrototype.preInstall = function(connection, callback) {

  let _this = this;

  Asynchronous.series([
    function(callback) {
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'delete-tmigration.sql'), {
        $Name: _this.name
      }, function(error) {
        if (!error)
          Assert.ok(this.changes <= 1, Utilities.format('The number of rows deleted from tMigration should be 0 or 1 but is instead %d.', this.changes));
        callback(error);
      });
    },
    function(callback) {
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tmigration.sql'), {
        $Name: _this.name,
        $Version: Package.version
      }, callback);
    }
  ], callback);

};

migrationPrototype.install = function(connection, callback) {
  callback();
};

migrationPrototype.postInstall = function(connection, callback) {
  Database.runFile(connection, Path.join(RESOURCES_PATH, 'update-tmigration-installed.sql'), {
    $Name: this.name
  }, function(error) {
    Assert.equal(this.changes, 1, Utilities.format('The number of rows updated in tMigration should be 1 but is instead %d.', this.changes));
    callback(error);
  });
};

migrationPrototype.preUninstall = function(connection, callback) {
  callback();
};

migrationPrototype.uninstall = function(connection, callback) {
  callback();
};

migrationPrototype.postUninstall = function(connection, callback) {
  Database.runFile(connection, Path.join(RESOURCES_PATH, 'update-tmigration-uninstalled.sql'), {
    $Name: this.name
  }, function(error) {
    Assert.equal(this.changes, 1, Utilities.format('The number of rows updated in tMigration should be 1 but is instead %d.', this.changes));
    callback(error);
  });
};

migrationPrototype.isInstalled = function(connection, callback) {
  Database.getFile(connection, Path.join(RESOURCES_PATH, 'select-tmigration-one.sql'), {
    $Name: this.name
  }, function(error, row) {
    if (error)
      callback(error);
    else
      callback(error, row == undefined ? false : true);
  });
};

const Migration = Object.create({});

Migration.createMigration = function(name, prototype) {

  let migration = Object.create(prototype || migrationPrototype);

  Object.defineProperty(migration, 'name', {
    'enumerable': true,
    'writable': false,
    'value': name
  });

  return migration;

};

Migration.isMigration = function(migration) {
  return migrationPrototype.isPrototypeOf(migration);
};

Migration.getMigrationPrototype = function() {
  return migrationPrototype;
};

Migration.install = function(connection, migration, callback) {

  Asynchronous.waterfall([
    function(callback) {
      migration.isInstalled(connection, callback);
    },
    function(isInstalled, callback) {

      if (isInstalled)
        callback();
      else
        Asynchronous.series([
          function(callback) {
            migration.preInstall(connection, callback);
          },
          function(callback) {
            migration.install(connection, callback);
          },
          function(callback) {
            migration.postInstall(connection, callback);
          }
        ], callback);

    }
  ], callback);

}

Migration.uninstall = function(connection, migration, callback) {

    Asynchronous.waterfall([
      function(callback) {
        migration.isInstalled(connection, callback);
      },
      function(isInstalled, callback) {

        if (isInstalled)
          Asynchronous.series([
            function(callback) {
              migration.preUninstall(connection, callback);
            },
            function(callback) {
              migration.uninstall(connection, callback);
            },
            function(callback) {
              migration.postUninstall(connection, callback);
            }
          ], callback);
        else
          callback();

      }
    ], callback);

}

Migration.installAll = function(connection, callback) {

  Asynchronous.waterfall([
    function(callback) {
      Log.info('> FileSystem.readdir(%j, callback)', Path.trim(Path.join(__dirname, 'migrations')));
      FileSystem.readdir(Path.join(__dirname, 'migrations'), callback);
    },
    function(fileNames, callback) {

      Asynchronous.eachSeries(fileNames, function(fileName, callback) {

        let filePath = Path.join(MIGRATIONS_PATH, fileName);

        Asynchronous.waterfall([
          function(callback) {
            Log.info('> FileSystem.stat(%j, callback)', Path.trim(filePath));
            FileSystem.stat(filePath, callback);
          },
          function(properties, callback) {

            if (properties.isFile()) {
              Log.info('> Migration.install(connection, require(%j), callback)', Path.trim(filePath));
              Migration.install(connection, require(filePath), callback);
            }
            else
              callback(null);

          }
        ], callback);

      }, callback);

    },
    function(callback) {
      Database.runFile(connection, Path.join(RESOURCES_PATH, 'insert-tversion.sql'), {
        $Value: Package.version
      }, callback);
    }
  ], callback);

}

Migration.uninstallAll = function(connection, callback) {

    Asynchronous.waterfall([
      function(callback) {
        Database.allFile(connection, Path.join(RESOURCES_PATH, 'select-tmigration-all.sql'), [], callback);
      },
      function(rows, callback) {
        Asynchronous.eachSeries(rows, function(row, callback) {
          Log.info('> Migration.uninstall(connection, require(%j), callback)', Path.trim(Path.join(MIGRATIONS_PATH, row.cName)));
          Migration.uninstall(connection, require(Path.join(MIGRATIONS_PATH, row.cName)), callback);
        }, callback);
      }
    ], callback);

};

module.exports = Migration;

#!/usr/bin/env node

'use strict';

const Command = require('commander');

const Modules = require('app-module-path/register');

const Package = require('package.json');

// "test": "./node_modules/.bin/mocha --require test.js",
// "push": "git checkout development && git pull origin development && git push origin development",
// "release": [
//   "",
//   ""
// ]

Command
  .version(Package.version);
  .command('test');

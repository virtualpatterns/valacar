'use strict';

const Directory = require('mkdirp');
const _FileSystem = require('fs');

const FileSystem = Object.create(_FileSystem);

FileSystem.mkdirp = Directory;

module.exports = FileSystem;

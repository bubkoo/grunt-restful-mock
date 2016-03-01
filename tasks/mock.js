/*
 *     __  __  ___   ____ _  __
 *    |  \/  |/ _ \ / ___| |/ /
 *    | |\/| | | | | |   | ' /
 *    | |  | | |_| | |___| . \
 *    |_|  |_|\___/ \____|_|\_\
 *
 * Copyright (c) 2014-2016 bubkoo
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var mockServer = require('restful-mock-server');


function getFilepath(filepath, cwd) {
  filepath = cwd ? path.join(cwd, filepath) : filepath;
  return path.join(process.cwd(), filepath);
}

function readfile(file) {
  // check for existence first
  if (!fs.existsSync(file)) {
    throw new Error('File: "' + file + '" doesn\'t exist');
  }

  var ext = path.extname(file);

  // YAML file
  if (ext.match(/ya?ml/)) {
    var res = fs.readFileSync(file, 'utf8');
    return yaml.safeLoad(res);
  }

  // JS / JSON / CoffeeScript
  if (ext.match(/json|js|coffee|ls/)) {
    if (require.cache[file]) {
      delete require.cache[file];
    }
    return require(file);
  }

  // unknown
  throw new Error('File: "' + file + '" is an unsupported filetype');
}

module.exports = function (grunt) {

  grunt.registerMultiTask('mock', 'Start a mock server.', function () {

    var self = this;
    var rules = {};
    var _ = grunt.util._;
    var done = self.async();
    var options = self.options({});

    options.debug = grunt.option('debug') || options.debug === true;

    self.files.forEach(function (f) {

      f.src.filter(function (filepath) {

        filepath = getFilepath(filepath, f.cwd);

        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else if (grunt.file.isFile(filepath)) {
          try {
            var result = readfile(filepath);
            if (_.isFunction(result)) {
              result = result(grunt);
            }
            _.merge(rules, result || {});
            return true;
          } catch (err) {
            grunt.log.warn(err);
            return false;
          }
        }
      });
    });

    if (options.rules) {
      _.merge(options.rules, rules);
    } else {
      options.rules = rules;
    }


    // watch
    // -----

    if (options.watch) {

      var files = ['Gruntfile.js', 'Gruntfile.coffee'];
      if (_.isArray(options.watch)) {
        files = files.concat(options.watch);
      } else if (_.isString(options.watch)) {
        files.push(options.watch);
      }

      if (self.data.src) {
        var cwd = self.data.cwd;
        var src = self.data.src;

        if (_.isArray(src)) {
          src.forEach(function (item) {
            files.push(path.join(cwd || '', item));
          });
        } else {
          files.push(path.join(cwd || '', src));
        }
      }

      options.watch = files;
    }

    mockServer(options);
  });
};

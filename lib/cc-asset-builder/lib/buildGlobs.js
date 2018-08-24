'use strict';

var _          = require('lodash');
var obj        = require('object-path');
var minimatch  = require('minimatch');
var Dependency = require('./Dependency');
var types      = require('./types.json');
var traverse   = require('traverse');
var path       = require('path');

/**
 * buildGlobs
 *
 * @class
 * @param {Object} dependencies a map of dependencies
 * @param {Array} npmFiles an array npm module file paths
 * @param {Array} bowerFiles an array bower component file paths
 * @param {Object} options
 *
 * @property {Object} globs the glob strings organized by type
 * @property {Object} globs.js an array of javascript Dependency objects
 * @property {Object} globs.css an array of css Dependency objects
 * @property {Object} globs.fonts an array of fonts path glob strings
 * @property {Object} globs.images an array of image path glob strings
 * @property {Object} globs.bower an array of bower component glob strings
 * @property {Object} globs.npm an array of npm module glob strings
 */
var buildGlobs = module.exports = function(dependencies, npmFiles, bowerFiles, options) {
  options = options || {};

  this.globs = {
    // js is an array of objects because there can be multiple js files
    js: this.getOutputFiles('js', dependencies, npmFiles, bowerFiles),
    // css is an array of objects because there can be multiple css files
    css: this.getOutputFiles('css', dependencies, npmFiles, bowerFiles),
    // fonts is a flat array since all the fonts go to the same place
    fonts: [].concat(
      this.filterByType(npmFiles, 'fonts'),
      this.filterByType(bowerFiles, 'fonts'),
      obj.get(dependencies, 'fonts.files')
    ),
    // images is a flat array since all the images go to the same place
    images: [].concat(
      this.filterByType(npmFiles, 'images'),
      this.filterByType(bowerFiles, 'images'),
      obj.get(dependencies, 'images.files')
    ),
    bower: bowerFiles,
    npm: npmFiles
  };
};

/**
 * getOutputFiles
 *
 * @param {String} type
 * @param {Object} dependencies
 * @param {Array} npmFiles an array npm modules file paths
 * @param {Array} bowerFiles an array bower component file paths
 * @return {undefined}
 */
buildGlobs.prototype.getOutputFiles = function(type, dependencies, npmFiles, bowerFiles) {
  var outputFiles;

  outputFiles = _.pick(dependencies, function(dependency, name) {
    // only select dependencies with valid file extensions
    return new RegExp('\.' + type + '$').test(name);
  });

  outputFiles = _.transform(outputFiles, function(result, dependency, name) {
    // convert to an array of dependencyObjects
    var dep = new Dependency(name, dependency);
    var npm = [];
    var npmExclude = this.npmExclude(dependencies);
    var bower = [];
    var bowerExclude = this.bowerExclude(dependencies);

    if (dependency.npm) {
      npm = npm.concat(
        this.filterByType(
          this.filterByNpmPackage(npmFiles, dependency.npm),
          type
        )
      );
    } else {
      if (dependency.main) {
        npm = npm.concat(
          this.filterByType(
            this.rejectByNpmPackage(npmFiles, npmExclude),
            type
          )
        );
      }
    }

    if (dependency.bower) {
      bower = bower.concat(
        this.filterByType(
          this.filterByBowerPackage(bowerFiles, dependency.bower),
          type
        )
      );
    } else {
      if (dependency.main) {
        bower = bower.concat(
          this.filterByType(
            this.rejectByBowerPackage(bowerFiles, bowerExclude),
            type
          )
        );
      }
    }
    dep.prependGlobs(bower);
    dep.prependGlobs(npm);
    result.push(dep);
  }, [], this);

  return outputFiles;
};

/**
 * filterByNpmPackage
 *
 * @param {Array} files
 * @param {String|Array} names
 * @return {Array} files for a particular npm package name
 */
buildGlobs.prototype.filterByNpmPackage =
  function(files, names, reject) {
    var method = reject ? 'reject' : 'filter';

    if (!_.isArray(names)) { names = [names]; }

    return _[method](files, function(file) {
      return _.some(names, function(name) {
        return file.indexOf(
          path.normalize('/node_modules/' + name + '/')
        ) > -1;
      });
    });
  }
;

buildGlobs.prototype.rejectByNpmPackage = function(files, names) {
  return buildGlobs.prototype.filterByNpmPackage(files, names, true);
};

/**
 * filterByBowerPackage
 *
 * @param {Array} files
 * @param {String|Array} names
 * @return {Array} files for a particular bower package name
 */
buildGlobs.prototype.filterByBowerPackage =
  function(files, names, reject) {
    var method = reject ? 'reject' : 'filter';

    if (!_.isArray(names)) { names = [names]; }

    return _[method](files, function(file) {
      return _.some(names, function(name) {
        return file.indexOf(
          path.normalize('/bower_components/' + name + '/')
        ) > -1;
      });
    });
  }
;

buildGlobs.prototype.rejectByBowerPackage = function(files, names) {
  return buildGlobs.prototype.filterByBowerPackage(files, names, true);
};

/**
 * filterByType
 *
 * @param {Array} files
 * @param {String} type
 * @return {Array} files for a particular type
 */
buildGlobs.prototype.filterByType =
  function(files, type) {
    return _.filter(files, minimatch.filter(types[type], {matchBase: true}));
  }
;

buildGlobs.prototype.npmExclude =
  function(dependencies) {
    // resolve npm dependencies
    return traverse(dependencies).reduce(
      function(result) {
        var parentKey = obj.get(this, 'parent.key');
        if (this.isLeaf && parentKey === 'npm') {
          result.push(this.parent.node);
        }
        return _.flatten(result);
      },
    []);
  }
;

buildGlobs.prototype.bowerExclude =
  function(dependencies) {
    // resolve bower dependencies
    return traverse(dependencies).reduce(
      function(result) {
        var parentKey = obj.get(this, 'parent.key');
        if (this.isLeaf && parentKey === 'bower') {
          result.push(this.parent.node);
        }
        return _.flatten(result);
      },
    []);
  }
;

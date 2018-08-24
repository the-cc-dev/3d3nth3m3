var
  gulp     = require('gulp-help')(require('gulp')),

  // node dependencies
  browsersync  = require('browser-sync'),
  console      = require('better-console'),
  mergestream  = require('merge-stream'),

  // gulp dependencies
  changed      = require('gulp-changed'),
  coffee     	 = require('gulp-coffee'),
  concat       = require('gulp-concat'),
  debug      	 = require('gulp-debug'),
  dedupe       = require('gulp-dedupe'),
  extreplace   = require('gulp-ext-replace'),
  filter       = require('gulp-filter'),
  plumber      = require('gulp-plumber'),
  rename       = require('gulp-rename'),
  uglify       = require('gulp-uglify'),

  manifest     = require('./../../lib/cc-asset-builder')('manifest.json'),
  paths        = manifest.paths,

  coffeefilter = filter('*.coffee', {restore: true})
;

module.exports = function(callback) {
  var merged = mergestream();
  manifest.forEachDependency('js', function(dependency) {
    merged.add(
      gulp.src(dependency.globs)
        .pipe(plumber())
        .pipe(changed())
        .pipe(dedupe())
        .pipe(debug())
        .pipe(coffeefilter)
        .pipe(coffee())
        .pipe(coffeefilter.restore)
        .pipe(concat(dependency.name))
        .pipe(gulp.dist(paths.dist))
        .pipe(uglify())
        .pipe(extreplace('.min.js'))
        .pipe(gulp.dist(paths.dist))
    );
  });
  return merged
    .pipe(browsersync.stream())
    .on('end', callback)
  ;

};
/*
// gulp build-project-js
gulp.task(
  'build-project-js',
  function(callback) {
    var
      coffeefilter = filter('*.coffee', {restore: true}),
      script = manifest.getDependencyByName('project.js')
    ;
    return gulp.src(script.globs)
      .pipe(plumber())
      .pipe(changed())
      .pipe(dedupe())
      .pipe(debug())
      .pipe(coffeefilter)
      .pipe(coffee())
      .pipe(coffeefilter.restore)
      .pipe(concat(dependency.name))
      .pipe(gulp.dist(paths.dist))
      .pipe(uglify())
      .pipe(extreplace('.min.js'))
      .pipe(gulp.dist(paths.dist))
      .pipe(browsersync.stream())
      .on('end', callback)
    ;
  }
);
*/

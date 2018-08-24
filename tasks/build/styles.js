var
  gulp     = require('gulp-help')(require('gulp')),

  // node dependencies
  browsersync  = require('browser-sync'),
  console      = require('better-console'),

  // gulp dependencies
  autoprefixer = require('gulp-autoprefixer'),
  changed      = require('gulp-changed'),
  concatcss    = require('gulp-concat-css'),
  debug      	 = require('gulp-debug'),
  dedupe       = require('gulp-dedupe'),
  extreplace   = require('gulp-ext-replace'),
  filter       = require('gulp-filter'),
  less         = require('gulp-less'),
  minifycss    = require('gulp-clean-css'),
  plumber      = require('gulp-plumber'),
  rename       = require('gulp-rename'),
  replace      = require('gulp-replace'),

  manifest     = require('./../../lib/cc-asset-builder')('manifest.json'),
  paths        = manifest.paths,

  lessfilter = filter('*.less',{restore:true}),

  styles = manifest.getDependencyByName('styles.css')
;
module.exports = function(callback) {
  console.log('Building styles.css');
  return gulp.src(styles.globs)
    .pipe(plumber())
    .pipe(changed())
    .pipe(dedupe())
    .pipe(debug())
    .pipe(lessfilter)
    .pipe(less())
    .pipe(lessfilter.restore)
    .pipe(autoprefix())
    .pipe(uncss())
    .pipe(concatcss(styles.name))
    .pipe(gulp.dist(paths.dist))
    .pipe(minifycss())
    .pipe(extreplace('.min.css'))
    .pipe(gulp.dist(paths.dist))
    .pipe(browsersync.stream())
    .on('end', callback)
  ;
};

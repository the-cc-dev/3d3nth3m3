var
  gulp     = require('gulp-help')(require('gulp')),

  // node dependencies
  browsersync  = require('browser-sync').create(),
  console      = require('better-console'),
  mergestream  = require('merge-stream'),

  // gulp dependencies
  changed      = require('gulp-changed'),
  debug      	 = require('gulp-debug'),
  dedupe       = require('gulp-dedupe'),
  flatten      = require('gulp-flatten'),
  imagemin   	 = require('gulp-imagemin'),
  plumber      = require('gulp-plumber'),

  // manifest
  manifest     = require('./../../lib/cc-asset-builder')('manifest.json'),
  paths        = manifest.paths,
  assets       = manifest.config.assets,
  dist         = manifest.config.dist,
  settings     = manifest.config.settings,
  images       = manifest.getDependencyByName('images'),
  fonts        = manifest.getDependencyByName('fonts')
;

module.exports = function(callback) {
  var merged = mergestream(
    gulp.src(assets.themes)
      .pipe(gulp.dest(dist.themes))
    ,
    gulp.src(images.globs)
      .pipe(plumber())
      .pipe(changed())
      .pipe(dedupe())
      .pipe(debug())
      .pipe(imagemin(settings.imagemin))
      .pipe(gulp.dest(dist.images))
    ,
    gulp.src(fonts.globs)
      .pipe(plumber())
      .pipe(changed())
      .pipe(dedupe())
      .pipe(debug())
      .pipe(flatten())
      .pipe(gulp.dest(dist.fonts))
  );
  return merged
    .pipe(browsersync.stream())
    .on('end', callback)
  ;
};

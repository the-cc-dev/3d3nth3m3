var
  gulp     = require('gulp-help')(require('gulp')),
  install  = require("gulp-install"),

  // node dependencies
  browsersync  = require('browser-sync').create(),
  console      = require('better-console'),
  del          = require('del'),
  mergestream  = require('merge-stream'),
  runsequence  = require('run-sequence'),

  // gulp dependencies
  autoprefixer = require('gulp-autoprefixer'),
  changed      = require('gulp-changed'),
  coffee     	 = require('gulp-coffee'),
  concat       = require('gulp-concat'),
  concatcss    = require('gulp-concat-css'),
  debug      	 = require('gulp-debug'),
  dedupe       = require('gulp-dedupe'),
  extreplace   = require('gulp-ext-replace'),
  filter       = require('gulp-filter'),
  flatten      = require('gulp-flatten'),
  imagemin   	 = require('gulp-imagemin'),
  less         = require('gulp-less'),
  minifycss    = require('gulp-clean-css'),
  plumber      = require('gulp-plumber'),
  rename       = require('gulp-rename'),
  replace      = require('gulp-replace'),
  uglify       = require('gulp-uglify'),

  // manifest
  manifest = require('./lib/cc-asset-builder')('manifest.json'),
  paths        = manifest.paths,
  dependencies = manifest.dependencies,
  config       = manifest.config,
  assets       = config.assets,
  dist         = config.dist,
  settings     = config.settings,

  lessfilter = filter('*.less',{restore:true}),
  coffeefilter = filter('*.coffee', {restore: true}),

  styles = manifest.getDependencyByName('styles.css'),
  images       = manifest.getDependencyByName('images'),
  fonts        = manifest.getDependencyByName('fonts')
;
/*******************************
             Tasks
*******************************/

gulp.task("clean", del.bind(null, [dist.all]));

gulp.task("build-styles", function(callback) {
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
});
gulp.task("build-scripts", function(callback) {
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

});
gulp.task("build-assets", function(callback) {
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
});

// gulp watch
gulp.task('watch', function(callback) {

  console.log("Watching files for changes.");

  browsersync.init({
    files: settings.watchFiles,
    proxy: settings.devUrl,
    snippetOptions: settings.snippetOptions
  });

  gulp.watch([assets.styles.all], "build-styles");
  gulp.watch([assets.scripts.all], "build-scripts");
  gulp.watch([assets.fonts.all,assets.images.all], "build-assets");
});

// gulp build
gulp.task('build', function(callback) {
  console.log("Starting full build.");
  runsequence(
    ["build-assets"],["build-scripts"],["build-styles"]
  ).on("end", function() {
    browsersync.reload;
    callback();
  });
});

// gulp
gulp.task('default', ["clean","build"], function() {
  gulp.start("watch");
});

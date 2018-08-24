var
    gulp     = require('gulp-help')(require('gulp')),

    // node dependencies
    browsersync  = require('browser-sync').create(),
    console      = require('better-console'),

    // manifest
    manifest     = require('../lib/cc-asset-builder')('manifest.json'),
    assets       = manifest.config.assets,
    settings     = manifest.config.settings
;
require("./collections/build")(gulp);

module.exports = function(callback) {

  console.log("Watching files for changes.");

  browsersync.init({
    files: settings.watchFiles,
    proxy: settings.devUrl,
    snippetOptions: settings.snippetOptions
  });

  gulp.watch([assets.styles.all], "build-styles");
  gulp.watch([assets.scripts.all], "build-scripts");
  gulp.watch([assets.fonts.all,assets.images.all], "build-assets");
};

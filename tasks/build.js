var
    gulp     = require('gulp-help')(require('gulp')),

    // node dependencies
    browsersync  = require('browser-sync'),
    console      = require('better-console'),
    runsequence  = require('run-sequence'),

    // manifest
    manifest     = require('../lib/cc-asset-builder')('manifest.json'),
    assets       = manifest.config.assets,
    settings     = manifest.config.settings
;
require("./collections/build")(gulp);

module.exports = function(callback) {
  console.log("Starting full build.");
  runsequence(
    ["build-assets"],["build-scripts"],["build-styles"]
  ).on("end", function() {
    browsersync.reload;
    callback();
  });
};

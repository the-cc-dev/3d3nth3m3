var
    buildStyles  = require("../build/styles"),
    buildScripts = require("../build/scripts"),
    buildAssets  = require("../build/assets")
;

module.exports = function(gulp) {
  gulp.task("build-styles", buildStyles);
  gulp.task("build-scripts", buildScripts);
  gulp.task("build-assets", buildAssets);
};

var gulp         = require('gulp');
var gulpSequence = require('gulp-sequence');

gulp.task('build:development', function(cb) {
  gulpSequence('clean', ['fonts', 'images'], ['sass', 'webpack:development', 'html'], ['watch', 'browserSync'], cb);
});

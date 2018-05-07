const gulp = require('gulp');
const {htmlModuleTransform, htmlModuleSpecifierTransform} =
    require('../../lib/html-module-transform/vinyl-transform.js');

gulp.task('transform-html-modules', function() {
  return gulp.src('./src/**/*')
      .pipe(htmlModuleTransform(file => {
        return /\.html$/.test(file.path) &&
            !/(index|about)\.html$/.test(file.path);
      }))
      .on('error', error => console.log(error))
      .pipe(htmlModuleSpecifierTransform())
      .on('error', error => console.log(error))
      .pipe(gulp.dest('./dest'))
      .on('error', error => console.log(error));
});

gulp.task('default', ['transform-html-modules']);

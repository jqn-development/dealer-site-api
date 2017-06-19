const gulp        = require('gulp');
const notify      = require('gulp-notify');       // Provide Gulp with a way to create push notifications
const plumber     = require('gulp-plumber');      // Handle Errors without breaking
const eslint      = require('gulp-eslint');       // ES6 JS/JSX Lineter -- Check for syntax errors
const mocha       = require('gulp-mocha');        // Test Framework
const config      = require('./build.config');

const devFolder         = config.devFolder;

// Route Errors to the Notificication Tray
let onError = function(err) {
  notify.onError({
    title:    "Error",
    message:  "<%= error %>",
  })(err);
  this.emit('end');
};

let plumberOptions = {
  errorHandler: onError,
};

// Lint JS/JSX Files (For Express)
gulp.task('lint', function() {
  return gulp.src(devFolder + '/**/*.js')
    .pipe(eslint({ configFile: 'eslint.json'}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', ['lint'], function() {
  return gulp.src('test.js', {read: false})
    .pipe(mocha())
    .once('error', function() {
      process.exit(1);
    })
});

gulp.task('default', ['test']);

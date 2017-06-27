const
  fs          = require('fs')
  , gulp        = require('gulp')
  , rename      = require('gulp-rename')
  , notify      = require('gulp-notify')        // Provide Gulp with a way to create push notifications
  , plumber     = require('gulp-plumber')       // Handle Errors without breaking
  , eslint      = require('gulp-eslint')        // ES6 JS/JSX Lineter -- Check for syntax errors
  , mocha       = require('gulp-mocha')         // Test Framework
  , config      = require('./build.config')
;

const devFolder         = config.devFolder;
const configFolder      = config.configFolder;

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

gulp.task('copyConfig', function() {
  if (!fs.existsSync(configFolder + '/aws.credentials.json')) {
    gulp.src(configFolder + '/example.aws.credentials.json')
      .pipe(rename('aws.credentials.json'))
      .pipe(gulp.dest(configFolder));
  }
  if (!fs.existsSync(configFolder + '/mysql.credentials.json')) {
    gulp.src(configFolder + '/example.mysql.credentials.json')
      .pipe(rename('mysql.credentials.json'))
      .pipe(gulp.dest(configFolder));
  }
  return;
});

// Lint JS/JSX Files (For Express)
gulp.task('lint', ['copyConfig'], function() {
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

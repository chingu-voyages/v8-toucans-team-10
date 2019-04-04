// Gulp.js configuration
var // modules
  gulp = require('gulp'),
  $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', '*'], //include '*' for non gulp files
    replaceString: /\bgulp[\-.]/,
    rename: {
      'gulp-strip-debug': 'stripdebug'
    }
  }),
  browserSync = require('browser-sync').create(),
  // development mode?
  devBuild = process.env.NODE_ENV !== 'production',
  // folders
  folder = {
    src: './src/',
    build: './dist/'
  };

console.log('devBuild:', devBuild);

// Static server
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });
});

// HTML processing
gulp.task('html', function() {
  var page = gulp.src(folder.src + '**/*.html').pipe($.newer(folder.build));

  // minify production code
  if (!devBuild) {
    page = page.pipe($.htmlclean());
  }

  return page.pipe(gulp.dest(folder.build));
});

// JavaScript processing
gulp.task('js', function() {
  var jsbuild = gulp.src(folder.src + 'scripts/**/*');

  if (!devBuild) {
    jsbuild = jsbuild.pipe($.stripdebug()).pipe($.uglify());
  }
  return jsbuild.pipe(gulp.dest(folder.build + 'js/'));
});

// CSS processing
gulp.task('css', function() {
  var postCssOpts = [$.autoprefixer({ browsers: ['last 2 versions', '> 2%'] })];

  if (!devBuild) {
    postCssOpts.push($.cssnano);
  }

  return gulp
    .src(folder.src + 'stylesheets/*.scss')
    .pipe(
      $.sass({
        outputStyle: 'nested',
        precision: 3,
        errLogToConsole: true
      })
    )
    .pipe($.postcss(postCssOpts))
    .pipe(gulp.dest(folder.build + 'css/'));
});

// run all tasks
gulp.task('build', ['html', 'css', 'js']);

// watch for changes
gulp.task('watch', function() {
  // html changes
  gulp.watch(folder.src + '**/*.html', ['html', browserSync.reload]);

  // javascript changes
  gulp.watch(folder.src + 'scripts/**/*', ['js', browserSync.reload]);

  // css changes
  gulp.watch(folder.src + 'stylesheets/**/*', ['css', browserSync.reload]);
});

// default
gulp.task('default', ['build', 'watch', 'browser-sync']);

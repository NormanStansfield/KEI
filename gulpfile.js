'use strict';

var SRC = 'src/';
var SRC_TS = [SRC + 'ts/*.ts'];
var SRC_JS = [SRC + 'js/*.js'];
// var SRC_HTML = [SRC + 'html/*.html'];
var DIST = 'released/';

var gulp = require('gulp');
var typescript = require('gulp-typescript');
var tslint = require('gulp-tslint');
var electron = require('electron-connect').server.create();
var del = require('del');
var runSequence = require('run-sequence');

var typescriptProject = typescript.createProject('tsconfig.json');


// compile typescript
gulp.task('compile:ts', function(){
  return gulp.src(SRC_TS)
  .pipe(tslint())
  .pipe(typescriptProject())
  .js
  .pipe(gulp.dest(SRC + 'js/'));
});

gulp.task('tslint', function(){
  return gulp.src(SRC_TS)
  .pipe(tslint({
    formatter: "verbose"
  }))
  .pipe(tslint.report());;
});

gulp.task('copy:lib', function(){
  var lib = SRC + 'html/';
  return gulp.src(
    [lib + 'css/**', lib + 'fonts/**'],
    { base: lib })
  .pipe(gulp.dest(DIST));
});

gulp.task('copy:js', function(){
  return gulp.src(SRC_JS)
  .pipe(gulp.dest(DIST));
});

gulp.task('copy:html', function(){
  var HTML = SRC + 'html/';
  return gulp.src([HTML + 'about.html', HTML + 'index.html'])
  .pipe(gulp.dest(DIST));
});

gulp.task('watch:ts', function(){
  // electron.start('.');
  gulp.watch(SRC_TS, (['compile:ts']));
  gulp.watch(SRC_JS, (['copy:js']));
  // gulp.watch([DIST + '*.js'], electron.restart);
  // gulp.watch([DIST + '*.html'], electron.reload);
});

gulp.task('server', function(){
  electron.start('.');
  gulp.watch(SRC_TS, (['compile:ts']));
  gulp.watch(SRC_JS, (['copy:js']));
  gulp.watch([DIST + '*.js'], electron.restart);
  gulp.watch([DIST + '*.html'], electron.reload);
});


gulp.task('cleanup', function(){
  return del([
    SRC_JS.toString() ,
    DIST + '*'
  ]);
});

gulp.task('release', function(){
  runSequence(
    'cleanup',
    'copy:lib',
    'copy:html',
    'compile:ts',
    'copy:js'
  )
});

gulp.task('default',['watch:ts']);

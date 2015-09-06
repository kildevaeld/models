'use strict';

const gulp = require('gulp'),
      peg = require('pegjs'),
      fs = require('mz/fs'),
      nodePath = require('path'),
      pipe = require('pipe'),
      babel = require('gulp-babel'),
      typescript = require('gulp-typescript');

const grammarPath = nodePath.join(__dirname, 'grammar/model.pegjs');
//const grammarPath = nodePath.join(__dirname, 'src/untitled.pegjs');

gulp.task('compile:peg', function (done) {
  return pipe.src(grammarPath)
  .buffer()
  .map(function *(data) {
    let str = data.toString();
    let parser = peg.buildParser(str, {
      output: 'source'
    });
    return "module.exports = " + parser;
  })
  .vinyl('tokenizer.ts')
  .toDest('src')

});


gulp.task('build', ['copy'],function () {
  var result = gulp.src('src/**/*.ts')
  .pipe(typescript({
     noImplicitAny: false,
     target: 'es6',
     module: 'commonjs',
     "isolatedModules": false,
     "jsx": "react",
     "experimentalDecorators": true,
     "emitDecoratorMetadata": true,
     "declaration": false,
     "removeComments": true,
     "noLib": false,
     "preserveConstEnums": true,
     "suppressImplicitAnyIndexErrors": true,
     //typescript: require('typescript')
  }));

  return result.js
  .pipe(babel({
    blacklist: ['regenerator']
  }))
  .pipe(gulp.dest('./lib'));
});

gulp.task('copy', function () {
  return gulp.src('src/**/*.hbs')
  .pipe(gulp.dest('./lib'));
})

gulp.task('default', ['compile:peg', 'build']);

gulp.task('watch', ['build'], function () {
  gulp.watch(['./src/**/*.ts','./src/**/*.hbs'], ['build', 'copy']);
});

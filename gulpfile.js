var gulp = require('gulp'),
    //notify     = require('gulp-notify'),
    babel      = require('gulp-babel'),
    browserify = require('browserify'),
    buffer     = require('gulp-buffer'),
    source     = require('vinyl-source-stream'),
    babelify   = require('babelify'),
    mocha      = require('gulp-mocha'),
    jsdsp      = require('jsdsp'),
    rename     = require('gulp-rename')

// browserify
gulp.task( 'js', ['jsdsp'], function() {
  browserify({ debug:true, standalone:'Gibberish' })
    .require( './js/index.js', { entry: true } )
    //.transform( babelify, { presets:['es2015'] }) 
    .bundle()
    .pipe( source('gibberish.js') )
    .pipe( gulp.dest('./dist') )
    //.pipe( uglify() )
    //.pipe( gulp.dest('./dist') )
    //.pipe( 
    //  notify({ 
    //    message:'Build has been completed',
    //    onLast:true
    //  }) 
    //)
})

// convert .jsdsp into .js files
//gulp.task( 'jsdsp', ()=> {
//  gulp.src( './js/**/*.jsdsp', { base:'./' })
//      .pipe( babel({ plugins:jsdsp }) )
//      .pipe( rename( path => path.ext = '.js' ) )
//      .pipe( gulp.dest('.') )
//})


gulp.task( 'jsdsp', ()=> {
  gulp.src( './js/**/*.dsp.js', { base:'./' })
      .pipe( babel({ plugins:jsdsp }) )
      .pipe( rename( path => {
        path.basename = path.basename.split('.')[0]
      } ))
      .pipe( gulp.dest('.') )
})

// run unit tests
gulp.task( 'test', ['js'], ()=> {
  return gulp.src('tests/gen.tests.js', {read:false})
    .pipe( mocha({ reporter:'nyan' }) ) // spec, min, nyan, list
})

// file watcher
gulp.task( 'watch', function() {
  gulp.watch( './js/**/*.js', ['js'] )

  gulp.watch( './js/**/*.jsdsp', e => { 
    let pathArr = e.path.split('/')
    pathArr.pop()
    pathArr = pathArr.join('/')

    gulp.src( e.path )
      .pipe( babel({ plugins:jsdsp }) )
      .pipe( rename( path => path.ext = '.js' ) )
      .pipe( gulp.dest(pathArr) )
       
  })
})

gulp.task( 'default', ['js','test'] )

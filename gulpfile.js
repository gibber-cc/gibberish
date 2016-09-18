var gulp = require('gulp'),
    //notify     = require('gulp-notify'),
    babel      = require('gulp-babel'),
    browserify = require('browserify'),
    buffer     = require('gulp-buffer'),
    source     = require('vinyl-source-stream'),
    babelify   = require('babelify'),
    mocha      = require('gulp-mocha')

gulp.task( 'js', function() {
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
  
  // transpile (but don't browserify) for use with node.js tests
  //return gulp.src( './js/**.js' )
  //  .pipe( babel({ presets:['es2015'] }) )
  //  .pipe( gulp.dest('./dist' ) )

})

gulp.task( 'test', ['js'], ()=> {
  return gulp.src('tests/gen.tests.js', {read:false})
    .pipe( mocha({ reporter:'nyan' }) ) // spec, min, nyan, list
})


gulp.task( 'watch', function() {
  gulp.watch( './js/**.js', ['test'] )
})

gulp.task( 'default', ['js','test'] )

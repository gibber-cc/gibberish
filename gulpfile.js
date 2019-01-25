var gulp = require('gulp'),
    babel      = require('gulp-babel'),
    browserify = require('browserify'),
    buffer     = require('gulp-buffer'),
    source     = require('vinyl-source-stream'),
    mocha      = require('gulp-mocha'),
    jsdsp      = require('jsdsp'),
    rename     = require('gulp-rename'),
    workletStr = require( './js/workletString.js' ),
    fs         = require( 'fs' ),
    guglify    = require( 'gulp-uglify-es' ).default,
    uglify     = require( 'uglify-es' ),
    buffer     = require( 'vinyl-buffer' ),
    gzip       = require( 'gulp-gzip' )

let workletBlob = workletStr.prefix

gulp.task( 'workletblob', ['js'], ()=> {
 
  const gibberishText = fs.readFileSync( './dist/gibberish.js', 'utf-8' )
  const processorText = fs.readFileSync( './js/workletProcessor.js', 'utf-8' )

  workletBlob += gibberishText 
  workletBlob += processorText
  workletBlob += workletStr.postfix

  fs.writeFileSync( './dist/gibberish_worklet.js', workletBlob )

  //const minified = uglify.minify( workletBlob )

  //fs.writeFileSync( './dist/gibberish_worklet.min.js', minified )
})

// browserify
gulp.task( 'js', ['jsdsp' ], function() {
  browserify({ debug:false, standalone:'Gibberish' })
    .require( './js/index.js', { entry: true } )
    //.transform( babelify, { presets:['es2015'] }) 
    .bundle()
    .pipe( source('gibberish.js') )
    .pipe( gulp.dest('./dist') )
    /*
    .pipe( buffer() )
    .pipe( guglify() )
    .pipe( rename('gibberish.min.js') )
    .pipe( gulp.dest('./dist') )
    .pipe( gzip() )
    .pipe( rename('gibberish.min.js.gz') )
    .pipe( gulp.dest('./dist') )
    */
    //.pipe( 
    //  notify({ 
    //    message:'Build has been completed',
    //    onLast:true
    //  }) 
    //)
})

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
  gulp.watch( './js/**/*.js', ['workletblob'] )

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

gulp.task( 'default', ['workletblob'] )

const gulp       = require( 'gulp' ),
      babel      = require( 'gulp-babel' ),
      babelify   = require( 'babelify' ),
      browserify = require( 'browserify' ),
      source     = require( 'vinyl-source-stream' ),
      rename     = require( 'gulp-rename' ),
      fs         = require( 'fs' ),
      guglify    = require( 'gulp-uglify-es' ).default,
      buffer     = require( 'vinyl-buffer' ),
      gzip       = require( 'gulp-gzip' ),
      clean      = require( 'gulp-clean' ),
      workletStr = {
        prefix:`const global = typeof window === 'undefined' ? {} : window;
        let Gibberish = null,
            Clock = null,
            time  = 0,
            sin   = null,
            sinr  = null,
            sinn  = null,
            cos   = null,
            cosr  = null,
            cosn  = null,
            abs   = null,
            random= null,
            floor = null,
            ceil  = null,
            round = null,
            min   = null,
            max   = null,
            g     = null

        let initialized = false;\n`,

        postfix:`global.Gibberish.workletProcessor = GibberishProcessor 
           registerProcessor( 'gibberish', global.Gibberish.workletProcessor );\n`
      }

let workletBlob = workletStr.prefix

const workletFnc = () => {
  const gibberishText = fs.readFileSync( './dist/gibberish.js', 'utf-8' )
  const processorText = fs.readFileSync( './js/workletProcessor.js', 'utf-8' )

  workletBlob += gibberishText 
  workletBlob += processorText
  workletBlob += workletStr.postfix

  fs.writeFileSync( './dist/gibberish_worklet.js', workletBlob )
}

const jsFunc = () => {
  return browserify({ debug:false, standalone:'Gibberish' })
    .require( './js/index.js', { entry: true } )
    .transform( babelify, { plugins:[jsdsp] }) 
    .bundle()
    .pipe( source('gibberish.js') )
    .pipe( gulp.dest('./dist') )

}

const minifyLib = ()=> {
  return gulp.src( './dist/gibberish.js' )
    .pipe( guglify() )
    .pipe( rename('gibberish.min.js') )
    .pipe( gulp.dest('./dist') )
    .pipe( gzip() )
    .pipe( rename('gibberish.min.js.gz') )
    .pipe( gulp.dest('./dist') )
}

const minifyWorklet = ()=> {
  return gulp.src( './dist/gibberish_worklet.js' )
    .pipe( guglify() )
    .pipe( rename('gibberish_worklet.min.js') )
    .pipe( gulp.dest('./dist') )
    .pipe( gzip() )
    .pipe( rename('gibberish_worklet.min.js.gz') )
    .pipe( gulp.dest('./dist') )
}

gulp.task( 'workletblob', ['js'], workletFnc ) 
gulp.task( 'clean', ()=> {
  return gulp.src( './dist/*.js*', { read:false  })
    .pipe( clean() )
})
gulp.task( 'minifyLib', [], minifyLib )
gulp.task( 'minifyWorklet', [], minifyWorklet )
gulp.task( 'minify', ['minifyLib', 'minifyWorklet'] )
gulp.task( 'js', jsFunc )
gulp.task( 'watch', function() {
  return gulp.watch( './js/**/*.js', ['workletblob'] )
    /*.pipe( 
      notify({ 
        message:'Gibberish build completed.',
        onLast:true
      }) 
    )*/
})

const gibberFunc = ()=> {
  const gibberishText = fs.readFileSync( './dist/gibberish.js', 'utf-8' )
  const gibberishWorklet= fs.readFileSync( './dist/gibberish_worklet.js', 'utf-8' )

  fs.writeFileSync( '/Users/charlie/Documents/code/gibber.audio.lib/dist/gibberish.js', gibberishText )
  fs.writeFileSync( '/Users/charlie/Documents/code/gibber.audio.lib/dist/gibberish_worklet.js', gibberishWorklet )
}

gulp.task( 'gibber', ['workletblob'], gibberFunc )
gulp.task( 'default', ['workletblob'] )


const jsdsp = function({ types: t }) {
  const operators = {
    '+':  'add',
    '-':  'sub',
    '*':  'mul',
    '/':  'div',
    '^':  'pow',
/*    '**': 'pow',
    '%':  'mod',
    '+=': 'add',
    '*=': 'mul',
    '-=': 'sub',
    '/=': 'div',
    '%=': 'mod',
    '^=': 'pow',
/*  '<':  'lt',
    '<=': 'lte',
    '>':  'gt',
    '>=': 'gte',
    '==': 'eq',
    '===':'eq',
    '!=': 'neq',
    '!==':'neq',
    '&&': 'and'*/
  }

  const innerVisitor = {
    BinaryExpression( path, state ) {
      //console.log( 'jsdsp:', state.usejsdsp )

      if( state.usejsdsp === false ) return

      // don't transform if arguments are both number literals
      if( t.isNumericLiteral( path.node.left ) && t.isNumericLiteral( path.node.right ) ) return

      // don't transform if no overload is found
      if( !(path.node.operator in operators) ) return

      const operatorString = operators[ path.node.operator ]

      //console.log( 'replacing:', path.node.operator, operatorString )

      path.replaceWith(
        t.callExpression(
          t.memberExpression(
            t.identifier( 'genish' ),
            t.identifier( operatorString )
          ),
          [ path.node.left, path.node.right ]
        )
      )
    },

    AssignmentExpression( path, state ) {
      if( state.usejsdsp === false ) return

      // don't transform if arguments are both number literals
      if( t.isNumericLiteral( path.node.left ) && t.isNumericLiteral( path.node.right ) ) return

      // don't transform if no overload is found
      if( !(path.node.operator in operators) ) return

      if( path.node.operator.length < 2 ) return

      const operatorString = operators[ path.node.operator ]

      path.replaceWith(
        t.assignmentExpression( 
          '=',
          path.node.left,

          t.callExpression(
            t.memberExpression(
              t.identifier( 'genish' ),
              t.identifier( operatorString )
            ),
            [ path.node.left, path.node.right ]
          )
        )
      )
    },
    ExpressionStatement( path, state ) {
      if( path.node.expression.value === 'use jsdsp' ) {
        state.usejsdsp = true
        //path.traverse( innerVisitor, state )
      }
      //state.usejsdsp = false
      //path.skip()
    },

    BlockStatement( path, state ) {
      if( path.node.directives !== undefined ) {
        path.node.directives.forEach( directive => {
          if( directive.value.value === 'use jsdsp' ) {
            state.usejsdsp = true
          }else if( directive.value.value === 'no jsdsp' ) {
            state.usejsdsp = false
          }
          
        })
      }

      path.traverse( innerVisitor, state )
      state.usejsdsp = state.usejsdsp === true ? true : false
      //path.skip()
    }
  }

  return {
    visitor: {
      BlockStatement( path, state ) {
        // off by default

        state.usejsdsp = false

        if( path.node.directives !== undefined ) {
          path.node.directives.forEach( directive => {
            if( directive.value.value === 'use jsdsp' ) {
              state.usejsdsp = true
            }else if( directive.value.value === 'no jsdsp' ) {
              state.usejsdsp = false
            }

          })
        }

        path.traverse( innerVisitor, state )
        path.skip()
        state.usejsdp = false
      },

      Function( path, state ) {
        state.usejsdsp = false

        path.traverse( innerVisitor, state )

        state.usejsdsp = false
        path.skip()
      },
    }
  }
}

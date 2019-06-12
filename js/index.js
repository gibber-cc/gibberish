let MemoryHelper = require( 'memory-helper' ),
    genish       = require( 'genish.js' )
    
let Gibberish = {
  blockCallbacks: [], // called every block
  dirtyUgens: [],
  callbackUgens: [],
  callbackNames: [],
  analyzers: [],
  graphIsDirty: false,
  ugens: {},
  debug: false,
  id: -1,
  preventProxy:false,
  proxyEnabled: true,

  output: null,

  memory : null, // 20 minutes by default?
  factory: null, 
  genish,
  scheduler: require( './scheduling/scheduler.js' ),
  //workletProcessorLoader: require( './workletProcessor.js' ),
  workletProcessor: null,

  memoed: {},
  mode:'scriptProcessor',

  prototypes: {
    ugen: null,//require('./ugen.js'),
    instrument: require( './instruments/instrument.js' ),
    effect: require( './fx/effect.js' ),
  },

  mixins: {
    polyinstrument: require( './instruments/polyMixin.js' )
  },

  workletPath: './gibberish_worklet.js',
  init( memAmount, ctx, mode=null, sac=null ) {

    let numBytes = isNaN( memAmount ) ? 20 * 60 * 44100 : memAmount

    // regardless of whether or not gibberish is using worklets,
    // we still want genish to output vanilla js functions instead
    // of audio worklet classes; these functions will be called
    // from within the gibberish audioworklet processor node.
    this.genish.gen.mode = 'scriptProcessor'

    this.memory = MemoryHelper.create( numBytes, Float64Array )

    this.mode = window.AudioWorklet !== undefined ? 'worklet' : 'scriptprocessor'
    if( mode !== null ) this.mode = mode

    this.hasWorklet = window.AudioWorklet !== undefined && typeof window.AudioWorklet === 'function'

    const startup = this.hasWorklet ? this.utilities.createWorklet : this.utilities.createScriptProcessor
    
    this.analyzers.dirty = false

    if( this.mode === 'worklet' ) {

      const p = new Promise( (resolve, reject ) => {

        const pp = new Promise( (__resolve, __reject ) => {
          this.utilities.createContext( ctx, startup.bind( this.utilities ), __resolve, sac )
        }).then( ()=> {
          Gibberish.preventProxy = true
          Gibberish.load()
          Gibberish.output = this.Bus2()
          Gibberish.preventProxy = false

          resolve()
        })

      })
      
      return p

    }else if( this.mode === 'processor' ) {
      Gibberish.load()
      Gibberish.output = this.Bus2()
      Gibberish.callback = Gibberish.generateCallback()
    }
  },

  load() {
    this.factory = require( './ugenTemplate.js' )( this )
    
    this.Panner       = require( './misc/panner.js' )( this )
    this.PolyTemplate = require( './instruments/polytemplate.js' )( this )
    this.oscillators  = require( './oscillators/oscillators.js' )( this )
    this.filters      = require( './filters/filters.js' )( this )
    this.binops       = require( './misc/binops.js' )( this )
    this.monops       = require( './misc/monops.js' )( this )
    this.Bus          = require( './misc/bus.js' )( this )
    this.Bus2         = require( './misc/bus2.js' )( this )
    this.instruments  = require( './instruments/instruments.js' )( this )
    this.fx           = require( './fx/effects.js' )( this )
    this.Sequencer    = require( './scheduling/sequencer.js' )( this )
    this.Sequencer2   = require( './scheduling/seq2.js' )( this )
    this.Tidal        = require( './scheduling/tidal.js' )( this )
    this.envelopes    = require( './envelopes/envelopes.js' )( this )
    this.analysis     = require( './analysis/analyzers.js' )( this )
    this.time         = require( './misc/time.js' )( this )
    this.Proxy        = require( './workletProxy.js' )( this )
  },

  export( target, shouldExportGenish=false ) {
    if( target === undefined ) throw Error('You must define a target object for Gibberish to export variables to.')

    if( shouldExportGenish ) this.genish.export( target )

    this.instruments.export( target )
    this.fx.export( target )
    this.filters.export( target )
    this.oscillators.export( target )
    this.binops.export( target )
    this.monops.export( target )
    this.envelopes.export( target )
    this.analysis.export( target )
    target.Sequencer = this.Sequencer
    target.Sequencer2 = this.Sequencer2
    target.Bus = this.Bus
    target.Bus2 = this.Bus2
    target.Scheduler = this.scheduler
    target.Tidal = this.Tidal
    this.time.export( target )
    this.utilities.export( target )
  },

  print() {
    console.log( this.callback.toString() )
  },

  dirty( ugen ) {
    if( ugen === this.analyzers ) {
      this.graphIsDirty = true
      this.analyzers.dirty = true
    } else {
      this.dirtyUgens.push( ugen )
      this.graphIsDirty = true
      if( this.memoed[ ugen.ugenName ] ) {
        delete this.memoed[ ugen.ugenName ]
      }
    } 
  },

  clear() {
    // do not delete the gain and the pan of the master bus 
    this.output.inputs.splice( 0, this.output.inputs.length - 2 )
    //this.output.inputNames.length = 0
    this.analyzers.length = 0
    this.scheduler.clear()
    this.dirty( this.output )
    if( this.mode === 'worklet' ) {
      this.worklet.port.postMessage({ 
        address:'method', 
        object:this.id,
        name:'clear',
        args:[]
      })
    }
      // clear memory... XXX should this be a MemoryHelper function?
    //this.memory.heap.fill(0)
    //this.memory.list = {}
    //Gibberish.output = this.Bus2()
    
  },

  // used to sort analysis ugens by priority.
  // higher priorities mean lower ordering in the array,
  // which means they will run first in the callback function.
  // by defult, analysis ugens are assigned a priority of 0 in the
  // analysis prototype.
  analysisCompare( a,b ) {
    return b.priority - a.priority
  },

  generateCallback() {
    if( this.mode === 'worklet' ) {
      Gibberish.callback = function() { return 0 }
      return Gibberish.callback
    }
    let uid = 0,
        callbackBody, lastLine, analysis=''

    this.memoed = {}

    callbackBody = this.processGraph( this.output )
    lastLine = callbackBody[ callbackBody.length - 1]
    callbackBody.unshift( "\t'use strict'" )

    this.analyzers.sort( this.analysisCompare )
    this.analyzers.forEach( v=> {
      const analysisBlock = Gibberish.processUgen( v )
      //if( Gibberish.mode === 'processor' ) {
      //  console.log( 'analysis:', analysisBlock, v  )
      //}
      let analysisLine

      if( typeof analysisBlock === 'object' ) {
        analysisLine = analysisBlock.pop()

        analysisBlock.forEach( v => {
          callbackBody.splice( callbackBody.length - 1, 0, v )
        })
      }else{
        analysisLine = analysisBlock
      }

      callbackBody.push( analysisLine )
    })

    this.analyzers.forEach( v => {
      if( this.callbackUgens.indexOf( v.callback ) === -1 )
        this.callbackUgens.push( v.callback )
    })
    this.callbackNames = this.callbackUgens.map( v => v.ugenName )

    callbackBody.push( '\n\treturn ' + lastLine.split( '=' )[0].split( ' ' )[1] )

    if( this.debug === true ) console.log( 'callback:\n', callbackBody.join('\n') )
    this.callbackNames.push( 'mem' )
    this.callbackUgens.push( this.memory.heap )
    this.callback = Function( ...this.callbackNames, callbackBody.join( '\n' ) )//.bind( null, ...this.callbackUgens )
    this.callback.out = []

    if( this.oncallback ) this.oncallback( this.callback )

    return this.callback 
  },

  processGraph( output ) {
    this.callbackUgens.length = 0
    this.callbackNames.length = 0

    this.callbackUgens.push( output.callback )

    let body = this.processUgen( output )
    

    this.dirtyUgens.length = 0
    this.graphIsDirty = false

    return body
  },
  proxyReplace( obj ) {
    if( typeof obj === 'object' && obj !== null ) {
      if( obj.id !== undefined ) {
        const __obj = processor.ugens.get( obj.id )
        //console.log( 'retrieved:', __obj.name )

        //if( obj.prop !== undefined ) console.log( 'got a ssd.out', obj )
        return obj.prop !== undefined ? __obj[ obj.prop ] : __obj
      }else if( obj.isFunc === true ) {
        let func =  eval( '(' + obj.value + ')' )

        //console.log( 'replacing function:', func )

        return func
      }
    }

    return obj
  },

  processUgen( ugen, block ) {
    if( block === undefined ) block = []

    let dirtyIdx = Gibberish.dirtyUgens.indexOf( ugen )

    let memo = Gibberish.memoed[ ugen.ugenName ]

    if( memo !== undefined ) {
      return memo
    } else if( ugen === true || ugen === false ) {
      throw "Why is ugen a boolean? [true] or [false]";
    } else if( ugen.block === undefined || dirtyIndex !== -1 ) {
      let line = `\tconst v_${ugen.id} = ` 
      if( !ugen.isop ) line += `${ugen.ugenName}( `

      // must get array so we can keep track of length for comma insertion
      const keys = ugen.isop === true || ugen.type === 'bus'  
        ? Object.keys( ugen.inputs ) 
        : [...ugen.inputNames ] 

      line = ugen.isop === true 
        ? Gibberish.__processBinop( ugen, line, block, keys ) 
        : Gibberish.__processNonBinop( ugen, line, block, keys )

      line = Gibberish.__addLineEnding( line, ugen, keys )

      block.push( line )
      
      Gibberish.memoed[ ugen.ugenName ] = `v_${ugen.id}`

      if( dirtyIdx !== -1 ) {
        Gibberish.dirtyUgens.splice( dirtyIdx, 1 )
      }

    }else if( ugen.block ) {
      return ugen.block
    }

    return block
  }, 

  __processBinop( ugen, line, block, keys ) {
    //__getInputString( line, input, block, key, ugen ) {
    const isLeftStereo = Gibberish.__isStereo( ugen.inputs[0] ), 
          isRightStereo = Gibberish.__isStereo( ugen.inputs[1] ),
          left = Gibberish.__getInputString( line, ugen.inputs[0], block, '0', keys ),
          right= Gibberish.__getInputString( line, ugen.inputs[1], block, '1', keys ),
          op = ugen.op
        
    let graph, out

    if( isLeftStereo === true && isRightStereo === false ) {
      line += `[ ${left}[0] ${op} ${right}, ${left}[1] ${op} ${right} ]`
      //graph = [ g.add( args[0].graph[0], args[1] ), g.add( args[0].graph[1], args[1] )]
    }else if( isLeftStereo === false && isRightStereo === true ) {
      //graph = [ g.add( args[0], args[1].graph[0] ), g.add( args[0], args[1].graph[1] )]
      line += `[ ${left} ${op} ${right}[0], ${left} ${op} ${right}[1] ]`
    }else if( isLeftStereo === true && isRightStereo === true ) {
      //graph = [ g.add( args[0].graph[0], args[1].graph[0] ), g.add( args[0].graph[1], args[1].graph[1] )]
      line += `[ ${left}[0] ${op} ${right}[0], ${left}[1] ${op} ${right}[1] ]`
    }else{
      // XXX important, must re-assign when calling processNonBinop
      line = Gibberish.__processNonBinop( ugen, line, block, keys )
    }
    
    return line
  },

  __processNonBinop( ugen, line, block, keys ) {
    for( let i = 0; i < keys.length; i++ ) {
      let key = keys[ i ]
      // binop.inputs is actual values, not just property names
      let input 
      if( ugen.isop || ugen.type ==='bus' ) {
        input = ugen.inputs[ key ]
      }else{
        input = ugen[ key ] 
      }

      if( input !== undefined ) { 
        input = Gibberish.__getBypassedInput( input )
        line += Gibberish.__getInputString( line, input, block, key, ugen )
        line  = Gibberish.__addSeparator( line, input, ugen, i < keys.length - 1 )
      }
    }

    return line
  },

  // determine if a ugen is stereo
  __isStereo( ugen ) {
    let isStereo = false

    if( ugen === undefined || ugen === null ) return false

    if( ugen.isStereo === true ) return true

    if( ugen.isop === true ) {
      return Gibberish.__isStereo( ugen.inputs[0] ) || Gibberish.__isStereo( ugen.inputs[1] )
    }
    
    return isStereo
  },

  // if an effect is bypassed, get next one in chain (or output destination)
  __getBypassedInput( input ) {
    if( input.bypass === true ) {
      // loop through inputs of chain until one is found
      // that is not being bypassed

      let found = false

      while( input.input !== 'undefined' && found === false ) {
        if( typeof input.input.bypass !== 'undefined' ) {
          input = input.input
          if( input.bypass === false ) found = true
        }else{
          input = input.input
          found = true
        }
      }
    }

    return input
  },

  // get a string representing a ugen for insertion into callback.
  // if a ugen contains other ugens, trigger codegen for those ugens as well.
  __getInputString( line, input, block, key, ugen ) {
    let value = ''
    if( typeof input === 'number' ) {
      if( isNaN(key) ) {
        value += `mem[${ugen.__addresses__[ key ]}]`//input
      }else{
        value += input
      }
    } else if( typeof input === 'boolean' ) {
      value += '' + input
    }else{
      //console.log( 'key:', key, 'input:', ugen.inputs, ugen.inputs[ key ] ) 
      // XXX not sure why this has to be here, but somehow non-processed objects
      // that only contain id numbers are being passed here...

      if( Gibberish.mode === 'processor' ) {
        if( input.ugenName === undefined && input.id !== undefined ) {
          input = Gibberish.processor.ugens.get( input.id )
        }
      }

      Gibberish.processUgen( input, block )

      if( !input.isop ) {
        // check is needed so that graphs with ssds that refer to themselves
        // don't add the ssd in more than once
        if( Gibberish.callbackUgens.indexOf( input.callback ) === -1 ) {
          Gibberish.callbackUgens.push( input.callback )
        }
      }

      value += `v_${input.id}`
      input.__varname = value
    }

    return value
  },

  // add separators for function calls and handle binops (mono only)
  __addSeparator( line, input, ugen, isNotEndOfLine ) {
    if( isNotEndOfLine === true ) {
      if( ugen.isop === true ) {
        if( ugen.op === '*' || ugen.op === '/' ) {
          if( input !== 1 ) {
            line += ' ' + ugen.op + ' '
          }else{
            line = line.slice( 0, -1 * (''+input).length )
          }
        }else{
          line += ' ' + ugen.op + ' '
        }
      }else{
        line += ', '
      }
    }

    return line
  },

  // add memory to end of function calls and close parenthesis 
  __addLineEnding( line, ugen, keys ) {
    if( (ugen.type === 'bus' && keys.length > 0) ) line += ', '
    if( !ugen.isop && ugen.type !== 'seq' ) line += 'mem'
    line += ugen.isop ? '' : ' )'

    return line
  },

}

Gibberish.prototypes.Ugen = require( './ugen.js' )( Gibberish )
Gibberish.utilities = require( './utilities.js' )( Gibberish )


module.exports = Gibberish

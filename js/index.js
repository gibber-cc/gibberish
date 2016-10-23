let MemoryHelper = require( 'memory-helper' ),
    genish       = require( 'genish.js' )
    
let Gibberish = {
  blockCallbacks: [], // called every block
  dirtyUgens: [],
  callbackUgens: [],
  callbackNames: [],
  graphIsDirty: false,
  ugens: {},
  debug: false,

  output: null,

  memory : null, // 20 minutes by default?
  factory: null, 
  genish,
  scheduler: require( './scheduling/scheduler.js' ),

  memoed: {},

  init( memAmount ) {
    let numBytes = memAmount === undefined ? 20 * 60 * 44100 : memAmount

    this.memory = MemoryHelper.create( numBytes )
    this.factory = require( './ugenTemplate.js' )( this )

    this.genish.export( window )

    this.PolyTemplate      = require( './instruments/polytemplate.js' )( this )
    this.ugens.oscillators = require( './oscillators/oscillators.js' )( this )
    this.ugens.binops      = require( './misc/binops.js' )( this )
    this.ugens.bus         = require( './misc/bus.js' )( this )
    this.ugens.bus2        = require( './misc/bus2.js' )( this );

    [ this.ugens.synth, this.ugens.polysynth ] = require( './instruments/synth.js' )( this );
    [ this.ugens.synth2, this.ugens.polysynth2 ] = require( './instruments/synth2.js' )( this );
    [ this.ugens.monosynth, this.ugens.polymono ] = require( './instruments/monosynth.js' )( this );
    
    this.ugens.freeverb    = require( './fx/freeverb.js'  )( this );
    this.ugens.flanger     = require( './fx/flanger.js'   )( this );
    this.ugens.vibrato     = require( './fx/vibrato.js'   )( this );
    this.ugens.delay       = require( './fx/delay.js'     )( this );
    this.ugens.bitCrusher  = require( './fx/bitCrusher.js')( this );
    this.sequencer         = require( './scheduling/sequencer.js' )( this );
    [ this.ugens.karplus, this.ugens.polykarplus ]  = require( './instruments/karplusstrong.js' )( this );
    
    this.ugens.filter24    = require( './fx/filter24.js' )( this )
    this.ugens.biquad      = require( './fx/biquad.js'   )( this )
    this.ugens.kick        = require( './instruments/kick.js' )( this )
    this.ugens.conga       = require( './instruments/conga.js' )( this )
    this.ugens.clave       = require( './instruments/conga.js' )( this )
    this.ugens.hat         = require( './instruments/hat.js' )( this )
    this.ugens.snare       = require( './instruments/snare.js' )( this )
    this.ugens.clave.defaults.frequency = 2500
    this.ugens.clave.defaults.decay = .5
    this.ugens.svf         = require( './fx/svf.js' )( this )
    this.ugens.oscillators.export( this )
    this.ugens.binops.export( this )
    this.Bus  = this.ugens.bus
    this.Bus2 = this.ugens.bus2

    this.output = this.Bus2()
    this.createContext()
    this.createScriptProcessor()
  },

  dirty( ugen ) {
    this.dirtyUgens.push( ugen )
    this.graphIsDirty = true
    if( this.memoed[ ugen.ugenName ] ) {
      delete this.memoed[ ugen.ugenName ]
    } 
  },

  clear() {
    this.output.inputs = [0]
    this.output.inputNames.length = 0
    this.dirty( this.output )
  },

  createContext() {
    let AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext
    this.ctx = new AC()
    gen.samplerate = this.ctx.sampleRate

    let start = () => {
      if( typeof AC !== 'undefined' ) {
        if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
          window.removeEventListener( 'touchstart', start )

          if( 'ontouchstart' in document.documentElement ){ // required to start audio under iOS 6
            let mySource = utilities.ctx.createBufferSource()
            mySource.connect( utilities.ctx.destination )
            mySource.noteOn( 0 )
          }
         }
      }
    }

    if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
      window.addEventListener( 'touchstart', start )
    }

    return this
  },

  createScriptProcessor() {
    this.node = this.ctx.createScriptProcessor( 1024, 0, 2 ),
    this.clearFunction = function() { return 0 },
    this.callback = this.clearFunction

    this.node.onaudioprocess = function( audioProcessingEvent ) {
      let gibberish = Gibberish,
          callback  = gibberish.callback,
          outputBuffer = audioProcessingEvent.outputBuffer,
          scheduler = Gibberish.scheduler,
          //objs = gibberish.callbackUgens.slice( 0 ),
          length

      let left = outputBuffer.getChannelData( 0 ),
          right= outputBuffer.getChannelData( 1 )

      let callbacklength = Gibberish.blockCallbacks.length
      
      if( callbacklength !== 0 ) {
        for( let i=0; i< callbacklength; i++ ) {
          Gibberish.blockCallbacks[ i ]()
        }

        // can't just set length to 0 as callbacks might be added during for loop, so splice pre-existing functions
        Gibberish.blockCallbacks.splice( 0, callbacklength )
      }

      for (let sample = 0, length = left.length; sample < length; sample++) {
        scheduler.tick()

        if( gibberish.graphIsDirty ) { 
          callback = gibberish.generateCallback()
          //objs = gibberish.callbackUgens.slice( 0 )
        }
        
        // XXX cant use destructuring, babel makes it something inefficient...
        let out = callback.apply( null, gibberish.callbackUgens )

        left[ sample  ] = out[0]
        right[ sample ] = out[1]
      }
    }

    this.node.connect( this.ctx.destination )

    return this
  }, 

  generateCallback() {
    let uid = 0,
        callbackBody, lastLine

    this.memoed = {}

    callbackBody = this.processGraph( this.output )
    lastLine = callbackBody[ callbackBody.length - 1]
    
    callbackBody.push( '\n\treturn ' + lastLine.split( '=' )[0].split( ' ' )[1] )

    if( this.debug ) console.log( 'callback:\n', callbackBody.join('\n') )
    this.callback = Function( ...this.callbackNames, callbackBody.join( '\n' ) )
    this.callback.out = []

    return this.callback 
  },

  processGraph( output ) {
    this.callbackUgens.length = 0
    this.callbackNames.length = 0

    this.callbackUgens.push( output.callback )

    let body = this.processUgen( output )
    this.callbackNames = this.callbackUgens.map( v => v.ugenName )

    this.dirtyUgens.length = 0
    this.graphIsDirty = false

    return body
  },

  processUgen( ugen, block ) {
    if( block === undefined ) block = []

    let dirtyIdx = Gibberish.dirtyUgens.indexOf( ugen )

    let memo = Gibberish.memoed[ ugen.ugenName ]

    if( memo !== undefined ) {
      return memo 
    } else if( ugen.block === undefined || dirtyIndex !== -1 ) {
  
      let line = `\tvar v_${ugen.id} = ` 
      
      if( !ugen.binop ) line += `${ugen.ugenName}( `

      // must get array so we can keep track of length for comma insertion
      let keys = ugen.binop || ugen.type === 'bus' ? Object.keys( ugen.inputs ) : Object.keys( ugen.inputNames )
      
      for( let i = 0; i < keys.length; i++ ) {
        let key = keys[ i ]
        // binop.inputs is actual values, not just property names
        let input = ugen.binop || ugen.type ==='bus'  ? ugen.inputs[ key ] : ugen[ ugen.inputNames[ key ] ]

        if( typeof input === 'number' ) {
          line += input
        }else{
          if( input === undefined ) { console.log( key ); continue; }
          Gibberish.processUgen( input, block )

          if( !input.binop ) Gibberish.callbackUgens.push( input.callback )

          line += `v_${input.id}`
        }

        if( i < keys.length - 1 ) {
          line += ugen.binop ? ' ' + ugen.op + ' ' : ', ' 
        }
      }

      line += ugen.binop ? '' : ' )'

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
    
}

module.exports = Gibberish

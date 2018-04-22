let genish = require( 'genish.js' )

module.exports = function( Gibberish ) {

let utilities = {
  createContext( ctx, cb ) {
    let AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext

    let start = () => {
      if( typeof AC !== 'undefined' ) {
        Gibberish.ctx = ctx === undefined ? new AC() : ctx
        genish.gen.samplerate = Gibberish.ctx.sampleRate
        genish.utilities.ctx = Gibberish.ctx

        if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
          window.removeEventListener( 'touchstart', start )

          if( 'ontouchstart' in document.documentElement ){ // required to start audio under iOS 6
            let mySource = utilities.ctx.createBufferSource()
            mySource.connect( utilities.ctx.destination )
            mySource.noteOn( 0 )
          }
        }else{
          window.removeEventListener( 'mousedown', start )
        }
      }

      if( typeof cb === 'function' ) cb()
    }

    if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
      window.addEventListener( 'touchstart', start )
    }else{
      window.addEventListener( 'mousedown', start )
    }

    return Gibberish.ctx
  },

  createScriptProcessor() {
    Gibberish.node = Gibberish.ctx.createScriptProcessor( 1024, 0, 2 ),
    Gibberish.clearFunction = function() { return 0 },
    Gibberish.callback = Gibberish.clearFunction

    Gibberish.node.onaudioprocess = function( audioProcessingEvent ) {
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
        }
        
        // XXX cant use destructuring, babel makes it something inefficient...
        let out = callback.apply( null, gibberish.callbackUgens )

        left[ sample  ] = out[0]
        right[ sample ] = out[1]
      }
    }

    Gibberish.node.connect( Gibberish.ctx.destination )

    return Gibberish.node
  }, 

  //createWorklet() {
  //  Gibberish.node = Gibberish.ctx.createScriptProcessor( 1024, 0, 2 ),
  //  Gibberish.clearFunction = function() { return 0 },
  //  Gibberish.callback = Gibberish.clearFunction

  //  Gibberish.node.onaudioprocess = function( audioProcessingEvent ) {
  //    let gibberish = Gibberish,
  //        callback  = gibberish.callback,
  //        outputBuffer = audioProcessingEvent.outputBuffer,
  //        scheduler = Gibberish.scheduler,
  //        //objs = gibberish.callbackUgens.slice( 0 ),
  //        length

  //    let left = outputBuffer.getChannelData( 0 ),
  //        right= outputBuffer.getChannelData( 1 )

  //    let callbacklength = Gibberish.blockCallbacks.length
      
  //    if( callbacklength !== 0 ) {
  //      for( let i=0; i< callbacklength; i++ ) {
  //        Gibberish.blockCallbacks[ i ]()
  //      }

  //      // can't just set length to 0 as callbacks might be added during for loop, so splice pre-existing functions
  //      Gibberish.blockCallbacks.splice( 0, callbacklength )
  //    }

  //    for (let sample = 0, length = left.length; sample < length; sample++) {
  //      scheduler.tick()

  //      if( gibberish.graphIsDirty ) { 
  //        callback = gibberish.generateCallback()
  //      }
        
  //      // XXX cant use destructuring, babel makes it something inefficient...
  //      let out = callback.apply( null, gibberish.callbackUgens )

  //      left[ sample  ] = out[0]
  //      right[ sample ] = out[1]
  //    }
  //  }

  //  Gibberish.node.connect( Gibberish.ctx.destination )

  //  return Gibberish.node
  //},

  createWorklet( ) {

    fetch( 'http://127.0.0.1:12000/dist/gibberish.js' )
      .then( response => response.blob() )
      .then( blob => console.log( blob ) )

  },

  createWorkletProcessor2( graph, name, debug, mem=44100*10 ) {
    //const mem = MemoryHelper.create( 4096, Float64Array )
    const cb = gen.createCallback( graph, mem, debug )
    const inputs = cb.inputs

    // get all inputs and create appropriate audioparam initializers
    const parameterDescriptors = this.createParameterDescriptors( cb )
    const parameterDereferences = this.createParameterDereferences( cb )
    const paramList = this.createParameterArguments( cb )
    const inputDereferences = this.createInputDereferences( cb )
    const inputList = this.createInputArguments( cb )   
    const memberString = this.createFunctionDereferences( cb )

    // get references to Math functions as needed
    // these references are added to the callback during codegen.

    // change output based on number of channels.
    const genishOutputLine = cb.isStereo === false
      ? `left[ i ] = memory[0]`
      : `left[ i ] = memory[0];\n\t\tright[ i ] = memory[1]\n`

    const prettyCallback = this.prettyPrintCallback( cb )


    /***** begin callback code ****/
    // note that we have to check to see that memory has been passed
    // to the worker before running the callback function, otherwise
    // it can be past too slowly and fail on occassion

    const workletCode = `
class ${name}Processor extends AudioWorkletProcessor {

  static get parameterDescriptors() {
    const params = [
      //${ parameterDescriptors }      
    ]
    return params
  }
 
  constructor( options ) {
    super( options )
    this.port.onmessage = this.handleMessage.bind( this )
    this.initialized = false
  }

  handleMessage( event ) {
    if( event.data.key === 'init' ) {
      this.memory = event.data.memory
      this.initialized = true
    }else if( event.data.key === 'set' ) {
      this.memory[ event.data.idx ] = event.data.value
    }else if( event.data.key === 'get' ) {
      this.port.postMessage({ key:'return', idx:event.data.idx, value:this.memory[event.data.idx] })     
    }
  }

  process( inputs, outputs, parameters ) {
    if( this.initialized === true ) {
      const output = outputs[0]
      const left   = output[ 0 ]
      const right  = output[ 1 ]
      const len    = left.length
      const memory = this.memory ${parameterDereferences}${inputDereferences}${memberString}

      for( let i = 0; i < len; ++i ) {
        ${prettyCallback}
        ${genishOutputLine}
      }
    }
    return true
  }
}
    
registerProcessor( '${name}', ${name}Processor)`

    
    /***** end callback code *****/


    if( debug === true ) console.log( workletCode )

    const url = window.URL.createObjectURL(
      new Blob(
        [ workletCode ], 
        { type: 'text/javascript' }
      )
    )

    return [ url, workletCode, inputs, cb.params, cb.isStereo ] 
  },


  playWorklet( graph, name, debug=false, mem=44100 * 10 ) {
    utilities.clear()

    const [ url, codeString, inputs, params, isStereo ] = utilities.createWorkletProcessor( graph, name, debug, mem )

    const nodePromise = new Promise( (resolve,reject) => {
   
      utilities.ctx.audioWorklet.addModule( url ).then( ()=> {
        const workletNode = new AudioWorkletNode( utilities.ctx, name, { outputChannelCount:[ isStereo ? 2 : 1 ] })
        workletNode.connect( utilities.ctx.destination )

        workletNode.callbacks = {}
        workletNode.onmessage = function( event ) {
          if( event.data.message === 'return' ) {
            workletNode.callbacks[ event.data.idx ]( event.data.value )
            delete workletNode.callbacks[ event.data.idx ]
          }
        }

        workletNode.getMemoryValue = function( idx, cb ) {
          this.workletCallbacks[ idx ] = cb
          this.workletNode.port.postMessage({ key:'get', idx: idx })
        }
        
        workletNode.port.postMessage({ key:'init', memory:gen.memory.heap })
        utilities.workletNode = workletNode

        utilities.registeredForNodeAssignment.forEach( ugen => ugen.node = workletNode )
        utilities.registeredForNodeAssignment.length = 0

        // assign all params as properties of node for easier reference 
        for( let dict of inputs.values() ) {
          const name = Object.keys( dict )[0]
          const param = workletNode.parameters.get( name )
      
          Object.defineProperty( workletNode, name, {
            set( v ) {
              param.value = v
            },
            get() {
              return param.value
            }
          })
        }

        for( let ugen of params.values() ) {
          const name = ugen.name
          const param = workletNode.parameters.get( name )
          ugen.waapi = param 

          Object.defineProperty( workletNode, name, {
            set( v ) {
              param.value = v
            },
            get() {
              return param.value
            }
          })
        }

        if( utilities.console ) utilities.console.setValue( codeString )

        resolve( workletNode )
      })

    })

    return nodePromise
  },
}

return utilities

}

const g = require( 'genish.js' ),
      instrument = require( './instrument.js' )

const genish = g

module.exports = function( Gibberish ) {
  const proto = Object.create( instrument )
  const memo = {}
  
  Object.assign( proto, {
    pickFile( sample ) {
      this.currentSample = sample
    },
    pick( __idx ) {
      const idx = Math.floor( __idx )
      const keys = Object.keys( this.samplers )
      const key = keys[ idx ]
      this.currentSample = key
    },
    note( rate ) {
      this.rate = rate
      if( rate > 0 ) {
        this.__trigger()
      }else{
        this.__phase__.value = this.end * (this.data.buffer.length - 1)
      }
    },
    trigger( volume ) {
      if( volume !== undefined ) this.__triggerLoudness = volume

      if( Gibberish.mode === 'processor' ) {
        const sampler = this.samplers[ this.currentSample ]
        const voice = this.__getVoice__()

        // set voice buffer length
        g.gen.memory.heap.set( [ sampler.dataLength ], voice.bufferLength.memory.values.idx )

        // set voice data index
        g.gen.memory.heap.set( [ sampler.dataIdx ], voice.bufferLoc.memory.values.idx )

        voice.trigger()
      }
    },
    __getVoice__() {
      return this.voices[ this.voiceCount++ % this.voices.length ]
    },
  })

  const Sampler = inputProps => {
    const syn = Object.create( proto )

    const props = Object.assign( { onload:null, voiceCount:0, files:[] }, Sampler.defaults, inputProps )

    syn.isStereo = props.isStereo !== undefined ? props.isStereo : false

    const start = g.in( 'start' ), end = g.in( 'end' ), 
          rate = g.in( 'rate' ), shouldLoop = g.in( 'loops' ),
          loudness = g.in( 'loudness' ),
          triggerLoudness = g.in( '__triggerLoudness' ),
          // rate storage is used to determine whether we're playing
          // the sample forward or in reverse, for use in the 'trigger' method.
          rateStorage = g.data([0], 1, { meta:true })

    Object.assign( syn, props )

    if( Gibberish.mode === 'worklet' ) {
      syn.__meta__ = {
        address:'add',
        name: ['instruments', 'Multisampler'],
        properties: JSON.stringify(props), 
        id: syn.id
      }

      Gibberish.worklet.ugens.set( syn.id, syn )

      Gibberish.worklet.port.postMessage( syn.__meta__ )
    }

    // create all our vocecs
    const voices = []
    for( let i = 0; i < syn.maxVoices; i++ ) {
      'use jsdsp'

      const voice = {
        bufferLength: g.data( [1], 1, { meta:true }),
        bufferLoc:    g.data( [1], 1, { meta:true }),
        bang: g.bang(),
      }

      voice.phase = g.counter( 
        rate, 
        start * voice.bufferLength[0],
        end * voice.bufferLength[0], 
        voice.bang, 
        shouldLoop, 
        { shouldWrap:false, initialValue:9999999 }
      )

      voice.trigger = voice.bang.trigger

      voice.graph = g.ifelse(
          // if phase is greater than start and less than end... 
          g.and( 
          g.gte( voice.phase, start * voice.bufferLength[0] ), 
          g.lt(  voice.phase, end   * voice.bufferLength[0] ) 
        ),
        // ...read data
        voice.peek = g.peekDyn( 
          voice.bufferLoc[0], 
          voice.bufferLength[0],
          voice.phase,
          { mode:'samples' }
        ),
        // ...else return 0
        0
      ) 
      * loudness 
      * triggerLoudness 

      voices.push( voice )
    }

    // load in sample data
    const samplers = {}
    //for( let filename of props.files ) {
    syn.loadSample = function( filename ) {
      'use jsdsp'

      const sampler = samplers[ filename ] = {
        dataLength: null,
        dataIdx: null,
        buffer: null,
        filename
      }

      // main thread: when sample is loaded, copy it over message port
      // processor thread: onload is called via messageport handler, and
      // passed in the new buffer to be copied.
      const onload = obj => {
        if( Gibberish.mode === 'worklet' ) {
          const memIdx = Gibberish.memory.alloc( sampler.data.buffer.length, true )

          Gibberish.worklet.port.postMessage({
            address:'copy_multi',
            id:     syn.id,
            buffer: sampler.data.buffer,
            filename
          })

        }else if( Gibberish.mode === 'processor' ) {
          sampler.data.buffer = obj

          // set data memory spec before issuing memory request
          sampler.dataLength = sampler.data.memory.values.length = sampler.data.dim = sampler.data.buffer.length

          // request memory to copy the bufer over
          g.gen.requestMemory( sampler.data.memory, false )
          g.gen.memory.heap.set( sampler.data.buffer, sampler.data.memory.values.idx )

          // set location of buffer (does not work)
          sampler.dataIdx = sampler.data.memory.values.idx

          syn.currentSample = sampler.filename
        }
      }

      // passing a filename to data will cause it to be loaded in the main thread
      // onload will then be called to pass the buffer over the messageport. In the
      // processor thread, make a placeholder until data is available.
      if( Gibberish.mode === 'worklet' ) {
        sampler.data = g.data( filename, 1, { onload })

        // check to see if a promise is returned; a valid
        // data object is only return if the file has been
        // previously loaded and the corresponding buffer has
        // been cached.
        if( sampler.data instanceof Promise ) {
          sampler.data.then( d => {
            sampler.data = d
            memo[ filename ] = sampler.data 
            onload( sampler )
          })
        }else{
          // using a cached data buffer, no need
          // for asynchronous loading.
          memo[ filename ] = sampler
          onload( sampler )
        }     
      }else{
        sampler.data = g.data( new Float32Array(), 1, { onload, filename })
        sampler.data.onload = onload
      } 
    }

    props.files.forEach( filename => syn.loadSample( filename ) )

    syn.__createGraph = function() {
      'use jsdsp'
      
      const graphs = voices.map( voice => voice.graph )
      syn.graph = g.add( ...graphs ) * g.in( 'gain' )

      if( syn.panVoices === true ) { 
        const panner = g.pan( syn.graph, syn.graph, g.in( 'pan' ) ) 
        syn.graph = [ panner.left, panner.right ]
      }
    }

    syn.loadBuffer = function( buffer ) {
      if( Gibberish.mode === 'processor' ) {
        syn.data.buffer = buffer
        syn.data.memory.values.length = syn.data.dim = buffer.length
        //syn.__redoGraph() 
      }
    }

    syn.__createGraph()

    const out = Gibberish.factory( 
      syn,
      syn.graph,
      ['instruments','multisampler'], 
      props 
    ) 

    Gibberish.preventProxy = true
    Gibberish.proxyEnabled = false
    out.voices = voices
    out.samplers = samplers
    Gibberish.proxyEnabled = true
    Gibberish.preventProxy = false

    return out
  }

  Sampler.defaults = {
    gain: 1,
    pan: .5,
    rate: 1,
    panVoices:false,
    loops: 0,
    start:0,
    end:1,
    bufferLength:-999999999,
    loudness:1,
    maxVoices:5, 
    __triggerLoudness:1
  }

  return Sampler
}
   

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
    pickplay( __idx ) {
      const idx = Math.floor( __idx )
      const keys = Object.keys( this.samplers )
      const key = keys[ idx ]
      this.currentSample = key
      return this.trigger()
    },
    note( rate ) {
      //this.rate = rate
      return this.trigger( null, rate )
    },
    setpan( num=0, value=.5 ) {
      if( Gibberish.mode === 'processor' ) {
        const voice = this.voices[ num ]
        // set voice buffer length
        //g.gen.memory.heap.set( [ value ], voice.pan.memory.values.idx )
        voice.pan = value
      }
    },
    setrate( num=0, value=1 ) {
      if( Gibberish.mode === 'processor' ) {
        const voice = this.voices[ num ]
        // set voice buffer length
        //g.gen.memory.heap.set( [ value ], voice.rate.memory.values.idx )
        voice.rate = value
      }
    },
    trigger( volume=null, rate=null ) {
      'no jsdsp'
      if( volume !== null ) this.__triggerLoudness = volume

      let voice = null
      if( Gibberish.mode === 'processor' ) {
        const sampler = this.samplers[ this.currentSample ]

        // if sample isn't loaded...
        if( sampler === undefined ) return

        voice = this.__getVoice__()

        // set voice buffer length
        g.gen.memory.heap[ voice.bufferLength.memory.values.idx ] = sampler.dataLength

        // set voice data index
        g.gen.memory.heap[ voice.bufferLoc.memory.values.idx ] = sampler.dataIdx

        //if( rate !== null ) g.gen.memory.heap[ voice.rate.memory.values.idx ] = rate
        if( rate !== null ) voice.rate = rate 
        //if( rate < 0 ) {
        //  const phase = sampler.dataIdx + Math.round((sampler.dataLength/2)) - 1
        //  console.log( 'phase:', phase, 'length:', sampler.dataLength, 'start:', sampler.dataIdx )
        //  //voice.phase.value = phase
        //  //g.gen.memory.heap[ voice.phase.memory.value.idx ] = phase
        //}else{
        //  // will reset phase to 0
        //  voice.trigger()
        //}
        
        voice.trigger()
        //g.gen.memory.heap[ voice.rate.memory.values.idx ] = rate
      }

      return voice
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
        // XXX how do I change this from main thread?
        __pan: g.data( [.5], 1, { meta:true }),
        __rate: g.data( [1], 1, { meta:true }),
        set pan(v) {
          g.gen.memory.heap[ this.__pan.memory.values.idx ] = v
        },
        set rate(v) {
          g.gen.memory.heap[ this.__rate.memory.values.idx ] = v
        },
      }

      voice.phase = g.counter( 
        rate * voice.__rate[0], 
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
      
      const pan = g.pan( voice.graph, voice.graph, voice.__pan[0] )
      voice.graph = [ pan.left, pan.right ]

      voices.push( voice )
    }

    // load in sample data
    const samplers = {}

    // bound to individual sampler objects in loadSample function
    syn.loadBuffer = function( buffer, onload ) {
      // main thread: when sample is loaded, copy it over message port
      // processor thread: onload is called via messageport handler, and
      // passed in the new buffer to be copied.
      if( Gibberish.mode === 'worklet' ) {
        const memIdx = Gibberish.memory.alloc( this.data.buffer.length, true )

        Gibberish.worklet.port.postMessage({
          address:'copy_multi',
          id:     syn.id,
          buffer: this.data.buffer,
          filename: this.filename
        })

        if( typeof onload === 'function' ) onload( this, buffer )

      }else if( Gibberish.mode === 'processor' ) {
        this.data.buffer = buffer 

        // set data memory spec before issuing memory request
        this.dataLength = this.data.memory.values.length = this.data.dim = this.data.buffer.length

        // request memory to copy the bufer over
        g.gen.requestMemory( this.data.memory, false )
        g.gen.memory.heap.set( this.data.buffer, this.data.memory.values.idx )

        // set location of buffer (does not work)
        this.dataIdx = this.data.memory.values.idx

        syn.currentSample = this.filename
      }
    }

    syn.loadSample = function( filename, __onload, buffer=null ) {
      'use jsdsp'

      const sampler = samplers[ filename ] = {
        dataLength: null,
        dataIdx: null,
        buffer: null,
        filename
      }

      const onload = syn.loadBuffer.bind( sampler ) 
      // passing a filename to data will cause it to be loaded in the main thread
      // onload will then be called to pass the buffer over the messageport. In the
      // processor thread, make a placeholder until data is available.
      if( Gibberish.mode === 'worklet' ) {
        sampler.data = g.data( buffer !== null ? buffer : filename, 1, { onload })

        // check to see if a promise is returned; a valid
        // data object is only return if the file has been
        // previously loaded and the corresponding buffer has
        // been cached.
        if( sampler.data instanceof Promise ) {
          sampler.data.then( d => {
            sampler.data = d
            memo[ filename ] = sampler.data 
            onload( sampler, __onload )
          })
        }else{
          // using a cached data buffer, no need
          // for asynchronous loading.
          memo[ filename ] = sampler
          onload( sampler, __onload )
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
      const left = g.add( ...voices.map( voice => voice.graph[0] ) )
      const right = g.add( ...voices.map( voice => voice.graph[1] ) )
      const gain = g.in( 'gain' )
      syn.graph = [ left * gain, right * gain ]

      if( syn.panVoices === true ) { 
        const panner = g.pan( syn.graph[0], syn.graph[1], g.in( 'pan' ) ) 
        syn.graph = [ panner.left, panner.right ]
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
    shouldLoop:false,
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

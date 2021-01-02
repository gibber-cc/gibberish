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
    pick( idx ) {
      idx = Math.floor( idx )
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
      if( volume !== undefined ) this.gain = volume

      if( Gibberish.mode === 'processor' ) {
        // if we're playing the sample forwards...
        /*if( Gibberish.memory.heap[ this.__rateStorage__.memory.values.idx ] > 0 ) {
          this.__trigger()
        }else{
          this.__phase__.value = this.end * (this.data.buffer.length - 1)
          }*/
        this.samplers[ this.currentSample ].trigger()
      }
         //this.samplers[ '../resources/snare.wav' ].trigger()
      //}else{
      //  const keys = Object.keys( this.samplers )
      //  const idx = phase++
      //  const key = keys[ idx ]
      //  if( phase > 1 ) phase = 0
      //  this.samplers[ key ].trigger()
      //}
    },
  })

  const Sampler = inputProps => {
    const syn = Object.create( proto )

    const props = Object.assign( { onload:null }, Sampler.defaults, inputProps )

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

    const samplers = {}
    for( let filename of props.files ) {
      'use jsdsp'

      const sampler = samplers[ filename ] = {
        bufferLength: g.data( [1], 1, { meta:true }),
        bufferLoc:    g.data( [1], 1, { meta:true }),
        bang: g.bang(),
        filename
      }

      sampler.phase = g.counter( 
        rate, 
        start * sampler.bufferLength[0],
        end * sampler.bufferLength[0], 
        sampler.bang, 
        shouldLoop, 
        { shouldWrap:false, initialValue:9999999 }
      )

      sampler.trigger = sampler.bang.trigger

      // main thread: when sample is loaded, copy it over message port
      // processor thread: onload is called via messageport handler, and
      // passed in the new buffer to be copied.

      // XXX buffer isn't copied to main memory until __redoGraph() is called.
      // can we do this using requestMemory and gen.heap.set instead??? that
      // should really speed tthings up...
      const onload = obj => {
        if( Gibberish.mode === 'worklet' ) {
          const memIdx = Gibberish.memory.alloc( sampler.data.buffer.length, true )

          Gibberish.worklet.port.postMessage({
            address:'copy_multi',
            id:     syn.id,
            idx:    memIdx,
            buffer: sampler.data.buffer,
            filename
          })

        }else if( Gibberish.mode === 'processor' ) {
          sampler.data.buffer = obj
          sampler.data.memory.values.length = sampler.data.dim = sampler.data.buffer.length

          // sett the length of the buffer (works)
          g.gen.memory.heap.set( [sampler.data.buffer.length], sampler.bufferLength.memory.values.idx )

          // request memory to copy the bufer over
          g.gen.requestMemory( sampler.data.memory, false )
          g.gen.memory.heap.set( sampler.data.buffer, sampler.data.memory.values.idx )

          // set location of buffer (does not work)
          g.gen.memory.heap.set( [sampler.data.memory.values.idx], sampler.bufferLoc.memory.values.idx )
          console.log( sampler.filename, obj.length, sampler.data.memory.values.idx )
          syn.currentSample = sampler.filename
        }

        //if( typeof syn.onload === 'function' ){  
        //  syn.onload( buffer || syn.data.buffer )
        //}
        if( sampler.bufferLength[0] === -999999999 && sampler.data.buffer !== undefined ) {
          sampler.bufferLength[0] = syn.data.buffer.length - 1
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

      {
        'use jsdsp'
        sampler.graph = g.ifelse(
          // if phase is greater than start and less than end... 
          g.and( 
            g.gte( sampler.phase, start * sampler.bufferLength[0] ), 
            g.lt(  sampler.phase, end   * sampler.bufferLength[0] ) 
          ),
          // ...read data
          sampler.peek = g.peekDyn( 
            sampler.bufferLoc[0], 
            sampler.bufferLength[0],
            sampler.phase,
            { mode:'samples' }
          ),
          // ...else return 0
          0
        ) 
        * loudness 
        * triggerLoudness 
        * g.in('gain')
      }
    }

    syn.__createGraph = function() {
      'use jsdsp'
      
      const graphs = props.files.map( name => samplers[ name ].graph )
      syn.graph = g.add( ...graphs )

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

    syn.samplers = samplers
    syn.__createGraph()

    const out = Gibberish.factory( 
      syn,
      syn.graph,
      ['instruments','multisampler'], 
      props 
    ) 

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
    __triggerLoudness:1
  }

  //const envCheckFactory = function( voice, _poly ) {
  //  const envCheck = () => {
  //    const phase = Gibberish.memory.heap[ voice.__phase__.memory.value.idx ]
  //    if( ( voice.rate > 0 && phase > voice.end ) || ( voice.rate < 0 && phase < 0 ) ) {
  //      _poly.disconnectUgen.call( _poly, voice )
  //      voice.isConnected = false
  //    }else{
  //      Gibberish.blockCallbacks.push( envCheck )
  //    }
  //  }

  //  return envCheck
  //}

  //const PolySampler = Gibberish.PolyTemplate( Sampler, ['rate','pan','gain','start','end','loops','bufferLength','__triggerLoudness','loudness'], envCheckFactory ) 

  //return [ Sampler, PolySampler ]
  return Sampler
}
   

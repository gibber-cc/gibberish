const g = require( 'genish.js' ),
      instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {
  let proto = Object.create( instrument )

  Object.assign( proto, {
    note( rate ) {
      this.rate = rate
      if( rate > 0 ) {
        this.__trigger()
      }else{
        this.__phase__.value = this.data.buffer.length - 1 
      }
    },
    trigger( volume ) {
      if( volume !== undefined ) this.gain = volume

      if( this.rate > 0 ) {
        this.__trigger()
      }else{
        this.__phase__.value = this.data.buffer.length - 1 
      }
    },
  })

  const Sampler = inputProps => {
    const syn = Object.create( proto )

    const props = Object.assign( { onload:null }, Sampler.defaults, inputProps )

    syn.isStereo = props.isStereo !== undefined ? props.isStereo : false

    const start = g.in( 'start' ), end = g.in( 'end' ), 
          rate = g.in( 'rate' ), shouldLoop = g.in( 'loops' )

    Object.assign( syn, props )

    if( Gibberish.mode === 'worklet' ) {
      syn.__meta__ = {
        address:'add',
        name: ['instruments', 'Sampler'],
        properties: JSON.stringify(props), 
        id: syn.id
      }

      Gibberish.worklet.ugens.set( syn.id, syn )

      Gibberish.worklet.port.postMessage( syn.__meta__ )
    }

    syn.__createGraph = function() {
      syn.__bang__ = g.bang()
      syn.__trigger = syn.__bang__.trigger

      syn.__phase__ = g.counter( rate, start, end, syn.__bang__, shouldLoop, { shouldWrap:false, initialValue:9999999 })
      
      syn.graph = g.mul( 
        g.ifelse( 
          g.and( g.gte( syn.__phase__, start ), g.lt( syn.__phase__, end ) ),
          g.peek( 
            syn.data, 
            syn.__phase__,
            { mode:'samples' }
          ),
          0
        ), 
        g.in('gain') 
      )
    }

    const onload = buffer => {
      if( Gibberish.mode === 'worklet' ) {
        const memIdx = Gibberish.memory.alloc( syn.data.memory.values.length, true )

        Gibberish.worklet.port.postMessage({
          address:'copy',
          id: syn.id,
          idx: memIdx,
          buffer: syn.data.buffer
        })

      }else if ( Gibberish.mode === 'processor' ) {
        syn.data.buffer = buffer
        syn.data.memory.values.length = syn.data.dim = buffer.length
        syn.__redoGraph() 
      }

      if( typeof syn.onload === 'function' ){  
        syn.onload( buffer || syn.data.buffer )
      }
      if( syn.end === -999999999 ) syn.end = syn.data.buffer.length - 1
    }

    //if( props.filename ) {
    syn.loadFile = function( filename ) {
      if( Gibberish.mode !== 'processor' ) { 
        syn.data = g.data( filename )
      }else{
        syn.data = g.data( new Float32Array() )
      }

      syn.data.onload = onload
    }

    syn.loadBuffer = function( buffer ) {
      if( Gibberish.mode === 'processor' ) {
        syn.data.buffer = buffer
        syn.data.memory.values.length = syn.data.dim = buffer.length
        syn.__redoGraph() 
      }
    }

    if( props.filename !== undefined ) {
      syn.loadFile( props.filename )
    }else{
      syn.data = g.data( new Float32Array() )
    }

    syn.data.onload = onload

    syn.__createGraph()
    
    const out = Gibberish.factory( 
      syn,
      syn.graph,
      ['instruments','sampler'], 
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
    end:-999999999,
  }

  const envCheckFactory = function( voice, _poly ) {

    const envCheck = () => {
      const phase = Gibberish.memory.heap[ voice.__phase__.memory.value.idx ]
      if( ( voice.rate > 0 && phase > voice.end ) || ( voice.rate < 0 && phase < 0 ) ) {
        _poly.disconnectUgen.call( _poly, voice )
        voice.isConnected = false
      }else{
        Gibberish.blockCallbacks.push( envCheck )
      }
    }

    return envCheck
  }

  const PolySampler = Gibberish.PolyTemplate( Sampler, ['rate','pan','gain','start','end','loops'], envCheckFactory ) 

  return [ Sampler, PolySampler ]
}


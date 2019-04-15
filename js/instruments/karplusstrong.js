const g = require( 'genish.js' ),
      instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const Karplus = inputProps => {

    const props = Object.assign( {}, Karplus.defaults, inputProps )
    let syn = Object.create( instrument )
    
    let sampleRate = Gibberish.ctx.sampleRate 

    const trigger = g.bang(),
          // high initialValue stops triggering on initialization
          phase = g.accum( 1, trigger, { shouldWrapMax:false, initialValue:1000000 } ),
          env = g.gtp( g.sub( 1, g.div( phase, 200 ) ), 0 ),
          impulse = g.mul( g.noise(), env ),
          feedback = g.history(),
          frequency = g.in('frequency'),
          glide = g.in( 'glide' ),
          slidingFrequency = g.slide( frequency, glide, glide ),
          delay = g.delay( g.add( impulse, feedback.out ), g.div( sampleRate, slidingFrequency )),
          decayed = g.mul( delay, g.t60( g.mul( g.in('decay'), slidingFrequency ) ) ),
          damped =  g.mix( decayed, feedback.out, g.in('damping') ),
          n = g.noise(),
          blendValue = g.switch( g.gt( n, g.in('blend') ), -1, 1 ), 
          withGain = g.mul( g.mul( blendValue, damped ), g.mul( g.mul( g.in('loudness'), g.in('__triggerLoudness') ), g .in('gain') ) )

    feedback.in( damped )

    const properties = Object.assign( {}, Karplus.defaults, props )

    Object.assign( syn, {
      properties : props,

      env : trigger,
      phase,

      getPhase() {
        return Gibberish.memory.heap[ phase.memory.value.idx ]
      },
    })

    if( properties.panVoices ) {  
      const panner = g.pan( withGain, withGain, g.in( 'pan' ) )
      syn = Gibberish.factory( syn, [panner.left, panner.right], ['instruments','karplus'], props  )
    }else{
      syn = Gibberish.factory( syn, withGain, ['instruments','karplus'], props )
    }

    return syn
  }
  
  Karplus.defaults = {
    decay: .97,
    damping:.2,
    gain: .15,
    frequency:220,
    pan: .5,
    glide:1,
    panVoices:false,
    loudness:1,
    __triggerLoudness:1,
    blend:1
  }

  let envCheckFactory = ( syn,synth ) => {
    let envCheck = ()=> {
      let phase = syn.getPhase(),
          endTime = synth.decay * sampleRate

      if( phase > endTime ) {
        synth.disconnectUgen( syn )
        syn.isConnected = false
        Gibberish.memory.heap[ syn.phase.memory.value.idx ] = 0 // trigger doesn't seem to reset for some reason
      }else{
        Gibberish.blockCallbacks.push( envCheck )
      }
    }
    return envCheck
  }

  const PolyKarplus = Gibberish.PolyTemplate( Karplus, ['frequency','decay','damping','pan','gain', 'glide','loudness', '__triggerLoudness'], envCheckFactory ) 
  PolyKarplus.defaults = Karplus.defaults

  return [ Karplus, PolyKarplus ]

}

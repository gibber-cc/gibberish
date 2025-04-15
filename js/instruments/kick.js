let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const Kick = inputProps => {
    // establish prototype chain
    const kick = Object.create( instrument )

    // define inputs
    const frequency = g.in( 'frequency' ),
          decay = g.in( 'decay' ),
          tone  = g.in( 'tone' ),
          gain  = g.in( 'gain' ),
          loudness = g.in( 'loudness' ),
          triggerLoudness = g.in( '__triggerLoudness' ),
          Loudness = g.mul( loudness, triggerLoudness )
    
    // create initial property set
    const props = Object.assign( {}, Kick.defaults, inputProps )

    // create DSP graph
    const trigger = g.bang(),
          impulse = g.mul( trigger, 60 ),
          scaledDecay = g.sub( 1.005, g.min( decay, .99999) ), // -> range { .005, 1.005 }
          scaledTone = g.add( 50, g.mul( tone, g.mul(4000, Loudness ) ) ), // -> range { 50, 4050 }
          bpf = g.svf( impulse, frequency, scaledDecay, 2, false ),
          lpf = g.svf( bpf, scaledTone, .5, 0, false )
          //kick = g.mul( lpf, g.mul( gain, Loudness ) )


    if( props.panVoices === true ) {  
      const panner = g.pan( lpf, lpf, g.in( 'pan' ) )
      kick.graph = [ 
        g.mul( panner.left, gain, Loudness ), 
        g.mul( panner.right, gain, Loudness ) 
      ]
      kick.isStereo = true
    }else{
      kick.graph = g.mul( lpf, g.mul( gain, Loudness ) )
      kick.isStereo = false
    }

    kick.env = trigger
    const out = Gibberish.factory( kick, kick.graph, ['instruments','kick'], props  )

    return out
  }
  
  Kick.defaults = {
    gain: 1,
    frequency:85,
    tone: .25,
    decay:.9,
    loudness:1,
    __triggerLoudness:1,
    pan:.5,
    panVoices:false
  }

  const PolyKick = Gibberish.PolyTemplate( 
    Kick, 
    [ 'gain','frequency','tone','decay','loudness','__triggerLoudness', 'pan']
  ) 

  PolyKick.defaults = Kick.defaults

  return [ Kick, PolyKick ]
}

const g = require( 'genish.js' ),
      instrument = require( './instrument.js' )
  
module.exports = function( Gibberish ) {

  const Snare = argumentProps => {
    const snare = Object.create( instrument ),
          decay = g.in( 'decay' ),
          scaledDecay = g.mul( decay, g.gen.samplerate * 2 ),
          snappy= g.in( 'snappy' ),
          tune  = g.in( 'tune' ),
          gain  = g.in( 'gain' ),
          loudness = g.in( 'loudness' ),
          triggerLoudness = g.in('__triggerLoudness'),
          Loudness = g.mul( loudness, triggerLoudness ),
          eg = g.decay( scaledDecay, { initValue:0 } ), 
          check = g.memo( g.gt( eg, .0005 ) ),
          rnd = g.mul( g.noise(), eg ),
          hpf = g.svf( rnd, g.add( 1000, g.mul( g.add( 1, tune), 1000 ) ), .5, 1, false ),
          snap = g.mul( g.gtp( g.mul( hpf, snappy ), 0 ), Loudness ), // rectify
          bpf1 = g.svf( eg, g.mul( 180, g.add( tune, 1 ) ), .05, 2, false ),
          bpf2 = g.svf( eg, g.mul( 330, g.add( tune, 1 ) ), .05, 2, false ),
          out  = g.memo( g.add( snap, bpf1, g.mul( bpf2, .8 ) ) ), //XXX why is memo needed?
          scaledOut = g.mul( out, g.mul( gain, Loudness ) ),
          ife = g.switch( check, scaledOut, 0 ),
          props = Object.assign( {}, Snare.defaults, argumentProps )

    // XXX TODO : make above switch work with ifelse. the problem is that poke ugens put their
    // code at the bottom of the callback function, instead of at the end of the
    // associated if/else block.
    
    snare.env = eg 
    const __snare = Gibberish.factory( snare, ife, ['instruments','snare'], props  )
    
    return __snare
  }
  
  Snare.defaults = {
    gain: .5,
    frequency:1000,
    tune:0,
    snappy: 1,
    decay:.1,
    loudness:1,
    __triggerLoudness:1
  }

  return Snare

}

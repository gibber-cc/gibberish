let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const Conga = argumentProps => {
    const conga = Object.create( instrument ),
          frequency = g.in( 'frequency' ),
          decay = g.in( 'decay' ),
          gain  = g.in( 'gain' ),
          loudness = g.in( 'loudness' )

    const props = Object.assign( {}, Conga.defaults, argumentProps )

    const trigger = g.bang(),
          impulse = g.mul( trigger, 60 ),
          _decay =  g.sub( .101, g.div( decay, 10 ) ), // create range of .001 - .099
          bpf = g.svf( impulse, frequency, _decay, 2, false ),
          out = g.mul( bpf, g.mul( loudness, gain ) )
    
    conga.isStereo = false
    conga.env = trigger
    return Gibberish.factory( conga, out, ['instruments','conga'], props  )
  }
  
  Conga.defaults = {
    gain: .25,
    frequency:190,
    decay: .85,
    loudness: 1
  }

  return Conga

}

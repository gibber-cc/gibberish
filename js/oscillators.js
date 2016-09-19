let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Oscillators = {
    export( obj ) {
      for( let key in Oscillators ) {
        if( key !== 'export' ) {
          obj[ key ] = Oscillators[ key ]
        }
      }
    },

    Sine( props ) {
      return  Gibberish.factory( g.mul( g.cycle( g.in('frequency') ), g.in('gain') ), 'sine', Oscillators.defaults, props )
    },
    Noise( props ) {
      return  Gibberish.factory( g.mul( g.noise(), g.in('gain') ), 'noise', { gain:1 }, props  )
    },
    Saw( props ) { 
      return Gibberish.factory( g.mul( g.phasor( g.in('frequency') ), g.in('gain' ) ), 'saw',  Oscillators.defaults, props )
    }
  }

  Oscillators.defaults = {
    frequency: 440,
    gain: 1
  }

  return Oscillators

}


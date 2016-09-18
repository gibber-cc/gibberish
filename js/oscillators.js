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

    Sine:  Gibberish.factory( g.mul( g.cycle( g.in('frequency') ), g.in('gain') ), 'sine', [ 440, 1 ]  ),
    Noise: Gibberish.factory( g.mul( g.noise(), g.in('gain') ), 'noise', [ 1 ] ),
    Saw:   Gibberish.factory( g.mul( g.phasor( g.in('frequency') ), g.in('gain' ) ), 'saw', [ 440, 1 ] ),
  }

  return Oscillators

}


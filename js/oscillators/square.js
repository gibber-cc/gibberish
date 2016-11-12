let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {
  const squareBuffer = new Float32Array( 1024 )

  for( let i = 1023; i >= 0; i-- ) { 
    squareBuffer[ i ] = i / 1024 > .5 ? 1 : -1
  }

  const Square = function( inputProps ) {
    let props = Object.assign({ 
      buffer:squareBuffer, 
      name:'square' 
    }, 
    inputProps )

    return Gibberish.oscillators.Wavetable( props )
  }
  
  Square.__buffer__ = squareBuffer

  return Square
}

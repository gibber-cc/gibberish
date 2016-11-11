let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  const Wavetable = function( inputProps ) {
    const wavetable = Object.create( ugen )
    const props  = Object.assign({}, Gibberish.oscillators.defaults, inputProps )

    //const wavetableBuffer = new Float32Array( 1024 )

    const buffer = g.data( props.buffer, 1, { immutable:true } )

    const graph = g.mul( 
      g.peek( buffer, g.phasor( g.in( 'frequency' ), 0, { min:0 } ) ),
      g.in( 'gain' )
    )

    Gibberish.factory( wavetable, graph, 'wavetable', props )

    return wavetable
  }

  return Wavetable
}

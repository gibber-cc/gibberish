let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {
  let Oscillators = {
    export( obj ) {
      for( let key in Oscillators ) {
        if( key !== 'export' ) {
          obj[ key ] = Oscillators[ key ]
        }
      }
    },

    Sine( inputProps ) {
      let sine = Object.create( ugen )
      let props = Object.assign({}, Oscillators.defaults, inputProps )
      Gibberish.factory( sine, g.mul( g.cycle( g.in('frequency') ), g.in('gain') ), 'sine', props )
      return sine
    },
    Noise( props ) {
      let noise = Object.create( ugen )
      Gibberish.factory( noise, g.mul( g.noise(), g.in('gain') ), 'noise', { gain: isNaN( props.gain ) ? 1 : props.gain } )
      return noise
    },
    Saw( inputProps ) {
      let saw = Object.create( ugen ) 
      let props = Object.assign({}, Oscillators.defaults, inputProps )
      Gibberish.factory( saw, g.mul( g.phasor( g.in('frequency') ), g.in('gain' ) ), 'saw', props )
      return saw
    },
    ReverseSaw( inputProps ) {
      let saw = Object.create( ugen ) 
      let props = Object.assign({}, Oscillators.defaults, inputProps )
      Gibberish.factory( saw, g.mul( g.sub( 1, g.phasor( g.in('frequency') ) ), g.in('gain' ) ), 'reversesaw', props )
      return saw
    },
    Square( inputProps ) {
      let square = Object.create( ugen )
      let props = Object.assign({}, Oscillators.defaults, inputProps )

      Gibberish.factory( square, Oscillators.Square.__getGraph__( g.in('frequency'), g.in('gain') ), 'square', props )
      return square
    },
  }

  Oscillators.defaults = {
    frequency: 440,
    gain: 1
  }

  let squareBuffer = new Float32Array( 1024 )

  for( let i = 1023; i >= 0; i-- ) { 
    squareBuffer[ i ] = i / 1024 > .5 ? 1 : -1
  }

  Oscillators.Square.__buffer__ = g.data( squareBuffer, 1, { immutable:true } )

  g.square = function( freq ) {
    let sqr = g.peek( Oscillators.Square.__buffer__, g.phasor( freq, 0, { min:0 } ))
    return sqr
  }

  Oscillators.Square.__getGraph__ = ( freq, gain ) => {
    let graph =  g.mul(
      g.square( freq ), 
      gain    
    )
    graph.name = 'square' + g.gen.getUID()

    return graph
  }

  return Oscillators

}




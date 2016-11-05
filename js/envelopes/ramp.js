let ugen = require( '../ugen.js' ),
    g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Ramp = function( argumentProps ) {
    let ramp   = Object.create( ugen ),
        length = g.in( 'length' ),
        from   = g.in( 'from' ),
        to     = g.in( 'to' )

    let props = Object.assign({}, Ramp.defaults, argumentProps )

    let phase = g.accum( g.div( 1, length ), 0, { shouldWrap:props.shouldLoop, shouldClamp:true }),
        diff = g.sub( to, from ),
        graph = g.add( from, g.mul( phase, diff ) )

    Gibberish.factory( ramp, graph, 'ramp', props )

    return ramp
  }

  Ramp.defaults = { from:0, to:1, length:g.gen.samplerate, shouldLoop:false }

  return Ramp

}

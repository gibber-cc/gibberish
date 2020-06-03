const  g    = require( 'genish.js'  ),
       ugen = require( '../ugen.js' )()

module.exports = function( Gibberish ) {

  const Monops = {
    export( obj ) {
      for( let key in Monops ) {
        if( key !== 'export' ) {
          obj[ key ] = Monops[ key ]
        }
      }
    },
    
    Abs( input ) {
      const abs = Object.create( ugen )
      const graph = g.abs( g.in('input') )
      
      const __out = Gibberish.factory( abs, graph, ['monops','abs'], Object.assign({}, Monops.defaults, { inputs:[input], isop:true }) )

      return __out
    },

    Pow( input, exponent ) {
      const pow = Object.create( ugen )
      const graph = g.pow( g.in('input'), g.in('exponent') )
      
      Gibberish.factory( pow, graph, ['monops','pow'], Object.assign({}, Monops.defaults, { inputs:[input], exponent, isop:true }) )

      return pow
    },
    Clamp( input, min, max ) {
      const clamp = Object.create( ugen )
      const graph = g.clamp( g.in('input'), g.in('min'), g.in('max') )
      
      const __out = Gibberish.factory( clamp, graph, ['monops','clamp'], Object.assign({}, Monops.defaults, { inputs:[input], isop:true, min, max }) )

      return __out
    },

    Merge( input ) {
      const merger = Object.create( ugen )
      const cb = function( _input ) {
        return _input[0] + _input[1]
      }

      Gibberish.factory( merger, g.in( 'input' ), ['monops','merge'], { inputs:[input], isop:true }, cb )
      merger.type = 'analysis'
      merger.inputNames = [ 'input' ]
      merger.inputs = [ input ]
      merger.input = input
      
      return merger
    },
  }

  Monops.defaults = { input:0 }

  return Monops
}

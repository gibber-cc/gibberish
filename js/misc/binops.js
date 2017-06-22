const ugenproto = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  let Binops = {
    export( obj ) {
      for( let key in Binops ) {
        if( key !== 'export' ) {
          obj[ key ] = Binops[ key ]
        }
      }
    },
    
    Add( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { binop:true, op:'+', inputs:args, ugenName:'add' + id, id } )

      return ugen
    },

    Sub( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { binop:true, op:'-', inputs:args, ugenName:'sub' + id, id } )

      return ugen
    },

    Mul( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { binop:true, op:'*', inputs:args, ugenName:'mul' + id, id } )

      return ugen
    },

    Div( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { binop:true, op:'/', inputs:args, ugenName:'div' + id, id } )
    
      return ugen
    },

    Mod( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { binop:true, op:'%', inputs:args, ugenName:'mod' + id, id } )

      return ugen
    },   
  }

  return Binops
}

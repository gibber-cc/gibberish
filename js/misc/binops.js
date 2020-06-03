const ugenproto = require( '../ugen.js' )(),
     __proxy     = require( '../workletProxy.js' ),
     g = require( 'genish.js' )

module.exports = function( Gibberish ) {
  const proxy = __proxy( Gibberish )

  const createProperties = function( p, id ) {
    for( let i = 0; i < 2; i++ ) {
      Object.defineProperty( p, i, {
        get() { return p.inputs[ i ] },
        set(v) {
          p.inputs[ i ] = v
          if( Gibberish.mode === 'worklet' ) {
            if( typeof v === 'number' ) {
              Gibberish.worklet.port.postMessage({ 
                address:'addToProperty', 
                object:id,
                name:'inputs',
                key:i,
                value:v
              })
            }else{
              Gibberish.worklet.port.postMessage({ 
                address:'addObjectToProperty', 
                object:id,
                name:'inputs',
                key:i,
                value:v.id
              })
            }
            Gibberish.worklet.port.postMessage({
              address:'dirty',
              id
            })
          }
        }
      })
    }
  }

  const Binops = {
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
      const isStereo = Gibberish.__isStereo( args[0] ) || Gibberish.__isStereo( args[1] )
      Object.assign( ugen, { isop:true, op:'+', inputs:args, ugenName:'add' + id, id, isStereo } )
      
      const p = proxy( ['binops','Add'], { isop:true, inputs:args }, ugen )
      createProperties( p, id )

      return p
    },

    Sub( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      const isStereo = Gibberish.__isStereo( args[0] ) || Gibberish.__isStereo( args[1] )
      Object.assign( ugen, { isop:true, op:'-', inputs:args, ugenName:'sub' + id, id, isStereo } )

      return proxy( ['binops','Sub'], { isop:true, inputs:args }, ugen )
    },

    Mul( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      const isStereo = Gibberish.__isStereo( args[0] ) || Gibberish.__isStereo( args[1] )
      Object.assign( ugen, { isop:true, op:'*', inputs:args, ugenName:'mul' + id, id, isStereo } )

      const p = proxy( ['binops','Mul'], { isop:true, inputs:args }, ugen )
      createProperties( p, id )
      return p
    },

    Div( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      const isStereo = Gibberish.__isStereo( args[0] ) || Gibberish.__isStereo( args[1] )
      Object.assign( ugen, { isop:true, op:'/', inputs:args, ugenName:'div' + id, id, isStereo} )
    
      const p = proxy( ['binops','Div'], { isop:true, inputs:args }, ugen )
      createProperties( p, id )

      return p
    },

    Mod( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      const isStereo = Gibberish.__isStereo( args[0] ) || Gibberish.__isStereo( args[1] )
      Object.assign( ugen, { isop:true, op:'%', inputs:args, ugenName:'mod' + id, id, isStereo} )

      const p = proxy( ['binops','Mod'], { isop:true, inputs:args }, ugen )
      createProperties( p, id )

      return p
    },   
  }

  for( let key in Binops ) {
    Binops[ key ].defaults = { 0:0, 1:0 }
  }

  return Binops
}

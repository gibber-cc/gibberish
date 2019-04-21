const ugenproto = require( '../ugen.js' )(),
     __proxy     = require( '../workletProxy.js' ),
     g = require( 'genish.js' )

module.exports = function( Gibberish ) {
  const proxy = __proxy( Gibberish )

  const getGraph = function( name='add', op='+', args ) {
    const isLeftStereo = Gibberish.isStereo( args[0] ), 
          isRightStereo = Gibberish.isStereo( args[1] ),
          func = g[ name ],
          ugen = Object.create( ugenproto )

    let graph, out

    if( isLeftStereo === true && isRightStereo === false ) {
      graph = `[ ${args[0].__varname} + ${args[1]} ), g.add( args[0].graph[1], args[1] )]`
      //graph = [ g.add( args[0].graph[0], args[1] ), g.add( args[0].graph[1], args[1] )]
    }else if( isLeftStereo === false && isRightStereo === true ) {
      graph = [ g.add( args[0], args[1].graph[0] ), g.add( args[0], args[1].graph[1] )]
    }else if( isLeftStereo === true && isRightStereo === true ) {
      graph = [ g.add( args[0].graph[0], args[1].graph[0] ), g.add( args[0].graph[1], args[1].graph[1] )]
    }else{
      const id = Gibberish.factory.getUID()
      Object.assign( ugen, { isop:true, op, inputs:args, ugenName:name + id, id } )
      out = proxy( ['binops','Add'], { isop:true, inputs:args }, ugen )
    }

    if( out === undefined ) {
      out = Gibberish.factory( ugen, graph, ['binops',name[0].toUpperCase()+name.slice(1)], {} )
    }
    return out
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
      Object.assign( ugen, { isop:true, op:'+', inputs:args, ugenName:'add' + id, id } )
      
      return proxy( ['binops','Add'], { isop:true, inputs:args }, ugen )
    },

    Sub( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { isop:true, op:'-', inputs:args, ugenName:'sub' + id, id } )

      return proxy( ['binops','Sub'], { isop:true, inputs:args }, ugen )
    },

    Mul( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { isop:true, op:'*', inputs:args, ugenName:'mul' + id, id } )

      return proxy( ['binops','Mul'], { isop:true, inputs:args }, ugen )
    },

    Div( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { isop:true, op:'/', inputs:args, ugenName:'div' + id, id } )
    
      return proxy( ['binops','Div'], { isop:true, inputs:args }, ugen )
    },

    Mod( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { isop:true, op:'%', inputs:args, ugenName:'mod' + id, id } )

      return proxy( ['binops','Mod'], { isop:true, inputs:args }, ugen )
    },   
  }

  return Binops
}

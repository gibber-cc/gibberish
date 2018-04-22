module.exports = function( __name, values, obj ) {
  
  if( Gibberish.mode === 'worklet' ) {
    const properties = {}
    for( let key in values ) {
      if( typeof values[ key ] === 'object' && values[ key ].__meta__ !== undefined ) {
        properties[ key ] = values[ key ].__meta__
      }else{
        properties[ key ] = values[ key ]
      }
    }

    if( Array.isArray( __name ) ) {
      const oldName = __name[ __name.length - 1 ]
      __name[ __name.length - 1 ] = oldName[0].toUpperCase() + oldName.substring(1)
    }else{
      __name = [ __name[0].toUpperCase() + __name.substring(1) ]
    }

    obj.__meta__ = {
      address:'add',
      name:__name,
      properties, 
      id:obj.id
    }

    Gibberish.worklet.port.postMessage( obj.__meta__ )

    // proxy for all method calls to send to worklet
    const proxy = new Proxy( obj, {
      get( target, prop, receiver ) {
        if( typeof target[ prop ] === 'function' ) {
          const proxy = new Proxy( target[ prop ], {
            apply( __target, thisArg, args ) {
              Gibberish.worklet.port.postMessage({ 
                address:'method', 
                object:obj.id,
                name:prop,
                args
              })

              return target[ prop ].apply( thisArg, args )
            }
          })
          
          return proxy
        }

        return target[ prop ]
      }
    })

    return proxy
  }

  return obj
}

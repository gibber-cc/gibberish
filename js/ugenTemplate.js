module.exports = function( Gibberish ) {
  let uid = 0

  let factory = function( ugen, graph, __name, values, cb ) {
    ugen.callback = cb === undefined ? Gibberish.genish.gen.createCallback( graph, Gibberish.memory, false, true ) : cb

    let name = Array.isArray( __name ) ? __name[ __name.length - 1 ] : __name

    Object.assign( ugen, {
      type: 'ugen',
      id: factory.getUID(), 
      ugenName: name + '_',
      graph: graph,
      inputNames: new Set( Gibberish.genish.gen.parameters ),
      isStereo: Array.isArray( graph ),
      dirty: true,
      __properties__:values
    })
    
    ugen.ugenName += ugen.id
    ugen.callback.ugenName = ugen.ugenName // XXX hacky

    for( let param of ugen.inputNames ) {
      if( param === 'memory' ) continue

      let value = values[ param ]

      // TODO: do we need to check for a setter?
      let desc = Object.getOwnPropertyDescriptor( ugen, param ),
          setter

      if( desc !== undefined ) {
        setter = desc.set
      }

      Object.defineProperty( ugen, param, {
        get() { return value },
        set( v ) {
          if( value !== v ) {
            Gibberish.dirty( ugen )
            if( setter !== undefined ) setter( v )
            value = v
          }
        }
      })
    }

    if( ugen.__requiresRecompilation !== undefined ) {
      ugen.__requiresRecompilation.forEach( prop => {
        let value = ugen[ prop ]
        Object.defineProperty( ugen, prop, {
          get() { return value },
          set( v ) {
            if( value !== v ) {
              value = v
              this.__redoGraph()
            }
          }
        })
      })      
    }

    /* BEGIN WORKLET ADDTIONS */
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

      ugen.__meta__ = {
        address:'add',
        name:__name,
        properties, 
        id:ugen.id
      }

      Gibberish.worklet.port.postMessage( ugen.__meta__ )
    }
    /* END WORKLET ADDITIONS */

    return ugen
  }

  factory.getUID = () => uid++

  

  return factory
}

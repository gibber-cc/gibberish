module.exports = function( Gibberish ) {

  let uid = 0

  let factory = function( graph, name, defaults, props ) {
    let ugen = Gibberish.genish.gen.createCallback( graph, Gibberish.memory ),
        values = Object.assign( {}, defaults, props )

    Object.assign( ugen, {
      type: 'ugen',
      id: factory.getUID(), 
      ugenName: name + '_',
      graph: graph,
      inputNames: Gibberish.genish.gen.parameters.slice(0),
      dirty: true
    })

    ugen.ugenName += ugen.id

    for( let param of ugen.inputNames ) {
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
            // only rebuild graph if assignment changes from number to ugen (or vice-versa)
            //if( isNaN( v ) || isNaN( value ) ) Gibberish.dirty( ugen )
            Gibberish.dirty( ugen )
            if( setter !== undefined ) setter( v )
            value = v
          }
        }
      })
    }

    return ugen
  }

  factory.getUID = () => uid++

  return factory
}

let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  let Bus = { 
    create() {
      let bus = Object.create( ugen )

      Object.assign( bus, {
        callback() {
          let output = 0

          for( let i = 0, length = arguments.length; i < length; i++ ) {
            let input = arguments[ i ],
                isArray = input instanceof Float32Array

            output += isArray ? input[ 0 ] : input
          }

          return output
        },
        id : Gibberish.factory.getUID(),
        dirty : true,
        type : 'bus',
        inputs : [],
        inputNames : [],
      })

      bus.ugenName = bus.callback.ugenName = 'bus_' + bus.id

      bus.disconnectUgen = function( ugen ) {
        let removeIdx = this.inputs.indexOf( ugen )
        
        if( removeIdx !== -1 ) {
          this.inputs.splice( removeIdx, 1 )
          Gibberish.dirty( this )
        }
      }
      
      return bus
    }
  }

  return Bus.create

}


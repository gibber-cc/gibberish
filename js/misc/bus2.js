let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  let Bus2 = Object.create( ugen )

  Object.assign( Bus2, { 
    create() {
      let output = new Float32Array( 2 )

      let bus = Object.create( this )

      Object.assign( 
        bus,

        {
          callback() {
            output[ 0 ] = output[ 1 ] = 0

            for( let i = 0, length = arguments.length; i < length; i++ ) {
              let input = arguments[ i ],
                  isArray = input instanceof Float32Array

              output[ 0 ] += isArray ? input[ 0 ] : input
              output[ 1 ] += isArray ? input[ 1 ] : input
            }

            output[0] *= bus.gain
            output[1] *= bus.gain

            return output
          },
          id : Gibberish.factory.getUID(),
          dirty : true,
          type : 'bus',
          inputs : [],
          inputNames : [],
        },

        this.defaults
      )

      bus.ugenName = bus.callback.ugenName = 'bus2_' + bus.id

      return bus
    },
    
    disconnectUgen( ugen ) {
      let removeIdx = this.inputs.indexOf( ugen )

      if( removeIdx !== -1 ) {
        this.inputs.splice( removeIdx, 1 )
        Gibberish.dirty( this )
      }
    },

    defaults: { gain:1 }
  })

  return Bus2.create.bind( Bus2 )

}


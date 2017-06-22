let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {
  
  const Bus = Object.create( ugen )

  Object.assign( Bus, {
    create() {
      const bus = Object.create( this )

      Object.assign( 
        bus, 

        {
          callback() {
            let output = 0

            for( let i = 0, length = arguments.length; i < length; i++ ) {
              let input = arguments[ i ],
                  isArray = input instanceof Float32Array

              output += isArray ? input[ 0 ] : input
            }

            return output * bus.gain
          },
          id : Gibberish.factory.getUID(),
          dirty : true,
          type : 'bus',
          inputs : [],
          inputNames : [],
        },

        this.defaults 
      )

      bus.ugenName = bus.callback.ugenName = 'bus_' + bus.id

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

  return Bus.create.bind( Bus )

}


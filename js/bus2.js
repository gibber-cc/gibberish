let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Bus2 = { 
    create() {
      //let ugen = Gibberish.genish.gen.createCallback( this.graph, Gibberish.memory )

      //Object.assign( ugen, {
      //  type: 'ugen',
      //  id: Gibberish.template.getUID(), 
      //  ugenName: this.ugenName + '_',
      //  graph: this.graph,
      //  inputNames: Gibberish.template.getInputsForUgen( this.graph ),
      //  dirty: true
      //})
      let output = new Float32Array( 2 ),
          floatProto = Float32Array.prototype

      let bus = function() {
        output[ 0 ] = output[ 1 ] = 0
        for( let i = 0; i < arguments.length; i++ ) {
          let input = arguments[ i ],
              isArray = floatProto.isPrototypeOf( input )

          output[ 0 ] = isArray ? input[ 0 ] : input
          output[ 1 ] = isArray ? input[ 1 ] : input
        }

        return output
      }

      bus.binop = true
      bus.id = Gibberish.template.getUID()
      bus.dirty = true
      bus.type = 'ugen'
      bus.ugenName = 'bus2_' + bus.id
      bus.inputs = []
      bus.op = '+'

      bus.connect = ( ugen, level = 1 ) => {
        bus.inputs.push( ugen )

        Gibberish.dirty( bus )

        return bus
      }

      bus.disconnect = ( ugen ) => {
        let removeIdx = -1
        for( let i = 0; i < bus.inputs.length; i++ ) {
          let input = bus.inputs[ i ]

          if( isNaN( input ) && ugen === input.inputs[0] ) {
            removeIdx = i
            break;
          }
        }
        
        if( removeIdx !== -1 ) {
          bus.inputs.splice( removeIdx, 1 )
          Gibberish.dirty( bus )
        }
      }
      
      return bus
    }
  }

  return Bus2.create

}


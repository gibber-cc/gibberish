module.exports = function( Gibberish ) {

  let template = { 
    // parse template for easier editing
    // make sure last character is '}', not whitespace
    templateString : null,
    uid:0,

    getUID() { return this.uid++ },

    init : function() {
      let str = template.template.toString(),
        startIndex = str.indexOf( '{' ) + 1,
        body = str.slice( startIndex, -1 )

      template.templateString = body
    },

    // TODO: delete?
    getInputsForChannel( channel, inputs ) {
      
      if( Array.isArray( channel.inputs ) ) {
        for( let input of channel.inputs ) {
          if( input.basename === 'in' ) {
            if( !inputs.includes( input.name ) ) {
              inputs.push( input.name )
            }
          }else{
            template.getInputsForUgen( input, inputs )
          }
        }
      }

    },

    // TODO: delete?
    getInputsForUgen( ugen, inputs ) {
      if( inputs === undefined ) inputs = [] // init  
      
      if( Array.isArray( ugen ) ) {
        template.getInputsForChannel( ugen[0], inputs )
        template.getInputsForChannel( ugen[1], inputs )
      }else{
        template.getInputsForChannel( ugen, inputs )
      }
      
      //console.log( 'INPUTS', inputs )
      return inputs
    },

    template() {
      let ugen = Gibberish.genish.gen.createCallback( this.graph, Gibberish.memory )

      console.log( 'PROPS', props )
      Object.assign( ugen, {
        type: 'ugen',
        id: Gibberish.template.getUID(), 
        ugenName: this.ugenName + '_',
        graph: this.graph,
        inputNames: this.inputNames,//Gibberish.template.getInputsForUgen( this.graph ),
        dirty: true
      })

      ugen.ugenName += ugen.id

      let propCount = 0


      // XXX: "props" is part of the dynamically compiled function signature...
      let values = Object.assign( {}, this.defaults, props )

      console.log( 'values:', values )

      for( let param of ugen.inputNames ) {
        let value = values[ param ]

        console.log( param, value )
        //if( value === undefined ) value = this.defaults[ propCount ]

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

        //propCount++
      }
      return ugen
    },

    factory( graph, name, defaults ) {
      let inputs = Gibberish.genish.gen.parameters,//template.getInputsForUgen( graph ),
        //func = new Function( ...inputs, template.templateString )
          func = new Function(  'props' , template.templateString )
      
      func.graph = graph
      func.ugenName = name
      func.defaults = defaults
      func.inputNames = inputs

      return func.bind( func )
    }
  }

  template.init()

  return template
}

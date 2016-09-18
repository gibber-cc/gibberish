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

    getInputsForChannel( channel, inputs ) {

      if( Array.isArray( channel.inputs ) ) {
        for( let input of channel.inputs ) {
          if( input.basename === 'in' ) {
            inputs.push( input.name )
          }else{
            template.getInputsForUgen( input, inputs )
          }
        }
      }

    },

    getInputsForUgen( ugen, inputs ) {
      if( inputs === undefined ) inputs = [] // init  
      
      if( Array.isArray( ugen ) {
        template.getInputsForChannel( ugen[0], inputs )
        template.getInputsForChannel( ugen[1], inputs )
      }else{
        template.getInputsForChannel( ugen )
      }

      return inputs
    },

    template() {
      let ugen = Gibberish.genish.gen.createCallback( this.graph, Gibberish.memory )

      Object.assign( ugen, {
        type: 'ugen',
        id: Gibberish.template.getUID(), 
        ugenName: this.ugenName + '_',
        graph: this.graph,
        inputNames: Gibberish.template.getInputsForUgen( this.graph ),
        dirty: true
      })

      ugen.ugenName += ugen.id

      let propCount = 0
      for( let param of ugen.inputNames ) {
        let value = arguments[ ugen.inputNames.indexOf( param ) ]

        if( value === undefined ) value = this.defaults[ propCount ]

        Object.defineProperty( ugen, param, {
          get() { return value },
          set( v ) { 
            value = v
            Gibberish.dirty( ugen )
          }
        })

        propCount++
      }
      return ugen
    },

    factory( graph, name, defaults ) {
      let inputs = template.getInputsForUgen( graph ),
          func = new Function( ...inputs, template.templateString )
      
      func.graph = graph
      func.ugenName = name
      func.defaults = defaults

      return func.bind( func )
    }
  }

  template.init()

  return template
}

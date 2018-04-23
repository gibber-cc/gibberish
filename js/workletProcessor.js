class GibberishProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {}

  constructor(options) {
    super(options);
    Gibberish = window.Gibberish
    Gibberish.genish.hasWorklet = false
    Gibberish.init( undefined, undefined, 'processor' )
    this.port.onmessage = this.handleMessage.bind( this )
    this.ugens = new Map()
    this.ugens.set( Gibberish.id, Gibberish )
  }

  handleMessage( event ) {
    if( event.data.address === 'add' ) {

      const rep = event.data
      let constructor = Gibberish
      for( let i = 0; i < rep.name.length; i++ ) { constructor = constructor[ rep.name[ i ] ] }

      for( let key in rep.properties) {
        let prop = rep.properties[ key ]
        if( typeof prop === 'object' && prop.id !== undefined ) {
          let objCheck = this.ugens.get( prop.id )
          if( objCheck !== undefined ) {
            rep.properties[ key ] = objCheck
            //console.log( key, objCheck )
          } 
        }
      } 

      const ugen = constructor( rep.properties )

      if( rep.post ) {
        ugen[ rep.post ]()
      }

      this.ugens.set( rep.id, ugen )

      initialized = true

    }else if( event.data.address === 'method' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      obj[ dict.name ]( ...dict.args )
    }else if( event.data.address === 'property' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      obj[ dict.name ] = dict.value
    }else if( event.data.address === 'set' ) {
      this.memory[ event.data.idx ] = event.data.value
    }else if( event.data.address === 'get' ) {
      this.port.postMessage({ address:'return', idx:event.data.idx, value:this.memory[event.data.idx] })     
    }
  }

  deserialize( __arg ) {
    const arg = JSON.parse( __arg )
    const obj = {}
    for( let key in arg ) {
      if( typeof arg[ key ] === 'string' ) {
        obj[ key ] = eval( arg[key] )
      }else{
        obj[ key ] = arg[ key ]
      }
    }
    return obj
  }

  process(inputs, outputs, parameters) {
    if( initialized === true ) {
      const gibberish = Gibberish
      const scheduler = gibberish.scheduler
      let   callback  = this.callback
      let   ugens     = gibberish.callbackUgens 

      // XXX is there some way to optimize this out?
      if( callback === undefined && gibberish.graphIsDirty === false ) return true

      let callbacklength = gibberish.blockCallbacks.length

      if( callbacklength !== 0 ) {
        for( let i=0; i< callbacklength; i++ ) {
          gibberish.blockCallbacks[ i ]()
        }

        // can't just set length to 0 as callbacks might be added during for loop,
        // so splice pre-existing functions
        gibberish.blockCallbacks.splice( 0, callbacklength )
      }

      let outputChannel = outputs[ 0 ][ 0 ]
      for (let i = 0; i < outputChannel.length; ++i) {
        scheduler.tick()

        if( gibberish.graphIsDirty ) {
          this.callback = callback = gibberish.generateCallback()
          ugens = gibberish.callbackUgens
        }
        outputChannel[ i ] = callback.apply( null, ugens )[0]
      }

    }

    // make sure this is always returned or the callback ceases!!!
    return true
  }
}

const replace = obj => {
  if( typeof obj === 'object' ) {
    if( obj.id !== undefined ) {
      return processor.ugens.get( obj.id )
    } 
  }

  return obj
}

let processor = null

class GibberishProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {}

  constructor(options) {
    super(options);
    Gibberish = window.Gibberish
    Gibberish.genish.hasWorklet = false
    Gibberish.preventProxy = true
    Gibberish.init( undefined, undefined, 'processor' )
    Gibberish.preventProxy = false
    Gibberish.debug = true
    this.port.onmessage = this.handleMessage.bind( this )
    this.ugens = new Map()
    this.ugens.set( Gibberish.id, Gibberish )
    processor = this
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
      console.log( event.data.address, event.data.name, event.data.args, this.ugens )
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      obj[ dict.name ]( ...dict.args.map( replace ) ) 
    }else if( event.data.address === 'property' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      obj[ dict.name ] = dict.value
    }else if( event.data.address === 'print' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      console.log( 'printing', dict.object, obj )
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

      const output = outputs[ 0 ]
      const len = outputs[0][0].length
      for (let i = 0; i < len; ++i) {
        scheduler.tick()

        if( gibberish.graphIsDirty ) {
          const oldCallback = callback
          const oldUgens = ugens

          try{
            this.callback = callback = gibberish.generateCallback()
            ugens = gibberish.callbackUgens
            //const out = callback.apply( null, ugens )
            //output[0][ i ] = out[0]
            //output[1][ i ] = out[1] 
          }catch(e) {

            console.log( 'callback error:', e, callback.toString() )
            this.callback = callback = oldCallback
            ugens = gibberish.callbackUgens = oldUgens
            gibberish.callbackNames = ugens.map( v => v.ugenName )
          }
        }
        const out = callback.apply( null, ugens )
        output[0][ i ] = out[0]
        //output[1][ i ] = out[1] 
      }

    }

    // make sure this is always returned or the callback ceases!!!
    return true
  }
}

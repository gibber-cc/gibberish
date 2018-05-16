let processor = null

class GibberishProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {}

  constructor( options ) {
    super( options )
    
    Gibberish = window.Gibberish
    Gibberish.ctx = { sampleRate }
    Gibberish.genish.hasWorklet = false
    Gibberish.preventProxy = true
    Gibberish.init( undefined, undefined, 'processor' )
    Gibberish.preventProxy = false
    Gibberish.debug = true
    Gibberish.processor = this

    this.port.onmessage = this.handleMessage.bind( this )
    Gibberish.ugens = this.ugens = new Map()

    // XXX ridiculous hack to get around processor not having a worklet property
    Gibberish.worklet = { ugens: this.ugens }

    this.ugens.set( Gibberish.id, Gibberish )
    processor = this

    this.messages = []
  }

  replaceProperties( obj ) {
    if( Array.isArray( obj ) ) {
      const out = []
      for( let i = 0; i < obj.length; i++ ){
        const prop = obj[ i ]
        if( prop === null ) continue
        //console.log( 'PROP:', prop )
        if( typeof prop === 'object' && prop.id !== undefined ) {
          let objCheck = this.ugens.get( prop.id )

          if( objCheck !== undefined ) {
            out[ i ] = prop.prop !== undefined ? objCheck[ prop.prop ] : objCheck

            if( prop.prop !== undefined ) console.log( 'got a ssd.out', prop, objCheck )
          }else{
            out[ i ]= prop
          }
        }else{
          if( typeof prop === 'object' && prop.action === 'wrap' ) {
            out[ i  ] = prop.value.bind( null, ...this.replaceProperties( prop.args ) )
          }else if( Array.isArray( prop ) ) {
            out[ i ] = this.replaceProperties( prop )
          }else{
            out[ i ] = prop
          }
        }
      }

      return out
    }else{
      const properties = obj
      for( let key in properties) {
        let prop = properties[ key ]
        if( typeof prop === 'object' && prop !== null && prop.id !== undefined ) {
          let objCheck = this.ugens.get( prop.id )
          if( objCheck !== undefined ) {
            properties[ key ] = objCheck
          } 
        }else if( Array.isArray( prop ) ) {
          properties[ key ] = this.replaceProperties( prop )
        }else{
          if( typeof prop === 'object' && prop !== null && prop.action === 'wrap' ) {
            properties[ key ] = prop.value()
          }
        }
      } 
      return properties
    }
    return obj
  }

  handleMessage( event ) {
    //console.log( 'addr:', event.data.address )
    if( event.data.address === 'add' ) {

      const rep = event.data
      let constructor = Gibberish

      for( let i = 0; i < rep.name.length; i++ ) { constructor = constructor[ rep.name[ i ] ] }

      let properties = this.replaceProperties(  eval( '(' + rep.properties + ')' ) )
      //console.log( 'properties:', properties )

      let ugen

      // if object is not a gibberish ugen...
      if( properties.nogibberish ) {
        ugen = properties
      }else{
        ugen = properties.isop !== undefined ? constructor( ...properties.inputs ) :  constructor( properties )
      }
      
      if( rep.post ) {
        ugen[ rep.post ]()
      }

      this.ugens.set( rep.id, ugen )

      initialized = true

    }else if( event.data.address === 'method' ) {
      //console.log( 'method:', event.data.name )
      //console.log( event.data.address, event.data.name, event.data.args, this.ugens )
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      obj[ dict.name ]( ...dict.args.map( Gibberish.proxyReplace ) ) 
    }else if( event.data.address === 'property' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      obj[ dict.name ] = dict.value
    }else if( event.data.address === 'print' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      console.log( 'printing:', dict.object, obj )
    }else if( event.data.address === 'set' ) {
      const dict = event.data
      const obj = this.ugens.get( dict.object )
      obj[ dict.name ] = dict.value
    }else if( event.data.address === 'copy' ) {
      const target = this.ugens.get( event.data.id )
      target.data.onload( event.data.buffer )
    }else if( event.data.address === 'callback' ) {
      console.log( Gibberish.callback.toString() )
    }  
  }

  process(inputs, outputs, parameters) {
    if( initialized === true ) {
      const gibberish = Gibberish
      const scheduler = gibberish.scheduler
      let   callback  = this.callback
      let   ugens     = gibberish.callbackUgens 

      this.messages.length = 0
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

          //try{
            this.callback = callback = gibberish.generateCallback()
            ugens = gibberish.callbackUgens
            // XXX should we try/catch the callback here?
            //const out = callback.apply( null, ugens )
            //output[0][ i ] = out[0]
            //output[1][ i ] = out[1] 
          //}catch(e) {

          //  console.log( 'callback error:', e, callback.toString() )
          //  this.callback = callback = oldCallback
          //  ugens = gibberish.callbackUgens = oldUgens
          //  gibberish.callbackNames = ugens.map( v => v.ugenName )
          //}
        }
        const out = callback.apply( null, ugens )
        output[0][ i ] = out[0]
        output[1][ i ] = out[1] 
      }
      
      if( this.messages.length > 0 ) {
        /*console.log( 'msgs:', this.messages )
        this.port.postMessage({ 
          address:'state', 
          messages:this.messages 
        })*/
      }
    }
   
    // make sure this is always returned or the callback ceases!!!
    return true
  }
}

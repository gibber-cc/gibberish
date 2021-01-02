class GibberishProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {}

  constructor( options ) {
    super( options )

    Gibberish = global.Gibberish
    Gibberish.ctx = { sampleRate }
    Gibberish.genish.hasWorklet = false
    Gibberish.preventProxy = true
    
    // TODO: need to figure out how to read memory amount
    // perhaps attach initialization to a message instead?
    // then we could easily re-init...
    Gibberish.init( undefined, undefined, 'processor' )
    Gibberish.preventProxy = false
    Gibberish.debug = false 
    Gibberish.processor = this

    this.port.onmessage = this.handleMessage.bind( this )
    this.queue = []
    Gibberish.ugens = this.ugens = new Map()

    // XXX ridiculous hack to get around processor not having a worklet property
    Gibberish.worklet = { ugens: this.ugens, port:this.port }

    this.ugens.set( Gibberish.id, Gibberish )

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
          if( prop === null ) continue

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

  // playback delayed messages and clear the queue
  playQueue() {
    // must set delay property to false!!! otherwise the message
    // will be delayed continually...
    this.queue.forEach( m => { m.data.delay = false; this.handleMessage( m ) } )
    this.queue.length = 0
  }

  handleMessage( event ) {
    if( event.data.delay === true ) {
      // we want to delay this message for some time in the future,
      // for example, when forcing code to execute at the start of the next
      // measure. playQueue will trigger all messages in the queue
      this.queue.push( event )

      return
    }

    if( event.data.address === 'add' ) {
      const rep = event.data
      let constructor = Gibberish

      let properties = this.replaceProperties(  eval( '(' + rep.properties + ')' ) )
      //console.log( 'properties:', properties )

      let ugen

      // if object is not a gibberish ugen...
      if( properties.nogibberish ) {
        ugen = properties
      }else{
        for( let i = 0; i < rep.name.length; i++ ) { constructor = constructor[ rep.name[ i ] ] }

        properties.id = rep.id
        
        ugen = properties.isop === true || properties.isPattern === true 
          ? constructor( ...properties.inputs ) 
          : constructor( properties )

        if( properties.isPattern ) {
          for( let key in properties ) {
            if( key !== 'input' && key !== 'isPattern' ) {
              ugen[ key ] = properties[ key ]
            }
          }
        }
      }
      
      if( rep.post ) {
        ugen[ rep.post ]()
      }

      //console.log( 'adding ugen:', ugen.id, ugen, rep )
      this.ugens.set( rep.id, ugen )

      ugen.id = rep.id
      initialized = true

    }else if( event.data.address === 'method' ) {
      //if( event.data.name === 'clear' )
        //console.log( event.data.address, event.data.name, event.data.args, this.ugens )

      const dict = event.data
      const obj  = this.ugens.get( dict.object )

      if( obj === undefined || typeof obj[ dict.name ] !== 'function' ) return
      // for edge case when serialized functions are being passed to method calls
      if( dict.functions === true ) {
        obj[ dict.name ]( eval( '(' + dict.args + ')' ) ) 
      }else{
        obj[ dict.name ]( ...dict.args.map( Gibberish.proxyReplace ) ) 
      }
    }else if( event.data.address === 'property' ) {
      // XXX this is the exact same as the 'set' key... ugh.
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      let value = dict.value
      if( typeof dict.value === 'object' && dict.value !== null && dict.value.id !== undefined ) {
        value = this.ugens.get( dict.value.id )
      }
      obj[ dict.name ] = value

    }else if( event.data.address === 'print' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object ) 
      console.log( 'printing:', dict.object, obj )
    }else if( event.data.address === 'printProperty' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      console.log( 'printing:', obj[ dict.name ] )    
    }else if( event.data.address === 'set' ) {
      const dict = event.data
      const obj = this.ugens.get( dict.object )
      let value = dict.value
      if( typeof dict.value === 'object' && dict.value !== null && dict.value.id !== undefined ) {
        value = this.ugens.get( dict.value.id )
      }
      obj[ dict.name ] = value
    }else if( event.data.address === 'copy' ) {
      const target = this.ugens.get( event.data.id )

      if( target === undefined ) {
        // this should only occur when a buffer is loaded prior to a delayed instantiation. for example,
        // if gibber starts downloading a file, on beat two and is finished by beat three, the next measure
        // will not have occurred yet, meaning a delayed sampler instantiation will not yet have occurred.
        // in this case, we wait until the next measure boundary.
        this.queue.push( event )
      }else{
        target.data.onload( event.data.buffer )
      }
    }else if( event.data.address === 'copy_multi' ) {
      const target = this.ugens.get( event.data.id )

      if( target === undefined ) {
        // this should only occur when a buffer is loaded prior to a delayed instantiation. for example,
        // if gibber starts downloading a file, on beat two and is finished by beat three, the next measure
        // will not have occurred yet, meaning a delayed sampler instantiation will not yet have occurred.
        // in this case, we wait until the next measure boundary.
        this.queue.push( event )
      }else{
        target.samplers[ event.data.filename ].data.onload( event.data.buffer )
      }
    }else if( event.data.address === 'callback' ) {
      console.log( Gibberish.callback.toString() )
    }else if( event.data.address === 'addConstructor' ) {
      const wrapper = eval( '(' + event.data.constructorString + ')' )
      Gibberish[ event.data.name ] = wrapper( Gibberish, Gibberish.genish )
    }else if( event.data.address === 'addMethod' ) {
      const target = this.ugens.get( event.data.id )

      if( target[ event.data.key ] === undefined ) {
        target[ event.data.key ] = eval( '(' + event.data.function + ')' )
        //console.log( 'adding method:', target, event.data.key )
      }
    }else if( event.data.address === 'monkeyPatch' ) {
      const target = this.ugens.get( event.data.id )
      if( target['___'+event.data.key] === undefined ) {
        target[ '___' + event.data.key ] = target[ event.data.key ]
        target[ event.data.key ] = eval( '(' + event.data.function + ')' )
        //console.log( 'monkey patch:', target, event.data.key )
      }
    }else if( event.data.address === 'dirty' ) {
      const obj = this.ugens.get( event.data.id )
      Gibberish.dirty( obj )
    }else if( event.data.address === 'initialize' ) {
      initialized = true
    }else if( event.data.address === 'addToProperty' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      obj[ dict.name ][ dict.key ] = dict.value
    }else if( event.data.address === 'addObjectToProperty' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      obj[ dict.name ][ dict.key ] = this.ugens.get( dict.value )
    }else if( event.data.address === 'messages' ) {
      console.log( 'messages:', this.messages )
    }else if( event.data.address === 'eval' ) {
      eval( event.data.code )
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
      let phase = 0
      for (let i = 0; i < len; ++i) {
        phase = scheduler.tick()

        if( gibberish.graphIsDirty ) {
          const oldCallback = callback
          const oldUgens = ugens.slice(0)
          const oldNames = gibberish.callbackNames.slice(0)

          let cb
          try{
            cb = gibberish.generateCallback()
          } catch(e) {
            console.log( 'callback error:', e )

            cb = oldCallback
            gibberish.callbackUgens = oldUgens
            gibberish.callbackNames = oldNames
            gibberish.dirtyUgens.length = 0
            gibberish.graphIsDirty = false
          } finally {
            ugens = gibberish.callbackUgens
            this.callback = callback = cb
            this.port.postMessage({ address:'callback', code:cb.toString() }) 
          } 
        }
        const out = callback.apply( null, ugens )

        output[0][ i ] = out[0]
        output[1][ i ] = out[1] 
      }
      if( ugens.length > 1 ) {
        for( let i = 1; i < ugens.length - 1; i++ ) {
          const ugen = ugens[ i ]
          if( ugen.out !== undefined ) {
            //console.log( ugen.ugenName, ugen.out[0], ugen.out[1] )
            //this.messages.push( ugen.id, 'output', ugen.out.length === 1 ? ugen.out[ 0 ] : ugen.out )
            this.messages.push( ugen.id, 'output', ugen.out[0], ugen.out[1] )
          }
        }
      }     
      if( this.messages.length > 0 ) {
        this.port.postMessage({ 
          address:'state', 
          messages:this.messages 
        })
      }
      this.port.postMessage({
        address:'phase',
        value: phase
      })
    }
   
    // make sure this is always returned or the callback ceases!!!
    return true
  }
}

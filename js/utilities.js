const genish = require( 'genish.js' ),
      AWPF = require( './external/audioworklet-polyfill.js' )

module.exports = function( Gibberish ) {

let uid = 0
const utilities = {
  Make: function( props ){
    const name = props.name || 'Ugen' + (Math.floor( Math.random()*10000 ) )
    const type = props.type || 'Ugen'
    const properties = props.properties || {}
    const block = `
    const ugen = Object.create( Gibberish.prototypes[ '${type}' ] )
    const graphfnc = ${props.constructor.toString()}

    const proxy = Gibberish.factory( ugen, graphfnc(), '${name}', ${JSON.stringify(properties)} )
    if( typeof props === 'object' ) Object.assign( proxy, props )

    return proxy`

    Gibberish[ name ] = new Function( 'props', block )

    Gibberish.worklet.port.postMessage({
      name,
      address:'addConstructor',
      constructorString:`function( Gibberish ) {
      const fnc = ${Gibberish[ name ].toString()}

      return fnc
    }`
    })

    return Gibberish[ name ]
  },

  createContext( ctx, cb, resolve, bufferSize=2048 ) {
    let AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext

    AWPF( window, bufferSize )

    const start = () => {
      if( typeof AC !== 'undefined' ) {
        this.ctx = Gibberish.ctx = ctx === undefined ? new AC({ latencyHint:.025 }) : ctx

        genish.gen.samplerate = this.ctx.sampleRate
        genish.utilities.ctx = this.ctx

        if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
          window.removeEventListener( 'touchstart', start )
        }else{
          window.removeEventListener( 'mousedown', start )
          window.removeEventListener( 'keydown', start )
        }

        const mySource = utilities.ctx.createBufferSource()
        mySource.connect( utilities.ctx.destination )
        mySource.start()
      }

      if( typeof cb === 'function' ) cb( resolve )
    }

    if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
      window.addEventListener( 'touchstart', start )
    }else{
      window.addEventListener( 'mousedown', start )
      window.addEventListener( 'keydown', start )
    }

    return Gibberish.ctx
  },
  
  createWorklet( resolve ) {
    Gibberish.ctx.audioWorklet.addModule( Gibberish.workletPath ).then( () => {
      Gibberish.worklet = new AudioWorkletNode( Gibberish.ctx, 'gibberish', { outputChannelCount:[2] } )

      Gibberish.worklet.connect( Gibberish.ctx.destination )
      Gibberish.worklet.port.onmessage = event => {
        const callback = Gibberish.utilities.workletHandlers[ event.data.address ]
        if( typeof callback === 'function' ) callback( event )     
      }
      Gibberish.worklet.ugens = new Map()

      resolve()
    })
  },

  future( fnc, time, dict ) {
    const keys = Object.keys( dict )
    const code = `
      const fnc = ${fnc.toString()}
      const args = [${keys.map( key => typeof dict[key] === 'object' ? dict[ key ].id : `'${dict[ key]}'` ).join(',')}]
      const objs = args.map( v => typeof v === 'number' ? Gibberish.processor.ugens.get(v) : v )
      Gibberish.scheduler.add( ${time}, ()=> fnc( ...objs ), 1 )
    ` 
    Gibberish.worklet.port.postMessage({ 
      address:'eval', 
      code
    })
  },

  workletHandlers: {
    phase( event ) {
      Gibberish.phase = event.data.value
      if( typeof Gibberish.onphaseupdate === 'function' ) {
        Gibberish.onphaseupdate( Gibberish.phase )
      }
    },
    __sequencer( event ) {
      const message = event.data
      const id = message.id
      const eventName = message.name
      const obj = Gibberish.worklet.ugens.get( id )
      if( obj !== undefined && obj.publish !== undefined )
        obj.publish( eventName, message )
    },
    callback( event ) {
      if( typeof Gibberish.oncallback === 'function' ) {
        Gibberish.oncallback( event.data.code )
      }
    },
    get( event ) {
      let name = event.data.name
      let value
      if( name[0] === 'Gibberish' ) {
        value = Gibberish
        name.shift()
      }
      for( let segment of name ) {
        value = value[ segment ]
      }

      Gibberish.worklet.port.postMessage({
        address:'set',
        name:'Gibberish.' + name.join('.'),
        value
      })
    },
    state( event ){
      const messages = event.data.messages
      if( messages.length === 0 ) return

      // XXX is preventProxy actually used?
      Gibberish.preventProxy = true
      Gibberish.proxyEnabled = false

      let i = 0
      while( i < messages.length ) {
        const id = messages[ i ] 
        const propName = messages[ i + 1 ]
        const valueL = messages[ i + 2 ]
        const valueR = messages[ i + 3 ]
        const value = valueL
        const obj = Gibberish.worklet.ugens.get( id )

        if( Gibberish.worklet.debug === true ) {
          if( propName !== 'output' ) console.log( propName, value, id )
        }

        if( typeof propName !== 'string' ) continue
        
        if( obj !== undefined && propName.indexOf('.') === -1 && propName !== 'id' ) { 
          if( obj[ propName ] !== undefined ) {
            if( typeof obj[ propName ] !== 'function' ) {
              if( propName === 'output' ) {
                obj[ propName ] = [ valueL, valueR ]
              }else{
                obj[ propName ] = value
              }
            }else{
              obj[ propName ]( value )
            }
          }else{
            obj[ propName ] = value
          }
        }else if( obj !== undefined ) {
          const propSplit = propName.split('.')
          if( obj[ propSplit[ 0 ] ] !== undefined ) {
            if( typeof obj[ propSplit[ 0 ] ][ propSplit[ 1 ] ] !== 'function' ) {
              obj[ propSplit[ 0 ] ][ propSplit[ 1 ] ] = value
            }else{
              obj[ propSplit[ 0 ] ][ propSplit[ 1 ] ]( value )
            }
          }else{
            //console.log( 'undefined split property!', id, propSplit[0], propSplit[1], value, obj )
          }
        }
        // XXX double check and make sure this isn't getting sent back to processornode...
        // console.log( propName, value, obj )
        i += propName === 'output' ? 4 : 3
      }
      Gibberish.preventProxy = false
      Gibberish.proxyEnabled = true
    }
  },

  createPubSub( obj ) {
    const events = {}
    obj.on = function( key, fcn ) {
      if( typeof events[ key ] === 'undefined' ) {
        events[ key ] = []
      }
      events[ key ].push( fcn )
      return obj
    }

    obj.off = function( key, fcn ) {
      if( typeof events[ key ] !== 'undefined' ) {
        const arr = events[ key ]

        arr.splice( arr.indexOf( fcn ), 1 )
      }
      return obj
    }

    obj.publish = function( key, data ) {
      if( typeof events[ key ] !== 'undefined' ) {
        const arr = events[ key ]

        arr.forEach( v => v( data ) )
      }
      return obj
    }
  },

  wrap( func, ...args ) {
    const out = {
      action:'wrap',
      value:func,
      // must return objects containing only the id number to avoid
      // creating circular JSON references that would result from passing actual ugens
      args: args.map( v => { return { id:v.id } })
    }
    return out
  },

  export( obj ) {
    obj.wrap = this.wrap
    obj.future = this.future
    obj.Make = this.Make
  },

  getUID() { return uid++ }
}

return utilities

}

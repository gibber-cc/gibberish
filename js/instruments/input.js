const ugen    = require( '../ugen.js' )(),
      __proxy = require( '../workletProxy.js' )

/* we need to:
 * 1. create the mediastream node and connect it as an input to our worklet
 * 2. change the callback to (optionally?) include an input
 * 3. use custom codegen in instrument to access input stream in callback
 *
 * look at misc/bus2 for example of how to create custom callback that
 * doesn't use genish
 *
 * could we also use ugen.block to just insert a static line of code?
 * maybe we could add getter/setter so that it can't be overridden?
 *
 * concern: we could just add 'input' as input to our callback function
 */

const Audio = {
  __hasInput: false,
  input:      null,
  ctx:        null,

  start( Gibberish ) {
    console.log( 'connecting audio input...' )

    const p = new Promise( resolve => {
      if( Audio.input === null ) {
        console.log( 'start?' )
        navigator.mediaDevices.getUserMedia({ audio:true, video:false })
          .then( stream => {
            console.log( 'audio input connected' )
            Audio.input = Gibberish.ctx.createMediaStreamSource( stream )
            Audio.__hasInput = true

            resolve( Audio.input )
          })
          .catch( err => { 
            console.log( 'error opening audio input:', err )
          })
      }else{
        resolve( Audio.input )
      }
    })
    return p
  }
}
  
module.exports = function( Gibberish ) {

  const Input = __props => {
    const input = Object.create( ugen )
    const proxy = __proxy( Gibberish )
    const output = new Float64Array( 1 )
    const props = Object.assign({}, Input.defaults, __props )

    let phase = 0

    if( Audio.input === null ) Audio.start( Gibberish )

    Object.assign( input, {
      callback( buffer ) {
        output[0] = buffer[ phase++ % buffer.length ]
        return output
      },

      id : Gibberish.factory.getUID(),
      dirty : false,
      type : 'ugen',
      isStereo: false,
      __properties__:props
    })

    input.ugenName = input.callback.ugenName = 'input_' + input.id
    input.callbackString = input.ugenName + '( input );'

    const out = input.__useProxy__ === true ? proxy( ['Input'], props, input ) : input

    /*
    let gain = 1
    Object.defineProperty( out, 'gain', {
      get() { return gain },
      set(v){ 
        gain = v
        out.inputs[ out.inputs.length - 1 ] = gain
        Gibberish.dirty( out )
      }
    })
    */

    return out
  }

  Input.defaults = { gain:1, __useProxy__:true }

  return Input 
}

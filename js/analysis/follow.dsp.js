const g = require( 'genish.js' ),
      analyzer = require( './analyzer.js' ),
      ugen = require( '../ugen.js' )

const genish = g

/*
 * XXX need to also enable following of non-abs values.
 * ,,, or do we? what are valid negative property values in this
 * version of Gibberish?
 */ 
module.exports = function( Gibberish ) {

  const Follow = function( __props ){
    const props = Object.assign( {}, Follow.defaults, __props )

    let isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false

    let out = props 

    /* if we are in the main thread,
     * only send a command to make a Follow instance
     * to the processor thread and include the id #
     * of the input ugen.
     */

    //console.log( 'isStereo:', Gibberish.mode, isStereo, props.input )
    if( Gibberish.mode === 'worklet' ) {
      // send obj to be made in processor thread
      props.input = { id: props.input.id }
      props.isStereo = isStereo

      // creates clashes in processor thread unless
      // we skip a number here... nice
      Gibberish.utilities.getUID()

      props.overrideid = Gibberish.utilities.getUID()

      // XXX seems like this id gets overridden somewhere
      // hence .overrideid
      props.id = props.overrideid

      Gibberish.worklet.port.postMessage({
        address:'add',

        properties:JSON.stringify( props ),

        name:['analysis','Follow']
      })

      Gibberish.worklet.ugens.set( props.overrideid, out )

      let mult = props.multiplier

      Object.defineProperty( out, 'multiplier', {
        get() { return mult },
        set(v){
          mult = v
          Gibberish.worklet.port.postMessage({ 
            address:'set', 
            object:props.overrideid,
            name:'multiplier',
            value:mult
          })
        }
      })

      let offset = props.offset
      Object.defineProperty( out, 'offset', {
        get() { return offset },
        set(v){
          offset = v
          Gibberish.worklet.port.postMessage({ 
            address:'set', 
            object:props.overrideid,
            name:'offset',
            value:offset
          })
        }
      })
    }else{
      //isStereo = props.isStereo

      const buffer = g.data( props.bufferSize, 1 )
      const input  = g.in( 'input' )
      const multiplier = g.in( 'multiplier' )
      const offset     = g.in( 'offset' )
      
      const follow_out = Object.create( analyzer )
      follow_out.id = props.id = __props.overrideid

      let avg = g.data( 1,1, { meta:true } ) // output; make available outside jsdsp block
      const idx = avg.memory.values.idx
  
      const callback = function( memory ) {
        return avg[0]
      }

      const out = {
        callback,
        input:props.input,
        isStereo,
        dirty:true,
        inputNames:[ 'input', 'memory' ],
        inputs:[ props.input ],
        id: Gibberish.utilities.getUID(),

        __properties__: { input:props.input },
      }

      // nonsense to make our custom function work
      out.callback.ugenName = out.ugenName = `follow_out_${follow_out.id}`
      out.id = __props.overrideid

      // begin input tracker
      const follow_in = Object.create( ugen )

      if( isStereo === true ) {
        {
          "use jsdsp"
          // phase to write to follow buffer
          const bufferPhaseOut = g.accum( 1,0,{ max:props.bufferSize, min:0 })

          // hold running sum
          const sum = g.data( 1, 1, { meta:true })

          const mono = g.abs( input[0] + input[1] )

          sum[0] = sum[0] + mono - g.peek( buffer, bufferPhaseOut, { mode:'simple' })

          g.poke( buffer, g.abs( mono ), bufferPhaseOut )

          avg = (sum[0] / props.bufferSize) * multiplier + offset
        }
      }else{
        {
          "use jsdsp"
          // phase to write to follow buffer
          const bufferPhaseOut = g.accum( 1,0,{ max:props.bufferSize, min:0 })

          // hold running sum
          const sum = g.data( 1, 1, { meta:true })

          sum[0] = sum[0] + g.abs( input ) - g.peek( buffer, bufferPhaseOut, { mode:'simple' })
          
          g.poke( buffer, g.abs( input ), bufferPhaseOut )

          avg = (sum[0] / props.bufferSize) * multiplier + offset
        }
      }
      Gibberish.utilities.getUID()

      props.isStereo = false
      const record = Gibberish.factory( 
        follow_in,
        avg, 
        ['analysis', 'follow_in'], 
        props
      )

      // nonsense to make our custom function work
      record.callback.ugenName = record.ugenName = `follow_in_${follow_out.id}`

      if( Gibberish.analyzers.indexOf( record ) === -1 ) Gibberish.analyzers.push( record )

      Gibberish.dirty( Gibberish.analyzers )

      Gibberish.ugens.set( __props.overrideid, record )

      out.record = record
    }

    return out

  }
 
  Follow.defaults = {
    input:0,
    bufferSize:1024,
    multiplier:1,
    offset:0
  }

  return Follow

}

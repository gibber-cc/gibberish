const g = require( 'genish.js' ),
      analyzer = require( './analyzer.js' ),
      ugen = require( '../ugen.js' )

const genish = g

module.exports = function( Gibberish ) {

  const Follow = function( __props ){
    const props = Object.assign( {}, Follow.defaults, __props )

    let out = props 
    if( Gibberish.mode === 'worklet' ) {
      // send obj to be made in processor thread
      props.input = { id: props.input.id }

      props.overrideid = Gibberish.utilities.getUID()

      props.id = props.overrideid

      Gibberish.worklet.port.postMessage({
        address:'add',

        properties:JSON.stringify(props),

        name:['analysis','Follow']
      })
    }else{
      const buffer = g.data( props.bufferSize, 1 )
      const input  = g.in( 'input' )
      
      const follow_out = Object.create( analyzer )
      follow_out.id = __props.overrideid//Gibberish.factory.getUID()

      let avg // output; make available outside jsdsp block

      {
        "use jsdsp"
        // phase to write to follow buffer
        const bufferPhaseOut = g.accum( 1,0,{ max:props.bufferSize, min:0 })

        // hold running sum
        const sum = g.data( 1, 1, { meta:true })

        sum[0] = sum[0] + input - g.peek( buffer, bufferPhaseOut, { mode:'simple' })

        avg = sum[0] / props.bufferSize
      }

      out = Gibberish.factory( 
        follow_out,
        avg, 
        ['analysis', 'follow_out'], 
        props
      )

      Gibberish.ugens.set( __props.overrideid, out )

      out.id = __props.overrideid
      //follow_out.callback.ugenName = follow_out.ugenName = `follow_out_${follow_out.id}`
      const follow_in = Object.create( ugen )

      const idx = buffer.memory.values.idx 

      let phase = 0
      const abs = Math.abs

      // have to write custom callback for input to reuse components from output,
      // specifically the memory from our buffer
      const callback = function( input, memory ) {
        memory[ idx + phase ] = abs( input )
        phase++
        if( phase > props.bufferSize - 1 ) {
          phase = 0
          console.log( memory[ idx ] )
        } 

        return 0     
      }

      //Gibberish.factory( follow_in, input, ['analysis', 'follow_in'], { input:props.input }, callback )
      
      const record = {
        callback,
        input:props.input,
        isStereo:false,
        dirty:true,
        inputNames:[ 'input', 'memory' ],
        inputs:[ props.input ],
        type:'analysis',
        id: Gibberish.utilities.getUID(),

        __properties__: { input:props.input },
      }

      // nonsense to make our custom function work
      record.callback.ugenName = record.ugenName = `follow_in_${follow_out.id}`

      if( Gibberish.analyzers.indexOf( record ) === -1 ) Gibberish.analyzers.push( record )

      Gibberish.dirty( Gibberish.analyzers )
    }

    return out

  }
 
  Follow.defaults = {
    input:0,
    bufferSize:8192
  }

  return Follow

}

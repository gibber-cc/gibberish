const g = require( 'genish.js' ),
      analyzer = require( './analyzer.js' ),
      ugen = require( '../ugen.js' )

const genish = g

module.exports = function( Gibberish ) {
 
const Follow = inputProps => {

  // main follow object is also the output
  const follow = Object.create( analyzer )
  follow.in  = Object.create( ugen )
  follow.id = Gibberish.factory.getUID()

  const props = Object.assign({}, inputProps, Follow.defaults )
  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true
  
  // the input to the follow ugen is buffered in this ugen
  follow.buffer = g.data( props.bufferSize, 1 ) 
  
  let avg // output; make available outside jsdsp block
  const input = g.in( 'input' )
  
  {
    "use jsdsp"
    // phase to write to follow buffer
    const bufferPhaseOut = g.accum( 1,0,{ max:props.bufferSize, min:0 })

    // hold running sum
    const sum = g.data( 1, 1, { meta:true })

    sum[0] = sum[0] + input - g.peek( follow.buffer, bufferPhaseOut, { mode:'simple' })

    avg = sum[0] / props.bufferSize
  }

  if( !isStereo ) {
    Gibberish.factory( 
      follow,
      avg, 
      'follow_out', 
      props
    )

    follow.callback.ugenName = follow.ugenName = `follow_out_${follow.id}`

    // have to write custom callback for input to reuse components from output,
    // specifically the memory from our buffer
    let idx = follow.buffer.memory.values.idx 
    let phase = 0
    let callback = function( input, memory ) {
      'use strict'
      memory[ idx + phase ] = input
      phase++
      if( phase > props.bufferSize - 1 ) {
        phase = 0
      } 
       
      return 0     
    }

    Gibberish.factory( follow.in, input, 'follow_in', props, callback )

    // lots of nonsense to make our custom function work
    follow.in.callback.ugenName = follow.in.ugenName = `follow_in_${follow.id}`
    follow.in.inputNames = [ 'input' ] 
    follow.in.inputs = [ input ] 
    follow.in.input = props.input
    follow.in.type = 'analysis'

    if( Gibberish.analyzers.indexOf( follow.in ) === -1 ) {
      Gibberish.analyzers.push( follow.in )
    }

    Gibberish.dirty( Gibberish.analyzers )
  }

  return follow
}

Follow.defaults = {
  bufferSize:8192
}

return Follow

}

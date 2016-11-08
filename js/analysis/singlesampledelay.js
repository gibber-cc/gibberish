let g = require( 'genish.js' ),
    analyzer = require( './analyzer.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {
 
let Delay = inputProps => {
  let ssd = Object.create( analyzer )
  ssd.in  = Object.create( ugen )
  ssd.out = Object.create( ugen )

  let props = Object.assign({}, inputProps )
  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' )
    
  let historyL = g.history()

  if( isStereo ) {
    // right channel
    let historyR = g.history()

    historyL.in( input[0] )
    historyR.in( input[1] )

    Gibberish.factory( 
      ssd.out,
      [ historyL.out, historyR.out ], 
      'ssd_out', 
      props 
    )

    Gibberish.factory( 
      ssd.in,
      [ historyL.in, historyR.in ], 
      'ssd_in', 
      props 
    )
  }else{
    Gibberish.factory( ssd.out, historyL.out, 'ssd', props )

    let idx = ssd.out.graph.memory.value.idx 
    let memory = Gibberish.genish.gen.memory.heap
    let callback = function( input ) {
      'use strict'
      memory[ idx ] = input

      return 0     
    }
    let historyInput = input //historyL.in( input )
    Gibberish.factory( ssd.in,  historyInput, 'ssd', props, callback )

    callback.ugenName = ssd.in.ugenName
    ssd.in.inputNames = ['input']
    ssd.in.input =  props.input//historyInput
    ssd.in.inputs = [ props.input ]//input[ historyInput ]
    ssd.type = 'bus'
    ssd.in[0] = props.input//input[0]

    ssd.in.listen = function() {
      if( Gibberish.analyzers.indexOf( ssd.in ) === -1 ) {
        Gibberish.analyzers.push( ssd.in )
        Gibberish.dirty( Gibberish.analyzers )
      }
    }
    ssd.in.gen = function() {
      

    }
  }
  
  return ssd
}

Delay.defaults = {
  input:0,
}

return Delay

}

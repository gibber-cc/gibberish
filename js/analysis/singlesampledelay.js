const g = require( 'genish.js' ),
      analyzer = require( './analyzer.js' ),
      proxy    = require( '../workletProxy.js' ),
      ugen     = require( '../ugen.js' )

module.exports = function( Gibberish ) {
 
// an SSD ugen is in effect two-in-one,
// one for input and one for output.  
  
const SSD = inputProps => {
  const ssd = Object.create( analyzer )

  const props = Object.assign({}, SSD.defaults, inputProps )
  const isStereo = props.isStereo 
  const input    = g.in( 'input' )
  const historyL = g.history(0)
  const historyR = g.history(0)

  ssd.out = Out( [historyL,historyR], props )
  ssd.in  =  In( [historyL,historyR], props )

  ssd.listen = ssd.in.listen

  return ssd 
}

const Out = ( histories,props ) => {
  let history
  // if we don't find our history ugen in the processor thread,
  // just go ahead and make a new one, they're cheap...
  if( Gibberish.mode === 'processor' ) {
    const id = Array.isArray( histories ) ? histories[0].id : histories.id
    history = Gibberish.ugens.get( id )
    if( history === undefined ) {
      history = g.history( 0 )
      Gibberish.ugens.set( id, history )
    }
    if( props === undefined ) props = { id }
  }else{
    history = histories[0]
  }

  return Gibberish.factory( Object.create( ugen ), history.out, ['analysis','SSD_Out'], props, null )
}

const In = histories => {
  const input = g.in( 'input' )
  let historyL, historyR
  
  if( Gibberish.mode === 'processor' ) {
    // for some reason the proessor id is always one off from the main thread id
    historyL = Gibberish.ugens.get( histories.id - 1 )
    historyR = Gibberish.ugens.get( histories.id )
  }else{
    historyL = histories[0]
    historyR = histories[1]
  }

  // deliberate let
  let ssdin = Object.create( ugen )
  
  ssdin.listen = function( input ) {
    ssdin.input = input
    // changing the input must trigger codegen
    Gibberish.dirty( Gibberish.analyzers ) 

    let isStereo = input.isStereo
    if( input.isStereo === undefined && input.isop === true ) {
      isStereo = input.inputs[0].isStereo === true || input.inputs[1].isStereo === true 
    }
    if( isStereo === true && Gibberish.mode === 'processor' ) {
      const idx = historyL.graph.memory.value.idx     
      ssdin.callback = function( input, memory ) {
        memory[ idx ] = input[ 0 ]
        memory[ idx + 1 ] = input[ 1 ]
        return 0     
      }

      // when each ugen callback is passed to the master callback function
      // it needs to have a ugenName property; we'll just copy this over
      ssdin.callback.ugenName = ssdin.ugenName
    }
  }

  ssdin = Gibberish.factory( ssdin, input, ['analysis','SSD_In'], { 'input':0 } )

  // overwrite the callback function in the processor thread...
  if( Gibberish.mode === 'processor' ) {
    const idx = historyL.graph.memory.value.idx
    
    ssdin.callback = function( input, memory ) {
      memory[ idx ] = input
      return 0     
    }

    // when each ugen callback is passed to the master callback function
    // it needs to have a ugenName property; we'll just copy this over
    ssdin.callback.ugenName = ssdin.ugenName
  }

  ssdin.type = 'analysis'
  Gibberish.analyzers.push( ssdin )

  return ssdin
}

SSD.defaults = {
  input:0,
  isStereo:false
}

return { In, Out, SSD }

}

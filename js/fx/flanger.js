let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Flanger = inputProps => {
  let props   = Object.assign( { delayLength:44100 }, Flanger.defaults, inputProps ),
      flanger = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      delayLength = props.delayLength,
      feedbackCoeff = g.in( 'feedback' ),
      modAmount = g.in( 'offset' ),
      frequency = g.in( 'frequency' ),
      delayBufferL = g.data( delayLength ),
      delayBufferR

  let writeIdx = g.accum( 1,0, { min:0, max:delayLength, interp:'none', mode:'samples' })
  
  let offset = g.mul( modAmount, 500 )

  let mod = props.mod === undefined ? g.cycle( frequency ) : props.mod
  
  let readIdx = g.wrap( 
    g.add( 
      g.sub( writeIdx, offset ), 
      mod//g.mul( mod, g.sub( offset, 1 ) ) 
    ), 
	  0, 
    delayLength
  )

  let leftInput = isStereo ? input[0] : input

  let delayedOutL = g.peek( delayBufferL, readIdx, { interp:'linear', mode:'samples' })
  
  g.poke( delayBufferL, g.add( leftInput, g.mul( delayedOutL, feedbackCoeff ) ), writeIdx )

  let left = g.add( leftInput, delayedOutL ),
      right

  if( isStereo === true ) {
    rightInput = input[1]
    delayBufferR = g.data( delayLength )
    
    let delayedOutR = g.peek( delayBufferR, readIdx, { interp:'linear', mode:'samples' })

    g.poke( delayBufferR, g.add( rightInput, g.mul( delayedOutR, feedbackCoeff ) ), writeIdx )
    right = g.add( rightInput, delayedOutR )

    Gibberish.factory( 
      flanger,
      [ left, right ], 
      'flanger', 
      props 
    )

  }else{
    Gibberish.factory( flanger, left, 'flanger', props )
  }
  
  return flanger
}

Flanger.defaults = {
  input:0,
  feedback:.01,
  offset:.25,
  frequency:.5
}

return Flanger

}

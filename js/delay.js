let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Delay = inputProps => {
  let props  = Object.assign( { delayLength: 44100 }, Delay.defaults, inputProps ),
      delay = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      delayTime = g.in( 'delayTime' ),
      leftInput = isStereo ? input[ 0 ] : input,
      rightInput = isStereo ? input[ 1 ] : null
    
  let feedback = g.in( 'feedback' )

  // left channel
  let feedbackHistoryL = g.history()
  let echoL = g.delay( g.add( leftInput, feedbackHistoryL.out ), delayTime, { size:props.delayLength })
  let mixerL = g.mix( echoL, feedbackHistoryL.out, feedback ) 
  feedbackHistoryL.in( mixerL )

  if( isStereo ) {
    console.log('stereo delay!')
    let feedbackHistoryR = g.history()
    let echoR = g.delay( g.add( rightInput,feedbackHistoryR.out ), delayTime, { size:props.delayLength })
    let mixerR = g.mix( echoR, feedbackHistoryR.out, feedback )
    feedbackHistoryR.in( mixerR )

    Gibberish.factory( 
      delay,
      [ mixerL, mixerR ], 
      'delay', 
      props 
    )
  }else{
    Gibberish.factory( delay, mixerL, 'delay', props )
  }
  
  return delay
}

Delay.defaults = {
  input:0,
  feedback:.925,
  delayTime: 11025
}

return Delay

}


/*
feedback = ssd()
 
// feed our oscillator and our ssd into a delay with a delay time of 11025 samples
echo = delay( add( osc, feedback.out ), 11025, { size: 22050 } )
 
// control the mix between feedback and echo; this also damps the feedback.
mixer = mix( echo, feedback.out, .925 )
 
// record output of mixer to process next sample
feedback.in( mixer )
*/

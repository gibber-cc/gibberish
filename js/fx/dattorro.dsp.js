const g = require( 'genish.js' ),
      effect = require( './effect.js' )

const genish = g

const AllPassChain = ( in1, in2, in3 ) => {
  "use jsdsp"

/* in1 = predelay_out */
/* in2 = indiffusion1 */
/* in3 = indiffusion2 */
  
  const sub1 = in1 - 0
  const d1 = g.delay( sub1, 142 )
  sub1.inputs[1] = d1 * in2
  const ap1_out = (sub1 * in2) + d1
  
  const sub2 = ap1_out - 0
  const d2 = g.delay( sub2, 107 )
  sub2.inputs[1] = d2 * in2
  const ap2_out = (sub2 * in2) + d2
  
  const sub3 = ap2_out - 0
  const d3 = g.delay( sub3, 379 )
  sub3.inputs[1] = d3 * in3
  const ap3_out = (sub3 * in3) + d3
  
  const sub4 = ap3_out - 0
  const d4 = g.delay( sub4, 277 )
  sub4.inputs[1] = d4 * in3
  const ap4_out = (sub4 * in3) + d4
  
  return ap4_out
}

  
/*const tank_outs = Tank( ap_out, decaydiffusion1, decaydiffusion2, damping, decay )*/
const Tank  = function( in1, in2, in3, in4, in5 ) {
  "use jsdsp"

  const outs = [ [], [], [], [], [] ]
  
  /* LEFT CHANNEL */
  const leftStart = in1 + 0
  const delayInput = leftStart + 0
  const delay1 = g.delay( delayInput, [g.cycle(.1) * 16 + 672], { size:688 })
  delayInput.inputs[1] = delay1 * in2
  const delayOut = delay1 - delayInput * in2
  
  const delay2 = g.delay( delayOut, [4453,353, 3627, 1190] )
  outs[ 3 ].push( delay2.outputs[1] + delay2.outputs[2] )
  outs[ 2 ].push( delay2.outputs[3] )
  
  const mz = g.history(0)
  const ml = g.mix( delay2, mz.out, in4 )
  mz.in( ml )
  
  const mout = ml * in5
  
  const s1 = mout - 0
  const delay3 = g.delay( s1, [1800,187, 1228] )
  outs[2].push( delay3.outputs[1] )
  outs[4].push( delay3.outputs[2] )
  s1.inputs[1] = delay3 * in3
  const m2 = s1 * in3
  const dl2_out = delay3 + m2
  
  const delay4 = g.delay( dl2_out, [3720,1066,2673] )
  outs[2].push( delay4.outputs[1] )
  outs[3].push( delay4.outputs[2] )    

  /* RIGHT CHANNEL */  
  const rightStart = (delay4 * in5) + in1
  const delayInputR = rightStart + 0
  const delay1R = g.delay( delayInputR, g.cycle(.07) * 16 + 908, { size:924 } )
  delayInputR.inputs[1] = delay1R * in2
  const delayOutR = delay1R - delayInputR * in2
  
  const delay2R = g.delay( delayOutR, [4217, 266, 2974, 2111] )
  outs[ 1 ].push( delay2R.outputs[1] + delay2R.outputs[2] )
  outs[ 4 ].push( delay2R.outputs[3] )
  
  const mzR = g.history(0)
  const mlR = g.mix( delay2R, mzR.out, in4 )
  mzR.in( mlR )
  
  const moutR = mlR * in5
  
  const s1R = moutR - 0
  const delay3R = g.delay( s1R, [2656, 335, 1913] )
  outs[4].push( delay3R.outputs[1] )
  outs[2].push( delay3R.outputs[2] )
  s1R.inputs[1] = delay3R * in3
  const m2R = s1R * in3
  const dl2_outR = delay3R + m2R
  
  const delay4R = g.delay( dl2_outR, [3163,121,1996] )
  outs[4].push( delay4.outputs[1] )
  outs[1].push( delay4.outputs[2] )  
  
  leftStart.inputs[1] = delay4R * in5
  
  outs[1] = g.add( ...outs[1] )
  outs[2] = g.add( ...outs[2] )
  outs[3] = g.add( ...outs[3] )
  outs[4] = g.add( ...outs[4] )  
  return outs
}


module.exports = function( Gibberish ) {

  const Reverb = inputProps => {
    "use jsdsp"

    const props = Object.assign( {}, Reverb.defaults, inputProps ),
          reverb = Object.create( effect ) 
     
    const isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
    
    const input    = g.in( 'input' ),
          damping  = g.in( 'damping' ),
          drywet   = g.in( 'drywet' ),
          decay    = g.in( 'decay' ),
          predelay = g.in( 'predelay' ),
          inbandwidth = g.in( 'inbandwidth' ),
          decaydiffusion1 = g.in( 'decaydiffusion1' ),
          decaydiffusion2 = g.in( 'decaydiffusion2' ),
          indiffusion1 = g.in( 'indiffusion1' ),
          indiffusion2 = g.in( 'indiffusion2' )
  
    const summedInput = isStereo === true ? input[0] + input[1] : input
    
    // calculcate predelay
    const predelay_samps = g.mstosamps( predelay )
    const predelay_delay = g.delay( summedInput, predelay_samps, { size: 4410 })  
    const z_pd = g.history(0)
    const mix1 = g.mix( z_pd.out, predelay_delay, inbandwidth )
    z_pd.in( mix1 )
    
    const predelay_out = mix1

    // run input + predelay through all-pass chain
    const ap_out = AllPassChain( predelay_out, indiffusion1, indiffusion2 )
    
    // run filtered signal into "tank" model
    
    const tank_outs = Tank( ap_out, decaydiffusion1, decaydiffusion2, damping, decay )
    
    const leftWet  = (tank_outs[1] - tank_outs[2]) * .6
    const rightWet = (tank_outs[3] - tank_outs[4]) * .6
    
    const left  = g.mix( isStereo ? input[0] : input, leftWet,  drywet )
    const right = g.mix( isStereo ? input[1] : input, rightWet, drywet )
    
    /*let outputL = g.add( g.mul( outL, wet1 ), g.mul( outR, wet2 ), g.mul( isStereo === true ? input[0] : input, dry ) ),*/
    /*outputR = g.add( g.mul( outR, wet1 ), g.mul( outL, wet2 ), g.mul( isStereo === true ? input[1] : input, dry ) )*/

    Gibberish.factory( reverb, [left,right], 'dattorro', props )

    return reverb
  }


  Reverb.defaults = {
    input:0,
    damping:.5,
    drywet:.5,
    decay:.5,
    predelay: 10,
    inbandwidth: .5,
    indiffusion1: .75,
    indiffusion2: .625,
    decaydiffusion1:.7,
    decaydiffusion2:.5
  }

  return Reverb 

}


const genish = require( 'genish.js' )
const g = genish

// based on http://www.martin-finke.de/blog/articles/audio-plugins-018-polyblep-oscillator/
const polyBlep = function( __frequency, argumentProps ) {
  'use jsdsp'
  if( argumentProps === undefined ) argumentProps = { type: 'saw' }
  
  const mem = g.history(0)
  const type = argumentProps.type
  const frequency = __frequency === undefined ? 220 : __frequency
  const dt = frequency / g.gen.samplerate
  
  const t = g.accum( dt, 0, { min:0 })
  let osc

  // triangle waves are integrated square waves, so the below case accomodates both types
  if( type === 'tri' || type === 'sqr' ) {
    // lt NOT gt to get correct phase
    osc = (2 * g.lt(t,.5) ) - 1
  }else{
    osc = 2 * t - 1
  }
  const case1 = g.lt(t,dt)
  const case2 = g.gt(t,1-dt)
  const adjustedT = g.switch( case1, t/dt, g.switch( case2, (t-1)/dt, t ) )
  
  // if/elseif/else with nested ternary operators
  const blep = g.switch(
    case1,
    adjustedT + adjustedT - adjustedT * adjustedT - 1,
    g.switch(
      case2,
      adjustedT * adjustedT + adjustedT + adjustedT + 1,
      // final else case is 0
      0
    )
  )
  
  // triangle waves are integrated square waves, so the below case accomodates both types
  if( type !== 'saw' ) {
    osc = osc + blep
    const t_2 = g.memo( g.mod( t + .5, 1 ) )
    const case1_2 = g.lt(t_2,dt)
    const case2_2 = g.gt(t_2,1-dt)
    const adjustedT_2 = g.switch( case1_2, t_2/dt, g.switch( case2_2, (t_2-1)/dt, t_2 ) )
 
    const blep2 = g.switch(
      case1_2,
      adjustedT_2 + adjustedT_2 - adjustedT_2 * adjustedT_2 * - 1,
      g.switch(
        case2_2,
        adjustedT_2 * adjustedT_2 + adjustedT_2 + adjustedT_2 + 1,
        0
      )
    )
    osc = osc - blep2
    
    // leaky integrator to create triangle from square wave
    if( type === 'tri' ) {
      osc = dt * osc + (1 - dt ) * mem.out
      mem.in( osc )
    }
  }else{
    osc = osc - blep
  }
  
  return osc
}

module.exports = polyBlep 

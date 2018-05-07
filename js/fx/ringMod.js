let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let RingMod = inputProps => {
  let props   = Object.assign( {}, RingMod.defaults, effect.defaults, inputProps ),
      ringMod = Object.create( effect )

  ringMod.__createGraph = function() {
    let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
    
    let input = g.in( 'input' ),
        frequency = g.in( 'frequency' ),
        gain = g.in( 'gain' ),
        mix = g.in( 'mix' )
    
    let leftInput = isStereo ? input[0] : input,
        sine = g.mul( g.cycle( frequency ), gain )
   
    let left = g.add( g.mul( leftInput, g.sub( 1, mix )), g.mul( g.mul( leftInput, sine ), mix ) ), 
        right

    let out
    if( isStereo === true ) {
      let rightInput = input[1]
      right = g.add( g.mul( rightInput, g.sub( 1, mix )), g.mul( g.mul( rightInput, sine ), mix ) ) 
      
      ringMod.graph = [ left, right ]
    }else{
      ringMod.graph = left
    }
  }

  ringMod.__createGraph() 
  ringMod.__requiresRecompilation = [ 'input' ]

  const out = Gibberish.factory( 
    ringMod,
    ringMod.graph, 
    'ringMod', 
    props 
  )
  
  return out 
}

RingMod.defaults = {
  input:0,
  frequency:220,
  gain: 1, 
  mix:1
}

return RingMod

}

const g = require( 'genish.js' ),
      effect = require( './effect.js' )

const genish = g

/*

         exp(asig * (shape1 + pregain)) - exp(asig * (shape2 - pregain))
  aout = ---------------------------------------------------------------
         exp(asig * pregain)            + exp(-asig * pregain)

*/

module.exports = function( Gibberish ) {

  let Distortion = inputProps => {
    "use jsdsp"

    let props = Object.assign( {}, Distortion.defaults, inputProps ),
        distortion= Object.create( effect )

    let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 

    const input = g.in( 'input' ),
          shape1 = g.in( 'shape1' ),
          shape2 = g.in( 'shape2' ),
          pregain = g.in( 'pregain' ),
          postgain = g.in( 'postgain' )

    const linput = isStereo ? input[0] : input
    const ltop = g.exp( linput * (shape1 + pregain) ) - g.exp( linput * (shape2 - pregain) )
    const lbottom = g.exp( linput * pregain ) + g.exp( -1 * linput * pregain )
    const lout = ( ltop / lbottom ) * postgain

    if( isStereo ) {

      const rinput = isStereo ? input[1] : input
      const rtop = g.exp( rinput * (shape1 + pregain) ) - g.exp( rinput * (shape2 - pregain) )
      const rbottom = g.exp( rinput * pregain ) + g.exp( -1 * rinput * pregain )
      const rout = ( rtop / rbottom ) * postgain

      Gibberish.factory( 
        distortion,
        [ lout, rout ], 
        'distortion', 
        props 
      )
    }else{
      Gibberish.factory( distortion, lout, 'distortion', props )
    }
    
    return distortion 
  }

  Distortion.defaults = {
    input:0,
    shape1:.1,
    shape2:.1,
    pregain:5,
    postgain:.5,
  }

  return Distortion

}

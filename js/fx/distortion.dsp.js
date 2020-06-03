const g = require( 'genish.js' ),
      effect = require( './effect.js' )

const genish = g

// taken from csound: http://manual.freeshell.org/csound5/distort1.html
/*

         exp(asig * (shape1 + pregain)) - exp(asig * (shape2 - pregain))
  aout = ---------------------------------------------------------------
         exp(asig * pregain)            + exp(-asig * pregain)

*/

module.exports = function( Gibberish ) {

  let Distortion = inputProps => {
    let props = Object.assign( {}, effect.defaults, Distortion.defaults, inputProps ),
        distortion= Object.create( effect ),
        out

    distortion.__createGraph = function() {
      let isStereo = false
      if( out === undefined ) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false 
      }else{
        isStereo = out.input.isStereo
        out.isStereo = isStereo
      }

      const input = g.in( 'input' ),
            inputGain = g.in( 'inputGain' ),
            shape1 = g.in( 'shape1' ),
            shape2 = g.in( 'shape2' ),
            pregain = g.in( 'pregain' ),
            postgain = g.in( 'postgain' )

      let lout
      {
        'use jsdsp'
        const linput = isStereo ? g.mul( input[0], inputGain ) : g.mul( input, inputGain )
        const ltop = g.exp( linput * (shape1 + pregain) ) - g.exp( linput * (shape2 - pregain) )
        const lbottom = g.exp( linput * pregain ) + g.exp( -1 * linput * pregain )
        lout = ( ltop / lbottom ) * postgain
      }

      if( isStereo ) {
        let rout
        {
          'use jsdsp'
          const rinput = isStereo ? g.mul( input[1], inputGain ) : g.mul( input, inputGain )
          const rtop = g.exp( rinput * (shape1 + pregain) ) - g.exp( rinput * (shape2 - pregain) )
          const rbottom = g.exp( rinput * pregain ) + g.exp( -1 * rinput * pregain )
          rout = ( rtop / rbottom ) * postgain
        }

        distortion.graph = [ lout, rout ]
      }else{
        distortion.graph = lout 
      }
    }

    distortion.__createGraph()
    distortion.__requiresRecompilation = [ 'input' ]

    out = Gibberish.factory( 
      distortion,
      distortion.graph, 
      [ 'fx','distortion' ], 
      props 
    )
    return out 
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

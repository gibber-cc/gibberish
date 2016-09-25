let g = require( 'genish.js' )

/*
Gibberish.Filter24 = function() {
  var poles  = [0,0,0,0],
      poles2 = [0,0,0,0],
      output = [0,0],
      phase  = 0,
      _cutoff = isNaN(arguments[0]) ? .1 : arguments[0],
      _resonance = isNaN(arguments[1]) ? 3 : arguments[1]
      _isLowPass = typeof arguments[2] !== 'undefined' ? arguments[2] : true;
      
  Gibberish.extend( this, { 
  	name : "filter24",
  
	  properties : { input:0, cutoff:_cutoff, resonance:_resonance, isLowPass:_isLowPass },

    callback : function(sample, cutoff, resonance, isLowPass) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
			var rezz = poles[3] * resonance; 
			rezz = rezz > 1 ? 1 : rezz;
						
			cutoff = cutoff < 0 ? 0 : cutoff;
			cutoff = cutoff > 1 ? 1 : cutoff;
						
			output1 -= rezz;

			poles[0] = poles[0] + ((-poles[0] + output1) * cutoff);
			poles[1] = poles[1] + ((-poles[1] + poles[0])  * cutoff);
			poles[2] = poles[2] + ((-poles[2] + poles[1])  * cutoff);
			poles[3] = poles[3] + ((-poles[3] + poles[2])  * cutoff);

			output1 = isLowPass ? poles[3] : output1 - poles[3];
      
      if(channels === 2) {
        var output2 = sample[1];

  			rezz = poles2[3] * resonance; 
  			rezz = rezz > 1 ? 1 : rezz;

  			output2 -= rezz;

  			poles2[0] = poles2[0] + ((-poles2[0] + output2) * cutoff);
  			poles2[1] = poles2[1] + ((-poles2[1] + poles2[0])  * cutoff);
  			poles2[2] = poles2[2] + ((-poles2[2] + poles2[1])  * cutoff);
  			poles2[3] = poles2[3] + ((-poles2[3] + poles2[2])  * cutoff);

  			output2 = isLowPass ? poles2[3] : output2 - poles2[3];
        output[0] = output1;
        output[1] = output2;
        
        return output;
      }
      
		  return output1; // return mono
  	},
  })
  .init()
  .processProperties(arguments);
  };
*/  

module.exports = function( Gibberish ) {

let Filter24 = props => {
  let polesL = g.data([ 0,0,0,0 ]), polesR = g.data([ 0,0,0,0 ]),
      peekProps = { interp:'none', mode:'simple' }

  let input = g.in( 'input' ),
      rez = g.in('resonance'),
      cutoff = g.in('cutoff'),
      rezzL = g.clamp( g.mul( g.peek( polesL, 3, peekProps ), rez ) ),
      rezzR = g.clamp( g.mul( g.peek( polesR, 3, peekProps ), rez ) ),

      pL0 = g.peek( polesL, 0, peekProps ), pR0 =  g.peek( polesR, 0, peekProps),
      pL1 = g.peek( polesL, 1, peekProps ), pR1 =  g.peek( polesR, 1, peekProps),
      pL2 = g.peek( polesL, 2, peekProps ), pR2 =  g.peek( polesR, 2, peekProps),
      pL3 = g.peek( polesL, 3, peekProps ), pR3 =  g.peek( polesR, 3, peekProps)


  //rezz = rezz > 1 ? 1 : rezz;
        
  //cutoff = cutoff < 0 ? 0 : cutoff;
  //cutoff = cutoff > 1 ? 1 : cutoff;
  let outputL = g.sub( input.left, rezzL ) 
  //output1 -= rezz;

  g.poke( polesL, g.add( pL0, g.mul( g.add( g.mul(-1,pL0), outputL ),cutoff )), 0 )
  g.poke( polesL, g.add( pL1, g.mul( g.add( g.mul(-1,pL1), pL0 ), cutoff )), 1 )
  g.poke( polesL, g.add( pL2, g.mul( g.add( g.mul(-1,pL2), pL1 ), cutoff )), 2 )
  g.poke( polesL, g.add( pL3, g.mul( g.add( g.mul(-1,pL3), pL2 ), cutoff )), 3 )

  let outputR = g.sub( input.right, rezzR ) 
  //output1 -= rezz;

  g.poke( polesR, g.add( pR0, g.mul( g.add( g.mul(-1,pR0), outputR ), cutoff )), 0 )
  g.poke( polesR, g.add( pR1, g.mul( g.add( g.mul(-1,pR1), pR0 ), cutoff )), 1 )
  g.poke( polesR, g.add( pR2, g.mul( g.add( g.mul(-1,pR2), pR1 ), cutoff )), 2 )
  g.poke( polesR, g.add( pR3, g.mul( g.add( g.mul(-1,pR3), pR2 ), cutoff )), 3 )

  //poles[0] = poles[0] + ((-poles[0] + output1) * cutoff);
  //poles[1] = poles[1] + ((-poles[1] + poles[0])  * cutoff);
  //poles[2] = poles[2] + ((-poles[2] + poles[1])  * cutoff);
  //poles[3] = poles[3] + ((-poles[3] + poles[2])  * cutoff);

  //output1 = isLowPass ? poles[3] : output1 - poles[3];
  
  let filter = Gibberish.factory( [ pL3, pR3 ], 'filter24', Object.assign({}, Filter24.defaults, props) )

  return filter
}


Filter24.defaults = {
  input:0,
  resonance: 3.5,
  cutoff: .1,
}

return Filter24

}


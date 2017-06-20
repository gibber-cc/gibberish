const genish = require( 'genish.js' ),
      ssd = genish.history,
      noise = genish.noise

module.exports = function() {
  "use jsdsp"

  const b0 = ssd(0), b1 = ssd(0), b2 = ssd(0), b3 = ssd(0), b4 = ssd(0), b5 = ssd(0), b6 = ssd(0)
  const white = ( noise() * 2 ) - 1

  b0.in( ( .99886 * b0.out ) + ( white * .0555179 ) )
  b1.in( ( .99332 * b1.out ) + ( white * .0750579 ) )
  b2.in( ( .96900 * b2.out ) + ( white * .1538520 ) )
  b3.in( ( .88650 * b3.out ) + ( white * .3104856 ) )
  b4.in( ( .55000 * b4.out ) + ( white * .5329522 ) )
  b5.in( ( -.7616 * b5.out ) - ( white * .0168980 ) )

  out = ( b0.out + b0.out + b0.out + b0.out + b0.out + b0.out + b0.out + white * .5362 ) * .11

  b6.in( white * .115926 )
   
  return out

}

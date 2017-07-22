const genish = require( 'genish.js' ),
      ssd = genish.history,
      data = genish.data,
      noise = genish.noise

module.exports = function() {
  "use jsdsp"

  const b = data( 8, 1, { meta: true })
  const white = noise() * 2 - 1

  b[0] = ( .99886 * b[0] ) + ( white * .0555179 )
  b[1] = ( .99332 * b[1] ) + ( white * .0750579 )
  b[2] = ( .96900 * b[2] ) + ( white * .1538520 )
  b[3] = ( .88650 * b[3] ) + ( white * .3104856 )
  b[4] = ( .55000 * b[4] ) + ( white * .5329522 )
  b[5] = ( -.7616 * b[5] ) - ( white * .0168980 )
 
  const out = ( b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + white * .5362 ) * .11

  b[6] = white * .115926

  return out

}

const genish = require( 'genish.js' ),
      ssd = genish.history,
      noise = genish.noise

module.exports = function() {
  "use jsdsp"

  const last = ssd( 0 )

  const white = ( noise() * 2 ) - 1

  let out = last.out + (.02 * white) / 1.02

  last.in( out )

  out *= 3.5
   
  return out
}

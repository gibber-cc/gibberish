let ugen = require( '../ugen.js' )

let effect = Object.create( ugen )

Object.assign( effect, {
  defaults: { bypass:false }
})

module.exports = effect

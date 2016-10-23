module.exports = function( Gibberish ) {

const effects = {
  Freeverb    : require( './freeverb.js'  )( Gibberish ),
  Flanger     : require( './flanger.js'   )( Gibberish ),
  Vibrato     : require( './vibrato.js'   )( Gibberish ),
  Delay       : require( './delay.js'     )( Gibberish ),
  BitCrusher  : require( './bitCrusher.js')( Gibberish ),
  RingMod     : require( './ringMod.js'   )( Gibberish ),
  Filter24    : require( './filter24.js'  )( Gibberish ),
  Biquad      : require( './biquad.js'    )( Gibberish ),
  SVF         : require( './svf.js'       )( Gibberish ),
  Tremolo     : require( './tremolo.js'   )( Gibberish )
}

effects.export = target => {
  for( let key in effects ) {
    if( key !== 'export' ) {
      target[ key ] = effects[ key ]
    }
  }
}

return effects

}

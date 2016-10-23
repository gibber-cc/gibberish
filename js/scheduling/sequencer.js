const Queue = require( '../external/priorityqueue.js' )
const Big   = require( 'big.js' )

module.exports = function( Gibberish ) {

let Sequencer = props => {
  let seq = {
    phase: 0,
    key: props.key || 'note',
    target:  props.target,
    values:  props.values || [ 440 ],
    timings: props.timings|| [ 11025 ],
    valuesPhase:  0,
    timingsPhase: 0,

    tick() {
      let value  = seq.values[  seq.valuesPhase++  % seq.values.length  ],
          timing = seq.timings[ seq.timingsPhase++ % seq.timings.length ]
      
      if( typeof seq.target[ seq.key ] === 'function' ) {
        seq.target[ seq.key ]( value )
      }else{
        seq.target[ seq.key ] = value
      }

      Gibberish.scheduler.add( timing, seq.tick )
    }
  }

  Gibberish.scheduler.add( 0, seq.tick )

  return seq 
}

return Sequencer
}

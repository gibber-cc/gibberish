const g = require( 'genish.js' ),
      __proxy = require( '../workletProxy.js' ),
      ugen = require( '../ugen.js' )()

module.exports = function( Gibberish ) {
  const __proto__ = Object.create( ugen )

  const proxy = __proxy( Gibberish )

  Object.assign( __proto__, {
    start() {
      Gibberish.analyzers.push( this )
      Gibberish.dirty( Gibberish.analyzers )
      return this
    },
    stop() {
      this.disconnect()
      return this
    }
  })

  const Seq2 = { 
    create( inputProps ) {
      const seq = Object.create( __proto__ ),
            properties = Object.assign({}, Seq2.defaults, inputProps )

      seq.phase = 0
      seq.inputNames = [ 'rate' ]
      seq.inputs = [ 1 ]
      seq.nextTime = 0
      seq.__valuesPhase = 0
      seq.__timingsPhase = 0
      seq.id = Gibberish.factory.getUID()
      seq.dirty = true
      seq.type = 'seq'
      seq.__addresses__ = {}

      if( properties.target === undefined ) {
        seq.anonFunction = true
      }else{ 
        seq.anonFunction = false
        seq.callFunction = typeof properties.target[ properties.key ] === 'function'
      }

      properties.id = Gibberish.factory.getUID()

      // need a separate reference to the properties for worklet meta-programming
      Object.assign( seq, properties ) 
      seq.__properties__ = properties

      seq.callback = function( rate ) {
        if( seq.phase >= seq.nextTime ) {
          //let value = seq.values[ seq.valuesPhase++ % seq.values.length ]

          //if( seq.anonFunction || typeof value === 'function' ) {
          //  value = value()
          //} else { 
          //  if( seq.anonFunction === false ) {
          //    if( seq.callFunction === false ) {
          //      seq.target[ seq.key ] = value
          //    }else{
          //      seq.target[ seq.key ]( value ) 
          //    }
          //  }
          //}

          //seq.phase -= seq.nextTime

          //let timing = seq.timings[ seq.timingsPhase++ % seq.timings.length ]
          //if( typeof timing === 'function' ) timing = timing()

          //seq.nextTime = timing
          let value  = typeof seq.values  === 'function' ? seq.values  : seq.values[  seq.__valuesPhase++  % seq.values.length  ],
          timing = typeof seq.timings === 'function' ? seq.timings : seq.timings[ seq.__timingsPhase++ % seq.timings.length ],
          shouldRun = true

          if( typeof timing === 'function' ) timing = timing()

          // XXX this supports an edge case in Gibber, where patterns like Euclid / Hex return
          // objects indicating both whether or not they should should trigger values as well
          // as the next time they should run. perhaps this could be made more generalizable?
          if( typeof timing === 'object' ) {
            if( timing.shouldExecute === 1 ) {
              shouldRun = true
            }else{
              shouldRun = false
            }
            timing = timing.time 
          }

          if( shouldRun ) {
            if( typeof value === 'function' && seq.target === undefined ) {
              value()
            }else if( typeof seq.target[ seq.key ] === 'function' ) {
              if( typeof value === 'function' ) {
                value = value()
              }
              seq.target[ seq.key ]( value )
            }else{
              if( typeof value === 'function' ) value = value()
              seq.target[ seq.key ] = value
            }
          }

          seq.phase -= seq.nextTime
          seq.nextTime = timing
          
          //if( Gibberish.mode === 'processor' ) {
          //  if( seq.__isRunning === true && !isNaN( timing ) ) {
          //    Gibberish.scheduler.add( timing, seq.tick, seq.priority )
          //  }
          //}
        }

        seq.phase += rate

        return 0
      }

      seq.ugenName = seq.callback.ugenName = 'seq_' + seq.id
      
      const idx = Gibberish.memory.alloc( 1 )
      Gibberish.memory.heap[ idx ] = seq.rate
      seq.__addresses__.rate = idx

      let value = seq.rate
      Object.defineProperty( seq, 'rate', {
        get() { return value },
        set( v ) {
          if( value !== v ) {
            Gibberish.memory.heap[ idx ] = v
            Gibberish.dirty( Gibberish.analyzers )
            value = v
          }
        }
      })

      return proxy( ['Sequencer2'], properties, seq ) 
    }
  }

  Seq2.defaults = { rate: 1 }

  return Seq2.create

}


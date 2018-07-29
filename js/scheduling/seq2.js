const g = require( 'genish.js' ),
      __proxy = require( '../workletProxy.js' ),
      ugen = require( '../ugen.js' )()

module.exports = function( Gibberish ) {
  const __proto__ = Object.create( ugen )

  const proxy = __proxy( Gibberish )

  Object.assign( __proto__, {
    start( delay=0 ) {
      if( delay !== 0 ) {
        Gibberish.scheduler.add( delay, ()=> {
          Gibberish.analyzers.push( this )
          Gibberish.dirty( Gibberish.analyzers )
        })
      }else{
        Gibberish.analyzers.push( this )
        Gibberish.dirty( Gibberish.analyzers )
      }
      return this
    },
    stop() {
      const idx = Gibberish.analyzers.indexOf( this )
      Gibberish.analyzers.splice( idx, 1 )
      Gibberish.dirty( Gibberish.analyzers )
      return this
    }
  })

  // XXX we need to implement priority, which will in turn determine the order
  // that the sequencers are added to the callback function.
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

      properties.id = Gibberish.factory.getUID()

      Object.assign( seq, properties ) 
      seq.__properties__ = properties

      
      // XXX this needs to be optimized as much as humanly possible, since it's running at audio rate...
      seq.callback = function( rate ) {
        if( seq.phase >= seq.nextTime ) {
          let value  = typeof seq.values  === 'function' ? seq.values  : seq.values[ seq.__valuesPhase++  % seq.values.length  ],
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
        }

        seq.phase += rate

        return 0
      }

      seq.ugenName = seq.callback.ugenName = 'seq_' + seq.id

      // since we're not passing our sequencer through the ugen template, we need
      // to grab a memory address for its rate so it can be sequenced and define
      // a property that manipulates that memory address.
      const idx = Gibberish.memory.alloc( 1 )
      Gibberish.memory.heap[ idx ] = seq.rate
      seq.__addresses__.rate = idx

      let value = seq.rate
      Object.defineProperty( seq, 'rate', {
        get() { return value },
        set( v ) {
          if( value !== v ) {
            if( typeof v === 'number' ) Gibberish.memory.heap[ idx ] = v

            Gibberish.dirty( Gibberish.analyzers )
            value = v
          }
        }
      })

      return proxy( ['Sequencer2'], properties, seq ) 
    }
  }

  Seq2.defaults = { rate: 1, priority:0 }

  return Seq2.create

}


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
      if( idx > -1 ) {
        Gibberish.analyzers.splice( idx, 1 )
        Gibberish.dirty( Gibberish.analyzers )
      }
      this.phase = 0
      this.nextTime = 0

      return this
    },
    fire(){
      let value  = typeof this.values  === 'function' ? this.values  : this.values[ this.__valuesPhase++  % this.values.length  ]
      if( typeof value === 'function' && this.target === undefined ) {
        value()
      }else if( typeof this.target[ this.key ] === 'function' ) {
        if( typeof value === 'function' ) {
          value = value()
        }
        if( value !== this.DNR ) {
          this.target[ this.key ]( value )
        }
      }else{
        if( typeof value === 'function' ) value = value()
        if( value !== this.DNR )
          this.target[ this.key ] = value
      }
    }
  })

  // XXX we need to implement priority, which will in turn determine the order
  // that the sequencers are added to the callback function.
  const Seq2 = { 
    create( inputProps ) {
      console.log( 'input props:', inputProps )
      const seq = Object.create( __proto__ ),
            properties = Object.assign({}, Seq2.defaults, inputProps )

      seq.phase = 0
      seq.inputNames = [ 'rate', 'density' ]
      seq.inputs = [ 1, 1 ]
      seq.nextTime = 0
      seq.__valuesPhase = 0
      seq.__timingsPhase = 0
      seq.id = Gibberish.factory.getUID()
      seq.dirty = true
      seq.type = 'seq'
      seq.__addresses__ = {}
      seq.DNR = -987654321

      properties.id = Gibberish.factory.getUID()

      Object.assign( seq, properties ) 
      seq.__properties__ = properties

      // support for sequences that are triggered via other means,
      // in Gibber this is when you provide timing to one sequence
      // on an object and want to use that one pattern to trigger
      // multiple sequences.
      if( seq.timings === null ) { seq.nextTime = Infinity } 

      // XXX this needs to be optimized as much as humanly possible, since it's running at audio rate...
      seq.callback = function( rate, density ) {
        while( seq.phase >= seq.nextTime ) {
          let value  = typeof seq.values  === 'function' ? seq.values  : seq.values[ seq.__valuesPhase++  % seq.values.length  ],
              shouldRun = true
          
          let timing = null
          if( seq.timings !== null && seq.timings !== undefined ) { 
            timing = typeof seq.timings === 'function' ? seq.timings : seq.timings[ seq.__timingsPhase++ % seq.timings.length ]
            if( typeof timing === 'function' ) timing = timing()
          }
          
          let shouldIncreaseSpeed = density <= 1 ? false : true

          // XXX this supports an edge case in Gibber, where patterns like Euclid / Hex return
          // objects indicating both whether or not they should should trigger values as well
          // as the next time they should run. perhaps this could be made more generalizable?
          if( timing !== null && typeof timing === 'object' ) {
            if( timing.shouldExecute === 1 ) {
              shouldRun = true
            }else{
              shouldRun = false
            }
            timing = timing.time 
          }else if( timing !== null ) {
            if( Math.random() >= density ) shouldRun = false
          }

          if( shouldRun ) {
            if( seq.mainthreadonly !== undefined ) {
              if( typeof value === 'function' ) {
                value = value()
              }
              Gibberish.processor.messages.push( seq.mainthreadonly, seq.key, value )
            }else if( typeof value === 'function' && seq.target === undefined ) {
              value()
            }else if( typeof seq.target[ seq.key ] === 'function' ) {
              if( typeof value === 'function' ) {
                value = value()
              }
              if( value !== seq.DNR ) {
                seq.target[ seq.key ]( value )
              }
            }else{
              if( typeof value === 'function' ) value = value()
              if( value !== seq.DNR )
                seq.target[ seq.key ] = value
            }
          }

          if( timing === null ) return

          seq.phase -= seq.nextTime

          if( shouldIncreaseSpeed ) {
            timing = Math.random() > (2 - density) ? timing / 2 : timing
          }
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

      const didx = Gibberish.memory.alloc( 1 )
      Gibberish.memory.heap[ didx ] = seq.density
      seq.__addresses__.density = didx

      let dvalue = seq.density
      Object.defineProperty( seq, 'density', {
        get() { return dvalue },
        set( v ) {
          if( dvalue !== v ) {
            if( typeof v === 'number' ) Gibberish.memory.heap[ didx ] = v

            Gibberish.dirty( Gibberish.analyzers )
            dvalue = v
          }
        }
      })

      return proxy( ['Sequencer2'], properties, seq ) 
    }
  }

  Seq2.defaults = { rate: 1, density:1, priority:0, phase:0 }
  Seq2.create.DO_NOT_OUTPUT = -987654321

  return Seq2.create

}


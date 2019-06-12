const __proxy = require( '../workletProxy.js' )
const Pattern = require( 'tidal.pegjs' )

module.exports = function( Gibberish ) {

const proxy = __proxy( Gibberish )

const cps = 1

const Sequencer = props => {
  let __seq
  const seq = {
    __isRunning:false,

    __phase:  0,
    __type:'seq',
    __pattern: Pattern( props.pattern ),
    __events: null,

    tick( priority ) {
      // running for first time, perform a query
      if( seq.__events === null ) {
        seq.__events = seq.__pattern.query( seq.__phase++, 1 )
      }

      const startTime = seq.__events[ 0 ].arc.start

      while( seq.__events.length > 0 && startTime.valueOf() === seq.__events[0].arc.start.valueOf() ) {
        let event  = seq.__events.shift(),
            value  = event.value,
            shouldRun = true

        //if( event.arc.start.valueOf() < nextTime || nextTime === null ) {
        //  nextTime  = event.arc.start.valueOf()
        //  nextEvent = event
        //} 

        if( seq.filters !== null ) value = seq.filters.reduce( (currentValue, filter) => filter( currentValue ), value )  
     
        if( shouldRun ) {
         if( typeof seq.target[ seq.key ] === 'function' ) {
            seq.target[ seq.key ]( value )
          }else{
            seq.target[ seq.key ] = value
          }
        }
      }
      if( Gibberish.mode === 'processor' ) {
        let timing
        if( seq.__events.length <= 0 ) {
          seq.__events = seq.__pattern.query( seq.__phase++, 1 )
          timing = seq.__events[0].arc.start.add( 1 ).sub( startTime ).valueOf() 
        }else{
          timing = seq.__events[0].arc.start.sub( startTime ).valueOf() 
        }
        
        timing *= Gibberish.ctx.sampleRate / cps

        if( seq.__isRunning === true && !isNaN( timing ) ) {
          // XXX this supports an edge case in Gibber, where patterns like Euclid / Hex return
          // objects indicating both whether or not they should should trigger values as well
          // as the next time they should run. perhaps this could be made more generalizable?
          
          //if( typeof timing === 'object' ) {
          //  if( timing.shouldExecute === 1 ) {
          //    shouldRun = true
          //  }else{
          //    shouldRun = false
          //  }
          //  timing = timing.time 
          //}

          //timing *= seq.rate

          Gibberish.scheduler.add( timing, seq.tick, seq.priority )
        }
      }


    },

    start( delay = 0 ) {
      seq.__isRunning = true
      Gibberish.scheduler.add( delay, seq.tick, seq.priority )
      return __seq
    },

    stop() {
      seq.__isRunning = false
      return __seq
    }
  }

  props.id = Gibberish.factory.getUID()

  // need a separate reference to the properties for worklet meta-programming
  const properties = Object.assign( {}, Sequencer.defaults, props )
  Object.assign( seq, properties ) 
  seq.__properties__ = properties

  __seq =  proxy( ['Tidal'], properties, seq )

  return __seq
}

Sequencer.defaults = { priority:100000, pattern:'', rate:1, filters:null }

Sequencer.make = function( values, timings, target, key, priority ) {
  return Sequencer({ values, timings, target, key, priority })
}

return Sequencer

}

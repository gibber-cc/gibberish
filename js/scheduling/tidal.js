const __proxy = require( '../workletProxy.js' )
const Pattern = require( 'tidal.pegjs' )

module.exports = function( Gibberish ) {

const proxy = __proxy( Gibberish )

const Sequencer = props => {
  let __seq
  const seq = {
    __isRunning:false,

    __phase:  0,
    __type:'seq',
    __pattern: Pattern( props.pattern, { addLocations:true, addUID:true, enclose:true }),
    __events: null,

    tick( priority ) {
      // running for first time, perform a query
      if( seq.__events === null || seq.__events.length === 0 ) {
        seq.__events = seq.__pattern.query( seq.__phase++, 1 )
      }

      // used when scheduling events that are very far apart
      if( seq.__events.length <= 0 ) {
        if( Gibberish.mode === 'processor' ) {
          if( seq.__isRunning === true  ) {
            Gibberish.scheduler.add( Gibberish.ctx.sampleRate / Sequencer.clock.cps, seq.tick, seq.priority )
          }

        }

        return
      }

      const startTime = seq.__events[ 0 ].arc.start

      if( seq.key !== 'chord' ) {
        while( seq.__events.length > 0 && startTime.valueOf() === seq.__events[0].arc.start.valueOf() ) {
          let event  = seq.__events.shift(),
              value  = event.value,
              uid    = event.uid

          // for bjorklund etc.
          if( typeof value === 'object' ) value = value.value

          if( seq.filters !== null ) value = seq.filters.reduce( (currentValue, filter) => filter( currentValue, seq, uid ), value )  
          if( seq.mainthreadonly !== undefined ) {
            if( typeof value === 'function' ) {
              value = value()
            }
            Gibberish.processor.messages.push( seq.mainthreadonly, seq.key, value )
          }else if( typeof seq.target[ seq.key ] === 'function' ) {
            seq.target[ seq.key ]( value )
          }else{
            seq.target[ seq.key ] = value
          }
        }
      }else{
        let value = seq.__events.filter( evt => startTime.valueOf() === evt.arc.start.valueOf() ).map( evt => evt.value )
        let uid = seq.__events[0].uid

        const events = seq.__events.splice( 0, value.length )

        if( seq.filters !== null ) {
          if( value.length === 1 ) {
            value = seq.filters.reduce( (currentValue, filter) => filter( currentValue, seq, uid ), value )  
          }else{
            value.forEach( (v,i) => seq.filters.reduce( (currentValue, filter) => filter( currentValue, seq, events[ i ].uid ), v ) )
          }
        }

        if( typeof seq.target[ seq.key ] === 'function' ) {
          seq.target[ seq.key ]( value )
        }else{
          seq.target[ seq.key ] = value
        }
      }

      if( Gibberish.mode === 'processor' ) {
        let timing
        if( seq.__events.length <= 0 ) {
          let time = 0
          while( seq.__events.length <= 0 ) {
            seq.__events = seq.__pattern.query( seq.__phase++, 1 )
            time++
          }
          //seq.__events.forEach( evt => {
          //  evt.arc.start = evt.arc.start.add( 1 ).sub( startTime ) 
          //  evt.arc.end   = evt.arc.end.add( 1 ).sub( startTime )
          //})

          timing = time - startTime.valueOf() 
        }else{
          timing = seq.__events[0].arc.start.sub( startTime ).valueOf() 
        }
        
        timing *= Gibberish.ctx.sampleRate / Sequencer.clock.cps

        if( seq.__isRunning === true && !isNaN( timing ) && timing > 0 ) {
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

    rotate( amt ) {
      seq.__phase += amt
      return __seq 
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

let __uid = 0
Sequencer.getUID = ()=> {
  return __uid++
}

Sequencer.clock = { cps: 1 }

if( Gibberish.mode === 'worklet' ) {
  Sequencer.id = Gibberish.utilities.getUID()
  
  Gibberish.worklet.port.postMessage({
    address:'eval',
    code:`Gibberish.Tidal.clock.id = ${Sequencer.id}; Gibberish.ugens.set( ${Sequencer.id}, Gibberish.Tidal.clock )`
  })
  
  let cps = 1
  Object.defineProperty( Sequencer, 'cps', {
    get() { return cps },
    set(v){ 
      cps = v
      if( Gibberish.mode === 'worklet' ) {
        Gibberish.worklet.port.postMessage({
          address:'set',
          object:Sequencer.id,
          name:'cps',
          value:cps 
        }) 
      }
    }
  })
}

return Sequencer

}

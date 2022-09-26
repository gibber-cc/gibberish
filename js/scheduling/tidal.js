const __proxy = require( '../workletProxy.js' ),
      mini    = require( '../external/mini.js' )

module.exports = function( Gibberish ) {
  const proxy = __proxy( Gibberish )

  const Sequencer = props => {
    let __seq, i = 0
 
    const seq = {
      __isRunning: false,
      __phase: 0,
      __type: 'seq',
      __pattern: mini.mini( props.pattern ),
      //Pattern( props.pattern, { addLocations:true, addUID:true, enclose:true }),
      __events: null,

      tick(priority) {
        let startTime
        // running for first time, perform a query
        if (seq.__events === null || seq.__events.length === 0) {
          startTime = seq.__phase
          seq.__events = seq.__pattern.queryArc(seq.__phase++, 1)
          seq.__events.sort( (a,b) => a.whole.begin.valueOf() > b.whole.begin.valueOf() )
        }else{
          startTime = seq.__events[0].whole.begin
        }

        if (seq.__events.length <= 0) {
          if (Gibberish.mode === 'processor') {
            if (seq.__isRunning === true) {
              Gibberish.scheduler.add(Gibberish.ctx.sampleRate / Sequencer.clock.cps, seq.tick, seq.priority)
            }
          }

          return;
        }

        if (seq.key !== 'chord') {
          while (seq.__events.length > 0 && startTime.valueOf() >= seq.__events[0].whole.begin.valueOf()) {
            let event = seq.__events.shift()
            
            // make sure we should trigger sound
            if( !event.hasOnset() ) continue

            let value = event.value,
                uid   = event.context.locations[0].start.column 

            //console.log( 'evt', uid, event.context.locations )

            if ( typeof value === 'object' ) value = value.value;
            if ( seq.filters !== null ) 
              value = seq.filters.reduce( (currentValue, filter) => filter(currentValue, seq, uid), value)

            if ( seq.mainthreadonly !== undefined ) {
              if ( typeof value === 'function' ) {
                value = value()
              }
              
              Gibberish.processor.messages.push( seq.mainthreadonly, seq.key, value )
            } else if ( typeof seq.target[seq.key] === 'function' ) {
              seq.target [seq.key ]( value )
            } else {
              seq.target[ seq.key ] = value
            }
          }
        } else {
          let value = seq.__events.filter(evt => startTime.valueOf() === evt.whole.begin.valueOf()).map(evt => evt.value);

          let uid = seq.__events[0].context.locations[0].start.column

          const events = seq.__events.splice(0, value.length);

          if( seq.filters !== null ) {
            if( value.length === 1 ) {
              value = seq.filters.reduce( (currentValue, filter) => filter( currentValue, seq, uid ), value )
            } else {
              value.forEach((v, i) => { 
                return seq.filters.reduce( (currentValue, filter) => filter( currentValue, seq, events[i].uid ), v )
              })
            }
          }

          if (typeof seq.target[seq.key] === 'function') {
            seq.target[ seq.key ]( value )
          } else {
            seq.target[ seq.key ] = value
          }
        }

        if (Gibberish.mode === 'processor') {
          let timing

          if(seq.__events.length <= 0) {
            let time = 0

            while (seq.__events.length <= 0) {
              seq.__events = seq.__pattern.queryArc(seq.__phase, ++seq.__phase  )
            } 

            seq.__events.sort( (a,b) => a.whole.begin.valueOf() > b.whole.begin.valueOf() )
          } 

          timing = seq.__events[0].whole.begin.sub( startTime ).valueOf()
          if( timing.valueOf() < 0 ) timing += 1

          //if( timing <= 0 ) timing = Math.abs( timing )

          //console.log( seq.__events[0].whole.begin.toString(), startTime.toString(), timing  )

          //console.log( 'timings:', timing, startTime.valueOf(), seq.__events[0].whole.begin.valueOf() )
          timing *= Math.ceil( Gibberish.ctx.sampleRate / Sequencer.clock.cps )
          //console.log( 'timing:', timing, startTime.valueOf(), seq.__events[0].whole.begin.valueOf() )
          if( seq.__isRunning === true && !isNaN( timing ) ) {
            Gibberish.scheduler.add( timing, seq.tick, seq.priority )
          }
        }
      },

      rotate(amt) {
        seq.__phase += amt;
        return __seq;
      },

      start(delay = 0) {
        seq.__isRunning = true;
        Gibberish.scheduler.add(delay, seq.tick, seq.priority);
        return __seq;
      },

      stop() {
        seq.__isRunning = false;
        return __seq;
      },

      set(patternString) {
        seq.__pattern = Pattern(patternString, {
          addLocations: true,
          addUID: true,
          enclose: true
        });
      }

    };
    props.id = Gibberish.factory.getUID(); // need a separate reference to the properties for worklet meta-programming

    const properties = Object.assign({}, Sequencer.defaults, props);
    Object.assign(seq, properties);
    seq.__properties__ = properties;
    __seq = proxy(['Tidal'], properties, seq);
    return __seq;
  };

  Sequencer.defaults = {
    priority: 100000,
    pattern: '',
    rate: 1,
    filters: null
  };

  Sequencer.make = function (values, timings, target, key, priority) {
    return Sequencer({
      values,
      timings,
      target,
      key,
      priority
    });
  };

  let __uid = 0;

  Sequencer.getUID = () => {
    return __uid++;
  };

  Sequencer.Pattern = mini.mini;
  Sequencer.clock = {
    cps: 1
  };
  Sequencer.id = Gibberish.utilities.getUID();
  Sequencer.mini = mini.mini

  if (Gibberish.mode === 'worklet') {
    Gibberish.worklet.port.postMessage({
      address: 'eval',
      code: `Gibberish.Tidal.clock.id = ${Sequencer.id}; Gibberish.ugens.set( ${Sequencer.id}, Gibberish.Tidal.clock )`
    });
    let cps = 1;
    Object.defineProperty(Sequencer, 'cps', {
      get() {
        return cps;
      },

      set(v) {
        cps = v;

        if (Gibberish.mode === 'worklet') {
          Gibberish.worklet.port.postMessage({
            address: 'set',
            object: Sequencer.id,
            name: 'cps',
            value: cps
          });
        }
      }

    });
  }

  return Sequencer;
};


const __proxy = require( '../workletProxy.js' )

module.exports = function( Gibberish ) {

const renderFnc = function( pattern ) {
  const keys = Object.keys( pattern.dict )
  const objs = Object.values( pattern.dict )
    .map( v => typeof v === 'object' && !Array.isArray( v )
    ? Gibberish.processor.ugens.get(v.id) 
    : v 
    )

  // we create a new inner function using the function constructor,
  // where every argument is codegen'd as an upvalue to the
  // returned function. after codegen we call the functon
  // to get the inner function with the upvalues andd
  // return that. Store references to globals as upvalues as well.
  let code = 'let Gibberish = __Gibberish, global = __global;\n'
  keys.forEach( k => {
    let line = `let ${k} = `
    const value = pattern.dict[ k ]
    const getter = typeof value === 'object' 
      ? Array.isArray( value )
      ? `[${value.toString()}]`
      : `Gibberish.processor.ugens.get(${ value.id })`
      : value
    line += getter 
    code += line + '\n'

  })  
  code +=`return function() { ${ pattern.fncstr } }` 

  // pass in globals to be used as upvalues in final function
  const fnc = new Function( '__Gibberish', '__global', code )( Gibberish, global )

  return fnc 
}

const proxy = __proxy( Gibberish )

const Sequencer = props => {
  let __seq
  let floatError = 0

  const seq = {
    type:'seq',
    __isRunning:false,
    __valuesPhase:  0,
    __timingsPhase: 0,
    __onlyRunsOnce: false,
    __repeatCount: null,
    DNR : -987654321,

    tick( priority ) {
      let value  = typeof seq.values  === 'function' 
          ? seq.values  
          : seq.values[  seq.__valuesPhase++  % seq.values.length  ],

        timing = typeof seq.timings === 'function' 
          ? seq.timings 
          : seq.timings !== null
            ? seq.timings[ seq.__timingsPhase++ % seq.timings.length ]
            : null,

        shouldRun = true
      
      if( seq.__onlyRunsOnce === true ) {
        if( seq.__valuesPhase === seq.values.length ) {
          seq.stop()
        }
      }else if( seq.__repeatCount !== null ) {
        if( seq.__valuesPhase % seq.values.length === 0 ) {
          seq.__repeatCount--
          if( seq.__repeatCount === 0 ) {
            seq.stop()
            seq.__repeatCount = null
          }
        }
      }

      if( typeof timing === 'function' ) timing = timing()

      // XXX this supports an edge case in Gibber, where patterns like Euclid / Hex return
      // objects indicating both whether or not they should should trigger values as well
      // as the next time they should run. perhaps this could be made more generalizable?
      if( timing !== null ) {
        if( typeof timing === 'object' ) {
          if( timing.shouldExecute === 1 ) {
            shouldRun = true
          }else{
            shouldRun = false
          }
          timing = timing.time 
        }

        timing *= seq.rate
      }else{
        shouldRun = false 
      }

      if( value === Sequencer.DO_NOT_OUTPUT ) shouldRun = false

      if( shouldRun ) {
        try{
          if( seq.mainthreadonly !== undefined ) {
            if( typeof value === 'function' ) {
              value = value()
            }
            //console.log( 'main thread only' )
            Gibberish.processor.messages.push( seq.mainthreadonly, seq.key, value )
          }else if( typeof value === 'function' && seq.target === undefined ) {
            value()
          }else if( typeof seq.target[ seq.key ] === 'function' ) {
            //console.log( seq.key, seq.target )
            if( typeof value === 'function' ) value = value()
            if( value !== seq.DNR )
              seq.target[ seq.key ]( value )
          }else{
            if( typeof value === 'function' ) value = value()
            if( value !== seq.DNR )
              seq.target[ seq.key ] = value
          }

          if( seq.reportOutput === true ) {
            Gibberish.processor.port.postMessage({
              address:'__sequencer',
              id: seq.id,
              name:'output',
              value,
              phase: seq.__valuesPhase,
              length: seq.values.length
            })
          }
        } catch(e) {
          console.error( `A sequence targeting ${seq.target.ugenName}.${seq.key} contains an improper value and will be stopped.` )
          return
        }
      }
      
      if( Gibberish.mode === 'processor' ) {
        if( seq.__isRunning === true && !isNaN( timing ) && seq.autotrig === false ) {
          timing += floatError
          Gibberish.scheduler.add( timing, seq.tick, seq.priority )
          floatError = timing - Math.floor( timing )
        }
      }
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
    },

    start( delay = 0 ) {
      if( Gibberish.mode === 'processor' && seq.__isRunning === false ) {
        Gibberish.scheduler.add( 
          delay, 
          priority => {
            seq.tick( priority )
            Gibberish.processor.port.postMessage({
              address:'__sequencer',
              id: seq.id,
              name:'start'
            })
          }, 
          seq.priority 
        )
      }
      seq.__isRunning = true
      seq.__delay = delay
      return __seq
    },

    stop( delay = null ) {
      if( delay === null ) {
        seq.__isRunning = false

        if( Gibberish.mode === 'processor' ) {
          Gibberish.processor.port.postMessage({
            address:'__sequencer',
            id: seq.id,
            name:'stop'
          })
        }
      
      }else{
        Gibberish.scheduler.add( delay, seq.stop )
      }
      return __seq
    },

    once() {
      seq.__onlyRunsOnce = true
      return __seq
    },

    repeat( repeatCount = 2 ) {
      seq.__repeatCount = repeatCount
      return __seq
    }
  }

  props.id = Gibberish.factory.getUID()

  if( Gibberish.mode === 'worklet' ) {
    Gibberish.utilities.createPubSub( seq )
  }else{
    // need a separate reference to the properties for worklet meta-programming
    if( typeof props.values === 'object' && props.values.requiresRender === true ) {
      props.values = renderFnc( props.values )
    }
    if( props.timings !== null && typeof props.timings === 'object' && props.timings.requiresRender === true ) {
      props.timings = renderFnc( props.timings )
    }
  }

  const properties = Object.assign( {}, Sequencer.defaults, props )
  Object.assign( seq, properties ) 
  seq.__properties__ = properties

  __seq =  proxy( ['Sequencer'], properties, seq )

  return __seq
}

Sequencer.defaults = { priority:100, rate:1, reportOutput:false, autotrig:false }

Sequencer.make = function( values, timings, target, key, priority, reportOutput ) {
  return Sequencer({ values, timings, target, key, priority, reportOutput })
}

Sequencer.DO_NOT_OUTPUT = -987654321

return Sequencer

}

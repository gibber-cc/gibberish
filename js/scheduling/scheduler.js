const Queue = require( '../external/priorityqueue.js' )

let Gibberish = null

const Scheduler = {
  phase: 0,

  queue: new Queue( ( a, b ) => {
    if( a.time === b.time ) { 
      return a.priority < b.priority ? -1 : a.priority > b.priority ? 1 : 0;
    }else{
      return a.time - b.time //a.time.minus( b.time )
    }
  }),

  init( __Gibberish ) {
    Gibberish = __Gibberish
  },

  clear() {
    this.queue.data.length = 0
    this.queue.length = 0
    this.phase = 0
  },

  add( time, func, priority = 0 ) {
    time += this.phase

    this.queue.push({ time, func, priority })

    return this.phase
  },

  remove( __func ) {
    for( let i = 0; i < this.queue.data.length; i++ ) {
      const func = this.queue.data[i].func
      if( func === __func ) {
        this.queue.data.splice( i, 1 )
        break
      }
    }
  },

  tick( usingSync = false ) {
    if( this.shouldSync === usingSync ) {
      if( this.queue.length ) {
        let next = this.queue.peek()

        if( isNaN( next.time ) ) {
          this.queue.pop()
        }
        
        while( this.phase >= next.time ) {
          next.func( next.priority )
          this.queue.pop()
          next = this.queue.peek()

          // XXX this happens when calling sequencer.stop()... why?
          if( next === undefined ) break
        }
      }

      this.phase++
    }

    return this.phase
  },

  advance( amt ) {
    this.phase += amt
    this.tick( true )
  }
}

let shouldSync = false
Object.defineProperty( Scheduler, 'shouldSync', {
  get() { return shouldSync },
  set(v){ 
    shouldSync = v
    if( Gibberish.mode === 'worklet' ) {
      Gibberish.worklet.port.postMessage({
        address:'eval',
        code:'Gibberish.scheduler.shouldSync = ' + v
      })
    }
  }
})

module.exports = Scheduler

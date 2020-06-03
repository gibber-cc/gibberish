const ugen = require( '../ugen.js' )()

const instrument = Object.create( ugen )

Object.assign( instrument, {
  type:'instrument',

  note( freq, loudness=null ) {
    // if binop is should be used...
    if( isNaN( this.frequency ) ) { 
      // and if we are assigning binop for the first time...

      let obj = Gibberish.processor.ugens.get( this.frequency.id )
      if( obj.isop !== true ) {
        obj.inputs[0] = freq
      }else{
        obj.inputs[1] = freq
        Gibberish.dirty( this )
      }
      this.frequency = obj
    }else{
      this.frequency = freq
    }

    if( loudness !== null ) {
      this.__triggerLoudness = loudness 
    }

    this.env.trigger()
  },

  trigger( loudness = 1 ) {
    this.__triggerLoudness = loudness
    this.env.trigger()
  },

})

module.exports = instrument

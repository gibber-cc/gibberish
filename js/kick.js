let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Kick = props => {
    let frequency = g.in( 'frequency' ),
        decay = g.in( 'decay' ),
        tone  = g.in( 'tone' ),
        gain  = g.in( 'gain' )

    props = Object.assign( {}, Kick.defaults, props )

    let trigger = g.bang(),
        impulse = g.mul( trigger, 60 ),
        _decay = g.sub( 1.005, decay ), // range { .005, 1.005 }
        _tone = g.add( 50, g.mul( tone, 4000 ) ), // range { 50, 4050 }
        bpf = g.svf( impulse, frequency, _decay, 2, false ),
        lpf = g.svf( bpf, _tone, .5, 0, false ),
        out = mul( lpf, gain )
    
    let kick = Gibberish.factory( out, 'kick', props  )
    
    kick.env = trigger

    kick.note = freq => {
      kick.frequency = freq
      kick.env.trigger()
    }

    kick.trigger = (_gain = 1) => {
      kick.gain = _gain
      kick.env.trigger()
    }

    kick.free = () => {
      Gibberish.genish.gen.free( out )
    }

    return kick
  }
  
  Kick.defaults = {
    gain: 1,
    frequency:55,
    tone: .25,
    decay:.9
  }

  return Kick

}

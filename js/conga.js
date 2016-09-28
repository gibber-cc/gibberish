let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Conga = props => {
    let frequency = g.in( 'frequency' ),
        decay = g.in( 'decay' ),
        tone  = g.in( 'tone' ),
        gain  = g.in( 'gain' )

    props = Object.assign( {}, Conga.defaults, props )

    let trigger = g.bang(),
        impulse = g.mul( trigger, 60 ),
        _decay =  g.sub( .101, g.div( decay, 10 ) ),
        bpf = g.svf( impulse, frequency, _decay, 2, false ),
        out = mul( bpf, gain )
    
    let conga = Gibberish.factory( out, 'conga', props  )
    
    conga.env = trigger

    conga.note = freq => {
      conga.frequency = freq
      conga.env.trigger()
    }

    conga.trigger = conga.env.trigger

    conga.free = () => {
      Gibberish.genish.gen.free( out )
    }

    return conga
  }
  
  Conga.defaults = {
    gain: 1,
    frequency:190,
    decay: 1
  }

  return Conga

}

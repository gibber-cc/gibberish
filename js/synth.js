let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  //Saw:   Gibberish.factory( g.mul( g.phasor( g.in('frequency') ), g.in('gain' ) ), 'saw', [ 440, 1 ] ),

  let Synth = props => {
    props = Object.assign( {}, Synth.defaults, props )

    let osc, 
        env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' )

    switch( props.waveform ) {
      case 'saw':
        osc = g.phasor( frequency )
        break;
      case 'square':
        osc = lt( g.phasor( frequency, 0, { min:0 } ), .5 )
        break;
      case 'pwm':
        osc = lt( g.phasor( frequency, 0, { min:0 } ), g.in( 'pulsewidth' ) )
        break;
    }

    let syn_ = Gibberish.factory( g.mul( g.mul( osc, env ), g.in( 'gain' ) ), 'synth', Synth.defaults  )
    
    // TODO: this is ridiculous... how do we have factory methods but still allow for dynamic waveform selection? use wavetables?
    let syn = syn_( props )

    syn.env = env
    syn.note = freq => {
      syn.frequency = freq
      syn.env.trigger()
    }

    return syn
  }
  
  Synth.defaults = {
    waveform:'saw',
    attack: 44100,
    decay: 44100,
    gain: 1,
    pulsewidth:.25,
    frequency:220
  }

  return Synth

}

let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Synth = props => {
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

    let oscAmp = g.mul( g.mul( osc, env ), g.in( 'gain' ) ),
        panner = g.pan( oscAmp, oscAmp, g.in('pan' ) )

    let syn = Gibberish.factory( [panner.left, panner.right], 'synth', Synth.defaults, props  )
    
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
    frequency:220,
    pan: .5
  }

  return Synth

}

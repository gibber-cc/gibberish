let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Synth2 = props => {
    let osc, 
        env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        phase

    props = Object.assign( {}, Synth2.defaults, props )

    switch( props.waveform ) {
      case 'saw':
        osc = g.phasor( frequency )
        break;
      case 'square':
        phase = g.phasor( frequency, 0, { min:0 } )
        osc = lt( phase, .5 )
        break;
      case 'sine':
        osc = cycle( frequency )
        break;
      case 'pwm':
        phase = g.phasor( frequency, 0, { min:0 } )
        osc = lt( phase, g.in( 'pulsewidth' ) )
        break;
    }

    let oscWithGain = g.mul( g.mul( osc, env ), g.in( 'gain' ) ),
        isLowPass = g.param( 'lowPass', 1 ),
        filteredOsc = g.filter24( oscWithGain, g.in('resonance'), g.mul( g.in('cutoff'), env ), isLowPass ),
        panner = g.pan( filteredOsc, filteredOsc, g.in( 'pan' ) ),
        syn = Gibberish.factory( [panner.left, panner.right], 'synth', props  )
    
    syn.env = env

    syn.note = freq => {
      syn.frequency = freq
      syn.env.trigger()
    }

    syn.trigger = (_gain = 1) => {
      syn.gain = _gain
      syn.env.trigger()
    }

    syn.free = () => {
      Gibberish.genish.gen.free( [panner.left, panner.right] )
    }

    syn.isStereo = true
    
    return syn
  }
  
  Synth2.defaults = {
    waveform:'saw',
    attack: 44100,
    decay: 44100,
    gain: 1,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    cutoff: .35,
    resonance: 3.5
  }

  let PolySynth2 = Gibberish.PolyTemplate( Synth2, ['frequency','attack','decay','pulsewidth','cutoff','resonance','pan','gain'] ) 

  return [ Synth2, PolySynth2 ]

}

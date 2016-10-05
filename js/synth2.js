let g = require( 'genish.js' ),
    instrument = require( './instrument.js' ),
    feedbackOsc = require( './fmfeedbackosc.js' )

module.exports = function( Gibberish ) {

  let Synth2 = initialProps => {
    let syn = Object.create( instrument ),
        env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        phase, osc

    let props = Object.assign( {}, Synth2.defaults, initialProps )

    switch( props.waveform ) {
      case 'saw':
        if( props.antialias === false ) {
          osc = g.phasor( frequency )
        }else{
          osc = feedbackOsc( frequency, 1 )
        }
        break;
      case 'square':
        if( props.antialias === true ) {
          osc = feedbackOsc( frequency, 1, .5, { type:1 })
        }else{
          phase = g.phasor( frequency, 0, { min:0 } )
          osc = lt( phase, .5 )
        }
        break;
      case 'sine':
        osc = cycle( frequency )
        break;
      case 'pwm':
        let pulsewidth = g.in('pulsewidth')
        if( props.antialias === true ) {
          osc = feedbackOsc( frequency, 1, pulsewidth, { type:1 })
        }else{
          phase = g.phasor( frequency, 0, { min:0 } )
          osc = lt( phase, pulsewidth )
        }
        break;
    }

    let oscWithGain = g.mul( g.mul( osc, env ), g.in( 'gain' ) ),
        isLowPass = g.param( 'lowPass', 1 ),
        filteredOsc = g.filter24( oscWithGain, g.in('resonance'), g.mul( g.in('cutoff'), env ), isLowPass ),
        panner

    if( props.panVoices ) {  
      panner = g.pan( filteredOsc, filteredOsc, g.in( 'pan' ) )
      Gibberish.factory( syn, [panner.left, panner.right], 'synth2', props  )
    }else{
      Gibberish.factory( syn, filteredOsc, 'synth2', props )
    }
    
    syn.env = env
    
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
    resonance: 3.5,
    antialias: false,
    panVoices: false
  }

  let PolySynth2 = Gibberish.PolyTemplate( Synth2, ['frequency','attack','decay','pulsewidth','cutoff','resonance','pan','gain'] ) 

  return [ Synth2, PolySynth2 ]

}

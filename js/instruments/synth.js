let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Synth = inputProps => {
    let syn = Object.create( instrument )

    let env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' )

    let props = Object.assign( {}, Synth.defaults, inputProps )

    let osc = instrument.__makeOscillator__( props.waveform, frequency, props.antialias )

    let oscWithGain = g.mul( g.mul( osc, env ), g.in( 'gain' ) ),
        panner

    if( props.panVoices === true ) { 
      panner = g.pan( oscWithGain, oscWithGain, g.in( 'pan' ) ) 
      Gibberish.factory( syn, [panner.left, panner.right], 'synth', props  )
    }else{
      Gibberish.factory( syn, oscWithGain , 'synth', props )
    }
    
    syn.env = env

    return syn
  }
  
  Synth.defaults = {
    waveform:'saw',
    attack: 44100,
    decay: 44100,
    gain: 1,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    antialias:false,
    panVoices:false
  }

  let PolySynth = Gibberish.PolyTemplate( Synth, ['frequency','attack','decay','pulsewidth','pan','gain'] ) 

  return [ Synth, PolySynth ]

}

const g = require( 'genish.js' ),
      instrument = require( './instrument.js' )


module.exports = function( Gibberish ) {

  let Synth2 = initialProps => {
    let syn = Object.create( instrument ),
        env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        glide = g.in( 'glide' ),
        slidingFreq = g.slide( frequency, glide, glide )

    let props = Object.assign( {}, Synth2.defaults, initialProps )

    let osc = Gibberish.oscillators.factory( props.waveform, slidingFreq, props.antialias )

    let oscWithGain = g.mul( g.mul( osc, env ), g.in( 'gain' ) ),
        isLowPass = g.param( 'lowPass', 1 ),
        filteredOsc, panner,
        cutoff = g.add( g.in('cutoff'), g.mul( g.in('filterMult'), env ) )
  
    filteredOsc = Gibberish.filters.factory( oscWithGain, cutoff, g.in('resonance'), g.in('saturation'), props )

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
    cutoff: 220,
    resonance: 3.5,
    antialias: false,
    panVoices: false,
    glide:1,
    saturation:0,
    filterMult:110,
    Q:8
  }

  let PolySynth2 = Gibberish.PolyTemplate( Synth2, ['frequency','attack','decay','pulsewidth','cutoff','resonance','pan','gain', 'glide', 'saturation', 'filterMult','Q' ] ) 

  return [ Synth2, PolySynth2 ]

}

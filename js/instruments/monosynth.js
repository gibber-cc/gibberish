const g = require( 'genish.js' ),
      instrument = require( './instrument.js' ),
      feedbackOsc = require( '../oscillators/fmfeedbackosc.js' )

module.exports = function( Gibberish ) {

  const Synth = argumentProps => {
    const syn = Object.create( instrument ),
          oscs = [], 
          env = g.ad( g.in( 'attack' ), g.in( 'decay' ), { shape:'linear' }),
          frequency = g.in( 'frequency' ),
          glide = g.in( 'glide' ),
          slidingFreq = g.slide( frequency, glide, glide )

    let props = Object.assign( {}, Synth.defaults, argumentProps )

    for( let i = 0; i < 3; i++ ) {
      let osc, freq

      switch( i ) {
        case 1:
          freq = g.add( slidingFreq, g.mul( slidingFreq, g.in('detune2') ) )
          break;
        case 2:
          freq = g.add( slidingFreq, g.mul( slidingFreq, g.in('detune3') ) )
          break;
        default:
          freq = slidingFreq//frequency
      }

      osc = Gibberish.oscillators.factory( props.waveform, freq, props.antialias )
      
      oscs[ i ] = osc
    }

    let oscSum = g.add( ...oscs ),
        oscWithGain = g.mul( g.mul( oscSum, env ), g.in( 'gain' ) ),
        cutoff = g.add( g.in('cutoff'), g.mul( g.in('filterMult'), env ) ),
        filteredOsc, panner

    filteredOsc = Gibberish.filters.factory( oscWithGain, cutoff, g.in('resonance'), g.in('saturation'), props )
      
    if( props.panVoices ) {  
      panner = g.pan( filteredOsc,filteredOsc, g.in( 'pan' ) )
      Gibberish.factory( syn, [panner.left, panner.right], 'mono', props  )
    }else{
      Gibberish.factory( syn, filteredOsc , 'mono', props )
    }
    
    syn.env = env

    return syn
  }
  
  Synth.defaults = {
    waveform: 'saw',
    attack: 44100,
    decay: 44100,
    gain: 1,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    detune2:1.01,
    detune3:2.99,
    cutoff: 440, //.25,
    resonance:2,
    Q: 5,
    panVoices:false,
    glide: 1,
    antialias:false,
    filterType: 1,
    saturation:1,
    filterMult: 110,
    isLowPass:true
  }

  let PolyMono = Gibberish.PolyTemplate( Synth, 
    ['frequency','attack','decay','cutoff','Q',
     'detune2','detune3','pulsewidth','pan','gain', 'glide', 'saturation', 'filterMult' ]
  ) 

  return [ Synth, PolyMono ]
}

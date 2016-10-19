let g = require( 'genish.js' ),
    instrument = require( './instrument.js' ),
    feedbackOsc = require( './fmfeedbackosc.js' )

module.exports = function( Gibberish ) {

  let Synth = argumentProps => {
    let syn = Object.create( instrument ),
        oscs = [], 
        env = g.ad( g.in( 'attack' ), g.in( 'decay' ), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        phase

    let props = Object.assign( {}, Synth.defaults, argumentProps )

    for( let i = 0; i < 3; i++ ) {
      let osc, freq

      switch( i ) {
        case 1:
          freq = g.mul( frequency, g.add( g.in('octave2'), g.in('detune2')  ) )
          break;
        case 2:
          freq = g.mul( frequency, g.add( g.in('octave3'), g.in('detune3')  ) )
          break;
        default:
          freq = frequency
      }

      switch( props.waveform ) {
        case 'saw':
          if( props.antialias === false ) {
            osc = g.phasor( freq )
          }else{
            osc = feedbackOsc( freq, 1 )
          }
          break;
        case 'square':
          if( props.antialias === true ) {
            osc = feedbackOsc( freq, 1, .5, { type:1 })
          }else{
            phase = g.phasor( freq, 0, { min:0 } )
            osc = lt( phase, .5 )
          }
          break;
        case 'sine':
          osc = cycle( freq )
          break;
        case 'pwm':
          let pulsewidth = g.in('pulsewidth')
          if( props.antialias === true ) {
            osc = feedbackOsc( freq, 1, pulsewidth, { type:1 })
          }else{
            phase = g.phasor( freq, 0, { min:0 } )
            osc = lt( phase, pulsewidth )
          }
          break;
      }

      oscs[ i ] = osc
    }

    let oscSum = g.add( ...oscs ),
        oscWithGain = g.mul( g.mul( oscSum, env ), g.in( 'gain' ) ),
        isLowPass = g.param( 'lowPass', 1 ),
        filteredOsc = g.filter24( oscWithGain, g.in('resonance'), g.mul( g.in('cutoff'), env ), isLowPass ),
        panner

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
    octave2:2,
    octave3:4,
    detune2:.01,
    detune3:-.01,
    cutoff: .25,
    resonance:2,
    panVoices:false
  }

  let PolyMono = Gibberish.PolyTemplate( Synth, 
    ['frequency','attack','decay','cutoff','resonance',
     'octave2','octave3','detune2','detune3','pulsewidth','pan','gain']
  ) 

  return [ Synth, PolyMono ]
}

let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Synth = props => {
    let oscs = [], 
        env = g.ad( g.in( 'attack' ), g.in( 'decay' ), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        phase

    props = Object.assign( {}, Synth.defaults, props )

    for( let i = 0; i < 3; i++ ) {
      let osc, freq

      //freq = i === 0 ? frequency : mul( frequency, i + 1 )
      switch( i ) {
        case 1:
          freq = mul( frequency, add( g.in('octave2'), g.in('detune2')  ) )
          break;
        case 2:
          freq = mul( frequency, add( g.in('octave3'), g.in('detune3')  ) )
          break;
        default:
          freq = frequency
      }

      switch( props.waveform ) {
        case 'saw':
          osc = g.phasor( freq )
          break;
        case 'square':
          phase = g.phasor( freq, 0, { min:0 } )
          osc = lt( phase, .5 )
          break;
        case 'sine':
          osc = cycle( freq )
          break;
        case 'pwm':
          phase = g.phasor( freq, 0, { min:0 } )
          osc = lt( phase, g.in( 'pulsewidth' ) )
          break;
      }
      oscs[i] = osc
    }

    let oscSum = add( ...oscs ),
        oscWithGain = g.mul( g.mul( oscSum, env ), g.in( 'gain' ) ),
        isLowPass = g.param( 'lowPass', 1 ),
        filteredOsc = g.filter24( oscWithGain, g.in('resonance'), g.mul( g.in('cutoff'), env ), isLowPass ),
        panner = g.pan( filteredOsc,filteredOsc, g.in( 'pan' ) ),
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
  }

  let PolyMono = Gibberish.PolyTemplate( Synth, 
    ['frequency','attack','decay','cutoff','resonance',
     'octave2','octave3','detune2','detune3','pulsewidth','pan','gain']
  ) 

  return [ Synth, PolyMono ]
}

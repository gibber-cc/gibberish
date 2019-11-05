const g = require( 'genish.js' ),
      instrument = require( './instrument.js' ),
      feedbackOsc = require( '../oscillators/fmfeedbackosc.js' )

module.exports = function( Gibberish ) {

  const Mono = argumentProps => {
    const syn = Object.create( instrument ),
          oscs = [], 
          frequency = g.in( 'frequency' ),
          glide = g.in( 'glide' ),
          slidingFreq = g.memo( g.slide( frequency, glide, glide ) ),
          attack = g.in( 'attack' ), decay = g.in( 'decay' ),
          sustain = g.in( 'sustain' ), sustainLevel = g.in( 'sustainLevel' ),
          release = g.in( 'release' ),
          loudness = g.in( 'loudness' ),
          triggerLoudness = g.in( '__triggerLoudness' ),
          Loudness = g.mul( loudness, triggerLoudness ),
          saturation = g.in( 'saturation' )

    const props = Object.assign( {}, Mono.defaults, argumentProps )
    Object.assign( syn, props )

    syn.__createGraph = function() {
      const env = Gibberish.envelopes.factory( 
        props.useADSR, 
        props.shape, 
        attack, decay, 
        sustain, sustainLevel, 
        release, 
        props.triggerRelease
      )

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
            freq = slidingFreq
        }

        osc = Gibberish.oscillators.factory( syn.waveform, freq, syn.antialias )
        
        oscs[ i ] = osc
      }


      //const baseCutoffFreq = g.in('cutoff') * (frequency /  (g.gen.samplerate / 16 ))
      //const cutoff = baseCutoffFreq * g.pow( 2, g.in('filterMult') * loudness ) * env 
      const oscSum = g.add( ...oscs ),
            // XXX horrible hack below to "use" saturation even when not using a diode filter 
            oscWithEnv = props.filterType === 2 ? g.mul( oscSum, env ) : g.mul( oscSum, g.mul( env, saturation ) ),
            baseCutoffFreq = g.mul( g.in('cutoff'), g.div( frequency, g.gen.samplerate / 16 ) ),
            cutoff = g.mul( g.mul( baseCutoffFreq, g.pow( 2, g.mul( g.in('filterMult'), Loudness ) )), env ),
            filteredOsc = Gibberish.filters.factory( oscWithEnv, cutoff, g.in('saturation'), syn )
        
      if( props.panVoices ) {  
        const panner = g.pan( filteredOsc,filteredOsc, g.in( 'pan' ) )
        syn.graph = [ g.mul( panner.left, g.in('gain'), Loudness ), g.mul( panner.right, g.in('gain'), Loudness ) ]
        syn.isStereo = true
      }else{
        syn.graph = g.mul( filteredOsc, g.in('gain'), Loudness )
        syn.isStereo = false
      }

      syn.env = env
    }

    syn.__requiresRecompilation = [ 'waveform', 'antialias', 'filterType', 'filterMode' ]
    syn.__createGraph()

    const out = Gibberish.factory( syn, syn.graph, ['instruments','Monosynth'], props )

    return out
  } 
  
  Mono.defaults = {
    waveform: 'saw',
    attack: 44,
    decay: 22050,
    sustain:44100,
    sustainLevel:.6,
    release:22050,
    useADSR:false,
    shape:'linear',
    triggerRelease:false,
    gain: .25,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    detune2:.005,
    detune3:-.005,
    cutoff: .5,
    Q: .25,
    panVoices:false,
    glide: 1,
    antialias:false,
    filterType: 1,
    filterMode: 0, // 0 = LP, 1 = HP, 2 = BP, 3 = Notch
    saturation:.5,
    filterMult: 2,
    isLowPass:true,
    loudness:1,
    __triggerLoudness:1
  }

  let PolyMono = Gibberish.PolyTemplate( Mono, 
    [ 'frequency','attack','decay','cutoff','Q',
      'detune2','detune3','pulsewidth','pan','gain', 
      'glide', 'saturation', 'filterMult',  'antialias', 
      'filterType', 'waveform', 'filterMode', 'loudness', '__triggerLoudness' ]
  ) 
  PolyMono.defaults = Mono.defaults

  return [ Mono, PolyMono ]
}

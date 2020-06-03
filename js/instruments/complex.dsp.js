const g = require( 'genish.js' ),
      instrument = require( './instrument.js' ),
      __wavefold   = require( '../fx/wavefolder.js' )

const genish = g

module.exports = function( Gibberish ) {
  const wavefold = __wavefold( Gibberish )[1]

  const Complex = inputProps => {
    const syn = Object.create( instrument )

    const frequency = g.in( 'frequency' ),
          loudness  = g.in( 'loudness' ), 
          triggerLoudness = g.in( '__triggerLoudness' ),
          glide = g.in( 'glide' ),
          slidingFreq = g.slide( frequency, glide, glide ),
          attack = g.in( 'attack' ), decay = g.in( 'decay' ),
          sustain = g.in( 'sustain' ), sustainLevel = g.in( 'sustainLevel' ),
          release = g.in( 'release' ),
          pregain = g.in( 'pregain' ),
          postgain= g.in( 'postgain' )

    const props = Object.assign( {}, Complex.defaults, inputProps )
    Object.assign( syn, props )

    syn.__createGraph = function() {
      const osc = Gibberish.oscillators.factory( syn.waveform, slidingFreq, syn.antialias )

      const env = Gibberish.envelopes.factory( 
        props.useADSR, 
        props.shape, 
        attack, decay, 
        sustain, sustainLevel, 
        release, 
        props.triggerRelease
      )

      const saturation = g.in('saturation')

      // below doesn't work as it attempts to assign to release property triggering codegen...
      // syn.release = ()=> { syn.env.release() }

      {
        'use jsdsp'
        let oscWithEnv = osc * env * loudness * triggerLoudness,
            panner

        let foldedOsc = wavefold( wavefold( wavefold( wavefold( oscWithEnv * (pregain * env) * .333 ) ) ) )
        foldedOsc = g.tanh( foldedOsc * .6 ) * postgain
 
        // 16 is an unfortunate empirically derived magic number...
        const baseCutoffFreq = g.in('cutoff') * ( frequency /  ( g.gen.samplerate / 16 ) ) 
        const cutoff = g.min( baseCutoffFreq * g.pow( 2, g.in('filterMult') * loudness * triggerLoudness ) * env, .995 ) 
        const filteredOsc = Gibberish.filters.factory( foldedOsc, cutoff, saturation, props )

        let complexWithGain = filteredOsc * g.in( 'gain' )
        // XXX ugly, ugly hack
        if(  props.filterType !== 2 ) complexWithGain = complexWithGain * saturation
    
        if( syn.panVoices === true ) { 
          panner = g.pan( complexWithGain, complexWithGain, g.in( 'pan' ) ) 
          syn.graph = [ panner.left, panner.right ]
        }else{
          syn.graph = complexWithGain
        }

        syn.env = env
        syn.osc = osc
        syn.filter = filteredOsc
      }

    }
    
    syn.__requiresRecompilation = [ 'waveform', 'antialias', 'filterType','filterMode', 'useADSR', 'shape' ]
    syn.__createGraph()

    const out = Gibberish.factory( syn, syn.graph, ['instruments', 'complex'], props  )

    return out
  }
  
  Complex.defaults = {
    waveform:'triangle',
    attack: 44,
    decay: 22050,
    sustain:44100,
    sustainLevel:.6,
    release:22050,
    useADSR:false,
    shape:'exponential',
    triggerRelease:false,
    gain: .5,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    antialias:true,
    panVoices:false,
    loudness:1,
    __triggerLoudness:1,
    glide:1,
    saturation:1,
    filterMult:2,
    Q:.25,
    cutoff:.5,
    filterType:1,
    filterMode:0,
    isStereo:false,
    pregain:4,
    postgain:1
  }

  // do not include velocity, which shoudl always be per voice
  let PolyComplex = Gibberish.PolyTemplate( Complex, ['frequency','attack','decay','pulsewidth','pan','gain','glide', 'saturation', 'filterMult', 'Q', 'cutoff', 'resonance', 'antialias', 'filterType', 'waveform', 'filterMode', '__triggerLoudness', 'loudness', 'pregain', 'postgain'] ) 
  PolyComplex.defaults = Complex.defaults

  return [ Complex, PolyComplex ]

}

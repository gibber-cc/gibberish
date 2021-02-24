const g = require( 'genish.js' ),
      instrument = require( './instrument.js' )

const genish = g

module.exports = function( Gibberish ) {

  const Synth = inputProps => {
    const syn = Object.create( instrument )

    const frequency = g.in( 'frequency' ),
          loudness  = g.in( 'loudness' ), 
          triggerLoudness = g.in( '__triggerLoudness' ),
          glide = g.max( 1, g.in( 'glide' ) ),
          slidingFreq = g.slide( frequency, glide, glide ),
          attack = g.in( 'attack' ), decay = g.in( 'decay' ),
          sustain = g.in( 'sustain' ), sustainLevel = g.in( 'sustainLevel' ),
          release = g.in( 'release' )

    const props = Object.assign( {}, Synth.defaults, inputProps )
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


      // syn.env = env
      // below doesn't work as it attempts to assign to release property triggering codegen...
      syn.advance = ()=> { env.release() }

      {
        'use jsdsp'
        let oscWithEnv = osc * env * loudness * triggerLoudness,
            saturation = g.in('saturation'),
            panner

        // 16 is an unfortunate empirically derived magic number...
        const baseCutoffFreq = g.in('cutoff') * ( frequency /  ( g.gen.samplerate / 16 ) ) 
        const cutoff = g.min( baseCutoffFreq * g.pow( 2, g.in('filterMult') * loudness * triggerLoudness ) * env, .995 ) 
        const filteredOsc = Gibberish.filters.factory( oscWithEnv, cutoff, saturation, props )

        let synthWithGain = filteredOsc * g.in( 'gain' )
        
        // XXX This line has to be here for correct code generation to work when
        // saturation is not being used... obviously this should cancel out. 
        if( syn.filterModel !== 2 ) synthWithGain = synthWithGain + saturation - saturation
    
        if( syn.panVoices === true ) { 
          panner = g.pan( synthWithGain, synthWithGain, g.in( 'pan' ) ) 
          syn.graph = [ panner.left, panner.right ]
          syn.isStereo = true
        }else{
          syn.graph = synthWithGain
          syn.isStereo = false
        }

        syn.env = env
        syn.osc = osc
        syn.filter = filteredOsc
      }

      return env

    }
    
    syn.__requiresRecompilation = [ 'waveform', 'antialias', 'filterModel','filterMode', 'useADSR', 'shape' ]
    const env = syn.__createGraph()

    const out = Gibberish.factory( syn, syn.graph, ['instruments', 'synth'], props, null, true, ['saturation']  )

    out.env.advance = out.advance 

    return out
  }
  
  Synth.defaults = {
    waveform:'saw',
    attack: 44,
    decay: 22050,
    sustain:44100,
    sustainLevel:.6,
    release:22050,
    useADSR:false,
    shape:'linear',
    triggerRelease:false,
    gain: .5,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    antialias:false,
    panVoices:false,
    loudness:1,
    __triggerLoudness:1,
    glide:1,
    saturation:1,
    filterMult:2,
    Q:.25,
    cutoff:.5,
    filterModel:1,
    filterMode:0
  }

  // do not include velocity, which shoudl always be per voice
  let PolySynth = Gibberish.PolyTemplate( Synth, ['frequency','attack','decay','pulsewidth','pan','gain','glide', 'saturation', 'filterMult', 'Q', 'cutoff', 'resonance', 'antialias', 'filterModel', 'waveform', 'filterMode', '__triggerLoudness', 'loudness'] ) 
  PolySynth.defaults = Synth.defaults

  return [ Synth, PolySynth ]

}

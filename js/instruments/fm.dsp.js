const g = require( 'genish.js' ),
      instrument = require( './instrument.js' )

const genish = g

module.exports = function( Gibberish ) {

  const FM = inputProps => {
    let syn = Object.create( instrument )

    let frequency = g.in( 'frequency' ),
        glide = g.in( 'glide' ),
        slidingFreq = g.slide( frequency, glide, glide ),
        cmRatio = g.in( 'cmRatio' ),
        index = g.in( 'index' ),
        feedback = g.in( 'feedback' ),
        attack = g.in( 'attack' ), decay = g.in( 'decay' ),
        sustain = g.in( 'sustain' ), sustainLevel = g.in( 'sustainLevel' ),
        release = g.in( 'release' ),
        loudness = g.in( 'loudness' )

    const props = Object.assign( {}, FM.defaults, inputProps )
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

      const feedbackssd = g.history( 0 )

      const modOsc = Gibberish.oscillators.factory( 
        syn.modulatorWaveform, 
        g.add( g.mul( slidingFreq, cmRatio ), g.mul( feedbackssd.out, feedback, index ) ), 
        syn.antialias 
      )

      {
        'use jsdsp'
        const modOscWithIndex = modOsc * slidingFreq * index * loudness
        const modOscWithEnv   = modOscWithIndex * env
        
        const modOscWithEnvAvg =  .5 * ( modOscWithEnv + feedbackssd.out )

        feedbackssd.in( modOscWithEnvAvg )

        const carrierOsc = Gibberish.oscillators.factory( syn.carrierWaveform, g.add( slidingFreq, modOscWithEnvAvg ), syn.antialias )
        const carrierOscWithEnv = carrierOsc * env

        const baseCutoffFreq = g.in('cutoff') * ( frequency /  ( g.gen.samplerate / 16 ) ) 
        const cutoff = g.min( baseCutoffFreq * g.pow( 2, g.in('filterMult') * loudness ) * env, .995 ) 
        const filteredOsc = Gibberish.filters.factory( carrierOscWithEnv, cutoff, g.in('Q'), g.in('saturation'), syn )
        //const baseCutoffFreq = g.in('cutoff') * frequency
        //const cutoff =  baseCutoffFreq * g.pow( 2, g.in('filterMult') * loudness ) * env
        //const cutoff = g.add( g.in('cutoff'), g.mul( g.in('filterMult'), env ) )
        //const filteredOsc = Gibberish.filters.factory( carrierOscWithEnv, cutoff, g.in('Q'), g.in('saturation'), syn )

        const synthWithGain = filteredOsc * g.in( 'gain' ) * loudness
        
        let panner
        if( props.panVoices === true ) { 
          panner = g.pan( synthWithGain, synthWithGain, g.in( 'pan' ) ) 
          syn.graph = [panner.left, panner.right ]
        }else{
          syn.graph = synthWithGain
        }
      }

      syn.env = env
    }
    
    syn.__requiresRecompilation = [ 'carrierWaveform', 'modulatorWaveform', 'antialias', 'filterType', 'filterMode' ]
    syn.__createGraph()

    const out = Gibberish.factory( syn, syn.graph , ['instruments','FM'], props )

    return out
  }

  FM.defaults = {
    carrierWaveform:'sine',
    modulatorWaveform:'sine',
    attack: 44,
    feedback: 0,
    decay: 22050,
    sustain:44100,
    sustainLevel:.6,
    release:22050,
    useADSR:false,
    shape:'linear',
    triggerRelease:false,
    gain: .25,
    cmRatio:2,
    index:5,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    antialias:false,
    panVoices:false,
    glide:1,
    saturation:1,
    filterMult:1.5,
    Q:.25,
    cutoff:.35,
    filterType:0,
    filterMode:0,
    loudness: 1

  }

  const PolyFM = Gibberish.PolyTemplate( FM, ['glide','frequency','attack','decay','pulsewidth','pan','gain','cmRatio','index', 'saturation', 'filterMult', 'Q', 'cutoff', 'antialias', 'filterType', 'carrierWaveform', 'modulatorWaveform','filterMode', 'feedback', 'useADSR', 'sustain', 'release', 'sustainLevel' ] ) 
  PolyFM.defaults = FM.defaults

  return [ FM, PolyFM ]

}

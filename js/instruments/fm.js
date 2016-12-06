let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let FM = inputProps => {
    let syn = Object.create( instrument )

    let env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        glide = g.in( 'glide' ),
        slidingFreq = g.slide( frequency, glide, glide ),
        cmRatio = g.in( 'cmRatio' ),
        index = g.in( 'index' )

    let props = Object.assign( syn, FM.defaults, inputProps )

    syn.__createGraph = function() {
      let modOsc = Gibberish.oscillators.factory( syn.modulatorWaveform, g.mul( slidingFreq, cmRatio ), syn.antialias )
      let modOscWithIndex = g.mul( modOsc, g.mul( slidingFreq, index ) )
      let modOscWithEnv   = g.mul( modOscWithIndex, env )

      let carrierOsc = Gibberish.oscillators.factory( syn.carrierWaveform, g.add( slidingFreq, modOscWithEnv ), syn.antialias )
      let carrierOscWithEnv = g.mul( carrierOsc, env )
      
      let cutoff = g.add( g.in('cutoff'), g.mul( g.in('filterMult'), env ) )
      const filteredOsc = Gibberish.filters.factory( carrierOscWithEnv, cutoff, g.in('Q'), g.in('saturation'), syn )

      let synthWithGain = g.mul( filteredOsc, g.in( 'gain' ) ),
          panner

      if( props.panVoices === true ) { 
        panner = g.pan( synthWithGain, synthWithGain, g.in( 'pan' ) ) 
        syn.graph = [panner.left, panner.right ]
      }else{
        syn.graph = synthWithGain
      }
    }
    
    syn.__requiresRecompilation = [ 'carrierWaveform', 'modulatorWaveform', 'antialias', 'filterType' ]
    syn.__createGraph()

    Gibberish.factory( syn, syn.graph , 'fm', syn )

    syn.env = env

    return syn
  }

  FM.defaults = {
    carrierWaveform:'sine',
    modulatorWaveform:'sine',
    attack: 44100,
    decay: 44100,
    gain: 1,
    cmRatio:2,
    index:5,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    antialias:false,
    panVoices:false,
    glide:1,
    saturation:1,
    filterMult:440,
    Q:.25,
    cutoff:3520,
    filterType:0,
    isLowPass:1
  }

  let PolyFM = Gibberish.PolyTemplate( FM, ['glide','frequency','attack','decay','pulsewidth','pan','gain','cmRatio','index', 'saturation', 'filterMult', 'Q', 'cutoff', 'antialias', 'filterType', 'carrierWaveform', 'modulatorWaveform' ] ) 

  return [ FM, PolyFM ]

}

let ugen = require( '../ugen.js' ),
    g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let AD = function( argumentProps ) {
    let ad = Object.create( ugen ),
      attack  = g.in( 'attack' ),
      decay   = g.in( 'decay' )

    let props = Object.assign( {}, AD.defaults, argumentProps )

    let graph = g.ad( attack, decay )

    Gibberish.factory( ad, graph, 'ad', props )

    ad.trigger = graph.trigger

    return ad
  }

  AD.defaults = { attack:44100, decay:44100 } 

  let ADSR = function( argumentProps ) {
    let adsr  = Object.create( ugen ),
      attack  = g.in( 'attack' ),
      decay   = g.in( 'decay' ),
      sustain = g.in( 'sustain' ),
      release = g.in( 'release' ),
      sustainLevel = g.in( 'sustainLevel' )

    let props = Object.assign( {}, ADSR.defaults, argumentProps )

    let graph = g.adsr( attack, decay, sustain, sustainLevel, release, { triggerRelease: props.triggerRelease } )

    Gibberish.factory( adsr, graph, 'adsr', props )

    adsr.trigger = graph.trigger
    adsr.advance = graph.release

    return adsr
  }

  ADSR.defaults = { attack:22050, decay:22050, sustain:44100, sustainLevel:.6, release: 44100, triggerRelease:false } 

  let Modulation = {
    AD,
    ADSR,
    export( obj ) {
      for( let key in Modulation ) {
        if( key !== 'export' ) {
          obj[ key ] = Modulation[ key ]
        }
      }
    },
  }

  return Modulation
}

let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Sampler = inputProps => {
    let syn = Object.create( instrument )

    let props = Object.assign( {}, Sampler.defaults, inputProps )
    
    let env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        rate = g.in( 'rate' ),
        initialized  = g.param( 'initailied', 0 ),
        buffer = props.data || null

    syn.callback = function() { return 0 }
    syn.id = Gibberish.factory.getUID()
    syn.ugenName = syn.callback.ugenName = 'sampler_' + syn.id
    syn.inputNames = []

    if( props.filename ) {
      buffer = g.data( props.filename )
      buffer.onload = () => {
        Gibberish.factory( syn, peek( buffer, accum( 1, 0, { max: buffer.dim }), { mode:'samples' }), 'sampler', props ) 
      }

      console.log( 'sampler: loaded!', buffer.dim )
      Gibberish.dirty( syn )
    }

    //let sampleReader,
    //    out = g.ifelse( initialized ),
    //    panner

    //if( props.panVoices === true ) { 
    //  panner = g.pan( oscWithGain, oscWithGain, g.in( 'pan' ) ) 
    //  Gibberish.factory( syn, [panner.left, panner.right], 'sampler', props  )
    //}else{
    //  Gibberish.factory( syn, oscWithGain , 'sampler', props )
    //}
    
    //syn.env = env

    return syn
  }
  
  Sampler.defaults = {
    initialized:false,
    attack: 44100,
    decay: 44100,
    gain: 1,
    pan: .5,
    rate: 1,
    panVoices:false
  }

  let PolySampler = Gibberish.PolyTemplate( Sampler, ['rate','pan','gain'] ) 

  return [ Sampler, PolySampler ]

}

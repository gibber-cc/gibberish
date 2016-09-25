let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let PolySynth = props => {
    let synth = Gibberish.Bus2(),
        voices = [],
        voiceCount = 0

    for( let i = 0; i < 16; i++ ) {
      voices[i] = Gibberish.ugens.karplus( props )
      voices[i].isConnected = false
    }

    Object.assign( synth, {

      note( freq ) {
        let syn = voices[ voiceCount++ % voices.length ]//Gibberish.ugens.synth( props )
        Object.assign( syn, synth.properties )

        syn.frequency = freq
        syn.env.trigger()
        
        if( !syn.isConnected ) {
          syn.connect( this, 1 )
          syn.isConnected = true
        }

        let envCheck = ()=> {
          let phase = syn.getPhase(),
              endTime = synth.decay * Gibberish.ctx.sampleRate

          if( phase > endTime ) {
            synth.disconnect( syn )
            syn.isConnected = false
          }else{
            Gibberish.blockCallbacks.push( envCheck )
          }
        }

        Gibberish.blockCallbacks.push( envCheck )
      },

      free() {
        for( let child of voices ) child.free()
      }
    })

    synth.properties = props

    PolySynth.setupProperties( synth )

    return synth
  }

  let props = ['decay', 'damping', 'gain', 'pan' ]

  PolySynth.setupProperties = synth => {
    for( let property of props ) {
      Object.defineProperty( synth, property, {
        get() {
          return synth.properties[ property ] || Gibberish.ugens.synth.defaults[ property ]
        },
        set( v ) {
          synth.properties[ property ] = v
          for( let child of synth.inputs ) {
            child[ property ] = v
          }
        }
      })
    }
  }

  return PolySynth

}

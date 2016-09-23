let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let PolySynth = props => {
    let synth = Gibberish.Bus2()

    Object.assign( synth, {

      note( freq ) {
        let syn = Gibberish.ugens.synth( props )
        syn.frequency = freq
        syn.env.trigger()

        this.connect( syn, 1 )

        let envCheck = ()=> {
          if( syn.env.isComplete() ) {
            synth.disconnect( syn )
            synth.free()
          }else{
            Gibberish.blockCallbacks.push( envCheck )
          }
        }

        Gibberish.blockCallbacks.push( envCheck )
      },

      free() {
        for( let child of this.inputs ) child.free
      }
    })

    synth.properties = props

    PolySynth.setupProperties( synth )

    return synth
  }

  let props = ['attack','decay','gain','pulsewidth','pan']

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

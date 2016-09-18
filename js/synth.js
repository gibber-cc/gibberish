let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  //Saw:   Gibberish.factory( g.mul( g.phasor( g.in('frequency') ), g.in('gain' ) ), 'saw', [ 440, 1 ] ),

  let Synth = props => {
    if( props === undefined ) props = {}

    Object.assign( props, Synth.defaults )

    let osc, env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' })

    console.log( env )

    switch( props.waveform ) {
      case 'saw':
        osc = g.phasor( g.in( 'frequency' ) )
        break;
    }

    let syn_ = Gibberish.factory( g.mul( g.mul( osc, env ), g.in( 'gain' ) ), 'synth', [ 440, 44100, 44100, 1 ]  )

    let syn = syn_()

    syn.env = env
    syn.note = freq => {
      syn.frequency = freq
      syn.env.trigger()
    }

    return syn
  }
  
  Synth.defaults = {
    waveform:'saw',
    attack: 44100,
    decay: 44100,
    gain: 1
  }

  //Synth.factories = {
  //  'saw':,
  //}

  return Synth

}

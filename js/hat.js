let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Hat = props => {
    let tune  = g.in( 'tune' ),
        decay  = g.in( 'decay' ),
        gain  = g.in( 'gain' )

    props = Object.assign( {}, Hat.defaults, props )

    let baseFreq = g.mul( 325, tune ),
        bpfCutoff = g.mul( g.param( 'bpfc', 7000), tune ),
        hpfCutoff = g.mul( g.param( 'hpfc',.9755), tune ),  
        s1 = g.gt( g.phasor( baseFreq ), .5 ),
        s2 = g.gt( g.phasor( g.mul(baseFreq,1.4471) ), .5 ),
        s3 = g.gt( g.phasor( g.mul(baseFreq,1.6170) ), .5 ),
        s4 = g.gt( g.phasor( g.mul(baseFreq,1.9265) ), .5 ),
        s5 = g.gt( g.phasor( g.mul(baseFreq,2.5028) ), .5 ),
        s6 = g.gt( g.phasor( g.mul(baseFreq,2.6637) ), .5 ),
        sum = g.add( s1,s2,s3,s4,s5,s6 ),
        eg = g.decay( decay ), 
        bpf = g.svf( sum, bpfCutoff, .5, 2, false ),
        envBpf = g.mul( bpf, eg ),
        hpf = g.filter24( envBpf, 0, hpfCutoff, 0 ),
        out = g.mul( hpf, gain )

    let hat = Gibberish.factory( out, 'hat', props  )
    
    hat.env = eg 

    hat.note = tune => {
      hat.tune = tune
      hat.env.trigger()
    }

    hat.trigger = ( _gain ) => {
      if( _gain === undefined ) hat.gain = _gain
      hat.env.trigger()
    }

    hat.free = () => {
      Gibberish.genish.gen.free( ife )
    }

    hat.isStereo = false
    return hat
  }
  
  Hat.defaults = {
    gain: 1,
    tune:1,
    decay:3500,
  }

  return Hat

}

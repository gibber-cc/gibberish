const g = require( 'genish.js' ),
      effect = require( './effect.js' )

const genish = g

const RL = 7.5e3,
       R = 15e3, 
      VT = 26e-3,
      Is = 10e-16,
       a = 2*RL/R,
       b = (R+2*RL)/(VT*R),
       d = (RL*Is)/VT

// Antialiasing error threshold
const thresh = 10e-10;

const wavestage = in1 => {
  const body = `  const thresh = 10e-10;

  let w = Ln1;
  let expw, p, r, s;

  const e = Math.E
  const pow = Math.pow
  const abs = Math.abs
  for(let i=0; i<1000; i++) {
    expw = pow(e,w);

    p = w*expw - x;
    r = (w+1)*expw;
    s = (w+2)/(2*(w+1));        
    err = (p/(r-(p*s)));

    if (abs(err)<thresh) {
      break;
    }

    w = w - err;
  }

  return w;`

  const Lambert_W = g.process( 'x','Ln1', body )

  const Ln1 = g.history(0),
        Fn1 = g.history(0),
        xn1 = g.history(0)

  {
    'use jsdsp'
    // Compute Antiderivative
    const l = g.sign(in1); 
    let u = d * g.pow( Math.E, l * b * in1 )
    let Ln = Lambert_W.call(u,Ln1.out)
    const Fn = (0.5 * VT/b ) * (Ln * (Ln + 2)) - 0.5*a*in1*in1

    let xn = 0.5 * ( in1 + xn1.out )
    u = d * g.pow( Math.E, l * b * xn )
    Ln = Lambert_W.call( u, Ln1.out )

    //out1 = ;
    // Check for ill-conditioning
    const out1 = g.ifelse(
      g.lt( g.abs( in1 - xn1.out ), thresh), 
      (l * VT * Ln) - ( a * xn ),
      (Fn - Fn1.out) / (in1 - xn1.out)
    )

    // Update States
    Ln1.in( Ln )
    Fn1.in( Fn )
    xn1.in( in1 )

    return out1
  }
}

module.exports = function( Gibberish ) {

  let Wavefolder = inputProps => {
    let props = Object.assign( {}, effect.defaults, Wavefolder.defaults, inputProps ),
        wavefolder = Object.create( effect ),
        out

    wavefolder.__createGraph = function() {
      let isStereo = false
      if( out === undefined ) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false 
      }else{
        isStereo = out.input.isStereo
        out.isStereo = isStereo
      }

      const input = g.in( 'input' ),
            gain  = g.in( 'gain' ),
            postgain = g.in( 'postgain' )

      let lout
      {
        'use jsdsp'

        const linput = isStereo ? input[0] * gain : input * gain
        lout = linput * .333
        lout = wavestage( wavestage( wavestage( wavestage( lout ) ) ) )
        lout = lout * .6
        lout = g.tanh( lout ) * postgain
      }

      wavefolder.graph = lout

      if( isStereo ) {
        let rout
        {
          'use jsdsp'
          const rinput = isStereo ? input[1] * gain : input * gain
          rout = rinput * .333
          rout = wavestage( wavestage( wavestage( wavestage( rout ) ) ) )
          rout = rout * .6
          rout = g.tanh( rout ) * postgain
        }

        wavefolder.graph = [ lout, rout ]
      }
    }

    wavefolder.__createGraph()
    wavefolder.__requiresRecompilation = [ 'input' ]

    out = Gibberish.factory( 
      wavefolder,
      wavefolder.graph, 
      [ 'fx','wavefolder' ], 
      props 
    )
    return out 
  }

  Wavefolder.defaults = {
    input:0,
    gain:2,
    postgain:1
  }

  return Wavefolder

}

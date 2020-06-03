let g = require( 'genish.js' ),
    filter = require( './filter.js' )

module.exports = function( Gibberish ) {

  const genish = g
  Gibberish.genish.biquad = ( input, __cutoff, __Q, mode, isStereo ) => {
    'use jsdsp'
    let in1a0,x0a1,x1a2,y0b0,y1b1,
        in1a0_r,x0a1_r,x1a2_r,y0b0_r,y1b1_r,
        c

    let returnValue
    
    const x = genish.data([ 0,0 ], 1, { meta:true })
    const y = genish.data([ 0,0 ], 1, { meta:true })
    const a = genish.data([ 0,0,0 ], 1, { meta:true })
    const b = genish.data([ 0,0 ], 1, { meta:true })
    
    const Q = g.min( .5 + __Q * 22, 22.5 ) 
    const cutoff = g.max( .005, g.min( __cutoff,.995 ) ) * g.gen.samplerate / 4 
    //let w0 = g.memo( g.mul( 2 * Math.PI, g.div( g.max(.005, g.min(cutoff,.995)),  g.gen.samplerate ) ) ),
    let w0 =  (2 * Math.PI) * (cutoff / g.gen.samplerate),
        sinw0 = g.sin( w0 ),
        cosw0 = g.cos( w0 ),
        alpha = sinw0 / ( 2 * Q )

    //let w0 = g.memo( g.mul( 2 * Math.PI, g.div( cutoff,  g.gen.samplerate ) ) ),
      
    let oneMinusCosW = 1 - cosw0

    /******** process coefficients ********/
    switch( mode ) {
      case 1:
        a[0] = (1 + cosw0) / 2
        a[1] = (1 + cosw0) * -1
        a[2] = a[0]
        c    = 1 + alpha
        b[0] = -2 * cosw0
        b[1] = 1 - alpha
        break;
      case 2:
        a[0] = Q * alpha
        a[1] = 0
        a[2] = a[0] * -1
        c    = 1 + alpha
        b[0] = -2 * cosw0
        b[1] = 1 - alpha
        break;
      default: // LP
        a[0] = oneMinusCosW / 2
        a[1] = oneMinusCosW
        a[2] = a[0]
        c    = 1 + alpha
        b[0] = -2 * cosw0
        b[1] = 1 - alpha
    }

    a[0] = a[0] / c; a[1] = a[1] / c; a[2] = a[2] / c
    b[0] = b[0] / c; b[1] = b[1] / c

    /******** end coefficients ********/

    /****** left / mono output ********/

    let l = isStereo === true ? input[0] : input
    in1a0 = l * a[0]
    x0a1  = x[0] * a[1]
    x1a2  = x[1] * a[2]

    x[1] = x[0] 
    x[0] = l

    let sumLeft = in1a0 + x0a1 + x1a2

    y0b0 = y[0] * b[0]
    y1b1 = y[1] * b[1]
    y[1] = y[0] 

    let sumRight = y0b0 + y1b1

    let diff = sumLeft - sumRight

    y[0] = diff
    
    /******** end left/mono **********/

    if( isStereo ) {
      const xr = genish.data([ 0,0 ], 1, { meta:true })
      const yr = genish.data([ 0,0 ], 1, { meta:true })
      //let x1_1 = g.history(), x2_1 = g.history(), y1_1 = g.history(), y2_1 = g.history()

      const r = input[1] 
      in1a0_r = r * a[0] //g.mul( x1_1.in( input[1] ), a0 )
      x0a1_r  = xr[0] * a[1]//g.mul( x2_1.in( x1_1.out ), a1 )
      x1a2_r  = xr[1] * a[2]//g.mul( x2_1.out,            a2 )

      xr[1]   = xr[0]
      xr[0] = r

      const sumLeft_r = in1a0_r + x0a1_r + x1a2_r

      y0b0_r = yr[0] * b[0]//g.mul( y2_1.in( y1_1.out ), b1 )
      y1b1_r = yr[1] * b[1]//g.mul( y2_1.out, b2 )
      yr[1] = yr[0]

      const sumRight_r = y0b0_r + y1b1_r

      const diff_r = sumLeft_r - sumRight_r

      yr[0] = diff_r
      
      returnValue = [ diff, diff_r ]
    }else{
      returnValue = diff
    }

    return returnValue
  }

  let Biquad = inputProps => {
    const biquad = Object.create( filter )
    const props = Object.assign( {}, Biquad.defaults, inputProps ) 
    let __out

    Object.assign( biquad, props )

    biquad.__createGraph = function() {
      let isStereo = false
      if( __out === undefined ) {
        isStereo = props.input !== undefined && props.input.isStereo !== undefined ? props.input.isStereo : false 
      }else{
        isStereo = __out.input.isStereo
        __out.isStereo = isStereo
      }
      biquad.graph = Gibberish.genish.biquad( g.in('input'), g.in('cutoff'),  g.in('Q'), biquad.mode, isStereo )
    }

    biquad.__createGraph()
    biquad.__requiresRecompilation = [ 'mode', 'input' ]

    __out = Gibberish.factory(
      biquad,
      biquad.graph,
      ['filters','Filter12Biquad'], 
      props
    )

    return __out
  }

  Biquad.defaults = {
    input:0,
    Q: .15,
    cutoff:.05,
    mode:0
  }

  return Biquad

}


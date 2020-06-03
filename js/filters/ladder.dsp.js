const genish = require( 'genish.js' ),
      filterProto = require( './filter.js' )

module.exports = function( Gibberish ) {

  const makeChannel = function( input, _Q, _freq ) {
    'use jsdsp'
    const iT = 1 / genish.gen.samplerate,
          z  = genish.data([ 0,0,0,0 ], 1, { meta:true })

    const freq = genish.max(.005, genish.min( _freq, 1 ) ) 
    const Q = .5 + _Q * 23
    // kwd = 2 * $M_PI * acf[kindx]
    const kwd = ( Math.PI * 2 ) * freq * genish.gen.samplerate / 2

    // kwa = (2/iT) * tan(kwd * iT/2) 
    const kwa = 2/iT * genish.tan( kwd * iT/2 )

    // kG  = kwa * iT/2 
    const kg = kwa * iT/2

    // kk = 4.0*(kQ - 0.5)/(25.0 - 0.5)
    const kk = 4 * (Q - .5) / 24.5

    // kg_plus_1 = (1.0 + kg)
    const kg_plus_1 = 1 + kg

    // kG = kg / kg_plus_1 
    const kG     = kg / kg_plus_1,
          kG_2   = kG * kG,
          kG_3   = kG_2 * kG,
          kGAMMA = kG_2 * kG_2

    const kS1 = z[0] / kg_plus_1,
          kS2 = z[1] / kg_plus_1,
          kS3 = z[2] / kg_plus_1,
          kS4 = z[3] / kg_plus_1

    //kS = kG_3 * kS1  + kG_2 * kS2 + kG * kS3 + kS4 
    const kS = kG_3 * kS1 + kG_2 * kS2 + kG * kS3 + kS4

    //ku = (kin - kk *  kS) / (1 + kk * kGAMMA)
    const ku  = (input - kk * kS) / (1 + kk * kGAMMA)

    let kv =  ( ku - z[0] ) * kG
    let klp = kv + z[0]
    z[0] = klp + kv

    kv  = ( klp - z[1] ) * kG
    klp = kv + z[1]
    z[1] = klp + kv

    kv  = (klp - z[2] ) * kG
    klp = kv + z[2]
    z[2] = klp + kv

    kv  = (klp - z[3] ) * kG
    klp = kv + z[3]
    z[3] = klp + kv

    return klp
  }

  Gibberish.genish.zd24 = ( input, _Q, freq, isStereo=false ) => {
    const leftInput = isStereo === true ? input[0] : input
    const left = makeChannel( leftInput, _Q, freq )

    let out
    if( isStereo === true ) {
      const right = makeChannel( input[1], _Q, freq )
      out = [ left, right ]
    }else{
      out = left
    }

    return out
  }

  const Zd24 = inputProps => {
    const filter   = Object.create( filterProto )
    const props    = Object.assign( {}, Zd24.defaults, filter.defaults, inputProps )
    let out

    filter.__requiresRecompilation = [ 'input' ]
    filter.__createGraph = function() {
      let isStereo = false
      if( out === undefined ) {
        isStereo = props.input !== undefined && props.input.isStereo !== undefined ? props.input.isStereo : false 
      }else{
        isStereo = out.input.isStereo
        out.isStereo = isStereo
      }

      filter.graph = Gibberish.genish.zd24( genish.in('input'), genish.in('Q'), genish.in('cutoff'), isStereo ) 
    } 

    filter.__createGraph()

    out = Gibberish.factory(
      filter, 
      filter.graph, 
      ['filters','Filter24Moog'],
      props
    )

    return out
  }

  Zd24.defaults = {
    input:0,
    Q: .75,
    cutoff: .25,
  }

  return Zd24

}


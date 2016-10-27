let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
  let proto = Object.create( effect )

  Object.assign( proto, {
    note( rate ) {
      this.rate = rate
      if( rate > 0 ) {
        this.trigger()
      }else{
        this.__accum__.value = this.data.buffer.length - 1 
      }
    }
  })

  let Shuffler = inputProps => {
    let bufferShuffler = Object.create( proto )

    let props = Object.assign( {}, Shuffler.defaults, inputProps )
    let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
    let phase = g.accum( 1,0,{max:Infinity})

    let input = g.in( 'input' ),
        leftInput = isStereo ? input[ 0 ] : input,
        rightInput = isStereo ? input[ 1 ] : null,
        rateOfShuffling = g.in( 'rate' ),
        chanceOfShuffling = g.in( 'chance' ),
        windowLength = g.in( 'length' ),
        reverseChance = g.in( 'reverseChance' ),
        repitchChance = g.in( 'repitchChance' ),
        pitchMin = g.in( 'repitchMin' ),
        repitchMax = g.in( 'repitchMax' )

    let isShuffling = g.sah( g.gt( g.noise(), chanceOfShuffling ), g.eq( g.mod( phase, rateOfShuffling ), 0 ), 0 )
    //let shuffleCheck = g.switch( g.eq( g.mod( phase, rateOfShuffling ), 0 ),
    //  isShuffling.in( g.gt( g.noise(), chanceOfShuffling ) ),
    //  isShuffling.out
    //)
    //isShuffling.in( shuffleCheck  )

    let bufferL = g.data( 88200 ), bufferR = isStereo ? g.data( 88200 ) : null
    let readPhase = g.mod( phase, 88200 )
    let peekL = g.peek( bufferL, g.switch( isShuffling, g.wrap( g.sub(readPhase,22050), 0, 88200 ), readPhase ), { mode:'samples' }) 
    let pokeL = g.poke( bufferL, leftInput, g.mod( g.add( phase, 44100 ), 88200 ) )
    
    //g.delay( leftInput, g.switch( isShuffling, windowLength, -1 ), { size:props.delayLength })

    //bufferShuffler.__bang__ = g.bang()
    //bufferShuffler.trigger = bufferShuffler.__bang__.trigger

    Gibberish.factory( 
      bufferShuffler,
      peekL,
      'shuffler', 
      props 
    ) 
    //if( props.filename ) {
    //  bufferShuffler.data = g.data( props.filename )

    //  bufferShuffler.data.onload = () => {
    //    bufferShuffler.__phase__ = g.counter( rate, start, end, bufferShuffler.__bang__, shouldLoop, { shouldWrap:false })

    //    Gibberish.factory( 
    //      bufferShuffler,
    //      g.ifelse( 
    //        g.and( g.gte( bufferShuffler.__phase__, start ), g.lt( bufferShuffler.__phase__, end ) ),
    //        g.peek( 
    //          bufferShuffler.data, 
    //          bufferShuffler.__phase__,
    //          { mode:'samples' }
    //        ),
    //        0
    //      ),
    //      'sampler', 
    //      props 
    //    ) 

    //    if( bufferShuffler.end === -999999999 ) bufferShuffler.end = bufferShuffler.data.buffer.length - 1
        
    //    Gibberish.dirty( bufferShuffler )
    //  }
    //}

    return bufferShuffler
  }
  
  Shuffler.defaults = {
    input:0,
    rate:22050,
    chance:.25,
    length:22050,
    reverseChance:.5,
    repitchChance:.5,
    repitchMin:.25,
    repitchMax:4,
    pan: .5,
    panVoices:false,
  }

  return Shuffler 
}

    //let input = g.in( 'input' ),
    //    leftInput = isStereo ? input[ 0 ] : input,
    //    rightInput = isStereo ? input[ 1 ] : null,
    //    rateOfShuffling = g.in( 'rate' ),
    //    chanceOfShuffling = g.in( 'chance' ),
    //    windowLength = g.in( 'length' ),
    //    reverseChance = g.in( 'reverseChance' ),
    //    repitchChance = g.in( 'repitchChance' ),
    //    pitchMin = g.in( 'repitchMin' ),
    //    repitchMax = g.in( 'repitchMax' )


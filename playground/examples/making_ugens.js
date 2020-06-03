
/* Tutorial #7: Creating unit generators

This tutorial describes how to create your own
Gibberish unit generators using genish.js
(http://charlie-roberts.com/genish), a JS library
for designing low-level DSP algorithms based on the
gen~ language found in Max/MSP.

*/

// Let's start by creating a ugen that simply scales
// its input by an gain value. We'll name it Gain.
def = {
  name:'Gain', // you can leave this out, but it clarifies the calllback
  properties:{ source:0,  gain:.1 },
  constructor: function() {
    const g = Gibberish.genish
    return g.mul( g.in('gain'), g.in('source') )
  }
}
 
Gain = Make( def )

// create a Sine object to use as an input
mysin = Sine({ frequency: 220 })

// create a gain ugen to scale the sine oscillator
myugen = Gain({ source:mysin, gain:.5 })

// scale it again!
Gain({ source:myugen, gain:.25 }).connect()


// OK! Let's do something more complicated. This time we'll
// create a stereo pair of beating sine waves, with individual
// control over carrier and modulation frequencies.
def = {
  name:'SinePair',
  properties: {
    leftFrequency: 220,
    rightFrequency:220,
    modLeftFrequency:.1,
    modRightFrequency:.1333,
    modAmount:5
  },
  constructor: function() {
    const g = Gibberish.genish

    const sinL = g.cycle( 
      g.add(
        g.in( 'leftFrequency' ),
        g.mul( g.cycle( g.in( 'modLeftFrequency' ) ), g.in( 'modAmount' ) )
      )
    )

    const sinR = g.cycle( 
      g.add(
        g.in( 'rightFrequency' ),
        g.mul( g.cycle( g.in( 'modRightFrequency' ) ), g.in( 'modAmount' ) )
      )
    )

    // to create a stereo graph, simply put each channel into an array
    const graph = [ sinL, sinR ]
    
    return graph
  }
}

SinePair = Make( def )

a = SinePair({ modAmount:5 }).connect()

// sequence modAmount
seq = Sequencer.make( [2,5,10,20,40], [88200], a, 'modAmount' ).start()


// Last one: if you played around a bit you might have noticed that our
// Gain ugen doesn't accept  a SinePair instance as a source. This is 
// because each SinePair is stereo but we've only setup Gain to 
// accept mono inputs. Let's fix this!
def = {
  name:'Gain2',
  properties:{ source:0,  gain:.1 },
  constructor: function() {
    const g = Gibberish.genish
    
    // stereo inputs will have both [0] and [1]
    // array members; we can use this to check for stereo inputs.
    const hasStereoInput = g.in('source')[1] !== undefined
    
    let graph = null
        
    if( hasStereoInput ) {
	  const left  = g.mul( g.in('source')[0], g.in('gain') )
      const right = g.mul( g.in('source')[1], g.in('gain') )
      graph = [ left, right ]    	  
    }else{
      graph = g.mul( g.in('gain'), g.in('source') )
    }
    
    return graph
  }
}

Gain2 = Make( def )

pair = SinePair({ modAmount:5 })
scaled = Gain2({ source:pair, gain:.5 }).connect()

// Perhaps the hardest part about all of this is 
// learning the low-level unit generators in genish.js. There's
// a good tutorial to help you get started on the genish.js website, 
// as well as a playground similar to this one for experimentation.

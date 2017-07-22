/* Tutorial #6: Creating unit generators

This tutorial describes how to create your own
Gibberish unit generators using genish.js
(http://charlie-roberts.com/genish), a JS library
for designing low-level DSP algorithms.

*/

// Let's start by creating a ugen that simply scales
// its input by an gain additional value. We'll call it OurUgen.

// save a reference to genish for convenience
g = Gibberish.genish

OurUgen = function( source=0, gain=1 ) {
  // create an object that has the ugen prototype
  const ugen = Object.create( Gibberish.prototypes.ugen )
  
  // define a genish.js audio graph
  const graph = g.mul( g.in( 'source' ), g.in('gain') )
  
  // setup our ugen by passing:
  // 1: our ugen object
  // 2: our graph
  // 3: a name that is used during code generation
  // 4: a dictionary of properties and default values
  
  Gibberish.factory( ugen, graph, 'ourugen', { source, gain })
  
  // return our completed ugen
  return ugen
}

// create a Sine object to use as input
mysin = Sine({ frequency: 220 })

// create ourugen and connect it.
myugen = OurUgen( mysin, .025 ).connect()



// OK! Let's do something more complicated. This time we'll
// create a stereo pair of beating sine waves. We'll also pass
// a dictionary to our constructor instead of invidual arguemnts.

SinePair = __props => {
  const ugen = Object.create( Gibberish.prototypes.ugen )
  
  const sinL = g.cycle( 
    g.add(
      g.in('leftFrequency' ),
      g.mul( g.cycle( g.in( 'modLeftFrequency' ) ), g.in( 'modAmount' ) )
    )
  )
  
  const sinR = g.cycle( 
    g.add(
      g.in('rightFrequency' ),
      g.mul( g.cycle( g.in( 'modRightFrequency' ) ), g.in( 'modAmount' ) )
    )
  )
  
  // to create a stereo graph, simply put each channel into an array
  const graph = [ sinL, sinR ]
  
  // we'll create property values for this instance by overwriting
  // our defaults with whatever is passed to __props
  const props = Object.assign( {}, SinePair.defaults, __props )
  
  Gibberish.factory( ugen, graph, 'sinepair', props )
  
  return ugen
}

// define defaults
SinePair.defaults = {
  leftFrequency: 220,
  rightFrequency:220,
  modLeftFrequency:.1,
  modRightFrequency:.1333,
  modAmount:5
}

a = SinePair({ modAmount:5 }).connect()

// sequence modAmount
seq = Sequencer.make( [2,5,10,20,40], [88200], a, 'modAmount' ).start()


// Last one: you might have noticed that OurUgen doesn't accept
// a SinePair instance as a source. This is because each SinePair
// is stereo but we've only setup OurUgen to accept mono inputs. Let's
// fix this; we'll also change the name of our ugen to Gain.

Gain = function( input, gain=1 ) {
  // create an object that has the ugen prototype
  const ugen = Object.create( Gibberish.prototypes.ugen )
  
  // we'll make differing graphs depending on the number of
  // channels in the input
  let graph
  
  const __input = g.in( 'input' )
  const __gain  = g.in( 'gain'  )
  
  // all ugens have a isStereo property. 
  if( input.isStereo === true ) {
    
    // If an g.in() object is stereo, each channel can be accessed using
    // [] operators.
    const left  = g.mul( __input[0], __gain )
    const right = g.mul( __input[1], __gain )
    graph = [ left, right ]
    
  }else{
  	graph = g.mul( __input, __gain )
  }
  
  Gibberish.factory( ugen, graph, 'ourugen', { input, gain })
  
  // return our completed ugen
  return ugen
}

sinpair = SinePair({ leftFrequency: 440, rightFrequency: 440 })

gain = Gain( sinpair, .25 ).connect()

// As you might have ascertained, the hardest part about all of this is 
// knowing the low-level unit generators included with genish.js. There's
// a good tutorial to help you get started on the genish.js website, as well
// as a playground similar to the one here.

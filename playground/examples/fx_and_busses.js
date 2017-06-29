/* Tutorial #5: Busses and Effects

This tutorial walks through the basics of using busses and 
audio processing effects in gibberish.

As a reminder: To clear audio graph and stop sound: Ctrl+. (Ctrl+Period),
or execute Gibberish.clear(). Most commands in this tutorial are
designed to be executed one at a time.
*/

// FX in Gibber accept an input parameter, that we can pass synths
// or oscillators to.

// note we don't connect our kick to the main output
kick = Kick()

// ...but we do connect our reverb, and assign our kick
// as its input
verb = Freeverb({ input:kick, roomSize:.9 }).connect()

Sequencer.make( [.5], [44100], kick, 'trigger' ).start()

// make room bigger...
verb.roomSize = .975

// We can also, of course, connect a synth both to an effect
// as well as the main gibberish output

syn = Synth({ attack:44, decay:88200, gain:.1 }).connect()

syn.note( 220 )

ring = RingMod({ 
  input:syn, 
  frequency:Add( 250, Sine({ frequency:.25, gain:150 }) ) 
}).connect()

syn.note( 220 )

// in addition to specifying an FX input property, you can also use
// the connect() method to connect to an FX.

chorus = Chorus().connect()
 
syn2 = PolySynth({ maxVoices:3, gain:.1 })
  .connect( chorus )
  .connect()

syn2.chord( [220,330,440] )

// note that only one synth can be connected at a time in this
// fashion. We can have multiple instruments feed an effect
// by feeding them into a separate Bus() object.

bus = Bus().connect()
 
fm1 = FM({ cmRatio:3 }).connect( bus )
fm2 = FM({ cmRatio:8 }).connect( bus )

fm1.note( 220 )
fm2.note( 220 )

bus.pan = 1 // hard right

fm1.note( 220 ); fm2.note( 330 )

bus.pan = 0 // hard left
bus.gain = .1

fm1.note( 220 ); fm2.note( 330 )

// As you can see from above, all busses expose pan and gain
// properties. Let's disconnect our bus.

bus.disconnect()

fm1.note( 220 ); fm2.note( 330 ) // no sound

// Now we can use our bus as an input to an effect, and
// route that effect to our master output

delay = Delay({ input:bus, feedback:.5 }).connect()

// ... and we can easily route more instruments into the effect:

kick = Kick({ frequency:120 }).connect( delay.input )
snare = Snare().connect( delay.input )

kick.trigger( 1 ); 
snare.trigger( .5 )

// multiple busses, panned hard left/right, different delay times

Gibberish.clear()

// create busses and connect delay fx to them
busL = Bus({ pan:0 }).connect()
busR = Bus({ pan:1 }).connect()
delayL = Delay({ feedback:.5,  time:11025 }).connect( busL )
delayR = Delay({ feedback:.65, time:11025 * .66666 }).connect( busR )

// connect a kick drum to our delays
kick = Kick({ frequency:120 }).connect( delayL ).connect( delayR )

// play a kick
kick.trigger( 1 )

// One last tricky part. For efficiency reasons, the Bus() object only
// mono arguments, although you can then pan the resulting output of the
// bus. To accept stereo inputs, use Bus2().

Gibberish.clear()

syn = PolySynth({ 
  maxVoices:3, 
  gain:.1,
  panVoices:true,
  attack: 88200, decay:88200,
  pan: Abs( Sine({ frequency:1 }) )
})
 
verb = Plate({ input:Bus2(), decay:.95, predelay:20 }).connect()

syn.connect( verb.input )
syn.chord( [110,220,330] )

// There are lots of other effects to experiment with, check the
// gibberish reference! (link at top of this page)

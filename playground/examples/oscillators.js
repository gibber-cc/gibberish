/* Tutorial #2: Oscillators

This tutorial walks through the basics of using oscillators
in Gibberish, both as raw sound sources and as modulation generators.
The tutorial assumes you've completed tutorial #1 and know how to 
execute code and clear the audio graph.

As a reminder: To clear audio graph and stop sound: Ctrl+. (Ctrl+Period),
or execute Gibberish.clear(). Most commands in this tutorial are
designed to be executed one at a time.
*/

// make some oscillators
Sine().connect()
 
Saw({ frequency: 220, gain:.5 }).connect()
 
Square({ frequency: 110, gain: .35 }).connect()

// clear
Gibberish.clear()

// there's some harsh overtones in that square wave.
// we can use an anti-aliased algorithm instead. antialiased
// oscillators are a bit more expensive than aliased ones, so
// don't use them for modulations.
s = Square({ frequency:110, antialias:true, gain:.2 }).connect()

s.frequency = 440

Gibberish.clear()

// modulate! note that we don't connect our initial sine
// oscillator to our output, as we don't want to hear the raw signal.
mod = Sine({ frequency:4, gain:10 })

carrier = Square({ 
  frequency: Add( 440, mod ), 
  gain:.25, 
  antialias:true 
}).connect()

mod.gain = 50

mod.frequency = 8

Gibberish.clear()

// there's a few other types of oscillators to play with. first, PWM
// (pulsewidth modulation)

p = PWM({ antialias:true }).connect()

p.pulsewidth = .05

p.pulsewidth = Add( .5, Sine({ frequency:1, gain:.495 }) )

// and there's noise

white = Noise().connect()

pink  = Noise({ color:'pink' }).connect()

brown = Noise({ color:'brown' }).connect()

// we can use any of these oscillators (well, not noise) 
// in our various synthesizers.
syn = Synth({ waveform:'square', antialias:true }).connect()
syn.note( 220 )

syn2 = Synth({ waveform:'pwm', antialias:true }).connect()
syn2.pulsewidth = Add( .5, Sine({ frequency:1, gain:.495 }) )
syn2.decay = 88200
syn2.note( 220 )

syn2 = Synth({ waveform:'saw', antialias:true }).connect()
syn2.attack = 88200
syn2.note( 220 )

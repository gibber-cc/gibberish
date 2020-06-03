/* Gibberish Deep Note

**** To run this demo, select all the code and hit Ctrl+Enter. To ****
**** stop sound, hit Ctrl+. (period) or execute Gibberish.clear() ****

This demo plays a single chord using Feedback FM synthesis,
where the modulating oscillator has a single-sample feedback
loop that can create wild fluctuations in the sound.
In Gibberish's FM instrument, the amount of feedback, the modulation
index, and the overall amplitude of the output are all controlled
by the synth's envelope; this short demo uses the envelope to 
create a chord that gradually rises / fades in complexity over the
course of a minute.

This is just a quick sample; there are many tutorials and other demos in the
menu at the top of the page, as well as a full API reference. Gibberish is
made using genish.js (http://charlie-roberts.com/genish). The code that
Gibberish compiles and runs will be displayed to the right. */


// select all code and hit Ctrl+Enter to run.
bigfm = PolyFM({ 
  gain:.15, 
  cmRatio:1.01,
  index:1.2,
  carrierWaveform:'triangle',
  modulatorWaveform:'square',
  attack:44100 * 32,
  decay:44100 * 32,
  feedback:.1,
}).connect()

verb   = Freeverb({ roomSize:.95, damping:.15 }).connect()
chorus = Chorus().connect( verb )
bigfm.connect( chorus )

bigfm.chord( [110,220,330,440] )

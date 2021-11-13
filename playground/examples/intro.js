/* Gibberish.js - Demo Introduction
 * Select all code and hit ctrl+enter to run.
 * Ctrl+. (period) stops all sound. 
 * Select other demos/tutorials from the demos menu to learn more!
 */

beat = 22050

// global reverb object
verb = Freeverb({ input:Bus2(), roomSize:.975, damping:.5 }).connect()

/*** bassline ***/
bass = Synth({ 
  gain:.15, 
  attack:44, 
  decay: 5512,
  Q:.8, // CAREFUL!!!
  filterModel:2,
  saturation:2,
  filterMult:3.25,
  antialias:true,
  cutoff: Add( 1, Sine({ frequency:.1, gain:.75 }) )
})
.connect( Gibberish.output )
.connect( verb.input, .5 )

bassNotes = [55,110,165,220]
bassSeq = Sequencer.make( [55,110,165,220], [beat/4], bass, 'note' ).start()
noteSeq = Sequencer.make( 
  [
    bassNotes.map( v=>v*1.25 ),
    bassNotes.map( v=>v*1.25*.8 ),
    bassNotes.map( v=>v*1.25*.8*.8 ),
    bassNotes.map( v=>v*1.25*.8*.8*1.25 ),    
  ],
  [beat*16],
  bassSeq, 
  'values' 
).start()

/*** end bassline ***/

/*** drums ***/
kick = Kick().connect()
kickSeq = Sequencer({
  target:kick,
  key:'trigger',
  values:[.75,.5,.75,.75,.35,.75,.5],
  timings:[beat *.75, beat * .25, beat, beat * .5, beat * .5, beat *.5, beat * .5]
}).start()

snare = Snare()
  .connect( verb.input, .5 )
  .connect( Gibberish.output, .75 )

// delay start by one beat so snare aligns with beats 2 & 4
snareSeq = Sequencer.make( [1], [beat*2], snare, 'trigger' ).start( beat )

hat = Hat().connect()
hatSeq = Sequencer.make( [ .075 ], [ beat / 4 ], hat, 'trigger' ).start()
decSeq = Sequencer.make( [ ()=> Math.random() > .25 ? .05 : .2 ], [ beat / 4 ], hat, 'decay' ).start()

/*** start chords ***/
chords = PolySynth({
  attack: 44, decay: beat*10,  
  gain:   .075,
  maxVoices:3,
  glide:15000,
  waveform:'pwm',
  pulsewidth:Add( .35, Sine({ frequency:.35, gain:.3 }) ),
})

chords.connect()

chorus = Chorus({ input: chords, slowGain:8, fastFrequency:4, fastGain:1  })
  .connect( verb.input )

chord = [440,550,660]
chordsSeq = Sequencer({
  target:chords,
  key:'chord',
  values:[
    chord.map( v=>v*1.25 ),
    chord.map( v=>v*1.25*.8 ),
    chord.map( v=>v*1.25*.8*.8 ),
    chord.map( v=>v*1.25*1.25*.8*.8 )
  ],
  timings:[beat * 16]
}).start()


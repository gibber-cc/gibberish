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
  gain:.5, 
  attack:44, 
  decay: 5512,
  Q:.8, // CAREFUL!!!
  filterType:3,
  saturation:2,
  filterMult:3.25,
  antialias:true,
  cutoff: Add( 1, Sine({ frequency:.1, gain:.75 }) )
})
.connect( Gibberish.output )
.connect( verb.input, .5 )

bassSeq = Sequencer.make( [55,110,165,220], [beat/4], bass, 'note' ).start()
/*** end bassline ***/

/*** drums ***/
kick = Kick().connect()
kickSeq = Sequencer({
  target:kick,
  key:'trigger',
  values:[.5,.35,.5,.5,.25,.5,.25],
  timings:[beat *.75, beat * .25, beat, beat * .5, beat * .5, beat *.5, beat * .5]
}).start()

snare = Snare()
  .connect( verb.input, .5 )
  .connect( Gibberish.output, .75 )

// delay start by one beat so snare aligns with beats 2 & 4
snareSeq = Sequencer.make( [.25], [beat*2], snare, 'trigger' ).start( beat )

close = Hat({ decay:.05 }).connect()
open  = Hat({ decay:.2 }).connect()

hatz = ()=> {
   if( Math.random() > .25 ) 
     close.trigger( .035 )
   else
     open.trigger( .05 )
}

hatSeq = Sequencer.make( [ hatz ], [ beat / 4 ] ).start()
/*** end drums ***/	

/*** start chords ***/
chords = PolySynth({
  attack: 44, decay: beat*10,  
  gain:   .075,
  maxVoices:3,
  glide:15000,
  waveform:'pwm',
  pulsewidth:Add( .35, Sine({ frequency:.35, gain:.3 }) ),
})

chorus = Chorus({ input: chords, slowGain:8, fastFrequency:4, fastGain:1  })
  .connect( verb.input )

chordsSeq = Sequencer({
  target:chords,
  key:'chord',
  values:[[440, 550, 660]],
  timings:[beat * 16]
}).start()
/*** end chords ***/

/*** harmony... affects bass line and chords ***/
modulateDown = ()=> {
  chordsSeq.values[0] = chordsSeq.values[0].map( v => v * .8 )
  bassSeq.values  = bassSeq.values.map(  v => v * .8 )
}

modulateUp = ()=> {
  chordsSeq.values[0] = chordsSeq.values[0].map( v => v * 1.25 )
  bassSeq.values  = bassSeq.values.map(  v => v * 1.25 )
}

// sequence function calls, priority 1 ensures that modulations are triggered
// before chord messages occur on the same beat.
harmony = Sequencer({
  values:[ modulateUp, modulateDown, modulateDown, modulateUp ],
  timings:[ beat * 16 ],
  priority:1
}).start()
/*** end harmony ***/

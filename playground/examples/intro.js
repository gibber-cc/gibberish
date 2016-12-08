
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
  gain:.35, 
  attack:44, 
  decay: 5512,
  Q:.825, // CAREFUL!!!
  filterType:3,
  saturation:5,
  filterMult:880,
  antialias:true,
  cutoff: Add( 880, Sine({ frequency:.1, gain:770 }) )
})
.connect( Gibberish.output )
.connect( verb.input, .5 )

bassSeq = Sequencer({
  target:bass,
  key:'note',
  values:[55,110,165,220],
  timings:[beat/4]
}).start()
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
  .connect( verb.input, .25 )
  .connect( Gibberish.output, .35 )

snareSeq = Sequencer({
  target:snare,
  key:'trigger',
  values:[.25],
  timings:[beat * 2]
}).start( beat ) // delay start by one beat so snare aligns with beats 2 & 4
/*** end drums ***/	

/*** chords (via FM synthesis ***/
fm = PolyFM({
  cmRatio : 1 / 1.0007,
  index	  : 20,
  attack  : beat * 4,
  decay	  : beat * 4,
  gain:   .025,
  attack: 44, decay: beat*8,
  panVoices:true,
  maxVoices:3,
  glide:20000,
  pan : Add( .5, Sine({ frequency:2, gain:.5 }) )
})
 
flange = Flanger({ input: fm, frequency:.5, offset:.55 })
  .connect( Gibberish.output ).connect( verb.input )
 
fmSeq = Sequencer({
  target:fm,
  key:'chord',
  values:[[440, 550, 660]],
  timings:[beat * 16]
}).start()
/*** end chords ***/

/*** harmony... affects bass line and chords ***/
modulateDown = ()=> {
  fmSeq.values[0] = fmSeq.values[0].map( v => v * .8 )
  bassSeq.values  = bassSeq.values.map(  v => v * .8 )
}

modulateUp = ()=> {
  fmSeq.values[0] = fmSeq.values[0].map( v => v * 1.25 )
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

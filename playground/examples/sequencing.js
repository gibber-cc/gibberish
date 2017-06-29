/* Tutorial #6: Sequencing and Scheduling

This tutorial walks through the basics of scheduling
sample-accurate events in gibberish, and performing
audio-rate modulation of timing.

*/

// make a synth to sequence
syn = Synth({ attack:44, decay:5512, gain:.1 }).connect()

// There are four properties we (typically) need to define
// when we create a Sequencer object. A 'target' for the
// sequencer to control, a 'key' defining a method or property
// to manipulate, a list of 'values' to output, and a list of
// 'timings' to use for scheduling.

seq = Sequencer({
  target: syn, key:'note',
  values:[220,330,440], timings:[11025]
})

// tell our sequencer to start
seq.start()

// stop
seq.stop()

// Sequencer.make() is a shorthard for this that accepts
// values, timings, target, and key as arguments.

seq = Sequencer.make( [220,330,440], [11025], syn, 'note' ).start()

seq.stop()

// The start() method of our sequencer object accepts a number which
// defines an sample offset for the sequencer. For example, if we
// wanted a kick-snare-kick-snare pattern:

kick = Kick().connect()
snare = Snare().connect()

// run these next two lines at the same time
Sequencer.make( [1], [44100], kick, 'trigger' ).start()
Sequencer.make( [.5], [44100], snare, 'trigger' ).start( 22050 )

// Scheduling by Sequencer objects is done using a global priority queue
// that is checked once per-sample. This queue is managed by the 
// Gibberish.scheduler object. You can manually add a function to
// this priority queue to be executed:

Gibberish.scheduler.add( 44100, ()=> alert('44100 samples have passed.' ) )

// The Sequencer2 object in gibberish is almost identical to Sequencer, except
// that it affords audio-rate modulation of timing. This makes it more expensive,
// but much more powerful for many tasks. The modulation is exposed via the
// sequencers 'rate' property.

kick = Kick().connect()
 
seq = Sequencer2({ values:[.5], timings:[22050], target:kick, key:'trigger' }).start()

// double time
seq.rate = 2

// half time
seq.rate = .5

// modulated
seq.rate = Add( 2, Sine({ frequency:.1, gain:2 }) )

// Below is a demo where 15 plucked string models gradually
// go in and out of sync with each other via rate modulation.

// how many strings to pluck
const count = 15

// how much to fluctuate tempo (0–1) between strings
const depth = .5

for( let i = 0; i < count; i++ ) {
  
  const k = Karplus({ 
    panVoices: true,
    pan:       i/count, 
    gain:      1/count
  })
  .connect()
    
  const s = Sequencer2({
    target:k, key:'note',
    values:[110 + i * 55], timings:[11025],
  }).start()
  
  // modulate tempo for every string except the first one
  if( i !== 0 )
    s.rate = Add( 1, Sine({ frequency:.1 * i, gain:depth }) )
  
}

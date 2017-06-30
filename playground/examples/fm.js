/* demo: FM

The FM instrument is a two-operator (oscillator) instrument
with feedback loop placed around the modulating oscillator.
The envelope of the instrument affects the depth of modulation,
output volume, and filter cutoff frequency (if the filter is
turned on by specifying a type other than 0.)

*/

bass = FM({ 
  gain:.25, 
  attack:44, 
  decay: 22050,
  feedback:.001,
  cutoff:.35
})
.connect( Gibberish.output )

bassSeq = Sequencer({
  target:bass,
  key:'note',
  values:[ 55,110,165,220 ],
  timings:[ 22050 ]
}).start()

// create a simple gui using dat.GUI
gui = new dat.GUI({ width: 400 }) 
gui.add( bass, 'cmRatio', .01, 20.01  )
gui.add( bass, 'index', .1, 20 )
gui.add( bass, 'feedback', 0.0001, .999 )
gui.add( bass, 'attack', 44, 22050 )
gui.add( bass, 'decay', 44, 22050 )
gui.add( bass, 'carrierWaveform', ['sine','square','saw','triangle'] )
gui.add( bass, 'modulatorWaveform', ['sine','square','saw','triangle'] )
gui.add( bass, 'filterType', { none:0, classic:1, moog:2, tb303:3, svf:4, biquad:5 })
gui.add( bass, 'filterMult', .1, 7 )
gui.add( bass, 'cutoff', 0, 1 )
gui.add( bass, 'Q', 0, 1 )
gui.add( bass, 'gain', 0, 1 )

gui.add( bassSeq.timings, '0', 5512, 44100, 'speed' )

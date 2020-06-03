beat = 22050

verb = Freeverb({ input:Bus2(), roomSize:.975, damping:.5 }).connect()

bass = Synth({ 
  gain:.25, 
  attack:44, 
  decay: 5512,
  filterType:2,
  antialias:true
})
.connect( Gibberish.output )
.connect( verb.input )

bassSeq = Sequencer({
  target:bass,
  key:'note',
  values:[55,110,165,220],
  timings:[beat / 2]
}).start()

// create a simple gui using dat.GUI
gui = new dat.GUI({ width: 400 }) 
gui.add( bass, 'cutoff', 0, 1  )
gui.add( bass, 'filterMult', 0, 4 )
gui.add( bass, 'Q', 0, 1 )
gui.add( bass, 'saturation', 1, 10 )
gui.add( bass, 'attack', 44, 8192 )
gui.add( bass, 'decay', 44, 8192 )
gui.add( bass, 'glide', 1, 1024 )
gui.add( verb, 'roomSize', .5, .99 )
gui.add( verb, 'damping', .0, 1.0 )

// bassSeq.timings[0] *= 2

// bassSeq.values = bassSeq.values.map( v => v * 2 )

// verb.disconnect()

// bass.gain = .5

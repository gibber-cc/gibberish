window.onload = function() {
  // must specify workletPath before initializing Gibberish
  Gibberish.workletPath = '../../dist/gibberish_worklet.js'

  // Gibberish.init will wait to initialize audio context until
  // the browser window has received a mousedown or a touchdown
  // event, which is required in modern browsers. 
  Gibberish.init().then( ()=> {
    Gibberish.export( window )
    
    fx = Chorus().connect( 
      Freeverb().connect() 
    )

    syn = Synth()
      .connect( fx, 1 )
      .connect()

    seq = Sequencer({
      key:'note',
      target:syn,
      values:[ 220,440 ],
      timings:[ 22050 ]
    }).start()

  })
} 

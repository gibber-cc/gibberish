// Audio-rate modulation of scheduling
// Listen long enough (15 seconds? depends on chosen depth) 
// and they'll all pop back into sync.

// how many strings to pluck
const count = 10

// how much to fluctuate tempo (0–1) between strings
const depth = .25

for( let i = 0; i < count; i++ ) {
  const k = Karplus({ panVoices:true, pan:i/count, gain:1/count })
  	.connect()
    
  // Sequencer2 lets you modulate scheduling at audio-rate
  const s = Sequencer2({
    target:k, key:'note',
    values:[110 + i * 55], timings:[11025],
  }).start()
  
  // modulate tempo for every string except the first one
  if( i !== 0 )
    s.rate = Add( 1, Sine({ frequency:.05 * i, gain:depth }) )
}

# Gibberish

[Gibberish][gibberish] is designed to be a fast audio API for the browser. It takes the low-level building blocks provided by [genish.js](https://charlie-roberts.com/genish) and uses them to create higher-level synthesizers, effects, and sequencers. Gibberish proceses each sample of each synthesis block one sample at a time, enabling a variety of effects not typically possible in JavaScript synthesis systems, most importantly single-sample feedback loops and audio-rate modulation of scheduling. 

Note that this branch is for version 3 of the library. See [the master branch](https://github.com/gibber-cc/gibberish/tree/master) for the pre-June 2017 version that is currently used in Gibber. There is also a tagged release of the older version (2.0.0).

## Live Code Playground
https://www.charlie-roberts.com/gibberish/playground

## Example Code
```javascript
kik = Kick().connect() // connects to master output by default

// sequence calls to 'trigger' method of kick drum every 1/2 second
// with alternating loudness levels.
seq  = Sequencer.make( [.25,.5], [22050], kik, 'trigger' ] ).start()

chr = Chorus().connect()
syn = PolySynth({ maxVoices:4, attack:44, decay:22050, gain:.1 })

// connect to chorus and master output
syn.connect( chr ).connect()

syn.chord( [220,330,440,550] )
```

## HTML + Initialization
```html
<!doctype html>

<html lang='en'>
  <head>
    <script src='dist/gibberish.js'></script>
  </head>

  <body></body>
  
  <script>
  window.onload = function() {
    Gibberish.workletPath = 'dist/gibberish_worklet.js'

    Gibberish.init().then( ()=> {
      Gibberish.export( window )
      
      Sine().connect() 
    })
  }
  </script>
</html>
```

## Development dependencies

* node 6 or better
* npm
* gulp

## Building
You need to have node.js and gulp installed. Then:

1. Run `npm install` in the top level directory
2. Run `gulp` in the top level directory
3. Run `gulp minify` if you'd like to create minified and gzipped versions of the library.

The library will then be found in the `dist` folder.

## Ugens
Gibberish includes a long list of oscillators, fx, and synthesis algorithms.

### Oscillators
* Sine
* Triangle
* Saw (wavetable & anti-aliased)
* PWM (algorithmic & anti-aliased)
* Square (wavetable & anti-aliased)
* Noise( white, pink, brown )
* Sampler - read audiofiles and playback at various speeds

### Synthetic Percussion (TR-808 emulation)
* Kick
* Snare
* Clave
* Tom
* Cowbell
* Hat
* Conga

### Synths
All synths also have polyphonic versions.

* Synth - oscillator + optional filter + envelope
* Monosynth - three oscillators + optional filter + envelope
* FM - two op FM synthesis + optional filter + envelope
* Karplus-Strong - Physical model of a plucked string
* Complex - oscillator + wavefolder + filter + envelope

### Effects
* BitCrusher - bit depth and sample rate reduction
* Buffer Shuffler
* Chorus (arp solina model)
* Delay
* Distortion
* Flanger
* Ring Modulation
* Reverb (freeverb and dattorro plate reverb models)
* Vibrato

### Filters
* State Variable Filter (12 db resonant)
* Biquad Filter (12 db resonant)
* Ladder Filter ("Moog-style" 24db resonant)
* "Virtual Analog" (aka implicit) Ladder Filter ("Moog-style" 24db resonant)
* "Virtual Analog" (aka implicit) ZDF filter (a la TB-303)

### Analysis
* Envelope Follower

### Sequencing
* Seq  - sample-accurate scheduling
* Seq2 - provides audio-rate modulation of timing

## License
Gibberish is licensed under the MIT license.

[gibberish]:https://www.charlie-roberts.com/gibberish/

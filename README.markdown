#Gibberish

[Gibberish][gibberish] is designed to be a fast audio API for browser based audio content. It currently runs in Chrome, Safari 6+ and Firefox. It is 73 KB after minification.

Gibberish is different from other JavaScript audio libraries (such as [audiolib.js][audiolib] or [Audiolet][audiolet]) in that it is heavily optimized for JIT compilation and per-sample processing. Per-sample processing means code is less efficient, but it enables you do to complex signal-processing (such as sample-accurate audio-rate modulation of scheduling and feedback networks) that isn't possible using buffer-based processing. The code that is generated is arguably not human-readable, hence the name _Gibberish_. Below is an example of the input code (which you write) and the audio callback that is outputted (which is created by Gibberish... you should never have to even look at this). The audio callback plays a sine wave with vibrato feeding delay and reverb effects:

## Live Demo
[http://www.charlie-roberts.com/gibberish][gibberish]

## Input
```javascript
Gibberish.init();                   // convenience method to start audio callback
Gibberish.Binops.export();          // export math functions into global namespace

mod = new Gibberish.Sine( 5, 15 );  // sine wave, 5 Hz, 15 amplitude

sine = new Gibberish.Sine({         // sine wave with frequency modulated by mod
  frequency: Add( 440, mod ), 
  amp: .4 
}); 

delay = new Gibberish.Delay({ input:sine });     // create a delay effect and feed our sine wave into it
reverb = new Gibberish.Reverb({ input:delay });  // create a reverb effect and feed our delay into it
reverb.connect();                                // connect reverb to default master output
```

## Output
```javascript
Gibberish.callback = function(input,sine_2, sine_4, delay_5, reverb_6, bus2_0){
  var v_10 = sine_2(5, 15);
  var v_9 = sine_4(( 440 + v_10 ), 0.4);
  var v_8 = delay_5(v_9, 22050, 0.5, 1, 1);
  var v_7 = reverb_6(v_8, 0.5, 0.55, 0.84, 0.5);
  var v_1 = bus2_0(v_7, 1, 0);

  return v_1;
}
```

As you can see, there are no calls to any objects in the generated callback, just functional, JIT-optimizable goodness.

## Dependencies

* node 6 or better
* npm
* gulp

## Building
You need to have node.js installed. Then:

1. Run `npm install` in the top level directory
2. Run `npm install gulp-cli` in the top level directory
3. Run `./node_modules/.bin/gulp` in the top level directory

This will create both a minimized and un-minimized version of the library.

## Usage
Gibberish uses the UMD pattern, so it can be used in node, with AMD, or via simple script tags. If used with script tags the `Gibberish` object will be exported into the global namespace.

## Ugens
Gibberish has a long list of oscillators, fx, and synthesis algorithms built in.

### Oscillators
* Sine
* Triangle
* Saw
* PWM
* Band-limited Saw
* Band-limited PWM
* White Noise
* Sampler - read audiofiles and playback at various speeds
* Table - wavetable with dynamic buffer

### Synthetic Percussion (tr-808 emulation)
* Kick
* Snare
* Clave
* Tom
* Cowbell
* Hat
* Conga

### Synths
All synths except the monosynth also have polyphonic versions

* Synth - oscillator + envelope
* Synth2 - oscillator + envelope + filter
* Monosynth - three oscillators + filter + envelope
* FM - two op FM synthesis
* Karplus-Strong - Physical model of a plucked string

### Effects
* Decimator - bit depth and sample rate reduction
* Distortion - waveshaping
* Delay
* Ring Modulation
* Flanger
* Vibrato
* Reverb
* Buffer Shuffler
* Granulator
* OnePole filter
* State Variable Filter (12 db resonant)
* Biquad Filter (12 db resonant)
* Ladder Filter ("Moog-style" 24db resonant)

### Analysis
* Envelope Follower

### Sequencing
* Seq
* Seq2 - audio rate sequencer with rate modulation

## License
Gibberish is licensed under the MIT license.

[gibberish]:http://www.charlie-roberts.com/gibberish
[audiolib]:https://github.com/jussi-kalliokoski/audiolib.js/
[audiolet]:https://github.com/oampo/Audiolet


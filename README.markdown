# Gibberish

[Gibberish][gibberish] is designed to be a fast audio API for the browser. It takes the low-level building blocks provided by [http://charlie-roberts.com/genish.js][genish.js] and uses them to create higher-level synthesizers, effects, and sequencers. Gibberish proceses each sample of each synthesis block one sample at a time, enabling a variety of effects not typically possible in browser-based synthesis systems, most importantly single-sample feedback loops and audio-rate modulation of scheduling. 

## Live Demo
[http://www.charlie-roberts.com/gibberish2][gibberish]

## Dependencies

* node 6 or better
* npm
* gulp

## Building
You need to have node.js and gulp installed. Then:

1. Run `npm install` in the top level directory
2. Run `gulp` in the top level directory

If you don't have gulp installed:

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
* Saw (wavetable & anti-aliased)
* PWM (algorithmic & anti-aliased)
* Square (wavetable & anti-aliased)
* Noise( white, pink, brown )
* Sampler - read audiofiles and playback at various speeds

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

* Synth - oscillator + optional filter + envelope
* Monosynth - three oscillators + optional filter + envelope
* FM - two op FM synthesis + optional filter + envelope
* Karplus-Strong - Physical model of a plucked string

### Effects
* BitCrusher - bit depth and sample rate reduction
* Delay
* Ring Modulation
* Flanger
* Vibrato
* Reverb (freeverb and dattorro models)
* Buffer Shuffler

### Filters
* State Variable Filter (12 db resonant)
* Biquad Filter (12 db resonant)
* Ladder Filter ("Moog-style" 24db resonant)
* "Virtual Analog" (aka implicit) Ladder Filter ("Moog-style" 24db resonant)
* "Virtual Analog" (aka implicit) ZDF filter (a la TB-303)

### Analysis
* Envelope Follower

### Sequencing
* Seq
* Seq2 - audio rate sequencer with rate modulation

## License
Gibberish is licensed under the MIT license.

[gibberish]:http://www.charlie-roberts.com/gibberish2
[audiolib]:https://github.com/jussi-kalliokoski/audiolib.js/
[audiolet]:https://github.com/oampo/Audiolet


#Gibberish

[Gibberish][gibberish] is designed to be a fast audio API for browser based audio content. It currently runs in Chrome, Safari 6+ and Firefox. It is 42 KB after minification.

Gibberish is different from other JavaScript audio libraries (such as [audiolib.js][audiolib] or [Audiolet][audiolet]) in that it generates code that is heavily optimized for JIT compilation. The code that is generated is arguably not human-readble, hence the name _Gibberish_. Below is an example of the input code (which you write) and the audio callback that is outputted (which is created by Gibberish... you should never have to even look at this). The audio callback plays a sine wave with vibrato feeding delay and reverb effects:

## This fork

This is a forked version by janesconference. This fork:

- Allows Gibberish to work with an audio node as destination. This allows Gibberish to work in Hyacinth (http://hya.io) and to be more flexible, in general.
- Uses a grunt-based build system and exports a package.json. Just `grunt` to compile gibberish in build/, or `grunt build` to compile, strip logs and uglify.
- Allows Gibbberish to work with jspm.io frictionless package manager (http://jspm.io/)

## Use jspm.io CDN

To get the uglified build from the jspm.io CDN, just put

`https://github.jspm.io/janesconference/Gibberish@master/gibberish.js` in your script tag

or `jspm.import` this URL in your javascript:

`github:janesconference/Gibberish/gibberish`

## Use a custom context and Web Audio Node destination

You can now pass your context and destination audio node to the Gibberish.init() function like this:

`Gibberish.init(your_context, your_audio_node);`

## Live Demo
[http://www.charlie-roberts.com/gibberish][gibberish]

##Input
```javascript
Gibberish.init();                   // convenience method to start audio callback

s = new Gibberish.Sine( 440, .4 ); 	// sine wave, 440 Hz, .4 amplitude
m = new Gibberish.Sine( 5, 15 );	// sine wave, 5 Hz, 15 amplitude
s.mod( 'frequency', m, '+' );		// modulate the frequency of sine s with the output of m

d = new Gibberish.Delay(  s );      // create a delay effect and feed our sine wave into it
r = new Gibberish.Reverb( r );      // create a reverb effect and feed our delay into it
r.connect();                        // connect reverb to default master output
```

##Output (with some text formatting applied)
```javascript
// create upvalues for callback function. It is quicker to reference
// upvalues than to dynamically resolve addresses of objects in a ugen graph.

var bus2_0 = Gibberish.functions.bus2_0;
var sine_314 = Gibberish.functions.sine_314;
var sine_311 = Gibberish.functions.sine_311;
var Delay_317 = Gibberish.functions.Delay_317;
var Reverb_322 = Gibberish.functions.Reverb_322;

Gibberish.callback = function() {
	var v_327 = sine_314(5, 15);
	var v_326 = sine_311(440 + v_327, 0.4);
	var v_329 = Delay_317(v_326, 22050, 0.5, 1);
	var v_328 = Reverb_322(v_329, 0.5, 0.55);
	var v_4   = bus2_0(v_328, 1, 0);

	return v_4;
}
```

As you can see, there are no calls to any objects in the generated callback, just functional, JIT-optimizable goodness.

##Ugens
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

## License
Gibberish is licensed under the MIT license. The Sampler object reads audiofiles using [audiofile][Audiofile.js].

[gibberish]:http://www.charlie-roberts.com/gibberish
[audiolib]:https://github.com/jussi-kalliokoski/audiolib.js/
[audiolet]:https://github.com/oampo/Audiolet
[audiofile]:https://github.com/oampo/audiofile.js/

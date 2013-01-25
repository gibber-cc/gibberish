#Gibberish

[Gibberish][gibberish] is designed to be a fast audio API for browser based audio content. As with most web-based JavaScript audio libraries, it currently only runs in Chrome and Firefox (and beta versions of Safari).

Gibberish is different from other JavaScript audio libraries (such as [audiolib.js][audiolib] or [Audiolet][audiolet]) in that it generates code that is heavily optimized for JIT compilation. The code that is created is arguably not human-readble, hence the name _Gibberish_. Below is an example of the input code (which you write) and the audio callback that is outputted (which is created by Gibberish... you should never have to even look at this). The audio callback plays a sine wave with vibrato feeding delay and reverb effects.:

##Input
```javascript
Gibberish.init();                   // convenience method to start audio callback

s = new Gibberish.Sine( 440, .4 ); 	// sine wave, 440 Hz, .4 amplitude
m = new Gibberish.Sine( 5, 15 );		// sine wave, 5 Hz, 15 amplitude
s.mod( 'frequency', m, '+' );				// modulate the frequency of sine s with the output of m

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

Gibberish is licensed under the MIT license.

[gibberish]:http://www.charlie-roberts.com/gibberish
[audiolib]:https://github.com/jussi-kalliokoski/audiolib.js/
[audiolet]:https://github.com/oampo/Audiolet
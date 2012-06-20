#Gibberish

[Gibberish][gibberish] is designed to be a fast audio API for browser based audio content. As with most web-based JavaScript audio libraries, it currently only runs in Chrome and Firefox (and beta versions of Safari).

Gibberish is different from other JavaScript audio libraries (such as [audiolib.js][audiolib] or [Audiolet][audiolet]) in that it generates code that is heavily optimized for JIT compilation. The code that is created is arguably not human-readble, hence the name _Gibberish_. Below is an example of the input code (which you write) and the audio callback that is outputted (which is created by Gibberish... you should never have to even look at this). The audio callback plays a sine wave with vibrato:

##Input
```javascript
var s = Gibberish.Sine(440, .4); 	// sine wave, 440 Hz, .4 amplitude
var m = Gibberish.Sine(5, 15);		// sine wave, 5 Hz, 15 amplitude
s.mod("frequency", m);				// modulate the frequency of sine s with the output of m

s.fx.add( Gibberish.Delay(), Gibberish.Reverb() );  // add default delay and reverb fx
		
s.connect(Gibberish.MASTER)			// connect ugen to master output

// generate an audio callback using any ugens connected in any way to Gibberish.MASTER
Gibberish.callback = Gibberish.generateCallback();
```

##Output (with some text formatting applied)
```javascript
// initialization code that creates FUNCTIONS, not objects
Sine_1 = Gibberish.make['Sine']();
Sine_0 = Gibberish.make['Sine']();
Delay_5 = Gibberish.make['Delay']();
Reverb_6 = Gibberish.make['Reverb']();

function(globals) {
	// upvalues to push functions into registers for callback
    var Sine_0 = globals.Sine_0;	
    var Sine_1 = globals.Sine_1;
    var Delay_5 = globals.Delay_5;
    var Reverb_6 = globals.Reverb_6;

	// the callback function
    function cb() {
        var output = 0;
        
        var v_4 = Sine_1(5) * 15;
        var v_3 = (440 + v_4);
        var v_2 = Sine_0(v_3) * 0.4;
        v_2 = Delay_5( v_2, 22050, 0.5 );
        v_2 = Reverb_6( v_2 );
        output += v_2;
        
        return output;
    }
    
    return cb;
}
```

As you can see, there are no calls to any objects in the callback, just functional, JIT-optimizable goodness.

##Use the callback (with sink.js)
```javascript
var sink = Sink( function(buffer, channelCount){
    for (var i = 0; i < buffer.length; i++){
		buffer[i] = Gibberish.callback();
    }
});
```

Gibberish is built using [require.js][require]. The sample usage code runs the audio callback using [sink.js][sink]. Gibberish is licensed under the MIT license.

[gibberish]:http://www.charlie-roberts.com/gibberish
[audiolib]:https://github.com/jussi-kalliokoski/audiolib.js/
[audiolet]:https://github.com/oampo/Audiolet
[require]:http://requirejs.org/
[sink]:https://github.com/jussi-kalliokoski/sink.js/
#Gibberish

Gibberish is designed to be a fast audio API for browser based audio content. As with most web-based JavaScript audio libraries, it currently only runs in Chrome and Firefox (and beta versions of Safari).

Gibberish is different from other JavaScript audio libraries (such as [audiolib.js][audiolib] or [Audiolet][audiolet]) in that it generates code that is heavily optimized for JIT compilation. The code that is created is arguably not human-readble, hence the name _Gibberish_. Below is an example of the input code (which you write) and the audio callback that is output (which is created by Gibberish; you should never have to even look at this). The audio callback plays a sine wave with vibrato:

##Input
```javascript
var s = Gibberish.Sine(440, .4); 	// sine wave, 440 Hz, .4 amplitude
var m = Gibberish.Sine(5, 15);		// sine wave, 5 Hz, 15 amplitude
s.mod("frequency", m);				// modulate the frequency of sine s with the output of m
		
Gibberish.generate(s);				// create code to represent s (m will be dragged along)

// generate an audio callback. you can include multiple ugens in the callback.
Gibberish.callback = Gibberish.generateCallback([s]);
```

##Output (with some text formatting applied)
```javascript
// initialization code that creates FUNCTIONS, not objects
_Sine_1 = Gibberish.make['Sine']();
_Sine_4 = Gibberish.make['Sine']();

function() {
	// upvalues to push functions into registers for callback
    var Sine_1 = _Sine_1;
    var Sine_4 = _Sine_4;

	// the callback function
    function cb() {
        var output = 0;
        var v_3 = Sine_4(5) * 15;
        var v_2 = (440 + v_3);
        var v_0 = Sine_1(v_2) * 0.4;
        output += v_0;
        return output;
    }
    return cb;
}
```

As you can see, there are no calls to any objects in the callback, just functional, JIT-optimizable goodness.

##Use the callback (with sink.js)
```javascript
var sink = Sink( function(buffer, channelCount){
    for (var i=0; i<buffer.length; i++){
		buffer[i] = Gibberish.callback();
    }
});
```

Gibberish is built using [require.js][require]. The sample usage code runs the audio callback using [sink.js][sink]. Gibberish is licensed under the MIT license.

[audiolib]:https://github.com/jussi-kalliokoski/audiolib.js/
[audiolet]:https://github.com/oampo/Audiolet
[require]:http://requirejs.org/
[sink]:https://github.com/jussi-kalliokoski/sink.js/
requirejs.config({
    baseUrl: 'scripts/lib',
    paths: {}
});

requirejs(['sink/sink-light', 'gibberish', 'utils'], 
	function   (sink,   _gibberish, _) {
		window.Gibberish = _gibberish;
		Gibberish.init();
		
		var s = Gibberish.Sine(440, .4);
		
		var m = Gibberish.Sine(5, 15);
		s.mod("frequency", m);
		
		var e = Gibberish.Env(44100, 44100);
		s.mod("amp", e, "*");
		
		var c = Gibberish.Clip(50, .25);
		s.addFx(c);
		
		Gibberish.generate(s);
		Gibberish.callback = Gibberish.generateCallback([s], true);

		var sink = Sink( function(buffer, channelCount){
		    for (var i=0; i<buffer.length; i++){
				buffer[i] = Gibberish.callback();
		    }
		});
	}
);
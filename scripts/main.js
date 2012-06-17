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
		
		Gibberish.generate(s);
		Gibberish.callback = Gibberish.generateCallback([s], true);

		var sink = Sink( function(buffer, channelCount){
		    var i;
		    for (i=0; i<buffer.length; i++){
				buffer[i] = Gibberish.callback();
		    }
		});

	}
);
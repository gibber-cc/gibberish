requirejs.config({
    baseUrl: 'scripts/lib',
    paths: {}
});

requirejs(['sink/sink-light', 'gibberish', 'utils'], 
	function   (sink,   _gibberish, _) {
		window.Gibberish = _gibberish;
		Gibberish.init();
		
		s = Gibberish.Sine(440, .4);
		
		m = Gibberish.Sine(5, 15);
		s.mod("frequency", m);
		
		e = Gibberish.Env(44100, 44100);
		s.mod("amp", e, "*");
		// 
		// c = Gibberish.Clip(50, .25);
		// s.addFx(c);
		
		//t = Gibberish.Sine(300, .4);
		
		Gibberish.connectToOutput(s);
		
		Gibberish.callback = Gibberish.generateCallback( true );
		var phase = 0;
		var sink = Sink( function(buffer, channelCount){
			//console.log("CHANNEL COUNT = ", channelCount);
		    for (var i=0; i<buffer.length; i+=2){
				if(phase++ % 22100 == 0) s.frequency = Math.round(400 + Math.random() * 400);
				if(Gibberish.dirty) {
					Gibberish.callback = Gibberish.generateCallback( false ); 
				}
				buffer[i] = buffer[i+1] = Gibberish.callback();
		    }
		});
	}
);
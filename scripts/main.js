requirejs.config({
    baseUrl: 'scripts/lib',
    paths: {}
});

requirejs(['sink/sink-light', 'gibberish', 'utils'], 
	function   (sink,   _gibberish, _) {
		window.Gibberish = _gibberish;
		Gibberish.init();
		// var __ugens = [];
		// for(var i = 0; i < 60; i++) {
		// 	var s = Gibberish.Sine(400 + Math.round(Math.random() * 400), .4);
		// 	var m = Gibberish.Sine(5, 15);
		// 	s.mod("frequency", m);
		// 	Gibberish.load(s);
		// 	__ugens.push(s);
		// }
		
		s = Gibberish.Sine(440, .4);
		// 
		// // m = Gibberish.Sine(5, 15);
		// // s.mod("frequency", m);
		// 
		// e = Gibberish.Env(44100, 44100);
		// s.mod("amp", e, "*");
		// 
		// // c = Gibberish.Clip(50, .25);
		// // s.addFx(c);
		// 
		// //t = Gibberish.Sine(880, .25)
		// 
		// t = Gibberish.Sine(300, .4);
		// t.mod("amp", e, "*");
		// 
		s.connect(Gibberish.MASTER);
		
		Gibberish.callback = Gibberish.generateCallback( true );
		
		var phase = 0;
		var sink = Sink( function(buffer, channelCount){
			//console.log("CHANNEL COUNT = ", channelCount);
		    for (var i=0; i<buffer.length; i+=2){
				//if(phase++ % 100 == 0) s.frequency = Math.round(400 + Math.random() * 400);
				if(Gibberish.dirty) {
					Gibberish.callback = Gibberish.generateCallback( false ); 
				}
				buffer[i] = buffer[i+1] = Gibberish.callback();
		    }
		}, 2, 256);
	}
);
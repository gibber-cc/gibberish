requirejs.config({
    baseUrl: 'scripts/lib',
    paths: {}
});

requirejs(['sink/sink-light', 'gibberish', 'utils'], 
	function   (sink,   _gibberish) {
		window.Gibberish = _gibberish;
		Gibberish.init();
		var timeout = null;
		var codeTimeout = null;
		
		window.clear = function() {
			clearTimeout(timeout);
			clearTimeout(codeTimeout);
			
			Gibberish.ugens.remove();
			
			Gibberish.dirty = true;
		};
		
		window.sineTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.Sine(440, .25);
			s.connect(Gibberish.MASTER);
			
			var inputString = "s = Gibberish.Sine(440, .25);\n" + "s.connect(Gibberish.MASTER);";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.vibratoTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.Sine(440, .25);
			m = Gibberish.Sine(5, 15);
			
			s.mod("frequency", m);
			
			s.connect(Gibberish.MASTER);
			
			var inputString = "s = Gibberish.Sine(440, .25);\n" +
			"m = Gibberish.Sine(5, 15);\n" +
			"\n" +
			"s.mod(\"frequency\", m);\n" +
			"\n" +
			"s.connect(Gibberish.MASTER);\n";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.clipTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.Sine(440, .25);
			c = Gibberish.Clip(500, .1);
			s.fx.add( c );
			s.connect(Gibberish.MASTER);
			Gibberish.dirty = true;
			
			timeout = setInterval(function() { 
				c.amount = Math.random(Math.random() * 5000);
				s.frequency = Math.round(200 + Math.random() * 800);
			}, 250);
			
			var inputString = "s = Gibberish.Sine(440, .25);\n" +
			"c = Gibberish.Clip(500, .1);\n" +
			"s.fx.add( c );\n" +
			"s.connect(Gibberish.MASTER);\n" +
			"Gibberish.dirty = true;\n" +
			"\n\n//note : a timeout changes pitches\n" +
			"\//and randomizes clip amount";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = Gibberish.callback;
			}, 250);
			
		};
		
		window.delayTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.Sine(440, .25);
			d = Gibberish.Delay(11025, .55);
			s.fx.add( d );
			s.connect(Gibberish.MASTER);
			Gibberish.dirty = true;
			
			timeout = setInterval(function() { 
				s.frequency = Math.round(200 + Math.random() * 800);
			}, 250);
			
			var inputString = "s = Gibberish.Sine(440, .25);\n" +
			"d = Gibberish.Delay(11025, .55);\n" +
			"s.fx.add( d );\n" +
			"s.connect(Gibberish.MASTER);\n" +
			"Gibberish.dirty = true;\n" +
			"\n\n//note : a timeout changes pitches\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = Gibberish.callback;
			}, 250);
			
		};
		
		window.synthTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.Synth("Sine", .25);
			s.connect(Gibberish.MASTER);
			
			timeout = setInterval(function() { 
				s.note( Math.round(200 + Math.random() * 800) );
			}, 500);
			
			var inputString = "s = Gibberish.Synth(\"Sine\", .25);\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"\n\n//note : a timeout changes pitches\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = Gibberish.callback;
			}, 250);	
		};
		
		window.FMTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.FMSynth();
			s.connect(Gibberish.MASTER);
			
			timeout = setInterval(function() { 
				s.note( Math.round(200 + Math.random() * 800) );
			}, 500);
			
			var inputString = "s = Gibberish.FMSynth();\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"\n\n//note : a timeout changes pitches\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = Gibberish.callback;
			}, 250);
		};
		
		window.busTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			bus1 = Gibberish.Bus();
			bus2 = Gibberish.Bus();
			bus3 = Gibberish.Bus();
			
			sendBus = Gibberish.Bus();	
			
			sine1 = Gibberish.Sine(440, .25);
			sine1.connect(bus1);
			
			sine2 = Gibberish.Sine(1080, .25);
			sine2.connect(bus2);	
						
			bus1.connect(bus3); 
			bus2.connect(bus3);
			
			bus3.send(sendBus, .5); 
			sendBus.connect(Gibberish.MASTER);
			
			delay = Gibberish.Delay(11050, .75);
			sendBus.addFx(delay);
			
			timeout = setInterval(function() {
				sine1.frequency = Math.round(200 + Math.random() * 800);
				sine2.frequency = Math.round(200 + Math.random() * 800);
				//console.log("FREQUENCIES", sine1.frequency, sine2.frequency);				
			}, 500);
			
			var inputString = "bus1 = Gibberish.Bus();\n"+
			"bus2 = Gibberish.Bus();\n"+
			"bus3 = Gibberish.Bus();\n"+
			"\n"+
			"sendBus = Gibberish.Bus();	\n"+
			"\n"+
			"sine1 = Gibberish.Sine(440, .25);\n"+
			"sine1.connect(bus1);\n"+
			"\n"+
			"sine2 = Gibberish.Sine(1080, .25);\n"+
			"sine2.connect(bus2);	\n"+
			"			\n"+
			"bus1.connect(bus3); \n"+
			"bus2.connect(bus3);\n"+
			"\n"+
			"bus3.send(sendBus, .5); \n"+
			"sendBus.connect(Gibberish.MASTER);\n"+
			"\n"+
			"delay = Gibberish.Delay(11050, .75);\n"+
			"sendBus.addFx(delay);\n" +
			"\n\n//note : a timeout changes pitches\n";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = Gibberish.callback;
			}, 250);	

			Gibberish.dirty = true;
		};
		
		Gibberish.callback = Gibberish.generateCallback( false );
		codeTimeout = setTimeout(function() { 
			var codegen = document.getElementById("output");
			codegen.innerHTML = Gibberish.callback;
		}, 250);
		
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
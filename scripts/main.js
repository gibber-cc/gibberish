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
		
		window._clear_ = function() {
			clearTimeout(timeout);
			clearTimeout(codeTimeout);
			
			Gibberish.ugens.remove();
			
			Gibberish.dirty = true;
			
			var input = document.getElementById("input");
			input.innerHTML = "";
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
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
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
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
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
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
			"\n//note : a timeout changes pitches\n" +
			"//and randomizes clip amount";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
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
			"\n//note : a timeout changes pitches\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
		};
		
		window.allPassTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			sine = Gibberish.Sine(440, .25);
			sine.fx.add( Gibberish.AllPass() );
			sine.connect(Gibberish.MASTER);
			
			var inputString = "sine = Gibberish.Sine(440, .25);\n"+
			"sine.fx.add( Gibberish.AllPass() );\n"+
			"sine.connect(Gibberish.MASTER);\n";
			
			timeout = setInterval(function() {
				sine.frequency = Math.round(200 + Math.random() * 800);
			}, 500);
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		window.reverbTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			sine = Gibberish.Synth();
			sine.env.attack = 2000;
			sine.fx.add( Gibberish.Reverb(), Gibberish.Reverb() );
			sine.connect(Gibberish.MASTER);
			
			var inputString = "sine = Gibberish.Synth(440, .25);\n"+
			"sine.fx.add( Gibberish.Reverb(), Gibberish.Reverb() );\n"+
			"sine.connect(Gibberish.MASTER);\n";
			
			var i = 0;
			var frequencies = [440, 660, 880, 1100, 1320, 1760];
			timeout = setInterval(function() {
				var pos = Math.floor( Math.random() * frequencies.length );
				sine.note(Math.round(frequencies[pos]));
			}, 250);
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.stressTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			synths = [];
			NUM_SYNTHS = 65;
			reverb = Gibberish.Bus();
			reverb.fx.add(Gibberish.Reverb());
			
			for(var i = 0; i < NUM_SYNTHS; i++) {
				synths[i] = Gibberish.FMSynth(.5 + Math.random(), Math.random * 10, .05, 11025, 11025);
				synths[i].connect(reverb);
			}
			
			reverb.connect( Gibberish.MASTER );
			
			timeout = setInterval(function() {
				for(var i = 0; i < NUM_SYNTHS; i++) {
					if(Math.random() > .5)
						synths[i].note(200 + Math.round( Math.random() * 4000));
				}
			}, 1000);
			
			var inputString = "synths = [];\n"+
			"NUM_SYNTHS = 65;\n"+
			"reverb = Gibberish.Bus();\n"+
			"reverb.fx.add(Gibberish.Reverb());\n"+
			"\n"+
			"for(var i = 0; i < NUM_SYNTHS; i++) {\n"+
			"	synths[i] = Gibberish.FMSynth(.5 + Math.random(), Math.random * 10, .05, 11025, 11025);\n"+
			"	synths[i].connect(reverb);\n"+
			"}\n"+
			"\n"+
			"reverb.connect( Gibberish.MASTER );\n"+
			"\n"+
			"timeout = setInterval(function() {\n"+
			"	for(var i = 0; i < NUM_SYNTHS; i++) {\n"+
			"		if(Math.random() > .5)\n"+
			"			synths[i].note(200 + Math.round( Math.random() * 4000));\n"+
			"	}\n"+
			"}, 1000);\n\n"+
			"// 65 FMSynths + a reverb takes 75% of my two year old computer.";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.combTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			sine = Gibberish.Sine(440, .25);
			sine.fx.add( Gibberish.Comb() );
			sine.connect(Gibberish.MASTER);
			
			var inputString = "sine = Gibberish.Sine(440, .25);\n"+
			"sine.fx.add( Gibberish.Comb() );\n"+
			"sine.connect(Gibberish.MASTER);\n";
			
			timeout = setInterval(function() {
				sine.frequency = Math.round(200 + Math.random() * 800);
			}, 500);
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		
		
		window.synthTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.Synth("Sine", .25);
			s.connect(Gibberish.MASTER);
			
			timeout = setInterval(function() { 
				s.note( Math.round(200 + Math.random() * 800) );
			}, 1000);
			
			var inputString = "s = Gibberish.Synth(\"Sine\", .25);\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"\n\n//note : a timeout changes pitches\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
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
			"\n//note : a timeout changes pitches";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
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
			sendBus.fx.add(delay);
			
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
			"sendBus.fx.add(delay);\n" +
			"\n//note : a timeout changes pitches\n";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);	

			Gibberish.dirty = true;
		};
		
		window.busFeedbackTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			bus1 = Gibberish.Bus();
			bus2 = Gibberish.Bus();
			
			singleSampleDelay = Gibber.Delay(1,0);
			sine1 = Gibberish.Sine(440, .2);
			sine1.connect(bus1);
			bus1.connect(bus2);
			bus2.connect(bus1);
			bus2.connect(Gibberish.MASTER);
			
			var inputString = "bus1 = Gibberish.Bus();\n"+
			"bus2 = Gibberish.Bus();\n"+
			"\n"+
			"sine1 = Gibberish.Sine(440, .2);\n"+
			"sine1.connect(bus1);\n"+
			"bus1.connect(bus2);\n"+
			"bus2.connect(bus1);\n"+
			"bus2.connect(Gibberish.MASTER);\n\n" +
			"// this creates a stack overflow failure. damnit.";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
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
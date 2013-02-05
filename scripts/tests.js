window.routingTest = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  
  bus1 = new Gibberish.Bus2().connect();
  
  fm  = new Gibberish.FMSynth();
  fm.connect( bus1 );
  fm.connect( Gibberish.out );
  
  filter = new Gibberish.Filter24( bus1 ).connect();
  
  ssd = new Gibberish.SingleSampleDelay( filter );
  ssd.connect(bus1);
  
  ssd2 = new Gibberish.SingleSampleDelay( Gibberish.out );
  ssd2.connect( bus1 );
  
  bus2 = new Gibberish.Bus2({ amp:.5 });
  filter.connect( bus2 );
  
  distortion = new Gibberish.Distortion( bus2 ).connect();
  
  timeout = setInterval(function() { 
    fm.note(100 + Math.random() * 200);
  }, 2000);
  
	var inputString = "/* testing a complex routing with two feedback loops and multiple busses\n"+
  "          v-------------------------------------<\n"+
  "          v--------------------<                |\n"+
  "          |                    |                |\n"+
  "synth -> bus1 -> filter -> ssd-^                |\n"+
  "  |       |         |                           |\n"+
  "  ------------------------------> *OUT* -> ssd -^\n"+
  "                    |          ^  \n"+
  "                    |          |\n"+
  "                    > bus2 -> distortion\n*/\n"+
  "bus1 = new Gibberish.Bus2().connect();\n"+
  "\n"+
  "fm  = new Gibberish.FMSynth();\n"+
  "fm.connect( bus1 );\n"+
  "fm.connect( Gibberish.out );\n"+
  "\n"+
  "filter = new Gibberish.Filter24( bus1 ).connect();\n"+
  "\n"+
  "ssd = new Gibberish.SingleSampleDelay( filter );\n"+
  "ssd.connect(bus1);\n"+
  "\n"+
  "ssd2 = new Gibberish.SingleSampleDelay( Gibberish.out );\n"+
  "ssd2.connect( bus1 );\n"+
  "\n"+
  "bus2 = new Gibberish.Bus2({ amp:.5 });\n"+
  "filter.connect( bus2 );\n"+
  "\n"+
  "distortion = new Gibberish.Distortion( bus2 ).connect();\n"+
  "\n"+
  "timeout = setInterval(function() { \n"+
  "  fm.note(100 + Math.random() * 200);\n"+
  "}, 2000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.vibratoTest = function() {
  Gibberish.clear();
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  
  a = new Gibberish.Sine(991, .5);
  b = new Gibberish.Sine(4, 0);
  c = new Gibberish.Sine(.1, 50);
  
  b.mod('amp', c, "+");
  b.mod('amp', 50, "+");

  a.mod('frequency', b,  "+");

  a.connect( Gibberish.out ); 
    
	var inputString = "// vibrato that changes depth over time \n"+
  "a = new Gibberish.Sine(991, .5);\n"+
  "b = new Gibberish.Sine(4, 0);\n"+
  "c = new Gibberish.Sine(.1, 50);\n"+
  "\n"+
  "b.mod('amp', c, '+');\n"+
  "b.mod('amp', 50, '+');\n"+
  "\n"+
  "a.mod('frequency', b, '+');\n"+
  "\n"+
  "a.connect( Gibberish.out );\n"+
  "\n";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.lineTest = function() {
  Gibberish.clear();
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  
  a = new Gibberish.Sine(991, .5);
  b = new Gibberish.Line(0, 1, 88200, true);

  a.mod('amp', b,  "=");

  a.connect( Gibberish.out ); 
    
	var inputString = "// ramping amplitude and looping the ramp\n"+
  "a = new Gibberish.Sine(991, .5);\n"+
  "b = new Gibberish.Line(0, 1, 88200, true);\n"+
  "\n"+
  "a.mod('amp', b,  '=');\n"+
  "\n"+
  "a.connect( Gibberish.out ); \n";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.twoOscsOneMod = function() {
  Gibberish.clear();
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  
  a = new Gibberish.Sine(440, .5);
  b = new Gibberish.Sine(880, 0);
  c = new Gibberish.Sine(4, 20);
  
  a.mod('frequency', c, "+");
  b.mod('frequency', c, "+");

  a.connect( Gibberish.out ); 
  b.connect( Gibberish.out );   
    
	var inputString = "// a simple test to ensure that one moulation source affecting two\n"+
  "// oscillators is only codegenerated once and run once per sample.\n"+
  "a = new Gibberish.Sine(440, .5);\n"+
  "b = new Gibberish.Sine(880, 0);\n"+
  "c = new Gibberish.Sine(4, 20);\n"+
  "\n"+
  "a.mod('frequency', c, '+');\n"+
  "b.mod('frequency', c, '+'');\n"+
  "\n"+
  "a.connect( Gibberish.out ); \n"+
  "b.connect( Gibberish.out );\n";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.ADSRTest = function() {
  Gibberish.clear();
  
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  
  a = new Gibberish.Sine(440, .5);
  b = new Gibberish.ADSR(22050, 22050, 88200, 22050, 1, .75);
  a.mod('amp', b, '*');
  
  a.connect( Gibberish.out );
  
  timeout = setInterval(function() { 
    b.run();
  }, 4000);
  
	var inputString = "a = new Gibberish.Sine(440, .5);\n"+
  "b = new Gibberish.ADSR(22050, 22050, 88200, 22050, 1, .75);\n"+
  "a.mod('amp', b, '*');\n"+
  "\n"+
  "a.connect( Gibberish.out );\n"+
  "\n"+
  "timeout = setInterval(function() { \n"+
  "  b.run();\n"+
  "}, 4000);\n";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.distortion = function() {
  Gibberish.clear();
  
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  
  a = new Gibberish.Sine(440, .5);
  b = new Gibberish.Distortion(100);
  b.input = a;
    
  b.connect( Gibberish.out );
  
  timeout = setInterval(function() { 
    a.frequency = Math.round(200 + Math.random() * 800);
  }, 250);
  
	var inputString = "// waveshaping test\n"+
  "a = new Gibberish.Sine(440, .5);\n"+
  "b = new Gibberish.Distortion(100);\n"+
  "b.input = a\n"+
  "\n"+
  "b.connect( Gibberish.out );\n"+
  "\n"+
	"timeout = setInterval(function() { \n"+
	"  a.frequency = Math.round(200 + Math.random() * 800);\n"+
	"}, 250);\n";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.delay = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
			
	a = new Gibberish.FMSynth();
	b = new Gibberish.Delay(a).connect( Gibberish.out );
  
	timeout = setInterval(function() { 
		a.note( Math.round(200 + Math.random() * 800) );
	}, 1000);
			
	var inputString = "a = new Gibberish.FMSynth();\n"+
	"b = new Gibberish.Delay(a).connect( Gibberish.out );\n"+
  "\n"+
	"timeout = setInterval(function() { \n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"}, 1000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.reverb = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
			
	a = new Gibberish.KarplusStrong();
	b = new Gibberish.Reverb(a).connect();
  
	timeout = setInterval(function() { 
		a.note( Math.round(200 + Math.random() * 800) );
	}, 1000);
			
	var inputString = "a = new Gibberish.KarplusStrong();\n"+
	"b = new Gibberish.Reverb(a).connect();\n"+
  "\n"+
	"timeout = setInterval(function() { \n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"}, 1000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.flanger = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
			
	a = new Gibberish.FMSynth();
	b = new Gibberish.Flanger({input:a, feedback:.5}).connect();
  
	timeout = setInterval(function() { 
		a.note( Math.round(200 + Math.random() * 800) );
	}, 1000);
			
	var inputString = "a = new Gibberish.FMSynth();\n"+
	"b = new Gibberish.Flanger({input:a, feedback:.5}).connect();\n"+
  "\n"+
	"timeout = setInterval(function() { \n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"}, 1000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.vibrato = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
			
	s = new Gibberish.KarplusStrong();
  a = new Gibberish.Vibrato( s ).connect();
			
	timeout = setInterval(function() { 
		s.note( Math.round(150 + Math.random() * 500) );
	}, 1000);
			
	var inputString = "s = new Gibberish.KarplusStrong();\n"+
  "a = new Gibberish.Vibrato( s ).connect();\n"+
	"timeout = setInterval(function() {\n"+
	"  s.note( Math.round(200 + Math.random() * 800) );\n"+
	"}, 1000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.decimator = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
			
	a = new Gibberish.FMSynth();
	b = new Gibberish.Decimator(a, 2, .2).connect( Gibberish.out );
  
	timeout = setInterval(function() { 
		a.note( Math.round(200 + Math.random() * 800) );
	}, 1000);
			
	var inputString = "a = new Gibberish.FMSynth();\n"+
	"b = new Gibberish.Decimator(a, 2, .2).connect( Gibberish.out );\n"+
  "\n"+
	"timeout = setInterval(function() { \n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"}, 1000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.ringModulation = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  Gibberish.clear();
  
  a = new Gibberish.Saw3();
  b = new Gibberish.RingModulation({input:a, frequency:1016, amp:1, mix:1});
  
  b.mod('frequency', new Gibberish.Sine(.05, 500), '+')  
  
  b.connect( Gibberish.out );
  
	var inputString = "// ring modulation test\n"+
  "a = new Gibberish.Saw3();\n"+
  "b = new Gibberish.RingModulation({input:a, frequency:1016, amp:1, mix:1});\n"+
  "\n"+
  "b.mod('frequency', new Gibberish.Sine(.05, 500), '+');";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.ladderFilter = function() {
  Gibberish.clear();
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  
  a = new Gibberish.FMSynth();
  b = new Gibberish.Filter24(.2, 4);
  b.input = a;
    
  b.connect( Gibberish.out );
  
  timeout = setInterval(function() { 
    a.note(440);
    b.cutoff = Math.random() * .5;
  }, 1000);
  
	var inputString = "// testing a 24db filter on a fmsynth\n"+
  "a = new Gibberish.FMSynth();\n"+
  "b = new Gibberish.Filter24(.2, 4);\n"+
  "b.input = a;\n"+
  "  \n"+
  "b.connect( Gibberish.out );\n"+
  "\n"+
  "timeout = setInterval(function() { \n"+
  " a.note(440);\n"+
  " b.cutoff = Math.random() * .5;\n"+
  "}, 1000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.stateVariableFilter = function() {
  Gibberish.clear();
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  
  a = new Gibberish.FMSynth();
  b = new Gibberish.SVF({input:a, cutoff:440, Q:4}).connect();
  
  timeout = setInterval(function() { 
    a.note(440);
    b.cutoff = 110 + Math.random() * 1500;
  }, 1000);
  
	var inputString = "// testing a SVF filter on a fmsynth\n"+
  "a = new Gibberish.FMSynth();\n"+
  "b = new Gibberish.SVF({input:a, cutoff:440, Q:4}).connect();\n"+
  "\n"+
  "b.connect( Gibberish.out );\n"+
  "\n"+
  "timeout = setInterval(function() { \n"+
  "  a.note(440);\n"+
  "  b.cutoff = 110 + Math.random() * 1500;\n"+
  "}, 1000);";


	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.FMTest = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
			
	s = new Gibberish.FMSynth();
	s.connect( Gibberish.out );
			
	timeout = setInterval(function() { 
		s.note( Math.round(200 + Math.random() * 800) );
	}, 1000);
			
	var inputString = "s = new Gibberish.FMSynth();\n"+
	"s.connect( Gibberish.out );\n"+
	"timeout = setInterval(function() {\n"+
	"  s.note( Math.round(200 + Math.random() * 800) );\n"+
	"}, 1000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.polyFM = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
			
	s = new Gibberish.PolyFM({ attack:20 });
	s.connect( Gibberish.out );
			
	timeout = setInterval(function() { 
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );            
	}, 1000);
			
	var inputString = "s = new Gibberish.PolyFM({ attack:20 });\n"+
	"s.connect( Gibberish.out );\n"+
	"\n"+
	"timeout = setInterval(function() { \n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"}, 1000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.synth = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
	
  waves = ["Saw3", "PWM", "Sine"];		
	s = new Gibberish.Synth();
	s.connect( Gibberish.out );
			
	timeout = setInterval(function() { 
		s.note( Math.round(200 + Math.random() * 800) );
    s.waveform = waves[Math.round(Math.random() * 2)];
	}, 1000);
			
	var inputString = "waves = ['Saw3', 'PWM', 'Sine'];\n"+		
	"s = new Gibberish.Synth();\n"+
	"s.connect( Gibberish.out );\n"+
	"		\n"+
	"timeout = setInterval(function() { \n"+
	"  s.note( Math.round(200 + Math.random() * 800) );\n"+
  "  s.waveform = waves[Math.round(Math.random() * 2)];\n"+
	"}, 1000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.synth2 = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
	
	s = new Gibberish.Synth2().connect();
			
	timeout = setInterval(function() { 
		s.note( Math.round(200 + Math.random() * 800) );
    s.cutoff = Gibberish.rndf(.3, .8);
	}, 1000);
			
	var inputString = "// oscillator with envelope and a filter\n"+		
	"s = new Gibberish.Synth2().connect();\n"+
	"		\n"+
	"timeout = setInterval(function() { \n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
  "  s.cutoff = Gibberish.rndf(.3, .8);\n"+
	"}, 1000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.monoSynth = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
	
	s = new Gibberish.MonoSynth({
	  attack: 20,
    resonance: 4,
    cutoff:.2
	}).connect();
			
	timeout = setInterval(function() { 
		s.note( Math.round(150 + Math.random() * 300) );
    //s.cutoff = Gibberish.rndf(.1, .5);
	}, 500);
			
	var inputString = "// monosynth... three oscillators + filter + envelope\n"+		
	"s = new Gibberish.MonoSynth({\n"+
	"  attack: 20,\n"+
  "  resonance: 4,\n"+
  "  cutoff:.2\n"+
	"}).connect();\n"+
	"\n"+
	"timeout = setInterval(function() { \n"+
	" s.note( Math.round(150 + Math.random() * 300) );\n"+
  " s.cutoff = Gibberish.rndf(.1, .5);\n"+
	"}, 500);";
	

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.polySynth = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
  	
	s = new Gibberish.PolySynth({ attack:20, decay:88200 });
	s.connect( Gibberish.out );
	
  s.mod('pulsewidth', new Gibberish.Sine(.1, .45), '+');
  		
	timeout = setInterval(function() { 
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );            
	}, 1000);
			
	var inputString = "// a test of the polysynth with pulsewidth modulation applied\n"+
  "s = new Gibberish.PolySynth({ attack:20, decay:88200 });\n"+
	"s.connect( Gibberish.out );\n"+
	"\n"+
  "s.mod('pulsewidth', new Gibberish.Sine(.1, .45), '+');\n"+
  "		\n"+
	"timeout = setInterval(function() { \n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"}, 1000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.karplusStrong = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
			
	s = new Gibberish.KarplusStrong().connect();
			
	timeout = setInterval(function() { 
		s.note( Math.round(200 + Math.random() * 800) );
	}, 1000);
			
	var inputString = "s = new Gibberish.KarplusStrong.connect();\n"+
	"timeout = setInterval(function() {\n"+
	"  s.note( Math.round(200 + Math.random() * 800) );\n"+
	"}, 1000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.polyKarplusStrong = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
  	
	s = new Gibberish.PolyKarplusStrong().connect();
	  		
	timeout = setInterval(function() { 
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );            
	}, 1000);
			
	var inputString = "// a test of the polyphonic karplus strong\n"+
  "s = new Gibberish.PolyKarplusStrong().connect();\n"+
  "		\n"+
	"timeout = setInterval(function() { \n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"}, 1000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.bufferShuffler = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
  	
	s = new Gibberish.PolyKarplusStrong();
  a = new Gibberish.BufferShuffler(s).connect();
	  		
	timeout = setInterval(function() { 
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );
		s.note( Math.round(200 + Math.random() * 800) );            
	}, 1000);
			
	var inputString = "// buffer shuffling applied to plucked string chords\n"+
  "s = new Gibberish.PolyKarplusStrong()\n"+
  "\n"+
  "a = new Gibberish.BufferShuffler(s).connect();\n\n"+
	"timeout = setInterval(function() { \n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"	s.note( Math.round(200 + Math.random() * 800) );\n"+
	"}, 1000);";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.sampler = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
			
	a = new Gibberish.Sampler('resources/snare.wav').connect();
			
	timeout = setInterval(function() { 
		a.note( Gibberish.rndf(-3, 3) );
	}, 250);
			
	var inputString = "// the note method for the sampler object\n"+
  "// defines speed of playback; negative values play in reverse\n"+
  "a = new Gibberish.Sampler('resources/snare.wav').connect();\n"+
	"\n"+
	"timeout = setInterval(function() { \n"+
	"	a.note( Gibberish.rndf(-3, 3) );\n"+
  "}, 250);\n"+
	"a = new Gibberish.Sampler('resources/snare.wav').connect();";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.feedbackTest = function() {
  Gibberish.clear();
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  
  a = new Gibberish.Sine(440, 1);
  b = new Gibberish.SingleSampleDelay( a, 10 );
  
  c = new Gibberish.Sine(440, 1);
  
  a.mod('frequency', c, "+");
  c.mod('frequency', b, "+");
  //a.mod('frequency', 380, "*");  
  
  a.connect( Gibberish.out );
  
	var inputString = "// a short feedback loop to test codegen engine\n"+
  "a = new Gibberish.Sine(440, 1);\n"+
  "b = new Gibberish.Sine(880, 1);\n"+
  "c = new Gibberish.SingleSampleDelay( b );\n"+
  "d = new Gibberish.SingleSampleDelay( a );\n"+
  "\n"+
  "a.mod('frequency', c,  '+');\n"+
  "a.mod('frequency', 500, '*');  \n"+
  "b.mod('frequency', d,  '+');\n"+
  "b.mod('frequency', 50, '*');  \n"+
  "\n"+
  "a.connect( Gibberish.out );\n"+
  "b.connect( Gibberish.out );";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.bandLimitedPWM = function() {
  Gibberish.clear();
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  
  a = new Gibberish.PWM();
  b = new Gibberish.Sine(.1, .49);
  
  a.mod('pulsewidth', b, "+");

  a.connect( Gibberish.out ); 
    
	var inputString = "// a bandlimited PWM oscillator built using FM feedback\n"+
  "a = new Gibberish.PWM();\n"+
  "b = new Gibberish.Sine(.1, .49);\n"+
  "\n"+
  "a.mod('pulsewidth', b, '+');\n"+
  "\n"+
  "a.connect( Gibberish.out );";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.granulator = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
	Gibberish.clear();
			
	a = new Gibberish.Sampler('resources/trumpet.wav');
  
  // wait until sample is loaded to create granulator
  a.onload = function() {
    b = new Gibberish.Granulator({ 
      buffer:a.getBuffer(),
      grainSize:1000,
      speedMin: -2,
      speedMax: 2,
    });
    
    b.mod('position', new Gibberish.Sine(.1, .45), '+');
    
    b.connect();
  };
  
	var inputString = "// granulating a trumpet sample\n"+
	"a = new Gibberish.Sampler('resources/trumpet.wav');\n"+
  "\n"+
  "// wait until sample is loaded to create granulator\n"+
  "a.onload = function() {\n"+
  "  b = new Gibberish.Granulator({ \n"+
  "    buffer:a.getBuffer(),\n"+
  "    grainSize:1000,\n"+
  "    speedMin: -2,\n"+
  "    speedMax: 2,\n"+
  "  });\n"+
  "\n"+
  "  b.mod('position', new Gibberish.Sine(.1, .45), '+');\n"+
  "  b.connect();\n"+
  "};";
  
	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.clear = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  
	var input = document.getElementById("input");
	input.innerHTML = "";
  
  Gibberish.clear();
  
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);
};

window.biquadFilter = function() {
  Gibberish.clear();
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  
  a = new Gibberish.FMSynth();
  b = new Gibberish.Biquad(a, 'LP', 240, .5);
    
  b.connect( Gibberish.out );
  
  timeout = setInterval(function() { 
    a.note(440);
    b.cutoff = 110 + Math.random() * 1500;
    b.calculateCoefficients();
  }, 1000);
  
	var inputString = "// testing a biquad filter on a fmsynth. biquad coefficients must be reset manually.\n"+
  "a = new Gibberish.FMSynth();\n"+
  "b = new Gibberish.Biquad(a, 'LP', 440, 2);\n"+
  " \n"+
  "b.connect( Gibberish.out );\n"+
  "\n"+
  "timeout = setInterval(function() { \n"+
  "  a.note(440);\n"+
  "  b.cutoff = 110 + Math.random() * 1500;\n"+
  "  b.calculateCoefficients();\n"+  
  "}, 1000);";


	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);

}

window.sequencer = function() {
  Gibberish.clear();
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  
  a = new Gibberish.FMSynth().connect();
  
  b = new Gibberish.Sequencer({
    target:a, key:'note',
    values:[880,660,440,220],
    rate:[22050, 11025, 44100],
  }).start();
  
	var inputString = "// sequencers provide sample accurate timing.\n"+
  "// here we sequence calls to the note method of our target synth option.\n"+
  "// rate determines how quickly the sequencer advances, in samples.\n"+
  "a = new Gibberish.FMSynth().connect();\n"+
  "\n"+
  "b = new Gibberish.Sequencer({\n"+
  "  target:a, key:'note',\n"+
  "  values:[880,660,440,220],\n"+
  "  rate:[22050, 11025, 44100],\n"+
  "}).start();\n";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callbackString;
	}, 250);

}
Gibberish.Binops.export();
Gibberish.Time.export();

window.soundfont = function() {
  Gibberish.clear();
  
  choir = new Gibberish.SoundFont( 'choir_aahs' ).connect();
  
  choir.onload = function() {
    console.log('LOADED, STARTING SEQ')
    seq = new Gibberish.Sequencer({
      values:[ function() {
        choir.note('F4'); choir.note('Ab4'); choir.note('C5');
      } ],
      durations:[ seconds(4) ],
    }).start()
  }
  
  var inputString = [
  "/*",
  "* Gibberish uses the FluidSynth soundfont, as wrapped ",
  "* for use with MIDI.js:",
  "* https://github.com/gleitz/midi-js-soundfonts",
  "*",
  "* For a list of sounds, try:",
  "* https://en.wikipedia.org/wiki/General_MIDI",
  "*/",
  "",
  "choir = new Gibberish.SoundFont( 'choir_aahs' ).connect();",
  "",
  "choir.onload = function() {",
  "  seq = new Gibberish.Sequencer({",
  "    values:[ function() {",
  "      choir.note('F4');",
  "      choir.note('Ab4');",
  "      choir.note('C5');",
  "    } ],",
  "    durations:[ seconds(4) ],",
  "  }).start()",
  "}",
  ].join('\n')
  
	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
}

window.routingTest = function() {
  Gibberish.clear();
  
  bus1 = new Gibberish.Bus2().connect();
  
  fm  = new Gibberish.FMSynth();
  fm.connect( bus1 );
  fm.connect( Gibberish.out );
  
  filter = new Gibberish.Filter24( bus1 ).connect();
  
  ssd = new Gibberish.SingleSampleDelay( filter, .1 );
  ssd.connect(bus1);
  
  ssd2 = new Gibberish.SingleSampleDelay( Gibberish.out, .1 );
  ssd2.connect( bus1 );
  
  bus2 = new Gibberish.Bus2({ amp:.5 });
  filter.connect( bus2 );
  
  distortion = new Gibberish.Distortion( bus2 ).connect();
  
  b = new Gibberish.Sequencer({
    target:fm, key:'note',
    values:[ function() { return 100 + Math.random() * 200; } ],
    durations:[ seconds(.5) ],
  }).start();
  
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
  "b = new Gibberish.Sequencer({\n"+
  "  target:fm, key:'note',\n"+
  "  values:[ function() { return 100 + Math.random() * 200; } ],\n"+
  "  durations:[ seconds(.5) ],\n"+
  "}).start();";
  
	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.wavetable = function() {
  Gibberish.clear();
  
  a = new Gibberish.Table();
  
  var t = []
  for( var i = 0; i < 1024; i++ ) { t[ i ] = Gibberish.rndf(-1,1) }

  a.setTable( t )
  a.connect()
  
  b = new Gibberish.Sequencer({
    target:a, key:'frequency',
    values:[ Gibberish.Rndf(200, 2000) ],
    durations:[ seconds(.5) ],
  }).start()
  
  var inputString = [
    "a = new Gibberish.Table();",
    "",
    "var t = []",
    "for( var i = 0; i < 1024; i++ ) { t[ i ] = Gibberish.rndf(-1,1) }",
    "",
    "a.setTable( t )",
    "a.connect()",
    "",
    "b = new Gibberish.Sequencer({",
    "  target:a, key:'frequency',",
    "  values:[ Gibberish.Rndf(200, 2000) ],",
    "  durations:[ seconds(.5) ],",
    "}).start() "
  ].join('\n')
  
	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
}

window.vibratoTest = function() {
  Gibberish.clear();
  
  mod1 = new Gibberish.Sine(4, 0);
  mod2 = new Gibberish.Sine(.1, 50);  
  mod1.amp = mod2;
  
  sin = new Gibberish.Sine( Add(mod1, 440), .25 ).connect();
    
	var inputString = "// vibrato that changes depth over time \n\n"+
  "mod1 = new Gibberish.Sine(4, 0)\n"+
  "mod2 = new Gibberish.Sine(.1, 50); \n"+
  "mod1.amp = mod2\n"+
  "\n"+
  "sin = new Gibberish.Sine( Add(mod1, 440), .25 ).connect()\n";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.lineTest = function() {
  Gibberish.clear();
  
  line = new Gibberish.Line(0, 1, seconds(2), true);
  a = new Gibberish.Sine(991, line).connect();
    
	var inputString = "// ramping amplitude and looping the ramp\n\n"+
  "line = new Gibberish.Line(0, 1, 88200, true);\n"+
  "a = new Gibberish.Sine(991, line).connect();\n";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.input = function() {
  Gibberish.clear();
  
  a = new Gibberish.Input();
  b = new Gibberish.Delay( a ).connect();
    
	var inputString = "// read mic input and run through delay\n\n"+
  'a = new Gibberish.Input();\n'+
  'b = new Gibberish.Delay( a ).connect();';
  

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
}

window.twoOscsOneMod = function() {
  Gibberish.clear();
  
  mod = new Gibberish.Sine(4, 20);
  a = new Gibberish.Sine( Add(440, mod), .5).connect();
  b = new Gibberish.Sine( Add(880, mod), .25).connect();
    
	var inputString = "// a simple test to ensure that one modulation source affecting two\n"+
  "// ugens is memoized and only run once per sample.\n\n"+
  "mod = new Gibberish.Sine(4, 20);\n"+
  "a = new Gibberish.Sine( Add(440, mod), .5).connect();\n"+
  "b = new Gibberish.Sine( Add(880, mod), .25).connect();\n";
 
	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.ADSRTest = function() {
  Gibberish.clear();
  
  adsr = new Gibberish.ADSR(seconds(.5), seconds(.5), seconds(2), seconds(.5), 1, .35);
  
  a = new Gibberish.Sine( 440, Mul(.5, adsr) ).connect();
    
  b = new Gibberish.Sequencer({
    target:adsr, key:'run',
    durations:[ seconds(4) ],
  }).start();
  
	var inputString = "// test of ADSR envelope.\n\n"+
  "adsr = new Gibberish.ADSR(22050, 22050, 88200, 22050, 1, .35);\n"+
  "\n"+
  "a = new Gibberish.Sine( 440, Mul(.5, adsr) ).connect();\n"+
  "\n"+
  "b = new Gibberish.Sequencer({\n"+
  "  target:adsr, key:'run',\n"+
  "  durations:[ seconds(4) ],\n"+
  "}).start();\n";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.ADSRTest2 = function() {
  Gibberish.clear();
  
  a = new Gibberish.PolyFM({ useADSR:true, requireReleaseTrigger:true }).connect()
  a.note(440)
  a.note(660)
  a.note(770)
  a.note(990)
  a.note(1100)
  
  Gibberish.future( function() { a.note(440) }, seconds(3) )
  Gibberish.future( function() { a.note(660) }, seconds(4) )
  Gibberish.future( function() { a.note(770) }, seconds(5) )
  Gibberish.future( function() { a.note(990) }, seconds(6) )
  Gibberish.future( function() { a.note(1100) }, seconds(7) )  
  
	var inputString = "// test of ADSR envelope in PolyFM. Send a note message\n// with the same frequency to release.\n"+
  "// if requireReleaseTrigger is false (default) \n// the release portion will trigger automatically.\n\n"+
  "a = new Gibberish.PolyFM({ useADSR:true, requireReleaseTrigger:true }).connect()\n"+
  "a.note(440)\n"+
  "a.note(660)\n"+
  "a.note(770)\n"+
  "a.note(990)\n"+
  "a.note(1100)\n"+
  "\n"+
  "Gibberish.future( function() { a.note(440) }, seconds(3) )\n"+
  "Gibberish.future( function() { a.note(660) }, seconds(4) )\n"+
  "Gibberish.future( function() { a.note(770) }, seconds(5) )\n"+
  "Gibberish.future( function() { a.note(990) }, seconds(6) )\n"+
  "Gibberish.future( function() { a.note(1100) }, seconds(7) )";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.distortion = function() {
  Gibberish.clear();
  
  a = new Gibberish.Sine(440, .5);
  b = new Gibberish.Distortion(a, 100).connect();
  
  sequencer = new Gibberish.Sequencer({
    target:a, key:'frequency',
    values:[ Gibberish.Rndf(200, 1000) ],
    durations: [ 11025 ],
  }).start();
  
	var inputString = "// waveshaping test\n"+
  "a = new Gibberish.Sine(440, .5);\n"+
  "b = new Gibberish.Distortion(a, 100).connect();\n"+
  "\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  target:a, key:'frequency',\n"+
  "  values:[ Gibberish.Rndf(200, 1000) ],\n"+
  "  durations:[ 11025 ],\n"+
  "}).start();";


	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.delay = function() {
  if(typeof sequencer !== 'undefined') sequencer.disconnect();
  Gibberish.clear();
			
	a = new Gibberish.FMSynth();
	b = new Gibberish.Delay(a).connect( Gibberish.out );
  
  sequencer = new Gibberish.Sequencer({
    target:a, key:'note',
    values:[ Gibberish.Rndf(200, 1000) ],
    durations:[ seconds(1) ],
  }).start();
			
	var inputString = "a = new Gibberish.FMSynth();\n"+
	"b = new Gibberish.Delay(a).connect( Gibberish.out );\n"+
  "\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  target:a, key:'note',\n"+
  "  values:[ Gibberish.Rndf(200, 1000) ],\n"+
  "  durations:[ seconds(1) ],\n"+
  "}).start();";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.reverb = function() {
  Gibberish.clear();
			
	a = new Gibberish.KarplusStrong();
	b = new Gibberish.Reverb(a).connect();
  
  b.roomSize = Add(.85, new Gibberish.Sine(.01, .15) )
  
  sequencer = new Gibberish.Sequencer({
    target:a, key:'note',
    values:[ Gibberish.Rndf(200, 1000) ],
    durations:[ seconds(1) ],
  }).start();

	var inputString = "// gradually change roomSize over time...\n"+
  "a = new Gibberish.KarplusStrong();\n"+
	"b = new Gibberish.Reverb(a).connect();\n"+
  "\n"+
  "b.roomSize = Add(.85, new Gibberish.Sine(.01, .15) )\n"+
  "\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  target:a, key:'note',\n"+
  "  values:[ Gibberish.Rndf(200, 1000) ],\n"+
  "  durations:[ seconds(1) ],\n"+
  "}).start();";


	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.flanger = function() {
  Gibberish.clear();
			
	a = new Gibberish.FMSynth();
	b = new Gibberish.Flanger({input:a, feedback:.5}).connect();
  
  sequencer = new Gibberish.Sequencer({
    target:a, key:'note',
    values:[ Gibberish.Rndf(200, 1000) ],
    durations:[ seconds(1) ],
  }).start();
	
	var inputString = "a = new Gibberish.FMSynth();\n"+
	"b = new Gibberish.Flanger({input:a, feedback:.5}).connect();\n"+
  "\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  target:a, key:'note',\n"+
  "  values:[ Gibberish.Rndf(200, 1000) ],\n"+
  "  durations:[ seconds(1) ],\n"+
  "}).start();";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.vibrato = function() {
  Gibberish.clear();
			
	s = new Gibberish.KarplusStrong();
  a = new Gibberish.Vibrato( s ).connect();
			
  sequencer = new Gibberish.Sequencer({
    target:s, key:'note',
    values:[ Gibberish.Rndf(150, 650)],
    durations:[ 44100 ],
  }).start();

	var inputString = "s = new Gibberish.KarplusStrong();\n"+
  "a = new Gibberish.Vibrato( s ).connect();\n\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  target:s, key:'note',\n"+
  "  values:[ Gibberish.Rndf(150, 650)],\n"+
  "  durations:[ 44100 ],\n"+
  "}).start();";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.decimator = function() {
  Gibberish.clear();
			
	a = new Gibberish.FMSynth();
	b = new Gibberish.Decimator(a, 2, .2).connect( Gibberish.out );
  
  sequencer = new Gibberish.Sequencer({
    target:a, key:'note',
    values:[ Gibberish.Rndf(200, 1000) ],
    durations:[ 44100 ],
  }).start();
			
	var inputString = "a = new Gibberish.FMSynth();\n"+
	"b = new Gibberish.Decimator(a, 2, .2).connect( Gibberish.out );\n"+
  "\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  target:a, key:'note',\n"+
  "  values:[ Gibberish.Rndf(200, 1000) ],\n"+
  "  durations:[44100],\n"+
  "}).start();";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.ringModulation = function() {
  Gibberish.clear();
  
  a = new Gibberish.Saw3()
  b = new Gibberish.RingModulation({
    input:a, 
    frequency: Add( 1016, new Gibberish.Sine(.05, 500) ),
    amp:1,
    mix:1
  }).connect()

	var inputString = "// ring modulation test\n\n"+
  "a = new Gibberish.Saw3()\n\n"+
  "b = new Gibberish.RingModulation({\n"+
  "  input:a, \n"+
  "  frequency: Add( 1016, new Gibberish.Sine(.05, 500) ),\n"+
  "  amp:1,\n"+
  "  mix:1\n"+
  "}).connect()\n";
  
	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.ladderFilter = function() {
  Gibberish.clear();
  
  a = new Gibberish.FMSynth();
  b = new Gibberish.Filter24({ input:a, cutoff:.2, resonance:4 }).connect();
  
  sequencer = new Gibberish.Sequencer({
    values:[ 
      function() { 
        a.note(440);
        b.cutoff = Math.random() * .5;
      }
    ],
    durations:[44100],
  }).start();
  
	var inputString = "// testing a 24db filter on a fmsynth\n"+
  "a = new Gibberish.FMSynth();\n"+
  "b = new Gibberish.Filter24({ input:a, cutoff:.2, resonance:4 }).connect();\n"+
  "\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  values:[ \n"+
  "    function() { \n"+
  "      a.note(440);\n"+
  "      b.cutoff = Math.random() * .5;\n"+
  "    }\n"+
  "  ],\n"+
  "  durations:[44100],\n"+
  "}).start();\n";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.stateVariableFilter = function() {
  if(typeof sequencer !== 'undefined') sequencer.disconnect();
  Gibberish.clear();
  
  a = new Gibberish.FMSynth();
  b = new Gibberish.SVF({input:a, cutoff:440, Q:4}).connect();
  
  sequencer = new Gibberish.Sequencer({
    values:[ 
      function() { 
        a.note(440);
        b.cutoff = Gibberish.rndf(150, 1000);
      }
    ],
    durations:[44100],
  }).start();
  
	var inputString = "// testing a SVF filter on a fmsynth\n"+
  "a = new Gibberish.FMSynth();\n"+
  "b = new Gibberish.SVF({input:a, cutoff:440, Q:4}).connect();\n"+
  "\n"+
  "b.connect( Gibberish.out );\n"+
  "\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  values:[ \n"+
  "    function() { \n"+
  "      a.note(440);\n"+
  "      b.cutoff = Gibberish.rndf(150, 1000);\n"+
  "    }\n"+
  "  ],\n"+
  "  durations:[44100],\n"+
  "}).start();";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.FMTest = function() {
  Gibberish.clear();
			
	s = new Gibberish.FMSynth().connect();
	
  sequencer = new Gibberish.Sequencer({
    target:s, key:'note',
    values:[ Gibberish.Rndf(200, 1000) ],
    durations:[44100],
  }).start();
			
	var inputString = "s = new Gibberish.FMSynth().connect();\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  target:s, key:'note',\n"+
  "  values:[ Gibberish.Rndf(200, 1000) ],\n"+
  "  durations:[44100],\n"+
  "}).start();";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.polyFM = function() {
  Gibberish.clear();
  			
	s = new Gibberish.PolyFM({ attack:20 }).connect();
	s.index = Add(20, new Gibberish.Sine(.1, 20))
  
  sequencer = new Gibberish.Sequencer({
    values:[ function() {
  		s.note( Gibberish.rndf(200, 1000) );
  		s.note( Gibberish.rndf(200, 1000) );
  		s.note( Gibberish.rndf(200, 1000) );
  		s.note( Gibberish.rndf(200, 1000) );
  		s.note( Gibberish.rndf(200, 1000) ); 
    } ],
    durations:[ seconds(1) ],
  }).start();
			
	var inputString = "s = new Gibberish.PolyFM({ attack:20 }).connect();\n"+
  "s.index = Add(20, new Gibberish.Sine(.1, 20));\n\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  values:[ function() {\n"+
  "		s.note( Gibberish.rndf(200, 1000) );\n"+
  "		s.note( Gibberish.rndf(200, 1000) );\n"+
  "		s.note( Gibberish.rndf(200, 1000) );\n"+
  "		s.note( Gibberish.rndf(200, 1000) );\n"+
  "		s.note( Gibberish.rndf(200, 1000) ); \n"+
  "  } ],\n"+
  "  durations:[ seconds(1) ],\n"+
  "}).start();";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.synth = function() {
  Gibberish.clear();

  waves = ["Saw3", "PWM", "Sine"];		
	s = new Gibberish.Synth().connect();
	
  sequencer = new Gibberish.Sequencer({
    target:s,
    keysAndValues: {
      note: [ Gibberish.Rndf(200, 1000) ],
      waveform : [ function() { return waves[ Gibberish.rndi( 0, 2 ) ]; } ],
    },
    durations:[ ms(1000) ],
  }).start();
			
	var inputString = "waves = ['Saw3', 'PWM', 'Sine'];\n"+		
	"s = new Gibberish.Synth().connect();\n"+
	"		\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  target:s,\n"+
  "  keysAndValues: {\n"+
  "    note: [ Gibberish.Rndf(200, 1000) ],\n"+
  "    waveform : [ function() { return waves[ Gibberish.rndi( 0, 2 ) ]; } ],\n"+
  "  },\n"+
  "  durations:[ ms(1000) ],\n"+
  "}).start();\n";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.synth2 = function() {
  Gibberish.clear();
	
	s = new Gibberish.Synth2().connect();
	
  sequencer = new Gibberish.Sequencer({
    target:s,
    keysAndValues:{
      note:   [ Gibberish.Rndf(200, 800) ],
      cutoff: [ Gibberish.Rndf(.3, .6) ],
    },
    durations:[ ms(1000) ],
  }).start();

	var inputString = "// oscillator with envelope and a filter\n"+		
	"s = new Gibberish.Synth2().connect();\n"+
	"		\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  target:s,\n"+
  "  keysAndValues:{\n"+
  "    note:   [ Gibberish.Rndf(200, 800) ],\n"+
  "    cutoff: [ Gibberish.Rndf(.3, .6) ],\n"+
  "  }\n"+
  "  durations:[ ms(1000) ],\n"+
  "}).start();";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.monoSynth = function() {
  if(typeof sequencer !== 'undefined') sequencer.disconnect();
  Gibberish.clear();

	s = new Gibberish.MonoSynth({
	  attack: 20,
    resonance: 4,
    cutoff:.2
	}).connect();
	
  sequencer = new Gibberish.Sequencer({
    target:s, key:'note',
    values: [ Gibberish.Rndf(150, 300) ],
    durations:[ 22050 ],
  }).start();
			
	var inputString = "// monosynth... three oscillators + filter + envelope\n"+		
	"s = new Gibberish.MonoSynth({\n"+
	"  attack: 20,\n"+
  "  resonance: 4,\n"+
  "  cutoff:.2\n"+
	"}).connect();\n"+
	"\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  target:s, key:'note',\n"+
  "  values: [ Gibberish.Rndf(150, 300) ],\n"+
  "  durations:[ 22050 ],\n"+
  "}).start();\n";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.polySynth = function() {
  Gibberish.clear();
  	
	s = new Gibberish.PolySynth({ 
    attack: 20,
    decay: ms(2000),
    pulsewidth: Add( .5, new Gibberish.Sine(.1, .45) ),
  }).connect();
	  
  sequencer = new Gibberish.Sequencer({
    values: [ 
      function() {
    		s.note( Gibberish.rndf(200, 1000) );
    		s.note( Gibberish.rndf(200, 1000) );
    		s.note( Gibberish.rndf(200, 1000) );
    		s.note( Gibberish.rndf(200, 1000) );
    		s.note( Gibberish.rndf(200, 1000) ); 
      }
    ],
    durations:[ ms(1000) ],
  }).start();
			
	var inputString = "// a test of the polysynth with pulsewidth modulation applied\n"+
	"s = new Gibberish.PolySynth({ \n"+
  "  attack: 20,\n"+
  "  decay: ms(2000),\n"+
  "  pulsewidth: Add( .5, new Gibberish.Sine(.1, .45) ),\n"+
  "}).connect();\n"+
  "\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  values: [ \n"+
  "    function() {\n"+
  "  		s.note( Gibberish.rndf(200, 1000) );\n"+
  "  		s.note( Gibberish.rndf(200, 1000) );\n"+
  "  		s.note( Gibberish.rndf(200, 1000) );\n"+
  "  		s.note( Gibberish.rndf(200, 1000) );\n"+
  "  		s.note( Gibberish.rndf(200, 1000) ); \n"+
  "    }\n"+
  "  ],\n"+
  "  durations:[ seconds(1000) ],\n"+
  "}).start();";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.karplusStrong = function() {
  Gibberish.clear();

	s = new Gibberish.KarplusStrong().connect();
	
  sequencer = new Gibberish.Sequencer({
    target:s, key:'note', 
    values:[ Gibberish.Rndf(200, 1000) ],
    durations:[ ms(1000) ],
  }).start();
			
	var inputString = "s = new Gibberish.KarplusStrong.connect();\n\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  target:s, key:'note', \n"+
  "  values:[ Gibberish.Rndf(200, 1000) ],\n"+
  "  durations:[ ms(1000) ],\n"+
  "}).start();";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.polyKarplusStrong = function() {
  if(typeof sequencer !== 'undefined') sequencer.disconnect();
  Gibberish.clear();
  	
	s = new Gibberish.PolyKarplusStrong().connect();
	  		
  sequencer = new Gibberish.Sequencer({
    values: [ 
      function() {
    		s.note( Gibberish.rndf(200, 1000) );
    		s.note( Gibberish.rndf(200, 1000) );
    		s.note( Gibberish.rndf(200, 1000) );
    		s.note( Gibberish.rndf(200, 1000) );
    		s.note( Gibberish.rndf(200, 1000) ); 
      }
    ],
    durations:[ ms(1000) ],
  }).start();
			
	var inputString = "// a test of the polyphonic karplus strong\n"+
  "s = new Gibberish.PolyKarplusStrong().connect();\n"+
  "		\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  values: [ \n"+
  "    function() {\n"+
  "  		s.note( Gibberish.rndf(200, 1000) );\n"+
  "  		s.note( Gibberish.rndf(200, 1000) );\n"+
  "  		s.note( Gibberish.rndf(200, 1000) );\n"+
  "  		s.note( Gibberish.rndf(200, 1000) );\n"+
  "  		s.note( Gibberish.rndf(200, 1000) ); \n"+
  "    }\n"+
  "  ],\n"+
  "  durations:[ ms(1000) ],\n"+
  "}).start();";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.bufferShuffler = function() {
  Gibberish.clear();
  	
	s = new Gibberish.PolyKarplusStrong();
  a = new Gibberish.BufferShuffler(s).connect();
	  		
  sequencer = new Gibberish.Sequencer({
    values: [ 
      function() {
    		s.note( Math.round(200 + Math.random() * 800) );
    		s.note( Math.round(200 + Math.random() * 800) );
    		s.note( Math.round(200 + Math.random() * 800) );
    		s.note( Math.round(200 + Math.random() * 800) );
    		s.note( Math.round(200 + Math.random() * 800) ); 
      }
    ],
    durations:[ ms(1000) ],
  }).start();
			
	var inputString = "// buffer shuffling applied to plucked string chords\n"+
  "s = new Gibberish.PolyKarplusStrong()\n"+
  "\n"+
  "a = new Gibberish.BufferShuffler(s).connect();\n\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  values: [ \n"+
  "    function() {\n"+
  "  		s.note( Math.round(200 + Math.random() * 800) );\n"+
  "  		s.note( Math.round(200 + Math.random() * 800) );\n"+
  "  		s.note( Math.round(200 + Math.random() * 800) );\n"+
  "  		s.note( Math.round(200 + Math.random() * 800) );\n"+
  "  		s.note( Math.round(200 + Math.random() * 800) ); \n"+
  "    }\n"+
  "  ],\n"+
  "  durations:[ ms(1000) ],\n"+
  "}).start();";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};
window.sampler = function() {
  Gibberish.clear();

	a = new Gibberish.Sampler('resources/snare.wav').connect();
	
  sequencer = new Gibberish.Sequencer({
    target:a, key:'note',
    values:[ Gibberish.Rndf(-3, 3) ],
    durations:[ ms(250) ],
  }).start();
			
	var inputString = "// the note method for the sampler object\n"+
  "// defines speed of playback; negative values play in reverse\n"+
  "a = new Gibberish.Sampler('resources/snare.wav').connect();\n"+
	"\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  target:a, key:'note',\n"+
  "  values:[ Gibberish.Rndf(-3, 3) ],\n"+
  "  durations:[ ms(250) ]\n"+
  "}).start();";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
}

window['time_modulation(Reich)'] = function() {
  Gibberish.clear();

	a = new Gibberish.Synth({ waveform:'Sine', attack:340, decay:5512, pan:-.5, amp:.25 }).connect();
	b = new Gibberish.Synth({ waveform:'Sine', attack:340, decay:5512, pan:.5, amp:.25  }).connect();  

  sequencer_a = new Gibberish.Sequencer2({
    target:a, key:'note',
    values:[ 660 ],
    durations:[ ms(350) ],
  }).start();

  sequencer_b = new Gibberish.Sequencer2({
    target:b, key:'note',
    values:[ 440 ],
    durations:[ ms(350) ],
    rate: Add( 1, new Gibberish.Sine(.001, .1))
  }).start();
  			
	var inputString = "// two sequencers, one with rate modulation, that\n"+
  "// gradually go in and out of phase with each other. The Sequencer2 object\n"+
  "// allows audio rate modulation of sequencer speed.\n"+
  "\n"+  
	"a = new Gibberish.Synth({ attack:44, decay:5512, pan:-.75 }).connect()\n"+
	"b = new Gibberish.Synth({ attack:44, decay:5512, pan:.75  }).connect(); \n"+
  "\n"+
  "sequencer_a = new Gibberish.Sequencer2(\n"+
  "  target:a, key:'note'\n"+
  "  values:[ 660 ]\n"+
  "  durations:[ ms(250) ]\n"+
  "}).start()\n"+
  "\n"+
  "sequencer_b = new Gibberish.Sequencer2(\n"+
  "  target:b, key:'note'\n"+
  "  values:[ 440 ]\n"+
  "  durations:[ ms(250) ]\n"+
  "  rate: Add( 1, new Gibberish.Sine(.001, .1) )\n"+
  "}).start()"

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.feedbackTest = function() {
  Gibberish.clear();
  
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
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.bandLimitedPWM = function() {
  Gibberish.clear();
  
  a = new Gibberish.PWM({ pulsewidth: Add( .5, new Gibberish.Sine(.1, .49) ) }).connect();
    
	var inputString = "// a bandlimited PWM oscillator built using FM feedback\n\n"+
  "a = new Gibberish.PWM({ \n"+
  "  pulsewidth: Add( .5, new Gibberish.Sine(.1, .49) ) \n"+
  "}).connect();\n";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.granulator = function() {
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
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.clear = function() {
  if(typeof timeout !== 'undefined') clearTimeout(timeout);
  
	var input = document.getElementById("input");
	input.innerHTML = "";
  
  Gibberish.clear();
  
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
};

window.biquadFilter = function() {
  Gibberish.clear();
  
  a = new Gibberish.FMSynth();
  b = new Gibberish.Biquad(a, 'LP', 240, .5).connect();
  
  sequencer = new Gibberish.Sequencer({
    values:[
      function() {
        a.note(440);
        b.cutoff = 110 + Math.random() * 1500;
        b.calculateCoefficients();
      }
    ],
    durations:[ ms(1000) ],
  }).start();
  
	var inputString = "// testing a biquad filter on a fmsynth. biquad coefficients must be reset manually.\n"+
  "a = new Gibberish.FMSynth();\n"+
  "b = new Gibberish.Biquad(a, 'LP', 240, .5).connect();\n"+
  "\n"+
  "sequencer = new Gibberish.Sequencer({\n"+
  "  values:[\n"+
  "    function() {\n"+
  "      a.note(440);\n"+
  "      b.cutoff = 110 + Math.random() * 1500;\n"+
  "      b.calculateCoefficients();\n"+
  "    }\n"+
  "  ],\n"+
  "  durations:[ ms(1000) ],\n"+
  "}).start();\n";
  
	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);

}

window.sequencerTest = function() {
  if(typeof sequencer !== 'undefined') sequencer.disconnect();
  Gibberish.clear();
  
  a = new Gibberish.FMSynth().connect();
  
  b = new Gibberish.Sequencer({
    target:a, key:'note',
    values:[880,660,440,220],
    durations:[ms(500), ms(250), ms(1000)],
  }).start();
  
	var inputString = "// sequencers provide sample accurate timing.\n"+
  "// here we sequence calls to the note method of our target synth option.\n"+
  "// durations determines how quickly the sequencer advances, in samples.\n"+
  "a = new Gibberish.FMSynth().connect();\n"+
  "\n"+
  "b = new Gibberish.Sequencer({\n"+
  "  target:a, key:'note',\n"+
  "  values:[880,660,440,220],\n"+
  "  durations:[ ms(500), ms(250), ms(1000) ],\n"+
  "}).start();\n";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);

}

window.tr808_emulation = function() {
  Gibberish.clear();
  
  a = new Gibberish.Kick({ decay:.2 }).connect()
  b = new Gibberish.Sequencer({
    target:a, key:'note',
    durations:[ beats( 1 ) ]
  }).start()
  
  Gibberish.future( function() {
    c = new Gibberish.Snare({ snappy: 1.5 }).connect()
    d = new Gibberish.Sequencer({
      target:c, key:'note',
      values:[Gibberish.Rndf(-.05,.05)],
      durations:[ beats( 2 ) ]
    }).start()
  }, 22050);
  
  e = new Gibberish.Hat({ amp: 1.5 }).connect()
  f = new Gibberish.Sequencer({
    target:e, key:'note',
    values:[ function() { return Math.random() > .8 ? 15000 : 5000 } ],
    durations:[ beats( .25 ) ]
  }).start()
  
  g = new Gibberish.Conga({ amp:.5, pitch:200 })
  i = new Gibberish.Reverb({ input:g, wet:.2 }).connect()
  
  var pitches = [200,230,260]
  var chosenDur = 0;
  var durations = [ beats(.25), beats(.5), beats(.5), beats(1), beats(2)];
  var sixteenth = beats(.25)()
  
  l = new Gibberish.Sequencer({
    values:[ function() { 
      g.note( pitches[ Gibberish.rndi(0,2) ], Gibberish.rndf(.25,.6) )
    }],
    durations:[ function() {
      if(chosenDur === sixteenth ) {
        chosenDur = sixteenth + 1
      }else{
        chosenDur = durations[ Gibberish.rndi(0,4) ]();
      } 
      return chosenDur; 
    } ],
  }).start()
  
  m = new Gibberish.Cowbell({ amp:.5 })
  n = new Gibberish.Delay({ input: m, feedback:.9, time:beats(.25) })
  nn = new Gibberish.Filter24({ input:n, isLowPass:false }).connect()
  nn.cutoff = Add(.4, new Gibberish.Sine(.2, .125))  
  
  o = new Gibberish.Sequencer({
    target:m, key:'note',
    durations:[beats(16)],
  }).start()
  
	var inputString = "// test for kick / snare / hat / conga roland tr-808 emulation\n"+
  "a = new Gibberish.Kick({ decay:.2 }).connect()\n"+
  "b = new Gibberish.Sequencer({\n"+
  "  target:a, key:'note',\n"+
  "  durations:[ beats( 1 ) ]\n"+
  "}).start()\n"+
  "\n"+
  "Gibberish.future( function() {\n"+
  "  c = new Gibberish.Snare({ snappy: 1.5 }).connect()\n"+
  "  d = new Gibberish.Sequencer({\n"+
  "    target:c, key:'note',\n"+
  "    values:[Gibberish.Rndf(-.05,.05)],\n"+
  "    durations:[ beats( 2 ) ]\n"+
  "  }).start()\n"+
  "}, 22050);\n"+
  "\n"+
  "e = new Gibberish.Hat({ amp: 1.5 }).connect()\n"+
  "f = new Gibberish.Sequencer({\n"+
  "  target:e, key:'note',\n"+
  "  values:[ function() { return Math.random() > .8 ? 15000 : 5000 } ],\n"+
  "  durations:[ beats( .25 ) ]\n"+
  "}).start()\n"+
  "\n"+
  "g = new Gibberish.Conga({ amp:.5, pitch:200 })\n"+
  "i = new Gibberish.Reverb({ input:g, wet:.2 }).connect()\n"+
  "\n"+
  "var pitches = [200,230,260]\n"+
  "var chosenDur = 0;\n"+
  "var durations = [ beats(.25), beats(.5), beats(.5), beats(1), beats(2)];\n"+
  "var sixteenth = beats(.25)()\n"+
  "\n"+
  "l = new Gibberish.Sequencer({\n"+
  "  values:[ function() { \n"+
  "    g.note( pitches[ Gibberish.rndi(0,2) ], Gibberish.rndf(.25,.6) )\n"+
  "  }],\n"+
  "  durations:[ function() {\n"+
  "    if(chosenDur === sixteenth ) {\n"+
  "      chosenDur = sixteenth + 1\n"+
  "    }else{\n"+
  "      chosenDur = durations[ Gibberish.rndi(0,4) ]();\n"+
  "    } \n"+
  "    return chosenDur; \n"+
  "  } ],\n"+
  "}).start()\n"+
  "\n"+
  "m = new Gibberish.Cowbell({ amp:.5 })\n"+
  "n = new Gibberish.Delay({ input: m, feedback:.9, time:beats(.25) })\n"+
  "nn = new Gibberish.Filter24({ input:n, isLowPass:false }).connect()\n"+
  "nn.cutoff = Add(.4, new Gibberish.Sine(.2, .125))  \n"+
  "\n"+
  "o = new Gibberish.Sequencer({\n"+
  "  target:m, key:'note',\n"+
  "  durations:[beats(16)],\n"+
  "}).start()";

	var input = document.getElementById("input");
	input.innerHTML = inputString;
			
	codeTimeout = setTimeout(function() { 
		var codegen = document.getElementById("output");
		codegen.innerHTML = Gibberish.callback.toString();
	}, 250);
}

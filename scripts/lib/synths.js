define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Synth = gibberish.createGenerator(["frequency", "amp", "attack", "decay"], "{0}( {1}, {2}, {3}, {4} )");
			gibberish.make["Synth"] = this.makeSynth;
			gibberish.Synth = this.Synth;
			
			gibberish.generators.FMSynth = gibberish.createGenerator(["frequency", "cmRatio", "index", "attack", "decay", "amp"], "{0}( {1}, {2}, {3}, {4}, {5} ) * {6}");
			gibberish.make["FMSynth"] = this.makeFMSynth;
			gibberish.FMSynth = this.FMSynth;
			
			gibberish.generators.Synth2 = gibberish.createGenerator(["amp", "attack", "decay", "sustain", "release", "attackLevel", "sustainLevel", "cutoff", "resonance", "filterMult", "isLowPass"], "{0}( {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10}, {11} )");
			gibberish.make["Synth2"] = this.makeSynth2;
			gibberish.Synth2 = this.Synth2;
			
			gibberish.generators.PolySynth = gibberish.createGenerator(["amp", "attack", "decay", "sustain", "release", "attackLevel", "sustainLevel", "cutoff", "resonance", "filterMult", "isLowPass"], "{0}( {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, {10}, {11})");
			gibberish.make["PolySynth"] = this.makePolySynth;
			gibberish.PolySynth = this.PolySynth;
		},
		
		Synth : function(waveform, amp, attack, decay) {
			var that = { 
				type:		"Synth",
				category:	"Gen",
				waveform:	waveform || "Sine",
				amp:		amp || .5,				
				attack:		attack || 22050,
				decay:		decay  || 22050,
				frequency:	440,
				
				note : function(_frequency) {
					this.frequency = _frequency;
					if(this.env.getState() >= 1) this.env.setState(0);
				},
			};
			
			Gibberish.extend(that, Gibberish.ugen);
			
			that.env = Gibberish.make["Env"](that.attack, that.decay);
			that.osc = Gibberish.make[that.waveform](that.frequency, that.amp);
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Synth\"]();");	
			window[that.name] = Gibberish.make["Synth"](that.osc, that.env); // only passs ugen functions to make
			
			Gibberish.defineProperties( that, ["frequency", "amp", "attack", "decay"] );
				
		    Object.defineProperty(that, "waveform", {
				get: function() { return waveform; },
				set: function(value) {
					if(waveform !== value) {
						waveform = value;
						that.osc = Gibberish.make[value]();
						that.dirty = true;
						Gibberish.dirty = true;
					}
				},
			});
			
			return that;
		},
		
		makeSynth: function(osc, env) { // note, storing the increment value DOES NOT make this faster!
			var phase = 0;
			var output = function(frequency, amp, attack, decay ) {
				var val = osc(frequency, amp) * env(attack, decay);
				//if(phase++ % 22050 === 0) console.log(val, amp);
				return val;
			}
			return output;
		},
		
		FMSynth : function(cmRatio, index, amp, attack, decay) {
			var that = { 
				type:		"FMSynth",
				category:	"Gen",
				amp:		amp || .5,
				cmRatio:	cmRatio || (1 / .5),
				index:		index || 5,			
				attack:		attack || 22050,
				decay:		decay  || 22050,
				frequency:	440,
				
				note : function(frequency) {
					this.frequency = frequency;
					this.env.setState(0);
				},
			};
			Gibberish.extend(that, Gibberish.ugen);
			
			that.env = Gibberish.make["Env"]();
			that.carrier = Gibberish.make["Sine"]();
			that.modulator = Gibberish.make["Sine"]();
						
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"FMSynth\"]();");
			window[that.name] = Gibberish.make["FMSynth"](that.carrier, that.modulator, that.env);
						
			Gibberish.defineProperties( that, ["amp", "attack", "decay", "cmRatio", "index", "frequency"] );
			
			return that;
		},
		
		makeFMSynth: function(_carrier, _modulator, _env) { // note, storing the increment value DOES NOT make this faster!	
			var carrier = _carrier;
			var modulator = _modulator;
			var envelope = _env;
			var phase = 0;
			var output = function(frequency, cmRatio, index, attack, decay) {

				var env = envelope(attack, decay);
				var mod = modulator(frequency * cmRatio, frequency * index);// * env;
				//if(phase++ % 22050 === 0) console.log("MOD AMOUNT", mod, cmRatio, index, frequency);
				return carrier( frequency + mod, 1 ) * env; 
			}
	
			return output;
		},
		// Synth2 : function(waveform, amp, attack, decay, sustain, release, attackLevel, sustainLevel, cutoff, resonance, filterMult, isLowPass) {
		
		Synth2 : function(properties) {
			var that = { 
				type:			"Synth2",
				category:		"Gen",
				waveform:		"Triangle",
				amp:			.5,
				attack:			10000,
				decay:			10000,
				release:		10000,
				sustain: 		null,
				attackLevel:  	1,
				sustainLevel: 	.5,
				cutoff:			.1,
				resonance:		2.5,
				filterMult:		.3,
				isLowPass:		true,
				frequency:		440,
				
				note : function(_frequency) {
					this.frequency = _frequency;
					this._function.setFrequency(_frequency);
					if(this.env.getState() >= 1) this.env.setState(0);
				},
			};
			
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			Gibberish.extend(that, Gibberish.ugen);
			
			that.env = Gibberish.make["ADSR"](that.attack, that.decay, that.sustain, that.release, that.attackLevel, that.sustainLevel);
			that.osc = Gibberish.make[that.waveform](that.frequency, that.amp);
			that.filter = Gibberish.make["Filter24"](that.cutoff, that.resonance, that.isLowPass);
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Synth2\"]();");	
			that._function = Gibberish.make["Synth2"](that.osc, that.env, that.filter); // only passs ugen functions to make
			window[that.name] = that._function;
			
			Gibberish.defineProperties( that, ["frequency", "amp", "attack","decay","sustain","release","attackLevel","sustainLevel","cutoff","resonance","filterMult", "waveform"] );
				
			var waveform = that.waveform;
		    Object.defineProperty(that, "waveform", {
				get: function() { return waveform; },
				set: function(value) {
					if(waveform !== value) {
						waveform = value;
						that.osc = Gibberish.make[value]();
						that.dirty = true;
						Gibberish.dirty = true;
					}
				},
			});
			
			return that;
		},
		
		makeSynth2: function(osc, env, filter) { // note, storing the increment value DOES NOT make this faster!
			var phase = 0;
			var frequency = 0;
			// 					  amp, attack, decay, sustain, release, attackLevel, sustainLevel, cutoff, resonance, filterMult, isLowPass)
			var output = function(amp, attack, decay, sustain, release, attackLevel, sustainLevel, cutoff, resonance, filterMult, isLowPass) {
				var envResult = env(attack, decay, sustain, release, attackLevel, sustainLevel);
				var val = filter( osc(frequency, amp), cutoff + filterMult * envResult, resonance, isLowPass) * envResult;
				//var val = osc(frequency,amp) * envResult;
				//if(phase++ % 22050 === 0) console.log("SYNTH 2", val, amp, frequency, envResult);
				return val;
			};
			output.setFrequency = function(freq) {
				frequency = freq;
			};
			output.getFrequency = function() { return frequency; }
			
			return output;
		},
		// waveform, amp, attack, decay, sustain, release, attackLevel, sustainLevel, cutoff, resonance, filterMult, isLowPass
		PolySynth : function(properties) {
			var that = {
				type:			"PolySynth",
				category:		"Gen",
				waveform:		"Triangle",
				amp:			.25,				
				attack:			10000,
				decay:			10000,
				release:		10000,
				sustain: 		null,
				attackLevel:  	1,
				sustainLevel: 	.5,
				cutoff:			.1,
				resonance:		2.5,
				filterMult:		 .3,
				isLowPass:		true,
				maxVoices:		5,
				voiceCount:		0,
				
				note : function(_frequency) {
					//this.frequency = _frequency;
					//console.log("frequency", _frequency);
					//console.log("LENGTH", this.synths.length, this.voiceCount);
					var synth = this.synths[this.voiceCount++];
					//console.log("SYNTH", this.voiceCount, synth, this);					
					if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
					

					synth.note(_frequency);
				//	if(synth.env.getState() >= 1) synth.env.setState(0);
				},
			};
			
			if(typeof properties !== "undefined") {
				Gibberish.extend(that, properties);
			}
			Gibberish.extend(that, Gibberish.ugen);
			
			that.synths = [];
			that.synthFunctions = [];
			for(var i = 0; i < that.maxVoices; i++) {
				var props = {};
				Gibberish.extend(props, that);
				delete props.note; // we don't want to copy the poly note function obviously
				delete props.type;
				delete props.synths;
				delete props.synthFunctions;
				
				props.type = "Synth2";
				
				var synth = this.Synth2(props);
				//console.log(synth.note);
				that.synths.push(synth);
				//console.log(that);
				that.synthFunctions.push(synth._function);
			}
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"PolySynth\"]();");	
			window[that.name] = Gibberish.make["PolySynth"](that.synthFunctions); // only passs ugen functions to make
			
			Gibberish.defineProperties( that, ["frequency", "amp", "attack","decay","sustain","release","attackLevel","sustainLevel","cutoff","resonance","filterMult", "waveform"] );
			
			var waveform = that.waveform;
		    Object.defineProperty(that, "waveform", {
				get: function() { return waveform; },
				set: function(value) {
					if(waveform !== value) {
						waveform = value;
						that.osc = Gibberish.make[value]();
						that.dirty = true;
						Gibberish.dirty = true;
					}
				},
			});
			
			return that;
		},
		
		makePolySynth: function(_synths) {
			var phase = 0;
			var output = function(amp, attack, decay, sustain, release, attackLevel, sustainLevel, cutoff, resonance, filterMult, isLowPass) {
				var out = 0;
				var synths = _synths;
				var numSynths = synths.length;
				for(var i = 0; i < numSynths; i++) {
					var synth = synths[i];
					out += synth(amp, attack, decay, sustain, release, attackLevel, sustainLevel, cutoff, resonance, filterMult, isLowPass);
				}
				//if(phase++ % 22050 === 0) console.log(out, numSynths, amp);
				return out;
			}
			return output;
		},
		
    }
});
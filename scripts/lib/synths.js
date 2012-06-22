define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Synth = gibberish.createGenerator(["frequency", "amp", "attack", "decay"], "{0}( {1}, {2}, {3}, {4} )");
			gibberish.make["Synth"] = this.makeSynth;
			gibberish.Synth = this.Synth;
			
			gibberish.generators.FMSynth = gibberish.createGenerator(["frequency", "cmRatio", "index", "attack", "decay", "amp"], "{0}( {1}, {2}, {3}, {4}, {5} ) * {6}");
			gibberish.make["FMSynth"] = this.makeFMSynth;
			gibberish.FMSynth = this.FMSynth;	
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
		
    }
});
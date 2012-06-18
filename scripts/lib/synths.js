define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Synth = gibberish.createGenerator(["osc", "env", "amp"], "{0}( {1}, {2} ) * {3}");
			gibberish.make["Synth"] = this.makeSynth;
			gibberish.Synth = this.Synth;
			
			gibberish.generators.FMSynth = gibberish.createGenerator(["carrier", "env", "amp"], "{0}( {1}, {2} ) * {3}");
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
				
				note : function(frequency) {
					this.osc.frequency = frequency;
					this.dirty = true;
					this.env.start();
				},
			};
			Gibberish.extend(that, Gibberish.ugen);
			
			that.env = Gibberish.Env(that.attack, that.decay);
			that.osc = Gibberish[that.waveform](440, that.amp);
			
			that.name = Gibberish.generateSymbol(that.type);
			window[that.name] = Gibberish.make["Synth"]();
			Gibberish.defineProperties( that, ["frequency", "amp", "attack", "decay"] );
				
		    Object.defineProperty(that, "waveform", {
				get: function() { return waveform; },
				set: function(value) {
					if(waveform !== value) {
						waveform = value;
						that.osc = Gibberish[value](that.osc.frequency, that.amp);
						that.dirty = true;
						Gibberish.dirty = true;
					}
				},
			});
			
			return that;
		},
		
		makeSynth: function() { // note, storing the increment value DOES NOT make this faster!	
			var output = function(oscillator, envelope) {
				return oscillator * envelope;
			}
	
			return output;
		},
		
		FMSynth : function(cmRatio, index, amp, attack, decay) {
			var that = { 
				type:		"FMSynth",
				category:	"Gen",
				amp:		amp || .5,
				cmRatio:	cmRatio || 1 / .5,
				index:		index || 5,			
				attack:		attack || 22050,
				decay:		decay  || 22050,
				frequency:	440,
				
				note : function(frequency) {
					this.frequency = frequency;
					this.carrier.frequency = this.frequency;
					this.modulator.frequency = this.frequency * this.cmRatio;
					this.modulator.amp = frequency * this.index;
					this.dirty = true;
					this.env.start();
				},
			};
			Gibberish.extend(that, Gibberish.ugen);
			
			that.env = Gibberish.Env(that.attack, that.decay);
			that.carrier = Gibberish["Sine"](that.frequency, that.amp);
			that.modulator = Gibberish["Sine"](that.frequency * that.cmRatio, that.index * 440);
			
			that.carrier.mod("frequency", that.modulator, "+");
			
			that.name = Gibberish.generateSymbol(that.type);
			window[that.name] = Gibberish.make["FMSynth"]();
			//Gibberish.defineProperties( that, ["attack", "decay"] );
			
		    Object.defineProperties(that, {
				cmRatio :  {
					get: function() { return cmRatio; },
					set: function(value) {
						cmRatio = value;
						console.log(that.frequency, value, that.modulator.amp);
						that.modulator.frequency = that.frequency * cmRatio;
						console.log(that.modulator.frequency);
						that.modulator.dirty = true;
						that.dirty = true;
					},
				},
				index :  {
					get: function() { return index; },
					set: function(value) {
						index = value;
						that.modulator.amp = that.frequency * index;
						that.dirty = true;
					},
				},
			});
			
			return that;
		},
		
		makeFMSynth: function() { // note, storing the increment value DOES NOT make this faster!	
			var output = function(oscillator, envelope) {
				return oscillator * envelope;
			}
	
			return output;
		},
		
    }
});
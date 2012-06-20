define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Synth = gibberish.createGenerator(["frequency", "attack", "decay", "amp"], "{0}( {1}, {2}, {3} ) * {4}");
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
				frequency:	440,
				
				note : function(_frequency) {
					this.frequency = _frequency;
					this.dirty = true;
					Gibberish.dirty = true;
					if(this.env.getState() >= 1) this.env.setState(0);
				},
			};
			Gibberish.extend(that, Gibberish.ugen);
			
			that.env = Gibberish.make["Env"](that.attack, that.decay);
			that.osc = Gibberish.make[that.waveform](that.frequency, that.amp);
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Synth\"]();");
						
			window[that.name] = Gibberish.make["Synth"](that.osc, that.env);
			Gibberish.defineProperties( that, ["amp", "attack", "decay"] );
				
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
		
		makeSynth: function(_osc, _env) { // note, storing the increment value DOES NOT make this faster!
			var osc = _osc;			
			var env = _env;
			var output = function(frequency, attack, decay) {
				
				var val = osc(frequency) * env(attack, decay);
				//if(phase++ % 22050 == 0) console.log("SYNTH VALUE", val, frequency);
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
					
					this.modulator.frequency = frequency * this.cmRatio;
					this.carrier.frequency = this.frequency;
					this.modulator.amp = this.frequency * this.index;
					
					this.dirty = true;
					this.env.start();
				},
			};
			Gibberish.extend(that, Gibberish.ugen);
			
			that.env = Gibberish.Env(that.attack, that.decay);
			that.carrier = Gibberish["Sine"](that.frequency, that.amp);
			that.modulator = Gibberish["Sine"](that.frequency * that.cmRatio, that.index * that.frequency);
			
			that.carrier.mod("frequency", that.modulator, "+");
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"FMSynth\"]();");
			window[that.name] = Gibberish.make["FMSynth"]();
			
			(function(obj) {
				var that = obj;
				var _cmRatio = obj.cmRatio;
				var _index = obj.index;
	
			    Object.defineProperties(that, {
					cmRatio :  {
						get: function() { return _cmRatio; },
						set: function(value) {
							_cmRatio = value;
							that.modulator.frequency = that.frequency * _cmRatio;
							that.modulator.dirty = true;
							that.dirty = true;
						},
					},
					index :  {
						get: function() { return _index; },
						set: function(value) {
							_index = value;
							that.modulator.amp = that.frequency * _index;
							that.dirty = true;
						},
					},
				});
			})(that);
			
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
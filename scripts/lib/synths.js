define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Synth = gibberish.createGenerator(["osc", "env", "amp"], "{0}( {1}, {2} ) * {3}");
			gibberish.make["Synth"] = this.makeSynth;
			gibberish.Synth = this.Synth;
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
			that.osc = Gibberish.Sine(440, that.amp);
			
			that.name = Gibberish.generateSymbol(that.type);
			window[that.name] = Gibberish.make["Synth"]();
			Gibberish.defineProperties( that, ["frequency", "amp", "attack", "decay"] );
	
			return that;
		},
		
		makeSynth: function() { // note, storing the increment value DOES NOT make this faster!	
			var output = function(oscillator, envelope) {
				return oscillator * envelope;
			}
	
			return output;
		},
    }
});
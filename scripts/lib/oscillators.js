define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Sine = gibberish.createGenerator("Sine", ["frequency", "amp"], "{0}({1}) * {2}");
			gibberish.make["Sine"] = this.makeSine;
			gibberish.Sine = this.Sine;
			
			gibberish.generators.Env = gibberish.createGenerator("Env",  ["attack",  "decay"], "{0}({1}, {2})" ),
			gibberish.make["Env"] = this.makeEnv;
			gibberish.Env = this.Env;
		},
		
		Sine : function(freq, amp, name) {
			var that = { 
				type:		"Sine",
				category:	"Gen",
				frequency:	freq || 440, 
				amp:		amp || .5,
				fx:			[],
				mods:		[],
				mod:		Gibberish.mod,
				removeMod:	Gibberish.removeMod,
				addFx:		Gibberish.addFx,
			};
			Gibberish.defineProperties( that, ["frequency", "amp"] );
	
			return that;
		},
		
		makeSine: function() { // note, storing the increment value DOES NOT make this faster!
			var phase = 0;
			var sin = Math.sin;
			var pi = Math.PI;
	
			var output = function(frequency) {
				phase += frequency / 44100;
				return sin(phase * pi);
			}
			output.getPhase = function() { return phase; }
			output.setPhase = function(_phase) { phase = _phase; }
	
			return output;
		},
		
		Env : function(attack, decay) {
			var that = { 
				type:		"Env",
				category:	"Gen",
				mods:		[],
				attack:		attack || 10000,
				decay:		decay || 10000,
				mod:		Gibberish.mod,
			};
	
			Gibberish.defineProperties( that, ["attack", "decay"] );
	
			return that;
		},
		
		makeEnv : function() {
			var phase = 0;
			var state = 0;
			var output = function(attack,decay) {
				var val = 0;
				if(state === 0){
					val = phase / attack;
					if(++phase % attack === 0) {
						state++;
						phase = decay;
					}
				}else if(state === 1){
					val = phase / decay;
					if(--phase === 0) state = 0;			
				}
				return val;
			}
			output.getPhase = function() { return phase; }
			output.setPhase = function(_phase) { phase = _phase; }
			
			return output;
		},
			// 		Clip	: createGenerator("Clip", ["source", "amount", "amp"], "{0}({1},{2}) * {3}"),
    }
});
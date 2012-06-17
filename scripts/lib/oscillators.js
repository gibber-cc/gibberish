define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Sine = gibberish.createGenerator("Sine", ["frequency", "amp"], "{0}({1}) * {2}");
			gibberish.make["Sine"] = this.makeSine;
			gibberish.Sine = this.Sine;
		},
		Sine : function(freq, amp) {
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
			// Sine	: createGenerator("Sine", ["frequency", "amp"], "{0}({1}) * {2}"),
			// 		Env		: createGenerator("Env",  ["attack",  "decay"], "{0}({1}, {2})" ),
			// 		Clip	: createGenerator("Clip", ["source", "amount", "amp"], "{0}({1},{2}) * {3}"),
			// 	};
    }
});
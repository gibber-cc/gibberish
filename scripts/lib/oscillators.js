define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Sine = gibberish.createGenerator(["frequency", "amp"], "{0}({1}) * {2}");
			gibberish.make["Sine"] = this.makeSine;
			gibberish.Sine = this.Sine;
			
			gibberish.generators.Env = gibberish.createGenerator(["attack",  "decay"], "{0}({1}, {2})" ),
			gibberish.make["Env"] = this.makeEnv;
			gibberish.Env = this.Env;
		},
		
		Sine : function(freq, amp, name) {
			var that = { 
				type:		"Sine",
				category:	"Gen",
				frequency:	freq || 440, 
				amp:		amp || .5,
			};
			Gibberish.extend(that, Gibberish.ugen);
			
			that.name = Gibberish.generateSymbol(that.type);
			window[that.name] = Gibberish.make["Sine"]();
			that._function = window[that.name];
			
			Gibberish.defineProperties( that, ["frequency", "amp"] );
	
			return that;
		},
		
		makeSine: function() { // note, storing the increment value DOES NOT make this faster!
			var phase = 0;
			var sin = Math.sin;
			var pi_2 = Math.PI * 2;
	
			var output = function(frequency) {
				phase += frequency / 44100;
				return sin(phase * pi_2);
			}
	
			return output;
		},
		
		Env : function(attack, decay) {
			var that = { 
				type:		"Env",
				category:	"Gen",
				attack:		attack || 10000,
				decay:		decay || 10000,

				start: function() {
					that._function.setState(0);
				},
			};
			Gibberish.extend(that, Gibberish.ugen);
			
			that.name = Gibberish.generateSymbol(that.type);
			window[that.name] = Gibberish.make["Env"]();
			//that._function = window[that.name];
			
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
					if(--phase === 0) state++;;			
				}
				return val;
			};
			output.setPhase = function(newPhase) { phase = newPhase; };
			output.setState = function(newState) { state = newState; };
			
			return output;
		},
    }
});
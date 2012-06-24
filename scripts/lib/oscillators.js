define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Sine = gibberish.createGenerator(["frequency", "amp"], "{0}( {1}, {2} )");
			gibberish.make["Sine"] = this.makeSine;
			gibberish.Sine = this.Sine;
			
			gibberish.generators.Square = gibberish.createGenerator(["frequency", "amp"], "{0}({1}, {2})");
			gibberish.make["Square"] = this.makeSquare;
			gibberish.Square = this.Square;
			
			gibberish.generators.Triangle = gibberish.createGenerator(["frequency", "amp"], "{0}( {1}, {2} )");
			gibberish.make["Triangle"] = this.makeTriangle;
			gibberish.Triangle = this.Triangle;
			
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
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Sine\"]();");
			window[that.name] = Gibberish.make["Sine"]();
			that._function = window[that.name];
			
			that.toJSON =function() { return ""+this.frequency+this.amp+this.type; }
			
			Gibberish.defineProperties( that, ["frequency", "amp"] );
			
			return that;
		},
		
		makeSine: function() { // note, storing the increment value DOES NOT make this faster!
			var phase = 0;
			var sin = Math.sin;
			var pi_2 = Math.PI * 2;
	
			var output = function(frequency, amp) {
				phase += frequency / 44100;
				//while(phase > pi_2) phase -= pi_2;
				return sin(phase * pi_2) * amp;
			}
	
			return output;
		},
		
		Square : function(freq, amp, name) {
			var that = { 
				type:		"Square",
				category:	"Gen",
				frequency:	freq || 440, 
				amp:		amp * .35 || .1,
			};
			Gibberish.extend(that, Gibberish.ugen);
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Square\"]();");
			window[that.name] = Gibberish.make["Square"]();
			that._function = window[that.name];
			
			Gibberish.defineProperties( that, ["frequency", "amp"] );
			
			that.toJSON =function() { return ""+this.frequency+this.amp+this.type; }
			
			return that;
		},
		
		makeSquare: function() { // note, storing the increment value DOES NOT make this faster!
			var cycle = 1;
			var phase = 0;
			var output = function(frequency, amp) {
				while(phase++ >= 44100 / frequency) {
					cycle *= -1;
					phase -= 44100;
				}
				return cycle;
			}
	
			return output;
		},
		
		Triangle : function(freq, amp, name) {
			var that = { 
				type:		"Triangle",
				category:	"Gen",
				frequency:	freq || 440, 
				amp:		amp * .35 || .1,
			};
			Gibberish.extend(that, Gibberish.ugen);
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Triangle\"]();");
			window[that.name] = Gibberish.make["Triangle"]();
			that._function = window[that.name];
			
			Gibberish.defineProperties( that, ["frequency", "amp"] );
	
			return that;
		},
		
		makeTriangle: function() {
			var phase = 0;
			var output = function(frequency, amp) {
			    var out = 1 - 4 * Math.abs((phase + 0.25) % 1 - 0.5);

			    phase += frequency / 44100;
				
			    if (phase > 1) {
			        phase %= 1;
			    }
				
				return out * amp;
			};
	
			return output;
		},
    }
});
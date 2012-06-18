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
				addFx:		Gibberish.addFx,
				fx:			[],
				mods:		[],
				mod:		Gibberish.mod,
				removeMod:	Gibberish.removeMod,
				dirty:		true,
				output:		null,
				
				send: function(bus, amount) {
					bus.senders.push({sender:this, amount:amount});
				},
				
				connect : function(bus) {
					this.output = bus;
					if(bus === Gibberish.MASTER) {
						Gibberish.connect(this);
					}else{
						//console.log("CONNECTING", this.ugenVariable);
						bus.connectUgen(this, .4);
					}
					Gibberish.dirty = true;
				},
			};
			
			that.name = Gibberish.generateSymbol(that.type);
			
			window[that.name] = Gibberish.make["Sine"]();

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
				dirty:		true,
			};			
			that.name = Gibberish.generateSymbol(that.type);
			
			window[that.name] = Gibberish.make["Env"]();
			
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
    }
});
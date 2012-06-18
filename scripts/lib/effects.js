define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Clip = gibberish.createGenerator("Clip", ["source", "amount", "amp"], "{0}({1},{2}) * {3}");
			gibberish.make["Clip"] = this.makeClip;
			gibberish.Clip = this.Clip;
			
			// gibberish.generators.Bus = gibberish.createGenerator("Bus", ["source", "amount", "amp"], "{0}({1},{2}) * {3}");
			// gibberish.make["Clip"] = this.makeClip;
			// gibberish.Clip = this.Clip;
			
		},
		
		Clip : function(amount, amp) {
			var that = {
				type:		"Clip",
				category:	"FX",
				amount:		amount,
				amp:		amp,
				source:		null,
				mod: 		Gibberish.mod,
				mods:		[],
				removeMod:	Gibberish.removeMod,
				dirty:		true,	
			}
			that.name = Gibberish.generateSymbol(that.type);
			
			window[that.name] = Gibberish.make["Clip"]();
			
			Gibberish.defineProperties( that, ["amount", "amp"] );
	
			return that;
		},

		makeClip : function() {
			var abs = Math.abs;
			var log = Math.log;
			var ln2 = Math.LN2;
			var output = function(sample, amount) {
				var x = sample * amount;
				return (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide
			};
			// output.setPhase = function() {}
			// output.getPhase = function() {}			
			return output;
		},
		
		Bus : function(effects) {
			var that = {
				senders : [],
				effects : [],
				type	: "Bus",
				category: "Bus",
				dirty	: true,
			};
			// var b = Bus( Clip(50, .25), Reverb() );
			
			// var v_10 = Bus( (v2 * .5) + (v3 * .2) + (v4 * .6) );
			// v_10 = Clip(v_10, 50) * .25;
			// v_10 = Reverb(v_10, 1, 0, 1, 0);	
		},
		
		makeBus : function() { 
			var output = function(senders) {
				var out = 0;
				for(var i = 0; i < senders.length; i++) {
					var sender = eval(senders[i].ugenVariable) * senders[i].amount;
					out += sender;
				}
			}
			
			return that;
		},
    }
});

/*
Bus - effectively a subgraph. Busses can contain both synths and effects.
	- output of synths is summed when there is more than one. Effects are then applied.
	- synths can be connect to a bus, and can also "send" to a bus while connected to another one
	- a bus can connect to another bus
	- the master output is a bus that is only connected to the DAC.
*/
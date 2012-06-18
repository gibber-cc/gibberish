define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Clip = gibberish.createGenerator(["source", "amount", "amp"], "{0}({1},{2}) * {3}");
			gibberish.make["Clip"] = this.makeClip;
			gibberish.Clip = this.Clip;
			
			// gibberish.generators.Bus = gibberish.createGenerator(["senders", "amount"], "{0}({1})");
			gibberish.make["Bus"] = this.makeBus;
			gibberish.Bus = this.Bus;
			
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
				senders : 0,
				addFx	: Gibberish.addFx,
				fx		: [],
				length	: 0,
				type	: "Bus",
				category: "Bus",
				dirty	: true,
				output	: null,
				amount	: 1,
				
				connect : function(bus) {
					this.output = bus;
					if(bus === Gibberish.MASTER) {
						Gibberish.connect(this);
					}else{
						bus.connectUgen(this, .4);
					}
					this.dirty = true;
					Gibberish.dirty = true;
				},
				
				connectUgen : function(variable, amount) { // man, this is hacky... but it should be called very often
					this["senders" + this.length++] = { type:"*", operands:[variable, amount]};
					var formula = "{0}(";
					var attrArray = [];
					for(var i = 1; i <= this.length; i++) {
						formula += "{"+i+"}";
						if(i !== this.length) formula +="+";
						attrArray.push("senders"+(i-1));
					}
					formula += ")";
					
					console.log("FORMULA : ", formula);
					//console.log(attrArray);
					Gibberish.generators[that.type] = Gibberish.createGenerator(attrArray, formula);
					
				},
				
			};
			
			that.name = Gibberish.generateSymbol(that.type);
			that.type = that.name;
			
			Gibberish.generators[that.type] = Gibberish.createGenerator(["senders", "amount"], "{0}({1})");
			
			
			window[that.name] = Gibberish.make["Bus"]();
			
			Gibberish.defineProperties( that, ["senders"]);
			return that;
			// var b = Bus( Clip(50, .25), Reverb() );
			
			// var v_10 = Bus( (v2 * .5) + (v3 * .2) + (v4 * .6) );
			// v_10 = Clip(v_10, 50) * .25;
			// v_10 = Reverb(v_10, 1, 0, 1, 0);	
		},
		
		makeBus : function() { 
			var output = function() {
				var out = 0;
				for(var i = 0; i < arguments.length; i++) {
					out += arguments[i];
				}
				// for(var i = 0; i < senders.length; i++) {
				// 					var sender = eval(senders[i].ugenVariable) * senders[i].amount;
				// 					out += sender;
				// 				}
				return out;
			};
			
			return output;
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
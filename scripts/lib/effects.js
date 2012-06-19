define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Clip = gibberish.createGenerator(["source", "amount", "amp"], "{0}({1},{2}) * {3}");
			gibberish.make["Clip"] = this.makeClip;
			gibberish.Clip = this.Clip;
			
			gibberish.generators.Delay = gibberish.createGenerator(["source", "time", "feedback"], "{0}({1},{2},{3})");
			gibberish.make["Delay"] = this.makeDelay;
			gibberish.Delay = this.Delay;
			
			
			// the calls to dynamically create the bus generators are generated dynamically. that is fun to say.
			gibberish.make["Bus"] = this.makeBus;
			gibberish.Bus = this.Bus;
			
		},
		
		Delay : function(time, feedback) {
			var that = {
				type:		"Delay",
				category:	"FX",
				feedback:	feedback || .5,
				time:		time || 22050,
				buffer:		new Float32Array(88200),
				bufferLength: 88200,
				source:		null,
			};
			Gibberish.extend(that, Gibberish.ugen);
			
			if(that.time >= 88200) {
				that.time = 88199;
				console.log("MAX DELAY TIME = 88199 samples");
			}
			
			that.name = Gibberish.generateSymbol(that.type);
			window[that.name] = Gibberish.make["Delay"](that.buffer, that.bufferLength);
			that._function = window[that.name];
			
			Gibberish.defineProperties( that, ["time", "feedback"] );
	
			return that;
		},

		makeDelay : function(_buffer, _bufferLength) {
			var phase = 0;
			var bufferLength = _bufferLength;
			var buffer = _buffer;
			
			var output = function(sample, time, feedback) {
				var _phase = phase++ % bufferLength;

				var delayPos = (_phase + time) % bufferLength;				
				
				//if(phase % 22050 == 0) console.log(_phase, delayPos);
				
				buffer[delayPos] = (sample + buffer[_phase]) * feedback;
				return sample + buffer[_phase];
			};
			
			return output;
		},
		
		
		Clip : function(amount, amp) {
			var that = {
				type:		"Clip",
				category:	"FX",
				amount:		amount,
				amp:		amp,
				source:		null,
			};
			Gibberish.extend(that, Gibberish.ugen);
			
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
			
			return output;
		},
		
		Bus : function(effects) {
			var that = {
				senders : 0,
				length	: 0,
				type	: "Bus",
				category: "Bus",
				amount	: 1,
				
				connect : function(bus) {
					this.output = bus;
					if(bus === Gibberish.MASTER) {
						Gibberish.connect(this);
					}else{
						bus.connectUgen(this, 1);
					}
					this.dirty = true;
					Gibberish.dirty = true;
				},
				
				connectUgen : function(variable, amount) { // man, this is hacky... but it should be called rarely
					this["senders" + this.length++] = { type:"*", operands:[variable, amount]};
					
					var formula = "{0}(";
					var attrArray = [];
					
					for(var i = 1; i <= this.length; i++) {
						formula += "{"+i+"}";
						if(i !== this.length) formula +="+";
						attrArray.push("senders"+(i-1));
					}
					formula += ")";
					variable.sendDestinations.push(this);
					//console.log("FORMULA : ", formula);
					//console.log(attrArray);
					Gibberish.generators[that.type] = Gibberish.createGenerator(attrArray, formula);
					
				},
				
				send: function(bus, amount) {
					bus.connectUgen(this, amount);
				},
			};
			
			Gibberish.extend(that, Gibberish.ugen);
			
			that.name = Gibberish.generateSymbol(that.type);
			that.type = that.name;
			
			Gibberish.generators[that.type] = Gibberish.createGenerator(["senders", "amount"], "{0}({1})");
			
			window[that.name] = Gibberish.make["Bus"]();
			
			Gibberish.defineProperties( that, ["senders", "dirty"]);
			return that;
		},
		
		makeBus : function() { 
			var output = function() {
				var out = 0;
				
				for(var i = 0; i < arguments.length; i++) {
					out += arguments[i];
				}
				
				return out;
			};
			
			return output;
		},
    }
});
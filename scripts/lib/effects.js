define([], function() {
    return {
		init: function(gibberish) {			
			gibberish.generators.Clip = gibberish.createGenerator(["source", "amount", "amp"], "{0}( {1}, {2} ) * {3}");
			gibberish.make["Clip"] = this.makeClip;
			gibberish.Clip = this.Clip;
			
			gibberish.generators.Delay = gibberish.createGenerator(["source", "time", "feedback"], "{0}( {1}, {2}, {3} )");
			gibberish.make["Delay"] = this.makeDelay;
			gibberish.Delay = this.Delay;
			
			gibberish.generators.Reverb = gibberish.createGenerator(["source", "roomSize", "damping", "wet", "dry" ], "{0}( {1},{2},{3},{4},{5} )");
			gibberish.make["Reverb"] = this.makeReverb;
			gibberish.Reverb = this.Reverb;
			
			gibberish.generators.AllPass = gibberish.createGenerator(["source", "time", "feedback"], "{0}( {1}, {2}, {3} )");
			gibberish.make["AllPass"] = this.makeAllPass;
			gibberish.AllPass = this.AllPass;
			
			gibberish.generators.Comb = gibberish.createGenerator(["source", "time", "feedback"], "{0}( {1}, {2}, {3} )");
			gibberish.make["Comb"] = this.makeComb;
			gibberish.Comb = this.Comb;
			
			// the calls to dynamically create the bus generators are generated dynamically. that is fun to say.
			gibberish.make["Bus"] = this.makeBus;
			gibberish.Bus = this.Bus;
		},
		
		AllPass : function(time, feedback) {
			var that = {
				type:		"AllPass",
				category:	"FX",
				feedback:	feedback || .5,
				time:		time || 500,
				buffer:		new Float32Array(time || 500),
				source:		null,
			};
			Gibberish.extend(that, Gibberish.ugen);
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"AllPass\"]();");
			window[that.name] = Gibberish.make["AllPass"](that.buffer, that.time, that.feedback);
			that._function = window[that.name];
			
			Gibberish.defineProperties( that, ["feedback"] );
			
			// todo: this doesn't seem to be working... the buffer might need to be resampled.
			(function(obj) {
				var _time = obj.time;
			    Object.defineProperty(that, "time", {
					get: function() { return _time; },
					set: function(value) {
						if(_time !== value) {
							_time = value;
							obj.buffer = new Float32Array(value);
							that.dirty = true;
							Gibberish.dirty = true;
						}
					},
				});
			})(that);
	
			return that;
		},

		makeAllPass : function(_buffer, _feedback) {
			//console.log("ALL PASS", _buffer.length, _feedback);
			var feedback = _feedback;
			var bufferLength = _buffer.length;
			var buffer = _buffer;
			var index = -1;
			
			var output = function(inputSample) {
				index = ++index % bufferLength;
				var bufferSample = buffer[index];
				
				var out = -inputSample + bufferSample;
				buffer[index] = inputSample + (bufferSample * feedback);

				return out;
			};
			
			return output;
		},
		// adapted from audioLib.js, in turn adapted from Freeverb source code
		// NOTE : this is actually a lowpass-feedback-comb filter (https://ccrma.stanford.edu/~jos/pasp/Lowpass_Feedback_Comb_Filter.html)
		// TODO : rename accordingly?
		Comb : function(time, feedback, damping) {
			var that = {
				type:		"Comb",
				category:	"FX",
				feedback:	feedback || .84,
				time:		time || 1200,
				buffer:		new Float32Array(time || 1200),
				damping:	damping || .2,
				source:		null,
				toJSON:		Gibberish.NO_MEMO,
			};
			Gibberish.extend(that, Gibberish.ugen);
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Comb\"]();");
			window[that.name] = Gibberish.make["Comb"](that.buffer, that.feedback, that.damping);
			that._function = window[that.name];
			
			Gibberish.defineProperties( that, ["feedback"] );
			
			// todo: this doesn't seem to be working... the buffer might need to be resampled.
			// (function(obj) {
			// 	var _time = obj.time;
			//     Object.defineProperty(that, "time", {
			// 		get: function() { return _time; },
			// 		set: function(value) {
			// 			if(_time !== value) {
			// 				_time = value;
			// 				obj.buffer = new Float32Array(value);
			// 				that.dirty = true;
			// 				Gibberish.dirty = true;
			// 			}
			// 		},
			// 	});
			// })(that);
	
			return that;
		},

		makeComb : function(_buffer, _feedback, _damping) {
			//console.log("COMB CHECK", _feedback, _damping, _buffer.length);
			var feedback = _feedback;
			var damping = _damping;
			var invDamping = 1 - _damping;
			var buffer = _buffer;
			var time = buffer.length;
			var index = 0;
			var store = 0;
			
			var output = function(inputSample) {
				var currentPos = ++index % time;
				var sample = buffer[currentPos];
				store = (sample * .8) + (store * .2);
				buffer[currentPos] = inputSample + (store * feedback);

				return sample;
			};
			
			return output;
		},
		
		// adapted from audioLib.js
		Reverb : function(roomSize, damping, wet, dry) {
			var that = {
				type:		"Reverb",
				category:	"FX",
				roomSize:	roomSize || .5,
				damping:	typeof damping !== "undefined" ? damping : .2223,
				wet:		typeof wet     !== "undefined" ? wet : .5,
				dry:		typeof dry     !== "undefined" ? dry : .55,				
				source:		null,
				tuning:		{
				    combCount: 		8,
				    combTuning: 	[1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617],

				    allPassCount: 	4,
				    allPassTuning: 	[556, 441, 341, 225],
				    allPassFeedback:0.5,

				    fixedGain: 		0.015,
				    scaleDamping: 	0.9,

				    scaleRoom: 		0.28,
				    offsetRoom: 	0.7,

				    stereoSpread: 	23
				},
				toJSON:		function() { return ""+this.type+this.roomSize+this.damping+this.wet+this.dry; },
				channelCount: 1,
			};
			Gibberish.extend(that, Gibberish.ugen);
			that.name = Gibberish.generateSymbol(that.type);
			
			that.combFilters = (function() {
				var combs	= [],
					num		= that.tuning.combCount,
					damp	= that.damping * that.tuning.scaleDamping,
					feed	= that.roomSize * that.tuning.scaleRoom + that.tuning.offsetRoom,
					sizes	= that.tuning.combTuning;
					
				for(var c = 0; c < that.channelCount; c++){
					for(var i = 0; i < 8; i++){
						combs.push( Gibberish.make["Comb"](new Float32Array(sizes[i] + c * that.tuning.stereoSpread), feed, damp) );
					}
				}
				return combs;
			})();;
			
			that.allPassFilters = (function() {
				var apfs = [],
				num		= that.tuning.allPassCount,
				feed	= that.tuning.allPassFeedback,
				sizes	= that.tuning.allPassTuning;
				
				for(var c = 0; c < that.channelCount; c++){
					for(var i = 0; i < num; i++){
						apfs.push( Gibberish.make["AllPass"](new Float32Array(sizes[i] + c * that.tuning.stereoSpread), feed) );
					}
				}
				return apfs;
			})();
			
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Reverb\"]();");
			window[that.name] = Gibberish.make["Reverb"](that.combFilters, that.allPassFilters, that.tuning);
			that._function = window[that.name];

			Gibberish.defineProperties( that, ["time", "feedback"] );

			return that;
		},

		makeReverb : function(combFilters, allPassFilters, tuning) {
			var output = function(sample, roomSize, damping, wet, dry) {
				//if(phase++ % 500 == 0) console.log(roomSize, damping, wet, dry, input);			
				var input = sample * tuning.fixedGain;
				var out = 0;
				for(var i = 0; i < 8; i++) {
					out += combFilters[i](input);
				}
				
				for(var i = 0; i < 4; i++) {
					out = allPassFilters[i](out);
				}

				return out * wet + sample * dry;
			};
			
			return output;
		},
		
		Delay : function(time, feedback) {
			var that = {
				type:		"Delay",
				category:	"FX",
				feedback:	feedback || .5,
				time:		time || 22050,
				source:		null,
				buffer:		new Float32Array(88200),				
				bufferLength: 88200,
				toJSON:		Gibberish.NO_MEMO,
			};
			Gibberish.extend(that, Gibberish.ugen);
			
			if(that.time >= 88200) {
				that.time = 88199;
				//console.log("MAX DELAY TIME = 88199 samples");
			}
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Delay\"]();");
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
				toJSON:		function() { return ""+this.type+this.amount+this.amp; }
			};
			Gibberish.extend(that, Gibberish.ugen);
			
			that.name = Gibberish.generateSymbol(that.type);
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Clip\"]();");
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
				toJSON	: Gibberish.NO_MEMO,
				
				connect : function(bus) {
					this.destinations.push(bus);
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
					
					var formula = "{0}( ";
					var attrArray = [];
					
					for(var i = 1; i <= this.length; i++) {
						formula += "{"+i+"}";
						if(i !== this.length) formula +=" + ";
						attrArray.push("senders"+(i-1));
					}
					formula += " )";
					variable.destinations.push(this);
					//console.log("FORMULA : ", formula);
					//console.log(attrArray);
					Gibberish.generators[that.type] = Gibberish.createGenerator(attrArray, formula);
					
				},
				
				send: function(bus, amount) {
					bus.connectUgen(this, amount);
				},
			};
			
			Gibberish.extend(that, Gibberish.ugen);
			that.fx = effects || [];
			
			that.name = Gibberish.generateSymbol(that.type);
			that.type = that.name;
			
			Gibberish.generators[that.type] = Gibberish.createGenerator(["senders", "amount"], "{0}( {1} )");
			
			Gibberish.masterInit.push(that.name + " = Gibberish.make[\"Bus\"]();");
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
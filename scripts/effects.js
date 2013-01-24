Gibberish.effect = function() {
    this.type = 'effect';
};
Gibberish.effect.prototype = new Gibberish.ugen();
Gibberish._effect = new Gibberish.effect();

Gibberish.Distortion = function() {
  var abs = Math.abs, 
      log = Math.log, 
      ln2 = Math.LN2;
  
  Gibberish.extend(this, {
    name : 'distortion',
    
    properties : {
      input  : 0,
      amount : 50,
    },
    
    callback : function(input, amount) {
      var x;
      if(typeof input === 'number') {
    		x = input * amount;
    		input = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide
      }else{
        x = input[0] * amount;
        input[0] = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide
        x = input[1] * amount;
        input[1] = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide      
      }
  		return input;
    },
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Distortion.prototype = Gibberish._effect;

Gibberish.Delay = function() {
  var buffers = [],
      phase = 0;
  
  buffers.push( new Float32Array(88200) );
  buffers.push( new Float32Array(88200) );
  
  Gibberish.extend(this, {
  	name:"Delay",
  	properties:{ input:0, time: 22050, feedback: .5, channels:1 },
				
  	callback : function(sample, time, feedback) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var _phase = phase++ % 88200;
      
  		var delayPos = (_phase + time) % 88200;
      if(channels === 1) {
  			buffers[0][delayPos] =  (sample + buffers[0][_phase]) * feedback;
        sample += buffers[0][_phase];
      }else{
  			buffers[0][delayPos] =  (sample[0] + buffers[0][_phase]) * feedback;
        sample[0] += buffers[0][_phase];
  			buffers[1][delayPos] =  (sample[1] + buffers[1][_phase]) * feedback;
        sample[1] += buffers[1][_phase];   
      }
      
  		return sample;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Delay.prototype = Gibberish._effect;

// adapted from code / comments at http://musicdsp.org/showArchiveComment.php?ArchiveID=124
Gibberish.Decimator = function() {
  var counter = 0,
      hold = [],
      pow = Math.pow,
      floor = Math.floor;
      
  Gibberish.extend(this, {
  	name:"Decimator",
  	properties:{ input:0, bitDepth: 16, sampleRate: 1 },
				
  	callback : function(sample, depth, rate) {
  		counter += rate;
      var channels = typeof sample === 'number' ? 1 : 2;
      
      if(channels === 1) {
  			if(counter >= 1) {
  				var bitMult = pow( depth, 2.0 );
  				hold[0]  = floor( sample * bitMult ) / bitMult;
  				counter -= 1;
  			}
  			sample = hold[0];
      }else{
  			if(counter >= 1) {
  				var bitMult = pow( depth, 2.0 );
  				hold[0]  = floor( sample[0] * bitMult ) / bitMult;
  				hold[1]  = floor( sample[1] * bitMult ) / bitMult;          
  				counter -= 1;
  			}
  			sample = hold;
      }
					
  		return sample;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Decimator.prototype = Gibberish._effect;

Gibberish.RingModulation = function() {
  var sin = new Gibberish.Sine().callback,
      output = [0,0];
      
  Gibberish.extend( this, { 
  	name : "ringmod",
  
	  properties : { input:0, frequency:440, amp:.5, mix:.5 },

    callback : function(sample, frequency, amp, mix) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
      var mod = sin(frequency, amp);
      
      output1 = output1 * (1-mix) + (output1 * mod) * mix;
      
      if(channels === 2) {
        var output2 = sample[1];
        output2 = output2 * (1-mix) + (output2 * mod) * mix;

        output[0] = output1;
        output[1] = output2;
        return output;
      }
      
		  return output1; // return mono
  	},
  })
  .init()
  .processProperties(arguments); 
};
Gibberish.RingModulation.prototype = Gibberish._effect;

// adapted from Arif Ove Karlsne's 24dB ladder approximation: http://musicdsp.org/showArchiveComment.php?ArchiveID=141
Gibberish.Filter24 = function() {
  var poles  = [0,0,0,0],
      poles2 = [0,0,0,0],
      output = [0,0],
      phase  = 0,
      _cutoff = isNaN(arguments[0]) ? .1 : arguments[0],
      _resonance = isNaN(arguments[1]) ? 3 : arguments[1]
      _isLowPass = typeof arguments[2] !== 'undefined' ? arguments[2] : true;
      
  Gibberish.extend( this, { 
  	name : "filter24",
  
	  properties : { input:0, cutoff:_cutoff, resonance:_resonance, isLowPass:_isLowPass },

    callback : function(sample, cutoff, resonance, isLowPass) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
			var rezz = poles[3] * resonance; 
			rezz = rezz > 1 ? 1 : rezz;
						
			cutoff = cutoff < 0 ? 0 : cutoff;
			cutoff = cutoff > 1 ? 1 : cutoff;
						
			output1 -= rezz;

			poles[0] = poles[0] + ((-poles[0] + output1) * cutoff);
			poles[1] = poles[1] + ((-poles[1] + poles[0])  * cutoff);
			poles[2] = poles[2] + ((-poles[2] + poles[1])  * cutoff);
			poles[3] = poles[3] + ((-poles[3] + poles[2])  * cutoff);

			output1 = isLowPass ? poles[3] : output1 - poles[3];
      
      if(channels === 2) {
        var output2 = sample[1];

  			rezz = poles2[3] * resonance; 
  			rezz = rezz > 1 ? 1 : rezz;

  			output2 -= rezz;

  			poles2[0] = poles2[0] + ((-poles2[0] + output2) * cutoff);
  			poles2[1] = poles2[1] + ((-poles2[1] + poles2[0])  * cutoff);
  			poles2[2] = poles2[2] + ((-poles2[2] + poles2[1])  * cutoff);
  			poles2[3] = poles2[3] + ((-poles2[3] + poles2[2])  * cutoff);

  			output2 = isLowPass ? poles2[3] : output2 - poles2[3];
        output[0] = output1;
        output[1] = output1;
        
        return output;
      }
      
		  return output1; // return mono
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Filter24.prototype = Gibberish._effect;

Gibberish.SVF = function() {
	var d1 = [0,0], d2 = [0,0], pi= Math.PI, out = [0,0];
  
  Gibberish.extend( this, {
  	name:"SVF",
  	properties : { input:0, cutoff:440, Q:2, mode:0 },
				
  	callback: function(sample, frequency, Q, mode) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
  		var f1 = 2 * pi * frequency / 44100;
  		Q = 1 / Q;
					
			var l = d2[0] + f1 * d1[0];
			var h = output1 - l - Q * d1[0];
			var b = f1 * h + d1[0];
			var n = h + l;
						
			d1[0] = b;
			d2[0] = l;
      
			if(mode === 0) 
				output1 = l;
			else if(mode === 1)
				output1 = h;
			else if(mode === 2)
				output1 = b;
			else
				output1 = n;
        
      if(channels === 2) {
        var output2 = sample[1];
  			var l = d2[1] + f1 * d1[1];
  			var h = output2 - l - Q * d1[1];
  			var b = f1 * h + d1[1];
  			var n = h + l;
						
  			d1[1] = b;
  			d2[1] = l;
      
  			if(mode === 0) 
  				output2 = l;
  			else if(mode === 1)
  				output2 = h;
  			else if(mode === 2)
  				output2 = b;
  			else
  				output2 = n;
          
        out[0] = output1; out[1] = output2;
      }else{
        out = output1;
      }

  		return out;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.SVF.prototype = Gibberish._effect;

Gibberish.OnePole = function() {
  var history = 0,
      phase = 0;
      
	Gibberish.extend(this, {
  	name: 'onepole',
    type: 'effect',
    
    properties : {
      input : null,
      a0 : .15,           
      b1 : .85, 
    },
    
    callback : function(input, a0, b1) {
      var out = input * a0 + history * b1;
      history = out;
    
      return out;
    },
    
    smooth : function(propName, obj) {
      this.input = obj.properties[propName];
      obj.mod(propName, this, '=');
    },
  })
  .init()
  .processProperties(arguments);
};
Gibberish.OnePole.prototype = Gibberish._effect;

Gibberish.Flanger = function() {
	var buffers =	        [ new Float32Array(88200), new Float32Array(88200) ],
	    bufferLength =    88200,
	    delayModulation =	new Gibberish.Sine().callback,
	    interpolate =		  Gibberish.interpolate,
	    readIndex =			  -100,
	    writeIndex = 		  0,
	    phase =				    0;
      
	Gibberish.extend(this, {
    name:"flanger",
  	properties:{ input:0, rate:.25, amount:125, feedback:0, offset:125 },
    
  	callback : function(sample, delayModulationRate, delayModulationAmount, feedback, offset, channels) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var delayIndex = readIndex + delayModulation( delayModulationRate, delayModulationAmount * .95 );

  		if(delayIndex > bufferLength) {
  			delayIndex -= bufferLength;
  		}else if(delayIndex < 0) {
  			delayIndex += bufferLength;
  		}
					
			var delayedSample = interpolate(buffers[0], delayIndex);
			buffers[0][writeIndex] = channels === 1 ? sample + (delayedSample * feedback): sample[0] + (delayedSample * feedback);
				
      if(channels === 2) {
        sample[0] += delayedSample;
        
  			delayedSample = interpolate(buffers[1], delayIndex);
  			buffers[1][writeIndex] = sample[1] + (delayedSample * feedback);
        
        sample[1] += delayedSample;
      }else{
        sample += delayedSample;
      }
			
  		if(++writeIndex >= bufferLength) writeIndex = 0;
  		if(++readIndex  >= bufferLength) readIndex  = 0;

  		return sample;
  	},	
  })
  .init()
  .processProperties(arguments);

	readIndex = this.offset * -1;
};
Gibberish.Flanger.prototype = Gibberish._effect;

Gibberish.Vibrato = function() {
	var buffers =	        [ new Float32Array(88200), new Float32Array(88200) ],
	    bufferLength =    88200,
	    delayModulation =	new Gibberish.Sine().callback,
	    interpolate =		  Gibberish.interpolate,
	    readIndex =			  -100,
	    writeIndex = 		  0,
	    phase =				    0;
      
	Gibberish.extend(this, {
    name:"vibrato",
  	properties:{ input:0, rate:5, amount:.5, offset:125 },
    
  	callback : function(sample, delayModulationRate, delayModulationAmount, offset, channels) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var delayIndex = readIndex + delayModulation( delayModulationRate, delayModulationAmount * offset - 1 );

  		if(delayIndex > bufferLength) {
  			delayIndex -= bufferLength;
  		}else if(delayIndex < 0) {
  			delayIndex += bufferLength;
  		}
					
			var delayedSample = interpolate(buffers[0], delayIndex);
			buffers[0][writeIndex] = channels === 1 ? sample : sample[0];
				
      if(channels === 2) {
        sample[0] = delayedSample;
        
  			delayedSample = interpolate(buffers[1], delayIndex);
  			buffers[1][writeIndex] = sample[1];
        
        sample[1] = delayedSample;
      }else{
        sample = delayedSample;
      }
			
  		if(++writeIndex >= bufferLength) writeIndex = 0;
  		if(++readIndex  >= bufferLength) readIndex  = 0;

  		return sample;
  	},	
  })
  .init()
  .processProperties(arguments);

	readIndex = this.offset * -1;
};
Gibberish.Vibrato.prototype = Gibberish._effect;

Gibberish.BufferShuffler = function() {
	var buffers = [ new Float32Array(88200), new Float32Array(88200) ],
    	bufferLength = 88200,  
  		readIndex = 0,
  		writeIndex = 0,
  		randomizeCheckIndex = 0,
  		shuffleTimeKeeper = 0,
  		isShuffling = 0,
  		random = Math.random,
  		fadeIndex = 0,
  		fadeAmount = 1,
  		isFadingWetIn = false,
  		isFadingDryIn = false,
  		reversed = false,
  		interpolate = Gibberish.interpolate,
  		pitchShifting = false,
  		speed = 1,
  		isBufferFull = false,
      rndf = Gibberish.rndf,
      _output = [0,0];
	
	Gibberish.extend(this, {
    name:"buffer_shuffler",
	
  	properties: { input:0, chance:.25, rate:11025, length:22050, reverseChange:.5, pitchChance:.5, pitchMin:.25, pitchMax:2, wet:1, dry:0 },

  	callback : function(sample, chance, rate, length, reverseChance, pitchChance, pitchMin, pitchMax, wet, dry) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		if(!isShuffling) {
        buffers[0][writeIndex] = channels === 1 ? sample : sample[0];
        buffers[1][writeIndex] = channels === 1 ? sample : sample[1]; // won't be used but with one handle but probably cheaper than an if statement?
                
  			writeIndex++
  			writeIndex %= bufferLength;

  			isBufferFull = writeIndex === 0 ? 1 : isBufferFull; // don't output buffered audio until a buffer is full... otherwise you just get a gap
						
  			randomizeCheckIndex++;

  			if(randomizeCheckIndex % rate == 0 && random() < chance) {
  				reversed = random() < reverseChance;
  				isShuffling = true;
  				if(!reversed) {
  					readIndex = writeIndex - length;
  					if(readIndex < 0) readIndex = bufferLength + readIndex;
  				}
  				pitchShifting = random() < pitchChance;
  				if(pitchShifting) {
  					speed = rndf(pitchMin, pitchMax);
  				}
  				fadeAmount = 1;
  				isFadingWetIn = true;
  				isFadingDryIn = false;
  			}
  		}else if(++shuffleTimeKeeper % (length - 400) === 0) {
  			isFadingWetIn = false;
  			isFadingDryIn = true;
  			fadeAmount = 1;
  			shuffleTimeKeeper = 0;
  		}
					
  		readIndex += reversed ? speed * -1 : speed;
  		if(readIndex < 0) {
  			readIndex += bufferLength;
  		}else if( readIndex > bufferLength) {
  			readIndex -= bufferLength;
  		}
					
  		var outSampleL = interpolate(buffers[0], readIndex);
			
      var outL, outR, shuffle, outSampleR;			
			if(isFadingWetIn) {						
				fadeAmount -= .0025;
        
        shuffle = (outSampleL * (1 - fadeAmount));
				outL = channels === 1 ? shuffle + (sample * fadeAmount) : shuffle + (sample[0] * fadeAmount);
        
        if(channels === 2) {
          outSampleR = interpolate(buffers[1], readIndex);
          shuffle = (outSampleR * (1 - fadeAmount));
          outR = channels === 1 ? outL : shuffle + (sample[1] * fadeAmount);
        }

				if(fadeAmount <= .0025) isFadingWetIn = false;
			}else if(isFadingDryIn) {						
				fadeAmount -= .0025;
        
        shuffle = outSampleL * fadeAmount;
				outL = channels === 1 ? shuffle + (sample * fadeAmount) : shuffle + (sample[0] * (1 - fadeAmount));
        
        if(channels === 2) {
          outSampleR = interpolate(buffers[1], readIndex);
          shuffle = outSampleR * fadeAmount;
          outR = shuffle + (sample[1] * (1 - fadeAmount));
        }
        
				if(fadeAmount <= .0025) { 
					isFadingDryIn = false;
					isShuffling = false;
					reversed = false;
					speed = 1;
					pitchShifting = 0;
				}
			}else{
        if(channels === 1) {
          outL = isShuffling && isBufferFull ? (outSampleL * wet) + sample * dry : sample;
        }else{
          outSampleR = interpolate(buffers[1], readIndex);
          outL = isShuffling && isBufferFull ? (outSampleL * wet) + sample[0] * dry : sample[0];
          outR = isShuffling && isBufferFull ? (outSampleR * wet) + sample[1] * dry : sample[1];          
        }
			}
      _output = [outL, outR];
  		return channels === 1 ? outL : _output;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.BufferShuffler.prototype = Gibberish._effect;

Gibberish.AllPass = function(time, feedback) {
	var index  = -1,
    	buffer =	new Float32Array(time || 500),
      bufferLength = buffer.length;
  
  Gibberish.extend(this, {
		name:		"allpass",
    properties: {
      input   : 0,
    },
    callback : function(sample) {
  		index = ++index % bufferLength;
  		var bufferSample = buffer[index];
  		var out = -1 * sample + bufferSample;

  		buffer[index] = sample + (bufferSample * .5);
  		return out;
  	},
	});
  
};

// adapted from audioLib.js, in turn adapted from Freeverb source code
// this is actually a lowpass-feedback-comb filter (https://ccrma.stanford.edu/~jos/pasp/Lowpass_Feedback_Comb_Filter.html)
Gibberish.Comb = function(time) {
	var buffer = new Float32Array(time || 1200),
    	bufferLength = buffer.length,
    	index = 0,
    	store = 0;
      
	Gibberish.extend(this, {
		name:		"comb",
    properties : {
      input : 0,
  		time:		time || 1200,
    },
    
  	callback: function(sample) {
  		var currentPos = ++index % bufferLength;
			var out = buffer[currentPos];
						
			store = (out * .8) + (store * .2);
						
			buffer[currentPos] = sample + (store * .84);

  		return out;
  	},
	});
  
};

// adapted from audioLib.js
Gibberish.Reverb = function() {
  var tuning =	{
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
    combs = [],
    apfs  = [],
    output   = [0,0],
    phase  = 0;
    
	Gibberish.extend(this, {
		name:		"Reverb",
    
		roomSize:	.5,
		damping:	.2223,
    
    properties: {
      input:    0,
  		wet:		  .5,
  		dry:		  .55,
    },
    
    callback : function(sample, wet, dry) {
      var channels = typeof sample === 'object' ? 2 : 1;
      
			var input = channels === 1 ? sample : sample[0] + sample[1]; // converted to fake stereo

			var _out = input * .015;
      var out = _out;
						
			for(var i = 0; i < 8; i++) {
				var filt = combs[i](_out);
				out += filt;				
			}
							
			for(var i = 0; i < 4; i++) {
				out = apfs[i](out);	
			}
      
      output[0] = output[1] = (input * dry) + (out * wet);

  		return output;
  	},
	})  
  .init()
  .processProperties(arguments);
    
	for(var i = 0; i < 8; i++){
		combs.push( new Gibberish.Comb(tuning.combTuning[i], this.roomSize * tuning.scaleRoom * tuning.offsetRoom, this.damping ).callback );
	}
  
	for(var i = 0; i < 4; i++){
		apfs.push( new Gibberish.AllPass(tuning.allPassTuning[i], tuning.allPassFeedback ).callback );
	}

};
Gibberish.Reverb.prototype = Gibberish._effect;

Gibberish.Granulator = function(properties) {
	var grains      = [];
	    buffer      = null,
	    interpolate = Gibberish.interpolate,
      panner      = Gibberish.makePanner(),
      bufferLength= 0,
	    debug       = 0,
	    write       = 0,
      self        = this,
      out         = [0,0],
      _out        = [0,0],
      rndf        = Gibberish.rndf,
      numberOfGrains = properties.numberOfGrains || 20;
      
	Gibberish.extend(this, { 
		name:		        "granulator",
		bufferLength:   88200,
		reverse:	      true,
		spread:		      .5,
    
    properties : {
  		speed: 		    1,
  		speedMin:     -0,
  		speedMax: 	  .0,
  		grainSize: 	  1000,      
  		position:	    .5,
  		positionMin:  0,
  		positionMax:  0,
      amp:		      .2,
  		fade:		      .1,
  		pan:		      0,
  		shouldWrite:  false,
    },
    
    callback : function(speed, speedMin, speedMax, grainSize, positionMin, positionMax, position, amp, fade, pan, shouldWrite) {
    		for(var i = 0; i < numberOfGrains; i++) {
    			var grain = grains[i];
					
    			if(grain._speed > 0) {
    				if(grain.pos > grain.end) {
    					grain.pos = (position + rndf(positionMin, positionMax)) * buffer.length;
    					grain.start = grain.pos;
    					grain.end = grain.start + grainSize;
    					grain._speed = speed + rndf(speedMin, speedMax);
    					grain._speed = grain._speed < .1 ? .1 : grain._speed;
    					grain._speed = grain._speed < .1 && grain._speed > 0 ? .1 : grain._speed;							
    					grain._speed = grain._speed > -.1 && grain._speed < 0 ? -.1 : grain._speed;							
    					grain.fadeAmount = grain._speed * (fade * grainSize);
    					grain.pan = rndf(self.spread * -1, self.spread);
    				}
						
    				var _pos = grain.pos;
    				while(_pos > buffer.length) _pos -= buffer.length;
    				while(_pos < 0) _pos += buffer.length;
						
    				var _val = interpolate(buffer, _pos);
					
    				_val *= grain.pos < grain.fadeAmount + grain.start ? (grain.pos - grain.start) / grain.fadeAmount : 1;
    				_val *= grain.pos > (grain.end - grain.fadeAmount) ? (grain.end - grain.pos)   / grain.fadeAmount : 1;
						
    			}else {
    				if(grain.pos < grain.end) {
    					grain.pos = (position + rndf(positionMin, positionMax)) * buffer.length;
    					grain.start = grain.pos;
    					grain.end = grain.start - grainSize;
    					grain._speed = speed + rndf(speedMin, speedMax);
    					grain._speed = grain._speed < .1 && grain._speed > 0 ? .1 : grain._speed;							
    					grain._speed = grain._speed > -.1 && grain._speed < 0 ? -.1 : grain._speed;	
    					grain.fadeAmount = grain._speed * (fade * grainSize);							
    				}
						
    				var _pos = grain.pos;
    				while(_pos > buffer.length) _pos -= buffer.length;
    				while(_pos < 0) _pos += buffer.length;
					
    				var _val = interpolate(buffer, _pos);
					
    				_val *= grain.pos > grain.start - grain.fadeAmount ? (grain.start - grain.pos) / grain.fadeAmount : 1;
    				_val *= grain.pos < (grain.end + grain.fadeAmount) ? (grain.end - grain.pos) / grain.fadeAmount : 1;
    			}
					
    			_out = panner(_val * amp, grain.pan, _out);
          out[0] += _out[0];
          out[1] += _out[1];
    			
          grain.pos += grain._speed;
    		}
				
    		return panner(out, pan, out);
    	},
	})
  .init()
  .processProperties(arguments);
  
	for(var i = 0; i < numberOfGrains; i++) {
		grains[i] = {
			pos : self.position + Gibberish.rndf(self.positionMin, self.positionMax),
			_speed : self.speed + Gibberish.rndf(self.speedMin, self.speedMax),
		}
		grains[i].start = grains[i].pos;
		grains[i].end = grains[i].pos + self.grainSize;
		grains[i].fadeAmount = grains[i]._speed * (self.fade * self.grainSize);
		grains[i].pan = Gibberish.rndf(self.spread * -1, self.spread);
	}
			
	if(typeof properties.input !== "undefined") { 
			that.shouldWrite = true;
      
			that.sampler = new Gibberish.Sampler();
			that.sampler.connect();
			that.sampler.record(properties.buffer, that.bufferLength);
      
			that.buffer = that.sampler.buffer;
	}else if(typeof properties.buffer !== 'undefined') {
	  buffer = properties.buffer;
    bufferLength = buffer.length;
	}
};
Gibberish.Granulator.prototype = Gibberish._effect;
Gibberish.Sampler = function() {
	var phase = 1,
	    interpolate = Gibberish.interpolate,
	    write = 0,
	    panner = Gibberish.makePanner(),
	    debug = 0 ,
	    shouldLoop = 0,
	    out = [0,0],
      buffer = null,
      bufferLength = 1,
      self = this;
      
	Gibberish.extend(this, {
		name: 			"sampler",
    
		file: 			null,
		isLoaded: 	false,
    playOnLoad :  0,
    
    properties : {
    	pitch:			  1,
  		amp:			    1,
  		isRecording: 	false,
  		isPlaying : 	true,
  		input:	 		  0,
  		length : 		  0,
      start :       0,
      end :         1,
      loops :       0,
      pan :         0,
    },

		_onload : 		function(decoded) {
			buffer = decoded.channels[0]; 
			bufferLength = decoded.length;
					
			self.end = bufferLength;
      self.length = phase = bufferLength;
					
			console.log("LOADED ", self.file, bufferLength);
			Gibberish.audioFiles[self.file] = buffer;
			
      if(self.onload) self.onload();
      
      
      if(self.playOnLoad !== 0) self.note(self.playOnLoad);
      
			self.isLoaded = true;
		},
    
		note: function(pitch, amp) {
			if(typeof amp === 'number') this.amp = amp;
			this.pitch = pitch;
					
			if(this.function !== null) {
				this.isPlaying = true;	// needed to allow playback after recording
				if(pitch > 0) {
          phase = this.start;
				}else{
          phase = this.end;
				}
			}
		},
    
		record : function(input, recordLength) {
      this.isRecording = true;
      
      var self = this;
      
      new Gibberish.Record(input, recordLength, function() {
        buffer = this.getBuffer();
        self.end = bufferLength = buffer.length;
        phase = self.end;
        self.isRecording = false;
      })
      .record(); 
		},
    
    getBuffer : function() {
      return buffer;
    },
    
  	callback :function(_pitch, amp, isRecording, isPlaying, input, length, start, end, loops, pan) {
  		var val = 0;
  		phase += _pitch;				

  		if(phase < end && phase > 0) {
  			if(_pitch > 0) {
					val = buffer !== null && isPlaying ? interpolate(buffer, phase) : 0;
  			}else{
  				if(phase > start) {
  					val = buffer !== null && isPlaying ? interpolate(buffer, phase) : 0;
  				}else{
  					phase = loops ? end : phase;
  				}
  			}
  			return panner(val, pan, out);
  		}
  		phase = loops && _pitch > 0 ? start : phase;
  		phase = loops && _pitch < 0 ? end : phase;
				
  		out[0] = out[1] = val;
  		return out;
  	},
	})
  .init()
  .oscillatorInit()  
  .processProperties(arguments);

	if(typeof arguments[0] !== "undefined") {
		if(typeof arguments[0] === "string") {
      console.log("SETTING FILE");
			this.file = arguments[0];
      delete arguments[0];
			//this.isPlaying = true;
		}else if(typeof arguments[0] === "object") {
			if(arguments[0].file) {
				this.file = arguments[0].file;
				//this.isPlaying = true;
			}
		}
	}
  
  console.log(this);
  		
	/*var _end = 1;
	Object.defineProperty(that, "end", {
		get : function() { return _end; },
		set : function(val) {
			if(val > 1) val = 1;
			_end = val * that.bufferLength - 1;
			Gibberish.dirty(that);
		}
	});
	var _start = 0;
	Object.defineProperty(that, "start", {
		get : function() { return _start; },
		set : function(val) {
			if(val < 0) val = 0;
			_start = val * that.bufferLength - 1;
			Gibberish.dirty(that);
		}
	});
	var _loops = 0;
	Object.defineProperty(that, "loops", {
		get : function() { return _loops; },
		set : function(val) {
			_loops = val;
			that.function.setLoops(_loops);
		}
	});
  */

  
	if(typeof Gibberish.audioFiles[this.file] !== "undefined") {
		buffer =  Gibberish.audioFiles[this.file];
		this.end = this.bufferLength = buffer.length;
    
    phase = this.bufferLength;
    Gibberish.dirty(this);
    
    if(this.onload) this.onload();
	}else if(this.file !== null){
    var request = new AudioFileRequest(this.file);
    request.onSuccess = this._onload;
    request.send();
	}else if(typeof this.buffer !== 'undefined' ) {
		this.isLoaded = true;
					
		buffer = this.buffer;
    this.end = this.bufferLength = buffer.length;
		    
		phase = this.bufferLength;
		if(arguments[0] && arguments[0].loops) {
			this.loops = 1;
		}
    Gibberish.dirty(this);
    
    if(this.onload) this.onload();
	}
};
Gibberish.Sampler.prototype = Gibberish._oscillator;
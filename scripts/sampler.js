// this file is dependent on oscillators.js

/**#Gibberish.Sampler - Oscillator
Sample recording and playback.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Sampler({ file:'resources/snare.wav' }).connect();  
// wait until sample has downloaded  
a.note(2);  
a.note(1);  
a.note(-.5);  
b = new Gibberish.Sampler().connect();  
b.record(a, 88200); // record two seconds of a playing  
a.note(8);  
// wait a bit    
b.note(1);`

## Constructor
###syntax 1  
**param** *filepath*: String. A path to the audiofile to be opened by the sampler.  
###syntax 2    
**param** *properties*: Object. A dictionary of property values (see below) to set for the sampler on initialization.
- - - -
**/
/**###Gibberish.Sampler.pitch : property  
Number. The speed that the sample is played back at. A pitch of 1 means the sample plays forward at speed it was recorded at, a pitch of -4 means the sample plays backwards at 4 times the speed it was recorded at.
**/
/**###Gibberish.Sampler.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.Sampler.playOnLoad : property  
Number. If this value is set to be non-zero, the sampler will trigger a note at the provided pitch as soon as the sample is downloaded. 
**/
/**###Gibberish.Sampler.isRecording : property  
Boolean. Tells the sample to record into it's buffer. This is handled automatically by the object; there is no need to manually set this property.
**/
/**###Gibberish.Sampler.isPlaying : property  
Number. 0..1. Tells the sample to record into it's buffer. This is handled automatically by the object; there is no need to manually set this property.
**/
/**###Gibberish.Sampler.input : property  
Object. The object the sampler is tapping into and recording.
**/
/**###Gibberish.Sampler.length : property  
Number. The length of the Sampler's buffer.
**/
/**###Gibberish.Sampler.start : property  
Number. When the Sampler's note method is called, sample playback begins at this sample.
**/
/**###Gibberish.Sampler.end : property  
Number. When the Sampler's note method is called, sample playback ends at this sample.
**/
/**###Gibberish.Sampler.loops : property  
Boolean. When true, sample playback loops continuously between the start and end property values.
**/
/**###Gibberish.Sampler.pan : property  
Number. -1..1. Position of the Sampler in the stereo spectrum.
**/

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
      self = this,
      count = 0;
      
	Gibberish.extend(this, {
		name: 			"sampler",
    
		file: 			null,
		isLoaded: 	false,
    playOnLoad :  0,
    buffers: {},
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
    
/**###Gibberish.Sampler.onload : method  
This is an event handler that is called when a sampler has finished loading an audio file.
Use this to trigger a set of events upon downloading the sample. 
  
param **buffer** Object. The decoded sampler buffers from the audio file
**/ 
		_onload : 		function(decoded) {
			buffer = decoded.channels[0]; 
			bufferLength = decoded.length;
			self.length = bufferLength
			//self.end = bufferLength;
      self.length = phase = bufferLength;
      self.isPlaying = true;
					
			//console.log("LOADED ", self.file, bufferLength);
			Gibberish.audioFiles[self.file] = buffer;
			self.buffers[ self.file ] = buffer;
      
      if(self.onload) self.onload();
      
      if(self.playOnLoad !== 0) self.note(self.playOnLoad);
      
			self.isLoaded = true;
		},
    
    switchBuffer: function( bufferID ) { // accepts either number or string
      if( typeof bufferID === 'string' ) {
        if( typeof this.buffers[ bufferID ] !== 'undefined' ) {
          buffer = this.buffers[ bufferID ]
          //bufferLength = this.end = this.length = buffer.length
          bufferLength = this.length = buffer.length
        }
      }else if( typeof bufferID === 'number' ){
        var keys = Object.keys( this.buffers )
        if( keys.length === 0 ) return 
        //console.log( "KEY", keys, keys[ bufferID ], bufferID )
        buffer = this.buffers[ keys[ bufferID ] ]
        bufferLength  = this.length = buffer.length
        //this.end( bufferLength )
        this.setPhase( 0 )
        //console.log( bufferLength, this.end, this.length )
      }
    },
    
    floatTo16BitPCM : function(output, offset, input){
      //console.log(output.length, offset, input.length )
      for (var i = 0; i < input.length - 1; i++, offset+=2){
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    },
    encodeWAV : function(){
      //console.log("BUFFER LENGTH" + _buffer.length);
      var _buffer = this.getBuffer(),
          wavBuffer = new ArrayBuffer(44 + _buffer.length * 2),
          view = new DataView(wavBuffer),
          sampleRate = Gibberish.context.sampleRate;
      
      function writeString(view, offset, string){
        for (var i = 0; i < string.length; i++){
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      }

      /* RIFF identifier */
      writeString(view, 0, 'RIFF');
      /* file length */
      view.setUint32(4, 32 + _buffer.length * 2, true);
      /* RIFF type */
      writeString(view, 8, 'WAVE');
      /* format chunk identifier */
      writeString(view, 12, 'fmt ');
      /* format chunk length */
      view.setUint32(16, 16, true);
      /* sample format (raw) */
      view.setUint16(20, 1, true);
      /* channel count */
      view.setUint16(22, 1, true);
      /* sample rate */
      view.setUint32(24, sampleRate, true);
      /* byte rate (sample rate * block align) */
      view.setUint32(28, sampleRate * 4, true);
      /* block align (channel count * bytes per sample) */
      view.setUint16(32, 2, true);
      /* bits per sample */
      view.setUint16(34, 16, true);
      /* data chunk identifier */
      writeString(view, 36, 'data');
      /* data chunk length */
      view.setUint32(40, _buffer.length * 2, true);

      this.floatTo16BitPCM(view, 44, _buffer);

      return view;
    },
/**###Gibberish.Sampler.download : method  
Download the sampler buffer as a .wav file. In conjunction with the record method, this enables the Sampler
to record and downlaod Gibberish sessions.
**/  
    download : function() {
      var blob = this.encodeWAV();
      var audioBlob = new Blob( [ blob ] );

      var url =  window.webkitURL.createObjectURL( audioBlob );
      var link = window.document.createElement('a');
      link.href = url;
      link.download = 'output.wav';
      
      var click = document.createEvent("Event");
      click.initEvent("click", true, true);
      
      link.dispatchEvent(click);
    },

/**###Gibberish.Sampler.note : method  
Trigger playback of the samplers buffer
  
param **pitch** Number. The speed the sample is played back at.  
param **amp** Number. Optional. The volume to use.
**/   

/**###Gibberish.Sampler.range : method  
Set the start and end points in a single method call
  
param **start** Number. The start point for sample playback, 0..1
param **end** Number. The end point for sample playback, 0..1
**/  
    range: function( start, end ) {
      if( Array.isArray( start ) ) {
        end = start[1]
        start = start[0] 
      }
      
      if( end < start ) {
        var tmp = start
        start = end
        end = tmp
      }
      
      this.start = start
      this.end = end
    },

		note: function(pitch, amp) {
      if( typeof pitch === 'undefined' ) return

      switch( typeof pitch ) {
        case 'number' :
          this.pitch = pitch
          break;
        case 'function' :
          this.pitch = pitch()
          break;
        case 'object' :
          if( Array.isArray(pitch) ) {
            this.pitch = pitch[ 0 ]
          }else{
            this.pitch = pitch
          }
          break;
      }
      // if(typeof this.pitch === 'number' || typeof this.pitch === 'function' ){
      //   this.pitch = pitch;
      // }else if(typeof this.pitch === 'object'){
      //   this.pitch[0] = pitch;
      //   Gibberish.dirty(this);
      // }
      
			if(typeof amp === 'number') this.amp = amp;
			
			if(this.function !== null) {
				this.isPlaying = true;	// needed to allow playback after recording
        
        var __pitch;// = typeof this.pitch === 'number' || typeof this.pitch === 'function' ? this.pitch : this.pitch[0];  // account for modulations
                
        switch( typeof this.pitch ) {
          case 'number' :
            __pitch = this.pitch
            break;
          case 'function' :
            __pitch = this.pitch.getValue ? this.pitch.getValue() : this.pitch()
            break;
          case 'object' :
            if( Array.isArray( this.pitch ) ) {
              __pitch = this.pitch[ 0 ]
            } else {
              __pitch = this.pitch.getValue ? this.pitch.getValue() : this.pitch.input.getValue()              
            }
            
            if( typeof __pitch === 'function' ) __pitch = __pitch()
            
            break;
        }
        
        //         if( __pitch > 0 ) { //|| typeof __pitch === 'object' || typeof this.pitch === 'function' ) {
        //           phase = this.start;
        // }else{
        //           phase = this.end;
        // }
        phase = 0
        
        Gibberish.dirty( this )
        
        //this.pitch = __pitch;
			}
		},
/**###Gibberish.Sampler.record : method  
Record the output of a Gibberish ugen for a given amount of time
  
param **ugen** Object. The Gibberish ugen to be recorded.
param **recordLength** Number (in samples). How long to record for.
**/     
    // record : function(input, recordLength) {
    //       this.isRecording = true;
    //       
    //       var self = this;
    //       
    //       this.recorder = new Gibberish.Record(input, recordLength, function() {
    //         self.setBuffer( this.getBuffer() );
    //         self.end = bufferLength = self.getBuffer().length;
    //         self.setPhase( self.end )
    //         self.isRecording = false;
    //       })
    //       .record();
    //       
    //       return this;
    // },

/**###Gibberish.Sampler.getBuffer : method  
Returns a pointer to the Sampler's internal buffer.  
**/
    getBuffer : function() { return buffer; },
    setBuffer : function(b) { buffer = b },
    getPhase : function() { return phase },
    setPhase : function(p) { phase = p },
    getNumberOfBuffers: function() { return Object.keys( self.buffers ).length - 1 },
    
/**###Gibberish.Sampler.callback : method  
Return a single sample. It's a pretty lengthy method signature, they are all properties that have already been listed:  

_pitch, amp, isRecording, isPlaying, input, length, start, end, loops, pan
**/    
  	callback :function(_pitch, amp, isRecording, isPlaying, input, length, start, end, loops, pan) {
  		var val = 0, startInSamples = start * length, endInSamples = end * length;
  		phase += _pitch;
      
      // if( count++ % 44100 === 0 ) console.log( _pitch, startInSamples, endInSamples )
      
      if( buffer !== null && isPlaying ) {
        if( _pitch > 0 ) {
          if( startInSamples + phase < endInSamples ) {
            val = interpolate( buffer, startInSamples + phase )
          }else{
            if( loops ) phase = 0
          }
        }else{
          if( endInSamples + phase > startInSamples ) {
            val = interpolate( buffer, endInSamples + phase )
          }else{
            if( loops ) phase = 0
          }
        }
        
        return panner( val * amp, pan, out )
      }
	
  		out[0] = out[1] = val;
  		return out;
  	},
	})
  .init()
  .oscillatorInit()
  .processProperties(arguments);
  
	if(typeof arguments[0] !== "undefined") {
		if(typeof arguments[0] === "string") {
			this.file = arguments[0];
      this.pitch = 0;
			//this.isPlaying = true;
		}else if(typeof arguments[0] === "object") {
			if(arguments[0].file) {
				this.file = arguments[0].file;
				//this.isPlaying = true;
			}
		}
	}
  
  //console.log(this);
  		
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
		this.end = 1;
		this.buffers[ this.file ] = buffer;
    
    this.length = phase = this.bufferLength = buffer.length;
    Gibberish.dirty(this);
    
    if(this.onload) this.onload();
	}else if(this.file !== null){
    var xhr = new XMLHttpRequest(), initSound
        
    xhr.open( 'GET', this.file, true )
    xhr.responseType = 'arraybuffer'
    xhr.onload = function( e ) { initSound( this.response ) }
    xhr.send()
    
    //console.log("now loading sample", self.file )
    xhr.onerror = function( e ) { console.error( "Sampler file loading error", e )}
    
    initSound = function( arrayBuffer ) {
      Gibberish.context.decodeAudioData(arrayBuffer, function(_buffer) {
        buffer = _buffer.getChannelData(0)
        // self.length = phase = self.end = bufferLength = buffer.length
        self.length = phase = bufferLength = buffer.length
        self.isPlaying = true;
  			self.buffers[ self.file ] = buffer;

        //console.log("sample loaded | ", self.file, " | length | ", bufferLength);
  			Gibberish.audioFiles[self.file] = buffer;
			
        if(self.onload) self.onload();
      
        if(self.playOnLoad !== 0) self.note( self.playOnLoad );
      
  			self.isLoaded = true;
      }, function(e) {
        console.log('Error decoding file', e);
      }); 
    }
	}else if(typeof this.buffer !== 'undefined' ) {
		this.isLoaded = true;
					
		buffer = this.buffer;
    //this.end = this.bufferLength = buffer.length || 88200;
    this.bufferLength = buffer.length || 88200;
		    
		phase = this.bufferLength;
		if(arguments[0] && arguments[0].loops) {
			this.loops = 1;
		}
    Gibberish.dirty(this);
    
    if(this.onload) this.onload();
	}
};
Gibberish.Sampler.prototype = Gibberish._oscillator;
Gibberish.Sampler.prototype.record = function(input, recordLength) {
  this.isRecording = true;
  
  var self = this;
  
  this.recorder = new Gibberish.Record(input, recordLength, function() {
    self.setBuffer( this.getBuffer() );
    bufferLength = self.getBuffer().length;
    self.setPhase( self.end )
    self.isRecording = false;
  })
  .record();
  
  return this;
};

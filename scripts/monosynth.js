/**#Gibberish.MonoSynth - Synth
A three oscillator monosynth for bass and lead lines. You can set the octave and tuning offsets for oscillators 2 & 3. There is a 24db filter and an envelope controlling
both the amplitude and filter cutoff.
## Example Usage##
`  
t = new Gibberish.Mono({  
	cutoff:0,  
	filterMult:.5,  
	attack:_8,  
	decay:_8,  
	octave2:-1,  
	octave3:-1,  
	detune2:.01,  
	glide:_12,  
}).connect();  
t.note("C3");  `
## Constructors
  param **arguments** : Object. A dictionary of property values to set upon initialization. See the properties section and the example usage section for details.
**/
/**###Gibberish.MonoSynth.waveform : property
String. The primary oscillator to be used. Can currently be 'Sine', 'Square', 'Noise', 'Triangle' or 'Saw'. 
**/
/**###Gibberish.MonoSynth.attack : property
Integer. The length, in samples, of the attack of the amplitude envelope.
**/
/**###Gibberish.MonoSynth.decay : property
Integer. The length, in samples, of the decay of the amplitude envelope.
**/
/**###Gibberish.MonoSynth.amp : property
Float. The peak amplitude of the synth, usually between 0..1
**/
/**###Gibberish.MonoSynth.cutoff : property
Float. The frequency cutoff for the synth's filter. Range is 0..1.
**/
/**###Gibberish.MonoSynth.filterMult : property
Float. As the envelope on the synth progress, the filter cutoff will also change by this amount * the envelope amount.
**/
/**###Gibberish.MonoSynth.resonance : property
Float. The emphasis placed on the filters cutoff frequency. 0..50, however, GOING OVER 5 IS DANGEROUS TO YOUR EARS (ok, maybe 6 is all right...)
**/
/**###Gibberish.MonoSynth.octave2 : property
Integer. The octave difference between oscillator 1 and oscillator 2. Can be positive (higher osc2) or negative (lower osc 2) or 0 (same octave).
**/
/**###Gibberish.MonoSynth.detune2 : property
Float. The amount, from -1..1, the oscillator 2 is detuned. A value of -.5 means osc2 is half an octave lower than osc1. A value of .01 means osc2 is .01 octaves higher than osc1.
**/
/**###Gibberish.MonoSynth.octave3 : property
Integer. The octave difference between oscillator 1 and oscillator 3. Can be positive (higher osc3) or negative (lower osc 3) or 0 (same octave).
**/
/**###Gibberish.MonoSynth.detune3 : property
Float. The amount, from -1..1, the oscillator 3 is detuned. A value of -.5 means osc3 is half an octave lower than osc1. A value of .01 means osc3 is .01 octaves higher than osc1.
**/
/**###Gibberish.MonoSynth.glide : property
Integer. The length in time, in samples, to slide in pitch from one note to the next.
**/
Gibberish.MonoSynth = function() {  
	Gibberish.extend(this, { 
    name:       'monosynth',
    
    properties: {
  		attack:			10000,
  		decay:			10000,
  		cutoff:			.2,
  		resonance:	2.5,
  		amp1:			  1,
  		amp2:			  1,
  		amp3:			  1,
  		filterMult:	.3,
  		isLowPass:	true,
      pulsewidth: .5,
  		amp:		    .6,
  		detune2:		.01,
  		detune3:		-.01,
  		octave2:		1,
  		octave3:		-1,
      glide:      0,
  		pan:			  0,
      velocity:   1,
  		frequency:	0,
      channels:   2,
    },
    
		waveform:		"Saw3",
/**###Gibberish.MonoSynth.note : method
param **note or frequency** : String or Integer. You can pass a note name, such as "A#4", or a frequency value, such as 440.
param **amp** : Optional. Float. The volume of the note, usually between 0..1. The main amp property of the Synth will also affect note amplitude.
**/				
		note : function(_frequency, velocity) {
      if( typeof _frequency === 'undefined' ) return

      if(typeof velocity !== 'undefined' && velocity !== 0) this.velocity = velocity;
      
      if( velocity !== 0 ) {
    		if(typeof this.frequency !== 'object'){
      
          this.frequency = _frequency;
        }else{
          this.frequency[0] = _frequency;
          Gibberish.dirty(this);
        }
        
  			if(envstate() > 0 ) _envelope.run();
      }
		},
  	/*
    note : function(frequency, velocity) {
      if( typeof frequency === 'undefined' ) return
        
  		if(typeof this.frequency !== 'object'){
        if( useADSR && frequency === lastFrequency && velocity === 0) {
          this.releaseTrigger = 1;
          lastFrequency = null
          return;
        }
        if( velocity !== 0 ) {
          this.frequency = lastFrequency = frequency;
        }
        this.releaseTrigger = 0;
      }else{
        if( velocity !== 0 ) {
          this.frequency[0] = lastFrequency = frequency;
        }
        this.releaseTrigger = 0;
        Gibberish.dirty(this);
      }
					
  		if(typeof velocity !== 'undefined' && velocity !== 0) this.velocity = velocity;
	  
      if( velocity !== 0 ) { _envelope.run(); }
  	},
    */
	});
  
	var waveform = waveform1 = waveform2 = waveform3 = this.waveform;
	Object.defineProperty(this, "waveform", {
		get: function() { return waveform; },
		set: function(value) {
			if(waveform !== value) {
				waveform = value;
						
				osc1 = new Gibberish[ value ]().callback;
				osc2 = new Gibberish[ value ]().callback;
				osc3 = new Gibberish[ value ]().callback;
			}
		},
	});
  
  Object.defineProperties( this, {
    waveform1: {
      get: function() { return waveform1 },
      set: function(v) { waveform1 = v; osc1 = new Gibberish[ v ]().callback; }
    },
    waveform2: {
      get: function() { return waveform2 },
      set: function(v) { waveform2 = v; osc2 = new Gibberish[ v ]().callback; }
    },
    waveform3: {
      get: function() { return waveform3 },
      set: function(v) { waveform3 = v; osc3 = new Gibberish[ v ]().callback; }
    },
  })
  
  
	var _envelope = new Gibberish.AD(this.attack, this.decay),
      envstate  = _envelope.getState,
      envelope  = _envelope.callback,
      filter    = new Gibberish.Filter24().callback,
    	osc1      = new Gibberish[this.waveform](this.frequency,  this.amp1).callback,
    	osc2      = new Gibberish[this.waveform](this.frequency2, this.amp2).callback,
    	osc3      = new Gibberish[this.waveform](this.frequency3, this.amp3).callback,
      lag       = new Gibberish.OnePole().callback,      
    	panner    = Gibberish.makePanner(),
    	out       = [0,0];
  
  this.envelope = _envelope
  
  this.callback = function(attack, decay, cutoff, resonance, amp1, amp2, amp3, filterMult, isLowPass, pulsewidth, masterAmp, detune2, detune3, octave2, octave3, glide, pan, velocity, frequency, channels) {
		if(envstate() < 2) {
      if(glide >= 1) glide = .9999;
      frequency = lag(frequency, 1-glide, glide);
      
			var frequency2 = frequency;
			if(octave2 > 0) {
				for(var i = 0; i < octave2; i++) {
					frequency2 *= 2;
				}
			}else if(octave2 < 0) {
				for(var i = 0; i > octave2; i--) {
					frequency2 /= 2;
				}
			}
					
			var frequency3 = frequency;
			if(octave3 > 0) {
				for(var i = 0; i < octave3; i++) {
					frequency3 *= 2;
				}
			}else if(octave3 < 0) {
				for(var i = 0; i > octave3; i--) {
					frequency3 /= 2;
				}
			}
				
			frequency2 += detune2 > 0 ? ((frequency * 2) - frequency) * detune2 : (frequency - (frequency / 2)) * detune2;
			frequency3 += detune3 > 0 ? ((frequency * 2) - frequency) * detune3 : (frequency - (frequency / 2)) * detune3;
							
			var oscValue = osc1(frequency, amp1, pulsewidth) + osc2(frequency2, amp2, pulsewidth) + osc3(frequency3, amp3, pulsewidth);
			var envResult = envelope(attack, decay) * velocity;
			var val = filter( oscValue, cutoff + filterMult * envResult, resonance, isLowPass, 1) * envResult;
			val *= masterAmp;
			out[0] = out[1] = val;
			return channels === 1 ? out : panner(val, pan, out);
		}else{
			out[0] = out[1] = 0;
			return out;
		}
	}; 
  
  this.init();
  this.oscillatorInit();     
	this.processProperties(arguments);
};
Gibberish.MonoSynth.prototype = Gibberish._synth; 

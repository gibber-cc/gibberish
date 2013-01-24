Gibberish.FMSynth = function(properties) {
	this.name =	"fmSynth";

	this.properties = {
	  frequency:0,
	  cmRatio:	2,
	  index:		5,			
	  attack:		22050,
	  decay:		22050,
    glide:    .15,
    amp:		  .25,
    channels: 2,
	  pan:		  0,
  };
    
	this.note = function(frequency, amp) {
		this.frequency = frequency;
    _frequency = frequency;
					
		if(typeof amp !== 'undefined') this.amp = amp;
					
    _envelope.run();
	};
  
	var _envelope   = new Gibberish.AD(),
      envstate    = _envelope.getState,
      envelope    = _envelope.callback,
	    carrier     = new Gibberish.Sine().callback,
	    modulator   = new Gibberish.Sine().callback,
      lag         = new Gibberish.OnePole().callback,
    	panner      = Gibberish.makePanner(),
    	out         = [0,0];

  this.callback = function(frequency, cmRatio, index, attack, decay, glide, amp, channels, pan) {    
		if(envstate() < 2) {				
      if(glide >= 1) glide = .9999;
      frequency = lag(frequency, 1-glide, glide);
      
			var env = envelope(attack, decay);
			var mod = modulator(frequency * cmRatio, frequency * index, 1, 1) * env;
			var val = carrier( frequency + mod, 1, 1 ) * env * amp;

			out[0] = out[1] = val;
      
			return channels === 1 ? val : panner(val, pan, out);
    }else{
		  val = out[0] = out[1] = 0;
      return channels === 1 ? val : panner(val, pan, out);
    }
	};
  
  this.init();
  this.oscillatorInit();
	this.processProperties(arguments);
};
Gibberish.FMSynth.prototype = Gibberish._synth;

Gibberish.PolyFM = function() {
  this.__proto__ = new Gibberish.Bus2();
  
	Gibberish.extend(this, {
    name:     "polyfm",
		maxVoices:		5,
		voiceCount:		0,
    children: [],
    
    polyProperties : {
  		glide:			0,
      attack: 22050,
      decay:  22050,
      index:  5,
      cmRatio:2,
    },
				
		note : function(_frequency, amp) {
			var synth = this.children[this.voiceCount++];
			if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
			synth.note(_frequency, amp);
		},
	});    
  this.amp = 1 / this.maxVoices;
  	
	this.processProperties(arguments);

	for(var i = 0; i < this.maxVoices; i++) {
		var props = {
			attack: 	this.attack,
			decay:		this.decay,
			cmRatio:	this.cmRatio,
			index:		this.index,
      channels: 2,
			amp: 		  1,
		};
		var synth = new Gibberish.FMSynth(props);
		synth.connect(this);

		this.children.push(synth);
	}
  
  Gibberish.polyInit(this);
  Gibberish._synth.oscillatorInit.call(this);
};
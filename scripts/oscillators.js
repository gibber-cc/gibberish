Gibberish.oscillator = function() {
  this.type = 'oscillator';
  
  this.oscillatorInit = function() {
    this.fx = new Array2; 
    this.fx.parent = this;
    
    return this;
  }
};
Gibberish.oscillator.prototype = new Gibberish.ugen();
Gibberish._oscillator = new Gibberish.oscillator();

Gibberish.Sine = function() {
  this.name = 'sine';
      
  this.properties = {
    frequency : arguments[0] || 440,
    amp :       arguments[1] || .5,
  };
    
  var pi_2 = Math.PI * 2, 
      sin  = Math.sin,
      phase = 0;
  
  this.callback = function(frequency, amp) { 
    phase += frequency / 44100;
    return sin( phase * pi_2) * amp;
  };
    
  this.init(arguments);
  this.oscillatorInit();
};
Gibberish.Sine.prototype = Gibberish._oscillator;

Gibberish.Sine2 = function() {
  this.__proto__ = new Gibberish.Sine();
  this.name = "sine2";
  
  this.defineUgenProperty('pan', 0);
  
  var sine = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];
  
  this.callback = function(frequency, amp, pan) {
    var out = sine(frequency, amp);
    output = panner(out, pan, output);
    return output;
  }

  this.init();
};

Gibberish.Saw = function() {
  this.name = "saw",
  this.properties = { frequency: 440, amp: .15 };

  var phase = 0;
  // from audiolet https://github.com/oampo/Audiolet/blob/master/src/dsp/Saw.js
  this.callback = function(frequency, amp) {
    var out = ((phase / 2 + 0.25) % 0.5 - 0.25) * 4;
	  out *= amp;
    phase += frequency / 44100;
    phase = phase > 1 ? phase % 1 : phase;

    return out;
  };
    
  this.init();
  this.oscillatorInit();
};
Gibberish.Saw.prototype = Gibberish._oscillator;

Gibberish.Saw2 = function() {
  this.__proto__ = new Gibberish.Saw();
  this.name = "saw2";
  
  this.defineUgenProperty('pan', 0);
  
  var saw = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];
  
  this.callback = function(frequency, amp, pan) {
    var out = saw(frequency, amp);
    output = panner(out, pan, output);
    return output;
  };

  this.init();
};

Gibberish.Triangle = function(){
  var phase = 0,
      abs = Math.abs;
  
  Gibberish.extend(this, {
    name: "triangle",
    properties: { frequency: 440, amp: .15 },

    callback: function(frequency, amp, channels, pan ) {
	    var out = 1 - 4 * abs((phase + 0.25) % 1 - 0.5);
  		out *= amp;
	    phase += frequency / 44100;
	    phase = phase > 1 ? phase % 1 : phase;
  		return out;
    },
  })
  .init()
  .oscillatorInit();
};
Gibberish.Triangle.prototype = Gibberish._oscillator;

Gibberish.Triangle2 = function() {
  this.__proto__ = new Gibberish.Triangle();
  this.name = "triangle2";
  
  this.defineUgenProperty('pan', 0);
  
  var triangle = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];
  
  this.callback = function(frequency, amp, pan) {
    var out = triangle(frequency, amp);
    return panner(out, pan, output);
  };

  this.init();
};

// fm feedback band-limited saw ported from this paper: http://scp.web.elte.hu/papers/synthesis1.pdf
Gibberish.Saw3 = function() {
  var osc = 0,
      phase = 0,
      a0 = 2.5,
      a1 = -1.5,
      history = 0,
      sin = Math.sin,
      scale = 11;
      pi_2 = Math.PI * 2;
      
  Gibberish.extend(this, {
    name: 'saw',
    properties : {
      frequency: 440,
      amp: .15,
    },
    callback : function(frequency, amp) {
      var w = frequency / 44100,
          n = .5 - w,
          scaling = scale * n * n * n * n,
          DC = .376 - w * .752,
          norm = 1 - 2 * w,
          out = 0;
          
      phase += w;
      phase -= phase > 1 ? 2 : 0;
      
      osc = (osc + sin(pi_2 * (phase + osc * scaling))) * .5;
      out = a0 * osc + a1 * history;
      history = osc;
      out += DC;
      
      return out * norm;
    }
  });
  
  Object.defineProperty(this, 'scale', {
    get : function() { return scale; },
    set : function(val) { scale = val; }
  });
  
  this.init();
  this.oscillatorInit();
  
}
Gibberish.Saw3.prototype = Gibberish._oscillator;

Gibberish.PWM = function() {
  var osc = 0,
      osc2= 0,
      _osc= 0,
      _osc2=0,
      phase = 0,
      a0 = 2.5,
      a1 = -1.5,
      history = 0,
      sin = Math.sin,
      scale = 11;
      pi_2 = Math.PI * 2,
      test = 0;

  Gibberish.extend(this, {
    name: 'pwm',
    properties : {
      frequency: 440,
      amp: .15,
      pulsewidth: .5,
    },
    
    callback : function(frequency, amp, pulsewidth) {
      var w = frequency / 44100,
          n = .5 - w,
          scaling = scale * n * n * n * n,
          DC = .376 - w * .752,
          norm = 1 - 2 * w,
          out = 0;
          
      phase += w;
      phase -= phase > 1 ? 2 : 0;
      
      osc = (osc  + sin( pi_2 * (phase + osc  * scaling ) ) ) * .5;
      osc2 =(osc2 + sin( pi_2 * (phase + osc2 * scaling + pulsewidth) ) ) * .5;
      out = osc2 - osc;
      
      out = a0 * out + a1 * (_osc - _osc2);
      _osc = osc;
      _osc2 = osc2;

      return out * norm * amp;
    },
  });
  
  Object.defineProperty(this, 'scale', {
    get : function() { return scale; },
    set : function(val) { scale = val; }
  });
  
  this.init();
  this.oscillatorInit();
};
Gibberish.PWM.prototype = Gibberish._oscillator;

Gibberish.Noise = function() {
  var rnd = Math.random;
  
  Gibberish.extend(this, {
    name:'noise',
    properties: {
      amp:1,
    },
    
    callback : function(amp){ 
      return rnd() * 2 - 1;
    },
  });
  
  this.init();
  this.oscillatorInit();
};
Gibberish.Noise.prototype = Gibberish._oscillator;

Gibberish.KarplusStrong = function() {
  var phase   = 0,
      buffer  = [0],
      last    = 0,
      rnd     = Math.random,
      panner  = Gibberish.makePanner(),
      out     = [0,0];
      
  Gibberish.extend(this, {
    name:"karplus_strong",
    
    properties: { blend:1, damping:0, amp:1, channels:2, pan:0  },
  
    note : function(frequency) {
      var _size = Math.floor(44100 / frequency);
      buffer.length = 0;
    
      for(var i = 0; i < _size; i++) {
        buffer[i] = Math.random() * 2 - 1; // white noise
      }
    },

    callback : function(blend, damping, amp, channels, pan) { 
      var val = buffer.shift();
      var rndValue = (rnd() > blend) ? -1 : 1;
				
  	  damping = damping > 0 ? damping : 0;
				
      var value = rndValue * (val + last) * (.5 - damping / 100);

      last = value;

      buffer.push(value);
				
      value *= amp;
      return channels === 1 ? value : panner(value, pan, out);
    },
  })
  .init()
  .oscillatorInit();
};
Gibberish.KarplusStrong.prototype = Gibberish._oscillator;

Gibberish.PolyKarplusStrong = function() {
  this.__proto__ = new Gibberish.Bus2();
  
  Gibberish.extend(this, {
    name:     "poly_karplus_strong",
    maxVoices:    5,
    voiceCount:   0,
    
    polyProperties : {
  		blend:			1,
      damping:    0,
    },
        
    note : function(_frequency, amp) {
      var synth = this.children[this.voiceCount++];
      if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
      synth.note(_frequency, amp);
    },
  });
  
  this.amp = 1 / this.maxVoices;
  this.processProperties(arguments);
  
  this.children = [];
  
  this.dirty = true;
  for(var i = 0; i < this.maxVoices; i++) {
    var props = {
      blend:   this.blend,
      damping:    this.damping,
      channels: 2,
      amp:      1,
    };
    var synth = new Gibberish.KarplusStrong(props).connect(this);

    this.children.push(synth);
  }
  
  Gibberish.polyInit(this);
  Gibberish._synth.oscillatorInit.call(this);
};
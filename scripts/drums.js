Gibberish.Kick = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF().callback,
    	lpf = new Gibberish.SVF().callback,
      _decay = .2,
      _tone = .8;
      
  Gibberish.extend(this, {
  	name:		"kick",
    properties:	{ pitch:50, __decay:20, __tone: 1000, amp:2, sr: Gibberish.context.sampleRate },
	
  	callback: function(pitch, decay, tone, amp, sr) {					
  		var out = trigger ? 60 : 0;
			
  		out = bpf( out, pitch, decay, 2, sr );
  		out = lpf( out, tone, .5, 0, sr );
		
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, d, t, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof d === 'number') this.decay = d;
  		if(typeof t === 'number') this.tone = t;
  		if(typeof amp === 'number') this.amp = amp;
		
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();
  
  Object.defineProperties(this, {
    decay :{
      get: function() { return _decay; },
      set: function(val) { _decay = val > 1 ? 1 : val; this.__decay = _decay * 100; }
    },
    tone :{
      get: function() { return _tone; },
      set: function(val) { _tone = val > 1 ? 1 : val; this.__tone = 220 + val * 1400;  }
    },
  });
  
  this.processProperties(arguments);
};
Gibberish.Kick.prototype = Gibberish._oscillator;

// congas are bridged t-oscillators like kick without the low-pass filter
Gibberish.Conga = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF().callback,
      _decay = .5;
      
  Gibberish.extend(this, {
  	name:		"conga",
    properties:	{ pitch:190, /*__decay:50,*/ amp:2, sr:Gibberish.context.sampleRate },
	
  	callback: function(pitch, /*decay,*/ amp, sr) {					
  		var out = trigger ? 60 : 0;
			
  		out = bpf( out, pitch, 50, 2, sr );
		
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof amp === 'number') this.amp = amp;
		
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();

  // Object.defineProperties(this, {
  //   decay :{
  //     get: function() { return _decay; },
  //     set: function(val) { _decay = val > 1 ? 1 : val; this.__decay = _decay * 100; }
  //   }
  // });
  // 
  this.processProperties(arguments);
}
Gibberish.Conga.prototype = Gibberish._oscillator;

// clave are also bridged t-oscillators like kick without the low-pass filter
Gibberish.Clave = function() {
  var trigger = false,
    	_bpf = new Gibberish.SVF(),
      bpf = _bpf.callback,
      _decay = .5;
      
  Gibberish.extend(this, {
  	name:		"clave",
    properties:	{ pitch:2500, /*__decay:50,*/ amp:1, sr:Gibberish.context.sampleRate },
	
  	callback: function(pitch, /*decay,*/ amp, sr) {					
  		var out = trigger ? 2 : 0;
			
  		out = bpf( out, pitch, 5, 2, sr );
		
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof amp === 'number') this.amp = amp;
		
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();
  
  this.bpf = _bpf;
  // Object.defineProperties(this, {
  //   decay :{
  //     get: function() { return _decay; },
  //     set: function(val) { _decay = val > 1 ? 1 : val; this.__decay = _decay * 100; }
  //   }
  // });
  // 
  this.processProperties(arguments);
}
Gibberish.Clave.prototype = Gibberish._oscillator;

// tom is tbridge with lpf'd noise
Gibberish.Tom = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF().callback,
    	lpf = new Gibberish.SVF().callback,
      _eg = new Gibberish.ExponentialDecay(),
      eg  = _eg.callback,
      rnd = Math.random,
      _decay = .2,
      _tone = .8;
      
  Gibberish.extend(this, {
  	name:		"tom",
    properties:	{ pitch:80, amp:.5, sr:Gibberish.context.sampleRate },
	
  	callback: function(pitch, amp, sr) {					
  		var out = trigger ? 60 : 0,
          noise;
			
  		out = bpf( out, pitch, 30, 2, sr );
      
      noise = rnd() * 16 - 8
		  noise = noise > 0 ? noise : 0;
      
      noise *= eg(.05, 11025);
      
  		noise = lpf( noise, 120, .5, 0, sr );
      
      out += noise;
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof amp === 'number') this.amp = amp;
		  
      _eg.trigger();
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();
  
  _eg.trigger(1)
  
  this.processProperties(arguments);
}
Gibberish.Tom.prototype = Gibberish._oscillator;

Gibberish.Clap = function() {
  var _bpf = new Gibberish.Biquad(),
      bpf  = _bpf.callback,
      _bpf2 = new Gibberish.Biquad(),
      bpf2 = _bpf2.callback,
      _bpf3 = new Gibberish.Biquad(),
      bpf3 = _bpf3.callback,      
      _eg = new Gibberish.ExponentialDecay(),
      eg  = _eg.callback,
      _eg2 = new Gibberish.ExponentialDecay(),
      eg2 = _eg2.callback,
      _ad  = new Gibberish.Line(),
      ad = _ad.callback,
      _lfo = new Gibberish.Saw(),
      lfo = _lfo.callback,
      rnd = Math.random,
      cutoff = 1000,
      rez = 2.5,
      env1K = .025,
      env2K = .9,
      env1Dur = 30 * 44.1,
      env2Dur = 660,
      freq = 100
      
  _bpf.mode = _bpf2.mode = 'BP'
  _bpf3.mode = 'BP'
  _bpf3.cutoff = 2400
  
  _bpf.cutoff = _bpf2.cutoff = 1000
  _bpf.Q = 2
  _bpf2.Q = 1
      
  Gibberish.extend(this, {
  	name:		"clap",
    properties:	{ amp:.5, sr:Gibberish.context.sampleRate },
	
  	callback: function( amp, sr ) {
  		var out = 0, noiseBPF, noise, env;
			      
      noiseBPF = rnd() * 4 - 2 //* 4 - 2
		  noiseBPF = noiseBPF > 0 ? noiseBPF : 0;
      
      noise = rnd() * 4 - 2 //* 16 - 8
		  noise = noise > 0 ? noise : 0;
      
  		out = bpf2( bpf( noiseBPF ) ) //, cutoff, rez, 2, sr ); // mode 2 is bp
      
      out *= eg2( env2K, env2Dur )
      
      noise = bpf3( lfo( freq, noise ) * eg( env1K, env1Dur ) )//ad( 1,0, env1Dur, false ) );
      
      out += noise;
  		out *= amp;
		
  		return out;
  	},

  	note : function( amp ) {
  		if(typeof amp === 'number') this.amp = amp;
		  
      _eg2.trigger();
      _eg.trigger();
      _ad.setPhase(0);
      _lfo.setPhase(0);

  	},
  })
  .init()
  .oscillatorInit();
  
  // _eg.trigger(1)
  // _eg2.trigger(1)
  
  this.getBPF = function() { return _bpf; }
  this.getBPF2 = function() { return _bpf2; }
  this.getBPF3 = function() { return _bpf3; }
  this.getLine = function() { return _ad; }
  
  this.setEnvK = function( k1,k2,d1,d2 ) {
    env1K = k1
    if( k2 ) env2K = k2
    if( d1 ) env1Dur = d1
    if( d2 ) env2Dur = d2    
  }
  
  this.setFreq = function(v) { freq = v }
  
  this.setRez = function(v) { rez = v; }
  this.setCutoff = function(v) { cutoff = v; }  
  
  this.processProperties(arguments);
}
Gibberish.Clap.prototype = Gibberish._oscillator;

// http://www.soundonsound.com/sos/Sep02/articles/synthsecrets09.asp
Gibberish.Cowbell = function() {
  var _s1 = new Gibberish.Square(),
      _s2 = new Gibberish.Square(),
      s1 = _s1.callback,
      s2 = _s2.callback,                              

      _bpf = new Gibberish.SVF({ mode:2 }),
      bpf   = _bpf.callback,

      _eg   = new Gibberish.ExponentialDecay( .0025, 10500 ),
      eg    = _eg.callback;
  
  Gibberish.extend(this, {
  	name: "cowbell",
  	properties : { amp: 1, pitch: 560, bpfFreq:1000, bpfRez:3, decay:22050, decayCoeff:.0001, sr:Gibberish.context.sampleRate },
	
  	callback : function(amp, pitch, bpfFreq, bpfRez, decay, decayCoeff, sr) {
  		var val;
      
  		val =  s1( pitch, 1, 1, 0 );
  		val += s2( 845, 1, 1, 0 );
		
      val  = bpf(  val, bpfFreq, bpfRez, 2, sr );
      		
      val *= eg(decayCoeff, decay);
  
  		val *= amp;
		  
  		return val;
  	},
	
  	note : function(_decay, _decay2) {
      _eg.trigger()
  		if(_decay)
  			this.decay = _decay;
  	}
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
  
  this.bpf = _bpf;
  this.eg = _eg;
  
  _eg.trigger(1);
};
Gibberish.Cowbell.prototype = Gibberish._oscillator;

Gibberish.Snare = function() {
  var bpf1      = new Gibberish.SVF().callback,
      bpf2      = new Gibberish.SVF().callback,
      noiseHPF  = new Gibberish.SVF().callback,
      _eg       = new Gibberish.ExponentialDecay( .0025, 11025 ),
      eg        = _eg.callback,            
      rnd       = Math.random,
      phase  = 11025,      
      out    = 0,
      envOut = 0;
      
  Gibberish.extend(this, {
  	name: "snare",
  	properties: { cutoff:1000, decay:11025, tune:0, snappy:.5, amp:1, sr:Gibberish.context.sampleRate },

  	callback: function(cutoff, decay, tune, snappy, amp, sr) {
  		var p1, p2, noise = 0, env = 0, out = 0;

  		env = eg(.0025, decay);
		
  		if(env > .005) {	
  			out = ( rnd() * 2 - 1 ) * env ;
  			out = noiseHPF( out, cutoff + tune * 1000, .5, 1, sr );
  			out *= snappy;
        
        // rectify as per instructions found here: http://ericarcher.net/devices/tr808-clone/
        out = out > 0 ? out : 0;
        
  			envOut = env;
			
  			p1 = bpf1( envOut, 180 * (tune + 1), 15, 2, sr );
  			p2 = bpf2( envOut, 330 * (tune + 1), 15, 2, sr );
		
  			out += p1; 
  			out += p2 * .8;
  			out *= amp;
  		}

  		return out;
  	},

  	note : function(t, amp, s, c) {
      if(typeof t === 'number')   this.tune = t;					      
  		if(typeof c === 'number')   this.cutoff = c;					
  		if(typeof s === 'number')   this.snappy = s; 
  		if(typeof amp === 'number') this.amp = amp;
		
  		_eg.trigger()
  	},
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
  
  _eg.trigger(1);
}
Gibberish.Snare.prototype = Gibberish._oscillator;

Gibberish.Hat = function() {
  var _s1 = new Gibberish.Square(),
      _s2 = new Gibberish.Square(),
      _s3 = new Gibberish.Square(),
      _s4 = new Gibberish.Square(),
      _s5 = new Gibberish.Square(),
      _s6 = new Gibberish.Square(),
      s1 = _s1.callback,
      s2 = _s2.callback,
      s3 = _s3.callback,
      s4 = _s4.callback,
      s5 = _s5.callback,
      s6 = _s6.callback,                              
      //_bpf = new Gibberish.Biquad({ mode:'BP' }),
      _bpf = new Gibberish.SVF({ mode:2 }),
      bpf   = _bpf.callback,
      _hpf  = new Gibberish.Filter24(),
      hpf   = _hpf.callback,
      _eg   = new Gibberish.ExponentialDecay( .0025, 10500 ),
      eg    = _eg.callback,
      _eg2   = new Gibberish.ExponentialDecay( .1, 7500 ),
      eg2    = _eg2.callback;        
  
  Gibberish.extend(this, {
  	name: "hat",
  	properties : { amp: 1, pitch: 325, bpfFreq:7000, bpfRez:2, hpfFreq:.975, hpfRez:0, decay:3500, decay2:3000, sr:Gibberish.context.sampleRate },
	
  	callback : function(amp, pitch, bpfFreq, bpfRez, hpfFreq, hpfRez, decay, decay2, sr) {
  		var val;
      
  		val =  s1( pitch, 1, .5, 0 );
  		val += s2( pitch * 1.4471, .75, 1, 0 );
  		val += s3( pitch * 1.6170, 1, 1, 0 );
  		val += s4( pitch * 1.9265, 1, 1, 0 );
  		val += s5( pitch * 2.5028, 1, 1, 0 );
  		val += s6( pitch * 2.6637, .75, 1, 0 );
		
      val  = bpf(  val, bpfFreq, bpfRez, 2, sr );
      		
  		val  *= eg(.001, decay);
      
      // rectify as per instructions found here: http://ericarcher.net/devices/tr808-clone/
      // val = val > 0 ? val : 0;
        		
  		//sample, cutoff, resonance, isLowPass, channels
  		val 	= hpf(val, hpfFreq, hpfRez, 0, 1 );
  
  		val *= amp;
		  
  		return val;
  	},
	
  	note : function(_decay, _decay2) {
  		_eg.trigger()
  		_eg2.trigger()
  		if(_decay)
  			this.decay = _decay;
  		if(_decay2)
  			this.decay2 = _decay2;
		
  	}
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
  
  this.bpf = _bpf;
  this.hpf = _hpf;
  
  _eg.trigger(1);
  _eg2.trigger(1);
};
Gibberish.Hat.prototype = Gibberish._oscillator;

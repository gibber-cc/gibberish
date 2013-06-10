Gibberish.Kick = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF().callback,
    	lpf = new Gibberish.SVF().callback;
      
  Gibberish.extend(this, {
  	name:		"kick",
    properties:	{ pitch:60, decay:50, tone: 500, amp:2 },
	
  	setters : {
  		decay: function(val, f) {
  			f(val * 100);
  		},
  		tone: function(val, f) {
  			f(220 + val * 800);
  		},
  	},

  	callback: function(pitch, decay, tone, amp) {					
  		out = trigger ? 60 : 0;
			
  		out = bpf( out, pitch, decay, 2, 1 );
  		out = lpf( out, tone, .5, 0, 1 );
		
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
  .oscillatorInit()
  .processProperties(arguments);
};
Gibberish.Kick.prototype = Gibberish._oscillator;

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
  	properties: { cutoff:1000, decay:11025, tune:0, snappy:.5, amp:1 },

  	callback: function(cutoff, decay, tune, snappy, amp) {
  		var p1, p2, noise = 0, env = 0;

  		env = eg(.0025, decay);
		
  		if(env > .005) {	
  			out = ( rnd() * 2 - 1 ) * env ;
  			out = noiseHPF( out, cutoff + tune * 1000, .5, 1, 1 );
  			out *= snappy;
  			envOut = env;
			
  			p1 = bpf1( envOut, 180 * (tune + 1), 15, 2, 1 );
  			p2 = bpf2( envOut, 330 * (tune + 1), 15, 2, 1 );
		
  			out += p1; 
  			out += p2 * .8;
  			out *= amp;
  		}else{
  		  out = 0;
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
      _bpf = new Gibberish.SVF({ mode: 2 }),
      bpf   = _bpf.callback,
      _hpf  = new Gibberish.Filter24(),
      hpf   = _hpf.callback,
      _eg   = new Gibberish.ExponentialDecay( .0025, 10500 ),
      eg    = _eg.callback,
      _eg2   = new Gibberish.ExponentialDecay( .1, 7500 ),
      eg2    = _eg2.callback;        
  
  Gibberish.extend(this, {
  	name: "hat",
  	properties : { amp: 1, pitch: 325, bpfFreq:9000, bpfRez:55, hpfFreq:.85, hpfRez:3, decay:2000, decay2:3000 },
	
  	callback : function(amp, pitch, bpfFreq, bpfRez, hpfFreq, hpfRez, decay, decay2) {
  		var val, low, high;
  		val = s1( pitch, 2, 1, 0 );
  		val += s2( pitch * 1.4471, 2, 1, 0 );
  		val += s3( pitch * 1.6170, 1.5, 1, 0 );
  		val += s4( pitch * 1.9265, 1.25, 1, 0 );
  		val += s5( pitch * 2.5028, 1, 1, 0 );
  		val += s6( pitch * 2.6637, .75, 1, 0 );
		
  		low  = bpf(  val, bpfFreq, bpfRez, 2, 1 );
  		high = bpf(  val, 1550, .5, 2, 1 );
  		//high = [ low[0] ];
		
  		low  *= eg(.001, decay);
  		high *= eg2( .001, decay2);
  		//sample, cutoff, resonance, isLowPass, channels
  		low 	= hpf(high, hpfFreq, hpfRez, 0, 1 );
  		//sample, cutoff, resonance, isLowPass, channels
  		//high	= hpf24.call( high ); //, .8, 1, 0, 1 );
  		//if(val[0] > .985) val[0] = .985;
  		//if(val[0] < -.985) val[0] = -.985;
  		val 	= low + high;					
  		val *= amp;
		
  		return val;
  	},
	
  	note : function(_decay2, _decay) {
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
  
  _eg.trigger(1);
  _eg2.trigger(1);
};
Gibberish.Hat.prototype = Gibberish._oscillator;

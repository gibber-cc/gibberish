Gibberish.Kick = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF({ channels:1 }).callback,
    	lpf = new Gibberish.SVF({ channels:1 }).callback;
      
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
  		if(p) this.pitch = p;					
  		if(d) this.decay = d; 
  		if(t) this.tone = t
  		if(amp) this.amp = amp;
		
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
      
	//upvalues: { phase:11025, bpf1: null, bpf2:null, rnd:Math.random, noiseHPF:null, eg:null, out:[0], envOut:[0] },  
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
  			//val = noise;
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

// b = new Gibberish.Sequencer({
// target:a, key:'note',
// values:[60,70,80,90],
// durations:[22050]
// }).start()

// 

/*
a = new Gibberish.Kick().connect()
b = new Gibberish.Sequencer({
  target:a, key:'note',
  values:[60,70,80,90],
  durations:[22050]
}).start()

c = new Gibberish.Snare().connect()
d = new Gibberish.Sequencer({
  target:c, key:'note',
  values:Gibberish.Rndf(-.1,.1),
  durations:[44100]
}).start()

*/
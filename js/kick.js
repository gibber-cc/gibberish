let g = require( 'genish.js' )

module.exports = function( Gibberish ) {
/*
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
*/
  let Kick = props => {
    let frequency = g.in( 'frequency' ),
        decay = g.in( 'decay' ),
        tone  = g.in( 'tone' ),
        gain  = g.in( 'gain' )

    props = Object.assign( {}, Kick.defaults, props )

    let trigger = g.bang(),
        impulse = mul( trigger, 260),
        bpf = g.biquad( impulse, frequency, decay, 'BP', false ),
        lpf = g.biquad( bpf, tone, .5, 'LP', false ),
        out = mul( lpf, gain )
    
    let kick = Gibberish.factory( out, 'synth', props  )
    
    kick.env = trigger

    kick.note = freq => {
      kick.frequency = freq
      kick.env.trigger()
    }

    kick.trigger = kick.env.trigger

    kick.free = () => {
      Gibberish.genish.gen.free( out )
    }


    return kick
  }
  
  Kick.defaults = {
    gain: 1,
    frequency:65,
    tone: 550,
    decay:10
  }

  return Kick

}

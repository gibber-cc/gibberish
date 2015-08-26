Gibberish.envelope = function() {
    this.type = 'envelope';
};
Gibberish.envelope.prototype = new Gibberish.ugen();
Gibberish._envelope = new Gibberish.envelope();

Gibberish.ExponentialDecay = function(){
	var pow = Math.pow,
      value = 0,
      phase = 0;
      
  Gibberish.extend(this, {
  	name:"ExponentialDecay",
  	properties: { decay:.5, length:11050 },

  	callback: function( decay, length ) {
  		value = pow( decay, phase );
  		phase += 1 / length;

  		return value;
  	},
    
    trigger : function() {
      phase = typeof arguments[0] === 'number' ? arguments[0] : 0;
    },
  })
  .init()
};
Gibberish.ExponentialDecay.prototype = Gibberish._envelope;

Gibberish.Line = function(start, end, time, loops) {
	var that = { 
		name:		'line',

    properties : {
  		start:	start || 0,
  		end:		isNaN(end) ? 1 : end,
  		time:		time || Gibberish.context.sampleRate,
  		loops:	loops || false,
    },
    
    retrigger: function( end, time ) {
      phase = 0;
      this.start = out
      this.end = end
      this.time = time
      
      incr = (end - out) / time
    },
    
    getPhase: function() { return phase },
    getIncr: function() { return incr },
    getOut: function() { return out }
	};
  
	var phase = 0,
	    incr = (end - start) / time,
      out
  
  //console.log("INCREMENT", incr, end, start, time )
  
	this.callback = function(start, end, time, loops) {
    var incr = (end - start) / time
		out = phase < time ? start + ( phase++ * incr) : end;
				
		phase = (out >= end && loops) ? 0 : phase;
		
		return out;
	};
  
  this.setPhase = function(v) { phase = v; }
  
  Gibberish.extend(this, that);
  
  this.init();

  return this;
};
Gibberish.Line.prototype = Gibberish._envelope;

Gibberish.Ease = function( start, end, time, easein, loops ) {
  var sqrt = Math.sqrt, out = 0, phase = 0
      
  start = start || 0
  end = end || 1
  time = time || Gibberish.context.sampleRate
  loops = loops || false
  easein = typeof easein === 'undefined' ? 1 : easein
  
	var that = { 
		name:		'ease',
    properties : {},
    retrigger: function( end, time ) {
      phase = 0;
      this.start = out
      this.end = end
      this.time = time      
    },
    
    getPhase: function() { return phase },
    getOut: function() { return out }
	};
  
	this.callback = function() {
    var x = phase++ / time,
        y = easein ? 1 - sqrt( 1 - x * x ) : sqrt( 1 - ((1-x) * (1-x)) )
    
    out = phase < time ? start + ( y * ( end - start ) ) : end
    
		//out = phase < time ? start + ( phase++ * incr) : end;
				
		phase = (out >= end && loops) ? 0 : phase;
		
		return out;
	};
  
  this.setPhase = function(v) { phase = v; }
  this.setEase = function(v) {
    easein = v
  }
  
  Gibberish.extend(this, that);
  
  this.init();

  return this;
};
Gibberish.Ease.prototype = Gibberish._envelope;

// quadratic bezier
// adapted from http://www.flong.com/texts/code/shapers_bez/
Gibberish.Curve = function( start, end, time, a, b, fadeIn, loops ) {
  var sqrt = Math.sqrt, 
      out = 0,
      phase = 0
      
  start = start || 0
  end = end || 1
  time = time || Gibberish.context.sampleRate
  a = a || .940
  b = b || .260
  loops = loops || false
  fadeIn = typeof fadeIn === 'undefined' ? 1 : fadeIn
  
	var that = { 
		name:		'curve',

    properties : {},
    
    retrigger: function( end, time ) {
      phase = 0;
      this.start = out
      this.end = end
      this.time = time
      
      incr = (end - out) / time
    },
    
    getPhase: function() { return phase },
    getOut: function() { return out }
	};
  
	this.callback = function() {
    var x = phase++ / time,
        om2a = 1 - 2 * a,
        t = ( sqrt( a*a + om2a*x ) - a ) / om2a,
        y = (1-2*b) * (t*t) + (2*b) * t
    
    out = phase < time ? start + ( y * ( end - start ) ) : end
    
    if( !fadeIn ) out =  1 - out
    
		//out = phase < time ? start + ( phase++ * incr) : end;
				
		phase = (out >= end && loops) ? 0 : phase;
		
		return out;
	};
  
  this.setPhase = function(v) { phase = v; }
  
  Gibberish.extend(this, that);
  
  this.init();

  return this;
};
Gibberish.Curve.prototype = Gibberish._envelope;

Gibberish.Lines = function( values, times, loops ) {
  var out = values[0],
      phase = 0,
      valuesPhase = 1,
      timesPhase = 0,
      targetValue = 0,
      targetTime = 0,
      end = false,
      incr
  
  
  if( typeof values === 'undefined' ) values = [ 0,1 ]
  if( typeof times  === 'undefined' ) times  = [ 44100 ]  
    
  targetValue = values[ valuesPhase ]
  targetTime  = times[ 0 ]
  
  incr = ( targetValue - values[0] ) / targetTime
  //console.log( "current", out, "target", targetValue, "incr", incr )
  
  loops = loops || false
  
	var that = { 
		name:		'lines',

    properties : {},
    
    retrigger: function() {
      phase = 0
      out = values[0]
      targetTime = times[ 0 ]
      targetValue = values[ 1 ]
      valuesPhase = 1
      timesPhase = 0
      incr = ( targetValue - out ) / targetTime
      end = false
    },
    
    getPhase: function() { return phase },
    getOut:   function() { return out }
	};
  
  that.run = that.retrigger
  
	this.callback = function() {
    if( phase >= targetTime && !end ) {
      if( valuesPhase < values.length - 1 ) {
        var timeStep = times[ ++timesPhase % times.length ]
        targetTime = phase + timeStep
        targetValue = values[ ++valuesPhase % values.length ]
        incr = ( targetValue - out ) / timeStep        
      }else{
        if( !loops ) {
          end = true
          out = values[ values.length - 1 ]
        }else{
          phase = 0
          out = values[0]
          targetTime = times[ 0 ]
          targetValue = values[ 1 ]
          valuesPhase = 1
          timesPhase = 0
          incr = ( targetValue - out ) / targetTime
        }
      }
    }else if( !end ) {
      out += incr
      phase++
    }
		
		return out;
	};
  
  this.setPhase = function(v) { phase = v; }
  
  Gibberish.extend(this, that);
  
  this.init();

  return this;
};
Gibberish.Lines.prototype = Gibberish._envelope;

Gibberish.AD = function(_attack, _decay) {
  var phase = 0,
      state = 0;
      
  Gibberish.extend( this,{
    name : "AD",
  	properties : {
      attack :	_attack || 10000,
  	  decay  :	_decay  || 10000,
    },

  	run : function() {
  		state = 0;
      phase = 0;
  		return this;			
    },
  	callback : function(attack,decay) {
  		attack = attack < 0 ? 22050 : attack;
  		decay  = decay  < 0 ? 22050 : decay;				
  		if(state === 0){
  			var incr = 1 / attack;
  			phase += incr;
  			if(phase >=1) {
  				state++;
  			}
  		}else if(state === 1){
  			var incr = 1 / decay;
  			phase -= incr;
  			if(phase <= 0) {
  				phase = 0;
  				state++;;
  			}			
  		}
  		return phase;
    },
    getState : function() { return state; },
  })
  .init()
  .processProperties(arguments);
};
Gibberish.AD.prototype = Gibberish._envelope;

Gibberish.ADSR = function(attack, decay, sustain, release, attackLevel, sustainLevel, requireReleaseTrigger) {
	var that = { 
    name:   "adsr",
		type:		"envelope",
    'requireReleaseTrigger' : typeof requireReleaseTrigger !== 'undefined' ? requireReleaseTrigger : false,
    
    properties: {
  		attack:		isNaN(attack) ? 10000 : attack,
  		decay:		isNaN(decay) ? 10000 : decay,
  		sustain: 	isNaN(sustain) ? 22050 : sustain,
  		release:	isNaN(release) ? 10000 : release,
  		attackLevel:  attackLevel || 1,
  		sustainLevel: sustainLevel || .5,
      releaseTrigger: 0,
    },

		run: function() {
			this.setPhase(0);
			this.setState(0);
		},
    stop : function() {
      this.releaseTrigger = 1
    }
	};
	Gibberish.extend(this, that);
	
	var phase = 0,
	    state = 0,
      rt  = 0,
      obj = this;
      
  this.callback = function(attack,decay,sustain,release,attackLevel,sustainLevel,releaseTrigger) {
		var val = 0;
    rt = rt === 1 ? 1 : releaseTrigger;
		if(state === 0){
			val = phase / attack * attackLevel;
			if(++phase / attack >= 1) {
				state++;
				phase = decay;
			}
		}else if(state === 1) {
			val = phase / decay * (attackLevel - sustainLevel) + sustainLevel;
			if(--phase <= 0) {
				if(sustain !== null){
					state += 1;
					phase = sustain;
				}else{
					state += 2;
					phase = release;
				}
			}
		}else if(state === 2) {
			val = sustainLevel;
      if( obj.requireReleaseTrigger && rt ){
        state++;
        phase = release;
        obj.releaseTrigger = 0;
        rt = 0;
      }else if(phase-- <= 0 && !obj.requireReleaseTrigger) {
				state++;
				phase = release;
			}
		}else if(state === 3) {
      phase--;
			val = (phase / release) * sustainLevel;
			if(phase <= 0) {
        state++;
      }
		}
		return val;
	};
  this.call = function() {
    return this.callback( this.attack, this.decay, this.sustain, this.release, this.attackLevel, this.sustainLevel, this.releaseTrigger )
  };
  this.getPhase = function() { return phase; };
	this.setPhase = function(newPhase) { phase = newPhase; };
	this.setState = function(newState) { state = newState; phase = 0; };
	this.getState = function() { return state; };		
	
  this.init();
  
	return this;
};
Gibberish.ADSR.prototype = Gibberish._envelope;

Gibberish.ADR = function(attack, decay, release, attackLevel, releaseLevel) {
	var that = { 
    name:   "adr",
		type:		"envelope",
    
    properties: {
  		attack:		isNaN(attack) ? 11025 : attack,
  		decay:		isNaN(decay) ? 11025 : decay,
  		release:	isNaN(release) ? 22050 : release,
  		attackLevel:  attackLevel || 1,
  		releaseLevel: releaseLevel || .2,
    },

		run: function() {
			this.setPhase(0);
			this.setState(0);
		},
	};
	Gibberish.extend(this, that);
	
	var phase = 0;
	var state = 0;
  
	this.callback = function(attack,decay,release,attackLevel,releaseLevel) {
		var val = 0;
		if(state === 0){
			val = phase / attack * attackLevel;
			if(++phase / attack === 1) {
				state++;
				phase = decay;
			}
		}else if(state === 1) {
			val = (phase / decay) * (attackLevel - releaseLevel) + releaseLevel;
			if(--phase <= 0) {
					state += 1;
					phase = release;
			}
		}else if(state === 2){
      phase--;
      
			val = (phase / release) * releaseLevel;
			if(phase <= 0) {
        state++;
      }
		}
		return val;
	};
	this.setPhase = function(newPhase) { phase = newPhase; };
	this.setState = function(newState) { state = newState; phase = 0; };
	this.getState = function() { return state; };		
	
  this.init();
  
	return this;
};
Gibberish.ADR.prototype = Gibberish._envelope;
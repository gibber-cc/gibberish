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

/**#Gibberish.Table - Oscillator
An wavetable oscillator.

## Example Usage##
`// fill the wavetable with random samples
Gibberish.init();  
a = new Gibberish.Table();  
var t = []  
for( var i = 0; i < 1024; i++ ) { t[ i ] = Gibberish.rndf(-1,1) }  
a.setTable( t )  
a.connect()  
`
- - - -
**/
/**###Gibberish.Table.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Table.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Wavetable = function() {
  var phase = 0,
      table = null,
      tableFreq = Gibberish.context.sampleRate / 1024,
      signHistory = 0,
      flip = 0;
  
  this.properties = {
    frequency : 440,
    amp : .25,
    sync: 0
  };
  
/**###Gibberish.Wavetable.setTable : method  
Assign an array representing one cycle of a waveform to use.  

param **table** Float32Array. Assign an array to be used as the wavetable.
**/     
  this.getTable = function() { return table; }
  this.setTable = function(_table) { table = _table; tableFreq = Gibberish.context.sampleRate / table.length }
  
  this.getTableFreq = function() { return tableFreq }
  this.setTableFreq = function( v ) { tableFreq = v;  }  
  
  this.getPhase = function()  { return phase }
  this.setPhase = function(v) { phase = v }

/**###Gibberish.Wavetable.callback : method  
Returns a single sample of output.  

param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
**/   
  this.callback = function(frequency, amp, sync) { 
    var index, frac, index2, val1, val2, sign;
            
    phase += frequency / tableFreq;
    while(phase >= 1024) phase -= 1024;  
    
    index   = phase | 0;
    frac    = phase - index;
    index   = index & 1023;
    index2  = index === 1023 ? 0 : index + 1;
    val1    = table[index];
    val2    = table[index2];
    
    // sign = typeof sync == 'number' ? sync ? sync < 0 ? -1 : 1 : isNaN(sync) ? NaN : 0 : NaN;
    // if( sign !== signHistory && sign !== 0) {
    //   flip++
    //   
    //   if( flip === 2 ){
    //     phase = 0
    //     flip = 0
    //   }
    //   //console.log( "FLIP", sign, signHistory, count, sync )
    // }
    // 
    // if( sign !== 0 ) signHistory = sign
    
    return ( val1 + ( frac * (val2 - val1) ) ) * amp;
  }
}
Gibberish.Wavetable.prototype = Gibberish._oscillator;

Gibberish.Table = function( table ) {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'table';
  
  var pi_2 = Math.PI * 2
  
  if( typeof table === 'undefined' ) { 
    table = new Float32Array(1024);
    for(var i = 1024; i--;) { table[i] = Math.sin( (i / 1024) * pi_2); }
  }
  
  this.setTable( table );

  this.init();
  this.oscillatorInit();
  //this.processProperties( arguments );
}

Gibberish.asmSine = function (stdlib, foreign, heap) {
    "use asm";

    var sin = stdlib.Math.sin;
    var phase = 0.0;
    var out = new stdlib.Float32Array(heap);
    var floor = stdlib.Math.floor;
    var tableFreq = 0.0;
    
    function init() {
      var i = 1024;
      var j = 1024.0;
      var test = 0.0;
      for (;  i = (i - 1) | 0; ) {
        j = j - 1.0;
        out[i >> 2] = +(sin( +(j / 1024.0) * 6.2848));
      }  
      tableFreq = 44100.0 / 1024.0;
    }
    
    function gen(freq, amp, sr) {
      freq = +freq;
      amp = +amp;
      sr = +sr;
      
      var index = 0.0,
          index1 = 0,
          index2 = 0,
          frac = 0.0,
          val1 = 0.0,
          val2 = 0.0;
      
      phase = +(phase + freq / tableFreq);
      if(phase >= 1024.0) phase = +(phase - 1024.0);
          
      index = +floor(phase);
      frac = phase - index;
      
      index1 = (~~index);
      if((index1 | 0) == (1024 | 0)) {
        index2 = 0
      } else { 
        index2 = (index1 + 1) | 0;
      }
      
      val1 = +out[ index1 >> 2 ];
      val2 = +out[ index2 >> 2 ];
          
      return +((val1 + (frac * (val2 - val1))) * amp);
    }
    
    function get(idx) {
      idx = idx|0;
      return +out[idx >> 2];
    }

    return {
      init:init,
      gen: gen,
      get: get,
    }
};

/*
    phase += frequency / tableFreq;
    while(phase >= 1024) phase -= 1024;  
    
    index   = phase | 0;
    frac    = phase - index;
    index   = index & 1023;
    index2  = index === 1023 ? 0 : index + 1;
    val1    = table[index];
    val2    = table[index2];
        
    return ( val1 + ( frac * (val2 - val1) ) ) * amp;
*/





/*function gen (freq, amp, sr) {
    freq = +freq;
    amp  = +amp;
    sr = +sr;
    
    phase = +(phase + +(+(freq / sr) * 3.14159 * 2.0));
    
    return +(+sin(phase) * amp);
}*/
//var pi_2 = (3.14159 * 2.0);


Gibberish.asmSine2 = function () {    
    this.properties = { frequency:440.0, amp:.5, sr: Gibberish.context.sampleRate }
    this.name = 'sine'
    var buf = new ArrayBuffer(4096);
    var asm = Gibberish.asmSine(window, null, buf);
    asm.init();
    
    this.getTable = function() { return buf; }
    this.get = asm.get;
    this.callback = asm.gen;
    this.init();
    this.oscillatorInit();
    this.processProperties( arguments );
    
    return  this;
}
Gibberish.asmSine2.prototype = Gibberish._oscillator;
/**#Gibberish.Sine - Oscillator
A sinewave calculated on a per-sample basis.

## Example Usage##
`// make a sine wave  
Gibberish.init();  
a = new Gibberish.Sine().connect();`
- - - -
**/
/**###Gibberish.Sine.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Sine.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Sine = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'sine';
  
  var pi_2 = Math.PI * 2, 
      table = new Float32Array(1024);
      
  for(var i = 1024; i--;) { table[i] = Math.sin( (i / 1024) * pi_2); }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Sine2 - Oscillator
A sinewave calculated on a per-sample basis that can be panned.

## Example Usage##
`// make a sine wave  
Gibberish.init();  
a = new Gibberish.Sine2(880, .5, -.25).connect();`
- - - -
**/
/**###Gibberish.Sine2.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Sine2.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.Sine2.pan : property  
Number. -1..1. The position of the sinewave in the stereo spectrum
**/
Gibberish.Sine2 = function() {
  this.__proto__ = new Gibberish.Sine();
  this.name = "sine2";
    
  var sine = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];

/**###Gibberish.Sine2.callback : method  
Returns a stereo sample of output as an array.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pan** Number. The position in the stereo spectrum of the signal.
**/  
  this.callback = function(frequency, amp, pan) {
    var out = sine(frequency, amp);
    output = panner(out, pan, output);
    return output;
  }

  this.init();
  this.oscillatorInit();
  Gibberish.defineUgenProperty('pan', 0, this);
  this.processProperties(arguments);  
};

Gibberish.Square = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'square';
  
  var pi_2 = Math.PI * 2, 
      table = new Float32Array(1024);
      
  for(var i = 1024; i--;) { 
    table[i] = i / 1024 > .5 ? 1 : -1;
  }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Saw - Oscillator
A non-bandlimited saw wave calculated on a per-sample basis.

## Example Usage##
`// make a saw wave  
Gibberish.init();  
a = new Gibberish.Saw(330, .4).connect();`
- - - -
**/
/**###Gibberish.Saw.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Saw.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
Gibberish.Saw = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'saw';
  
  var table = new Float32Array(1024);
      
  for(var i = 1024; i--;) { table[i] = (((i / 1024) / 2 + 0.25) % 0.5 - 0.25) * 4; }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Saw2 - Oscillator
A stereo, non-bandlimited saw wave calculated on a per-sample basis.

## Example Usage##
`// make a saw wave  
Gibberish.init();  
a = new Gibberish.Saw2(330, .4).connect();`
- - - -
**/
/**###Gibberish.Saw.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Saw.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
Gibberish.Saw2 = function() {
  this.__proto__ = new Gibberish.Saw();
  this.name = "saw2";
  
  var saw = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];

/**###Gibberish.Saw2.callback : method  
Returns a stereo sample of output as an array.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pan** Number. The position in the stereo spectrum of the signal.
**/    
  this.callback = function(frequency, amp, pan) {
    var out = saw(frequency, amp);
    output = panner(out, pan, output);
    return output;
  };

  this.init();
  Gibberish.defineUgenProperty('pan', 0, this);
  
};

/**#Gibberish.Triangle - Oscillator
A triangle calculated on a per-sample basis.

## Example Usage##
`// make a triangle wave  
Gibberish.init();  
a = new Gibberish.Triangle({frequency:570, amp:.35}).connect();`
- - - -
**/
/**###Gibberish.Triangle.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Triangle.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Triangle = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'triangle';
  
  var table = new Float32Array(1024),
      abs = Math.abs;
      
  for(var i = 1024; i--;) { table[i] = 1 - 4 * abs(( (i / 1024) + 0.25) % 1 - 0.5); }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Triangle2 - Oscillator
A triangle calculated on a per-sample basis that can be panned.

## Example Usage##
`Gibberish.init();  
a = new Gibberish.Triangle2(880, .5, -.25).connect();`
- - - -
**/
/**###Gibberish.Triangle2.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Triangle2.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.Triangle2.pan : property  
Number. -1..1. The position of the triangle wave in the stereo spectrum
**/
 
Gibberish.Triangle2 = function() {
  this.__proto__ = new Gibberish.Triangle();
  this.name = "triangle2";
    
  var triangle = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];

/**###Gibberish.Triangle2.callback : method  
Returns a stereo sample of output as an array.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pan** Number. The position in the stereo spectrum of the signal.
**/    
  this.callback = function(frequency, amp, pan) {
    var out = triangle(frequency, amp);
    return panner(out, pan, output);
  };

  this.init();
  this.oscillatorInit();
  Gibberish.defineUgenProperty('pan', 0, this);
  this.processProperties(arguments);
};

/**#Gibberish.Saw3 - Oscillator
A bandlimited saw wave created using FM feedback, see http://scp.web.elte.hu/papers/synthesis1.pdf.  
  
## Example Usage##
`// make a saw wave  
Gibberish.init();  
a = new Gibberish.Saw3(330, .4).connect();`
- - - -
**/
/**###Gibberish.Saw3.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Saw3.amp : property  
Number. A linear value specifying relative ampltiude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Saw3 = function() {
  var osc = 0,
      phase = 0,
      a0 = 2.5,
      a1 = -1.5,
      history = 0,
      sin = Math.sin,
      scale = 11;
      pi_2 = Math.PI * 2,
      flip = 0,
      signHistory = 0,
      ignore = false,
      sr = Gibberish.context.sampleRate;
      
  Gibberish.extend(this, {
    name: 'saw',
    properties : {
      frequency: 440,
      amp: .15,
      sync:0,
      sr: Gibberish.context.sampleRate,
    },
/**###Gibberish.Saw3.callback : method  
Returns a single sample of output.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
**/    
    callback : function(frequency, amp, sync) {
      var w = frequency / sr,
          n = .5 - w,
          scaling = scale * n * n * n * n,
          DC = .376 - w * .752,
          norm = 1 - 2 * w,
          out = 0,
          sign;
          
      phase += w;
      phase -= phase > 1 ? 2 : 0;
      
      osc = (osc + sin(pi_2 * (phase + osc * scaling))) * .5;
      out = a0 * osc + a1 * history;
      history = osc;
      out += DC;
      out *= norm;

      // sign = typeof sync == 'number' ? sync ? sync < 0 ? -1 : 1 : isNaN(sync) ? NaN : 0 : NaN;
      // if( sign !== signHistory && sign !== 0) {
      //   flip++
      //   
      //   if( flip === 2 ){
      //     phase = 0
      //     flip = 0
      //   }
      //   //console.log( "FLIP", sign, signHistory, count, sync )
      // }
      // if( sign !== 0 ) signHistory = sign
      
      return out;
    }
  });
  
  /*
    .1 : 1 1
    0  : 0 1   // ignored
  -.1  : -1 1  // flip
  -.2  : -1 -1 
  */
  
  Object.defineProperty(this, 'scale', {
    get : function() { return scale; },
    set : function(val) { scale = val; }
  });
  
  this.init();
  this.oscillatorInit();
  this.processProperties(arguments);
}
Gibberish.Saw3.prototype = Gibberish._oscillator;

/**#Gibberish.PWM - Oscillator
A bandlimited pulsewidth modulation wave created using FM feedback, see http://scp.web.elte.hu/papers/synthesis1.pdf.
  
## Example Usage##
`// make a pwm wave  
Gibberish.init();  
a = new Gibberish.PWM(330, .4, .9).connect();`
- - - -
**/
/**###Gibberish.PWM.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.PWM.amp : property  
Number. A linear value specifying relative ampltiude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.PWM.pulsewidth : property  
Number. 0..1. The width of the waveform's duty cycle.
**/
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
      test = 0,
      sr = Gibberish.context.sampleRate;

  Gibberish.extend(this, {
    name: 'pwm',
    properties : {
      frequency: 440,
      amp: .15,
      pulsewidth: .05,
      sr: Gibberish.context.sampleRate,
    },
/**###Gibberish.PWM.callback : method  
Returns a single sample of output.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pulsewidth** Number. The duty cycle of the waveform
**/    
    callback : function(frequency, amp, pulsewidth) {
      var w = frequency / sr,
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
  this.processProperties(arguments);  
};
Gibberish.PWM.prototype = Gibberish._oscillator;

/**#Gibberish.Noise - Oscillator
A white noise oscillator

## Example Usage##
`// make some noise
Gibberish.init();  
a = new Gibberish.Noise(.4).connect();`
- - - -
**/
/**###Gibberish.Noise.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
Gibberish.Noise = function() {
  var rnd = Math.random;
  
  Gibberish.extend(this, {
    name:'noise',
    properties: {
      amp:1,
    },
    
    callback : function(amp){ 
      return (rnd() * 2 - 1) * amp;
    },
  });
  
  this.init();
  this.oscillatorInit();
  this.processProperties(arguments);  
};
Gibberish.Noise.prototype = Gibberish._oscillator;
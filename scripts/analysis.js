/*
Analysis ugens have two callbacks, one to perform the analysis and one to output the results.
This allows the analysis to occur at the end of the callback while the outback can occur at
the beginning, in effect using a single sample delay.

Because of the two callbacks, there are also two codegen methods. The default codegens used by
the analysis prototype object should be fine for most applications.
*/

Gibberish.analysis = function() {
  this.type = 'analysis';
  
  this.codegen = function() {
    if(Gibberish.memo[this.symbol]) {
      return Gibberish.memo[this.symbol];
    }else{
      var v = this.variable ? this.variable : Gibberish.generateSymbol('v');
      Gibberish.memo[this.symbol] = v;
      this.variable = v;
      Gibberish.callbackArgs.push( this.symbol )
      Gibberish.callbackObjects.push( this.callback )
    }
        
    this.codeblock = "var " + this.variable + " = " + this.symbol + "();\n";
    
    if( Gibberish.codeblock.indexOf( this.codeblock ) === -1 ) Gibberish.codeblock.push( this.codeblock )
    return this.variable;
  }
  
  this.analysisCodegen = function() {
    // TODO: can this be memoized somehow?
    //if(Gibberish.memo[this.analysisSymbol]) {
    //  return Gibberish.memo[this.analysisSymbol];
    //}else{
    // Gibberish.memo[this.symbol] = v;
    // console.log( this.input )
    
    var input = 0;
    if(this.input.codegen){
      input = this.input.codegen()
      //console.log( "PROPERTY UGEN", input)
      if(input.indexOf('op') > -1) console.log("ANALYSIS BUG")
    }else if( this.input.value ){
      input = typeof this.input.value.codegen !== 'undefined' ? this.input.value.codegen() : this.input.value
    }else{
      input = 'null'
    }
    
    var s = this.analysisSymbol + "(" + input + ",";
    for(var key in this.properties) {
      if(key !== 'input') {
        s += this[key] + ",";
      }
    }
    s = s.slice(0, -1); // remove trailing comma
    s += ");";
  
    this.analysisCodeblock = s;
    
    if( Gibberish.analysisCodeblock.indexOf( this.analysisCodeblock ) === -1 ) Gibberish.analysisCodeblock.push( this.analysisCodeblock )
    
    if( Gibberish.callbackObjects.indexOf( this.analysisCallback) === -1 ) Gibberish.callbackObjects.push( this.analysisCallback )
    
    //console.log( this.analysisCallback )
        
    return s;
  };
  
  this.remove = function() {
    Gibberish.analysisUgens.splice( Gibberish.analysisUgens.indexOf( this ), 1 )
  }
  
  this.analysisInit = function() {
    this.analysisSymbol = Gibberish.generateSymbol(this.name);
    Gibberish.analysisUgens.push( this );
    Gibberish.dirty(); // dirty in case analysis is not connected to graph, 
  };
  
};
Gibberish.analysis.prototype = new Gibberish.ugen();
Gibberish._analysis = new Gibberish.analysis();

Gibberish.Follow = function() {
  this.name = 'follow';
    
  this.properties = {
    input : 0,
    bufferSize : 4410,
    mult : 1,
    useAbsoluteValue:true // for amplitude following, false for other values
  };
  
  this.storage = [];
    
  var abs = Math.abs,
      history = [0],
      sum = 0,
      index = 0,
      value = 0,
      phase = 0;
      
  this.analysisCallback = function(input, bufferSize, mult, useAbsoluteValue ) {
    if( typeof input === 'object' ) input = input[0] + input[1]
    
  	sum += useAbsoluteValue ? abs(input) : input;
  	sum -= history[index];
    
  	history[index] = useAbsoluteValue ? abs(input) : input;
    
  	index = (index + 1) % bufferSize;
			
    // if history[index] isn't defined set it to 0 
    // TODO: does this really need to happen here? I guess there were clicks on initialization...
    history[index] = history[index] ? history[index] : 0;
  	value = (sum / bufferSize) * mult;
  };
    
  this.callback = this.getValue = function() { return value; };
    
  this.init();
  this.analysisInit();
  this.processProperties( arguments );
  
  var oldBufferSize = this.__lookupSetter__( 'bufferSize' ),
      bs = this.bufferSize
  
  Object.defineProperty( this, 'bufferSize', {
    get: function() { return bs },
    set: function(v) { bs = v; sum = 0; history = [0]; index = 0; }
  })
  
  this.getStorage = function() { return this.storage; }
};
Gibberish.Follow.prototype = Gibberish._analysis;

Gibberish.SingleSampleDelay = function() {
  this.name = 'single_sample_delay';
  
  this.properties = {
    input : arguments[0] || 0,
    amp   : arguments[1] || 1,
  };
  
  var value = 0,
      phase = 0;
  
  this.analysisCallback = function(input, amp) {
    /*if(typeof input === 'object') {
      value = typeof input === 'object' ? [input[0] * amp, input[1] * amp ] : input * amp;
    }else{
      value = input * amp;
    }*/
    value = input
    //if(phase++ % 44100 === 0) console.log(value, input, amp)
  };
  
  this.callback = function() {
    //if(phase % 44100 === 0) console.log(value)
    
    return value;
  };
  
  this.getValue = function() { return value }
  this.init();
  this.analysisInit();
  this.processProperties( arguments );
  
};
Gibberish.SingleSampleDelay.prototype = Gibberish._analysis;

Gibberish.Record = function(_input, _size, oncomplete) {
  var buffer      = new Float32Array(_size),
      phase       = 0,
      isRecording = false,
      self        = this;

  Gibberish.extend(this, {
    name: 'record',
    'oncomplete' :  oncomplete,
    
    properties: {
      input:   0,
      size:    _size || 0,
    },
    
    analysisCallback : function(input, length) {
      if(isRecording) {
        buffer[phase++] = typeof input === 'object' ? input[0] + input[1] : input;
        
        if(phase >= length) {
          isRecording = false;
          self.remove();
        }
      }
    },
    
    record : function() {
      phase = 0;
      isRecording = true;
      return this;
    },
    
    getBuffer : function() { return buffer; },
    getPhase : function() { return phase; },
    
    remove : function() {
      if(typeof this.oncomplete !== 'undefined') this.oncomplete();
      
      for(var i = 0; i < Gibberish.analysisUgens.length; i++) {
        var ugen = Gibberish.analysisUgens[i];
        if(ugen === this) {
          if( Gibberish.callbackArgs.indexOf( this.analysisSymbol) > -1 ) {
            Gibberish.callbackArgs.splice( Gibberish.callbackArgs.indexOf( this.analysisSymbol), 1 )
          }
          if( Gibberish.callbackObjects.indexOf( this.analysisCallback ) > -1 ) {
            Gibberish.callbackObjects.splice( Gibberish.callbackObjects.indexOf( this.analysisCallback ), 1 )
          }
          Gibberish.analysisUgens.splice(i, 1);
          return;
        }
      }
    },
  });
  // cannot be assigned within extend call
  this.properties.input = _input;

  this.init();
  this.analysisInit();
  
  Gibberish.dirty(); // ugen is not attached to anything else
};
Gibberish.Record.prototype = Gibberish._analysis;
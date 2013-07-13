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
      v = this.variable ? this.variable : Gibberish.generateSymbol('v');
      Gibberish.memo[this.symbol] = v;
      this.variable = v;
      Gibberish.callbackArgs.push( this.symbol )
      Gibberish.callbackObjects.push( this.callback )
    }

    this.codeblock = "var " + this.variable + " = " + this.symbol + "();\n";
    
    return this.variable;
  }
  
  this.codegen2 = function() {
    for(var key in this.properties) {
      var property = this.properties[key];
      
      if( Array.isArray( property.value ) ) { // TODO: is this array case needed anymore? I don't think so...
        for(var i = 0; i < property.value.length; i++) {
          var member = property.value[i];
          if( typeof member === 'object' ) {
            member.type = 'ddd';
            
            member.codegen();
            member.getCodeblock();
            member.type = 'analysis';
          }
        } 
      }else if( typeof property.value === 'object' ) {      
        Gibberish.codestring += Gibberish.memo[property.value.symbol];
      }/*else{
        console.log('hmmmm', property.value )
        Gibberish.codestring = property.value; // Gibberish.memo[property.value.symbol]
      }*/
        
      if(property.binops) {
        for(var j = 0; j < property.binops.length; j++) {
          var op = property.binops[j],
              val; 
          if( typeof op.ugen === 'object') {
            op.ugen.codegen();
          }
        }
      }      
    }
  };
  
  this.analysisCodegen = function() {
    
    // TODO: can this be memoized somehow?
    //if(Gibberish.memo[this.analysisSymbol]) {
    //  return Gibberish.memo[this.analysisSymbol];
    //}else{
     // Gibberish.memo[this.symbol] = v;
    var s = this.analysisSymbol + "(" + this.input.variable + ",";
    for(var key in this.properties) {
      if(key !== 'input') {
        s += this[key] + ",";
      }
    }
    s = s.slice(0, -1);
    s += ");";
  
    this.analysisCodeblock = s;
  
    Gibberish.callbackObjects.push( this.analysisCallback )
        
    return s;
  };
  
  this.analysisInit = function() {
    this.analysisSymbol = Gibberish.generateSymbol(this.name);
    Gibberish.analysisUgens.push( this );
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
  };
    
  var abs = Math.abs,
      history = [0],
      sum = 0,
      index = 0,
      value = 0;
			
  this.analysisCallback = function(input, bufferSize, mult) {
    if( typeof input !== 'number') input = input[0] + input[1]
    
  	sum += abs(input);
  	sum -= history[index];
    
  	history[index] = abs(input);
    
  	index = (index + 1) % bufferSize;
			
    // if history[index] isn't defined set it to 0 TODO: does this really need to happen here? I guess there were clicks on initialization...
    history[index] = history[index] ? history[index] : 0;
  	value = (sum / bufferSize) * mult;
  };
    
  this.callback = function() { return value; };
    
  this.init();
  this.analysisInit();
  this.processProperties( arguments );  
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


// $LAB
//   .script("scripts/utils.js").wait()
//   .script("scripts/oscillators.js")
//   .script("scripts/bus.js")
//   .script("scripts/envelopes.js")
//   .script("scripts/analysis.js")
//   .script("scripts/effects.js")
//   .script("scripts/synth.js").wait()    
//   .script("scripts/fm_synth.js")
//   .script("scripts/monosynth.js")  
//   .script("scripts/externals/audiofile.js")
//   .script("scripts/sampler.js")
//   .script("scripts/proxy.js")      
//   .script("scripts/tests.js").wait( function() { 
//     Gibberish.init(); 
// });

Gibberish = {
  memo              : {},
  functions         : {}, // store ugen callbacks to be used as upvalues
  upvalues          : [],
  codeblock         : [],
  analysisCodeblock : [],
  analysisUgens     : [],
  dirtied           : [],
  id                : 0,
  isDirty           : false,  // whether or not callback needs to codegen'd
  out               : null,   // main output bus
  debug             : false,
  callback          : '',
  audioFiles        : {},
  
  createCallback : function() {
    this.memo = {};
    this.codeblock.length = 0;
    
    /***** generate code for dirty ugens *****/
    for(var i = 0; i < this.dirtied.length; i++) {
      this.dirtied[i].codegen();
    }
    this.dirtied.length = 0;
    
    this.codestring = this.upvalues.join("");
    
    this.codestring += '\nGibberish.callback = function() {\n\t';

    /***** concatenate code for all ugens *****/
    this.memo = {};
    this.out.getCodeblock();
    this.codestring += this.codeblock.join("\t");
    this.codestring += "\n\t";
    
    /***** analysis codeblock *****/
    this.codeblock.length = 0;    
    if(this.analysisUgens.length > 0) {
      this.analysisCodeblock.length = 0;
      for(var i = 0; i < this.analysisUgens.length; i++) {
        this.codeblock.length = 0;    
        //console.log("CALLING ANALYSIS CODEGEN");
        this.analysisUgens[i].codegen2();
        this.codestring += this.codeblock.join("");
        this.codestring += "\n\t";
        this.analysisCodeblock.push ( this.analysisUgens[i].analysisCodegen() );
      }
      this.codestring += this.analysisCodeblock.join('\n\t');
      this.codestring += '\n\n\t';
    }

    this.codestring += 'return ' + this.out.variable +';\n';
    this.codestring += '}';
    
    this.callbackString = this.codestring;
    if( this.debug ) console.log( this.callbackString );
    
    eval(this.codestring);    
  },
  
  audioProcess : function(e){
    //console.log("AUDIO PROCESS");
		var bufferL = e.outputBuffer.getChannelData(0);
		var bufferR = e.outputBuffer.getChannelData(1);	
		
    var me = Gibberish; // dereference for efficiency
		for(var i = 0, _bl = e.outputBuffer.length; i < _bl; i++){
      
      if(me.isDirty) {
        me.createCallback();
        me.isDirty = false;
      }
      
			var val = me.callback();
      
			bufferL[i] = val[0];
			bufferR[i] = val[1];      
		}
  },
  
  clear : function() {
    this.upvalues.length = 1; // make sure to leave master bus!!!
    this.out.inputs.length = 0;
    this.analysisUgens.length = 0;
    Gibberish.dirty(this.out);
  },
  
	dirty : function(ugen) {
    if(typeof ugen !== 'undefined') {
      var found = false;
      for(var i = 0; i < this.dirtied.length; i++) {
        if(this.dirtied[i].variable === ugen.variable) found = true;
      }
    
      if(!found) {
        this.isDirty = true;
        this.dirtied.push(ugen);
      }
    }else{
      this.isDirty = true;
    }
	},
  
	generateSymbol : function(name) {
		return name + "_" + this.id++; 
	},
  
  init : function() {        
    this.out = new this.Bus2();
    Gibberish.dirty(this.out);
    
    this.context = new webkitAudioContext();
    this.node = this.context.createJavaScriptNode(2048, 2, 2, 44100);	
    this.node.onaudioprocess = Gibberish.audioProcess;
    this.node.connect(this.context.destination);
    
    //console.log("INITIALIZED");
    
    return this;
  },
  
	makePanner : function() {
		var sin = Math.sin;
		var cos = Math.cos;
		var sqrtTwoOverTwo = Math.sqrt(2) / 2;
			
		var f = function(val, pan, array) {
      var isObject = typeof val === 'object';
      var l = isObject ? val[0] : val;
      var r = isObject ? val[1] : val;
          
  		array[0] = l * (sqrtTwoOverTwo * (cos(pan) - sin(pan)) );
    	array[1] = r * (sqrtTwoOverTwo * (cos(pan) + sin(pan)) );
          
			return array;
		};
        
		return f;
	},
  
  polyInit : function(ugen) {
    ugen.mod = ugen.polyMod;
    ugen.removeMod = ugen.removePolyMod;
    
    for(var key in ugen.polyProperties) {
      (function(_key) {
        var value = ugen.polyProperties[_key];
        
        Object.defineProperty(ugen, _key, {
          get : function() { return value; },
          set : function(val) { 
            value = val;
            for(var i = 0; i < ugen.children.length; i++) {
              ugen.children[i][_key] = value;
            }
          },
        });
        
      })(key);
    }
  },
  
	// adapted from audioLib.js
	interpolate : (function() {
		var floor = Math.floor;
    
		return function(arr, pos){
			var	first	  = floor(pos),
  				second	= first + 1,
  				frac	  = pos - first;
          
			second		= second < arr.length ? second : 0;
				
			return arr[first] * (1 - frac) + arr[second] * frac;
		};
	})(),
  
  ugen : function() {
    Gibberish.extend(this, {
      processProperties : function(args){
        if(typeof arguments[0][0] === 'object' && typeof arguments[0][0].type === 'undefined' && !Array.isArray(arguments[0][0])) {
          var dict = arguments[0][0];
          for(var key in dict) {
            if(typeof dict[key] !== 'undefined') {
              if(typeof this.properties[key] === 'object' && typeof this.properties[key].binops !== 'undefined') {
                this.properties[key].value = dict[key];
              }else{
                this[key] = dict[key];
              } 
            }
          }
        }else{
          var i = 0;
          for(var key in this.properties) {
            if(typeof this.properties[key] === 'object' && typeof this.properties[key].binops !== 'undefined') {
              if(typeof arguments[0][i] !== 'undefined')
                this.properties[key].value = arguments[0][i++];
            }else{
              if(typeof arguments[0][i] !== 'undefined')
                this.properties[key] = arguments[0][i++];
            }
          }
        }
        return this;
      },
      
      codegen : function() {
        var s = '', 
            v = null,
            initialized = false;
        
        if(Gibberish.memo[this.symbol]) {
          //  console.log("MEMO" + this.symbol);
          return Gibberish.memo[this.symbol];
        }else{
          // we generate the symbol and use it to create our codeblock, but only if the ugen doesn't already have a variable assigned. 
          // since the memo is cleared every time the callback is created, we need to check to see if this exists. 
          v = this.variable ? this.variable : Gibberish.generateSymbol('v');
          Gibberish.memo[this.symbol] = v;
          this.variable = v;
        }

        s += 'var ' + v + " = " + this.symbol + "(";

        //console.log("CODEGEN " + this.symbol);
        for(var key in this.properties) {
          var property = this.properties[key];
          var value = '';
          if(this.name === "single_sample_delay") { console.log( "SSD PROP" + key ); }
          if( Array.isArray( property.value ) ) {
            if(property.value.length === 0) value = 0;  // primarily for busses
            
            for(var i = 0; i < property.value.length; i++) {
              var member = property.value[i];
              if( typeof member === 'object' ) {
            		value += member !== null ? member.codegen() : 'null';
              }else{
              	value += member;
              }
              value += i < property.value.length - 1 ? ', ' : '';
            }
            
          }else if( typeof property.value === 'object' ) {
            //console.log("CODEGEN FOR OBJECT THAT IS A PROPERTY VALUE");
            value = property.value !== null ? property.value.codegen() : 'null';
          }else{
            value = property.value;
          }
        
          s += value;
        
          if(property.binops) {
            for(var j = 0; j < property.binops.length; j++) {
              var op = property.binops[j],
                  val; 
              if( typeof op.ugen === 'number') {
                  val = op.ugen;
              }else{
                  val = op.ugen !== null ? op.ugen.codegen() : 'null';
              }
              
              //console.log("Key : " + key + ", Value : " + val);
              if(op.binop === "=") {
                s = s.replace(value, "");
                s += val;
              }else if(op.binop === "++"){
                Gibberish.upvalues.push('var abs = Math.abs\n;');
                s += ' + abs(' + val + ')';
              }else{
                s += " " + op.binop + " " + val;
              }
            }
          }
      
          s += ", ";
        }
        
        if(s.charAt(s.length - 1) === " ")
          s = s.slice(0, -2); // remove trailing spaces
      
        s += ");\n";
        
        if(this.codeblock === null) {
          Gibberish.upvalues.pushUnique( 'var ' + this.symbol + ' = Gibberish.functions.' + this.symbol + ';\n');
        }
        
        this.codeblock = s;

        this.dirty = false;        
        
        return v;
      },
      
      getCodeblock : function() {
        if(this === null) return;
        //console.log("getting codeblock for " + this.symbol);
        if(this.codeblock === null ) { this.codegen(); }
        
        if(Gibberish.memo[this.symbol]) {
          return;
        }else{
          Gibberish.memo[this.symbol] = this.variable;
        }
        
        if(this.type !== 'analysis') {
          for(var key in this.properties) {
            var property = this.properties[key];
            if( Array.isArray( property.value ) ) {
              var arr = property.value;
            
              for(var i = 0; i < arr.length; i++) {
                var obj = arr[i];
                if(typeof obj === 'object') {
                    if(obj !== null)
                      obj.getCodeblock();
                }
              }

            }else if( typeof property.value === 'object' ) {
                if(property.value !== null) {
                  property.value.getCodeblock();
                }
            }

            if(property.binops) {
              for(var j = 0; j < property.binops.length; j++) {
                var op = property.binops[j];
                if( typeof op.ugen === 'object') {
                   if(op.ugen !== null)
                    op.ugen.getCodeblock();
                }
              }
            }
          }
        }
        
        if(this.type === 'analysis') {
          Gibberish.codeblock.unshift(this.codeblock);
        }else{
          Gibberish.codeblock.push(this.codeblock);
        }
        
        // if(typeof this.fx !== 'undefined') {
        //   for(var i = 0; i < this.fx.length; i++) {
        //     this.fx[i].getCodeblock();
        //   }
        // }
        
        return this.variable;
      },

      defineUgenProperty : function(key, initValue) {
        this.properties[key] = {
          symbol: Gibberish.generateSymbol('v'),
          value:  initValue,
          binops: [],
          getCodeblock : function() { 
            if(typeof this.value !== 'number') Gibberish.codeblock.push("var " + this.symbol + " = " +this.value + ";\n"); 
          },
          codegen : function() { return typeof this.value === 'number' || typeof this.value === 'string' ? this.value : this.symbol; },
          parent : this,
          name : key,
        };
          
        (function(obj) {
          var _key = key;
          Object.defineProperty(obj, _key, {
            configurable: true,
            get: function() 	 { return obj.properties[_key].value },
            set: function(val) { 
              obj.properties[_key].value = val;
              Gibberish.dirty(obj);
            },
          });
        })(this);
      },
      
      init : function(shouldPush) {
        if(typeof shouldPush === 'undefined') shouldPush = false;
        
        if(!this.initalized) {
          this.symbol = Gibberish.generateSymbol(this.name);
          this.codeblock = null;
          this.variable = null;
        }
        
        if(typeof this.properties === 'undefined') {
          this.properties = {};
        }
        
        if(!this.initialized) {
          this.destinations = [];
          
          for(var key in this.properties) {
            this.defineUgenProperty(key, this.properties[key]);
          }
        }
        
        if(arguments.length > 0 && typeof arguments[0][0] === 'object' && arguments[0][0].type === 'undefined') {
          var options = arguments[0][0];
          for(var key in options) {
            this[key] = options[key];
          }
        }
        
        Gibberish.functions[this.symbol] = this.callback;
                
        this.initialized = true;
        
        return this;
      },
            
      mod : function(name, value, op) {
        var property = this.properties[ name ];
        var mod = { ugen:value, binop:op };
       	property.binops.push( mod );
        
        Gibberish.dirty( this );
      },
      
      removeMod : function(name, arg) {
        if(typeof arg === 'undefined' ) {
          this.properties[name].binops.length = 0;
        }else if(typeof arg === 'number') {
          this.properties[name].binops.splice(arg, 1);
        }else if(typeof arg === 'object') {
          for(var i = 0, j = this.properties[name].binops.length; i < j; i++) {
            if(this.properties[name].binops[i].ugen === arg) {
              this.properties[name].binops.splice(i, 1);
            }
          }
        };
        
        Gibberish.dirty( this );
      },
      
  		polyMod : function(name, modulator, type) {
  			for(var i = 0; i < this.children.length; i++) {
  				this.children[i].mod(name, modulator, type);
  			}
  			Gibberish.dirty(this);
  		},
      
  		removePolyMod : function() {
  			var args = Array.prototype.slice.call(arguments, 0);
        
  			if(arguments[0] !== "amp" && arguments[0] !== "pan") {
  				for(var i = 0; i < this.children.length; i++) {
  					this.children[i].removeMod.apply(this.children[i], args);
  				}
  			}else{
  				this.removeMod.apply(this, args);
  			}
        
  			Gibberish.dirty(this);
  		},
      
      smooth : function(property, amount) {
        var op = new Gibberish.OnePole();
        //op.smooth(this, property);
        this.mod(property, op, "=");
      },
      
      connect : function(bus) {
        if(typeof bus === 'undefined') bus = Gibberish.out;
        
        if(this.destinations.indexOf(bus) === -1 ){
          bus.addConnection( this, 1 );
          this.destinations.push( bus );
        }
        return this;
      },
    
      send : function(bus, amount) {
        if(this.destinations.indexOf(bus) === -1 ){
          bus.addConnection( this, amount );
          this.destinations.push( bus );
        }else{
          bus.adjustSendAmount(this, amount);
        }
        return this;
      },
      
      disconnect : function(bus) {
        if(typeof bus === 'undefined') {
          for(var i = 0; i < this.destinations.length; i++) {
            this.destinations[i].removeConnection( this );
            this.destiGibbenations.splice(i);
          }
        }else{
          bus.removeConnection( this );
        }
        return this;
      },
    });
  },
};

Array2 = function() { 
  this.length = 0;
};

Array2.prototype = [];
	
Array2.prototype.remove = function(arg, searchDeep) { // searchDeep when true removes -all- matches, when false returns first one found.
	searchDeep = typeof searchDeep === 'undefined' ? true : searchDeep;
	if(typeof arg === "undefined") { // clear all
		for(var i = 0; i < this.length; i++) {
			delete this[i];
		}
		this.length = 0;
	}else if(typeof arg === "number") {
		this.splice(arg,1);
	}else if(typeof arg === "string"){ // find named member and remove
		var removeMe = [];
		for(var i = 0; i < this.length; i++) {
			var member = this[i];
			if(member.type === arg || member.name === arg) {
				if(!searchDeep) {
					this.splice(i,1);
					return;
				}else{
					removeMe.push(i);
				}
			}
		}
		for(var i = 0; i < removeMe.length; i++) {
			this.splice( removeMe[i], 1);
		}
	}else if(typeof arg === "object") {
		var idx = this.indexOf(arg);
		while(idx > -1) {
			this.splice(idx,1);
			idx = this.indexOf(arg);
		}
	}
	if(this.parent) Gibberish.dirty(this.parent);
};
	
Array2.prototype.get = function(arg) {
	if(typeof arg === "number") {
		return this[arg];
	}else if(typeof arg === "string"){ // find named member and remove
		for(var i = 0; i < this.length; i++) {
			var member = this[i];

			if(member.name === arg) {
				return member;
			}
		}
	}else if(typeof arg === "object") {
		var idx = this.indexOf(arg);
		if(idx > -1) {
			return this[idx];
		}
	}
	return null;
};
	

Array2.prototype.replace = function(oldObj, newObj) {
	newObj.parent = this;
  newObj.input = oldObj.input;
  
	if(typeof oldObj != "number") {
		var idx = this.indexOf(oldObj);
		if(idx > -1) {
			this.splice(idx, 1, newObj);
		}
	}else{
		this.splice(oldObj, 1, newObj);
	}
	if(this.parent) Gibberish.dirty(this.parent);
};

Array2.prototype.insert = function(v, pos) {
	v.parent = this;
  this.input = this.parent;
  
	if(Array.isArray(v)) {
		for(var i = 0; i < v.length; i++) {
			this.splice(pos + i, 0, v[i]);
		}
	}else{
		this.splice(pos,0,v);
	}
	if(this.parent) Gibberish.dirty(this.parent);
};

Array2.prototype.add = function() {
	for(var i = 0; i < arguments.length; i++) {
		arguments[i].parent = this;
    arguments[i].input = this.parent;
		//console.log(this.parent, this.parent.channels);
		//if(typeof this.parent.channels === "number") {
			//console.log("CHANGING CHANNELS");
			//arguments[i].channels = this.parent.channels;
    //}
		this.push(arguments[i]);
	}
	//console.log("ADDING ::: this.parent = ", this.parent)
	if(this.parent) {  
    console.log("DIRTYING");
  	Gibberish.dirty(this.parent);
  }
		
};
	
Array.prototype.pushUnique = function() {
	for(var i = 0; i < arguments.length; i++) {
		var obj = arguments[i];
		var shouldAdd = true;
		for(var j = 0; j < this.length; j++) {
			if(obj === this[j]) {
				shouldAdd = false;
				break;
			}
		}
		if(shouldAdd) {
			this.push(obj);
		}
	}
};

var rnd = Math.random;
Gibberish.rndf = function(min, max, number, canRepeat) {
	canRepeat = typeof canRepeat === "undefined" ? true : canRepeat;
	if(typeof number === "undefined" && typeof min != "object") {
		if(arguments.length == 1) {
			min = 0, max = arguments[0];
		}else if(arguments.length == 2) {
			min = arguments[0];
			max = arguments[1];
		}else{
			min = 0;
			max = 1;
		}
	
		var diff = max - min;
		var r = rnd();
		var rr = diff * r;
	
		return min + rr;
	}else{
		var output = [];
		var tmp = [];
		if(typeof number === "undefined") {
			number = max || min.length;
		}
		
		for(var i = 0; i < number; i++) {
			var num;
			if(typeof arguments[0] === "object") {
				num = arguments[0][randomi(0, arguments[0].length - 1)];
			}else{
				if(canRepeat) {
					num = Gibberish.rndf(min, max);
				}else{
					num = Gibberish.rndf(min, max);
					while(tmp.indexOf(num) > -1) {
						num = Gibberish.rndf(min, max);
					}
					tmp.push(num);
				}
			}
			output.push(num);
		}
		return output;
	}
};

Gibberish.extend = function(destination, source) {
    for (var property in source) {
			var keys = property.split(".");
			if(source[property] instanceof Array && source[property].length < 100) { // don't copy large array buffers
		    destination[property] = source[property].slice(0);
				if(property === "fx") {
					destination[property].parent = source[property].parent;
				}
      }else if (typeof source[property] === "object" && source[property] !== null && !(source[property] instanceof Float32Array) ) {
          destination[property] = destination[property] || {};
          arguments.callee(destination[property], source[property]);
      } else {
          destination[property] = source[property];
      }
    }
    return destination;
};
	
Function.prototype.clone=function(){
    return eval('['+this.toString()+']')[0];
};

String.prototype.format = function(i, safe, arg) {
    function format() {
        var str = this,
            len = arguments.length + 1;

        for (i = 0; i < len; arg = arguments[i++]) {
            safe = arg; //typeof arg === 'object' ? JSON.stringify(arg) : arg;
            str = str.replace(RegExp('\\{' + (i - 1) + '\\}', 'g'), safe);
        }
        return str;
    }

    format.native = String.prototype.format;

    return format;
}();
Gibberish.Proxy = function() {
  var value = 0;
      
	Gibberish.extend(this, {
  	name: 'proxy',
    type: 'effect',
    
    properties : {},
    
    callback : function() {
      return value;
    },
  }).init();
  
  this.input = arguments[0];
  
  value = this.input.parent[ this.input.name ];
  delete this.input.parent[ this.input.name ];
    
  this.input.parent.properties[ this.input.name ].value = this;
  
  Object.defineProperty( this.input.parent, this.input.name, {
    get : function(){ return value; },
    set : function(_value) { value = _value; }
  });
  Gibberish.dirty(this.input.parent);
};
Gibberish.Proxy.prototype = new Gibberish.ugen();
Gibberish.oscillator = function() {
  this.type = 'oscillator';
  
  this.oscillatorInit = function() {
    this.fx = new Array2; 
    this.fx.parent = this;
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
Gibberish.bus = function(){
  this.type = 'bus';
  
  this.inputCodegen = function() {
    var val = this.value.codegen();
    var str = this.amp === 1 ? val : val + ' * ' + this.amp;
    this.codeblock = str;
    return str;
  };
    
  this.addConnection = function() {
    var arg = { 
      value:	      arguments[0], 
      amp:		      arguments[1], 
      codegen:      this.inputCodegen,
    };
    arg.getCodeblock = arg.value.getCodeblock.bind( arg.value );
    
    this.inputs.push( arg );

    Gibberish.dirty( this );
  };
  
  this.removeConnection = function(ugen) {
    for(var i = 0; i < this.inputs.length; i++) {
      if(this.inputs[i].value === ugen) {
        this.inputs.splice(i,1);
        Gibberish.dirty(this);
        break;
      }
    }
  };
  
  this.adjustSendAmount = function(ugen, amp) {
    for(var i = 0; i < this.inputs.length; i++) {
      if(this.inputs[i].value === ugen) {
        this.inputs[i].amp = amp;
        Gibberish.dirty(this);
        break;
      }
    }
  };
  
  this.callback = function() {
    var amp = arguments[arguments.length - 2]; // use arguments to accommodate arbitray number of inputs without using array
    var pan = arguments[arguments.length - 1];
    
    output[0] = output[1] = 0;
    
    for(var i = 0; i < arguments.length - 2; i++) {
      var isObject = typeof arguments[i] === 'object';
      output[0] += isObject ? arguments[i][0] : arguments[i];
      output[1] += isObject ? arguments[i][1] : arguments[i];
    }
    
    output[0] *= amp;
    output[1] *= amp;
    return panner(output, pan, output);
  };
};
Gibberish.bus.prototype = new Gibberish.ugen();
Gibberish._bus = new Gibberish.bus();

Gibberish.Bus = function() {  
  Gibberish.extend(this, {
    name : 'bus',
        
    properties : {
      inputs :  [],
      amp :     arguments[1] || 1,
    },

    callback : function() {
      var out = 0;
      var length = arguments.length - 1;
      var amp = arguments[length]; // use arguments to accommodate arbitray number of inputs without using array
      
      for(var i = 0; i < length; i++) {
        out += args[i];
      }
      out *= amp;
      
      return out;
    },
  });

  this.init();
  
  return this;
};
Gibberish.Bus.prototype = Gibberish._bus;

Gibberish.Bus2 = function() {
  this.name = "bus2";
  this.type = 'bus';
  
  this.properties = {
    inputs :  [],
    amp :     arguments[1] || 1,
    pan :     0,
  };
  
  var output = [0,0],
      panner = Gibberish.makePanner();
  
  this.callback = function() {    
    var amp = arguments[arguments.length - 2]; // use arguments to accommodate arbitray number of inputs without using array
    var pan = arguments[arguments .length - 1];
    
    output[0] = output[1] = 0;
    
    for(var i = 0; i < arguments.length - 2; i++) {
      var isObject = typeof arguments[i] === 'object';
      output[0] += isObject ? arguments[i][0] : arguments[i];
      output[1] += isObject ? arguments[i][1] : arguments[i];
    }
    
    output[0] *= amp;
    output[1] *= amp;
    return panner(output, pan, output);
  };
  
  this.initialized = false;
  this.init();
};
Gibberish.Bus2.prototype = Gibberish._bus;
Gibberish.envelope = function() {
    this.type = 'envelope';
};
Gibberish.envelope.prototype = new Gibberish.ugen();
Gibberish._envelope = new Gibberish.envelope();

Gibberish.Line = function(start, end, time, loops) {
	var that = { 
		name:		'line',

    properties : {
  		start:	start || 0,
  		end:		isNaN(end) ? 1 : end,
  		time:		time || 44100,
  		loops:	loops || false,
    }
	};

	var phase = 0;
	var incr = (end - start) / time;

	this.callback = function(start, end, time, loops) {
		var out = phase < time ? start + ( phase++ * incr) : end;
				
		phase = (out >= end && loops) ? 0 : phase;
				
		return out;
	};

	Gibberish.extend(this, that);
  this.init();

  return this;
};
Gibberish.Line.prototype = Gibberish._envelope;

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
  		attack = attack < 0 ? _4 : attack;
  		decay  = decay  < 0 ? _4 : decay;				
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

Gibberish.ADSR = function(attack, decay, sustain, release, attackLevel, sustainLevel) {
	var that = { 
    name:   "adsr",
		type:		"envelope",
    
    properties: {
  		attack:		isNaN(attack) ? 10000 : attack,
  		decay:		isNaN(decay) ? 10000 : decay,
  		release:	isNaN(release) ? 10000 : release,
  		sustain: 	typeof sustain === "undefined" ? 88200 : sustain,
  		attackLevel:  attackLevel || 1,
  		sustainLevel: sustainLevel || .5,
    },

		run: function() {
			this.setPhase(0);
			this.setState(0);
		},
	};
	Gibberish.extend(this, that);
	
	var phase = 0;
	var state = 0;
	this.callback = function(attack,decay,sustain,release,attackLevel,sustainLevel) {
		var val = 0;
		if(state === 0){
			val = phase / attack * attackLevel;
			if(++phase / attack === 1) {
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
			if(phase-- === 0) {
				state++;
				phase = release;
			}
		}else if(state === 3) {
      phase--;
			val = (phase / release) * sustainLevel;
			if(phase <= 0) state++;
		}
		return val;
	};
	this.setPhase = function(newPhase) { phase = newPhase; };
	this.setState = function(newState) { state = newState; phase = 0; };
	this.getState = function() { return state; };		
	
  this.init();
  
	return this;
};
Gibberish.ADSR.prototype = Gibberish._envelope;
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
    }
    Gibberish.upvalues.push( 'var ' + this.symbol + ' = Gibberish.functions.' + this.symbol + ';\n');
    this.codeblock = "var " + this.variable + " = " + this.symbol + "();\n";
    
    return this.variable;
  }
  
  this.codegen2 = function() {
    for(var key in this.properties) {
      var property = this.properties[key];
      if( Array.isArray( property.value ) ) {
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
        //console.log("CODEGEN FOR OBJECT THAT IS A PROPERTY VALUE");
        
        //console.log(property.value);
        if(!Gibberish.memo[property.value.symbol]) {
          property.value.type = 'ddd';
          
          property.value.codegen();
          property.value.getCodeblock();
          Gibberish.codeblock.push(property.value.codeblock);
        
          //console.log(Gibberish.codeblock);
          property.value.type = 'analysis';
        
          var v = property.value.variable ? property.value.variable : Gibberish.generateSymbol('v');
          Gibberish.memo[property.value.symbol] = v;
          property.value.variable = v;
          Gibberish.codestring = 'var ' + property.value.symbol + ' = Gibberish.functions.' + property.value.symbol + ';\n' + Gibberish.codestring;
        }
      }
        
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
    var s = this.analysisSymbol + "(" + this.input.variable + ",";
    for(var key in this.properties) {
      if(key !== 'input') {
        s += this[key] + ",";
      }
    }
    s = s.slice(0, -1);
    s += ");";
    
    this.analysisCodeblock = s;
    
    return s;
  };
  
  this.analysisInit = function() {    
    this.analysisSymbol = Gibberish.generateSymbol(this.name);
    Gibberish.functions[this.analysisSymbol] = this.analysisCallback;
    Gibberish.upvalues.push( 'var ' + this.analysisSymbol + ' = Gibberish.functions.' + this.analysisSymbol + ';\n');
    Gibberish.analysisUgens.push( this );
  };
};
Gibberish.analysis.prototype = new Gibberish.ugen();
Gibberish._analysis = new Gibberish.analysis();

Gibberish.Follow = function() {
  this.name = 'follow';
    
  this.properties = {
    mult  : 1,
    input : 0,
    bufferSize : 4410,
  };
    
  var abs = Math.abs,
      history = [0],
      sum = 0,
      index = 0,
      value = 0;
			
  this.analysisCallback = function(input, bufferSize, mult) {
  	sum += abs(input);
  	sum -= history[index];
  	history[index] = abs(input);
  	index = (index + 1) % bufferSize;
			
    // if history[index] isn't defined set it to 0	
    history[index] = history[index] ? history[index] : 0;
  	value = (sum / bufferSize) * mult;
  };
    
  this.callback = function() { return value; };
    
  this.init();
};
Gibberish.Follow.prototype = Gibberish._analysis;

Gibberish.SingleSampleDelay = function() {
  this.name = 'single_sample_delay';
  
  this.properties = {
    input : arguments[0] || 0,
    amp   : arguments[1] || 1,
  };
  
  var value = 0;
  
  this.analysisCallback = function(input, amp) {
    if(typeof input === 'object') {
      value = typeof input === 'object' ? [input[0] * amp, input[1] * amp ] : input * amp;
    }else{
      value = input * amp;
    }
  };
  
  this.callback = function() {
    return value;
  };
    
  this.init();
  this.analysisInit();
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


Gibberish.effect = function() {
    this.type = 'effect';
};
Gibberish.effect.prototype = new Gibberish.ugen();
Gibberish._effect = new Gibberish.effect();

Gibberish.Distortion = function() {
  var abs = Math.abs, 
      log = Math.log, 
      ln2 = Math.LN2;
  
  Gibberish.extend(this, {
    name : 'distortion',
    
    properties : {
      input  : 0,
      amount : 50,
    },
    
    callback : function(input, amount) {
      var x;
      if(typeof input === 'number') {
    		x = input * amount;
    		input = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide
      }else{
        x = input[0] * amount;
        input[0] = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide
        x = input[1] * amount;
        input[1] = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide      
      }
  		return input;
    },
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Distortion.prototype = Gibberish._effect;

Gibberish.Delay = function() {
  var buffers = [],
      phase = 0;
  
  buffers.push( new Float32Array(88200) );
  buffers.push( new Float32Array(88200) );
  
  Gibberish.extend(this, {
  	name:"Delay",
  	properties:{ input:0, time: 22050, feedback: .5, channels:1 },
				
  	callback : function(sample, time, feedback) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var _phase = phase++ % 88200;
      
  		var delayPos = (_phase + time) % 88200;
      if(channels === 1) {
  			buffers[0][delayPos] =  (sample + buffers[0][_phase]) * feedback;
        sample += buffers[0][_phase];
      }else{
  			buffers[0][delayPos] =  (sample[0] + buffers[0][_phase]) * feedback;
        sample[0] += buffers[0][_phase];
  			buffers[1][delayPos] =  (sample[1] + buffers[1][_phase]) * feedback;
        sample[1] += buffers[1][_phase];   
      }
      
  		return sample;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Delay.prototype = Gibberish._effect;

// adapted from code / comments at http://musicdsp.org/showArchiveComment.php?ArchiveID=124
Gibberish.Decimator = function() {
  var counter = 0,
      hold = [],
      pow = Math.pow,
      floor = Math.floor;
      
  Gibberish.extend(this, {
  	name:"Decimator",
  	properties:{ input:0, bitDepth: 16, sampleRate: 1 },
				
  	callback : function(sample, depth, rate) {
  		counter += rate;
      var channels = typeof sample === 'number' ? 1 : 2;
      
      if(channels === 1) {
  			if(counter >= 1) {
  				var bitMult = pow( depth, 2.0 );
  				hold[0]  = floor( sample * bitMult ) / bitMult;
  				counter -= 1;
  			}
  			sample = hold[0];
      }else{
  			if(counter >= 1) {
  				var bitMult = pow( depth, 2.0 );
  				hold[0]  = floor( sample[0] * bitMult ) / bitMult;
  				hold[1]  = floor( sample[1] * bitMult ) / bitMult;          
  				counter -= 1;
  			}
  			sample = hold;
      }
					
  		return sample;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Decimator.prototype = Gibberish._effect;

Gibberish.RingModulation = function() {
  var sin = new Gibberish.Sine().callback,
      output = [0,0];
      
  Gibberish.extend( this, { 
  	name : "ringmod",
  
	  properties : { input:0, frequency:440, amp:.5, mix:.5 },

    callback : function(sample, frequency, amp, mix) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
      var mod = sin(frequency, amp);
      
      output1 = output1 * (1-mix) + (output1 * mod) * mix;
      
      if(channels === 2) {
        var output2 = sample[1];
        output2 = output2 * (1-mix) + (output2 * mod) * mix;

        output[0] = output1;
        output[1] = output2;
        return output;
      }
      
		  return output1; // return mono
  	},
  })
  .init()
  .processProperties(arguments); 
};
Gibberish.RingModulation.prototype = Gibberish._effect;

Gibberish.OnePole = function() {
  var history = 0,
      phase = 0;
      
	Gibberish.extend(this, {
  	name: 'onepole',
    type: 'effect',
    
    properties : {
      input : null,
      a0 : .15,           
      b1 : .85, 
    },
    
    callback : function(input, a0, b1) {
      var out = input * a0 + history * b1;
      history = out;
    
      return out;
    },
    
    smooth : function(propName, obj) {
      this.input = obj.properties[propName];
      obj.mod(propName, this, '=');
    },
  })
  .init()
  .processProperties(arguments);
};
Gibberish.OnePole.prototype = Gibberish._effect;

// adapted from Arif Ove Karlsne's 24dB ladder approximation: http://musicdsp.org/showArchiveComment.php?ArchiveID=141
Gibberish.Filter24 = function() {
  var poles  = [0,0,0,0],
      poles2 = [0,0,0,0],
      output = [0,0],
      phase  = 0,
      _cutoff = isNaN(arguments[0]) ? .1 : arguments[0],
      _resonance = isNaN(arguments[1]) ? 3 : arguments[1]
      _isLowPass = typeof arguments[2] !== 'undefined' ? arguments[2] : true;
      
  Gibberish.extend( this, { 
  	name : "filter24",
  
	  properties : { input:0, cutoff:_cutoff, resonance:_resonance, isLowPass:_isLowPass },

    callback : function(sample, cutoff, resonance, isLowPass) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
			var rezz = poles[3] * resonance; 
			rezz = rezz > 1 ? 1 : rezz;
						
			cutoff = cutoff < 0 ? 0 : cutoff;
			cutoff = cutoff > 1 ? 1 : cutoff;
						
			output1 -= rezz;

			poles[0] = poles[0] + ((-poles[0] + output1) * cutoff);
			poles[1] = poles[1] + ((-poles[1] + poles[0])  * cutoff);
			poles[2] = poles[2] + ((-poles[2] + poles[1])  * cutoff);
			poles[3] = poles[3] + ((-poles[3] + poles[2])  * cutoff);

			output1 = isLowPass ? poles[3] : output1 - poles[3];
      
      if(channels === 2) {
        var output2 = sample[1];

  			rezz = poles2[3] * resonance; 
  			rezz = rezz > 1 ? 1 : rezz;

  			output2 -= rezz;

  			poles2[0] = poles2[0] + ((-poles2[0] + output2) * cutoff);
  			poles2[1] = poles2[1] + ((-poles2[1] + poles2[0])  * cutoff);
  			poles2[2] = poles2[2] + ((-poles2[2] + poles2[1])  * cutoff);
  			poles2[3] = poles2[3] + ((-poles2[3] + poles2[2])  * cutoff);

  			output2 = isLowPass ? poles2[3] : output2 - poles2[3];
        output[0] = output1;
        output[1] = output1;
        
        return output;
      }
      
		  return output1; // return mono
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Filter24.prototype = Gibberish._effect;

Gibberish.SVF = function() {
	var d1 = [0,0], d2 = [0,0], pi= Math.PI, out = [0,0];
  
  Gibberish.extend( this, {
  	name:"SVF",
  	properties : { input:0, cutoff:440, Q:2, mode:0 },
				
  	callback: function(sample, frequency, Q, mode) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
  		var f1 = 2 * pi * frequency / 44100;
  		Q = 1 / Q;
					
			var l = d2[0] + f1 * d1[0];
			var h = output1 - l - Q * d1[0];
			var b = f1 * h + d1[0];
			var n = h + l;
						
			d1[0] = b;
			d2[0] = l;
      
			if(mode === 0) 
				output1 = l;
			else if(mode === 1)
				output1 = h;
			else if(mode === 2)
				output1 = b;
			else
				output1 = n;
        
      if(channels === 2) {
        var output2 = sample[1];
  			var l = d2[1] + f1 * d1[1];
  			var h = output2 - l - Q * d1[1];
  			var b = f1 * h + d1[1];
  			var n = h + l;
						
  			d1[1] = b;
  			d2[1] = l;
      
  			if(mode === 0) 
  				output2 = l;
  			else if(mode === 1)
  				output2 = h;
  			else if(mode === 2)
  				output2 = b;
  			else
  				output2 = n;
          
        out[0] = output1; out[1] = output2;
      }else{
        out = output1;
      }

  		return out;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.SVF.prototype = Gibberish._effect;

Gibberish.Biquad = function() {
  var x1 = [0,0],
      x2 = [0,0],
      y1 = [0,0],
      y2 = [0,0],
      out = [0,0];
      
	Gibberish.extend(this, {
		name: "biquad",
    mode : "LP",
  	cutoff : 2000,
    Q : .5,
    
	  properties: {
      input: null,
							
	    b0: 0.001639,
	    b1: 0.003278,
	    b2: 0.001639,
	    a1: -1.955777,
	    a2: 0.960601,
	  },

	  calculateCoefficients: function() {
      switch (this.mode) {
	      case "LP":
           var w0 = 2 * Math.PI * this.cutoff / 44100,
               sinw0 = Math.sin(w0),
               cosw0 = Math.cos(w0),
               alpha = sinw0 / (2 * this.Q),
               b0 = (1 - cosw0) / 2,
               b1 = 1 - cosw0,
               b2 = b0,
               a0 = 1 + alpha,
               a1 = -2 * cosw0,
               a2 = 1 - alpha;
           break;
	       case "HP":
           var w0 = 2 * Math.PI * this.cutoff / 44100,
               sinw0 = Math.sin(w0),
               cosw0 = Math.cos(w0),
               alpha = sinw0 / (2 * this.Q),
               b0 = (1 + cosw0) / 2,
               b1 = -(1 + cosw0),
               b2 = b0,
               a0 = 1 + alpha,
               a1 = -2 * cosw0,
               a2 = 1 - alpha;
           break;
	       case "BP":
           var w0 = 2 * Math.PI * this.cutoff / 44100,
               sinw0 = Math.sin(w0),
               cosw0 = Math.cos(w0),
               toSinh = Math.log(2) / 2 * this.Q * w0 / sinw0,
               alpha = sinw0 * (Math.exp(toSinh) - Math.exp(-toSinh)) / 2,
               b0 = alpha,
               b1 = 0,
               b2 = -alpha,
               a0 = 1 + alpha,
               a1 = -2 * cosw0,
               a2 = 1 - alpha;
           break;
	       default:
           return;
       }

       this.b0 = b0 / a0;
       this.b1 = b1 / a0;
       this.b2 = b2 / a0;
       this.a1 = a1 / a0;
       this.a2 = a2 / a0;
    },
    call : function(x) {
      return this.function(x, this.b0, this.b1, this.b2, this.a1, this.a2);
    },
    callback: function(x, b0, b1, b2, a1, a2) {
      var channels = typeof x === 'number' ? 1 : 2,
          outL = 0,
          outR = 0,
          inL = channels === 1 ? x : x[0];
      
      outL = b0 * inL + b1 * x1[0] + b2 * x2[0] - a1 * y1[0] - a2 * y2[0];
      x2[0] = x1[0];
      x1[0] = x[0];
      y2[0] = y1[0];
      y1[0] = outL;
      
      if(channels === 2) {
        inR = x[1];
        outR = b0 * inR + b1 * x1[1] + b2 * x2[1] - a1 * y1[1] - a2 * y2[1];
        x2[1] = x1[1];
        x1[1] = x[1];
        y2[1] = y1[1];
        y1[1] = outR;
        
        out[0] = outL;
        out[1] = outR;
      }
      return channels === 1 ? outL : out;
    },
	})
  .init()
  .processProperties(arguments);
  
  this.calculateCoefficients();
};
Gibberish.Biquad.prototype = Gibberish._effect;

Gibberish.Flanger = function() {
	var buffers =	        [ new Float32Array(88200), new Float32Array(88200) ],
	    bufferLength =    88200,
	    delayModulation =	new Gibberish.Sine().callback,
	    interpolate =		  Gibberish.interpolate,
	    readIndex =			  -100,
	    writeIndex = 		  0,
	    phase =				    0;
      
	Gibberish.extend(this, {
    name:"flanger",
  	properties:{ input:0, rate:.25, amount:125, feedback:0, offset:125 },
    
  	callback : function(sample, delayModulationRate, delayModulationAmount, feedback, offset, channels) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var delayIndex = readIndex + delayModulation( delayModulationRate, delayModulationAmount * .95 );

  		if(delayIndex > bufferLength) {
  			delayIndex -= bufferLength;
  		}else if(delayIndex < 0) {
  			delayIndex += bufferLength;
  		}
					
			var delayedSample = interpolate(buffers[0], delayIndex);
			buffers[0][writeIndex] = channels === 1 ? sample + (delayedSample * feedback): sample[0] + (delayedSample * feedback);
				
      if(channels === 2) {
        sample[0] += delayedSample;
        
  			delayedSample = interpolate(buffers[1], delayIndex);
  			buffers[1][writeIndex] = sample[1] + (delayedSample * feedback);
        
        sample[1] += delayedSample;
      }else{
        sample += delayedSample;
      }
			
  		if(++writeIndex >= bufferLength) writeIndex = 0;
  		if(++readIndex  >= bufferLength) readIndex  = 0;

  		return sample;
  	},	
  })
  .init()
  .processProperties(arguments);

	readIndex = this.offset * -1;
};
Gibberish.Flanger.prototype = Gibberish._effect;

Gibberish.Vibrato = function() {
	var buffers =	        [ new Float32Array(88200), new Float32Array(88200) ],
	    bufferLength =    88200,
	    delayModulation =	new Gibberish.Sine().callback,
	    interpolate =		  Gibberish.interpolate,
	    readIndex =			  -100,
	    writeIndex = 		  0,
	    phase =				    0;
      
	Gibberish.extend(this, {
    name:"vibrato",
  	properties:{ input:0, rate:5, amount:.5, offset:125 },
    
  	callback : function(sample, delayModulationRate, delayModulationAmount, offset, channels) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var delayIndex = readIndex + delayModulation( delayModulationRate, delayModulationAmount * offset - 1 );

  		if(delayIndex > bufferLength) {
  			delayIndex -= bufferLength;
  		}else if(delayIndex < 0) {
  			delayIndex += bufferLength;
  		}
					
			var delayedSample = interpolate(buffers[0], delayIndex);
			buffers[0][writeIndex] = channels === 1 ? sample : sample[0];
				
      if(channels === 2) {
        sample[0] = delayedSample;
        
  			delayedSample = interpolate(buffers[1], delayIndex);
  			buffers[1][writeIndex] = sample[1];
        
        sample[1] = delayedSample;
      }else{
        sample = delayedSample;
      }
			
  		if(++writeIndex >= bufferLength) writeIndex = 0;
  		if(++readIndex  >= bufferLength) readIndex  = 0;

  		return sample;
  	},	
  })
  .init()
  .processProperties(arguments);

	readIndex = this.offset * -1;
};
Gibberish.Vibrato.prototype = Gibberish._effect;

Gibberish.BufferShuffler = function() {
	var buffers = [ new Float32Array(88200), new Float32Array(88200) ],
    	bufferLength = 88200,  
  		readIndex = 0,
  		writeIndex = 0,
  		randomizeCheckIndex = 0,
  		shuffleTimeKeeper = 0,
  		isShuffling = 0,
  		random = Math.random,
  		fadeIndex = 0,
  		fadeAmount = 1,
  		isFadingWetIn = false,
  		isFadingDryIn = false,
  		reversed = false,
  		interpolate = Gibberish.interpolate,
  		pitchShifting = false,
  		speed = 1,
  		isBufferFull = false,
      rndf = Gibberish.rndf,
      _output = [0,0];
	
	Gibberish.extend(this, {
    name:"buffer_shuffler",
	
  	properties: { input:0, chance:.25, rate:11025, length:22050, reverseChange:.5, pitchChance:.5, pitchMin:.25, pitchMax:2, wet:1, dry:0 },

  	callback : function(sample, chance, rate, length, reverseChance, pitchChance, pitchMin, pitchMax, wet, dry) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		if(!isShuffling) {
        buffers[0][writeIndex] = channels === 1 ? sample : sample[0];
        buffers[1][writeIndex] = channels === 1 ? sample : sample[1]; // won't be used but with one handle but probably cheaper than an if statement?
                
  			writeIndex++
  			writeIndex %= bufferLength;

  			isBufferFull = writeIndex === 0 ? 1 : isBufferFull; // don't output buffered audio until a buffer is full... otherwise you just get a gap
						
  			randomizeCheckIndex++;

  			if(randomizeCheckIndex % rate == 0 && random() < chance) {
  				reversed = random() < reverseChance;
  				isShuffling = true;
  				if(!reversed) {
  					readIndex = writeIndex - length;
  					if(readIndex < 0) readIndex = bufferLength + readIndex;
  				}
  				pitchShifting = random() < pitchChance;
  				if(pitchShifting) {
  					speed = rndf(pitchMin, pitchMax);
  				}
  				fadeAmount = 1;
  				isFadingWetIn = true;
  				isFadingDryIn = false;
  			}
  		}else if(++shuffleTimeKeeper % (length - 400) === 0) {
  			isFadingWetIn = false;
  			isFadingDryIn = true;
  			fadeAmount = 1;
  			shuffleTimeKeeper = 0;
  		}
					
  		readIndex += reversed ? speed * -1 : speed;
  		if(readIndex < 0) {
  			readIndex += bufferLength;
  		}else if( readIndex > bufferLength) {
  			readIndex -= bufferLength;
  		}
					
  		var outSampleL = interpolate(buffers[0], readIndex);
			
      var outL, outR, shuffle, outSampleR;			
			if(isFadingWetIn) {						
				fadeAmount -= .0025;
        
        shuffle = (outSampleL * (1 - fadeAmount));
				outL = channels === 1 ? shuffle + (sample * fadeAmount) : shuffle + (sample[0] * fadeAmount);
        
        if(channels === 2) {
          outSampleR = interpolate(buffers[1], readIndex);
          shuffle = (outSampleR * (1 - fadeAmount));
          outR = channels === 1 ? outL : shuffle + (sample[1] * fadeAmount);
        }

				if(fadeAmount <= .0025) isFadingWetIn = false;
			}else if(isFadingDryIn) {						
				fadeAmount -= .0025;
        
        shuffle = outSampleL * fadeAmount;
				outL = channels === 1 ? shuffle + (sample * fadeAmount) : shuffle + (sample[0] * (1 - fadeAmount));
        
        if(channels === 2) {
          outSampleR = interpolate(buffers[1], readIndex);
          shuffle = outSampleR * fadeAmount;
          outR = shuffle + (sample[1] * (1 - fadeAmount));
        }
        
				if(fadeAmount <= .0025) { 
					isFadingDryIn = false;
					isShuffling = false;
					reversed = false;
					speed = 1;
					pitchShifting = 0;
				}
			}else{
        if(channels === 1) {
          outL = isShuffling && isBufferFull ? (outSampleL * wet) + sample * dry : sample;
        }else{
          outSampleR = interpolate(buffers[1], readIndex);
          outL = isShuffling && isBufferFull ? (outSampleL * wet) + sample[0] * dry : sample[0];
          outR = isShuffling && isBufferFull ? (outSampleR * wet) + sample[1] * dry : sample[1];          
        }
			}
      _output = [outL, outR];
  		return channels === 1 ? outL : _output;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.BufferShuffler.prototype = Gibberish._effect;

Gibberish.AllPass = function(time, feedback) {
	var index  = -1,
    	buffer =	new Float32Array(time || 500),
      bufferLength = buffer.length;
  
  Gibberish.extend(this, {
		name:		"allpass",
    properties: {
      input   : 0,
    },
    callback : function(sample) {
  		index = ++index % bufferLength;
  		var bufferSample = buffer[index];
  		var out = -1 * sample + bufferSample;

  		buffer[index] = sample + (bufferSample * .5);
  		return out;
  	},
	});
  
};
/*
adapted from audioLib.js, in turn adapted from Freeverb source code
this is actually a lowpass-feedback-comb filter (https://ccrma.stanford.edu/~jos/pasp/Lowpass_Feedback_Comb_Filter.html)
*/
Gibberish.Comb = function(time) {
	var buffer = new Float32Array(time || 1200),
    	bufferLength = buffer.length,
    	index = 0,
    	store = 0;
      
	Gibberish.extend(this, {
		name:		"comb",
    properties : {
      input : 0,
  		time:		time || 1200,
    },
    
  	callback: function(sample) {
  		var currentPos = ++index % bufferLength;
			var out = buffer[currentPos];
						
			store = (out * .8) + (store * .2);
						
			buffer[currentPos] = sample + (store * .84);

  		return out;
  	},
	});
  
};

// adapted from audioLib.js
Gibberish.Reverb = function() {
  var tuning =	{
		    combCount: 		8,
		    combTuning: 	[1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617],

		    allPassCount: 	4,
		    allPassTuning: 	[556, 441, 341, 225],
		    allPassFeedback:0.5,

		    fixedGain: 		0.015,
		    scaleDamping: 	0.9,

		    scaleRoom: 		0.28,
		    offsetRoom: 	0.7,

		    stereoSpread: 	23
		},
    combs = [],
    apfs  = [],
    output   = [0,0],
    phase  = 0;
    
	Gibberish.extend(this, {
		name:		"Reverb",
    
		roomSize:	.5,
		damping:	.2223,
    
    properties: {
      input:    0,
  		wet:		  .5,
  		dry:		  .55,
    },
    
    callback : function(sample, wet, dry) {
      var channels = typeof sample === 'object' ? 2 : 1;
      
			var input = channels === 1 ? sample : sample[0] + sample[1]; // converted to fake stereo

			var _out = input * .015;
      var out = _out;
						
			for(var i = 0; i < 8; i++) {
				var filt = combs[i](_out);
				out += filt;				
			}
							
			for(var i = 0; i < 4; i++) {
				out = apfs[i](out);	
			}
      
      output[0] = output[1] = (input * dry) + (out * wet);

  		return output;
  	},
	})  
  .init()
  .processProperties(arguments);
    
	for(var i = 0; i < 8; i++){
		combs.push( new Gibberish.Comb(tuning.combTuning[i], this.roomSize * tuning.scaleRoom * tuning.offsetRoom, this.damping ).callback );
	}
  
	for(var i = 0; i < 4; i++){
		apfs.push( new Gibberish.AllPass(tuning.allPassTuning[i], tuning.allPassFeedback ).callback );
	}

};
Gibberish.Reverb.prototype = Gibberish._effect;

Gibberish.Granulator = function(properties) {
	var grains      = [];
	    buffer      = null,
	    interpolate = Gibberish.interpolate,
      panner      = Gibberish.makePanner(),
      bufferLength= 0,
	    debug       = 0,
	    write       = 0,
      self        = this,
      out         = [0,0],
      _out        = [0,0],
      rndf        = Gibberish.rndf,
      numberOfGrains = properties.numberOfGrains || 20;
      
	Gibberish.extend(this, { 
		name:		        "granulator",
		bufferLength:   88200,
		reverse:	      true,
		spread:		      .5,
    
    properties : {
  		speed: 		    1,
  		speedMin:     -0,
  		speedMax: 	  .0,
  		grainSize: 	  1000,      
  		position:	    .5,
  		positionMin:  0,
  		positionMax:  0,
      amp:		      .2,
  		fade:		      .1,
  		pan:		      0,
  		shouldWrite:  false,
    },
    
    callback : function(speed, speedMin, speedMax, grainSize, positionMin, positionMax, position, amp, fade, pan, shouldWrite) {
    		for(var i = 0; i < numberOfGrains; i++) {
    			var grain = grains[i];
					
    			if(grain._speed > 0) {
    				if(grain.pos > grain.end) {
    					grain.pos = (position + rndf(positionMin, positionMax)) * buffer.length;
    					grain.start = grain.pos;
    					grain.end = grain.start + grainSize;
    					grain._speed = speed + rndf(speedMin, speedMax);
    					grain._speed = grain._speed < .1 ? .1 : grain._speed;
    					grain._speed = grain._speed < .1 && grain._speed > 0 ? .1 : grain._speed;							
    					grain._speed = grain._speed > -.1 && grain._speed < 0 ? -.1 : grain._speed;							
    					grain.fadeAmount = grain._speed * (fade * grainSize);
    					grain.pan = rndf(self.spread * -1, self.spread);
    				}
						
    				var _pos = grain.pos;
    				while(_pos > buffer.length) _pos -= buffer.length;
    				while(_pos < 0) _pos += buffer.length;
						
    				var _val = interpolate(buffer, _pos);
					
    				_val *= grain.pos < grain.fadeAmount + grain.start ? (grain.pos - grain.start) / grain.fadeAmount : 1;
    				_val *= grain.pos > (grain.end - grain.fadeAmount) ? (grain.end - grain.pos)   / grain.fadeAmount : 1;
						
    			}else {
    				if(grain.pos < grain.end) {
    					grain.pos = (position + rndf(positionMin, positionMax)) * buffer.length;
    					grain.start = grain.pos;
    					grain.end = grain.start - grainSize;
    					grain._speed = speed + rndf(speedMin, speedMax);
    					grain._speed = grain._speed < .1 && grain._speed > 0 ? .1 : grain._speed;							
    					grain._speed = grain._speed > -.1 && grain._speed < 0 ? -.1 : grain._speed;	
    					grain.fadeAmount = grain._speed * (fade * grainSize);							
    				}
						
    				var _pos = grain.pos;
    				while(_pos > buffer.length) _pos -= buffer.length;
    				while(_pos < 0) _pos += buffer.length;
					
    				var _val = interpolate(buffer, _pos);
					
    				_val *= grain.pos > grain.start - grain.fadeAmount ? (grain.start - grain.pos) / grain.fadeAmount : 1;
    				_val *= grain.pos < (grain.end + grain.fadeAmount) ? (grain.end - grain.pos) / grain.fadeAmount : 1;
    			}
					
    			_out = panner(_val * amp, grain.pan, _out);
          out[0] += _out[0];
          out[1] += _out[1];
    			
          grain.pos += grain._speed;
    		}
				
    		return panner(out, pan, out);
    	},
	})
  .init()
  .processProperties(arguments);
  
	for(var i = 0; i < numberOfGrains; i++) {
		grains[i] = {
			pos : self.position + Gibberish.rndf(self.positionMin, self.positionMax),
			_speed : self.speed + Gibberish.rndf(self.speedMin, self.speedMax),
		}
		grains[i].start = grains[i].pos;
		grains[i].end = grains[i].pos + self.grainSize;
		grains[i].fadeAmount = grains[i]._speed * (self.fade * self.grainSize);
		grains[i].pan = Gibberish.rndf(self.spread * -1, self.spread);
	}
			
	if(typeof properties.input !== "undefined") { 
			that.shouldWrite = true;
      
			that.sampler = new Gibberish.Sampler();
			that.sampler.connect();
			that.sampler.record(properties.buffer, that.bufferLength);
      
			that.buffer = that.sampler.buffer;
	}else if(typeof properties.buffer !== 'undefined') {
	  buffer = properties.buffer;
    bufferLength = buffer.length;
	}
};
Gibberish.Granulator.prototype = Gibberish._effect;
Gibberish.synth = function() {
  this.type = 'oscillator';
    
  this.oscillatorInit = function() {
    this.fx = new Array2; 
    this.fx.parent = this;
  };
};
Gibberish.synth.prototype = new Gibberish.ugen();
Gibberish._synth = new Gibberish.synth();
		
Gibberish.Synth = function(properties) {
	this.name =	"synth";

	this.properties = {
	  frequency:0,
    pulsewidth:.5,
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
      _osc        = new Gibberish.PWM(),
	    osc         = _osc.callback,
      lag         = new Gibberish.OnePole().callback,
    	panner      = Gibberish.makePanner(),
    	out         = [0,0];

  this.callback = function(frequency, pulsewidth, attack, decay, glide, amp, channels, pan) {
    glide = glide >= 1 ? .99999 : glide;
    frequency = lag(frequency, 1-glide, glide);
    
		if(envstate() < 2) {				
			var env = envelope(attack, decay);
			var val = osc( frequency, 1, pulsewidth ) * env * amp;

			out[0] = out[1] = val;
      
			return channels === 1 ? val : panner(val, pan, out);
    }else{
		  val = out[0] = out[1] = 0;
      return channels === 1 ? val : panner(val, pan, out);
    }
	};
  
  this.getOsc = function() { return _osc; };
  this.setOsc = function(val) { _osc = val; osc = _osc.callback };
  
  var waveform = "PWM";
  Object.defineProperty(this, 'waveform', {
    get : function() { return waveform; },
    set : function(val) { this.setOsc( new Gibberish[val]() ); }
  });
  
  this.init();
  this.oscillatorInit();
	this.processProperties(arguments);
};
Gibberish.Synth.prototype = Gibberish._synth;

Gibberish.PolySynth = function() {
  this.__proto__ = new Gibberish.Bus2();
  
  Gibberish.extend(this, {
    name:     "polysynth",
    maxVoices:    5,
    voiceCount:   0,
    
    polyProperties : {
  		glide:			0,
      attack: 22050,
      decay:  22050,
      pulsewidth:.5,
      waveform:"PWM",
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
      attack:   this.attack,
      decay:    this.decay,
      pulsewidth: this.pulsewidth,
      channels: 2,
      amp:      1,
    };
    var synth = new Gibberish.Synth(props);
    synth.connect(this);

    this.children.push(synth);
  }
  
  Gibberish.polyInit(this);
  Gibberish._synth.oscillatorInit.call(this);
};

Gibberish.Synth2 = function(properties) {
	this.name =	"synth2";

	this.properties = {
	  frequency:0,
    pulsewidth:.5,
	  attack:		22050,
	  decay:		22050,
    cutoff:   .25,
    resonance:3.5,
    useLowPassFilter:true,
    glide:    .15,
    amp:		  .25,
    channels: 1,
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
      _osc        = new Gibberish.PWM(),
	    osc         = _osc.callback,      
      _filter     = new Gibberish.Filter24(),
      filter      = _filter.callback,
      lag         = new Gibberish.OnePole().callback,
    	panner      = Gibberish.makePanner(),
    	out         = [0,0];

  this.callback = function(frequency, pulsewidth, attack, decay, cutoff, resonance, isLowPass, glide, amp, channels, pan) {
    //sample, cutoff, resonance, isLowPass
		if(envstate() < 2) {
      glide = glide >= 1 ? .99999 : glide;
      frequency = lag(frequency, 1-glide, glide);
      
			var env = envelope(attack, decay);
			var val = filter ( osc( frequency, .15, pulsewidth ), cutoff * env, resonance, isLowPass ) * env * amp;

			out[0] = out[1] = val;
      
			return channels === 1 ? val : panner(val, pan, out);
    }else{
		  val = out[0] = out[1] = 0;
      return channels === 1 ? val : panner(val, pan, out);
    }
	};
  
  this.getOsc = function() { return _osc; };
  this.setOsc = function(val) { _osc = val; osc = _osc.callback };
  
  var waveform = "PWM";
  Object.defineProperty(this, 'waveform', {
    get : function() { return waveform; },
    set : function(val) { this.setOsc( new Gibberish[val]() ); }
  });
  
  this.init();
  this.oscillatorInit();
	this.processProperties(arguments);
};
Gibberish.Synth2.prototype = Gibberish._synth;
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
function AudioFileRequest(url, async) {
    this.url = url;
    if (typeof async == 'undefined' || async == null) {
        async = true;
    }
    this.async = async;
    var splitURL = url.split('.');
    this.extension = splitURL[splitURL.length - 1].toLowerCase();
}

AudioFileRequest.prototype.onSuccess = function(decoded) {
};

AudioFileRequest.prototype.onFailure = function(decoded) {
};


AudioFileRequest.prototype.send = function() {
    if (this.extension != 'wav' &&
        this.extension != 'aiff' &&
        this.extension != 'aif') {
        this.onFailure();
        return;
    }

    var request = new XMLHttpRequest();
    request.open('GET', this.url, this.async);
    request.overrideMimeType('text/plain; charset=x-user-defined');
    request.onreadystatechange = function(event) {
        if (request.readyState == 4) {
            if (request.status == 200 || request.status == 0) {
                this.handleResponse(request.responseText);
            }
            else {
                this.onFailure();
            }
        }
    }.bind(this);
    request.send(null);
};

AudioFileRequest.prototype.handleResponse = function(data) {
    var decoder, decoded;
    if (this.extension == 'wav') {
        decoder = new WAVDecoder();
        decoded = decoder.decode(data);
    }
    else if (this.extension == 'aiff' || this.extension == 'aif') {
        decoder = new AIFFDecoder();
        decoded = decoder.decode(data);
    }
    this.onSuccess(decoded);
};


function Decoder() {
}

Decoder.prototype.readString = function(data, offset, length) {
    return data.slice(offset, offset + length);
};

Decoder.prototype.readIntL = function(data, offset, length) {
    var value = 0;
    for (var i = 0; i < length; i++) {
        value = value + ((data.charCodeAt(offset + i) & 0xFF) *
                         Math.pow(2, 8 * i));
    }
    return value;
};

Decoder.prototype.readChunkHeaderL = function(data, offset) {
    var chunk = {};
    chunk.name = this.readString(data, offset, 4);
    chunk.length = this.readIntL(data, offset + 4, 4);
    return chunk;
};

Decoder.prototype.readIntB = function(data, offset, length) {
    var value = 0;
    for (var i = 0; i < length; i++) {
        value = value + ((data.charCodeAt(offset + i) & 0xFF) *
                         Math.pow(2, 8 * (length - i - 1)));
    }
    return value;
};

Decoder.prototype.readChunkHeaderB = function(data, offset) {
    var chunk = {};
    chunk.name = this.readString(data, offset, 4);
    chunk.length = this.readIntB(data, offset + 4, 4);
    return chunk;
};

Decoder.prototype.readFloatB = function(data, offset) {
    var expon = this.readIntB(data, offset, 2);
    var range = 1 << 16 - 1;
    if (expon >= range) {
        expon |= ~(range - 1);
    }

    var sign = 1;
    if (expon < 0) {
        sign = -1;
        expon += range;
    }

    var himant = this.readIntB(data, offset + 2, 4);
    var lomant = this.readIntB(data, offset + 6, 4);
    var value;
    if (expon == himant == lomant == 0) {
        value = 0;
    }
    else if (expon == 0x7FFF) {
        value = Number.MAX_VALUE;
    }
    else {
        expon -= 16383;
        value = (himant * 0x100000000 + lomant) * Math.pow(2, expon - 63);
    }
    return sign * value;
};

function WAVDecoder(data) {
}

WAVDecoder.prototype.__proto__ = Decoder.prototype;

WAVDecoder.prototype.decode = function(data) {
    var decoded = {};
    var offset = 0;
    // Header
    var chunk = this.readChunkHeaderL(data, offset);
    offset += 8;
    if (chunk.name != 'RIFF') {
        console.error('File is not a WAV');
        return null;
    }

    var fileLength = chunk.length;
    fileLength += 8;

    var wave = this.readString(data, offset, 4);
    offset += 4;
    if (wave != 'WAVE') {
        console.error('File is not a WAV');
        return null;
    }

    while (offset < fileLength) {
        var chunk = this.readChunkHeaderL(data, offset);
        offset += 8;
        if (chunk.name == 'fmt ') {
            // File encoding
            var encoding = this.readIntL(data, offset, 2);
            offset += 2;

            if (encoding != 0x0001) {
                // Only support PCM
                console.error('Cannot decode non-PCM encoded WAV file');
                return null;
            }

            // Number of channels
            var numberOfChannels = this.readIntL(data, offset, 2);
            offset += 2;

            // Sample rate
            var sampleRate = this.readIntL(data, offset, 4);
            offset += 4;

            // Ignore bytes/sec - 4 bytes
            offset += 4;

            // Ignore block align - 2 bytes
            offset += 2;

            // Bit depth
            var bitDepth = this.readIntL(data, offset, 2);
            var bytesPerSample = bitDepth / 8;
            offset += 2;
        }

        else if (chunk.name == 'data') {
            // Data must come after fmt, so we are okay to use it's variables
            // here
            var length = chunk.length / (bytesPerSample * numberOfChannels);
            var channels = [];
            for (var i = 0; i < numberOfChannels; i++) {
                channels.push(new Float32Array(length));
            }

            for (var i = 0; i < numberOfChannels; i++) {
                var channel = channels[i];
                for (var j = 0; j < length; j++) {
                    var index = offset;
                    index += (j * numberOfChannels + i) * bytesPerSample;
                    // Sample
                    var value = this.readIntL(data, index, bytesPerSample);
                    // Scale range from 0 to 2**bitDepth -> -2**(bitDepth-1) to
                    // 2**(bitDepth-1)
                    var range = 1 << bitDepth - 1;
                    if (value >= range) {
                        value |= ~(range - 1);
                    }
                    // Scale range to -1 to 1
                    channel[j] = value / range;
                }
            }
            offset += chunk.length;
        }
        else {
            offset += chunk.length;
        }
    }
    decoded.sampleRate = sampleRate;
    decoded.bitDepth = bitDepth;
    decoded.channels = channels;
    decoded.length = length;
    return decoded;
};


function AIFFDecoder() {
}

AIFFDecoder.prototype.__proto__ = Decoder.prototype;

AIFFDecoder.prototype.decode = function(data) {
    var decoded = {};
    var offset = 0;
    // Header
    var chunk = this.readChunkHeaderB(data, offset);
    offset += 8;
    if (chunk.name != 'FORM') {
        console.error('File is not an AIFF');
        return null;
    }

    var fileLength = chunk.length;
    fileLength += 8;

    var aiff = this.readString(data, offset, 4);
    offset += 4;
    if (aiff != 'AIFF') {
        console.error('File is not an AIFF');
        return null;
    }

    while (offset < fileLength) {
        var chunk = this.readChunkHeaderB(data, offset);
        offset += 8;
        if (chunk.name == 'COMM') {
            // Number of channels
            var numberOfChannels = this.readIntB(data, offset, 2);
            offset += 2;

            // Number of samples
            var length = this.readIntB(data, offset, 4);
            offset += 4;

            var channels = [];
            for (var i = 0; i < numberOfChannels; i++) {
                channels.push(new Float32Array(length));
            }

            // Bit depth
            var bitDepth = this.readIntB(data, offset, 2);
            var bytesPerSample = bitDepth / 8;
            offset += 2;

            // Sample rate
            var sampleRate = this.readFloatB(data, offset);
            offset += 10;
        }
        else if (chunk.name == 'SSND') {
            // Data offset
            var dataOffset = this.readIntB(data, offset, 4);
            offset += 4;

            // Ignore block size
            offset += 4;

            // Skip over data offset
            offset += dataOffset;

            for (var i = 0; i < numberOfChannels; i++) {
                var channel = channels[i];
                for (var j = 0; j < length; j++) {
                    var index = offset;
                    index += (j * numberOfChannels + i) * bytesPerSample;
                    // Sample
                    var value = this.readIntB(data, index, bytesPerSample);
                    // Scale range from 0 to 2**bitDepth -> -2**(bitDepth-1) to
                    // 2**(bitDepth-1)
                    var range = 1 << bitDepth - 1;
                    if (value >= range) {
                        value |= ~(range - 1);
                    }
                    // Scale range to -1 to 1
                    channel[j] = value / range;
                }
            }
            offset += chunk.length - dataOffset - 8;
        }
        else {
            offset += chunk.length;
        }
    }
    decoded.sampleRate = sampleRate;
    decoded.bitDepth = bitDepth;
    decoded.channels = channels;
    decoded.length = length;
    return decoded;
};

Gibberish.Sampler = function() {
	var phase = 1,
	    interpolate = Gibberish.interpolate,
	    write = 0,
	    panner = Gibberish.makePanner(),
	    debug = 0 ,
	    shouldLoop = 0,
	    out = [0,0],
      buffer = null,
      bufferLength = 1,
      self = this;
      
	Gibberish.extend(this, {
		name: 			"sampler",
    
		file: 			null,
		isLoaded: 	false,
    
    properties : {
    	pitch:			  1,
  		amp:			    1,
  		isRecording: 	false,
  		isPlaying : 	true,
  		input:	 		  0,
  		length : 		  0,
      start :       0,
      end :         1,
      loops :       0,
      pan :         0,
    },

		_onload : 		function(decoded) {
			buffer = decoded.channels[0]; 
			bufferLength = decoded.length;
					
			self.end = bufferLength;
      self.length = phase = bufferLength;
					
			console.log("LOADED ", self.file, bufferLength);
			Gibberish.audioFiles[self.file] = buffer;
			
      if(self.onload) self.onload();
      
			self.isLoaded = true;
		},
    
		note: function(pitch, amp) {
			if(typeof amp === 'number') this.amp = amp;
			this.pitch = pitch;
					
			if(this.function !== null) {
				this.isPlaying = true;	// needed to allow playback after recording
				if(pitch > 0) {
          phase = this.start;
				}else{
          phase = this.end;
				}
			}
		},
    
		record : function(input, recordLength) {
      this.isRecording = true;
      
      var self = this;
      
      new Gibberish.Record(input, recordLength, function() {
        buffer = this.getBuffer();
        self.end = bufferLength = buffer.length;
        phase = self.end;
        self.isRecording = false;
      })
      .record(); 
		},
    
    getBuffer : function() {
      return buffer;
    },
    
  	callback :function(_pitch, amp, isRecording, isPlaying, input, length, start, end, loops, pan) {
  		var val = 0;
  		phase += _pitch;				

  		if(phase < end && phase > 0) {
  			if(_pitch > 0) {
					val = buffer !== null && isPlaying ? interpolate(buffer, phase) : 0;
  			}else{
  				if(phase > start) {
  					val = buffer !== null && isPlaying ? interpolate(buffer, phase) : 0;
  				}else{
  					phase = loops ? end : phase;
  				}
  			}
  			return panner(val, pan, out);
  		}
  		phase = loops && _pitch > 0 ? start : phase;
  		phase = loops && _pitch < 0 ? end : phase;
				
  		out[0] = out[1] = val;
  		return out;
  	},
	});
			
	if(typeof arguments[0] !== "undefined") {
		if(typeof arguments[0] === "string") {
      console.log("SETTING FILE");
			this.file = arguments[0];
      delete arguments[0];
			//this.isPlaying = true;
		}else if(typeof arguments[0] === "object") {
			if(arguments[0].file) {
				this.file = arguments[0].file;
				//this.isPlaying = true;
			}
		}
	}
  		
	/*var _end = 1;
	Object.defineProperty(that, "end", {
		get : function() { return _end; },
		set : function(val) {
			if(val > 1) val = 1;
			_end = val * that.bufferLength - 1;
			Gibberish.dirty(that);
		}
	});
	var _start = 0;
	Object.defineProperty(that, "start", {
		get : function() { return _start; },
		set : function(val) {
			if(val < 0) val = 0;
			_start = val * that.bufferLength - 1;
			Gibberish.dirty(that);
		}
	});
	var _loops = 0;
	Object.defineProperty(that, "loops", {
		get : function() { return _loops; },
		set : function(val) {
			_loops = val;
			that.function.setLoops(_loops);
		}
	});
  */
  this.processProperties(arguments);
  this.oscillatorInit();
  this.init();
  
	if(typeof Gibberish.audioFiles[this.file] !== "undefined") {
		buffer =  Gibberish.audioFiles[this.file];
		this.end = this.bufferLength = buffer.length;
    
    phase = this.bufferLength;
    Gibberish.dirty(this);
    
    if(this.onload) this.onload();
	}else if(this.file !== null){
    var request = new AudioFileRequest(this.file);
    request.onSuccess = this._onload;
    request.send();
	}else if(typeof this.buffer !== 'undefined' ) {
		this.isLoaded = true;
					
		buffer = this.buffer;
    this.end = this.bufferLength = buffer.length;
		    
		phase = this.bufferLength;
		if(arguments[0] && arguments[0].loops) {
			this.loops = 1;
		}
    Gibberish.dirty(this);
    
    if(this.onload) this.onload();
	}
};
Gibberish.Sampler.prototype = Gibberish._oscillator;
Gibberish.MonoSynth = function() {  
	Gibberish.extend(this, { 
    name:       'monosynth',
    
    properties: {
  		frequency:	0,
  		amp1:			  1,
  		amp2:			  1,
  		amp3:			  1,
  		attack:			10000,
  		decay:			10000,
  		cutoff:			.2,
  		resonance:	2.5,
  		filterMult:	.3,
  		isLowPass:	true,
  		amp:		    .6,
  		detune2:		.01,
  		detune3:		-.01,
  		octave2:		1,
  		octave3:		-1,
      glide:      0,
  		pan:			  0,
      channels:   1,
    },
    
		waveform:		"Saw",
				
		note : function(_frequency) {										
			this.frequency = _frequency;
					
			if(envstate() > 0) _envelope.run();
		},
	});
  
	var waveform = this.waveform;
	Object.defineProperty(this, "waveform", {
		get: function() { return waveform; },
		set: function(value) {
			if(waveform !== value) {
				waveform = value;
						
				osc1 = new Gibberish[value]().callback;
				osc2 = new Gibberish[value]().callback;
				osc3 = new Gibberish[value]().callback;
			}
		},
	});
  
	var _envelope = new Gibberish.AD(this.attack, this.decay),
      envstate  = _envelope.getState,
      envelope  = _envelope.callback,
      filter    = new Gibberish.Filter24().callback,
    	osc1      = new Gibberish[this.waveform](this.frequency,  this.amp1).callback,
    	osc2      = new Gibberish[this.waveform](this.frequency2, this.amp2).callback,
    	osc3      = new Gibberish[this.waveform](this.frequency3, this.amp3).callback,
      lag       = new Gibberish.OnePole().callback,      
    	panner    = Gibberish.makePanner(),
    	out       = [0,0];
    
  this.callback = function(frequency, amp1, amp2, amp3, attack, decay, cutoff, resonance, filterMult, isLowPass, masterAmp, detune2, detune3, octave2, octave3, glide, pan, channels) {
		if(envstate() < 2) {
      if(glide >= 1) glide = .9999;
      frequency = lag(frequency, 1-glide, glide);
      
			var frequency2 = frequency;
			if(octave2 > 0) {
				for(var i = 0; i < octave2; i++) {
					frequency2 *= 2;
				}
			}else if(octave2 < 0) {
				for(var i = 0; i > octave2; i--) {
					frequency2 /= 2;
				}
			}
					
			var frequency3 = frequency;
			if(octave3 > 0) {
				for(var i = 0; i < octave3; i++) {
					frequency3 *= 2;
				}
			}else if(octave3 < 0) {
				for(var i = 0; i > octave3; i--) {
					frequency3 /= 2;
				}
			}
				
			frequency2 += detune2 > 0 ? ((frequency * 2) - frequency) * detune2 : (frequency - (frequency / 2)) * detune2;
			frequency3 += detune3 > 0 ? ((frequency * 2) - frequency) * detune3 : (frequency - (frequency / 2)) * detune3;
							
			var oscValue = osc1(frequency, amp1, 1) + osc2(frequency2, amp2, 1) + osc3(frequency3, amp3, 1);
			var envResult = envelope(attack, decay);
			var val = filter( oscValue, cutoff + filterMult * envResult, resonance, isLowPass, 1) * envResult;
			val *= masterAmp;
			out[0] = out[1] = val;
			return channels === 1 ? out : panner(val, pan, out);
		}else{
			out[0] = out[1] = 0;
			return out;
		}
	}; 
  
  this.init();
  this.oscillatorInit();     
	this.processProperties(arguments);
};
Gibberish.MonoSynth.prototype = Gibberish._synth; 
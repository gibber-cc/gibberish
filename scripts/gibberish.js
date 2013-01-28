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
  
  audioProcess2 : function(soundData) { // callback for firefox
    var me = Gibberish;

    for (var i=0, size=soundData.length; i<size; i+=2) {
      if(me.isDirty) {
        me.createCallback();
        me.isDirty = false;
      }
      
			var val = me.callback();
      
			soundData[i] = val[0];
      soundData[i+1] = val[1];
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
  
  // as taken from here: https://wiki.mozilla.org/Audio_Data_API#Standardization_Note
  // only the number of channels is changed in the audio.mozSetup() call
  AudioDataDestination : function(sampleRate, readFn) { // for Firefox Audio Data API
    // Initialize the audio output.
    var audio = new Audio();
    audio.mozSetup(2, sampleRate);

    var currentWritePosition = 0;
    var prebufferSize = sampleRate / 2; // buffer 500ms
    var tail = null, tailPosition;

    // The function called with regular interval to populate 
    // the audio output buffer.
    setInterval(function() {
      var written;
      // Check if some data was not written in previous attempts.
      if(tail) {
        written = audio.mozWriteAudio(tail.subarray(tailPosition));
        currentWritePosition += written;
        tailPosition += written;
        if(tailPosition < tail.length) {
          // Not all the data was written, saving the tail...
          return; // ... and exit the function.
        }
        tail = null;
      }

      // Check if we need add some data to the audio output.
      var currentPosition = audio.mozCurrentSampleOffset();
      var available = currentPosition + prebufferSize - currentWritePosition;
      if(available > 0) {
        // Request some sound data from the callback function.
        var soundData = new Float32Array(available);
        readFn(soundData);

        // Writting the data.
        written = audio.mozWriteAudio(soundData);
        currentPosition = audio.mozCurrentSampleOffset();
        if(written < soundData.length) {
          // Not all the data was written, saving the tail.
          tail = soundData;
          tailPosition = written;
        }
        currentWritePosition += written;
      }
    }, 100);
  },
  
  init : function() {
    Gibberish.out = new Gibberish.Bus2();
    Gibberish.dirty(Gibberish.out);
    
    var bufferSize = typeof arguments[0] === 'undefined' ? 1024 : arguments[0];
    
    // we will potentially delay start of audio until touch of screen for iOS devices
    start = function() {
      
      if(navigator.userAgent.indexOf('Firefox') === -1 ){
        document.getElementsByTagName('body')[0].removeEventListener('touchstart', start);
        Gibberish.context = new webkitAudioContext();
        Gibberish.node = Gibberish.context.createJavaScriptNode(bufferSize, 2, 2, 44100);	
        Gibberish.node.onaudioprocess = Gibberish.audioProcess;
        Gibberish.node.connect(Gibberish.context.destination);
    
        if('ontouchstart' in document.documentElement){ // required to start audio under iOS 6
          var mySource = Gibberish.context.createBufferSource();
          mySource.connect(Gibberish.context.destination);
          mySource.noteOn(0);
        }
      }else{
        Gibberish.AudioDataDestination(44100, Gibberish.audioProcess2);
      }
    }
    
    if('ontouchstart' in document.documentElement) {
      document.getElementsByTagName('body')[0].addEventListener('touchstart', start);
    }else{
      start();
    }
    
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

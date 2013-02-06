/**#Gibberish - Miscellaneous
Gibberish is the main object used to manage the audio graph and perform codegen functions. All constructors are also inside of the Gibberish object. Gibberish can automatically generate an appropriate web audio callback for you; if you want to use this you must execute the Gibberish.init() command before creating any Gibberish ugens.

## Example Usage##
`// make a sine wave  
Gibberish.init();  
a = new Gibberish.Sine().connect();`
## Constructor
**param** *bufferSize*: Integer. Default 1024. The size of the buffer to be calculated. Since JavaScript is single-threaded, setting exceedingly large values for this will yield to stuttering in graphics and user interface performance.
- - - -
**/
/**###Gibberish.audioFiles : property  
Array. Anytime an audiofile is loaded (normally using the Sampler ugen) the resulting sample buffer is stored in this array so that it can be immediately recalled.
**/
/**###Gibberish.callback : property
String. Whenever Gibberish performs code generation the resulting callback is stored here.
**/
/**###Gibberish.out : property
Object. The is the 'master' bus that everything eventually gets routed to if you're using the auto-generated calback. This bus is initialized in the call to Gibberish.init.
**/
/**###Gibberish.dirtied : property
Array. A list of objects that need to be codegen'd
**/
/**###Gibberish.isDirty : property
Booelan. Whether or codegen should be performed.
**/
/**###Gibberish.codeblock : property
Array. During codegen, each ugen's codeblock is inserted into this array. Once all the ugens have codegen'd, the array is concatenated to form the callback.
**/
/**###Gibberish.upvalues : property
Array. Each ugen's callback function is stored in this array; the contents of the array become upvalues to the master callback function when it is codegen'd.
**/
/**###Gibberish.debug : property
Boolean. Default false. When true, the callbackString is printed to the console whenever a codegen is performed
**/
/**###Gibberish.memo : property
Object. Used in the codegen process to make sure codegen for each ugen is only performed once.
**/


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
  sequencers        : [],
  
/**###Gibberish.createCallback : method
Perform codegen on all dirty ugens and re-create the audio callback. This method is called automatically in the default Gibberish sample loop whenever Gibberish.isDirty is true.
**/
  createCallback : function() {
    this.memo = {};
    this.codeblock.length = 0;
    
    /* generate code for dirty ugens */
    for(var i = 0; i < this.dirtied.length; i++) {
      this.dirtied[i].codegen();
    }
    this.dirtied.length = 0;
    
    this.codestring = this.upvalues.join("");
    
    this.codestring += '\nGibberish.callback = function() {\n\t';

    /* concatenate code for all ugens */
    this.memo = {};
    this.out.getCodeblock();
    this.codestring += this.codeblock.join("\t");
    this.codestring += "\n\t";
    
    /* analysis codeblock */
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

/**###Gibberish.audioProcess : method
The default audio callback used in Webkit browsers. This callback starts running as soon as Gibberish.init() is called.  
  
param **Audio Event** : Object. The HTML5 audio event object.
**/ 
  audioProcess : function(e){
    //console.log("AUDIO PROCESS");
		var bufferL = e.outputBuffer.getChannelData(0);
		var bufferR = e.outputBuffer.getChannelData(1);	
		
    var me = Gibberish; // dereference for efficiency
		for(var i = 0, _bl = e.outputBuffer.length; i < _bl; i++){
      
      for(var j = 0; j < me.sequencers.length; j++) { me.sequencers[j].tick(); }
      
      if(me.isDirty) {
        me.createCallback();
        me.isDirty = false;
      }

			var val = me.callback();
      
			bufferL[i] = val[0];
			bufferR[i] = val[1];      
		}
  },
/**###Gibberish.audioProcessFirefox : method
The default audio callback used in Firefox. This callback starts running as soon as Gibberish.init() is called.  
  
param **Sound Data** : Object. The buffer of audio data to be filled
**/   
  audioProcessFirefox : function(soundData) { // callback for firefox
    var me = Gibberish;

    for (var i=0, size=soundData.length; i<size; i+=2) {
      
      for(var j = 0; j < me.sequencers.length; j++) { me.sequencers[j].tick(); }
      
      if(me.isDirty) {
        me.createCallback();
        me.isDirty = false;
      }      
      
			var val = me.callback();
      
			soundData[i] = val[0];
      soundData[i+1] = val[1];
    }
  },
/**###Gibberish.clear : method
Remove all objects from Gibberish graph and perform codegen... kills all running sound and CPU usage.
**/   
  clear : function() {
    this.upvalues.length = 1; // make sure to leave master bus!!!
    this.out.inputs.length = 0;
    this.analysisUgens.length = 0;
    this.sequencers.length = 0;
    Gibberish.dirty(this.out);
  },

/**###Gibberish.dirty : method
Tell Gibberish a ugen needs to be codegen'd and mark the entire callback as needing regeneration  
  
param **Ugen** : Object. The ugen that is 'dirtied'... that has a property value changed.
**/     
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

/**###Gibberish.generateSymbol : method
Generate a unique symbol for a given ugen using its name and a unique id number.  
  
param **name** : String. The name of the ugen; for example, reverb, delay etc.
**/       
	generateSymbol : function(name) {
		return name + "_" + this.id++; 
	},
  
  // as taken from here: https://wiki.mozilla.org/Audio_Data_API#Standardization_Note
  // only the number of channels is changed in the audio.mozSetup() call
  
/**###Gibberish.AudioDataDestination : method
Used to generate callback for Firefox.  
  
param **sampleRate** : String. The sampleRate for the audio callback to run at. NOT THE BUFFER SIZE.  
param **readFn** : Function. The audio callback to use.
**/ 
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
/**###Gibberish.AudioDataDestination : method
Create a callback and start it running. Note that in iOS audio callbacks can only be created in response to user events. Thus, in iOS this method assigns an event handler to the HTML body that creates the callback as soon as the body is touched; at that point the event handler is removed. 
**/   
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
        Gibberish.AudioDataDestination(44100, Gibberish.audioProcessFirefox);
      }
    }
    
    if('ontouchstart' in document.documentElement) {
      document.getElementsByTagName('body')[0].addEventListener('touchstart', start);
    }else{
      start();
    }
    
    return this;
  },
  
/**###Gibberish.makePanner : method
Create and return an object that can be used to pan a stereo source.
**/ 
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
  
/**###Gibberish.polyInit : method
For ugens with polyphony, add metaprogramming that passes on property changes to the 'children' of the polyphonic object. Polyphonic ugens in Gibberish are just single instances that are routed into a shared bus, along with a few special methods for voice allocation etc.  
  
param **Ugen** : Object. The polyphonic ugen
**/ 
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
  
/**###Gibberish.interpolate : method
Similiar to makePanner, this method returns a function that can be used to linearly interpolate between to values. The resulting function takes an array and a floating point position index and returns a value.
**/   
	interpolate : function(arr, phase){
		var	index	  = phase | 0, // round down
        index2  = index + 1 > arr.length - 1 ? 0 : index + 1;
				frac	  = phase - index;
    				
    return arr[index] + frac * (arr[index2] - arr[index]);
	},
  
  export : function(key, obj) {
    for(var _key in Gibberish[key]) {
      console.log("exporting", _key, "from", key);
      obj[_key] = Gibberish[key][_key];
    }
  },

/**###Gibberish.ugen : method
Creates a prototype object that is used by all ugens.
**/    
  ugen : function() {
    Gibberish.extend(this, {
  
/**#Ugen - Miscellaneous
The prototype object that all ugens inherit from
**/
/**###Ugen.processProperties : method
Used to assign and process arguments passed to the constructor functions of ugens.  
  
param **argumentList** : Array. A list of arguments (may be a single dictionary) passed to a ugen constructor.
**/     

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
/**###Ugen.codegen : method
Generates output code (as a string) used inside audio callback
**/     
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

/**###Ugen.getCodeblock : method
Retrieves codeblock for ugen previously created with codegen method.
**/       
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
/**###Ugen.defineUgenProperty : method
Creates getters and setters for ugen properties that automatically dirty the ugen whenever the property value is changed.  
  
param **key** : String. The name of a property to add getter / setters for.  
param **value** : Any. The initival value to set the property to
**/       
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
/**###Ugen.init : method
Initialize ugen by calling defineUgenProperty for every key in the ugen's properties dictionary, generating a unique id for the ugen and various other small tasks.
**/             
      init : function() {
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
/**###Ugen.mod : method
Modulate a property of a ugen on a per-sample basis.  
  
param **key** : String. The name of the property to modulate  
param **value** : Any. The object or number value to modulate the property with  
param **op** : String. Default "+". The operation to perform. Can be +,-,*,/,= or ++. ++ adds and returns the absolute value.
**/            
      mod : function(name, value, op) {
        var property = this.properties[ name ];
        var mod = { ugen:value, binop:op };
       	property.binops.push( mod );
        
        Gibberish.dirty( this );
      },
/**###Ugen.removeMod : method
Remove a modulation from a ugen.  
  
param **key** : String. The name of the property to remove the modulation from  
param **arg** : Number or Object. Optional. This determines which modulation to remove if more than one are assigned to the property. If this argument is undefined, all modulations are removed. If the argument is a number, the number represents a modulation in the order that they were applied (an array index). If the argument is an object, it removes a modulation that
is using a matching object as the modulator.
**/                  
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

/**###Ugen.polyMod : method
Applies a modulation to all children of a polyphonic ugen  
  
param **key** : String. The name of the property to modulate  
param **value** : Any. The object or number value to modulate the property with  
param **op** : String. Default "+". The operation to perform. Can be +,-,*,/,= or ++. ++ adds and returns the absolute value.
**/       
  		polyMod : function(name, modulator, type) {
  			for(var i = 0; i < this.children.length; i++) {
  				this.children[i].mod(name, modulator, type);
  			}
  			Gibberish.dirty(this);
  		},

/**###Ugen.removePolyMod : method
Removes a modulation from all children of a polyphonic ugen. The arguments  
  
param **arg** : Number or Object. Optional. This determines which modulation to remove if more than one are assigned to the property. If this argument is undefined, all modulations are removed. If the argument is a number, the number represents a modulation in the order that they were applied (an array index). If the argument is an object, it removes a modulation that
is using a matching object as the modulator.
**/       
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
/**###Ugen.connect : method
Connect the output of a ugen to a bus.  
  
param **bus** : Bus ugen. Optional. The bus to connect the ugen to. If no argument is passed the ugen is connect to Gibberish.out. Gibberish.out is automatically created when Gibberish.init() is called and can be thought of as the master stereo output for Gibberish.
**/      
      connect : function(bus) {
        if(typeof bus === 'undefined') bus = Gibberish.out;
        
        if(this.destinations.indexOf(bus) === -1 ){
          bus.addConnection( this, 1 );
          this.destinations.push( bus );
        }
        return this;
      },
/**###Ugen.send : method
Send an arbitrary amount of output to a bus  
  
param **bus** : Bus ugen. The bus to send the ugen to.  
param **amount** : Float. The amount of signal to send to the bus. 
**/      
      send : function(bus, amount) {
        if(this.destinations.indexOf(bus) === -1 ){
          bus.addConnection( this, amount );
          this.destinations.push( bus );
        }else{
          bus.adjustSendAmount(this, amount);
        }
        return this;
      },
/**###Ugen.disconnect : method
Disconnect a ugen from a bus (or all busses). This stops all audio and signal processing for the ugen.  
  
param **bus** : Bus ugen. Optional. The bus to send the ugen to. If this argument is undefined the ugen will be disconnected from all busses.
**/      
      disconnect : function(bus) {
        if(typeof bus === 'undefined') {
          for(var i = 0; i < this.destinations.length; i++) {
            this.destinations[i].removeConnection( this );
          }
          this.destinations = [];
        }else{
          var idx = this.destinations.indexOf(bus);
          if(idx > -1) {
            this.destinations.splice(idx, 1);
          }
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
  
Gibberish.Rndf = function() {
  var min, max, random = Math.random;
    
  if(arguments.length === 0) {
    min = 0; max = 1;
  }else if(arguments.length === 1) {
    min = 0; max = arguments[0];
  }else{
    min = arguments[0]; max = arguments[1];
  }
    
  return function() {
    var value = min + random() * max;
    return value;
  }
};

Gibberish.rndi = function() {
  var min, max;
    
  if(arguments.length === 0) {
    min = 0; max = 1;
  }else if(arguments.length === 1) {
    min = 0; max = arguments[0];
  }else{
    min = arguments[0]; max = arguments[1];
  }
    
  return Math.round( min + Math.random() * max );
};
Gibberish.Rndi = function() {
  var min, max, random = Math.random, round = Math.round;
    
  if(arguments.length === 0) {
    min = 0; max = 1;
  }else if(arguments.length === 1) {
    min = 0; max = arguments[0];
  }else{
    min = arguments[0]; max = arguments[1];
  }
    
  return function() {
    var value = round( min + random() * max );
    return value;
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
    
    return this;
  }
};
Gibberish.oscillator.prototype = new Gibberish.ugen();
Gibberish._oscillator = new Gibberish.oscillator();

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
  this.name = 'sine';

  this.properties = {
    frequency : arguments[0] || 440,
    amp :       arguments[1] || .5,
  };
  
  var pi_2 = Math.PI * 2, 
      sin  = Math.sin,
      phase = 0,
      table = new Float32Array(1024);
      
  for(var i = 1024; i--;) { table[i] = sin( (i / 1024) * pi_2); }
  
  this.getTable = function() { return table; }
/**###Gibberish.Sine.callback : method  
Returns a single sample of output.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
**/  
  this.callback = function(frequency, amp) { 
    var index, frac, index2,
        tableFreq = 43.06640625;
        
    phase += frequency / tableFreq;
    while(phase >= 1024) phase -= 1024;  
    
    index   = phase | 0;
    frac    = phase - index;
    index = index & 1023;
    index2  = index === 1023 ? 0 : index + 1;
        
    return (table[index] + ( frac * (table[index2] - table[index]) ) ) * amp;
  };
    
  this.init(arguments);
  this.oscillatorInit();
  this.processProperties(arguments);
};
Gibberish.Sine.prototype = Gibberish._oscillator;

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
  
  this.defineUgenProperty('pan', 0);
  
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
  this.processProperties(arguments);  
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
  this.processProperties(arguments);  
};
Gibberish.Saw.prototype = Gibberish._oscillator;

/**#Gibberish.Saw - Oscillator
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
  
  this.defineUgenProperty('pan', 0);
  
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
  .oscillatorInit()
  .processProperties(arguments);  
};
Gibberish.Triangle.prototype = Gibberish._oscillator;

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
  
  this.defineUgenProperty('pan', 0);
  
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
      pi_2 = Math.PI * 2;
      
  Gibberish.extend(this, {
    name: 'saw',
    properties : {
      frequency: 440,
      amp: .15,
    },
/**###Gibberish.Saw3.callback : method  
Returns a single sample of output.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
**/    
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
      test = 0;

  Gibberish.extend(this, {
    name: 'pwm',
    properties : {
      frequency: 440,
      amp: .15,
      pulsewidth: .5,
    },
/**###Gibberish.PWM.callback : method  
Returns a single sample of output.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pulsewidth** Number. The duty cycle of the waveform
**/    
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
// this file is dependent on oscillators.js

/**#Gibberish.KarplusStrong - Physical Model
A plucked-string model.  
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.KarplusStrong({ damping:.6 }).connect();  
a.note(440);
`
- - - -
**/
/**###Gibberish.KarplusStrong.blend : property  
Number. 0..1. The likelihood that the sign of any given sample will be flipped. A value of 1 means there is no chance, a value of 0 means each samples sign will be flipped. This introduces noise into the model which can be used for various effects.
**/
/**###Gibberish.KarplusStrong.damping : property  
Number. 0..1. Higher amounts of damping shorten the decay of the sound generated by each note.
**/
/**###Gibberish.KarplusStrong.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.KarplusStrong.channels : property  
Number. Default 2. If two channels, the signal may be panned.
**/
/**###Gibberish.KarplusStrong.pan : property  
Number. Default 0. The position in the stereo spectrum for the sound, from -1..1.
**/
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
        buffer[i] = rnd() * 2 - 1; // white noise
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
  .oscillatorInit()
  .processProperties(arguments);
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
/**#Gibberish.Bus - Miscellaneous
Create a mono routing bus. A bus callback routes all it's inputs and scales them by the amplitude of the bus.  
  
For a stereo routing bus, see [Bus2](javascript:displayDocs('Gibberish.Bus2'\))

##Example Usage##    
`a = new Gibberish.Bus();  
b = new Gibberish.Sine(440).connect(a);  
c = new Gibberish.Sine(880).connect(a);  
a.amp = .1;  
a.connect();`
  
## Constructor     
**param** *properties*: Object. A dictionary of property values (see below) to set for the bus on initialization.
**/
/**###Gibberish.Bus.amp : property  
Array. Read-only. Relative volume for the sum of all ugens connected to the bus.
**/
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

/**#Gibberish.Bus2 - Miscellaneous
Create a stereo outing bus. A bus callback routes all it's inputs and scales them by the amplitude of the bus.

##Example Usage##    
`a = new Gibberish.Bus();  
b = new Gibberish.Sine(440).connect(a);  
c = new Gibberish.Sine(880).connect(a);  
a.amp = .1;  
a.connect();`
  
## Constructor     
**param** *properties*: Object. A dictionary of property values (see below) to set for the bus on initialization.
**/
/**###Gibberish.Bus.amp : property  
Array. Read-only. Relative volume for the sum of all ugens connected to the bus.
**/
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

/**#Gibberish.Distortion - FX
A simple waveshaping distortion that adaptively scales its gain based on the amount of distortion applied.
  
## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Distortion({ input:a, amount:30 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Distortion.amount : property  
Number. The amount of distortion to apply. This number cannot be set lower than 2.
**/
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
      amount = amount > 2 ? amount : 2;
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

/**#Gibberish.Delay - FX
A simple echo effect.
  
## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Delay({ input:a, time:22050, feedback:.35 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Delay.time : property  
Number. The delay time as measured in samples
**/
/**###Gibberish.Delay.feedback : property  
Number. The amount of feedback that the delay puts into its buffers.
**/
Gibberish.Delay = function() {
  var buffers = [],
      phase = 0;
  
  buffers.push( new Float32Array(88200) );
  buffers.push( new Float32Array(88200) );
  
  Gibberish.extend(this, {
  	name:"Delay",
  	properties:{ input:0, time: 22050, feedback: .5 },
				
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

/**#Gibberish.Decimator - FX
A bit-crusher / sample rate reducer. Adapted from code / comments at http://musicdsp.org/showArchiveComment.php?ArchiveID=124

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Decimator({ input:a, bitDepth:4.2, sampleRate:.33 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Decimator.bitDepth : property  
Float. 0..16. The number of bits the signal is truncated to. May be a floating point number.
**/
/**###Gibberish.Decimator.sampleRate : property  
Number. 0..1. The sample rate to use where 0 is 0 Hz and 1 is nyquist.
**/
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

/**#Gibberish.RingModulation - FX
The name says it all. This ugen also has a mix property to control the ratio of wet to dry output.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.RingModulation({ input:a, frequency:1000, amp:.4, mix:1 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.RingModulation.frequency : property  
Float. The frequency of the ring modulation modulator wave.
**/
/**###Gibberish.RingModulation.amp : property  
Float. The amplitude of the ring modulation modulator wave.
**/
/**###Gibberish.RingModulation.mix : property  
Float. 0..1. The wet/dry output ratio. A value of 1 means a completely wet signal, a value of 0 means completely dry.
**/
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

/**#Gibberish.OnePole - FX
A one-pole filter for smoothing property values. This is particularly useful when the properties are being controlled interactively. You use the smooth method to apply the filter.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.OnePole({input:a.properties.frequency, a0:.0001, b1:.9999});  
b.smooth('frequency', a);  
a.note(880);  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.OnePole.input : property  
Float. The property to smooth. You should always refer to this property through the properties dictionary of the ugen. In general it is much easier to use the smooth method of the OnePole than to set this property manually.
**/
/**###Gibberish.OnePole.a0 : property  
Float. The value the input is multiplied by.
**/
/**###Gibberish.OnePole.b1 : property  
Float. The value this pole of the filter is multiplied by.
**/
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

/**###Gibberish.OnePole.smooth : method  
Use this to apply the filter to a property of an object.

param **propertyName** String. The name of the property to smooth.  
param **object** Object. The object containing the property to be smoothed
**/    
    smooth : function(propName, obj) {
      this.input = obj.properties[propName];
      obj.mod(propName, this, '=');
    },
  })
  .init()
  .processProperties(arguments);
};
Gibberish.OnePole.prototype = Gibberish._effect;

/**#Gibberish.Filter24 - FX
A four pole ladder filter. Adapted from Arif Ove Karlsne's 24dB ladder approximation: http://musicdsp.org/showArchiveComment.php?ArchiveID=141.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Filter24({input:a, cutoff:.2, resonance:4}).connect();  
a.note(1760);   
a.note(440);  
a.isLowPass = false;  
a.note(220);  
a.note(1760);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Filter24.input : property  
Object. The ugen that should feed the filter.
**/
/**###Gibberish.Filter24.cutoff : property  
Number. 0..1. The cutoff frequency for the synth's filter.
**/
/**###Gibberish.Filter24.resonance : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.Filter24.isLowPass : property  
Boolean. Default true. Whether to use a low-pass or high-pass filter.
**/
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

/**#Gibberish.SVF - FX
A two-pole state variable filter. This filter calculates coefficients on a per-sample basis, so that you can easily modulate cutoff and Q. Can switch between low-pass, high-pass, band and notch modes.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.SVF({input:a, cutoff:200, Q:4, mode:0});  
a.note(1760);   
a.note(440);  
a.mode = 2;
a.note(220);  
a.note(1760);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.SVF.input : property  
Object. The ugen that should feed the filter.
**/
/**###Gibberish.SVF.cutoff : property  
Number. 0..22050. The cutoff frequency for the synth's filter. Note that unlike the Filter24, this is measured in Hz.
**/
/**###Gibberish.SVF.resonance : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.SVF.mode : property  
Number. 0..3. 0 = lowpass, 1 = highpass, 2 = bandpass, 3 = notch.
**/
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

/**#Gibberish.Biquad - FX
A two-pole biquad filter. Currently, you must manually call calculateCoefficients every time mode, cutoff or Q changes; thus this filter isn't good for samplerate modulation.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Biquad({input:a, cutoff:200, Q:4, mode:"LP"}).connect();  
a.note(1760);   
a.note(440);  
a.mode = "HP";
a.note(220);  
a.note(1760);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Biquad.input : property  
Object. The ugen that should feed the filter.
**/
/**###Gibberish.Biquad.cutoff : property  
Number. 0..22050. The cutoff frequency for the synth's filter. Note that unlike the Filter24, this is measured in Hz.
**/
/**###Gibberish.Biquad.Q : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.Biquad.mode : property  
Number. 0..3. "LP" = lowpass, "HP" = highpass, "BP" = bandpass
**/
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

/**#Gibberish.Flanger - FX
Classic flanging effect with feedback.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Flanger({input:a, rate:.5, amount:125, feedback:.5}).connect();  
a.note(440);  
a.feedback = 0;  
a.note(440);  
a.rate = 4;
a.note(440);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Flanger.input : property  
Object. The ugen that should feed the flagner.
**/
/**###Gibberish.Flanger.rate : property  
Number. The speed at which the delay line tap position is modulated.
**/
/**###Gibberish.Flanger.amount : property  
Number. The amount of time, in samples, that the delay line tap position varies by.
**/
/**###Gibberish.Flanger.feedback : property  
Number. The amount of output that should be fed back into the delay line
**/
/**###Gibberish.Flanger.offset : property  
Number. The base offset of the delay line tap from the current time. Large values (> 500) lead to chorusing effects.
**/

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

/**#Gibberish.Vibrato - FX
Delay line vibrato effect.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Vibrato({input:a, rate:4, amount:125 }).connect();  
a.note(440);  
a.rate = .5;
a.note(440);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Vibrato.input : property  
Object. The ugen that should feed the vibrato.
**/
/**###Gibberish.Vibrato.rate : property  
Number. The speed at which the delay line tap position is modulated.
**/
/**###Gibberish.Vibrato.amount : property  
Number. The size of the delay line modulation; effectively the amount of vibrato to produce, 
**/
/**###Gibberish.Vibrato.offset : property  
Number. The base offset of the delay line tap from the current time.
**/
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
    
  	callback : function(sample, delayModulationRate, delayModulationAmount, offset) {
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

/**#Gibberish.BufferShuffler - FX
A buffer shuffling / stuttering effect with reversing and pitch-shifting

## Example Usage##
`a = new Gibberish.Synth({ attack:88200, decay:88200 });  
b = new Gibberish.BufferShuffler({input:a, chance:.25, amount:125, rate:44100, pitchMin:-4, pitchMax:4 }).connect();  
a.note(440);
`  
##Constructor##
**param** *properties* : Object. A dictionary of property keys and values to assign to the Gibberish.BufferShuffler object
- - - - 
**/
/**###Gibberish.BufferShuffler.chance : property
Float. Range 0..1. Default .25. The likelihood that incoming audio will be shuffled.
**/
/**###Gibberish.BufferShuffler.rate : property
Integer, in samples. Default 11025. How often Gibberish.BufferShuffler will randomly decide whether or not to shuffle.
**/
/**###Gibberish.BufferShuffler.length : property
Integer, in samples. Default 22050. The length of time to play stuttered audio when stuttering occurs.
**/
/**###Gibberish.BufferShuffler.reverseChance : property
Float. Range 0..1. Default .5. The likelihood that stuttered audio will be reversed
**/
/**###Gibberish.BufferShuffler.pitchChance : property
Float. Range 0..1. Default .5. The likelihood that stuttered audio will be repitched.
**/
/**###Gibberish.BufferShuffler.pitchMin : property
Float. Range 0..1. Default .25. The lowest playback speed used to repitch the audio
**/
/**###Gibberish.BufferShuffler.pitchMax : property
Float. Range 0..1. Default 2. The highest playback speed used to repitch the audio.
**/
/**###Gibberish.BufferShuffler.wet : property
Float. Range 0..1. Default 1. When shuffling, the amplitude of the wet signal
**/
/**###Gibberish.BufferShuffler.dry : property
Float. Range 0..1. Default 0. When shuffling, the amplitude of the dry signal
**/

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

/**#Gibberish.Reverb - FX
based off audiolib.js reverb and freeverb
 
## Example Usage##
`a = new Gibberish.Synth({ attack:88200, decay:88200 });  
b = new Gibberish.Reverb({input:a, roomSize:.5, wet:1, dry;.25}).connect();
a.note(440);
`  
##Constructor
**param** *properties* : Object. A dictionary of property keys and values to assign to the Gibberish.BufferShuffler object
**/
/**###Gibberish.Reverb.roomSize : property
Float. 0..1. The size of the room being emulated.
**/	
/**###Gibberish.Reverb.damping : property
Float. Attenuation of high frequencies that occurs.
**/	
/**###Gibberish.Reverb.wet : property
Float. Default = .75. The amount of processed signal that is output.  
**/	
/**###Gibberish.Reverb.dry : property
Float. Default = .5. The amount of dry signal that is output
**/	

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

/**#Gibberish.Granulator - FX
A granulator that operates on a buffer of samples. You can get the samples from a [Sampler](javascript:displayDocs('Gibberish.Sampler'\))
object.

## Example Usage ##
`a = new Gibberish.Sampler('resources/trumpet.wav');  
// wait until sample is loaded to create granulator  
a.onload = function() {  
  b = new Gibberish.Granulator({  
    buffer:a.getBuffer(),  
    grainSize:1000,  
    speedMin: -2,  
    speedMax: 2,  
  });  
  b.mod('position', new Gibberish.Sine(.1, .45), '+');  
  b.connect();  
};`
## Constructor
**param** *propertiesList*: Object. At a minimum you should define the input to granulate. See the example.
**/
/**###Gibberish.Granulator.speed : property
Float. The playback rate, in samples, of each grain
**/
/**###Gibberish.Granulator.speedMin : property
Float. When set, the playback rate will vary on a per grain basis from (grain.speed + grain.speedMin) -> (grain.speed + grain.speedMax). This value should almost always be negative.
**/
/**###Gibberish.Granulator.speedMax : property
Float. When set, the playback rate will vary on a per grain basis from (grain.speed + grain.speedMin) -> (grain.speed + grain.speedMax).
**/
/**###Gibberish.Granulator.grainSize : property
Integer. The length, in samples, of each grain
**/
/**###Gibberish.Granulator.position : property
Float. The center position of the grain cloud. 0 represents the start of the buffer, 1 represents the end.
**/
/**###Gibberish.Granulator.positionMin : property
Float. The left boundary on the time axis of the grain cloud.
**/
/**###Gibberish.Granulator.positionMax : property
Float. The right boundary on the time axis of the grain cloud.
**/
/**###Gibberish.Granulator.buffer : property
Object. The input buffer to granulate.
**/
/**###Gibberish.Granulator.numberOfGrains : property
Float. The number of grains in the cloud. Can currently only be set on initialization.
**/

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

/**#Gibberish.Synth - Synth
Oscillator + attack / decay envelope.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
a.note(880);  
a.waveform = "Triangle";  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Synth.frequency : property  
Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.
**/
/**###Gibberish.Synth.pulsewidth : property  
Number. The duty cycle for PWM synthesis
**/
/**###Gibberish.Synth.attack : property  
Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth.decay : property  
Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth.glide : property  
Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.
**/
/**###Gibberish.Synth.amp : property  
Number. The relative amplitude level of the synth.
**/
/**###Gibberish.Synth.channels : property  
Number. Default 2. Mono or Stereo synthesis.
**/
/**###Gibberish.Synth.pan : property  
Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.
**/
/**###Gibberish.Synth.waveform : property  
String. The type of waveform to use. Options include 'Sine', 'Triangle', 'PWM', 'Saw' etc.
**/
		
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
/**###Gibberish.Synth.note : method  
Generate an enveloped note at the provided frequency  
  
param **frequency** Number. The frequency for the oscillator.  
param **amp** Number. Optional. The volume to use.  
**/    
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

/**#Gibberish.PolySynth - Synth
A polyphonic version of [Synth](javascript:displayDocs('Gibberish.Synth'\)). There are two additional properties for the polyphonic version of the synth. The polyphonic version consists of multiple Synths being fed into a single [Bus](javascript:displayDocs('Gibberish.Bus'\)) object.
  
## Example Usage ##
`Gibberish.init();  
a = new Gibberish.PolySytn({ attack:88200, decay:88200, maxVoices:10 }).connect();  
a.note(880);  
a.note(1320); 
a.note(1760);  
`  
## Constructor   
One important property to pass to the constructor is the maxVoices property, which defaults to 5. This controls how many voices are allocated to the synth and cannot be changed after initialization.  
  
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.PolySynth.children : property  
Array. Read-only. An array holding all of the child FMSynth objects.
**/
/**###Gibberish.PolySynth.maxVoices : property  
Number. The number of voices of polyphony the synth has. May only be set in initialization properties passed to constrcutor.
**/
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

/**###Gibberish.PolySynth.note : method  
Generate an enveloped note at the provided frequency using a simple voice allocation system where if all children are active, the one active the longest cancels its current note and begins playing a new one.    
  
param **frequency** Number. The frequency for the oscillator. 
param **amp** Number. Optional. The volume to use.  
**/  
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

/**#Gibberish.Synth2 - Synth
Oscillator + attack / decay envelope + 24db ladder filter. Basically the same as the [Synth](javascript:displayDocs('Gibberish.Synth'\)) object but with the addition of the filter. Note that the envelope controls both the amplitude of the oscillator and the cutoff frequency of the filter.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Synth2({ attack:44, decay:44100, cutoff:.2, resonance:4 }).connect();  
a.note(880);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Synth2.frequency : property  
Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.
**/
/**###Gibberish.Synth2.pulsewidth : property  
Number. The duty cycle for PWM synthesis
**/
/**###Gibberish.Synth2.attack : property  
Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth2.decay : property  
Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth2.cutoff : property  
Number. 0..1. The cutoff frequency for the synth's filter.
**/
/**###Gibberish.Synth2.resonance : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.Synth2.useLowPassFilter : property  
Boolean. Default true. Whether to use a high-pass or low-pass filter.
**/
/**###Gibberish.Synth2.glide : property  
Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.
**/
/**###Gibberish.Synth2.amp : property  
Number. The relative amplitude level of the synth.
**/
/**###Gibberish.Synth2.channels : property  
Number. Default 2. Mono or Stereo synthesis.
**/
/**###Gibberish.Synth2.pan : property  
Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.
**/
/**###Gibberish.Synth2.waveform : property  
String. The type of waveform to use. Options include 'Sine', 'Triangle', 'PWM', 'Saw' etc.
**/
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
/**###Gibberish.Synth2.note : method  
Generate an enveloped note at the provided frequency  
  
param **frequency** Number. The frequency for the oscillator.  
param **amp** Number. Optional. The volume to use.  
**/      
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
/**#Gibberish.FMSynth - Synth
Classic 2-op FM synthesis with an attached attack / decay envelope.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.FMSynth({ cmRatio:5, index:3 }).connect();
a.note(880);`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.FMSynth.frequency : property  
Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.
**/
/**###Gibberish.FMSynth.cmRatio : property  
Number. The carrier-to-modulation ratio. A cmRatio of 2 means that the carrier frequency will be twice the frequency of the modulator.
**/
/**###Gibberish.FMSynth.attack : property  
Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.FMSynth.decay : property  
Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.FMSynth.glide : property  
Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.
**/
/**###Gibberish.FMSynth.amp : property  
Number. The relative amplitude level of the synth.
**/
/**###Gibberish.FMSynth.channels : property  
Number. Default 2. Mono or Stereo synthesis.
**/
/**###Gibberish.FMSynth.pan : property  
Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.
**/
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
/**###Gibberish.FMSynth.note : method  
Generate an enveloped note at the provided frequency  
  
param **frequency** Number. The frequency for the carrier oscillator. The modulator frequency will be calculated automatically from this value in conjunction with the synth's  
param **amp** Number. Optional. The volume to use.  
**/
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
    	out         = [0,0],
      phase = 0,
      check = false;

  this.callback = function(frequency, cmRatio, index, attack, decay, glide, amp, channels, pan) {    
		if(envstate() < 2) {				
      if(glide >= 1) glide = .9999;
      frequency = lag(frequency, 1-glide, glide);
      
			var env = envelope(attack, decay);
			var mod = modulator(frequency * cmRatio, frequency * index) * env;
      //if(phase++ % 22050 === 0 ) console.log(mod);
			var val = carrier( frequency + mod, 1, 1 ) * env * amp;
      if(isNaN(val) && !check){ 
        console.log(frequency, mod, cmRatio, frequency * index, env, amp, val);
        check = true;
      }
      //if(phase++ % 22050 === 0 ) console.log(val);

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
/**#Gibberish.PolyFM - Synth
A polyphonic version of [FMSynth](javascript:displayDocs('Gibberish.FMSynth'\)). There are two additional properties for the polyphonic version of the synth. The polyphonic version consists of multiple FMSynths being fed into a single [Bus](javascript:displayDocs('Gibberish.Bus'\)) object.
  
## Example Usage ##
`Gibberish.init();  
a = new Gibberish.PolyFM({ cmRatio:5, index:3, attack:88200, decay:88200 }).connect();  
a.note(880);  
a.note(1320);  
`  
## Constructor   
One important property to pass to the constructor is the maxVoices property, which defaults to 5. This controls how many voices are allocated to the synth and cannot be changed after initialization.  
  
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.PolyFM.children : property  
Array. Read-only. An array holding all of the child FMSynth objects.
**/
/**###Gibberish.PolyFM.maxVoices : property  
Number. The number of voices of polyphony the synth has. May only be set in initialization properties passed to constrcutor.
**/
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
/**###Gibberish.PolyFM.note : method  
Generate an enveloped note at the provided frequency using a simple voice allocation system where if all children are active, the one active the longest cancels its current note and begins playing a new one.    
  
param **frequency** Number. The frequency for the carrier oscillator. The modulator frequency will be calculated automatically from this value in conjunction with the synth's  
param **amp** Number. Optional. The volume to use.  
**/
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

// this file is dependent on oscillators.js

/**#Gibberish.Sampler - Oscillator
Sample recording and playback.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Sampler({ file:'resources/snare.wav' }).connect();  
a.note(2);  
a.note(1);  
a.note(-.5);  
b = new Gibberish.Sampler().connect();  
b.record(a, 88200); // record two seconds of a playing  
a.note(8);  
// wait a bit    
b.note(1);`
`
## Constructor
###syntax 1  
**param** *filepath*: String. A path to the audiofile to be opened by the sampler.  
###syntax 2    
**param** *properties*: Object. A dictionary of property values (see below) to set for the sampler on initialization.
- - - -
**/
/**###Gibberish.Sampler.pitch : property  
Number. The speed that the sample is played back at. A pitch of 1 means the sample plays forward at speed it was recorded at, a pitch of -4 means the sample plays backwards at 4 times the speed it was recorded at.
**/
/**###Gibberish.Sampler.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.Sampler.isRecording : property  
Boolean. Tells the sample to record into it's buffer. This is handled automatically by the object; there is no need to manually set this property.
**/
/**###Gibberish.Sampler.isPlaying : property  
Number. 0..1. Tells the sample to record into it's buffer. This is handled automatically by the object; there is no need to manually set this property.
**/
/**###Gibberish.Sampler.input : property  
Object. The object the sampler is tapping into and recording.
**/
/**###Gibberish.Sampler.length : property  
Number. The length of the Sampler's buffer.
**/
/**###Gibberish.Sampler.start : property  
Number. When the Sampler's note method is called, sample playback begins at this sample.
**/
/**###Gibberish.Sampler.end : property  
Number. When the Sampler's note method is called, sample playback ends at this sample.
**/
/**###Gibberish.Sampler.loops : property  
Boolean. When true, sample playback loops continuously between the start and end property values.
**/
/**###Gibberish.Sampler.pan : property  
Number. -1..1. Position of the Sampler in the stereo spectrum.
**/

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
    playOnLoad :  0,
    
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
    
/**###Gibberish.Sampler._onload : method  
This is an event handler that is called when a sampler has finished loading an audio file  
  
param **buffer** Object. The decoded sampler buffers from the audio file
**/ 
		_onload : 		function(decoded) {
			buffer = decoded.channels[0]; 
			bufferLength = decoded.length;
					
			self.end = bufferLength;
      self.length = phase = bufferLength;
					
			console.log("LOADED ", self.file, bufferLength);
			Gibberish.audioFiles[self.file] = buffer;
			
      if(self.onload) self.onload();
      
      
      if(self.playOnLoad !== 0) self.note(self.playOnLoad);
      
			self.isLoaded = true;
		},

/**###Gibberish.Sampler.note : method  
Trigger playback of the samplers buffer
  
param **pitch** Number. The speed the sample is played back at.  
param **amp** Number. Optional. The volume to use.
**/    
		note: function(pitch, amp) {
			if(typeof pitch === 'number') this.pitch = pitch;
			if(typeof amp === 'number') this.amp = amp;
					
			if(this.function !== null) {
				this.isPlaying = true;	// needed to allow playback after recording
				if(this.pitch > 0) {
          phase = this.start;
				}else{
          phase = this.end;
				}
			}
		},
/**###Gibberish.Sampler.record : method  
Record the output of a Gibberish ugen for a given amount of time
  
param **ugen** Object. The Gibberish ugen to be recorded.
param **recordLength** Number (in samples). How long to record for.
**/     
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

/**###Gibberish.Sampler.getBuffer : method  
Returns a pointer to the Sampler's internal buffer.  
**/
    getBuffer : function() {
      return buffer;
    },
/**###Gibberish.Sampler.callback : method  
Return a single sample. It's a pretty lengthy method signature, they are all properties that have already been listed:  

_pitch, amp, isRecording, isPlaying, input, length, start, end, loops, pan
**/    
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
	})
  .init()
  .oscillatorInit()  
  .processProperties(arguments);

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
  
  console.log(this);
  		
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
/**#Gibberish.Mono - Synth
A three oscillator monosynth for bass and lead lines. You can set the octave and tuning offsets for oscillators 2 & 3. There is a 24db filter and an envelope controlling
both the amplitude and filter cutoff.
## Example Usage##
`  
t = new Gibberish.Mono({  
	cutoff:0,  
	filterMult:.5,  
	attack:_8,  
	decay:_8,  
	octave2:-1,  
	octave3:-1,  
	detune2:.01,  
	glide:_12,  
}).connect();  
t.note("C3");  `
## Constructors
  param **arguments** : Object. A dictionary of property values to set upon initialization. See the properties section and the example usage section for details.
**/
/**###Gibberish.Mono.waveform : property
String. The primary oscillator to be used. Can currently be 'Sine', 'Square', 'Noise', 'Triangle' or 'Saw'. 
**/
/**###Gibberish.Mono.attack : property
Integer. The length, in samples, of the attack of the amplitude envelope.
**/
/**###Gibberish.Mono.decay : property
Integer. The length, in samples, of the decay of the amplitude envelope.
**/
/**###Gibberish.Mono.amp : property
Float. The peak amplitude of the synth, usually between 0..1
**/
/**###Gibberish.Mono.cutoff : property
Float. The frequency cutoff for the synth's filter. Range is 0..1.
**/
/**###Gibberish.Mono.filterMult : property
Float. As the envelope on the synth progress, the filter cutoff will also change by this amount * the envelope amount.
**/
/**###Gibberish.Mono.resonance : property
Float. The emphasis placed on the filters cutoff frequency. 0..50, however, GOING OVER 5 IS DANGEROUS TO YOUR EARS (ok, maybe 6 is all right...)
**/
/**###Gibberish.Mono.octave2 : property
Integer. The octave difference between oscillator 1 and oscillator 2. Can be positive (higher osc2) or negative (lower osc 2) or 0 (same octave).
**/
/**###Gibberish.Mono.detune2 : property
Float. The amount, from -1..1, the oscillator 2 is detuned. A value of -.5 means osc2 is half an octave lower than osc1. A value of .01 means osc2 is .01 octaves higher than osc1.
**/
/**###Gibberish.Mono.octave3 : property
Integer. The octave difference between oscillator 1 and oscillator 3. Can be positive (higher osc3) or negative (lower osc 3) or 0 (same octave).
**/
/**###Gibberish.Mono.detune3 : property
Float. The amount, from -1..1, the oscillator 3 is detuned. A value of -.5 means osc3 is half an octave lower than osc1. A value of .01 means osc3 is .01 octaves higher than osc1.
**/
/**###Gibberish.Mono.glide : property
Integer. The length in time, in samples, to slide in pitch from one note to the next.
**/
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
/**###Gibberish.Mono.note : method
param **note or frequency** : String or Integer. You can pass a note name, such as "A#4", or a frequency value, such as 440.
param **amp** : Optional. Float. The volume of the note, usually between 0..1. The main amp property of the Synth will also affect note amplitude.
**/				
		note : function(_frequency, amp) {
      if(typeof amp !== 'undefined')
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
var _out = [], _phase = 0;

Gibberish.Expressions = {
  add : function() {
    var args = Array.prototype.slice.call(arguments, 0),
        phase = 0,
        isArray = Array.isArray;
  
    var me = {
      name : 'add',
      properties : {},
      callback : function(a,b) {
        if(isArray(a)) {
          if(typeof b === 'number') {
            //if(phase++ % 22050 === 0) console.log(a,b)
            _out[0] = a[0] + b;
            _out[1] = a[1] + b;          
            return _out;
          }else{
            //if(phase++ % 22050 === 0) console.log(a,b)
            _out[0] = a[0] + b[0];
            _out[1] = a[1] + b[1];          
            return _out;
          }
        }else{
          if(isArray(b)) {
            _out[0] = a + b[0];
            _out[1] = a + b[1];            
          }
        }
        return a + b;
      },
    };
    me.__proto__ = new Gibberish.ugen();
  
    for(var i = 0; i < args.length; i++) {
      me.properties[i] = args[i];
    }
    me.init();

    return me;
  },

  sub : function() {
    var args = Array.prototype.slice.call(arguments, 0),
        phase = 0;
  
    var me = {
      name : 'sub',
      properties : {},
      callback : function(a,b) {
        return a - b;
      },
    };
    me.__proto__ = new Gibberish.ugen();
  
    for(var i = 0; i < args.length; i++) {
      me.properties[i] = args[i];
    }
    me.init();

    return me;
  },

  mul : function() {
    var args = Array.prototype.slice.call(arguments, 0),
        phase = 0;
  
    var me = {
      name : 'mul',
      properties : {},
      callback : function(a,b) {
        return a * b; 
      },
    };
    me.__proto__ = new Gibberish.ugen();
  
    for(var i = 0; i < args.length; i++) {
      me.properties[i] = args[i];
    }
    me.init();

    return me;
  },

  div : function() {
    var args = Array.prototype.slice.call(arguments, 0),
        phase = 0;
  
    var me = {
      name : 'div',
      properties : {},
      callback : function(a,b) { return a / b; },
    };
    me.__proto__ = new Gibberish.ugen();
  
    for(var i = 0; i < args.length; i++) {
      me.properties[i] = args[i];
    }
    me.init();

    return me;
  },

  abs : function() {
    var args = Array.prototype.slice.call(arguments, 0),
        _abs = Math.abs;
  
    var me = {
      name : 'abs',
      properties : {},
      callback : Math.abs,
    };
    me.__proto__ = new Gibberish.ugen();
    me.properties[0] = arguments[0];
    me.init();

    return me;
  },
  
  mod : function() {
    var args = Array.prototype.slice.call(arguments, 0);
  
    var me = {
      name : 'mod',
      properties : {},
      callback : function(a,b) {
        return a % b;
      },
    };
    me.__proto__ = new Gibberish.ugen();
  
    for(var i = 0; i < args.length; i++) {
      me.properties[i] = args[i];
    }
    me.init();

    return me;
  },
  
  sqrt : function() {
    var args = Array.prototype.slice.call(arguments, 0)
        _sqrt = Math.sqrt;
  
    var me = {
      name : 'sqrt',
      properties : {},
      callback : Math.sqrt,
    };
    me.__proto__ = new Gibberish.ugen();    
    me.properties[i] = arguments[0];
    me.init();

    return me;
  },
  
  pow : function() {
    var args = Array.prototype.slice.call(arguments, 0);
      
    var me = {
      name : 'pow',
      properties : {},
      callback : Math.pow,
    };
    me.__proto__ = new Gibberish.ugen();
  
    for(var i = 0; i < args.length; i++) { me.properties[i] = args[i]; }
    me.init();

    return me;
  }
};
Gibberish.Sequencer = function() {  
  Gibberish.extend(this, {
    target        : null,
    key           : null,
    values        : null,
    valuesIndex   : 0,
    rate          : null,
    rateIndex     : 0,
    nextTime      : 0,
    phase         : 0,
    isRunning     : false,
    playOnce      : false,
    repeatCount   : 0,
    repeatTarget  : null,
    isConnected   : true,
    keysAndValues : null,
    counts        : {},
    
    tick : function() {
      if(this.isRunning) {
        if(this.phase === this.nextTime) {
          if(this.values !== null) {
            if(this.target) {
              var val = this.values[ this.valuesIndex++ ];
              
              if(typeof val === 'function') { val = val(); }
              
              if(typeof this.target[this.key] === 'function') {
                this.target[this.key]( val );
              }else{
                this.target[this.key] = val;
              }
            }else{
              if(typeof this.values[ this.valuesIndex ] === 'function') {
                this.values[ this.valuesIndex++ ]();
              }
            }
            if(this.valuesIndex >= this.values.length) this.valuesIndex = 0;
          }else if(this.keysAndValues !== null) {
            for(var key in this.keysAndValues) {
              var index = this.counts[key]++;
              var val = this.keysAndValues[key][index];
              
              if(typeof val === 'function') { val = val(); }
              
              if(typeof this.target[key] === 'function') {
                this.target[key]( val );
              }else{
                this.target[key] = val;
              }
              if(this.counts[key] >= this.keysAndValues[key].length) {
                this.counts[key] = 0;
              }
            }
          }else if(typeof this.target[this.key] === 'function') {
            this.target[this.key]();
          }
          
          this.phase = 0;
        
          if(Array.isArray(this.rate)) {
            this.nextTime = this.rate[ this.rateIndex++ ];
            if( this.rateIndex >= this.rate.length) {
              this.rateIndex = 0;
            }
          }else{
            this.nextTime = this.rate;
          }
          
          if(this.repeatTarget) {
            this.repeatCount++;
            if(this.repeatCount === this.repeatTarget) {
              this.isRunning = false;
              this.repeatCount = 0;
            }
          }
          
          return;
        }
      
        this.phase++;
      }
    },
    
    start : function(shouldKeepOffset) {
      if(!shouldKeepOffset) {
        this.phase = 0;
      }
      
      this.isRunning = true;
      return this;
    },
    
    stop: function() {
      this.isRunning = false;
      return this;
    },
    
    repeat : function(times) {
      this.repeatTarget = times;
      return this;
    },
    
    disconnect : function() {
      var idx = Gibberish.sequencers.indexOf( this );
      Gibberish.sequencers.splice( idx, 1 );
      this.isConnected = false;
    },
    
    connect : function() {
      if( Gibberish.sequencers.indexOf( this ) === -1 ) {
        Gibberish.sequencers.push( this );
      }
    },
  });
  
  for(var key in arguments[0]) {
    this[key] = arguments[0][key];
  }
  
  for(var key in this.keysAndValues) {
    this.counts[key] = 0;
  }
  
  this.connect();
};
Gibberish.docs = {"Gibberish.Synth":{"text":"<h1 id=\"gibberishsynthsynth\">Gibberish.Synth </h1>\n\n<p>Oscillator + attack / decay envelope.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>Gibberish.init(); <br />\na = new Gibberish.Synth({ attack:44, decay:44100 }).connect(); <br />\na.note(880); <br />\na.waveform = \"Triangle\"; <br />\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{"note":"<h3 id=\"gibberishsynthnotemethod\">Gibberish.Synth.note : method</h3>\n\n<p>Generate an enveloped note at the provided frequency  </p>\n\n<p>param <strong>frequency</strong> Number. The frequency for the oscillator. <br />\nparam <strong>amp</strong> Number. Optional. The volume to use.  </p>"},"properties":{"frequency":"<h3 id=\"gibberishsynthfrequencyproperty\">Gibberish.Synth.frequency : property</h3>\n\n<p>Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.</p>","pulsewidth":"<h3 id=\"gibberishsynthpulsewidthproperty\">Gibberish.Synth.pulsewidth : property</h3>\n\n<p>Number. The duty cycle for PWM synthesis</p>","attack":"<h3 id=\"gibberishsynthattackproperty\">Gibberish.Synth.attack : property</h3>\n\n<p>Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.</p>","decay":"<h3 id=\"gibberishsynthdecayproperty\">Gibberish.Synth.decay : property</h3>\n\n<p>Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.</p>","glide":"<h3 id=\"gibberishsynthglideproperty\">Gibberish.Synth.glide : property</h3>\n\n<p>Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.</p>","amp":"<h3 id=\"gibberishsynthampproperty\">Gibberish.Synth.amp : property</h3>\n\n<p>Number. The relative amplitude level of the synth.</p>","channels":"<h3 id=\"gibberishsynthchannelsproperty\">Gibberish.Synth.channels : property</h3>\n\n<p>Number. Default 2. Mono or Stereo synthesis.</p>","pan":"<h3 id=\"gibberishsynthpanproperty\">Gibberish.Synth.pan : property</h3>\n\n<p>Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.</p>","waveform":"<h3 id=\"gibberishsynthwaveformproperty\">Gibberish.Synth.waveform : property</h3>\n\n<p>String. The type of waveform to use. Options include 'Sine', 'Triangle', 'PWM', 'Saw' etc.</p>"},"type":" Synth"},"Gibberish.PolySynth":{"text":"<h1 id=\"gibberishpolysynthsynth\">Gibberish.PolySynth </h1>\n\n<p>A polyphonic version of <a href=\"javascript:displayDocs('Gibberish.Synth')\">Synth</a>. There are two additional properties for the polyphonic version of the synth. The polyphonic version consists of multiple Synths being fed into a single <a href=\"javascript:displayDocs('Gibberish.Bus')\">Bus</a> object.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>Gibberish.init(); <br />\na = new Gibberish.PolySytn({ attack:88200, decay:88200, maxVoices:10 }).connect(); <br />\na.note(880); <br />\na.note(1320); \na.note(1760); <br />\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p>One important property to pass to the constructor is the maxVoices property, which defaults to 5. This controls how many voices are allocated to the synth and cannot be changed after initialization.  </p>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{"note":"<h3 id=\"gibberishpolysynthnotemethod\">Gibberish.PolySynth.note : method</h3>\n\n<p>Generate an enveloped note at the provided frequency using a simple voice allocation system where if all children are active, the one active the longest cancels its current note and begins playing a new one.    </p>\n\n<p>param <strong>frequency</strong> Number. The frequency for the oscillator. \nparam <strong>amp</strong> Number. Optional. The volume to use.  </p>"},"properties":{"children":"<h3 id=\"gibberishpolysynthchildrenproperty\">Gibberish.PolySynth.children : property</h3>\n\n<p>Array. Read-only. An array holding all of the child FMSynth objects.</p>","maxVoices":"<h3 id=\"gibberishpolysynthmaxvoicesproperty\">Gibberish.PolySynth.maxVoices : property</h3>\n\n<p>Number. The number of voices of polyphony the synth has. May only be set in initialization properties passed to constrcutor.</p>"},"type":" Synth"},"Gibberish.Synth2":{"text":"<h1 id=\"gibberishsynth2synth\">Gibberish.Synth2 </h1>\n\n<p>Oscillator + attack / decay envelope + 24db ladder filter. Basically the same as the <a href=\"javascript:displayDocs('Gibberish.Synth')\">Synth</a> object but with the addition of the filter. Note that the envelope controls both the amplitude of the oscillator and the cutoff frequency of the filter.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>Gibberish.init(); <br />\na = new Gibberish.Synth2({ attack:44, decay:44100, cutoff:.2, resonance:4 }).connect(); <br />\na.note(880); <br />\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{"note":"<h3 id=\"gibberishsynth2notemethod\">Gibberish.Synth2.note : method</h3>\n\n<p>Generate an enveloped note at the provided frequency  </p>\n\n<p>param <strong>frequency</strong> Number. The frequency for the oscillator. <br />\nparam <strong>amp</strong> Number. Optional. The volume to use.  </p>"},"properties":{"frequency":"<h3 id=\"gibberishsynth2frequencyproperty\">Gibberish.Synth2.frequency : property</h3>\n\n<p>Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.</p>","pulsewidth":"<h3 id=\"gibberishsynth2pulsewidthproperty\">Gibberish.Synth2.pulsewidth : property</h3>\n\n<p>Number. The duty cycle for PWM synthesis</p>","attack":"<h3 id=\"gibberishsynth2attackproperty\">Gibberish.Synth2.attack : property</h3>\n\n<p>Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.</p>","decay":"<h3 id=\"gibberishsynth2decayproperty\">Gibberish.Synth2.decay : property</h3>\n\n<p>Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.</p>","cutoff":"<h3 id=\"gibberishsynth2cutoffproperty\">Gibberish.Synth2.cutoff : property</h3>\n\n<p>Number. 0..1. The cutoff frequency for the synth's filter.</p>","resonance":"<h3 id=\"gibberishsynth2resonanceproperty\">Gibberish.Synth2.resonance : property</h3>\n\n<p>Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.</p>","useLowPassFilter":"<h3 id=\"gibberishsynth2uselowpassfilterproperty\">Gibberish.Synth2.useLowPassFilter : property</h3>\n\n<p>Boolean. Default true. Whether to use a high-pass or low-pass filter.</p>","glide":"<h3 id=\"gibberishsynth2glideproperty\">Gibberish.Synth2.glide : property</h3>\n\n<p>Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.</p>","amp":"<h3 id=\"gibberishsynth2ampproperty\">Gibberish.Synth2.amp : property</h3>\n\n<p>Number. The relative amplitude level of the synth.</p>","channels":"<h3 id=\"gibberishsynth2channelsproperty\">Gibberish.Synth2.channels : property</h3>\n\n<p>Number. Default 2. Mono or Stereo synthesis.</p>","pan":"<h3 id=\"gibberishsynth2panproperty\">Gibberish.Synth2.pan : property</h3>\n\n<p>Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.</p>","waveform":"<h3 id=\"gibberishsynth2waveformproperty\">Gibberish.Synth2.waveform : property</h3>\n\n<p>String. The type of waveform to use. Options include 'Sine', 'Triangle', 'PWM', 'Saw' etc.</p>"},"type":" Synth"},"Gibberish.FMSynth":{"text":"<h1 id=\"gibberishfmsynthsynth\">Gibberish.FMSynth </h1>\n\n<p>Classic 2-op FM synthesis with an attached attack / decay envelope.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>Gibberish.init(); <br />\na = new Gibberish.FMSynth({ cmRatio:5, index:3 }).connect();\na.note(880);</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{"note":"<h3 id=\"gibberishfmsynthnotemethod\">Gibberish.FMSynth.note : method</h3>\n\n<p>Generate an enveloped note at the provided frequency  </p>\n\n<p>param <strong>frequency</strong> Number. The frequency for the carrier oscillator. The modulator frequency will be calculated automatically from this value in conjunction with the synth's <br />\nparam <strong>amp</strong> Number. Optional. The volume to use.  </p>"},"properties":{"frequency":"<h3 id=\"gibberishfmsynthfrequencyproperty\">Gibberish.FMSynth.frequency : property</h3>\n\n<p>Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.</p>","cmRatio":"<h3 id=\"gibberishfmsynthcmratioproperty\">Gibberish.FMSynth.cmRatio : property</h3>\n\n<p>Number. The carrier-to-modulation ratio. A cmRatio of 2 means that the carrier frequency will be twice the frequency of the modulator.</p>","attack":"<h3 id=\"gibberishfmsynthattackproperty\">Gibberish.FMSynth.attack : property</h3>\n\n<p>Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.</p>","decay":"<h3 id=\"gibberishfmsynthdecayproperty\">Gibberish.FMSynth.decay : property</h3>\n\n<p>Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.</p>","glide":"<h3 id=\"gibberishfmsynthglideproperty\">Gibberish.FMSynth.glide : property</h3>\n\n<p>Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.</p>","amp":"<h3 id=\"gibberishfmsynthampproperty\">Gibberish.FMSynth.amp : property</h3>\n\n<p>Number. The relative amplitude level of the synth.</p>","channels":"<h3 id=\"gibberishfmsynthchannelsproperty\">Gibberish.FMSynth.channels : property</h3>\n\n<p>Number. Default 2. Mono or Stereo synthesis.</p>","pan":"<h3 id=\"gibberishfmsynthpanproperty\">Gibberish.FMSynth.pan : property</h3>\n\n<p>Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.</p>"},"type":" Synth"},"Gibberish.PolyFM":{"text":"<h1 id=\"gibberishpolyfmsynth\">Gibberish.PolyFM </h1>\n\n<p>A polyphonic version of <a href=\"javascript:displayDocs('Gibberish.FMSynth')\">FMSynth</a>. There are two additional properties for the polyphonic version of the synth. The polyphonic version consists of multiple FMSynths being fed into a single <a href=\"javascript:displayDocs('Gibberish.Bus')\">Bus</a> object.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>Gibberish.init(); <br />\na = new Gibberish.PolyFM({ cmRatio:5, index:3, attack:88200, decay:88200 }).connect(); <br />\na.note(880); <br />\na.note(1320); <br />\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p>One important property to pass to the constructor is the maxVoices property, which defaults to 5. This controls how many voices are allocated to the synth and cannot be changed after initialization.  </p>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{"note":"<h3 id=\"gibberishpolyfmnotemethod\">Gibberish.PolyFM.note : method</h3>\n\n<p>Generate an enveloped note at the provided frequency using a simple voice allocation system where if all children are active, the one active the longest cancels its current note and begins playing a new one.    </p>\n\n<p>param <strong>frequency</strong> Number. The frequency for the carrier oscillator. The modulator frequency will be calculated automatically from this value in conjunction with the synth's <br />\nparam <strong>amp</strong> Number. Optional. The volume to use.  </p>"},"properties":{"children":"<h3 id=\"gibberishpolyfmchildrenproperty\">Gibberish.PolyFM.children : property</h3>\n\n<p>Array. Read-only. An array holding all of the child FMSynth objects.</p>","maxVoices":"<h3 id=\"gibberishpolyfmmaxvoicesproperty\">Gibberish.PolyFM.maxVoices : property</h3>\n\n<p>Number. The number of voices of polyphony the synth has. May only be set in initialization properties passed to constrcutor.</p>"},"type":" Synth"},"Gibberish.Mono":{"text":"<h1 id=\"gibberishmonosynth\">Gibberish.Mono </h1>\n\n<p>A three oscillator monosynth for bass and lead lines. You can set the octave and tuning offsets for oscillators 2 &amp; 3. There is a 24db filter and an envelope controlling\nboth the amplitude and filter cutoff.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>\nt = new Gibberish.Mono({ <br />\n    cutoff:0, <br />\n    filterMult:.5, <br />\n    attack:_8, <br />\n    decay:_8, <br />\n    octave2:-1, <br />\n    octave3:-1, <br />\n    detune2:.01, <br />\n    glide:_12, <br />\n}).connect(); <br />\nt.note(\"C3\");</code></p>\n\n<h2 id=\"constructors\">Constructors</h2>\n\n<p>param <strong>arguments</strong> : Object. A dictionary of property values to set upon initialization. See the properties section and the example usage section for details.</p>","methods":{"note":"<h3 id=\"gibberishmononotemethod\">Gibberish.Mono.note : method</h3>\n\n<p>param <strong>note or frequency</strong> : String or Integer. You can pass a note name, such as \"A#4\", or a frequency value, such as 440.\nparam <strong>amp</strong> : Optional. Float. The volume of the note, usually between 0..1. The main amp property of the Synth will also affect note amplitude.</p>"},"properties":{"waveform":"<h3 id=\"gibberishmonowaveformproperty\">Gibberish.Mono.waveform : property</h3>\n\n<p>String. The primary oscillator to be used. Can currently be 'Sine', 'Square', 'Noise', 'Triangle' or 'Saw'. </p>","attack":"<h3 id=\"gibberishmonoattackproperty\">Gibberish.Mono.attack : property</h3>\n\n<p>Integer. The length, in samples, of the attack of the amplitude envelope.</p>","decay":"<h3 id=\"gibberishmonodecayproperty\">Gibberish.Mono.decay : property</h3>\n\n<p>Integer. The length, in samples, of the decay of the amplitude envelope.</p>","amp":"<h3 id=\"gibberishmonoampproperty\">Gibberish.Mono.amp : property</h3>\n\n<p>Float. The peak amplitude of the synth, usually between 0..1</p>","cutoff":"<h3 id=\"gibberishmonocutoffproperty\">Gibberish.Mono.cutoff : property</h3>\n\n<p>Float. The frequency cutoff for the synth's filter. Range is 0..1.</p>","filterMult":"<h3 id=\"gibberishmonofiltermultproperty\">Gibberish.Mono.filterMult : property</h3>\n\n<p>Float. As the envelope on the synth progress, the filter cutoff will also change by this amount * the envelope amount.</p>","resonance":"<h3 id=\"gibberishmonoresonanceproperty\">Gibberish.Mono.resonance : property</h3>\n\n<p>Float. The emphasis placed on the filters cutoff frequency. 0..50, however, GOING OVER 5 IS DANGEROUS TO YOUR EARS (ok, maybe 6 is all right...)</p>","octave2":"<h3 id=\"gibberishmonooctave2property\">Gibberish.Mono.octave2 : property</h3>\n\n<p>Integer. The octave difference between oscillator 1 and oscillator 2. Can be positive (higher osc2) or negative (lower osc 2) or 0 (same octave).</p>","detune2":"<h3 id=\"gibberishmonodetune2property\">Gibberish.Mono.detune2 : property</h3>\n\n<p>Float. The amount, from -1..1, the oscillator 2 is detuned. A value of -.5 means osc2 is half an octave lower than osc1. A value of .01 means osc2 is .01 octaves higher than osc1.</p>","octave3":"<h3 id=\"gibberishmonooctave3property\">Gibberish.Mono.octave3 : property</h3>\n\n<p>Integer. The octave difference between oscillator 1 and oscillator 3. Can be positive (higher osc3) or negative (lower osc 3) or 0 (same octave).</p>","detune3":"<h3 id=\"gibberishmonodetune3property\">Gibberish.Mono.detune3 : property</h3>\n\n<p>Float. The amount, from -1..1, the oscillator 3 is detuned. A value of -.5 means osc3 is half an octave lower than osc1. A value of .01 means osc3 is .01 octaves higher than osc1.</p>","glide":"<h3 id=\"gibberishmonoglideproperty\">Gibberish.Mono.glide : property</h3>\n\n<p>Integer. The length in time, in samples, to slide in pitch from one note to the next.</p>"},"type":" Synth"},"Gibberish.Distortion":{"text":"<h1 id=\"gibberishdistortionfx\">Gibberish.Distortion </h1>\n\n<p>A simple waveshaping distortion that adaptively scales its gain based on the amount of distortion applied.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>a = new Gibberish.Synth({ attack:44, decay:44100 }); <br />\nb = new Gibberish.Distortion({ input:a, amount:30 }).connect(); <br />\na.note(440); <br />\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{},"properties":{"amount":"<h3 id=\"gibberishdistortionamountproperty\">Gibberish.Distortion.amount : property</h3>\n\n<p>Number. The amount of distortion to apply. This number cannot be set lower than 2.</p>"},"type":" FX"},"Gibberish.Delay":{"text":"<h1 id=\"gibberishdelayfx\">Gibberish.Delay </h1>\n\n<p>A simple echo effect.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>a = new Gibberish.Synth({ attack:44, decay:44100 }); <br />\nb = new Gibberish.Delay({ input:a, time:22050, feedback:.35 }).connect(); <br />\na.note(440); <br />\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{},"properties":{"time":"<h3 id=\"gibberishdelaytimeproperty\">Gibberish.Delay.time : property</h3>\n\n<p>Number. The delay time as measured in samples</p>","feedback":"<h3 id=\"gibberishdelayfeedbackproperty\">Gibberish.Delay.feedback : property</h3>\n\n<p>Number. The amount of feedback that the delay puts into its buffers.</p>"},"type":" FX"},"Gibberish.Decimator":{"text":"<h1 id=\"gibberishdecimatorfx\">Gibberish.Decimator </h1>\n\n<p>A bit-crusher / sample rate reducer. Adapted from code / comments at http://musicdsp.org/showArchiveComment.php?ArchiveID=124</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>a = new Gibberish.Synth({ attack:44, decay:44100 }); <br />\nb = new Gibberish.Decimator({ input:a, bitDepth:4.2, sampleRate:.33 }).connect(); <br />\na.note(440); <br />\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{},"properties":{"bitDepth":"<h3 id=\"gibberishdecimatorbitdepthproperty\">Gibberish.Decimator.bitDepth : property</h3>\n\n<p>Float. 0..16. The number of bits the signal is truncated to. May be a floating point number.</p>","sampleRate":"<h3 id=\"gibberishdecimatorsamplerateproperty\">Gibberish.Decimator.sampleRate : property</h3>\n\n<p>Number. 0..1. The sample rate to use where 0 is 0 Hz and 1 is nyquist.</p>"},"type":" FX"},"Gibberish.RingModulation":{"text":"<h1 id=\"gibberishringmodulationfx\">Gibberish.RingModulation </h1>\n\n<p>The name says it all. This ugen also has a mix property to control the ratio of wet to dry output.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>a = new Gibberish.Synth({ attack:44, decay:44100 }); <br />\nb = new Gibberish.RingModulation({ input:a, frequency:1000, amp:.4, mix:1 }).connect(); <br />\na.note(440); <br />\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{},"properties":{"frequency":"<h3 id=\"gibberishringmodulationfrequencyproperty\">Gibberish.RingModulation.frequency : property</h3>\n\n<p>Float. The frequency of the ring modulation modulator wave.</p>","amp":"<h3 id=\"gibberishringmodulationampproperty\">Gibberish.RingModulation.amp : property</h3>\n\n<p>Float. The amplitude of the ring modulation modulator wave.</p>","mix":"<h3 id=\"gibberishringmodulationmixproperty\">Gibberish.RingModulation.mix : property</h3>\n\n<p>Float. 0..1. The wet/dry output ratio. A value of 1 means a completely wet signal, a value of 0 means completely dry.</p>"},"type":" FX"},"Gibberish.OnePole":{"text":"<h1 id=\"gibberishonepolefx\">Gibberish.OnePole </h1>\n\n<p>A one-pole filter for smoothing property values. This is particularly useful when the properties are being controlled interactively. You use the smooth method to apply the filter.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>a = new Gibberish.Synth({ attack:44, decay:44100 }).connect(); <br />\nb = new Gibberish.OnePole({input:a.properties.frequency, a0:.0001, b1:.9999}); <br />\nb.smooth('frequency', a); <br />\na.note(880); <br />\na.note(440); <br />\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{"smooth":"<h3 id=\"gibberishonepolesmoothmethod\">Gibberish.OnePole.smooth : method</h3>\n\n<p>Use this to apply the filter to a property of an object.</p>\n\n<p>param <strong>propertyName</strong> String. The name of the property to smooth. <br />\nparam <strong>object</strong> Object. The object containing the property to be smoothed</p>"},"properties":{"input":"<h3 id=\"gibberishonepoleinputproperty\">Gibberish.OnePole.input : property</h3>\n\n<p>Float. The property to smooth. You should always refer to this property through the properties dictionary of the ugen. In general it is much easier to use the smooth method of the OnePole than to set this property manually.</p>","a0":"<h3 id=\"gibberishonepolea0property\">Gibberish.OnePole.a0 : property</h3>\n\n<p>Float. The value the input is multiplied by.</p>","b1":"<h3 id=\"gibberishonepoleb1property\">Gibberish.OnePole.b1 : property</h3>\n\n<p>Float. The value this pole of the filter is multiplied by.</p>"},"type":" FX"},"Gibberish.Filter24":{"text":"<h1 id=\"gibberishfilter24fx\">Gibberish.Filter24 </h1>\n\n<p>A four pole ladder filter. Adapted from Arif Ove Karlsne's 24dB ladder approximation: http://musicdsp.org/showArchiveComment.php?ArchiveID=141.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>a = new Gibberish.Synth({ attack:44, decay:44100 }); <br />\nb = new Gibberish.Filter24({input:a, cutoff:.2, resonance:4}).connect(); <br />\na.note(1760); <br />\na.note(440); <br />\na.isLowPass = false; <br />\na.note(220); <br />\na.note(1760); <br />\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{},"properties":{"input":"<h3 id=\"gibberishfilter24inputproperty\">Gibberish.Filter24.input : property</h3>\n\n<p>Object. The ugen that should feed the filter.</p>","cutoff":"<h3 id=\"gibberishfilter24cutoffproperty\">Gibberish.Filter24.cutoff : property</h3>\n\n<p>Number. 0..1. The cutoff frequency for the synth's filter.</p>","resonance":"<h3 id=\"gibberishfilter24resonanceproperty\">Gibberish.Filter24.resonance : property</h3>\n\n<p>Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.</p>","isLowPass":"<h3 id=\"gibberishfilter24islowpassproperty\">Gibberish.Filter24.isLowPass : property</h3>\n\n<p>Boolean. Default true. Whether to use a low-pass or high-pass filter.</p>"},"type":" FX"},"Gibberish.SVF":{"text":"<h1 id=\"gibberishsvffx\">Gibberish.SVF </h1>\n\n<p>A two-pole state variable filter. This filter calculates coefficients on a per-sample basis, so that you can easily modulate cutoff and Q. Can switch between low-pass, high-pass, band and notch modes.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>a = new Gibberish.Synth({ attack:44, decay:44100 }); <br />\nb = new Gibberish.SVF({input:a, cutoff:200, Q:4, mode:0}); <br />\na.note(1760); <br />\na.note(440); <br />\na.mode = 2;\na.note(220); <br />\na.note(1760); <br />\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{},"properties":{"input":"<h3 id=\"gibberishsvfinputproperty\">Gibberish.SVF.input : property</h3>\n\n<p>Object. The ugen that should feed the filter.</p>","cutoff":"<h3 id=\"gibberishsvfcutoffproperty\">Gibberish.SVF.cutoff : property</h3>\n\n<p>Number. 0..22050. The cutoff frequency for the synth's filter. Note that unlike the Filter24, this is measured in Hz.</p>","resonance":"<h3 id=\"gibberishsvfresonanceproperty\">Gibberish.SVF.resonance : property</h3>\n\n<p>Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.</p>","mode":"<h3 id=\"gibberishsvfmodeproperty\">Gibberish.SVF.mode : property</h3>\n\n<p>Number. 0..3. 0 = lowpass, 1 = highpass, 2 = bandpass, 3 = notch.</p>"},"type":" FX"},"Gibberish.Biquad":{"text":"<h1 id=\"gibberishbiquadfx\">Gibberish.Biquad </h1>\n\n<p>A two-pole biquad filter. Currently, you must manually call calculateCoefficients every time mode, cutoff or Q changes; thus this filter isn't good for samplerate modulation.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>a = new Gibberish.Synth({ attack:44, decay:44100 }); <br />\nb = new Gibberish.Biquad({input:a, cutoff:200, Q:4, mode:\"LP\"}).connect(); <br />\na.note(1760); <br />\na.note(440); <br />\na.mode = \"HP\";\na.note(220); <br />\na.note(1760); <br />\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{},"properties":{"input":"<h3 id=\"gibberishbiquadinputproperty\">Gibberish.Biquad.input : property</h3>\n\n<p>Object. The ugen that should feed the filter.</p>","cutoff":"<h3 id=\"gibberishbiquadcutoffproperty\">Gibberish.Biquad.cutoff : property</h3>\n\n<p>Number. 0..22050. The cutoff frequency for the synth's filter. Note that unlike the Filter24, this is measured in Hz.</p>","Q":"<h3 id=\"gibberishbiquadqproperty\">Gibberish.Biquad.Q : property</h3>\n\n<p>Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.</p>","mode":"<h3 id=\"gibberishbiquadmodeproperty\">Gibberish.Biquad.mode : property</h3>\n\n<p>Number. 0..3. \"LP\" = lowpass, \"HP\" = highpass, \"BP\" = bandpass</p>"},"type":" FX"},"Gibberish.Flanger":{"text":"<h1 id=\"gibberishflangerfx\">Gibberish.Flanger </h1>\n\n<p>Classic flanging effect with feedback.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>a = new Gibberish.Synth({ attack:44, decay:44100 }); <br />\nb = new Gibberish.Flanger({input:a, rate:.5, amount:125, feedback:.5}).connect(); <br />\na.note(440); <br />\na.feedback = 0; <br />\na.note(440); <br />\na.rate = 4;\na.note(440);\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{},"properties":{"input":"<h3 id=\"gibberishflangerinputproperty\">Gibberish.Flanger.input : property</h3>\n\n<p>Object. The ugen that should feed the flagner.</p>","rate":"<h3 id=\"gibberishflangerrateproperty\">Gibberish.Flanger.rate : property</h3>\n\n<p>Number. The speed at which the delay line tap position is modulated.</p>","amount":"<h3 id=\"gibberishflangeramountproperty\">Gibberish.Flanger.amount : property</h3>\n\n<p>Number. The amount of time, in samples, that the delay line tap position varies by.</p>","feedback":"<h3 id=\"gibberishflangerfeedbackproperty\">Gibberish.Flanger.feedback : property</h3>\n\n<p>Number. The amount of output that should be fed back into the delay line</p>","offset":"<h3 id=\"gibberishflangeroffsetproperty\">Gibberish.Flanger.offset : property</h3>\n\n<p>Number. The base offset of the delay line tap from the current time. Large values (> 500) lead to chorusing effects.</p>"},"type":" FX"},"Gibberish.Vibrato":{"text":"<h1 id=\"gibberishvibratofx\">Gibberish.Vibrato </h1>\n\n<p>Delay line vibrato effect.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>a = new Gibberish.Synth({ attack:44, decay:44100 }); <br />\nb = new Gibberish.Vibrato({input:a, rate:4, amount:125 }).connect(); <br />\na.note(440); <br />\na.rate = .5;\na.note(440);\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the synth on initialization.</p>\n\n<hr />","methods":{},"properties":{"input":"<h3 id=\"gibberishvibratoinputproperty\">Gibberish.Vibrato.input : property</h3>\n\n<p>Object. The ugen that should feed the vibrato.</p>","rate":"<h3 id=\"gibberishvibratorateproperty\">Gibberish.Vibrato.rate : property</h3>\n\n<p>Number. The speed at which the delay line tap position is modulated.</p>","amount":"<h3 id=\"gibberishvibratoamountproperty\">Gibberish.Vibrato.amount : property</h3>\n\n<p>Number. The size of the delay line modulation; effectively the amount of vibrato to produce, </p>","offset":"<h3 id=\"gibberishvibratooffsetproperty\">Gibberish.Vibrato.offset : property</h3>\n\n<p>Number. The base offset of the delay line tap from the current time.</p>"},"type":" FX"},"Gibberish.BufferShuffler":{"text":"<h1 id=\"gibberishbuffershufflerfx\">Gibberish.BufferShuffler </h1>\n\n<p>A buffer shuffling / stuttering effect with reversing and pitch-shifting</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>a = new Gibberish.Synth({ attack:88200, decay:88200 }); <br />\nb = new Gibberish.BufferShuffler({input:a, chance:.25, amount:125, rate:44100, pitchMin:-4, pitchMax:4 }).connect(); <br />\na.note(440);\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em> : Object. A dictionary of property keys and values to assign to the Gibberish.BufferShuffler object</p>\n\n<hr />","methods":{},"properties":{"chance":"<h3 id=\"gibberishbuffershufflerchanceproperty\">Gibberish.BufferShuffler.chance : property</h3>\n\n<p>Float. Range 0..1. Default .25. The likelihood that incoming audio will be shuffled.</p>","rate":"<h3 id=\"gibberishbuffershufflerrateproperty\">Gibberish.BufferShuffler.rate : property</h3>\n\n<p>Integer, in samples. Default 11025. How often Gibberish.BufferShuffler will randomly decide whether or not to shuffle.</p>","length":"<h3 id=\"gibberishbuffershufflerlengthproperty\">Gibberish.BufferShuffler.length : property</h3>\n\n<p>Integer, in samples. Default 22050. The length of time to play stuttered audio when stuttering occurs.</p>","reverseChance":"<h3 id=\"gibberishbuffershufflerreversechanceproperty\">Gibberish.BufferShuffler.reverseChance : property</h3>\n\n<p>Float. Range 0..1. Default .5. The likelihood that stuttered audio will be reversed</p>","pitchChance":"<h3 id=\"gibberishbuffershufflerpitchchanceproperty\">Gibberish.BufferShuffler.pitchChance : property</h3>\n\n<p>Float. Range 0..1. Default .5. The likelihood that stuttered audio will be repitched.</p>","pitchMin":"<h3 id=\"gibberishbuffershufflerpitchminproperty\">Gibberish.BufferShuffler.pitchMin : property</h3>\n\n<p>Float. Range 0..1. Default .25. The lowest playback speed used to repitch the audio</p>","pitchMax":"<h3 id=\"gibberishbuffershufflerpitchmaxproperty\">Gibberish.BufferShuffler.pitchMax : property</h3>\n\n<p>Float. Range 0..1. Default 2. The highest playback speed used to repitch the audio.</p>","wet":"<h3 id=\"gibberishbuffershufflerwetproperty\">Gibberish.BufferShuffler.wet : property</h3>\n\n<p>Float. Range 0..1. Default 1. When shuffling, the amplitude of the wet signal</p>","dry":"<h3 id=\"gibberishbuffershufflerdryproperty\">Gibberish.BufferShuffler.dry : property</h3>\n\n<p>Float. Range 0..1. Default 0. When shuffling, the amplitude of the dry signal</p>"},"type":" FX"},"Gibberish.Reverb":{"text":"<h1 id=\"gibberishreverbfx\">Gibberish.Reverb </h1>\n\n<p>based off audiolib.js reverb and freeverb</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>a = new Gibberish.Synth({ attack:88200, decay:88200 }); <br />\nb = new Gibberish.Reverb({input:a, roomSize:.5, wet:1, dry;.25}).connect();\na.note(440);\n</code>  </p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em> : Object. A dictionary of property keys and values to assign to the Gibberish.BufferShuffler object</p>","methods":{},"properties":{"roomSize":"<h3 id=\"gibberishreverbroomsizeproperty\">Gibberish.Reverb.roomSize : property</h3>\n\n<p>Float. 0..1. The size of the room being emulated.</p>","damping":"<h3 id=\"gibberishreverbdampingproperty\">Gibberish.Reverb.damping : property</h3>\n\n<p>Float. Attenuation of high frequencies that occurs.</p>","wet":"<h3 id=\"gibberishreverbwetproperty\">Gibberish.Reverb.wet : property</h3>\n\n<p>Float. Default = .75. The amount of processed signal that is output.  </p>","dry":"<h3 id=\"gibberishreverbdryproperty\">Gibberish.Reverb.dry : property</h3>\n\n<p>Float. Default = .5. The amount of dry signal that is output</p>"},"type":" FX"},"Gibberish.Granulator":{"text":"<h1 id=\"gibberishgranulatorfx\">Gibberish.Granulator </h1>\n\n<p>A granulator that operates on a buffer of samples. You can get the samples from a <a href=\"javascript:displayDocs('Gibberish.Sampler')\">Sampler</a>\nobject.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>a = new Gibberish.Sampler('resources/trumpet.wav'); <br />\n// wait until sample is loaded to create granulator <br />\na.onload = function() { <br />\n  b = new Gibberish.Granulator({ <br />\n    buffer:a.getBuffer(), <br />\n    grainSize:1000, <br />\n    speedMin: -2, <br />\n    speedMax: 2, <br />\n  }); <br />\n  b.mod('position', new Gibberish.Sine(.1, .45), '+'); <br />\n  b.connect(); <br />\n};</code></p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>propertiesList</em>: Object. At a minimum you should define the input to granulate. See the example.</p>","methods":{},"properties":{"speed":"<h3 id=\"gibberishgranulatorspeedproperty\">Gibberish.Granulator.speed : property</h3>\n\n<p>Float. The playback rate, in samples, of each grain</p>","speedMin":"<h3 id=\"gibberishgranulatorspeedminproperty\">Gibberish.Granulator.speedMin : property</h3>\n\n<p>Float. When set, the playback rate will vary on a per grain basis from (grain.speed + grain.speedMin) -> (grain.speed + grain.speedMax). This value should almost always be negative.</p>","speedMax":"<h3 id=\"gibberishgranulatorspeedmaxproperty\">Gibberish.Granulator.speedMax : property</h3>\n\n<p>Float. When set, the playback rate will vary on a per grain basis from (grain.speed + grain.speedMin) -> (grain.speed + grain.speedMax).</p>","grainSize":"<h3 id=\"gibberishgranulatorgrainsizeproperty\">Gibberish.Granulator.grainSize : property</h3>\n\n<p>Integer. The length, in samples, of each grain</p>","position":"<h3 id=\"gibberishgranulatorpositionproperty\">Gibberish.Granulator.position : property</h3>\n\n<p>Float. The center position of the grain cloud. 0 represents the start of the buffer, 1 represents the end.</p>","positionMin":"<h3 id=\"gibberishgranulatorpositionminproperty\">Gibberish.Granulator.positionMin : property</h3>\n\n<p>Float. The left boundary on the time axis of the grain cloud.</p>","positionMax":"<h3 id=\"gibberishgranulatorpositionmaxproperty\">Gibberish.Granulator.positionMax : property</h3>\n\n<p>Float. The right boundary on the time axis of the grain cloud.</p>","buffer":"<h3 id=\"gibberishgranulatorbufferproperty\">Gibberish.Granulator.buffer : property</h3>\n\n<p>Object. The input buffer to granulate.</p>","numberOfGrains":"<h3 id=\"gibberishgranulatornumberofgrainsproperty\">Gibberish.Granulator.numberOfGrains : property</h3>\n\n<p>Float. The number of grains in the cloud. Can currently only be set on initialization.</p>"},"type":" FX"},"Gibberish.Sine":{"text":"<h1 id=\"gibberishsineoscillator\">Gibberish.Sine </h1>\n\n<p>A sinewave calculated on a per-sample basis.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>// make a sine wave <br />\nGibberish.init(); <br />\na = new Gibberish.Sine().connect();</code></p>\n\n<hr />","methods":{"callback":"<h3 id=\"gibberishsinecallbackmethod\">Gibberish.Sine.callback : method</h3>\n\n<p>Returns a single sample of output.  </p>\n\n<p>param <strong>frequency</strong> Number. The frequency to be used to calculate output. <br />\nparam <strong>amp</strong> Number. The amplitude to be used to calculate output.  </p>"},"properties":{"frequency":"<h3 id=\"gibberishsinefrequencyproperty\">Gibberish.Sine.frequency : property</h3>\n\n<p>Number. From 20 - 20000 hz.</p>","amp":"<h3 id=\"gibberishsineampproperty\">Gibberish.Sine.amp : property</h3>\n\n<p>Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.</p>"},"type":" Oscillator"},"Gibberish.Sine2":{"text":"<h1 id=\"gibberishsine2oscillator\">Gibberish.Sine2 </h1>\n\n<p>A sinewave calculated on a per-sample basis that can be panned.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>// make a sine wave <br />\nGibberish.init(); <br />\na = new Gibberish.Sine2(880, .5, -.25).connect();</code></p>\n\n<hr />","methods":{"callback":"<h3 id=\"gibberishsine2callbackmethod\">Gibberish.Sine2.callback : method</h3>\n\n<p>Returns a stereo sample of output as an array.  </p>\n\n<p>param <strong>frequency</strong> Number. The frequency to be used to calculate output. <br />\nparam <strong>amp</strong> Number. The amplitude to be used to calculate output. <br />\nparam <strong>pan</strong> Number. The position in the stereo spectrum of the signal.</p>"},"properties":{"frequency":"<h3 id=\"gibberishsine2frequencyproperty\">Gibberish.Sine2.frequency : property</h3>\n\n<p>Number. From 20 - 20000 hz.</p>","amp":"<h3 id=\"gibberishsine2ampproperty\">Gibberish.Sine2.amp : property</h3>\n\n<p>Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.</p>","pan":"<h3 id=\"gibberishsine2panproperty\">Gibberish.Sine2.pan : property</h3>\n\n<p>Number. -1..1. The position of the sinewave in the stereo spectrum</p>"},"type":" Oscillator"},"Gibberish.Saw":{"text":"<h1 id=\"gibberishsawoscillator\">Gibberish.Saw </h1>\n\n<p>A stereo, non-bandlimited saw wave calculated on a per-sample basis.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>// make a saw wave <br />\nGibberish.init(); <br />\na = new Gibberish.Saw2(330, .4).connect();</code></p>\n\n<hr />","methods":{},"properties":{"frequency":"<h3 id=\"gibberishsawfrequencyproperty\">Gibberish.Saw.frequency : property</h3>\n\n<p>Number. From 20 - 20000 hz.</p>","amp":"<h3 id=\"gibberishsawampproperty\">Gibberish.Saw.amp : property</h3>\n\n<p>Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.</p>"},"type":" Oscillator"},"Gibberish.Triangle":{"text":"<h1 id=\"gibberishtriangleoscillator\">Gibberish.Triangle </h1>\n\n<p>A triangle calculated on a per-sample basis.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>// make a triangle wave <br />\nGibberish.init(); <br />\na = new Gibberish.Triangle({frequency:570, amp:.35}).connect();</code></p>\n\n<hr />","methods":{},"properties":{"frequency":"<h3 id=\"gibberishtrianglefrequencyproperty\">Gibberish.Triangle.frequency : property</h3>\n\n<p>Number. From 20 - 20000 hz.</p>","amp":"<h3 id=\"gibberishtriangleampproperty\">Gibberish.Triangle.amp : property</h3>\n\n<p>Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.</p>"},"type":" Oscillator"},"Gibberish.Triangle2":{"text":"<h1 id=\"gibberishtriangle2oscillator\">Gibberish.Triangle2 </h1>\n\n<p>A triangle calculated on a per-sample basis that can be panned.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>Gibberish.init(); <br />\na = new Gibberish.Triangle2(880, .5, -.25).connect();</code></p>\n\n<hr />","methods":{"callback":"<h3 id=\"gibberishtriangle2callbackmethod\">Gibberish.Triangle2.callback : method</h3>\n\n<p>Returns a stereo sample of output as an array.  </p>\n\n<p>param <strong>frequency</strong> Number. The frequency to be used to calculate output. <br />\nparam <strong>amp</strong> Number. The amplitude to be used to calculate output. <br />\nparam <strong>pan</strong> Number. The position in the stereo spectrum of the signal.</p>"},"properties":{"frequency":"<h3 id=\"gibberishtriangle2frequencyproperty\">Gibberish.Triangle2.frequency : property</h3>\n\n<p>Number. From 20 - 20000 hz.</p>","amp":"<h3 id=\"gibberishtriangle2ampproperty\">Gibberish.Triangle2.amp : property</h3>\n\n<p>Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.</p>","pan":"<h3 id=\"gibberishtriangle2panproperty\">Gibberish.Triangle2.pan : property</h3>\n\n<p>Number. -1..1. The position of the triangle wave in the stereo spectrum</p>"},"type":" Oscillator"},"Gibberish.Saw3":{"text":"<h1 id=\"gibberishsaw3oscillator\">Gibberish.Saw3 </h1>\n\n<p>A bandlimited saw wave created using FM feedback, see http://scp.web.elte.hu/papers/synthesis1.pdf.  </p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>// make a saw wave <br />\nGibberish.init(); <br />\na = new Gibberish.Saw3(330, .4).connect();</code></p>\n\n<hr />","methods":{"callback":"<h3 id=\"gibberishsaw3callbackmethod\">Gibberish.Saw3.callback : method</h3>\n\n<p>Returns a single sample of output.  </p>\n\n<p>param <strong>frequency</strong> Number. The frequency to be used to calculate output. <br />\nparam <strong>amp</strong> Number. The amplitude to be used to calculate output.  </p>"},"properties":{"frequency":"<h3 id=\"gibberishsaw3frequencyproperty\">Gibberish.Saw3.frequency : property</h3>\n\n<p>Number. From 20 - 20000 hz.</p>","amp":"<h3 id=\"gibberishsaw3ampproperty\">Gibberish.Saw3.amp : property</h3>\n\n<p>Number. A linear value specifying relative ampltiude, ostensibly from 0..1 but can be higher, or lower when used for modulation.</p>"},"type":" Oscillator"},"Gibberish.PWM":{"text":"<h1 id=\"gibberishpwmoscillator\">Gibberish.PWM </h1>\n\n<p>A bandlimited pulsewidth modulation wave created using FM feedback, see http://scp.web.elte.hu/papers/synthesis1.pdf.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>// make a pwm wave <br />\nGibberish.init(); <br />\na = new Gibberish.PWM(330, .4, .9).connect();</code></p>\n\n<hr />","methods":{"callback":"<h3 id=\"gibberishpwmcallbackmethod\">Gibberish.PWM.callback : method</h3>\n\n<p>Returns a single sample of output.  </p>\n\n<p>param <strong>frequency</strong> Number. The frequency to be used to calculate output. <br />\nparam <strong>amp</strong> Number. The amplitude to be used to calculate output. <br />\nparam <strong>pulsewidth</strong> Number. The duty cycle of the waveform</p>"},"properties":{"frequency":"<h3 id=\"gibberishpwmfrequencyproperty\">Gibberish.PWM.frequency : property</h3>\n\n<p>Number. From 20 - 20000 hz.</p>","amp":"<h3 id=\"gibberishpwmampproperty\">Gibberish.PWM.amp : property</h3>\n\n<p>Number. A linear value specifying relative ampltiude, ostensibly from 0..1 but can be higher, or lower when used for modulation.</p>","pulsewidth":"<h3 id=\"gibberishpwmpulsewidthproperty\">Gibberish.PWM.pulsewidth : property</h3>\n\n<p>Number. 0..1. The width of the waveform's duty cycle.</p>"},"type":" Oscillator"},"Gibberish.Noise":{"text":"<h1 id=\"gibberishnoiseoscillator\">Gibberish.Noise </h1>\n\n<p>A white noise oscillator</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>// make some noise\nGibberish.init(); <br />\na = new Gibberish.Noise(.4).connect();</code></p>\n\n<hr />","methods":{},"properties":{"amp":"<h3 id=\"gibberishnoiseampproperty\">Gibberish.Noise.amp : property</h3>\n\n<p>Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.</p>"},"type":" Oscillator"},"Gibberish.KarplusStrong":{"text":"<h1 id=\"gibberishkarplusstrongphysicalmodel\">Gibberish.KarplusStrong </h1>\n\n<p>A plucked-string model.  </p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>Gibberish.init(); <br />\na = new Gibberish.KarplusStrong({ damping:.6 }).connect(); <br />\na.note(440);\n</code></p>\n\n<hr />","methods":{},"properties":{"blend":"<h3 id=\"gibberishkarplusstrongblendproperty\">Gibberish.KarplusStrong.blend : property</h3>\n\n<p>Number. 0..1. The likelihood that the sign of any given sample will be flipped. A value of 1 means there is no chance, a value of 0 means each samples sign will be flipped. This introduces noise into the model which can be used for various effects.</p>","damping":"<h3 id=\"gibberishkarplusstrongdampingproperty\">Gibberish.KarplusStrong.damping : property</h3>\n\n<p>Number. 0..1. Higher amounts of damping shorten the decay of the sound generated by each note.</p>","amp":"<h3 id=\"gibberishkarplusstrongampproperty\">Gibberish.KarplusStrong.amp : property</h3>\n\n<p>Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.</p>","channels":"<h3 id=\"gibberishkarplusstrongchannelsproperty\">Gibberish.KarplusStrong.channels : property</h3>\n\n<p>Number. Default 2. If two channels, the signal may be panned.</p>","pan":"<h3 id=\"gibberishkarplusstrongpanproperty\">Gibberish.KarplusStrong.pan : property</h3>\n\n<p>Number. Default 0. The position in the stereo spectrum for the sound, from -1..1.</p>"},"type":" Physical Model"},"Gibberish.Sampler":{"text":"<h1 id=\"gibberishsampleroscillator\">Gibberish.Sampler </h1>\n\n<p>Sample recording and playback.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>Gibberish.init(); <br />\na = new Gibberish.Sampler({ file:'resources/snare.wav' }).connect(); <br />\na.note(2); <br />\na.note(1); <br />\na.note(-.5); <br />\nb = new Gibberish.Sampler().connect(); <br />\nb.record(a, 88200); // record two seconds of a playing <br />\na.note(8); <br />\n// wait a bit <br />\nb.note(1);</code>\n`</p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<h3 id=\"syntax1\">syntax 1</h3>\n\n<p><strong>param</strong> <em>filepath</em>: String. A path to the audiofile to be opened by the sampler.  </p>\n\n<h3 id=\"syntax2\">syntax 2</h3>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the sampler on initialization.</p>\n\n<hr />","methods":{"_onload":"<h3 id=\"gibberishsampler_onloadmethod\">Gibberish.Sampler._onload : method</h3>\n\n<p>This is an event handler that is called when a sampler has finished loading an audio file  </p>\n\n<p>param <strong>buffer</strong> Object. The decoded sampler buffers from the audio file</p>","note":"<h3 id=\"gibberishsamplernotemethod\">Gibberish.Sampler.note : method</h3>\n\n<p>Trigger playback of the samplers buffer</p>\n\n<p>param <strong>pitch</strong> Number. The speed the sample is played back at. <br />\nparam <strong>amp</strong> Number. Optional. The volume to use.</p>","record":"<h3 id=\"gibberishsamplerrecordmethod\">Gibberish.Sampler.record : method</h3>\n\n<p>Record the output of a Gibberish ugen for a given amount of time</p>\n\n<p>param <strong>ugen</strong> Object. The Gibberish ugen to be recorded.\nparam <strong>recordLength</strong> Number (in samples). How long to record for.</p>","getBuffer":"<h3 id=\"gibberishsamplergetbuffermethod\">Gibberish.Sampler.getBuffer : method</h3>\n\n<p>Returns a pointer to the Sampler's internal buffer.  </p>","callback":"<h3 id=\"gibberishsamplercallbackmethod\">Gibberish.Sampler.callback : method</h3>\n\n<p>Return a single sample. It's a pretty lengthy method signature, they are all properties that have already been listed:  </p>\n\n<p>_pitch, amp, isRecording, isPlaying, input, length, start, end, loops, pan</p>"},"properties":{"pitch":"<h3 id=\"gibberishsamplerpitchproperty\">Gibberish.Sampler.pitch : property</h3>\n\n<p>Number. The speed that the sample is played back at. A pitch of 1 means the sample plays forward at speed it was recorded at, a pitch of -4 means the sample plays backwards at 4 times the speed it was recorded at.</p>","amp":"<h3 id=\"gibberishsamplerampproperty\">Gibberish.Sampler.amp : property</h3>\n\n<p>Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.</p>","isRecording":"<h3 id=\"gibberishsamplerisrecordingproperty\">Gibberish.Sampler.isRecording : property</h3>\n\n<p>Boolean. Tells the sample to record into it's buffer. This is handled automatically by the object; there is no need to manually set this property.</p>","isPlaying":"<h3 id=\"gibberishsamplerisplayingproperty\">Gibberish.Sampler.isPlaying : property</h3>\n\n<p>Number. 0..1. Tells the sample to record into it's buffer. This is handled automatically by the object; there is no need to manually set this property.</p>","input":"<h3 id=\"gibberishsamplerinputproperty\">Gibberish.Sampler.input : property</h3>\n\n<p>Object. The object the sampler is tapping into and recording.</p>","length":"<h3 id=\"gibberishsamplerlengthproperty\">Gibberish.Sampler.length : property</h3>\n\n<p>Number. The length of the Sampler's buffer.</p>","start":"<h3 id=\"gibberishsamplerstartproperty\">Gibberish.Sampler.start : property</h3>\n\n<p>Number. When the Sampler's note method is called, sample playback begins at this sample.</p>","end":"<h3 id=\"gibberishsamplerendproperty\">Gibberish.Sampler.end : property</h3>\n\n<p>Number. When the Sampler's note method is called, sample playback ends at this sample.</p>","loops":"<h3 id=\"gibberishsamplerloopsproperty\">Gibberish.Sampler.loops : property</h3>\n\n<p>Boolean. When true, sample playback loops continuously between the start and end property values.</p>","pan":"<h3 id=\"gibberishsamplerpanproperty\">Gibberish.Sampler.pan : property</h3>\n\n<p>Number. -1..1. Position of the Sampler in the stereo spectrum.</p>"},"type":" Oscillator"},"Gibberish":{"text":"<h1 id=\"gibberishmiscellaneous\">Gibberish </h1>\n\n<p>Gibberish is the main object used to manage the audio graph and perform codegen functions. All constructors are also inside of the Gibberish object. Gibberish can automatically generate an appropriate web audio callback for you; if you want to use this you must execute the Gibberish.init() command before creating any Gibberish ugens.</p>\n\n<h2 id=\"exampleusage\">Example Usage</h2>\n\n<p><code>// make a sine wave <br />\nGibberish.init(); <br />\na = new Gibberish.Sine().connect();</code></p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>bufferSize</em>: Integer. Default 1024. The size of the buffer to be calculated. Since JavaScript is single-threaded, setting exceedingly large values for this will yield to stuttering in graphics and user interface performance.</p>\n\n<hr />","methods":{"createCallback":"<h3 id=\"gibberishcreatecallbackmethod\">Gibberish.createCallback : method</h3>\n\n<p>Perform codegen on all dirty ugens and re-create the audio callback. This method is called automatically in the default Gibberish sample loop whenever Gibberish.isDirty is true.</p>","audioProcess":"<h3 id=\"gibberishaudioprocessmethod\">Gibberish.audioProcess : method</h3>\n\n<p>The default audio callback used in Webkit browsers. This callback starts running as soon as Gibberish.init() is called.  </p>\n\n<p>param <strong>Audio Event</strong> : Object. The HTML5 audio event object.</p>","audioProcessFirefox":"<h3 id=\"gibberishaudioprocessfirefoxmethod\">Gibberish.audioProcessFirefox : method</h3>\n\n<p>The default audio callback used in Firefox. This callback starts running as soon as Gibberish.init() is called.  </p>\n\n<p>param <strong>Sound Data</strong> : Object. The buffer of audio data to be filled</p>","clear":"<h3 id=\"gibberishclearmethod\">Gibberish.clear : method</h3>\n\n<p>Remove all objects from Gibberish graph and perform codegen... kills all running sound and CPU usage.</p>","dirty":"<h3 id=\"gibberishdirtymethod\">Gibberish.dirty : method</h3>\n\n<p>Tell Gibberish a ugen needs to be codegen'd and mark the entire callback as needing regeneration  </p>\n\n<p>param <strong>Ugen</strong> : Object. The ugen that is 'dirtied'... that has a property value changed.</p>","generateSymbol":"<h3 id=\"gibberishgeneratesymbolmethod\">Gibberish.generateSymbol : method</h3>\n\n<p>Generate a unique symbol for a given ugen using its name and a unique id number.  </p>\n\n<p>param <strong>name</strong> : String. The name of the ugen; for example, reverb, delay etc.</p>","AudioDataDestination":"<h3 id=\"gibberishaudiodatadestinationmethod\">Gibberish.AudioDataDestination : method</h3>\n\n<p>Create a callback and start it running. Note that in iOS audio callbacks can only be created in response to user events. Thus, in iOS this method assigns an event handler to the HTML body that creates the callback as soon as the body is touched; at that point the event handler is removed. </p>","makePanner":"<h3 id=\"gibberishmakepannermethod\">Gibberish.makePanner : method</h3>\n\n<p>Create and return an object that can be used to pan a stereo source.</p>","polyInit":"<h3 id=\"gibberishpolyinitmethod\">Gibberish.polyInit : method</h3>\n\n<p>For ugens with polyphony, add metaprogramming that passes on property changes to the 'children' of the polyphonic object. Polyphonic ugens in Gibberish are just single instances that are routed into a shared bus, along with a few special methods for voice allocation etc.  </p>\n\n<p>param <strong>Ugen</strong> : Object. The polyphonic ugen</p>","interpolate":"<h3 id=\"gibberishinterpolatemethod\">Gibberish.interpolate : method</h3>\n\n<p>Similiar to makePanner, this method returns a function that can be used to linearly interpolate between to values. The resulting function takes an array and a floating point position index and returns a value.</p>","ugen":"<h3 id=\"gibberishugenmethod\">Gibberish.ugen : method</h3>\n\n<p>Creates a prototype object that is used by all ugens.</p>"},"properties":{"audioFiles":"<h3 id=\"gibberishaudiofilesproperty\">Gibberish.audioFiles : property</h3>\n\n<p>Array. Anytime an audiofile is loaded (normally using the Sampler ugen) the resulting sample buffer is stored in this array so that it can be immediately recalled.</p>","callback":"<h3 id=\"gibberishcallbackproperty\">Gibberish.callback : property</h3>\n\n<p>String. Whenever Gibberish performs code generation the resulting callback is stored here.</p>","out":"<h3 id=\"gibberishoutproperty\">Gibberish.out : property</h3>\n\n<p>Object. The is the 'master' bus that everything eventually gets routed to if you're using the auto-generated calback. This bus is initialized in the call to Gibberish.init.</p>","dirtied":"<h3 id=\"gibberishdirtiedproperty\">Gibberish.dirtied : property</h3>\n\n<p>Array. A list of objects that need to be codegen'd</p>","isDirty":"<h3 id=\"gibberishisdirtyproperty\">Gibberish.isDirty : property</h3>\n\n<p>Booelan. Whether or codegen should be performed.</p>","codeblock":"<h3 id=\"gibberishcodeblockproperty\">Gibberish.codeblock : property</h3>\n\n<p>Array. During codegen, each ugen's codeblock is inserted into this array. Once all the ugens have codegen'd, the array is concatenated to form the callback.</p>","upvalues":"<h3 id=\"gibberishupvaluesproperty\">Gibberish.upvalues : property</h3>\n\n<p>Array. Each ugen's callback function is stored in this array; the contents of the array become upvalues to the master callback function when it is codegen'd.</p>","debug":"<h3 id=\"gibberishdebugproperty\">Gibberish.debug : property</h3>\n\n<p>Boolean. Default false. When true, the callbackString is printed to the console whenever a codegen is performed</p>","memo":"<h3 id=\"gibberishmemoproperty\">Gibberish.memo : property</h3>\n\n<p>Object. Used in the codegen process to make sure codegen for each ugen is only performed once.</p>"},"type":" Miscellaneous"},"Ugen":{"text":"<h1 id=\"ugenmiscellaneous\">Ugen </h1>\n\n<p>The prototype object that all ugens inherit from</p>","methods":{"processProperties":"<h3 id=\"ugenprocesspropertiesmethod\">Ugen.processProperties : method</h3>\n\n<p>Used to assign and process arguments passed to the constructor functions of ugens.  </p>\n\n<p>param <strong>argumentList</strong> : Array. A list of arguments (may be a single dictionary) passed to a ugen constructor.</p>","codegen":"<h3 id=\"ugencodegenmethod\">Ugen.codegen : method</h3>\n\n<p>Generates output code (as a string) used inside audio callback</p>","getCodeblock":"<h3 id=\"ugengetcodeblockmethod\">Ugen.getCodeblock : method</h3>\n\n<p>Retrieves codeblock for ugen previously created with codegen method.</p>","defineUgenProperty":"<h3 id=\"ugendefineugenpropertymethod\">Ugen.defineUgenProperty : method</h3>\n\n<p>Creates getters and setters for ugen properties that automatically dirty the ugen whenever the property value is changed.  </p>\n\n<p>param <strong>key</strong> : String. The name of a property to add getter / setters for. <br />\nparam <strong>value</strong> : Any. The initival value to set the property to</p>","init":"<h3 id=\"ugeninitmethod\">Ugen.init : method</h3>\n\n<p>Initialize ugen by calling defineUgenProperty for every key in the ugen's properties dictionary, generating a unique id for the ugen and various other small tasks.</p>","mod":"<h3 id=\"ugenmodmethod\">Ugen.mod : method</h3>\n\n<p>Modulate a property of a ugen on a per-sample basis.  </p>\n\n<p>param <strong>key</strong> : String. The name of the property to modulate <br />\nparam <strong>value</strong> : Any. The object or number value to modulate the property with <br />\nparam <strong>op</strong> : String. Default \"+\". The operation to perform. Can be +,-,*,/,= or ++. ++ adds and returns the absolute value.</p>","removeMod":"<h3 id=\"ugenremovemodmethod\">Ugen.removeMod : method</h3>\n\n<p>Remove a modulation from a ugen.  </p>\n\n<p>param <strong>key</strong> : String. The name of the property to remove the modulation from <br />\nparam <strong>arg</strong> : Number or Object. Optional. This determines which modulation to remove if more than one are assigned to the property. If this argument is undefined, all modulations are removed. If the argument is a number, the number represents a modulation in the order that they were applied (an array index). If the argument is an object, it removes a modulation that\nis using a matching object as the modulator.</p>","polyMod":"<h3 id=\"ugenpolymodmethod\">Ugen.polyMod : method</h3>\n\n<p>Applies a modulation to all children of a polyphonic ugen  </p>\n\n<p>param <strong>key</strong> : String. The name of the property to modulate <br />\nparam <strong>value</strong> : Any. The object or number value to modulate the property with <br />\nparam <strong>op</strong> : String. Default \"+\". The operation to perform. Can be +,-,*,/,= or ++. ++ adds and returns the absolute value.</p>","removePolyMod":"<h3 id=\"ugenremovepolymodmethod\">Ugen.removePolyMod : method</h3>\n\n<p>Removes a modulation from all children of a polyphonic ugen. The arguments  </p>\n\n<p>param <strong>arg</strong> : Number or Object. Optional. This determines which modulation to remove if more than one are assigned to the property. If this argument is undefined, all modulations are removed. If the argument is a number, the number represents a modulation in the order that they were applied (an array index). If the argument is an object, it removes a modulation that\nis using a matching object as the modulator.</p>","connect":"<h3 id=\"ugenconnectmethod\">Ugen.connect : method</h3>\n\n<p>Connect the output of a ugen to a bus.  </p>\n\n<p>param <strong>bus</strong> : Bus ugen. Optional. The bus to connect the ugen to. If no argument is passed the ugen is connect to Gibberish.out. Gibberish.out is automatically created when Gibberish.init() is called and can be thought of as the master stereo output for Gibberish.</p>","send":"<h3 id=\"ugensendmethod\">Ugen.send : method</h3>\n\n<p>Send an arbitrary amount of output to a bus  </p>\n\n<p>param <strong>bus</strong> : Bus ugen. The bus to send the ugen to. <br />\nparam <strong>amount</strong> : Float. The amount of signal to send to the bus. </p>","disconnect":"<h3 id=\"ugendisconnectmethod\">Ugen.disconnect : method</h3>\n\n<p>Disconnect a ugen from a bus (or all busses). This stops all audio and signal processing for the ugen.  </p>\n\n<p>param <strong>bus</strong> : Bus ugen. Optional. The bus to send the ugen to. If this argument is undefined the ugen will be disconnected from all busses.</p>"},"properties":{},"type":" Miscellaneous"},"Gibberish.Bus":{"text":"<h1 id=\"gibberishbusmiscellaneous\">Gibberish.Bus </h1>\n\n<p>Create a mono routing bus. A bus callback routes all it's inputs and scales them by the amplitude of the bus.  </p>\n\n<p>For a stereo routing bus, see <a href=\"javascript:displayDocs('Gibberish.Bus2')\">Bus2</a></p>\n\n<h2 id=\"exampleusage\">Example Usage##</h2>\n\n<p><code>a = new Gibberish.Bus(); <br />\nb = new Gibberish.Sine(440).connect(a); <br />\nc = new Gibberish.Sine(880).connect(a); <br />\na.amp = .1; <br />\na.connect();</code></p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the bus on initialization.</p>","methods":{},"properties":{"amp":"<h3 id=\"gibberishbusampproperty\">Gibberish.Bus.amp : property</h3>\n\n<p>Array. Read-only. Relative volume for the sum of all ugens connected to the bus.</p>"},"type":" Miscellaneous"},"Gibberish.Bus2":{"text":"<h1 id=\"gibberishbus2miscellaneous\">Gibberish.Bus2 </h1>\n\n<p>Create a stereo outing bus. A bus callback routes all it's inputs and scales them by the amplitude of the bus.</p>\n\n<h2 id=\"exampleusage\">Example Usage##</h2>\n\n<p><code>a = new Gibberish.Bus(); <br />\nb = new Gibberish.Sine(440).connect(a); <br />\nc = new Gibberish.Sine(880).connect(a); <br />\na.amp = .1; <br />\na.connect();</code></p>\n\n<h2 id=\"constructor\">Constructor</h2>\n\n<p><strong>param</strong> <em>properties</em>: Object. A dictionary of property values (see below) to set for the bus on initialization.</p>","methods":{},"properties":{},"type":" Miscellaneous"}}
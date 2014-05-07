
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
	
var rnd = Math.random;
Gibberish.rndf = function(min, max, number, canRepeat) {
  canRepeat = typeof canRepeat === "undefined" ? true : canRepeat;
	if(typeof number === "undefined" && typeof min != "object") {
		if(arguments.length == 1) {
			max = arguments[0]; min = 0;
		}else if(arguments.length == 2) {
			min = arguments[0];
			max = arguments[1];
		}else{
			min = 0;
			max = 1;
		}

		var diff = max - min,
		    r = Math.random(),
		    rr = diff * r
	
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
				num = arguments[0][rndi(0, arguments[0].length - 1)];
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
  var _min, _max, quantity, random = Math.random, canRepeat;
    
  if(arguments.length === 0) {
    _min = 0; _max = 1;
  }else if(arguments.length === 1) {
    _max = arguments[0]; _min = 0;
  }else if(arguments.length === 2) {
    _min = arguments[0]; _max = arguments[1];
  }else if(arguments.length === 3) {
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2];
  }else{
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2]; canRepeat = arguments[3];
  }    
  
  return function() {
    var value, min, max, range;
    
    min = typeof _min === 'function' ? _min() : _min
    max = typeof _max === 'function' ? _max() : _max
      
    if( typeof quantity === 'undefined') {
      value = Gibberish.rndf( min, max )
    }else{
      value = Gibberish.rndf( min, max, quantity, canRepeat )
    }
    
    return value;
  }
};

Gibberish.rndi = function( min, max, number, canRepeat ) {
  var range;
    
  if(arguments.length === 0) {
    min = 0; max = 1;
  }else if(arguments.length === 1) {
    max = arguments[0]; min = 0;
  }else if( arguments.length === 2 ){
    min = arguments[0]; max = arguments[1];
  }else{
    min = arguments[0]; max = arguments[1]; number = arguments[2]; canRepeat = arguments[3];
  }    
  
  range = max - min
  if( range < number ) canRepeat = true
  
  if( typeof number === 'undefined' ) {
    range = max - min
    return Math.round( min + Math.random() * range );
  }else{
		var output = [];
		var tmp = [];
		
		for(var i = 0; i < number; i++) {
			var num;
			if(canRepeat) {
				num = Gibberish.rndi(min, max);
			}else{
				num = Gibberish.rndi(min, max);
				while(tmp.indexOf(num) > -1) {
					num = Gibberish.rndi(min, max);
				}
				tmp.push(num);
			}
			output.push(num);
		}
		return output;
  }
};

Gibberish.Rndi = function() {
  var _min, _max, quantity, random = Math.random, round = Math.round, canRepeat, range;
    
  if(arguments.length === 0) {
    _min = 0; _max = 1;
  }else if(arguments.length === 1) {
    _max = arguments[0]; _min = 0;
  }else if(arguments.length === 2) {
    _min = arguments[0]; _max = arguments[1];
  }else if(arguments.length === 3) {
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2];
  }else{
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2]; canRepeat = arguments[3];
  }  
  
  range = _max - _min
  if( typeof quantity === 'number' && range < quantity ) canRepeat = true
  
  return function() {
    var value, min, max, range;
    
    min = typeof _min === 'function' ? _min() : _min
    max = typeof _max === 'function' ? _max() : _max
    
    if( typeof quantity === 'undefined') {
      value = Gibberish.rndi( min, max )
    }else{
      value = Gibberish.rndi( min, max, quantity, canRepeat )
    }
    
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

Gibberish.future = function(func, time) { 
  var seq = new Gibberish.Sequencer({
    values:[
      function(){},
      function() {
        func();
        seq.stop();
        seq.disconnect();
      }
    ],
    durations:[ time ]
  }).start()
  
  seq.cancel = function() {
    seq.stop();
    seq.disconnect();
  }
  
  return seq
}
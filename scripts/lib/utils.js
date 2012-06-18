define([], function() {
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
	
	Array.prototype.remove = function(arg) {
		if(typeof arg === "undefined") { // clear all
			for(var i = 0; i < this.length; i++) {
				delete this[i];
			}
			this.length = 0;
		}else if(typeof arg === "number") {
			this.splice(arg,1);
		}else if(typeof arg === "string"){ // find named member and remove
			for(var i = 0; i < this.length; i++) {
				var member = this[i];
				if(member.name == arg) {
					this.splice(i, 1);
				}
			}
		}else if(typeof arg === "object") {
			var idx = jQuery.inArray( arg, this);
			if(idx > -1) {
				this.splice(idx,1);
			}
		}
	};
	
	Array.prototype.get = function(arg) {
		if(typeof arg === "number") {
			return this[arg];
		}else if(typeof arg === "string"){ // find named member and remove
			for(var i = 0; i < this.length; i++) {
				var member = this[i];
				if(member.name == arg) {
					return this[i]
				}
			}
		}else if(typeof arg === "object") {
			var idx = jQuery.inArray( arg, this);
			if(idx > -1) {
				return this[idx];
			}
		}
	};
	

	Array.prototype.replace = function(oldObj, newObj) {
		if(typeof oldObj != "number") {
			var idx = jQuery.inArray( oldObj, this);
			if(idx > -1) {
				this.splice(idx, 1, newObj);
			}
		}else{
			this.splice(oldObj, 1, newObj);
		}
	};

	Array.prototype.insert = function(v, pos) {
		this.splice(pos,0,v);
	};

	Array.prototype.add = function() {
		for(var i = 0; i < arguments.length; i++) {
			this.push(arguments[i]);
		}
	};

	Array.prototype.remove = function(arg) {
		if(typeof arg === "undefined") { // clear all
			for(var i = 0; i < this.length; i++) {
				delete this[i];
			}
			this.length = 0;
		}else if(typeof arg === "number") {
			this.splice(arg,1);
		}else if(typeof arg === "string"){ // find named member and remove
			for(var i = 0; i < this.length; i++) {
				var member = this[i];
				if(member.name == arg) {
					this.splice(i, 1);
				}
			}
		}else if(typeof arg === "object") {
			var idx = this.indexOf( arg );
			if(idx > -1) {
				this.splice(idx,1);
			}
		}
	};

	Array.prototype.replace = function(oldObj, newObj) {
		if(typeof oldObj != "number") {
			var idx = this.indexOf( oldObj );
			if(idx > -1) {
				this.splice(idx, 1, newObj);
			}
		}else{
			this.splice(oldObj, 1, newObj);
		}
	};

	Array.prototype.insert = function(v, pos) {
		this.splice(pos,0,v);
	};
});

define([], function() {
	String.prototype.format = function(i, safe, arg) {

	  function format() {
	    var str = this, len = arguments.length+1;

	    for (i=0; i < len; arg = arguments[i++]) {
	      safe = arg; //typeof arg === 'object' ? JSON.stringify(arg) : arg;
	      str = str.replace(RegExp('\\{'+(i-1)+'\\}', 'g'), safe);
	    } 	
	    return str;
	  }

	  format.native = String.prototype.format;

	  return format;
	}();
});
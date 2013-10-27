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

Gibberish.Proxy2 = function() {
  var input = arguments[0],
      name = arguments[1],
      phase = 0
      
	Gibberish.extend( this, {
  	name: 'proxy2',
    type: 'effect',
    
    properties : { },
    
    callback : function() {
      var v = input[ name ]
      // if( phase++ % 44100 === 0 ) console.log( v, input, name)
      return Array.isArray( v ) ? ( v[0] + v[1] + v[2] ) / 3 : v
    },
  }).init();
  
  this.getInput = function() { return input }
  this.setInput = function( v ) { input = v }
  this.getName = function() { return name }
  this.setName = function( v ) { name = v }
};
Gibberish.Proxy2.prototype = new Gibberish.ugen();

Gibberish.Proxy3 = function() {
  var input = arguments[0],
      name = arguments[1],
      phase = 0
      
	Gibberish.extend( this, {
  	name: 'proxy3',
    type: 'effect',
    
    properties : { },
    
    callback : function() {
      var v = input[ name ]
      //if( phase++ % 44100 === 0 ) console.log( v, input, name)
      return v || 0
    },
  })
  
  this.init();
  
  this.codegen = function() {
    // if(Gibberish.memo[this.symbol]) {
    //   return Gibberish.memo[this.symbol];
    // }
    
    console.log(" CALLED ")
    if( ! this.variable ) this.variable = Gibberish.generateSymbol('v');
    Gibberish.callbackArgs.push( this.symbol )
    Gibberish.callbackObjects.push( this.callback )

    this.codeblock = "var " + this.variable + " = " + this.symbol + "(" + input.properties[ name ].codegen() + ");\n"
  }
  
};
Gibberish.Proxy3.prototype = new Gibberish.ugen();
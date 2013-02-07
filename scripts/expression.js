Gibberish.Expressions = {
  export: function() {
    Gibberish.export("Expressions", window);
  },
  
  operator : function () {
    var me = new Gibberish.ugen(),
        op = arguments[0],
        args = Array.prototype.slice.call(arguments, 1);
    
    me.name = 'op';
    me.properties = {};
    for(var i = 0; i < args.length; i++) { me.properties[i] = args[i]; }
    me.init();
    
    me.codegen = function() {
      var keys, out = "( ";
      
      if(typeof Gibberish.memo[this.symbol] !== 'undefined') { return Gibberish.memo[this.symbol]; }
      
      keys = Object.keys(this.properties);
    
      for(var i = 0; i < keys.length; i++) {  
        var isObject = typeof this[i] === 'object';
        
        var shouldPush = false;
        if(isObject) {
          if(!Gibberish.memo[ this[i].symbol ]) {
            shouldPush = true;
            out += this[i].codegen();
          }else{
            out += Gibberish.memo[ this[i].symbol ];
          }
        }else{
          out += this[i];
        }
        
        if(i < keys.length - 1) { out += " " + op + " "; }
        
        if( isObject && shouldPush ) Gibberish.codeblock.push(this[i].codeblock); 
      }
      
      out += " )";
      
      Gibberish.memo[this.symbol] = out;      
      return out;
    };
    
    me.getCodeblock = function() {}; // override

    return me;
  },
  
  add : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('+');
    
    return Gibberish.Expressions.operator.apply(null, args);
  },

  sub : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('-');
    
    return Gibberish.Expressions.operator.apply(null, args);
  },

  mul : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('*');
    
    return Gibberish.Expressions.operator.apply(null, args);
  },

  div : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('/');
    
    return Gibberish.Expressions.operator.apply(null, args);
  },
  
  mod : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('%');
    
    return Gibberish.Expressions.operator.apply(null, args);

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
  },
  
  merge : function() {
    var args = Array.prototype.slice.call(arguments, 0),
        phase = 0;
  
    var me = {
      name : 'merge',
      properties : {},
      callback : function(a) {
        return a[0] + a[1];
      },
    };
    me.__proto__ = new Gibberish.ugen();
  
    for(var i = 0; i < args.length; i++) {
      me.properties[i] = args[i];
    }
    me.init();

    return me;
  },
};
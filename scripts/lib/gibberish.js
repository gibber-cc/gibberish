define(["oscillators"], function(oscillators) {
    return {
        init : function() { 
			oscillators.init(this);
			
			this.generators["+"] = this.binop_generator;
			this.generators["*"] = this.binop_generator;
			this.generators["-"] = this.binop_generator;
			this.generators["/"] = this.binop_generator;
			this.generators["="] = this.binop_generator;		
		},
		
		generateCallback : function(ugens, debug) {	
			masterUpvalues = [];
			masterCodeblock = [];
			
			var start = "function() {\n";
			var init = "";
			var upvalues = "";
			var variables = "";
			var codeblock = "function cb() {\nvar output = 0;\n";
	
			for(var i = 0; i < ugens.length; i++) {
				var ugen = ugens[i];
				var p = (typeof ugen.fcn === "function") ? ugen.fcn.getPhase() : 0;	
				// loop through all init functions and execute, but only map first one to ugen
				for(var j = 0; j < ugen.initialization.length; j++) {
					var init = ugen.initialization[j];
					if(debug) console.log(init);
					eval("var fcn = " + init + ";");
					if(j == 0) {
						ugen.fcn = fcn;
						ugen.fcn.setPhase(p);
					}
				}
		
				//console.log(ugen.upvalues);
				masterUpvalues.push( ugen.upvalues + ";\n" );
				masterCodeblock.push(ugen.codeblock);
		
				ugen.blockNumber 		  = masterCodeblock.length - 1;
				ugen.upvaluesBlockNumber  = masterUpvalues.length - 1;
			}
	
			codeblock += masterCodeblock.join("\n");
			codeblock += "return output;\n}\n";
			var end = "return cb;\n}";
			var cbgen = start + masterUpvalues.join("\n") + codeblock + end;
	
			if(debug) console.log(cbgen);
			return eval("(" + cbgen + ")()");
		},
		
		defineProperties : function(obj, props) {
			for(var i = 0; i < props.length; i++) {
				var prop = props[i];
				(function(_obj) {
					var that = _obj;
					var propName = prop;
					var value = that[prop];
	
				    Object.defineProperty(that, propName, {
						get: function() { return value; },
						set: function(_value) {
							value = _value;
							// if(typeof value === "number"){
							// 	value = _value;
							// }else{
							// 	value.operands[0] = _value;
							// }
							// ugenGenerateCodeblock(that);
						},
					});
				})(obj);
			}
		},
		
		codegen : function(op, codeDictionary) {
			if(typeof op === "object") {
				//var memo = codeDictionary.memo[JSON.stringify(op)];
				//if(memo) return memo;
				
				var gen = this.generators[op.type];
		
				var name = this.generateSymbol("v");
				//codeDictionary.memo[JSON.stringify(op)] = name;
		
				var statement = "var {0} = {1}".format(name, gen(op, codeDictionary));
				codeDictionary.codeblock.push(statement);
		
				return name;
			}else{
				return op;
			}
		},

		generate : function(ugen) {
			var codeDictionary = {
				memo			: {},
				initialization 	: [],	// will be executed globally accessible by callback
				upvalues		: [],	// pointers to globals that will be included in callback closure
				codeblock 		: [],	// will go directly into callback
			};
	
			var outputCode = this.codegen(ugen, codeDictionary);
			codeDictionary.codeblock.push( "output += {0};\n".format(outputCode) );

			ugen.initialization	= codeDictionary.initialization;
			ugen.upvalues		= codeDictionary.upvalues.join(";\n");
			ugen.codeblock		= codeDictionary.codeblock.join(";\n");
		},
		
		binop_generator : function(op, codeDictionary) {
			return "({0} {1} {2})".format(	Gibberish.codegen(op.operands[0], codeDictionary), 
											Gibberish.codegen(op.type, 	codeDictionary),
											Gibberish.codegen(op.operands[1],	codeDictionary));
		},

		createGenerator : function(type, parameters, formula) {
			var generator = function(op, codeDictionary) {
				var name = Gibberish.generateSymbol(type);				
				var code = "_{0} = Gibberish.make['{1}']();".format(name, type);
				codeDictionary.initialization.push(code);
		
				codeDictionary.upvalues.push("var {0} = _{0}".format(name));
				op.maps = {};
		
				var paramNames = [name];
				for(var i = 0; i < parameters.length; i++) {
					paramNames.push(Gibberish.codegen(op[parameters[i]], codeDictionary));
				}
				var c = String.prototype.format.apply(formula, paramNames);
				return c;
			}
			return generator;
		},
		
		mod : function(name, modulator, type) {
			var type = type || "+";
			var m = { type:type, operands:[this[name], modulator], name:name };
			this[name] = m;
			modulator.modding = this;
			this.mods.push(m);
			return modulator;
		},

		removeMod : function(modNumber) {
			var mod = this.mods[modNumber];
			var val = mod.operands[0];
			delete this[mod.name];
		
			this[mod.name] = val;
			this.mods.splice(modNumber, 1);
			console.log(mod.name);
			ugenGenerateCodeblock(this);
		},
		
		addFx : function() {
			for(var i = 0; i < arguments.length; i++) {
				var effect = arguments[i];
				this.fx.push(effect);
			}
		},
		
		generateSymbol : function(name) {
			return name + "_" + this.id++; 
		},
		
		id		: 0,
		make 	: {},
		
		generators : {	
			// Env		: createGenerator("Env",  ["attack",  "decay"], "{0}({1}, {2})" ),
			// Clip	: createGenerator("Clip", ["source", "amount", "amp"], "{0}({1},{2}) * {3}"),
		},
		
    }
});
define(["oscillators", "effects"], function(oscillators, effects) {
	var ugens = [];
    return {
        init : function() { 
			oscillators.init(this);
			effects.init(this);
			
			this.generators["+"] = this.binop_generator;
			this.generators["*"] = this.binop_generator;
			this.generators["-"] = this.binop_generator;
			this.generators["/"] = this.binop_generator;
			this.generators["="] = this.binop_generator;		
		},
		
		generateCallback : function(debug) {	
			var masterUpvalues = [];
			var masterCodeblock = [];
			
			var start = "function() {\n";
			var upvalues = "";
			var codeblock = "function cb() {\nvar output = 0;\n";
	
			for(var i = 0; i < ugens.length; i++) {
				var ugen = ugens[i];
				
				var p = (typeof ugen.fcn === "function") ? ugen.fcn.getPhase() : 0;	
				
				// loop through all init functions and execute, but only map first one to ugen
				for(var j = 0; j < ugen.initialization.length; j++) {
					var init = ugen.initialization[j];
					
					if(debug) console.log(init);

					eval("var fcn = " + init + ";");
					// 
					// 					if(j == 0) {
					// //						console.log("PHASE SET", ugen.type);
					// 						ugen.fcn = fcn;
					// 						ugen.fcn.setPhase(p);
					// 					}
				}
		
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
			
			this.dirty = false;
			
			return eval("(" + cbgen + ")()");
		},
		
		connectToOutput : function() {
			console.log("CONNECT TO OUTPUT");
			for(var i = 0; i < arguments.length; i++) {
				ugens.push(arguments[i]);
				Gibberish.generate(arguments[i]);
			}
			Gibberish.callback = Gibberish.generateCallback();
		},
		
		disconnectFromOutput : function() {
			for(var i = 0; i < arguments.length; i++) {
				ugens.remove(arguments[i]);
			}
			Gibberish.callback = Gibberish.generateCallback();
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
							//value = _value;
							if(typeof value === "number"){
								value = _value;
							}else{
								value["operands"][0] = _value;
							}
							Gibberish.generate(that);
							Gibberish.dirty = true;
							//Gibberish.generateCodeblockForUgen(that);
							//Gibberish.callback = Gibberish.generateCallback();
						},
					});
				})(obj);
			}
		},
		
		createGenerator : function(type, parameters, formula) {
			var generator = function(op, codeDictionary) {
				var name = Gibberish.generateSymbol(type);				
				var code = "_{0} = Gibberish.make['{1}']();".format(name, type);
				//console.log("NAME : ", op.name)
				//console.log(op.test, op.type);
				
				codeDictionary.initialization.push(code);
				
				// console.log(op.frequency);
				// restore phase from previous functions
				if(op.functionName && eval("typeof " + op.functionName + " !== 'undefined'")) {
					//console.log(op.functionName, eval(op.functionName+".getPhase()"));
					codeDictionary.initialization.push("_{0}.setPhase({1})".format(name, eval(op.functionName+".getPhase()")));
				}
				op.functionName = "_"+name;
		
				codeDictionary.upvalues.push("var {0} = _{0}".format(name));
		
				var paramNames = [name];
				for(var i = 0; i < parameters.length; i++) {
					paramNames.push(Gibberish.codegen(op[parameters[i]], codeDictionary));
				}
				op.name = name;
				var c = String.prototype.format.apply(formula, paramNames);
				return c;
			}
			return generator;
		},
		
		codegen : function(op, codeDictionary) {
			if(typeof op === "object") {
				//var memo = codeDictionary.memo[JSON.stringify(op)];
				//if(memo) return memo;
				
				var gen = this.generators[op.type];
				var name = this.generateSymbol("v");
				//codeDictionary.memo[JSON.stringify(op)] = name;
		
				if(op.category !== "FX") {
					statement = "var {0} = {1}".format(name, gen(op, codeDictionary));
				}else{
					statement = "{0} = {1}".format(op.source, gen(op, codeDictionary));
				}
				
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
			
			if(typeof ugen.fx !== "undefined") {
				for(var i = 0; i < ugen.fx.length; i++) {
					var effect = ugen.fx[i];
					effect.source = outputCode;
					this.codegen(effect, codeDictionary);
				}
			}
			
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
		
		mod : function(name, modulator, type) {
			var type = type || "+";
			var m = { type:type, operands:[this[name], modulator], name:name };
			this[name] = m;
			modulator.modding = this;
			this.mods.push(m);
			Gibberish.generate(this);
			Gibberish.dirty = true;
			return modulator;
		},

		removeMod : function() {
			var mod = this.mods.get(arguments[0]); 	// can be number, string, or object
			delete this[mod.name]; 					// remove property getter/setters so we can directly assign
			this.mods.remove(mod);
			
			var val = mod.operands[0];
			this[mod.name] = val;

			Gibberish.defineProperties(this, ["frequency"]);
			Gibberish.generate(this);
			Gibberish.dirty = true;
		},
		
		addFx : function() {
			for(var i = 0; i < arguments.length; i++) {
				var effect = arguments[i];
				this.fx.push(effect);
			}
			Gibberish.dirty = true;
		},
		
		generateSymbol : function(name) {
			return name + "_" + this.id++; 
		},
		
		id			:  0,
		make 		: {},
		generators 	: {},
		ugens		: ugens,
		dirty		: false,
		
    }
});
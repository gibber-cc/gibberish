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
			this.memo = {};
			
			var start = "function(globals) {\n";
			var upvalues = "";
			var codeblock = "function cb() {\nvar output = 0;\n";
			
			for(var i = 0; i < ugens.length; i++) {
				var ugen = ugens[i];
				
				if(ugen.dirty) {
					Gibberish.generate(ugen);				
					ugen.dirty = false;
				}
		
				masterUpvalues.push( ugen.upvalues + ";\n" );
				masterCodeblock.push(ugen.codeblock);
			}
	
			codeblock += masterCodeblock.join("\n");
			var end = "return output;\n}\nreturn cb;\n}";
			
			var cbgen = start + masterUpvalues.join("") + codeblock + end;
	
			if(debug) console.log(cbgen);
			
			this.dirty = false;
			
			// todo: fix using new Function
			// var f = new Function(cbgen);
			// return f();
			return eval("(" + cbgen + ")(window)");
		},

		connect : function() {
			for(var i = 0; i < arguments.length; i++) {
				ugens.push(arguments[i]);
				//Gibberish.generate(arguments[i]);
			}
			Gibberish.dirty = true;
		},
		
		disconnect : function() {
			for(var i = 0; i < arguments.length; i++) {
				ugens.remove(arguments[i]);
			}
			Gibberish.dirty = true;
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
							if(typeof value === "number"){
								value = _value;
							}else{
								value["operands"][0] = _value;
							}
							
							if(that.modding) {	// when ugen containing mod is codegen'd, the mod will be as well
								Gibberish.generate(that.modding);
							}else{
								Gibberish.generate(that);
							}
							that.dirty = true;
							Gibberish.dirty = true;
						},
					});
				})(obj);
			}
		},
		
		createGenerator : function(parameters, formula) {
			var generator = function(op, codeDictionary) {
				var name = op.name;
				
				//console.log("GENERATING WITH FORMULA", formula, "PARAMETERS", parameters);
				codeDictionary.upvalues.push("var {0} = globals.{0}".format(name));
				
				var paramNames = [name];
				for(var i = 0; i < parameters.length; i++) {
					paramNames.push(Gibberish.codegen(op[parameters[i]], codeDictionary));
				}
				
				var c = String.prototype.format.apply(formula, paramNames);
				
				return c;
			}
			return generator;
		},
		
		codegen : function(op, codeDictionary) {
			if(typeof op === "object") {
				// var memo = this.memo[op.name];
				// 				if(memo) {
				// 					console.log("MEMO HOORAY! " + op.name );
				// 					return memo;
				// 				}
				//console.log(op);
				var gen = this.generators[op.type];
				
				var name = op.ugenVariable || this.generateSymbol("v");
				//console.log(name);
				//this.memo[op.name] = name;
				op.ugenVariable = name;

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
				initialization 	: [],	// will be executed globally accessible by callback
				upvalues		: [],	// pointers to globals that will be included in callback closure
				codeblock 		: [],	// will go directly into callback
			};
			//console.log("GENERATING " + ugen.type);
			var outputCode = this.codegen(ugen, codeDictionary);
			
			if(typeof ugen.fx !== "undefined") {
				for(var i = 0; i < ugen.fx.length; i++) {
					var effect = ugen.fx[i];
					effect.source = outputCode;
					this.codegen(effect, codeDictionary);
				}
			}
			
			var output = ugen.output.ugenVariable || ugen.output;
			codeDictionary.codeblock.push( "{0} += {1};\n".format( output, outputCode) );

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
			this.dirty = true;
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
			this.dirty = true;
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
		memo		: {},
		MASTER		: "output", // a constant to connect to master output		
    }
});
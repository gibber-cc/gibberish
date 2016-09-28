(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Gibberish = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'abs',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.abs));

      out = 'gen.abs( ' + inputs[0] + ' )';
    } else {
      out = Math.abs(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var abs = Object.create(proto);

  abs.inputs = [x];

  return abs;
};
},{"./gen.js":27}],2:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'accum',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        genName = 'gen.' + this.name,
        functionBody = void 0;

    _gen.requestMemory(this.memory);

    _gen.memory.heap[this.memory.value.idx] = this.initialValue;

    functionBody = this.callback(genName, inputs[0], inputs[1], 'memory[' + this.memory.value.idx + ']');

    _gen.closures.add(_defineProperty({}, this.name, this));

    _gen.memo[this.name] = this.name + '_value';

    return [this.name + '_value', functionBody];
  },
  callback: function callback(_name, _incr, _reset, valueRef) {
    var diff = this.max - this.min,
        out = '',
        wrap = '';

    /* three different methods of wrapping, third is most expensive:
     *
     * 1: range {0,1}: y = x - (x | 0)
     * 2: log2(this.max) == integer: y = x & (this.max - 1)
     * 3: all others: if( x >= this.max ) y = this.max -x
     *
     */

    // must check for reset before storing value for output
    if (!(typeof this.inputs[1] === 'number' && this.inputs[1] < 1)) {
      out += '  if( ' + _reset + ' >=1 ) ' + valueRef + ' = ' + this.min + '\n\n';
    }

    out += '  var ' + this.name + '_value = ' + valueRef + ';\n  ' + valueRef + ' += ' + _incr + '\n'; // store output value before accumulating 

    if (this.max !== Infinity && this.shouldWrap) wrap += '  if( ' + valueRef + ' >= ' + this.max + ' ) ' + valueRef + ' -= ' + diff + '\n';
    if (this.min !== -Infinity && this.shouldWrap) wrap += '  if( ' + valueRef + ' < ' + this.min + ' ) ' + valueRef + ' += ' + diff + '\n\n';

    //if( this.min === 0 && this.max === 1 ) {
    //  wrap =  `  ${valueRef} = ${valueRef} - (${valueRef} | 0)\n\n`
    //} else if( this.min === 0 && ( Math.log2( this.max ) | 0 ) === Math.log2( this.max ) ) {
    //  wrap =  `  ${valueRef} = ${valueRef} & (${this.max} - 1)\n\n`
    //} else if( this.max !== Infinity ){
    //  wrap = `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n\n`
    //}

    out = out + wrap;

    return out;
  }
};

module.exports = function (incr) {
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var properties = arguments[2];

  var ugen = Object.create(proto),
      defaults = { min: 0, max: 1, shouldWrap: true };

  if (properties !== undefined) Object.assign(defaults, properties);

  if (defaults.initialValue === undefined) defaults.initialValue = defaults.min;

  Object.assign(ugen, {
    min: defaults.min,
    max: defaults.max,
    initial: defaults.initialValue,
    value: defaults.initialValue,
    uid: _gen.getUID(),
    inputs: [incr, reset],
    memory: {
      value: { length: 1, idx: null }
    }
  }, defaults);

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":27}],3:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'acos',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'acos': Math.acos });

      out = 'gen.acos( ' + inputs[0] + ' )';
    } else {
      out = Math.acos(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var acos = Object.create(proto);

  acos.inputs = [x];
  acos.id = _gen.getUID();
  acos.name = acos.basename + '{acos.id}';

  return acos;
};
},{"./gen.js":27}],4:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    div = require('./div.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    accum = require('./accum.js'),
    ifelse = require('./ifelseif.js'),
    lt = require('./lt.js'),
    bang = require('./bang.js'),
    env = require('./env.js'),
    add = require('./add.js'),
    poke = require('./poke.js'),
    neq = require('./neq.js');

module.exports = function () {
  var attackTime = arguments.length <= 0 || arguments[0] === undefined ? 44100 : arguments[0];
  var decayTime = arguments.length <= 1 || arguments[1] === undefined ? 44100 : arguments[1];
  var _props = arguments[2];

  var _bang = bang(),
      phase = accum(1, _bang, { max: Infinity, shouldWrap: false, initialValue: -Infinity }),
      props = Object.assign({}, { shape: 'exponential', alpha: 5 }, _props),
      bufferData = void 0,
      decayData = void 0,
      out = void 0,
      buffer = void 0;

  //console.log( 'attack time:', attackTime, 'decay time:', decayTime )
  var completeFlag = data([0]);

  // slightly more efficient to use existing phase accumulator for linear envelopes
  if (props.shape === 'linear') {
    out = ifelse(and(gte(phase, 0), lt(phase, attackTime)), memo(div(phase, attackTime)), and(gte(phase, 0), lt(phase, add(attackTime, decayTime))), sub(1, div(sub(phase, attackTime), decayTime)), neq(phase, -Infinity), poke(completeFlag, 1, 0, { inline: 0 }), 0);
  } else {
    bufferData = env(1024, { type: props.shape, alpha: props.alpha });
    out = ifelse(and(gte(phase, 0), lt(phase, attackTime)), peek(bufferData, div(phase, attackTime), { boundmode: 'clamp' }), and(gte(phase, 0), lt(phase, add(attackTime, decayTime))), peek(bufferData, sub(1, div(sub(phase, attackTime), decayTime)), { boundmode: 'clamp' }), neq(phase, -Infinity), poke(completeFlag, 1, 0, { inline: 0 }), 0);
  }

  out.isComplete = function () {
    return gen.memory.heap[completeFlag.memory.values.idx];
  };

  out.trigger = function () {
    gen.memory.heap[completeFlag.memory.values.idx] = 0;
    _bang.trigger();
  };

  return out;
};
},{"./accum.js":2,"./add.js":5,"./bang.js":10,"./data.js":17,"./div.js":21,"./env.js":22,"./gen.js":27,"./ifelseif.js":32,"./lt.js":35,"./mul.js":45,"./neq.js":46,"./peek.js":51,"./poke.js":53,"./sub.js":62}],5:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var add = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          sum = 0,
          numCount = 0,
          adderAtEnd = false,
          alreadyFullSummed = true;

      inputs.forEach(function (v, i) {
        if (isNaN(v)) {
          out += v;
          if (i < inputs.length - 1) {
            adderAtEnd = true;
            out += ' + ';
          }
          alreadyFullSummed = false;
        } else {
          sum += parseFloat(v);
          numCount++;
        }
      });

      if (alreadyFullSummed) out = '';

      if (numCount > 0) {
        out += adderAtEnd || alreadyFullSummed ? sum : ' + ' + sum;
      }

      if (!alreadyFullSummed) out += ')';

      return out;
    }
  };

  return add;
};
},{"./gen.js":27}],6:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    div = require('./div.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    accum = require('./accum.js'),
    ifelse = require('./ifelseif.js'),
    lt = require('./lt.js'),
    bang = require('./bang.js'),
    env = require('./env.js'),
    param = require('./param.js');

module.exports = function () {
  var attackTime = arguments.length <= 0 || arguments[0] === undefined ? 44 : arguments[0];
  var decayTime = arguments.length <= 1 || arguments[1] === undefined ? 22050 : arguments[1];
  var sustainTime = arguments.length <= 2 || arguments[2] === undefined ? 44100 : arguments[2];
  var sustainLevel = arguments.length <= 3 || arguments[3] === undefined ? .6 : arguments[3];
  var releaseTime = arguments.length <= 4 || arguments[4] === undefined ? 44100 : arguments[4];
  var _props = arguments[5];

  var envTrigger = bang(),
      phase = accum(1, envTrigger, { max: Infinity, shouldWrap: false }),
      shouldSustain = param(1),
      defaults = {
    shape: 'exponential',
    alpha: 5,
    triggerRelease: false
  },
      props = Object.assign({}, defaults, _props),
      bufferData = void 0,
      decayData = void 0,
      out = void 0,
      buffer = void 0,
      sustainCondition = void 0,
      releaseAccum = void 0,
      releaseCondition = void 0;

  // slightly more efficient to use existing phase accumulator for linear envelopes
  //if( props.shape === 'linear' ) {
  //  out = ifelse(
  //    lt( phase, props.attackTime ), memo( div( phase, props.attackTime ) ),
  //    lt( phase, props.attackTime + props.decayTime ), sub( 1, mul( div( sub( phase, props.attackTime ), props.decayTime ), 1-props.sustainLevel ) ),
  //    lt( phase, props.attackTime + props.decayTime + props.sustainTime ),
  //      props.sustainLevel,
  //    lt( phase, props.attackTime + props.decayTime + props.sustainTime + props.releaseTime ),
  //      sub( props.sustainLevel, mul( div( sub( phase, props.attackTime + props.decayTime + props.sustainTime ), props.releaseTime ), props.sustainLevel) ),
  //    0
  //  )
  //} else {    
  bufferData = env(1024, { type: props.shape, alpha: props.alpha });

  sustainCondition = props.triggerRelease ? shouldSustain : lt(phase, attackTime + decayTime + sustainTime);

  releaseAccum = props.triggerRelease ? gtp(sub(sustainLevel, accum(sustainLevel / releaseTime, 0, { shouldWrap: false })), 0) : sub(sustainLevel, mul(div(sub(phase, attackTime + decayTime + sustainTime), releaseTime), sustainLevel)), releaseCondition = props.triggerRelease ? not(shouldSustain) : lt(phase, attackTime + decayTime + sustainTime + releaseTime);

  out = ifelse(
  // attack
  lt(phase, attackTime), peek(bufferData, div(phase, attackTime), { boundmode: 'clamp' }),

  // decay
  lt(phase, attackTime + decayTime), peek(bufferData, sub(1, mul(div(sub(phase, attackTime), decayTime), sub(1, sustainLevel))), { boundmode: 'clamp' }),

  // sustain
  sustainCondition, peek(bufferData, sustainLevel),

  // release
  releaseCondition, //lt( phase,  attackTime +  decayTime +  sustainTime +  releaseTime ),
  peek(bufferData, releaseAccum,
  //sub(  sustainLevel, mul( div( sub( phase,  attackTime +  decayTime +  sustainTime),  releaseTime ),  sustainLevel ) ),
  { boundmode: 'clamp' }), 0);
  //}

  out.trigger = function () {
    shouldSustain.value = 1;
    envTrigger.trigger();
  };

  out.release = function () {
    shouldSustain.value = 0;
    // XXX pretty nasty... grabs accum inside of gtp and resets value manually
    // unfortunately envTrigger won't work as it's back to 0 by the time the release block is triggered...
    gen.memory.heap[releaseAccum.inputs[0].inputs[1].memory.value.idx] = 0;
  };

  return out;
};
},{"./accum.js":2,"./bang.js":10,"./data.js":17,"./div.js":21,"./env.js":22,"./gen.js":27,"./ifelseif.js":32,"./lt.js":35,"./mul.js":45,"./param.js":50,"./peek.js":51,"./sub.js":62}],7:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'and',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = '  var ' + this.name + ' = ' + inputs[0] + ' !== 0 && ' + inputs[1] + ' !== 0 | 0\n\n';

    _gen.memo[this.name] = '' + this.name;

    return ['' + this.name, out];
  }
};

module.exports = function (in1, in2) {
  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":27}],8:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'asin',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'asin': Math.asin });

      out = 'gen.asin( ' + inputs[0] + ' )';
    } else {
      out = Math.asin(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var asin = Object.create(proto);

  asin.inputs = [x];
  asin.id = _gen.getUID();
  asin.name = asin.basename + '{asin.id}';

  return asin;
};
},{"./gen.js":27}],9:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'atan',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'atan': Math.atan });

      out = 'gen.atan( ' + inputs[0] + ' )';
    } else {
      out = Math.atan(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var atan = Object.create(proto);

  atan.inputs = [x];
  atan.id = _gen.getUID();
  atan.name = atan.basename + '{atan.id}';

  return atan;
};
},{"./gen.js":27}],10:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  gen: function gen() {
    _gen.requestMemory(this.memory);

    var out = '  var ' + this.name + ' = memory[' + this.memory.value.idx + ']\n  if( ' + this.name + ' === 1 ) memory[' + this.memory.value.idx + '] = 0      \n      \n';
    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (_props) {
  var ugen = Object.create(proto),
      props = Object.assign({}, { min: 0, max: 1 }, _props);

  ugen.name = 'bang' + _gen.getUID();

  ugen.min = props.min;
  ugen.max = props.max;

  ugen.trigger = function () {
    _gen.memory.heap[ugen.memory.value.idx] = ugen.max;
  };

  ugen.memory = {
    value: { length: 1, idx: null }
  };

  return ugen;
};
},{"./gen.js":27}],11:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'bool',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = inputs[0] + ' === 0 ? 0 : 1';

    //gen.memo[ this.name ] = `gen.data.${this.name}`

    //return [ `gen.data.${this.name}`, ' ' +out ]
    return out;
  }
};

module.exports = function (in1) {
  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":27}],12:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'ceil',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.ceil));

      out = 'gen.ceil( ' + inputs[0] + ' )';
    } else {
      out = Math.ceil(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var ceil = Object.create(proto);

  ceil.inputs = [x];

  return ceil;
};
},{"./gen.js":27}],13:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    floor = require('./floor.js'),
    sub = require('./sub.js'),
    memo = require('./memo.js');

var proto = {
  basename: 'clip',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        out = void 0;

    out = ' var ' + this.name + ' = ' + inputs[0] + '\n  if( ' + this.name + ' > ' + inputs[2] + ' ) ' + this.name + ' = ' + inputs[2] + '\n  else if( ' + this.name + ' < ' + inputs[1] + ' ) ' + this.name + ' = ' + inputs[1] + '\n';
    out = ' ' + out;

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (in1) {
  var min = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];
  var max = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    uid: _gen.getUID(),
    inputs: [in1, min, max]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./floor.js":24,"./gen.js":27,"./memo.js":39,"./sub.js":62}],14:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'cos',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'cos': Math.cos });

      out = 'gen.cos( ' + inputs[0] + ' )';
    } else {
      out = Math.cos(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var cos = Object.create(proto);

  cos.inputs = [x];
  cos.id = _gen.getUID();
  cos.name = cos.basename + '{cos.id}';

  return cos;
};
},{"./gen.js":27}],15:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'counter',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        genName = 'gen.' + this.name,
        functionBody = void 0;

    if (this.memory.value.idx === null) _gen.requestMemory(this.memory);
    functionBody = this.callback(genName, inputs[0], inputs[1], inputs[2], inputs[3], 'memory[' + this.memory.value.idx + ']', 'memory[' + this.memory.wrap.idx + ']');

    _gen.closures.add(_defineProperty({}, this.name, this));

    _gen.memo[this.name] = this.name + '_value';

    if (_gen.memo[this.wrap.name] === undefined) this.wrap.gen();

    return [this.name + '_value', functionBody];
  },
  callback: function callback(_name, _incr, _min, _max, _reset, valueRef, wrapRef) {
    var diff = this.max - this.min,
        out = '',
        wrap = '';

    // must check for reset before storing value for output
    if (!(typeof this.inputs[3] === 'number' && this.inputs[3] < 1)) {
      out += '  if( ' + _reset + ' >= 1 ) ' + valueRef + ' = ' + _min + '\n';
    }

    out += '  var ' + this.name + '_value = ' + valueRef + ';\n  ' + valueRef + ' += ' + _incr + '\n'; // store output value before accumulating 

    if (typeof this.max === 'number' && this.max !== Infinity && typeof this.min === 'number') {
      wrap = '  if( ' + valueRef + ' >= ' + this.max + ' ) {\n    ' + valueRef + ' -= ' + diff + '\n    ' + wrapRef + ' = 1\n  }else{\n    ' + wrapRef + ' = 0\n  }\n';
    } else if (this.max !== Infinity) {
      wrap = '  if( ' + valueRef + ' >= ' + _max + ' ) {\n    ' + valueRef + ' -= ' + _max + ' - ' + _min + '\n    ' + wrapRef + ' = 1\n  }else if( ' + valueRef + ' < ' + _min + ' ) {\n    ' + valueRef + ' += ' + _max + ' - ' + _min + '\n    ' + wrapRef + ' = 1\n  }else{\n    ' + wrapRef + ' = 0\n  }\n';
    } else {
      out += '\n';
    }

    out = out + wrap;

    return out;
  }
};

module.exports = function () {
  var incr = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var min = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var max = arguments.length <= 2 || arguments[2] === undefined ? Infinity : arguments[2];
  var reset = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
  var properties = arguments[4];

  var ugen = Object.create(proto),
      defaults = { initialValue: 0 };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    min: min,
    max: max,
    value: defaults.initialValue,
    uid: _gen.getUID(),
    inputs: [incr, min, max, reset],
    memory: {
      value: { length: 1, idx: null },
      wrap: { length: 1, idx: null }
    },
    wrap: {
      gen: function gen() {
        if (ugen.memory.wrap.idx === null) {
          _gen.requestMemory(ugen.memory);
        }
        _gen.getInputs(this);
        _gen.memo[this.name] = 'memory[ ' + ugen.memory.wrap.idx + ' ]';
        return 'memory[ ' + ugen.memory.wrap.idx + ' ]';
      }
    }
  }, defaults);

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      if (this.memory.value.idx !== null) {
        return _gen.memory.heap[this.memory.value.idx];
      }
    },
    set: function set(v) {
      if (this.memory.value.idx !== null) {
        _gen.memory.heap[this.memory.value.idx] = v;
      }
    }
  });

  ugen.wrap.inputs = [ugen];
  ugen.name = '' + ugen.basename + ugen.uid;
  ugen.wrap.name = ugen.name + '_wrap';
  return ugen;
};
},{"./gen.js":27}],16:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    accum = require('./phasor.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    mul = require('./mul.js'),
    phasor = require('./phasor.js');

var proto = {
  basename: 'cycle',

  initTable: function initTable() {
    var buffer = new Float32Array(1024);

    for (var i = 0, l = buffer.length; i < l; i++) {
      buffer[i] = Math.sin(i / l * (Math.PI * 2));
    }

    gen.globals.cycle = data(buffer, 1, { immutable: true });
  }
};

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  if (gen.globals.cycle === undefined) proto.initTable();

  var ugen = peek(gen.globals.cycle, phasor(frequency, reset, { min: 0 }));
  ugen.name = 'cycle' + gen.getUID();

  return ugen;
};
},{"./data.js":17,"./gen.js":27,"./mul.js":45,"./peek.js":51,"./phasor.js":52}],17:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    utilities = require('./utilities.js'),
    peek = require('./peek.js'),
    poke = require('./poke.js');

var proto = {
  basename: 'data',
  globals: {},

  gen: function gen() {
    var idx = void 0;
    if (_gen.memo[this.name] === undefined) {
      var ugen = this;
      _gen.requestMemory(this.memory, this.immutable);
      idx = this.memory.values.idx;
      try {
        _gen.memory.heap.set(this.buffer, idx);
      } catch (e) {
        console.log(e);
        throw Error('error with request. asking for ' + this.buffer.length + '. current index: ' + _gen.memoryIndex + ' of ' + _gen.memory.heap.length);
      }
      //gen.data[ this.name ] = this
      //return 'gen.memory' + this.name + '.buffer'
      _gen.memo[this.name] = idx;
    } else {
      idx = _gen.memo[this.name];
    }
    return idx;
  }
};

module.exports = function (x) {
  var y = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
  var properties = arguments[2];

  var ugen = void 0,
      buffer = void 0,
      shouldLoad = false;

  if (properties !== undefined && properties.global !== undefined) {
    if (_gen.globals[properties.global]) {
      return _gen.globals[properties.global];
    }
  }

  if (typeof x === 'number') {
    if (y !== 1) {
      buffer = [];
      for (var i = 0; i < y; i++) {
        buffer[i] = new Float32Array(x);
      }
    } else {
      buffer = new Float32Array(x);
    }
  } else if (Array.isArray(x)) {
    //! (x instanceof Float32Array ) ) {
    var size = x.length;
    buffer = new Float32Array(size);
    for (var _i = 0; _i < x.length; _i++) {
      buffer[_i] = x[_i];
    }
  } else if (typeof x === 'string') {
    buffer = { length: y > 1 ? y : _gen.samplerate * 60 };
    shouldLoad = true;
  } else if (x instanceof Float32Array) {
    buffer = x;
  }

  ugen = {
    buffer: buffer,
    name: proto.basename + _gen.getUID(),
    dim: buffer.length,
    channels: 1,
    gen: proto.gen,
    onload: null,
    then: function then(fnc) {
      ugen.onload = fnc;
      return ugen;
    },

    immutable: properties !== undefined && properties.immutable === true ? true : false
  };

  ugen.memory = {
    values: { length: ugen.dim, idx: null }
  };

  _gen.name = 'data' + _gen.getUID();

  if (shouldLoad) {
    var promise = utilities.loadSample(x, ugen);
    promise.then(function (_buffer) {
      ugen.memory.values.length = _buffer.length;
      ugen.onload();
    });
  }

  if (properties !== undefined) {
    if (properties.global !== undefined) {
      _gen.globals[properties.global] = ugen;
    }
    if (properties.meta === true) {
      var _loop = function _loop(length, _i2) {
        Object.defineProperty(ugen, _i2, {
          get: function get() {
            return peek(ugen, _i2, { mode: 'simple', interp: 'none' });
          },
          set: function set(v) {
            return poke(ugen, v, _i2);
          }
        });
      };

      for (var _i2 = 0, length = ugen.buffer.length; _i2 < length; _i2++) {
        _loop(length, _i2);
      }
    }
  }

  return ugen;
};
},{"./gen.js":27,"./peek.js":51,"./poke.js":53,"./utilities.js":67}],18:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js');

module.exports = function (in1) {
    var x1 = history(),
        y1 = history(),
        filter = void 0;

    //History x1, y1; y = in1 - x1 + y1*0.9997; x1 = in1; y1 = y; out1 = y;
    filter = memo(add(sub(in1, x1.out), mul(y1.out, .9997)));
    x1.in(in1);
    y1.in(filter);

    return filter;
};
},{"./add.js":5,"./gen.js":27,"./history.js":31,"./memo.js":39,"./mul.js":45,"./sub.js":62}],19:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    data = require('./data.js'),
    poke = require('./poke.js'),
    wrap = require('./wrap.js'),
    accum = require('./accum.js');

var proto = {
  basename: 'delay',

  gen: function gen() {
    var inputs = _gen.getInputs(this);

    _gen.memo[this.name] = inputs[0];

    return inputs[0];
  }
};

module.exports = function (in1) {
  for (var _len = arguments.length, tapsAndProperties = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    tapsAndProperties[_key - 2] = arguments[_key];
  }

  var time = arguments.length <= 1 || arguments[1] === undefined ? 256 : arguments[1];

  var ugen = Object.create(proto),
      defaults = { size: 512, feedback: 0, interp: 'linear' },
      writeIdx = void 0,
      readIdx = void 0,
      delaydata = void 0,
      properties = void 0,
      tapTimes = [time],
      taps = void 0;

  if (Array.isArray(tapsAndProperties)) {
    properties = tapsAndProperties[tapsAndProperties.length - 1];
    if (tapsAndProperties.length > 1) {
      for (var i = 0; i < tapsAndProperties.length - 1; i++) {
        tapTimes.push(tapsAndProperties[i]);
      }
    }
  }

  if (properties !== undefined) Object.assign(defaults, properties);

  if (defaults.size < time) defaults.size = time;

  delaydata = data(defaults.size);

  ugen.inputs = [];

  writeIdx = accum(1, 0, { max: defaults.size });

  for (var _i = 0; _i < tapTimes.length; _i++) {
    ugen.inputs[_i] = peek(delaydata, wrap(sub(writeIdx, tapTimes[_i]), 0, defaults.size), { mode: 'samples', interp: defaults.interp });
  }

  ugen.outputs = ugen.inputs; // ugn, Ugh, UGH! but i guess it works.

  poke(delaydata, in1, writeIdx);

  ugen.name = '' + ugen.basename + _gen.getUID();

  return ugen;
};
},{"./accum.js":2,"./data.js":17,"./gen.js":27,"./poke.js":53,"./wrap.js":69}],20:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js');

module.exports = function (in1) {
  var n1 = history();

  n1.in(in1);

  var ugen = sub(in1, n1.out);
  ugen.name = 'delta' + gen.getUID();

  return ugen;
};
},{"./gen.js":27,"./history.js":31,"./sub.js":62}],21:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var div = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          diff = 0,
          numCount = 0,
          lastNumber = inputs[0],
          lastNumberIsUgen = isNaN(lastNumber),
          divAtEnd = false;

      inputs.forEach(function (v, i) {
        if (i === 0) return;

        var isNumberUgen = isNaN(v),
            isFinalIdx = i === inputs.length - 1;

        if (!lastNumberIsUgen && !isNumberUgen) {
          lastNumber = lastNumber / v;
          out += lastNumber;
        } else {
          out += lastNumber + ' / ' + v;
        }

        if (!isFinalIdx) out += ' / ';
      });

      out += ')';

      return out;
    }
  };

  return div;
};
},{"./gen.js":27}],22:[function(require,module,exports){
'use strict';

var gen = require('./gen'),
    windows = require('./windows'),
    data = require('./data'),
    peek = require('./peek'),
    phasor = require('./phasor');

module.exports = function () {
  var length = arguments.length <= 0 || arguments[0] === undefined ? 11025 : arguments[0];
  var properties = arguments[1];

  var defaults = {
    type: 'Triangular',
    bufferLength: 1024,
    alpha: .15
  },
      frequency = length / gen.samplerate,
      props = Object.assign({}, defaults, properties),
      buffer = new Float32Array(props.bufferLength);

  if (gen.globals.windows[props.type] === undefined) gen.globals.windows[props.type] = {};

  if (gen.globals.windows[props.type][props.bufferLength] === undefined) {
    for (var i = 0; i < props.bufferLength; i++) {
      buffer[i] = windows[props.type](props.bufferLength, i, props.alpha);
    }

    gen.globals.windows[props.type][props.bufferLength] = data(buffer);
  }

  var ugen = gen.globals.windows[props.type][props.bufferLength]; //peek( gen.globals.windows[ props.type ][ props.bufferLength ], phasor( frequency, 0, { min:0 } ))
  ugen.name = 'env' + gen.getUID();

  return ugen;
};
},{"./data":17,"./gen":27,"./peek":51,"./phasor":52,"./windows":68}],23:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'eq',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = this.inputs[0] === this.inputs[1] ? 1 : '  var ' + this.name + ' = ' + inputs[0] + ' === ' + inputs[1] + ' | 0\n\n';

    _gen.memo[this.name] = '' + this.name;

    return ['' + this.name, out];
  }
};

module.exports = function (in1, in2) {
  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":27}],24:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'floor',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      //gen.closures.add({ [ this.name ]: Math.floor })

      out = '( ' + inputs[0] + ' | 0 )';
    } else {
      out = inputs[0] | 0;
    }

    return out;
  }
};

module.exports = function (x) {
  var floor = Object.create(proto);

  floor.inputs = [x];

  return floor;
};
},{"./gen.js":27}],25:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'fold',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        out = void 0;

    out = this.createCallback(inputs[0], this.min, this.max);

    _gen.memo[this.name] = this.name + '_value';

    return [this.name + '_value', out];
  },
  createCallback: function createCallback(v, lo, hi) {
    var out = ' var ' + this.name + '_value = ' + v + ',\n      ' + this.name + '_range = ' + hi + ' - ' + lo + ',\n      ' + this.name + '_numWraps = 0\n\n  if(' + this.name + '_value >= ' + hi + '){\n    ' + this.name + '_value -= ' + this.name + '_range\n    if(' + this.name + '_value >= ' + hi + '){\n      ' + this.name + '_numWraps = ((' + this.name + '_value - ' + lo + ') / ' + this.name + '_range) | 0\n      ' + this.name + '_value -= ' + this.name + '_range * ' + this.name + '_numWraps\n    }\n    ' + this.name + '_numWraps++\n  } else if(' + this.name + '_value < ' + lo + '){\n    ' + this.name + '_value += ' + this.name + '_range\n    if(' + this.name + '_value < ' + lo + '){\n      ' + this.name + '_numWraps = ((' + this.name + '_value - ' + lo + ') / ' + this.name + '_range- 1) | 0\n      ' + this.name + '_value -= ' + this.name + '_range * ' + this.name + '_numWraps\n    }\n    ' + this.name + '_numWraps--\n  }\n  if(' + this.name + '_numWraps & 1) ' + this.name + '_value = ' + hi + ' + ' + lo + ' - ' + this.name + '_value\n';
    return ' ' + out;
  }
};

module.exports = function (in1) {
  var min = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var max = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    uid: _gen.getUID(),
    inputs: [in1]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":27}],26:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _gen = require('./gen.js');

var proto = {
  basename: 'gate',
  controlString: null, // insert into output codegen for determining indexing
  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    _gen.requestMemory(this.memory);

    var lastInputMemoryIdx = 'memory[ ' + this.memory.lastInput.idx + ' ]',
        outputMemoryStartIdx = this.memory.lastInput.idx + 1,
        inputSignal = inputs[0],
        controlSignal = inputs[1];

    /* 
     * we check to see if the current control inputs equals our last input
     * if so, we store the signal input in the memory associated with the currently
     * selected index. If not, we put 0 in the memory associated with the last selected index,
     * change the selected index, and then store the signal in put in the memery assoicated
     * with the newly selected index
     */

    out = ' if( ' + controlSignal + ' !== ' + lastInputMemoryIdx + ' ) {\n    memory[ ' + lastInputMemoryIdx + ' + ' + outputMemoryStartIdx + '  ] = 0 \n    ' + lastInputMemoryIdx + ' = ' + controlSignal + '\n  }\n  memory[ ' + outputMemoryStartIdx + ' + ' + controlSignal + ' ] = ' + inputSignal + '\n\n';
    this.controlString = inputs[1];
    this.initialized = true;

    _gen.memo[this.name] = this.name;

    this.outputs.forEach(function (v) {
      return v.gen();
    });

    return [null, ' ' + out];
  },
  childgen: function childgen() {
    if (this.parent.initialized === false) {
      _gen.getInputs(this); // parent gate is only input of a gate output, should only be gen'd once.
    }

    if (_gen.memo[this.name] === undefined) {
      _gen.requestMemory(this.memory);

      _gen.memo[this.name] = 'memory[ ' + this.memory.value.idx + ' ]';
    }

    return 'memory[ ' + this.memory.value.idx + ' ]';
  }
};

module.exports = function (control, in1, properties) {
  var ugen = Object.create(proto),
      defaults = { count: 2 };

  if ((typeof properties === 'undefined' ? 'undefined' : _typeof(properties)) !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    outputs: [],
    uid: _gen.getUID(),
    inputs: [in1, control],
    memory: {
      lastInput: { length: 1, idx: null }
    },
    initialized: false
  }, defaults);

  ugen.name = '' + ugen.basename + _gen.getUID();

  for (var i = 0; i < ugen.count; i++) {
    ugen.outputs.push({
      index: i,
      gen: proto.childgen,
      parent: ugen,
      inputs: [ugen],
      memory: {
        value: { length: 1, idx: null }
      },
      initialized: false,
      name: ugen.name + '_out' + _gen.getUID()
    });
  }

  return ugen;
};
},{"./gen.js":27}],27:[function(require,module,exports){
'use strict';

/* gen.js
 *
 * low-level code generation for unit generators
 *
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var MemoryHelper = require('memory-helper');

var gen = {

  accum: 0,
  getUID: function getUID() {
    return this.accum++;
  },

  debug: false,
  samplerate: 44100, // change on audiocontext creation
  shouldLocalize: false,
  globals: {
    windows: {}
  },

  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
   */

  closures: new Set(),
  params: new Set(),

  parameters: [],
  endBlock: new Set(),
  histories: new Map(),

  memo: {},

  data: {},

  /* export
   *
   * place gen functions into another object for easier reference
   */

  export: function _export(obj) {},
  addToEndBlock: function addToEndBlock(v) {
    this.endBlock.add('  ' + v);
  },
  requestMemory: function requestMemory(memorySpec) {
    var immutable = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    for (var key in memorySpec) {
      var request = memorySpec[key];

      request.idx = gen.memory.alloc(request.length, immutable);
    }
  },


  /* createCallback
   *
   * param ugen - Head of graph to be codegen'd
   *
   * Generate callback function for a particular ugen graph.
   * The gen.closures property stores functions that need to be
   * passed as arguments to the final function; these are prefixed
   * before any defined params the graph exposes. For example, given:
   *
   * gen.createCallback( abs( param() ) )
   *
   * ... the generated function will have a signature of ( abs, p0 ).
   */

  createCallback: function createCallback(ugen, mem) {
    var debug = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    var isStereo = Array.isArray(ugen) && ugen.length > 1,
        callback = void 0,
        channel1 = void 0,
        channel2 = void 0;

    if (typeof mem === 'number' || mem === undefined) {
      mem = MemoryHelper.create(mem);
    }

    //console.log( 'cb memory:', mem )
    this.memory = mem;
    this.memo = {};
    this.endBlock.clear();
    this.closures.clear();
    this.params.clear();
    this.globals = { windows: {} };

    this.parameters.length = 0;

    this.functionBody = "  'use strict'\n  var memory = gen.memory\n\n";

    // call .gen() on the head of the graph we are generating the callback for
    //console.log( 'HEAD', ugen )
    for (var i = 0; i < 1 + isStereo; i++) {
      if (typeof ugen[i] === 'number') continue;

      var channel = isStereo ? ugen[i].gen() : ugen.gen(),
          body = '';

      // if .gen() returns array, add ugen callback (graphOutput[1]) to our output functions body
      // and then return name of ugen. If .gen() only generates a number (for really simple graphs)
      // just return that number (graphOutput[0]).
      body += Array.isArray(channel) ? channel[1] + '\n' + channel[0] : channel;

      // split body to inject return keyword on last line
      body = body.split('\n');

      //if( debug ) console.log( 'functionBody length', body )

      // next line is to accommodate memo as graph head
      if (body[body.length - 1].trim().indexOf('let') > -1) {
        body.push('\n');
      }

      // get index of last line
      var lastidx = body.length - 1;

      // insert return keyword
      body[lastidx] = '  gen.out[' + i + ']  = ' + body[lastidx] + '\n';

      this.functionBody += body.join('\n');
    }

    this.histories.forEach(function (value) {
      if (value !== null) value.gen();
    });

    var returnStatement = isStereo ? '  return gen.out' : '  return gen.out[0]';

    this.functionBody = this.functionBody.split('\n');

    if (this.endBlock.size) {
      this.functionBody = this.functionBody.concat(Array.from(this.endBlock));
      this.functionBody.push(returnStatement);
    } else {
      this.functionBody.push(returnStatement);
    }
    // reassemble function body
    this.functionBody = this.functionBody.join('\n');

    // we can only dynamically create a named function by dynamically creating another function
    // to construct the named function! sheesh...
    var buildString = 'return function gen( ' + this.parameters.join(',') + ' ){ \n' + this.functionBody + '\n}';

    if (this.debug || debug) console.log(buildString);

    callback = new Function(buildString)();

    // assign properties to named function
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.closures.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var dict = _step.value;

        var name = Object.keys(dict)[0],
            value = dict[name];

        callback[name] = value;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      var _loop = function _loop() {
        var dict = _step2.value;

        var name = Object.keys(dict)[0],
            ugen = dict[name];

        Object.defineProperty(callback, name, {
          configurable: true,
          get: function get() {
            return ugen.value;
          },
          set: function set(v) {
            ugen.value = v;
          }
        });
        //callback[ name ] = value
      };

      for (var _iterator2 = this.params.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    callback.data = this.data;
    callback.out = new Float32Array(2);
    callback.parameters = this.parameters.slice(0);

    //if( MemoryHelper.isPrototypeOf( this.memory ) )
    callback.memory = this.memory.heap;

    this.histories.clear();

    return callback;
  },


  /* getInputs
   *
   * Given an argument ugen, extract its inputs. If they are numbers, return the numebrs. If
   * they are ugens, call .gen() on the ugen, memoize the result and return the result. If the
   * ugen has previously been memoized return the memoized value.
   *
   */
  getInputs: function getInputs(ugen) {
    return ugen.inputs.map(gen.getInput);
  },
  getInput: function getInput(input) {
    var isObject = (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object',
        processedInput = void 0;

    if (isObject) {
      // if input is a ugen...
      if (gen.memo[input.name]) {
        // if it has been memoized...
        processedInput = gen.memo[input.name];
      } else if (Array.isArray(input)) {
        gen.getInput(input[0]);
        gen.getInput(input[0]);
      } else {
        // if not memoized generate code 
        if (typeof input.gen !== 'function') {
          console.log('no gen found:', input, input.gen);
        }
        var code = input.gen();

        if (Array.isArray(code)) {
          if (!gen.shouldLocalize) {
            gen.functionBody += code[1];
          } else {
            gen.codeName = code[0];
            gen.localizedCode.push(code[1]);
          }
          //console.log( 'after GEN' , this.functionBody )
          processedInput = code[0];
        } else {
          processedInput = code;
        }
      }
    } else {
      // it input is a number
      processedInput = input;
    }

    return processedInput;
  },
  startLocalize: function startLocalize() {
    this.localizedCode = [];
    this.shouldLocalize = true;
  },
  endLocalize: function endLocalize() {
    this.shouldLocalize = false;

    return [this.codeName, this.localizedCode.slice(0)];
  },
  free: function free(graph) {
    if (Array.isArray(graph)) {
      // stereo ugen
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = graph[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var channel = _step3.value;

          this.free(channel);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    } else {
      if ((typeof graph === 'undefined' ? 'undefined' : _typeof(graph)) === 'object') {
        if (graph.memory !== undefined) {
          for (var memoryKey in graph.memory) {
            this.memory.free(graph.memory[memoryKey].idx);
          }
        }
        if (Array.isArray(graph.inputs)) {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = graph.inputs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var ugen = _step4.value;

              this.free(ugen);
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        }
      }
    }
  }
};

module.exports = gen;
},{"memory-helper":70}],28:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gt',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '( ' + inputs[0] + ' > ' + inputs[1] + ' | 0 )';
    } else {
      out += inputs[0] > inputs[1] ? 1 : 0;
    }
    out += '\n\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (x, y) {
  var gt = Object.create(proto);

  gt.inputs = [x, y];
  gt.name = 'gt' + _gen.getUID();

  return gt;
};
},{"./gen.js":27}],29:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gte',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '( ' + inputs[0] + ' >= ' + inputs[1] + ' | 0 )';
    } else {
      out += inputs[0] >= inputs[1] ? 1 : 0;
    }
    out += '\n\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (x, y) {
  var gt = Object.create(proto);

  gt.inputs = [x, y];
  gt.name = 'gte' + _gen.getUID();

  return gt;
};
},{"./gen.js":27}],30:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gtp',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out = '(' + inputs[0] + ' * ( ( ' + inputs[0] + ' > ' + inputs[1] + ' ) | 0 ) )';
    } else {
      out = inputs[0] * (inputs[0] > inputs[1] | 0);
    }

    return out;
  }
};

module.exports = function (x, y) {
  var gtp = Object.create(proto);

  gtp.inputs = [x, y];

  return gtp;
};
},{"./gen.js":27}],31:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  var in1 = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

  var ugen = {
    inputs: [in1],
    memory: { value: { length: 1, idx: null } },
    recorder: null,

    in: function _in(v) {
      if (_gen.histories.has(v)) {
        var memoHistory = _gen.histories.get(v);
        ugen.name = memoHistory.name;
        return memoHistory;
      }

      var obj = {
        gen: function gen() {
          var inputs = _gen.getInputs(ugen);

          if (ugen.memory.value.idx === null) {
            _gen.requestMemory(ugen.memory);
            _gen.memory.heap[ugen.memory.value.idx] = in1;
          }

          var idx = ugen.memory.value.idx;

          _gen.addToEndBlock('memory[ ' + idx + ' ] = ' + inputs[0]);

          // return ugen that is being recorded instead of ssd.
          // this effectively makes a call to ssd.record() transparent to the graph.
          // recording is triggered by prior call to gen.addToEndBlock.
          _gen.histories.set(v, obj);

          return inputs[0];
        },

        name: ugen.name + '_in' + _gen.getUID(),
        memory: ugen.memory
      };

      this.inputs[0] = v;

      ugen.recorder = obj;

      return obj;
    },


    out: {
      gen: function gen() {
        if (ugen.memory.value.idx === null) {
          if (_gen.histories.get(ugen.inputs[0]) === undefined) {
            _gen.histories.set(ugen.inputs[0], ugen.recorder);
          }
          _gen.requestMemory(ugen.memory);
          _gen.memory.heap[ugen.memory.value.idx] = parseFloat(in1);
        }
        var idx = ugen.memory.value.idx;

        return 'memory[ ' + idx + ' ] ';
      }
    },

    uid: _gen.getUID()
  };

  ugen.out.memory = ugen.memory;

  ugen.name = 'history' + ugen.uid;
  ugen.out.name = ugen.name + '_out';
  ugen.in._name = ugen.name = '_in';

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      if (this.memory.value.idx !== null) {
        return _gen.memory.heap[this.memory.value.idx];
      }
    },
    set: function set(v) {
      if (this.memory.value.idx !== null) {
        _gen.memory.heap[this.memory.value.idx] = v;
      }
    }
  });

  return ugen;
};
},{"./gen.js":27}],32:[function(require,module,exports){
/*

 a = conditional( condition, trueBlock, falseBlock )
 b = conditional([
   condition1, block1,
   condition2, block2,
   condition3, block3,
   defaultBlock
 ])

*/
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'ifelse',

  gen: function gen() {
    var conditionals = this.inputs[0],
        defaultValue = conditionals[conditionals.length - 1],
        out = '  var ' + this.name + '_out = ' + defaultValue + '\n';

    for (var i = 0; i < conditionals.length - 2; i += 2) {
      var isEndBlock = i === conditionals.length - 3,
          cond = _gen.getInput(conditionals[i]),
          preblock = conditionals[i + 1],
          block = void 0,
          blockName = void 0,
          output = void 0;

      //console.log( 'pb', preblock )

      if (typeof preblock === 'number') {
        block = preblock;
        blockName = null;
      } else {
        if (_gen.memo[preblock.name] === undefined) {
          // used to place all code dependencies in appropriate blocks
          _gen.startLocalize();

          _gen.getInput(preblock);

          block = _gen.endLocalize();
          blockName = block[0];
          block = block[1].join('');
          block = '  ' + block.replace(/\n/gi, '\n  ');
        } else {
          block = '';
          blockName = _gen.memo[preblock.name];
        }
      }

      output = blockName === null ? '  ' + this.name + '_out = ' + block : block + '  ' + this.name + '_out = ' + blockName;

      if (i === 0) out += ' ';
      out += ' if( ' + cond + ' === 1 ) {\n' + output + '\n  }';

      if (!isEndBlock) {
        out += ' else';
      } else {
        out += '\n';
      }
      /*         
       else`
            }else if( isEndBlock ) {
              out += `{\n  ${output}\n  }\n`
            }else {
      
              //if( i + 2 === conditionals.length || i === conditionals.length - 1 ) {
              //  out += `{\n  ${output}\n  }\n`
              //}else{
                out += 
      ` if( ${cond} === 1 ) {
      ${output}
        } else `
              //}
            }*/
    }

    _gen.memo[this.name] = this.name + '_out';

    return [this.name + '_out', out];
  }
};

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var ugen = Object.create(proto),
      conditions = Array.isArray(args[0]) ? args[0] : args;

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [conditions]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":27}],33:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'in',

  gen: function gen() {
    _gen.parameters.push(this.name);

    _gen.memo[this.name] = this.name;

    return this.name;
  }
};

module.exports = function (name) {
  var input = Object.create(proto);

  input.id = _gen.getUID();
  input.name = name !== undefined ? name : '' + input.basename + input.id;
  input[0] = {
    gen: function gen() {
      if (!_gen.parameters.includes(input.name)) _gen.parameters.push(input.name);
      return input.name + '[0]';
    }
  };
  input[1] = {
    gen: function gen() {
      if (!_gen.parameters.includes(input.name)) _gen.parameters.push(input.name);
      return input.name + '[1]';
    }
  };

  return input;
};
},{"./gen.js":27}],34:[function(require,module,exports){
'use strict';

var library = {
  export: function _export(destination) {
    if (destination === window) {
      destination.ssd = library.history; // history is window object property, so use ssd as alias
      destination.input = library.in; // in is a keyword in javascript
      destination.ternary = library.switch; // switch is a keyword in javascript

      delete library.history;
      delete library.in;
      delete library.switch;
    }

    Object.assign(destination, library);

    library.in = destination.input;
    library.history = destination.ssd;
    library.switch = destination.ternary;

    destination.clip = library.clamp;
  },


  gen: require('./gen.js'),

  abs: require('./abs.js'),
  round: require('./round.js'),
  param: require('./param.js'),
  add: require('./add.js'),
  sub: require('./sub.js'),
  mul: require('./mul.js'),
  div: require('./div.js'),
  accum: require('./accum.js'),
  counter: require('./counter.js'),
  sin: require('./sin.js'),
  cos: require('./cos.js'),
  tan: require('./tan.js'),
  asin: require('./asin.js'),
  acos: require('./acos.js'),
  atan: require('./atan.js'),
  phasor: require('./phasor.js'),
  data: require('./data.js'),
  peek: require('./peek.js'),
  cycle: require('./cycle.js'),
  history: require('./history.js'),
  delta: require('./delta.js'),
  floor: require('./floor.js'),
  ceil: require('./ceil.js'),
  min: require('./min.js'),
  max: require('./max.js'),
  sign: require('./sign.js'),
  dcblock: require('./dcblock.js'),
  memo: require('./memo.js'),
  rate: require('./rate.js'),
  wrap: require('./wrap.js'),
  mix: require('./mix.js'),
  clamp: require('./clamp.js'),
  poke: require('./poke.js'),
  delay: require('./delay.js'),
  fold: require('./fold.js'),
  mod: require('./mod.js'),
  sah: require('./sah.js'),
  noise: require('./noise.js'),
  not: require('./not.js'),
  gt: require('./gt.js'),
  gte: require('./gte.js'),
  lt: require('./lt.js'),
  lte: require('./lte.js'),
  bool: require('./bool.js'),
  gate: require('./gate.js'),
  train: require('./train.js'),
  slide: require('./slide.js'),
  in: require('./in.js'),
  t60: require('./t60.js'),
  mtof: require('./mtof.js'),
  ltp: require('./ltp.js'), // TODO: test
  gtp: require('./gtp.js'), // TODO: test
  switch: require('./switch.js'),
  mstosamps: require('./mstosamps.js'), // TODO: needs test,
  selector: require('./selector.js'),
  utilities: require('./utilities.js'),
  pow: require('./pow.js'),
  //attack:   require( './attack.js' ),
  //decay:    require( './decay.js' ),
  windows: require('./windows.js'),
  env: require('./env.js'),
  ad: require('./ad.js'),
  adsr: require('./adsr.js'),
  ifelse: require('./ifelseif.js'),
  bang: require('./bang.js'),
  and: require('./and.js'),
  pan: require('./pan.js'),
  eq: require('./eq.js'),
  neq: require('./neq.js')
};

library.gen.lib = library;

module.exports = library;
},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./ad.js":4,"./add.js":5,"./adsr.js":6,"./and.js":7,"./asin.js":8,"./atan.js":9,"./bang.js":10,"./bool.js":11,"./ceil.js":12,"./clamp.js":13,"./cos.js":14,"./counter.js":15,"./cycle.js":16,"./data.js":17,"./dcblock.js":18,"./delay.js":19,"./delta.js":20,"./div.js":21,"./env.js":22,"./eq.js":23,"./floor.js":24,"./fold.js":25,"./gate.js":26,"./gen.js":27,"./gt.js":28,"./gte.js":29,"./gtp.js":30,"./history.js":31,"./ifelseif.js":32,"./in.js":33,"./lt.js":35,"./lte.js":36,"./ltp.js":37,"./max.js":38,"./memo.js":39,"./min.js":40,"./mix.js":41,"./mod.js":42,"./mstosamps.js":43,"./mtof.js":44,"./mul.js":45,"./neq.js":46,"./noise.js":47,"./not.js":48,"./pan.js":49,"./param.js":50,"./peek.js":51,"./phasor.js":52,"./poke.js":53,"./pow.js":54,"./rate.js":55,"./round.js":56,"./sah.js":57,"./selector.js":58,"./sign.js":59,"./sin.js":60,"./slide.js":61,"./sub.js":62,"./switch.js":63,"./t60.js":64,"./tan.js":65,"./train.js":66,"./utilities.js":67,"./windows.js":68,"./wrap.js":69}],35:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'lt',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '( ' + inputs[0] + ' < ' + inputs[1] + ' | 0  )';
    } else {
      out += inputs[0] < inputs[1] ? 1 : 0;
    }
    out += '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];

    return out;
  }
};

module.exports = function (x, y) {
  var lt = Object.create(proto);

  lt.inputs = [x, y];
  lt.name = 'lt' + _gen.getUID();

  return lt;
};
},{"./gen.js":27}],36:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'lte',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '( ' + inputs[0] + ' <= ' + inputs[1] + ' | 0  )';
    } else {
      out += inputs[0] <= inputs[1] ? 1 : 0;
    }
    out += '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];

    return out;
  }
};

module.exports = function (x, y) {
  var lt = Object.create(proto);

  lt.inputs = [x, y];
  lt.name = 'lte' + _gen.getUID();

  return lt;
};
},{"./gen.js":27}],37:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'ltp',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out = '(' + inputs[0] + ' * (( ' + inputs[0] + ' < ' + inputs[1] + ' ) | 0 ) )';
    } else {
      out = inputs[0] * (inputs[0] < inputs[1] | 0);
    }

    return out;
  }
};

module.exports = function (x, y) {
  var ltp = Object.create(proto);

  ltp.inputs = [x, y];

  return ltp;
};
},{"./gen.js":27}],38:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'max',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.max));

      out = 'gen.max( ' + inputs[0] + ', ' + inputs[1] + ' )';
    } else {
      out = Math.max(parseFloat(inputs[0]), parseFloat(inputs[1]));
    }

    return out;
  }
};

module.exports = function (x, y) {
  var max = Object.create(proto);

  max.inputs = [x, y];

  return max;
};
},{"./gen.js":27}],39:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'memo',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ' + inputs[0] + '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (in1, memoName) {
  var memo = Object.create(proto);

  memo.inputs = [in1];
  memo.id = _gen.getUID();
  memo.name = memoName !== undefined ? memoName + '_' + _gen.getUID() : '' + memo.basename + memo.id;

  return memo;
};
},{"./gen.js":27}],40:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'min',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.min));

      out = 'gen.min( ' + inputs[0] + ', ' + inputs[1] + ' )';
    } else {
      out = Math.min(parseFloat(inputs[0]), parseFloat(inputs[1]));
    }

    return out;
  }
};

module.exports = function (x, y) {
  var min = Object.create(proto);

  min.inputs = [x, y];

  return min;
};
},{"./gen.js":27}],41:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    memo = require('./memo.js');

module.exports = function (in1, in2) {
    var t = arguments.length <= 2 || arguments[2] === undefined ? .5 : arguments[2];

    var ugen = memo(add(mul(in1, sub(1, t)), mul(in2, t)));
    ugen.name = 'mix' + gen.getUID();

    return ugen;
};
},{"./add.js":5,"./gen.js":27,"./memo.js":39,"./mul.js":45,"./sub.js":62}],42:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var mod = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          diff = 0,
          numCount = 0,
          lastNumber = inputs[0],
          lastNumberIsUgen = isNaN(lastNumber),
          modAtEnd = false;

      inputs.forEach(function (v, i) {
        if (i === 0) return;

        var isNumberUgen = isNaN(v),
            isFinalIdx = i === inputs.length - 1;

        if (!lastNumberIsUgen && !isNumberUgen) {
          lastNumber = lastNumber % v;
          out += lastNumber;
        } else {
          out += lastNumber + ' % ' + v;
        }

        if (!isFinalIdx) out += ' % ';
      });

      out += ')';

      return out;
    }
  };

  return mod;
};
},{"./gen.js":27}],43:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'mstosamps',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this),
        returnValue = void 0;

    if (isNaN(inputs[0])) {
      out = '  var ' + this.name + ' = ' + _gen.samplerate + ' / 1000 * ' + inputs[0] + ' \n\n';

      _gen.memo[this.name] = out;

      returnValue = [this.name, out];
    } else {
      out = _gen.samplerate / 1000 * this.inputs[0];

      returnValue = out;
    }

    return returnValue;
  }
};

module.exports = function (x) {
  var mstosamps = Object.create(proto);

  mstosamps.inputs = [x];
  mstosamps.name = proto.basename + _gen.getUID();

  return mstosamps;
};
},{"./gen.js":27}],44:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'mtof',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.exp));

      out = '( ' + this.tuning + ' * gen.exp( .057762265 * (' + inputs[0] + ' - 69) ) )';
    } else {
      out = this.tuning * Math.exp(.057762265 * (inputs[0] - 69));
    }

    return out;
  }
};

module.exports = function (x, props) {
  var ugen = Object.create(proto),
      defaults = { tuning: 440 };

  if (props !== undefined) Object.assign(props.defaults);

  Object.assign(ugen, defaults);
  ugen.inputs = [x];

  return ugen;
};
},{"./gen.js":27}],45:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function (x, y) {
  var mul = {
    id: _gen.getUID(),
    inputs: [x, y],

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = void 0;

      if (isNaN(inputs[0]) || isNaN(inputs[1])) {
        out = '(' + inputs[0] + ' * ' + inputs[1] + ')';
      } else {
        out = parseFloat(inputs[0]) * parseFloat(inputs[1]);
      }

      return out;
    }
  };

  return mul;
};
},{"./gen.js":27}],46:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'neq',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = /*this.inputs[0] !== this.inputs[1] ? 1 :*/'  var ' + this.name + ' = ' + inputs[0] + ' !== ' + inputs[1] + ' | 0\n\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (in1, in2) {
  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":27}],47:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'noise',

  gen: function gen() {
    var out = void 0;

    _gen.closures.add({ 'noise': Math.random });

    out = '  var ' + this.name + ' = gen.noise()\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (x) {
  var noise = Object.create(proto);
  noise.name = proto.name + _gen.getUID();

  return noise;
};
},{"./gen.js":27}],48:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'not',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0])) {
      out = '( ' + inputs[0] + ' === 0 ? 1 : 0 )';
    } else {
      out = !inputs[0] === 0 ? 1 : 0;
    }

    return out;
  }
};

module.exports = function (x) {
  var not = Object.create(proto);

  not.inputs = [x];

  return not;
};
},{"./gen.js":27}],49:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    mul = require('./mul.js');

var proto = {
  basename: 'pan',
  initTable: function initTable() {
    var bufferL = new Float32Array(1024),
        bufferR = new Float32Array(1024);

    var sqrtTwoOverTwo = Math.sqrt(2) / 2;

    for (var i = 0; i < 1024; i++) {
      var pan = -1 + i / 1024 * 2;
      bufferL[i] = sqrtTwoOverTwo * (Math.cos(pan) - Math.sin(pan));
      bufferR[i] = sqrtTwoOverTwo * (Math.cos(pan) + Math.sin(pan));
    }

    gen.globals.panL = data(bufferL, 1, { immutable: true });
    gen.globals.panR = data(bufferR, 1, { immutable: true });
  }
};

module.exports = function (leftInput, rightInput, pan, properties) {
  if (gen.globals.panL === undefined) proto.initTable();

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: gen.getUID(),
    inputs: [leftInput, rightInput],
    left: mul(leftInput, peek(gen.globals.panL, pan, { boundmode: 'clamp' })),
    right: mul(rightInput, peek(gen.globals.panR, pan, { boundmode: 'clamp' }))
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./data.js":17,"./gen.js":27,"./mul.js":45,"./peek.js":51}],50:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  gen: function gen() {
    _gen.requestMemory(this.memory);

    _gen.params.add(_defineProperty({}, this.name, this));

    this.value = this.initialValue;

    _gen.memo[this.name] = 'memory[' + this.memory.value.idx + ']';

    return _gen.memo[this.name];
  }
};

module.exports = function () {
  var propName = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
  var value = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var ugen = Object.create(proto);

  if (typeof propName !== 'string') {
    ugen.name = 'param' + _gen.getUID();
    ugen.initialValue = propName;
  } else {
    ugen.name = propName;
    ugen.initialValue = value;
  }

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      if (this.memory.value.idx !== null) {
        return _gen.memory.heap[this.memory.value.idx];
      }
    },
    set: function set(v) {
      if (this.memory.value.idx !== null) {
        _gen.memory.heap[this.memory.value.idx] = v;
      }
    }
  });

  ugen.memory = {
    value: { length: 1, idx: null }
  };

  return ugen;
};
},{"./gen.js":27}],51:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'peek',

  gen: function gen() {
    var genName = 'gen.' + this.name,
        inputs = _gen.getInputs(this),
        out = void 0,
        functionBody = void 0,
        next = void 0,
        lengthIsLog2 = void 0,
        idx = void 0;

    //idx = this.data.gen()
    idx = inputs[1];
    lengthIsLog2 = (Math.log2(this.data.buffer.length) | 0) === Math.log2(this.data.buffer.length);

    //console.log( "LENGTH IS LOG2", lengthIsLog2, this.data.buffer.length )
    //${this.name}_index = ${this.name}_phase | 0,\n`
    if (this.mode !== 'simple') {

      functionBody = '  var ' + this.name + '_dataIdx  = ' + idx + ', \n      ' + this.name + '_phase = ' + (this.mode === 'samples' ? inputs[0] : inputs[0] + ' * ' + (this.data.buffer.length - 1)) + ', \n      ' + this.name + '_index = ' + this.name + '_phase | 0,\n';

      //next = lengthIsLog2 ?
      if (this.boundmode === 'wrap') {
        next = lengthIsLog2 ? '( ' + this.name + '_index + 1 ) & (' + this.data.buffer.length + ' - 1)' : this.name + '_index + 1 >= ' + this.data.buffer.length + ' ? ' + this.name + '_index + 1 - ' + this.data.buffer.length + ' : ' + this.name + '_index + 1';
      } else if (this.boundmode === 'clamp') {
        next = this.name + '_index + 1 >= ' + (this.data.buffer.length - 1) + ' ? ' + (this.data.buffer.length - 1) + ' : ' + this.name + '_index + 1';
      }

      if (this.interp === 'linear') {
        functionBody += '      ' + this.name + '_frac  = ' + this.name + '_phase - ' + this.name + '_index,\n      ' + this.name + '_base  = memory[ ' + this.name + '_dataIdx +  ' + this.name + '_index ],\n      ' + this.name + '_next  = ' + next + ',     \n      ' + this.name + '_out   = ' + this.name + '_base + ' + this.name + '_frac * ( memory[ ' + this.name + '_dataIdx + ' + this.name + '_next ] - ' + this.name + '_base )\n\n';
      } else {
        functionBody += '      ' + this.name + '_out = memory[ ' + this.name + '_dataIdx + ' + this.name + '_index ]\n\n';
      }
    } else {
      // mode is simple
      functionBody = 'memory[ ' + idx + ' + ' + inputs[0] + ' ]';

      return functionBody;
    }

    _gen.memo[this.name] = this.name + '_out';

    return [this.name + '_out', functionBody];
  }
};

module.exports = function (data, index, properties) {
  var ugen = Object.create(proto),
      defaults = { channels: 1, mode: 'phase', interp: 'linear', boundmode: 'wrap' };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    data: data,
    dataName: data.name,
    uid: _gen.getUID(),
    inputs: [index, data]
  }, defaults);

  ugen.name = ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":27}],52:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    accum = require('./accum.js'),
    mul = require('./mul.js'),
    proto = { basename: 'phasor' };

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var props = arguments[2];

  if (props === undefined) props = { min: -1 };

  var range = (props.max || 1) - props.min;

  var ugen = typeof frequency === 'number' ? accum(frequency * range / gen.samplerate, reset, props) : accum(mul(frequency, 1 / gen.samplerate / (1 / range)), reset, props);

  ugen.name = proto.basename + gen.getUID();

  return ugen;
};
},{"./accum.js":2,"./gen.js":27,"./mul.js":45}],53:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    mul = require('./mul.js'),
    wrap = require('./wrap.js');

var proto = {
  basename: 'poke',

  gen: function gen() {
    var dataName = 'memory',
        inputs = _gen.getInputs(this),
        idx = void 0,
        out = void 0,
        wrapped = void 0;

    idx = this.data.gen();

    //gen.requestMemory( this.memory )
    //wrapped = wrap( this.inputs[1], 0, this.dataLength ).gen()
    //idx = wrapped[0]
    //gen.functionBody += wrapped[1]
    var outputStr = this.inputs[1] === 0 ? '  ' + dataName + '[ ' + idx + ' ] = ' + inputs[0] + '\n' : '  ' + dataName + '[ ' + idx + ' + ' + inputs[1] + ' ] = ' + inputs[0] + '\n';

    if (this.inline === undefined) {
      _gen.functionBody += outputStr;
    } else {
      return [this.inline, outputStr];
    }
  }
};
module.exports = function (data, value, index, properties) {
  var ugen = Object.create(proto),
      defaults = { channels: 1 };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    data: data,
    dataName: data.name,
    dataLength: data.buffer.length,
    uid: _gen.getUID(),
    inputs: [value, index]
  }, defaults);

  ugen.name = ugen.basename + ugen.uid;

  _gen.histories.set(ugen.name, ugen);

  return ugen;
};
},{"./gen.js":27,"./mul.js":45,"./wrap.js":69}],54:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'pow',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add({ 'pow': Math.pow });

      out = 'gen.pow( ' + inputs[0] + ', ' + inputs[1] + ' )';
    } else {
      if (typeof inputs[0] === 'string' && inputs[0][0] === '(') {
        inputs[0] = inputs[0].slice(1, -1);
      }
      if (typeof inputs[1] === 'string' && inputs[1][0] === '(') {
        inputs[1] = inputs[1].slice(1, -1);
      }

      out = Math.pow(parseFloat(inputs[0]), parseFloat(inputs[1]));
    }

    return out;
  }
};

module.exports = function (x, y) {
  var pow = Object.create(proto);

  pow.inputs = [x, y];
  pow.id = _gen.getUID();
  pow.name = pow.basename + '{pow.id}';

  return pow;
};
},{"./gen.js":27}],55:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js'),
    delta = require('./delta.js'),
    wrap = require('./wrap.js');

var proto = {
  basename: 'rate',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        phase = history(),
        inMinus1 = history(),
        genName = 'gen.' + this.name,
        filter = void 0,
        sum = void 0,
        out = void 0;

    _gen.closures.add(_defineProperty({}, this.name, this));

    out = ' var ' + this.name + '_diff = ' + inputs[0] + ' - ' + genName + '.lastSample\n  if( ' + this.name + '_diff < -.5 ) ' + this.name + '_diff += 1\n  ' + genName + '.phase += ' + this.name + '_diff * ' + inputs[1] + '\n  if( ' + genName + '.phase > 1 ) ' + genName + '.phase -= 1\n  ' + genName + '.lastSample = ' + inputs[0] + '\n';
    out = ' ' + out;

    return [genName + '.phase', out];
  }
};

module.exports = function (in1, rate) {
  var ugen = Object.create(proto);

  Object.assign(ugen, {
    phase: 0,
    lastSample: 0,
    uid: _gen.getUID(),
    inputs: [in1, rate]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./add.js":5,"./delta.js":20,"./gen.js":27,"./history.js":31,"./memo.js":39,"./mul.js":45,"./sub.js":62,"./wrap.js":69}],56:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'round',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.round));

      out = 'gen.round( ' + inputs[0] + ' )';
    } else {
      out = Math.round(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var round = Object.create(proto);

  round.inputs = [x];

  return round;
};
},{"./gen.js":27}],57:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'sah',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    _gen.data[this.name] = 0;
    _gen.data[this.name + '_control'] = 0;

    out = ' var ' + this.name + ' = gen.data.' + this.name + '_control,\n      ' + this.name + '_trigger = ' + inputs[1] + ' > ' + inputs[2] + ' ? 1 : 0\n\n  if( ' + this.name + '_trigger !== ' + this.name + '  ) {\n    if( ' + this.name + '_trigger === 1 ) \n      gen.data.' + this.name + ' = ' + inputs[0] + '\n    gen.data.' + this.name + '_control = ' + this.name + '_trigger\n  }\n';

    _gen.memo[this.name] = 'gen.data.' + this.name;

    return ['gen.data.' + this.name, ' ' + out];
  }
};

module.exports = function (in1, control) {
  var threshold = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
  var properties = arguments[3];

  var ugen = Object.create(proto),
      defaults = { init: 0 };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    lastSample: 0,
    uid: _gen.getUID(),
    inputs: [in1, control, threshold]
  }, defaults);

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":27}],58:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'selector',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0,
        returnValue = 0;

    switch (inputs.length) {
      case 2:
        returnValue = inputs[1];
        break;
      case 3:
        out = '  var ' + this.name + '_out = ' + inputs[0] + ' === 1 ? ' + inputs[1] + ' : ' + inputs[2] + '\n\n';
        returnValue = [this.name + '_out', out];
        break;
      default:
        out = ' var ' + this.name + '_out = 0\n  switch( ' + inputs[0] + ' + 1 ) {\n';

        for (var i = 1; i < inputs.length; i++) {
          out += '    case ' + i + ': ' + this.name + '_out = ' + inputs[i] + '; break;\n';
        }

        out += '  }\n\n';

        returnValue = [this.name + '_out', ' ' + out];
    }

    _gen.memo[this.name] = this.name + '_out';

    return returnValue;
  }
};

module.exports = function () {
  for (var _len = arguments.length, inputs = Array(_len), _key = 0; _key < _len; _key++) {
    inputs[_key] = arguments[_key];
  }

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: inputs
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":27}],59:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'sign',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.sign));

      out = 'gen.sign( ' + inputs[0] + ' )';
    } else {
      out = Math.sign(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var sign = Object.create(proto);

  sign.inputs = [x];

  return sign;
};
},{"./gen.js":27}],60:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'sin',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'sin': Math.sin });

      out = 'gen.sin( ' + inputs[0] + ' )';
    } else {
      out = Math.sin(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var sin = Object.create(proto);

  sin.inputs = [x];
  sin.id = _gen.getUID();
  sin.name = sin.basename + '{sin.id}';

  return sin;
};
},{"./gen.js":27}],61:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js'),
    _switch = require('./switch.js');

module.exports = function (in1) {
    var slideUp = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
    var slideDown = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

    var y1 = history(0),
        filter = void 0,
        slideAmount = void 0;

    //y (n) = y (n-1) + ((x (n) - y (n-1))/slide)
    slideAmount = _switch(gt(in1, y1.out), slideUp, slideDown);

    filter = memo(add(y1.out, div(sub(in1, y1.out), slideAmount)));

    y1.in(filter);

    return filter;
};
},{"./add.js":5,"./gen.js":27,"./history.js":31,"./memo.js":39,"./mul.js":45,"./sub.js":62,"./switch.js":63}],62:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var sub = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = 0,
          diff = 0,
          needsParens = false,
          numCount = 0,
          lastNumber = inputs[0],
          lastNumberIsUgen = isNaN(lastNumber),
          subAtEnd = false,
          hasUgens = false,
          returnValue = 0;

      this.inputs.forEach(function (value) {
        if (isNaN(value)) hasUgens = true;
      });

      if (hasUgens) {
        // store in variable for future reference
        out = '  var ' + this.name + ' = (';
      } else {
        out = '(';
      }

      inputs.forEach(function (v, i) {
        if (i === 0) return;

        var isNumberUgen = isNaN(v),
            isFinalIdx = i === inputs.length - 1;

        if (!lastNumberIsUgen && !isNumberUgen) {
          lastNumber = lastNumber - v;
          out += lastNumber;
          return;
        } else {
          needsParens = true;
          out += lastNumber + ' - ' + v;
        }

        if (!isFinalIdx) out += ' - ';
      });

      if (needsParens) {
        out += ')';
      } else {
        out = out.slice(1); // remove opening paren
      }

      if (hasUgens) out += '\n';

      returnValue = hasUgens ? [this.name, out] : out;

      if (hasUgens) _gen.memo[this.name] = this.name;

      return returnValue;
    }
  };

  sub.name = 'sub' + sub.id;

  return sub;
};
},{"./gen.js":27}],63:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'switch',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    if (inputs[1] === inputs[2]) return inputs[1]; // if both potential outputs are the same just return one of them

    out = '  var ' + this.name + '_out = ' + inputs[0] + ' === 1 ? ' + inputs[1] + ' : ' + inputs[2] + '\n';

    _gen.memo[this.name] = this.name + '_out';

    return [this.name + '_out', out];
  }
};

module.exports = function (control) {
  var in1 = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
  var in2 = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [control, in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":27}],64:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 't60',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this),
        returnValue = void 0;

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, 'exp', Math.exp));

      out = '  var ' + this.name + ' = gen.exp( -6.907755278921 / ' + inputs[0] + ' )\n\n';

      _gen.memo[this.name] = out;

      returnValue = [this.name, out];
    } else {
      out = Math.exp(-6.907755278921 / inputs[0]);

      returnValue = out;
    }

    return returnValue;
  }
};

module.exports = function (x) {
  var t60 = Object.create(proto);

  t60.inputs = [x];
  t60.name = proto.basename + _gen.getUID();

  return t60;
};
},{"./gen.js":27}],65:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'tan',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'tan': Math.tan });

      out = 'gen.tan( ' + inputs[0] + ' )';
    } else {
      out = Math.tan(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var tan = Object.create(proto);

  tan.inputs = [x];
  tan.id = _gen.getUID();
  tan.name = tan.basename + '{tan.id}';

  return tan;
};
},{"./gen.js":27}],66:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    lt = require('./lt.js'),
    phasor = require('./phasor.js');

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 440 : arguments[0];
  var pulsewidth = arguments.length <= 1 || arguments[1] === undefined ? .5 : arguments[1];

  var graph = lt(accum(div(frequency, 44100)), .5);

  graph.name = 'train' + gen.getUID();

  return graph;
};
},{"./gen.js":27,"./lt.js":35,"./phasor.js":52}],67:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    data = require('./data.js');

var isStereo = false;

var utilities = {
  ctx: null,

  clear: function clear() {
    this.callback = function () {
      return 0;
    };
    this.clear.callbacks.forEach(function (v) {
      return v();
    });
    this.clear.callbacks.length = 0;
  },
  createContext: function createContext() {
    var AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext;
    this.ctx = new AC();
    gen.samplerate = this.ctx.sampleRate;

    var start = function start() {
      if (typeof AC !== 'undefined') {
        if (document && document.documentElement && 'ontouchstart' in document.documentElement) {
          window.removeEventListener('touchstart', start);

          if ('ontouchstart' in document.documentElement) {
            // required to start audio under iOS 6
            var mySource = utilities.ctx.createBufferSource();
            mySource.connect(utilities.ctx.destination);
            mySource.noteOn(0);
          }
        }
      }
    };

    if (document && document.documentElement && 'ontouchstart' in document.documentElement) {
      window.addEventListener('touchstart', start);
    }

    return this;
  },
  createScriptProcessor: function createScriptProcessor() {
    this.node = this.ctx.createScriptProcessor(1024, 0, 2), this.clearFunction = function () {
      return 0;
    }, this.callback = this.clearFunction;

    this.node.onaudioprocess = function (audioProcessingEvent) {
      var outputBuffer = audioProcessingEvent.outputBuffer;

      var left = outputBuffer.getChannelData(0),
          right = outputBuffer.getChannelData(1);

      for (var sample = 0; sample < left.length; sample++) {
        if (!isStereo) {
          left[sample] = right[sample] = utilities.callback();
        } else {
          var out = utilities.callback();
          left[sample] = out[0];
          right[sample] = out[1];
        }
      }
    };

    this.node.connect(this.ctx.destination);

    //this.node.connect( this.analyzer )

    return this;
  },
  playGraph: function playGraph(graph, debug) {
    var mem = arguments.length <= 2 || arguments[2] === undefined ? 44100 * 10 : arguments[2];

    utilities.clear();
    if (debug === undefined) debug = false;

    isStereo = Array.isArray(graph);

    utilities.callback = gen.createCallback(graph, mem, debug);

    if (utilities.console) utilities.console.setValue(utilities.callback.toString());

    return utilities.callback;
  },
  loadSample: function loadSample(soundFilePath, data) {
    var req = new XMLHttpRequest();
    req.open('GET', soundFilePath, true);
    req.responseType = 'arraybuffer';

    var promise = new Promise(function (resolve, reject) {
      req.onload = function () {
        var audioData = req.response;

        utilities.ctx.decodeAudioData(audioData, function (buffer) {
          data.buffer = buffer.getChannelData(0);
          resolve(data.buffer);
        });
      };
    });

    req.send();

    return promise;
  }
};

utilities.clear.callbacks = [];

module.exports = utilities;
},{"./data.js":17,"./gen.js":27}],68:[function(require,module,exports){
'use strict';

/*
 * adapted from https://github.com/corbanbrook/dsp.js/blob/master/dsp.js
 * starting at line 1427
 * taken 8/15/16
*/

module.exports = {
  bartlett: function bartlett(length, index) {
    return 2 / (length - 1) * ((length - 1) / 2 - Math.abs(index - (length - 1) / 2));
  },
  bartlettHann: function bartlettHann(length, index) {
    return 0.62 - 0.48 * Math.abs(index / (length - 1) - 0.5) - 0.38 * Math.cos(2 * Math.PI * index / (length - 1));
  },
  blackman: function blackman(length, index, alpha) {
    var a0 = (1 - alpha) / 2,
        a1 = 0.5,
        a2 = alpha / 2;

    return a0 - a1 * Math.cos(2 * Math.PI * index / (length - 1)) + a2 * Math.cos(4 * Math.PI * index / (length - 1));
  },
  cosine: function cosine(length, index) {
    return Math.cos(Math.PI * index / (length - 1) - Math.PI / 2);
  },
  gauss: function gauss(length, index, alpha) {
    return Math.pow(Math.E, -0.5 * Math.pow((index - (length - 1) / 2) / (alpha * (length - 1) / 2), 2));
  },
  hamming: function hamming(length, index) {
    return 0.54 - 0.46 * Math.cos(Math.PI * 2 * index / (length - 1));
  },
  hann: function hann(length, index) {
    return 0.5 * (1 - Math.cos(Math.PI * 2 * index / (length - 1)));
  },
  lanczos: function lanczos(length, index) {
    var x = 2 * index / (length - 1) - 1;
    return Math.sin(Math.PI * x) / (Math.PI * x);
  },
  rectangular: function rectangular(length, index) {
    return 1;
  },
  triangular: function triangular(length, index) {
    return 2 / length * (length / 2 - Math.abs(index - (length - 1) / 2));
  },
  exponential: function exponential(length, index, alpha) {
    return Math.pow(index / length, alpha);
  },
  linear: function linear(length, index) {
    return index / length;
  }
};
},{}],69:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    floor = require('./floor.js'),
    sub = require('./sub.js'),
    memo = require('./memo.js');

var proto = {
  basename: 'wrap',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        signal = inputs[0],
        min = inputs[1],
        max = inputs[2],
        out = void 0,
        diff = void 0;

    //out = `(((${inputs[0]} - ${this.min}) % ${diff}  + ${diff}) % ${diff} + ${this.min})`
    //const long numWraps = long((v-lo)/range) - (v < lo);
    //return v - range * double(numWraps);  

    if (this.min === 0) {
      diff = max;
    } else if (isNaN(max) || isNaN(min)) {
      diff = max + ' - ' + min;
    } else {
      diff = max - min;
    }

    out = ' var ' + this.name + ' = ' + inputs[0] + '\n  if( ' + this.name + ' < ' + this.min + ' ) ' + this.name + ' += ' + diff + '\n  else if( ' + this.name + ' > ' + this.max + ' ) ' + this.name + ' -= ' + diff + '\n\n';

    return [this.name, ' ' + out];
  }
};

module.exports = function (in1) {
  var min = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var max = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    uid: _gen.getUID(),
    inputs: [in1, min, max]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./floor.js":24,"./gen.js":27,"./memo.js":39,"./sub.js":62}],70:[function(require,module,exports){
'use strict';

var MemoryHelper = {
  create: function create() {
    var size = arguments.length <= 0 || arguments[0] === undefined ? 4096 : arguments[0];
    var memtype = arguments.length <= 1 || arguments[1] === undefined ? Float32Array : arguments[1];

    var helper = Object.create(this);

    Object.assign(helper, {
      heap: new memtype(size),
      list: {},
      freeList: {}
    });

    return helper;
  },
  alloc: function alloc(size, immutable) {
    var idx = -1;

    if (size > this.heap.length) {
      throw Error('Allocation request is larger than heap size of ' + this.heap.length);
    }

    for (var key in this.freeList) {
      var candidate = this.freeList[key];

      if (candidate.size >= size) {
        idx = key;

        this.list[idx] = { size: size, immutable: immutable, references: 1 };

        if (candidate.size !== size) {
          var newIndex = idx + size,
              newFreeSize = void 0;

          for (var _key in this.list) {
            if (_key > newIndex) {
              newFreeSize = _key - newIndex;
              this.freeList[newIndex] = newFreeSize;
            }
          }
        }

        break;
      }
    }

    if (idx !== -1) delete this.freeList[idx];

    if (idx === -1) {
      var keys = Object.keys(this.list),
          lastIndex = void 0;

      if (keys.length) {
        // if not first allocation...
        lastIndex = parseInt(keys[keys.length - 1]);

        idx = lastIndex + this.list[lastIndex].size;
      } else {
        idx = 0;
      }

      this.list[idx] = { size: size, immutable: immutable, references: 1 };
    }

    if (idx + size >= this.heap.length) {
      throw Error('No available blocks remain sufficient for allocation request.');
    }
    return idx;
  },
  addReference: function addReference(index) {
    if (this.list[index] !== undefined) {
      this.list[index].references++;
    }
  },
  free: function free(index) {
    if (this.list[index] === undefined) {
      throw Error('Calling free() on non-existing block.');
    }

    var slot = this.list[index];
    if (slot === 0) return;
    slot.references--;

    if (slot.references === 0 && slot.immutable !== true) {
      this.list[index] = 0;

      var freeBlockSize = 0;
      for (var key in this.list) {
        if (key > index) {
          freeBlockSize = key - index;
          break;
        }
      }

      this.freeList[index] = freeBlockSize;
    }
  }
};

module.exports = MemoryHelper;

},{}],71:[function(require,module,exports){
/*
 * https://github.com/antimatter15/heapqueue.js/blob/master/heapqueue.js
 *
 * This implementation is very loosely based off js-priority-queue
 * by Adam Hooper from https://github.com/adamhooper/js-priority-queue
 *
 * The js-priority-queue implementation seemed a teensy bit bloated
 * with its require.js dependency and multiple storage strategies
 * when all but one were strongly discouraged. So here is a kind of
 * condensed version of the functionality with only the features that
 * I particularly needed.
 *
 * Using it is pretty simple, you just create an instance of HeapQueue
 * while optionally specifying a comparator as the argument:
 *
 * var heapq = new HeapQueue();
 *
 * var customq = new HeapQueue(function(a, b){
 *   // if b > a, return negative
 *   // means that it spits out the smallest item first
 *   return a - b;
 * });
 *
 * Note that in this case, the default comparator is identical to
 * the comparator which is used explicitly in the second queue.
 *
 * Once you've initialized the heapqueue, you can plop some new
 * elements into the queue with the push method (vaguely reminiscent
 * of typical javascript arays)
 *
 * heapq.push(42);
 * heapq.push("kitten");
 *
 * The push method returns the new number of elements of the queue.
 *
 * You can push anything you'd like onto the queue, so long as your
 * comparator function is capable of handling it. The default
 * comparator is really stupid so it won't be able to handle anything
 * other than an number by default.
 *
 * You can preview the smallest item by using peek.
 *
 * heapq.push(-9999);
 * heapq.peek(); // ==> -9999
 *
 * The useful complement to to the push method is the pop method,
 * which returns the smallest item and then removes it from the
 * queue.
 *
 * heapq.push(1);
 * heapq.push(2);
 * heapq.push(3);
 * heapq.pop(); // ==> 1
 * heapq.pop(); // ==> 2
 * heapq.pop(); // ==> 3
 */
let HeapQueue = function(cmp){
  this.cmp = (cmp || function(a, b){ return a - b; });
  this.length = 0;
  this.data = [];
}
HeapQueue.prototype.peek = function(){
  return this.data[0];
};
HeapQueue.prototype.push = function(value){
  this.data.push(value);

  var pos = this.data.length - 1,
  parent, x;

  while(pos > 0){
    parent = (pos - 1) >>> 1;
    if(this.cmp(this.data[pos], this.data[parent]) < 0){
      x = this.data[parent];
      this.data[parent] = this.data[pos];
      this.data[pos] = x;
      pos = parent;
    }else break;
  }
  return this.length++;
};
HeapQueue.prototype.pop = function(){
  var last_val = this.data.pop(),
  ret = this.data[0];
  if(this.data.length > 0){
    this.data[0] = last_val;
    var pos = 0,
    last = this.data.length - 1,
    left, right, minIndex, x;
    while(1){
      left = (pos << 1) + 1;
      right = left + 1;
      minIndex = pos;
      if(left <= last && this.cmp(this.data[left], this.data[minIndex]) < 0) minIndex = left;
      if(right <= last && this.cmp(this.data[right], this.data[minIndex]) < 0) minIndex = right;
      if(minIndex !== pos){
        x = this.data[minIndex];
        this.data[minIndex] = this.data[pos];
        this.data[pos] = x;
        pos = minIndex;
      }else break;
    }
  } else {
    ret = last_val;
  }
  this.length--;
  return ret;
};

module.exports = HeapQueue

},{}],72:[function(require,module,exports){
let g = require( 'genish.js' )
 
// constructor for schroeder allpass filters
let allPass = function( _input, length=500, feedback=.5 ) {
  let index  = g.counter( 1,0,length ),
      buffer = g.data( length ),
      bufferSample = g.peek( buffer, index, { interp:'none', mode:'samples' }),
      out = g.memo( g.add( g.mul( -1, _input), bufferSample ) )
                
  g.poke( buffer, g.add( _input, g.mul( bufferSample, feedback ) ), index )
 
  return out
}

module.exports = allPass

},{"genish.js":34}],73:[function(require,module,exports){
module.exports = function( Gibberish ) {

  let Binops = {
    export( obj ) {
      for( let key in Binops ) {
        if( key !== 'export' ) {
          obj[ key ] = Binops[ key ]
        }
      }
    },
    
    Add( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'+', inputs:args, ugenName:'add' + id, id }
    },

    Sub( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'-', inputs:args, ugenName:'sub' + id, id }
    },

    Mul( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'*', inputs:args, ugenName:'mul' + id, id }
    },

    Div( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'/', inputs:args, ugenName:'div' + id, id }
    },

    Mod( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'%', inputs:args, ugenName:'mod' + id, id }
    },   
  }

  return Binops
}

},{}],74:[function(require,module,exports){
let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  Gibberish.genish.biquad = ( input, cutoff, Q, mode, isStereo ) => {
    let a0,a1,a2,c,b1,b2,
        in1a0,x1a1,x2a2,y1b1,y2b2,
        in1a0_1,x1a1_1,x2a2_1,y1b1_1,y2b2_1

    let returnValue

    let x1 = ssd(), x2 = ssd(), y1 = ssd(), y2 = ssd()
    
    let w0 = memo( mul( 2 * Math.PI, div( cutoff,  gen.samplerate ) ) ),
        sinw0 = sin( w0 ),
        cosw0 = cos( w0 ),
        alpha = memo( div( sinw0, mul( 2, Q ) ) )

    let oneMinusCosW = sub( 1, cosw0 )

    switch( mode ) {
      case 'HP':
        a0 = memo( div( add( 1, cosw0) , 2) )
        a1 = mul( add( 1, cosw0 ), -1 )
        a2 = a0
        c  = add( 1, alpha )
        b1 = mul( -2 , cosw0 )
        b2 = sub( 1, alpha )
        break;
      case 'BP':
        a0 = mul( Q, alpha )
        a1 = 0
        a2 = mul( a0, -1 )
        c  = add( 1, alpha )
        b1 = mul( -2 , cosw0 )
        b2 = sub( 1, alpha )
        break;
      default: // LP
        a0 = memo( div( oneMinusCosW, 2) )
        a1 = oneMinusCosW
        a2 = a0
        c  = add( 1, alpha )
        b1 = mul( -2 , cosw0 )
        b2 = sub( 1, alpha )
    }

    a0 = div( a0, c ); a1 = div( a1, c ); a2 = div( a2, c )
    b1 = div( b1, c ); b2 = div( b2, c )

    in1a0 = mul( x1.in( isStereo ? input[0] : input ), a0 )
    x1a1  = mul( x2.in( x1.out ), a1 )
    x2a2  = mul( x2.out,          a2 )

    let sumLeft = add( in1a0, x1a1, x2a2 )

    y1b1 = mul( y2.in( y1.out ), b1 )
    y2b2 = mul( y2.out, b2 )

    let sumRight = add( y1b1, y2b2 )

    let diff = sub( sumLeft, sumRight )

    y1.in( diff )

    if( isStereo ) {
      let x1_1 = ssd(), x2_1 = ssd(), y1_1 = ssd(), y2_1 = ssd()

      in1a0_1 = mul( x1_1.in( input[1]    ), a0 )
      x1a1_1  = mul( x2_1.in( x1_1.out ), a1 )
      x2a2_1  = mul( x2_1.out,          a2 )

      let sumLeft_1 = add( in1a0_1, x1a1_1, x2a2_1 )

      y1b1_1 = mul( y2_1.in( y1_1.out ), b1 )
      y2b2_1 = mul( y2_1.out, b2 )

      let sumRight_1 = add( y1b1_1, y2b2_1 )

      let diff_1 = sub( sumLeft_1, sumRight_1 )
      
      returnValue = [ diff, diff_1 ]
    }else{
      returnValue = diff
    }

    return returnValue
  }

  let Biquad = props => {
    let _props = Object.assign( {}, Biquad.defaults, props ) 

    let isStereo = props.input.isStereo

    let filter = Gibberish.factory( 
      Gibberish.genish.biquad( g.in('input'), g.in('cutoff'), g.in('Q'), _props.mode || 'LP', isStereo ), 
      'biquad', 
      _props
    )
    return filter
  }


  Biquad.defaults = {
    input:0,
    Q: .75,
    cutoff:550,
    mode:'LP'
  }

  return Biquad

}


},{"genish.js":34}],75:[function(require,module,exports){
let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Bus = { 
    factory: Gibberish.factory( g.add( 0 ) , 'bus', [ 0, 1 ]  ),

    create() {
      let bus = function() {
        output[ 0 ] = output[ 1 ] = 0

        for( let i = 0, length = arguments.length; i < length; i++ ) {
          let input = arguments[ i ]
          output[ 0 ] += input
          output[ 1 ] += input
        }

        return output
      }

      bus.id = Gibberish.factory.getUID()
      bus.dirty = true
      bus.type = 'bus'
      bus.ugenName = 'bus_' + bus.id
      bus.inputs = []
      bus.inputNames = []

      bus.connect = ( target, level = 1 ) => {
        if( target.isStereo ) {
          throw Error( 'You cannot connect a stereo input to a mono bus.' )
          return
        }

        if( target.inputs )
          target.inputs.push( bus )
        else
          target.input = bus

        Gibberish.dirty( target )
        return bus
      }

      bus.chain = ( target, level = 1 ) => {
        bus.connect( target, level )
        return target
      }

      bus.disconnect = ( ugen ) => {
        let removeIdx = -1
        for( let i = 0; i < bus.inputs.length; i++ ) {
          let input = bus.inputs[ i ]

          if( isNaN( input ) && ugen === input ) {
            removeIdx = i
            break;
          }
        }
        
        if( removeIdx !== -1 ) {
          bus.inputs.splice( removeIdx, 1 )
          Gibberish.dirty( bus )
        }
      }
      
      return bus
    }
  }

  return Bus.create

}


},{"genish.js":34}],76:[function(require,module,exports){
let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Bus2 = { 
    create() {
      let output = new Float32Array( 2 )

      let bus = function() {
        output[ 0 ] = output[ 1 ] = 0

        for( let i = 0, length = arguments.length; i < length; i++ ) {
          let input = arguments[ i ],
              isArray = input instanceof Float32Array

          output[ 0 ] += isArray ? input[ 0 ] : input
          output[ 1 ] += isArray ? input[ 1 ] : input
        }

        return output
      }

      bus.id = Gibberish.factory.getUID()
      bus.dirty = true
      bus.type = 'bus'
      bus.ugenName = 'bus2_' + bus.id
      bus.inputs = []
      bus.inputNames = []

      bus.connect = ( target, level = 1 ) => {
        if( target.inputs )
          target.inputs.push( bus )
        else
          target.input = bus

        Gibberish.dirty( target )
        return bus
      }

      bus.chain = ( target, level = 1 ) => {
        bus.connect( target, level )
        return target
      }

      bus.disconnect = ( ugen ) => {
        let removeIdx = -1
        for( let i = 0; i < bus.inputs.length; i++ ) {
          let input = bus.inputs[ i ]

          if( isNaN( input ) && ugen === input ) {
            removeIdx = i
            break;
          }
        }
        
        if( removeIdx !== -1 ) {
          bus.inputs.splice( removeIdx, 1 )
          Gibberish.dirty( bus )
        }
      }
      
      return bus
    }
  }

  return Bus2.create

}


},{"genish.js":34}],77:[function(require,module,exports){
let g = require( 'genish.js' )

let combFilter = function( _input, combLength, damping=.5*.4, feedbackCoeff=.84 ) {
  let lastSample   = g.history(),
  	  readWriteIdx = g.counter( 1,0,combLength ),
      combBuffer   = g.data( combLength ),
	    out          = g.peek( combBuffer, readWriteIdx, { interp:'none', mode:'samples' }),
      storeInput   = g.memo( g.add( g.mul( out, g.sub( 1, damping)), g.mul( lastSample.out, damping ) ) )
      
  lastSample.in( storeInput )
 
  g.poke( combBuffer, g.add( _input, g.mul( storeInput, feedbackCoeff ) ), readWriteIdx )
 
  return out
}

module.exports = combFilter

},{"genish.js":34}],78:[function(require,module,exports){
let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  Gibberish.genish.filter24 = ( input, rez, cutoff, isLowPass ) => {
    let isStereo = Array.isArray( input ), returnValue

    let polesL = g.data([ 0,0,0,0 ]),
        peekProps = { interp:'none', mode:'simple' }
        rezzL = g.clamp( g.mul( g.peek( polesL, 3, peekProps ), rez ) ),
        pL0 = g.peek( polesL, 0, peekProps ), 
        pL1 = g.peek( polesL, 1, peekProps ), 
        pL2 = g.peek( polesL, 2, peekProps ), 
        pL3 = g.peek( polesL, 3, peekProps ) 

    let outputL = g.sub( isStereo ? input[0] : input, rezzL ) 

    g.poke( polesL, g.add( pL0, g.mul( g.add( g.mul(-1,pL0), outputL ),cutoff )), 0 )
    g.poke( polesL, g.add( pL1, g.mul( g.add( g.mul(-1,pL1), pL0 ), cutoff )), 1 )
    g.poke( polesL, g.add( pL2, g.mul( g.add( g.mul(-1,pL2), pL1 ), cutoff )), 2 )
    g.poke( polesL, g.add( pL3, g.mul( g.add( g.mul(-1,pL3), pL2 ), cutoff )), 3 )
    
    let left = g.switch( isLowPass, pL3, g.sub( outputL, pL3 ) )

    if( isStereo ) {
      let polesR = g.data([ 0,0,0,0 ]),
          rezzR = g.clamp( g.mul( g.peek( polesR, 3, peekProps ), rez ) ),
          outputR = g.sub( input[1], rezzR ),          
          pR0 =  g.peek( polesR, 0, peekProps),
          pR1 =  g.peek( polesR, 1, peekProps),
          pR2 =  g.peek( polesR, 2, peekProps),
          pR3 =  g.peek( polesR, 3, peekProps)

      g.poke( polesR, g.add( pR0, g.mul( g.add( g.mul(-1,pR0), outputR ), cutoff )), 0 )
      g.poke( polesR, g.add( pR1, g.mul( g.add( g.mul(-1,pR1), pR0 ), cutoff )), 1 )
      g.poke( polesR, g.add( pR2, g.mul( g.add( g.mul(-1,pR2), pR1 ), cutoff )), 2 )
      g.poke( polesR, g.add( pR3, g.mul( g.add( g.mul(-1,pR3), pR2 ), cutoff )), 3 )

      let right =g.switch( isLowPass, pR3, g.sub( outputR, pR3 ) )
      returnValue = [left, right]
    }else{
      returnValue = left
    }

    return returnValue
  }

  let Filter24 = props => {
    let filter = Gibberish.factory( 
      Gibberish.genish.filter24( g.in('input'), g.in('resonance'), g.in('cutoff'), g.in('isLowPass') ), 
      'filter24', 
      Object.assign( {}, Filter24.defaults, props ) 
    )
    return filter
  }


  Filter24.defaults = {
    input:0,
    resonance: 3.5,
    cutoff: .1,
    isLowPass:1
  }

  return Filter24

}


},{"genish.js":34}],79:[function(require,module,exports){
let g = require( 'genish.js' ),
    allPass = require( './allpass.js' ),
    combFilter = require( './combfilter.js' )

module.exports = function( Gibberish ) {
 
let tuning = {
  combCount:	  	8,
  combTuning: 		[ 1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617 ],                    
  allPassCount: 	4,
  allPassTuning:	[ 225, 556, 441, 341 ],
  allPassFeedback:0.5,
  fixedGain: 		  0.015,
  scaleDamping: 	0.4,
  scaleRoom: 		  0.28,
  offsetRoom: 	  0.7,
  stereoSpread:   23
}

let Freeverb = props => {
  let isStereo = Array.isArray( props.input )
  
  console.log('isStereo:', isStereo, props.input )

  let combsL = [], combsR = []

  let input = g.in( 'input' ),
      wet1 = g.in( 'wet1'), wet2 = g.in( 'wet2' ),  dry = g.in( 'dry' ), 
      roomSize = g.in( 'roomSize' ), damping = g.in( 'damping' )
  
  let summedInput = isStereo === false ? g.add( input[0], input[1] ) : input,
      attenuatedInput = g.memo( g.mul( summedInput, tuning.fixedGain ) )
  
  // create comb filters in parallel...
  for( let i = 0; i < 8; i++ ) { 
    combsL.push( 
      combFilter( attenuatedInput, tuning.combTuning[i], mul(damping,.4), g.mul( tuning.scaleRoom + tuning.offsetRoom, roomSize ) ) 
    )
    combsR.push( 
      combFilter( attenuatedInput, tuning.combTuning[i] + tuning.stereoSpread, g.mul(damping,.4), g.mul( tuning.scaleRoom + tuning.offsetRoom, roomSize ) ) 
    )
  }
  
  // ... and sum them with attenuated input
  let outL = g.add( attenuatedInput, ...combsL )
  let outR = g.add( attenuatedInput, ...combsR )
  
  // run through allpass filters in series
  for( let i = 0; i < 4; i++ ) { 
    outL = allPass( outL, tuning.allPassTuning[ 0 ] + tuning.stereoSpread )
    outR = allPass( outR, tuning.allPassTuning[ 0 ] + tuning.stereoSpread )
  }
  
  let outputL = g.add( g.mul( outL, wet1 ), g.mul( outR, wet2 ), g.mul( isStereo === false ? input[0] : input, dry ) ),
      outputR = g.add( g.mul( outR, wet1 ), g.mul( outL, wet2 ), g.mul( isStereo === false ? input[1] : input, dry ) )

  let verb = Gibberish.factory( [ outputL, outputR ], 'freeverb', Object.assign({}, Freeverb.defaults, props) )

  return verb
}


Freeverb.defaults = {
  input:0,
  wet1: 1,
  wet2: 0,
  dry: .5,
  roomSize: .84,
  damping:  .5
}

return Freeverb 

}


},{"./allpass.js":72,"./combfilter.js":77,"genish.js":34}],80:[function(require,module,exports){
let MemoryHelper = require( 'memory-helper' ),
    genish       = require( 'genish.js' )
    
let Gibberish = {
  blockCallbacks: [], // called every block
  dirtyUgens: [],
  callbackUgens: [],
  callbackNames: [],
  graphIsDirty: false,
  ugens: {},
  debug: false,

  output: null,

  memory : null, // 20 minutes by default?
  factory: null, 
  genish,
  scheduler: require( './scheduler.js' ),

  init( memAmount ) {
    let numBytes = memAmount === undefined ? 20 * 60 * 44100 : memAmount

    this.memory = MemoryHelper.create( numBytes )
    this.factory = require( './ugenTemplate.js' )( this )

    this.genish.export( window )

    this.PolyTemplate      = require( './polytemplate.js' )( this )
    this.ugens.oscillators = require( './oscillators.js' )( this )
    this.ugens.binops      = require( './binops.js' )( this )
    this.ugens.bus         = require( './bus.js' )( this )
    this.ugens.bus2        = require( './bus2.js' )( this );
    [ this.ugens.synth, this.ugens.polysynth ] = require( './synth.js' )( this );
    [ this.ugens.synth2, this.ugens.polysynth2 ] = require( './synth2.js' )( this );
    //this.ugens.synth2      = require( './synth2.js' )( this )
    //this.ugens.polysynth   = require( './polysynth.js' )( this )
    //this.ugens.polysynth2  = require( './polysynth2.js' )( this )
    [ this.ugens.monosynth, this.ugens.polymono ] = require( './monosynth.js' )( this );
    //this.ugens.polymono    = require( './polymono.js' )( this )
    this.ugens.freeverb    = require( './freeverb.js' )( this );
    this.sequencer         = require( './sequencer.js' )( this );
    [ this.ugens.karplus, this.ugens.polykarplus ]  = require( './karplusstrong.js' )( this );
    //this.ugens.polykarplus = require( './polykarplusstrong.js' )( this )
    this.ugens.filter24    = require( './filter24.js' )( this )
    this.ugens.biquad      = require( './biquad.js'   )( this )
    this.ugens.kick        = require( './kick.js' )( this )
    this.ugens.svf         = require( './svf.js' )( this )
    this.ugens.oscillators.export( this )
    this.ugens.binops.export( this )
    this.Bus  = this.ugens.bus
    this.Bus2 = this.ugens.bus2

    this.output = this.Bus2()
    this.createContext()
    this.createScriptProcessor()
  },

  dirty( ugen ) {
    this.dirtyUgens.push( ugen )
    this.graphIsDirty = true
  },

  clear() {
    this.output.inputs = [0]
    this.output.inputNames.length = 0
    this.dirty( this.output )
  },

  createContext() {
    let AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext
    this.ctx = new AC()
    gen.samplerate = this.ctx.sampleRate

    let start = () => {
      if( typeof AC !== 'undefined' ) {
        if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
          window.removeEventListener( 'touchstart', start )

          if( 'ontouchstart' in document.documentElement ){ // required to start audio under iOS 6
            let mySource = utilities.ctx.createBufferSource()
            mySource.connect( utilities.ctx.destination )
            mySource.noteOn( 0 )
          }
         }
      }
    }

    if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
      window.addEventListener( 'touchstart', start )
    }

    return this
  },

  createScriptProcessor() {
    this.node = this.ctx.createScriptProcessor( 1024, 0, 2 ),
    this.clearFunction = function() { return 0 },
    this.callback = this.clearFunction

    this.node.onaudioprocess = function( audioProcessingEvent ) {
      let gibberish = Gibberish,
          callback  = gibberish.callback,
          outputBuffer = audioProcessingEvent.outputBuffer,
          scheduler = Gibberish.scheduler,
          //objs = gibberish.callbackUgens.slice( 0 ),
          length

      let left = outputBuffer.getChannelData( 0 ),
          right= outputBuffer.getChannelData( 1 )

      let callbacklength = Gibberish.blockCallbacks.length
      
      if( callbacklength !== 0 ) {
        for( let i=0; i< callbacklength; i++ ) {
          Gibberish.blockCallbacks[ i ]()
        }

        // can't just set length to 0 as callbacks might be added during for loop, so splice pre-existing functions
        Gibberish.blockCallbacks.splice( 0, callbacklength )
      }

      for (let sample = 0, length = left.length; sample < length; sample++) {
        scheduler.tick()

        if( gibberish.graphIsDirty ) { 
          callback = gibberish.generateCallback()
          //objs = gibberish.callbackUgens.slice( 0 )
        }
        
        // XXX cant use destructuring, babel makes it something inefficient...
        let out = callback.apply( null, gibberish.callbackUgens )

        left[ sample  ] = out[0]
        right[ sample ] = out[1]
      }
    }

    this.node.connect( this.ctx.destination )

    return this
  }, 

  generateCallback() {
    let uid = 0,
        callbackBody, lastLine

    callbackBody = this.processGraph( this.output )
    lastLine = callbackBody[ callbackBody.length - 1]
    
    callbackBody.push( '\n\treturn ' + lastLine.split( '=' )[0].split( ' ' )[1] )

    if( this.debug ) console.log( 'callback:\n', callbackBody.join('\n') )
    this.callback = Function( ...this.callbackNames, callbackBody.join( '\n' ) )
    this.callback.out = []

    return this.callback 
  },

  processGraph( output ) {
    this.callbackUgens.length = 0
    this.callbackNames.length = 0

    this.callbackUgens.push( output )

    let body = this.processUgen( output )
    this.callbackNames = this.callbackUgens.map( v => v.ugenName )

    this.dirtyUgens.length = 0
    this.graphIsDirty = false

    return body
  },

  processUgen( ugen, block ) {
    if( block === undefined ) block = []

    let dirtyIdx = Gibberish.dirtyUgens.indexOf( ugen )
    
    if( ugen.block === undefined || dirtyIndex !== -1 ) {
  
      let line = `\tvar v_${ugen.id} = ` 
      
      if( !ugen.binop ) line += `${ugen.ugenName}( `

      // must get array so we can keep track of length for comma insertion
      let keys = ugen.binop || ugen.type === 'bus' ? Object.keys( ugen.inputs ) : Object.keys( ugen.inputNames )
      
      for( let i = 0; i < keys.length; i++ ) {
        let key = keys[ i ]
        // binop.inputs is actual values, not just property names
        let input = ugen.binop || ugen.type ==='bus'  ? ugen.inputs[ key ] : ugen[ ugen.inputNames[ key ] ]

        if( typeof input === 'number' ) {
          line += input
        }else{
          if( input === undefined ) {  console.log( key ); continue; }
          Gibberish.processUgen( input, block )

          if( !input.binop ) Gibberish.callbackUgens.push( input )

          line += `v_${input.id}`
        }

        if( i < keys.length - 1 ) {
          line += ugen.binop ? ' ' + ugen.op + ' ' : ', ' 
        }
      }

      line += ugen.binop ? '' : ' )'

      block.push( line )
    }else if( ugen.block ) {
      return ugen.block
    }

    return block
  },
    
}

module.exports = Gibberish

},{"./binops.js":73,"./biquad.js":74,"./bus.js":75,"./bus2.js":76,"./filter24.js":78,"./freeverb.js":79,"./karplusstrong.js":81,"./kick.js":82,"./monosynth.js":83,"./oscillators.js":84,"./polytemplate.js":85,"./scheduler.js":86,"./sequencer.js":87,"./svf.js":88,"./synth.js":89,"./synth2.js":90,"./ugenTemplate.js":91,"genish.js":34,"memory-helper":70}],81:[function(require,module,exports){
let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let KPS = props => {
    let trigger = g.bang(),
        phase = g.accum( 1, trigger, { max:Infinity } ),
        env = g.gtp( g.sub( 1, g.div( phase, 200 ) ), 0 ),
        impulse = g.mul( g.noise(), env ),
        feedback = g.history(),
        frequency = g.in('frequency'),
        delay = g.delay( g.add( impulse, feedback.out ), div( Gibberish.ctx.sampleRate, frequency ), { size:2048 }),
        decayed = g.mul( delay, g.t60( g.mul( g.in('decay'), frequency ) ) ),
        damped =  g.mix( decayed, feedback.out, g.in('damping') ),
        withGain = g.mul( damped, g.in('gain') )

    feedback.in( damped )

    properties = Object.assign( {}, KPS.defaults, props )

    let panner = g.pan( withGain, withGain, g.in( 'pan' ) ),
        syn = Gibberish.factory( [panner.left, panner.right], 'karplus', properties  )

    Object.assign( syn, {
      properties : props,

      env : trigger,
      phase,

      note( freq ) {
        syn.frequency = freq
        syn.env.trigger()
      },

      trigger : env.trigger,

      getPhase() {
        return Gibberish.memory.heap[ phase.memory.value.idx ]
      },

      free() {
        Gibberish.genish.gen.free( [panner.left, panner.right] )
      }
    })
    return syn
  }
  
  KPS.defaults = {
    decay: .97,
    damping:.6,
    gain: 1,
    frequency:220,
    pan: .5
  }

  let envCheckFactory = ( syn,synth ) => {
    let envCheck = ()=> {
      let phase = syn.getPhase(),
          endTime = synth.decay * Gibberish.ctx.sampleRate

      if( phase > endTime ) {
        synth.disconnect( syn )
        syn.isConnected = false
        Gibberish.memory.heap[ syn.phase.memory.value.idx ] = 0 // trigger doesn't seem to reset for some reason
      }else{
        Gibberish.blockCallbacks.push( envCheck )
      }
    }
    return envCheck
  }

  let PolyKPS = Gibberish.PolyTemplate( KPS, ['frequency','decay','damping','pan','gain'], envCheckFactory ) 

  return [ KPS, PolyKPS ]

}

},{"genish.js":34}],82:[function(require,module,exports){
let g = require( 'genish.js' )

module.exports = function( Gibberish ) {
/*
 Gibberish.Kick = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF().callback,
    	lpf = new Gibberish.SVF().callback,
      _decay = .2,
      _tone = .8;
      
  Gibberish.extend(this, {
  	name:		"kick",
    properties:	{ pitch:50, __decay:20, __tone: 1000, amp:2, sr: Gibberish.context.sampleRate },
	
  	callback: function(pitch, decay, tone, amp, sr) {					
  		var out = trigger ? 60 : 0;
			
  		out = bpf( out, pitch, decay, 2, sr );
  		out = lpf( out, tone, .5, 0, sr );
		
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, d, t, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof d === 'number') this.decay = d;
  		if(typeof t === 'number') this.tone = t;
  		if(typeof amp === 'number') this.amp = amp;
		
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();
  
  Object.defineProperties(this, {
    decay :{
      get: function() { return _decay; },
      set: function(val) { _decay = val > 1 ? 1 : val; this.__decay = _decay * 100; }
    },
    tone :{
      get: function() { return _tone; },
      set: function(val) { _tone = val > 1 ? 1 : val; this.__tone = 220 + val * 1400;  }
    },
  });
  
  this.processProperties(arguments);
};
Gibberish.Kick.prototype = Gibberish._oscillator; 
*/
  let Kick = props => {
    let frequency = g.in( 'frequency' ),
        decay = g.in( 'decay' ),
        tone  = g.in( 'tone' ),
        gain  = g.in( 'gain' )

    props = Object.assign( {}, Kick.defaults, props )

    let trigger = g.bang(),
        impulse = mul( trigger, 260),
        bpf = g.biquad( impulse, frequency, decay, 'BP', false ),
        lpf = g.biquad( bpf, tone, .5, 'LP', false ),
        out = mul( lpf, gain )
    
    let kick = Gibberish.factory( out, 'synth', props  )
    
    kick.env = trigger

    kick.note = freq => {
      kick.frequency = freq
      kick.env.trigger()
    }

    kick.trigger = kick.env.trigger

    kick.free = () => {
      Gibberish.genish.gen.free( out )
    }


    return kick
  }
  
  Kick.defaults = {
    gain: 1,
    frequency:65,
    tone: 550,
    decay:10
  }

  return Kick

}

},{"genish.js":34}],83:[function(require,module,exports){
let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Synth = props => {
    let oscs = [], 
        env = g.ad( g.in( 'attack' ), g.in( 'decay' ), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        phase

    props = Object.assign( {}, Synth.defaults, props )

    for( let i = 0; i < 3; i++ ) {
      let osc, freq

      //freq = i === 0 ? frequency : mul( frequency, i + 1 )
      switch( i ) {
        case 1:
          freq = mul( frequency, add( g.in('octave2'), g.in('detune2')  ) )
          break;
        case 2:
          freq = mul( frequency, add( g.in('octave3'), g.in('detune3')  ) )
          break;
        default:
          freq = frequency
      }

      switch( props.waveform ) {
        case 'saw':
          osc = g.phasor( freq )
          break;
        case 'square':
          phase = g.phasor( freq, 0, { min:0 } )
          osc = lt( phase, .5 )
          break;
        case 'sine':
          osc = cycle( freq )
          break;
        case 'pwm':
          phase = g.phasor( freq, 0, { min:0 } )
          osc = lt( phase, g.in( 'pulsewidth' ) )
          break;
      }
      oscs[i] = osc
    }

    let oscSum = add( ...oscs ),
        oscWithGain = g.mul( g.mul( oscSum, env ), g.in( 'gain' ) ),
        isLowPass = g.param( 'lowPass', 1 ),
        filteredOsc = g.filter24( oscWithGain, g.in('resonance'), g.mul( g.in('cutoff'), env ), isLowPass ),
        panner = g.pan( filteredOsc,filteredOsc, g.in( 'pan' ) ),
        syn = Gibberish.factory( [panner.left, panner.right], 'synth', props  )
    
    syn.env = env

    syn.note = freq => {
      syn.frequency = freq
      syn.env.trigger()
    }

    syn.trigger = syn.env.trigger

    syn.free = () => {
      Gibberish.genish.gen.free( [panner.left, panner.right] )
    }

    return syn
  }
  
  Synth.defaults = {
    waveform: 'saw',
    attack: 44100,
    decay: 44100,
    gain: 1,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    octave2:2,
    octave3:4,
    detune2:.01,
    detune3:-.01,
    cutoff: .25,
    resonance:2,
  }

  let PolyMono = Gibberish.PolyTemplate( Synth, 
    ['frequency','attack','decay','cutoff','resonance',
     'octave2','octave3','detune2','detune3','pulsewidth','pan','gain']
  ) 

  return [ Synth, PolyMono ]
}

},{"genish.js":34}],84:[function(require,module,exports){
let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Oscillators = {
    export( obj ) {
      for( let key in Oscillators ) {
        if( key !== 'export' ) {
          obj[ key ] = Oscillators[ key ]
        }
      }
    },

    Sine( props ) {
      props = Object.assign({}, Oscillators.defaults, props )
      return  Gibberish.factory( g.mul( g.cycle( g.in('frequency') ), g.in('gain') ), 'sine', props )
    },
    Noise( props ) {
      return  Gibberish.factory( g.mul( g.noise(), g.in('gain') ), 'noise', { gain: isNaN( props.gain ) ? 1 : props.gain }  )
    },
    Saw( props ) { 
      props = Object.assign({}, Oscillators.defaults, props )
      return Gibberish.factory( g.mul( g.phasor( g.in('frequency') ), g.in('gain' ) ), 'saw', props )
    }
  }

  Oscillators.defaults = {
    frequency: 440,
    gain: 1
  }

  return Oscillators

}


},{"genish.js":34}],85:[function(require,module,exports){
let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let TemplateFactory = ( ugen, propertyList, _envCheck ) => {
    let Template = props => {
      let properties = Object.assign( {}, { isStereo:true }, props )

      let synth = properties.isStereo ? Gibberish.Bus2() : Gibberish.Bus(),
        voices = [],
        voiceCount = 0

      for( let i = 0; i < 16; i++ ) {
        voices[i] = ugen( properties )
        voices[i].isConnected = false
      }

      Object.assign( synth, {
        properties,
        voices,
        isStereo: properties.isStereo,

        note( freq ) {
          let voice = voices[ voiceCount++ % voices.length ]
          Object.assign( voice, synth.properties )

          voice.note( freq )

          if( !voice.isConnected ) {
            voice.connect( this, 1 )
            voice.isConnected = true
          }
          
          let envCheck
          if( _envCheck === undefined ) {
            envCheck = ()=> {
              if( voice.env.isComplete() ) {
                synth.disconnect( voice )
                voice.isConnected = false
              }else{
                Gibberish.blockCallbacks.push( envCheck )
              }
            }
          }else{
            envCheck = _envCheck( voice, synth )
          }

          Gibberish.blockCallbacks.push( envCheck )
        },

        chord( frequencies ) {
          frequencies.forEach( (v) => synth.note(v) )
        },

        free() {
          for( let child of voices ) child.free()
        }
      })
      
      let _propertyList 
      if( properties.isStereo === false ) {
        _propertyList = propertyList.slice( 0 )
        let idx =  _propertyList.indexOf( 'pan' )
        if( idx  > -1 ) _propertyList.splice( idx, 1 )
      }

      TemplateFactory.setupProperties( synth, ugen, properties.isStereo ? propertyList : _propertyList )

      return synth
    }

    return Template
  }

  TemplateFactory.setupProperties = ( synth, ugen, props ) => {
    for( let property of props ) {
      Object.defineProperty( synth, property, {
        get() {
          return synth.properties[ property ] || ugen.defaults[ property ]
        },
        set( v ) {
          synth.properties[ property ] = v
          for( let child of synth.inputs ) {
            child[ property ] = v
          }
        }
      })
    }
  }

  return TemplateFactory

}

},{"genish.js":34}],86:[function(require,module,exports){
const Queue = require( '../external/priorityqueue.js' )
const Big   = require( 'big.js' )

let Scheduler = {
  phase: 0,

  queue: new Queue( ( a, b ) => {
    if( a.time === b.time ) { //a.time.eq( b.time ) ) {
      return b.priority - a.priority
    }else{
      return a.time - b.time //a.time.minus( b.time )
    }
  }),

  add( time, func, priority = 0 ) {
    time += this.phase

    this.queue.push({ time, func, priority })
  },

  tick() {
    if( this.queue.length ) {
      let next = this.queue.peek()

      if( this.phase++ >= next.time ) {
        next.func()
        this.queue.pop()
      }
    }
  },
}

module.exports = Scheduler

},{"../external/priorityqueue.js":71,"big.js":92}],87:[function(require,module,exports){
const Queue = require( '../external/priorityqueue.js' )
const Big   = require( 'big.js' )

module.exports = function( Gibberish ) {

let Sequencer = props => {
  let seq = {
    phase: 0,
    key: props.key || 'note',
    target:  props.target,
    values:  props.values || [ 440 ],
    timings: props.timings|| [ 11025 ],
    valuesPhase:  0,
    timingsPhase: 0,

    tick() {
      let value  = seq.values[  seq.valuesPhase++  % seq.values.length  ],
          timing = seq.timings[ seq.timingsPhase++ % seq.timings.length ]
      
      if( typeof seq.target[ seq.key ] === 'function' ) {
        seq.target[ seq.key ]( value )
      }else{
        seq.target[ seq.key ] = value
      }

      Gibberish.scheduler.add( timing, seq.tick )
    }
  }

  Gibberish.scheduler.add( 0, seq.tick )

  return seq 
}

return Sequencer
}

},{"../external/priorityqueue.js":71,"big.js":92}],88:[function(require,module,exports){
let g = require( 'genish.js' )

module.exports = function( Gibberish ) {
  Gibberish.genish.svf = ( input, cutoff, Q, mode, isStereo ) => {
    let d1 = data([0,0], 1, { meta:true }), d2 = data([0,0], 1, { meta:true }),
        peekProps = { mode:'simple', interp:'none' }
    
    let f1 = memo( g.mul( 2 * Math.PI, div( cutoff, g.gen.samplerate ) ) )
    let oneOverQ = g.memo( div( 1, Q ) )
    let l = g.memo( g.add( d2[0], mul( f1, d1[0] ) ) ),
        h = g.memo( g.sub( g.sub( isStereo ? input[0] : input, l ), g.mul( Q, d1[0] ) ) ),
        b = g.memo( g.add( g.mul( f1, h ), d1[0] ) ),
        n = g.memo( g.add( h, l ) )

    d1[0] = b
    d2[0] = l

    let out = g.selector( mode, l, h, b, n )

    let returnValue
    if( isStereo ) {
      let d12 = data([0,0], 1, { meta:true }), d22 = data([0,0], 1, { meta:true })
      let l2 = g.memo( g.add( d22[0], mul( f1, d12[0] ) ) ),
          h2 = g.memo( g.sub( g.sub( input[1], l2 ), g.mul( Q, d12[0] ) ) ),
          b2 = g.memo( g.add( g.mul( f1, h2 ), d12[0] ) ),
          n2 = g.memo( g.add( h2, l2 ) )

      d12[0] = b2
      d22[0] = l2

      let out2 = g.selector( mode, l2, h2, b2, n2 )

      returnValue = [ out, out2 ]
    }else{
      returnValue = out
    }

    return returnValue
  }

  let SVF = props => {
    let _props = Object.assign( {}, SVF.defaults, props ) 

    let isStereo = props.input.isStereo

    let filter = Gibberish.factory( 
      Gibberish.genish.svf( g.in('input'), g.in('cutoff'), g.in('Q'), g.in('mode'), isStereo ), 
      'svf', 
      _props
    )

    return filter
  }


  SVF.defaults = {
    input:0,
    Q: .75,
    cutoff:550,
    mode:0
  }

  return SVF

}


},{"genish.js":34}],89:[function(require,module,exports){
let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Synth = props => {
    let osc, 
        env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        phase

    props = Object.assign( {}, Synth.defaults, props )

    switch( props.waveform ) {
      case 'saw':
        osc = g.phasor( frequency )
        break;
      case 'square':
        phase = g.phasor( frequency, 0, { min:0 } )
        osc = lt( phase, .5 )
        break;
      case 'sine':
        osc = cycle( frequency )
        break;
      case 'pwm':
        phase = g.phasor( frequency, 0, { min:0 } )
        osc = lt( phase, g.in( 'pulsewidth' ) )
        break;
    }

    let oscWithGain = g.mul( g.mul( osc, env ), g.in( 'gain' ) ),
        panner = g.pan( oscWithGain, oscWithGain, g.in( 'pan' ) ),
        //syn = Gibberish.factory( oscWithGain, 'synth', props  )
        syn = Gibberish.factory( [panner.left, panner.right], 'synth', props  )
    
    syn.env = env

    syn.note = freq => {
      syn.frequency = freq
      syn.env.trigger()
    }

    syn.trigger = syn.env.trigger

    syn.free = () => {
      Gibberish.genish.gen.free( [panner.left, panner.right] )
    }

    syn.isStereo = true

    return syn
  }
  
  Synth.defaults = {
    waveform:'saw',
    attack: 44100,
    decay: 44100,
    gain: 1,
    pulsewidth:.25,
    frequency:220,
    pan: .5
  }

  let PolySynth = Gibberish.PolyTemplate( Synth, ['frequency','attack','decay','pulsewidth','pan','gain'] ) 

  return [ Synth, PolySynth ]

}

},{"genish.js":34}],90:[function(require,module,exports){
let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let Synth2 = props => {
    let osc, 
        env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        phase

    props = Object.assign( {}, Synth2.defaults, props )

    switch( props.waveform ) {
      case 'saw':
        osc = g.phasor( frequency )
        break;
      case 'square':
        phase = g.phasor( frequency, 0, { min:0 } )
        osc = lt( phase, .5 )
        break;
      case 'sine':
        osc = cycle( frequency )
        break;
      case 'pwm':
        phase = g.phasor( frequency, 0, { min:0 } )
        osc = lt( phase, g.in( 'pulsewidth' ) )
        break;
    }

    let oscWithGain = g.mul( g.mul( osc, env ), g.in( 'gain' ) ),
        isLowPass = g.param( 'lowPass', 1 ),
        filteredOsc = g.filter24( oscWithGain, g.in('resonance'), g.mul( g.in('cutoff'), env ), isLowPass ),
        panner = g.pan( filteredOsc, filteredOsc, g.in( 'pan' ) ),
        syn = Gibberish.factory( [panner.left, panner.right], 'synth', props  )
    
    syn.env = env

    syn.note = freq => {
      syn.frequency = freq
      syn.env.trigger()
    }

    syn.trigger = syn.env.trigger

    syn.free = () => {
      Gibberish.genish.gen.free( [panner.left, panner.right] )
    }

    syn.isStereo = true
    
    return syn
  }
  
  Synth2.defaults = {
    waveform:'saw',
    attack: 44100,
    decay: 44100,
    gain: 1,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    cutoff: .35,
    resonance: 3.5
  }

  let PolySynth2 = Gibberish.PolyTemplate( Synth2, ['frequency','attack','decay','pulsewidth','cutoff','resonance','pan','gain'] ) 

  return [ Synth2, PolySynth2 ]

}

},{"genish.js":34}],91:[function(require,module,exports){
module.exports = function( Gibberish ) {

  let uid = 0

  let factory = function( graph, name, values ) {
    let ugen = Gibberish.genish.gen.createCallback( graph, Gibberish.memory )

    Object.assign( ugen, {
      type: 'ugen',
      id: factory.getUID(), 
      ugenName: name + '_',
      graph: graph,
      inputNames: Gibberish.genish.gen.parameters.slice(0),
      dirty: true
    })

    ugen.ugenName += ugen.id

    for( let param of ugen.inputNames ) {
      let value = values[ param ]

      // TODO: do we need to check for a setter?
      let desc = Object.getOwnPropertyDescriptor( ugen, param ),
          setter

      if( desc !== undefined ) {
        setter = desc.set
      }

      Object.defineProperty( ugen, param, {
        get() { return value },
        set( v ) {
          if( value !== v ) {
            Gibberish.dirty( ugen )
            if( setter !== undefined ) setter( v )
            value = v
          }
        }
      })
    }
    
    ugen.connect = ( target,level=1 ) => {
      let input = level === 1 ? ugen : Gibberish.Mul( ugen, level )

      if( target.inputs )
        target.inputs.push( ugen )
      else
        target.input = ugen

      Gibberish.dirty( target )
      
      return ugen
    }

    ugen.chain = (target,level=1) => {
      ugen.connect( target,level )
      return target
    }

    return ugen
  }

  factory.getUID = () => uid++

  return factory
}

},{}],92:[function(require,module,exports){
/* big.js v3.1.3 https://github.com/MikeMcl/big.js/LICENCE */
;(function (global) {
    'use strict';

/*
  big.js v3.1.3
  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
  https://github.com/MikeMcl/big.js/
  Copyright (c) 2014 Michael Mclaughlin <M8ch88l@gmail.com>
  MIT Expat Licence
*/

/***************************** EDITABLE DEFAULTS ******************************/

    // The default values below must be integers within the stated ranges.

    /*
     * The maximum number of decimal places of the results of operations
     * involving division: div and sqrt, and pow with negative exponents.
     */
    var DP = 20,                           // 0 to MAX_DP

        /*
         * The rounding mode used when rounding to the above decimal places.
         *
         * 0 Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
         * 1 To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
         * 2 To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
         * 3 Away from zero.                                  (ROUND_UP)
         */
        RM = 1,                            // 0, 1, 2 or 3

        // The maximum value of DP and Big.DP.
        MAX_DP = 1E6,                      // 0 to 1000000

        // The maximum magnitude of the exponent argument to the pow method.
        MAX_POWER = 1E6,                   // 1 to 1000000

        /*
         * The exponent value at and beneath which toString returns exponential
         * notation.
         * JavaScript's Number type: -7
         * -1000000 is the minimum recommended exponent value of a Big.
         */
        E_NEG = -7,                   // 0 to -1000000

        /*
         * The exponent value at and above which toString returns exponential
         * notation.
         * JavaScript's Number type: 21
         * 1000000 is the maximum recommended exponent value of a Big.
         * (This limit is not enforced or checked.)
         */
        E_POS = 21,                   // 0 to 1000000

/******************************************************************************/

        // The shared prototype object.
        P = {},
        isValid = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        Big;


    /*
     * Create and return a Big constructor.
     *
     */
    function bigFactory() {

        /*
         * The Big constructor and exported function.
         * Create and return a new instance of a Big number object.
         *
         * n {number|string|Big} A numeric value.
         */
        function Big(n) {
            var x = this;

            // Enable constructor usage without new.
            if (!(x instanceof Big)) {
                return n === void 0 ? bigFactory() : new Big(n);
            }

            // Duplicate.
            if (n instanceof Big) {
                x.s = n.s;
                x.e = n.e;
                x.c = n.c.slice();
            } else {
                parse(x, n);
            }

            /*
             * Retain a reference to this Big constructor, and shadow
             * Big.prototype.constructor which points to Object.
             */
            x.constructor = Big;
        }

        Big.prototype = P;
        Big.DP = DP;
        Big.RM = RM;
        Big.E_NEG = E_NEG;
        Big.E_POS = E_POS;

        return Big;
    }


    // Private functions


    /*
     * Return a string representing the value of Big x in normal or exponential
     * notation to dp fixed decimal places or significant digits.
     *
     * x {Big} The Big to format.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * toE {number} 1 (toExponential), 2 (toPrecision) or undefined (toFixed).
     */
    function format(x, dp, toE) {
        var Big = x.constructor,

            // The index (normal notation) of the digit that may be rounded up.
            i = dp - (x = new Big(x)).e,
            c = x.c;

        // Round?
        if (c.length > ++dp) {
            rnd(x, i, Big.RM);
        }

        if (!c[0]) {
            ++i;
        } else if (toE) {
            i = dp;

        // toFixed
        } else {
            c = x.c;

            // Recalculate i as x.e may have changed if value rounded up.
            i = x.e + i + 1;
        }

        // Append zeros?
        for (; c.length < i; c.push(0)) {
        }
        i = x.e;

        /*
         * toPrecision returns exponential notation if the number of
         * significant digits specified is less than the number of digits
         * necessary to represent the integer part of the value in normal
         * notation.
         */
        return toE === 1 || toE && (dp <= i || i <= Big.E_NEG) ?

          // Exponential notation.
          (x.s < 0 && c[0] ? '-' : '') +
            (c.length > 1 ? c[0] + '.' + c.join('').slice(1) : c[0]) +
              (i < 0 ? 'e' : 'e+') + i

          // Normal notation.
          : x.toString();
    }


    /*
     * Parse the number or string value passed to a Big constructor.
     *
     * x {Big} A Big number instance.
     * n {number|string} A numeric value.
     */
    function parse(x, n) {
        var e, i, nL;

        // Minus zero?
        if (n === 0 && 1 / n < 0) {
            n = '-0';

        // Ensure n is string and check validity.
        } else if (!isValid.test(n += '')) {
            throwErr(NaN);
        }

        // Determine sign.
        x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

        // Decimal point?
        if ((e = n.indexOf('.')) > -1) {
            n = n.replace('.', '');
        }

        // Exponential form?
        if ((i = n.search(/e/i)) > 0) {

            // Determine exponent.
            if (e < 0) {
                e = i;
            }
            e += +n.slice(i + 1);
            n = n.substring(0, i);

        } else if (e < 0) {

            // Integer.
            e = n.length;
        }

        // Determine leading zeros.
        for (i = 0; n.charAt(i) == '0'; i++) {
        }

        if (i == (nL = n.length)) {

            // Zero.
            x.c = [ x.e = 0 ];
        } else {

            // Determine trailing zeros.
            for (; n.charAt(--nL) == '0';) {
            }

            x.e = e - i - 1;
            x.c = [];

            // Convert string to array of digits without leading/trailing zeros.
            for (e = 0; i <= nL; x.c[e++] = +n.charAt(i++)) {
            }
        }

        return x;
    }


    /*
     * Round Big x to a maximum of dp decimal places using rounding mode rm.
     * Called by div, sqrt and round.
     *
     * x {Big} The Big to round.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
     * [more] {boolean} Whether the result of division was truncated.
     */
    function rnd(x, dp, rm, more) {
        var u,
            xc = x.c,
            i = x.e + dp + 1;

        if (rm === 1) {

            // xc[i] is the digit after the digit that may be rounded up.
            more = xc[i] >= 5;
        } else if (rm === 2) {
            more = xc[i] > 5 || xc[i] == 5 &&
              (more || i < 0 || xc[i + 1] !== u || xc[i - 1] & 1);
        } else if (rm === 3) {
            more = more || xc[i] !== u || i < 0;
        } else {
            more = false;

            if (rm !== 0) {
                throwErr('!Big.RM!');
            }
        }

        if (i < 1 || !xc[0]) {

            if (more) {

                // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                x.e = -dp;
                x.c = [1];
            } else {

                // Zero.
                x.c = [x.e = 0];
            }
        } else {

            // Remove any digits after the required decimal places.
            xc.length = i--;

            // Round up?
            if (more) {

                // Rounding up may mean the previous digit has to be rounded up.
                for (; ++xc[i] > 9;) {
                    xc[i] = 0;

                    if (!i--) {
                        ++x.e;
                        xc.unshift(1);
                    }
                }
            }

            // Remove trailing zeros.
            for (i = xc.length; !xc[--i]; xc.pop()) {
            }
        }

        return x;
    }


    /*
     * Throw a BigError.
     *
     * message {string} The error message.
     */
    function throwErr(message) {
        var err = new Error(message);
        err.name = 'BigError';

        throw err;
    }


    // Prototype/instance methods


    /*
     * Return a new Big whose value is the absolute value of this Big.
     */
    P.abs = function () {
        var x = new this.constructor(this);
        x.s = 1;

        return x;
    };


    /*
     * Return
     * 1 if the value of this Big is greater than the value of Big y,
     * -1 if the value of this Big is less than the value of Big y, or
     * 0 if they have the same value.
    */
    P.cmp = function (y) {
        var xNeg,
            x = this,
            xc = x.c,
            yc = (y = new x.constructor(y)).c,
            i = x.s,
            j = y.s,
            k = x.e,
            l = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {
            return !xc[0] ? !yc[0] ? 0 : -j : i;
        }

        // Signs differ?
        if (i != j) {
            return i;
        }
        xNeg = i < 0;

        // Compare exponents.
        if (k != l) {
            return k > l ^ xNeg ? 1 : -1;
        }

        i = -1;
        j = (k = xc.length) < (l = yc.length) ? k : l;

        // Compare digit by digit.
        for (; ++i < j;) {

            if (xc[i] != yc[i]) {
                return xc[i] > yc[i] ^ xNeg ? 1 : -1;
            }
        }

        // Compare lengths.
        return k == l ? 0 : k > l ^ xNeg ? 1 : -1;
    };


    /*
     * Return a new Big whose value is the value of this Big divided by the
     * value of Big y, rounded, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     */
    P.div = function (y) {
        var x = this,
            Big = x.constructor,
            // dividend
            dvd = x.c,
            //divisor
            dvs = (y = new Big(y)).c,
            s = x.s == y.s ? 1 : -1,
            dp = Big.DP;

        if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!Big.DP!');
        }

        // Either 0?
        if (!dvd[0] || !dvs[0]) {

            // If both are 0, throw NaN
            if (dvd[0] == dvs[0]) {
                throwErr(NaN);
            }

            // If dvs is 0, throw +-Infinity.
            if (!dvs[0]) {
                throwErr(s / 0);
            }

            // dvd is 0, return +-0.
            return new Big(s * 0);
        }

        var dvsL, dvsT, next, cmp, remI, u,
            dvsZ = dvs.slice(),
            dvdI = dvsL = dvs.length,
            dvdL = dvd.length,
            // remainder
            rem = dvd.slice(0, dvsL),
            remL = rem.length,
            // quotient
            q = y,
            qc = q.c = [],
            qi = 0,
            digits = dp + (q.e = x.e - y.e) + 1;

        q.s = s;
        s = digits < 0 ? 0 : digits;

        // Create version of divisor with leading zero.
        dvsZ.unshift(0);

        // Add zeros to make remainder as long as divisor.
        for (; remL++ < dvsL; rem.push(0)) {
        }

        do {

            // 'next' is how many times the divisor goes into current remainder.
            for (next = 0; next < 10; next++) {

                // Compare divisor and remainder.
                if (dvsL != (remL = rem.length)) {
                    cmp = dvsL > remL ? 1 : -1;
                } else {

                    for (remI = -1, cmp = 0; ++remI < dvsL;) {

                        if (dvs[remI] != rem[remI]) {
                            cmp = dvs[remI] > rem[remI] ? 1 : -1;
                            break;
                        }
                    }
                }

                // If divisor < remainder, subtract divisor from remainder.
                if (cmp < 0) {

                    // Remainder can't be more than 1 digit longer than divisor.
                    // Equalise lengths using divisor with extra leading zero?
                    for (dvsT = remL == dvsL ? dvs : dvsZ; remL;) {

                        if (rem[--remL] < dvsT[remL]) {
                            remI = remL;

                            for (; remI && !rem[--remI]; rem[remI] = 9) {
                            }
                            --rem[remI];
                            rem[remL] += 10;
                        }
                        rem[remL] -= dvsT[remL];
                    }
                    for (; !rem[0]; rem.shift()) {
                    }
                } else {
                    break;
                }
            }

            // Add the 'next' digit to the result array.
            qc[qi++] = cmp ? next : ++next;

            // Update the remainder.
            if (rem[0] && cmp) {
                rem[remL] = dvd[dvdI] || 0;
            } else {
                rem = [ dvd[dvdI] ];
            }

        } while ((dvdI++ < dvdL || rem[0] !== u) && s--);

        // Leading zero? Do not remove if result is simply zero (qi == 1).
        if (!qc[0] && qi != 1) {

            // There can't be more than one zero.
            qc.shift();
            q.e--;
        }

        // Round?
        if (qi > digits) {
            rnd(q, dp, Big.RM, rem[0] !== u);
        }

        return q;
    };


    /*
     * Return true if the value of this Big is equal to the value of Big y,
     * otherwise returns false.
     */
    P.eq = function (y) {
        return !this.cmp(y);
    };


    /*
     * Return true if the value of this Big is greater than the value of Big y,
     * otherwise returns false.
     */
    P.gt = function (y) {
        return this.cmp(y) > 0;
    };


    /*
     * Return true if the value of this Big is greater than or equal to the
     * value of Big y, otherwise returns false.
     */
    P.gte = function (y) {
        return this.cmp(y) > -1;
    };


    /*
     * Return true if the value of this Big is less than the value of Big y,
     * otherwise returns false.
     */
    P.lt = function (y) {
        return this.cmp(y) < 0;
    };


    /*
     * Return true if the value of this Big is less than or equal to the value
     * of Big y, otherwise returns false.
     */
    P.lte = function (y) {
         return this.cmp(y) < 1;
    };


    /*
     * Return a new Big whose value is the value of this Big minus the value
     * of Big y.
     */
    P.sub = P.minus = function (y) {
        var i, j, t, xLTy,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.plus(y);
        }

        var xc = x.c.slice(),
            xe = x.e,
            yc = y.c,
            ye = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
        }

        // Determine which is the bigger number.
        // Prepend zeros to equalise exponents.
        if (a = xe - ye) {

            if (xLTy = a < 0) {
                a = -a;
                t = xc;
            } else {
                ye = xe;
                t = yc;
            }

            t.reverse();
            for (b = a; b--; t.push(0)) {
            }
            t.reverse();
        } else {

            // Exponents equal. Check digit by digit.
            j = ((xLTy = xc.length < yc.length) ? xc : yc).length;

            for (a = b = 0; b < j; b++) {

                if (xc[b] != yc[b]) {
                    xLTy = xc[b] < yc[b];
                    break;
                }
            }
        }

        // x < y? Point xc to the array of the bigger number.
        if (xLTy) {
            t = xc;
            xc = yc;
            yc = t;
            y.s = -y.s;
        }

        /*
         * Append zeros to xc if shorter. No need to add zeros to yc if shorter
         * as subtraction only needs to start at yc.length.
         */
        if (( b = (j = yc.length) - (i = xc.length) ) > 0) {

            for (; b--; xc[i++] = 0) {
            }
        }

        // Subtract yc from xc.
        for (b = i; j > a;){

            if (xc[--j] < yc[j]) {

                for (i = j; i && !xc[--i]; xc[i] = 9) {
                }
                --xc[i];
                xc[j] += 10;
            }
            xc[j] -= yc[j];
        }

        // Remove trailing zeros.
        for (; xc[--b] === 0; xc.pop()) {
        }

        // Remove leading zeros and adjust exponent accordingly.
        for (; xc[0] === 0;) {
            xc.shift();
            --ye;
        }

        if (!xc[0]) {

            // n - n = +0
            y.s = 1;

            // Result must be zero.
            xc = [ye = 0];
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a new Big whose value is the value of this Big modulo the
     * value of Big y.
     */
    P.mod = function (y) {
        var yGTx,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        if (!y.c[0]) {
            throwErr(NaN);
        }

        x.s = y.s = 1;
        yGTx = y.cmp(x) == 1;
        x.s = a;
        y.s = b;

        if (yGTx) {
            return new Big(x);
        }

        a = Big.DP;
        b = Big.RM;
        Big.DP = Big.RM = 0;
        x = x.div(y);
        Big.DP = a;
        Big.RM = b;

        return this.minus( x.times(y) );
    };


    /*
     * Return a new Big whose value is the value of this Big plus the value
     * of Big y.
     */
    P.add = P.plus = function (y) {
        var t,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.minus(y);
        }

        var xe = x.e,
            xc = x.c,
            ye = y.e,
            yc = y.c;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? y : new Big(xc[0] ? x : a * 0);
        }
        xc = xc.slice();

        // Prepend zeros to equalise exponents.
        // Note: Faster to use reverse then do unshifts.
        if (a = xe - ye) {

            if (a > 0) {
                ye = xe;
                t = yc;
            } else {
                a = -a;
                t = xc;
            }

            t.reverse();
            for (; a--; t.push(0)) {
            }
            t.reverse();
        }

        // Point xc to the longer array.
        if (xc.length - yc.length < 0) {
            t = yc;
            yc = xc;
            xc = t;
        }
        a = yc.length;

        /*
         * Only start adding at yc.length - 1 as the further digits of xc can be
         * left as they are.
         */
        for (b = 0; a;) {
            b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;
            xc[a] %= 10;
        }

        // No need to check for zero, as +x + +y != 0 && -x + -y != 0

        if (b) {
            xc.unshift(b);
            ++ye;
        }

         // Remove trailing zeros.
        for (a = xc.length; xc[--a] === 0; xc.pop()) {
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a Big whose value is the value of this Big raised to the power n.
     * If n is negative, round, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     *
     * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
     */
    P.pow = function (n) {
        var x = this,
            one = new x.constructor(1),
            y = one,
            isNeg = n < 0;

        if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) {
            throwErr('!pow!');
        }

        n = isNeg ? -n : n;

        for (;;) {

            if (n & 1) {
                y = y.times(x);
            }
            n >>= 1;

            if (!n) {
                break;
            }
            x = x.times(x);
        }

        return isNeg ? one.div(y) : y;
    };


    /*
     * Return a new Big whose value is the value of this Big rounded to a
     * maximum of dp decimal places using rounding mode rm.
     * If dp is not specified, round to 0 decimal places.
     * If rm is not specified, use Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     * [rm] 0, 1, 2 or 3 (ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_UP)
     */
    P.round = function (dp, rm) {
        var x = this,
            Big = x.constructor;

        if (dp == null) {
            dp = 0;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!round!');
        }
        rnd(x = new Big(x), dp, rm == null ? Big.RM : rm);

        return x;
    };


    /*
     * Return a new Big whose value is the square root of the value of this Big,
     * rounded, if necessary, to a maximum of Big.DP decimal places using
     * rounding mode Big.RM.
     */
    P.sqrt = function () {
        var estimate, r, approx,
            x = this,
            Big = x.constructor,
            xc = x.c,
            i = x.s,
            e = x.e,
            half = new Big('0.5');

        // Zero?
        if (!xc[0]) {
            return new Big(x);
        }

        // If negative, throw NaN.
        if (i < 0) {
            throwErr(NaN);
        }

        // Estimate.
        i = Math.sqrt(x.toString());

        // Math.sqrt underflow/overflow?
        // Pass x to Math.sqrt as integer, then adjust the result exponent.
        if (i === 0 || i === 1 / 0) {
            estimate = xc.join('');

            if (!(estimate.length + e & 1)) {
                estimate += '0';
            }

            r = new Big( Math.sqrt(estimate).toString() );
            r.e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
        } else {
            r = new Big(i.toString());
        }

        i = r.e + (Big.DP += 4);

        // Newton-Raphson iteration.
        do {
            approx = r;
            r = half.times( approx.plus( x.div(approx) ) );
        } while ( approx.c.slice(0, i).join('') !==
                       r.c.slice(0, i).join('') );

        rnd(r, Big.DP -= 4, Big.RM);

        return r;
    };


    /*
     * Return a new Big whose value is the value of this Big times the value of
     * Big y.
     */
    P.mul = P.times = function (y) {
        var c,
            x = this,
            Big = x.constructor,
            xc = x.c,
            yc = (y = new Big(y)).c,
            a = xc.length,
            b = yc.length,
            i = x.e,
            j = y.e;

        // Determine sign of result.
        y.s = x.s == y.s ? 1 : -1;

        // Return signed 0 if either 0.
        if (!xc[0] || !yc[0]) {
            return new Big(y.s * 0);
        }

        // Initialise exponent of result as x.e + y.e.
        y.e = i + j;

        // If array xc has fewer digits than yc, swap xc and yc, and lengths.
        if (a < b) {
            c = xc;
            xc = yc;
            yc = c;
            j = a;
            a = b;
            b = j;
        }

        // Initialise coefficient array of result with zeros.
        for (c = new Array(j = a + b); j--; c[j] = 0) {
        }

        // Multiply.

        // i is initially xc.length.
        for (i = b; i--;) {
            b = 0;

            // a is yc.length.
            for (j = a + i; j > i;) {

                // Current sum of products at this digit position, plus carry.
                b = c[j] + yc[i] * xc[j - i - 1] + b;
                c[j--] = b % 10;

                // carry
                b = b / 10 | 0;
            }
            c[j] = (c[j] + b) % 10;
        }

        // Increment result exponent if there is a final carry.
        if (b) {
            ++y.e;
        }

        // Remove any leading zero.
        if (!c[0]) {
            c.shift();
        }

        // Remove trailing zeros.
        for (i = c.length; !c[--i]; c.pop()) {
        }
        y.c = c;

        return y;
    };


    /*
     * Return a string representing the value of this Big.
     * Return exponential notation if this Big has a positive exponent equal to
     * or greater than Big.E_POS, or a negative exponent equal to or less than
     * Big.E_NEG.
     */
    P.toString = P.valueOf = P.toJSON = function () {
        var x = this,
            Big = x.constructor,
            e = x.e,
            str = x.c.join(''),
            strL = str.length;

        // Exponential notation?
        if (e <= Big.E_NEG || e >= Big.E_POS) {
            str = str.charAt(0) + (strL > 1 ? '.' + str.slice(1) : '') +
              (e < 0 ? 'e' : 'e+') + e;

        // Negative exponent?
        } else if (e < 0) {

            // Prepend zeros.
            for (; ++e; str = '0' + str) {
            }
            str = '0.' + str;

        // Positive exponent?
        } else if (e > 0) {

            if (++e > strL) {

                // Append zeros.
                for (e -= strL; e-- ; str += '0') {
                }
            } else if (e < strL) {
                str = str.slice(0, e) + '.' + str.slice(e);
            }

        // Exponent zero.
        } else if (strL > 1) {
            str = str.charAt(0) + '.' + str.slice(1);
        }

        // Avoid '-0'
        return x.s < 0 && x.c[0] ? '-' + str : str;
    };


    /*
     ***************************************************************************
     * If toExponential, toFixed, toPrecision and format are not required they
     * can safely be commented-out or deleted. No redundant code will be left.
     * format is used only by toExponential, toFixed and toPrecision.
     ***************************************************************************
     */


    /*
     * Return a string representing the value of this Big in exponential
     * notation to dp fixed decimal places and rounded, if necessary, using
     * Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toExponential = function (dp) {

        if (dp == null) {
            dp = this.c.length - 1;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!toExp!');
        }

        return format(this, dp, 1);
    };


    /*
     * Return a string representing the value of this Big in normal notation
     * to dp fixed decimal places and rounded, if necessary, using Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toFixed = function (dp) {
        var str,
            x = this,
            Big = x.constructor,
            neg = Big.E_NEG,
            pos = Big.E_POS;

        // Prevent the possibility of exponential notation.
        Big.E_NEG = -(Big.E_POS = 1 / 0);

        if (dp == null) {
            str = x.toString();
        } else if (dp === ~~dp && dp >= 0 && dp <= MAX_DP) {
            str = format(x, x.e + dp);

            // (-0).toFixed() is '0', but (-0.1).toFixed() is '-0'.
            // (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
            if (x.s < 0 && x.c[0] && str.indexOf('-') < 0) {
        //E.g. -0.5 if rounded to -0 will cause toString to omit the minus sign.
                str = '-' + str;
            }
        }
        Big.E_NEG = neg;
        Big.E_POS = pos;

        if (!str) {
            throwErr('!toFix!');
        }

        return str;
    };


    /*
     * Return a string representing the value of this Big rounded to sd
     * significant digits using Big.RM. Use exponential notation if sd is less
     * than the number of digits necessary to represent the integer part of the
     * value in normal notation.
     *
     * sd {number} Integer, 1 to MAX_DP inclusive.
     */
    P.toPrecision = function (sd) {

        if (sd == null) {
            return this.toString();
        } else if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
            throwErr('!toPre!');
        }

        return format(this, sd - 1, 2);
    };


    // Export


    Big = bigFactory();

    //AMD.
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Big;
        });

    // Node and other CommonJS-like environments that support module.exports.
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = Big;

    //Browser.
    } else {
        global.Big = Big;
    }
})(this);

},{}]},{},[80])(80)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2Ficy5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvYWNjdW0uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2Fjb3MuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2FkLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9hZGQuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2Fkc3IuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2FuZC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvYXNpbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvYXRhbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvYmFuZy5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvYm9vbC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvY2VpbC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvY2xhbXAuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2Nvcy5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvY291bnRlci5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvY3ljbGUuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2RhdGEuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2RjYmxvY2suanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2RlbGF5LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9kZWx0YS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZGl2LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9lbnYuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2VxLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9mbG9vci5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZm9sZC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZ2F0ZS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZ2VuLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9ndC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZ3RlLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9ndHAuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2hpc3RvcnkuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2lmZWxzZWlmLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9pbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvaW5kZXguanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2x0LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9sdGUuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2x0cC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvbWF4LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9tZW1vLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9taW4uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L21peC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvbW9kLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9tc3Rvc2FtcHMuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L210b2YuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L211bC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvbmVxLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9ub2lzZS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvbm90LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9wYW4uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3BhcmFtLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9wZWVrLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9waGFzb3IuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3Bva2UuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3Bvdy5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvcmF0ZS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvcm91bmQuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3NhaC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvc2VsZWN0b3IuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3NpZ24uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3Npbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvc2xpZGUuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3N1Yi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvc3dpdGNoLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC90NjAuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3Rhbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvdHJhaW4uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3V0aWxpdGllcy5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvd2luZG93cy5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvd3JhcC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvbWVtb3J5LWhlbHBlci9pbmRleC50cmFuc3BpbGVkLmpzIiwiZXh0ZXJuYWwvcHJpb3JpdHlxdWV1ZS5qcyIsImpzL2FsbHBhc3MuanMiLCJqcy9iaW5vcHMuanMiLCJqcy9iaXF1YWQuanMiLCJqcy9idXMuanMiLCJqcy9idXMyLmpzIiwianMvY29tYmZpbHRlci5qcyIsImpzL2ZpbHRlcjI0LmpzIiwianMvZnJlZXZlcmIuanMiLCJqcy9pbmRleC5qcyIsImpzL2thcnBsdXNzdHJvbmcuanMiLCJqcy9raWNrLmpzIiwianMvbW9ub3N5bnRoLmpzIiwianMvb3NjaWxsYXRvcnMuanMiLCJqcy9wb2x5dGVtcGxhdGUuanMiLCJqcy9zY2hlZHVsZXIuanMiLCJqcy9zZXF1ZW5jZXIuanMiLCJqcy9zdmYuanMiLCJqcy9zeW50aC5qcyIsImpzL3N5bnRoMi5qcyIsImpzL3VnZW5UZW1wbGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iaWcuanMvYmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdhYnMnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCBNYXRoLmFicykpO1xuXG4gICAgICBvdXQgPSAnZ2VuLmFicyggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYWJzKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgYWJzID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgYWJzLmlucHV0cyA9IFt4XTtcblxuICByZXR1cm4gYWJzO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2FjY3VtJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgY29kZSA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keSA9IHZvaWQgMDtcblxuICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSk7XG5cbiAgICBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF0gPSB0aGlzLmluaXRpYWxWYWx1ZTtcblxuICAgIGZ1bmN0aW9uQm9keSA9IHRoaXMuY2FsbGJhY2soZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sICdtZW1vcnlbJyArIHRoaXMubWVtb3J5LnZhbHVlLmlkeCArICddJyk7XG5cbiAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sIHRoaXMubmFtZSwgdGhpcykpO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJztcblxuICAgIHJldHVybiBbdGhpcy5uYW1lICsgJ192YWx1ZScsIGZ1bmN0aW9uQm9keV07XG4gIH0sXG4gIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhfbmFtZSwgX2luY3IsIF9yZXNldCwgdmFsdWVSZWYpIHtcbiAgICB2YXIgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJyc7XG5cbiAgICAvKiB0aHJlZSBkaWZmZXJlbnQgbWV0aG9kcyBvZiB3cmFwcGluZywgdGhpcmQgaXMgbW9zdCBleHBlbnNpdmU6XG4gICAgICpcbiAgICAgKiAxOiByYW5nZSB7MCwxfTogeSA9IHggLSAoeCB8IDApXG4gICAgICogMjogbG9nMih0aGlzLm1heCkgPT0gaW50ZWdlcjogeSA9IHggJiAodGhpcy5tYXggLSAxKVxuICAgICAqIDM6IGFsbCBvdGhlcnM6IGlmKCB4ID49IHRoaXMubWF4ICkgeSA9IHRoaXMubWF4IC14XG4gICAgICpcbiAgICAgKi9cblxuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiAoISh0eXBlb2YgdGhpcy5pbnB1dHNbMV0gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzFdIDwgMSkpIHtcbiAgICAgIG91dCArPSAnICBpZiggJyArIF9yZXNldCArICcgPj0xICkgJyArIHZhbHVlUmVmICsgJyA9ICcgKyB0aGlzLm1pbiArICdcXG5cXG4nO1xuICAgIH1cblxuICAgIG91dCArPSAnICB2YXIgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgdmFsdWVSZWYgKyAnO1xcbiAgJyArIHZhbHVlUmVmICsgJyArPSAnICsgX2luY3IgKyAnXFxuJzsgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgXG5cbiAgICBpZiAodGhpcy5tYXggIT09IEluZmluaXR5ICYmIHRoaXMuc2hvdWxkV3JhcCkgd3JhcCArPSAnICBpZiggJyArIHZhbHVlUmVmICsgJyA+PSAnICsgdGhpcy5tYXggKyAnICkgJyArIHZhbHVlUmVmICsgJyAtPSAnICsgZGlmZiArICdcXG4nO1xuICAgIGlmICh0aGlzLm1pbiAhPT0gLUluZmluaXR5ICYmIHRoaXMuc2hvdWxkV3JhcCkgd3JhcCArPSAnICBpZiggJyArIHZhbHVlUmVmICsgJyA8ICcgKyB0aGlzLm1pbiArICcgKSAnICsgdmFsdWVSZWYgKyAnICs9ICcgKyBkaWZmICsgJ1xcblxcbic7XG5cbiAgICAvL2lmKCB0aGlzLm1pbiA9PT0gMCAmJiB0aGlzLm1heCA9PT0gMSApIHtcbiAgICAvLyAgd3JhcCA9ICBgICAke3ZhbHVlUmVmfSA9ICR7dmFsdWVSZWZ9IC0gKCR7dmFsdWVSZWZ9IHwgMClcXG5cXG5gXG4gICAgLy99IGVsc2UgaWYoIHRoaXMubWluID09PSAwICYmICggTWF0aC5sb2cyKCB0aGlzLm1heCApIHwgMCApID09PSBNYXRoLmxvZzIoIHRoaXMubWF4ICkgKSB7XG4gICAgLy8gIHdyYXAgPSAgYCAgJHt2YWx1ZVJlZn0gPSAke3ZhbHVlUmVmfSAmICgke3RoaXMubWF4fSAtIDEpXFxuXFxuYFxuICAgIC8vfSBlbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgKXtcbiAgICAvLyAgd3JhcCA9IGAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSApICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cXG5cXG5gXG4gICAgLy99XG5cbiAgICBvdXQgPSBvdXQgKyB3cmFwO1xuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5jcikge1xuICB2YXIgcmVzZXQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAwIDogYXJndW1lbnRzWzFdO1xuICB2YXIgcHJvcGVydGllcyA9IGFyZ3VtZW50c1syXTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgZGVmYXVsdHMgPSB7IG1pbjogMCwgbWF4OiAxLCBzaG91bGRXcmFwOiB0cnVlIH07XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgcHJvcGVydGllcyk7XG5cbiAgaWYgKGRlZmF1bHRzLmluaXRpYWxWYWx1ZSA9PT0gdW5kZWZpbmVkKSBkZWZhdWx0cy5pbml0aWFsVmFsdWUgPSBkZWZhdWx0cy5taW47XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgbWluOiBkZWZhdWx0cy5taW4sXG4gICAgbWF4OiBkZWZhdWx0cy5tYXgsXG4gICAgaW5pdGlhbDogZGVmYXVsdHMuaW5pdGlhbFZhbHVlLFxuICAgIHZhbHVlOiBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luY3IsIHJlc2V0XSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIHZhbHVlOiB7IGxlbmd0aDogMSwgaWR4OiBudWxsIH1cbiAgICB9XG4gIH0sIGRlZmF1bHRzKTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdhY29zJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICdhY29zJzogTWF0aC5hY29zIH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLmFjb3MoICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFjb3MocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBhY29zID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgYWNvcy5pbnB1dHMgPSBbeF07XG4gIGFjb3MuaWQgPSBfZ2VuLmdldFVJRCgpO1xuICBhY29zLm5hbWUgPSBhY29zLmJhc2VuYW1lICsgJ3thY29zLmlkfSc7XG5cbiAgcmV0dXJuIGFjb3M7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIGRpdiA9IHJlcXVpcmUoJy4vZGl2LmpzJyksXG4gICAgZGF0YSA9IHJlcXVpcmUoJy4vZGF0YS5qcycpLFxuICAgIHBlZWsgPSByZXF1aXJlKCcuL3BlZWsuanMnKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoJy4vYWNjdW0uanMnKSxcbiAgICBpZmVsc2UgPSByZXF1aXJlKCcuL2lmZWxzZWlmLmpzJyksXG4gICAgbHQgPSByZXF1aXJlKCcuL2x0LmpzJyksXG4gICAgYmFuZyA9IHJlcXVpcmUoJy4vYmFuZy5qcycpLFxuICAgIGVudiA9IHJlcXVpcmUoJy4vZW52LmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBwb2tlID0gcmVxdWlyZSgnLi9wb2tlLmpzJyksXG4gICAgbmVxID0gcmVxdWlyZSgnLi9uZXEuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhdHRhY2tUaW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gNDQxMDAgOiBhcmd1bWVudHNbMF07XG4gIHZhciBkZWNheVRpbWUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyA0NDEwMCA6IGFyZ3VtZW50c1sxXTtcbiAgdmFyIF9wcm9wcyA9IGFyZ3VtZW50c1syXTtcblxuICB2YXIgX2JhbmcgPSBiYW5nKCksXG4gICAgICBwaGFzZSA9IGFjY3VtKDEsIF9iYW5nLCB7IG1heDogSW5maW5pdHksIHNob3VsZFdyYXA6IGZhbHNlLCBpbml0aWFsVmFsdWU6IC1JbmZpbml0eSB9KSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBzaGFwZTogJ2V4cG9uZW50aWFsJywgYWxwaGE6IDUgfSwgX3Byb3BzKSxcbiAgICAgIGJ1ZmZlckRhdGEgPSB2b2lkIDAsXG4gICAgICBkZWNheURhdGEgPSB2b2lkIDAsXG4gICAgICBvdXQgPSB2b2lkIDAsXG4gICAgICBidWZmZXIgPSB2b2lkIDA7XG5cbiAgLy9jb25zb2xlLmxvZyggJ2F0dGFjayB0aW1lOicsIGF0dGFja1RpbWUsICdkZWNheSB0aW1lOicsIGRlY2F5VGltZSApXG4gIHZhciBjb21wbGV0ZUZsYWcgPSBkYXRhKFswXSk7XG5cbiAgLy8gc2xpZ2h0bHkgbW9yZSBlZmZpY2llbnQgdG8gdXNlIGV4aXN0aW5nIHBoYXNlIGFjY3VtdWxhdG9yIGZvciBsaW5lYXIgZW52ZWxvcGVzXG4gIGlmIChwcm9wcy5zaGFwZSA9PT0gJ2xpbmVhcicpIHtcbiAgICBvdXQgPSBpZmVsc2UoYW5kKGd0ZShwaGFzZSwgMCksIGx0KHBoYXNlLCBhdHRhY2tUaW1lKSksIG1lbW8oZGl2KHBoYXNlLCBhdHRhY2tUaW1lKSksIGFuZChndGUocGhhc2UsIDApLCBsdChwaGFzZSwgYWRkKGF0dGFja1RpbWUsIGRlY2F5VGltZSkpKSwgc3ViKDEsIGRpdihzdWIocGhhc2UsIGF0dGFja1RpbWUpLCBkZWNheVRpbWUpKSwgbmVxKHBoYXNlLCAtSW5maW5pdHkpLCBwb2tlKGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6IDAgfSksIDApO1xuICB9IGVsc2Uge1xuICAgIGJ1ZmZlckRhdGEgPSBlbnYoMTAyNCwgeyB0eXBlOiBwcm9wcy5zaGFwZSwgYWxwaGE6IHByb3BzLmFscGhhIH0pO1xuICAgIG91dCA9IGlmZWxzZShhbmQoZ3RlKHBoYXNlLCAwKSwgbHQocGhhc2UsIGF0dGFja1RpbWUpKSwgcGVlayhidWZmZXJEYXRhLCBkaXYocGhhc2UsIGF0dGFja1RpbWUpLCB7IGJvdW5kbW9kZTogJ2NsYW1wJyB9KSwgYW5kKGd0ZShwaGFzZSwgMCksIGx0KHBoYXNlLCBhZGQoYXR0YWNrVGltZSwgZGVjYXlUaW1lKSkpLCBwZWVrKGJ1ZmZlckRhdGEsIHN1YigxLCBkaXYoc3ViKHBoYXNlLCBhdHRhY2tUaW1lKSwgZGVjYXlUaW1lKSksIHsgYm91bmRtb2RlOiAnY2xhbXAnIH0pLCBuZXEocGhhc2UsIC1JbmZpbml0eSksIHBva2UoY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTogMCB9KSwgMCk7XG4gIH1cblxuICBvdXQuaXNDb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwW2NvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeF07XG4gIH07XG5cbiAgb3V0LnRyaWdnZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgZ2VuLm1lbW9yeS5oZWFwW2NvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeF0gPSAwO1xuICAgIF9iYW5nLnRyaWdnZXIoKTtcbiAgfTtcblxuICByZXR1cm4gb3V0O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciBhZGQgPSB7XG4gICAgaWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgICAgb3V0ID0gJygnLFxuICAgICAgICAgIHN1bSA9IDAsXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGFkZGVyQXRFbmQgPSBmYWxzZSxcbiAgICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IHRydWU7XG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICAgIGlmIChpc05hTih2KSkge1xuICAgICAgICAgIG91dCArPSB2O1xuICAgICAgICAgIGlmIChpIDwgaW5wdXRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGFkZGVyQXRFbmQgPSB0cnVlO1xuICAgICAgICAgICAgb3V0ICs9ICcgKyAnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1bSArPSBwYXJzZUZsb2F0KHYpO1xuICAgICAgICAgIG51bUNvdW50Kys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoYWxyZWFkeUZ1bGxTdW1tZWQpIG91dCA9ICcnO1xuXG4gICAgICBpZiAobnVtQ291bnQgPiAwKSB7XG4gICAgICAgIG91dCArPSBhZGRlckF0RW5kIHx8IGFscmVhZHlGdWxsU3VtbWVkID8gc3VtIDogJyArICcgKyBzdW07XG4gICAgICB9XG5cbiAgICAgIGlmICghYWxyZWFkeUZ1bGxTdW1tZWQpIG91dCArPSAnKSc7XG5cbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBhZGQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIGRpdiA9IHJlcXVpcmUoJy4vZGl2LmpzJyksXG4gICAgZGF0YSA9IHJlcXVpcmUoJy4vZGF0YS5qcycpLFxuICAgIHBlZWsgPSByZXF1aXJlKCcuL3BlZWsuanMnKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoJy4vYWNjdW0uanMnKSxcbiAgICBpZmVsc2UgPSByZXF1aXJlKCcuL2lmZWxzZWlmLmpzJyksXG4gICAgbHQgPSByZXF1aXJlKCcuL2x0LmpzJyksXG4gICAgYmFuZyA9IHJlcXVpcmUoJy4vYmFuZy5qcycpLFxuICAgIGVudiA9IHJlcXVpcmUoJy4vZW52LmpzJyksXG4gICAgcGFyYW0gPSByZXF1aXJlKCcuL3BhcmFtLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYXR0YWNrVGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDQ0IDogYXJndW1lbnRzWzBdO1xuICB2YXIgZGVjYXlUaW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMjIwNTAgOiBhcmd1bWVudHNbMV07XG4gIHZhciBzdXN0YWluVGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IDQ0MTAwIDogYXJndW1lbnRzWzJdO1xuICB2YXIgc3VzdGFpbkxldmVsID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8gLjYgOiBhcmd1bWVudHNbM107XG4gIHZhciByZWxlYXNlVGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gNCB8fCBhcmd1bWVudHNbNF0gPT09IHVuZGVmaW5lZCA/IDQ0MTAwIDogYXJndW1lbnRzWzRdO1xuICB2YXIgX3Byb3BzID0gYXJndW1lbnRzWzVdO1xuXG4gIHZhciBlbnZUcmlnZ2VyID0gYmFuZygpLFxuICAgICAgcGhhc2UgPSBhY2N1bSgxLCBlbnZUcmlnZ2VyLCB7IG1heDogSW5maW5pdHksIHNob3VsZFdyYXA6IGZhbHNlIH0pLFxuICAgICAgc2hvdWxkU3VzdGFpbiA9IHBhcmFtKDEpLFxuICAgICAgZGVmYXVsdHMgPSB7XG4gICAgc2hhcGU6ICdleHBvbmVudGlhbCcsXG4gICAgYWxwaGE6IDUsXG4gICAgdHJpZ2dlclJlbGVhc2U6IGZhbHNlXG4gIH0sXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBfcHJvcHMpLFxuICAgICAgYnVmZmVyRGF0YSA9IHZvaWQgMCxcbiAgICAgIGRlY2F5RGF0YSA9IHZvaWQgMCxcbiAgICAgIG91dCA9IHZvaWQgMCxcbiAgICAgIGJ1ZmZlciA9IHZvaWQgMCxcbiAgICAgIHN1c3RhaW5Db25kaXRpb24gPSB2b2lkIDAsXG4gICAgICByZWxlYXNlQWNjdW0gPSB2b2lkIDAsXG4gICAgICByZWxlYXNlQ29uZGl0aW9uID0gdm9pZCAwO1xuXG4gIC8vIHNsaWdodGx5IG1vcmUgZWZmaWNpZW50IHRvIHVzZSBleGlzdGluZyBwaGFzZSBhY2N1bXVsYXRvciBmb3IgbGluZWFyIGVudmVsb3Blc1xuICAvL2lmKCBwcm9wcy5zaGFwZSA9PT0gJ2xpbmVhcicgKSB7XG4gIC8vICBvdXQgPSBpZmVsc2UoXG4gIC8vICAgIGx0KCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSApLCBtZW1vKCBkaXYoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICkgKSxcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICsgcHJvcHMuZGVjYXlUaW1lICksIHN1YiggMSwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKSwgcHJvcHMuZGVjYXlUaW1lICksIDEtcHJvcHMuc3VzdGFpbkxldmVsICkgKSxcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICsgcHJvcHMuZGVjYXlUaW1lICsgcHJvcHMuc3VzdGFpblRpbWUgKSxcbiAgLy8gICAgICBwcm9wcy5zdXN0YWluTGV2ZWwsXG4gIC8vICAgIGx0KCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSArIHByb3BzLmRlY2F5VGltZSArIHByb3BzLnN1c3RhaW5UaW1lICsgcHJvcHMucmVsZWFzZVRpbWUgKSxcbiAgLy8gICAgICBzdWIoIHByb3BzLnN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKyBwcm9wcy5kZWNheVRpbWUgKyBwcm9wcy5zdXN0YWluVGltZSApLCBwcm9wcy5yZWxlYXNlVGltZSApLCBwcm9wcy5zdXN0YWluTGV2ZWwpICksXG4gIC8vICAgIDBcbiAgLy8gIClcbiAgLy99IGVsc2UgeyAgICBcbiAgYnVmZmVyRGF0YSA9IGVudigxMDI0LCB7IHR5cGU6IHByb3BzLnNoYXBlLCBhbHBoYTogcHJvcHMuYWxwaGEgfSk7XG5cbiAgc3VzdGFpbkNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlID8gc2hvdWxkU3VzdGFpbiA6IGx0KHBoYXNlLCBhdHRhY2tUaW1lICsgZGVjYXlUaW1lICsgc3VzdGFpblRpbWUpO1xuXG4gIHJlbGVhc2VBY2N1bSA9IHByb3BzLnRyaWdnZXJSZWxlYXNlID8gZ3RwKHN1YihzdXN0YWluTGV2ZWwsIGFjY3VtKHN1c3RhaW5MZXZlbCAvIHJlbGVhc2VUaW1lLCAwLCB7IHNob3VsZFdyYXA6IGZhbHNlIH0pKSwgMCkgOiBzdWIoc3VzdGFpbkxldmVsLCBtdWwoZGl2KHN1YihwaGFzZSwgYXR0YWNrVGltZSArIGRlY2F5VGltZSArIHN1c3RhaW5UaW1lKSwgcmVsZWFzZVRpbWUpLCBzdXN0YWluTGV2ZWwpKSwgcmVsZWFzZUNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlID8gbm90KHNob3VsZFN1c3RhaW4pIDogbHQocGhhc2UsIGF0dGFja1RpbWUgKyBkZWNheVRpbWUgKyBzdXN0YWluVGltZSArIHJlbGVhc2VUaW1lKTtcblxuICBvdXQgPSBpZmVsc2UoXG4gIC8vIGF0dGFja1xuICBsdChwaGFzZSwgYXR0YWNrVGltZSksIHBlZWsoYnVmZmVyRGF0YSwgZGl2KHBoYXNlLCBhdHRhY2tUaW1lKSwgeyBib3VuZG1vZGU6ICdjbGFtcCcgfSksXG5cbiAgLy8gZGVjYXlcbiAgbHQocGhhc2UsIGF0dGFja1RpbWUgKyBkZWNheVRpbWUpLCBwZWVrKGJ1ZmZlckRhdGEsIHN1YigxLCBtdWwoZGl2KHN1YihwaGFzZSwgYXR0YWNrVGltZSksIGRlY2F5VGltZSksIHN1YigxLCBzdXN0YWluTGV2ZWwpKSksIHsgYm91bmRtb2RlOiAnY2xhbXAnIH0pLFxuXG4gIC8vIHN1c3RhaW5cbiAgc3VzdGFpbkNvbmRpdGlvbiwgcGVlayhidWZmZXJEYXRhLCBzdXN0YWluTGV2ZWwpLFxuXG4gIC8vIHJlbGVhc2VcbiAgcmVsZWFzZUNvbmRpdGlvbiwgLy9sdCggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSArICByZWxlYXNlVGltZSApLFxuICBwZWVrKGJ1ZmZlckRhdGEsIHJlbGVhc2VBY2N1bSxcbiAgLy9zdWIoICBzdXN0YWluTGV2ZWwsIG11bCggZGl2KCBzdWIoIHBoYXNlLCAgYXR0YWNrVGltZSArICBkZWNheVRpbWUgKyAgc3VzdGFpblRpbWUpLCAgcmVsZWFzZVRpbWUgKSwgIHN1c3RhaW5MZXZlbCApICksXG4gIHsgYm91bmRtb2RlOiAnY2xhbXAnIH0pLCAwKTtcbiAgLy99XG5cbiAgb3V0LnRyaWdnZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgc2hvdWxkU3VzdGFpbi52YWx1ZSA9IDE7XG4gICAgZW52VHJpZ2dlci50cmlnZ2VyKCk7XG4gIH07XG5cbiAgb3V0LnJlbGVhc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgc2hvdWxkU3VzdGFpbi52YWx1ZSA9IDA7XG4gICAgLy8gWFhYIHByZXR0eSBuYXN0eS4uLiBncmFicyBhY2N1bSBpbnNpZGUgb2YgZ3RwIGFuZCByZXNldHMgdmFsdWUgbWFudWFsbHlcbiAgICAvLyB1bmZvcnR1bmF0ZWx5IGVudlRyaWdnZXIgd29uJ3Qgd29yayBhcyBpdCdzIGJhY2sgdG8gMCBieSB0aGUgdGltZSB0aGUgcmVsZWFzZSBibG9jayBpcyB0cmlnZ2VyZWQuLi5cbiAgICBnZW4ubWVtb3J5LmhlYXBbcmVsZWFzZUFjY3VtLmlucHV0c1swXS5pbnB1dHNbMV0ubWVtb3J5LnZhbHVlLmlkeF0gPSAwO1xuICB9O1xuXG4gIHJldHVybiBvdXQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnYW5kJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICcgKyBpbnB1dHNbMF0gKyAnICE9PSAwICYmICcgKyBpbnB1dHNbMV0gKyAnICE9PSAwIHwgMFxcblxcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9ICcnICsgdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFsnJyArIHRoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xLCBpbjIpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMSwgaW4yXVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdhc2luJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICdhc2luJzogTWF0aC5hc2luIH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLmFzaW4oICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFzaW4ocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBhc2luID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgYXNpbi5pbnB1dHMgPSBbeF07XG4gIGFzaW4uaWQgPSBfZ2VuLmdldFVJRCgpO1xuICBhc2luLm5hbWUgPSBhc2luLmJhc2VuYW1lICsgJ3thc2luLmlkfSc7XG5cbiAgcmV0dXJuIGFzaW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnYXRhbicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoeyAnYXRhbic6IE1hdGguYXRhbiB9KTtcblxuICAgICAgb3V0ID0gJ2dlbi5hdGFuKCAnICsgaW5wdXRzWzBdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hdGFuKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgYXRhbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGF0YW4uaW5wdXRzID0gW3hdO1xuICBhdGFuLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgYXRhbi5uYW1lID0gYXRhbi5iYXNlbmFtZSArICd7YXRhbi5pZH0nO1xuXG4gIHJldHVybiBhdGFuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICBfZ2VuLnJlcXVlc3RNZW1vcnkodGhpcy5tZW1vcnkpO1xuXG4gICAgdmFyIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9IG1lbW9yeVsnICsgdGhpcy5tZW1vcnkudmFsdWUuaWR4ICsgJ11cXG4gIGlmKCAnICsgdGhpcy5uYW1lICsgJyA9PT0gMSApIG1lbW9yeVsnICsgdGhpcy5tZW1vcnkudmFsdWUuaWR4ICsgJ10gPSAwICAgICAgXFxuICAgICAgXFxuJztcbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChfcHJvcHMpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBtaW46IDAsIG1heDogMSB9LCBfcHJvcHMpO1xuXG4gIHVnZW4ubmFtZSA9ICdiYW5nJyArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgdWdlbi5taW4gPSBwcm9wcy5taW47XG4gIHVnZW4ubWF4ID0gcHJvcHMubWF4O1xuXG4gIHVnZW4udHJpZ2dlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBfZ2VuLm1lbW9yeS5oZWFwW3VnZW4ubWVtb3J5LnZhbHVlLmlkeF0gPSB1Z2VuLm1heDtcbiAgfTtcblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9XG4gIH07XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnYm9vbCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBvdXQgPSBpbnB1dHNbMF0gKyAnID09PSAwID8gMCA6IDEnO1xuXG4gICAgLy9nZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YFxuXG4gICAgLy9yZXR1cm4gWyBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YCwgJyAnICtvdXQgXVxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSkge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjFdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnY2VpbCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIE1hdGguY2VpbCkpO1xuXG4gICAgICBvdXQgPSAnZ2VuLmNlaWwoICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmNlaWwocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBjZWlsID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgY2VpbC5pbnB1dHMgPSBbeF07XG5cbiAgcmV0dXJuIGNlaWw7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yID0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnY2xpcCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGNvZGUgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBvdXQgPSAnIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICcgKyBpbnB1dHNbMF0gKyAnXFxuICBpZiggJyArIHRoaXMubmFtZSArICcgPiAnICsgaW5wdXRzWzJdICsgJyApICcgKyB0aGlzLm5hbWUgKyAnID0gJyArIGlucHV0c1syXSArICdcXG4gIGVsc2UgaWYoICcgKyB0aGlzLm5hbWUgKyAnIDwgJyArIGlucHV0c1sxXSArICcgKSAnICsgdGhpcy5uYW1lICsgJyA9ICcgKyBpbnB1dHNbMV0gKyAnXFxuJztcbiAgICBvdXQgPSAnICcgKyBvdXQ7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgdmFyIG1pbiA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IC0xIDogYXJndW1lbnRzWzFdO1xuICB2YXIgbWF4ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gMSA6IGFyZ3VtZW50c1syXTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG1pbjogbWluLFxuICAgIG1heDogbWF4LFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjEsIG1pbiwgbWF4XVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdjb3MnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKHsgJ2Nvcyc6IE1hdGguY29zIH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLmNvcyggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY29zKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgY29zID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgY29zLmlucHV0cyA9IFt4XTtcbiAgY29zLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgY29zLm5hbWUgPSBjb3MuYmFzZW5hbWUgKyAne2Nvcy5pZH0nO1xuXG4gIHJldHVybiBjb3M7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnY291bnRlcicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGNvZGUgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHkgPSB2b2lkIDA7XG5cbiAgICBpZiAodGhpcy5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsKSBfZ2VuLnJlcXVlc3RNZW1vcnkodGhpcy5tZW1vcnkpO1xuICAgIGZ1bmN0aW9uQm9keSA9IHRoaXMuY2FsbGJhY2soZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sIGlucHV0c1syXSwgaW5wdXRzWzNdLCAnbWVtb3J5WycgKyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggKyAnXScsICdtZW1vcnlbJyArIHRoaXMubWVtb3J5LndyYXAuaWR4ICsgJ10nKTtcblxuICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCB0aGlzKSk7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZSArICdfdmFsdWUnO1xuXG4gICAgaWYgKF9nZW4ubWVtb1t0aGlzLndyYXAubmFtZV0gPT09IHVuZGVmaW5lZCkgdGhpcy53cmFwLmdlbigpO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5XTtcbiAgfSxcbiAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKF9uYW1lLCBfaW5jciwgX21pbiwgX21heCwgX3Jlc2V0LCB2YWx1ZVJlZiwgd3JhcFJlZikge1xuICAgIHZhciBkaWZmID0gdGhpcy5tYXggLSB0aGlzLm1pbixcbiAgICAgICAgb3V0ID0gJycsXG4gICAgICAgIHdyYXAgPSAnJztcblxuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiAoISh0eXBlb2YgdGhpcy5pbnB1dHNbM10gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzNdIDwgMSkpIHtcbiAgICAgIG91dCArPSAnICBpZiggJyArIF9yZXNldCArICcgPj0gMSApICcgKyB2YWx1ZVJlZiArICcgPSAnICsgX21pbiArICdcXG4nO1xuICAgIH1cblxuICAgIG91dCArPSAnICB2YXIgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgdmFsdWVSZWYgKyAnO1xcbiAgJyArIHZhbHVlUmVmICsgJyArPSAnICsgX2luY3IgKyAnXFxuJzsgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgXG5cbiAgICBpZiAodHlwZW9mIHRoaXMubWF4ID09PSAnbnVtYmVyJyAmJiB0aGlzLm1heCAhPT0gSW5maW5pdHkgJiYgdHlwZW9mIHRoaXMubWluID09PSAnbnVtYmVyJykge1xuICAgICAgd3JhcCA9ICcgIGlmKCAnICsgdmFsdWVSZWYgKyAnID49ICcgKyB0aGlzLm1heCArICcgKSB7XFxuICAgICcgKyB2YWx1ZVJlZiArICcgLT0gJyArIGRpZmYgKyAnXFxuICAgICcgKyB3cmFwUmVmICsgJyA9IDFcXG4gIH1lbHNle1xcbiAgICAnICsgd3JhcFJlZiArICcgPSAwXFxuICB9XFxuJztcbiAgICB9IGVsc2UgaWYgKHRoaXMubWF4ICE9PSBJbmZpbml0eSkge1xuICAgICAgd3JhcCA9ICcgIGlmKCAnICsgdmFsdWVSZWYgKyAnID49ICcgKyBfbWF4ICsgJyApIHtcXG4gICAgJyArIHZhbHVlUmVmICsgJyAtPSAnICsgX21heCArICcgLSAnICsgX21pbiArICdcXG4gICAgJyArIHdyYXBSZWYgKyAnID0gMVxcbiAgfWVsc2UgaWYoICcgKyB2YWx1ZVJlZiArICcgPCAnICsgX21pbiArICcgKSB7XFxuICAgICcgKyB2YWx1ZVJlZiArICcgKz0gJyArIF9tYXggKyAnIC0gJyArIF9taW4gKyAnXFxuICAgICcgKyB3cmFwUmVmICsgJyA9IDFcXG4gIH1lbHNle1xcbiAgICAnICsgd3JhcFJlZiArICcgPSAwXFxuICB9XFxuJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9ICdcXG4nO1xuICAgIH1cblxuICAgIG91dCA9IG91dCArIHdyYXA7XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGluY3IgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyAxIDogYXJndW1lbnRzWzBdO1xuICB2YXIgbWluID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1sxXTtcbiAgdmFyIG1heCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IEluZmluaXR5IDogYXJndW1lbnRzWzJdO1xuICB2YXIgcmVzZXQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyAwIDogYXJndW1lbnRzWzNdO1xuICB2YXIgcHJvcGVydGllcyA9IGFyZ3VtZW50c1s0XTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXRpYWxWYWx1ZTogMCB9O1xuXG4gIGlmIChwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG1pbjogbWluLFxuICAgIG1heDogbWF4LFxuICAgIHZhbHVlOiBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luY3IsIG1pbiwgbWF4LCByZXNldF0sXG4gICAgbWVtb3J5OiB7XG4gICAgICB2YWx1ZTogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9LFxuICAgICAgd3JhcDogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9XG4gICAgfSxcbiAgICB3cmFwOiB7XG4gICAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgICAgaWYgKHVnZW4ubWVtb3J5LndyYXAuaWR4ID09PSBudWxsKSB7XG4gICAgICAgICAgX2dlbi5yZXF1ZXN0TWVtb3J5KHVnZW4ubWVtb3J5KTtcbiAgICAgICAgfVxuICAgICAgICBfZ2VuLmdldElucHV0cyh0aGlzKTtcbiAgICAgICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSAnbWVtb3J5WyAnICsgdWdlbi5tZW1vcnkud3JhcC5pZHggKyAnIF0nO1xuICAgICAgICByZXR1cm4gJ21lbW9yeVsgJyArIHVnZW4ubWVtb3J5LndyYXAuaWR4ICsgJyBdJztcbiAgICAgIH1cbiAgICB9XG4gIH0sIGRlZmF1bHRzKTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgaWYgKHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gX2dlbi5tZW1vcnkuaGVhcFt0aGlzLm1lbW9yeS52YWx1ZS5pZHhdO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodikge1xuICAgICAgaWYgKHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCkge1xuICAgICAgICBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF0gPSB2O1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgdWdlbi53cmFwLmlucHV0cyA9IFt1Z2VuXTtcbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG4gIHVnZW4ud3JhcC5uYW1lID0gdWdlbi5uYW1lICsgJ193cmFwJztcbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgYWNjdW0gPSByZXF1aXJlKCcuL3BoYXNvci5qcycpLFxuICAgIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBwaGFzb3IgPSByZXF1aXJlKCcuL3BoYXNvci5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnY3ljbGUnLFxuXG4gIGluaXRUYWJsZTogZnVuY3Rpb24gaW5pdFRhYmxlKCkge1xuICAgIHZhciBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KDEwMjQpO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBidWZmZXIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBidWZmZXJbaV0gPSBNYXRoLnNpbihpIC8gbCAqIChNYXRoLlBJICogMikpO1xuICAgIH1cblxuICAgIGdlbi5nbG9iYWxzLmN5Y2xlID0gZGF0YShidWZmZXIsIDEsIHsgaW1tdXRhYmxlOiB0cnVlIH0pO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZyZXF1ZW5jeSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbMF07XG4gIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMV07XG5cbiAgaWYgKGdlbi5nbG9iYWxzLmN5Y2xlID09PSB1bmRlZmluZWQpIHByb3RvLmluaXRUYWJsZSgpO1xuXG4gIHZhciB1Z2VuID0gcGVlayhnZW4uZ2xvYmFscy5jeWNsZSwgcGhhc29yKGZyZXF1ZW5jeSwgcmVzZXQsIHsgbWluOiAwIH0pKTtcbiAgdWdlbi5uYW1lID0gJ2N5Y2xlJyArIGdlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgdXRpbGl0aWVzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnZGF0YScsXG4gIGdsb2JhbHM6IHt9LFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpZHggPSB2b2lkIDA7XG4gICAgaWYgKF9nZW4ubWVtb1t0aGlzLm5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciB1Z2VuID0gdGhpcztcbiAgICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSwgdGhpcy5pbW11dGFibGUpO1xuICAgICAgaWR4ID0gdGhpcy5tZW1vcnkudmFsdWVzLmlkeDtcbiAgICAgIHRyeSB7XG4gICAgICAgIF9nZW4ubWVtb3J5LmhlYXAuc2V0KHRoaXMuYnVmZmVyLCBpZHgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ2Vycm9yIHdpdGggcmVxdWVzdC4gYXNraW5nIGZvciAnICsgdGhpcy5idWZmZXIubGVuZ3RoICsgJy4gY3VycmVudCBpbmRleDogJyArIF9nZW4ubWVtb3J5SW5kZXggKyAnIG9mICcgKyBfZ2VuLm1lbW9yeS5oZWFwLmxlbmd0aCk7XG4gICAgICB9XG4gICAgICAvL2dlbi5kYXRhWyB0aGlzLm5hbWUgXSA9IHRoaXNcbiAgICAgIC8vcmV0dXJuICdnZW4ubWVtb3J5JyArIHRoaXMubmFtZSArICcuYnVmZmVyJ1xuICAgICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSBpZHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlkeCA9IF9nZW4ubWVtb1t0aGlzLm5hbWVdO1xuICAgIH1cbiAgICByZXR1cm4gaWR4O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciB5ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMSA6IGFyZ3VtZW50c1sxXTtcbiAgdmFyIHByb3BlcnRpZXMgPSBhcmd1bWVudHNbMl07XG5cbiAgdmFyIHVnZW4gPSB2b2lkIDAsXG4gICAgICBidWZmZXIgPSB2b2lkIDAsXG4gICAgICBzaG91bGRMb2FkID0gZmFsc2U7XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKF9nZW4uZ2xvYmFsc1twcm9wZXJ0aWVzLmdsb2JhbF0pIHtcbiAgICAgIHJldHVybiBfZ2VuLmdsb2JhbHNbcHJvcGVydGllcy5nbG9iYWxdO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlb2YgeCA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAoeSAhPT0gMSkge1xuICAgICAgYnVmZmVyID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHk7IGkrKykge1xuICAgICAgICBidWZmZXJbaV0gPSBuZXcgRmxvYXQzMkFycmF5KHgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHgpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHgpKSB7XG4gICAgLy8hICh4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkgKSB7XG4gICAgdmFyIHNpemUgPSB4Lmxlbmd0aDtcbiAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHNpemUpO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCB4Lmxlbmd0aDsgX2krKykge1xuICAgICAgYnVmZmVyW19pXSA9IHhbX2ldO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgeCA9PT0gJ3N0cmluZycpIHtcbiAgICBidWZmZXIgPSB7IGxlbmd0aDogeSA+IDEgPyB5IDogX2dlbi5zYW1wbGVyYXRlICogNjAgfTtcbiAgICBzaG91bGRMb2FkID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICh4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KSB7XG4gICAgYnVmZmVyID0geDtcbiAgfVxuXG4gIHVnZW4gPSB7XG4gICAgYnVmZmVyOiBidWZmZXIsXG4gICAgbmFtZTogcHJvdG8uYmFzZW5hbWUgKyBfZ2VuLmdldFVJRCgpLFxuICAgIGRpbTogYnVmZmVyLmxlbmd0aCxcbiAgICBjaGFubmVsczogMSxcbiAgICBnZW46IHByb3RvLmdlbixcbiAgICBvbmxvYWQ6IG51bGwsXG4gICAgdGhlbjogZnVuY3Rpb24gdGhlbihmbmMpIHtcbiAgICAgIHVnZW4ub25sb2FkID0gZm5jO1xuICAgICAgcmV0dXJuIHVnZW47XG4gICAgfSxcblxuICAgIGltbXV0YWJsZTogcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuaW1tdXRhYmxlID09PSB0cnVlID8gdHJ1ZSA6IGZhbHNlXG4gIH07XG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWVzOiB7IGxlbmd0aDogdWdlbi5kaW0sIGlkeDogbnVsbCB9XG4gIH07XG5cbiAgX2dlbi5uYW1lID0gJ2RhdGEnICsgX2dlbi5nZXRVSUQoKTtcblxuICBpZiAoc2hvdWxkTG9hZCkge1xuICAgIHZhciBwcm9taXNlID0gdXRpbGl0aWVzLmxvYWRTYW1wbGUoeCwgdWdlbik7XG4gICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChfYnVmZmVyKSB7XG4gICAgICB1Z2VuLm1lbW9yeS52YWx1ZXMubGVuZ3RoID0gX2J1ZmZlci5sZW5ndGg7XG4gICAgICB1Z2VuLm9ubG9hZCgpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmIChwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBfZ2VuLmdsb2JhbHNbcHJvcGVydGllcy5nbG9iYWxdID0gdWdlbjtcbiAgICB9XG4gICAgaWYgKHByb3BlcnRpZXMubWV0YSA9PT0gdHJ1ZSkge1xuICAgICAgdmFyIF9sb29wID0gZnVuY3Rpb24gX2xvb3AobGVuZ3RoLCBfaTIpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHVnZW4sIF9pMiwge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHBlZWsodWdlbiwgX2kyLCB7IG1vZGU6ICdzaW1wbGUnLCBpbnRlcnA6ICdub25lJyB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogZnVuY3Rpb24gc2V0KHYpIHtcbiAgICAgICAgICAgIHJldHVybiBwb2tlKHVnZW4sIHYsIF9pMik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIGZvciAodmFyIF9pMiA9IDAsIGxlbmd0aCA9IHVnZW4uYnVmZmVyLmxlbmd0aDsgX2kyIDwgbGVuZ3RoOyBfaTIrKykge1xuICAgICAgICBfbG9vcChsZW5ndGgsIF9pMik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoJy4vaGlzdG9yeS5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xKSB7XG4gICAgdmFyIHgxID0gaGlzdG9yeSgpLFxuICAgICAgICB5MSA9IGhpc3RvcnkoKSxcbiAgICAgICAgZmlsdGVyID0gdm9pZCAwO1xuXG4gICAgLy9IaXN0b3J5IHgxLCB5MTsgeSA9IGluMSAtIHgxICsgeTEqMC45OTk3OyB4MSA9IGluMTsgeTEgPSB5OyBvdXQxID0geTtcbiAgICBmaWx0ZXIgPSBtZW1vKGFkZChzdWIoaW4xLCB4MS5vdXQpLCBtdWwoeTEub3V0LCAuOTk5NykpKTtcbiAgICB4MS5pbihpbjEpO1xuICAgIHkxLmluKGZpbHRlcik7XG5cbiAgICByZXR1cm4gZmlsdGVyO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBkYXRhID0gcmVxdWlyZSgnLi9kYXRhLmpzJyksXG4gICAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpLFxuICAgIHdyYXAgPSByZXF1aXJlKCcuL3dyYXAuanMnKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoJy4vYWNjdW0uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2RlbGF5JyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IGlucHV0c1swXTtcblxuICAgIHJldHVybiBpbnB1dHNbMF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgdGFwc0FuZFByb3BlcnRpZXMgPSBBcnJheShfbGVuID4gMiA/IF9sZW4gLSAyIDogMCksIF9rZXkgPSAyOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgdGFwc0FuZFByb3BlcnRpZXNbX2tleSAtIDJdID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgdmFyIHRpbWUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAyNTYgOiBhcmd1bWVudHNbMV07XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGRlZmF1bHRzID0geyBzaXplOiA1MTIsIGZlZWRiYWNrOiAwLCBpbnRlcnA6ICdsaW5lYXInIH0sXG4gICAgICB3cml0ZUlkeCA9IHZvaWQgMCxcbiAgICAgIHJlYWRJZHggPSB2b2lkIDAsXG4gICAgICBkZWxheWRhdGEgPSB2b2lkIDAsXG4gICAgICBwcm9wZXJ0aWVzID0gdm9pZCAwLFxuICAgICAgdGFwVGltZXMgPSBbdGltZV0sXG4gICAgICB0YXBzID0gdm9pZCAwO1xuXG4gIGlmIChBcnJheS5pc0FycmF5KHRhcHNBbmRQcm9wZXJ0aWVzKSkge1xuICAgIHByb3BlcnRpZXMgPSB0YXBzQW5kUHJvcGVydGllc1t0YXBzQW5kUHJvcGVydGllcy5sZW5ndGggLSAxXTtcbiAgICBpZiAodGFwc0FuZFByb3BlcnRpZXMubGVuZ3RoID4gMSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXBzQW5kUHJvcGVydGllcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgdGFwVGltZXMucHVzaCh0YXBzQW5kUHJvcGVydGllc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgcHJvcGVydGllcyk7XG5cbiAgaWYgKGRlZmF1bHRzLnNpemUgPCB0aW1lKSBkZWZhdWx0cy5zaXplID0gdGltZTtcblxuICBkZWxheWRhdGEgPSBkYXRhKGRlZmF1bHRzLnNpemUpO1xuXG4gIHVnZW4uaW5wdXRzID0gW107XG5cbiAgd3JpdGVJZHggPSBhY2N1bSgxLCAwLCB7IG1heDogZGVmYXVsdHMuc2l6ZSB9KTtcblxuICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgdGFwVGltZXMubGVuZ3RoOyBfaSsrKSB7XG4gICAgdWdlbi5pbnB1dHNbX2ldID0gcGVlayhkZWxheWRhdGEsIHdyYXAoc3ViKHdyaXRlSWR4LCB0YXBUaW1lc1tfaV0pLCAwLCBkZWZhdWx0cy5zaXplKSwgeyBtb2RlOiAnc2FtcGxlcycsIGludGVycDogZGVmYXVsdHMuaW50ZXJwIH0pO1xuICB9XG5cbiAgdWdlbi5vdXRwdXRzID0gdWdlbi5pbnB1dHM7IC8vIHVnbiwgVWdoLCBVR0ghIGJ1dCBpIGd1ZXNzIGl0IHdvcmtzLlxuXG4gIHBva2UoZGVsYXlkYXRhLCBpbjEsIHdyaXRlSWR4KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCcuL2hpc3RvcnkuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgdmFyIG4xID0gaGlzdG9yeSgpO1xuXG4gIG4xLmluKGluMSk7XG5cbiAgdmFyIHVnZW4gPSBzdWIoaW4xLCBuMS5vdXQpO1xuICB1Z2VuLm5hbWUgPSAnZGVsdGEnICsgZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciBkaXYgPSB7XG4gICAgaWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgICAgb3V0ID0gJygnLFxuICAgICAgICAgIGRpZmYgPSAwLFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWzBdLFxuICAgICAgICAgIGxhc3ROdW1iZXJJc1VnZW4gPSBpc05hTihsYXN0TnVtYmVyKSxcbiAgICAgICAgICBkaXZBdEVuZCA9IGZhbHNlO1xuXG4gICAgICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xuICAgICAgICBpZiAoaSA9PT0gMCkgcmV0dXJuO1xuXG4gICAgICAgIHZhciBpc051bWJlclVnZW4gPSBpc05hTih2KSxcbiAgICAgICAgICAgIGlzRmluYWxJZHggPSBpID09PSBpbnB1dHMubGVuZ3RoIC0gMTtcblxuICAgICAgICBpZiAoIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbikge1xuICAgICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC8gdjtcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlciArICcgLyAnICsgdjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNGaW5hbElkeCkgb3V0ICs9ICcgLyAnO1xuICAgICAgfSk7XG5cbiAgICAgIG91dCArPSAnKSc7XG5cbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBkaXY7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuJyksXG4gICAgd2luZG93cyA9IHJlcXVpcmUoJy4vd2luZG93cycpLFxuICAgIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrJyksXG4gICAgcGhhc29yID0gcmVxdWlyZSgnLi9waGFzb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyAxMTAyNSA6IGFyZ3VtZW50c1swXTtcbiAgdmFyIHByb3BlcnRpZXMgPSBhcmd1bWVudHNbMV07XG5cbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIHR5cGU6ICdUcmlhbmd1bGFyJyxcbiAgICBidWZmZXJMZW5ndGg6IDEwMjQsXG4gICAgYWxwaGE6IC4xNVxuICB9LFxuICAgICAgZnJlcXVlbmN5ID0gbGVuZ3RoIC8gZ2VuLnNhbXBsZXJhdGUsXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBwcm9wZXJ0aWVzKSxcbiAgICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkocHJvcHMuYnVmZmVyTGVuZ3RoKTtcblxuICBpZiAoZ2VuLmdsb2JhbHMud2luZG93c1twcm9wcy50eXBlXSA9PT0gdW5kZWZpbmVkKSBnZW4uZ2xvYmFscy53aW5kb3dzW3Byb3BzLnR5cGVdID0ge307XG5cbiAgaWYgKGdlbi5nbG9iYWxzLndpbmRvd3NbcHJvcHMudHlwZV1bcHJvcHMuYnVmZmVyTGVuZ3RoXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5idWZmZXJMZW5ndGg7IGkrKykge1xuICAgICAgYnVmZmVyW2ldID0gd2luZG93c1twcm9wcy50eXBlXShwcm9wcy5idWZmZXJMZW5ndGgsIGksIHByb3BzLmFscGhhKTtcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy53aW5kb3dzW3Byb3BzLnR5cGVdW3Byb3BzLmJ1ZmZlckxlbmd0aF0gPSBkYXRhKGJ1ZmZlcik7XG4gIH1cblxuICB2YXIgdWdlbiA9IGdlbi5nbG9iYWxzLndpbmRvd3NbcHJvcHMudHlwZV1bcHJvcHMuYnVmZmVyTGVuZ3RoXTsgLy9wZWVrKCBnZW4uZ2xvYmFscy53aW5kb3dzWyBwcm9wcy50eXBlIF1bIHByb3BzLmJ1ZmZlckxlbmd0aCBdLCBwaGFzb3IoIGZyZXF1ZW5jeSwgMCwgeyBtaW46MCB9ICkpXG4gIHVnZW4ubmFtZSA9ICdlbnYnICsgZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2VxJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIG91dCA9IHRoaXMuaW5wdXRzWzBdID09PSB0aGlzLmlucHV0c1sxXSA/IDEgOiAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnICsgaW5wdXRzWzBdICsgJyA9PT0gJyArIGlucHV0c1sxXSArICcgfCAwXFxuXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJycgKyB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gWycnICsgdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIGluMikge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBpbjJdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnZmxvb3InLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIC8vZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguZmxvb3IgfSlcblxuICAgICAgb3V0ID0gJyggJyArIGlucHV0c1swXSArICcgfCAwICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gfCAwO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIGZsb29yID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgZmxvb3IuaW5wdXRzID0gW3hdO1xuXG4gIHJldHVybiBmbG9vcjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdmb2xkJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgY29kZSA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIG91dCA9IHRoaXMuY3JlYXRlQ2FsbGJhY2soaW5wdXRzWzBdLCB0aGlzLm1pbiwgdGhpcy5tYXgpO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJztcblxuICAgIHJldHVybiBbdGhpcy5uYW1lICsgJ192YWx1ZScsIG91dF07XG4gIH0sXG4gIGNyZWF0ZUNhbGxiYWNrOiBmdW5jdGlvbiBjcmVhdGVDYWxsYmFjayh2LCBsbywgaGkpIHtcbiAgICB2YXIgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgdiArICcsXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfcmFuZ2UgPSAnICsgaGkgKyAnIC0gJyArIGxvICsgJyxcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwcyA9IDBcXG5cXG4gIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlID49ICcgKyBoaSArICcpe1xcbiAgICAnICsgdGhpcy5uYW1lICsgJ192YWx1ZSAtPSAnICsgdGhpcy5uYW1lICsgJ19yYW5nZVxcbiAgICBpZignICsgdGhpcy5uYW1lICsgJ192YWx1ZSA+PSAnICsgaGkgKyAnKXtcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwcyA9ICgoJyArIHRoaXMubmFtZSArICdfdmFsdWUgLSAnICsgbG8gKyAnKSAvICcgKyB0aGlzLm5hbWUgKyAnX3JhbmdlKSB8IDBcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ192YWx1ZSAtPSAnICsgdGhpcy5uYW1lICsgJ19yYW5nZSAqICcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzXFxuICAgIH1cXG4gICAgJyArIHRoaXMubmFtZSArICdfbnVtV3JhcHMrK1xcbiAgfSBlbHNlIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIDwgJyArIGxvICsgJyl7XFxuICAgICcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlICs9ICcgKyB0aGlzLm5hbWUgKyAnX3JhbmdlXFxuICAgIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIDwgJyArIGxvICsgJyl7XFxuICAgICAgJyArIHRoaXMubmFtZSArICdfbnVtV3JhcHMgPSAoKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIC0gJyArIGxvICsgJykgLyAnICsgdGhpcy5uYW1lICsgJ19yYW5nZS0gMSkgfCAwXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfdmFsdWUgLT0gJyArIHRoaXMubmFtZSArICdfcmFuZ2UgKiAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwc1xcbiAgICB9XFxuICAgICcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzLS1cXG4gIH1cXG4gIGlmKCcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzICYgMSkgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgaGkgKyAnICsgJyArIGxvICsgJyAtICcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlXFxuJztcbiAgICByZXR1cm4gJyAnICsgb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgdmFyIG1pbiA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMV07XG4gIHZhciBtYXggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyAxIDogYXJndW1lbnRzWzJdO1xuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgbWluOiBtaW4sXG4gICAgbWF4OiBtYXgsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMV1cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2dhdGUnLFxuICBjb250cm9sU3RyaW5nOiBudWxsLCAvLyBpbnNlcnQgaW50byBvdXRwdXQgY29kZWdlbiBmb3IgZGV0ZXJtaW5pbmcgaW5kZXhpbmdcbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBfZ2VuLnJlcXVlc3RNZW1vcnkodGhpcy5tZW1vcnkpO1xuXG4gICAgdmFyIGxhc3RJbnB1dE1lbW9yeUlkeCA9ICdtZW1vcnlbICcgKyB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgJyBdJyxcbiAgICAgICAgb3V0cHV0TWVtb3J5U3RhcnRJZHggPSB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgMSxcbiAgICAgICAgaW5wdXRTaWduYWwgPSBpbnB1dHNbMF0sXG4gICAgICAgIGNvbnRyb2xTaWduYWwgPSBpbnB1dHNbMV07XG5cbiAgICAvKiBcbiAgICAgKiB3ZSBjaGVjayB0byBzZWUgaWYgdGhlIGN1cnJlbnQgY29udHJvbCBpbnB1dHMgZXF1YWxzIG91ciBsYXN0IGlucHV0XG4gICAgICogaWYgc28sIHdlIHN0b3JlIHRoZSBzaWduYWwgaW5wdXQgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnRseVxuICAgICAqIHNlbGVjdGVkIGluZGV4LiBJZiBub3QsIHdlIHB1dCAwIGluIHRoZSBtZW1vcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBsYXN0IHNlbGVjdGVkIGluZGV4LFxuICAgICAqIGNoYW5nZSB0aGUgc2VsZWN0ZWQgaW5kZXgsIGFuZCB0aGVuIHN0b3JlIHRoZSBzaWduYWwgaW4gcHV0IGluIHRoZSBtZW1lcnkgYXNzb2ljYXRlZFxuICAgICAqIHdpdGggdGhlIG5ld2x5IHNlbGVjdGVkIGluZGV4XG4gICAgICovXG5cbiAgICBvdXQgPSAnIGlmKCAnICsgY29udHJvbFNpZ25hbCArICcgIT09ICcgKyBsYXN0SW5wdXRNZW1vcnlJZHggKyAnICkge1xcbiAgICBtZW1vcnlbICcgKyBsYXN0SW5wdXRNZW1vcnlJZHggKyAnICsgJyArIG91dHB1dE1lbW9yeVN0YXJ0SWR4ICsgJyAgXSA9IDAgXFxuICAgICcgKyBsYXN0SW5wdXRNZW1vcnlJZHggKyAnID0gJyArIGNvbnRyb2xTaWduYWwgKyAnXFxuICB9XFxuICBtZW1vcnlbICcgKyBvdXRwdXRNZW1vcnlTdGFydElkeCArICcgKyAnICsgY29udHJvbFNpZ25hbCArICcgXSA9ICcgKyBpbnB1dFNpZ25hbCArICdcXG5cXG4nO1xuICAgIHRoaXMuY29udHJvbFN0cmluZyA9IGlucHV0c1sxXTtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgdGhpcy5vdXRwdXRzLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiB2LmdlbigpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFtudWxsLCAnICcgKyBvdXRdO1xuICB9LFxuICBjaGlsZGdlbjogZnVuY3Rpb24gY2hpbGRnZW4oKSB7XG4gICAgaWYgKHRoaXMucGFyZW50LmluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgICAgX2dlbi5nZXRJbnB1dHModGhpcyk7IC8vIHBhcmVudCBnYXRlIGlzIG9ubHkgaW5wdXQgb2YgYSBnYXRlIG91dHB1dCwgc2hvdWxkIG9ubHkgYmUgZ2VuJ2Qgb25jZS5cbiAgICB9XG5cbiAgICBpZiAoX2dlbi5tZW1vW3RoaXMubmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgX2dlbi5yZXF1ZXN0TWVtb3J5KHRoaXMubWVtb3J5KTtcblxuICAgICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSAnbWVtb3J5WyAnICsgdGhpcy5tZW1vcnkudmFsdWUuaWR4ICsgJyBdJztcbiAgICB9XG5cbiAgICByZXR1cm4gJ21lbW9yeVsgJyArIHRoaXMubWVtb3J5LnZhbHVlLmlkeCArICcgXSc7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnRyb2wsIGluMSwgcHJvcGVydGllcykge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgZGVmYXVsdHMgPSB7IGNvdW50OiAyIH07XG5cbiAgaWYgKCh0eXBlb2YgcHJvcGVydGllcyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YocHJvcGVydGllcykpICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG91dHB1dHM6IFtdLFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjEsIGNvbnRyb2xdLFxuICAgIG1lbW9yeToge1xuICAgICAgbGFzdElucHV0OiB7IGxlbmd0aDogMSwgaWR4OiBudWxsIH1cbiAgICB9LFxuICAgIGluaXRpYWxpemVkOiBmYWxzZVxuICB9LCBkZWZhdWx0cyk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgX2dlbi5nZXRVSUQoKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHVnZW4uY291bnQ7IGkrKykge1xuICAgIHVnZW4ub3V0cHV0cy5wdXNoKHtcbiAgICAgIGluZGV4OiBpLFxuICAgICAgZ2VuOiBwcm90by5jaGlsZGdlbixcbiAgICAgIHBhcmVudDogdWdlbixcbiAgICAgIGlucHV0czogW3VnZW5dLFxuICAgICAgbWVtb3J5OiB7XG4gICAgICAgIHZhbHVlOiB7IGxlbmd0aDogMSwgaWR4OiBudWxsIH1cbiAgICAgIH0sXG4gICAgICBpbml0aWFsaXplZDogZmFsc2UsXG4gICAgICBuYW1lOiB1Z2VuLm5hbWUgKyAnX291dCcgKyBfZ2VuLmdldFVJRCgpXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBnZW4uanNcbiAqXG4gKiBsb3ctbGV2ZWwgY29kZSBnZW5lcmF0aW9uIGZvciB1bml0IGdlbmVyYXRvcnNcbiAqXG4gKi9cblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbnZhciBNZW1vcnlIZWxwZXIgPSByZXF1aXJlKCdtZW1vcnktaGVscGVyJyk7XG5cbnZhciBnZW4gPSB7XG5cbiAgYWNjdW06IDAsXG4gIGdldFVJRDogZnVuY3Rpb24gZ2V0VUlEKCkge1xuICAgIHJldHVybiB0aGlzLmFjY3VtKys7XG4gIH0sXG5cbiAgZGVidWc6IGZhbHNlLFxuICBzYW1wbGVyYXRlOiA0NDEwMCwgLy8gY2hhbmdlIG9uIGF1ZGlvY29udGV4dCBjcmVhdGlvblxuICBzaG91bGRMb2NhbGl6ZTogZmFsc2UsXG4gIGdsb2JhbHM6IHtcbiAgICB3aW5kb3dzOiB7fVxuICB9LFxuXG4gIC8qIGNsb3N1cmVzXG4gICAqXG4gICAqIEZ1bmN0aW9ucyB0aGF0IGFyZSBpbmNsdWRlZCBhcyBhcmd1bWVudHMgdG8gbWFzdGVyIGNhbGxiYWNrLiBFeGFtcGxlczogTWF0aC5hYnMsIE1hdGgucmFuZG9tIGV0Yy5cbiAgICogWFhYIFNob3VsZCBwcm9iYWJseSBiZSByZW5hbWVkIGNhbGxiYWNrUHJvcGVydGllcyBvciBzb21ldGhpbmcgc2ltaWxhci4uLiBjbG9zdXJlcyBhcmUgbm8gbG9uZ2VyIHVzZWQuXG4gICAqL1xuXG4gIGNsb3N1cmVzOiBuZXcgU2V0KCksXG4gIHBhcmFtczogbmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6IFtdLFxuICBlbmRCbG9jazogbmV3IFNldCgpLFxuICBoaXN0b3JpZXM6IG5ldyBNYXAoKSxcblxuICBtZW1vOiB7fSxcblxuICBkYXRhOiB7fSxcblxuICAvKiBleHBvcnRcbiAgICpcbiAgICogcGxhY2UgZ2VuIGZ1bmN0aW9ucyBpbnRvIGFub3RoZXIgb2JqZWN0IGZvciBlYXNpZXIgcmVmZXJlbmNlXG4gICAqL1xuXG4gIGV4cG9ydDogZnVuY3Rpb24gX2V4cG9ydChvYmopIHt9LFxuICBhZGRUb0VuZEJsb2NrOiBmdW5jdGlvbiBhZGRUb0VuZEJsb2NrKHYpIHtcbiAgICB0aGlzLmVuZEJsb2NrLmFkZCgnICAnICsgdik7XG4gIH0sXG4gIHJlcXVlc3RNZW1vcnk6IGZ1bmN0aW9uIHJlcXVlc3RNZW1vcnkobWVtb3J5U3BlYykge1xuICAgIHZhciBpbW11dGFibGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIGZvciAodmFyIGtleSBpbiBtZW1vcnlTcGVjKSB7XG4gICAgICB2YXIgcmVxdWVzdCA9IG1lbW9yeVNwZWNba2V5XTtcblxuICAgICAgcmVxdWVzdC5pZHggPSBnZW4ubWVtb3J5LmFsbG9jKHJlcXVlc3QubGVuZ3RoLCBpbW11dGFibGUpO1xuICAgIH1cbiAgfSxcblxuXG4gIC8qIGNyZWF0ZUNhbGxiYWNrXG4gICAqXG4gICAqIHBhcmFtIHVnZW4gLSBIZWFkIG9mIGdyYXBoIHRvIGJlIGNvZGVnZW4nZFxuICAgKlxuICAgKiBHZW5lcmF0ZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgYSBwYXJ0aWN1bGFyIHVnZW4gZ3JhcGguXG4gICAqIFRoZSBnZW4uY2xvc3VyZXMgcHJvcGVydHkgc3RvcmVzIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmVcbiAgICogcGFzc2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgZmluYWwgZnVuY3Rpb247IHRoZXNlIGFyZSBwcmVmaXhlZFxuICAgKiBiZWZvcmUgYW55IGRlZmluZWQgcGFyYW1zIHRoZSBncmFwaCBleHBvc2VzLiBGb3IgZXhhbXBsZSwgZ2l2ZW46XG4gICAqXG4gICAqIGdlbi5jcmVhdGVDYWxsYmFjayggYWJzKCBwYXJhbSgpICkgKVxuICAgKlxuICAgKiAuLi4gdGhlIGdlbmVyYXRlZCBmdW5jdGlvbiB3aWxsIGhhdmUgYSBzaWduYXR1cmUgb2YgKCBhYnMsIHAwICkuXG4gICAqL1xuXG4gIGNyZWF0ZUNhbGxiYWNrOiBmdW5jdGlvbiBjcmVhdGVDYWxsYmFjayh1Z2VuLCBtZW0pIHtcbiAgICB2YXIgZGVidWcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1syXTtcblxuICAgIHZhciBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkodWdlbikgJiYgdWdlbi5sZW5ndGggPiAxLFxuICAgICAgICBjYWxsYmFjayA9IHZvaWQgMCxcbiAgICAgICAgY2hhbm5lbDEgPSB2b2lkIDAsXG4gICAgICAgIGNoYW5uZWwyID0gdm9pZCAwO1xuXG4gICAgaWYgKHR5cGVvZiBtZW0gPT09ICdudW1iZXInIHx8IG1lbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBtZW0gPSBNZW1vcnlIZWxwZXIuY3JlYXRlKG1lbSk7XG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmxvZyggJ2NiIG1lbW9yeTonLCBtZW0gKVxuICAgIHRoaXMubWVtb3J5ID0gbWVtO1xuICAgIHRoaXMubWVtbyA9IHt9O1xuICAgIHRoaXMuZW5kQmxvY2suY2xlYXIoKTtcbiAgICB0aGlzLmNsb3N1cmVzLmNsZWFyKCk7XG4gICAgdGhpcy5wYXJhbXMuY2xlYXIoKTtcbiAgICB0aGlzLmdsb2JhbHMgPSB7IHdpbmRvd3M6IHt9IH07XG5cbiAgICB0aGlzLnBhcmFtZXRlcnMubGVuZ3RoID0gMDtcblxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gXCIgICd1c2Ugc3RyaWN0J1xcbiAgdmFyIG1lbW9yeSA9IGdlbi5tZW1vcnlcXG5cXG5cIjtcblxuICAgIC8vIGNhbGwgLmdlbigpIG9uIHRoZSBoZWFkIG9mIHRoZSBncmFwaCB3ZSBhcmUgZ2VuZXJhdGluZyB0aGUgY2FsbGJhY2sgZm9yXG4gICAgLy9jb25zb2xlLmxvZyggJ0hFQUQnLCB1Z2VuIClcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEgKyBpc1N0ZXJlbzsgaSsrKSB7XG4gICAgICBpZiAodHlwZW9mIHVnZW5baV0gPT09ICdudW1iZXInKSBjb250aW51ZTtcblxuICAgICAgdmFyIGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHVnZW5baV0uZ2VuKCkgOiB1Z2VuLmdlbigpLFxuICAgICAgICAgIGJvZHkgPSAnJztcblxuICAgICAgLy8gaWYgLmdlbigpIHJldHVybnMgYXJyYXksIGFkZCB1Z2VuIGNhbGxiYWNrIChncmFwaE91dHB1dFsxXSkgdG8gb3VyIG91dHB1dCBmdW5jdGlvbnMgYm9keVxuICAgICAgLy8gYW5kIHRoZW4gcmV0dXJuIG5hbWUgb2YgdWdlbi4gSWYgLmdlbigpIG9ubHkgZ2VuZXJhdGVzIGEgbnVtYmVyIChmb3IgcmVhbGx5IHNpbXBsZSBncmFwaHMpXG4gICAgICAvLyBqdXN0IHJldHVybiB0aGF0IG51bWJlciAoZ3JhcGhPdXRwdXRbMF0pLlxuICAgICAgYm9keSArPSBBcnJheS5pc0FycmF5KGNoYW5uZWwpID8gY2hhbm5lbFsxXSArICdcXG4nICsgY2hhbm5lbFswXSA6IGNoYW5uZWw7XG5cbiAgICAgIC8vIHNwbGl0IGJvZHkgdG8gaW5qZWN0IHJldHVybiBrZXl3b3JkIG9uIGxhc3QgbGluZVxuICAgICAgYm9keSA9IGJvZHkuc3BsaXQoJ1xcbicpO1xuXG4gICAgICAvL2lmKCBkZWJ1ZyApIGNvbnNvbGUubG9nKCAnZnVuY3Rpb25Cb2R5IGxlbmd0aCcsIGJvZHkgKVxuXG4gICAgICAvLyBuZXh0IGxpbmUgaXMgdG8gYWNjb21tb2RhdGUgbWVtbyBhcyBncmFwaCBoZWFkXG4gICAgICBpZiAoYm9keVtib2R5Lmxlbmd0aCAtIDFdLnRyaW0oKS5pbmRleE9mKCdsZXQnKSA+IC0xKSB7XG4gICAgICAgIGJvZHkucHVzaCgnXFxuJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGdldCBpbmRleCBvZiBsYXN0IGxpbmVcbiAgICAgIHZhciBsYXN0aWR4ID0gYm9keS5sZW5ndGggLSAxO1xuXG4gICAgICAvLyBpbnNlcnQgcmV0dXJuIGtleXdvcmRcbiAgICAgIGJvZHlbbGFzdGlkeF0gPSAnICBnZW4ub3V0WycgKyBpICsgJ10gID0gJyArIGJvZHlbbGFzdGlkeF0gKyAnXFxuJztcblxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gYm9keS5qb2luKCdcXG4nKTtcbiAgICB9XG5cbiAgICB0aGlzLmhpc3Rvcmllcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB2YWx1ZS5nZW4oKTtcbiAgICB9KTtcblxuICAgIHZhciByZXR1cm5TdGF0ZW1lbnQgPSBpc1N0ZXJlbyA/ICcgIHJldHVybiBnZW4ub3V0JyA6ICcgIHJldHVybiBnZW4ub3V0WzBdJztcblxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuc3BsaXQoJ1xcbicpO1xuXG4gICAgaWYgKHRoaXMuZW5kQmxvY2suc2l6ZSkge1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5jb25jYXQoQXJyYXkuZnJvbSh0aGlzLmVuZEJsb2NrKSk7XG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKHJldHVyblN0YXRlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2gocmV0dXJuU3RhdGVtZW50KTtcbiAgICB9XG4gICAgLy8gcmVhc3NlbWJsZSBmdW5jdGlvbiBib2R5XG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5qb2luKCdcXG4nKTtcblxuICAgIC8vIHdlIGNhbiBvbmx5IGR5bmFtaWNhbGx5IGNyZWF0ZSBhIG5hbWVkIGZ1bmN0aW9uIGJ5IGR5bmFtaWNhbGx5IGNyZWF0aW5nIGFub3RoZXIgZnVuY3Rpb25cbiAgICAvLyB0byBjb25zdHJ1Y3QgdGhlIG5hbWVkIGZ1bmN0aW9uISBzaGVlc2guLi5cbiAgICB2YXIgYnVpbGRTdHJpbmcgPSAncmV0dXJuIGZ1bmN0aW9uIGdlbiggJyArIHRoaXMucGFyYW1ldGVycy5qb2luKCcsJykgKyAnICl7IFxcbicgKyB0aGlzLmZ1bmN0aW9uQm9keSArICdcXG59JztcblxuICAgIGlmICh0aGlzLmRlYnVnIHx8IGRlYnVnKSBjb25zb2xlLmxvZyhidWlsZFN0cmluZyk7XG5cbiAgICBjYWxsYmFjayA9IG5ldyBGdW5jdGlvbihidWlsZFN0cmluZykoKTtcblxuICAgIC8vIGFzc2lnbiBwcm9wZXJ0aWVzIHRvIG5hbWVkIGZ1bmN0aW9uXG4gICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSB0aGlzLmNsb3N1cmVzLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgICB2YXIgZGljdCA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgIHZhciBuYW1lID0gT2JqZWN0LmtleXMoZGljdClbMF0sXG4gICAgICAgICAgICB2YWx1ZSA9IGRpY3RbbmFtZV07XG5cbiAgICAgICAgY2FsbGJhY2tbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciBfbG9vcCA9IGZ1bmN0aW9uIF9sb29wKCkge1xuICAgICAgICB2YXIgZGljdCA9IF9zdGVwMi52YWx1ZTtcblxuICAgICAgICB2YXIgbmFtZSA9IE9iamVjdC5rZXlzKGRpY3QpWzBdLFxuICAgICAgICAgICAgdWdlbiA9IGRpY3RbbmFtZV07XG5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNhbGxiYWNrLCBuYW1lLCB7XG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHVnZW4udmFsdWU7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgICAgICAgICB1Z2VuLnZhbHVlID0gdjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL2NhbGxiYWNrWyBuYW1lIF0gPSB2YWx1ZVxuICAgICAgfTtcblxuICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMiA9IHRoaXMucGFyYW1zLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICAgIF9sb29wKCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgICAgX2l0ZXJhdG9yRXJyb3IyID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yICYmIF9pdGVyYXRvcjIucmV0dXJuKSB7XG4gICAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNhbGxiYWNrLmRhdGEgPSB0aGlzLmRhdGE7XG4gICAgY2FsbGJhY2sub3V0ID0gbmV3IEZsb2F0MzJBcnJheSgyKTtcbiAgICBjYWxsYmFjay5wYXJhbWV0ZXJzID0gdGhpcy5wYXJhbWV0ZXJzLnNsaWNlKDApO1xuXG4gICAgLy9pZiggTWVtb3J5SGVscGVyLmlzUHJvdG90eXBlT2YoIHRoaXMubWVtb3J5ICkgKVxuICAgIGNhbGxiYWNrLm1lbW9yeSA9IHRoaXMubWVtb3J5LmhlYXA7XG5cbiAgICB0aGlzLmhpc3Rvcmllcy5jbGVhcigpO1xuXG4gICAgcmV0dXJuIGNhbGxiYWNrO1xuICB9LFxuXG5cbiAgLyogZ2V0SW5wdXRzXG4gICAqXG4gICAqIEdpdmVuIGFuIGFyZ3VtZW50IHVnZW4sIGV4dHJhY3QgaXRzIGlucHV0cy4gSWYgdGhleSBhcmUgbnVtYmVycywgcmV0dXJuIHRoZSBudW1lYnJzLiBJZlxuICAgKiB0aGV5IGFyZSB1Z2VucywgY2FsbCAuZ2VuKCkgb24gdGhlIHVnZW4sIG1lbW9pemUgdGhlIHJlc3VsdCBhbmQgcmV0dXJuIHRoZSByZXN1bHQuIElmIHRoZVxuICAgKiB1Z2VuIGhhcyBwcmV2aW91c2x5IGJlZW4gbWVtb2l6ZWQgcmV0dXJuIHRoZSBtZW1vaXplZCB2YWx1ZS5cbiAgICpcbiAgICovXG4gIGdldElucHV0czogZnVuY3Rpb24gZ2V0SW5wdXRzKHVnZW4pIHtcbiAgICByZXR1cm4gdWdlbi5pbnB1dHMubWFwKGdlbi5nZXRJbnB1dCk7XG4gIH0sXG4gIGdldElucHV0OiBmdW5jdGlvbiBnZXRJbnB1dChpbnB1dCkge1xuICAgIHZhciBpc09iamVjdCA9ICh0eXBlb2YgaW5wdXQgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKGlucHV0KSkgPT09ICdvYmplY3QnLFxuICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IHZvaWQgMDtcblxuICAgIGlmIChpc09iamVjdCkge1xuICAgICAgLy8gaWYgaW5wdXQgaXMgYSB1Z2VuLi4uXG4gICAgICBpZiAoZ2VuLm1lbW9baW5wdXQubmFtZV0pIHtcbiAgICAgICAgLy8gaWYgaXQgaGFzIGJlZW4gbWVtb2l6ZWQuLi5cbiAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBnZW4ubWVtb1tpbnB1dC5uYW1lXTtcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcbiAgICAgICAgZ2VuLmdldElucHV0KGlucHV0WzBdKTtcbiAgICAgICAgZ2VuLmdldElucHV0KGlucHV0WzBdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIG5vdCBtZW1vaXplZCBnZW5lcmF0ZSBjb2RlIFxuICAgICAgICBpZiAodHlwZW9mIGlucHV0LmdlbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdubyBnZW4gZm91bmQ6JywgaW5wdXQsIGlucHV0Lmdlbik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvZGUgPSBpbnB1dC5nZW4oKTtcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjb2RlKSkge1xuICAgICAgICAgIGlmICghZ2VuLnNob3VsZExvY2FsaXplKSB7XG4gICAgICAgICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdlbi5jb2RlTmFtZSA9IGNvZGVbMF07XG4gICAgICAgICAgICBnZW4ubG9jYWxpemVkQ29kZS5wdXNoKGNvZGVbMV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnYWZ0ZXIgR0VOJyAsIHRoaXMuZnVuY3Rpb25Cb2R5IClcbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGl0IGlucHV0IGlzIGEgbnVtYmVyXG4gICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0O1xuICAgIH1cblxuICAgIHJldHVybiBwcm9jZXNzZWRJbnB1dDtcbiAgfSxcbiAgc3RhcnRMb2NhbGl6ZTogZnVuY3Rpb24gc3RhcnRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLmxvY2FsaXplZENvZGUgPSBbXTtcbiAgICB0aGlzLnNob3VsZExvY2FsaXplID0gdHJ1ZTtcbiAgfSxcbiAgZW5kTG9jYWxpemU6IGZ1bmN0aW9uIGVuZExvY2FsaXplKCkge1xuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSBmYWxzZTtcblxuICAgIHJldHVybiBbdGhpcy5jb2RlTmFtZSwgdGhpcy5sb2NhbGl6ZWRDb2RlLnNsaWNlKDApXTtcbiAgfSxcbiAgZnJlZTogZnVuY3Rpb24gZnJlZShncmFwaCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGdyYXBoKSkge1xuICAgICAgLy8gc3RlcmVvIHVnZW5cbiAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWU7XG4gICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IzID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IzID0gdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IzID0gZ3JhcGhbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDM7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSAoX3N0ZXAzID0gX2l0ZXJhdG9yMy5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWUpIHtcbiAgICAgICAgICB2YXIgY2hhbm5lbCA9IF9zdGVwMy52YWx1ZTtcblxuICAgICAgICAgIHRoaXMuZnJlZShjaGFubmVsKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yMyA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yMyA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyAmJiBfaXRlcmF0b3IzLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yMy5yZXR1cm4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMykge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoKHR5cGVvZiBncmFwaCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoZ3JhcGgpKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKGdyYXBoLm1lbW9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZm9yICh2YXIgbWVtb3J5S2V5IGluIGdyYXBoLm1lbW9yeSkge1xuICAgICAgICAgICAgdGhpcy5tZW1vcnkuZnJlZShncmFwaC5tZW1vcnlbbWVtb3J5S2V5XS5pZHgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShncmFwaC5pbnB1dHMpKSB7XG4gICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb240ID0gdHJ1ZTtcbiAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3I0ID0gZmFsc2U7XG4gICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yNCA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3I0ID0gZ3JhcGguaW5wdXRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA0OyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb240ID0gKF9zdGVwNCA9IF9pdGVyYXRvcjQubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjQgPSB0cnVlKSB7XG4gICAgICAgICAgICAgIHZhciB1Z2VuID0gX3N0ZXA0LnZhbHVlO1xuXG4gICAgICAgICAgICAgIHRoaXMuZnJlZSh1Z2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yNCA9IHRydWU7XG4gICAgICAgICAgICBfaXRlcmF0b3JFcnJvcjQgPSBlcnI7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjQgJiYgX2l0ZXJhdG9yNC5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3I0LnJldHVybigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3I0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnZ3QnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJztcblxuICAgIGlmIChpc05hTih0aGlzLmlucHV0c1swXSkgfHwgaXNOYU4odGhpcy5pbnB1dHNbMV0pKSB7XG4gICAgICBvdXQgKz0gJyggJyArIGlucHV0c1swXSArICcgPiAnICsgaW5wdXRzWzFdICsgJyB8IDAgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPiBpbnB1dHNbMV0gPyAxIDogMDtcbiAgICB9XG4gICAgb3V0ICs9ICdcXG5cXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgZ3QgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBndC5pbnB1dHMgPSBbeCwgeV07XG4gIGd0Lm5hbWUgPSAnZ3QnICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gZ3Q7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdndGUnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJztcblxuICAgIGlmIChpc05hTih0aGlzLmlucHV0c1swXSkgfHwgaXNOYU4odGhpcy5pbnB1dHNbMV0pKSB7XG4gICAgICBvdXQgKz0gJyggJyArIGlucHV0c1swXSArICcgPj0gJyArIGlucHV0c1sxXSArICcgfCAwICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID49IGlucHV0c1sxXSA/IDEgOiAwO1xuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBndCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGd0LmlucHV0cyA9IFt4LCB5XTtcbiAgZ3QubmFtZSA9ICdndGUnICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gZ3Q7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdndHAnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKHRoaXMuaW5wdXRzWzBdKSB8fCBpc05hTih0aGlzLmlucHV0c1sxXSkpIHtcbiAgICAgIG91dCA9ICcoJyArIGlucHV0c1swXSArICcgKiAoICggJyArIGlucHV0c1swXSArICcgPiAnICsgaW5wdXRzWzFdICsgJyApIHwgMCApICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gKiAoaW5wdXRzWzBdID4gaW5wdXRzWzFdIHwgMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgZ3RwID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgZ3RwLmlucHV0cyA9IFt4LCB5XTtcblxuICByZXR1cm4gZ3RwO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBpbjEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyAwIDogYXJndW1lbnRzWzBdO1xuXG4gIHZhciB1Z2VuID0ge1xuICAgIGlucHV0czogW2luMV0sXG4gICAgbWVtb3J5OiB7IHZhbHVlOiB7IGxlbmd0aDogMSwgaWR4OiBudWxsIH0gfSxcbiAgICByZWNvcmRlcjogbnVsbCxcblxuICAgIGluOiBmdW5jdGlvbiBfaW4odikge1xuICAgICAgaWYgKF9nZW4uaGlzdG9yaWVzLmhhcyh2KSkge1xuICAgICAgICB2YXIgbWVtb0hpc3RvcnkgPSBfZ2VuLmhpc3Rvcmllcy5nZXQodik7XG4gICAgICAgIHVnZW4ubmFtZSA9IG1lbW9IaXN0b3J5Lm5hbWU7XG4gICAgICAgIHJldHVybiBtZW1vSGlzdG9yeTtcbiAgICAgIH1cblxuICAgICAgdmFyIG9iaiA9IHtcbiAgICAgICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICAgICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHVnZW4pO1xuXG4gICAgICAgICAgaWYgKHVnZW4ubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgX2dlbi5yZXF1ZXN0TWVtb3J5KHVnZW4ubWVtb3J5KTtcbiAgICAgICAgICAgIF9nZW4ubWVtb3J5LmhlYXBbdWdlbi5tZW1vcnkudmFsdWUuaWR4XSA9IGluMTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4O1xuXG4gICAgICAgICAgX2dlbi5hZGRUb0VuZEJsb2NrKCdtZW1vcnlbICcgKyBpZHggKyAnIF0gPSAnICsgaW5wdXRzWzBdKTtcblxuICAgICAgICAgIC8vIHJldHVybiB1Z2VuIHRoYXQgaXMgYmVpbmcgcmVjb3JkZWQgaW5zdGVhZCBvZiBzc2QuXG4gICAgICAgICAgLy8gdGhpcyBlZmZlY3RpdmVseSBtYWtlcyBhIGNhbGwgdG8gc3NkLnJlY29yZCgpIHRyYW5zcGFyZW50IHRvIHRoZSBncmFwaC5cbiAgICAgICAgICAvLyByZWNvcmRpbmcgaXMgdHJpZ2dlcmVkIGJ5IHByaW9yIGNhbGwgdG8gZ2VuLmFkZFRvRW5kQmxvY2suXG4gICAgICAgICAgX2dlbi5oaXN0b3JpZXMuc2V0KHYsIG9iaik7XG5cbiAgICAgICAgICByZXR1cm4gaW5wdXRzWzBdO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5hbWU6IHVnZW4ubmFtZSArICdfaW4nICsgX2dlbi5nZXRVSUQoKSxcbiAgICAgICAgbWVtb3J5OiB1Z2VuLm1lbW9yeVxuICAgICAgfTtcblxuICAgICAgdGhpcy5pbnB1dHNbMF0gPSB2O1xuXG4gICAgICB1Z2VuLnJlY29yZGVyID0gb2JqO1xuXG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG5cblxuICAgIG91dDoge1xuICAgICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICAgIGlmICh1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwpIHtcbiAgICAgICAgICBpZiAoX2dlbi5oaXN0b3JpZXMuZ2V0KHVnZW4uaW5wdXRzWzBdKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfZ2VuLmhpc3Rvcmllcy5zZXQodWdlbi5pbnB1dHNbMF0sIHVnZW4ucmVjb3JkZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBfZ2VuLnJlcXVlc3RNZW1vcnkodWdlbi5tZW1vcnkpO1xuICAgICAgICAgIF9nZW4ubWVtb3J5LmhlYXBbdWdlbi5tZW1vcnkudmFsdWUuaWR4XSA9IHBhcnNlRmxvYXQoaW4xKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4O1xuXG4gICAgICAgIHJldHVybiAnbWVtb3J5WyAnICsgaWR4ICsgJyBdICc7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHVpZDogX2dlbi5nZXRVSUQoKVxuICB9O1xuXG4gIHVnZW4ub3V0Lm1lbW9yeSA9IHVnZW4ubWVtb3J5O1xuXG4gIHVnZW4ubmFtZSA9ICdoaXN0b3J5JyArIHVnZW4udWlkO1xuICB1Z2VuLm91dC5uYW1lID0gdWdlbi5uYW1lICsgJ19vdXQnO1xuICB1Z2VuLmluLl9uYW1lID0gdWdlbi5uYW1lID0gJ19pbic7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIGlmICh0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIF9nZW4ubWVtb3J5LmhlYXBbdGhpcy5tZW1vcnkudmFsdWUuaWR4XTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHYpIHtcbiAgICAgIGlmICh0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwpIHtcbiAgICAgICAgX2dlbi5tZW1vcnkuaGVhcFt0aGlzLm1lbW9yeS52YWx1ZS5pZHhdID0gdjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIvKlxuXG4gYSA9IGNvbmRpdGlvbmFsKCBjb25kaXRpb24sIHRydWVCbG9jaywgZmFsc2VCbG9jayApXG4gYiA9IGNvbmRpdGlvbmFsKFtcbiAgIGNvbmRpdGlvbjEsIGJsb2NrMSxcbiAgIGNvbmRpdGlvbjIsIGJsb2NrMixcbiAgIGNvbmRpdGlvbjMsIGJsb2NrMyxcbiAgIGRlZmF1bHRCbG9ja1xuIF0pXG5cbiovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2lmZWxzZScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGNvbmRpdGlvbmFscyA9IHRoaXMuaW5wdXRzWzBdLFxuICAgICAgICBkZWZhdWx0VmFsdWUgPSBjb25kaXRpb25hbHNbY29uZGl0aW9uYWxzLmxlbmd0aCAtIDFdLFxuICAgICAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICdfb3V0ID0gJyArIGRlZmF1bHRWYWx1ZSArICdcXG4nO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb25kaXRpb25hbHMubGVuZ3RoIC0gMjsgaSArPSAyKSB7XG4gICAgICB2YXIgaXNFbmRCbG9jayA9IGkgPT09IGNvbmRpdGlvbmFscy5sZW5ndGggLSAzLFxuICAgICAgICAgIGNvbmQgPSBfZ2VuLmdldElucHV0KGNvbmRpdGlvbmFsc1tpXSksXG4gICAgICAgICAgcHJlYmxvY2sgPSBjb25kaXRpb25hbHNbaSArIDFdLFxuICAgICAgICAgIGJsb2NrID0gdm9pZCAwLFxuICAgICAgICAgIGJsb2NrTmFtZSA9IHZvaWQgMCxcbiAgICAgICAgICBvdXRwdXQgPSB2b2lkIDA7XG5cbiAgICAgIC8vY29uc29sZS5sb2coICdwYicsIHByZWJsb2NrIClcblxuICAgICAgaWYgKHR5cGVvZiBwcmVibG9jayA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgYmxvY2sgPSBwcmVibG9jaztcbiAgICAgICAgYmxvY2tOYW1lID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChfZ2VuLm1lbW9bcHJlYmxvY2submFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIHVzZWQgdG8gcGxhY2UgYWxsIGNvZGUgZGVwZW5kZW5jaWVzIGluIGFwcHJvcHJpYXRlIGJsb2Nrc1xuICAgICAgICAgIF9nZW4uc3RhcnRMb2NhbGl6ZSgpO1xuXG4gICAgICAgICAgX2dlbi5nZXRJbnB1dChwcmVibG9jayk7XG5cbiAgICAgICAgICBibG9jayA9IF9nZW4uZW5kTG9jYWxpemUoKTtcbiAgICAgICAgICBibG9ja05hbWUgPSBibG9ja1swXTtcbiAgICAgICAgICBibG9jayA9IGJsb2NrWzFdLmpvaW4oJycpO1xuICAgICAgICAgIGJsb2NrID0gJyAgJyArIGJsb2NrLnJlcGxhY2UoL1xcbi9naSwgJ1xcbiAgJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmxvY2sgPSAnJztcbiAgICAgICAgICBibG9ja05hbWUgPSBfZ2VuLm1lbW9bcHJlYmxvY2submFtZV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb3V0cHV0ID0gYmxvY2tOYW1lID09PSBudWxsID8gJyAgJyArIHRoaXMubmFtZSArICdfb3V0ID0gJyArIGJsb2NrIDogYmxvY2sgKyAnICAnICsgdGhpcy5uYW1lICsgJ19vdXQgPSAnICsgYmxvY2tOYW1lO1xuXG4gICAgICBpZiAoaSA9PT0gMCkgb3V0ICs9ICcgJztcbiAgICAgIG91dCArPSAnIGlmKCAnICsgY29uZCArICcgPT09IDEgKSB7XFxuJyArIG91dHB1dCArICdcXG4gIH0nO1xuXG4gICAgICBpZiAoIWlzRW5kQmxvY2spIHtcbiAgICAgICAgb3V0ICs9ICcgZWxzZSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXQgKz0gJ1xcbic7XG4gICAgICB9XG4gICAgICAvKiAgICAgICAgIFxuICAgICAgIGVsc2VgXG4gICAgICAgICAgICB9ZWxzZSBpZiggaXNFbmRCbG9jayApIHtcbiAgICAgICAgICAgICAgb3V0ICs9IGB7XFxuICAke291dHB1dH1cXG4gIH1cXG5gXG4gICAgICAgICAgICB9ZWxzZSB7XG4gICAgICBcbiAgICAgICAgICAgICAgLy9pZiggaSArIDIgPT09IGNvbmRpdGlvbmFscy5sZW5ndGggfHwgaSA9PT0gY29uZGl0aW9uYWxzLmxlbmd0aCAtIDEgKSB7XG4gICAgICAgICAgICAgIC8vICBvdXQgKz0gYHtcXG4gICR7b3V0cHV0fVxcbiAgfVxcbmBcbiAgICAgICAgICAgICAgLy99ZWxzZXtcbiAgICAgICAgICAgICAgICBvdXQgKz0gXG4gICAgICBgIGlmKCAke2NvbmR9ID09PSAxICkge1xuICAgICAgJHtvdXRwdXR9XG4gICAgICAgIH0gZWxzZSBgXG4gICAgICAgICAgICAgIC8vfVxuICAgICAgICAgICAgfSovXG4gICAgfVxuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX291dCc7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSArICdfb3V0Jywgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBjb25kaXRpb25zID0gQXJyYXkuaXNBcnJheShhcmdzWzBdKSA/IGFyZ3NbMF0gOiBhcmdzO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtjb25kaXRpb25zXVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdpbicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgX2dlbi5wYXJhbWV0ZXJzLnB1c2godGhpcy5uYW1lKTtcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobmFtZSkge1xuICB2YXIgaW5wdXQgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBpbnB1dC5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIGlucHV0Lm5hbWUgPSBuYW1lICE9PSB1bmRlZmluZWQgPyBuYW1lIDogJycgKyBpbnB1dC5iYXNlbmFtZSArIGlucHV0LmlkO1xuICBpbnB1dFswXSA9IHtcbiAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgIGlmICghX2dlbi5wYXJhbWV0ZXJzLmluY2x1ZGVzKGlucHV0Lm5hbWUpKSBfZ2VuLnBhcmFtZXRlcnMucHVzaChpbnB1dC5uYW1lKTtcbiAgICAgIHJldHVybiBpbnB1dC5uYW1lICsgJ1swXSc7XG4gICAgfVxuICB9O1xuICBpbnB1dFsxXSA9IHtcbiAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgIGlmICghX2dlbi5wYXJhbWV0ZXJzLmluY2x1ZGVzKGlucHV0Lm5hbWUpKSBfZ2VuLnBhcmFtZXRlcnMucHVzaChpbnB1dC5uYW1lKTtcbiAgICAgIHJldHVybiBpbnB1dC5uYW1lICsgJ1sxXSc7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBpbnB1dDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbGlicmFyeSA9IHtcbiAgZXhwb3J0OiBmdW5jdGlvbiBfZXhwb3J0KGRlc3RpbmF0aW9uKSB7XG4gICAgaWYgKGRlc3RpbmF0aW9uID09PSB3aW5kb3cpIHtcbiAgICAgIGRlc3RpbmF0aW9uLnNzZCA9IGxpYnJhcnkuaGlzdG9yeTsgLy8gaGlzdG9yeSBpcyB3aW5kb3cgb2JqZWN0IHByb3BlcnR5LCBzbyB1c2Ugc3NkIGFzIGFsaWFzXG4gICAgICBkZXN0aW5hdGlvbi5pbnB1dCA9IGxpYnJhcnkuaW47IC8vIGluIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG4gICAgICBkZXN0aW5hdGlvbi50ZXJuYXJ5ID0gbGlicmFyeS5zd2l0Y2g7IC8vIHN3aXRjaCBpcyBhIGtleXdvcmQgaW4gamF2YXNjcmlwdFxuXG4gICAgICBkZWxldGUgbGlicmFyeS5oaXN0b3J5O1xuICAgICAgZGVsZXRlIGxpYnJhcnkuaW47XG4gICAgICBkZWxldGUgbGlicmFyeS5zd2l0Y2g7XG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbihkZXN0aW5hdGlvbiwgbGlicmFyeSk7XG5cbiAgICBsaWJyYXJ5LmluID0gZGVzdGluYXRpb24uaW5wdXQ7XG4gICAgbGlicmFyeS5oaXN0b3J5ID0gZGVzdGluYXRpb24uc3NkO1xuICAgIGxpYnJhcnkuc3dpdGNoID0gZGVzdGluYXRpb24udGVybmFyeTtcblxuICAgIGRlc3RpbmF0aW9uLmNsaXAgPSBsaWJyYXJ5LmNsYW1wO1xuICB9LFxuXG5cbiAgZ2VuOiByZXF1aXJlKCcuL2dlbi5qcycpLFxuXG4gIGFiczogcmVxdWlyZSgnLi9hYnMuanMnKSxcbiAgcm91bmQ6IHJlcXVpcmUoJy4vcm91bmQuanMnKSxcbiAgcGFyYW06IHJlcXVpcmUoJy4vcGFyYW0uanMnKSxcbiAgYWRkOiByZXF1aXJlKCcuL2FkZC5qcycpLFxuICBzdWI6IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gIG11bDogcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgZGl2OiByZXF1aXJlKCcuL2Rpdi5qcycpLFxuICBhY2N1bTogcmVxdWlyZSgnLi9hY2N1bS5qcycpLFxuICBjb3VudGVyOiByZXF1aXJlKCcuL2NvdW50ZXIuanMnKSxcbiAgc2luOiByZXF1aXJlKCcuL3Npbi5qcycpLFxuICBjb3M6IHJlcXVpcmUoJy4vY29zLmpzJyksXG4gIHRhbjogcmVxdWlyZSgnLi90YW4uanMnKSxcbiAgYXNpbjogcmVxdWlyZSgnLi9hc2luLmpzJyksXG4gIGFjb3M6IHJlcXVpcmUoJy4vYWNvcy5qcycpLFxuICBhdGFuOiByZXF1aXJlKCcuL2F0YW4uanMnKSxcbiAgcGhhc29yOiByZXF1aXJlKCcuL3BoYXNvci5qcycpLFxuICBkYXRhOiByZXF1aXJlKCcuL2RhdGEuanMnKSxcbiAgcGVlazogcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gIGN5Y2xlOiByZXF1aXJlKCcuL2N5Y2xlLmpzJyksXG4gIGhpc3Rvcnk6IHJlcXVpcmUoJy4vaGlzdG9yeS5qcycpLFxuICBkZWx0YTogcmVxdWlyZSgnLi9kZWx0YS5qcycpLFxuICBmbG9vcjogcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICBjZWlsOiByZXF1aXJlKCcuL2NlaWwuanMnKSxcbiAgbWluOiByZXF1aXJlKCcuL21pbi5qcycpLFxuICBtYXg6IHJlcXVpcmUoJy4vbWF4LmpzJyksXG4gIHNpZ246IHJlcXVpcmUoJy4vc2lnbi5qcycpLFxuICBkY2Jsb2NrOiByZXF1aXJlKCcuL2RjYmxvY2suanMnKSxcbiAgbWVtbzogcmVxdWlyZSgnLi9tZW1vLmpzJyksXG4gIHJhdGU6IHJlcXVpcmUoJy4vcmF0ZS5qcycpLFxuICB3cmFwOiByZXF1aXJlKCcuL3dyYXAuanMnKSxcbiAgbWl4OiByZXF1aXJlKCcuL21peC5qcycpLFxuICBjbGFtcDogcmVxdWlyZSgnLi9jbGFtcC5qcycpLFxuICBwb2tlOiByZXF1aXJlKCcuL3Bva2UuanMnKSxcbiAgZGVsYXk6IHJlcXVpcmUoJy4vZGVsYXkuanMnKSxcbiAgZm9sZDogcmVxdWlyZSgnLi9mb2xkLmpzJyksXG4gIG1vZDogcmVxdWlyZSgnLi9tb2QuanMnKSxcbiAgc2FoOiByZXF1aXJlKCcuL3NhaC5qcycpLFxuICBub2lzZTogcmVxdWlyZSgnLi9ub2lzZS5qcycpLFxuICBub3Q6IHJlcXVpcmUoJy4vbm90LmpzJyksXG4gIGd0OiByZXF1aXJlKCcuL2d0LmpzJyksXG4gIGd0ZTogcmVxdWlyZSgnLi9ndGUuanMnKSxcbiAgbHQ6IHJlcXVpcmUoJy4vbHQuanMnKSxcbiAgbHRlOiByZXF1aXJlKCcuL2x0ZS5qcycpLFxuICBib29sOiByZXF1aXJlKCcuL2Jvb2wuanMnKSxcbiAgZ2F0ZTogcmVxdWlyZSgnLi9nYXRlLmpzJyksXG4gIHRyYWluOiByZXF1aXJlKCcuL3RyYWluLmpzJyksXG4gIHNsaWRlOiByZXF1aXJlKCcuL3NsaWRlLmpzJyksXG4gIGluOiByZXF1aXJlKCcuL2luLmpzJyksXG4gIHQ2MDogcmVxdWlyZSgnLi90NjAuanMnKSxcbiAgbXRvZjogcmVxdWlyZSgnLi9tdG9mLmpzJyksXG4gIGx0cDogcmVxdWlyZSgnLi9sdHAuanMnKSwgLy8gVE9ETzogdGVzdFxuICBndHA6IHJlcXVpcmUoJy4vZ3RwLmpzJyksIC8vIFRPRE86IHRlc3RcbiAgc3dpdGNoOiByZXF1aXJlKCcuL3N3aXRjaC5qcycpLFxuICBtc3Rvc2FtcHM6IHJlcXVpcmUoJy4vbXN0b3NhbXBzLmpzJyksIC8vIFRPRE86IG5lZWRzIHRlc3QsXG4gIHNlbGVjdG9yOiByZXF1aXJlKCcuL3NlbGVjdG9yLmpzJyksXG4gIHV0aWxpdGllczogcmVxdWlyZSgnLi91dGlsaXRpZXMuanMnKSxcbiAgcG93OiByZXF1aXJlKCcuL3Bvdy5qcycpLFxuICAvL2F0dGFjazogICByZXF1aXJlKCAnLi9hdHRhY2suanMnICksXG4gIC8vZGVjYXk6ICAgIHJlcXVpcmUoICcuL2RlY2F5LmpzJyApLFxuICB3aW5kb3dzOiByZXF1aXJlKCcuL3dpbmRvd3MuanMnKSxcbiAgZW52OiByZXF1aXJlKCcuL2Vudi5qcycpLFxuICBhZDogcmVxdWlyZSgnLi9hZC5qcycpLFxuICBhZHNyOiByZXF1aXJlKCcuL2Fkc3IuanMnKSxcbiAgaWZlbHNlOiByZXF1aXJlKCcuL2lmZWxzZWlmLmpzJyksXG4gIGJhbmc6IHJlcXVpcmUoJy4vYmFuZy5qcycpLFxuICBhbmQ6IHJlcXVpcmUoJy4vYW5kLmpzJyksXG4gIHBhbjogcmVxdWlyZSgnLi9wYW4uanMnKSxcbiAgZXE6IHJlcXVpcmUoJy4vZXEuanMnKSxcbiAgbmVxOiByZXF1aXJlKCcuL25lcS5qcycpXG59O1xuXG5saWJyYXJ5Lmdlbi5saWIgPSBsaWJyYXJ5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxpYnJhcnk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2x0JyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICc7XG5cbiAgICBpZiAoaXNOYU4odGhpcy5pbnB1dHNbMF0pIHx8IGlzTmFOKHRoaXMuaW5wdXRzWzFdKSkge1xuICAgICAgb3V0ICs9ICcoICcgKyBpbnB1dHNbMF0gKyAnIDwgJyArIGlucHV0c1sxXSArICcgfCAwICApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8IGlucHV0c1sxXSA/IDEgOiAwO1xuICAgIH1cbiAgICBvdXQgKz0gJ1xcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgbHQgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBsdC5pbnB1dHMgPSBbeCwgeV07XG4gIGx0Lm5hbWUgPSAnbHQnICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gbHQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdsdGUnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJztcblxuICAgIGlmIChpc05hTih0aGlzLmlucHV0c1swXSkgfHwgaXNOYU4odGhpcy5pbnB1dHNbMV0pKSB7XG4gICAgICBvdXQgKz0gJyggJyArIGlucHV0c1swXSArICcgPD0gJyArIGlucHV0c1sxXSArICcgfCAwICApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8PSBpbnB1dHNbMV0gPyAxIDogMDtcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIGx0ID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbHQuaW5wdXRzID0gW3gsIHldO1xuICBsdC5uYW1lID0gJ2x0ZScgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiBsdDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2x0cCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4odGhpcy5pbnB1dHNbMF0pIHx8IGlzTmFOKHRoaXMuaW5wdXRzWzFdKSkge1xuICAgICAgb3V0ID0gJygnICsgaW5wdXRzWzBdICsgJyAqICgoICcgKyBpbnB1dHNbMF0gKyAnIDwgJyArIGlucHV0c1sxXSArICcgKSB8IDAgKSApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKGlucHV0c1swXSA8IGlucHV0c1sxXSB8IDApO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIGx0cCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGx0cC5pbnB1dHMgPSBbeCwgeV07XG5cbiAgcmV0dXJuIGx0cDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ21heCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSB8fCBpc05hTihpbnB1dHNbMV0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sIHRoaXMubmFtZSwgTWF0aC5tYXgpKTtcblxuICAgICAgb3V0ID0gJ2dlbi5tYXgoICcgKyBpbnB1dHNbMF0gKyAnLCAnICsgaW5wdXRzWzFdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5tYXgocGFyc2VGbG9hdChpbnB1dHNbMF0pLCBwYXJzZUZsb2F0KGlucHV0c1sxXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIG1heCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIG1heC5pbnB1dHMgPSBbeCwgeV07XG5cbiAgcmV0dXJuIG1heDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdtZW1vJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICcgKyBpbnB1dHNbMF0gKyAnXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSwgbWVtb05hbWUpIHtcbiAgdmFyIG1lbW8gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBtZW1vLmlucHV0cyA9IFtpbjFdO1xuICBtZW1vLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgbWVtby5uYW1lID0gbWVtb05hbWUgIT09IHVuZGVmaW5lZCA/IG1lbW9OYW1lICsgJ18nICsgX2dlbi5nZXRVSUQoKSA6ICcnICsgbWVtby5iYXNlbmFtZSArIG1lbW8uaWQ7XG5cbiAgcmV0dXJuIG1lbW87XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdtaW4nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkgfHwgaXNOYU4oaW5wdXRzWzFdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIE1hdGgubWluKSk7XG5cbiAgICAgIG91dCA9ICdnZW4ubWluKCAnICsgaW5wdXRzWzBdICsgJywgJyArIGlucHV0c1sxXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgubWluKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSwgcGFyc2VGbG9hdChpbnB1dHNbMV0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBtaW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBtaW4uaW5wdXRzID0gW3gsIHldO1xuXG4gIHJldHVybiBtaW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIGluMikge1xuICAgIHZhciB0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gLjUgOiBhcmd1bWVudHNbMl07XG5cbiAgICB2YXIgdWdlbiA9IG1lbW8oYWRkKG11bChpbjEsIHN1YigxLCB0KSksIG11bChpbjIsIHQpKSk7XG4gICAgdWdlbi5uYW1lID0gJ21peCcgKyBnZW4uZ2V0VUlEKCk7XG5cbiAgICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICB2YXIgbW9kID0ge1xuICAgIGlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICAgIG91dCA9ICcoJyxcbiAgICAgICAgICBkaWZmID0gMCxcbiAgICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgICAgbGFzdE51bWJlciA9IGlucHV0c1swXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4obGFzdE51bWJlciksXG4gICAgICAgICAgbW9kQXRFbmQgPSBmYWxzZTtcblxuICAgICAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgICAgaWYgKGkgPT09IDApIHJldHVybjtcblxuICAgICAgICB2YXIgaXNOdW1iZXJVZ2VuID0gaXNOYU4odiksXG4gICAgICAgICAgICBpc0ZpbmFsSWR4ID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDE7XG5cbiAgICAgICAgaWYgKCFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4pIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAlIHY7XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXIgKyAnICUgJyArIHY7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzRmluYWxJZHgpIG91dCArPSAnICUgJztcbiAgICAgIH0pO1xuXG4gICAgICBvdXQgKz0gJyknO1xuXG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gbW9kO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ21zdG9zYW1wcycsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIHJldHVyblZhbHVlID0gdm9pZCAwO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICcgKyBfZ2VuLnNhbXBsZXJhdGUgKyAnIC8gMTAwMCAqICcgKyBpbnB1dHNbMF0gKyAnIFxcblxcbic7XG5cbiAgICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gb3V0O1xuXG4gICAgICByZXR1cm5WYWx1ZSA9IFt0aGlzLm5hbWUsIG91dF07XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IF9nZW4uc2FtcGxlcmF0ZSAvIDEwMDAgKiB0aGlzLmlucHV0c1swXTtcblxuICAgICAgcmV0dXJuVmFsdWUgPSBvdXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBtc3Rvc2FtcHMgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBtc3Rvc2FtcHMuaW5wdXRzID0gW3hdO1xuICBtc3Rvc2FtcHMubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gbXN0b3NhbXBzO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnbXRvZicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIE1hdGguZXhwKSk7XG5cbiAgICAgIG91dCA9ICcoICcgKyB0aGlzLnR1bmluZyArICcgKiBnZW4uZXhwKCAuMDU3NzYyMjY1ICogKCcgKyBpbnB1dHNbMF0gKyAnIC0gNjkpICkgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IHRoaXMudHVuaW5nICogTWF0aC5leHAoLjA1Nzc2MjI2NSAqIChpbnB1dHNbMF0gLSA2OSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHByb3BzKSB7XG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBkZWZhdWx0cyA9IHsgdHVuaW5nOiA0NDAgfTtcblxuICBpZiAocHJvcHMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihwcm9wcy5kZWZhdWx0cyk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCBkZWZhdWx0cyk7XG4gIHVnZW4uaW5wdXRzID0gW3hdO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgbXVsID0ge1xuICAgIGlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW3gsIHldLFxuXG4gICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgICAgb3V0ID0gdm9pZCAwO1xuXG4gICAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSB8fCBpc05hTihpbnB1dHNbMV0pKSB7XG4gICAgICAgIG91dCA9ICcoJyArIGlucHV0c1swXSArICcgKiAnICsgaW5wdXRzWzFdICsgJyknO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0ID0gcGFyc2VGbG9hdChpbnB1dHNbMF0pICogcGFyc2VGbG9hdChpbnB1dHNbMV0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gbXVsO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ25lcScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBvdXQgPSAvKnRoaXMuaW5wdXRzWzBdICE9PSB0aGlzLmlucHV0c1sxXSA/IDEgOiovJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJyArIGlucHV0c1swXSArICcgIT09ICcgKyBpbnB1dHNbMV0gKyAnIHwgMFxcblxcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIGluMikge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBpbjJdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnbm9pc2UnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDA7XG5cbiAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICdub2lzZSc6IE1hdGgucmFuZG9tIH0pO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gZ2VuLm5vaXNlKClcXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgbm9pc2UgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgbm9pc2UubmFtZSA9IHByb3RvLm5hbWUgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiBub2lzZTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ25vdCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4odGhpcy5pbnB1dHNbMF0pKSB7XG4gICAgICBvdXQgPSAnKCAnICsgaW5wdXRzWzBdICsgJyA9PT0gMCA/IDEgOiAwICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSAhaW5wdXRzWzBdID09PSAwID8gMSA6IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgbm90ID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbm90LmlucHV0cyA9IFt4XTtcblxuICByZXR1cm4gbm90O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3BhbicsXG4gIGluaXRUYWJsZTogZnVuY3Rpb24gaW5pdFRhYmxlKCkge1xuICAgIHZhciBidWZmZXJMID0gbmV3IEZsb2F0MzJBcnJheSgxMDI0KSxcbiAgICAgICAgYnVmZmVyUiA9IG5ldyBGbG9hdDMyQXJyYXkoMTAyNCk7XG5cbiAgICB2YXIgc3FydFR3b092ZXJUd28gPSBNYXRoLnNxcnQoMikgLyAyO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDI0OyBpKyspIHtcbiAgICAgIHZhciBwYW4gPSAtMSArIGkgLyAxMDI0ICogMjtcbiAgICAgIGJ1ZmZlckxbaV0gPSBzcXJ0VHdvT3ZlclR3byAqIChNYXRoLmNvcyhwYW4pIC0gTWF0aC5zaW4ocGFuKSk7XG4gICAgICBidWZmZXJSW2ldID0gc3FydFR3b092ZXJUd28gKiAoTWF0aC5jb3MocGFuKSArIE1hdGguc2luKHBhbikpO1xuICAgIH1cblxuICAgIGdlbi5nbG9iYWxzLnBhbkwgPSBkYXRhKGJ1ZmZlckwsIDEsIHsgaW1tdXRhYmxlOiB0cnVlIH0pO1xuICAgIGdlbi5nbG9iYWxzLnBhblIgPSBkYXRhKGJ1ZmZlclIsIDEsIHsgaW1tdXRhYmxlOiB0cnVlIH0pO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsZWZ0SW5wdXQsIHJpZ2h0SW5wdXQsIHBhbiwgcHJvcGVydGllcykge1xuICBpZiAoZ2VuLmdsb2JhbHMucGFuTCA9PT0gdW5kZWZpbmVkKSBwcm90by5pbml0VGFibGUoKTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIHVpZDogZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2xlZnRJbnB1dCwgcmlnaHRJbnB1dF0sXG4gICAgbGVmdDogbXVsKGxlZnRJbnB1dCwgcGVlayhnZW4uZ2xvYmFscy5wYW5MLCBwYW4sIHsgYm91bmRtb2RlOiAnY2xhbXAnIH0pKSxcbiAgICByaWdodDogbXVsKHJpZ2h0SW5wdXQsIHBlZWsoZ2VuLmdsb2JhbHMucGFuUiwgcGFuLCB7IGJvdW5kbW9kZTogJ2NsYW1wJyB9KSlcbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSk7XG5cbiAgICBfZ2VuLnBhcmFtcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIHRoaXMpKTtcblxuICAgIHRoaXMudmFsdWUgPSB0aGlzLmluaXRpYWxWYWx1ZTtcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJ21lbW9yeVsnICsgdGhpcy5tZW1vcnkudmFsdWUuaWR4ICsgJ10nO1xuXG4gICAgcmV0dXJuIF9nZW4ubWVtb1t0aGlzLm5hbWVdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHByb3BOYW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1swXTtcbiAgdmFyIHZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1sxXTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGlmICh0eXBlb2YgcHJvcE5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgdWdlbi5uYW1lID0gJ3BhcmFtJyArIF9nZW4uZ2V0VUlEKCk7XG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSBwcm9wTmFtZTtcbiAgfSBlbHNlIHtcbiAgICB1Z2VuLm5hbWUgPSBwcm9wTmFtZTtcbiAgICB1Z2VuLmluaXRpYWxWYWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIGlmICh0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIF9nZW4ubWVtb3J5LmhlYXBbdGhpcy5tZW1vcnkudmFsdWUuaWR4XTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHYpIHtcbiAgICAgIGlmICh0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwpIHtcbiAgICAgICAgX2dlbi5tZW1vcnkuaGVhcFt0aGlzLm1lbW9yeS52YWx1ZS5pZHhdID0gdjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlOiB7IGxlbmd0aDogMSwgaWR4OiBudWxsIH1cbiAgfTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdwZWVrJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMCxcbiAgICAgICAgZnVuY3Rpb25Cb2R5ID0gdm9pZCAwLFxuICAgICAgICBuZXh0ID0gdm9pZCAwLFxuICAgICAgICBsZW5ndGhJc0xvZzIgPSB2b2lkIDAsXG4gICAgICAgIGlkeCA9IHZvaWQgMDtcblxuICAgIC8vaWR4ID0gdGhpcy5kYXRhLmdlbigpXG4gICAgaWR4ID0gaW5wdXRzWzFdO1xuICAgIGxlbmd0aElzTG9nMiA9IChNYXRoLmxvZzIodGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGgpIHwgMCkgPT09IE1hdGgubG9nMih0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCk7XG5cbiAgICAvL2NvbnNvbGUubG9nKCBcIkxFTkdUSCBJUyBMT0cyXCIsIGxlbmd0aElzTG9nMiwgdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKVxuICAgIC8vJHt0aGlzLm5hbWV9X2luZGV4ID0gJHt0aGlzLm5hbWV9X3BoYXNlIHwgMCxcXG5gXG4gICAgaWYgKHRoaXMubW9kZSAhPT0gJ3NpbXBsZScpIHtcblxuICAgICAgZnVuY3Rpb25Cb2R5ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnX2RhdGFJZHggID0gJyArIGlkeCArICcsIFxcbiAgICAgICcgKyB0aGlzLm5hbWUgKyAnX3BoYXNlID0gJyArICh0aGlzLm1vZGUgPT09ICdzYW1wbGVzJyA/IGlucHV0c1swXSA6IGlucHV0c1swXSArICcgKiAnICsgKHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMSkpICsgJywgXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfaW5kZXggPSAnICsgdGhpcy5uYW1lICsgJ19waGFzZSB8IDAsXFxuJztcblxuICAgICAgLy9uZXh0ID0gbGVuZ3RoSXNMb2cyID9cbiAgICAgIGlmICh0aGlzLmJvdW5kbW9kZSA9PT0gJ3dyYXAnKSB7XG4gICAgICAgIG5leHQgPSBsZW5ndGhJc0xvZzIgPyAnKCAnICsgdGhpcy5uYW1lICsgJ19pbmRleCArIDEgKSAmICgnICsgdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKyAnIC0gMSknIDogdGhpcy5uYW1lICsgJ19pbmRleCArIDEgPj0gJyArIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoICsgJyA/ICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4ICsgMSAtICcgKyB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCArICcgOiAnICsgdGhpcy5uYW1lICsgJ19pbmRleCArIDEnO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmJvdW5kbW9kZSA9PT0gJ2NsYW1wJykge1xuICAgICAgICBuZXh0ID0gdGhpcy5uYW1lICsgJ19pbmRleCArIDEgPj0gJyArICh0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDEpICsgJyA/ICcgKyAodGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxKSArICcgOiAnICsgdGhpcy5uYW1lICsgJ19pbmRleCArIDEnO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pbnRlcnAgPT09ICdsaW5lYXInKSB7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSAnICAgICAgJyArIHRoaXMubmFtZSArICdfZnJhYyAgPSAnICsgdGhpcy5uYW1lICsgJ19waGFzZSAtICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4LFxcbiAgICAgICcgKyB0aGlzLm5hbWUgKyAnX2Jhc2UgID0gbWVtb3J5WyAnICsgdGhpcy5uYW1lICsgJ19kYXRhSWR4ICsgICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4IF0sXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfbmV4dCAgPSAnICsgbmV4dCArICcsICAgICBcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19vdXQgICA9ICcgKyB0aGlzLm5hbWUgKyAnX2Jhc2UgKyAnICsgdGhpcy5uYW1lICsgJ19mcmFjICogKCBtZW1vcnlbICcgKyB0aGlzLm5hbWUgKyAnX2RhdGFJZHggKyAnICsgdGhpcy5uYW1lICsgJ19uZXh0IF0gLSAnICsgdGhpcy5uYW1lICsgJ19iYXNlIClcXG5cXG4nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnVuY3Rpb25Cb2R5ICs9ICcgICAgICAnICsgdGhpcy5uYW1lICsgJ19vdXQgPSBtZW1vcnlbICcgKyB0aGlzLm5hbWUgKyAnX2RhdGFJZHggKyAnICsgdGhpcy5uYW1lICsgJ19pbmRleCBdXFxuXFxuJztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbW9kZSBpcyBzaW1wbGVcbiAgICAgIGZ1bmN0aW9uQm9keSA9ICdtZW1vcnlbICcgKyBpZHggKyAnICsgJyArIGlucHV0c1swXSArICcgXSc7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbkJvZHk7XG4gICAgfVxuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX291dCc7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSArICdfb3V0JywgZnVuY3Rpb25Cb2R5XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZGF0YSwgaW5kZXgsIHByb3BlcnRpZXMpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGRlZmF1bHRzID0geyBjaGFubmVsczogMSwgbW9kZTogJ3BoYXNlJywgaW50ZXJwOiAnbGluZWFyJywgYm91bmRtb2RlOiAnd3JhcCcgfTtcblxuICBpZiAocHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBwcm9wZXJ0aWVzKTtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICBkYXRhOiBkYXRhLFxuICAgIGRhdGFOYW1lOiBkYXRhLm5hbWUsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luZGV4LCBkYXRhXVxuICB9LCBkZWZhdWx0cyk7XG5cbiAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGFjY3VtID0gcmVxdWlyZSgnLi9hY2N1bS5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgcHJvdG8gPSB7IGJhc2VuYW1lOiAncGhhc29yJyB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZyZXF1ZW5jeSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbMF07XG4gIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMV07XG4gIHZhciBwcm9wcyA9IGFyZ3VtZW50c1syXTtcblxuICBpZiAocHJvcHMgPT09IHVuZGVmaW5lZCkgcHJvcHMgPSB7IG1pbjogLTEgfTtcblxuICB2YXIgcmFuZ2UgPSAocHJvcHMubWF4IHx8IDEpIC0gcHJvcHMubWluO1xuXG4gIHZhciB1Z2VuID0gdHlwZW9mIGZyZXF1ZW5jeSA9PT0gJ251bWJlcicgPyBhY2N1bShmcmVxdWVuY3kgKiByYW5nZSAvIGdlbi5zYW1wbGVyYXRlLCByZXNldCwgcHJvcHMpIDogYWNjdW0obXVsKGZyZXF1ZW5jeSwgMSAvIGdlbi5zYW1wbGVyYXRlIC8gKDEgLyByYW5nZSkpLCByZXNldCwgcHJvcHMpO1xuXG4gIHVnZW4ubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHdyYXAgPSByZXF1aXJlKCcuL3dyYXAuanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3Bva2UnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBkYXRhTmFtZSA9ICdtZW1vcnknLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgaWR4ID0gdm9pZCAwLFxuICAgICAgICBvdXQgPSB2b2lkIDAsXG4gICAgICAgIHdyYXBwZWQgPSB2b2lkIDA7XG5cbiAgICBpZHggPSB0aGlzLmRhdGEuZ2VuKCk7XG5cbiAgICAvL2dlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgLy93cmFwcGVkID0gd3JhcCggdGhpcy5pbnB1dHNbMV0sIDAsIHRoaXMuZGF0YUxlbmd0aCApLmdlbigpXG4gICAgLy9pZHggPSB3cmFwcGVkWzBdXG4gICAgLy9nZW4uZnVuY3Rpb25Cb2R5ICs9IHdyYXBwZWRbMV1cbiAgICB2YXIgb3V0cHV0U3RyID0gdGhpcy5pbnB1dHNbMV0gPT09IDAgPyAnICAnICsgZGF0YU5hbWUgKyAnWyAnICsgaWR4ICsgJyBdID0gJyArIGlucHV0c1swXSArICdcXG4nIDogJyAgJyArIGRhdGFOYW1lICsgJ1sgJyArIGlkeCArICcgKyAnICsgaW5wdXRzWzFdICsgJyBdID0gJyArIGlucHV0c1swXSArICdcXG4nO1xuXG4gICAgaWYgKHRoaXMuaW5saW5lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIF9nZW4uZnVuY3Rpb25Cb2R5ICs9IG91dHB1dFN0cjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFt0aGlzLmlubGluZSwgb3V0cHV0U3RyXTtcbiAgICB9XG4gIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkYXRhLCB2YWx1ZSwgaW5kZXgsIHByb3BlcnRpZXMpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGRlZmF1bHRzID0geyBjaGFubmVsczogMSB9O1xuXG4gIGlmIChwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIGRhdGE6IGRhdGEsXG4gICAgZGF0YU5hbWU6IGRhdGEubmFtZSxcbiAgICBkYXRhTGVuZ3RoOiBkYXRhLmJ1ZmZlci5sZW5ndGgsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW3ZhbHVlLCBpbmRleF1cbiAgfSwgZGVmYXVsdHMpO1xuXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICBfZ2VuLmhpc3Rvcmllcy5zZXQodWdlbi5uYW1lLCB1Z2VuKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdwb3cnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkgfHwgaXNOYU4oaW5wdXRzWzFdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoeyAncG93JzogTWF0aC5wb3cgfSk7XG5cbiAgICAgIG91dCA9ICdnZW4ucG93KCAnICsgaW5wdXRzWzBdICsgJywgJyArIGlucHV0c1sxXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgaW5wdXRzWzBdID09PSAnc3RyaW5nJyAmJiBpbnB1dHNbMF1bMF0gPT09ICcoJykge1xuICAgICAgICBpbnB1dHNbMF0gPSBpbnB1dHNbMF0uc2xpY2UoMSwgLTEpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBpbnB1dHNbMV0gPT09ICdzdHJpbmcnICYmIGlucHV0c1sxXVswXSA9PT0gJygnKSB7XG4gICAgICAgIGlucHV0c1sxXSA9IGlucHV0c1sxXS5zbGljZSgxLCAtMSk7XG4gICAgICB9XG5cbiAgICAgIG91dCA9IE1hdGgucG93KHBhcnNlRmxvYXQoaW5wdXRzWzBdKSwgcGFyc2VGbG9hdChpbnB1dHNbMV0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBwb3cgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBwb3cuaW5wdXRzID0gW3gsIHldO1xuICBwb3cuaWQgPSBfZ2VuLmdldFVJRCgpO1xuICBwb3cubmFtZSA9IHBvdy5iYXNlbmFtZSArICd7cG93LmlkfSc7XG5cbiAgcmV0dXJuIHBvdztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoJy4vaGlzdG9yeS5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKSxcbiAgICBkZWx0YSA9IHJlcXVpcmUoJy4vZGVsdGEuanMnKSxcbiAgICB3cmFwID0gcmVxdWlyZSgnLi93cmFwLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdyYXRlJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIHBoYXNlID0gaGlzdG9yeSgpLFxuICAgICAgICBpbk1pbnVzMSA9IGhpc3RvcnkoKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZmlsdGVyID0gdm9pZCAwLFxuICAgICAgICBzdW0gPSB2b2lkIDAsXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCB0aGlzKSk7XG5cbiAgICBvdXQgPSAnIHZhciAnICsgdGhpcy5uYW1lICsgJ19kaWZmID0gJyArIGlucHV0c1swXSArICcgLSAnICsgZ2VuTmFtZSArICcubGFzdFNhbXBsZVxcbiAgaWYoICcgKyB0aGlzLm5hbWUgKyAnX2RpZmYgPCAtLjUgKSAnICsgdGhpcy5uYW1lICsgJ19kaWZmICs9IDFcXG4gICcgKyBnZW5OYW1lICsgJy5waGFzZSArPSAnICsgdGhpcy5uYW1lICsgJ19kaWZmICogJyArIGlucHV0c1sxXSArICdcXG4gIGlmKCAnICsgZ2VuTmFtZSArICcucGhhc2UgPiAxICkgJyArIGdlbk5hbWUgKyAnLnBoYXNlIC09IDFcXG4gICcgKyBnZW5OYW1lICsgJy5sYXN0U2FtcGxlID0gJyArIGlucHV0c1swXSArICdcXG4nO1xuICAgIG91dCA9ICcgJyArIG91dDtcblxuICAgIHJldHVybiBbZ2VuTmFtZSArICcucGhhc2UnLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIHJhdGUpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICBwaGFzZTogMCxcbiAgICBsYXN0U2FtcGxlOiAwLFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjEsIHJhdGVdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAncm91bmQnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCBNYXRoLnJvdW5kKSk7XG5cbiAgICAgIG91dCA9ICdnZW4ucm91bmQoICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgcm91bmQgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICByb3VuZC5pbnB1dHMgPSBbeF07XG5cbiAgcmV0dXJuIHJvdW5kO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3NhaCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBfZ2VuLmRhdGFbdGhpcy5uYW1lXSA9IDA7XG4gICAgX2dlbi5kYXRhW3RoaXMubmFtZSArICdfY29udHJvbCddID0gMDtcblxuICAgIG91dCA9ICcgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gZ2VuLmRhdGEuJyArIHRoaXMubmFtZSArICdfY29udHJvbCxcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ190cmlnZ2VyID0gJyArIGlucHV0c1sxXSArICcgPiAnICsgaW5wdXRzWzJdICsgJyA/IDEgOiAwXFxuXFxuICBpZiggJyArIHRoaXMubmFtZSArICdfdHJpZ2dlciAhPT0gJyArIHRoaXMubmFtZSArICcgICkge1xcbiAgICBpZiggJyArIHRoaXMubmFtZSArICdfdHJpZ2dlciA9PT0gMSApIFxcbiAgICAgIGdlbi5kYXRhLicgKyB0aGlzLm5hbWUgKyAnID0gJyArIGlucHV0c1swXSArICdcXG4gICAgZ2VuLmRhdGEuJyArIHRoaXMubmFtZSArICdfY29udHJvbCA9ICcgKyB0aGlzLm5hbWUgKyAnX3RyaWdnZXJcXG4gIH1cXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSAnZ2VuLmRhdGEuJyArIHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbJ2dlbi5kYXRhLicgKyB0aGlzLm5hbWUsICcgJyArIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSwgY29udHJvbCkge1xuICB2YXIgdGhyZXNob2xkID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1syXTtcbiAgdmFyIHByb3BlcnRpZXMgPSBhcmd1bWVudHNbM107XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGRlZmF1bHRzID0geyBpbml0OiAwIH07XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgcHJvcGVydGllcyk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgbGFzdFNhbXBsZTogMCxcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBjb250cm9sLCB0aHJlc2hvbGRdXG4gIH0sIGRlZmF1bHRzKTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdzZWxlY3RvcicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDAsXG4gICAgICAgIHJldHVyblZhbHVlID0gMDtcblxuICAgIHN3aXRjaCAoaW5wdXRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm5WYWx1ZSA9IGlucHV0c1sxXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJ19vdXQgPSAnICsgaW5wdXRzWzBdICsgJyA9PT0gMSA/ICcgKyBpbnB1dHNbMV0gKyAnIDogJyArIGlucHV0c1syXSArICdcXG5cXG4nO1xuICAgICAgICByZXR1cm5WYWx1ZSA9IFt0aGlzLm5hbWUgKyAnX291dCcsIG91dF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICdfb3V0ID0gMFxcbiAgc3dpdGNoKCAnICsgaW5wdXRzWzBdICsgJyArIDEgKSB7XFxuJztcblxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIG91dCArPSAnICAgIGNhc2UgJyArIGkgKyAnOiAnICsgdGhpcy5uYW1lICsgJ19vdXQgPSAnICsgaW5wdXRzW2ldICsgJzsgYnJlYWs7XFxuJztcbiAgICAgICAgfVxuXG4gICAgICAgIG91dCArPSAnICB9XFxuXFxuJztcblxuICAgICAgICByZXR1cm5WYWx1ZSA9IFt0aGlzLm5hbWUgKyAnX291dCcsICcgJyArIG91dF07XG4gICAgfVxuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX291dCc7XG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgaW5wdXRzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgaW5wdXRzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBpbnB1dHNcbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdzaWduJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sIHRoaXMubmFtZSwgTWF0aC5zaWduKSk7XG5cbiAgICAgIG91dCA9ICdnZW4uc2lnbiggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2lnbihwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIHNpZ24gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBzaWduLmlucHV0cyA9IFt4XTtcblxuICByZXR1cm4gc2lnbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdzaW4nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKHsgJ3Npbic6IE1hdGguc2luIH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLnNpbiggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2luKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgc2luID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgc2luLmlucHV0cyA9IFt4XTtcbiAgc2luLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgc2luLm5hbWUgPSBzaW4uYmFzZW5hbWUgKyAne3Npbi5pZH0nO1xuXG4gIHJldHVybiBzaW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoJy4vaGlzdG9yeS5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKSxcbiAgICBfc3dpdGNoID0gcmVxdWlyZSgnLi9zd2l0Y2guanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xKSB7XG4gICAgdmFyIHNsaWRlVXAgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAxIDogYXJndW1lbnRzWzFdO1xuICAgIHZhciBzbGlkZURvd24gPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyAxIDogYXJndW1lbnRzWzJdO1xuXG4gICAgdmFyIHkxID0gaGlzdG9yeSgwKSxcbiAgICAgICAgZmlsdGVyID0gdm9pZCAwLFxuICAgICAgICBzbGlkZUFtb3VudCA9IHZvaWQgMDtcblxuICAgIC8veSAobikgPSB5IChuLTEpICsgKCh4IChuKSAtIHkgKG4tMSkpL3NsaWRlKVxuICAgIHNsaWRlQW1vdW50ID0gX3N3aXRjaChndChpbjEsIHkxLm91dCksIHNsaWRlVXAsIHNsaWRlRG93bik7XG5cbiAgICBmaWx0ZXIgPSBtZW1vKGFkZCh5MS5vdXQsIGRpdihzdWIoaW4xLCB5MS5vdXQpLCBzbGlkZUFtb3VudCkpKTtcblxuICAgIHkxLmluKGZpbHRlcik7XG5cbiAgICByZXR1cm4gZmlsdGVyO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciBzdWIgPSB7XG4gICAgaWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgICAgb3V0ID0gMCxcbiAgICAgICAgICBkaWZmID0gMCxcbiAgICAgICAgICBuZWVkc1BhcmVucyA9IGZhbHNlLFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWzBdLFxuICAgICAgICAgIGxhc3ROdW1iZXJJc1VnZW4gPSBpc05hTihsYXN0TnVtYmVyKSxcbiAgICAgICAgICBzdWJBdEVuZCA9IGZhbHNlLFxuICAgICAgICAgIGhhc1VnZW5zID0gZmFsc2UsXG4gICAgICAgICAgcmV0dXJuVmFsdWUgPSAwO1xuXG4gICAgICB0aGlzLmlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSBoYXNVZ2VucyA9IHRydWU7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGhhc1VnZW5zKSB7XG4gICAgICAgIC8vIHN0b3JlIGluIHZhcmlhYmxlIGZvciBmdXR1cmUgcmVmZXJlbmNlXG4gICAgICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICgnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0ID0gJygnO1xuICAgICAgfVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xuICAgICAgICBpZiAoaSA9PT0gMCkgcmV0dXJuO1xuXG4gICAgICAgIHZhciBpc051bWJlclVnZW4gPSBpc05hTih2KSxcbiAgICAgICAgICAgIGlzRmluYWxJZHggPSBpID09PSBpbnB1dHMubGVuZ3RoIC0gMTtcblxuICAgICAgICBpZiAoIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbikge1xuICAgICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC0gdjtcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlcjtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmVlZHNQYXJlbnMgPSB0cnVlO1xuICAgICAgICAgIG91dCArPSBsYXN0TnVtYmVyICsgJyAtICcgKyB2O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpc0ZpbmFsSWR4KSBvdXQgKz0gJyAtICc7XG4gICAgICB9KTtcblxuICAgICAgaWYgKG5lZWRzUGFyZW5zKSB7XG4gICAgICAgIG91dCArPSAnKSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXQgPSBvdXQuc2xpY2UoMSk7IC8vIHJlbW92ZSBvcGVuaW5nIHBhcmVuXG4gICAgICB9XG5cbiAgICAgIGlmIChoYXNVZ2Vucykgb3V0ICs9ICdcXG4nO1xuXG4gICAgICByZXR1cm5WYWx1ZSA9IGhhc1VnZW5zID8gW3RoaXMubmFtZSwgb3V0XSA6IG91dDtcblxuICAgICAgaWYgKGhhc1VnZW5zKSBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgIH1cbiAgfTtcblxuICBzdWIubmFtZSA9ICdzdWInICsgc3ViLmlkO1xuXG4gIHJldHVybiBzdWI7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnc3dpdGNoJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIGlmIChpbnB1dHNbMV0gPT09IGlucHV0c1syXSkgcmV0dXJuIGlucHV0c1sxXTsgLy8gaWYgYm90aCBwb3RlbnRpYWwgb3V0cHV0cyBhcmUgdGhlIHNhbWUganVzdCByZXR1cm4gb25lIG9mIHRoZW1cblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJ19vdXQgPSAnICsgaW5wdXRzWzBdICsgJyA9PT0gMSA/ICcgKyBpbnB1dHNbMV0gKyAnIDogJyArIGlucHV0c1syXSArICdcXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX291dCc7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSArICdfb3V0Jywgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29udHJvbCkge1xuICB2YXIgaW4xID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMSA6IGFyZ3VtZW50c1sxXTtcbiAgdmFyIGluMiA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMl07XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2NvbnRyb2wsIGluMSwgaW4yXVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICd0NjAnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IHZvaWQgMDtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sICdleHAnLCBNYXRoLmV4cCkpO1xuXG4gICAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSBnZW4uZXhwKCAtNi45MDc3NTUyNzg5MjEgLyAnICsgaW5wdXRzWzBdICsgJyApXFxuXFxuJztcblxuICAgICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSBvdXQ7XG5cbiAgICAgIHJldHVyblZhbHVlID0gW3RoaXMubmFtZSwgb3V0XTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5leHAoLTYuOTA3NzU1Mjc4OTIxIC8gaW5wdXRzWzBdKTtcblxuICAgICAgcmV0dXJuVmFsdWUgPSBvdXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciB0NjAgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICB0NjAuaW5wdXRzID0gW3hdO1xuICB0NjAubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdDYwO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3RhbicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoeyAndGFuJzogTWF0aC50YW4gfSk7XG5cbiAgICAgIG91dCA9ICdnZW4udGFuKCAnICsgaW5wdXRzWzBdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW4ocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciB0YW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICB0YW4uaW5wdXRzID0gW3hdO1xuICB0YW4uaWQgPSBfZ2VuLmdldFVJRCgpO1xuICB0YW4ubmFtZSA9IHRhbi5iYXNlbmFtZSArICd7dGFuLmlkfSc7XG5cbiAgcmV0dXJuIHRhbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBsdCA9IHJlcXVpcmUoJy4vbHQuanMnKSxcbiAgICBwaGFzb3IgPSByZXF1aXJlKCcuL3BoYXNvci5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZyZXF1ZW5jeSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDQ0MCA6IGFyZ3VtZW50c1swXTtcbiAgdmFyIHB1bHNld2lkdGggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAuNSA6IGFyZ3VtZW50c1sxXTtcblxuICB2YXIgZ3JhcGggPSBsdChhY2N1bShkaXYoZnJlcXVlbmN5LCA0NDEwMCkpLCAuNSk7XG5cbiAgZ3JhcGgubmFtZSA9ICd0cmFpbicgKyBnZW4uZ2V0VUlEKCk7XG5cbiAgcmV0dXJuIGdyYXBoO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEuanMnKTtcblxudmFyIGlzU3RlcmVvID0gZmFsc2U7XG5cbnZhciB1dGlsaXRpZXMgPSB7XG4gIGN0eDogbnVsbCxcblxuICBjbGVhcjogZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgdGhpcy5jYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH07XG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgICAgcmV0dXJuIHYoKTtcbiAgICB9KTtcbiAgICB0aGlzLmNsZWFyLmNhbGxiYWNrcy5sZW5ndGggPSAwO1xuICB9LFxuICBjcmVhdGVDb250ZXh0OiBmdW5jdGlvbiBjcmVhdGVDb250ZXh0KCkge1xuICAgIHZhciBBQyA9IHR5cGVvZiBBdWRpb0NvbnRleHQgPT09ICd1bmRlZmluZWQnID8gd2Via2l0QXVkaW9Db250ZXh0IDogQXVkaW9Db250ZXh0O1xuICAgIHRoaXMuY3R4ID0gbmV3IEFDKCk7XG4gICAgZ2VuLnNhbXBsZXJhdGUgPSB0aGlzLmN0eC5zYW1wbGVSYXRlO1xuXG4gICAgdmFyIHN0YXJ0ID0gZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICBpZiAodHlwZW9mIEFDICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgc3RhcnQpO1xuXG4gICAgICAgICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgICAgICAgLy8gcmVxdWlyZWQgdG8gc3RhcnQgYXVkaW8gdW5kZXIgaU9TIDZcbiAgICAgICAgICAgIHZhciBteVNvdXJjZSA9IHV0aWxpdGllcy5jdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICAgICAgICBteVNvdXJjZS5jb25uZWN0KHV0aWxpdGllcy5jdHguZGVzdGluYXRpb24pO1xuICAgICAgICAgICAgbXlTb3VyY2Uubm90ZU9uKDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBzdGFydCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGNyZWF0ZVNjcmlwdFByb2Nlc3NvcjogZnVuY3Rpb24gY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCkge1xuICAgIHRoaXMubm9kZSA9IHRoaXMuY3R4LmNyZWF0ZVNjcmlwdFByb2Nlc3NvcigxMDI0LCAwLCAyKSwgdGhpcy5jbGVhckZ1bmN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSwgdGhpcy5jYWxsYmFjayA9IHRoaXMuY2xlYXJGdW5jdGlvbjtcblxuICAgIHRoaXMubm9kZS5vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uIChhdWRpb1Byb2Nlc3NpbmdFdmVudCkge1xuICAgICAgdmFyIG91dHB1dEJ1ZmZlciA9IGF1ZGlvUHJvY2Vzc2luZ0V2ZW50Lm91dHB1dEJ1ZmZlcjtcblxuICAgICAgdmFyIGxlZnQgPSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCksXG4gICAgICAgICAgcmlnaHQgPSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMSk7XG5cbiAgICAgIGZvciAodmFyIHNhbXBsZSA9IDA7IHNhbXBsZSA8IGxlZnQubGVuZ3RoOyBzYW1wbGUrKykge1xuICAgICAgICBpZiAoIWlzU3RlcmVvKSB7XG4gICAgICAgICAgbGVmdFtzYW1wbGVdID0gcmlnaHRbc2FtcGxlXSA9IHV0aWxpdGllcy5jYWxsYmFjaygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBvdXQgPSB1dGlsaXRpZXMuY2FsbGJhY2soKTtcbiAgICAgICAgICBsZWZ0W3NhbXBsZV0gPSBvdXRbMF07XG4gICAgICAgICAgcmlnaHRbc2FtcGxlXSA9IG91dFsxXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm5vZGUuY29ubmVjdCh0aGlzLmN0eC5kZXN0aW5hdGlvbik7XG5cbiAgICAvL3RoaXMubm9kZS5jb25uZWN0KCB0aGlzLmFuYWx5emVyIClcblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBwbGF5R3JhcGg6IGZ1bmN0aW9uIHBsYXlHcmFwaChncmFwaCwgZGVidWcpIHtcbiAgICB2YXIgbWVtID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gNDQxMDAgKiAxMCA6IGFyZ3VtZW50c1syXTtcblxuICAgIHV0aWxpdGllcy5jbGVhcigpO1xuICAgIGlmIChkZWJ1ZyA9PT0gdW5kZWZpbmVkKSBkZWJ1ZyA9IGZhbHNlO1xuXG4gICAgaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KGdyYXBoKTtcblxuICAgIHV0aWxpdGllcy5jYWxsYmFjayA9IGdlbi5jcmVhdGVDYWxsYmFjayhncmFwaCwgbWVtLCBkZWJ1Zyk7XG5cbiAgICBpZiAodXRpbGl0aWVzLmNvbnNvbGUpIHV0aWxpdGllcy5jb25zb2xlLnNldFZhbHVlKHV0aWxpdGllcy5jYWxsYmFjay50b1N0cmluZygpKTtcblxuICAgIHJldHVybiB1dGlsaXRpZXMuY2FsbGJhY2s7XG4gIH0sXG4gIGxvYWRTYW1wbGU6IGZ1bmN0aW9uIGxvYWRTYW1wbGUoc291bmRGaWxlUGF0aCwgZGF0YSkge1xuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICByZXEub3BlbignR0VUJywgc291bmRGaWxlUGF0aCwgdHJ1ZSk7XG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhdWRpb0RhdGEgPSByZXEucmVzcG9uc2U7XG5cbiAgICAgICAgdXRpbGl0aWVzLmN0eC5kZWNvZGVBdWRpb0RhdGEoYXVkaW9EYXRhLCBmdW5jdGlvbiAoYnVmZmVyKSB7XG4gICAgICAgICAgZGF0YS5idWZmZXIgPSBidWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7XG4gICAgICAgICAgcmVzb2x2ZShkYXRhLmJ1ZmZlcik7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJlcS5zZW5kKCk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxufTtcblxudXRpbGl0aWVzLmNsZWFyLmNhbGxiYWNrcyA9IFtdO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxpdGllczsiLCIndXNlIHN0cmljdCc7XG5cbi8qXG4gKiBhZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2NvcmJhbmJyb29rL2RzcC5qcy9ibG9iL21hc3Rlci9kc3AuanNcbiAqIHN0YXJ0aW5nIGF0IGxpbmUgMTQyN1xuICogdGFrZW4gOC8xNS8xNlxuKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJhcnRsZXR0OiBmdW5jdGlvbiBiYXJ0bGV0dChsZW5ndGgsIGluZGV4KSB7XG4gICAgcmV0dXJuIDIgLyAobGVuZ3RoIC0gMSkgKiAoKGxlbmd0aCAtIDEpIC8gMiAtIE1hdGguYWJzKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikpO1xuICB9LFxuICBiYXJ0bGV0dEhhbm46IGZ1bmN0aW9uIGJhcnRsZXR0SGFubihsZW5ndGgsIGluZGV4KSB7XG4gICAgcmV0dXJuIDAuNjIgLSAwLjQ4ICogTWF0aC5hYnMoaW5kZXggLyAobGVuZ3RoIC0gMSkgLSAwLjUpIC0gMC4zOCAqIE1hdGguY29zKDIgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpO1xuICB9LFxuICBibGFja21hbjogZnVuY3Rpb24gYmxhY2ttYW4obGVuZ3RoLCBpbmRleCwgYWxwaGEpIHtcbiAgICB2YXIgYTAgPSAoMSAtIGFscGhhKSAvIDIsXG4gICAgICAgIGExID0gMC41LFxuICAgICAgICBhMiA9IGFscGhhIC8gMjtcblxuICAgIHJldHVybiBhMCAtIGExICogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSkgKyBhMiAqIE1hdGguY29zKDQgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpO1xuICB9LFxuICBjb3NpbmU6IGZ1bmN0aW9uIGNvc2luZShsZW5ndGgsIGluZGV4KSB7XG4gICAgcmV0dXJuIE1hdGguY29zKE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSAtIE1hdGguUEkgLyAyKTtcbiAgfSxcbiAgZ2F1c3M6IGZ1bmN0aW9uIGdhdXNzKGxlbmd0aCwgaW5kZXgsIGFscGhhKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KE1hdGguRSwgLTAuNSAqIE1hdGgucG93KChpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpIC8gKGFscGhhICogKGxlbmd0aCAtIDEpIC8gMiksIDIpKTtcbiAgfSxcbiAgaGFtbWluZzogZnVuY3Rpb24gaGFtbWluZyhsZW5ndGgsIGluZGV4KSB7XG4gICAgcmV0dXJuIDAuNTQgLSAwLjQ2ICogTWF0aC5jb3MoTWF0aC5QSSAqIDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSk7XG4gIH0sXG4gIGhhbm46IGZ1bmN0aW9uIGhhbm4obGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiAwLjUgKiAoMSAtIE1hdGguY29zKE1hdGguUEkgKiAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkpKTtcbiAgfSxcbiAgbGFuY3pvczogZnVuY3Rpb24gbGFuY3pvcyhsZW5ndGgsIGluZGV4KSB7XG4gICAgdmFyIHggPSAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSAxO1xuICAgIHJldHVybiBNYXRoLnNpbihNYXRoLlBJICogeCkgLyAoTWF0aC5QSSAqIHgpO1xuICB9LFxuICByZWN0YW5ndWxhcjogZnVuY3Rpb24gcmVjdGFuZ3VsYXIobGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiAxO1xuICB9LFxuICB0cmlhbmd1bGFyOiBmdW5jdGlvbiB0cmlhbmd1bGFyKGxlbmd0aCwgaW5kZXgpIHtcbiAgICByZXR1cm4gMiAvIGxlbmd0aCAqIChsZW5ndGggLyAyIC0gTWF0aC5hYnMoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSk7XG4gIH0sXG4gIGV4cG9uZW50aWFsOiBmdW5jdGlvbiBleHBvbmVudGlhbChsZW5ndGgsIGluZGV4LCBhbHBoYSkge1xuICAgIHJldHVybiBNYXRoLnBvdyhpbmRleCAvIGxlbmd0aCwgYWxwaGEpO1xuICB9LFxuICBsaW5lYXI6IGZ1bmN0aW9uIGxpbmVhcihsZW5ndGgsIGluZGV4KSB7XG4gICAgcmV0dXJuIGluZGV4IC8gbGVuZ3RoO1xuICB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yID0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnd3JhcCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGNvZGUgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBzaWduYWwgPSBpbnB1dHNbMF0sXG4gICAgICAgIG1pbiA9IGlucHV0c1sxXSxcbiAgICAgICAgbWF4ID0gaW5wdXRzWzJdLFxuICAgICAgICBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGRpZmYgPSB2b2lkIDA7XG5cbiAgICAvL291dCA9IGAoKCgke2lucHV0c1swXX0gLSAke3RoaXMubWlufSkgJSAke2RpZmZ9ICArICR7ZGlmZn0pICUgJHtkaWZmfSArICR7dGhpcy5taW59KWBcbiAgICAvL2NvbnN0IGxvbmcgbnVtV3JhcHMgPSBsb25nKCh2LWxvKS9yYW5nZSkgLSAodiA8IGxvKTtcbiAgICAvL3JldHVybiB2IC0gcmFuZ2UgKiBkb3VibGUobnVtV3JhcHMpOyAgXG5cbiAgICBpZiAodGhpcy5taW4gPT09IDApIHtcbiAgICAgIGRpZmYgPSBtYXg7XG4gICAgfSBlbHNlIGlmIChpc05hTihtYXgpIHx8IGlzTmFOKG1pbikpIHtcbiAgICAgIGRpZmYgPSBtYXggKyAnIC0gJyArIG1pbjtcbiAgICB9IGVsc2Uge1xuICAgICAgZGlmZiA9IG1heCAtIG1pbjtcbiAgICB9XG5cbiAgICBvdXQgPSAnIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICcgKyBpbnB1dHNbMF0gKyAnXFxuICBpZiggJyArIHRoaXMubmFtZSArICcgPCAnICsgdGhpcy5taW4gKyAnICkgJyArIHRoaXMubmFtZSArICcgKz0gJyArIGRpZmYgKyAnXFxuICBlbHNlIGlmKCAnICsgdGhpcy5uYW1lICsgJyA+ICcgKyB0aGlzLm1heCArICcgKSAnICsgdGhpcy5uYW1lICsgJyAtPSAnICsgZGlmZiArICdcXG5cXG4nO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsICcgJyArIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSkge1xuICB2YXIgbWluID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1sxXTtcbiAgdmFyIG1heCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbMl07XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICBtaW46IG1pbixcbiAgICBtYXg6IG1heCxcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBtaW4sIG1heF1cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIE1lbW9yeUhlbHBlciA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgdmFyIHNpemUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyA0MDk2IDogYXJndW1lbnRzWzBdO1xuICAgIHZhciBtZW10eXBlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gRmxvYXQzMkFycmF5IDogYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIGhlbHBlciA9IE9iamVjdC5jcmVhdGUodGhpcyk7XG5cbiAgICBPYmplY3QuYXNzaWduKGhlbHBlciwge1xuICAgICAgaGVhcDogbmV3IG1lbXR5cGUoc2l6ZSksXG4gICAgICBsaXN0OiB7fSxcbiAgICAgIGZyZWVMaXN0OiB7fVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGhlbHBlcjtcbiAgfSxcbiAgYWxsb2M6IGZ1bmN0aW9uIGFsbG9jKHNpemUsIGltbXV0YWJsZSkge1xuICAgIHZhciBpZHggPSAtMTtcblxuICAgIGlmIChzaXplID4gdGhpcy5oZWFwLmxlbmd0aCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0FsbG9jYXRpb24gcmVxdWVzdCBpcyBsYXJnZXIgdGhhbiBoZWFwIHNpemUgb2YgJyArIHRoaXMuaGVhcC5sZW5ndGgpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmZyZWVMaXN0KSB7XG4gICAgICB2YXIgY2FuZGlkYXRlID0gdGhpcy5mcmVlTGlzdFtrZXldO1xuXG4gICAgICBpZiAoY2FuZGlkYXRlLnNpemUgPj0gc2l6ZSkge1xuICAgICAgICBpZHggPSBrZXk7XG5cbiAgICAgICAgdGhpcy5saXN0W2lkeF0gPSB7IHNpemU6IHNpemUsIGltbXV0YWJsZTogaW1tdXRhYmxlLCByZWZlcmVuY2VzOiAxIH07XG5cbiAgICAgICAgaWYgKGNhbmRpZGF0ZS5zaXplICE9PSBzaXplKSB7XG4gICAgICAgICAgdmFyIG5ld0luZGV4ID0gaWR4ICsgc2l6ZSxcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemUgPSB2b2lkIDA7XG5cbiAgICAgICAgICBmb3IgKHZhciBfa2V5IGluIHRoaXMubGlzdCkge1xuICAgICAgICAgICAgaWYgKF9rZXkgPiBuZXdJbmRleCkge1xuICAgICAgICAgICAgICBuZXdGcmVlU2l6ZSA9IF9rZXkgLSBuZXdJbmRleDtcbiAgICAgICAgICAgICAgdGhpcy5mcmVlTGlzdFtuZXdJbmRleF0gPSBuZXdGcmVlU2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaWR4ICE9PSAtMSkgZGVsZXRlIHRoaXMuZnJlZUxpc3RbaWR4XTtcblxuICAgIGlmIChpZHggPT09IC0xKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMubGlzdCksXG4gICAgICAgICAgbGFzdEluZGV4ID0gdm9pZCAwO1xuXG4gICAgICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gaWYgbm90IGZpcnN0IGFsbG9jYXRpb24uLi5cbiAgICAgICAgbGFzdEluZGV4ID0gcGFyc2VJbnQoa2V5c1trZXlzLmxlbmd0aCAtIDFdKTtcblxuICAgICAgICBpZHggPSBsYXN0SW5kZXggKyB0aGlzLmxpc3RbbGFzdEluZGV4XS5zaXplO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWR4ID0gMDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5saXN0W2lkeF0gPSB7IHNpemU6IHNpemUsIGltbXV0YWJsZTogaW1tdXRhYmxlLCByZWZlcmVuY2VzOiAxIH07XG4gICAgfVxuXG4gICAgaWYgKGlkeCArIHNpemUgPj0gdGhpcy5oZWFwLmxlbmd0aCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ05vIGF2YWlsYWJsZSBibG9ja3MgcmVtYWluIHN1ZmZpY2llbnQgZm9yIGFsbG9jYXRpb24gcmVxdWVzdC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGlkeDtcbiAgfSxcbiAgYWRkUmVmZXJlbmNlOiBmdW5jdGlvbiBhZGRSZWZlcmVuY2UoaW5kZXgpIHtcbiAgICBpZiAodGhpcy5saXN0W2luZGV4XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmxpc3RbaW5kZXhdLnJlZmVyZW5jZXMrKztcbiAgICB9XG4gIH0sXG4gIGZyZWU6IGZ1bmN0aW9uIGZyZWUoaW5kZXgpIHtcbiAgICBpZiAodGhpcy5saXN0W2luZGV4XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2FsbGluZyBmcmVlKCkgb24gbm9uLWV4aXN0aW5nIGJsb2NrLicpO1xuICAgIH1cblxuICAgIHZhciBzbG90ID0gdGhpcy5saXN0W2luZGV4XTtcbiAgICBpZiAoc2xvdCA9PT0gMCkgcmV0dXJuO1xuICAgIHNsb3QucmVmZXJlbmNlcy0tO1xuXG4gICAgaWYgKHNsb3QucmVmZXJlbmNlcyA9PT0gMCAmJiBzbG90LmltbXV0YWJsZSAhPT0gdHJ1ZSkge1xuICAgICAgdGhpcy5saXN0W2luZGV4XSA9IDA7XG5cbiAgICAgIHZhciBmcmVlQmxvY2tTaXplID0gMDtcbiAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmxpc3QpIHtcbiAgICAgICAgaWYgKGtleSA+IGluZGV4KSB7XG4gICAgICAgICAgZnJlZUJsb2NrU2l6ZSA9IGtleSAtIGluZGV4O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZnJlZUxpc3RbaW5kZXhdID0gZnJlZUJsb2NrU2l6ZTtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5SGVscGVyO1xuIiwiLypcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRpbWF0dGVyMTUvaGVhcHF1ZXVlLmpzL2Jsb2IvbWFzdGVyL2hlYXBxdWV1ZS5qc1xuICpcbiAqIFRoaXMgaW1wbGVtZW50YXRpb24gaXMgdmVyeSBsb29zZWx5IGJhc2VkIG9mZiBqcy1wcmlvcml0eS1xdWV1ZVxuICogYnkgQWRhbSBIb29wZXIgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYWRhbWhvb3Blci9qcy1wcmlvcml0eS1xdWV1ZVxuICpcbiAqIFRoZSBqcy1wcmlvcml0eS1xdWV1ZSBpbXBsZW1lbnRhdGlvbiBzZWVtZWQgYSB0ZWVuc3kgYml0IGJsb2F0ZWRcbiAqIHdpdGggaXRzIHJlcXVpcmUuanMgZGVwZW5kZW5jeSBhbmQgbXVsdGlwbGUgc3RvcmFnZSBzdHJhdGVnaWVzXG4gKiB3aGVuIGFsbCBidXQgb25lIHdlcmUgc3Ryb25nbHkgZGlzY291cmFnZWQuIFNvIGhlcmUgaXMgYSBraW5kIG9mXG4gKiBjb25kZW5zZWQgdmVyc2lvbiBvZiB0aGUgZnVuY3Rpb25hbGl0eSB3aXRoIG9ubHkgdGhlIGZlYXR1cmVzIHRoYXRcbiAqIEkgcGFydGljdWxhcmx5IG5lZWRlZC5cbiAqXG4gKiBVc2luZyBpdCBpcyBwcmV0dHkgc2ltcGxlLCB5b3UganVzdCBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgSGVhcFF1ZXVlXG4gKiB3aGlsZSBvcHRpb25hbGx5IHNwZWNpZnlpbmcgYSBjb21wYXJhdG9yIGFzIHRoZSBhcmd1bWVudDpcbiAqXG4gKiB2YXIgaGVhcHEgPSBuZXcgSGVhcFF1ZXVlKCk7XG4gKlxuICogdmFyIGN1c3RvbXEgPSBuZXcgSGVhcFF1ZXVlKGZ1bmN0aW9uKGEsIGIpe1xuICogICAvLyBpZiBiID4gYSwgcmV0dXJuIG5lZ2F0aXZlXG4gKiAgIC8vIG1lYW5zIHRoYXQgaXQgc3BpdHMgb3V0IHRoZSBzbWFsbGVzdCBpdGVtIGZpcnN0XG4gKiAgIHJldHVybiBhIC0gYjtcbiAqIH0pO1xuICpcbiAqIE5vdGUgdGhhdCBpbiB0aGlzIGNhc2UsIHRoZSBkZWZhdWx0IGNvbXBhcmF0b3IgaXMgaWRlbnRpY2FsIHRvXG4gKiB0aGUgY29tcGFyYXRvciB3aGljaCBpcyB1c2VkIGV4cGxpY2l0bHkgaW4gdGhlIHNlY29uZCBxdWV1ZS5cbiAqXG4gKiBPbmNlIHlvdSd2ZSBpbml0aWFsaXplZCB0aGUgaGVhcHF1ZXVlLCB5b3UgY2FuIHBsb3Agc29tZSBuZXdcbiAqIGVsZW1lbnRzIGludG8gdGhlIHF1ZXVlIHdpdGggdGhlIHB1c2ggbWV0aG9kICh2YWd1ZWx5IHJlbWluaXNjZW50XG4gKiBvZiB0eXBpY2FsIGphdmFzY3JpcHQgYXJheXMpXG4gKlxuICogaGVhcHEucHVzaCg0Mik7XG4gKiBoZWFwcS5wdXNoKFwia2l0dGVuXCIpO1xuICpcbiAqIFRoZSBwdXNoIG1ldGhvZCByZXR1cm5zIHRoZSBuZXcgbnVtYmVyIG9mIGVsZW1lbnRzIG9mIHRoZSBxdWV1ZS5cbiAqXG4gKiBZb3UgY2FuIHB1c2ggYW55dGhpbmcgeW91J2QgbGlrZSBvbnRvIHRoZSBxdWV1ZSwgc28gbG9uZyBhcyB5b3VyXG4gKiBjb21wYXJhdG9yIGZ1bmN0aW9uIGlzIGNhcGFibGUgb2YgaGFuZGxpbmcgaXQuIFRoZSBkZWZhdWx0XG4gKiBjb21wYXJhdG9yIGlzIHJlYWxseSBzdHVwaWQgc28gaXQgd29uJ3QgYmUgYWJsZSB0byBoYW5kbGUgYW55dGhpbmdcbiAqIG90aGVyIHRoYW4gYW4gbnVtYmVyIGJ5IGRlZmF1bHQuXG4gKlxuICogWW91IGNhbiBwcmV2aWV3IHRoZSBzbWFsbGVzdCBpdGVtIGJ5IHVzaW5nIHBlZWsuXG4gKlxuICogaGVhcHEucHVzaCgtOTk5OSk7XG4gKiBoZWFwcS5wZWVrKCk7IC8vID09PiAtOTk5OVxuICpcbiAqIFRoZSB1c2VmdWwgY29tcGxlbWVudCB0byB0byB0aGUgcHVzaCBtZXRob2QgaXMgdGhlIHBvcCBtZXRob2QsXG4gKiB3aGljaCByZXR1cm5zIHRoZSBzbWFsbGVzdCBpdGVtIGFuZCB0aGVuIHJlbW92ZXMgaXQgZnJvbSB0aGVcbiAqIHF1ZXVlLlxuICpcbiAqIGhlYXBxLnB1c2goMSk7XG4gKiBoZWFwcS5wdXNoKDIpO1xuICogaGVhcHEucHVzaCgzKTtcbiAqIGhlYXBxLnBvcCgpOyAvLyA9PT4gMVxuICogaGVhcHEucG9wKCk7IC8vID09PiAyXG4gKiBoZWFwcS5wb3AoKTsgLy8gPT0+IDNcbiAqL1xubGV0IEhlYXBRdWV1ZSA9IGZ1bmN0aW9uKGNtcCl7XG4gIHRoaXMuY21wID0gKGNtcCB8fCBmdW5jdGlvbihhLCBiKXsgcmV0dXJuIGEgLSBiOyB9KTtcbiAgdGhpcy5sZW5ndGggPSAwO1xuICB0aGlzLmRhdGEgPSBbXTtcbn1cbkhlYXBRdWV1ZS5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0aGlzLmRhdGFbMF07XG59O1xuSGVhcFF1ZXVlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24odmFsdWUpe1xuICB0aGlzLmRhdGEucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIHBvcyA9IHRoaXMuZGF0YS5sZW5ndGggLSAxLFxuICBwYXJlbnQsIHg7XG5cbiAgd2hpbGUocG9zID4gMCl7XG4gICAgcGFyZW50ID0gKHBvcyAtIDEpID4+PiAxO1xuICAgIGlmKHRoaXMuY21wKHRoaXMuZGF0YVtwb3NdLCB0aGlzLmRhdGFbcGFyZW50XSkgPCAwKXtcbiAgICAgIHggPSB0aGlzLmRhdGFbcGFyZW50XTtcbiAgICAgIHRoaXMuZGF0YVtwYXJlbnRdID0gdGhpcy5kYXRhW3Bvc107XG4gICAgICB0aGlzLmRhdGFbcG9zXSA9IHg7XG4gICAgICBwb3MgPSBwYXJlbnQ7XG4gICAgfWVsc2UgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIHRoaXMubGVuZ3RoKys7XG59O1xuSGVhcFF1ZXVlLnByb3RvdHlwZS5wb3AgPSBmdW5jdGlvbigpe1xuICB2YXIgbGFzdF92YWwgPSB0aGlzLmRhdGEucG9wKCksXG4gIHJldCA9IHRoaXMuZGF0YVswXTtcbiAgaWYodGhpcy5kYXRhLmxlbmd0aCA+IDApe1xuICAgIHRoaXMuZGF0YVswXSA9IGxhc3RfdmFsO1xuICAgIHZhciBwb3MgPSAwLFxuICAgIGxhc3QgPSB0aGlzLmRhdGEubGVuZ3RoIC0gMSxcbiAgICBsZWZ0LCByaWdodCwgbWluSW5kZXgsIHg7XG4gICAgd2hpbGUoMSl7XG4gICAgICBsZWZ0ID0gKHBvcyA8PCAxKSArIDE7XG4gICAgICByaWdodCA9IGxlZnQgKyAxO1xuICAgICAgbWluSW5kZXggPSBwb3M7XG4gICAgICBpZihsZWZ0IDw9IGxhc3QgJiYgdGhpcy5jbXAodGhpcy5kYXRhW2xlZnRdLCB0aGlzLmRhdGFbbWluSW5kZXhdKSA8IDApIG1pbkluZGV4ID0gbGVmdDtcbiAgICAgIGlmKHJpZ2h0IDw9IGxhc3QgJiYgdGhpcy5jbXAodGhpcy5kYXRhW3JpZ2h0XSwgdGhpcy5kYXRhW21pbkluZGV4XSkgPCAwKSBtaW5JbmRleCA9IHJpZ2h0O1xuICAgICAgaWYobWluSW5kZXggIT09IHBvcyl7XG4gICAgICAgIHggPSB0aGlzLmRhdGFbbWluSW5kZXhdO1xuICAgICAgICB0aGlzLmRhdGFbbWluSW5kZXhdID0gdGhpcy5kYXRhW3Bvc107XG4gICAgICAgIHRoaXMuZGF0YVtwb3NdID0geDtcbiAgICAgICAgcG9zID0gbWluSW5kZXg7XG4gICAgICB9ZWxzZSBicmVhaztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0ID0gbGFzdF92YWw7XG4gIH1cbiAgdGhpcy5sZW5ndGgtLTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhcFF1ZXVlXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcbiBcbi8vIGNvbnN0cnVjdG9yIGZvciBzY2hyb2VkZXIgYWxscGFzcyBmaWx0ZXJzXG5sZXQgYWxsUGFzcyA9IGZ1bmN0aW9uKCBfaW5wdXQsIGxlbmd0aD01MDAsIGZlZWRiYWNrPS41ICkge1xuICBsZXQgaW5kZXggID0gZy5jb3VudGVyKCAxLDAsbGVuZ3RoICksXG4gICAgICBidWZmZXIgPSBnLmRhdGEoIGxlbmd0aCApLFxuICAgICAgYnVmZmVyU2FtcGxlID0gZy5wZWVrKCBidWZmZXIsIGluZGV4LCB7IGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pLFxuICAgICAgb3V0ID0gZy5tZW1vKCBnLmFkZCggZy5tdWwoIC0xLCBfaW5wdXQpLCBidWZmZXJTYW1wbGUgKSApXG4gICAgICAgICAgICAgICAgXG4gIGcucG9rZSggYnVmZmVyLCBnLmFkZCggX2lucHV0LCBnLm11bCggYnVmZmVyU2FtcGxlLCBmZWVkYmFjayApICksIGluZGV4IClcbiBcbiAgcmV0dXJuIG91dFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFsbFBhc3NcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgQmlub3BzID0ge1xuICAgIGV4cG9ydCggb2JqICkge1xuICAgICAgZm9yKCBsZXQga2V5IGluIEJpbm9wcyApIHtcbiAgICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgICAgb2JqWyBrZXkgXSA9IEJpbm9wc1sga2V5IF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgQWRkKCAuLi5hcmdzICkge1xuICAgICAgbGV0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHJldHVybiB7IGJpbm9wOnRydWUsIG9wOicrJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidhZGQnICsgaWQsIGlkIH1cbiAgICB9LFxuXG4gICAgU3ViKCAuLi5hcmdzICkge1xuICAgICAgbGV0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHJldHVybiB7IGJpbm9wOnRydWUsIG9wOictJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidzdWInICsgaWQsIGlkIH1cbiAgICB9LFxuXG4gICAgTXVsKCAuLi5hcmdzICkge1xuICAgICAgbGV0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHJldHVybiB7IGJpbm9wOnRydWUsIG9wOicqJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidtdWwnICsgaWQsIGlkIH1cbiAgICB9LFxuXG4gICAgRGl2KCAuLi5hcmdzICkge1xuICAgICAgbGV0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHJldHVybiB7IGJpbm9wOnRydWUsIG9wOicvJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidkaXYnICsgaWQsIGlkIH1cbiAgICB9LFxuXG4gICAgTW9kKCAuLi5hcmdzICkge1xuICAgICAgbGV0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHJldHVybiB7IGJpbm9wOnRydWUsIG9wOiclJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidtb2QnICsgaWQsIGlkIH1cbiAgICB9LCAgIFxuICB9XG5cbiAgcmV0dXJuIEJpbm9wc1xufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBHaWJiZXJpc2guZ2VuaXNoLmJpcXVhZCA9ICggaW5wdXQsIGN1dG9mZiwgUSwgbW9kZSwgaXNTdGVyZW8gKSA9PiB7XG4gICAgbGV0IGEwLGExLGEyLGMsYjEsYjIsXG4gICAgICAgIGluMWEwLHgxYTEseDJhMix5MWIxLHkyYjIsXG4gICAgICAgIGluMWEwXzEseDFhMV8xLHgyYTJfMSx5MWIxXzEseTJiMl8xXG5cbiAgICBsZXQgcmV0dXJuVmFsdWVcblxuICAgIGxldCB4MSA9IHNzZCgpLCB4MiA9IHNzZCgpLCB5MSA9IHNzZCgpLCB5MiA9IHNzZCgpXG4gICAgXG4gICAgbGV0IHcwID0gbWVtbyggbXVsKCAyICogTWF0aC5QSSwgZGl2KCBjdXRvZmYsICBnZW4uc2FtcGxlcmF0ZSApICkgKSxcbiAgICAgICAgc2ludzAgPSBzaW4oIHcwICksXG4gICAgICAgIGNvc3cwID0gY29zKCB3MCApLFxuICAgICAgICBhbHBoYSA9IG1lbW8oIGRpdiggc2ludzAsIG11bCggMiwgUSApICkgKVxuXG4gICAgbGV0IG9uZU1pbnVzQ29zVyA9IHN1YiggMSwgY29zdzAgKVxuXG4gICAgc3dpdGNoKCBtb2RlICkge1xuICAgICAgY2FzZSAnSFAnOlxuICAgICAgICBhMCA9IG1lbW8oIGRpdiggYWRkKCAxLCBjb3N3MCkgLCAyKSApXG4gICAgICAgIGExID0gbXVsKCBhZGQoIDEsIGNvc3cwICksIC0xIClcbiAgICAgICAgYTIgPSBhMFxuICAgICAgICBjICA9IGFkZCggMSwgYWxwaGEgKVxuICAgICAgICBiMSA9IG11bCggLTIgLCBjb3N3MCApXG4gICAgICAgIGIyID0gc3ViKCAxLCBhbHBoYSApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQlAnOlxuICAgICAgICBhMCA9IG11bCggUSwgYWxwaGEgKVxuICAgICAgICBhMSA9IDBcbiAgICAgICAgYTIgPSBtdWwoIGEwLCAtMSApXG4gICAgICAgIGMgID0gYWRkKCAxLCBhbHBoYSApXG4gICAgICAgIGIxID0gbXVsKCAtMiAsIGNvc3cwIClcbiAgICAgICAgYjIgPSBzdWIoIDEsIGFscGhhIClcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiAvLyBMUFxuICAgICAgICBhMCA9IG1lbW8oIGRpdiggb25lTWludXNDb3NXLCAyKSApXG4gICAgICAgIGExID0gb25lTWludXNDb3NXXG4gICAgICAgIGEyID0gYTBcbiAgICAgICAgYyAgPSBhZGQoIDEsIGFscGhhIClcbiAgICAgICAgYjEgPSBtdWwoIC0yICwgY29zdzAgKVxuICAgICAgICBiMiA9IHN1YiggMSwgYWxwaGEgKVxuICAgIH1cblxuICAgIGEwID0gZGl2KCBhMCwgYyApOyBhMSA9IGRpdiggYTEsIGMgKTsgYTIgPSBkaXYoIGEyLCBjIClcbiAgICBiMSA9IGRpdiggYjEsIGMgKTsgYjIgPSBkaXYoIGIyLCBjIClcblxuICAgIGluMWEwID0gbXVsKCB4MS5pbiggaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0ICksIGEwIClcbiAgICB4MWExICA9IG11bCggeDIuaW4oIHgxLm91dCApLCBhMSApXG4gICAgeDJhMiAgPSBtdWwoIHgyLm91dCwgICAgICAgICAgYTIgKVxuXG4gICAgbGV0IHN1bUxlZnQgPSBhZGQoIGluMWEwLCB4MWExLCB4MmEyIClcblxuICAgIHkxYjEgPSBtdWwoIHkyLmluKCB5MS5vdXQgKSwgYjEgKVxuICAgIHkyYjIgPSBtdWwoIHkyLm91dCwgYjIgKVxuXG4gICAgbGV0IHN1bVJpZ2h0ID0gYWRkKCB5MWIxLCB5MmIyIClcblxuICAgIGxldCBkaWZmID0gc3ViKCBzdW1MZWZ0LCBzdW1SaWdodCApXG5cbiAgICB5MS5pbiggZGlmZiApXG5cbiAgICBpZiggaXNTdGVyZW8gKSB7XG4gICAgICBsZXQgeDFfMSA9IHNzZCgpLCB4Ml8xID0gc3NkKCksIHkxXzEgPSBzc2QoKSwgeTJfMSA9IHNzZCgpXG5cbiAgICAgIGluMWEwXzEgPSBtdWwoIHgxXzEuaW4oIGlucHV0WzFdICAgICksIGEwIClcbiAgICAgIHgxYTFfMSAgPSBtdWwoIHgyXzEuaW4oIHgxXzEub3V0ICksIGExIClcbiAgICAgIHgyYTJfMSAgPSBtdWwoIHgyXzEub3V0LCAgICAgICAgICBhMiApXG5cbiAgICAgIGxldCBzdW1MZWZ0XzEgPSBhZGQoIGluMWEwXzEsIHgxYTFfMSwgeDJhMl8xIClcblxuICAgICAgeTFiMV8xID0gbXVsKCB5Ml8xLmluKCB5MV8xLm91dCApLCBiMSApXG4gICAgICB5MmIyXzEgPSBtdWwoIHkyXzEub3V0LCBiMiApXG5cbiAgICAgIGxldCBzdW1SaWdodF8xID0gYWRkKCB5MWIxXzEsIHkyYjJfMSApXG5cbiAgICAgIGxldCBkaWZmXzEgPSBzdWIoIHN1bUxlZnRfMSwgc3VtUmlnaHRfMSApXG4gICAgICBcbiAgICAgIHJldHVyblZhbHVlID0gWyBkaWZmLCBkaWZmXzEgXVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuVmFsdWUgPSBkaWZmXG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cblxuICBsZXQgQmlxdWFkID0gcHJvcHMgPT4ge1xuICAgIGxldCBfcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQmlxdWFkLmRlZmF1bHRzLCBwcm9wcyApIFxuXG4gICAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW9cblxuICAgIGxldCBmaWx0ZXIgPSBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLmJpcXVhZCggZy5pbignaW5wdXQnKSwgZy5pbignY3V0b2ZmJyksIGcuaW4oJ1EnKSwgX3Byb3BzLm1vZGUgfHwgJ0xQJywgaXNTdGVyZW8gKSwgXG4gICAgICAnYmlxdWFkJywgXG4gICAgICBfcHJvcHNcbiAgICApXG4gICAgcmV0dXJuIGZpbHRlclxuICB9XG5cblxuICBCaXF1YWQuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICBROiAuNzUsXG4gICAgY3V0b2ZmOjU1MCxcbiAgICBtb2RlOidMUCdcbiAgfVxuXG4gIHJldHVybiBCaXF1YWRcblxufVxuXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBCdXMgPSB7IFxuICAgIGZhY3Rvcnk6IEdpYmJlcmlzaC5mYWN0b3J5KCBnLmFkZCggMCApICwgJ2J1cycsIFsgMCwgMSBdICApLFxuXG4gICAgY3JlYXRlKCkge1xuICAgICAgbGV0IGJ1cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBvdXRwdXRbIDAgXSA9IG91dHB1dFsgMSBdID0gMFxuXG4gICAgICAgIGZvciggbGV0IGkgPSAwLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgbGV0IGlucHV0ID0gYXJndW1lbnRzWyBpIF1cbiAgICAgICAgICBvdXRwdXRbIDAgXSArPSBpbnB1dFxuICAgICAgICAgIG91dHB1dFsgMSBdICs9IGlucHV0XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0cHV0XG4gICAgICB9XG5cbiAgICAgIGJ1cy5pZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICBidXMuZGlydHkgPSB0cnVlXG4gICAgICBidXMudHlwZSA9ICdidXMnXG4gICAgICBidXMudWdlbk5hbWUgPSAnYnVzXycgKyBidXMuaWRcbiAgICAgIGJ1cy5pbnB1dHMgPSBbXVxuICAgICAgYnVzLmlucHV0TmFtZXMgPSBbXVxuXG4gICAgICBidXMuY29ubmVjdCA9ICggdGFyZ2V0LCBsZXZlbCA9IDEgKSA9PiB7XG4gICAgICAgIGlmKCB0YXJnZXQuaXNTdGVyZW8gKSB7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoICdZb3UgY2Fubm90IGNvbm5lY3QgYSBzdGVyZW8gaW5wdXQgdG8gYSBtb25vIGJ1cy4nIClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCB0YXJnZXQuaW5wdXRzIClcbiAgICAgICAgICB0YXJnZXQuaW5wdXRzLnB1c2goIGJ1cyApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0YXJnZXQuaW5wdXQgPSBidXNcblxuICAgICAgICBHaWJiZXJpc2guZGlydHkoIHRhcmdldCApXG4gICAgICAgIHJldHVybiBidXNcbiAgICAgIH1cblxuICAgICAgYnVzLmNoYWluID0gKCB0YXJnZXQsIGxldmVsID0gMSApID0+IHtcbiAgICAgICAgYnVzLmNvbm5lY3QoIHRhcmdldCwgbGV2ZWwgKVxuICAgICAgICByZXR1cm4gdGFyZ2V0XG4gICAgICB9XG5cbiAgICAgIGJ1cy5kaXNjb25uZWN0ID0gKCB1Z2VuICkgPT4ge1xuICAgICAgICBsZXQgcmVtb3ZlSWR4ID0gLTFcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBidXMuaW5wdXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIGxldCBpbnB1dCA9IGJ1cy5pbnB1dHNbIGkgXVxuXG4gICAgICAgICAgaWYoIGlzTmFOKCBpbnB1dCApICYmIHVnZW4gPT09IGlucHV0ICkge1xuICAgICAgICAgICAgcmVtb3ZlSWR4ID0gaVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggcmVtb3ZlSWR4ICE9PSAtMSApIHtcbiAgICAgICAgICBidXMuaW5wdXRzLnNwbGljZSggcmVtb3ZlSWR4LCAxIClcbiAgICAgICAgICBHaWJiZXJpc2guZGlydHkoIGJ1cyApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIGJ1c1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBCdXMuY3JlYXRlXG5cbn1cblxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgQnVzMiA9IHsgXG4gICAgY3JlYXRlKCkge1xuICAgICAgbGV0IG91dHB1dCA9IG5ldyBGbG9hdDMyQXJyYXkoIDIgKVxuXG4gICAgICBsZXQgYnVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIG91dHB1dFsgMCBdID0gb3V0cHV0WyAxIF0gPSAwXG5cbiAgICAgICAgZm9yKCBsZXQgaSA9IDAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBsZXQgaW5wdXQgPSBhcmd1bWVudHNbIGkgXSxcbiAgICAgICAgICAgICAgaXNBcnJheSA9IGlucHV0IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5XG5cbiAgICAgICAgICBvdXRwdXRbIDAgXSArPSBpc0FycmF5ID8gaW5wdXRbIDAgXSA6IGlucHV0XG4gICAgICAgICAgb3V0cHV0WyAxIF0gKz0gaXNBcnJheSA/IGlucHV0WyAxIF0gOiBpbnB1dFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dHB1dFxuICAgICAgfVxuXG4gICAgICBidXMuaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgYnVzLmRpcnR5ID0gdHJ1ZVxuICAgICAgYnVzLnR5cGUgPSAnYnVzJ1xuICAgICAgYnVzLnVnZW5OYW1lID0gJ2J1czJfJyArIGJ1cy5pZFxuICAgICAgYnVzLmlucHV0cyA9IFtdXG4gICAgICBidXMuaW5wdXROYW1lcyA9IFtdXG5cbiAgICAgIGJ1cy5jb25uZWN0ID0gKCB0YXJnZXQsIGxldmVsID0gMSApID0+IHtcbiAgICAgICAgaWYoIHRhcmdldC5pbnB1dHMgKVxuICAgICAgICAgIHRhcmdldC5pbnB1dHMucHVzaCggYnVzIClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRhcmdldC5pbnB1dCA9IGJ1c1xuXG4gICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdGFyZ2V0IClcbiAgICAgICAgcmV0dXJuIGJ1c1xuICAgICAgfVxuXG4gICAgICBidXMuY2hhaW4gPSAoIHRhcmdldCwgbGV2ZWwgPSAxICkgPT4ge1xuICAgICAgICBidXMuY29ubmVjdCggdGFyZ2V0LCBsZXZlbCApXG4gICAgICAgIHJldHVybiB0YXJnZXRcbiAgICAgIH1cblxuICAgICAgYnVzLmRpc2Nvbm5lY3QgPSAoIHVnZW4gKSA9PiB7XG4gICAgICAgIGxldCByZW1vdmVJZHggPSAtMVxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IGJ1cy5pbnB1dHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgbGV0IGlucHV0ID0gYnVzLmlucHV0c1sgaSBdXG5cbiAgICAgICAgICBpZiggaXNOYU4oIGlucHV0ICkgJiYgdWdlbiA9PT0gaW5wdXQgKSB7XG4gICAgICAgICAgICByZW1vdmVJZHggPSBpXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCByZW1vdmVJZHggIT09IC0xICkge1xuICAgICAgICAgIGJ1cy5pbnB1dHMuc3BsaWNlKCByZW1vdmVJZHgsIDEgKVxuICAgICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggYnVzIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gYnVzXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIEJ1czIuY3JlYXRlXG5cbn1cblxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbmxldCBjb21iRmlsdGVyID0gZnVuY3Rpb24oIF9pbnB1dCwgY29tYkxlbmd0aCwgZGFtcGluZz0uNSouNCwgZmVlZGJhY2tDb2VmZj0uODQgKSB7XG4gIGxldCBsYXN0U2FtcGxlICAgPSBnLmhpc3RvcnkoKSxcbiAgXHQgIHJlYWRXcml0ZUlkeCA9IGcuY291bnRlciggMSwwLGNvbWJMZW5ndGggKSxcbiAgICAgIGNvbWJCdWZmZXIgICA9IGcuZGF0YSggY29tYkxlbmd0aCApLFxuXHQgICAgb3V0ICAgICAgICAgID0gZy5wZWVrKCBjb21iQnVmZmVyLCByZWFkV3JpdGVJZHgsIHsgaW50ZXJwOidub25lJywgbW9kZTonc2FtcGxlcycgfSksXG4gICAgICBzdG9yZUlucHV0ICAgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggb3V0LCBnLnN1YiggMSwgZGFtcGluZykpLCBnLm11bCggbGFzdFNhbXBsZS5vdXQsIGRhbXBpbmcgKSApIClcbiAgICAgIFxuICBsYXN0U2FtcGxlLmluKCBzdG9yZUlucHV0IClcbiBcbiAgZy5wb2tlKCBjb21iQnVmZmVyLCBnLmFkZCggX2lucHV0LCBnLm11bCggc3RvcmVJbnB1dCwgZmVlZGJhY2tDb2VmZiApICksIHJlYWRXcml0ZUlkeCApXG4gXG4gIHJldHVybiBvdXRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb21iRmlsdGVyXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIEdpYmJlcmlzaC5nZW5pc2guZmlsdGVyMjQgPSAoIGlucHV0LCByZXosIGN1dG9mZiwgaXNMb3dQYXNzICkgPT4ge1xuICAgIGxldCBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoIGlucHV0ICksIHJldHVyblZhbHVlXG5cbiAgICBsZXQgcG9sZXNMID0gZy5kYXRhKFsgMCwwLDAsMCBdKSxcbiAgICAgICAgcGVla1Byb3BzID0geyBpbnRlcnA6J25vbmUnLCBtb2RlOidzaW1wbGUnIH1cbiAgICAgICAgcmV6ekwgPSBnLmNsYW1wKCBnLm11bCggZy5wZWVrKCBwb2xlc0wsIDMsIHBlZWtQcm9wcyApLCByZXogKSApLFxuICAgICAgICBwTDAgPSBnLnBlZWsoIHBvbGVzTCwgMCwgcGVla1Byb3BzICksIFxuICAgICAgICBwTDEgPSBnLnBlZWsoIHBvbGVzTCwgMSwgcGVla1Byb3BzICksIFxuICAgICAgICBwTDIgPSBnLnBlZWsoIHBvbGVzTCwgMiwgcGVla1Byb3BzICksIFxuICAgICAgICBwTDMgPSBnLnBlZWsoIHBvbGVzTCwgMywgcGVla1Byb3BzICkgXG5cbiAgICBsZXQgb3V0cHV0TCA9IGcuc3ViKCBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXQsIHJlenpMICkgXG5cbiAgICBnLnBva2UoIHBvbGVzTCwgZy5hZGQoIHBMMCwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSxwTDApLCBvdXRwdXRMICksY3V0b2ZmICkpLCAwIClcbiAgICBnLnBva2UoIHBvbGVzTCwgZy5hZGQoIHBMMSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSxwTDEpLCBwTDAgKSwgY3V0b2ZmICkpLCAxIClcbiAgICBnLnBva2UoIHBvbGVzTCwgZy5hZGQoIHBMMiwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSxwTDIpLCBwTDEgKSwgY3V0b2ZmICkpLCAyIClcbiAgICBnLnBva2UoIHBvbGVzTCwgZy5hZGQoIHBMMywgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSxwTDMpLCBwTDIgKSwgY3V0b2ZmICkpLCAzIClcbiAgICBcbiAgICBsZXQgbGVmdCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBMMywgZy5zdWIoIG91dHB1dEwsIHBMMyApIClcblxuICAgIGlmKCBpc1N0ZXJlbyApIHtcbiAgICAgIGxldCBwb2xlc1IgPSBnLmRhdGEoWyAwLDAsMCwwIF0pLFxuICAgICAgICAgIHJlenpSID0gZy5jbGFtcCggZy5tdWwoIGcucGVlayggcG9sZXNSLCAzLCBwZWVrUHJvcHMgKSwgcmV6ICkgKSxcbiAgICAgICAgICBvdXRwdXRSID0gZy5zdWIoIGlucHV0WzFdLCByZXp6UiApLCAgICAgICAgICBcbiAgICAgICAgICBwUjAgPSAgZy5wZWVrKCBwb2xlc1IsIDAsIHBlZWtQcm9wcyksXG4gICAgICAgICAgcFIxID0gIGcucGVlayggcG9sZXNSLCAxLCBwZWVrUHJvcHMpLFxuICAgICAgICAgIHBSMiA9ICBnLnBlZWsoIHBvbGVzUiwgMiwgcGVla1Byb3BzKSxcbiAgICAgICAgICBwUjMgPSAgZy5wZWVrKCBwb2xlc1IsIDMsIHBlZWtQcm9wcylcblxuICAgICAgZy5wb2tlKCBwb2xlc1IsIGcuYWRkKCBwUjAsIGcubXVsKCBnLmFkZCggZy5tdWwoLTEscFIwKSwgb3V0cHV0UiApLCBjdXRvZmYgKSksIDAgKVxuICAgICAgZy5wb2tlKCBwb2xlc1IsIGcuYWRkKCBwUjEsIGcubXVsKCBnLmFkZCggZy5tdWwoLTEscFIxKSwgcFIwICksIGN1dG9mZiApKSwgMSApXG4gICAgICBnLnBva2UoIHBvbGVzUiwgZy5hZGQoIHBSMiwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSxwUjIpLCBwUjEgKSwgY3V0b2ZmICkpLCAyIClcbiAgICAgIGcucG9rZSggcG9sZXNSLCBnLmFkZCggcFIzLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLHBSMyksIHBSMiApLCBjdXRvZmYgKSksIDMgKVxuXG4gICAgICBsZXQgcmlnaHQgPWcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBSMywgZy5zdWIoIG91dHB1dFIsIHBSMyApIClcbiAgICAgIHJldHVyblZhbHVlID0gW2xlZnQsIHJpZ2h0XVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuVmFsdWUgPSBsZWZ0XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cblxuICBsZXQgRmlsdGVyMjQgPSBwcm9wcyA9PiB7XG4gICAgbGV0IGZpbHRlciA9IEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guZmlsdGVyMjQoIGcuaW4oJ2lucHV0JyksIGcuaW4oJ3Jlc29uYW5jZScpLCBnLmluKCdjdXRvZmYnKSwgZy5pbignaXNMb3dQYXNzJykgKSwgXG4gICAgICAnZmlsdGVyMjQnLCBcbiAgICAgIE9iamVjdC5hc3NpZ24oIHt9LCBGaWx0ZXIyNC5kZWZhdWx0cywgcHJvcHMgKSBcbiAgICApXG4gICAgcmV0dXJuIGZpbHRlclxuICB9XG5cblxuICBGaWx0ZXIyNC5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIHJlc29uYW5jZTogMy41LFxuICAgIGN1dG9mZjogLjEsXG4gICAgaXNMb3dQYXNzOjFcbiAgfVxuXG4gIHJldHVybiBGaWx0ZXIyNFxuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBhbGxQYXNzID0gcmVxdWlyZSggJy4vYWxscGFzcy5qcycgKSxcbiAgICBjb21iRmlsdGVyID0gcmVxdWlyZSggJy4vY29tYmZpbHRlci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgdHVuaW5nID0ge1xuICBjb21iQ291bnQ6XHQgIFx0OCxcbiAgY29tYlR1bmluZzogXHRcdFsgMTExNiwgMTE4OCwgMTI3NywgMTM1NiwgMTQyMiwgMTQ5MSwgMTU1NywgMTYxNyBdLCAgICAgICAgICAgICAgICAgICAgXG4gIGFsbFBhc3NDb3VudDogXHQ0LFxuICBhbGxQYXNzVHVuaW5nOlx0WyAyMjUsIDU1NiwgNDQxLCAzNDEgXSxcbiAgYWxsUGFzc0ZlZWRiYWNrOjAuNSxcbiAgZml4ZWRHYWluOiBcdFx0ICAwLjAxNSxcbiAgc2NhbGVEYW1waW5nOiBcdDAuNCxcbiAgc2NhbGVSb29tOiBcdFx0ICAwLjI4LFxuICBvZmZzZXRSb29tOiBcdCAgMC43LFxuICBzdGVyZW9TcHJlYWQ6ICAgMjNcbn1cblxubGV0IEZyZWV2ZXJiID0gcHJvcHMgPT4ge1xuICBsZXQgaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KCBwcm9wcy5pbnB1dCApXG4gIFxuICBjb25zb2xlLmxvZygnaXNTdGVyZW86JywgaXNTdGVyZW8sIHByb3BzLmlucHV0IClcblxuICBsZXQgY29tYnNMID0gW10sIGNvbWJzUiA9IFtdXG5cbiAgbGV0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgd2V0MSA9IGcuaW4oICd3ZXQxJyksIHdldDIgPSBnLmluKCAnd2V0MicgKSwgIGRyeSA9IGcuaW4oICdkcnknICksIFxuICAgICAgcm9vbVNpemUgPSBnLmluKCAncm9vbVNpemUnICksIGRhbXBpbmcgPSBnLmluKCAnZGFtcGluZycgKVxuICBcbiAgbGV0IHN1bW1lZElucHV0ID0gaXNTdGVyZW8gPT09IGZhbHNlID8gZy5hZGQoIGlucHV0WzBdLCBpbnB1dFsxXSApIDogaW5wdXQsXG4gICAgICBhdHRlbnVhdGVkSW5wdXQgPSBnLm1lbW8oIGcubXVsKCBzdW1tZWRJbnB1dCwgdHVuaW5nLmZpeGVkR2FpbiApIClcbiAgXG4gIC8vIGNyZWF0ZSBjb21iIGZpbHRlcnMgaW4gcGFyYWxsZWwuLi5cbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCA4OyBpKysgKSB7IFxuICAgIGNvbWJzTC5wdXNoKCBcbiAgICAgIGNvbWJGaWx0ZXIoIGF0dGVudWF0ZWRJbnB1dCwgdHVuaW5nLmNvbWJUdW5pbmdbaV0sIG11bChkYW1waW5nLC40KSwgZy5tdWwoIHR1bmluZy5zY2FsZVJvb20gKyB0dW5pbmcub2Zmc2V0Um9vbSwgcm9vbVNpemUgKSApIFxuICAgIClcbiAgICBjb21ic1IucHVzaCggXG4gICAgICBjb21iRmlsdGVyKCBhdHRlbnVhdGVkSW5wdXQsIHR1bmluZy5jb21iVHVuaW5nW2ldICsgdHVuaW5nLnN0ZXJlb1NwcmVhZCwgZy5tdWwoZGFtcGluZywuNCksIGcubXVsKCB0dW5pbmcuc2NhbGVSb29tICsgdHVuaW5nLm9mZnNldFJvb20sIHJvb21TaXplICkgKSBcbiAgICApXG4gIH1cbiAgXG4gIC8vIC4uLiBhbmQgc3VtIHRoZW0gd2l0aCBhdHRlbnVhdGVkIGlucHV0XG4gIGxldCBvdXRMID0gZy5hZGQoIGF0dGVudWF0ZWRJbnB1dCwgLi4uY29tYnNMIClcbiAgbGV0IG91dFIgPSBnLmFkZCggYXR0ZW51YXRlZElucHV0LCAuLi5jb21ic1IgKVxuICBcbiAgLy8gcnVuIHRocm91Z2ggYWxscGFzcyBmaWx0ZXJzIGluIHNlcmllc1xuICBmb3IoIGxldCBpID0gMDsgaSA8IDQ7IGkrKyApIHsgXG4gICAgb3V0TCA9IGFsbFBhc3MoIG91dEwsIHR1bmluZy5hbGxQYXNzVHVuaW5nWyAwIF0gKyB0dW5pbmcuc3RlcmVvU3ByZWFkIClcbiAgICBvdXRSID0gYWxsUGFzcyggb3V0UiwgdHVuaW5nLmFsbFBhc3NUdW5pbmdbIDAgXSArIHR1bmluZy5zdGVyZW9TcHJlYWQgKVxuICB9XG4gIFxuICBsZXQgb3V0cHV0TCA9IGcuYWRkKCBnLm11bCggb3V0TCwgd2V0MSApLCBnLm11bCggb3V0Uiwgd2V0MiApLCBnLm11bCggaXNTdGVyZW8gPT09IGZhbHNlID8gaW5wdXRbMF0gOiBpbnB1dCwgZHJ5ICkgKSxcbiAgICAgIG91dHB1dFIgPSBnLmFkZCggZy5tdWwoIG91dFIsIHdldDEgKSwgZy5tdWwoIG91dEwsIHdldDIgKSwgZy5tdWwoIGlzU3RlcmVvID09PSBmYWxzZSA/IGlucHV0WzFdIDogaW5wdXQsIGRyeSApIClcblxuICBsZXQgdmVyYiA9IEdpYmJlcmlzaC5mYWN0b3J5KCBbIG91dHB1dEwsIG91dHB1dFIgXSwgJ2ZyZWV2ZXJiJywgT2JqZWN0LmFzc2lnbih7fSwgRnJlZXZlcmIuZGVmYXVsdHMsIHByb3BzKSApXG5cbiAgcmV0dXJuIHZlcmJcbn1cblxuXG5GcmVldmVyYi5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgd2V0MTogMSxcbiAgd2V0MjogMCxcbiAgZHJ5OiAuNSxcbiAgcm9vbVNpemU6IC44NCxcbiAgZGFtcGluZzogIC41XG59XG5cbnJldHVybiBGcmVldmVyYiBcblxufVxuXG4iLCJsZXQgTWVtb3J5SGVscGVyID0gcmVxdWlyZSggJ21lbW9yeS1oZWxwZXInICksXG4gICAgZ2VuaXNoICAgICAgID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuICAgIFxubGV0IEdpYmJlcmlzaCA9IHtcbiAgYmxvY2tDYWxsYmFja3M6IFtdLCAvLyBjYWxsZWQgZXZlcnkgYmxvY2tcbiAgZGlydHlVZ2VuczogW10sXG4gIGNhbGxiYWNrVWdlbnM6IFtdLFxuICBjYWxsYmFja05hbWVzOiBbXSxcbiAgZ3JhcGhJc0RpcnR5OiBmYWxzZSxcbiAgdWdlbnM6IHt9LFxuICBkZWJ1ZzogZmFsc2UsXG5cbiAgb3V0cHV0OiBudWxsLFxuXG4gIG1lbW9yeSA6IG51bGwsIC8vIDIwIG1pbnV0ZXMgYnkgZGVmYXVsdD9cbiAgZmFjdG9yeTogbnVsbCwgXG4gIGdlbmlzaCxcbiAgc2NoZWR1bGVyOiByZXF1aXJlKCAnLi9zY2hlZHVsZXIuanMnICksXG5cbiAgaW5pdCggbWVtQW1vdW50ICkge1xuICAgIGxldCBudW1CeXRlcyA9IG1lbUFtb3VudCA9PT0gdW5kZWZpbmVkID8gMjAgKiA2MCAqIDQ0MTAwIDogbWVtQW1vdW50XG5cbiAgICB0aGlzLm1lbW9yeSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIG51bUJ5dGVzIClcbiAgICB0aGlzLmZhY3RvcnkgPSByZXF1aXJlKCAnLi91Z2VuVGVtcGxhdGUuanMnICkoIHRoaXMgKVxuXG4gICAgdGhpcy5nZW5pc2guZXhwb3J0KCB3aW5kb3cgKVxuXG4gICAgdGhpcy5Qb2x5VGVtcGxhdGUgICAgICA9IHJlcXVpcmUoICcuL3BvbHl0ZW1wbGF0ZS5qcycgKSggdGhpcyApXG4gICAgdGhpcy51Z2Vucy5vc2NpbGxhdG9ycyA9IHJlcXVpcmUoICcuL29zY2lsbGF0b3JzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLnVnZW5zLmJpbm9wcyAgICAgID0gcmVxdWlyZSggJy4vYmlub3BzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLnVnZW5zLmJ1cyAgICAgICAgID0gcmVxdWlyZSggJy4vYnVzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLnVnZW5zLmJ1czIgICAgICAgID0gcmVxdWlyZSggJy4vYnVzMi5qcycgKSggdGhpcyApO1xuICAgIFsgdGhpcy51Z2Vucy5zeW50aCwgdGhpcy51Z2Vucy5wb2x5c3ludGggXSA9IHJlcXVpcmUoICcuL3N5bnRoLmpzJyApKCB0aGlzICk7XG4gICAgWyB0aGlzLnVnZW5zLnN5bnRoMiwgdGhpcy51Z2Vucy5wb2x5c3ludGgyIF0gPSByZXF1aXJlKCAnLi9zeW50aDIuanMnICkoIHRoaXMgKTtcbiAgICAvL3RoaXMudWdlbnMuc3ludGgyICAgICAgPSByZXF1aXJlKCAnLi9zeW50aDIuanMnICkoIHRoaXMgKVxuICAgIC8vdGhpcy51Z2Vucy5wb2x5c3ludGggICA9IHJlcXVpcmUoICcuL3BvbHlzeW50aC5qcycgKSggdGhpcyApXG4gICAgLy90aGlzLnVnZW5zLnBvbHlzeW50aDIgID0gcmVxdWlyZSggJy4vcG9seXN5bnRoMi5qcycgKSggdGhpcyApXG4gICAgWyB0aGlzLnVnZW5zLm1vbm9zeW50aCwgdGhpcy51Z2Vucy5wb2x5bW9ubyBdID0gcmVxdWlyZSggJy4vbW9ub3N5bnRoLmpzJyApKCB0aGlzICk7XG4gICAgLy90aGlzLnVnZW5zLnBvbHltb25vICAgID0gcmVxdWlyZSggJy4vcG9seW1vbm8uanMnICkoIHRoaXMgKVxuICAgIHRoaXMudWdlbnMuZnJlZXZlcmIgICAgPSByZXF1aXJlKCAnLi9mcmVldmVyYi5qcycgKSggdGhpcyApO1xuICAgIHRoaXMuc2VxdWVuY2VyICAgICAgICAgPSByZXF1aXJlKCAnLi9zZXF1ZW5jZXIuanMnICkoIHRoaXMgKTtcbiAgICBbIHRoaXMudWdlbnMua2FycGx1cywgdGhpcy51Z2Vucy5wb2x5a2FycGx1cyBdICA9IHJlcXVpcmUoICcuL2thcnBsdXNzdHJvbmcuanMnICkoIHRoaXMgKTtcbiAgICAvL3RoaXMudWdlbnMucG9seWthcnBsdXMgPSByZXF1aXJlKCAnLi9wb2x5a2FycGx1c3N0cm9uZy5qcycgKSggdGhpcyApXG4gICAgdGhpcy51Z2Vucy5maWx0ZXIyNCAgICA9IHJlcXVpcmUoICcuL2ZpbHRlcjI0LmpzJyApKCB0aGlzIClcbiAgICB0aGlzLnVnZW5zLmJpcXVhZCAgICAgID0gcmVxdWlyZSggJy4vYmlxdWFkLmpzJyAgICkoIHRoaXMgKVxuICAgIHRoaXMudWdlbnMua2ljayAgICAgICAgPSByZXF1aXJlKCAnLi9raWNrLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLnVnZW5zLnN2ZiAgICAgICAgID0gcmVxdWlyZSggJy4vc3ZmLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLnVnZW5zLm9zY2lsbGF0b3JzLmV4cG9ydCggdGhpcyApXG4gICAgdGhpcy51Z2Vucy5iaW5vcHMuZXhwb3J0KCB0aGlzIClcbiAgICB0aGlzLkJ1cyAgPSB0aGlzLnVnZW5zLmJ1c1xuICAgIHRoaXMuQnVzMiA9IHRoaXMudWdlbnMuYnVzMlxuXG4gICAgdGhpcy5vdXRwdXQgPSB0aGlzLkJ1czIoKVxuICAgIHRoaXMuY3JlYXRlQ29udGV4dCgpXG4gICAgdGhpcy5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoKVxuICB9LFxuXG4gIGRpcnR5KCB1Z2VuICkge1xuICAgIHRoaXMuZGlydHlVZ2Vucy5wdXNoKCB1Z2VuIClcbiAgICB0aGlzLmdyYXBoSXNEaXJ0eSA9IHRydWVcbiAgfSxcblxuICBjbGVhcigpIHtcbiAgICB0aGlzLm91dHB1dC5pbnB1dHMgPSBbMF1cbiAgICB0aGlzLm91dHB1dC5pbnB1dE5hbWVzLmxlbmd0aCA9IDBcbiAgICB0aGlzLmRpcnR5KCB0aGlzLm91dHB1dCApXG4gIH0sXG5cbiAgY3JlYXRlQ29udGV4dCgpIHtcbiAgICBsZXQgQUMgPSB0eXBlb2YgQXVkaW9Db250ZXh0ID09PSAndW5kZWZpbmVkJyA/IHdlYmtpdEF1ZGlvQ29udGV4dCA6IEF1ZGlvQ29udGV4dFxuICAgIHRoaXMuY3R4ID0gbmV3IEFDKClcbiAgICBnZW4uc2FtcGxlcmF0ZSA9IHRoaXMuY3R4LnNhbXBsZVJhdGVcblxuICAgIGxldCBzdGFydCA9ICgpID0+IHtcbiAgICAgIGlmKCB0eXBlb2YgQUMgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICBpZiggZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG5cbiAgICAgICAgICBpZiggJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICl7IC8vIHJlcXVpcmVkIHRvIHN0YXJ0IGF1ZGlvIHVuZGVyIGlPUyA2XG4gICAgICAgICAgICBsZXQgbXlTb3VyY2UgPSB1dGlsaXRpZXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICAgICAgICBteVNvdXJjZS5jb25uZWN0KCB1dGlsaXRpZXMuY3R4LmRlc3RpbmF0aW9uIClcbiAgICAgICAgICAgIG15U291cmNlLm5vdGVPbiggMCApXG4gICAgICAgICAgfVxuICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH0sXG5cbiAgY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCkge1xuICAgIHRoaXMubm9kZSA9IHRoaXMuY3R4LmNyZWF0ZVNjcmlwdFByb2Nlc3NvciggMTAyNCwgMCwgMiApLFxuICAgIHRoaXMuY2xlYXJGdW5jdGlvbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMCB9LFxuICAgIHRoaXMuY2FsbGJhY2sgPSB0aGlzLmNsZWFyRnVuY3Rpb25cblxuICAgIHRoaXMubm9kZS5vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uKCBhdWRpb1Byb2Nlc3NpbmdFdmVudCApIHtcbiAgICAgIGxldCBnaWJiZXJpc2ggPSBHaWJiZXJpc2gsXG4gICAgICAgICAgY2FsbGJhY2sgID0gZ2liYmVyaXNoLmNhbGxiYWNrLFxuICAgICAgICAgIG91dHB1dEJ1ZmZlciA9IGF1ZGlvUHJvY2Vzc2luZ0V2ZW50Lm91dHB1dEJ1ZmZlcixcbiAgICAgICAgICBzY2hlZHVsZXIgPSBHaWJiZXJpc2guc2NoZWR1bGVyLFxuICAgICAgICAgIC8vb2JqcyA9IGdpYmJlcmlzaC5jYWxsYmFja1VnZW5zLnNsaWNlKCAwICksXG4gICAgICAgICAgbGVuZ3RoXG5cbiAgICAgIGxldCBsZWZ0ID0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAwICksXG4gICAgICAgICAgcmlnaHQ9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMSApXG5cbiAgICAgIGxldCBjYWxsYmFja2xlbmd0aCA9IEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5sZW5ndGhcbiAgICAgIFxuICAgICAgaWYoIGNhbGxiYWNrbGVuZ3RoICE9PSAwICkge1xuICAgICAgICBmb3IoIGxldCBpPTA7IGk8IGNhbGxiYWNrbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzWyBpIF0oKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2FuJ3QganVzdCBzZXQgbGVuZ3RoIHRvIDAgYXMgY2FsbGJhY2tzIG1pZ2h0IGJlIGFkZGVkIGR1cmluZyBmb3IgbG9vcCwgc28gc3BsaWNlIHByZS1leGlzdGluZyBmdW5jdGlvbnNcbiAgICAgICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLnNwbGljZSggMCwgY2FsbGJhY2tsZW5ndGggKVxuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBzYW1wbGUgPSAwLCBsZW5ndGggPSBsZWZ0Lmxlbmd0aDsgc2FtcGxlIDwgbGVuZ3RoOyBzYW1wbGUrKykge1xuICAgICAgICBzY2hlZHVsZXIudGljaygpXG5cbiAgICAgICAgaWYoIGdpYmJlcmlzaC5ncmFwaElzRGlydHkgKSB7IFxuICAgICAgICAgIGNhbGxiYWNrID0gZ2liYmVyaXNoLmdlbmVyYXRlQ2FsbGJhY2soKVxuICAgICAgICAgIC8vb2JqcyA9IGdpYmJlcmlzaC5jYWxsYmFja1VnZW5zLnNsaWNlKCAwIClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gWFhYIGNhbnQgdXNlIGRlc3RydWN0dXJpbmcsIGJhYmVsIG1ha2VzIGl0IHNvbWV0aGluZyBpbmVmZmljaWVudC4uLlxuICAgICAgICBsZXQgb3V0ID0gY2FsbGJhY2suYXBwbHkoIG51bGwsIGdpYmJlcmlzaC5jYWxsYmFja1VnZW5zIClcblxuICAgICAgICBsZWZ0WyBzYW1wbGUgIF0gPSBvdXRbMF1cbiAgICAgICAgcmlnaHRbIHNhbXBsZSBdID0gb3V0WzFdXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ub2RlLmNvbm5lY3QoIHRoaXMuY3R4LmRlc3RpbmF0aW9uIClcblxuICAgIHJldHVybiB0aGlzXG4gIH0sIFxuXG4gIGdlbmVyYXRlQ2FsbGJhY2soKSB7XG4gICAgbGV0IHVpZCA9IDAsXG4gICAgICAgIGNhbGxiYWNrQm9keSwgbGFzdExpbmVcblxuICAgIGNhbGxiYWNrQm9keSA9IHRoaXMucHJvY2Vzc0dyYXBoKCB0aGlzLm91dHB1dCApXG4gICAgbGFzdExpbmUgPSBjYWxsYmFja0JvZHlbIGNhbGxiYWNrQm9keS5sZW5ndGggLSAxXVxuICAgIFxuICAgIGNhbGxiYWNrQm9keS5wdXNoKCAnXFxuXFx0cmV0dXJuICcgKyBsYXN0TGluZS5zcGxpdCggJz0nIClbMF0uc3BsaXQoICcgJyApWzFdIClcblxuICAgIGlmKCB0aGlzLmRlYnVnICkgY29uc29sZS5sb2coICdjYWxsYmFjazpcXG4nLCBjYWxsYmFja0JvZHkuam9pbignXFxuJykgKVxuICAgIHRoaXMuY2FsbGJhY2sgPSBGdW5jdGlvbiggLi4udGhpcy5jYWxsYmFja05hbWVzLCBjYWxsYmFja0JvZHkuam9pbiggJ1xcbicgKSApXG4gICAgdGhpcy5jYWxsYmFjay5vdXQgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2sgXG4gIH0sXG5cbiAgcHJvY2Vzc0dyYXBoKCBvdXRwdXQgKSB7XG4gICAgdGhpcy5jYWxsYmFja1VnZW5zLmxlbmd0aCA9IDBcbiAgICB0aGlzLmNhbGxiYWNrTmFtZXMubGVuZ3RoID0gMFxuXG4gICAgdGhpcy5jYWxsYmFja1VnZW5zLnB1c2goIG91dHB1dCApXG5cbiAgICBsZXQgYm9keSA9IHRoaXMucHJvY2Vzc1VnZW4oIG91dHB1dCApXG4gICAgdGhpcy5jYWxsYmFja05hbWVzID0gdGhpcy5jYWxsYmFja1VnZW5zLm1hcCggdiA9PiB2LnVnZW5OYW1lIClcblxuICAgIHRoaXMuZGlydHlVZ2Vucy5sZW5ndGggPSAwXG4gICAgdGhpcy5ncmFwaElzRGlydHkgPSBmYWxzZVxuXG4gICAgcmV0dXJuIGJvZHlcbiAgfSxcblxuICBwcm9jZXNzVWdlbiggdWdlbiwgYmxvY2sgKSB7XG4gICAgaWYoIGJsb2NrID09PSB1bmRlZmluZWQgKSBibG9jayA9IFtdXG5cbiAgICBsZXQgZGlydHlJZHggPSBHaWJiZXJpc2guZGlydHlVZ2Vucy5pbmRleE9mKCB1Z2VuIClcbiAgICBcbiAgICBpZiggdWdlbi5ibG9jayA9PT0gdW5kZWZpbmVkIHx8IGRpcnR5SW5kZXggIT09IC0xICkge1xuICBcbiAgICAgIGxldCBsaW5lID0gYFxcdHZhciB2XyR7dWdlbi5pZH0gPSBgIFxuICAgICAgXG4gICAgICBpZiggIXVnZW4uYmlub3AgKSBsaW5lICs9IGAke3VnZW4udWdlbk5hbWV9KCBgXG5cbiAgICAgIC8vIG11c3QgZ2V0IGFycmF5IHNvIHdlIGNhbiBrZWVwIHRyYWNrIG9mIGxlbmd0aCBmb3IgY29tbWEgaW5zZXJ0aW9uXG4gICAgICBsZXQga2V5cyA9IHVnZW4uYmlub3AgfHwgdWdlbi50eXBlID09PSAnYnVzJyA/IE9iamVjdC5rZXlzKCB1Z2VuLmlucHV0cyApIDogT2JqZWN0LmtleXMoIHVnZW4uaW5wdXROYW1lcyApXG4gICAgICBcbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgbGV0IGtleSA9IGtleXNbIGkgXVxuICAgICAgICAvLyBiaW5vcC5pbnB1dHMgaXMgYWN0dWFsIHZhbHVlcywgbm90IGp1c3QgcHJvcGVydHkgbmFtZXNcbiAgICAgICAgbGV0IGlucHV0ID0gdWdlbi5iaW5vcCB8fCB1Z2VuLnR5cGUgPT09J2J1cycgID8gdWdlbi5pbnB1dHNbIGtleSBdIDogdWdlblsgdWdlbi5pbnB1dE5hbWVzWyBrZXkgXSBdXG5cbiAgICAgICAgaWYoIHR5cGVvZiBpbnB1dCA9PT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgbGluZSArPSBpbnB1dFxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBpZiggaW5wdXQgPT09IHVuZGVmaW5lZCApIHsgIGNvbnNvbGUubG9nKCBrZXkgKTsgY29udGludWU7IH1cbiAgICAgICAgICBHaWJiZXJpc2gucHJvY2Vzc1VnZW4oIGlucHV0LCBibG9jayApXG5cbiAgICAgICAgICBpZiggIWlucHV0LmJpbm9wICkgR2liYmVyaXNoLmNhbGxiYWNrVWdlbnMucHVzaCggaW5wdXQgKVxuXG4gICAgICAgICAgbGluZSArPSBgdl8ke2lucHV0LmlkfWBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCBpIDwga2V5cy5sZW5ndGggLSAxICkge1xuICAgICAgICAgIGxpbmUgKz0gdWdlbi5iaW5vcCA/ICcgJyArIHVnZW4ub3AgKyAnICcgOiAnLCAnIFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpbmUgKz0gdWdlbi5iaW5vcCA/ICcnIDogJyApJ1xuXG4gICAgICBibG9jay5wdXNoKCBsaW5lIClcbiAgICB9ZWxzZSBpZiggdWdlbi5ibG9jayApIHtcbiAgICAgIHJldHVybiB1Z2VuLmJsb2NrXG4gICAgfVxuXG4gICAgcmV0dXJuIGJsb2NrXG4gIH0sXG4gICAgXG59XG5cbm1vZHVsZS5leHBvcnRzID0gR2liYmVyaXNoXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBLUFMgPSBwcm9wcyA9PiB7XG4gICAgbGV0IHRyaWdnZXIgPSBnLmJhbmcoKSxcbiAgICAgICAgcGhhc2UgPSBnLmFjY3VtKCAxLCB0cmlnZ2VyLCB7IG1heDpJbmZpbml0eSB9ICksXG4gICAgICAgIGVudiA9IGcuZ3RwKCBnLnN1YiggMSwgZy5kaXYoIHBoYXNlLCAyMDAgKSApLCAwICksXG4gICAgICAgIGltcHVsc2UgPSBnLm11bCggZy5ub2lzZSgpLCBlbnYgKSxcbiAgICAgICAgZmVlZGJhY2sgPSBnLmhpc3RvcnkoKSxcbiAgICAgICAgZnJlcXVlbmN5ID0gZy5pbignZnJlcXVlbmN5JyksXG4gICAgICAgIGRlbGF5ID0gZy5kZWxheSggZy5hZGQoIGltcHVsc2UsIGZlZWRiYWNrLm91dCApLCBkaXYoIEdpYmJlcmlzaC5jdHguc2FtcGxlUmF0ZSwgZnJlcXVlbmN5ICksIHsgc2l6ZToyMDQ4IH0pLFxuICAgICAgICBkZWNheWVkID0gZy5tdWwoIGRlbGF5LCBnLnQ2MCggZy5tdWwoIGcuaW4oJ2RlY2F5JyksIGZyZXF1ZW5jeSApICkgKSxcbiAgICAgICAgZGFtcGVkID0gIGcubWl4KCBkZWNheWVkLCBmZWVkYmFjay5vdXQsIGcuaW4oJ2RhbXBpbmcnKSApLFxuICAgICAgICB3aXRoR2FpbiA9IGcubXVsKCBkYW1wZWQsIGcuaW4oJ2dhaW4nKSApXG5cbiAgICBmZWVkYmFjay5pbiggZGFtcGVkIClcblxuICAgIHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgS1BTLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBsZXQgcGFubmVyID0gZy5wYW4oIHdpdGhHYWluLCB3aXRoR2FpbiwgZy5pbiggJ3BhbicgKSApLFxuICAgICAgICBzeW4gPSBHaWJiZXJpc2guZmFjdG9yeSggW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdLCAna2FycGx1cycsIHByb3BlcnRpZXMgIClcblxuICAgIE9iamVjdC5hc3NpZ24oIHN5biwge1xuICAgICAgcHJvcGVydGllcyA6IHByb3BzLFxuXG4gICAgICBlbnYgOiB0cmlnZ2VyLFxuICAgICAgcGhhc2UsXG5cbiAgICAgIG5vdGUoIGZyZXEgKSB7XG4gICAgICAgIHN5bi5mcmVxdWVuY3kgPSBmcmVxXG4gICAgICAgIHN5bi5lbnYudHJpZ2dlcigpXG4gICAgICB9LFxuXG4gICAgICB0cmlnZ2VyIDogZW52LnRyaWdnZXIsXG5cbiAgICAgIGdldFBoYXNlKCkge1xuICAgICAgICByZXR1cm4gR2liYmVyaXNoLm1lbW9yeS5oZWFwWyBwaGFzZS5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH0sXG5cbiAgICAgIGZyZWUoKSB7XG4gICAgICAgIEdpYmJlcmlzaC5nZW5pc2guZ2VuLmZyZWUoIFtwYW5uZXIubGVmdCwgcGFubmVyLnJpZ2h0XSApXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gc3luXG4gIH1cbiAgXG4gIEtQUy5kZWZhdWx0cyA9IHtcbiAgICBkZWNheTogLjk3LFxuICAgIGRhbXBpbmc6LjYsXG4gICAgZ2FpbjogMSxcbiAgICBmcmVxdWVuY3k6MjIwLFxuICAgIHBhbjogLjVcbiAgfVxuXG4gIGxldCBlbnZDaGVja0ZhY3RvcnkgPSAoIHN5bixzeW50aCApID0+IHtcbiAgICBsZXQgZW52Q2hlY2sgPSAoKT0+IHtcbiAgICAgIGxldCBwaGFzZSA9IHN5bi5nZXRQaGFzZSgpLFxuICAgICAgICAgIGVuZFRpbWUgPSBzeW50aC5kZWNheSAqIEdpYmJlcmlzaC5jdHguc2FtcGxlUmF0ZVxuXG4gICAgICBpZiggcGhhc2UgPiBlbmRUaW1lICkge1xuICAgICAgICBzeW50aC5kaXNjb25uZWN0KCBzeW4gKVxuICAgICAgICBzeW4uaXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgICAgICBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIHN5bi5waGFzZS5tZW1vcnkudmFsdWUuaWR4IF0gPSAwIC8vIHRyaWdnZXIgZG9lc24ndCBzZWVtIHRvIHJlc2V0IGZvciBzb21lIHJlYXNvblxuICAgICAgfWVsc2V7XG4gICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5wdXNoKCBlbnZDaGVjayApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbnZDaGVja1xuICB9XG5cbiAgbGV0IFBvbHlLUFMgPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBLUFMsIFsnZnJlcXVlbmN5JywnZGVjYXknLCdkYW1waW5nJywncGFuJywnZ2FpbiddLCBlbnZDaGVja0ZhY3RvcnkgKSBcblxuICByZXR1cm4gWyBLUFMsIFBvbHlLUFMgXVxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuLypcbiBHaWJiZXJpc2guS2ljayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgdHJpZ2dlciA9IGZhbHNlLFxuICAgIFx0YnBmID0gbmV3IEdpYmJlcmlzaC5TVkYoKS5jYWxsYmFjayxcbiAgICBcdGxwZiA9IG5ldyBHaWJiZXJpc2guU1ZGKCkuY2FsbGJhY2ssXG4gICAgICBfZGVjYXkgPSAuMixcbiAgICAgIF90b25lID0gLjg7XG4gICAgICBcbiAgR2liYmVyaXNoLmV4dGVuZCh0aGlzLCB7XG4gIFx0bmFtZTpcdFx0XCJraWNrXCIsXG4gICAgcHJvcGVydGllczpcdHsgcGl0Y2g6NTAsIF9fZGVjYXk6MjAsIF9fdG9uZTogMTAwMCwgYW1wOjIsIHNyOiBHaWJiZXJpc2guY29udGV4dC5zYW1wbGVSYXRlIH0sXG5cdFxuICBcdGNhbGxiYWNrOiBmdW5jdGlvbihwaXRjaCwgZGVjYXksIHRvbmUsIGFtcCwgc3IpIHtcdFx0XHRcdFx0XG4gIFx0XHR2YXIgb3V0ID0gdHJpZ2dlciA/IDYwIDogMDtcblx0XHRcdFxuICBcdFx0b3V0ID0gYnBmKCBvdXQsIHBpdGNoLCBkZWNheSwgMiwgc3IgKTtcbiAgXHRcdG91dCA9IGxwZiggb3V0LCB0b25lLCAuNSwgMCwgc3IgKTtcblx0XHRcbiAgXHRcdG91dCAqPSBhbXA7XG5cdFx0XG4gIFx0XHR0cmlnZ2VyID0gZmFsc2U7XG5cdFx0XG4gIFx0XHRyZXR1cm4gb3V0O1xuICBcdH0sXG5cbiAgXHRub3RlIDogZnVuY3Rpb24ocCwgZCwgdCwgYW1wKSB7XG4gIFx0XHRpZih0eXBlb2YgcCA9PT0gJ251bWJlcicpIHRoaXMucGl0Y2ggPSBwO1xuICBcdFx0aWYodHlwZW9mIGQgPT09ICdudW1iZXInKSB0aGlzLmRlY2F5ID0gZDtcbiAgXHRcdGlmKHR5cGVvZiB0ID09PSAnbnVtYmVyJykgdGhpcy50b25lID0gdDtcbiAgXHRcdGlmKHR5cGVvZiBhbXAgPT09ICdudW1iZXInKSB0aGlzLmFtcCA9IGFtcDtcblx0XHRcbiAgICAgIHRyaWdnZXIgPSB0cnVlO1xuICBcdH0sXG4gIH0pXG4gIC5pbml0KClcbiAgLm9zY2lsbGF0b3JJbml0KCk7XG4gIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgZGVjYXkgOntcbiAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBfZGVjYXk7IH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkgeyBfZGVjYXkgPSB2YWwgPiAxID8gMSA6IHZhbDsgdGhpcy5fX2RlY2F5ID0gX2RlY2F5ICogMTAwOyB9XG4gICAgfSxcbiAgICB0b25lIDp7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gX3RvbmU7IH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkgeyBfdG9uZSA9IHZhbCA+IDEgPyAxIDogdmFsOyB0aGlzLl9fdG9uZSA9IDIyMCArIHZhbCAqIDE0MDA7ICB9XG4gICAgfSxcbiAgfSk7XG4gIFxuICB0aGlzLnByb2Nlc3NQcm9wZXJ0aWVzKGFyZ3VtZW50cyk7XG59O1xuR2liYmVyaXNoLktpY2sucHJvdG90eXBlID0gR2liYmVyaXNoLl9vc2NpbGxhdG9yOyBcbiovXG4gIGxldCBLaWNrID0gcHJvcHMgPT4ge1xuICAgIGxldCBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICBkZWNheSA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgdG9uZSAgPSBnLmluKCAndG9uZScgKSxcbiAgICAgICAgZ2FpbiAgPSBnLmluKCAnZ2FpbicgKVxuXG4gICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgS2ljay5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgbGV0IHRyaWdnZXIgPSBnLmJhbmcoKSxcbiAgICAgICAgaW1wdWxzZSA9IG11bCggdHJpZ2dlciwgMjYwKSxcbiAgICAgICAgYnBmID0gZy5iaXF1YWQoIGltcHVsc2UsIGZyZXF1ZW5jeSwgZGVjYXksICdCUCcsIGZhbHNlICksXG4gICAgICAgIGxwZiA9IGcuYmlxdWFkKCBicGYsIHRvbmUsIC41LCAnTFAnLCBmYWxzZSApLFxuICAgICAgICBvdXQgPSBtdWwoIGxwZiwgZ2FpbiApXG4gICAgXG4gICAgbGV0IGtpY2sgPSBHaWJiZXJpc2guZmFjdG9yeSggb3V0LCAnc3ludGgnLCBwcm9wcyAgKVxuICAgIFxuICAgIGtpY2suZW52ID0gdHJpZ2dlclxuXG4gICAga2ljay5ub3RlID0gZnJlcSA9PiB7XG4gICAgICBraWNrLmZyZXF1ZW5jeSA9IGZyZXFcbiAgICAgIGtpY2suZW52LnRyaWdnZXIoKVxuICAgIH1cblxuICAgIGtpY2sudHJpZ2dlciA9IGtpY2suZW52LnRyaWdnZXJcblxuICAgIGtpY2suZnJlZSA9ICgpID0+IHtcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guZ2VuLmZyZWUoIG91dCApXG4gICAgfVxuXG5cbiAgICByZXR1cm4ga2lja1xuICB9XG4gIFxuICBLaWNrLmRlZmF1bHRzID0ge1xuICAgIGdhaW46IDEsXG4gICAgZnJlcXVlbmN5OjY1LFxuICAgIHRvbmU6IDU1MCxcbiAgICBkZWNheToxMFxuICB9XG5cbiAgcmV0dXJuIEtpY2tcblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgU3ludGggPSBwcm9wcyA9PiB7XG4gICAgbGV0IG9zY3MgPSBbXSwgXG4gICAgICAgIGVudiA9IGcuYWQoIGcuaW4oICdhdHRhY2snICksIGcuaW4oICdkZWNheScgKSwgeyBzaGFwZTonbGluZWFyJyB9KSxcbiAgICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgcGhhc2VcblxuICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIFN5bnRoLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IDM7IGkrKyApIHtcbiAgICAgIGxldCBvc2MsIGZyZXFcblxuICAgICAgLy9mcmVxID0gaSA9PT0gMCA/IGZyZXF1ZW5jeSA6IG11bCggZnJlcXVlbmN5LCBpICsgMSApXG4gICAgICBzd2l0Y2goIGkgKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBmcmVxID0gbXVsKCBmcmVxdWVuY3ksIGFkZCggZy5pbignb2N0YXZlMicpLCBnLmluKCdkZXR1bmUyJykgICkgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgZnJlcSA9IG11bCggZnJlcXVlbmN5LCBhZGQoIGcuaW4oJ29jdGF2ZTMnKSwgZy5pbignZGV0dW5lMycpICApIClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBmcmVxID0gZnJlcXVlbmN5XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCggcHJvcHMud2F2ZWZvcm0gKSB7XG4gICAgICAgIGNhc2UgJ3Nhdyc6XG4gICAgICAgICAgb3NjID0gZy5waGFzb3IoIGZyZXEgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzcXVhcmUnOlxuICAgICAgICAgIHBoYXNlID0gZy5waGFzb3IoIGZyZXEsIDAsIHsgbWluOjAgfSApXG4gICAgICAgICAgb3NjID0gbHQoIHBoYXNlLCAuNSApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NpbmUnOlxuICAgICAgICAgIG9zYyA9IGN5Y2xlKCBmcmVxIClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncHdtJzpcbiAgICAgICAgICBwaGFzZSA9IGcucGhhc29yKCBmcmVxLCAwLCB7IG1pbjowIH0gKVxuICAgICAgICAgIG9zYyA9IGx0KCBwaGFzZSwgZy5pbiggJ3B1bHNld2lkdGgnICkgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgb3Njc1tpXSA9IG9zY1xuICAgIH1cblxuICAgIGxldCBvc2NTdW0gPSBhZGQoIC4uLm9zY3MgKSxcbiAgICAgICAgb3NjV2l0aEdhaW4gPSBnLm11bCggZy5tdWwoIG9zY1N1bSwgZW52ICksIGcuaW4oICdnYWluJyApICksXG4gICAgICAgIGlzTG93UGFzcyA9IGcucGFyYW0oICdsb3dQYXNzJywgMSApLFxuICAgICAgICBmaWx0ZXJlZE9zYyA9IGcuZmlsdGVyMjQoIG9zY1dpdGhHYWluLCBnLmluKCdyZXNvbmFuY2UnKSwgZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBlbnYgKSwgaXNMb3dQYXNzICksXG4gICAgICAgIHBhbm5lciA9IGcucGFuKCBmaWx0ZXJlZE9zYyxmaWx0ZXJlZE9zYywgZy5pbiggJ3BhbicgKSApLFxuICAgICAgICBzeW4gPSBHaWJiZXJpc2guZmFjdG9yeSggW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdLCAnc3ludGgnLCBwcm9wcyAgKVxuICAgIFxuICAgIHN5bi5lbnYgPSBlbnZcblxuICAgIHN5bi5ub3RlID0gZnJlcSA9PiB7XG4gICAgICBzeW4uZnJlcXVlbmN5ID0gZnJlcVxuICAgICAgc3luLmVudi50cmlnZ2VyKClcbiAgICB9XG5cbiAgICBzeW4udHJpZ2dlciA9IHN5bi5lbnYudHJpZ2dlclxuXG4gICAgc3luLmZyZWUgPSAoKSA9PiB7XG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLmdlbi5mcmVlKCBbcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodF0gKVxuICAgIH1cblxuICAgIHJldHVybiBzeW5cbiAgfVxuICBcbiAgU3ludGguZGVmYXVsdHMgPSB7XG4gICAgd2F2ZWZvcm06ICdzYXcnLFxuICAgIGF0dGFjazogNDQxMDAsXG4gICAgZGVjYXk6IDQ0MTAwLFxuICAgIGdhaW46IDEsXG4gICAgcHVsc2V3aWR0aDouMjUsXG4gICAgZnJlcXVlbmN5OjIyMCxcbiAgICBwYW46IC41LFxuICAgIG9jdGF2ZTI6MixcbiAgICBvY3RhdmUzOjQsXG4gICAgZGV0dW5lMjouMDEsXG4gICAgZGV0dW5lMzotLjAxLFxuICAgIGN1dG9mZjogLjI1LFxuICAgIHJlc29uYW5jZToyLFxuICB9XG5cbiAgbGV0IFBvbHlNb25vID0gR2liYmVyaXNoLlBvbHlUZW1wbGF0ZSggU3ludGgsIFxuICAgIFsnZnJlcXVlbmN5JywnYXR0YWNrJywnZGVjYXknLCdjdXRvZmYnLCdyZXNvbmFuY2UnLFxuICAgICAnb2N0YXZlMicsJ29jdGF2ZTMnLCdkZXR1bmUyJywnZGV0dW5lMycsJ3B1bHNld2lkdGgnLCdwYW4nLCdnYWluJ11cbiAgKSBcblxuICByZXR1cm4gWyBTeW50aCwgUG9seU1vbm8gXVxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgT3NjaWxsYXRvcnMgPSB7XG4gICAgZXhwb3J0KCBvYmogKSB7XG4gICAgICBmb3IoIGxldCBrZXkgaW4gT3NjaWxsYXRvcnMgKSB7XG4gICAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgICAgIG9ialsga2V5IF0gPSBPc2NpbGxhdG9yc1sga2V5IF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBTaW5lKCBwcm9wcyApIHtcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgT3NjaWxsYXRvcnMuZGVmYXVsdHMsIHByb3BzIClcbiAgICAgIHJldHVybiAgR2liYmVyaXNoLmZhY3RvcnkoIGcubXVsKCBnLmN5Y2xlKCBnLmluKCdmcmVxdWVuY3knKSApLCBnLmluKCdnYWluJykgKSwgJ3NpbmUnLCBwcm9wcyApXG4gICAgfSxcbiAgICBOb2lzZSggcHJvcHMgKSB7XG4gICAgICByZXR1cm4gIEdpYmJlcmlzaC5mYWN0b3J5KCBnLm11bCggZy5ub2lzZSgpLCBnLmluKCdnYWluJykgKSwgJ25vaXNlJywgeyBnYWluOiBpc05hTiggcHJvcHMuZ2FpbiApID8gMSA6IHByb3BzLmdhaW4gfSAgKVxuICAgIH0sXG4gICAgU2F3KCBwcm9wcyApIHsgXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIE9zY2lsbGF0b3JzLmRlZmF1bHRzLCBwcm9wcyApXG4gICAgICByZXR1cm4gR2liYmVyaXNoLmZhY3RvcnkoIGcubXVsKCBnLnBoYXNvciggZy5pbignZnJlcXVlbmN5JykgKSwgZy5pbignZ2FpbicgKSApLCAnc2F3JywgcHJvcHMgKVxuICAgIH1cbiAgfVxuXG4gIE9zY2lsbGF0b3JzLmRlZmF1bHRzID0ge1xuICAgIGZyZXF1ZW5jeTogNDQwLFxuICAgIGdhaW46IDFcbiAgfVxuXG4gIHJldHVybiBPc2NpbGxhdG9yc1xuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IFRlbXBsYXRlRmFjdG9yeSA9ICggdWdlbiwgcHJvcGVydHlMaXN0LCBfZW52Q2hlY2sgKSA9PiB7XG4gICAgbGV0IFRlbXBsYXRlID0gcHJvcHMgPT4ge1xuICAgICAgbGV0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgeyBpc1N0ZXJlbzp0cnVlIH0sIHByb3BzIClcblxuICAgICAgbGV0IHN5bnRoID0gcHJvcGVydGllcy5pc1N0ZXJlbyA/IEdpYmJlcmlzaC5CdXMyKCkgOiBHaWJiZXJpc2guQnVzKCksXG4gICAgICAgIHZvaWNlcyA9IFtdLFxuICAgICAgICB2b2ljZUNvdW50ID0gMFxuXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IDE2OyBpKysgKSB7XG4gICAgICAgIHZvaWNlc1tpXSA9IHVnZW4oIHByb3BlcnRpZXMgKVxuICAgICAgICB2b2ljZXNbaV0uaXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgICAgfVxuXG4gICAgICBPYmplY3QuYXNzaWduKCBzeW50aCwge1xuICAgICAgICBwcm9wZXJ0aWVzLFxuICAgICAgICB2b2ljZXMsXG4gICAgICAgIGlzU3RlcmVvOiBwcm9wZXJ0aWVzLmlzU3RlcmVvLFxuXG4gICAgICAgIG5vdGUoIGZyZXEgKSB7XG4gICAgICAgICAgbGV0IHZvaWNlID0gdm9pY2VzWyB2b2ljZUNvdW50KysgJSB2b2ljZXMubGVuZ3RoIF1cbiAgICAgICAgICBPYmplY3QuYXNzaWduKCB2b2ljZSwgc3ludGgucHJvcGVydGllcyApXG5cbiAgICAgICAgICB2b2ljZS5ub3RlKCBmcmVxIClcblxuICAgICAgICAgIGlmKCAhdm9pY2UuaXNDb25uZWN0ZWQgKSB7XG4gICAgICAgICAgICB2b2ljZS5jb25uZWN0KCB0aGlzLCAxIClcbiAgICAgICAgICAgIHZvaWNlLmlzQ29ubmVjdGVkID0gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICBsZXQgZW52Q2hlY2tcbiAgICAgICAgICBpZiggX2VudkNoZWNrID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBlbnZDaGVjayA9ICgpPT4ge1xuICAgICAgICAgICAgICBpZiggdm9pY2UuZW52LmlzQ29tcGxldGUoKSApIHtcbiAgICAgICAgICAgICAgICBzeW50aC5kaXNjb25uZWN0KCB2b2ljZSApXG4gICAgICAgICAgICAgICAgdm9pY2UuaXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3MucHVzaCggZW52Q2hlY2sgKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBlbnZDaGVjayA9IF9lbnZDaGVjayggdm9pY2UsIHN5bnRoIClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3MucHVzaCggZW52Q2hlY2sgKVxuICAgICAgICB9LFxuXG4gICAgICAgIGNob3JkKCBmcmVxdWVuY2llcyApIHtcbiAgICAgICAgICBmcmVxdWVuY2llcy5mb3JFYWNoKCAodikgPT4gc3ludGgubm90ZSh2KSApXG4gICAgICAgIH0sXG5cbiAgICAgICAgZnJlZSgpIHtcbiAgICAgICAgICBmb3IoIGxldCBjaGlsZCBvZiB2b2ljZXMgKSBjaGlsZC5mcmVlKClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIFxuICAgICAgbGV0IF9wcm9wZXJ0eUxpc3QgXG4gICAgICBpZiggcHJvcGVydGllcy5pc1N0ZXJlbyA9PT0gZmFsc2UgKSB7XG4gICAgICAgIF9wcm9wZXJ0eUxpc3QgPSBwcm9wZXJ0eUxpc3Quc2xpY2UoIDAgKVxuICAgICAgICBsZXQgaWR4ID0gIF9wcm9wZXJ0eUxpc3QuaW5kZXhPZiggJ3BhbicgKVxuICAgICAgICBpZiggaWR4ICA+IC0xICkgX3Byb3BlcnR5TGlzdC5zcGxpY2UoIGlkeCwgMSApXG4gICAgICB9XG5cbiAgICAgIFRlbXBsYXRlRmFjdG9yeS5zZXR1cFByb3BlcnRpZXMoIHN5bnRoLCB1Z2VuLCBwcm9wZXJ0aWVzLmlzU3RlcmVvID8gcHJvcGVydHlMaXN0IDogX3Byb3BlcnR5TGlzdCApXG5cbiAgICAgIHJldHVybiBzeW50aFxuICAgIH1cblxuICAgIHJldHVybiBUZW1wbGF0ZVxuICB9XG5cbiAgVGVtcGxhdGVGYWN0b3J5LnNldHVwUHJvcGVydGllcyA9ICggc3ludGgsIHVnZW4sIHByb3BzICkgPT4ge1xuICAgIGZvciggbGV0IHByb3BlcnR5IG9mIHByb3BzICkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBzeW50aCwgcHJvcGVydHksIHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiBzeW50aC5wcm9wZXJ0aWVzWyBwcm9wZXJ0eSBdIHx8IHVnZW4uZGVmYXVsdHNbIHByb3BlcnR5IF1cbiAgICAgICAgfSxcbiAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgIHN5bnRoLnByb3BlcnRpZXNbIHByb3BlcnR5IF0gPSB2XG4gICAgICAgICAgZm9yKCBsZXQgY2hpbGQgb2Ygc3ludGguaW5wdXRzICkge1xuICAgICAgICAgICAgY2hpbGRbIHByb3BlcnR5IF0gPSB2XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBUZW1wbGF0ZUZhY3RvcnlcblxufVxuIiwiY29uc3QgUXVldWUgPSByZXF1aXJlKCAnLi4vZXh0ZXJuYWwvcHJpb3JpdHlxdWV1ZS5qcycgKVxuY29uc3QgQmlnICAgPSByZXF1aXJlKCAnYmlnLmpzJyApXG5cbmxldCBTY2hlZHVsZXIgPSB7XG4gIHBoYXNlOiAwLFxuXG4gIHF1ZXVlOiBuZXcgUXVldWUoICggYSwgYiApID0+IHtcbiAgICBpZiggYS50aW1lID09PSBiLnRpbWUgKSB7IC8vYS50aW1lLmVxKCBiLnRpbWUgKSApIHtcbiAgICAgIHJldHVybiBiLnByaW9yaXR5IC0gYS5wcmlvcml0eVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIGEudGltZSAtIGIudGltZSAvL2EudGltZS5taW51cyggYi50aW1lIClcbiAgICB9XG4gIH0pLFxuXG4gIGFkZCggdGltZSwgZnVuYywgcHJpb3JpdHkgPSAwICkge1xuICAgIHRpbWUgKz0gdGhpcy5waGFzZVxuXG4gICAgdGhpcy5xdWV1ZS5wdXNoKHsgdGltZSwgZnVuYywgcHJpb3JpdHkgfSlcbiAgfSxcblxuICB0aWNrKCkge1xuICAgIGlmKCB0aGlzLnF1ZXVlLmxlbmd0aCApIHtcbiAgICAgIGxldCBuZXh0ID0gdGhpcy5xdWV1ZS5wZWVrKClcblxuICAgICAgaWYoIHRoaXMucGhhc2UrKyA+PSBuZXh0LnRpbWUgKSB7XG4gICAgICAgIG5leHQuZnVuYygpXG4gICAgICAgIHRoaXMucXVldWUucG9wKClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2NoZWR1bGVyXG4iLCJjb25zdCBRdWV1ZSA9IHJlcXVpcmUoICcuLi9leHRlcm5hbC9wcmlvcml0eXF1ZXVlLmpzJyApXG5jb25zdCBCaWcgICA9IHJlcXVpcmUoICdiaWcuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG5sZXQgU2VxdWVuY2VyID0gcHJvcHMgPT4ge1xuICBsZXQgc2VxID0ge1xuICAgIHBoYXNlOiAwLFxuICAgIGtleTogcHJvcHMua2V5IHx8ICdub3RlJyxcbiAgICB0YXJnZXQ6ICBwcm9wcy50YXJnZXQsXG4gICAgdmFsdWVzOiAgcHJvcHMudmFsdWVzIHx8IFsgNDQwIF0sXG4gICAgdGltaW5nczogcHJvcHMudGltaW5nc3x8IFsgMTEwMjUgXSxcbiAgICB2YWx1ZXNQaGFzZTogIDAsXG4gICAgdGltaW5nc1BoYXNlOiAwLFxuXG4gICAgdGljaygpIHtcbiAgICAgIGxldCB2YWx1ZSAgPSBzZXEudmFsdWVzWyAgc2VxLnZhbHVlc1BoYXNlKysgICUgc2VxLnZhbHVlcy5sZW5ndGggIF0sXG4gICAgICAgICAgdGltaW5nID0gc2VxLnRpbWluZ3NbIHNlcS50aW1pbmdzUGhhc2UrKyAlIHNlcS50aW1pbmdzLmxlbmd0aCBdXG4gICAgICBcbiAgICAgIGlmKCB0eXBlb2Ygc2VxLnRhcmdldFsgc2VxLmtleSBdID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgICBzZXEudGFyZ2V0WyBzZXEua2V5IF0oIHZhbHVlIClcbiAgICAgIH1lbHNle1xuICAgICAgICBzZXEudGFyZ2V0WyBzZXEua2V5IF0gPSB2YWx1ZVxuICAgICAgfVxuXG4gICAgICBHaWJiZXJpc2guc2NoZWR1bGVyLmFkZCggdGltaW5nLCBzZXEudGljayApXG4gICAgfVxuICB9XG5cbiAgR2liYmVyaXNoLnNjaGVkdWxlci5hZGQoIDAsIHNlcS50aWNrIClcblxuICByZXR1cm4gc2VxIFxufVxuXG5yZXR1cm4gU2VxdWVuY2VyXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBHaWJiZXJpc2guZ2VuaXNoLnN2ZiA9ICggaW5wdXQsIGN1dG9mZiwgUSwgbW9kZSwgaXNTdGVyZW8gKSA9PiB7XG4gICAgbGV0IGQxID0gZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSksIGQyID0gZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSksXG4gICAgICAgIHBlZWtQcm9wcyA9IHsgbW9kZTonc2ltcGxlJywgaW50ZXJwOidub25lJyB9XG4gICAgXG4gICAgbGV0IGYxID0gbWVtbyggZy5tdWwoIDIgKiBNYXRoLlBJLCBkaXYoIGN1dG9mZiwgZy5nZW4uc2FtcGxlcmF0ZSApICkgKVxuICAgIGxldCBvbmVPdmVyUSA9IGcubWVtbyggZGl2KCAxLCBRICkgKVxuICAgIGxldCBsID0gZy5tZW1vKCBnLmFkZCggZDJbMF0sIG11bCggZjEsIGQxWzBdICkgKSApLFxuICAgICAgICBoID0gZy5tZW1vKCBnLnN1YiggZy5zdWIoIGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dCwgbCApLCBnLm11bCggUSwgZDFbMF0gKSApICksXG4gICAgICAgIGIgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggZjEsIGggKSwgZDFbMF0gKSApLFxuICAgICAgICBuID0gZy5tZW1vKCBnLmFkZCggaCwgbCApIClcblxuICAgIGQxWzBdID0gYlxuICAgIGQyWzBdID0gbFxuXG4gICAgbGV0IG91dCA9IGcuc2VsZWN0b3IoIG1vZGUsIGwsIGgsIGIsIG4gKVxuXG4gICAgbGV0IHJldHVyblZhbHVlXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgbGV0IGQxMiA9IGRhdGEoWzAsMF0sIDEsIHsgbWV0YTp0cnVlIH0pLCBkMjIgPSBkYXRhKFswLDBdLCAxLCB7IG1ldGE6dHJ1ZSB9KVxuICAgICAgbGV0IGwyID0gZy5tZW1vKCBnLmFkZCggZDIyWzBdLCBtdWwoIGYxLCBkMTJbMF0gKSApICksXG4gICAgICAgICAgaDIgPSBnLm1lbW8oIGcuc3ViKCBnLnN1YiggaW5wdXRbMV0sIGwyICksIGcubXVsKCBRLCBkMTJbMF0gKSApICksXG4gICAgICAgICAgYjIgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggZjEsIGgyICksIGQxMlswXSApICksXG4gICAgICAgICAgbjIgPSBnLm1lbW8oIGcuYWRkKCBoMiwgbDIgKSApXG5cbiAgICAgIGQxMlswXSA9IGIyXG4gICAgICBkMjJbMF0gPSBsMlxuXG4gICAgICBsZXQgb3V0MiA9IGcuc2VsZWN0b3IoIG1vZGUsIGwyLCBoMiwgYjIsIG4yIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBbIG91dCwgb3V0MiBdXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbiAgbGV0IFNWRiA9IHByb3BzID0+IHtcbiAgICBsZXQgX3Byb3BzID0gT2JqZWN0LmFzc2lnbigge30sIFNWRi5kZWZhdWx0cywgcHJvcHMgKSBcblxuICAgIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvXG5cbiAgICBsZXQgZmlsdGVyID0gR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgR2liYmVyaXNoLmdlbmlzaC5zdmYoIGcuaW4oJ2lucHV0JyksIGcuaW4oJ2N1dG9mZicpLCBnLmluKCdRJyksIGcuaW4oJ21vZGUnKSwgaXNTdGVyZW8gKSwgXG4gICAgICAnc3ZmJywgXG4gICAgICBfcHJvcHNcbiAgICApXG5cbiAgICByZXR1cm4gZmlsdGVyXG4gIH1cblxuXG4gIFNWRi5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIFE6IC43NSxcbiAgICBjdXRvZmY6NTUwLFxuICAgIG1vZGU6MFxuICB9XG5cbiAgcmV0dXJuIFNWRlxuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IFN5bnRoID0gcHJvcHMgPT4ge1xuICAgIGxldCBvc2MsIFxuICAgICAgICBlbnYgPSBnLmFkKCBnLmluKCdhdHRhY2snKSwgZy5pbignZGVjYXknKSwgeyBzaGFwZTonbGluZWFyJyB9KSxcbiAgICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgcGhhc2VcblxuICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIFN5bnRoLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBzd2l0Y2goIHByb3BzLndhdmVmb3JtICkge1xuICAgICAgY2FzZSAnc2F3JzpcbiAgICAgICAgb3NjID0gZy5waGFzb3IoIGZyZXF1ZW5jeSApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgcGhhc2UgPSBnLnBoYXNvciggZnJlcXVlbmN5LCAwLCB7IG1pbjowIH0gKVxuICAgICAgICBvc2MgPSBsdCggcGhhc2UsIC41IClcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzaW5lJzpcbiAgICAgICAgb3NjID0gY3ljbGUoIGZyZXF1ZW5jeSApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncHdtJzpcbiAgICAgICAgcGhhc2UgPSBnLnBoYXNvciggZnJlcXVlbmN5LCAwLCB7IG1pbjowIH0gKVxuICAgICAgICBvc2MgPSBsdCggcGhhc2UsIGcuaW4oICdwdWxzZXdpZHRoJyApIClcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgbGV0IG9zY1dpdGhHYWluID0gZy5tdWwoIGcubXVsKCBvc2MsIGVudiApLCBnLmluKCAnZ2FpbicgKSApLFxuICAgICAgICBwYW5uZXIgPSBnLnBhbiggb3NjV2l0aEdhaW4sIG9zY1dpdGhHYWluLCBnLmluKCAncGFuJyApICksXG4gICAgICAgIC8vc3luID0gR2liYmVyaXNoLmZhY3RvcnkoIG9zY1dpdGhHYWluLCAnc3ludGgnLCBwcm9wcyAgKVxuICAgICAgICBzeW4gPSBHaWJiZXJpc2guZmFjdG9yeSggW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdLCAnc3ludGgnLCBwcm9wcyAgKVxuICAgIFxuICAgIHN5bi5lbnYgPSBlbnZcblxuICAgIHN5bi5ub3RlID0gZnJlcSA9PiB7XG4gICAgICBzeW4uZnJlcXVlbmN5ID0gZnJlcVxuICAgICAgc3luLmVudi50cmlnZ2VyKClcbiAgICB9XG5cbiAgICBzeW4udHJpZ2dlciA9IHN5bi5lbnYudHJpZ2dlclxuXG4gICAgc3luLmZyZWUgPSAoKSA9PiB7XG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLmdlbi5mcmVlKCBbcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodF0gKVxuICAgIH1cblxuICAgIHN5bi5pc1N0ZXJlbyA9IHRydWVcblxuICAgIHJldHVybiBzeW5cbiAgfVxuICBcbiAgU3ludGguZGVmYXVsdHMgPSB7XG4gICAgd2F2ZWZvcm06J3NhdycsXG4gICAgYXR0YWNrOiA0NDEwMCxcbiAgICBkZWNheTogNDQxMDAsXG4gICAgZ2FpbjogMSxcbiAgICBwdWxzZXdpZHRoOi4yNSxcbiAgICBmcmVxdWVuY3k6MjIwLFxuICAgIHBhbjogLjVcbiAgfVxuXG4gIGxldCBQb2x5U3ludGggPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBTeW50aCwgWydmcmVxdWVuY3knLCdhdHRhY2snLCdkZWNheScsJ3B1bHNld2lkdGgnLCdwYW4nLCdnYWluJ10gKSBcblxuICByZXR1cm4gWyBTeW50aCwgUG9seVN5bnRoIF1cblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgU3ludGgyID0gcHJvcHMgPT4ge1xuICAgIGxldCBvc2MsIFxuICAgICAgICBlbnYgPSBnLmFkKCBnLmluKCdhdHRhY2snKSwgZy5pbignZGVjYXknKSwgeyBzaGFwZTonbGluZWFyJyB9KSxcbiAgICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgcGhhc2VcblxuICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIFN5bnRoMi5kZWZhdWx0cywgcHJvcHMgKVxuXG4gICAgc3dpdGNoKCBwcm9wcy53YXZlZm9ybSApIHtcbiAgICAgIGNhc2UgJ3Nhdyc6XG4gICAgICAgIG9zYyA9IGcucGhhc29yKCBmcmVxdWVuY3kgKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICAgIHBoYXNlID0gZy5waGFzb3IoIGZyZXF1ZW5jeSwgMCwgeyBtaW46MCB9IClcbiAgICAgICAgb3NjID0gbHQoIHBoYXNlLCAuNSApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2luZSc6XG4gICAgICAgIG9zYyA9IGN5Y2xlKCBmcmVxdWVuY3kgKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3B3bSc6XG4gICAgICAgIHBoYXNlID0gZy5waGFzb3IoIGZyZXF1ZW5jeSwgMCwgeyBtaW46MCB9IClcbiAgICAgICAgb3NjID0gbHQoIHBoYXNlLCBnLmluKCAncHVsc2V3aWR0aCcgKSApXG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGxldCBvc2NXaXRoR2FpbiA9IGcubXVsKCBnLm11bCggb3NjLCBlbnYgKSwgZy5pbiggJ2dhaW4nICkgKSxcbiAgICAgICAgaXNMb3dQYXNzID0gZy5wYXJhbSggJ2xvd1Bhc3MnLCAxICksXG4gICAgICAgIGZpbHRlcmVkT3NjID0gZy5maWx0ZXIyNCggb3NjV2l0aEdhaW4sIGcuaW4oJ3Jlc29uYW5jZScpLCBnLm11bCggZy5pbignY3V0b2ZmJyksIGVudiApLCBpc0xvd1Bhc3MgKSxcbiAgICAgICAgcGFubmVyID0gZy5wYW4oIGZpbHRlcmVkT3NjLCBmaWx0ZXJlZE9zYywgZy5pbiggJ3BhbicgKSApLFxuICAgICAgICBzeW4gPSBHaWJiZXJpc2guZmFjdG9yeSggW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdLCAnc3ludGgnLCBwcm9wcyAgKVxuICAgIFxuICAgIHN5bi5lbnYgPSBlbnZcblxuICAgIHN5bi5ub3RlID0gZnJlcSA9PiB7XG4gICAgICBzeW4uZnJlcXVlbmN5ID0gZnJlcVxuICAgICAgc3luLmVudi50cmlnZ2VyKClcbiAgICB9XG5cbiAgICBzeW4udHJpZ2dlciA9IHN5bi5lbnYudHJpZ2dlclxuXG4gICAgc3luLmZyZWUgPSAoKSA9PiB7XG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLmdlbi5mcmVlKCBbcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodF0gKVxuICAgIH1cblxuICAgIHN5bi5pc1N0ZXJlbyA9IHRydWVcbiAgICBcbiAgICByZXR1cm4gc3luXG4gIH1cbiAgXG4gIFN5bnRoMi5kZWZhdWx0cyA9IHtcbiAgICB3YXZlZm9ybTonc2F3JyxcbiAgICBhdHRhY2s6IDQ0MTAwLFxuICAgIGRlY2F5OiA0NDEwMCxcbiAgICBnYWluOiAxLFxuICAgIHB1bHNld2lkdGg6LjI1LFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBjdXRvZmY6IC4zNSxcbiAgICByZXNvbmFuY2U6IDMuNVxuICB9XG5cbiAgbGV0IFBvbHlTeW50aDIgPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBTeW50aDIsIFsnZnJlcXVlbmN5JywnYXR0YWNrJywnZGVjYXknLCdwdWxzZXdpZHRoJywnY3V0b2ZmJywncmVzb25hbmNlJywncGFuJywnZ2FpbiddICkgXG5cbiAgcmV0dXJuIFsgU3ludGgyLCBQb2x5U3ludGgyIF1cblxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCB1aWQgPSAwXG5cbiAgbGV0IGZhY3RvcnkgPSBmdW5jdGlvbiggZ3JhcGgsIG5hbWUsIHZhbHVlcyApIHtcbiAgICBsZXQgdWdlbiA9IEdpYmJlcmlzaC5nZW5pc2guZ2VuLmNyZWF0ZUNhbGxiYWNrKCBncmFwaCwgR2liYmVyaXNoLm1lbW9yeSApXG5cbiAgICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgICB0eXBlOiAndWdlbicsXG4gICAgICBpZDogZmFjdG9yeS5nZXRVSUQoKSwgXG4gICAgICB1Z2VuTmFtZTogbmFtZSArICdfJyxcbiAgICAgIGdyYXBoOiBncmFwaCxcbiAgICAgIGlucHV0TmFtZXM6IEdpYmJlcmlzaC5nZW5pc2guZ2VuLnBhcmFtZXRlcnMuc2xpY2UoMCksXG4gICAgICBkaXJ0eTogdHJ1ZVxuICAgIH0pXG5cbiAgICB1Z2VuLnVnZW5OYW1lICs9IHVnZW4uaWRcblxuICAgIGZvciggbGV0IHBhcmFtIG9mIHVnZW4uaW5wdXROYW1lcyApIHtcbiAgICAgIGxldCB2YWx1ZSA9IHZhbHVlc1sgcGFyYW0gXVxuXG4gICAgICAvLyBUT0RPOiBkbyB3ZSBuZWVkIHRvIGNoZWNrIGZvciBhIHNldHRlcj9cbiAgICAgIGxldCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciggdWdlbiwgcGFyYW0gKSxcbiAgICAgICAgICBzZXR0ZXJcblxuICAgICAgaWYoIGRlc2MgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc2V0dGVyID0gZGVzYy5zZXRcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCBwYXJhbSwge1xuICAgICAgICBnZXQoKSB7IHJldHVybiB2YWx1ZSB9LFxuICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgaWYoIHZhbHVlICE9PSB2ICkge1xuICAgICAgICAgICAgR2liYmVyaXNoLmRpcnR5KCB1Z2VuIClcbiAgICAgICAgICAgIGlmKCBzZXR0ZXIgIT09IHVuZGVmaW5lZCApIHNldHRlciggdiApXG4gICAgICAgICAgICB2YWx1ZSA9IHZcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIFxuICAgIHVnZW4uY29ubmVjdCA9ICggdGFyZ2V0LGxldmVsPTEgKSA9PiB7XG4gICAgICBsZXQgaW5wdXQgPSBsZXZlbCA9PT0gMSA/IHVnZW4gOiBHaWJiZXJpc2guTXVsKCB1Z2VuLCBsZXZlbCApXG5cbiAgICAgIGlmKCB0YXJnZXQuaW5wdXRzIClcbiAgICAgICAgdGFyZ2V0LmlucHV0cy5wdXNoKCB1Z2VuIClcbiAgICAgIGVsc2VcbiAgICAgICAgdGFyZ2V0LmlucHV0ID0gdWdlblxuXG4gICAgICBHaWJiZXJpc2guZGlydHkoIHRhcmdldCApXG4gICAgICBcbiAgICAgIHJldHVybiB1Z2VuXG4gICAgfVxuXG4gICAgdWdlbi5jaGFpbiA9ICh0YXJnZXQsbGV2ZWw9MSkgPT4ge1xuICAgICAgdWdlbi5jb25uZWN0KCB0YXJnZXQsbGV2ZWwgKVxuICAgICAgcmV0dXJuIHRhcmdldFxuICAgIH1cblxuICAgIHJldHVybiB1Z2VuXG4gIH1cblxuICBmYWN0b3J5LmdldFVJRCA9ICgpID0+IHVpZCsrXG5cbiAgcmV0dXJuIGZhY3Rvcnlcbn1cbiIsIi8qIGJpZy5qcyB2My4xLjMgaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnLmpzL0xJQ0VOQ0UgKi9cclxuOyhmdW5jdGlvbiAoZ2xvYmFsKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4vKlxyXG4gIGJpZy5qcyB2My4xLjNcclxuICBBIHNtYWxsLCBmYXN0LCBlYXN5LXRvLXVzZSBsaWJyYXJ5IGZvciBhcmJpdHJhcnktcHJlY2lzaW9uIGRlY2ltYWwgYXJpdGhtZXRpYy5cclxuICBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWcuanMvXHJcbiAgQ29weXJpZ2h0IChjKSAyMDE0IE1pY2hhZWwgTWNsYXVnaGxpbiA8TThjaDg4bEBnbWFpbC5jb20+XHJcbiAgTUlUIEV4cGF0IExpY2VuY2VcclxuKi9cclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBFRElUQUJMRSBERUZBVUxUUyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgLy8gVGhlIGRlZmF1bHQgdmFsdWVzIGJlbG93IG11c3QgYmUgaW50ZWdlcnMgd2l0aGluIHRoZSBzdGF0ZWQgcmFuZ2VzLlxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgbWF4aW11bSBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgb2YgdGhlIHJlc3VsdHMgb2Ygb3BlcmF0aW9uc1xyXG4gICAgICogaW52b2x2aW5nIGRpdmlzaW9uOiBkaXYgYW5kIHNxcnQsIGFuZCBwb3cgd2l0aCBuZWdhdGl2ZSBleHBvbmVudHMuXHJcbiAgICAgKi9cclxuICAgIHZhciBEUCA9IDIwLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gTUFYX0RQXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIHJvdW5kaW5nIG1vZGUgdXNlZCB3aGVuIHJvdW5kaW5nIHRvIHRoZSBhYm92ZSBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIDAgVG93YXJkcyB6ZXJvIChpLmUuIHRydW5jYXRlLCBubyByb3VuZGluZykuICAgICAgIChST1VORF9ET1dOKVxyXG4gICAgICAgICAqIDEgVG8gbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCByb3VuZCB1cC4gIChST1VORF9IQUxGX1VQKVxyXG4gICAgICAgICAqIDIgVG8gbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0byBldmVuLiAgIChST1VORF9IQUxGX0VWRU4pXHJcbiAgICAgICAgICogMyBBd2F5IGZyb20gemVyby4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKFJPVU5EX1VQKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFJNID0gMSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCwgMSwgMiBvciAzXHJcblxyXG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIHZhbHVlIG9mIERQIGFuZCBCaWcuRFAuXHJcbiAgICAgICAgTUFYX0RQID0gMUU2LCAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDEwMDAwMDBcclxuXHJcbiAgICAgICAgLy8gVGhlIG1heGltdW0gbWFnbml0dWRlIG9mIHRoZSBleHBvbmVudCBhcmd1bWVudCB0byB0aGUgcG93IG1ldGhvZC5cclxuICAgICAgICBNQVhfUE9XRVIgPSAxRTYsICAgICAgICAgICAgICAgICAgIC8vIDEgdG8gMTAwMDAwMFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYmVuZWF0aCB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICogSmF2YVNjcmlwdCdzIE51bWJlciB0eXBlOiAtN1xyXG4gICAgICAgICAqIC0xMDAwMDAwIGlzIHRoZSBtaW5pbXVtIHJlY29tbWVuZGVkIGV4cG9uZW50IHZhbHVlIG9mIGEgQmlnLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEVfTkVHID0gLTcsICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gLTEwMDAwMDBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGFib3ZlIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKiBKYXZhU2NyaXB0J3MgTnVtYmVyIHR5cGU6IDIxXHJcbiAgICAgICAgICogMTAwMDAwMCBpcyB0aGUgbWF4aW11bSByZWNvbW1lbmRlZCBleHBvbmVudCB2YWx1ZSBvZiBhIEJpZy5cclxuICAgICAgICAgKiAoVGhpcyBsaW1pdCBpcyBub3QgZW5mb3JjZWQgb3IgY2hlY2tlZC4pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgRV9QT1MgPSAyMSwgICAgICAgICAgICAgICAgICAgLy8gMCB0byAxMDAwMDAwXHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAgICAgICAvLyBUaGUgc2hhcmVkIHByb3RvdHlwZSBvYmplY3QuXHJcbiAgICAgICAgUCA9IHt9LFxyXG4gICAgICAgIGlzVmFsaWQgPSAvXi0/KFxcZCsoXFwuXFxkKik/fFxcLlxcZCspKGVbKy1dP1xcZCspPyQvaSxcclxuICAgICAgICBCaWc7XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIEJpZyBjb25zdHJ1Y3Rvci5cclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGJpZ0ZhY3RvcnkoKSB7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIEJpZyBjb25zdHJ1Y3RvciBhbmQgZXhwb3J0ZWQgZnVuY3Rpb24uXHJcbiAgICAgICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgYSBCaWcgbnVtYmVyIG9iamVjdC5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIG4ge251bWJlcnxzdHJpbmd8QmlnfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gQmlnKG4pIHtcclxuICAgICAgICAgICAgdmFyIHggPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgLy8gRW5hYmxlIGNvbnN0cnVjdG9yIHVzYWdlIHdpdGhvdXQgbmV3LlxyXG4gICAgICAgICAgICBpZiAoISh4IGluc3RhbmNlb2YgQmlnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG4gPT09IHZvaWQgMCA/IGJpZ0ZhY3RvcnkoKSA6IG5ldyBCaWcobik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIER1cGxpY2F0ZS5cclxuICAgICAgICAgICAgaWYgKG4gaW5zdGFuY2VvZiBCaWcpIHtcclxuICAgICAgICAgICAgICAgIHgucyA9IG4ucztcclxuICAgICAgICAgICAgICAgIHguZSA9IG4uZTtcclxuICAgICAgICAgICAgICAgIHguYyA9IG4uYy5zbGljZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGFyc2UoeCwgbik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFJldGFpbiBhIHJlZmVyZW5jZSB0byB0aGlzIEJpZyBjb25zdHJ1Y3RvciwgYW5kIHNoYWRvd1xyXG4gICAgICAgICAgICAgKiBCaWcucHJvdG90eXBlLmNvbnN0cnVjdG9yIHdoaWNoIHBvaW50cyB0byBPYmplY3QuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB4LmNvbnN0cnVjdG9yID0gQmlnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmlnLnByb3RvdHlwZSA9IFA7XHJcbiAgICAgICAgQmlnLkRQID0gRFA7XHJcbiAgICAgICAgQmlnLlJNID0gUk07XHJcbiAgICAgICAgQmlnLkVfTkVHID0gRV9ORUc7XHJcbiAgICAgICAgQmlnLkVfUE9TID0gRV9QT1M7XHJcblxyXG4gICAgICAgIHJldHVybiBCaWc7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIFByaXZhdGUgZnVuY3Rpb25zXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiBCaWcgeCBpbiBub3JtYWwgb3IgZXhwb25lbnRpYWxcclxuICAgICAqIG5vdGF0aW9uIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIG9yIHNpZ25pZmljYW50IGRpZ2l0cy5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IFRoZSBCaWcgdG8gZm9ybWF0LlxyXG4gICAgICogZHAge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogdG9FIHtudW1iZXJ9IDEgKHRvRXhwb25lbnRpYWwpLCAyICh0b1ByZWNpc2lvbikgb3IgdW5kZWZpbmVkICh0b0ZpeGVkKS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZm9ybWF0KHgsIGRwLCB0b0UpIHtcclxuICAgICAgICB2YXIgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBpbmRleCAobm9ybWFsIG5vdGF0aW9uKSBvZiB0aGUgZGlnaXQgdGhhdCBtYXkgYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgaSA9IGRwIC0gKHggPSBuZXcgQmlnKHgpKS5lLFxyXG4gICAgICAgICAgICBjID0geC5jO1xyXG5cclxuICAgICAgICAvLyBSb3VuZD9cclxuICAgICAgICBpZiAoYy5sZW5ndGggPiArK2RwKSB7XHJcbiAgICAgICAgICAgIHJuZCh4LCBpLCBCaWcuUk0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFjWzBdKSB7XHJcbiAgICAgICAgICAgICsraTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRvRSkge1xyXG4gICAgICAgICAgICBpID0gZHA7XHJcblxyXG4gICAgICAgIC8vIHRvRml4ZWRcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjID0geC5jO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVjYWxjdWxhdGUgaSBhcyB4LmUgbWF5IGhhdmUgY2hhbmdlZCBpZiB2YWx1ZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBpID0geC5lICsgaSArIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBcHBlbmQgemVyb3M/XHJcbiAgICAgICAgZm9yICg7IGMubGVuZ3RoIDwgaTsgYy5wdXNoKDApKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGkgPSB4LmU7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogdG9QcmVjaXNpb24gcmV0dXJucyBleHBvbmVudGlhbCBub3RhdGlvbiBpZiB0aGUgbnVtYmVyIG9mXHJcbiAgICAgICAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHNwZWNpZmllZCBpcyBsZXNzIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHNcclxuICAgICAgICAgKiBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlIHZhbHVlIGluIG5vcm1hbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJldHVybiB0b0UgPT09IDEgfHwgdG9FICYmIChkcCA8PSBpIHx8IGkgPD0gQmlnLkVfTkVHKSA/XHJcblxyXG4gICAgICAgICAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgICAoeC5zIDwgMCAmJiBjWzBdID8gJy0nIDogJycpICtcclxuICAgICAgICAgICAgKGMubGVuZ3RoID4gMSA/IGNbMF0gKyAnLicgKyBjLmpvaW4oJycpLnNsaWNlKDEpIDogY1swXSkgK1xyXG4gICAgICAgICAgICAgIChpIDwgMCA/ICdlJyA6ICdlKycpICsgaVxyXG5cclxuICAgICAgICAgIC8vIE5vcm1hbCBub3RhdGlvbi5cclxuICAgICAgICAgIDogeC50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUGFyc2UgdGhlIG51bWJlciBvciBzdHJpbmcgdmFsdWUgcGFzc2VkIHRvIGEgQmlnIGNvbnN0cnVjdG9yLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gQSBCaWcgbnVtYmVyIGluc3RhbmNlLlxyXG4gICAgICogbiB7bnVtYmVyfHN0cmluZ30gQSBudW1lcmljIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBwYXJzZSh4LCBuKSB7XHJcbiAgICAgICAgdmFyIGUsIGksIG5MO1xyXG5cclxuICAgICAgICAvLyBNaW51cyB6ZXJvP1xyXG4gICAgICAgIGlmIChuID09PSAwICYmIDEgLyBuIDwgMCkge1xyXG4gICAgICAgICAgICBuID0gJy0wJztcclxuXHJcbiAgICAgICAgLy8gRW5zdXJlIG4gaXMgc3RyaW5nIGFuZCBjaGVjayB2YWxpZGl0eS5cclxuICAgICAgICB9IGVsc2UgaWYgKCFpc1ZhbGlkLnRlc3QobiArPSAnJykpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBzaWduLlxyXG4gICAgICAgIHgucyA9IG4uY2hhckF0KDApID09ICctJyA/IChuID0gbi5zbGljZSgxKSwgLTEpIDogMTtcclxuXHJcbiAgICAgICAgLy8gRGVjaW1hbCBwb2ludD9cclxuICAgICAgICBpZiAoKGUgPSBuLmluZGV4T2YoJy4nKSkgPiAtMSkge1xyXG4gICAgICAgICAgICBuID0gbi5yZXBsYWNlKCcuJywgJycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnRpYWwgZm9ybT9cclxuICAgICAgICBpZiAoKGkgPSBuLnNlYXJjaCgvZS9pKSkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgZXhwb25lbnQuXHJcbiAgICAgICAgICAgIGlmIChlIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZSA9IGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZSArPSArbi5zbGljZShpICsgMSk7XHJcbiAgICAgICAgICAgIG4gPSBuLnN1YnN0cmluZygwLCBpKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChlIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gSW50ZWdlci5cclxuICAgICAgICAgICAgZSA9IG4ubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChpID0gMDsgbi5jaGFyQXQoaSkgPT0gJzAnOyBpKyspIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpID09IChuTCA9IG4ubGVuZ3RoKSkge1xyXG5cclxuICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgeC5jID0gWyB4LmUgPSAwIF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICg7IG4uY2hhckF0KC0tbkwpID09ICcwJzspIHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgeC5lID0gZSAtIGkgLSAxO1xyXG4gICAgICAgICAgICB4LmMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIC8vIENvbnZlcnQgc3RyaW5nIHRvIGFycmF5IG9mIGRpZ2l0cyB3aXRob3V0IGxlYWRpbmcvdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoZSA9IDA7IGkgPD0gbkw7IHguY1tlKytdID0gK24uY2hhckF0KGkrKykpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSb3VuZCBCaWcgeCB0byBhIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS5cclxuICAgICAqIENhbGxlZCBieSBkaXYsIHNxcnQgYW5kIHJvdW5kLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gVGhlIEJpZyB0byByb3VuZC5cclxuICAgICAqIGRwIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIHJtIHtudW1iZXJ9IDAsIDEsIDIgb3IgMyAoRE9XTiwgSEFMRl9VUCwgSEFMRl9FVkVOLCBVUClcclxuICAgICAqIFttb3JlXSB7Ym9vbGVhbn0gV2hldGhlciB0aGUgcmVzdWx0IG9mIGRpdmlzaW9uIHdhcyB0cnVuY2F0ZWQuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJuZCh4LCBkcCwgcm0sIG1vcmUpIHtcclxuICAgICAgICB2YXIgdSxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIGkgPSB4LmUgKyBkcCArIDE7XHJcblxyXG4gICAgICAgIGlmIChybSA9PT0gMSkge1xyXG5cclxuICAgICAgICAgICAgLy8geGNbaV0gaXMgdGhlIGRpZ2l0IGFmdGVyIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBtb3JlID0geGNbaV0gPj0gNTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJtID09PSAyKSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSB4Y1tpXSA+IDUgfHwgeGNbaV0gPT0gNSAmJlxyXG4gICAgICAgICAgICAgIChtb3JlIHx8IGkgPCAwIHx8IHhjW2kgKyAxXSAhPT0gdSB8fCB4Y1tpIC0gMV0gJiAxKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJtID09PSAzKSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSBtb3JlIHx8IHhjW2ldICE9PSB1IHx8IGkgPCAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChybSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIoJyFCaWcuUk0hJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpIDwgMSB8fCAheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChtb3JlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gMSwgMC4xLCAwLjAxLCAwLjAwMSwgMC4wMDAxIGV0Yy5cclxuICAgICAgICAgICAgICAgIHguZSA9IC1kcDtcclxuICAgICAgICAgICAgICAgIHguYyA9IFsxXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICAgICAgeC5jID0gW3guZSA9IDBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBhbnkgZGlnaXRzIGFmdGVyIHRoZSByZXF1aXJlZCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgICAgeGMubGVuZ3RoID0gaS0tO1xyXG5cclxuICAgICAgICAgICAgLy8gUm91bmQgdXA/XHJcbiAgICAgICAgICAgIGlmIChtb3JlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUm91bmRpbmcgdXAgbWF5IG1lYW4gdGhlIHByZXZpb3VzIGRpZ2l0IGhhcyB0byBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICAgICAgZm9yICg7ICsreGNbaV0gPiA5Oykge1xyXG4gICAgICAgICAgICAgICAgICAgIHhjW2ldID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyt4LmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhjLnVuc2hpZnQoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoaSA9IHhjLmxlbmd0aDsgIXhjWy0taV07IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhyb3cgYSBCaWdFcnJvci5cclxuICAgICAqXHJcbiAgICAgKiBtZXNzYWdlIHtzdHJpbmd9IFRoZSBlcnJvciBtZXNzYWdlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB0aHJvd0VycihtZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcclxuICAgICAgICBlcnIubmFtZSA9ICdCaWdFcnJvcic7XHJcblxyXG4gICAgICAgIHRocm93IGVycjtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUHJvdG90eXBlL2luc3RhbmNlIG1ldGhvZHNcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoaXMgQmlnLlxyXG4gICAgICovXHJcbiAgICBQLmFicyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgeCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpO1xyXG4gICAgICAgIHgucyA9IDE7XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVyblxyXG4gICAgICogMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIC0xIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LCBvclxyXG4gICAgICogMCBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgdmFsdWUuXHJcbiAgICAqL1xyXG4gICAgUC5jbXAgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB4TmVnLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHljID0gKHkgPSBuZXcgeC5jb25zdHJ1Y3Rvcih5KSkuYyxcclxuICAgICAgICAgICAgaSA9IHgucyxcclxuICAgICAgICAgICAgaiA9IHkucyxcclxuICAgICAgICAgICAgayA9IHguZSxcclxuICAgICAgICAgICAgbCA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICF4Y1swXSA/ICF5Y1swXSA/IDAgOiAtaiA6IGk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGkgIT0gaikge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgeE5lZyA9IGkgPCAwO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGV4cG9uZW50cy5cclxuICAgICAgICBpZiAoayAhPSBsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBrID4gbCBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpID0gLTE7XHJcbiAgICAgICAgaiA9IChrID0geGMubGVuZ3RoKSA8IChsID0geWMubGVuZ3RoKSA/IGsgOiBsO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgIGZvciAoOyArK2kgPCBqOykge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhjW2ldICE9IHljW2ldKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geGNbaV0gPiB5Y1tpXSBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgbGVuZ3Rocy5cclxuICAgICAgICByZXR1cm4gayA9PSBsID8gMCA6IGsgPiBsIF4geE5lZyA/IDEgOiAtMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBkaXZpZGVkIGJ5IHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHksIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsXHJcbiAgICAgKiBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKi9cclxuICAgIFAuZGl2ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIC8vIGRpdmlkZW5kXHJcbiAgICAgICAgICAgIGR2ZCA9IHguYyxcclxuICAgICAgICAgICAgLy9kaXZpc29yXHJcbiAgICAgICAgICAgIGR2cyA9ICh5ID0gbmV3IEJpZyh5KSkuYyxcclxuICAgICAgICAgICAgcyA9IHgucyA9PSB5LnMgPyAxIDogLTEsXHJcbiAgICAgICAgICAgIGRwID0gQmlnLkRQO1xyXG5cclxuICAgICAgICBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchQmlnLkRQIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIDA/XHJcbiAgICAgICAgaWYgKCFkdmRbMF0gfHwgIWR2c1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgYm90aCBhcmUgMCwgdGhyb3cgTmFOXHJcbiAgICAgICAgICAgIGlmIChkdmRbMF0gPT0gZHZzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBkdnMgaXMgMCwgdGhyb3cgKy1JbmZpbml0eS5cclxuICAgICAgICAgICAgaWYgKCFkdnNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKHMgLyAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gZHZkIGlzIDAsIHJldHVybiArLTAuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHMgKiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBkdnNMLCBkdnNULCBuZXh0LCBjbXAsIHJlbUksIHUsXHJcbiAgICAgICAgICAgIGR2c1ogPSBkdnMuc2xpY2UoKSxcclxuICAgICAgICAgICAgZHZkSSA9IGR2c0wgPSBkdnMubGVuZ3RoLFxyXG4gICAgICAgICAgICBkdmRMID0gZHZkLmxlbmd0aCxcclxuICAgICAgICAgICAgLy8gcmVtYWluZGVyXHJcbiAgICAgICAgICAgIHJlbSA9IGR2ZC5zbGljZSgwLCBkdnNMKSxcclxuICAgICAgICAgICAgcmVtTCA9IHJlbS5sZW5ndGgsXHJcbiAgICAgICAgICAgIC8vIHF1b3RpZW50XHJcbiAgICAgICAgICAgIHEgPSB5LFxyXG4gICAgICAgICAgICBxYyA9IHEuYyA9IFtdLFxyXG4gICAgICAgICAgICBxaSA9IDAsXHJcbiAgICAgICAgICAgIGRpZ2l0cyA9IGRwICsgKHEuZSA9IHguZSAtIHkuZSkgKyAxO1xyXG5cclxuICAgICAgICBxLnMgPSBzO1xyXG4gICAgICAgIHMgPSBkaWdpdHMgPCAwID8gMCA6IGRpZ2l0cztcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIHZlcnNpb24gb2YgZGl2aXNvciB3aXRoIGxlYWRpbmcgemVyby5cclxuICAgICAgICBkdnNaLnVuc2hpZnQoMCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCB6ZXJvcyB0byBtYWtlIHJlbWFpbmRlciBhcyBsb25nIGFzIGRpdmlzb3IuXHJcbiAgICAgICAgZm9yICg7IHJlbUwrKyA8IGR2c0w7IHJlbS5wdXNoKDApKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkbyB7XHJcblxyXG4gICAgICAgICAgICAvLyAnbmV4dCcgaXMgaG93IG1hbnkgdGltZXMgdGhlIGRpdmlzb3IgZ29lcyBpbnRvIGN1cnJlbnQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBmb3IgKG5leHQgPSAwOyBuZXh0IDwgMTA7IG5leHQrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgZGl2aXNvciBhbmQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGR2c0wgIT0gKHJlbUwgPSByZW0ubGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNtcCA9IGR2c0wgPiByZW1MID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChyZW1JID0gLTEsIGNtcCA9IDA7ICsrcmVtSSA8IGR2c0w7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHZzW3JlbUldICE9IHJlbVtyZW1JXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY21wID0gZHZzW3JlbUldID4gcmVtW3JlbUldID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgZGl2aXNvciA8IHJlbWFpbmRlciwgc3VidHJhY3QgZGl2aXNvciBmcm9tIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIGlmIChjbXAgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbWFpbmRlciBjYW4ndCBiZSBtb3JlIHRoYW4gMSBkaWdpdCBsb25nZXIgdGhhbiBkaXZpc29yLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEVxdWFsaXNlIGxlbmd0aHMgdXNpbmcgZGl2aXNvciB3aXRoIGV4dHJhIGxlYWRpbmcgemVybz9cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGR2c1QgPSByZW1MID09IGR2c0wgPyBkdnMgOiBkdnNaOyByZW1MOykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbVstLXJlbUxdIDwgZHZzVFtyZW1MXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtSSA9IHJlbUw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICg7IHJlbUkgJiYgIXJlbVstLXJlbUldOyByZW1bcmVtSV0gPSA5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAtLXJlbVtyZW1JXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbVtyZW1MXSArPSAxMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1bcmVtTF0gLT0gZHZzVFtyZW1MXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICg7ICFyZW1bMF07IHJlbS5zaGlmdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRoZSAnbmV4dCcgZGlnaXQgdG8gdGhlIHJlc3VsdCBhcnJheS5cclxuICAgICAgICAgICAgcWNbcWkrK10gPSBjbXAgPyBuZXh0IDogKytuZXh0O1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGlmIChyZW1bMF0gJiYgY21wKSB7XHJcbiAgICAgICAgICAgICAgICByZW1bcmVtTF0gPSBkdmRbZHZkSV0gfHwgMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlbSA9IFsgZHZkW2R2ZEldIF07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSB3aGlsZSAoKGR2ZEkrKyA8IGR2ZEwgfHwgcmVtWzBdICE9PSB1KSAmJiBzLS0pO1xyXG5cclxuICAgICAgICAvLyBMZWFkaW5nIHplcm8/IERvIG5vdCByZW1vdmUgaWYgcmVzdWx0IGlzIHNpbXBseSB6ZXJvIChxaSA9PSAxKS5cclxuICAgICAgICBpZiAoIXFjWzBdICYmIHFpICE9IDEpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZXJlIGNhbid0IGJlIG1vcmUgdGhhbiBvbmUgemVyby5cclxuICAgICAgICAgICAgcWMuc2hpZnQoKTtcclxuICAgICAgICAgICAgcS5lLS07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSb3VuZD9cclxuICAgICAgICBpZiAocWkgPiBkaWdpdHMpIHtcclxuICAgICAgICAgICAgcm5kKHEsIGRwLCBCaWcuUk0sIHJlbVswXSAhPT0gdSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZXF1YWwgdG8gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZXEgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5jbXAoeSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5ndCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpID4gMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmd0ZSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpID4gLTE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5sdCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmx0ZSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA8IDE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgbWludXMgdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5zdWIgPSBQLm1pbnVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgaSwgaiwgdCwgeExUeSxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoYSAhPSBiKSB7XHJcbiAgICAgICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgICAgICByZXR1cm4geC5wbHVzKHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHhjID0geC5jLnNsaWNlKCksXHJcbiAgICAgICAgICAgIHhlID0geC5lLFxyXG4gICAgICAgICAgICB5YyA9IHkuYyxcclxuICAgICAgICAgICAgeWUgPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB5IGlzIG5vbi16ZXJvPyB4IGlzIG5vbi16ZXJvPyBPciBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgICByZXR1cm4geWNbMF0gPyAoeS5zID0gLWIsIHkpIDogbmV3IEJpZyh4Y1swXSA/IHggOiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSB3aGljaCBpcyB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgICBpZiAoYSA9IHhlIC0geWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh4TFR5ID0gYSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHllID0geGU7XHJcbiAgICAgICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGIgPSBhOyBiLS07IHQucHVzaCgwKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBFeHBvbmVudHMgZXF1YWwuIENoZWNrIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgICAgICBqID0gKCh4TFR5ID0geGMubGVuZ3RoIDwgeWMubGVuZ3RoKSA/IHhjIDogeWMpLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGZvciAoYSA9IGIgPSAwOyBiIDwgajsgYisrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHhjW2JdICE9IHljW2JdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeExUeSA9IHhjW2JdIDwgeWNbYl07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHggPCB5PyBQb2ludCB4YyB0byB0aGUgYXJyYXkgb2YgdGhlIGJpZ2dlciBudW1iZXIuXHJcbiAgICAgICAgaWYgKHhMVHkpIHtcclxuICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IHQ7XHJcbiAgICAgICAgICAgIHkucyA9IC15LnM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIEFwcGVuZCB6ZXJvcyB0byB4YyBpZiBzaG9ydGVyLiBObyBuZWVkIHRvIGFkZCB6ZXJvcyB0byB5YyBpZiBzaG9ydGVyXHJcbiAgICAgICAgICogYXMgc3VidHJhY3Rpb24gb25seSBuZWVkcyB0byBzdGFydCBhdCB5Yy5sZW5ndGguXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKCggYiA9IChqID0geWMubGVuZ3RoKSAtIChpID0geGMubGVuZ3RoKSApID4gMCkge1xyXG5cclxuICAgICAgICAgICAgZm9yICg7IGItLTsgeGNbaSsrXSA9IDApIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU3VidHJhY3QgeWMgZnJvbSB4Yy5cclxuICAgICAgICBmb3IgKGIgPSBpOyBqID4gYTspe1xyXG5cclxuICAgICAgICAgICAgaWYgKHhjWy0tal0gPCB5Y1tqXSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IGo7IGkgJiYgIXhjWy0taV07IHhjW2ldID0gOSkge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLS14Y1tpXTtcclxuICAgICAgICAgICAgICAgIHhjW2pdICs9IDEwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHhjW2pdIC09IHljW2pdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoOyB4Y1stLWJdID09PSAwOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGxlYWRpbmcgemVyb3MgYW5kIGFkanVzdCBleHBvbmVudCBhY2NvcmRpbmdseS5cclxuICAgICAgICBmb3IgKDsgeGNbMF0gPT09IDA7KSB7XHJcbiAgICAgICAgICAgIHhjLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIC0teWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXhjWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBuIC0gbiA9ICswXHJcbiAgICAgICAgICAgIHkucyA9IDE7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXN1bHQgbXVzdCBiZSB6ZXJvLlxyXG4gICAgICAgICAgICB4YyA9IFt5ZSA9IDBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeS5jID0geGM7XHJcbiAgICAgICAgeS5lID0geWU7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIG1vZHVsbyB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLm1vZCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHlHVHgsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICBpZiAoIXkuY1swXSkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeC5zID0geS5zID0gMTtcclxuICAgICAgICB5R1R4ID0geS5jbXAoeCkgPT0gMTtcclxuICAgICAgICB4LnMgPSBhO1xyXG4gICAgICAgIHkucyA9IGI7XHJcblxyXG4gICAgICAgIGlmICh5R1R4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYSA9IEJpZy5EUDtcclxuICAgICAgICBiID0gQmlnLlJNO1xyXG4gICAgICAgIEJpZy5EUCA9IEJpZy5STSA9IDA7XHJcbiAgICAgICAgeCA9IHguZGl2KHkpO1xyXG4gICAgICAgIEJpZy5EUCA9IGE7XHJcbiAgICAgICAgQmlnLlJNID0gYjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWludXMoIHgudGltZXMoeSkgKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBwbHVzIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAuYWRkID0gUC5wbHVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgdCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoYSAhPSBiKSB7XHJcbiAgICAgICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgICAgICByZXR1cm4geC5taW51cyh5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB4ZSA9IHguZSxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHllID0geS5lLFxyXG4gICAgICAgICAgICB5YyA9IHkuYztcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHkgaXMgbm9uLXplcm8/IHggaXMgbm9uLXplcm8/IE9yIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgIHJldHVybiB5Y1swXSA/IHkgOiBuZXcgQmlnKHhjWzBdID8geCA6IGEgKiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgeGMgPSB4Yy5zbGljZSgpO1xyXG5cclxuICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgICAvLyBOb3RlOiBGYXN0ZXIgdG8gdXNlIHJldmVyc2UgdGhlbiBkbyB1bnNoaWZ0cy5cclxuICAgICAgICBpZiAoYSA9IHhlIC0geWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChhID4gMCkge1xyXG4gICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIGZvciAoOyBhLS07IHQucHVzaCgwKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUG9pbnQgeGMgdG8gdGhlIGxvbmdlciBhcnJheS5cclxuICAgICAgICBpZiAoeGMubGVuZ3RoIC0geWMubGVuZ3RoIDwgMCkge1xyXG4gICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIHljID0geGM7XHJcbiAgICAgICAgICAgIHhjID0gdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgYSA9IHljLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBPbmx5IHN0YXJ0IGFkZGluZyBhdCB5Yy5sZW5ndGggLSAxIGFzIHRoZSBmdXJ0aGVyIGRpZ2l0cyBvZiB4YyBjYW4gYmVcclxuICAgICAgICAgKiBsZWZ0IGFzIHRoZXkgYXJlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZvciAoYiA9IDA7IGE7KSB7XHJcbiAgICAgICAgICAgIGIgPSAoeGNbLS1hXSA9IHhjW2FdICsgeWNbYV0gKyBiKSAvIDEwIHwgMDtcclxuICAgICAgICAgICAgeGNbYV0gJT0gMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBObyBuZWVkIHRvIGNoZWNrIGZvciB6ZXJvLCBhcyAreCArICt5ICE9IDAgJiYgLXggKyAteSAhPSAwXHJcblxyXG4gICAgICAgIGlmIChiKSB7XHJcbiAgICAgICAgICAgIHhjLnVuc2hpZnQoYik7XHJcbiAgICAgICAgICAgICsreWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoYSA9IHhjLmxlbmd0aDsgeGNbLS1hXSA9PT0gMDsgeGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHkuYyA9IHhjO1xyXG4gICAgICAgIHkuZSA9IHllO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJhaXNlZCB0byB0aGUgcG93ZXIgbi5cclxuICAgICAqIElmIG4gaXMgbmVnYXRpdmUsIHJvdW5kLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbFxyXG4gICAgICogcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIG4ge251bWJlcn0gSW50ZWdlciwgLU1BWF9QT1dFUiB0byBNQVhfUE9XRVIgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnBvdyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBvbmUgPSBuZXcgeC5jb25zdHJ1Y3RvcigxKSxcclxuICAgICAgICAgICAgeSA9IG9uZSxcclxuICAgICAgICAgICAgaXNOZWcgPSBuIDwgMDtcclxuXHJcbiAgICAgICAgaWYgKG4gIT09IH5+biB8fCBuIDwgLU1BWF9QT1dFUiB8fCBuID4gTUFYX1BPV0VSKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchcG93IScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbiA9IGlzTmVnID8gLW4gOiBuO1xyXG5cclxuICAgICAgICBmb3IgKDs7KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobiAmIDEpIHtcclxuICAgICAgICAgICAgICAgIHkgPSB5LnRpbWVzKHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG4gPj49IDE7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW4pIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHggPSB4LnRpbWVzKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGlzTmVnID8gb25lLmRpdih5KSA6IHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcm91bmRlZCB0byBhXHJcbiAgICAgKiBtYXhpbXVtIG9mIGRwIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgcm0uXHJcbiAgICAgKiBJZiBkcCBpcyBub3Qgc3BlY2lmaWVkLCByb3VuZCB0byAwIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICogSWYgcm0gaXMgbm90IHNwZWNpZmllZCwgdXNlIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIFtybV0gMCwgMSwgMiBvciAzIChST1VORF9ET1dOLCBST1VORF9IQUxGX1VQLCBST1VORF9IQUxGX0VWRU4sIFJPVU5EX1VQKVxyXG4gICAgICovXHJcbiAgICBQLnJvdW5kID0gZnVuY3Rpb24gKGRwLCBybSkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgZHAgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchcm91bmQhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJuZCh4ID0gbmV3IEJpZyh4KSwgZHAsIHJtID09IG51bGwgPyBCaWcuUk0gOiBybSk7XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHNxdWFyZSByb290IG9mIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyxcclxuICAgICAqIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsIHBsYWNlcyB1c2luZ1xyXG4gICAgICogcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKi9cclxuICAgIFAuc3FydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZXN0aW1hdGUsIHIsIGFwcHJveCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICBpID0geC5zLFxyXG4gICAgICAgICAgICBlID0geC5lLFxyXG4gICAgICAgICAgICBoYWxmID0gbmV3IEJpZygnMC41Jyk7XHJcblxyXG4gICAgICAgIC8vIFplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIG5lZ2F0aXZlLCB0aHJvdyBOYU4uXHJcbiAgICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFc3RpbWF0ZS5cclxuICAgICAgICBpID0gTWF0aC5zcXJ0KHgudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIC8vIE1hdGguc3FydCB1bmRlcmZsb3cvb3ZlcmZsb3c/XHJcbiAgICAgICAgLy8gUGFzcyB4IHRvIE1hdGguc3FydCBhcyBpbnRlZ2VyLCB0aGVuIGFkanVzdCB0aGUgcmVzdWx0IGV4cG9uZW50LlxyXG4gICAgICAgIGlmIChpID09PSAwIHx8IGkgPT09IDEgLyAwKSB7XHJcbiAgICAgICAgICAgIGVzdGltYXRlID0geGMuam9pbignJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIShlc3RpbWF0ZS5sZW5ndGggKyBlICYgMSkpIHtcclxuICAgICAgICAgICAgICAgIGVzdGltYXRlICs9ICcwJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgciA9IG5ldyBCaWcoIE1hdGguc3FydChlc3RpbWF0ZSkudG9TdHJpbmcoKSApO1xyXG4gICAgICAgICAgICByLmUgPSAoKGUgKyAxKSAvIDIgfCAwKSAtIChlIDwgMCB8fCBlICYgMSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgciA9IG5ldyBCaWcoaS50b1N0cmluZygpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSByLmUgKyAoQmlnLkRQICs9IDQpO1xyXG5cclxuICAgICAgICAvLyBOZXd0b24tUmFwaHNvbiBpdGVyYXRpb24uXHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBhcHByb3ggPSByO1xyXG4gICAgICAgICAgICByID0gaGFsZi50aW1lcyggYXBwcm94LnBsdXMoIHguZGl2KGFwcHJveCkgKSApO1xyXG4gICAgICAgIH0gd2hpbGUgKCBhcHByb3guYy5zbGljZSgwLCBpKS5qb2luKCcnKSAhPT1cclxuICAgICAgICAgICAgICAgICAgICAgICByLmMuc2xpY2UoMCwgaSkuam9pbignJykgKTtcclxuXHJcbiAgICAgICAgcm5kKHIsIEJpZy5EUCAtPSA0LCBCaWcuUk0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyB0aW1lcyB0aGUgdmFsdWUgb2ZcclxuICAgICAqIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLm11bCA9IFAudGltZXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciBjLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHljID0gKHkgPSBuZXcgQmlnKHkpKS5jLFxyXG4gICAgICAgICAgICBhID0geGMubGVuZ3RoLFxyXG4gICAgICAgICAgICBiID0geWMubGVuZ3RoLFxyXG4gICAgICAgICAgICBpID0geC5lLFxyXG4gICAgICAgICAgICBqID0geS5lO1xyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgc2lnbiBvZiByZXN1bHQuXHJcbiAgICAgICAgeS5zID0geC5zID09IHkucyA/IDEgOiAtMTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHNpZ25lZCAwIGlmIGVpdGhlciAwLlxyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHkucyAqIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGlzZSBleHBvbmVudCBvZiByZXN1bHQgYXMgeC5lICsgeS5lLlxyXG4gICAgICAgIHkuZSA9IGkgKyBqO1xyXG5cclxuICAgICAgICAvLyBJZiBhcnJheSB4YyBoYXMgZmV3ZXIgZGlnaXRzIHRoYW4geWMsIHN3YXAgeGMgYW5kIHljLCBhbmQgbGVuZ3Rocy5cclxuICAgICAgICBpZiAoYSA8IGIpIHtcclxuICAgICAgICAgICAgYyA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IGM7XHJcbiAgICAgICAgICAgIGogPSBhO1xyXG4gICAgICAgICAgICBhID0gYjtcclxuICAgICAgICAgICAgYiA9IGo7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXNlIGNvZWZmaWNpZW50IGFycmF5IG9mIHJlc3VsdCB3aXRoIHplcm9zLlxyXG4gICAgICAgIGZvciAoYyA9IG5ldyBBcnJheShqID0gYSArIGIpOyBqLS07IGNbal0gPSAwKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBNdWx0aXBseS5cclxuXHJcbiAgICAgICAgLy8gaSBpcyBpbml0aWFsbHkgeGMubGVuZ3RoLlxyXG4gICAgICAgIGZvciAoaSA9IGI7IGktLTspIHtcclxuICAgICAgICAgICAgYiA9IDA7XHJcblxyXG4gICAgICAgICAgICAvLyBhIGlzIHljLmxlbmd0aC5cclxuICAgICAgICAgICAgZm9yIChqID0gYSArIGk7IGogPiBpOykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEN1cnJlbnQgc3VtIG9mIHByb2R1Y3RzIGF0IHRoaXMgZGlnaXQgcG9zaXRpb24sIHBsdXMgY2FycnkuXHJcbiAgICAgICAgICAgICAgICBiID0gY1tqXSArIHljW2ldICogeGNbaiAtIGkgLSAxXSArIGI7XHJcbiAgICAgICAgICAgICAgICBjW2otLV0gPSBiICUgMTA7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY2FycnlcclxuICAgICAgICAgICAgICAgIGIgPSBiIC8gMTAgfCAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNbal0gPSAoY1tqXSArIGIpICUgMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbmNyZW1lbnQgcmVzdWx0IGV4cG9uZW50IGlmIHRoZXJlIGlzIGEgZmluYWwgY2FycnkuXHJcbiAgICAgICAgaWYgKGIpIHtcclxuICAgICAgICAgICAgKyt5LmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgYW55IGxlYWRpbmcgemVyby5cclxuICAgICAgICBpZiAoIWNbMF0pIHtcclxuICAgICAgICAgICAgYy5zaGlmdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoaSA9IGMubGVuZ3RoOyAhY1stLWldOyBjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHkuYyA9IGM7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnLlxyXG4gICAgICogUmV0dXJuIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoaXMgQmlnIGhhcyBhIHBvc2l0aXZlIGV4cG9uZW50IGVxdWFsIHRvXHJcbiAgICAgKiBvciBncmVhdGVyIHRoYW4gQmlnLkVfUE9TLCBvciBhIG5lZ2F0aXZlIGV4cG9uZW50IGVxdWFsIHRvIG9yIGxlc3MgdGhhblxyXG4gICAgICogQmlnLkVfTkVHLlxyXG4gICAgICovXHJcbiAgICBQLnRvU3RyaW5nID0gUC52YWx1ZU9mID0gUC50b0pTT04gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBlID0geC5lLFxyXG4gICAgICAgICAgICBzdHIgPSB4LmMuam9pbignJyksXHJcbiAgICAgICAgICAgIHN0ckwgPSBzdHIubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBFeHBvbmVudGlhbCBub3RhdGlvbj9cclxuICAgICAgICBpZiAoZSA8PSBCaWcuRV9ORUcgfHwgZSA+PSBCaWcuRV9QT1MpIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArIChzdHJMID4gMSA/ICcuJyArIHN0ci5zbGljZSgxKSA6ICcnKSArXHJcbiAgICAgICAgICAgICAgKGUgPCAwID8gJ2UnIDogJ2UrJykgKyBlO1xyXG5cclxuICAgICAgICAvLyBOZWdhdGl2ZSBleHBvbmVudD9cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmVwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKDsgKytlOyBzdHIgPSAnMCcgKyBzdHIpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdHIgPSAnMC4nICsgc3RyO1xyXG5cclxuICAgICAgICAvLyBQb3NpdGl2ZSBleHBvbmVudD9cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoKytlID4gc3RyTCkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFwcGVuZCB6ZXJvcy5cclxuICAgICAgICAgICAgICAgIGZvciAoZSAtPSBzdHJMOyBlLS0gOyBzdHIgKz0gJzAnKSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZSA8IHN0ckwpIHtcclxuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5zbGljZSgwLCBlKSArICcuJyArIHN0ci5zbGljZShlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFeHBvbmVudCB6ZXJvLlxyXG4gICAgICAgIH0gZWxzZSBpZiAoc3RyTCA+IDEpIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArICcuJyArIHN0ci5zbGljZSgxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEF2b2lkICctMCdcclxuICAgICAgICByZXR1cm4geC5zIDwgMCAmJiB4LmNbMF0gPyAnLScgKyBzdHIgOiBzdHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICogSWYgdG9FeHBvbmVudGlhbCwgdG9GaXhlZCwgdG9QcmVjaXNpb24gYW5kIGZvcm1hdCBhcmUgbm90IHJlcXVpcmVkIHRoZXlcclxuICAgICAqIGNhbiBzYWZlbHkgYmUgY29tbWVudGVkLW91dCBvciBkZWxldGVkLiBObyByZWR1bmRhbnQgY29kZSB3aWxsIGJlIGxlZnQuXHJcbiAgICAgKiBmb3JtYXQgaXMgdXNlZCBvbmx5IGJ5IHRvRXhwb25lbnRpYWwsIHRvRml4ZWQgYW5kIHRvUHJlY2lzaW9uLlxyXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICovXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpbiBleHBvbmVudGlhbFxyXG4gICAgICogbm90YXRpb24gdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgYW5kIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdXNpbmdcclxuICAgICAqIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b0V4cG9uZW50aWFsID0gZnVuY3Rpb24gKGRwKSB7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGRwID0gdGhpcy5jLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b0V4cCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmb3JtYXQodGhpcywgZHAsIDEpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGluIG5vcm1hbCBub3RhdGlvblxyXG4gICAgICogdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgYW5kIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdXNpbmcgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvRml4ZWQgPSBmdW5jdGlvbiAoZHApIHtcclxuICAgICAgICB2YXIgc3RyLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgbmVnID0gQmlnLkVfTkVHLFxyXG4gICAgICAgICAgICBwb3MgPSBCaWcuRV9QT1M7XHJcblxyXG4gICAgICAgIC8vIFByZXZlbnQgdGhlIHBvc3NpYmlsaXR5IG9mIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgIEJpZy5FX05FRyA9IC0oQmlnLkVfUE9TID0gMSAvIDApO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBzdHIgPSB4LnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCA9PT0gfn5kcCAmJiBkcCA+PSAwICYmIGRwIDw9IE1BWF9EUCkge1xyXG4gICAgICAgICAgICBzdHIgPSBmb3JtYXQoeCwgeC5lICsgZHApO1xyXG5cclxuICAgICAgICAgICAgLy8gKC0wKS50b0ZpeGVkKCkgaXMgJzAnLCBidXQgKC0wLjEpLnRvRml4ZWQoKSBpcyAnLTAnLlxyXG4gICAgICAgICAgICAvLyAoLTApLnRvRml4ZWQoMSkgaXMgJzAuMCcsIGJ1dCAoLTAuMDEpLnRvRml4ZWQoMSkgaXMgJy0wLjAnLlxyXG4gICAgICAgICAgICBpZiAoeC5zIDwgMCAmJiB4LmNbMF0gJiYgc3RyLmluZGV4T2YoJy0nKSA8IDApIHtcclxuICAgICAgICAvL0UuZy4gLTAuNSBpZiByb3VuZGVkIHRvIC0wIHdpbGwgY2F1c2UgdG9TdHJpbmcgdG8gb21pdCB0aGUgbWludXMgc2lnbi5cclxuICAgICAgICAgICAgICAgIHN0ciA9ICctJyArIHN0cjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBCaWcuRV9ORUcgPSBuZWc7XHJcbiAgICAgICAgQmlnLkVfUE9TID0gcG9zO1xyXG5cclxuICAgICAgICBpZiAoIXN0cikge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvRml4IScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIHNkXHJcbiAgICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgQmlnLlJNLiBVc2UgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgc2QgaXMgbGVzc1xyXG4gICAgICogdGhhbiB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlXHJcbiAgICAgKiB2YWx1ZSBpbiBub3JtYWwgbm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogc2Qge251bWJlcn0gSW50ZWdlciwgMSB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvUHJlY2lzaW9uID0gZnVuY3Rpb24gKHNkKSB7XHJcblxyXG4gICAgICAgIGlmIChzZCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZCAhPT0gfn5zZCB8fCBzZCA8IDEgfHwgc2QgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b1ByZSEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmb3JtYXQodGhpcywgc2QgLSAxLCAyKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vIEV4cG9ydFxyXG5cclxuXHJcbiAgICBCaWcgPSBiaWdGYWN0b3J5KCk7XHJcblxyXG4gICAgLy9BTUQuXHJcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJpZztcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAvLyBOb2RlIGFuZCBvdGhlciBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMuXHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBCaWc7XHJcblxyXG4gICAgLy9Ccm93c2VyLlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBnbG9iYWwuQmlnID0gQmlnO1xyXG4gICAgfVxyXG59KSh0aGlzKTtcclxuIl19

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
},{"./gen.js":29}],2:[function(require,module,exports){
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
},{"./gen.js":29}],3:[function(require,module,exports){
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
},{"./gen.js":29}],4:[function(require,module,exports){
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
},{"./accum.js":2,"./add.js":5,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":29,"./ifelseif.js":34,"./lt.js":37,"./mul.js":47,"./neq.js":48,"./peek.js":53,"./poke.js":55,"./sub.js":64}],5:[function(require,module,exports){
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
},{"./gen.js":29}],6:[function(require,module,exports){
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
},{"./accum.js":2,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":29,"./ifelseif.js":34,"./lt.js":37,"./mul.js":47,"./param.js":52,"./peek.js":53,"./sub.js":64}],7:[function(require,module,exports){
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
},{"./gen.js":29}],8:[function(require,module,exports){
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
},{"./gen.js":29}],9:[function(require,module,exports){
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
},{"./gen.js":29}],10:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js');

module.exports = function () {
    var decayTime = arguments.length <= 0 || arguments[0] === undefined ? 44100 : arguments[0];

    var ssd = history(1),
        t60 = Math.exp(-6.907755278921 / decayTime);

    ssd.in(mul(ssd.out, t60));

    ssd.out.trigger = function () {
        ssd.value = 1;
    };

    return sub(1, ssd.out);
};
},{"./gen.js":29,"./history.js":33,"./mul.js":47,"./sub.js":64}],11:[function(require,module,exports){
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
},{"./gen.js":29}],12:[function(require,module,exports){
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
},{"./gen.js":29}],13:[function(require,module,exports){
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
},{"./gen.js":29}],14:[function(require,module,exports){
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
},{"./floor.js":26,"./gen.js":29,"./memo.js":41,"./sub.js":64}],15:[function(require,module,exports){
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
},{"./gen.js":29}],16:[function(require,module,exports){
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
},{"./gen.js":29}],17:[function(require,module,exports){
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
},{"./data.js":18,"./gen.js":29,"./mul.js":47,"./peek.js":53,"./phasor.js":54}],18:[function(require,module,exports){
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
},{"./gen.js":29,"./peek.js":53,"./poke.js":55,"./utilities.js":69}],19:[function(require,module,exports){
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
},{"./add.js":5,"./gen.js":29,"./history.js":33,"./memo.js":41,"./mul.js":47,"./sub.js":64}],20:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    mul = require('./mul.js'),
    t60 = require('./t60.js');

module.exports = function () {
  var decayTime = arguments.length <= 0 || arguments[0] === undefined ? 44100 : arguments[0];

  var ssd = history(1);

  ssd.in(mul(ssd.out, t60(decayTime)));

  ssd.out.trigger = function () {
    ssd.value = 1;
  };

  return ssd.out;
};
},{"./gen.js":29,"./history.js":33,"./mul.js":47,"./t60.js":66}],21:[function(require,module,exports){
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
},{"./accum.js":2,"./data.js":18,"./gen.js":29,"./poke.js":55,"./wrap.js":71}],22:[function(require,module,exports){
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
},{"./gen.js":29,"./history.js":33,"./sub.js":64}],23:[function(require,module,exports){
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
},{"./gen.js":29}],24:[function(require,module,exports){
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
},{"./data":18,"./gen":29,"./peek":53,"./phasor":54,"./windows":70}],25:[function(require,module,exports){
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
},{"./gen.js":29}],26:[function(require,module,exports){
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
},{"./gen.js":29}],27:[function(require,module,exports){
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
},{"./gen.js":29}],28:[function(require,module,exports){
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
},{"./gen.js":29}],29:[function(require,module,exports){
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
},{"memory-helper":72}],30:[function(require,module,exports){
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
},{"./gen.js":29}],31:[function(require,module,exports){
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
},{"./gen.js":29}],32:[function(require,module,exports){
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
},{"./gen.js":29}],33:[function(require,module,exports){
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
},{"./gen.js":29}],34:[function(require,module,exports){
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
},{"./gen.js":29}],35:[function(require,module,exports){
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
},{"./gen.js":29}],36:[function(require,module,exports){
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

    Object.defineProperty(library, 'samplerate', {
      get: function get() {
        return library.gen.samplerate;
      },
      set: function set(v) {}
    });

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
  attack: require('./attack.js'),
  decay: require('./decay.js'),
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
},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./ad.js":4,"./add.js":5,"./adsr.js":6,"./and.js":7,"./asin.js":8,"./atan.js":9,"./attack.js":10,"./bang.js":11,"./bool.js":12,"./ceil.js":13,"./clamp.js":14,"./cos.js":15,"./counter.js":16,"./cycle.js":17,"./data.js":18,"./dcblock.js":19,"./decay.js":20,"./delay.js":21,"./delta.js":22,"./div.js":23,"./env.js":24,"./eq.js":25,"./floor.js":26,"./fold.js":27,"./gate.js":28,"./gen.js":29,"./gt.js":30,"./gte.js":31,"./gtp.js":32,"./history.js":33,"./ifelseif.js":34,"./in.js":35,"./lt.js":37,"./lte.js":38,"./ltp.js":39,"./max.js":40,"./memo.js":41,"./min.js":42,"./mix.js":43,"./mod.js":44,"./mstosamps.js":45,"./mtof.js":46,"./mul.js":47,"./neq.js":48,"./noise.js":49,"./not.js":50,"./pan.js":51,"./param.js":52,"./peek.js":53,"./phasor.js":54,"./poke.js":55,"./pow.js":56,"./rate.js":57,"./round.js":58,"./sah.js":59,"./selector.js":60,"./sign.js":61,"./sin.js":62,"./slide.js":63,"./sub.js":64,"./switch.js":65,"./t60.js":66,"./tan.js":67,"./train.js":68,"./utilities.js":69,"./windows.js":70,"./wrap.js":71}],37:[function(require,module,exports){
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
},{"./gen.js":29}],38:[function(require,module,exports){
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
},{"./gen.js":29}],39:[function(require,module,exports){
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
},{"./gen.js":29}],40:[function(require,module,exports){
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
},{"./gen.js":29}],41:[function(require,module,exports){
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
},{"./gen.js":29}],42:[function(require,module,exports){
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
},{"./gen.js":29}],43:[function(require,module,exports){
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
},{"./add.js":5,"./gen.js":29,"./memo.js":41,"./mul.js":47,"./sub.js":64}],44:[function(require,module,exports){
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
},{"./gen.js":29}],45:[function(require,module,exports){
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
},{"./gen.js":29}],46:[function(require,module,exports){
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
},{"./gen.js":29}],47:[function(require,module,exports){
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
},{"./gen.js":29}],48:[function(require,module,exports){
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
},{"./gen.js":29}],49:[function(require,module,exports){
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
},{"./gen.js":29}],50:[function(require,module,exports){
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
},{"./gen.js":29}],51:[function(require,module,exports){
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
},{"./data.js":18,"./gen.js":29,"./mul.js":47,"./peek.js":53}],52:[function(require,module,exports){
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
},{"./gen.js":29}],53:[function(require,module,exports){
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
},{"./gen.js":29}],54:[function(require,module,exports){
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
},{"./accum.js":2,"./gen.js":29,"./mul.js":47}],55:[function(require,module,exports){
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
},{"./gen.js":29,"./mul.js":47,"./wrap.js":71}],56:[function(require,module,exports){
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
},{"./gen.js":29}],57:[function(require,module,exports){
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
},{"./add.js":5,"./delta.js":22,"./gen.js":29,"./history.js":33,"./memo.js":41,"./mul.js":47,"./sub.js":64,"./wrap.js":71}],58:[function(require,module,exports){
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
},{"./gen.js":29}],59:[function(require,module,exports){
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
},{"./gen.js":29}],60:[function(require,module,exports){
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
},{"./gen.js":29}],61:[function(require,module,exports){
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
},{"./gen.js":29}],62:[function(require,module,exports){
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
},{"./gen.js":29}],63:[function(require,module,exports){
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
},{"./add.js":5,"./gen.js":29,"./history.js":33,"./memo.js":41,"./mul.js":47,"./sub.js":64,"./switch.js":65}],64:[function(require,module,exports){
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
},{"./gen.js":29}],65:[function(require,module,exports){
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
},{"./gen.js":29}],66:[function(require,module,exports){
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
},{"./gen.js":29}],67:[function(require,module,exports){
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
},{"./gen.js":29}],68:[function(require,module,exports){
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
},{"./gen.js":29,"./lt.js":37,"./phasor.js":54}],69:[function(require,module,exports){
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
},{"./data.js":18,"./gen.js":29}],70:[function(require,module,exports){
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
},{}],71:[function(require,module,exports){
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
},{"./floor.js":26,"./gen.js":29,"./memo.js":41,"./sub.js":64}],72:[function(require,module,exports){
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

},{}],73:[function(require,module,exports){
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

},{}],74:[function(require,module,exports){
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

},{"genish.js":36}],75:[function(require,module,exports){
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

},{}],76:[function(require,module,exports){
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


},{"genish.js":36}],77:[function(require,module,exports){
let g = require( 'genish.js' ),
    ugen = require( './ugen.js' )

module.exports = function( Gibberish ) {

  let Bus = { 
    factory: null,//Gibberish.factory( g.add( 0 ) , 'bus', [ 0, 1 ]  ),

    create() {
      let bus = Object.create( ugen )
      
      bus.callback = function() {
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


},{"./ugen.js":100,"genish.js":36}],78:[function(require,module,exports){
let g = require( 'genish.js' ),
    ugen = require( './ugen.js' )

module.exports = function( Gibberish ) {

  let Bus2 = { 
    create() {
      let output = new Float32Array( 2 )

      let bus = Object.create( ugen )

      Object.assign( bus, {
        callback() {
          output[ 0 ] = output[ 1 ] = 0

          for( let i = 0, length = arguments.length; i < length; i++ ) {
            let input = arguments[ i ],
              isArray = input instanceof Float32Array

            output[ 0 ] += isArray ? input[ 0 ] : input
            output[ 1 ] += isArray ? input[ 1 ] : input
          }

          return output
        },
        id : Gibberish.factory.getUID(),
        dirty : true,
        type : 'bus',
        inputs : [],
        inputNames : [],
      })

      bus.ugenName = bus.callback.ugenName = 'bus2_' + bus.id

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


},{"./ugen.js":100,"genish.js":36}],79:[function(require,module,exports){
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

},{"genish.js":36}],80:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Conga = argumentProps => {
    let conga = Object.create( instrument ),
        frequency = g.in( 'frequency' ),
        decay = g.in( 'decay' ),
        tone  = g.in( 'tone' ),
        gain  = g.in( 'gain' )

    let props = Object.assign( {}, Conga.defaults, argumentProps )

    let trigger = g.bang(),
        impulse = g.mul( trigger, 60 ),
        _decay =  g.sub( .101, g.div( decay, 10 ) ), // create range of .001 - .099
        bpf = g.svf( impulse, frequency, _decay, 2, false ),
        out = mul( bpf, gain )
    
    Gibberish.factory( conga, out, 'conga', props  )
    
    conga.env = trigger

    return conga
  }
  
  Conga.defaults = {
    gain: 1,
    frequency:190,
    decay: 1
  }

  return Conga

}

},{"./instrument.js":88,"genish.js":36}],81:[function(require,module,exports){
let ugen = require( './ugen.js' )

let effect = Object.create( ugen )

Object.assign( effect, {

})

module.exports = effect

},{"./ugen.js":100}],82:[function(require,module,exports){
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


},{"genish.js":36}],83:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Flanger = inputProps => {
  let props   = Object.assign( {}, Flanger.defaults, inputProps ),
      flanger = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      delayLength = 44100,
      feedbackCoeff = g.in( 'feedback' ),
      modAmount = g.in( 'offset' ),
      frequency = g.in( 'frequency' ),
      delayBufferL = g.data( delayLength ),
      delayBufferR

  let writeIdx = g.accum( 1,0, { min:0, max:delayLength, interp:'none', mode:'samples' })
  
  let offset = g.mul( modAmount, 500 )
  
  let readIdx = g.wrap( 
    g.add( 
      g.sub( writeIdx, offset ), 
      g.mul( g.cycle( frequency ), g.sub( offset, 1 ) ) 
    ), 
	  0, 
    delayLength
  )

  let leftInput = isStereo ? input[0] : input

  let delayedOutL = g.peek( delayBufferL, readIdx, { interp:'linear', mode:'samples' })
  
  g.poke( delayBufferL, g.add( leftInput, g.mul( delayedOutL, feedbackCoeff ) ), writeIdx )

  let left = add( leftInput, delayedOutL ),
      right

  if( isStereo === true ) {
    rightInput = input[1]
    delayBufferR = g.data( delayLength )
    
    let delayedOutR = g.peek( delayBufferR, readIdx, { interp:'linear', mode:'samples' })

    g.poke( delayBufferR, g.add( rightInput, mul( delayedOutR, feedbackCoeff ) ), writeIdx )
    right = g.add( rightInput, delayedOutR )

    Gibberish.factory( 
      flanger,
      [ left, right ], 
      'flanger', 
      props 
    )

  }else{
    console.log( 'NOT STEREO', isStereo )
    Gibberish.factory( flanger, left, 'flanger', props )
  }
  
  return flanger
}

Flanger.defaults = {
  input:0,
  feedback:.01,
  offset:.25,
  frequency:.5
}

return Flanger

}

},{"./effect.js":81,"genish.js":36}],84:[function(require,module,exports){
let g = require( 'genish.js' )

let feedbackOsc = function( frequency, filter, pulsewidth=.5, argumentProps ) {
  if( argumentProps === undefined ) argumentProps = { type: 0 }

  let lastSample = g.history(),
      lastSample2 = g.history(), // for potential osc 2
      lastSampleMaster = g.history(), // for potential sum of osc1,osc2
      // determine phase increment and memoize result
      w = g.memo( g.div( frequency, g.samplerate ) ),
      // create scaling factor
      n = g.sub( -.5, w ),
      scaling = g.mul( g.mul( 13, filter ), g.pow( n, 5 ) ),
      // calculate dc offset and normalization factors
      DC = g.sub( .376, g.mul( w, .752 ) ),
      norm = g.sub( 1, g.mul( 2, w ) ),
      // determine phase
      osc1Phase = g.accum( w, 0, { min:-1 }),
      osc1, osc2, out

  // create current sample... from the paper:
  // osc = (osc + sin(2*pi*(phase + osc*scaling)))*0.5f;
  osc1 = g.memo( 
    g.mul(
      g.add(
        lastSample.out,
        g.sin(
          g.mul(
            Math.PI * 2,
            g.memo( g.add( osc1Phase, g.mul( lastSample.out, scaling ) ) )
          )
        )
      ),
      .5
    )
  )

  // store sample to use as modulation
  lastSample.in( osc1 )

  // if pwm / square waveform instead of sawtooth...
  if( argumentProps.type === 1 ) { 
    osc2 = g.mul(
      g.add(
        lastSample2.out,
        g.sin(
          g.mul(
            Math.PI * 2,
            g.memo( g.add( osc1Phase, g.mul( lastSample.out, scaling ), pulsewidth ) )
          )
        )
      ),
      .5
    )

    lastSample2.in( osc2 )
    out = g.memo( g.sub( lastSample.out, lastSample2.out ) )
    out = g.memo( g.add( g.mul( 2.5, out ), g.mul( -1.5, lastSampleMaster.out ) ) )

    lastSampleMaster.in( g.sub( osc1, osc2 ) )

  }else{
     // offset and normalize
    osc1 = g.add( g.mul( 2.5, osc1 ), g.mul( -1.5, lastSample.out ) )
    osc1 = g.add( osc1, DC )
 
    out = osc1
  }

  return g.mul( out, norm )
}

module.exports = feedbackOsc

},{"genish.js":36}],85:[function(require,module,exports){
let g = require( 'genish.js' ),
    allPass = require( './allpass.js' ),
    combFilter = require( './combfilter.js' ),
    effect = require( './effect.js' )

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

let Freeverb = inputProps => {
  let props = Object.assign( {}, Freeverb.defaults, inputProps ),
      reverb = Object.create( effect ) 
   
  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let combsL = [], combsR = []

  let input = g.in( 'input' ),
      wet1 = g.in( 'wet1'), wet2 = g.in( 'wet2' ),  dry = g.in( 'dry' ), 
      roomSize = g.in( 'roomSize' ), damping = g.in( 'damping' )
  
  let summedInput = isStereo === true ? g.add( input[0], input[1] ) : input,
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
    outL = allPass( outL, tuning.allPassTuning[ i ] + tuning.stereoSpread )
    outR = allPass( outR, tuning.allPassTuning[ i ] + tuning.stereoSpread )
  }
  
  let outputL = g.add( g.mul( outL, wet1 ), g.mul( outR, wet2 ), g.mul( isStereo === true ? input[0] : input, dry ) ),
      outputR = g.add( g.mul( outR, wet1 ), g.mul( outL, wet2 ), g.mul( isStereo === true ? input[1] : input, dry ) )

  Gibberish.factory( reverb, [ outputL, outputR ], 'freeverb', props )

  return reverb
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


},{"./allpass.js":74,"./combfilter.js":79,"./effect.js":81,"genish.js":36}],86:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Hat = argumentProps => {
    let hat = Object.create( instrument ),
        tune  = g.in( 'tune' ),
        decay  = g.in( 'decay' ),
        gain  = g.in( 'gain' )

    let props = Object.assign( {}, Hat.defaults, argumentProps )

    let baseFreq = g.mul( 325, tune ),
        bpfCutoff = g.mul( g.param( 'bpfc', 7000), tune ),
        hpfCutoff = g.mul( g.param( 'hpfc',.9755), tune ),  
        s1 = g.gt( g.phasor( baseFreq ), .5 ),
        s2 = g.gt( g.phasor( g.mul(baseFreq,1.4471) ), .5 ),
        s3 = g.gt( g.phasor( g.mul(baseFreq,1.6170) ), .5 ),
        s4 = g.gt( g.phasor( g.mul(baseFreq,1.9265) ), .5 ),
        s5 = g.gt( g.phasor( g.mul(baseFreq,2.5028) ), .5 ),
        s6 = g.gt( g.phasor( g.mul(baseFreq,2.6637) ), .5 ),
        sum = g.add( s1,s2,s3,s4,s5,s6 ),
        eg = g.decay( decay ), 
        bpf = g.svf( sum, bpfCutoff, .5, 2, false ),
        envBpf = g.mul( bpf, eg ),
        hpf = g.filter24( envBpf, 0, hpfCutoff, 0 ),
        out = g.mul( hpf, gain )

    Gibberish.factory( hat, out, 'hat', props  )
    
    hat.env = eg 

    hat.isStereo = false
    return hat
  }
  
  Hat.defaults = {
    gain: 1,
    tune:1,
    decay:3500,
  }

  return Hat

}

},{"./instrument.js":88,"genish.js":36}],87:[function(require,module,exports){
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
    [ this.ugens.monosynth, this.ugens.polymono ] = require( './monosynth.js' )( this );
    
    this.ugens.freeverb    = require( './freeverb.js'  )( this );
    this.ugens.flanger     = require( './flanger.js'   )( this );
    this.ugens.vibrato     = require( './vibrato.js'   )( this );
    this.sequencer         = require( './sequencer.js' )( this );
    [ this.ugens.karplus, this.ugens.polykarplus ]  = require( './karplusstrong.js' )( this );
    
    this.ugens.filter24    = require( './filter24.js' )( this )
    this.ugens.biquad      = require( './biquad.js'   )( this )
    this.ugens.kick        = require( './kick.js' )( this )
    this.ugens.conga       = require( './conga.js' )( this )
    this.ugens.clave       = require( './conga.js' )( this )
    this.ugens.hat         = require( './hat.js' )( this )
    this.ugens.snare       = require( './snare.js' )( this )
    this.ugens.clave.defaults.frequency = 2500
    this.ugens.clave.defaults.decay = .5
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

    this.callbackUgens.push( output.callback )

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
          if( input === undefined ) { console.log( key ); continue; }
          Gibberish.processUgen( input, block )

          if( !input.binop ) Gibberish.callbackUgens.push( input.callback )

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

},{"./binops.js":75,"./biquad.js":76,"./bus.js":77,"./bus2.js":78,"./conga.js":80,"./filter24.js":82,"./flanger.js":83,"./freeverb.js":85,"./hat.js":86,"./karplusstrong.js":89,"./kick.js":90,"./monosynth.js":91,"./oscillators.js":92,"./polytemplate.js":93,"./scheduler.js":94,"./sequencer.js":95,"./snare.js":96,"./svf.js":97,"./synth.js":98,"./synth2.js":99,"./ugenTemplate.js":101,"./vibrato.js":102,"genish.js":36,"memory-helper":72}],88:[function(require,module,exports){
let ugen = require( './ugen.js' )

let instrument = Object.create( ugen )

Object.assign( instrument, {
  note( freq ) {
    this.frequency = freq
    this.env.trigger()
  },

  trigger( _gain = 1) {
    this.gain = _gain
    this.env.trigger()
  }

})

module.exports = instrument

},{"./ugen.js":100}],89:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let KPS = props => {
    let syn = Object.create( instrument ),
        trigger = g.bang(),
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

    if( properties.panVoices ) {  
      let panner = g.pan( withGain, withGain, g.in( 'pan' ) )
      Gibberish.factory( syn, [panner.left, panner.right], 'karplus', props  )
    }else{
      Gibberish.factory( syn, withGain , 'karpuls', props )
    }

    Object.assign( syn, {
      properties : props,

      env : trigger,
      phase,

      getPhase() {
        return Gibberish.memory.heap[ phase.memory.value.idx ]
      },
    })
    return syn
  }
  
  KPS.defaults = {
    decay: .97,
    damping:.2,
    gain: 1,
    frequency:220,
    pan: .5,
    panVoices:false
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

},{"./instrument.js":88,"genish.js":36}],90:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Kick = inputProps => {
    // establish prototype chain
    let kick = Object.create( instrument )

    // define inputs
    let frequency = g.in( 'frequency' ),
        decay = g.in( 'decay' ),
        tone  = g.in( 'tone' ),
        gain  = g.in( 'gain' )
    
    // create initial property set
    let props = Object.assign( {}, Kick.defaults, inputProps )

    // create DSP graph
    let trigger = g.bang(),
        impulse = g.mul( trigger, 60 ),
        scaledDecay = g.sub( 1.005, decay ), // -> range { .005, 1.005 }
        scaledTone = g.add( 50, g.mul( tone, 4000 ) ), // -> range { 50, 4050 }
        bpf = g.svf( impulse, frequency, scaledDecay, 2, false ),
        lpf = g.svf( bpf, scaledTone, .5, 0, false ),
        graph = mul( lpf, gain )
    
    Gibberish.factory( kick, graph, 'kick', props  )

    kick.env = trigger

    return kick
  }
  
  Kick.defaults = {
    gain: 1,
    frequency:55,
    tone: .25,
    decay:.9
  }

  return Kick

}

},{"./instrument.js":88,"genish.js":36}],91:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' ),
    feedbackOsc = require( './fmfeedbackosc.js' )

module.exports = function( Gibberish ) {

  let Synth = argumentProps => {
    let syn = Object.create( instrument ),
        oscs = [], 
        env = g.ad( g.in( 'attack' ), g.in( 'decay' ), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        phase

    let props = Object.assign( {}, Synth.defaults, argumentProps )

    for( let i = 0; i < 3; i++ ) {
      let osc, freq

      switch( i ) {
        case 1:
          freq = g.mul( frequency, g.add( g.in('octave2'), g.in('detune2')  ) )
          break;
        case 2:
          freq = g.mul( frequency, g.add( g.in('octave3'), g.in('detune3')  ) )
          break;
        default:
          freq = frequency
      }

      switch( props.waveform ) {
        case 'saw':
          if( props.antialias === false ) {
            osc = g.phasor( freq )
          }else{
            osc = feedbackOsc( freq, 1 )
          }
          break;
        case 'square':
          if( props.antialias === true ) {
            osc = feedbackOsc( freq, 1, .5, { type:1 })
          }else{
            phase = g.phasor( freq, 0, { min:0 } )
            osc = lt( phase, .5 )
          }
          break;
        case 'sine':
          osc = cycle( freq )
          break;
        case 'pwm':
          let pulsewidth = g.in('pulsewidth')
          if( props.antialias === true ) {
            osc = feedbackOsc( freq, 1, pulsewidth, { type:1 })
          }else{
            phase = g.phasor( freq, 0, { min:0 } )
            osc = lt( phase, pulsewidth )
          }
          break;
      }

      oscs[ i ] = osc
    }

    let oscSum = g.add( ...oscs ),
        oscWithGain = g.mul( g.mul( oscSum, env ), g.in( 'gain' ) ),
        isLowPass = g.param( 'lowPass', 1 ),
        filteredOsc = g.filter24( oscWithGain, g.in('resonance'), g.mul( g.in('cutoff'), env ), isLowPass ),
        panner

    if( props.panVoices ) {  
      panner = g.pan( filteredOsc,filteredOsc, g.in( 'pan' ) )
      Gibberish.factory( syn, [panner.left, panner.right], 'mono', props  )
    }else{
      Gibberish.factory( syn, filteredOsc , 'mono', props )
    }
    
    syn.env = env

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
    panVoices:false
  }

  let PolyMono = Gibberish.PolyTemplate( Synth, 
    ['frequency','attack','decay','cutoff','resonance',
     'octave2','octave3','detune2','detune3','pulsewidth','pan','gain']
  ) 

  return [ Synth, PolyMono ]
}

},{"./fmfeedbackosc.js":84,"./instrument.js":88,"genish.js":36}],92:[function(require,module,exports){
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


},{"genish.js":36}],93:[function(require,module,exports){
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
        voices[i].callback.ugenName = voices[i].ugenName
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

},{"genish.js":36}],94:[function(require,module,exports){
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

},{"../external/priorityqueue.js":73,"big.js":103}],95:[function(require,module,exports){
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

},{"../external/priorityqueue.js":73,"big.js":103}],96:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )
  
module.exports = function( Gibberish ) {

  let Snare = argumentProps => {
    let snare = Object.create( instrument ),
        frequency = g.in( 'frequency' ),
        decay = g.in( 'decay' ),
        snappy= g.in( 'snappy' ),
        tune  = g.in( 'tune' ),
        gain  = g.in( 'gain' )

    let props = Object.assign( {}, Snare.defaults, argumentProps )

    let eg = g.decay( decay ), 
        check = memo( gt( eg, .0005 ) ),
        rnd = g.mul( g.noise(), eg ),
        hpf = g.svf( rnd, g.add( frequency, g.mul( 1, 1000 ) ), .5, 1, false ),
        snap = gtp( g.mul( hpf, snappy ), 0 ),
        bpf1 = g.svf( eg, g.mul( 180, g.add( tune, 1 ) ), .05, 2, false ),
        bpf2 = g.svf( eg, g.mul( 330, g.add( tune, 1 ) ), .05, 2, false ),
        out  = g.memo( g.add( snap, bpf1, g.mul( bpf2, .8 ) ) ), //XXX why is memo needed?
        scaledOut = g.mul( out, gain )
    
    // XXX TODO : make this work with ifelse. the problem is that poke ugens put their
    // code at the bottom of the callback function, instead of at the end of the
    // associated if/else block.
    let ife = g.switch( check, scaledOut, 0 )
    //let ife = g.ifelse( g.gt( eg, .005 ), cycle(440), 0 )
    
    Gibberish.factory( snare, ife, 'snare', props  )
    
    snare.env = eg 

    return snare
  }
  
  Snare.defaults = {
    gain: 1,
    frequency:1000,
    tune:0,
    snappy: .5,
    decay:11025
  }

  return Snare

}

},{"./instrument.js":88,"genish.js":36}],97:[function(require,module,exports){
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


},{"genish.js":36}],98:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' ),
    feedbackOsc = require( './fmfeedbackosc.js' )

module.exports = function( Gibberish ) {

  let Synth = inputProps => {
    let syn = Object.create( instrument )

    let env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        phase, osc

    props = Object.assign( {}, Synth.defaults, inputProps )

    switch( props.waveform ) {
      case 'saw':
        if( props.antialias === false ) {
          osc = g.phasor( frequency )
        }else{
          osc = feedbackOsc( frequency, 1 )
        }
        break;
      case 'square':
        if( props.antialias === true ) {
          osc = feedbackOsc( frequency, 1, .5, { type:1 })
        }else{
          phase = g.phasor( frequency, 0, { min:0 } )
          osc = lt( phase, .5 )
        }
        break;
      case 'sine':
        osc = cycle( frequency )
        break;
      case 'pwm':
        let pulsewidth = g.in('pulsewidth')
        if( props.antialias === true ) {
          osc = feedbackOsc( frequency, 1, pulsewidth, { type:1 })
        }else{
          phase = g.phasor( frequency, 0, { min:0 } )
          osc = lt( phase, pulsewidth )
        }
        break;
    }

    let oscWithGain = g.mul( g.mul( osc, env ), g.in( 'gain' ) ),
        panner

    if( props.panVoices === true ) { 
      panner = g.pan( oscWithGain, oscWithGain, g.in( 'pan' ) ) 
      Gibberish.factory( syn, [panner.left, panner.right], 'synth', props  )
    }else{
      Gibberish.factory( syn, oscWithGain , 'synth', props )
    }
    
    syn.env = env

    return syn
  }
  
  Synth.defaults = {
    waveform:'saw',
    attack: 44100,
    decay: 44100,
    gain: 1,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    antialias:false,
    panVoices:false
  }

  let PolySynth = Gibberish.PolyTemplate( Synth, ['frequency','attack','decay','pulsewidth','pan','gain'] ) 

  return [ Synth, PolySynth ]

}

},{"./fmfeedbackosc.js":84,"./instrument.js":88,"genish.js":36}],99:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' ),
    feedbackOsc = require( './fmfeedbackosc.js' )

module.exports = function( Gibberish ) {

  let Synth2 = initialProps => {
    let syn = Object.create( instrument ),
        env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        phase, osc

    let props = Object.assign( {}, Synth2.defaults, initialProps )

    switch( props.waveform ) {
      case 'saw':
        if( props.antialias === false ) {
          osc = g.phasor( frequency )
        }else{
          osc = feedbackOsc( frequency, 1 )
        }
        break;
      case 'square':
        if( props.antialias === true ) {
          osc = feedbackOsc( frequency, 1, .5, { type:1 })
        }else{
          phase = g.phasor( frequency, 0, { min:0 } )
          osc = lt( phase, .5 )
        }
        break;
      case 'sine':
        osc = cycle( frequency )
        break;
      case 'pwm':
        let pulsewidth = g.in('pulsewidth')
        if( props.antialias === true ) {
          osc = feedbackOsc( frequency, 1, pulsewidth, { type:1 })
        }else{
          phase = g.phasor( frequency, 0, { min:0 } )
          osc = lt( phase, pulsewidth )
        }
        break;
    }

    let oscWithGain = g.mul( g.mul( osc, env ), g.in( 'gain' ) ),
        isLowPass = g.param( 'lowPass', 1 ),
        filteredOsc = g.filter24( oscWithGain, g.in('resonance'), g.mul( g.in('cutoff'), env ), isLowPass ),
        panner

    if( props.panVoices ) {  
      panner = g.pan( filteredOsc, filteredOsc, g.in( 'pan' ) )
      Gibberish.factory( syn, [panner.left, panner.right], 'synth2', props  )
    }else{
      Gibberish.factory( syn, filteredOsc, 'synth2', props )
    }
    
    syn.env = env
    
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
    resonance: 3.5,
    antialias: false,
    panVoices: false
  }

  let PolySynth2 = Gibberish.PolyTemplate( Synth2, ['frequency','attack','decay','pulsewidth','cutoff','resonance','pan','gain'] ) 

  return [ Synth2, PolySynth2 ]

}

},{"./fmfeedbackosc.js":84,"./instrument.js":88,"genish.js":36}],100:[function(require,module,exports){
let ugen = {
  free() {
    Gibberish.genish.gen.free( this.graph )
  },

  print() {
    console.log( this.callback.toString() )
  },

  connect( target, level=1 ) {
    let input = level === 1 ? this : Gibberish.Mul( this, level )

    if( target === undefined ) target = Gibberish.output 

    if( target.inputs )
      target.inputs.push( this )
    else
      target.input = this

    Gibberish.dirty( target )
    
    return this
  },

  chain( target, level=1 ) {
    this.connect( target,level )

    return target
  }
}

module.exports = ugen

},{}],101:[function(require,module,exports){
module.exports = function( Gibberish ) {
  let uid = 0

  let factory = function( ugen, graph, name, values ) {
    ugen.callback = Gibberish.genish.gen.createCallback( graph, Gibberish.memory )

    Object.assign( ugen, {
      type: 'ugen',
      id: factory.getUID(), 
      ugenName: name + '_',
      graph: graph,
      inputNames: Gibberish.genish.gen.parameters.slice(0),
      isStereo: Array.isArray( graph ),
      dirty: true
    })
    
    ugen.ugenName += ugen.id
    ugen.callback.ugenName = ugen.ugenName // XXX hacky

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

    return ugen
  }

  factory.getUID = () => uid++

  return factory
}

},{}],102:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Vibrato = inputProps => {
  let props   = Object.assign( {}, Vibrato.defaults, inputProps ),
      vibrato = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      delayLength = 44100,
      feedbackCoeff = g.in( 'feedback' ),
      modAmount = g.in( 'offset' ),
      frequency = g.in( 'frequency' ),
      delayBufferL = g.data( delayLength ),
      delayBufferR

  let writeIdx = g.accum( 1,0, { min:0, max:delayLength, interp:'none', mode:'samples' })
  
  let offset = g.mul( modAmount, 500 )
  
  let readIdx = g.wrap( 
    g.add( 
      g.sub( writeIdx, offset ), 
      g.mul( g.cycle( frequency ), g.sub( offset, 1 ) ) 
    ), 
	  0, 
    delayLength
  )

  let leftInput = isStereo ? input[0] : input

  let delayedOutL = g.peek( delayBufferL, readIdx, { interp:'linear', mode:'samples' })
  
  g.poke( delayBufferL, g.add( leftInput, g.mul( delayedOutL, feedbackCoeff ) ), writeIdx )

  let left = delayedOutL,
      right

  if( isStereo === true ) {
    rightInput = input[1]
    delayBufferR = g.data( delayLength )
    
    let delayedOutR = g.peek( delayBufferR, readIdx, { interp:'linear', mode:'samples' })

    g.poke( delayBufferR, g.add( rightInput, mul( delayedOutR, feedbackCoeff ) ), writeIdx )
    right = delayedOutR

    Gibberish.factory( 
      vibrato,
      [ left, right ], 
      'vibrato', 
      props 
    )
  }else{
    Gibberish.factory( vibrato, left, 'vibrato', props )
  }
  
  return vibrato
}

Vibrato.defaults = {
  input:0,
  feedback:.01,
  offset:.5,
  frequency:4
}

return Vibrato

}

},{"./effect.js":81,"genish.js":36}],103:[function(require,module,exports){
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

},{}]},{},[87])(87)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2Ficy5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvYWNjdW0uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2Fjb3MuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2FkLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9hZGQuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2Fkc3IuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2FuZC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvYXNpbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvYXRhbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvYXR0YWNrLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9iYW5nLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9ib29sLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9jZWlsLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9jbGFtcC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvY29zLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9jb3VudGVyLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9jeWNsZS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZGF0YS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZGNibG9jay5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZGVjYXkuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2RlbGF5LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9kZWx0YS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZGl2LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9lbnYuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2VxLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9mbG9vci5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZm9sZC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZ2F0ZS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZ2VuLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9ndC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZ3RlLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9ndHAuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2hpc3RvcnkuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2lmZWxzZWlmLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9pbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvaW5kZXguanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2x0LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9sdGUuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2x0cC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvbWF4LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9tZW1vLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9taW4uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L21peC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvbW9kLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9tc3Rvc2FtcHMuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L210b2YuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L211bC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvbmVxLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9ub2lzZS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvbm90LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9wYW4uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3BhcmFtLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9wZWVrLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9waGFzb3IuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3Bva2UuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3Bvdy5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvcmF0ZS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvcm91bmQuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3NhaC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvc2VsZWN0b3IuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3NpZ24uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3Npbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvc2xpZGUuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3N1Yi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvc3dpdGNoLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC90NjAuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3Rhbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvdHJhaW4uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3V0aWxpdGllcy5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvd2luZG93cy5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvd3JhcC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvbWVtb3J5LWhlbHBlci9pbmRleC50cmFuc3BpbGVkLmpzIiwiZXh0ZXJuYWwvcHJpb3JpdHlxdWV1ZS5qcyIsImpzL2FsbHBhc3MuanMiLCJqcy9iaW5vcHMuanMiLCJqcy9iaXF1YWQuanMiLCJqcy9idXMuanMiLCJqcy9idXMyLmpzIiwianMvY29tYmZpbHRlci5qcyIsImpzL2NvbmdhLmpzIiwianMvZWZmZWN0LmpzIiwianMvZmlsdGVyMjQuanMiLCJqcy9mbGFuZ2VyLmpzIiwianMvZm1mZWVkYmFja29zYy5qcyIsImpzL2ZyZWV2ZXJiLmpzIiwianMvaGF0LmpzIiwianMvaW5kZXguanMiLCJqcy9pbnN0cnVtZW50LmpzIiwianMva2FycGx1c3N0cm9uZy5qcyIsImpzL2tpY2suanMiLCJqcy9tb25vc3ludGguanMiLCJqcy9vc2NpbGxhdG9ycy5qcyIsImpzL3BvbHl0ZW1wbGF0ZS5qcyIsImpzL3NjaGVkdWxlci5qcyIsImpzL3NlcXVlbmNlci5qcyIsImpzL3NuYXJlLmpzIiwianMvc3ZmLmpzIiwianMvc3ludGguanMiLCJqcy9zeW50aDIuanMiLCJqcy91Z2VuLmpzIiwianMvdWdlblRlbXBsYXRlLmpzIiwianMvdmlicmF0by5qcyIsIm5vZGVfbW9kdWxlcy9iaWcuanMvYmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2FicycsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIE1hdGguYWJzKSk7XG5cbiAgICAgIG91dCA9ICdnZW4uYWJzKCAnICsgaW5wdXRzWzBdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hYnMocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBhYnMgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBhYnMuaW5wdXRzID0gW3hdO1xuXG4gIHJldHVybiBhYnM7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnYWNjdW0nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBjb2RlID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5ID0gdm9pZCAwO1xuXG4gICAgX2dlbi5yZXF1ZXN0TWVtb3J5KHRoaXMubWVtb3J5KTtcblxuICAgIF9nZW4ubWVtb3J5LmhlYXBbdGhpcy5tZW1vcnkudmFsdWUuaWR4XSA9IHRoaXMuaW5pdGlhbFZhbHVlO1xuXG4gICAgZnVuY3Rpb25Cb2R5ID0gdGhpcy5jYWxsYmFjayhnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSwgJ21lbW9yeVsnICsgdGhpcy5tZW1vcnkudmFsdWUuaWR4ICsgJ10nKTtcblxuICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCB0aGlzKSk7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZSArICdfdmFsdWUnO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5XTtcbiAgfSxcbiAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKF9uYW1lLCBfaW5jciwgX3Jlc2V0LCB2YWx1ZVJlZikge1xuICAgIHZhciBkaWZmID0gdGhpcy5tYXggLSB0aGlzLm1pbixcbiAgICAgICAgb3V0ID0gJycsXG4gICAgICAgIHdyYXAgPSAnJztcblxuICAgIC8qIHRocmVlIGRpZmZlcmVudCBtZXRob2RzIG9mIHdyYXBwaW5nLCB0aGlyZCBpcyBtb3N0IGV4cGVuc2l2ZTpcbiAgICAgKlxuICAgICAqIDE6IHJhbmdlIHswLDF9OiB5ID0geCAtICh4IHwgMClcbiAgICAgKiAyOiBsb2cyKHRoaXMubWF4KSA9PSBpbnRlZ2VyOiB5ID0geCAmICh0aGlzLm1heCAtIDEpXG4gICAgICogMzogYWxsIG90aGVyczogaWYoIHggPj0gdGhpcy5tYXggKSB5ID0gdGhpcy5tYXggLXhcbiAgICAgKlxuICAgICAqL1xuXG4gICAgLy8gbXVzdCBjaGVjayBmb3IgcmVzZXQgYmVmb3JlIHN0b3JpbmcgdmFsdWUgZm9yIG91dHB1dFxuICAgIGlmICghKHR5cGVvZiB0aGlzLmlucHV0c1sxXSA9PT0gJ251bWJlcicgJiYgdGhpcy5pbnB1dHNbMV0gPCAxKSkge1xuICAgICAgb3V0ICs9ICcgIGlmKCAnICsgX3Jlc2V0ICsgJyA+PTEgKSAnICsgdmFsdWVSZWYgKyAnID0gJyArIHRoaXMubWluICsgJ1xcblxcbic7XG4gICAgfVxuXG4gICAgb3V0ICs9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJ192YWx1ZSA9ICcgKyB2YWx1ZVJlZiArICc7XFxuICAnICsgdmFsdWVSZWYgKyAnICs9ICcgKyBfaW5jciArICdcXG4nOyAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyBcblxuICAgIGlmICh0aGlzLm1heCAhPT0gSW5maW5pdHkgJiYgdGhpcy5zaG91bGRXcmFwKSB3cmFwICs9ICcgIGlmKCAnICsgdmFsdWVSZWYgKyAnID49ICcgKyB0aGlzLm1heCArICcgKSAnICsgdmFsdWVSZWYgKyAnIC09ICcgKyBkaWZmICsgJ1xcbic7XG4gICAgaWYgKHRoaXMubWluICE9PSAtSW5maW5pdHkgJiYgdGhpcy5zaG91bGRXcmFwKSB3cmFwICs9ICcgIGlmKCAnICsgdmFsdWVSZWYgKyAnIDwgJyArIHRoaXMubWluICsgJyApICcgKyB2YWx1ZVJlZiArICcgKz0gJyArIGRpZmYgKyAnXFxuXFxuJztcblxuICAgIC8vaWYoIHRoaXMubWluID09PSAwICYmIHRoaXMubWF4ID09PSAxICkge1xuICAgIC8vICB3cmFwID0gIGAgICR7dmFsdWVSZWZ9ID0gJHt2YWx1ZVJlZn0gLSAoJHt2YWx1ZVJlZn0gfCAwKVxcblxcbmBcbiAgICAvL30gZWxzZSBpZiggdGhpcy5taW4gPT09IDAgJiYgKCBNYXRoLmxvZzIoIHRoaXMubWF4ICkgfCAwICkgPT09IE1hdGgubG9nMiggdGhpcy5tYXggKSApIHtcbiAgICAvLyAgd3JhcCA9ICBgICAke3ZhbHVlUmVmfSA9ICR7dmFsdWVSZWZ9ICYgKCR7dGhpcy5tYXh9IC0gMSlcXG5cXG5gXG4gICAgLy99IGVsc2UgaWYoIHRoaXMubWF4ICE9PSBJbmZpbml0eSApe1xuICAgIC8vICB3cmFwID0gYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICkgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxcblxcbmBcbiAgICAvL31cblxuICAgIG91dCA9IG91dCArIHdyYXA7XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbmNyKSB7XG4gIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMV07XG4gIHZhciBwcm9wZXJ0aWVzID0gYXJndW1lbnRzWzJdO1xuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBkZWZhdWx0cyA9IHsgbWluOiAwLCBtYXg6IDEsIHNob3VsZFdyYXA6IHRydWUgfTtcblxuICBpZiAocHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBwcm9wZXJ0aWVzKTtcblxuICBpZiAoZGVmYXVsdHMuaW5pdGlhbFZhbHVlID09PSB1bmRlZmluZWQpIGRlZmF1bHRzLmluaXRpYWxWYWx1ZSA9IGRlZmF1bHRzLm1pbjtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICBtaW46IGRlZmF1bHRzLm1pbixcbiAgICBtYXg6IGRlZmF1bHRzLm1heCxcbiAgICBpbml0aWFsOiBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdmFsdWU6IGRlZmF1bHRzLmluaXRpYWxWYWx1ZSxcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW5jciwgcmVzZXRdLFxuICAgIG1lbW9yeToge1xuICAgICAgdmFsdWU6IHsgbGVuZ3RoOiAxLCBpZHg6IG51bGwgfVxuICAgIH1cbiAgfSwgZGVmYXVsdHMpO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2Fjb3MnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKHsgJ2Fjb3MnOiBNYXRoLmFjb3MgfSk7XG5cbiAgICAgIG91dCA9ICdnZW4uYWNvcyggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYWNvcyhwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIGFjb3MgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBhY29zLmlucHV0cyA9IFt4XTtcbiAgYWNvcy5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIGFjb3MubmFtZSA9IGFjb3MuYmFzZW5hbWUgKyAne2Fjb3MuaWR9JztcblxuICByZXR1cm4gYWNvcztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgZGl2ID0gcmVxdWlyZSgnLi9kaXYuanMnKSxcbiAgICBkYXRhID0gcmVxdWlyZSgnLi9kYXRhLmpzJyksXG4gICAgcGVlayA9IHJlcXVpcmUoJy4vcGVlay5qcycpLFxuICAgIGFjY3VtID0gcmVxdWlyZSgnLi9hY2N1bS5qcycpLFxuICAgIGlmZWxzZSA9IHJlcXVpcmUoJy4vaWZlbHNlaWYuanMnKSxcbiAgICBsdCA9IHJlcXVpcmUoJy4vbHQuanMnKSxcbiAgICBiYW5nID0gcmVxdWlyZSgnLi9iYW5nLmpzJyksXG4gICAgZW52ID0gcmVxdWlyZSgnLi9lbnYuanMnKSxcbiAgICBhZGQgPSByZXF1aXJlKCcuL2FkZC5qcycpLFxuICAgIHBva2UgPSByZXF1aXJlKCcuL3Bva2UuanMnKSxcbiAgICBuZXEgPSByZXF1aXJlKCcuL25lcS5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGF0dGFja1RpbWUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyA0NDEwMCA6IGFyZ3VtZW50c1swXTtcbiAgdmFyIGRlY2F5VGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDQ0MTAwIDogYXJndW1lbnRzWzFdO1xuICB2YXIgX3Byb3BzID0gYXJndW1lbnRzWzJdO1xuXG4gIHZhciBfYmFuZyA9IGJhbmcoKSxcbiAgICAgIHBoYXNlID0gYWNjdW0oMSwgX2JhbmcsIHsgbWF4OiBJbmZpbml0eSwgc2hvdWxkV3JhcDogZmFsc2UsIGluaXRpYWxWYWx1ZTogLUluZmluaXR5IH0pLFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNoYXBlOiAnZXhwb25lbnRpYWwnLCBhbHBoYTogNSB9LCBfcHJvcHMpLFxuICAgICAgYnVmZmVyRGF0YSA9IHZvaWQgMCxcbiAgICAgIGRlY2F5RGF0YSA9IHZvaWQgMCxcbiAgICAgIG91dCA9IHZvaWQgMCxcbiAgICAgIGJ1ZmZlciA9IHZvaWQgMDtcblxuICAvL2NvbnNvbGUubG9nKCAnYXR0YWNrIHRpbWU6JywgYXR0YWNrVGltZSwgJ2RlY2F5IHRpbWU6JywgZGVjYXlUaW1lIClcbiAgdmFyIGNvbXBsZXRlRmxhZyA9IGRhdGEoWzBdKTtcblxuICAvLyBzbGlnaHRseSBtb3JlIGVmZmljaWVudCB0byB1c2UgZXhpc3RpbmcgcGhhc2UgYWNjdW11bGF0b3IgZm9yIGxpbmVhciBlbnZlbG9wZXNcbiAgaWYgKHByb3BzLnNoYXBlID09PSAnbGluZWFyJykge1xuICAgIG91dCA9IGlmZWxzZShhbmQoZ3RlKHBoYXNlLCAwKSwgbHQocGhhc2UsIGF0dGFja1RpbWUpKSwgbWVtbyhkaXYocGhhc2UsIGF0dGFja1RpbWUpKSwgYW5kKGd0ZShwaGFzZSwgMCksIGx0KHBoYXNlLCBhZGQoYXR0YWNrVGltZSwgZGVjYXlUaW1lKSkpLCBzdWIoMSwgZGl2KHN1YihwaGFzZSwgYXR0YWNrVGltZSksIGRlY2F5VGltZSkpLCBuZXEocGhhc2UsIC1JbmZpbml0eSksIHBva2UoY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTogMCB9KSwgMCk7XG4gIH0gZWxzZSB7XG4gICAgYnVmZmVyRGF0YSA9IGVudigxMDI0LCB7IHR5cGU6IHByb3BzLnNoYXBlLCBhbHBoYTogcHJvcHMuYWxwaGEgfSk7XG4gICAgb3V0ID0gaWZlbHNlKGFuZChndGUocGhhc2UsIDApLCBsdChwaGFzZSwgYXR0YWNrVGltZSkpLCBwZWVrKGJ1ZmZlckRhdGEsIGRpdihwaGFzZSwgYXR0YWNrVGltZSksIHsgYm91bmRtb2RlOiAnY2xhbXAnIH0pLCBhbmQoZ3RlKHBoYXNlLCAwKSwgbHQocGhhc2UsIGFkZChhdHRhY2tUaW1lLCBkZWNheVRpbWUpKSksIHBlZWsoYnVmZmVyRGF0YSwgc3ViKDEsIGRpdihzdWIocGhhc2UsIGF0dGFja1RpbWUpLCBkZWNheVRpbWUpKSwgeyBib3VuZG1vZGU6ICdjbGFtcCcgfSksIG5lcShwaGFzZSwgLUluZmluaXR5KSwgcG9rZShjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOiAwIH0pLCAwKTtcbiAgfVxuXG4gIG91dC5pc0NvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4XTtcbiAgfTtcblxuICBvdXQudHJpZ2dlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBnZW4ubWVtb3J5LmhlYXBbY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4XSA9IDA7XG4gICAgX2JhbmcudHJpZ2dlcigpO1xuICB9O1xuXG4gIHJldHVybiBvdXQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgdmFyIGFkZCA9IHtcbiAgICBpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgICBvdXQgPSAnKCcsXG4gICAgICAgICAgc3VtID0gMCxcbiAgICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgICAgYWRkZXJBdEVuZCA9IGZhbHNlLFxuICAgICAgICAgIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZTtcblxuICAgICAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgICAgaWYgKGlzTmFOKHYpKSB7XG4gICAgICAgICAgb3V0ICs9IHY7XG4gICAgICAgICAgaWYgKGkgPCBpbnB1dHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgYWRkZXJBdEVuZCA9IHRydWU7XG4gICAgICAgICAgICBvdXQgKz0gJyArICc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFscmVhZHlGdWxsU3VtbWVkID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VtICs9IHBhcnNlRmxvYXQodik7XG4gICAgICAgICAgbnVtQ291bnQrKztcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChhbHJlYWR5RnVsbFN1bW1lZCkgb3V0ID0gJyc7XG5cbiAgICAgIGlmIChudW1Db3VudCA+IDApIHtcbiAgICAgICAgb3V0ICs9IGFkZGVyQXRFbmQgfHwgYWxyZWFkeUZ1bGxTdW1tZWQgPyBzdW0gOiAnICsgJyArIHN1bTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFhbHJlYWR5RnVsbFN1bW1lZCkgb3V0ICs9ICcpJztcblxuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGFkZDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgZGl2ID0gcmVxdWlyZSgnLi9kaXYuanMnKSxcbiAgICBkYXRhID0gcmVxdWlyZSgnLi9kYXRhLmpzJyksXG4gICAgcGVlayA9IHJlcXVpcmUoJy4vcGVlay5qcycpLFxuICAgIGFjY3VtID0gcmVxdWlyZSgnLi9hY2N1bS5qcycpLFxuICAgIGlmZWxzZSA9IHJlcXVpcmUoJy4vaWZlbHNlaWYuanMnKSxcbiAgICBsdCA9IHJlcXVpcmUoJy4vbHQuanMnKSxcbiAgICBiYW5nID0gcmVxdWlyZSgnLi9iYW5nLmpzJyksXG4gICAgZW52ID0gcmVxdWlyZSgnLi9lbnYuanMnKSxcbiAgICBwYXJhbSA9IHJlcXVpcmUoJy4vcGFyYW0uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhdHRhY2tUaW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gNDQgOiBhcmd1bWVudHNbMF07XG4gIHZhciBkZWNheVRpbWUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAyMjA1MCA6IGFyZ3VtZW50c1sxXTtcbiAgdmFyIHN1c3RhaW5UaW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gNDQxMDAgOiBhcmd1bWVudHNbMl07XG4gIHZhciBzdXN0YWluTGV2ZWwgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyAuNiA6IGFyZ3VtZW50c1szXTtcbiAgdmFyIHJlbGVhc2VUaW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSA0IHx8IGFyZ3VtZW50c1s0XSA9PT0gdW5kZWZpbmVkID8gNDQxMDAgOiBhcmd1bWVudHNbNF07XG4gIHZhciBfcHJvcHMgPSBhcmd1bWVudHNbNV07XG5cbiAgdmFyIGVudlRyaWdnZXIgPSBiYW5nKCksXG4gICAgICBwaGFzZSA9IGFjY3VtKDEsIGVudlRyaWdnZXIsIHsgbWF4OiBJbmZpbml0eSwgc2hvdWxkV3JhcDogZmFsc2UgfSksXG4gICAgICBzaG91bGRTdXN0YWluID0gcGFyYW0oMSksXG4gICAgICBkZWZhdWx0cyA9IHtcbiAgICBzaGFwZTogJ2V4cG9uZW50aWFsJyxcbiAgICBhbHBoYTogNSxcbiAgICB0cmlnZ2VyUmVsZWFzZTogZmFsc2VcbiAgfSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIF9wcm9wcyksXG4gICAgICBidWZmZXJEYXRhID0gdm9pZCAwLFxuICAgICAgZGVjYXlEYXRhID0gdm9pZCAwLFxuICAgICAgb3V0ID0gdm9pZCAwLFxuICAgICAgYnVmZmVyID0gdm9pZCAwLFxuICAgICAgc3VzdGFpbkNvbmRpdGlvbiA9IHZvaWQgMCxcbiAgICAgIHJlbGVhc2VBY2N1bSA9IHZvaWQgMCxcbiAgICAgIHJlbGVhc2VDb25kaXRpb24gPSB2b2lkIDA7XG5cbiAgLy8gc2xpZ2h0bHkgbW9yZSBlZmZpY2llbnQgdG8gdXNlIGV4aXN0aW5nIHBoYXNlIGFjY3VtdWxhdG9yIGZvciBsaW5lYXIgZW52ZWxvcGVzXG4gIC8vaWYoIHByb3BzLnNoYXBlID09PSAnbGluZWFyJyApIHtcbiAgLy8gIG91dCA9IGlmZWxzZShcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICksIG1lbW8oIGRpdiggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKSApLFxuICAvLyAgICBsdCggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKyBwcm9wcy5kZWNheVRpbWUgKSwgc3ViKCAxLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSApLCBwcm9wcy5kZWNheVRpbWUgKSwgMS1wcm9wcy5zdXN0YWluTGV2ZWwgKSApLFxuICAvLyAgICBsdCggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKyBwcm9wcy5kZWNheVRpbWUgKyBwcm9wcy5zdXN0YWluVGltZSApLFxuICAvLyAgICAgIHByb3BzLnN1c3RhaW5MZXZlbCxcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICsgcHJvcHMuZGVjYXlUaW1lICsgcHJvcHMuc3VzdGFpblRpbWUgKyBwcm9wcy5yZWxlYXNlVGltZSApLFxuICAvLyAgICAgIHN1YiggcHJvcHMuc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSArIHByb3BzLmRlY2F5VGltZSArIHByb3BzLnN1c3RhaW5UaW1lICksIHByb3BzLnJlbGVhc2VUaW1lICksIHByb3BzLnN1c3RhaW5MZXZlbCkgKSxcbiAgLy8gICAgMFxuICAvLyAgKVxuICAvL30gZWxzZSB7ICAgIFxuICBidWZmZXJEYXRhID0gZW52KDEwMjQsIHsgdHlwZTogcHJvcHMuc2hhcGUsIGFscGhhOiBwcm9wcy5hbHBoYSB9KTtcblxuICBzdXN0YWluQ29uZGl0aW9uID0gcHJvcHMudHJpZ2dlclJlbGVhc2UgPyBzaG91bGRTdXN0YWluIDogbHQocGhhc2UsIGF0dGFja1RpbWUgKyBkZWNheVRpbWUgKyBzdXN0YWluVGltZSk7XG5cbiAgcmVsZWFzZUFjY3VtID0gcHJvcHMudHJpZ2dlclJlbGVhc2UgPyBndHAoc3ViKHN1c3RhaW5MZXZlbCwgYWNjdW0oc3VzdGFpbkxldmVsIC8gcmVsZWFzZVRpbWUsIDAsIHsgc2hvdWxkV3JhcDogZmFsc2UgfSkpLCAwKSA6IHN1YihzdXN0YWluTGV2ZWwsIG11bChkaXYoc3ViKHBoYXNlLCBhdHRhY2tUaW1lICsgZGVjYXlUaW1lICsgc3VzdGFpblRpbWUpLCByZWxlYXNlVGltZSksIHN1c3RhaW5MZXZlbCkpLCByZWxlYXNlQ29uZGl0aW9uID0gcHJvcHMudHJpZ2dlclJlbGVhc2UgPyBub3Qoc2hvdWxkU3VzdGFpbikgOiBsdChwaGFzZSwgYXR0YWNrVGltZSArIGRlY2F5VGltZSArIHN1c3RhaW5UaW1lICsgcmVsZWFzZVRpbWUpO1xuXG4gIG91dCA9IGlmZWxzZShcbiAgLy8gYXR0YWNrXG4gIGx0KHBoYXNlLCBhdHRhY2tUaW1lKSwgcGVlayhidWZmZXJEYXRhLCBkaXYocGhhc2UsIGF0dGFja1RpbWUpLCB7IGJvdW5kbW9kZTogJ2NsYW1wJyB9KSxcblxuICAvLyBkZWNheVxuICBsdChwaGFzZSwgYXR0YWNrVGltZSArIGRlY2F5VGltZSksIHBlZWsoYnVmZmVyRGF0YSwgc3ViKDEsIG11bChkaXYoc3ViKHBoYXNlLCBhdHRhY2tUaW1lKSwgZGVjYXlUaW1lKSwgc3ViKDEsIHN1c3RhaW5MZXZlbCkpKSwgeyBib3VuZG1vZGU6ICdjbGFtcCcgfSksXG5cbiAgLy8gc3VzdGFpblxuICBzdXN0YWluQ29uZGl0aW9uLCBwZWVrKGJ1ZmZlckRhdGEsIHN1c3RhaW5MZXZlbCksXG5cbiAgLy8gcmVsZWFzZVxuICByZWxlYXNlQ29uZGl0aW9uLCAvL2x0KCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lICsgIHJlbGVhc2VUaW1lICksXG4gIHBlZWsoYnVmZmVyRGF0YSwgcmVsZWFzZUFjY3VtLFxuICAvL3N1YiggIHN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSksICByZWxlYXNlVGltZSApLCAgc3VzdGFpbkxldmVsICkgKSxcbiAgeyBib3VuZG1vZGU6ICdjbGFtcCcgfSksIDApO1xuICAvL31cblxuICBvdXQudHJpZ2dlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBzaG91bGRTdXN0YWluLnZhbHVlID0gMTtcbiAgICBlbnZUcmlnZ2VyLnRyaWdnZXIoKTtcbiAgfTtcblxuICBvdXQucmVsZWFzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBzaG91bGRTdXN0YWluLnZhbHVlID0gMDtcbiAgICAvLyBYWFggcHJldHR5IG5hc3R5Li4uIGdyYWJzIGFjY3VtIGluc2lkZSBvZiBndHAgYW5kIHJlc2V0cyB2YWx1ZSBtYW51YWxseVxuICAgIC8vIHVuZm9ydHVuYXRlbHkgZW52VHJpZ2dlciB3b24ndCB3b3JrIGFzIGl0J3MgYmFjayB0byAwIGJ5IHRoZSB0aW1lIHRoZSByZWxlYXNlIGJsb2NrIGlzIHRyaWdnZXJlZC4uLlxuICAgIGdlbi5tZW1vcnkuaGVhcFtyZWxlYXNlQWNjdW0uaW5wdXRzWzBdLmlucHV0c1sxXS5tZW1vcnkudmFsdWUuaWR4XSA9IDA7XG4gIH07XG5cbiAgcmV0dXJuIG91dDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdhbmQnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgb3V0ID0gdm9pZCAwO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJyArIGlucHV0c1swXSArICcgIT09IDAgJiYgJyArIGlucHV0c1sxXSArICcgIT09IDAgfCAwXFxuXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJycgKyB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gWycnICsgdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIGluMikge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBpbjJdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2FzaW4nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKHsgJ2FzaW4nOiBNYXRoLmFzaW4gfSk7XG5cbiAgICAgIG91dCA9ICdnZW4uYXNpbiggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYXNpbihwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIGFzaW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBhc2luLmlucHV0cyA9IFt4XTtcbiAgYXNpbi5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIGFzaW4ubmFtZSA9IGFzaW4uYmFzZW5hbWUgKyAne2FzaW4uaWR9JztcblxuICByZXR1cm4gYXNpbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdhdGFuJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICdhdGFuJzogTWF0aC5hdGFuIH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLmF0YW4oICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmF0YW4ocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBhdGFuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgYXRhbi5pbnB1dHMgPSBbeF07XG4gIGF0YW4uaWQgPSBfZ2VuLmdldFVJRCgpO1xuICBhdGFuLm5hbWUgPSBhdGFuLmJhc2VuYW1lICsgJ3thdGFuLmlkfSc7XG5cbiAgcmV0dXJuIGF0YW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoJy4vaGlzdG9yeS5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRlY2F5VGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDQ0MTAwIDogYXJndW1lbnRzWzBdO1xuXG4gICAgdmFyIHNzZCA9IGhpc3RvcnkoMSksXG4gICAgICAgIHQ2MCA9IE1hdGguZXhwKC02LjkwNzc1NTI3ODkyMSAvIGRlY2F5VGltZSk7XG5cbiAgICBzc2QuaW4obXVsKHNzZC5vdXQsIHQ2MCkpO1xuXG4gICAgc3NkLm91dC50cmlnZ2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzc2QudmFsdWUgPSAxO1xuICAgIH07XG5cbiAgICByZXR1cm4gc3ViKDEsIHNzZC5vdXQpO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICBfZ2VuLnJlcXVlc3RNZW1vcnkodGhpcy5tZW1vcnkpO1xuXG4gICAgdmFyIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9IG1lbW9yeVsnICsgdGhpcy5tZW1vcnkudmFsdWUuaWR4ICsgJ11cXG4gIGlmKCAnICsgdGhpcy5uYW1lICsgJyA9PT0gMSApIG1lbW9yeVsnICsgdGhpcy5tZW1vcnkudmFsdWUuaWR4ICsgJ10gPSAwICAgICAgXFxuICAgICAgXFxuJztcbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChfcHJvcHMpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBtaW46IDAsIG1heDogMSB9LCBfcHJvcHMpO1xuXG4gIHVnZW4ubmFtZSA9ICdiYW5nJyArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgdWdlbi5taW4gPSBwcm9wcy5taW47XG4gIHVnZW4ubWF4ID0gcHJvcHMubWF4O1xuXG4gIHVnZW4udHJpZ2dlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBfZ2VuLm1lbW9yeS5oZWFwW3VnZW4ubWVtb3J5LnZhbHVlLmlkeF0gPSB1Z2VuLm1heDtcbiAgfTtcblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9XG4gIH07XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnYm9vbCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBvdXQgPSBpbnB1dHNbMF0gKyAnID09PSAwID8gMCA6IDEnO1xuXG4gICAgLy9nZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YFxuXG4gICAgLy9yZXR1cm4gWyBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YCwgJyAnICtvdXQgXVxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSkge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjFdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnY2VpbCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIE1hdGguY2VpbCkpO1xuXG4gICAgICBvdXQgPSAnZ2VuLmNlaWwoICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmNlaWwocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBjZWlsID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgY2VpbC5pbnB1dHMgPSBbeF07XG5cbiAgcmV0dXJuIGNlaWw7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yID0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnY2xpcCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGNvZGUgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBvdXQgPSAnIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICcgKyBpbnB1dHNbMF0gKyAnXFxuICBpZiggJyArIHRoaXMubmFtZSArICcgPiAnICsgaW5wdXRzWzJdICsgJyApICcgKyB0aGlzLm5hbWUgKyAnID0gJyArIGlucHV0c1syXSArICdcXG4gIGVsc2UgaWYoICcgKyB0aGlzLm5hbWUgKyAnIDwgJyArIGlucHV0c1sxXSArICcgKSAnICsgdGhpcy5uYW1lICsgJyA9ICcgKyBpbnB1dHNbMV0gKyAnXFxuJztcbiAgICBvdXQgPSAnICcgKyBvdXQ7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgdmFyIG1pbiA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IC0xIDogYXJndW1lbnRzWzFdO1xuICB2YXIgbWF4ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gMSA6IGFyZ3VtZW50c1syXTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG1pbjogbWluLFxuICAgIG1heDogbWF4LFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjEsIG1pbiwgbWF4XVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdjb3MnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKHsgJ2Nvcyc6IE1hdGguY29zIH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLmNvcyggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY29zKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgY29zID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgY29zLmlucHV0cyA9IFt4XTtcbiAgY29zLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgY29zLm5hbWUgPSBjb3MuYmFzZW5hbWUgKyAne2Nvcy5pZH0nO1xuXG4gIHJldHVybiBjb3M7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnY291bnRlcicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGNvZGUgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHkgPSB2b2lkIDA7XG5cbiAgICBpZiAodGhpcy5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsKSBfZ2VuLnJlcXVlc3RNZW1vcnkodGhpcy5tZW1vcnkpO1xuICAgIGZ1bmN0aW9uQm9keSA9IHRoaXMuY2FsbGJhY2soZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sIGlucHV0c1syXSwgaW5wdXRzWzNdLCAnbWVtb3J5WycgKyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggKyAnXScsICdtZW1vcnlbJyArIHRoaXMubWVtb3J5LndyYXAuaWR4ICsgJ10nKTtcblxuICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCB0aGlzKSk7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZSArICdfdmFsdWUnO1xuXG4gICAgaWYgKF9nZW4ubWVtb1t0aGlzLndyYXAubmFtZV0gPT09IHVuZGVmaW5lZCkgdGhpcy53cmFwLmdlbigpO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5XTtcbiAgfSxcbiAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKF9uYW1lLCBfaW5jciwgX21pbiwgX21heCwgX3Jlc2V0LCB2YWx1ZVJlZiwgd3JhcFJlZikge1xuICAgIHZhciBkaWZmID0gdGhpcy5tYXggLSB0aGlzLm1pbixcbiAgICAgICAgb3V0ID0gJycsXG4gICAgICAgIHdyYXAgPSAnJztcblxuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiAoISh0eXBlb2YgdGhpcy5pbnB1dHNbM10gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzNdIDwgMSkpIHtcbiAgICAgIG91dCArPSAnICBpZiggJyArIF9yZXNldCArICcgPj0gMSApICcgKyB2YWx1ZVJlZiArICcgPSAnICsgX21pbiArICdcXG4nO1xuICAgIH1cblxuICAgIG91dCArPSAnICB2YXIgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgdmFsdWVSZWYgKyAnO1xcbiAgJyArIHZhbHVlUmVmICsgJyArPSAnICsgX2luY3IgKyAnXFxuJzsgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgXG5cbiAgICBpZiAodHlwZW9mIHRoaXMubWF4ID09PSAnbnVtYmVyJyAmJiB0aGlzLm1heCAhPT0gSW5maW5pdHkgJiYgdHlwZW9mIHRoaXMubWluID09PSAnbnVtYmVyJykge1xuICAgICAgd3JhcCA9ICcgIGlmKCAnICsgdmFsdWVSZWYgKyAnID49ICcgKyB0aGlzLm1heCArICcgKSB7XFxuICAgICcgKyB2YWx1ZVJlZiArICcgLT0gJyArIGRpZmYgKyAnXFxuICAgICcgKyB3cmFwUmVmICsgJyA9IDFcXG4gIH1lbHNle1xcbiAgICAnICsgd3JhcFJlZiArICcgPSAwXFxuICB9XFxuJztcbiAgICB9IGVsc2UgaWYgKHRoaXMubWF4ICE9PSBJbmZpbml0eSkge1xuICAgICAgd3JhcCA9ICcgIGlmKCAnICsgdmFsdWVSZWYgKyAnID49ICcgKyBfbWF4ICsgJyApIHtcXG4gICAgJyArIHZhbHVlUmVmICsgJyAtPSAnICsgX21heCArICcgLSAnICsgX21pbiArICdcXG4gICAgJyArIHdyYXBSZWYgKyAnID0gMVxcbiAgfWVsc2UgaWYoICcgKyB2YWx1ZVJlZiArICcgPCAnICsgX21pbiArICcgKSB7XFxuICAgICcgKyB2YWx1ZVJlZiArICcgKz0gJyArIF9tYXggKyAnIC0gJyArIF9taW4gKyAnXFxuICAgICcgKyB3cmFwUmVmICsgJyA9IDFcXG4gIH1lbHNle1xcbiAgICAnICsgd3JhcFJlZiArICcgPSAwXFxuICB9XFxuJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9ICdcXG4nO1xuICAgIH1cblxuICAgIG91dCA9IG91dCArIHdyYXA7XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGluY3IgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyAxIDogYXJndW1lbnRzWzBdO1xuICB2YXIgbWluID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1sxXTtcbiAgdmFyIG1heCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IEluZmluaXR5IDogYXJndW1lbnRzWzJdO1xuICB2YXIgcmVzZXQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyAwIDogYXJndW1lbnRzWzNdO1xuICB2YXIgcHJvcGVydGllcyA9IGFyZ3VtZW50c1s0XTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXRpYWxWYWx1ZTogMCB9O1xuXG4gIGlmIChwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG1pbjogbWluLFxuICAgIG1heDogbWF4LFxuICAgIHZhbHVlOiBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luY3IsIG1pbiwgbWF4LCByZXNldF0sXG4gICAgbWVtb3J5OiB7XG4gICAgICB2YWx1ZTogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9LFxuICAgICAgd3JhcDogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9XG4gICAgfSxcbiAgICB3cmFwOiB7XG4gICAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgICAgaWYgKHVnZW4ubWVtb3J5LndyYXAuaWR4ID09PSBudWxsKSB7XG4gICAgICAgICAgX2dlbi5yZXF1ZXN0TWVtb3J5KHVnZW4ubWVtb3J5KTtcbiAgICAgICAgfVxuICAgICAgICBfZ2VuLmdldElucHV0cyh0aGlzKTtcbiAgICAgICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSAnbWVtb3J5WyAnICsgdWdlbi5tZW1vcnkud3JhcC5pZHggKyAnIF0nO1xuICAgICAgICByZXR1cm4gJ21lbW9yeVsgJyArIHVnZW4ubWVtb3J5LndyYXAuaWR4ICsgJyBdJztcbiAgICAgIH1cbiAgICB9XG4gIH0sIGRlZmF1bHRzKTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgaWYgKHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gX2dlbi5tZW1vcnkuaGVhcFt0aGlzLm1lbW9yeS52YWx1ZS5pZHhdO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodikge1xuICAgICAgaWYgKHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCkge1xuICAgICAgICBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF0gPSB2O1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgdWdlbi53cmFwLmlucHV0cyA9IFt1Z2VuXTtcbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG4gIHVnZW4ud3JhcC5uYW1lID0gdWdlbi5uYW1lICsgJ193cmFwJztcbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgYWNjdW0gPSByZXF1aXJlKCcuL3BoYXNvci5qcycpLFxuICAgIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBwaGFzb3IgPSByZXF1aXJlKCcuL3BoYXNvci5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnY3ljbGUnLFxuXG4gIGluaXRUYWJsZTogZnVuY3Rpb24gaW5pdFRhYmxlKCkge1xuICAgIHZhciBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KDEwMjQpO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBidWZmZXIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBidWZmZXJbaV0gPSBNYXRoLnNpbihpIC8gbCAqIChNYXRoLlBJICogMikpO1xuICAgIH1cblxuICAgIGdlbi5nbG9iYWxzLmN5Y2xlID0gZGF0YShidWZmZXIsIDEsIHsgaW1tdXRhYmxlOiB0cnVlIH0pO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZyZXF1ZW5jeSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbMF07XG4gIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMV07XG5cbiAgaWYgKGdlbi5nbG9iYWxzLmN5Y2xlID09PSB1bmRlZmluZWQpIHByb3RvLmluaXRUYWJsZSgpO1xuXG4gIHZhciB1Z2VuID0gcGVlayhnZW4uZ2xvYmFscy5jeWNsZSwgcGhhc29yKGZyZXF1ZW5jeSwgcmVzZXQsIHsgbWluOiAwIH0pKTtcbiAgdWdlbi5uYW1lID0gJ2N5Y2xlJyArIGdlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgdXRpbGl0aWVzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnZGF0YScsXG4gIGdsb2JhbHM6IHt9LFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpZHggPSB2b2lkIDA7XG4gICAgaWYgKF9nZW4ubWVtb1t0aGlzLm5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciB1Z2VuID0gdGhpcztcbiAgICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSwgdGhpcy5pbW11dGFibGUpO1xuICAgICAgaWR4ID0gdGhpcy5tZW1vcnkudmFsdWVzLmlkeDtcbiAgICAgIHRyeSB7XG4gICAgICAgIF9nZW4ubWVtb3J5LmhlYXAuc2V0KHRoaXMuYnVmZmVyLCBpZHgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ2Vycm9yIHdpdGggcmVxdWVzdC4gYXNraW5nIGZvciAnICsgdGhpcy5idWZmZXIubGVuZ3RoICsgJy4gY3VycmVudCBpbmRleDogJyArIF9nZW4ubWVtb3J5SW5kZXggKyAnIG9mICcgKyBfZ2VuLm1lbW9yeS5oZWFwLmxlbmd0aCk7XG4gICAgICB9XG4gICAgICAvL2dlbi5kYXRhWyB0aGlzLm5hbWUgXSA9IHRoaXNcbiAgICAgIC8vcmV0dXJuICdnZW4ubWVtb3J5JyArIHRoaXMubmFtZSArICcuYnVmZmVyJ1xuICAgICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSBpZHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlkeCA9IF9nZW4ubWVtb1t0aGlzLm5hbWVdO1xuICAgIH1cbiAgICByZXR1cm4gaWR4O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciB5ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMSA6IGFyZ3VtZW50c1sxXTtcbiAgdmFyIHByb3BlcnRpZXMgPSBhcmd1bWVudHNbMl07XG5cbiAgdmFyIHVnZW4gPSB2b2lkIDAsXG4gICAgICBidWZmZXIgPSB2b2lkIDAsXG4gICAgICBzaG91bGRMb2FkID0gZmFsc2U7XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKF9nZW4uZ2xvYmFsc1twcm9wZXJ0aWVzLmdsb2JhbF0pIHtcbiAgICAgIHJldHVybiBfZ2VuLmdsb2JhbHNbcHJvcGVydGllcy5nbG9iYWxdO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlb2YgeCA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAoeSAhPT0gMSkge1xuICAgICAgYnVmZmVyID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHk7IGkrKykge1xuICAgICAgICBidWZmZXJbaV0gPSBuZXcgRmxvYXQzMkFycmF5KHgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHgpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHgpKSB7XG4gICAgLy8hICh4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkgKSB7XG4gICAgdmFyIHNpemUgPSB4Lmxlbmd0aDtcbiAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHNpemUpO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCB4Lmxlbmd0aDsgX2krKykge1xuICAgICAgYnVmZmVyW19pXSA9IHhbX2ldO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgeCA9PT0gJ3N0cmluZycpIHtcbiAgICBidWZmZXIgPSB7IGxlbmd0aDogeSA+IDEgPyB5IDogX2dlbi5zYW1wbGVyYXRlICogNjAgfTtcbiAgICBzaG91bGRMb2FkID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICh4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KSB7XG4gICAgYnVmZmVyID0geDtcbiAgfVxuXG4gIHVnZW4gPSB7XG4gICAgYnVmZmVyOiBidWZmZXIsXG4gICAgbmFtZTogcHJvdG8uYmFzZW5hbWUgKyBfZ2VuLmdldFVJRCgpLFxuICAgIGRpbTogYnVmZmVyLmxlbmd0aCxcbiAgICBjaGFubmVsczogMSxcbiAgICBnZW46IHByb3RvLmdlbixcbiAgICBvbmxvYWQ6IG51bGwsXG4gICAgdGhlbjogZnVuY3Rpb24gdGhlbihmbmMpIHtcbiAgICAgIHVnZW4ub25sb2FkID0gZm5jO1xuICAgICAgcmV0dXJuIHVnZW47XG4gICAgfSxcblxuICAgIGltbXV0YWJsZTogcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuaW1tdXRhYmxlID09PSB0cnVlID8gdHJ1ZSA6IGZhbHNlXG4gIH07XG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWVzOiB7IGxlbmd0aDogdWdlbi5kaW0sIGlkeDogbnVsbCB9XG4gIH07XG5cbiAgX2dlbi5uYW1lID0gJ2RhdGEnICsgX2dlbi5nZXRVSUQoKTtcblxuICBpZiAoc2hvdWxkTG9hZCkge1xuICAgIHZhciBwcm9taXNlID0gdXRpbGl0aWVzLmxvYWRTYW1wbGUoeCwgdWdlbik7XG4gICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChfYnVmZmVyKSB7XG4gICAgICB1Z2VuLm1lbW9yeS52YWx1ZXMubGVuZ3RoID0gX2J1ZmZlci5sZW5ndGg7XG4gICAgICB1Z2VuLm9ubG9hZCgpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmIChwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBfZ2VuLmdsb2JhbHNbcHJvcGVydGllcy5nbG9iYWxdID0gdWdlbjtcbiAgICB9XG4gICAgaWYgKHByb3BlcnRpZXMubWV0YSA9PT0gdHJ1ZSkge1xuICAgICAgdmFyIF9sb29wID0gZnVuY3Rpb24gX2xvb3AobGVuZ3RoLCBfaTIpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHVnZW4sIF9pMiwge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHBlZWsodWdlbiwgX2kyLCB7IG1vZGU6ICdzaW1wbGUnLCBpbnRlcnA6ICdub25lJyB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogZnVuY3Rpb24gc2V0KHYpIHtcbiAgICAgICAgICAgIHJldHVybiBwb2tlKHVnZW4sIHYsIF9pMik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIGZvciAodmFyIF9pMiA9IDAsIGxlbmd0aCA9IHVnZW4uYnVmZmVyLmxlbmd0aDsgX2kyIDwgbGVuZ3RoOyBfaTIrKykge1xuICAgICAgICBfbG9vcChsZW5ndGgsIF9pMik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoJy4vaGlzdG9yeS5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xKSB7XG4gICAgdmFyIHgxID0gaGlzdG9yeSgpLFxuICAgICAgICB5MSA9IGhpc3RvcnkoKSxcbiAgICAgICAgZmlsdGVyID0gdm9pZCAwO1xuXG4gICAgLy9IaXN0b3J5IHgxLCB5MTsgeSA9IGluMSAtIHgxICsgeTEqMC45OTk3OyB4MSA9IGluMTsgeTEgPSB5OyBvdXQxID0geTtcbiAgICBmaWx0ZXIgPSBtZW1vKGFkZChzdWIoaW4xLCB4MS5vdXQpLCBtdWwoeTEub3V0LCAuOTk5NykpKTtcbiAgICB4MS5pbihpbjEpO1xuICAgIHkxLmluKGZpbHRlcik7XG5cbiAgICByZXR1cm4gZmlsdGVyO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCcuL2hpc3RvcnkuanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHQ2MCA9IHJlcXVpcmUoJy4vdDYwLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZGVjYXlUaW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gNDQxMDAgOiBhcmd1bWVudHNbMF07XG5cbiAgdmFyIHNzZCA9IGhpc3RvcnkoMSk7XG5cbiAgc3NkLmluKG11bChzc2Qub3V0LCB0NjAoZGVjYXlUaW1lKSkpO1xuXG4gIHNzZC5vdXQudHJpZ2dlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBzc2QudmFsdWUgPSAxO1xuICB9O1xuXG4gIHJldHVybiBzc2Qub3V0O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBkYXRhID0gcmVxdWlyZSgnLi9kYXRhLmpzJyksXG4gICAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpLFxuICAgIHdyYXAgPSByZXF1aXJlKCcuL3dyYXAuanMnKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoJy4vYWNjdW0uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2RlbGF5JyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IGlucHV0c1swXTtcblxuICAgIHJldHVybiBpbnB1dHNbMF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgdGFwc0FuZFByb3BlcnRpZXMgPSBBcnJheShfbGVuID4gMiA/IF9sZW4gLSAyIDogMCksIF9rZXkgPSAyOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgdGFwc0FuZFByb3BlcnRpZXNbX2tleSAtIDJdID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgdmFyIHRpbWUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAyNTYgOiBhcmd1bWVudHNbMV07XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGRlZmF1bHRzID0geyBzaXplOiA1MTIsIGZlZWRiYWNrOiAwLCBpbnRlcnA6ICdsaW5lYXInIH0sXG4gICAgICB3cml0ZUlkeCA9IHZvaWQgMCxcbiAgICAgIHJlYWRJZHggPSB2b2lkIDAsXG4gICAgICBkZWxheWRhdGEgPSB2b2lkIDAsXG4gICAgICBwcm9wZXJ0aWVzID0gdm9pZCAwLFxuICAgICAgdGFwVGltZXMgPSBbdGltZV0sXG4gICAgICB0YXBzID0gdm9pZCAwO1xuXG4gIGlmIChBcnJheS5pc0FycmF5KHRhcHNBbmRQcm9wZXJ0aWVzKSkge1xuICAgIHByb3BlcnRpZXMgPSB0YXBzQW5kUHJvcGVydGllc1t0YXBzQW5kUHJvcGVydGllcy5sZW5ndGggLSAxXTtcbiAgICBpZiAodGFwc0FuZFByb3BlcnRpZXMubGVuZ3RoID4gMSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXBzQW5kUHJvcGVydGllcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgdGFwVGltZXMucHVzaCh0YXBzQW5kUHJvcGVydGllc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgcHJvcGVydGllcyk7XG5cbiAgaWYgKGRlZmF1bHRzLnNpemUgPCB0aW1lKSBkZWZhdWx0cy5zaXplID0gdGltZTtcblxuICBkZWxheWRhdGEgPSBkYXRhKGRlZmF1bHRzLnNpemUpO1xuXG4gIHVnZW4uaW5wdXRzID0gW107XG5cbiAgd3JpdGVJZHggPSBhY2N1bSgxLCAwLCB7IG1heDogZGVmYXVsdHMuc2l6ZSB9KTtcblxuICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgdGFwVGltZXMubGVuZ3RoOyBfaSsrKSB7XG4gICAgdWdlbi5pbnB1dHNbX2ldID0gcGVlayhkZWxheWRhdGEsIHdyYXAoc3ViKHdyaXRlSWR4LCB0YXBUaW1lc1tfaV0pLCAwLCBkZWZhdWx0cy5zaXplKSwgeyBtb2RlOiAnc2FtcGxlcycsIGludGVycDogZGVmYXVsdHMuaW50ZXJwIH0pO1xuICB9XG5cbiAgdWdlbi5vdXRwdXRzID0gdWdlbi5pbnB1dHM7IC8vIHVnbiwgVWdoLCBVR0ghIGJ1dCBpIGd1ZXNzIGl0IHdvcmtzLlxuXG4gIHBva2UoZGVsYXlkYXRhLCBpbjEsIHdyaXRlSWR4KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCcuL2hpc3RvcnkuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgdmFyIG4xID0gaGlzdG9yeSgpO1xuXG4gIG4xLmluKGluMSk7XG5cbiAgdmFyIHVnZW4gPSBzdWIoaW4xLCBuMS5vdXQpO1xuICB1Z2VuLm5hbWUgPSAnZGVsdGEnICsgZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciBkaXYgPSB7XG4gICAgaWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgICAgb3V0ID0gJygnLFxuICAgICAgICAgIGRpZmYgPSAwLFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWzBdLFxuICAgICAgICAgIGxhc3ROdW1iZXJJc1VnZW4gPSBpc05hTihsYXN0TnVtYmVyKSxcbiAgICAgICAgICBkaXZBdEVuZCA9IGZhbHNlO1xuXG4gICAgICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xuICAgICAgICBpZiAoaSA9PT0gMCkgcmV0dXJuO1xuXG4gICAgICAgIHZhciBpc051bWJlclVnZW4gPSBpc05hTih2KSxcbiAgICAgICAgICAgIGlzRmluYWxJZHggPSBpID09PSBpbnB1dHMubGVuZ3RoIC0gMTtcblxuICAgICAgICBpZiAoIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbikge1xuICAgICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC8gdjtcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlciArICcgLyAnICsgdjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNGaW5hbElkeCkgb3V0ICs9ICcgLyAnO1xuICAgICAgfSk7XG5cbiAgICAgIG91dCArPSAnKSc7XG5cbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBkaXY7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuJyksXG4gICAgd2luZG93cyA9IHJlcXVpcmUoJy4vd2luZG93cycpLFxuICAgIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrJyksXG4gICAgcGhhc29yID0gcmVxdWlyZSgnLi9waGFzb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyAxMTAyNSA6IGFyZ3VtZW50c1swXTtcbiAgdmFyIHByb3BlcnRpZXMgPSBhcmd1bWVudHNbMV07XG5cbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIHR5cGU6ICdUcmlhbmd1bGFyJyxcbiAgICBidWZmZXJMZW5ndGg6IDEwMjQsXG4gICAgYWxwaGE6IC4xNVxuICB9LFxuICAgICAgZnJlcXVlbmN5ID0gbGVuZ3RoIC8gZ2VuLnNhbXBsZXJhdGUsXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBwcm9wZXJ0aWVzKSxcbiAgICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkocHJvcHMuYnVmZmVyTGVuZ3RoKTtcblxuICBpZiAoZ2VuLmdsb2JhbHMud2luZG93c1twcm9wcy50eXBlXSA9PT0gdW5kZWZpbmVkKSBnZW4uZ2xvYmFscy53aW5kb3dzW3Byb3BzLnR5cGVdID0ge307XG5cbiAgaWYgKGdlbi5nbG9iYWxzLndpbmRvd3NbcHJvcHMudHlwZV1bcHJvcHMuYnVmZmVyTGVuZ3RoXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5idWZmZXJMZW5ndGg7IGkrKykge1xuICAgICAgYnVmZmVyW2ldID0gd2luZG93c1twcm9wcy50eXBlXShwcm9wcy5idWZmZXJMZW5ndGgsIGksIHByb3BzLmFscGhhKTtcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy53aW5kb3dzW3Byb3BzLnR5cGVdW3Byb3BzLmJ1ZmZlckxlbmd0aF0gPSBkYXRhKGJ1ZmZlcik7XG4gIH1cblxuICB2YXIgdWdlbiA9IGdlbi5nbG9iYWxzLndpbmRvd3NbcHJvcHMudHlwZV1bcHJvcHMuYnVmZmVyTGVuZ3RoXTsgLy9wZWVrKCBnZW4uZ2xvYmFscy53aW5kb3dzWyBwcm9wcy50eXBlIF1bIHByb3BzLmJ1ZmZlckxlbmd0aCBdLCBwaGFzb3IoIGZyZXF1ZW5jeSwgMCwgeyBtaW46MCB9ICkpXG4gIHVnZW4ubmFtZSA9ICdlbnYnICsgZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2VxJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIG91dCA9IHRoaXMuaW5wdXRzWzBdID09PSB0aGlzLmlucHV0c1sxXSA/IDEgOiAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnICsgaW5wdXRzWzBdICsgJyA9PT0gJyArIGlucHV0c1sxXSArICcgfCAwXFxuXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJycgKyB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gWycnICsgdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIGluMikge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBpbjJdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnZmxvb3InLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIC8vZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguZmxvb3IgfSlcblxuICAgICAgb3V0ID0gJyggJyArIGlucHV0c1swXSArICcgfCAwICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gfCAwO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIGZsb29yID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgZmxvb3IuaW5wdXRzID0gW3hdO1xuXG4gIHJldHVybiBmbG9vcjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdmb2xkJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgY29kZSA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIG91dCA9IHRoaXMuY3JlYXRlQ2FsbGJhY2soaW5wdXRzWzBdLCB0aGlzLm1pbiwgdGhpcy5tYXgpO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJztcblxuICAgIHJldHVybiBbdGhpcy5uYW1lICsgJ192YWx1ZScsIG91dF07XG4gIH0sXG4gIGNyZWF0ZUNhbGxiYWNrOiBmdW5jdGlvbiBjcmVhdGVDYWxsYmFjayh2LCBsbywgaGkpIHtcbiAgICB2YXIgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgdiArICcsXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfcmFuZ2UgPSAnICsgaGkgKyAnIC0gJyArIGxvICsgJyxcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwcyA9IDBcXG5cXG4gIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlID49ICcgKyBoaSArICcpe1xcbiAgICAnICsgdGhpcy5uYW1lICsgJ192YWx1ZSAtPSAnICsgdGhpcy5uYW1lICsgJ19yYW5nZVxcbiAgICBpZignICsgdGhpcy5uYW1lICsgJ192YWx1ZSA+PSAnICsgaGkgKyAnKXtcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwcyA9ICgoJyArIHRoaXMubmFtZSArICdfdmFsdWUgLSAnICsgbG8gKyAnKSAvICcgKyB0aGlzLm5hbWUgKyAnX3JhbmdlKSB8IDBcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ192YWx1ZSAtPSAnICsgdGhpcy5uYW1lICsgJ19yYW5nZSAqICcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzXFxuICAgIH1cXG4gICAgJyArIHRoaXMubmFtZSArICdfbnVtV3JhcHMrK1xcbiAgfSBlbHNlIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIDwgJyArIGxvICsgJyl7XFxuICAgICcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlICs9ICcgKyB0aGlzLm5hbWUgKyAnX3JhbmdlXFxuICAgIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIDwgJyArIGxvICsgJyl7XFxuICAgICAgJyArIHRoaXMubmFtZSArICdfbnVtV3JhcHMgPSAoKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIC0gJyArIGxvICsgJykgLyAnICsgdGhpcy5uYW1lICsgJ19yYW5nZS0gMSkgfCAwXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfdmFsdWUgLT0gJyArIHRoaXMubmFtZSArICdfcmFuZ2UgKiAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwc1xcbiAgICB9XFxuICAgICcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzLS1cXG4gIH1cXG4gIGlmKCcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzICYgMSkgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgaGkgKyAnICsgJyArIGxvICsgJyAtICcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlXFxuJztcbiAgICByZXR1cm4gJyAnICsgb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgdmFyIG1pbiA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMV07XG4gIHZhciBtYXggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyAxIDogYXJndW1lbnRzWzJdO1xuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgbWluOiBtaW4sXG4gICAgbWF4OiBtYXgsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMV1cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2dhdGUnLFxuICBjb250cm9sU3RyaW5nOiBudWxsLCAvLyBpbnNlcnQgaW50byBvdXRwdXQgY29kZWdlbiBmb3IgZGV0ZXJtaW5pbmcgaW5kZXhpbmdcbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBfZ2VuLnJlcXVlc3RNZW1vcnkodGhpcy5tZW1vcnkpO1xuXG4gICAgdmFyIGxhc3RJbnB1dE1lbW9yeUlkeCA9ICdtZW1vcnlbICcgKyB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgJyBdJyxcbiAgICAgICAgb3V0cHV0TWVtb3J5U3RhcnRJZHggPSB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgMSxcbiAgICAgICAgaW5wdXRTaWduYWwgPSBpbnB1dHNbMF0sXG4gICAgICAgIGNvbnRyb2xTaWduYWwgPSBpbnB1dHNbMV07XG5cbiAgICAvKiBcbiAgICAgKiB3ZSBjaGVjayB0byBzZWUgaWYgdGhlIGN1cnJlbnQgY29udHJvbCBpbnB1dHMgZXF1YWxzIG91ciBsYXN0IGlucHV0XG4gICAgICogaWYgc28sIHdlIHN0b3JlIHRoZSBzaWduYWwgaW5wdXQgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnRseVxuICAgICAqIHNlbGVjdGVkIGluZGV4LiBJZiBub3QsIHdlIHB1dCAwIGluIHRoZSBtZW1vcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBsYXN0IHNlbGVjdGVkIGluZGV4LFxuICAgICAqIGNoYW5nZSB0aGUgc2VsZWN0ZWQgaW5kZXgsIGFuZCB0aGVuIHN0b3JlIHRoZSBzaWduYWwgaW4gcHV0IGluIHRoZSBtZW1lcnkgYXNzb2ljYXRlZFxuICAgICAqIHdpdGggdGhlIG5ld2x5IHNlbGVjdGVkIGluZGV4XG4gICAgICovXG5cbiAgICBvdXQgPSAnIGlmKCAnICsgY29udHJvbFNpZ25hbCArICcgIT09ICcgKyBsYXN0SW5wdXRNZW1vcnlJZHggKyAnICkge1xcbiAgICBtZW1vcnlbICcgKyBsYXN0SW5wdXRNZW1vcnlJZHggKyAnICsgJyArIG91dHB1dE1lbW9yeVN0YXJ0SWR4ICsgJyAgXSA9IDAgXFxuICAgICcgKyBsYXN0SW5wdXRNZW1vcnlJZHggKyAnID0gJyArIGNvbnRyb2xTaWduYWwgKyAnXFxuICB9XFxuICBtZW1vcnlbICcgKyBvdXRwdXRNZW1vcnlTdGFydElkeCArICcgKyAnICsgY29udHJvbFNpZ25hbCArICcgXSA9ICcgKyBpbnB1dFNpZ25hbCArICdcXG5cXG4nO1xuICAgIHRoaXMuY29udHJvbFN0cmluZyA9IGlucHV0c1sxXTtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgdGhpcy5vdXRwdXRzLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiB2LmdlbigpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFtudWxsLCAnICcgKyBvdXRdO1xuICB9LFxuICBjaGlsZGdlbjogZnVuY3Rpb24gY2hpbGRnZW4oKSB7XG4gICAgaWYgKHRoaXMucGFyZW50LmluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgICAgX2dlbi5nZXRJbnB1dHModGhpcyk7IC8vIHBhcmVudCBnYXRlIGlzIG9ubHkgaW5wdXQgb2YgYSBnYXRlIG91dHB1dCwgc2hvdWxkIG9ubHkgYmUgZ2VuJ2Qgb25jZS5cbiAgICB9XG5cbiAgICBpZiAoX2dlbi5tZW1vW3RoaXMubmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgX2dlbi5yZXF1ZXN0TWVtb3J5KHRoaXMubWVtb3J5KTtcblxuICAgICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSAnbWVtb3J5WyAnICsgdGhpcy5tZW1vcnkudmFsdWUuaWR4ICsgJyBdJztcbiAgICB9XG5cbiAgICByZXR1cm4gJ21lbW9yeVsgJyArIHRoaXMubWVtb3J5LnZhbHVlLmlkeCArICcgXSc7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnRyb2wsIGluMSwgcHJvcGVydGllcykge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgZGVmYXVsdHMgPSB7IGNvdW50OiAyIH07XG5cbiAgaWYgKCh0eXBlb2YgcHJvcGVydGllcyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YocHJvcGVydGllcykpICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG91dHB1dHM6IFtdLFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjEsIGNvbnRyb2xdLFxuICAgIG1lbW9yeToge1xuICAgICAgbGFzdElucHV0OiB7IGxlbmd0aDogMSwgaWR4OiBudWxsIH1cbiAgICB9LFxuICAgIGluaXRpYWxpemVkOiBmYWxzZVxuICB9LCBkZWZhdWx0cyk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgX2dlbi5nZXRVSUQoKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHVnZW4uY291bnQ7IGkrKykge1xuICAgIHVnZW4ub3V0cHV0cy5wdXNoKHtcbiAgICAgIGluZGV4OiBpLFxuICAgICAgZ2VuOiBwcm90by5jaGlsZGdlbixcbiAgICAgIHBhcmVudDogdWdlbixcbiAgICAgIGlucHV0czogW3VnZW5dLFxuICAgICAgbWVtb3J5OiB7XG4gICAgICAgIHZhbHVlOiB7IGxlbmd0aDogMSwgaWR4OiBudWxsIH1cbiAgICAgIH0sXG4gICAgICBpbml0aWFsaXplZDogZmFsc2UsXG4gICAgICBuYW1lOiB1Z2VuLm5hbWUgKyAnX291dCcgKyBfZ2VuLmdldFVJRCgpXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBnZW4uanNcbiAqXG4gKiBsb3ctbGV2ZWwgY29kZSBnZW5lcmF0aW9uIGZvciB1bml0IGdlbmVyYXRvcnNcbiAqXG4gKi9cblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbnZhciBNZW1vcnlIZWxwZXIgPSByZXF1aXJlKCdtZW1vcnktaGVscGVyJyk7XG5cbnZhciBnZW4gPSB7XG5cbiAgYWNjdW06IDAsXG4gIGdldFVJRDogZnVuY3Rpb24gZ2V0VUlEKCkge1xuICAgIHJldHVybiB0aGlzLmFjY3VtKys7XG4gIH0sXG5cbiAgZGVidWc6IGZhbHNlLFxuICBzYW1wbGVyYXRlOiA0NDEwMCwgLy8gY2hhbmdlIG9uIGF1ZGlvY29udGV4dCBjcmVhdGlvblxuICBzaG91bGRMb2NhbGl6ZTogZmFsc2UsXG4gIGdsb2JhbHM6IHtcbiAgICB3aW5kb3dzOiB7fVxuICB9LFxuXG4gIC8qIGNsb3N1cmVzXG4gICAqXG4gICAqIEZ1bmN0aW9ucyB0aGF0IGFyZSBpbmNsdWRlZCBhcyBhcmd1bWVudHMgdG8gbWFzdGVyIGNhbGxiYWNrLiBFeGFtcGxlczogTWF0aC5hYnMsIE1hdGgucmFuZG9tIGV0Yy5cbiAgICogWFhYIFNob3VsZCBwcm9iYWJseSBiZSByZW5hbWVkIGNhbGxiYWNrUHJvcGVydGllcyBvciBzb21ldGhpbmcgc2ltaWxhci4uLiBjbG9zdXJlcyBhcmUgbm8gbG9uZ2VyIHVzZWQuXG4gICAqL1xuXG4gIGNsb3N1cmVzOiBuZXcgU2V0KCksXG4gIHBhcmFtczogbmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6IFtdLFxuICBlbmRCbG9jazogbmV3IFNldCgpLFxuICBoaXN0b3JpZXM6IG5ldyBNYXAoKSxcblxuICBtZW1vOiB7fSxcblxuICBkYXRhOiB7fSxcblxuICAvKiBleHBvcnRcbiAgICpcbiAgICogcGxhY2UgZ2VuIGZ1bmN0aW9ucyBpbnRvIGFub3RoZXIgb2JqZWN0IGZvciBlYXNpZXIgcmVmZXJlbmNlXG4gICAqL1xuXG4gIGV4cG9ydDogZnVuY3Rpb24gX2V4cG9ydChvYmopIHt9LFxuICBhZGRUb0VuZEJsb2NrOiBmdW5jdGlvbiBhZGRUb0VuZEJsb2NrKHYpIHtcbiAgICB0aGlzLmVuZEJsb2NrLmFkZCgnICAnICsgdik7XG4gIH0sXG4gIHJlcXVlc3RNZW1vcnk6IGZ1bmN0aW9uIHJlcXVlc3RNZW1vcnkobWVtb3J5U3BlYykge1xuICAgIHZhciBpbW11dGFibGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIGZvciAodmFyIGtleSBpbiBtZW1vcnlTcGVjKSB7XG4gICAgICB2YXIgcmVxdWVzdCA9IG1lbW9yeVNwZWNba2V5XTtcblxuICAgICAgcmVxdWVzdC5pZHggPSBnZW4ubWVtb3J5LmFsbG9jKHJlcXVlc3QubGVuZ3RoLCBpbW11dGFibGUpO1xuICAgIH1cbiAgfSxcblxuXG4gIC8qIGNyZWF0ZUNhbGxiYWNrXG4gICAqXG4gICAqIHBhcmFtIHVnZW4gLSBIZWFkIG9mIGdyYXBoIHRvIGJlIGNvZGVnZW4nZFxuICAgKlxuICAgKiBHZW5lcmF0ZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgYSBwYXJ0aWN1bGFyIHVnZW4gZ3JhcGguXG4gICAqIFRoZSBnZW4uY2xvc3VyZXMgcHJvcGVydHkgc3RvcmVzIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmVcbiAgICogcGFzc2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgZmluYWwgZnVuY3Rpb247IHRoZXNlIGFyZSBwcmVmaXhlZFxuICAgKiBiZWZvcmUgYW55IGRlZmluZWQgcGFyYW1zIHRoZSBncmFwaCBleHBvc2VzLiBGb3IgZXhhbXBsZSwgZ2l2ZW46XG4gICAqXG4gICAqIGdlbi5jcmVhdGVDYWxsYmFjayggYWJzKCBwYXJhbSgpICkgKVxuICAgKlxuICAgKiAuLi4gdGhlIGdlbmVyYXRlZCBmdW5jdGlvbiB3aWxsIGhhdmUgYSBzaWduYXR1cmUgb2YgKCBhYnMsIHAwICkuXG4gICAqL1xuXG4gIGNyZWF0ZUNhbGxiYWNrOiBmdW5jdGlvbiBjcmVhdGVDYWxsYmFjayh1Z2VuLCBtZW0pIHtcbiAgICB2YXIgZGVidWcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1syXTtcblxuICAgIHZhciBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkodWdlbikgJiYgdWdlbi5sZW5ndGggPiAxLFxuICAgICAgICBjYWxsYmFjayA9IHZvaWQgMCxcbiAgICAgICAgY2hhbm5lbDEgPSB2b2lkIDAsXG4gICAgICAgIGNoYW5uZWwyID0gdm9pZCAwO1xuXG4gICAgaWYgKHR5cGVvZiBtZW0gPT09ICdudW1iZXInIHx8IG1lbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBtZW0gPSBNZW1vcnlIZWxwZXIuY3JlYXRlKG1lbSk7XG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmxvZyggJ2NiIG1lbW9yeTonLCBtZW0gKVxuICAgIHRoaXMubWVtb3J5ID0gbWVtO1xuICAgIHRoaXMubWVtbyA9IHt9O1xuICAgIHRoaXMuZW5kQmxvY2suY2xlYXIoKTtcbiAgICB0aGlzLmNsb3N1cmVzLmNsZWFyKCk7XG4gICAgdGhpcy5wYXJhbXMuY2xlYXIoKTtcbiAgICB0aGlzLmdsb2JhbHMgPSB7IHdpbmRvd3M6IHt9IH07XG5cbiAgICB0aGlzLnBhcmFtZXRlcnMubGVuZ3RoID0gMDtcblxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gXCIgICd1c2Ugc3RyaWN0J1xcbiAgdmFyIG1lbW9yeSA9IGdlbi5tZW1vcnlcXG5cXG5cIjtcblxuICAgIC8vIGNhbGwgLmdlbigpIG9uIHRoZSBoZWFkIG9mIHRoZSBncmFwaCB3ZSBhcmUgZ2VuZXJhdGluZyB0aGUgY2FsbGJhY2sgZm9yXG4gICAgLy9jb25zb2xlLmxvZyggJ0hFQUQnLCB1Z2VuIClcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEgKyBpc1N0ZXJlbzsgaSsrKSB7XG4gICAgICBpZiAodHlwZW9mIHVnZW5baV0gPT09ICdudW1iZXInKSBjb250aW51ZTtcblxuICAgICAgdmFyIGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHVnZW5baV0uZ2VuKCkgOiB1Z2VuLmdlbigpLFxuICAgICAgICAgIGJvZHkgPSAnJztcblxuICAgICAgLy8gaWYgLmdlbigpIHJldHVybnMgYXJyYXksIGFkZCB1Z2VuIGNhbGxiYWNrIChncmFwaE91dHB1dFsxXSkgdG8gb3VyIG91dHB1dCBmdW5jdGlvbnMgYm9keVxuICAgICAgLy8gYW5kIHRoZW4gcmV0dXJuIG5hbWUgb2YgdWdlbi4gSWYgLmdlbigpIG9ubHkgZ2VuZXJhdGVzIGEgbnVtYmVyIChmb3IgcmVhbGx5IHNpbXBsZSBncmFwaHMpXG4gICAgICAvLyBqdXN0IHJldHVybiB0aGF0IG51bWJlciAoZ3JhcGhPdXRwdXRbMF0pLlxuICAgICAgYm9keSArPSBBcnJheS5pc0FycmF5KGNoYW5uZWwpID8gY2hhbm5lbFsxXSArICdcXG4nICsgY2hhbm5lbFswXSA6IGNoYW5uZWw7XG5cbiAgICAgIC8vIHNwbGl0IGJvZHkgdG8gaW5qZWN0IHJldHVybiBrZXl3b3JkIG9uIGxhc3QgbGluZVxuICAgICAgYm9keSA9IGJvZHkuc3BsaXQoJ1xcbicpO1xuXG4gICAgICAvL2lmKCBkZWJ1ZyApIGNvbnNvbGUubG9nKCAnZnVuY3Rpb25Cb2R5IGxlbmd0aCcsIGJvZHkgKVxuXG4gICAgICAvLyBuZXh0IGxpbmUgaXMgdG8gYWNjb21tb2RhdGUgbWVtbyBhcyBncmFwaCBoZWFkXG4gICAgICBpZiAoYm9keVtib2R5Lmxlbmd0aCAtIDFdLnRyaW0oKS5pbmRleE9mKCdsZXQnKSA+IC0xKSB7XG4gICAgICAgIGJvZHkucHVzaCgnXFxuJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGdldCBpbmRleCBvZiBsYXN0IGxpbmVcbiAgICAgIHZhciBsYXN0aWR4ID0gYm9keS5sZW5ndGggLSAxO1xuXG4gICAgICAvLyBpbnNlcnQgcmV0dXJuIGtleXdvcmRcbiAgICAgIGJvZHlbbGFzdGlkeF0gPSAnICBnZW4ub3V0WycgKyBpICsgJ10gID0gJyArIGJvZHlbbGFzdGlkeF0gKyAnXFxuJztcblxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gYm9keS5qb2luKCdcXG4nKTtcbiAgICB9XG5cbiAgICB0aGlzLmhpc3Rvcmllcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB2YWx1ZS5nZW4oKTtcbiAgICB9KTtcblxuICAgIHZhciByZXR1cm5TdGF0ZW1lbnQgPSBpc1N0ZXJlbyA/ICcgIHJldHVybiBnZW4ub3V0JyA6ICcgIHJldHVybiBnZW4ub3V0WzBdJztcblxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuc3BsaXQoJ1xcbicpO1xuXG4gICAgaWYgKHRoaXMuZW5kQmxvY2suc2l6ZSkge1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5jb25jYXQoQXJyYXkuZnJvbSh0aGlzLmVuZEJsb2NrKSk7XG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKHJldHVyblN0YXRlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2gocmV0dXJuU3RhdGVtZW50KTtcbiAgICB9XG4gICAgLy8gcmVhc3NlbWJsZSBmdW5jdGlvbiBib2R5XG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5qb2luKCdcXG4nKTtcblxuICAgIC8vIHdlIGNhbiBvbmx5IGR5bmFtaWNhbGx5IGNyZWF0ZSBhIG5hbWVkIGZ1bmN0aW9uIGJ5IGR5bmFtaWNhbGx5IGNyZWF0aW5nIGFub3RoZXIgZnVuY3Rpb25cbiAgICAvLyB0byBjb25zdHJ1Y3QgdGhlIG5hbWVkIGZ1bmN0aW9uISBzaGVlc2guLi5cbiAgICB2YXIgYnVpbGRTdHJpbmcgPSAncmV0dXJuIGZ1bmN0aW9uIGdlbiggJyArIHRoaXMucGFyYW1ldGVycy5qb2luKCcsJykgKyAnICl7IFxcbicgKyB0aGlzLmZ1bmN0aW9uQm9keSArICdcXG59JztcblxuICAgIGlmICh0aGlzLmRlYnVnIHx8IGRlYnVnKSBjb25zb2xlLmxvZyhidWlsZFN0cmluZyk7XG5cbiAgICBjYWxsYmFjayA9IG5ldyBGdW5jdGlvbihidWlsZFN0cmluZykoKTtcblxuICAgIC8vIGFzc2lnbiBwcm9wZXJ0aWVzIHRvIG5hbWVkIGZ1bmN0aW9uXG4gICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSB0aGlzLmNsb3N1cmVzLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgICB2YXIgZGljdCA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgIHZhciBuYW1lID0gT2JqZWN0LmtleXMoZGljdClbMF0sXG4gICAgICAgICAgICB2YWx1ZSA9IGRpY3RbbmFtZV07XG5cbiAgICAgICAgY2FsbGJhY2tbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlO1xuICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciBfbG9vcCA9IGZ1bmN0aW9uIF9sb29wKCkge1xuICAgICAgICB2YXIgZGljdCA9IF9zdGVwMi52YWx1ZTtcblxuICAgICAgICB2YXIgbmFtZSA9IE9iamVjdC5rZXlzKGRpY3QpWzBdLFxuICAgICAgICAgICAgdWdlbiA9IGRpY3RbbmFtZV07XG5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNhbGxiYWNrLCBuYW1lLCB7XG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHVnZW4udmFsdWU7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgICAgICAgICB1Z2VuLnZhbHVlID0gdjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL2NhbGxiYWNrWyBuYW1lIF0gPSB2YWx1ZVxuICAgICAgfTtcblxuICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMiA9IHRoaXMucGFyYW1zLnZhbHVlcygpW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICAgIF9sb29wKCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgICAgX2l0ZXJhdG9yRXJyb3IyID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yICYmIF9pdGVyYXRvcjIucmV0dXJuKSB7XG4gICAgICAgICAgX2l0ZXJhdG9yMi5yZXR1cm4oKTtcbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMikge1xuICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNhbGxiYWNrLmRhdGEgPSB0aGlzLmRhdGE7XG4gICAgY2FsbGJhY2sub3V0ID0gbmV3IEZsb2F0MzJBcnJheSgyKTtcbiAgICBjYWxsYmFjay5wYXJhbWV0ZXJzID0gdGhpcy5wYXJhbWV0ZXJzLnNsaWNlKDApO1xuXG4gICAgLy9pZiggTWVtb3J5SGVscGVyLmlzUHJvdG90eXBlT2YoIHRoaXMubWVtb3J5ICkgKVxuICAgIGNhbGxiYWNrLm1lbW9yeSA9IHRoaXMubWVtb3J5LmhlYXA7XG5cbiAgICB0aGlzLmhpc3Rvcmllcy5jbGVhcigpO1xuXG4gICAgcmV0dXJuIGNhbGxiYWNrO1xuICB9LFxuXG5cbiAgLyogZ2V0SW5wdXRzXG4gICAqXG4gICAqIEdpdmVuIGFuIGFyZ3VtZW50IHVnZW4sIGV4dHJhY3QgaXRzIGlucHV0cy4gSWYgdGhleSBhcmUgbnVtYmVycywgcmV0dXJuIHRoZSBudW1lYnJzLiBJZlxuICAgKiB0aGV5IGFyZSB1Z2VucywgY2FsbCAuZ2VuKCkgb24gdGhlIHVnZW4sIG1lbW9pemUgdGhlIHJlc3VsdCBhbmQgcmV0dXJuIHRoZSByZXN1bHQuIElmIHRoZVxuICAgKiB1Z2VuIGhhcyBwcmV2aW91c2x5IGJlZW4gbWVtb2l6ZWQgcmV0dXJuIHRoZSBtZW1vaXplZCB2YWx1ZS5cbiAgICpcbiAgICovXG4gIGdldElucHV0czogZnVuY3Rpb24gZ2V0SW5wdXRzKHVnZW4pIHtcbiAgICByZXR1cm4gdWdlbi5pbnB1dHMubWFwKGdlbi5nZXRJbnB1dCk7XG4gIH0sXG4gIGdldElucHV0OiBmdW5jdGlvbiBnZXRJbnB1dChpbnB1dCkge1xuICAgIHZhciBpc09iamVjdCA9ICh0eXBlb2YgaW5wdXQgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKGlucHV0KSkgPT09ICdvYmplY3QnLFxuICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IHZvaWQgMDtcblxuICAgIGlmIChpc09iamVjdCkge1xuICAgICAgLy8gaWYgaW5wdXQgaXMgYSB1Z2VuLi4uXG4gICAgICBpZiAoZ2VuLm1lbW9baW5wdXQubmFtZV0pIHtcbiAgICAgICAgLy8gaWYgaXQgaGFzIGJlZW4gbWVtb2l6ZWQuLi5cbiAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBnZW4ubWVtb1tpbnB1dC5uYW1lXTtcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcbiAgICAgICAgZ2VuLmdldElucHV0KGlucHV0WzBdKTtcbiAgICAgICAgZ2VuLmdldElucHV0KGlucHV0WzBdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIG5vdCBtZW1vaXplZCBnZW5lcmF0ZSBjb2RlIFxuICAgICAgICBpZiAodHlwZW9mIGlucHV0LmdlbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdubyBnZW4gZm91bmQ6JywgaW5wdXQsIGlucHV0Lmdlbik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvZGUgPSBpbnB1dC5nZW4oKTtcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjb2RlKSkge1xuICAgICAgICAgIGlmICghZ2VuLnNob3VsZExvY2FsaXplKSB7XG4gICAgICAgICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdlbi5jb2RlTmFtZSA9IGNvZGVbMF07XG4gICAgICAgICAgICBnZW4ubG9jYWxpemVkQ29kZS5wdXNoKGNvZGVbMV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnYWZ0ZXIgR0VOJyAsIHRoaXMuZnVuY3Rpb25Cb2R5IClcbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGl0IGlucHV0IGlzIGEgbnVtYmVyXG4gICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0O1xuICAgIH1cblxuICAgIHJldHVybiBwcm9jZXNzZWRJbnB1dDtcbiAgfSxcbiAgc3RhcnRMb2NhbGl6ZTogZnVuY3Rpb24gc3RhcnRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLmxvY2FsaXplZENvZGUgPSBbXTtcbiAgICB0aGlzLnNob3VsZExvY2FsaXplID0gdHJ1ZTtcbiAgfSxcbiAgZW5kTG9jYWxpemU6IGZ1bmN0aW9uIGVuZExvY2FsaXplKCkge1xuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSBmYWxzZTtcblxuICAgIHJldHVybiBbdGhpcy5jb2RlTmFtZSwgdGhpcy5sb2NhbGl6ZWRDb2RlLnNsaWNlKDApXTtcbiAgfSxcbiAgZnJlZTogZnVuY3Rpb24gZnJlZShncmFwaCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGdyYXBoKSkge1xuICAgICAgLy8gc3RlcmVvIHVnZW5cbiAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWU7XG4gICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IzID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IzID0gdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IzID0gZ3JhcGhbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDM7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSAoX3N0ZXAzID0gX2l0ZXJhdG9yMy5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWUpIHtcbiAgICAgICAgICB2YXIgY2hhbm5lbCA9IF9zdGVwMy52YWx1ZTtcblxuICAgICAgICAgIHRoaXMuZnJlZShjaGFubmVsKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yMyA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yMyA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyAmJiBfaXRlcmF0b3IzLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yMy5yZXR1cm4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMykge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoKHR5cGVvZiBncmFwaCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoZ3JhcGgpKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKGdyYXBoLm1lbW9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZm9yICh2YXIgbWVtb3J5S2V5IGluIGdyYXBoLm1lbW9yeSkge1xuICAgICAgICAgICAgdGhpcy5tZW1vcnkuZnJlZShncmFwaC5tZW1vcnlbbWVtb3J5S2V5XS5pZHgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShncmFwaC5pbnB1dHMpKSB7XG4gICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb240ID0gdHJ1ZTtcbiAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3I0ID0gZmFsc2U7XG4gICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yNCA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3I0ID0gZ3JhcGguaW5wdXRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA0OyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb240ID0gKF9zdGVwNCA9IF9pdGVyYXRvcjQubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjQgPSB0cnVlKSB7XG4gICAgICAgICAgICAgIHZhciB1Z2VuID0gX3N0ZXA0LnZhbHVlO1xuXG4gICAgICAgICAgICAgIHRoaXMuZnJlZSh1Z2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yNCA9IHRydWU7XG4gICAgICAgICAgICBfaXRlcmF0b3JFcnJvcjQgPSBlcnI7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjQgJiYgX2l0ZXJhdG9yNC5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3I0LnJldHVybigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3I0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnZ3QnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJztcblxuICAgIGlmIChpc05hTih0aGlzLmlucHV0c1swXSkgfHwgaXNOYU4odGhpcy5pbnB1dHNbMV0pKSB7XG4gICAgICBvdXQgKz0gJyggJyArIGlucHV0c1swXSArICcgPiAnICsgaW5wdXRzWzFdICsgJyB8IDAgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPiBpbnB1dHNbMV0gPyAxIDogMDtcbiAgICB9XG4gICAgb3V0ICs9ICdcXG5cXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgZ3QgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBndC5pbnB1dHMgPSBbeCwgeV07XG4gIGd0Lm5hbWUgPSAnZ3QnICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gZ3Q7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdndGUnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJztcblxuICAgIGlmIChpc05hTih0aGlzLmlucHV0c1swXSkgfHwgaXNOYU4odGhpcy5pbnB1dHNbMV0pKSB7XG4gICAgICBvdXQgKz0gJyggJyArIGlucHV0c1swXSArICcgPj0gJyArIGlucHV0c1sxXSArICcgfCAwICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID49IGlucHV0c1sxXSA/IDEgOiAwO1xuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBndCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGd0LmlucHV0cyA9IFt4LCB5XTtcbiAgZ3QubmFtZSA9ICdndGUnICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gZ3Q7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdndHAnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKHRoaXMuaW5wdXRzWzBdKSB8fCBpc05hTih0aGlzLmlucHV0c1sxXSkpIHtcbiAgICAgIG91dCA9ICcoJyArIGlucHV0c1swXSArICcgKiAoICggJyArIGlucHV0c1swXSArICcgPiAnICsgaW5wdXRzWzFdICsgJyApIHwgMCApICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gKiAoaW5wdXRzWzBdID4gaW5wdXRzWzFdIHwgMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgZ3RwID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgZ3RwLmlucHV0cyA9IFt4LCB5XTtcblxuICByZXR1cm4gZ3RwO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBpbjEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyAwIDogYXJndW1lbnRzWzBdO1xuXG4gIHZhciB1Z2VuID0ge1xuICAgIGlucHV0czogW2luMV0sXG4gICAgbWVtb3J5OiB7IHZhbHVlOiB7IGxlbmd0aDogMSwgaWR4OiBudWxsIH0gfSxcbiAgICByZWNvcmRlcjogbnVsbCxcblxuICAgIGluOiBmdW5jdGlvbiBfaW4odikge1xuICAgICAgaWYgKF9nZW4uaGlzdG9yaWVzLmhhcyh2KSkge1xuICAgICAgICB2YXIgbWVtb0hpc3RvcnkgPSBfZ2VuLmhpc3Rvcmllcy5nZXQodik7XG4gICAgICAgIHVnZW4ubmFtZSA9IG1lbW9IaXN0b3J5Lm5hbWU7XG4gICAgICAgIHJldHVybiBtZW1vSGlzdG9yeTtcbiAgICAgIH1cblxuICAgICAgdmFyIG9iaiA9IHtcbiAgICAgICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICAgICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHVnZW4pO1xuXG4gICAgICAgICAgaWYgKHVnZW4ubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgX2dlbi5yZXF1ZXN0TWVtb3J5KHVnZW4ubWVtb3J5KTtcbiAgICAgICAgICAgIF9nZW4ubWVtb3J5LmhlYXBbdWdlbi5tZW1vcnkudmFsdWUuaWR4XSA9IGluMTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4O1xuXG4gICAgICAgICAgX2dlbi5hZGRUb0VuZEJsb2NrKCdtZW1vcnlbICcgKyBpZHggKyAnIF0gPSAnICsgaW5wdXRzWzBdKTtcblxuICAgICAgICAgIC8vIHJldHVybiB1Z2VuIHRoYXQgaXMgYmVpbmcgcmVjb3JkZWQgaW5zdGVhZCBvZiBzc2QuXG4gICAgICAgICAgLy8gdGhpcyBlZmZlY3RpdmVseSBtYWtlcyBhIGNhbGwgdG8gc3NkLnJlY29yZCgpIHRyYW5zcGFyZW50IHRvIHRoZSBncmFwaC5cbiAgICAgICAgICAvLyByZWNvcmRpbmcgaXMgdHJpZ2dlcmVkIGJ5IHByaW9yIGNhbGwgdG8gZ2VuLmFkZFRvRW5kQmxvY2suXG4gICAgICAgICAgX2dlbi5oaXN0b3JpZXMuc2V0KHYsIG9iaik7XG5cbiAgICAgICAgICByZXR1cm4gaW5wdXRzWzBdO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5hbWU6IHVnZW4ubmFtZSArICdfaW4nICsgX2dlbi5nZXRVSUQoKSxcbiAgICAgICAgbWVtb3J5OiB1Z2VuLm1lbW9yeVxuICAgICAgfTtcblxuICAgICAgdGhpcy5pbnB1dHNbMF0gPSB2O1xuXG4gICAgICB1Z2VuLnJlY29yZGVyID0gb2JqO1xuXG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG5cblxuICAgIG91dDoge1xuICAgICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICAgIGlmICh1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwpIHtcbiAgICAgICAgICBpZiAoX2dlbi5oaXN0b3JpZXMuZ2V0KHVnZW4uaW5wdXRzWzBdKSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfZ2VuLmhpc3Rvcmllcy5zZXQodWdlbi5pbnB1dHNbMF0sIHVnZW4ucmVjb3JkZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBfZ2VuLnJlcXVlc3RNZW1vcnkodWdlbi5tZW1vcnkpO1xuICAgICAgICAgIF9nZW4ubWVtb3J5LmhlYXBbdWdlbi5tZW1vcnkudmFsdWUuaWR4XSA9IHBhcnNlRmxvYXQoaW4xKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4O1xuXG4gICAgICAgIHJldHVybiAnbWVtb3J5WyAnICsgaWR4ICsgJyBdICc7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHVpZDogX2dlbi5nZXRVSUQoKVxuICB9O1xuXG4gIHVnZW4ub3V0Lm1lbW9yeSA9IHVnZW4ubWVtb3J5O1xuXG4gIHVnZW4ubmFtZSA9ICdoaXN0b3J5JyArIHVnZW4udWlkO1xuICB1Z2VuLm91dC5uYW1lID0gdWdlbi5uYW1lICsgJ19vdXQnO1xuICB1Z2VuLmluLl9uYW1lID0gdWdlbi5uYW1lID0gJ19pbic7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIGlmICh0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIF9nZW4ubWVtb3J5LmhlYXBbdGhpcy5tZW1vcnkudmFsdWUuaWR4XTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHYpIHtcbiAgICAgIGlmICh0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwpIHtcbiAgICAgICAgX2dlbi5tZW1vcnkuaGVhcFt0aGlzLm1lbW9yeS52YWx1ZS5pZHhdID0gdjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIvKlxuXG4gYSA9IGNvbmRpdGlvbmFsKCBjb25kaXRpb24sIHRydWVCbG9jaywgZmFsc2VCbG9jayApXG4gYiA9IGNvbmRpdGlvbmFsKFtcbiAgIGNvbmRpdGlvbjEsIGJsb2NrMSxcbiAgIGNvbmRpdGlvbjIsIGJsb2NrMixcbiAgIGNvbmRpdGlvbjMsIGJsb2NrMyxcbiAgIGRlZmF1bHRCbG9ja1xuIF0pXG5cbiovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2lmZWxzZScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGNvbmRpdGlvbmFscyA9IHRoaXMuaW5wdXRzWzBdLFxuICAgICAgICBkZWZhdWx0VmFsdWUgPSBjb25kaXRpb25hbHNbY29uZGl0aW9uYWxzLmxlbmd0aCAtIDFdLFxuICAgICAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICdfb3V0ID0gJyArIGRlZmF1bHRWYWx1ZSArICdcXG4nO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb25kaXRpb25hbHMubGVuZ3RoIC0gMjsgaSArPSAyKSB7XG4gICAgICB2YXIgaXNFbmRCbG9jayA9IGkgPT09IGNvbmRpdGlvbmFscy5sZW5ndGggLSAzLFxuICAgICAgICAgIGNvbmQgPSBfZ2VuLmdldElucHV0KGNvbmRpdGlvbmFsc1tpXSksXG4gICAgICAgICAgcHJlYmxvY2sgPSBjb25kaXRpb25hbHNbaSArIDFdLFxuICAgICAgICAgIGJsb2NrID0gdm9pZCAwLFxuICAgICAgICAgIGJsb2NrTmFtZSA9IHZvaWQgMCxcbiAgICAgICAgICBvdXRwdXQgPSB2b2lkIDA7XG5cbiAgICAgIC8vY29uc29sZS5sb2coICdwYicsIHByZWJsb2NrIClcblxuICAgICAgaWYgKHR5cGVvZiBwcmVibG9jayA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgYmxvY2sgPSBwcmVibG9jaztcbiAgICAgICAgYmxvY2tOYW1lID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChfZ2VuLm1lbW9bcHJlYmxvY2submFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIHVzZWQgdG8gcGxhY2UgYWxsIGNvZGUgZGVwZW5kZW5jaWVzIGluIGFwcHJvcHJpYXRlIGJsb2Nrc1xuICAgICAgICAgIF9nZW4uc3RhcnRMb2NhbGl6ZSgpO1xuXG4gICAgICAgICAgX2dlbi5nZXRJbnB1dChwcmVibG9jayk7XG5cbiAgICAgICAgICBibG9jayA9IF9nZW4uZW5kTG9jYWxpemUoKTtcbiAgICAgICAgICBibG9ja05hbWUgPSBibG9ja1swXTtcbiAgICAgICAgICBibG9jayA9IGJsb2NrWzFdLmpvaW4oJycpO1xuICAgICAgICAgIGJsb2NrID0gJyAgJyArIGJsb2NrLnJlcGxhY2UoL1xcbi9naSwgJ1xcbiAgJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmxvY2sgPSAnJztcbiAgICAgICAgICBibG9ja05hbWUgPSBfZ2VuLm1lbW9bcHJlYmxvY2submFtZV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb3V0cHV0ID0gYmxvY2tOYW1lID09PSBudWxsID8gJyAgJyArIHRoaXMubmFtZSArICdfb3V0ID0gJyArIGJsb2NrIDogYmxvY2sgKyAnICAnICsgdGhpcy5uYW1lICsgJ19vdXQgPSAnICsgYmxvY2tOYW1lO1xuXG4gICAgICBpZiAoaSA9PT0gMCkgb3V0ICs9ICcgJztcbiAgICAgIG91dCArPSAnIGlmKCAnICsgY29uZCArICcgPT09IDEgKSB7XFxuJyArIG91dHB1dCArICdcXG4gIH0nO1xuXG4gICAgICBpZiAoIWlzRW5kQmxvY2spIHtcbiAgICAgICAgb3V0ICs9ICcgZWxzZSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXQgKz0gJ1xcbic7XG4gICAgICB9XG4gICAgICAvKiAgICAgICAgIFxuICAgICAgIGVsc2VgXG4gICAgICAgICAgICB9ZWxzZSBpZiggaXNFbmRCbG9jayApIHtcbiAgICAgICAgICAgICAgb3V0ICs9IGB7XFxuICAke291dHB1dH1cXG4gIH1cXG5gXG4gICAgICAgICAgICB9ZWxzZSB7XG4gICAgICBcbiAgICAgICAgICAgICAgLy9pZiggaSArIDIgPT09IGNvbmRpdGlvbmFscy5sZW5ndGggfHwgaSA9PT0gY29uZGl0aW9uYWxzLmxlbmd0aCAtIDEgKSB7XG4gICAgICAgICAgICAgIC8vICBvdXQgKz0gYHtcXG4gICR7b3V0cHV0fVxcbiAgfVxcbmBcbiAgICAgICAgICAgICAgLy99ZWxzZXtcbiAgICAgICAgICAgICAgICBvdXQgKz0gXG4gICAgICBgIGlmKCAke2NvbmR9ID09PSAxICkge1xuICAgICAgJHtvdXRwdXR9XG4gICAgICAgIH0gZWxzZSBgXG4gICAgICAgICAgICAgIC8vfVxuICAgICAgICAgICAgfSovXG4gICAgfVxuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX291dCc7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSArICdfb3V0Jywgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBjb25kaXRpb25zID0gQXJyYXkuaXNBcnJheShhcmdzWzBdKSA/IGFyZ3NbMF0gOiBhcmdzO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtjb25kaXRpb25zXVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdpbicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgX2dlbi5wYXJhbWV0ZXJzLnB1c2godGhpcy5uYW1lKTtcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobmFtZSkge1xuICB2YXIgaW5wdXQgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBpbnB1dC5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIGlucHV0Lm5hbWUgPSBuYW1lICE9PSB1bmRlZmluZWQgPyBuYW1lIDogJycgKyBpbnB1dC5iYXNlbmFtZSArIGlucHV0LmlkO1xuICBpbnB1dFswXSA9IHtcbiAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgIGlmICghX2dlbi5wYXJhbWV0ZXJzLmluY2x1ZGVzKGlucHV0Lm5hbWUpKSBfZ2VuLnBhcmFtZXRlcnMucHVzaChpbnB1dC5uYW1lKTtcbiAgICAgIHJldHVybiBpbnB1dC5uYW1lICsgJ1swXSc7XG4gICAgfVxuICB9O1xuICBpbnB1dFsxXSA9IHtcbiAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgIGlmICghX2dlbi5wYXJhbWV0ZXJzLmluY2x1ZGVzKGlucHV0Lm5hbWUpKSBfZ2VuLnBhcmFtZXRlcnMucHVzaChpbnB1dC5uYW1lKTtcbiAgICAgIHJldHVybiBpbnB1dC5uYW1lICsgJ1sxXSc7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBpbnB1dDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbGlicmFyeSA9IHtcbiAgZXhwb3J0OiBmdW5jdGlvbiBfZXhwb3J0KGRlc3RpbmF0aW9uKSB7XG4gICAgaWYgKGRlc3RpbmF0aW9uID09PSB3aW5kb3cpIHtcbiAgICAgIGRlc3RpbmF0aW9uLnNzZCA9IGxpYnJhcnkuaGlzdG9yeTsgLy8gaGlzdG9yeSBpcyB3aW5kb3cgb2JqZWN0IHByb3BlcnR5LCBzbyB1c2Ugc3NkIGFzIGFsaWFzXG4gICAgICBkZXN0aW5hdGlvbi5pbnB1dCA9IGxpYnJhcnkuaW47IC8vIGluIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG4gICAgICBkZXN0aW5hdGlvbi50ZXJuYXJ5ID0gbGlicmFyeS5zd2l0Y2g7IC8vIHN3aXRjaCBpcyBhIGtleXdvcmQgaW4gamF2YXNjcmlwdFxuXG4gICAgICBkZWxldGUgbGlicmFyeS5oaXN0b3J5O1xuICAgICAgZGVsZXRlIGxpYnJhcnkuaW47XG4gICAgICBkZWxldGUgbGlicmFyeS5zd2l0Y2g7XG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbihkZXN0aW5hdGlvbiwgbGlicmFyeSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobGlicmFyeSwgJ3NhbXBsZXJhdGUnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIGxpYnJhcnkuZ2VuLnNhbXBsZXJhdGU7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQodikge31cbiAgICB9KTtcblxuICAgIGxpYnJhcnkuaW4gPSBkZXN0aW5hdGlvbi5pbnB1dDtcbiAgICBsaWJyYXJ5Lmhpc3RvcnkgPSBkZXN0aW5hdGlvbi5zc2Q7XG4gICAgbGlicmFyeS5zd2l0Y2ggPSBkZXN0aW5hdGlvbi50ZXJuYXJ5O1xuXG4gICAgZGVzdGluYXRpb24uY2xpcCA9IGxpYnJhcnkuY2xhbXA7XG4gIH0sXG5cblxuICBnZW46IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG5cbiAgYWJzOiByZXF1aXJlKCcuL2Ficy5qcycpLFxuICByb3VuZDogcmVxdWlyZSgnLi9yb3VuZC5qcycpLFxuICBwYXJhbTogcmVxdWlyZSgnLi9wYXJhbS5qcycpLFxuICBhZGQ6IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gIHN1YjogcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgbXVsOiByZXF1aXJlKCcuL211bC5qcycpLFxuICBkaXY6IHJlcXVpcmUoJy4vZGl2LmpzJyksXG4gIGFjY3VtOiByZXF1aXJlKCcuL2FjY3VtLmpzJyksXG4gIGNvdW50ZXI6IHJlcXVpcmUoJy4vY291bnRlci5qcycpLFxuICBzaW46IHJlcXVpcmUoJy4vc2luLmpzJyksXG4gIGNvczogcmVxdWlyZSgnLi9jb3MuanMnKSxcbiAgdGFuOiByZXF1aXJlKCcuL3Rhbi5qcycpLFxuICBhc2luOiByZXF1aXJlKCcuL2FzaW4uanMnKSxcbiAgYWNvczogcmVxdWlyZSgnLi9hY29zLmpzJyksXG4gIGF0YW46IHJlcXVpcmUoJy4vYXRhbi5qcycpLFxuICBwaGFzb3I6IHJlcXVpcmUoJy4vcGhhc29yLmpzJyksXG4gIGRhdGE6IHJlcXVpcmUoJy4vZGF0YS5qcycpLFxuICBwZWVrOiByZXF1aXJlKCcuL3BlZWsuanMnKSxcbiAgY3ljbGU6IHJlcXVpcmUoJy4vY3ljbGUuanMnKSxcbiAgaGlzdG9yeTogcmVxdWlyZSgnLi9oaXN0b3J5LmpzJyksXG4gIGRlbHRhOiByZXF1aXJlKCcuL2RlbHRhLmpzJyksXG4gIGZsb29yOiByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gIGNlaWw6IHJlcXVpcmUoJy4vY2VpbC5qcycpLFxuICBtaW46IHJlcXVpcmUoJy4vbWluLmpzJyksXG4gIG1heDogcmVxdWlyZSgnLi9tYXguanMnKSxcbiAgc2lnbjogcmVxdWlyZSgnLi9zaWduLmpzJyksXG4gIGRjYmxvY2s6IHJlcXVpcmUoJy4vZGNibG9jay5qcycpLFxuICBtZW1vOiByZXF1aXJlKCcuL21lbW8uanMnKSxcbiAgcmF0ZTogcmVxdWlyZSgnLi9yYXRlLmpzJyksXG4gIHdyYXA6IHJlcXVpcmUoJy4vd3JhcC5qcycpLFxuICBtaXg6IHJlcXVpcmUoJy4vbWl4LmpzJyksXG4gIGNsYW1wOiByZXF1aXJlKCcuL2NsYW1wLmpzJyksXG4gIHBva2U6IHJlcXVpcmUoJy4vcG9rZS5qcycpLFxuICBkZWxheTogcmVxdWlyZSgnLi9kZWxheS5qcycpLFxuICBmb2xkOiByZXF1aXJlKCcuL2ZvbGQuanMnKSxcbiAgbW9kOiByZXF1aXJlKCcuL21vZC5qcycpLFxuICBzYWg6IHJlcXVpcmUoJy4vc2FoLmpzJyksXG4gIG5vaXNlOiByZXF1aXJlKCcuL25vaXNlLmpzJyksXG4gIG5vdDogcmVxdWlyZSgnLi9ub3QuanMnKSxcbiAgZ3Q6IHJlcXVpcmUoJy4vZ3QuanMnKSxcbiAgZ3RlOiByZXF1aXJlKCcuL2d0ZS5qcycpLFxuICBsdDogcmVxdWlyZSgnLi9sdC5qcycpLFxuICBsdGU6IHJlcXVpcmUoJy4vbHRlLmpzJyksXG4gIGJvb2w6IHJlcXVpcmUoJy4vYm9vbC5qcycpLFxuICBnYXRlOiByZXF1aXJlKCcuL2dhdGUuanMnKSxcbiAgdHJhaW46IHJlcXVpcmUoJy4vdHJhaW4uanMnKSxcbiAgc2xpZGU6IHJlcXVpcmUoJy4vc2xpZGUuanMnKSxcbiAgaW46IHJlcXVpcmUoJy4vaW4uanMnKSxcbiAgdDYwOiByZXF1aXJlKCcuL3Q2MC5qcycpLFxuICBtdG9mOiByZXF1aXJlKCcuL210b2YuanMnKSxcbiAgbHRwOiByZXF1aXJlKCcuL2x0cC5qcycpLCAvLyBUT0RPOiB0ZXN0XG4gIGd0cDogcmVxdWlyZSgnLi9ndHAuanMnKSwgLy8gVE9ETzogdGVzdFxuICBzd2l0Y2g6IHJlcXVpcmUoJy4vc3dpdGNoLmpzJyksXG4gIG1zdG9zYW1wczogcmVxdWlyZSgnLi9tc3Rvc2FtcHMuanMnKSwgLy8gVE9ETzogbmVlZHMgdGVzdCxcbiAgc2VsZWN0b3I6IHJlcXVpcmUoJy4vc2VsZWN0b3IuanMnKSxcbiAgdXRpbGl0aWVzOiByZXF1aXJlKCcuL3V0aWxpdGllcy5qcycpLFxuICBwb3c6IHJlcXVpcmUoJy4vcG93LmpzJyksXG4gIGF0dGFjazogcmVxdWlyZSgnLi9hdHRhY2suanMnKSxcbiAgZGVjYXk6IHJlcXVpcmUoJy4vZGVjYXkuanMnKSxcbiAgd2luZG93czogcmVxdWlyZSgnLi93aW5kb3dzLmpzJyksXG4gIGVudjogcmVxdWlyZSgnLi9lbnYuanMnKSxcbiAgYWQ6IHJlcXVpcmUoJy4vYWQuanMnKSxcbiAgYWRzcjogcmVxdWlyZSgnLi9hZHNyLmpzJyksXG4gIGlmZWxzZTogcmVxdWlyZSgnLi9pZmVsc2VpZi5qcycpLFxuICBiYW5nOiByZXF1aXJlKCcuL2JhbmcuanMnKSxcbiAgYW5kOiByZXF1aXJlKCcuL2FuZC5qcycpLFxuICBwYW46IHJlcXVpcmUoJy4vcGFuLmpzJyksXG4gIGVxOiByZXF1aXJlKCcuL2VxLmpzJyksXG4gIG5lcTogcmVxdWlyZSgnLi9uZXEuanMnKVxufTtcblxubGlicmFyeS5nZW4ubGliID0gbGlicmFyeTtcblxubW9kdWxlLmV4cG9ydHMgPSBsaWJyYXJ5OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdsdCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnO1xuXG4gICAgaWYgKGlzTmFOKHRoaXMuaW5wdXRzWzBdKSB8fCBpc05hTih0aGlzLmlucHV0c1sxXSkpIHtcbiAgICAgIG91dCArPSAnKCAnICsgaW5wdXRzWzBdICsgJyA8ICcgKyBpbnB1dHNbMV0gKyAnIHwgMCAgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPCBpbnB1dHNbMV0gPyAxIDogMDtcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIGx0ID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbHQuaW5wdXRzID0gW3gsIHldO1xuICBsdC5uYW1lID0gJ2x0JyArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgcmV0dXJuIGx0O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnbHRlJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICc7XG5cbiAgICBpZiAoaXNOYU4odGhpcy5pbnB1dHNbMF0pIHx8IGlzTmFOKHRoaXMuaW5wdXRzWzFdKSkge1xuICAgICAgb3V0ICs9ICcoICcgKyBpbnB1dHNbMF0gKyAnIDw9ICcgKyBpbnB1dHNbMV0gKyAnIHwgMCAgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPD0gaW5wdXRzWzFdID8gMSA6IDA7XG4gICAgfVxuICAgIG91dCArPSAnXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF07XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBsdCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGx0LmlucHV0cyA9IFt4LCB5XTtcbiAgbHQubmFtZSA9ICdsdGUnICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gbHQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdsdHAnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKHRoaXMuaW5wdXRzWzBdKSB8fCBpc05hTih0aGlzLmlucHV0c1sxXSkpIHtcbiAgICAgIG91dCA9ICcoJyArIGlucHV0c1swXSArICcgKiAoKCAnICsgaW5wdXRzWzBdICsgJyA8ICcgKyBpbnB1dHNbMV0gKyAnICkgfCAwICkgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSAqIChpbnB1dHNbMF0gPCBpbnB1dHNbMV0gfCAwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBsdHAgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBsdHAuaW5wdXRzID0gW3gsIHldO1xuXG4gIHJldHVybiBsdHA7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdtYXgnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkgfHwgaXNOYU4oaW5wdXRzWzFdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIE1hdGgubWF4KSk7XG5cbiAgICAgIG91dCA9ICdnZW4ubWF4KCAnICsgaW5wdXRzWzBdICsgJywgJyArIGlucHV0c1sxXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgubWF4KHBhcnNlRmxvYXQoaW5wdXRzWzBdKSwgcGFyc2VGbG9hdChpbnB1dHNbMV0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBtYXggPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBtYXguaW5wdXRzID0gW3gsIHldO1xuXG4gIHJldHVybiBtYXg7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnbWVtbycsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnICsgaW5wdXRzWzBdICsgJ1xcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIG1lbW9OYW1lKSB7XG4gIHZhciBtZW1vID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbWVtby5pbnB1dHMgPSBbaW4xXTtcbiAgbWVtby5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIG1lbW8ubmFtZSA9IG1lbW9OYW1lICE9PSB1bmRlZmluZWQgPyBtZW1vTmFtZSArICdfJyArIF9nZW4uZ2V0VUlEKCkgOiAnJyArIG1lbW8uYmFzZW5hbWUgKyBtZW1vLmlkO1xuXG4gIHJldHVybiBtZW1vO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnbWluJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pIHx8IGlzTmFOKGlucHV0c1sxXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCBNYXRoLm1pbikpO1xuXG4gICAgICBvdXQgPSAnZ2VuLm1pbiggJyArIGlucHV0c1swXSArICcsICcgKyBpbnB1dHNbMV0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLm1pbihwYXJzZUZsb2F0KGlucHV0c1swXSksIHBhcnNlRmxvYXQoaW5wdXRzWzFdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgbWluID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbWluLmlucHV0cyA9IFt4LCB5XTtcblxuICByZXR1cm4gbWluO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xLCBpbjIpIHtcbiAgICB2YXIgdCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IC41IDogYXJndW1lbnRzWzJdO1xuXG4gICAgdmFyIHVnZW4gPSBtZW1vKGFkZChtdWwoaW4xLCBzdWIoMSwgdCkpLCBtdWwoaW4yLCB0KSkpO1xuICAgIHVnZW4ubmFtZSA9ICdtaXgnICsgZ2VuLmdldFVJRCgpO1xuXG4gICAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgdmFyIG1vZCA9IHtcbiAgICBpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgICBvdXQgPSAnKCcsXG4gICAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbMF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKGxhc3ROdW1iZXIpLFxuICAgICAgICAgIG1vZEF0RW5kID0gZmFsc2U7XG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICAgIGlmIChpID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGlzTnVtYmVyVWdlbiA9IGlzTmFOKHYpLFxuICAgICAgICAgICAgaXNGaW5hbElkeCA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxO1xuXG4gICAgICAgIGlmICghbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgJSB2O1xuICAgICAgICAgIG91dCArPSBsYXN0TnVtYmVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG91dCArPSBsYXN0TnVtYmVyICsgJyAlICcgKyB2O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpc0ZpbmFsSWR4KSBvdXQgKz0gJyAlICc7XG4gICAgICB9KTtcblxuICAgICAgb3V0ICs9ICcpJztcblxuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIG1vZDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdtc3Rvc2FtcHMnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IHZvaWQgMDtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnICsgX2dlbi5zYW1wbGVyYXRlICsgJyAvIDEwMDAgKiAnICsgaW5wdXRzWzBdICsgJyBcXG5cXG4nO1xuXG4gICAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IG91dDtcblxuICAgICAgcmV0dXJuVmFsdWUgPSBbdGhpcy5uYW1lLCBvdXRdO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBfZ2VuLnNhbXBsZXJhdGUgLyAxMDAwICogdGhpcy5pbnB1dHNbMF07XG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0O1xuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgbXN0b3NhbXBzID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbXN0b3NhbXBzLmlucHV0cyA9IFt4XTtcbiAgbXN0b3NhbXBzLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgcmV0dXJuIG1zdG9zYW1wcztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ210b2YnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCBNYXRoLmV4cCkpO1xuXG4gICAgICBvdXQgPSAnKCAnICsgdGhpcy50dW5pbmcgKyAnICogZ2VuLmV4cCggLjA1Nzc2MjI2NSAqICgnICsgaW5wdXRzWzBdICsgJyAtIDY5KSApICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSB0aGlzLnR1bmluZyAqIE1hdGguZXhwKC4wNTc3NjIyNjUgKiAoaW5wdXRzWzBdIC0gNjkpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCBwcm9wcykge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgZGVmYXVsdHMgPSB7IHR1bmluZzogNDQwIH07XG5cbiAgaWYgKHByb3BzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24ocHJvcHMuZGVmYXVsdHMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwgZGVmYXVsdHMpO1xuICB1Z2VuLmlucHV0cyA9IFt4XTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIG11bCA9IHtcbiAgICBpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFt4LCB5XSxcblxuICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgICAgaWYgKGlzTmFOKGlucHV0c1swXSkgfHwgaXNOYU4oaW5wdXRzWzFdKSkge1xuICAgICAgICBvdXQgPSAnKCcgKyBpbnB1dHNbMF0gKyAnICogJyArIGlucHV0c1sxXSArICcpJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dCA9IHBhcnNlRmxvYXQoaW5wdXRzWzBdKSAqIHBhcnNlRmxvYXQoaW5wdXRzWzFdKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIG11bDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICduZXEnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgb3V0ID0gdm9pZCAwO1xuXG4gICAgb3V0ID0gLyp0aGlzLmlucHV0c1swXSAhPT0gdGhpcy5pbnB1dHNbMV0gPyAxIDoqLycgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICcgKyBpbnB1dHNbMF0gKyAnICE9PSAnICsgaW5wdXRzWzFdICsgJyB8IDBcXG5cXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xLCBpbjIpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMSwgaW4yXVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ25vaXNlJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwO1xuXG4gICAgX2dlbi5jbG9zdXJlcy5hZGQoeyAnbm9pc2UnOiBNYXRoLnJhbmRvbSB9KTtcblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9IGdlbi5ub2lzZSgpXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIG5vaXNlID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG4gIG5vaXNlLm5hbWUgPSBwcm90by5uYW1lICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gbm9pc2U7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdub3QnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKHRoaXMuaW5wdXRzWzBdKSkge1xuICAgICAgb3V0ID0gJyggJyArIGlucHV0c1swXSArICcgPT09IDAgPyAxIDogMCApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gIWlucHV0c1swXSA9PT0gMCA/IDEgOiAwO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIG5vdCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIG5vdC5pbnB1dHMgPSBbeF07XG5cbiAgcmV0dXJuIG5vdDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBkYXRhID0gcmVxdWlyZSgnLi9kYXRhLmpzJyksXG4gICAgcGVlayA9IHJlcXVpcmUoJy4vcGVlay5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdwYW4nLFxuICBpbml0VGFibGU6IGZ1bmN0aW9uIGluaXRUYWJsZSgpIHtcbiAgICB2YXIgYnVmZmVyTCA9IG5ldyBGbG9hdDMyQXJyYXkoMTAyNCksXG4gICAgICAgIGJ1ZmZlclIgPSBuZXcgRmxvYXQzMkFycmF5KDEwMjQpO1xuXG4gICAgdmFyIHNxcnRUd29PdmVyVHdvID0gTWF0aC5zcXJ0KDIpIC8gMjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTAyNDsgaSsrKSB7XG4gICAgICB2YXIgcGFuID0gLTEgKyBpIC8gMTAyNCAqIDI7XG4gICAgICBidWZmZXJMW2ldID0gc3FydFR3b092ZXJUd28gKiAoTWF0aC5jb3MocGFuKSAtIE1hdGguc2luKHBhbikpO1xuICAgICAgYnVmZmVyUltpXSA9IHNxcnRUd29PdmVyVHdvICogKE1hdGguY29zKHBhbikgKyBNYXRoLnNpbihwYW4pKTtcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5wYW5MID0gZGF0YShidWZmZXJMLCAxLCB7IGltbXV0YWJsZTogdHJ1ZSB9KTtcbiAgICBnZW4uZ2xvYmFscy5wYW5SID0gZGF0YShidWZmZXJSLCAxLCB7IGltbXV0YWJsZTogdHJ1ZSB9KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGVmdElucHV0LCByaWdodElucHV0LCBwYW4sIHByb3BlcnRpZXMpIHtcbiAgaWYgKGdlbi5nbG9iYWxzLnBhbkwgPT09IHVuZGVmaW5lZCkgcHJvdG8uaW5pdFRhYmxlKCk7XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtsZWZ0SW5wdXQsIHJpZ2h0SW5wdXRdLFxuICAgIGxlZnQ6IG11bChsZWZ0SW5wdXQsIHBlZWsoZ2VuLmdsb2JhbHMucGFuTCwgcGFuLCB7IGJvdW5kbW9kZTogJ2NsYW1wJyB9KSksXG4gICAgcmlnaHQ6IG11bChyaWdodElucHV0LCBwZWVrKGdlbi5nbG9iYWxzLnBhblIsIHBhbiwgeyBib3VuZG1vZGU6ICdjbGFtcCcgfSkpXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICBfZ2VuLnJlcXVlc3RNZW1vcnkodGhpcy5tZW1vcnkpO1xuXG4gICAgX2dlbi5wYXJhbXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCB0aGlzKSk7XG5cbiAgICB0aGlzLnZhbHVlID0gdGhpcy5pbml0aWFsVmFsdWU7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9ICdtZW1vcnlbJyArIHRoaXMubWVtb3J5LnZhbHVlLmlkeCArICddJztcblxuICAgIHJldHVybiBfZ2VuLm1lbW9bdGhpcy5uYW1lXTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBwcm9wTmFtZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMF07XG4gIHZhciB2YWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMV07XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBpZiAodHlwZW9mIHByb3BOYW1lICE9PSAnc3RyaW5nJykge1xuICAgIHVnZW4ubmFtZSA9ICdwYXJhbScgKyBfZ2VuLmdldFVJRCgpO1xuICAgIHVnZW4uaW5pdGlhbFZhbHVlID0gcHJvcE5hbWU7XG4gIH0gZWxzZSB7XG4gICAgdWdlbi5uYW1lID0gcHJvcE5hbWU7XG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICBpZiAodGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF07XG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgICBpZiAodGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsKSB7XG4gICAgICAgIF9nZW4ubWVtb3J5LmhlYXBbdGhpcy5tZW1vcnkudmFsdWUuaWR4XSA9IHY7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9XG4gIH07XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncGVlaycsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGZ1bmN0aW9uQm9keSA9IHZvaWQgMCxcbiAgICAgICAgbmV4dCA9IHZvaWQgMCxcbiAgICAgICAgbGVuZ3RoSXNMb2cyID0gdm9pZCAwLFxuICAgICAgICBpZHggPSB2b2lkIDA7XG5cbiAgICAvL2lkeCA9IHRoaXMuZGF0YS5nZW4oKVxuICAgIGlkeCA9IGlucHV0c1sxXTtcbiAgICBsZW5ndGhJc0xvZzIgPSAoTWF0aC5sb2cyKHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoKSB8IDApID09PSBNYXRoLmxvZzIodGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGgpO1xuXG4gICAgLy9jb25zb2xlLmxvZyggXCJMRU5HVEggSVMgTE9HMlwiLCBsZW5ndGhJc0xvZzIsIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIClcbiAgICAvLyR7dGhpcy5uYW1lfV9pbmRleCA9ICR7dGhpcy5uYW1lfV9waGFzZSB8IDAsXFxuYFxuICAgIGlmICh0aGlzLm1vZGUgIT09ICdzaW1wbGUnKSB7XG5cbiAgICAgIGZ1bmN0aW9uQm9keSA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJ19kYXRhSWR4ICA9ICcgKyBpZHggKyAnLCBcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19waGFzZSA9ICcgKyAodGhpcy5tb2RlID09PSAnc2FtcGxlcycgPyBpbnB1dHNbMF0gOiBpbnB1dHNbMF0gKyAnICogJyArICh0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDEpKSArICcsIFxcbiAgICAgICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4ID0gJyArIHRoaXMubmFtZSArICdfcGhhc2UgfCAwLFxcbic7XG5cbiAgICAgIC8vbmV4dCA9IGxlbmd0aElzTG9nMiA/XG4gICAgICBpZiAodGhpcy5ib3VuZG1vZGUgPT09ICd3cmFwJykge1xuICAgICAgICBuZXh0ID0gbGVuZ3RoSXNMb2cyID8gJyggJyArIHRoaXMubmFtZSArICdfaW5kZXggKyAxICkgJiAoJyArIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoICsgJyAtIDEpJyA6IHRoaXMubmFtZSArICdfaW5kZXggKyAxID49ICcgKyB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCArICcgPyAnICsgdGhpcy5uYW1lICsgJ19pbmRleCArIDEgLSAnICsgdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKyAnIDogJyArIHRoaXMubmFtZSArICdfaW5kZXggKyAxJztcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5ib3VuZG1vZGUgPT09ICdjbGFtcCcpIHtcbiAgICAgICAgbmV4dCA9IHRoaXMubmFtZSArICdfaW5kZXggKyAxID49ICcgKyAodGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxKSArICcgPyAnICsgKHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMSkgKyAnIDogJyArIHRoaXMubmFtZSArICdfaW5kZXggKyAxJztcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaW50ZXJwID09PSAnbGluZWFyJykge1xuICAgICAgICBmdW5jdGlvbkJvZHkgKz0gJyAgICAgICcgKyB0aGlzLm5hbWUgKyAnX2ZyYWMgID0gJyArIHRoaXMubmFtZSArICdfcGhhc2UgLSAnICsgdGhpcy5uYW1lICsgJ19pbmRleCxcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19iYXNlICA9IG1lbW9yeVsgJyArIHRoaXMubmFtZSArICdfZGF0YUlkeCArICAnICsgdGhpcy5uYW1lICsgJ19pbmRleCBdLFxcbiAgICAgICcgKyB0aGlzLm5hbWUgKyAnX25leHQgID0gJyArIG5leHQgKyAnLCAgICAgXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfb3V0ICAgPSAnICsgdGhpcy5uYW1lICsgJ19iYXNlICsgJyArIHRoaXMubmFtZSArICdfZnJhYyAqICggbWVtb3J5WyAnICsgdGhpcy5uYW1lICsgJ19kYXRhSWR4ICsgJyArIHRoaXMubmFtZSArICdfbmV4dCBdIC0gJyArIHRoaXMubmFtZSArICdfYmFzZSApXFxuXFxuJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSAnICAgICAgJyArIHRoaXMubmFtZSArICdfb3V0ID0gbWVtb3J5WyAnICsgdGhpcy5uYW1lICsgJ19kYXRhSWR4ICsgJyArIHRoaXMubmFtZSArICdfaW5kZXggXVxcblxcbic7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG1vZGUgaXMgc2ltcGxlXG4gICAgICBmdW5jdGlvbkJvZHkgPSAnbWVtb3J5WyAnICsgaWR4ICsgJyArICcgKyBpbnB1dHNbMF0gKyAnIF0nO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb25Cb2R5O1xuICAgIH1cblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lICsgJ19vdXQnO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUgKyAnX291dCcsIGZ1bmN0aW9uQm9keV07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRhdGEsIGluZGV4LCBwcm9wZXJ0aWVzKSB7XG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBkZWZhdWx0cyA9IHsgY2hhbm5lbHM6IDEsIG1vZGU6ICdwaGFzZScsIGludGVycDogJ2xpbmVhcicsIGJvdW5kbW9kZTogJ3dyYXAnIH07XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgcHJvcGVydGllcyk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgZGF0YTogZGF0YSxcbiAgICBkYXRhTmFtZTogZGF0YS5uYW1lLFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbmRleCwgZGF0YV1cbiAgfSwgZGVmYXVsdHMpO1xuXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoJy4vYWNjdW0uanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHByb3RvID0geyBiYXNlbmFtZTogJ3BoYXNvcicgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmcmVxdWVuY3kgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyAxIDogYXJndW1lbnRzWzBdO1xuICB2YXIgcmVzZXQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAwIDogYXJndW1lbnRzWzFdO1xuICB2YXIgcHJvcHMgPSBhcmd1bWVudHNbMl07XG5cbiAgaWYgKHByb3BzID09PSB1bmRlZmluZWQpIHByb3BzID0geyBtaW46IC0xIH07XG5cbiAgdmFyIHJhbmdlID0gKHByb3BzLm1heCB8fCAxKSAtIHByb3BzLm1pbjtcblxuICB2YXIgdWdlbiA9IHR5cGVvZiBmcmVxdWVuY3kgPT09ICdudW1iZXInID8gYWNjdW0oZnJlcXVlbmN5ICogcmFuZ2UgLyBnZW4uc2FtcGxlcmF0ZSwgcmVzZXQsIHByb3BzKSA6IGFjY3VtKG11bChmcmVxdWVuY3ksIDEgLyBnZW4uc2FtcGxlcmF0ZSAvICgxIC8gcmFuZ2UpKSwgcmVzZXQsIHByb3BzKTtcblxuICB1Z2VuLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICB3cmFwID0gcmVxdWlyZSgnLi93cmFwLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdwb2tlJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgZGF0YU5hbWUgPSAnbWVtb3J5JyxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIGlkeCA9IHZvaWQgMCxcbiAgICAgICAgb3V0ID0gdm9pZCAwLFxuICAgICAgICB3cmFwcGVkID0gdm9pZCAwO1xuXG4gICAgaWR4ID0gdGhpcy5kYXRhLmdlbigpO1xuXG4gICAgLy9nZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIC8vd3JhcHBlZCA9IHdyYXAoIHRoaXMuaW5wdXRzWzFdLCAwLCB0aGlzLmRhdGFMZW5ndGggKS5nZW4oKVxuICAgIC8vaWR4ID0gd3JhcHBlZFswXVxuICAgIC8vZ2VuLmZ1bmN0aW9uQm9keSArPSB3cmFwcGVkWzFdXG4gICAgdmFyIG91dHB1dFN0ciA9IHRoaXMuaW5wdXRzWzFdID09PSAwID8gJyAgJyArIGRhdGFOYW1lICsgJ1sgJyArIGlkeCArICcgXSA9ICcgKyBpbnB1dHNbMF0gKyAnXFxuJyA6ICcgICcgKyBkYXRhTmFtZSArICdbICcgKyBpZHggKyAnICsgJyArIGlucHV0c1sxXSArICcgXSA9ICcgKyBpbnB1dHNbMF0gKyAnXFxuJztcblxuICAgIGlmICh0aGlzLmlubGluZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBfZ2VuLmZ1bmN0aW9uQm9keSArPSBvdXRwdXRTdHI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbdGhpcy5pbmxpbmUsIG91dHB1dFN0cl07XG4gICAgfVxuICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZGF0YSwgdmFsdWUsIGluZGV4LCBwcm9wZXJ0aWVzKSB7XG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBkZWZhdWx0cyA9IHsgY2hhbm5lbHM6IDEgfTtcblxuICBpZiAocHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBwcm9wZXJ0aWVzKTtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICBkYXRhOiBkYXRhLFxuICAgIGRhdGFOYW1lOiBkYXRhLm5hbWUsXG4gICAgZGF0YUxlbmd0aDogZGF0YS5idWZmZXIubGVuZ3RoLFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFt2YWx1ZSwgaW5kZXhdXG4gIH0sIGRlZmF1bHRzKTtcblxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgX2dlbi5oaXN0b3JpZXMuc2V0KHVnZW4ubmFtZSwgdWdlbik7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncG93JyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pIHx8IGlzTmFOKGlucHV0c1sxXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKHsgJ3Bvdyc6IE1hdGgucG93IH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLnBvdyggJyArIGlucHV0c1swXSArICcsICcgKyBpbnB1dHNbMV0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIGlucHV0c1swXSA9PT0gJ3N0cmluZycgJiYgaW5wdXRzWzBdWzBdID09PSAnKCcpIHtcbiAgICAgICAgaW5wdXRzWzBdID0gaW5wdXRzWzBdLnNsaWNlKDEsIC0xKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgaW5wdXRzWzFdID09PSAnc3RyaW5nJyAmJiBpbnB1dHNbMV1bMF0gPT09ICcoJykge1xuICAgICAgICBpbnB1dHNbMV0gPSBpbnB1dHNbMV0uc2xpY2UoMSwgLTEpO1xuICAgICAgfVxuXG4gICAgICBvdXQgPSBNYXRoLnBvdyhwYXJzZUZsb2F0KGlucHV0c1swXSksIHBhcnNlRmxvYXQoaW5wdXRzWzFdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgcG93ID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgcG93LmlucHV0cyA9IFt4LCB5XTtcbiAgcG93LmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgcG93Lm5hbWUgPSBwb3cuYmFzZW5hbWUgKyAne3Bvdy5pZH0nO1xuXG4gIHJldHVybiBwb3c7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCcuL2hpc3RvcnkuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJyksXG4gICAgZGVsdGEgPSByZXF1aXJlKCcuL2RlbHRhLmpzJyksXG4gICAgd3JhcCA9IHJlcXVpcmUoJy4vd3JhcC5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncmF0ZScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBwaGFzZSA9IGhpc3RvcnkoKSxcbiAgICAgICAgaW5NaW51czEgPSBoaXN0b3J5KCksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZpbHRlciA9IHZvaWQgMCxcbiAgICAgICAgc3VtID0gdm9pZCAwLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sIHRoaXMubmFtZSwgdGhpcykpO1xuXG4gICAgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICdfZGlmZiA9ICcgKyBpbnB1dHNbMF0gKyAnIC0gJyArIGdlbk5hbWUgKyAnLmxhc3RTYW1wbGVcXG4gIGlmKCAnICsgdGhpcy5uYW1lICsgJ19kaWZmIDwgLS41ICkgJyArIHRoaXMubmFtZSArICdfZGlmZiArPSAxXFxuICAnICsgZ2VuTmFtZSArICcucGhhc2UgKz0gJyArIHRoaXMubmFtZSArICdfZGlmZiAqICcgKyBpbnB1dHNbMV0gKyAnXFxuICBpZiggJyArIGdlbk5hbWUgKyAnLnBoYXNlID4gMSApICcgKyBnZW5OYW1lICsgJy5waGFzZSAtPSAxXFxuICAnICsgZ2VuTmFtZSArICcubGFzdFNhbXBsZSA9ICcgKyBpbnB1dHNbMF0gKyAnXFxuJztcbiAgICBvdXQgPSAnICcgKyBvdXQ7XG5cbiAgICByZXR1cm4gW2dlbk5hbWUgKyAnLnBoYXNlJywgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xLCByYXRlKSB7XG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgcGhhc2U6IDAsXG4gICAgbGFzdFNhbXBsZTogMCxcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCByYXRlXVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ3JvdW5kJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sIHRoaXMubmFtZSwgTWF0aC5yb3VuZCkpO1xuXG4gICAgICBvdXQgPSAnZ2VuLnJvdW5kKCAnICsgaW5wdXRzWzBdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIHJvdW5kID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgcm91bmQuaW5wdXRzID0gW3hdO1xuXG4gIHJldHVybiByb3VuZDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdzYWgnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgb3V0ID0gdm9pZCAwO1xuXG4gICAgX2dlbi5kYXRhW3RoaXMubmFtZV0gPSAwO1xuICAgIF9nZW4uZGF0YVt0aGlzLm5hbWUgKyAnX2NvbnRyb2wnXSA9IDA7XG5cbiAgICBvdXQgPSAnIHZhciAnICsgdGhpcy5uYW1lICsgJyA9IGdlbi5kYXRhLicgKyB0aGlzLm5hbWUgKyAnX2NvbnRyb2wsXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfdHJpZ2dlciA9ICcgKyBpbnB1dHNbMV0gKyAnID4gJyArIGlucHV0c1syXSArICcgPyAxIDogMFxcblxcbiAgaWYoICcgKyB0aGlzLm5hbWUgKyAnX3RyaWdnZXIgIT09ICcgKyB0aGlzLm5hbWUgKyAnICApIHtcXG4gICAgaWYoICcgKyB0aGlzLm5hbWUgKyAnX3RyaWdnZXIgPT09IDEgKSBcXG4gICAgICBnZW4uZGF0YS4nICsgdGhpcy5uYW1lICsgJyA9ICcgKyBpbnB1dHNbMF0gKyAnXFxuICAgIGdlbi5kYXRhLicgKyB0aGlzLm5hbWUgKyAnX2NvbnRyb2wgPSAnICsgdGhpcy5uYW1lICsgJ190cmlnZ2VyXFxuICB9XFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJ2dlbi5kYXRhLicgKyB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gWydnZW4uZGF0YS4nICsgdGhpcy5uYW1lLCAnICcgKyBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIGNvbnRyb2wpIHtcbiAgdmFyIHRocmVzaG9sZCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMl07XG4gIHZhciBwcm9wZXJ0aWVzID0gYXJndW1lbnRzWzNdO1xuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBkZWZhdWx0cyA9IHsgaW5pdDogMCB9O1xuXG4gIGlmIChwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMSwgY29udHJvbCwgdGhyZXNob2xkXVxuICB9LCBkZWZhdWx0cyk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnc2VsZWN0b3InLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgb3V0ID0gdm9pZCAwLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IDA7XG5cbiAgICBzd2l0Y2ggKGlucHV0cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBpbnB1dHNbMV07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICdfb3V0ID0gJyArIGlucHV0c1swXSArICcgPT09IDEgPyAnICsgaW5wdXRzWzFdICsgJyA6ICcgKyBpbnB1dHNbMl0gKyAnXFxuXFxuJztcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbdGhpcy5uYW1lICsgJ19vdXQnLCBvdXRdO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIG91dCA9ICcgdmFyICcgKyB0aGlzLm5hbWUgKyAnX291dCA9IDBcXG4gIHN3aXRjaCggJyArIGlucHV0c1swXSArICcgKyAxICkge1xcbic7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBvdXQgKz0gJyAgICBjYXNlICcgKyBpICsgJzogJyArIHRoaXMubmFtZSArICdfb3V0ID0gJyArIGlucHV0c1tpXSArICc7IGJyZWFrO1xcbic7XG4gICAgICAgIH1cblxuICAgICAgICBvdXQgKz0gJyAgfVxcblxcbic7XG5cbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbdGhpcy5uYW1lICsgJ19vdXQnLCAnICcgKyBvdXRdO1xuICAgIH1cblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lICsgJ19vdXQnO1xuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGlucHV0cyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGlucHV0c1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogaW5wdXRzXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnc2lnbicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIE1hdGguc2lnbikpO1xuXG4gICAgICBvdXQgPSAnZ2VuLnNpZ24oICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpZ24ocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBzaWduID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgc2lnbi5pbnB1dHMgPSBbeF07XG5cbiAgcmV0dXJuIHNpZ247XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnc2luJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICdzaW4nOiBNYXRoLnNpbiB9KTtcblxuICAgICAgb3V0ID0gJ2dlbi5zaW4oICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpbihwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIHNpbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIHNpbi5pbnB1dHMgPSBbeF07XG4gIHNpbi5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIHNpbi5uYW1lID0gc2luLmJhc2VuYW1lICsgJ3tzaW4uaWR9JztcblxuICByZXR1cm4gc2luO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCcuL2hpc3RvcnkuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJyksXG4gICAgX3N3aXRjaCA9IHJlcXVpcmUoJy4vc3dpdGNoLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSkge1xuICAgIHZhciBzbGlkZVVwID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMSA6IGFyZ3VtZW50c1sxXTtcbiAgICB2YXIgc2xpZGVEb3duID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gMSA6IGFyZ3VtZW50c1syXTtcblxuICAgIHZhciB5MSA9IGhpc3RvcnkoMCksXG4gICAgICAgIGZpbHRlciA9IHZvaWQgMCxcbiAgICAgICAgc2xpZGVBbW91bnQgPSB2b2lkIDA7XG5cbiAgICAvL3kgKG4pID0geSAobi0xKSArICgoeCAobikgLSB5IChuLTEpKS9zbGlkZSlcbiAgICBzbGlkZUFtb3VudCA9IF9zd2l0Y2goZ3QoaW4xLCB5MS5vdXQpLCBzbGlkZVVwLCBzbGlkZURvd24pO1xuXG4gICAgZmlsdGVyID0gbWVtbyhhZGQoeTEub3V0LCBkaXYoc3ViKGluMSwgeTEub3V0KSwgc2xpZGVBbW91bnQpKSk7XG5cbiAgICB5MS5pbihmaWx0ZXIpO1xuXG4gICAgcmV0dXJuIGZpbHRlcjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICB2YXIgc3ViID0ge1xuICAgIGlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICAgIG91dCA9IDAsXG4gICAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgICAgbmVlZHNQYXJlbnMgPSBmYWxzZSxcbiAgICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgICAgbGFzdE51bWJlciA9IGlucHV0c1swXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4obGFzdE51bWJlciksXG4gICAgICAgICAgc3ViQXRFbmQgPSBmYWxzZSxcbiAgICAgICAgICBoYXNVZ2VucyA9IGZhbHNlLFxuICAgICAgICAgIHJldHVyblZhbHVlID0gMDtcblxuICAgICAgdGhpcy5pbnB1dHMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSkgaGFzVWdlbnMgPSB0cnVlO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChoYXNVZ2Vucykge1xuICAgICAgICAvLyBzdG9yZSBpbiB2YXJpYWJsZSBmb3IgZnV0dXJlIHJlZmVyZW5jZVxuICAgICAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAoJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dCA9ICcoJztcbiAgICAgIH1cblxuICAgICAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgICAgaWYgKGkgPT09IDApIHJldHVybjtcblxuICAgICAgICB2YXIgaXNOdW1iZXJVZ2VuID0gaXNOYU4odiksXG4gICAgICAgICAgICBpc0ZpbmFsSWR4ID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDE7XG5cbiAgICAgICAgaWYgKCFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4pIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAtIHY7XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXI7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5lZWRzUGFyZW5zID0gdHJ1ZTtcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlciArICcgLSAnICsgdjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNGaW5hbElkeCkgb3V0ICs9ICcgLSAnO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChuZWVkc1BhcmVucykge1xuICAgICAgICBvdXQgKz0gJyknO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0ID0gb3V0LnNsaWNlKDEpOyAvLyByZW1vdmUgb3BlbmluZyBwYXJlblxuICAgICAgfVxuXG4gICAgICBpZiAoaGFzVWdlbnMpIG91dCArPSAnXFxuJztcblxuICAgICAgcmV0dXJuVmFsdWUgPSBoYXNVZ2VucyA/IFt0aGlzLm5hbWUsIG91dF0gOiBvdXQ7XG5cbiAgICAgIGlmIChoYXNVZ2VucykgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgc3ViLm5hbWUgPSAnc3ViJyArIHN1Yi5pZDtcblxuICByZXR1cm4gc3ViO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3N3aXRjaCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBpZiAoaW5wdXRzWzFdID09PSBpbnB1dHNbMl0pIHJldHVybiBpbnB1dHNbMV07IC8vIGlmIGJvdGggcG90ZW50aWFsIG91dHB1dHMgYXJlIHRoZSBzYW1lIGp1c3QgcmV0dXJuIG9uZSBvZiB0aGVtXG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICdfb3V0ID0gJyArIGlucHV0c1swXSArICcgPT09IDEgPyAnICsgaW5wdXRzWzFdICsgJyA6ICcgKyBpbnB1dHNbMl0gKyAnXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lICsgJ19vdXQnO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUgKyAnX291dCcsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnRyb2wpIHtcbiAgdmFyIGluMSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbMV07XG4gIHZhciBpbjIgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyAwIDogYXJndW1lbnRzWzJdO1xuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtjb250cm9sLCBpbjEsIGluMl1cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAndDYwJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgcmV0dXJuVmFsdWUgPSB2b2lkIDA7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCAnZXhwJywgTWF0aC5leHApKTtcblxuICAgICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gZ2VuLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gJyArIGlucHV0c1swXSArICcgKVxcblxcbic7XG5cbiAgICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gb3V0O1xuXG4gICAgICByZXR1cm5WYWx1ZSA9IFt0aGlzLm5hbWUsIG91dF07XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguZXhwKC02LjkwNzc1NTI3ODkyMSAvIGlucHV0c1swXSk7XG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0O1xuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgdDYwID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgdDYwLmlucHV0cyA9IFt4XTtcbiAgdDYwLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgcmV0dXJuIHQ2MDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICd0YW4nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKHsgJ3Rhbic6IE1hdGgudGFuIH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLnRhbiggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgudGFuKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgdGFuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgdGFuLmlucHV0cyA9IFt4XTtcbiAgdGFuLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgdGFuLm5hbWUgPSB0YW4uYmFzZW5hbWUgKyAne3Rhbi5pZH0nO1xuXG4gIHJldHVybiB0YW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbHQgPSByZXF1aXJlKCcuL2x0LmpzJyksXG4gICAgcGhhc29yID0gcmVxdWlyZSgnLi9waGFzb3IuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmcmVxdWVuY3kgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyA0NDAgOiBhcmd1bWVudHNbMF07XG4gIHZhciBwdWxzZXdpZHRoID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gLjUgOiBhcmd1bWVudHNbMV07XG5cbiAgdmFyIGdyYXBoID0gbHQoYWNjdW0oZGl2KGZyZXF1ZW5jeSwgNDQxMDApKSwgLjUpO1xuXG4gIGdyYXBoLm5hbWUgPSAndHJhaW4nICsgZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiBncmFwaDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBkYXRhID0gcmVxdWlyZSgnLi9kYXRhLmpzJyk7XG5cbnZhciBpc1N0ZXJlbyA9IGZhbHNlO1xuXG52YXIgdXRpbGl0aWVzID0ge1xuICBjdHg6IG51bGwsXG5cbiAgY2xlYXI6IGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgIHRoaXMuY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9O1xuICAgIHRoaXMuY2xlYXIuY2FsbGJhY2tzLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiB2KCk7XG4gICAgfSk7XG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MubGVuZ3RoID0gMDtcbiAgfSxcbiAgY3JlYXRlQ29udGV4dDogZnVuY3Rpb24gY3JlYXRlQ29udGV4dCgpIHtcbiAgICB2YXIgQUMgPSB0eXBlb2YgQXVkaW9Db250ZXh0ID09PSAndW5kZWZpbmVkJyA/IHdlYmtpdEF1ZGlvQ29udGV4dCA6IEF1ZGlvQ29udGV4dDtcbiAgICB0aGlzLmN0eCA9IG5ldyBBQygpO1xuICAgIGdlbi5zYW1wbGVyYXRlID0gdGhpcy5jdHguc2FtcGxlUmF0ZTtcblxuICAgIHZhciBzdGFydCA9IGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgaWYgKHR5cGVvZiBBQyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHN0YXJ0KTtcblxuICAgICAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgIC8vIHJlcXVpcmVkIHRvIHN0YXJ0IGF1ZGlvIHVuZGVyIGlPUyA2XG4gICAgICAgICAgICB2YXIgbXlTb3VyY2UgPSB1dGlsaXRpZXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICAgICAgbXlTb3VyY2UuY29ubmVjdCh1dGlsaXRpZXMuY3R4LmRlc3RpbmF0aW9uKTtcbiAgICAgICAgICAgIG15U291cmNlLm5vdGVPbigwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgc3RhcnQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBjcmVhdGVTY3JpcHRQcm9jZXNzb3I6IGZ1bmN0aW9uIGNyZWF0ZVNjcmlwdFByb2Nlc3NvcigpIHtcbiAgICB0aGlzLm5vZGUgPSB0aGlzLmN0eC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoMTAyNCwgMCwgMiksIHRoaXMuY2xlYXJGdW5jdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH0sIHRoaXMuY2FsbGJhY2sgPSB0aGlzLmNsZWFyRnVuY3Rpb247XG5cbiAgICB0aGlzLm5vZGUub25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbiAoYXVkaW9Qcm9jZXNzaW5nRXZlbnQpIHtcbiAgICAgIHZhciBvdXRwdXRCdWZmZXIgPSBhdWRpb1Byb2Nlc3NpbmdFdmVudC5vdXRwdXRCdWZmZXI7XG5cbiAgICAgIHZhciBsZWZ0ID0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKDApLFxuICAgICAgICAgIHJpZ2h0ID0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKDEpO1xuXG4gICAgICBmb3IgKHZhciBzYW1wbGUgPSAwOyBzYW1wbGUgPCBsZWZ0Lmxlbmd0aDsgc2FtcGxlKyspIHtcbiAgICAgICAgaWYgKCFpc1N0ZXJlbykge1xuICAgICAgICAgIGxlZnRbc2FtcGxlXSA9IHJpZ2h0W3NhbXBsZV0gPSB1dGlsaXRpZXMuY2FsbGJhY2soKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgb3V0ID0gdXRpbGl0aWVzLmNhbGxiYWNrKCk7XG4gICAgICAgICAgbGVmdFtzYW1wbGVdID0gb3V0WzBdO1xuICAgICAgICAgIHJpZ2h0W3NhbXBsZV0gPSBvdXRbMV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5ub2RlLmNvbm5lY3QodGhpcy5jdHguZGVzdGluYXRpb24pO1xuXG4gICAgLy90aGlzLm5vZGUuY29ubmVjdCggdGhpcy5hbmFseXplciApXG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgcGxheUdyYXBoOiBmdW5jdGlvbiBwbGF5R3JhcGgoZ3JhcGgsIGRlYnVnKSB7XG4gICAgdmFyIG1lbSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IDQ0MTAwICogMTAgOiBhcmd1bWVudHNbMl07XG5cbiAgICB1dGlsaXRpZXMuY2xlYXIoKTtcbiAgICBpZiAoZGVidWcgPT09IHVuZGVmaW5lZCkgZGVidWcgPSBmYWxzZTtcblxuICAgIGlzU3RlcmVvID0gQXJyYXkuaXNBcnJheShncmFwaCk7XG5cbiAgICB1dGlsaXRpZXMuY2FsbGJhY2sgPSBnZW4uY3JlYXRlQ2FsbGJhY2soZ3JhcGgsIG1lbSwgZGVidWcpO1xuXG4gICAgaWYgKHV0aWxpdGllcy5jb25zb2xlKSB1dGlsaXRpZXMuY29uc29sZS5zZXRWYWx1ZSh1dGlsaXRpZXMuY2FsbGJhY2sudG9TdHJpbmcoKSk7XG5cbiAgICByZXR1cm4gdXRpbGl0aWVzLmNhbGxiYWNrO1xuICB9LFxuICBsb2FkU2FtcGxlOiBmdW5jdGlvbiBsb2FkU2FtcGxlKHNvdW5kRmlsZVBhdGgsIGRhdGEpIHtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgcmVxLm9wZW4oJ0dFVCcsIHNvdW5kRmlsZVBhdGgsIHRydWUpO1xuICAgIHJlcS5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXVkaW9EYXRhID0gcmVxLnJlc3BvbnNlO1xuXG4gICAgICAgIHV0aWxpdGllcy5jdHguZGVjb2RlQXVkaW9EYXRhKGF1ZGlvRGF0YSwgZnVuY3Rpb24gKGJ1ZmZlcikge1xuICAgICAgICAgIGRhdGEuYnVmZmVyID0gYnVmZmVyLmdldENoYW5uZWxEYXRhKDApO1xuICAgICAgICAgIHJlc29sdmUoZGF0YS5idWZmZXIpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICByZXEuc2VuZCgpO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cbn07XG5cbnV0aWxpdGllcy5jbGVhci5jYWxsYmFja3MgPSBbXTtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsaXRpZXM7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKlxuICogYWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9jb3JiYW5icm9vay9kc3AuanMvYmxvYi9tYXN0ZXIvZHNwLmpzXG4gKiBzdGFydGluZyBhdCBsaW5lIDE0MjdcbiAqIHRha2VuIDgvMTUvMTZcbiovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBiYXJ0bGV0dDogZnVuY3Rpb24gYmFydGxldHQobGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiAyIC8gKGxlbmd0aCAtIDEpICogKChsZW5ndGggLSAxKSAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKTtcbiAgfSxcbiAgYmFydGxldHRIYW5uOiBmdW5jdGlvbiBiYXJ0bGV0dEhhbm4obGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiAwLjYyIC0gMC40OCAqIE1hdGguYWJzKGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMC41KSAtIDAuMzggKiBNYXRoLmNvcygyICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKTtcbiAgfSxcbiAgYmxhY2ttYW46IGZ1bmN0aW9uIGJsYWNrbWFuKGxlbmd0aCwgaW5kZXgsIGFscGhhKSB7XG4gICAgdmFyIGEwID0gKDEgLSBhbHBoYSkgLyAyLFxuICAgICAgICBhMSA9IDAuNSxcbiAgICAgICAgYTIgPSBhbHBoYSAvIDI7XG5cbiAgICByZXR1cm4gYTAgLSBhMSAqIE1hdGguY29zKDIgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpICsgYTIgKiBNYXRoLmNvcyg0ICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKTtcbiAgfSxcbiAgY29zaW5lOiBmdW5jdGlvbiBjb3NpbmUobGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiBNYXRoLmNvcyhNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSBNYXRoLlBJIC8gMik7XG4gIH0sXG4gIGdhdXNzOiBmdW5jdGlvbiBnYXVzcyhsZW5ndGgsIGluZGV4LCBhbHBoYSkge1xuICAgIHJldHVybiBNYXRoLnBvdyhNYXRoLkUsIC0wLjUgKiBNYXRoLnBvdygoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSAvIChhbHBoYSAqIChsZW5ndGggLSAxKSAvIDIpLCAyKSk7XG4gIH0sXG4gIGhhbW1pbmc6IGZ1bmN0aW9uIGhhbW1pbmcobGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiAwLjU0IC0gMC40NiAqIE1hdGguY29zKE1hdGguUEkgKiAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkpO1xuICB9LFxuICBoYW5uOiBmdW5jdGlvbiBoYW5uKGxlbmd0aCwgaW5kZXgpIHtcbiAgICByZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyhNYXRoLlBJICogMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKSk7XG4gIH0sXG4gIGxhbmN6b3M6IGZ1bmN0aW9uIGxhbmN6b3MobGVuZ3RoLCBpbmRleCkge1xuICAgIHZhciB4ID0gMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMTtcbiAgICByZXR1cm4gTWF0aC5zaW4oTWF0aC5QSSAqIHgpIC8gKE1hdGguUEkgKiB4KTtcbiAgfSxcbiAgcmVjdGFuZ3VsYXI6IGZ1bmN0aW9uIHJlY3Rhbmd1bGFyKGxlbmd0aCwgaW5kZXgpIHtcbiAgICByZXR1cm4gMTtcbiAgfSxcbiAgdHJpYW5ndWxhcjogZnVuY3Rpb24gdHJpYW5ndWxhcihsZW5ndGgsIGluZGV4KSB7XG4gICAgcmV0dXJuIDIgLyBsZW5ndGggKiAobGVuZ3RoIC8gMiAtIE1hdGguYWJzKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikpO1xuICB9LFxuICBleHBvbmVudGlhbDogZnVuY3Rpb24gZXhwb25lbnRpYWwobGVuZ3RoLCBpbmRleCwgYWxwaGEpIHtcbiAgICByZXR1cm4gTWF0aC5wb3coaW5kZXggLyBsZW5ndGgsIGFscGhhKTtcbiAgfSxcbiAgbGluZWFyOiBmdW5jdGlvbiBsaW5lYXIobGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiBpbmRleCAvIGxlbmd0aDtcbiAgfVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBmbG9vciA9IHJlcXVpcmUoJy4vZmxvb3IuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3dyYXAnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBjb2RlID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgc2lnbmFsID0gaW5wdXRzWzBdLFxuICAgICAgICBtaW4gPSBpbnB1dHNbMV0sXG4gICAgICAgIG1heCA9IGlucHV0c1syXSxcbiAgICAgICAgb3V0ID0gdm9pZCAwLFxuICAgICAgICBkaWZmID0gdm9pZCAwO1xuXG4gICAgLy9vdXQgPSBgKCgoJHtpbnB1dHNbMF19IC0gJHt0aGlzLm1pbn0pICUgJHtkaWZmfSAgKyAke2RpZmZ9KSAlICR7ZGlmZn0gKyAke3RoaXMubWlufSlgXG4gICAgLy9jb25zdCBsb25nIG51bVdyYXBzID0gbG9uZygodi1sbykvcmFuZ2UpIC0gKHYgPCBsbyk7XG4gICAgLy9yZXR1cm4gdiAtIHJhbmdlICogZG91YmxlKG51bVdyYXBzKTsgIFxuXG4gICAgaWYgKHRoaXMubWluID09PSAwKSB7XG4gICAgICBkaWZmID0gbWF4O1xuICAgIH0gZWxzZSBpZiAoaXNOYU4obWF4KSB8fCBpc05hTihtaW4pKSB7XG4gICAgICBkaWZmID0gbWF4ICsgJyAtICcgKyBtaW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpZmYgPSBtYXggLSBtaW47XG4gICAgfVxuXG4gICAgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnICsgaW5wdXRzWzBdICsgJ1xcbiAgaWYoICcgKyB0aGlzLm5hbWUgKyAnIDwgJyArIHRoaXMubWluICsgJyApICcgKyB0aGlzLm5hbWUgKyAnICs9ICcgKyBkaWZmICsgJ1xcbiAgZWxzZSBpZiggJyArIHRoaXMubmFtZSArICcgPiAnICsgdGhpcy5tYXggKyAnICkgJyArIHRoaXMubmFtZSArICcgLT0gJyArIGRpZmYgKyAnXFxuXFxuJztcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCAnICcgKyBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgdmFyIG1pbiA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMV07XG4gIHZhciBtYXggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyAxIDogYXJndW1lbnRzWzJdO1xuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgbWluOiBtaW4sXG4gICAgbWF4OiBtYXgsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMSwgbWluLCBtYXhdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBNZW1vcnlIZWxwZXIgPSB7XG4gIGNyZWF0ZTogZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIHZhciBzaXplID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gNDA5NiA6IGFyZ3VtZW50c1swXTtcbiAgICB2YXIgbWVtdHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IEZsb2F0MzJBcnJheSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIHZhciBoZWxwZXIgPSBPYmplY3QuY3JlYXRlKHRoaXMpO1xuXG4gICAgT2JqZWN0LmFzc2lnbihoZWxwZXIsIHtcbiAgICAgIGhlYXA6IG5ldyBtZW10eXBlKHNpemUpLFxuICAgICAgbGlzdDoge30sXG4gICAgICBmcmVlTGlzdDoge31cbiAgICB9KTtcblxuICAgIHJldHVybiBoZWxwZXI7XG4gIH0sXG4gIGFsbG9jOiBmdW5jdGlvbiBhbGxvYyhzaXplLCBpbW11dGFibGUpIHtcbiAgICB2YXIgaWR4ID0gLTE7XG5cbiAgICBpZiAoc2l6ZSA+IHRoaXMuaGVhcC5sZW5ndGgpIHtcbiAgICAgIHRocm93IEVycm9yKCdBbGxvY2F0aW9uIHJlcXVlc3QgaXMgbGFyZ2VyIHRoYW4gaGVhcCBzaXplIG9mICcgKyB0aGlzLmhlYXAubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5mcmVlTGlzdCkge1xuICAgICAgdmFyIGNhbmRpZGF0ZSA9IHRoaXMuZnJlZUxpc3Rba2V5XTtcblxuICAgICAgaWYgKGNhbmRpZGF0ZS5zaXplID49IHNpemUpIHtcbiAgICAgICAgaWR4ID0ga2V5O1xuXG4gICAgICAgIHRoaXMubGlzdFtpZHhdID0geyBzaXplOiBzaXplLCBpbW11dGFibGU6IGltbXV0YWJsZSwgcmVmZXJlbmNlczogMSB9O1xuXG4gICAgICAgIGlmIChjYW5kaWRhdGUuc2l6ZSAhPT0gc2l6ZSkge1xuICAgICAgICAgIHZhciBuZXdJbmRleCA9IGlkeCArIHNpemUsXG4gICAgICAgICAgICAgIG5ld0ZyZWVTaXplID0gdm9pZCAwO1xuXG4gICAgICAgICAgZm9yICh2YXIgX2tleSBpbiB0aGlzLmxpc3QpIHtcbiAgICAgICAgICAgIGlmIChfa2V5ID4gbmV3SW5kZXgpIHtcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemUgPSBfa2V5IC0gbmV3SW5kZXg7XG4gICAgICAgICAgICAgIHRoaXMuZnJlZUxpc3RbbmV3SW5kZXhdID0gbmV3RnJlZVNpemU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlkeCAhPT0gLTEpIGRlbGV0ZSB0aGlzLmZyZWVMaXN0W2lkeF07XG5cbiAgICBpZiAoaWR4ID09PSAtMSkge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmxpc3QpLFxuICAgICAgICAgIGxhc3RJbmRleCA9IHZvaWQgMDtcblxuICAgICAgaWYgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIC8vIGlmIG5vdCBmaXJzdCBhbGxvY2F0aW9uLi4uXG4gICAgICAgIGxhc3RJbmRleCA9IHBhcnNlSW50KGtleXNba2V5cy5sZW5ndGggLSAxXSk7XG5cbiAgICAgICAgaWR4ID0gbGFzdEluZGV4ICsgdGhpcy5saXN0W2xhc3RJbmRleF0uc2l6ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlkeCA9IDA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGlzdFtpZHhdID0geyBzaXplOiBzaXplLCBpbW11dGFibGU6IGltbXV0YWJsZSwgcmVmZXJlbmNlczogMSB9O1xuICAgIH1cblxuICAgIGlmIChpZHggKyBzaXplID49IHRoaXMuaGVhcC5sZW5ndGgpIHtcbiAgICAgIHRocm93IEVycm9yKCdObyBhdmFpbGFibGUgYmxvY2tzIHJlbWFpbiBzdWZmaWNpZW50IGZvciBhbGxvY2F0aW9uIHJlcXVlc3QuJyk7XG4gICAgfVxuICAgIHJldHVybiBpZHg7XG4gIH0sXG4gIGFkZFJlZmVyZW5jZTogZnVuY3Rpb24gYWRkUmVmZXJlbmNlKGluZGV4KSB7XG4gICAgaWYgKHRoaXMubGlzdFtpbmRleF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5saXN0W2luZGV4XS5yZWZlcmVuY2VzKys7XG4gICAgfVxuICB9LFxuICBmcmVlOiBmdW5jdGlvbiBmcmVlKGluZGV4KSB7XG4gICAgaWYgKHRoaXMubGlzdFtpbmRleF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0NhbGxpbmcgZnJlZSgpIG9uIG5vbi1leGlzdGluZyBibG9jay4nKTtcbiAgICB9XG5cbiAgICB2YXIgc2xvdCA9IHRoaXMubGlzdFtpbmRleF07XG4gICAgaWYgKHNsb3QgPT09IDApIHJldHVybjtcbiAgICBzbG90LnJlZmVyZW5jZXMtLTtcblxuICAgIGlmIChzbG90LnJlZmVyZW5jZXMgPT09IDAgJiYgc2xvdC5pbW11dGFibGUgIT09IHRydWUpIHtcbiAgICAgIHRoaXMubGlzdFtpbmRleF0gPSAwO1xuXG4gICAgICB2YXIgZnJlZUJsb2NrU2l6ZSA9IDA7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5saXN0KSB7XG4gICAgICAgIGlmIChrZXkgPiBpbmRleCkge1xuICAgICAgICAgIGZyZWVCbG9ja1NpemUgPSBrZXkgLSBpbmRleDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmZyZWVMaXN0W2luZGV4XSA9IGZyZWVCbG9ja1NpemU7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUhlbHBlcjtcbiIsIi8qXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW50aW1hdHRlcjE1L2hlYXBxdWV1ZS5qcy9ibG9iL21hc3Rlci9oZWFwcXVldWUuanNcbiAqXG4gKiBUaGlzIGltcGxlbWVudGF0aW9uIGlzIHZlcnkgbG9vc2VseSBiYXNlZCBvZmYganMtcHJpb3JpdHktcXVldWVcbiAqIGJ5IEFkYW0gSG9vcGVyIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2FkYW1ob29wZXIvanMtcHJpb3JpdHktcXVldWVcbiAqXG4gKiBUaGUganMtcHJpb3JpdHktcXVldWUgaW1wbGVtZW50YXRpb24gc2VlbWVkIGEgdGVlbnN5IGJpdCBibG9hdGVkXG4gKiB3aXRoIGl0cyByZXF1aXJlLmpzIGRlcGVuZGVuY3kgYW5kIG11bHRpcGxlIHN0b3JhZ2Ugc3RyYXRlZ2llc1xuICogd2hlbiBhbGwgYnV0IG9uZSB3ZXJlIHN0cm9uZ2x5IGRpc2NvdXJhZ2VkLiBTbyBoZXJlIGlzIGEga2luZCBvZlxuICogY29uZGVuc2VkIHZlcnNpb24gb2YgdGhlIGZ1bmN0aW9uYWxpdHkgd2l0aCBvbmx5IHRoZSBmZWF0dXJlcyB0aGF0XG4gKiBJIHBhcnRpY3VsYXJseSBuZWVkZWQuXG4gKlxuICogVXNpbmcgaXQgaXMgcHJldHR5IHNpbXBsZSwgeW91IGp1c3QgY3JlYXRlIGFuIGluc3RhbmNlIG9mIEhlYXBRdWV1ZVxuICogd2hpbGUgb3B0aW9uYWxseSBzcGVjaWZ5aW5nIGEgY29tcGFyYXRvciBhcyB0aGUgYXJndW1lbnQ6XG4gKlxuICogdmFyIGhlYXBxID0gbmV3IEhlYXBRdWV1ZSgpO1xuICpcbiAqIHZhciBjdXN0b21xID0gbmV3IEhlYXBRdWV1ZShmdW5jdGlvbihhLCBiKXtcbiAqICAgLy8gaWYgYiA+IGEsIHJldHVybiBuZWdhdGl2ZVxuICogICAvLyBtZWFucyB0aGF0IGl0IHNwaXRzIG91dCB0aGUgc21hbGxlc3QgaXRlbSBmaXJzdFxuICogICByZXR1cm4gYSAtIGI7XG4gKiB9KTtcbiAqXG4gKiBOb3RlIHRoYXQgaW4gdGhpcyBjYXNlLCB0aGUgZGVmYXVsdCBjb21wYXJhdG9yIGlzIGlkZW50aWNhbCB0b1xuICogdGhlIGNvbXBhcmF0b3Igd2hpY2ggaXMgdXNlZCBleHBsaWNpdGx5IGluIHRoZSBzZWNvbmQgcXVldWUuXG4gKlxuICogT25jZSB5b3UndmUgaW5pdGlhbGl6ZWQgdGhlIGhlYXBxdWV1ZSwgeW91IGNhbiBwbG9wIHNvbWUgbmV3XG4gKiBlbGVtZW50cyBpbnRvIHRoZSBxdWV1ZSB3aXRoIHRoZSBwdXNoIG1ldGhvZCAodmFndWVseSByZW1pbmlzY2VudFxuICogb2YgdHlwaWNhbCBqYXZhc2NyaXB0IGFyYXlzKVxuICpcbiAqIGhlYXBxLnB1c2goNDIpO1xuICogaGVhcHEucHVzaChcImtpdHRlblwiKTtcbiAqXG4gKiBUaGUgcHVzaCBtZXRob2QgcmV0dXJucyB0aGUgbmV3IG51bWJlciBvZiBlbGVtZW50cyBvZiB0aGUgcXVldWUuXG4gKlxuICogWW91IGNhbiBwdXNoIGFueXRoaW5nIHlvdSdkIGxpa2Ugb250byB0aGUgcXVldWUsIHNvIGxvbmcgYXMgeW91clxuICogY29tcGFyYXRvciBmdW5jdGlvbiBpcyBjYXBhYmxlIG9mIGhhbmRsaW5nIGl0LiBUaGUgZGVmYXVsdFxuICogY29tcGFyYXRvciBpcyByZWFsbHkgc3R1cGlkIHNvIGl0IHdvbid0IGJlIGFibGUgdG8gaGFuZGxlIGFueXRoaW5nXG4gKiBvdGhlciB0aGFuIGFuIG51bWJlciBieSBkZWZhdWx0LlxuICpcbiAqIFlvdSBjYW4gcHJldmlldyB0aGUgc21hbGxlc3QgaXRlbSBieSB1c2luZyBwZWVrLlxuICpcbiAqIGhlYXBxLnB1c2goLTk5OTkpO1xuICogaGVhcHEucGVlaygpOyAvLyA9PT4gLTk5OTlcbiAqXG4gKiBUaGUgdXNlZnVsIGNvbXBsZW1lbnQgdG8gdG8gdGhlIHB1c2ggbWV0aG9kIGlzIHRoZSBwb3AgbWV0aG9kLFxuICogd2hpY2ggcmV0dXJucyB0aGUgc21hbGxlc3QgaXRlbSBhbmQgdGhlbiByZW1vdmVzIGl0IGZyb20gdGhlXG4gKiBxdWV1ZS5cbiAqXG4gKiBoZWFwcS5wdXNoKDEpO1xuICogaGVhcHEucHVzaCgyKTtcbiAqIGhlYXBxLnB1c2goMyk7XG4gKiBoZWFwcS5wb3AoKTsgLy8gPT0+IDFcbiAqIGhlYXBxLnBvcCgpOyAvLyA9PT4gMlxuICogaGVhcHEucG9wKCk7IC8vID09PiAzXG4gKi9cbmxldCBIZWFwUXVldWUgPSBmdW5jdGlvbihjbXApe1xuICB0aGlzLmNtcCA9IChjbXAgfHwgZnVuY3Rpb24oYSwgYil7IHJldHVybiBhIC0gYjsgfSk7XG4gIHRoaXMubGVuZ3RoID0gMDtcbiAgdGhpcy5kYXRhID0gW107XG59XG5IZWFwUXVldWUucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gdGhpcy5kYXRhWzBdO1xufTtcbkhlYXBRdWV1ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgdGhpcy5kYXRhLnB1c2godmFsdWUpO1xuXG4gIHZhciBwb3MgPSB0aGlzLmRhdGEubGVuZ3RoIC0gMSxcbiAgcGFyZW50LCB4O1xuXG4gIHdoaWxlKHBvcyA+IDApe1xuICAgIHBhcmVudCA9IChwb3MgLSAxKSA+Pj4gMTtcbiAgICBpZih0aGlzLmNtcCh0aGlzLmRhdGFbcG9zXSwgdGhpcy5kYXRhW3BhcmVudF0pIDwgMCl7XG4gICAgICB4ID0gdGhpcy5kYXRhW3BhcmVudF07XG4gICAgICB0aGlzLmRhdGFbcGFyZW50XSA9IHRoaXMuZGF0YVtwb3NdO1xuICAgICAgdGhpcy5kYXRhW3Bvc10gPSB4O1xuICAgICAgcG9zID0gcGFyZW50O1xuICAgIH1lbHNlIGJyZWFrO1xuICB9XG4gIHJldHVybiB0aGlzLmxlbmd0aCsrO1xufTtcbkhlYXBRdWV1ZS5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24oKXtcbiAgdmFyIGxhc3RfdmFsID0gdGhpcy5kYXRhLnBvcCgpLFxuICByZXQgPSB0aGlzLmRhdGFbMF07XG4gIGlmKHRoaXMuZGF0YS5sZW5ndGggPiAwKXtcbiAgICB0aGlzLmRhdGFbMF0gPSBsYXN0X3ZhbDtcbiAgICB2YXIgcG9zID0gMCxcbiAgICBsYXN0ID0gdGhpcy5kYXRhLmxlbmd0aCAtIDEsXG4gICAgbGVmdCwgcmlnaHQsIG1pbkluZGV4LCB4O1xuICAgIHdoaWxlKDEpe1xuICAgICAgbGVmdCA9IChwb3MgPDwgMSkgKyAxO1xuICAgICAgcmlnaHQgPSBsZWZ0ICsgMTtcbiAgICAgIG1pbkluZGV4ID0gcG9zO1xuICAgICAgaWYobGVmdCA8PSBsYXN0ICYmIHRoaXMuY21wKHRoaXMuZGF0YVtsZWZ0XSwgdGhpcy5kYXRhW21pbkluZGV4XSkgPCAwKSBtaW5JbmRleCA9IGxlZnQ7XG4gICAgICBpZihyaWdodCA8PSBsYXN0ICYmIHRoaXMuY21wKHRoaXMuZGF0YVtyaWdodF0sIHRoaXMuZGF0YVttaW5JbmRleF0pIDwgMCkgbWluSW5kZXggPSByaWdodDtcbiAgICAgIGlmKG1pbkluZGV4ICE9PSBwb3Mpe1xuICAgICAgICB4ID0gdGhpcy5kYXRhW21pbkluZGV4XTtcbiAgICAgICAgdGhpcy5kYXRhW21pbkluZGV4XSA9IHRoaXMuZGF0YVtwb3NdO1xuICAgICAgICB0aGlzLmRhdGFbcG9zXSA9IHg7XG4gICAgICAgIHBvcyA9IG1pbkluZGV4O1xuICAgICAgfWVsc2UgYnJlYWs7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldCA9IGxhc3RfdmFsO1xuICB9XG4gIHRoaXMubGVuZ3RoLS07XG4gIHJldHVybiByZXQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYXBRdWV1ZVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG4gXG4vLyBjb25zdHJ1Y3RvciBmb3Igc2Nocm9lZGVyIGFsbHBhc3MgZmlsdGVyc1xubGV0IGFsbFBhc3MgPSBmdW5jdGlvbiggX2lucHV0LCBsZW5ndGg9NTAwLCBmZWVkYmFjaz0uNSApIHtcbiAgbGV0IGluZGV4ICA9IGcuY291bnRlciggMSwwLGxlbmd0aCApLFxuICAgICAgYnVmZmVyID0gZy5kYXRhKCBsZW5ndGggKSxcbiAgICAgIGJ1ZmZlclNhbXBsZSA9IGcucGVlayggYnVmZmVyLCBpbmRleCwgeyBpbnRlcnA6J25vbmUnLCBtb2RlOidzYW1wbGVzJyB9KSxcbiAgICAgIG91dCA9IGcubWVtbyggZy5hZGQoIGcubXVsKCAtMSwgX2lucHV0KSwgYnVmZmVyU2FtcGxlICkgKVxuICAgICAgICAgICAgICAgIFxuICBnLnBva2UoIGJ1ZmZlciwgZy5hZGQoIF9pbnB1dCwgZy5tdWwoIGJ1ZmZlclNhbXBsZSwgZmVlZGJhY2sgKSApLCBpbmRleCApXG4gXG4gIHJldHVybiBvdXRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhbGxQYXNzXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IEJpbm9wcyA9IHtcbiAgICBleHBvcnQoIG9iaiApIHtcbiAgICAgIGZvciggbGV0IGtleSBpbiBCaW5vcHMgKSB7XG4gICAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgICAgIG9ialsga2V5IF0gPSBCaW5vcHNbIGtleSBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIEFkZCggLi4uYXJncyApIHtcbiAgICAgIGxldCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICByZXR1cm4geyBiaW5vcDp0cnVlLCBvcDonKycsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonYWRkJyArIGlkLCBpZCB9XG4gICAgfSxcblxuICAgIFN1YiggLi4uYXJncyApIHtcbiAgICAgIGxldCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICByZXR1cm4geyBiaW5vcDp0cnVlLCBvcDonLScsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonc3ViJyArIGlkLCBpZCB9XG4gICAgfSxcblxuICAgIE11bCggLi4uYXJncyApIHtcbiAgICAgIGxldCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICByZXR1cm4geyBiaW5vcDp0cnVlLCBvcDonKicsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonbXVsJyArIGlkLCBpZCB9XG4gICAgfSxcblxuICAgIERpdiggLi4uYXJncyApIHtcbiAgICAgIGxldCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICByZXR1cm4geyBiaW5vcDp0cnVlLCBvcDonLycsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonZGl2JyArIGlkLCBpZCB9XG4gICAgfSxcblxuICAgIE1vZCggLi4uYXJncyApIHtcbiAgICAgIGxldCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICByZXR1cm4geyBiaW5vcDp0cnVlLCBvcDonJScsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonbW9kJyArIGlkLCBpZCB9XG4gICAgfSwgICBcbiAgfVxuXG4gIHJldHVybiBCaW5vcHNcbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgR2liYmVyaXNoLmdlbmlzaC5iaXF1YWQgPSAoIGlucHV0LCBjdXRvZmYsIFEsIG1vZGUsIGlzU3RlcmVvICkgPT4ge1xuICAgIGxldCBhMCxhMSxhMixjLGIxLGIyLFxuICAgICAgICBpbjFhMCx4MWExLHgyYTIseTFiMSx5MmIyLFxuICAgICAgICBpbjFhMF8xLHgxYTFfMSx4MmEyXzEseTFiMV8xLHkyYjJfMVxuXG4gICAgbGV0IHJldHVyblZhbHVlXG5cbiAgICBsZXQgeDEgPSBzc2QoKSwgeDIgPSBzc2QoKSwgeTEgPSBzc2QoKSwgeTIgPSBzc2QoKVxuICAgIFxuICAgIGxldCB3MCA9IG1lbW8oIG11bCggMiAqIE1hdGguUEksIGRpdiggY3V0b2ZmLCAgZ2VuLnNhbXBsZXJhdGUgKSApICksXG4gICAgICAgIHNpbncwID0gc2luKCB3MCApLFxuICAgICAgICBjb3N3MCA9IGNvcyggdzAgKSxcbiAgICAgICAgYWxwaGEgPSBtZW1vKCBkaXYoIHNpbncwLCBtdWwoIDIsIFEgKSApIClcblxuICAgIGxldCBvbmVNaW51c0Nvc1cgPSBzdWIoIDEsIGNvc3cwIClcblxuICAgIHN3aXRjaCggbW9kZSApIHtcbiAgICAgIGNhc2UgJ0hQJzpcbiAgICAgICAgYTAgPSBtZW1vKCBkaXYoIGFkZCggMSwgY29zdzApICwgMikgKVxuICAgICAgICBhMSA9IG11bCggYWRkKCAxLCBjb3N3MCApLCAtMSApXG4gICAgICAgIGEyID0gYTBcbiAgICAgICAgYyAgPSBhZGQoIDEsIGFscGhhIClcbiAgICAgICAgYjEgPSBtdWwoIC0yICwgY29zdzAgKVxuICAgICAgICBiMiA9IHN1YiggMSwgYWxwaGEgKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0JQJzpcbiAgICAgICAgYTAgPSBtdWwoIFEsIGFscGhhIClcbiAgICAgICAgYTEgPSAwXG4gICAgICAgIGEyID0gbXVsKCBhMCwgLTEgKVxuICAgICAgICBjICA9IGFkZCggMSwgYWxwaGEgKVxuICAgICAgICBiMSA9IG11bCggLTIgLCBjb3N3MCApXG4gICAgICAgIGIyID0gc3ViKCAxLCBhbHBoYSApXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDogLy8gTFBcbiAgICAgICAgYTAgPSBtZW1vKCBkaXYoIG9uZU1pbnVzQ29zVywgMikgKVxuICAgICAgICBhMSA9IG9uZU1pbnVzQ29zV1xuICAgICAgICBhMiA9IGEwXG4gICAgICAgIGMgID0gYWRkKCAxLCBhbHBoYSApXG4gICAgICAgIGIxID0gbXVsKCAtMiAsIGNvc3cwIClcbiAgICAgICAgYjIgPSBzdWIoIDEsIGFscGhhIClcbiAgICB9XG5cbiAgICBhMCA9IGRpdiggYTAsIGMgKTsgYTEgPSBkaXYoIGExLCBjICk7IGEyID0gZGl2KCBhMiwgYyApXG4gICAgYjEgPSBkaXYoIGIxLCBjICk7IGIyID0gZGl2KCBiMiwgYyApXG5cbiAgICBpbjFhMCA9IG11bCggeDEuaW4oIGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dCApLCBhMCApXG4gICAgeDFhMSAgPSBtdWwoIHgyLmluKCB4MS5vdXQgKSwgYTEgKVxuICAgIHgyYTIgID0gbXVsKCB4Mi5vdXQsICAgICAgICAgIGEyIClcblxuICAgIGxldCBzdW1MZWZ0ID0gYWRkKCBpbjFhMCwgeDFhMSwgeDJhMiApXG5cbiAgICB5MWIxID0gbXVsKCB5Mi5pbiggeTEub3V0ICksIGIxIClcbiAgICB5MmIyID0gbXVsKCB5Mi5vdXQsIGIyIClcblxuICAgIGxldCBzdW1SaWdodCA9IGFkZCggeTFiMSwgeTJiMiApXG5cbiAgICBsZXQgZGlmZiA9IHN1Yiggc3VtTGVmdCwgc3VtUmlnaHQgKVxuXG4gICAgeTEuaW4oIGRpZmYgKVxuXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgbGV0IHgxXzEgPSBzc2QoKSwgeDJfMSA9IHNzZCgpLCB5MV8xID0gc3NkKCksIHkyXzEgPSBzc2QoKVxuXG4gICAgICBpbjFhMF8xID0gbXVsKCB4MV8xLmluKCBpbnB1dFsxXSAgICApLCBhMCApXG4gICAgICB4MWExXzEgID0gbXVsKCB4Ml8xLmluKCB4MV8xLm91dCApLCBhMSApXG4gICAgICB4MmEyXzEgID0gbXVsKCB4Ml8xLm91dCwgICAgICAgICAgYTIgKVxuXG4gICAgICBsZXQgc3VtTGVmdF8xID0gYWRkKCBpbjFhMF8xLCB4MWExXzEsIHgyYTJfMSApXG5cbiAgICAgIHkxYjFfMSA9IG11bCggeTJfMS5pbiggeTFfMS5vdXQgKSwgYjEgKVxuICAgICAgeTJiMl8xID0gbXVsKCB5Ml8xLm91dCwgYjIgKVxuXG4gICAgICBsZXQgc3VtUmlnaHRfMSA9IGFkZCggeTFiMV8xLCB5MmIyXzEgKVxuXG4gICAgICBsZXQgZGlmZl8xID0gc3ViKCBzdW1MZWZ0XzEsIHN1bVJpZ2h0XzEgKVxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgZGlmZiwgZGlmZl8xIF1cbiAgICB9ZWxzZXtcbiAgICAgIHJldHVyblZhbHVlID0gZGlmZlxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbiAgbGV0IEJpcXVhZCA9IHByb3BzID0+IHtcbiAgICBsZXQgX3Byb3BzID0gT2JqZWN0LmFzc2lnbigge30sIEJpcXVhZC5kZWZhdWx0cywgcHJvcHMgKSBcblxuICAgIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvXG5cbiAgICBsZXQgZmlsdGVyID0gR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgR2liYmVyaXNoLmdlbmlzaC5iaXF1YWQoIGcuaW4oJ2lucHV0JyksIGcuaW4oJ2N1dG9mZicpLCBnLmluKCdRJyksIF9wcm9wcy5tb2RlIHx8ICdMUCcsIGlzU3RlcmVvICksIFxuICAgICAgJ2JpcXVhZCcsIFxuICAgICAgX3Byb3BzXG4gICAgKVxuICAgIHJldHVybiBmaWx0ZXJcbiAgfVxuXG5cbiAgQmlxdWFkLmRlZmF1bHRzID0ge1xuICAgIGlucHV0OjAsXG4gICAgUTogLjc1LFxuICAgIGN1dG9mZjo1NTAsXG4gICAgbW9kZTonTFAnXG4gIH1cblxuICByZXR1cm4gQmlxdWFkXG5cbn1cblxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIHVnZW4gPSByZXF1aXJlKCAnLi91Z2VuLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgQnVzID0geyBcbiAgICBmYWN0b3J5OiBudWxsLC8vR2liYmVyaXNoLmZhY3RvcnkoIGcuYWRkKCAwICkgLCAnYnVzJywgWyAwLCAxIF0gICksXG5cbiAgICBjcmVhdGUoKSB7XG4gICAgICBsZXQgYnVzID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBcbiAgICAgIGJ1cy5jYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBvdXRwdXRbIDAgXSA9IG91dHB1dFsgMSBdID0gMFxuXG4gICAgICAgIGZvciggbGV0IGkgPSAwLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgbGV0IGlucHV0ID0gYXJndW1lbnRzWyBpIF1cbiAgICAgICAgICBvdXRwdXRbIDAgXSArPSBpbnB1dFxuICAgICAgICAgIG91dHB1dFsgMSBdICs9IGlucHV0XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb3V0cHV0XG4gICAgICB9XG5cbiAgICAgIGJ1cy5pZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICBidXMuZGlydHkgPSB0cnVlXG4gICAgICBidXMudHlwZSA9ICdidXMnXG4gICAgICBidXMudWdlbk5hbWUgPSAnYnVzXycgKyBidXMuaWRcbiAgICAgIGJ1cy5pbnB1dHMgPSBbXVxuICAgICAgYnVzLmlucHV0TmFtZXMgPSBbXVxuXG4gICAgICBidXMuY29ubmVjdCA9ICggdGFyZ2V0LCBsZXZlbCA9IDEgKSA9PiB7XG4gICAgICAgIGlmKCB0YXJnZXQuaXNTdGVyZW8gKSB7XG4gICAgICAgICAgdGhyb3cgRXJyb3IoICdZb3UgY2Fubm90IGNvbm5lY3QgYSBzdGVyZW8gaW5wdXQgdG8gYSBtb25vIGJ1cy4nIClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCB0YXJnZXQuaW5wdXRzIClcbiAgICAgICAgICB0YXJnZXQuaW5wdXRzLnB1c2goIGJ1cyApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0YXJnZXQuaW5wdXQgPSBidXNcblxuICAgICAgICBHaWJiZXJpc2guZGlydHkoIHRhcmdldCApXG4gICAgICAgIHJldHVybiBidXNcbiAgICAgIH1cblxuICAgICAgYnVzLmNoYWluID0gKCB0YXJnZXQsIGxldmVsID0gMSApID0+IHtcbiAgICAgICAgYnVzLmNvbm5lY3QoIHRhcmdldCwgbGV2ZWwgKVxuICAgICAgICByZXR1cm4gdGFyZ2V0XG4gICAgICB9XG5cbiAgICAgIGJ1cy5kaXNjb25uZWN0ID0gKCB1Z2VuICkgPT4ge1xuICAgICAgICBsZXQgcmVtb3ZlSWR4ID0gLTFcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBidXMuaW5wdXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIGxldCBpbnB1dCA9IGJ1cy5pbnB1dHNbIGkgXVxuXG4gICAgICAgICAgaWYoIGlzTmFOKCBpbnB1dCApICYmIHVnZW4gPT09IGlucHV0ICkge1xuICAgICAgICAgICAgcmVtb3ZlSWR4ID0gaVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggcmVtb3ZlSWR4ICE9PSAtMSApIHtcbiAgICAgICAgICBidXMuaW5wdXRzLnNwbGljZSggcmVtb3ZlSWR4LCAxIClcbiAgICAgICAgICBHaWJiZXJpc2guZGlydHkoIGJ1cyApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIGJ1c1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBCdXMuY3JlYXRlXG5cbn1cblxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIHVnZW4gPSByZXF1aXJlKCAnLi91Z2VuLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgQnVzMiA9IHsgXG4gICAgY3JlYXRlKCkge1xuICAgICAgbGV0IG91dHB1dCA9IG5ldyBGbG9hdDMyQXJyYXkoIDIgKVxuXG4gICAgICBsZXQgYnVzID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbiAgICAgIE9iamVjdC5hc3NpZ24oIGJ1cywge1xuICAgICAgICBjYWxsYmFjaygpIHtcbiAgICAgICAgICBvdXRwdXRbIDAgXSA9IG91dHB1dFsgMSBdID0gMFxuXG4gICAgICAgICAgZm9yKCBsZXQgaSA9IDAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIGxldCBpbnB1dCA9IGFyZ3VtZW50c1sgaSBdLFxuICAgICAgICAgICAgICBpc0FycmF5ID0gaW5wdXQgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXlcblxuICAgICAgICAgICAgb3V0cHV0WyAwIF0gKz0gaXNBcnJheSA/IGlucHV0WyAwIF0gOiBpbnB1dFxuICAgICAgICAgICAgb3V0cHV0WyAxIF0gKz0gaXNBcnJheSA/IGlucHV0WyAxIF0gOiBpbnB1dFxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBvdXRwdXRcbiAgICAgICAgfSxcbiAgICAgICAgaWQgOiBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKSxcbiAgICAgICAgZGlydHkgOiB0cnVlLFxuICAgICAgICB0eXBlIDogJ2J1cycsXG4gICAgICAgIGlucHV0cyA6IFtdLFxuICAgICAgICBpbnB1dE5hbWVzIDogW10sXG4gICAgICB9KVxuXG4gICAgICBidXMudWdlbk5hbWUgPSBidXMuY2FsbGJhY2sudWdlbk5hbWUgPSAnYnVzMl8nICsgYnVzLmlkXG5cbiAgICAgIGJ1cy5kaXNjb25uZWN0ID0gKCB1Z2VuICkgPT4ge1xuICAgICAgICBsZXQgcmVtb3ZlSWR4ID0gLTFcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBidXMuaW5wdXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIGxldCBpbnB1dCA9IGJ1cy5pbnB1dHNbIGkgXVxuXG4gICAgICAgICAgaWYoIGlzTmFOKCBpbnB1dCApICYmIHVnZW4gPT09IGlucHV0ICkge1xuICAgICAgICAgICAgcmVtb3ZlSWR4ID0gaVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiggcmVtb3ZlSWR4ICE9PSAtMSApIHtcbiAgICAgICAgICBidXMuaW5wdXRzLnNwbGljZSggcmVtb3ZlSWR4LCAxIClcbiAgICAgICAgICBHaWJiZXJpc2guZGlydHkoIGJ1cyApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIGJ1c1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBCdXMyLmNyZWF0ZVxuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5sZXQgY29tYkZpbHRlciA9IGZ1bmN0aW9uKCBfaW5wdXQsIGNvbWJMZW5ndGgsIGRhbXBpbmc9LjUqLjQsIGZlZWRiYWNrQ29lZmY9Ljg0ICkge1xuICBsZXQgbGFzdFNhbXBsZSAgID0gZy5oaXN0b3J5KCksXG4gIFx0ICByZWFkV3JpdGVJZHggPSBnLmNvdW50ZXIoIDEsMCxjb21iTGVuZ3RoICksXG4gICAgICBjb21iQnVmZmVyICAgPSBnLmRhdGEoIGNvbWJMZW5ndGggKSxcblx0ICAgIG91dCAgICAgICAgICA9IGcucGVlayggY29tYkJ1ZmZlciwgcmVhZFdyaXRlSWR4LCB7IGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pLFxuICAgICAgc3RvcmVJbnB1dCAgID0gZy5tZW1vKCBnLmFkZCggZy5tdWwoIG91dCwgZy5zdWIoIDEsIGRhbXBpbmcpKSwgZy5tdWwoIGxhc3RTYW1wbGUub3V0LCBkYW1waW5nICkgKSApXG4gICAgICBcbiAgbGFzdFNhbXBsZS5pbiggc3RvcmVJbnB1dCApXG4gXG4gIGcucG9rZSggY29tYkJ1ZmZlciwgZy5hZGQoIF9pbnB1dCwgZy5tdWwoIHN0b3JlSW5wdXQsIGZlZWRiYWNrQ29lZmYgKSApLCByZWFkV3JpdGVJZHggKVxuIFxuICByZXR1cm4gb3V0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29tYkZpbHRlclxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgQ29uZ2EgPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBsZXQgY29uZ2EgPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgIGRlY2F5ID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICB0b25lICA9IGcuaW4oICd0b25lJyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQ29uZ2EuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgbGV0IHRyaWdnZXIgPSBnLmJhbmcoKSxcbiAgICAgICAgaW1wdWxzZSA9IGcubXVsKCB0cmlnZ2VyLCA2MCApLFxuICAgICAgICBfZGVjYXkgPSAgZy5zdWIoIC4xMDEsIGcuZGl2KCBkZWNheSwgMTAgKSApLCAvLyBjcmVhdGUgcmFuZ2Ugb2YgLjAwMSAtIC4wOTlcbiAgICAgICAgYnBmID0gZy5zdmYoIGltcHVsc2UsIGZyZXF1ZW5jeSwgX2RlY2F5LCAyLCBmYWxzZSApLFxuICAgICAgICBvdXQgPSBtdWwoIGJwZiwgZ2FpbiApXG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIGNvbmdhLCBvdXQsICdjb25nYScsIHByb3BzICApXG4gICAgXG4gICAgY29uZ2EuZW52ID0gdHJpZ2dlclxuXG4gICAgcmV0dXJuIGNvbmdhXG4gIH1cbiAgXG4gIENvbmdhLmRlZmF1bHRzID0ge1xuICAgIGdhaW46IDEsXG4gICAgZnJlcXVlbmN5OjE5MCxcbiAgICBkZWNheTogMVxuICB9XG5cbiAgcmV0dXJuIENvbmdhXG5cbn1cbiIsImxldCB1Z2VuID0gcmVxdWlyZSggJy4vdWdlbi5qcycgKVxuXG5sZXQgZWZmZWN0ID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbk9iamVjdC5hc3NpZ24oIGVmZmVjdCwge1xuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVmZmVjdFxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBHaWJiZXJpc2guZ2VuaXNoLmZpbHRlcjI0ID0gKCBpbnB1dCwgcmV6LCBjdXRvZmYsIGlzTG93UGFzcyApID0+IHtcbiAgICBsZXQgaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KCBpbnB1dCApLCByZXR1cm5WYWx1ZVxuXG4gICAgbGV0IHBvbGVzTCA9IGcuZGF0YShbIDAsMCwwLDAgXSksXG4gICAgICAgIHBlZWtQcm9wcyA9IHsgaW50ZXJwOidub25lJywgbW9kZTonc2ltcGxlJyB9XG4gICAgICAgIHJlenpMID0gZy5jbGFtcCggZy5tdWwoIGcucGVlayggcG9sZXNMLCAzLCBwZWVrUHJvcHMgKSwgcmV6ICkgKSxcbiAgICAgICAgcEwwID0gZy5wZWVrKCBwb2xlc0wsIDAsIHBlZWtQcm9wcyApLCBcbiAgICAgICAgcEwxID0gZy5wZWVrKCBwb2xlc0wsIDEsIHBlZWtQcm9wcyApLCBcbiAgICAgICAgcEwyID0gZy5wZWVrKCBwb2xlc0wsIDIsIHBlZWtQcm9wcyApLCBcbiAgICAgICAgcEwzID0gZy5wZWVrKCBwb2xlc0wsIDMsIHBlZWtQcm9wcyApIFxuXG4gICAgbGV0IG91dHB1dEwgPSBnLnN1YiggaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0LCByZXp6TCApIFxuXG4gICAgZy5wb2tlKCBwb2xlc0wsIGcuYWRkKCBwTDAsIGcubXVsKCBnLmFkZCggZy5tdWwoLTEscEwwKSwgb3V0cHV0TCApLGN1dG9mZiApKSwgMCApXG4gICAgZy5wb2tlKCBwb2xlc0wsIGcuYWRkKCBwTDEsIGcubXVsKCBnLmFkZCggZy5tdWwoLTEscEwxKSwgcEwwICksIGN1dG9mZiApKSwgMSApXG4gICAgZy5wb2tlKCBwb2xlc0wsIGcuYWRkKCBwTDIsIGcubXVsKCBnLmFkZCggZy5tdWwoLTEscEwyKSwgcEwxICksIGN1dG9mZiApKSwgMiApXG4gICAgZy5wb2tlKCBwb2xlc0wsIGcuYWRkKCBwTDMsIGcubXVsKCBnLmFkZCggZy5tdWwoLTEscEwzKSwgcEwyICksIGN1dG9mZiApKSwgMyApXG4gICAgXG4gICAgbGV0IGxlZnQgPSBnLnN3aXRjaCggaXNMb3dQYXNzLCBwTDMsIGcuc3ViKCBvdXRwdXRMLCBwTDMgKSApXG5cbiAgICBpZiggaXNTdGVyZW8gKSB7XG4gICAgICBsZXQgcG9sZXNSID0gZy5kYXRhKFsgMCwwLDAsMCBdKSxcbiAgICAgICAgICByZXp6UiA9IGcuY2xhbXAoIGcubXVsKCBnLnBlZWsoIHBvbGVzUiwgMywgcGVla1Byb3BzICksIHJleiApICksXG4gICAgICAgICAgb3V0cHV0UiA9IGcuc3ViKCBpbnB1dFsxXSwgcmV6elIgKSwgICAgICAgICAgXG4gICAgICAgICAgcFIwID0gIGcucGVlayggcG9sZXNSLCAwLCBwZWVrUHJvcHMpLFxuICAgICAgICAgIHBSMSA9ICBnLnBlZWsoIHBvbGVzUiwgMSwgcGVla1Byb3BzKSxcbiAgICAgICAgICBwUjIgPSAgZy5wZWVrKCBwb2xlc1IsIDIsIHBlZWtQcm9wcyksXG4gICAgICAgICAgcFIzID0gIGcucGVlayggcG9sZXNSLCAzLCBwZWVrUHJvcHMpXG5cbiAgICAgIGcucG9rZSggcG9sZXNSLCBnLmFkZCggcFIwLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLHBSMCksIG91dHB1dFIgKSwgY3V0b2ZmICkpLCAwIClcbiAgICAgIGcucG9rZSggcG9sZXNSLCBnLmFkZCggcFIxLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLHBSMSksIHBSMCApLCBjdXRvZmYgKSksIDEgKVxuICAgICAgZy5wb2tlKCBwb2xlc1IsIGcuYWRkKCBwUjIsIGcubXVsKCBnLmFkZCggZy5tdWwoLTEscFIyKSwgcFIxICksIGN1dG9mZiApKSwgMiApXG4gICAgICBnLnBva2UoIHBvbGVzUiwgZy5hZGQoIHBSMywgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSxwUjMpLCBwUjIgKSwgY3V0b2ZmICkpLCAzIClcblxuICAgICAgbGV0IHJpZ2h0ID1nLnN3aXRjaCggaXNMb3dQYXNzLCBwUjMsIGcuc3ViKCBvdXRwdXRSLCBwUjMgKSApXG4gICAgICByZXR1cm5WYWx1ZSA9IFtsZWZ0LCByaWdodF1cbiAgICB9ZWxzZXtcbiAgICAgIHJldHVyblZhbHVlID0gbGVmdFxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbiAgbGV0IEZpbHRlcjI0ID0gcHJvcHMgPT4ge1xuICAgIGxldCBmaWx0ZXIgPSBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLmZpbHRlcjI0KCBnLmluKCdpbnB1dCcpLCBnLmluKCdyZXNvbmFuY2UnKSwgZy5pbignY3V0b2ZmJyksIGcuaW4oJ2lzTG93UGFzcycpICksIFxuICAgICAgJ2ZpbHRlcjI0JywgXG4gICAgICBPYmplY3QuYXNzaWduKCB7fSwgRmlsdGVyMjQuZGVmYXVsdHMsIHByb3BzICkgXG4gICAgKVxuICAgIHJldHVybiBmaWx0ZXJcbiAgfVxuXG5cbiAgRmlsdGVyMjQuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICByZXNvbmFuY2U6IDMuNSxcbiAgICBjdXRvZmY6IC4xLFxuICAgIGlzTG93UGFzczoxXG4gIH1cblxuICByZXR1cm4gRmlsdGVyMjRcblxufVxuXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBGbGFuZ2VyID0gaW5wdXRQcm9wcyA9PiB7XG4gIGxldCBwcm9wcyAgID0gT2JqZWN0LmFzc2lnbigge30sIEZsYW5nZXIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgIGZsYW5nZXIgPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICBkZWxheUxlbmd0aCA9IDQ0MTAwLFxuICAgICAgZmVlZGJhY2tDb2VmZiA9IGcuaW4oICdmZWVkYmFjaycgKSxcbiAgICAgIG1vZEFtb3VudCA9IGcuaW4oICdvZmZzZXQnICksXG4gICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgZGVsYXlCdWZmZXJMID0gZy5kYXRhKCBkZWxheUxlbmd0aCApLFxuICAgICAgZGVsYXlCdWZmZXJSXG5cbiAgbGV0IHdyaXRlSWR4ID0gZy5hY2N1bSggMSwwLCB7IG1pbjowLCBtYXg6ZGVsYXlMZW5ndGgsIGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBsZXQgb2Zmc2V0ID0gZy5tdWwoIG1vZEFtb3VudCwgNTAwIClcbiAgXG4gIGxldCByZWFkSWR4ID0gZy53cmFwKCBcbiAgICBnLmFkZCggXG4gICAgICBnLnN1Yiggd3JpdGVJZHgsIG9mZnNldCApLCBcbiAgICAgIGcubXVsKCBnLmN5Y2xlKCBmcmVxdWVuY3kgKSwgZy5zdWIoIG9mZnNldCwgMSApICkgXG4gICAgKSwgXG5cdCAgMCwgXG4gICAgZGVsYXlMZW5ndGhcbiAgKVxuXG4gIGxldCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXRcblxuICBsZXQgZGVsYXllZE91dEwgPSBnLnBlZWsoIGRlbGF5QnVmZmVyTCwgcmVhZElkeCwgeyBpbnRlcnA6J2xpbmVhcicsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBnLnBva2UoIGRlbGF5QnVmZmVyTCwgZy5hZGQoIGxlZnRJbnB1dCwgZy5tdWwoIGRlbGF5ZWRPdXRMLCBmZWVkYmFja0NvZWZmICkgKSwgd3JpdGVJZHggKVxuXG4gIGxldCBsZWZ0ID0gYWRkKCBsZWZ0SW5wdXQsIGRlbGF5ZWRPdXRMICksXG4gICAgICByaWdodFxuXG4gIGlmKCBpc1N0ZXJlbyA9PT0gdHJ1ZSApIHtcbiAgICByaWdodElucHV0ID0gaW5wdXRbMV1cbiAgICBkZWxheUJ1ZmZlclIgPSBnLmRhdGEoIGRlbGF5TGVuZ3RoIClcbiAgICBcbiAgICBsZXQgZGVsYXllZE91dFIgPSBnLnBlZWsoIGRlbGF5QnVmZmVyUiwgcmVhZElkeCwgeyBpbnRlcnA6J2xpbmVhcicsIG1vZGU6J3NhbXBsZXMnIH0pXG5cbiAgICBnLnBva2UoIGRlbGF5QnVmZmVyUiwgZy5hZGQoIHJpZ2h0SW5wdXQsIG11bCggZGVsYXllZE91dFIsIGZlZWRiYWNrQ29lZmYgKSApLCB3cml0ZUlkeCApXG4gICAgcmlnaHQgPSBnLmFkZCggcmlnaHRJbnB1dCwgZGVsYXllZE91dFIgKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgZmxhbmdlcixcbiAgICAgIFsgbGVmdCwgcmlnaHQgXSwgXG4gICAgICAnZmxhbmdlcicsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuXG4gIH1lbHNle1xuICAgIGNvbnNvbGUubG9nKCAnTk9UIFNURVJFTycsIGlzU3RlcmVvIClcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggZmxhbmdlciwgbGVmdCwgJ2ZsYW5nZXInLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiBmbGFuZ2VyXG59XG5cbkZsYW5nZXIuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIGZlZWRiYWNrOi4wMSxcbiAgb2Zmc2V0Oi4yNSxcbiAgZnJlcXVlbmN5Oi41XG59XG5cbnJldHVybiBGbGFuZ2VyXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5sZXQgZmVlZGJhY2tPc2MgPSBmdW5jdGlvbiggZnJlcXVlbmN5LCBmaWx0ZXIsIHB1bHNld2lkdGg9LjUsIGFyZ3VtZW50UHJvcHMgKSB7XG4gIGlmKCBhcmd1bWVudFByb3BzID09PSB1bmRlZmluZWQgKSBhcmd1bWVudFByb3BzID0geyB0eXBlOiAwIH1cblxuICBsZXQgbGFzdFNhbXBsZSA9IGcuaGlzdG9yeSgpLFxuICAgICAgbGFzdFNhbXBsZTIgPSBnLmhpc3RvcnkoKSwgLy8gZm9yIHBvdGVudGlhbCBvc2MgMlxuICAgICAgbGFzdFNhbXBsZU1hc3RlciA9IGcuaGlzdG9yeSgpLCAvLyBmb3IgcG90ZW50aWFsIHN1bSBvZiBvc2MxLG9zYzJcbiAgICAgIC8vIGRldGVybWluZSBwaGFzZSBpbmNyZW1lbnQgYW5kIG1lbW9pemUgcmVzdWx0XG4gICAgICB3ID0gZy5tZW1vKCBnLmRpdiggZnJlcXVlbmN5LCBnLnNhbXBsZXJhdGUgKSApLFxuICAgICAgLy8gY3JlYXRlIHNjYWxpbmcgZmFjdG9yXG4gICAgICBuID0gZy5zdWIoIC0uNSwgdyApLFxuICAgICAgc2NhbGluZyA9IGcubXVsKCBnLm11bCggMTMsIGZpbHRlciApLCBnLnBvdyggbiwgNSApICksXG4gICAgICAvLyBjYWxjdWxhdGUgZGMgb2Zmc2V0IGFuZCBub3JtYWxpemF0aW9uIGZhY3RvcnNcbiAgICAgIERDID0gZy5zdWIoIC4zNzYsIGcubXVsKCB3LCAuNzUyICkgKSxcbiAgICAgIG5vcm0gPSBnLnN1YiggMSwgZy5tdWwoIDIsIHcgKSApLFxuICAgICAgLy8gZGV0ZXJtaW5lIHBoYXNlXG4gICAgICBvc2MxUGhhc2UgPSBnLmFjY3VtKCB3LCAwLCB7IG1pbjotMSB9KSxcbiAgICAgIG9zYzEsIG9zYzIsIG91dFxuXG4gIC8vIGNyZWF0ZSBjdXJyZW50IHNhbXBsZS4uLiBmcm9tIHRoZSBwYXBlcjpcbiAgLy8gb3NjID0gKG9zYyArIHNpbigyKnBpKihwaGFzZSArIG9zYypzY2FsaW5nKSkpKjAuNWY7XG4gIG9zYzEgPSBnLm1lbW8oIFxuICAgIGcubXVsKFxuICAgICAgZy5hZGQoXG4gICAgICAgIGxhc3RTYW1wbGUub3V0LFxuICAgICAgICBnLnNpbihcbiAgICAgICAgICBnLm11bChcbiAgICAgICAgICAgIE1hdGguUEkgKiAyLFxuICAgICAgICAgICAgZy5tZW1vKCBnLmFkZCggb3NjMVBoYXNlLCBnLm11bCggbGFzdFNhbXBsZS5vdXQsIHNjYWxpbmcgKSApIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICksXG4gICAgICAuNVxuICAgIClcbiAgKVxuXG4gIC8vIHN0b3JlIHNhbXBsZSB0byB1c2UgYXMgbW9kdWxhdGlvblxuICBsYXN0U2FtcGxlLmluKCBvc2MxIClcblxuICAvLyBpZiBwd20gLyBzcXVhcmUgd2F2ZWZvcm0gaW5zdGVhZCBvZiBzYXd0b290aC4uLlxuICBpZiggYXJndW1lbnRQcm9wcy50eXBlID09PSAxICkgeyBcbiAgICBvc2MyID0gZy5tdWwoXG4gICAgICBnLmFkZChcbiAgICAgICAgbGFzdFNhbXBsZTIub3V0LFxuICAgICAgICBnLnNpbihcbiAgICAgICAgICBnLm11bChcbiAgICAgICAgICAgIE1hdGguUEkgKiAyLFxuICAgICAgICAgICAgZy5tZW1vKCBnLmFkZCggb3NjMVBoYXNlLCBnLm11bCggbGFzdFNhbXBsZS5vdXQsIHNjYWxpbmcgKSwgcHVsc2V3aWR0aCApIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICksXG4gICAgICAuNVxuICAgIClcblxuICAgIGxhc3RTYW1wbGUyLmluKCBvc2MyIClcbiAgICBvdXQgPSBnLm1lbW8oIGcuc3ViKCBsYXN0U2FtcGxlLm91dCwgbGFzdFNhbXBsZTIub3V0ICkgKVxuICAgIG91dCA9IGcubWVtbyggZy5hZGQoIGcubXVsKCAyLjUsIG91dCApLCBnLm11bCggLTEuNSwgbGFzdFNhbXBsZU1hc3Rlci5vdXQgKSApIClcblxuICAgIGxhc3RTYW1wbGVNYXN0ZXIuaW4oIGcuc3ViKCBvc2MxLCBvc2MyICkgKVxuXG4gIH1lbHNle1xuICAgICAvLyBvZmZzZXQgYW5kIG5vcm1hbGl6ZVxuICAgIG9zYzEgPSBnLmFkZCggZy5tdWwoIDIuNSwgb3NjMSApLCBnLm11bCggLTEuNSwgbGFzdFNhbXBsZS5vdXQgKSApXG4gICAgb3NjMSA9IGcuYWRkKCBvc2MxLCBEQyApXG4gXG4gICAgb3V0ID0gb3NjMVxuICB9XG5cbiAgcmV0dXJuIGcubXVsKCBvdXQsIG5vcm0gKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZlZWRiYWNrT3NjXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgYWxsUGFzcyA9IHJlcXVpcmUoICcuL2FsbHBhc3MuanMnICksXG4gICAgY29tYkZpbHRlciA9IHJlcXVpcmUoICcuL2NvbWJmaWx0ZXIuanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCB0dW5pbmcgPSB7XG4gIGNvbWJDb3VudDpcdCAgXHQ4LFxuICBjb21iVHVuaW5nOiBcdFx0WyAxMTE2LCAxMTg4LCAxMjc3LCAxMzU2LCAxNDIyLCAxNDkxLCAxNTU3LCAxNjE3IF0sICAgICAgICAgICAgICAgICAgICBcbiAgYWxsUGFzc0NvdW50OiBcdDQsXG4gIGFsbFBhc3NUdW5pbmc6XHRbIDIyNSwgNTU2LCA0NDEsIDM0MSBdLFxuICBhbGxQYXNzRmVlZGJhY2s6MC41LFxuICBmaXhlZEdhaW46IFx0XHQgIDAuMDE1LFxuICBzY2FsZURhbXBpbmc6IFx0MC40LFxuICBzY2FsZVJvb206IFx0XHQgIDAuMjgsXG4gIG9mZnNldFJvb206IFx0ICAwLjcsXG4gIHN0ZXJlb1NwcmVhZDogICAyM1xufVxuXG5sZXQgRnJlZXZlcmIgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIEZyZWV2ZXJiLmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICByZXZlcmIgPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKSBcbiAgIFxuICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuICBcbiAgbGV0IGNvbWJzTCA9IFtdLCBjb21ic1IgPSBbXVxuXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIHdldDEgPSBnLmluKCAnd2V0MScpLCB3ZXQyID0gZy5pbiggJ3dldDInICksICBkcnkgPSBnLmluKCAnZHJ5JyApLCBcbiAgICAgIHJvb21TaXplID0gZy5pbiggJ3Jvb21TaXplJyApLCBkYW1waW5nID0gZy5pbiggJ2RhbXBpbmcnIClcbiAgXG4gIGxldCBzdW1tZWRJbnB1dCA9IGlzU3RlcmVvID09PSB0cnVlID8gZy5hZGQoIGlucHV0WzBdLCBpbnB1dFsxXSApIDogaW5wdXQsXG4gICAgICBhdHRlbnVhdGVkSW5wdXQgPSBnLm1lbW8oIGcubXVsKCBzdW1tZWRJbnB1dCwgdHVuaW5nLmZpeGVkR2FpbiApIClcbiAgXG4gIC8vIGNyZWF0ZSBjb21iIGZpbHRlcnMgaW4gcGFyYWxsZWwuLi5cbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCA4OyBpKysgKSB7IFxuICAgIGNvbWJzTC5wdXNoKCBcbiAgICAgIGNvbWJGaWx0ZXIoIGF0dGVudWF0ZWRJbnB1dCwgdHVuaW5nLmNvbWJUdW5pbmdbaV0sIG11bChkYW1waW5nLC40KSwgZy5tdWwoIHR1bmluZy5zY2FsZVJvb20gKyB0dW5pbmcub2Zmc2V0Um9vbSwgcm9vbVNpemUgKSApIFxuICAgIClcbiAgICBjb21ic1IucHVzaCggXG4gICAgICBjb21iRmlsdGVyKCBhdHRlbnVhdGVkSW5wdXQsIHR1bmluZy5jb21iVHVuaW5nW2ldICsgdHVuaW5nLnN0ZXJlb1NwcmVhZCwgZy5tdWwoZGFtcGluZywuNCksIGcubXVsKCB0dW5pbmcuc2NhbGVSb29tICsgdHVuaW5nLm9mZnNldFJvb20sIHJvb21TaXplICkgKSBcbiAgICApXG4gIH1cbiAgXG4gIC8vIC4uLiBhbmQgc3VtIHRoZW0gd2l0aCBhdHRlbnVhdGVkIGlucHV0XG4gIGxldCBvdXRMID0gZy5hZGQoIGF0dGVudWF0ZWRJbnB1dCwgLi4uY29tYnNMIClcbiAgbGV0IG91dFIgPSBnLmFkZCggYXR0ZW51YXRlZElucHV0LCAuLi5jb21ic1IgKVxuICBcbiAgLy8gcnVuIHRocm91Z2ggYWxscGFzcyBmaWx0ZXJzIGluIHNlcmllc1xuICBmb3IoIGxldCBpID0gMDsgaSA8IDQ7IGkrKyApIHsgXG4gICAgb3V0TCA9IGFsbFBhc3MoIG91dEwsIHR1bmluZy5hbGxQYXNzVHVuaW5nWyBpIF0gKyB0dW5pbmcuc3RlcmVvU3ByZWFkIClcbiAgICBvdXRSID0gYWxsUGFzcyggb3V0UiwgdHVuaW5nLmFsbFBhc3NUdW5pbmdbIGkgXSArIHR1bmluZy5zdGVyZW9TcHJlYWQgKVxuICB9XG4gIFxuICBsZXQgb3V0cHV0TCA9IGcuYWRkKCBnLm11bCggb3V0TCwgd2V0MSApLCBnLm11bCggb3V0Uiwgd2V0MiApLCBnLm11bCggaXNTdGVyZW8gPT09IHRydWUgPyBpbnB1dFswXSA6IGlucHV0LCBkcnkgKSApLFxuICAgICAgb3V0cHV0UiA9IGcuYWRkKCBnLm11bCggb3V0Uiwgd2V0MSApLCBnLm11bCggb3V0TCwgd2V0MiApLCBnLm11bCggaXNTdGVyZW8gPT09IHRydWUgPyBpbnB1dFsxXSA6IGlucHV0LCBkcnkgKSApXG5cbiAgR2liYmVyaXNoLmZhY3RvcnkoIHJldmVyYiwgWyBvdXRwdXRMLCBvdXRwdXRSIF0sICdmcmVldmVyYicsIHByb3BzIClcblxuICByZXR1cm4gcmV2ZXJiXG59XG5cblxuRnJlZXZlcmIuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIHdldDE6IDEsXG4gIHdldDI6IDAsXG4gIGRyeTogLjUsXG4gIHJvb21TaXplOiAuODQsXG4gIGRhbXBpbmc6ICAuNVxufVxuXG5yZXR1cm4gRnJlZXZlcmIgXG5cbn1cblxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgSGF0ID0gYXJndW1lbnRQcm9wcyA9PiB7XG4gICAgbGV0IGhhdCA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgdHVuZSAgPSBnLmluKCAndHVuZScgKSxcbiAgICAgICAgZGVjYXkgID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgSGF0LmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGxldCBiYXNlRnJlcSA9IGcubXVsKCAzMjUsIHR1bmUgKSxcbiAgICAgICAgYnBmQ3V0b2ZmID0gZy5tdWwoIGcucGFyYW0oICdicGZjJywgNzAwMCksIHR1bmUgKSxcbiAgICAgICAgaHBmQ3V0b2ZmID0gZy5tdWwoIGcucGFyYW0oICdocGZjJywuOTc1NSksIHR1bmUgKSwgIFxuICAgICAgICBzMSA9IGcuZ3QoIGcucGhhc29yKCBiYXNlRnJlcSApLCAuNSApLFxuICAgICAgICBzMiA9IGcuZ3QoIGcucGhhc29yKCBnLm11bChiYXNlRnJlcSwxLjQ0NzEpICksIC41ICksXG4gICAgICAgIHMzID0gZy5ndCggZy5waGFzb3IoIGcubXVsKGJhc2VGcmVxLDEuNjE3MCkgKSwgLjUgKSxcbiAgICAgICAgczQgPSBnLmd0KCBnLnBoYXNvciggZy5tdWwoYmFzZUZyZXEsMS45MjY1KSApLCAuNSApLFxuICAgICAgICBzNSA9IGcuZ3QoIGcucGhhc29yKCBnLm11bChiYXNlRnJlcSwyLjUwMjgpICksIC41ICksXG4gICAgICAgIHM2ID0gZy5ndCggZy5waGFzb3IoIGcubXVsKGJhc2VGcmVxLDIuNjYzNykgKSwgLjUgKSxcbiAgICAgICAgc3VtID0gZy5hZGQoIHMxLHMyLHMzLHM0LHM1LHM2ICksXG4gICAgICAgIGVnID0gZy5kZWNheSggZGVjYXkgKSwgXG4gICAgICAgIGJwZiA9IGcuc3ZmKCBzdW0sIGJwZkN1dG9mZiwgLjUsIDIsIGZhbHNlICksXG4gICAgICAgIGVudkJwZiA9IGcubXVsKCBicGYsIGVnICksXG4gICAgICAgIGhwZiA9IGcuZmlsdGVyMjQoIGVudkJwZiwgMCwgaHBmQ3V0b2ZmLCAwICksXG4gICAgICAgIG91dCA9IGcubXVsKCBocGYsIGdhaW4gKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIGhhdCwgb3V0LCAnaGF0JywgcHJvcHMgIClcbiAgICBcbiAgICBoYXQuZW52ID0gZWcgXG5cbiAgICBoYXQuaXNTdGVyZW8gPSBmYWxzZVxuICAgIHJldHVybiBoYXRcbiAgfVxuICBcbiAgSGF0LmRlZmF1bHRzID0ge1xuICAgIGdhaW46IDEsXG4gICAgdHVuZToxLFxuICAgIGRlY2F5OjM1MDAsXG4gIH1cblxuICByZXR1cm4gSGF0XG5cbn1cbiIsImxldCBNZW1vcnlIZWxwZXIgPSByZXF1aXJlKCAnbWVtb3J5LWhlbHBlcicgKSxcbiAgICBnZW5pc2ggICAgICAgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG4gICAgXG5sZXQgR2liYmVyaXNoID0ge1xuICBibG9ja0NhbGxiYWNrczogW10sIC8vIGNhbGxlZCBldmVyeSBibG9ja1xuICBkaXJ0eVVnZW5zOiBbXSxcbiAgY2FsbGJhY2tVZ2VuczogW10sXG4gIGNhbGxiYWNrTmFtZXM6IFtdLFxuICBncmFwaElzRGlydHk6IGZhbHNlLFxuICB1Z2Vuczoge30sXG4gIGRlYnVnOiBmYWxzZSxcblxuICBvdXRwdXQ6IG51bGwsXG5cbiAgbWVtb3J5IDogbnVsbCwgLy8gMjAgbWludXRlcyBieSBkZWZhdWx0P1xuICBmYWN0b3J5OiBudWxsLCBcbiAgZ2VuaXNoLFxuICBzY2hlZHVsZXI6IHJlcXVpcmUoICcuL3NjaGVkdWxlci5qcycgKSxcblxuICBpbml0KCBtZW1BbW91bnQgKSB7XG4gICAgbGV0IG51bUJ5dGVzID0gbWVtQW1vdW50ID09PSB1bmRlZmluZWQgPyAyMCAqIDYwICogNDQxMDAgOiBtZW1BbW91bnRcblxuICAgIHRoaXMubWVtb3J5ID0gTWVtb3J5SGVscGVyLmNyZWF0ZSggbnVtQnl0ZXMgKVxuICAgIHRoaXMuZmFjdG9yeSA9IHJlcXVpcmUoICcuL3VnZW5UZW1wbGF0ZS5qcycgKSggdGhpcyApXG5cbiAgICB0aGlzLmdlbmlzaC5leHBvcnQoIHdpbmRvdyApXG5cbiAgICB0aGlzLlBvbHlUZW1wbGF0ZSAgICAgID0gcmVxdWlyZSggJy4vcG9seXRlbXBsYXRlLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLnVnZW5zLm9zY2lsbGF0b3JzID0gcmVxdWlyZSggJy4vb3NjaWxsYXRvcnMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMudWdlbnMuYmlub3BzICAgICAgPSByZXF1aXJlKCAnLi9iaW5vcHMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMudWdlbnMuYnVzICAgICAgICAgPSByZXF1aXJlKCAnLi9idXMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMudWdlbnMuYnVzMiAgICAgICAgPSByZXF1aXJlKCAnLi9idXMyLmpzJyApKCB0aGlzICk7XG5cbiAgICBbIHRoaXMudWdlbnMuc3ludGgsIHRoaXMudWdlbnMucG9seXN5bnRoIF0gPSByZXF1aXJlKCAnLi9zeW50aC5qcycgKSggdGhpcyApO1xuICAgIFsgdGhpcy51Z2Vucy5zeW50aDIsIHRoaXMudWdlbnMucG9seXN5bnRoMiBdID0gcmVxdWlyZSggJy4vc3ludGgyLmpzJyApKCB0aGlzICk7XG4gICAgWyB0aGlzLnVnZW5zLm1vbm9zeW50aCwgdGhpcy51Z2Vucy5wb2x5bW9ubyBdID0gcmVxdWlyZSggJy4vbW9ub3N5bnRoLmpzJyApKCB0aGlzICk7XG4gICAgXG4gICAgdGhpcy51Z2Vucy5mcmVldmVyYiAgICA9IHJlcXVpcmUoICcuL2ZyZWV2ZXJiLmpzJyAgKSggdGhpcyApO1xuICAgIHRoaXMudWdlbnMuZmxhbmdlciAgICAgPSByZXF1aXJlKCAnLi9mbGFuZ2VyLmpzJyAgICkoIHRoaXMgKTtcbiAgICB0aGlzLnVnZW5zLnZpYnJhdG8gICAgID0gcmVxdWlyZSggJy4vdmlicmF0by5qcycgICApKCB0aGlzICk7XG4gICAgdGhpcy5zZXF1ZW5jZXIgICAgICAgICA9IHJlcXVpcmUoICcuL3NlcXVlbmNlci5qcycgKSggdGhpcyApO1xuICAgIFsgdGhpcy51Z2Vucy5rYXJwbHVzLCB0aGlzLnVnZW5zLnBvbHlrYXJwbHVzIF0gID0gcmVxdWlyZSggJy4va2FycGx1c3N0cm9uZy5qcycgKSggdGhpcyApO1xuICAgIFxuICAgIHRoaXMudWdlbnMuZmlsdGVyMjQgICAgPSByZXF1aXJlKCAnLi9maWx0ZXIyNC5qcycgKSggdGhpcyApXG4gICAgdGhpcy51Z2Vucy5iaXF1YWQgICAgICA9IHJlcXVpcmUoICcuL2JpcXVhZC5qcycgICApKCB0aGlzIClcbiAgICB0aGlzLnVnZW5zLmtpY2sgICAgICAgID0gcmVxdWlyZSggJy4va2ljay5qcycgKSggdGhpcyApXG4gICAgdGhpcy51Z2Vucy5jb25nYSAgICAgICA9IHJlcXVpcmUoICcuL2NvbmdhLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLnVnZW5zLmNsYXZlICAgICAgID0gcmVxdWlyZSggJy4vY29uZ2EuanMnICkoIHRoaXMgKVxuICAgIHRoaXMudWdlbnMuaGF0ICAgICAgICAgPSByZXF1aXJlKCAnLi9oYXQuanMnICkoIHRoaXMgKVxuICAgIHRoaXMudWdlbnMuc25hcmUgICAgICAgPSByZXF1aXJlKCAnLi9zbmFyZS5qcycgKSggdGhpcyApXG4gICAgdGhpcy51Z2Vucy5jbGF2ZS5kZWZhdWx0cy5mcmVxdWVuY3kgPSAyNTAwXG4gICAgdGhpcy51Z2Vucy5jbGF2ZS5kZWZhdWx0cy5kZWNheSA9IC41XG4gICAgdGhpcy51Z2Vucy5zdmYgICAgICAgICA9IHJlcXVpcmUoICcuL3N2Zi5qcycgKSggdGhpcyApXG4gICAgdGhpcy51Z2Vucy5vc2NpbGxhdG9ycy5leHBvcnQoIHRoaXMgKVxuICAgIHRoaXMudWdlbnMuYmlub3BzLmV4cG9ydCggdGhpcyApXG4gICAgdGhpcy5CdXMgID0gdGhpcy51Z2Vucy5idXNcbiAgICB0aGlzLkJ1czIgPSB0aGlzLnVnZW5zLmJ1czJcblxuICAgIHRoaXMub3V0cHV0ID0gdGhpcy5CdXMyKClcbiAgICB0aGlzLmNyZWF0ZUNvbnRleHQoKVxuICAgIHRoaXMuY3JlYXRlU2NyaXB0UHJvY2Vzc29yKClcbiAgfSxcblxuICBkaXJ0eSggdWdlbiApIHtcbiAgICB0aGlzLmRpcnR5VWdlbnMucHVzaCggdWdlbiApXG4gICAgdGhpcy5ncmFwaElzRGlydHkgPSB0cnVlXG4gIH0sXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5vdXRwdXQuaW5wdXRzID0gWzBdXG4gICAgdGhpcy5vdXRwdXQuaW5wdXROYW1lcy5sZW5ndGggPSAwXG4gICAgdGhpcy5kaXJ0eSggdGhpcy5vdXRwdXQgKVxuICB9LFxuXG4gIGNyZWF0ZUNvbnRleHQoKSB7XG4gICAgbGV0IEFDID0gdHlwZW9mIEF1ZGlvQ29udGV4dCA9PT0gJ3VuZGVmaW5lZCcgPyB3ZWJraXRBdWRpb0NvbnRleHQgOiBBdWRpb0NvbnRleHRcbiAgICB0aGlzLmN0eCA9IG5ldyBBQygpXG4gICAgZ2VuLnNhbXBsZXJhdGUgPSB0aGlzLmN0eC5zYW1wbGVSYXRlXG5cbiAgICBsZXQgc3RhcnQgPSAoKSA9PiB7XG4gICAgICBpZiggdHlwZW9mIEFDICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuXG4gICAgICAgICAgaWYoICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApeyAvLyByZXF1aXJlZCB0byBzdGFydCBhdWRpbyB1bmRlciBpT1MgNlxuICAgICAgICAgICAgbGV0IG15U291cmNlID0gdXRpbGl0aWVzLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuICAgICAgICAgICAgbXlTb3VyY2UuY29ubmVjdCggdXRpbGl0aWVzLmN0eC5kZXN0aW5hdGlvbiApXG4gICAgICAgICAgICBteVNvdXJjZS5ub3RlT24oIDAgKVxuICAgICAgICAgIH1cbiAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiggZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHN0YXJ0IClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuXG4gIGNyZWF0ZVNjcmlwdFByb2Nlc3NvcigpIHtcbiAgICB0aGlzLm5vZGUgPSB0aGlzLmN0eC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoIDEwMjQsIDAsIDIgKSxcbiAgICB0aGlzLmNsZWFyRnVuY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIDAgfSxcbiAgICB0aGlzLmNhbGxiYWNrID0gdGhpcy5jbGVhckZ1bmN0aW9uXG5cbiAgICB0aGlzLm5vZGUub25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbiggYXVkaW9Qcm9jZXNzaW5nRXZlbnQgKSB7XG4gICAgICBsZXQgZ2liYmVyaXNoID0gR2liYmVyaXNoLFxuICAgICAgICAgIGNhbGxiYWNrICA9IGdpYmJlcmlzaC5jYWxsYmFjayxcbiAgICAgICAgICBvdXRwdXRCdWZmZXIgPSBhdWRpb1Byb2Nlc3NpbmdFdmVudC5vdXRwdXRCdWZmZXIsXG4gICAgICAgICAgc2NoZWR1bGVyID0gR2liYmVyaXNoLnNjaGVkdWxlcixcbiAgICAgICAgICAvL29ianMgPSBnaWJiZXJpc2guY2FsbGJhY2tVZ2Vucy5zbGljZSggMCApLFxuICAgICAgICAgIGxlbmd0aFxuXG4gICAgICBsZXQgbGVmdCA9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMCApLFxuICAgICAgICAgIHJpZ2h0PSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDEgKVxuXG4gICAgICBsZXQgY2FsbGJhY2tsZW5ndGggPSBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3MubGVuZ3RoXG4gICAgICBcbiAgICAgIGlmKCBjYWxsYmFja2xlbmd0aCAhPT0gMCApIHtcbiAgICAgICAgZm9yKCBsZXQgaT0wOyBpPCBjYWxsYmFja2xlbmd0aDsgaSsrICkge1xuICAgICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrc1sgaSBdKClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhbid0IGp1c3Qgc2V0IGxlbmd0aCB0byAwIGFzIGNhbGxiYWNrcyBtaWdodCBiZSBhZGRlZCBkdXJpbmcgZm9yIGxvb3AsIHNvIHNwbGljZSBwcmUtZXhpc3RpbmcgZnVuY3Rpb25zXG4gICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5zcGxpY2UoIDAsIGNhbGxiYWNrbGVuZ3RoIClcbiAgICAgIH1cblxuICAgICAgZm9yIChsZXQgc2FtcGxlID0gMCwgbGVuZ3RoID0gbGVmdC5sZW5ndGg7IHNhbXBsZSA8IGxlbmd0aDsgc2FtcGxlKyspIHtcbiAgICAgICAgc2NoZWR1bGVyLnRpY2soKVxuXG4gICAgICAgIGlmKCBnaWJiZXJpc2guZ3JhcGhJc0RpcnR5ICkgeyBcbiAgICAgICAgICBjYWxsYmFjayA9IGdpYmJlcmlzaC5nZW5lcmF0ZUNhbGxiYWNrKClcbiAgICAgICAgICAvL29ianMgPSBnaWJiZXJpc2guY2FsbGJhY2tVZ2Vucy5zbGljZSggMCApXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFhYWCBjYW50IHVzZSBkZXN0cnVjdHVyaW5nLCBiYWJlbCBtYWtlcyBpdCBzb21ldGhpbmcgaW5lZmZpY2llbnQuLi5cbiAgICAgICAgbGV0IG91dCA9IGNhbGxiYWNrLmFwcGx5KCBudWxsLCBnaWJiZXJpc2guY2FsbGJhY2tVZ2VucyApXG5cbiAgICAgICAgbGVmdFsgc2FtcGxlICBdID0gb3V0WzBdXG4gICAgICAgIHJpZ2h0WyBzYW1wbGUgXSA9IG91dFsxXVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubm9kZS5jb25uZWN0KCB0aGlzLmN0eC5kZXN0aW5hdGlvbiApXG5cbiAgICByZXR1cm4gdGhpc1xuICB9LCBcblxuICBnZW5lcmF0ZUNhbGxiYWNrKCkge1xuICAgIGxldCB1aWQgPSAwLFxuICAgICAgICBjYWxsYmFja0JvZHksIGxhc3RMaW5lXG5cbiAgICBjYWxsYmFja0JvZHkgPSB0aGlzLnByb2Nlc3NHcmFwaCggdGhpcy5vdXRwdXQgKVxuICAgIGxhc3RMaW5lID0gY2FsbGJhY2tCb2R5WyBjYWxsYmFja0JvZHkubGVuZ3RoIC0gMV1cbiAgICBcbiAgICBjYWxsYmFja0JvZHkucHVzaCggJ1xcblxcdHJldHVybiAnICsgbGFzdExpbmUuc3BsaXQoICc9JyApWzBdLnNwbGl0KCAnICcgKVsxXSApXG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCAnY2FsbGJhY2s6XFxuJywgY2FsbGJhY2tCb2R5LmpvaW4oJ1xcbicpIClcbiAgICB0aGlzLmNhbGxiYWNrID0gRnVuY3Rpb24oIC4uLnRoaXMuY2FsbGJhY2tOYW1lcywgY2FsbGJhY2tCb2R5LmpvaW4oICdcXG4nICkgKVxuICAgIHRoaXMuY2FsbGJhY2sub3V0ID0gW11cblxuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrIFxuICB9LFxuXG4gIHByb2Nlc3NHcmFwaCggb3V0cHV0ICkge1xuICAgIHRoaXMuY2FsbGJhY2tVZ2Vucy5sZW5ndGggPSAwXG4gICAgdGhpcy5jYWxsYmFja05hbWVzLmxlbmd0aCA9IDBcblxuICAgIHRoaXMuY2FsbGJhY2tVZ2Vucy5wdXNoKCBvdXRwdXQuY2FsbGJhY2sgKVxuXG4gICAgbGV0IGJvZHkgPSB0aGlzLnByb2Nlc3NVZ2VuKCBvdXRwdXQgKVxuICAgIHRoaXMuY2FsbGJhY2tOYW1lcyA9IHRoaXMuY2FsbGJhY2tVZ2Vucy5tYXAoIHYgPT4gdi51Z2VuTmFtZSApXG5cbiAgICB0aGlzLmRpcnR5VWdlbnMubGVuZ3RoID0gMFxuICAgIHRoaXMuZ3JhcGhJc0RpcnR5ID0gZmFsc2VcblxuICAgIHJldHVybiBib2R5XG4gIH0sXG5cbiAgcHJvY2Vzc1VnZW4oIHVnZW4sIGJsb2NrICkge1xuICAgIGlmKCBibG9jayA9PT0gdW5kZWZpbmVkICkgYmxvY2sgPSBbXVxuXG4gICAgbGV0IGRpcnR5SWR4ID0gR2liYmVyaXNoLmRpcnR5VWdlbnMuaW5kZXhPZiggdWdlbiApXG4gICAgXG4gICAgaWYoIHVnZW4uYmxvY2sgPT09IHVuZGVmaW5lZCB8fCBkaXJ0eUluZGV4ICE9PSAtMSApIHtcbiAgXG4gICAgICBsZXQgbGluZSA9IGBcXHR2YXIgdl8ke3VnZW4uaWR9ID0gYCBcbiAgICAgIFxuICAgICAgaWYoICF1Z2VuLmJpbm9wICkgbGluZSArPSBgJHt1Z2VuLnVnZW5OYW1lfSggYFxuXG4gICAgICAvLyBtdXN0IGdldCBhcnJheSBzbyB3ZSBjYW4ga2VlcCB0cmFjayBvZiBsZW5ndGggZm9yIGNvbW1hIGluc2VydGlvblxuICAgICAgbGV0IGtleXMgPSB1Z2VuLmJpbm9wIHx8IHVnZW4udHlwZSA9PT0gJ2J1cycgPyBPYmplY3Qua2V5cyggdWdlbi5pbnB1dHMgKSA6IE9iamVjdC5rZXlzKCB1Z2VuLmlucHV0TmFtZXMgKVxuICAgICAgXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGxldCBrZXkgPSBrZXlzWyBpIF1cbiAgICAgICAgLy8gYmlub3AuaW5wdXRzIGlzIGFjdHVhbCB2YWx1ZXMsIG5vdCBqdXN0IHByb3BlcnR5IG5hbWVzXG4gICAgICAgIGxldCBpbnB1dCA9IHVnZW4uYmlub3AgfHwgdWdlbi50eXBlID09PSdidXMnICA/IHVnZW4uaW5wdXRzWyBrZXkgXSA6IHVnZW5bIHVnZW4uaW5wdXROYW1lc1sga2V5IF0gXVxuXG4gICAgICAgIGlmKCB0eXBlb2YgaW5wdXQgPT09ICdudW1iZXInICkge1xuICAgICAgICAgIGxpbmUgKz0gaW5wdXRcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgaWYoIGlucHV0ID09PSB1bmRlZmluZWQgKSB7IGNvbnNvbGUubG9nKCBrZXkgKTsgY29udGludWU7IH1cbiAgICAgICAgICBHaWJiZXJpc2gucHJvY2Vzc1VnZW4oIGlucHV0LCBibG9jayApXG5cbiAgICAgICAgICBpZiggIWlucHV0LmJpbm9wICkgR2liYmVyaXNoLmNhbGxiYWNrVWdlbnMucHVzaCggaW5wdXQuY2FsbGJhY2sgKVxuXG4gICAgICAgICAgbGluZSArPSBgdl8ke2lucHV0LmlkfWBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCBpIDwga2V5cy5sZW5ndGggLSAxICkge1xuICAgICAgICAgIGxpbmUgKz0gdWdlbi5iaW5vcCA/ICcgJyArIHVnZW4ub3AgKyAnICcgOiAnLCAnIFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpbmUgKz0gdWdlbi5iaW5vcCA/ICcnIDogJyApJ1xuXG4gICAgICBibG9jay5wdXNoKCBsaW5lIClcbiAgICB9ZWxzZSBpZiggdWdlbi5ibG9jayApIHtcbiAgICAgIHJldHVybiB1Z2VuLmJsb2NrXG4gICAgfVxuXG4gICAgcmV0dXJuIGJsb2NrXG4gIH0sXG4gICAgXG59XG5cbm1vZHVsZS5leHBvcnRzID0gR2liYmVyaXNoXG4iLCJsZXQgdWdlbiA9IHJlcXVpcmUoICcuL3VnZW4uanMnIClcblxubGV0IGluc3RydW1lbnQgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuT2JqZWN0LmFzc2lnbiggaW5zdHJ1bWVudCwge1xuICBub3RlKCBmcmVxICkge1xuICAgIHRoaXMuZnJlcXVlbmN5ID0gZnJlcVxuICAgIHRoaXMuZW52LnRyaWdnZXIoKVxuICB9LFxuXG4gIHRyaWdnZXIoIF9nYWluID0gMSkge1xuICAgIHRoaXMuZ2FpbiA9IF9nYWluXG4gICAgdGhpcy5lbnYudHJpZ2dlcigpXG4gIH1cblxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBpbnN0cnVtZW50XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBLUFMgPSBwcm9wcyA9PiB7XG4gICAgbGV0IHN5biA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgdHJpZ2dlciA9IGcuYmFuZygpLFxuICAgICAgICBwaGFzZSA9IGcuYWNjdW0oIDEsIHRyaWdnZXIsIHsgbWF4OkluZmluaXR5IH0gKSxcbiAgICAgICAgZW52ID0gZy5ndHAoIGcuc3ViKCAxLCBnLmRpdiggcGhhc2UsIDIwMCApICksIDAgKSxcbiAgICAgICAgaW1wdWxzZSA9IGcubXVsKCBnLm5vaXNlKCksIGVudiApLFxuICAgICAgICBmZWVkYmFjayA9IGcuaGlzdG9yeSgpLFxuICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCdmcmVxdWVuY3knKSxcbiAgICAgICAgZGVsYXkgPSBnLmRlbGF5KCBnLmFkZCggaW1wdWxzZSwgZmVlZGJhY2sub3V0ICksIGRpdiggR2liYmVyaXNoLmN0eC5zYW1wbGVSYXRlLCBmcmVxdWVuY3kgKSwgeyBzaXplOjIwNDggfSksXG4gICAgICAgIGRlY2F5ZWQgPSBnLm11bCggZGVsYXksIGcudDYwKCBnLm11bCggZy5pbignZGVjYXknKSwgZnJlcXVlbmN5ICkgKSApLFxuICAgICAgICBkYW1wZWQgPSAgZy5taXgoIGRlY2F5ZWQsIGZlZWRiYWNrLm91dCwgZy5pbignZGFtcGluZycpICksXG4gICAgICAgIHdpdGhHYWluID0gZy5tdWwoIGRhbXBlZCwgZy5pbignZ2FpbicpIClcblxuICAgIGZlZWRiYWNrLmluKCBkYW1wZWQgKVxuXG4gICAgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBLUFMuZGVmYXVsdHMsIHByb3BzIClcblxuICAgIGlmKCBwcm9wZXJ0aWVzLnBhblZvaWNlcyApIHsgIFxuICAgICAgbGV0IHBhbm5lciA9IGcucGFuKCB3aXRoR2Fpbiwgd2l0aEdhaW4sIGcuaW4oICdwYW4nICkgKVxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdLCAna2FycGx1cycsIHByb3BzICApXG4gICAgfWVsc2V7XG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc3luLCB3aXRoR2FpbiAsICdrYXJwdWxzJywgcHJvcHMgKVxuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24oIHN5biwge1xuICAgICAgcHJvcGVydGllcyA6IHByb3BzLFxuXG4gICAgICBlbnYgOiB0cmlnZ2VyLFxuICAgICAgcGhhc2UsXG5cbiAgICAgIGdldFBoYXNlKCkge1xuICAgICAgICByZXR1cm4gR2liYmVyaXNoLm1lbW9yeS5oZWFwWyBwaGFzZS5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH0sXG4gICAgfSlcbiAgICByZXR1cm4gc3luXG4gIH1cbiAgXG4gIEtQUy5kZWZhdWx0cyA9IHtcbiAgICBkZWNheTogLjk3LFxuICAgIGRhbXBpbmc6LjIsXG4gICAgZ2FpbjogMSxcbiAgICBmcmVxdWVuY3k6MjIwLFxuICAgIHBhbjogLjUsXG4gICAgcGFuVm9pY2VzOmZhbHNlXG4gIH1cblxuICBsZXQgZW52Q2hlY2tGYWN0b3J5ID0gKCBzeW4sc3ludGggKSA9PiB7XG4gICAgbGV0IGVudkNoZWNrID0gKCk9PiB7XG4gICAgICBsZXQgcGhhc2UgPSBzeW4uZ2V0UGhhc2UoKSxcbiAgICAgICAgICBlbmRUaW1lID0gc3ludGguZGVjYXkgKiBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGVcblxuICAgICAgaWYoIHBoYXNlID4gZW5kVGltZSApIHtcbiAgICAgICAgc3ludGguZGlzY29ubmVjdCggc3luIClcbiAgICAgICAgc3luLmlzQ29ubmVjdGVkID0gZmFsc2VcbiAgICAgICAgR2liYmVyaXNoLm1lbW9yeS5oZWFwWyBzeW4ucGhhc2UubWVtb3J5LnZhbHVlLmlkeCBdID0gMCAvLyB0cmlnZ2VyIGRvZXNuJ3Qgc2VlbSB0byByZXNldCBmb3Igc29tZSByZWFzb25cbiAgICAgIH1lbHNle1xuICAgICAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3MucHVzaCggZW52Q2hlY2sgKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZW52Q2hlY2tcbiAgfVxuXG4gIGxldCBQb2x5S1BTID0gR2liYmVyaXNoLlBvbHlUZW1wbGF0ZSggS1BTLCBbJ2ZyZXF1ZW5jeScsJ2RlY2F5JywnZGFtcGluZycsJ3BhbicsJ2dhaW4nXSwgZW52Q2hlY2tGYWN0b3J5ICkgXG5cbiAgcmV0dXJuIFsgS1BTLCBQb2x5S1BTIF1cblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgS2ljayA9IGlucHV0UHJvcHMgPT4ge1xuICAgIC8vIGVzdGFibGlzaCBwcm90b3R5cGUgY2hhaW5cbiAgICBsZXQga2ljayA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKVxuXG4gICAgLy8gZGVmaW5lIGlucHV0c1xuICAgIGxldCBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICBkZWNheSA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgdG9uZSAgPSBnLmluKCAndG9uZScgKSxcbiAgICAgICAgZ2FpbiAgPSBnLmluKCAnZ2FpbicgKVxuICAgIFxuICAgIC8vIGNyZWF0ZSBpbml0aWFsIHByb3BlcnR5IHNldFxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBLaWNrLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgIC8vIGNyZWF0ZSBEU1AgZ3JhcGhcbiAgICBsZXQgdHJpZ2dlciA9IGcuYmFuZygpLFxuICAgICAgICBpbXB1bHNlID0gZy5tdWwoIHRyaWdnZXIsIDYwICksXG4gICAgICAgIHNjYWxlZERlY2F5ID0gZy5zdWIoIDEuMDA1LCBkZWNheSApLCAvLyAtPiByYW5nZSB7IC4wMDUsIDEuMDA1IH1cbiAgICAgICAgc2NhbGVkVG9uZSA9IGcuYWRkKCA1MCwgZy5tdWwoIHRvbmUsIDQwMDAgKSApLCAvLyAtPiByYW5nZSB7IDUwLCA0MDUwIH1cbiAgICAgICAgYnBmID0gZy5zdmYoIGltcHVsc2UsIGZyZXF1ZW5jeSwgc2NhbGVkRGVjYXksIDIsIGZhbHNlICksXG4gICAgICAgIGxwZiA9IGcuc3ZmKCBicGYsIHNjYWxlZFRvbmUsIC41LCAwLCBmYWxzZSApLFxuICAgICAgICBncmFwaCA9IG11bCggbHBmLCBnYWluIClcbiAgICBcbiAgICBHaWJiZXJpc2guZmFjdG9yeSgga2ljaywgZ3JhcGgsICdraWNrJywgcHJvcHMgIClcblxuICAgIGtpY2suZW52ID0gdHJpZ2dlclxuXG4gICAgcmV0dXJuIGtpY2tcbiAgfVxuICBcbiAgS2ljay5kZWZhdWx0cyA9IHtcbiAgICBnYWluOiAxLFxuICAgIGZyZXF1ZW5jeTo1NSxcbiAgICB0b25lOiAuMjUsXG4gICAgZGVjYXk6LjlcbiAgfVxuXG4gIHJldHVybiBLaWNrXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKSxcbiAgICBmZWVkYmFja09zYyA9IHJlcXVpcmUoICcuL2ZtZmVlZGJhY2tvc2MuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBTeW50aCA9IGFyZ3VtZW50UHJvcHMgPT4ge1xuICAgIGxldCBzeW4gPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgIG9zY3MgPSBbXSwgXG4gICAgICAgIGVudiA9IGcuYWQoIGcuaW4oICdhdHRhY2snICksIGcuaW4oICdkZWNheScgKSwgeyBzaGFwZTonbGluZWFyJyB9KSxcbiAgICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgcGhhc2VcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBTeW50aC5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IDM7IGkrKyApIHtcbiAgICAgIGxldCBvc2MsIGZyZXFcblxuICAgICAgc3dpdGNoKCBpICkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgZnJlcSA9IGcubXVsKCBmcmVxdWVuY3ksIGcuYWRkKCBnLmluKCdvY3RhdmUyJyksIGcuaW4oJ2RldHVuZTInKSAgKSApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBmcmVxID0gZy5tdWwoIGZyZXF1ZW5jeSwgZy5hZGQoIGcuaW4oJ29jdGF2ZTMnKSwgZy5pbignZGV0dW5lMycpICApIClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBmcmVxID0gZnJlcXVlbmN5XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCggcHJvcHMud2F2ZWZvcm0gKSB7XG4gICAgICAgIGNhc2UgJ3Nhdyc6XG4gICAgICAgICAgaWYoIHByb3BzLmFudGlhbGlhcyA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICBvc2MgPSBnLnBoYXNvciggZnJlcSApXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBvc2MgPSBmZWVkYmFja09zYyggZnJlcSwgMSApXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzcXVhcmUnOlxuICAgICAgICAgIGlmKCBwcm9wcy5hbnRpYWxpYXMgPT09IHRydWUgKSB7XG4gICAgICAgICAgICBvc2MgPSBmZWVkYmFja09zYyggZnJlcSwgMSwgLjUsIHsgdHlwZToxIH0pXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBwaGFzZSA9IGcucGhhc29yKCBmcmVxLCAwLCB7IG1pbjowIH0gKVxuICAgICAgICAgICAgb3NjID0gbHQoIHBoYXNlLCAuNSApXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzaW5lJzpcbiAgICAgICAgICBvc2MgPSBjeWNsZSggZnJlcSApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3B3bSc6XG4gICAgICAgICAgbGV0IHB1bHNld2lkdGggPSBnLmluKCdwdWxzZXdpZHRoJylcbiAgICAgICAgICBpZiggcHJvcHMuYW50aWFsaWFzID09PSB0cnVlICkge1xuICAgICAgICAgICAgb3NjID0gZmVlZGJhY2tPc2MoIGZyZXEsIDEsIHB1bHNld2lkdGgsIHsgdHlwZToxIH0pXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBwaGFzZSA9IGcucGhhc29yKCBmcmVxLCAwLCB7IG1pbjowIH0gKVxuICAgICAgICAgICAgb3NjID0gbHQoIHBoYXNlLCBwdWxzZXdpZHRoIClcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIG9zY3NbIGkgXSA9IG9zY1xuICAgIH1cblxuICAgIGxldCBvc2NTdW0gPSBnLmFkZCggLi4ub3NjcyApLFxuICAgICAgICBvc2NXaXRoR2FpbiA9IGcubXVsKCBnLm11bCggb3NjU3VtLCBlbnYgKSwgZy5pbiggJ2dhaW4nICkgKSxcbiAgICAgICAgaXNMb3dQYXNzID0gZy5wYXJhbSggJ2xvd1Bhc3MnLCAxICksXG4gICAgICAgIGZpbHRlcmVkT3NjID0gZy5maWx0ZXIyNCggb3NjV2l0aEdhaW4sIGcuaW4oJ3Jlc29uYW5jZScpLCBnLm11bCggZy5pbignY3V0b2ZmJyksIGVudiApLCBpc0xvd1Bhc3MgKSxcbiAgICAgICAgcGFubmVyXG5cbiAgICBpZiggcHJvcHMucGFuVm9pY2VzICkgeyAgXG4gICAgICBwYW5uZXIgPSBnLnBhbiggZmlsdGVyZWRPc2MsZmlsdGVyZWRPc2MsIGcuaW4oICdwYW4nICkgKVxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdLCAnbW9ubycsIHByb3BzICApXG4gICAgfWVsc2V7XG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc3luLCBmaWx0ZXJlZE9zYyAsICdtb25vJywgcHJvcHMgKVxuICAgIH1cbiAgICBcbiAgICBzeW4uZW52ID0gZW52XG5cbiAgICByZXR1cm4gc3luXG4gIH1cbiAgXG4gIFN5bnRoLmRlZmF1bHRzID0ge1xuICAgIHdhdmVmb3JtOiAnc2F3JyxcbiAgICBhdHRhY2s6IDQ0MTAwLFxuICAgIGRlY2F5OiA0NDEwMCxcbiAgICBnYWluOiAxLFxuICAgIHB1bHNld2lkdGg6LjI1LFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBvY3RhdmUyOjIsXG4gICAgb2N0YXZlMzo0LFxuICAgIGRldHVuZTI6LjAxLFxuICAgIGRldHVuZTM6LS4wMSxcbiAgICBjdXRvZmY6IC4yNSxcbiAgICByZXNvbmFuY2U6MixcbiAgICBwYW5Wb2ljZXM6ZmFsc2VcbiAgfVxuXG4gIGxldCBQb2x5TW9ubyA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIFN5bnRoLCBcbiAgICBbJ2ZyZXF1ZW5jeScsJ2F0dGFjaycsJ2RlY2F5JywnY3V0b2ZmJywncmVzb25hbmNlJyxcbiAgICAgJ29jdGF2ZTInLCdvY3RhdmUzJywnZGV0dW5lMicsJ2RldHVuZTMnLCdwdWxzZXdpZHRoJywncGFuJywnZ2FpbiddXG4gICkgXG5cbiAgcmV0dXJuIFsgU3ludGgsIFBvbHlNb25vIF1cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IE9zY2lsbGF0b3JzID0ge1xuICAgIGV4cG9ydCggb2JqICkge1xuICAgICAgZm9yKCBsZXQga2V5IGluIE9zY2lsbGF0b3JzICkge1xuICAgICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyApIHtcbiAgICAgICAgICBvYmpbIGtleSBdID0gT3NjaWxsYXRvcnNbIGtleSBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgU2luZSggcHJvcHMgKSB7XG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIE9zY2lsbGF0b3JzLmRlZmF1bHRzLCBwcm9wcyApXG4gICAgICByZXR1cm4gIEdpYmJlcmlzaC5mYWN0b3J5KCBnLm11bCggZy5jeWNsZSggZy5pbignZnJlcXVlbmN5JykgKSwgZy5pbignZ2FpbicpICksICdzaW5lJywgcHJvcHMgKVxuICAgIH0sXG4gICAgTm9pc2UoIHByb3BzICkge1xuICAgICAgcmV0dXJuICBHaWJiZXJpc2guZmFjdG9yeSggZy5tdWwoIGcubm9pc2UoKSwgZy5pbignZ2FpbicpICksICdub2lzZScsIHsgZ2FpbjogaXNOYU4oIHByb3BzLmdhaW4gKSA/IDEgOiBwcm9wcy5nYWluIH0gIClcbiAgICB9LFxuICAgIFNhdyggcHJvcHMgKSB7IFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgcHJvcHMgKVxuICAgICAgcmV0dXJuIEdpYmJlcmlzaC5mYWN0b3J5KCBnLm11bCggZy5waGFzb3IoIGcuaW4oJ2ZyZXF1ZW5jeScpICksIGcuaW4oJ2dhaW4nICkgKSwgJ3NhdycsIHByb3BzIClcbiAgICB9XG4gIH1cblxuICBPc2NpbGxhdG9ycy5kZWZhdWx0cyA9IHtcbiAgICBmcmVxdWVuY3k6IDQ0MCxcbiAgICBnYWluOiAxXG4gIH1cblxuICByZXR1cm4gT3NjaWxsYXRvcnNcblxufVxuXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBUZW1wbGF0ZUZhY3RvcnkgPSAoIHVnZW4sIHByb3BlcnR5TGlzdCwgX2VudkNoZWNrICkgPT4ge1xuICAgIGxldCBUZW1wbGF0ZSA9IHByb3BzID0+IHtcbiAgICAgIGxldCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbigge30sIHsgaXNTdGVyZW86dHJ1ZSB9LCBwcm9wcyApXG5cbiAgICAgIGxldCBzeW50aCA9IHByb3BlcnRpZXMuaXNTdGVyZW8gPyBHaWJiZXJpc2guQnVzMigpIDogR2liYmVyaXNoLkJ1cygpLFxuICAgICAgICAgIHZvaWNlcyA9IFtdLFxuICAgICAgICAgIHZvaWNlQ291bnQgPSAwXG5cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgMTY7IGkrKyApIHtcbiAgICAgICAgdm9pY2VzW2ldID0gdWdlbiggcHJvcGVydGllcyApXG4gICAgICAgIHZvaWNlc1tpXS5jYWxsYmFjay51Z2VuTmFtZSA9IHZvaWNlc1tpXS51Z2VuTmFtZVxuICAgICAgICB2b2ljZXNbaV0uaXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgICAgfVxuXG4gICAgICBPYmplY3QuYXNzaWduKCBzeW50aCwge1xuICAgICAgICBwcm9wZXJ0aWVzLFxuICAgICAgICB2b2ljZXMsXG4gICAgICAgIGlzU3RlcmVvOiBwcm9wZXJ0aWVzLmlzU3RlcmVvLFxuXG4gICAgICAgIG5vdGUoIGZyZXEgKSB7XG4gICAgICAgICAgbGV0IHZvaWNlID0gdm9pY2VzWyB2b2ljZUNvdW50KysgJSB2b2ljZXMubGVuZ3RoIF1cbiAgICAgICAgICBPYmplY3QuYXNzaWduKCB2b2ljZSwgc3ludGgucHJvcGVydGllcyApXG5cbiAgICAgICAgICB2b2ljZS5ub3RlKCBmcmVxIClcblxuICAgICAgICAgIGlmKCAhdm9pY2UuaXNDb25uZWN0ZWQgKSB7XG4gICAgICAgICAgICB2b2ljZS5jb25uZWN0KCB0aGlzLCAxIClcbiAgICAgICAgICAgIHZvaWNlLmlzQ29ubmVjdGVkID0gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICBsZXQgZW52Q2hlY2tcbiAgICAgICAgICBpZiggX2VudkNoZWNrID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBlbnZDaGVjayA9ICgpPT4ge1xuICAgICAgICAgICAgICBpZiggdm9pY2UuZW52LmlzQ29tcGxldGUoKSApIHtcbiAgICAgICAgICAgICAgICBzeW50aC5kaXNjb25uZWN0KCB2b2ljZSApXG4gICAgICAgICAgICAgICAgdm9pY2UuaXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3MucHVzaCggZW52Q2hlY2sgKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBlbnZDaGVjayA9IF9lbnZDaGVjayggdm9pY2UsIHN5bnRoIClcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3MucHVzaCggZW52Q2hlY2sgKVxuICAgICAgICB9LFxuXG4gICAgICAgIGNob3JkKCBmcmVxdWVuY2llcyApIHtcbiAgICAgICAgICBmcmVxdWVuY2llcy5mb3JFYWNoKCAodikgPT4gc3ludGgubm90ZSh2KSApXG4gICAgICAgIH0sXG5cbiAgICAgICAgZnJlZSgpIHtcbiAgICAgICAgICBmb3IoIGxldCBjaGlsZCBvZiB2b2ljZXMgKSBjaGlsZC5mcmVlKClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIFxuICAgICAgbGV0IF9wcm9wZXJ0eUxpc3QgXG4gICAgICBpZiggcHJvcGVydGllcy5pc1N0ZXJlbyA9PT0gZmFsc2UgKSB7XG4gICAgICAgIF9wcm9wZXJ0eUxpc3QgPSBwcm9wZXJ0eUxpc3Quc2xpY2UoIDAgKVxuICAgICAgICBsZXQgaWR4ID0gIF9wcm9wZXJ0eUxpc3QuaW5kZXhPZiggJ3BhbicgKVxuICAgICAgICBpZiggaWR4ICA+IC0xICkgX3Byb3BlcnR5TGlzdC5zcGxpY2UoIGlkeCwgMSApXG4gICAgICB9XG5cbiAgICAgIFRlbXBsYXRlRmFjdG9yeS5zZXR1cFByb3BlcnRpZXMoIHN5bnRoLCB1Z2VuLCBwcm9wZXJ0aWVzLmlzU3RlcmVvID8gcHJvcGVydHlMaXN0IDogX3Byb3BlcnR5TGlzdCApXG5cbiAgICAgIHJldHVybiBzeW50aFxuICAgIH1cblxuICAgIHJldHVybiBUZW1wbGF0ZVxuICB9XG5cbiAgVGVtcGxhdGVGYWN0b3J5LnNldHVwUHJvcGVydGllcyA9ICggc3ludGgsIHVnZW4sIHByb3BzICkgPT4ge1xuICAgIGZvciggbGV0IHByb3BlcnR5IG9mIHByb3BzICkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBzeW50aCwgcHJvcGVydHksIHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiBzeW50aC5wcm9wZXJ0aWVzWyBwcm9wZXJ0eSBdIHx8IHVnZW4uZGVmYXVsdHNbIHByb3BlcnR5IF1cbiAgICAgICAgfSxcbiAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgIHN5bnRoLnByb3BlcnRpZXNbIHByb3BlcnR5IF0gPSB2XG4gICAgICAgICAgZm9yKCBsZXQgY2hpbGQgb2Ygc3ludGguaW5wdXRzICkge1xuICAgICAgICAgICAgY2hpbGRbIHByb3BlcnR5IF0gPSB2XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBUZW1wbGF0ZUZhY3RvcnlcblxufVxuIiwiY29uc3QgUXVldWUgPSByZXF1aXJlKCAnLi4vZXh0ZXJuYWwvcHJpb3JpdHlxdWV1ZS5qcycgKVxuY29uc3QgQmlnICAgPSByZXF1aXJlKCAnYmlnLmpzJyApXG5cbmxldCBTY2hlZHVsZXIgPSB7XG4gIHBoYXNlOiAwLFxuXG4gIHF1ZXVlOiBuZXcgUXVldWUoICggYSwgYiApID0+IHtcbiAgICBpZiggYS50aW1lID09PSBiLnRpbWUgKSB7IC8vYS50aW1lLmVxKCBiLnRpbWUgKSApIHtcbiAgICAgIHJldHVybiBiLnByaW9yaXR5IC0gYS5wcmlvcml0eVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIGEudGltZSAtIGIudGltZSAvL2EudGltZS5taW51cyggYi50aW1lIClcbiAgICB9XG4gIH0pLFxuXG4gIGFkZCggdGltZSwgZnVuYywgcHJpb3JpdHkgPSAwICkge1xuICAgIHRpbWUgKz0gdGhpcy5waGFzZVxuXG4gICAgdGhpcy5xdWV1ZS5wdXNoKHsgdGltZSwgZnVuYywgcHJpb3JpdHkgfSlcbiAgfSxcblxuICB0aWNrKCkge1xuICAgIGlmKCB0aGlzLnF1ZXVlLmxlbmd0aCApIHtcbiAgICAgIGxldCBuZXh0ID0gdGhpcy5xdWV1ZS5wZWVrKClcblxuICAgICAgaWYoIHRoaXMucGhhc2UrKyA+PSBuZXh0LnRpbWUgKSB7XG4gICAgICAgIG5leHQuZnVuYygpXG4gICAgICAgIHRoaXMucXVldWUucG9wKClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2NoZWR1bGVyXG4iLCJjb25zdCBRdWV1ZSA9IHJlcXVpcmUoICcuLi9leHRlcm5hbC9wcmlvcml0eXF1ZXVlLmpzJyApXG5jb25zdCBCaWcgICA9IHJlcXVpcmUoICdiaWcuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG5sZXQgU2VxdWVuY2VyID0gcHJvcHMgPT4ge1xuICBsZXQgc2VxID0ge1xuICAgIHBoYXNlOiAwLFxuICAgIGtleTogcHJvcHMua2V5IHx8ICdub3RlJyxcbiAgICB0YXJnZXQ6ICBwcm9wcy50YXJnZXQsXG4gICAgdmFsdWVzOiAgcHJvcHMudmFsdWVzIHx8IFsgNDQwIF0sXG4gICAgdGltaW5nczogcHJvcHMudGltaW5nc3x8IFsgMTEwMjUgXSxcbiAgICB2YWx1ZXNQaGFzZTogIDAsXG4gICAgdGltaW5nc1BoYXNlOiAwLFxuXG4gICAgdGljaygpIHtcbiAgICAgIGxldCB2YWx1ZSAgPSBzZXEudmFsdWVzWyAgc2VxLnZhbHVlc1BoYXNlKysgICUgc2VxLnZhbHVlcy5sZW5ndGggIF0sXG4gICAgICAgICAgdGltaW5nID0gc2VxLnRpbWluZ3NbIHNlcS50aW1pbmdzUGhhc2UrKyAlIHNlcS50aW1pbmdzLmxlbmd0aCBdXG4gICAgICBcbiAgICAgIGlmKCB0eXBlb2Ygc2VxLnRhcmdldFsgc2VxLmtleSBdID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgICBzZXEudGFyZ2V0WyBzZXEua2V5IF0oIHZhbHVlIClcbiAgICAgIH1lbHNle1xuICAgICAgICBzZXEudGFyZ2V0WyBzZXEua2V5IF0gPSB2YWx1ZVxuICAgICAgfVxuXG4gICAgICBHaWJiZXJpc2guc2NoZWR1bGVyLmFkZCggdGltaW5nLCBzZXEudGljayApXG4gICAgfVxuICB9XG5cbiAgR2liYmVyaXNoLnNjaGVkdWxlci5hZGQoIDAsIHNlcS50aWNrIClcblxuICByZXR1cm4gc2VxIFxufVxuXG5yZXR1cm4gU2VxdWVuY2VyXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcbiAgXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IFNuYXJlID0gYXJndW1lbnRQcm9wcyA9PiB7XG4gICAgbGV0IHNuYXJlID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApLFxuICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICBkZWNheSA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgc25hcHB5PSBnLmluKCAnc25hcHB5JyApLFxuICAgICAgICB0dW5lICA9IGcuaW4oICd0dW5lJyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgU25hcmUuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgbGV0IGVnID0gZy5kZWNheSggZGVjYXkgKSwgXG4gICAgICAgIGNoZWNrID0gbWVtbyggZ3QoIGVnLCAuMDAwNSApICksXG4gICAgICAgIHJuZCA9IGcubXVsKCBnLm5vaXNlKCksIGVnICksXG4gICAgICAgIGhwZiA9IGcuc3ZmKCBybmQsIGcuYWRkKCBmcmVxdWVuY3ksIGcubXVsKCAxLCAxMDAwICkgKSwgLjUsIDEsIGZhbHNlICksXG4gICAgICAgIHNuYXAgPSBndHAoIGcubXVsKCBocGYsIHNuYXBweSApLCAwICksXG4gICAgICAgIGJwZjEgPSBnLnN2ZiggZWcsIGcubXVsKCAxODAsIGcuYWRkKCB0dW5lLCAxICkgKSwgLjA1LCAyLCBmYWxzZSApLFxuICAgICAgICBicGYyID0gZy5zdmYoIGVnLCBnLm11bCggMzMwLCBnLmFkZCggdHVuZSwgMSApICksIC4wNSwgMiwgZmFsc2UgKSxcbiAgICAgICAgb3V0ICA9IGcubWVtbyggZy5hZGQoIHNuYXAsIGJwZjEsIGcubXVsKCBicGYyLCAuOCApICkgKSwgLy9YWFggd2h5IGlzIG1lbW8gbmVlZGVkP1xuICAgICAgICBzY2FsZWRPdXQgPSBnLm11bCggb3V0LCBnYWluIClcbiAgICBcbiAgICAvLyBYWFggVE9ETyA6IG1ha2UgdGhpcyB3b3JrIHdpdGggaWZlbHNlLiB0aGUgcHJvYmxlbSBpcyB0aGF0IHBva2UgdWdlbnMgcHV0IHRoZWlyXG4gICAgLy8gY29kZSBhdCB0aGUgYm90dG9tIG9mIHRoZSBjYWxsYmFjayBmdW5jdGlvbiwgaW5zdGVhZCBvZiBhdCB0aGUgZW5kIG9mIHRoZVxuICAgIC8vIGFzc29jaWF0ZWQgaWYvZWxzZSBibG9jay5cbiAgICBsZXQgaWZlID0gZy5zd2l0Y2goIGNoZWNrLCBzY2FsZWRPdXQsIDAgKVxuICAgIC8vbGV0IGlmZSA9IGcuaWZlbHNlKCBnLmd0KCBlZywgLjAwNSApLCBjeWNsZSg0NDApLCAwIClcbiAgICBcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggc25hcmUsIGlmZSwgJ3NuYXJlJywgcHJvcHMgIClcbiAgICBcbiAgICBzbmFyZS5lbnYgPSBlZyBcblxuICAgIHJldHVybiBzbmFyZVxuICB9XG4gIFxuICBTbmFyZS5kZWZhdWx0cyA9IHtcbiAgICBnYWluOiAxLFxuICAgIGZyZXF1ZW5jeToxMDAwLFxuICAgIHR1bmU6MCxcbiAgICBzbmFwcHk6IC41LFxuICAgIGRlY2F5OjExMDI1XG4gIH1cblxuICByZXR1cm4gU25hcmVcblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgR2liYmVyaXNoLmdlbmlzaC5zdmYgPSAoIGlucHV0LCBjdXRvZmYsIFEsIG1vZGUsIGlzU3RlcmVvICkgPT4ge1xuICAgIGxldCBkMSA9IGRhdGEoWzAsMF0sIDEsIHsgbWV0YTp0cnVlIH0pLCBkMiA9IGRhdGEoWzAsMF0sIDEsIHsgbWV0YTp0cnVlIH0pLFxuICAgICAgICBwZWVrUHJvcHMgPSB7IG1vZGU6J3NpbXBsZScsIGludGVycDonbm9uZScgfVxuICAgIFxuICAgIGxldCBmMSA9IG1lbW8oIGcubXVsKCAyICogTWF0aC5QSSwgZGl2KCBjdXRvZmYsIGcuZ2VuLnNhbXBsZXJhdGUgKSApIClcbiAgICBsZXQgb25lT3ZlclEgPSBnLm1lbW8oIGRpdiggMSwgUSApIClcbiAgICBsZXQgbCA9IGcubWVtbyggZy5hZGQoIGQyWzBdLCBtdWwoIGYxLCBkMVswXSApICkgKSxcbiAgICAgICAgaCA9IGcubWVtbyggZy5zdWIoIGcuc3ViKCBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXQsIGwgKSwgZy5tdWwoIFEsIGQxWzBdICkgKSApLFxuICAgICAgICBiID0gZy5tZW1vKCBnLmFkZCggZy5tdWwoIGYxLCBoICksIGQxWzBdICkgKSxcbiAgICAgICAgbiA9IGcubWVtbyggZy5hZGQoIGgsIGwgKSApXG5cbiAgICBkMVswXSA9IGJcbiAgICBkMlswXSA9IGxcblxuICAgIGxldCBvdXQgPSBnLnNlbGVjdG9yKCBtb2RlLCBsLCBoLCBiLCBuIClcblxuICAgIGxldCByZXR1cm5WYWx1ZVxuICAgIGlmKCBpc1N0ZXJlbyApIHtcbiAgICAgIGxldCBkMTIgPSBkYXRhKFswLDBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSwgZDIyID0gZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSlcbiAgICAgIGxldCBsMiA9IGcubWVtbyggZy5hZGQoIGQyMlswXSwgbXVsKCBmMSwgZDEyWzBdICkgKSApLFxuICAgICAgICAgIGgyID0gZy5tZW1vKCBnLnN1YiggZy5zdWIoIGlucHV0WzFdLCBsMiApLCBnLm11bCggUSwgZDEyWzBdICkgKSApLFxuICAgICAgICAgIGIyID0gZy5tZW1vKCBnLmFkZCggZy5tdWwoIGYxLCBoMiApLCBkMTJbMF0gKSApLFxuICAgICAgICAgIG4yID0gZy5tZW1vKCBnLmFkZCggaDIsIGwyICkgKVxuXG4gICAgICBkMTJbMF0gPSBiMlxuICAgICAgZDIyWzBdID0gbDJcblxuICAgICAgbGV0IG91dDIgPSBnLnNlbGVjdG9yKCBtb2RlLCBsMiwgaDIsIGIyLCBuMiApXG5cbiAgICAgIHJldHVyblZhbHVlID0gWyBvdXQsIG91dDIgXVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuVmFsdWUgPSBvdXRcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxuXG4gIGxldCBTVkYgPSBwcm9wcyA9PiB7XG4gICAgbGV0IF9wcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBTVkYuZGVmYXVsdHMsIHByb3BzICkgXG5cbiAgICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlb1xuXG4gICAgbGV0IGZpbHRlciA9IEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guc3ZmKCBnLmluKCdpbnB1dCcpLCBnLmluKCdjdXRvZmYnKSwgZy5pbignUScpLCBnLmluKCdtb2RlJyksIGlzU3RlcmVvICksIFxuICAgICAgJ3N2ZicsIFxuICAgICAgX3Byb3BzXG4gICAgKVxuXG4gICAgcmV0dXJuIGZpbHRlclxuICB9XG5cblxuICBTVkYuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICBROiAuNzUsXG4gICAgY3V0b2ZmOjU1MCxcbiAgICBtb2RlOjBcbiAgfVxuXG4gIHJldHVybiBTVkZcblxufVxuXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnICksXG4gICAgZmVlZGJhY2tPc2MgPSByZXF1aXJlKCAnLi9mbWZlZWRiYWNrb3NjLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgU3ludGggPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgc3luID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApXG5cbiAgICBsZXQgZW52ID0gZy5hZCggZy5pbignYXR0YWNrJyksIGcuaW4oJ2RlY2F5JyksIHsgc2hhcGU6J2xpbmVhcicgfSksXG4gICAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgIHBoYXNlLCBvc2NcblxuICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIFN5bnRoLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgIHN3aXRjaCggcHJvcHMud2F2ZWZvcm0gKSB7XG4gICAgICBjYXNlICdzYXcnOlxuICAgICAgICBpZiggcHJvcHMuYW50aWFsaWFzID09PSBmYWxzZSApIHtcbiAgICAgICAgICBvc2MgPSBnLnBoYXNvciggZnJlcXVlbmN5IClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgb3NjID0gZmVlZGJhY2tPc2MoIGZyZXF1ZW5jeSwgMSApXG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzcXVhcmUnOlxuICAgICAgICBpZiggcHJvcHMuYW50aWFsaWFzID09PSB0cnVlICkge1xuICAgICAgICAgIG9zYyA9IGZlZWRiYWNrT3NjKCBmcmVxdWVuY3ksIDEsIC41LCB7IHR5cGU6MSB9KVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBwaGFzZSA9IGcucGhhc29yKCBmcmVxdWVuY3ksIDAsIHsgbWluOjAgfSApXG4gICAgICAgICAgb3NjID0gbHQoIHBoYXNlLCAuNSApXG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzaW5lJzpcbiAgICAgICAgb3NjID0gY3ljbGUoIGZyZXF1ZW5jeSApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncHdtJzpcbiAgICAgICAgbGV0IHB1bHNld2lkdGggPSBnLmluKCdwdWxzZXdpZHRoJylcbiAgICAgICAgaWYoIHByb3BzLmFudGlhbGlhcyA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICBvc2MgPSBmZWVkYmFja09zYyggZnJlcXVlbmN5LCAxLCBwdWxzZXdpZHRoLCB7IHR5cGU6MSB9KVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBwaGFzZSA9IGcucGhhc29yKCBmcmVxdWVuY3ksIDAsIHsgbWluOjAgfSApXG4gICAgICAgICAgb3NjID0gbHQoIHBoYXNlLCBwdWxzZXdpZHRoIClcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBsZXQgb3NjV2l0aEdhaW4gPSBnLm11bCggZy5tdWwoIG9zYywgZW52ICksIGcuaW4oICdnYWluJyApICksXG4gICAgICAgIHBhbm5lclxuXG4gICAgaWYoIHByb3BzLnBhblZvaWNlcyA9PT0gdHJ1ZSApIHsgXG4gICAgICBwYW5uZXIgPSBnLnBhbiggb3NjV2l0aEdhaW4sIG9zY1dpdGhHYWluLCBnLmluKCAncGFuJyApICkgXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc3luLCBbcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodF0sICdzeW50aCcsIHByb3BzICApXG4gICAgfWVsc2V7XG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc3luLCBvc2NXaXRoR2FpbiAsICdzeW50aCcsIHByb3BzIClcbiAgICB9XG4gICAgXG4gICAgc3luLmVudiA9IGVudlxuXG4gICAgcmV0dXJuIHN5blxuICB9XG4gIFxuICBTeW50aC5kZWZhdWx0cyA9IHtcbiAgICB3YXZlZm9ybTonc2F3JyxcbiAgICBhdHRhY2s6IDQ0MTAwLFxuICAgIGRlY2F5OiA0NDEwMCxcbiAgICBnYWluOiAxLFxuICAgIHB1bHNld2lkdGg6LjI1LFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBhbnRpYWxpYXM6ZmFsc2UsXG4gICAgcGFuVm9pY2VzOmZhbHNlXG4gIH1cblxuICBsZXQgUG9seVN5bnRoID0gR2liYmVyaXNoLlBvbHlUZW1wbGF0ZSggU3ludGgsIFsnZnJlcXVlbmN5JywnYXR0YWNrJywnZGVjYXknLCdwdWxzZXdpZHRoJywncGFuJywnZ2FpbiddICkgXG5cbiAgcmV0dXJuIFsgU3ludGgsIFBvbHlTeW50aCBdXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKSxcbiAgICBmZWVkYmFja09zYyA9IHJlcXVpcmUoICcuL2ZtZmVlZGJhY2tvc2MuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBTeW50aDIgPSBpbml0aWFsUHJvcHMgPT4ge1xuICAgIGxldCBzeW4gPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgIGVudiA9IGcuYWQoIGcuaW4oJ2F0dGFjaycpLCBnLmluKCdkZWNheScpLCB7IHNoYXBlOidsaW5lYXInIH0pLFxuICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICBwaGFzZSwgb3NjXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgU3ludGgyLmRlZmF1bHRzLCBpbml0aWFsUHJvcHMgKVxuXG4gICAgc3dpdGNoKCBwcm9wcy53YXZlZm9ybSApIHtcbiAgICAgIGNhc2UgJ3Nhdyc6XG4gICAgICAgIGlmKCBwcm9wcy5hbnRpYWxpYXMgPT09IGZhbHNlICkge1xuICAgICAgICAgIG9zYyA9IGcucGhhc29yKCBmcmVxdWVuY3kgKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBvc2MgPSBmZWVkYmFja09zYyggZnJlcXVlbmN5LCAxIClcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICAgIGlmKCBwcm9wcy5hbnRpYWxpYXMgPT09IHRydWUgKSB7XG4gICAgICAgICAgb3NjID0gZmVlZGJhY2tPc2MoIGZyZXF1ZW5jeSwgMSwgLjUsIHsgdHlwZToxIH0pXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHBoYXNlID0gZy5waGFzb3IoIGZyZXF1ZW5jeSwgMCwgeyBtaW46MCB9IClcbiAgICAgICAgICBvc2MgPSBsdCggcGhhc2UsIC41IClcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NpbmUnOlxuICAgICAgICBvc2MgPSBjeWNsZSggZnJlcXVlbmN5IClcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwd20nOlxuICAgICAgICBsZXQgcHVsc2V3aWR0aCA9IGcuaW4oJ3B1bHNld2lkdGgnKVxuICAgICAgICBpZiggcHJvcHMuYW50aWFsaWFzID09PSB0cnVlICkge1xuICAgICAgICAgIG9zYyA9IGZlZWRiYWNrT3NjKCBmcmVxdWVuY3ksIDEsIHB1bHNld2lkdGgsIHsgdHlwZToxIH0pXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHBoYXNlID0gZy5waGFzb3IoIGZyZXF1ZW5jeSwgMCwgeyBtaW46MCB9IClcbiAgICAgICAgICBvc2MgPSBsdCggcGhhc2UsIHB1bHNld2lkdGggKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGxldCBvc2NXaXRoR2FpbiA9IGcubXVsKCBnLm11bCggb3NjLCBlbnYgKSwgZy5pbiggJ2dhaW4nICkgKSxcbiAgICAgICAgaXNMb3dQYXNzID0gZy5wYXJhbSggJ2xvd1Bhc3MnLCAxICksXG4gICAgICAgIGZpbHRlcmVkT3NjID0gZy5maWx0ZXIyNCggb3NjV2l0aEdhaW4sIGcuaW4oJ3Jlc29uYW5jZScpLCBnLm11bCggZy5pbignY3V0b2ZmJyksIGVudiApLCBpc0xvd1Bhc3MgKSxcbiAgICAgICAgcGFubmVyXG5cbiAgICBpZiggcHJvcHMucGFuVm9pY2VzICkgeyAgXG4gICAgICBwYW5uZXIgPSBnLnBhbiggZmlsdGVyZWRPc2MsIGZpbHRlcmVkT3NjLCBnLmluKCAncGFuJyApIClcbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzeW4sIFtwYW5uZXIubGVmdCwgcGFubmVyLnJpZ2h0XSwgJ3N5bnRoMicsIHByb3BzICApXG4gICAgfWVsc2V7XG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc3luLCBmaWx0ZXJlZE9zYywgJ3N5bnRoMicsIHByb3BzIClcbiAgICB9XG4gICAgXG4gICAgc3luLmVudiA9IGVudlxuICAgIFxuICAgIHJldHVybiBzeW5cbiAgfVxuICBcbiAgU3ludGgyLmRlZmF1bHRzID0ge1xuICAgIHdhdmVmb3JtOidzYXcnLFxuICAgIGF0dGFjazogNDQxMDAsXG4gICAgZGVjYXk6IDQ0MTAwLFxuICAgIGdhaW46IDEsXG4gICAgcHVsc2V3aWR0aDouMjUsXG4gICAgZnJlcXVlbmN5OjIyMCxcbiAgICBwYW46IC41LFxuICAgIGN1dG9mZjogLjM1LFxuICAgIHJlc29uYW5jZTogMy41LFxuICAgIGFudGlhbGlhczogZmFsc2UsXG4gICAgcGFuVm9pY2VzOiBmYWxzZVxuICB9XG5cbiAgbGV0IFBvbHlTeW50aDIgPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBTeW50aDIsIFsnZnJlcXVlbmN5JywnYXR0YWNrJywnZGVjYXknLCdwdWxzZXdpZHRoJywnY3V0b2ZmJywncmVzb25hbmNlJywncGFuJywnZ2FpbiddICkgXG5cbiAgcmV0dXJuIFsgU3ludGgyLCBQb2x5U3ludGgyIF1cblxufVxuIiwibGV0IHVnZW4gPSB7XG4gIGZyZWUoKSB7XG4gICAgR2liYmVyaXNoLmdlbmlzaC5nZW4uZnJlZSggdGhpcy5ncmFwaCApXG4gIH0sXG5cbiAgcHJpbnQoKSB7XG4gICAgY29uc29sZS5sb2coIHRoaXMuY2FsbGJhY2sudG9TdHJpbmcoKSApXG4gIH0sXG5cbiAgY29ubmVjdCggdGFyZ2V0LCBsZXZlbD0xICkge1xuICAgIGxldCBpbnB1dCA9IGxldmVsID09PSAxID8gdGhpcyA6IEdpYmJlcmlzaC5NdWwoIHRoaXMsIGxldmVsIClcblxuICAgIGlmKCB0YXJnZXQgPT09IHVuZGVmaW5lZCApIHRhcmdldCA9IEdpYmJlcmlzaC5vdXRwdXQgXG5cbiAgICBpZiggdGFyZ2V0LmlucHV0cyApXG4gICAgICB0YXJnZXQuaW5wdXRzLnB1c2goIHRoaXMgKVxuICAgIGVsc2VcbiAgICAgIHRhcmdldC5pbnB1dCA9IHRoaXNcblxuICAgIEdpYmJlcmlzaC5kaXJ0eSggdGFyZ2V0IClcbiAgICBcbiAgICByZXR1cm4gdGhpc1xuICB9LFxuXG4gIGNoYWluKCB0YXJnZXQsIGxldmVsPTEgKSB7XG4gICAgdGhpcy5jb25uZWN0KCB0YXJnZXQsbGV2ZWwgKVxuXG4gICAgcmV0dXJuIHRhcmdldFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdWdlblxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBsZXQgdWlkID0gMFxuXG4gIGxldCBmYWN0b3J5ID0gZnVuY3Rpb24oIHVnZW4sIGdyYXBoLCBuYW1lLCB2YWx1ZXMgKSB7XG4gICAgdWdlbi5jYWxsYmFjayA9IEdpYmJlcmlzaC5nZW5pc2guZ2VuLmNyZWF0ZUNhbGxiYWNrKCBncmFwaCwgR2liYmVyaXNoLm1lbW9yeSApXG5cbiAgICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgICB0eXBlOiAndWdlbicsXG4gICAgICBpZDogZmFjdG9yeS5nZXRVSUQoKSwgXG4gICAgICB1Z2VuTmFtZTogbmFtZSArICdfJyxcbiAgICAgIGdyYXBoOiBncmFwaCxcbiAgICAgIGlucHV0TmFtZXM6IEdpYmJlcmlzaC5nZW5pc2guZ2VuLnBhcmFtZXRlcnMuc2xpY2UoMCksXG4gICAgICBpc1N0ZXJlbzogQXJyYXkuaXNBcnJheSggZ3JhcGggKSxcbiAgICAgIGRpcnR5OiB0cnVlXG4gICAgfSlcbiAgICBcbiAgICB1Z2VuLnVnZW5OYW1lICs9IHVnZW4uaWRcbiAgICB1Z2VuLmNhbGxiYWNrLnVnZW5OYW1lID0gdWdlbi51Z2VuTmFtZSAvLyBYWFggaGFja3lcblxuICAgIGZvciggbGV0IHBhcmFtIG9mIHVnZW4uaW5wdXROYW1lcyApIHtcbiAgICAgIGxldCB2YWx1ZSA9IHZhbHVlc1sgcGFyYW0gXVxuXG4gICAgICAvLyBUT0RPOiBkbyB3ZSBuZWVkIHRvIGNoZWNrIGZvciBhIHNldHRlcj9cbiAgICAgIGxldCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciggdWdlbiwgcGFyYW0gKSxcbiAgICAgICAgICBzZXR0ZXJcblxuICAgICAgaWYoIGRlc2MgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc2V0dGVyID0gZGVzYy5zZXRcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCBwYXJhbSwge1xuICAgICAgICBnZXQoKSB7IHJldHVybiB2YWx1ZSB9LFxuICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgaWYoIHZhbHVlICE9PSB2ICkge1xuICAgICAgICAgICAgR2liYmVyaXNoLmRpcnR5KCB1Z2VuIClcbiAgICAgICAgICAgIGlmKCBzZXR0ZXIgIT09IHVuZGVmaW5lZCApIHNldHRlciggdiApXG4gICAgICAgICAgICB2YWx1ZSA9IHZcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIHVnZW5cbiAgfVxuXG4gIGZhY3RvcnkuZ2V0VUlEID0gKCkgPT4gdWlkKytcblxuICByZXR1cm4gZmFjdG9yeVxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgVmlicmF0byA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgICA9IE9iamVjdC5hc3NpZ24oIHt9LCBWaWJyYXRvLmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICB2aWJyYXRvID0gT2JqZWN0LmNyZWF0ZSggZWZmZWN0IClcblxuICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuICBcbiAgbGV0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgZGVsYXlMZW5ndGggPSA0NDEwMCxcbiAgICAgIGZlZWRiYWNrQ29lZmYgPSBnLmluKCAnZmVlZGJhY2snICksXG4gICAgICBtb2RBbW91bnQgPSBnLmluKCAnb2Zmc2V0JyApLFxuICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgIGRlbGF5QnVmZmVyTCA9IGcuZGF0YSggZGVsYXlMZW5ndGggKSxcbiAgICAgIGRlbGF5QnVmZmVyUlxuXG4gIGxldCB3cml0ZUlkeCA9IGcuYWNjdW0oIDEsMCwgeyBtaW46MCwgbWF4OmRlbGF5TGVuZ3RoLCBpbnRlcnA6J25vbmUnLCBtb2RlOidzYW1wbGVzJyB9KVxuICBcbiAgbGV0IG9mZnNldCA9IGcubXVsKCBtb2RBbW91bnQsIDUwMCApXG4gIFxuICBsZXQgcmVhZElkeCA9IGcud3JhcCggXG4gICAgZy5hZGQoIFxuICAgICAgZy5zdWIoIHdyaXRlSWR4LCBvZmZzZXQgKSwgXG4gICAgICBnLm11bCggZy5jeWNsZSggZnJlcXVlbmN5ICksIGcuc3ViKCBvZmZzZXQsIDEgKSApIFxuICAgICksIFxuXHQgIDAsIFxuICAgIGRlbGF5TGVuZ3RoXG4gIClcblxuICBsZXQgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0XG5cbiAgbGV0IGRlbGF5ZWRPdXRMID0gZy5wZWVrKCBkZWxheUJ1ZmZlckwsIHJlYWRJZHgsIHsgaW50ZXJwOidsaW5lYXInLCBtb2RlOidzYW1wbGVzJyB9KVxuICBcbiAgZy5wb2tlKCBkZWxheUJ1ZmZlckwsIGcuYWRkKCBsZWZ0SW5wdXQsIGcubXVsKCBkZWxheWVkT3V0TCwgZmVlZGJhY2tDb2VmZiApICksIHdyaXRlSWR4IClcblxuICBsZXQgbGVmdCA9IGRlbGF5ZWRPdXRMLFxuICAgICAgcmlnaHRcblxuICBpZiggaXNTdGVyZW8gPT09IHRydWUgKSB7XG4gICAgcmlnaHRJbnB1dCA9IGlucHV0WzFdXG4gICAgZGVsYXlCdWZmZXJSID0gZy5kYXRhKCBkZWxheUxlbmd0aCApXG4gICAgXG4gICAgbGV0IGRlbGF5ZWRPdXRSID0gZy5wZWVrKCBkZWxheUJ1ZmZlclIsIHJlYWRJZHgsIHsgaW50ZXJwOidsaW5lYXInLCBtb2RlOidzYW1wbGVzJyB9KVxuXG4gICAgZy5wb2tlKCBkZWxheUJ1ZmZlclIsIGcuYWRkKCByaWdodElucHV0LCBtdWwoIGRlbGF5ZWRPdXRSLCBmZWVkYmFja0NvZWZmICkgKSwgd3JpdGVJZHggKVxuICAgIHJpZ2h0ID0gZGVsYXllZE91dFJcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIHZpYnJhdG8sXG4gICAgICBbIGxlZnQsIHJpZ2h0IF0sIFxuICAgICAgJ3ZpYnJhdG8nLCBcbiAgICAgIHByb3BzIFxuICAgIClcbiAgfWVsc2V7XG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHZpYnJhdG8sIGxlZnQsICd2aWJyYXRvJywgcHJvcHMgKVxuICB9XG4gIFxuICByZXR1cm4gdmlicmF0b1xufVxuXG5WaWJyYXRvLmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBmZWVkYmFjazouMDEsXG4gIG9mZnNldDouNSxcbiAgZnJlcXVlbmN5OjRcbn1cblxucmV0dXJuIFZpYnJhdG9cblxufVxuIiwiLyogYmlnLmpzIHYzLjEuMyBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWcuanMvTElDRU5DRSAqL1xyXG47KGZ1bmN0aW9uIChnbG9iYWwpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbi8qXHJcbiAgYmlnLmpzIHYzLjEuM1xyXG4gIEEgc21hbGwsIGZhc3QsIGVhc3ktdG8tdXNlIGxpYnJhcnkgZm9yIGFyYml0cmFyeS1wcmVjaXNpb24gZGVjaW1hbCBhcml0aG1ldGljLlxyXG4gIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZy5qcy9cclxuICBDb3B5cmlnaHQgKGMpIDIwMTQgTWljaGFlbCBNY2xhdWdobGluIDxNOGNoODhsQGdtYWlsLmNvbT5cclxuICBNSVQgRXhwYXQgTGljZW5jZVxyXG4qL1xyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqIEVESVRBQkxFIERFRkFVTFRTICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZXMgYmVsb3cgbXVzdCBiZSBpbnRlZ2VycyB3aXRoaW4gdGhlIHN0YXRlZCByYW5nZXMuXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBvZiB0aGUgcmVzdWx0cyBvZiBvcGVyYXRpb25zXHJcbiAgICAgKiBpbnZvbHZpbmcgZGl2aXNpb246IGRpdiBhbmQgc3FydCwgYW5kIHBvdyB3aXRoIG5lZ2F0aXZlIGV4cG9uZW50cy5cclxuICAgICAqL1xyXG4gICAgdmFyIERQID0gMjAsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byBNQVhfRFBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgcm91bmRpbmcgbW9kZSB1c2VkIHdoZW4gcm91bmRpbmcgdG8gdGhlIGFib3ZlIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogMCBUb3dhcmRzIHplcm8gKGkuZS4gdHJ1bmNhdGUsIG5vIHJvdW5kaW5nKS4gICAgICAgKFJPVU5EX0RPV04pXHJcbiAgICAgICAgICogMSBUbyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHJvdW5kIHVwLiAgKFJPVU5EX0hBTEZfVVApXHJcbiAgICAgICAgICogMiBUbyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHRvIGV2ZW4uICAgKFJPVU5EX0hBTEZfRVZFTilcclxuICAgICAgICAgKiAzIEF3YXkgZnJvbSB6ZXJvLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoUk9VTkRfVVApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUk0gPSAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwLCAxLCAyIG9yIDNcclxuXHJcbiAgICAgICAgLy8gVGhlIG1heGltdW0gdmFsdWUgb2YgRFAgYW5kIEJpZy5EUC5cclxuICAgICAgICBNQVhfRFAgPSAxRTYsICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gMTAwMDAwMFxyXG5cclxuICAgICAgICAvLyBUaGUgbWF4aW11bSBtYWduaXR1ZGUgb2YgdGhlIGV4cG9uZW50IGFyZ3VtZW50IHRvIHRoZSBwb3cgbWV0aG9kLlxyXG4gICAgICAgIE1BWF9QT1dFUiA9IDFFNiwgICAgICAgICAgICAgICAgICAgLy8gMSB0byAxMDAwMDAwXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBiZW5lYXRoIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKiBKYXZhU2NyaXB0J3MgTnVtYmVyIHR5cGU6IC03XHJcbiAgICAgICAgICogLTEwMDAwMDAgaXMgdGhlIG1pbmltdW0gcmVjb21tZW5kZWQgZXhwb25lbnQgdmFsdWUgb2YgYSBCaWcuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgRV9ORUcgPSAtNywgICAgICAgICAgICAgICAgICAgLy8gMCB0byAtMTAwMDAwMFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYWJvdmUgd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqIEphdmFTY3JpcHQncyBOdW1iZXIgdHlwZTogMjFcclxuICAgICAgICAgKiAxMDAwMDAwIGlzIHRoZSBtYXhpbXVtIHJlY29tbWVuZGVkIGV4cG9uZW50IHZhbHVlIG9mIGEgQmlnLlxyXG4gICAgICAgICAqIChUaGlzIGxpbWl0IGlzIG5vdCBlbmZvcmNlZCBvciBjaGVja2VkLilcclxuICAgICAgICAgKi9cclxuICAgICAgICBFX1BPUyA9IDIxLCAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDEwMDAwMDBcclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgICAgIC8vIFRoZSBzaGFyZWQgcHJvdG90eXBlIG9iamVjdC5cclxuICAgICAgICBQID0ge30sXHJcbiAgICAgICAgaXNWYWxpZCA9IC9eLT8oXFxkKyhcXC5cXGQqKT98XFwuXFxkKykoZVsrLV0/XFxkKyk/JC9pLFxyXG4gICAgICAgIEJpZztcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgQmlnIGNvbnN0cnVjdG9yLlxyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gYmlnRmFjdG9yeSgpIHtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgQmlnIGNvbnN0cnVjdG9yIGFuZCBleHBvcnRlZCBmdW5jdGlvbi5cclxuICAgICAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIG5ldyBpbnN0YW5jZSBvZiBhIEJpZyBudW1iZXIgb2JqZWN0LlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogbiB7bnVtYmVyfHN0cmluZ3xCaWd9IEEgbnVtZXJpYyB2YWx1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBCaWcobikge1xyXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICAvLyBFbmFibGUgY29uc3RydWN0b3IgdXNhZ2Ugd2l0aG91dCBuZXcuXHJcbiAgICAgICAgICAgIGlmICghKHggaW5zdGFuY2VvZiBCaWcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbiA9PT0gdm9pZCAwID8gYmlnRmFjdG9yeSgpIDogbmV3IEJpZyhuKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRHVwbGljYXRlLlxyXG4gICAgICAgICAgICBpZiAobiBpbnN0YW5jZW9mIEJpZykge1xyXG4gICAgICAgICAgICAgICAgeC5zID0gbi5zO1xyXG4gICAgICAgICAgICAgICAgeC5lID0gbi5lO1xyXG4gICAgICAgICAgICAgICAgeC5jID0gbi5jLnNsaWNlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZSh4LCBuKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogUmV0YWluIGEgcmVmZXJlbmNlIHRvIHRoaXMgQmlnIGNvbnN0cnVjdG9yLCBhbmQgc2hhZG93XHJcbiAgICAgICAgICAgICAqIEJpZy5wcm90b3R5cGUuY29uc3RydWN0b3Igd2hpY2ggcG9pbnRzIHRvIE9iamVjdC5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHguY29uc3RydWN0b3IgPSBCaWc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBCaWcucHJvdG90eXBlID0gUDtcclxuICAgICAgICBCaWcuRFAgPSBEUDtcclxuICAgICAgICBCaWcuUk0gPSBSTTtcclxuICAgICAgICBCaWcuRV9ORUcgPSBFX05FRztcclxuICAgICAgICBCaWcuRV9QT1MgPSBFX1BPUztcclxuXHJcbiAgICAgICAgcmV0dXJuIEJpZztcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUHJpdmF0ZSBmdW5jdGlvbnNcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIEJpZyB4IGluIG5vcm1hbCBvciBleHBvbmVudGlhbFxyXG4gICAgICogbm90YXRpb24gdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgb3Igc2lnbmlmaWNhbnQgZGlnaXRzLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gVGhlIEJpZyB0byBmb3JtYXQuXHJcbiAgICAgKiBkcCB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiB0b0Uge251bWJlcn0gMSAodG9FeHBvbmVudGlhbCksIDIgKHRvUHJlY2lzaW9uKSBvciB1bmRlZmluZWQgKHRvRml4ZWQpLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBmb3JtYXQoeCwgZHAsIHRvRSkge1xyXG4gICAgICAgIHZhciBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG5cclxuICAgICAgICAgICAgLy8gVGhlIGluZGV4IChub3JtYWwgbm90YXRpb24pIG9mIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBpID0gZHAgLSAoeCA9IG5ldyBCaWcoeCkpLmUsXHJcbiAgICAgICAgICAgIGMgPSB4LmM7XHJcblxyXG4gICAgICAgIC8vIFJvdW5kP1xyXG4gICAgICAgIGlmIChjLmxlbmd0aCA+ICsrZHApIHtcclxuICAgICAgICAgICAgcm5kKHgsIGksIEJpZy5STSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWNbMF0pIHtcclxuICAgICAgICAgICAgKytpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodG9FKSB7XHJcbiAgICAgICAgICAgIGkgPSBkcDtcclxuXHJcbiAgICAgICAgLy8gdG9GaXhlZFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGMgPSB4LmM7XHJcblxyXG4gICAgICAgICAgICAvLyBSZWNhbGN1bGF0ZSBpIGFzIHguZSBtYXkgaGF2ZSBjaGFuZ2VkIGlmIHZhbHVlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIGkgPSB4LmUgKyBpICsgMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGVuZCB6ZXJvcz9cclxuICAgICAgICBmb3IgKDsgYy5sZW5ndGggPCBpOyBjLnB1c2goMCkpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgaSA9IHguZTtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiB0b1ByZWNpc2lvbiByZXR1cm5zIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoZSBudW1iZXIgb2ZcclxuICAgICAgICAgKiBzaWduaWZpY2FudCBkaWdpdHMgc3BlY2lmaWVkIGlzIGxlc3MgdGhhbiB0aGUgbnVtYmVyIG9mIGRpZ2l0c1xyXG4gICAgICAgICAqIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGUgdmFsdWUgaW4gbm9ybWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcmV0dXJuIHRvRSA9PT0gMSB8fCB0b0UgJiYgKGRwIDw9IGkgfHwgaSA8PSBCaWcuRV9ORUcpID9cclxuXHJcbiAgICAgICAgICAvLyBFeHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICAgICh4LnMgPCAwICYmIGNbMF0gPyAnLScgOiAnJykgK1xyXG4gICAgICAgICAgICAoYy5sZW5ndGggPiAxID8gY1swXSArICcuJyArIGMuam9pbignJykuc2xpY2UoMSkgOiBjWzBdKSArXHJcbiAgICAgICAgICAgICAgKGkgPCAwID8gJ2UnIDogJ2UrJykgKyBpXHJcblxyXG4gICAgICAgICAgLy8gTm9ybWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgOiB4LnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBQYXJzZSB0aGUgbnVtYmVyIG9yIHN0cmluZyB2YWx1ZSBwYXNzZWQgdG8gYSBCaWcgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBBIEJpZyBudW1iZXIgaW5zdGFuY2UuXHJcbiAgICAgKiBuIHtudW1iZXJ8c3RyaW5nfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHBhcnNlKHgsIG4pIHtcclxuICAgICAgICB2YXIgZSwgaSwgbkw7XHJcblxyXG4gICAgICAgIC8vIE1pbnVzIHplcm8/XHJcbiAgICAgICAgaWYgKG4gPT09IDAgJiYgMSAvIG4gPCAwKSB7XHJcbiAgICAgICAgICAgIG4gPSAnLTAnO1xyXG5cclxuICAgICAgICAvLyBFbnN1cmUgbiBpcyBzdHJpbmcgYW5kIGNoZWNrIHZhbGlkaXR5LlxyXG4gICAgICAgIH0gZWxzZSBpZiAoIWlzVmFsaWQudGVzdChuICs9ICcnKSkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHNpZ24uXHJcbiAgICAgICAgeC5zID0gbi5jaGFyQXQoMCkgPT0gJy0nID8gKG4gPSBuLnNsaWNlKDEpLCAtMSkgOiAxO1xyXG5cclxuICAgICAgICAvLyBEZWNpbWFsIHBvaW50P1xyXG4gICAgICAgIGlmICgoZSA9IG4uaW5kZXhPZignLicpKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIG4gPSBuLnJlcGxhY2UoJy4nLCAnJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFeHBvbmVudGlhbCBmb3JtP1xyXG4gICAgICAgIGlmICgoaSA9IG4uc2VhcmNoKC9lL2kpKSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSBleHBvbmVudC5cclxuICAgICAgICAgICAgaWYgKGUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBlID0gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlICs9ICtuLnNsaWNlKGkgKyAxKTtcclxuICAgICAgICAgICAgbiA9IG4uc3Vic3RyaW5nKDAsIGkpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJbnRlZ2VyLlxyXG4gICAgICAgICAgICBlID0gbi5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGkgPSAwOyBuLmNoYXJBdChpKSA9PSAnMCc7IGkrKykge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGkgPT0gKG5MID0gbi5sZW5ndGgpKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICB4LmMgPSBbIHguZSA9IDAgXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKDsgbi5jaGFyQXQoLS1uTCkgPT0gJzAnOykge1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB4LmUgPSBlIC0gaSAtIDE7XHJcbiAgICAgICAgICAgIHguYyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29udmVydCBzdHJpbmcgdG8gYXJyYXkgb2YgZGlnaXRzIHdpdGhvdXQgbGVhZGluZy90cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yIChlID0gMDsgaSA8PSBuTDsgeC5jW2UrK10gPSArbi5jaGFyQXQoaSsrKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJvdW5kIEJpZyB4IHRvIGEgbWF4aW11bSBvZiBkcCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLlxyXG4gICAgICogQ2FsbGVkIGJ5IGRpdiwgc3FydCBhbmQgcm91bmQuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBUaGUgQmlnIHRvIHJvdW5kLlxyXG4gICAgICogZHAge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogcm0ge251bWJlcn0gMCwgMSwgMiBvciAzIChET1dOLCBIQUxGX1VQLCBIQUxGX0VWRU4sIFVQKVxyXG4gICAgICogW21vcmVdIHtib29sZWFufSBXaGV0aGVyIHRoZSByZXN1bHQgb2YgZGl2aXNpb24gd2FzIHRydW5jYXRlZC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcm5kKHgsIGRwLCBybSwgbW9yZSkge1xyXG4gICAgICAgIHZhciB1LFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgaSA9IHguZSArIGRwICsgMTtcclxuXHJcbiAgICAgICAgaWYgKHJtID09PSAxKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB4Y1tpXSBpcyB0aGUgZGlnaXQgYWZ0ZXIgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIG1vcmUgPSB4Y1tpXSA+PSA1O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm0gPT09IDIpIHtcclxuICAgICAgICAgICAgbW9yZSA9IHhjW2ldID4gNSB8fCB4Y1tpXSA9PSA1ICYmXHJcbiAgICAgICAgICAgICAgKG1vcmUgfHwgaSA8IDAgfHwgeGNbaSArIDFdICE9PSB1IHx8IHhjW2kgLSAxXSAmIDEpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm0gPT09IDMpIHtcclxuICAgICAgICAgICAgbW9yZSA9IG1vcmUgfHwgeGNbaV0gIT09IHUgfHwgaSA8IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbW9yZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJtICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycignIUJpZy5STSEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGkgPCAxIHx8ICF4Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKG1vcmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAxLCAwLjEsIDAuMDEsIDAuMDAxLCAwLjAwMDEgZXRjLlxyXG4gICAgICAgICAgICAgICAgeC5lID0gLWRwO1xyXG4gICAgICAgICAgICAgICAgeC5jID0gWzFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgICAgICB4LmMgPSBbeC5lID0gMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGFueSBkaWdpdHMgYWZ0ZXIgdGhlIHJlcXVpcmVkIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAgICB4Yy5sZW5ndGggPSBpLS07XHJcblxyXG4gICAgICAgICAgICAvLyBSb3VuZCB1cD9cclxuICAgICAgICAgICAgaWYgKG1vcmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSb3VuZGluZyB1cCBtYXkgbWVhbiB0aGUgcHJldmlvdXMgZGlnaXQgaGFzIHRvIGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgICAgICBmb3IgKDsgKyt4Y1tpXSA+IDk7KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeGNbaV0gPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWktLSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArK3guZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGMudW5zaGlmdCgxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yIChpID0geGMubGVuZ3RoOyAheGNbLS1pXTsgeGMucG9wKCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaHJvdyBhIEJpZ0Vycm9yLlxyXG4gICAgICpcclxuICAgICAqIG1lc3NhZ2Uge3N0cmluZ30gVGhlIGVycm9yIG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHRocm93RXJyKG1lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgICAgIGVyci5uYW1lID0gJ0JpZ0Vycm9yJztcclxuXHJcbiAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBQcm90b3R5cGUvaW5zdGFuY2UgbWV0aG9kc1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBCaWcuXHJcbiAgICAgKi9cclxuICAgIFAuYWJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB4ID0gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcyk7XHJcbiAgICAgICAgeC5zID0gMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuXHJcbiAgICAgKiAxIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogLTEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksIG9yXHJcbiAgICAgKiAwIGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSB2YWx1ZS5cclxuICAgICovXHJcbiAgICBQLmNtcCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHhOZWcsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSAoeSA9IG5ldyB4LmNvbnN0cnVjdG9yKHkpKS5jLFxyXG4gICAgICAgICAgICBpID0geC5zLFxyXG4gICAgICAgICAgICBqID0geS5zLFxyXG4gICAgICAgICAgICBrID0geC5lLFxyXG4gICAgICAgICAgICBsID0geS5lO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gIXhjWzBdID8gIXljWzBdID8gMCA6IC1qIDogaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoaSAhPSBqKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4TmVnID0gaSA8IDA7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmIChrICE9IGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGsgPiBsIF4geE5lZyA/IDEgOiAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSAtMTtcclxuICAgICAgICBqID0gKGsgPSB4Yy5sZW5ndGgpIDwgKGwgPSB5Yy5sZW5ndGgpID8gayA6IGw7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgZm9yICg7ICsraSA8IGo7KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoeGNbaV0gIT0geWNbaV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4Y1tpXSA+IHljW2ldIF4geE5lZyA/IDEgOiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBsZW5ndGhzLlxyXG4gICAgICAgIHJldHVybiBrID09IGwgPyAwIDogayA+IGwgXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGRpdmlkZWQgYnkgdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeSwgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWxcclxuICAgICAqIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqL1xyXG4gICAgUC5kaXYgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgLy8gZGl2aWRlbmRcclxuICAgICAgICAgICAgZHZkID0geC5jLFxyXG4gICAgICAgICAgICAvL2Rpdmlzb3JcclxuICAgICAgICAgICAgZHZzID0gKHkgPSBuZXcgQmlnKHkpKS5jLFxyXG4gICAgICAgICAgICBzID0geC5zID09IHkucyA/IDEgOiAtMSxcclxuICAgICAgICAgICAgZHAgPSBCaWcuRFA7XHJcblxyXG4gICAgICAgIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFCaWcuRFAhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFaXRoZXIgMD9cclxuICAgICAgICBpZiAoIWR2ZFswXSB8fCAhZHZzWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBib3RoIGFyZSAwLCB0aHJvdyBOYU5cclxuICAgICAgICAgICAgaWYgKGR2ZFswXSA9PSBkdnNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGR2cyBpcyAwLCB0aHJvdyArLUluZmluaXR5LlxyXG4gICAgICAgICAgICBpZiAoIWR2c1swXSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIocyAvIDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBkdmQgaXMgMCwgcmV0dXJuICstMC5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcocyAqIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGR2c0wsIGR2c1QsIG5leHQsIGNtcCwgcmVtSSwgdSxcclxuICAgICAgICAgICAgZHZzWiA9IGR2cy5zbGljZSgpLFxyXG4gICAgICAgICAgICBkdmRJID0gZHZzTCA9IGR2cy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGR2ZEwgPSBkdmQubGVuZ3RoLFxyXG4gICAgICAgICAgICAvLyByZW1haW5kZXJcclxuICAgICAgICAgICAgcmVtID0gZHZkLnNsaWNlKDAsIGR2c0wpLFxyXG4gICAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aCxcclxuICAgICAgICAgICAgLy8gcXVvdGllbnRcclxuICAgICAgICAgICAgcSA9IHksXHJcbiAgICAgICAgICAgIHFjID0gcS5jID0gW10sXHJcbiAgICAgICAgICAgIHFpID0gMCxcclxuICAgICAgICAgICAgZGlnaXRzID0gZHAgKyAocS5lID0geC5lIC0geS5lKSArIDE7XHJcblxyXG4gICAgICAgIHEucyA9IHM7XHJcbiAgICAgICAgcyA9IGRpZ2l0cyA8IDAgPyAwIDogZGlnaXRzO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdmVyc2lvbiBvZiBkaXZpc29yIHdpdGggbGVhZGluZyB6ZXJvLlxyXG4gICAgICAgIGR2c1oudW5zaGlmdCgwKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHplcm9zIHRvIG1ha2UgcmVtYWluZGVyIGFzIGxvbmcgYXMgZGl2aXNvci5cclxuICAgICAgICBmb3IgKDsgcmVtTCsrIDwgZHZzTDsgcmVtLnB1c2goMCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRvIHtcclxuXHJcbiAgICAgICAgICAgIC8vICduZXh0JyBpcyBob3cgbWFueSB0aW1lcyB0aGUgZGl2aXNvciBnb2VzIGludG8gY3VycmVudCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGZvciAobmV4dCA9IDA7IG5leHQgPCAxMDsgbmV4dCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29tcGFyZSBkaXZpc29yIGFuZCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoZHZzTCAhPSAocmVtTCA9IHJlbS5sZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY21wID0gZHZzTCA+IHJlbUwgPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHJlbUkgPSAtMSwgY21wID0gMDsgKytyZW1JIDwgZHZzTDspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkdnNbcmVtSV0gIT0gcmVtW3JlbUldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbXAgPSBkdnNbcmVtSV0gPiByZW1bcmVtSV0gPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBkaXZpc29yIDwgcmVtYWluZGVyLCBzdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGNtcCA8IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtYWluZGVyIGNhbid0IGJlIG1vcmUgdGhhbiAxIGRpZ2l0IGxvbmdlciB0aGFuIGRpdmlzb3IuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXF1YWxpc2UgbGVuZ3RocyB1c2luZyBkaXZpc29yIHdpdGggZXh0cmEgbGVhZGluZyB6ZXJvP1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoZHZzVCA9IHJlbUwgPT0gZHZzTCA/IGR2cyA6IGR2c1o7IHJlbUw7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtWy0tcmVtTF0gPCBkdnNUW3JlbUxdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1JID0gcmVtTDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKDsgcmVtSSAmJiAhcmVtWy0tcmVtSV07IHJlbVtyZW1JXSA9IDkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0tcmVtW3JlbUldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtW3JlbUxdICs9IDEwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbVtyZW1MXSAtPSBkdnNUW3JlbUxdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgIXJlbVswXTsgcmVtLnNoaWZ0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgdGhlICduZXh0JyBkaWdpdCB0byB0aGUgcmVzdWx0IGFycmF5LlxyXG4gICAgICAgICAgICBxY1txaSsrXSA9IGNtcCA/IG5leHQgOiArK25leHQ7XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgaWYgKHJlbVswXSAmJiBjbXApIHtcclxuICAgICAgICAgICAgICAgIHJlbVtyZW1MXSA9IGR2ZFtkdmRJXSB8fCAwO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVtID0gWyBkdmRbZHZkSV0gXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IHdoaWxlICgoZHZkSSsrIDwgZHZkTCB8fCByZW1bMF0gIT09IHUpICYmIHMtLSk7XHJcblxyXG4gICAgICAgIC8vIExlYWRpbmcgemVybz8gRG8gbm90IHJlbW92ZSBpZiByZXN1bHQgaXMgc2ltcGx5IHplcm8gKHFpID09IDEpLlxyXG4gICAgICAgIGlmICghcWNbMF0gJiYgcWkgIT0gMSkge1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlcmUgY2FuJ3QgYmUgbW9yZSB0aGFuIG9uZSB6ZXJvLlxyXG4gICAgICAgICAgICBxYy5zaGlmdCgpO1xyXG4gICAgICAgICAgICBxLmUtLTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJvdW5kP1xyXG4gICAgICAgIGlmIChxaSA+IGRpZ2l0cykge1xyXG4gICAgICAgICAgICBybmQocSwgZHAsIEJpZy5STSwgcmVtWzBdICE9PSB1KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBxO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBlcXVhbCB0byB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5lcSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmNtcCh5KTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmd0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZ3RlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAtMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmx0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPCAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAubHRlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBtaW51cyB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLnN1YiA9IFAubWludXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciBpLCBqLCB0LCB4TFR5LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgIHJldHVybiB4LnBsdXMoeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgeGMgPSB4LmMuc2xpY2UoKSxcclxuICAgICAgICAgICAgeGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHljID0geS5jLFxyXG4gICAgICAgICAgICB5ZSA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHkgaXMgbm9uLXplcm8/IHggaXMgbm9uLXplcm8/IE9yIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgIHJldHVybiB5Y1swXSA/ICh5LnMgPSAtYiwgeSkgOiBuZXcgQmlnKHhjWzBdID8geCA6IDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIGlzIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhMVHkgPSBhIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIGZvciAoYiA9IGE7IGItLTsgdC5wdXNoKDApKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEV4cG9uZW50cyBlcXVhbC4gQ2hlY2sgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgICAgIGogPSAoKHhMVHkgPSB4Yy5sZW5ndGggPCB5Yy5sZW5ndGgpID8geGMgOiB5YykubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yIChhID0gYiA9IDA7IGIgPCBqOyBiKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoeGNbYl0gIT0geWNbYl0pIHtcclxuICAgICAgICAgICAgICAgICAgICB4TFR5ID0geGNbYl0gPCB5Y1tiXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8geCA8IHk/IFBvaW50IHhjIHRvIHRoZSBhcnJheSBvZiB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICBpZiAoeExUeSkge1xyXG4gICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIHhjID0geWM7XHJcbiAgICAgICAgICAgIHljID0gdDtcclxuICAgICAgICAgICAgeS5zID0gLXkucztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogQXBwZW5kIHplcm9zIHRvIHhjIGlmIHNob3J0ZXIuIE5vIG5lZWQgdG8gYWRkIHplcm9zIHRvIHljIGlmIHNob3J0ZXJcclxuICAgICAgICAgKiBhcyBzdWJ0cmFjdGlvbiBvbmx5IG5lZWRzIHRvIHN0YXJ0IGF0IHljLmxlbmd0aC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpZiAoKCBiID0gKGogPSB5Yy5sZW5ndGgpIC0gKGkgPSB4Yy5sZW5ndGgpICkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKDsgYi0tOyB4Y1tpKytdID0gMCkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTdWJ0cmFjdCB5YyBmcm9tIHhjLlxyXG4gICAgICAgIGZvciAoYiA9IGk7IGogPiBhOyl7XHJcblxyXG4gICAgICAgICAgICBpZiAoeGNbLS1qXSA8IHljW2pdKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gajsgaSAmJiAheGNbLS1pXTsgeGNbaV0gPSA5KSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAtLXhjW2ldO1xyXG4gICAgICAgICAgICAgICAgeGNbal0gKz0gMTA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeGNbal0gLT0geWNbal07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yICg7IHhjWy0tYl0gPT09IDA7IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgICAgIGZvciAoOyB4Y1swXSA9PT0gMDspIHtcclxuICAgICAgICAgICAgeGMuc2hpZnQoKTtcclxuICAgICAgICAgICAgLS15ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIG4gLSBuID0gKzBcclxuICAgICAgICAgICAgeS5zID0gMTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlc3VsdCBtdXN0IGJlIHplcm8uXHJcbiAgICAgICAgICAgIHhjID0gW3llID0gMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB5LmMgPSB4YztcclxuICAgICAgICB5LmUgPSB5ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgbW9kdWxvIHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAubW9kID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeUdUeCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIGlmICgheS5jWzBdKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB4LnMgPSB5LnMgPSAxO1xyXG4gICAgICAgIHlHVHggPSB5LmNtcCh4KSA9PSAxO1xyXG4gICAgICAgIHgucyA9IGE7XHJcbiAgICAgICAgeS5zID0gYjtcclxuXHJcbiAgICAgICAgaWYgKHlHVHgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhID0gQmlnLkRQO1xyXG4gICAgICAgIGIgPSBCaWcuUk07XHJcbiAgICAgICAgQmlnLkRQID0gQmlnLlJNID0gMDtcclxuICAgICAgICB4ID0geC5kaXYoeSk7XHJcbiAgICAgICAgQmlnLkRQID0gYTtcclxuICAgICAgICBCaWcuUk0gPSBiO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5taW51cyggeC50aW1lcyh5KSApO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHBsdXMgdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5hZGQgPSBQLnBsdXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB0LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgIHJldHVybiB4Lm1pbnVzKHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHhlID0geC5lLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWUgPSB5LmUsXHJcbiAgICAgICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8geSBpcyBub24temVybz8geCBpcyBub24temVybz8gT3IgYm90aCBhcmUgemVyby5cclxuICAgICAgICAgICAgcmV0dXJuIHljWzBdID8geSA6IG5ldyBCaWcoeGNbMF0gPyB4IDogYSAqIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4YyA9IHhjLnNsaWNlKCk7XHJcblxyXG4gICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgIC8vIE5vdGU6IEZhc3RlciB0byB1c2UgcmV2ZXJzZSB0aGVuIGRvIHVuc2hpZnRzLlxyXG4gICAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGEgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB5ZSA9IHhlO1xyXG4gICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgZm9yICg7IGEtLTsgdC5wdXNoKDApKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBQb2ludCB4YyB0byB0aGUgbG9uZ2VyIGFycmF5LlxyXG4gICAgICAgIGlmICh4Yy5sZW5ndGggLSB5Yy5sZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgeWMgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBhID0geWMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIE9ubHkgc3RhcnQgYWRkaW5nIGF0IHljLmxlbmd0aCAtIDEgYXMgdGhlIGZ1cnRoZXIgZGlnaXRzIG9mIHhjIGNhbiBiZVxyXG4gICAgICAgICAqIGxlZnQgYXMgdGhleSBhcmUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9yIChiID0gMDsgYTspIHtcclxuICAgICAgICAgICAgYiA9ICh4Y1stLWFdID0geGNbYV0gKyB5Y1thXSArIGIpIC8gMTAgfCAwO1xyXG4gICAgICAgICAgICB4Y1thXSAlPSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5vIG5lZWQgdG8gY2hlY2sgZm9yIHplcm8sIGFzICt4ICsgK3kgIT0gMCAmJiAteCArIC15ICE9IDBcclxuXHJcbiAgICAgICAgaWYgKGIpIHtcclxuICAgICAgICAgICAgeGMudW5zaGlmdChiKTtcclxuICAgICAgICAgICAgKyt5ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChhID0geGMubGVuZ3RoOyB4Y1stLWFdID09PSAwOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeS5jID0geGM7XHJcbiAgICAgICAgeS5lID0geWU7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcmFpc2VkIHRvIHRoZSBwb3dlciBuLlxyXG4gICAgICogSWYgbiBpcyBuZWdhdGl2ZSwgcm91bmQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsXHJcbiAgICAgKiBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogbiB7bnVtYmVyfSBJbnRlZ2VyLCAtTUFYX1BPV0VSIHRvIE1BWF9QT1dFUiBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAucG93ID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIG9uZSA9IG5ldyB4LmNvbnN0cnVjdG9yKDEpLFxyXG4gICAgICAgICAgICB5ID0gb25lLFxyXG4gICAgICAgICAgICBpc05lZyA9IG4gPCAwO1xyXG5cclxuICAgICAgICBpZiAobiAhPT0gfn5uIHx8IG4gPCAtTUFYX1BPV0VSIHx8IG4gPiBNQVhfUE9XRVIpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFwb3chJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuID0gaXNOZWcgPyAtbiA6IG47XHJcblxyXG4gICAgICAgIGZvciAoOzspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChuICYgMSkge1xyXG4gICAgICAgICAgICAgICAgeSA9IHkudGltZXMoeCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbiA+Pj0gMTtcclxuXHJcbiAgICAgICAgICAgIGlmICghbikge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeCA9IHgudGltZXMoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaXNOZWcgPyBvbmUuZGl2KHkpIDogeTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIGFcclxuICAgICAqIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS5cclxuICAgICAqIElmIGRwIGlzIG5vdCBzcGVjaWZpZWQsIHJvdW5kIHRvIDAgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgKiBJZiBybSBpcyBub3Qgc3BlY2lmaWVkLCB1c2UgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogW3JtXSAwLCAxLCAyIG9yIDMgKFJPVU5EX0RPV04sIFJPVU5EX0hBTEZfVVAsIFJPVU5EX0hBTEZfRVZFTiwgUk9VTkRfVVApXHJcbiAgICAgKi9cclxuICAgIFAucm91bmQgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBkcCA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFyb3VuZCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcm5kKHggPSBuZXcgQmlnKHgpLCBkcCwgcm0gPT0gbnVsbCA/IEJpZy5STSA6IHJtKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhlIHZhbHVlIG9mIHRoaXMgQmlnLFxyXG4gICAgICogcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWwgcGxhY2VzIHVzaW5nXHJcbiAgICAgKiByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqL1xyXG4gICAgUC5zcXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlc3RpbWF0ZSwgciwgYXBwcm94LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIGkgPSB4LnMsXHJcbiAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgIGhhbGYgPSBuZXcgQmlnKCcwLjUnKTtcclxuXHJcbiAgICAgICAgLy8gWmVybz9cclxuICAgICAgICBpZiAoIXhjWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgbmVnYXRpdmUsIHRocm93IE5hTi5cclxuICAgICAgICBpZiAoaSA8IDApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEVzdGltYXRlLlxyXG4gICAgICAgIGkgPSBNYXRoLnNxcnQoeC50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgLy8gTWF0aC5zcXJ0IHVuZGVyZmxvdy9vdmVyZmxvdz9cclxuICAgICAgICAvLyBQYXNzIHggdG8gTWF0aC5zcXJ0IGFzIGludGVnZXIsIHRoZW4gYWRqdXN0IHRoZSByZXN1bHQgZXhwb25lbnQuXHJcbiAgICAgICAgaWYgKGkgPT09IDAgfHwgaSA9PT0gMSAvIDApIHtcclxuICAgICAgICAgICAgZXN0aW1hdGUgPSB4Yy5qb2luKCcnKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghKGVzdGltYXRlLmxlbmd0aCArIGUgJiAxKSkge1xyXG4gICAgICAgICAgICAgICAgZXN0aW1hdGUgKz0gJzAnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByID0gbmV3IEJpZyggTWF0aC5zcXJ0KGVzdGltYXRlKS50b1N0cmluZygpICk7XHJcbiAgICAgICAgICAgIHIuZSA9ICgoZSArIDEpIC8gMiB8IDApIC0gKGUgPCAwIHx8IGUgJiAxKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByID0gbmV3IEJpZyhpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSA9IHIuZSArIChCaWcuRFAgKz0gNCk7XHJcblxyXG4gICAgICAgIC8vIE5ld3Rvbi1SYXBoc29uIGl0ZXJhdGlvbi5cclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGFwcHJveCA9IHI7XHJcbiAgICAgICAgICAgIHIgPSBoYWxmLnRpbWVzKCBhcHByb3gucGx1cyggeC5kaXYoYXBwcm94KSApICk7XHJcbiAgICAgICAgfSB3aGlsZSAoIGFwcHJveC5jLnNsaWNlKDAsIGkpLmpvaW4oJycpICE9PVxyXG4gICAgICAgICAgICAgICAgICAgICAgIHIuYy5zbGljZSgwLCBpKS5qb2luKCcnKSApO1xyXG5cclxuICAgICAgICBybmQociwgQmlnLkRQIC09IDQsIEJpZy5STSk7XHJcblxyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHRpbWVzIHRoZSB2YWx1ZSBvZlxyXG4gICAgICogQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAubXVsID0gUC50aW1lcyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIGMsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSAoeSA9IG5ldyBCaWcoeSkpLmMsXHJcbiAgICAgICAgICAgIGEgPSB4Yy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGIgPSB5Yy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGkgPSB4LmUsXHJcbiAgICAgICAgICAgIGogPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBzaWduIG9mIHJlc3VsdC5cclxuICAgICAgICB5LnMgPSB4LnMgPT0geS5zID8gMSA6IC0xO1xyXG5cclxuICAgICAgICAvLyBSZXR1cm4gc2lnbmVkIDAgaWYgZWl0aGVyIDAuXHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeS5zICogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXNlIGV4cG9uZW50IG9mIHJlc3VsdCBhcyB4LmUgKyB5LmUuXHJcbiAgICAgICAgeS5lID0gaSArIGo7XHJcblxyXG4gICAgICAgIC8vIElmIGFycmF5IHhjIGhhcyBmZXdlciBkaWdpdHMgdGhhbiB5Yywgc3dhcCB4YyBhbmQgeWMsIGFuZCBsZW5ndGhzLlxyXG4gICAgICAgIGlmIChhIDwgYikge1xyXG4gICAgICAgICAgICBjID0geGM7XHJcbiAgICAgICAgICAgIHhjID0geWM7XHJcbiAgICAgICAgICAgIHljID0gYztcclxuICAgICAgICAgICAgaiA9IGE7XHJcbiAgICAgICAgICAgIGEgPSBiO1xyXG4gICAgICAgICAgICBiID0gajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpc2UgY29lZmZpY2llbnQgYXJyYXkgb2YgcmVzdWx0IHdpdGggemVyb3MuXHJcbiAgICAgICAgZm9yIChjID0gbmV3IEFycmF5KGogPSBhICsgYik7IGotLTsgY1tqXSA9IDApIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE11bHRpcGx5LlxyXG5cclxuICAgICAgICAvLyBpIGlzIGluaXRpYWxseSB4Yy5sZW5ndGguXHJcbiAgICAgICAgZm9yIChpID0gYjsgaS0tOykge1xyXG4gICAgICAgICAgICBiID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIGEgaXMgeWMubGVuZ3RoLlxyXG4gICAgICAgICAgICBmb3IgKGogPSBhICsgaTsgaiA+IGk7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3VycmVudCBzdW0gb2YgcHJvZHVjdHMgYXQgdGhpcyBkaWdpdCBwb3NpdGlvbiwgcGx1cyBjYXJyeS5cclxuICAgICAgICAgICAgICAgIGIgPSBjW2pdICsgeWNbaV0gKiB4Y1tqIC0gaSAtIDFdICsgYjtcclxuICAgICAgICAgICAgICAgIGNbai0tXSA9IGIgJSAxMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjYXJyeVxyXG4gICAgICAgICAgICAgICAgYiA9IGIgLyAxMCB8IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY1tqXSA9IChjW2pdICsgYikgJSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluY3JlbWVudCByZXN1bHQgZXhwb25lbnQgaWYgdGhlcmUgaXMgYSBmaW5hbCBjYXJyeS5cclxuICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICArK3kuZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBhbnkgbGVhZGluZyB6ZXJvLlxyXG4gICAgICAgIGlmICghY1swXSkge1xyXG4gICAgICAgICAgICBjLnNoaWZ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChpID0gYy5sZW5ndGg7ICFjWy0taV07IGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgeS5jID0gYztcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcuXHJcbiAgICAgKiBSZXR1cm4gZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhpcyBCaWcgaGFzIGEgcG9zaXRpdmUgZXhwb25lbnQgZXF1YWwgdG9cclxuICAgICAqIG9yIGdyZWF0ZXIgdGhhbiBCaWcuRV9QT1MsIG9yIGEgbmVnYXRpdmUgZXhwb25lbnQgZXF1YWwgdG8gb3IgbGVzcyB0aGFuXHJcbiAgICAgKiBCaWcuRV9ORUcuXHJcbiAgICAgKi9cclxuICAgIFAudG9TdHJpbmcgPSBQLnZhbHVlT2YgPSBQLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHN0ciA9IHguYy5qb2luKCcnKSxcclxuICAgICAgICAgICAgc3RyTCA9IHN0ci5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uP1xyXG4gICAgICAgIGlmIChlIDw9IEJpZy5FX05FRyB8fCBlID49IEJpZy5FX1BPUykge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgKHN0ckwgPiAxID8gJy4nICsgc3RyLnNsaWNlKDEpIDogJycpICtcclxuICAgICAgICAgICAgICAoZSA8IDAgPyAnZScgOiAnZSsnKSArIGU7XHJcblxyXG4gICAgICAgIC8vIE5lZ2F0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBlbmQgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoOyArK2U7IHN0ciA9ICcwJyArIHN0cikge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0ciA9ICcwLicgKyBzdHI7XHJcblxyXG4gICAgICAgIC8vIFBvc2l0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGlmICgrK2UgPiBzdHJMKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQXBwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgZm9yIChlIC09IHN0ckw7IGUtLSA7IHN0ciArPSAnMCcpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlIDwgc3RyTCkge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnNsaWNlKDAsIGUpICsgJy4nICsgc3RyLnNsaWNlKGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50IHplcm8uXHJcbiAgICAgICAgfSBlbHNlIGlmIChzdHJMID4gMSkge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgJy4nICsgc3RyLnNsaWNlKDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXZvaWQgJy0wJ1xyXG4gICAgICAgIHJldHVybiB4LnMgPCAwICYmIHguY1swXSA/ICctJyArIHN0ciA6IHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKiBJZiB0b0V4cG9uZW50aWFsLCB0b0ZpeGVkLCB0b1ByZWNpc2lvbiBhbmQgZm9ybWF0IGFyZSBub3QgcmVxdWlyZWQgdGhleVxyXG4gICAgICogY2FuIHNhZmVseSBiZSBjb21tZW50ZWQtb3V0IG9yIGRlbGV0ZWQuIE5vIHJlZHVuZGFudCBjb2RlIHdpbGwgYmUgbGVmdC5cclxuICAgICAqIGZvcm1hdCBpcyB1c2VkIG9ubHkgYnkgdG9FeHBvbmVudGlhbCwgdG9GaXhlZCBhbmQgdG9QcmVjaXNpb24uXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGluIGV4cG9uZW50aWFsXHJcbiAgICAgKiBub3RhdGlvbiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB1c2luZ1xyXG4gICAgICogQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvRXhwb25lbnRpYWwgPSBmdW5jdGlvbiAoZHApIHtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgZHAgPSB0aGlzLmMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvRXhwIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBkcCwgMSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaW4gbm9ybWFsIG5vdGF0aW9uXHJcbiAgICAgKiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB1c2luZyBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9GaXhlZCA9IGZ1bmN0aW9uIChkcCkge1xyXG4gICAgICAgIHZhciBzdHIsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBuZWcgPSBCaWcuRV9ORUcsXHJcbiAgICAgICAgICAgIHBvcyA9IEJpZy5FX1BPUztcclxuXHJcbiAgICAgICAgLy8gUHJldmVudCB0aGUgcG9zc2liaWxpdHkgb2YgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgQmlnLkVfTkVHID0gLShCaWcuRV9QT1MgPSAxIC8gMCk7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHgudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwID09PSB+fmRwICYmIGRwID49IDAgJiYgZHAgPD0gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IGZvcm1hdCh4LCB4LmUgKyBkcCk7XHJcblxyXG4gICAgICAgICAgICAvLyAoLTApLnRvRml4ZWQoKSBpcyAnMCcsIGJ1dCAoLTAuMSkudG9GaXhlZCgpIGlzICctMCcuXHJcbiAgICAgICAgICAgIC8vICgtMCkudG9GaXhlZCgxKSBpcyAnMC4wJywgYnV0ICgtMC4wMSkudG9GaXhlZCgxKSBpcyAnLTAuMCcuXHJcbiAgICAgICAgICAgIGlmICh4LnMgPCAwICYmIHguY1swXSAmJiBzdHIuaW5kZXhPZignLScpIDwgMCkge1xyXG4gICAgICAgIC8vRS5nLiAtMC41IGlmIHJvdW5kZWQgdG8gLTAgd2lsbCBjYXVzZSB0b1N0cmluZyB0byBvbWl0IHRoZSBtaW51cyBzaWduLlxyXG4gICAgICAgICAgICAgICAgc3RyID0gJy0nICsgc3RyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEJpZy5FX05FRyA9IG5lZztcclxuICAgICAgICBCaWcuRV9QT1MgPSBwb3M7XHJcblxyXG4gICAgICAgIGlmICghc3RyKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9GaXghJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJvdW5kZWQgdG8gc2RcclxuICAgICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyBCaWcuUk0uIFVzZSBleHBvbmVudGlhbCBub3RhdGlvbiBpZiBzZCBpcyBsZXNzXHJcbiAgICAgKiB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGVcclxuICAgICAqIHZhbHVlIGluIG5vcm1hbCBub3RhdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBzZCB7bnVtYmVyfSBJbnRlZ2VyLCAxIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9QcmVjaXNpb24gPSBmdW5jdGlvbiAoc2QpIHtcclxuXHJcbiAgICAgICAgaWYgKHNkID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNkICE9PSB+fnNkIHx8IHNkIDwgMSB8fCBzZCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvUHJlIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBzZCAtIDEsIDIpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLy8gRXhwb3J0XHJcblxyXG5cclxuICAgIEJpZyA9IGJpZ0ZhY3RvcnkoKTtcclxuXHJcbiAgICAvL0FNRC5cclxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQmlnO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIC8vIE5vZGUgYW5kIG90aGVyIENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cy5cclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IEJpZztcclxuXHJcbiAgICAvL0Jyb3dzZXIuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGdsb2JhbC5CaWcgPSBCaWc7XHJcbiAgICB9XHJcbn0pKHRoaXMpO1xyXG4iXX0=

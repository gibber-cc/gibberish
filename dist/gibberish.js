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

    out += '  var ' + this.name + '_value = ' + valueRef + ';\n';

    if (this.shouldWrap === false && this.shouldClamp === true) {
      out += '  if( ' + valueRef + ' < ' + this.max + ' ) ' + valueRef + ' += ' + _incr + '\n';
    } else {
      out += '  ' + valueRef + ' += ' + _incr + '\n'; // store output value before accumulating
    }

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
      defaults = { min: 0, max: 1, shouldWrap: true, shouldClamp: false };

  if (properties !== undefined) Object.assign(defaults, properties);

  if (defaults.initialValue === undefined) defaults.initialValue = defaults.min;

  Object.assign(ugen, {
    min: defaults.min,
    max: defaults.max,
    initial: defaults.initialValue,
    uid: _gen.getUID(),
    inputs: [incr, reset],
    memory: {
      value: { length: 1, idx: null }
    }
  }, defaults);

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      return _gen.memory.heap[this.memory.value.idx];
    },
    set: function set(v) {
      _gen.memory.heap[this.memory.value.idx] = v;
    }
  });

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
    neq = require('./neq.js'),
    and = require('./and.js'),
    gte = require('./gte.js'),
    memo = require('./memo.js');

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
},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":29,"./gte.js":31,"./ifelseif.js":34,"./lt.js":37,"./memo.js":41,"./mul.js":47,"./neq.js":48,"./peek.js":53,"./poke.js":55,"./sub.js":64}],5:[function(require,module,exports){
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
    param = require('./param.js'),
    add = require('./add.js'),
    gtp = require('./gtp.js'),
    not = require('./not.js');

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

  sustainCondition = props.triggerRelease ? shouldSustain : lt(phase, add(attackTime, decayTime, sustainTime));

  releaseAccum = props.triggerRelease ? gtp(sub(sustainLevel, accum(div(sustainLevel, releaseTime), 0, { shouldWrap: false })), 0) : sub(sustainLevel, mul(div(sub(phase, add(attackTime, decayTime, sustainTime)), releaseTime), sustainLevel)), releaseCondition = props.triggerRelease ? not(shouldSustain) : lt(phase, add(attackTime, decayTime, sustainTime, releaseTime));

  out = ifelse(
  // attack
  lt(phase, attackTime), peek(bufferData, div(phase, attackTime), { boundmode: 'clamp' }),

  // decay
  lt(phase, add(attackTime, decayTime)), peek(bufferData, sub(1, mul(div(sub(phase, attackTime), decayTime), sub(1, sustainLevel))), { boundmode: 'clamp' }),

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
},{"./accum.js":2,"./add.js":5,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":29,"./gtp.js":32,"./ifelseif.js":34,"./lt.js":37,"./mul.js":47,"./not.js":50,"./param.js":52,"./peek.js":53,"./sub.js":64}],7:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'and',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = '  var ' + this.name + ' = (' + inputs[0] + ' !== 0 && ' + inputs[1] + ' !== 0) | 0\n\n';

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
    functionBody = this.callback(genName, inputs[0], inputs[1], inputs[2], inputs[3], inputs[4], 'memory[' + this.memory.value.idx + ']', 'memory[' + this.memory.wrap.idx + ']');

    _gen.closures.add(_defineProperty({}, this.name, this));

    _gen.memo[this.name] = this.name + '_value';

    if (_gen.memo[this.wrap.name] === undefined) this.wrap.gen();

    return [this.name + '_value', functionBody];
  },
  callback: function callback(_name, _incr, _min, _max, _reset, loops, valueRef, wrapRef) {
    var diff = this.max - this.min,
        out = '',
        wrap = '';

    // must check for reset before storing value for output
    if (!(typeof this.inputs[3] === 'number' && this.inputs[3] < 1)) {
      out += '  if( ' + _reset + ' >= 1 ) ' + valueRef + ' = ' + _min + '\n';
    }

    out += '  var ' + this.name + '_value = ' + valueRef + ';\n  ' + valueRef + ' += ' + _incr + '\n'; // store output value before accumulating 

    if (typeof this.max === 'number' && this.max !== Infinity && typeof this.min !== 'number') {
      wrap = '  if( ' + valueRef + ' >= ' + this.max + ' && ' + loops + ' ) {\n    ' + valueRef + ' -= ' + diff + '\n    ' + wrapRef + ' = 1\n  }else{\n    ' + wrapRef + ' = 0\n  }\n';
    } else if (this.max !== Infinity && this.min !== Infinity) {
      wrap = '  if( ' + valueRef + ' >= ' + _max + ' && ' + loops + ' ) {\n    ' + valueRef + ' -= ' + _max + ' - ' + _min + '\n    ' + wrapRef + ' = 1\n  }else if( ' + valueRef + ' < ' + _min + ' && ' + loops + ' ) {\n    ' + valueRef + ' += ' + _max + ' - ' + _min + '\n    ' + wrapRef + ' = 1\n  }else{\n    ' + wrapRef + ' = 0\n  }\n';
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
  var loops = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];
  var properties = arguments[5];

  var ugen = Object.create(proto),
      defaults = { initialValue: 0, shouldWrap: true };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    min: min,
    max: max,
    value: defaults.initialValue,
    uid: _gen.getUID(),
    inputs: [incr, min, max, reset, loops],
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
    buffer = { length: y > 1 ? y : _gen.samplerate * 60 }; // XXX what???
    shouldLoad = true;
  } else if (x instanceof Float32Array) {
    buffer = x;
  }

  ugen = {
    buffer: buffer,
    name: proto.basename + _gen.getUID(),
    dim: buffer.length, // XXX how do we dynamically allocate this?
    channels: 1,
    gen: proto.gen,
    onload: null,
    then: function then(fnc) {
      ugen.onload = fnc;
      return ugen;
    },

    immutable: properties !== undefined && properties.immutable === true ? true : false,
    load: function load(filename) {
      var promise = utilities.loadSample(filename, ugen);
      promise.then(function (_buffer) {
        ugen.memory.values.length = ugen.dim = _buffer.length;
        ugen.onload();
      });
    }
  };

  ugen.memory = {
    values: { length: ugen.dim, idx: null }
  };

  _gen.name = 'data' + _gen.getUID();

  if (shouldLoad) ugen.load(x);

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
},{"./gen.js":29,"./peek.js":53,"./poke.js":55,"./utilities.js":70}],19:[function(require,module,exports){
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
    var props = arguments[1];

    var properties = Object.assign({}, { initValue: 1 }, props),
        ssd = history(properties.initValue);

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
    peek = require('./peek.js'),
    sub = require('./sub.js'),
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
},{"./accum.js":2,"./data.js":18,"./gen.js":29,"./peek.js":53,"./poke.js":55,"./sub.js":64,"./wrap.js":72}],22:[function(require,module,exports){
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
},{"./data":18,"./gen":29,"./peek":53,"./phasor":54,"./windows":71}],25:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'eq',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = this.inputs[0] === this.inputs[1] ? 1 : '  var ' + this.name + ' = (' + inputs[0] + ' === ' + inputs[1] + ') | 0\n\n';

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
    var shouldInlineMemory = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

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

    this.functionBody = "  'use strict'\n";
    if (shouldInlineMemory === false) this.functionBody += "  var memory = gen.memory\n\n";

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
    //
    if (shouldInlineMemory === true) {
      this.parameters.push('memory');
    }
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
        gen.getInput(input[1]);
      } else {
        // if not memoized generate code 
        if (typeof input.gen !== 'function') {
          console.log('no gen found:', input, input.gen);
        }
        var code = input.gen();
        //if( code.indexOf( 'Object' ) > -1 ) console.log( 'bad input:', input, code )

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
},{"memory-helper":73}],30:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gt',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '(( ' + inputs[0] + ' > ' + inputs[1] + ') | 0 )';
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
        defaultValue = _gen.getInput(conditionals[conditionals.length - 1]),
        out = '  var ' + this.name + '_out = ' + defaultValue + '\n';

    //console.log( 'defaultValue:', defaultValue )

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
  tanh: require('./tanh.js'),
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
},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./ad.js":4,"./add.js":5,"./adsr.js":6,"./and.js":7,"./asin.js":8,"./atan.js":9,"./attack.js":10,"./bang.js":11,"./bool.js":12,"./ceil.js":13,"./clamp.js":14,"./cos.js":15,"./counter.js":16,"./cycle.js":17,"./data.js":18,"./dcblock.js":19,"./decay.js":20,"./delay.js":21,"./delta.js":22,"./div.js":23,"./env.js":24,"./eq.js":25,"./floor.js":26,"./fold.js":27,"./gate.js":28,"./gen.js":29,"./gt.js":30,"./gte.js":31,"./gtp.js":32,"./history.js":33,"./ifelseif.js":34,"./in.js":35,"./lt.js":37,"./lte.js":38,"./ltp.js":39,"./max.js":40,"./memo.js":41,"./min.js":42,"./mix.js":43,"./mod.js":44,"./mstosamps.js":45,"./mtof.js":46,"./mul.js":47,"./neq.js":48,"./noise.js":49,"./not.js":50,"./pan.js":51,"./param.js":52,"./peek.js":53,"./phasor.js":54,"./poke.js":55,"./pow.js":56,"./rate.js":57,"./round.js":58,"./sah.js":59,"./selector.js":60,"./sign.js":61,"./sin.js":62,"./slide.js":63,"./sub.js":64,"./switch.js":65,"./t60.js":66,"./tan.js":67,"./tanh.js":68,"./train.js":69,"./utilities.js":70,"./windows.js":71,"./wrap.js":72}],37:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'lt',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '(( ' + inputs[0] + ' < ' + inputs[1] + ') | 0  )';
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

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var mul = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          sum = 1,
          numCount = 0,
          mulAtEnd = false,
          alreadyFullSummed = true;

      inputs.forEach(function (v, i) {
        if (isNaN(v)) {
          out += v;
          if (i < inputs.length - 1) {
            mulAtEnd = true;
            out += ' * ';
          }
          alreadyFullSummed = false;
        } else {
          if (i === 0) {
            sum = v;
          } else {
            sum *= parseFloat(v);
          }
          numCount++;
        }
      });

      if (alreadyFullSummed) out = '';

      if (numCount > 0) {
        out += mulAtEnd || alreadyFullSummed ? sum : ' * ' + sum;
      }

      if (!alreadyFullSummed) out += ')';

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

    out = /*this.inputs[0] !== this.inputs[1] ? 1 :*/'  var ' + this.name + ' = (' + inputs[0] + ' !== ' + inputs[1] + ') | 0\n\n';

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

    idx = inputs[1];
    lengthIsLog2 = (Math.log2(this.data.buffer.length) | 0) === Math.log2(this.data.buffer.length);

    if (this.mode !== 'simple') {

      functionBody = '  var ' + this.name + '_dataIdx  = ' + idx + ', \n      ' + this.name + '_phase = ' + (this.mode === 'samples' ? inputs[0] : inputs[0] + ' * ' + (this.data.buffer.length - 1)) + ', \n      ' + this.name + '_index = ' + this.name + '_phase | 0,\n';

      if (this.boundmode === 'wrap') {
        next = lengthIsLog2 ? '( ' + this.name + '_index + 1 ) & (' + this.data.buffer.length + ' - 1)' : this.name + '_index + 1 >= ' + this.data.buffer.length + ' ? ' + this.name + '_index + 1 - ' + this.data.buffer.length + ' : ' + this.name + '_index + 1';
      } else if (this.boundmode === 'clamp') {
        next = this.name + '_index + 1 >= ' + (this.data.buffer.length - 1) + ' ? ' + (this.data.buffer.length - 1) + ' : ' + this.name + '_index + 1';
      } else {
        next = this.name + '_index + 1';
      }

      if (this.interp === 'linear') {
        functionBody += '      ' + this.name + '_frac  = ' + this.name + '_phase - ' + this.name + '_index,\n      ' + this.name + '_base  = memory[ ' + this.name + '_dataIdx +  ' + this.name + '_index ],\n      ' + this.name + '_next  = ' + next + ',';

        if (this.boundmode === 'ignore') {
          functionBody += '\n      ' + this.name + '_out   = ' + this.name + '_index >= ' + (this.data.buffer.length - 1) + ' || ' + this.name + '_index < 0 ? 0 : ' + this.name + '_base + ' + this.name + '_frac * ( memory[ ' + this.name + '_dataIdx + ' + this.name + '_next ] - ' + this.name + '_base )\n\n';
        } else {
          functionBody += '\n      ' + this.name + '_out   = ' + this.name + '_base + ' + this.name + '_frac * ( memory[ ' + this.name + '_dataIdx + ' + this.name + '_next ] - ' + this.name + '_base )\n\n';
        }
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
},{"./gen.js":29,"./mul.js":47,"./wrap.js":72}],56:[function(require,module,exports){
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
},{"./add.js":5,"./delta.js":22,"./gen.js":29,"./history.js":33,"./memo.js":41,"./mul.js":47,"./sub.js":64,"./wrap.js":72}],58:[function(require,module,exports){
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
    gt = require('./gt.js'),
    div = require('./div.js'),
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
},{"./add.js":5,"./div.js":23,"./gen.js":29,"./gt.js":30,"./history.js":33,"./memo.js":41,"./mul.js":47,"./sub.js":64,"./switch.js":65}],64:[function(require,module,exports){
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

var _gen = require('./gen.js');

var proto = {
  basename: 'tanh',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'tanh': Math.tanh });

      out = 'gen.tanh( ' + inputs[0] + ' )';
    } else {
      out = Math.tanh(parseFloat(inputs[0]));
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
},{"./gen.js":29}],69:[function(require,module,exports){
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
},{"./gen.js":29,"./lt.js":37,"./phasor.js":54}],70:[function(require,module,exports){
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
},{"./data.js":18,"./gen.js":29}],71:[function(require,module,exports){
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
},{}],72:[function(require,module,exports){
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
},{"./floor.js":26,"./gen.js":29,"./memo.js":41,"./sub.js":64}],73:[function(require,module,exports){
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

},{}],74:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let analyzer = Object.create( ugen )

Object.assign( analyzer, {
  __type__: 'analyzer',
})

module.exports = analyzer

},{"../ugen.js":125}],75:[function(require,module,exports){
let g = require( 'genish.js' ),
    analyzer = require( './analyzer.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {
 
let Delay = inputProps => {
  let ssd = Object.create( analyzer )
  ssd.in  = Object.create( ugen )
  ssd.out = Object.create( ugen )

  ssd.id = Gibberish.factory.getUID()

  let props = Object.assign({}, inputProps )
  let isStereo = false//props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' )
    
  let historyL = g.history()

  if( isStereo ) {
    // right channel
    let historyR = g.history()

    Gibberish.factory( 
      ssd.out,
      [ historyL.out, historyR.out ], 
      'ssd_out', 
      props 
    )

    ssd.out.callback.ugenName = ssd.out.ugenName = 'ssd_out_' + ssd.id

    const idxL = ssd.out.graph.memory.value.idx, 
          idxR = idxL + 1,
          memory = Gibberish.genish.gen.memory.heap

    const callback = function( input ) {
      'use strict'
      memory[ idxL ] = input[0]
      memory[ idxR ] = input[1]
      return 0     
    }
    
    Gibberish.factory( ssd.in, [ input[0],input[1] ], 'ssd_in', props, callback )

    callback.ugenName = ssd.in.ugenName = 'ssd_in_' + ssd.id
    ssd.in.inputNames = [ 'input' ]
    ssd.in.inputs = [ props.input ]
    ssd.in.input = props.input
    ssd.type = 'analysis'

    ssd.in.listen = function( ugen ) {
      if( ugen !== undefined ) {
        ssd.in.input = ugen
        ssd.in.inputs = [ ugen ]
      }

      if( Gibberish.analyzers.indexOf( ssd.in ) === -1 ) {
        Gibberish.analyzers.push( ssd.in )
      }

      Gibberish.dirty( Gibberish.analyzers )
    }
  }else{
    Gibberish.factory( ssd.out, historyL.out, 'ssd_out', props )

    ssd.out.callback.ugenName = ssd.out.ugenName = 'ssd_out_' + ssd.id

    let idx = ssd.out.graph.memory.value.idx 
    let memory = Gibberish.genish.gen.memory.heap
    let phase = 0
    let callback = function( input ) {
      'use strict'
      memory[ idx ] = input
      return 0     
    }
    
    Gibberish.factory( ssd.in, input, 'ssd_in', props, callback )

    callback.ugenName = ssd.in.ugenName = 'ssd_in_' + ssd.id
    ssd.in.inputNames = [ 'input' ]
    ssd.in.inputs = [ props.input ]
    ssd.in.input = props.input
    ssd.type = 'analysis'

    ssd.in.listen = function( ugen ) {
      if( ugen !== undefined ) {
        ssd.in.input = ugen
        ssd.in.inputs = [ ugen ]
      }

      if( Gibberish.analyzers.indexOf( ssd.in ) === -1 ) {
        Gibberish.analyzers.push( ssd.in )
      }

      Gibberish.dirty( Gibberish.analyzers )
    }

  }
  
  return ssd
}

Delay.defaults = {
  input:0,
}

return Delay

}

},{"../ugen.js":125,"./analyzer.js":74,"genish.js":36}],76:[function(require,module,exports){
let ugen = require( '../ugen.js' ),
    g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let AD = function( argumentProps ) {
    let ad = Object.create( ugen ),
        attack  = g.in( 'attack' ),
        decay   = g.in( 'decay' )

    let props = Object.assign( {}, AD.defaults, argumentProps )

    let graph = g.ad( attack, decay )

    Gibberish.factory( ad, graph, 'ad', props )

    ad.trigger = graph.trigger

    return ad
  }

  AD.defaults = { attack:44100, decay:44100 } 

  return AD

}

},{"../ugen.js":125,"genish.js":36}],77:[function(require,module,exports){
let ugen = require( '../ugen.js' ),
    g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let ADSR = function( argumentProps ) {
    let adsr  = Object.create( ugen ),
        attack  = g.in( 'attack' ),
        decay   = g.in( 'decay' ),
        sustain = g.in( 'sustain' ),
        release = g.in( 'release' ),
        sustainLevel = g.in( 'sustainLevel' )

    let props = Object.assign( {}, ADSR.defaults, argumentProps )

    let graph = g.adsr( attack, decay, sustain, sustainLevel, release, { triggerRelease: props.triggerRelease } )

    Gibberish.factory( adsr, graph, 'adsr', props )

    adsr.trigger = graph.trigger
    adsr.advance = graph.release

    return adsr
  }

  ADSR.defaults = { attack:22050, decay:22050, sustain:44100, sustainLevel:.6, release: 44100, triggerRelease:false } 

  return ADSR
}

},{"../ugen.js":125,"genish.js":36}],78:[function(require,module,exports){
module.exports = function( Gibberish ) {

  const Envelopes = {
    AD     : require( './ad.js' )( Gibberish ),
    ADSR   : require( './adsr.js' )( Gibberish ),
    Ramp   : require( './ramp.js' )( Gibberish ),

    export : target => {
      for( let key in Envelopes ) {
        if( key !== 'export' ) {
          target[ key ] = Envelopes[ key ]
        }
      }
    }
  } 

  return Envelopes
}

},{"./ad.js":76,"./adsr.js":77,"./ramp.js":79}],79:[function(require,module,exports){
const ugen = require( '../ugen.js' ),
      g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  const Ramp = function( argumentProps ) {
    const ramp   = Object.create( ugen ),
          length = g.in( 'length' ),
          from   = g.in( 'from' ),
          to     = g.in( 'to' )

    const props = Object.assign({}, Ramp.defaults, argumentProps )

    const reset = g.bang()

    const phase = g.accum( g.div( 1, length ), reset, { shouldWrap:props.shouldLoop, shouldClamp:true }),
          diff = g.sub( to, from ),
          graph = g.add( from, g.mul( phase, diff ) )

    Gibberish.factory( ramp, graph, 'ramp', props )

    ramp.trigger = reset.trigger

    return ramp
  }

  Ramp.defaults = { from:0, to:1, length:g.gen.samplerate, shouldLoop:false }

  return Ramp

}

},{"../ugen.js":125,"genish.js":36}],80:[function(require,module,exports){
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

},{}],81:[function(require,module,exports){
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

},{"genish.js":36}],82:[function(require,module,exports){
let g = require( 'genish.js' ),
    filter = require( './filter.js' )

module.exports = function( Gibberish ) {

  Gibberish.genish.biquad = ( input, cutoff, Q, mode, isStereo ) => {
    let a0,a1,a2,c,b1,b2,
        in1a0,x1a1,x2a2,y1b1,y2b2,
        in1a0_1,x1a1_1,x2a2_1,y1b1_1,y2b2_1

    let returnValue

    let x1 = g.history(), x2 = g.history(), y1 = g.history(), y2 = g.history()
    
    let w0 = g.memo( g.mul( 2 * Math.PI, g.div( cutoff,  g.gen.samplerate ) ) ),
        sinw0 = g.sin( w0 ),
        cosw0 = g.cos( w0 ),
        alpha = g.memo( g.div( sinw0, g.mul( 2, Q ) ) )

    let oneMinusCosW = g.sub( 1, cosw0 )

    switch( mode ) {
      case 'HP':
        a0 = g.memo( g.div( g.add( 1, cosw0) , 2) )
        a1 = g.mul( g.add( 1, cosw0 ), -1 )
        a2 = a0
        c  = g.add( 1, alpha )
        b1 = g.mul( -2 , cosw0 )
        b2 = g.sub( 1, alpha )
        break;
      case 'BP':
        a0 = g.mul( Q, alpha )
        a1 = 0
        a2 = g.mul( a0, -1 )
        c  = g.add( 1, alpha )
        b1 = g.mul( -2 , cosw0 )
        b2 = g.sub( 1, alpha )
        break;
      default: // LP
        a0 = g.memo( g.div( oneMinusCosW, 2) )
        a1 = oneMinusCosW
        a2 = a0
        c  = g.add( 1, alpha )
        b1 = g.mul( -2 , cosw0 )
        b2 = g.sub( 1, alpha )
    }

    a0 = g.div( a0, c ); a1 = g.div( a1, c ); a2 = g.div( a2, c )
    b1 = g.div( b1, c ); b2 = g.div( b2, c )

    in1a0 = g.mul( x1.in( isStereo ? input[0] : input ), a0 )
    x1a1  = g.mul( x2.in( x1.out ), a1 )
    x2a2  = g.mul( x2.out,          a2 )

    let sumLeft = g.add( in1a0, x1a1, x2a2 )

    y1b1 = g.mul( y2.in( y1.out ), b1 )
    y2b2 = g.mul( y2.out, b2 )

    let sumRight = g.add( y1b1, y2b2 )

    let diff = g.sub( sumLeft, sumRight )

    y1.in( diff )

    if( isStereo ) {
      let x1_1 = g.history(), x2_1 = g.history(), y1_1 = g.history(), y2_1 = g.history()

      in1a0_1 = g.mul( x1_1.in( input[1] ), a0 )
      x1a1_1  = g.mul( x2_1.in( x1_1.out ), a1 )
      x2a2_1  = g.mul( x2_1.out,            a2 )

      let sumLeft_1 = g.add( in1a0_1, x1a1_1, x2a2_1 )

      y1b1_1 = g.mul( y2_1.in( y1_1.out ), b1 )
      y2b2_1 = g.mul( y2_1.out, b2 )

      let sumRight_1 = g.add( y1b1_1, y2b2_1 )

      let diff_1 = g.sub( sumLeft_1, sumRight_1 )

      y1_1.in( diff_1 )
      
      returnValue = [ diff, diff_1 ]
    }else{
      returnValue = diff
    }

    return returnValue
  }

  let Biquad = inputProps => {
    let biquad = Object.create( filter )
    let props = Object.assign( {}, Biquad.defaults, inputProps ) 

    let isStereo = props.input.isStereo

    Gibberish.factory(
      biquad,
      Gibberish.genish.biquad( g.in('input'), g.in('cutoff'), g.in('Q'), props.mode || 'LP', isStereo ), 
      'biquad', 
      props
    )

    return biquad
  }

  Biquad.defaults = {
    input:0,
    Q: .75,
    cutoff:550,
    mode:'LP'
  }

  return Biquad

}


},{"./filter.js":85,"genish.js":36}],83:[function(require,module,exports){
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

},{"genish.js":36}],84:[function(require,module,exports){
const g = require( 'genish.js' ),
      filter = require( './filter.js' )

module.exports = function( Gibberish ) {
  Gibberish.genish.diodeZDF = ( input, Q, freq, saturation, isStereo=false ) => {
    const iT = 1 / g.gen.samplerate,
          kz1 = g.history(0),
          kz2 = g.history(0),
          kz3 = g.history(0),
          kz4 = g.history(0)

    let   ka1 = 1.0,
          ka2 = 0.5,
          ka3 = 0.5,
          ka4 = 0.5,
          kindx = 0   

    // kwd = 2 * $M_PI * acf[kindx]
    const kwd = g.memo( g.mul( Math.PI * 2, freq ) )

    // kwa = (2/iT) * tan(kwd * iT/2) 
    const kwa =g.memo( g.mul( 2/iT, g.tan( g.mul( kwd, iT/2 ) ) ) )

    // kG  = kwa * iT/2 
    const kg = g.memo( g.mul( kwa, iT/2 ) )
    
    const kG4 = g.memo( g.mul( .5, g.div( kg, g.add( 1, kg ) ) ) )
    const kG3 = g.memo( g.mul( .5, g.div( kg, g.sub( g.add( 1, kg ), g.mul( g.mul( .5, kg ), kG4 ) ) ) ) )
    const kG2 = g.memo( g.mul( .5, g.div( kg, g.sub( g.add( 1, kg ), g.mul( g.mul( .5, kg ), kG3 ) ) ) ) )
    const kG1 = g.memo( g.div( kg, g.sub( g.add( 1, kg ), g.mul( kg, kG2 ) ) ) )

    const kGAMMA = g.memo( g.mul( g.mul( kG4, kG3 ) , g.mul( kG2, kG1 ) ) )

    const kSG1 = g.memo( g.mul( g.mul( kG4, kG3 ), kG2 ) ) 

    const kSG2 = g.memo( g.mul( kG4, kG3) )  
    const kSG3 = kG4 
    let kSG4 = 1.0 
    // kk = 4.0*(kQ - 0.5)/(25.0 - 0.5)
    const kalpha = g.memo( g.div( kg, g.add(1.0, kg) ) )

    const kbeta1 = g.memo( g.div( 1.0, g.sub( g.add( 1, kg ), g.mul( kg, kG2 ) ) ) )
    const kbeta2 = g.memo( g.div( 1.0, g.sub( g.add( 1, kg ), g.mul( g.mul( .5, kg ), kG3 ) ) ) )
    const kbeta3 = g.memo( g.div( 1.0, g.sub( g.add( 1, kg ), g.mul( g.mul( .5, kg ), kG4 ) ) ) )
    const kbeta4 = g.memo( g.div( 1.0, g.add( 1, kg ) ) ) 

    const kgamma1 = g.memo( g.add( 1, g.mul( kG1, kG2 ) ) )
    const kgamma2 = g.memo( g.add( 1, g.mul( kG2, kG3 ) ) )
    const kgamma3 = g.memo( g.add( 1, g.mul( kG3, kG4 ) ) )

    const kdelta1 = kg
    const kdelta2 = g.memo( g.mul( 0.5, kg ) )
    const kdelta3 = g.memo( g.mul( 0.5, kg ) )

    const kepsilon1 = kG2
    const kepsilon2 = kG3
    const kepsilon3 = kG4

    const klastcut = freq

    //;; feedback inputs 
    const kfb4 = g.memo( g.mul( kbeta4 , kz4.out ) ) 
    const kfb3 = g.memo( g.mul( kbeta3, g.add( kz3.out, g.mul( kfb4, kdelta3 ) ) ) )
    const kfb2 = g.memo( g.mul( kbeta2, g.add( kz2.out, g.mul( kfb3, kdelta2 ) ) ) )

    //;; feedback process

    const kfbo1 = g.memo( g.mul( kbeta1, g.add( kz1.out, g.mul( kfb2, kdelta1 ) ) ) ) 
    const kfbo2 = g.memo( g.mul( kbeta2, g.add( kz2.out, g.mul( kfb3, kdelta2 ) ) ) ) 
    const kfbo3 = g.memo( g.mul( kbeta3, g.add( kz3.out, g.mul( kfb4, kdelta3 ) ) ) ) 
    const kfbo4 = kfb4

    const kSIGMA = g.memo( 
      g.add( 
        g.add( 
          g.mul( kSG1, kfbo1 ), 
          g.mul( kSG2, kfbo2 )
        ), 
        g.add(
          g.mul( kSG3, kfbo3 ), 
          g.mul( kSG4, kfbo4 )
        ) 
      ) 
    )

    //const kSIGMA = 1
    //;; non-linear processing
    //if (knlp == 1) then
    //  kin = (1.0 / tanh(ksaturation)) * tanh(ksaturation * kin)
    //elseif (knlp == 2) then
    //  kin = tanh(ksaturation * kin) 
    //endif
    //
    //const kin = input 
    let kin = input//g.memo( g.mul( g.div( 1, g.tanh( saturation ) ), g.tanh( g.mul( saturation, input ) ) ) )
    kin = g.tanh( g.mul( saturation, kin ) )

    const kun = g.div( g.sub( kin, g.mul( Q, kSIGMA ) ), g.add( 1, g.mul( Q, kGAMMA ) ) )
    //const kun = g.div( 1, g.add( 1, g.mul( Q, kGAMMA ) ) )
        //(kin - kk * kSIGMA) / (1.0 + kk * kGAMMA)

    //;; 1st stage
    let kxin = g.memo( g.add( g.add( g.mul( kun, kgamma1 ), kfb2), g.mul( kepsilon1, kfbo1 ) ) )
    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    let kv = g.memo( g.mul( g.sub( g.mul( ka1, kxin ), kz1.out ), kalpha ) )
    //kv = (ka1 * kxin - kz1) * kalpha 
    let klp = g.add( kv, kz1.out )
    //klp = kv + kz1
    kz1.in( g.add( klp, kv ) ) 
    //kz1 = klp + kv

        //;; 2nd stage
    //kxin = (klp * kgamma2 + kfb3 + kepsilon2 * kfbo2)
    //kv = (ka2 * kxin - kz2) * kalpha 
    //klp = kv + kz2
    //kz2 = klp + kv

    kxin = g.memo( g.add( g.add( g.mul( klp, kgamma2 ), kfb3), g.mul( kepsilon2, kfbo2 ) ) )
    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    kv = g.memo( g.mul( g.sub( g.mul( ka2, kxin ), kz2.out ), kalpha ) )
    //kv = (ka1 * kxin - kz1) * kalpha 
    klp = g.add( kv, kz2.out ) 
    //klp = kv + kz1
    kz2.in( g.add( klp, kv ) ) 
    //kz1 = klp + kv

    //;; 3rd stage
    //kxin = (klp * kgamma3 + kfb4 + kepsilon3 * kfbo3)
    //kv = (ka3 * kxin - kz3) * kalpha 
    //klp = kv + kz3
    //kz3 = klp + kv

    kxin = g.memo( g.add( g.add( g.mul( klp, kgamma3 ), kfb4), g.mul( kepsilon3, kfbo3 ) ) )
    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    kv = g.memo( g.mul( g.sub( g.mul( ka3, kxin ), kz3.out ), kalpha ) )
    //kv = (ka1 * kxin - kz1) * kalpha 
    klp = g.add( kv, kz3.out )
    //klp = kv + kz1
    kz3.in( g.add( klp, kv ) )
    //kz1 = klp + kv

    //;; 4th stage
    //kv = (ka4 * klp - kz4) * kalpha 
    //klp = kv + kz4
    //kz4 = klp + kv

    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    kv = g.memo( g.mul( g.sub( g.mul( ka4, kxin ), kz4.out ), kalpha ) )
    //kv = (ka1 * kxin - kz1) * kalpha 
    klp = g.add( kv, kz4.out )
    //klp = kv + kz1
    kz4.in( g.add( klp, kv ) )

    //kz1 = klp + kv
    if( isStereo ) {
      //let polesR = g.data([ 0,0,0,0 ], 1, { meta:true }),
      //    rezzR = g.clamp( g.mul( polesR[3], rez ) ),
      //    outputR = g.sub( input[1], rezzR )         

      //polesR[0] = g.add( polesR[0], g.mul( g.add( g.mul(-1, polesR[0] ), outputR   ), cutoff ))
      //polesR[1] = g.add( polesR[1], g.mul( g.add( g.mul(-1, polesR[1] ), polesR[0] ), cutoff ))
      //polesR[2] = g.add( polesR[2], g.mul( g.add( g.mul(-1, polesR[2] ), polesR[1] ), cutoff ))
      //polesR[3] = g.add( polesR[3], g.mul( g.add( g.mul(-1, polesR[3] ), polesR[2] ), cutoff ))

      //let right = g.switch( isLowPass, polesR[3], g.sub( outputR, polesR[3] ) )

      //returnValue = [left, right]
    }else{
     // returnValue = klp
    }
    returnValue = klp
    
    return returnValue// klp//returnValue
 }

  const DiodeZDF = inputProps => {
    const zdf      = Object.create( filter )
    const props    = Object.assign( {}, DiodeZDF.defaults, inputProps )
    const isStereo = props.input.isStereo 

    Gibberish.factory(
      zdf, 
      Gibberish.genish.diodeZDF( g.in('input'), g.in('Q'), g.in('cutoff'), g.in('saturation'), isStereo ), 
      'diodeZDF',
      props
    )

    return zdf
  }

  DiodeZDF.defaults = {
    input:0,
    Q: 5,
    saturation: 1,
    cutoff: 440,
  }

  return DiodeZDF

}

},{"./filter.js":85,"genish.js":36}],85:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let filter = Object.create( ugen )

Object.assign( filter, {

})

module.exports = filter

},{"../ugen.js":125}],86:[function(require,module,exports){
let g = require( 'genish.js' ),
    filter = require( './filter.js' )

module.exports = function( Gibberish ) {

  Gibberish.genish.filter24 = ( input, rez, cutoff, isLowPass, isStereo=false ) => {
    let returnValue,
        polesL = g.data([ 0,0,0,0 ], 1, { meta:true }),
        peekProps = { interp:'none', mode:'simple' },
        rezzL = g.clamp( g.mul( polesL[3], rez ) ),
        outputL = g.sub( isStereo ? input[0] : input, rezzL ) 

    polesL[0] = g.add( polesL[0], g.mul( g.add( g.mul(-1, polesL[0] ), outputL   ), cutoff ))
    polesL[1] = g.add( polesL[1], g.mul( g.add( g.mul(-1, polesL[1] ), polesL[0] ), cutoff ))
    polesL[2] = g.add( polesL[2], g.mul( g.add( g.mul(-1, polesL[2] ), polesL[1] ), cutoff ))
    polesL[3] = g.add( polesL[3], g.mul( g.add( g.mul(-1, polesL[3] ), polesL[2] ), cutoff ))
    
    let left = g.switch( isLowPass, polesL[3], g.sub( outputL, polesL[3] ) )

    if( isStereo ) {
      let polesR = g.data([ 0,0,0,0 ], 1, { meta:true }),
          rezzR = g.clamp( g.mul( polesR[3], rez ) ),
          outputR = g.sub( input[1], rezzR )         

      polesR[0] = g.add( polesR[0], g.mul( g.add( g.mul(-1, polesR[0] ), outputR   ), cutoff ))
      polesR[1] = g.add( polesR[1], g.mul( g.add( g.mul(-1, polesR[1] ), polesR[0] ), cutoff ))
      polesR[2] = g.add( polesR[2], g.mul( g.add( g.mul(-1, polesR[2] ), polesR[1] ), cutoff ))
      polesR[3] = g.add( polesR[3], g.mul( g.add( g.mul(-1, polesR[3] ), polesR[2] ), cutoff ))

      let right = g.switch( isLowPass, polesR[3], g.sub( outputR, polesR[3] ) )

      returnValue = [left, right]
    }else{
      returnValue = left
    }

    return returnValue
  }

  let Filter24 = inputProps => {
    let filter24   = Object.create( filter )
    let props    = Object.assign( {}, Filter24.defaults, inputProps )
    let isStereo = props.input.isStereo 

    Gibberish.factory(
      filter24, 
      Gibberish.genish.filter24( g.in('input'), g.in('resonance'), g.in('cutoff'), g.in('isLowPass'), isStereo ), 
      'filter24',
      props
    )

    return filter24
  }


  Filter24.defaults = {
    input:0,
    resonance: 3.5,
    cutoff: .1,
    isLowPass:1
  }

  return Filter24

}


},{"./filter.js":85,"genish.js":36}],87:[function(require,module,exports){
module.exports = function( Gibberish ) {

  const g = Gibberish.genish

  const filters = {
    Filter24Classic : require( './filter24.js'  )( Gibberish ),
    Filter24Moog    : require( './ladderFilterZeroDelay.js' )( Gibberish ),
    Filter24TB303   : require( './diodeFilterZDF.js' )( Gibberish ),
    Filter12Biquad  : require( './biquad.js'    )( Gibberish ),
    Filter12SVF     : require( './svf.js'       )( Gibberish ),
    
    // not for use by end-users
    genish: {
      Comb        : require( './combfilter.js' ),
      AllPass     : require( './allpass.js' )
    },

    factory( input, cutoff, resonance, saturation = null, props, isStereo = false ) {
      let filteredOsc 

      if( props.filterType === 1 ) {
        if( typeof props.cutoff !== 'object' && props.cutoff > 1 ) {
          props.cutoff = .25
        }
        if( typeof props.cutoff !== 'object' && props.filterMult > .5 ) {
          props.filterMult = .1
        }
      }

      switch( props.filterType ) {
        case 1:
          isLowPass = g.param( 'lowPass', 1 ),
          filteredOsc = g.filter24( input, g.in('resonance'), cutoff, isLowPass, isStereo )
          break;
        case 2:
          filteredOsc = g.zd24( input, g.in('Q'), cutoff )
          break;
        case 3:
          filteredOsc = g.diodeZDF( input, g.in('Q'), cutoff, g.in('saturation'), isStereo ) 
          break;
        default:
          // return unfiltered signal
          filteredOsc = input //g.filter24( oscWithGain, g.in('resonance'), cutoff, isLowPass )
          break;
      }

      return filteredOsc
    } 
  }

  filters.export = target => {
    for( let key in filters ) {
      if( key !== 'export' && key !== 'genish' ) {
        target[ key ] = filters[ key ]
      }
    }
  }

return filters

}

},{"./allpass.js":81,"./biquad.js":82,"./combfilter.js":83,"./diodeFilterZDF.js":84,"./filter24.js":86,"./ladderFilterZeroDelay.js":88,"./svf.js":89}],88:[function(require,module,exports){
const g = require( 'genish.js' ),
      filter = require( './filter.js' )

module.exports = function( Gibberish ) {

  Gibberish.genish.zd24 = ( input, Q, freq, isStereo=false ) => {
    const iT = 1 / g.gen.samplerate,
          z1 = g.history(0),
          z2 = g.history(0),
          z3 = g.history(0),
          z4 = g.history(0)

    // kwd = 2 * $M_PI * acf[kindx]
    const kwd = g.memo( g.mul( Math.PI * 2, freq ) )

    // kwa = (2/iT) * tan(kwd * iT/2) 
    const kwa =g.memo( g.mul( 2/iT, g.tan( g.mul( kwd, iT/2 ) ) ) )

    // kG  = kwa * iT/2 
    const kg = g.memo( g.mul( kwa, iT/2 ) )

    // kk = 4.0*(kQ - 0.5)/(25.0 - 0.5)
    const kk = g.memo( g.mul( 4, g.div( g.sub( Q, .5 ), 24.5 ) ) )

    // kg_plus_1 = (1.0 + kg)
    const kg_plus_1 = g.add( 1, kg )

    // kG = kg / kg_plus_1 
    const kG     = g.memo( g.div( kg, kg_plus_1 ) ),
          kG_2   = g.memo( g.mul( kG, kG ) ),
          kG_3   = g.mul( kG_2, kG ),
          kGAMMA = g.mul( kG_2, kG_2 )

    const kS1 = g.div( z1.out, kg_plus_1 ),
          kS2 = g.div( z2.out, kg_plus_1 ),
          kS3 = g.div( z3.out, kg_plus_1 ),
          kS4 = g.div( z4.out, kg_plus_1 )

    //kS = kG_3 * kS1  + kG_2 * kS2 + kG * kS3 + kS4 
    const kS = g.memo( 
      g.add(
        g.add( g.mul(kG_3, kS1), g.mul( kG_2, kS2) ),
        g.add( g.mul(kG, kS3), kS4 )
      )
    )

    //ku = (kin - kk *  kS) / (1 + kk * kGAMMA)
    const ku1 = g.sub( input, g.mul( kk, kS ) )
    const ku2 = g.memo( g.add( 1, g.mul( kk, kGAMMA ) ) )
    const ku  = g.memo( g.div( ku1, ku2 ) )

    let kv =  g.memo( g.mul( g.sub( ku, z1.out ), kG ) )
    let klp = g.memo( g.add( kv, z1.out ) )
    z1.in( g.add( klp, kv ) )

    kv  = g.memo( g.mul( g.sub( klp, z2.out ), kG ) )
    klp = g.memo( g.add( kv, z2.out ) )
    z2.in( g.add( klp, kv ) )

    kv  = g.memo( g.mul( g.sub( klp, z3.out ), kG ) )
    klp = g.memo( g.add( kv, z3.out ) )
    z3.in( g.add( klp, kv ) )

    kv  = g.memo( g.mul( g.sub( klp, z4.out ), kG ) )
    klp = g.memo( g.add( kv, z4.out ) )
    z4.in( g.add( klp, kv ) )


    if( isStereo ) {
      //let polesR = g.data([ 0,0,0,0 ], 1, { meta:true }),
      //    rezzR = g.clamp( g.mul( polesR[3], rez ) ),
      //    outputR = g.sub( input[1], rezzR )         

      //polesR[0] = g.add( polesR[0], g.mul( g.add( g.mul(-1, polesR[0] ), outputR   ), cutoff ))
      //polesR[1] = g.add( polesR[1], g.mul( g.add( g.mul(-1, polesR[1] ), polesR[0] ), cutoff ))
      //polesR[2] = g.add( polesR[2], g.mul( g.add( g.mul(-1, polesR[2] ), polesR[1] ), cutoff ))
      //polesR[3] = g.add( polesR[3], g.mul( g.add( g.mul(-1, polesR[3] ), polesR[2] ), cutoff ))

      //let right = g.switch( isLowPass, polesR[3], g.sub( outputR, polesR[3] ) )

      //returnValue = [left, right]
    }else{
      returnValue = klp
    }

    return returnValue
  }

  const Zd24 = inputProps => {
    const filter   = Object.create( filter )
    const props    = Object.assign( {}, Zd24.defaults, inputProps )
    const isStereo = props.input.isStereo 

    Gibberish.factory(
      filter, 
      Gibberish.genish.zd24( g.in('input'), g.in('Q'), g.in('cutoff'), isStereo ), 
      'zd24',
      props
    )

    return filter
  }


  Zd24.defaults = {
    input:0,
    Q: 5,
    cutoff: 440,
  }

  return Zd24

}


},{"./filter.js":85,"genish.js":36}],89:[function(require,module,exports){
const g = require( 'genish.js' ),
      filter = require( './filter.js' )

module.exports = function( Gibberish ) {
  Gibberish.genish.svf = ( input, cutoff, Q, mode, isStereo ) => {
    let d1 = g.data([0,0], 1, { meta:true }), d2 = g.data([0,0], 1, { meta:true }),
        peekProps = { mode:'simple', interp:'none' }
    
    let f1 = g.memo( g.mul( 2 * Math.PI, g.div( cutoff, g.gen.samplerate ) ) )
    let oneOverQ = g.memo( g.div( 1, Q ) )
    let l = g.memo( g.add( d2[0], g.mul( f1, d1[0] ) ) ),
        h = g.memo( g.sub( g.sub( isStereo ? input[0] : input, l ), g.mul( Q, d1[0] ) ) ),
        b = g.memo( g.add( g.mul( f1, h ), d1[0] ) ),
        n = g.memo( g.add( h, l ) )

    d1[0] = b
    d2[0] = l

    let out = g.selector( mode, l, h, b, n )

    let returnValue
    if( isStereo ) {
      let d12 = g.data([0,0], 1, { meta:true }), d22 = g.data([0,0], 1, { meta:true })
      let l2 = g.memo( g.add( d22[0], g.mul( f1, d12[0] ) ) ),
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

  let SVF = inputProps => {
    const svf = Object.create( filter )
    const props = Object.assign( {}, SVF.defaults, inputProps ) 

    const isStereo = props.input.isStereo
    
    // XXX NEEDS REFACTORING
    Gibberish.factory( 
      svf,
      Gibberish.genish.svf( g.in('input'), g.in('cutoff'), g.in('Q'), g.in('mode'), isStereo ), 
      'svf', 
      props
    )

    return svf
  }


  SVF.defaults = {
    input:0,
    Q: .75,
    cutoff:550,
    mode:0
  }

  return SVF

}


},{"./filter.js":85,"genish.js":36}],90:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let BitCrusher = inputProps => {
  let props = Object.assign( { bitCrusherLength: 44100 }, BitCrusher.defaults, inputProps ),
      bitCrusher = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      bitDepth = g.in( 'bitDepth' ),
      sampleRate = g.in( 'sampleRate' ),
      leftInput = isStereo ? input[ 0 ] : input,
      rightInput = isStereo ? input[ 1 ] : null
  
  let storeL = g.history(0)
  let sampleReduxCounter = g.counter( sampleRate, 0, 1 )

  let bitMult = g.pow( g.mul( bitDepth, 16 ), 2 )
  let crushedL = g.div( g.floor( g.mul( leftInput, bitMult ) ), bitMult )

  let outL = g.switch(
    sampleReduxCounter.wrap,
    crushedL,
    storeL.out
  )

  if( isStereo ) {
    let storeR = g.history(0)
    let crushedR = g.div( g.floor( g.mul( rightInput, bitMult ) ), bitMult )

    let outR = ternary( 
      sampleReduxCounter.wrap,
      crushedR,
      storeL.out
    )

    Gibberish.factory( 
      bitCrusher,
      [ outL, outR ], 
      'bitCrusher', 
      props 
    )
  }else{
    Gibberish.factory( bitCrusher, outL, 'bitCrusher', props )
  }
  
  return bitCrusher
}

BitCrusher.defaults = {
  input:0,
  bitDepth:.5,
  sampleRate: .5
}

return BitCrusher

}

},{"./effect.js":93,"genish.js":36}],91:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
  let proto = Object.create( effect )

  let Shuffler = inputProps => {
    let bufferShuffler = Object.create( proto ),
        bufferSize = 88200

    let props = Object.assign( {}, Shuffler.defaults, inputProps )

    let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : false
    let phase = g.accum( 1,0,{ shouldWrap: false })

    let input = g.in( 'input' ),
        leftInput = isStereo ? input[ 0 ] : input,
        rightInput = isStereo ? input[ 1 ] : null,
        rateOfShuffling = g.in( 'rate' ),
        chanceOfShuffling = g.in( 'chance' ),
        reverseChance = g.in( 'reverseChance' ),
        repitchChance = g.in( 'repitchChance' ),
        repitchMin = g.in( 'repitchMin' ),
        repitchMax = g.in( 'repitchMax' )

    let pitchMemory = g.history(1)

    let shouldShuffleCheck = g.eq( g.mod( phase, rateOfShuffling ), 0 )
    let isShuffling = g.memo( g.sah( g.lt( g.noise(), chanceOfShuffling ), shouldShuffleCheck, 0 ) ) 

    // if we are shuffling and on a repeat boundary...
    let shuffleChanged = g.memo( g.and( shouldShuffleCheck, isShuffling ) )
    let shouldReverse = g.lt( g.noise(), reverseChance ),
        reverseMod = g.switch( shouldReverse, -1, 1 )

    let pitch = g.ifelse( 
      g.and( shuffleChanged, g.lt( g.noise(), repitchChance ) ),
      g.memo( g.mul( g.add( repitchMin, g.mul( g.sub( repitchMax, repitchMin ), g.noise() ) ), reverseMod ) ),
      reverseMod
    )
    
    // only switch pitches on repeat boundaries
    pitchMemory.in( g.switch( shuffleChanged, pitch, pitchMemory.out ) )

    let fadeLength = g.memo( g.div( rateOfShuffling, 100 ) ),
        fadeIncr = g.memo( g.div( 1, fadeLength ) )

    let bufferL = g.data( bufferSize ), bufferR = isStereo ? g.data( bufferSize ) : null
    let readPhase = g.accum( pitchMemory.out, 0, { shouldWrap:false }) 
    let stutter = g.wrap( g.sub( g.mod( readPhase, bufferSize ), 22050 ), 0, bufferSize )

    let normalSample = g.peek( bufferL, g.accum( 1, 0, { max:88200 }), { mode:'simple' })

    let stutterSamplePhase = g.switch( isShuffling, stutter, g.mod( readPhase, bufferSize ) )
    let stutterSample = g.memo( g.peek( 
      bufferL, 
      stutterSamplePhase,
      { mode:'samples' }
    ) )
    
    let stutterShouldFadeIn = g.and( shuffleChanged, isShuffling )
    let stutterPhase = g.accum( 1, shuffleChanged, { shouldWrap: false })

    let fadeInAmount = g.memo( g.div( stutterPhase, fadeLength ) )
    let fadeOutAmount = g.div( g.sub( rateOfShuffling, stutterPhase ), g.sub( rateOfShuffling, fadeLength ) )
    
    let fadedStutter = g.ifelse(
      g.lt( stutterPhase, fadeLength ),
      g.memo( g.mul( g.switch( g.lt( fadeInAmount, 1 ), fadeInAmount, 1 ), stutterSample ) ),
      g.gt( stutterPhase, g.sub( rateOfShuffling, fadeLength ) ),
      g.memo( g.mul( g.gtp( fadeOutAmount, 0 ), stutterSample ) ),
      stutterSample
    )
    
    let outputL = g.mix( normalSample, fadedStutter, isShuffling ) 

    let pokeL = g.poke( bufferL, leftInput, g.mod( g.add( phase, 44100 ), 88200 ) )

    let panner = g.pan( outputL, outputL, g.in( 'pan' ) )
    
    Gibberish.factory( 
      bufferShuffler,
      [panner.left, panner.right],
      'shuffler', 
      props 
    ) 

    //if( props.filename ) {
    //  bufferShuffler.data = g.data( props.filename )

    //  bufferShuffler.data.onload = () => {
    //    bufferShuffler.__phase__ = g.counter( rate, start, end, bufferShuffler.__bang__, shouldLoop, { shouldWrap:false })

    //    Gibberish.factory( 
    //      bufferShuffler,
    //      g.ifelse( 
    //        g.and( g.gte( bufferShuffler.__phase__, start ), g.lt( bufferShuffler.__phase__, end ) ),
    //        g.peek( 
    //          bufferShuffler.data, 
    //          bufferShuffler.__phase__,
    //          { mode:'samples' }
    //        ),
    //        0
    //      ),
    //      'sampler', 
    //      props 
    //    ) 

    //    if( bufferShuffler.end === -999999999 ) bufferShuffler.end = bufferShuffler.data.buffer.length - 1
        
    //    Gibberish.dirty( bufferShuffler )
    //  }
    //}

    return bufferShuffler
  }
  
  Shuffler.defaults = {
    input:0,
    rate:22050,
    chance:.25,
    reverseChance:.5,
    repitchChance:.5,
    repitchMin:.5,
    repitchMax:2,
    pan:.5,
    mix:.5
  }

  return Shuffler 
}

},{"./effect.js":93,"genish.js":36}],92:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Delay = inputProps => {
  let props = Object.assign( { delayLength: 44100 }, Delay.defaults, inputProps ),
      delay = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      delayTime = g.in( 'delayTime' ),
      leftInput = isStereo ? input[ 0 ] : input,
      rightInput = isStereo ? input[ 1 ] : null
    
  let feedback = g.in( 'feedback' )

  // left channel
  let feedbackHistoryL = g.history()
  let echoL = g.delay( g.add( leftInput, g.mul( feedbackHistoryL.out, feedback ) ), delayTime, { size:props.delayLength })
  feedbackHistoryL.in( echoL )

  if( isStereo ) {
    // right channel
    let feedbackHistoryR = g.history()
    let echoR = g.delay( g.add( rightInput, g.mul( feedbackHistoryR.out, feedback ) ), delayTime, { size:props.delayLength })
    feedbackHistoryR.in( echoR )

    Gibberish.factory( 
      delay,
      [ echoL, echoR ], 
      'delay', 
      props 
    )
  }else{
    Gibberish.factory( delay, echoL, 'delay', props )
  }
  
  return delay
}

Delay.defaults = {
  input:0,
  feedback:.925,
  delayTime: 11025
}

return Delay

}

},{"./effect.js":93,"genish.js":36}],93:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let effect = Object.create( ugen )

Object.assign( effect, {

})

module.exports = effect

},{"../ugen.js":125}],94:[function(require,module,exports){
module.exports = function( Gibberish ) {

  const effects = {
    Freeverb    : require( './freeverb.js'  )( Gibberish ),
    Flanger     : require( './flanger.js'   )( Gibberish ),
    Vibrato     : require( './vibrato.js'   )( Gibberish ),
    Delay       : require( './delay.js'     )( Gibberish ),
    BitCrusher  : require( './bitCrusher.js')( Gibberish ),
    RingMod     : require( './ringMod.js'   )( Gibberish ),
    Tremolo     : require( './tremolo.js'   )( Gibberish ),
    Shuffler    : require( './bufferShuffler.js'  )( Gibberish )
  }

  effects.export = target => {
    for( let key in effects ) {
      if( key !== 'export' ) {
        target[ key ] = effects[ key ]
      }
    }
  }

return effects

}

},{"./bitCrusher.js":90,"./bufferShuffler.js":91,"./delay.js":92,"./flanger.js":95,"./freeverb.js":96,"./ringMod.js":97,"./tremolo.js":98,"./vibrato.js":99}],95:[function(require,module,exports){
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

  let left = g.add( leftInput, delayedOutL ),
      right

  if( isStereo === true ) {
    rightInput = input[1]
    delayBufferR = g.data( delayLength )
    
    let delayedOutR = g.peek( delayBufferR, readIdx, { interp:'linear', mode:'samples' })

    g.poke( delayBufferR, g.add( rightInput, g.mul( delayedOutR, feedbackCoeff ) ), writeIdx )
    right = g.add( rightInput, delayedOutR )

    Gibberish.factory( 
      flanger,
      [ left, right ], 
      'flanger', 
      props 
    )

  }else{
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

},{"./effect.js":93,"genish.js":36}],96:[function(require,module,exports){
const g = require( 'genish.js' ),
      effect = require( './effect.js' )

module.exports = function( Gibberish ) {
  
const allPass = Gibberish.filters.genish.AllPass
const combFilter = Gibberish.filters.genish.Comb

const tuning = {
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

const Freeverb = inputProps => {
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
      combFilter( attenuatedInput, tuning.combTuning[i], g.mul(damping,.4), g.mul( tuning.scaleRoom + tuning.offsetRoom, roomSize ) ) 
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


},{"./effect.js":93,"genish.js":36}],97:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let RingMod = inputProps => {
  let props   = Object.assign( {}, RingMod.defaults, inputProps ),
      ringMod = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      frequency = g.in( 'frequency' ),
      gain = g.in( 'gain' ),
      mix = g.in( 'mix' )
  
  let leftInput = isStereo ? input[0] : input,
      sine = g.mul( g.cycle( frequency ), gain )
 
  let left = g.add( g.mul( leftInput, g.sub( 1, mix )), g.mul( g.mul( leftInput, sine ), mix ) ), 
      right

  if( isStereo === true ) {
    let rightInput = input[1]
    right = g.add( g.mul( rightInput, g.sub( 1, mix )), g.mul( g.mul( rightInput, sine ), mix ) ) 
    
    Gibberish.factory( 
      ringMod,
      [ left, right ], 
      'ringMod', 
      props 
    )
  }else{
    Gibberish.factory( ringMod, left, 'ringMod', props )
  }
  
  return ringMod
}

RingMod.defaults = {
  input:0,
  frequency:220,
  gain: 1, 
  mix:1
}

return RingMod

}

},{"./effect.js":93,"genish.js":36}],98:[function(require,module,exports){
const g = require( 'genish.js' ),
      effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
const Tremolo = inputProps => {
  const props   = Object.assign( {}, Tremolo.defaults, inputProps ),
        tremolo = Object.create( effect )

  const isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  const input = g.in( 'input' ),
        frequency = g.in( 'frequency' ),
        amount = g.in( 'amount' )
  
  const leftInput = isStereo ? input[0] : input

  let osc
  if( props.shape === 'square' ) {
    osc = g.gt( g.phasor( frequency ), 0 )
  }else if( props.shape === 'saw' ) {
    osc = g.gtp( g.phasor( frequency ), 0 )
  }else{
    osc = g.cycle( frequency )
  }

  const mod = g.mul( osc, amount )
 
  let left = g.sub( leftInput, g.mul( leftInput, mod ) ), 
      right

  if( isStereo === true ) {
    let rightInput = input[1]
    right = g.mul( rightInput, mod )

    Gibberish.factory( 
      tremolo,
      [ left, right ], 
      'tremolo', 
      props 
    )
  }else{
    Gibberish.factory( tremolo, left, 'tremolo', props )
  }
  
  return tremolo
}

Tremolo.defaults = {
  input:0,
  frequency:2,
  amount: 1, 
  shape:'sine'
}

return Tremolo

}

},{"./effect.js":93,"genish.js":36}],99:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Vibrato = inputProps => {
  let props   = Object.assign( {}, Vibrato.defaults, inputProps ),
      vibrato = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      delayLength = 44100,
      feedbackCoeff = .01,//g.in( 'feedback' ),
      modAmount = g.in( 'amount' ),
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
  //feedback:.01,
  amount:.5,
  frequency:4
}

return Vibrato

}

},{"./effect.js":93,"genish.js":36}],100:[function(require,module,exports){
let MemoryHelper = require( 'memory-helper' ),
    genish       = require( 'genish.js' )
    
let Gibberish = {
  blockCallbacks: [], // called every block
  dirtyUgens: [],
  callbackUgens: [],
  callbackNames: [],
  analyzers: [],
  graphIsDirty: false,
  ugens: {},
  debug: false,

  output: null,

  memory : null, // 20 minutes by default?
  factory: null, 
  genish,
  scheduler: require( './scheduling/scheduler.js' ),

  memoed: {},

  prototypes: {
    ugen: require('./ugen.js'),
    instrument: require( './instruments/instrument.js' ),
    effect: require( './fx/effect.js' ),
  },

  mixins: {
    polyinstrument: require( './instruments/polyMixin.js' )
  },

  init( memAmount ) {
    let numBytes = memAmount === undefined ? 20 * 60 * 44100 : memAmount

    this.memory = MemoryHelper.create( numBytes )

    this.load()
    
    this.output = this.Bus2()

    this.utilities.createContext()
    this.utilities.createScriptProcessor()

    this.analyzers.dirty = false

    // XXX FOR DEVELOPMENT AND TESTING ONLY... REMOVE FOR PRODUCTION
    this.export( window )
  },

  load() {
    this.factory = require( './ugenTemplate.js' )( this )

    this.PolyTemplate = require( './instruments/polytemplate.js' )( this )
    this.oscillators  = require( './oscillators/oscillators.js' )( this )
    this.filters      = require( './filters/filters.js' )( this )
    this.binops       = require( './misc/binops.js' )( this )
    this.monops       = require( './misc/monops.js' )( this )
    this.Bus          = require( './misc/bus.js' )( this )
    this.Bus2         = require( './misc/bus2.js' )( this );
    this.instruments  = require( './instruments/instruments.js' )( this )
    this.fx           = require( './fx/effects.js' )( this )
    this.Sequencer    = require( './scheduling/sequencer.js' )( this );
    this.Sequencer2   = require( './scheduling/seq2.js' )( this );
    this.envelopes    = require( './envelopes/envelopes.js' )( this );
    this.ssd          = require( './analysis/singlesampledelay.js' )( this );
  },

  export( target, shouldExportGenish=false ) {
    if( target === undefined ) throw Error('You must define a target object for Gibberish to export variables to.')

    if( shouldExportGenish ) this.genish.export( target )

    this.instruments.export( target )
    this.fx.export( target )
    this.filters.export( target )
    this.oscillators.export( target )
    this.binops.export( target )
    this.monops.export( target )
    this.envelopes.export( target )
    target.Sequencer = this.Sequencer
    target.Sequencer2 = this.Sequencer2
    target.Bus = this.Bus
    target.Bus2 = this.Bus2
    target.Scheduler = this.scheduler
    target.SSD = this.ssd
  },

  print() {
    console.log( this.callback.toString() )
  },

  dirty( ugen ) {
    if( ugen === this.analyzers ) {
      this.graphIsDirty = true
      this.analyzers.dirty = true
    } else {
      this.dirtyUgens.push( ugen )
      this.graphIsDirty = true
      if( this.memoed[ ugen.ugenName ] ) {
        delete this.memoed[ ugen.ugenName ]
      }
    } 
  },

  clear() {
    this.output.inputs = [0]
    this.output.inputNames.length = 0
    this.analyzers.length = 0
    this.scheduler.clear()
    this.dirty( this.output )
  },

  generateCallback() {
    let uid = 0,
        callbackBody, lastLine, analysis=''

    this.memoed = {}

    callbackBody = this.processGraph( this.output )
    lastLine = callbackBody[ callbackBody.length - 1]

    this.analyzers.forEach( v=> {
      const analysisBlock = Gibberish.processUgen( v )
      const analysisLine = analysisBlock.pop()

      analysisBlock.forEach( v=> {
        callbackBody.splice( callbackBody.length - 1, 0, v )
      })

      callbackBody.push( analysisLine )
    })

    this.analyzers.forEach( v => {
      if( this.callbackUgens.indexOf( v.callback ) === -1 )
        this.callbackUgens.push( v.callback )
    })
    this.callbackNames = this.callbackUgens.map( v => v.ugenName )

    callbackBody.push( '\n\treturn ' + lastLine.split( '=' )[0].split( ' ' )[1] )

    if( this.debug ) console.log( 'callback:\n', callbackBody.join('\n') )
    this.callbackNames.push( 'memory' )
    this.callbackUgens.push( this.memory.heap )
    this.callback = Function( ...this.callbackNames, callbackBody.join( '\n' ) )
    this.callback.out = []

    if( this.oncallback ) this.oncallback( this.callback )

    return this.callback 
  },

  processGraph( output ) {
    this.callbackUgens.length = 0
    this.callbackNames.length = 0

    this.callbackUgens.push( output.callback )

    let body = this.processUgen( output )
    

    this.dirtyUgens.length = 0
    this.graphIsDirty = false

    return body
  },

  processUgen( ugen, block ) {
    if( block === undefined ) block = []

    let dirtyIdx = Gibberish.dirtyUgens.indexOf( ugen )

    //console.log( 'ugenName:', ugen.ugenName )
    let memo = Gibberish.memoed[ ugen.ugenName ]

    if( memo !== undefined ) {
      return memo 
    } else if( ugen.block === undefined || dirtyIndex !== -1 ) {
  
      let line = `\tvar v_${ugen.id} = ` 
      
      if( !ugen.binop ) line += `${ugen.ugenName}( `

      // must get array so we can keep track of length for comma insertion
      let keys,err
      
      //try {
      keys = ugen.binop || ugen.type === 'bus' || ugen.type === 'analysis' ? Object.keys( ugen.inputs ) : Object.keys( ugen.inputNames )

      //}catch( e ){

      //  console.log( e )
      //  err = true
      //}
      
      //if( err === true ) return

      for( let i = 0; i < keys.length; i++ ) {
        let key = keys[ i ]
        // binop.inputs is actual values, not just property names
        let input 
        if( ugen.binop || ugen.type ==='bus' ) {
          input = ugen.inputs[ key ]
        }else{
          //if( key === 'memory' ) continue;
  
          input = ugen[ ugen.inputNames[ key ] ]
        }

        if( input !== undefined ) { 
          if( typeof input === 'number' ) {
            line += input
          }else{
            //console.log( 'key:', key, 'input:', ugen.inputs, ugen.inputs[ key ] ) 

            Gibberish.processUgen( input, block )

            //if( input.callback === undefined ) continue

            if( !input.binop ) {
              // check is needed so that graphs with ssds that refer to themselves
              // don't add the ssd in more than once
              if( Gibberish.callbackUgens.indexOf( input.callback ) === -1 ) {
                Gibberish.callbackUgens.push( input.callback )
              }
            }

            line += `v_${input.id}`
          }

          if( i < keys.length - 1 ) {
            line += ugen.binop ? ' ' + ugen.op + ' ' : ', ' 
          }
        }
      }
      
      //if( ugen.type === 'bus' ) line += ', ' 
      if( !ugen.binop && ugen.type !== 'bus' && ugen.type !== 'seq' ) line += 'memory'
      line += ugen.binop ? '' : ' )'

      block.push( line )
      
      //console.log( 'memo:', ugen.ugenName )
      Gibberish.memoed[ ugen.ugenName ] = `v_${ugen.id}`

      if( dirtyIdx !== -1 ) {
        Gibberish.dirtyUgens.splice( dirtyIdx, 1 )
      }

    }else if( ugen.block ) {
      return ugen.block
    }

    return block
  },
    
}

Gibberish.utilities = require( './utilities.js' )( Gibberish )


module.exports = Gibberish

},{"./analysis/singlesampledelay.js":75,"./envelopes/envelopes.js":78,"./filters/filters.js":87,"./fx/effect.js":93,"./fx/effects.js":94,"./instruments/instrument.js":105,"./instruments/instruments.js":106,"./instruments/polyMixin.js":110,"./instruments/polytemplate.js":111,"./misc/binops.js":115,"./misc/bus.js":116,"./misc/bus2.js":117,"./misc/monops.js":118,"./oscillators/oscillators.js":120,"./scheduling/scheduler.js":122,"./scheduling/seq2.js":123,"./scheduling/sequencer.js":124,"./ugen.js":125,"./ugenTemplate.js":126,"./utilities.js":127,"genish.js":36,"memory-helper":73}],101:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Conga = argumentProps => {
    let conga = Object.create( instrument ),
        frequency = g.in( 'frequency' ),
        decay = g.in( 'decay' ),
        gain  = g.in( 'gain' )

    let props = Object.assign( {}, Conga.defaults, argumentProps )

    let trigger = g.bang(),
        impulse = g.mul( trigger, 60 ),
        _decay =  g.sub( .101, g.div( decay, 10 ) ), // create range of .001 - .099
        bpf = g.svf( impulse, frequency, _decay, 2, false ),
        out = g.mul( bpf, gain )
    
    Gibberish.factory( conga, out, 'conga', props  )
    
    conga.env = trigger

    return conga
  }
  
  Conga.defaults = {
    gain: .25,
    frequency:190,
    decay: .85
  }

  return Conga

}

},{"./instrument.js":105,"genish.js":36}],102:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const Cowbell = argumentProps => {
    const cowbell = Object.create( instrument ),
          decay   = g.in( 'decay' ),
          gain    = g.in( 'gain' )

    const props = Object.assign( {}, Cowbell.defaults, argumentProps )

    const bpfCutoff = g.param( 'bpfc', 1000 ),
          s1 = Gibberish.oscillators.factory( 'square', 560 ),
          s2 = Gibberish.oscillators.factory( 'square', 845 ),
          eg = g.decay( g.mul( decay, g.gen.samplerate * 2 ) ), 
          bpf = g.svf( g.add( s1,s2 ), bpfCutoff, 3, 2, false ),
          envBpf = g.mul( bpf, eg ),
          out = g.mul( envBpf, gain )

    Gibberish.factory( cowbell, out, 'cowbell', props  )
    
    cowbell.env = eg 

    cowbell.isStereo = false

    return cowbell
  }
  
  Cowbell.defaults = {
    gain: 1,
    decay:.5
  }

  return Cowbell

}

},{"./instrument.js":105,"genish.js":36}],103:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let FM = inputProps => {
    let syn = Object.create( instrument )

    let env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        glide = g.in( 'glide' ),
        slidingFreq = g.slide( frequency, glide, glide ),
        cmRatio = g.in( 'cmRatio' ),
        index = g.in( 'index' )

    let props = Object.assign( {}, FM.defaults, inputProps )

    let modOsc = Gibberish.oscillators.factory( props.modulatorWaveform, g.mul( slidingFreq, cmRatio ), props.antialias )
    let modOscWithIndex = g.mul( modOsc, g.mul( slidingFreq, index ) )
    let modOscWithEnv   = g.mul( modOscWithIndex, env )

    let carrierOsc = Gibberish.oscillators.factory( props.carrierWaveform, g.add( slidingFreq, modOscWithEnv ), props.antialias )
    let carrierOscWithEnv = g.mul( carrierOsc, env )
    
    let cutoff = g.add( g.in('cutoff'), g.mul( g.in('filterMult'), env ) )
    const filteredOsc = Gibberish.filters.factory( carrierOscWithEnv, cutoff, g.in('resonance'), g.in('saturation'), props )

    let synthWithGain = g.mul( filteredOsc, g.in( 'gain' ) ),
        panner

    if( props.panVoices === true ) { 
      panner = g.pan( synthWithGain, synthWithGain, g.in( 'pan' ) ) 
      Gibberish.factory( syn, [panner.left, panner.right], 'fm', props  )
    }else{
      Gibberish.factory( syn, synthWithGain , 'fm', props )
    }
    
    syn.env = env

    return syn
  }

  FM.defaults = {
    carrierWaveform:'sine',
    modulatorWaveform:'sine',
    attack: 44100,
    decay: 44100,
    gain: 1,
    cmRatio:2,
    index:5,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    antialias:false,
    panVoices:false,
    glide:1,
    saturation:1,
    filterMult:440,
    Q:8,
    cutoff:440,
    resonance:3,
    filterType:0,
    isLowPass:1
  }

  let PolyFM = Gibberish.PolyTemplate( FM, ['glide','frequency','attack','decay','pulsewidth','pan','gain','cmRatio','index', 'saturation', 'filterMult', 'Q', 'cutoff', 'resonance' ] ) 

  return [ FM, PolyFM ]

}

},{"./instrument.js":105,"genish.js":36}],104:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Hat = argumentProps => {
    let hat = Object.create( instrument ),
        tune  = g.in( 'tune' ),
        scaledTune = g.memo( g.add( .5, tune ) ),
        decay  = g.in( 'decay' ),
        gain  = g.in( 'gain' )

    let props = Object.assign( {}, Hat.defaults, argumentProps )

    let baseFreq = g.mul( 325, scaledTune ), // range of 162.5 - 487.5
        bpfCutoff = g.mul( g.param( 'bpfc', 7000), scaledTune ),
        hpfCutoff = g.mul( g.param( 'hpfc',.9755), scaledTune ),  
        s1 = Gibberish.oscillators.factory( 'square', baseFreq, false ),
        s2 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,1.4471 ) ),
        s3 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,1.6170 ) ),
        s4 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,1.9265 ) ),
        s5 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,2.5028 ) ),
        s6 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,2.6637 ) ),
        sum = g.add( s1,s2,s3,s4,s5,s6 ),
        eg = g.decay( g.mul( decay, g.gen.samplerate * 2 ) ), 
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
    gain:  1,
    tune: .5,
    decay:.1,
  }

  return Hat

}

},{"./instrument.js":105,"genish.js":36}],105:[function(require,module,exports){
let ugen = require( '../ugen.js' ),
    g = require( 'genish.js' )

let instrument = Object.create( ugen )

Object.assign( instrument, {
  note( freq ) {
    this.frequency = freq
    this.env.trigger()
  },

  trigger( _gain = 1 ) {
    this.gain = _gain
    this.env.trigger()
  },

})

module.exports = instrument

},{"../ugen.js":125,"genish.js":36}],106:[function(require,module,exports){
module.exports = function( Gibberish ) {

const instruments = {
  Kick        : require( './kick.js' )( Gibberish ),
  Conga       : require( './conga.js' )( Gibberish ),
  Clave       : require( './conga.js' )( Gibberish ), // clave is same as conga with different defaults, see below
  Hat         : require( './hat.js' )( Gibberish ),
  Snare       : require( './snare.js' )( Gibberish ),
  Cowbell     : require( './cowbell.js' )( Gibberish )
}

instruments.Clave.defaults.frequency = 2500
instruments.Clave.defaults.decay = .5;

[ instruments.Synth, instruments.PolySynth ]     = require( './synth.js' )( Gibberish );
[ instruments.Monosynth, instruments.PolyMono ]  = require( './monosynth.js' )( Gibberish );
[ instruments.FM, instruments.PolyFM ]           = require( './fm.js' )( Gibberish );
[ instruments.Sampler, instruments.PolySampler ] = require( './sampler.js' )( Gibberish );
[ instruments.Karplus, instruments.PolyKarplus ] = require( './karplusstrong.js' )( Gibberish );

instruments.export = target => {
  for( let key in instruments ) {
    if( key !== 'export' ) {
      target[ key ] = instruments[ key ]
    }
  }
}

return instruments

}

},{"./conga.js":101,"./cowbell.js":102,"./fm.js":103,"./hat.js":104,"./karplusstrong.js":107,"./kick.js":108,"./monosynth.js":109,"./sampler.js":112,"./snare.js":113,"./synth.js":114}],107:[function(require,module,exports){
const g = require( 'genish.js' ),
      instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const KPS = inputProps => {

    const props = Object.assign( {}, KPS.defaults, inputProps )
    const syn = Object.create( instrument ),
          trigger = g.bang(),
          phase = g.accum( 1, trigger, { max:Infinity } ),
          env = g.gtp( g.sub( 1, g.div( phase, 200 ) ), 0 ),
          impulse = g.mul( g.noise(), env ),
          feedback = g.history(),
          frequency = g.in('frequency'),
          glide = g.in( 'glide' ),
          slidingFrequency = g.slide( frequency, glide, glide ),
          delay = g.delay( g.add( impulse, feedback.out ), g.div( Gibberish.ctx.sampleRate, slidingFrequency ), { size:2048 }),
          decayed = g.mul( delay, g.t60( g.mul( g.in('decay'), slidingFrequency ) ) ),
          damped =  g.mix( decayed, feedback.out, g.in('damping') ),
          withGain = g.mul( damped, g.in('gain') )

    feedback.in( damped )

    const properties = Object.assign( {}, KPS.defaults, props )

    if( properties.panVoices ) {  
      const panner = g.pan( withGain, withGain, g.in( 'pan' ) )
      Gibberish.factory( syn, [panner.left, panner.right], 'karplus', props  )
    }else{
      Gibberish.factory( syn, withGain, 'karplus', props )
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
    glide:1,
    panVoices:false
  }

  let envCheckFactory = ( syn,synth ) => {
    let envCheck = ()=> {
      let phase = syn.getPhase(),
          endTime = synth.decay * Gibberish.ctx.sampleRate

      if( phase > endTime ) {
        synth.disconnectUgen( syn )
        syn.isConnected = false
        Gibberish.memory.heap[ syn.phase.memory.value.idx ] = 0 // trigger doesn't seem to reset for some reason
      }else{
        Gibberish.blockCallbacks.push( envCheck )
      }
    }
    return envCheck
  }

  let PolyKPS = Gibberish.PolyTemplate( KPS, ['frequency','decay','damping','pan','gain', 'glide'], envCheckFactory ) 

  return [ KPS, PolyKPS ]

}

},{"./instrument.js":105,"genish.js":36}],108:[function(require,module,exports){
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
        graph = g.mul( lpf, gain )
    
    Gibberish.factory( kick, graph, 'kick', props  )

    kick.env = trigger

    return kick
  }
  
  Kick.defaults = {
    gain: 1,
    frequency:85,
    tone: .25,
    decay:.9
  }

  return Kick

}

},{"./instrument.js":105,"genish.js":36}],109:[function(require,module,exports){
const g = require( 'genish.js' ),
      instrument = require( './instrument.js' ),
      feedbackOsc = require( '../oscillators/fmfeedbackosc.js' )

module.exports = function( Gibberish ) {

  const Synth = argumentProps => {
    const syn = Object.create( instrument ),
          oscs = [], 
          env = g.ad( g.in( 'attack' ), g.in( 'decay' ), { shape:'linear' }),
          frequency = g.in( 'frequency' ),
          glide = g.in( 'glide' ),
          slidingFreq = g.memo( g.slide( frequency, glide, glide ) )

    let props = Object.assign( syn, Synth.defaults, argumentProps )

    syn.__createGraph = function() {
      for( let i = 0; i < 3; i++ ) {
        let osc, freq

        switch( i ) {
          case 1:
            freq = g.add( slidingFreq, g.mul( slidingFreq, g.in('detune2') ) )
            break;
          case 2:
            freq = g.add( slidingFreq, g.mul( slidingFreq, g.in('detune3') ) )
            break;
          default:
            freq = slidingFreq//frequency
        }

        osc = Gibberish.oscillators.factory( syn.waveform, freq, syn.antialias )
        
        oscs[ i ] = osc
      }

      let oscSum = g.add( ...oscs ),
          oscWithGain = g.mul( g.mul( oscSum, env ), g.in( 'gain' ) ),
          cutoff = g.add( g.in('cutoff'), g.mul( g.in('filterMult'), env ) ),
          filteredOsc, panner

      filteredOsc = Gibberish.filters.factory( oscWithGain, cutoff, g.in('resonance'), g.in('saturation'), syn )
        
      if( props.panVoices ) {  
        panner = g.pan( filteredOsc,filteredOsc, g.in( 'pan' ) )
        syn.graph = [ panner.left, panner.right ]
      }else{
        syn.graph = filteredOsc
      }
    }

    syn.__requiresRecompilation = [ 'waveform', 'antialias', 'filterType' ]
    syn.__createGraph()

    Gibberish.factory( syn, syn.graph, 'mono', props )

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
    detune2:1.01,
    detune3:2.99,
    cutoff: 440, //.25,
    resonance:2,
    Q: 5,
    panVoices:false,
    glide: 1,
    antialias:false,
    filterType: 1,
    saturation:1,
    filterMult: 110,
    isLowPass:true
  }

  let PolyMono = Gibberish.PolyTemplate( Synth, 
    ['frequency','attack','decay','cutoff','Q',
     'detune2','detune3','pulsewidth','pan','gain', 'glide', 'saturation', 'filterMult' ]
  ) 

  return [ Synth, PolyMono ]
}

},{"../oscillators/fmfeedbackosc.js":119,"./instrument.js":105,"genish.js":36}],110:[function(require,module,exports){
module.exports = {
  note( freq ) {
    let voice = this.__getVoice__()
    Object.assign( voice, this.properties )
    voice.note( freq )
    this.__runVoice__( voice, this )
    this.triggerNote = freq
  },

  // XXX this is not particularly satisfying...
  // must check for both notes and chords
  trigger( gain ) {
    if( this.triggerChord !== null ) {
      this.triggerChord.forEach( v => {
        let voice = this.__getVoice__()
        Object.assign( voice, this.properties )
        voice.note( v )
        voice.gain = gain
        this.__runVoice__( voice, this )
      })
    }else if( this.triggerNote !== null ) {
      let voice = this.__getVoice__()
      Object.assign( voice, this.properties )
      voice.note( this.triggerNote )
      voice.gain = gain
      this.__runVoice__( voice, this )
    }else{
      let voice = this.__getVoice__()
      Object.assign( voice, this.properties )
      voice.trigger( gain )
      this.__runVoice__( voice, this )
    }
  },

  __runVoice__( voice, _poly ) {
    if( !voice.isConnected ) {
      voice.connect( _poly, 1 )
      voice.isConnected = true
    }

    let envCheck
    if( _poly.envCheck === undefined ) {
      envCheck = function() {
        if( voice.env.isComplete() ) {
          _poly.disconnectUgen.call( _poly, voice )
          voice.isConnected = false
        }else{
          Gibberish.blockCallbacks.push( envCheck )
        }
      }
    }else{
      envCheck = poly.envCheck( voice, poly )
    }

    Gibberish.blockCallbacks.push( envCheck )
  },

  __getVoice__() {
    return this.voices[ this.voiceCount++ % this.voices.length ]
  },

  chord( frequencies ) {
    frequencies.forEach( v => this.note( v ) )
    this.triggerChord = frequencies
  },

  free() {
    for( let child of this.voices ) child.free()
  }
}

},{}],111:[function(require,module,exports){
/*
 * This files creates a factory generating polysynth constructors.
 */

const g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  const TemplateFactory = ( ugen, propertyList, _envCheck ) => {
    /* 
     * polysynths are basically busses that connect child synth voices.
     * We create separate prototypes for mono vs stereo instances.
     */

    const monoProto   = Object.create( Gibberish.Bus() ),
          stereoProto = Object.create( Gibberish.Bus2())

    // since there are two prototypes we can't assign directly to one of them...
    Object.assign( monoProto,   Gibberish.mixins.polyinstrument )
    Object.assign( stereoProto, Gibberish.mixins.polyinstrument )

    const Template = props => {
      const properties = Object.assign( {}, { isStereo:true }, props )

      const synth = properties.isStereo ? Object.create( stereoProto ) : Object.create( monoProto )

      Object.assign( synth, {
        voices: [],
        maxVoices: properties.maxVoices !== undefined ? properties.maxVoices : 16,
        voiceCount: 0,
        envCheck: _envCheck,
        id: Gibberish.factory.getUID(),
        dirty: true,
        type: 'bus',
        ugenName: 'poly' + ugen.name + '_' + synth.id,
        inputs: [],
        inputNames: [],
        properties
      })

      synth.callback.ugenName = synth.ugenName

      for( let i = 0; i < synth.maxVoices; i++ ) {
        synth.voices[i] = ugen( properties )
        synth.voices[i].callback.ugenName = synth.voices[i].ugenName
        synth.voices[i].isConnected = false
      }

      let _propertyList 
      if( properties.isStereo === false ) {
        _propertyList = propertyList.slice( 0 )
        const idx =  _propertyList.indexOf( 'pan' )
        if( idx  > -1 ) _propertyList.splice( idx, 1 )
      }

      TemplateFactory.setupProperties( synth, ugen, properties.isStereo ? propertyList : _propertyList )

      return synth
    }

    return Template
  }

  TemplateFactory.setupProperties = function( synth, ugen, props ) {
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

},{"genish.js":36}],112:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {
  let proto = Object.create( instrument )

  Object.assign( proto, {
    note( rate ) {
      this.rate = rate
      if( rate > 0 ) {
        this.trigger()
      }else{
        this.__phase__.value = this.data.buffer.length - 1 
      }
    }
  })

  let Sampler = inputProps => {
    let syn = Object.create( proto )

    let props = Object.assign( { onload:null }, Sampler.defaults, inputProps )

    syn.isStereo = props.isStereo !== undefined ? props.isStereo : false

    let start = g.in( 'start' ), end = g.in( 'end' ), 
        rate = g.in( 'rate' ), shouldLoop = g.in( 'loops' )

    /* create dummy ugen until data for sampler is loaded...
     * this will be overridden by a call to Gibberish.factory on load */
    syn.callback = function() { return 0 }
    syn.id = Gibberish.factory.getUID()
    syn.ugenName = syn.callback.ugenName = 'sampler_' + syn.id
    syn.inputNames = []
    /* end dummy ugen */

    syn.__bang__ = g.bang()
    syn.trigger = syn.__bang__.trigger

    if( props.filename ) {
      syn.data = g.data( props.filename )

      syn.data.onload = () => {
        syn.__phase__ = g.counter( rate, start, end, syn.__bang__, shouldLoop, { shouldWrap:false })

        Gibberish.factory( 
          syn,
          g.mul( 
          g.ifelse( 
            g.and( g.gte( syn.__phase__, start ), g.lt( syn.__phase__, end ) ),
            g.peek( 
              syn.data, 
              syn.__phase__,
              { mode:'samples' }
            ),
            0
          ), g.in('gain') ),
          'sampler', 
          props 
        ) 

        if( syn.end === -999999999 ) syn.end = syn.data.buffer.length - 1

        if( syn.onload !== null ) { syn.onload() }

        Gibberish.dirty( syn )
      }
    }

    return syn
  }
  
  Sampler.defaults = {
    gain: 1,
    pan: .5,
    rate: 1,
    panVoices:false,
    loops: 0,
    start:0,
    end:-999999999
  }

  let PolySampler = Gibberish.PolyTemplate( Sampler, ['rate','pan','gain','start','end','loops'] ) 

  return [ Sampler, PolySampler ]
}

},{"./instrument.js":105,"genish.js":36}],113:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )
  
module.exports = function( Gibberish ) {

  let Snare = argumentProps => {
    let snare = Object.create( instrument ),
        decay = g.in( 'decay' ),
        scaledDecay = g.mul( decay, g.gen.samplerate * 2 ),
        snappy= g.in( 'snappy' ),
        tune  = g.in( 'tune' ),
        gain  = g.in( 'gain' )

    let props = Object.assign( {}, Snare.defaults, argumentProps )

    let eg = g.decay( scaledDecay, { initValue:0 } ), 
        check = g.memo( g.gt( eg, .0005 ) ),
        rnd = g.mul( g.noise(), eg ),
        hpf = g.svf( rnd, g.add( 1000, g.mul( g.add( 1, tune), 1000 ) ), .5, 1, false ),
        snap = g.gtp( g.mul( hpf, snappy ), 0 ), // rectify
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
    snappy: 1,
    decay:.1
  }

  return Snare

}

},{"./instrument.js":105,"genish.js":36}],114:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Synth = inputProps => {
    let syn = Object.create( instrument )

    let env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        loudness  = g.in( 'loudness' ), 
        glide = g.in( 'glide' ),
        slidingFreq = g.slide( frequency, glide, glide )

    let props = Object.assign( syn, Synth.defaults, inputProps )

    syn.__createGraph = function() {
      let osc = Gibberish.oscillators.factory( syn.waveform, slidingFreq, syn.antialias )

      let oscWithEnv = g.mul( g.mul( osc, env, loudness ) ),
          panner
  
      let cutoff = g.add( g.in('cutoff'), g.mul( g.in('filterMult'), env ) )
      const filteredOsc = Gibberish.filters.factory( oscWithEnv, cutoff, g.in('resonance'), g.in('saturation'), props )

      let synthWithGain = g.mul( filteredOsc, g.in( 'gain' ) )
  
      if( syn.panVoices === true ) { 
        panner = g.pan( synthWithGain, synthWithGain, g.in( 'pan' ) ) 
        syn.graph = [panner.left, panner.right]
      }else{
        syn.graph = synthWithGain
      }
    }
    
    syn.__requiresRecompilation = [ 'waveform', 'antialias', 'filterType' ]
    syn.__createGraph()

    Gibberish.factory( syn, syn.graph, 'synth', props  )

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
    panVoices:false,
    loudness:1,
    glide:1,
    saturation:1,
    filterMult:880,
    Q:8,
    cutoff:110,
    resonance:3,
    filterType:0,
    isLowPass:1
  }

  // do not include velocity, which shoudl always be per voice
  let PolySynth = Gibberish.PolyTemplate( Synth, ['frequency','attack','decay','pulsewidth','pan','gain','glide', 'saturation', 'filterMult', 'Q', 'cutoff', 'resonance'] ) 

  return [ Synth, PolySynth ]

}

},{"./instrument.js":105,"genish.js":36}],115:[function(require,module,exports){
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

},{}],116:[function(require,module,exports){
let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  let Bus = { 
    factory: null,//Gibberish.factory( g.add( 0 ) , 'bus', [ 0, 1 ]  ),

    create() {
      let bus = Object.create( ugen )
      
      bus.callback = function() {
        let output = 0
       // output[ 0 ] = output[ 1 ] = 0

        for( let i = 0, length = arguments.length; i < length; i++ ) {
          output += arguments[ i ]
          //output[ 0 ] += input
          //output[ 1 ] += input
        }

        return output
      }

      bus.id = Gibberish.factory.getUID()
      bus.dirty = true
      bus.type = 'bus'
      bus.ugenName = 'bus_' + bus.id
      bus.inputs = []
      bus.inputNames = []

      bus.chain = ( target, level = 1 ) => {
        this.connect( target, level )
        return target
      }

      bus.disconnectUgen = ( ugen ) => {
        let removeIdx = -1
        for( let i = 0; i < this.inputs.length; i++ ) {
          let input = this.inputs[ i ]

          if( isNaN( input ) && ugen === input ) {
            removeIdx = i
            break;
          }
        }
        
        if( removeIdx !== -1 ) {
          this.inputs.splice( removeIdx, 1 )
          Gibberish.dirty( this )
        }
      }
      
      return bus
    }
  }

  return Bus.create

}


},{"../ugen.js":125,"genish.js":36}],117:[function(require,module,exports){
let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

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

      bus.disconnectUgen = function( ugen ) {
        let removeIdx = this.inputs.indexOf( ugen )
        
        if( removeIdx !== -1 ) {
          this.inputs.splice( removeIdx, 1 )
          Gibberish.dirty( this )
        }
      }
      
      return bus
    }
  }

  return Bus2.create

}


},{"../ugen.js":125,"genish.js":36}],118:[function(require,module,exports){
const  g    = require( 'genish.js'  ),
       ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  const Monops = {
    export( obj ) {
      for( let key in Monops ) {
        if( key !== 'export' ) {
          obj[ key ] = Monops[ key ]
        }
      }
    },
    
    Abs( input ) {
      const abs = Object.create( ugen )
      const graph = g.abs( g.in('input') )
      
      Gibberish.factory( abs, graph, 'abs', Object.assign({}, Monops.defaults, { input }) )

      return abs
    },

    Pow( input, exponent ) {
      const pow = Object.create( ugen )
      const graph = g.pow( g.in('input'), g.in('exponent') )
      
      Gibberish.factory( pow, graph, 'abs', Object.assign({}, Monops.defaults, { input, exponent }) )

      return pow
    },

    Merge( input ) {
      const merger = Object.create( ugen )
      const cb = function( _input ) {
        return _input[0] + _input[1]
      }

      Gibberish.factory( merger, g.in( 'input' ), 'merge', { input }, cb )
      merger.type = 'analysis'
      merger.inputNames = [ 'input' ]
      merger.inputs = [ input ]
      merger.input = input
      
      return merger
    },
  }

  Monops.defaults = { input:0 }

  return Monops
}

},{"../ugen.js":125,"genish.js":36}],119:[function(require,module,exports){
let g = require( 'genish.js' )

let feedbackOsc = function( frequency, filter, pulsewidth=.5, argumentProps ) {
  if( argumentProps === undefined ) argumentProps = { type: 0 }

  let lastSample = g.history(),
      // determine phase increment and memoize result
      w = g.memo( g.div( frequency, g.gen.samplerate ) ),
      // create scaling factor
      n = g.sub( -.5, w ),
      scaling = g.mul( g.mul( 13, filter ), g.pow( n, 5 ) ),
      // calculate dc offset and normalization factors
      DC = g.sub( .376, g.mul( w, .752 ) ),
      norm = g.sub( 1, g.mul( 2, w ) ),
      // determine phase
      osc1Phase = g.accum( w, 0, { min:-1 }),
      osc1, out

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
    const lastSample2 = g.history() // for osc 2
    const lastSampleMaster = g.history() // for sum of osc1,osc2

    const osc2 = g.mul(
      g.add(
        lastSample2.out,
        g.sin(
          g.mul(
            Math.PI * 2,
            g.memo( g.add( osc1Phase, g.mul( lastSample2.out, scaling ), pulsewidth ) )
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

},{"genish.js":36}],120:[function(require,module,exports){
const g = require( 'genish.js' ),
      ugen = require( '../ugen.js' ),
      feedbackOsc = require( './fmfeedbackosc.js' )

//  __makeOscillator__( type, frequency, antialias ) {
    
module.exports = function( Gibberish ) {
  let Oscillators = {
    export( obj ) {
      for( let key in Oscillators ) {
        if( key !== 'export' ) {
          obj[ key ] = Oscillators[ key ]
        }
      }
    },

    Wavetable: require( './wavetable.js' )( Gibberish ),
    
    Square( inputProps ) {
      const sqr   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false }, Oscillators.defaults, inputProps )
      const osc   = Oscillators.factory( 'square', g.in( 'frequency' ), props.antialias )
      const graph = g.mul( osc, g.in('gain' ) )

      Gibberish.factory( sqr, graph, 'sqr', props )

      return sqr
    },

    PWM( inputProps ) {
      const pwm   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false, pulsewidth:.25 }, Oscillators.defaults, inputProps )
      const osc   = Oscillators.factory( 'pwm', g.in( 'frequency' ), props.antialias )
      const graph = g.mul( osc, g.in('gain' ) )

      Gibberish.factory( pwm, graph, 'pwm', props )

      return pwm
    },

    Sine( inputProps ) {
      const sine  = Object.create( ugen )
      const props = Object.assign({}, Oscillators.defaults, inputProps )
      const graph = g.mul( g.cycle( g.in('frequency') ), g.in('gain') )

      Gibberish.factory( sine, graph, 'sine', props )
      
      return sine
    },

    Noise( inputProps ) {
      const noise = Object.create( ugen )
      const props = Object.assign( {}, { gain: 1 }, inputProps )
      const graph = g.mul( g.noise(), g.in('gain') )
        
      Gibberish.factory( noise, graph, 'noise', props )

      return noise
    },

    Saw( inputProps ) {
      const saw   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false }, Oscillators.defaults, inputProps )
      const osc   = Oscillators.factory( 'saw', g.in( 'frequency' ), props.antialias )
      const graph = g.mul( osc, g.in('gain' ) )

      Gibberish.factory( saw, graph, 'saw', props )

      return saw
    },

    ReverseSaw( inputProps ) {
      const saw   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false }, Oscillators.defaults, inputProps )
      const osc   = g.sub( 1, Oscillators.factory( 'saw', g.in( 'frequency' ), props.antialias ) )
      const graph = g.mul( osc, g.in( 'gain' ) )

      Gibberish.factory( saw, graph, 'rsaw', props )
      
      return saw
    },

    factory( type, frequency, antialias=false ) {
      let osc

      switch( type ) {
        case 'saw':
          if( antialias === false ) {
            osc = g.phasor( frequency )
          }else{
            osc = feedbackOsc( frequency, 1 )
          }
          break;
        case 'square':
          if( antialias === true ) {
            osc = feedbackOsc( frequency, 1, .5, { type:1 })
          }else{
            osc = g.wavetable( frequency, { buffer:Oscillators.Square.buffer, name:'square' } )
          }
          break;
        case 'sine':
          osc = g.cycle( frequency )
          break;
        case 'pwm':
          let pulsewidth = g.in('pulsewidth')
          if( antialias === true ) {
            osc = feedbackOsc( frequency, 1, pulsewidth, { type:1 })
          }else{
            let phase = g.phasor( frequency, 0, { min:0 } )
            osc = g.lt( phase, pulsewidth )
          }
          break;
      }

      return osc
    }
  }

  Oscillators.Square.buffer = new Float32Array( 1024 )

  for( let i = 1023; i >= 0; i-- ) { 
    Oscillators.Square.buffer [ i ] = i / 1024 > .5 ? 1 : -1
  }

  Oscillators.defaults = {
    frequency: 440,
    gain: 1
  }

  return Oscillators

}

},{"../ugen.js":125,"./fmfeedbackosc.js":119,"./wavetable.js":121,"genish.js":36}],121:[function(require,module,exports){
let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  const Wavetable = function( inputProps ) {
    const wavetable = Object.create( ugen )
    const props  = Object.assign({}, Gibberish.oscillators.defaults, inputProps )
    const osc = g.wavetable( g.in('frequency'), props )
    const graph = g.mul( 
      osc, 
      g.in( 'gain' )
    )

    Gibberish.factory( wavetable, graph, 'wavetable', props )

    return wavetable
  }

  g.wavetable = function( frequency, props ) {
    let dataProps = { immutable:true }

    // use global references if applicable
    if( props.name !== undefined ) dataProps.global = props.name

    const buffer = g.data( props.buffer, 1, dataProps )

    return g.peek( buffer, g.phasor( frequency, 0, { min:0 } ) )
  }

  return Wavetable
}

},{"../ugen.js":125,"genish.js":36}],122:[function(require,module,exports){
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

  clear() {
    this.queue.data.length = 0
    this.queue.length = 0
  },

  add( time, func, priority = 0 ) {
    time += this.phase

    this.queue.push({ time, func, priority })
  },

  tick() {
    if( this.queue.length ) {
      let next = this.queue.peek()

      while( this.phase >= next.time ) {
        next.func()
        this.queue.pop()
        next = this.queue.peek()
      }

    }

    this.phase++
  },
}

module.exports = Scheduler

},{"../external/priorityqueue.js":80,"big.js":128}],123:[function(require,module,exports){
const g = require( 'genish.js' ),
      ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {
  const __proto__ = Object.create( ugen )

  Object.assign( __proto__, {
    start() {
      this.connect()
      return this
    },
    stop() {
      this.disconnect()
      return this
    }
  })

  const Seq2 = { 
    create( inputProps ) {
      const seq = Object.create( __proto__ ),
            props = Object.assign({}, Seq2.defaults, inputProps )

      seq.phase = 0
      seq.inputNames = [ 'rate' ]
      seq.inputs = [ 1 ]
      seq.nextTime = 0
      seq.valuesPhase = 0
      seq.timingsPhase = 0
      seq.id = Gibberish.factory.getUID()
      seq.dirty = true
      seq.type = 'seq'

      if( props.target === undefined ) {
        seq.anonFunction = true
      }else{ 
        seq.anonFunction = false
        seq.callFunction = typeof props.target[ props.key ] === 'function'
      }

      Object.assign( seq, props )

      seq.callback = function( rate ) {
        if( seq.phase >= seq.nextTime ) {
          let value = seq.values[ seq.valuesPhase++ % seq.values.length ]

          if( seq.anonFunction || typeof value === 'function' ) value = value()
          
          if( seq.anonFunction === false ) {
            if( seq.callFunction === false ) {
              seq.target[ seq.key ] = value
            }else{
              seq.target[ seq.key ]( value ) 
            }
          }

          seq.phase -= seq.nextTime

          let timing = seq.timings[ seq.timingsPhase++ % seq.timings.length ]
          if( typeof timing === 'function' ) timing = timing()

          seq.nextTime = timing
        }

        seq.phase += rate

        return 0
      }

      seq.ugenName = seq.callback.ugenName = 'seq_' + seq.id
      
      let value = seq.rate
      Object.defineProperty( seq, 'rate', {
        get() { return value },
        set( v ) {
          if( value !== v ) {
            Gibberish.dirty( seq )
            value = v
          }
        }
      })

      return seq
    }
  }

  Seq2.defaults = { rate: 1 }

  return Seq2.create

}


},{"../ugen.js":125,"genish.js":36}],124:[function(require,module,exports){
const Queue = require( '../external/priorityqueue.js' )
const Big   = require( 'big.js' )

module.exports = function( Gibberish ) {

let Sequencer = props => {
  let seq = {
    __isRunning:false,
    key: props.key, 
    target:  props.target,
    values:  props.values,
    timings: props.timings,
    __valuesPhase:  0,
    __timingsPhase: 0,
    priority: props.priority === undefined ? 0 : props.priority,

    tick() {
      let value  = seq.values[  seq.__valuesPhase++  % seq.values.length  ],
          timing = seq.timings[ seq.__timingsPhase++ % seq.timings.length ]

      if( typeof timing === 'function' ) timing = timing()

      if( typeof value === 'function' && seq.target === undefined ) {
        value()
      }else if( typeof seq.target[ seq.key ] === 'function' ) {
        if( typeof value === 'function' ) value = value()
        seq.target[ seq.key ]( value )
      }else{
        if( typeof value === 'function' ) value = value()
        seq.target[ seq.key ] = value
      }
      
      if( seq.__isRunning === true ) {
        Gibberish.scheduler.add( timing, seq.tick, seq.priority )
      }
    },

    start( delay = 0 ) {
      seq.__isRunning = true
      Gibberish.scheduler.add( delay, seq.tick, seq.priority )
      return seq
    },

    stop() {
      seq.__isRunning = false
      return seq
    }
  }

  return seq 
}

Sequencer.make = function( values, timings, target, key ) {
  return Sequencer({ values, timings, target, key })
}

return Sequencer

}

},{"../external/priorityqueue.js":80,"big.js":128}],125:[function(require,module,exports){
let ugen = {
  free() {
    Gibberish.genish.gen.free( this.graph )
  },

  print() {
    console.log( this.callback.toString() )
  },

  connect( target, level=1 ) {
    if( this.connected === undefined ) this.connected = []

    let input = level === 1 ? this : Gibberish.binops.Mul( this, level )

    if( target === undefined || target === null ) target = Gibberish.output 

    if( target.inputs )
      target.inputs.push( input )
    else
      target.input = input

    Gibberish.dirty( target )

    this.connected.push([ target, input ])
    
    return this
  },

  disconnect( target ) {
    if( target === undefined ){
      for( let connection of this.connected ) {
        connection[0].disconnectUgen( connection[1] )
      }
      this.connected.length = 0
    }else{
      const connection = this.connected.find( v => v[0] === target )
      target.disconnectUgen( connection[1] )
      const targetIdx = this.connected.indexOf( connection )
      this.connected.splice( targetIdx, 1 )
    }
  },

  chain( target, level=1 ) {
    this.connect( target,level )

    return target
  },

  __redoGraph() {
    this.__createGraph()
    this.callback = Gibberish.genish.gen.createCallback( this.graph, Gibberish.memory, false, true )
    this.inputNames = Gibberish.genish.gen.parameters.slice(0)
    this.callback.ugenName = this.ugenName
  },
}

module.exports = ugen

},{}],126:[function(require,module,exports){
module.exports = function( Gibberish ) {
  let uid = 0

  let factory = function( ugen, graph, name, values, cb ) {
    ugen.callback = cb === undefined ? Gibberish.genish.gen.createCallback( graph, Gibberish.memory, false, true ) : cb

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
      if( param === 'memory' ) continue

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

    if( ugen.__requiresRecompilation !== undefined ) {
      ugen.__requiresRecompilation.forEach( prop => {
        let value = ugen[ prop ]
        Object.defineProperty( ugen, prop, {
          get() { return value },
          set( v ) {
            if( value !== v ) {
              value = v
              this.__redoGraph()
            }
          }
        })
      })      
    }
    return ugen
  }

  factory.getUID = () => uid++

  return factory
}

},{}],127:[function(require,module,exports){
let genish = require( 'genish.js' )

module.exports = function( Gibberish ) {

let utilities = {
  createContext() {
    let AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext
    Gibberish.ctx = new AC()
    genish.gen.samplerate = Gibberish.ctx.sampleRate
    genish.utilities.ctx = Gibberish.ctx

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

    return Gibberish.ctx
  },

  createScriptProcessor() {
    Gibberish.node = Gibberish.ctx.createScriptProcessor( 1024, 0, 2 ),
    Gibberish.clearFunction = function() { return 0 },
    Gibberish.callback = Gibberish.clearFunction

    Gibberish.node.onaudioprocess = function( audioProcessingEvent ) {
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
        }
        
        // XXX cant use destructuring, babel makes it something inefficient...
        let out = callback.apply( null, gibberish.callbackUgens )

        left[ sample  ] = out[0]
        right[ sample ] = out[1]
      }
    }

    Gibberish.node.connect( Gibberish.ctx.destination )

    return Gibberish.node
  }, 
}

return utilities
}

},{"genish.js":36}],128:[function(require,module,exports){
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

},{}]},{},[100])(100)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2Ficy5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvYWNjdW0uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2Fjb3MuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2FkLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9hZGQuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2Fkc3IuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2FuZC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvYXNpbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvYXRhbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvYXR0YWNrLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9iYW5nLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9ib29sLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9jZWlsLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9jbGFtcC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvY29zLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9jb3VudGVyLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9jeWNsZS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZGF0YS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZGNibG9jay5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZGVjYXkuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2RlbGF5LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9kZWx0YS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZGl2LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9lbnYuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2VxLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9mbG9vci5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZm9sZC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZ2F0ZS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZ2VuLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9ndC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvZ3RlLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9ndHAuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2hpc3RvcnkuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2lmZWxzZWlmLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9pbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvaW5kZXguanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2x0LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9sdGUuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L2x0cC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvbWF4LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9tZW1vLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9taW4uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L21peC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvbW9kLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9tc3Rvc2FtcHMuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L210b2YuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L211bC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvbmVxLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9ub2lzZS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvbm90LmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9wYW4uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3BhcmFtLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9wZWVrLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC9waGFzb3IuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3Bva2UuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3Bvdy5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvcmF0ZS5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvcm91bmQuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3NhaC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvc2VsZWN0b3IuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3NpZ24uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3Npbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvc2xpZGUuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3N1Yi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvc3dpdGNoLmpzIiwiLi4vLi4vVXNlcnMvY2hhcmxpZS9Eb2N1bWVudHMvY29kZS9nZW5pc2guanMvZGlzdC90NjAuanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3Rhbi5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvdGFuaC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3QvdHJhaW4uanMiLCIuLi8uLi9Vc2Vycy9jaGFybGllL0RvY3VtZW50cy9jb2RlL2dlbmlzaC5qcy9kaXN0L3V0aWxpdGllcy5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvd2luZG93cy5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvZ2VuaXNoLmpzL2Rpc3Qvd3JhcC5qcyIsIi4uLy4uL1VzZXJzL2NoYXJsaWUvRG9jdW1lbnRzL2NvZGUvbWVtb3J5LWhlbHBlci9pbmRleC50cmFuc3BpbGVkLmpzIiwianMvYW5hbHlzaXMvYW5hbHl6ZXIuanMiLCJqcy9hbmFseXNpcy9zaW5nbGVzYW1wbGVkZWxheS5qcyIsImpzL2VudmVsb3Blcy9hZC5qcyIsImpzL2VudmVsb3Blcy9hZHNyLmpzIiwianMvZW52ZWxvcGVzL2VudmVsb3Blcy5qcyIsImpzL2VudmVsb3Blcy9yYW1wLmpzIiwianMvZXh0ZXJuYWwvcHJpb3JpdHlxdWV1ZS5qcyIsImpzL2ZpbHRlcnMvYWxscGFzcy5qcyIsImpzL2ZpbHRlcnMvYmlxdWFkLmpzIiwianMvZmlsdGVycy9jb21iZmlsdGVyLmpzIiwianMvZmlsdGVycy9kaW9kZUZpbHRlclpERi5qcyIsImpzL2ZpbHRlcnMvZmlsdGVyLmpzIiwianMvZmlsdGVycy9maWx0ZXIyNC5qcyIsImpzL2ZpbHRlcnMvZmlsdGVycy5qcyIsImpzL2ZpbHRlcnMvbGFkZGVyRmlsdGVyWmVyb0RlbGF5LmpzIiwianMvZmlsdGVycy9zdmYuanMiLCJqcy9meC9iaXRjcnVzaGVyLmpzIiwianMvZngvYnVmZmVyU2h1ZmZsZXIuanMiLCJqcy9meC9kZWxheS5qcyIsImpzL2Z4L2VmZmVjdC5qcyIsImpzL2Z4L2VmZmVjdHMuanMiLCJqcy9meC9mbGFuZ2VyLmpzIiwianMvZngvZnJlZXZlcmIuanMiLCJqcy9meC9yaW5nbW9kLmpzIiwianMvZngvdHJlbW9sby5qcyIsImpzL2Z4L3ZpYnJhdG8uanMiLCJqcy9pbmRleC5qcyIsImpzL2luc3RydW1lbnRzL2NvbmdhLmpzIiwianMvaW5zdHJ1bWVudHMvY293YmVsbC5qcyIsImpzL2luc3RydW1lbnRzL2ZtLmpzIiwianMvaW5zdHJ1bWVudHMvaGF0LmpzIiwianMvaW5zdHJ1bWVudHMvaW5zdHJ1bWVudC5qcyIsImpzL2luc3RydW1lbnRzL2luc3RydW1lbnRzLmpzIiwianMvaW5zdHJ1bWVudHMva2FycGx1c3N0cm9uZy5qcyIsImpzL2luc3RydW1lbnRzL2tpY2suanMiLCJqcy9pbnN0cnVtZW50cy9tb25vc3ludGguanMiLCJqcy9pbnN0cnVtZW50cy9wb2x5TWl4aW4uanMiLCJqcy9pbnN0cnVtZW50cy9wb2x5dGVtcGxhdGUuanMiLCJqcy9pbnN0cnVtZW50cy9zYW1wbGVyLmpzIiwianMvaW5zdHJ1bWVudHMvc25hcmUuanMiLCJqcy9pbnN0cnVtZW50cy9zeW50aC5qcyIsImpzL21pc2MvYmlub3BzLmpzIiwianMvbWlzYy9idXMuanMiLCJqcy9taXNjL2J1czIuanMiLCJqcy9taXNjL21vbm9wcy5qcyIsImpzL29zY2lsbGF0b3JzL2ZtZmVlZGJhY2tvc2MuanMiLCJqcy9vc2NpbGxhdG9ycy9vc2NpbGxhdG9ycy5qcyIsImpzL29zY2lsbGF0b3JzL3dhdmV0YWJsZS5qcyIsImpzL3NjaGVkdWxpbmcvc2NoZWR1bGVyLmpzIiwianMvc2NoZWR1bGluZy9zZXEyLmpzIiwianMvc2NoZWR1bGluZy9zZXF1ZW5jZXIuanMiLCJqcy91Z2VuLmpzIiwianMvdWdlblRlbXBsYXRlLmpzIiwianMvdXRpbGl0aWVzLmpzIiwibm9kZV9tb2R1bGVzL2JpZy5qcy9iaWcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25YQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdhYnMnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCBNYXRoLmFicykpO1xuXG4gICAgICBvdXQgPSAnZ2VuLmFicyggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYWJzKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgYWJzID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgYWJzLmlucHV0cyA9IFt4XTtcblxuICByZXR1cm4gYWJzO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2FjY3VtJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgY29kZSA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keSA9IHZvaWQgMDtcblxuICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSk7XG5cbiAgICBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF0gPSB0aGlzLmluaXRpYWxWYWx1ZTtcblxuICAgIGZ1bmN0aW9uQm9keSA9IHRoaXMuY2FsbGJhY2soZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sICdtZW1vcnlbJyArIHRoaXMubWVtb3J5LnZhbHVlLmlkeCArICddJyk7XG5cbiAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sIHRoaXMubmFtZSwgdGhpcykpO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJztcblxuICAgIHJldHVybiBbdGhpcy5uYW1lICsgJ192YWx1ZScsIGZ1bmN0aW9uQm9keV07XG4gIH0sXG4gIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhfbmFtZSwgX2luY3IsIF9yZXNldCwgdmFsdWVSZWYpIHtcbiAgICB2YXIgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJyc7XG5cbiAgICAvKiB0aHJlZSBkaWZmZXJlbnQgbWV0aG9kcyBvZiB3cmFwcGluZywgdGhpcmQgaXMgbW9zdCBleHBlbnNpdmU6XG4gICAgICpcbiAgICAgKiAxOiByYW5nZSB7MCwxfTogeSA9IHggLSAoeCB8IDApXG4gICAgICogMjogbG9nMih0aGlzLm1heCkgPT0gaW50ZWdlcjogeSA9IHggJiAodGhpcy5tYXggLSAxKVxuICAgICAqIDM6IGFsbCBvdGhlcnM6IGlmKCB4ID49IHRoaXMubWF4ICkgeSA9IHRoaXMubWF4IC14XG4gICAgICpcbiAgICAgKi9cblxuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiAoISh0eXBlb2YgdGhpcy5pbnB1dHNbMV0gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzFdIDwgMSkpIHtcbiAgICAgIG91dCArPSAnICBpZiggJyArIF9yZXNldCArICcgPj0xICkgJyArIHZhbHVlUmVmICsgJyA9ICcgKyB0aGlzLm1pbiArICdcXG5cXG4nO1xuICAgIH1cblxuICAgIG91dCArPSAnICB2YXIgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgdmFsdWVSZWYgKyAnO1xcbic7XG5cbiAgICBpZiAodGhpcy5zaG91bGRXcmFwID09PSBmYWxzZSAmJiB0aGlzLnNob3VsZENsYW1wID09PSB0cnVlKSB7XG4gICAgICBvdXQgKz0gJyAgaWYoICcgKyB2YWx1ZVJlZiArICcgPCAnICsgdGhpcy5tYXggKyAnICkgJyArIHZhbHVlUmVmICsgJyArPSAnICsgX2luY3IgKyAnXFxuJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9ICcgICcgKyB2YWx1ZVJlZiArICcgKz0gJyArIF9pbmNyICsgJ1xcbic7IC8vIHN0b3JlIG91dHB1dCB2YWx1ZSBiZWZvcmUgYWNjdW11bGF0aW5nXG4gICAgfVxuXG4gICAgaWYgKHRoaXMubWF4ICE9PSBJbmZpbml0eSAmJiB0aGlzLnNob3VsZFdyYXApIHdyYXAgKz0gJyAgaWYoICcgKyB2YWx1ZVJlZiArICcgPj0gJyArIHRoaXMubWF4ICsgJyApICcgKyB2YWx1ZVJlZiArICcgLT0gJyArIGRpZmYgKyAnXFxuJztcbiAgICBpZiAodGhpcy5taW4gIT09IC1JbmZpbml0eSAmJiB0aGlzLnNob3VsZFdyYXApIHdyYXAgKz0gJyAgaWYoICcgKyB2YWx1ZVJlZiArICcgPCAnICsgdGhpcy5taW4gKyAnICkgJyArIHZhbHVlUmVmICsgJyArPSAnICsgZGlmZiArICdcXG5cXG4nO1xuXG4gICAgLy9pZiggdGhpcy5taW4gPT09IDAgJiYgdGhpcy5tYXggPT09IDEgKSB7XG4gICAgLy8gIHdyYXAgPSAgYCAgJHt2YWx1ZVJlZn0gPSAke3ZhbHVlUmVmfSAtICgke3ZhbHVlUmVmfSB8IDApXFxuXFxuYFxuICAgIC8vfSBlbHNlIGlmKCB0aGlzLm1pbiA9PT0gMCAmJiAoIE1hdGgubG9nMiggdGhpcy5tYXggKSB8IDAgKSA9PT0gTWF0aC5sb2cyKCB0aGlzLm1heCApICkge1xuICAgIC8vICB3cmFwID0gIGAgICR7dmFsdWVSZWZ9ID0gJHt2YWx1ZVJlZn0gJiAoJHt0aGlzLm1heH0gLSAxKVxcblxcbmBcbiAgICAvL30gZWxzZSBpZiggdGhpcy5tYXggIT09IEluZmluaXR5ICl7XG4gICAgLy8gIHdyYXAgPSBgICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gKSAke3ZhbHVlUmVmfSAtPSAke2RpZmZ9XFxuXFxuYFxuICAgIC8vfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcDtcblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluY3IpIHtcbiAgdmFyIHJlc2V0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1sxXTtcbiAgdmFyIHByb3BlcnRpZXMgPSBhcmd1bWVudHNbMl07XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGRlZmF1bHRzID0geyBtaW46IDAsIG1heDogMSwgc2hvdWxkV3JhcDogdHJ1ZSwgc2hvdWxkQ2xhbXA6IGZhbHNlIH07XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgcHJvcGVydGllcyk7XG5cbiAgaWYgKGRlZmF1bHRzLmluaXRpYWxWYWx1ZSA9PT0gdW5kZWZpbmVkKSBkZWZhdWx0cy5pbml0aWFsVmFsdWUgPSBkZWZhdWx0cy5taW47XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgbWluOiBkZWZhdWx0cy5taW4sXG4gICAgbWF4OiBkZWZhdWx0cy5tYXgsXG4gICAgaW5pdGlhbDogZGVmYXVsdHMuaW5pdGlhbFZhbHVlLFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbmNyLCByZXNldF0sXG4gICAgbWVtb3J5OiB7XG4gICAgICB2YWx1ZTogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9XG4gICAgfVxuICB9LCBkZWZhdWx0cyk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF07XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgICBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF0gPSB2O1xuICAgIH1cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnYWNvcycsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoeyAnYWNvcyc6IE1hdGguYWNvcyB9KTtcblxuICAgICAgb3V0ID0gJ2dlbi5hY29zKCAnICsgaW5wdXRzWzBdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hY29zKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgYWNvcyA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGFjb3MuaW5wdXRzID0gW3hdO1xuICBhY29zLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgYWNvcy5uYW1lID0gYWNvcy5iYXNlbmFtZSArICd7YWNvcy5pZH0nO1xuXG4gIHJldHVybiBhY29zO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBkaXYgPSByZXF1aXJlKCcuL2Rpdi5qcycpLFxuICAgIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgYWNjdW0gPSByZXF1aXJlKCcuL2FjY3VtLmpzJyksXG4gICAgaWZlbHNlID0gcmVxdWlyZSgnLi9pZmVsc2VpZi5qcycpLFxuICAgIGx0ID0gcmVxdWlyZSgnLi9sdC5qcycpLFxuICAgIGJhbmcgPSByZXF1aXJlKCcuL2JhbmcuanMnKSxcbiAgICBlbnYgPSByZXF1aXJlKCcuL2Vudi5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpLFxuICAgIG5lcSA9IHJlcXVpcmUoJy4vbmVxLmpzJyksXG4gICAgYW5kID0gcmVxdWlyZSgnLi9hbmQuanMnKSxcbiAgICBndGUgPSByZXF1aXJlKCcuL2d0ZS5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhdHRhY2tUaW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gNDQxMDAgOiBhcmd1bWVudHNbMF07XG4gIHZhciBkZWNheVRpbWUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyA0NDEwMCA6IGFyZ3VtZW50c1sxXTtcbiAgdmFyIF9wcm9wcyA9IGFyZ3VtZW50c1syXTtcblxuICB2YXIgX2JhbmcgPSBiYW5nKCksXG4gICAgICBwaGFzZSA9IGFjY3VtKDEsIF9iYW5nLCB7IG1heDogSW5maW5pdHksIHNob3VsZFdyYXA6IGZhbHNlLCBpbml0aWFsVmFsdWU6IC1JbmZpbml0eSB9KSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBzaGFwZTogJ2V4cG9uZW50aWFsJywgYWxwaGE6IDUgfSwgX3Byb3BzKSxcbiAgICAgIGJ1ZmZlckRhdGEgPSB2b2lkIDAsXG4gICAgICBkZWNheURhdGEgPSB2b2lkIDAsXG4gICAgICBvdXQgPSB2b2lkIDAsXG4gICAgICBidWZmZXIgPSB2b2lkIDA7XG5cbiAgLy9jb25zb2xlLmxvZyggJ2F0dGFjayB0aW1lOicsIGF0dGFja1RpbWUsICdkZWNheSB0aW1lOicsIGRlY2F5VGltZSApXG4gIHZhciBjb21wbGV0ZUZsYWcgPSBkYXRhKFswXSk7XG5cbiAgLy8gc2xpZ2h0bHkgbW9yZSBlZmZpY2llbnQgdG8gdXNlIGV4aXN0aW5nIHBoYXNlIGFjY3VtdWxhdG9yIGZvciBsaW5lYXIgZW52ZWxvcGVzXG4gIGlmIChwcm9wcy5zaGFwZSA9PT0gJ2xpbmVhcicpIHtcbiAgICBvdXQgPSBpZmVsc2UoYW5kKGd0ZShwaGFzZSwgMCksIGx0KHBoYXNlLCBhdHRhY2tUaW1lKSksIG1lbW8oZGl2KHBoYXNlLCBhdHRhY2tUaW1lKSksIGFuZChndGUocGhhc2UsIDApLCBsdChwaGFzZSwgYWRkKGF0dGFja1RpbWUsIGRlY2F5VGltZSkpKSwgc3ViKDEsIGRpdihzdWIocGhhc2UsIGF0dGFja1RpbWUpLCBkZWNheVRpbWUpKSwgbmVxKHBoYXNlLCAtSW5maW5pdHkpLCBwb2tlKGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6IDAgfSksIDApO1xuICB9IGVsc2Uge1xuICAgIGJ1ZmZlckRhdGEgPSBlbnYoMTAyNCwgeyB0eXBlOiBwcm9wcy5zaGFwZSwgYWxwaGE6IHByb3BzLmFscGhhIH0pO1xuICAgIG91dCA9IGlmZWxzZShhbmQoZ3RlKHBoYXNlLCAwKSwgbHQocGhhc2UsIGF0dGFja1RpbWUpKSwgcGVlayhidWZmZXJEYXRhLCBkaXYocGhhc2UsIGF0dGFja1RpbWUpLCB7IGJvdW5kbW9kZTogJ2NsYW1wJyB9KSwgYW5kKGd0ZShwaGFzZSwgMCksIGx0KHBoYXNlLCBhZGQoYXR0YWNrVGltZSwgZGVjYXlUaW1lKSkpLCBwZWVrKGJ1ZmZlckRhdGEsIHN1YigxLCBkaXYoc3ViKHBoYXNlLCBhdHRhY2tUaW1lKSwgZGVjYXlUaW1lKSksIHsgYm91bmRtb2RlOiAnY2xhbXAnIH0pLCBuZXEocGhhc2UsIC1JbmZpbml0eSksIHBva2UoY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTogMCB9KSwgMCk7XG4gIH1cblxuICBvdXQuaXNDb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwW2NvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeF07XG4gIH07XG5cbiAgb3V0LnRyaWdnZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgZ2VuLm1lbW9yeS5oZWFwW2NvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeF0gPSAwO1xuICAgIF9iYW5nLnRyaWdnZXIoKTtcbiAgfTtcblxuICByZXR1cm4gb3V0O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciBhZGQgPSB7XG4gICAgaWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgICAgb3V0ID0gJygnLFxuICAgICAgICAgIHN1bSA9IDAsXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGFkZGVyQXRFbmQgPSBmYWxzZSxcbiAgICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IHRydWU7XG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICAgIGlmIChpc05hTih2KSkge1xuICAgICAgICAgIG91dCArPSB2O1xuICAgICAgICAgIGlmIChpIDwgaW5wdXRzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGFkZGVyQXRFbmQgPSB0cnVlO1xuICAgICAgICAgICAgb3V0ICs9ICcgKyAnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1bSArPSBwYXJzZUZsb2F0KHYpO1xuICAgICAgICAgIG51bUNvdW50Kys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoYWxyZWFkeUZ1bGxTdW1tZWQpIG91dCA9ICcnO1xuXG4gICAgICBpZiAobnVtQ291bnQgPiAwKSB7XG4gICAgICAgIG91dCArPSBhZGRlckF0RW5kIHx8IGFscmVhZHlGdWxsU3VtbWVkID8gc3VtIDogJyArICcgKyBzdW07XG4gICAgICB9XG5cbiAgICAgIGlmICghYWxyZWFkeUZ1bGxTdW1tZWQpIG91dCArPSAnKSc7XG5cbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBhZGQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIGRpdiA9IHJlcXVpcmUoJy4vZGl2LmpzJyksXG4gICAgZGF0YSA9IHJlcXVpcmUoJy4vZGF0YS5qcycpLFxuICAgIHBlZWsgPSByZXF1aXJlKCcuL3BlZWsuanMnKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoJy4vYWNjdW0uanMnKSxcbiAgICBpZmVsc2UgPSByZXF1aXJlKCcuL2lmZWxzZWlmLmpzJyksXG4gICAgbHQgPSByZXF1aXJlKCcuL2x0LmpzJyksXG4gICAgYmFuZyA9IHJlcXVpcmUoJy4vYmFuZy5qcycpLFxuICAgIGVudiA9IHJlcXVpcmUoJy4vZW52LmpzJyksXG4gICAgcGFyYW0gPSByZXF1aXJlKCcuL3BhcmFtLmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBndHAgPSByZXF1aXJlKCcuL2d0cC5qcycpLFxuICAgIG5vdCA9IHJlcXVpcmUoJy4vbm90LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYXR0YWNrVGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDQ0IDogYXJndW1lbnRzWzBdO1xuICB2YXIgZGVjYXlUaW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMjIwNTAgOiBhcmd1bWVudHNbMV07XG4gIHZhciBzdXN0YWluVGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IDQ0MTAwIDogYXJndW1lbnRzWzJdO1xuICB2YXIgc3VzdGFpbkxldmVsID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8gLjYgOiBhcmd1bWVudHNbM107XG4gIHZhciByZWxlYXNlVGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gNCB8fCBhcmd1bWVudHNbNF0gPT09IHVuZGVmaW5lZCA/IDQ0MTAwIDogYXJndW1lbnRzWzRdO1xuICB2YXIgX3Byb3BzID0gYXJndW1lbnRzWzVdO1xuXG4gIHZhciBlbnZUcmlnZ2VyID0gYmFuZygpLFxuICAgICAgcGhhc2UgPSBhY2N1bSgxLCBlbnZUcmlnZ2VyLCB7IG1heDogSW5maW5pdHksIHNob3VsZFdyYXA6IGZhbHNlIH0pLFxuICAgICAgc2hvdWxkU3VzdGFpbiA9IHBhcmFtKDEpLFxuICAgICAgZGVmYXVsdHMgPSB7XG4gICAgc2hhcGU6ICdleHBvbmVudGlhbCcsXG4gICAgYWxwaGE6IDUsXG4gICAgdHJpZ2dlclJlbGVhc2U6IGZhbHNlXG4gIH0sXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBfcHJvcHMpLFxuICAgICAgYnVmZmVyRGF0YSA9IHZvaWQgMCxcbiAgICAgIGRlY2F5RGF0YSA9IHZvaWQgMCxcbiAgICAgIG91dCA9IHZvaWQgMCxcbiAgICAgIGJ1ZmZlciA9IHZvaWQgMCxcbiAgICAgIHN1c3RhaW5Db25kaXRpb24gPSB2b2lkIDAsXG4gICAgICByZWxlYXNlQWNjdW0gPSB2b2lkIDAsXG4gICAgICByZWxlYXNlQ29uZGl0aW9uID0gdm9pZCAwO1xuXG4gIC8vIHNsaWdodGx5IG1vcmUgZWZmaWNpZW50IHRvIHVzZSBleGlzdGluZyBwaGFzZSBhY2N1bXVsYXRvciBmb3IgbGluZWFyIGVudmVsb3Blc1xuICAvL2lmKCBwcm9wcy5zaGFwZSA9PT0gJ2xpbmVhcicgKSB7XG4gIC8vICBvdXQgPSBpZmVsc2UoXG4gIC8vICAgIGx0KCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSApLCBtZW1vKCBkaXYoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICkgKSxcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICsgcHJvcHMuZGVjYXlUaW1lICksIHN1YiggMSwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKSwgcHJvcHMuZGVjYXlUaW1lICksIDEtcHJvcHMuc3VzdGFpbkxldmVsICkgKSxcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICsgcHJvcHMuZGVjYXlUaW1lICsgcHJvcHMuc3VzdGFpblRpbWUgKSxcbiAgLy8gICAgICBwcm9wcy5zdXN0YWluTGV2ZWwsXG4gIC8vICAgIGx0KCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSArIHByb3BzLmRlY2F5VGltZSArIHByb3BzLnN1c3RhaW5UaW1lICsgcHJvcHMucmVsZWFzZVRpbWUgKSxcbiAgLy8gICAgICBzdWIoIHByb3BzLnN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKyBwcm9wcy5kZWNheVRpbWUgKyBwcm9wcy5zdXN0YWluVGltZSApLCBwcm9wcy5yZWxlYXNlVGltZSApLCBwcm9wcy5zdXN0YWluTGV2ZWwpICksXG4gIC8vICAgIDBcbiAgLy8gIClcbiAgLy99IGVsc2UgeyAgICBcbiAgYnVmZmVyRGF0YSA9IGVudigxMDI0LCB7IHR5cGU6IHByb3BzLnNoYXBlLCBhbHBoYTogcHJvcHMuYWxwaGEgfSk7XG5cbiAgc3VzdGFpbkNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlID8gc2hvdWxkU3VzdGFpbiA6IGx0KHBoYXNlLCBhZGQoYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSkpO1xuXG4gIHJlbGVhc2VBY2N1bSA9IHByb3BzLnRyaWdnZXJSZWxlYXNlID8gZ3RwKHN1YihzdXN0YWluTGV2ZWwsIGFjY3VtKGRpdihzdXN0YWluTGV2ZWwsIHJlbGVhc2VUaW1lKSwgMCwgeyBzaG91bGRXcmFwOiBmYWxzZSB9KSksIDApIDogc3ViKHN1c3RhaW5MZXZlbCwgbXVsKGRpdihzdWIocGhhc2UsIGFkZChhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lKSksIHJlbGVhc2VUaW1lKSwgc3VzdGFpbkxldmVsKSksIHJlbGVhc2VDb25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZSA/IG5vdChzaG91bGRTdXN0YWluKSA6IGx0KHBoYXNlLCBhZGQoYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSwgcmVsZWFzZVRpbWUpKTtcblxuICBvdXQgPSBpZmVsc2UoXG4gIC8vIGF0dGFja1xuICBsdChwaGFzZSwgYXR0YWNrVGltZSksIHBlZWsoYnVmZmVyRGF0YSwgZGl2KHBoYXNlLCBhdHRhY2tUaW1lKSwgeyBib3VuZG1vZGU6ICdjbGFtcCcgfSksXG5cbiAgLy8gZGVjYXlcbiAgbHQocGhhc2UsIGFkZChhdHRhY2tUaW1lLCBkZWNheVRpbWUpKSwgcGVlayhidWZmZXJEYXRhLCBzdWIoMSwgbXVsKGRpdihzdWIocGhhc2UsIGF0dGFja1RpbWUpLCBkZWNheVRpbWUpLCBzdWIoMSwgc3VzdGFpbkxldmVsKSkpLCB7IGJvdW5kbW9kZTogJ2NsYW1wJyB9KSxcblxuICAvLyBzdXN0YWluXG4gIHN1c3RhaW5Db25kaXRpb24sIHBlZWsoYnVmZmVyRGF0YSwgc3VzdGFpbkxldmVsKSxcblxuICAvLyByZWxlYXNlXG4gIHJlbGVhc2VDb25kaXRpb24sIC8vbHQoIHBoYXNlLCAgYXR0YWNrVGltZSArICBkZWNheVRpbWUgKyAgc3VzdGFpblRpbWUgKyAgcmVsZWFzZVRpbWUgKSxcbiAgcGVlayhidWZmZXJEYXRhLCByZWxlYXNlQWNjdW0sXG4gIC8vc3ViKCAgc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lKSwgIHJlbGVhc2VUaW1lICksICBzdXN0YWluTGV2ZWwgKSApLFxuICB7IGJvdW5kbW9kZTogJ2NsYW1wJyB9KSwgMCk7XG4gIC8vfVxuXG4gIG91dC50cmlnZ2VyID0gZnVuY3Rpb24gKCkge1xuICAgIHNob3VsZFN1c3RhaW4udmFsdWUgPSAxO1xuICAgIGVudlRyaWdnZXIudHJpZ2dlcigpO1xuICB9O1xuXG4gIG91dC5yZWxlYXNlID0gZnVuY3Rpb24gKCkge1xuICAgIHNob3VsZFN1c3RhaW4udmFsdWUgPSAwO1xuICAgIC8vIFhYWCBwcmV0dHkgbmFzdHkuLi4gZ3JhYnMgYWNjdW0gaW5zaWRlIG9mIGd0cCBhbmQgcmVzZXRzIHZhbHVlIG1hbnVhbGx5XG4gICAgLy8gdW5mb3J0dW5hdGVseSBlbnZUcmlnZ2VyIHdvbid0IHdvcmsgYXMgaXQncyBiYWNrIHRvIDAgYnkgdGhlIHRpbWUgdGhlIHJlbGVhc2UgYmxvY2sgaXMgdHJpZ2dlcmVkLi4uXG4gICAgZ2VuLm1lbW9yeS5oZWFwW3JlbGVhc2VBY2N1bS5pbnB1dHNbMF0uaW5wdXRzWzFdLm1lbW9yeS52YWx1ZS5pZHhdID0gMDtcbiAgfTtcblxuICByZXR1cm4gb3V0O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2FuZCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAoJyArIGlucHV0c1swXSArICcgIT09IDAgJiYgJyArIGlucHV0c1sxXSArICcgIT09IDApIHwgMFxcblxcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9ICcnICsgdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFsnJyArIHRoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xLCBpbjIpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMSwgaW4yXVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdhc2luJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICdhc2luJzogTWF0aC5hc2luIH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLmFzaW4oICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFzaW4ocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBhc2luID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgYXNpbi5pbnB1dHMgPSBbeF07XG4gIGFzaW4uaWQgPSBfZ2VuLmdldFVJRCgpO1xuICBhc2luLm5hbWUgPSBhc2luLmJhc2VuYW1lICsgJ3thc2luLmlkfSc7XG5cbiAgcmV0dXJuIGFzaW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnYXRhbicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoeyAnYXRhbic6IE1hdGguYXRhbiB9KTtcblxuICAgICAgb3V0ID0gJ2dlbi5hdGFuKCAnICsgaW5wdXRzWzBdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hdGFuKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgYXRhbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGF0YW4uaW5wdXRzID0gW3hdO1xuICBhdGFuLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgYXRhbi5uYW1lID0gYXRhbi5iYXNlbmFtZSArICd7YXRhbi5pZH0nO1xuXG4gIHJldHVybiBhdGFuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCcuL2hpc3RvcnkuanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkZWNheVRpbWUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyA0NDEwMCA6IGFyZ3VtZW50c1swXTtcblxuICAgIHZhciBzc2QgPSBoaXN0b3J5KDEpLFxuICAgICAgICB0NjAgPSBNYXRoLmV4cCgtNi45MDc3NTUyNzg5MjEgLyBkZWNheVRpbWUpO1xuXG4gICAgc3NkLmluKG11bChzc2Qub3V0LCB0NjApKTtcblxuICAgIHNzZC5vdXQudHJpZ2dlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3NkLnZhbHVlID0gMTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHN1YigxLCBzc2Qub3V0KTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgX2dlbi5yZXF1ZXN0TWVtb3J5KHRoaXMubWVtb3J5KTtcblxuICAgIHZhciBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSBtZW1vcnlbJyArIHRoaXMubWVtb3J5LnZhbHVlLmlkeCArICddXFxuICBpZiggJyArIHRoaXMubmFtZSArICcgPT09IDEgKSBtZW1vcnlbJyArIHRoaXMubWVtb3J5LnZhbHVlLmlkeCArICddID0gMCAgICAgIFxcbiAgICAgIFxcbic7XG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoX3Byb3BzKSB7XG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgbWluOiAwLCBtYXg6IDEgfSwgX3Byb3BzKTtcblxuICB1Z2VuLm5hbWUgPSAnYmFuZycgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHVnZW4ubWluID0gcHJvcHMubWluO1xuICB1Z2VuLm1heCA9IHByb3BzLm1heDtcblxuICB1Z2VuLnRyaWdnZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgX2dlbi5tZW1vcnkuaGVhcFt1Z2VuLm1lbW9yeS52YWx1ZS5pZHhdID0gdWdlbi5tYXg7XG4gIH07XG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWU6IHsgbGVuZ3RoOiAxLCBpZHg6IG51bGwgfVxuICB9O1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2Jvb2wnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgb3V0ID0gdm9pZCAwO1xuXG4gICAgb3V0ID0gaW5wdXRzWzBdICsgJyA9PT0gMCA/IDAgOiAxJztcblxuICAgIC8vZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWBcblxuICAgIC8vcmV0dXJuIFsgYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWAsICcgJyArb3V0IF1cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xXVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2NlaWwnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCBNYXRoLmNlaWwpKTtcblxuICAgICAgb3V0ID0gJ2dlbi5jZWlsKCAnICsgaW5wdXRzWzBdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5jZWlsKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgY2VpbCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGNlaWwuaW5wdXRzID0gW3hdO1xuXG4gIHJldHVybiBjZWlsO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBmbG9vciA9IHJlcXVpcmUoJy4vZmxvb3IuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2NsaXAnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBjb2RlID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgb3V0ID0gdm9pZCAwO1xuXG4gICAgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnICsgaW5wdXRzWzBdICsgJ1xcbiAgaWYoICcgKyB0aGlzLm5hbWUgKyAnID4gJyArIGlucHV0c1syXSArICcgKSAnICsgdGhpcy5uYW1lICsgJyA9ICcgKyBpbnB1dHNbMl0gKyAnXFxuICBlbHNlIGlmKCAnICsgdGhpcy5uYW1lICsgJyA8ICcgKyBpbnB1dHNbMV0gKyAnICkgJyArIHRoaXMubmFtZSArICcgPSAnICsgaW5wdXRzWzFdICsgJ1xcbic7XG4gICAgb3V0ID0gJyAnICsgb3V0O1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xKSB7XG4gIHZhciBtaW4gPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAtMSA6IGFyZ3VtZW50c1sxXTtcbiAgdmFyIG1heCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbMl07XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICBtaW46IG1pbixcbiAgICBtYXg6IG1heCxcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBtaW4sIG1heF1cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnY29zJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICdjb3MnOiBNYXRoLmNvcyB9KTtcblxuICAgICAgb3V0ID0gJ2dlbi5jb3MoICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmNvcyhwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIGNvcyA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGNvcy5pbnB1dHMgPSBbeF07XG4gIGNvcy5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIGNvcy5uYW1lID0gY29zLmJhc2VuYW1lICsgJ3tjb3MuaWR9JztcblxuICByZXR1cm4gY29zO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2NvdW50ZXInLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBjb2RlID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5ID0gdm9pZCAwO1xuXG4gICAgaWYgKHRoaXMubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCkgX2dlbi5yZXF1ZXN0TWVtb3J5KHRoaXMubWVtb3J5KTtcbiAgICBmdW5jdGlvbkJvZHkgPSB0aGlzLmNhbGxiYWNrKGdlbk5hbWUsIGlucHV0c1swXSwgaW5wdXRzWzFdLCBpbnB1dHNbMl0sIGlucHV0c1szXSwgaW5wdXRzWzRdLCAnbWVtb3J5WycgKyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggKyAnXScsICdtZW1vcnlbJyArIHRoaXMubWVtb3J5LndyYXAuaWR4ICsgJ10nKTtcblxuICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCB0aGlzKSk7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZSArICdfdmFsdWUnO1xuXG4gICAgaWYgKF9nZW4ubWVtb1t0aGlzLndyYXAubmFtZV0gPT09IHVuZGVmaW5lZCkgdGhpcy53cmFwLmdlbigpO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5XTtcbiAgfSxcbiAgY2FsbGJhY2s6IGZ1bmN0aW9uIGNhbGxiYWNrKF9uYW1lLCBfaW5jciwgX21pbiwgX21heCwgX3Jlc2V0LCBsb29wcywgdmFsdWVSZWYsIHdyYXBSZWYpIHtcbiAgICB2YXIgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJyc7XG5cbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYgKCEodHlwZW9mIHRoaXMuaW5wdXRzWzNdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1szXSA8IDEpKSB7XG4gICAgICBvdXQgKz0gJyAgaWYoICcgKyBfcmVzZXQgKyAnID49IDEgKSAnICsgdmFsdWVSZWYgKyAnID0gJyArIF9taW4gKyAnXFxuJztcbiAgICB9XG5cbiAgICBvdXQgKz0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlID0gJyArIHZhbHVlUmVmICsgJztcXG4gICcgKyB2YWx1ZVJlZiArICcgKz0gJyArIF9pbmNyICsgJ1xcbic7IC8vIHN0b3JlIG91dHB1dCB2YWx1ZSBiZWZvcmUgYWNjdW11bGF0aW5nIFxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLm1heCA9PT0gJ251bWJlcicgJiYgdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHR5cGVvZiB0aGlzLm1pbiAhPT0gJ251bWJlcicpIHtcbiAgICAgIHdyYXAgPSAnICBpZiggJyArIHZhbHVlUmVmICsgJyA+PSAnICsgdGhpcy5tYXggKyAnICYmICcgKyBsb29wcyArICcgKSB7XFxuICAgICcgKyB2YWx1ZVJlZiArICcgLT0gJyArIGRpZmYgKyAnXFxuICAgICcgKyB3cmFwUmVmICsgJyA9IDFcXG4gIH1lbHNle1xcbiAgICAnICsgd3JhcFJlZiArICcgPSAwXFxuICB9XFxuJztcbiAgICB9IGVsc2UgaWYgKHRoaXMubWF4ICE9PSBJbmZpbml0eSAmJiB0aGlzLm1pbiAhPT0gSW5maW5pdHkpIHtcbiAgICAgIHdyYXAgPSAnICBpZiggJyArIHZhbHVlUmVmICsgJyA+PSAnICsgX21heCArICcgJiYgJyArIGxvb3BzICsgJyApIHtcXG4gICAgJyArIHZhbHVlUmVmICsgJyAtPSAnICsgX21heCArICcgLSAnICsgX21pbiArICdcXG4gICAgJyArIHdyYXBSZWYgKyAnID0gMVxcbiAgfWVsc2UgaWYoICcgKyB2YWx1ZVJlZiArICcgPCAnICsgX21pbiArICcgJiYgJyArIGxvb3BzICsgJyApIHtcXG4gICAgJyArIHZhbHVlUmVmICsgJyArPSAnICsgX21heCArICcgLSAnICsgX21pbiArICdcXG4gICAgJyArIHdyYXBSZWYgKyAnID0gMVxcbiAgfWVsc2V7XFxuICAgICcgKyB3cmFwUmVmICsgJyA9IDBcXG4gIH1cXG4nO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gJ1xcbic7XG4gICAgfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcDtcblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgaW5jciA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbMF07XG4gIHZhciBtaW4gPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAwIDogYXJndW1lbnRzWzFdO1xuICB2YXIgbWF4ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gSW5maW5pdHkgOiBhcmd1bWVudHNbMl07XG4gIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMyB8fCBhcmd1bWVudHNbM10gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbM107XG4gIHZhciBsb29wcyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gNCB8fCBhcmd1bWVudHNbNF0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbNF07XG4gIHZhciBwcm9wZXJ0aWVzID0gYXJndW1lbnRzWzVdO1xuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBkZWZhdWx0cyA9IHsgaW5pdGlhbFZhbHVlOiAwLCBzaG91bGRXcmFwOiB0cnVlIH07XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgcHJvcGVydGllcyk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgbWluOiBtaW4sXG4gICAgbWF4OiBtYXgsXG4gICAgdmFsdWU6IGRlZmF1bHRzLmluaXRpYWxWYWx1ZSxcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW5jciwgbWluLCBtYXgsIHJlc2V0LCBsb29wc10sXG4gICAgbWVtb3J5OiB7XG4gICAgICB2YWx1ZTogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9LFxuICAgICAgd3JhcDogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9XG4gICAgfSxcbiAgICB3cmFwOiB7XG4gICAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgICAgaWYgKHVnZW4ubWVtb3J5LndyYXAuaWR4ID09PSBudWxsKSB7XG4gICAgICAgICAgX2dlbi5yZXF1ZXN0TWVtb3J5KHVnZW4ubWVtb3J5KTtcbiAgICAgICAgfVxuICAgICAgICBfZ2VuLmdldElucHV0cyh0aGlzKTtcbiAgICAgICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSAnbWVtb3J5WyAnICsgdWdlbi5tZW1vcnkud3JhcC5pZHggKyAnIF0nO1xuICAgICAgICByZXR1cm4gJ21lbW9yeVsgJyArIHVnZW4ubWVtb3J5LndyYXAuaWR4ICsgJyBdJztcbiAgICAgIH1cbiAgICB9XG4gIH0sIGRlZmF1bHRzKTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgaWYgKHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gX2dlbi5tZW1vcnkuaGVhcFt0aGlzLm1lbW9yeS52YWx1ZS5pZHhdO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodikge1xuICAgICAgaWYgKHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCkge1xuICAgICAgICBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF0gPSB2O1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgdWdlbi53cmFwLmlucHV0cyA9IFt1Z2VuXTtcbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG4gIHVnZW4ud3JhcC5uYW1lID0gdWdlbi5uYW1lICsgJ193cmFwJztcbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgYWNjdW0gPSByZXF1aXJlKCcuL3BoYXNvci5qcycpLFxuICAgIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBwaGFzb3IgPSByZXF1aXJlKCcuL3BoYXNvci5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnY3ljbGUnLFxuXG4gIGluaXRUYWJsZTogZnVuY3Rpb24gaW5pdFRhYmxlKCkge1xuICAgIHZhciBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KDEwMjQpO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBidWZmZXIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBidWZmZXJbaV0gPSBNYXRoLnNpbihpIC8gbCAqIChNYXRoLlBJICogMikpO1xuICAgIH1cblxuICAgIGdlbi5nbG9iYWxzLmN5Y2xlID0gZGF0YShidWZmZXIsIDEsIHsgaW1tdXRhYmxlOiB0cnVlIH0pO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZyZXF1ZW5jeSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbMF07XG4gIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMV07XG5cbiAgaWYgKGdlbi5nbG9iYWxzLmN5Y2xlID09PSB1bmRlZmluZWQpIHByb3RvLmluaXRUYWJsZSgpO1xuXG4gIHZhciB1Z2VuID0gcGVlayhnZW4uZ2xvYmFscy5jeWNsZSwgcGhhc29yKGZyZXF1ZW5jeSwgcmVzZXQsIHsgbWluOiAwIH0pKTtcbiAgdWdlbi5uYW1lID0gJ2N5Y2xlJyArIGdlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgdXRpbGl0aWVzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnZGF0YScsXG4gIGdsb2JhbHM6IHt9LFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpZHggPSB2b2lkIDA7XG4gICAgaWYgKF9nZW4ubWVtb1t0aGlzLm5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciB1Z2VuID0gdGhpcztcbiAgICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSwgdGhpcy5pbW11dGFibGUpO1xuICAgICAgaWR4ID0gdGhpcy5tZW1vcnkudmFsdWVzLmlkeDtcbiAgICAgIHRyeSB7XG4gICAgICAgIF9nZW4ubWVtb3J5LmhlYXAuc2V0KHRoaXMuYnVmZmVyLCBpZHgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ2Vycm9yIHdpdGggcmVxdWVzdC4gYXNraW5nIGZvciAnICsgdGhpcy5idWZmZXIubGVuZ3RoICsgJy4gY3VycmVudCBpbmRleDogJyArIF9nZW4ubWVtb3J5SW5kZXggKyAnIG9mICcgKyBfZ2VuLm1lbW9yeS5oZWFwLmxlbmd0aCk7XG4gICAgICB9XG4gICAgICAvL2dlbi5kYXRhWyB0aGlzLm5hbWUgXSA9IHRoaXNcbiAgICAgIC8vcmV0dXJuICdnZW4ubWVtb3J5JyArIHRoaXMubmFtZSArICcuYnVmZmVyJ1xuICAgICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSBpZHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlkeCA9IF9nZW4ubWVtb1t0aGlzLm5hbWVdO1xuICAgIH1cbiAgICByZXR1cm4gaWR4O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciB5ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMSA6IGFyZ3VtZW50c1sxXTtcbiAgdmFyIHByb3BlcnRpZXMgPSBhcmd1bWVudHNbMl07XG5cbiAgdmFyIHVnZW4gPSB2b2lkIDAsXG4gICAgICBidWZmZXIgPSB2b2lkIDAsXG4gICAgICBzaG91bGRMb2FkID0gZmFsc2U7XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKF9nZW4uZ2xvYmFsc1twcm9wZXJ0aWVzLmdsb2JhbF0pIHtcbiAgICAgIHJldHVybiBfZ2VuLmdsb2JhbHNbcHJvcGVydGllcy5nbG9iYWxdO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlb2YgeCA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAoeSAhPT0gMSkge1xuICAgICAgYnVmZmVyID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHk7IGkrKykge1xuICAgICAgICBidWZmZXJbaV0gPSBuZXcgRmxvYXQzMkFycmF5KHgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHgpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHgpKSB7XG4gICAgLy8hICh4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkgKSB7XG4gICAgdmFyIHNpemUgPSB4Lmxlbmd0aDtcbiAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHNpemUpO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCB4Lmxlbmd0aDsgX2krKykge1xuICAgICAgYnVmZmVyW19pXSA9IHhbX2ldO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgeCA9PT0gJ3N0cmluZycpIHtcbiAgICBidWZmZXIgPSB7IGxlbmd0aDogeSA+IDEgPyB5IDogX2dlbi5zYW1wbGVyYXRlICogNjAgfTsgLy8gWFhYIHdoYXQ/Pz9cbiAgICBzaG91bGRMb2FkID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICh4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KSB7XG4gICAgYnVmZmVyID0geDtcbiAgfVxuXG4gIHVnZW4gPSB7XG4gICAgYnVmZmVyOiBidWZmZXIsXG4gICAgbmFtZTogcHJvdG8uYmFzZW5hbWUgKyBfZ2VuLmdldFVJRCgpLFxuICAgIGRpbTogYnVmZmVyLmxlbmd0aCwgLy8gWFhYIGhvdyBkbyB3ZSBkeW5hbWljYWxseSBhbGxvY2F0ZSB0aGlzP1xuICAgIGNoYW5uZWxzOiAxLFxuICAgIGdlbjogcHJvdG8uZ2VuLFxuICAgIG9ubG9hZDogbnVsbCxcbiAgICB0aGVuOiBmdW5jdGlvbiB0aGVuKGZuYykge1xuICAgICAgdWdlbi5vbmxvYWQgPSBmbmM7XG4gICAgICByZXR1cm4gdWdlbjtcbiAgICB9LFxuXG4gICAgaW1tdXRhYmxlOiBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5pbW11dGFibGUgPT09IHRydWUgPyB0cnVlIDogZmFsc2UsXG4gICAgbG9hZDogZnVuY3Rpb24gbG9hZChmaWxlbmFtZSkge1xuICAgICAgdmFyIHByb21pc2UgPSB1dGlsaXRpZXMubG9hZFNhbXBsZShmaWxlbmFtZSwgdWdlbik7XG4gICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKF9idWZmZXIpIHtcbiAgICAgICAgdWdlbi5tZW1vcnkudmFsdWVzLmxlbmd0aCA9IHVnZW4uZGltID0gX2J1ZmZlci5sZW5ndGg7XG4gICAgICAgIHVnZW4ub25sb2FkKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWVzOiB7IGxlbmd0aDogdWdlbi5kaW0sIGlkeDogbnVsbCB9XG4gIH07XG5cbiAgX2dlbi5uYW1lID0gJ2RhdGEnICsgX2dlbi5nZXRVSUQoKTtcblxuICBpZiAoc2hvdWxkTG9hZCkgdWdlbi5sb2FkKHgpO1xuXG4gIGlmIChwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAocHJvcGVydGllcy5nbG9iYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgX2dlbi5nbG9iYWxzW3Byb3BlcnRpZXMuZ2xvYmFsXSA9IHVnZW47XG4gICAgfVxuICAgIGlmIChwcm9wZXJ0aWVzLm1ldGEgPT09IHRydWUpIHtcbiAgICAgIHZhciBfbG9vcCA9IGZ1bmN0aW9uIF9sb29wKGxlbmd0aCwgX2kyKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh1Z2VuLCBfaTIsIHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiBwZWVrKHVnZW4sIF9pMiwgeyBtb2RlOiAnc2ltcGxlJywgaW50ZXJwOiAnbm9uZScgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgICAgICAgICByZXR1cm4gcG9rZSh1Z2VuLCB2LCBfaTIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBmb3IgKHZhciBfaTIgPSAwLCBsZW5ndGggPSB1Z2VuLmJ1ZmZlci5sZW5ndGg7IF9pMiA8IGxlbmd0aDsgX2kyKyspIHtcbiAgICAgICAgX2xvb3AobGVuZ3RoLCBfaTIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCcuL2hpc3RvcnkuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSkge1xuICAgIHZhciB4MSA9IGhpc3RvcnkoKSxcbiAgICAgICAgeTEgPSBoaXN0b3J5KCksXG4gICAgICAgIGZpbHRlciA9IHZvaWQgMDtcblxuICAgIC8vSGlzdG9yeSB4MSwgeTE7IHkgPSBpbjEgLSB4MSArIHkxKjAuOTk5NzsgeDEgPSBpbjE7IHkxID0geTsgb3V0MSA9IHk7XG4gICAgZmlsdGVyID0gbWVtbyhhZGQoc3ViKGluMSwgeDEub3V0KSwgbXVsKHkxLm91dCwgLjk5OTcpKSk7XG4gICAgeDEuaW4oaW4xKTtcbiAgICB5MS5pbihmaWx0ZXIpO1xuXG4gICAgcmV0dXJuIGZpbHRlcjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSgnLi9oaXN0b3J5LmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICB0NjAgPSByZXF1aXJlKCcuL3Q2MC5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZGVjYXlUaW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gNDQxMDAgOiBhcmd1bWVudHNbMF07XG4gICAgdmFyIHByb3BzID0gYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCB7IGluaXRWYWx1ZTogMSB9LCBwcm9wcyksXG4gICAgICAgIHNzZCA9IGhpc3RvcnkocHJvcGVydGllcy5pbml0VmFsdWUpO1xuXG4gICAgc3NkLmluKG11bChzc2Qub3V0LCB0NjAoZGVjYXlUaW1lKSkpO1xuXG4gICAgc3NkLm91dC50cmlnZ2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzc2QudmFsdWUgPSAxO1xuICAgIH07XG5cbiAgICByZXR1cm4gc3NkLm91dDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZGF0YSA9IHJlcXVpcmUoJy4vZGF0YS5qcycpLFxuICAgIHBva2UgPSByZXF1aXJlKCcuL3Bva2UuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICB3cmFwID0gcmVxdWlyZSgnLi93cmFwLmpzJyksXG4gICAgYWNjdW0gPSByZXF1aXJlKCcuL2FjY3VtLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdkZWxheScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSBpbnB1dHNbMF07XG5cbiAgICByZXR1cm4gaW5wdXRzWzBdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIHRhcHNBbmRQcm9wZXJ0aWVzID0gQXJyYXkoX2xlbiA+IDIgPyBfbGVuIC0gMiA6IDApLCBfa2V5ID0gMjsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIHRhcHNBbmRQcm9wZXJ0aWVzW19rZXkgLSAyXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciB0aW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMjU2IDogYXJndW1lbnRzWzFdO1xuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBkZWZhdWx0cyA9IHsgc2l6ZTogNTEyLCBmZWVkYmFjazogMCwgaW50ZXJwOiAnbGluZWFyJyB9LFxuICAgICAgd3JpdGVJZHggPSB2b2lkIDAsXG4gICAgICByZWFkSWR4ID0gdm9pZCAwLFxuICAgICAgZGVsYXlkYXRhID0gdm9pZCAwLFxuICAgICAgcHJvcGVydGllcyA9IHZvaWQgMCxcbiAgICAgIHRhcFRpbWVzID0gW3RpbWVdLFxuICAgICAgdGFwcyA9IHZvaWQgMDtcblxuICBpZiAoQXJyYXkuaXNBcnJheSh0YXBzQW5kUHJvcGVydGllcykpIHtcbiAgICBwcm9wZXJ0aWVzID0gdGFwc0FuZFByb3BlcnRpZXNbdGFwc0FuZFByb3BlcnRpZXMubGVuZ3RoIC0gMV07XG4gICAgaWYgKHRhcHNBbmRQcm9wZXJ0aWVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFwc0FuZFByb3BlcnRpZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIHRhcFRpbWVzLnB1c2godGFwc0FuZFByb3BlcnRpZXNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIGlmIChkZWZhdWx0cy5zaXplIDwgdGltZSkgZGVmYXVsdHMuc2l6ZSA9IHRpbWU7XG5cbiAgZGVsYXlkYXRhID0gZGF0YShkZWZhdWx0cy5zaXplKTtcblxuICB1Z2VuLmlucHV0cyA9IFtdO1xuXG4gIHdyaXRlSWR4ID0gYWNjdW0oMSwgMCwgeyBtYXg6IGRlZmF1bHRzLnNpemUgfSk7XG5cbiAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IHRhcFRpbWVzLmxlbmd0aDsgX2krKykge1xuICAgIHVnZW4uaW5wdXRzW19pXSA9IHBlZWsoZGVsYXlkYXRhLCB3cmFwKHN1Yih3cml0ZUlkeCwgdGFwVGltZXNbX2ldKSwgMCwgZGVmYXVsdHMuc2l6ZSksIHsgbW9kZTogJ3NhbXBsZXMnLCBpbnRlcnA6IGRlZmF1bHRzLmludGVycCB9KTtcbiAgfVxuXG4gIHVnZW4ub3V0cHV0cyA9IHVnZW4uaW5wdXRzOyAvLyB1Z24sIFVnaCwgVUdIISBidXQgaSBndWVzcyBpdCB3b3Jrcy5cblxuICBwb2tlKGRlbGF5ZGF0YSwgaW4xLCB3cml0ZUlkeCk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSgnLi9oaXN0b3J5LmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xKSB7XG4gIHZhciBuMSA9IGhpc3RvcnkoKTtcblxuICBuMS5pbihpbjEpO1xuXG4gIHZhciB1Z2VuID0gc3ViKGluMSwgbjEub3V0KTtcbiAgdWdlbi5uYW1lID0gJ2RlbHRhJyArIGdlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICB2YXIgZGl2ID0ge1xuICAgIGlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICAgIG91dCA9ICcoJyxcbiAgICAgICAgICBkaWZmID0gMCxcbiAgICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgICAgbGFzdE51bWJlciA9IGlucHV0c1swXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4obGFzdE51bWJlciksXG4gICAgICAgICAgZGl2QXRFbmQgPSBmYWxzZTtcblxuICAgICAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgICAgaWYgKGkgPT09IDApIHJldHVybjtcblxuICAgICAgICB2YXIgaXNOdW1iZXJVZ2VuID0gaXNOYU4odiksXG4gICAgICAgICAgICBpc0ZpbmFsSWR4ID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDE7XG5cbiAgICAgICAgaWYgKCFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4pIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAvIHY7XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXIgKyAnIC8gJyArIHY7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzRmluYWxJZHgpIG91dCArPSAnIC8gJztcbiAgICAgIH0pO1xuXG4gICAgICBvdXQgKz0gJyknO1xuXG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZGl2O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbicpLFxuICAgIHdpbmRvd3MgPSByZXF1aXJlKCcuL3dpbmRvd3MnKSxcbiAgICBkYXRhID0gcmVxdWlyZSgnLi9kYXRhJyksXG4gICAgcGVlayA9IHJlcXVpcmUoJy4vcGVlaycpLFxuICAgIHBoYXNvciA9IHJlcXVpcmUoJy4vcGhhc29yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gMTEwMjUgOiBhcmd1bWVudHNbMF07XG4gIHZhciBwcm9wZXJ0aWVzID0gYXJndW1lbnRzWzFdO1xuXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICB0eXBlOiAnVHJpYW5ndWxhcicsXG4gICAgYnVmZmVyTGVuZ3RoOiAxMDI0LFxuICAgIGFscGhhOiAuMTVcbiAgfSxcbiAgICAgIGZyZXF1ZW5jeSA9IGxlbmd0aCAvIGdlbi5zYW1wbGVyYXRlLFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgcHJvcGVydGllcyksXG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHByb3BzLmJ1ZmZlckxlbmd0aCk7XG5cbiAgaWYgKGdlbi5nbG9iYWxzLndpbmRvd3NbcHJvcHMudHlwZV0gPT09IHVuZGVmaW5lZCkgZ2VuLmdsb2JhbHMud2luZG93c1twcm9wcy50eXBlXSA9IHt9O1xuXG4gIGlmIChnZW4uZ2xvYmFscy53aW5kb3dzW3Byb3BzLnR5cGVdW3Byb3BzLmJ1ZmZlckxlbmd0aF0gPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMuYnVmZmVyTGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZmZlcltpXSA9IHdpbmRvd3NbcHJvcHMudHlwZV0ocHJvcHMuYnVmZmVyTGVuZ3RoLCBpLCBwcm9wcy5hbHBoYSk7XG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMud2luZG93c1twcm9wcy50eXBlXVtwcm9wcy5idWZmZXJMZW5ndGhdID0gZGF0YShidWZmZXIpO1xuICB9XG5cbiAgdmFyIHVnZW4gPSBnZW4uZ2xvYmFscy53aW5kb3dzW3Byb3BzLnR5cGVdW3Byb3BzLmJ1ZmZlckxlbmd0aF07IC8vcGVlayggZ2VuLmdsb2JhbHMud2luZG93c1sgcHJvcHMudHlwZSBdWyBwcm9wcy5idWZmZXJMZW5ndGggXSwgcGhhc29yKCBmcmVxdWVuY3ksIDAsIHsgbWluOjAgfSApKVxuICB1Z2VuLm5hbWUgPSAnZW52JyArIGdlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdlcScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBvdXQgPSB0aGlzLmlucHV0c1swXSA9PT0gdGhpcy5pbnB1dHNbMV0gPyAxIDogJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gKCcgKyBpbnB1dHNbMF0gKyAnID09PSAnICsgaW5wdXRzWzFdICsgJykgfCAwXFxuXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJycgKyB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gWycnICsgdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIGluMikge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBpbjJdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnZmxvb3InLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIC8vZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguZmxvb3IgfSlcblxuICAgICAgb3V0ID0gJyggJyArIGlucHV0c1swXSArICcgfCAwICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gfCAwO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIGZsb29yID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgZmxvb3IuaW5wdXRzID0gW3hdO1xuXG4gIHJldHVybiBmbG9vcjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdmb2xkJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgY29kZSA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIG91dCA9IHRoaXMuY3JlYXRlQ2FsbGJhY2soaW5wdXRzWzBdLCB0aGlzLm1pbiwgdGhpcy5tYXgpO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJztcblxuICAgIHJldHVybiBbdGhpcy5uYW1lICsgJ192YWx1ZScsIG91dF07XG4gIH0sXG4gIGNyZWF0ZUNhbGxiYWNrOiBmdW5jdGlvbiBjcmVhdGVDYWxsYmFjayh2LCBsbywgaGkpIHtcbiAgICB2YXIgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgdiArICcsXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfcmFuZ2UgPSAnICsgaGkgKyAnIC0gJyArIGxvICsgJyxcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwcyA9IDBcXG5cXG4gIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlID49ICcgKyBoaSArICcpe1xcbiAgICAnICsgdGhpcy5uYW1lICsgJ192YWx1ZSAtPSAnICsgdGhpcy5uYW1lICsgJ19yYW5nZVxcbiAgICBpZignICsgdGhpcy5uYW1lICsgJ192YWx1ZSA+PSAnICsgaGkgKyAnKXtcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwcyA9ICgoJyArIHRoaXMubmFtZSArICdfdmFsdWUgLSAnICsgbG8gKyAnKSAvICcgKyB0aGlzLm5hbWUgKyAnX3JhbmdlKSB8IDBcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ192YWx1ZSAtPSAnICsgdGhpcy5uYW1lICsgJ19yYW5nZSAqICcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzXFxuICAgIH1cXG4gICAgJyArIHRoaXMubmFtZSArICdfbnVtV3JhcHMrK1xcbiAgfSBlbHNlIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIDwgJyArIGxvICsgJyl7XFxuICAgICcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlICs9ICcgKyB0aGlzLm5hbWUgKyAnX3JhbmdlXFxuICAgIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIDwgJyArIGxvICsgJyl7XFxuICAgICAgJyArIHRoaXMubmFtZSArICdfbnVtV3JhcHMgPSAoKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIC0gJyArIGxvICsgJykgLyAnICsgdGhpcy5uYW1lICsgJ19yYW5nZS0gMSkgfCAwXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfdmFsdWUgLT0gJyArIHRoaXMubmFtZSArICdfcmFuZ2UgKiAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwc1xcbiAgICB9XFxuICAgICcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzLS1cXG4gIH1cXG4gIGlmKCcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzICYgMSkgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgaGkgKyAnICsgJyArIGxvICsgJyAtICcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlXFxuJztcbiAgICByZXR1cm4gJyAnICsgb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgdmFyIG1pbiA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMV07XG4gIHZhciBtYXggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyAxIDogYXJndW1lbnRzWzJdO1xuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgbWluOiBtaW4sXG4gICAgbWF4OiBtYXgsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMV1cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2dhdGUnLFxuICBjb250cm9sU3RyaW5nOiBudWxsLCAvLyBpbnNlcnQgaW50byBvdXRwdXQgY29kZWdlbiBmb3IgZGV0ZXJtaW5pbmcgaW5kZXhpbmdcbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBfZ2VuLnJlcXVlc3RNZW1vcnkodGhpcy5tZW1vcnkpO1xuXG4gICAgdmFyIGxhc3RJbnB1dE1lbW9yeUlkeCA9ICdtZW1vcnlbICcgKyB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgJyBdJyxcbiAgICAgICAgb3V0cHV0TWVtb3J5U3RhcnRJZHggPSB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgMSxcbiAgICAgICAgaW5wdXRTaWduYWwgPSBpbnB1dHNbMF0sXG4gICAgICAgIGNvbnRyb2xTaWduYWwgPSBpbnB1dHNbMV07XG5cbiAgICAvKiBcbiAgICAgKiB3ZSBjaGVjayB0byBzZWUgaWYgdGhlIGN1cnJlbnQgY29udHJvbCBpbnB1dHMgZXF1YWxzIG91ciBsYXN0IGlucHV0XG4gICAgICogaWYgc28sIHdlIHN0b3JlIHRoZSBzaWduYWwgaW5wdXQgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnRseVxuICAgICAqIHNlbGVjdGVkIGluZGV4LiBJZiBub3QsIHdlIHB1dCAwIGluIHRoZSBtZW1vcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBsYXN0IHNlbGVjdGVkIGluZGV4LFxuICAgICAqIGNoYW5nZSB0aGUgc2VsZWN0ZWQgaW5kZXgsIGFuZCB0aGVuIHN0b3JlIHRoZSBzaWduYWwgaW4gcHV0IGluIHRoZSBtZW1lcnkgYXNzb2ljYXRlZFxuICAgICAqIHdpdGggdGhlIG5ld2x5IHNlbGVjdGVkIGluZGV4XG4gICAgICovXG5cbiAgICBvdXQgPSAnIGlmKCAnICsgY29udHJvbFNpZ25hbCArICcgIT09ICcgKyBsYXN0SW5wdXRNZW1vcnlJZHggKyAnICkge1xcbiAgICBtZW1vcnlbICcgKyBsYXN0SW5wdXRNZW1vcnlJZHggKyAnICsgJyArIG91dHB1dE1lbW9yeVN0YXJ0SWR4ICsgJyAgXSA9IDAgXFxuICAgICcgKyBsYXN0SW5wdXRNZW1vcnlJZHggKyAnID0gJyArIGNvbnRyb2xTaWduYWwgKyAnXFxuICB9XFxuICBtZW1vcnlbICcgKyBvdXRwdXRNZW1vcnlTdGFydElkeCArICcgKyAnICsgY29udHJvbFNpZ25hbCArICcgXSA9ICcgKyBpbnB1dFNpZ25hbCArICdcXG5cXG4nO1xuICAgIHRoaXMuY29udHJvbFN0cmluZyA9IGlucHV0c1sxXTtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgdGhpcy5vdXRwdXRzLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgIHJldHVybiB2LmdlbigpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFtudWxsLCAnICcgKyBvdXRdO1xuICB9LFxuICBjaGlsZGdlbjogZnVuY3Rpb24gY2hpbGRnZW4oKSB7XG4gICAgaWYgKHRoaXMucGFyZW50LmluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgICAgX2dlbi5nZXRJbnB1dHModGhpcyk7IC8vIHBhcmVudCBnYXRlIGlzIG9ubHkgaW5wdXQgb2YgYSBnYXRlIG91dHB1dCwgc2hvdWxkIG9ubHkgYmUgZ2VuJ2Qgb25jZS5cbiAgICB9XG5cbiAgICBpZiAoX2dlbi5tZW1vW3RoaXMubmFtZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgX2dlbi5yZXF1ZXN0TWVtb3J5KHRoaXMubWVtb3J5KTtcblxuICAgICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSAnbWVtb3J5WyAnICsgdGhpcy5tZW1vcnkudmFsdWUuaWR4ICsgJyBdJztcbiAgICB9XG5cbiAgICByZXR1cm4gJ21lbW9yeVsgJyArIHRoaXMubWVtb3J5LnZhbHVlLmlkeCArICcgXSc7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnRyb2wsIGluMSwgcHJvcGVydGllcykge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgZGVmYXVsdHMgPSB7IGNvdW50OiAyIH07XG5cbiAgaWYgKCh0eXBlb2YgcHJvcGVydGllcyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YocHJvcGVydGllcykpICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG91dHB1dHM6IFtdLFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjEsIGNvbnRyb2xdLFxuICAgIG1lbW9yeToge1xuICAgICAgbGFzdElucHV0OiB7IGxlbmd0aDogMSwgaWR4OiBudWxsIH1cbiAgICB9LFxuICAgIGluaXRpYWxpemVkOiBmYWxzZVxuICB9LCBkZWZhdWx0cyk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgX2dlbi5nZXRVSUQoKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHVnZW4uY291bnQ7IGkrKykge1xuICAgIHVnZW4ub3V0cHV0cy5wdXNoKHtcbiAgICAgIGluZGV4OiBpLFxuICAgICAgZ2VuOiBwcm90by5jaGlsZGdlbixcbiAgICAgIHBhcmVudDogdWdlbixcbiAgICAgIGlucHV0czogW3VnZW5dLFxuICAgICAgbWVtb3J5OiB7XG4gICAgICAgIHZhbHVlOiB7IGxlbmd0aDogMSwgaWR4OiBudWxsIH1cbiAgICAgIH0sXG4gICAgICBpbml0aWFsaXplZDogZmFsc2UsXG4gICAgICBuYW1lOiB1Z2VuLm5hbWUgKyAnX291dCcgKyBfZ2VuLmdldFVJRCgpXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBnZW4uanNcbiAqXG4gKiBsb3ctbGV2ZWwgY29kZSBnZW5lcmF0aW9uIGZvciB1bml0IGdlbmVyYXRvcnNcbiAqXG4gKi9cblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbnZhciBNZW1vcnlIZWxwZXIgPSByZXF1aXJlKCdtZW1vcnktaGVscGVyJyk7XG5cbnZhciBnZW4gPSB7XG5cbiAgYWNjdW06IDAsXG4gIGdldFVJRDogZnVuY3Rpb24gZ2V0VUlEKCkge1xuICAgIHJldHVybiB0aGlzLmFjY3VtKys7XG4gIH0sXG5cbiAgZGVidWc6IGZhbHNlLFxuICBzYW1wbGVyYXRlOiA0NDEwMCwgLy8gY2hhbmdlIG9uIGF1ZGlvY29udGV4dCBjcmVhdGlvblxuICBzaG91bGRMb2NhbGl6ZTogZmFsc2UsXG4gIGdsb2JhbHM6IHtcbiAgICB3aW5kb3dzOiB7fVxuICB9LFxuXG4gIC8qIGNsb3N1cmVzXG4gICAqXG4gICAqIEZ1bmN0aW9ucyB0aGF0IGFyZSBpbmNsdWRlZCBhcyBhcmd1bWVudHMgdG8gbWFzdGVyIGNhbGxiYWNrLiBFeGFtcGxlczogTWF0aC5hYnMsIE1hdGgucmFuZG9tIGV0Yy5cbiAgICogWFhYIFNob3VsZCBwcm9iYWJseSBiZSByZW5hbWVkIGNhbGxiYWNrUHJvcGVydGllcyBvciBzb21ldGhpbmcgc2ltaWxhci4uLiBjbG9zdXJlcyBhcmUgbm8gbG9uZ2VyIHVzZWQuXG4gICAqL1xuXG4gIGNsb3N1cmVzOiBuZXcgU2V0KCksXG4gIHBhcmFtczogbmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6IFtdLFxuICBlbmRCbG9jazogbmV3IFNldCgpLFxuICBoaXN0b3JpZXM6IG5ldyBNYXAoKSxcblxuICBtZW1vOiB7fSxcblxuICBkYXRhOiB7fSxcblxuICAvKiBleHBvcnRcbiAgICpcbiAgICogcGxhY2UgZ2VuIGZ1bmN0aW9ucyBpbnRvIGFub3RoZXIgb2JqZWN0IGZvciBlYXNpZXIgcmVmZXJlbmNlXG4gICAqL1xuXG4gIGV4cG9ydDogZnVuY3Rpb24gX2V4cG9ydChvYmopIHt9LFxuICBhZGRUb0VuZEJsb2NrOiBmdW5jdGlvbiBhZGRUb0VuZEJsb2NrKHYpIHtcbiAgICB0aGlzLmVuZEJsb2NrLmFkZCgnICAnICsgdik7XG4gIH0sXG4gIHJlcXVlc3RNZW1vcnk6IGZ1bmN0aW9uIHJlcXVlc3RNZW1vcnkobWVtb3J5U3BlYykge1xuICAgIHZhciBpbW11dGFibGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIGZvciAodmFyIGtleSBpbiBtZW1vcnlTcGVjKSB7XG4gICAgICB2YXIgcmVxdWVzdCA9IG1lbW9yeVNwZWNba2V5XTtcblxuICAgICAgcmVxdWVzdC5pZHggPSBnZW4ubWVtb3J5LmFsbG9jKHJlcXVlc3QubGVuZ3RoLCBpbW11dGFibGUpO1xuICAgIH1cbiAgfSxcblxuXG4gIC8qIGNyZWF0ZUNhbGxiYWNrXG4gICAqXG4gICAqIHBhcmFtIHVnZW4gLSBIZWFkIG9mIGdyYXBoIHRvIGJlIGNvZGVnZW4nZFxuICAgKlxuICAgKiBHZW5lcmF0ZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgYSBwYXJ0aWN1bGFyIHVnZW4gZ3JhcGguXG4gICAqIFRoZSBnZW4uY2xvc3VyZXMgcHJvcGVydHkgc3RvcmVzIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmVcbiAgICogcGFzc2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgZmluYWwgZnVuY3Rpb247IHRoZXNlIGFyZSBwcmVmaXhlZFxuICAgKiBiZWZvcmUgYW55IGRlZmluZWQgcGFyYW1zIHRoZSBncmFwaCBleHBvc2VzLiBGb3IgZXhhbXBsZSwgZ2l2ZW46XG4gICAqXG4gICAqIGdlbi5jcmVhdGVDYWxsYmFjayggYWJzKCBwYXJhbSgpICkgKVxuICAgKlxuICAgKiAuLi4gdGhlIGdlbmVyYXRlZCBmdW5jdGlvbiB3aWxsIGhhdmUgYSBzaWduYXR1cmUgb2YgKCBhYnMsIHAwICkuXG4gICAqL1xuXG4gIGNyZWF0ZUNhbGxiYWNrOiBmdW5jdGlvbiBjcmVhdGVDYWxsYmFjayh1Z2VuLCBtZW0pIHtcbiAgICB2YXIgZGVidWcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1syXTtcbiAgICB2YXIgc2hvdWxkSW5saW5lTWVtb3J5ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhcmd1bWVudHNbM107XG5cbiAgICB2YXIgaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KHVnZW4pICYmIHVnZW4ubGVuZ3RoID4gMSxcbiAgICAgICAgY2FsbGJhY2sgPSB2b2lkIDAsXG4gICAgICAgIGNoYW5uZWwxID0gdm9pZCAwLFxuICAgICAgICBjaGFubmVsMiA9IHZvaWQgMDtcblxuICAgIGlmICh0eXBlb2YgbWVtID09PSAnbnVtYmVyJyB8fCBtZW0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgbWVtID0gTWVtb3J5SGVscGVyLmNyZWF0ZShtZW0pO1xuICAgIH1cblxuICAgIC8vY29uc29sZS5sb2coICdjYiBtZW1vcnk6JywgbWVtIClcbiAgICB0aGlzLm1lbW9yeSA9IG1lbTtcbiAgICB0aGlzLm1lbW8gPSB7fTtcbiAgICB0aGlzLmVuZEJsb2NrLmNsZWFyKCk7XG4gICAgdGhpcy5jbG9zdXJlcy5jbGVhcigpO1xuICAgIHRoaXMucGFyYW1zLmNsZWFyKCk7XG4gICAgdGhpcy5nbG9iYWxzID0geyB3aW5kb3dzOiB7fSB9O1xuXG4gICAgdGhpcy5wYXJhbWV0ZXJzLmxlbmd0aCA9IDA7XG5cbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IFwiICAndXNlIHN0cmljdCdcXG5cIjtcbiAgICBpZiAoc2hvdWxkSW5saW5lTWVtb3J5ID09PSBmYWxzZSkgdGhpcy5mdW5jdGlvbkJvZHkgKz0gXCIgIHZhciBtZW1vcnkgPSBnZW4ubWVtb3J5XFxuXFxuXCI7XG5cbiAgICAvLyBjYWxsIC5nZW4oKSBvbiB0aGUgaGVhZCBvZiB0aGUgZ3JhcGggd2UgYXJlIGdlbmVyYXRpbmcgdGhlIGNhbGxiYWNrIGZvclxuICAgIC8vY29uc29sZS5sb2coICdIRUFEJywgdWdlbiApXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxICsgaXNTdGVyZW87IGkrKykge1xuICAgICAgaWYgKHR5cGVvZiB1Z2VuW2ldID09PSAnbnVtYmVyJykgY29udGludWU7XG5cbiAgICAgIHZhciBjaGFubmVsID0gaXNTdGVyZW8gPyB1Z2VuW2ldLmdlbigpIDogdWdlbi5nZW4oKSxcbiAgICAgICAgICBib2R5ID0gJyc7XG5cbiAgICAgIC8vIGlmIC5nZW4oKSByZXR1cm5zIGFycmF5LCBhZGQgdWdlbiBjYWxsYmFjayAoZ3JhcGhPdXRwdXRbMV0pIHRvIG91ciBvdXRwdXQgZnVuY3Rpb25zIGJvZHlcbiAgICAgIC8vIGFuZCB0aGVuIHJldHVybiBuYW1lIG9mIHVnZW4uIElmIC5nZW4oKSBvbmx5IGdlbmVyYXRlcyBhIG51bWJlciAoZm9yIHJlYWxseSBzaW1wbGUgZ3JhcGhzKVxuICAgICAgLy8ganVzdCByZXR1cm4gdGhhdCBudW1iZXIgKGdyYXBoT3V0cHV0WzBdKS5cbiAgICAgIGJvZHkgKz0gQXJyYXkuaXNBcnJheShjaGFubmVsKSA/IGNoYW5uZWxbMV0gKyAnXFxuJyArIGNoYW5uZWxbMF0gOiBjaGFubmVsO1xuXG4gICAgICAvLyBzcGxpdCBib2R5IHRvIGluamVjdCByZXR1cm4ga2V5d29yZCBvbiBsYXN0IGxpbmVcbiAgICAgIGJvZHkgPSBib2R5LnNwbGl0KCdcXG4nKTtcblxuICAgICAgLy9pZiggZGVidWcgKSBjb25zb2xlLmxvZyggJ2Z1bmN0aW9uQm9keSBsZW5ndGgnLCBib2R5IClcblxuICAgICAgLy8gbmV4dCBsaW5lIGlzIHRvIGFjY29tbW9kYXRlIG1lbW8gYXMgZ3JhcGggaGVhZFxuICAgICAgaWYgKGJvZHlbYm9keS5sZW5ndGggLSAxXS50cmltKCkuaW5kZXhPZignbGV0JykgPiAtMSkge1xuICAgICAgICBib2R5LnB1c2goJ1xcbicpO1xuICAgICAgfVxuXG4gICAgICAvLyBnZXQgaW5kZXggb2YgbGFzdCBsaW5lXG4gICAgICB2YXIgbGFzdGlkeCA9IGJvZHkubGVuZ3RoIC0gMTtcblxuICAgICAgLy8gaW5zZXJ0IHJldHVybiBrZXl3b3JkXG4gICAgICBib2R5W2xhc3RpZHhdID0gJyAgZ2VuLm91dFsnICsgaSArICddICA9ICcgKyBib2R5W2xhc3RpZHhdICsgJ1xcbic7XG5cbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IGJvZHkuam9pbignXFxuJyk7XG4gICAgfVxuXG4gICAgdGhpcy5oaXN0b3JpZXMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkgdmFsdWUuZ2VuKCk7XG4gICAgfSk7XG5cbiAgICB2YXIgcmV0dXJuU3RhdGVtZW50ID0gaXNTdGVyZW8gPyAnICByZXR1cm4gZ2VuLm91dCcgOiAnICByZXR1cm4gZ2VuLm91dFswXSc7XG5cbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LnNwbGl0KCdcXG4nKTtcblxuICAgIGlmICh0aGlzLmVuZEJsb2NrLnNpemUpIHtcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuY29uY2F0KEFycmF5LmZyb20odGhpcy5lbmRCbG9jaykpO1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaChyZXR1cm5TdGF0ZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKHJldHVyblN0YXRlbWVudCk7XG4gICAgfVxuICAgIC8vIHJlYXNzZW1ibGUgZnVuY3Rpb24gYm9keVxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuam9pbignXFxuJyk7XG5cbiAgICAvLyB3ZSBjYW4gb25seSBkeW5hbWljYWxseSBjcmVhdGUgYSBuYW1lZCBmdW5jdGlvbiBieSBkeW5hbWljYWxseSBjcmVhdGluZyBhbm90aGVyIGZ1bmN0aW9uXG4gICAgLy8gdG8gY29uc3RydWN0IHRoZSBuYW1lZCBmdW5jdGlvbiEgc2hlZXNoLi4uXG4gICAgLy9cbiAgICBpZiAoc2hvdWxkSW5saW5lTWVtb3J5ID09PSB0cnVlKSB7XG4gICAgICB0aGlzLnBhcmFtZXRlcnMucHVzaCgnbWVtb3J5Jyk7XG4gICAgfVxuICAgIHZhciBidWlsZFN0cmluZyA9ICdyZXR1cm4gZnVuY3Rpb24gZ2VuKCAnICsgdGhpcy5wYXJhbWV0ZXJzLmpvaW4oJywnKSArICcgKXsgXFxuJyArIHRoaXMuZnVuY3Rpb25Cb2R5ICsgJ1xcbn0nO1xuXG4gICAgaWYgKHRoaXMuZGVidWcgfHwgZGVidWcpIGNvbnNvbGUubG9nKGJ1aWxkU3RyaW5nKTtcblxuICAgIGNhbGxiYWNrID0gbmV3IEZ1bmN0aW9uKGJ1aWxkU3RyaW5nKSgpO1xuXG4gICAgLy8gYXNzaWduIHByb3BlcnRpZXMgdG8gbmFtZWQgZnVuY3Rpb25cbiAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IHRoaXMuY2xvc3VyZXMudmFsdWVzKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICAgIHZhciBkaWN0ID0gX3N0ZXAudmFsdWU7XG5cbiAgICAgICAgdmFyIG5hbWUgPSBPYmplY3Qua2V5cyhkaWN0KVswXSxcbiAgICAgICAgICAgIHZhbHVlID0gZGljdFtuYW1lXTtcblxuICAgICAgICBjYWxsYmFja1tuYW1lXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWU7XG4gICAgdmFyIF9kaWRJdGVyYXRvckVycm9yMiA9IGZhbHNlO1xuICAgIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgdmFyIF9sb29wID0gZnVuY3Rpb24gX2xvb3AoKSB7XG4gICAgICAgIHZhciBkaWN0ID0gX3N0ZXAyLnZhbHVlO1xuXG4gICAgICAgIHZhciBuYW1lID0gT2JqZWN0LmtleXMoZGljdClbMF0sXG4gICAgICAgICAgICB1Z2VuID0gZGljdFtuYW1lXTtcblxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2FsbGJhY2ssIG5hbWUsIHtcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdWdlbi52YWx1ZTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldDogZnVuY3Rpb24gc2V0KHYpIHtcbiAgICAgICAgICAgIHVnZW4udmFsdWUgPSB2O1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgICB9O1xuXG4gICAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gdGhpcy5wYXJhbXMudmFsdWVzKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgICAgX2xvb3AoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMi5yZXR1cm4pIHtcbiAgICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2FsbGJhY2suZGF0YSA9IHRoaXMuZGF0YTtcbiAgICBjYWxsYmFjay5vdXQgPSBuZXcgRmxvYXQzMkFycmF5KDIpO1xuICAgIGNhbGxiYWNrLnBhcmFtZXRlcnMgPSB0aGlzLnBhcmFtZXRlcnMuc2xpY2UoMCk7XG5cbiAgICAvL2lmKCBNZW1vcnlIZWxwZXIuaXNQcm90b3R5cGVPZiggdGhpcy5tZW1vcnkgKSApXG4gICAgY2FsbGJhY2subWVtb3J5ID0gdGhpcy5tZW1vcnkuaGVhcDtcblxuICAgIHRoaXMuaGlzdG9yaWVzLmNsZWFyKCk7XG5cbiAgICByZXR1cm4gY2FsbGJhY2s7XG4gIH0sXG5cblxuICAvKiBnZXRJbnB1dHNcbiAgICpcbiAgICogR2l2ZW4gYW4gYXJndW1lbnQgdWdlbiwgZXh0cmFjdCBpdHMgaW5wdXRzLiBJZiB0aGV5IGFyZSBudW1iZXJzLCByZXR1cm4gdGhlIG51bWVicnMuIElmXG4gICAqIHRoZXkgYXJlIHVnZW5zLCBjYWxsIC5nZW4oKSBvbiB0aGUgdWdlbiwgbWVtb2l6ZSB0aGUgcmVzdWx0IGFuZCByZXR1cm4gdGhlIHJlc3VsdC4gSWYgdGhlXG4gICAqIHVnZW4gaGFzIHByZXZpb3VzbHkgYmVlbiBtZW1vaXplZCByZXR1cm4gdGhlIG1lbW9pemVkIHZhbHVlLlxuICAgKlxuICAgKi9cbiAgZ2V0SW5wdXRzOiBmdW5jdGlvbiBnZXRJbnB1dHModWdlbikge1xuICAgIHJldHVybiB1Z2VuLmlucHV0cy5tYXAoZ2VuLmdldElucHV0KTtcbiAgfSxcbiAgZ2V0SW5wdXQ6IGZ1bmN0aW9uIGdldElucHV0KGlucHV0KSB7XG4gICAgdmFyIGlzT2JqZWN0ID0gKHR5cGVvZiBpbnB1dCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoaW5wdXQpKSA9PT0gJ29iamVjdCcsXG4gICAgICAgIHByb2Nlc3NlZElucHV0ID0gdm9pZCAwO1xuXG4gICAgaWYgKGlzT2JqZWN0KSB7XG4gICAgICAvLyBpZiBpbnB1dCBpcyBhIHVnZW4uLi5cbiAgICAgIGlmIChnZW4ubWVtb1tpbnB1dC5uYW1lXSkge1xuICAgICAgICAvLyBpZiBpdCBoYXMgYmVlbiBtZW1vaXplZC4uLlxuICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGdlbi5tZW1vW2lucHV0Lm5hbWVdO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGlucHV0KSkge1xuICAgICAgICBnZW4uZ2V0SW5wdXQoaW5wdXRbMF0pO1xuICAgICAgICBnZW4uZ2V0SW5wdXQoaW5wdXRbMV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gaWYgbm90IG1lbW9pemVkIGdlbmVyYXRlIGNvZGUgXG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQuZ2VuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ25vIGdlbiBmb3VuZDonLCBpbnB1dCwgaW5wdXQuZ2VuKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29kZSA9IGlucHV0LmdlbigpO1xuICAgICAgICAvL2lmKCBjb2RlLmluZGV4T2YoICdPYmplY3QnICkgPiAtMSApIGNvbnNvbGUubG9nKCAnYmFkIGlucHV0OicsIGlucHV0LCBjb2RlIClcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjb2RlKSkge1xuICAgICAgICAgIGlmICghZ2VuLnNob3VsZExvY2FsaXplKSB7XG4gICAgICAgICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdlbi5jb2RlTmFtZSA9IGNvZGVbMF07XG4gICAgICAgICAgICBnZW4ubG9jYWxpemVkQ29kZS5wdXNoKGNvZGVbMV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnYWZ0ZXIgR0VOJyAsIHRoaXMuZnVuY3Rpb25Cb2R5IClcbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGl0IGlucHV0IGlzIGEgbnVtYmVyXG4gICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0O1xuICAgIH1cblxuICAgIHJldHVybiBwcm9jZXNzZWRJbnB1dDtcbiAgfSxcbiAgc3RhcnRMb2NhbGl6ZTogZnVuY3Rpb24gc3RhcnRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLmxvY2FsaXplZENvZGUgPSBbXTtcbiAgICB0aGlzLnNob3VsZExvY2FsaXplID0gdHJ1ZTtcbiAgfSxcbiAgZW5kTG9jYWxpemU6IGZ1bmN0aW9uIGVuZExvY2FsaXplKCkge1xuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSBmYWxzZTtcblxuICAgIHJldHVybiBbdGhpcy5jb2RlTmFtZSwgdGhpcy5sb2NhbGl6ZWRDb2RlLnNsaWNlKDApXTtcbiAgfSxcbiAgZnJlZTogZnVuY3Rpb24gZnJlZShncmFwaCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGdyYXBoKSkge1xuICAgICAgLy8gc3RlcmVvIHVnZW5cbiAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWU7XG4gICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IzID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IzID0gdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IzID0gZ3JhcGhbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDM7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSAoX3N0ZXAzID0gX2l0ZXJhdG9yMy5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWUpIHtcbiAgICAgICAgICB2YXIgY2hhbm5lbCA9IF9zdGVwMy52YWx1ZTtcblxuICAgICAgICAgIHRoaXMuZnJlZShjaGFubmVsKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yMyA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yMyA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyAmJiBfaXRlcmF0b3IzLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yMy5yZXR1cm4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMykge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoKHR5cGVvZiBncmFwaCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoZ3JhcGgpKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKGdyYXBoLm1lbW9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZm9yICh2YXIgbWVtb3J5S2V5IGluIGdyYXBoLm1lbW9yeSkge1xuICAgICAgICAgICAgdGhpcy5tZW1vcnkuZnJlZShncmFwaC5tZW1vcnlbbWVtb3J5S2V5XS5pZHgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShncmFwaC5pbnB1dHMpKSB7XG4gICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb240ID0gdHJ1ZTtcbiAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3I0ID0gZmFsc2U7XG4gICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yNCA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3I0ID0gZ3JhcGguaW5wdXRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA0OyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb240ID0gKF9zdGVwNCA9IF9pdGVyYXRvcjQubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjQgPSB0cnVlKSB7XG4gICAgICAgICAgICAgIHZhciB1Z2VuID0gX3N0ZXA0LnZhbHVlO1xuXG4gICAgICAgICAgICAgIHRoaXMuZnJlZSh1Z2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yNCA9IHRydWU7XG4gICAgICAgICAgICBfaXRlcmF0b3JFcnJvcjQgPSBlcnI7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjQgJiYgX2l0ZXJhdG9yNC5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3I0LnJldHVybigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3I0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnZ3QnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJztcblxuICAgIGlmIChpc05hTih0aGlzLmlucHV0c1swXSkgfHwgaXNOYU4odGhpcy5pbnB1dHNbMV0pKSB7XG4gICAgICBvdXQgKz0gJygoICcgKyBpbnB1dHNbMF0gKyAnID4gJyArIGlucHV0c1sxXSArICcpIHwgMCApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA+IGlucHV0c1sxXSA/IDEgOiAwO1xuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBndCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGd0LmlucHV0cyA9IFt4LCB5XTtcbiAgZ3QubmFtZSA9ICdndCcgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiBndDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2d0ZScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnO1xuXG4gICAgaWYgKGlzTmFOKHRoaXMuaW5wdXRzWzBdKSB8fCBpc05hTih0aGlzLmlucHV0c1sxXSkpIHtcbiAgICAgIG91dCArPSAnKCAnICsgaW5wdXRzWzBdICsgJyA+PSAnICsgaW5wdXRzWzFdICsgJyB8IDAgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPj0gaW5wdXRzWzFdID8gMSA6IDA7XG4gICAgfVxuICAgIG91dCArPSAnXFxuXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIGd0ID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgZ3QuaW5wdXRzID0gW3gsIHldO1xuICBndC5uYW1lID0gJ2d0ZScgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiBndDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2d0cCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4odGhpcy5pbnB1dHNbMF0pIHx8IGlzTmFOKHRoaXMuaW5wdXRzWzFdKSkge1xuICAgICAgb3V0ID0gJygnICsgaW5wdXRzWzBdICsgJyAqICggKCAnICsgaW5wdXRzWzBdICsgJyA+ICcgKyBpbnB1dHNbMV0gKyAnICkgfCAwICkgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSAqIChpbnB1dHNbMF0gPiBpbnB1dHNbMV0gfCAwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBndHAgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBndHAuaW5wdXRzID0gW3gsIHldO1xuXG4gIHJldHVybiBndHA7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGluMSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMF07XG5cbiAgdmFyIHVnZW4gPSB7XG4gICAgaW5wdXRzOiBbaW4xXSxcbiAgICBtZW1vcnk6IHsgdmFsdWU6IHsgbGVuZ3RoOiAxLCBpZHg6IG51bGwgfSB9LFxuICAgIHJlY29yZGVyOiBudWxsLFxuXG4gICAgaW46IGZ1bmN0aW9uIF9pbih2KSB7XG4gICAgICBpZiAoX2dlbi5oaXN0b3JpZXMuaGFzKHYpKSB7XG4gICAgICAgIHZhciBtZW1vSGlzdG9yeSA9IF9nZW4uaGlzdG9yaWVzLmdldCh2KTtcbiAgICAgICAgdWdlbi5uYW1lID0gbWVtb0hpc3RvcnkubmFtZTtcbiAgICAgICAgcmV0dXJuIG1lbW9IaXN0b3J5O1xuICAgICAgfVxuXG4gICAgICB2YXIgb2JqID0ge1xuICAgICAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgICAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModWdlbik7XG5cbiAgICAgICAgICBpZiAodWdlbi5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsKSB7XG4gICAgICAgICAgICBfZ2VuLnJlcXVlc3RNZW1vcnkodWdlbi5tZW1vcnkpO1xuICAgICAgICAgICAgX2dlbi5tZW1vcnkuaGVhcFt1Z2VuLm1lbW9yeS52YWx1ZS5pZHhdID0gaW4xO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBpZHggPSB1Z2VuLm1lbW9yeS52YWx1ZS5pZHg7XG5cbiAgICAgICAgICBfZ2VuLmFkZFRvRW5kQmxvY2soJ21lbW9yeVsgJyArIGlkeCArICcgXSA9ICcgKyBpbnB1dHNbMF0pO1xuXG4gICAgICAgICAgLy8gcmV0dXJuIHVnZW4gdGhhdCBpcyBiZWluZyByZWNvcmRlZCBpbnN0ZWFkIG9mIHNzZC5cbiAgICAgICAgICAvLyB0aGlzIGVmZmVjdGl2ZWx5IG1ha2VzIGEgY2FsbCB0byBzc2QucmVjb3JkKCkgdHJhbnNwYXJlbnQgdG8gdGhlIGdyYXBoLlxuICAgICAgICAgIC8vIHJlY29yZGluZyBpcyB0cmlnZ2VyZWQgYnkgcHJpb3IgY2FsbCB0byBnZW4uYWRkVG9FbmRCbG9jay5cbiAgICAgICAgICBfZ2VuLmhpc3Rvcmllcy5zZXQodiwgb2JqKTtcblxuICAgICAgICAgIHJldHVybiBpbnB1dHNbMF07XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmFtZTogdWdlbi5uYW1lICsgJ19pbicgKyBfZ2VuLmdldFVJRCgpLFxuICAgICAgICBtZW1vcnk6IHVnZW4ubWVtb3J5XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmlucHV0c1swXSA9IHY7XG5cbiAgICAgIHVnZW4ucmVjb3JkZXIgPSBvYmo7XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcblxuXG4gICAgb3V0OiB7XG4gICAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgICAgaWYgKHVnZW4ubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCkge1xuICAgICAgICAgIGlmIChfZ2VuLmhpc3Rvcmllcy5nZXQodWdlbi5pbnB1dHNbMF0pID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIF9nZW4uaGlzdG9yaWVzLnNldCh1Z2VuLmlucHV0c1swXSwgdWdlbi5yZWNvcmRlcik7XG4gICAgICAgICAgfVxuICAgICAgICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh1Z2VuLm1lbW9yeSk7XG4gICAgICAgICAgX2dlbi5tZW1vcnkuaGVhcFt1Z2VuLm1lbW9yeS52YWx1ZS5pZHhdID0gcGFyc2VGbG9hdChpbjEpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpZHggPSB1Z2VuLm1lbW9yeS52YWx1ZS5pZHg7XG5cbiAgICAgICAgcmV0dXJuICdtZW1vcnlbICcgKyBpZHggKyAnIF0gJztcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpXG4gIH07XG5cbiAgdWdlbi5vdXQubWVtb3J5ID0gdWdlbi5tZW1vcnk7XG5cbiAgdWdlbi5uYW1lID0gJ2hpc3RvcnknICsgdWdlbi51aWQ7XG4gIHVnZW4ub3V0Lm5hbWUgPSB1Z2VuLm5hbWUgKyAnX291dCc7XG4gIHVnZW4uaW4uX25hbWUgPSB1Z2VuLm5hbWUgPSAnX2luJztcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgaWYgKHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gX2dlbi5tZW1vcnkuaGVhcFt0aGlzLm1lbW9yeS52YWx1ZS5pZHhdO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodikge1xuICAgICAgaWYgKHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCkge1xuICAgICAgICBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF0gPSB2O1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIi8qXG5cbiBhID0gY29uZGl0aW9uYWwoIGNvbmRpdGlvbiwgdHJ1ZUJsb2NrLCBmYWxzZUJsb2NrIClcbiBiID0gY29uZGl0aW9uYWwoW1xuICAgY29uZGl0aW9uMSwgYmxvY2sxLFxuICAgY29uZGl0aW9uMiwgYmxvY2syLFxuICAgY29uZGl0aW9uMywgYmxvY2szLFxuICAgZGVmYXVsdEJsb2NrXG4gXSlcblxuKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnaWZlbHNlJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgY29uZGl0aW9uYWxzID0gdGhpcy5pbnB1dHNbMF0sXG4gICAgICAgIGRlZmF1bHRWYWx1ZSA9IF9nZW4uZ2V0SW5wdXQoY29uZGl0aW9uYWxzW2NvbmRpdGlvbmFscy5sZW5ndGggLSAxXSksXG4gICAgICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJ19vdXQgPSAnICsgZGVmYXVsdFZhbHVlICsgJ1xcbic7XG5cbiAgICAvL2NvbnNvbGUubG9nKCAnZGVmYXVsdFZhbHVlOicsIGRlZmF1bHRWYWx1ZSApXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbmRpdGlvbmFscy5sZW5ndGggLSAyOyBpICs9IDIpIHtcbiAgICAgIHZhciBpc0VuZEJsb2NrID0gaSA9PT0gY29uZGl0aW9uYWxzLmxlbmd0aCAtIDMsXG4gICAgICAgICAgY29uZCA9IF9nZW4uZ2V0SW5wdXQoY29uZGl0aW9uYWxzW2ldKSxcbiAgICAgICAgICBwcmVibG9jayA9IGNvbmRpdGlvbmFsc1tpICsgMV0sXG4gICAgICAgICAgYmxvY2sgPSB2b2lkIDAsXG4gICAgICAgICAgYmxvY2tOYW1lID0gdm9pZCAwLFxuICAgICAgICAgIG91dHB1dCA9IHZvaWQgMDtcblxuICAgICAgLy9jb25zb2xlLmxvZyggJ3BiJywgcHJlYmxvY2sgKVxuXG4gICAgICBpZiAodHlwZW9mIHByZWJsb2NrID09PSAnbnVtYmVyJykge1xuICAgICAgICBibG9jayA9IHByZWJsb2NrO1xuICAgICAgICBibG9ja05hbWUgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKF9nZW4ubWVtb1twcmVibG9jay5uYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gdXNlZCB0byBwbGFjZSBhbGwgY29kZSBkZXBlbmRlbmNpZXMgaW4gYXBwcm9wcmlhdGUgYmxvY2tzXG4gICAgICAgICAgX2dlbi5zdGFydExvY2FsaXplKCk7XG5cbiAgICAgICAgICBfZ2VuLmdldElucHV0KHByZWJsb2NrKTtcblxuICAgICAgICAgIGJsb2NrID0gX2dlbi5lbmRMb2NhbGl6ZSgpO1xuICAgICAgICAgIGJsb2NrTmFtZSA9IGJsb2NrWzBdO1xuICAgICAgICAgIGJsb2NrID0gYmxvY2tbMV0uam9pbignJyk7XG4gICAgICAgICAgYmxvY2sgPSAnICAnICsgYmxvY2sucmVwbGFjZSgvXFxuL2dpLCAnXFxuICAnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBibG9jayA9ICcnO1xuICAgICAgICAgIGJsb2NrTmFtZSA9IF9nZW4ubWVtb1twcmVibG9jay5uYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvdXRwdXQgPSBibG9ja05hbWUgPT09IG51bGwgPyAnICAnICsgdGhpcy5uYW1lICsgJ19vdXQgPSAnICsgYmxvY2sgOiBibG9jayArICcgICcgKyB0aGlzLm5hbWUgKyAnX291dCA9ICcgKyBibG9ja05hbWU7XG5cbiAgICAgIGlmIChpID09PSAwKSBvdXQgKz0gJyAnO1xuICAgICAgb3V0ICs9ICcgaWYoICcgKyBjb25kICsgJyA9PT0gMSApIHtcXG4nICsgb3V0cHV0ICsgJ1xcbiAgfSc7XG5cbiAgICAgIGlmICghaXNFbmRCbG9jaykge1xuICAgICAgICBvdXQgKz0gJyBlbHNlJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dCArPSAnXFxuJztcbiAgICAgIH1cbiAgICAgIC8qICAgICAgICAgXG4gICAgICAgZWxzZWBcbiAgICAgICAgICAgIH1lbHNlIGlmKCBpc0VuZEJsb2NrICkge1xuICAgICAgICAgICAgICBvdXQgKz0gYHtcXG4gICR7b3V0cHV0fVxcbiAgfVxcbmBcbiAgICAgICAgICAgIH1lbHNlIHtcbiAgICAgIFxuICAgICAgICAgICAgICAvL2lmKCBpICsgMiA9PT0gY29uZGl0aW9uYWxzLmxlbmd0aCB8fCBpID09PSBjb25kaXRpb25hbHMubGVuZ3RoIC0gMSApIHtcbiAgICAgICAgICAgICAgLy8gIG91dCArPSBge1xcbiAgJHtvdXRwdXR9XFxuICB9XFxuYFxuICAgICAgICAgICAgICAvL31lbHNle1xuICAgICAgICAgICAgICAgIG91dCArPSBcbiAgICAgIGAgaWYoICR7Y29uZH0gPT09IDEgKSB7XG4gICAgICAke291dHB1dH1cbiAgICAgICAgfSBlbHNlIGBcbiAgICAgICAgICAgICAgLy99XG4gICAgICAgICAgICB9Ki9cbiAgICB9XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZSArICdfb3V0JztcblxuICAgIHJldHVybiBbdGhpcy5uYW1lICsgJ19vdXQnLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGNvbmRpdGlvbnMgPSBBcnJheS5pc0FycmF5KGFyZ3NbMF0pID8gYXJnc1swXSA6IGFyZ3M7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2NvbmRpdGlvbnNdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2luJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICBfZ2VuLnBhcmFtZXRlcnMucHVzaCh0aGlzLm5hbWUpO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gdGhpcy5uYW1lO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHZhciBpbnB1dCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGlucHV0LmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgaW5wdXQubmFtZSA9IG5hbWUgIT09IHVuZGVmaW5lZCA/IG5hbWUgOiAnJyArIGlucHV0LmJhc2VuYW1lICsgaW5wdXQuaWQ7XG4gIGlucHV0WzBdID0ge1xuICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgaWYgKCFfZ2VuLnBhcmFtZXRlcnMuaW5jbHVkZXMoaW5wdXQubmFtZSkpIF9nZW4ucGFyYW1ldGVycy5wdXNoKGlucHV0Lm5hbWUpO1xuICAgICAgcmV0dXJuIGlucHV0Lm5hbWUgKyAnWzBdJztcbiAgICB9XG4gIH07XG4gIGlucHV0WzFdID0ge1xuICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgaWYgKCFfZ2VuLnBhcmFtZXRlcnMuaW5jbHVkZXMoaW5wdXQubmFtZSkpIF9nZW4ucGFyYW1ldGVycy5wdXNoKGlucHV0Lm5hbWUpO1xuICAgICAgcmV0dXJuIGlucHV0Lm5hbWUgKyAnWzFdJztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGlucHV0O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBsaWJyYXJ5ID0ge1xuICBleHBvcnQ6IGZ1bmN0aW9uIF9leHBvcnQoZGVzdGluYXRpb24pIHtcbiAgICBpZiAoZGVzdGluYXRpb24gPT09IHdpbmRvdykge1xuICAgICAgZGVzdGluYXRpb24uc3NkID0gbGlicmFyeS5oaXN0b3J5OyAvLyBoaXN0b3J5IGlzIHdpbmRvdyBvYmplY3QgcHJvcGVydHksIHNvIHVzZSBzc2QgYXMgYWxpYXNcbiAgICAgIGRlc3RpbmF0aW9uLmlucHV0ID0gbGlicmFyeS5pbjsgLy8gaW4gaXMgYSBrZXl3b3JkIGluIGphdmFzY3JpcHRcbiAgICAgIGRlc3RpbmF0aW9uLnRlcm5hcnkgPSBsaWJyYXJ5LnN3aXRjaDsgLy8gc3dpdGNoIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG5cbiAgICAgIGRlbGV0ZSBsaWJyYXJ5Lmhpc3Rvcnk7XG4gICAgICBkZWxldGUgbGlicmFyeS5pbjtcbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LnN3aXRjaDtcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKGRlc3RpbmF0aW9uLCBsaWJyYXJ5KTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShsaWJyYXJ5LCAnc2FtcGxlcmF0ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICByZXR1cm4gbGlicmFyeS5nZW4uc2FtcGxlcmF0ZTtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7fVxuICAgIH0pO1xuXG4gICAgbGlicmFyeS5pbiA9IGRlc3RpbmF0aW9uLmlucHV0O1xuICAgIGxpYnJhcnkuaGlzdG9yeSA9IGRlc3RpbmF0aW9uLnNzZDtcbiAgICBsaWJyYXJ5LnN3aXRjaCA9IGRlc3RpbmF0aW9uLnRlcm5hcnk7XG5cbiAgICBkZXN0aW5hdGlvbi5jbGlwID0gbGlicmFyeS5jbGFtcDtcbiAgfSxcblxuXG4gIGdlbjogcmVxdWlyZSgnLi9nZW4uanMnKSxcblxuICBhYnM6IHJlcXVpcmUoJy4vYWJzLmpzJyksXG4gIHJvdW5kOiByZXF1aXJlKCcuL3JvdW5kLmpzJyksXG4gIHBhcmFtOiByZXF1aXJlKCcuL3BhcmFtLmpzJyksXG4gIGFkZDogcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgc3ViOiByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICBtdWw6IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gIGRpdjogcmVxdWlyZSgnLi9kaXYuanMnKSxcbiAgYWNjdW06IHJlcXVpcmUoJy4vYWNjdW0uanMnKSxcbiAgY291bnRlcjogcmVxdWlyZSgnLi9jb3VudGVyLmpzJyksXG4gIHNpbjogcmVxdWlyZSgnLi9zaW4uanMnKSxcbiAgY29zOiByZXF1aXJlKCcuL2Nvcy5qcycpLFxuICB0YW46IHJlcXVpcmUoJy4vdGFuLmpzJyksXG4gIHRhbmg6IHJlcXVpcmUoJy4vdGFuaC5qcycpLFxuICBhc2luOiByZXF1aXJlKCcuL2FzaW4uanMnKSxcbiAgYWNvczogcmVxdWlyZSgnLi9hY29zLmpzJyksXG4gIGF0YW46IHJlcXVpcmUoJy4vYXRhbi5qcycpLFxuICBwaGFzb3I6IHJlcXVpcmUoJy4vcGhhc29yLmpzJyksXG4gIGRhdGE6IHJlcXVpcmUoJy4vZGF0YS5qcycpLFxuICBwZWVrOiByZXF1aXJlKCcuL3BlZWsuanMnKSxcbiAgY3ljbGU6IHJlcXVpcmUoJy4vY3ljbGUuanMnKSxcbiAgaGlzdG9yeTogcmVxdWlyZSgnLi9oaXN0b3J5LmpzJyksXG4gIGRlbHRhOiByZXF1aXJlKCcuL2RlbHRhLmpzJyksXG4gIGZsb29yOiByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gIGNlaWw6IHJlcXVpcmUoJy4vY2VpbC5qcycpLFxuICBtaW46IHJlcXVpcmUoJy4vbWluLmpzJyksXG4gIG1heDogcmVxdWlyZSgnLi9tYXguanMnKSxcbiAgc2lnbjogcmVxdWlyZSgnLi9zaWduLmpzJyksXG4gIGRjYmxvY2s6IHJlcXVpcmUoJy4vZGNibG9jay5qcycpLFxuICBtZW1vOiByZXF1aXJlKCcuL21lbW8uanMnKSxcbiAgcmF0ZTogcmVxdWlyZSgnLi9yYXRlLmpzJyksXG4gIHdyYXA6IHJlcXVpcmUoJy4vd3JhcC5qcycpLFxuICBtaXg6IHJlcXVpcmUoJy4vbWl4LmpzJyksXG4gIGNsYW1wOiByZXF1aXJlKCcuL2NsYW1wLmpzJyksXG4gIHBva2U6IHJlcXVpcmUoJy4vcG9rZS5qcycpLFxuICBkZWxheTogcmVxdWlyZSgnLi9kZWxheS5qcycpLFxuICBmb2xkOiByZXF1aXJlKCcuL2ZvbGQuanMnKSxcbiAgbW9kOiByZXF1aXJlKCcuL21vZC5qcycpLFxuICBzYWg6IHJlcXVpcmUoJy4vc2FoLmpzJyksXG4gIG5vaXNlOiByZXF1aXJlKCcuL25vaXNlLmpzJyksXG4gIG5vdDogcmVxdWlyZSgnLi9ub3QuanMnKSxcbiAgZ3Q6IHJlcXVpcmUoJy4vZ3QuanMnKSxcbiAgZ3RlOiByZXF1aXJlKCcuL2d0ZS5qcycpLFxuICBsdDogcmVxdWlyZSgnLi9sdC5qcycpLFxuICBsdGU6IHJlcXVpcmUoJy4vbHRlLmpzJyksXG4gIGJvb2w6IHJlcXVpcmUoJy4vYm9vbC5qcycpLFxuICBnYXRlOiByZXF1aXJlKCcuL2dhdGUuanMnKSxcbiAgdHJhaW46IHJlcXVpcmUoJy4vdHJhaW4uanMnKSxcbiAgc2xpZGU6IHJlcXVpcmUoJy4vc2xpZGUuanMnKSxcbiAgaW46IHJlcXVpcmUoJy4vaW4uanMnKSxcbiAgdDYwOiByZXF1aXJlKCcuL3Q2MC5qcycpLFxuICBtdG9mOiByZXF1aXJlKCcuL210b2YuanMnKSxcbiAgbHRwOiByZXF1aXJlKCcuL2x0cC5qcycpLCAvLyBUT0RPOiB0ZXN0XG4gIGd0cDogcmVxdWlyZSgnLi9ndHAuanMnKSwgLy8gVE9ETzogdGVzdFxuICBzd2l0Y2g6IHJlcXVpcmUoJy4vc3dpdGNoLmpzJyksXG4gIG1zdG9zYW1wczogcmVxdWlyZSgnLi9tc3Rvc2FtcHMuanMnKSwgLy8gVE9ETzogbmVlZHMgdGVzdCxcbiAgc2VsZWN0b3I6IHJlcXVpcmUoJy4vc2VsZWN0b3IuanMnKSxcbiAgdXRpbGl0aWVzOiByZXF1aXJlKCcuL3V0aWxpdGllcy5qcycpLFxuICBwb3c6IHJlcXVpcmUoJy4vcG93LmpzJyksXG4gIGF0dGFjazogcmVxdWlyZSgnLi9hdHRhY2suanMnKSxcbiAgZGVjYXk6IHJlcXVpcmUoJy4vZGVjYXkuanMnKSxcbiAgd2luZG93czogcmVxdWlyZSgnLi93aW5kb3dzLmpzJyksXG4gIGVudjogcmVxdWlyZSgnLi9lbnYuanMnKSxcbiAgYWQ6IHJlcXVpcmUoJy4vYWQuanMnKSxcbiAgYWRzcjogcmVxdWlyZSgnLi9hZHNyLmpzJyksXG4gIGlmZWxzZTogcmVxdWlyZSgnLi9pZmVsc2VpZi5qcycpLFxuICBiYW5nOiByZXF1aXJlKCcuL2JhbmcuanMnKSxcbiAgYW5kOiByZXF1aXJlKCcuL2FuZC5qcycpLFxuICBwYW46IHJlcXVpcmUoJy4vcGFuLmpzJyksXG4gIGVxOiByZXF1aXJlKCcuL2VxLmpzJyksXG4gIG5lcTogcmVxdWlyZSgnLi9uZXEuanMnKVxufTtcblxubGlicmFyeS5nZW4ubGliID0gbGlicmFyeTtcblxubW9kdWxlLmV4cG9ydHMgPSBsaWJyYXJ5OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdsdCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnO1xuXG4gICAgaWYgKGlzTmFOKHRoaXMuaW5wdXRzWzBdKSB8fCBpc05hTih0aGlzLmlucHV0c1sxXSkpIHtcbiAgICAgIG91dCArPSAnKCggJyArIGlucHV0c1swXSArICcgPCAnICsgaW5wdXRzWzFdICsgJykgfCAwICApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8IGlucHV0c1sxXSA/IDEgOiAwO1xuICAgIH1cbiAgICBvdXQgKz0gJ1xcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgbHQgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBsdC5pbnB1dHMgPSBbeCwgeV07XG4gIGx0Lm5hbWUgPSAnbHQnICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gbHQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdsdGUnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJztcblxuICAgIGlmIChpc05hTih0aGlzLmlucHV0c1swXSkgfHwgaXNOYU4odGhpcy5pbnB1dHNbMV0pKSB7XG4gICAgICBvdXQgKz0gJyggJyArIGlucHV0c1swXSArICcgPD0gJyArIGlucHV0c1sxXSArICcgfCAwICApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8PSBpbnB1dHNbMV0gPyAxIDogMDtcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIGx0ID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbHQuaW5wdXRzID0gW3gsIHldO1xuICBsdC5uYW1lID0gJ2x0ZScgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiBsdDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2x0cCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4odGhpcy5pbnB1dHNbMF0pIHx8IGlzTmFOKHRoaXMuaW5wdXRzWzFdKSkge1xuICAgICAgb3V0ID0gJygnICsgaW5wdXRzWzBdICsgJyAqICgoICcgKyBpbnB1dHNbMF0gKyAnIDwgJyArIGlucHV0c1sxXSArICcgKSB8IDAgKSApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKGlucHV0c1swXSA8IGlucHV0c1sxXSB8IDApO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIGx0cCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGx0cC5pbnB1dHMgPSBbeCwgeV07XG5cbiAgcmV0dXJuIGx0cDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ21heCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSB8fCBpc05hTihpbnB1dHNbMV0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sIHRoaXMubmFtZSwgTWF0aC5tYXgpKTtcblxuICAgICAgb3V0ID0gJ2dlbi5tYXgoICcgKyBpbnB1dHNbMF0gKyAnLCAnICsgaW5wdXRzWzFdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5tYXgocGFyc2VGbG9hdChpbnB1dHNbMF0pLCBwYXJzZUZsb2F0KGlucHV0c1sxXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIG1heCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIG1heC5pbnB1dHMgPSBbeCwgeV07XG5cbiAgcmV0dXJuIG1heDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdtZW1vJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICcgKyBpbnB1dHNbMF0gKyAnXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSwgbWVtb05hbWUpIHtcbiAgdmFyIG1lbW8gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBtZW1vLmlucHV0cyA9IFtpbjFdO1xuICBtZW1vLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgbWVtby5uYW1lID0gbWVtb05hbWUgIT09IHVuZGVmaW5lZCA/IG1lbW9OYW1lICsgJ18nICsgX2dlbi5nZXRVSUQoKSA6ICcnICsgbWVtby5iYXNlbmFtZSArIG1lbW8uaWQ7XG5cbiAgcmV0dXJuIG1lbW87XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdtaW4nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkgfHwgaXNOYU4oaW5wdXRzWzFdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIE1hdGgubWluKSk7XG5cbiAgICAgIG91dCA9ICdnZW4ubWluKCAnICsgaW5wdXRzWzBdICsgJywgJyArIGlucHV0c1sxXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgubWluKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSwgcGFyc2VGbG9hdChpbnB1dHNbMV0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBtaW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBtaW4uaW5wdXRzID0gW3gsIHldO1xuXG4gIHJldHVybiBtaW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIGluMikge1xuICAgIHZhciB0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gLjUgOiBhcmd1bWVudHNbMl07XG5cbiAgICB2YXIgdWdlbiA9IG1lbW8oYWRkKG11bChpbjEsIHN1YigxLCB0KSksIG11bChpbjIsIHQpKSk7XG4gICAgdWdlbi5uYW1lID0gJ21peCcgKyBnZW4uZ2V0VUlEKCk7XG5cbiAgICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICB2YXIgbW9kID0ge1xuICAgIGlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICAgIG91dCA9ICcoJyxcbiAgICAgICAgICBkaWZmID0gMCxcbiAgICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgICAgbGFzdE51bWJlciA9IGlucHV0c1swXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4obGFzdE51bWJlciksXG4gICAgICAgICAgbW9kQXRFbmQgPSBmYWxzZTtcblxuICAgICAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgICAgaWYgKGkgPT09IDApIHJldHVybjtcblxuICAgICAgICB2YXIgaXNOdW1iZXJVZ2VuID0gaXNOYU4odiksXG4gICAgICAgICAgICBpc0ZpbmFsSWR4ID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDE7XG5cbiAgICAgICAgaWYgKCFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4pIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAlIHY7XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXIgKyAnICUgJyArIHY7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzRmluYWxJZHgpIG91dCArPSAnICUgJztcbiAgICAgIH0pO1xuXG4gICAgICBvdXQgKz0gJyknO1xuXG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gbW9kO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ21zdG9zYW1wcycsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIHJldHVyblZhbHVlID0gdm9pZCAwO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICcgKyBfZ2VuLnNhbXBsZXJhdGUgKyAnIC8gMTAwMCAqICcgKyBpbnB1dHNbMF0gKyAnIFxcblxcbic7XG5cbiAgICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gb3V0O1xuXG4gICAgICByZXR1cm5WYWx1ZSA9IFt0aGlzLm5hbWUsIG91dF07XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IF9nZW4uc2FtcGxlcmF0ZSAvIDEwMDAgKiB0aGlzLmlucHV0c1swXTtcblxuICAgICAgcmV0dXJuVmFsdWUgPSBvdXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBtc3Rvc2FtcHMgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBtc3Rvc2FtcHMuaW5wdXRzID0gW3hdO1xuICBtc3Rvc2FtcHMubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gbXN0b3NhbXBzO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnbXRvZicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIE1hdGguZXhwKSk7XG5cbiAgICAgIG91dCA9ICcoICcgKyB0aGlzLnR1bmluZyArICcgKiBnZW4uZXhwKCAuMDU3NzYyMjY1ICogKCcgKyBpbnB1dHNbMF0gKyAnIC0gNjkpICkgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IHRoaXMudHVuaW5nICogTWF0aC5leHAoLjA1Nzc2MjI2NSAqIChpbnB1dHNbMF0gLSA2OSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHByb3BzKSB7XG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBkZWZhdWx0cyA9IHsgdHVuaW5nOiA0NDAgfTtcblxuICBpZiAocHJvcHMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihwcm9wcy5kZWZhdWx0cyk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCBkZWZhdWx0cyk7XG4gIHVnZW4uaW5wdXRzID0gW3hdO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciBtdWwgPSB7XG4gICAgaWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgICAgb3V0ID0gJygnLFxuICAgICAgICAgIHN1bSA9IDEsXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIG11bEF0RW5kID0gZmFsc2UsXG4gICAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSB0cnVlO1xuXG4gICAgICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xuICAgICAgICBpZiAoaXNOYU4odikpIHtcbiAgICAgICAgICBvdXQgKz0gdjtcbiAgICAgICAgICBpZiAoaSA8IGlucHV0cy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBtdWxBdEVuZCA9IHRydWU7XG4gICAgICAgICAgICBvdXQgKz0gJyAqICc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFscmVhZHlGdWxsU3VtbWVkID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIHN1bSA9IHY7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1bSAqPSBwYXJzZUZsb2F0KHYpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBudW1Db3VudCsrO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKGFscmVhZHlGdWxsU3VtbWVkKSBvdXQgPSAnJztcblxuICAgICAgaWYgKG51bUNvdW50ID4gMCkge1xuICAgICAgICBvdXQgKz0gbXVsQXRFbmQgfHwgYWxyZWFkeUZ1bGxTdW1tZWQgPyBzdW0gOiAnICogJyArIHN1bTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFhbHJlYWR5RnVsbFN1bW1lZCkgb3V0ICs9ICcpJztcblxuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIG11bDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICduZXEnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgb3V0ID0gdm9pZCAwO1xuXG4gICAgb3V0ID0gLyp0aGlzLmlucHV0c1swXSAhPT0gdGhpcy5pbnB1dHNbMV0gPyAxIDoqLycgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICgnICsgaW5wdXRzWzBdICsgJyAhPT0gJyArIGlucHV0c1sxXSArICcpIHwgMFxcblxcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIGluMikge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBpbjJdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnbm9pc2UnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDA7XG5cbiAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICdub2lzZSc6IE1hdGgucmFuZG9tIH0pO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gZ2VuLm5vaXNlKClcXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgbm9pc2UgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgbm9pc2UubmFtZSA9IHByb3RvLm5hbWUgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiBub2lzZTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ25vdCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4odGhpcy5pbnB1dHNbMF0pKSB7XG4gICAgICBvdXQgPSAnKCAnICsgaW5wdXRzWzBdICsgJyA9PT0gMCA/IDEgOiAwICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSAhaW5wdXRzWzBdID09PSAwID8gMSA6IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgbm90ID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbm90LmlucHV0cyA9IFt4XTtcblxuICByZXR1cm4gbm90O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3BhbicsXG4gIGluaXRUYWJsZTogZnVuY3Rpb24gaW5pdFRhYmxlKCkge1xuICAgIHZhciBidWZmZXJMID0gbmV3IEZsb2F0MzJBcnJheSgxMDI0KSxcbiAgICAgICAgYnVmZmVyUiA9IG5ldyBGbG9hdDMyQXJyYXkoMTAyNCk7XG5cbiAgICB2YXIgc3FydFR3b092ZXJUd28gPSBNYXRoLnNxcnQoMikgLyAyO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDI0OyBpKyspIHtcbiAgICAgIHZhciBwYW4gPSAtMSArIGkgLyAxMDI0ICogMjtcbiAgICAgIGJ1ZmZlckxbaV0gPSBzcXJ0VHdvT3ZlclR3byAqIChNYXRoLmNvcyhwYW4pIC0gTWF0aC5zaW4ocGFuKSk7XG4gICAgICBidWZmZXJSW2ldID0gc3FydFR3b092ZXJUd28gKiAoTWF0aC5jb3MocGFuKSArIE1hdGguc2luKHBhbikpO1xuICAgIH1cblxuICAgIGdlbi5nbG9iYWxzLnBhbkwgPSBkYXRhKGJ1ZmZlckwsIDEsIHsgaW1tdXRhYmxlOiB0cnVlIH0pO1xuICAgIGdlbi5nbG9iYWxzLnBhblIgPSBkYXRhKGJ1ZmZlclIsIDEsIHsgaW1tdXRhYmxlOiB0cnVlIH0pO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsZWZ0SW5wdXQsIHJpZ2h0SW5wdXQsIHBhbiwgcHJvcGVydGllcykge1xuICBpZiAoZ2VuLmdsb2JhbHMucGFuTCA9PT0gdW5kZWZpbmVkKSBwcm90by5pbml0VGFibGUoKTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIHVpZDogZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2xlZnRJbnB1dCwgcmlnaHRJbnB1dF0sXG4gICAgbGVmdDogbXVsKGxlZnRJbnB1dCwgcGVlayhnZW4uZ2xvYmFscy5wYW5MLCBwYW4sIHsgYm91bmRtb2RlOiAnY2xhbXAnIH0pKSxcbiAgICByaWdodDogbXVsKHJpZ2h0SW5wdXQsIHBlZWsoZ2VuLmdsb2JhbHMucGFuUiwgcGFuLCB7IGJvdW5kbW9kZTogJ2NsYW1wJyB9KSlcbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSk7XG5cbiAgICBfZ2VuLnBhcmFtcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIHRoaXMpKTtcblxuICAgIHRoaXMudmFsdWUgPSB0aGlzLmluaXRpYWxWYWx1ZTtcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJ21lbW9yeVsnICsgdGhpcy5tZW1vcnkudmFsdWUuaWR4ICsgJ10nO1xuXG4gICAgcmV0dXJuIF9nZW4ubWVtb1t0aGlzLm5hbWVdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHByb3BOYW1lID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1swXTtcbiAgdmFyIHZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1sxXTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGlmICh0eXBlb2YgcHJvcE5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgdWdlbi5uYW1lID0gJ3BhcmFtJyArIF9nZW4uZ2V0VUlEKCk7XG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSBwcm9wTmFtZTtcbiAgfSBlbHNlIHtcbiAgICB1Z2VuLm5hbWUgPSBwcm9wTmFtZTtcbiAgICB1Z2VuLmluaXRpYWxWYWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIGlmICh0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIF9nZW4ubWVtb3J5LmhlYXBbdGhpcy5tZW1vcnkudmFsdWUuaWR4XTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHYpIHtcbiAgICAgIGlmICh0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwpIHtcbiAgICAgICAgX2dlbi5tZW1vcnkuaGVhcFt0aGlzLm1lbW9yeS52YWx1ZS5pZHhdID0gdjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlOiB7IGxlbmd0aDogMSwgaWR4OiBudWxsIH1cbiAgfTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdwZWVrJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMCxcbiAgICAgICAgZnVuY3Rpb25Cb2R5ID0gdm9pZCAwLFxuICAgICAgICBuZXh0ID0gdm9pZCAwLFxuICAgICAgICBsZW5ndGhJc0xvZzIgPSB2b2lkIDAsXG4gICAgICAgIGlkeCA9IHZvaWQgMDtcblxuICAgIGlkeCA9IGlucHV0c1sxXTtcbiAgICBsZW5ndGhJc0xvZzIgPSAoTWF0aC5sb2cyKHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoKSB8IDApID09PSBNYXRoLmxvZzIodGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGgpO1xuXG4gICAgaWYgKHRoaXMubW9kZSAhPT0gJ3NpbXBsZScpIHtcblxuICAgICAgZnVuY3Rpb25Cb2R5ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnX2RhdGFJZHggID0gJyArIGlkeCArICcsIFxcbiAgICAgICcgKyB0aGlzLm5hbWUgKyAnX3BoYXNlID0gJyArICh0aGlzLm1vZGUgPT09ICdzYW1wbGVzJyA/IGlucHV0c1swXSA6IGlucHV0c1swXSArICcgKiAnICsgKHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMSkpICsgJywgXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfaW5kZXggPSAnICsgdGhpcy5uYW1lICsgJ19waGFzZSB8IDAsXFxuJztcblxuICAgICAgaWYgKHRoaXMuYm91bmRtb2RlID09PSAnd3JhcCcpIHtcbiAgICAgICAgbmV4dCA9IGxlbmd0aElzTG9nMiA/ICcoICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4ICsgMSApICYgKCcgKyB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCArICcgLSAxKScgOiB0aGlzLm5hbWUgKyAnX2luZGV4ICsgMSA+PSAnICsgdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKyAnID8gJyArIHRoaXMubmFtZSArICdfaW5kZXggKyAxIC0gJyArIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoICsgJyA6ICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4ICsgMSc7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuYm91bmRtb2RlID09PSAnY2xhbXAnKSB7XG4gICAgICAgIG5leHQgPSB0aGlzLm5hbWUgKyAnX2luZGV4ICsgMSA+PSAnICsgKHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMSkgKyAnID8gJyArICh0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDEpICsgJyA6ICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4ICsgMSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0ID0gdGhpcy5uYW1lICsgJ19pbmRleCArIDEnO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pbnRlcnAgPT09ICdsaW5lYXInKSB7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSAnICAgICAgJyArIHRoaXMubmFtZSArICdfZnJhYyAgPSAnICsgdGhpcy5uYW1lICsgJ19waGFzZSAtICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4LFxcbiAgICAgICcgKyB0aGlzLm5hbWUgKyAnX2Jhc2UgID0gbWVtb3J5WyAnICsgdGhpcy5uYW1lICsgJ19kYXRhSWR4ICsgICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4IF0sXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfbmV4dCAgPSAnICsgbmV4dCArICcsJztcblxuICAgICAgICBpZiAodGhpcy5ib3VuZG1vZGUgPT09ICdpZ25vcmUnKSB7XG4gICAgICAgICAgZnVuY3Rpb25Cb2R5ICs9ICdcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19vdXQgICA9ICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4ID49ICcgKyAodGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxKSArICcgfHwgJyArIHRoaXMubmFtZSArICdfaW5kZXggPCAwID8gMCA6ICcgKyB0aGlzLm5hbWUgKyAnX2Jhc2UgKyAnICsgdGhpcy5uYW1lICsgJ19mcmFjICogKCBtZW1vcnlbICcgKyB0aGlzLm5hbWUgKyAnX2RhdGFJZHggKyAnICsgdGhpcy5uYW1lICsgJ19uZXh0IF0gLSAnICsgdGhpcy5uYW1lICsgJ19iYXNlIClcXG5cXG4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZ1bmN0aW9uQm9keSArPSAnXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfb3V0ICAgPSAnICsgdGhpcy5uYW1lICsgJ19iYXNlICsgJyArIHRoaXMubmFtZSArICdfZnJhYyAqICggbWVtb3J5WyAnICsgdGhpcy5uYW1lICsgJ19kYXRhSWR4ICsgJyArIHRoaXMubmFtZSArICdfbmV4dCBdIC0gJyArIHRoaXMubmFtZSArICdfYmFzZSApXFxuXFxuJztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnVuY3Rpb25Cb2R5ICs9ICcgICAgICAnICsgdGhpcy5uYW1lICsgJ19vdXQgPSBtZW1vcnlbICcgKyB0aGlzLm5hbWUgKyAnX2RhdGFJZHggKyAnICsgdGhpcy5uYW1lICsgJ19pbmRleCBdXFxuXFxuJztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbW9kZSBpcyBzaW1wbGVcbiAgICAgIGZ1bmN0aW9uQm9keSA9ICdtZW1vcnlbICcgKyBpZHggKyAnICsgJyArIGlucHV0c1swXSArICcgXSc7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbkJvZHk7XG4gICAgfVxuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX291dCc7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSArICdfb3V0JywgZnVuY3Rpb25Cb2R5XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZGF0YSwgaW5kZXgsIHByb3BlcnRpZXMpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGRlZmF1bHRzID0geyBjaGFubmVsczogMSwgbW9kZTogJ3BoYXNlJywgaW50ZXJwOiAnbGluZWFyJywgYm91bmRtb2RlOiAnd3JhcCcgfTtcblxuICBpZiAocHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBwcm9wZXJ0aWVzKTtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICBkYXRhOiBkYXRhLFxuICAgIGRhdGFOYW1lOiBkYXRhLm5hbWUsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luZGV4LCBkYXRhXVxuICB9LCBkZWZhdWx0cyk7XG5cbiAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGFjY3VtID0gcmVxdWlyZSgnLi9hY2N1bS5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgcHJvdG8gPSB7IGJhc2VuYW1lOiAncGhhc29yJyB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZyZXF1ZW5jeSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbMF07XG4gIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDAgOiBhcmd1bWVudHNbMV07XG4gIHZhciBwcm9wcyA9IGFyZ3VtZW50c1syXTtcblxuICBpZiAocHJvcHMgPT09IHVuZGVmaW5lZCkgcHJvcHMgPSB7IG1pbjogLTEgfTtcblxuICB2YXIgcmFuZ2UgPSAocHJvcHMubWF4IHx8IDEpIC0gcHJvcHMubWluO1xuXG4gIHZhciB1Z2VuID0gdHlwZW9mIGZyZXF1ZW5jeSA9PT0gJ251bWJlcicgPyBhY2N1bShmcmVxdWVuY3kgKiByYW5nZSAvIGdlbi5zYW1wbGVyYXRlLCByZXNldCwgcHJvcHMpIDogYWNjdW0obXVsKGZyZXF1ZW5jeSwgMSAvIGdlbi5zYW1wbGVyYXRlIC8gKDEgLyByYW5nZSkpLCByZXNldCwgcHJvcHMpO1xuXG4gIHVnZW4ubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHdyYXAgPSByZXF1aXJlKCcuL3dyYXAuanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3Bva2UnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBkYXRhTmFtZSA9ICdtZW1vcnknLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgaWR4ID0gdm9pZCAwLFxuICAgICAgICBvdXQgPSB2b2lkIDAsXG4gICAgICAgIHdyYXBwZWQgPSB2b2lkIDA7XG5cbiAgICBpZHggPSB0aGlzLmRhdGEuZ2VuKCk7XG5cbiAgICAvL2dlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgLy93cmFwcGVkID0gd3JhcCggdGhpcy5pbnB1dHNbMV0sIDAsIHRoaXMuZGF0YUxlbmd0aCApLmdlbigpXG4gICAgLy9pZHggPSB3cmFwcGVkWzBdXG4gICAgLy9nZW4uZnVuY3Rpb25Cb2R5ICs9IHdyYXBwZWRbMV1cbiAgICB2YXIgb3V0cHV0U3RyID0gdGhpcy5pbnB1dHNbMV0gPT09IDAgPyAnICAnICsgZGF0YU5hbWUgKyAnWyAnICsgaWR4ICsgJyBdID0gJyArIGlucHV0c1swXSArICdcXG4nIDogJyAgJyArIGRhdGFOYW1lICsgJ1sgJyArIGlkeCArICcgKyAnICsgaW5wdXRzWzFdICsgJyBdID0gJyArIGlucHV0c1swXSArICdcXG4nO1xuXG4gICAgaWYgKHRoaXMuaW5saW5lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIF9nZW4uZnVuY3Rpb25Cb2R5ICs9IG91dHB1dFN0cjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFt0aGlzLmlubGluZSwgb3V0cHV0U3RyXTtcbiAgICB9XG4gIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkYXRhLCB2YWx1ZSwgaW5kZXgsIHByb3BlcnRpZXMpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGRlZmF1bHRzID0geyBjaGFubmVsczogMSB9O1xuXG4gIGlmIChwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIGRhdGE6IGRhdGEsXG4gICAgZGF0YU5hbWU6IGRhdGEubmFtZSxcbiAgICBkYXRhTGVuZ3RoOiBkYXRhLmJ1ZmZlci5sZW5ndGgsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW3ZhbHVlLCBpbmRleF1cbiAgfSwgZGVmYXVsdHMpO1xuXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICBfZ2VuLmhpc3Rvcmllcy5zZXQodWdlbi5uYW1lLCB1Z2VuKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdwb3cnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkgfHwgaXNOYU4oaW5wdXRzWzFdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoeyAncG93JzogTWF0aC5wb3cgfSk7XG5cbiAgICAgIG91dCA9ICdnZW4ucG93KCAnICsgaW5wdXRzWzBdICsgJywgJyArIGlucHV0c1sxXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2YgaW5wdXRzWzBdID09PSAnc3RyaW5nJyAmJiBpbnB1dHNbMF1bMF0gPT09ICcoJykge1xuICAgICAgICBpbnB1dHNbMF0gPSBpbnB1dHNbMF0uc2xpY2UoMSwgLTEpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBpbnB1dHNbMV0gPT09ICdzdHJpbmcnICYmIGlucHV0c1sxXVswXSA9PT0gJygnKSB7XG4gICAgICAgIGlucHV0c1sxXSA9IGlucHV0c1sxXS5zbGljZSgxLCAtMSk7XG4gICAgICB9XG5cbiAgICAgIG91dCA9IE1hdGgucG93KHBhcnNlRmxvYXQoaW5wdXRzWzBdKSwgcGFyc2VGbG9hdChpbnB1dHNbMV0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBwb3cgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBwb3cuaW5wdXRzID0gW3gsIHldO1xuICBwb3cuaWQgPSBfZ2VuLmdldFVJRCgpO1xuICBwb3cubmFtZSA9IHBvdy5iYXNlbmFtZSArICd7cG93LmlkfSc7XG5cbiAgcmV0dXJuIHBvdztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoJy4vaGlzdG9yeS5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKSxcbiAgICBkZWx0YSA9IHJlcXVpcmUoJy4vZGVsdGEuanMnKSxcbiAgICB3cmFwID0gcmVxdWlyZSgnLi93cmFwLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdyYXRlJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIHBoYXNlID0gaGlzdG9yeSgpLFxuICAgICAgICBpbk1pbnVzMSA9IGhpc3RvcnkoKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZmlsdGVyID0gdm9pZCAwLFxuICAgICAgICBzdW0gPSB2b2lkIDAsXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCB0aGlzKSk7XG5cbiAgICBvdXQgPSAnIHZhciAnICsgdGhpcy5uYW1lICsgJ19kaWZmID0gJyArIGlucHV0c1swXSArICcgLSAnICsgZ2VuTmFtZSArICcubGFzdFNhbXBsZVxcbiAgaWYoICcgKyB0aGlzLm5hbWUgKyAnX2RpZmYgPCAtLjUgKSAnICsgdGhpcy5uYW1lICsgJ19kaWZmICs9IDFcXG4gICcgKyBnZW5OYW1lICsgJy5waGFzZSArPSAnICsgdGhpcy5uYW1lICsgJ19kaWZmICogJyArIGlucHV0c1sxXSArICdcXG4gIGlmKCAnICsgZ2VuTmFtZSArICcucGhhc2UgPiAxICkgJyArIGdlbk5hbWUgKyAnLnBoYXNlIC09IDFcXG4gICcgKyBnZW5OYW1lICsgJy5sYXN0U2FtcGxlID0gJyArIGlucHV0c1swXSArICdcXG4nO1xuICAgIG91dCA9ICcgJyArIG91dDtcblxuICAgIHJldHVybiBbZ2VuTmFtZSArICcucGhhc2UnLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIHJhdGUpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICBwaGFzZTogMCxcbiAgICBsYXN0U2FtcGxlOiAwLFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjEsIHJhdGVdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAncm91bmQnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCBNYXRoLnJvdW5kKSk7XG5cbiAgICAgIG91dCA9ICdnZW4ucm91bmQoICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgcm91bmQgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICByb3VuZC5pbnB1dHMgPSBbeF07XG5cbiAgcmV0dXJuIHJvdW5kO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3NhaCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBfZ2VuLmRhdGFbdGhpcy5uYW1lXSA9IDA7XG4gICAgX2dlbi5kYXRhW3RoaXMubmFtZSArICdfY29udHJvbCddID0gMDtcblxuICAgIG91dCA9ICcgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gZ2VuLmRhdGEuJyArIHRoaXMubmFtZSArICdfY29udHJvbCxcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ190cmlnZ2VyID0gJyArIGlucHV0c1sxXSArICcgPiAnICsgaW5wdXRzWzJdICsgJyA/IDEgOiAwXFxuXFxuICBpZiggJyArIHRoaXMubmFtZSArICdfdHJpZ2dlciAhPT0gJyArIHRoaXMubmFtZSArICcgICkge1xcbiAgICBpZiggJyArIHRoaXMubmFtZSArICdfdHJpZ2dlciA9PT0gMSApIFxcbiAgICAgIGdlbi5kYXRhLicgKyB0aGlzLm5hbWUgKyAnID0gJyArIGlucHV0c1swXSArICdcXG4gICAgZ2VuLmRhdGEuJyArIHRoaXMubmFtZSArICdfY29udHJvbCA9ICcgKyB0aGlzLm5hbWUgKyAnX3RyaWdnZXJcXG4gIH1cXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSAnZ2VuLmRhdGEuJyArIHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbJ2dlbi5kYXRhLicgKyB0aGlzLm5hbWUsICcgJyArIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSwgY29udHJvbCkge1xuICB2YXIgdGhyZXNob2xkID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1syXTtcbiAgdmFyIHByb3BlcnRpZXMgPSBhcmd1bWVudHNbM107XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGRlZmF1bHRzID0geyBpbml0OiAwIH07XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgcHJvcGVydGllcyk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgbGFzdFNhbXBsZTogMCxcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBjb250cm9sLCB0aHJlc2hvbGRdXG4gIH0sIGRlZmF1bHRzKTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdzZWxlY3RvcicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDAsXG4gICAgICAgIHJldHVyblZhbHVlID0gMDtcblxuICAgIHN3aXRjaCAoaW5wdXRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm5WYWx1ZSA9IGlucHV0c1sxXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJ19vdXQgPSAnICsgaW5wdXRzWzBdICsgJyA9PT0gMSA/ICcgKyBpbnB1dHNbMV0gKyAnIDogJyArIGlucHV0c1syXSArICdcXG5cXG4nO1xuICAgICAgICByZXR1cm5WYWx1ZSA9IFt0aGlzLm5hbWUgKyAnX291dCcsIG91dF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICdfb3V0ID0gMFxcbiAgc3dpdGNoKCAnICsgaW5wdXRzWzBdICsgJyArIDEgKSB7XFxuJztcblxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIG91dCArPSAnICAgIGNhc2UgJyArIGkgKyAnOiAnICsgdGhpcy5uYW1lICsgJ19vdXQgPSAnICsgaW5wdXRzW2ldICsgJzsgYnJlYWs7XFxuJztcbiAgICAgICAgfVxuXG4gICAgICAgIG91dCArPSAnICB9XFxuXFxuJztcblxuICAgICAgICByZXR1cm5WYWx1ZSA9IFt0aGlzLm5hbWUgKyAnX291dCcsICcgJyArIG91dF07XG4gICAgfVxuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX291dCc7XG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgaW5wdXRzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgaW5wdXRzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBpbnB1dHNcbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdzaWduJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sIHRoaXMubmFtZSwgTWF0aC5zaWduKSk7XG5cbiAgICAgIG91dCA9ICdnZW4uc2lnbiggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2lnbihwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIHNpZ24gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBzaWduLmlucHV0cyA9IFt4XTtcblxuICByZXR1cm4gc2lnbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdzaW4nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKHsgJ3Npbic6IE1hdGguc2luIH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLnNpbiggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2luKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgc2luID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgc2luLmlucHV0cyA9IFt4XTtcbiAgc2luLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgc2luLm5hbWUgPSBzaW4uYmFzZW5hbWUgKyAne3Npbi5pZH0nO1xuXG4gIHJldHVybiBzaW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoJy4vaGlzdG9yeS5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKSxcbiAgICBndCA9IHJlcXVpcmUoJy4vZ3QuanMnKSxcbiAgICBkaXYgPSByZXF1aXJlKCcuL2Rpdi5qcycpLFxuICAgIF9zd2l0Y2ggPSByZXF1aXJlKCcuL3N3aXRjaC5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgICB2YXIgc2xpZGVVcCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbMV07XG4gICAgdmFyIHNsaWRlRG93biA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IDEgOiBhcmd1bWVudHNbMl07XG5cbiAgICB2YXIgeTEgPSBoaXN0b3J5KDApLFxuICAgICAgICBmaWx0ZXIgPSB2b2lkIDAsXG4gICAgICAgIHNsaWRlQW1vdW50ID0gdm9pZCAwO1xuXG4gICAgLy95IChuKSA9IHkgKG4tMSkgKyAoKHggKG4pIC0geSAobi0xKSkvc2xpZGUpXG4gICAgc2xpZGVBbW91bnQgPSBfc3dpdGNoKGd0KGluMSwgeTEub3V0KSwgc2xpZGVVcCwgc2xpZGVEb3duKTtcblxuICAgIGZpbHRlciA9IG1lbW8oYWRkKHkxLm91dCwgZGl2KHN1YihpbjEsIHkxLm91dCksIHNsaWRlQW1vdW50KSkpO1xuXG4gICAgeTEuaW4oZmlsdGVyKTtcblxuICAgIHJldHVybiBmaWx0ZXI7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgdmFyIHN1YiA9IHtcbiAgICBpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgICBvdXQgPSAwLFxuICAgICAgICAgIGRpZmYgPSAwLFxuICAgICAgICAgIG5lZWRzUGFyZW5zID0gZmFsc2UsXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbMF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKGxhc3ROdW1iZXIpLFxuICAgICAgICAgIHN1YkF0RW5kID0gZmFsc2UsXG4gICAgICAgICAgaGFzVWdlbnMgPSBmYWxzZSxcbiAgICAgICAgICByZXR1cm5WYWx1ZSA9IDA7XG5cbiAgICAgIHRoaXMuaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkpIGhhc1VnZW5zID0gdHJ1ZTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoaGFzVWdlbnMpIHtcbiAgICAgICAgLy8gc3RvcmUgaW4gdmFyaWFibGUgZm9yIGZ1dHVyZSByZWZlcmVuY2VcbiAgICAgICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gKCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXQgPSAnKCc7XG4gICAgICB9XG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICAgIGlmIChpID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGlzTnVtYmVyVWdlbiA9IGlzTmFOKHYpLFxuICAgICAgICAgICAgaXNGaW5hbElkeCA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxO1xuXG4gICAgICAgIGlmICghbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgLSB2O1xuICAgICAgICAgIG91dCArPSBsYXN0TnVtYmVyO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZWVkc1BhcmVucyA9IHRydWU7XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXIgKyAnIC0gJyArIHY7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzRmluYWxJZHgpIG91dCArPSAnIC0gJztcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobmVlZHNQYXJlbnMpIHtcbiAgICAgICAgb3V0ICs9ICcpJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dCA9IG91dC5zbGljZSgxKTsgLy8gcmVtb3ZlIG9wZW5pbmcgcGFyZW5cbiAgICAgIH1cblxuICAgICAgaWYgKGhhc1VnZW5zKSBvdXQgKz0gJ1xcbic7XG5cbiAgICAgIHJldHVyblZhbHVlID0gaGFzVWdlbnMgPyBbdGhpcy5uYW1lLCBvdXRdIDogb3V0O1xuXG4gICAgICBpZiAoaGFzVWdlbnMpIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfVxuICB9O1xuXG4gIHN1Yi5uYW1lID0gJ3N1YicgKyBzdWIuaWQ7XG5cbiAgcmV0dXJuIHN1Yjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdzd2l0Y2gnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgb3V0ID0gdm9pZCAwO1xuXG4gICAgaWYgKGlucHV0c1sxXSA9PT0gaW5wdXRzWzJdKSByZXR1cm4gaW5wdXRzWzFdOyAvLyBpZiBib3RoIHBvdGVudGlhbCBvdXRwdXRzIGFyZSB0aGUgc2FtZSBqdXN0IHJldHVybiBvbmUgb2YgdGhlbVxuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnX291dCA9ICcgKyBpbnB1dHNbMF0gKyAnID09PSAxID8gJyArIGlucHV0c1sxXSArICcgOiAnICsgaW5wdXRzWzJdICsgJ1xcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZSArICdfb3V0JztcblxuICAgIHJldHVybiBbdGhpcy5uYW1lICsgJ19vdXQnLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb250cm9sKSB7XG4gIHZhciBpbjEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAxIDogYXJndW1lbnRzWzFdO1xuICB2YXIgaW4yID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1syXTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbY29udHJvbCwgaW4xLCBpbjJdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3Q2MCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIHJldHVyblZhbHVlID0gdm9pZCAwO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgJ2V4cCcsIE1hdGguZXhwKSk7XG5cbiAgICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9IGdlbi5leHAoIC02LjkwNzc1NTI3ODkyMSAvICcgKyBpbnB1dHNbMF0gKyAnIClcXG5cXG4nO1xuXG4gICAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IG91dDtcblxuICAgICAgcmV0dXJuVmFsdWUgPSBbdGhpcy5uYW1lLCBvdXRdO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmV4cCgtNi45MDc3NTUyNzg5MjEgLyBpbnB1dHNbMF0pO1xuXG4gICAgICByZXR1cm5WYWx1ZSA9IG91dDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIHQ2MCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIHQ2MC5pbnB1dHMgPSBbeF07XG4gIHQ2MC5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiB0NjA7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAndGFuJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICd0YW4nOiBNYXRoLnRhbiB9KTtcblxuICAgICAgb3V0ID0gJ2dlbi50YW4oICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnRhbihwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIHRhbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIHRhbi5pbnB1dHMgPSBbeF07XG4gIHRhbi5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIHRhbi5uYW1lID0gdGFuLmJhc2VuYW1lICsgJ3t0YW4uaWR9JztcblxuICByZXR1cm4gdGFuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3RhbmgnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKHsgJ3RhbmgnOiBNYXRoLnRhbmggfSk7XG5cbiAgICAgIG91dCA9ICdnZW4udGFuaCggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgudGFuaChwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIHRhbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIHRhbi5pbnB1dHMgPSBbeF07XG4gIHRhbi5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIHRhbi5uYW1lID0gdGFuLmJhc2VuYW1lICsgJ3t0YW4uaWR9JztcblxuICByZXR1cm4gdGFuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGx0ID0gcmVxdWlyZSgnLi9sdC5qcycpLFxuICAgIHBoYXNvciA9IHJlcXVpcmUoJy4vcGhhc29yLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZnJlcXVlbmN5ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gNDQwIDogYXJndW1lbnRzWzBdO1xuICB2YXIgcHVsc2V3aWR0aCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IC41IDogYXJndW1lbnRzWzFdO1xuXG4gIHZhciBncmFwaCA9IGx0KGFjY3VtKGRpdihmcmVxdWVuY3ksIDQ0MTAwKSksIC41KTtcblxuICBncmFwaC5uYW1lID0gJ3RyYWluJyArIGdlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gZ3JhcGg7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZGF0YSA9IHJlcXVpcmUoJy4vZGF0YS5qcycpO1xuXG52YXIgaXNTdGVyZW8gPSBmYWxzZTtcblxudmFyIHV0aWxpdGllcyA9IHtcbiAgY3R4OiBudWxsLFxuXG4gIGNsZWFyOiBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICB0aGlzLmNhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfTtcbiAgICB0aGlzLmNsZWFyLmNhbGxiYWNrcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gdigpO1xuICAgIH0pO1xuICAgIHRoaXMuY2xlYXIuY2FsbGJhY2tzLmxlbmd0aCA9IDA7XG4gIH0sXG4gIGNyZWF0ZUNvbnRleHQ6IGZ1bmN0aW9uIGNyZWF0ZUNvbnRleHQoKSB7XG4gICAgdmFyIEFDID0gdHlwZW9mIEF1ZGlvQ29udGV4dCA9PT0gJ3VuZGVmaW5lZCcgPyB3ZWJraXRBdWRpb0NvbnRleHQgOiBBdWRpb0NvbnRleHQ7XG4gICAgdGhpcy5jdHggPSBuZXcgQUMoKTtcbiAgICBnZW4uc2FtcGxlcmF0ZSA9IHRoaXMuY3R4LnNhbXBsZVJhdGU7XG5cbiAgICB2YXIgc3RhcnQgPSBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgIGlmICh0eXBlb2YgQUMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmIChkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBzdGFydCk7XG5cbiAgICAgICAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICAgICAgICAvLyByZXF1aXJlZCB0byBzdGFydCBhdWRpbyB1bmRlciBpT1MgNlxuICAgICAgICAgICAgdmFyIG15U291cmNlID0gdXRpbGl0aWVzLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgICAgICAgIG15U291cmNlLmNvbm5lY3QodXRpbGl0aWVzLmN0eC5kZXN0aW5hdGlvbik7XG4gICAgICAgICAgICBteVNvdXJjZS5ub3RlT24oMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHN0YXJ0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY3JlYXRlU2NyaXB0UHJvY2Vzc29yOiBmdW5jdGlvbiBjcmVhdGVTY3JpcHRQcm9jZXNzb3IoKSB7XG4gICAgdGhpcy5ub2RlID0gdGhpcy5jdHguY3JlYXRlU2NyaXB0UHJvY2Vzc29yKDEwMjQsIDAsIDIpLCB0aGlzLmNsZWFyRnVuY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9LCB0aGlzLmNhbGxiYWNrID0gdGhpcy5jbGVhckZ1bmN0aW9uO1xuXG4gICAgdGhpcy5ub2RlLm9uYXVkaW9wcm9jZXNzID0gZnVuY3Rpb24gKGF1ZGlvUHJvY2Vzc2luZ0V2ZW50KSB7XG4gICAgICB2YXIgb3V0cHV0QnVmZmVyID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQub3V0cHV0QnVmZmVyO1xuXG4gICAgICB2YXIgbGVmdCA9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKSxcbiAgICAgICAgICByaWdodCA9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSgxKTtcblxuICAgICAgZm9yICh2YXIgc2FtcGxlID0gMDsgc2FtcGxlIDwgbGVmdC5sZW5ndGg7IHNhbXBsZSsrKSB7XG4gICAgICAgIGlmICghaXNTdGVyZW8pIHtcbiAgICAgICAgICBsZWZ0W3NhbXBsZV0gPSByaWdodFtzYW1wbGVdID0gdXRpbGl0aWVzLmNhbGxiYWNrKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIG91dCA9IHV0aWxpdGllcy5jYWxsYmFjaygpO1xuICAgICAgICAgIGxlZnRbc2FtcGxlXSA9IG91dFswXTtcbiAgICAgICAgICByaWdodFtzYW1wbGVdID0gb3V0WzFdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMubm9kZS5jb25uZWN0KHRoaXMuY3R4LmRlc3RpbmF0aW9uKTtcblxuICAgIC8vdGhpcy5ub2RlLmNvbm5lY3QoIHRoaXMuYW5hbHl6ZXIgKVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHBsYXlHcmFwaDogZnVuY3Rpb24gcGxheUdyYXBoKGdyYXBoLCBkZWJ1Zykge1xuICAgIHZhciBtZW0gPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyA0NDEwMCAqIDEwIDogYXJndW1lbnRzWzJdO1xuXG4gICAgdXRpbGl0aWVzLmNsZWFyKCk7XG4gICAgaWYgKGRlYnVnID09PSB1bmRlZmluZWQpIGRlYnVnID0gZmFsc2U7XG5cbiAgICBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoZ3JhcGgpO1xuXG4gICAgdXRpbGl0aWVzLmNhbGxiYWNrID0gZ2VuLmNyZWF0ZUNhbGxiYWNrKGdyYXBoLCBtZW0sIGRlYnVnKTtcblxuICAgIGlmICh1dGlsaXRpZXMuY29uc29sZSkgdXRpbGl0aWVzLmNvbnNvbGUuc2V0VmFsdWUodXRpbGl0aWVzLmNhbGxiYWNrLnRvU3RyaW5nKCkpO1xuXG4gICAgcmV0dXJuIHV0aWxpdGllcy5jYWxsYmFjaztcbiAgfSxcbiAgbG9hZFNhbXBsZTogZnVuY3Rpb24gbG9hZFNhbXBsZShzb3VuZEZpbGVQYXRoLCBkYXRhKSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHJlcS5vcGVuKCdHRVQnLCBzb3VuZEZpbGVQYXRoLCB0cnVlKTtcbiAgICByZXEucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGF1ZGlvRGF0YSA9IHJlcS5yZXNwb25zZTtcblxuICAgICAgICB1dGlsaXRpZXMuY3R4LmRlY29kZUF1ZGlvRGF0YShhdWRpb0RhdGEsIGZ1bmN0aW9uIChidWZmZXIpIHtcbiAgICAgICAgICBkYXRhLmJ1ZmZlciA9IGJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKTtcbiAgICAgICAgICByZXNvbHZlKGRhdGEuYnVmZmVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgcmVxLnNlbmQoKTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG59O1xuXG51dGlsaXRpZXMuY2xlYXIuY2FsbGJhY2tzID0gW107XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbGl0aWVzOyIsIid1c2Ugc3RyaWN0JztcblxuLypcbiAqIGFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vY29yYmFuYnJvb2svZHNwLmpzL2Jsb2IvbWFzdGVyL2RzcC5qc1xuICogc3RhcnRpbmcgYXQgbGluZSAxNDI3XG4gKiB0YWtlbiA4LzE1LzE2XG4qL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYmFydGxldHQ6IGZ1bmN0aW9uIGJhcnRsZXR0KGxlbmd0aCwgaW5kZXgpIHtcbiAgICByZXR1cm4gMiAvIChsZW5ndGggLSAxKSAqICgobGVuZ3RoIC0gMSkgLyAyIC0gTWF0aC5hYnMoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSk7XG4gIH0sXG4gIGJhcnRsZXR0SGFubjogZnVuY3Rpb24gYmFydGxldHRIYW5uKGxlbmd0aCwgaW5kZXgpIHtcbiAgICByZXR1cm4gMC42MiAtIDAuNDggKiBNYXRoLmFicyhpbmRleCAvIChsZW5ndGggLSAxKSAtIDAuNSkgLSAwLjM4ICogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSk7XG4gIH0sXG4gIGJsYWNrbWFuOiBmdW5jdGlvbiBibGFja21hbihsZW5ndGgsIGluZGV4LCBhbHBoYSkge1xuICAgIHZhciBhMCA9ICgxIC0gYWxwaGEpIC8gMixcbiAgICAgICAgYTEgPSAwLjUsXG4gICAgICAgIGEyID0gYWxwaGEgLyAyO1xuXG4gICAgcmV0dXJuIGEwIC0gYTEgKiBNYXRoLmNvcygyICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKSArIGEyICogTWF0aC5jb3MoNCAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSk7XG4gIH0sXG4gIGNvc2luZTogZnVuY3Rpb24gY29zaW5lKGxlbmd0aCwgaW5kZXgpIHtcbiAgICByZXR1cm4gTWF0aC5jb3MoTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gTWF0aC5QSSAvIDIpO1xuICB9LFxuICBnYXVzczogZnVuY3Rpb24gZ2F1c3MobGVuZ3RoLCBpbmRleCwgYWxwaGEpIHtcbiAgICByZXR1cm4gTWF0aC5wb3coTWF0aC5FLCAtMC41ICogTWF0aC5wb3coKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikgLyAoYWxwaGEgKiAobGVuZ3RoIC0gMSkgLyAyKSwgMikpO1xuICB9LFxuICBoYW1taW5nOiBmdW5jdGlvbiBoYW1taW5nKGxlbmd0aCwgaW5kZXgpIHtcbiAgICByZXR1cm4gMC41NCAtIDAuNDYgKiBNYXRoLmNvcyhNYXRoLlBJICogMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKTtcbiAgfSxcbiAgaGFubjogZnVuY3Rpb24gaGFubihsZW5ndGgsIGluZGV4KSB7XG4gICAgcmV0dXJuIDAuNSAqICgxIC0gTWF0aC5jb3MoTWF0aC5QSSAqIDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSkpO1xuICB9LFxuICBsYW5jem9zOiBmdW5jdGlvbiBsYW5jem9zKGxlbmd0aCwgaW5kZXgpIHtcbiAgICB2YXIgeCA9IDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSAtIDE7XG4gICAgcmV0dXJuIE1hdGguc2luKE1hdGguUEkgKiB4KSAvIChNYXRoLlBJICogeCk7XG4gIH0sXG4gIHJlY3Rhbmd1bGFyOiBmdW5jdGlvbiByZWN0YW5ndWxhcihsZW5ndGgsIGluZGV4KSB7XG4gICAgcmV0dXJuIDE7XG4gIH0sXG4gIHRyaWFuZ3VsYXI6IGZ1bmN0aW9uIHRyaWFuZ3VsYXIobGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiAyIC8gbGVuZ3RoICogKGxlbmd0aCAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKTtcbiAgfSxcbiAgZXhwb25lbnRpYWw6IGZ1bmN0aW9uIGV4cG9uZW50aWFsKGxlbmd0aCwgaW5kZXgsIGFscGhhKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KGluZGV4IC8gbGVuZ3RoLCBhbHBoYSk7XG4gIH0sXG4gIGxpbmVhcjogZnVuY3Rpb24gbGluZWFyKGxlbmd0aCwgaW5kZXgpIHtcbiAgICByZXR1cm4gaW5kZXggLyBsZW5ndGg7XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZmxvb3IgPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICd3cmFwJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgY29kZSA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIHNpZ25hbCA9IGlucHV0c1swXSxcbiAgICAgICAgbWluID0gaW5wdXRzWzFdLFxuICAgICAgICBtYXggPSBpbnB1dHNbMl0sXG4gICAgICAgIG91dCA9IHZvaWQgMCxcbiAgICAgICAgZGlmZiA9IHZvaWQgMDtcblxuICAgIC8vb3V0ID0gYCgoKCR7aW5wdXRzWzBdfSAtICR7dGhpcy5taW59KSAlICR7ZGlmZn0gICsgJHtkaWZmfSkgJSAke2RpZmZ9ICsgJHt0aGlzLm1pbn0pYFxuICAgIC8vY29uc3QgbG9uZyBudW1XcmFwcyA9IGxvbmcoKHYtbG8pL3JhbmdlKSAtICh2IDwgbG8pO1xuICAgIC8vcmV0dXJuIHYgLSByYW5nZSAqIGRvdWJsZShudW1XcmFwcyk7ICBcblxuICAgIGlmICh0aGlzLm1pbiA9PT0gMCkge1xuICAgICAgZGlmZiA9IG1heDtcbiAgICB9IGVsc2UgaWYgKGlzTmFOKG1heCkgfHwgaXNOYU4obWluKSkge1xuICAgICAgZGlmZiA9IG1heCArICcgLSAnICsgbWluO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaWZmID0gbWF4IC0gbWluO1xuICAgIH1cblxuICAgIG91dCA9ICcgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJyArIGlucHV0c1swXSArICdcXG4gIGlmKCAnICsgdGhpcy5uYW1lICsgJyA8ICcgKyB0aGlzLm1pbiArICcgKSAnICsgdGhpcy5uYW1lICsgJyArPSAnICsgZGlmZiArICdcXG4gIGVsc2UgaWYoICcgKyB0aGlzLm5hbWUgKyAnID4gJyArIHRoaXMubWF4ICsgJyApICcgKyB0aGlzLm5hbWUgKyAnIC09ICcgKyBkaWZmICsgJ1xcblxcbic7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgJyAnICsgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xKSB7XG4gIHZhciBtaW4gPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAwIDogYXJndW1lbnRzWzFdO1xuICB2YXIgbWF4ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gMSA6IGFyZ3VtZW50c1syXTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG1pbjogbWluLFxuICAgIG1heDogbWF4LFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjEsIG1pbiwgbWF4XVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgTWVtb3J5SGVscGVyID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICB2YXIgc2l6ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDQwOTYgOiBhcmd1bWVudHNbMF07XG4gICAgdmFyIG1lbXR5cGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBGbG9hdDMyQXJyYXkgOiBhcmd1bWVudHNbMV07XG5cbiAgICB2YXIgaGVscGVyID0gT2JqZWN0LmNyZWF0ZSh0aGlzKTtcblxuICAgIE9iamVjdC5hc3NpZ24oaGVscGVyLCB7XG4gICAgICBoZWFwOiBuZXcgbWVtdHlwZShzaXplKSxcbiAgICAgIGxpc3Q6IHt9LFxuICAgICAgZnJlZUxpc3Q6IHt9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaGVscGVyO1xuICB9LFxuICBhbGxvYzogZnVuY3Rpb24gYWxsb2Moc2l6ZSwgaW1tdXRhYmxlKSB7XG4gICAgdmFyIGlkeCA9IC0xO1xuXG4gICAgaWYgKHNpemUgPiB0aGlzLmhlYXAubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBFcnJvcignQWxsb2NhdGlvbiByZXF1ZXN0IGlzIGxhcmdlciB0aGFuIGhlYXAgc2l6ZSBvZiAnICsgdGhpcy5oZWFwLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMuZnJlZUxpc3QpIHtcbiAgICAgIHZhciBjYW5kaWRhdGUgPSB0aGlzLmZyZWVMaXN0W2tleV07XG5cbiAgICAgIGlmIChjYW5kaWRhdGUuc2l6ZSA+PSBzaXplKSB7XG4gICAgICAgIGlkeCA9IGtleTtcblxuICAgICAgICB0aGlzLmxpc3RbaWR4XSA9IHsgc2l6ZTogc2l6ZSwgaW1tdXRhYmxlOiBpbW11dGFibGUsIHJlZmVyZW5jZXM6IDEgfTtcblxuICAgICAgICBpZiAoY2FuZGlkYXRlLnNpemUgIT09IHNpemUpIHtcbiAgICAgICAgICB2YXIgbmV3SW5kZXggPSBpZHggKyBzaXplLFxuICAgICAgICAgICAgICBuZXdGcmVlU2l6ZSA9IHZvaWQgMDtcblxuICAgICAgICAgIGZvciAodmFyIF9rZXkgaW4gdGhpcy5saXN0KSB7XG4gICAgICAgICAgICBpZiAoX2tleSA+IG5ld0luZGV4KSB7XG4gICAgICAgICAgICAgIG5ld0ZyZWVTaXplID0gX2tleSAtIG5ld0luZGV4O1xuICAgICAgICAgICAgICB0aGlzLmZyZWVMaXN0W25ld0luZGV4XSA9IG5ld0ZyZWVTaXplO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpZHggIT09IC0xKSBkZWxldGUgdGhpcy5mcmVlTGlzdFtpZHhdO1xuXG4gICAgaWYgKGlkeCA9PT0gLTEpIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy5saXN0KSxcbiAgICAgICAgICBsYXN0SW5kZXggPSB2b2lkIDA7XG5cbiAgICAgIGlmIChrZXlzLmxlbmd0aCkge1xuICAgICAgICAvLyBpZiBub3QgZmlyc3QgYWxsb2NhdGlvbi4uLlxuICAgICAgICBsYXN0SW5kZXggPSBwYXJzZUludChrZXlzW2tleXMubGVuZ3RoIC0gMV0pO1xuXG4gICAgICAgIGlkeCA9IGxhc3RJbmRleCArIHRoaXMubGlzdFtsYXN0SW5kZXhdLnNpemU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZHggPSAwO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxpc3RbaWR4XSA9IHsgc2l6ZTogc2l6ZSwgaW1tdXRhYmxlOiBpbW11dGFibGUsIHJlZmVyZW5jZXM6IDEgfTtcbiAgICB9XG5cbiAgICBpZiAoaWR4ICsgc2l6ZSA+PSB0aGlzLmhlYXAubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBFcnJvcignTm8gYXZhaWxhYmxlIGJsb2NrcyByZW1haW4gc3VmZmljaWVudCBmb3IgYWxsb2NhdGlvbiByZXF1ZXN0LicpO1xuICAgIH1cbiAgICByZXR1cm4gaWR4O1xuICB9LFxuICBhZGRSZWZlcmVuY2U6IGZ1bmN0aW9uIGFkZFJlZmVyZW5jZShpbmRleCkge1xuICAgIGlmICh0aGlzLmxpc3RbaW5kZXhdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMubGlzdFtpbmRleF0ucmVmZXJlbmNlcysrO1xuICAgIH1cbiAgfSxcbiAgZnJlZTogZnVuY3Rpb24gZnJlZShpbmRleCkge1xuICAgIGlmICh0aGlzLmxpc3RbaW5kZXhdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IEVycm9yKCdDYWxsaW5nIGZyZWUoKSBvbiBub24tZXhpc3RpbmcgYmxvY2suJyk7XG4gICAgfVxuXG4gICAgdmFyIHNsb3QgPSB0aGlzLmxpc3RbaW5kZXhdO1xuICAgIGlmIChzbG90ID09PSAwKSByZXR1cm47XG4gICAgc2xvdC5yZWZlcmVuY2VzLS07XG5cbiAgICBpZiAoc2xvdC5yZWZlcmVuY2VzID09PSAwICYmIHNsb3QuaW1tdXRhYmxlICE9PSB0cnVlKSB7XG4gICAgICB0aGlzLmxpc3RbaW5kZXhdID0gMDtcblxuICAgICAgdmFyIGZyZWVCbG9ja1NpemUgPSAwO1xuICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMubGlzdCkge1xuICAgICAgICBpZiAoa2V5ID4gaW5kZXgpIHtcbiAgICAgICAgICBmcmVlQmxvY2tTaXplID0ga2V5IC0gaW5kZXg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5mcmVlTGlzdFtpbmRleF0gPSBmcmVlQmxvY2tTaXplO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlIZWxwZXI7XG4iLCJsZXQgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbmxldCBhbmFseXplciA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG5PYmplY3QuYXNzaWduKCBhbmFseXplciwge1xuICBfX3R5cGVfXzogJ2FuYWx5emVyJyxcbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gYW5hbHl6ZXJcbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBhbmFseXplciA9IHJlcXVpcmUoICcuL2FuYWx5emVyLmpzJyApLFxuICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgRGVsYXkgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHNzZCA9IE9iamVjdC5jcmVhdGUoIGFuYWx5emVyIClcbiAgc3NkLmluICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICBzc2Qub3V0ID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbiAgc3NkLmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcblxuICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBpbnB1dFByb3BzIClcbiAgbGV0IGlzU3RlcmVvID0gZmFsc2UvL3Byb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnIClcbiAgICBcbiAgbGV0IGhpc3RvcnlMID0gZy5oaXN0b3J5KClcblxuICBpZiggaXNTdGVyZW8gKSB7XG4gICAgLy8gcmlnaHQgY2hhbm5lbFxuICAgIGxldCBoaXN0b3J5UiA9IGcuaGlzdG9yeSgpXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICBzc2Qub3V0LFxuICAgICAgWyBoaXN0b3J5TC5vdXQsIGhpc3RvcnlSLm91dCBdLCBcbiAgICAgICdzc2Rfb3V0JywgXG4gICAgICBwcm9wcyBcbiAgICApXG5cbiAgICBzc2Qub3V0LmNhbGxiYWNrLnVnZW5OYW1lID0gc3NkLm91dC51Z2VuTmFtZSA9ICdzc2Rfb3V0XycgKyBzc2QuaWRcblxuICAgIGNvbnN0IGlkeEwgPSBzc2Qub3V0LmdyYXBoLm1lbW9yeS52YWx1ZS5pZHgsIFxuICAgICAgICAgIGlkeFIgPSBpZHhMICsgMSxcbiAgICAgICAgICBtZW1vcnkgPSBHaWJiZXJpc2guZ2VuaXNoLmdlbi5tZW1vcnkuaGVhcFxuXG4gICAgY29uc3QgY2FsbGJhY2sgPSBmdW5jdGlvbiggaW5wdXQgKSB7XG4gICAgICAndXNlIHN0cmljdCdcbiAgICAgIG1lbW9yeVsgaWR4TCBdID0gaW5wdXRbMF1cbiAgICAgIG1lbW9yeVsgaWR4UiBdID0gaW5wdXRbMV1cbiAgICAgIHJldHVybiAwICAgICBcbiAgICB9XG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHNzZC5pbiwgWyBpbnB1dFswXSxpbnB1dFsxXSBdLCAnc3NkX2luJywgcHJvcHMsIGNhbGxiYWNrIClcblxuICAgIGNhbGxiYWNrLnVnZW5OYW1lID0gc3NkLmluLnVnZW5OYW1lID0gJ3NzZF9pbl8nICsgc3NkLmlkXG4gICAgc3NkLmluLmlucHV0TmFtZXMgPSBbICdpbnB1dCcgXVxuICAgIHNzZC5pbi5pbnB1dHMgPSBbIHByb3BzLmlucHV0IF1cbiAgICBzc2QuaW4uaW5wdXQgPSBwcm9wcy5pbnB1dFxuICAgIHNzZC50eXBlID0gJ2FuYWx5c2lzJ1xuXG4gICAgc3NkLmluLmxpc3RlbiA9IGZ1bmN0aW9uKCB1Z2VuICkge1xuICAgICAgaWYoIHVnZW4gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc3NkLmluLmlucHV0ID0gdWdlblxuICAgICAgICBzc2QuaW4uaW5wdXRzID0gWyB1Z2VuIF1cbiAgICAgIH1cblxuICAgICAgaWYoIEdpYmJlcmlzaC5hbmFseXplcnMuaW5kZXhPZiggc3NkLmluICkgPT09IC0xICkge1xuICAgICAgICBHaWJiZXJpc2guYW5hbHl6ZXJzLnB1c2goIHNzZC5pbiApXG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC5kaXJ0eSggR2liYmVyaXNoLmFuYWx5emVycyApXG4gICAgfVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggc3NkLm91dCwgaGlzdG9yeUwub3V0LCAnc3NkX291dCcsIHByb3BzIClcblxuICAgIHNzZC5vdXQuY2FsbGJhY2sudWdlbk5hbWUgPSBzc2Qub3V0LnVnZW5OYW1lID0gJ3NzZF9vdXRfJyArIHNzZC5pZFxuXG4gICAgbGV0IGlkeCA9IHNzZC5vdXQuZ3JhcGgubWVtb3J5LnZhbHVlLmlkeCBcbiAgICBsZXQgbWVtb3J5ID0gR2liYmVyaXNoLmdlbmlzaC5nZW4ubWVtb3J5LmhlYXBcbiAgICBsZXQgcGhhc2UgPSAwXG4gICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24oIGlucHV0ICkge1xuICAgICAgJ3VzZSBzdHJpY3QnXG4gICAgICBtZW1vcnlbIGlkeCBdID0gaW5wdXRcbiAgICAgIHJldHVybiAwICAgICBcbiAgICB9XG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHNzZC5pbiwgaW5wdXQsICdzc2RfaW4nLCBwcm9wcywgY2FsbGJhY2sgKVxuXG4gICAgY2FsbGJhY2sudWdlbk5hbWUgPSBzc2QuaW4udWdlbk5hbWUgPSAnc3NkX2luXycgKyBzc2QuaWRcbiAgICBzc2QuaW4uaW5wdXROYW1lcyA9IFsgJ2lucHV0JyBdXG4gICAgc3NkLmluLmlucHV0cyA9IFsgcHJvcHMuaW5wdXQgXVxuICAgIHNzZC5pbi5pbnB1dCA9IHByb3BzLmlucHV0XG4gICAgc3NkLnR5cGUgPSAnYW5hbHlzaXMnXG5cbiAgICBzc2QuaW4ubGlzdGVuID0gZnVuY3Rpb24oIHVnZW4gKSB7XG4gICAgICBpZiggdWdlbiAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICBzc2QuaW4uaW5wdXQgPSB1Z2VuXG4gICAgICAgIHNzZC5pbi5pbnB1dHMgPSBbIHVnZW4gXVxuICAgICAgfVxuXG4gICAgICBpZiggR2liYmVyaXNoLmFuYWx5emVycy5pbmRleE9mKCBzc2QuaW4gKSA9PT0gLTEgKSB7XG4gICAgICAgIEdpYmJlcmlzaC5hbmFseXplcnMucHVzaCggc3NkLmluIClcbiAgICAgIH1cblxuICAgICAgR2liYmVyaXNoLmRpcnR5KCBHaWJiZXJpc2guYW5hbHl6ZXJzIClcbiAgICB9XG5cbiAgfVxuICBcbiAgcmV0dXJuIHNzZFxufVxuXG5EZWxheS5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbn1cblxucmV0dXJuIERlbGF5XG5cbn1cbiIsImxldCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICksXG4gICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBBRCA9IGZ1bmN0aW9uKCBhcmd1bWVudFByb3BzICkge1xuICAgIGxldCBhZCA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSxcbiAgICAgICAgYXR0YWNrICA9IGcuaW4oICdhdHRhY2snICksXG4gICAgICAgIGRlY2F5ICAgPSBnLmluKCAnZGVjYXknIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBBRC5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBsZXQgZ3JhcGggPSBnLmFkKCBhdHRhY2ssIGRlY2F5IClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBhZCwgZ3JhcGgsICdhZCcsIHByb3BzIClcblxuICAgIGFkLnRyaWdnZXIgPSBncmFwaC50cmlnZ2VyXG5cbiAgICByZXR1cm4gYWRcbiAgfVxuXG4gIEFELmRlZmF1bHRzID0geyBhdHRhY2s6NDQxMDAsIGRlY2F5OjQ0MTAwIH0gXG5cbiAgcmV0dXJuIEFEXG5cbn1cbiIsImxldCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICksXG4gICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBBRFNSID0gZnVuY3Rpb24oIGFyZ3VtZW50UHJvcHMgKSB7XG4gICAgbGV0IGFkc3IgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApLFxuICAgICAgICBhdHRhY2sgID0gZy5pbiggJ2F0dGFjaycgKSxcbiAgICAgICAgZGVjYXkgICA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgc3VzdGFpbiA9IGcuaW4oICdzdXN0YWluJyApLFxuICAgICAgICByZWxlYXNlID0gZy5pbiggJ3JlbGVhc2UnICksXG4gICAgICAgIHN1c3RhaW5MZXZlbCA9IGcuaW4oICdzdXN0YWluTGV2ZWwnIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBBRFNSLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGxldCBncmFwaCA9IGcuYWRzciggYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgc3VzdGFpbkxldmVsLCByZWxlYXNlLCB7IHRyaWdnZXJSZWxlYXNlOiBwcm9wcy50cmlnZ2VyUmVsZWFzZSB9IClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBhZHNyLCBncmFwaCwgJ2Fkc3InLCBwcm9wcyApXG5cbiAgICBhZHNyLnRyaWdnZXIgPSBncmFwaC50cmlnZ2VyXG4gICAgYWRzci5hZHZhbmNlID0gZ3JhcGgucmVsZWFzZVxuXG4gICAgcmV0dXJuIGFkc3JcbiAgfVxuXG4gIEFEU1IuZGVmYXVsdHMgPSB7IGF0dGFjazoyMjA1MCwgZGVjYXk6MjIwNTAsIHN1c3RhaW46NDQxMDAsIHN1c3RhaW5MZXZlbDouNiwgcmVsZWFzZTogNDQxMDAsIHRyaWdnZXJSZWxlYXNlOmZhbHNlIH0gXG5cbiAgcmV0dXJuIEFEU1Jcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBFbnZlbG9wZXMgPSB7XG4gICAgQUQgICAgIDogcmVxdWlyZSggJy4vYWQuanMnICkoIEdpYmJlcmlzaCApLFxuICAgIEFEU1IgICA6IHJlcXVpcmUoICcuL2Fkc3IuanMnICkoIEdpYmJlcmlzaCApLFxuICAgIFJhbXAgICA6IHJlcXVpcmUoICcuL3JhbXAuanMnICkoIEdpYmJlcmlzaCApLFxuXG4gICAgZXhwb3J0IDogdGFyZ2V0ID0+IHtcbiAgICAgIGZvciggbGV0IGtleSBpbiBFbnZlbG9wZXMgKSB7XG4gICAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgICAgIHRhcmdldFsga2V5IF0gPSBFbnZlbG9wZXNbIGtleSBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gXG5cbiAgcmV0dXJuIEVudmVsb3Blc1xufVxuIiwiY29uc3QgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IFJhbXAgPSBmdW5jdGlvbiggYXJndW1lbnRQcm9wcyApIHtcbiAgICBjb25zdCByYW1wICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICksXG4gICAgICAgICAgbGVuZ3RoID0gZy5pbiggJ2xlbmd0aCcgKSxcbiAgICAgICAgICBmcm9tICAgPSBnLmluKCAnZnJvbScgKSxcbiAgICAgICAgICB0byAgICAgPSBnLmluKCAndG8nIClcblxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgUmFtcC5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBjb25zdCByZXNldCA9IGcuYmFuZygpXG5cbiAgICBjb25zdCBwaGFzZSA9IGcuYWNjdW0oIGcuZGl2KCAxLCBsZW5ndGggKSwgcmVzZXQsIHsgc2hvdWxkV3JhcDpwcm9wcy5zaG91bGRMb29wLCBzaG91bGRDbGFtcDp0cnVlIH0pLFxuICAgICAgICAgIGRpZmYgPSBnLnN1YiggdG8sIGZyb20gKSxcbiAgICAgICAgICBncmFwaCA9IGcuYWRkKCBmcm9tLCBnLm11bCggcGhhc2UsIGRpZmYgKSApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggcmFtcCwgZ3JhcGgsICdyYW1wJywgcHJvcHMgKVxuXG4gICAgcmFtcC50cmlnZ2VyID0gcmVzZXQudHJpZ2dlclxuXG4gICAgcmV0dXJuIHJhbXBcbiAgfVxuXG4gIFJhbXAuZGVmYXVsdHMgPSB7IGZyb206MCwgdG86MSwgbGVuZ3RoOmcuZ2VuLnNhbXBsZXJhdGUsIHNob3VsZExvb3A6ZmFsc2UgfVxuXG4gIHJldHVybiBSYW1wXG5cbn1cbiIsIi8qXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW50aW1hdHRlcjE1L2hlYXBxdWV1ZS5qcy9ibG9iL21hc3Rlci9oZWFwcXVldWUuanNcbiAqXG4gKiBUaGlzIGltcGxlbWVudGF0aW9uIGlzIHZlcnkgbG9vc2VseSBiYXNlZCBvZmYganMtcHJpb3JpdHktcXVldWVcbiAqIGJ5IEFkYW0gSG9vcGVyIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2FkYW1ob29wZXIvanMtcHJpb3JpdHktcXVldWVcbiAqXG4gKiBUaGUganMtcHJpb3JpdHktcXVldWUgaW1wbGVtZW50YXRpb24gc2VlbWVkIGEgdGVlbnN5IGJpdCBibG9hdGVkXG4gKiB3aXRoIGl0cyByZXF1aXJlLmpzIGRlcGVuZGVuY3kgYW5kIG11bHRpcGxlIHN0b3JhZ2Ugc3RyYXRlZ2llc1xuICogd2hlbiBhbGwgYnV0IG9uZSB3ZXJlIHN0cm9uZ2x5IGRpc2NvdXJhZ2VkLiBTbyBoZXJlIGlzIGEga2luZCBvZlxuICogY29uZGVuc2VkIHZlcnNpb24gb2YgdGhlIGZ1bmN0aW9uYWxpdHkgd2l0aCBvbmx5IHRoZSBmZWF0dXJlcyB0aGF0XG4gKiBJIHBhcnRpY3VsYXJseSBuZWVkZWQuXG4gKlxuICogVXNpbmcgaXQgaXMgcHJldHR5IHNpbXBsZSwgeW91IGp1c3QgY3JlYXRlIGFuIGluc3RhbmNlIG9mIEhlYXBRdWV1ZVxuICogd2hpbGUgb3B0aW9uYWxseSBzcGVjaWZ5aW5nIGEgY29tcGFyYXRvciBhcyB0aGUgYXJndW1lbnQ6XG4gKlxuICogdmFyIGhlYXBxID0gbmV3IEhlYXBRdWV1ZSgpO1xuICpcbiAqIHZhciBjdXN0b21xID0gbmV3IEhlYXBRdWV1ZShmdW5jdGlvbihhLCBiKXtcbiAqICAgLy8gaWYgYiA+IGEsIHJldHVybiBuZWdhdGl2ZVxuICogICAvLyBtZWFucyB0aGF0IGl0IHNwaXRzIG91dCB0aGUgc21hbGxlc3QgaXRlbSBmaXJzdFxuICogICByZXR1cm4gYSAtIGI7XG4gKiB9KTtcbiAqXG4gKiBOb3RlIHRoYXQgaW4gdGhpcyBjYXNlLCB0aGUgZGVmYXVsdCBjb21wYXJhdG9yIGlzIGlkZW50aWNhbCB0b1xuICogdGhlIGNvbXBhcmF0b3Igd2hpY2ggaXMgdXNlZCBleHBsaWNpdGx5IGluIHRoZSBzZWNvbmQgcXVldWUuXG4gKlxuICogT25jZSB5b3UndmUgaW5pdGlhbGl6ZWQgdGhlIGhlYXBxdWV1ZSwgeW91IGNhbiBwbG9wIHNvbWUgbmV3XG4gKiBlbGVtZW50cyBpbnRvIHRoZSBxdWV1ZSB3aXRoIHRoZSBwdXNoIG1ldGhvZCAodmFndWVseSByZW1pbmlzY2VudFxuICogb2YgdHlwaWNhbCBqYXZhc2NyaXB0IGFyYXlzKVxuICpcbiAqIGhlYXBxLnB1c2goNDIpO1xuICogaGVhcHEucHVzaChcImtpdHRlblwiKTtcbiAqXG4gKiBUaGUgcHVzaCBtZXRob2QgcmV0dXJucyB0aGUgbmV3IG51bWJlciBvZiBlbGVtZW50cyBvZiB0aGUgcXVldWUuXG4gKlxuICogWW91IGNhbiBwdXNoIGFueXRoaW5nIHlvdSdkIGxpa2Ugb250byB0aGUgcXVldWUsIHNvIGxvbmcgYXMgeW91clxuICogY29tcGFyYXRvciBmdW5jdGlvbiBpcyBjYXBhYmxlIG9mIGhhbmRsaW5nIGl0LiBUaGUgZGVmYXVsdFxuICogY29tcGFyYXRvciBpcyByZWFsbHkgc3R1cGlkIHNvIGl0IHdvbid0IGJlIGFibGUgdG8gaGFuZGxlIGFueXRoaW5nXG4gKiBvdGhlciB0aGFuIGFuIG51bWJlciBieSBkZWZhdWx0LlxuICpcbiAqIFlvdSBjYW4gcHJldmlldyB0aGUgc21hbGxlc3QgaXRlbSBieSB1c2luZyBwZWVrLlxuICpcbiAqIGhlYXBxLnB1c2goLTk5OTkpO1xuICogaGVhcHEucGVlaygpOyAvLyA9PT4gLTk5OTlcbiAqXG4gKiBUaGUgdXNlZnVsIGNvbXBsZW1lbnQgdG8gdG8gdGhlIHB1c2ggbWV0aG9kIGlzIHRoZSBwb3AgbWV0aG9kLFxuICogd2hpY2ggcmV0dXJucyB0aGUgc21hbGxlc3QgaXRlbSBhbmQgdGhlbiByZW1vdmVzIGl0IGZyb20gdGhlXG4gKiBxdWV1ZS5cbiAqXG4gKiBoZWFwcS5wdXNoKDEpO1xuICogaGVhcHEucHVzaCgyKTtcbiAqIGhlYXBxLnB1c2goMyk7XG4gKiBoZWFwcS5wb3AoKTsgLy8gPT0+IDFcbiAqIGhlYXBxLnBvcCgpOyAvLyA9PT4gMlxuICogaGVhcHEucG9wKCk7IC8vID09PiAzXG4gKi9cbmxldCBIZWFwUXVldWUgPSBmdW5jdGlvbihjbXApe1xuICB0aGlzLmNtcCA9IChjbXAgfHwgZnVuY3Rpb24oYSwgYil7IHJldHVybiBhIC0gYjsgfSk7XG4gIHRoaXMubGVuZ3RoID0gMDtcbiAgdGhpcy5kYXRhID0gW107XG59XG5IZWFwUXVldWUucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gdGhpcy5kYXRhWzBdO1xufTtcbkhlYXBRdWV1ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgdGhpcy5kYXRhLnB1c2godmFsdWUpO1xuXG4gIHZhciBwb3MgPSB0aGlzLmRhdGEubGVuZ3RoIC0gMSxcbiAgcGFyZW50LCB4O1xuXG4gIHdoaWxlKHBvcyA+IDApe1xuICAgIHBhcmVudCA9IChwb3MgLSAxKSA+Pj4gMTtcbiAgICBpZih0aGlzLmNtcCh0aGlzLmRhdGFbcG9zXSwgdGhpcy5kYXRhW3BhcmVudF0pIDwgMCl7XG4gICAgICB4ID0gdGhpcy5kYXRhW3BhcmVudF07XG4gICAgICB0aGlzLmRhdGFbcGFyZW50XSA9IHRoaXMuZGF0YVtwb3NdO1xuICAgICAgdGhpcy5kYXRhW3Bvc10gPSB4O1xuICAgICAgcG9zID0gcGFyZW50O1xuICAgIH1lbHNlIGJyZWFrO1xuICB9XG4gIHJldHVybiB0aGlzLmxlbmd0aCsrO1xufTtcbkhlYXBRdWV1ZS5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24oKXtcbiAgdmFyIGxhc3RfdmFsID0gdGhpcy5kYXRhLnBvcCgpLFxuICByZXQgPSB0aGlzLmRhdGFbMF07XG4gIGlmKHRoaXMuZGF0YS5sZW5ndGggPiAwKXtcbiAgICB0aGlzLmRhdGFbMF0gPSBsYXN0X3ZhbDtcbiAgICB2YXIgcG9zID0gMCxcbiAgICBsYXN0ID0gdGhpcy5kYXRhLmxlbmd0aCAtIDEsXG4gICAgbGVmdCwgcmlnaHQsIG1pbkluZGV4LCB4O1xuICAgIHdoaWxlKDEpe1xuICAgICAgbGVmdCA9IChwb3MgPDwgMSkgKyAxO1xuICAgICAgcmlnaHQgPSBsZWZ0ICsgMTtcbiAgICAgIG1pbkluZGV4ID0gcG9zO1xuICAgICAgaWYobGVmdCA8PSBsYXN0ICYmIHRoaXMuY21wKHRoaXMuZGF0YVtsZWZ0XSwgdGhpcy5kYXRhW21pbkluZGV4XSkgPCAwKSBtaW5JbmRleCA9IGxlZnQ7XG4gICAgICBpZihyaWdodCA8PSBsYXN0ICYmIHRoaXMuY21wKHRoaXMuZGF0YVtyaWdodF0sIHRoaXMuZGF0YVttaW5JbmRleF0pIDwgMCkgbWluSW5kZXggPSByaWdodDtcbiAgICAgIGlmKG1pbkluZGV4ICE9PSBwb3Mpe1xuICAgICAgICB4ID0gdGhpcy5kYXRhW21pbkluZGV4XTtcbiAgICAgICAgdGhpcy5kYXRhW21pbkluZGV4XSA9IHRoaXMuZGF0YVtwb3NdO1xuICAgICAgICB0aGlzLmRhdGFbcG9zXSA9IHg7XG4gICAgICAgIHBvcyA9IG1pbkluZGV4O1xuICAgICAgfWVsc2UgYnJlYWs7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldCA9IGxhc3RfdmFsO1xuICB9XG4gIHRoaXMubGVuZ3RoLS07XG4gIHJldHVybiByZXQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYXBRdWV1ZVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG4gXG4vLyBjb25zdHJ1Y3RvciBmb3Igc2Nocm9lZGVyIGFsbHBhc3MgZmlsdGVyc1xubGV0IGFsbFBhc3MgPSBmdW5jdGlvbiggX2lucHV0LCBsZW5ndGg9NTAwLCBmZWVkYmFjaz0uNSApIHtcbiAgbGV0IGluZGV4ICA9IGcuY291bnRlciggMSwwLGxlbmd0aCApLFxuICAgICAgYnVmZmVyID0gZy5kYXRhKCBsZW5ndGggKSxcbiAgICAgIGJ1ZmZlclNhbXBsZSA9IGcucGVlayggYnVmZmVyLCBpbmRleCwgeyBpbnRlcnA6J25vbmUnLCBtb2RlOidzYW1wbGVzJyB9KSxcbiAgICAgIG91dCA9IGcubWVtbyggZy5hZGQoIGcubXVsKCAtMSwgX2lucHV0KSwgYnVmZmVyU2FtcGxlICkgKVxuICAgICAgICAgICAgICAgIFxuICBnLnBva2UoIGJ1ZmZlciwgZy5hZGQoIF9pbnB1dCwgZy5tdWwoIGJ1ZmZlclNhbXBsZSwgZmVlZGJhY2sgKSApLCBpbmRleCApXG4gXG4gIHJldHVybiBvdXRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhbGxQYXNzXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZmlsdGVyID0gcmVxdWlyZSggJy4vZmlsdGVyLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBHaWJiZXJpc2guZ2VuaXNoLmJpcXVhZCA9ICggaW5wdXQsIGN1dG9mZiwgUSwgbW9kZSwgaXNTdGVyZW8gKSA9PiB7XG4gICAgbGV0IGEwLGExLGEyLGMsYjEsYjIsXG4gICAgICAgIGluMWEwLHgxYTEseDJhMix5MWIxLHkyYjIsXG4gICAgICAgIGluMWEwXzEseDFhMV8xLHgyYTJfMSx5MWIxXzEseTJiMl8xXG5cbiAgICBsZXQgcmV0dXJuVmFsdWVcblxuICAgIGxldCB4MSA9IGcuaGlzdG9yeSgpLCB4MiA9IGcuaGlzdG9yeSgpLCB5MSA9IGcuaGlzdG9yeSgpLCB5MiA9IGcuaGlzdG9yeSgpXG4gICAgXG4gICAgbGV0IHcwID0gZy5tZW1vKCBnLm11bCggMiAqIE1hdGguUEksIGcuZGl2KCBjdXRvZmYsICBnLmdlbi5zYW1wbGVyYXRlICkgKSApLFxuICAgICAgICBzaW53MCA9IGcuc2luKCB3MCApLFxuICAgICAgICBjb3N3MCA9IGcuY29zKCB3MCApLFxuICAgICAgICBhbHBoYSA9IGcubWVtbyggZy5kaXYoIHNpbncwLCBnLm11bCggMiwgUSApICkgKVxuXG4gICAgbGV0IG9uZU1pbnVzQ29zVyA9IGcuc3ViKCAxLCBjb3N3MCApXG5cbiAgICBzd2l0Y2goIG1vZGUgKSB7XG4gICAgICBjYXNlICdIUCc6XG4gICAgICAgIGEwID0gZy5tZW1vKCBnLmRpdiggZy5hZGQoIDEsIGNvc3cwKSAsIDIpIClcbiAgICAgICAgYTEgPSBnLm11bCggZy5hZGQoIDEsIGNvc3cwICksIC0xIClcbiAgICAgICAgYTIgPSBhMFxuICAgICAgICBjICA9IGcuYWRkKCAxLCBhbHBoYSApXG4gICAgICAgIGIxID0gZy5tdWwoIC0yICwgY29zdzAgKVxuICAgICAgICBiMiA9IGcuc3ViKCAxLCBhbHBoYSApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnQlAnOlxuICAgICAgICBhMCA9IGcubXVsKCBRLCBhbHBoYSApXG4gICAgICAgIGExID0gMFxuICAgICAgICBhMiA9IGcubXVsKCBhMCwgLTEgKVxuICAgICAgICBjICA9IGcuYWRkKCAxLCBhbHBoYSApXG4gICAgICAgIGIxID0gZy5tdWwoIC0yICwgY29zdzAgKVxuICAgICAgICBiMiA9IGcuc3ViKCAxLCBhbHBoYSApXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDogLy8gTFBcbiAgICAgICAgYTAgPSBnLm1lbW8oIGcuZGl2KCBvbmVNaW51c0Nvc1csIDIpIClcbiAgICAgICAgYTEgPSBvbmVNaW51c0Nvc1dcbiAgICAgICAgYTIgPSBhMFxuICAgICAgICBjICA9IGcuYWRkKCAxLCBhbHBoYSApXG4gICAgICAgIGIxID0gZy5tdWwoIC0yICwgY29zdzAgKVxuICAgICAgICBiMiA9IGcuc3ViKCAxLCBhbHBoYSApXG4gICAgfVxuXG4gICAgYTAgPSBnLmRpdiggYTAsIGMgKTsgYTEgPSBnLmRpdiggYTEsIGMgKTsgYTIgPSBnLmRpdiggYTIsIGMgKVxuICAgIGIxID0gZy5kaXYoIGIxLCBjICk7IGIyID0gZy5kaXYoIGIyLCBjIClcblxuICAgIGluMWEwID0gZy5tdWwoIHgxLmluKCBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXQgKSwgYTAgKVxuICAgIHgxYTEgID0gZy5tdWwoIHgyLmluKCB4MS5vdXQgKSwgYTEgKVxuICAgIHgyYTIgID0gZy5tdWwoIHgyLm91dCwgICAgICAgICAgYTIgKVxuXG4gICAgbGV0IHN1bUxlZnQgPSBnLmFkZCggaW4xYTAsIHgxYTEsIHgyYTIgKVxuXG4gICAgeTFiMSA9IGcubXVsKCB5Mi5pbiggeTEub3V0ICksIGIxIClcbiAgICB5MmIyID0gZy5tdWwoIHkyLm91dCwgYjIgKVxuXG4gICAgbGV0IHN1bVJpZ2h0ID0gZy5hZGQoIHkxYjEsIHkyYjIgKVxuXG4gICAgbGV0IGRpZmYgPSBnLnN1Yiggc3VtTGVmdCwgc3VtUmlnaHQgKVxuXG4gICAgeTEuaW4oIGRpZmYgKVxuXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgbGV0IHgxXzEgPSBnLmhpc3RvcnkoKSwgeDJfMSA9IGcuaGlzdG9yeSgpLCB5MV8xID0gZy5oaXN0b3J5KCksIHkyXzEgPSBnLmhpc3RvcnkoKVxuXG4gICAgICBpbjFhMF8xID0gZy5tdWwoIHgxXzEuaW4oIGlucHV0WzFdICksIGEwIClcbiAgICAgIHgxYTFfMSAgPSBnLm11bCggeDJfMS5pbiggeDFfMS5vdXQgKSwgYTEgKVxuICAgICAgeDJhMl8xICA9IGcubXVsKCB4Ml8xLm91dCwgICAgICAgICAgICBhMiApXG5cbiAgICAgIGxldCBzdW1MZWZ0XzEgPSBnLmFkZCggaW4xYTBfMSwgeDFhMV8xLCB4MmEyXzEgKVxuXG4gICAgICB5MWIxXzEgPSBnLm11bCggeTJfMS5pbiggeTFfMS5vdXQgKSwgYjEgKVxuICAgICAgeTJiMl8xID0gZy5tdWwoIHkyXzEub3V0LCBiMiApXG5cbiAgICAgIGxldCBzdW1SaWdodF8xID0gZy5hZGQoIHkxYjFfMSwgeTJiMl8xIClcblxuICAgICAgbGV0IGRpZmZfMSA9IGcuc3ViKCBzdW1MZWZ0XzEsIHN1bVJpZ2h0XzEgKVxuXG4gICAgICB5MV8xLmluKCBkaWZmXzEgKVxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgZGlmZiwgZGlmZl8xIF1cbiAgICB9ZWxzZXtcbiAgICAgIHJldHVyblZhbHVlID0gZGlmZlxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbiAgbGV0IEJpcXVhZCA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGxldCBiaXF1YWQgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBCaXF1YWQuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSBcblxuICAgIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIGJpcXVhZCxcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guYmlxdWFkKCBnLmluKCdpbnB1dCcpLCBnLmluKCdjdXRvZmYnKSwgZy5pbignUScpLCBwcm9wcy5tb2RlIHx8ICdMUCcsIGlzU3RlcmVvICksIFxuICAgICAgJ2JpcXVhZCcsIFxuICAgICAgcHJvcHNcbiAgICApXG5cbiAgICByZXR1cm4gYmlxdWFkXG4gIH1cblxuICBCaXF1YWQuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICBROiAuNzUsXG4gICAgY3V0b2ZmOjU1MCxcbiAgICBtb2RlOidMUCdcbiAgfVxuXG4gIHJldHVybiBCaXF1YWRcblxufVxuXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubGV0IGNvbWJGaWx0ZXIgPSBmdW5jdGlvbiggX2lucHV0LCBjb21iTGVuZ3RoLCBkYW1waW5nPS41Ki40LCBmZWVkYmFja0NvZWZmPS44NCApIHtcbiAgbGV0IGxhc3RTYW1wbGUgICA9IGcuaGlzdG9yeSgpLFxuICBcdCAgcmVhZFdyaXRlSWR4ID0gZy5jb3VudGVyKCAxLDAsY29tYkxlbmd0aCApLFxuICAgICAgY29tYkJ1ZmZlciAgID0gZy5kYXRhKCBjb21iTGVuZ3RoICksXG5cdCAgICBvdXQgICAgICAgICAgPSBnLnBlZWsoIGNvbWJCdWZmZXIsIHJlYWRXcml0ZUlkeCwgeyBpbnRlcnA6J25vbmUnLCBtb2RlOidzYW1wbGVzJyB9KSxcbiAgICAgIHN0b3JlSW5wdXQgICA9IGcubWVtbyggZy5hZGQoIGcubXVsKCBvdXQsIGcuc3ViKCAxLCBkYW1waW5nKSksIGcubXVsKCBsYXN0U2FtcGxlLm91dCwgZGFtcGluZyApICkgKVxuICAgICAgXG4gIGxhc3RTYW1wbGUuaW4oIHN0b3JlSW5wdXQgKVxuIFxuICBnLnBva2UoIGNvbWJCdWZmZXIsIGcuYWRkKCBfaW5wdXQsIGcubXVsKCBzdG9yZUlucHV0LCBmZWVkYmFja0NvZWZmICkgKSwgcmVhZFdyaXRlSWR4IClcbiBcbiAgcmV0dXJuIG91dFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbWJGaWx0ZXJcbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZmlsdGVyID0gcmVxdWlyZSggJy4vZmlsdGVyLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgR2liYmVyaXNoLmdlbmlzaC5kaW9kZVpERiA9ICggaW5wdXQsIFEsIGZyZXEsIHNhdHVyYXRpb24sIGlzU3RlcmVvPWZhbHNlICkgPT4ge1xuICAgIGNvbnN0IGlUID0gMSAvIGcuZ2VuLnNhbXBsZXJhdGUsXG4gICAgICAgICAga3oxID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIGt6MiA9IGcuaGlzdG9yeSgwKSxcbiAgICAgICAgICBrejMgPSBnLmhpc3RvcnkoMCksXG4gICAgICAgICAga3o0ID0gZy5oaXN0b3J5KDApXG5cbiAgICBsZXQgICBrYTEgPSAxLjAsXG4gICAgICAgICAga2EyID0gMC41LFxuICAgICAgICAgIGthMyA9IDAuNSxcbiAgICAgICAgICBrYTQgPSAwLjUsXG4gICAgICAgICAga2luZHggPSAwICAgXG5cbiAgICAvLyBrd2QgPSAyICogJE1fUEkgKiBhY2Zba2luZHhdXG4gICAgY29uc3Qga3dkID0gZy5tZW1vKCBnLm11bCggTWF0aC5QSSAqIDIsIGZyZXEgKSApXG5cbiAgICAvLyBrd2EgPSAoMi9pVCkgKiB0YW4oa3dkICogaVQvMikgXG4gICAgY29uc3Qga3dhID1nLm1lbW8oIGcubXVsKCAyL2lULCBnLnRhbiggZy5tdWwoIGt3ZCwgaVQvMiApICkgKSApXG5cbiAgICAvLyBrRyAgPSBrd2EgKiBpVC8yIFxuICAgIGNvbnN0IGtnID0gZy5tZW1vKCBnLm11bCgga3dhLCBpVC8yICkgKVxuICAgIFxuICAgIGNvbnN0IGtHNCA9IGcubWVtbyggZy5tdWwoIC41LCBnLmRpdigga2csIGcuYWRkKCAxLCBrZyApICkgKSApXG4gICAgY29uc3Qga0czID0gZy5tZW1vKCBnLm11bCggLjUsIGcuZGl2KCBrZywgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCggZy5tdWwoIC41LCBrZyApLCBrRzQgKSApICkgKSApXG4gICAgY29uc3Qga0cyID0gZy5tZW1vKCBnLm11bCggLjUsIGcuZGl2KCBrZywgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCggZy5tdWwoIC41LCBrZyApLCBrRzMgKSApICkgKSApXG4gICAgY29uc3Qga0cxID0gZy5tZW1vKCBnLmRpdigga2csIGcuc3ViKCBnLmFkZCggMSwga2cgKSwgZy5tdWwoIGtnLCBrRzIgKSApICkgKVxuXG4gICAgY29uc3Qga0dBTU1BID0gZy5tZW1vKCBnLm11bCggZy5tdWwoIGtHNCwga0czICkgLCBnLm11bCgga0cyLCBrRzEgKSApIClcblxuICAgIGNvbnN0IGtTRzEgPSBnLm1lbW8oIGcubXVsKCBnLm11bCgga0c0LCBrRzMgKSwga0cyICkgKSBcblxuICAgIGNvbnN0IGtTRzIgPSBnLm1lbW8oIGcubXVsKCBrRzQsIGtHMykgKSAgXG4gICAgY29uc3Qga1NHMyA9IGtHNCBcbiAgICBsZXQga1NHNCA9IDEuMCBcbiAgICAvLyBrayA9IDQuMCooa1EgLSAwLjUpLygyNS4wIC0gMC41KVxuICAgIGNvbnN0IGthbHBoYSA9IGcubWVtbyggZy5kaXYoIGtnLCBnLmFkZCgxLjAsIGtnKSApIClcblxuICAgIGNvbnN0IGtiZXRhMSA9IGcubWVtbyggZy5kaXYoIDEuMCwgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCgga2csIGtHMiApICkgKSApXG4gICAgY29uc3Qga2JldGEyID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBnLm11bCggLjUsIGtnICksIGtHMyApICkgKSApXG4gICAgY29uc3Qga2JldGEzID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBnLm11bCggLjUsIGtnICksIGtHNCApICkgKSApXG4gICAgY29uc3Qga2JldGE0ID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLmFkZCggMSwga2cgKSApICkgXG5cbiAgICBjb25zdCBrZ2FtbWExID0gZy5tZW1vKCBnLmFkZCggMSwgZy5tdWwoIGtHMSwga0cyICkgKSApXG4gICAgY29uc3Qga2dhbW1hMiA9IGcubWVtbyggZy5hZGQoIDEsIGcubXVsKCBrRzIsIGtHMyApICkgKVxuICAgIGNvbnN0IGtnYW1tYTMgPSBnLm1lbW8oIGcuYWRkKCAxLCBnLm11bCgga0czLCBrRzQgKSApIClcblxuICAgIGNvbnN0IGtkZWx0YTEgPSBrZ1xuICAgIGNvbnN0IGtkZWx0YTIgPSBnLm1lbW8oIGcubXVsKCAwLjUsIGtnICkgKVxuICAgIGNvbnN0IGtkZWx0YTMgPSBnLm1lbW8oIGcubXVsKCAwLjUsIGtnICkgKVxuXG4gICAgY29uc3Qga2Vwc2lsb24xID0ga0cyXG4gICAgY29uc3Qga2Vwc2lsb24yID0ga0czXG4gICAgY29uc3Qga2Vwc2lsb24zID0ga0c0XG5cbiAgICBjb25zdCBrbGFzdGN1dCA9IGZyZXFcblxuICAgIC8vOzsgZmVlZGJhY2sgaW5wdXRzIFxuICAgIGNvbnN0IGtmYjQgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTQgLCBrejQub3V0ICkgKSBcbiAgICBjb25zdCBrZmIzID0gZy5tZW1vKCBnLm11bCgga2JldGEzLCBnLmFkZCgga3ozLm91dCwgZy5tdWwoIGtmYjQsIGtkZWx0YTMgKSApICkgKVxuICAgIGNvbnN0IGtmYjIgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTIsIGcuYWRkKCBrejIub3V0LCBnLm11bCgga2ZiMywga2RlbHRhMiApICkgKSApXG5cbiAgICAvLzs7IGZlZWRiYWNrIHByb2Nlc3NcblxuICAgIGNvbnN0IGtmYm8xID0gZy5tZW1vKCBnLm11bCgga2JldGExLCBnLmFkZCgga3oxLm91dCwgZy5tdWwoIGtmYjIsIGtkZWx0YTEgKSApICkgKSBcbiAgICBjb25zdCBrZmJvMiA9IGcubWVtbyggZy5tdWwoIGtiZXRhMiwgZy5hZGQoIGt6Mi5vdXQsIGcubXVsKCBrZmIzLCBrZGVsdGEyICkgKSApICkgXG4gICAgY29uc3Qga2ZibzMgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTMsIGcuYWRkKCBrejMub3V0LCBnLm11bCgga2ZiNCwga2RlbHRhMyApICkgKSApIFxuICAgIGNvbnN0IGtmYm80ID0ga2ZiNFxuXG4gICAgY29uc3Qga1NJR01BID0gZy5tZW1vKCBcbiAgICAgIGcuYWRkKCBcbiAgICAgICAgZy5hZGQoIFxuICAgICAgICAgIGcubXVsKCBrU0cxLCBrZmJvMSApLCBcbiAgICAgICAgICBnLm11bCgga1NHMiwga2ZibzIgKVxuICAgICAgICApLCBcbiAgICAgICAgZy5hZGQoXG4gICAgICAgICAgZy5tdWwoIGtTRzMsIGtmYm8zICksIFxuICAgICAgICAgIGcubXVsKCBrU0c0LCBrZmJvNCApXG4gICAgICAgICkgXG4gICAgICApIFxuICAgIClcblxuICAgIC8vY29uc3Qga1NJR01BID0gMVxuICAgIC8vOzsgbm9uLWxpbmVhciBwcm9jZXNzaW5nXG4gICAgLy9pZiAoa25scCA9PSAxKSB0aGVuXG4gICAgLy8gIGtpbiA9ICgxLjAgLyB0YW5oKGtzYXR1cmF0aW9uKSkgKiB0YW5oKGtzYXR1cmF0aW9uICoga2luKVxuICAgIC8vZWxzZWlmIChrbmxwID09IDIpIHRoZW5cbiAgICAvLyAga2luID0gdGFuaChrc2F0dXJhdGlvbiAqIGtpbikgXG4gICAgLy9lbmRpZlxuICAgIC8vXG4gICAgLy9jb25zdCBraW4gPSBpbnB1dCBcbiAgICBsZXQga2luID0gaW5wdXQvL2cubWVtbyggZy5tdWwoIGcuZGl2KCAxLCBnLnRhbmgoIHNhdHVyYXRpb24gKSApLCBnLnRhbmgoIGcubXVsKCBzYXR1cmF0aW9uLCBpbnB1dCApICkgKSApXG4gICAga2luID0gZy50YW5oKCBnLm11bCggc2F0dXJhdGlvbiwga2luICkgKVxuXG4gICAgY29uc3Qga3VuID0gZy5kaXYoIGcuc3ViKCBraW4sIGcubXVsKCBRLCBrU0lHTUEgKSApLCBnLmFkZCggMSwgZy5tdWwoIFEsIGtHQU1NQSApICkgKVxuICAgIC8vY29uc3Qga3VuID0gZy5kaXYoIDEsIGcuYWRkKCAxLCBnLm11bCggUSwga0dBTU1BICkgKSApXG4gICAgICAgIC8vKGtpbiAtIGtrICoga1NJR01BKSAvICgxLjAgKyBrayAqIGtHQU1NQSlcblxuICAgIC8vOzsgMXN0IHN0YWdlXG4gICAgbGV0IGt4aW4gPSBnLm1lbW8oIGcuYWRkKCBnLmFkZCggZy5tdWwoIGt1biwga2dhbW1hMSApLCBrZmIyKSwgZy5tdWwoIGtlcHNpbG9uMSwga2ZibzEgKSApIClcbiAgICAvLyAoa3VuICoga2dhbW1hMSArIGtmYjIgKyBrZXBzaWxvbjEgKiBrZmJvMSlcbiAgICBsZXQga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthMSwga3hpbiApLCBrejEub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGxldCBrbHAgPSBnLmFkZCgga3YsIGt6MS5vdXQgKVxuICAgIC8va2xwID0ga3YgKyBrejFcbiAgICBrejEuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKSBcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAgICAgLy87OyAybmQgc3RhZ2VcbiAgICAvL2t4aW4gPSAoa2xwICoga2dhbW1hMiArIGtmYjMgKyBrZXBzaWxvbjIgKiBrZmJvMilcbiAgICAvL2t2ID0gKGthMiAqIGt4aW4gLSBrejIpICoga2FscGhhIFxuICAgIC8va2xwID0ga3YgKyBrejJcbiAgICAvL2t6MiA9IGtscCArIGt2XG5cbiAgICBreGluID0gZy5tZW1vKCBnLmFkZCggZy5hZGQoIGcubXVsKCBrbHAsIGtnYW1tYTIgKSwga2ZiMyksIGcubXVsKCBrZXBzaWxvbjIsIGtmYm8yICkgKSApXG4gICAgLy8gKGt1biAqIGtnYW1tYTEgKyBrZmIyICsga2Vwc2lsb24xICoga2ZibzEpXG4gICAga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthMiwga3hpbiApLCBrejIub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGtscCA9IGcuYWRkKCBrdiwga3oyLm91dCApIFxuICAgIC8va2xwID0ga3YgKyBrejFcbiAgICBrejIuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKSBcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAvLzs7IDNyZCBzdGFnZVxuICAgIC8va3hpbiA9IChrbHAgKiBrZ2FtbWEzICsga2ZiNCArIGtlcHNpbG9uMyAqIGtmYm8zKVxuICAgIC8va3YgPSAoa2EzICoga3hpbiAtIGt6MykgKiBrYWxwaGEgXG4gICAgLy9rbHAgPSBrdiArIGt6M1xuICAgIC8va3ozID0ga2xwICsga3ZcblxuICAgIGt4aW4gPSBnLm1lbW8oIGcuYWRkKCBnLmFkZCggZy5tdWwoIGtscCwga2dhbW1hMyApLCBrZmI0KSwgZy5tdWwoIGtlcHNpbG9uMywga2ZibzMgKSApIClcbiAgICAvLyAoa3VuICoga2dhbW1hMSArIGtmYjIgKyBrZXBzaWxvbjEgKiBrZmJvMSlcbiAgICBrdiA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBnLm11bCgga2EzLCBreGluICksIGt6My5vdXQgKSwga2FscGhhICkgKVxuICAgIC8va3YgPSAoa2ExICoga3hpbiAtIGt6MSkgKiBrYWxwaGEgXG4gICAga2xwID0gZy5hZGQoIGt2LCBrejMub3V0IClcbiAgICAvL2tscCA9IGt2ICsga3oxXG4gICAga3ozLmluKCBnLmFkZCgga2xwLCBrdiApIClcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAvLzs7IDR0aCBzdGFnZVxuICAgIC8va3YgPSAoa2E0ICoga2xwIC0ga3o0KSAqIGthbHBoYSBcbiAgICAvL2tscCA9IGt2ICsga3o0XG4gICAgLy9rejQgPSBrbHAgKyBrdlxuXG4gICAgLy8gKGt1biAqIGtnYW1tYTEgKyBrZmIyICsga2Vwc2lsb24xICoga2ZibzEpXG4gICAga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthNCwga3hpbiApLCBrejQub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGtscCA9IGcuYWRkKCBrdiwga3o0Lm91dCApXG4gICAgLy9rbHAgPSBrdiArIGt6MVxuICAgIGt6NC5pbiggZy5hZGQoIGtscCwga3YgKSApXG5cbiAgICAvL2t6MSA9IGtscCArIGt2XG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgLy9sZXQgcG9sZXNSID0gZy5kYXRhKFsgMCwwLDAsMCBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgIC8vICAgIHJlenpSID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzUlszXSwgcmV6ICkgKSxcbiAgICAgIC8vICAgIG91dHB1dFIgPSBnLnN1YiggaW5wdXRbMV0sIHJlenpSICkgICAgICAgICBcblxuICAgICAgLy9wb2xlc1JbMF0gPSBnLmFkZCggcG9sZXNSWzBdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMF0gKSwgb3V0cHV0UiAgICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMV0gPSBnLmFkZCggcG9sZXNSWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMV0gKSwgcG9sZXNSWzBdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMl0gPSBnLmFkZCggcG9sZXNSWzJdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMl0gKSwgcG9sZXNSWzFdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbM10gPSBnLmFkZCggcG9sZXNSWzNdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbM10gKSwgcG9sZXNSWzJdICksIGN1dG9mZiApKVxuXG4gICAgICAvL2xldCByaWdodCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzUlszXSwgZy5zdWIoIG91dHB1dFIsIHBvbGVzUlszXSApIClcblxuICAgICAgLy9yZXR1cm5WYWx1ZSA9IFtsZWZ0LCByaWdodF1cbiAgICB9ZWxzZXtcbiAgICAgLy8gcmV0dXJuVmFsdWUgPSBrbHBcbiAgICB9XG4gICAgcmV0dXJuVmFsdWUgPSBrbHBcbiAgICBcbiAgICByZXR1cm4gcmV0dXJuVmFsdWUvLyBrbHAvL3JldHVyblZhbHVlXG4gfVxuXG4gIGNvbnN0IERpb2RlWkRGID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgY29uc3QgemRmICAgICAgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIGNvbnN0IHByb3BzICAgID0gT2JqZWN0LmFzc2lnbigge30sIERpb2RlWkRGLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBjb25zdCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvIFxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoXG4gICAgICB6ZGYsIFxuICAgICAgR2liYmVyaXNoLmdlbmlzaC5kaW9kZVpERiggZy5pbignaW5wdXQnKSwgZy5pbignUScpLCBnLmluKCdjdXRvZmYnKSwgZy5pbignc2F0dXJhdGlvbicpLCBpc1N0ZXJlbyApLCBcbiAgICAgICdkaW9kZVpERicsXG4gICAgICBwcm9wc1xuICAgIClcblxuICAgIHJldHVybiB6ZGZcbiAgfVxuXG4gIERpb2RlWkRGLmRlZmF1bHRzID0ge1xuICAgIGlucHV0OjAsXG4gICAgUTogNSxcbiAgICBzYXR1cmF0aW9uOiAxLFxuICAgIGN1dG9mZjogNDQwLFxuICB9XG5cbiAgcmV0dXJuIERpb2RlWkRGXG5cbn1cbiIsImxldCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubGV0IGZpbHRlciA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG5PYmplY3QuYXNzaWduKCBmaWx0ZXIsIHtcblxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBmaWx0ZXJcbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBmaWx0ZXIgPSByZXF1aXJlKCAnLi9maWx0ZXIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIEdpYmJlcmlzaC5nZW5pc2guZmlsdGVyMjQgPSAoIGlucHV0LCByZXosIGN1dG9mZiwgaXNMb3dQYXNzLCBpc1N0ZXJlbz1mYWxzZSApID0+IHtcbiAgICBsZXQgcmV0dXJuVmFsdWUsXG4gICAgICAgIHBvbGVzTCA9IGcuZGF0YShbIDAsMCwwLDAgXSwgMSwgeyBtZXRhOnRydWUgfSksXG4gICAgICAgIHBlZWtQcm9wcyA9IHsgaW50ZXJwOidub25lJywgbW9kZTonc2ltcGxlJyB9LFxuICAgICAgICByZXp6TCA9IGcuY2xhbXAoIGcubXVsKCBwb2xlc0xbM10sIHJleiApICksXG4gICAgICAgIG91dHB1dEwgPSBnLnN1YiggaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0LCByZXp6TCApIFxuXG4gICAgcG9sZXNMWzBdID0gZy5hZGQoIHBvbGVzTFswXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNMWzBdICksIG91dHB1dEwgICApLCBjdXRvZmYgKSlcbiAgICBwb2xlc0xbMV0gPSBnLmFkZCggcG9sZXNMWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc0xbMV0gKSwgcG9sZXNMWzBdICksIGN1dG9mZiApKVxuICAgIHBvbGVzTFsyXSA9IGcuYWRkKCBwb2xlc0xbMl0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzTFsyXSApLCBwb2xlc0xbMV0gKSwgY3V0b2ZmICkpXG4gICAgcG9sZXNMWzNdID0gZy5hZGQoIHBvbGVzTFszXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNMWzNdICksIHBvbGVzTFsyXSApLCBjdXRvZmYgKSlcbiAgICBcbiAgICBsZXQgbGVmdCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzTFszXSwgZy5zdWIoIG91dHB1dEwsIHBvbGVzTFszXSApIClcblxuICAgIGlmKCBpc1N0ZXJlbyApIHtcbiAgICAgIGxldCBwb2xlc1IgPSBnLmRhdGEoWyAwLDAsMCwwIF0sIDEsIHsgbWV0YTp0cnVlIH0pLFxuICAgICAgICAgIHJlenpSID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzUlszXSwgcmV6ICkgKSxcbiAgICAgICAgICBvdXRwdXRSID0gZy5zdWIoIGlucHV0WzFdLCByZXp6UiApICAgICAgICAgXG5cbiAgICAgIHBvbGVzUlswXSA9IGcuYWRkKCBwb2xlc1JbMF0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlswXSApLCBvdXRwdXRSICAgKSwgY3V0b2ZmICkpXG4gICAgICBwb2xlc1JbMV0gPSBnLmFkZCggcG9sZXNSWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMV0gKSwgcG9sZXNSWzBdICksIGN1dG9mZiApKVxuICAgICAgcG9sZXNSWzJdID0gZy5hZGQoIHBvbGVzUlsyXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNSWzJdICksIHBvbGVzUlsxXSApLCBjdXRvZmYgKSlcbiAgICAgIHBvbGVzUlszXSA9IGcuYWRkKCBwb2xlc1JbM10sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlszXSApLCBwb2xlc1JbMl0gKSwgY3V0b2ZmICkpXG5cbiAgICAgIGxldCByaWdodCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzUlszXSwgZy5zdWIoIG91dHB1dFIsIHBvbGVzUlszXSApIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBbbGVmdCwgcmlnaHRdXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm5WYWx1ZSA9IGxlZnRcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxuXG4gIGxldCBGaWx0ZXIyNCA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGxldCBmaWx0ZXIyNCAgID0gT2JqZWN0LmNyZWF0ZSggZmlsdGVyIClcbiAgICBsZXQgcHJvcHMgICAgPSBPYmplY3QuYXNzaWduKCB7fSwgRmlsdGVyMjQuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvIFxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoXG4gICAgICBmaWx0ZXIyNCwgXG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLmZpbHRlcjI0KCBnLmluKCdpbnB1dCcpLCBnLmluKCdyZXNvbmFuY2UnKSwgZy5pbignY3V0b2ZmJyksIGcuaW4oJ2lzTG93UGFzcycpLCBpc1N0ZXJlbyApLCBcbiAgICAgICdmaWx0ZXIyNCcsXG4gICAgICBwcm9wc1xuICAgIClcblxuICAgIHJldHVybiBmaWx0ZXIyNFxuICB9XG5cblxuICBGaWx0ZXIyNC5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIHJlc29uYW5jZTogMy41LFxuICAgIGN1dG9mZjogLjEsXG4gICAgaXNMb3dQYXNzOjFcbiAgfVxuXG4gIHJldHVybiBGaWx0ZXIyNFxuXG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBnID0gR2liYmVyaXNoLmdlbmlzaFxuXG4gIGNvbnN0IGZpbHRlcnMgPSB7XG4gICAgRmlsdGVyMjRDbGFzc2ljIDogcmVxdWlyZSggJy4vZmlsdGVyMjQuanMnICApKCBHaWJiZXJpc2ggKSxcbiAgICBGaWx0ZXIyNE1vb2cgICAgOiByZXF1aXJlKCAnLi9sYWRkZXJGaWx0ZXJaZXJvRGVsYXkuanMnICkoIEdpYmJlcmlzaCApLFxuICAgIEZpbHRlcjI0VEIzMDMgICA6IHJlcXVpcmUoICcuL2Rpb2RlRmlsdGVyWkRGLmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgICBGaWx0ZXIxMkJpcXVhZCAgOiByZXF1aXJlKCAnLi9iaXF1YWQuanMnICAgICkoIEdpYmJlcmlzaCApLFxuICAgIEZpbHRlcjEyU1ZGICAgICA6IHJlcXVpcmUoICcuL3N2Zi5qcycgICAgICAgKSggR2liYmVyaXNoICksXG4gICAgXG4gICAgLy8gbm90IGZvciB1c2UgYnkgZW5kLXVzZXJzXG4gICAgZ2VuaXNoOiB7XG4gICAgICBDb21iICAgICAgICA6IHJlcXVpcmUoICcuL2NvbWJmaWx0ZXIuanMnICksXG4gICAgICBBbGxQYXNzICAgICA6IHJlcXVpcmUoICcuL2FsbHBhc3MuanMnIClcbiAgICB9LFxuXG4gICAgZmFjdG9yeSggaW5wdXQsIGN1dG9mZiwgcmVzb25hbmNlLCBzYXR1cmF0aW9uID0gbnVsbCwgcHJvcHMsIGlzU3RlcmVvID0gZmFsc2UgKSB7XG4gICAgICBsZXQgZmlsdGVyZWRPc2MgXG5cbiAgICAgIGlmKCBwcm9wcy5maWx0ZXJUeXBlID09PSAxICkge1xuICAgICAgICBpZiggdHlwZW9mIHByb3BzLmN1dG9mZiAhPT0gJ29iamVjdCcgJiYgcHJvcHMuY3V0b2ZmID4gMSApIHtcbiAgICAgICAgICBwcm9wcy5jdXRvZmYgPSAuMjVcbiAgICAgICAgfVxuICAgICAgICBpZiggdHlwZW9mIHByb3BzLmN1dG9mZiAhPT0gJ29iamVjdCcgJiYgcHJvcHMuZmlsdGVyTXVsdCA+IC41ICkge1xuICAgICAgICAgIHByb3BzLmZpbHRlck11bHQgPSAuMVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCggcHJvcHMuZmlsdGVyVHlwZSApIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlzTG93UGFzcyA9IGcucGFyYW0oICdsb3dQYXNzJywgMSApLFxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gZy5maWx0ZXIyNCggaW5wdXQsIGcuaW4oJ3Jlc29uYW5jZScpLCBjdXRvZmYsIGlzTG93UGFzcywgaXNTdGVyZW8gKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBnLnpkMjQoIGlucHV0LCBnLmluKCdRJyksIGN1dG9mZiApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBmaWx0ZXJlZE9zYyA9IGcuZGlvZGVaREYoIGlucHV0LCBnLmluKCdRJyksIGN1dG9mZiwgZy5pbignc2F0dXJhdGlvbicpLCBpc1N0ZXJlbyApIFxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vIHJldHVybiB1bmZpbHRlcmVkIHNpZ25hbFxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gaW5wdXQgLy9nLmZpbHRlcjI0KCBvc2NXaXRoR2FpbiwgZy5pbigncmVzb25hbmNlJyksIGN1dG9mZiwgaXNMb3dQYXNzIClcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZpbHRlcmVkT3NjXG4gICAgfSBcbiAgfVxuXG4gIGZpbHRlcnMuZXhwb3J0ID0gdGFyZ2V0ID0+IHtcbiAgICBmb3IoIGxldCBrZXkgaW4gZmlsdGVycyApIHtcbiAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICYmIGtleSAhPT0gJ2dlbmlzaCcgKSB7XG4gICAgICAgIHRhcmdldFsga2V5IF0gPSBmaWx0ZXJzWyBrZXkgXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5yZXR1cm4gZmlsdGVyc1xuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGZpbHRlciA9IHJlcXVpcmUoICcuL2ZpbHRlci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgR2liYmVyaXNoLmdlbmlzaC56ZDI0ID0gKCBpbnB1dCwgUSwgZnJlcSwgaXNTdGVyZW89ZmFsc2UgKSA9PiB7XG4gICAgY29uc3QgaVQgPSAxIC8gZy5nZW4uc2FtcGxlcmF0ZSxcbiAgICAgICAgICB6MSA9IGcuaGlzdG9yeSgwKSxcbiAgICAgICAgICB6MiA9IGcuaGlzdG9yeSgwKSxcbiAgICAgICAgICB6MyA9IGcuaGlzdG9yeSgwKSxcbiAgICAgICAgICB6NCA9IGcuaGlzdG9yeSgwKVxuXG4gICAgLy8ga3dkID0gMiAqICRNX1BJICogYWNmW2tpbmR4XVxuICAgIGNvbnN0IGt3ZCA9IGcubWVtbyggZy5tdWwoIE1hdGguUEkgKiAyLCBmcmVxICkgKVxuXG4gICAgLy8ga3dhID0gKDIvaVQpICogdGFuKGt3ZCAqIGlULzIpIFxuICAgIGNvbnN0IGt3YSA9Zy5tZW1vKCBnLm11bCggMi9pVCwgZy50YW4oIGcubXVsKCBrd2QsIGlULzIgKSApICkgKVxuXG4gICAgLy8ga0cgID0ga3dhICogaVQvMiBcbiAgICBjb25zdCBrZyA9IGcubWVtbyggZy5tdWwoIGt3YSwgaVQvMiApIClcblxuICAgIC8vIGtrID0gNC4wKihrUSAtIDAuNSkvKDI1LjAgLSAwLjUpXG4gICAgY29uc3Qga2sgPSBnLm1lbW8oIGcubXVsKCA0LCBnLmRpdiggZy5zdWIoIFEsIC41ICksIDI0LjUgKSApIClcblxuICAgIC8vIGtnX3BsdXNfMSA9ICgxLjAgKyBrZylcbiAgICBjb25zdCBrZ19wbHVzXzEgPSBnLmFkZCggMSwga2cgKVxuXG4gICAgLy8ga0cgPSBrZyAvIGtnX3BsdXNfMSBcbiAgICBjb25zdCBrRyAgICAgPSBnLm1lbW8oIGcuZGl2KCBrZywga2dfcGx1c18xICkgKSxcbiAgICAgICAgICBrR18yICAgPSBnLm1lbW8oIGcubXVsKCBrRywga0cgKSApLFxuICAgICAgICAgIGtHXzMgICA9IGcubXVsKCBrR18yLCBrRyApLFxuICAgICAgICAgIGtHQU1NQSA9IGcubXVsKCBrR18yLCBrR18yIClcblxuICAgIGNvbnN0IGtTMSA9IGcuZGl2KCB6MS5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTMiA9IGcuZGl2KCB6Mi5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTMyA9IGcuZGl2KCB6My5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTNCA9IGcuZGl2KCB6NC5vdXQsIGtnX3BsdXNfMSApXG5cbiAgICAvL2tTID0ga0dfMyAqIGtTMSAgKyBrR18yICoga1MyICsga0cgKiBrUzMgKyBrUzQgXG4gICAgY29uc3Qga1MgPSBnLm1lbW8oIFxuICAgICAgZy5hZGQoXG4gICAgICAgIGcuYWRkKCBnLm11bChrR18zLCBrUzEpLCBnLm11bCgga0dfMiwga1MyKSApLFxuICAgICAgICBnLmFkZCggZy5tdWwoa0csIGtTMyksIGtTNCApXG4gICAgICApXG4gICAgKVxuXG4gICAgLy9rdSA9IChraW4gLSBrayAqICBrUykgLyAoMSArIGtrICoga0dBTU1BKVxuICAgIGNvbnN0IGt1MSA9IGcuc3ViKCBpbnB1dCwgZy5tdWwoIGtrLCBrUyApIClcbiAgICBjb25zdCBrdTIgPSBnLm1lbW8oIGcuYWRkKCAxLCBnLm11bCgga2ssIGtHQU1NQSApICkgKVxuICAgIGNvbnN0IGt1ICA9IGcubWVtbyggZy5kaXYoIGt1MSwga3UyICkgKVxuXG4gICAgbGV0IGt2ID0gIGcubWVtbyggZy5tdWwoIGcuc3ViKCBrdSwgejEub3V0ICksIGtHICkgKVxuICAgIGxldCBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejEub3V0ICkgKVxuICAgIHoxLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHoyLm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejIub3V0ICkgKVxuICAgIHoyLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHozLm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejMub3V0ICkgKVxuICAgIHozLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHo0Lm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejQub3V0ICkgKVxuICAgIHo0LmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgLy9sZXQgcG9sZXNSID0gZy5kYXRhKFsgMCwwLDAsMCBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgIC8vICAgIHJlenpSID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzUlszXSwgcmV6ICkgKSxcbiAgICAgIC8vICAgIG91dHB1dFIgPSBnLnN1YiggaW5wdXRbMV0sIHJlenpSICkgICAgICAgICBcblxuICAgICAgLy9wb2xlc1JbMF0gPSBnLmFkZCggcG9sZXNSWzBdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMF0gKSwgb3V0cHV0UiAgICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMV0gPSBnLmFkZCggcG9sZXNSWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMV0gKSwgcG9sZXNSWzBdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMl0gPSBnLmFkZCggcG9sZXNSWzJdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMl0gKSwgcG9sZXNSWzFdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbM10gPSBnLmFkZCggcG9sZXNSWzNdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbM10gKSwgcG9sZXNSWzJdICksIGN1dG9mZiApKVxuXG4gICAgICAvL2xldCByaWdodCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzUlszXSwgZy5zdWIoIG91dHB1dFIsIHBvbGVzUlszXSApIClcblxuICAgICAgLy9yZXR1cm5WYWx1ZSA9IFtsZWZ0LCByaWdodF1cbiAgICB9ZWxzZXtcbiAgICAgIHJldHVyblZhbHVlID0ga2xwXG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cblxuICBjb25zdCBaZDI0ID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgY29uc3QgZmlsdGVyICAgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIGNvbnN0IHByb3BzICAgID0gT2JqZWN0LmFzc2lnbigge30sIFpkMjQuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIGZpbHRlciwgXG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLnpkMjQoIGcuaW4oJ2lucHV0JyksIGcuaW4oJ1EnKSwgZy5pbignY3V0b2ZmJyksIGlzU3RlcmVvICksIFxuICAgICAgJ3pkMjQnLFxuICAgICAgcHJvcHNcbiAgICApXG5cbiAgICByZXR1cm4gZmlsdGVyXG4gIH1cblxuXG4gIFpkMjQuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICBROiA1LFxuICAgIGN1dG9mZjogNDQwLFxuICB9XG5cbiAgcmV0dXJuIFpkMjRcblxufVxuXG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGZpbHRlciA9IHJlcXVpcmUoICcuL2ZpbHRlci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIEdpYmJlcmlzaC5nZW5pc2guc3ZmID0gKCBpbnB1dCwgY3V0b2ZmLCBRLCBtb2RlLCBpc1N0ZXJlbyApID0+IHtcbiAgICBsZXQgZDEgPSBnLmRhdGEoWzAsMF0sIDEsIHsgbWV0YTp0cnVlIH0pLCBkMiA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSksXG4gICAgICAgIHBlZWtQcm9wcyA9IHsgbW9kZTonc2ltcGxlJywgaW50ZXJwOidub25lJyB9XG4gICAgXG4gICAgbGV0IGYxID0gZy5tZW1vKCBnLm11bCggMiAqIE1hdGguUEksIGcuZGl2KCBjdXRvZmYsIGcuZ2VuLnNhbXBsZXJhdGUgKSApIClcbiAgICBsZXQgb25lT3ZlclEgPSBnLm1lbW8oIGcuZGl2KCAxLCBRICkgKVxuICAgIGxldCBsID0gZy5tZW1vKCBnLmFkZCggZDJbMF0sIGcubXVsKCBmMSwgZDFbMF0gKSApICksXG4gICAgICAgIGggPSBnLm1lbW8oIGcuc3ViKCBnLnN1YiggaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0LCBsICksIGcubXVsKCBRLCBkMVswXSApICkgKSxcbiAgICAgICAgYiA9IGcubWVtbyggZy5hZGQoIGcubXVsKCBmMSwgaCApLCBkMVswXSApICksXG4gICAgICAgIG4gPSBnLm1lbW8oIGcuYWRkKCBoLCBsICkgKVxuXG4gICAgZDFbMF0gPSBiXG4gICAgZDJbMF0gPSBsXG5cbiAgICBsZXQgb3V0ID0gZy5zZWxlY3RvciggbW9kZSwgbCwgaCwgYiwgbiApXG5cbiAgICBsZXQgcmV0dXJuVmFsdWVcbiAgICBpZiggaXNTdGVyZW8gKSB7XG4gICAgICBsZXQgZDEyID0gZy5kYXRhKFswLDBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSwgZDIyID0gZy5kYXRhKFswLDBdLCAxLCB7IG1ldGE6dHJ1ZSB9KVxuICAgICAgbGV0IGwyID0gZy5tZW1vKCBnLmFkZCggZDIyWzBdLCBnLm11bCggZjEsIGQxMlswXSApICkgKSxcbiAgICAgICAgICBoMiA9IGcubWVtbyggZy5zdWIoIGcuc3ViKCBpbnB1dFsxXSwgbDIgKSwgZy5tdWwoIFEsIGQxMlswXSApICkgKSxcbiAgICAgICAgICBiMiA9IGcubWVtbyggZy5hZGQoIGcubXVsKCBmMSwgaDIgKSwgZDEyWzBdICkgKSxcbiAgICAgICAgICBuMiA9IGcubWVtbyggZy5hZGQoIGgyLCBsMiApIClcblxuICAgICAgZDEyWzBdID0gYjJcbiAgICAgIGQyMlswXSA9IGwyXG5cbiAgICAgIGxldCBvdXQyID0gZy5zZWxlY3RvciggbW9kZSwgbDIsIGgyLCBiMiwgbjIgKVxuXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgb3V0LCBvdXQyIF1cbiAgICB9ZWxzZXtcbiAgICAgIHJldHVyblZhbHVlID0gb3V0XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cblxuICBsZXQgU1ZGID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgY29uc3Qgc3ZmID0gT2JqZWN0LmNyZWF0ZSggZmlsdGVyIClcbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBTVkYuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSBcblxuICAgIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW9cbiAgICBcbiAgICAvLyBYWFggTkVFRFMgUkVGQUNUT1JJTkdcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICBzdmYsXG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLnN2ZiggZy5pbignaW5wdXQnKSwgZy5pbignY3V0b2ZmJyksIGcuaW4oJ1EnKSwgZy5pbignbW9kZScpLCBpc1N0ZXJlbyApLCBcbiAgICAgICdzdmYnLCBcbiAgICAgIHByb3BzXG4gICAgKVxuXG4gICAgcmV0dXJuIHN2ZlxuICB9XG5cblxuICBTVkYuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICBROiAuNzUsXG4gICAgY3V0b2ZmOjU1MCxcbiAgICBtb2RlOjBcbiAgfVxuXG4gIHJldHVybiBTVkZcblxufVxuXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBCaXRDcnVzaGVyID0gaW5wdXRQcm9wcyA9PiB7XG4gIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHsgYml0Q3J1c2hlckxlbmd0aDogNDQxMDAgfSwgQml0Q3J1c2hlci5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgYml0Q3J1c2hlciA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIGJpdERlcHRoID0gZy5pbiggJ2JpdERlcHRoJyApLFxuICAgICAgc2FtcGxlUmF0ZSA9IGcuaW4oICdzYW1wbGVSYXRlJyApLFxuICAgICAgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMCBdIDogaW5wdXQsXG4gICAgICByaWdodElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMSBdIDogbnVsbFxuICBcbiAgbGV0IHN0b3JlTCA9IGcuaGlzdG9yeSgwKVxuICBsZXQgc2FtcGxlUmVkdXhDb3VudGVyID0gZy5jb3VudGVyKCBzYW1wbGVSYXRlLCAwLCAxIClcblxuICBsZXQgYml0TXVsdCA9IGcucG93KCBnLm11bCggYml0RGVwdGgsIDE2ICksIDIgKVxuICBsZXQgY3J1c2hlZEwgPSBnLmRpdiggZy5mbG9vciggZy5tdWwoIGxlZnRJbnB1dCwgYml0TXVsdCApICksIGJpdE11bHQgKVxuXG4gIGxldCBvdXRMID0gZy5zd2l0Y2goXG4gICAgc2FtcGxlUmVkdXhDb3VudGVyLndyYXAsXG4gICAgY3J1c2hlZEwsXG4gICAgc3RvcmVMLm91dFxuICApXG5cbiAgaWYoIGlzU3RlcmVvICkge1xuICAgIGxldCBzdG9yZVIgPSBnLmhpc3RvcnkoMClcbiAgICBsZXQgY3J1c2hlZFIgPSBnLmRpdiggZy5mbG9vciggZy5tdWwoIHJpZ2h0SW5wdXQsIGJpdE11bHQgKSApLCBiaXRNdWx0IClcblxuICAgIGxldCBvdXRSID0gdGVybmFyeSggXG4gICAgICBzYW1wbGVSZWR1eENvdW50ZXIud3JhcCxcbiAgICAgIGNydXNoZWRSLFxuICAgICAgc3RvcmVMLm91dFxuICAgIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIGJpdENydXNoZXIsXG4gICAgICBbIG91dEwsIG91dFIgXSwgXG4gICAgICAnYml0Q3J1c2hlcicsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggYml0Q3J1c2hlciwgb3V0TCwgJ2JpdENydXNoZXInLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiBiaXRDcnVzaGVyXG59XG5cbkJpdENydXNoZXIuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIGJpdERlcHRoOi41LFxuICBzYW1wbGVSYXRlOiAuNVxufVxuXG5yZXR1cm4gQml0Q3J1c2hlclxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgbGV0IHByb3RvID0gT2JqZWN0LmNyZWF0ZSggZWZmZWN0IClcblxuICBsZXQgU2h1ZmZsZXIgPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgYnVmZmVyU2h1ZmZsZXIgPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgICBidWZmZXJTaXplID0gODgyMDBcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBTaHVmZmxlci5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG5cbiAgICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiBmYWxzZVxuICAgIGxldCBwaGFzZSA9IGcuYWNjdW0oIDEsMCx7IHNob3VsZFdyYXA6IGZhbHNlIH0pXG5cbiAgICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICAgIGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbIDAgXSA6IGlucHV0LFxuICAgICAgICByaWdodElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMSBdIDogbnVsbCxcbiAgICAgICAgcmF0ZU9mU2h1ZmZsaW5nID0gZy5pbiggJ3JhdGUnICksXG4gICAgICAgIGNoYW5jZU9mU2h1ZmZsaW5nID0gZy5pbiggJ2NoYW5jZScgKSxcbiAgICAgICAgcmV2ZXJzZUNoYW5jZSA9IGcuaW4oICdyZXZlcnNlQ2hhbmNlJyApLFxuICAgICAgICByZXBpdGNoQ2hhbmNlID0gZy5pbiggJ3JlcGl0Y2hDaGFuY2UnICksXG4gICAgICAgIHJlcGl0Y2hNaW4gPSBnLmluKCAncmVwaXRjaE1pbicgKSxcbiAgICAgICAgcmVwaXRjaE1heCA9IGcuaW4oICdyZXBpdGNoTWF4JyApXG5cbiAgICBsZXQgcGl0Y2hNZW1vcnkgPSBnLmhpc3RvcnkoMSlcblxuICAgIGxldCBzaG91bGRTaHVmZmxlQ2hlY2sgPSBnLmVxKCBnLm1vZCggcGhhc2UsIHJhdGVPZlNodWZmbGluZyApLCAwIClcbiAgICBsZXQgaXNTaHVmZmxpbmcgPSBnLm1lbW8oIGcuc2FoKCBnLmx0KCBnLm5vaXNlKCksIGNoYW5jZU9mU2h1ZmZsaW5nICksIHNob3VsZFNodWZmbGVDaGVjaywgMCApICkgXG5cbiAgICAvLyBpZiB3ZSBhcmUgc2h1ZmZsaW5nIGFuZCBvbiBhIHJlcGVhdCBib3VuZGFyeS4uLlxuICAgIGxldCBzaHVmZmxlQ2hhbmdlZCA9IGcubWVtbyggZy5hbmQoIHNob3VsZFNodWZmbGVDaGVjaywgaXNTaHVmZmxpbmcgKSApXG4gICAgbGV0IHNob3VsZFJldmVyc2UgPSBnLmx0KCBnLm5vaXNlKCksIHJldmVyc2VDaGFuY2UgKSxcbiAgICAgICAgcmV2ZXJzZU1vZCA9IGcuc3dpdGNoKCBzaG91bGRSZXZlcnNlLCAtMSwgMSApXG5cbiAgICBsZXQgcGl0Y2ggPSBnLmlmZWxzZSggXG4gICAgICBnLmFuZCggc2h1ZmZsZUNoYW5nZWQsIGcubHQoIGcubm9pc2UoKSwgcmVwaXRjaENoYW5jZSApICksXG4gICAgICBnLm1lbW8oIGcubXVsKCBnLmFkZCggcmVwaXRjaE1pbiwgZy5tdWwoIGcuc3ViKCByZXBpdGNoTWF4LCByZXBpdGNoTWluICksIGcubm9pc2UoKSApICksIHJldmVyc2VNb2QgKSApLFxuICAgICAgcmV2ZXJzZU1vZFxuICAgIClcbiAgICBcbiAgICAvLyBvbmx5IHN3aXRjaCBwaXRjaGVzIG9uIHJlcGVhdCBib3VuZGFyaWVzXG4gICAgcGl0Y2hNZW1vcnkuaW4oIGcuc3dpdGNoKCBzaHVmZmxlQ2hhbmdlZCwgcGl0Y2gsIHBpdGNoTWVtb3J5Lm91dCApIClcblxuICAgIGxldCBmYWRlTGVuZ3RoID0gZy5tZW1vKCBnLmRpdiggcmF0ZU9mU2h1ZmZsaW5nLCAxMDAgKSApLFxuICAgICAgICBmYWRlSW5jciA9IGcubWVtbyggZy5kaXYoIDEsIGZhZGVMZW5ndGggKSApXG5cbiAgICBsZXQgYnVmZmVyTCA9IGcuZGF0YSggYnVmZmVyU2l6ZSApLCBidWZmZXJSID0gaXNTdGVyZW8gPyBnLmRhdGEoIGJ1ZmZlclNpemUgKSA6IG51bGxcbiAgICBsZXQgcmVhZFBoYXNlID0gZy5hY2N1bSggcGl0Y2hNZW1vcnkub3V0LCAwLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSkgXG4gICAgbGV0IHN0dXR0ZXIgPSBnLndyYXAoIGcuc3ViKCBnLm1vZCggcmVhZFBoYXNlLCBidWZmZXJTaXplICksIDIyMDUwICksIDAsIGJ1ZmZlclNpemUgKVxuXG4gICAgbGV0IG5vcm1hbFNhbXBsZSA9IGcucGVlayggYnVmZmVyTCwgZy5hY2N1bSggMSwgMCwgeyBtYXg6ODgyMDAgfSksIHsgbW9kZTonc2ltcGxlJyB9KVxuXG4gICAgbGV0IHN0dXR0ZXJTYW1wbGVQaGFzZSA9IGcuc3dpdGNoKCBpc1NodWZmbGluZywgc3R1dHRlciwgZy5tb2QoIHJlYWRQaGFzZSwgYnVmZmVyU2l6ZSApIClcbiAgICBsZXQgc3R1dHRlclNhbXBsZSA9IGcubWVtbyggZy5wZWVrKCBcbiAgICAgIGJ1ZmZlckwsIFxuICAgICAgc3R1dHRlclNhbXBsZVBoYXNlLFxuICAgICAgeyBtb2RlOidzYW1wbGVzJyB9XG4gICAgKSApXG4gICAgXG4gICAgbGV0IHN0dXR0ZXJTaG91bGRGYWRlSW4gPSBnLmFuZCggc2h1ZmZsZUNoYW5nZWQsIGlzU2h1ZmZsaW5nIClcbiAgICBsZXQgc3R1dHRlclBoYXNlID0gZy5hY2N1bSggMSwgc2h1ZmZsZUNoYW5nZWQsIHsgc2hvdWxkV3JhcDogZmFsc2UgfSlcblxuICAgIGxldCBmYWRlSW5BbW91bnQgPSBnLm1lbW8oIGcuZGl2KCBzdHV0dGVyUGhhc2UsIGZhZGVMZW5ndGggKSApXG4gICAgbGV0IGZhZGVPdXRBbW91bnQgPSBnLmRpdiggZy5zdWIoIHJhdGVPZlNodWZmbGluZywgc3R1dHRlclBoYXNlICksIGcuc3ViKCByYXRlT2ZTaHVmZmxpbmcsIGZhZGVMZW5ndGggKSApXG4gICAgXG4gICAgbGV0IGZhZGVkU3R1dHRlciA9IGcuaWZlbHNlKFxuICAgICAgZy5sdCggc3R1dHRlclBoYXNlLCBmYWRlTGVuZ3RoICksXG4gICAgICBnLm1lbW8oIGcubXVsKCBnLnN3aXRjaCggZy5sdCggZmFkZUluQW1vdW50LCAxICksIGZhZGVJbkFtb3VudCwgMSApLCBzdHV0dGVyU2FtcGxlICkgKSxcbiAgICAgIGcuZ3QoIHN0dXR0ZXJQaGFzZSwgZy5zdWIoIHJhdGVPZlNodWZmbGluZywgZmFkZUxlbmd0aCApICksXG4gICAgICBnLm1lbW8oIGcubXVsKCBnLmd0cCggZmFkZU91dEFtb3VudCwgMCApLCBzdHV0dGVyU2FtcGxlICkgKSxcbiAgICAgIHN0dXR0ZXJTYW1wbGVcbiAgICApXG4gICAgXG4gICAgbGV0IG91dHB1dEwgPSBnLm1peCggbm9ybWFsU2FtcGxlLCBmYWRlZFN0dXR0ZXIsIGlzU2h1ZmZsaW5nICkgXG5cbiAgICBsZXQgcG9rZUwgPSBnLnBva2UoIGJ1ZmZlckwsIGxlZnRJbnB1dCwgZy5tb2QoIGcuYWRkKCBwaGFzZSwgNDQxMDAgKSwgODgyMDAgKSApXG5cbiAgICBsZXQgcGFubmVyID0gZy5wYW4oIG91dHB1dEwsIG91dHB1dEwsIGcuaW4oICdwYW4nICkgKVxuICAgIFxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIGJ1ZmZlclNodWZmbGVyLFxuICAgICAgW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdLFxuICAgICAgJ3NodWZmbGVyJywgXG4gICAgICBwcm9wcyBcbiAgICApIFxuXG4gICAgLy9pZiggcHJvcHMuZmlsZW5hbWUgKSB7XG4gICAgLy8gIGJ1ZmZlclNodWZmbGVyLmRhdGEgPSBnLmRhdGEoIHByb3BzLmZpbGVuYW1lIClcblxuICAgIC8vICBidWZmZXJTaHVmZmxlci5kYXRhLm9ubG9hZCA9ICgpID0+IHtcbiAgICAvLyAgICBidWZmZXJTaHVmZmxlci5fX3BoYXNlX18gPSBnLmNvdW50ZXIoIHJhdGUsIHN0YXJ0LCBlbmQsIGJ1ZmZlclNodWZmbGVyLl9fYmFuZ19fLCBzaG91bGRMb29wLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSlcblxuICAgIC8vICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAvLyAgICAgIGJ1ZmZlclNodWZmbGVyLFxuICAgIC8vICAgICAgZy5pZmVsc2UoIFxuICAgIC8vICAgICAgICBnLmFuZCggZy5ndGUoIGJ1ZmZlclNodWZmbGVyLl9fcGhhc2VfXywgc3RhcnQgKSwgZy5sdCggYnVmZmVyU2h1ZmZsZXIuX19waGFzZV9fLCBlbmQgKSApLFxuICAgIC8vICAgICAgICBnLnBlZWsoIFxuICAgIC8vICAgICAgICAgIGJ1ZmZlclNodWZmbGVyLmRhdGEsIFxuICAgIC8vICAgICAgICAgIGJ1ZmZlclNodWZmbGVyLl9fcGhhc2VfXyxcbiAgICAvLyAgICAgICAgICB7IG1vZGU6J3NhbXBsZXMnIH1cbiAgICAvLyAgICAgICAgKSxcbiAgICAvLyAgICAgICAgMFxuICAgIC8vICAgICAgKSxcbiAgICAvLyAgICAgICdzYW1wbGVyJywgXG4gICAgLy8gICAgICBwcm9wcyBcbiAgICAvLyAgICApIFxuXG4gICAgLy8gICAgaWYoIGJ1ZmZlclNodWZmbGVyLmVuZCA9PT0gLTk5OTk5OTk5OSApIGJ1ZmZlclNodWZmbGVyLmVuZCA9IGJ1ZmZlclNodWZmbGVyLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDFcbiAgICAgICAgXG4gICAgLy8gICAgR2liYmVyaXNoLmRpcnR5KCBidWZmZXJTaHVmZmxlciApXG4gICAgLy8gIH1cbiAgICAvL31cblxuICAgIHJldHVybiBidWZmZXJTaHVmZmxlclxuICB9XG4gIFxuICBTaHVmZmxlci5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIHJhdGU6MjIwNTAsXG4gICAgY2hhbmNlOi4yNSxcbiAgICByZXZlcnNlQ2hhbmNlOi41LFxuICAgIHJlcGl0Y2hDaGFuY2U6LjUsXG4gICAgcmVwaXRjaE1pbjouNSxcbiAgICByZXBpdGNoTWF4OjIsXG4gICAgcGFuOi41LFxuICAgIG1peDouNVxuICB9XG5cbiAgcmV0dXJuIFNodWZmbGVyIFxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgRGVsYXkgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbiggeyBkZWxheUxlbmd0aDogNDQxMDAgfSwgRGVsYXkuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgIGRlbGF5ID0gT2JqZWN0LmNyZWF0ZSggZWZmZWN0IClcblxuICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuICBcbiAgbGV0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgZGVsYXlUaW1lID0gZy5pbiggJ2RlbGF5VGltZScgKSxcbiAgICAgIGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbIDAgXSA6IGlucHV0LFxuICAgICAgcmlnaHRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbIDEgXSA6IG51bGxcbiAgICBcbiAgbGV0IGZlZWRiYWNrID0gZy5pbiggJ2ZlZWRiYWNrJyApXG5cbiAgLy8gbGVmdCBjaGFubmVsXG4gIGxldCBmZWVkYmFja0hpc3RvcnlMID0gZy5oaXN0b3J5KClcbiAgbGV0IGVjaG9MID0gZy5kZWxheSggZy5hZGQoIGxlZnRJbnB1dCwgZy5tdWwoIGZlZWRiYWNrSGlzdG9yeUwub3V0LCBmZWVkYmFjayApICksIGRlbGF5VGltZSwgeyBzaXplOnByb3BzLmRlbGF5TGVuZ3RoIH0pXG4gIGZlZWRiYWNrSGlzdG9yeUwuaW4oIGVjaG9MIClcblxuICBpZiggaXNTdGVyZW8gKSB7XG4gICAgLy8gcmlnaHQgY2hhbm5lbFxuICAgIGxldCBmZWVkYmFja0hpc3RvcnlSID0gZy5oaXN0b3J5KClcbiAgICBsZXQgZWNob1IgPSBnLmRlbGF5KCBnLmFkZCggcmlnaHRJbnB1dCwgZy5tdWwoIGZlZWRiYWNrSGlzdG9yeVIub3V0LCBmZWVkYmFjayApICksIGRlbGF5VGltZSwgeyBzaXplOnByb3BzLmRlbGF5TGVuZ3RoIH0pXG4gICAgZmVlZGJhY2tIaXN0b3J5Ui5pbiggZWNob1IgKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgZGVsYXksXG4gICAgICBbIGVjaG9MLCBlY2hvUiBdLCBcbiAgICAgICdkZWxheScsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggZGVsYXksIGVjaG9MLCAnZGVsYXknLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiBkZWxheVxufVxuXG5EZWxheS5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgZmVlZGJhY2s6LjkyNSxcbiAgZGVsYXlUaW1lOiAxMTAyNVxufVxuXG5yZXR1cm4gRGVsYXlcblxufVxuIiwibGV0IHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5sZXQgZWZmZWN0ID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbk9iamVjdC5hc3NpZ24oIGVmZmVjdCwge1xuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVmZmVjdFxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IGVmZmVjdHMgPSB7XG4gICAgRnJlZXZlcmIgICAgOiByZXF1aXJlKCAnLi9mcmVldmVyYi5qcycgICkoIEdpYmJlcmlzaCApLFxuICAgIEZsYW5nZXIgICAgIDogcmVxdWlyZSggJy4vZmxhbmdlci5qcycgICApKCBHaWJiZXJpc2ggKSxcbiAgICBWaWJyYXRvICAgICA6IHJlcXVpcmUoICcuL3ZpYnJhdG8uanMnICAgKSggR2liYmVyaXNoICksXG4gICAgRGVsYXkgICAgICAgOiByZXF1aXJlKCAnLi9kZWxheS5qcycgICAgICkoIEdpYmJlcmlzaCApLFxuICAgIEJpdENydXNoZXIgIDogcmVxdWlyZSggJy4vYml0Q3J1c2hlci5qcycpKCBHaWJiZXJpc2ggKSxcbiAgICBSaW5nTW9kICAgICA6IHJlcXVpcmUoICcuL3JpbmdNb2QuanMnICAgKSggR2liYmVyaXNoICksXG4gICAgVHJlbW9sbyAgICAgOiByZXF1aXJlKCAnLi90cmVtb2xvLmpzJyAgICkoIEdpYmJlcmlzaCApLFxuICAgIFNodWZmbGVyICAgIDogcmVxdWlyZSggJy4vYnVmZmVyU2h1ZmZsZXIuanMnICApKCBHaWJiZXJpc2ggKVxuICB9XG5cbiAgZWZmZWN0cy5leHBvcnQgPSB0YXJnZXQgPT4ge1xuICAgIGZvciggbGV0IGtleSBpbiBlZmZlY3RzICkge1xuICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgIHRhcmdldFsga2V5IF0gPSBlZmZlY3RzWyBrZXkgXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5yZXR1cm4gZWZmZWN0c1xuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBGbGFuZ2VyID0gaW5wdXRQcm9wcyA9PiB7XG4gIGxldCBwcm9wcyAgID0gT2JqZWN0LmFzc2lnbigge30sIEZsYW5nZXIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgIGZsYW5nZXIgPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICBkZWxheUxlbmd0aCA9IDQ0MTAwLFxuICAgICAgZmVlZGJhY2tDb2VmZiA9IGcuaW4oICdmZWVkYmFjaycgKSxcbiAgICAgIG1vZEFtb3VudCA9IGcuaW4oICdvZmZzZXQnICksXG4gICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgZGVsYXlCdWZmZXJMID0gZy5kYXRhKCBkZWxheUxlbmd0aCApLFxuICAgICAgZGVsYXlCdWZmZXJSXG5cbiAgbGV0IHdyaXRlSWR4ID0gZy5hY2N1bSggMSwwLCB7IG1pbjowLCBtYXg6ZGVsYXlMZW5ndGgsIGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBsZXQgb2Zmc2V0ID0gZy5tdWwoIG1vZEFtb3VudCwgNTAwIClcbiAgXG4gIGxldCByZWFkSWR4ID0gZy53cmFwKCBcbiAgICBnLmFkZCggXG4gICAgICBnLnN1Yiggd3JpdGVJZHgsIG9mZnNldCApLCBcbiAgICAgIGcubXVsKCBnLmN5Y2xlKCBmcmVxdWVuY3kgKSwgZy5zdWIoIG9mZnNldCwgMSApICkgXG4gICAgKSwgXG5cdCAgMCwgXG4gICAgZGVsYXlMZW5ndGhcbiAgKVxuXG4gIGxldCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXRcblxuICBsZXQgZGVsYXllZE91dEwgPSBnLnBlZWsoIGRlbGF5QnVmZmVyTCwgcmVhZElkeCwgeyBpbnRlcnA6J2xpbmVhcicsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBnLnBva2UoIGRlbGF5QnVmZmVyTCwgZy5hZGQoIGxlZnRJbnB1dCwgZy5tdWwoIGRlbGF5ZWRPdXRMLCBmZWVkYmFja0NvZWZmICkgKSwgd3JpdGVJZHggKVxuXG4gIGxldCBsZWZ0ID0gZy5hZGQoIGxlZnRJbnB1dCwgZGVsYXllZE91dEwgKSxcbiAgICAgIHJpZ2h0XG5cbiAgaWYoIGlzU3RlcmVvID09PSB0cnVlICkge1xuICAgIHJpZ2h0SW5wdXQgPSBpbnB1dFsxXVxuICAgIGRlbGF5QnVmZmVyUiA9IGcuZGF0YSggZGVsYXlMZW5ndGggKVxuICAgIFxuICAgIGxldCBkZWxheWVkT3V0UiA9IGcucGVlayggZGVsYXlCdWZmZXJSLCByZWFkSWR4LCB7IGludGVycDonbGluZWFyJywgbW9kZTonc2FtcGxlcycgfSlcblxuICAgIGcucG9rZSggZGVsYXlCdWZmZXJSLCBnLmFkZCggcmlnaHRJbnB1dCwgZy5tdWwoIGRlbGF5ZWRPdXRSLCBmZWVkYmFja0NvZWZmICkgKSwgd3JpdGVJZHggKVxuICAgIHJpZ2h0ID0gZy5hZGQoIHJpZ2h0SW5wdXQsIGRlbGF5ZWRPdXRSIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIGZsYW5nZXIsXG4gICAgICBbIGxlZnQsIHJpZ2h0IF0sIFxuICAgICAgJ2ZsYW5nZXInLCBcbiAgICAgIHByb3BzIFxuICAgIClcblxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggZmxhbmdlciwgbGVmdCwgJ2ZsYW5nZXInLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiBmbGFuZ2VyXG59XG5cbkZsYW5nZXIuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIGZlZWRiYWNrOi4wMSxcbiAgb2Zmc2V0Oi4yNSxcbiAgZnJlcXVlbmN5Oi41XG59XG5cbnJldHVybiBGbGFuZ2VyXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgXG5jb25zdCBhbGxQYXNzID0gR2liYmVyaXNoLmZpbHRlcnMuZ2VuaXNoLkFsbFBhc3NcbmNvbnN0IGNvbWJGaWx0ZXIgPSBHaWJiZXJpc2guZmlsdGVycy5nZW5pc2guQ29tYlxuXG5jb25zdCB0dW5pbmcgPSB7XG4gIGNvbWJDb3VudDpcdCAgXHQ4LFxuICBjb21iVHVuaW5nOiBcdFx0WyAxMTE2LCAxMTg4LCAxMjc3LCAxMzU2LCAxNDIyLCAxNDkxLCAxNTU3LCAxNjE3IF0sICAgICAgICAgICAgICAgICAgICBcbiAgYWxsUGFzc0NvdW50OiBcdDQsXG4gIGFsbFBhc3NUdW5pbmc6XHRbIDIyNSwgNTU2LCA0NDEsIDM0MSBdLFxuICBhbGxQYXNzRmVlZGJhY2s6MC41LFxuICBmaXhlZEdhaW46IFx0XHQgIDAuMDE1LFxuICBzY2FsZURhbXBpbmc6IFx0MC40LFxuICBzY2FsZVJvb206IFx0XHQgIDAuMjgsXG4gIG9mZnNldFJvb206IFx0ICAwLjcsXG4gIHN0ZXJlb1NwcmVhZDogICAyM1xufVxuXG5jb25zdCBGcmVldmVyYiA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgRnJlZXZlcmIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgIHJldmVyYiA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApIFxuICAgXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgY29tYnNMID0gW10sIGNvbWJzUiA9IFtdXG5cbiAgbGV0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgd2V0MSA9IGcuaW4oICd3ZXQxJyksIHdldDIgPSBnLmluKCAnd2V0MicgKSwgIGRyeSA9IGcuaW4oICdkcnknICksIFxuICAgICAgcm9vbVNpemUgPSBnLmluKCAncm9vbVNpemUnICksIGRhbXBpbmcgPSBnLmluKCAnZGFtcGluZycgKVxuICBcbiAgbGV0IHN1bW1lZElucHV0ID0gaXNTdGVyZW8gPT09IHRydWUgPyBnLmFkZCggaW5wdXRbMF0sIGlucHV0WzFdICkgOiBpbnB1dCxcbiAgICAgIGF0dGVudWF0ZWRJbnB1dCA9IGcubWVtbyggZy5tdWwoIHN1bW1lZElucHV0LCB0dW5pbmcuZml4ZWRHYWluICkgKVxuICBcbiAgLy8gY3JlYXRlIGNvbWIgZmlsdGVycyBpbiBwYXJhbGxlbC4uLlxuICBmb3IoIGxldCBpID0gMDsgaSA8IDg7IGkrKyApIHsgXG4gICAgY29tYnNMLnB1c2goIFxuICAgICAgY29tYkZpbHRlciggYXR0ZW51YXRlZElucHV0LCB0dW5pbmcuY29tYlR1bmluZ1tpXSwgZy5tdWwoZGFtcGluZywuNCksIGcubXVsKCB0dW5pbmcuc2NhbGVSb29tICsgdHVuaW5nLm9mZnNldFJvb20sIHJvb21TaXplICkgKSBcbiAgICApXG4gICAgY29tYnNSLnB1c2goIFxuICAgICAgY29tYkZpbHRlciggYXR0ZW51YXRlZElucHV0LCB0dW5pbmcuY29tYlR1bmluZ1tpXSArIHR1bmluZy5zdGVyZW9TcHJlYWQsIGcubXVsKGRhbXBpbmcsLjQpLCBnLm11bCggdHVuaW5nLnNjYWxlUm9vbSArIHR1bmluZy5vZmZzZXRSb29tLCByb29tU2l6ZSApICkgXG4gICAgKVxuICB9XG4gIFxuICAvLyAuLi4gYW5kIHN1bSB0aGVtIHdpdGggYXR0ZW51YXRlZCBpbnB1dFxuICBsZXQgb3V0TCA9IGcuYWRkKCBhdHRlbnVhdGVkSW5wdXQsIC4uLmNvbWJzTCApXG4gIGxldCBvdXRSID0gZy5hZGQoIGF0dGVudWF0ZWRJbnB1dCwgLi4uY29tYnNSIClcbiAgXG4gIC8vIHJ1biB0aHJvdWdoIGFsbHBhc3MgZmlsdGVycyBpbiBzZXJpZXNcbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCA0OyBpKysgKSB7IFxuICAgIG91dEwgPSBhbGxQYXNzKCBvdXRMLCB0dW5pbmcuYWxsUGFzc1R1bmluZ1sgaSBdICsgdHVuaW5nLnN0ZXJlb1NwcmVhZCApXG4gICAgb3V0UiA9IGFsbFBhc3MoIG91dFIsIHR1bmluZy5hbGxQYXNzVHVuaW5nWyBpIF0gKyB0dW5pbmcuc3RlcmVvU3ByZWFkIClcbiAgfVxuICBcbiAgbGV0IG91dHB1dEwgPSBnLmFkZCggZy5tdWwoIG91dEwsIHdldDEgKSwgZy5tdWwoIG91dFIsIHdldDIgKSwgZy5tdWwoIGlzU3RlcmVvID09PSB0cnVlID8gaW5wdXRbMF0gOiBpbnB1dCwgZHJ5ICkgKSxcbiAgICAgIG91dHB1dFIgPSBnLmFkZCggZy5tdWwoIG91dFIsIHdldDEgKSwgZy5tdWwoIG91dEwsIHdldDIgKSwgZy5tdWwoIGlzU3RlcmVvID09PSB0cnVlID8gaW5wdXRbMV0gOiBpbnB1dCwgZHJ5ICkgKVxuXG4gIEdpYmJlcmlzaC5mYWN0b3J5KCByZXZlcmIsIFsgb3V0cHV0TCwgb3V0cHV0UiBdLCAnZnJlZXZlcmInLCBwcm9wcyApXG5cbiAgcmV0dXJuIHJldmVyYlxufVxuXG5cbkZyZWV2ZXJiLmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICB3ZXQxOiAxLFxuICB3ZXQyOiAwLFxuICBkcnk6IC41LFxuICByb29tU2l6ZTogLjg0LFxuICBkYW1waW5nOiAgLjVcbn1cblxucmV0dXJuIEZyZWV2ZXJiIFxuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IFJpbmdNb2QgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzICAgPSBPYmplY3QuYXNzaWduKCB7fSwgUmluZ01vZC5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgcmluZ01vZCA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICBnYWluID0gZy5pbiggJ2dhaW4nICksXG4gICAgICBtaXggPSBnLmluKCAnbWl4JyApXG4gIFxuICBsZXQgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0LFxuICAgICAgc2luZSA9IGcubXVsKCBnLmN5Y2xlKCBmcmVxdWVuY3kgKSwgZ2FpbiApXG4gXG4gIGxldCBsZWZ0ID0gZy5hZGQoIGcubXVsKCBsZWZ0SW5wdXQsIGcuc3ViKCAxLCBtaXggKSksIGcubXVsKCBnLm11bCggbGVmdElucHV0LCBzaW5lICksIG1peCApICksIFxuICAgICAgcmlnaHRcblxuICBpZiggaXNTdGVyZW8gPT09IHRydWUgKSB7XG4gICAgbGV0IHJpZ2h0SW5wdXQgPSBpbnB1dFsxXVxuICAgIHJpZ2h0ID0gZy5hZGQoIGcubXVsKCByaWdodElucHV0LCBnLnN1YiggMSwgbWl4ICkpLCBnLm11bCggZy5tdWwoIHJpZ2h0SW5wdXQsIHNpbmUgKSwgbWl4ICkgKSBcbiAgICBcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICByaW5nTW9kLFxuICAgICAgWyBsZWZ0LCByaWdodCBdLCBcbiAgICAgICdyaW5nTW9kJywgXG4gICAgICBwcm9wcyBcbiAgICApXG4gIH1lbHNle1xuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCByaW5nTW9kLCBsZWZ0LCAncmluZ01vZCcsIHByb3BzIClcbiAgfVxuICBcbiAgcmV0dXJuIHJpbmdNb2Rcbn1cblxuUmluZ01vZC5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgZnJlcXVlbmN5OjIyMCxcbiAgZ2FpbjogMSwgXG4gIG1peDoxXG59XG5cbnJldHVybiBSaW5nTW9kXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmNvbnN0IFRyZW1vbG8gPSBpbnB1dFByb3BzID0+IHtcbiAgY29uc3QgcHJvcHMgICA9IE9iamVjdC5hc3NpZ24oIHt9LCBUcmVtb2xvLmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICAgIHRyZW1vbG8gPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGNvbnN0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICBhbW91bnQgPSBnLmluKCAnYW1vdW50JyApXG4gIFxuICBjb25zdCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXRcblxuICBsZXQgb3NjXG4gIGlmKCBwcm9wcy5zaGFwZSA9PT0gJ3NxdWFyZScgKSB7XG4gICAgb3NjID0gZy5ndCggZy5waGFzb3IoIGZyZXF1ZW5jeSApLCAwIClcbiAgfWVsc2UgaWYoIHByb3BzLnNoYXBlID09PSAnc2F3JyApIHtcbiAgICBvc2MgPSBnLmd0cCggZy5waGFzb3IoIGZyZXF1ZW5jeSApLCAwIClcbiAgfWVsc2V7XG4gICAgb3NjID0gZy5jeWNsZSggZnJlcXVlbmN5IClcbiAgfVxuXG4gIGNvbnN0IG1vZCA9IGcubXVsKCBvc2MsIGFtb3VudCApXG4gXG4gIGxldCBsZWZ0ID0gZy5zdWIoIGxlZnRJbnB1dCwgZy5tdWwoIGxlZnRJbnB1dCwgbW9kICkgKSwgXG4gICAgICByaWdodFxuXG4gIGlmKCBpc1N0ZXJlbyA9PT0gdHJ1ZSApIHtcbiAgICBsZXQgcmlnaHRJbnB1dCA9IGlucHV0WzFdXG4gICAgcmlnaHQgPSBnLm11bCggcmlnaHRJbnB1dCwgbW9kIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIHRyZW1vbG8sXG4gICAgICBbIGxlZnQsIHJpZ2h0IF0sIFxuICAgICAgJ3RyZW1vbG8nLCBcbiAgICAgIHByb3BzIFxuICAgIClcbiAgfWVsc2V7XG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHRyZW1vbG8sIGxlZnQsICd0cmVtb2xvJywgcHJvcHMgKVxuICB9XG4gIFxuICByZXR1cm4gdHJlbW9sb1xufVxuXG5UcmVtb2xvLmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBmcmVxdWVuY3k6MixcbiAgYW1vdW50OiAxLCBcbiAgc2hhcGU6J3NpbmUnXG59XG5cbnJldHVybiBUcmVtb2xvXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IFZpYnJhdG8gPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzICAgPSBPYmplY3QuYXNzaWduKCB7fSwgVmlicmF0by5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgdmlicmF0byA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIGRlbGF5TGVuZ3RoID0gNDQxMDAsXG4gICAgICBmZWVkYmFja0NvZWZmID0gLjAxLC8vZy5pbiggJ2ZlZWRiYWNrJyApLFxuICAgICAgbW9kQW1vdW50ID0gZy5pbiggJ2Ftb3VudCcgKSxcbiAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICBkZWxheUJ1ZmZlckwgPSBnLmRhdGEoIGRlbGF5TGVuZ3RoICksXG4gICAgICBkZWxheUJ1ZmZlclJcblxuICBsZXQgd3JpdGVJZHggPSBnLmFjY3VtKCAxLDAsIHsgbWluOjAsIG1heDpkZWxheUxlbmd0aCwgaW50ZXJwOidub25lJywgbW9kZTonc2FtcGxlcycgfSlcbiAgXG4gIGxldCBvZmZzZXQgPSBnLm11bCggbW9kQW1vdW50LCA1MDAgKVxuICBcbiAgbGV0IHJlYWRJZHggPSBnLndyYXAoIFxuICAgIGcuYWRkKCBcbiAgICAgIGcuc3ViKCB3cml0ZUlkeCwgb2Zmc2V0ICksIFxuICAgICAgZy5tdWwoIGcuY3ljbGUoIGZyZXF1ZW5jeSApLCBnLnN1Yiggb2Zmc2V0LCAxICkgKSBcbiAgICApLCBcblx0ICAwLCBcbiAgICBkZWxheUxlbmd0aFxuICApXG5cbiAgbGV0IGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dFxuXG4gIGxldCBkZWxheWVkT3V0TCA9IGcucGVlayggZGVsYXlCdWZmZXJMLCByZWFkSWR4LCB7IGludGVycDonbGluZWFyJywgbW9kZTonc2FtcGxlcycgfSlcbiAgXG4gIGcucG9rZSggZGVsYXlCdWZmZXJMLCBnLmFkZCggbGVmdElucHV0LCBnLm11bCggZGVsYXllZE91dEwsIGZlZWRiYWNrQ29lZmYgKSApLCB3cml0ZUlkeCApXG5cbiAgbGV0IGxlZnQgPSBkZWxheWVkT3V0TCxcbiAgICAgIHJpZ2h0XG5cbiAgaWYoIGlzU3RlcmVvID09PSB0cnVlICkge1xuICAgIHJpZ2h0SW5wdXQgPSBpbnB1dFsxXVxuICAgIGRlbGF5QnVmZmVyUiA9IGcuZGF0YSggZGVsYXlMZW5ndGggKVxuICAgIFxuICAgIGxldCBkZWxheWVkT3V0UiA9IGcucGVlayggZGVsYXlCdWZmZXJSLCByZWFkSWR4LCB7IGludGVycDonbGluZWFyJywgbW9kZTonc2FtcGxlcycgfSlcblxuICAgIGcucG9rZSggZGVsYXlCdWZmZXJSLCBnLmFkZCggcmlnaHRJbnB1dCwgbXVsKCBkZWxheWVkT3V0UiwgZmVlZGJhY2tDb2VmZiApICksIHdyaXRlSWR4IClcbiAgICByaWdodCA9IGRlbGF5ZWRPdXRSXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICB2aWJyYXRvLFxuICAgICAgWyBsZWZ0LCByaWdodCBdLCBcbiAgICAgICd2aWJyYXRvJywgXG4gICAgICBwcm9wcyBcbiAgICApXG4gIH1lbHNle1xuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCB2aWJyYXRvLCBsZWZ0LCAndmlicmF0bycsIHByb3BzIClcbiAgfVxuICBcbiAgcmV0dXJuIHZpYnJhdG9cbn1cblxuVmlicmF0by5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgLy9mZWVkYmFjazouMDEsXG4gIGFtb3VudDouNSxcbiAgZnJlcXVlbmN5OjRcbn1cblxucmV0dXJuIFZpYnJhdG9cblxufVxuIiwibGV0IE1lbW9yeUhlbHBlciA9IHJlcXVpcmUoICdtZW1vcnktaGVscGVyJyApLFxuICAgIGdlbmlzaCAgICAgICA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcbiAgICBcbmxldCBHaWJiZXJpc2ggPSB7XG4gIGJsb2NrQ2FsbGJhY2tzOiBbXSwgLy8gY2FsbGVkIGV2ZXJ5IGJsb2NrXG4gIGRpcnR5VWdlbnM6IFtdLFxuICBjYWxsYmFja1VnZW5zOiBbXSxcbiAgY2FsbGJhY2tOYW1lczogW10sXG4gIGFuYWx5emVyczogW10sXG4gIGdyYXBoSXNEaXJ0eTogZmFsc2UsXG4gIHVnZW5zOiB7fSxcbiAgZGVidWc6IGZhbHNlLFxuXG4gIG91dHB1dDogbnVsbCxcblxuICBtZW1vcnkgOiBudWxsLCAvLyAyMCBtaW51dGVzIGJ5IGRlZmF1bHQ/XG4gIGZhY3Rvcnk6IG51bGwsIFxuICBnZW5pc2gsXG4gIHNjaGVkdWxlcjogcmVxdWlyZSggJy4vc2NoZWR1bGluZy9zY2hlZHVsZXIuanMnICksXG5cbiAgbWVtb2VkOiB7fSxcblxuICBwcm90b3R5cGVzOiB7XG4gICAgdWdlbjogcmVxdWlyZSgnLi91Z2VuLmpzJyksXG4gICAgaW5zdHJ1bWVudDogcmVxdWlyZSggJy4vaW5zdHJ1bWVudHMvaW5zdHJ1bWVudC5qcycgKSxcbiAgICBlZmZlY3Q6IHJlcXVpcmUoICcuL2Z4L2VmZmVjdC5qcycgKSxcbiAgfSxcblxuICBtaXhpbnM6IHtcbiAgICBwb2x5aW5zdHJ1bWVudDogcmVxdWlyZSggJy4vaW5zdHJ1bWVudHMvcG9seU1peGluLmpzJyApXG4gIH0sXG5cbiAgaW5pdCggbWVtQW1vdW50ICkge1xuICAgIGxldCBudW1CeXRlcyA9IG1lbUFtb3VudCA9PT0gdW5kZWZpbmVkID8gMjAgKiA2MCAqIDQ0MTAwIDogbWVtQW1vdW50XG5cbiAgICB0aGlzLm1lbW9yeSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIG51bUJ5dGVzIClcblxuICAgIHRoaXMubG9hZCgpXG4gICAgXG4gICAgdGhpcy5vdXRwdXQgPSB0aGlzLkJ1czIoKVxuXG4gICAgdGhpcy51dGlsaXRpZXMuY3JlYXRlQ29udGV4dCgpXG4gICAgdGhpcy51dGlsaXRpZXMuY3JlYXRlU2NyaXB0UHJvY2Vzc29yKClcblxuICAgIHRoaXMuYW5hbHl6ZXJzLmRpcnR5ID0gZmFsc2VcblxuICAgIC8vIFhYWCBGT1IgREVWRUxPUE1FTlQgQU5EIFRFU1RJTkcgT05MWS4uLiBSRU1PVkUgRk9SIFBST0RVQ1RJT05cbiAgICB0aGlzLmV4cG9ydCggd2luZG93IClcbiAgfSxcblxuICBsb2FkKCkge1xuICAgIHRoaXMuZmFjdG9yeSA9IHJlcXVpcmUoICcuL3VnZW5UZW1wbGF0ZS5qcycgKSggdGhpcyApXG5cbiAgICB0aGlzLlBvbHlUZW1wbGF0ZSA9IHJlcXVpcmUoICcuL2luc3RydW1lbnRzL3BvbHl0ZW1wbGF0ZS5qcycgKSggdGhpcyApXG4gICAgdGhpcy5vc2NpbGxhdG9ycyAgPSByZXF1aXJlKCAnLi9vc2NpbGxhdG9ycy9vc2NpbGxhdG9ycy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5maWx0ZXJzICAgICAgPSByZXF1aXJlKCAnLi9maWx0ZXJzL2ZpbHRlcnMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuYmlub3BzICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9iaW5vcHMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMubW9ub3BzICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9tb25vcHMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuQnVzICAgICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9idXMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuQnVzMiAgICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9idXMyLmpzJyApKCB0aGlzICk7XG4gICAgdGhpcy5pbnN0cnVtZW50cyAgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50cy9pbnN0cnVtZW50cy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5meCAgICAgICAgICAgPSByZXF1aXJlKCAnLi9meC9lZmZlY3RzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLlNlcXVlbmNlciAgICA9IHJlcXVpcmUoICcuL3NjaGVkdWxpbmcvc2VxdWVuY2VyLmpzJyApKCB0aGlzICk7XG4gICAgdGhpcy5TZXF1ZW5jZXIyICAgPSByZXF1aXJlKCAnLi9zY2hlZHVsaW5nL3NlcTIuanMnICkoIHRoaXMgKTtcbiAgICB0aGlzLmVudmVsb3BlcyAgICA9IHJlcXVpcmUoICcuL2VudmVsb3Blcy9lbnZlbG9wZXMuanMnICkoIHRoaXMgKTtcbiAgICB0aGlzLnNzZCAgICAgICAgICA9IHJlcXVpcmUoICcuL2FuYWx5c2lzL3NpbmdsZXNhbXBsZWRlbGF5LmpzJyApKCB0aGlzICk7XG4gIH0sXG5cbiAgZXhwb3J0KCB0YXJnZXQsIHNob3VsZEV4cG9ydEdlbmlzaD1mYWxzZSApIHtcbiAgICBpZiggdGFyZ2V0ID09PSB1bmRlZmluZWQgKSB0aHJvdyBFcnJvcignWW91IG11c3QgZGVmaW5lIGEgdGFyZ2V0IG9iamVjdCBmb3IgR2liYmVyaXNoIHRvIGV4cG9ydCB2YXJpYWJsZXMgdG8uJylcblxuICAgIGlmKCBzaG91bGRFeHBvcnRHZW5pc2ggKSB0aGlzLmdlbmlzaC5leHBvcnQoIHRhcmdldCApXG5cbiAgICB0aGlzLmluc3RydW1lbnRzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLmZ4LmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLmZpbHRlcnMuZXhwb3J0KCB0YXJnZXQgKVxuICAgIHRoaXMub3NjaWxsYXRvcnMuZXhwb3J0KCB0YXJnZXQgKVxuICAgIHRoaXMuYmlub3BzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLm1vbm9wcy5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5lbnZlbG9wZXMuZXhwb3J0KCB0YXJnZXQgKVxuICAgIHRhcmdldC5TZXF1ZW5jZXIgPSB0aGlzLlNlcXVlbmNlclxuICAgIHRhcmdldC5TZXF1ZW5jZXIyID0gdGhpcy5TZXF1ZW5jZXIyXG4gICAgdGFyZ2V0LkJ1cyA9IHRoaXMuQnVzXG4gICAgdGFyZ2V0LkJ1czIgPSB0aGlzLkJ1czJcbiAgICB0YXJnZXQuU2NoZWR1bGVyID0gdGhpcy5zY2hlZHVsZXJcbiAgICB0YXJnZXQuU1NEID0gdGhpcy5zc2RcbiAgfSxcblxuICBwcmludCgpIHtcbiAgICBjb25zb2xlLmxvZyggdGhpcy5jYWxsYmFjay50b1N0cmluZygpIClcbiAgfSxcblxuICBkaXJ0eSggdWdlbiApIHtcbiAgICBpZiggdWdlbiA9PT0gdGhpcy5hbmFseXplcnMgKSB7XG4gICAgICB0aGlzLmdyYXBoSXNEaXJ0eSA9IHRydWVcbiAgICAgIHRoaXMuYW5hbHl6ZXJzLmRpcnR5ID0gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRpcnR5VWdlbnMucHVzaCggdWdlbiApXG4gICAgICB0aGlzLmdyYXBoSXNEaXJ0eSA9IHRydWVcbiAgICAgIGlmKCB0aGlzLm1lbW9lZFsgdWdlbi51Z2VuTmFtZSBdICkge1xuICAgICAgICBkZWxldGUgdGhpcy5tZW1vZWRbIHVnZW4udWdlbk5hbWUgXVxuICAgICAgfVxuICAgIH0gXG4gIH0sXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5vdXRwdXQuaW5wdXRzID0gWzBdXG4gICAgdGhpcy5vdXRwdXQuaW5wdXROYW1lcy5sZW5ndGggPSAwXG4gICAgdGhpcy5hbmFseXplcnMubGVuZ3RoID0gMFxuICAgIHRoaXMuc2NoZWR1bGVyLmNsZWFyKClcbiAgICB0aGlzLmRpcnR5KCB0aGlzLm91dHB1dCApXG4gIH0sXG5cbiAgZ2VuZXJhdGVDYWxsYmFjaygpIHtcbiAgICBsZXQgdWlkID0gMCxcbiAgICAgICAgY2FsbGJhY2tCb2R5LCBsYXN0TGluZSwgYW5hbHlzaXM9JydcblxuICAgIHRoaXMubWVtb2VkID0ge31cblxuICAgIGNhbGxiYWNrQm9keSA9IHRoaXMucHJvY2Vzc0dyYXBoKCB0aGlzLm91dHB1dCApXG4gICAgbGFzdExpbmUgPSBjYWxsYmFja0JvZHlbIGNhbGxiYWNrQm9keS5sZW5ndGggLSAxXVxuXG4gICAgdGhpcy5hbmFseXplcnMuZm9yRWFjaCggdj0+IHtcbiAgICAgIGNvbnN0IGFuYWx5c2lzQmxvY2sgPSBHaWJiZXJpc2gucHJvY2Vzc1VnZW4oIHYgKVxuICAgICAgY29uc3QgYW5hbHlzaXNMaW5lID0gYW5hbHlzaXNCbG9jay5wb3AoKVxuXG4gICAgICBhbmFseXNpc0Jsb2NrLmZvckVhY2goIHY9PiB7XG4gICAgICAgIGNhbGxiYWNrQm9keS5zcGxpY2UoIGNhbGxiYWNrQm9keS5sZW5ndGggLSAxLCAwLCB2IClcbiAgICAgIH0pXG5cbiAgICAgIGNhbGxiYWNrQm9keS5wdXNoKCBhbmFseXNpc0xpbmUgKVxuICAgIH0pXG5cbiAgICB0aGlzLmFuYWx5emVycy5mb3JFYWNoKCB2ID0+IHtcbiAgICAgIGlmKCB0aGlzLmNhbGxiYWNrVWdlbnMuaW5kZXhPZiggdi5jYWxsYmFjayApID09PSAtMSApXG4gICAgICAgIHRoaXMuY2FsbGJhY2tVZ2Vucy5wdXNoKCB2LmNhbGxiYWNrIClcbiAgICB9KVxuICAgIHRoaXMuY2FsbGJhY2tOYW1lcyA9IHRoaXMuY2FsbGJhY2tVZ2Vucy5tYXAoIHYgPT4gdi51Z2VuTmFtZSApXG5cbiAgICBjYWxsYmFja0JvZHkucHVzaCggJ1xcblxcdHJldHVybiAnICsgbGFzdExpbmUuc3BsaXQoICc9JyApWzBdLnNwbGl0KCAnICcgKVsxXSApXG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCAnY2FsbGJhY2s6XFxuJywgY2FsbGJhY2tCb2R5LmpvaW4oJ1xcbicpIClcbiAgICB0aGlzLmNhbGxiYWNrTmFtZXMucHVzaCggJ21lbW9yeScgKVxuICAgIHRoaXMuY2FsbGJhY2tVZ2Vucy5wdXNoKCB0aGlzLm1lbW9yeS5oZWFwIClcbiAgICB0aGlzLmNhbGxiYWNrID0gRnVuY3Rpb24oIC4uLnRoaXMuY2FsbGJhY2tOYW1lcywgY2FsbGJhY2tCb2R5LmpvaW4oICdcXG4nICkgKVxuICAgIHRoaXMuY2FsbGJhY2sub3V0ID0gW11cblxuICAgIGlmKCB0aGlzLm9uY2FsbGJhY2sgKSB0aGlzLm9uY2FsbGJhY2soIHRoaXMuY2FsbGJhY2sgKVxuXG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2sgXG4gIH0sXG5cbiAgcHJvY2Vzc0dyYXBoKCBvdXRwdXQgKSB7XG4gICAgdGhpcy5jYWxsYmFja1VnZW5zLmxlbmd0aCA9IDBcbiAgICB0aGlzLmNhbGxiYWNrTmFtZXMubGVuZ3RoID0gMFxuXG4gICAgdGhpcy5jYWxsYmFja1VnZW5zLnB1c2goIG91dHB1dC5jYWxsYmFjayApXG5cbiAgICBsZXQgYm9keSA9IHRoaXMucHJvY2Vzc1VnZW4oIG91dHB1dCApXG4gICAgXG5cbiAgICB0aGlzLmRpcnR5VWdlbnMubGVuZ3RoID0gMFxuICAgIHRoaXMuZ3JhcGhJc0RpcnR5ID0gZmFsc2VcblxuICAgIHJldHVybiBib2R5XG4gIH0sXG5cbiAgcHJvY2Vzc1VnZW4oIHVnZW4sIGJsb2NrICkge1xuICAgIGlmKCBibG9jayA9PT0gdW5kZWZpbmVkICkgYmxvY2sgPSBbXVxuXG4gICAgbGV0IGRpcnR5SWR4ID0gR2liYmVyaXNoLmRpcnR5VWdlbnMuaW5kZXhPZiggdWdlbiApXG5cbiAgICAvL2NvbnNvbGUubG9nKCAndWdlbk5hbWU6JywgdWdlbi51Z2VuTmFtZSApXG4gICAgbGV0IG1lbW8gPSBHaWJiZXJpc2gubWVtb2VkWyB1Z2VuLnVnZW5OYW1lIF1cblxuICAgIGlmKCBtZW1vICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICByZXR1cm4gbWVtbyBcbiAgICB9IGVsc2UgaWYoIHVnZW4uYmxvY2sgPT09IHVuZGVmaW5lZCB8fCBkaXJ0eUluZGV4ICE9PSAtMSApIHtcbiAgXG4gICAgICBsZXQgbGluZSA9IGBcXHR2YXIgdl8ke3VnZW4uaWR9ID0gYCBcbiAgICAgIFxuICAgICAgaWYoICF1Z2VuLmJpbm9wICkgbGluZSArPSBgJHt1Z2VuLnVnZW5OYW1lfSggYFxuXG4gICAgICAvLyBtdXN0IGdldCBhcnJheSBzbyB3ZSBjYW4ga2VlcCB0cmFjayBvZiBsZW5ndGggZm9yIGNvbW1hIGluc2VydGlvblxuICAgICAgbGV0IGtleXMsZXJyXG4gICAgICBcbiAgICAgIC8vdHJ5IHtcbiAgICAgIGtleXMgPSB1Z2VuLmJpbm9wIHx8IHVnZW4udHlwZSA9PT0gJ2J1cycgfHwgdWdlbi50eXBlID09PSAnYW5hbHlzaXMnID8gT2JqZWN0LmtleXMoIHVnZW4uaW5wdXRzICkgOiBPYmplY3Qua2V5cyggdWdlbi5pbnB1dE5hbWVzIClcblxuICAgICAgLy99Y2F0Y2goIGUgKXtcblxuICAgICAgLy8gIGNvbnNvbGUubG9nKCBlIClcbiAgICAgIC8vICBlcnIgPSB0cnVlXG4gICAgICAvL31cbiAgICAgIFxuICAgICAgLy9pZiggZXJyID09PSB0cnVlICkgcmV0dXJuXG5cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgbGV0IGtleSA9IGtleXNbIGkgXVxuICAgICAgICAvLyBiaW5vcC5pbnB1dHMgaXMgYWN0dWFsIHZhbHVlcywgbm90IGp1c3QgcHJvcGVydHkgbmFtZXNcbiAgICAgICAgbGV0IGlucHV0IFxuICAgICAgICBpZiggdWdlbi5iaW5vcCB8fCB1Z2VuLnR5cGUgPT09J2J1cycgKSB7XG4gICAgICAgICAgaW5wdXQgPSB1Z2VuLmlucHV0c1sga2V5IF1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgLy9pZigga2V5ID09PSAnbWVtb3J5JyApIGNvbnRpbnVlO1xuICBcbiAgICAgICAgICBpbnB1dCA9IHVnZW5bIHVnZW4uaW5wdXROYW1lc1sga2V5IF0gXVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoIGlucHV0ICE9PSB1bmRlZmluZWQgKSB7IFxuICAgICAgICAgIGlmKCB0eXBlb2YgaW5wdXQgPT09ICdudW1iZXInICkge1xuICAgICAgICAgICAgbGluZSArPSBpbnB1dFxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ2tleTonLCBrZXksICdpbnB1dDonLCB1Z2VuLmlucHV0cywgdWdlbi5pbnB1dHNbIGtleSBdICkgXG5cbiAgICAgICAgICAgIEdpYmJlcmlzaC5wcm9jZXNzVWdlbiggaW5wdXQsIGJsb2NrIClcblxuICAgICAgICAgICAgLy9pZiggaW5wdXQuY2FsbGJhY2sgPT09IHVuZGVmaW5lZCApIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlmKCAhaW5wdXQuYmlub3AgKSB7XG4gICAgICAgICAgICAgIC8vIGNoZWNrIGlzIG5lZWRlZCBzbyB0aGF0IGdyYXBocyB3aXRoIHNzZHMgdGhhdCByZWZlciB0byB0aGVtc2VsdmVzXG4gICAgICAgICAgICAgIC8vIGRvbid0IGFkZCB0aGUgc3NkIGluIG1vcmUgdGhhbiBvbmNlXG4gICAgICAgICAgICAgIGlmKCBHaWJiZXJpc2guY2FsbGJhY2tVZ2Vucy5pbmRleE9mKCBpbnB1dC5jYWxsYmFjayApID09PSAtMSApIHtcbiAgICAgICAgICAgICAgICBHaWJiZXJpc2guY2FsbGJhY2tVZ2Vucy5wdXNoKCBpbnB1dC5jYWxsYmFjayApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGluZSArPSBgdl8ke2lucHV0LmlkfWBcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiggaSA8IGtleXMubGVuZ3RoIC0gMSApIHtcbiAgICAgICAgICAgIGxpbmUgKz0gdWdlbi5iaW5vcCA/ICcgJyArIHVnZW4ub3AgKyAnICcgOiAnLCAnIFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICAvL2lmKCB1Z2VuLnR5cGUgPT09ICdidXMnICkgbGluZSArPSAnLCAnIFxuICAgICAgaWYoICF1Z2VuLmJpbm9wICYmIHVnZW4udHlwZSAhPT0gJ2J1cycgJiYgdWdlbi50eXBlICE9PSAnc2VxJyApIGxpbmUgKz0gJ21lbW9yeSdcbiAgICAgIGxpbmUgKz0gdWdlbi5iaW5vcCA/ICcnIDogJyApJ1xuXG4gICAgICBibG9jay5wdXNoKCBsaW5lIClcbiAgICAgIFxuICAgICAgLy9jb25zb2xlLmxvZyggJ21lbW86JywgdWdlbi51Z2VuTmFtZSApXG4gICAgICBHaWJiZXJpc2gubWVtb2VkWyB1Z2VuLnVnZW5OYW1lIF0gPSBgdl8ke3VnZW4uaWR9YFxuXG4gICAgICBpZiggZGlydHlJZHggIT09IC0xICkge1xuICAgICAgICBHaWJiZXJpc2guZGlydHlVZ2Vucy5zcGxpY2UoIGRpcnR5SWR4LCAxIClcbiAgICAgIH1cblxuICAgIH1lbHNlIGlmKCB1Z2VuLmJsb2NrICkge1xuICAgICAgcmV0dXJuIHVnZW4uYmxvY2tcbiAgICB9XG5cbiAgICByZXR1cm4gYmxvY2tcbiAgfSxcbiAgICBcbn1cblxuR2liYmVyaXNoLnV0aWxpdGllcyA9IHJlcXVpcmUoICcuL3V0aWxpdGllcy5qcycgKSggR2liYmVyaXNoIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEdpYmJlcmlzaFxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgQ29uZ2EgPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBsZXQgY29uZ2EgPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgIGRlY2F5ID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQ29uZ2EuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgbGV0IHRyaWdnZXIgPSBnLmJhbmcoKSxcbiAgICAgICAgaW1wdWxzZSA9IGcubXVsKCB0cmlnZ2VyLCA2MCApLFxuICAgICAgICBfZGVjYXkgPSAgZy5zdWIoIC4xMDEsIGcuZGl2KCBkZWNheSwgMTAgKSApLCAvLyBjcmVhdGUgcmFuZ2Ugb2YgLjAwMSAtIC4wOTlcbiAgICAgICAgYnBmID0gZy5zdmYoIGltcHVsc2UsIGZyZXF1ZW5jeSwgX2RlY2F5LCAyLCBmYWxzZSApLFxuICAgICAgICBvdXQgPSBnLm11bCggYnBmLCBnYWluIClcbiAgICBcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggY29uZ2EsIG91dCwgJ2NvbmdhJywgcHJvcHMgIClcbiAgICBcbiAgICBjb25nYS5lbnYgPSB0cmlnZ2VyXG5cbiAgICByZXR1cm4gY29uZ2FcbiAgfVxuICBcbiAgQ29uZ2EuZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogLjI1LFxuICAgIGZyZXF1ZW5jeToxOTAsXG4gICAgZGVjYXk6IC44NVxuICB9XG5cbiAgcmV0dXJuIENvbmdhXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgQ293YmVsbCA9IGFyZ3VtZW50UHJvcHMgPT4ge1xuICAgIGNvbnN0IGNvd2JlbGwgPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgICAgZGVjYXkgICA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgICBnYWluICAgID0gZy5pbiggJ2dhaW4nIClcblxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIENvd2JlbGwuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgY29uc3QgYnBmQ3V0b2ZmID0gZy5wYXJhbSggJ2JwZmMnLCAxMDAwICksXG4gICAgICAgICAgczEgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIDU2MCApLFxuICAgICAgICAgIHMyID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCA4NDUgKSxcbiAgICAgICAgICBlZyA9IGcuZGVjYXkoIGcubXVsKCBkZWNheSwgZy5nZW4uc2FtcGxlcmF0ZSAqIDIgKSApLCBcbiAgICAgICAgICBicGYgPSBnLnN2ZiggZy5hZGQoIHMxLHMyICksIGJwZkN1dG9mZiwgMywgMiwgZmFsc2UgKSxcbiAgICAgICAgICBlbnZCcGYgPSBnLm11bCggYnBmLCBlZyApLFxuICAgICAgICAgIG91dCA9IGcubXVsKCBlbnZCcGYsIGdhaW4gKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIGNvd2JlbGwsIG91dCwgJ2Nvd2JlbGwnLCBwcm9wcyAgKVxuICAgIFxuICAgIGNvd2JlbGwuZW52ID0gZWcgXG5cbiAgICBjb3diZWxsLmlzU3RlcmVvID0gZmFsc2VcblxuICAgIHJldHVybiBjb3diZWxsXG4gIH1cbiAgXG4gIENvd2JlbGwuZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogMSxcbiAgICBkZWNheTouNVxuICB9XG5cbiAgcmV0dXJuIENvd2JlbGxcblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgRk0gPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgc3luID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApXG5cbiAgICBsZXQgZW52ID0gZy5hZCggZy5pbignYXR0YWNrJyksIGcuaW4oJ2RlY2F5JyksIHsgc2hhcGU6J2xpbmVhcicgfSksXG4gICAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgIGdsaWRlID0gZy5pbiggJ2dsaWRlJyApLFxuICAgICAgICBzbGlkaW5nRnJlcSA9IGcuc2xpZGUoIGZyZXF1ZW5jeSwgZ2xpZGUsIGdsaWRlICksXG4gICAgICAgIGNtUmF0aW8gPSBnLmluKCAnY21SYXRpbycgKSxcbiAgICAgICAgaW5kZXggPSBnLmluKCAnaW5kZXgnIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBGTS5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG5cbiAgICBsZXQgbW9kT3NjID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoIHByb3BzLm1vZHVsYXRvcldhdmVmb3JtLCBnLm11bCggc2xpZGluZ0ZyZXEsIGNtUmF0aW8gKSwgcHJvcHMuYW50aWFsaWFzIClcbiAgICBsZXQgbW9kT3NjV2l0aEluZGV4ID0gZy5tdWwoIG1vZE9zYywgZy5tdWwoIHNsaWRpbmdGcmVxLCBpbmRleCApIClcbiAgICBsZXQgbW9kT3NjV2l0aEVudiAgID0gZy5tdWwoIG1vZE9zY1dpdGhJbmRleCwgZW52IClcblxuICAgIGxldCBjYXJyaWVyT3NjID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoIHByb3BzLmNhcnJpZXJXYXZlZm9ybSwgZy5hZGQoIHNsaWRpbmdGcmVxLCBtb2RPc2NXaXRoRW52ICksIHByb3BzLmFudGlhbGlhcyApXG4gICAgbGV0IGNhcnJpZXJPc2NXaXRoRW52ID0gZy5tdWwoIGNhcnJpZXJPc2MsIGVudiApXG4gICAgXG4gICAgbGV0IGN1dG9mZiA9IGcuYWRkKCBnLmluKCdjdXRvZmYnKSwgZy5tdWwoIGcuaW4oJ2ZpbHRlck11bHQnKSwgZW52ICkgKVxuICAgIGNvbnN0IGZpbHRlcmVkT3NjID0gR2liYmVyaXNoLmZpbHRlcnMuZmFjdG9yeSggY2Fycmllck9zY1dpdGhFbnYsIGN1dG9mZiwgZy5pbigncmVzb25hbmNlJyksIGcuaW4oJ3NhdHVyYXRpb24nKSwgcHJvcHMgKVxuXG4gICAgbGV0IHN5bnRoV2l0aEdhaW4gPSBnLm11bCggZmlsdGVyZWRPc2MsIGcuaW4oICdnYWluJyApICksXG4gICAgICAgIHBhbm5lclxuXG4gICAgaWYoIHByb3BzLnBhblZvaWNlcyA9PT0gdHJ1ZSApIHsgXG4gICAgICBwYW5uZXIgPSBnLnBhbiggc3ludGhXaXRoR2Fpbiwgc3ludGhXaXRoR2FpbiwgZy5pbiggJ3BhbicgKSApIFxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdLCAnZm0nLCBwcm9wcyAgKVxuICAgIH1lbHNle1xuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgc3ludGhXaXRoR2FpbiAsICdmbScsIHByb3BzIClcbiAgICB9XG4gICAgXG4gICAgc3luLmVudiA9IGVudlxuXG4gICAgcmV0dXJuIHN5blxuICB9XG5cbiAgRk0uZGVmYXVsdHMgPSB7XG4gICAgY2FycmllcldhdmVmb3JtOidzaW5lJyxcbiAgICBtb2R1bGF0b3JXYXZlZm9ybTonc2luZScsXG4gICAgYXR0YWNrOiA0NDEwMCxcbiAgICBkZWNheTogNDQxMDAsXG4gICAgZ2FpbjogMSxcbiAgICBjbVJhdGlvOjIsXG4gICAgaW5kZXg6NSxcbiAgICBwdWxzZXdpZHRoOi4yNSxcbiAgICBmcmVxdWVuY3k6MjIwLFxuICAgIHBhbjogLjUsXG4gICAgYW50aWFsaWFzOmZhbHNlLFxuICAgIHBhblZvaWNlczpmYWxzZSxcbiAgICBnbGlkZToxLFxuICAgIHNhdHVyYXRpb246MSxcbiAgICBmaWx0ZXJNdWx0OjQ0MCxcbiAgICBROjgsXG4gICAgY3V0b2ZmOjQ0MCxcbiAgICByZXNvbmFuY2U6MyxcbiAgICBmaWx0ZXJUeXBlOjAsXG4gICAgaXNMb3dQYXNzOjFcbiAgfVxuXG4gIGxldCBQb2x5Rk0gPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBGTSwgWydnbGlkZScsJ2ZyZXF1ZW5jeScsJ2F0dGFjaycsJ2RlY2F5JywncHVsc2V3aWR0aCcsJ3BhbicsJ2dhaW4nLCdjbVJhdGlvJywnaW5kZXgnLCAnc2F0dXJhdGlvbicsICdmaWx0ZXJNdWx0JywgJ1EnLCAnY3V0b2ZmJywgJ3Jlc29uYW5jZScgXSApIFxuXG4gIHJldHVybiBbIEZNLCBQb2x5Rk0gXVxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBIYXQgPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBsZXQgaGF0ID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApLFxuICAgICAgICB0dW5lICA9IGcuaW4oICd0dW5lJyApLFxuICAgICAgICBzY2FsZWRUdW5lID0gZy5tZW1vKCBnLmFkZCggLjUsIHR1bmUgKSApLFxuICAgICAgICBkZWNheSAgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgIGdhaW4gID0gZy5pbiggJ2dhaW4nIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBIYXQuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgbGV0IGJhc2VGcmVxID0gZy5tdWwoIDMyNSwgc2NhbGVkVHVuZSApLCAvLyByYW5nZSBvZiAxNjIuNSAtIDQ4Ny41XG4gICAgICAgIGJwZkN1dG9mZiA9IGcubXVsKCBnLnBhcmFtKCAnYnBmYycsIDcwMDApLCBzY2FsZWRUdW5lICksXG4gICAgICAgIGhwZkN1dG9mZiA9IGcubXVsKCBnLnBhcmFtKCAnaHBmYycsLjk3NTUpLCBzY2FsZWRUdW5lICksICBcbiAgICAgICAgczEgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGJhc2VGcmVxLCBmYWxzZSApLFxuICAgICAgICBzMiA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5tdWwoIGJhc2VGcmVxLDEuNDQ3MSApICksXG4gICAgICAgIHMzID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBnLm11bCggYmFzZUZyZXEsMS42MTcwICkgKSxcbiAgICAgICAgczQgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGcubXVsKCBiYXNlRnJlcSwxLjkyNjUgKSApLFxuICAgICAgICBzNSA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5tdWwoIGJhc2VGcmVxLDIuNTAyOCApICksXG4gICAgICAgIHM2ID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBnLm11bCggYmFzZUZyZXEsMi42NjM3ICkgKSxcbiAgICAgICAgc3VtID0gZy5hZGQoIHMxLHMyLHMzLHM0LHM1LHM2ICksXG4gICAgICAgIGVnID0gZy5kZWNheSggZy5tdWwoIGRlY2F5LCBnLmdlbi5zYW1wbGVyYXRlICogMiApICksIFxuICAgICAgICBicGYgPSBnLnN2Ziggc3VtLCBicGZDdXRvZmYsIC41LCAyLCBmYWxzZSApLFxuICAgICAgICBlbnZCcGYgPSBnLm11bCggYnBmLCBlZyApLFxuICAgICAgICBocGYgPSBnLmZpbHRlcjI0KCBlbnZCcGYsIDAsIGhwZkN1dG9mZiwgMCApLFxuICAgICAgICBvdXQgPSBnLm11bCggaHBmLCBnYWluIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBoYXQsIG91dCwgJ2hhdCcsIHByb3BzICApXG4gICAgXG4gICAgaGF0LmVudiA9IGVnIFxuXG4gICAgaGF0LmlzU3RlcmVvID0gZmFsc2VcbiAgICByZXR1cm4gaGF0XG4gIH1cbiAgXG4gIEhhdC5kZWZhdWx0cyA9IHtcbiAgICBnYWluOiAgMSxcbiAgICB0dW5lOiAuNSxcbiAgICBkZWNheTouMSxcbiAgfVxuXG4gIHJldHVybiBIYXRcblxufVxuIiwibGV0IHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKSxcbiAgICBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5sZXQgaW5zdHJ1bWVudCA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG5PYmplY3QuYXNzaWduKCBpbnN0cnVtZW50LCB7XG4gIG5vdGUoIGZyZXEgKSB7XG4gICAgdGhpcy5mcmVxdWVuY3kgPSBmcmVxXG4gICAgdGhpcy5lbnYudHJpZ2dlcigpXG4gIH0sXG5cbiAgdHJpZ2dlciggX2dhaW4gPSAxICkge1xuICAgIHRoaXMuZ2FpbiA9IF9nYWluXG4gICAgdGhpcy5lbnYudHJpZ2dlcigpXG4gIH0sXG5cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gaW5zdHJ1bWVudFxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG5jb25zdCBpbnN0cnVtZW50cyA9IHtcbiAgS2ljayAgICAgICAgOiByZXF1aXJlKCAnLi9raWNrLmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgQ29uZ2EgICAgICAgOiByZXF1aXJlKCAnLi9jb25nYS5qcycgKSggR2liYmVyaXNoICksXG4gIENsYXZlICAgICAgIDogcmVxdWlyZSggJy4vY29uZ2EuanMnICkoIEdpYmJlcmlzaCApLCAvLyBjbGF2ZSBpcyBzYW1lIGFzIGNvbmdhIHdpdGggZGlmZmVyZW50IGRlZmF1bHRzLCBzZWUgYmVsb3dcbiAgSGF0ICAgICAgICAgOiByZXF1aXJlKCAnLi9oYXQuanMnICkoIEdpYmJlcmlzaCApLFxuICBTbmFyZSAgICAgICA6IHJlcXVpcmUoICcuL3NuYXJlLmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgQ293YmVsbCAgICAgOiByZXF1aXJlKCAnLi9jb3diZWxsLmpzJyApKCBHaWJiZXJpc2ggKVxufVxuXG5pbnN0cnVtZW50cy5DbGF2ZS5kZWZhdWx0cy5mcmVxdWVuY3kgPSAyNTAwXG5pbnN0cnVtZW50cy5DbGF2ZS5kZWZhdWx0cy5kZWNheSA9IC41O1xuXG5bIGluc3RydW1lbnRzLlN5bnRoLCBpbnN0cnVtZW50cy5Qb2x5U3ludGggXSAgICAgPSByZXF1aXJlKCAnLi9zeW50aC5qcycgKSggR2liYmVyaXNoICk7XG5bIGluc3RydW1lbnRzLk1vbm9zeW50aCwgaW5zdHJ1bWVudHMuUG9seU1vbm8gXSAgPSByZXF1aXJlKCAnLi9tb25vc3ludGguanMnICkoIEdpYmJlcmlzaCApO1xuWyBpbnN0cnVtZW50cy5GTSwgaW5zdHJ1bWVudHMuUG9seUZNIF0gICAgICAgICAgID0gcmVxdWlyZSggJy4vZm0uanMnICkoIEdpYmJlcmlzaCApO1xuWyBpbnN0cnVtZW50cy5TYW1wbGVyLCBpbnN0cnVtZW50cy5Qb2x5U2FtcGxlciBdID0gcmVxdWlyZSggJy4vc2FtcGxlci5qcycgKSggR2liYmVyaXNoICk7XG5bIGluc3RydW1lbnRzLkthcnBsdXMsIGluc3RydW1lbnRzLlBvbHlLYXJwbHVzIF0gPSByZXF1aXJlKCAnLi9rYXJwbHVzc3Ryb25nLmpzJyApKCBHaWJiZXJpc2ggKTtcblxuaW5zdHJ1bWVudHMuZXhwb3J0ID0gdGFyZ2V0ID0+IHtcbiAgZm9yKCBsZXQga2V5IGluIGluc3RydW1lbnRzICkge1xuICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgdGFyZ2V0WyBrZXkgXSA9IGluc3RydW1lbnRzWyBrZXkgXVxuICAgIH1cbiAgfVxufVxuXG5yZXR1cm4gaW5zdHJ1bWVudHNcblxufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgS1BTID0gaW5wdXRQcm9wcyA9PiB7XG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBLUFMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgIGNvbnN0IHN5biA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgICB0cmlnZ2VyID0gZy5iYW5nKCksXG4gICAgICAgICAgcGhhc2UgPSBnLmFjY3VtKCAxLCB0cmlnZ2VyLCB7IG1heDpJbmZpbml0eSB9ICksXG4gICAgICAgICAgZW52ID0gZy5ndHAoIGcuc3ViKCAxLCBnLmRpdiggcGhhc2UsIDIwMCApICksIDAgKSxcbiAgICAgICAgICBpbXB1bHNlID0gZy5tdWwoIGcubm9pc2UoKSwgZW52ICksXG4gICAgICAgICAgZmVlZGJhY2sgPSBnLmhpc3RvcnkoKSxcbiAgICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCdmcmVxdWVuY3knKSxcbiAgICAgICAgICBnbGlkZSA9IGcuaW4oICdnbGlkZScgKSxcbiAgICAgICAgICBzbGlkaW5nRnJlcXVlbmN5ID0gZy5zbGlkZSggZnJlcXVlbmN5LCBnbGlkZSwgZ2xpZGUgKSxcbiAgICAgICAgICBkZWxheSA9IGcuZGVsYXkoIGcuYWRkKCBpbXB1bHNlLCBmZWVkYmFjay5vdXQgKSwgZy5kaXYoIEdpYmJlcmlzaC5jdHguc2FtcGxlUmF0ZSwgc2xpZGluZ0ZyZXF1ZW5jeSApLCB7IHNpemU6MjA0OCB9KSxcbiAgICAgICAgICBkZWNheWVkID0gZy5tdWwoIGRlbGF5LCBnLnQ2MCggZy5tdWwoIGcuaW4oJ2RlY2F5JyksIHNsaWRpbmdGcmVxdWVuY3kgKSApICksXG4gICAgICAgICAgZGFtcGVkID0gIGcubWl4KCBkZWNheWVkLCBmZWVkYmFjay5vdXQsIGcuaW4oJ2RhbXBpbmcnKSApLFxuICAgICAgICAgIHdpdGhHYWluID0gZy5tdWwoIGRhbXBlZCwgZy5pbignZ2FpbicpIClcblxuICAgIGZlZWRiYWNrLmluKCBkYW1wZWQgKVxuXG4gICAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBLUFMuZGVmYXVsdHMsIHByb3BzIClcblxuICAgIGlmKCBwcm9wZXJ0aWVzLnBhblZvaWNlcyApIHsgIFxuICAgICAgY29uc3QgcGFubmVyID0gZy5wYW4oIHdpdGhHYWluLCB3aXRoR2FpbiwgZy5pbiggJ3BhbicgKSApXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc3luLCBbcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodF0sICdrYXJwbHVzJywgcHJvcHMgIClcbiAgICB9ZWxzZXtcbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzeW4sIHdpdGhHYWluLCAna2FycGx1cycsIHByb3BzIClcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKCBzeW4sIHtcbiAgICAgIHByb3BlcnRpZXMgOiBwcm9wcyxcblxuICAgICAgZW52IDogdHJpZ2dlcixcbiAgICAgIHBoYXNlLFxuXG4gICAgICBnZXRQaGFzZSgpIHtcbiAgICAgICAgcmV0dXJuIEdpYmJlcmlzaC5tZW1vcnkuaGVhcFsgcGhhc2UubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9LFxuICAgIH0pXG4gICAgcmV0dXJuIHN5blxuICB9XG4gIFxuICBLUFMuZGVmYXVsdHMgPSB7XG4gICAgZGVjYXk6IC45NyxcbiAgICBkYW1waW5nOi4yLFxuICAgIGdhaW46IDEsXG4gICAgZnJlcXVlbmN5OjIyMCxcbiAgICBwYW46IC41LFxuICAgIGdsaWRlOjEsXG4gICAgcGFuVm9pY2VzOmZhbHNlXG4gIH1cblxuICBsZXQgZW52Q2hlY2tGYWN0b3J5ID0gKCBzeW4sc3ludGggKSA9PiB7XG4gICAgbGV0IGVudkNoZWNrID0gKCk9PiB7XG4gICAgICBsZXQgcGhhc2UgPSBzeW4uZ2V0UGhhc2UoKSxcbiAgICAgICAgICBlbmRUaW1lID0gc3ludGguZGVjYXkgKiBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGVcblxuICAgICAgaWYoIHBoYXNlID4gZW5kVGltZSApIHtcbiAgICAgICAgc3ludGguZGlzY29ubmVjdFVnZW4oIHN5biApXG4gICAgICAgIHN5bi5pc0Nvbm5lY3RlZCA9IGZhbHNlXG4gICAgICAgIEdpYmJlcmlzaC5tZW1vcnkuaGVhcFsgc3luLnBoYXNlLm1lbW9yeS52YWx1ZS5pZHggXSA9IDAgLy8gdHJpZ2dlciBkb2Vzbid0IHNlZW0gdG8gcmVzZXQgZm9yIHNvbWUgcmVhc29uXG4gICAgICB9ZWxzZXtcbiAgICAgICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLnB1c2goIGVudkNoZWNrIClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVudkNoZWNrXG4gIH1cblxuICBsZXQgUG9seUtQUyA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIEtQUywgWydmcmVxdWVuY3knLCdkZWNheScsJ2RhbXBpbmcnLCdwYW4nLCdnYWluJywgJ2dsaWRlJ10sIGVudkNoZWNrRmFjdG9yeSApIFxuXG4gIHJldHVybiBbIEtQUywgUG9seUtQUyBdXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IEtpY2sgPSBpbnB1dFByb3BzID0+IHtcbiAgICAvLyBlc3RhYmxpc2ggcHJvdG90eXBlIGNoYWluXG4gICAgbGV0IGtpY2sgPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50IClcblxuICAgIC8vIGRlZmluZSBpbnB1dHNcbiAgICBsZXQgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgZGVjYXkgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgIHRvbmUgID0gZy5pbiggJ3RvbmUnICksXG4gICAgICAgIGdhaW4gID0gZy5pbiggJ2dhaW4nIClcbiAgICBcbiAgICAvLyBjcmVhdGUgaW5pdGlhbCBwcm9wZXJ0eSBzZXRcbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgS2ljay5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG5cbiAgICAvLyBjcmVhdGUgRFNQIGdyYXBoXG4gICAgbGV0IHRyaWdnZXIgPSBnLmJhbmcoKSxcbiAgICAgICAgaW1wdWxzZSA9IGcubXVsKCB0cmlnZ2VyLCA2MCApLFxuICAgICAgICBzY2FsZWREZWNheSA9IGcuc3ViKCAxLjAwNSwgZGVjYXkgKSwgLy8gLT4gcmFuZ2UgeyAuMDA1LCAxLjAwNSB9XG4gICAgICAgIHNjYWxlZFRvbmUgPSBnLmFkZCggNTAsIGcubXVsKCB0b25lLCA0MDAwICkgKSwgLy8gLT4gcmFuZ2UgeyA1MCwgNDA1MCB9XG4gICAgICAgIGJwZiA9IGcuc3ZmKCBpbXB1bHNlLCBmcmVxdWVuY3ksIHNjYWxlZERlY2F5LCAyLCBmYWxzZSApLFxuICAgICAgICBscGYgPSBnLnN2ZiggYnBmLCBzY2FsZWRUb25lLCAuNSwgMCwgZmFsc2UgKSxcbiAgICAgICAgZ3JhcGggPSBnLm11bCggbHBmLCBnYWluIClcbiAgICBcbiAgICBHaWJiZXJpc2guZmFjdG9yeSgga2ljaywgZ3JhcGgsICdraWNrJywgcHJvcHMgIClcblxuICAgIGtpY2suZW52ID0gdHJpZ2dlclxuXG4gICAgcmV0dXJuIGtpY2tcbiAgfVxuICBcbiAgS2ljay5kZWZhdWx0cyA9IHtcbiAgICBnYWluOiAxLFxuICAgIGZyZXF1ZW5jeTo4NSxcbiAgICB0b25lOiAuMjUsXG4gICAgZGVjYXk6LjlcbiAgfVxuXG4gIHJldHVybiBLaWNrXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnICksXG4gICAgICBmZWVkYmFja09zYyA9IHJlcXVpcmUoICcuLi9vc2NpbGxhdG9ycy9mbWZlZWRiYWNrb3NjLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBTeW50aCA9IGFyZ3VtZW50UHJvcHMgPT4ge1xuICAgIGNvbnN0IHN5biA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgICBvc2NzID0gW10sIFxuICAgICAgICAgIGVudiA9IGcuYWQoIGcuaW4oICdhdHRhY2snICksIGcuaW4oICdkZWNheScgKSwgeyBzaGFwZTonbGluZWFyJyB9KSxcbiAgICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICAgIGdsaWRlID0gZy5pbiggJ2dsaWRlJyApLFxuICAgICAgICAgIHNsaWRpbmdGcmVxID0gZy5tZW1vKCBnLnNsaWRlKCBmcmVxdWVuY3ksIGdsaWRlLCBnbGlkZSApIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHN5biwgU3ludGguZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgc3luLl9fY3JlYXRlR3JhcGggPSBmdW5jdGlvbigpIHtcbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgMzsgaSsrICkge1xuICAgICAgICBsZXQgb3NjLCBmcmVxXG5cbiAgICAgICAgc3dpdGNoKCBpICkge1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGZyZXEgPSBnLmFkZCggc2xpZGluZ0ZyZXEsIGcubXVsKCBzbGlkaW5nRnJlcSwgZy5pbignZGV0dW5lMicpICkgKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgZnJlcSA9IGcuYWRkKCBzbGlkaW5nRnJlcSwgZy5tdWwoIHNsaWRpbmdGcmVxLCBnLmluKCdkZXR1bmUzJykgKSApXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgZnJlcSA9IHNsaWRpbmdGcmVxLy9mcmVxdWVuY3lcbiAgICAgICAgfVxuXG4gICAgICAgIG9zYyA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCBzeW4ud2F2ZWZvcm0sIGZyZXEsIHN5bi5hbnRpYWxpYXMgKVxuICAgICAgICBcbiAgICAgICAgb3Njc1sgaSBdID0gb3NjXG4gICAgICB9XG5cbiAgICAgIGxldCBvc2NTdW0gPSBnLmFkZCggLi4ub3NjcyApLFxuICAgICAgICAgIG9zY1dpdGhHYWluID0gZy5tdWwoIGcubXVsKCBvc2NTdW0sIGVudiApLCBnLmluKCAnZ2FpbicgKSApLFxuICAgICAgICAgIGN1dG9mZiA9IGcuYWRkKCBnLmluKCdjdXRvZmYnKSwgZy5tdWwoIGcuaW4oJ2ZpbHRlck11bHQnKSwgZW52ICkgKSxcbiAgICAgICAgICBmaWx0ZXJlZE9zYywgcGFubmVyXG5cbiAgICAgIGZpbHRlcmVkT3NjID0gR2liYmVyaXNoLmZpbHRlcnMuZmFjdG9yeSggb3NjV2l0aEdhaW4sIGN1dG9mZiwgZy5pbigncmVzb25hbmNlJyksIGcuaW4oJ3NhdHVyYXRpb24nKSwgc3luIClcbiAgICAgICAgXG4gICAgICBpZiggcHJvcHMucGFuVm9pY2VzICkgeyAgXG4gICAgICAgIHBhbm5lciA9IGcucGFuKCBmaWx0ZXJlZE9zYyxmaWx0ZXJlZE9zYywgZy5pbiggJ3BhbicgKSApXG4gICAgICAgIHN5bi5ncmFwaCA9IFsgcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodCBdXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc3luLmdyYXBoID0gZmlsdGVyZWRPc2NcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzeW4uX19yZXF1aXJlc1JlY29tcGlsYXRpb24gPSBbICd3YXZlZm9ybScsICdhbnRpYWxpYXMnLCAnZmlsdGVyVHlwZScgXVxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoKClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzeW4sIHN5bi5ncmFwaCwgJ21vbm8nLCBwcm9wcyApXG5cbiAgICBzeW4uZW52ID0gZW52XG5cbiAgICByZXR1cm4gc3luXG4gIH1cbiAgXG4gIFN5bnRoLmRlZmF1bHRzID0ge1xuICAgIHdhdmVmb3JtOiAnc2F3JyxcbiAgICBhdHRhY2s6IDQ0MTAwLFxuICAgIGRlY2F5OiA0NDEwMCxcbiAgICBnYWluOiAxLFxuICAgIHB1bHNld2lkdGg6LjI1LFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBkZXR1bmUyOjEuMDEsXG4gICAgZGV0dW5lMzoyLjk5LFxuICAgIGN1dG9mZjogNDQwLCAvLy4yNSxcbiAgICByZXNvbmFuY2U6MixcbiAgICBROiA1LFxuICAgIHBhblZvaWNlczpmYWxzZSxcbiAgICBnbGlkZTogMSxcbiAgICBhbnRpYWxpYXM6ZmFsc2UsXG4gICAgZmlsdGVyVHlwZTogMSxcbiAgICBzYXR1cmF0aW9uOjEsXG4gICAgZmlsdGVyTXVsdDogMTEwLFxuICAgIGlzTG93UGFzczp0cnVlXG4gIH1cblxuICBsZXQgUG9seU1vbm8gPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBTeW50aCwgXG4gICAgWydmcmVxdWVuY3knLCdhdHRhY2snLCdkZWNheScsJ2N1dG9mZicsJ1EnLFxuICAgICAnZGV0dW5lMicsJ2RldHVuZTMnLCdwdWxzZXdpZHRoJywncGFuJywnZ2FpbicsICdnbGlkZScsICdzYXR1cmF0aW9uJywgJ2ZpbHRlck11bHQnIF1cbiAgKSBcblxuICByZXR1cm4gWyBTeW50aCwgUG9seU1vbm8gXVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5vdGUoIGZyZXEgKSB7XG4gICAgbGV0IHZvaWNlID0gdGhpcy5fX2dldFZvaWNlX18oKVxuICAgIE9iamVjdC5hc3NpZ24oIHZvaWNlLCB0aGlzLnByb3BlcnRpZXMgKVxuICAgIHZvaWNlLm5vdGUoIGZyZXEgKVxuICAgIHRoaXMuX19ydW5Wb2ljZV9fKCB2b2ljZSwgdGhpcyApXG4gICAgdGhpcy50cmlnZ2VyTm90ZSA9IGZyZXFcbiAgfSxcblxuICAvLyBYWFggdGhpcyBpcyBub3QgcGFydGljdWxhcmx5IHNhdGlzZnlpbmcuLi5cbiAgLy8gbXVzdCBjaGVjayBmb3IgYm90aCBub3RlcyBhbmQgY2hvcmRzXG4gIHRyaWdnZXIoIGdhaW4gKSB7XG4gICAgaWYoIHRoaXMudHJpZ2dlckNob3JkICE9PSBudWxsICkge1xuICAgICAgdGhpcy50cmlnZ2VyQ2hvcmQuZm9yRWFjaCggdiA9PiB7XG4gICAgICAgIGxldCB2b2ljZSA9IHRoaXMuX19nZXRWb2ljZV9fKClcbiAgICAgICAgT2JqZWN0LmFzc2lnbiggdm9pY2UsIHRoaXMucHJvcGVydGllcyApXG4gICAgICAgIHZvaWNlLm5vdGUoIHYgKVxuICAgICAgICB2b2ljZS5nYWluID0gZ2FpblxuICAgICAgICB0aGlzLl9fcnVuVm9pY2VfXyggdm9pY2UsIHRoaXMgKVxuICAgICAgfSlcbiAgICB9ZWxzZSBpZiggdGhpcy50cmlnZ2VyTm90ZSAhPT0gbnVsbCApIHtcbiAgICAgIGxldCB2b2ljZSA9IHRoaXMuX19nZXRWb2ljZV9fKClcbiAgICAgIE9iamVjdC5hc3NpZ24oIHZvaWNlLCB0aGlzLnByb3BlcnRpZXMgKVxuICAgICAgdm9pY2Uubm90ZSggdGhpcy50cmlnZ2VyTm90ZSApXG4gICAgICB2b2ljZS5nYWluID0gZ2FpblxuICAgICAgdGhpcy5fX3J1blZvaWNlX18oIHZvaWNlLCB0aGlzIClcbiAgICB9ZWxzZXtcbiAgICAgIGxldCB2b2ljZSA9IHRoaXMuX19nZXRWb2ljZV9fKClcbiAgICAgIE9iamVjdC5hc3NpZ24oIHZvaWNlLCB0aGlzLnByb3BlcnRpZXMgKVxuICAgICAgdm9pY2UudHJpZ2dlciggZ2FpbiApXG4gICAgICB0aGlzLl9fcnVuVm9pY2VfXyggdm9pY2UsIHRoaXMgKVxuICAgIH1cbiAgfSxcblxuICBfX3J1blZvaWNlX18oIHZvaWNlLCBfcG9seSApIHtcbiAgICBpZiggIXZvaWNlLmlzQ29ubmVjdGVkICkge1xuICAgICAgdm9pY2UuY29ubmVjdCggX3BvbHksIDEgKVxuICAgICAgdm9pY2UuaXNDb25uZWN0ZWQgPSB0cnVlXG4gICAgfVxuXG4gICAgbGV0IGVudkNoZWNrXG4gICAgaWYoIF9wb2x5LmVudkNoZWNrID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBlbnZDaGVjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiggdm9pY2UuZW52LmlzQ29tcGxldGUoKSApIHtcbiAgICAgICAgICBfcG9seS5kaXNjb25uZWN0VWdlbi5jYWxsKCBfcG9seSwgdm9pY2UgKVxuICAgICAgICAgIHZvaWNlLmlzQ29ubmVjdGVkID0gZmFsc2VcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLnB1c2goIGVudkNoZWNrIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgZW52Q2hlY2sgPSBwb2x5LmVudkNoZWNrKCB2b2ljZSwgcG9seSApXG4gICAgfVxuXG4gICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLnB1c2goIGVudkNoZWNrIClcbiAgfSxcblxuICBfX2dldFZvaWNlX18oKSB7XG4gICAgcmV0dXJuIHRoaXMudm9pY2VzWyB0aGlzLnZvaWNlQ291bnQrKyAlIHRoaXMudm9pY2VzLmxlbmd0aCBdXG4gIH0sXG5cbiAgY2hvcmQoIGZyZXF1ZW5jaWVzICkge1xuICAgIGZyZXF1ZW5jaWVzLmZvckVhY2goIHYgPT4gdGhpcy5ub3RlKCB2ICkgKVxuICAgIHRoaXMudHJpZ2dlckNob3JkID0gZnJlcXVlbmNpZXNcbiAgfSxcblxuICBmcmVlKCkge1xuICAgIGZvciggbGV0IGNoaWxkIG9mIHRoaXMudm9pY2VzICkgY2hpbGQuZnJlZSgpXG4gIH1cbn1cbiIsIi8qXG4gKiBUaGlzIGZpbGVzIGNyZWF0ZXMgYSBmYWN0b3J5IGdlbmVyYXRpbmcgcG9seXN5bnRoIGNvbnN0cnVjdG9ycy5cbiAqL1xuXG5jb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgVGVtcGxhdGVGYWN0b3J5ID0gKCB1Z2VuLCBwcm9wZXJ0eUxpc3QsIF9lbnZDaGVjayApID0+IHtcbiAgICAvKiBcbiAgICAgKiBwb2x5c3ludGhzIGFyZSBiYXNpY2FsbHkgYnVzc2VzIHRoYXQgY29ubmVjdCBjaGlsZCBzeW50aCB2b2ljZXMuXG4gICAgICogV2UgY3JlYXRlIHNlcGFyYXRlIHByb3RvdHlwZXMgZm9yIG1vbm8gdnMgc3RlcmVvIGluc3RhbmNlcy5cbiAgICAgKi9cblxuICAgIGNvbnN0IG1vbm9Qcm90byAgID0gT2JqZWN0LmNyZWF0ZSggR2liYmVyaXNoLkJ1cygpICksXG4gICAgICAgICAgc3RlcmVvUHJvdG8gPSBPYmplY3QuY3JlYXRlKCBHaWJiZXJpc2guQnVzMigpKVxuXG4gICAgLy8gc2luY2UgdGhlcmUgYXJlIHR3byBwcm90b3R5cGVzIHdlIGNhbid0IGFzc2lnbiBkaXJlY3RseSB0byBvbmUgb2YgdGhlbS4uLlxuICAgIE9iamVjdC5hc3NpZ24oIG1vbm9Qcm90bywgICBHaWJiZXJpc2gubWl4aW5zLnBvbHlpbnN0cnVtZW50IClcbiAgICBPYmplY3QuYXNzaWduKCBzdGVyZW9Qcm90bywgR2liYmVyaXNoLm1peGlucy5wb2x5aW5zdHJ1bWVudCApXG5cbiAgICBjb25zdCBUZW1wbGF0ZSA9IHByb3BzID0+IHtcbiAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgeyBpc1N0ZXJlbzp0cnVlIH0sIHByb3BzIClcblxuICAgICAgY29uc3Qgc3ludGggPSBwcm9wZXJ0aWVzLmlzU3RlcmVvID8gT2JqZWN0LmNyZWF0ZSggc3RlcmVvUHJvdG8gKSA6IE9iamVjdC5jcmVhdGUoIG1vbm9Qcm90byApXG5cbiAgICAgIE9iamVjdC5hc3NpZ24oIHN5bnRoLCB7XG4gICAgICAgIHZvaWNlczogW10sXG4gICAgICAgIG1heFZvaWNlczogcHJvcGVydGllcy5tYXhWb2ljZXMgIT09IHVuZGVmaW5lZCA/IHByb3BlcnRpZXMubWF4Vm9pY2VzIDogMTYsXG4gICAgICAgIHZvaWNlQ291bnQ6IDAsXG4gICAgICAgIGVudkNoZWNrOiBfZW52Q2hlY2ssXG4gICAgICAgIGlkOiBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKSxcbiAgICAgICAgZGlydHk6IHRydWUsXG4gICAgICAgIHR5cGU6ICdidXMnLFxuICAgICAgICB1Z2VuTmFtZTogJ3BvbHknICsgdWdlbi5uYW1lICsgJ18nICsgc3ludGguaWQsXG4gICAgICAgIGlucHV0czogW10sXG4gICAgICAgIGlucHV0TmFtZXM6IFtdLFxuICAgICAgICBwcm9wZXJ0aWVzXG4gICAgICB9KVxuXG4gICAgICBzeW50aC5jYWxsYmFjay51Z2VuTmFtZSA9IHN5bnRoLnVnZW5OYW1lXG5cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgc3ludGgubWF4Vm9pY2VzOyBpKysgKSB7XG4gICAgICAgIHN5bnRoLnZvaWNlc1tpXSA9IHVnZW4oIHByb3BlcnRpZXMgKVxuICAgICAgICBzeW50aC52b2ljZXNbaV0uY2FsbGJhY2sudWdlbk5hbWUgPSBzeW50aC52b2ljZXNbaV0udWdlbk5hbWVcbiAgICAgICAgc3ludGgudm9pY2VzW2ldLmlzQ29ubmVjdGVkID0gZmFsc2VcbiAgICAgIH1cblxuICAgICAgbGV0IF9wcm9wZXJ0eUxpc3QgXG4gICAgICBpZiggcHJvcGVydGllcy5pc1N0ZXJlbyA9PT0gZmFsc2UgKSB7XG4gICAgICAgIF9wcm9wZXJ0eUxpc3QgPSBwcm9wZXJ0eUxpc3Quc2xpY2UoIDAgKVxuICAgICAgICBjb25zdCBpZHggPSAgX3Byb3BlcnR5TGlzdC5pbmRleE9mKCAncGFuJyApXG4gICAgICAgIGlmKCBpZHggID4gLTEgKSBfcHJvcGVydHlMaXN0LnNwbGljZSggaWR4LCAxIClcbiAgICAgIH1cblxuICAgICAgVGVtcGxhdGVGYWN0b3J5LnNldHVwUHJvcGVydGllcyggc3ludGgsIHVnZW4sIHByb3BlcnRpZXMuaXNTdGVyZW8gPyBwcm9wZXJ0eUxpc3QgOiBfcHJvcGVydHlMaXN0IClcblxuICAgICAgcmV0dXJuIHN5bnRoXG4gICAgfVxuXG4gICAgcmV0dXJuIFRlbXBsYXRlXG4gIH1cblxuICBUZW1wbGF0ZUZhY3Rvcnkuc2V0dXBQcm9wZXJ0aWVzID0gZnVuY3Rpb24oIHN5bnRoLCB1Z2VuLCBwcm9wcyApIHtcbiAgICBmb3IoIGxldCBwcm9wZXJ0eSBvZiBwcm9wcyApIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggc3ludGgsIHByb3BlcnR5LCB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gc3ludGgucHJvcGVydGllc1sgcHJvcGVydHkgXSB8fCB1Z2VuLmRlZmF1bHRzWyBwcm9wZXJ0eSBdXG4gICAgICAgIH0sXG4gICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICBzeW50aC5wcm9wZXJ0aWVzWyBwcm9wZXJ0eSBdID0gdlxuICAgICAgICAgIGZvciggbGV0IGNoaWxkIG9mIHN5bnRoLmlucHV0cyApIHtcbiAgICAgICAgICAgIGNoaWxkWyBwcm9wZXJ0eSBdID0gdlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gVGVtcGxhdGVGYWN0b3J5XG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIGxldCBwcm90byA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHByb3RvLCB7XG4gICAgbm90ZSggcmF0ZSApIHtcbiAgICAgIHRoaXMucmF0ZSA9IHJhdGVcbiAgICAgIGlmKCByYXRlID4gMCApIHtcbiAgICAgICAgdGhpcy50cmlnZ2VyKClcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLl9fcGhhc2VfXy52YWx1ZSA9IHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMSBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgbGV0IFNhbXBsZXIgPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgc3luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbiggeyBvbmxvYWQ6bnVsbCB9LCBTYW1wbGVyLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgIHN5bi5pc1N0ZXJlbyA9IHByb3BzLmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pc1N0ZXJlbyA6IGZhbHNlXG5cbiAgICBsZXQgc3RhcnQgPSBnLmluKCAnc3RhcnQnICksIGVuZCA9IGcuaW4oICdlbmQnICksIFxuICAgICAgICByYXRlID0gZy5pbiggJ3JhdGUnICksIHNob3VsZExvb3AgPSBnLmluKCAnbG9vcHMnIClcblxuICAgIC8qIGNyZWF0ZSBkdW1teSB1Z2VuIHVudGlsIGRhdGEgZm9yIHNhbXBsZXIgaXMgbG9hZGVkLi4uXG4gICAgICogdGhpcyB3aWxsIGJlIG92ZXJyaWRkZW4gYnkgYSBjYWxsIHRvIEdpYmJlcmlzaC5mYWN0b3J5IG9uIGxvYWQgKi9cbiAgICBzeW4uY2FsbGJhY2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDAgfVxuICAgIHN5bi5pZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgc3luLnVnZW5OYW1lID0gc3luLmNhbGxiYWNrLnVnZW5OYW1lID0gJ3NhbXBsZXJfJyArIHN5bi5pZFxuICAgIHN5bi5pbnB1dE5hbWVzID0gW11cbiAgICAvKiBlbmQgZHVtbXkgdWdlbiAqL1xuXG4gICAgc3luLl9fYmFuZ19fID0gZy5iYW5nKClcbiAgICBzeW4udHJpZ2dlciA9IHN5bi5fX2JhbmdfXy50cmlnZ2VyXG5cbiAgICBpZiggcHJvcHMuZmlsZW5hbWUgKSB7XG4gICAgICBzeW4uZGF0YSA9IGcuZGF0YSggcHJvcHMuZmlsZW5hbWUgKVxuXG4gICAgICBzeW4uZGF0YS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIHN5bi5fX3BoYXNlX18gPSBnLmNvdW50ZXIoIHJhdGUsIHN0YXJ0LCBlbmQsIHN5bi5fX2JhbmdfXywgc2hvdWxkTG9vcCwgeyBzaG91bGRXcmFwOmZhbHNlIH0pXG5cbiAgICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgICAgIHN5bixcbiAgICAgICAgICBnLm11bCggXG4gICAgICAgICAgZy5pZmVsc2UoIFxuICAgICAgICAgICAgZy5hbmQoIGcuZ3RlKCBzeW4uX19waGFzZV9fLCBzdGFydCApLCBnLmx0KCBzeW4uX19waGFzZV9fLCBlbmQgKSApLFxuICAgICAgICAgICAgZy5wZWVrKCBcbiAgICAgICAgICAgICAgc3luLmRhdGEsIFxuICAgICAgICAgICAgICBzeW4uX19waGFzZV9fLFxuICAgICAgICAgICAgICB7IG1vZGU6J3NhbXBsZXMnIH1cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICAwXG4gICAgICAgICAgKSwgZy5pbignZ2FpbicpICksXG4gICAgICAgICAgJ3NhbXBsZXInLCBcbiAgICAgICAgICBwcm9wcyBcbiAgICAgICAgKSBcblxuICAgICAgICBpZiggc3luLmVuZCA9PT0gLTk5OTk5OTk5OSApIHN5bi5lbmQgPSBzeW4uZGF0YS5idWZmZXIubGVuZ3RoIC0gMVxuXG4gICAgICAgIGlmKCBzeW4ub25sb2FkICE9PSBudWxsICkgeyBzeW4ub25sb2FkKCkgfVxuXG4gICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggc3luIClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3luXG4gIH1cbiAgXG4gIFNhbXBsZXIuZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogMSxcbiAgICBwYW46IC41LFxuICAgIHJhdGU6IDEsXG4gICAgcGFuVm9pY2VzOmZhbHNlLFxuICAgIGxvb3BzOiAwLFxuICAgIHN0YXJ0OjAsXG4gICAgZW5kOi05OTk5OTk5OTlcbiAgfVxuXG4gIGxldCBQb2x5U2FtcGxlciA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIFNhbXBsZXIsIFsncmF0ZScsJ3BhbicsJ2dhaW4nLCdzdGFydCcsJ2VuZCcsJ2xvb3BzJ10gKSBcblxuICByZXR1cm4gWyBTYW1wbGVyLCBQb2x5U2FtcGxlciBdXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcbiAgXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IFNuYXJlID0gYXJndW1lbnRQcm9wcyA9PiB7XG4gICAgbGV0IHNuYXJlID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApLFxuICAgICAgICBkZWNheSA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgc2NhbGVkRGVjYXkgPSBnLm11bCggZGVjYXksIGcuZ2VuLnNhbXBsZXJhdGUgKiAyICksXG4gICAgICAgIHNuYXBweT0gZy5pbiggJ3NuYXBweScgKSxcbiAgICAgICAgdHVuZSAgPSBnLmluKCAndHVuZScgKSxcbiAgICAgICAgZ2FpbiAgPSBnLmluKCAnZ2FpbicgKVxuXG4gICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIFNuYXJlLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGxldCBlZyA9IGcuZGVjYXkoIHNjYWxlZERlY2F5LCB7IGluaXRWYWx1ZTowIH0gKSwgXG4gICAgICAgIGNoZWNrID0gZy5tZW1vKCBnLmd0KCBlZywgLjAwMDUgKSApLFxuICAgICAgICBybmQgPSBnLm11bCggZy5ub2lzZSgpLCBlZyApLFxuICAgICAgICBocGYgPSBnLnN2Ziggcm5kLCBnLmFkZCggMTAwMCwgZy5tdWwoIGcuYWRkKCAxLCB0dW5lKSwgMTAwMCApICksIC41LCAxLCBmYWxzZSApLFxuICAgICAgICBzbmFwID0gZy5ndHAoIGcubXVsKCBocGYsIHNuYXBweSApLCAwICksIC8vIHJlY3RpZnlcbiAgICAgICAgYnBmMSA9IGcuc3ZmKCBlZywgZy5tdWwoIDE4MCwgZy5hZGQoIHR1bmUsIDEgKSApLCAuMDUsIDIsIGZhbHNlICksXG4gICAgICAgIGJwZjIgPSBnLnN2ZiggZWcsIGcubXVsKCAzMzAsIGcuYWRkKCB0dW5lLCAxICkgKSwgLjA1LCAyLCBmYWxzZSApLFxuICAgICAgICBvdXQgID0gZy5tZW1vKCBnLmFkZCggc25hcCwgYnBmMSwgZy5tdWwoIGJwZjIsIC44ICkgKSApLCAvL1hYWCB3aHkgaXMgbWVtbyBuZWVkZWQ/XG4gICAgICAgIHNjYWxlZE91dCA9IGcubXVsKCBvdXQsIGdhaW4gKVxuICAgIFxuICAgIC8vIFhYWCBUT0RPIDogbWFrZSB0aGlzIHdvcmsgd2l0aCBpZmVsc2UuIHRoZSBwcm9ibGVtIGlzIHRoYXQgcG9rZSB1Z2VucyBwdXQgdGhlaXJcbiAgICAvLyBjb2RlIGF0IHRoZSBib3R0b20gb2YgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLCBpbnN0ZWFkIG9mIGF0IHRoZSBlbmQgb2YgdGhlXG4gICAgLy8gYXNzb2NpYXRlZCBpZi9lbHNlIGJsb2NrLlxuICAgIGxldCBpZmUgPSBnLnN3aXRjaCggY2hlY2ssIHNjYWxlZE91dCwgMCApXG4gICAgLy9sZXQgaWZlID0gZy5pZmVsc2UoIGcuZ3QoIGVnLCAuMDA1ICksIGN5Y2xlKDQ0MCksIDAgKVxuICAgIFxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzbmFyZSwgaWZlLCAnc25hcmUnLCBwcm9wcyAgKVxuICAgIFxuICAgIHNuYXJlLmVudiA9IGVnIFxuXG4gICAgcmV0dXJuIHNuYXJlXG4gIH1cbiAgXG4gIFNuYXJlLmRlZmF1bHRzID0ge1xuICAgIGdhaW46IDEsXG4gICAgZnJlcXVlbmN5OjEwMDAsXG4gICAgdHVuZTowLFxuICAgIHNuYXBweTogMSxcbiAgICBkZWNheTouMVxuICB9XG5cbiAgcmV0dXJuIFNuYXJlXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IFN5bnRoID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgbGV0IHN5biA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKVxuXG4gICAgbGV0IGVudiA9IGcuYWQoIGcuaW4oJ2F0dGFjaycpLCBnLmluKCdkZWNheScpLCB7IHNoYXBlOidsaW5lYXInIH0pLFxuICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICBsb3VkbmVzcyAgPSBnLmluKCAnbG91ZG5lc3MnICksIFxuICAgICAgICBnbGlkZSA9IGcuaW4oICdnbGlkZScgKSxcbiAgICAgICAgc2xpZGluZ0ZyZXEgPSBnLnNsaWRlKCBmcmVxdWVuY3ksIGdsaWRlLCBnbGlkZSApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCBzeW4sIFN5bnRoLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgb3NjID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoIHN5bi53YXZlZm9ybSwgc2xpZGluZ0ZyZXEsIHN5bi5hbnRpYWxpYXMgKVxuXG4gICAgICBsZXQgb3NjV2l0aEVudiA9IGcubXVsKCBnLm11bCggb3NjLCBlbnYsIGxvdWRuZXNzICkgKSxcbiAgICAgICAgICBwYW5uZXJcbiAgXG4gICAgICBsZXQgY3V0b2ZmID0gZy5hZGQoIGcuaW4oJ2N1dG9mZicpLCBnLm11bCggZy5pbignZmlsdGVyTXVsdCcpLCBlbnYgKSApXG4gICAgICBjb25zdCBmaWx0ZXJlZE9zYyA9IEdpYmJlcmlzaC5maWx0ZXJzLmZhY3RvcnkoIG9zY1dpdGhFbnYsIGN1dG9mZiwgZy5pbigncmVzb25hbmNlJyksIGcuaW4oJ3NhdHVyYXRpb24nKSwgcHJvcHMgKVxuXG4gICAgICBsZXQgc3ludGhXaXRoR2FpbiA9IGcubXVsKCBmaWx0ZXJlZE9zYywgZy5pbiggJ2dhaW4nICkgKVxuICBcbiAgICAgIGlmKCBzeW4ucGFuVm9pY2VzID09PSB0cnVlICkgeyBcbiAgICAgICAgcGFubmVyID0gZy5wYW4oIHN5bnRoV2l0aEdhaW4sIHN5bnRoV2l0aEdhaW4sIGcuaW4oICdwYW4nICkgKSBcbiAgICAgICAgc3luLmdyYXBoID0gW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc3luLmdyYXBoID0gc3ludGhXaXRoR2FpblxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBzeW4uX19yZXF1aXJlc1JlY29tcGlsYXRpb24gPSBbICd3YXZlZm9ybScsICdhbnRpYWxpYXMnLCAnZmlsdGVyVHlwZScgXVxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoKClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzeW4sIHN5bi5ncmFwaCwgJ3N5bnRoJywgcHJvcHMgIClcblxuICAgIHN5bi5lbnYgPSBlbnZcblxuICAgIHJldHVybiBzeW5cbiAgfVxuICBcbiAgU3ludGguZGVmYXVsdHMgPSB7XG4gICAgd2F2ZWZvcm06J3NhdycsXG4gICAgYXR0YWNrOiA0NDEwMCxcbiAgICBkZWNheTogNDQxMDAsXG4gICAgZ2FpbjogMSxcbiAgICBwdWxzZXdpZHRoOi4yNSxcbiAgICBmcmVxdWVuY3k6MjIwLFxuICAgIHBhbjogLjUsXG4gICAgYW50aWFsaWFzOmZhbHNlLFxuICAgIHBhblZvaWNlczpmYWxzZSxcbiAgICBsb3VkbmVzczoxLFxuICAgIGdsaWRlOjEsXG4gICAgc2F0dXJhdGlvbjoxLFxuICAgIGZpbHRlck11bHQ6ODgwLFxuICAgIFE6OCxcbiAgICBjdXRvZmY6MTEwLFxuICAgIHJlc29uYW5jZTozLFxuICAgIGZpbHRlclR5cGU6MCxcbiAgICBpc0xvd1Bhc3M6MVxuICB9XG5cbiAgLy8gZG8gbm90IGluY2x1ZGUgdmVsb2NpdHksIHdoaWNoIHNob3VkbCBhbHdheXMgYmUgcGVyIHZvaWNlXG4gIGxldCBQb2x5U3ludGggPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBTeW50aCwgWydmcmVxdWVuY3knLCdhdHRhY2snLCdkZWNheScsJ3B1bHNld2lkdGgnLCdwYW4nLCdnYWluJywnZ2xpZGUnLCAnc2F0dXJhdGlvbicsICdmaWx0ZXJNdWx0JywgJ1EnLCAnY3V0b2ZmJywgJ3Jlc29uYW5jZSddICkgXG5cbiAgcmV0dXJuIFsgU3ludGgsIFBvbHlTeW50aCBdXG5cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgQmlub3BzID0ge1xuICAgIGV4cG9ydCggb2JqICkge1xuICAgICAgZm9yKCBsZXQga2V5IGluIEJpbm9wcyApIHtcbiAgICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgICAgb2JqWyBrZXkgXSA9IEJpbm9wc1sga2V5IF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgQWRkKCAuLi5hcmdzICkge1xuICAgICAgbGV0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHJldHVybiB7IGJpbm9wOnRydWUsIG9wOicrJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidhZGQnICsgaWQsIGlkIH1cbiAgICB9LFxuXG4gICAgU3ViKCAuLi5hcmdzICkge1xuICAgICAgbGV0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHJldHVybiB7IGJpbm9wOnRydWUsIG9wOictJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidzdWInICsgaWQsIGlkIH1cbiAgICB9LFxuXG4gICAgTXVsKCAuLi5hcmdzICkge1xuICAgICAgbGV0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHJldHVybiB7IGJpbm9wOnRydWUsIG9wOicqJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidtdWwnICsgaWQsIGlkIH1cbiAgICB9LFxuXG4gICAgRGl2KCAuLi5hcmdzICkge1xuICAgICAgbGV0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHJldHVybiB7IGJpbm9wOnRydWUsIG9wOicvJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidkaXYnICsgaWQsIGlkIH1cbiAgICB9LFxuXG4gICAgTW9kKCAuLi5hcmdzICkge1xuICAgICAgbGV0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHJldHVybiB7IGJpbm9wOnRydWUsIG9wOiclJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidtb2QnICsgaWQsIGlkIH1cbiAgICB9LCAgIFxuICB9XG5cbiAgcmV0dXJuIEJpbm9wc1xufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IEJ1cyA9IHsgXG4gICAgZmFjdG9yeTogbnVsbCwvL0dpYmJlcmlzaC5mYWN0b3J5KCBnLmFkZCggMCApICwgJ2J1cycsIFsgMCwgMSBdICApLFxuXG4gICAgY3JlYXRlKCkge1xuICAgICAgbGV0IGJ1cyA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgICAgXG4gICAgICBidXMuY2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IG91dHB1dCA9IDBcbiAgICAgICAvLyBvdXRwdXRbIDAgXSA9IG91dHB1dFsgMSBdID0gMFxuXG4gICAgICAgIGZvciggbGV0IGkgPSAwLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgb3V0cHV0ICs9IGFyZ3VtZW50c1sgaSBdXG4gICAgICAgICAgLy9vdXRwdXRbIDAgXSArPSBpbnB1dFxuICAgICAgICAgIC8vb3V0cHV0WyAxIF0gKz0gaW5wdXRcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXRwdXRcbiAgICAgIH1cblxuICAgICAgYnVzLmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIGJ1cy5kaXJ0eSA9IHRydWVcbiAgICAgIGJ1cy50eXBlID0gJ2J1cydcbiAgICAgIGJ1cy51Z2VuTmFtZSA9ICdidXNfJyArIGJ1cy5pZFxuICAgICAgYnVzLmlucHV0cyA9IFtdXG4gICAgICBidXMuaW5wdXROYW1lcyA9IFtdXG5cbiAgICAgIGJ1cy5jaGFpbiA9ICggdGFyZ2V0LCBsZXZlbCA9IDEgKSA9PiB7XG4gICAgICAgIHRoaXMuY29ubmVjdCggdGFyZ2V0LCBsZXZlbCApXG4gICAgICAgIHJldHVybiB0YXJnZXRcbiAgICAgIH1cblxuICAgICAgYnVzLmRpc2Nvbm5lY3RVZ2VuID0gKCB1Z2VuICkgPT4ge1xuICAgICAgICBsZXQgcmVtb3ZlSWR4ID0gLTFcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmlucHV0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBsZXQgaW5wdXQgPSB0aGlzLmlucHV0c1sgaSBdXG5cbiAgICAgICAgICBpZiggaXNOYU4oIGlucHV0ICkgJiYgdWdlbiA9PT0gaW5wdXQgKSB7XG4gICAgICAgICAgICByZW1vdmVJZHggPSBpXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKCByZW1vdmVJZHggIT09IC0xICkge1xuICAgICAgICAgIHRoaXMuaW5wdXRzLnNwbGljZSggcmVtb3ZlSWR4LCAxIClcbiAgICAgICAgICBHaWJiZXJpc2guZGlydHkoIHRoaXMgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiBidXNcbiAgICB9XG4gIH1cblxuICByZXR1cm4gQnVzLmNyZWF0ZVxuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBCdXMyID0geyBcbiAgICBjcmVhdGUoKSB7XG4gICAgICBsZXQgb3V0cHV0ID0gbmV3IEZsb2F0MzJBcnJheSggMiApXG5cbiAgICAgIGxldCBidXMgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuICAgICAgT2JqZWN0LmFzc2lnbiggYnVzLCB7XG4gICAgICAgIGNhbGxiYWNrKCkge1xuICAgICAgICAgIG91dHB1dFsgMCBdID0gb3V0cHV0WyAxIF0gPSAwXG5cbiAgICAgICAgICBmb3IoIGxldCBpID0gMCwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgbGV0IGlucHV0ID0gYXJndW1lbnRzWyBpIF0sXG4gICAgICAgICAgICAgICAgaXNBcnJheSA9IGlucHV0IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5XG5cbiAgICAgICAgICAgIG91dHB1dFsgMCBdICs9IGlzQXJyYXkgPyBpbnB1dFsgMCBdIDogaW5wdXRcbiAgICAgICAgICAgIG91dHB1dFsgMSBdICs9IGlzQXJyYXkgPyBpbnB1dFsgMSBdIDogaW5wdXRcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gb3V0cHV0XG4gICAgICAgIH0sXG4gICAgICAgIGlkIDogR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKCksXG4gICAgICAgIGRpcnR5IDogdHJ1ZSxcbiAgICAgICAgdHlwZSA6ICdidXMnLFxuICAgICAgICBpbnB1dHMgOiBbXSxcbiAgICAgICAgaW5wdXROYW1lcyA6IFtdLFxuICAgICAgfSlcblxuICAgICAgYnVzLnVnZW5OYW1lID0gYnVzLmNhbGxiYWNrLnVnZW5OYW1lID0gJ2J1czJfJyArIGJ1cy5pZFxuXG4gICAgICBidXMuZGlzY29ubmVjdFVnZW4gPSBmdW5jdGlvbiggdWdlbiApIHtcbiAgICAgICAgbGV0IHJlbW92ZUlkeCA9IHRoaXMuaW5wdXRzLmluZGV4T2YoIHVnZW4gKVxuICAgICAgICBcbiAgICAgICAgaWYoIHJlbW92ZUlkeCAhPT0gLTEgKSB7XG4gICAgICAgICAgdGhpcy5pbnB1dHMuc3BsaWNlKCByZW1vdmVJZHgsIDEgKVxuICAgICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdGhpcyApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIGJ1c1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBCdXMyLmNyZWF0ZVxuXG59XG5cbiIsImNvbnN0ICBnICAgID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgICksXG4gICAgICAgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBNb25vcHMgPSB7XG4gICAgZXhwb3J0KCBvYmogKSB7XG4gICAgICBmb3IoIGxldCBrZXkgaW4gTW9ub3BzICkge1xuICAgICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyApIHtcbiAgICAgICAgICBvYmpbIGtleSBdID0gTW9ub3BzWyBrZXkgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBBYnMoIGlucHV0ICkge1xuICAgICAgY29uc3QgYWJzID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBncmFwaCA9IGcuYWJzKCBnLmluKCdpbnB1dCcpIClcbiAgICAgIFxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIGFicywgZ3JhcGgsICdhYnMnLCBPYmplY3QuYXNzaWduKHt9LCBNb25vcHMuZGVmYXVsdHMsIHsgaW5wdXQgfSkgKVxuXG4gICAgICByZXR1cm4gYWJzXG4gICAgfSxcblxuICAgIFBvdyggaW5wdXQsIGV4cG9uZW50ICkge1xuICAgICAgY29uc3QgcG93ID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBncmFwaCA9IGcucG93KCBnLmluKCdpbnB1dCcpLCBnLmluKCdleHBvbmVudCcpIClcbiAgICAgIFxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHBvdywgZ3JhcGgsICdhYnMnLCBPYmplY3QuYXNzaWduKHt9LCBNb25vcHMuZGVmYXVsdHMsIHsgaW5wdXQsIGV4cG9uZW50IH0pIClcblxuICAgICAgcmV0dXJuIHBvd1xuICAgIH0sXG5cbiAgICBNZXJnZSggaW5wdXQgKSB7XG4gICAgICBjb25zdCBtZXJnZXIgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgICAgIGNvbnN0IGNiID0gZnVuY3Rpb24oIF9pbnB1dCApIHtcbiAgICAgICAgcmV0dXJuIF9pbnB1dFswXSArIF9pbnB1dFsxXVxuICAgICAgfVxuXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggbWVyZ2VyLCBnLmluKCAnaW5wdXQnICksICdtZXJnZScsIHsgaW5wdXQgfSwgY2IgKVxuICAgICAgbWVyZ2VyLnR5cGUgPSAnYW5hbHlzaXMnXG4gICAgICBtZXJnZXIuaW5wdXROYW1lcyA9IFsgJ2lucHV0JyBdXG4gICAgICBtZXJnZXIuaW5wdXRzID0gWyBpbnB1dCBdXG4gICAgICBtZXJnZXIuaW5wdXQgPSBpbnB1dFxuICAgICAgXG4gICAgICByZXR1cm4gbWVyZ2VyXG4gICAgfSxcbiAgfVxuXG4gIE1vbm9wcy5kZWZhdWx0cyA9IHsgaW5wdXQ6MCB9XG5cbiAgcmV0dXJuIE1vbm9wc1xufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbmxldCBmZWVkYmFja09zYyA9IGZ1bmN0aW9uKCBmcmVxdWVuY3ksIGZpbHRlciwgcHVsc2V3aWR0aD0uNSwgYXJndW1lbnRQcm9wcyApIHtcbiAgaWYoIGFyZ3VtZW50UHJvcHMgPT09IHVuZGVmaW5lZCApIGFyZ3VtZW50UHJvcHMgPSB7IHR5cGU6IDAgfVxuXG4gIGxldCBsYXN0U2FtcGxlID0gZy5oaXN0b3J5KCksXG4gICAgICAvLyBkZXRlcm1pbmUgcGhhc2UgaW5jcmVtZW50IGFuZCBtZW1vaXplIHJlc3VsdFxuICAgICAgdyA9IGcubWVtbyggZy5kaXYoIGZyZXF1ZW5jeSwgZy5nZW4uc2FtcGxlcmF0ZSApICksXG4gICAgICAvLyBjcmVhdGUgc2NhbGluZyBmYWN0b3JcbiAgICAgIG4gPSBnLnN1YiggLS41LCB3ICksXG4gICAgICBzY2FsaW5nID0gZy5tdWwoIGcubXVsKCAxMywgZmlsdGVyICksIGcucG93KCBuLCA1ICkgKSxcbiAgICAgIC8vIGNhbGN1bGF0ZSBkYyBvZmZzZXQgYW5kIG5vcm1hbGl6YXRpb24gZmFjdG9yc1xuICAgICAgREMgPSBnLnN1YiggLjM3NiwgZy5tdWwoIHcsIC43NTIgKSApLFxuICAgICAgbm9ybSA9IGcuc3ViKCAxLCBnLm11bCggMiwgdyApICksXG4gICAgICAvLyBkZXRlcm1pbmUgcGhhc2VcbiAgICAgIG9zYzFQaGFzZSA9IGcuYWNjdW0oIHcsIDAsIHsgbWluOi0xIH0pLFxuICAgICAgb3NjMSwgb3V0XG5cbiAgLy8gY3JlYXRlIGN1cnJlbnQgc2FtcGxlLi4uIGZyb20gdGhlIHBhcGVyOlxuICAvLyBvc2MgPSAob3NjICsgc2luKDIqcGkqKHBoYXNlICsgb3NjKnNjYWxpbmcpKSkqMC41ZjtcbiAgb3NjMSA9IGcubWVtbyggXG4gICAgZy5tdWwoXG4gICAgICBnLmFkZChcbiAgICAgICAgbGFzdFNhbXBsZS5vdXQsXG4gICAgICAgIGcuc2luKFxuICAgICAgICAgIGcubXVsKFxuICAgICAgICAgICAgTWF0aC5QSSAqIDIsXG4gICAgICAgICAgICBnLm1lbW8oIGcuYWRkKCBvc2MxUGhhc2UsIGcubXVsKCBsYXN0U2FtcGxlLm91dCwgc2NhbGluZyApICkgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIC41XG4gICAgKVxuICApXG5cbiAgLy8gc3RvcmUgc2FtcGxlIHRvIHVzZSBhcyBtb2R1bGF0aW9uXG4gIGxhc3RTYW1wbGUuaW4oIG9zYzEgKVxuXG4gIC8vIGlmIHB3bSAvIHNxdWFyZSB3YXZlZm9ybSBpbnN0ZWFkIG9mIHNhd3Rvb3RoLi4uXG4gIGlmKCBhcmd1bWVudFByb3BzLnR5cGUgPT09IDEgKSB7IFxuICAgIGNvbnN0IGxhc3RTYW1wbGUyID0gZy5oaXN0b3J5KCkgLy8gZm9yIG9zYyAyXG4gICAgY29uc3QgbGFzdFNhbXBsZU1hc3RlciA9IGcuaGlzdG9yeSgpIC8vIGZvciBzdW0gb2Ygb3NjMSxvc2MyXG5cbiAgICBjb25zdCBvc2MyID0gZy5tdWwoXG4gICAgICBnLmFkZChcbiAgICAgICAgbGFzdFNhbXBsZTIub3V0LFxuICAgICAgICBnLnNpbihcbiAgICAgICAgICBnLm11bChcbiAgICAgICAgICAgIE1hdGguUEkgKiAyLFxuICAgICAgICAgICAgZy5tZW1vKCBnLmFkZCggb3NjMVBoYXNlLCBnLm11bCggbGFzdFNhbXBsZTIub3V0LCBzY2FsaW5nICksIHB1bHNld2lkdGggKSApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApLFxuICAgICAgLjVcbiAgICApXG5cbiAgICBsYXN0U2FtcGxlMi5pbiggb3NjMiApXG4gICAgb3V0ID0gZy5tZW1vKCBnLnN1YiggbGFzdFNhbXBsZS5vdXQsIGxhc3RTYW1wbGUyLm91dCApIClcbiAgICBvdXQgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggMi41LCBvdXQgKSwgZy5tdWwoIC0xLjUsIGxhc3RTYW1wbGVNYXN0ZXIub3V0ICkgKSApXG4gICAgXG4gICAgbGFzdFNhbXBsZU1hc3Rlci5pbiggZy5zdWIoIG9zYzEsIG9zYzIgKSApXG5cbiAgfWVsc2V7XG4gICAgIC8vIG9mZnNldCBhbmQgbm9ybWFsaXplXG4gICAgb3NjMSA9IGcuYWRkKCBnLm11bCggMi41LCBvc2MxICksIGcubXVsKCAtMS41LCBsYXN0U2FtcGxlLm91dCApIClcbiAgICBvc2MxID0gZy5hZGQoIG9zYzEsIERDIClcbiBcbiAgICBvdXQgPSBvc2MxXG4gIH1cblxuICByZXR1cm4gZy5tdWwoIG91dCwgbm9ybSApXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmVlZGJhY2tPc2NcbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgICAgZmVlZGJhY2tPc2MgPSByZXF1aXJlKCAnLi9mbWZlZWRiYWNrb3NjLmpzJyApXG5cbi8vICBfX21ha2VPc2NpbGxhdG9yX18oIHR5cGUsIGZyZXF1ZW5jeSwgYW50aWFsaWFzICkge1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBsZXQgT3NjaWxsYXRvcnMgPSB7XG4gICAgZXhwb3J0KCBvYmogKSB7XG4gICAgICBmb3IoIGxldCBrZXkgaW4gT3NjaWxsYXRvcnMgKSB7XG4gICAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgICAgIG9ialsga2V5IF0gPSBPc2NpbGxhdG9yc1sga2V5IF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBXYXZldGFibGU6IHJlcXVpcmUoICcuL3dhdmV0YWJsZS5qcycgKSggR2liYmVyaXNoICksXG4gICAgXG4gICAgU3F1YXJlKCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3Qgc3FyICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICkgXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oeyBhbnRpYWxpYXM6ZmFsc2UgfSwgT3NjaWxsYXRvcnMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgICAgY29uc3Qgb3NjICAgPSBPc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5pbiggJ2ZyZXF1ZW5jeScgKSwgcHJvcHMuYW50aWFsaWFzIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIG9zYywgZy5pbignZ2FpbicgKSApXG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzcXIsIGdyYXBoLCAnc3FyJywgcHJvcHMgKVxuXG4gICAgICByZXR1cm4gc3FyXG4gICAgfSxcblxuICAgIFBXTSggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHB3bSAgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApIFxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHsgYW50aWFsaWFzOmZhbHNlLCBwdWxzZXdpZHRoOi4yNSB9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgICBjb25zdCBvc2MgICA9IE9zY2lsbGF0b3JzLmZhY3RvcnkoICdwd20nLCBnLmluKCAnZnJlcXVlbmN5JyApLCBwcm9wcy5hbnRpYWxpYXMgKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLm11bCggb3NjLCBnLmluKCdnYWluJyApIClcblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHB3bSwgZ3JhcGgsICdwd20nLCBwcm9wcyApXG5cbiAgICAgIHJldHVybiBwd21cbiAgICB9LFxuXG4gICAgU2luZSggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHNpbmUgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIE9zY2lsbGF0b3JzLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIGcuY3ljbGUoIGcuaW4oJ2ZyZXF1ZW5jeScpICksIGcuaW4oJ2dhaW4nKSApXG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzaW5lLCBncmFwaCwgJ3NpbmUnLCBwcm9wcyApXG4gICAgICBcbiAgICAgIHJldHVybiBzaW5lXG4gICAgfSxcblxuICAgIE5vaXNlKCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3Qgbm9pc2UgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIHsgZ2FpbjogMSB9LCBpbnB1dFByb3BzIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIGcubm9pc2UoKSwgZy5pbignZ2FpbicpIClcbiAgICAgICAgXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggbm9pc2UsIGdyYXBoLCAnbm9pc2UnLCBwcm9wcyApXG5cbiAgICAgIHJldHVybiBub2lzZVxuICAgIH0sXG5cbiAgICBTYXcoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBzYXcgICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSBcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7IGFudGlhbGlhczpmYWxzZSB9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgICBjb25zdCBvc2MgICA9IE9zY2lsbGF0b3JzLmZhY3RvcnkoICdzYXcnLCBnLmluKCAnZnJlcXVlbmN5JyApLCBwcm9wcy5hbnRpYWxpYXMgKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLm11bCggb3NjLCBnLmluKCdnYWluJyApIClcblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHNhdywgZ3JhcGgsICdzYXcnLCBwcm9wcyApXG5cbiAgICAgIHJldHVybiBzYXdcbiAgICB9LFxuXG4gICAgUmV2ZXJzZVNhdyggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHNhdyAgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApIFxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHsgYW50aWFsaWFzOmZhbHNlIH0sIE9zY2lsbGF0b3JzLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICAgIGNvbnN0IG9zYyAgID0gZy5zdWIoIDEsIE9zY2lsbGF0b3JzLmZhY3RvcnkoICdzYXcnLCBnLmluKCAnZnJlcXVlbmN5JyApLCBwcm9wcy5hbnRpYWxpYXMgKSApXG4gICAgICBjb25zdCBncmFwaCA9IGcubXVsKCBvc2MsIGcuaW4oICdnYWluJyApIClcblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHNhdywgZ3JhcGgsICdyc2F3JywgcHJvcHMgKVxuICAgICAgXG4gICAgICByZXR1cm4gc2F3XG4gICAgfSxcblxuICAgIGZhY3RvcnkoIHR5cGUsIGZyZXF1ZW5jeSwgYW50aWFsaWFzPWZhbHNlICkge1xuICAgICAgbGV0IG9zY1xuXG4gICAgICBzd2l0Y2goIHR5cGUgKSB7XG4gICAgICAgIGNhc2UgJ3Nhdyc6XG4gICAgICAgICAgaWYoIGFudGlhbGlhcyA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICBvc2MgPSBnLnBoYXNvciggZnJlcXVlbmN5IClcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIG9zYyA9IGZlZWRiYWNrT3NjKCBmcmVxdWVuY3ksIDEgKVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgICBpZiggYW50aWFsaWFzID09PSB0cnVlICkge1xuICAgICAgICAgICAgb3NjID0gZmVlZGJhY2tPc2MoIGZyZXF1ZW5jeSwgMSwgLjUsIHsgdHlwZToxIH0pXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBvc2MgPSBnLndhdmV0YWJsZSggZnJlcXVlbmN5LCB7IGJ1ZmZlcjpPc2NpbGxhdG9ycy5TcXVhcmUuYnVmZmVyLCBuYW1lOidzcXVhcmUnIH0gKVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2luZSc6XG4gICAgICAgICAgb3NjID0gZy5jeWNsZSggZnJlcXVlbmN5IClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncHdtJzpcbiAgICAgICAgICBsZXQgcHVsc2V3aWR0aCA9IGcuaW4oJ3B1bHNld2lkdGgnKVxuICAgICAgICAgIGlmKCBhbnRpYWxpYXMgPT09IHRydWUgKSB7XG4gICAgICAgICAgICBvc2MgPSBmZWVkYmFja09zYyggZnJlcXVlbmN5LCAxLCBwdWxzZXdpZHRoLCB7IHR5cGU6MSB9KVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgbGV0IHBoYXNlID0gZy5waGFzb3IoIGZyZXF1ZW5jeSwgMCwgeyBtaW46MCB9IClcbiAgICAgICAgICAgIG9zYyA9IGcubHQoIHBoYXNlLCBwdWxzZXdpZHRoIClcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvc2NcbiAgICB9XG4gIH1cblxuICBPc2NpbGxhdG9ycy5TcXVhcmUuYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggMTAyNCApXG5cbiAgZm9yKCBsZXQgaSA9IDEwMjM7IGkgPj0gMDsgaS0tICkgeyBcbiAgICBPc2NpbGxhdG9ycy5TcXVhcmUuYnVmZmVyIFsgaSBdID0gaSAvIDEwMjQgPiAuNSA/IDEgOiAtMVxuICB9XG5cbiAgT3NjaWxsYXRvcnMuZGVmYXVsdHMgPSB7XG4gICAgZnJlcXVlbmN5OiA0NDAsXG4gICAgZ2FpbjogMVxuICB9XG5cbiAgcmV0dXJuIE9zY2lsbGF0b3JzXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IFdhdmV0YWJsZSA9IGZ1bmN0aW9uKCBpbnB1dFByb3BzICkge1xuICAgIGNvbnN0IHdhdmV0YWJsZSA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgIGNvbnN0IHByb3BzICA9IE9iamVjdC5hc3NpZ24oe30sIEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgY29uc3Qgb3NjID0gZy53YXZldGFibGUoIGcuaW4oJ2ZyZXF1ZW5jeScpLCBwcm9wcyApXG4gICAgY29uc3QgZ3JhcGggPSBnLm11bCggXG4gICAgICBvc2MsIFxuICAgICAgZy5pbiggJ2dhaW4nIClcbiAgICApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggd2F2ZXRhYmxlLCBncmFwaCwgJ3dhdmV0YWJsZScsIHByb3BzIClcblxuICAgIHJldHVybiB3YXZldGFibGVcbiAgfVxuXG4gIGcud2F2ZXRhYmxlID0gZnVuY3Rpb24oIGZyZXF1ZW5jeSwgcHJvcHMgKSB7XG4gICAgbGV0IGRhdGFQcm9wcyA9IHsgaW1tdXRhYmxlOnRydWUgfVxuXG4gICAgLy8gdXNlIGdsb2JhbCByZWZlcmVuY2VzIGlmIGFwcGxpY2FibGVcbiAgICBpZiggcHJvcHMubmFtZSAhPT0gdW5kZWZpbmVkICkgZGF0YVByb3BzLmdsb2JhbCA9IHByb3BzLm5hbWVcblxuICAgIGNvbnN0IGJ1ZmZlciA9IGcuZGF0YSggcHJvcHMuYnVmZmVyLCAxLCBkYXRhUHJvcHMgKVxuXG4gICAgcmV0dXJuIGcucGVlayggYnVmZmVyLCBnLnBoYXNvciggZnJlcXVlbmN5LCAwLCB7IG1pbjowIH0gKSApXG4gIH1cblxuICByZXR1cm4gV2F2ZXRhYmxlXG59XG4iLCJjb25zdCBRdWV1ZSA9IHJlcXVpcmUoICcuLi9leHRlcm5hbC9wcmlvcml0eXF1ZXVlLmpzJyApXG5jb25zdCBCaWcgICA9IHJlcXVpcmUoICdiaWcuanMnIClcblxubGV0IFNjaGVkdWxlciA9IHtcbiAgcGhhc2U6IDAsXG5cbiAgcXVldWU6IG5ldyBRdWV1ZSggKCBhLCBiICkgPT4ge1xuICAgIGlmKCBhLnRpbWUgPT09IGIudGltZSApIHsgLy9hLnRpbWUuZXEoIGIudGltZSApICkge1xuICAgICAgcmV0dXJuIGIucHJpb3JpdHkgLSBhLnByaW9yaXR5XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gYS50aW1lIC0gYi50aW1lIC8vYS50aW1lLm1pbnVzKCBiLnRpbWUgKVxuICAgIH1cbiAgfSksXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5xdWV1ZS5kYXRhLmxlbmd0aCA9IDBcbiAgICB0aGlzLnF1ZXVlLmxlbmd0aCA9IDBcbiAgfSxcblxuICBhZGQoIHRpbWUsIGZ1bmMsIHByaW9yaXR5ID0gMCApIHtcbiAgICB0aW1lICs9IHRoaXMucGhhc2VcblxuICAgIHRoaXMucXVldWUucHVzaCh7IHRpbWUsIGZ1bmMsIHByaW9yaXR5IH0pXG4gIH0sXG5cbiAgdGljaygpIHtcbiAgICBpZiggdGhpcy5xdWV1ZS5sZW5ndGggKSB7XG4gICAgICBsZXQgbmV4dCA9IHRoaXMucXVldWUucGVlaygpXG5cbiAgICAgIHdoaWxlKCB0aGlzLnBoYXNlID49IG5leHQudGltZSApIHtcbiAgICAgICAgbmV4dC5mdW5jKClcbiAgICAgICAgdGhpcy5xdWV1ZS5wb3AoKVxuICAgICAgICBuZXh0ID0gdGhpcy5xdWV1ZS5wZWVrKClcbiAgICAgIH1cblxuICAgIH1cblxuICAgIHRoaXMucGhhc2UrK1xuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjaGVkdWxlclxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBjb25zdCBfX3Byb3RvX18gPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuICBPYmplY3QuYXNzaWduKCBfX3Byb3RvX18sIHtcbiAgICBzdGFydCgpIHtcbiAgICAgIHRoaXMuY29ubmVjdCgpXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG4gICAgc3RvcCgpIHtcbiAgICAgIHRoaXMuZGlzY29ubmVjdCgpXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgfSlcblxuICBjb25zdCBTZXEyID0geyBcbiAgICBjcmVhdGUoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBzZXEgPSBPYmplY3QuY3JlYXRlKCBfX3Byb3RvX18gKSxcbiAgICAgICAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgU2VxMi5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG5cbiAgICAgIHNlcS5waGFzZSA9IDBcbiAgICAgIHNlcS5pbnB1dE5hbWVzID0gWyAncmF0ZScgXVxuICAgICAgc2VxLmlucHV0cyA9IFsgMSBdXG4gICAgICBzZXEubmV4dFRpbWUgPSAwXG4gICAgICBzZXEudmFsdWVzUGhhc2UgPSAwXG4gICAgICBzZXEudGltaW5nc1BoYXNlID0gMFxuICAgICAgc2VxLmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHNlcS5kaXJ0eSA9IHRydWVcbiAgICAgIHNlcS50eXBlID0gJ3NlcSdcblxuICAgICAgaWYoIHByb3BzLnRhcmdldCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICBzZXEuYW5vbkZ1bmN0aW9uID0gdHJ1ZVxuICAgICAgfWVsc2V7IFxuICAgICAgICBzZXEuYW5vbkZ1bmN0aW9uID0gZmFsc2VcbiAgICAgICAgc2VxLmNhbGxGdW5jdGlvbiA9IHR5cGVvZiBwcm9wcy50YXJnZXRbIHByb3BzLmtleSBdID09PSAnZnVuY3Rpb24nXG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5hc3NpZ24oIHNlcSwgcHJvcHMgKVxuXG4gICAgICBzZXEuY2FsbGJhY2sgPSBmdW5jdGlvbiggcmF0ZSApIHtcbiAgICAgICAgaWYoIHNlcS5waGFzZSA+PSBzZXEubmV4dFRpbWUgKSB7XG4gICAgICAgICAgbGV0IHZhbHVlID0gc2VxLnZhbHVlc1sgc2VxLnZhbHVlc1BoYXNlKysgJSBzZXEudmFsdWVzLmxlbmd0aCBdXG5cbiAgICAgICAgICBpZiggc2VxLmFub25GdW5jdGlvbiB8fCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgKSB2YWx1ZSA9IHZhbHVlKClcbiAgICAgICAgICBcbiAgICAgICAgICBpZiggc2VxLmFub25GdW5jdGlvbiA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICBpZiggc2VxLmNhbGxGdW5jdGlvbiA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICAgIHNlcS50YXJnZXRbIHNlcS5rZXkgXSA9IHZhbHVlXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgc2VxLnRhcmdldFsgc2VxLmtleSBdKCB2YWx1ZSApIFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlcS5waGFzZSAtPSBzZXEubmV4dFRpbWVcblxuICAgICAgICAgIGxldCB0aW1pbmcgPSBzZXEudGltaW5nc1sgc2VxLnRpbWluZ3NQaGFzZSsrICUgc2VxLnRpbWluZ3MubGVuZ3RoIF1cbiAgICAgICAgICBpZiggdHlwZW9mIHRpbWluZyA9PT0gJ2Z1bmN0aW9uJyApIHRpbWluZyA9IHRpbWluZygpXG5cbiAgICAgICAgICBzZXEubmV4dFRpbWUgPSB0aW1pbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHNlcS5waGFzZSArPSByYXRlXG5cbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cblxuICAgICAgc2VxLnVnZW5OYW1lID0gc2VxLmNhbGxiYWNrLnVnZW5OYW1lID0gJ3NlcV8nICsgc2VxLmlkXG4gICAgICBcbiAgICAgIGxldCB2YWx1ZSA9IHNlcS5yYXRlXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHNlcSwgJ3JhdGUnLCB7XG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHZhbHVlIH0sXG4gICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICBpZiggdmFsdWUgIT09IHYgKSB7XG4gICAgICAgICAgICBHaWJiZXJpc2guZGlydHkoIHNlcSApXG4gICAgICAgICAgICB2YWx1ZSA9IHZcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBzZXFcbiAgICB9XG4gIH1cblxuICBTZXEyLmRlZmF1bHRzID0geyByYXRlOiAxIH1cblxuICByZXR1cm4gU2VxMi5jcmVhdGVcblxufVxuXG4iLCJjb25zdCBRdWV1ZSA9IHJlcXVpcmUoICcuLi9leHRlcm5hbC9wcmlvcml0eXF1ZXVlLmpzJyApXG5jb25zdCBCaWcgICA9IHJlcXVpcmUoICdiaWcuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG5sZXQgU2VxdWVuY2VyID0gcHJvcHMgPT4ge1xuICBsZXQgc2VxID0ge1xuICAgIF9faXNSdW5uaW5nOmZhbHNlLFxuICAgIGtleTogcHJvcHMua2V5LCBcbiAgICB0YXJnZXQ6ICBwcm9wcy50YXJnZXQsXG4gICAgdmFsdWVzOiAgcHJvcHMudmFsdWVzLFxuICAgIHRpbWluZ3M6IHByb3BzLnRpbWluZ3MsXG4gICAgX192YWx1ZXNQaGFzZTogIDAsXG4gICAgX190aW1pbmdzUGhhc2U6IDAsXG4gICAgcHJpb3JpdHk6IHByb3BzLnByaW9yaXR5ID09PSB1bmRlZmluZWQgPyAwIDogcHJvcHMucHJpb3JpdHksXG5cbiAgICB0aWNrKCkge1xuICAgICAgbGV0IHZhbHVlICA9IHNlcS52YWx1ZXNbICBzZXEuX192YWx1ZXNQaGFzZSsrICAlIHNlcS52YWx1ZXMubGVuZ3RoICBdLFxuICAgICAgICAgIHRpbWluZyA9IHNlcS50aW1pbmdzWyBzZXEuX190aW1pbmdzUGhhc2UrKyAlIHNlcS50aW1pbmdzLmxlbmd0aCBdXG5cbiAgICAgIGlmKCB0eXBlb2YgdGltaW5nID09PSAnZnVuY3Rpb24nICkgdGltaW5nID0gdGltaW5nKClcblxuICAgICAgaWYoIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBzZXEudGFyZ2V0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHZhbHVlKClcbiAgICAgIH1lbHNlIGlmKCB0eXBlb2Ygc2VxLnRhcmdldFsgc2VxLmtleSBdID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgICBpZiggdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICkgdmFsdWUgPSB2YWx1ZSgpXG4gICAgICAgIHNlcS50YXJnZXRbIHNlcS5rZXkgXSggdmFsdWUgKVxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgKSB2YWx1ZSA9IHZhbHVlKClcbiAgICAgICAgc2VxLnRhcmdldFsgc2VxLmtleSBdID0gdmFsdWVcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYoIHNlcS5fX2lzUnVubmluZyA9PT0gdHJ1ZSApIHtcbiAgICAgICAgR2liYmVyaXNoLnNjaGVkdWxlci5hZGQoIHRpbWluZywgc2VxLnRpY2ssIHNlcS5wcmlvcml0eSApXG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0YXJ0KCBkZWxheSA9IDAgKSB7XG4gICAgICBzZXEuX19pc1J1bm5pbmcgPSB0cnVlXG4gICAgICBHaWJiZXJpc2guc2NoZWR1bGVyLmFkZCggZGVsYXksIHNlcS50aWNrLCBzZXEucHJpb3JpdHkgKVxuICAgICAgcmV0dXJuIHNlcVxuICAgIH0sXG5cbiAgICBzdG9wKCkge1xuICAgICAgc2VxLl9faXNSdW5uaW5nID0gZmFsc2VcbiAgICAgIHJldHVybiBzZXFcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc2VxIFxufVxuXG5TZXF1ZW5jZXIubWFrZSA9IGZ1bmN0aW9uKCB2YWx1ZXMsIHRpbWluZ3MsIHRhcmdldCwga2V5ICkge1xuICByZXR1cm4gU2VxdWVuY2VyKHsgdmFsdWVzLCB0aW1pbmdzLCB0YXJnZXQsIGtleSB9KVxufVxuXG5yZXR1cm4gU2VxdWVuY2VyXG5cbn1cbiIsImxldCB1Z2VuID0ge1xuICBmcmVlKCkge1xuICAgIEdpYmJlcmlzaC5nZW5pc2guZ2VuLmZyZWUoIHRoaXMuZ3JhcGggKVxuICB9LFxuXG4gIHByaW50KCkge1xuICAgIGNvbnNvbGUubG9nKCB0aGlzLmNhbGxiYWNrLnRvU3RyaW5nKCkgKVxuICB9LFxuXG4gIGNvbm5lY3QoIHRhcmdldCwgbGV2ZWw9MSApIHtcbiAgICBpZiggdGhpcy5jb25uZWN0ZWQgPT09IHVuZGVmaW5lZCApIHRoaXMuY29ubmVjdGVkID0gW11cblxuICAgIGxldCBpbnB1dCA9IGxldmVsID09PSAxID8gdGhpcyA6IEdpYmJlcmlzaC5iaW5vcHMuTXVsKCB0aGlzLCBsZXZlbCApXG5cbiAgICBpZiggdGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsICkgdGFyZ2V0ID0gR2liYmVyaXNoLm91dHB1dCBcblxuICAgIGlmKCB0YXJnZXQuaW5wdXRzIClcbiAgICAgIHRhcmdldC5pbnB1dHMucHVzaCggaW5wdXQgKVxuICAgIGVsc2VcbiAgICAgIHRhcmdldC5pbnB1dCA9IGlucHV0XG5cbiAgICBHaWJiZXJpc2guZGlydHkoIHRhcmdldCApXG5cbiAgICB0aGlzLmNvbm5lY3RlZC5wdXNoKFsgdGFyZ2V0LCBpbnB1dCBdKVxuICAgIFxuICAgIHJldHVybiB0aGlzXG4gIH0sXG5cbiAgZGlzY29ubmVjdCggdGFyZ2V0ICkge1xuICAgIGlmKCB0YXJnZXQgPT09IHVuZGVmaW5lZCApe1xuICAgICAgZm9yKCBsZXQgY29ubmVjdGlvbiBvZiB0aGlzLmNvbm5lY3RlZCApIHtcbiAgICAgICAgY29ubmVjdGlvblswXS5kaXNjb25uZWN0VWdlbiggY29ubmVjdGlvblsxXSApXG4gICAgICB9XG4gICAgICB0aGlzLmNvbm5lY3RlZC5sZW5ndGggPSAwXG4gICAgfWVsc2V7XG4gICAgICBjb25zdCBjb25uZWN0aW9uID0gdGhpcy5jb25uZWN0ZWQuZmluZCggdiA9PiB2WzBdID09PSB0YXJnZXQgKVxuICAgICAgdGFyZ2V0LmRpc2Nvbm5lY3RVZ2VuKCBjb25uZWN0aW9uWzFdIClcbiAgICAgIGNvbnN0IHRhcmdldElkeCA9IHRoaXMuY29ubmVjdGVkLmluZGV4T2YoIGNvbm5lY3Rpb24gKVxuICAgICAgdGhpcy5jb25uZWN0ZWQuc3BsaWNlKCB0YXJnZXRJZHgsIDEgKVxuICAgIH1cbiAgfSxcblxuICBjaGFpbiggdGFyZ2V0LCBsZXZlbD0xICkge1xuICAgIHRoaXMuY29ubmVjdCggdGFyZ2V0LGxldmVsIClcblxuICAgIHJldHVybiB0YXJnZXRcbiAgfSxcblxuICBfX3JlZG9HcmFwaCgpIHtcbiAgICB0aGlzLl9fY3JlYXRlR3JhcGgoKVxuICAgIHRoaXMuY2FsbGJhY2sgPSBHaWJiZXJpc2guZ2VuaXNoLmdlbi5jcmVhdGVDYWxsYmFjayggdGhpcy5ncmFwaCwgR2liYmVyaXNoLm1lbW9yeSwgZmFsc2UsIHRydWUgKVxuICAgIHRoaXMuaW5wdXROYW1lcyA9IEdpYmJlcmlzaC5nZW5pc2guZ2VuLnBhcmFtZXRlcnMuc2xpY2UoMClcbiAgICB0aGlzLmNhbGxiYWNrLnVnZW5OYW1lID0gdGhpcy51Z2VuTmFtZVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHVnZW5cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgbGV0IHVpZCA9IDBcblxuICBsZXQgZmFjdG9yeSA9IGZ1bmN0aW9uKCB1Z2VuLCBncmFwaCwgbmFtZSwgdmFsdWVzLCBjYiApIHtcbiAgICB1Z2VuLmNhbGxiYWNrID0gY2IgPT09IHVuZGVmaW5lZCA/IEdpYmJlcmlzaC5nZW5pc2guZ2VuLmNyZWF0ZUNhbGxiYWNrKCBncmFwaCwgR2liYmVyaXNoLm1lbW9yeSwgZmFsc2UsIHRydWUgKSA6IGNiXG5cbiAgICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgICB0eXBlOiAndWdlbicsXG4gICAgICBpZDogZmFjdG9yeS5nZXRVSUQoKSwgXG4gICAgICB1Z2VuTmFtZTogbmFtZSArICdfJyxcbiAgICAgIGdyYXBoOiBncmFwaCxcbiAgICAgIGlucHV0TmFtZXM6IEdpYmJlcmlzaC5nZW5pc2guZ2VuLnBhcmFtZXRlcnMuc2xpY2UoMCksXG4gICAgICBpc1N0ZXJlbzogQXJyYXkuaXNBcnJheSggZ3JhcGggKSxcbiAgICAgIGRpcnR5OiB0cnVlXG4gICAgfSlcbiAgICBcbiAgICB1Z2VuLnVnZW5OYW1lICs9IHVnZW4uaWRcbiAgICB1Z2VuLmNhbGxiYWNrLnVnZW5OYW1lID0gdWdlbi51Z2VuTmFtZSAvLyBYWFggaGFja3lcblxuICAgIGZvciggbGV0IHBhcmFtIG9mIHVnZW4uaW5wdXROYW1lcyApIHtcbiAgICAgIGlmKCBwYXJhbSA9PT0gJ21lbW9yeScgKSBjb250aW51ZVxuXG4gICAgICBsZXQgdmFsdWUgPSB2YWx1ZXNbIHBhcmFtIF1cblxuICAgICAgLy8gVE9ETzogZG8gd2UgbmVlZCB0byBjaGVjayBmb3IgYSBzZXR0ZXI/XG4gICAgICBsZXQgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoIHVnZW4sIHBhcmFtICksXG4gICAgICAgICAgc2V0dGVyXG5cbiAgICAgIGlmKCBkZXNjICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHNldHRlciA9IGRlc2Muc2V0XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgcGFyYW0sIHtcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gdmFsdWUgfSxcbiAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgIGlmKCB2YWx1ZSAhPT0gdiApIHtcbiAgICAgICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdWdlbiApXG4gICAgICAgICAgICBpZiggc2V0dGVyICE9PSB1bmRlZmluZWQgKSBzZXR0ZXIoIHYgKVxuICAgICAgICAgICAgdmFsdWUgPSB2XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmKCB1Z2VuLl9fcmVxdWlyZXNSZWNvbXBpbGF0aW9uICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICB1Z2VuLl9fcmVxdWlyZXNSZWNvbXBpbGF0aW9uLmZvckVhY2goIHByb3AgPT4ge1xuICAgICAgICBsZXQgdmFsdWUgPSB1Z2VuWyBwcm9wIF1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCBwcm9wLCB7XG4gICAgICAgICAgZ2V0KCkgeyByZXR1cm4gdmFsdWUgfSxcbiAgICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgICBpZiggdmFsdWUgIT09IHYgKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gdlxuICAgICAgICAgICAgICB0aGlzLl9fcmVkb0dyYXBoKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9KSAgICAgIFxuICAgIH1cbiAgICByZXR1cm4gdWdlblxuICB9XG5cbiAgZmFjdG9yeS5nZXRVSUQgPSAoKSA9PiB1aWQrK1xuXG4gIHJldHVybiBmYWN0b3J5XG59XG4iLCJsZXQgZ2VuaXNoID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbmxldCB1dGlsaXRpZXMgPSB7XG4gIGNyZWF0ZUNvbnRleHQoKSB7XG4gICAgbGV0IEFDID0gdHlwZW9mIEF1ZGlvQ29udGV4dCA9PT0gJ3VuZGVmaW5lZCcgPyB3ZWJraXRBdWRpb0NvbnRleHQgOiBBdWRpb0NvbnRleHRcbiAgICBHaWJiZXJpc2guY3R4ID0gbmV3IEFDKClcbiAgICBnZW5pc2guZ2VuLnNhbXBsZXJhdGUgPSBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGVcbiAgICBnZW5pc2gudXRpbGl0aWVzLmN0eCA9IEdpYmJlcmlzaC5jdHhcblxuICAgIGxldCBzdGFydCA9ICgpID0+IHtcbiAgICAgIGlmKCB0eXBlb2YgQUMgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICBpZiggZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG5cbiAgICAgICAgICBpZiggJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICl7IC8vIHJlcXVpcmVkIHRvIHN0YXJ0IGF1ZGlvIHVuZGVyIGlPUyA2XG4gICAgICAgICAgICBsZXQgbXlTb3VyY2UgPSB1dGlsaXRpZXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICAgICAgICBteVNvdXJjZS5jb25uZWN0KCB1dGlsaXRpZXMuY3R4LmRlc3RpbmF0aW9uIClcbiAgICAgICAgICAgIG15U291cmNlLm5vdGVPbiggMCApXG4gICAgICAgICAgfVxuICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuICAgIH1cblxuICAgIHJldHVybiBHaWJiZXJpc2guY3R4XG4gIH0sXG5cbiAgY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCkge1xuICAgIEdpYmJlcmlzaC5ub2RlID0gR2liYmVyaXNoLmN0eC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoIDEwMjQsIDAsIDIgKSxcbiAgICBHaWJiZXJpc2guY2xlYXJGdW5jdGlvbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMCB9LFxuICAgIEdpYmJlcmlzaC5jYWxsYmFjayA9IEdpYmJlcmlzaC5jbGVhckZ1bmN0aW9uXG5cbiAgICBHaWJiZXJpc2gubm9kZS5vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uKCBhdWRpb1Byb2Nlc3NpbmdFdmVudCApIHtcbiAgICAgIGxldCBnaWJiZXJpc2ggPSBHaWJiZXJpc2gsXG4gICAgICAgICAgY2FsbGJhY2sgID0gZ2liYmVyaXNoLmNhbGxiYWNrLFxuICAgICAgICAgIG91dHB1dEJ1ZmZlciA9IGF1ZGlvUHJvY2Vzc2luZ0V2ZW50Lm91dHB1dEJ1ZmZlcixcbiAgICAgICAgICBzY2hlZHVsZXIgPSBHaWJiZXJpc2guc2NoZWR1bGVyLFxuICAgICAgICAgIC8vb2JqcyA9IGdpYmJlcmlzaC5jYWxsYmFja1VnZW5zLnNsaWNlKCAwICksXG4gICAgICAgICAgbGVuZ3RoXG5cbiAgICAgIGxldCBsZWZ0ID0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAwICksXG4gICAgICAgICAgcmlnaHQ9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMSApXG5cbiAgICAgIGxldCBjYWxsYmFja2xlbmd0aCA9IEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5sZW5ndGhcbiAgICAgIFxuICAgICAgaWYoIGNhbGxiYWNrbGVuZ3RoICE9PSAwICkge1xuICAgICAgICBmb3IoIGxldCBpPTA7IGk8IGNhbGxiYWNrbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzWyBpIF0oKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2FuJ3QganVzdCBzZXQgbGVuZ3RoIHRvIDAgYXMgY2FsbGJhY2tzIG1pZ2h0IGJlIGFkZGVkIGR1cmluZyBmb3IgbG9vcCwgc28gc3BsaWNlIHByZS1leGlzdGluZyBmdW5jdGlvbnNcbiAgICAgICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLnNwbGljZSggMCwgY2FsbGJhY2tsZW5ndGggKVxuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBzYW1wbGUgPSAwLCBsZW5ndGggPSBsZWZ0Lmxlbmd0aDsgc2FtcGxlIDwgbGVuZ3RoOyBzYW1wbGUrKykge1xuICAgICAgICBzY2hlZHVsZXIudGljaygpXG5cbiAgICAgICAgaWYoIGdpYmJlcmlzaC5ncmFwaElzRGlydHkgKSB7IFxuICAgICAgICAgIGNhbGxiYWNrID0gZ2liYmVyaXNoLmdlbmVyYXRlQ2FsbGJhY2soKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBYWFggY2FudCB1c2UgZGVzdHJ1Y3R1cmluZywgYmFiZWwgbWFrZXMgaXQgc29tZXRoaW5nIGluZWZmaWNpZW50Li4uXG4gICAgICAgIGxldCBvdXQgPSBjYWxsYmFjay5hcHBseSggbnVsbCwgZ2liYmVyaXNoLmNhbGxiYWNrVWdlbnMgKVxuXG4gICAgICAgIGxlZnRbIHNhbXBsZSAgXSA9IG91dFswXVxuICAgICAgICByaWdodFsgc2FtcGxlIF0gPSBvdXRbMV1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBHaWJiZXJpc2gubm9kZS5jb25uZWN0KCBHaWJiZXJpc2guY3R4LmRlc3RpbmF0aW9uIClcblxuICAgIHJldHVybiBHaWJiZXJpc2gubm9kZVxuICB9LCBcbn1cblxucmV0dXJuIHV0aWxpdGllc1xufVxuIiwiLyogYmlnLmpzIHYzLjEuMyBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWcuanMvTElDRU5DRSAqL1xyXG47KGZ1bmN0aW9uIChnbG9iYWwpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbi8qXHJcbiAgYmlnLmpzIHYzLjEuM1xyXG4gIEEgc21hbGwsIGZhc3QsIGVhc3ktdG8tdXNlIGxpYnJhcnkgZm9yIGFyYml0cmFyeS1wcmVjaXNpb24gZGVjaW1hbCBhcml0aG1ldGljLlxyXG4gIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZy5qcy9cclxuICBDb3B5cmlnaHQgKGMpIDIwMTQgTWljaGFlbCBNY2xhdWdobGluIDxNOGNoODhsQGdtYWlsLmNvbT5cclxuICBNSVQgRXhwYXQgTGljZW5jZVxyXG4qL1xyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqIEVESVRBQkxFIERFRkFVTFRTICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZXMgYmVsb3cgbXVzdCBiZSBpbnRlZ2VycyB3aXRoaW4gdGhlIHN0YXRlZCByYW5nZXMuXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBvZiB0aGUgcmVzdWx0cyBvZiBvcGVyYXRpb25zXHJcbiAgICAgKiBpbnZvbHZpbmcgZGl2aXNpb246IGRpdiBhbmQgc3FydCwgYW5kIHBvdyB3aXRoIG5lZ2F0aXZlIGV4cG9uZW50cy5cclxuICAgICAqL1xyXG4gICAgdmFyIERQID0gMjAsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byBNQVhfRFBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgcm91bmRpbmcgbW9kZSB1c2VkIHdoZW4gcm91bmRpbmcgdG8gdGhlIGFib3ZlIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogMCBUb3dhcmRzIHplcm8gKGkuZS4gdHJ1bmNhdGUsIG5vIHJvdW5kaW5nKS4gICAgICAgKFJPVU5EX0RPV04pXHJcbiAgICAgICAgICogMSBUbyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHJvdW5kIHVwLiAgKFJPVU5EX0hBTEZfVVApXHJcbiAgICAgICAgICogMiBUbyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHRvIGV2ZW4uICAgKFJPVU5EX0hBTEZfRVZFTilcclxuICAgICAgICAgKiAzIEF3YXkgZnJvbSB6ZXJvLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoUk9VTkRfVVApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUk0gPSAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwLCAxLCAyIG9yIDNcclxuXHJcbiAgICAgICAgLy8gVGhlIG1heGltdW0gdmFsdWUgb2YgRFAgYW5kIEJpZy5EUC5cclxuICAgICAgICBNQVhfRFAgPSAxRTYsICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gMTAwMDAwMFxyXG5cclxuICAgICAgICAvLyBUaGUgbWF4aW11bSBtYWduaXR1ZGUgb2YgdGhlIGV4cG9uZW50IGFyZ3VtZW50IHRvIHRoZSBwb3cgbWV0aG9kLlxyXG4gICAgICAgIE1BWF9QT1dFUiA9IDFFNiwgICAgICAgICAgICAgICAgICAgLy8gMSB0byAxMDAwMDAwXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBiZW5lYXRoIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKiBKYXZhU2NyaXB0J3MgTnVtYmVyIHR5cGU6IC03XHJcbiAgICAgICAgICogLTEwMDAwMDAgaXMgdGhlIG1pbmltdW0gcmVjb21tZW5kZWQgZXhwb25lbnQgdmFsdWUgb2YgYSBCaWcuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgRV9ORUcgPSAtNywgICAgICAgICAgICAgICAgICAgLy8gMCB0byAtMTAwMDAwMFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYWJvdmUgd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqIEphdmFTY3JpcHQncyBOdW1iZXIgdHlwZTogMjFcclxuICAgICAgICAgKiAxMDAwMDAwIGlzIHRoZSBtYXhpbXVtIHJlY29tbWVuZGVkIGV4cG9uZW50IHZhbHVlIG9mIGEgQmlnLlxyXG4gICAgICAgICAqIChUaGlzIGxpbWl0IGlzIG5vdCBlbmZvcmNlZCBvciBjaGVja2VkLilcclxuICAgICAgICAgKi9cclxuICAgICAgICBFX1BPUyA9IDIxLCAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDEwMDAwMDBcclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgICAgIC8vIFRoZSBzaGFyZWQgcHJvdG90eXBlIG9iamVjdC5cclxuICAgICAgICBQID0ge30sXHJcbiAgICAgICAgaXNWYWxpZCA9IC9eLT8oXFxkKyhcXC5cXGQqKT98XFwuXFxkKykoZVsrLV0/XFxkKyk/JC9pLFxyXG4gICAgICAgIEJpZztcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgQmlnIGNvbnN0cnVjdG9yLlxyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gYmlnRmFjdG9yeSgpIHtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgQmlnIGNvbnN0cnVjdG9yIGFuZCBleHBvcnRlZCBmdW5jdGlvbi5cclxuICAgICAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIG5ldyBpbnN0YW5jZSBvZiBhIEJpZyBudW1iZXIgb2JqZWN0LlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogbiB7bnVtYmVyfHN0cmluZ3xCaWd9IEEgbnVtZXJpYyB2YWx1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBCaWcobikge1xyXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICAvLyBFbmFibGUgY29uc3RydWN0b3IgdXNhZ2Ugd2l0aG91dCBuZXcuXHJcbiAgICAgICAgICAgIGlmICghKHggaW5zdGFuY2VvZiBCaWcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbiA9PT0gdm9pZCAwID8gYmlnRmFjdG9yeSgpIDogbmV3IEJpZyhuKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRHVwbGljYXRlLlxyXG4gICAgICAgICAgICBpZiAobiBpbnN0YW5jZW9mIEJpZykge1xyXG4gICAgICAgICAgICAgICAgeC5zID0gbi5zO1xyXG4gICAgICAgICAgICAgICAgeC5lID0gbi5lO1xyXG4gICAgICAgICAgICAgICAgeC5jID0gbi5jLnNsaWNlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZSh4LCBuKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogUmV0YWluIGEgcmVmZXJlbmNlIHRvIHRoaXMgQmlnIGNvbnN0cnVjdG9yLCBhbmQgc2hhZG93XHJcbiAgICAgICAgICAgICAqIEJpZy5wcm90b3R5cGUuY29uc3RydWN0b3Igd2hpY2ggcG9pbnRzIHRvIE9iamVjdC5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHguY29uc3RydWN0b3IgPSBCaWc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBCaWcucHJvdG90eXBlID0gUDtcclxuICAgICAgICBCaWcuRFAgPSBEUDtcclxuICAgICAgICBCaWcuUk0gPSBSTTtcclxuICAgICAgICBCaWcuRV9ORUcgPSBFX05FRztcclxuICAgICAgICBCaWcuRV9QT1MgPSBFX1BPUztcclxuXHJcbiAgICAgICAgcmV0dXJuIEJpZztcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUHJpdmF0ZSBmdW5jdGlvbnNcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIEJpZyB4IGluIG5vcm1hbCBvciBleHBvbmVudGlhbFxyXG4gICAgICogbm90YXRpb24gdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgb3Igc2lnbmlmaWNhbnQgZGlnaXRzLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gVGhlIEJpZyB0byBmb3JtYXQuXHJcbiAgICAgKiBkcCB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiB0b0Uge251bWJlcn0gMSAodG9FeHBvbmVudGlhbCksIDIgKHRvUHJlY2lzaW9uKSBvciB1bmRlZmluZWQgKHRvRml4ZWQpLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBmb3JtYXQoeCwgZHAsIHRvRSkge1xyXG4gICAgICAgIHZhciBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG5cclxuICAgICAgICAgICAgLy8gVGhlIGluZGV4IChub3JtYWwgbm90YXRpb24pIG9mIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBpID0gZHAgLSAoeCA9IG5ldyBCaWcoeCkpLmUsXHJcbiAgICAgICAgICAgIGMgPSB4LmM7XHJcblxyXG4gICAgICAgIC8vIFJvdW5kP1xyXG4gICAgICAgIGlmIChjLmxlbmd0aCA+ICsrZHApIHtcclxuICAgICAgICAgICAgcm5kKHgsIGksIEJpZy5STSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWNbMF0pIHtcclxuICAgICAgICAgICAgKytpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodG9FKSB7XHJcbiAgICAgICAgICAgIGkgPSBkcDtcclxuXHJcbiAgICAgICAgLy8gdG9GaXhlZFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGMgPSB4LmM7XHJcblxyXG4gICAgICAgICAgICAvLyBSZWNhbGN1bGF0ZSBpIGFzIHguZSBtYXkgaGF2ZSBjaGFuZ2VkIGlmIHZhbHVlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIGkgPSB4LmUgKyBpICsgMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGVuZCB6ZXJvcz9cclxuICAgICAgICBmb3IgKDsgYy5sZW5ndGggPCBpOyBjLnB1c2goMCkpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgaSA9IHguZTtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiB0b1ByZWNpc2lvbiByZXR1cm5zIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoZSBudW1iZXIgb2ZcclxuICAgICAgICAgKiBzaWduaWZpY2FudCBkaWdpdHMgc3BlY2lmaWVkIGlzIGxlc3MgdGhhbiB0aGUgbnVtYmVyIG9mIGRpZ2l0c1xyXG4gICAgICAgICAqIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGUgdmFsdWUgaW4gbm9ybWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcmV0dXJuIHRvRSA9PT0gMSB8fCB0b0UgJiYgKGRwIDw9IGkgfHwgaSA8PSBCaWcuRV9ORUcpID9cclxuXHJcbiAgICAgICAgICAvLyBFeHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICAgICh4LnMgPCAwICYmIGNbMF0gPyAnLScgOiAnJykgK1xyXG4gICAgICAgICAgICAoYy5sZW5ndGggPiAxID8gY1swXSArICcuJyArIGMuam9pbignJykuc2xpY2UoMSkgOiBjWzBdKSArXHJcbiAgICAgICAgICAgICAgKGkgPCAwID8gJ2UnIDogJ2UrJykgKyBpXHJcblxyXG4gICAgICAgICAgLy8gTm9ybWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgOiB4LnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBQYXJzZSB0aGUgbnVtYmVyIG9yIHN0cmluZyB2YWx1ZSBwYXNzZWQgdG8gYSBCaWcgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBBIEJpZyBudW1iZXIgaW5zdGFuY2UuXHJcbiAgICAgKiBuIHtudW1iZXJ8c3RyaW5nfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHBhcnNlKHgsIG4pIHtcclxuICAgICAgICB2YXIgZSwgaSwgbkw7XHJcblxyXG4gICAgICAgIC8vIE1pbnVzIHplcm8/XHJcbiAgICAgICAgaWYgKG4gPT09IDAgJiYgMSAvIG4gPCAwKSB7XHJcbiAgICAgICAgICAgIG4gPSAnLTAnO1xyXG5cclxuICAgICAgICAvLyBFbnN1cmUgbiBpcyBzdHJpbmcgYW5kIGNoZWNrIHZhbGlkaXR5LlxyXG4gICAgICAgIH0gZWxzZSBpZiAoIWlzVmFsaWQudGVzdChuICs9ICcnKSkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHNpZ24uXHJcbiAgICAgICAgeC5zID0gbi5jaGFyQXQoMCkgPT0gJy0nID8gKG4gPSBuLnNsaWNlKDEpLCAtMSkgOiAxO1xyXG5cclxuICAgICAgICAvLyBEZWNpbWFsIHBvaW50P1xyXG4gICAgICAgIGlmICgoZSA9IG4uaW5kZXhPZignLicpKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIG4gPSBuLnJlcGxhY2UoJy4nLCAnJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFeHBvbmVudGlhbCBmb3JtP1xyXG4gICAgICAgIGlmICgoaSA9IG4uc2VhcmNoKC9lL2kpKSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSBleHBvbmVudC5cclxuICAgICAgICAgICAgaWYgKGUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBlID0gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlICs9ICtuLnNsaWNlKGkgKyAxKTtcclxuICAgICAgICAgICAgbiA9IG4uc3Vic3RyaW5nKDAsIGkpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJbnRlZ2VyLlxyXG4gICAgICAgICAgICBlID0gbi5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGkgPSAwOyBuLmNoYXJBdChpKSA9PSAnMCc7IGkrKykge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGkgPT0gKG5MID0gbi5sZW5ndGgpKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICB4LmMgPSBbIHguZSA9IDAgXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKDsgbi5jaGFyQXQoLS1uTCkgPT0gJzAnOykge1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB4LmUgPSBlIC0gaSAtIDE7XHJcbiAgICAgICAgICAgIHguYyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29udmVydCBzdHJpbmcgdG8gYXJyYXkgb2YgZGlnaXRzIHdpdGhvdXQgbGVhZGluZy90cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yIChlID0gMDsgaSA8PSBuTDsgeC5jW2UrK10gPSArbi5jaGFyQXQoaSsrKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJvdW5kIEJpZyB4IHRvIGEgbWF4aW11bSBvZiBkcCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLlxyXG4gICAgICogQ2FsbGVkIGJ5IGRpdiwgc3FydCBhbmQgcm91bmQuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBUaGUgQmlnIHRvIHJvdW5kLlxyXG4gICAgICogZHAge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogcm0ge251bWJlcn0gMCwgMSwgMiBvciAzIChET1dOLCBIQUxGX1VQLCBIQUxGX0VWRU4sIFVQKVxyXG4gICAgICogW21vcmVdIHtib29sZWFufSBXaGV0aGVyIHRoZSByZXN1bHQgb2YgZGl2aXNpb24gd2FzIHRydW5jYXRlZC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcm5kKHgsIGRwLCBybSwgbW9yZSkge1xyXG4gICAgICAgIHZhciB1LFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgaSA9IHguZSArIGRwICsgMTtcclxuXHJcbiAgICAgICAgaWYgKHJtID09PSAxKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB4Y1tpXSBpcyB0aGUgZGlnaXQgYWZ0ZXIgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIG1vcmUgPSB4Y1tpXSA+PSA1O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm0gPT09IDIpIHtcclxuICAgICAgICAgICAgbW9yZSA9IHhjW2ldID4gNSB8fCB4Y1tpXSA9PSA1ICYmXHJcbiAgICAgICAgICAgICAgKG1vcmUgfHwgaSA8IDAgfHwgeGNbaSArIDFdICE9PSB1IHx8IHhjW2kgLSAxXSAmIDEpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm0gPT09IDMpIHtcclxuICAgICAgICAgICAgbW9yZSA9IG1vcmUgfHwgeGNbaV0gIT09IHUgfHwgaSA8IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbW9yZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJtICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycignIUJpZy5STSEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGkgPCAxIHx8ICF4Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKG1vcmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAxLCAwLjEsIDAuMDEsIDAuMDAxLCAwLjAwMDEgZXRjLlxyXG4gICAgICAgICAgICAgICAgeC5lID0gLWRwO1xyXG4gICAgICAgICAgICAgICAgeC5jID0gWzFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgICAgICB4LmMgPSBbeC5lID0gMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGFueSBkaWdpdHMgYWZ0ZXIgdGhlIHJlcXVpcmVkIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAgICB4Yy5sZW5ndGggPSBpLS07XHJcblxyXG4gICAgICAgICAgICAvLyBSb3VuZCB1cD9cclxuICAgICAgICAgICAgaWYgKG1vcmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSb3VuZGluZyB1cCBtYXkgbWVhbiB0aGUgcHJldmlvdXMgZGlnaXQgaGFzIHRvIGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgICAgICBmb3IgKDsgKyt4Y1tpXSA+IDk7KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeGNbaV0gPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWktLSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArK3guZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGMudW5zaGlmdCgxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yIChpID0geGMubGVuZ3RoOyAheGNbLS1pXTsgeGMucG9wKCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaHJvdyBhIEJpZ0Vycm9yLlxyXG4gICAgICpcclxuICAgICAqIG1lc3NhZ2Uge3N0cmluZ30gVGhlIGVycm9yIG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHRocm93RXJyKG1lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgICAgIGVyci5uYW1lID0gJ0JpZ0Vycm9yJztcclxuXHJcbiAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBQcm90b3R5cGUvaW5zdGFuY2UgbWV0aG9kc1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBCaWcuXHJcbiAgICAgKi9cclxuICAgIFAuYWJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB4ID0gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcyk7XHJcbiAgICAgICAgeC5zID0gMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuXHJcbiAgICAgKiAxIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogLTEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksIG9yXHJcbiAgICAgKiAwIGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSB2YWx1ZS5cclxuICAgICovXHJcbiAgICBQLmNtcCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHhOZWcsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSAoeSA9IG5ldyB4LmNvbnN0cnVjdG9yKHkpKS5jLFxyXG4gICAgICAgICAgICBpID0geC5zLFxyXG4gICAgICAgICAgICBqID0geS5zLFxyXG4gICAgICAgICAgICBrID0geC5lLFxyXG4gICAgICAgICAgICBsID0geS5lO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gIXhjWzBdID8gIXljWzBdID8gMCA6IC1qIDogaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoaSAhPSBqKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4TmVnID0gaSA8IDA7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmIChrICE9IGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGsgPiBsIF4geE5lZyA/IDEgOiAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSAtMTtcclxuICAgICAgICBqID0gKGsgPSB4Yy5sZW5ndGgpIDwgKGwgPSB5Yy5sZW5ndGgpID8gayA6IGw7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgZm9yICg7ICsraSA8IGo7KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoeGNbaV0gIT0geWNbaV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4Y1tpXSA+IHljW2ldIF4geE5lZyA/IDEgOiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBsZW5ndGhzLlxyXG4gICAgICAgIHJldHVybiBrID09IGwgPyAwIDogayA+IGwgXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGRpdmlkZWQgYnkgdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeSwgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWxcclxuICAgICAqIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqL1xyXG4gICAgUC5kaXYgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgLy8gZGl2aWRlbmRcclxuICAgICAgICAgICAgZHZkID0geC5jLFxyXG4gICAgICAgICAgICAvL2Rpdmlzb3JcclxuICAgICAgICAgICAgZHZzID0gKHkgPSBuZXcgQmlnKHkpKS5jLFxyXG4gICAgICAgICAgICBzID0geC5zID09IHkucyA/IDEgOiAtMSxcclxuICAgICAgICAgICAgZHAgPSBCaWcuRFA7XHJcblxyXG4gICAgICAgIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFCaWcuRFAhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFaXRoZXIgMD9cclxuICAgICAgICBpZiAoIWR2ZFswXSB8fCAhZHZzWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBib3RoIGFyZSAwLCB0aHJvdyBOYU5cclxuICAgICAgICAgICAgaWYgKGR2ZFswXSA9PSBkdnNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGR2cyBpcyAwLCB0aHJvdyArLUluZmluaXR5LlxyXG4gICAgICAgICAgICBpZiAoIWR2c1swXSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIocyAvIDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBkdmQgaXMgMCwgcmV0dXJuICstMC5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcocyAqIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGR2c0wsIGR2c1QsIG5leHQsIGNtcCwgcmVtSSwgdSxcclxuICAgICAgICAgICAgZHZzWiA9IGR2cy5zbGljZSgpLFxyXG4gICAgICAgICAgICBkdmRJID0gZHZzTCA9IGR2cy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGR2ZEwgPSBkdmQubGVuZ3RoLFxyXG4gICAgICAgICAgICAvLyByZW1haW5kZXJcclxuICAgICAgICAgICAgcmVtID0gZHZkLnNsaWNlKDAsIGR2c0wpLFxyXG4gICAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aCxcclxuICAgICAgICAgICAgLy8gcXVvdGllbnRcclxuICAgICAgICAgICAgcSA9IHksXHJcbiAgICAgICAgICAgIHFjID0gcS5jID0gW10sXHJcbiAgICAgICAgICAgIHFpID0gMCxcclxuICAgICAgICAgICAgZGlnaXRzID0gZHAgKyAocS5lID0geC5lIC0geS5lKSArIDE7XHJcblxyXG4gICAgICAgIHEucyA9IHM7XHJcbiAgICAgICAgcyA9IGRpZ2l0cyA8IDAgPyAwIDogZGlnaXRzO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdmVyc2lvbiBvZiBkaXZpc29yIHdpdGggbGVhZGluZyB6ZXJvLlxyXG4gICAgICAgIGR2c1oudW5zaGlmdCgwKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHplcm9zIHRvIG1ha2UgcmVtYWluZGVyIGFzIGxvbmcgYXMgZGl2aXNvci5cclxuICAgICAgICBmb3IgKDsgcmVtTCsrIDwgZHZzTDsgcmVtLnB1c2goMCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRvIHtcclxuXHJcbiAgICAgICAgICAgIC8vICduZXh0JyBpcyBob3cgbWFueSB0aW1lcyB0aGUgZGl2aXNvciBnb2VzIGludG8gY3VycmVudCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGZvciAobmV4dCA9IDA7IG5leHQgPCAxMDsgbmV4dCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29tcGFyZSBkaXZpc29yIGFuZCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoZHZzTCAhPSAocmVtTCA9IHJlbS5sZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY21wID0gZHZzTCA+IHJlbUwgPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHJlbUkgPSAtMSwgY21wID0gMDsgKytyZW1JIDwgZHZzTDspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkdnNbcmVtSV0gIT0gcmVtW3JlbUldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbXAgPSBkdnNbcmVtSV0gPiByZW1bcmVtSV0gPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBkaXZpc29yIDwgcmVtYWluZGVyLCBzdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGNtcCA8IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtYWluZGVyIGNhbid0IGJlIG1vcmUgdGhhbiAxIGRpZ2l0IGxvbmdlciB0aGFuIGRpdmlzb3IuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXF1YWxpc2UgbGVuZ3RocyB1c2luZyBkaXZpc29yIHdpdGggZXh0cmEgbGVhZGluZyB6ZXJvP1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoZHZzVCA9IHJlbUwgPT0gZHZzTCA/IGR2cyA6IGR2c1o7IHJlbUw7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtWy0tcmVtTF0gPCBkdnNUW3JlbUxdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1JID0gcmVtTDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKDsgcmVtSSAmJiAhcmVtWy0tcmVtSV07IHJlbVtyZW1JXSA9IDkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0tcmVtW3JlbUldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtW3JlbUxdICs9IDEwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbVtyZW1MXSAtPSBkdnNUW3JlbUxdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgIXJlbVswXTsgcmVtLnNoaWZ0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgdGhlICduZXh0JyBkaWdpdCB0byB0aGUgcmVzdWx0IGFycmF5LlxyXG4gICAgICAgICAgICBxY1txaSsrXSA9IGNtcCA/IG5leHQgOiArK25leHQ7XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgaWYgKHJlbVswXSAmJiBjbXApIHtcclxuICAgICAgICAgICAgICAgIHJlbVtyZW1MXSA9IGR2ZFtkdmRJXSB8fCAwO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVtID0gWyBkdmRbZHZkSV0gXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IHdoaWxlICgoZHZkSSsrIDwgZHZkTCB8fCByZW1bMF0gIT09IHUpICYmIHMtLSk7XHJcblxyXG4gICAgICAgIC8vIExlYWRpbmcgemVybz8gRG8gbm90IHJlbW92ZSBpZiByZXN1bHQgaXMgc2ltcGx5IHplcm8gKHFpID09IDEpLlxyXG4gICAgICAgIGlmICghcWNbMF0gJiYgcWkgIT0gMSkge1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlcmUgY2FuJ3QgYmUgbW9yZSB0aGFuIG9uZSB6ZXJvLlxyXG4gICAgICAgICAgICBxYy5zaGlmdCgpO1xyXG4gICAgICAgICAgICBxLmUtLTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJvdW5kP1xyXG4gICAgICAgIGlmIChxaSA+IGRpZ2l0cykge1xyXG4gICAgICAgICAgICBybmQocSwgZHAsIEJpZy5STSwgcmVtWzBdICE9PSB1KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBxO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBlcXVhbCB0byB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5lcSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmNtcCh5KTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmd0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZ3RlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAtMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmx0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPCAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAubHRlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBtaW51cyB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLnN1YiA9IFAubWludXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciBpLCBqLCB0LCB4TFR5LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgIHJldHVybiB4LnBsdXMoeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgeGMgPSB4LmMuc2xpY2UoKSxcclxuICAgICAgICAgICAgeGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHljID0geS5jLFxyXG4gICAgICAgICAgICB5ZSA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHkgaXMgbm9uLXplcm8/IHggaXMgbm9uLXplcm8/IE9yIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgIHJldHVybiB5Y1swXSA/ICh5LnMgPSAtYiwgeSkgOiBuZXcgQmlnKHhjWzBdID8geCA6IDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIGlzIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhMVHkgPSBhIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIGZvciAoYiA9IGE7IGItLTsgdC5wdXNoKDApKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEV4cG9uZW50cyBlcXVhbC4gQ2hlY2sgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgICAgIGogPSAoKHhMVHkgPSB4Yy5sZW5ndGggPCB5Yy5sZW5ndGgpID8geGMgOiB5YykubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yIChhID0gYiA9IDA7IGIgPCBqOyBiKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoeGNbYl0gIT0geWNbYl0pIHtcclxuICAgICAgICAgICAgICAgICAgICB4TFR5ID0geGNbYl0gPCB5Y1tiXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8geCA8IHk/IFBvaW50IHhjIHRvIHRoZSBhcnJheSBvZiB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICBpZiAoeExUeSkge1xyXG4gICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIHhjID0geWM7XHJcbiAgICAgICAgICAgIHljID0gdDtcclxuICAgICAgICAgICAgeS5zID0gLXkucztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogQXBwZW5kIHplcm9zIHRvIHhjIGlmIHNob3J0ZXIuIE5vIG5lZWQgdG8gYWRkIHplcm9zIHRvIHljIGlmIHNob3J0ZXJcclxuICAgICAgICAgKiBhcyBzdWJ0cmFjdGlvbiBvbmx5IG5lZWRzIHRvIHN0YXJ0IGF0IHljLmxlbmd0aC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpZiAoKCBiID0gKGogPSB5Yy5sZW5ndGgpIC0gKGkgPSB4Yy5sZW5ndGgpICkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKDsgYi0tOyB4Y1tpKytdID0gMCkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTdWJ0cmFjdCB5YyBmcm9tIHhjLlxyXG4gICAgICAgIGZvciAoYiA9IGk7IGogPiBhOyl7XHJcblxyXG4gICAgICAgICAgICBpZiAoeGNbLS1qXSA8IHljW2pdKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gajsgaSAmJiAheGNbLS1pXTsgeGNbaV0gPSA5KSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAtLXhjW2ldO1xyXG4gICAgICAgICAgICAgICAgeGNbal0gKz0gMTA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeGNbal0gLT0geWNbal07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yICg7IHhjWy0tYl0gPT09IDA7IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgICAgIGZvciAoOyB4Y1swXSA9PT0gMDspIHtcclxuICAgICAgICAgICAgeGMuc2hpZnQoKTtcclxuICAgICAgICAgICAgLS15ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIG4gLSBuID0gKzBcclxuICAgICAgICAgICAgeS5zID0gMTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlc3VsdCBtdXN0IGJlIHplcm8uXHJcbiAgICAgICAgICAgIHhjID0gW3llID0gMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB5LmMgPSB4YztcclxuICAgICAgICB5LmUgPSB5ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgbW9kdWxvIHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAubW9kID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeUdUeCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIGlmICgheS5jWzBdKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB4LnMgPSB5LnMgPSAxO1xyXG4gICAgICAgIHlHVHggPSB5LmNtcCh4KSA9PSAxO1xyXG4gICAgICAgIHgucyA9IGE7XHJcbiAgICAgICAgeS5zID0gYjtcclxuXHJcbiAgICAgICAgaWYgKHlHVHgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhID0gQmlnLkRQO1xyXG4gICAgICAgIGIgPSBCaWcuUk07XHJcbiAgICAgICAgQmlnLkRQID0gQmlnLlJNID0gMDtcclxuICAgICAgICB4ID0geC5kaXYoeSk7XHJcbiAgICAgICAgQmlnLkRQID0gYTtcclxuICAgICAgICBCaWcuUk0gPSBiO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5taW51cyggeC50aW1lcyh5KSApO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHBsdXMgdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5hZGQgPSBQLnBsdXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB0LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgIHJldHVybiB4Lm1pbnVzKHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHhlID0geC5lLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWUgPSB5LmUsXHJcbiAgICAgICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8geSBpcyBub24temVybz8geCBpcyBub24temVybz8gT3IgYm90aCBhcmUgemVyby5cclxuICAgICAgICAgICAgcmV0dXJuIHljWzBdID8geSA6IG5ldyBCaWcoeGNbMF0gPyB4IDogYSAqIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4YyA9IHhjLnNsaWNlKCk7XHJcblxyXG4gICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgIC8vIE5vdGU6IEZhc3RlciB0byB1c2UgcmV2ZXJzZSB0aGVuIGRvIHVuc2hpZnRzLlxyXG4gICAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGEgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB5ZSA9IHhlO1xyXG4gICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgZm9yICg7IGEtLTsgdC5wdXNoKDApKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBQb2ludCB4YyB0byB0aGUgbG9uZ2VyIGFycmF5LlxyXG4gICAgICAgIGlmICh4Yy5sZW5ndGggLSB5Yy5sZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgeWMgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBhID0geWMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIE9ubHkgc3RhcnQgYWRkaW5nIGF0IHljLmxlbmd0aCAtIDEgYXMgdGhlIGZ1cnRoZXIgZGlnaXRzIG9mIHhjIGNhbiBiZVxyXG4gICAgICAgICAqIGxlZnQgYXMgdGhleSBhcmUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9yIChiID0gMDsgYTspIHtcclxuICAgICAgICAgICAgYiA9ICh4Y1stLWFdID0geGNbYV0gKyB5Y1thXSArIGIpIC8gMTAgfCAwO1xyXG4gICAgICAgICAgICB4Y1thXSAlPSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5vIG5lZWQgdG8gY2hlY2sgZm9yIHplcm8sIGFzICt4ICsgK3kgIT0gMCAmJiAteCArIC15ICE9IDBcclxuXHJcbiAgICAgICAgaWYgKGIpIHtcclxuICAgICAgICAgICAgeGMudW5zaGlmdChiKTtcclxuICAgICAgICAgICAgKyt5ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChhID0geGMubGVuZ3RoOyB4Y1stLWFdID09PSAwOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeS5jID0geGM7XHJcbiAgICAgICAgeS5lID0geWU7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcmFpc2VkIHRvIHRoZSBwb3dlciBuLlxyXG4gICAgICogSWYgbiBpcyBuZWdhdGl2ZSwgcm91bmQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsXHJcbiAgICAgKiBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogbiB7bnVtYmVyfSBJbnRlZ2VyLCAtTUFYX1BPV0VSIHRvIE1BWF9QT1dFUiBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAucG93ID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIG9uZSA9IG5ldyB4LmNvbnN0cnVjdG9yKDEpLFxyXG4gICAgICAgICAgICB5ID0gb25lLFxyXG4gICAgICAgICAgICBpc05lZyA9IG4gPCAwO1xyXG5cclxuICAgICAgICBpZiAobiAhPT0gfn5uIHx8IG4gPCAtTUFYX1BPV0VSIHx8IG4gPiBNQVhfUE9XRVIpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFwb3chJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuID0gaXNOZWcgPyAtbiA6IG47XHJcblxyXG4gICAgICAgIGZvciAoOzspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChuICYgMSkge1xyXG4gICAgICAgICAgICAgICAgeSA9IHkudGltZXMoeCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbiA+Pj0gMTtcclxuXHJcbiAgICAgICAgICAgIGlmICghbikge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeCA9IHgudGltZXMoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaXNOZWcgPyBvbmUuZGl2KHkpIDogeTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIGFcclxuICAgICAqIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS5cclxuICAgICAqIElmIGRwIGlzIG5vdCBzcGVjaWZpZWQsIHJvdW5kIHRvIDAgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgKiBJZiBybSBpcyBub3Qgc3BlY2lmaWVkLCB1c2UgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogW3JtXSAwLCAxLCAyIG9yIDMgKFJPVU5EX0RPV04sIFJPVU5EX0hBTEZfVVAsIFJPVU5EX0hBTEZfRVZFTiwgUk9VTkRfVVApXHJcbiAgICAgKi9cclxuICAgIFAucm91bmQgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBkcCA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFyb3VuZCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcm5kKHggPSBuZXcgQmlnKHgpLCBkcCwgcm0gPT0gbnVsbCA/IEJpZy5STSA6IHJtKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhlIHZhbHVlIG9mIHRoaXMgQmlnLFxyXG4gICAgICogcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWwgcGxhY2VzIHVzaW5nXHJcbiAgICAgKiByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqL1xyXG4gICAgUC5zcXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlc3RpbWF0ZSwgciwgYXBwcm94LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIGkgPSB4LnMsXHJcbiAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgIGhhbGYgPSBuZXcgQmlnKCcwLjUnKTtcclxuXHJcbiAgICAgICAgLy8gWmVybz9cclxuICAgICAgICBpZiAoIXhjWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgbmVnYXRpdmUsIHRocm93IE5hTi5cclxuICAgICAgICBpZiAoaSA8IDApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEVzdGltYXRlLlxyXG4gICAgICAgIGkgPSBNYXRoLnNxcnQoeC50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgLy8gTWF0aC5zcXJ0IHVuZGVyZmxvdy9vdmVyZmxvdz9cclxuICAgICAgICAvLyBQYXNzIHggdG8gTWF0aC5zcXJ0IGFzIGludGVnZXIsIHRoZW4gYWRqdXN0IHRoZSByZXN1bHQgZXhwb25lbnQuXHJcbiAgICAgICAgaWYgKGkgPT09IDAgfHwgaSA9PT0gMSAvIDApIHtcclxuICAgICAgICAgICAgZXN0aW1hdGUgPSB4Yy5qb2luKCcnKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghKGVzdGltYXRlLmxlbmd0aCArIGUgJiAxKSkge1xyXG4gICAgICAgICAgICAgICAgZXN0aW1hdGUgKz0gJzAnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByID0gbmV3IEJpZyggTWF0aC5zcXJ0KGVzdGltYXRlKS50b1N0cmluZygpICk7XHJcbiAgICAgICAgICAgIHIuZSA9ICgoZSArIDEpIC8gMiB8IDApIC0gKGUgPCAwIHx8IGUgJiAxKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByID0gbmV3IEJpZyhpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSA9IHIuZSArIChCaWcuRFAgKz0gNCk7XHJcblxyXG4gICAgICAgIC8vIE5ld3Rvbi1SYXBoc29uIGl0ZXJhdGlvbi5cclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGFwcHJveCA9IHI7XHJcbiAgICAgICAgICAgIHIgPSBoYWxmLnRpbWVzKCBhcHByb3gucGx1cyggeC5kaXYoYXBwcm94KSApICk7XHJcbiAgICAgICAgfSB3aGlsZSAoIGFwcHJveC5jLnNsaWNlKDAsIGkpLmpvaW4oJycpICE9PVxyXG4gICAgICAgICAgICAgICAgICAgICAgIHIuYy5zbGljZSgwLCBpKS5qb2luKCcnKSApO1xyXG5cclxuICAgICAgICBybmQociwgQmlnLkRQIC09IDQsIEJpZy5STSk7XHJcblxyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHRpbWVzIHRoZSB2YWx1ZSBvZlxyXG4gICAgICogQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAubXVsID0gUC50aW1lcyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIGMsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSAoeSA9IG5ldyBCaWcoeSkpLmMsXHJcbiAgICAgICAgICAgIGEgPSB4Yy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGIgPSB5Yy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGkgPSB4LmUsXHJcbiAgICAgICAgICAgIGogPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBzaWduIG9mIHJlc3VsdC5cclxuICAgICAgICB5LnMgPSB4LnMgPT0geS5zID8gMSA6IC0xO1xyXG5cclxuICAgICAgICAvLyBSZXR1cm4gc2lnbmVkIDAgaWYgZWl0aGVyIDAuXHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeS5zICogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXNlIGV4cG9uZW50IG9mIHJlc3VsdCBhcyB4LmUgKyB5LmUuXHJcbiAgICAgICAgeS5lID0gaSArIGo7XHJcblxyXG4gICAgICAgIC8vIElmIGFycmF5IHhjIGhhcyBmZXdlciBkaWdpdHMgdGhhbiB5Yywgc3dhcCB4YyBhbmQgeWMsIGFuZCBsZW5ndGhzLlxyXG4gICAgICAgIGlmIChhIDwgYikge1xyXG4gICAgICAgICAgICBjID0geGM7XHJcbiAgICAgICAgICAgIHhjID0geWM7XHJcbiAgICAgICAgICAgIHljID0gYztcclxuICAgICAgICAgICAgaiA9IGE7XHJcbiAgICAgICAgICAgIGEgPSBiO1xyXG4gICAgICAgICAgICBiID0gajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpc2UgY29lZmZpY2llbnQgYXJyYXkgb2YgcmVzdWx0IHdpdGggemVyb3MuXHJcbiAgICAgICAgZm9yIChjID0gbmV3IEFycmF5KGogPSBhICsgYik7IGotLTsgY1tqXSA9IDApIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE11bHRpcGx5LlxyXG5cclxuICAgICAgICAvLyBpIGlzIGluaXRpYWxseSB4Yy5sZW5ndGguXHJcbiAgICAgICAgZm9yIChpID0gYjsgaS0tOykge1xyXG4gICAgICAgICAgICBiID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIGEgaXMgeWMubGVuZ3RoLlxyXG4gICAgICAgICAgICBmb3IgKGogPSBhICsgaTsgaiA+IGk7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3VycmVudCBzdW0gb2YgcHJvZHVjdHMgYXQgdGhpcyBkaWdpdCBwb3NpdGlvbiwgcGx1cyBjYXJyeS5cclxuICAgICAgICAgICAgICAgIGIgPSBjW2pdICsgeWNbaV0gKiB4Y1tqIC0gaSAtIDFdICsgYjtcclxuICAgICAgICAgICAgICAgIGNbai0tXSA9IGIgJSAxMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjYXJyeVxyXG4gICAgICAgICAgICAgICAgYiA9IGIgLyAxMCB8IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY1tqXSA9IChjW2pdICsgYikgJSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluY3JlbWVudCByZXN1bHQgZXhwb25lbnQgaWYgdGhlcmUgaXMgYSBmaW5hbCBjYXJyeS5cclxuICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICArK3kuZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBhbnkgbGVhZGluZyB6ZXJvLlxyXG4gICAgICAgIGlmICghY1swXSkge1xyXG4gICAgICAgICAgICBjLnNoaWZ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChpID0gYy5sZW5ndGg7ICFjWy0taV07IGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgeS5jID0gYztcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcuXHJcbiAgICAgKiBSZXR1cm4gZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhpcyBCaWcgaGFzIGEgcG9zaXRpdmUgZXhwb25lbnQgZXF1YWwgdG9cclxuICAgICAqIG9yIGdyZWF0ZXIgdGhhbiBCaWcuRV9QT1MsIG9yIGEgbmVnYXRpdmUgZXhwb25lbnQgZXF1YWwgdG8gb3IgbGVzcyB0aGFuXHJcbiAgICAgKiBCaWcuRV9ORUcuXHJcbiAgICAgKi9cclxuICAgIFAudG9TdHJpbmcgPSBQLnZhbHVlT2YgPSBQLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHN0ciA9IHguYy5qb2luKCcnKSxcclxuICAgICAgICAgICAgc3RyTCA9IHN0ci5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uP1xyXG4gICAgICAgIGlmIChlIDw9IEJpZy5FX05FRyB8fCBlID49IEJpZy5FX1BPUykge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgKHN0ckwgPiAxID8gJy4nICsgc3RyLnNsaWNlKDEpIDogJycpICtcclxuICAgICAgICAgICAgICAoZSA8IDAgPyAnZScgOiAnZSsnKSArIGU7XHJcblxyXG4gICAgICAgIC8vIE5lZ2F0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBlbmQgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoOyArK2U7IHN0ciA9ICcwJyArIHN0cikge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0ciA9ICcwLicgKyBzdHI7XHJcblxyXG4gICAgICAgIC8vIFBvc2l0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGlmICgrK2UgPiBzdHJMKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQXBwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgZm9yIChlIC09IHN0ckw7IGUtLSA7IHN0ciArPSAnMCcpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlIDwgc3RyTCkge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnNsaWNlKDAsIGUpICsgJy4nICsgc3RyLnNsaWNlKGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50IHplcm8uXHJcbiAgICAgICAgfSBlbHNlIGlmIChzdHJMID4gMSkge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgJy4nICsgc3RyLnNsaWNlKDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXZvaWQgJy0wJ1xyXG4gICAgICAgIHJldHVybiB4LnMgPCAwICYmIHguY1swXSA/ICctJyArIHN0ciA6IHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKiBJZiB0b0V4cG9uZW50aWFsLCB0b0ZpeGVkLCB0b1ByZWNpc2lvbiBhbmQgZm9ybWF0IGFyZSBub3QgcmVxdWlyZWQgdGhleVxyXG4gICAgICogY2FuIHNhZmVseSBiZSBjb21tZW50ZWQtb3V0IG9yIGRlbGV0ZWQuIE5vIHJlZHVuZGFudCBjb2RlIHdpbGwgYmUgbGVmdC5cclxuICAgICAqIGZvcm1hdCBpcyB1c2VkIG9ubHkgYnkgdG9FeHBvbmVudGlhbCwgdG9GaXhlZCBhbmQgdG9QcmVjaXNpb24uXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGluIGV4cG9uZW50aWFsXHJcbiAgICAgKiBub3RhdGlvbiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB1c2luZ1xyXG4gICAgICogQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvRXhwb25lbnRpYWwgPSBmdW5jdGlvbiAoZHApIHtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgZHAgPSB0aGlzLmMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvRXhwIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBkcCwgMSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaW4gbm9ybWFsIG5vdGF0aW9uXHJcbiAgICAgKiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB1c2luZyBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9GaXhlZCA9IGZ1bmN0aW9uIChkcCkge1xyXG4gICAgICAgIHZhciBzdHIsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBuZWcgPSBCaWcuRV9ORUcsXHJcbiAgICAgICAgICAgIHBvcyA9IEJpZy5FX1BPUztcclxuXHJcbiAgICAgICAgLy8gUHJldmVudCB0aGUgcG9zc2liaWxpdHkgb2YgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgQmlnLkVfTkVHID0gLShCaWcuRV9QT1MgPSAxIC8gMCk7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHgudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwID09PSB+fmRwICYmIGRwID49IDAgJiYgZHAgPD0gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IGZvcm1hdCh4LCB4LmUgKyBkcCk7XHJcblxyXG4gICAgICAgICAgICAvLyAoLTApLnRvRml4ZWQoKSBpcyAnMCcsIGJ1dCAoLTAuMSkudG9GaXhlZCgpIGlzICctMCcuXHJcbiAgICAgICAgICAgIC8vICgtMCkudG9GaXhlZCgxKSBpcyAnMC4wJywgYnV0ICgtMC4wMSkudG9GaXhlZCgxKSBpcyAnLTAuMCcuXHJcbiAgICAgICAgICAgIGlmICh4LnMgPCAwICYmIHguY1swXSAmJiBzdHIuaW5kZXhPZignLScpIDwgMCkge1xyXG4gICAgICAgIC8vRS5nLiAtMC41IGlmIHJvdW5kZWQgdG8gLTAgd2lsbCBjYXVzZSB0b1N0cmluZyB0byBvbWl0IHRoZSBtaW51cyBzaWduLlxyXG4gICAgICAgICAgICAgICAgc3RyID0gJy0nICsgc3RyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEJpZy5FX05FRyA9IG5lZztcclxuICAgICAgICBCaWcuRV9QT1MgPSBwb3M7XHJcblxyXG4gICAgICAgIGlmICghc3RyKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9GaXghJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJvdW5kZWQgdG8gc2RcclxuICAgICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyBCaWcuUk0uIFVzZSBleHBvbmVudGlhbCBub3RhdGlvbiBpZiBzZCBpcyBsZXNzXHJcbiAgICAgKiB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGVcclxuICAgICAqIHZhbHVlIGluIG5vcm1hbCBub3RhdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBzZCB7bnVtYmVyfSBJbnRlZ2VyLCAxIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9QcmVjaXNpb24gPSBmdW5jdGlvbiAoc2QpIHtcclxuXHJcbiAgICAgICAgaWYgKHNkID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNkICE9PSB+fnNkIHx8IHNkIDwgMSB8fCBzZCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvUHJlIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBzZCAtIDEsIDIpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLy8gRXhwb3J0XHJcblxyXG5cclxuICAgIEJpZyA9IGJpZ0ZhY3RvcnkoKTtcclxuXHJcbiAgICAvL0FNRC5cclxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQmlnO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIC8vIE5vZGUgYW5kIG90aGVyIENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cy5cclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IEJpZztcclxuXHJcbiAgICAvL0Jyb3dzZXIuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGdsb2JhbC5CaWcgPSBCaWc7XHJcbiAgICB9XHJcbn0pKHRoaXMpO1xyXG4iXX0=

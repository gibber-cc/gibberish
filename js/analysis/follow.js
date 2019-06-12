const g = require('genish.js'),
      analyzer = require('./analyzer.js'),
      ugen = require('../ugen.js');

const genish = g;

module.exports = function (Gibberish) {

  const fout = (input, buffer, props) => {
    const follow_out = Object.create(analyzer);
    follow_out.id = Gibberish.factory.getUID();

    let avg; // output; make available outside jsdsp block

    {
      "use jsdsp";
      // phase to write to follow buffer
      const bufferPhaseOut = g.accum(1, 0, { max: props.bufferSize, min: 0 });

      // hold running sum
      const sum = g.data(1, 1, { meta: true });

      sum[0] = genish.sub(genish.add(sum[0], input), g.peek(buffer, bufferPhaseOut, { mode: 'simple' }));

      avg = genish.div(sum[0], props.bufferSize);
    }

    //if( !isStereo ) {
    Gibberish.factory(follow_out, avg, 'follow_out', props);

    follow_out.callback.ugenName = follow_out.ugenName = `follow_out_${follow_out.id}`;

    return follow_out;
  };

  const fin = (input, buffer, props) => {
    const follow_in = Object.create(ugen);
    let idx = buffer.memory.values.idx;
    let phase = 0;
    let abs = Math.abs;

    // have to write custom callback for input to reuse components from output,
    // specifically the memory from our buffer
    let callback = function (input, memory) {
      'use strict';

      memory[idx + phase] = abs(input);
      phase++;
      if (phase > props.bufferSize - 1) {
        phase = 0;
      }

      return 0;
    };

    Gibberish.factory(follow_in, input, 'follow_in', props, callback);

    // lots of nonsense to make our custom function work
    follow_in.callback.ugenName = follow_in.ugenName = `follow_in_${follow_in.id}`;
    follow_in.inputNames = ['input'];
    follow_in.inputs = [input];
    follow_in.input = input;
    follow_in.type = 'analysis';

    if (Gibberish.analyzers.indexOf(follow_in) === -1) Gibberish.analyzers.push(follow_in);

    Gibberish.dirty(Gibberish.analyzers);

    return follow_in;
  };

  const Follow = inputProps => {
    const follow = {};

    const props = Object.assign({}, inputProps, Follow.defaults);
    const isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true;

    // the input to the follow ugen is buffered in this ugen
    follow.buffer = g.data(props.bufferSize, 1);

    const _input = g.in('input');
    const input = isStereo ? g.add(_input[0], _input[1]) : _input;

    follow.out = fout(input, follow.buffer, props);
    follow.in = fin(input, follow.buffer, props);

    return follow.out;
  };

  Follow.out = fout;
  Follow.in = fin;

  Follow.defaults = {
    bufferSize: 8192
  };

  return Follow;
};
const g = require('genish.js'),
      analyzer = require('./analyzer.js'),
      ugen = require('../ugen.js');

const genish = g;

/*
 * XXX need to also enable following of non-abs values.
 * ,,, or do we? what are valid negative property values in this
 * version of Gibberish?
 *
 * Needs to have a mult modifier
 */
module.exports = function (Gibberish) {

  const Follow = function (__props) {
    const props = Object.assign({}, Follow.defaults, __props);

    let isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false;

    let out = props;

    /* if we are in the main thread,
     * only send a command to make a Follow instance
     * to the processor thread and include the id #
     * of the input ugen.
     */

    if (Gibberish.mode === 'worklet') {
      // send obj to be made in processor thread
      props.input = { id: props.input.id };
      props.isStereo = isStereo;

      // creates clashes in processor thread unless
      // we skip a number here... nice
      Gibberish.utilities.getUID();

      props.overrideid = Gibberish.utilities.getUID();

      // XXX seems like this id gets overridden somewhere
      // hence .overrideid
      props.id = props.overrideid;

      Gibberish.worklet.port.postMessage({
        address: 'add',

        properties: JSON.stringify(props),

        name: ['analysis', 'Follow']
      });

      let mult = props.multiplier;

      Object.defineProperty(out, 'multiplier', {
        get() {
          return mult;
        },
        set(v) {
          mult = v;
          Gibberish.worklet.port.postMessage({
            address: 'set',
            object: props.overrideid,
            name: 'multiplier',
            value: mult
          });
        }
      });
    } else {
      isStereo = props.isStereo;

      const buffer = g.data(props.bufferSize, 1);
      const input = g.in('input');
      const multiplier = g.in('multiplier');

      const follow_out = Object.create(analyzer);
      follow_out.id = __props.overrideid;

      let avg; // output; make available outside jsdsp block

      if (isStereo === true) {
        {
          "use jsdsp";
          // phase to write to follow buffer
          const bufferPhaseOut = g.accum(1, 0, { max: props.bufferSize, min: 0 });

          // hold running sum
          const sum = g.data(1, 1, { meta: true });

          sum[0] = genish.sub(genish.add(sum[0], g.abs(genish.add(input[0], input[1]))), g.peek(buffer, bufferPhaseOut, { mode: 'simple' }));

          avg = genish.mul(genish.div(sum[0], props.bufferSize), multiplier);
        }
      } else {
        {
          "use jsdsp";
          // phase to write to follow buffer
          const bufferPhaseOut = g.accum(1, 0, { max: props.bufferSize, min: 0 });

          // hold running sum
          const sum = g.data(1, 1, { meta: true });

          sum[0] = genish.sub(genish.add(sum[0], g.abs(input)), g.peek(buffer, bufferPhaseOut, { mode: 'simple' }));

          avg = genish.mul(genish.div(sum[0], props.bufferSize), multiplier);
        }
      }

      out = Gibberish.factory(follow_out, avg, ['analysis', 'follow_out'], props);

      Gibberish.ugens.set(__props.overrideid, out);

      out.id = __props.overrideid;

      // begin input tracker
      const follow_in = Object.create(ugen);

      const idx = buffer.memory.values.idx;

      let phase = 0;
      const abs = Math.abs;

      // have to write custom callback for input to reuse components from output,
      // specifically the memory from our buffer
      let callback = null;
      if (isStereo === true) {
        callback = function (input, memory) {
          memory[idx + phase] = abs(input[0] + input[1]);

          phase++;

          if (phase > props.bufferSize - 1) {
            phase = 0;
          }

          return 0;
        };
      } else {
        callback = function (input, memory) {
          memory[idx + phase] = abs(input);

          phase++;

          if (phase > props.bufferSize - 1) {
            phase = 0;
          }

          return 0;
        };
      }

      const record = {
        callback,
        input: props.input,
        isStereo,
        dirty: true,
        inputNames: ['input', 'memory'],
        inputs: [props.input],
        type: 'analysis',
        id: Gibberish.utilities.getUID(),

        __properties__: { input: props.input }

        // nonsense to make our custom function work
      };record.callback.ugenName = record.ugenName = `follow_in_${follow_out.id}`;

      if (Gibberish.analyzers.indexOf(record) === -1) Gibberish.analyzers.push(record);

      Gibberish.dirty(Gibberish.analyzers);
    }

    return out;
  };

  Follow.defaults = {
    input: 0,
    bufferSize: 1024,
    multiplier: 1
  };

  return Follow;
};
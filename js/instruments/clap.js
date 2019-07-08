const g = require('genish.js'),
      instrument = require('./instrument.js');

const genish = g;

module.exports = function (Gibberish) {

  const Clap = argumentProps => {
    'use jsdsp';

    const clap = Object.create(instrument),
          decay = g.in('decay'),
          // 0-1 input value
    scaledDecay = genish.mul(decay, genish.mul(g.gen.samplerate, 2)),
          gain = g.in('gain'),
          spacing = g.in('spacing'),
          // spacing between clap, in Hzs
    loudness = g.in('loudness'),
          triggerLoudness = g.in('__triggerLoudness'),
          cutoff = g.in('cutoff'),
          Q = g.in('Q');

    const props = Object.assign({}, Clap.defaults, argumentProps);

    const eg = g.decay(scaledDecay, { initValue: 0 }),
          check = g.gt(eg, .0005),
          noise = genish.add(-1, genish.mul(g.noise(), 2)),
          rnd = noise,
          //g.gtp( noise, 0 ),// * eg,
    b = g.bang(),
          saw = g.phasor(spacing, b, { min: 0 }),
          rsaw = genish.sub(1, saw),
          saw_env = g.ad(0, genish.mul(.035, g.gen.samplerate), { shape: 'linear' }),
          b2 = g.bang(),
          count = g.accum(1, b2, { max: Infinity, min: 0, initialValue: 0 }),
          delayedNoise = g.switch(g.gte(count, genish.mul(g.gen.samplerate, .035)), rnd, 0),
          bpf1 = g.svf(delayedNoise, 1000, .5, 2, false),
          scaledOut = genish.mul(genish.mul(genish.mul(genish.add(genish.mul(bpf1, eg), genish.mul(genish.mul(rnd, rsaw), saw_env)), gain), loudness), triggerLoudness),
          out = g.svf(scaledOut, cutoff, Q, 1, false);

    // XXX TODO : make this work with ifelse. the problem is that poke ugens put their
    // code at the bottom of the callback function, instead of at the end of the
    // associated if/else block.
    const ife = g.switch(check, out, 0);

    clap.env = {
      trigger(vol) {
        b.trigger();
        eg.trigger(vol);
        b2.trigger();
        saw_env.trigger();
      }
    };

    return Gibberish.factory(clap, ife, ['instruments', 'clap'], props);
  };

  Clap.defaults = {
    gain: 1,
    spacing: 100,
    decay: .2,
    loudness: 1,
    __triggerLoudness: 1,
    cutoff: 900,
    Q: .85
  };

  return Clap;
};
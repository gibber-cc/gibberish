const genish = require('genish.js'),
      filterProto = require('./filter.js');

module.exports = function (Gibberish) {

  const makeChannel = function (input, _Q, freq) {
    'use jsdsp';

    const iT = genish.div(1, genish.gen.samplerate),
          z = genish.data([0, 0, 0, 0], 1, { meta: true });

    const Q = genish.add(.5, genish.mul(_Q, 23));
    // kwd = 2 * $M_PI * acf[kindx]
    const kwd = genish.div(genish.mul(genish.mul(genish.mul(Math.PI, 2), freq), genish.gen.samplerate), 2);

    // kwa = (2/iT) * tan(kwd * iT/2) 
    const kwa = genish.mul(genish.div(2, iT), genish.tan(genish.div(genish.mul(kwd, iT), 2)));

    // kG  = kwa * iT/2 
    const kg = genish.div(genish.mul(kwa, iT), 2);

    // kk = 4.0*(kQ - 0.5)/(25.0 - 0.5)
    const kk = genish.div(genish.mul(4, genish.sub(Q, .5)), 24.5);

    // kg_plus_1 = (1.0 + kg)
    const kg_plus_1 = genish.add(1, kg);

    // kG = kg / kg_plus_1 
    const kG = genish.div(kg, kg_plus_1),
          kG_2 = genish.mul(kG, kG),
          kG_3 = genish.mul(kG_2, kG),
          kGAMMA = genish.mul(kG_2, kG_2);

    const kS1 = genish.div(z[0], kg_plus_1),
          kS2 = genish.div(z[1], kg_plus_1),
          kS3 = genish.div(z[2], kg_plus_1),
          kS4 = genish.div(z[3], kg_plus_1);

    //kS = kG_3 * kS1  + kG_2 * kS2 + kG * kS3 + kS4 
    const kS = genish.add(genish.add(genish.add(genish.mul(kG_3, kS1), genish.mul(kG_2, kS2)), genish.mul(kG, kS3)), kS4);

    //ku = (kin - kk *  kS) / (1 + kk * kGAMMA)
    const ku = genish.div(genish.sub(input, genish.mul(kk, kS)), genish.add(1, genish.mul(kk, kGAMMA)));

    let kv = genish.mul(genish.sub(ku, z[0]), kG);
    let klp = genish.add(kv, z[0]);
    z[0] = genish.add(klp, kv);

    kv = genish.mul(genish.sub(klp, z[1]), kG);
    klp = genish.add(kv, z[1]);
    z[1] = genish.add(klp, kv);

    kv = genish.mul(genish.sub(klp, z[2]), kG);
    klp = genish.add(kv, z[2]);
    z[2] = genish.add(klp, kv);

    kv = genish.mul(genish.sub(klp, z[3]), kG);
    klp = genish.add(kv, z[3]);
    z[3] = genish.add(klp, kv);

    return klp;
  };

  Gibberish.genish.zd24 = (input, _Q, freq, isStereo = false) => {
    const leftInput = isStereo === true ? input[0] : input;
    const left = makeChannel(leftInput, _Q, freq);

    let out;
    if (isStereo === true) {
      const right = makeChannel(input[1], _Q, freq);
      out = [left, right];
    } else {
      out = left;
    }

    return out;
  };

  const Zd24 = inputProps => {
    const filter = Object.create(filterProto);
    const props = Object.assign({}, Zd24.defaults, filter.defaults, inputProps);
    let out;

    filter.__requiresRecompilation = ['input'];
    filter.__createGraph = function () {
      let isStereo = false;
      if (out === undefined) {
        isStereo = props.input !== undefined && props.input.isStereo !== undefined ? props.input.isStereo : false;
      } else {
        isStereo = out.input.isStereo;
        out.isStereo = isStereo;
      }

      filter.graph = Gibberish.genish.zd24(genish.in('input'), genish.in('Q'), genish.in('cutoff'), isStereo);
    };

    filter.__createGraph();

    out = Gibberish.factory(filter, filter.graph, ['filters', 'Filter24Moog'], props);

    return out;
  };

  Zd24.defaults = {
    input: 0,
    Q: .75,
    cutoff: .25
  };

  return Zd24;
};
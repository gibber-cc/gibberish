const genish = require('genish.js'),
      ssd = genish.history,
      noise = genish.noise;

module.exports = function () {
  "use jsdsp";

  const last = ssd(0);

  const white = genish.sub(genish.mul(noise(), 2), 1);

  let out = genish.div(genish.add(last.out, genish.mul(.02, white)), 1.02);

  last.in(out);

  out = genish.mul(out, 3.5);

  return out;
};
const genish = require('genish.js'),
      ssd = genish.history,
      noise = genish.noise;

module.exports = function () {
  const last = ssd(0);

  const white = genish.sub(genish.mul(noise(), 2), 1);

  let out = genish.add(last.out, genish.div(genish.mul(.02, white), 1.02));

  last.in(out);

  out = genish.mul(out, 3.5);

  return out;
};

/*
for (var i = 0; i < bufferSize; i++) {
    var white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5; // (roughly) compensate for gain
}
*/
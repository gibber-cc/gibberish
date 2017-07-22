const genish = require('genish.js'),
      ssd = genish.history,
      data = genish.data,
      noise = genish.noise;

module.exports = function () {
  "use jsdsp";

  //const b0 = ssd(0), b1 = ssd(0), b2 = ssd(0), b3 = ssd(0), b4 = ssd(0), b5 = ssd(0), b6 = ssd(0)
  //const white = ( noise() * 2 ) - 1

  //b0.in( ( .99886 * b0.out ) + ( white * .0555179 ) )
  //b1.in( ( .99332 * b1.out ) + ( white * .0750579 ) )
  //b2.in( ( .96900 * b2.out ) + ( white * .1538520 ) )
  //b3.in( ( .88650 * b3.out ) + ( white * .3104856 ) )
  //b4.in( ( .55000 * b4.out ) + ( white * .5329522 ) )
  //b5.in( ( -.7616 * b5.out ) - ( white * .0168980 ) )

  //out = ( b0.out + b1.out + b2.out + b3.out + b4.out + b5.out + b6.out + white * .5362 ) * .11

  //b6.in( white * .115926 )

  const b = data(8, 1, { meta: true });
  const white = genish.sub(genish.mul(noise(), 2), 1);

  b[0] = genish.add(genish.mul(.99886, b[0]), genish.mul(white, .0555179));
  b[1] = genish.add(genish.mul(.99332, b[1]), genish.mul(white, .0750579));
  b[2] = genish.add(genish.mul(.96900, b[2]), genish.mul(white, .1538520));
  b[3] = genish.add(genish.mul(.88650, b[3]), genish.mul(white, .3104856));
  b[4] = genish.add(genish.mul(.55000, b[4]), genish.mul(white, .5329522));
  b[5] = genish.sub(genish.mul(-.7616, b[5]), genish.mul(white, .0168980));

  const out = genish.mul(genish.add(genish.add(genish.add(genish.add(genish.add(genish.add(genish.add(b[0], b[1]), b[2]), b[3]), b[4]), b[5]), b[6]), genish.mul(white, .5362)), .11);

  b[6] = genish.mul(white, .115926);

  return out;
};
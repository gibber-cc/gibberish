setupForNode();
const Gibberish = require('gibberish-dsp').init();
const sineWave = new Gibberish.Sine();
console.log(Gibberish);

// boilerplate for node. see node_test.js for a Speaker implementation
function setupForNode() {
  window = global;
  document = {};
  const NodeAudioContext = require('web-audio-api').AudioContext;
  const stream = require('stream');
  AudioContext = function () {
      const context = new NodeAudioContext();
      const outStream = new stream.Stream();
      outStream.writable = true;
      outStream.write = () => true;
      outStream.end = () => {};
      context.outStream = outStream;
      return context;
  };
}

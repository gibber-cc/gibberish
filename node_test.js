// a very simple test to ensure this works in node
// in conjunction with the web-audio-api module.
// see the index.html file for individual ugen tests.
setupForNode();
const Gibberish = require('./build/gibberish.js').init();
const sineWave = new Gibberish.Sine();
sineWave.connect();

function setupForNode() {
  window = global;
  document = {};
  const NodeAudioContext = require('web-audio-api').AudioContext;
  const Speaker = require('speaker');
  AudioContext = function () {
      const context = new NodeAudioContext();
      context.outStream = new Speaker({
        channels: context.format.numberOfChannels,
        bitDepth: context.format.bitDepth,
        sampleRate: context.sampleRate
      });
      return context;
  };
}

// a very simple test to ensure this works in node
// in conjunction with the web-audio-api module.
// see the index.html file for individual ugen tests.

// must be required AND placed in the global scope 
// before initializing Gibberish!
AudioContext = require('web-audio-api').AudioContext

var Gibberish = require('./build/gibberish.js').init(),
    a = new Gibberish.Sine().connect()
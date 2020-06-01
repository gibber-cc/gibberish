
/* tutorial 4: enveloping

Gibberish has two envelopes that can be used in conjunction with
oscillators; they are also found in each synth. The first is a 
two-stage attack / decay envelope; the second is a four stage
attack / decay / sustain / release envelope. Both envelopes
can either use linear or exponential functions.

*/

// envelope a sine oscillator
Gibberish.clear()
osc = Sine()
env = AD({ attack:44, decay: 88200 })
mul = Mul( osc, env ).connect()
 
env.trigger()

// in addition to attack/decay properties, envelopes also have "shape"
// and "alpha" properties. By default the shape is "exponential", and the
// alpha determines the exponent used. In the examples below, notice how
// in the second example the envelope rises much more sharply towards the
// end of the attack / start of the decay.

Gibberish.clear()
osc = Sine()
env = AD({ attack:44100, decay: 88200, alpha:5 })
mul = Mul( osc, env ).connect()
 
env.trigger()

Gibberish.clear()
osc = Sine()
env = AD({ attack:44100, decay: 88200, alpha:10 })
mul = Mul( osc, env ).connect()
 
env.trigger()

// there are also many different window shapes available, you can see
// a list of all of them here: 
// https://github.com/charlieroberts/genish.js/blob/master/js/windows.js
// if you want to use a cosine envelope for the entire sound, only specify
// a single envelope stage duration... otherwise the envelope will repeat. For
// example:

Gibberish.clear()
osc = Sine()
env = AD({ attack:0, decay: 88200, shape:'cosine' })
mul = Mul( osc, env ).connect()
 
env.trigger()

// We also have ADSR envelopes. By default, these automatically advance to
// the release stage after the sustain stage has completed, however, we can
// also tell the envelope to wait for user interaction proceed.

// advance automatically
Gibberish.clear()
osc = Sine()
env = ADSR({ sustain:88200, release:44100 })
mul = Mul( osc, env ).connect()

env.trigger()

// advance on calling the release() method.
Gibberish.clear()
osc = Sine()
env = ADSR({ attack:44, sustainLevel:.65, release:88200, triggerRelease:true })
mul = Mul( osc, env ).connect()

env.trigger()
// advance to release stage
env.advance()


// In addition to using envelopes manually, all the synthesizers that come with
// Gibberish (Synth, FM, and Monosynth ) have built-in envelopes. We can
// experiment with the same envelope properties on these synthesizers. Note that,
// in addition to affecting volume, these envelopes also affect other synthesis 
// properties. For example, in all synths the envelope also controls the filter
// cutoff (assuming a filter is enabled). In the FM synth it also affects the
// modulation index.

a = Monosynth({ attack:44, decay:44100 }).connect()
a.note(110)

Gibberish.clear()
b = FM({ useADSR:true, decay:44100, sustainLevel:.3, triggerRelease:true }).connect()
b.note(55)

// later on...
b.env.advance()

/* tutorial 4: enveloping

Gibberish has two envelopes that can be used in conjunction with
oscillators; they are also found in each synth. The first is a 
two-stage attack / decay envelope; the second is a four stage
attack / decay / sustain / release envelope. Both envelopes
can either use linear or exponential functions.

*/

// envelope a sine oscillator
osc = Sine()
env = AD({ attack:44, decay: 88200 })
mul = Mul( osc, env )

mul.connect()

env.trigger()

ugen
----

*Gibberish.prototypes.ugen*

The ugen object is the primary prototype for all unit generators in Gibberish.js. All ugens with the exception of simple binop / monop math operations (add, mul, abs etc.) delegate to this prototype object. 

####Methods####
###ugen.print###
Calls to `ugen.print()` will write a unit generators callback function to the `console` object.

###ugen.free###
Frees the memory associated with a unit generator.

###ugen.connect###

**ugen** &nbsp; *object* &nbsp; Optional. Another unit generator to connect to. If this arguement is undefined, the unit generator will create a default connection to `Gibberish.output`, which is essentially the master output bus.

**level** &nbsp; *float* &nbsp; Optional; default = 1. A scalar that is applied to the signal the unit generator sends to the connection.

This method works to connect instruments / oscillators to effects / filters, or to connect instruments / oscillators / filters and effects to busses. 

```javascript
syn = Gibberish.Synth()
syn.connect() // default connection to master bus

syn2 = Gibberish.Synth()
bus  = Gibberish.Bus2() // stereo bus
bus.connect() // connect to master bus
syn2.connect( bus ) // connect to bus

syn3 = Gibberish.Synth()
syn3.connect( bus, .5 ) // scale output to bus

// By default, effects accept a single input. However, we can easily
// connect multiple instruments to an effect using a bus as that input.
reverb = Gibberish.Freeverb({ input:Bus() }).connect()
syn.connect(  reverb.input, .25 )
syn2.connect( reverb.input, .25 )
syn3.connect( reverb.input, .25 )
```

###ugen.disconnect###

**ugen** &nbsp; *object* &nbsp; Optional. The unit generator calling `disconnect` will be disconnected from this destination. If this argument is ommitted, the unit generator will be disconnected from all unit generators it is currently connected to.

# Instruments

Instrument
----
*Gibberish.prototypes.instrument*  
*Prototype: [Gibberish.prototypes.ugen](#-ugen)*

Monophonic instruments in Gibberish (such as Synth, FM, and Monosynth) delegate to this prototype for `note` and `trigger` methods, while polyphonic instruments use a mixin (polytemplate.js). 

####Methods####
###instrument.note( frequency  )###
**frequency** &nbsp;  *number* &nbsp; The frequency for the new note to be played.

The `note` method assigns a new frequency to the instrument and re-triggers the instrument's envelope. For some percussion instruments that use fixed frequencies (Cowbell, Snare, and Hat) this method will trigger the instrument's envelope but the argument frequency will have no effect.

```javascript
fm = Gibberish.FM().connect()
fm.note( 330 )
```

###instrument.trigger( loudness  )###
**loudness** &nbsp;  *number* &nbsp; A scalar applied to the gain envelope of the new note.

Trigger a note at the last used frequency with the provided `loudness` as a scalar.

```javascript
kick = Gibberish.Kick({ frequency: 80 }).connect()

Gibberish.Sequencer({ 
  target:kick, 
  key:'trigger', 
  values:[ .1,.2,.3,.5], 
  timings:[11025]
}).start()
```

Conga
----
*Prototype: [Gibberish.prototypes.instrument](#instruments-instrument)*

The `Conga` unit generator emulates the conga sound found on the Roland TR-808 drum machine. It consists of an impulse feeding a resonant filter scaled by an exponential decay.

```javascript
// run line by line
conga = Gibberish.Conga().connect()
conga.note( 440 )
conga.decay( .25 )
conga.note( 440 )
```

####Properties####
###conga.decay###
*float* range: 0-1, default: .85 This value controls the decay length of each note.
###conga.gain###
*float* default: .25 This value controls the loudness of each note.

Cowbell
----
*Prototype: [Gibberish.prototypes.instrument](#instruments-instrument)*

The `Cowbell` unit generator emulates the cowbell sound found on the Roland TR-808 drum machine. It consists of an two tuned square waves feeding a resonant bandpass filter scaled by an exponential decay.

```javascript
// run line by line
conga = Gibberish.Conga().connect()
conga.trigger( .5 )
conga.decay( .05 )
conga.trigger( .75 )
```

####Properties####
###cowbell.decay###
*float* range: 0-1, default: .5 This value controls the decay length of each note. 0 represents a decay of 0 samples (and thus no sound, don't do this) while a value of 1 represents two seconds.
###cowbell.gain###
*float* default: .25 This value controls the loudness of each note.

FM
----
*Prototype: [Gibberish.prototypes.instrument](#instruments-instrument)*

The `FM` unit generator provides two-operator FM synthesis with a choice of waveforms for both carrier and modulator, as well as a filter with selectable models (disabled by default). The envelopes of FM instances controls gain, modulation index, and filter cutoff (assuming an appropriate value for filterMult).

```javascript
// run all at once

fm = Gibberish.instruments.FM({
  modulatorWaveform:'square', // or saw, sine etc.
}).connect()

Gibberish.Sequencer({ 
  target:fm,
  key:'cmRatio',
  values:[ function() { return .15 + Math.random() * 10 } ],
  timings:[22050]
}).start()

Gibberish.Sequencer({ 
  target:fm,
  key:'index',
  values:[ function() { return .5 + Math.random() * 20 } ],
  timings:[22050]
}).start()

Gibberish.Sequencer({ 
  target:fm,
  key:'note',
  values:[ 440 ],
  timings:[ 44100 ]
}).start()
```

####Properties####
###fm.cmRatio###
*float* default: 2. This controls the relationship between the carrier oscillator's frequency and the modulating oscillator's frequency. A value of `2` means that, given a carrier frequency of 440, the modulator frequency will be 880.
###fm.index###
*float* default: 5. In canonical FM synthesis, the amplitude of the modulating oscillator is controlled by the frequency of the carrier on the 'modulation index' parameter. Given a carrier frequency of 440 and `index` property of `5`, the amplitude of the modulating oscillator will be `440 * 5 = 2200`.
###fm.antialias###
*boolean* default: false. If this property is true, both the carrier and modulator will use higher quality (and more computationally expensive) anti-aliasing oscillators.
###fm.panVoices###
*boolean* default: false. If true, the synth will expose a pan property for stereo panning; otherwise, the synth is mono.
###fm.pan###
*float* range: 0-1, default: .5. If the `panVoices` property of the synth is `true`, this property will determine the position of the synth in the stereo spectrum. `0` = left, `.5` = center, `1` = right. 
###fm.attack###
*int* default: 44100. The length of the attack portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled. 
###fm.decay###
*int* default: 44100. The length of the decay portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled.
###fm.gain###
*float* default: 1. A scalar applied to the output of the synth. It is modulated by the synth's envelope.
###fm.carrierWaveform###
*string* default: 'sine'. Controls the waveform of the carrier oscillator. Choose between 'sine','saw','square', and 'pwm'.
###fm.modulatorWaveform###
*string* default: 'sine'. Controls the waveform of the modulating oscillator. Choose between 'sine','saw','square', and 'pwm'.
###fm.filterType###
*int* default: 0. Select a filter type. `0` - no filter. `1` - 'classic' Gibberish 4-pole resonant filter. `2` - Zero-delay (aka virtual analog) 4-pole Moog-style ladder filter. `2` - Zero-delay (aka virtual analog) resonant diode filter, modeled after the TB-303.
###fm.cutoff###
*float* default: 440. Controls the cutoff frequncy of the filter, if enabled. IMPORTANT NOTE: If filter type 1 is chosen, the cutoff frequency should be provided as a value between 0 to 1... this will be connected in the future.
###fm.filterMult###
*float* default: 440. Controls modulation applied to the cutoff frequency by the synth's envelope. For example, given a `cutoff` property of `440` and a `filterMult` of `440`, the final cutoff frequency will vary between 440 and 880 Hz as the envelope increases and decreases in value. Use low `cutoff` values and high `filterMult` values to create filter sweeps for each note that is played. 
###fm.Q###
*float* default: 8. Controls the filter 'quality' (aka resonance), if the filter for the synth is enabled. IMPORTANT NOTE: Be careful with this setting as all filters are potentially self-oscillating and can explode. For filter type 2, stay lower than 10 to be safe, and even lower than that using high cutoff frequencies. For filter type 3, stay lower than 20 to be safe, and again, adjust this value depending on cutoff / filterMult property values.
###fm.resonance###
*float* default: 3.5. This property only affects the resonance for filter type 1. Values above 4 are typically self-oscillating, depending on the cutoff frequency.
###fm.saturation###
*float* default: 1. For filter type 3 (modeled TB-303), this value controls a non-linear waveshaping (distortion) applied to the signal before entering the filter stage. A value of 1 means no saturation is added, higher values yield increasing distortion.

Hat
----
*Prototype: [Gibberish.prototypes.instrument](#instruments-instrument)*

The `Hat` unit generator emulates the hihat sound found on the Roland TR-808 drum machine. It consists of six tuned square waves feeding bandpass and highpass filters scaled by an exponential decay.

```javascript
// run line by line
hat = Gibberish.Hat().connect()
hat.trigger( .5 )
hat.decay = .25
hat.trigger( .5 )
hat.tune = .75
hat.trigger( .5 )
hat.decay = .8
hat.tune = .25
hat.trigger( .5 )
```

####Properties####
###hat.decay###
*float* range: 0-1, default: .5 This value controls the decay length of each note. 0 represents a decay of 0 samples (and thus no sound, don't do this) while a value of 1 represents two seconds.
###hat.gain###
*float* default: .25 This value controls the loudness of each note.
###hat.tune###
*float* range:0-1, default: .5. This value controls both the frequencies of the squarewave oscillators used in the synth and the cutoff frequencies of its filters.

Karplus
----
*Prototype: [Gibberish.prototypes.instrument](#instruments-instrument)*

The `Karplus` unit generator uses the Karplus-Strong physical model to create a plucked string sound.
```javascript
// run line by line
pluck = Gibberish.Karplus().connect()
pluck.note( 440 )
pluck.decay = 4 // seconds
pluck.note( 440 )
```

####Properties####
###karplus.decay###
*float* default: .5 This value controls the decay length of each note, measured in seconds.
###karplus.damping###
*float* range: 0-1, default: .2. The amount of damping on the string.  
###karplus.gain###
*float* range:0-1, default:1. The loudness of notes
###karplus.glide***
*int* range:1-?, default:1. A portamento affect applied to frequency. Increasing this will cause notes to slide into each other, as opposed to using discrete frequencies.
###karplus.panVoices###
*boolean* default: false. If true, the synth will expose a pan property for stereo panning; otherwise, the synth is mono.
###karplus.pan###
*float* range: 0-1, default: .5. If the `panVoices` property of the synth is `true`, this property will determine the position of the synth in the stereo spectrum. `0` = left, `.5` = center, `1` = right. 

Kick
----
*Prototype: [Gibberish.prototypes.instrument](#instruments-instrument)*

The `Kick` unit generator emulates the kick sound found on the Roland TR-808 drum machine. It consists of an impulse feeding resonant bandpass and hipass filters scaled by an exponential decay.

```javascript
// run line by line
kick = Gibberish.instruments.Conga().connect()
kick.note( 90 )
kick.decay( .25 )
kick.note( 90 )
```

####Properties####
###kick.decay###
*float* range: 0-1, default: .9. This value controls the decay length of each note.
###kick.gain###
*float* default: .25. This value controls the loudness of each note.
###kick.tone###
*float* range: 0-1, default: .25. This value controls the high frequency content (the 'click') at the start of each kick drum trigger. 

Monosynth
----
*Prototype: [Gibberish.prototypes.instrument](#instruments-instrument)*

The `Monosynth` instrument provides a three-oscillator synth feeding a filter with selectable models. The envelopes of Monosynth instances controls gain and filter cutoff (assuming an appropriate value for filterMult).

```javascript
// run all at once

mono = Gibberish.instruments.Monosynth({
  waveform: 'saw',   // or saw, sine, pwm etc.
  filterType: 2,     // 4-pole "virtual analog" ladder filter
  filterMult: 1760,
  Q: 18,
  gain:.1
}).connect()

Gibberish.Sequencer({ 
  target:mono,
  key:'note',
  values:[ 110 ],
  timings:[ 44100 ]
}).start()
```

####Properties####

###monosynth.antialias###
*boolean* default: false. If this property is true, both the carrier and modulator will use higher quality (and more computationally expensive) anti-aliasing oscillators.

###monosynth.attack###
*int* default: 44100. The length of the attack portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled. 
###monosynth.decay###
*int* default: 44100. The length of the decay portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled.
###monosynth.gain###
*float* default: 1. A scalar applied to the output of the synth. It is modulated by the synth's envelope.
###monosynth.waveform###
*string* default: 'sine'. Controls the waveform of the three monosynth oscillators. Choose between 'sine','saw','square', and 'pwm'.
###monosynth.detune2###
*float* default: 1.01. Determines the frequency of the second oscillator by adding the frequency of the first multiplied by this value, or `osc2.frequency = osc1.frequency + ( osc1.frequency * detune2 )`.
###monosynth.detune3###
*float* default: 2,99. Determines the frequency of the third oscillator by adding the frequency of the first multiplied by this value, or `osc3.frequency = osc1.frequency + ( osc1.frequency * detune3 )`.
###monosynth.panVoices###
*boolean* default: false. If true, the synth will expose a pan property for stereo panning; otherwise, the synth is mono.
###monosynth.pan###
*float* range: 0-1, default: .5. If the `panVoices` property of the synth is `true`, this property will determine the position of the synth in the stereo spectrum. `0` = left, `.5` = center, `1` = right. 
###monosynth.filterType###
*int* default: 1. Select a filter type. `0` - no filter. `1` - 'classic' Gibberish 4-pole resonant filter. `2` - Zero-delay (aka virtual analog) 4-pole Moog-style ladder filter. `2` - Zero-delay (aka virtual analog) resonant diode filter, modeled after the TB-303.
###monosynth.cutoff###
*float* default: 440. Controls the cutoff frequncy of the filter, if enabled. IMPORTANT NOTE: If filter type 1 is chosen, the cutoff frequency should be provided as a value between 0 to 1... this will be connected in the future.
###monosynth.filterMult###
*float* default: 440. Controls modulation applied to the cutoff frequency by the synth's envelope. For example, given a `cutoff` property of `440` and a `filterMult` of `440`, the final cutoff frequency will vary between 440 and 880 Hz as the envelope increases and decreases in value. Use low `cutoff` values and high `filterMult` values to create filter sweeps for each note that is played. 
###monosynth.Q###
*float* default: 8. Controls the filter 'quality' (aka resonance), if the filter for the synth is enabled. IMPORTANT NOTE: Be careful with this setting as all filters are potentially self-oscillating and can explode. For filter type 2, stay lower than 10 to be safe, and even lower than that using high cutoff frequencies. For filter type 3, stay lower than 20 to be safe, and again, adjust this value depending on cutoff / filterMult property values.
###monosynth.resonance###
*float* default: 3.5. This property only affects the resonance for filter type 1. Values above 4 are typically self-oscillating, depending on the cutoff frequency.
###monosynth.saturation###
*float* default: 1. For filter type 3 (modeled TB-303), this value controls a non-linear waveshaping (distortion) applied to the signal before entering the filter stage. A value of 1 means no saturation is added, higher values yield increasing distortion.

Sampler
----
*Prototype: [Gibberish.prototypes.instrument](#instruments-instrument)*

The `Sampler` synth loads external audiofiles and plays them at variable rates. The sampler will begin playback at according to its `start` property value and end it according to its `end` property value.

```javascript
rhodes = Gibberish.instruments.Sampler({
  filename:'http://127.0.0.1:25000/playground/resources/audiofiles/rhodes.wav'
}).connect()

rhodes.onload = function() {
  rhodes.note( -4 ) // play sample in reverse at 4x speed.
}
```

####Properties####
###sampler.filename###
*string* This must be passed in the properties dictionary handed to the constructor and point to a file on a web server that you have access to or that permits CORS operations.
###sampler.loops###
*boolean* default: false. If this value is true, the sample will repeat playback continuously.
###sampler.gain###
*float* default: .25. This value controls the loudness of each note.
###sampler.start###
*int* default: 0. The sample offset to begin playback at.
###sampler.end###
*int* default: sample.length. The last sample to play in the audiofile.

Snare
----
*Prototype: [Gibberish.prototypes.instrument](#instruments-instrument)*

The `Snare` instrument emulates the snare sound found on the Roland TR-808 drum machine. It consists of an two resonant bandpass filters mixed with highpassed noise, all scaled by an exponential decay.

```javascript
// run line by line
snare = Gibberish.instruments.Snare().connect()
snare.trigger( .5 )
snare.decay( .25 )
snare.tune = -.25
snare.trigger( .5 )
```

####Properties####
###snare.decay###
*float* range: 0-1, default: .1. This value controls the decay length of each snare strike, ranging from 0 to 2 seconds.
###snare.gain###
*float* default: .25. This value controls the loudness of each note.
###snare.snappy###
*float* range: 0-?, default: 1. A scalar controlling the amount of noise in the overall snare output.
###snare.tune###
*float* range: -.5-2, default: 0. This value modifies the tuning of the two bandpass filters and the highpass filter used in the snare instrument.

Synth
----
*Prototype: [Gibberish.prototypes.instrument](#instruments-instrument)*

The `Synth` instrument provides a single oscillator feeding a filter with selectable models. The envelopes of Synth instances controls gain and filter cutoff (assuming an appropriate value for filterMult).

```javascript
// run all at once

syn = Gibberish.instruments.Synth({
  waveform: 'saw',   // or saw, sine, pwm etc.
  filterType: 3,     // 303-style "virtual analog" diode filter
  filterMult: 1760,
  Q: 9,
  attack:44, decay:11025,
  gain:.1
}).connect()

Gibberish.Sequencer({ 
  target:synth,
  key:'note',
  values:[ 110 ],
  timings:[ 22050 ]
}).start()
```

####Properties####

###synth.antialias###
*boolean* default: false. If this property is true, both the carrier and modulator will use higher quality (and more computationally expensive) anti-aliasing oscillators.
###synth.attack###
*int* default: 44100. The length of the attack portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled. 
###synth.decay###
*int* default: 44100. The length of the decay portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled.
###synth.gain###
*float* default: 1. A scalar applied to the output of the synth. It is modulated by the synth's envelope.
###synth.waveform###
*string* default: 'sine'. Controls the waveform of the three monosynth oscillators. Choose between 'sine','saw','square', and 'pwm'.
###synth.panVoices###
*boolean* default: false. If true, the synth will expose a pan property for stereo panning; otherwise, the synth is mono.
###synth.pan###
*float* range: 0-1, default: .5. If the `panVoices` property of the synth is `true`, this property will determine the position of the synth in the stereo spectrum. `0` = left, `.5` = center, `1` = right. 
###synth.filterType###
*int* default: 1. Select a filter type. `0` - no filter. `1` - 'classic' Gibberish 4-pole resonant filter. `2` - Zero-delay (aka virtual analog) 4-pole Moog-style ladder filter. `2` - Zero-delay (aka virtual analog) resonant diode filter, modeled after the TB-303.
###synth.cutoff###
*float* default: 440. Controls the cutoff frequncy of the filter, if enabled. IMPORTANT NOTE: If filter type 1 is chosen, the cutoff frequency should be provided as a value between 0 to 1... this will be connected in the future.
###synth.filterMult###
*float* default: 440. Controls modulation applied to the cutoff frequency by the synth's envelope. For example, given a `cutoff` property of `440` and a `filterMult` of `440`, the final cutoff frequency will vary between 440 and 880 Hz as the envelope increases and decreases in value. Use low `cutoff` values and high `filterMult` values to create filter sweeps for each note that is played. 
###synth.Q###
*float* default: 8. Controls the filter 'quality' (aka resonance), if the filter for the synth is enabled. IMPORTANT NOTE: Be careful with this setting as all filters are potentially self-oscillating and can explode. For filter type 2, stay lower than 10 to be safe, and even lower than that using high cutoff frequencies. For filter type 3, stay lower than 20 to be safe, and again, adjust this value depending on cutoff / filterMult property values.
###synth.resonance###
*float* default: 3.5. This property only affects the resonance for filter type 1. Values above 4 are typically self-oscillating, depending on the cutoff frequency.
###synth.saturation###
*float* default: 1. For filter type 3 (modeled TB-303), this value controls a non-linear waveshaping (distortion) applied to the signal before entering the filter stage. A value of 1 means no saturation is added, higher values yield increasing distortion.

# Effects
Effect
----
*Gibberish.prototypes.effect*  
*Prototype: [Gibberish.prototypes.ugen](#-ugen)*

This is the prototype for all effect unit generators. There are currently no methods associated with it.

Bitcrusher
----
*Prototype: [Gibberish.prototypes.effect](#effects-effect)*

The `BitCrusher` effect provides both bit-depth and sample-rate reduction to create distortion.
```javascript
syn = Gibberish.instruments.Synth({ attack:44 })

crush = Gibberish.effects.BitCrusher({ 
  input:synth,
  sampleRate:
}).connect()

syn.note( 220 )
```

####Properties####
###bitcrusher.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect.
###bitcrusher.sampleRate###
*float* range: 0-1, default: .5. Re-samples the input unit generator at a lower rate. A value of .5 (the default) means that every other sample will be sampled and held; a value of .25 means that every fourth sample will be sampled and held.
###bitcrusher.bitCrusher###
*float* range:0-1, default: .5. Decreases the dynamic range of the incoming signal and truncates values outside of the range.

Chorus
----
*Prototype: [Gibberish.prototypes.effect](#effects-effect)*

The `Chorus` effect. TODO: Not currently implemented.   

Delay
----
*Prototype: [Gibberish.prototypes.effect](#effects-effect)*

The `Delay` delays an incoming signal. It also provides a simple feedback control.
 
```javascript
syn = Gibberish.instruments.Synth({ attack:44 })

delay = Gibberish.effects.Delay({ 
  input:synth,
  delayTime: 5512,
  feedback: .9
}).connect()

syn.note( 220 )
```

####Properties####
###delay.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect.
###delay.delayTime###
*int* default: 11025. The number of samples to delay the incoming signal by.
###delay.feedback###
*float* range:0-1, default: .925. The amount of delayed signal to be fed back into the delay line.
 
Flanger
----
*Prototype: [Gibberish.prototypes.effect](#effects-effect)*

The `Flanger` creates a modulated delay line, with adjustable feedback.
 
```javascript
syn = Gibberish.instruments.Synth({ attack:44 })

delay = Gibberish.effects.Flanger({ 
  input:synth,
  delayTime: 5512,
  feedback: .9
}).connect()

syn.note( 220 )
```

####Properties####
###flanger.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect.
###flanger.frequency###
*ugen* The frequency of the sine oscillator that modulates the read position of the delay line.
###flanger.offset###
*float* range: 0-1, default: .25. Controls the center offset of the modulated delay line. Larger values will result in wider pitch fluctuations.
###flanger.feedback###
*float* range:0-1, default: .925. The amount of delayed signal to be fed back into the delay line.

Freeverb
----
*Prototype: [Gibberish.prototypes.effect](#effects-effect)*

The `Freeverb` effect is based on the Schroeder-Moorer model of reverberation. One of its main strengths is easy control via two primary properties: `roomSize` to set the amount of reverberation and `damping` to attenuate high frequencies. 

```javascript
syn = Gibberish.instruments.Synth({ attack:44 })

verb = Gibberish.effects.Freeverb({ 
  input:synth,
  roomSize:.95
}).connect()

syn.note( 220 )
```

####Properties####
###freeverb.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect.
###freeverb.roomSize###
*float* range: 0-1, default: .84. This is an important control of the overall reverberation time. Technically, it controls the amount of feedback used by the comb filters that are part of the Freeverb algorithm.
###freeverb.damping###
*float* range:0-1, default: .5. This value attenuates high-frequency signals in the reverberation by low-pass filtering from one sample to the next in the comb filters. Low values simulate reflective walls.
###freeverb.dry###
*float* range: 0-1, default: .5. Controls the amount of non-reverberated signal sent to the output.
###freeverb.wet1###
*float* range: 0-1, default: 1. Controls the amount of reverberated signal sent to the left output. When this value is significantly different from the `wet2` property, there will be an increased stereo result. `wet1` and `wet2` default to opposite values to maximize this stereo effect.
###freeverb.wet2###
*float* range: 0-1, default: 0. Controls the amount of non-reverberated signal sent to the right output. See `wet1` for more information.

RingMod
----
*Prototype: [Gibberish.prototypes.effect](#effects-effect)*

The `RingMod` multiplies an input signal with a sine oscillator and outputs the result, yielding 'robotic' 'sci-fi' types of sounds resulting from sum and difference partials.
 
```javascript
syn = Gibberish.instruments.Synth({ attack:44 })

ringmod = Gibberish.effects.RingMod({ 
  input:syn,
  frequency: 223,
  gain: .5,
  mix: .75
}).connect()

syn.note( 466 )
```

####Properties####
###ringmod.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect.
###ringmod.frequency###
*ugen* The frequency of the modulating sine oscillator.
###ringmod.gain###
*float* range: 0-1, default: 1. Amplitude of the modulating sine oscillator.
###ringmod.mix###
*float* range:0-1, default: .5. Controls the balance between wet and dry signals. A value of `0` means only the input will be outputted. A value of `1` means only the processed, modulated signal will be outputted.

Tremolo
----
*Prototype: [Gibberish.prototypes.effect](#effects-effect)*

The `Tremolo` effect varies amplitude over time.
```javascript
syn = Gibberish.instruments.Synth({ attack:44, decay:44100 * 10 })

tremolo = Gibberish.effects.Tremolo({ 
  input:syn,
  frequency: 8,
  amount:1,
  shape:'square',
}).connect()

syn.note( 330 )
```

####Properties####
###tremolo.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect.
###tremolo.frequency###
*float* default: 4. The frequency of the modulating oscillator.
###tremolo.amount###
*float* range: 0-1, default: 1. The strength of the modulation. Given an output of y, an input of x, and a modulating oscillator z, the formula is `y = x - ( x * z )`. The `amount` property determines the amplitude of the modulating oscillator.  
###tremolo.shape###
*string* default: 'sine'. Possible values are 'sine', 'saw', and 'square'.

Vibrato
----
*Prototype: [Gibberish.prototypes.effect](#effects-effect)*

The `Vibrato` effect varies the pitch of its input over time using a modulated delay line.
```javascript
syn = Gibberish.instruments.Synth({ attack:44, decay:44100 * 10 })

vibrato = Gibberish.effects.Vibrato({ 
  input:syn,
  frequency: 2,
  amount: .5,
}).connect()

syn.note( 330 )
```

####Properties####
###vibrato.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect.
###vibrato.frequency###
*float* default:4. The frequency of the modulating oscillator.
###vibrato.amount###
*float* range: 0-1, default: .25. The strength of the modulation.   

#Filters
Filter12Biquad
----
*Prototype: [Gibberish.prototypes.filter](#filters-filter)*

The `Filter12Biquad` is a two-pole, 12dB-per-octave resonant biquad filter. It can operate in either lowpass, hipass or bandpass mode. 
 
```javascript
syn = Gibberish.instruments.Synth({ attack:44, decay:44100 * 4 })

filter = Gibberish.filters.Filter12Biquad({ 
  input:syn,
  mode:'LP',
  cutoff: Add( 550, Sine({ frequency:2, gain:330 }) ),
  Q: 20, 
}).connect()

syn.note( 220 )
```

####Properties####
###filter12Biquad.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect.
###filter12Biquad.cutoff###
*float* range: 0-nyquist, default:550. The cutoff frequency of the filter. 
###filter12Biquad.Q###
*float* range: .5-23, default: .75. Controls the resonance, or 'quality' of the filter. 
###filter12Biquad.mode###
*string* default: 'LP'. This property can only be set on initialization. Valid options are 'LP','HP', and 'BP'.

Filter12SVF
----
*Prototype: [Gibberish.prototypes.filter](#filters-filter)*

The `Filter12SVF` is a two-pole, 12dB-per-octave resonant filter. It can operate in a variety of modes. 
 
```javascript
syn = Gibberish.instruments.Synth({ attack:44, decay:44100 * 4 })

filter = Gibberish.filters.Filter12SVF({ 
  input:syn,
  mode:1, 
  cutoff: Add( 550, Sine({ frequency:2, gain:330 }) ),
  Q: 10, 
}).connect()

syn.note( 220 )
```

####Properties####
###filter12SVF.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect.
###filter12SVF.cutoff###
*float* range: 0-nyquist, default:550. The cutoff frequency of the filter. 
###filter12SVF.Q###
*float* range: .5-23, default: .75. Controls the resonance, or 'quality' of the filter. This filter tends to be stable with Q values between .5 and 20.
###filter12SVF.mode###
*int* default: 0. 0 = lowpass, 1 = hipass, 2 = bandpass, 3 = notch. This property can only be set on initialization.

Filter24Classic
----
*Prototype: [Gibberish.prototypes.filter](#filters-filter)*

The `Filter24Classic` is a four-pole, 24dB-per-octave resonant filter that can operate in either low pass or high pass mode. It is the original filter used in Gibberish. TODO: switch filter to use frequencies in Hz for cutoff.
 
```javascript
syn = Gibberish.instruments.Synth({ attack:44, decay:44100 * 4 })

filter = Gibberish.filters.Filter24Classic({ 
  input:syn,
  cutoff: Add( .2, Sine({ frequency:2, gain:.15 }) ),
  Q: 3.5, 
}).connect()

syn.note( 220 )
```

####Properties####
###filter24Classic.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect.
###filter24Classic.cutoff###
*float* range: 0-1, default:.25. The cutoff frequency of the filter. 
###filter24Classic.resonance###
*float* range: 0-4.5, default: 3. Controls the resonance, or 'quality' of the filter. With values above 4.5 this filter is highly unstable.

Filter24Moog
----
*Prototype: [Gibberish.prototypes.filter](#filters-filter)*

The `Filter24Moog` is a four-pole, 24dB-per-octave resonant filter that can only operate as a lowpass. It is a "virtual analog" filter modeled after the famous ladder filter created by Moog, based on a [Csound opcode by Steven Yi](https://github.com/kunstmusik/libsyi/blob/master/zdf.udo).

```javascript
syn = Gibberish.instruments.Synth({ attack:44, decay:44100 * 4 })

filter = Gibberish.filters.Filter24Moog({ 
  input:syn,
  cutoff: Gibberish.binops.Add( 440, Gibberish.oscillators.Sine({ frequency:2, gain:330 }) ),
  Q: 18.5, 
}).connect()

syn.note( 220 )
```

####Properties####
###filter24Moog.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect.
###filter24Moog.cutoff###
*float* range: 0-nyquist, default:440. The cutoff frequency of the filter. 
###filter24Moog.Q###
*float* range: 0-23, default: 5. Controls the resonance, or 'quality' of the filter. With values above 20 this filter is highly unstable.

Filter24TB303
----
*Prototype: [Gibberish.prototypes.filter](#filters-filter)*

The `Filter24TB303` is a four-pole, 24dB-per-octave resonant filter that can only operate as a lowpass. It is a "virtual analog" filter modeled after the diode ladder filter used in the Roland TB-303 bass synth / sequencer, a staple of many musical genres including, perhaps most famously, acid jazz. This model is based on a [Csound opcode by Steven Yi](https://github.com/kunstmusik/libsyi/blob/master/diode.udo).

```javascript
syn = Gibberish.instruments.Synth({ attack:44, decay:44100 * 4 })

filter = Gibberish.filters.Filter24TB303({ 
  input:syn,
  cutoff: Gibberish.binops.Add( 440, Gibberish.oscillators.Sine({ frequency:2, gain:330 }) ),
  Q: 9.5, 
}).connect()

syn.note( 220 )
```

####Properties####
###filter24TB303.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect.
###filter24TB303.cutoff###
*float* range: 0-nyquist, default:440. The cutoff frequency of the filter.
###filter24TB303.Q###
*float* range: 0-12, default: 5. Controls the resonance, or 'quality' of the filter. With values above 9 this filter is highly unstable.
###filter24TB303.saturation###
*float* range: 1-?, default: 1. Values higher than one add non-linear waveshaping to the signal before it is filtered, creating distortion.

#Scheduling

#Arithmetic

Abs
----
**a** &nbsp;  *ugen* or *number* &nbsp; Ugen or number. 

Outputs the absolute value of input `a`.

Add
----
**args** &nbsp;  *ugens* or *numbers* &nbsp; 

Add two ugens (or numbers) together and output the results. 

```js
mono = Gibberish.Monosynth({ filterType:2 }).connect()

// modulate filter cutoff frequency between 220-660 Hz
mono.cutoff = Gibberish.Add( 440, Gibberish.Sine({ frequency:.5, gain:220 }) )
mono.note( 440 )
```

Sub
----
**a,b** &nbsp;  *ugens* or *numbers* &nbsp; 

Subtract the output of unit generator `b` (or number `b`) from `a` and output the result. 

```js
mono = Gibberish.Monosynth({ filterType:2 }).connect()

// modulate filter cutoff frequency between 220-660 Hz
mono.cutoff = Gibberish.Sub( 440, Gibberish.Sine({ frequency:.5, gain:220 }) )
mono.note( 440 )
```

Mul
----
**a,b** &nbsp;  *ugen* or *number* &nbsp; 

Multiples the output of `a` and `b` and returns the results. 

```js
syn1 = Gibberish.Synth()
syn2 = Gibberish.Synth()
mul  = Gibberish.Mul( syn1, syn2 )

// binops don't have a `connect()` method, so we manually push
// to the inputs of the master output.
Gibberish.output.inputs.push( mul )

syn1.note(240)
syn2.note(775)
```

Div
----
**a,b** &nbsp;  *ugen* or *number* &nbsp; 

Divides the output of `a` by `b` and returns the results.

Mod
----
**a,b** &nbsp;  *ugen* or *number* &nbsp; Ugens or numbers. 

Divides ugen or number `a` by ugen or number `b` and outputs the remainder.

Pow
----
**a,b** &nbsp;  *ugen* or *number* &nbsp; Ugens or numbers. 

Raises the number or ugen `a` to the power determined by the ugen or number `b` and outputs the result.

#Misc

#Analysis

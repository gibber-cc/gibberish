# Gibberish

#### Methods ####
### gibberish.clear ###
Disconnects all ugens from the master bus and stops all sequencers from runnning.

### gibberish.init ###
The `init` method creates an `AudioContext` object, a `ScriptProcessor Node`, and connects the output of the node to the `destination` property of the AudioContext. This single line should be enough to start a Gibberish session (assuming the Gibberish library has been properly included from your HTML file).

*** memorySize *** &nbsp; *int* &nbsp; Default:44100 * 60 * 20 (twenty minutes at 44.1 kHz). This determines the size of the memory block that Gibberish will use for all ugens. If you use a lot of samples (more than twenty minutes worth) you may want to increase this size.

### gibberish.print ###
Prints the current master audio callback to the console.

### gibberish.export ###
By default, the Gibberish library is contained within the global `Gibberish` object (or whatever variable you import it into using browserify / require.js etc). However, you can easily export the Gibberish namespace to another object (for example, the `window` object) for easier API access. 

*** target *** &nbsp; *object*. The object to export the Gibberish namespace to.  
*** shouldExportGenish *** &nbsp; *boolean* &nbsp; Default:false. Determines whether or not the lower-level unit generators found in genish.js are also exported to the target object. Note that many variables names in genish and Gibberish are only differentiated by lowercase vs uppercase letters... for example, Gibberish has `Add`, `ADSR`, and `Mod` ugens, while genish has `add`, `adsr`, and `mod`. 

#### Propertie s####
### gibberish.debug ###
*boolean* Default:false. When this value is set to true, callbacks will be printed to the console whenever they are generated.
### gibberish.output ###
*Bus2* The master bus that all Gibberish ugens eventually feed into. This bus is created during calls to `Gibberish.init()`.


# Prototypes

ugen
----
*Gibberish.prototypes.ugen*

The ugen object is the primary prototype for all unit generators in Gibberish.js. All ugens with the exception of simple binop / monop math operations (add, mul, abs etc.) delegate to this prototype object. 

#### Methods ####
### ugen.print ###
Calls to `ugen.print()` will write a unit generators callback function to the `console` object.

### ugen.free ###
Frees the memory associated with a unit generator.

### ugen.connect ###

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

### ugen.disconnect ###

**ugen** &nbsp; *object* &nbsp; Optional. The unit generator calling `disconnect` will be disconnected from this destination. If this argument is ommitted, the unit generator will be disconnected from all unit generators it is currently connected to.

effect
----
*Gibberish.prototypes.effect*  
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

This is the prototype for all effect unit generators. There are currently no methods associated with it.

filter
----
*Gibberish.prototypes.filter*  
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

This is the prototype for all filters. There are currently no methods associated with it.

instrument
----
*Gibberish.prototypes.instrument*  
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

Monophonic instruments in Gibberish (such as Synth, FM, and Monosynth) delegate to this prototype for `note` and `trigger` methods, while polyphonic instruments use a mixin (polytemplate.js). 

#### Methods ####
### instrument.note( frequency  ) ###
**frequency** &nbsp;  *number* &nbsp; The frequency for the new note to be played.

The `note` method assigns a new frequency to the instrument and re-triggers the instrument's envelope. For some percussion instruments that use fixed frequencies (Cowbell, Snare, and Hat) this method will trigger the instrument's envelope but the argument frequency will have no effect.

```javascript
fm = Gibberish.FM().connect()
fm.note( 330 )
```

### instrument.trigger( loudness  ) ###
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

# Mixins

polyinstrument
----
*Gibberish.mixins.polyinstrumentn*  

Polyphonic instruments in Gibberish (such as Synth, FM, and Monosynth) use this mixin for `note`, `trigger`, and `chord` methods. Note that polyphonic instruments also use `Bus` and `Bus2` objects as prototypes. 

#### Methods ####
### polyinstrument.chord( frequencies  ) ###
**frequency** &nbsp;  *array* &nbsp; The frequencies of the chord to be played.

The `chord` method selects voices from the polyphonic instrument, assigns them new frequencies, and triggers their envelopes. The number of notes concurrently playable is determined by the instrument's `maxVoices` property. Using the `chord` method with three frequencies is functionally identical to calling `note` three times simultaneously.
 
```javascript
fm = Gibberish.PolyFM({ maxVoices:3, decay: 88200 * 2 }).connect()
fm.chord([ 330,440,550 ])
```
### polyinstrument.note( frequency  ) ###
**frequency** &nbsp;  *number* &nbsp; The frequency for the new note to be played.

The `note` method selects a child voice from the polyphonic instrument, assigns it a new frequency, and triggers the instrument's envelope. The number of notes concurrently playable is determined by the instruments `maxVoices` property.
 
```javascript
fm = Gibberish.PolyFM({ maxVoices:3, decay: 88200 * 2 }).connect()
fm.note( 330 )
fm.note( 440 )
fm.note( 550 )
```

### polyinstrument.trigger( loudness  ) ###
**loudness** &nbsp;  *number* &nbsp; A scalar applied to the gain envelope of the new note.

Trigger a note or chord at the last used frequency(ies) with the provided `loudness` as a scalar.

```javascript
syn = Gibberish.PolySynth({ attack:44, decay:22050 }).connect()
syn.chord([ 330,440,550 ])


Gibberish.Sequencer({ 
  target:syn, 
  key:'trigger', 
  values:[ .1,.2,.3,.5], 
  timings:[11025]
}).start()
```

# Instruments

Conga
----
*Prototype: [Gibberish.prototypes.instrument](#prototypes-instrument)*

The `Conga` unit generator emulates the conga sound found on the Roland TR-808 drum machine. It consists of an impulse feeding a resonant filter scaled by an exponential decay.

```javascript
// run line by line
conga = Gibberish.Conga().connect()
conga.note( 440 )
conga.decay( .25 )
conga.note( 440 )
```

#### Properties ####
### conga.decay ###
*float* range: 0-1, default: .85 This value controls the decay length of each note.
### conga.gain ###
*float* default: .25 This value controls the loudness of each note.

Cowbell
----
*Prototype: [Gibberish.prototypes.instrument](#prototypes-instrument)*

The `Cowbell` unit generator emulates the cowbell sound found on the Roland TR-808 drum machine. It consists of an two tuned square waves feeding a resonant bandpass filter scaled by an exponential decay.

```javascript
// run line by line
conga = Gibberish.Conga().connect()
conga.trigger( .5 )
conga.decay( .05 )
conga.trigger( .75 )
```

#### Properties ####
### cowbell.decay ###
*float* range: 0-1, default: .5 This value controls the decay length of each note. 0 represents a decay of 0 samples (and thus no sound, don't do this) while a value of 1 represents two seconds.
### cowbell.gain ###
*float* default: .25 This value controls the loudness of each note.

FM
----
*Prototype: [Gibberish.prototypes.instrument](#prototypes-instrument)*

The `FM` unit generator provides two-operator FM synthesis with a choice of waveforms for both carrier and modulator, as well as a filter with selectable models (disabled by default). In addition to modulating the frequency of the carrier oscillator, the modulator may also modulate itself via a single sample feedback loop. The amount of feedback is determined both by the `index` property of the FM instance (which also controls how much the modulator affects the carrier frequency) and a separate `feedback` parameter which scales the amount of self-modulation. The envelopes of FM instances controls gain, modulation index, and filter cutoff (assuming an appropriate value for filterMult).

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

#### Properties ####
### fm.cmRatio ###
*float* default: 2. This controls the relationship between the carrier oscillator's frequency and the modulating oscillator's frequency. A value of `2` means that, given a carrier frequency of 440, the modulator frequency will be 880.
### fm.index ###
*float* default: 5. In canonical FM synthesis, the amplitude of the modulating oscillator is controlled by the frequency of the carrier on the 'modulation index' parameter. Given a carrier frequency of 440 and `index` property of `5`, the amplitude of the modulating oscillator will be `440 * 5 = 2200`.
### fm.feedback ###  
*float* default: 0. A scalar which determines how much the output of the modulating oscillator affects the frequency of the modulating oscillator via a single-sample feedback loop. Note: high values (>1) coupled with high index values can cause the algorithm to blow-up.
### fm.antialias ###
*boolean* default: false. If this property is true, both the carrier and modulator will use higher quality (and more computationally expensive) anti-aliasing oscillators.
### fm.panVoices ###
*boolean* default: false. If true, the synth will expose a pan property for stereo panning; otherwise, the synth is mono.
### fm.pan ###
*float* range: 0-1, default: .5. If the `panVoices` property of the synth is `true`, this property will determine the position of the synth in the stereo spectrum. `0` = left, `.5` = center, `1` = right. 
### fm.attack ###
*int* default: 44. The length of the attack portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled. 
### fm.decay ###
*int* default: 22050. The length of the decay portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled.
### fm.sustain ###
*int* default: 44100. The length of the sustain portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled. Note that the sustain will last until the synth's `synth.env.release()` method is triggered if the synth's `triggerRelease` property is set to `true`.
###fm.sustainLevel###
*float* default: .6. The gain stage of the sustain portion of the synth's envelope. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled. Sustain and release are only used if the `useADSR` property of the synth is set to be true.
### fm.release ###
*int* default: 22050. The length of the decay portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled.
### fm.useADSR ###
*bool* default: false. Determines whether a synth uses a two stage (AD) or four-stage (ADSR) envelope.
### fm.triggerRelease ###
*bool* default: false. Assuming a synth's `useADSR` property is also set to `true`, a value of `true` on this property will continue the sustain stage of an ADSR indefinitely until the synth's envelope receives a release  message (i.e `synth.env.release()`)
### fm.gain ###
*float* default: 1. A scalar applied to the output of the synth. It is modulated by the synth's envelope.
### fm.carrierWaveform ###
*string* default: 'sine'. Controls the waveform of the carrier oscillator. Choose between 'sine','saw','square', and 'pwm'.
### fm.modulatorWaveform ###
*string* default: 'sine'. Controls the waveform of the modulating oscillator. Choose between 'sine','saw','square', and 'pwm'.
### fm.filterType ###
*int* default: 0. Select a filter type. `0` - no filter. `1` - 'classic' Gibberish 4-pole resonant filter. `2` - Zero-delay (aka virtual analog) 4-pole Moog-style ladder filter. `2` - Zero-delay (aka virtual analog) resonant diode filter, modeled after the TB-303.
### fm.filterMode ###
*int* default: 0. Select a filter mode. `0` - low pass. `1` - high pass, available for filter types 1, 4, and 5. `2` -
bandpass, available for filter types 4 and 5. `3` - notch, available efor filter type 4.
### fm.cutoff ###
*float* default: 440. Controls the cutoff frequncy of the filter, if enabled. IMPORTANT NOTE: If filter type 1 is chosen, the cutoff frequency should be provided as a value between 0 to 1... this will be connected in the future.
### fm.filterMult ###
*float* default: 440. Controls modulation applied to the cutoff frequency by the synth's envelope. For example, given a `cutoff` property of `440` and a `filterMult` of `440`, the final cutoff frequency will vary between 440 and 880 Hz as the envelope increases and decreases in value. Use low `cutoff` values and high `filterMult` values to create filter sweeps for each note that is played. 
### fm.Q ###
*float* default: 8. Controls the filter 'quality' (aka resonance), if the filter for the synth is enabled. IMPORTANT NOTE: Be careful with this setting as all filters are potentially self-oscillating and can explode. For filter type 2, stay lower than 10 to be safe, and even lower than that using high cutoff frequencies. For filter type 3, stay lower than 20 to be safe, and again, adjust this value depending on cutoff / filterMult property values.
### fm.resonance ###
*float* default: 3.5. This property only affects the resonance for filter type 1. Values above 4 are typically self-oscillating, depending on the cutoff frequency.
### fm.saturation ###
*float* default: 1. For filter type 3 (modeled TB-303), this value controls a non-linear waveshaping (distortion) applied to the signal before entering the filter stage. A value of 1 means no saturation is added, higher values yield increasing distortion.

PolyFM
---
*Prototype: [Gibberish.Bus2](#miscellaneous-bus2)*  
*Mixin: [Gibberish.mixins.polyinstrument](#mixins-polyinstrument)*

`PolyFM` objects have the same properties as [FM objects](#instruments-fm); when you change one of these property values all the child voices have their same property modified. The `maxVoices` option, which can only be set upon instantiation, determines the number of voices. Whenever a note is played a voice is chosen and connected to the `PolyFM` ugen, which acts as a bus. When the envelope of the note is finished the associated voice is disconnected from the `PolyFM` ugen.

```javascript
a = PolyFM({ maxVoices:3 }).connect()
a.chord([ 330,440,550 ])
```

Hat
----
*Prototype: [Gibberish.prototypes.instrument](#prototypes-instrument)*

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

#### Properties ####
### hat.decay ###
*float* range: 0-1, default: .5 This value controls the decay length of each note. 0 represents a decay of 0 samples (and thus no sound, don't do this) while a value of 1 represents two seconds.
### hat.gain ###
*float* default: .25 This value controls the loudness of each note.
### hat.tune ###
*float* range:0-1, default: .5. This value controls both the frequencies of the squarewave oscillators used in the synth and the cutoff frequencies of its filters.

Karplus
----
*Prototype: [Gibberish.prototypes.instrument](#prototypes-instrument)*

The `Karplus` unit generator uses the Karplus-Strong physical model to create a plucked string sound.
```javascript
// run line by line
pluck = Gibberish.Karplus().connect()
pluck.note( 440 )
pluck.decay = 4 // seconds
pluck.note( 440 )
```

#### Properties ####
### karplus.decay ###
*float* default: .5 This value controls the decay length of each note, measured in seconds.
### karplus.damping ###
*float* range: 0-1, default: .2. The amount of damping on the string.  
### karplus.gain ###
*float* range:0-1, default:1. The loudness of notes
### karplus.glide ###
*int* range:1-?, default:1. A portamento affect applied to frequency. Increasing this will cause notes to slide into each other, as opposed to using discrete frequencies.
### karplus.panVoices ###
*boolean* default: false. If true, the synth will expose a pan property for stereo panning; otherwise, the synth is mono.
### karplus.pan ###
*float* range: 0-1, default: .5. If the `panVoices` property of the synth is `true`, this property will determine the position of the synth in the stereo spectrum. `0` = left, `.5` = center, `1` = right. 

PolyKarplus
---
*Prototype: [Gibberish.Bus2](#miscellaneous-bus2)*  
*Mixin: [Gibberish.mixins.polyinstrument](#mixins-polyinstrument)*

`PolyKarplus` objects have the same properties as [Karplus objects](#instruments-karplus); when you change one of these property values all the child voices have their same property modified. The `maxVoices` option, which can only be set upon instantiation, determines the number of voices. Whenever a note is played a voice is chosen and connected to the `PolyKarplus` ugen, which acts as a bus. When the envelope of the note is finished the associated voice is disconnected from the `PolgyKarplus` ugen.

```javascript
a = PolyKarplus({ maxVoices:3 }).connect()
a.chord([ 330,440,550 ])
```

Kick
----
*Prototype: [Gibberish.prototypes.instrument](#prototypes-instrument)*

The `Kick` unit generator emulates the kick sound found on the Roland TR-808 drum machine. It consists of an impulse feeding resonant bandpass and hipass filters scaled by an exponential decay.

```javascript
// run line by line
kick = Gibberish.instruments.Conga().connect()
kick.note( 90 )
kick.decay( .25 )
kick.note( 90 )
```

#### Properties ####
###kick.decay###
*float* range: 0-1, default: .9. This value controls the decay length of each note.
###kick.gain###
*float* default: .25. This value controls the loudness of each note.
###kick.tone###
*float* range: 0-1, default: .25. This value controls the high frequency content (the 'click') at the start of each kick drum trigger. 

Monosynth
----
*Prototype: [Gibberish.prototypes.instrument](#prototypes-instrument)*

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
*int* default: 44. The length of the attack portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled. 
###monosynth.decay###
*int* default: 22050. The length of the decay portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled.
###monosynth.sustain###
*int* default: 44100. The length of the sustain portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled. Note that the sustain will last until the synth's `synth.env.release()` method is triggered if the synth's `triggerRelease` property is set to `true`.
###monosynth.sustainLevel###
*float* default: .6. The gain stage of the sustain portion of the synth's envelope. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled. Sustain and release are only used if the `useADSR` property of the synth is set to be true.
###monosynth.release###
*int* default: 22050. The length of the decay portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled.
###monosynth.useADSR###
*bool* default: false. Determines whether a synth uses a two stage (AD) or four-stage (ADSR) envelope.
###monosynth.triggerRelease###
*bool* default: false. Assuming a synth's `useADSR` property is also set to `true`, a value of `true` on this property will continue the sustain stage of an ADSR indefinitely until the synth's envelope receives a release  message (i.e `synth.env.release()`)
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
###monosynth.filterMode###
*int* default: 0. Select a filter mode. `0` - low pass. `1` - high pass, available for filter types 1, 4, and 5. `2` -
bandpass, available for filter types 4 and 5. `3` - notch, available efor filter type 4.
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

PolyMono
---
*Prototype: [Gibberish.Bus2](#miscellaneous-bus2)*  
*Mixin: [Gibberish.mixins.polyinstrument](#mixins-polyinstrument)*

`PolyMono` objects have the same properties as [Monosynth objects](#instruments-monosynth); when you change one of these property values all the child voices have their same property modified. The `maxVoices` option, which can only be set upon instantiation, determines the number of voices. Whenever a note is played a voice is chosen and connected to the `PolyMono` ugen, which acts as a bus. When the envelope of the note is finished the associated voice is disconnected from the `PolgyMono` ugen.

```javascript
a = PolyMono({ maxVoices:3 }).connect()
a.chord([ 330,440,550 ])
```

Sampler
----
*Prototype: [Gibberish.prototypes.instrument](#prototypes-instrument)*

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
*Prototype: [Gibberish.prototypes.instrument](#prototypes-instrument)*

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
*Prototype: [Gibberish.prototypes.instrument](#prototypes-instrument)*

The `Synth` instrument provides a single oscillator feeding a filter with selectable models. The envelopes of Synth instances controls gain and filter cutoff (assuming an appropriate value for filterMult).

```javascript
// run all at once

syn = Gibberish.instruments.Synth({
  waveform: 'saw',   // or saw, sine, pwm etc.
  filterType: 3,     // 303-style 'virtual analog' diode filter
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
*int* default: 44. The length of the attack portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled. 
###synth.decay###
*int* default: 22050. The length of the decay portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled.
###synth.sustain###
*int* default: 44100. The length of the sustain portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled. Note that the sustain will last until the synth's `synth.env.release()` method is triggered if the synth's `triggerRelease` property is set to `true`.
###synth.sustainLevel###
*float* default: .6. The gain stage of the sustain portion of the synth's envelope. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled. Sustain and release are only used if the `useADSR` property of the synth is set to be true.
###synth.release###
*int* default: 22050. The length of the decay portion of the synth's envelope measured in samples. The envelope modulates amplitude, the index property, and the filter cutoff frequency (if the filter is enabled.
###synth.useADSR###
*bool* default: false. Determines whether a synth uses a two stage (AD) or four-stage (ADSR) envelope.
###synth.triggerRelease###
*bool* default: false. Assuming a synth's `useADSR` property is also set to `true`, a value of `true` on this property will continue the sustain stage of an ADSR indefinitely until the synth's envelope receives a release  message (i.e `synth.env.release()`)
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
###synth.filterMode###
*int* default: 0. Select a filter mode. `0` - low pass. `1` - high pass, available for filter types 1, 4, and 5. `2` -
bandpass, available for filter types 4 and 5. `3` - notch, available efor filter type 4.
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

PolySynth
---
*Prototype: [Gibberish.Bus2](#miscellaneous-bus2)*  
*Mixin: [Gibberish.mixins.polyinstrument](#mixins-polyinstrument)*

`PolySynth` objects have the same properties as [Synth objects](#instruments-synth); when you change one of these property values all the child voices have their same property modified. The `maxVoices` option, which can only be set upon instantiation, determines the number of voices. Whenever a note is played a voice is chosen and connected to the `Synth` ugen, which acts as a bus. When the envelope of the note is finished the associated voice is disconnected from the `Synth` ugen.

```javascript
a = PolySynth({ maxVoices:3 }).connect()
a.chord([ 330,440,550 ])
```

# Effects

Bitcrusher
----
*Prototype: [Gibberish.prototypes.effect](#prototypes-effect)*

The `BitCrusher` effect provides both bit-depth and sample-rate reduction to create distortion.
```javascript
syn = Gibberish.instruments.Synth({ attack:44 })

crush = Gibberish.effects.BitCrusher({ 
  input:synth,
  sampleRate:.15
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

BufferShuffler
----
*Prototype: [Gibberish.prototypes.effect](#prototypes-effect)*

The `BufferShuffler` effect feeds an input into a delay line, which is then randomly read at different speeds for granular effects.


```javascript
syn = Gibberish.instruments.Synth({ attack:44, decay:1152 }).connect()
seq = Sequencer.make( [220,330,440,550], [5512], syn, 'note' ).start()

shuffle = Gibberish.fx.Shuffler({ 
  input:syn,
  rate:22050,
  reverseChance:.5,
  mix:1
}).connect()
```

####Properties####
###shuffler.rate###
*int* Default:22050. Determines how often the shuffler should potentially shuffle. 
###shuffler.chance###
*float* Default:.25. The likelihood that shuffling will occur for any given window.
*int* Default:22050. Determines how often the shuffler should potentially shuffle. 
###shuffler.reverseChance###
*float* Default:.5. The likelihood that the buffer will play in reverse when it is shuffling.
###shuffler.repitchChance###
*float* Default:.5. The likelihood that the buffer will play at a speed that isn't `1` (or `-1` if `reverseChance` is greater than `0`).
###shuffler.repitchMin###
*float* Default:.5. The minimum rate for buffer playback if repitching occurs.
###shuffler.repitchMax###
*float* Default:2. The maximum rate for buffer playback if repitching occurs.
###shuffler.mix###
*float* Default:.5. The mix between the dry and wet signal. a value of`0` means only the dry signal is outputted, a value of `1` means only the wet signal is outputted.

Chorus
----
*Prototype: [Gibberish.prototypes.effect](#prototypes-effect)*

The `Chorus` effect is modeled after the ensemble effect found in the [Arp Solina-5 String Ensemble](https://www.youtube.com/watch?v=9iqZg0LQTWg) (based on a [Csound opcode by Steven Yi](https://github.com/kunstmusik/libsyi/blob/master/solina_chorus.udo). In this model, six parabolic oscillators are used (twelve when the effect is used with a stereo input) to modulate three delay lines (six in stereo). Three of the six oscillators are running at a "slow" speed (roughly .1 - .5 Hz) with individual phase offsets, to gradually create pitch fluctuations over time. The other three are running at a "fast" speed (roughly 2 to 8 Hz), again with individual phase offsets, to create vibrato. You can adjust amplitude and frequency of the three "slow" oscillators using the `slowFrequency` and `slowGain` properties, while the vibrato can be adjusted via `fastFrequency` and `fastGain`.

```javascript
syn = PolySynth({ waveform:'square', attack:44100 / 2, decay:88200 * 1.5, antialias:true, gain:.25 })
chorus = Chorus({ input: syn, slowGain:2 }).connect()
verb = Freeverb({ input: chorus, roomSize: .9, damping:.5 }).connect()

baseChord = [55,110,220,330,440,520]

seq = Sequencer.make( 
  [ 
    baseChord, 
    baseChord.map( v=> v * 1.2 ), 
    baseChord.map( v=> v * .8  ), 
    baseChord.map( v=> v * .95 )
  ], 
  [88200 * 2],
  syn, 
  'chord' 
).start()

kick = Kick().connect()
kickseq = Sequencer.make( [110], [22050], kick, 'note' ).start()
```

####Properties####
###chorus.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect.
###chorus.slowFrequency###
*float* Default: .18. The frequency of the phasor that modulates the read position of the three 'slow' delay lines, which create more gradual pitch fluctuations over time.
###chorus.slowAmp###
*float* Default: 1. Controls the amount of delay line modulation for the three 'slow' delay lines.
###chorus.fastFrequency###
*float* Default: .18. The frequency of the phasor that modulates the read position of the three 'fast' delay lines, which combine to create a vibrato effect. 
###chorus.fastAmp###
*float* Default: 1. Controls the amount of delay line modulation for the three 'fast' delay lines.

Delay
----
*Prototype: [Gibberish.prototypes.effect](#prototypes-effect)*

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
###delay.wetdry###
*float* range:0-1, default: .5. The ratio of immediate to delayed signal in the output. A value of `1` means only the delayed output is heard. 
 
Distortion
----
*Prototype: [Gibberish.prototypes.effect](#prototypes-effect)*

A port of the hyperbolic tangent distortion found in Csound: https://csound.github.io/docs/manual/distort1.html

This is a non-linear distortion that can react dramatically differently to different sounds. The primary driver of the distortion is the `pregain` property,
while the `shape1` and `shape2` properties control whether hard-clipping or soft-clipping is used. A post-effect scalar, `postgain`, can be used to tame out-of-control signals.

```javascript
syn = Gibberish.instruments.Karplus({ attack:44 })

dist = Gibberish.effects.Distortion({ 
  input:syn,
  pregain:100,
  postgain:.25,
}).connect()

syn.note( 440 )
```

####Properties####
###distortion.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect. 
###distortion.pregain###
*float* range: 0-max, default: 5. A scalar applied to the input signal as part of the distortion formula. Increasing this value will increase the amount of distortion; however, you may also need to turn down the `postgain` property to avoid loud signals.  
###distortion.postgain###
*float* range:0-max, default: .5. A scalar applied to the output signal. 
###distortion.shape1###
*float* range:0-max, default: 0. A zero-value indicates hard-clipping will be used on the positive axis of the waveshaping; small positive values will use soft-clipping. 
###distortion.shape2###
*float* range:0-max, default: 0. A zero-value indicates hard-clipping will be used on the negative axis of the waveshaping; small positive values will use soft-clipping. 

Flanger
----
*Prototype: [Gibberish.prototypes.effect](#prototypes-effect)*

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
*Prototype: [Gibberish.prototypes.effect](#prototypes-effect)*

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

Plate
----
*Prototype: [Gibberish.prototypes.effect](#prototypes-effect)*

The `Plate` effect is based on the Dattorro model of plate reverberation. Similar to Freeverb, it is fairly easy to control via its `decay` property to set the length of reverberation and its `damping` property to attenuate high frequencies. However, there are a number of other properties for additional control.

```javascript
syn = Gibberish.instruments.Synth({ attack:44 })

plate = Gibberish.effects.Plate({ 
  input:synth,
  decay:.95
}).connect()

syn.note( 220 )
```

####Properties####
###plate.input###
*ugen* The unit generator that feeds the effect. Assign a `Bus` or `Bus2` instance to this property if you want multiple unit generators to connect to this effect.
###plate.decay###
*float* range: 0-1, default: .5. This is an important control of the overall reverberation time. 
###plate.damping###
*float* range:0-1, default: .5. This value attenuates high-frequency signals in the reverberation by low-pass filtering from one sample to the next. Low values simulate reflective walls.
###freeverb.drywet###
*float* range: 0-1, default: .5. Controls the amount of non-reverberated signal sent to the output.
###plate.predelay###
*float* range: 0-100, default: 10. The amount of time between the input signal entering the reverb and the processed result exiting. This is also an effective cue in determining roomsize. Note that values over 100 risk sonic destruction (really, don't do this!)
###plate.indiffusion1###
*float* range: 0-1, default: .75. Smears the phase of the input signal by controlling feedback during the first two of four all-pass filters.
###plate.indiffusion2###
*float* range: 0-1, default: .625. Smears the phase of the input signal by controlling feedback during the last two of four all-pass filters.
###plate.decaydiffusion1###
*float* range: 0-1, default: .7. Controls when diffusion occurs relative to signal onset in the 'tank' emulation of the reverb.
###plate.decaydiffusion2###
*float* range: 0-1, default: .5. Controls when diffusion occurs relative to signal onset in the 'tank' emulation of the reverb.

RingMod
----
*Prototype: [Gibberish.prototypes.effect](#prototypes-effect)*

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
*Prototype: [Gibberish.prototypes.effect](#prototypes-effect)*

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
*Prototype: [Gibberish.prototypes.effect](#prototypes-effect)*

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

#Envelopes

AD
---
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

A two-stage envelope using exponential attack and decay stages.

Example:

```javascript
a = Sine()
b = AD()
c = Mul( a,b )

Gibberish.output.inputs.push( c )
b.trigger()
```

####Methods####
###ad.trigger###
Tell the envelope to run and reset its internal phase to 0.

####Properties####
###ad.attack###
*int* or *ugen*. Default:44100. The length of the attack stage, in samples.
###ad.decay###
*int* or *ugen*. Default:44100. The length of the decay stage, in samples.

ADSR
---
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

A four-stage envelope using exponential attack, decay, and release stages.

####Methods####
###adsr.trigger###
Tell the envelope to run and reset its internal phase to 0.
###adsr.advance###
If the `triggerRelease` property of the envelope is set to `true`, than this method will advance from the sustain stage of the envelope to the release stage.

####Properties####
###adsr.attack###
*int* or *ugen*. Default:22050. The length of the attack stage, in samples.
###adsr.decay###
*int* or *ugen*. Default:22050. The length of the decay stage, in samples.
###adsr.sustain###
*int* or *ugen*. Default:44100. The length of the sustain stage, in samples. Note this property is only used if the `triggerRelease` property is set to false; that is, if the envelope plays from start to finish without requiring intervention.
###adsr.sustainLevel###
*float* or *ugen*. Default:.6. The gain of the sustain stage.
###adsr.release###
*int* or *ugen*. Default:44100. The length of the release stage, in samples.
###adsr.triggerRelease###
*boolean*. Default:false. If true, the envelope will not advance from the sustain stage to the release stage without a call to the `advance()` method.

Ramp
---
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

A linear ramp between two values that can loop.

```javascript
a = Sine().connect()
a.frequency = Ramp({ from:220, to:440, length:22050, shouldLoop:true })
```
####Methods####
###ramp.trigger###
Tell the ramp to run and reset its internal phase to 0.

####Properties####
###ramp.from###
*int* or *ugen*. Default:0. The starting point of the ramp.
###ramp.to###
*int* or *ugen*. Default:1. The ending point of the ramp.
###ramp.length###
*int( or *ugen*. Default:44100. The length of the ramp.
###ramp.shouldLoop###
*boolean*. Default: false. If this property is `true` playback of the ramp will loop repeatedly.


#Filters
Filter12Biquad
----
*Prototype: [Gibberish.prototypes.filter](#prototypes-filter)*

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
*Prototype: [Gibberish.prototypes.filter](#prototypes-filter)*

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
*Prototype: [Gibberish.prototypes.filter](#prototypes-filter)*

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
*Prototype: [Gibberish.prototypes.filter](#prototypes-filter)*

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
*Prototype: [Gibberish.prototypes.filter](#prototypes-filter)*

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

#Miscellaneous

Bus
---
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

`Bus` instances sum mono inputs.

###bus.disconnecUgen###
**ugen** &nbsp; *ugen* &nbsp; The ugen to disconnect from the bus

Bus2
---
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

`Bus2` instances sum stereo and mono inputs into a single stereo signal.

###bus2.disconnecUgen###
**ugen** &nbsp; *ugen* &nbsp; The ugen to disconnect from the bus.

#Oscillators

All oscillators accept a dictionary as their sole argument, containing properties such as frequency and gain.

Noise
---
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

There are three types of noise available, `white`, `brown`, and `pink`, as determined by the `color` property upon initialization.

####Properties####
###noise.color###
*string*. Default:'white'. Can only be set on initialization. Determines the type of noise outputted.
###noise.gain###
*number* or *ugen*. Default:1. A scalar to adjust the output range of the oscillator.

PWM
---
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

The PWM (pulse-width modulation) oscillator provides for a variable pulsewidth to modulate the harmonic content of the oscillator. If the anti-alias property is set to true, a band-limited oscillator implemented via FM feedback is used. 

####Properties####
###pwm.frequency###
*number* or *ugen*. Default:440. The frequency in Hz that the oscillator runs at.
###pwm.gain###
*number* or *ugen*. Default:1. A scalar to adjust the output range of the oscillator.
###pwm.antialias###
*boolean* Default:false. If true, the oscillator will use a higher-quality bandlimited algorithm. If false, the oscillator will use a wavetable with linear interpolation. This property can only be set during the initial call to the constructor.
###pwm.pulsewidth###
*float* Default:.35. A value of .5 means that the oscillator will function as a square wave; higher or lower values will decrease the duty cycle of the oscillator, gradually lowering amplitude while increasing harmonic content.
 
ReverseSaw
---
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

The ReverseSaw oscillator uses either a wavetable with linear interpolation, or, if the anti-alias property is set to true, a band-limited oscillator implemented via FM feedback. 

####Properties####
###saw.frequency###
*number* or *ugen*. Default:440. The frequency in Hz that the oscillator runs at.
###saw.gain###
*number* or *ugen*. Default:1. A scalar to adjust the output range of the oscillator.
###saw.antialias###
*boolean* Default:false. If true, the oscillator will use a higher-quality bandlimited algorithm. If false, the oscillator will use a wavetable with linear interpolation. This property can only be set during the initial call to the constructor. 

Saw
---
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

The saw oscillator uses either a wavetable with linear interpolation, or, if the anti-alias property is set to true, a band-limited oscillator implemented via FM feedback. 

####Properties####
###saw.frequency###
*number* or *ugen*. Default:440. The frequency in Hz that the oscillator runs at.
###saw.gain###
*number* or *ugen*. Default:1. A scalar to adjust the output range of the oscillator.
###saw.antialias###
*boolean* Default:false. If true, the oscillator will use a higher-quality bandlimited algorithm. If false, the oscillator will use a wavetable with linear interpolation. This property can only be set during the initial call to the constructor. 

Sine
---
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

The sine oscillator uses a wavetable with linear interpolation.

####Properties####
###sine.frequency###
*number* or *ugen*. Default:440. The frequency in Hz that the oscillator runs at.
###sine.gain###
*number* or *ugen*. Default:1. A scalar to adjust the output range of the oscillator.

Square
---
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

The square oscillator uses either a wavetable with linear interpolation, or, if the anti-alias property is set to true, a band-limited oscillator implemented via FM feedback. 

####Properties####
###square.frequency###
*number* or *ugen*. Default:440. The frequency in Hz that the oscillator runs at.
###square.gain###
*number* or *ugen*. Default:1. A scalar to adjust the output range of the oscillator.
###square.antialias###
*boolean* Default:false. If true, the oscillator will use a higher-quality bandlimited algorithm. If false, the oscillator will use a wavetable with linear interpolation. This property can only be set during the initial call to the constructor. 

Triangle
---
*Prototype: [Gibberish.prototypes.ugen](#prototypes-ugen)*

The triangle oscillator uses a wavetable with linear interpolation

####Properties####
###triangle.frequency###
*number* or *ugen*. Default:440. The frequency in Hz that the oscillator runs at.
###triangle.gain###
*number* or *ugen*. Default:1. A scalar to adjust the output range of the oscillator.

#Scheduling

Scheduler
---
This is a singleton object (`Gibberish.Scheduler`) with a priority queue that handles events from all [Sequencer objects](#scheduling-sequencer) (but not Sequencer2 objects). In general, users should never need to think about / manipulate this object, with the possible exception of calls to `Gibberish.Scheduler.add()`.

####Methods####
###scheduler.add###
Add a new event to the priority queue.

**time** &nbsp; *int* &nbsp; A time offset, measured in samples, from the current phase of the scheduler determining when the added event should fire. A time value of 0 means the function will be executed immediately.

**func** &nbsp; *function* &nbsp; A function that will be executed in the future according to the value of *time*.

**priority** &nbsp; *int* &nbsp; Default: 0. If two events in the queue are scheduled to be executed at the same time, the event with the higher priority value will be executed first.

###scheduler.clear###
Remove all items from the scheduler's priority queue. This method is called internally by `Gibberish.clear()`.

###scheduler.tick###
This method is called once per sample and checks the priortiy queue to see if any of its events should be fired.

####Properties####
###scheduler.phase###
*int* The internal phase of the scheduler, incremented by a value of 1 on every sample.
###scheduler.queue###
*object* The priority queue used by the scheduler, as taken from https://github.com/antimatter15/heapqueue.js/blob/master/heapqueue.js.

Sequencer
----
The `Sequencer` object in Gibberish sequences calls to methods, property changes, and the execution of anonymous functions. Although timing is performed with at sample-level accuracy, audio-rate modulation of timing is not possible with this scheduler; see [Sequencer2](#scheduling-sequencer2) for a scheduler with modulation support.

```javascript
syn = Gibberish.instruments.Synth({ 
  attack:44, 
  decay:22050, 
  antialias:true
}).connect()

seq = Gibberish.Sequencer({
  target: syn,
  key: 'note',
  values: [440,880,1760],
  timings: [11025, 22050 ],
}).start()
```
####Methods####
###sequencer.start###
Starts the sequencer running. By default the sequencer starts immediately, but can be started in the future by passing an optional *delay* argument.

***delay*** &nbsp; *float* &nbsp; Default:0. This values delays the start of the sequencer by a given number of samples. You can use this to start a number of sequencers using the same block of code, but with different timings offsets.

###sequencer.stop###
Stops the sequencer from running.

Remove all items from the scheduler's priority queue. This method is called internally by `Gibberish.clear()`.
####Properties####
###sequencer.key###
*string* Whenever a sequencer event is triggered, the sequencer will check to see if it has a valid *target* property; if so, it checks for a valid *key* property. The key determines the name of property or method on the target object that will be controlled by sequencer. If the target/key combo denotes a method, that method will be called. If the target/key combo denotes a property, that property will be assigned a new value. 
###sequencer.priority###
*int* default: 0. If two events are scheduled to take place on the same sample, the event scheduled by the sequencer with the highest *priority* will take place first. For example, if you wanted to change the key of a scale being used and also trigger a new note using the resulting scale on the same sample, you would assign the sequencer changing the key of the scale a higher priority value so that it would be changed before the final note value was determined.
###sequencer.target###
*object* A object to be targeted by the sequencer. See the *key* property for more information.
###sequencer.timings###
*array* This array is used to determine when sequencer events are triggered. If a timing is chosen from the array that is a function, that function will be executed and expected to return a new timing value to be used. 
###sequencer.values###
*array* Assuming the sequencer has a valid target/key combination, this array holds values that will either be passed as arguments to a method or assigned to properties. If a value is chosen from the array and it is a function, that function will be evaluated to and expected to return a new value that will be assigned or passed as an argument. For example, a values array that will always return a random number might look like the following:

```javascript
seq.values = [ Math.random ]
```

Sequencer2
----
`Sequencer2` objects in Gibberish sequence calls to methods, property changes, and the execution of anonymous functions. Unlike [Sequencer](#scheduling-sequencer2) objects, `Sequencer2` objects support audio-rate modulation of timing via their `rate` properties, which is `1` by default. Given a rate value of `2` events will occur twice as fast, a value of `.5` means events will occur half as fast. Below is an example of using a sine oscillator to modulate the speed of events triggered by a `Sequencer2` object:

```javascript
kick = Gibberish.instruments.Kick().connect()

seq = Gibberish.Sequencer2({
  target: kick,
  key: 'note',
  values: [110],
  timings: [11025],
  rate: Gibberish.binops.Add(
    1,
    Gibberish.oscillators.Sine({ frequency:.25, gain:.75 }) 
  )
}).start()
```
####Methods####
###sequencer2.start###
Starts the sequencer running. By default the sequencer starts immediately, but can be started in the future by passing an optional *delay* argument.

***delay*** &nbsp; *float* &nbsp; Default:0. This values delays the start of the sequencer by a given number of samples. You can use this to start a number of sequencers using the same block of code, but with different timings offsets.

###sequencer2.stop###
Stops the sequencer from running.

####Properties####
###sequencer2.key###
*string* Whenever a sequencer event is triggered, the sequencer will check to see if it has a valid *target* property; if so, it checks for a valid *key* property. The key determines the name of property or method on the target object that will be controlled by sequencer. If the target/key combo denotes a method, that method will be called. If the target/key combo denotes a property, that property will be assigned a new value. 
###sequencer2.rate###
*float* or *ugen*. Default: 1. The rate property is an audio-rate input that determines the phase increment of the sequencer on each sample. A value of `2` means that the phase is incremented by two each sample, doubling the speed that events are outputted at. Any mono audio signal can be mapped to this property.
###sequencer2.target###
*object* A object to be targeted by the sequencer. See the *key* property for more information.
###sequencer2.timings###
*array* This array is used to determine when sequencer events are triggered. If a timing is chosen from the array that is a function, that function will be executed and expected to return a new timing value to be used. The values in this array are used in conjunction with the *rate* property to determine the final scheduling of events. 
###sequencer2.values###
*array* Assuming the sequencer has a valid target/key combination, this array holds values that will either be passed as arguments to a method or assigned to properties. If a value is chosen from the array and it is a function, that function will be evaluated to and expected to return a new value that will be assigned or passed as an argument. For example, a values array that will always return a random number might look like the following:

```javascript
seq.values = [ Math.random ]
```

# Arithmetic

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

# Analysis

Follow
---
*Prototype: [Gibberish.prototypes.ugen](#prototypes-analysis)*

A envelope follower.

```js

trackedUgen = Karplus({ gain:2 }).connect()

Sequencer({
  target:d, key:'note',
  values:[440,880], timings:[22050]
}).start()

tracker = Follow({ input: trackedUgen })

// modulate sine frequency based on tracked Karplus plucking
Sine({ frequency:Add( 880, Mul( tracker,220 ) ) }).connect()
```

####Properties####
###follow.input###
*ugen*. The unit generator that will be tracked. 
###follow.bufferSize###
*number* Default:8192. *Set on initialization only*. The length of the buffer over which averaging occurs. Longer buffers will result in smoother signals, while shorter buffers will respond more quickly to changes in the tracked ugen output.


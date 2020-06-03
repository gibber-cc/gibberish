/* tutorial 3: filtering 
 *
 * There are currently five different filter models
 * in Gibberish.
 *
 * 1. Filter24Moog - 24db per octave "virtual analog" aka "zero-delay" ladder filter. lp.
 * 2. Filter24TB303 - 24db per octave "virtual analog" aka "zero-delay" diode filter. lp.
 * 3. Filter12SVF - (TEMPORARILY BROKEN). 12dB per octave state variable filter. lp, hp, bp, notch.
 * 4. Filter12Biquad - 12dB per octave biquad. lp, hp, bp.
 * 5. Filter24Classic - 24db per octave ladder filter (original Gibberish ladder filter). lp, hp.
 *
 * These filters can all be used independently or as a built-in part of the Synth, FM
 * and Monosynth instruments.
 */

osc = Saw()
filter = Filter12Biquad({ input:osc }).connect()

//cutoff on all filters is measured from 0-1. 
filter.cutoff = Add( .4, Sine({ frequency:.5, gain:.25 }) )

/* Q on all filters is measured from 0-1.
 * BEWARE! Using high Q values (above .6) can results in massive
 * feedback depending on the cutoff frequencies, filter model and 
 * input signals in use.
 */
filter.Q = 0

// change from default behavior (lowpass) to high pass
// 0 = lowpass, 1 = highpass, 2 = bandpass
filter.mode = 1

/* some instruments have filters built-in to them. The Monosynth and Synth
 * have filters enabled by default; for the FM instrument you'll  need to enable it by
 * setting the filterType variable to a non-zero value. These numbers correspond
 * to the list at the top of this tutorial, e.g. choose 3 to use the TB303 filter model.
 */

syn = Synth({ attack:44 }).connect()
syn.note( 220 ) // default Filter24Moog model 

syn.filterType = 2  // tb-303 filter model
syn.saturation = 20 // distortion only available in tb-303 filter model
syn.Q = .65

seq = Sequencer.make( [110,165,220], [11025], syn, 'note' ).start()

/* in addition to a cutoff property to control the cutoff frequency
 * of the filter, synths also have a filterMult property that
 * determines how much the synths envelope modulates the filter
 * by. E.g. if a synth has a cutoff frequency of 110, and a 
 * filterMult property of 1000, then the final filter cutoff will
 * travel between 110-1110 Hz over the envelope.
 */

syn.cutoff = .65
syn.filterMult *= 2

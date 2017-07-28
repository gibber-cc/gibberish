/* Demo - Single-Sample Feedback

This demo shows a simple example of a feedback loop
using the single sample delay (SSD) ugen. In this particular
example two delay lines (with their feedback set to 0 )
are being fed into one another. The cross-feedback gradually
transforms a note from a series of echoes into a dull blur of
sound. The ability to create single-sample feedback loops
differentiates Gibberish from almost all other JS synthesis
libraries.

*/

// simple synth
syn = Synth({ attack:44, decay:4410 }).connect()

// create two single sample delays. note that we
// don't define the inputs to our SSDs here; we 
// do that later using the listen() method. This avoids
// a chicken-or-the-egg problem that could happen with
// feedback loops.
ssd1 = SSD()
ssd2 = SSD()

// create two delay lines. for each input, add our
// synth with one of the SSD outputs. set feedback
// to 0 so all feedback is determined by our SSD ugens.
delay1 = Delay({ input:Add( syn, ssd1.out ), time:44100 / 4, feedback:0 }).connect()
delay2 = Delay({ input:Add( syn, ssd2.out ), time:44100 / 9, feedback:0 }).connect()

// tell our SSD ugens to listen to the delay line
// they are not feeding. this means each delay line
// will wind up being fed by its counterpart in addition 
// to the synth. Scale the feedback to prevent it blowing up;
// lower values create shorter feedback loops.
ssd1.listen( Mul( delay2, .985 ) )
ssd2.listen( Mul( delay1, .985 ) )

// play a note! try playing more notes!
syn.note(220)


// OK, here's a bit weirder example 

Gibberish.clear() // clear the previous graph

ssd3 = SSD()
 
sin = Sine({ 
  frequency:Add( 
    440, 
    Sine({ 
      frequency:Abs( ssd3.out ), 
      gain:Mul(
        Ramp({ from:10, to:440, shouldLoop:true, length:44100 * 8 }),
        ssd3.out
      ) 
    }) 
  ) 
}); 
 
ssd3.listen( sin ); 
 
sin.connect()

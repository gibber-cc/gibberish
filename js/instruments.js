const ugens : {
  oscillators : require( './oscillators.js' )( this ),
  freeverb    : require( './freeverb.js' )( this ),
  biquad      : require( './biquad.js'   )( this ),
  kick        : require( './kick.js' )( this ),
  conga       : require( './conga.js' )( this ),
  clave       : require( './conga.js' )( this ), // clave is same as conga with different defaults, see below
  hat         : require( './hat.js' )( this ),
  snare       : require( './snare.js' )( this ),
  svf         : require( './svf.js' )( this ),
}

ugens.clave.defaults.frequency = 2500
ugens.clave.defaults.decay = .5

[ ugens.synth, ugens.polysynth ] : require( './synth.js' )( this );
[ ugens.synth2, ugens.polysynth2 ] : require( './synth2.js' )( this );
[ ugens.monosynth, ugens.polymono ] : require( './monosynth.js' )( this );
[ ugens.karplus, ugens.polykarplus ]  : require( './karplusstrong.js' )( this );

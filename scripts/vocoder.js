Gibberish.Vocoder = function() {
  var encoders = [], decoders = [], amps = [], store = [], 
      abs = Math.abs, sqrt = Math.sqrt, phase = 0, output = [0,0],
      encoderObjects = [], decoderObjects = [], envelopeSize = 128,
      history = [],
      sums = [],
      env = [],
      index = 0,
      original_cutoffs = [
        330, 440, 554, 880, 1100, 1660, 2220, 3140
      ],
      cutoffs = [],
      startFreq = arguments[3] || 330,
      endFreq   = arguments[4] || 3200,
      numberOfBands = arguments[2] || 16,
      Q = arguments[5] || .15;
  
	this.name =	"vocoder";
  
	this.properties = {
    carrier:  arguments[0] || null,
    modulator:arguments[1] || null,
    amp:		  1,
	  pan:		  0
  }

  // filter band formula adapted from https://github.com/cwilso/Vocoder/blob/master/js/vocoder.js
	var totalRangeInCents = 1200 * Math.log( endFreq / startFreq ) / Math.LN2,
	    centsPerBand = totalRangeInCents / numberOfBands,
	    scale = Math.pow( 2, centsPerBand / 1200 ),  // This is the scaling for successive bands
	    currentFreq = startFreq;

	for(var i = 0; i < numberOfBands; i++) {
		encoderObjects[i] = new Gibberish.Biquad({ mode:'BP', Q:Q, cutoff:currentFreq });
    encoders[i] = encoderObjects[i].callback
		decoderObjects[i] = new Gibberish.Biquad({ mode:'BP', Q:Q, cutoff:currentFreq });
    decoders[i] = decoderObjects[i].callback    
		
    history[ i ] = [ 0 ]
    sums[ i ] = 0
    env[ i ] = 0
    
		currentFreq = currentFreq * scale;
	}
  
  //console.log( numberOfBands, startFreq, endFreq, Q )
  
  this.callback = function( carrier, modulator, amp, pan ) {
    var historyIndex = ( index + 1 ) % envelopeSize,
        modValue = typeof modulator !== 'number' ? modulator[0] + modulator[1] : modulator,
        carrierValue = typeof carrier !== 'number' ? carrier[0] + carrier[1] : carrier,
        encValue, out = 0
        
		for(var i = 0; i < numberOfBands; i++) {
      encValue = abs( encoders[ i ]( modValue ) )
      
      sums[ i ] += encValue
      sums[ i ] -= history[ i ][ index ]
      
      history[ i ][ index ] = encValue
      history[ i ][ historyIndex ] = history[ i ][ historyIndex ] ? history[ i ][ historyIndex ] : 0
      
      env[ i ] = sums[ i ] / envelopeSize
      
      out += decoders[i]( carrierValue ) * env[ i ];
		}
    index = historyIndex
	
    output[0] = output[1] = out * amp * 16; // look, ma... 16 IS MAGIC!!!

		return output;
	}
  
  this.getEncoders = function() { return encoderObjects }
  this.getDecoders = function() { return decoderObjects }  
  
  this.init();
  this.oscillatorInit();
	//this.processProperties(arguments);
}
Gibberish.Vocoder.prototype = Gibberish._synth

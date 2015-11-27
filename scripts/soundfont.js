/* IMPORTANT README
*
* This class depends on having access to a folder of soundfonts that have been converted to
* binary string representations. More specifically, soundfonts designed to work with GenMIDI.js:
*
* https://github.com/gleitz/midi-js-soundfonts
*
* At some point it would be nice to make another soundfont system, as GenMIDI.js does not support
* defining loop points.
*
* By default soundfonts should be found in a folder named 'resources/soundfonts' one level above
* the location of the gibberish.js library (or gibberish.min.js). You can pass a different path
* as the second argument to the Gibberish.SoundFont constructor; the first is the name of the soundfont
* minus the "-mp3.js" extension. So, for example:
*
* b = new Gibberish.SoundFont( 'choir_aahs' ).connect()
* b.note( 'C4' )
*
* Note that you can only use note names, not frequency values.
*/

(function() {
  var cents = function(base, _cents) { return base * Math.pow(2,_cents/1200) },
      GenMIDI = { Soundfont: { instruments: {} } },
      SF = GenMIDI.Soundfont
  
  // TODO: GET RID OF THIS GLOBAL!!!! It's unfortunately in there because we're using soundfonts meant for GenMIDI.js
  if( typeof window === 'object' )
    window.GenMIDI = GenMIDI
  else
    global.GenMIDI = GenMIDI
  
  var getScript = function( scriptPath, handler ) {
    var oReq = new XMLHttpRequest();
    
    oReq.addEventListener("load", transferComplete, false);
    oReq.addEventListener("error", function(e){ console.log( "SF load error", e ) }, false);

    oReq.open( 'GET', scriptPath, true );
    oReq.send()

    function updateProgress (oEvent) {
      if (oEvent.lengthComputable) {
        var percentComplete = oEvent.loaded / oEvent.total;
        number.innerHTML = Math.round( percentComplete * 100 )

        var sizeString = new String( "" + oEvent.total )
        sizeString = sizeString[0] + '.' + sizeString[1] + ' MB'
        size.innerHTML = sizeString
        
        console.log( percentComplete, "%" )
      } else {
        // Unable to compute progress information since the total size is unknown
      }
    }

    function transferComplete( evt ) {
      console.log("COMPLETE", scriptPath)
      var script = document.createElement('script')
      script.innerHTML = evt.srcElement ? evt.srcElement.responseText : evt.target.responseText
      document.querySelector( 'head' ).appendChild( script )
      handler( script ) 
    }
  }
  
  var Base64Binary = {
  	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	
  	// will return a  Uint8Array type
  	decodeArrayBuffer: function(input) {
  		var bytes = (input.length/4) * 3;
  		var ab = new ArrayBuffer(bytes);
  		this.decode(input, ab);
		
  		return ab;
  	},
	
  	decode: function(input, arrayBuffer) {
  		//get last chars to see if are valid
  		var lkey1 = this._keyStr.indexOf(input.charAt(input.length-1));		 
  		var lkey2 = this._keyStr.indexOf(input.charAt(input.length-2));		 
	
  		var bytes = (input.length/4) * 3;
  		if (lkey1 == 64) bytes--; //padding chars, so skip
  		if (lkey2 == 64) bytes--; //padding chars, so skip
		
  		var uarray;
  		var chr1, chr2, chr3;
  		var enc1, enc2, enc3, enc4;
  		var i = 0;
  		var j = 0;
		
  		if (arrayBuffer)
  			uarray = new Uint8Array(arrayBuffer);
  		else
  			uarray = new Uint8Array(bytes);
		
  		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		
  		for (i=0; i<bytes; i+=3) {	
  			//get the 3 octects in 4 ascii chars
  			enc1 = this._keyStr.indexOf(input.charAt(j++));
  			enc2 = this._keyStr.indexOf(input.charAt(j++));
  			enc3 = this._keyStr.indexOf(input.charAt(j++));
  			enc4 = this._keyStr.indexOf(input.charAt(j++));
	
  			chr1 = (enc1 << 2) | (enc2 >> 4);
  			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
  			chr3 = ((enc3 & 3) << 6) | enc4;
	
  			uarray[i] = chr1;			
  			if (enc3 != 64) uarray[i+1] = chr2;
  			if (enc4 != 64) uarray[i+2] = chr3;
  		}
	
  		return uarray;	
  	}
  }
  
  var decodeBuffers = function( obj ) {
    var count = 0,
        font = SF[ obj.instrumentFileName ]
        
    if( typeof SF.instruments[ obj.instrumentFileName ] === 'undefined' ) {
      SF.instruments[ obj.instrumentFileName ] = {}
    }
    
    obj.buffers = SF.instruments[ obj.instrumentFileName ]
    
    for( var note in font ) {
      count++
      !function() {
        var _note = note
        
        var base = font[ _note ].split(",")[1]
        var arrayBuffer = Base64Binary.decodeArrayBuffer( base );
        
        Gibberish.context.decodeAudioData( arrayBuffer, function( _buffer ) {
          SF.instruments[ obj.instrumentFileName ][ _note ] = _buffer.getChannelData( 0 )
          count--
          if( count <= 0 ) { 
            console.log("Soundfont " + obj.instrumentFileName + " is loaded.")
            obj.isLoaded = true
            if( obj.onload ) obj.onload()
          }
        }, function(e) { console.log("ERROR", e.err, arguments, _note ) } )
        
      }()
    }
  }
  
  Gibberish.SoundFont = function( instrumentFileName, pathToResources ) {
    var that = this
    Gibberish.extend(this, {
      'instrumentFileName': instrumentFileName,
      name:'soundfont',
      properties: {
        amp:1,
        pan:0
      },
      playing:[],
      buffers:{},
      onload: null,
      out:[0,0],
      isLoaded: false,
      resourcePath: pathToResources || './resources/soundfonts/',
      
      callback: function( amp, pan ) {
        var val = 0
        for( var i = this.playing.length -1; i >= 0; i-- ) {
          var note = this.playing[ i ]
          
          val += this.interpolate( note.buffer, note.phase ) * note.velocity
          
          note.phase += note.increment
          if( note.phase > note.length ) {
            this.playing.splice( this.playing.indexOf( note ), 1 )
          }
        }
        
        return this.panner( val * amp, pan, this.out );
      }.bind( this ),
      
      note: function( name, velocity, cents ) {
        if( this.isLoaded ) {
          this.playing.push({
            buffer:this.buffers[ name ],
            phase:0,
            increment: isNaN( cents ) ? 1 : 1 + cents,
            length:this.buffers[ name ].length,
            velocity: isNaN( velocity ) ? 1 : velocity
          })
        }
      },
      interpolate: Gibberish.interpolate.bind( this ),
      panner: Gibberish.makePanner()
    })
    .init()
    .oscillatorInit()
    
    if( typeof arguments[0] === 'object' && arguments[0].instrumentFileName ) {
      this.instrumentFileName = arguments[0].instrumentFileName
    }
    
    // if already loaded, or if passed a buffer to use...
    if( !SF.instruments[ this.instrumentFileName ] && typeof pathToResources !== 'object' ) {
      console.log("DOWNLOADING SOUNDFONT")
      getScript( pathToResources + this.instrumentFileName + '-mp3.js', decodeBuffers.bind( null, this ) )
    }else{
      if( typeof pathToResources === 'object' ) {
        SF[ this.instrumentFileName ] = pathToResources
        decodeBuffers( this )
      }else{
        this.buffers = SF.instruments[ this.instrumentFileName ]
        this.isLoaded = true
        setTimeout( function() { if( this.onload ) this.onload() }.bind( this ), 0 )
      }
    }
    return this
  }
  Gibberish.SoundFont.storage = SF
  Gibberish.SoundFont.prototype = Gibberish._oscillator;
})()
  

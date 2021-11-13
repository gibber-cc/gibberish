/*fetch( '0000_Aspirin_sf2_file.json' )
.then( res => res.json() )
.then( json => {
  window.zones = json.zones
  console.log( window.zones )
})

ab = Gibberish.utilities..decodeArrayBuffer( zones[0].file )
genish.utilities.ctx.decodeAudioData( ab, buffer => {
  __ab = buffer
  console.log( 'buffer made' )
})


_d = data( __ab )
play( peek( _d, phasor(1,0,{min:0}) ) )
*/

const g = require( 'genish.js' ),
      instrument = require( './instrument.js' )

const genish = g

const soundfonts = {}

const banks = [
  'Aspirin',
  'Chaos',
  'FluidR3',
  'GeneralUserGS',
  'JCLive'
]

module.exports = function( Gibberish ) {
  const proto = Object.create( instrument )
  const memo = {}
  
  Object.assign( proto, {
    pickFile( sample ) {
      this.currentSample = sample
    },
    pick( __idx ) {
      const idx = Math.floor( __idx )
      const keys = Object.keys( this.samplers )
      const key = keys[ idx ]
      this.currentSample = key
    },
    pickplay( __idx ) {
      const idx = Math.floor( __idx )
      const keys = Object.keys( this.samplers )
      const key = keys[ idx ]
      this.currentSample = key
      return this.trigger()
    },
    __note( rate, loudness=null ) {
      // soundfont measures pitch in cents
      // originalPitch = findMidiForHz( hz ) * 100 // (100 cents per midi index)
      // rate = Math.pow(2, (100.0 * pitch - originalPitch) / 1200.0) // 1200 cents per octave
      return this.trigger( loudness, rate )
    },
    note( freq, loudness=null ) {
      'no jsdsp'
      const midinote = 69 + 12 * Math.log2( freq/440 )
      this.midinote( midinote, loudness )
    },
    midipick( midinote, loudness ) {
      // loop through zones to find correct sample #
      let idx = 0, pitch = 0
      for( let zone of this.zones ) {
        if( midinote >= zone.keyRangeLow && midinote <= zone.keyRangeHigh ) {
          pitch = zone.originalPitch
          break;
        }
        idx++
      }
      this.pick( idx )
      return pitch
    },
    midinote( midinote, loudness=null ) {
      'no jsdsp'
      const samplePitch = this.midipick( midinote )
      const pitch = Math.pow( 2, (100 * midinote - samplePitch ) / 1200 ) 
      //const pitch = 1//Math.pow( 2, (samplePitch ) ) 
      this.__note( pitch, loudness )
    }, 
    midichord( frequencies ) {
      if( Gibberish !== undefined && Gibberish.mode !== 'worklet' ) {
        frequencies.forEach( v => this.midinote( v ) )
        this.triggerChord = frequencies
      }
    },
    chord( frequencies ) {
      if( Gibberish !== undefined && Gibberish.mode !== 'worklet' ) {
        frequencies.forEach( v => this.note( v ) )
        this.triggerChord = frequencies
      }
    },

    setpan( num=0, value=.5 ) {
      if( Gibberish.mode === 'processor' ) {
        const voice = this.voices[ num ]
        // set voice buffer length
        //g.gen.memory.heap.set( [ value ], voice.pan.memory.values.idx )
        voice.pan = value
      }
    },
    setrate( num=0, value=1 ) {
      if( Gibberish.mode === 'processor' ) {
        const voice = this.voices[ num ]
        // set voice buffer length
        //g.gen.memory.heap.set( [ value ], voice.rate.memory.values.idx )
        voice.rate = value
      }
    },
    trigger( volume=null, rate=null ) {
      'no jsdsp'
      //if( volume !== null ) this.__triggerLoudness = volume

      let voice = null
      if( Gibberish.mode === 'processor' ) {
        const sampler = this.samplers[ this.currentSample ]

        // if sample isn't loaded...
        if( sampler === undefined ) return

        voice = this.__getVoice__()

        // set voice buffer length
        g.gen.memory.heap[ voice.bufferLength.memory.values.idx ] = sampler.dataLength

        // set voice data index
        g.gen.memory.heap[ voice.bufferLoc.memory.values.idx ] = sampler.dataIdx

        g.gen.memory.heap[ voice.__loopStart.memory.values.idx ] = sampler.zone.loopStart
        g.gen.memory.heap[ voice.__loopEnd.memory.values.idx   ] = sampler.zone.loopEnd

        if( volume !== null )
          g.gen.memory.heap[ voice.loudness.memory.values.idx   ] = volume

        if( rate !== null ) voice.rate = rate 
        
        voice.trigger()
      }

      return voice
    },
    __getVoice__() {
      return this.voices[ this.voiceCount++ % this.voices.length ]
    },
  })

  const Soundfont = inputProps => {
    const syn = Object.create( proto )

    const props = Object.assign( { onload:null, voiceCount:0, files:[] }, Soundfont.defaults, inputProps )

    syn.isStereo = props.isStereo !== undefined ? props.isStereo : false

    const start = g.in( 'start' ), end = g.in( 'end' ), 
          rate = g.in( 'rate' ), shouldLoop = g.in( 'loops' ),
          loudness = g.in( 'loudness' ),
          triggerLoudness = g.in( '__triggerLoudness' ),
          // rate storage is used to determine whether we're playing
          // the sample forward or in reverse, for use in the 'trigger' method.
          rateStorage = g.data([0], 1, { meta:true })

    Object.assign( syn, props )

    if( Gibberish.mode === 'worklet' ) {
      syn.__meta__ = {
        address:'add',
        name: ['instruments', 'Soundfont'],
        properties: JSON.stringify(props), 
        id: syn.id
      }

      Gibberish.worklet.ugens.set( syn.id, syn )

      Gibberish.worklet.port.postMessage( syn.__meta__ )
    }

    // create all our vocecs
    const voices = []
    for( let i = 0; i < syn.maxVoices; i++ ) {
      'use jsdsp'

      const voice = {
        bufferLength: g.data( [1], 1, { meta:true }),
        bufferLoc:    g.data( [1], 1, { meta:true }),
        bang: g.bang(),
        // XXX how do I change this from main thread?
        __pan: g.data( [.5], 1, { meta:true }),
        __rate: g.data( [1], 1, { meta:true }),
        __shouldLoop: g.data( [1], 1, { meta:true }),
        __loopStart: g.data( [1], 1, { meta:true }),
        __loopEnd:   g.data( [1], 1, { meta:true }),
        __loudness:  g.data( [1], 1, { meta:true }),
        get loudness() { 
          return g.gen.memory.heap[ this.__loudness.memory.values.idx   ]
        },
        set loudness( v ) {
          g.gen.memory.heap[ this.__loudness.memory.values.idx ] = v
        },
        set pan(v) {
          g.gen.memory.heap[ this.__pan.memory.values.idx ] = v
        },
        set rate(v) {
          g.gen.memory.heap[ this.__rate.memory.values.idx ] = v
        },
      }

      voice.phase = g.counter( 
        rate * voice.__rate[0], 
        start * voice.bufferLength[0],
        end * voice.bufferLength[0], 
        voice.bang,
        shouldLoop, 
        { shouldWrap:false, initialValue:9999999 }
      )

      voice.trigger = voice.bang.trigger

      voice.graph = g.ifelse(
        // if phase is greater than start and less than end... 
        g.and( 
          g.gte( voice.phase, start * voice.bufferLength[0] ), 
          g.lt(  voice.phase, end   * voice.bufferLength[0] ) 
        ),
        // ...read data
        voice.peek = g.peekDyn( 
          voice.bufferLoc[0], 
          voice.bufferLength[0],
          voice.phase,
          { mode:'samples' }
        ),
        // ...else return 0
        0
      ) 
      * loudness 
      * voice.__loudness[0] 

      // start of attempt to loop sustain...
      //voice.graph = g.ifelse(
      //  // if phase is greater than start and less than end... 
      //  g.and( 
      //    g.gte( voice.phase, start * voice.bufferLength[0] ), 
      //    g.lt(  voice.phase, end   * voice.bufferLength[0] ) 
      //  ),
      //  // ...read data
      //  voice.peek = g.peekDyn( 
      //    voice.bufferLoc[0], 
      //    voice.bufferLength[0],
      //    voice.phase,
      //    { mode:'samples' }
      //  ),
      //  // ...else return 0
      //  g.ifelse(
      //    g.and(
      //      voice.__shouldLoop[0],
      //      g.gt( voice.phase, voice.__loopEnd[0] )
      //    ),
      //    g.peekDyn( 
      //      voice.bufferLoc[0], 
      //      voice.bufferLength[0],
      //      g.add( 
      //        voice.__loopStart[0],
      //        g.mod(
      //          voice.phase,
      //          //g.sub( voice.phase, voice.__loopStart[0] ),
      //          g.sub( voice.__loopEnd[0], voice.__loopStart[0] )
      //        )
      //      ),
      //      { mode:'samples' }
      //    ),
      //    0
      //  )
      //) 
      //* loudness 
      //* triggerLoudness 
      
      const pan = g.pan( voice.graph, voice.graph, voice.__pan[0] )
      voice.graph = [ pan.left, pan.right ]

      voices.push( voice )
    }

    // load in sample data
    const samplers = {}

    // bound to individual sampler objects in loadSample function
    syn.loadBuffer = function( buffer, onload ) {
      // main thread: when sample is loaded, copy it over message port
      // processor thread: onload is called via messageport handler, and
      // passed in the new buffer to be copied.
      if( Gibberish.mode === 'worklet' ) {
        const memIdx = Gibberish.memory.alloc( this.data.buffer.length, true )

        Gibberish.worklet.port.postMessage({
          address:'copy_multi',
          id:     syn.id,
          buffer: this.data.buffer,
          filename: this.filename
        })

        if( typeof onload === 'function' ) onload( this, buffer )

      }else if( Gibberish.mode === 'processor' ) {
        this.data.buffer = buffer 

        // set data memory spec before issuing memory request
        this.dataLength = this.data.memory.values.length = this.data.dim = this.data.buffer.length
        this.zone = syn.zones[ this.filename ]

        // request memory to copy the bufer over
        g.gen.requestMemory( this.data.memory, false )
        g.gen.memory.heap.set( this.data.buffer, this.data.memory.values.idx )

        // set location of buffer (does not work)
        this.dataIdx = this.data.memory.values.idx

        syn.currentSample = this.filename
      }
    }

    syn.loadSample = function( filename, __onload, buffer=null ) {
      'use jsdsp'

      const sampler = samplers[ filename ] = {
        dataLength: null,
        dataIdx: null,
        buffer: null,
        filename
      }

      const onload = syn.loadBuffer.bind( sampler ) 
      // passing a filename to data will cause it to be loaded in the main thread
      // onload will then be called to pass the buffer over the messageport. In the
      // processor thread, make a placeholder until data is available.
      if( Gibberish.mode === 'worklet' ) {
        sampler.data = g.data( buffer !== null ? buffer : filename, 1, { onload })

        // check to see if a promise is returned; a valid
        // data object is only return if the file has been
        // previously loaded and the corresponding buffer has
        // been cached.
        if( sampler.data instanceof Promise ) {
          sampler.data.then( d => {
            sampler.data = d
            memo[ filename ] = sampler.data 
            onload( sampler, __onload )
          })
        }else{
          // using a cached data buffer, no need
          // for asynchronous loading.
          memo[ filename ] = sampler
          sampler.dataLength = buffer.length
          onload( sampler, __onload )
        }     
      }else{
        // not sure if first case will happen with soundfonts (it does with regular multisampler)
        if( buffer === null ) {
          sampler.data = g.data( new Float32Array(), 1, { onload, filename })
          sampler.data.onload = onload
        }else{
          sampler.data = g.data( buffer, 1, { onload, filename })
          //sampler.data.onload = onload
          onload( buffer, __onload )
        }
      }

      return sampler
    }

    syn.load = function( soundNumber=0, bankIndex=0 ) {
      'no jsdsp'

      // need to memoize... already storing in soundfonts
      if( Gibberish.mode === 'processor' ) return

      // in case users pass name of soundfont instead of number
      if( typeof soundNumber === 'string' ) {
        let __soundNumber = Soundfont.names.indexOf( soundNumber )
        if( __soundNumber === -1 ) {
          __soundNumber = 0
          console.warn( `The ${soundNumber} Soundfont can't be found. Using Piano instead.` )
        }
        soundNumber = __soundNumber
      }

      let num = (soundNumber) + '0'
      if( soundNumber < 100 ) num = '0'+num
      if( soundNumber < 10 )  num = '0'+num

      fetch( `${Soundfont.resourcePath}${num}_${banks[bankIndex]}.sf2.json` )
        .then( res => res.json() )
        .then( json => {
          const zones = soundfonts[ soundNumber ] = json.zones
          this.zones = zones
          for( let i = 0; i < zones.length; i++) {
            const zone = zones[i]
            const ab = Gibberish.utilities.base64.decodeArrayBuffer( zone.file )
            g.utilities.ctx.decodeAudioData( ab, buffer => {
              zone.sampler = syn.loadSample( i, null, buffer )
            })
          }
        })
    }

    //props.files.forEach( filename => syn.loadSample( filename ) )

    syn.__createGraph = function() {
      'use jsdsp'
      
      const graphs = voices.map( voice => voice.graph )
      const left = g.add( ...voices.map( voice => voice.graph[0] ) )
      const right = g.add( ...voices.map( voice => voice.graph[1] ) )
      const gain = g.in( 'gain' )
      syn.graph = [ left * gain, right * gain ]

      if( syn.panVoices === true ) { 
        const panner = g.pan( syn.graph[0], syn.graph[1], g.in( 'pan' ) ) 
        syn.graph = [ panner.left, panner.right ]
      }
    }

    syn.__createGraph()

    const out = Gibberish.factory( 
      syn,
      syn.graph,
      ['instruments','soundfont'], 
      props 
    ) 

    Gibberish.preventProxy = true
    Gibberish.proxyEnabled = false

    out.voices = voices
    out.samplers = samplers

    Gibberish.proxyEnabled = true
    Gibberish.preventProxy = false

    return out
  }

  Soundfont.defaults = {
    gain: 1,
    pan: .5,
    rate: 1,
    panVoices:false,
    shouldLoop:false,
    loops: 0,
    start:0,
    end:1,
    bufferLength:-999999999,
    loudness:1,
    maxVoices:5, 
    __triggerLoudness:1
  }

  Soundfont.resourcePath = 'resources/soundfonts/'
  Soundfont.names = [
    "Acoustic Grand Piano",
    "Bright Acoustic Piano",
    "Electric Grand Piano",
    "Honky-tonk Piano",
    "Electric Piano 1",
    "Electric Piano 2",
    "Harpsichord",
    "Clavi",
    "Celesta",
    "Glockenspiel",
    "Music Box",
    "Vibraphone",
    "Marimba",
    "Xylophone",
    "Tubular Bells",
    "Dulcimer",
    "Drawbar Organ",
    "Percussive Organ",
    "Rock Organ",
    "Church Organ",
    "Reed Organ",
    "Accordion",
    "Harmonica",
    "Tango Accordion",
    "Acoustic Guitar (nylon)",
    "Acoustic Guitar (steel)",
    "Electric Guitar (jazz)",
    "Electric Guitar (clean)",
    "Electric Guitar (muted)",
    "Overdriven Guitar",
    "Distortion Guitar",
    "Guitar harmonics",
    "Acoustic Bass",
    "Electric Bass (finger)",
    "Electric Bass (pick)",
    "Fretless Bass",
    "Slap Bass 1",
    "Slap Bass 2",
    "Synth Bass 1",
    "Synth Bass 2",
    "Violin",
    "Viola",
    "Cello",
    "Contrabass",
    "Tremolo Strings",
    "Pizzicato Strings",
    "Orchestral Harp",
    "Timpani",
    "String Ensemble 1",
    "String Ensemble 2",
    "SynthStrings 1",
    "SynthStrings 2",
    "Choir Aahs",
    "Voice Oohs",
    "Synth Voice",
    "Orchestra Hit",
    "Trumpet",
    "Trombone",
    "Tuba",
    "Muted Trumpet",
    "French Horn",
    "Brass Section",
    "SynthBrass 1",
    "SynthBrass 2",
    "Soprano Sax",
    "Alto Sax",
    "Tenor Sax",
    "Baritone Sax",
    "Oboe",
    "English Horn",
    "Bassoon",
    "Clarinet",
    "Piccolo",
    "Flute",
    "Recorder",
    "Pan Flute",
    "Blown Bottle",
    "Shakuhachi",
    "Whistle",
    "Ocarina",
    "Lead 1 (square)",
    "Lead 2 (sawtooth)",
    "Lead 3 (calliope)",
    "Lead 4 (chiff)",
    "Lead 5 (charang)",
    "Lead 6 (voice)",
    "Lead 7 (fifths)",
    "Lead 8 (bass + lead)",
    "Pad 1 (new age)",
    "Pad 2 (warm)",
    "Pad 3 (polysynth)",
    "Pad 4 (choir)",
    "Pad 5 (bowed)",
    "Pad 6 (metallic)",
    "Pad 7 (halo)",
    "Pad 8 (sweep)",
    "FX 1 (rain)",
    "FX 2 (soundtrack)",
    "FX 3 (crystal)",
    "FX 4 (atmosphere)",
    "FX 5 (brightness)",
    "FX 6 (goblins)",
    "FX 7 (echoes)",
    "FX 8 (sci-fi)",
    "Sitar",
    "Banjo",
    "Shamisen",
    "Koto",
    "Kalimba",
    "Bag pipe",
    "Fiddle",
    "Shanai",
    "Tinkle Bell",
    "Agogo",
    "Steel Drums",
    "Woodblock",
    "Taiko Drum",
    "Melodic Tom",
    "Synth Drum",
    "Reverse Cymbal",
    "Guitar Fret Noise",
    "Breath Noise",
    "Seashore",
    "Bird Tweet",
    "Telephone Ring",
    "Helicopter",
    "Applause",
    "Gunshot"
  ]

  Soundfont.inspect = function() {
    console.table( Soundfont.names )
  }

  return Soundfont
}

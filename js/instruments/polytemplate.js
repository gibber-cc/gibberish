let g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let TemplateFactory = ( ugen, propertyList, _envCheck ) => {
    const monoProto   = Object.create( Gibberish.Bus() ),
          stereoProto = Object.create( Gibberish.Bus2())

    // since there are two prototypes we can't assign directly to one of them...
    const protoMixin = {
      note( freq ) {
        let voice = this.__getVoice__()
        Object.assign( voice, this.properties )
        voice.note( freq )
        this.__runVoice__( voice, this )
        this.triggerNote = freq
      },

      // XXX this is not particularly satisfying...
      trigger( gain ) {
        if( this.triggerChord !== null ) {
          this.triggerChord.forEach( v => {
            let voice = this.__getVoice__()
            Object.assign( voice, this.properties )
            voice.note( v )
            voice.gain = gain
            this.__runVoice__( voice, this )
          })
        }else if( this.triggerNote !== null ) {
          let voice = this.__getVoice__()
          Object.assign( voice, this.properties )
          voice.note( this.triggerNote )
          voice.gain = gain
          this.__runVoice__( voice, this )
        }else{
          let voice = this.__getVoice__()
          Object.assign( voice, this.properties )
          voice.trigger( gain )
          this.__runVoice__( voice, this )
        }
      },

      __runVoice__( voice, poly ) {
        if( !voice.isConnected ) {
          voice.connect( poly, 1 )
          voice.isConnected = true
        }
        
        let envCheck
        if( _envCheck === undefined ) {
          envCheck = ()=> {
            if( voice.env.isComplete() ) {
              poly.disconnectUgen( voice )
              voice.isConnected = false
            }else{
              Gibberish.blockCallbacks.push( envCheck )
            }
          }
        }else{
          envCheck = _envCheck( voice, poly )
        }

        Gibberish.blockCallbacks.push( envCheck )
      },

      __getVoice__() {
        return this.voices[ this.voiceCount++ % this.voices.length ]
      },

      chord( frequencies ) {
        frequencies.forEach( v => this.note( v ) )
        this.triggerChord = frequencies
      },

      free() {
        for( let child of this.voices ) child.free()
      }
    }

    Object.assign( monoProto,   protoMixin )
    Object.assign( stereoProto, protoMixin )

    let Template = props => {
      let properties = Object.assign( {}, { isStereo:true }, props )

      let synth = properties.isStereo ? Object.create( stereoProto ) : Object.create( monoProto )
      synth.voices = [],
      synth.maxVoices = properties.maxVoices !== undefined ? properties.maxVoices : 16,
      synth.voiceCount = 0

      for( let i = 0; i < synth.maxVoices; i++ ) {
        synth.voices[i] = ugen( properties )
        synth.voices[i].callback.ugenName = synth.voices[i].ugenName
        synth.voices[i].isConnected = false
      }
      
      synth.id = Gibberish.factory.getUID()
      synth.dirty = true
      synth.type = 'bus'
      synth.ugenName = 'poly' + ugen.name + '_' + synth.id
      synth.inputs = []
      synth.inputNames = []
      synth.callback.ugenName = synth.ugenName

      let _propertyList 
      if( properties.isStereo === false ) {
        _propertyList = propertyList.slice( 0 )
        let idx =  _propertyList.indexOf( 'pan' )
        if( idx  > -1 ) _propertyList.splice( idx, 1 )
      }

      TemplateFactory.setupProperties( synth, ugen, properties.isStereo ? propertyList : _propertyList )

      return synth
    }

    return Template
  }

  TemplateFactory.setupProperties = ( synth, ugen, props ) => {
    for( let property of props ) {
      Object.defineProperty( synth, property, {
        get() {
          return synth.properties[ property ] || ugen.defaults[ property ]
        },
        set( v ) {
          synth.properties[ property ] = v
          for( let child of synth.inputs ) {
            child[ property ] = v
          }
        }
      })
    }
  }

  return TemplateFactory

}

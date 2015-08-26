// TODO: must fix scale seq

/*
c = new Gibberish.Synth({ pan:-1 }).connect();
b = new Gibberish.Synth({ pan:1 }).connect(); 
a = new Gibberish.PolySeq({ 
  seqs:[
    { key:'note', target:b, values:[440,880], durations:22050 },
    { key:'note', target:c, values:[220,1320], durations:[11025, 22050, 5512.5] },
  ] 
}).start()
*/
Gibberish.PolySeq = function() {
  var that = this,
      phase = 0,
      sort = function(a,b) { if( a < b ) return -1; if( a > b ) return 1; return 0; } ;
  
  Gibberish.extend(this, {
    seqs          : [],
    autofire      : [], // seqs with no scheduling that fire everytime a scheduled seq is triggered    
    timeline      : {},
    playOnce      : false,
    repeatCount   : 0,
    repeatTarget  : null,
    isConnected   : false,
    properties    : { rate: 1, isRunning:false, nextTime:0 },
    offset        : 0,
    name          : 'polyseq',
    getPhase      : function() { return phase },
    setPhase      : function(v) { phase = v },
    adjustPhase   : function(v) { phase += v },
    timeModifier  : null,
    add           : function( seq, pos ) {
      seq.valuesIndex = seq.durationsIndex = 0

      if( seq.durations === null ) {
        seq.autofire = true
        that.autofire.push( seq )
      }else{
        if( typeof pos === 'undefined' ) {
          that.seqs.push( seq )
        }else{
          that.seqs.splice( pos, 0, seq )
        }
        
        if( typeof that.timeline[ phase ] !== 'undefined' ) {
          if( seq.priority ) {
            that.timeline[ phase ].unshift( seq )
          }else{
            that.timeline[ phase ].push( seq )
          }
        }else{
          that.timeline[ phase ] = [ seq ]
        }
        
        that.nextTime = phase
      }
      // for Gibber... TODO: remove from Gibberish
      if( that.scale && (seq.key === 'frequency' || seq.key === 'note') ) {
        if( that.applyScale ) {
          that.applyScale()
        }
      }

      seq.shouldStop = false
    },
    
    callback : function(rate, isRunning, nextTime) {
      var newNextTime;
      
      if(isRunning) {
        if(phase >= nextTime) {
          var seqs = that.timeline[ nextTime ],
              phaseDiff = phase - nextTime
              
          if( typeof seqs === 'undefined') return
                    
          for( var j = 0; j < seqs.length; j++ ) {
            var seq = seqs[ j ]
            if( seq.shouldStop ) continue;

            var idx = seq.values.pick ? seq.values.pick() : seq.valuesIndex++ % seq.values.length
            
            var val = typeof seq.values === 'function' ? seq.values() : seq.values[ idx ];
    
            if(typeof val === 'function') { val = val(); } // will also call anonymous function
    
            if( seq.target ) {
              if( typeof seq.target[ seq.key ] === 'function' ) {
                seq.target[ seq.key ]( val );
              }else{
                seq.target[ seq.key ] = val;
              }
            }
            
            if( that.chose ) that.chose( seq.key, idx )
             
            if( Array.isArray( seq.durations ) ) {
              var idx = seq.durations.pick ? seq.durations.pick() : seq.durationsIndex++,
                  next = typeof seq.durations === 'function' ? seq.durations() : seq.durations[ idx ]

              newNextTime = typeof next === 'function' ? next() : next;
              if( typeof seq.durations !== 'function' && seq.durationsIndex >= seq.durations.length ) {
                seq.durationsIndex = 0;
              }
              if( that.chose ) that.chose( 'durations', idx )
            }else{
              var next = typeof seq.durations === 'function' ? seq.durations() : seq.durations;
              
              newNextTime = typeof next === 'function' ? next() : next;
            }
        
            var t;
          
            if( that.timeModifier !== null ) {
              t = that.timeModifier( newNextTime ) + phase // TODO: remove Gibber link... how?
            }else{
              t = newNextTime + phase
            }
          
            t -= phaseDiff
            newNextTime -= phaseDiff
          
            if( typeof that.timeline[ t ] === 'undefined' ) {
              that.timeline[ t ] = [ seq ]
            }else{
              if( seq.priority ) {
                that.timeline[ t ].unshift( seq )
              }else{
                that.timeline[ t ].push( seq )
              }
            }
          }
          
          for( var j = 0, l = that.autofire.length; j < l; j++ ) {
            var seq = that.autofire[ j ]
            if( seq.shouldStop ) continue;

            var idx = seq.values.pick ? seq.values.pick() : seq.valuesIndex++ % seq.values.length,
                val = seq.values[ idx ];
    
            if(typeof val === 'function') { val = val(); } // will also call anonymous function
    
            if( seq.target ) {
              if(typeof seq.target[ seq.key ] === 'function') {
                seq.target[ seq.key ]( val );
              }else{
                seq.target[ seq.key ] = val;
              }
            }
            
            if( that.chose ) that.chose( seq.key, idx )
          }
          
          delete that.timeline[ nextTime ]
          
          var times = Object.keys( that.timeline ),
              timesLength = times.length;
          
          if( timesLength > 1 ) {
            for( var i = 0; i < timesLength; i++ ) {
              times[ i ] = parseFloat( times[i] )
            }
          
            times = times.sort( sort )
            that.nextTime = times[0]
          }else{
            that.nextTime = parseFloat( times[0] )
          }
          
          // if(that.repeatTarget) {
          //   that.repeatCount++;
          //   if(that.repeatCount === that.repeatTarget) {
          //     that.isRunning = false;
          //     that.repeatCount = 0;
          //   }
          // }  
        }
        
        // TODO: If you set the phase to 0, it will be lower than nextTime for many many samples in a row, causing it to quickly skip
        // through lots of key / value pairs.
        
        phase += rate;
      }
      return 0;
    },
  
    start : function(shouldKeepOffset, priority) {
      if(!shouldKeepOffset || ! this.offset ) {
        phase = 0;
        this.nextTime = 0;
        
        this.timeline = { 0:[] }
        for( var i = 0; i < this.seqs.length; i++ ) {
          var _seq = this.seqs[ i ]
    
          _seq.valuesIndex = _seq.durationsIndex = _seq.shouldStop = 0
    
          this.timeline[ 0 ].push( _seq )
        }
      }else{
        phase = 0;
        this.nextTime = this.offset;
        
        var ___key = ''+this.offset
        
        this.timeline = {}
        this.timeline[ ___key ] = []

        for( var i = 0; i < this.seqs.length; i++ ) {
          var _seq = this.seqs[ i ]
    
          _seq.valuesIndex = _seq.durationsIndex = _seq.shouldStop = 0
    
          this.timeline[ ___key ].push( _seq )
        }
      }
      
      if( !this.isConnected ) {
        this.connect( Gibberish.Master, priority )
        this.isConnected = true
      }
      
      this.isRunning = true;
      return this;
    },
    
    stop: function() {
      this.isRunning = false;
      
      if( this.isConnected ) {
        this.disconnect()
        this.isConnected = false
      }
      return this;
    },
       
    repeat : function(times) {
      this.repeatTarget = times;
      return this;
    },
    
    shuffle : function( seqName ) {
      if( typeof seqName !== 'undefined' ) {
        for( var i = 0; i < this.seqs.length; i++ ) {
          if( this.seqs[i].key === seqName ) {
            this.shuffleArray( this.seqs[i].values )
          }
        }
      }else{
        for( var i = 0; i < this.seqs.length; i++ ) {
          this.shuffleArray( this.seqs[i].values )
        }
      }
    },
    
    shuffleArray : function( arr ) {
  		for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    },

  });
  
  this.init( arguments );
  this.processProperties( arguments );
  
  this.oscillatorInit();
};
Gibberish.PolySeq.prototype = Gibberish._oscillator
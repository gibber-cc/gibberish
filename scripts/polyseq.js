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
      phase = 0;
  
  Gibberish.extend(this, {
    seqs          : [],
    timeline      : {},
    playOnce      : false,
    repeatCount   : 0,
    repeatTarget  : null,
    isConnected   : false,
    properties    : { rate: 1, isRunning:false, nextTime:0 },
    offset        : 0,
    name          : 'polyseq',
    getPhase      : function() { return phase },
    add           : function( seq ) {
      seq.valuesIndex = seq.durationsIndex = 0
      that.seqs.push( seq )
      
      if( typeof that.timeline[0] !== 'undefined' ) {
        that.timeline[0].push( seq )
      }else{
        that.timeline[0] = [seq]
      }
      
      // for Gibber... TODO: remove from Gibberish
      if( that.scale && (seq.key === 'frequency' || seq.key === 'note') ) {
        if( that.applyScale ) {
          that.applyScale()
        }
      }
      
      that.nextTime = 0
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
            if( seq.target ) {
              var idx = seq.values.pick ? seq.values.pick() : seq.valuesIndex++ % seq.values.length,
                  val = seq.values[ idx ];
      
              if(typeof val === 'function') { val = val(); }
      
              if(typeof seq.target[ seq.key ] === 'function') {
                seq.target[ seq.key ]( val );
              }else{
                seq.target[ seq.key ] = val;
              }
            }else{
              if(typeof seq.values[ seq.valuesIndex ] === 'function') {
                seq.values[ seq.valuesIndex++ % seq.values.length ]();
              }
            }
              
            if( Array.isArray( seq.durations ) ) {
              var idx = seq.durations.pick ? seq.durations.pick() : seq.durationsIndex++,
                  next = seq.durations[ idx ]

              newNextTime = typeof next === 'function' ? next() : next;
              if( seq.durationsIndex >= seq.durations.length ) {
                seq.durationsIndex = 0;
              }
            }else{
              var next = seq.durations;
              newNextTime = typeof next === 'function' ? next() : next;
            }
          
            var t;
            
            if( typeof Gibber !== 'undefined' ) {
              t = Gibber.Clock.time( newNextTime ) + phase // TODO: remove Gibber link... how?
            }else{
              t = newNextTime + phase
            }
            
            t -= phaseDiff
            newNextTime -= phaseDiff
            
            if( typeof that.timeline[ t ] === 'undefined' ) {
              that.timeline[ t ] = [ seq ]
            }else{
              that.timeline[ t ].push( seq )
            }
          }
          
          delete that.timeline[ nextTime ]
          
          var times = Object.keys( that.timeline ),
              timesLength = times.length;
          
          if( timesLength > 1 ) {
            for( var i = 0; i < timesLength; i++ ) {
              times[ i ] = parseFloat( times[i] )
            }
          
            times = times.sort( function(a,b) { if( a < b ) return -1; if( a > b ) return 1; return 0; })
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
      
        phase += rate;
      }
      return 0;
    },
  
    start : function(shouldKeepOffset) {
      if(!shouldKeepOffset) {
        phase = 0;
        this.nextTime = 0;
        
        this.timeline = { 0:[] }
        for( var i = 0; i < this.seqs.length; i++ ) {
          var _seq = this.seqs[ i ]
    
          _seq.valuesIndex = _seq.durationsIndex = _seq.shouldStop = 0
    
          this.timeline[0].push( _seq )
        }
      }
      
      if( !this.isConnected ) {
        this.connect()
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
    
    shuffle : function() {
      for( key in this.keysAndValues ) {
        this.shuffleArray( this.keysAndValues[ key ] )
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
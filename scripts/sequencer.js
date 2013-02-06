Gibberish.Sequencer = function() {  
  Gibberish.extend(this, {
    target        : null,
    key           : null,
    values        : null,
    valuesIndex   : 0,
    rate          : null,
    rateIndex     : 0,
    nextTime      : 0,
    phase         : 0,
    isRunning     : false,
    playOnce      : false,
    repeatCount   : 0,
    repeatTarget  : null,
    isConnected   : true,
    keysAndValues : null,
    counts        : {},
    
    tick : function() {
      if(this.isRunning) {
        if(this.phase === this.nextTime) {
          if(this.values !== null) {
            if(this.target) {
              var val = this.values[ this.valuesIndex++ ];
              
              if(typeof val === 'function') { val = val(); }
              
              if(typeof this.target[this.key] === 'function') {
                this.target[this.key]( val );
              }else{
                this.target[this.key] = val;
              }
            }else{
              if(typeof this.values[ this.valuesIndex ] === 'function') {
                this.values[ this.valuesIndex++ ]();
              }
            }
            if(this.valuesIndex >= this.values.length) this.valuesIndex = 0;
          }else if(this.keysAndValues !== null) {
            for(var key in this.keysAndValues) {
              var index = this.counts[key]++;
              var val = this.keysAndValues[key][index];
              
              if(typeof val === 'function') { val = val(); }
              
              if(typeof this.target[key] === 'function') {
                this.target[key]( val );
              }else{
                this.target[key] = val;
              }
              if(this.counts[key] >= this.keysAndValues[key].length) {
                this.counts[key] = 0;
              }
            }
          }else if(typeof this.target[this.key] === 'function') {
            this.target[this.key]();
          }
          
          this.phase = 0;
        
          if(Array.isArray(this.rate)) {
            this.nextTime = this.rate[ this.rateIndex++ ];
            if( this.rateIndex >= this.rate.length) {
              this.rateIndex = 0;
            }
          }else{
            this.nextTime = this.rate;
          }
          
          if(this.repeatTarget) {
            this.repeatCount++;
            if(this.repeatCount === this.repeatTarget) {
              this.isRunning = false;
              this.repeatCount = 0;
            }
          }
          
          return;
        }
      
        this.phase++;
      }
    },
    
    start : function(shouldKeepOffset) {
      if(!shouldKeepOffset) {
        this.phase = 0;
      }
      
      this.isRunning = true;
      return this;
    },
    
    stop: function() {
      this.isRunning = false;
      return this;
    },
    
    repeat : function(times) {
      this.repeatTarget = times;
      return this;
    },
    
    disconnect : function() {
      var idx = Gibberish.sequencers.indexOf( this );
      Gibberish.sequencers.splice( idx, 1 );
      this.isConnected = false;
    },
    
    connect : function() {
      if( Gibberish.sequencers.indexOf( this ) === -1 ) {
        Gibberish.sequencers.push( this );
      }
    },
  });
  
  for(var key in arguments[0]) {
    this[key] = arguments[0][key];
  }
  
  for(var key in this.keysAndValues) {
    this.counts[key] = 0;
  }
  
  this.connect();
};
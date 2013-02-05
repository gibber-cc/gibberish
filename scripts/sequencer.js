Gibberish.Sequencer = function() {  
  Gibberish.extend(this, {
    target      : null,
    key         : null,
    values      : null,
    valuesIndex : 0,
    rate        : null,
    rateIndex   : 0,
    nextTime    : 0,
    phase       : 0,
    isRunning   : false,
    playOnce    : false,
    repeatCount : 0,
    repeatTarget: null,
    isConnected : true,
    
    tick        : function() {
      if(this.isRunning) {
        if(this.phase === this.nextTime) {
          if(this.values !== null) {
            if(this.target) {
              if(typeof this.target[this.key] === 'function') {
                this.target[this.key]( this.values[ this.valuesIndex++ ] );
              }else{
                this.target[this.key] = this.values[ this.valuesIndex++];
              }
            }else{
              if(typeof this.values[ this.valuesIndex ] === 'function') {
                this.values[ this.valuesIndex++ ]();
              }
            }
            if(this.valuesIndex >= this.values.length) this.valuesIndex = 0;
          }
        
          this.phase = 0;
        
          // schedule next event
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
      var idx = Gibberish.sequencers.indexOf(this);
      Gibberish.sequencers.splice(idx, 1);
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
  
};
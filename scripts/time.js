Gibberish.Time = {
  bpm: 120,
  
  export: function(target) {
    Gibberish.export("Time", target || window);
  },
  
  ms : function(val) {
    return Math.round(val * 44.1);
  },
  
  seconds : function(val) {
    return Math.round(val * 44100);
  },
  
  beats : function(val) {
    return function() { 
      var samplesPerBeat = 44100 / ( Gibberish.Time.bpm / 60 ) ;
      return Math.round( samplesPerBeat * val );
    }
  },
  
  setBPM : function(val) {
    Gibberish.Time.bpm = val;
  },
};
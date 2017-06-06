(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Gibberish = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let analyzer = Object.create( ugen )

Object.assign( analyzer, {
  __type__: 'analyzer',
})

module.exports = analyzer

},{"../ugen.js":55}],2:[function(require,module,exports){
let g = require( 'genish.js' ),
    analyzer = require( './analyzer.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {
 
let Delay = inputProps => {
  let ssd = Object.create( analyzer )
  ssd.in  = Object.create( ugen )
  ssd.out = Object.create( ugen )

  ssd.id = Gibberish.factory.getUID()

  let props = Object.assign({}, inputProps )
  let isStereo = false//props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' )
    
  let historyL = g.history()

  if( isStereo ) {
    // right channel
    let historyR = g.history()

    Gibberish.factory( 
      ssd.out,
      [ historyL.out, historyR.out ], 
      'ssd_out', 
      props 
    )

    ssd.out.callback.ugenName = ssd.out.ugenName = 'ssd_out_' + ssd.id

    const idxL = ssd.out.graph.memory.value.idx, 
          idxR = idxL + 1,
          memory = Gibberish.genish.gen.memory.heap

    const callback = function( input ) {
      'use strict'
      memory[ idxL ] = input[0]
      memory[ idxR ] = input[1]
      return 0     
    }
    
    Gibberish.factory( ssd.in, [ input[0],input[1] ], 'ssd_in', props, callback )

    callback.ugenName = ssd.in.ugenName = 'ssd_in_' + ssd.id
    ssd.in.inputNames = [ 'input' ]
    ssd.in.inputs = [ props.input ]
    ssd.in.input = props.input
    ssd.type = 'analysis'

    ssd.in.listen = function( ugen ) {
      if( ugen !== undefined ) {
        ssd.in.input = ugen
        ssd.in.inputs = [ ugen ]
      }

      if( Gibberish.analyzers.indexOf( ssd.in ) === -1 ) {
        Gibberish.analyzers.push( ssd.in )
      }

      Gibberish.dirty( Gibberish.analyzers )
    }
  }else{
    Gibberish.factory( ssd.out, historyL.out, 'ssd_out', props )

    ssd.out.callback.ugenName = ssd.out.ugenName = 'ssd_out_' + ssd.id

    let idx = ssd.out.graph.memory.value.idx 
    let memory = Gibberish.genish.gen.memory.heap
    let phase = 0
    let callback = function( input ) {
      'use strict'
      memory[ idx ] = input
      return 0     
    }
    
    Gibberish.factory( ssd.in, input, 'ssd_in', props, callback )

    callback.ugenName = ssd.in.ugenName = 'ssd_in_' + ssd.id
    ssd.in.inputNames = [ 'input' ]
    ssd.in.inputs = [ props.input ]
    ssd.in.input = props.input
    ssd.type = 'analysis'

    ssd.in.listen = function( ugen ) {
      if( ugen !== undefined ) {
        ssd.in.input = ugen
        ssd.in.inputs = [ ugen ]
      }

      if( Gibberish.analyzers.indexOf( ssd.in ) === -1 ) {
        Gibberish.analyzers.push( ssd.in )
      }

      Gibberish.dirty( Gibberish.analyzers )
    }

  }
  
  return ssd
}

Delay.defaults = {
  input:0,
}

return Delay

}

},{"../ugen.js":55,"./analyzer.js":1,"genish.js":94}],3:[function(require,module,exports){
let ugen = require( '../ugen.js' ),
    g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let AD = function( argumentProps ) {
    let ad = Object.create( ugen ),
        attack  = g.in( 'attack' ),
        decay   = g.in( 'decay' )

    let props = Object.assign( {}, AD.defaults, argumentProps )

    let graph = g.ad( attack, decay )

    Gibberish.factory( ad, graph, 'ad', props )

    ad.trigger = graph.trigger

    return ad
  }

  AD.defaults = { attack:44100, decay:44100 } 

  return AD

}

},{"../ugen.js":55,"genish.js":94}],4:[function(require,module,exports){
let ugen = require( '../ugen.js' ),
    g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  let ADSR = function( argumentProps ) {
    let adsr  = Object.create( ugen ),
        attack  = g.in( 'attack' ),
        decay   = g.in( 'decay' ),
        sustain = g.in( 'sustain' ),
        release = g.in( 'release' ),
        sustainLevel = g.in( 'sustainLevel' )

    let props = Object.assign( {}, ADSR.defaults, argumentProps )

    let graph = g.adsr( attack, decay, sustain, sustainLevel, release, { triggerRelease: props.triggerRelease } )

    Gibberish.factory( adsr, graph, 'adsr', props )

    adsr.trigger = graph.trigger
    adsr.advance = graph.release

    return adsr
  }

  ADSR.defaults = { attack:22050, decay:22050, sustain:44100, sustainLevel:.6, release: 44100, triggerRelease:false } 

  return ADSR
}

},{"../ugen.js":55,"genish.js":94}],5:[function(require,module,exports){
module.exports = function( Gibberish ) {

  const Envelopes = {
    AD     : require( './ad.js' )( Gibberish ),
    ADSR   : require( './adsr.js' )( Gibberish ),
    Ramp   : require( './ramp.js' )( Gibberish ),

    export : target => {
      for( let key in Envelopes ) {
        if( key !== 'export' ) {
          target[ key ] = Envelopes[ key ]
        }
      }
    }
  } 

  return Envelopes
}

},{"./ad.js":3,"./adsr.js":4,"./ramp.js":6}],6:[function(require,module,exports){
const ugen = require( '../ugen.js' ),
      g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  const Ramp = function( argumentProps ) {
    const ramp   = Object.create( ugen ),
          length = g.in( 'length' ),
          from   = g.in( 'from' ),
          to     = g.in( 'to' )

    const props = Object.assign({}, Ramp.defaults, argumentProps )

    const reset = g.bang()

    const phase = g.accum( g.div( 1, length ), reset, { shouldWrap:props.shouldLoop, shouldClamp:true }),
          diff = g.sub( to, from ),
          graph = g.add( from, g.mul( phase, diff ) )

    Gibberish.factory( ramp, graph, 'ramp', props )

    ramp.trigger = reset.trigger

    return ramp
  }

  Ramp.defaults = { from:0, to:1, length:g.gen.samplerate, shouldLoop:false }

  return Ramp

}

},{"../ugen.js":55,"genish.js":94}],7:[function(require,module,exports){
/*
 * https://github.com/antimatter15/heapqueue.js/blob/master/heapqueue.js
 *
 * This implementation is very loosely based off js-priority-queue
 * by Adam Hooper from https://github.com/adamhooper/js-priority-queue
 *
 * The js-priority-queue implementation seemed a teensy bit bloated
 * with its require.js dependency and multiple storage strategies
 * when all but one were strongly discouraged. So here is a kind of
 * condensed version of the functionality with only the features that
 * I particularly needed.
 *
 * Using it is pretty simple, you just create an instance of HeapQueue
 * while optionally specifying a comparator as the argument:
 *
 * var heapq = new HeapQueue();
 *
 * var customq = new HeapQueue(function(a, b){
 *   // if b > a, return negative
 *   // means that it spits out the smallest item first
 *   return a - b;
 * });
 *
 * Note that in this case, the default comparator is identical to
 * the comparator which is used explicitly in the second queue.
 *
 * Once you've initialized the heapqueue, you can plop some new
 * elements into the queue with the push method (vaguely reminiscent
 * of typical javascript arays)
 *
 * heapq.push(42);
 * heapq.push("kitten");
 *
 * The push method returns the new number of elements of the queue.
 *
 * You can push anything you'd like onto the queue, so long as your
 * comparator function is capable of handling it. The default
 * comparator is really stupid so it won't be able to handle anything
 * other than an number by default.
 *
 * You can preview the smallest item by using peek.
 *
 * heapq.push(-9999);
 * heapq.peek(); // ==> -9999
 *
 * The useful complement to to the push method is the pop method,
 * which returns the smallest item and then removes it from the
 * queue.
 *
 * heapq.push(1);
 * heapq.push(2);
 * heapq.push(3);
 * heapq.pop(); // ==> 1
 * heapq.pop(); // ==> 2
 * heapq.pop(); // ==> 3
 */
let HeapQueue = function(cmp){
  this.cmp = (cmp || function(a, b){ return a - b; });
  this.length = 0;
  this.data = [];
}
HeapQueue.prototype.peek = function(){
  return this.data[0];
};
HeapQueue.prototype.push = function(value){
  this.data.push(value);

  var pos = this.data.length - 1,
  parent, x;

  while(pos > 0){
    parent = (pos - 1) >>> 1;
    if(this.cmp(this.data[pos], this.data[parent]) < 0){
      x = this.data[parent];
      this.data[parent] = this.data[pos];
      this.data[pos] = x;
      pos = parent;
    }else break;
  }
  return this.length++;
};
HeapQueue.prototype.pop = function(){
  var last_val = this.data.pop(),
  ret = this.data[0];
  if(this.data.length > 0){
    this.data[0] = last_val;
    var pos = 0,
    last = this.data.length - 1,
    left, right, minIndex, x;
    while(1){
      left = (pos << 1) + 1;
      right = left + 1;
      minIndex = pos;
      if(left <= last && this.cmp(this.data[left], this.data[minIndex]) < 0) minIndex = left;
      if(right <= last && this.cmp(this.data[right], this.data[minIndex]) < 0) minIndex = right;
      if(minIndex !== pos){
        x = this.data[minIndex];
        this.data[minIndex] = this.data[pos];
        this.data[pos] = x;
        pos = minIndex;
      }else break;
    }
  } else {
    ret = last_val;
  }
  this.length--;
  return ret;
};

module.exports = HeapQueue

},{}],8:[function(require,module,exports){
let g = require( 'genish.js' )
 
// constructor for schroeder allpass filters
let allPass = function( _input, length=500, feedback=.5 ) {
  let index  = g.counter( 1,0,length ),
      buffer = g.data( length ),
      bufferSample = g.peek( buffer, index, { interp:'none', mode:'samples' }),
      out = g.memo( g.add( g.mul( -1, _input), bufferSample ) )
                
  g.poke( buffer, g.add( _input, g.mul( bufferSample, feedback ) ), index )
 
  return out
}

module.exports = allPass

},{"genish.js":94}],9:[function(require,module,exports){
let g = require( 'genish.js' ),
    filter = require( './filter.js' )

module.exports = function( Gibberish ) {

  Gibberish.genish.biquad = ( input, cutoff, _Q, mode, isStereo ) => {
    let a0,a1,a2,c,b1,b2,
        in1a0,x1a1,x2a2,y1b1,y2b2,
        in1a0_1,x1a1_1,x2a2_1,y1b1_1,y2b2_1

    let returnValue
    
    const Q = g.memo( g.add( .5, g.mul( _Q, 22 ) ) )
    let x1 = g.history(), x2 = g.history(), y1 = g.history(), y2 = g.history()
    
    let w0 = g.memo( g.mul( 2 * Math.PI, g.div( cutoff,  g.gen.samplerate ) ) ),
        sinw0 = g.sin( w0 ),
        cosw0 = g.cos( w0 ),
        alpha = g.memo( g.div( sinw0, g.mul( 2, Q ) ) )

    let oneMinusCosW = g.sub( 1, cosw0 )

    switch( mode ) {
      case 1:
        a0 = g.memo( g.div( g.add( 1, cosw0) , 2) )
        a1 = g.mul( g.add( 1, cosw0 ), -1 )
        a2 = a0
        c  = g.add( 1, alpha )
        b1 = g.mul( -2 , cosw0 )
        b2 = g.sub( 1, alpha )
        break;
      case 2:
        a0 = g.mul( Q, alpha )
        a1 = 0
        a2 = g.mul( a0, -1 )
        c  = g.add( 1, alpha )
        b1 = g.mul( -2 , cosw0 )
        b2 = g.sub( 1, alpha )
        break;
      default: // LP
        a0 = g.memo( g.div( oneMinusCosW, 2) )
        a1 = oneMinusCosW
        a2 = a0
        c  = g.add( 1, alpha )
        b1 = g.mul( -2 , cosw0 )
        b2 = g.sub( 1, alpha )
    }

    a0 = g.div( a0, c ); a1 = g.div( a1, c ); a2 = g.div( a2, c )
    b1 = g.div( b1, c ); b2 = g.div( b2, c )

    in1a0 = g.mul( x1.in( isStereo ? input[0] : input ), a0 )
    x1a1  = g.mul( x2.in( x1.out ), a1 )
    x2a2  = g.mul( x2.out,          a2 )

    let sumLeft = g.add( in1a0, x1a1, x2a2 )

    y1b1 = g.mul( y2.in( y1.out ), b1 )
    y2b2 = g.mul( y2.out, b2 )

    let sumRight = g.add( y1b1, y2b2 )

    let diff = g.sub( sumLeft, sumRight )

    y1.in( diff )

    if( isStereo ) {
      let x1_1 = g.history(), x2_1 = g.history(), y1_1 = g.history(), y2_1 = g.history()

      in1a0_1 = g.mul( x1_1.in( input[1] ), a0 )
      x1a1_1  = g.mul( x2_1.in( x1_1.out ), a1 )
      x2a2_1  = g.mul( x2_1.out,            a2 )

      let sumLeft_1 = g.add( in1a0_1, x1a1_1, x2a2_1 )

      y1b1_1 = g.mul( y2_1.in( y1_1.out ), b1 )
      y2b2_1 = g.mul( y2_1.out, b2 )

      let sumRight_1 = g.add( y1b1_1, y2b2_1 )

      let diff_1 = g.sub( sumLeft_1, sumRight_1 )

      y1_1.in( diff_1 )
      
      returnValue = [ diff, diff_1 ]
    }else{
      returnValue = diff
    }

    return returnValue
  }

  let Biquad = inputProps => {
    let biquad = Object.create( filter )
    Object.assign( biquad, Biquad.defaults, inputProps ) 

    let isStereo = biquad.input.isStereo

    biquad.__createGraph = function() {
      biquad.graph = Gibberish.genish.biquad( g.in('input'), g.mul( g.in('cutoff'), g.gen.samplerate / 4 ),  g.in('Q'), biquad.mode, isStereo )
    }

    biquad.__createGraph()
    biquad.__requiresRecompilation = [ 'mode' ]

    Gibberish.factory(
      biquad,
      biquad.graph,
      'biquad', 
      biquad
    )

    return biquad
  }

  Biquad.defaults = {
    input:0,
    Q: .15,
    cutoff:.05,
    mode:0
  }

  return Biquad

}


},{"./filter.js":12,"genish.js":94}],10:[function(require,module,exports){
let g = require( 'genish.js' )

let combFilter = function( _input, combLength, damping=.5*.4, feedbackCoeff=.84 ) {
  let lastSample   = g.history(),
  	  readWriteIdx = g.counter( 1,0,combLength ),
      combBuffer   = g.data( combLength ),
	    out          = g.peek( combBuffer, readWriteIdx, { interp:'none', mode:'samples' }),
      storeInput   = g.memo( g.add( g.mul( out, g.sub( 1, damping)), g.mul( lastSample.out, damping ) ) )
      
  lastSample.in( storeInput )
 
  g.poke( combBuffer, g.add( _input, g.mul( storeInput, feedbackCoeff ) ), readWriteIdx )
 
  return out
}

module.exports = combFilter

},{"genish.js":94}],11:[function(require,module,exports){
const g = require( 'genish.js' ),
      filter = require( './filter.js' )

module.exports = function( Gibberish ) {
  Gibberish.genish.diodeZDF = ( input, _Q, freq, saturation, isStereo=false ) => {
    const iT = 1 / g.gen.samplerate,
          kz1 = g.history(0),
          kz2 = g.history(0),
          kz3 = g.history(0),
          kz4 = g.history(0)

    let   ka1 = 1.0,
          ka2 = 0.5,
          ka3 = 0.5,
          ka4 = 0.5,
          kindx = 0   

    const Q = g.memo( g.add( .5, g.mul( _Q, 11 ) ) )
    // kwd = 2 * $M_PI * acf[kindx]
    const kwd = g.memo( g.mul( Math.PI * 2, freq ) )

    // kwa = (2/iT) * tan(kwd * iT/2) 
    const kwa =g.memo( g.mul( 2/iT, g.tan( g.mul( kwd, iT/2 ) ) ) )

    // kG  = kwa * iT/2 
    const kg = g.memo( g.mul( kwa, iT/2 ) )
    
    const kG4 = g.memo( g.mul( .5, g.div( kg, g.add( 1, kg ) ) ) )
    const kG3 = g.memo( g.mul( .5, g.div( kg, g.sub( g.add( 1, kg ), g.mul( g.mul( .5, kg ), kG4 ) ) ) ) )
    const kG2 = g.memo( g.mul( .5, g.div( kg, g.sub( g.add( 1, kg ), g.mul( g.mul( .5, kg ), kG3 ) ) ) ) )
    const kG1 = g.memo( g.div( kg, g.sub( g.add( 1, kg ), g.mul( kg, kG2 ) ) ) )

    const kGAMMA = g.memo( g.mul( g.mul( kG4, kG3 ) , g.mul( kG2, kG1 ) ) )

    const kSG1 = g.memo( g.mul( g.mul( kG4, kG3 ), kG2 ) ) 

    const kSG2 = g.memo( g.mul( kG4, kG3) )  
    const kSG3 = kG4 
    let kSG4 = 1.0 
    // kk = 4.0*(kQ - 0.5)/(25.0 - 0.5)
    const kalpha = g.memo( g.div( kg, g.add(1.0, kg) ) )

    const kbeta1 = g.memo( g.div( 1.0, g.sub( g.add( 1, kg ), g.mul( kg, kG2 ) ) ) )
    const kbeta2 = g.memo( g.div( 1.0, g.sub( g.add( 1, kg ), g.mul( g.mul( .5, kg ), kG3 ) ) ) )
    const kbeta3 = g.memo( g.div( 1.0, g.sub( g.add( 1, kg ), g.mul( g.mul( .5, kg ), kG4 ) ) ) )
    const kbeta4 = g.memo( g.div( 1.0, g.add( 1, kg ) ) ) 

    const kgamma1 = g.memo( g.add( 1, g.mul( kG1, kG2 ) ) )
    const kgamma2 = g.memo( g.add( 1, g.mul( kG2, kG3 ) ) )
    const kgamma3 = g.memo( g.add( 1, g.mul( kG3, kG4 ) ) )

    const kdelta1 = kg
    const kdelta2 = g.memo( g.mul( 0.5, kg ) )
    const kdelta3 = g.memo( g.mul( 0.5, kg ) )

    const kepsilon1 = kG2
    const kepsilon2 = kG3
    const kepsilon3 = kG4

    const klastcut = freq

    //;; feedback inputs 
    const kfb4 = g.memo( g.mul( kbeta4 , kz4.out ) ) 
    const kfb3 = g.memo( g.mul( kbeta3, g.add( kz3.out, g.mul( kfb4, kdelta3 ) ) ) )
    const kfb2 = g.memo( g.mul( kbeta2, g.add( kz2.out, g.mul( kfb3, kdelta2 ) ) ) )

    //;; feedback process

    const kfbo1 = g.memo( g.mul( kbeta1, g.add( kz1.out, g.mul( kfb2, kdelta1 ) ) ) ) 
    const kfbo2 = g.memo( g.mul( kbeta2, g.add( kz2.out, g.mul( kfb3, kdelta2 ) ) ) ) 
    const kfbo3 = g.memo( g.mul( kbeta3, g.add( kz3.out, g.mul( kfb4, kdelta3 ) ) ) ) 
    const kfbo4 = kfb4

    const kSIGMA = g.memo( 
      g.add( 
        g.add( 
          g.mul( kSG1, kfbo1 ), 
          g.mul( kSG2, kfbo2 )
        ), 
        g.add(
          g.mul( kSG3, kfbo3 ), 
          g.mul( kSG4, kfbo4 )
        ) 
      ) 
    )

    //const kSIGMA = 1
    //;; non-linear processing
    //if (knlp == 1) then
    //  kin = (1.0 / tanh(ksaturation)) * tanh(ksaturation * kin)
    //elseif (knlp == 2) then
    //  kin = tanh(ksaturation * kin) 
    //endif
    //
    //const kin = input 
    let kin = input//g.memo( g.mul( g.div( 1, g.tanh( saturation ) ), g.tanh( g.mul( saturation, input ) ) ) )
    kin = g.tanh( g.mul( saturation, kin ) )

    const kun = g.div( g.sub( kin, g.mul( Q, kSIGMA ) ), g.add( 1, g.mul( Q, kGAMMA ) ) )
    //const kun = g.div( 1, g.add( 1, g.mul( Q, kGAMMA ) ) )
        //(kin - kk * kSIGMA) / (1.0 + kk * kGAMMA)

    //;; 1st stage
    let kxin = g.memo( g.add( g.add( g.mul( kun, kgamma1 ), kfb2), g.mul( kepsilon1, kfbo1 ) ) )
    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    let kv = g.memo( g.mul( g.sub( g.mul( ka1, kxin ), kz1.out ), kalpha ) )
    //kv = (ka1 * kxin - kz1) * kalpha 
    let klp = g.add( kv, kz1.out )
    //klp = kv + kz1
    kz1.in( g.add( klp, kv ) ) 
    //kz1 = klp + kv

        //;; 2nd stage
    //kxin = (klp * kgamma2 + kfb3 + kepsilon2 * kfbo2)
    //kv = (ka2 * kxin - kz2) * kalpha 
    //klp = kv + kz2
    //kz2 = klp + kv

    kxin = g.memo( g.add( g.add( g.mul( klp, kgamma2 ), kfb3), g.mul( kepsilon2, kfbo2 ) ) )
    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    kv = g.memo( g.mul( g.sub( g.mul( ka2, kxin ), kz2.out ), kalpha ) )
    //kv = (ka1 * kxin - kz1) * kalpha 
    klp = g.add( kv, kz2.out ) 
    //klp = kv + kz1
    kz2.in( g.add( klp, kv ) ) 
    //kz1 = klp + kv

    //;; 3rd stage
    //kxin = (klp * kgamma3 + kfb4 + kepsilon3 * kfbo3)
    //kv = (ka3 * kxin - kz3) * kalpha 
    //klp = kv + kz3
    //kz3 = klp + kv

    kxin = g.memo( g.add( g.add( g.mul( klp, kgamma3 ), kfb4), g.mul( kepsilon3, kfbo3 ) ) )
    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    kv = g.memo( g.mul( g.sub( g.mul( ka3, kxin ), kz3.out ), kalpha ) )
    //kv = (ka1 * kxin - kz1) * kalpha 
    klp = g.add( kv, kz3.out )
    //klp = kv + kz1
    kz3.in( g.add( klp, kv ) )
    //kz1 = klp + kv

    //;; 4th stage
    //kv = (ka4 * klp - kz4) * kalpha 
    //klp = kv + kz4
    //kz4 = klp + kv

    // (kun * kgamma1 + kfb2 + kepsilon1 * kfbo1)
    kv = g.memo( g.mul( g.sub( g.mul( ka4, kxin ), kz4.out ), kalpha ) )
    //kv = (ka1 * kxin - kz1) * kalpha 
    klp = g.add( kv, kz4.out )
    //klp = kv + kz1
    kz4.in( g.add( klp, kv ) )

    //kz1 = klp + kv
    if( isStereo ) {
      //let polesR = g.data([ 0,0,0,0 ], 1, { meta:true }),
      //    rezzR = g.clamp( g.mul( polesR[3], rez ) ),
      //    outputR = g.sub( input[1], rezzR )         

      //polesR[0] = g.add( polesR[0], g.mul( g.add( g.mul(-1, polesR[0] ), outputR   ), cutoff ))
      //polesR[1] = g.add( polesR[1], g.mul( g.add( g.mul(-1, polesR[1] ), polesR[0] ), cutoff ))
      //polesR[2] = g.add( polesR[2], g.mul( g.add( g.mul(-1, polesR[2] ), polesR[1] ), cutoff ))
      //polesR[3] = g.add( polesR[3], g.mul( g.add( g.mul(-1, polesR[3] ), polesR[2] ), cutoff ))

      //let right = g.switch( isLowPass, polesR[3], g.sub( outputR, polesR[3] ) )

      //returnValue = [left, right]
    }else{
     // returnValue = klp
    }
    returnValue = klp
    
    return returnValue// klp//returnValue
 }

  const DiodeZDF = inputProps => {
    const zdf      = Object.create( filter )
    const props    = Object.assign( {}, DiodeZDF.defaults, inputProps )
    const isStereo = props.input.isStereo 

    Gibberish.factory(
      zdf, 
      Gibberish.genish.diodeZDF( g.in('input'), g.in('Q'), g.in('cutoff'), g.in('saturation'), isStereo ), 
      'diodeZDF',
      props
    )

    return zdf
  }

  DiodeZDF.defaults = {
    input:0,
    Q: 5,
    saturation: 1,
    cutoff: 440,
  }

  return DiodeZDF

}

},{"./filter.js":12,"genish.js":94}],12:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let filter = Object.create( ugen )

Object.assign( filter, {

})

module.exports = filter

},{"../ugen.js":55}],13:[function(require,module,exports){
let g = require( 'genish.js' ),
    filter = require( './filter.js' )

module.exports = function( Gibberish ) {

  Gibberish.genish.filter24 = ( input, _rez, _cutoff, isLowPass, isStereo=false ) => {
    let returnValue,
        polesL = g.data([ 0,0,0,0 ], 1, { meta:true }),
        peekProps = { interp:'none', mode:'simple' },
        rez = g.memo( g.mul( _rez, 5 ) ),
        cutoff = g.memo( g.div( _cutoff, 11025 ) ),
        rezzL = g.clamp( g.mul( polesL[3], rez ) ),
        outputL = g.sub( isStereo ? input[0] : input, rezzL ) 

    polesL[0] = g.add( polesL[0], g.mul( g.add( g.mul(-1, polesL[0] ), outputL   ), cutoff ))
    polesL[1] = g.add( polesL[1], g.mul( g.add( g.mul(-1, polesL[1] ), polesL[0] ), cutoff ))
    polesL[2] = g.add( polesL[2], g.mul( g.add( g.mul(-1, polesL[2] ), polesL[1] ), cutoff ))
    polesL[3] = g.add( polesL[3], g.mul( g.add( g.mul(-1, polesL[3] ), polesL[2] ), cutoff ))
    
    let left = g.switch( isLowPass, polesL[3], g.sub( outputL, polesL[3] ) )

    if( isStereo ) {
      let polesR = g.data([ 0,0,0,0 ], 1, { meta:true }),
          rezzR = g.clamp( g.mul( polesR[3], rez ) ),
          outputR = g.sub( input[1], rezzR )         

      polesR[0] = g.add( polesR[0], g.mul( g.add( g.mul(-1, polesR[0] ), outputR   ), cutoff ))
      polesR[1] = g.add( polesR[1], g.mul( g.add( g.mul(-1, polesR[1] ), polesR[0] ), cutoff ))
      polesR[2] = g.add( polesR[2], g.mul( g.add( g.mul(-1, polesR[2] ), polesR[1] ), cutoff ))
      polesR[3] = g.add( polesR[3], g.mul( g.add( g.mul(-1, polesR[3] ), polesR[2] ), cutoff ))

      let right = g.switch( isLowPass, polesR[3], g.sub( outputR, polesR[3] ) )

      returnValue = [left, right]
    }else{
      returnValue = left
    }

    return returnValue
  }

  let Filter24 = inputProps => {
    let filter24   = Object.create( filter )
    let props    = Object.assign( {}, Filter24.defaults, inputProps )
    let isStereo = props.input.isStereo 

    Gibberish.factory(
      filter24, 
      Gibberish.genish.filter24( g.in('input'), g.in('Q'), g.in('cutoff'), g.in('isLowPass'), isStereo ), 
      'filter24',
      props
    )

    return filter24
  }


  Filter24.defaults = {
    input:0,
    Q: .25,
    cutoff: 880,
    isLowPass:1
  }

  return Filter24

}


},{"./filter.js":12,"genish.js":94}],14:[function(require,module,exports){
module.exports = function( Gibberish ) {

  const g = Gibberish.genish

  const filters = {
    Filter24Classic : require( './filter24.js'  )( Gibberish ),
    Filter24Moog    : require( './ladderFilterZeroDelay.js' )( Gibberish ),
    Filter24TB303   : require( './diodeFilterZDF.js' )( Gibberish ),
    Filter12Biquad  : require( './biquad.js'    )( Gibberish ),
    Filter12SVF     : require( './svf.js'       )( Gibberish ),
    
    // not for use by end-users
    genish: {
      Comb        : require( './combfilter.js' ),
      AllPass     : require( './allpass.js' )
    },

    factory( input, cutoff, resonance, saturation = null, _props, isStereo = false ) {
      let filteredOsc 

      //if( props.filterType === 1 ) {
      //  if( typeof props.cutoff !== 'object' && props.cutoff > 1 ) {
      //    props.cutoff = .25
      //  }
      //  if( typeof props.cutoff !== 'object' && props.filterMult > .5 ) {
      //    props.filterMult = .1
      //  }
      //}
      let props = Object.assign({}, filters.defaults, _props )

      switch( props.filterType ) {
        case 1:
          isLowPass = g.param( 'lowPass', 1 ),
          filteredOsc = g.filter24( input, g.in('Q'), cutoff, props.filterMode, isStereo )
          break;
        case 2:
          filteredOsc = g.zd24( input, g.in('Q'), cutoff )
          break;
        case 3:
          filteredOsc = g.diodeZDF( input, g.in('Q'), cutoff, g.in('saturation'), isStereo ) 
          break;
        case 4:
          filteredOsc = g.svf( input, cutoff, g.sub( 1, g.in('Q')), props.filterMode, isStereo ) 
          break; 
        case 5:
          filteredOsc = g.biquad( input, cutoff,  g.in('Q'), props.filterMode, isStereo ) 
          break; 
        default:
          // return unfiltered signal
          filteredOsc = input //g.filter24( oscWithGain, g.in('resonance'), cutoff, isLowPass )
          break;
      }

      return filteredOsc
    },

    defaults: { filterMode: 0, filterType:0 }
  }

  filters.export = target => {
    for( let key in filters ) {
      if( key !== 'export' && key !== 'genish' ) {
        target[ key ] = filters[ key ]
      }
    }
  }

return filters

}

},{"./allpass.js":8,"./biquad.js":9,"./combfilter.js":10,"./diodeFilterZDF.js":11,"./filter24.js":13,"./ladderFilterZeroDelay.js":15,"./svf.js":16}],15:[function(require,module,exports){
const g = require( 'genish.js' ),
      filter = require( './filter.js' )

module.exports = function( Gibberish ) {

  Gibberish.genish.zd24 = ( input, _Q, freq, isStereo=false ) => {
    const iT = 1 / g.gen.samplerate,
          z1 = g.history(0),
          z2 = g.history(0),
          z3 = g.history(0),
          z4 = g.history(0)
    
    const Q = g.memo( g.add( .5, g.mul( _Q, 23 ) ) )
    // kwd = 2 * $M_PI * acf[kindx]
    const kwd = g.memo( g.mul( Math.PI * 2, freq ) )

    // kwa = (2/iT) * tan(kwd * iT/2) 
    const kwa =g.memo( g.mul( 2/iT, g.tan( g.mul( kwd, iT/2 ) ) ) )

    // kG  = kwa * iT/2 
    const kg = g.memo( g.mul( kwa, iT/2 ) )

    // kk = 4.0*(kQ - 0.5)/(25.0 - 0.5)
    const kk = g.memo( g.mul( 4, g.div( g.sub( Q, .5 ), 24.5 ) ) )

    // kg_plus_1 = (1.0 + kg)
    const kg_plus_1 = g.add( 1, kg )

    // kG = kg / kg_plus_1 
    const kG     = g.memo( g.div( kg, kg_plus_1 ) ),
          kG_2   = g.memo( g.mul( kG, kG ) ),
          kG_3   = g.mul( kG_2, kG ),
          kGAMMA = g.mul( kG_2, kG_2 )

    const kS1 = g.div( z1.out, kg_plus_1 ),
          kS2 = g.div( z2.out, kg_plus_1 ),
          kS3 = g.div( z3.out, kg_plus_1 ),
          kS4 = g.div( z4.out, kg_plus_1 )

    //kS = kG_3 * kS1  + kG_2 * kS2 + kG * kS3 + kS4 
    const kS = g.memo( 
      g.add(
        g.add( g.mul(kG_3, kS1), g.mul( kG_2, kS2) ),
        g.add( g.mul(kG, kS3), kS4 )
      )
    )

    //ku = (kin - kk *  kS) / (1 + kk * kGAMMA)
    const ku1 = g.sub( input, g.mul( kk, kS ) )
    const ku2 = g.memo( g.add( 1, g.mul( kk, kGAMMA ) ) )
    const ku  = g.memo( g.div( ku1, ku2 ) )

    let kv =  g.memo( g.mul( g.sub( ku, z1.out ), kG ) )
    let klp = g.memo( g.add( kv, z1.out ) )
    z1.in( g.add( klp, kv ) )

    kv  = g.memo( g.mul( g.sub( klp, z2.out ), kG ) )
    klp = g.memo( g.add( kv, z2.out ) )
    z2.in( g.add( klp, kv ) )

    kv  = g.memo( g.mul( g.sub( klp, z3.out ), kG ) )
    klp = g.memo( g.add( kv, z3.out ) )
    z3.in( g.add( klp, kv ) )

    kv  = g.memo( g.mul( g.sub( klp, z4.out ), kG ) )
    klp = g.memo( g.add( kv, z4.out ) )
    z4.in( g.add( klp, kv ) )


    if( isStereo ) {
      //let polesR = g.data([ 0,0,0,0 ], 1, { meta:true }),
      //    rezzR = g.clamp( g.mul( polesR[3], rez ) ),
      //    outputR = g.sub( input[1], rezzR )         

      //polesR[0] = g.add( polesR[0], g.mul( g.add( g.mul(-1, polesR[0] ), outputR   ), cutoff ))
      //polesR[1] = g.add( polesR[1], g.mul( g.add( g.mul(-1, polesR[1] ), polesR[0] ), cutoff ))
      //polesR[2] = g.add( polesR[2], g.mul( g.add( g.mul(-1, polesR[2] ), polesR[1] ), cutoff ))
      //polesR[3] = g.add( polesR[3], g.mul( g.add( g.mul(-1, polesR[3] ), polesR[2] ), cutoff ))

      //let right = g.switch( isLowPass, polesR[3], g.sub( outputR, polesR[3] ) )

      //returnValue = [left, right]
    }else{
      returnValue = klp
    }

    return returnValue
  }

  const Zd24 = inputProps => {
    const filter   = Object.create( filter )
    const props    = Object.assign( {}, Zd24.defaults, inputProps )
    const isStereo = props.input.isStereo 

    Gibberish.factory(
      filter, 
      Gibberish.genish.zd24( g.in('input'), g.in('Q'), g.in('cutoff'), isStereo ), 
      'zd24',
      props
    )

    return filter
  }


  Zd24.defaults = {
    input:0,
    Q: 5,
    cutoff: 440,
  }

  return Zd24

}


},{"./filter.js":12,"genish.js":94}],16:[function(require,module,exports){
const g = require( 'genish.js' ),
      filter = require( './filter.js' )

module.exports = function( Gibberish ) {
  Gibberish.genish.svf = ( input, cutoff, Q, mode, isStereo ) => {
    let d1 = g.data([0,0], 1, { meta:true }), d2 = g.data([0,0], 1, { meta:true }),
        peekProps = { mode:'simple', interp:'none' }

    let f1 = g.memo( g.mul( 2 * Math.PI, g.div( cutoff, g.gen.samplerate ) ) )
    let oneOverQ = g.memo( g.div( 1, Q ) )
    let l = g.memo( g.add( d2[0], g.mul( f1, d1[0] ) ) ),
        h = g.memo( g.sub( g.sub( isStereo ? input[0] : input, l ), g.mul( Q, d1[0] ) ) ),
        b = g.memo( g.add( g.mul( f1, h ), d1[0] ) ),
        n = g.memo( g.add( h, l ) )

    d1[0] = b
    d2[0] = l

    let out = g.selector( mode, l, h, b, n )

    let returnValue
    if( isStereo ) {
      let d12 = g.data([0,0], 1, { meta:true }), d22 = g.data([0,0], 1, { meta:true })
      let l2 = g.memo( g.add( d22[0], g.mul( f1, d12[0] ) ) ),
          h2 = g.memo( g.sub( g.sub( input[1], l2 ), g.mul( Q, d12[0] ) ) ),
          b2 = g.memo( g.add( g.mul( f1, h2 ), d12[0] ) ),
          n2 = g.memo( g.add( h2, l2 ) )

      d12[0] = b2
      d22[0] = l2

      let out2 = g.selector( mode, l2, h2, b2, n2 )

      returnValue = [ out, out2 ]
    }else{
      returnValue = out
    }

    return returnValue
  }

  let SVF = inputProps => {
    const svf = Object.create( filter )
    const props = Object.assign( {}, SVF.defaults, inputProps ) 

    const isStereo = props.input.isStereo
    
    // XXX NEEDS REFACTORING
    Gibberish.factory( 
      svf,
      Gibberish.genish.svf( g.in('input'), g.mul( g.in('cutoff'), g.gen.samplerate / 5 ), g.sub( 1, g.in('Q') ), g.in('mode'), isStereo ), 
      'svf', 
      props
    )

    return svf
  }


  SVF.defaults = {
    input:0,
    Q: .75,
    cutoff:.35,
    mode:0
  }

  return SVF

}


},{"./filter.js":12,"genish.js":94}],17:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let BitCrusher = inputProps => {
  let props = Object.assign( { bitCrusherLength: 44100 }, BitCrusher.defaults, inputProps ),
      bitCrusher = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      bitDepth = g.in( 'bitDepth' ),
      sampleRate = g.in( 'sampleRate' ),
      leftInput = isStereo ? input[ 0 ] : input,
      rightInput = isStereo ? input[ 1 ] : null
  
  let storeL = g.history(0)
  let sampleReduxCounter = g.counter( sampleRate, 0, 1 )

  let bitMult = g.pow( g.mul( bitDepth, 16 ), 2 )
  let crushedL = g.div( g.floor( g.mul( leftInput, bitMult ) ), bitMult )

  let outL = g.switch(
    sampleReduxCounter.wrap,
    crushedL,
    storeL.out
  )

  if( isStereo ) {
    let storeR = g.history(0)
    let crushedR = g.div( g.floor( g.mul( rightInput, bitMult ) ), bitMult )

    let outR = ternary( 
      sampleReduxCounter.wrap,
      crushedR,
      storeL.out
    )

    Gibberish.factory( 
      bitCrusher,
      [ outL, outR ], 
      'bitCrusher', 
      props 
    )
  }else{
    Gibberish.factory( bitCrusher, outL, 'bitCrusher', props )
  }
  
  return bitCrusher
}

BitCrusher.defaults = {
  input:0,
  bitDepth:.5,
  sampleRate: .5
}

return BitCrusher

}

},{"./effect.js":21,"genish.js":94}],18:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
  let proto = Object.create( effect )

  let Shuffler = inputProps => {
    let bufferShuffler = Object.create( proto ),
        bufferSize = 88200

    let props = Object.assign( {}, Shuffler.defaults, inputProps )

    let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : false
    let phase = g.accum( 1,0,{ shouldWrap: false })

    let input = g.in( 'input' ),
        leftInput = isStereo ? input[ 0 ] : input,
        rightInput = isStereo ? input[ 1 ] : null,
        rateOfShuffling = g.in( 'rate' ),
        chanceOfShuffling = g.in( 'chance' ),
        reverseChance = g.in( 'reverseChance' ),
        repitchChance = g.in( 'repitchChance' ),
        repitchMin = g.in( 'repitchMin' ),
        repitchMax = g.in( 'repitchMax' )

    let pitchMemory = g.history(1)

    let shouldShuffleCheck = g.eq( g.mod( phase, rateOfShuffling ), 0 )
    let isShuffling = g.memo( g.sah( g.lt( g.noise(), chanceOfShuffling ), shouldShuffleCheck, 0 ) ) 

    // if we are shuffling and on a repeat boundary...
    let shuffleChanged = g.memo( g.and( shouldShuffleCheck, isShuffling ) )
    let shouldReverse = g.lt( g.noise(), reverseChance ),
        reverseMod = g.switch( shouldReverse, -1, 1 )

    let pitch = g.ifelse( 
      g.and( shuffleChanged, g.lt( g.noise(), repitchChance ) ),
      g.memo( g.mul( g.add( repitchMin, g.mul( g.sub( repitchMax, repitchMin ), g.noise() ) ), reverseMod ) ),
      reverseMod
    )
    
    // only switch pitches on repeat boundaries
    pitchMemory.in( g.switch( shuffleChanged, pitch, pitchMemory.out ) )

    let fadeLength = g.memo( g.div( rateOfShuffling, 100 ) ),
        fadeIncr = g.memo( g.div( 1, fadeLength ) )

    let bufferL = g.data( bufferSize ), bufferR = isStereo ? g.data( bufferSize ) : null
    let readPhase = g.accum( pitchMemory.out, 0, { shouldWrap:false }) 
    let stutter = g.wrap( g.sub( g.mod( readPhase, bufferSize ), 22050 ), 0, bufferSize )

    let normalSample = g.peek( bufferL, g.accum( 1, 0, { max:88200 }), { mode:'simple' })

    let stutterSamplePhase = g.switch( isShuffling, stutter, g.mod( readPhase, bufferSize ) )
    let stutterSample = g.memo( g.peek( 
      bufferL, 
      stutterSamplePhase,
      { mode:'samples' }
    ) )
    
    let stutterShouldFadeIn = g.and( shuffleChanged, isShuffling )
    let stutterPhase = g.accum( 1, shuffleChanged, { shouldWrap: false })

    let fadeInAmount = g.memo( g.div( stutterPhase, fadeLength ) )
    let fadeOutAmount = g.div( g.sub( rateOfShuffling, stutterPhase ), g.sub( rateOfShuffling, fadeLength ) )
    
    let fadedStutter = g.ifelse(
      g.lt( stutterPhase, fadeLength ),
      g.memo( g.mul( g.switch( g.lt( fadeInAmount, 1 ), fadeInAmount, 1 ), stutterSample ) ),
      g.gt( stutterPhase, g.sub( rateOfShuffling, fadeLength ) ),
      g.memo( g.mul( g.gtp( fadeOutAmount, 0 ), stutterSample ) ),
      stutterSample
    )
    
    let outputL = g.mix( normalSample, fadedStutter, isShuffling ) 

    let pokeL = g.poke( bufferL, leftInput, g.mod( g.add( phase, 44100 ), 88200 ) )

    let panner = g.pan( outputL, outputL, g.in( 'pan' ) )
    
    Gibberish.factory( 
      bufferShuffler,
      [panner.left, panner.right],
      'shuffler', 
      props 
    ) 

    return bufferShuffler
  }
  
  Shuffler.defaults = {
    input:0,
    rate:22050,
    chance:.25,
    reverseChance:.5,
    repitchChance:.5,
    repitchMin:.5,
    repitchMax:2,
    pan:.5,
    mix:.5
  }

  return Shuffler 
}

},{"./effect.js":21,"genish.js":94}],19:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Chorus = inputProps => {
  const props = Object.assign({}, Chorus.defaults, inputProps )
  
  const chorus = Object.create( Gibberish.prototypes.ugen )

  const input = g.in('input'),
        freq1 = g.in('slowFrequency'),
        freq2 = g.in('fastFrequency'),
        amp1  = g.in('slowGain'),
        amp2  = g.in('fastGain')

  const isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : true 

  const leftInput = isStereo ? input[0] : input

  const win0   = g.env( 'inversewelch', 1024 ),
        win120 = g.env( 'inversewelch', 1024, 0, .333 ),
        win240 = g.env( 'inversewelch', 1024, 0, .666 )
  
  const slowPhasor = g.phasor( freq1, 0, { min:0 }),
  		  slowPeek1  = g.mul( g.peek( win0,   slowPhasor ), amp1 ),
        slowPeek2  = g.mul( g.peek( win120, slowPhasor ), amp1 ),
        slowPeek3  = g.mul( g.peek( win240, slowPhasor ), amp1 )
  
  const fastPhasor = g.phasor( freq2, 0, { min:0 }),
  	  	fastPeek1  = g.mul( g.peek( win0,   fastPhasor ), amp2 ),
        fastPeek2  = g.mul( g.peek( win120, fastPhasor ), amp2 ),
        fastPeek3  = g.mul( g.peek( win240, fastPhasor ), amp2 )

  const ms = Gibberish.ctx.sampleRate / 1000 
  const maxDelayTime = 100 * ms

  const time1 =  g.mul( g.add( slowPeek1, fastPeek1, 5 ), ms ),
        time2 =  g.mul( g.add( slowPeek2, fastPeek2, 5 ), ms ),
        time3 =  g.mul( g.add( slowPeek3, fastPeek3, 5 ), ms )

  const delay1L = g.delay( leftInput, time1, { size:maxDelayTime }),
        delay2L = g.delay( leftInput, time2, { size:maxDelayTime }),
        delay3L = g.delay( leftInput, time3, { size:maxDelayTime })

  
  const leftOutput = g.add( delay1L, delay2L, delay3L )
  if( isStereo ) {
    const rightInput = input[1]
    const delay1R = g.delay(rightInput, time1, { size:maxDelayTime }),
          delay2R = g.delay(rightInput, time2, { size:maxDelayTime }),
          delay3R = g.delay(rightInput, time3, { size:maxDelayTime })

    // flip a couple delay lines for stereo effect?
    const rightOutput = g.div( g.add( delay1R, delay2R, delay3R ), 3 )
    chorus.graph = [ leftOutput, rightOutput ]
  }else{
    chorus.graph = leftOutput
  }
  
  Gibberish.factory( chorus, chorus.graph, 'chorus', props )

  return chorus
}

Chorus.defaults = {
  input:0,
  slowFrequency: .18,
  slowGain:1,
  fastFrequency:6,
  fastGain:.2
}

return Chorus

}

},{"./effect.js":21,"genish.js":94}],20:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Delay = inputProps => {
  let props = Object.assign( { delayLength: 44100 }, Delay.defaults, inputProps ),
      delay = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      delayTime = g.in( 'delayTime' ),
      leftInput = isStereo ? input[ 0 ] : input,
      rightInput = isStereo ? input[ 1 ] : null
    
  let feedback = g.in( 'feedback' )

  // left channel
  let feedbackHistoryL = g.history()
  let echoL = g.delay( g.add( leftInput, g.mul( feedbackHistoryL.out, feedback ) ), delayTime, { size:props.delayLength })
  feedbackHistoryL.in( echoL )

  if( isStereo ) {
    // right channel
    let feedbackHistoryR = g.history()
    let echoR = g.delay( g.add( rightInput, g.mul( feedbackHistoryR.out, feedback ) ), delayTime, { size:props.delayLength })
    feedbackHistoryR.in( echoR )

    Gibberish.factory( 
      delay,
      [ echoL, echoR ], 
      'delay', 
      props 
    )
  }else{
    Gibberish.factory( delay, echoL, 'delay', props )
  }
  
  return delay
}

Delay.defaults = {
  input:0,
  feedback:.925,
  delayTime: 11025
}

return Delay

}

},{"./effect.js":21,"genish.js":94}],21:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let effect = Object.create( ugen )

Object.assign( effect, {

})

module.exports = effect

},{"../ugen.js":55}],22:[function(require,module,exports){
module.exports = function( Gibberish ) {

  const effects = {
    Freeverb    : require( './freeverb.js'  )( Gibberish ),
    Flanger     : require( './flanger.js'   )( Gibberish ),
    Vibrato     : require( './vibrato.js'   )( Gibberish ),
    Delay       : require( './delay.js'     )( Gibberish ),
    BitCrusher  : require( './bitCrusher.js')( Gibberish ),
    RingMod     : require( './ringMod.js'   )( Gibberish ),
    Tremolo     : require( './tremolo.js'   )( Gibberish ),
    Chorus      : require( './chorus.js'    )( Gibberish ),
    Shuffler    : require( './bufferShuffler.js'  )( Gibberish )
  }

  effects.export = target => {
    for( let key in effects ) {
      if( key !== 'export' ) {
        target[ key ] = effects[ key ]
      }
    }
  }

return effects

}

},{"./bitCrusher.js":17,"./bufferShuffler.js":18,"./chorus.js":19,"./delay.js":20,"./flanger.js":23,"./freeverb.js":24,"./ringMod.js":25,"./tremolo.js":26,"./vibrato.js":27}],23:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Flanger = inputProps => {
  let props   = Object.assign( { delayLength:44100 }, Flanger.defaults, inputProps ),
      flanger = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      delayLength = props.delayLength,
      feedbackCoeff = g.in( 'feedback' ),
      modAmount = g.in( 'offset' ),
      frequency = g.in( 'frequency' ),
      delayBufferL = g.data( delayLength ),
      delayBufferR

  let writeIdx = g.accum( 1,0, { min:0, max:delayLength, interp:'none', mode:'samples' })
  
  let offset = g.mul( modAmount, 500 )

  let mod = props.mod === undefined ? g.cycle( frequency ) : props.mod
  
  let readIdx = g.wrap( 
    g.add( 
      g.sub( writeIdx, offset ), 
      mod//g.mul( mod, g.sub( offset, 1 ) ) 
    ), 
	  0, 
    delayLength
  )

  let leftInput = isStereo ? input[0] : input

  let delayedOutL = g.peek( delayBufferL, readIdx, { interp:'linear', mode:'samples' })
  
  g.poke( delayBufferL, g.add( leftInput, g.mul( delayedOutL, feedbackCoeff ) ), writeIdx )

  let left = g.add( leftInput, delayedOutL ),
      right

  if( isStereo === true ) {
    rightInput = input[1]
    delayBufferR = g.data( delayLength )
    
    let delayedOutR = g.peek( delayBufferR, readIdx, { interp:'linear', mode:'samples' })

    g.poke( delayBufferR, g.add( rightInput, g.mul( delayedOutR, feedbackCoeff ) ), writeIdx )
    right = g.add( rightInput, delayedOutR )

    Gibberish.factory( 
      flanger,
      [ left, right ], 
      'flanger', 
      props 
    )

  }else{
    Gibberish.factory( flanger, left, 'flanger', props )
  }
  
  return flanger
}

Flanger.defaults = {
  input:0,
  feedback:.01,
  offset:.25,
  frequency:.5
}

return Flanger

}

},{"./effect.js":21,"genish.js":94}],24:[function(require,module,exports){
const g = require( 'genish.js' ),
      effect = require( './effect.js' )

module.exports = function( Gibberish ) {
  
const allPass = Gibberish.filters.genish.AllPass
const combFilter = Gibberish.filters.genish.Comb

const tuning = {
  combCount:	  	8,
  combTuning: 		[ 1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617 ],                    
  allPassCount: 	4,
  allPassTuning:	[ 225, 556, 441, 341 ],
  allPassFeedback:0.5,
  fixedGain: 		  0.015,
  scaleDamping: 	0.4,
  scaleRoom: 		  0.28,
  offsetRoom: 	  0.7,
  stereoSpread:   23
}

const Freeverb = inputProps => {
  let props = Object.assign( {}, Freeverb.defaults, inputProps ),
      reverb = Object.create( effect ) 
   
  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let combsL = [], combsR = []

  let input = g.in( 'input' ),
      wet1 = g.in( 'wet1'), wet2 = g.in( 'wet2' ),  dry = g.in( 'dry' ), 
      roomSize = g.in( 'roomSize' ), damping = g.in( 'damping' )
  
  let summedInput = isStereo === true ? g.add( input[0], input[1] ) : input,
      attenuatedInput = g.memo( g.mul( summedInput, tuning.fixedGain ) )
  
  // create comb filters in parallel...
  for( let i = 0; i < 8; i++ ) { 
    combsL.push( 
      combFilter( attenuatedInput, tuning.combTuning[i], g.mul(damping,.4), g.mul( tuning.scaleRoom + tuning.offsetRoom, roomSize ) ) 
    )
    combsR.push( 
      combFilter( attenuatedInput, tuning.combTuning[i] + tuning.stereoSpread, g.mul(damping,.4), g.mul( tuning.scaleRoom + tuning.offsetRoom, roomSize ) ) 
    )
  }
  
  // ... and sum them with attenuated input
  let outL = g.add( attenuatedInput, ...combsL )
  let outR = g.add( attenuatedInput, ...combsR )
  
  // run through allpass filters in series
  for( let i = 0; i < 4; i++ ) { 
    outL = allPass( outL, tuning.allPassTuning[ i ] + tuning.stereoSpread )
    outR = allPass( outR, tuning.allPassTuning[ i ] + tuning.stereoSpread )
  }
  
  let outputL = g.add( g.mul( outL, wet1 ), g.mul( outR, wet2 ), g.mul( isStereo === true ? input[0] : input, dry ) ),
      outputR = g.add( g.mul( outR, wet1 ), g.mul( outL, wet2 ), g.mul( isStereo === true ? input[1] : input, dry ) )

  Gibberish.factory( reverb, [ outputL, outputR ], 'freeverb', props )

  return reverb
}


Freeverb.defaults = {
  input:0,
  wet1: 1,
  wet2: 0,
  dry: .5,
  roomSize: .84,
  damping:  .5
}

return Freeverb 

}


},{"./effect.js":21,"genish.js":94}],25:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let RingMod = inputProps => {
  let props   = Object.assign( {}, RingMod.defaults, inputProps ),
      ringMod = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      frequency = g.in( 'frequency' ),
      gain = g.in( 'gain' ),
      mix = g.in( 'mix' )
  
  let leftInput = isStereo ? input[0] : input,
      sine = g.mul( g.cycle( frequency ), gain )
 
  let left = g.add( g.mul( leftInput, g.sub( 1, mix )), g.mul( g.mul( leftInput, sine ), mix ) ), 
      right

  if( isStereo === true ) {
    let rightInput = input[1]
    right = g.add( g.mul( rightInput, g.sub( 1, mix )), g.mul( g.mul( rightInput, sine ), mix ) ) 
    
    Gibberish.factory( 
      ringMod,
      [ left, right ], 
      'ringMod', 
      props 
    )
  }else{
    Gibberish.factory( ringMod, left, 'ringMod', props )
  }
  
  return ringMod
}

RingMod.defaults = {
  input:0,
  frequency:220,
  gain: 1, 
  mix:1
}

return RingMod

}

},{"./effect.js":21,"genish.js":94}],26:[function(require,module,exports){
const g = require( 'genish.js' ),
      effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
const Tremolo = inputProps => {
  const props   = Object.assign( {}, Tremolo.defaults, inputProps ),
        tremolo = Object.create( effect )

  const isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  const input = g.in( 'input' ),
        frequency = g.in( 'frequency' ),
        amount = g.in( 'amount' )
  
  const leftInput = isStereo ? input[0] : input

  let osc
  if( props.shape === 'square' ) {
    osc = g.gt( g.phasor( frequency ), 0 )
  }else if( props.shape === 'saw' ) {
    osc = g.gtp( g.phasor( frequency ), 0 )
  }else{
    osc = g.cycle( frequency )
  }

  const mod = g.mul( osc, amount )
 
  let left = g.sub( leftInput, g.mul( leftInput, mod ) ), 
      right

  if( isStereo === true ) {
    let rightInput = input[1]
    right = g.mul( rightInput, mod )

    Gibberish.factory( 
      tremolo,
      [ left, right ], 
      'tremolo', 
      props 
    )
  }else{
    Gibberish.factory( tremolo, left, 'tremolo', props )
  }
  
  return tremolo
}

Tremolo.defaults = {
  input:0,
  frequency:2,
  amount: 1, 
  shape:'sine'
}

return Tremolo

}

},{"./effect.js":21,"genish.js":94}],27:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Vibrato = inputProps => {
  let props   = Object.assign( {}, Vibrato.defaults, inputProps ),
      vibrato = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true 
  
  let input = g.in( 'input' ),
      delayLength = 44100,
      feedbackCoeff = .01,//g.in( 'feedback' ),
      modAmount = g.in( 'amount' ),
      frequency = g.in( 'frequency' ),
      delayBufferL = g.data( delayLength ),
      delayBufferR

  let writeIdx = g.accum( 1,0, { min:0, max:delayLength, interp:'none', mode:'samples' })
  
  let offset = g.mul( modAmount, 500 )
  
  let readIdx = g.wrap( 
    g.add( 
      g.sub( writeIdx, offset ), 
      g.mul( g.cycle( frequency ), g.sub( offset, 1 ) ) 
    ), 
	  0, 
    delayLength
  )

  let leftInput = isStereo ? input[0] : input

  let delayedOutL = g.peek( delayBufferL, readIdx, { interp:'linear', mode:'samples' })
  
  g.poke( delayBufferL, g.add( leftInput, g.mul( delayedOutL, feedbackCoeff ) ), writeIdx )

  let left = delayedOutL,
      right

  if( isStereo === true ) {
    rightInput = input[1]
    delayBufferR = g.data( delayLength )
    
    let delayedOutR = g.peek( delayBufferR, readIdx, { interp:'linear', mode:'samples' })

    g.poke( delayBufferR, g.add( rightInput, mul( delayedOutR, feedbackCoeff ) ), writeIdx )
    right = delayedOutR

    Gibberish.factory( 
      vibrato,
      [ left, right ], 
      'vibrato', 
      props 
    )
  }else{
    Gibberish.factory( vibrato, left, 'vibrato', props )
  }
  
  return vibrato
}

Vibrato.defaults = {
  input:0,
  //feedback:.01,
  amount:.5,
  frequency:4
}

return Vibrato

}

},{"./effect.js":21,"genish.js":94}],28:[function(require,module,exports){
let MemoryHelper = require( 'memory-helper' ),
    genish       = require( 'genish.js' )
    
let Gibberish = {
  blockCallbacks: [], // called every block
  dirtyUgens: [],
  callbackUgens: [],
  callbackNames: [],
  analyzers: [],
  graphIsDirty: false,
  ugens: {},
  debug: false,

  output: null,

  memory : null, // 20 minutes by default?
  factory: null, 
  genish,
  scheduler: require( './scheduling/scheduler.js' ),

  memoed: {},

  prototypes: {
    ugen: require('./ugen.js'),
    instrument: require( './instruments/instrument.js' ),
    effect: require( './fx/effect.js' ),
  },

  mixins: {
    polyinstrument: require( './instruments/polyMixin.js' )
  },

  init( memAmount ) {
    let numBytes = memAmount === undefined ? 20 * 60 * 44100 : memAmount

    this.memory = MemoryHelper.create( numBytes )

    this.load()
    
    this.output = this.Bus2()

    this.utilities.createContext()
    this.utilities.createScriptProcessor()

    this.analyzers.dirty = false

    // XXX FOR DEVELOPMENT AND TESTING ONLY... REMOVE FOR PRODUCTION
    this.export( window )
  },

  load() {
    this.factory = require( './ugenTemplate.js' )( this )

    this.PolyTemplate = require( './instruments/polytemplate.js' )( this )
    this.oscillators  = require( './oscillators/oscillators.js' )( this )
    this.filters      = require( './filters/filters.js' )( this )
    this.binops       = require( './misc/binops.js' )( this )
    this.monops       = require( './misc/monops.js' )( this )
    this.Bus          = require( './misc/bus.js' )( this )
    this.Bus2         = require( './misc/bus2.js' )( this );
    this.instruments  = require( './instruments/instruments.js' )( this )
    this.fx           = require( './fx/effects.js' )( this )
    this.Sequencer    = require( './scheduling/sequencer.js' )( this );
    this.Sequencer2   = require( './scheduling/seq2.js' )( this );
    this.envelopes    = require( './envelopes/envelopes.js' )( this );
    this.ssd          = require( './analysis/singlesampledelay.js' )( this );
  },

  export( target, shouldExportGenish=false ) {
    if( target === undefined ) throw Error('You must define a target object for Gibberish to export variables to.')

    if( shouldExportGenish ) this.genish.export( target )

    this.instruments.export( target )
    this.fx.export( target )
    this.filters.export( target )
    this.oscillators.export( target )
    this.binops.export( target )
    this.monops.export( target )
    this.envelopes.export( target )
    target.Sequencer = this.Sequencer
    target.Sequencer2 = this.Sequencer2
    target.Bus = this.Bus
    target.Bus2 = this.Bus2
    target.Scheduler = this.scheduler
    target.SSD = this.ssd
  },

  print() {
    console.log( this.callback.toString() )
  },

  dirty( ugen ) {
    if( ugen === this.analyzers ) {
      this.graphIsDirty = true
      this.analyzers.dirty = true
    } else {
      this.dirtyUgens.push( ugen )
      this.graphIsDirty = true
      if( this.memoed[ ugen.ugenName ] ) {
        delete this.memoed[ ugen.ugenName ]
      }
    } 
  },

  clear() {
    this.output.inputs = [0]
    this.output.inputNames.length = 0
    this.analyzers.length = 0
    this.scheduler.clear()
    this.dirty( this.output )
  },

  generateCallback() {
    let uid = 0,
        callbackBody, lastLine, analysis=''

    this.memoed = {}

    callbackBody = this.processGraph( this.output )
    lastLine = callbackBody[ callbackBody.length - 1]
    callbackBody.unshift( "\t'use strict';" )

    this.analyzers.forEach( v=> {
      const analysisBlock = Gibberish.processUgen( v )
      const analysisLine = analysisBlock.pop()

      analysisBlock.forEach( v=> {
        callbackBody.splice( callbackBody.length - 1, 0, v )
      })

      callbackBody.push( analysisLine )
    })

    this.analyzers.forEach( v => {
      if( this.callbackUgens.indexOf( v.callback ) === -1 )
        this.callbackUgens.push( v.callback )
    })
    this.callbackNames = this.callbackUgens.map( v => v.ugenName )

    callbackBody.push( '\n\treturn ' + lastLine.split( '=' )[0].split( ' ' )[1] )

    if( this.debug ) console.log( 'callback:\n', callbackBody.join('\n') )
    this.callbackNames.push( 'memory' )
    this.callbackUgens.push( this.memory.heap )
    this.callback = Function( ...this.callbackNames, callbackBody.join( '\n' ) )
    this.callback.out = []

    if( this.oncallback ) this.oncallback( this.callback )

    return this.callback 
  },

  processGraph( output ) {
    this.callbackUgens.length = 0
    this.callbackNames.length = 0

    this.callbackUgens.push( output.callback )

    let body = this.processUgen( output )
    

    this.dirtyUgens.length = 0
    this.graphIsDirty = false

    return body
  },

  processUgen( ugen, block ) {
    if( block === undefined ) block = []

    let dirtyIdx = Gibberish.dirtyUgens.indexOf( ugen )

    //console.log( 'ugenName:', ugen.ugenName )
    let memo = Gibberish.memoed[ ugen.ugenName ]

    if( memo !== undefined ) {
      return memo 
    } else if( ugen.block === undefined || dirtyIndex !== -1 ) {
  
      let line = `\tvar v_${ugen.id} = ` 
      
      if( !ugen.binop ) line += `${ugen.ugenName}( `

      // must get array so we can keep track of length for comma insertion
      let keys,err
      
      //try {
      keys = ugen.binop || ugen.type === 'bus' || ugen.type === 'analysis' ? Object.keys( ugen.inputs ) : Object.keys( ugen.inputNames )

      //}catch( e ){

      //  console.log( e )
      //  err = true
      //}
      
      //if( err === true ) return

      for( let i = 0; i < keys.length; i++ ) {
        let key = keys[ i ]
        // binop.inputs is actual values, not just property names
        let input 
        if( ugen.binop || ugen.type ==='bus' ) {
          input = ugen.inputs[ key ]
        }else{
          //if( key === 'memory' ) continue;
  
          input = ugen[ ugen.inputNames[ key ] ]
        }

        if( input !== undefined ) { 
          if( typeof input === 'number' ) {
            line += input
          }else{
            //console.log( 'key:', key, 'input:', ugen.inputs, ugen.inputs[ key ] ) 

            Gibberish.processUgen( input, block )

            //if( input.callback === undefined ) continue

            if( !input.binop ) {
              // check is needed so that graphs with ssds that refer to themselves
              // don't add the ssd in more than once
              if( Gibberish.callbackUgens.indexOf( input.callback ) === -1 ) {
                Gibberish.callbackUgens.push( input.callback )
              }
            }

            line += `v_${input.id}`
          }

          if( i < keys.length - 1 ) {
            line += ugen.binop ? ' ' + ugen.op + ' ' : ', ' 
          }
        }
      }
      
      //if( ugen.type === 'bus' ) line += ', ' 
      if( !ugen.binop && ugen.type !== 'bus' && ugen.type !== 'seq' ) line += 'memory'
      line += ugen.binop ? '' : ' )'

      block.push( line )
      
      //console.log( 'memo:', ugen.ugenName )
      Gibberish.memoed[ ugen.ugenName ] = `v_${ugen.id}`

      if( dirtyIdx !== -1 ) {
        Gibberish.dirtyUgens.splice( dirtyIdx, 1 )
      }

    }else if( ugen.block ) {
      return ugen.block
    }

    return block
  },
    
}

Gibberish.utilities = require( './utilities.js' )( Gibberish )


module.exports = Gibberish

},{"./analysis/singlesampledelay.js":2,"./envelopes/envelopes.js":5,"./filters/filters.js":14,"./fx/effect.js":21,"./fx/effects.js":22,"./instruments/instrument.js":33,"./instruments/instruments.js":34,"./instruments/polyMixin.js":38,"./instruments/polytemplate.js":39,"./misc/binops.js":43,"./misc/bus.js":44,"./misc/bus2.js":45,"./misc/monops.js":46,"./oscillators/oscillators.js":49,"./scheduling/scheduler.js":52,"./scheduling/seq2.js":53,"./scheduling/sequencer.js":54,"./ugen.js":55,"./ugenTemplate.js":56,"./utilities.js":57,"genish.js":94,"memory-helper":131}],29:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Conga = argumentProps => {
    let conga = Object.create( instrument ),
        frequency = g.in( 'frequency' ),
        decay = g.in( 'decay' ),
        gain  = g.in( 'gain' )

    let props = Object.assign( {}, Conga.defaults, argumentProps )

    let trigger = g.bang(),
        impulse = g.mul( trigger, 60 ),
        _decay =  g.sub( .101, g.div( decay, 10 ) ), // create range of .001 - .099
        bpf = g.svf( impulse, frequency, _decay, 2, false ),
        out = g.mul( bpf, gain )
    
    Gibberish.factory( conga, out, 'conga', props  )
    
    conga.env = trigger

    return conga
  }
  
  Conga.defaults = {
    gain: .25,
    frequency:190,
    decay: .85
  }

  return Conga

}

},{"./instrument.js":33,"genish.js":94}],30:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const Cowbell = argumentProps => {
    const cowbell = Object.create( instrument ),
          decay   = g.in( 'decay' ),
          gain    = g.in( 'gain' )

    const props = Object.assign( {}, Cowbell.defaults, argumentProps )

    const bpfCutoff = g.param( 'bpfc', 1000 ),
          s1 = Gibberish.oscillators.factory( 'square', 560 ),
          s2 = Gibberish.oscillators.factory( 'square', 845 ),
          eg = g.decay( g.mul( decay, g.gen.samplerate * 2 ) ), 
          bpf = g.svf( g.add( s1,s2 ), bpfCutoff, 3, 2, false ),
          envBpf = g.mul( bpf, eg ),
          out = g.mul( envBpf, gain )

    Gibberish.factory( cowbell, out, 'cowbell', props  )
    
    cowbell.env = eg 

    cowbell.isStereo = false

    return cowbell
  }
  
  Cowbell.defaults = {
    gain: 1,
    decay:.5
  }

  return Cowbell

}

},{"./instrument.js":33,"genish.js":94}],31:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let FM = inputProps => {
    let syn = Object.create( instrument )

    let env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        glide = g.in( 'glide' ),
        slidingFreq = g.slide( frequency, glide, glide ),
        cmRatio = g.in( 'cmRatio' ),
        index = g.in( 'index' )

    let props = Object.assign( syn, FM.defaults, inputProps )

    syn.__createGraph = function() {
      let modOsc = Gibberish.oscillators.factory( syn.modulatorWaveform, g.mul( slidingFreq, cmRatio ), syn.antialias )
      let modOscWithIndex = g.mul( modOsc, g.mul( slidingFreq, index ) )
      let modOscWithEnv   = g.mul( modOscWithIndex, env )

      let carrierOsc = Gibberish.oscillators.factory( syn.carrierWaveform, g.add( slidingFreq, modOscWithEnv ), syn.antialias )
      let carrierOscWithEnv = g.mul( carrierOsc, env )
      
      let cutoff = g.add( g.in('cutoff'), g.mul( g.in('filterMult'), env ) )
      const filteredOsc = Gibberish.filters.factory( carrierOscWithEnv, cutoff, g.in('Q'), g.in('saturation'), syn )

      let synthWithGain = g.mul( filteredOsc, g.in( 'gain' ) ),
          panner

      if( props.panVoices === true ) { 
        panner = g.pan( synthWithGain, synthWithGain, g.in( 'pan' ) ) 
        syn.graph = [panner.left, panner.right ]
      }else{
        syn.graph = synthWithGain
      }
    }
    
    syn.__requiresRecompilation = [ 'carrierWaveform', 'modulatorWaveform', 'antialias', 'filterType', 'filterMode' ]
    syn.__createGraph()

    Gibberish.factory( syn, syn.graph , 'fm', syn )

    syn.env = env

    return syn
  }

  FM.defaults = {
    carrierWaveform:'sine',
    modulatorWaveform:'sine',
    attack: 44100,
    decay: 44100,
    gain: 1,
    cmRatio:2,
    index:5,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    antialias:false,
    panVoices:false,
    glide:1,
    saturation:1,
    filterMult:440,
    Q:.25,
    cutoff:3520,
    filterType:0,
    filterMode:0,
    isLowPass:1
  }

  let PolyFM = Gibberish.PolyTemplate( FM, ['glide','frequency','attack','decay','pulsewidth','pan','gain','cmRatio','index', 'saturation', 'filterMult', 'Q', 'cutoff', 'antialias', 'filterType', 'carrierWaveform', 'modulatorWaveform','filterMode' ] ) 

  return [ FM, PolyFM ]

}

},{"./instrument.js":33,"genish.js":94}],32:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Hat = argumentProps => {
    let hat = Object.create( instrument ),
        tune  = g.in( 'tune' ),
        scaledTune = g.memo( g.add( .4, tune ) ),
        decay  = g.in( 'decay' ),
        gain  = g.in( 'gain' )

    let props = Object.assign( {}, Hat.defaults, argumentProps )

    let baseFreq = g.mul( 325, scaledTune ), // range of 162.5 - 487.5
        bpfCutoff = g.mul( g.param( 'bpfc', 7000 ), scaledTune ),
        hpfCutoff = g.mul( g.param( 'hpfc', 11000 ), scaledTune ),  
        s1 = Gibberish.oscillators.factory( 'square', baseFreq, false ),
        s2 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,1.4471 ) ),
        s3 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,1.6170 ) ),
        s4 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,1.9265 ) ),
        s5 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,2.5028 ) ),
        s6 = Gibberish.oscillators.factory( 'square', g.mul( baseFreq,2.6637 ) ),
        sum = g.add( s1,s2,s3,s4,s5,s6 ),
        eg = g.decay( g.mul( decay, g.gen.samplerate * 2 ) ), 
        bpf = g.svf( sum, bpfCutoff, .5, 2, false ),
        envBpf = g.mul( bpf, eg ),
        hpf = g.filter24( envBpf, 0, hpfCutoff, 0 ),
        out = g.mul( hpf, gain )

    Gibberish.factory( hat, out, 'hat', props  )
    
    hat.env = eg 

    hat.isStereo = false
    return hat
  }
  
  Hat.defaults = {
    gain:  1,
    tune: .6,
    decay:.1,
  }

  return Hat

}

},{"./instrument.js":33,"genish.js":94}],33:[function(require,module,exports){
let ugen = require( '../ugen.js' ),
    g = require( 'genish.js' )

let instrument = Object.create( ugen )

Object.assign( instrument, {
  note( freq ) {
    this.frequency = freq
    this.env.trigger()
  },

  trigger( _gain = 1 ) {
    this.gain = _gain
    this.env.trigger()
  },

})

module.exports = instrument

},{"../ugen.js":55,"genish.js":94}],34:[function(require,module,exports){
module.exports = function( Gibberish ) {

const instruments = {
  Kick        : require( './kick.js' )( Gibberish ),
  Conga       : require( './conga.js' )( Gibberish ),
  Clave       : require( './conga.js' )( Gibberish ), // clave is same as conga with different defaults, see below
  Hat         : require( './hat.js' )( Gibberish ),
  Snare       : require( './snare.js' )( Gibberish ),
  Cowbell     : require( './cowbell.js' )( Gibberish )
}

instruments.Clave.defaults.frequency = 2500
instruments.Clave.defaults.decay = .5;

[ instruments.Synth, instruments.PolySynth ]     = require( './synth.js' )( Gibberish );
[ instruments.Monosynth, instruments.PolyMono ]  = require( './monosynth.js' )( Gibberish );
[ instruments.FM, instruments.PolyFM ]           = require( './fm.js' )( Gibberish );
[ instruments.Sampler, instruments.PolySampler ] = require( './sampler.js' )( Gibberish );
[ instruments.Karplus, instruments.PolyKarplus ] = require( './karplusstrong.js' )( Gibberish );

instruments.export = target => {
  for( let key in instruments ) {
    if( key !== 'export' ) {
      target[ key ] = instruments[ key ]
    }
  }
}

return instruments

}

},{"./conga.js":29,"./cowbell.js":30,"./fm.js":31,"./hat.js":32,"./karplusstrong.js":35,"./kick.js":36,"./monosynth.js":37,"./sampler.js":40,"./snare.js":41,"./synth.js":42}],35:[function(require,module,exports){
const g = require( 'genish.js' ),
      instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const KPS = inputProps => {

    const props = Object.assign( {}, KPS.defaults, inputProps )
    const syn = Object.create( instrument ),
          trigger = g.bang(),
          phase = g.accum( 1, trigger, { max:Infinity } ),
          env = g.gtp( g.sub( 1, g.div( phase, 200 ) ), 0 ),
          impulse = g.mul( g.noise(), env ),
          feedback = g.history(),
          frequency = g.in('frequency'),
          glide = g.in( 'glide' ),
          slidingFrequency = g.slide( frequency, glide, glide ),
          delay = g.delay( g.add( impulse, feedback.out ), g.div( Gibberish.ctx.sampleRate, slidingFrequency ), { size:2048 }),
          decayed = g.mul( delay, g.t60( g.mul( g.in('decay'), slidingFrequency ) ) ),
          damped =  g.mix( decayed, feedback.out, g.in('damping') ),
          withGain = g.mul( damped, g.in('gain') )

    feedback.in( damped )

    const properties = Object.assign( {}, KPS.defaults, props )

    if( properties.panVoices ) {  
      const panner = g.pan( withGain, withGain, g.in( 'pan' ) )
      Gibberish.factory( syn, [panner.left, panner.right], 'karplus', props  )
    }else{
      Gibberish.factory( syn, withGain, 'karplus', props )
    }

    Object.assign( syn, {
      properties : props,

      env : trigger,
      phase,

      getPhase() {
        return Gibberish.memory.heap[ phase.memory.value.idx ]
      },
    })
    return syn
  }
  
  KPS.defaults = {
    decay: .97,
    damping:.2,
    gain: 1,
    frequency:220,
    pan: .5,
    glide:1,
    panVoices:false
  }

  let envCheckFactory = ( syn,synth ) => {
    let envCheck = ()=> {
      let phase = syn.getPhase(),
          endTime = synth.decay * Gibberish.ctx.sampleRate

      if( phase > endTime ) {
        synth.disconnectUgen( syn )
        syn.isConnected = false
        Gibberish.memory.heap[ syn.phase.memory.value.idx ] = 0 // trigger doesn't seem to reset for some reason
      }else{
        Gibberish.blockCallbacks.push( envCheck )
      }
    }
    return envCheck
  }

  let PolyKPS = Gibberish.PolyTemplate( KPS, ['frequency','decay','damping','pan','gain', 'glide'], envCheckFactory ) 

  return [ KPS, PolyKPS ]

}

},{"./instrument.js":33,"genish.js":94}],36:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Kick = inputProps => {
    // establish prototype chain
    let kick = Object.create( instrument )

    // define inputs
    let frequency = g.in( 'frequency' ),
        decay = g.in( 'decay' ),
        tone  = g.in( 'tone' ),
        gain  = g.in( 'gain' )
    
    // create initial property set
    let props = Object.assign( {}, Kick.defaults, inputProps )

    // create DSP graph
    let trigger = g.bang(),
        impulse = g.mul( trigger, 60 ),
        scaledDecay = g.sub( 1.005, decay ), // -> range { .005, 1.005 }
        scaledTone = g.add( 50, g.mul( tone, 4000 ) ), // -> range { 50, 4050 }
        bpf = g.svf( impulse, frequency, scaledDecay, 2, false ),
        lpf = g.svf( bpf, scaledTone, .5, 0, false ),
        graph = g.mul( lpf, gain )
    
    Gibberish.factory( kick, graph, 'kick', props  )

    kick.env = trigger

    return kick
  }
  
  Kick.defaults = {
    gain: 1,
    frequency:85,
    tone: .25,
    decay:.9
  }

  return Kick

}

},{"./instrument.js":33,"genish.js":94}],37:[function(require,module,exports){
const g = require( 'genish.js' ),
      instrument = require( './instrument.js' ),
      feedbackOsc = require( '../oscillators/fmfeedbackosc.js' )

module.exports = function( Gibberish ) {

  const Synth = argumentProps => {
    const syn = Object.create( instrument ),
          oscs = [], 
          env = g.ad( g.in( 'attack' ), g.in( 'decay' ), { shape:'linear' }),
          frequency = g.in( 'frequency' ),
          glide = g.in( 'glide' ),
          slidingFreq = g.memo( g.slide( frequency, glide, glide ) )

    let props = Object.assign( syn, Synth.defaults, argumentProps )

    syn.__createGraph = function() {
      for( let i = 0; i < 3; i++ ) {
        let osc, freq

        switch( i ) {
          case 1:
            freq = g.add( slidingFreq, g.mul( slidingFreq, g.in('detune2') ) )
            break;
          case 2:
            freq = g.add( slidingFreq, g.mul( slidingFreq, g.in('detune3') ) )
            break;
          default:
            freq = slidingFreq//frequency
        }

        osc = Gibberish.oscillators.factory( syn.waveform, freq, syn.antialias )
        
        oscs[ i ] = osc
      }

      let oscSum = g.add( ...oscs ),
          oscWithGain = g.mul( g.mul( oscSum, env ), g.in( 'gain' ) ),
          //cutoff = g.add( g.in('cutoff'), g.mul( g.in('filterMult'), env ) ),
          filteredOsc, panner

      const baseCutoffFreq = g.mul( g.in('cutoff'), frequency )
      let cutoff = g.mul( g.mul( baseCutoffFreq, g.pow( 2, g.in('filterMult') )), env )
      filteredOsc = Gibberish.filters.factory( oscWithGain, cutoff, g.in('Q'), g.in('saturation'), syn )
        
      if( props.panVoices ) {  
        panner = g.pan( filteredOsc,filteredOsc, g.in( 'pan' ) )
        syn.graph = [ panner.left, panner.right ]
      }else{
        syn.graph = filteredOsc
      }
    }

    syn.__requiresRecompilation = [ 'waveform', 'antialias', 'filterType', 'filterMode' ]
    syn.__createGraph()

    Gibberish.factory( syn, syn.graph, 'mono', props )

    syn.env = env

    return syn
  }
  
  Synth.defaults = {
    waveform: 'saw',
    attack: 44100,
    decay: 44100,
    gain: .25,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    detune2:.005,
    detune3:-.005,
    cutoff: 1,
    resonance:.25,
    Q: .5,
    panVoices:false,
    glide: 1,
    antialias:false,
    filterType: 2,
    filterMode: 0, // 0 = LP, 1 = HP, 2 = BP, 3 = Notch
    saturation:.5,
    filterMult: 4,
    isLowPass:true
  }

  let PolyMono = Gibberish.PolyTemplate( Synth, 
    ['frequency','attack','decay','cutoff','Q',
     'detune2','detune3','pulsewidth','pan','gain', 'glide', 'saturation', 'filterMult',  'antialias', 'filterType', 'waveform', 'filterMode']
  ) 

  return [ Synth, PolyMono ]
}

},{"../oscillators/fmfeedbackosc.js":48,"./instrument.js":33,"genish.js":94}],38:[function(require,module,exports){
module.exports = {
  note( freq ) {
    let voice = this.__getVoice__()
    Object.assign( voice, this.properties )
    voice.note( freq )
    this.__runVoice__( voice, this )
    this.triggerNote = freq
  },

  // XXX this is not particularly satisfying...
  // must check for both notes and chords
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

  __runVoice__( voice, _poly ) {
    if( !voice.isConnected ) {
      voice.connect( _poly, 1 )
      voice.isConnected = true
    }

    let envCheck
    if( _poly.envCheck === undefined ) {
      envCheck = function() {
        if( voice.env.isComplete() ) {
          _poly.disconnectUgen.call( _poly, voice )
          voice.isConnected = false
        }else{
          Gibberish.blockCallbacks.push( envCheck )
        }
      }
    }else{
      envCheck = poly.envCheck( voice, poly )
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

},{}],39:[function(require,module,exports){
/*
 * This files creates a factory generating polysynth constructors.
 */

const g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  const TemplateFactory = ( ugen, propertyList, _envCheck ) => {
    /* 
     * polysynths are basically busses that connect child synth voices.
     * We create separate prototypes for mono vs stereo instances.
     */

    const monoProto   = Object.create( Gibberish.Bus() ),
          stereoProto = Object.create( Gibberish.Bus2())

    // since there are two prototypes we can't assign directly to one of them...
    Object.assign( monoProto,   Gibberish.mixins.polyinstrument )
    Object.assign( stereoProto, Gibberish.mixins.polyinstrument )

    const Template = props => {
      const properties = Object.assign( {}, { isStereo:true }, props )

      const synth = properties.isStereo ? Object.create( stereoProto ) : Object.create( monoProto )

      Object.assign( synth, {
        voices: [],
        maxVoices: properties.maxVoices !== undefined ? properties.maxVoices : 16,
        voiceCount: 0,
        envCheck: _envCheck,
        id: Gibberish.factory.getUID(),
        dirty: true,
        type: 'bus',
        ugenName: 'poly' + ugen.name + '_' + synth.id,
        inputs: [],
        inputNames: [],
        properties
      })

      properties.panVoices = properties.isStereo
      synth.callback.ugenName = synth.ugenName

      for( let i = 0; i < synth.maxVoices; i++ ) {
        synth.voices[i] = ugen( properties )
        synth.voices[i].callback.ugenName = synth.voices[i].ugenName
        synth.voices[i].isConnected = false
      }

      let _propertyList 
      if( properties.isStereo === false ) {
        _propertyList = propertyList.slice( 0 )
        const idx =  _propertyList.indexOf( 'pan' )
        if( idx  > -1 ) _propertyList.splice( idx, 1 )
      }

      TemplateFactory.setupProperties( synth, ugen, properties.isStereo ? propertyList : _propertyList )

      return synth
    }

    return Template
  }

  TemplateFactory.setupProperties = function( synth, ugen, props ) {
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

},{"genish.js":94}],40:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {
  let proto = Object.create( instrument )

  Object.assign( proto, {
    note( rate ) {
      this.rate = rate
      if( rate > 0 ) {
        this.trigger()
      }else{
        this.__phase__.value = this.data.buffer.length - 1 
      }
    }
  })

  let Sampler = inputProps => {
    let syn = Object.create( proto )

    let props = Object.assign( { onload:null }, Sampler.defaults, inputProps )

    syn.isStereo = props.isStereo !== undefined ? props.isStereo : false

    let start = g.in( 'start' ), end = g.in( 'end' ), 
        rate = g.in( 'rate' ), shouldLoop = g.in( 'loops' )

    /* create dummy ugen until data for sampler is loaded...
     * this will be overridden by a call to Gibberish.factory on load */
    syn.callback = function() { return 0 }
    syn.id = Gibberish.factory.getUID()
    syn.ugenName = syn.callback.ugenName = 'sampler_' + syn.id
    syn.inputNames = []
    /* end dummy ugen */

    syn.__bang__ = g.bang()
    syn.trigger = syn.__bang__.trigger

    if( props.filename ) {
      syn.data = g.data( props.filename )

      syn.data.onload = () => {
        syn.__phase__ = g.counter( rate, start, end, syn.__bang__, shouldLoop, { shouldWrap:false })

        Gibberish.factory( 
          syn,
          g.mul( 
          g.ifelse( 
            g.and( g.gte( syn.__phase__, start ), g.lt( syn.__phase__, end ) ),
            g.peek( 
              syn.data, 
              syn.__phase__,
              { mode:'samples' }
            ),
            0
          ), g.in('gain') ),
          'sampler', 
          props 
        ) 

        if( syn.end === -999999999 ) syn.end = syn.data.buffer.length - 1

        if( syn.onload !== null ) { syn.onload() }

        Gibberish.dirty( syn )
      }
    }

    return syn
  }
  
  Sampler.defaults = {
    gain: 1,
    pan: .5,
    rate: 1,
    panVoices:false,
    loops: 0,
    start:0,
    end:-999999999
  }

  let PolySampler = Gibberish.PolyTemplate( Sampler, ['rate','pan','gain','start','end','loops'] ) 

  return [ Sampler, PolySampler ]
}

},{"./instrument.js":33,"genish.js":94}],41:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )
  
module.exports = function( Gibberish ) {

  let Snare = argumentProps => {
    let snare = Object.create( instrument ),
        decay = g.in( 'decay' ),
        scaledDecay = g.mul( decay, g.gen.samplerate * 2 ),
        snappy= g.in( 'snappy' ),
        tune  = g.in( 'tune' ),
        gain  = g.in( 'gain' )

    let props = Object.assign( {}, Snare.defaults, argumentProps )

    let eg = g.decay( scaledDecay, { initValue:0 } ), 
        check = g.memo( g.gt( eg, .0005 ) ),
        rnd = g.mul( g.noise(), eg ),
        hpf = g.svf( rnd, g.add( 1000, g.mul( g.add( 1, tune), 1000 ) ), .5, 1, false ),
        snap = g.gtp( g.mul( hpf, snappy ), 0 ), // rectify
        bpf1 = g.svf( eg, g.mul( 180, g.add( tune, 1 ) ), .05, 2, false ),
        bpf2 = g.svf( eg, g.mul( 330, g.add( tune, 1 ) ), .05, 2, false ),
        out  = g.memo( g.add( snap, bpf1, g.mul( bpf2, .8 ) ) ), //XXX why is memo needed?
        scaledOut = g.mul( out, gain )
    
    // XXX TODO : make this work with ifelse. the problem is that poke ugens put their
    // code at the bottom of the callback function, instead of at the end of the
    // associated if/else block.
    let ife = g.switch( check, scaledOut, 0 )
    //let ife = g.ifelse( g.gt( eg, .005 ), cycle(440), 0 )
    
    Gibberish.factory( snare, ife, 'snare', props  )
    
    snare.env = eg 

    return snare
  }
  
  Snare.defaults = {
    gain: 1,
    frequency:1000,
    tune:0,
    snappy: 1,
    decay:.1
  }

  return Snare

}

},{"./instrument.js":33,"genish.js":94}],42:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Synth = inputProps => {
    let syn = Object.create( instrument )

    let env = g.ad( g.in('attack'), g.in('decay'), { shape:'linear' }),
        frequency = g.in( 'frequency' ),
        loudness  = g.in( 'loudness' ), 
        glide = g.in( 'glide' ),
        slidingFreq = g.slide( frequency, glide, glide )

    let props = Object.assign( syn, Synth.defaults, inputProps )

    syn.__createGraph = function() {
      let osc = Gibberish.oscillators.factory( syn.waveform, slidingFreq, syn.antialias )

      let oscWithEnv = g.mul( g.mul( osc, env, loudness ) ),
          panner
  
      const baseCutoffFreq = g.mul( g.in('cutoff'), frequency )
      let cutoff = g.mul( g.mul( baseCutoffFreq, g.pow( 2, g.in('filterMult') )), env )
      const filteredOsc = Gibberish.filters.factory( oscWithEnv, cutoff, g.in('Q'), g.in('saturation'), props )

      let synthWithGain = g.mul( filteredOsc, g.in( 'gain' ) )
  
      if( syn.panVoices === true ) { 
        panner = g.pan( synthWithGain, synthWithGain, g.in( 'pan' ) ) 
        syn.graph = [panner.left, panner.right]
      }else{
        syn.graph = synthWithGain
      }
    }
    
    syn.__requiresRecompilation = [ 'waveform', 'antialias', 'filterType','filterMode' ]
    syn.__createGraph()

    Gibberish.factory( syn, syn.graph, 'synth', props  )

    syn.env = env

    return syn
  }
  
  Synth.defaults = {
    waveform:'saw',
    attack: 44100,
    decay: 44100,
    gain: 1,
    pulsewidth:.25,
    frequency:220,
    pan: .5,
    antialias:false,
    panVoices:false,
    loudness:1,
    glide:1,
    saturation:1,
    filterMult:2,
    Q:.25,
    cutoff:.5,
    filterType:0,
    filterMode:0,
    isLowPass:1
  }

  // do not include velocity, which shoudl always be per voice
  let PolySynth = Gibberish.PolyTemplate( Synth, ['frequency','attack','decay','pulsewidth','pan','gain','glide', 'saturation', 'filterMult', 'Q', 'cutoff', 'resonance', 'antialias', 'filterType', 'waveform', 'filterMode'] ) 

  return [ Synth, PolySynth ]

}

},{"./instrument.js":33,"genish.js":94}],43:[function(require,module,exports){
module.exports = function( Gibberish ) {

  let Binops = {
    export( obj ) {
      for( let key in Binops ) {
        if( key !== 'export' ) {
          obj[ key ] = Binops[ key ]
        }
      }
    },
    
    Add( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'+', inputs:args, ugenName:'add' + id, id }
    },

    Sub( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'-', inputs:args, ugenName:'sub' + id, id }
    },

    Mul( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'*', inputs:args, ugenName:'mul' + id, id }
    },

    Div( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'/', inputs:args, ugenName:'div' + id, id }
    },

    Mod( ...args ) {
      let id = Gibberish.factory.getUID()
      return { binop:true, op:'%', inputs:args, ugenName:'mod' + id, id }
    },   
  }

  return Binops
}

},{}],44:[function(require,module,exports){
let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  let Bus = { 
    factory: null,//Gibberish.factory( g.add( 0 ) , 'bus', [ 0, 1 ]  ),

    create() {
      let bus = Object.create( ugen )
      
      bus.callback = function() {
        let output = 0
       // output[ 0 ] = output[ 1 ] = 0

        for( let i = 0, length = arguments.length; i < length; i++ ) {
          output += arguments[ i ]
          //output[ 0 ] += input
          //output[ 1 ] += input
        }

        return output
      }

      bus.id = Gibberish.factory.getUID()
      bus.dirty = true
      bus.type = 'bus'
      bus.ugenName = 'bus_' + bus.id
      bus.inputs = []
      bus.inputNames = []

      bus.chain = ( target, level = 1 ) => {
        this.connect( target, level )
        return target
      }

      bus.disconnectUgen = ( ugen ) => {
        let removeIdx = -1
        for( let i = 0; i < this.inputs.length; i++ ) {
          let input = this.inputs[ i ]

          if( isNaN( input ) && ugen === input ) {
            removeIdx = i
            break;
          }
        }
        
        if( removeIdx !== -1 ) {
          this.inputs.splice( removeIdx, 1 )
          Gibberish.dirty( this )
        }
      }
      
      return bus
    }
  }

  return Bus.create

}


},{"../ugen.js":55,"genish.js":94}],45:[function(require,module,exports){
let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  let Bus2 = { 
    create() {
      let output = new Float32Array( 2 )

      let bus = Object.create( ugen )

      Object.assign( bus, {
        callback() {
          output[ 0 ] = output[ 1 ] = 0

          for( let i = 0, length = arguments.length; i < length; i++ ) {
            let input = arguments[ i ],
                isArray = input instanceof Float32Array

            output[ 0 ] += isArray ? input[ 0 ] : input
            output[ 1 ] += isArray ? input[ 1 ] : input
          }

          return output
        },
        id : Gibberish.factory.getUID(),
        dirty : true,
        type : 'bus',
        inputs : [],
        inputNames : [],
      })

      bus.ugenName = bus.callback.ugenName = 'bus2_' + bus.id

      bus.disconnectUgen = function( ugen ) {
        let removeIdx = this.inputs.indexOf( ugen )
        
        if( removeIdx !== -1 ) {
          this.inputs.splice( removeIdx, 1 )
          Gibberish.dirty( this )
        }
      }
      
      return bus
    }
  }

  return Bus2.create

}


},{"../ugen.js":55,"genish.js":94}],46:[function(require,module,exports){
const  g    = require( 'genish.js'  ),
       ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  const Monops = {
    export( obj ) {
      for( let key in Monops ) {
        if( key !== 'export' ) {
          obj[ key ] = Monops[ key ]
        }
      }
    },
    
    Abs( input ) {
      const abs = Object.create( ugen )
      const graph = g.abs( g.in('input') )
      
      Gibberish.factory( abs, graph, 'abs', Object.assign({}, Monops.defaults, { input }) )

      return abs
    },

    Pow( input, exponent ) {
      const pow = Object.create( ugen )
      const graph = g.pow( g.in('input'), g.in('exponent') )
      
      Gibberish.factory( pow, graph, 'abs', Object.assign({}, Monops.defaults, { input, exponent }) )

      return pow
    },

    Merge( input ) {
      const merger = Object.create( ugen )
      const cb = function( _input ) {
        return _input[0] + _input[1]
      }

      Gibberish.factory( merger, g.in( 'input' ), 'merge', { input }, cb )
      merger.type = 'analysis'
      merger.inputNames = [ 'input' ]
      merger.inputs = [ input ]
      merger.input = input
      
      return merger
    },
  }

  Monops.defaults = { input:0 }

  return Monops
}

},{"../ugen.js":55,"genish.js":94}],47:[function(require,module,exports){
const genish = require('genish.js'),
      ssd = genish.history,
      noise = genish.noise;

module.exports = function () {
  const last = ssd(0);

  const white = genish.sub(genish.mul(noise(), 2), 1);

  let out = genish.add(last.out, genish.div(genish.mul(.02, white), 1.02));

  last.in(out);

  out = genish.mul(out, 3.5);

  return out;
};

/*
for (var i = 0; i < bufferSize; i++) {
    var white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5; // (roughly) compensate for gain
}
*/
},{"genish.js":94}],48:[function(require,module,exports){
let g = require( 'genish.js' )

let feedbackOsc = function( frequency, filter, pulsewidth=.5, argumentProps ) {
  if( argumentProps === undefined ) argumentProps = { type: 0 }

  let lastSample = g.history(),
      // determine phase increment and memoize result
      w = g.memo( g.div( frequency, g.gen.samplerate ) ),
      // create scaling factor
      n = g.sub( -.5, w ),
      scaling = g.mul( g.mul( 13, filter ), g.pow( n, 5 ) ),
      // calculate dc offset and normalization factors
      DC = g.sub( .376, g.mul( w, .752 ) ),
      norm = g.sub( 1, g.mul( 2, w ) ),
      // determine phase
      osc1Phase = g.accum( w, 0, { min:-1 }),
      osc1, out

  // create current sample... from the paper:
  // osc = (osc + sin(2*pi*(phase + osc*scaling)))*0.5f;
  osc1 = g.memo( 
    g.mul(
      g.add(
        lastSample.out,
        g.sin(
          g.mul(
            Math.PI * 2,
            g.memo( g.add( osc1Phase, g.mul( lastSample.out, scaling ) ) )
          )
        )
      ),
      .5
    )
  )

  // store sample to use as modulation
  lastSample.in( osc1 )

  // if pwm / square waveform instead of sawtooth...
  if( argumentProps.type === 1 ) { 
    const lastSample2 = g.history() // for osc 2
    const lastSampleMaster = g.history() // for sum of osc1,osc2

    const osc2 = g.mul(
      g.add(
        lastSample2.out,
        g.sin(
          g.mul(
            Math.PI * 2,
            g.memo( g.add( osc1Phase, g.mul( lastSample2.out, scaling ), pulsewidth ) )
          )
        )
      ),
      .5
    )

    lastSample2.in( osc2 )
    out = g.memo( g.sub( lastSample.out, lastSample2.out ) )
    out = g.memo( g.add( g.mul( 2.5, out ), g.mul( -1.5, lastSampleMaster.out ) ) )
    
    lastSampleMaster.in( g.sub( osc1, osc2 ) )

  }else{
     // offset and normalize
    osc1 = g.add( g.mul( 2.5, osc1 ), g.mul( -1.5, lastSample.out ) )
    osc1 = g.add( osc1, DC )
 
    out = osc1
  }

  return g.mul( out, norm )
}

module.exports = feedbackOsc

},{"genish.js":94}],49:[function(require,module,exports){
const g = require( 'genish.js' ),
      ugen = require( '../ugen.js' ),
      feedbackOsc = require( './fmfeedbackosc.js' )

//  __makeOscillator__( type, frequency, antialias ) {
    
module.exports = function( Gibberish ) {
  let Oscillators = {
    export( obj ) {
      for( let key in Oscillators ) {
        if( key !== 'export' ) {
          obj[ key ] = Oscillators[ key ]
        }
      }
    },

    genish: {
      Brown: require( './brownnoise.js' ),
      Pink:  require( './pinknoise.js'  )
    },

    Wavetable: require( './wavetable.js' )( Gibberish ),
    
    Square( inputProps ) {
      const sqr   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false }, Oscillators.defaults, inputProps )
      const osc   = Oscillators.factory( 'square', g.in( 'frequency' ), props.antialias )
      const graph = g.mul( osc, g.in('gain' ) )

      Gibberish.factory( sqr, graph, 'sqr', props )

      return sqr
    },

    PWM( inputProps ) {
      const pwm   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false, pulsewidth:.25 }, Oscillators.defaults, inputProps )
      const osc   = Oscillators.factory( 'pwm', g.in( 'frequency' ), props.antialias )
      const graph = g.mul( osc, g.in('gain' ) )

      Gibberish.factory( pwm, graph, 'pwm', props )

      return pwm
    },

    Sine( inputProps ) {
      const sine  = Object.create( ugen )
      const props = Object.assign({}, Oscillators.defaults, inputProps )
      const graph = g.mul( g.cycle( g.in('frequency') ), g.in('gain') )

      Gibberish.factory( sine, graph, 'sine', props )
      
      return sine
    },

    Noise( inputProps ) {
      const noise = Object.create( ugen )
      const props = Object.assign( {}, { gain: 1, color:'white' }, inputProps )
      let graph 

      switch( props.color ) {
        case 'brown':
          graph = g.mul( Oscillators.genish.Brown(), g.in('gain') )
          break;
        case 'pink':
          graph = g.mul( Oscillators.genish.Pink(), g.in('gain') )
          break;
        default:
          graph = g.mul( g.noise(), g.in('gain') )
          break;
      }

      Gibberish.factory( noise, graph, 'noise', props )

      return noise
    },

    Saw( inputProps ) {
      const saw   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false }, Oscillators.defaults, inputProps )
      const osc   = Oscillators.factory( 'saw', g.in( 'frequency' ), props.antialias )
      const graph = g.mul( osc, g.in('gain' ) )

      Gibberish.factory( saw, graph, 'saw', props )

      return saw
    },

    ReverseSaw( inputProps ) {
      const saw   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false }, Oscillators.defaults, inputProps )
      const osc   = g.sub( 1, Oscillators.factory( 'saw', g.in( 'frequency' ), props.antialias ) )
      const graph = g.mul( osc, g.in( 'gain' ) )

      Gibberish.factory( saw, graph, 'rsaw', props )
      
      return saw
    },

    factory( type, frequency, antialias=false ) {
      let osc

      switch( type ) {
        case 'saw':
          if( antialias === false ) {
            osc = g.phasor( frequency )
          }else{
            osc = feedbackOsc( frequency, 1 )
          }
          break;
        case 'square':
          if( antialias === true ) {
            osc = feedbackOsc( frequency, 1, .5, { type:1 })
          }else{
            osc = g.wavetable( frequency, { buffer:Oscillators.Square.buffer, name:'square' } )
          }
          break;
        case 'sine':
          osc = g.cycle( frequency )
          break;
        case 'pwm':
          let pulsewidth = g.in('pulsewidth')
          if( antialias === true ) {
            osc = feedbackOsc( frequency, 1, pulsewidth, { type:1 })
          }else{
            let phase = g.phasor( frequency, 0, { min:0 } )
            osc = g.lt( phase, pulsewidth )
          }
          break;
      }

      return osc
    }
  }

  Oscillators.Square.buffer = new Float32Array( 1024 )

  for( let i = 1023; i >= 0; i-- ) { 
    Oscillators.Square.buffer [ i ] = i / 1024 > .5 ? 1 : -1
  }

  Oscillators.defaults = {
    frequency: 440,
    gain: 1
  }

  return Oscillators

}

},{"../ugen.js":55,"./brownnoise.js":47,"./fmfeedbackosc.js":48,"./pinknoise.js":50,"./wavetable.js":51,"genish.js":94}],50:[function(require,module,exports){
const genish = require('genish.js'),
      ssd = genish.history,
      noise = genish.noise;

module.exports = function () {
  const b0 = ssd(0),
        b1 = ssd(0),
        b2 = ssd(0),
        b3 = ssd(0),
        b4 = ssd(0),
        b5 = ssd(0),
        b6 = ssd(0);
  const white = genish.sub(genish.mul(noise(), 2), 1);

  b0.in(genish.add(genish.mul(.99886, b0.out), genish.mul(white, .0555179)));
  b1.in(genish.add(genish.mul(.99332, b1.out), genish.mul(white, .0750579)));
  b2.in(genish.add(genish.mul(.96900, b2.out), genish.mul(white, .1538520)));
  b3.in(genish.add(genish.mul(.88650, b3.out), genish.mul(white, .3104856)));
  b4.in(genish.add(genish.mul(.55000, b4.out), genish.mul(white, .5329522)));
  b5.in(genish.sub(genish.mul(-.7616, b5.out), genish.mul(white, .0168980)));

  out = genish.mul(genish.add(genish.add(genish.add(genish.add(genish.add(genish.add(genish.add(b0.out, b0.out), b0.out), b0.out), b0.out), b0.out), b0.out), genish.mul(white, .5362)), .11);

  b6.in(genish.mul(white, .115926));

  return out;
};
},{"genish.js":94}],51:[function(require,module,exports){
let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  const Wavetable = function( inputProps ) {
    const wavetable = Object.create( ugen )
    const props  = Object.assign({}, Gibberish.oscillators.defaults, inputProps )
    const osc = g.wavetable( g.in('frequency'), props )
    const graph = g.mul( 
      osc, 
      g.in( 'gain' )
    )

    Gibberish.factory( wavetable, graph, 'wavetable', props )

    return wavetable
  }

  g.wavetable = function( frequency, props ) {
    let dataProps = { immutable:true }

    // use global references if applicable
    if( props.name !== undefined ) dataProps.global = props.name

    const buffer = g.data( props.buffer, 1, dataProps )

    return g.peek( buffer, g.phasor( frequency, 0, { min:0 } ) )
  }

  return Wavetable
}

},{"../ugen.js":55,"genish.js":94}],52:[function(require,module,exports){
const Queue = require( '../external/priorityqueue.js' )
const Big   = require( 'big.js' )

let Scheduler = {
  phase: 0,

  queue: new Queue( ( a, b ) => {
    if( a.time === b.time ) { //a.time.eq( b.time ) ) {
      return b.priority - a.priority
    }else{
      return a.time - b.time //a.time.minus( b.time )
    }
  }),

  clear() {
    this.queue.data.length = 0
    this.queue.length = 0
  },

  add( time, func, priority = 0 ) {
    time += this.phase

    this.queue.push({ time, func, priority })
  },

  tick() {
    if( this.queue.length ) {
      let next = this.queue.peek()

      while( this.phase >= next.time ) {
        next.func()
        this.queue.pop()
        next = this.queue.peek()
      }

    }

    this.phase++
  },
}

module.exports = Scheduler

},{"../external/priorityqueue.js":7,"big.js":58}],53:[function(require,module,exports){
const g = require( 'genish.js' ),
      ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {
  const __proto__ = Object.create( ugen )

  Object.assign( __proto__, {
    start() {
      this.connect()
      return this
    },
    stop() {
      this.disconnect()
      return this
    }
  })

  const Seq2 = { 
    create( inputProps ) {
      const seq = Object.create( __proto__ ),
            props = Object.assign({}, Seq2.defaults, inputProps )

      seq.phase = 0
      seq.inputNames = [ 'rate' ]
      seq.inputs = [ 1 ]
      seq.nextTime = 0
      seq.valuesPhase = 0
      seq.timingsPhase = 0
      seq.id = Gibberish.factory.getUID()
      seq.dirty = true
      seq.type = 'seq'

      if( props.target === undefined ) {
        seq.anonFunction = true
      }else{ 
        seq.anonFunction = false
        seq.callFunction = typeof props.target[ props.key ] === 'function'
      }

      Object.assign( seq, props )

      seq.callback = function( rate ) {
        if( seq.phase >= seq.nextTime ) {
          let value = seq.values[ seq.valuesPhase++ % seq.values.length ]

          if( seq.anonFunction || typeof value === 'function' ) value = value()
          
          if( seq.anonFunction === false ) {
            if( seq.callFunction === false ) {
              seq.target[ seq.key ] = value
            }else{
              seq.target[ seq.key ]( value ) 
            }
          }

          seq.phase -= seq.nextTime

          let timing = seq.timings[ seq.timingsPhase++ % seq.timings.length ]
          if( typeof timing === 'function' ) timing = timing()

          seq.nextTime = timing
        }

        seq.phase += rate

        return 0
      }

      seq.ugenName = seq.callback.ugenName = 'seq_' + seq.id
      
      let value = seq.rate
      Object.defineProperty( seq, 'rate', {
        get() { return value },
        set( v ) {
          if( value !== v ) {
            Gibberish.dirty( seq )
            value = v
          }
        }
      })

      return seq
    }
  }

  Seq2.defaults = { rate: 1 }

  return Seq2.create

}


},{"../ugen.js":55,"genish.js":94}],54:[function(require,module,exports){
const Queue = require( '../external/priorityqueue.js' )
const Big   = require( 'big.js' )

module.exports = function( Gibberish ) {

let Sequencer = props => {
  let seq = {
    __isRunning:false,
    key: props.key, 
    target:  props.target,
    values:  props.values,
    timings: props.timings,
    __valuesPhase:  0,
    __timingsPhase: 0,
    priority: props.priority === undefined ? 0 : props.priority,

    tick() {
      let value  = seq.values[  seq.__valuesPhase++  % seq.values.length  ],
          timing = seq.timings[ seq.__timingsPhase++ % seq.timings.length ]

      if( typeof timing === 'function' ) timing = timing()

      if( typeof value === 'function' && seq.target === undefined ) {
        value()
      }else if( typeof seq.target[ seq.key ] === 'function' ) {
        if( typeof value === 'function' ) value = value()
        seq.target[ seq.key ]( value )
      }else{
        if( typeof value === 'function' ) value = value()
        seq.target[ seq.key ] = value
      }
      
      if( seq.__isRunning === true ) {
        Gibberish.scheduler.add( timing, seq.tick, seq.priority )
      }
    },

    start( delay = 0 ) {
      seq.__isRunning = true
      Gibberish.scheduler.add( delay, seq.tick, seq.priority )
      return seq
    },

    stop() {
      seq.__isRunning = false
      return seq
    }
  }

  return seq 
}

Sequencer.make = function( values, timings, target, key ) {
  return Sequencer({ values, timings, target, key })
}

return Sequencer

}

},{"../external/priorityqueue.js":7,"big.js":58}],55:[function(require,module,exports){
let ugen = {
  free() {
    Gibberish.genish.gen.free( this.graph )
  },

  print() {
    console.log( this.callback.toString() )
  },

  connect( target, level=1 ) {
    if( this.connected === undefined ) this.connected = []

    let input = level === 1 ? this : Gibberish.binops.Mul( this, level )

    if( target === undefined || target === null ) target = Gibberish.output 

    if( target.inputs )
      target.inputs.push( input )
    else
      target.input = input

    Gibberish.dirty( target )

    this.connected.push([ target, input ])
    
    return this
  },

  disconnect( target ) {
    if( target === undefined ){
      for( let connection of this.connected ) {
        connection[0].disconnectUgen( connection[1] )
      }
      this.connected.length = 0
    }else{
      const connection = this.connected.find( v => v[0] === target )
      target.disconnectUgen( connection[1] )
      const targetIdx = this.connected.indexOf( connection )
      this.connected.splice( targetIdx, 1 )
    }
  },

  chain( target, level=1 ) {
    this.connect( target,level )

    return target
  },

  __redoGraph() {
    this.__createGraph()
    this.callback = Gibberish.genish.gen.createCallback( this.graph, Gibberish.memory, false, true )
    this.inputNames = Gibberish.genish.gen.parameters.slice(0)
    this.callback.ugenName = this.ugenName
  },
}

module.exports = ugen

},{}],56:[function(require,module,exports){
module.exports = function( Gibberish ) {
  let uid = 0

  let factory = function( ugen, graph, name, values, cb ) {
    ugen.callback = cb === undefined ? Gibberish.genish.gen.createCallback( graph, Gibberish.memory, false, true ) : cb

    Object.assign( ugen, {
      type: 'ugen',
      id: factory.getUID(), 
      ugenName: name + '_',
      graph: graph,
      inputNames: Gibberish.genish.gen.parameters.slice(0),
      isStereo: Array.isArray( graph ),
      dirty: true
    })
    
    ugen.ugenName += ugen.id
    ugen.callback.ugenName = ugen.ugenName // XXX hacky

    for( let param of ugen.inputNames ) {
      if( param === 'memory' ) continue

      let value = values[ param ]

      // TODO: do we need to check for a setter?
      let desc = Object.getOwnPropertyDescriptor( ugen, param ),
          setter

      if( desc !== undefined ) {
        setter = desc.set
      }

      Object.defineProperty( ugen, param, {
        get() { return value },
        set( v ) {
          if( value !== v ) {
            Gibberish.dirty( ugen )
            if( setter !== undefined ) setter( v )
            value = v
          }
        }
      })
    }

    if( ugen.__requiresRecompilation !== undefined ) {
      ugen.__requiresRecompilation.forEach( prop => {
        let value = ugen[ prop ]
        Object.defineProperty( ugen, prop, {
          get() { return value },
          set( v ) {
            if( value !== v ) {
              value = v
              this.__redoGraph()
            }
          }
        })
      })      
    }
    return ugen
  }

  factory.getUID = () => uid++

  return factory
}

},{}],57:[function(require,module,exports){
let genish = require( 'genish.js' )

module.exports = function( Gibberish ) {

let utilities = {
  createContext() {
    let AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext
    Gibberish.ctx = new AC()
    genish.gen.samplerate = Gibberish.ctx.sampleRate
    genish.utilities.ctx = Gibberish.ctx

    let start = () => {
      if( typeof AC !== 'undefined' ) {
        if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
          window.removeEventListener( 'touchstart', start )

          if( 'ontouchstart' in document.documentElement ){ // required to start audio under iOS 6
            let mySource = utilities.ctx.createBufferSource()
            mySource.connect( utilities.ctx.destination )
            mySource.noteOn( 0 )
          }
         }
      }
    }

    if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
      window.addEventListener( 'touchstart', start )
    }

    return Gibberish.ctx
  },

  createScriptProcessor() {
    Gibberish.node = Gibberish.ctx.createScriptProcessor( 1024, 0, 2 ),
    Gibberish.clearFunction = function() { return 0 },
    Gibberish.callback = Gibberish.clearFunction

    Gibberish.node.onaudioprocess = function( audioProcessingEvent ) {
      let gibberish = Gibberish,
          callback  = gibberish.callback,
          outputBuffer = audioProcessingEvent.outputBuffer,
          scheduler = Gibberish.scheduler,
          //objs = gibberish.callbackUgens.slice( 0 ),
          length

      let left = outputBuffer.getChannelData( 0 ),
          right= outputBuffer.getChannelData( 1 )

      let callbacklength = Gibberish.blockCallbacks.length
      
      if( callbacklength !== 0 ) {
        for( let i=0; i< callbacklength; i++ ) {
          Gibberish.blockCallbacks[ i ]()
        }

        // can't just set length to 0 as callbacks might be added during for loop, so splice pre-existing functions
        Gibberish.blockCallbacks.splice( 0, callbacklength )
      }

      for (let sample = 0, length = left.length; sample < length; sample++) {
        scheduler.tick()

        if( gibberish.graphIsDirty ) { 
          callback = gibberish.generateCallback()
        }
        
        // XXX cant use destructuring, babel makes it something inefficient...
        let out = callback.apply( null, gibberish.callbackUgens )

        left[ sample  ] = out[0]
        right[ sample ] = out[1]
      }
    }

    Gibberish.node.connect( Gibberish.ctx.destination )

    return Gibberish.node
  }, 
}

return utilities
}

},{"genish.js":94}],58:[function(require,module,exports){
/* big.js v3.1.3 https://github.com/MikeMcl/big.js/LICENCE */
;(function (global) {
    'use strict';

/*
  big.js v3.1.3
  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
  https://github.com/MikeMcl/big.js/
  Copyright (c) 2014 Michael Mclaughlin <M8ch88l@gmail.com>
  MIT Expat Licence
*/

/***************************** EDITABLE DEFAULTS ******************************/

    // The default values below must be integers within the stated ranges.

    /*
     * The maximum number of decimal places of the results of operations
     * involving division: div and sqrt, and pow with negative exponents.
     */
    var DP = 20,                           // 0 to MAX_DP

        /*
         * The rounding mode used when rounding to the above decimal places.
         *
         * 0 Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
         * 1 To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
         * 2 To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
         * 3 Away from zero.                                  (ROUND_UP)
         */
        RM = 1,                            // 0, 1, 2 or 3

        // The maximum value of DP and Big.DP.
        MAX_DP = 1E6,                      // 0 to 1000000

        // The maximum magnitude of the exponent argument to the pow method.
        MAX_POWER = 1E6,                   // 1 to 1000000

        /*
         * The exponent value at and beneath which toString returns exponential
         * notation.
         * JavaScript's Number type: -7
         * -1000000 is the minimum recommended exponent value of a Big.
         */
        E_NEG = -7,                   // 0 to -1000000

        /*
         * The exponent value at and above which toString returns exponential
         * notation.
         * JavaScript's Number type: 21
         * 1000000 is the maximum recommended exponent value of a Big.
         * (This limit is not enforced or checked.)
         */
        E_POS = 21,                   // 0 to 1000000

/******************************************************************************/

        // The shared prototype object.
        P = {},
        isValid = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        Big;


    /*
     * Create and return a Big constructor.
     *
     */
    function bigFactory() {

        /*
         * The Big constructor and exported function.
         * Create and return a new instance of a Big number object.
         *
         * n {number|string|Big} A numeric value.
         */
        function Big(n) {
            var x = this;

            // Enable constructor usage without new.
            if (!(x instanceof Big)) {
                return n === void 0 ? bigFactory() : new Big(n);
            }

            // Duplicate.
            if (n instanceof Big) {
                x.s = n.s;
                x.e = n.e;
                x.c = n.c.slice();
            } else {
                parse(x, n);
            }

            /*
             * Retain a reference to this Big constructor, and shadow
             * Big.prototype.constructor which points to Object.
             */
            x.constructor = Big;
        }

        Big.prototype = P;
        Big.DP = DP;
        Big.RM = RM;
        Big.E_NEG = E_NEG;
        Big.E_POS = E_POS;

        return Big;
    }


    // Private functions


    /*
     * Return a string representing the value of Big x in normal or exponential
     * notation to dp fixed decimal places or significant digits.
     *
     * x {Big} The Big to format.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * toE {number} 1 (toExponential), 2 (toPrecision) or undefined (toFixed).
     */
    function format(x, dp, toE) {
        var Big = x.constructor,

            // The index (normal notation) of the digit that may be rounded up.
            i = dp - (x = new Big(x)).e,
            c = x.c;

        // Round?
        if (c.length > ++dp) {
            rnd(x, i, Big.RM);
        }

        if (!c[0]) {
            ++i;
        } else if (toE) {
            i = dp;

        // toFixed
        } else {
            c = x.c;

            // Recalculate i as x.e may have changed if value rounded up.
            i = x.e + i + 1;
        }

        // Append zeros?
        for (; c.length < i; c.push(0)) {
        }
        i = x.e;

        /*
         * toPrecision returns exponential notation if the number of
         * significant digits specified is less than the number of digits
         * necessary to represent the integer part of the value in normal
         * notation.
         */
        return toE === 1 || toE && (dp <= i || i <= Big.E_NEG) ?

          // Exponential notation.
          (x.s < 0 && c[0] ? '-' : '') +
            (c.length > 1 ? c[0] + '.' + c.join('').slice(1) : c[0]) +
              (i < 0 ? 'e' : 'e+') + i

          // Normal notation.
          : x.toString();
    }


    /*
     * Parse the number or string value passed to a Big constructor.
     *
     * x {Big} A Big number instance.
     * n {number|string} A numeric value.
     */
    function parse(x, n) {
        var e, i, nL;

        // Minus zero?
        if (n === 0 && 1 / n < 0) {
            n = '-0';

        // Ensure n is string and check validity.
        } else if (!isValid.test(n += '')) {
            throwErr(NaN);
        }

        // Determine sign.
        x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

        // Decimal point?
        if ((e = n.indexOf('.')) > -1) {
            n = n.replace('.', '');
        }

        // Exponential form?
        if ((i = n.search(/e/i)) > 0) {

            // Determine exponent.
            if (e < 0) {
                e = i;
            }
            e += +n.slice(i + 1);
            n = n.substring(0, i);

        } else if (e < 0) {

            // Integer.
            e = n.length;
        }

        // Determine leading zeros.
        for (i = 0; n.charAt(i) == '0'; i++) {
        }

        if (i == (nL = n.length)) {

            // Zero.
            x.c = [ x.e = 0 ];
        } else {

            // Determine trailing zeros.
            for (; n.charAt(--nL) == '0';) {
            }

            x.e = e - i - 1;
            x.c = [];

            // Convert string to array of digits without leading/trailing zeros.
            for (e = 0; i <= nL; x.c[e++] = +n.charAt(i++)) {
            }
        }

        return x;
    }


    /*
     * Round Big x to a maximum of dp decimal places using rounding mode rm.
     * Called by div, sqrt and round.
     *
     * x {Big} The Big to round.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
     * [more] {boolean} Whether the result of division was truncated.
     */
    function rnd(x, dp, rm, more) {
        var u,
            xc = x.c,
            i = x.e + dp + 1;

        if (rm === 1) {

            // xc[i] is the digit after the digit that may be rounded up.
            more = xc[i] >= 5;
        } else if (rm === 2) {
            more = xc[i] > 5 || xc[i] == 5 &&
              (more || i < 0 || xc[i + 1] !== u || xc[i - 1] & 1);
        } else if (rm === 3) {
            more = more || xc[i] !== u || i < 0;
        } else {
            more = false;

            if (rm !== 0) {
                throwErr('!Big.RM!');
            }
        }

        if (i < 1 || !xc[0]) {

            if (more) {

                // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                x.e = -dp;
                x.c = [1];
            } else {

                // Zero.
                x.c = [x.e = 0];
            }
        } else {

            // Remove any digits after the required decimal places.
            xc.length = i--;

            // Round up?
            if (more) {

                // Rounding up may mean the previous digit has to be rounded up.
                for (; ++xc[i] > 9;) {
                    xc[i] = 0;

                    if (!i--) {
                        ++x.e;
                        xc.unshift(1);
                    }
                }
            }

            // Remove trailing zeros.
            for (i = xc.length; !xc[--i]; xc.pop()) {
            }
        }

        return x;
    }


    /*
     * Throw a BigError.
     *
     * message {string} The error message.
     */
    function throwErr(message) {
        var err = new Error(message);
        err.name = 'BigError';

        throw err;
    }


    // Prototype/instance methods


    /*
     * Return a new Big whose value is the absolute value of this Big.
     */
    P.abs = function () {
        var x = new this.constructor(this);
        x.s = 1;

        return x;
    };


    /*
     * Return
     * 1 if the value of this Big is greater than the value of Big y,
     * -1 if the value of this Big is less than the value of Big y, or
     * 0 if they have the same value.
    */
    P.cmp = function (y) {
        var xNeg,
            x = this,
            xc = x.c,
            yc = (y = new x.constructor(y)).c,
            i = x.s,
            j = y.s,
            k = x.e,
            l = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {
            return !xc[0] ? !yc[0] ? 0 : -j : i;
        }

        // Signs differ?
        if (i != j) {
            return i;
        }
        xNeg = i < 0;

        // Compare exponents.
        if (k != l) {
            return k > l ^ xNeg ? 1 : -1;
        }

        i = -1;
        j = (k = xc.length) < (l = yc.length) ? k : l;

        // Compare digit by digit.
        for (; ++i < j;) {

            if (xc[i] != yc[i]) {
                return xc[i] > yc[i] ^ xNeg ? 1 : -1;
            }
        }

        // Compare lengths.
        return k == l ? 0 : k > l ^ xNeg ? 1 : -1;
    };


    /*
     * Return a new Big whose value is the value of this Big divided by the
     * value of Big y, rounded, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     */
    P.div = function (y) {
        var x = this,
            Big = x.constructor,
            // dividend
            dvd = x.c,
            //divisor
            dvs = (y = new Big(y)).c,
            s = x.s == y.s ? 1 : -1,
            dp = Big.DP;

        if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!Big.DP!');
        }

        // Either 0?
        if (!dvd[0] || !dvs[0]) {

            // If both are 0, throw NaN
            if (dvd[0] == dvs[0]) {
                throwErr(NaN);
            }

            // If dvs is 0, throw +-Infinity.
            if (!dvs[0]) {
                throwErr(s / 0);
            }

            // dvd is 0, return +-0.
            return new Big(s * 0);
        }

        var dvsL, dvsT, next, cmp, remI, u,
            dvsZ = dvs.slice(),
            dvdI = dvsL = dvs.length,
            dvdL = dvd.length,
            // remainder
            rem = dvd.slice(0, dvsL),
            remL = rem.length,
            // quotient
            q = y,
            qc = q.c = [],
            qi = 0,
            digits = dp + (q.e = x.e - y.e) + 1;

        q.s = s;
        s = digits < 0 ? 0 : digits;

        // Create version of divisor with leading zero.
        dvsZ.unshift(0);

        // Add zeros to make remainder as long as divisor.
        for (; remL++ < dvsL; rem.push(0)) {
        }

        do {

            // 'next' is how many times the divisor goes into current remainder.
            for (next = 0; next < 10; next++) {

                // Compare divisor and remainder.
                if (dvsL != (remL = rem.length)) {
                    cmp = dvsL > remL ? 1 : -1;
                } else {

                    for (remI = -1, cmp = 0; ++remI < dvsL;) {

                        if (dvs[remI] != rem[remI]) {
                            cmp = dvs[remI] > rem[remI] ? 1 : -1;
                            break;
                        }
                    }
                }

                // If divisor < remainder, subtract divisor from remainder.
                if (cmp < 0) {

                    // Remainder can't be more than 1 digit longer than divisor.
                    // Equalise lengths using divisor with extra leading zero?
                    for (dvsT = remL == dvsL ? dvs : dvsZ; remL;) {

                        if (rem[--remL] < dvsT[remL]) {
                            remI = remL;

                            for (; remI && !rem[--remI]; rem[remI] = 9) {
                            }
                            --rem[remI];
                            rem[remL] += 10;
                        }
                        rem[remL] -= dvsT[remL];
                    }
                    for (; !rem[0]; rem.shift()) {
                    }
                } else {
                    break;
                }
            }

            // Add the 'next' digit to the result array.
            qc[qi++] = cmp ? next : ++next;

            // Update the remainder.
            if (rem[0] && cmp) {
                rem[remL] = dvd[dvdI] || 0;
            } else {
                rem = [ dvd[dvdI] ];
            }

        } while ((dvdI++ < dvdL || rem[0] !== u) && s--);

        // Leading zero? Do not remove if result is simply zero (qi == 1).
        if (!qc[0] && qi != 1) {

            // There can't be more than one zero.
            qc.shift();
            q.e--;
        }

        // Round?
        if (qi > digits) {
            rnd(q, dp, Big.RM, rem[0] !== u);
        }

        return q;
    };


    /*
     * Return true if the value of this Big is equal to the value of Big y,
     * otherwise returns false.
     */
    P.eq = function (y) {
        return !this.cmp(y);
    };


    /*
     * Return true if the value of this Big is greater than the value of Big y,
     * otherwise returns false.
     */
    P.gt = function (y) {
        return this.cmp(y) > 0;
    };


    /*
     * Return true if the value of this Big is greater than or equal to the
     * value of Big y, otherwise returns false.
     */
    P.gte = function (y) {
        return this.cmp(y) > -1;
    };


    /*
     * Return true if the value of this Big is less than the value of Big y,
     * otherwise returns false.
     */
    P.lt = function (y) {
        return this.cmp(y) < 0;
    };


    /*
     * Return true if the value of this Big is less than or equal to the value
     * of Big y, otherwise returns false.
     */
    P.lte = function (y) {
         return this.cmp(y) < 1;
    };


    /*
     * Return a new Big whose value is the value of this Big minus the value
     * of Big y.
     */
    P.sub = P.minus = function (y) {
        var i, j, t, xLTy,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.plus(y);
        }

        var xc = x.c.slice(),
            xe = x.e,
            yc = y.c,
            ye = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
        }

        // Determine which is the bigger number.
        // Prepend zeros to equalise exponents.
        if (a = xe - ye) {

            if (xLTy = a < 0) {
                a = -a;
                t = xc;
            } else {
                ye = xe;
                t = yc;
            }

            t.reverse();
            for (b = a; b--; t.push(0)) {
            }
            t.reverse();
        } else {

            // Exponents equal. Check digit by digit.
            j = ((xLTy = xc.length < yc.length) ? xc : yc).length;

            for (a = b = 0; b < j; b++) {

                if (xc[b] != yc[b]) {
                    xLTy = xc[b] < yc[b];
                    break;
                }
            }
        }

        // x < y? Point xc to the array of the bigger number.
        if (xLTy) {
            t = xc;
            xc = yc;
            yc = t;
            y.s = -y.s;
        }

        /*
         * Append zeros to xc if shorter. No need to add zeros to yc if shorter
         * as subtraction only needs to start at yc.length.
         */
        if (( b = (j = yc.length) - (i = xc.length) ) > 0) {

            for (; b--; xc[i++] = 0) {
            }
        }

        // Subtract yc from xc.
        for (b = i; j > a;){

            if (xc[--j] < yc[j]) {

                for (i = j; i && !xc[--i]; xc[i] = 9) {
                }
                --xc[i];
                xc[j] += 10;
            }
            xc[j] -= yc[j];
        }

        // Remove trailing zeros.
        for (; xc[--b] === 0; xc.pop()) {
        }

        // Remove leading zeros and adjust exponent accordingly.
        for (; xc[0] === 0;) {
            xc.shift();
            --ye;
        }

        if (!xc[0]) {

            // n - n = +0
            y.s = 1;

            // Result must be zero.
            xc = [ye = 0];
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a new Big whose value is the value of this Big modulo the
     * value of Big y.
     */
    P.mod = function (y) {
        var yGTx,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        if (!y.c[0]) {
            throwErr(NaN);
        }

        x.s = y.s = 1;
        yGTx = y.cmp(x) == 1;
        x.s = a;
        y.s = b;

        if (yGTx) {
            return new Big(x);
        }

        a = Big.DP;
        b = Big.RM;
        Big.DP = Big.RM = 0;
        x = x.div(y);
        Big.DP = a;
        Big.RM = b;

        return this.minus( x.times(y) );
    };


    /*
     * Return a new Big whose value is the value of this Big plus the value
     * of Big y.
     */
    P.add = P.plus = function (y) {
        var t,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.minus(y);
        }

        var xe = x.e,
            xc = x.c,
            ye = y.e,
            yc = y.c;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? y : new Big(xc[0] ? x : a * 0);
        }
        xc = xc.slice();

        // Prepend zeros to equalise exponents.
        // Note: Faster to use reverse then do unshifts.
        if (a = xe - ye) {

            if (a > 0) {
                ye = xe;
                t = yc;
            } else {
                a = -a;
                t = xc;
            }

            t.reverse();
            for (; a--; t.push(0)) {
            }
            t.reverse();
        }

        // Point xc to the longer array.
        if (xc.length - yc.length < 0) {
            t = yc;
            yc = xc;
            xc = t;
        }
        a = yc.length;

        /*
         * Only start adding at yc.length - 1 as the further digits of xc can be
         * left as they are.
         */
        for (b = 0; a;) {
            b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;
            xc[a] %= 10;
        }

        // No need to check for zero, as +x + +y != 0 && -x + -y != 0

        if (b) {
            xc.unshift(b);
            ++ye;
        }

         // Remove trailing zeros.
        for (a = xc.length; xc[--a] === 0; xc.pop()) {
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a Big whose value is the value of this Big raised to the power n.
     * If n is negative, round, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     *
     * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
     */
    P.pow = function (n) {
        var x = this,
            one = new x.constructor(1),
            y = one,
            isNeg = n < 0;

        if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) {
            throwErr('!pow!');
        }

        n = isNeg ? -n : n;

        for (;;) {

            if (n & 1) {
                y = y.times(x);
            }
            n >>= 1;

            if (!n) {
                break;
            }
            x = x.times(x);
        }

        return isNeg ? one.div(y) : y;
    };


    /*
     * Return a new Big whose value is the value of this Big rounded to a
     * maximum of dp decimal places using rounding mode rm.
     * If dp is not specified, round to 0 decimal places.
     * If rm is not specified, use Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     * [rm] 0, 1, 2 or 3 (ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_UP)
     */
    P.round = function (dp, rm) {
        var x = this,
            Big = x.constructor;

        if (dp == null) {
            dp = 0;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!round!');
        }
        rnd(x = new Big(x), dp, rm == null ? Big.RM : rm);

        return x;
    };


    /*
     * Return a new Big whose value is the square root of the value of this Big,
     * rounded, if necessary, to a maximum of Big.DP decimal places using
     * rounding mode Big.RM.
     */
    P.sqrt = function () {
        var estimate, r, approx,
            x = this,
            Big = x.constructor,
            xc = x.c,
            i = x.s,
            e = x.e,
            half = new Big('0.5');

        // Zero?
        if (!xc[0]) {
            return new Big(x);
        }

        // If negative, throw NaN.
        if (i < 0) {
            throwErr(NaN);
        }

        // Estimate.
        i = Math.sqrt(x.toString());

        // Math.sqrt underflow/overflow?
        // Pass x to Math.sqrt as integer, then adjust the result exponent.
        if (i === 0 || i === 1 / 0) {
            estimate = xc.join('');

            if (!(estimate.length + e & 1)) {
                estimate += '0';
            }

            r = new Big( Math.sqrt(estimate).toString() );
            r.e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
        } else {
            r = new Big(i.toString());
        }

        i = r.e + (Big.DP += 4);

        // Newton-Raphson iteration.
        do {
            approx = r;
            r = half.times( approx.plus( x.div(approx) ) );
        } while ( approx.c.slice(0, i).join('') !==
                       r.c.slice(0, i).join('') );

        rnd(r, Big.DP -= 4, Big.RM);

        return r;
    };


    /*
     * Return a new Big whose value is the value of this Big times the value of
     * Big y.
     */
    P.mul = P.times = function (y) {
        var c,
            x = this,
            Big = x.constructor,
            xc = x.c,
            yc = (y = new Big(y)).c,
            a = xc.length,
            b = yc.length,
            i = x.e,
            j = y.e;

        // Determine sign of result.
        y.s = x.s == y.s ? 1 : -1;

        // Return signed 0 if either 0.
        if (!xc[0] || !yc[0]) {
            return new Big(y.s * 0);
        }

        // Initialise exponent of result as x.e + y.e.
        y.e = i + j;

        // If array xc has fewer digits than yc, swap xc and yc, and lengths.
        if (a < b) {
            c = xc;
            xc = yc;
            yc = c;
            j = a;
            a = b;
            b = j;
        }

        // Initialise coefficient array of result with zeros.
        for (c = new Array(j = a + b); j--; c[j] = 0) {
        }

        // Multiply.

        // i is initially xc.length.
        for (i = b; i--;) {
            b = 0;

            // a is yc.length.
            for (j = a + i; j > i;) {

                // Current sum of products at this digit position, plus carry.
                b = c[j] + yc[i] * xc[j - i - 1] + b;
                c[j--] = b % 10;

                // carry
                b = b / 10 | 0;
            }
            c[j] = (c[j] + b) % 10;
        }

        // Increment result exponent if there is a final carry.
        if (b) {
            ++y.e;
        }

        // Remove any leading zero.
        if (!c[0]) {
            c.shift();
        }

        // Remove trailing zeros.
        for (i = c.length; !c[--i]; c.pop()) {
        }
        y.c = c;

        return y;
    };


    /*
     * Return a string representing the value of this Big.
     * Return exponential notation if this Big has a positive exponent equal to
     * or greater than Big.E_POS, or a negative exponent equal to or less than
     * Big.E_NEG.
     */
    P.toString = P.valueOf = P.toJSON = function () {
        var x = this,
            Big = x.constructor,
            e = x.e,
            str = x.c.join(''),
            strL = str.length;

        // Exponential notation?
        if (e <= Big.E_NEG || e >= Big.E_POS) {
            str = str.charAt(0) + (strL > 1 ? '.' + str.slice(1) : '') +
              (e < 0 ? 'e' : 'e+') + e;

        // Negative exponent?
        } else if (e < 0) {

            // Prepend zeros.
            for (; ++e; str = '0' + str) {
            }
            str = '0.' + str;

        // Positive exponent?
        } else if (e > 0) {

            if (++e > strL) {

                // Append zeros.
                for (e -= strL; e-- ; str += '0') {
                }
            } else if (e < strL) {
                str = str.slice(0, e) + '.' + str.slice(e);
            }

        // Exponent zero.
        } else if (strL > 1) {
            str = str.charAt(0) + '.' + str.slice(1);
        }

        // Avoid '-0'
        return x.s < 0 && x.c[0] ? '-' + str : str;
    };


    /*
     ***************************************************************************
     * If toExponential, toFixed, toPrecision and format are not required they
     * can safely be commented-out or deleted. No redundant code will be left.
     * format is used only by toExponential, toFixed and toPrecision.
     ***************************************************************************
     */


    /*
     * Return a string representing the value of this Big in exponential
     * notation to dp fixed decimal places and rounded, if necessary, using
     * Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toExponential = function (dp) {

        if (dp == null) {
            dp = this.c.length - 1;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!toExp!');
        }

        return format(this, dp, 1);
    };


    /*
     * Return a string representing the value of this Big in normal notation
     * to dp fixed decimal places and rounded, if necessary, using Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toFixed = function (dp) {
        var str,
            x = this,
            Big = x.constructor,
            neg = Big.E_NEG,
            pos = Big.E_POS;

        // Prevent the possibility of exponential notation.
        Big.E_NEG = -(Big.E_POS = 1 / 0);

        if (dp == null) {
            str = x.toString();
        } else if (dp === ~~dp && dp >= 0 && dp <= MAX_DP) {
            str = format(x, x.e + dp);

            // (-0).toFixed() is '0', but (-0.1).toFixed() is '-0'.
            // (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
            if (x.s < 0 && x.c[0] && str.indexOf('-') < 0) {
        //E.g. -0.5 if rounded to -0 will cause toString to omit the minus sign.
                str = '-' + str;
            }
        }
        Big.E_NEG = neg;
        Big.E_POS = pos;

        if (!str) {
            throwErr('!toFix!');
        }

        return str;
    };


    /*
     * Return a string representing the value of this Big rounded to sd
     * significant digits using Big.RM. Use exponential notation if sd is less
     * than the number of digits necessary to represent the integer part of the
     * value in normal notation.
     *
     * sd {number} Integer, 1 to MAX_DP inclusive.
     */
    P.toPrecision = function (sd) {

        if (sd == null) {
            return this.toString();
        } else if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
            throwErr('!toPre!');
        }

        return format(this, sd - 1, 2);
    };


    // Export


    Big = bigFactory();

    //AMD.
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Big;
        });

    // Node and other CommonJS-like environments that support module.exports.
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = Big;

    //Browser.
    } else {
        global.Big = Big;
    }
})(this);

},{}],59:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'abs',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.abs));

      out = 'gen.abs( ' + inputs[0] + ' )';
    } else {
      out = Math.abs(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var abs = Object.create(proto);

  abs.inputs = [x];

  return abs;
};
},{"./gen.js":87}],60:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'accum',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        genName = 'gen.' + this.name,
        functionBody = void 0;

    _gen.requestMemory(this.memory);

    _gen.memory.heap[this.memory.value.idx] = this.initialValue;

    functionBody = this.callback(genName, inputs[0], inputs[1], 'memory[' + this.memory.value.idx + ']');

    _gen.closures.add(_defineProperty({}, this.name, this));

    _gen.memo[this.name] = this.name + '_value';

    return [this.name + '_value', functionBody];
  },
  callback: function callback(_name, _incr, _reset, valueRef) {
    var diff = this.max - this.min,
        out = '',
        wrap = '';

    /* three different methods of wrapping, third is most expensive:
     *
     * 1: range {0,1}: y = x - (x | 0)
     * 2: log2(this.max) == integer: y = x & (this.max - 1)
     * 3: all others: if( x >= this.max ) y = this.max -x
     *
     */

    // must check for reset before storing value for output
    if (!(typeof this.inputs[1] === 'number' && this.inputs[1] < 1)) {
      out += '  if( ' + _reset + ' >=1 ) ' + valueRef + ' = ' + this.initialValue + '\n\n';
    }

    out += '  var ' + this.name + '_value = ' + valueRef + ';\n';

    if (this.shouldWrap === false && this.shouldClamp === true) {
      out += '  if( ' + valueRef + ' < ' + this.max + ' ) ' + valueRef + ' += ' + _incr + '\n';
    } else {
      out += '  ' + valueRef + ' += ' + _incr + '\n'; // store output value before accumulating  
    }

    if (this.max !== Infinity && this.shouldWrap) wrap += '  if( ' + valueRef + ' >= ' + this.max + ' ) ' + valueRef + ' -= ' + diff + '\n';
    if (this.min !== -Infinity && this.shouldWrap) wrap += '  if( ' + valueRef + ' < ' + this.min + ' ) ' + valueRef + ' += ' + diff + '\n\n';

    //if( this.min === 0 && this.max === 1 ) { 
    //  wrap =  `  ${valueRef} = ${valueRef} - (${valueRef} | 0)\n\n`
    //} else if( this.min === 0 && ( Math.log2( this.max ) | 0 ) === Math.log2( this.max ) ) {
    //  wrap =  `  ${valueRef} = ${valueRef} & (${this.max} - 1)\n\n`
    //} else if( this.max !== Infinity ){
    //  wrap = `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n\n`
    //}

    out = out + wrap;

    return out;
  }
};

module.exports = function (incr) {
  var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var properties = arguments[2];

  var ugen = Object.create(proto),
      defaults = { min: 0, max: 1, shouldWrap: true, shouldClamp: false };

  if (properties !== undefined) Object.assign(defaults, properties);

  if (defaults.initialValue === undefined) defaults.initialValue = defaults.min;

  Object.assign(ugen, {
    min: defaults.min,
    max: defaults.max,
    initial: defaults.initialValue,
    uid: _gen.getUID(),
    inputs: [incr, reset],
    memory: {
      value: { length: 1, idx: null }
    }
  }, defaults);

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      return _gen.memory.heap[this.memory.value.idx];
    },
    set: function set(v) {
      _gen.memory.heap[this.memory.value.idx] = v;
    }
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],61:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'acos',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'acos': Math.acos });

      out = 'gen.acos( ' + inputs[0] + ' )';
    } else {
      out = Math.acos(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var acos = Object.create(proto);

  acos.inputs = [x];
  acos.id = _gen.getUID();
  acos.name = acos.basename + '{acos.id}';

  return acos;
};
},{"./gen.js":87}],62:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    div = require('./div.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    accum = require('./accum.js'),
    ifelse = require('./ifelseif.js'),
    lt = require('./lt.js'),
    bang = require('./bang.js'),
    env = require('./env.js'),
    add = require('./add.js'),
    poke = require('./poke.js'),
    neq = require('./neq.js'),
    and = require('./and.js'),
    gte = require('./gte.js'),
    memo = require('./memo.js');

module.exports = function () {
  var attackTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 44100;
  var decayTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 44100;
  var _props = arguments[2];

  var _bang = bang(),
      phase = accum(1, _bang, { max: Infinity, shouldWrap: false, initialValue: -Infinity }),
      props = Object.assign({}, { shape: 'exponential', alpha: 5 }, _props),
      bufferData = void 0,
      decayData = void 0,
      out = void 0,
      buffer = void 0;

  //console.log( 'attack time:', attackTime, 'decay time:', decayTime )
  var completeFlag = data([0]

  // slightly more efficient to use existing phase accumulator for linear envelopes
  );if (props.shape === 'linear') {
    out = ifelse(and(gte(phase, 0), lt(phase, attackTime)), memo(div(phase, attackTime)), and(gte(phase, 0), lt(phase, add(attackTime, decayTime))), sub(1, div(sub(phase, attackTime), decayTime)), neq(phase, -Infinity), poke(completeFlag, 1, 0, { inline: 0 }), 0);
  } else {
    bufferData = env(1024, { type: props.shape, alpha: props.alpha });
    out = ifelse(and(gte(phase, 0), lt(phase, attackTime)), peek(bufferData, div(phase, attackTime), { boundmode: 'clamp' }), and(gte(phase, 0), lt(phase, add(attackTime, decayTime))), peek(bufferData, sub(1, div(sub(phase, attackTime), decayTime)), { boundmode: 'clamp' }), neq(phase, -Infinity), poke(completeFlag, 1, 0, { inline: 0 }), 0);
  }

  out.isComplete = function () {
    return gen.memory.heap[completeFlag.memory.values.idx];
  };

  out.trigger = function () {
    gen.memory.heap[completeFlag.memory.values.idx] = 0;
    _bang.trigger();
  };

  return out;
};
},{"./accum.js":60,"./add.js":63,"./and.js":65,"./bang.js":69,"./data.js":76,"./div.js":81,"./env.js":82,"./gen.js":87,"./gte.js":89,"./ifelseif.js":92,"./lt.js":95,"./memo.js":99,"./mul.js":105,"./neq.js":106,"./peek.js":111,"./poke.js":113,"./sub.js":122}],63:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var add = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          sum = 0,
          numCount = 0,
          adderAtEnd = false,
          alreadyFullSummed = true;

      inputs.forEach(function (v, i) {
        if (isNaN(v)) {
          out += v;
          if (i < inputs.length - 1) {
            adderAtEnd = true;
            out += ' + ';
          }
          alreadyFullSummed = false;
        } else {
          sum += parseFloat(v);
          numCount++;
        }
      });

      if (alreadyFullSummed) out = '';

      if (numCount > 0) {
        out += adderAtEnd || alreadyFullSummed ? sum : ' + ' + sum;
      }

      if (!alreadyFullSummed) out += ')';

      return out;
    }
  };

  return add;
};
},{"./gen.js":87}],64:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    div = require('./div.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    accum = require('./accum.js'),
    ifelse = require('./ifelseif.js'),
    lt = require('./lt.js'),
    bang = require('./bang.js'),
    env = require('./env.js'),
    param = require('./param.js'),
    add = require('./add.js'),
    gtp = require('./gtp.js'),
    not = require('./not.js');

module.exports = function () {
  var attackTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 44;
  var decayTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 22050;
  var sustainTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 44100;
  var sustainLevel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : .6;
  var releaseTime = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 44100;
  var _props = arguments[5];

  var envTrigger = bang(),
      phase = accum(1, envTrigger, { max: Infinity, shouldWrap: false }),
      shouldSustain = param(1),
      defaults = {
    shape: 'exponential',
    alpha: 5,
    triggerRelease: false
  },
      props = Object.assign({}, defaults, _props),
      bufferData = void 0,
      decayData = void 0,
      out = void 0,
      buffer = void 0,
      sustainCondition = void 0,
      releaseAccum = void 0,
      releaseCondition = void 0;

  // slightly more efficient to use existing phase accumulator for linear envelopes
  //if( props.shape === 'linear' ) {
  //  out = ifelse( 
  //    lt( phase, props.attackTime ), memo( div( phase, props.attackTime ) ),
  //    lt( phase, props.attackTime + props.decayTime ), sub( 1, mul( div( sub( phase, props.attackTime ), props.decayTime ), 1-props.sustainLevel ) ),
  //    lt( phase, props.attackTime + props.decayTime + props.sustainTime ), 
  //      props.sustainLevel,
  //    lt( phase, props.attackTime + props.decayTime + props.sustainTime + props.releaseTime ), 
  //      sub( props.sustainLevel, mul( div( sub( phase, props.attackTime + props.decayTime + props.sustainTime ), props.releaseTime ), props.sustainLevel) ),
  //    0
  //  )
  //} else {     
  bufferData = env({ length: 1024, alpha: props.alpha, shift: 0, type: props.shape });

  console.log(bufferData);

  sustainCondition = props.triggerRelease ? shouldSustain : lt(phase, add(attackTime, decayTime, sustainTime));

  releaseAccum = props.triggerRelease ? gtp(sub(sustainLevel, accum(div(sustainLevel, releaseTime), 0, { shouldWrap: false })), 0) : sub(sustainLevel, mul(div(sub(phase, add(attackTime, decayTime, sustainTime)), releaseTime), sustainLevel)), releaseCondition = props.triggerRelease ? not(shouldSustain) : lt(phase, add(attackTime, decayTime, sustainTime, releaseTime));

  out = ifelse(
  // attack 
  lt(phase, attackTime), peek(bufferData, div(phase, attackTime), { boundmode: 'clamp' }),

  // decay
  lt(phase, add(attackTime, decayTime)), peek(bufferData, sub(1, mul(div(sub(phase, attackTime), decayTime), sub(1, sustainLevel))), { boundmode: 'clamp' }),

  // sustain
  sustainCondition, peek(bufferData, sustainLevel),

  // release
  releaseCondition, //lt( phase,  attackTime +  decayTime +  sustainTime +  releaseTime ),
  peek(bufferData, releaseAccum,
  //sub(  sustainLevel, mul( div( sub( phase,  attackTime +  decayTime +  sustainTime),  releaseTime ),  sustainLevel ) ), 
  { boundmode: 'clamp' }), 0
  //}

  );out.trigger = function () {
    shouldSustain.value = 1;
    envTrigger.trigger();
  };

  out.release = function () {
    shouldSustain.value = 0;
    // XXX pretty nasty... grabs accum inside of gtp and resets value manually
    // unfortunately envTrigger won't work as it's back to 0 by the time the release block is triggered...
    gen.memory.heap[releaseAccum.inputs[0].inputs[1].memory.value.idx] = 0;
  };

  return out;
};
},{"./accum.js":60,"./add.js":63,"./bang.js":69,"./data.js":76,"./div.js":81,"./env.js":82,"./gen.js":87,"./gtp.js":90,"./ifelseif.js":92,"./lt.js":95,"./mul.js":105,"./not.js":108,"./param.js":110,"./peek.js":111,"./sub.js":122}],65:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'and',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = '  var ' + this.name + ' = (' + inputs[0] + ' !== 0 && ' + inputs[1] + ' !== 0) | 0\n\n';

    _gen.memo[this.name] = '' + this.name;

    return ['' + this.name, out];
  }
};

module.exports = function (in1, in2) {
  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],66:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'asin',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'asin': Math.asin });

      out = 'gen.asin( ' + inputs[0] + ' )';
    } else {
      out = Math.asin(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var asin = Object.create(proto);

  asin.inputs = [x];
  asin.id = _gen.getUID();
  asin.name = asin.basename + '{asin.id}';

  return asin;
};
},{"./gen.js":87}],67:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'atan',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'atan': Math.atan });

      out = 'gen.atan( ' + inputs[0] + ' )';
    } else {
      out = Math.atan(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var atan = Object.create(proto);

  atan.inputs = [x];
  atan.id = _gen.getUID();
  atan.name = atan.basename + '{atan.id}';

  return atan;
};
},{"./gen.js":87}],68:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js');

module.exports = function () {
    var decayTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 44100;

    var ssd = history(1),
        t60 = Math.exp(-6.907755278921 / decayTime);

    ssd.in(mul(ssd.out, t60));

    ssd.out.trigger = function () {
        ssd.value = 1;
    };

    return sub(1, ssd.out);
};
},{"./gen.js":87,"./history.js":91,"./mul.js":105,"./sub.js":122}],69:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  gen: function gen() {
    _gen.requestMemory(this.memory);

    var out = '  var ' + this.name + ' = memory[' + this.memory.value.idx + ']\n  if( ' + this.name + ' === 1 ) memory[' + this.memory.value.idx + '] = 0      \n      \n';
    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (_props) {
  var ugen = Object.create(proto),
      props = Object.assign({}, { min: 0, max: 1 }, _props);

  ugen.name = 'bang' + _gen.getUID();

  ugen.min = props.min;
  ugen.max = props.max;

  ugen.trigger = function () {
    _gen.memory.heap[ugen.memory.value.idx] = ugen.max;
  };

  ugen.memory = {
    value: { length: 1, idx: null }
  };

  return ugen;
};
},{"./gen.js":87}],70:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'bool',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = inputs[0] + ' === 0 ? 0 : 1';

    //gen.memo[ this.name ] = `gen.data.${this.name}`

    //return [ `gen.data.${this.name}`, ' ' +out ]
    return out;
  }
};

module.exports = function (in1) {
  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],71:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'ceil',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.ceil));

      out = 'gen.ceil( ' + inputs[0] + ' )';
    } else {
      out = Math.ceil(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var ceil = Object.create(proto);

  ceil.inputs = [x];

  return ceil;
};
},{"./gen.js":87}],72:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    floor = require('./floor.js'),
    sub = require('./sub.js'),
    memo = require('./memo.js');

var proto = {
  basename: 'clip',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        out = void 0;

    out = ' var ' + this.name + ' = ' + inputs[0] + '\n  if( ' + this.name + ' > ' + inputs[2] + ' ) ' + this.name + ' = ' + inputs[2] + '\n  else if( ' + this.name + ' < ' + inputs[1] + ' ) ' + this.name + ' = ' + inputs[1] + '\n';
    out = ' ' + out;

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (in1) {
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    uid: _gen.getUID(),
    inputs: [in1, min, max]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./floor.js":84,"./gen.js":87,"./memo.js":99,"./sub.js":122}],73:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'cos',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'cos': Math.cos });

      out = 'gen.cos( ' + inputs[0] + ' )';
    } else {
      out = Math.cos(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var cos = Object.create(proto);

  cos.inputs = [x];
  cos.id = _gen.getUID();
  cos.name = cos.basename + '{cos.id}';

  return cos;
};
},{"./gen.js":87}],74:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'counter',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        genName = 'gen.' + this.name,
        functionBody = void 0;

    if (this.memory.value.idx === null) _gen.requestMemory(this.memory);
    functionBody = this.callback(genName, inputs[0], inputs[1], inputs[2], inputs[3], inputs[4], 'memory[' + this.memory.value.idx + ']', 'memory[' + this.memory.wrap.idx + ']');

    _gen.closures.add(_defineProperty({}, this.name, this));

    _gen.memo[this.name] = this.name + '_value';

    if (_gen.memo[this.wrap.name] === undefined) this.wrap.gen();

    return [this.name + '_value', functionBody];
  },
  callback: function callback(_name, _incr, _min, _max, _reset, loops, valueRef, wrapRef) {
    var diff = this.max - this.min,
        out = '',
        wrap = '';

    // must check for reset before storing value for output
    if (!(typeof this.inputs[3] === 'number' && this.inputs[3] < 1)) {
      out += '  if( ' + _reset + ' >= 1 ) ' + valueRef + ' = ' + _min + '\n';
    }

    out += '  var ' + this.name + '_value = ' + valueRef + ';\n  ' + valueRef + ' += ' + _incr + '\n'; // store output value before accumulating  

    if (typeof this.max === 'number' && this.max !== Infinity && typeof this.min !== 'number') {
      wrap = '  if( ' + valueRef + ' >= ' + this.max + ' && ' + loops + ' ) {\n    ' + valueRef + ' -= ' + diff + '\n    ' + wrapRef + ' = 1\n  }else{\n    ' + wrapRef + ' = 0\n  }\n';
    } else if (this.max !== Infinity && this.min !== Infinity) {
      wrap = '  if( ' + valueRef + ' >= ' + _max + ' && ' + loops + ' ) {\n    ' + valueRef + ' -= ' + _max + ' - ' + _min + '\n    ' + wrapRef + ' = 1\n  }else if( ' + valueRef + ' < ' + _min + ' && ' + loops + ' ) {\n    ' + valueRef + ' += ' + _max + ' - ' + _min + '\n    ' + wrapRef + ' = 1\n  }else{\n    ' + wrapRef + ' = 0\n  }\n';
    } else {
      out += '\n';
    }

    out = out + wrap;

    return out;
  }
};

module.exports = function () {
  var incr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
  var reset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var loops = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
  var properties = arguments[5];

  var ugen = Object.create(proto),
      defaults = { initialValue: 0, shouldWrap: true };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    min: min,
    max: max,
    value: defaults.initialValue,
    uid: _gen.getUID(),
    inputs: [incr, min, max, reset, loops],
    memory: {
      value: { length: 1, idx: null },
      wrap: { length: 1, idx: null }
    },
    wrap: {
      gen: function gen() {
        if (ugen.memory.wrap.idx === null) {
          _gen.requestMemory(ugen.memory);
        }
        _gen.getInputs(this);
        _gen.memo[this.name] = 'memory[ ' + ugen.memory.wrap.idx + ' ]';
        return 'memory[ ' + ugen.memory.wrap.idx + ' ]';
      }
    }
  }, defaults);

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      if (this.memory.value.idx !== null) {
        return _gen.memory.heap[this.memory.value.idx];
      }
    },
    set: function set(v) {
      if (this.memory.value.idx !== null) {
        _gen.memory.heap[this.memory.value.idx] = v;
      }
    }
  });

  ugen.wrap.inputs = [ugen];
  ugen.name = '' + ugen.basename + ugen.uid;
  ugen.wrap.name = ugen.name + '_wrap';
  return ugen;
};
},{"./gen.js":87}],75:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    accum = require('./phasor.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    mul = require('./mul.js'),
    phasor = require('./phasor.js');

var proto = {
  basename: 'cycle',

  initTable: function initTable() {
    var buffer = new Float32Array(1024);

    for (var i = 0, l = buffer.length; i < l; i++) {
      buffer[i] = Math.sin(i / l * (Math.PI * 2));
    }

    gen.globals.cycle = data(buffer, 1, { immutable: true });
  }
};

module.exports = function () {
  var frequency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var _props = arguments[2];

  if (typeof gen.globals.cycle === 'undefined') proto.initTable();
  var props = Object.assign({}, { min: 0 }, _props);

  var ugen = peek(gen.globals.cycle, phasor(frequency, reset, props));
  ugen.name = 'cycle' + gen.getUID();

  return ugen;
};
},{"./data.js":76,"./gen.js":87,"./mul.js":105,"./peek.js":111,"./phasor.js":112}],76:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    utilities = require('./utilities.js'),
    peek = require('./peek.js'),
    poke = require('./poke.js');

var proto = {
  basename: 'data',
  globals: {},

  gen: function gen() {
    var idx = void 0;
    if (_gen.memo[this.name] === undefined) {
      var ugen = this;
      _gen.requestMemory(this.memory, this.immutable);
      idx = this.memory.values.idx;
      try {
        _gen.memory.heap.set(this.buffer, idx);
      } catch (e) {
        console.log(e);
        throw Error('error with request. asking for ' + this.buffer.length + '. current index: ' + _gen.memoryIndex + ' of ' + _gen.memory.heap.length);
      }
      //gen.data[ this.name ] = this
      //return 'gen.memory' + this.name + '.buffer'
      _gen.memo[this.name] = idx;
    } else {
      idx = _gen.memo[this.name];
    }
    return idx;
  }
};

module.exports = function (x) {
  var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var properties = arguments[2];

  var ugen = void 0,
      buffer = void 0,
      shouldLoad = false;

  if (properties !== undefined && properties.global !== undefined) {
    if (_gen.globals[properties.global]) {
      return _gen.globals[properties.global];
    }
  }

  if (typeof x === 'number') {
    if (y !== 1) {
      buffer = [];
      for (var i = 0; i < y; i++) {
        buffer[i] = new Float32Array(x);
      }
    } else {
      buffer = new Float32Array(x);
    }
  } else if (Array.isArray(x)) {
    //! (x instanceof Float32Array ) ) {
    var size = x.length;
    buffer = new Float32Array(size);
    for (var _i = 0; _i < x.length; _i++) {
      buffer[_i] = x[_i];
    }
  } else if (typeof x === 'string') {
    buffer = { length: y > 1 ? y : _gen.samplerate * 60 // XXX what???
    };shouldLoad = true;
  } else if (x instanceof Float32Array) {
    buffer = x;
  }

  ugen = {
    buffer: buffer,
    name: proto.basename + _gen.getUID(),
    dim: buffer.length, // XXX how do we dynamically allocate this?
    channels: 1,
    gen: proto.gen,
    onload: null,
    then: function then(fnc) {
      ugen.onload = fnc;
      return ugen;
    },

    immutable: properties !== undefined && properties.immutable === true ? true : false,
    load: function load(filename) {
      var promise = utilities.loadSample(filename, ugen);
      promise.then(function (_buffer) {
        ugen.memory.values.length = ugen.dim = _buffer.length;
        ugen.onload();
      });
    }
  };

  ugen.memory = {
    values: { length: ugen.dim, idx: null }
  };

  _gen.name = 'data' + _gen.getUID();

  if (shouldLoad) ugen.load(x);

  if (properties !== undefined) {
    if (properties.global !== undefined) {
      _gen.globals[properties.global] = ugen;
    }
    if (properties.meta === true) {
      var _loop = function _loop(length, _i2) {
        Object.defineProperty(ugen, _i2, {
          get: function get() {
            return peek(ugen, _i2, { mode: 'simple', interp: 'none' });
          },
          set: function set(v) {
            return poke(ugen, v, _i2);
          }
        });
      };

      for (var _i2 = 0, length = ugen.buffer.length; _i2 < length; _i2++) {
        _loop(length, _i2);
      }
    }
  }

  return ugen;
};
},{"./gen.js":87,"./peek.js":111,"./poke.js":113,"./utilities.js":128}],77:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js');

module.exports = function (in1) {
    var x1 = history(),
        y1 = history(),
        filter = void 0;

    //History x1, y1; y = in1 - x1 + y1*0.9997; x1 = in1; y1 = y; out1 = y;
    filter = memo(add(sub(in1, x1.out), mul(y1.out, .9997)));
    x1.in(in1);
    y1.in(filter);

    return filter;
};
},{"./add.js":63,"./gen.js":87,"./history.js":91,"./memo.js":99,"./mul.js":105,"./sub.js":122}],78:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    mul = require('./mul.js'),
    t60 = require('./t60.js');

module.exports = function () {
    var decayTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 44100;
    var props = arguments[1];

    var properties = Object.assign({}, { initValue: 1 }, props),
        ssd = history(properties.initValue);

    ssd.in(mul(ssd.out, t60(decayTime)));

    ssd.out.trigger = function () {
        ssd.value = 1;
    };

    return ssd.out;
};
},{"./gen.js":87,"./history.js":91,"./mul.js":105,"./t60.js":124}],79:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    data = require('./data.js'),
    poke = require('./poke.js'),
    peek = require('./peek.js'),
    sub = require('./sub.js'),
    wrap = require('./wrap.js'),
    accum = require('./accum.js');

var proto = {
  basename: 'delay',

  gen: function gen() {
    var inputs = _gen.getInputs(this);

    _gen.memo[this.name] = inputs[0];

    return inputs[0];
  }
};

module.exports = function (in1) {
  for (var _len = arguments.length, tapsAndProperties = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    tapsAndProperties[_key - 2] = arguments[_key];
  }

  var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 256;

  var ugen = Object.create(proto),
      defaults = { size: 512, feedback: 0, interp: 'linear' },
      writeIdx = void 0,
      readIdx = void 0,
      delaydata = void 0,
      properties = void 0,
      tapTimes = [time],
      taps = void 0;

  if (Array.isArray(tapsAndProperties)) {
    properties = tapsAndProperties[tapsAndProperties.length - 1];
    if (tapsAndProperties.length > 1) {
      for (var i = 0; i < tapsAndProperties.length - 1; i++) {
        tapTimes.push(tapsAndProperties[i]);
      }
    }
  } else {
    properties = tapsAndProperties;
  }

  if (properties !== undefined) Object.assign(defaults, properties);

  if (defaults.size < time) defaults.size = time;

  delaydata = data(defaults.size);

  ugen.inputs = [];

  writeIdx = accum(1, 0, { max: defaults.size });

  for (var _i = 0; _i < tapTimes.length; _i++) {
    ugen.inputs[_i] = peek(delaydata, wrap(sub(writeIdx, tapTimes[_i]), 0, defaults.size), { mode: 'samples', interp: defaults.interp });
  }

  ugen.outputs = ugen.inputs; // ugn, Ugh, UGH! but i guess it works.

  poke(delaydata, in1, writeIdx);

  ugen.name = '' + ugen.basename + _gen.getUID();

  return ugen;
};
},{"./accum.js":60,"./data.js":76,"./gen.js":87,"./peek.js":111,"./poke.js":113,"./sub.js":122,"./wrap.js":130}],80:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js');

module.exports = function (in1) {
  var n1 = history();

  n1.in(in1);

  var ugen = sub(in1, n1.out);
  ugen.name = 'delta' + gen.getUID();

  return ugen;
};
},{"./gen.js":87,"./history.js":91,"./sub.js":122}],81:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var div = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          diff = 0,
          numCount = 0,
          lastNumber = inputs[0],
          lastNumberIsUgen = isNaN(lastNumber),
          divAtEnd = false;

      inputs.forEach(function (v, i) {
        if (i === 0) return;

        var isNumberUgen = isNaN(v),
            isFinalIdx = i === inputs.length - 1;

        if (!lastNumberIsUgen && !isNumberUgen) {
          lastNumber = lastNumber / v;
          out += lastNumber;
        } else {
          out += lastNumber + ' / ' + v;
        }

        if (!isFinalIdx) out += ' / ';
      });

      out += ')';

      return out;
    }
  };

  return div;
};
},{"./gen.js":87}],82:[function(require,module,exports){
'use strict';

var gen = require('./gen'),
    windows = require('./windows'),
    data = require('./data'),
    peek = require('./peek'),
    phasor = require('./phasor'),
    defaults = {
  type: 'triangular', length: 1024, alpha: .15, shift: 0
};

module.exports = function (props) {
  var properties = Object.assign({}, defaults, props);
  var buffer = new Float32Array(properties.length);

  var name = properties.type + '_' + properties.length + '_' + properties.shift;
  if (typeof gen.globals.windows[name] === 'undefined') {

    for (var i = 0; i < properties.length; i++) {
      buffer[i] = windows[properties.type](properties.length, i, properties.alpha, properties.shift);
    }

    gen.globals.windows[name] = data(buffer);
  }

  var ugen = gen.globals.windows[name];
  ugen.name = 'env' + gen.getUID();

  return ugen;
};
},{"./data":76,"./gen":87,"./peek":111,"./phasor":112,"./windows":129}],83:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'eq',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = this.inputs[0] === this.inputs[1] ? 1 : '  var ' + this.name + ' = (' + inputs[0] + ' === ' + inputs[1] + ') | 0\n\n';

    _gen.memo[this.name] = '' + this.name;

    return ['' + this.name, out];
  }
};

module.exports = function (in1, in2) {
  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],84:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'floor',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      //gen.closures.add({ [ this.name ]: Math.floor })

      out = '( ' + inputs[0] + ' | 0 )';
    } else {
      out = inputs[0] | 0;
    }

    return out;
  }
};

module.exports = function (x) {
  var floor = Object.create(proto);

  floor.inputs = [x];

  return floor;
};
},{"./gen.js":87}],85:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'fold',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        out = void 0;

    out = this.createCallback(inputs[0], this.min, this.max);

    _gen.memo[this.name] = this.name + '_value';

    return [this.name + '_value', out];
  },
  createCallback: function createCallback(v, lo, hi) {
    var out = ' var ' + this.name + '_value = ' + v + ',\n      ' + this.name + '_range = ' + hi + ' - ' + lo + ',\n      ' + this.name + '_numWraps = 0\n\n  if(' + this.name + '_value >= ' + hi + '){\n    ' + this.name + '_value -= ' + this.name + '_range\n    if(' + this.name + '_value >= ' + hi + '){\n      ' + this.name + '_numWraps = ((' + this.name + '_value - ' + lo + ') / ' + this.name + '_range) | 0\n      ' + this.name + '_value -= ' + this.name + '_range * ' + this.name + '_numWraps\n    }\n    ' + this.name + '_numWraps++\n  } else if(' + this.name + '_value < ' + lo + '){\n    ' + this.name + '_value += ' + this.name + '_range\n    if(' + this.name + '_value < ' + lo + '){\n      ' + this.name + '_numWraps = ((' + this.name + '_value - ' + lo + ') / ' + this.name + '_range- 1) | 0\n      ' + this.name + '_value -= ' + this.name + '_range * ' + this.name + '_numWraps\n    }\n    ' + this.name + '_numWraps--\n  }\n  if(' + this.name + '_numWraps & 1) ' + this.name + '_value = ' + hi + ' + ' + lo + ' - ' + this.name + '_value\n';
    return ' ' + out;
  }
};

module.exports = function (in1) {
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    uid: _gen.getUID(),
    inputs: [in1]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],86:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _gen = require('./gen.js');

var proto = {
  basename: 'gate',
  controlString: null, // insert into output codegen for determining indexing
  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    _gen.requestMemory(this.memory);

    var lastInputMemoryIdx = 'memory[ ' + this.memory.lastInput.idx + ' ]',
        outputMemoryStartIdx = this.memory.lastInput.idx + 1,
        inputSignal = inputs[0],
        controlSignal = inputs[1];

    /* 
     * we check to see if the current control inputs equals our last input
     * if so, we store the signal input in the memory associated with the currently
     * selected index. If not, we put 0 in the memory associated with the last selected index,
     * change the selected index, and then store the signal in put in the memery assoicated
     * with the newly selected index
     */

    out = ' if( ' + controlSignal + ' !== ' + lastInputMemoryIdx + ' ) {\n    memory[ ' + lastInputMemoryIdx + ' + ' + outputMemoryStartIdx + '  ] = 0 \n    ' + lastInputMemoryIdx + ' = ' + controlSignal + '\n  }\n  memory[ ' + outputMemoryStartIdx + ' + ' + controlSignal + ' ] = ' + inputSignal + '\n\n';
    this.controlString = inputs[1];
    this.initialized = true;

    _gen.memo[this.name] = this.name;

    this.outputs.forEach(function (v) {
      return v.gen();
    });

    return [null, ' ' + out];
  },
  childgen: function childgen() {
    if (this.parent.initialized === false) {
      _gen.getInputs(this // parent gate is only input of a gate output, should only be gen'd once.
      );
    }

    if (_gen.memo[this.name] === undefined) {
      _gen.requestMemory(this.memory);

      _gen.memo[this.name] = 'memory[ ' + this.memory.value.idx + ' ]';
    }

    return 'memory[ ' + this.memory.value.idx + ' ]';
  }
};

module.exports = function (control, in1, properties) {
  var ugen = Object.create(proto),
      defaults = { count: 2 };

  if ((typeof properties === 'undefined' ? 'undefined' : _typeof(properties)) !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    outputs: [],
    uid: _gen.getUID(),
    inputs: [in1, control],
    memory: {
      lastInput: { length: 1, idx: null }
    },
    initialized: false
  }, defaults);

  ugen.name = '' + ugen.basename + _gen.getUID();

  for (var i = 0; i < ugen.count; i++) {
    ugen.outputs.push({
      index: i,
      gen: proto.childgen,
      parent: ugen,
      inputs: [ugen],
      memory: {
        value: { length: 1, idx: null }
      },
      initialized: false,
      name: ugen.name + '_out' + _gen.getUID()
    });
  }

  return ugen;
};
},{"./gen.js":87}],87:[function(require,module,exports){
'use strict';

/* gen.js
 *
 * low-level code generation for unit generators
 *
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var MemoryHelper = require('memory-helper');

var gen = {

  accum: 0,
  getUID: function getUID() {
    return this.accum++;
  },

  debug: false,
  samplerate: 44100, // change on audiocontext creation
  shouldLocalize: false,
  globals: {
    windows: {}
  },

  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
   */

  closures: new Set(),
  params: new Set(),

  parameters: [],
  endBlock: new Set(),
  histories: new Map(),

  memo: {},

  data: {},

  /* export
   *
   * place gen functions into another object for easier reference
   */

  export: function _export(obj) {},
  addToEndBlock: function addToEndBlock(v) {
    this.endBlock.add('  ' + v);
  },
  requestMemory: function requestMemory(memorySpec) {
    var immutable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    for (var key in memorySpec) {
      var request = memorySpec[key];

      request.idx = gen.memory.alloc(request.length, immutable);
    }
  },


  /* createCallback
   *
   * param ugen - Head of graph to be codegen'd
   *
   * Generate callback function for a particular ugen graph.
   * The gen.closures property stores functions that need to be
   * passed as arguments to the final function; these are prefixed
   * before any defined params the graph exposes. For example, given:
   *
   * gen.createCallback( abs( param() ) )
   *
   * ... the generated function will have a signature of ( abs, p0 ).
   */

  createCallback: function createCallback(ugen, mem) {
    var debug = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var shouldInlineMemory = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    var isStereo = Array.isArray(ugen) && ugen.length > 1,
        callback = void 0,
        channel1 = void 0,
        channel2 = void 0;

    if (typeof mem === 'number' || mem === undefined) {
      mem = MemoryHelper.create(mem);
    }

    //console.log( 'cb memory:', mem )
    this.memory = mem;
    this.memo = {};
    this.endBlock.clear();
    this.closures.clear();
    this.params.clear
    //this.globals = { windows:{} }

    ();this.parameters.length = 0;

    this.functionBody = "  'use strict'\n";
    if (shouldInlineMemory === false) this.functionBody += "  var memory = gen.memory\n\n";

    // call .gen() on the head of the graph we are generating the callback for
    //console.log( 'HEAD', ugen )
    for (var i = 0; i < 1 + isStereo; i++) {
      if (typeof ugen[i] === 'number') continue;

      var channel = isStereo ? ugen[i].gen() : ugen.gen(),
          body = '';

      // if .gen() returns array, add ugen callback (graphOutput[1]) to our output functions body
      // and then return name of ugen. If .gen() only generates a number (for really simple graphs)
      // just return that number (graphOutput[0]).
      body += Array.isArray(channel) ? channel[1] + '\n' + channel[0] : channel;

      // split body to inject return keyword on last line
      body = body.split('\n'

      //if( debug ) console.log( 'functionBody length', body )

      // next line is to accommodate memo as graph head
      );if (body[body.length - 1].trim().indexOf('let') > -1) {
        body.push('\n');
      }

      // get index of last line
      var lastidx = body.length - 1;

      // insert return keyword
      body[lastidx] = '  gen.out[' + i + ']  = ' + body[lastidx] + '\n';

      this.functionBody += body.join('\n');
    }

    this.histories.forEach(function (value) {
      if (value !== null) value.gen();
    });

    var returnStatement = isStereo ? '  return gen.out' : '  return gen.out[0]';

    this.functionBody = this.functionBody.split('\n');

    if (this.endBlock.size) {
      this.functionBody = this.functionBody.concat(Array.from(this.endBlock));
      this.functionBody.push(returnStatement);
    } else {
      this.functionBody.push(returnStatement);
    }
    // reassemble function body
    this.functionBody = this.functionBody.join('\n'

    // we can only dynamically create a named function by dynamically creating another function
    // to construct the named function! sheesh...
    //
    );if (shouldInlineMemory === true) {
      this.parameters.push('memory');
    }
    var buildString = 'return function gen( ' + this.parameters.join(',') + ' ){ \n' + this.functionBody + '\n}';

    if (this.debug || debug) console.log(buildString);

    callback = new Function(buildString)

    // assign properties to named function
    ();var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.closures.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var dict = _step.value;

        var name = Object.keys(dict)[0],
            value = dict[name];

        callback[name] = value;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      var _loop = function _loop() {
        var dict = _step2.value;

        var name = Object.keys(dict)[0],
            ugen = dict[name];

        Object.defineProperty(callback, name, {
          configurable: true,
          get: function get() {
            return ugen.value;
          },
          set: function set(v) {
            ugen.value = v;
          }
        }
        //callback[ name ] = value
        );
      };

      for (var _iterator2 = this.params.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    callback.data = this.data;
    callback.out = new Float32Array(2);
    callback.parameters = this.parameters.slice(0

    //if( MemoryHelper.isPrototypeOf( this.memory ) ) 
    );callback.memory = this.memory.heap;

    this.histories.clear();

    return callback;
  },


  /* getInputs
   *
   * Given an argument ugen, extract its inputs. If they are numbers, return the numebrs. If
   * they are ugens, call .gen() on the ugen, memoize the result and return the result. If the
   * ugen has previously been memoized return the memoized value.
   *
   */
  getInputs: function getInputs(ugen) {
    return ugen.inputs.map(gen.getInput);
  },
  getInput: function getInput(input) {
    var isObject = (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object',
        processedInput = void 0;

    if (isObject) {
      // if input is a ugen... 
      if (gen.memo[input.name]) {
        // if it has been memoized...
        processedInput = gen.memo[input.name];
      } else if (Array.isArray(input)) {
        gen.getInput(input[0]);
        gen.getInput(input[1]);
      } else {
        // if not memoized generate code  
        if (typeof input.gen !== 'function') {
          console.log('no gen found:', input, input.gen);
        }
        var code = input.gen
        //if( code.indexOf( 'Object' ) > -1 ) console.log( 'bad input:', input, code )

        ();if (Array.isArray(code)) {
          if (!gen.shouldLocalize) {
            gen.functionBody += code[1];
          } else {
            gen.codeName = code[0];
            gen.localizedCode.push(code[1]);
          }
          //console.log( 'after GEN' , this.functionBody )
          processedInput = code[0];
        } else {
          processedInput = code;
        }
      }
    } else {
      // it input is a number
      processedInput = input;
    }

    return processedInput;
  },
  startLocalize: function startLocalize() {
    this.localizedCode = [];
    this.shouldLocalize = true;
  },
  endLocalize: function endLocalize() {
    this.shouldLocalize = false;

    return [this.codeName, this.localizedCode.slice(0)];
  },
  free: function free(graph) {
    if (Array.isArray(graph)) {
      // stereo ugen
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = graph[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var channel = _step3.value;

          this.free(channel);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    } else {
      if ((typeof graph === 'undefined' ? 'undefined' : _typeof(graph)) === 'object') {
        if (graph.memory !== undefined) {
          for (var memoryKey in graph.memory) {
            this.memory.free(graph.memory[memoryKey].idx);
          }
        }
        if (Array.isArray(graph.inputs)) {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = graph.inputs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var ugen = _step4.value;

              this.free(ugen);
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        }
      }
    }
  }
};

module.exports = gen;
},{"memory-helper":131}],88:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gt',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '(( ' + inputs[0] + ' > ' + inputs[1] + ') | 0 )';
    } else {
      out += inputs[0] > inputs[1] ? 1 : 0;
    }
    out += '\n\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (x, y) {
  var gt = Object.create(proto);

  gt.inputs = [x, y];
  gt.name = 'gt' + _gen.getUID();

  return gt;
};
},{"./gen.js":87}],89:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gte',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '( ' + inputs[0] + ' >= ' + inputs[1] + ' | 0 )';
    } else {
      out += inputs[0] >= inputs[1] ? 1 : 0;
    }
    out += '\n\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (x, y) {
  var gt = Object.create(proto);

  gt.inputs = [x, y];
  gt.name = 'gte' + _gen.getUID();

  return gt;
};
},{"./gen.js":87}],90:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gtp',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out = '(' + inputs[0] + ' * ( ( ' + inputs[0] + ' > ' + inputs[1] + ' ) | 0 ) )';
    } else {
      out = inputs[0] * (inputs[0] > inputs[1] | 0);
    }

    return out;
  }
};

module.exports = function (x, y) {
  var gtp = Object.create(proto);

  gtp.inputs = [x, y];

  return gtp;
};
},{"./gen.js":87}],91:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  var in1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  var ugen = {
    inputs: [in1],
    memory: { value: { length: 1, idx: null } },
    recorder: null,

    in: function _in(v) {
      if (_gen.histories.has(v)) {
        var memoHistory = _gen.histories.get(v);
        ugen.name = memoHistory.name;
        return memoHistory;
      }

      var obj = {
        gen: function gen() {
          var inputs = _gen.getInputs(ugen);

          if (ugen.memory.value.idx === null) {
            _gen.requestMemory(ugen.memory);
            _gen.memory.heap[ugen.memory.value.idx] = in1;
          }

          var idx = ugen.memory.value.idx;

          _gen.addToEndBlock('memory[ ' + idx + ' ] = ' + inputs[0]

          // return ugen that is being recorded instead of ssd.
          // this effectively makes a call to ssd.record() transparent to the graph.
          // recording is triggered by prior call to gen.addToEndBlock.
          );_gen.histories.set(v, obj);

          return inputs[0];
        },

        name: ugen.name + '_in' + _gen.getUID(),
        memory: ugen.memory
      };

      this.inputs[0] = v;

      ugen.recorder = obj;

      return obj;
    },


    out: {
      gen: function gen() {
        if (ugen.memory.value.idx === null) {
          if (_gen.histories.get(ugen.inputs[0]) === undefined) {
            _gen.histories.set(ugen.inputs[0], ugen.recorder);
          }
          _gen.requestMemory(ugen.memory);
          _gen.memory.heap[ugen.memory.value.idx] = parseFloat(in1);
        }
        var idx = ugen.memory.value.idx;

        return 'memory[ ' + idx + ' ] ';
      }
    },

    uid: _gen.getUID()
  };

  ugen.out.memory = ugen.memory;

  ugen.name = 'history' + ugen.uid;
  ugen.out.name = ugen.name + '_out';
  ugen.in._name = ugen.name = '_in';

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      if (this.memory.value.idx !== null) {
        return _gen.memory.heap[this.memory.value.idx];
      }
    },
    set: function set(v) {
      if (this.memory.value.idx !== null) {
        _gen.memory.heap[this.memory.value.idx] = v;
      }
    }
  });

  return ugen;
};
},{"./gen.js":87}],92:[function(require,module,exports){
/*

 a = conditional( condition, trueBlock, falseBlock )
 b = conditional([
   condition1, block1,
   condition2, block2,
   condition3, block3,
   defaultBlock
 ])

*/
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'ifelse',

  gen: function gen() {
    var conditionals = this.inputs[0],
        defaultValue = _gen.getInput(conditionals[conditionals.length - 1]),
        out = '  var ' + this.name + '_out = ' + defaultValue + '\n';

    //console.log( 'defaultValue:', defaultValue )

    for (var i = 0; i < conditionals.length - 2; i += 2) {
      var isEndBlock = i === conditionals.length - 3,
          cond = _gen.getInput(conditionals[i]),
          preblock = conditionals[i + 1],
          block = void 0,
          blockName = void 0,
          output = void 0;

      //console.log( 'pb', preblock )

      if (typeof preblock === 'number') {
        block = preblock;
        blockName = null;
      } else {
        if (_gen.memo[preblock.name] === undefined) {
          // used to place all code dependencies in appropriate blocks
          _gen.startLocalize();

          _gen.getInput(preblock);

          block = _gen.endLocalize();
          blockName = block[0];
          block = block[1].join('');
          block = '  ' + block.replace(/\n/gi, '\n  ');
        } else {
          block = '';
          blockName = _gen.memo[preblock.name];
        }
      }

      output = blockName === null ? '  ' + this.name + '_out = ' + block : block + '  ' + this.name + '_out = ' + blockName;

      if (i === 0) out += ' ';
      out += ' if( ' + cond + ' === 1 ) {\n' + output + '\n  }';

      if (!isEndBlock) {
        out += ' else';
      } else {
        out += '\n';
      }
      /*         
       else`
            }else if( isEndBlock ) {
              out += `{\n  ${output}\n  }\n`
            }else {
      
              //if( i + 2 === conditionals.length || i === conditionals.length - 1 ) {
              //  out += `{\n  ${output}\n  }\n`
              //}else{
                out += 
      ` if( ${cond} === 1 ) {
      ${output}
        } else `
              //}
            }*/
    }

    _gen.memo[this.name] = this.name + '_out';

    return [this.name + '_out', out];
  }
};

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var ugen = Object.create(proto),
      conditions = Array.isArray(args[0]) ? args[0] : args;

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [conditions]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],93:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'in',

  gen: function gen() {
    _gen.parameters.push(this.name);

    _gen.memo[this.name] = this.name;

    return this.name;
  }
};

module.exports = function (name) {
  var input = Object.create(proto);

  input.id = _gen.getUID();
  input.name = name !== undefined ? name : '' + input.basename + input.id;
  input[0] = {
    gen: function gen() {
      if (!_gen.parameters.includes(input.name)) _gen.parameters.push(input.name);
      return input.name + '[0]';
    }
  };
  input[1] = {
    gen: function gen() {
      if (!_gen.parameters.includes(input.name)) _gen.parameters.push(input.name);
      return input.name + '[1]';
    }
  };

  return input;
};
},{"./gen.js":87}],94:[function(require,module,exports){
'use strict';

var library = {
  export: function _export(destination) {
    if (destination === window) {
      destination.ssd = library.history; // history is window object property, so use ssd as alias
      destination.input = library.in; // in is a keyword in javascript
      destination.ternary = library.switch; // switch is a keyword in javascript

      delete library.history;
      delete library.in;
      delete library.switch;
    }

    Object.assign(destination, library);

    Object.defineProperty(library, 'samplerate', {
      get: function get() {
        return library.gen.samplerate;
      },
      set: function set(v) {}
    });

    library.in = destination.input;
    library.history = destination.ssd;
    library.switch = destination.ternary;

    destination.clip = library.clamp;
  },


  gen: require('./gen.js'),

  abs: require('./abs.js'),
  round: require('./round.js'),
  param: require('./param.js'),
  add: require('./add.js'),
  sub: require('./sub.js'),
  mul: require('./mul.js'),
  div: require('./div.js'),
  accum: require('./accum.js'),
  counter: require('./counter.js'),
  sin: require('./sin.js'),
  cos: require('./cos.js'),
  tan: require('./tan.js'),
  tanh: require('./tanh.js'),
  asin: require('./asin.js'),
  acos: require('./acos.js'),
  atan: require('./atan.js'),
  phasor: require('./phasor.js'),
  data: require('./data.js'),
  peek: require('./peek.js'),
  cycle: require('./cycle.js'),
  history: require('./history.js'),
  delta: require('./delta.js'),
  floor: require('./floor.js'),
  ceil: require('./ceil.js'),
  min: require('./min.js'),
  max: require('./max.js'),
  sign: require('./sign.js'),
  dcblock: require('./dcblock.js'),
  memo: require('./memo.js'),
  rate: require('./rate.js'),
  wrap: require('./wrap.js'),
  mix: require('./mix.js'),
  clamp: require('./clamp.js'),
  poke: require('./poke.js'),
  delay: require('./delay.js'),
  fold: require('./fold.js'),
  mod: require('./mod.js'),
  sah: require('./sah.js'),
  noise: require('./noise.js'),
  not: require('./not.js'),
  gt: require('./gt.js'),
  gte: require('./gte.js'),
  lt: require('./lt.js'),
  lte: require('./lte.js'),
  bool: require('./bool.js'),
  gate: require('./gate.js'),
  train: require('./train.js'),
  slide: require('./slide.js'),
  in: require('./in.js'),
  t60: require('./t60.js'),
  mtof: require('./mtof.js'),
  ltp: require('./ltp.js'), // TODO: test
  gtp: require('./gtp.js'), // TODO: test
  switch: require('./switch.js'),
  mstosamps: require('./mstosamps.js'), // TODO: needs test,
  selector: require('./selector.js'),
  utilities: require('./utilities.js'),
  pow: require('./pow.js'),
  attack: require('./attack.js'),
  decay: require('./decay.js'),
  windows: require('./windows.js'),
  env: require('./env.js'),
  ad: require('./ad.js'),
  adsr: require('./adsr.js'),
  ifelse: require('./ifelseif.js'),
  bang: require('./bang.js'),
  and: require('./and.js'),
  pan: require('./pan.js'),
  eq: require('./eq.js'),
  neq: require('./neq.js')
};

library.gen.lib = library;

module.exports = library;
},{"./abs.js":59,"./accum.js":60,"./acos.js":61,"./ad.js":62,"./add.js":63,"./adsr.js":64,"./and.js":65,"./asin.js":66,"./atan.js":67,"./attack.js":68,"./bang.js":69,"./bool.js":70,"./ceil.js":71,"./clamp.js":72,"./cos.js":73,"./counter.js":74,"./cycle.js":75,"./data.js":76,"./dcblock.js":77,"./decay.js":78,"./delay.js":79,"./delta.js":80,"./div.js":81,"./env.js":82,"./eq.js":83,"./floor.js":84,"./fold.js":85,"./gate.js":86,"./gen.js":87,"./gt.js":88,"./gte.js":89,"./gtp.js":90,"./history.js":91,"./ifelseif.js":92,"./in.js":93,"./lt.js":95,"./lte.js":96,"./ltp.js":97,"./max.js":98,"./memo.js":99,"./min.js":100,"./mix.js":101,"./mod.js":102,"./mstosamps.js":103,"./mtof.js":104,"./mul.js":105,"./neq.js":106,"./noise.js":107,"./not.js":108,"./pan.js":109,"./param.js":110,"./peek.js":111,"./phasor.js":112,"./poke.js":113,"./pow.js":114,"./rate.js":115,"./round.js":116,"./sah.js":117,"./selector.js":118,"./sign.js":119,"./sin.js":120,"./slide.js":121,"./sub.js":122,"./switch.js":123,"./t60.js":124,"./tan.js":125,"./tanh.js":126,"./train.js":127,"./utilities.js":128,"./windows.js":129,"./wrap.js":130}],95:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'lt',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '(( ' + inputs[0] + ' < ' + inputs[1] + ') | 0  )';
    } else {
      out += inputs[0] < inputs[1] ? 1 : 0;
    }
    out += '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];

    return out;
  }
};

module.exports = function (x, y) {
  var lt = Object.create(proto);

  lt.inputs = [x, y];
  lt.name = 'lt' + _gen.getUID();

  return lt;
};
},{"./gen.js":87}],96:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'lte',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '( ' + inputs[0] + ' <= ' + inputs[1] + ' | 0  )';
    } else {
      out += inputs[0] <= inputs[1] ? 1 : 0;
    }
    out += '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];

    return out;
  }
};

module.exports = function (x, y) {
  var lt = Object.create(proto);

  lt.inputs = [x, y];
  lt.name = 'lte' + _gen.getUID();

  return lt;
};
},{"./gen.js":87}],97:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'ltp',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out = '(' + inputs[0] + ' * (( ' + inputs[0] + ' < ' + inputs[1] + ' ) | 0 ) )';
    } else {
      out = inputs[0] * (inputs[0] < inputs[1] | 0);
    }

    return out;
  }
};

module.exports = function (x, y) {
  var ltp = Object.create(proto);

  ltp.inputs = [x, y];

  return ltp;
};
},{"./gen.js":87}],98:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'max',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.max));

      out = 'gen.max( ' + inputs[0] + ', ' + inputs[1] + ' )';
    } else {
      out = Math.max(parseFloat(inputs[0]), parseFloat(inputs[1]));
    }

    return out;
  }
};

module.exports = function (x, y) {
  var max = Object.create(proto);

  max.inputs = [x, y];

  return max;
};
},{"./gen.js":87}],99:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'memo',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ' + inputs[0] + '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (in1, memoName) {
  var memo = Object.create(proto);

  memo.inputs = [in1];
  memo.id = _gen.getUID();
  memo.name = memoName !== undefined ? memoName + '_' + _gen.getUID() : '' + memo.basename + memo.id;

  return memo;
};
},{"./gen.js":87}],100:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'min',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.min));

      out = 'gen.min( ' + inputs[0] + ', ' + inputs[1] + ' )';
    } else {
      out = Math.min(parseFloat(inputs[0]), parseFloat(inputs[1]));
    }

    return out;
  }
};

module.exports = function (x, y) {
  var min = Object.create(proto);

  min.inputs = [x, y];

  return min;
};
},{"./gen.js":87}],101:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    memo = require('./memo.js');

module.exports = function (in1, in2) {
    var t = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : .5;

    var ugen = memo(add(mul(in1, sub(1, t)), mul(in2, t)));
    ugen.name = 'mix' + gen.getUID();

    return ugen;
};
},{"./add.js":63,"./gen.js":87,"./memo.js":99,"./mul.js":105,"./sub.js":122}],102:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var mod = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          diff = 0,
          numCount = 0,
          lastNumber = inputs[0],
          lastNumberIsUgen = isNaN(lastNumber),
          modAtEnd = false;

      inputs.forEach(function (v, i) {
        if (i === 0) return;

        var isNumberUgen = isNaN(v),
            isFinalIdx = i === inputs.length - 1;

        if (!lastNumberIsUgen && !isNumberUgen) {
          lastNumber = lastNumber % v;
          out += lastNumber;
        } else {
          out += lastNumber + ' % ' + v;
        }

        if (!isFinalIdx) out += ' % ';
      });

      out += ')';

      return out;
    }
  };

  return mod;
};
},{"./gen.js":87}],103:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'mstosamps',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this),
        returnValue = void 0;

    if (isNaN(inputs[0])) {
      out = '  var ' + this.name + ' = ' + _gen.samplerate + ' / 1000 * ' + inputs[0] + ' \n\n';

      _gen.memo[this.name] = out;

      returnValue = [this.name, out];
    } else {
      out = _gen.samplerate / 1000 * this.inputs[0];

      returnValue = out;
    }

    return returnValue;
  }
};

module.exports = function (x) {
  var mstosamps = Object.create(proto);

  mstosamps.inputs = [x];
  mstosamps.name = proto.basename + _gen.getUID();

  return mstosamps;
};
},{"./gen.js":87}],104:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'mtof',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.exp));

      out = '( ' + this.tuning + ' * gen.exp( .057762265 * (' + inputs[0] + ' - 69) ) )';
    } else {
      out = this.tuning * Math.exp(.057762265 * (inputs[0] - 69));
    }

    return out;
  }
};

module.exports = function (x, props) {
  var ugen = Object.create(proto),
      defaults = { tuning: 440 };

  if (props !== undefined) Object.assign(props.defaults);

  Object.assign(ugen, defaults);
  ugen.inputs = [x];

  return ugen;
};
},{"./gen.js":87}],105:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var mul = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          sum = 1,
          numCount = 0,
          mulAtEnd = false,
          alreadyFullSummed = true;

      inputs.forEach(function (v, i) {
        if (isNaN(v)) {
          out += v;
          if (i < inputs.length - 1) {
            mulAtEnd = true;
            out += ' * ';
          }
          alreadyFullSummed = false;
        } else {
          if (i === 0) {
            sum = v;
          } else {
            sum *= parseFloat(v);
          }
          numCount++;
        }
      });

      if (alreadyFullSummed) out = '';

      if (numCount > 0) {
        out += mulAtEnd || alreadyFullSummed ? sum : ' * ' + sum;
      }

      if (!alreadyFullSummed) out += ')';

      return out;
    }
  };

  return mul;
};
},{"./gen.js":87}],106:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'neq',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = /*this.inputs[0] !== this.inputs[1] ? 1 :*/'  var ' + this.name + ' = (' + inputs[0] + ' !== ' + inputs[1] + ') | 0\n\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (in1, in2) {
  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],107:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'noise',

  gen: function gen() {
    var out = void 0;

    _gen.closures.add({ 'noise': Math.random });

    out = '  var ' + this.name + ' = gen.noise()\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (x) {
  var noise = Object.create(proto);
  noise.name = proto.name + _gen.getUID();

  return noise;
};
},{"./gen.js":87}],108:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'not',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0])) {
      out = '( ' + inputs[0] + ' === 0 ? 1 : 0 )';
    } else {
      out = !inputs[0] === 0 ? 1 : 0;
    }

    return out;
  }
};

module.exports = function (x) {
  var not = Object.create(proto);

  not.inputs = [x];

  return not;
};
},{"./gen.js":87}],109:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    mul = require('./mul.js');

var proto = {
  basename: 'pan',
  initTable: function initTable() {
    var bufferL = new Float32Array(1024),
        bufferR = new Float32Array(1024);

    var sqrtTwoOverTwo = Math.sqrt(2) / 2;

    for (var i = 0; i < 1024; i++) {
      var pan = -1 + i / 1024 * 2;
      bufferL[i] = sqrtTwoOverTwo * (Math.cos(pan) - Math.sin(pan));
      bufferR[i] = sqrtTwoOverTwo * (Math.cos(pan) + Math.sin(pan));
    }

    gen.globals.panL = data(bufferL, 1, { immutable: true });
    gen.globals.panR = data(bufferR, 1, { immutable: true });
  }
};

module.exports = function (leftInput, rightInput) {
  var pan = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : .5;
  var properties = arguments[3];

  if (gen.globals.panL === undefined) proto.initTable();

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: gen.getUID(),
    inputs: [leftInput, rightInput],
    left: mul(leftInput, peek(gen.globals.panL, pan, { boundmode: 'clamp' })),
    right: mul(rightInput, peek(gen.globals.panR, pan, { boundmode: 'clamp' }))
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./data.js":76,"./gen.js":87,"./mul.js":105,"./peek.js":111}],110:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'param',

  gen: function gen() {
    _gen.requestMemory(this.memory);

    _gen.params.add(_defineProperty({}, this.name, this));

    this.value = this.initialValue;

    _gen.memo[this.name] = 'memory[' + this.memory.value.idx + ']';

    return _gen.memo[this.name];
  }
};

module.exports = function () {
  var propName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  var ugen = Object.create(proto);

  if (typeof propName !== 'string') {
    ugen.name = ugen.basename + _gen.getUID();
    ugen.initialValue = propName;
  } else {
    ugen.name = propName;
    ugen.initialValue = value;
  }

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      if (this.memory.value.idx !== null) {
        return _gen.memory.heap[this.memory.value.idx];
      }
    },
    set: function set(v) {
      if (this.memory.value.idx !== null) {
        _gen.memory.heap[this.memory.value.idx] = v;
      }
    }
  });

  ugen.memory = {
    value: { length: 1, idx: null }
  };

  return ugen;
};
},{"./gen.js":87}],111:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'peek',

  gen: function gen() {
    var genName = 'gen.' + this.name,
        inputs = _gen.getInputs(this),
        out = void 0,
        functionBody = void 0,
        next = void 0,
        lengthIsLog2 = void 0,
        idx = void 0;

    idx = inputs[1];
    lengthIsLog2 = (Math.log2(this.data.buffer.length) | 0) === Math.log2(this.data.buffer.length);

    if (this.mode !== 'simple') {

      functionBody = '  var ' + this.name + '_dataIdx  = ' + idx + ', \n      ' + this.name + '_phase = ' + (this.mode === 'samples' ? inputs[0] : inputs[0] + ' * ' + (this.data.buffer.length - 1)) + ', \n      ' + this.name + '_index = ' + this.name + '_phase | 0,\n';

      if (this.boundmode === 'wrap') {
        next = lengthIsLog2 ? '( ' + this.name + '_index + 1 ) & (' + this.data.buffer.length + ' - 1)' : this.name + '_index + 1 >= ' + this.data.buffer.length + ' ? ' + this.name + '_index + 1 - ' + this.data.buffer.length + ' : ' + this.name + '_index + 1';
      } else if (this.boundmode === 'clamp') {
        next = this.name + '_index + 1 >= ' + (this.data.buffer.length - 1) + ' ? ' + (this.data.buffer.length - 1) + ' : ' + this.name + '_index + 1';
      } else {
        next = this.name + '_index + 1';
      }

      if (this.interp === 'linear') {
        functionBody += '      ' + this.name + '_frac  = ' + this.name + '_phase - ' + this.name + '_index,\n      ' + this.name + '_base  = memory[ ' + this.name + '_dataIdx +  ' + this.name + '_index ],\n      ' + this.name + '_next  = ' + next + ',';

        if (this.boundmode === 'ignore') {
          functionBody += '\n      ' + this.name + '_out   = ' + this.name + '_index >= ' + (this.data.buffer.length - 1) + ' || ' + this.name + '_index < 0 ? 0 : ' + this.name + '_base + ' + this.name + '_frac * ( memory[ ' + this.name + '_dataIdx + ' + this.name + '_next ] - ' + this.name + '_base )\n\n';
        } else {
          functionBody += '\n      ' + this.name + '_out   = ' + this.name + '_base + ' + this.name + '_frac * ( memory[ ' + this.name + '_dataIdx + ' + this.name + '_next ] - ' + this.name + '_base )\n\n';
        }
      } else {
        functionBody += '      ' + this.name + '_out = memory[ ' + this.name + '_dataIdx + ' + this.name + '_index ]\n\n';
      }
    } else {
      // mode is simple
      functionBody = 'memory[ ' + idx + ' + ' + inputs[0] + ' ]';

      return functionBody;
    }

    _gen.memo[this.name] = this.name + '_out';

    return [this.name + '_out', functionBody];
  }
};

module.exports = function (data, index, properties) {
  var ugen = Object.create(proto),
      defaults = { channels: 1, mode: 'phase', interp: 'linear', boundmode: 'wrap' };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    data: data,
    dataName: data.name,
    uid: _gen.getUID(),
    inputs: [index, data]
  }, defaults);

  ugen.name = ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],112:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    accum = require('./accum.js'),
    mul = require('./mul.js'),
    proto = { basename: 'phasor' };

module.exports = function () {
  var frequency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var props = arguments[2];

  if (props === undefined) props = { min: -1 };

  var range = (props.max || 1) - props.min;

  var ugen = typeof frequency === 'number' ? accum(frequency * range / gen.samplerate, reset, props) : accum(mul(frequency, 1 / gen.samplerate / (1 / range)), reset, props);

  ugen.name = proto.basename + gen.getUID();

  return ugen;
};
},{"./accum.js":60,"./gen.js":87,"./mul.js":105}],113:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    mul = require('./mul.js'),
    wrap = require('./wrap.js');

var proto = {
  basename: 'poke',

  gen: function gen() {
    var dataName = 'memory',
        inputs = _gen.getInputs(this),
        idx = void 0,
        out = void 0,
        wrapped = void 0;

    idx = this.data.gen

    //gen.requestMemory( this.memory )
    //wrapped = wrap( this.inputs[1], 0, this.dataLength ).gen()
    //idx = wrapped[0]
    //gen.functionBody += wrapped[1]
    ();var outputStr = this.inputs[1] === 0 ? '  ' + dataName + '[ ' + idx + ' ] = ' + inputs[0] + '\n' : '  ' + dataName + '[ ' + idx + ' + ' + inputs[1] + ' ] = ' + inputs[0] + '\n';

    if (this.inline === undefined) {
      _gen.functionBody += outputStr;
    } else {
      return [this.inline, outputStr];
    }
  }
};
module.exports = function (data, value, index, properties) {
  var ugen = Object.create(proto),
      defaults = { channels: 1 };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    data: data,
    dataName: data.name,
    dataLength: data.buffer.length,
    uid: _gen.getUID(),
    inputs: [value, index]
  }, defaults);

  ugen.name = ugen.basename + ugen.uid;

  _gen.histories.set(ugen.name, ugen);

  return ugen;
};
},{"./gen.js":87,"./mul.js":105,"./wrap.js":130}],114:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'pow',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add({ 'pow': Math.pow });

      out = 'gen.pow( ' + inputs[0] + ', ' + inputs[1] + ' )';
    } else {
      if (typeof inputs[0] === 'string' && inputs[0][0] === '(') {
        inputs[0] = inputs[0].slice(1, -1);
      }
      if (typeof inputs[1] === 'string' && inputs[1][0] === '(') {
        inputs[1] = inputs[1].slice(1, -1);
      }

      out = Math.pow(parseFloat(inputs[0]), parseFloat(inputs[1]));
    }

    return out;
  }
};

module.exports = function (x, y) {
  var pow = Object.create(proto);

  pow.inputs = [x, y];
  pow.id = _gen.getUID();
  pow.name = pow.basename + '{pow.id}';

  return pow;
};
},{"./gen.js":87}],115:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js'),
    delta = require('./delta.js'),
    wrap = require('./wrap.js');

var proto = {
  basename: 'rate',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        phase = history(),
        inMinus1 = history(),
        genName = 'gen.' + this.name,
        filter = void 0,
        sum = void 0,
        out = void 0;

    _gen.closures.add(_defineProperty({}, this.name, this));

    out = ' var ' + this.name + '_diff = ' + inputs[0] + ' - ' + genName + '.lastSample\n  if( ' + this.name + '_diff < -.5 ) ' + this.name + '_diff += 1\n  ' + genName + '.phase += ' + this.name + '_diff * ' + inputs[1] + '\n  if( ' + genName + '.phase > 1 ) ' + genName + '.phase -= 1\n  ' + genName + '.lastSample = ' + inputs[0] + '\n';
    out = ' ' + out;

    return [genName + '.phase', out];
  }
};

module.exports = function (in1, rate) {
  var ugen = Object.create(proto);

  Object.assign(ugen, {
    phase: 0,
    lastSample: 0,
    uid: _gen.getUID(),
    inputs: [in1, rate]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./add.js":63,"./delta.js":80,"./gen.js":87,"./history.js":91,"./memo.js":99,"./mul.js":105,"./sub.js":122,"./wrap.js":130}],116:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'round',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.round));

      out = 'gen.round( ' + inputs[0] + ' )';
    } else {
      out = Math.round(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var round = Object.create(proto);

  round.inputs = [x];

  return round;
};
},{"./gen.js":87}],117:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'sah',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    _gen.data[this.name] = 0;
    _gen.data[this.name + '_control'] = 0;

    out = ' var ' + this.name + ' = gen.data.' + this.name + '_control,\n      ' + this.name + '_trigger = ' + inputs[1] + ' > ' + inputs[2] + ' ? 1 : 0\n\n  if( ' + this.name + '_trigger !== ' + this.name + '  ) {\n    if( ' + this.name + '_trigger === 1 ) \n      gen.data.' + this.name + ' = ' + inputs[0] + '\n    gen.data.' + this.name + '_control = ' + this.name + '_trigger\n  }\n';

    _gen.memo[this.name] = 'gen.data.' + this.name;

    return ['gen.data.' + this.name, ' ' + out];
  }
};

module.exports = function (in1, control) {
  var threshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var properties = arguments[3];

  var ugen = Object.create(proto),
      defaults = { init: 0 };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    lastSample: 0,
    uid: _gen.getUID(),
    inputs: [in1, control, threshold]
  }, defaults);

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],118:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'selector',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0,
        returnValue = 0;

    switch (inputs.length) {
      case 2:
        returnValue = inputs[1];
        break;
      case 3:
        out = '  var ' + this.name + '_out = ' + inputs[0] + ' === 1 ? ' + inputs[1] + ' : ' + inputs[2] + '\n\n';
        returnValue = [this.name + '_out', out];
        break;
      default:
        out = ' var ' + this.name + '_out = 0\n  switch( ' + inputs[0] + ' + 1 ) {\n';

        for (var i = 1; i < inputs.length; i++) {
          out += '    case ' + i + ': ' + this.name + '_out = ' + inputs[i] + '; break;\n';
        }

        out += '  }\n\n';

        returnValue = [this.name + '_out', ' ' + out];
    }

    _gen.memo[this.name] = this.name + '_out';

    return returnValue;
  }
};

module.exports = function () {
  for (var _len = arguments.length, inputs = Array(_len), _key = 0; _key < _len; _key++) {
    inputs[_key] = arguments[_key];
  }

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: inputs
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],119:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'sign',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.sign));

      out = 'gen.sign( ' + inputs[0] + ' )';
    } else {
      out = Math.sign(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var sign = Object.create(proto);

  sign.inputs = [x];

  return sign;
};
},{"./gen.js":87}],120:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'sin',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'sin': Math.sin });

      out = 'gen.sin( ' + inputs[0] + ' )';
    } else {
      out = Math.sin(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var sin = Object.create(proto);

  sin.inputs = [x];
  sin.id = _gen.getUID();
  sin.name = sin.basename + '{sin.id}';

  return sin;
};
},{"./gen.js":87}],121:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js'),
    gt = require('./gt.js'),
    div = require('./div.js'),
    _switch = require('./switch.js');

module.exports = function (in1) {
    var slideUp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var slideDown = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

    var y1 = history(0),
        filter = void 0,
        slideAmount = void 0;

    //y (n) = y (n-1) + ((x (n) - y (n-1))/slide) 
    slideAmount = _switch(gt(in1, y1.out), slideUp, slideDown);

    filter = memo(add(y1.out, div(sub(in1, y1.out), slideAmount)));

    y1.in(filter);

    return filter;
};
},{"./add.js":63,"./div.js":81,"./gen.js":87,"./gt.js":88,"./history.js":91,"./memo.js":99,"./mul.js":105,"./sub.js":122,"./switch.js":123}],122:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var sub = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = 0,
          diff = 0,
          needsParens = false,
          numCount = 0,
          lastNumber = inputs[0],
          lastNumberIsUgen = isNaN(lastNumber),
          subAtEnd = false,
          hasUgens = false,
          returnValue = 0;

      this.inputs.forEach(function (value) {
        if (isNaN(value)) hasUgens = true;
      });

      if (hasUgens) {
        // store in variable for future reference
        out = '  var ' + this.name + ' = (';
      } else {
        out = '(';
      }

      inputs.forEach(function (v, i) {
        if (i === 0) return;

        var isNumberUgen = isNaN(v),
            isFinalIdx = i === inputs.length - 1;

        if (!lastNumberIsUgen && !isNumberUgen) {
          lastNumber = lastNumber - v;
          out += lastNumber;
          return;
        } else {
          needsParens = true;
          out += lastNumber + ' - ' + v;
        }

        if (!isFinalIdx) out += ' - ';
      });

      if (needsParens) {
        out += ')';
      } else {
        out = out.slice(1 // remove opening paren
        );
      }

      if (hasUgens) out += '\n';

      returnValue = hasUgens ? [this.name, out] : out;

      if (hasUgens) _gen.memo[this.name] = this.name;

      return returnValue;
    }
  };

  sub.name = 'sub' + sub.id;

  return sub;
};
},{"./gen.js":87}],123:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'switch',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    if (inputs[1] === inputs[2]) return inputs[1]; // if both potential outputs are the same just return one of them

    out = '  var ' + this.name + '_out = ' + inputs[0] + ' === 1 ? ' + inputs[1] + ' : ' + inputs[2] + '\n';

    _gen.memo[this.name] = this.name + '_out';

    return [this.name + '_out', out];
  }
};

module.exports = function (control) {
  var in1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var in2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [control, in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./gen.js":87}],124:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 't60',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this),
        returnValue = void 0;

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, 'exp', Math.exp));

      out = '  var ' + this.name + ' = gen.exp( -6.907755278921 / ' + inputs[0] + ' )\n\n';

      _gen.memo[this.name] = out;

      returnValue = [this.name, out];
    } else {
      out = Math.exp(-6.907755278921 / inputs[0]);

      returnValue = out;
    }

    return returnValue;
  }
};

module.exports = function (x) {
  var t60 = Object.create(proto);

  t60.inputs = [x];
  t60.name = proto.basename + _gen.getUID();

  return t60;
};
},{"./gen.js":87}],125:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'tan',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'tan': Math.tan });

      out = 'gen.tan( ' + inputs[0] + ' )';
    } else {
      out = Math.tan(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var tan = Object.create(proto);

  tan.inputs = [x];
  tan.id = _gen.getUID();
  tan.name = tan.basename + '{tan.id}';

  return tan;
};
},{"./gen.js":87}],126:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'tanh',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'tanh': Math.tanh });

      out = 'gen.tanh( ' + inputs[0] + ' )';
    } else {
      out = Math.tanh(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var tanh = Object.create(proto);

  tanh.inputs = [x];
  tanh.id = _gen.getUID();
  tanh.name = tanh.basename + '{tanh.id}';

  return tanh;
};
},{"./gen.js":87}],127:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    lt = require('./lt.js'),
    phasor = require('./phasor.js');

module.exports = function () {
  var frequency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 440;
  var pulsewidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : .5;

  var graph = lt(accum(div(frequency, 44100)), .5);

  graph.name = 'train' + gen.getUID();

  return graph;
};
},{"./gen.js":87,"./lt.js":95,"./phasor.js":112}],128:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    data = require('./data.js');

var isStereo = false;

var utilities = {
  ctx: null,

  clear: function clear() {
    this.callback = function () {
      return 0;
    };
    this.clear.callbacks.forEach(function (v) {
      return v();
    });
    this.clear.callbacks.length = 0;
  },
  createContext: function createContext() {
    var AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext;
    this.ctx = new AC();
    gen.samplerate = this.ctx.sampleRate;

    var start = function start() {
      if (typeof AC !== 'undefined') {
        if (document && document.documentElement && 'ontouchstart' in document.documentElement) {
          window.removeEventListener('touchstart', start);

          if ('ontouchstart' in document.documentElement) {
            // required to start audio under iOS 6
            var mySource = utilities.ctx.createBufferSource();
            mySource.connect(utilities.ctx.destination);
            mySource.noteOn(0);
          }
        }
      }
    };

    if (document && document.documentElement && 'ontouchstart' in document.documentElement) {
      window.addEventListener('touchstart', start);
    }

    return this;
  },
  createScriptProcessor: function createScriptProcessor() {
    this.node = this.ctx.createScriptProcessor(1024, 0, 2), this.clearFunction = function () {
      return 0;
    }, this.callback = this.clearFunction;

    this.node.onaudioprocess = function (audioProcessingEvent) {
      var outputBuffer = audioProcessingEvent.outputBuffer;

      var left = outputBuffer.getChannelData(0),
          right = outputBuffer.getChannelData(1);

      for (var sample = 0; sample < left.length; sample++) {
        if (!isStereo) {
          left[sample] = right[sample] = utilities.callback();
        } else {
          var out = utilities.callback();
          left[sample] = out[0];
          right[sample] = out[1];
        }
      }
    };

    this.node.connect(this.ctx.destination

    //this.node.connect( this.analyzer )

    );return this;
  },
  playGraph: function playGraph(graph, debug) {
    var mem = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 44100 * 10;

    utilities.clear();
    if (debug === undefined) debug = false;

    isStereo = Array.isArray(graph);

    utilities.callback = gen.createCallback(graph, mem, debug);

    if (utilities.console) utilities.console.setValue(utilities.callback.toString());

    return utilities.callback;
  },
  loadSample: function loadSample(soundFilePath, data) {
    var req = new XMLHttpRequest();
    req.open('GET', soundFilePath, true);
    req.responseType = 'arraybuffer';

    var promise = new Promise(function (resolve, reject) {
      req.onload = function () {
        var audioData = req.response;

        utilities.ctx.decodeAudioData(audioData, function (buffer) {
          data.buffer = buffer.getChannelData(0);
          resolve(data.buffer);
        });
      };
    });

    req.send();

    return promise;
  }
};

utilities.clear.callbacks = [];

module.exports = utilities;
},{"./data.js":76,"./gen.js":87}],129:[function(require,module,exports){
'use strict';

/*
 * many windows here adapted from https://github.com/corbanbrook/dsp.js/blob/master/dsp.js
 * starting at line 1427
 * taken 8/15/16
*/

var windows = module.exports = {
  bartlett: function bartlett(length, index) {
    return 2 / (length - 1) * ((length - 1) / 2 - Math.abs(index - (length - 1) / 2));
  },
  bartlettHann: function bartlettHann(length, index) {
    return 0.62 - 0.48 * Math.abs(index / (length - 1) - 0.5) - 0.38 * Math.cos(2 * Math.PI * index / (length - 1));
  },
  blackman: function blackman(length, index, alpha) {
    var a0 = (1 - alpha) / 2,
        a1 = 0.5,
        a2 = alpha / 2;

    return a0 - a1 * Math.cos(2 * Math.PI * index / (length - 1)) + a2 * Math.cos(4 * Math.PI * index / (length - 1));
  },
  cosine: function cosine(length, index) {
    return Math.cos(Math.PI * index / (length - 1) - Math.PI / 2);
  },
  gauss: function gauss(length, index, alpha) {
    return Math.pow(Math.E, -0.5 * Math.pow((index - (length - 1) / 2) / (alpha * (length - 1) / 2), 2));
  },
  hamming: function hamming(length, index) {
    return 0.54 - 0.46 * Math.cos(Math.PI * 2 * index / (length - 1));
  },
  hann: function hann(length, index) {
    return 0.5 * (1 - Math.cos(Math.PI * 2 * index / (length - 1)));
  },
  lanczos: function lanczos(length, index) {
    var x = 2 * index / (length - 1) - 1;
    return Math.sin(Math.PI * x) / (Math.PI * x);
  },
  rectangular: function rectangular(length, index) {
    return 1;
  },
  triangular: function triangular(length, index) {
    return 2 / length * (length / 2 - Math.abs(index - (length - 1) / 2));
  },


  // parabola
  welch: function welch(length, _index, ignore, shift) {
    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
    var index = shift === 0 ? _index : (_index + Math.floor(shift * length)) % length;
    var n_1_over2 = (length - 1) / 2;

    return 1 - Math.pow((index - n_1_over2) / n_1_over2, 2);
  },
  inversewelch: function inversewelch(length, _index, ignore) {
    var shift = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
    var index = shift === 0 ? _index : (_index + Math.floor(shift * length)) % length;
    var n_1_over2 = (length - 1) / 2;

    return Math.pow((index - n_1_over2) / n_1_over2, 2);
  },
  parabola: function parabola(length, index) {
    if (index <= length / 2) {
      return windows.inversewelch(length / 2, index) - 1;
    } else {
      return 1 - windows.inversewelch(length / 2, index - length / 2);
    }
  },
  exponential: function exponential(length, index, alpha) {
    return Math.pow(index / length, alpha);
  },
  linear: function linear(length, index) {
    return index / length;
  }
};
},{}],130:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    floor = require('./floor.js'),
    sub = require('./sub.js'),
    memo = require('./memo.js');

var proto = {
  basename: 'wrap',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        signal = inputs[0],
        min = inputs[1],
        max = inputs[2],
        out = void 0,
        diff = void 0;

    //out = `(((${inputs[0]} - ${this.min}) % ${diff}  + ${diff}) % ${diff} + ${this.min})`
    //const long numWraps = long((v-lo)/range) - (v < lo);
    //return v - range * double(numWraps);   

    if (this.min === 0) {
      diff = max;
    } else if (isNaN(max) || isNaN(min)) {
      diff = max + ' - ' + min;
    } else {
      diff = max - min;
    }

    out = ' var ' + this.name + ' = ' + inputs[0] + '\n  if( ' + this.name + ' < ' + this.min + ' ) ' + this.name + ' += ' + diff + '\n  else if( ' + this.name + ' > ' + this.max + ' ) ' + this.name + ' -= ' + diff + '\n\n';

    return [this.name, ' ' + out];
  }
};

module.exports = function (in1) {
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    uid: _gen.getUID(),
    inputs: [in1, min, max]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};
},{"./floor.js":84,"./gen.js":87,"./memo.js":99,"./sub.js":122}],131:[function(require,module,exports){
'use strict';

var MemoryHelper = {
  create: function create() {
    var size = arguments.length <= 0 || arguments[0] === undefined ? 4096 : arguments[0];
    var memtype = arguments.length <= 1 || arguments[1] === undefined ? Float32Array : arguments[1];

    var helper = Object.create(this);

    Object.assign(helper, {
      heap: new memtype(size),
      list: {},
      freeList: {}
    });

    return helper;
  },
  alloc: function alloc(amount) {
    var idx = -1;

    if (amount > this.heap.length) {
      throw Error('Allocation request is larger than heap size of ' + this.heap.length);
    }

    for (var key in this.freeList) {
      var candidateSize = this.freeList[key];

      if (candidateSize >= amount) {
        idx = key;

        this.list[idx] = amount;

        if (candidateSize !== amount) {
          var newIndex = idx + amount,
              newFreeSize = void 0;

          for (var _key in this.list) {
            if (_key > newIndex) {
              newFreeSize = _key - newIndex;
              this.freeList[newIndex] = newFreeSize;
            }
          }
        }
        
        break;
      }
    }
    
    if( idx !== -1 ) delete this.freeList[ idx ]

    if (idx === -1) {
      var keys = Object.keys(this.list),
          lastIndex = void 0;

      if (keys.length) {
        // if not first allocation...
        lastIndex = parseInt(keys[keys.length - 1]);

        idx = lastIndex + this.list[lastIndex];
      } else {
        idx = 0;
      }

      this.list[idx] = amount;
    }

    if (idx + amount >= this.heap.length) {
      throw Error('No available blocks remain sufficient for allocation request.');
    }
    return idx;
  },
  free: function free(index) {
    if (typeof this.list[index] !== 'number') {
      throw Error('Calling free() on non-existing block.');
    }

    this.list[index] = 0;

    var size = 0;
    for (var key in this.list) {
      if (key > index) {
        size = key - index;
        break;
      }
    }

    this.freeList[index] = size;
  }
};

module.exports = MemoryHelper;

},{}]},{},[28])(28)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hbmFseXNpcy9hbmFseXplci5qcyIsImpzL2FuYWx5c2lzL3NpbmdsZXNhbXBsZWRlbGF5LmpzIiwianMvZW52ZWxvcGVzL2FkLmpzIiwianMvZW52ZWxvcGVzL2Fkc3IuanMiLCJqcy9lbnZlbG9wZXMvZW52ZWxvcGVzLmpzIiwianMvZW52ZWxvcGVzL3JhbXAuanMiLCJqcy9leHRlcm5hbC9wcmlvcml0eXF1ZXVlLmpzIiwianMvZmlsdGVycy9hbGxwYXNzLmpzIiwianMvZmlsdGVycy9iaXF1YWQuanMiLCJqcy9maWx0ZXJzL2NvbWJmaWx0ZXIuanMiLCJqcy9maWx0ZXJzL2Rpb2RlRmlsdGVyWkRGLmpzIiwianMvZmlsdGVycy9maWx0ZXIuanMiLCJqcy9maWx0ZXJzL2ZpbHRlcjI0LmpzIiwianMvZmlsdGVycy9maWx0ZXJzLmpzIiwianMvZmlsdGVycy9sYWRkZXJGaWx0ZXJaZXJvRGVsYXkuanMiLCJqcy9maWx0ZXJzL3N2Zi5qcyIsImpzL2Z4L2JpdENydXNoZXIuanMiLCJqcy9meC9idWZmZXJTaHVmZmxlci5qcyIsImpzL2Z4L2Nob3J1cy5qcyIsImpzL2Z4L2RlbGF5LmpzIiwianMvZngvZWZmZWN0LmpzIiwianMvZngvZWZmZWN0cy5qcyIsImpzL2Z4L2ZsYW5nZXIuanMiLCJqcy9meC9mcmVldmVyYi5qcyIsImpzL2Z4L3JpbmdNb2QuanMiLCJqcy9meC90cmVtb2xvLmpzIiwianMvZngvdmlicmF0by5qcyIsImpzL2luZGV4LmpzIiwianMvaW5zdHJ1bWVudHMvY29uZ2EuanMiLCJqcy9pbnN0cnVtZW50cy9jb3diZWxsLmpzIiwianMvaW5zdHJ1bWVudHMvZm0uanMiLCJqcy9pbnN0cnVtZW50cy9oYXQuanMiLCJqcy9pbnN0cnVtZW50cy9pbnN0cnVtZW50LmpzIiwianMvaW5zdHJ1bWVudHMvaW5zdHJ1bWVudHMuanMiLCJqcy9pbnN0cnVtZW50cy9rYXJwbHVzc3Ryb25nLmpzIiwianMvaW5zdHJ1bWVudHMva2ljay5qcyIsImpzL2luc3RydW1lbnRzL21vbm9zeW50aC5qcyIsImpzL2luc3RydW1lbnRzL3BvbHlNaXhpbi5qcyIsImpzL2luc3RydW1lbnRzL3BvbHl0ZW1wbGF0ZS5qcyIsImpzL2luc3RydW1lbnRzL3NhbXBsZXIuanMiLCJqcy9pbnN0cnVtZW50cy9zbmFyZS5qcyIsImpzL2luc3RydW1lbnRzL3N5bnRoLmpzIiwianMvbWlzYy9iaW5vcHMuanMiLCJqcy9taXNjL2J1cy5qcyIsImpzL21pc2MvYnVzMi5qcyIsImpzL21pc2MvbW9ub3BzLmpzIiwianMvb3NjaWxsYXRvcnMvYnJvd25ub2lzZS5qcyIsImpzL29zY2lsbGF0b3JzL2ZtZmVlZGJhY2tvc2MuanMiLCJqcy9vc2NpbGxhdG9ycy9vc2NpbGxhdG9ycy5qcyIsImpzL29zY2lsbGF0b3JzL3Bpbmtub2lzZS5qcyIsImpzL29zY2lsbGF0b3JzL3dhdmV0YWJsZS5qcyIsImpzL3NjaGVkdWxpbmcvc2NoZWR1bGVyLmpzIiwianMvc2NoZWR1bGluZy9zZXEyLmpzIiwianMvc2NoZWR1bGluZy9zZXF1ZW5jZXIuanMiLCJqcy91Z2VuLmpzIiwianMvdWdlblRlbXBsYXRlLmpzIiwianMvdXRpbGl0aWVzLmpzIiwibm9kZV9tb2R1bGVzL2JpZy5qcy9iaWcuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvYWJzLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2FjY3VtLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2Fjb3MuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvYWQuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvYWRkLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2Fkc3IuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvYW5kLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2FzaW4uanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvYXRhbi5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9hdHRhY2suanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvYmFuZy5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9ib29sLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2NlaWwuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvY2xhbXAuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvY29zLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2NvdW50ZXIuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvY3ljbGUuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvZGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9kY2Jsb2NrLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2RlY2F5LmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2RlbGF5LmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2RlbHRhLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2Rpdi5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9lbnYuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvZXEuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvZmxvb3IuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvZm9sZC5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9nYXRlLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2dlbi5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9ndC5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9ndGUuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvZ3RwLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2hpc3RvcnkuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvaWZlbHNlaWYuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvaW4uanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvbHQuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvbHRlLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L2x0cC5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9tYXguanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvbWVtby5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9taW4uanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvbWl4LmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L21vZC5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9tc3Rvc2FtcHMuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvbXRvZi5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9tdWwuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvbmVxLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L25vaXNlLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L25vdC5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9wYW4uanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvcGFyYW0uanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvcGVlay5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9waGFzb3IuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvcG9rZS5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9wb3cuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvcmF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9yb3VuZC5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9zYWguanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3Qvc2VsZWN0b3IuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3Qvc2lnbi5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC9zaW4uanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3Qvc2xpZGUuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3Qvc3ViLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L3N3aXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9nZW5pc2guanMvZGlzdC90NjAuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvdGFuLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L3RhbmguanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvdHJhaW4uanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3QvdXRpbGl0aWVzLmpzIiwibm9kZV9tb2R1bGVzL2dlbmlzaC5qcy9kaXN0L3dpbmRvd3MuanMiLCJub2RlX21vZHVsZXMvZ2VuaXNoLmpzL2Rpc3Qvd3JhcC5qcyIsIm5vZGVfbW9kdWxlcy9tZW1vcnktaGVscGVyL2luZGV4LnRyYW5zcGlsZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJsZXQgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbmxldCBhbmFseXplciA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG5PYmplY3QuYXNzaWduKCBhbmFseXplciwge1xuICBfX3R5cGVfXzogJ2FuYWx5emVyJyxcbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gYW5hbHl6ZXJcbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBhbmFseXplciA9IHJlcXVpcmUoICcuL2FuYWx5emVyLmpzJyApLFxuICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgRGVsYXkgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHNzZCA9IE9iamVjdC5jcmVhdGUoIGFuYWx5emVyIClcbiAgc3NkLmluICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICBzc2Qub3V0ID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbiAgc3NkLmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcblxuICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBpbnB1dFByb3BzIClcbiAgbGV0IGlzU3RlcmVvID0gZmFsc2UvL3Byb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnIClcbiAgICBcbiAgbGV0IGhpc3RvcnlMID0gZy5oaXN0b3J5KClcblxuICBpZiggaXNTdGVyZW8gKSB7XG4gICAgLy8gcmlnaHQgY2hhbm5lbFxuICAgIGxldCBoaXN0b3J5UiA9IGcuaGlzdG9yeSgpXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICBzc2Qub3V0LFxuICAgICAgWyBoaXN0b3J5TC5vdXQsIGhpc3RvcnlSLm91dCBdLCBcbiAgICAgICdzc2Rfb3V0JywgXG4gICAgICBwcm9wcyBcbiAgICApXG5cbiAgICBzc2Qub3V0LmNhbGxiYWNrLnVnZW5OYW1lID0gc3NkLm91dC51Z2VuTmFtZSA9ICdzc2Rfb3V0XycgKyBzc2QuaWRcblxuICAgIGNvbnN0IGlkeEwgPSBzc2Qub3V0LmdyYXBoLm1lbW9yeS52YWx1ZS5pZHgsIFxuICAgICAgICAgIGlkeFIgPSBpZHhMICsgMSxcbiAgICAgICAgICBtZW1vcnkgPSBHaWJiZXJpc2guZ2VuaXNoLmdlbi5tZW1vcnkuaGVhcFxuXG4gICAgY29uc3QgY2FsbGJhY2sgPSBmdW5jdGlvbiggaW5wdXQgKSB7XG4gICAgICAndXNlIHN0cmljdCdcbiAgICAgIG1lbW9yeVsgaWR4TCBdID0gaW5wdXRbMF1cbiAgICAgIG1lbW9yeVsgaWR4UiBdID0gaW5wdXRbMV1cbiAgICAgIHJldHVybiAwICAgICBcbiAgICB9XG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHNzZC5pbiwgWyBpbnB1dFswXSxpbnB1dFsxXSBdLCAnc3NkX2luJywgcHJvcHMsIGNhbGxiYWNrIClcblxuICAgIGNhbGxiYWNrLnVnZW5OYW1lID0gc3NkLmluLnVnZW5OYW1lID0gJ3NzZF9pbl8nICsgc3NkLmlkXG4gICAgc3NkLmluLmlucHV0TmFtZXMgPSBbICdpbnB1dCcgXVxuICAgIHNzZC5pbi5pbnB1dHMgPSBbIHByb3BzLmlucHV0IF1cbiAgICBzc2QuaW4uaW5wdXQgPSBwcm9wcy5pbnB1dFxuICAgIHNzZC50eXBlID0gJ2FuYWx5c2lzJ1xuXG4gICAgc3NkLmluLmxpc3RlbiA9IGZ1bmN0aW9uKCB1Z2VuICkge1xuICAgICAgaWYoIHVnZW4gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc3NkLmluLmlucHV0ID0gdWdlblxuICAgICAgICBzc2QuaW4uaW5wdXRzID0gWyB1Z2VuIF1cbiAgICAgIH1cblxuICAgICAgaWYoIEdpYmJlcmlzaC5hbmFseXplcnMuaW5kZXhPZiggc3NkLmluICkgPT09IC0xICkge1xuICAgICAgICBHaWJiZXJpc2guYW5hbHl6ZXJzLnB1c2goIHNzZC5pbiApXG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC5kaXJ0eSggR2liYmVyaXNoLmFuYWx5emVycyApXG4gICAgfVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggc3NkLm91dCwgaGlzdG9yeUwub3V0LCAnc3NkX291dCcsIHByb3BzIClcblxuICAgIHNzZC5vdXQuY2FsbGJhY2sudWdlbk5hbWUgPSBzc2Qub3V0LnVnZW5OYW1lID0gJ3NzZF9vdXRfJyArIHNzZC5pZFxuXG4gICAgbGV0IGlkeCA9IHNzZC5vdXQuZ3JhcGgubWVtb3J5LnZhbHVlLmlkeCBcbiAgICBsZXQgbWVtb3J5ID0gR2liYmVyaXNoLmdlbmlzaC5nZW4ubWVtb3J5LmhlYXBcbiAgICBsZXQgcGhhc2UgPSAwXG4gICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24oIGlucHV0ICkge1xuICAgICAgJ3VzZSBzdHJpY3QnXG4gICAgICBtZW1vcnlbIGlkeCBdID0gaW5wdXRcbiAgICAgIHJldHVybiAwICAgICBcbiAgICB9XG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHNzZC5pbiwgaW5wdXQsICdzc2RfaW4nLCBwcm9wcywgY2FsbGJhY2sgKVxuXG4gICAgY2FsbGJhY2sudWdlbk5hbWUgPSBzc2QuaW4udWdlbk5hbWUgPSAnc3NkX2luXycgKyBzc2QuaWRcbiAgICBzc2QuaW4uaW5wdXROYW1lcyA9IFsgJ2lucHV0JyBdXG4gICAgc3NkLmluLmlucHV0cyA9IFsgcHJvcHMuaW5wdXQgXVxuICAgIHNzZC5pbi5pbnB1dCA9IHByb3BzLmlucHV0XG4gICAgc3NkLnR5cGUgPSAnYW5hbHlzaXMnXG5cbiAgICBzc2QuaW4ubGlzdGVuID0gZnVuY3Rpb24oIHVnZW4gKSB7XG4gICAgICBpZiggdWdlbiAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICBzc2QuaW4uaW5wdXQgPSB1Z2VuXG4gICAgICAgIHNzZC5pbi5pbnB1dHMgPSBbIHVnZW4gXVxuICAgICAgfVxuXG4gICAgICBpZiggR2liYmVyaXNoLmFuYWx5emVycy5pbmRleE9mKCBzc2QuaW4gKSA9PT0gLTEgKSB7XG4gICAgICAgIEdpYmJlcmlzaC5hbmFseXplcnMucHVzaCggc3NkLmluIClcbiAgICAgIH1cblxuICAgICAgR2liYmVyaXNoLmRpcnR5KCBHaWJiZXJpc2guYW5hbHl6ZXJzIClcbiAgICB9XG5cbiAgfVxuICBcbiAgcmV0dXJuIHNzZFxufVxuXG5EZWxheS5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbn1cblxucmV0dXJuIERlbGF5XG5cbn1cbiIsImxldCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICksXG4gICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBBRCA9IGZ1bmN0aW9uKCBhcmd1bWVudFByb3BzICkge1xuICAgIGxldCBhZCA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSxcbiAgICAgICAgYXR0YWNrICA9IGcuaW4oICdhdHRhY2snICksXG4gICAgICAgIGRlY2F5ICAgPSBnLmluKCAnZGVjYXknIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBBRC5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBsZXQgZ3JhcGggPSBnLmFkKCBhdHRhY2ssIGRlY2F5IClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBhZCwgZ3JhcGgsICdhZCcsIHByb3BzIClcblxuICAgIGFkLnRyaWdnZXIgPSBncmFwaC50cmlnZ2VyXG5cbiAgICByZXR1cm4gYWRcbiAgfVxuXG4gIEFELmRlZmF1bHRzID0geyBhdHRhY2s6NDQxMDAsIGRlY2F5OjQ0MTAwIH0gXG5cbiAgcmV0dXJuIEFEXG5cbn1cbiIsImxldCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICksXG4gICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBBRFNSID0gZnVuY3Rpb24oIGFyZ3VtZW50UHJvcHMgKSB7XG4gICAgbGV0IGFkc3IgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApLFxuICAgICAgICBhdHRhY2sgID0gZy5pbiggJ2F0dGFjaycgKSxcbiAgICAgICAgZGVjYXkgICA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgc3VzdGFpbiA9IGcuaW4oICdzdXN0YWluJyApLFxuICAgICAgICByZWxlYXNlID0gZy5pbiggJ3JlbGVhc2UnICksXG4gICAgICAgIHN1c3RhaW5MZXZlbCA9IGcuaW4oICdzdXN0YWluTGV2ZWwnIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBBRFNSLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGxldCBncmFwaCA9IGcuYWRzciggYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgc3VzdGFpbkxldmVsLCByZWxlYXNlLCB7IHRyaWdnZXJSZWxlYXNlOiBwcm9wcy50cmlnZ2VyUmVsZWFzZSB9IClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBhZHNyLCBncmFwaCwgJ2Fkc3InLCBwcm9wcyApXG5cbiAgICBhZHNyLnRyaWdnZXIgPSBncmFwaC50cmlnZ2VyXG4gICAgYWRzci5hZHZhbmNlID0gZ3JhcGgucmVsZWFzZVxuXG4gICAgcmV0dXJuIGFkc3JcbiAgfVxuXG4gIEFEU1IuZGVmYXVsdHMgPSB7IGF0dGFjazoyMjA1MCwgZGVjYXk6MjIwNTAsIHN1c3RhaW46NDQxMDAsIHN1c3RhaW5MZXZlbDouNiwgcmVsZWFzZTogNDQxMDAsIHRyaWdnZXJSZWxlYXNlOmZhbHNlIH0gXG5cbiAgcmV0dXJuIEFEU1Jcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBFbnZlbG9wZXMgPSB7XG4gICAgQUQgICAgIDogcmVxdWlyZSggJy4vYWQuanMnICkoIEdpYmJlcmlzaCApLFxuICAgIEFEU1IgICA6IHJlcXVpcmUoICcuL2Fkc3IuanMnICkoIEdpYmJlcmlzaCApLFxuICAgIFJhbXAgICA6IHJlcXVpcmUoICcuL3JhbXAuanMnICkoIEdpYmJlcmlzaCApLFxuXG4gICAgZXhwb3J0IDogdGFyZ2V0ID0+IHtcbiAgICAgIGZvciggbGV0IGtleSBpbiBFbnZlbG9wZXMgKSB7XG4gICAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgICAgIHRhcmdldFsga2V5IF0gPSBFbnZlbG9wZXNbIGtleSBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gXG5cbiAgcmV0dXJuIEVudmVsb3Blc1xufVxuIiwiY29uc3QgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IFJhbXAgPSBmdW5jdGlvbiggYXJndW1lbnRQcm9wcyApIHtcbiAgICBjb25zdCByYW1wICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICksXG4gICAgICAgICAgbGVuZ3RoID0gZy5pbiggJ2xlbmd0aCcgKSxcbiAgICAgICAgICBmcm9tICAgPSBnLmluKCAnZnJvbScgKSxcbiAgICAgICAgICB0byAgICAgPSBnLmluKCAndG8nIClcblxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgUmFtcC5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBjb25zdCByZXNldCA9IGcuYmFuZygpXG5cbiAgICBjb25zdCBwaGFzZSA9IGcuYWNjdW0oIGcuZGl2KCAxLCBsZW5ndGggKSwgcmVzZXQsIHsgc2hvdWxkV3JhcDpwcm9wcy5zaG91bGRMb29wLCBzaG91bGRDbGFtcDp0cnVlIH0pLFxuICAgICAgICAgIGRpZmYgPSBnLnN1YiggdG8sIGZyb20gKSxcbiAgICAgICAgICBncmFwaCA9IGcuYWRkKCBmcm9tLCBnLm11bCggcGhhc2UsIGRpZmYgKSApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggcmFtcCwgZ3JhcGgsICdyYW1wJywgcHJvcHMgKVxuXG4gICAgcmFtcC50cmlnZ2VyID0gcmVzZXQudHJpZ2dlclxuXG4gICAgcmV0dXJuIHJhbXBcbiAgfVxuXG4gIFJhbXAuZGVmYXVsdHMgPSB7IGZyb206MCwgdG86MSwgbGVuZ3RoOmcuZ2VuLnNhbXBsZXJhdGUsIHNob3VsZExvb3A6ZmFsc2UgfVxuXG4gIHJldHVybiBSYW1wXG5cbn1cbiIsIi8qXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW50aW1hdHRlcjE1L2hlYXBxdWV1ZS5qcy9ibG9iL21hc3Rlci9oZWFwcXVldWUuanNcbiAqXG4gKiBUaGlzIGltcGxlbWVudGF0aW9uIGlzIHZlcnkgbG9vc2VseSBiYXNlZCBvZmYganMtcHJpb3JpdHktcXVldWVcbiAqIGJ5IEFkYW0gSG9vcGVyIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2FkYW1ob29wZXIvanMtcHJpb3JpdHktcXVldWVcbiAqXG4gKiBUaGUganMtcHJpb3JpdHktcXVldWUgaW1wbGVtZW50YXRpb24gc2VlbWVkIGEgdGVlbnN5IGJpdCBibG9hdGVkXG4gKiB3aXRoIGl0cyByZXF1aXJlLmpzIGRlcGVuZGVuY3kgYW5kIG11bHRpcGxlIHN0b3JhZ2Ugc3RyYXRlZ2llc1xuICogd2hlbiBhbGwgYnV0IG9uZSB3ZXJlIHN0cm9uZ2x5IGRpc2NvdXJhZ2VkLiBTbyBoZXJlIGlzIGEga2luZCBvZlxuICogY29uZGVuc2VkIHZlcnNpb24gb2YgdGhlIGZ1bmN0aW9uYWxpdHkgd2l0aCBvbmx5IHRoZSBmZWF0dXJlcyB0aGF0XG4gKiBJIHBhcnRpY3VsYXJseSBuZWVkZWQuXG4gKlxuICogVXNpbmcgaXQgaXMgcHJldHR5IHNpbXBsZSwgeW91IGp1c3QgY3JlYXRlIGFuIGluc3RhbmNlIG9mIEhlYXBRdWV1ZVxuICogd2hpbGUgb3B0aW9uYWxseSBzcGVjaWZ5aW5nIGEgY29tcGFyYXRvciBhcyB0aGUgYXJndW1lbnQ6XG4gKlxuICogdmFyIGhlYXBxID0gbmV3IEhlYXBRdWV1ZSgpO1xuICpcbiAqIHZhciBjdXN0b21xID0gbmV3IEhlYXBRdWV1ZShmdW5jdGlvbihhLCBiKXtcbiAqICAgLy8gaWYgYiA+IGEsIHJldHVybiBuZWdhdGl2ZVxuICogICAvLyBtZWFucyB0aGF0IGl0IHNwaXRzIG91dCB0aGUgc21hbGxlc3QgaXRlbSBmaXJzdFxuICogICByZXR1cm4gYSAtIGI7XG4gKiB9KTtcbiAqXG4gKiBOb3RlIHRoYXQgaW4gdGhpcyBjYXNlLCB0aGUgZGVmYXVsdCBjb21wYXJhdG9yIGlzIGlkZW50aWNhbCB0b1xuICogdGhlIGNvbXBhcmF0b3Igd2hpY2ggaXMgdXNlZCBleHBsaWNpdGx5IGluIHRoZSBzZWNvbmQgcXVldWUuXG4gKlxuICogT25jZSB5b3UndmUgaW5pdGlhbGl6ZWQgdGhlIGhlYXBxdWV1ZSwgeW91IGNhbiBwbG9wIHNvbWUgbmV3XG4gKiBlbGVtZW50cyBpbnRvIHRoZSBxdWV1ZSB3aXRoIHRoZSBwdXNoIG1ldGhvZCAodmFndWVseSByZW1pbmlzY2VudFxuICogb2YgdHlwaWNhbCBqYXZhc2NyaXB0IGFyYXlzKVxuICpcbiAqIGhlYXBxLnB1c2goNDIpO1xuICogaGVhcHEucHVzaChcImtpdHRlblwiKTtcbiAqXG4gKiBUaGUgcHVzaCBtZXRob2QgcmV0dXJucyB0aGUgbmV3IG51bWJlciBvZiBlbGVtZW50cyBvZiB0aGUgcXVldWUuXG4gKlxuICogWW91IGNhbiBwdXNoIGFueXRoaW5nIHlvdSdkIGxpa2Ugb250byB0aGUgcXVldWUsIHNvIGxvbmcgYXMgeW91clxuICogY29tcGFyYXRvciBmdW5jdGlvbiBpcyBjYXBhYmxlIG9mIGhhbmRsaW5nIGl0LiBUaGUgZGVmYXVsdFxuICogY29tcGFyYXRvciBpcyByZWFsbHkgc3R1cGlkIHNvIGl0IHdvbid0IGJlIGFibGUgdG8gaGFuZGxlIGFueXRoaW5nXG4gKiBvdGhlciB0aGFuIGFuIG51bWJlciBieSBkZWZhdWx0LlxuICpcbiAqIFlvdSBjYW4gcHJldmlldyB0aGUgc21hbGxlc3QgaXRlbSBieSB1c2luZyBwZWVrLlxuICpcbiAqIGhlYXBxLnB1c2goLTk5OTkpO1xuICogaGVhcHEucGVlaygpOyAvLyA9PT4gLTk5OTlcbiAqXG4gKiBUaGUgdXNlZnVsIGNvbXBsZW1lbnQgdG8gdG8gdGhlIHB1c2ggbWV0aG9kIGlzIHRoZSBwb3AgbWV0aG9kLFxuICogd2hpY2ggcmV0dXJucyB0aGUgc21hbGxlc3QgaXRlbSBhbmQgdGhlbiByZW1vdmVzIGl0IGZyb20gdGhlXG4gKiBxdWV1ZS5cbiAqXG4gKiBoZWFwcS5wdXNoKDEpO1xuICogaGVhcHEucHVzaCgyKTtcbiAqIGhlYXBxLnB1c2goMyk7XG4gKiBoZWFwcS5wb3AoKTsgLy8gPT0+IDFcbiAqIGhlYXBxLnBvcCgpOyAvLyA9PT4gMlxuICogaGVhcHEucG9wKCk7IC8vID09PiAzXG4gKi9cbmxldCBIZWFwUXVldWUgPSBmdW5jdGlvbihjbXApe1xuICB0aGlzLmNtcCA9IChjbXAgfHwgZnVuY3Rpb24oYSwgYil7IHJldHVybiBhIC0gYjsgfSk7XG4gIHRoaXMubGVuZ3RoID0gMDtcbiAgdGhpcy5kYXRhID0gW107XG59XG5IZWFwUXVldWUucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gdGhpcy5kYXRhWzBdO1xufTtcbkhlYXBRdWV1ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgdGhpcy5kYXRhLnB1c2godmFsdWUpO1xuXG4gIHZhciBwb3MgPSB0aGlzLmRhdGEubGVuZ3RoIC0gMSxcbiAgcGFyZW50LCB4O1xuXG4gIHdoaWxlKHBvcyA+IDApe1xuICAgIHBhcmVudCA9IChwb3MgLSAxKSA+Pj4gMTtcbiAgICBpZih0aGlzLmNtcCh0aGlzLmRhdGFbcG9zXSwgdGhpcy5kYXRhW3BhcmVudF0pIDwgMCl7XG4gICAgICB4ID0gdGhpcy5kYXRhW3BhcmVudF07XG4gICAgICB0aGlzLmRhdGFbcGFyZW50XSA9IHRoaXMuZGF0YVtwb3NdO1xuICAgICAgdGhpcy5kYXRhW3Bvc10gPSB4O1xuICAgICAgcG9zID0gcGFyZW50O1xuICAgIH1lbHNlIGJyZWFrO1xuICB9XG4gIHJldHVybiB0aGlzLmxlbmd0aCsrO1xufTtcbkhlYXBRdWV1ZS5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24oKXtcbiAgdmFyIGxhc3RfdmFsID0gdGhpcy5kYXRhLnBvcCgpLFxuICByZXQgPSB0aGlzLmRhdGFbMF07XG4gIGlmKHRoaXMuZGF0YS5sZW5ndGggPiAwKXtcbiAgICB0aGlzLmRhdGFbMF0gPSBsYXN0X3ZhbDtcbiAgICB2YXIgcG9zID0gMCxcbiAgICBsYXN0ID0gdGhpcy5kYXRhLmxlbmd0aCAtIDEsXG4gICAgbGVmdCwgcmlnaHQsIG1pbkluZGV4LCB4O1xuICAgIHdoaWxlKDEpe1xuICAgICAgbGVmdCA9IChwb3MgPDwgMSkgKyAxO1xuICAgICAgcmlnaHQgPSBsZWZ0ICsgMTtcbiAgICAgIG1pbkluZGV4ID0gcG9zO1xuICAgICAgaWYobGVmdCA8PSBsYXN0ICYmIHRoaXMuY21wKHRoaXMuZGF0YVtsZWZ0XSwgdGhpcy5kYXRhW21pbkluZGV4XSkgPCAwKSBtaW5JbmRleCA9IGxlZnQ7XG4gICAgICBpZihyaWdodCA8PSBsYXN0ICYmIHRoaXMuY21wKHRoaXMuZGF0YVtyaWdodF0sIHRoaXMuZGF0YVttaW5JbmRleF0pIDwgMCkgbWluSW5kZXggPSByaWdodDtcbiAgICAgIGlmKG1pbkluZGV4ICE9PSBwb3Mpe1xuICAgICAgICB4ID0gdGhpcy5kYXRhW21pbkluZGV4XTtcbiAgICAgICAgdGhpcy5kYXRhW21pbkluZGV4XSA9IHRoaXMuZGF0YVtwb3NdO1xuICAgICAgICB0aGlzLmRhdGFbcG9zXSA9IHg7XG4gICAgICAgIHBvcyA9IG1pbkluZGV4O1xuICAgICAgfWVsc2UgYnJlYWs7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldCA9IGxhc3RfdmFsO1xuICB9XG4gIHRoaXMubGVuZ3RoLS07XG4gIHJldHVybiByZXQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYXBRdWV1ZVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG4gXG4vLyBjb25zdHJ1Y3RvciBmb3Igc2Nocm9lZGVyIGFsbHBhc3MgZmlsdGVyc1xubGV0IGFsbFBhc3MgPSBmdW5jdGlvbiggX2lucHV0LCBsZW5ndGg9NTAwLCBmZWVkYmFjaz0uNSApIHtcbiAgbGV0IGluZGV4ICA9IGcuY291bnRlciggMSwwLGxlbmd0aCApLFxuICAgICAgYnVmZmVyID0gZy5kYXRhKCBsZW5ndGggKSxcbiAgICAgIGJ1ZmZlclNhbXBsZSA9IGcucGVlayggYnVmZmVyLCBpbmRleCwgeyBpbnRlcnA6J25vbmUnLCBtb2RlOidzYW1wbGVzJyB9KSxcbiAgICAgIG91dCA9IGcubWVtbyggZy5hZGQoIGcubXVsKCAtMSwgX2lucHV0KSwgYnVmZmVyU2FtcGxlICkgKVxuICAgICAgICAgICAgICAgIFxuICBnLnBva2UoIGJ1ZmZlciwgZy5hZGQoIF9pbnB1dCwgZy5tdWwoIGJ1ZmZlclNhbXBsZSwgZmVlZGJhY2sgKSApLCBpbmRleCApXG4gXG4gIHJldHVybiBvdXRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhbGxQYXNzXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZmlsdGVyID0gcmVxdWlyZSggJy4vZmlsdGVyLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBHaWJiZXJpc2guZ2VuaXNoLmJpcXVhZCA9ICggaW5wdXQsIGN1dG9mZiwgX1EsIG1vZGUsIGlzU3RlcmVvICkgPT4ge1xuICAgIGxldCBhMCxhMSxhMixjLGIxLGIyLFxuICAgICAgICBpbjFhMCx4MWExLHgyYTIseTFiMSx5MmIyLFxuICAgICAgICBpbjFhMF8xLHgxYTFfMSx4MmEyXzEseTFiMV8xLHkyYjJfMVxuXG4gICAgbGV0IHJldHVyblZhbHVlXG4gICAgXG4gICAgY29uc3QgUSA9IGcubWVtbyggZy5hZGQoIC41LCBnLm11bCggX1EsIDIyICkgKSApXG4gICAgbGV0IHgxID0gZy5oaXN0b3J5KCksIHgyID0gZy5oaXN0b3J5KCksIHkxID0gZy5oaXN0b3J5KCksIHkyID0gZy5oaXN0b3J5KClcbiAgICBcbiAgICBsZXQgdzAgPSBnLm1lbW8oIGcubXVsKCAyICogTWF0aC5QSSwgZy5kaXYoIGN1dG9mZiwgIGcuZ2VuLnNhbXBsZXJhdGUgKSApICksXG4gICAgICAgIHNpbncwID0gZy5zaW4oIHcwICksXG4gICAgICAgIGNvc3cwID0gZy5jb3MoIHcwICksXG4gICAgICAgIGFscGhhID0gZy5tZW1vKCBnLmRpdiggc2ludzAsIGcubXVsKCAyLCBRICkgKSApXG5cbiAgICBsZXQgb25lTWludXNDb3NXID0gZy5zdWIoIDEsIGNvc3cwIClcblxuICAgIHN3aXRjaCggbW9kZSApIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgYTAgPSBnLm1lbW8oIGcuZGl2KCBnLmFkZCggMSwgY29zdzApICwgMikgKVxuICAgICAgICBhMSA9IGcubXVsKCBnLmFkZCggMSwgY29zdzAgKSwgLTEgKVxuICAgICAgICBhMiA9IGEwXG4gICAgICAgIGMgID0gZy5hZGQoIDEsIGFscGhhIClcbiAgICAgICAgYjEgPSBnLm11bCggLTIgLCBjb3N3MCApXG4gICAgICAgIGIyID0gZy5zdWIoIDEsIGFscGhhIClcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGEwID0gZy5tdWwoIFEsIGFscGhhIClcbiAgICAgICAgYTEgPSAwXG4gICAgICAgIGEyID0gZy5tdWwoIGEwLCAtMSApXG4gICAgICAgIGMgID0gZy5hZGQoIDEsIGFscGhhIClcbiAgICAgICAgYjEgPSBnLm11bCggLTIgLCBjb3N3MCApXG4gICAgICAgIGIyID0gZy5zdWIoIDEsIGFscGhhIClcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiAvLyBMUFxuICAgICAgICBhMCA9IGcubWVtbyggZy5kaXYoIG9uZU1pbnVzQ29zVywgMikgKVxuICAgICAgICBhMSA9IG9uZU1pbnVzQ29zV1xuICAgICAgICBhMiA9IGEwXG4gICAgICAgIGMgID0gZy5hZGQoIDEsIGFscGhhIClcbiAgICAgICAgYjEgPSBnLm11bCggLTIgLCBjb3N3MCApXG4gICAgICAgIGIyID0gZy5zdWIoIDEsIGFscGhhIClcbiAgICB9XG5cbiAgICBhMCA9IGcuZGl2KCBhMCwgYyApOyBhMSA9IGcuZGl2KCBhMSwgYyApOyBhMiA9IGcuZGl2KCBhMiwgYyApXG4gICAgYjEgPSBnLmRpdiggYjEsIGMgKTsgYjIgPSBnLmRpdiggYjIsIGMgKVxuXG4gICAgaW4xYTAgPSBnLm11bCggeDEuaW4oIGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dCApLCBhMCApXG4gICAgeDFhMSAgPSBnLm11bCggeDIuaW4oIHgxLm91dCApLCBhMSApXG4gICAgeDJhMiAgPSBnLm11bCggeDIub3V0LCAgICAgICAgICBhMiApXG5cbiAgICBsZXQgc3VtTGVmdCA9IGcuYWRkKCBpbjFhMCwgeDFhMSwgeDJhMiApXG5cbiAgICB5MWIxID0gZy5tdWwoIHkyLmluKCB5MS5vdXQgKSwgYjEgKVxuICAgIHkyYjIgPSBnLm11bCggeTIub3V0LCBiMiApXG5cbiAgICBsZXQgc3VtUmlnaHQgPSBnLmFkZCggeTFiMSwgeTJiMiApXG5cbiAgICBsZXQgZGlmZiA9IGcuc3ViKCBzdW1MZWZ0LCBzdW1SaWdodCApXG5cbiAgICB5MS5pbiggZGlmZiApXG5cbiAgICBpZiggaXNTdGVyZW8gKSB7XG4gICAgICBsZXQgeDFfMSA9IGcuaGlzdG9yeSgpLCB4Ml8xID0gZy5oaXN0b3J5KCksIHkxXzEgPSBnLmhpc3RvcnkoKSwgeTJfMSA9IGcuaGlzdG9yeSgpXG5cbiAgICAgIGluMWEwXzEgPSBnLm11bCggeDFfMS5pbiggaW5wdXRbMV0gKSwgYTAgKVxuICAgICAgeDFhMV8xICA9IGcubXVsKCB4Ml8xLmluKCB4MV8xLm91dCApLCBhMSApXG4gICAgICB4MmEyXzEgID0gZy5tdWwoIHgyXzEub3V0LCAgICAgICAgICAgIGEyIClcblxuICAgICAgbGV0IHN1bUxlZnRfMSA9IGcuYWRkKCBpbjFhMF8xLCB4MWExXzEsIHgyYTJfMSApXG5cbiAgICAgIHkxYjFfMSA9IGcubXVsKCB5Ml8xLmluKCB5MV8xLm91dCApLCBiMSApXG4gICAgICB5MmIyXzEgPSBnLm11bCggeTJfMS5vdXQsIGIyIClcblxuICAgICAgbGV0IHN1bVJpZ2h0XzEgPSBnLmFkZCggeTFiMV8xLCB5MmIyXzEgKVxuXG4gICAgICBsZXQgZGlmZl8xID0gZy5zdWIoIHN1bUxlZnRfMSwgc3VtUmlnaHRfMSApXG5cbiAgICAgIHkxXzEuaW4oIGRpZmZfMSApXG4gICAgICBcbiAgICAgIHJldHVyblZhbHVlID0gWyBkaWZmLCBkaWZmXzEgXVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuVmFsdWUgPSBkaWZmXG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cblxuICBsZXQgQmlxdWFkID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgbGV0IGJpcXVhZCA9IE9iamVjdC5jcmVhdGUoIGZpbHRlciApXG4gICAgT2JqZWN0LmFzc2lnbiggYmlxdWFkLCBCaXF1YWQuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSBcblxuICAgIGxldCBpc1N0ZXJlbyA9IGJpcXVhZC5pbnB1dC5pc1N0ZXJlb1xuXG4gICAgYmlxdWFkLl9fY3JlYXRlR3JhcGggPSBmdW5jdGlvbigpIHtcbiAgICAgIGJpcXVhZC5ncmFwaCA9IEdpYmJlcmlzaC5nZW5pc2guYmlxdWFkKCBnLmluKCdpbnB1dCcpLCBnLm11bCggZy5pbignY3V0b2ZmJyksIGcuZ2VuLnNhbXBsZXJhdGUgLyA0ICksICBnLmluKCdRJyksIGJpcXVhZC5tb2RlLCBpc1N0ZXJlbyApXG4gICAgfVxuXG4gICAgYmlxdWFkLl9fY3JlYXRlR3JhcGgoKVxuICAgIGJpcXVhZC5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiA9IFsgJ21vZGUnIF1cblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KFxuICAgICAgYmlxdWFkLFxuICAgICAgYmlxdWFkLmdyYXBoLFxuICAgICAgJ2JpcXVhZCcsIFxuICAgICAgYmlxdWFkXG4gICAgKVxuXG4gICAgcmV0dXJuIGJpcXVhZFxuICB9XG5cbiAgQmlxdWFkLmRlZmF1bHRzID0ge1xuICAgIGlucHV0OjAsXG4gICAgUTogLjE1LFxuICAgIGN1dG9mZjouMDUsXG4gICAgbW9kZTowXG4gIH1cblxuICByZXR1cm4gQmlxdWFkXG5cbn1cblxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbmxldCBjb21iRmlsdGVyID0gZnVuY3Rpb24oIF9pbnB1dCwgY29tYkxlbmd0aCwgZGFtcGluZz0uNSouNCwgZmVlZGJhY2tDb2VmZj0uODQgKSB7XG4gIGxldCBsYXN0U2FtcGxlICAgPSBnLmhpc3RvcnkoKSxcbiAgXHQgIHJlYWRXcml0ZUlkeCA9IGcuY291bnRlciggMSwwLGNvbWJMZW5ndGggKSxcbiAgICAgIGNvbWJCdWZmZXIgICA9IGcuZGF0YSggY29tYkxlbmd0aCApLFxuXHQgICAgb3V0ICAgICAgICAgID0gZy5wZWVrKCBjb21iQnVmZmVyLCByZWFkV3JpdGVJZHgsIHsgaW50ZXJwOidub25lJywgbW9kZTonc2FtcGxlcycgfSksXG4gICAgICBzdG9yZUlucHV0ICAgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggb3V0LCBnLnN1YiggMSwgZGFtcGluZykpLCBnLm11bCggbGFzdFNhbXBsZS5vdXQsIGRhbXBpbmcgKSApIClcbiAgICAgIFxuICBsYXN0U2FtcGxlLmluKCBzdG9yZUlucHV0IClcbiBcbiAgZy5wb2tlKCBjb21iQnVmZmVyLCBnLmFkZCggX2lucHV0LCBnLm11bCggc3RvcmVJbnB1dCwgZmVlZGJhY2tDb2VmZiApICksIHJlYWRXcml0ZUlkeCApXG4gXG4gIHJldHVybiBvdXRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb21iRmlsdGVyXG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGZpbHRlciA9IHJlcXVpcmUoICcuL2ZpbHRlci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIEdpYmJlcmlzaC5nZW5pc2guZGlvZGVaREYgPSAoIGlucHV0LCBfUSwgZnJlcSwgc2F0dXJhdGlvbiwgaXNTdGVyZW89ZmFsc2UgKSA9PiB7XG4gICAgY29uc3QgaVQgPSAxIC8gZy5nZW4uc2FtcGxlcmF0ZSxcbiAgICAgICAgICBrejEgPSBnLmhpc3RvcnkoMCksXG4gICAgICAgICAga3oyID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIGt6MyA9IGcuaGlzdG9yeSgwKSxcbiAgICAgICAgICBrejQgPSBnLmhpc3RvcnkoMClcblxuICAgIGxldCAgIGthMSA9IDEuMCxcbiAgICAgICAgICBrYTIgPSAwLjUsXG4gICAgICAgICAga2EzID0gMC41LFxuICAgICAgICAgIGthNCA9IDAuNSxcbiAgICAgICAgICBraW5keCA9IDAgICBcblxuICAgIGNvbnN0IFEgPSBnLm1lbW8oIGcuYWRkKCAuNSwgZy5tdWwoIF9RLCAxMSApICkgKVxuICAgIC8vIGt3ZCA9IDIgKiAkTV9QSSAqIGFjZltraW5keF1cbiAgICBjb25zdCBrd2QgPSBnLm1lbW8oIGcubXVsKCBNYXRoLlBJICogMiwgZnJlcSApIClcblxuICAgIC8vIGt3YSA9ICgyL2lUKSAqIHRhbihrd2QgKiBpVC8yKSBcbiAgICBjb25zdCBrd2EgPWcubWVtbyggZy5tdWwoIDIvaVQsIGcudGFuKCBnLm11bCgga3dkLCBpVC8yICkgKSApIClcblxuICAgIC8vIGtHICA9IGt3YSAqIGlULzIgXG4gICAgY29uc3Qga2cgPSBnLm1lbW8oIGcubXVsKCBrd2EsIGlULzIgKSApXG4gICAgXG4gICAgY29uc3Qga0c0ID0gZy5tZW1vKCBnLm11bCggLjUsIGcuZGl2KCBrZywgZy5hZGQoIDEsIGtnICkgKSApIClcbiAgICBjb25zdCBrRzMgPSBnLm1lbW8oIGcubXVsKCAuNSwgZy5kaXYoIGtnLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBnLm11bCggLjUsIGtnICksIGtHNCApICkgKSApIClcbiAgICBjb25zdCBrRzIgPSBnLm1lbW8oIGcubXVsKCAuNSwgZy5kaXYoIGtnLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBnLm11bCggLjUsIGtnICksIGtHMyApICkgKSApIClcbiAgICBjb25zdCBrRzEgPSBnLm1lbW8oIGcuZGl2KCBrZywgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCgga2csIGtHMiApICkgKSApXG5cbiAgICBjb25zdCBrR0FNTUEgPSBnLm1lbW8oIGcubXVsKCBnLm11bCgga0c0LCBrRzMgKSAsIGcubXVsKCBrRzIsIGtHMSApICkgKVxuXG4gICAgY29uc3Qga1NHMSA9IGcubWVtbyggZy5tdWwoIGcubXVsKCBrRzQsIGtHMyApLCBrRzIgKSApIFxuXG4gICAgY29uc3Qga1NHMiA9IGcubWVtbyggZy5tdWwoIGtHNCwga0czKSApICBcbiAgICBjb25zdCBrU0czID0ga0c0IFxuICAgIGxldCBrU0c0ID0gMS4wIFxuICAgIC8vIGtrID0gNC4wKihrUSAtIDAuNSkvKDI1LjAgLSAwLjUpXG4gICAgY29uc3Qga2FscGhhID0gZy5tZW1vKCBnLmRpdigga2csIGcuYWRkKDEuMCwga2cpICkgKVxuXG4gICAgY29uc3Qga2JldGExID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBrZywga0cyICkgKSApIClcbiAgICBjb25zdCBrYmV0YTIgPSBnLm1lbW8oIGcuZGl2KCAxLjAsIGcuc3ViKCBnLmFkZCggMSwga2cgKSwgZy5tdWwoIGcubXVsKCAuNSwga2cgKSwga0czICkgKSApIClcbiAgICBjb25zdCBrYmV0YTMgPSBnLm1lbW8oIGcuZGl2KCAxLjAsIGcuc3ViKCBnLmFkZCggMSwga2cgKSwgZy5tdWwoIGcubXVsKCAuNSwga2cgKSwga0c0ICkgKSApIClcbiAgICBjb25zdCBrYmV0YTQgPSBnLm1lbW8oIGcuZGl2KCAxLjAsIGcuYWRkKCAxLCBrZyApICkgKSBcblxuICAgIGNvbnN0IGtnYW1tYTEgPSBnLm1lbW8oIGcuYWRkKCAxLCBnLm11bCgga0cxLCBrRzIgKSApIClcbiAgICBjb25zdCBrZ2FtbWEyID0gZy5tZW1vKCBnLmFkZCggMSwgZy5tdWwoIGtHMiwga0czICkgKSApXG4gICAgY29uc3Qga2dhbW1hMyA9IGcubWVtbyggZy5hZGQoIDEsIGcubXVsKCBrRzMsIGtHNCApICkgKVxuXG4gICAgY29uc3Qga2RlbHRhMSA9IGtnXG4gICAgY29uc3Qga2RlbHRhMiA9IGcubWVtbyggZy5tdWwoIDAuNSwga2cgKSApXG4gICAgY29uc3Qga2RlbHRhMyA9IGcubWVtbyggZy5tdWwoIDAuNSwga2cgKSApXG5cbiAgICBjb25zdCBrZXBzaWxvbjEgPSBrRzJcbiAgICBjb25zdCBrZXBzaWxvbjIgPSBrRzNcbiAgICBjb25zdCBrZXBzaWxvbjMgPSBrRzRcblxuICAgIGNvbnN0IGtsYXN0Y3V0ID0gZnJlcVxuXG4gICAgLy87OyBmZWVkYmFjayBpbnB1dHMgXG4gICAgY29uc3Qga2ZiNCA9IGcubWVtbyggZy5tdWwoIGtiZXRhNCAsIGt6NC5vdXQgKSApIFxuICAgIGNvbnN0IGtmYjMgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTMsIGcuYWRkKCBrejMub3V0LCBnLm11bCgga2ZiNCwga2RlbHRhMyApICkgKSApXG4gICAgY29uc3Qga2ZiMiA9IGcubWVtbyggZy5tdWwoIGtiZXRhMiwgZy5hZGQoIGt6Mi5vdXQsIGcubXVsKCBrZmIzLCBrZGVsdGEyICkgKSApIClcblxuICAgIC8vOzsgZmVlZGJhY2sgcHJvY2Vzc1xuXG4gICAgY29uc3Qga2ZibzEgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTEsIGcuYWRkKCBrejEub3V0LCBnLm11bCgga2ZiMiwga2RlbHRhMSApICkgKSApIFxuICAgIGNvbnN0IGtmYm8yID0gZy5tZW1vKCBnLm11bCgga2JldGEyLCBnLmFkZCgga3oyLm91dCwgZy5tdWwoIGtmYjMsIGtkZWx0YTIgKSApICkgKSBcbiAgICBjb25zdCBrZmJvMyA9IGcubWVtbyggZy5tdWwoIGtiZXRhMywgZy5hZGQoIGt6My5vdXQsIGcubXVsKCBrZmI0LCBrZGVsdGEzICkgKSApICkgXG4gICAgY29uc3Qga2ZibzQgPSBrZmI0XG5cbiAgICBjb25zdCBrU0lHTUEgPSBnLm1lbW8oIFxuICAgICAgZy5hZGQoIFxuICAgICAgICBnLmFkZCggXG4gICAgICAgICAgZy5tdWwoIGtTRzEsIGtmYm8xICksIFxuICAgICAgICAgIGcubXVsKCBrU0cyLCBrZmJvMiApXG4gICAgICAgICksIFxuICAgICAgICBnLmFkZChcbiAgICAgICAgICBnLm11bCgga1NHMywga2ZibzMgKSwgXG4gICAgICAgICAgZy5tdWwoIGtTRzQsIGtmYm80IClcbiAgICAgICAgKSBcbiAgICAgICkgXG4gICAgKVxuXG4gICAgLy9jb25zdCBrU0lHTUEgPSAxXG4gICAgLy87OyBub24tbGluZWFyIHByb2Nlc3NpbmdcbiAgICAvL2lmIChrbmxwID09IDEpIHRoZW5cbiAgICAvLyAga2luID0gKDEuMCAvIHRhbmgoa3NhdHVyYXRpb24pKSAqIHRhbmgoa3NhdHVyYXRpb24gKiBraW4pXG4gICAgLy9lbHNlaWYgKGtubHAgPT0gMikgdGhlblxuICAgIC8vICBraW4gPSB0YW5oKGtzYXR1cmF0aW9uICoga2luKSBcbiAgICAvL2VuZGlmXG4gICAgLy9cbiAgICAvL2NvbnN0IGtpbiA9IGlucHV0IFxuICAgIGxldCBraW4gPSBpbnB1dC8vZy5tZW1vKCBnLm11bCggZy5kaXYoIDEsIGcudGFuaCggc2F0dXJhdGlvbiApICksIGcudGFuaCggZy5tdWwoIHNhdHVyYXRpb24sIGlucHV0ICkgKSApIClcbiAgICBraW4gPSBnLnRhbmgoIGcubXVsKCBzYXR1cmF0aW9uLCBraW4gKSApXG5cbiAgICBjb25zdCBrdW4gPSBnLmRpdiggZy5zdWIoIGtpbiwgZy5tdWwoIFEsIGtTSUdNQSApICksIGcuYWRkKCAxLCBnLm11bCggUSwga0dBTU1BICkgKSApXG4gICAgLy9jb25zdCBrdW4gPSBnLmRpdiggMSwgZy5hZGQoIDEsIGcubXVsKCBRLCBrR0FNTUEgKSApIClcbiAgICAgICAgLy8oa2luIC0ga2sgKiBrU0lHTUEpIC8gKDEuMCArIGtrICoga0dBTU1BKVxuXG4gICAgLy87OyAxc3Qgc3RhZ2VcbiAgICBsZXQga3hpbiA9IGcubWVtbyggZy5hZGQoIGcuYWRkKCBnLm11bCgga3VuLCBrZ2FtbWExICksIGtmYjIpLCBnLm11bCgga2Vwc2lsb24xLCBrZmJvMSApICkgKVxuICAgIC8vIChrdW4gKiBrZ2FtbWExICsga2ZiMiArIGtlcHNpbG9uMSAqIGtmYm8xKVxuICAgIGxldCBrdiA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBnLm11bCgga2ExLCBreGluICksIGt6MS5vdXQgKSwga2FscGhhICkgKVxuICAgIC8va3YgPSAoa2ExICoga3hpbiAtIGt6MSkgKiBrYWxwaGEgXG4gICAgbGV0IGtscCA9IGcuYWRkKCBrdiwga3oxLm91dCApXG4gICAgLy9rbHAgPSBrdiArIGt6MVxuICAgIGt6MS5pbiggZy5hZGQoIGtscCwga3YgKSApIFxuICAgIC8va3oxID0ga2xwICsga3ZcblxuICAgICAgICAvLzs7IDJuZCBzdGFnZVxuICAgIC8va3hpbiA9IChrbHAgKiBrZ2FtbWEyICsga2ZiMyArIGtlcHNpbG9uMiAqIGtmYm8yKVxuICAgIC8va3YgPSAoa2EyICoga3hpbiAtIGt6MikgKiBrYWxwaGEgXG4gICAgLy9rbHAgPSBrdiArIGt6MlxuICAgIC8va3oyID0ga2xwICsga3ZcblxuICAgIGt4aW4gPSBnLm1lbW8oIGcuYWRkKCBnLmFkZCggZy5tdWwoIGtscCwga2dhbW1hMiApLCBrZmIzKSwgZy5tdWwoIGtlcHNpbG9uMiwga2ZibzIgKSApIClcbiAgICAvLyAoa3VuICoga2dhbW1hMSArIGtmYjIgKyBrZXBzaWxvbjEgKiBrZmJvMSlcbiAgICBrdiA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBnLm11bCgga2EyLCBreGluICksIGt6Mi5vdXQgKSwga2FscGhhICkgKVxuICAgIC8va3YgPSAoa2ExICoga3hpbiAtIGt6MSkgKiBrYWxwaGEgXG4gICAga2xwID0gZy5hZGQoIGt2LCBrejIub3V0ICkgXG4gICAgLy9rbHAgPSBrdiArIGt6MVxuICAgIGt6Mi5pbiggZy5hZGQoIGtscCwga3YgKSApIFxuICAgIC8va3oxID0ga2xwICsga3ZcblxuICAgIC8vOzsgM3JkIHN0YWdlXG4gICAgLy9reGluID0gKGtscCAqIGtnYW1tYTMgKyBrZmI0ICsga2Vwc2lsb24zICoga2ZibzMpXG4gICAgLy9rdiA9IChrYTMgKiBreGluIC0ga3ozKSAqIGthbHBoYSBcbiAgICAvL2tscCA9IGt2ICsga3ozXG4gICAgLy9rejMgPSBrbHAgKyBrdlxuXG4gICAga3hpbiA9IGcubWVtbyggZy5hZGQoIGcuYWRkKCBnLm11bCgga2xwLCBrZ2FtbWEzICksIGtmYjQpLCBnLm11bCgga2Vwc2lsb24zLCBrZmJvMyApICkgKVxuICAgIC8vIChrdW4gKiBrZ2FtbWExICsga2ZiMiArIGtlcHNpbG9uMSAqIGtmYm8xKVxuICAgIGt2ID0gZy5tZW1vKCBnLm11bCggZy5zdWIoIGcubXVsKCBrYTMsIGt4aW4gKSwga3ozLm91dCApLCBrYWxwaGEgKSApXG4gICAgLy9rdiA9IChrYTEgKiBreGluIC0ga3oxKSAqIGthbHBoYSBcbiAgICBrbHAgPSBnLmFkZCgga3YsIGt6My5vdXQgKVxuICAgIC8va2xwID0ga3YgKyBrejFcbiAgICBrejMuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKVxuICAgIC8va3oxID0ga2xwICsga3ZcblxuICAgIC8vOzsgNHRoIHN0YWdlXG4gICAgLy9rdiA9IChrYTQgKiBrbHAgLSBrejQpICoga2FscGhhIFxuICAgIC8va2xwID0ga3YgKyBrejRcbiAgICAvL2t6NCA9IGtscCArIGt2XG5cbiAgICAvLyAoa3VuICoga2dhbW1hMSArIGtmYjIgKyBrZXBzaWxvbjEgKiBrZmJvMSlcbiAgICBrdiA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBnLm11bCgga2E0LCBreGluICksIGt6NC5vdXQgKSwga2FscGhhICkgKVxuICAgIC8va3YgPSAoa2ExICoga3hpbiAtIGt6MSkgKiBrYWxwaGEgXG4gICAga2xwID0gZy5hZGQoIGt2LCBrejQub3V0IClcbiAgICAvL2tscCA9IGt2ICsga3oxXG4gICAga3o0LmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIC8va3oxID0ga2xwICsga3ZcbiAgICBpZiggaXNTdGVyZW8gKSB7XG4gICAgICAvL2xldCBwb2xlc1IgPSBnLmRhdGEoWyAwLDAsMCwwIF0sIDEsIHsgbWV0YTp0cnVlIH0pLFxuICAgICAgLy8gICAgcmV6elIgPSBnLmNsYW1wKCBnLm11bCggcG9sZXNSWzNdLCByZXogKSApLFxuICAgICAgLy8gICAgb3V0cHV0UiA9IGcuc3ViKCBpbnB1dFsxXSwgcmV6elIgKSAgICAgICAgIFxuXG4gICAgICAvL3BvbGVzUlswXSA9IGcuYWRkKCBwb2xlc1JbMF0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlswXSApLCBvdXRwdXRSICAgKSwgY3V0b2ZmICkpXG4gICAgICAvL3BvbGVzUlsxXSA9IGcuYWRkKCBwb2xlc1JbMV0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlsxXSApLCBwb2xlc1JbMF0gKSwgY3V0b2ZmICkpXG4gICAgICAvL3BvbGVzUlsyXSA9IGcuYWRkKCBwb2xlc1JbMl0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlsyXSApLCBwb2xlc1JbMV0gKSwgY3V0b2ZmICkpXG4gICAgICAvL3BvbGVzUlszXSA9IGcuYWRkKCBwb2xlc1JbM10sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlszXSApLCBwb2xlc1JbMl0gKSwgY3V0b2ZmICkpXG5cbiAgICAgIC8vbGV0IHJpZ2h0ID0gZy5zd2l0Y2goIGlzTG93UGFzcywgcG9sZXNSWzNdLCBnLnN1Yiggb3V0cHV0UiwgcG9sZXNSWzNdICkgKVxuXG4gICAgICAvL3JldHVyblZhbHVlID0gW2xlZnQsIHJpZ2h0XVxuICAgIH1lbHNle1xuICAgICAvLyByZXR1cm5WYWx1ZSA9IGtscFxuICAgIH1cbiAgICByZXR1cm5WYWx1ZSA9IGtscFxuICAgIFxuICAgIHJldHVybiByZXR1cm5WYWx1ZS8vIGtscC8vcmV0dXJuVmFsdWVcbiB9XG5cbiAgY29uc3QgRGlvZGVaREYgPSBpbnB1dFByb3BzID0+IHtcbiAgICBjb25zdCB6ZGYgICAgICA9IE9iamVjdC5jcmVhdGUoIGZpbHRlciApXG4gICAgY29uc3QgcHJvcHMgICAgPSBPYmplY3QuYXNzaWduKCB7fSwgRGlvZGVaREYuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIHpkZiwgXG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLmRpb2RlWkRGKCBnLmluKCdpbnB1dCcpLCBnLmluKCdRJyksIGcuaW4oJ2N1dG9mZicpLCBnLmluKCdzYXR1cmF0aW9uJyksIGlzU3RlcmVvICksIFxuICAgICAgJ2Rpb2RlWkRGJyxcbiAgICAgIHByb3BzXG4gICAgKVxuXG4gICAgcmV0dXJuIHpkZlxuICB9XG5cbiAgRGlvZGVaREYuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICBROiA1LFxuICAgIHNhdHVyYXRpb246IDEsXG4gICAgY3V0b2ZmOiA0NDAsXG4gIH1cblxuICByZXR1cm4gRGlvZGVaREZcblxufVxuIiwibGV0IHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5sZXQgZmlsdGVyID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbk9iamVjdC5hc3NpZ24oIGZpbHRlciwge1xuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZpbHRlclxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGZpbHRlciA9IHJlcXVpcmUoICcuL2ZpbHRlci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgR2liYmVyaXNoLmdlbmlzaC5maWx0ZXIyNCA9ICggaW5wdXQsIF9yZXosIF9jdXRvZmYsIGlzTG93UGFzcywgaXNTdGVyZW89ZmFsc2UgKSA9PiB7XG4gICAgbGV0IHJldHVyblZhbHVlLFxuICAgICAgICBwb2xlc0wgPSBnLmRhdGEoWyAwLDAsMCwwIF0sIDEsIHsgbWV0YTp0cnVlIH0pLFxuICAgICAgICBwZWVrUHJvcHMgPSB7IGludGVycDonbm9uZScsIG1vZGU6J3NpbXBsZScgfSxcbiAgICAgICAgcmV6ID0gZy5tZW1vKCBnLm11bCggX3JleiwgNSApICksXG4gICAgICAgIGN1dG9mZiA9IGcubWVtbyggZy5kaXYoIF9jdXRvZmYsIDExMDI1ICkgKSxcbiAgICAgICAgcmV6ekwgPSBnLmNsYW1wKCBnLm11bCggcG9sZXNMWzNdLCByZXogKSApLFxuICAgICAgICBvdXRwdXRMID0gZy5zdWIoIGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dCwgcmV6ekwgKSBcblxuICAgIHBvbGVzTFswXSA9IGcuYWRkKCBwb2xlc0xbMF0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzTFswXSApLCBvdXRwdXRMICAgKSwgY3V0b2ZmICkpXG4gICAgcG9sZXNMWzFdID0gZy5hZGQoIHBvbGVzTFsxXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNMWzFdICksIHBvbGVzTFswXSApLCBjdXRvZmYgKSlcbiAgICBwb2xlc0xbMl0gPSBnLmFkZCggcG9sZXNMWzJdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc0xbMl0gKSwgcG9sZXNMWzFdICksIGN1dG9mZiApKVxuICAgIHBvbGVzTFszXSA9IGcuYWRkKCBwb2xlc0xbM10sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzTFszXSApLCBwb2xlc0xbMl0gKSwgY3V0b2ZmICkpXG4gICAgXG4gICAgbGV0IGxlZnQgPSBnLnN3aXRjaCggaXNMb3dQYXNzLCBwb2xlc0xbM10sIGcuc3ViKCBvdXRwdXRMLCBwb2xlc0xbM10gKSApXG5cbiAgICBpZiggaXNTdGVyZW8gKSB7XG4gICAgICBsZXQgcG9sZXNSID0gZy5kYXRhKFsgMCwwLDAsMCBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgICAgICByZXp6UiA9IGcuY2xhbXAoIGcubXVsKCBwb2xlc1JbM10sIHJleiApICksXG4gICAgICAgICAgb3V0cHV0UiA9IGcuc3ViKCBpbnB1dFsxXSwgcmV6elIgKSAgICAgICAgIFxuXG4gICAgICBwb2xlc1JbMF0gPSBnLmFkZCggcG9sZXNSWzBdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMF0gKSwgb3V0cHV0UiAgICksIGN1dG9mZiApKVxuICAgICAgcG9sZXNSWzFdID0gZy5hZGQoIHBvbGVzUlsxXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNSWzFdICksIHBvbGVzUlswXSApLCBjdXRvZmYgKSlcbiAgICAgIHBvbGVzUlsyXSA9IGcuYWRkKCBwb2xlc1JbMl0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlsyXSApLCBwb2xlc1JbMV0gKSwgY3V0b2ZmICkpXG4gICAgICBwb2xlc1JbM10gPSBnLmFkZCggcG9sZXNSWzNdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbM10gKSwgcG9sZXNSWzJdICksIGN1dG9mZiApKVxuXG4gICAgICBsZXQgcmlnaHQgPSBnLnN3aXRjaCggaXNMb3dQYXNzLCBwb2xlc1JbM10sIGcuc3ViKCBvdXRwdXRSLCBwb2xlc1JbM10gKSApXG5cbiAgICAgIHJldHVyblZhbHVlID0gW2xlZnQsIHJpZ2h0XVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuVmFsdWUgPSBsZWZ0XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cblxuICBsZXQgRmlsdGVyMjQgPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgZmlsdGVyMjQgICA9IE9iamVjdC5jcmVhdGUoIGZpbHRlciApXG4gICAgbGV0IHByb3BzICAgID0gT2JqZWN0LmFzc2lnbigge30sIEZpbHRlcjI0LmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyBcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KFxuICAgICAgZmlsdGVyMjQsIFxuICAgICAgR2liYmVyaXNoLmdlbmlzaC5maWx0ZXIyNCggZy5pbignaW5wdXQnKSwgZy5pbignUScpLCBnLmluKCdjdXRvZmYnKSwgZy5pbignaXNMb3dQYXNzJyksIGlzU3RlcmVvICksIFxuICAgICAgJ2ZpbHRlcjI0JyxcbiAgICAgIHByb3BzXG4gICAgKVxuXG4gICAgcmV0dXJuIGZpbHRlcjI0XG4gIH1cblxuXG4gIEZpbHRlcjI0LmRlZmF1bHRzID0ge1xuICAgIGlucHV0OjAsXG4gICAgUTogLjI1LFxuICAgIGN1dG9mZjogODgwLFxuICAgIGlzTG93UGFzczoxXG4gIH1cblxuICByZXR1cm4gRmlsdGVyMjRcblxufVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgZyA9IEdpYmJlcmlzaC5nZW5pc2hcblxuICBjb25zdCBmaWx0ZXJzID0ge1xuICAgIEZpbHRlcjI0Q2xhc3NpYyA6IHJlcXVpcmUoICcuL2ZpbHRlcjI0LmpzJyAgKSggR2liYmVyaXNoICksXG4gICAgRmlsdGVyMjRNb29nICAgIDogcmVxdWlyZSggJy4vbGFkZGVyRmlsdGVyWmVyb0RlbGF5LmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgICBGaWx0ZXIyNFRCMzAzICAgOiByZXF1aXJlKCAnLi9kaW9kZUZpbHRlclpERi5qcycgKSggR2liYmVyaXNoICksXG4gICAgRmlsdGVyMTJCaXF1YWQgIDogcmVxdWlyZSggJy4vYmlxdWFkLmpzJyAgICApKCBHaWJiZXJpc2ggKSxcbiAgICBGaWx0ZXIxMlNWRiAgICAgOiByZXF1aXJlKCAnLi9zdmYuanMnICAgICAgICkoIEdpYmJlcmlzaCApLFxuICAgIFxuICAgIC8vIG5vdCBmb3IgdXNlIGJ5IGVuZC11c2Vyc1xuICAgIGdlbmlzaDoge1xuICAgICAgQ29tYiAgICAgICAgOiByZXF1aXJlKCAnLi9jb21iZmlsdGVyLmpzJyApLFxuICAgICAgQWxsUGFzcyAgICAgOiByZXF1aXJlKCAnLi9hbGxwYXNzLmpzJyApXG4gICAgfSxcblxuICAgIGZhY3RvcnkoIGlucHV0LCBjdXRvZmYsIHJlc29uYW5jZSwgc2F0dXJhdGlvbiA9IG51bGwsIF9wcm9wcywgaXNTdGVyZW8gPSBmYWxzZSApIHtcbiAgICAgIGxldCBmaWx0ZXJlZE9zYyBcblxuICAgICAgLy9pZiggcHJvcHMuZmlsdGVyVHlwZSA9PT0gMSApIHtcbiAgICAgIC8vICBpZiggdHlwZW9mIHByb3BzLmN1dG9mZiAhPT0gJ29iamVjdCcgJiYgcHJvcHMuY3V0b2ZmID4gMSApIHtcbiAgICAgIC8vICAgIHByb3BzLmN1dG9mZiA9IC4yNVxuICAgICAgLy8gIH1cbiAgICAgIC8vICBpZiggdHlwZW9mIHByb3BzLmN1dG9mZiAhPT0gJ29iamVjdCcgJiYgcHJvcHMuZmlsdGVyTXVsdCA+IC41ICkge1xuICAgICAgLy8gICAgcHJvcHMuZmlsdGVyTXVsdCA9IC4xXG4gICAgICAvLyAgfVxuICAgICAgLy99XG4gICAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBmaWx0ZXJzLmRlZmF1bHRzLCBfcHJvcHMgKVxuXG4gICAgICBzd2l0Y2goIHByb3BzLmZpbHRlclR5cGUgKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpc0xvd1Bhc3MgPSBnLnBhcmFtKCAnbG93UGFzcycsIDEgKSxcbiAgICAgICAgICBmaWx0ZXJlZE9zYyA9IGcuZmlsdGVyMjQoIGlucHV0LCBnLmluKCdRJyksIGN1dG9mZiwgcHJvcHMuZmlsdGVyTW9kZSwgaXNTdGVyZW8gKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBnLnpkMjQoIGlucHV0LCBnLmluKCdRJyksIGN1dG9mZiApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBmaWx0ZXJlZE9zYyA9IGcuZGlvZGVaREYoIGlucHV0LCBnLmluKCdRJyksIGN1dG9mZiwgZy5pbignc2F0dXJhdGlvbicpLCBpc1N0ZXJlbyApIFxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBnLnN2ZiggaW5wdXQsIGN1dG9mZiwgZy5zdWIoIDEsIGcuaW4oJ1EnKSksIHByb3BzLmZpbHRlck1vZGUsIGlzU3RlcmVvICkgXG4gICAgICAgICAgYnJlYWs7IFxuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBnLmJpcXVhZCggaW5wdXQsIGN1dG9mZiwgIGcuaW4oJ1EnKSwgcHJvcHMuZmlsdGVyTW9kZSwgaXNTdGVyZW8gKSBcbiAgICAgICAgICBicmVhazsgXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy8gcmV0dXJuIHVuZmlsdGVyZWQgc2lnbmFsXG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBpbnB1dCAvL2cuZmlsdGVyMjQoIG9zY1dpdGhHYWluLCBnLmluKCdyZXNvbmFuY2UnKSwgY3V0b2ZmLCBpc0xvd1Bhc3MgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmlsdGVyZWRPc2NcbiAgICB9LFxuXG4gICAgZGVmYXVsdHM6IHsgZmlsdGVyTW9kZTogMCwgZmlsdGVyVHlwZTowIH1cbiAgfVxuXG4gIGZpbHRlcnMuZXhwb3J0ID0gdGFyZ2V0ID0+IHtcbiAgICBmb3IoIGxldCBrZXkgaW4gZmlsdGVycyApIHtcbiAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICYmIGtleSAhPT0gJ2dlbmlzaCcgKSB7XG4gICAgICAgIHRhcmdldFsga2V5IF0gPSBmaWx0ZXJzWyBrZXkgXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5yZXR1cm4gZmlsdGVyc1xuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGZpbHRlciA9IHJlcXVpcmUoICcuL2ZpbHRlci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgR2liYmVyaXNoLmdlbmlzaC56ZDI0ID0gKCBpbnB1dCwgX1EsIGZyZXEsIGlzU3RlcmVvPWZhbHNlICkgPT4ge1xuICAgIGNvbnN0IGlUID0gMSAvIGcuZ2VuLnNhbXBsZXJhdGUsXG4gICAgICAgICAgejEgPSBnLmhpc3RvcnkoMCksXG4gICAgICAgICAgejIgPSBnLmhpc3RvcnkoMCksXG4gICAgICAgICAgejMgPSBnLmhpc3RvcnkoMCksXG4gICAgICAgICAgejQgPSBnLmhpc3RvcnkoMClcbiAgICBcbiAgICBjb25zdCBRID0gZy5tZW1vKCBnLmFkZCggLjUsIGcubXVsKCBfUSwgMjMgKSApIClcbiAgICAvLyBrd2QgPSAyICogJE1fUEkgKiBhY2Zba2luZHhdXG4gICAgY29uc3Qga3dkID0gZy5tZW1vKCBnLm11bCggTWF0aC5QSSAqIDIsIGZyZXEgKSApXG5cbiAgICAvLyBrd2EgPSAoMi9pVCkgKiB0YW4oa3dkICogaVQvMikgXG4gICAgY29uc3Qga3dhID1nLm1lbW8oIGcubXVsKCAyL2lULCBnLnRhbiggZy5tdWwoIGt3ZCwgaVQvMiApICkgKSApXG5cbiAgICAvLyBrRyAgPSBrd2EgKiBpVC8yIFxuICAgIGNvbnN0IGtnID0gZy5tZW1vKCBnLm11bCgga3dhLCBpVC8yICkgKVxuXG4gICAgLy8ga2sgPSA0LjAqKGtRIC0gMC41KS8oMjUuMCAtIDAuNSlcbiAgICBjb25zdCBrayA9IGcubWVtbyggZy5tdWwoIDQsIGcuZGl2KCBnLnN1YiggUSwgLjUgKSwgMjQuNSApICkgKVxuXG4gICAgLy8ga2dfcGx1c18xID0gKDEuMCArIGtnKVxuICAgIGNvbnN0IGtnX3BsdXNfMSA9IGcuYWRkKCAxLCBrZyApXG5cbiAgICAvLyBrRyA9IGtnIC8ga2dfcGx1c18xIFxuICAgIGNvbnN0IGtHICAgICA9IGcubWVtbyggZy5kaXYoIGtnLCBrZ19wbHVzXzEgKSApLFxuICAgICAgICAgIGtHXzIgICA9IGcubWVtbyggZy5tdWwoIGtHLCBrRyApICksXG4gICAgICAgICAga0dfMyAgID0gZy5tdWwoIGtHXzIsIGtHICksXG4gICAgICAgICAga0dBTU1BID0gZy5tdWwoIGtHXzIsIGtHXzIgKVxuXG4gICAgY29uc3Qga1MxID0gZy5kaXYoIHoxLm91dCwga2dfcGx1c18xICksXG4gICAgICAgICAga1MyID0gZy5kaXYoIHoyLm91dCwga2dfcGx1c18xICksXG4gICAgICAgICAga1MzID0gZy5kaXYoIHozLm91dCwga2dfcGx1c18xICksXG4gICAgICAgICAga1M0ID0gZy5kaXYoIHo0Lm91dCwga2dfcGx1c18xIClcblxuICAgIC8va1MgPSBrR18zICoga1MxICArIGtHXzIgKiBrUzIgKyBrRyAqIGtTMyArIGtTNCBcbiAgICBjb25zdCBrUyA9IGcubWVtbyggXG4gICAgICBnLmFkZChcbiAgICAgICAgZy5hZGQoIGcubXVsKGtHXzMsIGtTMSksIGcubXVsKCBrR18yLCBrUzIpICksXG4gICAgICAgIGcuYWRkKCBnLm11bChrRywga1MzKSwga1M0IClcbiAgICAgIClcbiAgICApXG5cbiAgICAvL2t1ID0gKGtpbiAtIGtrICogIGtTKSAvICgxICsga2sgKiBrR0FNTUEpXG4gICAgY29uc3Qga3UxID0gZy5zdWIoIGlucHV0LCBnLm11bCgga2ssIGtTICkgKVxuICAgIGNvbnN0IGt1MiA9IGcubWVtbyggZy5hZGQoIDEsIGcubXVsKCBraywga0dBTU1BICkgKSApXG4gICAgY29uc3Qga3UgID0gZy5tZW1vKCBnLmRpdigga3UxLCBrdTIgKSApXG5cbiAgICBsZXQga3YgPSAgZy5tZW1vKCBnLm11bCggZy5zdWIoIGt1LCB6MS5vdXQgKSwga0cgKSApXG4gICAgbGV0IGtscCA9IGcubWVtbyggZy5hZGQoIGt2LCB6MS5vdXQgKSApXG4gICAgejEuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKVxuXG4gICAga3YgID0gZy5tZW1vKCBnLm11bCggZy5zdWIoIGtscCwgejIub3V0ICksIGtHICkgKVxuICAgIGtscCA9IGcubWVtbyggZy5hZGQoIGt2LCB6Mi5vdXQgKSApXG4gICAgejIuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKVxuXG4gICAga3YgID0gZy5tZW1vKCBnLm11bCggZy5zdWIoIGtscCwgejMub3V0ICksIGtHICkgKVxuICAgIGtscCA9IGcubWVtbyggZy5hZGQoIGt2LCB6My5vdXQgKSApXG4gICAgejMuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKVxuXG4gICAga3YgID0gZy5tZW1vKCBnLm11bCggZy5zdWIoIGtscCwgejQub3V0ICksIGtHICkgKVxuICAgIGtscCA9IGcubWVtbyggZy5hZGQoIGt2LCB6NC5vdXQgKSApXG4gICAgejQuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKVxuXG5cbiAgICBpZiggaXNTdGVyZW8gKSB7XG4gICAgICAvL2xldCBwb2xlc1IgPSBnLmRhdGEoWyAwLDAsMCwwIF0sIDEsIHsgbWV0YTp0cnVlIH0pLFxuICAgICAgLy8gICAgcmV6elIgPSBnLmNsYW1wKCBnLm11bCggcG9sZXNSWzNdLCByZXogKSApLFxuICAgICAgLy8gICAgb3V0cHV0UiA9IGcuc3ViKCBpbnB1dFsxXSwgcmV6elIgKSAgICAgICAgIFxuXG4gICAgICAvL3BvbGVzUlswXSA9IGcuYWRkKCBwb2xlc1JbMF0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlswXSApLCBvdXRwdXRSICAgKSwgY3V0b2ZmICkpXG4gICAgICAvL3BvbGVzUlsxXSA9IGcuYWRkKCBwb2xlc1JbMV0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlsxXSApLCBwb2xlc1JbMF0gKSwgY3V0b2ZmICkpXG4gICAgICAvL3BvbGVzUlsyXSA9IGcuYWRkKCBwb2xlc1JbMl0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlsyXSApLCBwb2xlc1JbMV0gKSwgY3V0b2ZmICkpXG4gICAgICAvL3BvbGVzUlszXSA9IGcuYWRkKCBwb2xlc1JbM10sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlszXSApLCBwb2xlc1JbMl0gKSwgY3V0b2ZmICkpXG5cbiAgICAgIC8vbGV0IHJpZ2h0ID0gZy5zd2l0Y2goIGlzTG93UGFzcywgcG9sZXNSWzNdLCBnLnN1Yiggb3V0cHV0UiwgcG9sZXNSWzNdICkgKVxuXG4gICAgICAvL3JldHVyblZhbHVlID0gW2xlZnQsIHJpZ2h0XVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuVmFsdWUgPSBrbHBcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxuXG4gIGNvbnN0IFpkMjQgPSBpbnB1dFByb3BzID0+IHtcbiAgICBjb25zdCBmaWx0ZXIgICA9IE9iamVjdC5jcmVhdGUoIGZpbHRlciApXG4gICAgY29uc3QgcHJvcHMgICAgPSBPYmplY3QuYXNzaWduKCB7fSwgWmQyNC5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgY29uc3QgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyBcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KFxuICAgICAgZmlsdGVyLCBcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guemQyNCggZy5pbignaW5wdXQnKSwgZy5pbignUScpLCBnLmluKCdjdXRvZmYnKSwgaXNTdGVyZW8gKSwgXG4gICAgICAnemQyNCcsXG4gICAgICBwcm9wc1xuICAgIClcblxuICAgIHJldHVybiBmaWx0ZXJcbiAgfVxuXG5cbiAgWmQyNC5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIFE6IDUsXG4gICAgY3V0b2ZmOiA0NDAsXG4gIH1cblxuICByZXR1cm4gWmQyNFxuXG59XG5cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZmlsdGVyID0gcmVxdWlyZSggJy4vZmlsdGVyLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgR2liYmVyaXNoLmdlbmlzaC5zdmYgPSAoIGlucHV0LCBjdXRvZmYsIFEsIG1vZGUsIGlzU3RlcmVvICkgPT4ge1xuICAgIGxldCBkMSA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSksIGQyID0gZy5kYXRhKFswLDBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgICAgcGVla1Byb3BzID0geyBtb2RlOidzaW1wbGUnLCBpbnRlcnA6J25vbmUnIH1cblxuICAgIGxldCBmMSA9IGcubWVtbyggZy5tdWwoIDIgKiBNYXRoLlBJLCBnLmRpdiggY3V0b2ZmLCBnLmdlbi5zYW1wbGVyYXRlICkgKSApXG4gICAgbGV0IG9uZU92ZXJRID0gZy5tZW1vKCBnLmRpdiggMSwgUSApIClcbiAgICBsZXQgbCA9IGcubWVtbyggZy5hZGQoIGQyWzBdLCBnLm11bCggZjEsIGQxWzBdICkgKSApLFxuICAgICAgICBoID0gZy5tZW1vKCBnLnN1YiggZy5zdWIoIGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dCwgbCApLCBnLm11bCggUSwgZDFbMF0gKSApICksXG4gICAgICAgIGIgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggZjEsIGggKSwgZDFbMF0gKSApLFxuICAgICAgICBuID0gZy5tZW1vKCBnLmFkZCggaCwgbCApIClcblxuICAgIGQxWzBdID0gYlxuICAgIGQyWzBdID0gbFxuXG4gICAgbGV0IG91dCA9IGcuc2VsZWN0b3IoIG1vZGUsIGwsIGgsIGIsIG4gKVxuXG4gICAgbGV0IHJldHVyblZhbHVlXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgbGV0IGQxMiA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSksIGQyMiA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSlcbiAgICAgIGxldCBsMiA9IGcubWVtbyggZy5hZGQoIGQyMlswXSwgZy5tdWwoIGYxLCBkMTJbMF0gKSApICksXG4gICAgICAgICAgaDIgPSBnLm1lbW8oIGcuc3ViKCBnLnN1YiggaW5wdXRbMV0sIGwyICksIGcubXVsKCBRLCBkMTJbMF0gKSApICksXG4gICAgICAgICAgYjIgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggZjEsIGgyICksIGQxMlswXSApICksXG4gICAgICAgICAgbjIgPSBnLm1lbW8oIGcuYWRkKCBoMiwgbDIgKSApXG5cbiAgICAgIGQxMlswXSA9IGIyXG4gICAgICBkMjJbMF0gPSBsMlxuXG4gICAgICBsZXQgb3V0MiA9IGcuc2VsZWN0b3IoIG1vZGUsIGwyLCBoMiwgYjIsIG4yIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBbIG91dCwgb3V0MiBdXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbiAgbGV0IFNWRiA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGNvbnN0IHN2ZiA9IE9iamVjdC5jcmVhdGUoIGZpbHRlciApXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgU1ZGLmRlZmF1bHRzLCBpbnB1dFByb3BzICkgXG5cbiAgICBjb25zdCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvXG4gICAgXG4gICAgLy8gWFhYIE5FRURTIFJFRkFDVE9SSU5HXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgc3ZmLFxuICAgICAgR2liYmVyaXNoLmdlbmlzaC5zdmYoIGcuaW4oJ2lucHV0JyksIGcubXVsKCBnLmluKCdjdXRvZmYnKSwgZy5nZW4uc2FtcGxlcmF0ZSAvIDUgKSwgZy5zdWIoIDEsIGcuaW4oJ1EnKSApLCBnLmluKCdtb2RlJyksIGlzU3RlcmVvICksIFxuICAgICAgJ3N2ZicsIFxuICAgICAgcHJvcHNcbiAgICApXG5cbiAgICByZXR1cm4gc3ZmXG4gIH1cblxuXG4gIFNWRi5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIFE6IC43NSxcbiAgICBjdXRvZmY6LjM1LFxuICAgIG1vZGU6MFxuICB9XG5cbiAgcmV0dXJuIFNWRlxuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IEJpdENydXNoZXIgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbiggeyBiaXRDcnVzaGVyTGVuZ3RoOiA0NDEwMCB9LCBCaXRDcnVzaGVyLmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICBiaXRDcnVzaGVyID0gT2JqZWN0LmNyZWF0ZSggZWZmZWN0IClcblxuICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuICBcbiAgbGV0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgYml0RGVwdGggPSBnLmluKCAnYml0RGVwdGgnICksXG4gICAgICBzYW1wbGVSYXRlID0gZy5pbiggJ3NhbXBsZVJhdGUnICksXG4gICAgICBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WyAwIF0gOiBpbnB1dCxcbiAgICAgIHJpZ2h0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WyAxIF0gOiBudWxsXG4gIFxuICBsZXQgc3RvcmVMID0gZy5oaXN0b3J5KDApXG4gIGxldCBzYW1wbGVSZWR1eENvdW50ZXIgPSBnLmNvdW50ZXIoIHNhbXBsZVJhdGUsIDAsIDEgKVxuXG4gIGxldCBiaXRNdWx0ID0gZy5wb3coIGcubXVsKCBiaXREZXB0aCwgMTYgKSwgMiApXG4gIGxldCBjcnVzaGVkTCA9IGcuZGl2KCBnLmZsb29yKCBnLm11bCggbGVmdElucHV0LCBiaXRNdWx0ICkgKSwgYml0TXVsdCApXG5cbiAgbGV0IG91dEwgPSBnLnN3aXRjaChcbiAgICBzYW1wbGVSZWR1eENvdW50ZXIud3JhcCxcbiAgICBjcnVzaGVkTCxcbiAgICBzdG9yZUwub3V0XG4gIClcblxuICBpZiggaXNTdGVyZW8gKSB7XG4gICAgbGV0IHN0b3JlUiA9IGcuaGlzdG9yeSgwKVxuICAgIGxldCBjcnVzaGVkUiA9IGcuZGl2KCBnLmZsb29yKCBnLm11bCggcmlnaHRJbnB1dCwgYml0TXVsdCApICksIGJpdE11bHQgKVxuXG4gICAgbGV0IG91dFIgPSB0ZXJuYXJ5KCBcbiAgICAgIHNhbXBsZVJlZHV4Q291bnRlci53cmFwLFxuICAgICAgY3J1c2hlZFIsXG4gICAgICBzdG9yZUwub3V0XG4gICAgKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgYml0Q3J1c2hlcixcbiAgICAgIFsgb3V0TCwgb3V0UiBdLCBcbiAgICAgICdiaXRDcnVzaGVyJywgXG4gICAgICBwcm9wcyBcbiAgICApXG4gIH1lbHNle1xuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBiaXRDcnVzaGVyLCBvdXRMLCAnYml0Q3J1c2hlcicsIHByb3BzIClcbiAgfVxuICBcbiAgcmV0dXJuIGJpdENydXNoZXJcbn1cblxuQml0Q3J1c2hlci5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgYml0RGVwdGg6LjUsXG4gIHNhbXBsZVJhdGU6IC41XG59XG5cbnJldHVybiBCaXRDcnVzaGVyXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBsZXQgcHJvdG8gPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBTaHVmZmxlciA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGxldCBidWZmZXJTaHVmZmxlciA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICAgIGJ1ZmZlclNpemUgPSA4ODIwMFxuXG4gICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIFNodWZmbGVyLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IGZhbHNlXG4gICAgbGV0IHBoYXNlID0gZy5hY2N1bSggMSwwLHsgc2hvdWxkV3JhcDogZmFsc2UgfSlcblxuICAgIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgICAgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMCBdIDogaW5wdXQsXG4gICAgICAgIHJpZ2h0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WyAxIF0gOiBudWxsLFxuICAgICAgICByYXRlT2ZTaHVmZmxpbmcgPSBnLmluKCAncmF0ZScgKSxcbiAgICAgICAgY2hhbmNlT2ZTaHVmZmxpbmcgPSBnLmluKCAnY2hhbmNlJyApLFxuICAgICAgICByZXZlcnNlQ2hhbmNlID0gZy5pbiggJ3JldmVyc2VDaGFuY2UnICksXG4gICAgICAgIHJlcGl0Y2hDaGFuY2UgPSBnLmluKCAncmVwaXRjaENoYW5jZScgKSxcbiAgICAgICAgcmVwaXRjaE1pbiA9IGcuaW4oICdyZXBpdGNoTWluJyApLFxuICAgICAgICByZXBpdGNoTWF4ID0gZy5pbiggJ3JlcGl0Y2hNYXgnIClcblxuICAgIGxldCBwaXRjaE1lbW9yeSA9IGcuaGlzdG9yeSgxKVxuXG4gICAgbGV0IHNob3VsZFNodWZmbGVDaGVjayA9IGcuZXEoIGcubW9kKCBwaGFzZSwgcmF0ZU9mU2h1ZmZsaW5nICksIDAgKVxuICAgIGxldCBpc1NodWZmbGluZyA9IGcubWVtbyggZy5zYWgoIGcubHQoIGcubm9pc2UoKSwgY2hhbmNlT2ZTaHVmZmxpbmcgKSwgc2hvdWxkU2h1ZmZsZUNoZWNrLCAwICkgKSBcblxuICAgIC8vIGlmIHdlIGFyZSBzaHVmZmxpbmcgYW5kIG9uIGEgcmVwZWF0IGJvdW5kYXJ5Li4uXG4gICAgbGV0IHNodWZmbGVDaGFuZ2VkID0gZy5tZW1vKCBnLmFuZCggc2hvdWxkU2h1ZmZsZUNoZWNrLCBpc1NodWZmbGluZyApIClcbiAgICBsZXQgc2hvdWxkUmV2ZXJzZSA9IGcubHQoIGcubm9pc2UoKSwgcmV2ZXJzZUNoYW5jZSApLFxuICAgICAgICByZXZlcnNlTW9kID0gZy5zd2l0Y2goIHNob3VsZFJldmVyc2UsIC0xLCAxIClcblxuICAgIGxldCBwaXRjaCA9IGcuaWZlbHNlKCBcbiAgICAgIGcuYW5kKCBzaHVmZmxlQ2hhbmdlZCwgZy5sdCggZy5ub2lzZSgpLCByZXBpdGNoQ2hhbmNlICkgKSxcbiAgICAgIGcubWVtbyggZy5tdWwoIGcuYWRkKCByZXBpdGNoTWluLCBnLm11bCggZy5zdWIoIHJlcGl0Y2hNYXgsIHJlcGl0Y2hNaW4gKSwgZy5ub2lzZSgpICkgKSwgcmV2ZXJzZU1vZCApICksXG4gICAgICByZXZlcnNlTW9kXG4gICAgKVxuICAgIFxuICAgIC8vIG9ubHkgc3dpdGNoIHBpdGNoZXMgb24gcmVwZWF0IGJvdW5kYXJpZXNcbiAgICBwaXRjaE1lbW9yeS5pbiggZy5zd2l0Y2goIHNodWZmbGVDaGFuZ2VkLCBwaXRjaCwgcGl0Y2hNZW1vcnkub3V0ICkgKVxuXG4gICAgbGV0IGZhZGVMZW5ndGggPSBnLm1lbW8oIGcuZGl2KCByYXRlT2ZTaHVmZmxpbmcsIDEwMCApICksXG4gICAgICAgIGZhZGVJbmNyID0gZy5tZW1vKCBnLmRpdiggMSwgZmFkZUxlbmd0aCApIClcblxuICAgIGxldCBidWZmZXJMID0gZy5kYXRhKCBidWZmZXJTaXplICksIGJ1ZmZlclIgPSBpc1N0ZXJlbyA/IGcuZGF0YSggYnVmZmVyU2l6ZSApIDogbnVsbFxuICAgIGxldCByZWFkUGhhc2UgPSBnLmFjY3VtKCBwaXRjaE1lbW9yeS5vdXQsIDAsIHsgc2hvdWxkV3JhcDpmYWxzZSB9KSBcbiAgICBsZXQgc3R1dHRlciA9IGcud3JhcCggZy5zdWIoIGcubW9kKCByZWFkUGhhc2UsIGJ1ZmZlclNpemUgKSwgMjIwNTAgKSwgMCwgYnVmZmVyU2l6ZSApXG5cbiAgICBsZXQgbm9ybWFsU2FtcGxlID0gZy5wZWVrKCBidWZmZXJMLCBnLmFjY3VtKCAxLCAwLCB7IG1heDo4ODIwMCB9KSwgeyBtb2RlOidzaW1wbGUnIH0pXG5cbiAgICBsZXQgc3R1dHRlclNhbXBsZVBoYXNlID0gZy5zd2l0Y2goIGlzU2h1ZmZsaW5nLCBzdHV0dGVyLCBnLm1vZCggcmVhZFBoYXNlLCBidWZmZXJTaXplICkgKVxuICAgIGxldCBzdHV0dGVyU2FtcGxlID0gZy5tZW1vKCBnLnBlZWsoIFxuICAgICAgYnVmZmVyTCwgXG4gICAgICBzdHV0dGVyU2FtcGxlUGhhc2UsXG4gICAgICB7IG1vZGU6J3NhbXBsZXMnIH1cbiAgICApIClcbiAgICBcbiAgICBsZXQgc3R1dHRlclNob3VsZEZhZGVJbiA9IGcuYW5kKCBzaHVmZmxlQ2hhbmdlZCwgaXNTaHVmZmxpbmcgKVxuICAgIGxldCBzdHV0dGVyUGhhc2UgPSBnLmFjY3VtKCAxLCBzaHVmZmxlQ2hhbmdlZCwgeyBzaG91bGRXcmFwOiBmYWxzZSB9KVxuXG4gICAgbGV0IGZhZGVJbkFtb3VudCA9IGcubWVtbyggZy5kaXYoIHN0dXR0ZXJQaGFzZSwgZmFkZUxlbmd0aCApIClcbiAgICBsZXQgZmFkZU91dEFtb3VudCA9IGcuZGl2KCBnLnN1YiggcmF0ZU9mU2h1ZmZsaW5nLCBzdHV0dGVyUGhhc2UgKSwgZy5zdWIoIHJhdGVPZlNodWZmbGluZywgZmFkZUxlbmd0aCApIClcbiAgICBcbiAgICBsZXQgZmFkZWRTdHV0dGVyID0gZy5pZmVsc2UoXG4gICAgICBnLmx0KCBzdHV0dGVyUGhhc2UsIGZhZGVMZW5ndGggKSxcbiAgICAgIGcubWVtbyggZy5tdWwoIGcuc3dpdGNoKCBnLmx0KCBmYWRlSW5BbW91bnQsIDEgKSwgZmFkZUluQW1vdW50LCAxICksIHN0dXR0ZXJTYW1wbGUgKSApLFxuICAgICAgZy5ndCggc3R1dHRlclBoYXNlLCBnLnN1YiggcmF0ZU9mU2h1ZmZsaW5nLCBmYWRlTGVuZ3RoICkgKSxcbiAgICAgIGcubWVtbyggZy5tdWwoIGcuZ3RwKCBmYWRlT3V0QW1vdW50LCAwICksIHN0dXR0ZXJTYW1wbGUgKSApLFxuICAgICAgc3R1dHRlclNhbXBsZVxuICAgIClcbiAgICBcbiAgICBsZXQgb3V0cHV0TCA9IGcubWl4KCBub3JtYWxTYW1wbGUsIGZhZGVkU3R1dHRlciwgaXNTaHVmZmxpbmcgKSBcblxuICAgIGxldCBwb2tlTCA9IGcucG9rZSggYnVmZmVyTCwgbGVmdElucHV0LCBnLm1vZCggZy5hZGQoIHBoYXNlLCA0NDEwMCApLCA4ODIwMCApIClcblxuICAgIGxldCBwYW5uZXIgPSBnLnBhbiggb3V0cHV0TCwgb3V0cHV0TCwgZy5pbiggJ3BhbicgKSApXG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgYnVmZmVyU2h1ZmZsZXIsXG4gICAgICBbcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodF0sXG4gICAgICAnc2h1ZmZsZXInLCBcbiAgICAgIHByb3BzIFxuICAgICkgXG5cbiAgICByZXR1cm4gYnVmZmVyU2h1ZmZsZXJcbiAgfVxuICBcbiAgU2h1ZmZsZXIuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICByYXRlOjIyMDUwLFxuICAgIGNoYW5jZTouMjUsXG4gICAgcmV2ZXJzZUNoYW5jZTouNSxcbiAgICByZXBpdGNoQ2hhbmNlOi41LFxuICAgIHJlcGl0Y2hNaW46LjUsXG4gICAgcmVwaXRjaE1heDoyLFxuICAgIHBhbjouNSxcbiAgICBtaXg6LjVcbiAgfVxuXG4gIHJldHVybiBTaHVmZmxlciBcbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IENob3J1cyA9IGlucHV0UHJvcHMgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIENob3J1cy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gIFxuICBjb25zdCBjaG9ydXMgPSBPYmplY3QuY3JlYXRlKCBHaWJiZXJpc2gucHJvdG90eXBlcy51Z2VuIClcblxuICBjb25zdCBpbnB1dCA9IGcuaW4oJ2lucHV0JyksXG4gICAgICAgIGZyZXExID0gZy5pbignc2xvd0ZyZXF1ZW5jeScpLFxuICAgICAgICBmcmVxMiA9IGcuaW4oJ2Zhc3RGcmVxdWVuY3knKSxcbiAgICAgICAgYW1wMSAgPSBnLmluKCdzbG93R2FpbicpLFxuICAgICAgICBhbXAyICA9IGcuaW4oJ2Zhc3RHYWluJylcblxuICBjb25zdCBpc1N0ZXJlbyA9IHR5cGVvZiBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gJ3VuZGVmaW5lZCcgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG5cbiAgY29uc3QgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0XG5cbiAgY29uc3Qgd2luMCAgID0gZy5lbnYoICdpbnZlcnNld2VsY2gnLCAxMDI0ICksXG4gICAgICAgIHdpbjEyMCA9IGcuZW52KCAnaW52ZXJzZXdlbGNoJywgMTAyNCwgMCwgLjMzMyApLFxuICAgICAgICB3aW4yNDAgPSBnLmVudiggJ2ludmVyc2V3ZWxjaCcsIDEwMjQsIDAsIC42NjYgKVxuICBcbiAgY29uc3Qgc2xvd1BoYXNvciA9IGcucGhhc29yKCBmcmVxMSwgMCwgeyBtaW46MCB9KSxcbiAgXHRcdCAgc2xvd1BlZWsxICA9IGcubXVsKCBnLnBlZWsoIHdpbjAsICAgc2xvd1BoYXNvciApLCBhbXAxICksXG4gICAgICAgIHNsb3dQZWVrMiAgPSBnLm11bCggZy5wZWVrKCB3aW4xMjAsIHNsb3dQaGFzb3IgKSwgYW1wMSApLFxuICAgICAgICBzbG93UGVlazMgID0gZy5tdWwoIGcucGVlayggd2luMjQwLCBzbG93UGhhc29yICksIGFtcDEgKVxuICBcbiAgY29uc3QgZmFzdFBoYXNvciA9IGcucGhhc29yKCBmcmVxMiwgMCwgeyBtaW46MCB9KSxcbiAgXHQgIFx0ZmFzdFBlZWsxICA9IGcubXVsKCBnLnBlZWsoIHdpbjAsICAgZmFzdFBoYXNvciApLCBhbXAyICksXG4gICAgICAgIGZhc3RQZWVrMiAgPSBnLm11bCggZy5wZWVrKCB3aW4xMjAsIGZhc3RQaGFzb3IgKSwgYW1wMiApLFxuICAgICAgICBmYXN0UGVlazMgID0gZy5tdWwoIGcucGVlayggd2luMjQwLCBmYXN0UGhhc29yICksIGFtcDIgKVxuXG4gIGNvbnN0IG1zID0gR2liYmVyaXNoLmN0eC5zYW1wbGVSYXRlIC8gMTAwMCBcbiAgY29uc3QgbWF4RGVsYXlUaW1lID0gMTAwICogbXNcblxuICBjb25zdCB0aW1lMSA9ICBnLm11bCggZy5hZGQoIHNsb3dQZWVrMSwgZmFzdFBlZWsxLCA1ICksIG1zICksXG4gICAgICAgIHRpbWUyID0gIGcubXVsKCBnLmFkZCggc2xvd1BlZWsyLCBmYXN0UGVlazIsIDUgKSwgbXMgKSxcbiAgICAgICAgdGltZTMgPSAgZy5tdWwoIGcuYWRkKCBzbG93UGVlazMsIGZhc3RQZWVrMywgNSApLCBtcyApXG5cbiAgY29uc3QgZGVsYXkxTCA9IGcuZGVsYXkoIGxlZnRJbnB1dCwgdGltZTEsIHsgc2l6ZTptYXhEZWxheVRpbWUgfSksXG4gICAgICAgIGRlbGF5MkwgPSBnLmRlbGF5KCBsZWZ0SW5wdXQsIHRpbWUyLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pLFxuICAgICAgICBkZWxheTNMID0gZy5kZWxheSggbGVmdElucHV0LCB0aW1lMywgeyBzaXplOm1heERlbGF5VGltZSB9KVxuXG4gIFxuICBjb25zdCBsZWZ0T3V0cHV0ID0gZy5hZGQoIGRlbGF5MUwsIGRlbGF5MkwsIGRlbGF5M0wgKVxuICBpZiggaXNTdGVyZW8gKSB7XG4gICAgY29uc3QgcmlnaHRJbnB1dCA9IGlucHV0WzFdXG4gICAgY29uc3QgZGVsYXkxUiA9IGcuZGVsYXkocmlnaHRJbnB1dCwgdGltZTEsIHsgc2l6ZTptYXhEZWxheVRpbWUgfSksXG4gICAgICAgICAgZGVsYXkyUiA9IGcuZGVsYXkocmlnaHRJbnB1dCwgdGltZTIsIHsgc2l6ZTptYXhEZWxheVRpbWUgfSksXG4gICAgICAgICAgZGVsYXkzUiA9IGcuZGVsYXkocmlnaHRJbnB1dCwgdGltZTMsIHsgc2l6ZTptYXhEZWxheVRpbWUgfSlcblxuICAgIC8vIGZsaXAgYSBjb3VwbGUgZGVsYXkgbGluZXMgZm9yIHN0ZXJlbyBlZmZlY3Q/XG4gICAgY29uc3QgcmlnaHRPdXRwdXQgPSBnLmRpdiggZy5hZGQoIGRlbGF5MVIsIGRlbGF5MlIsIGRlbGF5M1IgKSwgMyApXG4gICAgY2hvcnVzLmdyYXBoID0gWyBsZWZ0T3V0cHV0LCByaWdodE91dHB1dCBdXG4gIH1lbHNle1xuICAgIGNob3J1cy5ncmFwaCA9IGxlZnRPdXRwdXRcbiAgfVxuICBcbiAgR2liYmVyaXNoLmZhY3RvcnkoIGNob3J1cywgY2hvcnVzLmdyYXBoLCAnY2hvcnVzJywgcHJvcHMgKVxuXG4gIHJldHVybiBjaG9ydXNcbn1cblxuQ2hvcnVzLmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBzbG93RnJlcXVlbmN5OiAuMTgsXG4gIHNsb3dHYWluOjEsXG4gIGZhc3RGcmVxdWVuY3k6NixcbiAgZmFzdEdhaW46LjJcbn1cblxucmV0dXJuIENob3J1c1xuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBEZWxheSA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7IGRlbGF5TGVuZ3RoOiA0NDEwMCB9LCBEZWxheS5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgZGVsYXkgPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICBkZWxheVRpbWUgPSBnLmluKCAnZGVsYXlUaW1lJyApLFxuICAgICAgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMCBdIDogaW5wdXQsXG4gICAgICByaWdodElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMSBdIDogbnVsbFxuICAgIFxuICBsZXQgZmVlZGJhY2sgPSBnLmluKCAnZmVlZGJhY2snIClcblxuICAvLyBsZWZ0IGNoYW5uZWxcbiAgbGV0IGZlZWRiYWNrSGlzdG9yeUwgPSBnLmhpc3RvcnkoKVxuICBsZXQgZWNob0wgPSBnLmRlbGF5KCBnLmFkZCggbGVmdElucHV0LCBnLm11bCggZmVlZGJhY2tIaXN0b3J5TC5vdXQsIGZlZWRiYWNrICkgKSwgZGVsYXlUaW1lLCB7IHNpemU6cHJvcHMuZGVsYXlMZW5ndGggfSlcbiAgZmVlZGJhY2tIaXN0b3J5TC5pbiggZWNob0wgKVxuXG4gIGlmKCBpc1N0ZXJlbyApIHtcbiAgICAvLyByaWdodCBjaGFubmVsXG4gICAgbGV0IGZlZWRiYWNrSGlzdG9yeVIgPSBnLmhpc3RvcnkoKVxuICAgIGxldCBlY2hvUiA9IGcuZGVsYXkoIGcuYWRkKCByaWdodElucHV0LCBnLm11bCggZmVlZGJhY2tIaXN0b3J5Ui5vdXQsIGZlZWRiYWNrICkgKSwgZGVsYXlUaW1lLCB7IHNpemU6cHJvcHMuZGVsYXlMZW5ndGggfSlcbiAgICBmZWVkYmFja0hpc3RvcnlSLmluKCBlY2hvUiApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICBkZWxheSxcbiAgICAgIFsgZWNob0wsIGVjaG9SIF0sIFxuICAgICAgJ2RlbGF5JywgXG4gICAgICBwcm9wcyBcbiAgICApXG4gIH1lbHNle1xuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBkZWxheSwgZWNob0wsICdkZWxheScsIHByb3BzIClcbiAgfVxuICBcbiAgcmV0dXJuIGRlbGF5XG59XG5cbkRlbGF5LmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBmZWVkYmFjazouOTI1LFxuICBkZWxheVRpbWU6IDExMDI1XG59XG5cbnJldHVybiBEZWxheVxuXG59XG4iLCJsZXQgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbmxldCBlZmZlY3QgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuT2JqZWN0LmFzc2lnbiggZWZmZWN0LCB7XG5cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gZWZmZWN0XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgZWZmZWN0cyA9IHtcbiAgICBGcmVldmVyYiAgICA6IHJlcXVpcmUoICcuL2ZyZWV2ZXJiLmpzJyAgKSggR2liYmVyaXNoICksXG4gICAgRmxhbmdlciAgICAgOiByZXF1aXJlKCAnLi9mbGFuZ2VyLmpzJyAgICkoIEdpYmJlcmlzaCApLFxuICAgIFZpYnJhdG8gICAgIDogcmVxdWlyZSggJy4vdmlicmF0by5qcycgICApKCBHaWJiZXJpc2ggKSxcbiAgICBEZWxheSAgICAgICA6IHJlcXVpcmUoICcuL2RlbGF5LmpzJyAgICAgKSggR2liYmVyaXNoICksXG4gICAgQml0Q3J1c2hlciAgOiByZXF1aXJlKCAnLi9iaXRDcnVzaGVyLmpzJykoIEdpYmJlcmlzaCApLFxuICAgIFJpbmdNb2QgICAgIDogcmVxdWlyZSggJy4vcmluZ01vZC5qcycgICApKCBHaWJiZXJpc2ggKSxcbiAgICBUcmVtb2xvICAgICA6IHJlcXVpcmUoICcuL3RyZW1vbG8uanMnICAgKSggR2liYmVyaXNoICksXG4gICAgQ2hvcnVzICAgICAgOiByZXF1aXJlKCAnLi9jaG9ydXMuanMnICAgICkoIEdpYmJlcmlzaCApLFxuICAgIFNodWZmbGVyICAgIDogcmVxdWlyZSggJy4vYnVmZmVyU2h1ZmZsZXIuanMnICApKCBHaWJiZXJpc2ggKVxuICB9XG5cbiAgZWZmZWN0cy5leHBvcnQgPSB0YXJnZXQgPT4ge1xuICAgIGZvciggbGV0IGtleSBpbiBlZmZlY3RzICkge1xuICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgIHRhcmdldFsga2V5IF0gPSBlZmZlY3RzWyBrZXkgXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5yZXR1cm4gZWZmZWN0c1xuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBGbGFuZ2VyID0gaW5wdXRQcm9wcyA9PiB7XG4gIGxldCBwcm9wcyAgID0gT2JqZWN0LmFzc2lnbiggeyBkZWxheUxlbmd0aDo0NDEwMCB9LCBGbGFuZ2VyLmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICBmbGFuZ2VyID0gT2JqZWN0LmNyZWF0ZSggZWZmZWN0IClcblxuICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuICBcbiAgbGV0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgZGVsYXlMZW5ndGggPSBwcm9wcy5kZWxheUxlbmd0aCxcbiAgICAgIGZlZWRiYWNrQ29lZmYgPSBnLmluKCAnZmVlZGJhY2snICksXG4gICAgICBtb2RBbW91bnQgPSBnLmluKCAnb2Zmc2V0JyApLFxuICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgIGRlbGF5QnVmZmVyTCA9IGcuZGF0YSggZGVsYXlMZW5ndGggKSxcbiAgICAgIGRlbGF5QnVmZmVyUlxuXG4gIGxldCB3cml0ZUlkeCA9IGcuYWNjdW0oIDEsMCwgeyBtaW46MCwgbWF4OmRlbGF5TGVuZ3RoLCBpbnRlcnA6J25vbmUnLCBtb2RlOidzYW1wbGVzJyB9KVxuICBcbiAgbGV0IG9mZnNldCA9IGcubXVsKCBtb2RBbW91bnQsIDUwMCApXG5cbiAgbGV0IG1vZCA9IHByb3BzLm1vZCA9PT0gdW5kZWZpbmVkID8gZy5jeWNsZSggZnJlcXVlbmN5ICkgOiBwcm9wcy5tb2RcbiAgXG4gIGxldCByZWFkSWR4ID0gZy53cmFwKCBcbiAgICBnLmFkZCggXG4gICAgICBnLnN1Yiggd3JpdGVJZHgsIG9mZnNldCApLCBcbiAgICAgIG1vZC8vZy5tdWwoIG1vZCwgZy5zdWIoIG9mZnNldCwgMSApICkgXG4gICAgKSwgXG5cdCAgMCwgXG4gICAgZGVsYXlMZW5ndGhcbiAgKVxuXG4gIGxldCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXRcblxuICBsZXQgZGVsYXllZE91dEwgPSBnLnBlZWsoIGRlbGF5QnVmZmVyTCwgcmVhZElkeCwgeyBpbnRlcnA6J2xpbmVhcicsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBnLnBva2UoIGRlbGF5QnVmZmVyTCwgZy5hZGQoIGxlZnRJbnB1dCwgZy5tdWwoIGRlbGF5ZWRPdXRMLCBmZWVkYmFja0NvZWZmICkgKSwgd3JpdGVJZHggKVxuXG4gIGxldCBsZWZ0ID0gZy5hZGQoIGxlZnRJbnB1dCwgZGVsYXllZE91dEwgKSxcbiAgICAgIHJpZ2h0XG5cbiAgaWYoIGlzU3RlcmVvID09PSB0cnVlICkge1xuICAgIHJpZ2h0SW5wdXQgPSBpbnB1dFsxXVxuICAgIGRlbGF5QnVmZmVyUiA9IGcuZGF0YSggZGVsYXlMZW5ndGggKVxuICAgIFxuICAgIGxldCBkZWxheWVkT3V0UiA9IGcucGVlayggZGVsYXlCdWZmZXJSLCByZWFkSWR4LCB7IGludGVycDonbGluZWFyJywgbW9kZTonc2FtcGxlcycgfSlcblxuICAgIGcucG9rZSggZGVsYXlCdWZmZXJSLCBnLmFkZCggcmlnaHRJbnB1dCwgZy5tdWwoIGRlbGF5ZWRPdXRSLCBmZWVkYmFja0NvZWZmICkgKSwgd3JpdGVJZHggKVxuICAgIHJpZ2h0ID0gZy5hZGQoIHJpZ2h0SW5wdXQsIGRlbGF5ZWRPdXRSIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIGZsYW5nZXIsXG4gICAgICBbIGxlZnQsIHJpZ2h0IF0sIFxuICAgICAgJ2ZsYW5nZXInLCBcbiAgICAgIHByb3BzIFxuICAgIClcblxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggZmxhbmdlciwgbGVmdCwgJ2ZsYW5nZXInLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiBmbGFuZ2VyXG59XG5cbkZsYW5nZXIuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIGZlZWRiYWNrOi4wMSxcbiAgb2Zmc2V0Oi4yNSxcbiAgZnJlcXVlbmN5Oi41XG59XG5cbnJldHVybiBGbGFuZ2VyXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgXG5jb25zdCBhbGxQYXNzID0gR2liYmVyaXNoLmZpbHRlcnMuZ2VuaXNoLkFsbFBhc3NcbmNvbnN0IGNvbWJGaWx0ZXIgPSBHaWJiZXJpc2guZmlsdGVycy5nZW5pc2guQ29tYlxuXG5jb25zdCB0dW5pbmcgPSB7XG4gIGNvbWJDb3VudDpcdCAgXHQ4LFxuICBjb21iVHVuaW5nOiBcdFx0WyAxMTE2LCAxMTg4LCAxMjc3LCAxMzU2LCAxNDIyLCAxNDkxLCAxNTU3LCAxNjE3IF0sICAgICAgICAgICAgICAgICAgICBcbiAgYWxsUGFzc0NvdW50OiBcdDQsXG4gIGFsbFBhc3NUdW5pbmc6XHRbIDIyNSwgNTU2LCA0NDEsIDM0MSBdLFxuICBhbGxQYXNzRmVlZGJhY2s6MC41LFxuICBmaXhlZEdhaW46IFx0XHQgIDAuMDE1LFxuICBzY2FsZURhbXBpbmc6IFx0MC40LFxuICBzY2FsZVJvb206IFx0XHQgIDAuMjgsXG4gIG9mZnNldFJvb206IFx0ICAwLjcsXG4gIHN0ZXJlb1NwcmVhZDogICAyM1xufVxuXG5jb25zdCBGcmVldmVyYiA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgRnJlZXZlcmIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgIHJldmVyYiA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApIFxuICAgXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgY29tYnNMID0gW10sIGNvbWJzUiA9IFtdXG5cbiAgbGV0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgd2V0MSA9IGcuaW4oICd3ZXQxJyksIHdldDIgPSBnLmluKCAnd2V0MicgKSwgIGRyeSA9IGcuaW4oICdkcnknICksIFxuICAgICAgcm9vbVNpemUgPSBnLmluKCAncm9vbVNpemUnICksIGRhbXBpbmcgPSBnLmluKCAnZGFtcGluZycgKVxuICBcbiAgbGV0IHN1bW1lZElucHV0ID0gaXNTdGVyZW8gPT09IHRydWUgPyBnLmFkZCggaW5wdXRbMF0sIGlucHV0WzFdICkgOiBpbnB1dCxcbiAgICAgIGF0dGVudWF0ZWRJbnB1dCA9IGcubWVtbyggZy5tdWwoIHN1bW1lZElucHV0LCB0dW5pbmcuZml4ZWRHYWluICkgKVxuICBcbiAgLy8gY3JlYXRlIGNvbWIgZmlsdGVycyBpbiBwYXJhbGxlbC4uLlxuICBmb3IoIGxldCBpID0gMDsgaSA8IDg7IGkrKyApIHsgXG4gICAgY29tYnNMLnB1c2goIFxuICAgICAgY29tYkZpbHRlciggYXR0ZW51YXRlZElucHV0LCB0dW5pbmcuY29tYlR1bmluZ1tpXSwgZy5tdWwoZGFtcGluZywuNCksIGcubXVsKCB0dW5pbmcuc2NhbGVSb29tICsgdHVuaW5nLm9mZnNldFJvb20sIHJvb21TaXplICkgKSBcbiAgICApXG4gICAgY29tYnNSLnB1c2goIFxuICAgICAgY29tYkZpbHRlciggYXR0ZW51YXRlZElucHV0LCB0dW5pbmcuY29tYlR1bmluZ1tpXSArIHR1bmluZy5zdGVyZW9TcHJlYWQsIGcubXVsKGRhbXBpbmcsLjQpLCBnLm11bCggdHVuaW5nLnNjYWxlUm9vbSArIHR1bmluZy5vZmZzZXRSb29tLCByb29tU2l6ZSApICkgXG4gICAgKVxuICB9XG4gIFxuICAvLyAuLi4gYW5kIHN1bSB0aGVtIHdpdGggYXR0ZW51YXRlZCBpbnB1dFxuICBsZXQgb3V0TCA9IGcuYWRkKCBhdHRlbnVhdGVkSW5wdXQsIC4uLmNvbWJzTCApXG4gIGxldCBvdXRSID0gZy5hZGQoIGF0dGVudWF0ZWRJbnB1dCwgLi4uY29tYnNSIClcbiAgXG4gIC8vIHJ1biB0aHJvdWdoIGFsbHBhc3MgZmlsdGVycyBpbiBzZXJpZXNcbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCA0OyBpKysgKSB7IFxuICAgIG91dEwgPSBhbGxQYXNzKCBvdXRMLCB0dW5pbmcuYWxsUGFzc1R1bmluZ1sgaSBdICsgdHVuaW5nLnN0ZXJlb1NwcmVhZCApXG4gICAgb3V0UiA9IGFsbFBhc3MoIG91dFIsIHR1bmluZy5hbGxQYXNzVHVuaW5nWyBpIF0gKyB0dW5pbmcuc3RlcmVvU3ByZWFkIClcbiAgfVxuICBcbiAgbGV0IG91dHB1dEwgPSBnLmFkZCggZy5tdWwoIG91dEwsIHdldDEgKSwgZy5tdWwoIG91dFIsIHdldDIgKSwgZy5tdWwoIGlzU3RlcmVvID09PSB0cnVlID8gaW5wdXRbMF0gOiBpbnB1dCwgZHJ5ICkgKSxcbiAgICAgIG91dHB1dFIgPSBnLmFkZCggZy5tdWwoIG91dFIsIHdldDEgKSwgZy5tdWwoIG91dEwsIHdldDIgKSwgZy5tdWwoIGlzU3RlcmVvID09PSB0cnVlID8gaW5wdXRbMV0gOiBpbnB1dCwgZHJ5ICkgKVxuXG4gIEdpYmJlcmlzaC5mYWN0b3J5KCByZXZlcmIsIFsgb3V0cHV0TCwgb3V0cHV0UiBdLCAnZnJlZXZlcmInLCBwcm9wcyApXG5cbiAgcmV0dXJuIHJldmVyYlxufVxuXG5cbkZyZWV2ZXJiLmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICB3ZXQxOiAxLFxuICB3ZXQyOiAwLFxuICBkcnk6IC41LFxuICByb29tU2l6ZTogLjg0LFxuICBkYW1waW5nOiAgLjVcbn1cblxucmV0dXJuIEZyZWV2ZXJiIFxuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IFJpbmdNb2QgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzICAgPSBPYmplY3QuYXNzaWduKCB7fSwgUmluZ01vZC5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgcmluZ01vZCA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICBnYWluID0gZy5pbiggJ2dhaW4nICksXG4gICAgICBtaXggPSBnLmluKCAnbWl4JyApXG4gIFxuICBsZXQgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0LFxuICAgICAgc2luZSA9IGcubXVsKCBnLmN5Y2xlKCBmcmVxdWVuY3kgKSwgZ2FpbiApXG4gXG4gIGxldCBsZWZ0ID0gZy5hZGQoIGcubXVsKCBsZWZ0SW5wdXQsIGcuc3ViKCAxLCBtaXggKSksIGcubXVsKCBnLm11bCggbGVmdElucHV0LCBzaW5lICksIG1peCApICksIFxuICAgICAgcmlnaHRcblxuICBpZiggaXNTdGVyZW8gPT09IHRydWUgKSB7XG4gICAgbGV0IHJpZ2h0SW5wdXQgPSBpbnB1dFsxXVxuICAgIHJpZ2h0ID0gZy5hZGQoIGcubXVsKCByaWdodElucHV0LCBnLnN1YiggMSwgbWl4ICkpLCBnLm11bCggZy5tdWwoIHJpZ2h0SW5wdXQsIHNpbmUgKSwgbWl4ICkgKSBcbiAgICBcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICByaW5nTW9kLFxuICAgICAgWyBsZWZ0LCByaWdodCBdLCBcbiAgICAgICdyaW5nTW9kJywgXG4gICAgICBwcm9wcyBcbiAgICApXG4gIH1lbHNle1xuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCByaW5nTW9kLCBsZWZ0LCAncmluZ01vZCcsIHByb3BzIClcbiAgfVxuICBcbiAgcmV0dXJuIHJpbmdNb2Rcbn1cblxuUmluZ01vZC5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgZnJlcXVlbmN5OjIyMCxcbiAgZ2FpbjogMSwgXG4gIG1peDoxXG59XG5cbnJldHVybiBSaW5nTW9kXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmNvbnN0IFRyZW1vbG8gPSBpbnB1dFByb3BzID0+IHtcbiAgY29uc3QgcHJvcHMgICA9IE9iamVjdC5hc3NpZ24oIHt9LCBUcmVtb2xvLmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICAgIHRyZW1vbG8gPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGNvbnN0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICBhbW91bnQgPSBnLmluKCAnYW1vdW50JyApXG4gIFxuICBjb25zdCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXRcblxuICBsZXQgb3NjXG4gIGlmKCBwcm9wcy5zaGFwZSA9PT0gJ3NxdWFyZScgKSB7XG4gICAgb3NjID0gZy5ndCggZy5waGFzb3IoIGZyZXF1ZW5jeSApLCAwIClcbiAgfWVsc2UgaWYoIHByb3BzLnNoYXBlID09PSAnc2F3JyApIHtcbiAgICBvc2MgPSBnLmd0cCggZy5waGFzb3IoIGZyZXF1ZW5jeSApLCAwIClcbiAgfWVsc2V7XG4gICAgb3NjID0gZy5jeWNsZSggZnJlcXVlbmN5IClcbiAgfVxuXG4gIGNvbnN0IG1vZCA9IGcubXVsKCBvc2MsIGFtb3VudCApXG4gXG4gIGxldCBsZWZ0ID0gZy5zdWIoIGxlZnRJbnB1dCwgZy5tdWwoIGxlZnRJbnB1dCwgbW9kICkgKSwgXG4gICAgICByaWdodFxuXG4gIGlmKCBpc1N0ZXJlbyA9PT0gdHJ1ZSApIHtcbiAgICBsZXQgcmlnaHRJbnB1dCA9IGlucHV0WzFdXG4gICAgcmlnaHQgPSBnLm11bCggcmlnaHRJbnB1dCwgbW9kIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIHRyZW1vbG8sXG4gICAgICBbIGxlZnQsIHJpZ2h0IF0sIFxuICAgICAgJ3RyZW1vbG8nLCBcbiAgICAgIHByb3BzIFxuICAgIClcbiAgfWVsc2V7XG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHRyZW1vbG8sIGxlZnQsICd0cmVtb2xvJywgcHJvcHMgKVxuICB9XG4gIFxuICByZXR1cm4gdHJlbW9sb1xufVxuXG5UcmVtb2xvLmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBmcmVxdWVuY3k6MixcbiAgYW1vdW50OiAxLCBcbiAgc2hhcGU6J3NpbmUnXG59XG5cbnJldHVybiBUcmVtb2xvXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IFZpYnJhdG8gPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzICAgPSBPYmplY3QuYXNzaWduKCB7fSwgVmlicmF0by5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgdmlicmF0byA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIGRlbGF5TGVuZ3RoID0gNDQxMDAsXG4gICAgICBmZWVkYmFja0NvZWZmID0gLjAxLC8vZy5pbiggJ2ZlZWRiYWNrJyApLFxuICAgICAgbW9kQW1vdW50ID0gZy5pbiggJ2Ftb3VudCcgKSxcbiAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICBkZWxheUJ1ZmZlckwgPSBnLmRhdGEoIGRlbGF5TGVuZ3RoICksXG4gICAgICBkZWxheUJ1ZmZlclJcblxuICBsZXQgd3JpdGVJZHggPSBnLmFjY3VtKCAxLDAsIHsgbWluOjAsIG1heDpkZWxheUxlbmd0aCwgaW50ZXJwOidub25lJywgbW9kZTonc2FtcGxlcycgfSlcbiAgXG4gIGxldCBvZmZzZXQgPSBnLm11bCggbW9kQW1vdW50LCA1MDAgKVxuICBcbiAgbGV0IHJlYWRJZHggPSBnLndyYXAoIFxuICAgIGcuYWRkKCBcbiAgICAgIGcuc3ViKCB3cml0ZUlkeCwgb2Zmc2V0ICksIFxuICAgICAgZy5tdWwoIGcuY3ljbGUoIGZyZXF1ZW5jeSApLCBnLnN1Yiggb2Zmc2V0LCAxICkgKSBcbiAgICApLCBcblx0ICAwLCBcbiAgICBkZWxheUxlbmd0aFxuICApXG5cbiAgbGV0IGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dFxuXG4gIGxldCBkZWxheWVkT3V0TCA9IGcucGVlayggZGVsYXlCdWZmZXJMLCByZWFkSWR4LCB7IGludGVycDonbGluZWFyJywgbW9kZTonc2FtcGxlcycgfSlcbiAgXG4gIGcucG9rZSggZGVsYXlCdWZmZXJMLCBnLmFkZCggbGVmdElucHV0LCBnLm11bCggZGVsYXllZE91dEwsIGZlZWRiYWNrQ29lZmYgKSApLCB3cml0ZUlkeCApXG5cbiAgbGV0IGxlZnQgPSBkZWxheWVkT3V0TCxcbiAgICAgIHJpZ2h0XG5cbiAgaWYoIGlzU3RlcmVvID09PSB0cnVlICkge1xuICAgIHJpZ2h0SW5wdXQgPSBpbnB1dFsxXVxuICAgIGRlbGF5QnVmZmVyUiA9IGcuZGF0YSggZGVsYXlMZW5ndGggKVxuICAgIFxuICAgIGxldCBkZWxheWVkT3V0UiA9IGcucGVlayggZGVsYXlCdWZmZXJSLCByZWFkSWR4LCB7IGludGVycDonbGluZWFyJywgbW9kZTonc2FtcGxlcycgfSlcblxuICAgIGcucG9rZSggZGVsYXlCdWZmZXJSLCBnLmFkZCggcmlnaHRJbnB1dCwgbXVsKCBkZWxheWVkT3V0UiwgZmVlZGJhY2tDb2VmZiApICksIHdyaXRlSWR4IClcbiAgICByaWdodCA9IGRlbGF5ZWRPdXRSXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICB2aWJyYXRvLFxuICAgICAgWyBsZWZ0LCByaWdodCBdLCBcbiAgICAgICd2aWJyYXRvJywgXG4gICAgICBwcm9wcyBcbiAgICApXG4gIH1lbHNle1xuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCB2aWJyYXRvLCBsZWZ0LCAndmlicmF0bycsIHByb3BzIClcbiAgfVxuICBcbiAgcmV0dXJuIHZpYnJhdG9cbn1cblxuVmlicmF0by5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgLy9mZWVkYmFjazouMDEsXG4gIGFtb3VudDouNSxcbiAgZnJlcXVlbmN5OjRcbn1cblxucmV0dXJuIFZpYnJhdG9cblxufVxuIiwibGV0IE1lbW9yeUhlbHBlciA9IHJlcXVpcmUoICdtZW1vcnktaGVscGVyJyApLFxuICAgIGdlbmlzaCAgICAgICA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcbiAgICBcbmxldCBHaWJiZXJpc2ggPSB7XG4gIGJsb2NrQ2FsbGJhY2tzOiBbXSwgLy8gY2FsbGVkIGV2ZXJ5IGJsb2NrXG4gIGRpcnR5VWdlbnM6IFtdLFxuICBjYWxsYmFja1VnZW5zOiBbXSxcbiAgY2FsbGJhY2tOYW1lczogW10sXG4gIGFuYWx5emVyczogW10sXG4gIGdyYXBoSXNEaXJ0eTogZmFsc2UsXG4gIHVnZW5zOiB7fSxcbiAgZGVidWc6IGZhbHNlLFxuXG4gIG91dHB1dDogbnVsbCxcblxuICBtZW1vcnkgOiBudWxsLCAvLyAyMCBtaW51dGVzIGJ5IGRlZmF1bHQ/XG4gIGZhY3Rvcnk6IG51bGwsIFxuICBnZW5pc2gsXG4gIHNjaGVkdWxlcjogcmVxdWlyZSggJy4vc2NoZWR1bGluZy9zY2hlZHVsZXIuanMnICksXG5cbiAgbWVtb2VkOiB7fSxcblxuICBwcm90b3R5cGVzOiB7XG4gICAgdWdlbjogcmVxdWlyZSgnLi91Z2VuLmpzJyksXG4gICAgaW5zdHJ1bWVudDogcmVxdWlyZSggJy4vaW5zdHJ1bWVudHMvaW5zdHJ1bWVudC5qcycgKSxcbiAgICBlZmZlY3Q6IHJlcXVpcmUoICcuL2Z4L2VmZmVjdC5qcycgKSxcbiAgfSxcblxuICBtaXhpbnM6IHtcbiAgICBwb2x5aW5zdHJ1bWVudDogcmVxdWlyZSggJy4vaW5zdHJ1bWVudHMvcG9seU1peGluLmpzJyApXG4gIH0sXG5cbiAgaW5pdCggbWVtQW1vdW50ICkge1xuICAgIGxldCBudW1CeXRlcyA9IG1lbUFtb3VudCA9PT0gdW5kZWZpbmVkID8gMjAgKiA2MCAqIDQ0MTAwIDogbWVtQW1vdW50XG5cbiAgICB0aGlzLm1lbW9yeSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIG51bUJ5dGVzIClcblxuICAgIHRoaXMubG9hZCgpXG4gICAgXG4gICAgdGhpcy5vdXRwdXQgPSB0aGlzLkJ1czIoKVxuXG4gICAgdGhpcy51dGlsaXRpZXMuY3JlYXRlQ29udGV4dCgpXG4gICAgdGhpcy51dGlsaXRpZXMuY3JlYXRlU2NyaXB0UHJvY2Vzc29yKClcblxuICAgIHRoaXMuYW5hbHl6ZXJzLmRpcnR5ID0gZmFsc2VcblxuICAgIC8vIFhYWCBGT1IgREVWRUxPUE1FTlQgQU5EIFRFU1RJTkcgT05MWS4uLiBSRU1PVkUgRk9SIFBST0RVQ1RJT05cbiAgICB0aGlzLmV4cG9ydCggd2luZG93IClcbiAgfSxcblxuICBsb2FkKCkge1xuICAgIHRoaXMuZmFjdG9yeSA9IHJlcXVpcmUoICcuL3VnZW5UZW1wbGF0ZS5qcycgKSggdGhpcyApXG5cbiAgICB0aGlzLlBvbHlUZW1wbGF0ZSA9IHJlcXVpcmUoICcuL2luc3RydW1lbnRzL3BvbHl0ZW1wbGF0ZS5qcycgKSggdGhpcyApXG4gICAgdGhpcy5vc2NpbGxhdG9ycyAgPSByZXF1aXJlKCAnLi9vc2NpbGxhdG9ycy9vc2NpbGxhdG9ycy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5maWx0ZXJzICAgICAgPSByZXF1aXJlKCAnLi9maWx0ZXJzL2ZpbHRlcnMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuYmlub3BzICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9iaW5vcHMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMubW9ub3BzICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9tb25vcHMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuQnVzICAgICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9idXMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuQnVzMiAgICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9idXMyLmpzJyApKCB0aGlzICk7XG4gICAgdGhpcy5pbnN0cnVtZW50cyAgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50cy9pbnN0cnVtZW50cy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5meCAgICAgICAgICAgPSByZXF1aXJlKCAnLi9meC9lZmZlY3RzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLlNlcXVlbmNlciAgICA9IHJlcXVpcmUoICcuL3NjaGVkdWxpbmcvc2VxdWVuY2VyLmpzJyApKCB0aGlzICk7XG4gICAgdGhpcy5TZXF1ZW5jZXIyICAgPSByZXF1aXJlKCAnLi9zY2hlZHVsaW5nL3NlcTIuanMnICkoIHRoaXMgKTtcbiAgICB0aGlzLmVudmVsb3BlcyAgICA9IHJlcXVpcmUoICcuL2VudmVsb3Blcy9lbnZlbG9wZXMuanMnICkoIHRoaXMgKTtcbiAgICB0aGlzLnNzZCAgICAgICAgICA9IHJlcXVpcmUoICcuL2FuYWx5c2lzL3NpbmdsZXNhbXBsZWRlbGF5LmpzJyApKCB0aGlzICk7XG4gIH0sXG5cbiAgZXhwb3J0KCB0YXJnZXQsIHNob3VsZEV4cG9ydEdlbmlzaD1mYWxzZSApIHtcbiAgICBpZiggdGFyZ2V0ID09PSB1bmRlZmluZWQgKSB0aHJvdyBFcnJvcignWW91IG11c3QgZGVmaW5lIGEgdGFyZ2V0IG9iamVjdCBmb3IgR2liYmVyaXNoIHRvIGV4cG9ydCB2YXJpYWJsZXMgdG8uJylcblxuICAgIGlmKCBzaG91bGRFeHBvcnRHZW5pc2ggKSB0aGlzLmdlbmlzaC5leHBvcnQoIHRhcmdldCApXG5cbiAgICB0aGlzLmluc3RydW1lbnRzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLmZ4LmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLmZpbHRlcnMuZXhwb3J0KCB0YXJnZXQgKVxuICAgIHRoaXMub3NjaWxsYXRvcnMuZXhwb3J0KCB0YXJnZXQgKVxuICAgIHRoaXMuYmlub3BzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLm1vbm9wcy5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5lbnZlbG9wZXMuZXhwb3J0KCB0YXJnZXQgKVxuICAgIHRhcmdldC5TZXF1ZW5jZXIgPSB0aGlzLlNlcXVlbmNlclxuICAgIHRhcmdldC5TZXF1ZW5jZXIyID0gdGhpcy5TZXF1ZW5jZXIyXG4gICAgdGFyZ2V0LkJ1cyA9IHRoaXMuQnVzXG4gICAgdGFyZ2V0LkJ1czIgPSB0aGlzLkJ1czJcbiAgICB0YXJnZXQuU2NoZWR1bGVyID0gdGhpcy5zY2hlZHVsZXJcbiAgICB0YXJnZXQuU1NEID0gdGhpcy5zc2RcbiAgfSxcblxuICBwcmludCgpIHtcbiAgICBjb25zb2xlLmxvZyggdGhpcy5jYWxsYmFjay50b1N0cmluZygpIClcbiAgfSxcblxuICBkaXJ0eSggdWdlbiApIHtcbiAgICBpZiggdWdlbiA9PT0gdGhpcy5hbmFseXplcnMgKSB7XG4gICAgICB0aGlzLmdyYXBoSXNEaXJ0eSA9IHRydWVcbiAgICAgIHRoaXMuYW5hbHl6ZXJzLmRpcnR5ID0gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRpcnR5VWdlbnMucHVzaCggdWdlbiApXG4gICAgICB0aGlzLmdyYXBoSXNEaXJ0eSA9IHRydWVcbiAgICAgIGlmKCB0aGlzLm1lbW9lZFsgdWdlbi51Z2VuTmFtZSBdICkge1xuICAgICAgICBkZWxldGUgdGhpcy5tZW1vZWRbIHVnZW4udWdlbk5hbWUgXVxuICAgICAgfVxuICAgIH0gXG4gIH0sXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5vdXRwdXQuaW5wdXRzID0gWzBdXG4gICAgdGhpcy5vdXRwdXQuaW5wdXROYW1lcy5sZW5ndGggPSAwXG4gICAgdGhpcy5hbmFseXplcnMubGVuZ3RoID0gMFxuICAgIHRoaXMuc2NoZWR1bGVyLmNsZWFyKClcbiAgICB0aGlzLmRpcnR5KCB0aGlzLm91dHB1dCApXG4gIH0sXG5cbiAgZ2VuZXJhdGVDYWxsYmFjaygpIHtcbiAgICBsZXQgdWlkID0gMCxcbiAgICAgICAgY2FsbGJhY2tCb2R5LCBsYXN0TGluZSwgYW5hbHlzaXM9JydcblxuICAgIHRoaXMubWVtb2VkID0ge31cblxuICAgIGNhbGxiYWNrQm9keSA9IHRoaXMucHJvY2Vzc0dyYXBoKCB0aGlzLm91dHB1dCApXG4gICAgbGFzdExpbmUgPSBjYWxsYmFja0JvZHlbIGNhbGxiYWNrQm9keS5sZW5ndGggLSAxXVxuICAgIGNhbGxiYWNrQm9keS51bnNoaWZ0KCBcIlxcdCd1c2Ugc3RyaWN0JztcIiApXG5cbiAgICB0aGlzLmFuYWx5emVycy5mb3JFYWNoKCB2PT4ge1xuICAgICAgY29uc3QgYW5hbHlzaXNCbG9jayA9IEdpYmJlcmlzaC5wcm9jZXNzVWdlbiggdiApXG4gICAgICBjb25zdCBhbmFseXNpc0xpbmUgPSBhbmFseXNpc0Jsb2NrLnBvcCgpXG5cbiAgICAgIGFuYWx5c2lzQmxvY2suZm9yRWFjaCggdj0+IHtcbiAgICAgICAgY2FsbGJhY2tCb2R5LnNwbGljZSggY2FsbGJhY2tCb2R5Lmxlbmd0aCAtIDEsIDAsIHYgKVxuICAgICAgfSlcblxuICAgICAgY2FsbGJhY2tCb2R5LnB1c2goIGFuYWx5c2lzTGluZSApXG4gICAgfSlcblxuICAgIHRoaXMuYW5hbHl6ZXJzLmZvckVhY2goIHYgPT4ge1xuICAgICAgaWYoIHRoaXMuY2FsbGJhY2tVZ2Vucy5pbmRleE9mKCB2LmNhbGxiYWNrICkgPT09IC0xIClcbiAgICAgICAgdGhpcy5jYWxsYmFja1VnZW5zLnB1c2goIHYuY2FsbGJhY2sgKVxuICAgIH0pXG4gICAgdGhpcy5jYWxsYmFja05hbWVzID0gdGhpcy5jYWxsYmFja1VnZW5zLm1hcCggdiA9PiB2LnVnZW5OYW1lIClcblxuICAgIGNhbGxiYWNrQm9keS5wdXNoKCAnXFxuXFx0cmV0dXJuICcgKyBsYXN0TGluZS5zcGxpdCggJz0nIClbMF0uc3BsaXQoICcgJyApWzFdIClcblxuICAgIGlmKCB0aGlzLmRlYnVnICkgY29uc29sZS5sb2coICdjYWxsYmFjazpcXG4nLCBjYWxsYmFja0JvZHkuam9pbignXFxuJykgKVxuICAgIHRoaXMuY2FsbGJhY2tOYW1lcy5wdXNoKCAnbWVtb3J5JyApXG4gICAgdGhpcy5jYWxsYmFja1VnZW5zLnB1c2goIHRoaXMubWVtb3J5LmhlYXAgKVxuICAgIHRoaXMuY2FsbGJhY2sgPSBGdW5jdGlvbiggLi4udGhpcy5jYWxsYmFja05hbWVzLCBjYWxsYmFja0JvZHkuam9pbiggJ1xcbicgKSApXG4gICAgdGhpcy5jYWxsYmFjay5vdXQgPSBbXVxuXG4gICAgaWYoIHRoaXMub25jYWxsYmFjayApIHRoaXMub25jYWxsYmFjayggdGhpcy5jYWxsYmFjayApXG5cbiAgICByZXR1cm4gdGhpcy5jYWxsYmFjayBcbiAgfSxcblxuICBwcm9jZXNzR3JhcGgoIG91dHB1dCApIHtcbiAgICB0aGlzLmNhbGxiYWNrVWdlbnMubGVuZ3RoID0gMFxuICAgIHRoaXMuY2FsbGJhY2tOYW1lcy5sZW5ndGggPSAwXG5cbiAgICB0aGlzLmNhbGxiYWNrVWdlbnMucHVzaCggb3V0cHV0LmNhbGxiYWNrIClcblxuICAgIGxldCBib2R5ID0gdGhpcy5wcm9jZXNzVWdlbiggb3V0cHV0IClcbiAgICBcblxuICAgIHRoaXMuZGlydHlVZ2Vucy5sZW5ndGggPSAwXG4gICAgdGhpcy5ncmFwaElzRGlydHkgPSBmYWxzZVxuXG4gICAgcmV0dXJuIGJvZHlcbiAgfSxcblxuICBwcm9jZXNzVWdlbiggdWdlbiwgYmxvY2sgKSB7XG4gICAgaWYoIGJsb2NrID09PSB1bmRlZmluZWQgKSBibG9jayA9IFtdXG5cbiAgICBsZXQgZGlydHlJZHggPSBHaWJiZXJpc2guZGlydHlVZ2Vucy5pbmRleE9mKCB1Z2VuIClcblxuICAgIC8vY29uc29sZS5sb2coICd1Z2VuTmFtZTonLCB1Z2VuLnVnZW5OYW1lIClcbiAgICBsZXQgbWVtbyA9IEdpYmJlcmlzaC5tZW1vZWRbIHVnZW4udWdlbk5hbWUgXVxuXG4gICAgaWYoIG1lbW8gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHJldHVybiBtZW1vIFxuICAgIH0gZWxzZSBpZiggdWdlbi5ibG9jayA9PT0gdW5kZWZpbmVkIHx8IGRpcnR5SW5kZXggIT09IC0xICkge1xuICBcbiAgICAgIGxldCBsaW5lID0gYFxcdHZhciB2XyR7dWdlbi5pZH0gPSBgIFxuICAgICAgXG4gICAgICBpZiggIXVnZW4uYmlub3AgKSBsaW5lICs9IGAke3VnZW4udWdlbk5hbWV9KCBgXG5cbiAgICAgIC8vIG11c3QgZ2V0IGFycmF5IHNvIHdlIGNhbiBrZWVwIHRyYWNrIG9mIGxlbmd0aCBmb3IgY29tbWEgaW5zZXJ0aW9uXG4gICAgICBsZXQga2V5cyxlcnJcbiAgICAgIFxuICAgICAgLy90cnkge1xuICAgICAga2V5cyA9IHVnZW4uYmlub3AgfHwgdWdlbi50eXBlID09PSAnYnVzJyB8fCB1Z2VuLnR5cGUgPT09ICdhbmFseXNpcycgPyBPYmplY3Qua2V5cyggdWdlbi5pbnB1dHMgKSA6IE9iamVjdC5rZXlzKCB1Z2VuLmlucHV0TmFtZXMgKVxuXG4gICAgICAvL31jYXRjaCggZSApe1xuXG4gICAgICAvLyAgY29uc29sZS5sb2coIGUgKVxuICAgICAgLy8gIGVyciA9IHRydWVcbiAgICAgIC8vfVxuICAgICAgXG4gICAgICAvL2lmKCBlcnIgPT09IHRydWUgKSByZXR1cm5cblxuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBsZXQga2V5ID0ga2V5c1sgaSBdXG4gICAgICAgIC8vIGJpbm9wLmlucHV0cyBpcyBhY3R1YWwgdmFsdWVzLCBub3QganVzdCBwcm9wZXJ0eSBuYW1lc1xuICAgICAgICBsZXQgaW5wdXQgXG4gICAgICAgIGlmKCB1Z2VuLmJpbm9wIHx8IHVnZW4udHlwZSA9PT0nYnVzJyApIHtcbiAgICAgICAgICBpbnB1dCA9IHVnZW4uaW5wdXRzWyBrZXkgXVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAvL2lmKCBrZXkgPT09ICdtZW1vcnknICkgY29udGludWU7XG4gIFxuICAgICAgICAgIGlucHV0ID0gdWdlblsgdWdlbi5pbnB1dE5hbWVzWyBrZXkgXSBdXG4gICAgICAgIH1cblxuICAgICAgICBpZiggaW5wdXQgIT09IHVuZGVmaW5lZCApIHsgXG4gICAgICAgICAgaWYoIHR5cGVvZiBpbnB1dCA9PT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgICBsaW5lICs9IGlucHV0XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAna2V5OicsIGtleSwgJ2lucHV0OicsIHVnZW4uaW5wdXRzLCB1Z2VuLmlucHV0c1sga2V5IF0gKSBcblxuICAgICAgICAgICAgR2liYmVyaXNoLnByb2Nlc3NVZ2VuKCBpbnB1dCwgYmxvY2sgKVxuXG4gICAgICAgICAgICAvL2lmKCBpbnB1dC5jYWxsYmFjayA9PT0gdW5kZWZpbmVkICkgY29udGludWVcblxuICAgICAgICAgICAgaWYoICFpbnB1dC5iaW5vcCApIHtcbiAgICAgICAgICAgICAgLy8gY2hlY2sgaXMgbmVlZGVkIHNvIHRoYXQgZ3JhcGhzIHdpdGggc3NkcyB0aGF0IHJlZmVyIHRvIHRoZW1zZWx2ZXNcbiAgICAgICAgICAgICAgLy8gZG9uJ3QgYWRkIHRoZSBzc2QgaW4gbW9yZSB0aGFuIG9uY2VcbiAgICAgICAgICAgICAgaWYoIEdpYmJlcmlzaC5jYWxsYmFja1VnZW5zLmluZGV4T2YoIGlucHV0LmNhbGxiYWNrICkgPT09IC0xICkge1xuICAgICAgICAgICAgICAgIEdpYmJlcmlzaC5jYWxsYmFja1VnZW5zLnB1c2goIGlucHV0LmNhbGxiYWNrIClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsaW5lICs9IGB2XyR7aW5wdXQuaWR9YFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKCBpIDwga2V5cy5sZW5ndGggLSAxICkge1xuICAgICAgICAgICAgbGluZSArPSB1Z2VuLmJpbm9wID8gJyAnICsgdWdlbi5vcCArICcgJyA6ICcsICcgXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vaWYoIHVnZW4udHlwZSA9PT0gJ2J1cycgKSBsaW5lICs9ICcsICcgXG4gICAgICBpZiggIXVnZW4uYmlub3AgJiYgdWdlbi50eXBlICE9PSAnYnVzJyAmJiB1Z2VuLnR5cGUgIT09ICdzZXEnICkgbGluZSArPSAnbWVtb3J5J1xuICAgICAgbGluZSArPSB1Z2VuLmJpbm9wID8gJycgOiAnICknXG5cbiAgICAgIGJsb2NrLnB1c2goIGxpbmUgKVxuICAgICAgXG4gICAgICAvL2NvbnNvbGUubG9nKCAnbWVtbzonLCB1Z2VuLnVnZW5OYW1lIClcbiAgICAgIEdpYmJlcmlzaC5tZW1vZWRbIHVnZW4udWdlbk5hbWUgXSA9IGB2XyR7dWdlbi5pZH1gXG5cbiAgICAgIGlmKCBkaXJ0eUlkeCAhPT0gLTEgKSB7XG4gICAgICAgIEdpYmJlcmlzaC5kaXJ0eVVnZW5zLnNwbGljZSggZGlydHlJZHgsIDEgKVxuICAgICAgfVxuXG4gICAgfWVsc2UgaWYoIHVnZW4uYmxvY2sgKSB7XG4gICAgICByZXR1cm4gdWdlbi5ibG9ja1xuICAgIH1cblxuICAgIHJldHVybiBibG9ja1xuICB9LFxuICAgIFxufVxuXG5HaWJiZXJpc2gudXRpbGl0aWVzID0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApKCBHaWJiZXJpc2ggKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gR2liYmVyaXNoXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBDb25nYSA9IGFyZ3VtZW50UHJvcHMgPT4ge1xuICAgIGxldCBjb25nYSA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgZGVjYXkgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgIGdhaW4gID0gZy5pbiggJ2dhaW4nIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBDb25nYS5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBsZXQgdHJpZ2dlciA9IGcuYmFuZygpLFxuICAgICAgICBpbXB1bHNlID0gZy5tdWwoIHRyaWdnZXIsIDYwICksXG4gICAgICAgIF9kZWNheSA9ICBnLnN1YiggLjEwMSwgZy5kaXYoIGRlY2F5LCAxMCApICksIC8vIGNyZWF0ZSByYW5nZSBvZiAuMDAxIC0gLjA5OVxuICAgICAgICBicGYgPSBnLnN2ZiggaW1wdWxzZSwgZnJlcXVlbmN5LCBfZGVjYXksIDIsIGZhbHNlICksXG4gICAgICAgIG91dCA9IGcubXVsKCBicGYsIGdhaW4gKVxuICAgIFxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBjb25nYSwgb3V0LCAnY29uZ2EnLCBwcm9wcyAgKVxuICAgIFxuICAgIGNvbmdhLmVudiA9IHRyaWdnZXJcblxuICAgIHJldHVybiBjb25nYVxuICB9XG4gIFxuICBDb25nYS5kZWZhdWx0cyA9IHtcbiAgICBnYWluOiAuMjUsXG4gICAgZnJlcXVlbmN5OjE5MCxcbiAgICBkZWNheTogLjg1XG4gIH1cblxuICByZXR1cm4gQ29uZ2FcblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBDb3diZWxsID0gYXJndW1lbnRQcm9wcyA9PiB7XG4gICAgY29uc3QgY293YmVsbCA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgICBkZWNheSAgID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICAgIGdhaW4gICAgPSBnLmluKCAnZ2FpbicgKVxuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQ293YmVsbC5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBjb25zdCBicGZDdXRvZmYgPSBnLnBhcmFtKCAnYnBmYycsIDEwMDAgKSxcbiAgICAgICAgICBzMSA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgNTYwICksXG4gICAgICAgICAgczIgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIDg0NSApLFxuICAgICAgICAgIGVnID0gZy5kZWNheSggZy5tdWwoIGRlY2F5LCBnLmdlbi5zYW1wbGVyYXRlICogMiApICksIFxuICAgICAgICAgIGJwZiA9IGcuc3ZmKCBnLmFkZCggczEsczIgKSwgYnBmQ3V0b2ZmLCAzLCAyLCBmYWxzZSApLFxuICAgICAgICAgIGVudkJwZiA9IGcubXVsKCBicGYsIGVnICksXG4gICAgICAgICAgb3V0ID0gZy5tdWwoIGVudkJwZiwgZ2FpbiApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggY293YmVsbCwgb3V0LCAnY293YmVsbCcsIHByb3BzICApXG4gICAgXG4gICAgY293YmVsbC5lbnYgPSBlZyBcblxuICAgIGNvd2JlbGwuaXNTdGVyZW8gPSBmYWxzZVxuXG4gICAgcmV0dXJuIGNvd2JlbGxcbiAgfVxuICBcbiAgQ293YmVsbC5kZWZhdWx0cyA9IHtcbiAgICBnYWluOiAxLFxuICAgIGRlY2F5Oi41XG4gIH1cblxuICByZXR1cm4gQ293YmVsbFxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBGTSA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGxldCBzeW4gPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50IClcblxuICAgIGxldCBlbnYgPSBnLmFkKCBnLmluKCdhdHRhY2snKSwgZy5pbignZGVjYXknKSwgeyBzaGFwZTonbGluZWFyJyB9KSxcbiAgICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgZ2xpZGUgPSBnLmluKCAnZ2xpZGUnICksXG4gICAgICAgIHNsaWRpbmdGcmVxID0gZy5zbGlkZSggZnJlcXVlbmN5LCBnbGlkZSwgZ2xpZGUgKSxcbiAgICAgICAgY21SYXRpbyA9IGcuaW4oICdjbVJhdGlvJyApLFxuICAgICAgICBpbmRleCA9IGcuaW4oICdpbmRleCcgKVxuXG4gICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbiggc3luLCBGTS5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG5cbiAgICBzeW4uX19jcmVhdGVHcmFwaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IG1vZE9zYyA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCBzeW4ubW9kdWxhdG9yV2F2ZWZvcm0sIGcubXVsKCBzbGlkaW5nRnJlcSwgY21SYXRpbyApLCBzeW4uYW50aWFsaWFzIClcbiAgICAgIGxldCBtb2RPc2NXaXRoSW5kZXggPSBnLm11bCggbW9kT3NjLCBnLm11bCggc2xpZGluZ0ZyZXEsIGluZGV4ICkgKVxuICAgICAgbGV0IG1vZE9zY1dpdGhFbnYgICA9IGcubXVsKCBtb2RPc2NXaXRoSW5kZXgsIGVudiApXG5cbiAgICAgIGxldCBjYXJyaWVyT3NjID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoIHN5bi5jYXJyaWVyV2F2ZWZvcm0sIGcuYWRkKCBzbGlkaW5nRnJlcSwgbW9kT3NjV2l0aEVudiApLCBzeW4uYW50aWFsaWFzIClcbiAgICAgIGxldCBjYXJyaWVyT3NjV2l0aEVudiA9IGcubXVsKCBjYXJyaWVyT3NjLCBlbnYgKVxuICAgICAgXG4gICAgICBsZXQgY3V0b2ZmID0gZy5hZGQoIGcuaW4oJ2N1dG9mZicpLCBnLm11bCggZy5pbignZmlsdGVyTXVsdCcpLCBlbnYgKSApXG4gICAgICBjb25zdCBmaWx0ZXJlZE9zYyA9IEdpYmJlcmlzaC5maWx0ZXJzLmZhY3RvcnkoIGNhcnJpZXJPc2NXaXRoRW52LCBjdXRvZmYsIGcuaW4oJ1EnKSwgZy5pbignc2F0dXJhdGlvbicpLCBzeW4gKVxuXG4gICAgICBsZXQgc3ludGhXaXRoR2FpbiA9IGcubXVsKCBmaWx0ZXJlZE9zYywgZy5pbiggJ2dhaW4nICkgKSxcbiAgICAgICAgICBwYW5uZXJcblxuICAgICAgaWYoIHByb3BzLnBhblZvaWNlcyA9PT0gdHJ1ZSApIHsgXG4gICAgICAgIHBhbm5lciA9IGcucGFuKCBzeW50aFdpdGhHYWluLCBzeW50aFdpdGhHYWluLCBnLmluKCAncGFuJyApICkgXG4gICAgICAgIHN5bi5ncmFwaCA9IFtwYW5uZXIubGVmdCwgcGFubmVyLnJpZ2h0IF1cbiAgICAgIH1lbHNle1xuICAgICAgICBzeW4uZ3JhcGggPSBzeW50aFdpdGhHYWluXG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIHN5bi5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiA9IFsgJ2NhcnJpZXJXYXZlZm9ybScsICdtb2R1bGF0b3JXYXZlZm9ybScsICdhbnRpYWxpYXMnLCAnZmlsdGVyVHlwZScsICdmaWx0ZXJNb2RlJyBdXG4gICAgc3luLl9fY3JlYXRlR3JhcGgoKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgc3luLmdyYXBoICwgJ2ZtJywgc3luIClcblxuICAgIHN5bi5lbnYgPSBlbnZcblxuICAgIHJldHVybiBzeW5cbiAgfVxuXG4gIEZNLmRlZmF1bHRzID0ge1xuICAgIGNhcnJpZXJXYXZlZm9ybTonc2luZScsXG4gICAgbW9kdWxhdG9yV2F2ZWZvcm06J3NpbmUnLFxuICAgIGF0dGFjazogNDQxMDAsXG4gICAgZGVjYXk6IDQ0MTAwLFxuICAgIGdhaW46IDEsXG4gICAgY21SYXRpbzoyLFxuICAgIGluZGV4OjUsXG4gICAgcHVsc2V3aWR0aDouMjUsXG4gICAgZnJlcXVlbmN5OjIyMCxcbiAgICBwYW46IC41LFxuICAgIGFudGlhbGlhczpmYWxzZSxcbiAgICBwYW5Wb2ljZXM6ZmFsc2UsXG4gICAgZ2xpZGU6MSxcbiAgICBzYXR1cmF0aW9uOjEsXG4gICAgZmlsdGVyTXVsdDo0NDAsXG4gICAgUTouMjUsXG4gICAgY3V0b2ZmOjM1MjAsXG4gICAgZmlsdGVyVHlwZTowLFxuICAgIGZpbHRlck1vZGU6MCxcbiAgICBpc0xvd1Bhc3M6MVxuICB9XG5cbiAgbGV0IFBvbHlGTSA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIEZNLCBbJ2dsaWRlJywnZnJlcXVlbmN5JywnYXR0YWNrJywnZGVjYXknLCdwdWxzZXdpZHRoJywncGFuJywnZ2FpbicsJ2NtUmF0aW8nLCdpbmRleCcsICdzYXR1cmF0aW9uJywgJ2ZpbHRlck11bHQnLCAnUScsICdjdXRvZmYnLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnY2FycmllcldhdmVmb3JtJywgJ21vZHVsYXRvcldhdmVmb3JtJywnZmlsdGVyTW9kZScgXSApIFxuXG4gIHJldHVybiBbIEZNLCBQb2x5Rk0gXVxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBIYXQgPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBsZXQgaGF0ID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApLFxuICAgICAgICB0dW5lICA9IGcuaW4oICd0dW5lJyApLFxuICAgICAgICBzY2FsZWRUdW5lID0gZy5tZW1vKCBnLmFkZCggLjQsIHR1bmUgKSApLFxuICAgICAgICBkZWNheSAgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgIGdhaW4gID0gZy5pbiggJ2dhaW4nIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBIYXQuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgbGV0IGJhc2VGcmVxID0gZy5tdWwoIDMyNSwgc2NhbGVkVHVuZSApLCAvLyByYW5nZSBvZiAxNjIuNSAtIDQ4Ny41XG4gICAgICAgIGJwZkN1dG9mZiA9IGcubXVsKCBnLnBhcmFtKCAnYnBmYycsIDcwMDAgKSwgc2NhbGVkVHVuZSApLFxuICAgICAgICBocGZDdXRvZmYgPSBnLm11bCggZy5wYXJhbSggJ2hwZmMnLCAxMTAwMCApLCBzY2FsZWRUdW5lICksICBcbiAgICAgICAgczEgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGJhc2VGcmVxLCBmYWxzZSApLFxuICAgICAgICBzMiA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5tdWwoIGJhc2VGcmVxLDEuNDQ3MSApICksXG4gICAgICAgIHMzID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBnLm11bCggYmFzZUZyZXEsMS42MTcwICkgKSxcbiAgICAgICAgczQgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGcubXVsKCBiYXNlRnJlcSwxLjkyNjUgKSApLFxuICAgICAgICBzNSA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5tdWwoIGJhc2VGcmVxLDIuNTAyOCApICksXG4gICAgICAgIHM2ID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBnLm11bCggYmFzZUZyZXEsMi42NjM3ICkgKSxcbiAgICAgICAgc3VtID0gZy5hZGQoIHMxLHMyLHMzLHM0LHM1LHM2ICksXG4gICAgICAgIGVnID0gZy5kZWNheSggZy5tdWwoIGRlY2F5LCBnLmdlbi5zYW1wbGVyYXRlICogMiApICksIFxuICAgICAgICBicGYgPSBnLnN2Ziggc3VtLCBicGZDdXRvZmYsIC41LCAyLCBmYWxzZSApLFxuICAgICAgICBlbnZCcGYgPSBnLm11bCggYnBmLCBlZyApLFxuICAgICAgICBocGYgPSBnLmZpbHRlcjI0KCBlbnZCcGYsIDAsIGhwZkN1dG9mZiwgMCApLFxuICAgICAgICBvdXQgPSBnLm11bCggaHBmLCBnYWluIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBoYXQsIG91dCwgJ2hhdCcsIHByb3BzICApXG4gICAgXG4gICAgaGF0LmVudiA9IGVnIFxuXG4gICAgaGF0LmlzU3RlcmVvID0gZmFsc2VcbiAgICByZXR1cm4gaGF0XG4gIH1cbiAgXG4gIEhhdC5kZWZhdWx0cyA9IHtcbiAgICBnYWluOiAgMSxcbiAgICB0dW5lOiAuNixcbiAgICBkZWNheTouMSxcbiAgfVxuXG4gIHJldHVybiBIYXRcblxufVxuIiwibGV0IHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKSxcbiAgICBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5sZXQgaW5zdHJ1bWVudCA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG5PYmplY3QuYXNzaWduKCBpbnN0cnVtZW50LCB7XG4gIG5vdGUoIGZyZXEgKSB7XG4gICAgdGhpcy5mcmVxdWVuY3kgPSBmcmVxXG4gICAgdGhpcy5lbnYudHJpZ2dlcigpXG4gIH0sXG5cbiAgdHJpZ2dlciggX2dhaW4gPSAxICkge1xuICAgIHRoaXMuZ2FpbiA9IF9nYWluXG4gICAgdGhpcy5lbnYudHJpZ2dlcigpXG4gIH0sXG5cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gaW5zdHJ1bWVudFxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG5jb25zdCBpbnN0cnVtZW50cyA9IHtcbiAgS2ljayAgICAgICAgOiByZXF1aXJlKCAnLi9raWNrLmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgQ29uZ2EgICAgICAgOiByZXF1aXJlKCAnLi9jb25nYS5qcycgKSggR2liYmVyaXNoICksXG4gIENsYXZlICAgICAgIDogcmVxdWlyZSggJy4vY29uZ2EuanMnICkoIEdpYmJlcmlzaCApLCAvLyBjbGF2ZSBpcyBzYW1lIGFzIGNvbmdhIHdpdGggZGlmZmVyZW50IGRlZmF1bHRzLCBzZWUgYmVsb3dcbiAgSGF0ICAgICAgICAgOiByZXF1aXJlKCAnLi9oYXQuanMnICkoIEdpYmJlcmlzaCApLFxuICBTbmFyZSAgICAgICA6IHJlcXVpcmUoICcuL3NuYXJlLmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgQ293YmVsbCAgICAgOiByZXF1aXJlKCAnLi9jb3diZWxsLmpzJyApKCBHaWJiZXJpc2ggKVxufVxuXG5pbnN0cnVtZW50cy5DbGF2ZS5kZWZhdWx0cy5mcmVxdWVuY3kgPSAyNTAwXG5pbnN0cnVtZW50cy5DbGF2ZS5kZWZhdWx0cy5kZWNheSA9IC41O1xuXG5bIGluc3RydW1lbnRzLlN5bnRoLCBpbnN0cnVtZW50cy5Qb2x5U3ludGggXSAgICAgPSByZXF1aXJlKCAnLi9zeW50aC5qcycgKSggR2liYmVyaXNoICk7XG5bIGluc3RydW1lbnRzLk1vbm9zeW50aCwgaW5zdHJ1bWVudHMuUG9seU1vbm8gXSAgPSByZXF1aXJlKCAnLi9tb25vc3ludGguanMnICkoIEdpYmJlcmlzaCApO1xuWyBpbnN0cnVtZW50cy5GTSwgaW5zdHJ1bWVudHMuUG9seUZNIF0gICAgICAgICAgID0gcmVxdWlyZSggJy4vZm0uanMnICkoIEdpYmJlcmlzaCApO1xuWyBpbnN0cnVtZW50cy5TYW1wbGVyLCBpbnN0cnVtZW50cy5Qb2x5U2FtcGxlciBdID0gcmVxdWlyZSggJy4vc2FtcGxlci5qcycgKSggR2liYmVyaXNoICk7XG5bIGluc3RydW1lbnRzLkthcnBsdXMsIGluc3RydW1lbnRzLlBvbHlLYXJwbHVzIF0gPSByZXF1aXJlKCAnLi9rYXJwbHVzc3Ryb25nLmpzJyApKCBHaWJiZXJpc2ggKTtcblxuaW5zdHJ1bWVudHMuZXhwb3J0ID0gdGFyZ2V0ID0+IHtcbiAgZm9yKCBsZXQga2V5IGluIGluc3RydW1lbnRzICkge1xuICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgdGFyZ2V0WyBrZXkgXSA9IGluc3RydW1lbnRzWyBrZXkgXVxuICAgIH1cbiAgfVxufVxuXG5yZXR1cm4gaW5zdHJ1bWVudHNcblxufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgS1BTID0gaW5wdXRQcm9wcyA9PiB7XG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBLUFMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgIGNvbnN0IHN5biA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgICB0cmlnZ2VyID0gZy5iYW5nKCksXG4gICAgICAgICAgcGhhc2UgPSBnLmFjY3VtKCAxLCB0cmlnZ2VyLCB7IG1heDpJbmZpbml0eSB9ICksXG4gICAgICAgICAgZW52ID0gZy5ndHAoIGcuc3ViKCAxLCBnLmRpdiggcGhhc2UsIDIwMCApICksIDAgKSxcbiAgICAgICAgICBpbXB1bHNlID0gZy5tdWwoIGcubm9pc2UoKSwgZW52ICksXG4gICAgICAgICAgZmVlZGJhY2sgPSBnLmhpc3RvcnkoKSxcbiAgICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCdmcmVxdWVuY3knKSxcbiAgICAgICAgICBnbGlkZSA9IGcuaW4oICdnbGlkZScgKSxcbiAgICAgICAgICBzbGlkaW5nRnJlcXVlbmN5ID0gZy5zbGlkZSggZnJlcXVlbmN5LCBnbGlkZSwgZ2xpZGUgKSxcbiAgICAgICAgICBkZWxheSA9IGcuZGVsYXkoIGcuYWRkKCBpbXB1bHNlLCBmZWVkYmFjay5vdXQgKSwgZy5kaXYoIEdpYmJlcmlzaC5jdHguc2FtcGxlUmF0ZSwgc2xpZGluZ0ZyZXF1ZW5jeSApLCB7IHNpemU6MjA0OCB9KSxcbiAgICAgICAgICBkZWNheWVkID0gZy5tdWwoIGRlbGF5LCBnLnQ2MCggZy5tdWwoIGcuaW4oJ2RlY2F5JyksIHNsaWRpbmdGcmVxdWVuY3kgKSApICksXG4gICAgICAgICAgZGFtcGVkID0gIGcubWl4KCBkZWNheWVkLCBmZWVkYmFjay5vdXQsIGcuaW4oJ2RhbXBpbmcnKSApLFxuICAgICAgICAgIHdpdGhHYWluID0gZy5tdWwoIGRhbXBlZCwgZy5pbignZ2FpbicpIClcblxuICAgIGZlZWRiYWNrLmluKCBkYW1wZWQgKVxuXG4gICAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBLUFMuZGVmYXVsdHMsIHByb3BzIClcblxuICAgIGlmKCBwcm9wZXJ0aWVzLnBhblZvaWNlcyApIHsgIFxuICAgICAgY29uc3QgcGFubmVyID0gZy5wYW4oIHdpdGhHYWluLCB3aXRoR2FpbiwgZy5pbiggJ3BhbicgKSApXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc3luLCBbcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodF0sICdrYXJwbHVzJywgcHJvcHMgIClcbiAgICB9ZWxzZXtcbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzeW4sIHdpdGhHYWluLCAna2FycGx1cycsIHByb3BzIClcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKCBzeW4sIHtcbiAgICAgIHByb3BlcnRpZXMgOiBwcm9wcyxcblxuICAgICAgZW52IDogdHJpZ2dlcixcbiAgICAgIHBoYXNlLFxuXG4gICAgICBnZXRQaGFzZSgpIHtcbiAgICAgICAgcmV0dXJuIEdpYmJlcmlzaC5tZW1vcnkuaGVhcFsgcGhhc2UubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9LFxuICAgIH0pXG4gICAgcmV0dXJuIHN5blxuICB9XG4gIFxuICBLUFMuZGVmYXVsdHMgPSB7XG4gICAgZGVjYXk6IC45NyxcbiAgICBkYW1waW5nOi4yLFxuICAgIGdhaW46IDEsXG4gICAgZnJlcXVlbmN5OjIyMCxcbiAgICBwYW46IC41LFxuICAgIGdsaWRlOjEsXG4gICAgcGFuVm9pY2VzOmZhbHNlXG4gIH1cblxuICBsZXQgZW52Q2hlY2tGYWN0b3J5ID0gKCBzeW4sc3ludGggKSA9PiB7XG4gICAgbGV0IGVudkNoZWNrID0gKCk9PiB7XG4gICAgICBsZXQgcGhhc2UgPSBzeW4uZ2V0UGhhc2UoKSxcbiAgICAgICAgICBlbmRUaW1lID0gc3ludGguZGVjYXkgKiBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGVcblxuICAgICAgaWYoIHBoYXNlID4gZW5kVGltZSApIHtcbiAgICAgICAgc3ludGguZGlzY29ubmVjdFVnZW4oIHN5biApXG4gICAgICAgIHN5bi5pc0Nvbm5lY3RlZCA9IGZhbHNlXG4gICAgICAgIEdpYmJlcmlzaC5tZW1vcnkuaGVhcFsgc3luLnBoYXNlLm1lbW9yeS52YWx1ZS5pZHggXSA9IDAgLy8gdHJpZ2dlciBkb2Vzbid0IHNlZW0gdG8gcmVzZXQgZm9yIHNvbWUgcmVhc29uXG4gICAgICB9ZWxzZXtcbiAgICAgICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLnB1c2goIGVudkNoZWNrIClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVudkNoZWNrXG4gIH1cblxuICBsZXQgUG9seUtQUyA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIEtQUywgWydmcmVxdWVuY3knLCdkZWNheScsJ2RhbXBpbmcnLCdwYW4nLCdnYWluJywgJ2dsaWRlJ10sIGVudkNoZWNrRmFjdG9yeSApIFxuXG4gIHJldHVybiBbIEtQUywgUG9seUtQUyBdXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IEtpY2sgPSBpbnB1dFByb3BzID0+IHtcbiAgICAvLyBlc3RhYmxpc2ggcHJvdG90eXBlIGNoYWluXG4gICAgbGV0IGtpY2sgPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50IClcblxuICAgIC8vIGRlZmluZSBpbnB1dHNcbiAgICBsZXQgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgZGVjYXkgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgIHRvbmUgID0gZy5pbiggJ3RvbmUnICksXG4gICAgICAgIGdhaW4gID0gZy5pbiggJ2dhaW4nIClcbiAgICBcbiAgICAvLyBjcmVhdGUgaW5pdGlhbCBwcm9wZXJ0eSBzZXRcbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgS2ljay5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG5cbiAgICAvLyBjcmVhdGUgRFNQIGdyYXBoXG4gICAgbGV0IHRyaWdnZXIgPSBnLmJhbmcoKSxcbiAgICAgICAgaW1wdWxzZSA9IGcubXVsKCB0cmlnZ2VyLCA2MCApLFxuICAgICAgICBzY2FsZWREZWNheSA9IGcuc3ViKCAxLjAwNSwgZGVjYXkgKSwgLy8gLT4gcmFuZ2UgeyAuMDA1LCAxLjAwNSB9XG4gICAgICAgIHNjYWxlZFRvbmUgPSBnLmFkZCggNTAsIGcubXVsKCB0b25lLCA0MDAwICkgKSwgLy8gLT4gcmFuZ2UgeyA1MCwgNDA1MCB9XG4gICAgICAgIGJwZiA9IGcuc3ZmKCBpbXB1bHNlLCBmcmVxdWVuY3ksIHNjYWxlZERlY2F5LCAyLCBmYWxzZSApLFxuICAgICAgICBscGYgPSBnLnN2ZiggYnBmLCBzY2FsZWRUb25lLCAuNSwgMCwgZmFsc2UgKSxcbiAgICAgICAgZ3JhcGggPSBnLm11bCggbHBmLCBnYWluIClcbiAgICBcbiAgICBHaWJiZXJpc2guZmFjdG9yeSgga2ljaywgZ3JhcGgsICdraWNrJywgcHJvcHMgIClcblxuICAgIGtpY2suZW52ID0gdHJpZ2dlclxuXG4gICAgcmV0dXJuIGtpY2tcbiAgfVxuICBcbiAgS2ljay5kZWZhdWx0cyA9IHtcbiAgICBnYWluOiAxLFxuICAgIGZyZXF1ZW5jeTo4NSxcbiAgICB0b25lOiAuMjUsXG4gICAgZGVjYXk6LjlcbiAgfVxuXG4gIHJldHVybiBLaWNrXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnICksXG4gICAgICBmZWVkYmFja09zYyA9IHJlcXVpcmUoICcuLi9vc2NpbGxhdG9ycy9mbWZlZWRiYWNrb3NjLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBTeW50aCA9IGFyZ3VtZW50UHJvcHMgPT4ge1xuICAgIGNvbnN0IHN5biA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgICBvc2NzID0gW10sIFxuICAgICAgICAgIGVudiA9IGcuYWQoIGcuaW4oICdhdHRhY2snICksIGcuaW4oICdkZWNheScgKSwgeyBzaGFwZTonbGluZWFyJyB9KSxcbiAgICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICAgIGdsaWRlID0gZy5pbiggJ2dsaWRlJyApLFxuICAgICAgICAgIHNsaWRpbmdGcmVxID0gZy5tZW1vKCBnLnNsaWRlKCBmcmVxdWVuY3ksIGdsaWRlLCBnbGlkZSApIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHN5biwgU3ludGguZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgc3luLl9fY3JlYXRlR3JhcGggPSBmdW5jdGlvbigpIHtcbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgMzsgaSsrICkge1xuICAgICAgICBsZXQgb3NjLCBmcmVxXG5cbiAgICAgICAgc3dpdGNoKCBpICkge1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGZyZXEgPSBnLmFkZCggc2xpZGluZ0ZyZXEsIGcubXVsKCBzbGlkaW5nRnJlcSwgZy5pbignZGV0dW5lMicpICkgKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgZnJlcSA9IGcuYWRkKCBzbGlkaW5nRnJlcSwgZy5tdWwoIHNsaWRpbmdGcmVxLCBnLmluKCdkZXR1bmUzJykgKSApXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgZnJlcSA9IHNsaWRpbmdGcmVxLy9mcmVxdWVuY3lcbiAgICAgICAgfVxuXG4gICAgICAgIG9zYyA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCBzeW4ud2F2ZWZvcm0sIGZyZXEsIHN5bi5hbnRpYWxpYXMgKVxuICAgICAgICBcbiAgICAgICAgb3Njc1sgaSBdID0gb3NjXG4gICAgICB9XG5cbiAgICAgIGxldCBvc2NTdW0gPSBnLmFkZCggLi4ub3NjcyApLFxuICAgICAgICAgIG9zY1dpdGhHYWluID0gZy5tdWwoIGcubXVsKCBvc2NTdW0sIGVudiApLCBnLmluKCAnZ2FpbicgKSApLFxuICAgICAgICAgIC8vY3V0b2ZmID0gZy5hZGQoIGcuaW4oJ2N1dG9mZicpLCBnLm11bCggZy5pbignZmlsdGVyTXVsdCcpLCBlbnYgKSApLFxuICAgICAgICAgIGZpbHRlcmVkT3NjLCBwYW5uZXJcblxuICAgICAgY29uc3QgYmFzZUN1dG9mZkZyZXEgPSBnLm11bCggZy5pbignY3V0b2ZmJyksIGZyZXF1ZW5jeSApXG4gICAgICBsZXQgY3V0b2ZmID0gZy5tdWwoIGcubXVsKCBiYXNlQ3V0b2ZmRnJlcSwgZy5wb3coIDIsIGcuaW4oJ2ZpbHRlck11bHQnKSApKSwgZW52IClcbiAgICAgIGZpbHRlcmVkT3NjID0gR2liYmVyaXNoLmZpbHRlcnMuZmFjdG9yeSggb3NjV2l0aEdhaW4sIGN1dG9mZiwgZy5pbignUScpLCBnLmluKCdzYXR1cmF0aW9uJyksIHN5biApXG4gICAgICAgIFxuICAgICAgaWYoIHByb3BzLnBhblZvaWNlcyApIHsgIFxuICAgICAgICBwYW5uZXIgPSBnLnBhbiggZmlsdGVyZWRPc2MsZmlsdGVyZWRPc2MsIGcuaW4oICdwYW4nICkgKVxuICAgICAgICBzeW4uZ3JhcGggPSBbIHBhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHQgXVxuICAgICAgfWVsc2V7XG4gICAgICAgIHN5bi5ncmFwaCA9IGZpbHRlcmVkT3NjXG4gICAgICB9XG4gICAgfVxuXG4gICAgc3luLl9fcmVxdWlyZXNSZWNvbXBpbGF0aW9uID0gWyAnd2F2ZWZvcm0nLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnZmlsdGVyTW9kZScgXVxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoKClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzeW4sIHN5bi5ncmFwaCwgJ21vbm8nLCBwcm9wcyApXG5cbiAgICBzeW4uZW52ID0gZW52XG5cbiAgICByZXR1cm4gc3luXG4gIH1cbiAgXG4gIFN5bnRoLmRlZmF1bHRzID0ge1xuICAgIHdhdmVmb3JtOiAnc2F3JyxcbiAgICBhdHRhY2s6IDQ0MTAwLFxuICAgIGRlY2F5OiA0NDEwMCxcbiAgICBnYWluOiAuMjUsXG4gICAgcHVsc2V3aWR0aDouMjUsXG4gICAgZnJlcXVlbmN5OjIyMCxcbiAgICBwYW46IC41LFxuICAgIGRldHVuZTI6LjAwNSxcbiAgICBkZXR1bmUzOi0uMDA1LFxuICAgIGN1dG9mZjogMSxcbiAgICByZXNvbmFuY2U6LjI1LFxuICAgIFE6IC41LFxuICAgIHBhblZvaWNlczpmYWxzZSxcbiAgICBnbGlkZTogMSxcbiAgICBhbnRpYWxpYXM6ZmFsc2UsXG4gICAgZmlsdGVyVHlwZTogMixcbiAgICBmaWx0ZXJNb2RlOiAwLCAvLyAwID0gTFAsIDEgPSBIUCwgMiA9IEJQLCAzID0gTm90Y2hcbiAgICBzYXR1cmF0aW9uOi41LFxuICAgIGZpbHRlck11bHQ6IDQsXG4gICAgaXNMb3dQYXNzOnRydWVcbiAgfVxuXG4gIGxldCBQb2x5TW9ubyA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIFN5bnRoLCBcbiAgICBbJ2ZyZXF1ZW5jeScsJ2F0dGFjaycsJ2RlY2F5JywnY3V0b2ZmJywnUScsXG4gICAgICdkZXR1bmUyJywnZGV0dW5lMycsJ3B1bHNld2lkdGgnLCdwYW4nLCdnYWluJywgJ2dsaWRlJywgJ3NhdHVyYXRpb24nLCAnZmlsdGVyTXVsdCcsICAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnd2F2ZWZvcm0nLCAnZmlsdGVyTW9kZSddXG4gICkgXG5cbiAgcmV0dXJuIFsgU3ludGgsIFBvbHlNb25vIF1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBub3RlKCBmcmVxICkge1xuICAgIGxldCB2b2ljZSA9IHRoaXMuX19nZXRWb2ljZV9fKClcbiAgICBPYmplY3QuYXNzaWduKCB2b2ljZSwgdGhpcy5wcm9wZXJ0aWVzIClcbiAgICB2b2ljZS5ub3RlKCBmcmVxIClcbiAgICB0aGlzLl9fcnVuVm9pY2VfXyggdm9pY2UsIHRoaXMgKVxuICAgIHRoaXMudHJpZ2dlck5vdGUgPSBmcmVxXG4gIH0sXG5cbiAgLy8gWFhYIHRoaXMgaXMgbm90IHBhcnRpY3VsYXJseSBzYXRpc2Z5aW5nLi4uXG4gIC8vIG11c3QgY2hlY2sgZm9yIGJvdGggbm90ZXMgYW5kIGNob3Jkc1xuICB0cmlnZ2VyKCBnYWluICkge1xuICAgIGlmKCB0aGlzLnRyaWdnZXJDaG9yZCAhPT0gbnVsbCApIHtcbiAgICAgIHRoaXMudHJpZ2dlckNob3JkLmZvckVhY2goIHYgPT4ge1xuICAgICAgICBsZXQgdm9pY2UgPSB0aGlzLl9fZ2V0Vm9pY2VfXygpXG4gICAgICAgIE9iamVjdC5hc3NpZ24oIHZvaWNlLCB0aGlzLnByb3BlcnRpZXMgKVxuICAgICAgICB2b2ljZS5ub3RlKCB2IClcbiAgICAgICAgdm9pY2UuZ2FpbiA9IGdhaW5cbiAgICAgICAgdGhpcy5fX3J1blZvaWNlX18oIHZvaWNlLCB0aGlzIClcbiAgICAgIH0pXG4gICAgfWVsc2UgaWYoIHRoaXMudHJpZ2dlck5vdGUgIT09IG51bGwgKSB7XG4gICAgICBsZXQgdm9pY2UgPSB0aGlzLl9fZ2V0Vm9pY2VfXygpXG4gICAgICBPYmplY3QuYXNzaWduKCB2b2ljZSwgdGhpcy5wcm9wZXJ0aWVzIClcbiAgICAgIHZvaWNlLm5vdGUoIHRoaXMudHJpZ2dlck5vdGUgKVxuICAgICAgdm9pY2UuZ2FpbiA9IGdhaW5cbiAgICAgIHRoaXMuX19ydW5Wb2ljZV9fKCB2b2ljZSwgdGhpcyApXG4gICAgfWVsc2V7XG4gICAgICBsZXQgdm9pY2UgPSB0aGlzLl9fZ2V0Vm9pY2VfXygpXG4gICAgICBPYmplY3QuYXNzaWduKCB2b2ljZSwgdGhpcy5wcm9wZXJ0aWVzIClcbiAgICAgIHZvaWNlLnRyaWdnZXIoIGdhaW4gKVxuICAgICAgdGhpcy5fX3J1blZvaWNlX18oIHZvaWNlLCB0aGlzIClcbiAgICB9XG4gIH0sXG5cbiAgX19ydW5Wb2ljZV9fKCB2b2ljZSwgX3BvbHkgKSB7XG4gICAgaWYoICF2b2ljZS5pc0Nvbm5lY3RlZCApIHtcbiAgICAgIHZvaWNlLmNvbm5lY3QoIF9wb2x5LCAxIClcbiAgICAgIHZvaWNlLmlzQ29ubmVjdGVkID0gdHJ1ZVxuICAgIH1cblxuICAgIGxldCBlbnZDaGVja1xuICAgIGlmKCBfcG9seS5lbnZDaGVjayA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgZW52Q2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYoIHZvaWNlLmVudi5pc0NvbXBsZXRlKCkgKSB7XG4gICAgICAgICAgX3BvbHkuZGlzY29ubmVjdFVnZW4uY2FsbCggX3BvbHksIHZvaWNlIClcbiAgICAgICAgICB2b2ljZS5pc0Nvbm5lY3RlZCA9IGZhbHNlXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5wdXNoKCBlbnZDaGVjayApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGVudkNoZWNrID0gcG9seS5lbnZDaGVjayggdm9pY2UsIHBvbHkgKVxuICAgIH1cblxuICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5wdXNoKCBlbnZDaGVjayApXG4gIH0sXG5cbiAgX19nZXRWb2ljZV9fKCkge1xuICAgIHJldHVybiB0aGlzLnZvaWNlc1sgdGhpcy52b2ljZUNvdW50KysgJSB0aGlzLnZvaWNlcy5sZW5ndGggXVxuICB9LFxuXG4gIGNob3JkKCBmcmVxdWVuY2llcyApIHtcbiAgICBmcmVxdWVuY2llcy5mb3JFYWNoKCB2ID0+IHRoaXMubm90ZSggdiApIClcbiAgICB0aGlzLnRyaWdnZXJDaG9yZCA9IGZyZXF1ZW5jaWVzXG4gIH0sXG5cbiAgZnJlZSgpIHtcbiAgICBmb3IoIGxldCBjaGlsZCBvZiB0aGlzLnZvaWNlcyApIGNoaWxkLmZyZWUoKVxuICB9XG59XG4iLCIvKlxuICogVGhpcyBmaWxlcyBjcmVhdGVzIGEgZmFjdG9yeSBnZW5lcmF0aW5nIHBvbHlzeW50aCBjb25zdHJ1Y3RvcnMuXG4gKi9cblxuY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IFRlbXBsYXRlRmFjdG9yeSA9ICggdWdlbiwgcHJvcGVydHlMaXN0LCBfZW52Q2hlY2sgKSA9PiB7XG4gICAgLyogXG4gICAgICogcG9seXN5bnRocyBhcmUgYmFzaWNhbGx5IGJ1c3NlcyB0aGF0IGNvbm5lY3QgY2hpbGQgc3ludGggdm9pY2VzLlxuICAgICAqIFdlIGNyZWF0ZSBzZXBhcmF0ZSBwcm90b3R5cGVzIGZvciBtb25vIHZzIHN0ZXJlbyBpbnN0YW5jZXMuXG4gICAgICovXG5cbiAgICBjb25zdCBtb25vUHJvdG8gICA9IE9iamVjdC5jcmVhdGUoIEdpYmJlcmlzaC5CdXMoKSApLFxuICAgICAgICAgIHN0ZXJlb1Byb3RvID0gT2JqZWN0LmNyZWF0ZSggR2liYmVyaXNoLkJ1czIoKSlcblxuICAgIC8vIHNpbmNlIHRoZXJlIGFyZSB0d28gcHJvdG90eXBlcyB3ZSBjYW4ndCBhc3NpZ24gZGlyZWN0bHkgdG8gb25lIG9mIHRoZW0uLi5cbiAgICBPYmplY3QuYXNzaWduKCBtb25vUHJvdG8sICAgR2liYmVyaXNoLm1peGlucy5wb2x5aW5zdHJ1bWVudCApXG4gICAgT2JqZWN0LmFzc2lnbiggc3RlcmVvUHJvdG8sIEdpYmJlcmlzaC5taXhpbnMucG9seWluc3RydW1lbnQgKVxuXG4gICAgY29uc3QgVGVtcGxhdGUgPSBwcm9wcyA9PiB7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbigge30sIHsgaXNTdGVyZW86dHJ1ZSB9LCBwcm9wcyApXG5cbiAgICAgIGNvbnN0IHN5bnRoID0gcHJvcGVydGllcy5pc1N0ZXJlbyA/IE9iamVjdC5jcmVhdGUoIHN0ZXJlb1Byb3RvICkgOiBPYmplY3QuY3JlYXRlKCBtb25vUHJvdG8gKVxuXG4gICAgICBPYmplY3QuYXNzaWduKCBzeW50aCwge1xuICAgICAgICB2b2ljZXM6IFtdLFxuICAgICAgICBtYXhWb2ljZXM6IHByb3BlcnRpZXMubWF4Vm9pY2VzICE9PSB1bmRlZmluZWQgPyBwcm9wZXJ0aWVzLm1heFZvaWNlcyA6IDE2LFxuICAgICAgICB2b2ljZUNvdW50OiAwLFxuICAgICAgICBlbnZDaGVjazogX2VudkNoZWNrLFxuICAgICAgICBpZDogR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKCksXG4gICAgICAgIGRpcnR5OiB0cnVlLFxuICAgICAgICB0eXBlOiAnYnVzJyxcbiAgICAgICAgdWdlbk5hbWU6ICdwb2x5JyArIHVnZW4ubmFtZSArICdfJyArIHN5bnRoLmlkLFxuICAgICAgICBpbnB1dHM6IFtdLFxuICAgICAgICBpbnB1dE5hbWVzOiBbXSxcbiAgICAgICAgcHJvcGVydGllc1xuICAgICAgfSlcblxuICAgICAgcHJvcGVydGllcy5wYW5Wb2ljZXMgPSBwcm9wZXJ0aWVzLmlzU3RlcmVvXG4gICAgICBzeW50aC5jYWxsYmFjay51Z2VuTmFtZSA9IHN5bnRoLnVnZW5OYW1lXG5cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgc3ludGgubWF4Vm9pY2VzOyBpKysgKSB7XG4gICAgICAgIHN5bnRoLnZvaWNlc1tpXSA9IHVnZW4oIHByb3BlcnRpZXMgKVxuICAgICAgICBzeW50aC52b2ljZXNbaV0uY2FsbGJhY2sudWdlbk5hbWUgPSBzeW50aC52b2ljZXNbaV0udWdlbk5hbWVcbiAgICAgICAgc3ludGgudm9pY2VzW2ldLmlzQ29ubmVjdGVkID0gZmFsc2VcbiAgICAgIH1cblxuICAgICAgbGV0IF9wcm9wZXJ0eUxpc3QgXG4gICAgICBpZiggcHJvcGVydGllcy5pc1N0ZXJlbyA9PT0gZmFsc2UgKSB7XG4gICAgICAgIF9wcm9wZXJ0eUxpc3QgPSBwcm9wZXJ0eUxpc3Quc2xpY2UoIDAgKVxuICAgICAgICBjb25zdCBpZHggPSAgX3Byb3BlcnR5TGlzdC5pbmRleE9mKCAncGFuJyApXG4gICAgICAgIGlmKCBpZHggID4gLTEgKSBfcHJvcGVydHlMaXN0LnNwbGljZSggaWR4LCAxIClcbiAgICAgIH1cblxuICAgICAgVGVtcGxhdGVGYWN0b3J5LnNldHVwUHJvcGVydGllcyggc3ludGgsIHVnZW4sIHByb3BlcnRpZXMuaXNTdGVyZW8gPyBwcm9wZXJ0eUxpc3QgOiBfcHJvcGVydHlMaXN0IClcblxuICAgICAgcmV0dXJuIHN5bnRoXG4gICAgfVxuXG4gICAgcmV0dXJuIFRlbXBsYXRlXG4gIH1cblxuICBUZW1wbGF0ZUZhY3Rvcnkuc2V0dXBQcm9wZXJ0aWVzID0gZnVuY3Rpb24oIHN5bnRoLCB1Z2VuLCBwcm9wcyApIHtcbiAgICBmb3IoIGxldCBwcm9wZXJ0eSBvZiBwcm9wcyApIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggc3ludGgsIHByb3BlcnR5LCB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gc3ludGgucHJvcGVydGllc1sgcHJvcGVydHkgXSB8fCB1Z2VuLmRlZmF1bHRzWyBwcm9wZXJ0eSBdXG4gICAgICAgIH0sXG4gICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICBzeW50aC5wcm9wZXJ0aWVzWyBwcm9wZXJ0eSBdID0gdlxuICAgICAgICAgIGZvciggbGV0IGNoaWxkIG9mIHN5bnRoLmlucHV0cyApIHtcbiAgICAgICAgICAgIGNoaWxkWyBwcm9wZXJ0eSBdID0gdlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gVGVtcGxhdGVGYWN0b3J5XG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIGxldCBwcm90byA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHByb3RvLCB7XG4gICAgbm90ZSggcmF0ZSApIHtcbiAgICAgIHRoaXMucmF0ZSA9IHJhdGVcbiAgICAgIGlmKCByYXRlID4gMCApIHtcbiAgICAgICAgdGhpcy50cmlnZ2VyKClcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLl9fcGhhc2VfXy52YWx1ZSA9IHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMSBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgbGV0IFNhbXBsZXIgPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgc3luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbiggeyBvbmxvYWQ6bnVsbCB9LCBTYW1wbGVyLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgIHN5bi5pc1N0ZXJlbyA9IHByb3BzLmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pc1N0ZXJlbyA6IGZhbHNlXG5cbiAgICBsZXQgc3RhcnQgPSBnLmluKCAnc3RhcnQnICksIGVuZCA9IGcuaW4oICdlbmQnICksIFxuICAgICAgICByYXRlID0gZy5pbiggJ3JhdGUnICksIHNob3VsZExvb3AgPSBnLmluKCAnbG9vcHMnIClcblxuICAgIC8qIGNyZWF0ZSBkdW1teSB1Z2VuIHVudGlsIGRhdGEgZm9yIHNhbXBsZXIgaXMgbG9hZGVkLi4uXG4gICAgICogdGhpcyB3aWxsIGJlIG92ZXJyaWRkZW4gYnkgYSBjYWxsIHRvIEdpYmJlcmlzaC5mYWN0b3J5IG9uIGxvYWQgKi9cbiAgICBzeW4uY2FsbGJhY2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDAgfVxuICAgIHN5bi5pZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgc3luLnVnZW5OYW1lID0gc3luLmNhbGxiYWNrLnVnZW5OYW1lID0gJ3NhbXBsZXJfJyArIHN5bi5pZFxuICAgIHN5bi5pbnB1dE5hbWVzID0gW11cbiAgICAvKiBlbmQgZHVtbXkgdWdlbiAqL1xuXG4gICAgc3luLl9fYmFuZ19fID0gZy5iYW5nKClcbiAgICBzeW4udHJpZ2dlciA9IHN5bi5fX2JhbmdfXy50cmlnZ2VyXG5cbiAgICBpZiggcHJvcHMuZmlsZW5hbWUgKSB7XG4gICAgICBzeW4uZGF0YSA9IGcuZGF0YSggcHJvcHMuZmlsZW5hbWUgKVxuXG4gICAgICBzeW4uZGF0YS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIHN5bi5fX3BoYXNlX18gPSBnLmNvdW50ZXIoIHJhdGUsIHN0YXJ0LCBlbmQsIHN5bi5fX2JhbmdfXywgc2hvdWxkTG9vcCwgeyBzaG91bGRXcmFwOmZhbHNlIH0pXG5cbiAgICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgICAgIHN5bixcbiAgICAgICAgICBnLm11bCggXG4gICAgICAgICAgZy5pZmVsc2UoIFxuICAgICAgICAgICAgZy5hbmQoIGcuZ3RlKCBzeW4uX19waGFzZV9fLCBzdGFydCApLCBnLmx0KCBzeW4uX19waGFzZV9fLCBlbmQgKSApLFxuICAgICAgICAgICAgZy5wZWVrKCBcbiAgICAgICAgICAgICAgc3luLmRhdGEsIFxuICAgICAgICAgICAgICBzeW4uX19waGFzZV9fLFxuICAgICAgICAgICAgICB7IG1vZGU6J3NhbXBsZXMnIH1cbiAgICAgICAgICAgICksXG4gICAgICAgICAgICAwXG4gICAgICAgICAgKSwgZy5pbignZ2FpbicpICksXG4gICAgICAgICAgJ3NhbXBsZXInLCBcbiAgICAgICAgICBwcm9wcyBcbiAgICAgICAgKSBcblxuICAgICAgICBpZiggc3luLmVuZCA9PT0gLTk5OTk5OTk5OSApIHN5bi5lbmQgPSBzeW4uZGF0YS5idWZmZXIubGVuZ3RoIC0gMVxuXG4gICAgICAgIGlmKCBzeW4ub25sb2FkICE9PSBudWxsICkgeyBzeW4ub25sb2FkKCkgfVxuXG4gICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggc3luIClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3luXG4gIH1cbiAgXG4gIFNhbXBsZXIuZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogMSxcbiAgICBwYW46IC41LFxuICAgIHJhdGU6IDEsXG4gICAgcGFuVm9pY2VzOmZhbHNlLFxuICAgIGxvb3BzOiAwLFxuICAgIHN0YXJ0OjAsXG4gICAgZW5kOi05OTk5OTk5OTlcbiAgfVxuXG4gIGxldCBQb2x5U2FtcGxlciA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIFNhbXBsZXIsIFsncmF0ZScsJ3BhbicsJ2dhaW4nLCdzdGFydCcsJ2VuZCcsJ2xvb3BzJ10gKSBcblxuICByZXR1cm4gWyBTYW1wbGVyLCBQb2x5U2FtcGxlciBdXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcbiAgXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IFNuYXJlID0gYXJndW1lbnRQcm9wcyA9PiB7XG4gICAgbGV0IHNuYXJlID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApLFxuICAgICAgICBkZWNheSA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgc2NhbGVkRGVjYXkgPSBnLm11bCggZGVjYXksIGcuZ2VuLnNhbXBsZXJhdGUgKiAyICksXG4gICAgICAgIHNuYXBweT0gZy5pbiggJ3NuYXBweScgKSxcbiAgICAgICAgdHVuZSAgPSBnLmluKCAndHVuZScgKSxcbiAgICAgICAgZ2FpbiAgPSBnLmluKCAnZ2FpbicgKVxuXG4gICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIFNuYXJlLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGxldCBlZyA9IGcuZGVjYXkoIHNjYWxlZERlY2F5LCB7IGluaXRWYWx1ZTowIH0gKSwgXG4gICAgICAgIGNoZWNrID0gZy5tZW1vKCBnLmd0KCBlZywgLjAwMDUgKSApLFxuICAgICAgICBybmQgPSBnLm11bCggZy5ub2lzZSgpLCBlZyApLFxuICAgICAgICBocGYgPSBnLnN2Ziggcm5kLCBnLmFkZCggMTAwMCwgZy5tdWwoIGcuYWRkKCAxLCB0dW5lKSwgMTAwMCApICksIC41LCAxLCBmYWxzZSApLFxuICAgICAgICBzbmFwID0gZy5ndHAoIGcubXVsKCBocGYsIHNuYXBweSApLCAwICksIC8vIHJlY3RpZnlcbiAgICAgICAgYnBmMSA9IGcuc3ZmKCBlZywgZy5tdWwoIDE4MCwgZy5hZGQoIHR1bmUsIDEgKSApLCAuMDUsIDIsIGZhbHNlICksXG4gICAgICAgIGJwZjIgPSBnLnN2ZiggZWcsIGcubXVsKCAzMzAsIGcuYWRkKCB0dW5lLCAxICkgKSwgLjA1LCAyLCBmYWxzZSApLFxuICAgICAgICBvdXQgID0gZy5tZW1vKCBnLmFkZCggc25hcCwgYnBmMSwgZy5tdWwoIGJwZjIsIC44ICkgKSApLCAvL1hYWCB3aHkgaXMgbWVtbyBuZWVkZWQ/XG4gICAgICAgIHNjYWxlZE91dCA9IGcubXVsKCBvdXQsIGdhaW4gKVxuICAgIFxuICAgIC8vIFhYWCBUT0RPIDogbWFrZSB0aGlzIHdvcmsgd2l0aCBpZmVsc2UuIHRoZSBwcm9ibGVtIGlzIHRoYXQgcG9rZSB1Z2VucyBwdXQgdGhlaXJcbiAgICAvLyBjb2RlIGF0IHRoZSBib3R0b20gb2YgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLCBpbnN0ZWFkIG9mIGF0IHRoZSBlbmQgb2YgdGhlXG4gICAgLy8gYXNzb2NpYXRlZCBpZi9lbHNlIGJsb2NrLlxuICAgIGxldCBpZmUgPSBnLnN3aXRjaCggY2hlY2ssIHNjYWxlZE91dCwgMCApXG4gICAgLy9sZXQgaWZlID0gZy5pZmVsc2UoIGcuZ3QoIGVnLCAuMDA1ICksIGN5Y2xlKDQ0MCksIDAgKVxuICAgIFxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzbmFyZSwgaWZlLCAnc25hcmUnLCBwcm9wcyAgKVxuICAgIFxuICAgIHNuYXJlLmVudiA9IGVnIFxuXG4gICAgcmV0dXJuIHNuYXJlXG4gIH1cbiAgXG4gIFNuYXJlLmRlZmF1bHRzID0ge1xuICAgIGdhaW46IDEsXG4gICAgZnJlcXVlbmN5OjEwMDAsXG4gICAgdHVuZTowLFxuICAgIHNuYXBweTogMSxcbiAgICBkZWNheTouMVxuICB9XG5cbiAgcmV0dXJuIFNuYXJlXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IFN5bnRoID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgbGV0IHN5biA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKVxuXG4gICAgbGV0IGVudiA9IGcuYWQoIGcuaW4oJ2F0dGFjaycpLCBnLmluKCdkZWNheScpLCB7IHNoYXBlOidsaW5lYXInIH0pLFxuICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICBsb3VkbmVzcyAgPSBnLmluKCAnbG91ZG5lc3MnICksIFxuICAgICAgICBnbGlkZSA9IGcuaW4oICdnbGlkZScgKSxcbiAgICAgICAgc2xpZGluZ0ZyZXEgPSBnLnNsaWRlKCBmcmVxdWVuY3ksIGdsaWRlLCBnbGlkZSApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCBzeW4sIFN5bnRoLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgb3NjID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoIHN5bi53YXZlZm9ybSwgc2xpZGluZ0ZyZXEsIHN5bi5hbnRpYWxpYXMgKVxuXG4gICAgICBsZXQgb3NjV2l0aEVudiA9IGcubXVsKCBnLm11bCggb3NjLCBlbnYsIGxvdWRuZXNzICkgKSxcbiAgICAgICAgICBwYW5uZXJcbiAgXG4gICAgICBjb25zdCBiYXNlQ3V0b2ZmRnJlcSA9IGcubXVsKCBnLmluKCdjdXRvZmYnKSwgZnJlcXVlbmN5IClcbiAgICAgIGxldCBjdXRvZmYgPSBnLm11bCggZy5tdWwoIGJhc2VDdXRvZmZGcmVxLCBnLnBvdyggMiwgZy5pbignZmlsdGVyTXVsdCcpICkpLCBlbnYgKVxuICAgICAgY29uc3QgZmlsdGVyZWRPc2MgPSBHaWJiZXJpc2guZmlsdGVycy5mYWN0b3J5KCBvc2NXaXRoRW52LCBjdXRvZmYsIGcuaW4oJ1EnKSwgZy5pbignc2F0dXJhdGlvbicpLCBwcm9wcyApXG5cbiAgICAgIGxldCBzeW50aFdpdGhHYWluID0gZy5tdWwoIGZpbHRlcmVkT3NjLCBnLmluKCAnZ2FpbicgKSApXG4gIFxuICAgICAgaWYoIHN5bi5wYW5Wb2ljZXMgPT09IHRydWUgKSB7IFxuICAgICAgICBwYW5uZXIgPSBnLnBhbiggc3ludGhXaXRoR2Fpbiwgc3ludGhXaXRoR2FpbiwgZy5pbiggJ3BhbicgKSApIFxuICAgICAgICBzeW4uZ3JhcGggPSBbcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodF1cbiAgICAgIH1lbHNle1xuICAgICAgICBzeW4uZ3JhcGggPSBzeW50aFdpdGhHYWluXG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIHN5bi5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiA9IFsgJ3dhdmVmb3JtJywgJ2FudGlhbGlhcycsICdmaWx0ZXJUeXBlJywnZmlsdGVyTW9kZScgXVxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoKClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzeW4sIHN5bi5ncmFwaCwgJ3N5bnRoJywgcHJvcHMgIClcblxuICAgIHN5bi5lbnYgPSBlbnZcblxuICAgIHJldHVybiBzeW5cbiAgfVxuICBcbiAgU3ludGguZGVmYXVsdHMgPSB7XG4gICAgd2F2ZWZvcm06J3NhdycsXG4gICAgYXR0YWNrOiA0NDEwMCxcbiAgICBkZWNheTogNDQxMDAsXG4gICAgZ2FpbjogMSxcbiAgICBwdWxzZXdpZHRoOi4yNSxcbiAgICBmcmVxdWVuY3k6MjIwLFxuICAgIHBhbjogLjUsXG4gICAgYW50aWFsaWFzOmZhbHNlLFxuICAgIHBhblZvaWNlczpmYWxzZSxcbiAgICBsb3VkbmVzczoxLFxuICAgIGdsaWRlOjEsXG4gICAgc2F0dXJhdGlvbjoxLFxuICAgIGZpbHRlck11bHQ6MixcbiAgICBROi4yNSxcbiAgICBjdXRvZmY6LjUsXG4gICAgZmlsdGVyVHlwZTowLFxuICAgIGZpbHRlck1vZGU6MCxcbiAgICBpc0xvd1Bhc3M6MVxuICB9XG5cbiAgLy8gZG8gbm90IGluY2x1ZGUgdmVsb2NpdHksIHdoaWNoIHNob3VkbCBhbHdheXMgYmUgcGVyIHZvaWNlXG4gIGxldCBQb2x5U3ludGggPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBTeW50aCwgWydmcmVxdWVuY3knLCdhdHRhY2snLCdkZWNheScsJ3B1bHNld2lkdGgnLCdwYW4nLCdnYWluJywnZ2xpZGUnLCAnc2F0dXJhdGlvbicsICdmaWx0ZXJNdWx0JywgJ1EnLCAnY3V0b2ZmJywgJ3Jlc29uYW5jZScsICdhbnRpYWxpYXMnLCAnZmlsdGVyVHlwZScsICd3YXZlZm9ybScsICdmaWx0ZXJNb2RlJ10gKSBcblxuICByZXR1cm4gWyBTeW50aCwgUG9seVN5bnRoIF1cblxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBCaW5vcHMgPSB7XG4gICAgZXhwb3J0KCBvYmogKSB7XG4gICAgICBmb3IoIGxldCBrZXkgaW4gQmlub3BzICkge1xuICAgICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyApIHtcbiAgICAgICAgICBvYmpbIGtleSBdID0gQmlub3BzWyBrZXkgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBBZGQoIC4uLmFyZ3MgKSB7XG4gICAgICBsZXQgaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgcmV0dXJuIHsgYmlub3A6dHJ1ZSwgb3A6JysnLCBpbnB1dHM6YXJncywgdWdlbk5hbWU6J2FkZCcgKyBpZCwgaWQgfVxuICAgIH0sXG5cbiAgICBTdWIoIC4uLmFyZ3MgKSB7XG4gICAgICBsZXQgaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgcmV0dXJuIHsgYmlub3A6dHJ1ZSwgb3A6Jy0nLCBpbnB1dHM6YXJncywgdWdlbk5hbWU6J3N1YicgKyBpZCwgaWQgfVxuICAgIH0sXG5cbiAgICBNdWwoIC4uLmFyZ3MgKSB7XG4gICAgICBsZXQgaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgcmV0dXJuIHsgYmlub3A6dHJ1ZSwgb3A6JyonLCBpbnB1dHM6YXJncywgdWdlbk5hbWU6J211bCcgKyBpZCwgaWQgfVxuICAgIH0sXG5cbiAgICBEaXYoIC4uLmFyZ3MgKSB7XG4gICAgICBsZXQgaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgcmV0dXJuIHsgYmlub3A6dHJ1ZSwgb3A6Jy8nLCBpbnB1dHM6YXJncywgdWdlbk5hbWU6J2RpdicgKyBpZCwgaWQgfVxuICAgIH0sXG5cbiAgICBNb2QoIC4uLmFyZ3MgKSB7XG4gICAgICBsZXQgaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgcmV0dXJuIHsgYmlub3A6dHJ1ZSwgb3A6JyUnLCBpbnB1dHM6YXJncywgdWdlbk5hbWU6J21vZCcgKyBpZCwgaWQgfVxuICAgIH0sICAgXG4gIH1cblxuICByZXR1cm4gQmlub3BzXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgQnVzID0geyBcbiAgICBmYWN0b3J5OiBudWxsLC8vR2liYmVyaXNoLmZhY3RvcnkoIGcuYWRkKCAwICkgLCAnYnVzJywgWyAwLCAxIF0gICksXG5cbiAgICBjcmVhdGUoKSB7XG4gICAgICBsZXQgYnVzID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBcbiAgICAgIGJ1cy5jYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgb3V0cHV0ID0gMFxuICAgICAgIC8vIG91dHB1dFsgMCBdID0gb3V0cHV0WyAxIF0gPSAwXG5cbiAgICAgICAgZm9yKCBsZXQgaSA9IDAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBvdXRwdXQgKz0gYXJndW1lbnRzWyBpIF1cbiAgICAgICAgICAvL291dHB1dFsgMCBdICs9IGlucHV0XG4gICAgICAgICAgLy9vdXRwdXRbIDEgXSArPSBpbnB1dFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dHB1dFxuICAgICAgfVxuXG4gICAgICBidXMuaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgYnVzLmRpcnR5ID0gdHJ1ZVxuICAgICAgYnVzLnR5cGUgPSAnYnVzJ1xuICAgICAgYnVzLnVnZW5OYW1lID0gJ2J1c18nICsgYnVzLmlkXG4gICAgICBidXMuaW5wdXRzID0gW11cbiAgICAgIGJ1cy5pbnB1dE5hbWVzID0gW11cblxuICAgICAgYnVzLmNoYWluID0gKCB0YXJnZXQsIGxldmVsID0gMSApID0+IHtcbiAgICAgICAgdGhpcy5jb25uZWN0KCB0YXJnZXQsIGxldmVsIClcbiAgICAgICAgcmV0dXJuIHRhcmdldFxuICAgICAgfVxuXG4gICAgICBidXMuZGlzY29ubmVjdFVnZW4gPSAoIHVnZW4gKSA9PiB7XG4gICAgICAgIGxldCByZW1vdmVJZHggPSAtMVxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMuaW5wdXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIGxldCBpbnB1dCA9IHRoaXMuaW5wdXRzWyBpIF1cblxuICAgICAgICAgIGlmKCBpc05hTiggaW5wdXQgKSAmJiB1Z2VuID09PSBpbnB1dCApIHtcbiAgICAgICAgICAgIHJlbW92ZUlkeCA9IGlcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoIHJlbW92ZUlkeCAhPT0gLTEgKSB7XG4gICAgICAgICAgdGhpcy5pbnB1dHMuc3BsaWNlKCByZW1vdmVJZHgsIDEgKVxuICAgICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdGhpcyApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIGJ1c1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBCdXMuY3JlYXRlXG5cbn1cblxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IEJ1czIgPSB7IFxuICAgIGNyZWF0ZSgpIHtcbiAgICAgIGxldCBvdXRwdXQgPSBuZXcgRmxvYXQzMkFycmF5KCAyIClcblxuICAgICAgbGV0IGJ1cyA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG4gICAgICBPYmplY3QuYXNzaWduKCBidXMsIHtcbiAgICAgICAgY2FsbGJhY2soKSB7XG4gICAgICAgICAgb3V0cHV0WyAwIF0gPSBvdXRwdXRbIDEgXSA9IDBcblxuICAgICAgICAgIGZvciggbGV0IGkgPSAwLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICBsZXQgaW5wdXQgPSBhcmd1bWVudHNbIGkgXSxcbiAgICAgICAgICAgICAgICBpc0FycmF5ID0gaW5wdXQgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXlcblxuICAgICAgICAgICAgb3V0cHV0WyAwIF0gKz0gaXNBcnJheSA/IGlucHV0WyAwIF0gOiBpbnB1dFxuICAgICAgICAgICAgb3V0cHV0WyAxIF0gKz0gaXNBcnJheSA/IGlucHV0WyAxIF0gOiBpbnB1dFxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBvdXRwdXRcbiAgICAgICAgfSxcbiAgICAgICAgaWQgOiBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKSxcbiAgICAgICAgZGlydHkgOiB0cnVlLFxuICAgICAgICB0eXBlIDogJ2J1cycsXG4gICAgICAgIGlucHV0cyA6IFtdLFxuICAgICAgICBpbnB1dE5hbWVzIDogW10sXG4gICAgICB9KVxuXG4gICAgICBidXMudWdlbk5hbWUgPSBidXMuY2FsbGJhY2sudWdlbk5hbWUgPSAnYnVzMl8nICsgYnVzLmlkXG5cbiAgICAgIGJ1cy5kaXNjb25uZWN0VWdlbiA9IGZ1bmN0aW9uKCB1Z2VuICkge1xuICAgICAgICBsZXQgcmVtb3ZlSWR4ID0gdGhpcy5pbnB1dHMuaW5kZXhPZiggdWdlbiApXG4gICAgICAgIFxuICAgICAgICBpZiggcmVtb3ZlSWR4ICE9PSAtMSApIHtcbiAgICAgICAgICB0aGlzLmlucHV0cy5zcGxpY2UoIHJlbW92ZUlkeCwgMSApXG4gICAgICAgICAgR2liYmVyaXNoLmRpcnR5KCB0aGlzIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gYnVzXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIEJ1czIuY3JlYXRlXG5cbn1cblxuIiwiY29uc3QgIGcgICAgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyAgKSxcbiAgICAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IE1vbm9wcyA9IHtcbiAgICBleHBvcnQoIG9iaiApIHtcbiAgICAgIGZvciggbGV0IGtleSBpbiBNb25vcHMgKSB7XG4gICAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgICAgIG9ialsga2V5IF0gPSBNb25vcHNbIGtleSBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIEFicyggaW5wdXQgKSB7XG4gICAgICBjb25zdCBhYnMgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5hYnMoIGcuaW4oJ2lucHV0JykgKVxuICAgICAgXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggYWJzLCBncmFwaCwgJ2FicycsIE9iamVjdC5hc3NpZ24oe30sIE1vbm9wcy5kZWZhdWx0cywgeyBpbnB1dCB9KSApXG5cbiAgICAgIHJldHVybiBhYnNcbiAgICB9LFxuXG4gICAgUG93KCBpbnB1dCwgZXhwb25lbnQgKSB7XG4gICAgICBjb25zdCBwb3cgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5wb3coIGcuaW4oJ2lucHV0JyksIGcuaW4oJ2V4cG9uZW50JykgKVxuICAgICAgXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggcG93LCBncmFwaCwgJ2FicycsIE9iamVjdC5hc3NpZ24oe30sIE1vbm9wcy5kZWZhdWx0cywgeyBpbnB1dCwgZXhwb25lbnQgfSkgKVxuXG4gICAgICByZXR1cm4gcG93XG4gICAgfSxcblxuICAgIE1lcmdlKCBpbnB1dCApIHtcbiAgICAgIGNvbnN0IG1lcmdlciA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgICAgY29uc3QgY2IgPSBmdW5jdGlvbiggX2lucHV0ICkge1xuICAgICAgICByZXR1cm4gX2lucHV0WzBdICsgX2lucHV0WzFdXG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBtZXJnZXIsIGcuaW4oICdpbnB1dCcgKSwgJ21lcmdlJywgeyBpbnB1dCB9LCBjYiApXG4gICAgICBtZXJnZXIudHlwZSA9ICdhbmFseXNpcydcbiAgICAgIG1lcmdlci5pbnB1dE5hbWVzID0gWyAnaW5wdXQnIF1cbiAgICAgIG1lcmdlci5pbnB1dHMgPSBbIGlucHV0IF1cbiAgICAgIG1lcmdlci5pbnB1dCA9IGlucHV0XG4gICAgICBcbiAgICAgIHJldHVybiBtZXJnZXJcbiAgICB9LFxuICB9XG5cbiAgTW9ub3BzLmRlZmF1bHRzID0geyBpbnB1dDowIH1cblxuICByZXR1cm4gTW9ub3BzXG59XG4iLCJjb25zdCBnZW5pc2ggPSByZXF1aXJlKCdnZW5pc2guanMnKSxcbiAgICAgIHNzZCA9IGdlbmlzaC5oaXN0b3J5LFxuICAgICAgbm9pc2UgPSBnZW5pc2gubm9pc2U7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBsYXN0ID0gc3NkKDApO1xuXG4gIGNvbnN0IHdoaXRlID0gZ2VuaXNoLnN1YihnZW5pc2gubXVsKG5vaXNlKCksIDIpLCAxKTtcblxuICBsZXQgb3V0ID0gZ2VuaXNoLmFkZChsYXN0Lm91dCwgZ2VuaXNoLmRpdihnZW5pc2gubXVsKC4wMiwgd2hpdGUpLCAxLjAyKSk7XG5cbiAgbGFzdC5pbihvdXQpO1xuXG4gIG91dCA9IGdlbmlzaC5tdWwob3V0LCAzLjUpO1xuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKlxuZm9yICh2YXIgaSA9IDA7IGkgPCBidWZmZXJTaXplOyBpKyspIHtcbiAgICB2YXIgd2hpdGUgPSBNYXRoLnJhbmRvbSgpICogMiAtIDE7XG4gICAgb3V0cHV0W2ldID0gKGxhc3RPdXQgKyAoMC4wMiAqIHdoaXRlKSkgLyAxLjAyO1xuICAgIGxhc3RPdXQgPSBvdXRwdXRbaV07XG4gICAgb3V0cHV0W2ldICo9IDMuNTsgLy8gKHJvdWdobHkpIGNvbXBlbnNhdGUgZm9yIGdhaW5cbn1cbiovIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbmxldCBmZWVkYmFja09zYyA9IGZ1bmN0aW9uKCBmcmVxdWVuY3ksIGZpbHRlciwgcHVsc2V3aWR0aD0uNSwgYXJndW1lbnRQcm9wcyApIHtcbiAgaWYoIGFyZ3VtZW50UHJvcHMgPT09IHVuZGVmaW5lZCApIGFyZ3VtZW50UHJvcHMgPSB7IHR5cGU6IDAgfVxuXG4gIGxldCBsYXN0U2FtcGxlID0gZy5oaXN0b3J5KCksXG4gICAgICAvLyBkZXRlcm1pbmUgcGhhc2UgaW5jcmVtZW50IGFuZCBtZW1vaXplIHJlc3VsdFxuICAgICAgdyA9IGcubWVtbyggZy5kaXYoIGZyZXF1ZW5jeSwgZy5nZW4uc2FtcGxlcmF0ZSApICksXG4gICAgICAvLyBjcmVhdGUgc2NhbGluZyBmYWN0b3JcbiAgICAgIG4gPSBnLnN1YiggLS41LCB3ICksXG4gICAgICBzY2FsaW5nID0gZy5tdWwoIGcubXVsKCAxMywgZmlsdGVyICksIGcucG93KCBuLCA1ICkgKSxcbiAgICAgIC8vIGNhbGN1bGF0ZSBkYyBvZmZzZXQgYW5kIG5vcm1hbGl6YXRpb24gZmFjdG9yc1xuICAgICAgREMgPSBnLnN1YiggLjM3NiwgZy5tdWwoIHcsIC43NTIgKSApLFxuICAgICAgbm9ybSA9IGcuc3ViKCAxLCBnLm11bCggMiwgdyApICksXG4gICAgICAvLyBkZXRlcm1pbmUgcGhhc2VcbiAgICAgIG9zYzFQaGFzZSA9IGcuYWNjdW0oIHcsIDAsIHsgbWluOi0xIH0pLFxuICAgICAgb3NjMSwgb3V0XG5cbiAgLy8gY3JlYXRlIGN1cnJlbnQgc2FtcGxlLi4uIGZyb20gdGhlIHBhcGVyOlxuICAvLyBvc2MgPSAob3NjICsgc2luKDIqcGkqKHBoYXNlICsgb3NjKnNjYWxpbmcpKSkqMC41ZjtcbiAgb3NjMSA9IGcubWVtbyggXG4gICAgZy5tdWwoXG4gICAgICBnLmFkZChcbiAgICAgICAgbGFzdFNhbXBsZS5vdXQsXG4gICAgICAgIGcuc2luKFxuICAgICAgICAgIGcubXVsKFxuICAgICAgICAgICAgTWF0aC5QSSAqIDIsXG4gICAgICAgICAgICBnLm1lbW8oIGcuYWRkKCBvc2MxUGhhc2UsIGcubXVsKCBsYXN0U2FtcGxlLm91dCwgc2NhbGluZyApICkgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIC41XG4gICAgKVxuICApXG5cbiAgLy8gc3RvcmUgc2FtcGxlIHRvIHVzZSBhcyBtb2R1bGF0aW9uXG4gIGxhc3RTYW1wbGUuaW4oIG9zYzEgKVxuXG4gIC8vIGlmIHB3bSAvIHNxdWFyZSB3YXZlZm9ybSBpbnN0ZWFkIG9mIHNhd3Rvb3RoLi4uXG4gIGlmKCBhcmd1bWVudFByb3BzLnR5cGUgPT09IDEgKSB7IFxuICAgIGNvbnN0IGxhc3RTYW1wbGUyID0gZy5oaXN0b3J5KCkgLy8gZm9yIG9zYyAyXG4gICAgY29uc3QgbGFzdFNhbXBsZU1hc3RlciA9IGcuaGlzdG9yeSgpIC8vIGZvciBzdW0gb2Ygb3NjMSxvc2MyXG5cbiAgICBjb25zdCBvc2MyID0gZy5tdWwoXG4gICAgICBnLmFkZChcbiAgICAgICAgbGFzdFNhbXBsZTIub3V0LFxuICAgICAgICBnLnNpbihcbiAgICAgICAgICBnLm11bChcbiAgICAgICAgICAgIE1hdGguUEkgKiAyLFxuICAgICAgICAgICAgZy5tZW1vKCBnLmFkZCggb3NjMVBoYXNlLCBnLm11bCggbGFzdFNhbXBsZTIub3V0LCBzY2FsaW5nICksIHB1bHNld2lkdGggKSApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApLFxuICAgICAgLjVcbiAgICApXG5cbiAgICBsYXN0U2FtcGxlMi5pbiggb3NjMiApXG4gICAgb3V0ID0gZy5tZW1vKCBnLnN1YiggbGFzdFNhbXBsZS5vdXQsIGxhc3RTYW1wbGUyLm91dCApIClcbiAgICBvdXQgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggMi41LCBvdXQgKSwgZy5tdWwoIC0xLjUsIGxhc3RTYW1wbGVNYXN0ZXIub3V0ICkgKSApXG4gICAgXG4gICAgbGFzdFNhbXBsZU1hc3Rlci5pbiggZy5zdWIoIG9zYzEsIG9zYzIgKSApXG5cbiAgfWVsc2V7XG4gICAgIC8vIG9mZnNldCBhbmQgbm9ybWFsaXplXG4gICAgb3NjMSA9IGcuYWRkKCBnLm11bCggMi41LCBvc2MxICksIGcubXVsKCAtMS41LCBsYXN0U2FtcGxlLm91dCApIClcbiAgICBvc2MxID0gZy5hZGQoIG9zYzEsIERDIClcbiBcbiAgICBvdXQgPSBvc2MxXG4gIH1cblxuICByZXR1cm4gZy5tdWwoIG91dCwgbm9ybSApXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmVlZGJhY2tPc2NcbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgICAgZmVlZGJhY2tPc2MgPSByZXF1aXJlKCAnLi9mbWZlZWRiYWNrb3NjLmpzJyApXG5cbi8vICBfX21ha2VPc2NpbGxhdG9yX18oIHR5cGUsIGZyZXF1ZW5jeSwgYW50aWFsaWFzICkge1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBsZXQgT3NjaWxsYXRvcnMgPSB7XG4gICAgZXhwb3J0KCBvYmogKSB7XG4gICAgICBmb3IoIGxldCBrZXkgaW4gT3NjaWxsYXRvcnMgKSB7XG4gICAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgICAgIG9ialsga2V5IF0gPSBPc2NpbGxhdG9yc1sga2V5IF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBnZW5pc2g6IHtcbiAgICAgIEJyb3duOiByZXF1aXJlKCAnLi9icm93bm5vaXNlLmpzJyApLFxuICAgICAgUGluazogIHJlcXVpcmUoICcuL3Bpbmtub2lzZS5qcycgIClcbiAgICB9LFxuXG4gICAgV2F2ZXRhYmxlOiByZXF1aXJlKCAnLi93YXZldGFibGUuanMnICkoIEdpYmJlcmlzaCApLFxuICAgIFxuICAgIFNxdWFyZSggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHNxciAgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApIFxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHsgYW50aWFsaWFzOmZhbHNlIH0sIE9zY2lsbGF0b3JzLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICAgIGNvbnN0IG9zYyAgID0gT3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGcuaW4oICdmcmVxdWVuY3knICksIHByb3BzLmFudGlhbGlhcyApXG4gICAgICBjb25zdCBncmFwaCA9IGcubXVsKCBvc2MsIGcuaW4oJ2dhaW4nICkgKVxuXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc3FyLCBncmFwaCwgJ3NxcicsIHByb3BzIClcblxuICAgICAgcmV0dXJuIHNxclxuICAgIH0sXG5cbiAgICBQV00oIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBwd20gICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSBcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7IGFudGlhbGlhczpmYWxzZSwgcHVsc2V3aWR0aDouMjUgfSwgT3NjaWxsYXRvcnMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgICAgY29uc3Qgb3NjICAgPSBPc2NpbGxhdG9ycy5mYWN0b3J5KCAncHdtJywgZy5pbiggJ2ZyZXF1ZW5jeScgKSwgcHJvcHMuYW50aWFsaWFzIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIG9zYywgZy5pbignZ2FpbicgKSApXG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBwd20sIGdyYXBoLCAncHdtJywgcHJvcHMgKVxuXG4gICAgICByZXR1cm4gcHdtXG4gICAgfSxcblxuICAgIFNpbmUoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBzaW5lICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgICBjb25zdCBncmFwaCA9IGcubXVsKCBnLmN5Y2xlKCBnLmluKCdmcmVxdWVuY3knKSApLCBnLmluKCdnYWluJykgKVxuXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc2luZSwgZ3JhcGgsICdzaW5lJywgcHJvcHMgKVxuICAgICAgXG4gICAgICByZXR1cm4gc2luZVxuICAgIH0sXG5cbiAgICBOb2lzZSggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IG5vaXNlID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCB7IGdhaW46IDEsIGNvbG9yOid3aGl0ZScgfSwgaW5wdXRQcm9wcyApXG4gICAgICBsZXQgZ3JhcGggXG5cbiAgICAgIHN3aXRjaCggcHJvcHMuY29sb3IgKSB7XG4gICAgICAgIGNhc2UgJ2Jyb3duJzpcbiAgICAgICAgICBncmFwaCA9IGcubXVsKCBPc2NpbGxhdG9ycy5nZW5pc2guQnJvd24oKSwgZy5pbignZ2FpbicpIClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncGluayc6XG4gICAgICAgICAgZ3JhcGggPSBnLm11bCggT3NjaWxsYXRvcnMuZ2VuaXNoLlBpbmsoKSwgZy5pbignZ2FpbicpIClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBncmFwaCA9IGcubXVsKCBnLm5vaXNlKCksIGcuaW4oJ2dhaW4nKSApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBub2lzZSwgZ3JhcGgsICdub2lzZScsIHByb3BzIClcblxuICAgICAgcmV0dXJuIG5vaXNlXG4gICAgfSxcblxuICAgIFNhdyggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHNhdyAgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApIFxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHsgYW50aWFsaWFzOmZhbHNlIH0sIE9zY2lsbGF0b3JzLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICAgIGNvbnN0IG9zYyAgID0gT3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NhdycsIGcuaW4oICdmcmVxdWVuY3knICksIHByb3BzLmFudGlhbGlhcyApXG4gICAgICBjb25zdCBncmFwaCA9IGcubXVsKCBvc2MsIGcuaW4oJ2dhaW4nICkgKVxuXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc2F3LCBncmFwaCwgJ3NhdycsIHByb3BzIClcblxuICAgICAgcmV0dXJuIHNhd1xuICAgIH0sXG5cbiAgICBSZXZlcnNlU2F3KCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3Qgc2F3ICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICkgXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oeyBhbnRpYWxpYXM6ZmFsc2UgfSwgT3NjaWxsYXRvcnMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgICAgY29uc3Qgb3NjICAgPSBnLnN1YiggMSwgT3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NhdycsIGcuaW4oICdmcmVxdWVuY3knICksIHByb3BzLmFudGlhbGlhcyApIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIG9zYywgZy5pbiggJ2dhaW4nICkgKVxuXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc2F3LCBncmFwaCwgJ3JzYXcnLCBwcm9wcyApXG4gICAgICBcbiAgICAgIHJldHVybiBzYXdcbiAgICB9LFxuXG4gICAgZmFjdG9yeSggdHlwZSwgZnJlcXVlbmN5LCBhbnRpYWxpYXM9ZmFsc2UgKSB7XG4gICAgICBsZXQgb3NjXG5cbiAgICAgIHN3aXRjaCggdHlwZSApIHtcbiAgICAgICAgY2FzZSAnc2F3JzpcbiAgICAgICAgICBpZiggYW50aWFsaWFzID09PSBmYWxzZSApIHtcbiAgICAgICAgICAgIG9zYyA9IGcucGhhc29yKCBmcmVxdWVuY3kgKVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgb3NjID0gZmVlZGJhY2tPc2MoIGZyZXF1ZW5jeSwgMSApXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzcXVhcmUnOlxuICAgICAgICAgIGlmKCBhbnRpYWxpYXMgPT09IHRydWUgKSB7XG4gICAgICAgICAgICBvc2MgPSBmZWVkYmFja09zYyggZnJlcXVlbmN5LCAxLCAuNSwgeyB0eXBlOjEgfSlcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIG9zYyA9IGcud2F2ZXRhYmxlKCBmcmVxdWVuY3ksIHsgYnVmZmVyOk9zY2lsbGF0b3JzLlNxdWFyZS5idWZmZXIsIG5hbWU6J3NxdWFyZScgfSApXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzaW5lJzpcbiAgICAgICAgICBvc2MgPSBnLmN5Y2xlKCBmcmVxdWVuY3kgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdwd20nOlxuICAgICAgICAgIGxldCBwdWxzZXdpZHRoID0gZy5pbigncHVsc2V3aWR0aCcpXG4gICAgICAgICAgaWYoIGFudGlhbGlhcyA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICAgIG9zYyA9IGZlZWRiYWNrT3NjKCBmcmVxdWVuY3ksIDEsIHB1bHNld2lkdGgsIHsgdHlwZToxIH0pXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBsZXQgcGhhc2UgPSBnLnBoYXNvciggZnJlcXVlbmN5LCAwLCB7IG1pbjowIH0gKVxuICAgICAgICAgICAgb3NjID0gZy5sdCggcGhhc2UsIHB1bHNld2lkdGggKVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9zY1xuICAgIH1cbiAgfVxuXG4gIE9zY2lsbGF0b3JzLlNxdWFyZS5idWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICBmb3IoIGxldCBpID0gMTAyMzsgaSA+PSAwOyBpLS0gKSB7IFxuICAgIE9zY2lsbGF0b3JzLlNxdWFyZS5idWZmZXIgWyBpIF0gPSBpIC8gMTAyNCA+IC41ID8gMSA6IC0xXG4gIH1cblxuICBPc2NpbGxhdG9ycy5kZWZhdWx0cyA9IHtcbiAgICBmcmVxdWVuY3k6IDQ0MCxcbiAgICBnYWluOiAxXG4gIH1cblxuICByZXR1cm4gT3NjaWxsYXRvcnNcblxufVxuIiwiY29uc3QgZ2VuaXNoID0gcmVxdWlyZSgnZ2VuaXNoLmpzJyksXG4gICAgICBzc2QgPSBnZW5pc2guaGlzdG9yeSxcbiAgICAgIG5vaXNlID0gZ2VuaXNoLm5vaXNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgYjAgPSBzc2QoMCksXG4gICAgICAgIGIxID0gc3NkKDApLFxuICAgICAgICBiMiA9IHNzZCgwKSxcbiAgICAgICAgYjMgPSBzc2QoMCksXG4gICAgICAgIGI0ID0gc3NkKDApLFxuICAgICAgICBiNSA9IHNzZCgwKSxcbiAgICAgICAgYjYgPSBzc2QoMCk7XG4gIGNvbnN0IHdoaXRlID0gZ2VuaXNoLnN1YihnZW5pc2gubXVsKG5vaXNlKCksIDIpLCAxKTtcblxuICBiMC5pbihnZW5pc2guYWRkKGdlbmlzaC5tdWwoLjk5ODg2LCBiMC5vdXQpLCBnZW5pc2gubXVsKHdoaXRlLCAuMDU1NTE3OSkpKTtcbiAgYjEuaW4oZ2VuaXNoLmFkZChnZW5pc2gubXVsKC45OTMzMiwgYjEub3V0KSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjA3NTA1NzkpKSk7XG4gIGIyLmluKGdlbmlzaC5hZGQoZ2VuaXNoLm11bCguOTY5MDAsIGIyLm91dCksIGdlbmlzaC5tdWwod2hpdGUsIC4xNTM4NTIwKSkpO1xuICBiMy5pbihnZW5pc2guYWRkKGdlbmlzaC5tdWwoLjg4NjUwLCBiMy5vdXQpLCBnZW5pc2gubXVsKHdoaXRlLCAuMzEwNDg1NikpKTtcbiAgYjQuaW4oZ2VuaXNoLmFkZChnZW5pc2gubXVsKC41NTAwMCwgYjQub3V0KSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjUzMjk1MjIpKSk7XG4gIGI1LmluKGdlbmlzaC5zdWIoZ2VuaXNoLm11bCgtLjc2MTYsIGI1Lm91dCksIGdlbmlzaC5tdWwod2hpdGUsIC4wMTY4OTgwKSkpO1xuXG4gIG91dCA9IGdlbmlzaC5tdWwoZ2VuaXNoLmFkZChnZW5pc2guYWRkKGdlbmlzaC5hZGQoZ2VuaXNoLmFkZChnZW5pc2guYWRkKGdlbmlzaC5hZGQoZ2VuaXNoLmFkZChiMC5vdXQsIGIwLm91dCksIGIwLm91dCksIGIwLm91dCksIGIwLm91dCksIGIwLm91dCksIGIwLm91dCksIGdlbmlzaC5tdWwod2hpdGUsIC41MzYyKSksIC4xMSk7XG5cbiAgYjYuaW4oZ2VuaXNoLm11bCh3aGl0ZSwgLjExNTkyNikpO1xuXG4gIHJldHVybiBvdXQ7XG59OyIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IFdhdmV0YWJsZSA9IGZ1bmN0aW9uKCBpbnB1dFByb3BzICkge1xuICAgIGNvbnN0IHdhdmV0YWJsZSA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgIGNvbnN0IHByb3BzICA9IE9iamVjdC5hc3NpZ24oe30sIEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgY29uc3Qgb3NjID0gZy53YXZldGFibGUoIGcuaW4oJ2ZyZXF1ZW5jeScpLCBwcm9wcyApXG4gICAgY29uc3QgZ3JhcGggPSBnLm11bCggXG4gICAgICBvc2MsIFxuICAgICAgZy5pbiggJ2dhaW4nIClcbiAgICApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggd2F2ZXRhYmxlLCBncmFwaCwgJ3dhdmV0YWJsZScsIHByb3BzIClcblxuICAgIHJldHVybiB3YXZldGFibGVcbiAgfVxuXG4gIGcud2F2ZXRhYmxlID0gZnVuY3Rpb24oIGZyZXF1ZW5jeSwgcHJvcHMgKSB7XG4gICAgbGV0IGRhdGFQcm9wcyA9IHsgaW1tdXRhYmxlOnRydWUgfVxuXG4gICAgLy8gdXNlIGdsb2JhbCByZWZlcmVuY2VzIGlmIGFwcGxpY2FibGVcbiAgICBpZiggcHJvcHMubmFtZSAhPT0gdW5kZWZpbmVkICkgZGF0YVByb3BzLmdsb2JhbCA9IHByb3BzLm5hbWVcblxuICAgIGNvbnN0IGJ1ZmZlciA9IGcuZGF0YSggcHJvcHMuYnVmZmVyLCAxLCBkYXRhUHJvcHMgKVxuXG4gICAgcmV0dXJuIGcucGVlayggYnVmZmVyLCBnLnBoYXNvciggZnJlcXVlbmN5LCAwLCB7IG1pbjowIH0gKSApXG4gIH1cblxuICByZXR1cm4gV2F2ZXRhYmxlXG59XG4iLCJjb25zdCBRdWV1ZSA9IHJlcXVpcmUoICcuLi9leHRlcm5hbC9wcmlvcml0eXF1ZXVlLmpzJyApXG5jb25zdCBCaWcgICA9IHJlcXVpcmUoICdiaWcuanMnIClcblxubGV0IFNjaGVkdWxlciA9IHtcbiAgcGhhc2U6IDAsXG5cbiAgcXVldWU6IG5ldyBRdWV1ZSggKCBhLCBiICkgPT4ge1xuICAgIGlmKCBhLnRpbWUgPT09IGIudGltZSApIHsgLy9hLnRpbWUuZXEoIGIudGltZSApICkge1xuICAgICAgcmV0dXJuIGIucHJpb3JpdHkgLSBhLnByaW9yaXR5XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gYS50aW1lIC0gYi50aW1lIC8vYS50aW1lLm1pbnVzKCBiLnRpbWUgKVxuICAgIH1cbiAgfSksXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5xdWV1ZS5kYXRhLmxlbmd0aCA9IDBcbiAgICB0aGlzLnF1ZXVlLmxlbmd0aCA9IDBcbiAgfSxcblxuICBhZGQoIHRpbWUsIGZ1bmMsIHByaW9yaXR5ID0gMCApIHtcbiAgICB0aW1lICs9IHRoaXMucGhhc2VcblxuICAgIHRoaXMucXVldWUucHVzaCh7IHRpbWUsIGZ1bmMsIHByaW9yaXR5IH0pXG4gIH0sXG5cbiAgdGljaygpIHtcbiAgICBpZiggdGhpcy5xdWV1ZS5sZW5ndGggKSB7XG4gICAgICBsZXQgbmV4dCA9IHRoaXMucXVldWUucGVlaygpXG5cbiAgICAgIHdoaWxlKCB0aGlzLnBoYXNlID49IG5leHQudGltZSApIHtcbiAgICAgICAgbmV4dC5mdW5jKClcbiAgICAgICAgdGhpcy5xdWV1ZS5wb3AoKVxuICAgICAgICBuZXh0ID0gdGhpcy5xdWV1ZS5wZWVrKClcbiAgICAgIH1cblxuICAgIH1cblxuICAgIHRoaXMucGhhc2UrK1xuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjaGVkdWxlclxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBjb25zdCBfX3Byb3RvX18gPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuICBPYmplY3QuYXNzaWduKCBfX3Byb3RvX18sIHtcbiAgICBzdGFydCgpIHtcbiAgICAgIHRoaXMuY29ubmVjdCgpXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG4gICAgc3RvcCgpIHtcbiAgICAgIHRoaXMuZGlzY29ubmVjdCgpXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgfSlcblxuICBjb25zdCBTZXEyID0geyBcbiAgICBjcmVhdGUoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBzZXEgPSBPYmplY3QuY3JlYXRlKCBfX3Byb3RvX18gKSxcbiAgICAgICAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgU2VxMi5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG5cbiAgICAgIHNlcS5waGFzZSA9IDBcbiAgICAgIHNlcS5pbnB1dE5hbWVzID0gWyAncmF0ZScgXVxuICAgICAgc2VxLmlucHV0cyA9IFsgMSBdXG4gICAgICBzZXEubmV4dFRpbWUgPSAwXG4gICAgICBzZXEudmFsdWVzUGhhc2UgPSAwXG4gICAgICBzZXEudGltaW5nc1BoYXNlID0gMFxuICAgICAgc2VxLmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHNlcS5kaXJ0eSA9IHRydWVcbiAgICAgIHNlcS50eXBlID0gJ3NlcSdcblxuICAgICAgaWYoIHByb3BzLnRhcmdldCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICBzZXEuYW5vbkZ1bmN0aW9uID0gdHJ1ZVxuICAgICAgfWVsc2V7IFxuICAgICAgICBzZXEuYW5vbkZ1bmN0aW9uID0gZmFsc2VcbiAgICAgICAgc2VxLmNhbGxGdW5jdGlvbiA9IHR5cGVvZiBwcm9wcy50YXJnZXRbIHByb3BzLmtleSBdID09PSAnZnVuY3Rpb24nXG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5hc3NpZ24oIHNlcSwgcHJvcHMgKVxuXG4gICAgICBzZXEuY2FsbGJhY2sgPSBmdW5jdGlvbiggcmF0ZSApIHtcbiAgICAgICAgaWYoIHNlcS5waGFzZSA+PSBzZXEubmV4dFRpbWUgKSB7XG4gICAgICAgICAgbGV0IHZhbHVlID0gc2VxLnZhbHVlc1sgc2VxLnZhbHVlc1BoYXNlKysgJSBzZXEudmFsdWVzLmxlbmd0aCBdXG5cbiAgICAgICAgICBpZiggc2VxLmFub25GdW5jdGlvbiB8fCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgKSB2YWx1ZSA9IHZhbHVlKClcbiAgICAgICAgICBcbiAgICAgICAgICBpZiggc2VxLmFub25GdW5jdGlvbiA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICBpZiggc2VxLmNhbGxGdW5jdGlvbiA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICAgIHNlcS50YXJnZXRbIHNlcS5rZXkgXSA9IHZhbHVlXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgc2VxLnRhcmdldFsgc2VxLmtleSBdKCB2YWx1ZSApIFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlcS5waGFzZSAtPSBzZXEubmV4dFRpbWVcblxuICAgICAgICAgIGxldCB0aW1pbmcgPSBzZXEudGltaW5nc1sgc2VxLnRpbWluZ3NQaGFzZSsrICUgc2VxLnRpbWluZ3MubGVuZ3RoIF1cbiAgICAgICAgICBpZiggdHlwZW9mIHRpbWluZyA9PT0gJ2Z1bmN0aW9uJyApIHRpbWluZyA9IHRpbWluZygpXG5cbiAgICAgICAgICBzZXEubmV4dFRpbWUgPSB0aW1pbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHNlcS5waGFzZSArPSByYXRlXG5cbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cblxuICAgICAgc2VxLnVnZW5OYW1lID0gc2VxLmNhbGxiYWNrLnVnZW5OYW1lID0gJ3NlcV8nICsgc2VxLmlkXG4gICAgICBcbiAgICAgIGxldCB2YWx1ZSA9IHNlcS5yYXRlXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHNlcSwgJ3JhdGUnLCB7XG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHZhbHVlIH0sXG4gICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICBpZiggdmFsdWUgIT09IHYgKSB7XG4gICAgICAgICAgICBHaWJiZXJpc2guZGlydHkoIHNlcSApXG4gICAgICAgICAgICB2YWx1ZSA9IHZcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBzZXFcbiAgICB9XG4gIH1cblxuICBTZXEyLmRlZmF1bHRzID0geyByYXRlOiAxIH1cblxuICByZXR1cm4gU2VxMi5jcmVhdGVcblxufVxuXG4iLCJjb25zdCBRdWV1ZSA9IHJlcXVpcmUoICcuLi9leHRlcm5hbC9wcmlvcml0eXF1ZXVlLmpzJyApXG5jb25zdCBCaWcgICA9IHJlcXVpcmUoICdiaWcuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG5sZXQgU2VxdWVuY2VyID0gcHJvcHMgPT4ge1xuICBsZXQgc2VxID0ge1xuICAgIF9faXNSdW5uaW5nOmZhbHNlLFxuICAgIGtleTogcHJvcHMua2V5LCBcbiAgICB0YXJnZXQ6ICBwcm9wcy50YXJnZXQsXG4gICAgdmFsdWVzOiAgcHJvcHMudmFsdWVzLFxuICAgIHRpbWluZ3M6IHByb3BzLnRpbWluZ3MsXG4gICAgX192YWx1ZXNQaGFzZTogIDAsXG4gICAgX190aW1pbmdzUGhhc2U6IDAsXG4gICAgcHJpb3JpdHk6IHByb3BzLnByaW9yaXR5ID09PSB1bmRlZmluZWQgPyAwIDogcHJvcHMucHJpb3JpdHksXG5cbiAgICB0aWNrKCkge1xuICAgICAgbGV0IHZhbHVlICA9IHNlcS52YWx1ZXNbICBzZXEuX192YWx1ZXNQaGFzZSsrICAlIHNlcS52YWx1ZXMubGVuZ3RoICBdLFxuICAgICAgICAgIHRpbWluZyA9IHNlcS50aW1pbmdzWyBzZXEuX190aW1pbmdzUGhhc2UrKyAlIHNlcS50aW1pbmdzLmxlbmd0aCBdXG5cbiAgICAgIGlmKCB0eXBlb2YgdGltaW5nID09PSAnZnVuY3Rpb24nICkgdGltaW5nID0gdGltaW5nKClcblxuICAgICAgaWYoIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBzZXEudGFyZ2V0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHZhbHVlKClcbiAgICAgIH1lbHNlIGlmKCB0eXBlb2Ygc2VxLnRhcmdldFsgc2VxLmtleSBdID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgICBpZiggdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICkgdmFsdWUgPSB2YWx1ZSgpXG4gICAgICAgIHNlcS50YXJnZXRbIHNlcS5rZXkgXSggdmFsdWUgKVxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgKSB2YWx1ZSA9IHZhbHVlKClcbiAgICAgICAgc2VxLnRhcmdldFsgc2VxLmtleSBdID0gdmFsdWVcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYoIHNlcS5fX2lzUnVubmluZyA9PT0gdHJ1ZSApIHtcbiAgICAgICAgR2liYmVyaXNoLnNjaGVkdWxlci5hZGQoIHRpbWluZywgc2VxLnRpY2ssIHNlcS5wcmlvcml0eSApXG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0YXJ0KCBkZWxheSA9IDAgKSB7XG4gICAgICBzZXEuX19pc1J1bm5pbmcgPSB0cnVlXG4gICAgICBHaWJiZXJpc2guc2NoZWR1bGVyLmFkZCggZGVsYXksIHNlcS50aWNrLCBzZXEucHJpb3JpdHkgKVxuICAgICAgcmV0dXJuIHNlcVxuICAgIH0sXG5cbiAgICBzdG9wKCkge1xuICAgICAgc2VxLl9faXNSdW5uaW5nID0gZmFsc2VcbiAgICAgIHJldHVybiBzZXFcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc2VxIFxufVxuXG5TZXF1ZW5jZXIubWFrZSA9IGZ1bmN0aW9uKCB2YWx1ZXMsIHRpbWluZ3MsIHRhcmdldCwga2V5ICkge1xuICByZXR1cm4gU2VxdWVuY2VyKHsgdmFsdWVzLCB0aW1pbmdzLCB0YXJnZXQsIGtleSB9KVxufVxuXG5yZXR1cm4gU2VxdWVuY2VyXG5cbn1cbiIsImxldCB1Z2VuID0ge1xuICBmcmVlKCkge1xuICAgIEdpYmJlcmlzaC5nZW5pc2guZ2VuLmZyZWUoIHRoaXMuZ3JhcGggKVxuICB9LFxuXG4gIHByaW50KCkge1xuICAgIGNvbnNvbGUubG9nKCB0aGlzLmNhbGxiYWNrLnRvU3RyaW5nKCkgKVxuICB9LFxuXG4gIGNvbm5lY3QoIHRhcmdldCwgbGV2ZWw9MSApIHtcbiAgICBpZiggdGhpcy5jb25uZWN0ZWQgPT09IHVuZGVmaW5lZCApIHRoaXMuY29ubmVjdGVkID0gW11cblxuICAgIGxldCBpbnB1dCA9IGxldmVsID09PSAxID8gdGhpcyA6IEdpYmJlcmlzaC5iaW5vcHMuTXVsKCB0aGlzLCBsZXZlbCApXG5cbiAgICBpZiggdGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsICkgdGFyZ2V0ID0gR2liYmVyaXNoLm91dHB1dCBcblxuICAgIGlmKCB0YXJnZXQuaW5wdXRzIClcbiAgICAgIHRhcmdldC5pbnB1dHMucHVzaCggaW5wdXQgKVxuICAgIGVsc2VcbiAgICAgIHRhcmdldC5pbnB1dCA9IGlucHV0XG5cbiAgICBHaWJiZXJpc2guZGlydHkoIHRhcmdldCApXG5cbiAgICB0aGlzLmNvbm5lY3RlZC5wdXNoKFsgdGFyZ2V0LCBpbnB1dCBdKVxuICAgIFxuICAgIHJldHVybiB0aGlzXG4gIH0sXG5cbiAgZGlzY29ubmVjdCggdGFyZ2V0ICkge1xuICAgIGlmKCB0YXJnZXQgPT09IHVuZGVmaW5lZCApe1xuICAgICAgZm9yKCBsZXQgY29ubmVjdGlvbiBvZiB0aGlzLmNvbm5lY3RlZCApIHtcbiAgICAgICAgY29ubmVjdGlvblswXS5kaXNjb25uZWN0VWdlbiggY29ubmVjdGlvblsxXSApXG4gICAgICB9XG4gICAgICB0aGlzLmNvbm5lY3RlZC5sZW5ndGggPSAwXG4gICAgfWVsc2V7XG4gICAgICBjb25zdCBjb25uZWN0aW9uID0gdGhpcy5jb25uZWN0ZWQuZmluZCggdiA9PiB2WzBdID09PSB0YXJnZXQgKVxuICAgICAgdGFyZ2V0LmRpc2Nvbm5lY3RVZ2VuKCBjb25uZWN0aW9uWzFdIClcbiAgICAgIGNvbnN0IHRhcmdldElkeCA9IHRoaXMuY29ubmVjdGVkLmluZGV4T2YoIGNvbm5lY3Rpb24gKVxuICAgICAgdGhpcy5jb25uZWN0ZWQuc3BsaWNlKCB0YXJnZXRJZHgsIDEgKVxuICAgIH1cbiAgfSxcblxuICBjaGFpbiggdGFyZ2V0LCBsZXZlbD0xICkge1xuICAgIHRoaXMuY29ubmVjdCggdGFyZ2V0LGxldmVsIClcblxuICAgIHJldHVybiB0YXJnZXRcbiAgfSxcblxuICBfX3JlZG9HcmFwaCgpIHtcbiAgICB0aGlzLl9fY3JlYXRlR3JhcGgoKVxuICAgIHRoaXMuY2FsbGJhY2sgPSBHaWJiZXJpc2guZ2VuaXNoLmdlbi5jcmVhdGVDYWxsYmFjayggdGhpcy5ncmFwaCwgR2liYmVyaXNoLm1lbW9yeSwgZmFsc2UsIHRydWUgKVxuICAgIHRoaXMuaW5wdXROYW1lcyA9IEdpYmJlcmlzaC5nZW5pc2guZ2VuLnBhcmFtZXRlcnMuc2xpY2UoMClcbiAgICB0aGlzLmNhbGxiYWNrLnVnZW5OYW1lID0gdGhpcy51Z2VuTmFtZVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHVnZW5cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgbGV0IHVpZCA9IDBcblxuICBsZXQgZmFjdG9yeSA9IGZ1bmN0aW9uKCB1Z2VuLCBncmFwaCwgbmFtZSwgdmFsdWVzLCBjYiApIHtcbiAgICB1Z2VuLmNhbGxiYWNrID0gY2IgPT09IHVuZGVmaW5lZCA/IEdpYmJlcmlzaC5nZW5pc2guZ2VuLmNyZWF0ZUNhbGxiYWNrKCBncmFwaCwgR2liYmVyaXNoLm1lbW9yeSwgZmFsc2UsIHRydWUgKSA6IGNiXG5cbiAgICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgICB0eXBlOiAndWdlbicsXG4gICAgICBpZDogZmFjdG9yeS5nZXRVSUQoKSwgXG4gICAgICB1Z2VuTmFtZTogbmFtZSArICdfJyxcbiAgICAgIGdyYXBoOiBncmFwaCxcbiAgICAgIGlucHV0TmFtZXM6IEdpYmJlcmlzaC5nZW5pc2guZ2VuLnBhcmFtZXRlcnMuc2xpY2UoMCksXG4gICAgICBpc1N0ZXJlbzogQXJyYXkuaXNBcnJheSggZ3JhcGggKSxcbiAgICAgIGRpcnR5OiB0cnVlXG4gICAgfSlcbiAgICBcbiAgICB1Z2VuLnVnZW5OYW1lICs9IHVnZW4uaWRcbiAgICB1Z2VuLmNhbGxiYWNrLnVnZW5OYW1lID0gdWdlbi51Z2VuTmFtZSAvLyBYWFggaGFja3lcblxuICAgIGZvciggbGV0IHBhcmFtIG9mIHVnZW4uaW5wdXROYW1lcyApIHtcbiAgICAgIGlmKCBwYXJhbSA9PT0gJ21lbW9yeScgKSBjb250aW51ZVxuXG4gICAgICBsZXQgdmFsdWUgPSB2YWx1ZXNbIHBhcmFtIF1cblxuICAgICAgLy8gVE9ETzogZG8gd2UgbmVlZCB0byBjaGVjayBmb3IgYSBzZXR0ZXI/XG4gICAgICBsZXQgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoIHVnZW4sIHBhcmFtICksXG4gICAgICAgICAgc2V0dGVyXG5cbiAgICAgIGlmKCBkZXNjICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHNldHRlciA9IGRlc2Muc2V0XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgcGFyYW0sIHtcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gdmFsdWUgfSxcbiAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgIGlmKCB2YWx1ZSAhPT0gdiApIHtcbiAgICAgICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdWdlbiApXG4gICAgICAgICAgICBpZiggc2V0dGVyICE9PSB1bmRlZmluZWQgKSBzZXR0ZXIoIHYgKVxuICAgICAgICAgICAgdmFsdWUgPSB2XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmKCB1Z2VuLl9fcmVxdWlyZXNSZWNvbXBpbGF0aW9uICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICB1Z2VuLl9fcmVxdWlyZXNSZWNvbXBpbGF0aW9uLmZvckVhY2goIHByb3AgPT4ge1xuICAgICAgICBsZXQgdmFsdWUgPSB1Z2VuWyBwcm9wIF1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCBwcm9wLCB7XG4gICAgICAgICAgZ2V0KCkgeyByZXR1cm4gdmFsdWUgfSxcbiAgICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgICBpZiggdmFsdWUgIT09IHYgKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gdlxuICAgICAgICAgICAgICB0aGlzLl9fcmVkb0dyYXBoKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9KSAgICAgIFxuICAgIH1cbiAgICByZXR1cm4gdWdlblxuICB9XG5cbiAgZmFjdG9yeS5nZXRVSUQgPSAoKSA9PiB1aWQrK1xuXG4gIHJldHVybiBmYWN0b3J5XG59XG4iLCJsZXQgZ2VuaXNoID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbmxldCB1dGlsaXRpZXMgPSB7XG4gIGNyZWF0ZUNvbnRleHQoKSB7XG4gICAgbGV0IEFDID0gdHlwZW9mIEF1ZGlvQ29udGV4dCA9PT0gJ3VuZGVmaW5lZCcgPyB3ZWJraXRBdWRpb0NvbnRleHQgOiBBdWRpb0NvbnRleHRcbiAgICBHaWJiZXJpc2guY3R4ID0gbmV3IEFDKClcbiAgICBnZW5pc2guZ2VuLnNhbXBsZXJhdGUgPSBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGVcbiAgICBnZW5pc2gudXRpbGl0aWVzLmN0eCA9IEdpYmJlcmlzaC5jdHhcblxuICAgIGxldCBzdGFydCA9ICgpID0+IHtcbiAgICAgIGlmKCB0eXBlb2YgQUMgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICBpZiggZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG5cbiAgICAgICAgICBpZiggJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICl7IC8vIHJlcXVpcmVkIHRvIHN0YXJ0IGF1ZGlvIHVuZGVyIGlPUyA2XG4gICAgICAgICAgICBsZXQgbXlTb3VyY2UgPSB1dGlsaXRpZXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICAgICAgICBteVNvdXJjZS5jb25uZWN0KCB1dGlsaXRpZXMuY3R4LmRlc3RpbmF0aW9uIClcbiAgICAgICAgICAgIG15U291cmNlLm5vdGVPbiggMCApXG4gICAgICAgICAgfVxuICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuICAgIH1cblxuICAgIHJldHVybiBHaWJiZXJpc2guY3R4XG4gIH0sXG5cbiAgY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCkge1xuICAgIEdpYmJlcmlzaC5ub2RlID0gR2liYmVyaXNoLmN0eC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoIDEwMjQsIDAsIDIgKSxcbiAgICBHaWJiZXJpc2guY2xlYXJGdW5jdGlvbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMCB9LFxuICAgIEdpYmJlcmlzaC5jYWxsYmFjayA9IEdpYmJlcmlzaC5jbGVhckZ1bmN0aW9uXG5cbiAgICBHaWJiZXJpc2gubm9kZS5vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uKCBhdWRpb1Byb2Nlc3NpbmdFdmVudCApIHtcbiAgICAgIGxldCBnaWJiZXJpc2ggPSBHaWJiZXJpc2gsXG4gICAgICAgICAgY2FsbGJhY2sgID0gZ2liYmVyaXNoLmNhbGxiYWNrLFxuICAgICAgICAgIG91dHB1dEJ1ZmZlciA9IGF1ZGlvUHJvY2Vzc2luZ0V2ZW50Lm91dHB1dEJ1ZmZlcixcbiAgICAgICAgICBzY2hlZHVsZXIgPSBHaWJiZXJpc2guc2NoZWR1bGVyLFxuICAgICAgICAgIC8vb2JqcyA9IGdpYmJlcmlzaC5jYWxsYmFja1VnZW5zLnNsaWNlKCAwICksXG4gICAgICAgICAgbGVuZ3RoXG5cbiAgICAgIGxldCBsZWZ0ID0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAwICksXG4gICAgICAgICAgcmlnaHQ9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMSApXG5cbiAgICAgIGxldCBjYWxsYmFja2xlbmd0aCA9IEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5sZW5ndGhcbiAgICAgIFxuICAgICAgaWYoIGNhbGxiYWNrbGVuZ3RoICE9PSAwICkge1xuICAgICAgICBmb3IoIGxldCBpPTA7IGk8IGNhbGxiYWNrbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzWyBpIF0oKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2FuJ3QganVzdCBzZXQgbGVuZ3RoIHRvIDAgYXMgY2FsbGJhY2tzIG1pZ2h0IGJlIGFkZGVkIGR1cmluZyBmb3IgbG9vcCwgc28gc3BsaWNlIHByZS1leGlzdGluZyBmdW5jdGlvbnNcbiAgICAgICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLnNwbGljZSggMCwgY2FsbGJhY2tsZW5ndGggKVxuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBzYW1wbGUgPSAwLCBsZW5ndGggPSBsZWZ0Lmxlbmd0aDsgc2FtcGxlIDwgbGVuZ3RoOyBzYW1wbGUrKykge1xuICAgICAgICBzY2hlZHVsZXIudGljaygpXG5cbiAgICAgICAgaWYoIGdpYmJlcmlzaC5ncmFwaElzRGlydHkgKSB7IFxuICAgICAgICAgIGNhbGxiYWNrID0gZ2liYmVyaXNoLmdlbmVyYXRlQ2FsbGJhY2soKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBYWFggY2FudCB1c2UgZGVzdHJ1Y3R1cmluZywgYmFiZWwgbWFrZXMgaXQgc29tZXRoaW5nIGluZWZmaWNpZW50Li4uXG4gICAgICAgIGxldCBvdXQgPSBjYWxsYmFjay5hcHBseSggbnVsbCwgZ2liYmVyaXNoLmNhbGxiYWNrVWdlbnMgKVxuXG4gICAgICAgIGxlZnRbIHNhbXBsZSAgXSA9IG91dFswXVxuICAgICAgICByaWdodFsgc2FtcGxlIF0gPSBvdXRbMV1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBHaWJiZXJpc2gubm9kZS5jb25uZWN0KCBHaWJiZXJpc2guY3R4LmRlc3RpbmF0aW9uIClcblxuICAgIHJldHVybiBHaWJiZXJpc2gubm9kZVxuICB9LCBcbn1cblxucmV0dXJuIHV0aWxpdGllc1xufVxuIiwiLyogYmlnLmpzIHYzLjEuMyBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWcuanMvTElDRU5DRSAqL1xyXG47KGZ1bmN0aW9uIChnbG9iYWwpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbi8qXHJcbiAgYmlnLmpzIHYzLjEuM1xyXG4gIEEgc21hbGwsIGZhc3QsIGVhc3ktdG8tdXNlIGxpYnJhcnkgZm9yIGFyYml0cmFyeS1wcmVjaXNpb24gZGVjaW1hbCBhcml0aG1ldGljLlxyXG4gIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZy5qcy9cclxuICBDb3B5cmlnaHQgKGMpIDIwMTQgTWljaGFlbCBNY2xhdWdobGluIDxNOGNoODhsQGdtYWlsLmNvbT5cclxuICBNSVQgRXhwYXQgTGljZW5jZVxyXG4qL1xyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqIEVESVRBQkxFIERFRkFVTFRTICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZXMgYmVsb3cgbXVzdCBiZSBpbnRlZ2VycyB3aXRoaW4gdGhlIHN0YXRlZCByYW5nZXMuXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBvZiB0aGUgcmVzdWx0cyBvZiBvcGVyYXRpb25zXHJcbiAgICAgKiBpbnZvbHZpbmcgZGl2aXNpb246IGRpdiBhbmQgc3FydCwgYW5kIHBvdyB3aXRoIG5lZ2F0aXZlIGV4cG9uZW50cy5cclxuICAgICAqL1xyXG4gICAgdmFyIERQID0gMjAsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byBNQVhfRFBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgcm91bmRpbmcgbW9kZSB1c2VkIHdoZW4gcm91bmRpbmcgdG8gdGhlIGFib3ZlIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogMCBUb3dhcmRzIHplcm8gKGkuZS4gdHJ1bmNhdGUsIG5vIHJvdW5kaW5nKS4gICAgICAgKFJPVU5EX0RPV04pXHJcbiAgICAgICAgICogMSBUbyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHJvdW5kIHVwLiAgKFJPVU5EX0hBTEZfVVApXHJcbiAgICAgICAgICogMiBUbyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHRvIGV2ZW4uICAgKFJPVU5EX0hBTEZfRVZFTilcclxuICAgICAgICAgKiAzIEF3YXkgZnJvbSB6ZXJvLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoUk9VTkRfVVApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUk0gPSAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwLCAxLCAyIG9yIDNcclxuXHJcbiAgICAgICAgLy8gVGhlIG1heGltdW0gdmFsdWUgb2YgRFAgYW5kIEJpZy5EUC5cclxuICAgICAgICBNQVhfRFAgPSAxRTYsICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gMTAwMDAwMFxyXG5cclxuICAgICAgICAvLyBUaGUgbWF4aW11bSBtYWduaXR1ZGUgb2YgdGhlIGV4cG9uZW50IGFyZ3VtZW50IHRvIHRoZSBwb3cgbWV0aG9kLlxyXG4gICAgICAgIE1BWF9QT1dFUiA9IDFFNiwgICAgICAgICAgICAgICAgICAgLy8gMSB0byAxMDAwMDAwXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBiZW5lYXRoIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKiBKYXZhU2NyaXB0J3MgTnVtYmVyIHR5cGU6IC03XHJcbiAgICAgICAgICogLTEwMDAwMDAgaXMgdGhlIG1pbmltdW0gcmVjb21tZW5kZWQgZXhwb25lbnQgdmFsdWUgb2YgYSBCaWcuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgRV9ORUcgPSAtNywgICAgICAgICAgICAgICAgICAgLy8gMCB0byAtMTAwMDAwMFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYWJvdmUgd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqIEphdmFTY3JpcHQncyBOdW1iZXIgdHlwZTogMjFcclxuICAgICAgICAgKiAxMDAwMDAwIGlzIHRoZSBtYXhpbXVtIHJlY29tbWVuZGVkIGV4cG9uZW50IHZhbHVlIG9mIGEgQmlnLlxyXG4gICAgICAgICAqIChUaGlzIGxpbWl0IGlzIG5vdCBlbmZvcmNlZCBvciBjaGVja2VkLilcclxuICAgICAgICAgKi9cclxuICAgICAgICBFX1BPUyA9IDIxLCAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDEwMDAwMDBcclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgICAgIC8vIFRoZSBzaGFyZWQgcHJvdG90eXBlIG9iamVjdC5cclxuICAgICAgICBQID0ge30sXHJcbiAgICAgICAgaXNWYWxpZCA9IC9eLT8oXFxkKyhcXC5cXGQqKT98XFwuXFxkKykoZVsrLV0/XFxkKyk/JC9pLFxyXG4gICAgICAgIEJpZztcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgQmlnIGNvbnN0cnVjdG9yLlxyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gYmlnRmFjdG9yeSgpIHtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgQmlnIGNvbnN0cnVjdG9yIGFuZCBleHBvcnRlZCBmdW5jdGlvbi5cclxuICAgICAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIG5ldyBpbnN0YW5jZSBvZiBhIEJpZyBudW1iZXIgb2JqZWN0LlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogbiB7bnVtYmVyfHN0cmluZ3xCaWd9IEEgbnVtZXJpYyB2YWx1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBCaWcobikge1xyXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICAvLyBFbmFibGUgY29uc3RydWN0b3IgdXNhZ2Ugd2l0aG91dCBuZXcuXHJcbiAgICAgICAgICAgIGlmICghKHggaW5zdGFuY2VvZiBCaWcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbiA9PT0gdm9pZCAwID8gYmlnRmFjdG9yeSgpIDogbmV3IEJpZyhuKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRHVwbGljYXRlLlxyXG4gICAgICAgICAgICBpZiAobiBpbnN0YW5jZW9mIEJpZykge1xyXG4gICAgICAgICAgICAgICAgeC5zID0gbi5zO1xyXG4gICAgICAgICAgICAgICAgeC5lID0gbi5lO1xyXG4gICAgICAgICAgICAgICAgeC5jID0gbi5jLnNsaWNlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZSh4LCBuKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogUmV0YWluIGEgcmVmZXJlbmNlIHRvIHRoaXMgQmlnIGNvbnN0cnVjdG9yLCBhbmQgc2hhZG93XHJcbiAgICAgICAgICAgICAqIEJpZy5wcm90b3R5cGUuY29uc3RydWN0b3Igd2hpY2ggcG9pbnRzIHRvIE9iamVjdC5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHguY29uc3RydWN0b3IgPSBCaWc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBCaWcucHJvdG90eXBlID0gUDtcclxuICAgICAgICBCaWcuRFAgPSBEUDtcclxuICAgICAgICBCaWcuUk0gPSBSTTtcclxuICAgICAgICBCaWcuRV9ORUcgPSBFX05FRztcclxuICAgICAgICBCaWcuRV9QT1MgPSBFX1BPUztcclxuXHJcbiAgICAgICAgcmV0dXJuIEJpZztcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUHJpdmF0ZSBmdW5jdGlvbnNcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIEJpZyB4IGluIG5vcm1hbCBvciBleHBvbmVudGlhbFxyXG4gICAgICogbm90YXRpb24gdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgb3Igc2lnbmlmaWNhbnQgZGlnaXRzLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gVGhlIEJpZyB0byBmb3JtYXQuXHJcbiAgICAgKiBkcCB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiB0b0Uge251bWJlcn0gMSAodG9FeHBvbmVudGlhbCksIDIgKHRvUHJlY2lzaW9uKSBvciB1bmRlZmluZWQgKHRvRml4ZWQpLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBmb3JtYXQoeCwgZHAsIHRvRSkge1xyXG4gICAgICAgIHZhciBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG5cclxuICAgICAgICAgICAgLy8gVGhlIGluZGV4IChub3JtYWwgbm90YXRpb24pIG9mIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBpID0gZHAgLSAoeCA9IG5ldyBCaWcoeCkpLmUsXHJcbiAgICAgICAgICAgIGMgPSB4LmM7XHJcblxyXG4gICAgICAgIC8vIFJvdW5kP1xyXG4gICAgICAgIGlmIChjLmxlbmd0aCA+ICsrZHApIHtcclxuICAgICAgICAgICAgcm5kKHgsIGksIEJpZy5STSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWNbMF0pIHtcclxuICAgICAgICAgICAgKytpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodG9FKSB7XHJcbiAgICAgICAgICAgIGkgPSBkcDtcclxuXHJcbiAgICAgICAgLy8gdG9GaXhlZFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGMgPSB4LmM7XHJcblxyXG4gICAgICAgICAgICAvLyBSZWNhbGN1bGF0ZSBpIGFzIHguZSBtYXkgaGF2ZSBjaGFuZ2VkIGlmIHZhbHVlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIGkgPSB4LmUgKyBpICsgMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGVuZCB6ZXJvcz9cclxuICAgICAgICBmb3IgKDsgYy5sZW5ndGggPCBpOyBjLnB1c2goMCkpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgaSA9IHguZTtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiB0b1ByZWNpc2lvbiByZXR1cm5zIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoZSBudW1iZXIgb2ZcclxuICAgICAgICAgKiBzaWduaWZpY2FudCBkaWdpdHMgc3BlY2lmaWVkIGlzIGxlc3MgdGhhbiB0aGUgbnVtYmVyIG9mIGRpZ2l0c1xyXG4gICAgICAgICAqIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGUgdmFsdWUgaW4gbm9ybWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcmV0dXJuIHRvRSA9PT0gMSB8fCB0b0UgJiYgKGRwIDw9IGkgfHwgaSA8PSBCaWcuRV9ORUcpID9cclxuXHJcbiAgICAgICAgICAvLyBFeHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICAgICh4LnMgPCAwICYmIGNbMF0gPyAnLScgOiAnJykgK1xyXG4gICAgICAgICAgICAoYy5sZW5ndGggPiAxID8gY1swXSArICcuJyArIGMuam9pbignJykuc2xpY2UoMSkgOiBjWzBdKSArXHJcbiAgICAgICAgICAgICAgKGkgPCAwID8gJ2UnIDogJ2UrJykgKyBpXHJcblxyXG4gICAgICAgICAgLy8gTm9ybWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgOiB4LnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBQYXJzZSB0aGUgbnVtYmVyIG9yIHN0cmluZyB2YWx1ZSBwYXNzZWQgdG8gYSBCaWcgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBBIEJpZyBudW1iZXIgaW5zdGFuY2UuXHJcbiAgICAgKiBuIHtudW1iZXJ8c3RyaW5nfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHBhcnNlKHgsIG4pIHtcclxuICAgICAgICB2YXIgZSwgaSwgbkw7XHJcblxyXG4gICAgICAgIC8vIE1pbnVzIHplcm8/XHJcbiAgICAgICAgaWYgKG4gPT09IDAgJiYgMSAvIG4gPCAwKSB7XHJcbiAgICAgICAgICAgIG4gPSAnLTAnO1xyXG5cclxuICAgICAgICAvLyBFbnN1cmUgbiBpcyBzdHJpbmcgYW5kIGNoZWNrIHZhbGlkaXR5LlxyXG4gICAgICAgIH0gZWxzZSBpZiAoIWlzVmFsaWQudGVzdChuICs9ICcnKSkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHNpZ24uXHJcbiAgICAgICAgeC5zID0gbi5jaGFyQXQoMCkgPT0gJy0nID8gKG4gPSBuLnNsaWNlKDEpLCAtMSkgOiAxO1xyXG5cclxuICAgICAgICAvLyBEZWNpbWFsIHBvaW50P1xyXG4gICAgICAgIGlmICgoZSA9IG4uaW5kZXhPZignLicpKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIG4gPSBuLnJlcGxhY2UoJy4nLCAnJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFeHBvbmVudGlhbCBmb3JtP1xyXG4gICAgICAgIGlmICgoaSA9IG4uc2VhcmNoKC9lL2kpKSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSBleHBvbmVudC5cclxuICAgICAgICAgICAgaWYgKGUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBlID0gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlICs9ICtuLnNsaWNlKGkgKyAxKTtcclxuICAgICAgICAgICAgbiA9IG4uc3Vic3RyaW5nKDAsIGkpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJbnRlZ2VyLlxyXG4gICAgICAgICAgICBlID0gbi5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGkgPSAwOyBuLmNoYXJBdChpKSA9PSAnMCc7IGkrKykge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGkgPT0gKG5MID0gbi5sZW5ndGgpKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICB4LmMgPSBbIHguZSA9IDAgXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKDsgbi5jaGFyQXQoLS1uTCkgPT0gJzAnOykge1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB4LmUgPSBlIC0gaSAtIDE7XHJcbiAgICAgICAgICAgIHguYyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29udmVydCBzdHJpbmcgdG8gYXJyYXkgb2YgZGlnaXRzIHdpdGhvdXQgbGVhZGluZy90cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yIChlID0gMDsgaSA8PSBuTDsgeC5jW2UrK10gPSArbi5jaGFyQXQoaSsrKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJvdW5kIEJpZyB4IHRvIGEgbWF4aW11bSBvZiBkcCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLlxyXG4gICAgICogQ2FsbGVkIGJ5IGRpdiwgc3FydCBhbmQgcm91bmQuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBUaGUgQmlnIHRvIHJvdW5kLlxyXG4gICAgICogZHAge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogcm0ge251bWJlcn0gMCwgMSwgMiBvciAzIChET1dOLCBIQUxGX1VQLCBIQUxGX0VWRU4sIFVQKVxyXG4gICAgICogW21vcmVdIHtib29sZWFufSBXaGV0aGVyIHRoZSByZXN1bHQgb2YgZGl2aXNpb24gd2FzIHRydW5jYXRlZC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcm5kKHgsIGRwLCBybSwgbW9yZSkge1xyXG4gICAgICAgIHZhciB1LFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgaSA9IHguZSArIGRwICsgMTtcclxuXHJcbiAgICAgICAgaWYgKHJtID09PSAxKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB4Y1tpXSBpcyB0aGUgZGlnaXQgYWZ0ZXIgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIG1vcmUgPSB4Y1tpXSA+PSA1O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm0gPT09IDIpIHtcclxuICAgICAgICAgICAgbW9yZSA9IHhjW2ldID4gNSB8fCB4Y1tpXSA9PSA1ICYmXHJcbiAgICAgICAgICAgICAgKG1vcmUgfHwgaSA8IDAgfHwgeGNbaSArIDFdICE9PSB1IHx8IHhjW2kgLSAxXSAmIDEpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm0gPT09IDMpIHtcclxuICAgICAgICAgICAgbW9yZSA9IG1vcmUgfHwgeGNbaV0gIT09IHUgfHwgaSA8IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbW9yZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJtICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycignIUJpZy5STSEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGkgPCAxIHx8ICF4Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKG1vcmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAxLCAwLjEsIDAuMDEsIDAuMDAxLCAwLjAwMDEgZXRjLlxyXG4gICAgICAgICAgICAgICAgeC5lID0gLWRwO1xyXG4gICAgICAgICAgICAgICAgeC5jID0gWzFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgICAgICB4LmMgPSBbeC5lID0gMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGFueSBkaWdpdHMgYWZ0ZXIgdGhlIHJlcXVpcmVkIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAgICB4Yy5sZW5ndGggPSBpLS07XHJcblxyXG4gICAgICAgICAgICAvLyBSb3VuZCB1cD9cclxuICAgICAgICAgICAgaWYgKG1vcmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSb3VuZGluZyB1cCBtYXkgbWVhbiB0aGUgcHJldmlvdXMgZGlnaXQgaGFzIHRvIGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgICAgICBmb3IgKDsgKyt4Y1tpXSA+IDk7KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeGNbaV0gPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWktLSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArK3guZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGMudW5zaGlmdCgxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yIChpID0geGMubGVuZ3RoOyAheGNbLS1pXTsgeGMucG9wKCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaHJvdyBhIEJpZ0Vycm9yLlxyXG4gICAgICpcclxuICAgICAqIG1lc3NhZ2Uge3N0cmluZ30gVGhlIGVycm9yIG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHRocm93RXJyKG1lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgICAgIGVyci5uYW1lID0gJ0JpZ0Vycm9yJztcclxuXHJcbiAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBQcm90b3R5cGUvaW5zdGFuY2UgbWV0aG9kc1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBCaWcuXHJcbiAgICAgKi9cclxuICAgIFAuYWJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB4ID0gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcyk7XHJcbiAgICAgICAgeC5zID0gMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuXHJcbiAgICAgKiAxIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogLTEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksIG9yXHJcbiAgICAgKiAwIGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSB2YWx1ZS5cclxuICAgICovXHJcbiAgICBQLmNtcCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHhOZWcsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSAoeSA9IG5ldyB4LmNvbnN0cnVjdG9yKHkpKS5jLFxyXG4gICAgICAgICAgICBpID0geC5zLFxyXG4gICAgICAgICAgICBqID0geS5zLFxyXG4gICAgICAgICAgICBrID0geC5lLFxyXG4gICAgICAgICAgICBsID0geS5lO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gIXhjWzBdID8gIXljWzBdID8gMCA6IC1qIDogaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoaSAhPSBqKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4TmVnID0gaSA8IDA7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmIChrICE9IGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGsgPiBsIF4geE5lZyA/IDEgOiAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSAtMTtcclxuICAgICAgICBqID0gKGsgPSB4Yy5sZW5ndGgpIDwgKGwgPSB5Yy5sZW5ndGgpID8gayA6IGw7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgZm9yICg7ICsraSA8IGo7KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoeGNbaV0gIT0geWNbaV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4Y1tpXSA+IHljW2ldIF4geE5lZyA/IDEgOiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBsZW5ndGhzLlxyXG4gICAgICAgIHJldHVybiBrID09IGwgPyAwIDogayA+IGwgXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGRpdmlkZWQgYnkgdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeSwgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWxcclxuICAgICAqIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqL1xyXG4gICAgUC5kaXYgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgLy8gZGl2aWRlbmRcclxuICAgICAgICAgICAgZHZkID0geC5jLFxyXG4gICAgICAgICAgICAvL2Rpdmlzb3JcclxuICAgICAgICAgICAgZHZzID0gKHkgPSBuZXcgQmlnKHkpKS5jLFxyXG4gICAgICAgICAgICBzID0geC5zID09IHkucyA/IDEgOiAtMSxcclxuICAgICAgICAgICAgZHAgPSBCaWcuRFA7XHJcblxyXG4gICAgICAgIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFCaWcuRFAhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFaXRoZXIgMD9cclxuICAgICAgICBpZiAoIWR2ZFswXSB8fCAhZHZzWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBib3RoIGFyZSAwLCB0aHJvdyBOYU5cclxuICAgICAgICAgICAgaWYgKGR2ZFswXSA9PSBkdnNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGR2cyBpcyAwLCB0aHJvdyArLUluZmluaXR5LlxyXG4gICAgICAgICAgICBpZiAoIWR2c1swXSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIocyAvIDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBkdmQgaXMgMCwgcmV0dXJuICstMC5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcocyAqIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGR2c0wsIGR2c1QsIG5leHQsIGNtcCwgcmVtSSwgdSxcclxuICAgICAgICAgICAgZHZzWiA9IGR2cy5zbGljZSgpLFxyXG4gICAgICAgICAgICBkdmRJID0gZHZzTCA9IGR2cy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGR2ZEwgPSBkdmQubGVuZ3RoLFxyXG4gICAgICAgICAgICAvLyByZW1haW5kZXJcclxuICAgICAgICAgICAgcmVtID0gZHZkLnNsaWNlKDAsIGR2c0wpLFxyXG4gICAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aCxcclxuICAgICAgICAgICAgLy8gcXVvdGllbnRcclxuICAgICAgICAgICAgcSA9IHksXHJcbiAgICAgICAgICAgIHFjID0gcS5jID0gW10sXHJcbiAgICAgICAgICAgIHFpID0gMCxcclxuICAgICAgICAgICAgZGlnaXRzID0gZHAgKyAocS5lID0geC5lIC0geS5lKSArIDE7XHJcblxyXG4gICAgICAgIHEucyA9IHM7XHJcbiAgICAgICAgcyA9IGRpZ2l0cyA8IDAgPyAwIDogZGlnaXRzO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdmVyc2lvbiBvZiBkaXZpc29yIHdpdGggbGVhZGluZyB6ZXJvLlxyXG4gICAgICAgIGR2c1oudW5zaGlmdCgwKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHplcm9zIHRvIG1ha2UgcmVtYWluZGVyIGFzIGxvbmcgYXMgZGl2aXNvci5cclxuICAgICAgICBmb3IgKDsgcmVtTCsrIDwgZHZzTDsgcmVtLnB1c2goMCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRvIHtcclxuXHJcbiAgICAgICAgICAgIC8vICduZXh0JyBpcyBob3cgbWFueSB0aW1lcyB0aGUgZGl2aXNvciBnb2VzIGludG8gY3VycmVudCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGZvciAobmV4dCA9IDA7IG5leHQgPCAxMDsgbmV4dCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29tcGFyZSBkaXZpc29yIGFuZCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoZHZzTCAhPSAocmVtTCA9IHJlbS5sZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY21wID0gZHZzTCA+IHJlbUwgPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHJlbUkgPSAtMSwgY21wID0gMDsgKytyZW1JIDwgZHZzTDspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkdnNbcmVtSV0gIT0gcmVtW3JlbUldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbXAgPSBkdnNbcmVtSV0gPiByZW1bcmVtSV0gPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBkaXZpc29yIDwgcmVtYWluZGVyLCBzdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGNtcCA8IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtYWluZGVyIGNhbid0IGJlIG1vcmUgdGhhbiAxIGRpZ2l0IGxvbmdlciB0aGFuIGRpdmlzb3IuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXF1YWxpc2UgbGVuZ3RocyB1c2luZyBkaXZpc29yIHdpdGggZXh0cmEgbGVhZGluZyB6ZXJvP1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoZHZzVCA9IHJlbUwgPT0gZHZzTCA/IGR2cyA6IGR2c1o7IHJlbUw7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtWy0tcmVtTF0gPCBkdnNUW3JlbUxdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1JID0gcmVtTDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKDsgcmVtSSAmJiAhcmVtWy0tcmVtSV07IHJlbVtyZW1JXSA9IDkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0tcmVtW3JlbUldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtW3JlbUxdICs9IDEwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbVtyZW1MXSAtPSBkdnNUW3JlbUxdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgIXJlbVswXTsgcmVtLnNoaWZ0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgdGhlICduZXh0JyBkaWdpdCB0byB0aGUgcmVzdWx0IGFycmF5LlxyXG4gICAgICAgICAgICBxY1txaSsrXSA9IGNtcCA/IG5leHQgOiArK25leHQ7XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgaWYgKHJlbVswXSAmJiBjbXApIHtcclxuICAgICAgICAgICAgICAgIHJlbVtyZW1MXSA9IGR2ZFtkdmRJXSB8fCAwO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVtID0gWyBkdmRbZHZkSV0gXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IHdoaWxlICgoZHZkSSsrIDwgZHZkTCB8fCByZW1bMF0gIT09IHUpICYmIHMtLSk7XHJcblxyXG4gICAgICAgIC8vIExlYWRpbmcgemVybz8gRG8gbm90IHJlbW92ZSBpZiByZXN1bHQgaXMgc2ltcGx5IHplcm8gKHFpID09IDEpLlxyXG4gICAgICAgIGlmICghcWNbMF0gJiYgcWkgIT0gMSkge1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlcmUgY2FuJ3QgYmUgbW9yZSB0aGFuIG9uZSB6ZXJvLlxyXG4gICAgICAgICAgICBxYy5zaGlmdCgpO1xyXG4gICAgICAgICAgICBxLmUtLTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJvdW5kP1xyXG4gICAgICAgIGlmIChxaSA+IGRpZ2l0cykge1xyXG4gICAgICAgICAgICBybmQocSwgZHAsIEJpZy5STSwgcmVtWzBdICE9PSB1KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBxO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBlcXVhbCB0byB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5lcSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmNtcCh5KTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmd0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZ3RlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAtMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmx0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPCAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAubHRlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBtaW51cyB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLnN1YiA9IFAubWludXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciBpLCBqLCB0LCB4TFR5LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgIHJldHVybiB4LnBsdXMoeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgeGMgPSB4LmMuc2xpY2UoKSxcclxuICAgICAgICAgICAgeGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHljID0geS5jLFxyXG4gICAgICAgICAgICB5ZSA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHkgaXMgbm9uLXplcm8/IHggaXMgbm9uLXplcm8/IE9yIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgIHJldHVybiB5Y1swXSA/ICh5LnMgPSAtYiwgeSkgOiBuZXcgQmlnKHhjWzBdID8geCA6IDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIGlzIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhMVHkgPSBhIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIGZvciAoYiA9IGE7IGItLTsgdC5wdXNoKDApKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEV4cG9uZW50cyBlcXVhbC4gQ2hlY2sgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgICAgIGogPSAoKHhMVHkgPSB4Yy5sZW5ndGggPCB5Yy5sZW5ndGgpID8geGMgOiB5YykubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yIChhID0gYiA9IDA7IGIgPCBqOyBiKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoeGNbYl0gIT0geWNbYl0pIHtcclxuICAgICAgICAgICAgICAgICAgICB4TFR5ID0geGNbYl0gPCB5Y1tiXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8geCA8IHk/IFBvaW50IHhjIHRvIHRoZSBhcnJheSBvZiB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICBpZiAoeExUeSkge1xyXG4gICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIHhjID0geWM7XHJcbiAgICAgICAgICAgIHljID0gdDtcclxuICAgICAgICAgICAgeS5zID0gLXkucztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogQXBwZW5kIHplcm9zIHRvIHhjIGlmIHNob3J0ZXIuIE5vIG5lZWQgdG8gYWRkIHplcm9zIHRvIHljIGlmIHNob3J0ZXJcclxuICAgICAgICAgKiBhcyBzdWJ0cmFjdGlvbiBvbmx5IG5lZWRzIHRvIHN0YXJ0IGF0IHljLmxlbmd0aC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpZiAoKCBiID0gKGogPSB5Yy5sZW5ndGgpIC0gKGkgPSB4Yy5sZW5ndGgpICkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKDsgYi0tOyB4Y1tpKytdID0gMCkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTdWJ0cmFjdCB5YyBmcm9tIHhjLlxyXG4gICAgICAgIGZvciAoYiA9IGk7IGogPiBhOyl7XHJcblxyXG4gICAgICAgICAgICBpZiAoeGNbLS1qXSA8IHljW2pdKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gajsgaSAmJiAheGNbLS1pXTsgeGNbaV0gPSA5KSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAtLXhjW2ldO1xyXG4gICAgICAgICAgICAgICAgeGNbal0gKz0gMTA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeGNbal0gLT0geWNbal07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yICg7IHhjWy0tYl0gPT09IDA7IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgICAgIGZvciAoOyB4Y1swXSA9PT0gMDspIHtcclxuICAgICAgICAgICAgeGMuc2hpZnQoKTtcclxuICAgICAgICAgICAgLS15ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIG4gLSBuID0gKzBcclxuICAgICAgICAgICAgeS5zID0gMTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlc3VsdCBtdXN0IGJlIHplcm8uXHJcbiAgICAgICAgICAgIHhjID0gW3llID0gMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB5LmMgPSB4YztcclxuICAgICAgICB5LmUgPSB5ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgbW9kdWxvIHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAubW9kID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeUdUeCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIGlmICgheS5jWzBdKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB4LnMgPSB5LnMgPSAxO1xyXG4gICAgICAgIHlHVHggPSB5LmNtcCh4KSA9PSAxO1xyXG4gICAgICAgIHgucyA9IGE7XHJcbiAgICAgICAgeS5zID0gYjtcclxuXHJcbiAgICAgICAgaWYgKHlHVHgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhID0gQmlnLkRQO1xyXG4gICAgICAgIGIgPSBCaWcuUk07XHJcbiAgICAgICAgQmlnLkRQID0gQmlnLlJNID0gMDtcclxuICAgICAgICB4ID0geC5kaXYoeSk7XHJcbiAgICAgICAgQmlnLkRQID0gYTtcclxuICAgICAgICBCaWcuUk0gPSBiO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5taW51cyggeC50aW1lcyh5KSApO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHBsdXMgdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5hZGQgPSBQLnBsdXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB0LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgIHJldHVybiB4Lm1pbnVzKHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHhlID0geC5lLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWUgPSB5LmUsXHJcbiAgICAgICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8geSBpcyBub24temVybz8geCBpcyBub24temVybz8gT3IgYm90aCBhcmUgemVyby5cclxuICAgICAgICAgICAgcmV0dXJuIHljWzBdID8geSA6IG5ldyBCaWcoeGNbMF0gPyB4IDogYSAqIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4YyA9IHhjLnNsaWNlKCk7XHJcblxyXG4gICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgIC8vIE5vdGU6IEZhc3RlciB0byB1c2UgcmV2ZXJzZSB0aGVuIGRvIHVuc2hpZnRzLlxyXG4gICAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGEgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB5ZSA9IHhlO1xyXG4gICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgZm9yICg7IGEtLTsgdC5wdXNoKDApKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBQb2ludCB4YyB0byB0aGUgbG9uZ2VyIGFycmF5LlxyXG4gICAgICAgIGlmICh4Yy5sZW5ndGggLSB5Yy5sZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgeWMgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBhID0geWMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIE9ubHkgc3RhcnQgYWRkaW5nIGF0IHljLmxlbmd0aCAtIDEgYXMgdGhlIGZ1cnRoZXIgZGlnaXRzIG9mIHhjIGNhbiBiZVxyXG4gICAgICAgICAqIGxlZnQgYXMgdGhleSBhcmUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9yIChiID0gMDsgYTspIHtcclxuICAgICAgICAgICAgYiA9ICh4Y1stLWFdID0geGNbYV0gKyB5Y1thXSArIGIpIC8gMTAgfCAwO1xyXG4gICAgICAgICAgICB4Y1thXSAlPSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5vIG5lZWQgdG8gY2hlY2sgZm9yIHplcm8sIGFzICt4ICsgK3kgIT0gMCAmJiAteCArIC15ICE9IDBcclxuXHJcbiAgICAgICAgaWYgKGIpIHtcclxuICAgICAgICAgICAgeGMudW5zaGlmdChiKTtcclxuICAgICAgICAgICAgKyt5ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChhID0geGMubGVuZ3RoOyB4Y1stLWFdID09PSAwOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeS5jID0geGM7XHJcbiAgICAgICAgeS5lID0geWU7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcmFpc2VkIHRvIHRoZSBwb3dlciBuLlxyXG4gICAgICogSWYgbiBpcyBuZWdhdGl2ZSwgcm91bmQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsXHJcbiAgICAgKiBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogbiB7bnVtYmVyfSBJbnRlZ2VyLCAtTUFYX1BPV0VSIHRvIE1BWF9QT1dFUiBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAucG93ID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIG9uZSA9IG5ldyB4LmNvbnN0cnVjdG9yKDEpLFxyXG4gICAgICAgICAgICB5ID0gb25lLFxyXG4gICAgICAgICAgICBpc05lZyA9IG4gPCAwO1xyXG5cclxuICAgICAgICBpZiAobiAhPT0gfn5uIHx8IG4gPCAtTUFYX1BPV0VSIHx8IG4gPiBNQVhfUE9XRVIpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFwb3chJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuID0gaXNOZWcgPyAtbiA6IG47XHJcblxyXG4gICAgICAgIGZvciAoOzspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChuICYgMSkge1xyXG4gICAgICAgICAgICAgICAgeSA9IHkudGltZXMoeCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbiA+Pj0gMTtcclxuXHJcbiAgICAgICAgICAgIGlmICghbikge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeCA9IHgudGltZXMoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaXNOZWcgPyBvbmUuZGl2KHkpIDogeTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIGFcclxuICAgICAqIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS5cclxuICAgICAqIElmIGRwIGlzIG5vdCBzcGVjaWZpZWQsIHJvdW5kIHRvIDAgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgKiBJZiBybSBpcyBub3Qgc3BlY2lmaWVkLCB1c2UgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogW3JtXSAwLCAxLCAyIG9yIDMgKFJPVU5EX0RPV04sIFJPVU5EX0hBTEZfVVAsIFJPVU5EX0hBTEZfRVZFTiwgUk9VTkRfVVApXHJcbiAgICAgKi9cclxuICAgIFAucm91bmQgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBkcCA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFyb3VuZCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcm5kKHggPSBuZXcgQmlnKHgpLCBkcCwgcm0gPT0gbnVsbCA/IEJpZy5STSA6IHJtKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhlIHZhbHVlIG9mIHRoaXMgQmlnLFxyXG4gICAgICogcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWwgcGxhY2VzIHVzaW5nXHJcbiAgICAgKiByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqL1xyXG4gICAgUC5zcXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlc3RpbWF0ZSwgciwgYXBwcm94LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIGkgPSB4LnMsXHJcbiAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgIGhhbGYgPSBuZXcgQmlnKCcwLjUnKTtcclxuXHJcbiAgICAgICAgLy8gWmVybz9cclxuICAgICAgICBpZiAoIXhjWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgbmVnYXRpdmUsIHRocm93IE5hTi5cclxuICAgICAgICBpZiAoaSA8IDApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEVzdGltYXRlLlxyXG4gICAgICAgIGkgPSBNYXRoLnNxcnQoeC50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgLy8gTWF0aC5zcXJ0IHVuZGVyZmxvdy9vdmVyZmxvdz9cclxuICAgICAgICAvLyBQYXNzIHggdG8gTWF0aC5zcXJ0IGFzIGludGVnZXIsIHRoZW4gYWRqdXN0IHRoZSByZXN1bHQgZXhwb25lbnQuXHJcbiAgICAgICAgaWYgKGkgPT09IDAgfHwgaSA9PT0gMSAvIDApIHtcclxuICAgICAgICAgICAgZXN0aW1hdGUgPSB4Yy5qb2luKCcnKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghKGVzdGltYXRlLmxlbmd0aCArIGUgJiAxKSkge1xyXG4gICAgICAgICAgICAgICAgZXN0aW1hdGUgKz0gJzAnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByID0gbmV3IEJpZyggTWF0aC5zcXJ0KGVzdGltYXRlKS50b1N0cmluZygpICk7XHJcbiAgICAgICAgICAgIHIuZSA9ICgoZSArIDEpIC8gMiB8IDApIC0gKGUgPCAwIHx8IGUgJiAxKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByID0gbmV3IEJpZyhpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSA9IHIuZSArIChCaWcuRFAgKz0gNCk7XHJcblxyXG4gICAgICAgIC8vIE5ld3Rvbi1SYXBoc29uIGl0ZXJhdGlvbi5cclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGFwcHJveCA9IHI7XHJcbiAgICAgICAgICAgIHIgPSBoYWxmLnRpbWVzKCBhcHByb3gucGx1cyggeC5kaXYoYXBwcm94KSApICk7XHJcbiAgICAgICAgfSB3aGlsZSAoIGFwcHJveC5jLnNsaWNlKDAsIGkpLmpvaW4oJycpICE9PVxyXG4gICAgICAgICAgICAgICAgICAgICAgIHIuYy5zbGljZSgwLCBpKS5qb2luKCcnKSApO1xyXG5cclxuICAgICAgICBybmQociwgQmlnLkRQIC09IDQsIEJpZy5STSk7XHJcblxyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHRpbWVzIHRoZSB2YWx1ZSBvZlxyXG4gICAgICogQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAubXVsID0gUC50aW1lcyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIGMsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSAoeSA9IG5ldyBCaWcoeSkpLmMsXHJcbiAgICAgICAgICAgIGEgPSB4Yy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGIgPSB5Yy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGkgPSB4LmUsXHJcbiAgICAgICAgICAgIGogPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBzaWduIG9mIHJlc3VsdC5cclxuICAgICAgICB5LnMgPSB4LnMgPT0geS5zID8gMSA6IC0xO1xyXG5cclxuICAgICAgICAvLyBSZXR1cm4gc2lnbmVkIDAgaWYgZWl0aGVyIDAuXHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeS5zICogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXNlIGV4cG9uZW50IG9mIHJlc3VsdCBhcyB4LmUgKyB5LmUuXHJcbiAgICAgICAgeS5lID0gaSArIGo7XHJcblxyXG4gICAgICAgIC8vIElmIGFycmF5IHhjIGhhcyBmZXdlciBkaWdpdHMgdGhhbiB5Yywgc3dhcCB4YyBhbmQgeWMsIGFuZCBsZW5ndGhzLlxyXG4gICAgICAgIGlmIChhIDwgYikge1xyXG4gICAgICAgICAgICBjID0geGM7XHJcbiAgICAgICAgICAgIHhjID0geWM7XHJcbiAgICAgICAgICAgIHljID0gYztcclxuICAgICAgICAgICAgaiA9IGE7XHJcbiAgICAgICAgICAgIGEgPSBiO1xyXG4gICAgICAgICAgICBiID0gajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpc2UgY29lZmZpY2llbnQgYXJyYXkgb2YgcmVzdWx0IHdpdGggemVyb3MuXHJcbiAgICAgICAgZm9yIChjID0gbmV3IEFycmF5KGogPSBhICsgYik7IGotLTsgY1tqXSA9IDApIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE11bHRpcGx5LlxyXG5cclxuICAgICAgICAvLyBpIGlzIGluaXRpYWxseSB4Yy5sZW5ndGguXHJcbiAgICAgICAgZm9yIChpID0gYjsgaS0tOykge1xyXG4gICAgICAgICAgICBiID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIGEgaXMgeWMubGVuZ3RoLlxyXG4gICAgICAgICAgICBmb3IgKGogPSBhICsgaTsgaiA+IGk7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3VycmVudCBzdW0gb2YgcHJvZHVjdHMgYXQgdGhpcyBkaWdpdCBwb3NpdGlvbiwgcGx1cyBjYXJyeS5cclxuICAgICAgICAgICAgICAgIGIgPSBjW2pdICsgeWNbaV0gKiB4Y1tqIC0gaSAtIDFdICsgYjtcclxuICAgICAgICAgICAgICAgIGNbai0tXSA9IGIgJSAxMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjYXJyeVxyXG4gICAgICAgICAgICAgICAgYiA9IGIgLyAxMCB8IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY1tqXSA9IChjW2pdICsgYikgJSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluY3JlbWVudCByZXN1bHQgZXhwb25lbnQgaWYgdGhlcmUgaXMgYSBmaW5hbCBjYXJyeS5cclxuICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICArK3kuZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBhbnkgbGVhZGluZyB6ZXJvLlxyXG4gICAgICAgIGlmICghY1swXSkge1xyXG4gICAgICAgICAgICBjLnNoaWZ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChpID0gYy5sZW5ndGg7ICFjWy0taV07IGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgeS5jID0gYztcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcuXHJcbiAgICAgKiBSZXR1cm4gZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhpcyBCaWcgaGFzIGEgcG9zaXRpdmUgZXhwb25lbnQgZXF1YWwgdG9cclxuICAgICAqIG9yIGdyZWF0ZXIgdGhhbiBCaWcuRV9QT1MsIG9yIGEgbmVnYXRpdmUgZXhwb25lbnQgZXF1YWwgdG8gb3IgbGVzcyB0aGFuXHJcbiAgICAgKiBCaWcuRV9ORUcuXHJcbiAgICAgKi9cclxuICAgIFAudG9TdHJpbmcgPSBQLnZhbHVlT2YgPSBQLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHN0ciA9IHguYy5qb2luKCcnKSxcclxuICAgICAgICAgICAgc3RyTCA9IHN0ci5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uP1xyXG4gICAgICAgIGlmIChlIDw9IEJpZy5FX05FRyB8fCBlID49IEJpZy5FX1BPUykge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgKHN0ckwgPiAxID8gJy4nICsgc3RyLnNsaWNlKDEpIDogJycpICtcclxuICAgICAgICAgICAgICAoZSA8IDAgPyAnZScgOiAnZSsnKSArIGU7XHJcblxyXG4gICAgICAgIC8vIE5lZ2F0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBlbmQgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoOyArK2U7IHN0ciA9ICcwJyArIHN0cikge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0ciA9ICcwLicgKyBzdHI7XHJcblxyXG4gICAgICAgIC8vIFBvc2l0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGlmICgrK2UgPiBzdHJMKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQXBwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgZm9yIChlIC09IHN0ckw7IGUtLSA7IHN0ciArPSAnMCcpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlIDwgc3RyTCkge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnNsaWNlKDAsIGUpICsgJy4nICsgc3RyLnNsaWNlKGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50IHplcm8uXHJcbiAgICAgICAgfSBlbHNlIGlmIChzdHJMID4gMSkge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgJy4nICsgc3RyLnNsaWNlKDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXZvaWQgJy0wJ1xyXG4gICAgICAgIHJldHVybiB4LnMgPCAwICYmIHguY1swXSA/ICctJyArIHN0ciA6IHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKiBJZiB0b0V4cG9uZW50aWFsLCB0b0ZpeGVkLCB0b1ByZWNpc2lvbiBhbmQgZm9ybWF0IGFyZSBub3QgcmVxdWlyZWQgdGhleVxyXG4gICAgICogY2FuIHNhZmVseSBiZSBjb21tZW50ZWQtb3V0IG9yIGRlbGV0ZWQuIE5vIHJlZHVuZGFudCBjb2RlIHdpbGwgYmUgbGVmdC5cclxuICAgICAqIGZvcm1hdCBpcyB1c2VkIG9ubHkgYnkgdG9FeHBvbmVudGlhbCwgdG9GaXhlZCBhbmQgdG9QcmVjaXNpb24uXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGluIGV4cG9uZW50aWFsXHJcbiAgICAgKiBub3RhdGlvbiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB1c2luZ1xyXG4gICAgICogQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvRXhwb25lbnRpYWwgPSBmdW5jdGlvbiAoZHApIHtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgZHAgPSB0aGlzLmMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvRXhwIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBkcCwgMSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaW4gbm9ybWFsIG5vdGF0aW9uXHJcbiAgICAgKiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB1c2luZyBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9GaXhlZCA9IGZ1bmN0aW9uIChkcCkge1xyXG4gICAgICAgIHZhciBzdHIsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBuZWcgPSBCaWcuRV9ORUcsXHJcbiAgICAgICAgICAgIHBvcyA9IEJpZy5FX1BPUztcclxuXHJcbiAgICAgICAgLy8gUHJldmVudCB0aGUgcG9zc2liaWxpdHkgb2YgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgQmlnLkVfTkVHID0gLShCaWcuRV9QT1MgPSAxIC8gMCk7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHgudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwID09PSB+fmRwICYmIGRwID49IDAgJiYgZHAgPD0gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IGZvcm1hdCh4LCB4LmUgKyBkcCk7XHJcblxyXG4gICAgICAgICAgICAvLyAoLTApLnRvRml4ZWQoKSBpcyAnMCcsIGJ1dCAoLTAuMSkudG9GaXhlZCgpIGlzICctMCcuXHJcbiAgICAgICAgICAgIC8vICgtMCkudG9GaXhlZCgxKSBpcyAnMC4wJywgYnV0ICgtMC4wMSkudG9GaXhlZCgxKSBpcyAnLTAuMCcuXHJcbiAgICAgICAgICAgIGlmICh4LnMgPCAwICYmIHguY1swXSAmJiBzdHIuaW5kZXhPZignLScpIDwgMCkge1xyXG4gICAgICAgIC8vRS5nLiAtMC41IGlmIHJvdW5kZWQgdG8gLTAgd2lsbCBjYXVzZSB0b1N0cmluZyB0byBvbWl0IHRoZSBtaW51cyBzaWduLlxyXG4gICAgICAgICAgICAgICAgc3RyID0gJy0nICsgc3RyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEJpZy5FX05FRyA9IG5lZztcclxuICAgICAgICBCaWcuRV9QT1MgPSBwb3M7XHJcblxyXG4gICAgICAgIGlmICghc3RyKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9GaXghJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJvdW5kZWQgdG8gc2RcclxuICAgICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyBCaWcuUk0uIFVzZSBleHBvbmVudGlhbCBub3RhdGlvbiBpZiBzZCBpcyBsZXNzXHJcbiAgICAgKiB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGVcclxuICAgICAqIHZhbHVlIGluIG5vcm1hbCBub3RhdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBzZCB7bnVtYmVyfSBJbnRlZ2VyLCAxIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9QcmVjaXNpb24gPSBmdW5jdGlvbiAoc2QpIHtcclxuXHJcbiAgICAgICAgaWYgKHNkID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNkICE9PSB+fnNkIHx8IHNkIDwgMSB8fCBzZCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvUHJlIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBzZCAtIDEsIDIpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLy8gRXhwb3J0XHJcblxyXG5cclxuICAgIEJpZyA9IGJpZ0ZhY3RvcnkoKTtcclxuXHJcbiAgICAvL0FNRC5cclxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQmlnO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIC8vIE5vZGUgYW5kIG90aGVyIENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cy5cclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IEJpZztcclxuXHJcbiAgICAvL0Jyb3dzZXIuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGdsb2JhbC5CaWcgPSBCaWc7XHJcbiAgICB9XHJcbn0pKHRoaXMpO1xyXG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnYWJzJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sIHRoaXMubmFtZSwgTWF0aC5hYnMpKTtcblxuICAgICAgb3V0ID0gJ2dlbi5hYnMoICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFicyhwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIGFicyA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGFicy5pbnB1dHMgPSBbeF07XG5cbiAgcmV0dXJuIGFicztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdhY2N1bScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGNvZGUgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHkgPSB2b2lkIDA7XG5cbiAgICBfZ2VuLnJlcXVlc3RNZW1vcnkodGhpcy5tZW1vcnkpO1xuXG4gICAgX2dlbi5tZW1vcnkuaGVhcFt0aGlzLm1lbW9yeS52YWx1ZS5pZHhdID0gdGhpcy5pbml0aWFsVmFsdWU7XG5cbiAgICBmdW5jdGlvbkJvZHkgPSB0aGlzLmNhbGxiYWNrKGdlbk5hbWUsIGlucHV0c1swXSwgaW5wdXRzWzFdLCAnbWVtb3J5WycgKyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggKyAnXScpO1xuXG4gICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIHRoaXMpKTtcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lICsgJ192YWx1ZSc7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSArICdfdmFsdWUnLCBmdW5jdGlvbkJvZHldO1xuICB9LFxuICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2soX25hbWUsIF9pbmNyLCBfcmVzZXQsIHZhbHVlUmVmKSB7XG4gICAgdmFyIGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSAnJyxcbiAgICAgICAgd3JhcCA9ICcnO1xuXG4gICAgLyogdGhyZWUgZGlmZmVyZW50IG1ldGhvZHMgb2Ygd3JhcHBpbmcsIHRoaXJkIGlzIG1vc3QgZXhwZW5zaXZlOlxuICAgICAqXG4gICAgICogMTogcmFuZ2UgezAsMX06IHkgPSB4IC0gKHggfCAwKVxuICAgICAqIDI6IGxvZzIodGhpcy5tYXgpID09IGludGVnZXI6IHkgPSB4ICYgKHRoaXMubWF4IC0gMSlcbiAgICAgKiAzOiBhbGwgb3RoZXJzOiBpZiggeCA+PSB0aGlzLm1heCApIHkgPSB0aGlzLm1heCAteFxuICAgICAqXG4gICAgICovXG5cbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYgKCEodHlwZW9mIHRoaXMuaW5wdXRzWzFdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1sxXSA8IDEpKSB7XG4gICAgICBvdXQgKz0gJyAgaWYoICcgKyBfcmVzZXQgKyAnID49MSApICcgKyB2YWx1ZVJlZiArICcgPSAnICsgdGhpcy5pbml0aWFsVmFsdWUgKyAnXFxuXFxuJztcbiAgICB9XG5cbiAgICBvdXQgKz0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlID0gJyArIHZhbHVlUmVmICsgJztcXG4nO1xuXG4gICAgaWYgKHRoaXMuc2hvdWxkV3JhcCA9PT0gZmFsc2UgJiYgdGhpcy5zaG91bGRDbGFtcCA9PT0gdHJ1ZSkge1xuICAgICAgb3V0ICs9ICcgIGlmKCAnICsgdmFsdWVSZWYgKyAnIDwgJyArIHRoaXMubWF4ICsgJyApICcgKyB2YWx1ZVJlZiArICcgKz0gJyArIF9pbmNyICsgJ1xcbic7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSAnICAnICsgdmFsdWVSZWYgKyAnICs9ICcgKyBfaW5jciArICdcXG4nOyAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyAgXG4gICAgfVxuXG4gICAgaWYgKHRoaXMubWF4ICE9PSBJbmZpbml0eSAmJiB0aGlzLnNob3VsZFdyYXApIHdyYXAgKz0gJyAgaWYoICcgKyB2YWx1ZVJlZiArICcgPj0gJyArIHRoaXMubWF4ICsgJyApICcgKyB2YWx1ZVJlZiArICcgLT0gJyArIGRpZmYgKyAnXFxuJztcbiAgICBpZiAodGhpcy5taW4gIT09IC1JbmZpbml0eSAmJiB0aGlzLnNob3VsZFdyYXApIHdyYXAgKz0gJyAgaWYoICcgKyB2YWx1ZVJlZiArICcgPCAnICsgdGhpcy5taW4gKyAnICkgJyArIHZhbHVlUmVmICsgJyArPSAnICsgZGlmZiArICdcXG5cXG4nO1xuXG4gICAgLy9pZiggdGhpcy5taW4gPT09IDAgJiYgdGhpcy5tYXggPT09IDEgKSB7IFxuICAgIC8vICB3cmFwID0gIGAgICR7dmFsdWVSZWZ9ID0gJHt2YWx1ZVJlZn0gLSAoJHt2YWx1ZVJlZn0gfCAwKVxcblxcbmBcbiAgICAvL30gZWxzZSBpZiggdGhpcy5taW4gPT09IDAgJiYgKCBNYXRoLmxvZzIoIHRoaXMubWF4ICkgfCAwICkgPT09IE1hdGgubG9nMiggdGhpcy5tYXggKSApIHtcbiAgICAvLyAgd3JhcCA9ICBgICAke3ZhbHVlUmVmfSA9ICR7dmFsdWVSZWZ9ICYgKCR7dGhpcy5tYXh9IC0gMSlcXG5cXG5gXG4gICAgLy99IGVsc2UgaWYoIHRoaXMubWF4ICE9PSBJbmZpbml0eSApe1xuICAgIC8vICB3cmFwID0gYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICkgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxcblxcbmBcbiAgICAvL31cblxuICAgIG91dCA9IG91dCArIHdyYXA7XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbmNyKSB7XG4gIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgdmFyIHByb3BlcnRpZXMgPSBhcmd1bWVudHNbMl07XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGRlZmF1bHRzID0geyBtaW46IDAsIG1heDogMSwgc2hvdWxkV3JhcDogdHJ1ZSwgc2hvdWxkQ2xhbXA6IGZhbHNlIH07XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgcHJvcGVydGllcyk7XG5cbiAgaWYgKGRlZmF1bHRzLmluaXRpYWxWYWx1ZSA9PT0gdW5kZWZpbmVkKSBkZWZhdWx0cy5pbml0aWFsVmFsdWUgPSBkZWZhdWx0cy5taW47XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgbWluOiBkZWZhdWx0cy5taW4sXG4gICAgbWF4OiBkZWZhdWx0cy5tYXgsXG4gICAgaW5pdGlhbDogZGVmYXVsdHMuaW5pdGlhbFZhbHVlLFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbmNyLCByZXNldF0sXG4gICAgbWVtb3J5OiB7XG4gICAgICB2YWx1ZTogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9XG4gICAgfVxuICB9LCBkZWZhdWx0cyk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF07XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgICBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF0gPSB2O1xuICAgIH1cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnYWNvcycsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoeyAnYWNvcyc6IE1hdGguYWNvcyB9KTtcblxuICAgICAgb3V0ID0gJ2dlbi5hY29zKCAnICsgaW5wdXRzWzBdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hY29zKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgYWNvcyA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGFjb3MuaW5wdXRzID0gW3hdO1xuICBhY29zLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgYWNvcy5uYW1lID0gYWNvcy5iYXNlbmFtZSArICd7YWNvcy5pZH0nO1xuXG4gIHJldHVybiBhY29zO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBkaXYgPSByZXF1aXJlKCcuL2Rpdi5qcycpLFxuICAgIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgYWNjdW0gPSByZXF1aXJlKCcuL2FjY3VtLmpzJyksXG4gICAgaWZlbHNlID0gcmVxdWlyZSgnLi9pZmVsc2VpZi5qcycpLFxuICAgIGx0ID0gcmVxdWlyZSgnLi9sdC5qcycpLFxuICAgIGJhbmcgPSByZXF1aXJlKCcuL2JhbmcuanMnKSxcbiAgICBlbnYgPSByZXF1aXJlKCcuL2Vudi5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpLFxuICAgIG5lcSA9IHJlcXVpcmUoJy4vbmVxLmpzJyksXG4gICAgYW5kID0gcmVxdWlyZSgnLi9hbmQuanMnKSxcbiAgICBndGUgPSByZXF1aXJlKCcuL2d0ZS5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhdHRhY2tUaW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiA0NDEwMDtcbiAgdmFyIGRlY2F5VGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogNDQxMDA7XG4gIHZhciBfcHJvcHMgPSBhcmd1bWVudHNbMl07XG5cbiAgdmFyIF9iYW5nID0gYmFuZygpLFxuICAgICAgcGhhc2UgPSBhY2N1bSgxLCBfYmFuZywgeyBtYXg6IEluZmluaXR5LCBzaG91bGRXcmFwOiBmYWxzZSwgaW5pdGlhbFZhbHVlOiAtSW5maW5pdHkgfSksXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgc2hhcGU6ICdleHBvbmVudGlhbCcsIGFscGhhOiA1IH0sIF9wcm9wcyksXG4gICAgICBidWZmZXJEYXRhID0gdm9pZCAwLFxuICAgICAgZGVjYXlEYXRhID0gdm9pZCAwLFxuICAgICAgb3V0ID0gdm9pZCAwLFxuICAgICAgYnVmZmVyID0gdm9pZCAwO1xuXG4gIC8vY29uc29sZS5sb2coICdhdHRhY2sgdGltZTonLCBhdHRhY2tUaW1lLCAnZGVjYXkgdGltZTonLCBkZWNheVRpbWUgKVxuICB2YXIgY29tcGxldGVGbGFnID0gZGF0YShbMF1cblxuICAvLyBzbGlnaHRseSBtb3JlIGVmZmljaWVudCB0byB1c2UgZXhpc3RpbmcgcGhhc2UgYWNjdW11bGF0b3IgZm9yIGxpbmVhciBlbnZlbG9wZXNcbiAgKTtpZiAocHJvcHMuc2hhcGUgPT09ICdsaW5lYXInKSB7XG4gICAgb3V0ID0gaWZlbHNlKGFuZChndGUocGhhc2UsIDApLCBsdChwaGFzZSwgYXR0YWNrVGltZSkpLCBtZW1vKGRpdihwaGFzZSwgYXR0YWNrVGltZSkpLCBhbmQoZ3RlKHBoYXNlLCAwKSwgbHQocGhhc2UsIGFkZChhdHRhY2tUaW1lLCBkZWNheVRpbWUpKSksIHN1YigxLCBkaXYoc3ViKHBoYXNlLCBhdHRhY2tUaW1lKSwgZGVjYXlUaW1lKSksIG5lcShwaGFzZSwgLUluZmluaXR5KSwgcG9rZShjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOiAwIH0pLCAwKTtcbiAgfSBlbHNlIHtcbiAgICBidWZmZXJEYXRhID0gZW52KDEwMjQsIHsgdHlwZTogcHJvcHMuc2hhcGUsIGFscGhhOiBwcm9wcy5hbHBoYSB9KTtcbiAgICBvdXQgPSBpZmVsc2UoYW5kKGd0ZShwaGFzZSwgMCksIGx0KHBoYXNlLCBhdHRhY2tUaW1lKSksIHBlZWsoYnVmZmVyRGF0YSwgZGl2KHBoYXNlLCBhdHRhY2tUaW1lKSwgeyBib3VuZG1vZGU6ICdjbGFtcCcgfSksIGFuZChndGUocGhhc2UsIDApLCBsdChwaGFzZSwgYWRkKGF0dGFja1RpbWUsIGRlY2F5VGltZSkpKSwgcGVlayhidWZmZXJEYXRhLCBzdWIoMSwgZGl2KHN1YihwaGFzZSwgYXR0YWNrVGltZSksIGRlY2F5VGltZSkpLCB7IGJvdW5kbW9kZTogJ2NsYW1wJyB9KSwgbmVxKHBoYXNlLCAtSW5maW5pdHkpLCBwb2tlKGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6IDAgfSksIDApO1xuICB9XG5cbiAgb3V0LmlzQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFtjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHhdO1xuICB9O1xuXG4gIG91dC50cmlnZ2VyID0gZnVuY3Rpb24gKCkge1xuICAgIGdlbi5tZW1vcnkuaGVhcFtjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHhdID0gMDtcbiAgICBfYmFuZy50cmlnZ2VyKCk7XG4gIH07XG5cbiAgcmV0dXJuIG91dDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICB2YXIgYWRkID0ge1xuICAgIGlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICAgIG91dCA9ICcoJyxcbiAgICAgICAgICBzdW0gPSAwLFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBhZGRlckF0RW5kID0gZmFsc2UsXG4gICAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSB0cnVlO1xuXG4gICAgICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xuICAgICAgICBpZiAoaXNOYU4odikpIHtcbiAgICAgICAgICBvdXQgKz0gdjtcbiAgICAgICAgICBpZiAoaSA8IGlucHV0cy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBhZGRlckF0RW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIG91dCArPSAnICsgJztcbiAgICAgICAgICB9XG4gICAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdW0gKz0gcGFyc2VGbG9hdCh2KTtcbiAgICAgICAgICBudW1Db3VudCsrO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKGFscmVhZHlGdWxsU3VtbWVkKSBvdXQgPSAnJztcblxuICAgICAgaWYgKG51bUNvdW50ID4gMCkge1xuICAgICAgICBvdXQgKz0gYWRkZXJBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKyAnICsgc3VtO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWFscmVhZHlGdWxsU3VtbWVkKSBvdXQgKz0gJyknO1xuXG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gYWRkO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBkaXYgPSByZXF1aXJlKCcuL2Rpdi5qcycpLFxuICAgIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgYWNjdW0gPSByZXF1aXJlKCcuL2FjY3VtLmpzJyksXG4gICAgaWZlbHNlID0gcmVxdWlyZSgnLi9pZmVsc2VpZi5qcycpLFxuICAgIGx0ID0gcmVxdWlyZSgnLi9sdC5qcycpLFxuICAgIGJhbmcgPSByZXF1aXJlKCcuL2JhbmcuanMnKSxcbiAgICBlbnYgPSByZXF1aXJlKCcuL2Vudi5qcycpLFxuICAgIHBhcmFtID0gcmVxdWlyZSgnLi9wYXJhbS5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgZ3RwID0gcmVxdWlyZSgnLi9ndHAuanMnKSxcbiAgICBub3QgPSByZXF1aXJlKCcuL25vdC5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGF0dGFja1RpbWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDQ0O1xuICB2YXIgZGVjYXlUaW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAyMjA1MDtcbiAgdmFyIHN1c3RhaW5UaW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiA0NDEwMDtcbiAgdmFyIHN1c3RhaW5MZXZlbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogLjY7XG4gIHZhciByZWxlYXNlVGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogNDQxMDA7XG4gIHZhciBfcHJvcHMgPSBhcmd1bWVudHNbNV07XG5cbiAgdmFyIGVudlRyaWdnZXIgPSBiYW5nKCksXG4gICAgICBwaGFzZSA9IGFjY3VtKDEsIGVudlRyaWdnZXIsIHsgbWF4OiBJbmZpbml0eSwgc2hvdWxkV3JhcDogZmFsc2UgfSksXG4gICAgICBzaG91bGRTdXN0YWluID0gcGFyYW0oMSksXG4gICAgICBkZWZhdWx0cyA9IHtcbiAgICBzaGFwZTogJ2V4cG9uZW50aWFsJyxcbiAgICBhbHBoYTogNSxcbiAgICB0cmlnZ2VyUmVsZWFzZTogZmFsc2VcbiAgfSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIF9wcm9wcyksXG4gICAgICBidWZmZXJEYXRhID0gdm9pZCAwLFxuICAgICAgZGVjYXlEYXRhID0gdm9pZCAwLFxuICAgICAgb3V0ID0gdm9pZCAwLFxuICAgICAgYnVmZmVyID0gdm9pZCAwLFxuICAgICAgc3VzdGFpbkNvbmRpdGlvbiA9IHZvaWQgMCxcbiAgICAgIHJlbGVhc2VBY2N1bSA9IHZvaWQgMCxcbiAgICAgIHJlbGVhc2VDb25kaXRpb24gPSB2b2lkIDA7XG5cbiAgLy8gc2xpZ2h0bHkgbW9yZSBlZmZpY2llbnQgdG8gdXNlIGV4aXN0aW5nIHBoYXNlIGFjY3VtdWxhdG9yIGZvciBsaW5lYXIgZW52ZWxvcGVzXG4gIC8vaWYoIHByb3BzLnNoYXBlID09PSAnbGluZWFyJyApIHtcbiAgLy8gIG91dCA9IGlmZWxzZSggXG4gIC8vICAgIGx0KCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSApLCBtZW1vKCBkaXYoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICkgKSxcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICsgcHJvcHMuZGVjYXlUaW1lICksIHN1YiggMSwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKSwgcHJvcHMuZGVjYXlUaW1lICksIDEtcHJvcHMuc3VzdGFpbkxldmVsICkgKSxcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICsgcHJvcHMuZGVjYXlUaW1lICsgcHJvcHMuc3VzdGFpblRpbWUgKSwgXG4gIC8vICAgICAgcHJvcHMuc3VzdGFpbkxldmVsLFxuICAvLyAgICBsdCggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKyBwcm9wcy5kZWNheVRpbWUgKyBwcm9wcy5zdXN0YWluVGltZSArIHByb3BzLnJlbGVhc2VUaW1lICksIFxuICAvLyAgICAgIHN1YiggcHJvcHMuc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSArIHByb3BzLmRlY2F5VGltZSArIHByb3BzLnN1c3RhaW5UaW1lICksIHByb3BzLnJlbGVhc2VUaW1lICksIHByb3BzLnN1c3RhaW5MZXZlbCkgKSxcbiAgLy8gICAgMFxuICAvLyAgKVxuICAvL30gZWxzZSB7ICAgICBcbiAgYnVmZmVyRGF0YSA9IGVudih7IGxlbmd0aDogMTAyNCwgYWxwaGE6IHByb3BzLmFscGhhLCBzaGlmdDogMCwgdHlwZTogcHJvcHMuc2hhcGUgfSk7XG5cbiAgY29uc29sZS5sb2coYnVmZmVyRGF0YSk7XG5cbiAgc3VzdGFpbkNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlID8gc2hvdWxkU3VzdGFpbiA6IGx0KHBoYXNlLCBhZGQoYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSkpO1xuXG4gIHJlbGVhc2VBY2N1bSA9IHByb3BzLnRyaWdnZXJSZWxlYXNlID8gZ3RwKHN1YihzdXN0YWluTGV2ZWwsIGFjY3VtKGRpdihzdXN0YWluTGV2ZWwsIHJlbGVhc2VUaW1lKSwgMCwgeyBzaG91bGRXcmFwOiBmYWxzZSB9KSksIDApIDogc3ViKHN1c3RhaW5MZXZlbCwgbXVsKGRpdihzdWIocGhhc2UsIGFkZChhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lKSksIHJlbGVhc2VUaW1lKSwgc3VzdGFpbkxldmVsKSksIHJlbGVhc2VDb25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZSA/IG5vdChzaG91bGRTdXN0YWluKSA6IGx0KHBoYXNlLCBhZGQoYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSwgcmVsZWFzZVRpbWUpKTtcblxuICBvdXQgPSBpZmVsc2UoXG4gIC8vIGF0dGFjayBcbiAgbHQocGhhc2UsIGF0dGFja1RpbWUpLCBwZWVrKGJ1ZmZlckRhdGEsIGRpdihwaGFzZSwgYXR0YWNrVGltZSksIHsgYm91bmRtb2RlOiAnY2xhbXAnIH0pLFxuXG4gIC8vIGRlY2F5XG4gIGx0KHBoYXNlLCBhZGQoYXR0YWNrVGltZSwgZGVjYXlUaW1lKSksIHBlZWsoYnVmZmVyRGF0YSwgc3ViKDEsIG11bChkaXYoc3ViKHBoYXNlLCBhdHRhY2tUaW1lKSwgZGVjYXlUaW1lKSwgc3ViKDEsIHN1c3RhaW5MZXZlbCkpKSwgeyBib3VuZG1vZGU6ICdjbGFtcCcgfSksXG5cbiAgLy8gc3VzdGFpblxuICBzdXN0YWluQ29uZGl0aW9uLCBwZWVrKGJ1ZmZlckRhdGEsIHN1c3RhaW5MZXZlbCksXG5cbiAgLy8gcmVsZWFzZVxuICByZWxlYXNlQ29uZGl0aW9uLCAvL2x0KCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lICsgIHJlbGVhc2VUaW1lICksXG4gIHBlZWsoYnVmZmVyRGF0YSwgcmVsZWFzZUFjY3VtLFxuICAvL3N1YiggIHN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSksICByZWxlYXNlVGltZSApLCAgc3VzdGFpbkxldmVsICkgKSwgXG4gIHsgYm91bmRtb2RlOiAnY2xhbXAnIH0pLCAwXG4gIC8vfVxuXG4gICk7b3V0LnRyaWdnZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgc2hvdWxkU3VzdGFpbi52YWx1ZSA9IDE7XG4gICAgZW52VHJpZ2dlci50cmlnZ2VyKCk7XG4gIH07XG5cbiAgb3V0LnJlbGVhc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgc2hvdWxkU3VzdGFpbi52YWx1ZSA9IDA7XG4gICAgLy8gWFhYIHByZXR0eSBuYXN0eS4uLiBncmFicyBhY2N1bSBpbnNpZGUgb2YgZ3RwIGFuZCByZXNldHMgdmFsdWUgbWFudWFsbHlcbiAgICAvLyB1bmZvcnR1bmF0ZWx5IGVudlRyaWdnZXIgd29uJ3Qgd29yayBhcyBpdCdzIGJhY2sgdG8gMCBieSB0aGUgdGltZSB0aGUgcmVsZWFzZSBibG9jayBpcyB0cmlnZ2VyZWQuLi5cbiAgICBnZW4ubWVtb3J5LmhlYXBbcmVsZWFzZUFjY3VtLmlucHV0c1swXS5pbnB1dHNbMV0ubWVtb3J5LnZhbHVlLmlkeF0gPSAwO1xuICB9O1xuXG4gIHJldHVybiBvdXQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnYW5kJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICgnICsgaW5wdXRzWzBdICsgJyAhPT0gMCAmJiAnICsgaW5wdXRzWzFdICsgJyAhPT0gMCkgfCAwXFxuXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJycgKyB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gWycnICsgdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIGluMikge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBpbjJdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2FzaW4nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKHsgJ2FzaW4nOiBNYXRoLmFzaW4gfSk7XG5cbiAgICAgIG91dCA9ICdnZW4uYXNpbiggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYXNpbihwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIGFzaW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBhc2luLmlucHV0cyA9IFt4XTtcbiAgYXNpbi5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIGFzaW4ubmFtZSA9IGFzaW4uYmFzZW5hbWUgKyAne2FzaW4uaWR9JztcblxuICByZXR1cm4gYXNpbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdhdGFuJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICdhdGFuJzogTWF0aC5hdGFuIH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLmF0YW4oICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmF0YW4ocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBhdGFuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgYXRhbi5pbnB1dHMgPSBbeF07XG4gIGF0YW4uaWQgPSBfZ2VuLmdldFVJRCgpO1xuICBhdGFuLm5hbWUgPSBhdGFuLmJhc2VuYW1lICsgJ3thdGFuLmlkfSc7XG5cbiAgcmV0dXJuIGF0YW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoJy4vaGlzdG9yeS5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRlY2F5VGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogNDQxMDA7XG5cbiAgICB2YXIgc3NkID0gaGlzdG9yeSgxKSxcbiAgICAgICAgdDYwID0gTWF0aC5leHAoLTYuOTA3NzU1Mjc4OTIxIC8gZGVjYXlUaW1lKTtcblxuICAgIHNzZC5pbihtdWwoc3NkLm91dCwgdDYwKSk7XG5cbiAgICBzc2Qub3V0LnRyaWdnZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNzZC52YWx1ZSA9IDE7XG4gICAgfTtcblxuICAgIHJldHVybiBzdWIoMSwgc3NkLm91dCk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSk7XG5cbiAgICB2YXIgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gbWVtb3J5WycgKyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggKyAnXVxcbiAgaWYoICcgKyB0aGlzLm5hbWUgKyAnID09PSAxICkgbWVtb3J5WycgKyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggKyAnXSA9IDAgICAgICBcXG4gICAgICBcXG4nO1xuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKF9wcm9wcykge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG1pbjogMCwgbWF4OiAxIH0sIF9wcm9wcyk7XG5cbiAgdWdlbi5uYW1lID0gJ2JhbmcnICsgX2dlbi5nZXRVSUQoKTtcblxuICB1Z2VuLm1pbiA9IHByb3BzLm1pbjtcbiAgdWdlbi5tYXggPSBwcm9wcy5tYXg7XG5cbiAgdWdlbi50cmlnZ2VyID0gZnVuY3Rpb24gKCkge1xuICAgIF9nZW4ubWVtb3J5LmhlYXBbdWdlbi5tZW1vcnkudmFsdWUuaWR4XSA9IHVnZW4ubWF4O1xuICB9O1xuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlOiB7IGxlbmd0aDogMSwgaWR4OiBudWxsIH1cbiAgfTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdib29sJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIG91dCA9IGlucHV0c1swXSArICcgPT09IDAgPyAwIDogMSc7XG5cbiAgICAvL2dlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICAvL3JldHVybiBbIGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gLCAnICcgK291dCBdXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xKSB7XG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMV1cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdjZWlsJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sIHRoaXMubmFtZSwgTWF0aC5jZWlsKSk7XG5cbiAgICAgIG91dCA9ICdnZW4uY2VpbCggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY2VpbChwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIGNlaWwgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBjZWlsLmlucHV0cyA9IFt4XTtcblxuICByZXR1cm4gY2VpbDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZmxvb3IgPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdjbGlwJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgY29kZSA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIG91dCA9ICcgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJyArIGlucHV0c1swXSArICdcXG4gIGlmKCAnICsgdGhpcy5uYW1lICsgJyA+ICcgKyBpbnB1dHNbMl0gKyAnICkgJyArIHRoaXMubmFtZSArICcgPSAnICsgaW5wdXRzWzJdICsgJ1xcbiAgZWxzZSBpZiggJyArIHRoaXMubmFtZSArICcgPCAnICsgaW5wdXRzWzFdICsgJyApICcgKyB0aGlzLm5hbWUgKyAnID0gJyArIGlucHV0c1sxXSArICdcXG4nO1xuICAgIG91dCA9ICcgJyArIG91dDtcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSkge1xuICB2YXIgbWluID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAtMTtcbiAgdmFyIG1heCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG1pbjogbWluLFxuICAgIG1heDogbWF4LFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjEsIG1pbiwgbWF4XVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdjb3MnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKHsgJ2Nvcyc6IE1hdGguY29zIH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLmNvcyggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY29zKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgY29zID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgY29zLmlucHV0cyA9IFt4XTtcbiAgY29zLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgY29zLm5hbWUgPSBjb3MuYmFzZW5hbWUgKyAne2Nvcy5pZH0nO1xuXG4gIHJldHVybiBjb3M7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnY291bnRlcicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGNvZGUgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHkgPSB2b2lkIDA7XG5cbiAgICBpZiAodGhpcy5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsKSBfZ2VuLnJlcXVlc3RNZW1vcnkodGhpcy5tZW1vcnkpO1xuICAgIGZ1bmN0aW9uQm9keSA9IHRoaXMuY2FsbGJhY2soZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sIGlucHV0c1syXSwgaW5wdXRzWzNdLCBpbnB1dHNbNF0sICdtZW1vcnlbJyArIHRoaXMubWVtb3J5LnZhbHVlLmlkeCArICddJywgJ21lbW9yeVsnICsgdGhpcy5tZW1vcnkud3JhcC5pZHggKyAnXScpO1xuXG4gICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIHRoaXMpKTtcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lICsgJ192YWx1ZSc7XG5cbiAgICBpZiAoX2dlbi5tZW1vW3RoaXMud3JhcC5uYW1lXSA9PT0gdW5kZWZpbmVkKSB0aGlzLndyYXAuZ2VuKCk7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSArICdfdmFsdWUnLCBmdW5jdGlvbkJvZHldO1xuICB9LFxuICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2soX25hbWUsIF9pbmNyLCBfbWluLCBfbWF4LCBfcmVzZXQsIGxvb3BzLCB2YWx1ZVJlZiwgd3JhcFJlZikge1xuICAgIHZhciBkaWZmID0gdGhpcy5tYXggLSB0aGlzLm1pbixcbiAgICAgICAgb3V0ID0gJycsXG4gICAgICAgIHdyYXAgPSAnJztcblxuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiAoISh0eXBlb2YgdGhpcy5pbnB1dHNbM10gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzNdIDwgMSkpIHtcbiAgICAgIG91dCArPSAnICBpZiggJyArIF9yZXNldCArICcgPj0gMSApICcgKyB2YWx1ZVJlZiArICcgPSAnICsgX21pbiArICdcXG4nO1xuICAgIH1cblxuICAgIG91dCArPSAnICB2YXIgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgdmFsdWVSZWYgKyAnO1xcbiAgJyArIHZhbHVlUmVmICsgJyArPSAnICsgX2luY3IgKyAnXFxuJzsgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLm1heCA9PT0gJ251bWJlcicgJiYgdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHR5cGVvZiB0aGlzLm1pbiAhPT0gJ251bWJlcicpIHtcbiAgICAgIHdyYXAgPSAnICBpZiggJyArIHZhbHVlUmVmICsgJyA+PSAnICsgdGhpcy5tYXggKyAnICYmICcgKyBsb29wcyArICcgKSB7XFxuICAgICcgKyB2YWx1ZVJlZiArICcgLT0gJyArIGRpZmYgKyAnXFxuICAgICcgKyB3cmFwUmVmICsgJyA9IDFcXG4gIH1lbHNle1xcbiAgICAnICsgd3JhcFJlZiArICcgPSAwXFxuICB9XFxuJztcbiAgICB9IGVsc2UgaWYgKHRoaXMubWF4ICE9PSBJbmZpbml0eSAmJiB0aGlzLm1pbiAhPT0gSW5maW5pdHkpIHtcbiAgICAgIHdyYXAgPSAnICBpZiggJyArIHZhbHVlUmVmICsgJyA+PSAnICsgX21heCArICcgJiYgJyArIGxvb3BzICsgJyApIHtcXG4gICAgJyArIHZhbHVlUmVmICsgJyAtPSAnICsgX21heCArICcgLSAnICsgX21pbiArICdcXG4gICAgJyArIHdyYXBSZWYgKyAnID0gMVxcbiAgfWVsc2UgaWYoICcgKyB2YWx1ZVJlZiArICcgPCAnICsgX21pbiArICcgJiYgJyArIGxvb3BzICsgJyApIHtcXG4gICAgJyArIHZhbHVlUmVmICsgJyArPSAnICsgX21heCArICcgLSAnICsgX21pbiArICdcXG4gICAgJyArIHdyYXBSZWYgKyAnID0gMVxcbiAgfWVsc2V7XFxuICAgICcgKyB3cmFwUmVmICsgJyA9IDBcXG4gIH1cXG4nO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gJ1xcbic7XG4gICAgfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcDtcblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgaW5jciA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMTtcbiAgdmFyIG1pbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgdmFyIG1heCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogSW5maW5pdHk7XG4gIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMDtcbiAgdmFyIGxvb3BzID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiAxO1xuICB2YXIgcHJvcGVydGllcyA9IGFyZ3VtZW50c1s1XTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXRpYWxWYWx1ZTogMCwgc2hvdWxkV3JhcDogdHJ1ZSB9O1xuXG4gIGlmIChwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG1pbjogbWluLFxuICAgIG1heDogbWF4LFxuICAgIHZhbHVlOiBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luY3IsIG1pbiwgbWF4LCByZXNldCwgbG9vcHNdLFxuICAgIG1lbW9yeToge1xuICAgICAgdmFsdWU6IHsgbGVuZ3RoOiAxLCBpZHg6IG51bGwgfSxcbiAgICAgIHdyYXA6IHsgbGVuZ3RoOiAxLCBpZHg6IG51bGwgfVxuICAgIH0sXG4gICAgd3JhcDoge1xuICAgICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICAgIGlmICh1Z2VuLm1lbW9yeS53cmFwLmlkeCA9PT0gbnVsbCkge1xuICAgICAgICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh1Z2VuLm1lbW9yeSk7XG4gICAgICAgIH1cbiAgICAgICAgX2dlbi5nZXRJbnB1dHModGhpcyk7XG4gICAgICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJ21lbW9yeVsgJyArIHVnZW4ubWVtb3J5LndyYXAuaWR4ICsgJyBdJztcbiAgICAgICAgcmV0dXJuICdtZW1vcnlbICcgKyB1Z2VuLm1lbW9yeS53cmFwLmlkeCArICcgXSc7XG4gICAgICB9XG4gICAgfVxuICB9LCBkZWZhdWx0cyk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIGlmICh0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIF9nZW4ubWVtb3J5LmhlYXBbdGhpcy5tZW1vcnkudmFsdWUuaWR4XTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHYpIHtcbiAgICAgIGlmICh0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwpIHtcbiAgICAgICAgX2dlbi5tZW1vcnkuaGVhcFt0aGlzLm1lbW9yeS52YWx1ZS5pZHhdID0gdjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHVnZW4ud3JhcC5pbnB1dHMgPSBbdWdlbl07XG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuICB1Z2VuLndyYXAubmFtZSA9IHVnZW4ubmFtZSArICdfd3JhcCc7XG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGFjY3VtID0gcmVxdWlyZSgnLi9waGFzb3IuanMnKSxcbiAgICBkYXRhID0gcmVxdWlyZSgnLi9kYXRhLmpzJyksXG4gICAgcGVlayA9IHJlcXVpcmUoJy4vcGVlay5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgcGhhc29yID0gcmVxdWlyZSgnLi9waGFzb3IuanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ2N5Y2xlJyxcblxuICBpbml0VGFibGU6IGZ1bmN0aW9uIGluaXRUYWJsZSgpIHtcbiAgICB2YXIgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSgxMDI0KTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYnVmZmVyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgYnVmZmVyW2ldID0gTWF0aC5zaW4oaSAvIGwgKiAoTWF0aC5QSSAqIDIpKTtcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5jeWNsZSA9IGRhdGEoYnVmZmVyLCAxLCB7IGltbXV0YWJsZTogdHJ1ZSB9KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmcmVxdWVuY3kgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDE7XG4gIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgdmFyIF9wcm9wcyA9IGFyZ3VtZW50c1syXTtcblxuICBpZiAodHlwZW9mIGdlbi5nbG9iYWxzLmN5Y2xlID09PSAndW5kZWZpbmVkJykgcHJvdG8uaW5pdFRhYmxlKCk7XG4gIHZhciBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgbWluOiAwIH0sIF9wcm9wcyk7XG5cbiAgdmFyIHVnZW4gPSBwZWVrKGdlbi5nbG9iYWxzLmN5Y2xlLCBwaGFzb3IoZnJlcXVlbmN5LCByZXNldCwgcHJvcHMpKTtcbiAgdWdlbi5uYW1lID0gJ2N5Y2xlJyArIGdlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgdXRpbGl0aWVzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnZGF0YScsXG4gIGdsb2JhbHM6IHt9LFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpZHggPSB2b2lkIDA7XG4gICAgaWYgKF9nZW4ubWVtb1t0aGlzLm5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciB1Z2VuID0gdGhpcztcbiAgICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSwgdGhpcy5pbW11dGFibGUpO1xuICAgICAgaWR4ID0gdGhpcy5tZW1vcnkudmFsdWVzLmlkeDtcbiAgICAgIHRyeSB7XG4gICAgICAgIF9nZW4ubWVtb3J5LmhlYXAuc2V0KHRoaXMuYnVmZmVyLCBpZHgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ2Vycm9yIHdpdGggcmVxdWVzdC4gYXNraW5nIGZvciAnICsgdGhpcy5idWZmZXIubGVuZ3RoICsgJy4gY3VycmVudCBpbmRleDogJyArIF9nZW4ubWVtb3J5SW5kZXggKyAnIG9mICcgKyBfZ2VuLm1lbW9yeS5oZWFwLmxlbmd0aCk7XG4gICAgICB9XG4gICAgICAvL2dlbi5kYXRhWyB0aGlzLm5hbWUgXSA9IHRoaXNcbiAgICAgIC8vcmV0dXJuICdnZW4ubWVtb3J5JyArIHRoaXMubmFtZSArICcuYnVmZmVyJ1xuICAgICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSBpZHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlkeCA9IF9nZW4ubWVtb1t0aGlzLm5hbWVdO1xuICAgIH1cbiAgICByZXR1cm4gaWR4O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciB5ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAxO1xuICB2YXIgcHJvcGVydGllcyA9IGFyZ3VtZW50c1syXTtcblxuICB2YXIgdWdlbiA9IHZvaWQgMCxcbiAgICAgIGJ1ZmZlciA9IHZvaWQgMCxcbiAgICAgIHNob3VsZExvYWQgPSBmYWxzZTtcblxuICBpZiAocHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuZ2xvYmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoX2dlbi5nbG9iYWxzW3Byb3BlcnRpZXMuZ2xvYmFsXSkge1xuICAgICAgcmV0dXJuIF9nZW4uZ2xvYmFsc1twcm9wZXJ0aWVzLmdsb2JhbF07XG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGVvZiB4ID09PSAnbnVtYmVyJykge1xuICAgIGlmICh5ICE9PSAxKSB7XG4gICAgICBidWZmZXIgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeTsgaSsrKSB7XG4gICAgICAgIGJ1ZmZlcltpXSA9IG5ldyBGbG9hdDMyQXJyYXkoeCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoeCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoeCkpIHtcbiAgICAvLyEgKHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSApIHtcbiAgICB2YXIgc2l6ZSA9IHgubGVuZ3RoO1xuICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZSk7XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IHgubGVuZ3RoOyBfaSsrKSB7XG4gICAgICBidWZmZXJbX2ldID0geFtfaV07XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB4ID09PSAnc3RyaW5nJykge1xuICAgIGJ1ZmZlciA9IHsgbGVuZ3RoOiB5ID4gMSA/IHkgOiBfZ2VuLnNhbXBsZXJhdGUgKiA2MCAvLyBYWFggd2hhdD8/P1xuICAgIH07c2hvdWxkTG9hZCA9IHRydWU7XG4gIH0gZWxzZSBpZiAoeCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkge1xuICAgIGJ1ZmZlciA9IHg7XG4gIH1cblxuICB1Z2VuID0ge1xuICAgIGJ1ZmZlcjogYnVmZmVyLFxuICAgIG5hbWU6IHByb3RvLmJhc2VuYW1lICsgX2dlbi5nZXRVSUQoKSxcbiAgICBkaW06IGJ1ZmZlci5sZW5ndGgsIC8vIFhYWCBob3cgZG8gd2UgZHluYW1pY2FsbHkgYWxsb2NhdGUgdGhpcz9cbiAgICBjaGFubmVsczogMSxcbiAgICBnZW46IHByb3RvLmdlbixcbiAgICBvbmxvYWQ6IG51bGwsXG4gICAgdGhlbjogZnVuY3Rpb24gdGhlbihmbmMpIHtcbiAgICAgIHVnZW4ub25sb2FkID0gZm5jO1xuICAgICAgcmV0dXJuIHVnZW47XG4gICAgfSxcblxuICAgIGltbXV0YWJsZTogcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuaW1tdXRhYmxlID09PSB0cnVlID8gdHJ1ZSA6IGZhbHNlLFxuICAgIGxvYWQ6IGZ1bmN0aW9uIGxvYWQoZmlsZW5hbWUpIHtcbiAgICAgIHZhciBwcm9taXNlID0gdXRpbGl0aWVzLmxvYWRTYW1wbGUoZmlsZW5hbWUsIHVnZW4pO1xuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChfYnVmZmVyKSB7XG4gICAgICAgIHVnZW4ubWVtb3J5LnZhbHVlcy5sZW5ndGggPSB1Z2VuLmRpbSA9IF9idWZmZXIubGVuZ3RoO1xuICAgICAgICB1Z2VuLm9ubG9hZCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlczogeyBsZW5ndGg6IHVnZW4uZGltLCBpZHg6IG51bGwgfVxuICB9O1xuXG4gIF9nZW4ubmFtZSA9ICdkYXRhJyArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgaWYgKHNob3VsZExvYWQpIHVnZW4ubG9hZCh4KTtcblxuICBpZiAocHJvcGVydGllcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHByb3BlcnRpZXMuZ2xvYmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIF9nZW4uZ2xvYmFsc1twcm9wZXJ0aWVzLmdsb2JhbF0gPSB1Z2VuO1xuICAgIH1cbiAgICBpZiAocHJvcGVydGllcy5tZXRhID09PSB0cnVlKSB7XG4gICAgICB2YXIgX2xvb3AgPSBmdW5jdGlvbiBfbG9vcChsZW5ndGgsIF9pMikge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodWdlbiwgX2kyLCB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gcGVlayh1Z2VuLCBfaTIsIHsgbW9kZTogJ3NpbXBsZScsIGludGVycDogJ25vbmUnIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbiBzZXQodikge1xuICAgICAgICAgICAgcmV0dXJuIHBva2UodWdlbiwgdiwgX2kyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgZm9yICh2YXIgX2kyID0gMCwgbGVuZ3RoID0gdWdlbi5idWZmZXIubGVuZ3RoOyBfaTIgPCBsZW5ndGg7IF9pMisrKSB7XG4gICAgICAgIF9sb29wKGxlbmd0aCwgX2kyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSgnLi9oaXN0b3J5LmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBhZGQgPSByZXF1aXJlKCcuL2FkZC5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgICB2YXIgeDEgPSBoaXN0b3J5KCksXG4gICAgICAgIHkxID0gaGlzdG9yeSgpLFxuICAgICAgICBmaWx0ZXIgPSB2b2lkIDA7XG5cbiAgICAvL0hpc3RvcnkgeDEsIHkxOyB5ID0gaW4xIC0geDEgKyB5MSowLjk5OTc7IHgxID0gaW4xOyB5MSA9IHk7IG91dDEgPSB5O1xuICAgIGZpbHRlciA9IG1lbW8oYWRkKHN1YihpbjEsIHgxLm91dCksIG11bCh5MS5vdXQsIC45OTk3KSkpO1xuICAgIHgxLmluKGluMSk7XG4gICAgeTEuaW4oZmlsdGVyKTtcblxuICAgIHJldHVybiBmaWx0ZXI7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoJy4vaGlzdG9yeS5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgdDYwID0gcmVxdWlyZSgnLi90NjAuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRlY2F5VGltZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogNDQxMDA7XG4gICAgdmFyIHByb3BzID0gYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCB7IGluaXRWYWx1ZTogMSB9LCBwcm9wcyksXG4gICAgICAgIHNzZCA9IGhpc3RvcnkocHJvcGVydGllcy5pbml0VmFsdWUpO1xuXG4gICAgc3NkLmluKG11bChzc2Qub3V0LCB0NjAoZGVjYXlUaW1lKSkpO1xuXG4gICAgc3NkLm91dC50cmlnZ2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzc2QudmFsdWUgPSAxO1xuICAgIH07XG5cbiAgICByZXR1cm4gc3NkLm91dDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZGF0YSA9IHJlcXVpcmUoJy4vZGF0YS5qcycpLFxuICAgIHBva2UgPSByZXF1aXJlKCcuL3Bva2UuanMnKSxcbiAgICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICB3cmFwID0gcmVxdWlyZSgnLi93cmFwLmpzJyksXG4gICAgYWNjdW0gPSByZXF1aXJlKCcuL2FjY3VtLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdkZWxheScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSBpbnB1dHNbMF07XG5cbiAgICByZXR1cm4gaW5wdXRzWzBdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIHRhcHNBbmRQcm9wZXJ0aWVzID0gQXJyYXkoX2xlbiA+IDIgPyBfbGVuIC0gMiA6IDApLCBfa2V5ID0gMjsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIHRhcHNBbmRQcm9wZXJ0aWVzW19rZXkgLSAyXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciB0aW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAyNTY7XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGRlZmF1bHRzID0geyBzaXplOiA1MTIsIGZlZWRiYWNrOiAwLCBpbnRlcnA6ICdsaW5lYXInIH0sXG4gICAgICB3cml0ZUlkeCA9IHZvaWQgMCxcbiAgICAgIHJlYWRJZHggPSB2b2lkIDAsXG4gICAgICBkZWxheWRhdGEgPSB2b2lkIDAsXG4gICAgICBwcm9wZXJ0aWVzID0gdm9pZCAwLFxuICAgICAgdGFwVGltZXMgPSBbdGltZV0sXG4gICAgICB0YXBzID0gdm9pZCAwO1xuXG4gIGlmIChBcnJheS5pc0FycmF5KHRhcHNBbmRQcm9wZXJ0aWVzKSkge1xuICAgIHByb3BlcnRpZXMgPSB0YXBzQW5kUHJvcGVydGllc1t0YXBzQW5kUHJvcGVydGllcy5sZW5ndGggLSAxXTtcbiAgICBpZiAodGFwc0FuZFByb3BlcnRpZXMubGVuZ3RoID4gMSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXBzQW5kUHJvcGVydGllcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgdGFwVGltZXMucHVzaCh0YXBzQW5kUHJvcGVydGllc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHByb3BlcnRpZXMgPSB0YXBzQW5kUHJvcGVydGllcztcbiAgfVxuXG4gIGlmIChwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIGlmIChkZWZhdWx0cy5zaXplIDwgdGltZSkgZGVmYXVsdHMuc2l6ZSA9IHRpbWU7XG5cbiAgZGVsYXlkYXRhID0gZGF0YShkZWZhdWx0cy5zaXplKTtcblxuICB1Z2VuLmlucHV0cyA9IFtdO1xuXG4gIHdyaXRlSWR4ID0gYWNjdW0oMSwgMCwgeyBtYXg6IGRlZmF1bHRzLnNpemUgfSk7XG5cbiAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IHRhcFRpbWVzLmxlbmd0aDsgX2krKykge1xuICAgIHVnZW4uaW5wdXRzW19pXSA9IHBlZWsoZGVsYXlkYXRhLCB3cmFwKHN1Yih3cml0ZUlkeCwgdGFwVGltZXNbX2ldKSwgMCwgZGVmYXVsdHMuc2l6ZSksIHsgbW9kZTogJ3NhbXBsZXMnLCBpbnRlcnA6IGRlZmF1bHRzLmludGVycCB9KTtcbiAgfVxuXG4gIHVnZW4ub3V0cHV0cyA9IHVnZW4uaW5wdXRzOyAvLyB1Z24sIFVnaCwgVUdIISBidXQgaSBndWVzcyBpdCB3b3Jrcy5cblxuICBwb2tlKGRlbGF5ZGF0YSwgaW4xLCB3cml0ZUlkeCk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSgnLi9oaXN0b3J5LmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xKSB7XG4gIHZhciBuMSA9IGhpc3RvcnkoKTtcblxuICBuMS5pbihpbjEpO1xuXG4gIHZhciB1Z2VuID0gc3ViKGluMSwgbjEub3V0KTtcbiAgdWdlbi5uYW1lID0gJ2RlbHRhJyArIGdlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICB2YXIgZGl2ID0ge1xuICAgIGlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICAgIG91dCA9ICcoJyxcbiAgICAgICAgICBkaWZmID0gMCxcbiAgICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgICAgbGFzdE51bWJlciA9IGlucHV0c1swXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4obGFzdE51bWJlciksXG4gICAgICAgICAgZGl2QXRFbmQgPSBmYWxzZTtcblxuICAgICAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgICAgaWYgKGkgPT09IDApIHJldHVybjtcblxuICAgICAgICB2YXIgaXNOdW1iZXJVZ2VuID0gaXNOYU4odiksXG4gICAgICAgICAgICBpc0ZpbmFsSWR4ID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDE7XG5cbiAgICAgICAgaWYgKCFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4pIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAvIHY7XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXIgKyAnIC8gJyArIHY7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzRmluYWxJZHgpIG91dCArPSAnIC8gJztcbiAgICAgIH0pO1xuXG4gICAgICBvdXQgKz0gJyknO1xuXG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZGl2O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbicpLFxuICAgIHdpbmRvd3MgPSByZXF1aXJlKCcuL3dpbmRvd3MnKSxcbiAgICBkYXRhID0gcmVxdWlyZSgnLi9kYXRhJyksXG4gICAgcGVlayA9IHJlcXVpcmUoJy4vcGVlaycpLFxuICAgIHBoYXNvciA9IHJlcXVpcmUoJy4vcGhhc29yJyksXG4gICAgZGVmYXVsdHMgPSB7XG4gIHR5cGU6ICd0cmlhbmd1bGFyJywgbGVuZ3RoOiAxMDI0LCBhbHBoYTogLjE1LCBzaGlmdDogMFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgdmFyIHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgcHJvcHMpO1xuICB2YXIgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShwcm9wZXJ0aWVzLmxlbmd0aCk7XG5cbiAgdmFyIG5hbWUgPSBwcm9wZXJ0aWVzLnR5cGUgKyAnXycgKyBwcm9wZXJ0aWVzLmxlbmd0aCArICdfJyArIHByb3BlcnRpZXMuc2hpZnQ7XG4gIGlmICh0eXBlb2YgZ2VuLmdsb2JhbHMud2luZG93c1tuYW1lXSA9PT0gJ3VuZGVmaW5lZCcpIHtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgYnVmZmVyW2ldID0gd2luZG93c1twcm9wZXJ0aWVzLnR5cGVdKHByb3BlcnRpZXMubGVuZ3RoLCBpLCBwcm9wZXJ0aWVzLmFscGhhLCBwcm9wZXJ0aWVzLnNoaWZ0KTtcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy53aW5kb3dzW25hbWVdID0gZGF0YShidWZmZXIpO1xuICB9XG5cbiAgdmFyIHVnZW4gPSBnZW4uZ2xvYmFscy53aW5kb3dzW25hbWVdO1xuICB1Z2VuLm5hbWUgPSAnZW52JyArIGdlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdlcScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDA7XG5cbiAgICBvdXQgPSB0aGlzLmlucHV0c1swXSA9PT0gdGhpcy5pbnB1dHNbMV0gPyAxIDogJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gKCcgKyBpbnB1dHNbMF0gKyAnID09PSAnICsgaW5wdXRzWzFdICsgJykgfCAwXFxuXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJycgKyB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gWycnICsgdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEsIGluMikge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBpbjJdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnZmxvb3InLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIC8vZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguZmxvb3IgfSlcblxuICAgICAgb3V0ID0gJyggJyArIGlucHV0c1swXSArICcgfCAwICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gfCAwO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIGZsb29yID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgZmxvb3IuaW5wdXRzID0gW3hdO1xuXG4gIHJldHVybiBmbG9vcjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdmb2xkJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgY29kZSA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIG91dCA9IHRoaXMuY3JlYXRlQ2FsbGJhY2soaW5wdXRzWzBdLCB0aGlzLm1pbiwgdGhpcy5tYXgpO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJztcblxuICAgIHJldHVybiBbdGhpcy5uYW1lICsgJ192YWx1ZScsIG91dF07XG4gIH0sXG4gIGNyZWF0ZUNhbGxiYWNrOiBmdW5jdGlvbiBjcmVhdGVDYWxsYmFjayh2LCBsbywgaGkpIHtcbiAgICB2YXIgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgdiArICcsXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfcmFuZ2UgPSAnICsgaGkgKyAnIC0gJyArIGxvICsgJyxcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwcyA9IDBcXG5cXG4gIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlID49ICcgKyBoaSArICcpe1xcbiAgICAnICsgdGhpcy5uYW1lICsgJ192YWx1ZSAtPSAnICsgdGhpcy5uYW1lICsgJ19yYW5nZVxcbiAgICBpZignICsgdGhpcy5uYW1lICsgJ192YWx1ZSA+PSAnICsgaGkgKyAnKXtcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwcyA9ICgoJyArIHRoaXMubmFtZSArICdfdmFsdWUgLSAnICsgbG8gKyAnKSAvICcgKyB0aGlzLm5hbWUgKyAnX3JhbmdlKSB8IDBcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ192YWx1ZSAtPSAnICsgdGhpcy5uYW1lICsgJ19yYW5nZSAqICcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzXFxuICAgIH1cXG4gICAgJyArIHRoaXMubmFtZSArICdfbnVtV3JhcHMrK1xcbiAgfSBlbHNlIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIDwgJyArIGxvICsgJyl7XFxuICAgICcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlICs9ICcgKyB0aGlzLm5hbWUgKyAnX3JhbmdlXFxuICAgIGlmKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIDwgJyArIGxvICsgJyl7XFxuICAgICAgJyArIHRoaXMubmFtZSArICdfbnVtV3JhcHMgPSAoKCcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlIC0gJyArIGxvICsgJykgLyAnICsgdGhpcy5uYW1lICsgJ19yYW5nZS0gMSkgfCAwXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfdmFsdWUgLT0gJyArIHRoaXMubmFtZSArICdfcmFuZ2UgKiAnICsgdGhpcy5uYW1lICsgJ19udW1XcmFwc1xcbiAgICB9XFxuICAgICcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzLS1cXG4gIH1cXG4gIGlmKCcgKyB0aGlzLm5hbWUgKyAnX251bVdyYXBzICYgMSkgJyArIHRoaXMubmFtZSArICdfdmFsdWUgPSAnICsgaGkgKyAnICsgJyArIGxvICsgJyAtICcgKyB0aGlzLm5hbWUgKyAnX3ZhbHVlXFxuJztcbiAgICByZXR1cm4gJyAnICsgb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgdmFyIG1pbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgdmFyIG1heCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG1pbjogbWluLFxuICAgIG1heDogbWF4LFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjFdXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnZ2F0ZScsXG4gIGNvbnRyb2xTdHJpbmc6IG51bGwsIC8vIGluc2VydCBpbnRvIG91dHB1dCBjb2RlZ2VuIGZvciBkZXRlcm1pbmluZyBpbmRleGluZ1xuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSk7XG5cbiAgICB2YXIgbGFzdElucHV0TWVtb3J5SWR4ID0gJ21lbW9yeVsgJyArIHRoaXMubWVtb3J5Lmxhc3RJbnB1dC5pZHggKyAnIF0nLFxuICAgICAgICBvdXRwdXRNZW1vcnlTdGFydElkeCA9IHRoaXMubWVtb3J5Lmxhc3RJbnB1dC5pZHggKyAxLFxuICAgICAgICBpbnB1dFNpZ25hbCA9IGlucHV0c1swXSxcbiAgICAgICAgY29udHJvbFNpZ25hbCA9IGlucHV0c1sxXTtcblxuICAgIC8qIFxuICAgICAqIHdlIGNoZWNrIHRvIHNlZSBpZiB0aGUgY3VycmVudCBjb250cm9sIGlucHV0cyBlcXVhbHMgb3VyIGxhc3QgaW5wdXRcbiAgICAgKiBpZiBzbywgd2Ugc3RvcmUgdGhlIHNpZ25hbCBpbnB1dCBpbiB0aGUgbWVtb3J5IGFzc29jaWF0ZWQgd2l0aCB0aGUgY3VycmVudGx5XG4gICAgICogc2VsZWN0ZWQgaW5kZXguIElmIG5vdCwgd2UgcHV0IDAgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGxhc3Qgc2VsZWN0ZWQgaW5kZXgsXG4gICAgICogY2hhbmdlIHRoZSBzZWxlY3RlZCBpbmRleCwgYW5kIHRoZW4gc3RvcmUgdGhlIHNpZ25hbCBpbiBwdXQgaW4gdGhlIG1lbWVyeSBhc3NvaWNhdGVkXG4gICAgICogd2l0aCB0aGUgbmV3bHkgc2VsZWN0ZWQgaW5kZXhcbiAgICAgKi9cblxuICAgIG91dCA9ICcgaWYoICcgKyBjb250cm9sU2lnbmFsICsgJyAhPT0gJyArIGxhc3RJbnB1dE1lbW9yeUlkeCArICcgKSB7XFxuICAgIG1lbW9yeVsgJyArIGxhc3RJbnB1dE1lbW9yeUlkeCArICcgKyAnICsgb3V0cHV0TWVtb3J5U3RhcnRJZHggKyAnICBdID0gMCBcXG4gICAgJyArIGxhc3RJbnB1dE1lbW9yeUlkeCArICcgPSAnICsgY29udHJvbFNpZ25hbCArICdcXG4gIH1cXG4gIG1lbW9yeVsgJyArIG91dHB1dE1lbW9yeVN0YXJ0SWR4ICsgJyArICcgKyBjb250cm9sU2lnbmFsICsgJyBdID0gJyArIGlucHV0U2lnbmFsICsgJ1xcblxcbic7XG4gICAgdGhpcy5jb250cm9sU3RyaW5nID0gaW5wdXRzWzFdO1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICB0aGlzLm91dHB1dHMuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgICAgcmV0dXJuIHYuZ2VuKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gW251bGwsICcgJyArIG91dF07XG4gIH0sXG4gIGNoaWxkZ2VuOiBmdW5jdGlvbiBjaGlsZGdlbigpIHtcbiAgICBpZiAodGhpcy5wYXJlbnQuaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XG4gICAgICBfZ2VuLmdldElucHV0cyh0aGlzIC8vIHBhcmVudCBnYXRlIGlzIG9ubHkgaW5wdXQgb2YgYSBnYXRlIG91dHB1dCwgc2hvdWxkIG9ubHkgYmUgZ2VuJ2Qgb25jZS5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKF9nZW4ubWVtb1t0aGlzLm5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSk7XG5cbiAgICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJ21lbW9yeVsgJyArIHRoaXMubWVtb3J5LnZhbHVlLmlkeCArICcgXSc7XG4gICAgfVxuXG4gICAgcmV0dXJuICdtZW1vcnlbICcgKyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggKyAnIF0nO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb250cm9sLCBpbjEsIHByb3BlcnRpZXMpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKSxcbiAgICAgIGRlZmF1bHRzID0geyBjb3VudDogMiB9O1xuXG4gIGlmICgodHlwZW9mIHByb3BlcnRpZXMgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKHByb3BlcnRpZXMpKSAhPT0gdW5kZWZpbmVkKSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBwcm9wZXJ0aWVzKTtcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICBvdXRwdXRzOiBbXSxcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbaW4xLCBjb250cm9sXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIGxhc3RJbnB1dDogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9XG4gICAgfSxcbiAgICBpbml0aWFsaXplZDogZmFsc2VcbiAgfSwgZGVmYXVsdHMpO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB1Z2VuLmNvdW50OyBpKyspIHtcbiAgICB1Z2VuLm91dHB1dHMucHVzaCh7XG4gICAgICBpbmRleDogaSxcbiAgICAgIGdlbjogcHJvdG8uY2hpbGRnZW4sXG4gICAgICBwYXJlbnQ6IHVnZW4sXG4gICAgICBpbnB1dHM6IFt1Z2VuXSxcbiAgICAgIG1lbW9yeToge1xuICAgICAgICB2YWx1ZTogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9XG4gICAgICB9LFxuICAgICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxuICAgICAgbmFtZTogdWdlbi5uYW1lICsgJ19vdXQnICsgX2dlbi5nZXRVSUQoKVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxuLyogZ2VuLmpzXG4gKlxuICogbG93LWxldmVsIGNvZGUgZ2VuZXJhdGlvbiBmb3IgdW5pdCBnZW5lcmF0b3JzXG4gKlxuICovXG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxudmFyIE1lbW9yeUhlbHBlciA9IHJlcXVpcmUoJ21lbW9yeS1oZWxwZXInKTtcblxudmFyIGdlbiA9IHtcblxuICBhY2N1bTogMCxcbiAgZ2V0VUlEOiBmdW5jdGlvbiBnZXRVSUQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWNjdW0rKztcbiAgfSxcblxuICBkZWJ1ZzogZmFsc2UsXG4gIHNhbXBsZXJhdGU6IDQ0MTAwLCAvLyBjaGFuZ2Ugb24gYXVkaW9jb250ZXh0IGNyZWF0aW9uXG4gIHNob3VsZExvY2FsaXplOiBmYWxzZSxcbiAgZ2xvYmFsczoge1xuICAgIHdpbmRvd3M6IHt9XG4gIH0sXG5cbiAgLyogY2xvc3VyZXNcbiAgICpcbiAgICogRnVuY3Rpb25zIHRoYXQgYXJlIGluY2x1ZGVkIGFzIGFyZ3VtZW50cyB0byBtYXN0ZXIgY2FsbGJhY2suIEV4YW1wbGVzOiBNYXRoLmFicywgTWF0aC5yYW5kb20gZXRjLlxuICAgKiBYWFggU2hvdWxkIHByb2JhYmx5IGJlIHJlbmFtZWQgY2FsbGJhY2tQcm9wZXJ0aWVzIG9yIHNvbWV0aGluZyBzaW1pbGFyLi4uIGNsb3N1cmVzIGFyZSBubyBsb25nZXIgdXNlZC5cbiAgICovXG5cbiAgY2xvc3VyZXM6IG5ldyBTZXQoKSxcbiAgcGFyYW1zOiBuZXcgU2V0KCksXG5cbiAgcGFyYW1ldGVyczogW10sXG4gIGVuZEJsb2NrOiBuZXcgU2V0KCksXG4gIGhpc3RvcmllczogbmV3IE1hcCgpLFxuXG4gIG1lbW86IHt9LFxuXG4gIGRhdGE6IHt9LFxuXG4gIC8qIGV4cG9ydFxuICAgKlxuICAgKiBwbGFjZSBnZW4gZnVuY3Rpb25zIGludG8gYW5vdGhlciBvYmplY3QgZm9yIGVhc2llciByZWZlcmVuY2VcbiAgICovXG5cbiAgZXhwb3J0OiBmdW5jdGlvbiBfZXhwb3J0KG9iaikge30sXG4gIGFkZFRvRW5kQmxvY2s6IGZ1bmN0aW9uIGFkZFRvRW5kQmxvY2sodikge1xuICAgIHRoaXMuZW5kQmxvY2suYWRkKCcgICcgKyB2KTtcbiAgfSxcbiAgcmVxdWVzdE1lbW9yeTogZnVuY3Rpb24gcmVxdWVzdE1lbW9yeShtZW1vcnlTcGVjKSB7XG4gICAgdmFyIGltbXV0YWJsZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gbWVtb3J5U3BlYykge1xuICAgICAgdmFyIHJlcXVlc3QgPSBtZW1vcnlTcGVjW2tleV07XG5cbiAgICAgIHJlcXVlc3QuaWR4ID0gZ2VuLm1lbW9yeS5hbGxvYyhyZXF1ZXN0Lmxlbmd0aCwgaW1tdXRhYmxlKTtcbiAgICB9XG4gIH0sXG5cblxuICAvKiBjcmVhdGVDYWxsYmFja1xuICAgKlxuICAgKiBwYXJhbSB1Z2VuIC0gSGVhZCBvZiBncmFwaCB0byBiZSBjb2RlZ2VuJ2RcbiAgICpcbiAgICogR2VuZXJhdGUgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGEgcGFydGljdWxhciB1Z2VuIGdyYXBoLlxuICAgKiBUaGUgZ2VuLmNsb3N1cmVzIHByb3BlcnR5IHN0b3JlcyBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlXG4gICAqIHBhc3NlZCBhcyBhcmd1bWVudHMgdG8gdGhlIGZpbmFsIGZ1bmN0aW9uOyB0aGVzZSBhcmUgcHJlZml4ZWRcbiAgICogYmVmb3JlIGFueSBkZWZpbmVkIHBhcmFtcyB0aGUgZ3JhcGggZXhwb3Nlcy4gRm9yIGV4YW1wbGUsIGdpdmVuOlxuICAgKlxuICAgKiBnZW4uY3JlYXRlQ2FsbGJhY2soIGFicyggcGFyYW0oKSApIClcbiAgICpcbiAgICogLi4uIHRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gd2lsbCBoYXZlIGEgc2lnbmF0dXJlIG9mICggYWJzLCBwMCApLlxuICAgKi9cblxuICBjcmVhdGVDYWxsYmFjazogZnVuY3Rpb24gY3JlYXRlQ2FsbGJhY2sodWdlbiwgbWVtKSB7XG4gICAgdmFyIGRlYnVnID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmYWxzZTtcbiAgICB2YXIgc2hvdWxkSW5saW5lTWVtb3J5ID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiBmYWxzZTtcblxuICAgIHZhciBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkodWdlbikgJiYgdWdlbi5sZW5ndGggPiAxLFxuICAgICAgICBjYWxsYmFjayA9IHZvaWQgMCxcbiAgICAgICAgY2hhbm5lbDEgPSB2b2lkIDAsXG4gICAgICAgIGNoYW5uZWwyID0gdm9pZCAwO1xuXG4gICAgaWYgKHR5cGVvZiBtZW0gPT09ICdudW1iZXInIHx8IG1lbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBtZW0gPSBNZW1vcnlIZWxwZXIuY3JlYXRlKG1lbSk7XG4gICAgfVxuXG4gICAgLy9jb25zb2xlLmxvZyggJ2NiIG1lbW9yeTonLCBtZW0gKVxuICAgIHRoaXMubWVtb3J5ID0gbWVtO1xuICAgIHRoaXMubWVtbyA9IHt9O1xuICAgIHRoaXMuZW5kQmxvY2suY2xlYXIoKTtcbiAgICB0aGlzLmNsb3N1cmVzLmNsZWFyKCk7XG4gICAgdGhpcy5wYXJhbXMuY2xlYXJcbiAgICAvL3RoaXMuZ2xvYmFscyA9IHsgd2luZG93czp7fSB9XG5cbiAgICAoKTt0aGlzLnBhcmFtZXRlcnMubGVuZ3RoID0gMDtcblxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gXCIgICd1c2Ugc3RyaWN0J1xcblwiO1xuICAgIGlmIChzaG91bGRJbmxpbmVNZW1vcnkgPT09IGZhbHNlKSB0aGlzLmZ1bmN0aW9uQm9keSArPSBcIiAgdmFyIG1lbW9yeSA9IGdlbi5tZW1vcnlcXG5cXG5cIjtcblxuICAgIC8vIGNhbGwgLmdlbigpIG9uIHRoZSBoZWFkIG9mIHRoZSBncmFwaCB3ZSBhcmUgZ2VuZXJhdGluZyB0aGUgY2FsbGJhY2sgZm9yXG4gICAgLy9jb25zb2xlLmxvZyggJ0hFQUQnLCB1Z2VuIClcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEgKyBpc1N0ZXJlbzsgaSsrKSB7XG4gICAgICBpZiAodHlwZW9mIHVnZW5baV0gPT09ICdudW1iZXInKSBjb250aW51ZTtcblxuICAgICAgdmFyIGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHVnZW5baV0uZ2VuKCkgOiB1Z2VuLmdlbigpLFxuICAgICAgICAgIGJvZHkgPSAnJztcblxuICAgICAgLy8gaWYgLmdlbigpIHJldHVybnMgYXJyYXksIGFkZCB1Z2VuIGNhbGxiYWNrIChncmFwaE91dHB1dFsxXSkgdG8gb3VyIG91dHB1dCBmdW5jdGlvbnMgYm9keVxuICAgICAgLy8gYW5kIHRoZW4gcmV0dXJuIG5hbWUgb2YgdWdlbi4gSWYgLmdlbigpIG9ubHkgZ2VuZXJhdGVzIGEgbnVtYmVyIChmb3IgcmVhbGx5IHNpbXBsZSBncmFwaHMpXG4gICAgICAvLyBqdXN0IHJldHVybiB0aGF0IG51bWJlciAoZ3JhcGhPdXRwdXRbMF0pLlxuICAgICAgYm9keSArPSBBcnJheS5pc0FycmF5KGNoYW5uZWwpID8gY2hhbm5lbFsxXSArICdcXG4nICsgY2hhbm5lbFswXSA6IGNoYW5uZWw7XG5cbiAgICAgIC8vIHNwbGl0IGJvZHkgdG8gaW5qZWN0IHJldHVybiBrZXl3b3JkIG9uIGxhc3QgbGluZVxuICAgICAgYm9keSA9IGJvZHkuc3BsaXQoJ1xcbidcblxuICAgICAgLy9pZiggZGVidWcgKSBjb25zb2xlLmxvZyggJ2Z1bmN0aW9uQm9keSBsZW5ndGgnLCBib2R5IClcblxuICAgICAgLy8gbmV4dCBsaW5lIGlzIHRvIGFjY29tbW9kYXRlIG1lbW8gYXMgZ3JhcGggaGVhZFxuICAgICAgKTtpZiAoYm9keVtib2R5Lmxlbmd0aCAtIDFdLnRyaW0oKS5pbmRleE9mKCdsZXQnKSA+IC0xKSB7XG4gICAgICAgIGJvZHkucHVzaCgnXFxuJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGdldCBpbmRleCBvZiBsYXN0IGxpbmVcbiAgICAgIHZhciBsYXN0aWR4ID0gYm9keS5sZW5ndGggLSAxO1xuXG4gICAgICAvLyBpbnNlcnQgcmV0dXJuIGtleXdvcmRcbiAgICAgIGJvZHlbbGFzdGlkeF0gPSAnICBnZW4ub3V0WycgKyBpICsgJ10gID0gJyArIGJvZHlbbGFzdGlkeF0gKyAnXFxuJztcblxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gYm9keS5qb2luKCdcXG4nKTtcbiAgICB9XG5cbiAgICB0aGlzLmhpc3Rvcmllcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB2YWx1ZS5nZW4oKTtcbiAgICB9KTtcblxuICAgIHZhciByZXR1cm5TdGF0ZW1lbnQgPSBpc1N0ZXJlbyA/ICcgIHJldHVybiBnZW4ub3V0JyA6ICcgIHJldHVybiBnZW4ub3V0WzBdJztcblxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuc3BsaXQoJ1xcbicpO1xuXG4gICAgaWYgKHRoaXMuZW5kQmxvY2suc2l6ZSkge1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5jb25jYXQoQXJyYXkuZnJvbSh0aGlzLmVuZEJsb2NrKSk7XG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKHJldHVyblN0YXRlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2gocmV0dXJuU3RhdGVtZW50KTtcbiAgICB9XG4gICAgLy8gcmVhc3NlbWJsZSBmdW5jdGlvbiBib2R5XG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5qb2luKCdcXG4nXG5cbiAgICAvLyB3ZSBjYW4gb25seSBkeW5hbWljYWxseSBjcmVhdGUgYSBuYW1lZCBmdW5jdGlvbiBieSBkeW5hbWljYWxseSBjcmVhdGluZyBhbm90aGVyIGZ1bmN0aW9uXG4gICAgLy8gdG8gY29uc3RydWN0IHRoZSBuYW1lZCBmdW5jdGlvbiEgc2hlZXNoLi4uXG4gICAgLy9cbiAgICApO2lmIChzaG91bGRJbmxpbmVNZW1vcnkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMucGFyYW1ldGVycy5wdXNoKCdtZW1vcnknKTtcbiAgICB9XG4gICAgdmFyIGJ1aWxkU3RyaW5nID0gJ3JldHVybiBmdW5jdGlvbiBnZW4oICcgKyB0aGlzLnBhcmFtZXRlcnMuam9pbignLCcpICsgJyApeyBcXG4nICsgdGhpcy5mdW5jdGlvbkJvZHkgKyAnXFxufSc7XG5cbiAgICBpZiAodGhpcy5kZWJ1ZyB8fCBkZWJ1ZykgY29uc29sZS5sb2coYnVpbGRTdHJpbmcpO1xuXG4gICAgY2FsbGJhY2sgPSBuZXcgRnVuY3Rpb24oYnVpbGRTdHJpbmcpXG5cbiAgICAvLyBhc3NpZ24gcHJvcGVydGllcyB0byBuYW1lZCBmdW5jdGlvblxuICAgICgpO3ZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gdGhpcy5jbG9zdXJlcy52YWx1ZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgdmFyIGRpY3QgPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICB2YXIgbmFtZSA9IE9iamVjdC5rZXlzKGRpY3QpWzBdLFxuICAgICAgICAgICAgdmFsdWUgPSBkaWN0W25hbWVdO1xuXG4gICAgICAgIGNhbGxiYWNrW25hbWVdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gICAgdmFyIF9pdGVyYXRvckVycm9yMiA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICB2YXIgX2xvb3AgPSBmdW5jdGlvbiBfbG9vcCgpIHtcbiAgICAgICAgdmFyIGRpY3QgPSBfc3RlcDIudmFsdWU7XG5cbiAgICAgICAgdmFyIG5hbWUgPSBPYmplY3Qua2V5cyhkaWN0KVswXSxcbiAgICAgICAgICAgIHVnZW4gPSBkaWN0W25hbWVdO1xuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjYWxsYmFjaywgbmFtZSwge1xuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB1Z2VuLnZhbHVlO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0OiBmdW5jdGlvbiBzZXQodikge1xuICAgICAgICAgICAgdWdlbi52YWx1ZSA9IHY7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgICAgICk7XG4gICAgICB9O1xuXG4gICAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gdGhpcy5wYXJhbXMudmFsdWVzKClbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgICAgX2xvb3AoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIF9kaWRJdGVyYXRvckVycm9yMiA9IHRydWU7XG4gICAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMi5yZXR1cm4pIHtcbiAgICAgICAgICBfaXRlcmF0b3IyLnJldHVybigpO1xuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2FsbGJhY2suZGF0YSA9IHRoaXMuZGF0YTtcbiAgICBjYWxsYmFjay5vdXQgPSBuZXcgRmxvYXQzMkFycmF5KDIpO1xuICAgIGNhbGxiYWNrLnBhcmFtZXRlcnMgPSB0aGlzLnBhcmFtZXRlcnMuc2xpY2UoMFxuXG4gICAgLy9pZiggTWVtb3J5SGVscGVyLmlzUHJvdG90eXBlT2YoIHRoaXMubWVtb3J5ICkgKSBcbiAgICApO2NhbGxiYWNrLm1lbW9yeSA9IHRoaXMubWVtb3J5LmhlYXA7XG5cbiAgICB0aGlzLmhpc3Rvcmllcy5jbGVhcigpO1xuXG4gICAgcmV0dXJuIGNhbGxiYWNrO1xuICB9LFxuXG5cbiAgLyogZ2V0SW5wdXRzXG4gICAqXG4gICAqIEdpdmVuIGFuIGFyZ3VtZW50IHVnZW4sIGV4dHJhY3QgaXRzIGlucHV0cy4gSWYgdGhleSBhcmUgbnVtYmVycywgcmV0dXJuIHRoZSBudW1lYnJzLiBJZlxuICAgKiB0aGV5IGFyZSB1Z2VucywgY2FsbCAuZ2VuKCkgb24gdGhlIHVnZW4sIG1lbW9pemUgdGhlIHJlc3VsdCBhbmQgcmV0dXJuIHRoZSByZXN1bHQuIElmIHRoZVxuICAgKiB1Z2VuIGhhcyBwcmV2aW91c2x5IGJlZW4gbWVtb2l6ZWQgcmV0dXJuIHRoZSBtZW1vaXplZCB2YWx1ZS5cbiAgICpcbiAgICovXG4gIGdldElucHV0czogZnVuY3Rpb24gZ2V0SW5wdXRzKHVnZW4pIHtcbiAgICByZXR1cm4gdWdlbi5pbnB1dHMubWFwKGdlbi5nZXRJbnB1dCk7XG4gIH0sXG4gIGdldElucHV0OiBmdW5jdGlvbiBnZXRJbnB1dChpbnB1dCkge1xuICAgIHZhciBpc09iamVjdCA9ICh0eXBlb2YgaW5wdXQgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKGlucHV0KSkgPT09ICdvYmplY3QnLFxuICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IHZvaWQgMDtcblxuICAgIGlmIChpc09iamVjdCkge1xuICAgICAgLy8gaWYgaW5wdXQgaXMgYSB1Z2VuLi4uIFxuICAgICAgaWYgKGdlbi5tZW1vW2lucHV0Lm5hbWVdKSB7XG4gICAgICAgIC8vIGlmIGl0IGhhcyBiZWVuIG1lbW9pemVkLi4uXG4gICAgICAgIHByb2Nlc3NlZElucHV0ID0gZ2VuLm1lbW9baW5wdXQubmFtZV07XG4gICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICAgIGdlbi5nZXRJbnB1dChpbnB1dFswXSk7XG4gICAgICAgIGdlbi5nZXRJbnB1dChpbnB1dFsxXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBpZiBub3QgbWVtb2l6ZWQgZ2VuZXJhdGUgY29kZSAgXG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQuZ2VuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ25vIGdlbiBmb3VuZDonLCBpbnB1dCwgaW5wdXQuZ2VuKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29kZSA9IGlucHV0LmdlblxuICAgICAgICAvL2lmKCBjb2RlLmluZGV4T2YoICdPYmplY3QnICkgPiAtMSApIGNvbnNvbGUubG9nKCAnYmFkIGlucHV0OicsIGlucHV0LCBjb2RlIClcblxuICAgICAgICAoKTtpZiAoQXJyYXkuaXNBcnJheShjb2RlKSkge1xuICAgICAgICAgIGlmICghZ2VuLnNob3VsZExvY2FsaXplKSB7XG4gICAgICAgICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdlbi5jb2RlTmFtZSA9IGNvZGVbMF07XG4gICAgICAgICAgICBnZW4ubG9jYWxpemVkQ29kZS5wdXNoKGNvZGVbMV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnYWZ0ZXIgR0VOJyAsIHRoaXMuZnVuY3Rpb25Cb2R5IClcbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGl0IGlucHV0IGlzIGEgbnVtYmVyXG4gICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0O1xuICAgIH1cblxuICAgIHJldHVybiBwcm9jZXNzZWRJbnB1dDtcbiAgfSxcbiAgc3RhcnRMb2NhbGl6ZTogZnVuY3Rpb24gc3RhcnRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLmxvY2FsaXplZENvZGUgPSBbXTtcbiAgICB0aGlzLnNob3VsZExvY2FsaXplID0gdHJ1ZTtcbiAgfSxcbiAgZW5kTG9jYWxpemU6IGZ1bmN0aW9uIGVuZExvY2FsaXplKCkge1xuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSBmYWxzZTtcblxuICAgIHJldHVybiBbdGhpcy5jb2RlTmFtZSwgdGhpcy5sb2NhbGl6ZWRDb2RlLnNsaWNlKDApXTtcbiAgfSxcbiAgZnJlZTogZnVuY3Rpb24gZnJlZShncmFwaCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGdyYXBoKSkge1xuICAgICAgLy8gc3RlcmVvIHVnZW5cbiAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWU7XG4gICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IzID0gZmFsc2U7XG4gICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IzID0gdW5kZWZpbmVkO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IzID0gZ3JhcGhbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDM7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjMgPSAoX3N0ZXAzID0gX2l0ZXJhdG9yMy5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyA9IHRydWUpIHtcbiAgICAgICAgICB2YXIgY2hhbm5lbCA9IF9zdGVwMy52YWx1ZTtcblxuICAgICAgICAgIHRoaXMuZnJlZShjaGFubmVsKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9kaWRJdGVyYXRvckVycm9yMyA9IHRydWU7XG4gICAgICAgIF9pdGVyYXRvckVycm9yMyA9IGVycjtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMyAmJiBfaXRlcmF0b3IzLnJldHVybikge1xuICAgICAgICAgICAgX2l0ZXJhdG9yMy5yZXR1cm4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yMykge1xuICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3IzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoKHR5cGVvZiBncmFwaCA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoZ3JhcGgpKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKGdyYXBoLm1lbW9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgZm9yICh2YXIgbWVtb3J5S2V5IGluIGdyYXBoLm1lbW9yeSkge1xuICAgICAgICAgICAgdGhpcy5tZW1vcnkuZnJlZShncmFwaC5tZW1vcnlbbWVtb3J5S2V5XS5pZHgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShncmFwaC5pbnB1dHMpKSB7XG4gICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb240ID0gdHJ1ZTtcbiAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3I0ID0gZmFsc2U7XG4gICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yNCA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3I0ID0gZ3JhcGguaW5wdXRzW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA0OyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb240ID0gKF9zdGVwNCA9IF9pdGVyYXRvcjQubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjQgPSB0cnVlKSB7XG4gICAgICAgICAgICAgIHZhciB1Z2VuID0gX3N0ZXA0LnZhbHVlO1xuXG4gICAgICAgICAgICAgIHRoaXMuZnJlZSh1Z2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yNCA9IHRydWU7XG4gICAgICAgICAgICBfaXRlcmF0b3JFcnJvcjQgPSBlcnI7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjQgJiYgX2l0ZXJhdG9yNC5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3I0LnJldHVybigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3I0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnZ3QnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJztcblxuICAgIGlmIChpc05hTih0aGlzLmlucHV0c1swXSkgfHwgaXNOYU4odGhpcy5pbnB1dHNbMV0pKSB7XG4gICAgICBvdXQgKz0gJygoICcgKyBpbnB1dHNbMF0gKyAnID4gJyArIGlucHV0c1sxXSArICcpIHwgMCApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA+IGlucHV0c1sxXSA/IDEgOiAwO1xuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBndCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGd0LmlucHV0cyA9IFt4LCB5XTtcbiAgZ3QubmFtZSA9ICdndCcgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiBndDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2d0ZScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnO1xuXG4gICAgaWYgKGlzTmFOKHRoaXMuaW5wdXRzWzBdKSB8fCBpc05hTih0aGlzLmlucHV0c1sxXSkpIHtcbiAgICAgIG91dCArPSAnKCAnICsgaW5wdXRzWzBdICsgJyA+PSAnICsgaW5wdXRzWzFdICsgJyB8IDAgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPj0gaW5wdXRzWzFdID8gMSA6IDA7XG4gICAgfVxuICAgIG91dCArPSAnXFxuXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIGd0ID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgZ3QuaW5wdXRzID0gW3gsIHldO1xuICBndC5uYW1lID0gJ2d0ZScgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiBndDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2d0cCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4odGhpcy5pbnB1dHNbMF0pIHx8IGlzTmFOKHRoaXMuaW5wdXRzWzFdKSkge1xuICAgICAgb3V0ID0gJygnICsgaW5wdXRzWzBdICsgJyAqICggKCAnICsgaW5wdXRzWzBdICsgJyA+ICcgKyBpbnB1dHNbMV0gKyAnICkgfCAwICkgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSAqIChpbnB1dHNbMF0gPiBpbnB1dHNbMV0gfCAwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBndHAgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBndHAuaW5wdXRzID0gW3gsIHldO1xuXG4gIHJldHVybiBndHA7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGluMSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMDtcblxuICB2YXIgdWdlbiA9IHtcbiAgICBpbnB1dHM6IFtpbjFdLFxuICAgIG1lbW9yeTogeyB2YWx1ZTogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9IH0sXG4gICAgcmVjb3JkZXI6IG51bGwsXG5cbiAgICBpbjogZnVuY3Rpb24gX2luKHYpIHtcbiAgICAgIGlmIChfZ2VuLmhpc3Rvcmllcy5oYXModikpIHtcbiAgICAgICAgdmFyIG1lbW9IaXN0b3J5ID0gX2dlbi5oaXN0b3JpZXMuZ2V0KHYpO1xuICAgICAgICB1Z2VuLm5hbWUgPSBtZW1vSGlzdG9yeS5uYW1lO1xuICAgICAgICByZXR1cm4gbWVtb0hpc3Rvcnk7XG4gICAgICB9XG5cbiAgICAgIHZhciBvYmogPSB7XG4gICAgICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh1Z2VuKTtcblxuICAgICAgICAgIGlmICh1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwpIHtcbiAgICAgICAgICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh1Z2VuLm1lbW9yeSk7XG4gICAgICAgICAgICBfZ2VuLm1lbW9yeS5oZWFwW3VnZW4ubWVtb3J5LnZhbHVlLmlkeF0gPSBpbjE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGlkeCA9IHVnZW4ubWVtb3J5LnZhbHVlLmlkeDtcblxuICAgICAgICAgIF9nZW4uYWRkVG9FbmRCbG9jaygnbWVtb3J5WyAnICsgaWR4ICsgJyBdID0gJyArIGlucHV0c1swXVxuXG4gICAgICAgICAgLy8gcmV0dXJuIHVnZW4gdGhhdCBpcyBiZWluZyByZWNvcmRlZCBpbnN0ZWFkIG9mIHNzZC5cbiAgICAgICAgICAvLyB0aGlzIGVmZmVjdGl2ZWx5IG1ha2VzIGEgY2FsbCB0byBzc2QucmVjb3JkKCkgdHJhbnNwYXJlbnQgdG8gdGhlIGdyYXBoLlxuICAgICAgICAgIC8vIHJlY29yZGluZyBpcyB0cmlnZ2VyZWQgYnkgcHJpb3IgY2FsbCB0byBnZW4uYWRkVG9FbmRCbG9jay5cbiAgICAgICAgICApO19nZW4uaGlzdG9yaWVzLnNldCh2LCBvYmopO1xuXG4gICAgICAgICAgcmV0dXJuIGlucHV0c1swXTtcbiAgICAgICAgfSxcblxuICAgICAgICBuYW1lOiB1Z2VuLm5hbWUgKyAnX2luJyArIF9nZW4uZ2V0VUlEKCksXG4gICAgICAgIG1lbW9yeTogdWdlbi5tZW1vcnlcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuaW5wdXRzWzBdID0gdjtcblxuICAgICAgdWdlbi5yZWNvcmRlciA9IG9iajtcblxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuXG5cbiAgICBvdXQ6IHtcbiAgICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgICBpZiAodWdlbi5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsKSB7XG4gICAgICAgICAgaWYgKF9nZW4uaGlzdG9yaWVzLmdldCh1Z2VuLmlucHV0c1swXSkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgX2dlbi5oaXN0b3JpZXMuc2V0KHVnZW4uaW5wdXRzWzBdLCB1Z2VuLnJlY29yZGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgX2dlbi5yZXF1ZXN0TWVtb3J5KHVnZW4ubWVtb3J5KTtcbiAgICAgICAgICBfZ2VuLm1lbW9yeS5oZWFwW3VnZW4ubWVtb3J5LnZhbHVlLmlkeF0gPSBwYXJzZUZsb2F0KGluMSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGlkeCA9IHVnZW4ubWVtb3J5LnZhbHVlLmlkeDtcblxuICAgICAgICByZXR1cm4gJ21lbW9yeVsgJyArIGlkeCArICcgXSAnO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKClcbiAgfTtcblxuICB1Z2VuLm91dC5tZW1vcnkgPSB1Z2VuLm1lbW9yeTtcblxuICB1Z2VuLm5hbWUgPSAnaGlzdG9yeScgKyB1Z2VuLnVpZDtcbiAgdWdlbi5vdXQubmFtZSA9IHVnZW4ubmFtZSArICdfb3V0JztcbiAgdWdlbi5pbi5fbmFtZSA9IHVnZW4ubmFtZSA9ICdfaW4nO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICBpZiAodGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF07XG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgICBpZiAodGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsKSB7XG4gICAgICAgIF9nZW4ubWVtb3J5LmhlYXBbdGhpcy5tZW1vcnkudmFsdWUuaWR4XSA9IHY7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiLypcblxuIGEgPSBjb25kaXRpb25hbCggY29uZGl0aW9uLCB0cnVlQmxvY2ssIGZhbHNlQmxvY2sgKVxuIGIgPSBjb25kaXRpb25hbChbXG4gICBjb25kaXRpb24xLCBibG9jazEsXG4gICBjb25kaXRpb24yLCBibG9jazIsXG4gICBjb25kaXRpb24zLCBibG9jazMsXG4gICBkZWZhdWx0QmxvY2tcbiBdKVxuXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdpZmVsc2UnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBjb25kaXRpb25hbHMgPSB0aGlzLmlucHV0c1swXSxcbiAgICAgICAgZGVmYXVsdFZhbHVlID0gX2dlbi5nZXRJbnB1dChjb25kaXRpb25hbHNbY29uZGl0aW9uYWxzLmxlbmd0aCAtIDFdKSxcbiAgICAgICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnX291dCA9ICcgKyBkZWZhdWx0VmFsdWUgKyAnXFxuJztcblxuICAgIC8vY29uc29sZS5sb2coICdkZWZhdWx0VmFsdWU6JywgZGVmYXVsdFZhbHVlIClcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29uZGl0aW9uYWxzLmxlbmd0aCAtIDI7IGkgKz0gMikge1xuICAgICAgdmFyIGlzRW5kQmxvY2sgPSBpID09PSBjb25kaXRpb25hbHMubGVuZ3RoIC0gMyxcbiAgICAgICAgICBjb25kID0gX2dlbi5nZXRJbnB1dChjb25kaXRpb25hbHNbaV0pLFxuICAgICAgICAgIHByZWJsb2NrID0gY29uZGl0aW9uYWxzW2kgKyAxXSxcbiAgICAgICAgICBibG9jayA9IHZvaWQgMCxcbiAgICAgICAgICBibG9ja05hbWUgPSB2b2lkIDAsXG4gICAgICAgICAgb3V0cHV0ID0gdm9pZCAwO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKCAncGInLCBwcmVibG9jayApXG5cbiAgICAgIGlmICh0eXBlb2YgcHJlYmxvY2sgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGJsb2NrID0gcHJlYmxvY2s7XG4gICAgICAgIGJsb2NrTmFtZSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoX2dlbi5tZW1vW3ByZWJsb2NrLm5hbWVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyB1c2VkIHRvIHBsYWNlIGFsbCBjb2RlIGRlcGVuZGVuY2llcyBpbiBhcHByb3ByaWF0ZSBibG9ja3NcbiAgICAgICAgICBfZ2VuLnN0YXJ0TG9jYWxpemUoKTtcblxuICAgICAgICAgIF9nZW4uZ2V0SW5wdXQocHJlYmxvY2spO1xuXG4gICAgICAgICAgYmxvY2sgPSBfZ2VuLmVuZExvY2FsaXplKCk7XG4gICAgICAgICAgYmxvY2tOYW1lID0gYmxvY2tbMF07XG4gICAgICAgICAgYmxvY2sgPSBibG9ja1sxXS5qb2luKCcnKTtcbiAgICAgICAgICBibG9jayA9ICcgICcgKyBibG9jay5yZXBsYWNlKC9cXG4vZ2ksICdcXG4gICcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJsb2NrID0gJyc7XG4gICAgICAgICAgYmxvY2tOYW1lID0gX2dlbi5tZW1vW3ByZWJsb2NrLm5hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG91dHB1dCA9IGJsb2NrTmFtZSA9PT0gbnVsbCA/ICcgICcgKyB0aGlzLm5hbWUgKyAnX291dCA9ICcgKyBibG9jayA6IGJsb2NrICsgJyAgJyArIHRoaXMubmFtZSArICdfb3V0ID0gJyArIGJsb2NrTmFtZTtcblxuICAgICAgaWYgKGkgPT09IDApIG91dCArPSAnICc7XG4gICAgICBvdXQgKz0gJyBpZiggJyArIGNvbmQgKyAnID09PSAxICkge1xcbicgKyBvdXRwdXQgKyAnXFxuICB9JztcblxuICAgICAgaWYgKCFpc0VuZEJsb2NrKSB7XG4gICAgICAgIG91dCArPSAnIGVsc2UnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0ICs9ICdcXG4nO1xuICAgICAgfVxuICAgICAgLyogICAgICAgICBcbiAgICAgICBlbHNlYFxuICAgICAgICAgICAgfWVsc2UgaWYoIGlzRW5kQmxvY2sgKSB7XG4gICAgICAgICAgICAgIG91dCArPSBge1xcbiAgJHtvdXRwdXR9XFxuICB9XFxuYFxuICAgICAgICAgICAgfWVsc2Uge1xuICAgICAgXG4gICAgICAgICAgICAgIC8vaWYoIGkgKyAyID09PSBjb25kaXRpb25hbHMubGVuZ3RoIHx8IGkgPT09IGNvbmRpdGlvbmFscy5sZW5ndGggLSAxICkge1xuICAgICAgICAgICAgICAvLyAgb3V0ICs9IGB7XFxuICAke291dHB1dH1cXG4gIH1cXG5gXG4gICAgICAgICAgICAgIC8vfWVsc2V7XG4gICAgICAgICAgICAgICAgb3V0ICs9IFxuICAgICAgYCBpZiggJHtjb25kfSA9PT0gMSApIHtcbiAgICAgICR7b3V0cHV0fVxuICAgICAgICB9IGVsc2UgYFxuICAgICAgICAgICAgICAvL31cbiAgICAgICAgICAgIH0qL1xuICAgIH1cblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lICsgJ19vdXQnO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUgKyAnX291dCcsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgY29uZGl0aW9ucyA9IEFycmF5LmlzQXJyYXkoYXJnc1swXSkgPyBhcmdzWzBdIDogYXJncztcblxuICBPYmplY3QuYXNzaWduKHVnZW4sIHtcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbY29uZGl0aW9uc11cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnaW4nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIF9nZW4ucGFyYW1ldGVycy5wdXNoKHRoaXMubmFtZSk7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiB0aGlzLm5hbWU7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgdmFyIGlucHV0ID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgaW5wdXQuaWQgPSBfZ2VuLmdldFVJRCgpO1xuICBpbnB1dC5uYW1lID0gbmFtZSAhPT0gdW5kZWZpbmVkID8gbmFtZSA6ICcnICsgaW5wdXQuYmFzZW5hbWUgKyBpbnB1dC5pZDtcbiAgaW5wdXRbMF0gPSB7XG4gICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICBpZiAoIV9nZW4ucGFyYW1ldGVycy5pbmNsdWRlcyhpbnB1dC5uYW1lKSkgX2dlbi5wYXJhbWV0ZXJzLnB1c2goaW5wdXQubmFtZSk7XG4gICAgICByZXR1cm4gaW5wdXQubmFtZSArICdbMF0nO1xuICAgIH1cbiAgfTtcbiAgaW5wdXRbMV0gPSB7XG4gICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICBpZiAoIV9nZW4ucGFyYW1ldGVycy5pbmNsdWRlcyhpbnB1dC5uYW1lKSkgX2dlbi5wYXJhbWV0ZXJzLnB1c2goaW5wdXQubmFtZSk7XG4gICAgICByZXR1cm4gaW5wdXQubmFtZSArICdbMV0nO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gaW5wdXQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGxpYnJhcnkgPSB7XG4gIGV4cG9ydDogZnVuY3Rpb24gX2V4cG9ydChkZXN0aW5hdGlvbikge1xuICAgIGlmIChkZXN0aW5hdGlvbiA9PT0gd2luZG93KSB7XG4gICAgICBkZXN0aW5hdGlvbi5zc2QgPSBsaWJyYXJ5Lmhpc3Rvcnk7IC8vIGhpc3RvcnkgaXMgd2luZG93IG9iamVjdCBwcm9wZXJ0eSwgc28gdXNlIHNzZCBhcyBhbGlhc1xuICAgICAgZGVzdGluYXRpb24uaW5wdXQgPSBsaWJyYXJ5LmluOyAvLyBpbiBpcyBhIGtleXdvcmQgaW4gamF2YXNjcmlwdFxuICAgICAgZGVzdGluYXRpb24udGVybmFyeSA9IGxpYnJhcnkuc3dpdGNoOyAvLyBzd2l0Y2ggaXMgYSBrZXl3b3JkIGluIGphdmFzY3JpcHRcblxuICAgICAgZGVsZXRlIGxpYnJhcnkuaGlzdG9yeTtcbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LmluO1xuICAgICAgZGVsZXRlIGxpYnJhcnkuc3dpdGNoO1xuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24oZGVzdGluYXRpb24sIGxpYnJhcnkpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGxpYnJhcnksICdzYW1wbGVyYXRlJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiBsaWJyYXJ5Lmdlbi5zYW1wbGVyYXRlO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24gc2V0KHYpIHt9XG4gICAgfSk7XG5cbiAgICBsaWJyYXJ5LmluID0gZGVzdGluYXRpb24uaW5wdXQ7XG4gICAgbGlicmFyeS5oaXN0b3J5ID0gZGVzdGluYXRpb24uc3NkO1xuICAgIGxpYnJhcnkuc3dpdGNoID0gZGVzdGluYXRpb24udGVybmFyeTtcblxuICAgIGRlc3RpbmF0aW9uLmNsaXAgPSBsaWJyYXJ5LmNsYW1wO1xuICB9LFxuXG5cbiAgZ2VuOiByZXF1aXJlKCcuL2dlbi5qcycpLFxuXG4gIGFiczogcmVxdWlyZSgnLi9hYnMuanMnKSxcbiAgcm91bmQ6IHJlcXVpcmUoJy4vcm91bmQuanMnKSxcbiAgcGFyYW06IHJlcXVpcmUoJy4vcGFyYW0uanMnKSxcbiAgYWRkOiByZXF1aXJlKCcuL2FkZC5qcycpLFxuICBzdWI6IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gIG11bDogcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgZGl2OiByZXF1aXJlKCcuL2Rpdi5qcycpLFxuICBhY2N1bTogcmVxdWlyZSgnLi9hY2N1bS5qcycpLFxuICBjb3VudGVyOiByZXF1aXJlKCcuL2NvdW50ZXIuanMnKSxcbiAgc2luOiByZXF1aXJlKCcuL3Npbi5qcycpLFxuICBjb3M6IHJlcXVpcmUoJy4vY29zLmpzJyksXG4gIHRhbjogcmVxdWlyZSgnLi90YW4uanMnKSxcbiAgdGFuaDogcmVxdWlyZSgnLi90YW5oLmpzJyksXG4gIGFzaW46IHJlcXVpcmUoJy4vYXNpbi5qcycpLFxuICBhY29zOiByZXF1aXJlKCcuL2Fjb3MuanMnKSxcbiAgYXRhbjogcmVxdWlyZSgnLi9hdGFuLmpzJyksXG4gIHBoYXNvcjogcmVxdWlyZSgnLi9waGFzb3IuanMnKSxcbiAgZGF0YTogcmVxdWlyZSgnLi9kYXRhLmpzJyksXG4gIHBlZWs6IHJlcXVpcmUoJy4vcGVlay5qcycpLFxuICBjeWNsZTogcmVxdWlyZSgnLi9jeWNsZS5qcycpLFxuICBoaXN0b3J5OiByZXF1aXJlKCcuL2hpc3RvcnkuanMnKSxcbiAgZGVsdGE6IHJlcXVpcmUoJy4vZGVsdGEuanMnKSxcbiAgZmxvb3I6IHJlcXVpcmUoJy4vZmxvb3IuanMnKSxcbiAgY2VpbDogcmVxdWlyZSgnLi9jZWlsLmpzJyksXG4gIG1pbjogcmVxdWlyZSgnLi9taW4uanMnKSxcbiAgbWF4OiByZXF1aXJlKCcuL21heC5qcycpLFxuICBzaWduOiByZXF1aXJlKCcuL3NpZ24uanMnKSxcbiAgZGNibG9jazogcmVxdWlyZSgnLi9kY2Jsb2NrLmpzJyksXG4gIG1lbW86IHJlcXVpcmUoJy4vbWVtby5qcycpLFxuICByYXRlOiByZXF1aXJlKCcuL3JhdGUuanMnKSxcbiAgd3JhcDogcmVxdWlyZSgnLi93cmFwLmpzJyksXG4gIG1peDogcmVxdWlyZSgnLi9taXguanMnKSxcbiAgY2xhbXA6IHJlcXVpcmUoJy4vY2xhbXAuanMnKSxcbiAgcG9rZTogcmVxdWlyZSgnLi9wb2tlLmpzJyksXG4gIGRlbGF5OiByZXF1aXJlKCcuL2RlbGF5LmpzJyksXG4gIGZvbGQ6IHJlcXVpcmUoJy4vZm9sZC5qcycpLFxuICBtb2Q6IHJlcXVpcmUoJy4vbW9kLmpzJyksXG4gIHNhaDogcmVxdWlyZSgnLi9zYWguanMnKSxcbiAgbm9pc2U6IHJlcXVpcmUoJy4vbm9pc2UuanMnKSxcbiAgbm90OiByZXF1aXJlKCcuL25vdC5qcycpLFxuICBndDogcmVxdWlyZSgnLi9ndC5qcycpLFxuICBndGU6IHJlcXVpcmUoJy4vZ3RlLmpzJyksXG4gIGx0OiByZXF1aXJlKCcuL2x0LmpzJyksXG4gIGx0ZTogcmVxdWlyZSgnLi9sdGUuanMnKSxcbiAgYm9vbDogcmVxdWlyZSgnLi9ib29sLmpzJyksXG4gIGdhdGU6IHJlcXVpcmUoJy4vZ2F0ZS5qcycpLFxuICB0cmFpbjogcmVxdWlyZSgnLi90cmFpbi5qcycpLFxuICBzbGlkZTogcmVxdWlyZSgnLi9zbGlkZS5qcycpLFxuICBpbjogcmVxdWlyZSgnLi9pbi5qcycpLFxuICB0NjA6IHJlcXVpcmUoJy4vdDYwLmpzJyksXG4gIG10b2Y6IHJlcXVpcmUoJy4vbXRvZi5qcycpLFxuICBsdHA6IHJlcXVpcmUoJy4vbHRwLmpzJyksIC8vIFRPRE86IHRlc3RcbiAgZ3RwOiByZXF1aXJlKCcuL2d0cC5qcycpLCAvLyBUT0RPOiB0ZXN0XG4gIHN3aXRjaDogcmVxdWlyZSgnLi9zd2l0Y2guanMnKSxcbiAgbXN0b3NhbXBzOiByZXF1aXJlKCcuL21zdG9zYW1wcy5qcycpLCAvLyBUT0RPOiBuZWVkcyB0ZXN0LFxuICBzZWxlY3RvcjogcmVxdWlyZSgnLi9zZWxlY3Rvci5qcycpLFxuICB1dGlsaXRpZXM6IHJlcXVpcmUoJy4vdXRpbGl0aWVzLmpzJyksXG4gIHBvdzogcmVxdWlyZSgnLi9wb3cuanMnKSxcbiAgYXR0YWNrOiByZXF1aXJlKCcuL2F0dGFjay5qcycpLFxuICBkZWNheTogcmVxdWlyZSgnLi9kZWNheS5qcycpLFxuICB3aW5kb3dzOiByZXF1aXJlKCcuL3dpbmRvd3MuanMnKSxcbiAgZW52OiByZXF1aXJlKCcuL2Vudi5qcycpLFxuICBhZDogcmVxdWlyZSgnLi9hZC5qcycpLFxuICBhZHNyOiByZXF1aXJlKCcuL2Fkc3IuanMnKSxcbiAgaWZlbHNlOiByZXF1aXJlKCcuL2lmZWxzZWlmLmpzJyksXG4gIGJhbmc6IHJlcXVpcmUoJy4vYmFuZy5qcycpLFxuICBhbmQ6IHJlcXVpcmUoJy4vYW5kLmpzJyksXG4gIHBhbjogcmVxdWlyZSgnLi9wYW4uanMnKSxcbiAgZXE6IHJlcXVpcmUoJy4vZXEuanMnKSxcbiAgbmVxOiByZXF1aXJlKCcuL25lcS5qcycpXG59O1xuXG5saWJyYXJ5Lmdlbi5saWIgPSBsaWJyYXJ5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxpYnJhcnk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2x0JyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICc7XG5cbiAgICBpZiAoaXNOYU4odGhpcy5pbnB1dHNbMF0pIHx8IGlzTmFOKHRoaXMuaW5wdXRzWzFdKSkge1xuICAgICAgb3V0ICs9ICcoKCAnICsgaW5wdXRzWzBdICsgJyA8ICcgKyBpbnB1dHNbMV0gKyAnKSB8IDAgICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdIDwgaW5wdXRzWzFdID8gMSA6IDA7XG4gICAgfVxuICAgIG91dCArPSAnXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF07XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIHZhciBsdCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIGx0LmlucHV0cyA9IFt4LCB5XTtcbiAgbHQubmFtZSA9ICdsdCcgKyBfZ2VuLmdldFVJRCgpO1xuXG4gIHJldHVybiBsdDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ2x0ZScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnO1xuXG4gICAgaWYgKGlzTmFOKHRoaXMuaW5wdXRzWzBdKSB8fCBpc05hTih0aGlzLmlucHV0c1sxXSkpIHtcbiAgICAgIG91dCArPSAnKCAnICsgaW5wdXRzWzBdICsgJyA8PSAnICsgaW5wdXRzWzFdICsgJyB8IDAgICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdIDw9IGlucHV0c1sxXSA/IDEgOiAwO1xuICAgIH1cbiAgICBvdXQgKz0gJ1xcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdO1xuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgbHQgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBsdC5pbnB1dHMgPSBbeCwgeV07XG4gIGx0Lm5hbWUgPSAnbHRlJyArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgcmV0dXJuIGx0O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnbHRwJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTih0aGlzLmlucHV0c1swXSkgfHwgaXNOYU4odGhpcy5pbnB1dHNbMV0pKSB7XG4gICAgICBvdXQgPSAnKCcgKyBpbnB1dHNbMF0gKyAnICogKCggJyArIGlucHV0c1swXSArICcgPCAnICsgaW5wdXRzWzFdICsgJyApIHwgMCApICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gKiAoaW5wdXRzWzBdIDwgaW5wdXRzWzFdIHwgMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgbHRwID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbHRwLmlucHV0cyA9IFt4LCB5XTtcblxuICByZXR1cm4gbHRwO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnbWF4JyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pIHx8IGlzTmFOKGlucHV0c1sxXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCBNYXRoLm1heCkpO1xuXG4gICAgICBvdXQgPSAnZ2VuLm1heCggJyArIGlucHV0c1swXSArICcsICcgKyBpbnB1dHNbMV0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLm1heChwYXJzZUZsb2F0KGlucHV0c1swXSksIHBhcnNlRmxvYXQoaW5wdXRzWzFdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCwgeSkge1xuICB2YXIgbWF4ID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbWF4LmlucHV0cyA9IFt4LCB5XTtcblxuICByZXR1cm4gbWF4O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ21lbW8nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJyArIGlucHV0c1swXSArICdcXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xLCBtZW1vTmFtZSkge1xuICB2YXIgbWVtbyA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIG1lbW8uaW5wdXRzID0gW2luMV07XG4gIG1lbW8uaWQgPSBfZ2VuLmdldFVJRCgpO1xuICBtZW1vLm5hbWUgPSBtZW1vTmFtZSAhPT0gdW5kZWZpbmVkID8gbWVtb05hbWUgKyAnXycgKyBfZ2VuLmdldFVJRCgpIDogJycgKyBtZW1vLmJhc2VuYW1lICsgbWVtby5pZDtcblxuICByZXR1cm4gbWVtbztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ21pbicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSB8fCBpc05hTihpbnB1dHNbMV0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZChfZGVmaW5lUHJvcGVydHkoe30sIHRoaXMubmFtZSwgTWF0aC5taW4pKTtcblxuICAgICAgb3V0ID0gJ2dlbi5taW4oICcgKyBpbnB1dHNbMF0gKyAnLCAnICsgaW5wdXRzWzFdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5taW4ocGFyc2VGbG9hdChpbnB1dHNbMF0pLCBwYXJzZUZsb2F0KGlucHV0c1sxXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIG1pbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIG1pbi5pbnB1dHMgPSBbeCwgeV07XG5cbiAgcmV0dXJuIG1pbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBhZGQgPSByZXF1aXJlKCcuL2FkZC5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSwgaW4yKSB7XG4gICAgdmFyIHQgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IC41O1xuXG4gICAgdmFyIHVnZW4gPSBtZW1vKGFkZChtdWwoaW4xLCBzdWIoMSwgdCkpLCBtdWwoaW4yLCB0KSkpO1xuICAgIHVnZW4ubmFtZSA9ICdtaXgnICsgZ2VuLmdldFVJRCgpO1xuXG4gICAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgdmFyIG1vZCA9IHtcbiAgICBpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgICBvdXQgPSAnKCcsXG4gICAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbMF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKGxhc3ROdW1iZXIpLFxuICAgICAgICAgIG1vZEF0RW5kID0gZmFsc2U7XG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICAgIGlmIChpID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGlzTnVtYmVyVWdlbiA9IGlzTmFOKHYpLFxuICAgICAgICAgICAgaXNGaW5hbElkeCA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxO1xuXG4gICAgICAgIGlmICghbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgJSB2O1xuICAgICAgICAgIG91dCArPSBsYXN0TnVtYmVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG91dCArPSBsYXN0TnVtYmVyICsgJyAlICcgKyB2O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpc0ZpbmFsSWR4KSBvdXQgKz0gJyAlICc7XG4gICAgICB9KTtcblxuICAgICAgb3V0ICs9ICcpJztcblxuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIG1vZDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdtc3Rvc2FtcHMnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IHZvaWQgMDtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnICsgX2dlbi5zYW1wbGVyYXRlICsgJyAvIDEwMDAgKiAnICsgaW5wdXRzWzBdICsgJyBcXG5cXG4nO1xuXG4gICAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IG91dDtcblxuICAgICAgcmV0dXJuVmFsdWUgPSBbdGhpcy5uYW1lLCBvdXRdO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBfZ2VuLnNhbXBsZXJhdGUgLyAxMDAwICogdGhpcy5pbnB1dHNbMF07XG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0O1xuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgbXN0b3NhbXBzID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgbXN0b3NhbXBzLmlucHV0cyA9IFt4XTtcbiAgbXN0b3NhbXBzLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgcmV0dXJuIG1zdG9zYW1wcztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ210b2YnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKF9kZWZpbmVQcm9wZXJ0eSh7fSwgdGhpcy5uYW1lLCBNYXRoLmV4cCkpO1xuXG4gICAgICBvdXQgPSAnKCAnICsgdGhpcy50dW5pbmcgKyAnICogZ2VuLmV4cCggLjA1Nzc2MjI2NSAqICgnICsgaW5wdXRzWzBdICsgJyAtIDY5KSApICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSB0aGlzLnR1bmluZyAqIE1hdGguZXhwKC4wNTc3NjIyNjUgKiAoaW5wdXRzWzBdIC0gNjkpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCBwcm9wcykge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgZGVmYXVsdHMgPSB7IHR1bmluZzogNDQwIH07XG5cbiAgaWYgKHByb3BzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24ocHJvcHMuZGVmYXVsdHMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwgZGVmYXVsdHMpO1xuICB1Z2VuLmlucHV0cyA9IFt4XTtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICB2YXIgbXVsID0ge1xuICAgIGlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgICAgdmFyIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICAgIG91dCA9ICcoJyxcbiAgICAgICAgICBzdW0gPSAxLFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBtdWxBdEVuZCA9IGZhbHNlLFxuICAgICAgICAgIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZTtcblxuICAgICAgaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgICAgaWYgKGlzTmFOKHYpKSB7XG4gICAgICAgICAgb3V0ICs9IHY7XG4gICAgICAgICAgaWYgKGkgPCBpbnB1dHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgbXVsQXRFbmQgPSB0cnVlO1xuICAgICAgICAgICAgb3V0ICs9ICcgKiAnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICBzdW0gPSB2O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdW0gKj0gcGFyc2VGbG9hdCh2KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbnVtQ291bnQrKztcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChhbHJlYWR5RnVsbFN1bW1lZCkgb3V0ID0gJyc7XG5cbiAgICAgIGlmIChudW1Db3VudCA+IDApIHtcbiAgICAgICAgb3V0ICs9IG11bEF0RW5kIHx8IGFscmVhZHlGdWxsU3VtbWVkID8gc3VtIDogJyAqICcgKyBzdW07XG4gICAgICB9XG5cbiAgICAgIGlmICghYWxyZWFkeUZ1bGxTdW1tZWQpIG91dCArPSAnKSc7XG5cbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBtdWw7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnbmVxJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIG91dCA9IC8qdGhpcy5pbnB1dHNbMF0gIT09IHRoaXMuaW5wdXRzWzFdID8gMSA6Ki8nICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAoJyArIGlucHV0c1swXSArICcgIT09ICcgKyBpbnB1dHNbMV0gKyAnKSB8IDBcXG5cXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWU7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xLCBpbjIpIHtcbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMSwgaW4yXVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgbmFtZTogJ25vaXNlJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwO1xuXG4gICAgX2dlbi5jbG9zdXJlcy5hZGQoeyAnbm9pc2UnOiBNYXRoLnJhbmRvbSB9KTtcblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9IGdlbi5ub2lzZSgpXFxuJztcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIG5vaXNlID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG4gIG5vaXNlLm5hbWUgPSBwcm90by5uYW1lICsgX2dlbi5nZXRVSUQoKTtcblxuICByZXR1cm4gbm9pc2U7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdub3QnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKHRoaXMuaW5wdXRzWzBdKSkge1xuICAgICAgb3V0ID0gJyggJyArIGlucHV0c1swXSArICcgPT09IDAgPyAxIDogMCApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gIWlucHV0c1swXSA9PT0gMCA/IDEgOiAwO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIG5vdCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIG5vdC5pbnB1dHMgPSBbeF07XG5cbiAgcmV0dXJuIG5vdDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBkYXRhID0gcmVxdWlyZSgnLi9kYXRhLmpzJyksXG4gICAgcGVlayA9IHJlcXVpcmUoJy4vcGVlay5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdwYW4nLFxuICBpbml0VGFibGU6IGZ1bmN0aW9uIGluaXRUYWJsZSgpIHtcbiAgICB2YXIgYnVmZmVyTCA9IG5ldyBGbG9hdDMyQXJyYXkoMTAyNCksXG4gICAgICAgIGJ1ZmZlclIgPSBuZXcgRmxvYXQzMkFycmF5KDEwMjQpO1xuXG4gICAgdmFyIHNxcnRUd29PdmVyVHdvID0gTWF0aC5zcXJ0KDIpIC8gMjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTAyNDsgaSsrKSB7XG4gICAgICB2YXIgcGFuID0gLTEgKyBpIC8gMTAyNCAqIDI7XG4gICAgICBidWZmZXJMW2ldID0gc3FydFR3b092ZXJUd28gKiAoTWF0aC5jb3MocGFuKSAtIE1hdGguc2luKHBhbikpO1xuICAgICAgYnVmZmVyUltpXSA9IHNxcnRUd29PdmVyVHdvICogKE1hdGguY29zKHBhbikgKyBNYXRoLnNpbihwYW4pKTtcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5wYW5MID0gZGF0YShidWZmZXJMLCAxLCB7IGltbXV0YWJsZTogdHJ1ZSB9KTtcbiAgICBnZW4uZ2xvYmFscy5wYW5SID0gZGF0YShidWZmZXJSLCAxLCB7IGltbXV0YWJsZTogdHJ1ZSB9KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGVmdElucHV0LCByaWdodElucHV0KSB7XG4gIHZhciBwYW4gPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IC41O1xuICB2YXIgcHJvcGVydGllcyA9IGFyZ3VtZW50c1szXTtcblxuICBpZiAoZ2VuLmdsb2JhbHMucGFuTCA9PT0gdW5kZWZpbmVkKSBwcm90by5pbml0VGFibGUoKTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIHVpZDogZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2xlZnRJbnB1dCwgcmlnaHRJbnB1dF0sXG4gICAgbGVmdDogbXVsKGxlZnRJbnB1dCwgcGVlayhnZW4uZ2xvYmFscy5wYW5MLCBwYW4sIHsgYm91bmRtb2RlOiAnY2xhbXAnIH0pKSxcbiAgICByaWdodDogbXVsKHJpZ2h0SW5wdXQsIHBlZWsoZ2VuLmdsb2JhbHMucGFuUiwgcGFuLCB7IGJvdW5kbW9kZTogJ2NsYW1wJyB9KSlcbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncGFyYW0nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIF9nZW4ucmVxdWVzdE1lbW9yeSh0aGlzLm1lbW9yeSk7XG5cbiAgICBfZ2VuLnBhcmFtcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIHRoaXMpKTtcblxuICAgIHRoaXMudmFsdWUgPSB0aGlzLmluaXRpYWxWYWx1ZTtcblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gJ21lbW9yeVsnICsgdGhpcy5tZW1vcnkudmFsdWUuaWR4ICsgJ10nO1xuXG4gICAgcmV0dXJuIF9nZW4ubWVtb1t0aGlzLm5hbWVdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHByb3BOYW1lID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAwO1xuICB2YXIgdmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDA7XG5cbiAgdmFyIHVnZW4gPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcblxuICBpZiAodHlwZW9mIHByb3BOYW1lICE9PSAnc3RyaW5nJykge1xuICAgIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyBfZ2VuLmdldFVJRCgpO1xuICAgIHVnZW4uaW5pdGlhbFZhbHVlID0gcHJvcE5hbWU7XG4gIH0gZWxzZSB7XG4gICAgdWdlbi5uYW1lID0gcHJvcE5hbWU7XG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICBpZiAodGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBfZ2VuLm1lbW9yeS5oZWFwW3RoaXMubWVtb3J5LnZhbHVlLmlkeF07XG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2KSB7XG4gICAgICBpZiAodGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsKSB7XG4gICAgICAgIF9nZW4ubWVtb3J5LmhlYXBbdGhpcy5tZW1vcnkudmFsdWUuaWR4XSA9IHY7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6IDEsIGlkeDogbnVsbCB9XG4gIH07XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncGVlaycsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGZ1bmN0aW9uQm9keSA9IHZvaWQgMCxcbiAgICAgICAgbmV4dCA9IHZvaWQgMCxcbiAgICAgICAgbGVuZ3RoSXNMb2cyID0gdm9pZCAwLFxuICAgICAgICBpZHggPSB2b2lkIDA7XG5cbiAgICBpZHggPSBpbnB1dHNbMV07XG4gICAgbGVuZ3RoSXNMb2cyID0gKE1hdGgubG9nMih0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCkgfCAwKSA9PT0gTWF0aC5sb2cyKHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoKTtcblxuICAgIGlmICh0aGlzLm1vZGUgIT09ICdzaW1wbGUnKSB7XG5cbiAgICAgIGZ1bmN0aW9uQm9keSA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJ19kYXRhSWR4ICA9ICcgKyBpZHggKyAnLCBcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19waGFzZSA9ICcgKyAodGhpcy5tb2RlID09PSAnc2FtcGxlcycgPyBpbnB1dHNbMF0gOiBpbnB1dHNbMF0gKyAnICogJyArICh0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDEpKSArICcsIFxcbiAgICAgICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4ID0gJyArIHRoaXMubmFtZSArICdfcGhhc2UgfCAwLFxcbic7XG5cbiAgICAgIGlmICh0aGlzLmJvdW5kbW9kZSA9PT0gJ3dyYXAnKSB7XG4gICAgICAgIG5leHQgPSBsZW5ndGhJc0xvZzIgPyAnKCAnICsgdGhpcy5uYW1lICsgJ19pbmRleCArIDEgKSAmICgnICsgdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKyAnIC0gMSknIDogdGhpcy5uYW1lICsgJ19pbmRleCArIDEgPj0gJyArIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoICsgJyA/ICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4ICsgMSAtICcgKyB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCArICcgOiAnICsgdGhpcy5uYW1lICsgJ19pbmRleCArIDEnO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmJvdW5kbW9kZSA9PT0gJ2NsYW1wJykge1xuICAgICAgICBuZXh0ID0gdGhpcy5uYW1lICsgJ19pbmRleCArIDEgPj0gJyArICh0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDEpICsgJyA/ICcgKyAodGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxKSArICcgOiAnICsgdGhpcy5uYW1lICsgJ19pbmRleCArIDEnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dCA9IHRoaXMubmFtZSArICdfaW5kZXggKyAxJztcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaW50ZXJwID09PSAnbGluZWFyJykge1xuICAgICAgICBmdW5jdGlvbkJvZHkgKz0gJyAgICAgICcgKyB0aGlzLm5hbWUgKyAnX2ZyYWMgID0gJyArIHRoaXMubmFtZSArICdfcGhhc2UgLSAnICsgdGhpcy5uYW1lICsgJ19pbmRleCxcXG4gICAgICAnICsgdGhpcy5uYW1lICsgJ19iYXNlICA9IG1lbW9yeVsgJyArIHRoaXMubmFtZSArICdfZGF0YUlkeCArICAnICsgdGhpcy5uYW1lICsgJ19pbmRleCBdLFxcbiAgICAgICcgKyB0aGlzLm5hbWUgKyAnX25leHQgID0gJyArIG5leHQgKyAnLCc7XG5cbiAgICAgICAgaWYgKHRoaXMuYm91bmRtb2RlID09PSAnaWdub3JlJykge1xuICAgICAgICAgIGZ1bmN0aW9uQm9keSArPSAnXFxuICAgICAgJyArIHRoaXMubmFtZSArICdfb3V0ICAgPSAnICsgdGhpcy5uYW1lICsgJ19pbmRleCA+PSAnICsgKHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMSkgKyAnIHx8ICcgKyB0aGlzLm5hbWUgKyAnX2luZGV4IDwgMCA/IDAgOiAnICsgdGhpcy5uYW1lICsgJ19iYXNlICsgJyArIHRoaXMubmFtZSArICdfZnJhYyAqICggbWVtb3J5WyAnICsgdGhpcy5uYW1lICsgJ19kYXRhSWR4ICsgJyArIHRoaXMubmFtZSArICdfbmV4dCBdIC0gJyArIHRoaXMubmFtZSArICdfYmFzZSApXFxuXFxuJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmdW5jdGlvbkJvZHkgKz0gJ1xcbiAgICAgICcgKyB0aGlzLm5hbWUgKyAnX291dCAgID0gJyArIHRoaXMubmFtZSArICdfYmFzZSArICcgKyB0aGlzLm5hbWUgKyAnX2ZyYWMgKiAoIG1lbW9yeVsgJyArIHRoaXMubmFtZSArICdfZGF0YUlkeCArICcgKyB0aGlzLm5hbWUgKyAnX25leHQgXSAtICcgKyB0aGlzLm5hbWUgKyAnX2Jhc2UgKVxcblxcbic7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSAnICAgICAgJyArIHRoaXMubmFtZSArICdfb3V0ID0gbWVtb3J5WyAnICsgdGhpcy5uYW1lICsgJ19kYXRhSWR4ICsgJyArIHRoaXMubmFtZSArICdfaW5kZXggXVxcblxcbic7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG1vZGUgaXMgc2ltcGxlXG4gICAgICBmdW5jdGlvbkJvZHkgPSAnbWVtb3J5WyAnICsgaWR4ICsgJyArICcgKyBpbnB1dHNbMF0gKyAnIF0nO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb25Cb2R5O1xuICAgIH1cblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lICsgJ19vdXQnO1xuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUgKyAnX291dCcsIGZ1bmN0aW9uQm9keV07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRhdGEsIGluZGV4LCBwcm9wZXJ0aWVzKSB7XG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBkZWZhdWx0cyA9IHsgY2hhbm5lbHM6IDEsIG1vZGU6ICdwaGFzZScsIGludGVycDogJ2xpbmVhcicsIGJvdW5kbW9kZTogJ3dyYXAnIH07XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgcHJvcGVydGllcyk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgZGF0YTogZGF0YSxcbiAgICBkYXRhTmFtZTogZGF0YS5uYW1lLFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbmRleCwgZGF0YV1cbiAgfSwgZGVmYXVsdHMpO1xuXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoJy4vYWNjdW0uanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHByb3RvID0geyBiYXNlbmFtZTogJ3BoYXNvcicgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmcmVxdWVuY3kgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDE7XG4gIHZhciByZXNldCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgdmFyIHByb3BzID0gYXJndW1lbnRzWzJdO1xuXG4gIGlmIChwcm9wcyA9PT0gdW5kZWZpbmVkKSBwcm9wcyA9IHsgbWluOiAtMSB9O1xuXG4gIHZhciByYW5nZSA9IChwcm9wcy5tYXggfHwgMSkgLSBwcm9wcy5taW47XG5cbiAgdmFyIHVnZW4gPSB0eXBlb2YgZnJlcXVlbmN5ID09PSAnbnVtYmVyJyA/IGFjY3VtKGZyZXF1ZW5jeSAqIHJhbmdlIC8gZ2VuLnNhbXBsZXJhdGUsIHJlc2V0LCBwcm9wcykgOiBhY2N1bShtdWwoZnJlcXVlbmN5LCAxIC8gZ2VuLnNhbXBsZXJhdGUgLyAoMSAvIHJhbmdlKSksIHJlc2V0LCBwcm9wcyk7XG5cbiAgdWdlbi5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKCk7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgd3JhcCA9IHJlcXVpcmUoJy4vd3JhcC5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncG9rZScsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGRhdGFOYW1lID0gJ21lbW9yeScsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBpZHggPSB2b2lkIDAsXG4gICAgICAgIG91dCA9IHZvaWQgMCxcbiAgICAgICAgd3JhcHBlZCA9IHZvaWQgMDtcblxuICAgIGlkeCA9IHRoaXMuZGF0YS5nZW5cblxuICAgIC8vZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICAvL3dyYXBwZWQgPSB3cmFwKCB0aGlzLmlucHV0c1sxXSwgMCwgdGhpcy5kYXRhTGVuZ3RoICkuZ2VuKClcbiAgICAvL2lkeCA9IHdyYXBwZWRbMF1cbiAgICAvL2dlbi5mdW5jdGlvbkJvZHkgKz0gd3JhcHBlZFsxXVxuICAgICgpO3ZhciBvdXRwdXRTdHIgPSB0aGlzLmlucHV0c1sxXSA9PT0gMCA/ICcgICcgKyBkYXRhTmFtZSArICdbICcgKyBpZHggKyAnIF0gPSAnICsgaW5wdXRzWzBdICsgJ1xcbicgOiAnICAnICsgZGF0YU5hbWUgKyAnWyAnICsgaWR4ICsgJyArICcgKyBpbnB1dHNbMV0gKyAnIF0gPSAnICsgaW5wdXRzWzBdICsgJ1xcbic7XG5cbiAgICBpZiAodGhpcy5pbmxpbmUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgX2dlbi5mdW5jdGlvbkJvZHkgKz0gb3V0cHV0U3RyO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW3RoaXMuaW5saW5lLCBvdXRwdXRTdHJdO1xuICAgIH1cbiAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRhdGEsIHZhbHVlLCBpbmRleCwgcHJvcGVydGllcykge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pLFxuICAgICAgZGVmYXVsdHMgPSB7IGNoYW5uZWxzOiAxIH07XG5cbiAgaWYgKHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgcHJvcGVydGllcyk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgZGF0YTogZGF0YSxcbiAgICBkYXRhTmFtZTogZGF0YS5uYW1lLFxuICAgIGRhdGFMZW5ndGg6IGRhdGEuYnVmZmVyLmxlbmd0aCxcbiAgICB1aWQ6IF9nZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbdmFsdWUsIGluZGV4XVxuICB9LCBkZWZhdWx0cyk7XG5cbiAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIF9nZW4uaGlzdG9yaWVzLnNldCh1Z2VuLm5hbWUsIHVnZW4pO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3BvdycsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSB8fCBpc05hTihpbnB1dHNbMV0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICdwb3cnOiBNYXRoLnBvdyB9KTtcblxuICAgICAgb3V0ID0gJ2dlbi5wb3coICcgKyBpbnB1dHNbMF0gKyAnLCAnICsgaW5wdXRzWzFdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBpbnB1dHNbMF0gPT09ICdzdHJpbmcnICYmIGlucHV0c1swXVswXSA9PT0gJygnKSB7XG4gICAgICAgIGlucHV0c1swXSA9IGlucHV0c1swXS5zbGljZSgxLCAtMSk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGlucHV0c1sxXSA9PT0gJ3N0cmluZycgJiYgaW5wdXRzWzFdWzBdID09PSAnKCcpIHtcbiAgICAgICAgaW5wdXRzWzFdID0gaW5wdXRzWzFdLnNsaWNlKDEsIC0xKTtcbiAgICAgIH1cblxuICAgICAgb3V0ID0gTWF0aC5wb3cocGFyc2VGbG9hdChpbnB1dHNbMF0pLCBwYXJzZUZsb2F0KGlucHV0c1sxXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgdmFyIHBvdyA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIHBvdy5pbnB1dHMgPSBbeCwgeV07XG4gIHBvdy5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIHBvdy5uYW1lID0gcG93LmJhc2VuYW1lICsgJ3twb3cuaWR9JztcblxuICByZXR1cm4gcG93O1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSgnLi9oaXN0b3J5LmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBhZGQgPSByZXF1aXJlKCcuL2FkZC5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpLFxuICAgIGRlbHRhID0gcmVxdWlyZSgnLi9kZWx0YS5qcycpLFxuICAgIHdyYXAgPSByZXF1aXJlKCcuL3dyYXAuanMnKTtcblxudmFyIHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3JhdGUnLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgcGhhc2UgPSBoaXN0b3J5KCksXG4gICAgICAgIGluTWludXMxID0gaGlzdG9yeSgpLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmaWx0ZXIgPSB2b2lkIDAsXG4gICAgICAgIHN1bSA9IHZvaWQgMCxcbiAgICAgICAgb3V0ID0gdm9pZCAwO1xuXG4gICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIHRoaXMpKTtcblxuICAgIG91dCA9ICcgdmFyICcgKyB0aGlzLm5hbWUgKyAnX2RpZmYgPSAnICsgaW5wdXRzWzBdICsgJyAtICcgKyBnZW5OYW1lICsgJy5sYXN0U2FtcGxlXFxuICBpZiggJyArIHRoaXMubmFtZSArICdfZGlmZiA8IC0uNSApICcgKyB0aGlzLm5hbWUgKyAnX2RpZmYgKz0gMVxcbiAgJyArIGdlbk5hbWUgKyAnLnBoYXNlICs9ICcgKyB0aGlzLm5hbWUgKyAnX2RpZmYgKiAnICsgaW5wdXRzWzFdICsgJ1xcbiAgaWYoICcgKyBnZW5OYW1lICsgJy5waGFzZSA+IDEgKSAnICsgZ2VuTmFtZSArICcucGhhc2UgLT0gMVxcbiAgJyArIGdlbk5hbWUgKyAnLmxhc3RTYW1wbGUgPSAnICsgaW5wdXRzWzBdICsgJ1xcbic7XG4gICAgb3V0ID0gJyAnICsgb3V0O1xuXG4gICAgcmV0dXJuIFtnZW5OYW1lICsgJy5waGFzZScsIG91dF07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluMSwgcmF0ZSkge1xuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIHBoYXNlOiAwLFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMSwgcmF0ZV1cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIG5hbWU6ICdyb3VuZCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIE1hdGgucm91bmQpKTtcblxuICAgICAgb3V0ID0gJ2dlbi5yb3VuZCggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgucm91bmQocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciByb3VuZCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIHJvdW5kLmlucHV0cyA9IFt4XTtcblxuICByZXR1cm4gcm91bmQ7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnc2FoJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIF9nZW4uZGF0YVt0aGlzLm5hbWVdID0gMDtcbiAgICBfZ2VuLmRhdGFbdGhpcy5uYW1lICsgJ19jb250cm9sJ10gPSAwO1xuXG4gICAgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICcgPSBnZW4uZGF0YS4nICsgdGhpcy5uYW1lICsgJ19jb250cm9sLFxcbiAgICAgICcgKyB0aGlzLm5hbWUgKyAnX3RyaWdnZXIgPSAnICsgaW5wdXRzWzFdICsgJyA+ICcgKyBpbnB1dHNbMl0gKyAnID8gMSA6IDBcXG5cXG4gIGlmKCAnICsgdGhpcy5uYW1lICsgJ190cmlnZ2VyICE9PSAnICsgdGhpcy5uYW1lICsgJyAgKSB7XFxuICAgIGlmKCAnICsgdGhpcy5uYW1lICsgJ190cmlnZ2VyID09PSAxICkgXFxuICAgICAgZ2VuLmRhdGEuJyArIHRoaXMubmFtZSArICcgPSAnICsgaW5wdXRzWzBdICsgJ1xcbiAgICBnZW4uZGF0YS4nICsgdGhpcy5uYW1lICsgJ19jb250cm9sID0gJyArIHRoaXMubmFtZSArICdfdHJpZ2dlclxcbiAgfVxcbic7XG5cbiAgICBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9ICdnZW4uZGF0YS4nICsgdGhpcy5uYW1lO1xuXG4gICAgcmV0dXJuIFsnZ2VuLmRhdGEuJyArIHRoaXMubmFtZSwgJyAnICsgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xLCBjb250cm9sKSB7XG4gIHZhciB0aHJlc2hvbGQgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IDA7XG4gIHZhciBwcm9wZXJ0aWVzID0gYXJndW1lbnRzWzNdO1xuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byksXG4gICAgICBkZWZhdWx0cyA9IHsgaW5pdDogMCB9O1xuXG4gIGlmIChwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIHByb3BlcnRpZXMpO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogW2luMSwgY29udHJvbCwgdGhyZXNob2xkXVxuICB9LCBkZWZhdWx0cyk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnc2VsZWN0b3InLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgb3V0ID0gdm9pZCAwLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IDA7XG5cbiAgICBzd2l0Y2ggKGlucHV0cy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBpbnB1dHNbMV07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICdfb3V0ID0gJyArIGlucHV0c1swXSArICcgPT09IDEgPyAnICsgaW5wdXRzWzFdICsgJyA6ICcgKyBpbnB1dHNbMl0gKyAnXFxuXFxuJztcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbdGhpcy5uYW1lICsgJ19vdXQnLCBvdXRdO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIG91dCA9ICcgdmFyICcgKyB0aGlzLm5hbWUgKyAnX291dCA9IDBcXG4gIHN3aXRjaCggJyArIGlucHV0c1swXSArICcgKyAxICkge1xcbic7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBvdXQgKz0gJyAgICBjYXNlICcgKyBpICsgJzogJyArIHRoaXMubmFtZSArICdfb3V0ID0gJyArIGlucHV0c1tpXSArICc7IGJyZWFrO1xcbic7XG4gICAgICAgIH1cblxuICAgICAgICBvdXQgKz0gJyAgfVxcblxcbic7XG5cbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbdGhpcy5uYW1lICsgJ19vdXQnLCAnICcgKyBvdXRdO1xuICAgIH1cblxuICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gdGhpcy5uYW1lICsgJ19vdXQnO1xuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGlucHV0cyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGlucHV0c1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgT2JqZWN0LmFzc2lnbih1Z2VuLCB7XG4gICAgdWlkOiBfZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogaW5wdXRzXG4gIH0pO1xuXG4gIHVnZW4ubmFtZSA9ICcnICsgdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkO1xuXG4gIHJldHVybiB1Z2VuO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBfZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKTtcblxudmFyIHByb3RvID0ge1xuICBuYW1lOiAnc2lnbicsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCB0aGlzLm5hbWUsIE1hdGguc2lnbikpO1xuXG4gICAgICBvdXQgPSAnZ2VuLnNpZ24oICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpZ24ocGFyc2VGbG9hdChpbnB1dHNbMF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHZhciBzaWduID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgc2lnbi5pbnB1dHMgPSBbeF07XG5cbiAgcmV0dXJuIHNpZ247XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnc2luJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKTtcblxuICAgIGlmIChpc05hTihpbnB1dHNbMF0pKSB7XG4gICAgICBfZ2VuLmNsb3N1cmVzLmFkZCh7ICdzaW4nOiBNYXRoLnNpbiB9KTtcblxuICAgICAgb3V0ID0gJ2dlbi5zaW4oICcgKyBpbnB1dHNbMF0gKyAnICknO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpbihwYXJzZUZsb2F0KGlucHV0c1swXSkpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHgpIHtcbiAgdmFyIHNpbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIHNpbi5pbnB1dHMgPSBbeF07XG4gIHNpbi5pZCA9IF9nZW4uZ2V0VUlEKCk7XG4gIHNpbi5uYW1lID0gc2luLmJhc2VuYW1lICsgJ3tzaW4uaWR9JztcblxuICByZXR1cm4gc2luO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCcuL2hpc3RvcnkuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJyksXG4gICAgZ3QgPSByZXF1aXJlKCcuL2d0LmpzJyksXG4gICAgZGl2ID0gcmVxdWlyZSgnLi9kaXYuanMnKSxcbiAgICBfc3dpdGNoID0gcmVxdWlyZSgnLi9zd2l0Y2guanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW4xKSB7XG4gICAgdmFyIHNsaWRlVXAgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDE7XG4gICAgdmFyIHNsaWRlRG93biA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMTtcblxuICAgIHZhciB5MSA9IGhpc3RvcnkoMCksXG4gICAgICAgIGZpbHRlciA9IHZvaWQgMCxcbiAgICAgICAgc2xpZGVBbW91bnQgPSB2b2lkIDA7XG5cbiAgICAvL3kgKG4pID0geSAobi0xKSArICgoeCAobikgLSB5IChuLTEpKS9zbGlkZSkgXG4gICAgc2xpZGVBbW91bnQgPSBfc3dpdGNoKGd0KGluMSwgeTEub3V0KSwgc2xpZGVVcCwgc2xpZGVEb3duKTtcblxuICAgIGZpbHRlciA9IG1lbW8oYWRkKHkxLm91dCwgZGl2KHN1YihpbjEsIHkxLm91dCksIHNsaWRlQW1vdW50KSkpO1xuXG4gICAgeTEuaW4oZmlsdGVyKTtcblxuICAgIHJldHVybiBmaWx0ZXI7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgdmFyIHN1YiA9IHtcbiAgICBpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICAgIHZhciBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgICBvdXQgPSAwLFxuICAgICAgICAgIGRpZmYgPSAwLFxuICAgICAgICAgIG5lZWRzUGFyZW5zID0gZmFsc2UsXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbMF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKGxhc3ROdW1iZXIpLFxuICAgICAgICAgIHN1YkF0RW5kID0gZmFsc2UsXG4gICAgICAgICAgaGFzVWdlbnMgPSBmYWxzZSxcbiAgICAgICAgICByZXR1cm5WYWx1ZSA9IDA7XG5cbiAgICAgIHRoaXMuaW5wdXRzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmIChpc05hTih2YWx1ZSkpIGhhc1VnZW5zID0gdHJ1ZTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoaGFzVWdlbnMpIHtcbiAgICAgICAgLy8gc3RvcmUgaW4gdmFyaWFibGUgZm9yIGZ1dHVyZSByZWZlcmVuY2VcbiAgICAgICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gKCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXQgPSAnKCc7XG4gICAgICB9XG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICAgIGlmIChpID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgdmFyIGlzTnVtYmVyVWdlbiA9IGlzTmFOKHYpLFxuICAgICAgICAgICAgaXNGaW5hbElkeCA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxO1xuXG4gICAgICAgIGlmICghbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgLSB2O1xuICAgICAgICAgIG91dCArPSBsYXN0TnVtYmVyO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZWVkc1BhcmVucyA9IHRydWU7XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXIgKyAnIC0gJyArIHY7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzRmluYWxJZHgpIG91dCArPSAnIC0gJztcbiAgICAgIH0pO1xuXG4gICAgICBpZiAobmVlZHNQYXJlbnMpIHtcbiAgICAgICAgb3V0ICs9ICcpJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dCA9IG91dC5zbGljZSgxIC8vIHJlbW92ZSBvcGVuaW5nIHBhcmVuXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGlmIChoYXNVZ2Vucykgb3V0ICs9ICdcXG4nO1xuXG4gICAgICByZXR1cm5WYWx1ZSA9IGhhc1VnZW5zID8gW3RoaXMubmFtZSwgb3V0XSA6IG91dDtcblxuICAgICAgaWYgKGhhc1VnZW5zKSBfZ2VuLm1lbW9bdGhpcy5uYW1lXSA9IHRoaXMubmFtZTtcblxuICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgIH1cbiAgfTtcblxuICBzdWIubmFtZSA9ICdzdWInICsgc3ViLmlkO1xuXG4gIHJldHVybiBzdWI7XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnc3dpdGNoJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyksXG4gICAgICAgIG91dCA9IHZvaWQgMDtcblxuICAgIGlmIChpbnB1dHNbMV0gPT09IGlucHV0c1syXSkgcmV0dXJuIGlucHV0c1sxXTsgLy8gaWYgYm90aCBwb3RlbnRpYWwgb3V0cHV0cyBhcmUgdGhlIHNhbWUganVzdCByZXR1cm4gb25lIG9mIHRoZW1cblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJ19vdXQgPSAnICsgaW5wdXRzWzBdICsgJyA9PT0gMSA/ICcgKyBpbnB1dHNbMV0gKyAnIDogJyArIGlucHV0c1syXSArICdcXG4nO1xuXG4gICAgX2dlbi5tZW1vW3RoaXMubmFtZV0gPSB0aGlzLm5hbWUgKyAnX291dCc7XG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSArICdfb3V0Jywgb3V0XTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29udHJvbCkge1xuICB2YXIgaW4xID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAxO1xuICB2YXIgaW4yID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAwO1xuXG4gIHZhciB1Z2VuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtjb250cm9sLCBpbjEsIGluMl1cbiAgfSk7XG5cbiAgdWdlbi5uYW1lID0gJycgKyB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWQ7XG5cbiAgcmV0dXJuIHVnZW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAndDYwJyxcblxuICBnZW46IGZ1bmN0aW9uIGdlbigpIHtcbiAgICB2YXIgb3V0ID0gdm9pZCAwLFxuICAgICAgICBpbnB1dHMgPSBfZ2VuLmdldElucHV0cyh0aGlzKSxcbiAgICAgICAgcmV0dXJuVmFsdWUgPSB2b2lkIDA7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoX2RlZmluZVByb3BlcnR5KHt9LCAnZXhwJywgTWF0aC5leHApKTtcblxuICAgICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gZ2VuLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gJyArIGlucHV0c1swXSArICcgKVxcblxcbic7XG5cbiAgICAgIF9nZW4ubWVtb1t0aGlzLm5hbWVdID0gb3V0O1xuXG4gICAgICByZXR1cm5WYWx1ZSA9IFt0aGlzLm5hbWUsIG91dF07XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguZXhwKC02LjkwNzc1NTI3ODkyMSAvIGlucHV0c1swXSk7XG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0O1xuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgdDYwID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgdDYwLmlucHV0cyA9IFt4XTtcbiAgdDYwLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIF9nZW4uZ2V0VUlEKCk7XG5cbiAgcmV0dXJuIHQ2MDtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2dlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyk7XG5cbnZhciBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICd0YW4nLFxuXG4gIGdlbjogZnVuY3Rpb24gZ2VuKCkge1xuICAgIHZhciBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpO1xuXG4gICAgaWYgKGlzTmFOKGlucHV0c1swXSkpIHtcbiAgICAgIF9nZW4uY2xvc3VyZXMuYWRkKHsgJ3Rhbic6IE1hdGgudGFuIH0pO1xuXG4gICAgICBvdXQgPSAnZ2VuLnRhbiggJyArIGlucHV0c1swXSArICcgKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgudGFuKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgdGFuID0gT2JqZWN0LmNyZWF0ZShwcm90byk7XG5cbiAgdGFuLmlucHV0cyA9IFt4XTtcbiAgdGFuLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgdGFuLm5hbWUgPSB0YW4uYmFzZW5hbWUgKyAne3Rhbi5pZH0nO1xuXG4gIHJldHVybiB0YW47XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAndGFuaCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIG91dCA9IHZvaWQgMCxcbiAgICAgICAgaW5wdXRzID0gX2dlbi5nZXRJbnB1dHModGhpcyk7XG5cbiAgICBpZiAoaXNOYU4oaW5wdXRzWzBdKSkge1xuICAgICAgX2dlbi5jbG9zdXJlcy5hZGQoeyAndGFuaCc6IE1hdGgudGFuaCB9KTtcblxuICAgICAgb3V0ID0gJ2dlbi50YW5oKCAnICsgaW5wdXRzWzBdICsgJyApJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW5oKHBhcnNlRmxvYXQoaW5wdXRzWzBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgdGFuaCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIHRhbmguaW5wdXRzID0gW3hdO1xuICB0YW5oLmlkID0gX2dlbi5nZXRVSUQoKTtcbiAgdGFuaC5uYW1lID0gdGFuaC5iYXNlbmFtZSArICd7dGFuaC5pZH0nO1xuXG4gIHJldHVybiB0YW5oO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGx0ID0gcmVxdWlyZSgnLi9sdC5qcycpLFxuICAgIHBoYXNvciA9IHJlcXVpcmUoJy4vcGhhc29yLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZnJlcXVlbmN5ID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiA0NDA7XG4gIHZhciBwdWxzZXdpZHRoID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAuNTtcblxuICB2YXIgZ3JhcGggPSBsdChhY2N1bShkaXYoZnJlcXVlbmN5LCA0NDEwMCkpLCAuNSk7XG5cbiAgZ3JhcGgubmFtZSA9ICd0cmFpbicgKyBnZW4uZ2V0VUlEKCk7XG5cbiAgcmV0dXJuIGdyYXBoO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEuanMnKTtcblxudmFyIGlzU3RlcmVvID0gZmFsc2U7XG5cbnZhciB1dGlsaXRpZXMgPSB7XG4gIGN0eDogbnVsbCxcblxuICBjbGVhcjogZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgdGhpcy5jYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH07XG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgICAgcmV0dXJuIHYoKTtcbiAgICB9KTtcbiAgICB0aGlzLmNsZWFyLmNhbGxiYWNrcy5sZW5ndGggPSAwO1xuICB9LFxuICBjcmVhdGVDb250ZXh0OiBmdW5jdGlvbiBjcmVhdGVDb250ZXh0KCkge1xuICAgIHZhciBBQyA9IHR5cGVvZiBBdWRpb0NvbnRleHQgPT09ICd1bmRlZmluZWQnID8gd2Via2l0QXVkaW9Db250ZXh0IDogQXVkaW9Db250ZXh0O1xuICAgIHRoaXMuY3R4ID0gbmV3IEFDKCk7XG4gICAgZ2VuLnNhbXBsZXJhdGUgPSB0aGlzLmN0eC5zYW1wbGVSYXRlO1xuXG4gICAgdmFyIHN0YXJ0ID0gZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICBpZiAodHlwZW9mIEFDICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgc3RhcnQpO1xuXG4gICAgICAgICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgICAgICAgLy8gcmVxdWlyZWQgdG8gc3RhcnQgYXVkaW8gdW5kZXIgaU9TIDZcbiAgICAgICAgICAgIHZhciBteVNvdXJjZSA9IHV0aWxpdGllcy5jdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICAgICAgICBteVNvdXJjZS5jb25uZWN0KHV0aWxpdGllcy5jdHguZGVzdGluYXRpb24pO1xuICAgICAgICAgICAgbXlTb3VyY2Uubm90ZU9uKDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBzdGFydCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGNyZWF0ZVNjcmlwdFByb2Nlc3NvcjogZnVuY3Rpb24gY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCkge1xuICAgIHRoaXMubm9kZSA9IHRoaXMuY3R4LmNyZWF0ZVNjcmlwdFByb2Nlc3NvcigxMDI0LCAwLCAyKSwgdGhpcy5jbGVhckZ1bmN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSwgdGhpcy5jYWxsYmFjayA9IHRoaXMuY2xlYXJGdW5jdGlvbjtcblxuICAgIHRoaXMubm9kZS5vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uIChhdWRpb1Byb2Nlc3NpbmdFdmVudCkge1xuICAgICAgdmFyIG91dHB1dEJ1ZmZlciA9IGF1ZGlvUHJvY2Vzc2luZ0V2ZW50Lm91dHB1dEJ1ZmZlcjtcblxuICAgICAgdmFyIGxlZnQgPSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCksXG4gICAgICAgICAgcmlnaHQgPSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMSk7XG5cbiAgICAgIGZvciAodmFyIHNhbXBsZSA9IDA7IHNhbXBsZSA8IGxlZnQubGVuZ3RoOyBzYW1wbGUrKykge1xuICAgICAgICBpZiAoIWlzU3RlcmVvKSB7XG4gICAgICAgICAgbGVmdFtzYW1wbGVdID0gcmlnaHRbc2FtcGxlXSA9IHV0aWxpdGllcy5jYWxsYmFjaygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBvdXQgPSB1dGlsaXRpZXMuY2FsbGJhY2soKTtcbiAgICAgICAgICBsZWZ0W3NhbXBsZV0gPSBvdXRbMF07XG4gICAgICAgICAgcmlnaHRbc2FtcGxlXSA9IG91dFsxXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm5vZGUuY29ubmVjdCh0aGlzLmN0eC5kZXN0aW5hdGlvblxuXG4gICAgLy90aGlzLm5vZGUuY29ubmVjdCggdGhpcy5hbmFseXplciApXG5cbiAgICApO3JldHVybiB0aGlzO1xuICB9LFxuICBwbGF5R3JhcGg6IGZ1bmN0aW9uIHBsYXlHcmFwaChncmFwaCwgZGVidWcpIHtcbiAgICB2YXIgbWVtID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiA0NDEwMCAqIDEwO1xuXG4gICAgdXRpbGl0aWVzLmNsZWFyKCk7XG4gICAgaWYgKGRlYnVnID09PSB1bmRlZmluZWQpIGRlYnVnID0gZmFsc2U7XG5cbiAgICBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoZ3JhcGgpO1xuXG4gICAgdXRpbGl0aWVzLmNhbGxiYWNrID0gZ2VuLmNyZWF0ZUNhbGxiYWNrKGdyYXBoLCBtZW0sIGRlYnVnKTtcblxuICAgIGlmICh1dGlsaXRpZXMuY29uc29sZSkgdXRpbGl0aWVzLmNvbnNvbGUuc2V0VmFsdWUodXRpbGl0aWVzLmNhbGxiYWNrLnRvU3RyaW5nKCkpO1xuXG4gICAgcmV0dXJuIHV0aWxpdGllcy5jYWxsYmFjaztcbiAgfSxcbiAgbG9hZFNhbXBsZTogZnVuY3Rpb24gbG9hZFNhbXBsZShzb3VuZEZpbGVQYXRoLCBkYXRhKSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHJlcS5vcGVuKCdHRVQnLCBzb3VuZEZpbGVQYXRoLCB0cnVlKTtcbiAgICByZXEucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcblxuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGF1ZGlvRGF0YSA9IHJlcS5yZXNwb25zZTtcblxuICAgICAgICB1dGlsaXRpZXMuY3R4LmRlY29kZUF1ZGlvRGF0YShhdWRpb0RhdGEsIGZ1bmN0aW9uIChidWZmZXIpIHtcbiAgICAgICAgICBkYXRhLmJ1ZmZlciA9IGJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKTtcbiAgICAgICAgICByZXNvbHZlKGRhdGEuYnVmZmVyKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgcmVxLnNlbmQoKTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG59O1xuXG51dGlsaXRpZXMuY2xlYXIuY2FsbGJhY2tzID0gW107XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbGl0aWVzOyIsIid1c2Ugc3RyaWN0JztcblxuLypcbiAqIG1hbnkgd2luZG93cyBoZXJlIGFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vY29yYmFuYnJvb2svZHNwLmpzL2Jsb2IvbWFzdGVyL2RzcC5qc1xuICogc3RhcnRpbmcgYXQgbGluZSAxNDI3XG4gKiB0YWtlbiA4LzE1LzE2XG4qL1xuXG52YXIgd2luZG93cyA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBiYXJ0bGV0dDogZnVuY3Rpb24gYmFydGxldHQobGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiAyIC8gKGxlbmd0aCAtIDEpICogKChsZW5ndGggLSAxKSAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKTtcbiAgfSxcbiAgYmFydGxldHRIYW5uOiBmdW5jdGlvbiBiYXJ0bGV0dEhhbm4obGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiAwLjYyIC0gMC40OCAqIE1hdGguYWJzKGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMC41KSAtIDAuMzggKiBNYXRoLmNvcygyICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKTtcbiAgfSxcbiAgYmxhY2ttYW46IGZ1bmN0aW9uIGJsYWNrbWFuKGxlbmd0aCwgaW5kZXgsIGFscGhhKSB7XG4gICAgdmFyIGEwID0gKDEgLSBhbHBoYSkgLyAyLFxuICAgICAgICBhMSA9IDAuNSxcbiAgICAgICAgYTIgPSBhbHBoYSAvIDI7XG5cbiAgICByZXR1cm4gYTAgLSBhMSAqIE1hdGguY29zKDIgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpICsgYTIgKiBNYXRoLmNvcyg0ICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKTtcbiAgfSxcbiAgY29zaW5lOiBmdW5jdGlvbiBjb3NpbmUobGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiBNYXRoLmNvcyhNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSBNYXRoLlBJIC8gMik7XG4gIH0sXG4gIGdhdXNzOiBmdW5jdGlvbiBnYXVzcyhsZW5ndGgsIGluZGV4LCBhbHBoYSkge1xuICAgIHJldHVybiBNYXRoLnBvdyhNYXRoLkUsIC0wLjUgKiBNYXRoLnBvdygoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSAvIChhbHBoYSAqIChsZW5ndGggLSAxKSAvIDIpLCAyKSk7XG4gIH0sXG4gIGhhbW1pbmc6IGZ1bmN0aW9uIGhhbW1pbmcobGVuZ3RoLCBpbmRleCkge1xuICAgIHJldHVybiAwLjU0IC0gMC40NiAqIE1hdGguY29zKE1hdGguUEkgKiAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkpO1xuICB9LFxuICBoYW5uOiBmdW5jdGlvbiBoYW5uKGxlbmd0aCwgaW5kZXgpIHtcbiAgICByZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyhNYXRoLlBJICogMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKSk7XG4gIH0sXG4gIGxhbmN6b3M6IGZ1bmN0aW9uIGxhbmN6b3MobGVuZ3RoLCBpbmRleCkge1xuICAgIHZhciB4ID0gMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMTtcbiAgICByZXR1cm4gTWF0aC5zaW4oTWF0aC5QSSAqIHgpIC8gKE1hdGguUEkgKiB4KTtcbiAgfSxcbiAgcmVjdGFuZ3VsYXI6IGZ1bmN0aW9uIHJlY3Rhbmd1bGFyKGxlbmd0aCwgaW5kZXgpIHtcbiAgICByZXR1cm4gMTtcbiAgfSxcbiAgdHJpYW5ndWxhcjogZnVuY3Rpb24gdHJpYW5ndWxhcihsZW5ndGgsIGluZGV4KSB7XG4gICAgcmV0dXJuIDIgLyBsZW5ndGggKiAobGVuZ3RoIC8gMiAtIE1hdGguYWJzKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikpO1xuICB9LFxuXG5cbiAgLy8gcGFyYWJvbGFcbiAgd2VsY2g6IGZ1bmN0aW9uIHdlbGNoKGxlbmd0aCwgX2luZGV4LCBpZ25vcmUsIHNoaWZ0KSB7XG4gICAgLy93W25dID0gMSAtIE1hdGgucG93KCAoIG4gLSAoIChOLTEpIC8gMiApICkgLyAoKCBOLTEgKSAvIDIgKSwgMiApXG4gICAgdmFyIGluZGV4ID0gc2hpZnQgPT09IDAgPyBfaW5kZXggOiAoX2luZGV4ICsgTWF0aC5mbG9vcihzaGlmdCAqIGxlbmd0aCkpICUgbGVuZ3RoO1xuICAgIHZhciBuXzFfb3ZlcjIgPSAobGVuZ3RoIC0gMSkgLyAyO1xuXG4gICAgcmV0dXJuIDEgLSBNYXRoLnBvdygoaW5kZXggLSBuXzFfb3ZlcjIpIC8gbl8xX292ZXIyLCAyKTtcbiAgfSxcbiAgaW52ZXJzZXdlbGNoOiBmdW5jdGlvbiBpbnZlcnNld2VsY2gobGVuZ3RoLCBfaW5kZXgsIGlnbm9yZSkge1xuICAgIHZhciBzaGlmdCA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogMDtcblxuICAgIC8vd1tuXSA9IDEgLSBNYXRoLnBvdyggKCBuIC0gKCAoTi0xKSAvIDIgKSApIC8gKCggTi0xICkgLyAyICksIDIgKVxuICAgIHZhciBpbmRleCA9IHNoaWZ0ID09PSAwID8gX2luZGV4IDogKF9pbmRleCArIE1hdGguZmxvb3Ioc2hpZnQgKiBsZW5ndGgpKSAlIGxlbmd0aDtcbiAgICB2YXIgbl8xX292ZXIyID0gKGxlbmd0aCAtIDEpIC8gMjtcblxuICAgIHJldHVybiBNYXRoLnBvdygoaW5kZXggLSBuXzFfb3ZlcjIpIC8gbl8xX292ZXIyLCAyKTtcbiAgfSxcbiAgcGFyYWJvbGE6IGZ1bmN0aW9uIHBhcmFib2xhKGxlbmd0aCwgaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPD0gbGVuZ3RoIC8gMikge1xuICAgICAgcmV0dXJuIHdpbmRvd3MuaW52ZXJzZXdlbGNoKGxlbmd0aCAvIDIsIGluZGV4KSAtIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAxIC0gd2luZG93cy5pbnZlcnNld2VsY2gobGVuZ3RoIC8gMiwgaW5kZXggLSBsZW5ndGggLyAyKTtcbiAgICB9XG4gIH0sXG4gIGV4cG9uZW50aWFsOiBmdW5jdGlvbiBleHBvbmVudGlhbChsZW5ndGgsIGluZGV4LCBhbHBoYSkge1xuICAgIHJldHVybiBNYXRoLnBvdyhpbmRleCAvIGxlbmd0aCwgYWxwaGEpO1xuICB9LFxuICBsaW5lYXI6IGZ1bmN0aW9uIGxpbmVhcihsZW5ndGgsIGluZGV4KSB7XG4gICAgcmV0dXJuIGluZGV4IC8gbGVuZ3RoO1xuICB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9nZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yID0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpO1xuXG52YXIgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnd3JhcCcsXG5cbiAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgdmFyIGNvZGUgPSB2b2lkIDAsXG4gICAgICAgIGlucHV0cyA9IF9nZW4uZ2V0SW5wdXRzKHRoaXMpLFxuICAgICAgICBzaWduYWwgPSBpbnB1dHNbMF0sXG4gICAgICAgIG1pbiA9IGlucHV0c1sxXSxcbiAgICAgICAgbWF4ID0gaW5wdXRzWzJdLFxuICAgICAgICBvdXQgPSB2b2lkIDAsXG4gICAgICAgIGRpZmYgPSB2b2lkIDA7XG5cbiAgICAvL291dCA9IGAoKCgke2lucHV0c1swXX0gLSAke3RoaXMubWlufSkgJSAke2RpZmZ9ICArICR7ZGlmZn0pICUgJHtkaWZmfSArICR7dGhpcy5taW59KWBcbiAgICAvL2NvbnN0IGxvbmcgbnVtV3JhcHMgPSBsb25nKCh2LWxvKS9yYW5nZSkgLSAodiA8IGxvKTtcbiAgICAvL3JldHVybiB2IC0gcmFuZ2UgKiBkb3VibGUobnVtV3JhcHMpOyAgIFxuXG4gICAgaWYgKHRoaXMubWluID09PSAwKSB7XG4gICAgICBkaWZmID0gbWF4O1xuICAgIH0gZWxzZSBpZiAoaXNOYU4obWF4KSB8fCBpc05hTihtaW4pKSB7XG4gICAgICBkaWZmID0gbWF4ICsgJyAtICcgKyBtaW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpZmYgPSBtYXggLSBtaW47XG4gICAgfVxuXG4gICAgb3V0ID0gJyB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnICsgaW5wdXRzWzBdICsgJ1xcbiAgaWYoICcgKyB0aGlzLm5hbWUgKyAnIDwgJyArIHRoaXMubWluICsgJyApICcgKyB0aGlzLm5hbWUgKyAnICs9ICcgKyBkaWZmICsgJ1xcbiAgZWxzZSBpZiggJyArIHRoaXMubmFtZSArICcgPiAnICsgdGhpcy5tYXggKyAnICkgJyArIHRoaXMubmFtZSArICcgLT0gJyArIGRpZmYgKyAnXFxuXFxuJztcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCAnICcgKyBvdXRdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbjEpIHtcbiAgdmFyIG1pbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgdmFyIG1heCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogMTtcblxuICB2YXIgdWdlbiA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuXG4gIE9iamVjdC5hc3NpZ24odWdlbiwge1xuICAgIG1pbjogbWluLFxuICAgIG1heDogbWF4LFxuICAgIHVpZDogX2dlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFtpbjEsIG1pbiwgbWF4XVxuICB9KTtcblxuICB1Z2VuLm5hbWUgPSAnJyArIHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZDtcblxuICByZXR1cm4gdWdlbjtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgTWVtb3J5SGVscGVyID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICB2YXIgc2l6ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDQwOTYgOiBhcmd1bWVudHNbMF07XG4gICAgdmFyIG1lbXR5cGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBGbG9hdDMyQXJyYXkgOiBhcmd1bWVudHNbMV07XG5cbiAgICB2YXIgaGVscGVyID0gT2JqZWN0LmNyZWF0ZSh0aGlzKTtcblxuICAgIE9iamVjdC5hc3NpZ24oaGVscGVyLCB7XG4gICAgICBoZWFwOiBuZXcgbWVtdHlwZShzaXplKSxcbiAgICAgIGxpc3Q6IHt9LFxuICAgICAgZnJlZUxpc3Q6IHt9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaGVscGVyO1xuICB9LFxuICBhbGxvYzogZnVuY3Rpb24gYWxsb2MoYW1vdW50KSB7XG4gICAgdmFyIGlkeCA9IC0xO1xuXG4gICAgaWYgKGFtb3VudCA+IHRoaXMuaGVhcC5sZW5ndGgpIHtcbiAgICAgIHRocm93IEVycm9yKCdBbGxvY2F0aW9uIHJlcXVlc3QgaXMgbGFyZ2VyIHRoYW4gaGVhcCBzaXplIG9mICcgKyB0aGlzLmhlYXAubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5mcmVlTGlzdCkge1xuICAgICAgdmFyIGNhbmRpZGF0ZVNpemUgPSB0aGlzLmZyZWVMaXN0W2tleV07XG5cbiAgICAgIGlmIChjYW5kaWRhdGVTaXplID49IGFtb3VudCkge1xuICAgICAgICBpZHggPSBrZXk7XG5cbiAgICAgICAgdGhpcy5saXN0W2lkeF0gPSBhbW91bnQ7XG5cbiAgICAgICAgaWYgKGNhbmRpZGF0ZVNpemUgIT09IGFtb3VudCkge1xuICAgICAgICAgIHZhciBuZXdJbmRleCA9IGlkeCArIGFtb3VudCxcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemUgPSB2b2lkIDA7XG5cbiAgICAgICAgICBmb3IgKHZhciBfa2V5IGluIHRoaXMubGlzdCkge1xuICAgICAgICAgICAgaWYgKF9rZXkgPiBuZXdJbmRleCkge1xuICAgICAgICAgICAgICBuZXdGcmVlU2l6ZSA9IF9rZXkgLSBuZXdJbmRleDtcbiAgICAgICAgICAgICAgdGhpcy5mcmVlTGlzdFtuZXdJbmRleF0gPSBuZXdGcmVlU2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggaWR4ICE9PSAtMSApIGRlbGV0ZSB0aGlzLmZyZWVMaXN0WyBpZHggXVxuXG4gICAgaWYgKGlkeCA9PT0gLTEpIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy5saXN0KSxcbiAgICAgICAgICBsYXN0SW5kZXggPSB2b2lkIDA7XG5cbiAgICAgIGlmIChrZXlzLmxlbmd0aCkge1xuICAgICAgICAvLyBpZiBub3QgZmlyc3QgYWxsb2NhdGlvbi4uLlxuICAgICAgICBsYXN0SW5kZXggPSBwYXJzZUludChrZXlzW2tleXMubGVuZ3RoIC0gMV0pO1xuXG4gICAgICAgIGlkeCA9IGxhc3RJbmRleCArIHRoaXMubGlzdFtsYXN0SW5kZXhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWR4ID0gMDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5saXN0W2lkeF0gPSBhbW91bnQ7XG4gICAgfVxuXG4gICAgaWYgKGlkeCArIGFtb3VudCA+PSB0aGlzLmhlYXAubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBFcnJvcignTm8gYXZhaWxhYmxlIGJsb2NrcyByZW1haW4gc3VmZmljaWVudCBmb3IgYWxsb2NhdGlvbiByZXF1ZXN0LicpO1xuICAgIH1cbiAgICByZXR1cm4gaWR4O1xuICB9LFxuICBmcmVlOiBmdW5jdGlvbiBmcmVlKGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmxpc3RbaW5kZXhdICE9PSAnbnVtYmVyJykge1xuICAgICAgdGhyb3cgRXJyb3IoJ0NhbGxpbmcgZnJlZSgpIG9uIG5vbi1leGlzdGluZyBibG9jay4nKTtcbiAgICB9XG5cbiAgICB0aGlzLmxpc3RbaW5kZXhdID0gMDtcblxuICAgIHZhciBzaXplID0gMDtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5saXN0KSB7XG4gICAgICBpZiAoa2V5ID4gaW5kZXgpIHtcbiAgICAgICAgc2l6ZSA9IGtleSAtIGluZGV4O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmZyZWVMaXN0W2luZGV4XSA9IHNpemU7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5SGVscGVyO1xuIl19

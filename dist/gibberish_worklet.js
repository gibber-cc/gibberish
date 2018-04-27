const window = {}; 
        let Gibberish = null; 
        let initialized = false;
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Gibberish = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'abs',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet ? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.abs' : Math.abs })

      out = `${ref}abs( ${inputs[0]} )`

    } else {
      out = Math.abs( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let abs = Object.create( proto )

  abs.inputs = [ x ]

  return abs
}

},{"./gen.js":30}],2:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'accum',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        genName = 'gen.' + this.name,
        functionBody

    gen.requestMemory( this.memory )

    gen.memory.heap[ this.memory.value.idx ] = this.initialValue

    functionBody = this.callback( genName, inputs[0], inputs[1], `memory[${this.memory.value.idx}]` )

    //gen.closures.add({ [ this.name ]: this }) 

    gen.memo[ this.name ] = this.name + '_value'
    
    return [ this.name + '_value', functionBody ]
  },

  callback( _name, _incr, _reset, valueRef ) {
    let diff = this.max - this.min,
        out = '',
        wrap = ''
    
    /* three different methods of wrapping, third is most expensive:
     *
     * 1: range {0,1}: y = x - (x | 0)
     * 2: log2(this.max) == integer: y = x & (this.max - 1)
     * 3: all others: if( x >= this.max ) y = this.max -x
     *
     */

    // must check for reset before storing value for output
    if( !(typeof this.inputs[1] === 'number' && this.inputs[1] < 1) ) { 
      if( this.resetValue !== this.min ) {

        out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.resetValue}\n\n`
        //out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.min}\n\n`
      }else{
        out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.min}\n\n`
        //out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.initialValue}\n\n`
      }
    }

    out += `  var ${this.name}_value = ${valueRef}\n`
    
    if( this.shouldWrap === false && this.shouldClamp === true ) {
      out += `  if( ${valueRef} < ${this.max } ) ${valueRef} += ${_incr}\n`
    }else{
      out += `  ${valueRef} += ${_incr}\n` // store output value before accumulating  
    }

    if( this.max !== Infinity  && this.shouldWrapMax ) wrap += `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n`
    if( this.min !== -Infinity && this.shouldWrapMin ) wrap += `  if( ${valueRef} < ${this.min} ) ${valueRef} += ${diff}\n`

    //if( this.min === 0 && this.max === 1 ) { 
    //  wrap =  `  ${valueRef} = ${valueRef} - (${valueRef} | 0)\n\n`
    //} else if( this.min === 0 && ( Math.log2( this.max ) | 0 ) === Math.log2( this.max ) ) {
    //  wrap =  `  ${valueRef} = ${valueRef} & (${this.max} - 1)\n\n`
    //} else if( this.max !== Infinity ){
    //  wrap = `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n\n`
    //}

    out = out + wrap + '\n'

    return out
  },

  defaults : { min:0, max:1, resetValue:0, initialValue:0, shouldWrap:true, shouldWrapMax: true, shouldWrapMin:true, shouldClamp:false }
}

module.exports = ( incr, reset=0, properties ) => {
  const ugen = Object.create( proto )
      
  Object.assign( ugen, 
    { 
      uid:    gen.getUID(),
      inputs: [ incr, reset ],
      memory: {
        value: { length:1, idx:null }
      }
    },
    proto.defaults,
    properties 
  )

  if( properties !== undefined && properties.shouldWrapMax === undefined && properties.shouldWrapMin === undefined ) {
    if( properties.shouldWrap !== undefined ) {
      ugen.shouldWrapMin = ugen.shouldWrapMax = properties.shouldWrap
    }
  }

  if( properties !== undefined && properties.resetValue === undefined ) {
    ugen.resetValue = ugen.min
  }

  if( ugen.initialValue === undefined ) ugen.initialValue = ugen.min

  Object.defineProperty( ugen, 'value', {
    get()  { 
      //console.log( 'gen:', gen, gen.memory )
      return gen.memory.heap[ this.memory.value.idx ] 
    },
    set(v) { gen.memory.heap[ this.memory.value.idx ] = v }
  })

  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":30}],3:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'acos',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    

    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet ? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'acos': isWorklet ? 'Math.acos' :Math.acos })

      out = `${ref}acos( ${inputs[0]} )` 

    } else {
      out = Math.acos( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let acos = Object.create( proto )

  acos.inputs = [ x ]
  acos.id = gen.getUID()
  acos.name = `${acos.basename}{acos.id}`

  return acos
}

},{"./gen.js":30}],4:[function(require,module,exports){
'use strict'

let gen      = require( './gen.js' ),
    mul      = require( './mul.js' ),
    sub      = require( './sub.js' ),
    div      = require( './div.js' ),
    data     = require( './data.js' ),
    peek     = require( './peek.js' ),
    accum    = require( './accum.js' ),
    ifelse   = require( './ifelseif.js' ),
    lt       = require( './lt.js' ),
    bang     = require( './bang.js' ),
    env      = require( './env.js' ),
    add      = require( './add.js' ),
    poke     = require( './poke.js' ),
    neq      = require( './neq.js' ),
    and      = require( './and.js' ),
    gte      = require( './gte.js' ),
    memo     = require( './memo.js' ),
    utilities= require( './utilities.js' )

module.exports = ( attackTime = 44100, decayTime = 44100, _props ) => {
  const props = Object.assign({}, { shape:'exponential', alpha:5, trigger:null }, _props )
  const _bang = props.trigger !== null ? props.trigger : bang(),
        phase = accum( 1, _bang, { min:0, max: Infinity, initialValue:-Infinity, shouldWrap:false })
      
  let bufferData, bufferDataReverse, decayData, out, buffer

  //console.log( 'shape:', props.shape, 'attack time:', attackTime, 'decay time:', decayTime )
  let completeFlag = data( [0] )
  
  // slightly more efficient to use existing phase accumulator for linear envelopes
  if( props.shape === 'linear' ) {
    out = ifelse( 
      and( gte( phase, 0), lt( phase, attackTime )),
      div( phase, attackTime ),

      and( gte( phase, 0),  lt( phase, add( attackTime, decayTime ) ) ),
      sub( 1, div( sub( phase, attackTime ), decayTime ) ),
      
      neq( phase, -Infinity),
      poke( completeFlag, 1, 0, { inline:0 }),

      0 
    )
  } else {
    bufferData = env({ length:1024, type:props.shape, alpha:props.alpha })
    bufferDataReverse = env({ length:1024, type:props.shape, alpha:props.alpha, reverse:true })

    out = ifelse( 
      and( gte( phase, 0), lt( phase, attackTime ) ), 
      peek( bufferData, div( phase, attackTime ), { boundmode:'clamp' } ), 

      and( gte(phase,0), lt( phase, add( attackTime, decayTime ) ) ), 
      peek( bufferDataReverse, div( sub( phase, attackTime ), decayTime ), { boundmode:'clamp' }),

      neq( phase, -Infinity ),
      poke( completeFlag, 1, 0, { inline:0 }),

      0
    )
  }

  const usingWorklet = gen.mode === 'worklet'
  if( usingWorklet === true ) {
    out.node = null
    utilities.register( out )
  }

  // needed for gibberish... getting this to work right with worklets
  // via promises will probably be tricky
  out.isComplete = ()=> {
    if( usingWorklet === true && out.node !== null ) {
      const p = new Promise( resolve => {
        out.node.getMemoryValue( completeFlag.memory.values.idx, resolve )
      })

      return p
    }else{
      return gen.memory.heap[ completeFlag.memory.values.idx ]
    }
  }

  out.trigger = ()=> {
    if( usingWorklet === true && out.node !== null ) {
      out.node.port.postMessage({ key:'set', idx:completeFlag.memory.values.idx, value:0 })
    }else{
      gen.memory.heap[ completeFlag.memory.values.idx ] = 0
    }
    _bang.trigger()
  }

  return out 
}

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":30,"./gte.js":32,"./ifelseif.js":35,"./lt.js":38,"./memo.js":42,"./mul.js":48,"./neq.js":49,"./peek.js":54,"./poke.js":56,"./sub.js":66,"./utilities.js":72}],5:[function(require,module,exports){
'use strict'

const gen = require('./gen.js')

const proto = { 
  basename:'add',
  gen() {
    let inputs = gen.getInputs( this ),
        out='',
        sum = 0, numCount = 0, adderAtEnd = false, alreadyFullSummed = true

    if( inputs.length === 0 ) return 0

    out = `  var ${this.name} = `

    inputs.forEach( (v,i) => {
      if( isNaN( v ) ) {
        out += v
        if( i < inputs.length -1 ) {
          adderAtEnd = true
          out += ' + '
        }
        alreadyFullSummed = false
      }else{
        sum += parseFloat( v )
        numCount++
      }
    })

    if( numCount > 0 ) {
      out += adderAtEnd || alreadyFullSummed ? sum : ' + ' + sum
    }

    out += '\n'

    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  }
}

module.exports = ( ...args ) => {
  const add = Object.create( proto )
  add.id = gen.getUID()
  add.name = add.basename + add.id
  add.inputs = args

  return add
}

},{"./gen.js":30}],6:[function(require,module,exports){
'use strict'

let gen      = require( './gen.js' ),
    mul      = require( './mul.js' ),
    sub      = require( './sub.js' ),
    div      = require( './div.js' ),
    data     = require( './data.js' ),
    peek     = require( './peek.js' ),
    accum    = require( './accum.js' ),
    ifelse   = require( './ifelseif.js' ),
    lt       = require( './lt.js' ),
    bang     = require( './bang.js' ),
    env      = require( './env.js' ),
    param    = require( './param.js' ),
    add      = require( './add.js' ),
    gtp      = require( './gtp.js' ),
    not      = require( './not.js' ),
    and      = require( './and.js' ),
    neq      = require( './neq.js' ),
    poke     = require( './poke.js' )

module.exports = ( attackTime=44, decayTime=22050, sustainTime=44100, sustainLevel=.6, releaseTime=44100, _props ) => {
  let envTrigger = bang(),
      phase = accum( 1, envTrigger, { max: Infinity, shouldWrap:false, initialValue:Infinity }),
      shouldSustain = param( 1 ),
      defaults = {
         shape: 'exponential',
         alpha: 5,
         triggerRelease: false,
      },
      props = Object.assign({}, defaults, _props ),
      bufferData, decayData, out, buffer, sustainCondition, releaseAccum, releaseCondition


  const completeFlag = data( [0] )

  bufferData = env({ length:1024, alpha:props.alpha, shift:0, type:props.shape })

  sustainCondition = props.triggerRelease 
    ? shouldSustain
    : lt( phase, add( attackTime, decayTime, sustainTime ) )

  releaseAccum = props.triggerRelease
    ? gtp( sub( sustainLevel, accum( div( sustainLevel, releaseTime ) , 0, { shouldWrap:false }) ), 0 )
    : sub( sustainLevel, mul( div( sub( phase, add( attackTime, decayTime, sustainTime ) ), releaseTime ), sustainLevel ) ), 

  releaseCondition = props.triggerRelease
    ? not( shouldSustain )
    : lt( phase, add( attackTime, decayTime, sustainTime, releaseTime ) )

  out = ifelse(
    // attack 
    lt( phase,  attackTime ), 
    peek( bufferData, div( phase, attackTime ), { boundmode:'clamp' } ), 

    // decay
    lt( phase, add( attackTime, decayTime ) ), 
    peek( bufferData, sub( 1, mul( div( sub( phase,  attackTime ),  decayTime ), sub( 1,  sustainLevel ) ) ), { boundmode:'clamp' }),

    // sustain
    and( sustainCondition, neq( phase, Infinity ) ),
    peek( bufferData,  sustainLevel ),

    // release
    releaseCondition, //lt( phase,  attackTime +  decayTime +  sustainTime +  releaseTime ),
    peek( 
      bufferData,
      releaseAccum, 
      //sub(  sustainLevel, mul( div( sub( phase,  attackTime +  decayTime +  sustainTime),  releaseTime ),  sustainLevel ) ), 
      { boundmode:'clamp' }
    ),

    neq( phase, Infinity ),
    poke( completeFlag, 1, 0, { inline:0 }),

    0
  )
   
  const usingWorklet = gen.mode === 'worklet'
  if( usingWorklet === true ) {
    out.node = null
    utilities.register( out )
  }

  out.trigger = ()=> {
    shouldSustain.value = 1
    envTrigger.trigger()
  }
 
  // needed for gibberish... getting this to work right with worklets
  // via promises will probably be tricky
  out.isComplete = ()=> {
    if( usingWorklet === true && out.node !== null ) {
      const p = new Promise( resolve => {
        out.node.getMemoryValue( completeFlag.memory.values.idx, resolve )
      })

      return p
    }else{
      return gen.memory.heap[ completeFlag.memory.values.idx ]
    }
  }


  out.release = ()=> {
    shouldSustain.value = 0
    // XXX pretty nasty... grabs accum inside of gtp and resets value manually
    // unfortunately envTrigger won't work as it's back to 0 by the time the release block is triggered...
    if( usingWorklet && out.node !== null ) {
      console.log( 'worklet??' )
      out.node.port.postMessage({ key:'set', idx:releaseAccum.inputs[0].inputs[1].memory.value.idx, value:0 })
    }else{
      console.log( 'non-worklet...' )
      gen.memory.heap[ releaseAccum.inputs[0].inputs[1].memory.value.idx ] = 0
    }
  }

  return out 
}

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":30,"./gtp.js":33,"./ifelseif.js":35,"./lt.js":38,"./mul.js":48,"./neq.js":49,"./not.js":51,"./param.js":53,"./peek.js":54,"./poke.js":56,"./sub.js":66}],7:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'and',

  gen() {
    let inputs = gen.getInputs( this ), out

    out = `  var ${this.name} = (${inputs[0]} !== 0 && ${inputs[1]} !== 0) | 0\n\n`

    gen.memo[ this.name ] = `${this.name}`

    return [ `${this.name}`, out ]
  },

}

module.exports = ( in1, in2 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ in1, in2 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":30}],8:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'asin',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet ? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'asin': isWorklet ? 'Math.sin' : Math.asin })

      out = `${ref}asin( ${inputs[0]} )` 

    } else {
      out = Math.asin( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let asin = Object.create( proto )

  asin.inputs = [ x ]
  asin.id = gen.getUID()
  asin.name = `${asin.basename}{asin.id}`

  return asin
}

},{"./gen.js":30}],9:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'atan',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet ? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'atan': isWorklet ? 'Math.atan' : Math.atan })

      out = `${ref}atan( ${inputs[0]} )` 

    } else {
      out = Math.atan( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let atan = Object.create( proto )

  atan.inputs = [ x ]
  atan.id = gen.getUID()
  atan.name = `${atan.basename}{atan.id}`

  return atan
}

},{"./gen.js":30}],10:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    mul     = require( './mul.js' ),
    sub     = require( './sub.js' )

module.exports = ( decayTime = 44100 ) => {
  let ssd = history ( 1 ),
      t60 = Math.exp( -6.907755278921 / decayTime )

  ssd.in( mul( ssd.out, t60 ) )

  ssd.out.trigger = ()=> {
    ssd.value = 1
  }

  return sub( 1, ssd.out )
}

},{"./gen.js":30,"./history.js":34,"./mul.js":48,"./sub.js":66}],11:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  gen() {
    gen.requestMemory( this.memory )
    
    let out = 
`  var ${this.name} = memory[${this.memory.value.idx}]
  if( ${this.name} === 1 ) memory[${this.memory.value.idx}] = 0      
      
`
    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  } 
}

module.exports = ( _props ) => {
  let ugen = Object.create( proto ),
      props = Object.assign({}, { min:0, max:1 }, _props )

  ugen.name = 'bang' + gen.getUID()

  ugen.min = props.min
  ugen.max = props.max

  const usingWorklet = gen.mode === 'worklet'
  if( usingWorklet === true ) {
    ugen.node = null
    utilities.register( ugen )
  }

  ugen.trigger = () => {
    if( usingWorklet === true && ugen.node !== null ) {
      ugen.node.port.postMessage({ key:'set', idx:ugen.memory.value.idx, value:ugen.max })
    }else{
      gen.memory.heap[ ugen.memory.value.idx ] = ugen.max 
    }
  }

  ugen.memory = {
    value: { length:1, idx:null }
  }

  return ugen
}

},{"./gen.js":30}],12:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'bool',

  gen() {
    let inputs = gen.getInputs( this ), out

    out = `${inputs[0]} === 0 ? 0 : 1`
    
    //gen.memo[ this.name ] = `gen.data.${this.name}`

    //return [ `gen.data.${this.name}`, ' ' +out ]
    return out
  }
}

module.exports = ( in1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    uid:        gen.getUID(),
    inputs:     [ in1 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}


},{"./gen.js":30}],13:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'ceil',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet ? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.ceil' : Math.ceil })

      out = `${ref}ceil( ${inputs[0]} )`

    } else {
      out = Math.ceil( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let ceil = Object.create( proto )

  ceil.inputs = [ x ]

  return ceil
}

},{"./gen.js":30}],14:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js'),
    floor= require('./floor.js'),
    sub  = require('./sub.js'),
    memo = require('./memo.js')

let proto = {
  basename:'clip',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        out

    out =

` var ${this.name} = ${inputs[0]}
  if( ${this.name} > ${inputs[2]} ) ${this.name} = ${inputs[2]}
  else if( ${this.name} < ${inputs[1]} ) ${this.name} = ${inputs[1]}
`
    out = ' ' + out
    
    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  },
}

module.exports = ( in1, min=-1, max=1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    min, 
    max,
    uid:    gen.getUID(),
    inputs: [ in1, min, max ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./floor.js":27,"./gen.js":30,"./memo.js":42,"./sub.js":66}],15:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'cos',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    
    const isWorklet = gen.mode === 'worklet'

    const ref = isWorklet ? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'cos': isWorklet ? 'Math.cos' : Math.cos })

      out = `${ref}cos( ${inputs[0]} )` 

    } else {
      out = Math.cos( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let cos = Object.create( proto )

  cos.inputs = [ x ]
  cos.id = gen.getUID()
  cos.name = `${cos.basename}{cos.id}`

  return cos
}

},{"./gen.js":30}],16:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'counter',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        genName = 'gen.' + this.name,
        functionBody
       
    if( this.memory.value.idx === null ) gen.requestMemory( this.memory )
    functionBody  = this.callback( genName, inputs[0], inputs[1], inputs[2], inputs[3], inputs[4],  `memory[${this.memory.value.idx}]`, `memory[${this.memory.wrap.idx}]`  )

    gen.memo[ this.name ] = this.name + '_value'
   
    if( gen.memo[ this.wrap.name ] === undefined ) this.wrap.gen()

    return [ this.name + '_value', functionBody ]
  },

  callback( _name, _incr, _min, _max, _reset, loops, valueRef, wrapRef ) {
    let diff = this.max - this.min,
        out = '',
        wrap = ''
    // must check for reset before storing value for output
    if( !(typeof this.inputs[3] === 'number' && this.inputs[3] < 1) ) { 
      out += `  if( ${_reset} >= 1 ) ${valueRef} = ${_min}\n`
    }

    out += `  var ${this.name}_value = ${valueRef};\n  ${valueRef} += ${_incr}\n` // store output value before accumulating  
    
    if( typeof this.max === 'number' && this.max !== Infinity && typeof this.min !== 'number' ) {
      wrap = 
`  if( ${valueRef} >= ${this.max} &&  ${loops} > 0) {
    ${valueRef} -= ${diff}
    ${wrapRef} = 1
  }else{
    ${wrapRef} = 0
  }\n`
    }else if( this.max !== Infinity && this.min !== Infinity ) {
      wrap = 
`  if( ${valueRef} >= ${_max} &&  ${loops} > 0) {
    ${valueRef} -= ${_max} - ${_min}
    ${wrapRef} = 1
  }else if( ${valueRef} < ${_min} &&  ${loops} > 0) {
    ${valueRef} += ${_max} - ${_min}
    ${wrapRef} = 1
  }else{
    ${wrapRef} = 0
  }\n`
    }else{
      out += '\n'
    }

    out = out + wrap

    return out
  }
}

module.exports = ( incr=1, min=0, max=Infinity, reset=0, loops=1,  properties ) => {
  let ugen = Object.create( proto ),
      defaults = { initialValue: 0, shouldWrap:true }

  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, { 
    min:    min, 
    max:    max,
    value:  defaults.initialValue,
    uid:    gen.getUID(),
    inputs: [ incr, min, max, reset, loops ],
    memory: {
      value: { length:1, idx: null },
      wrap:  { length:1, idx: null } 
    },
    wrap : {
      gen() { 
        if( ugen.memory.wrap.idx === null ) {
          gen.requestMemory( ugen.memory )
        }
        gen.getInputs( this )
        gen.memo[ this.name ] = `memory[ ${ugen.memory.wrap.idx} ]`
        return `memory[ ${ugen.memory.wrap.idx} ]` 
      }
    }
  },
  defaults )
 
  Object.defineProperty( ugen, 'value', {
    get() {
      if( this.memory.value.idx !== null ) {
        return gen.memory.heap[ this.memory.value.idx ]
      }
    },
    set( v ) {
      if( this.memory.value.idx !== null ) {
        gen.memory.heap[ this.memory.value.idx ] = v 
      }
    }
  })
  
  ugen.wrap.inputs = [ ugen ]
  ugen.name = `${ugen.basename}${ugen.uid}`
  ugen.wrap.name = ugen.name + '_wrap'
  return ugen
} 

},{"./gen.js":30}],17:[function(require,module,exports){
'use strict'

let gen  = require( './gen.js' ),
    accum= require( './phasor.js' ),
    data = require( './data.js' ),
    peek = require( './peek.js' ),
    mul  = require( './mul.js' ),
    phasor=require( './phasor.js')

let proto = {
  basename:'cycle',

  initTable() {    
    let buffer = new Float32Array( 1024 )

    for( let i = 0, l = buffer.length; i < l; i++ ) {
      buffer[ i ] = Math.sin( ( i / l ) * ( Math.PI * 2 ) )
    }

    gen.globals.cycle = data( buffer, 1, { immutable:true } )
  }

}

module.exports = ( frequency=1, reset=0, _props ) => {
  if( typeof gen.globals.cycle === 'undefined' ) proto.initTable() 
  const props = Object.assign({}, { min:0 }, _props )

  const ugen = peek( gen.globals.cycle, phasor( frequency, reset, props ))
  ugen.name = 'cycle' + gen.getUID()

  return ugen
}

},{"./data.js":18,"./gen.js":30,"./mul.js":48,"./peek.js":54,"./phasor.js":55}],18:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js'),
  utilities = require( './utilities.js' ),
  peek = require('./peek.js'),
  poke = require('./poke.js')

let proto = {
  basename:'data',
  globals: {},

  gen() {
    let idx
    if( gen.memo[ this.name ] === undefined ) {
      let ugen = this
      gen.requestMemory( this.memory, this.immutable ) 
      idx = this.memory.values.idx
      try {
        gen.memory.heap.set( this.buffer, idx )
      }catch( e ) {
        console.log( e )
        throw Error( 'error with request. asking for ' + this.buffer.length +'. current index: ' + gen.memoryIndex + ' of ' + gen.memory.heap.length )
      }
      //gen.data[ this.name ] = this
      //return 'gen.memory' + this.name + '.buffer'
      gen.memo[ this.name ] = idx
    }else{
      idx = gen.memo[ this.name ]
    }
    return idx
  },
}

module.exports = ( x, y=1, properties ) => {
  let ugen, buffer, shouldLoad = false
  
  if( properties !== undefined && properties.global !== undefined ) {
    if( gen.globals[ properties.global ] ) {
      return gen.globals[ properties.global ]
    }
  }

  if( typeof x === 'number' ) {
    if( y !== 1 ) {
      buffer = []
      for( let i = 0; i < y; i++ ) {
        buffer[ i ] = new Float32Array( x )
      }
    }else{
      buffer = new Float32Array( x )
    }
  }else if( Array.isArray( x ) ) { //! (x instanceof Float32Array ) ) {
    let size = x.length
    buffer = new Float32Array( size )
    for( let i = 0; i < x.length; i++ ) {
      buffer[ i ] = x[ i ]
    }
  }else if( typeof x === 'string' ) {
    buffer = { length: y > 1 ? y : gen.samplerate * 60 } // XXX what???
    shouldLoad = true
  }else if( x instanceof Float32Array ) {
    buffer = x
  }
  
  ugen = Object.create( proto )

  Object.assign( ugen, { 
    buffer,
    name: proto.basename + gen.getUID(),
    dim:  buffer.length, // XXX how do we dynamically allocate this?
    channels : 1,
    onload: null,
    then( fnc ) {
      ugen.onload = fnc
      return ugen
    },
    immutable: properties !== undefined && properties.immutable === true ? true : false,
    load( filename ) {
      let promise = utilities.loadSample( filename, ugen )
      promise.then( ( _buffer )=> { 
        ugen.memory.values.length = ugen.dim = _buffer.length     
        ugen.onload() 
      })
    },
    memory : {
      values: { length:buffer.length, idx:null }
    }
  })

  if( shouldLoad ) ugen.load( x )
  
  if( properties !== undefined ) {
    if( properties.global !== undefined ) {
      gen.globals[ properties.global ] = ugen
    }
    if( properties.meta === true ) {
      for( let i = 0, length = ugen.buffer.length; i < length; i++ ) {
        Object.defineProperty( ugen, i, {
          get () {
            return peek( ugen, i, { mode:'simple', interp:'none' } )
          },
          set( v ) {
            return poke( ugen, v, i )
          }
        })
      }
    }
  }

  return ugen
}

},{"./gen.js":30,"./peek.js":54,"./poke.js":56,"./utilities.js":72}],19:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' ),
    add     = require( './add.js' ),
    mul     = require( './mul.js' ),
    memo    = require( './memo.js' )

module.exports = ( in1 ) => {
  let x1 = history(),
      y1 = history(),
      filter

  //History x1, y1; y = in1 - x1 + y1*0.9997; x1 = in1; y1 = y; out1 = y;
  filter = memo( add( sub( in1, x1.out ), mul( y1.out, .9997 ) ) )
  x1.in( in1 )
  y1.in( filter )

  return filter
}

},{"./add.js":5,"./gen.js":30,"./history.js":34,"./memo.js":42,"./mul.js":48,"./sub.js":66}],20:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    mul     = require( './mul.js' ),
    t60     = require( './t60.js' )

module.exports = ( decayTime = 44100, props ) => {
  let properties = Object.assign({}, { initValue:1 }, props ),
      ssd = history ( properties.initValue )

  ssd.in( mul( ssd.out, t60( decayTime ) ) )

  ssd.out.trigger = ()=> {
    ssd.value = 1
  }

  return ssd.out 
}

},{"./gen.js":30,"./history.js":34,"./mul.js":48,"./t60.js":68}],21:[function(require,module,exports){
'use strict'

const gen  = require( './gen.js'  ),
      data = require( './data.js' ),
      poke = require( './poke.js' ),
      peek = require( './peek.js' ),
      sub  = require( './sub.js'  ),
      wrap = require( './wrap.js' ),
      accum= require( './accum.js'),
      memo = require( './memo.js' )

const proto = {
  basename:'delay',

  gen() {
    let inputs = gen.getInputs( this )
    
    gen.memo[ this.name ] = inputs[0]
    
    return inputs[0]
  },
}

const defaults = { size: 512, interp:'none' }

module.exports = ( in1, taps, properties ) => {
  const ugen = Object.create( proto )
  let writeIdx, readIdx, delaydata

  if( Array.isArray( taps ) === false ) taps = [ taps ]
  
  const props = Object.assign( {}, defaults, properties )

  const maxTapSize = Math.max( ...taps )
  if( props.size < maxTapSize ) props.size = maxTapSize

  delaydata = data( props.size )
  
  ugen.inputs = []

  writeIdx = accum( 1, 0, { max:props.size, min:0 })
  
  for( let i = 0; i < taps.length; i++ ) {
    ugen.inputs[ i ] = peek( delaydata, wrap( sub( writeIdx, taps[i] ), 0, props.size ),{ mode:'samples', interp:props.interp })
  }
  
  ugen.outputs = ugen.inputs // XXX ugh, Ugh, UGH! but i guess it works.

  poke( delaydata, in1, writeIdx )

  ugen.name = `${ugen.basename}${gen.getUID()}`

  return ugen
}

},{"./accum.js":2,"./data.js":18,"./gen.js":30,"./memo.js":42,"./peek.js":54,"./poke.js":56,"./sub.js":66,"./wrap.js":74}],22:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' )

module.exports = ( in1 ) => {
  let n1 = history()
    
  n1.in( in1 )

  let ugen = sub( in1, n1.out )
  ugen.name = 'delta'+gen.getUID()

  return ugen
}

},{"./gen.js":30,"./history.js":34,"./sub.js":66}],23:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

const proto = {
  basename:'div',
  gen() {
    let inputs = gen.getInputs( this ),
        out=`  var ${this.name} = `,
        diff = 0, 
        numCount = 0,
        lastNumber = inputs[ 0 ],
        lastNumberIsUgen = isNaN( lastNumber ), 
        divAtEnd = false

    inputs.forEach( (v,i) => {
      if( i === 0 ) return

      let isNumberUgen = isNaN( v ),
        isFinalIdx   = i === inputs.length - 1

      if( !lastNumberIsUgen && !isNumberUgen ) {
        lastNumber = lastNumber / v
        out += lastNumber
      }else{
        out += `${lastNumber} / ${v}`
      }

      if( !isFinalIdx ) out += ' / ' 
    })

    out += '\n'

    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  }
}

module.exports = (...args) => {
  const div = Object.create( proto )
  
  Object.assign( div, {
    id:     gen.getUID(),
    inputs: args,
  })

  div.name = div.basename + div.id
  
  return div
}

},{"./gen.js":30}],24:[function(require,module,exports){
'use strict'

let gen     = require( './gen' ),
    windows = require( './windows' ),
    data    = require( './data' ),
    peek    = require( './peek' ),
    phasor  = require( './phasor' ),
    defaults = {
      type:'triangular', length:1024, alpha:.15, shift:0, reverse:false 
    }

module.exports = props => {
  
  let properties = Object.assign( {}, defaults, props )
  let buffer = new Float32Array( properties.length )

  let name = properties.type + '_' + properties.length + '_' + properties.shift + '_' + properties.reverse + '_' + properties.alpha
  if( typeof gen.globals.windows[ name ] === 'undefined' ) { 

    for( let i = 0; i < properties.length; i++ ) {
      buffer[ i ] = windows[ properties.type ]( properties.length, i, properties.alpha, properties.shift )
    }

    if( properties.reverse === true ) { 
      buffer.reverse()
    }
    gen.globals.windows[ name ] = data( buffer )
  }

  let ugen = gen.globals.windows[ name ] 
  ugen.name = 'env' + gen.getUID()

  return ugen
}

},{"./data":18,"./gen":30,"./peek":54,"./phasor":55,"./windows":73}],25:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'eq',

  gen() {
    let inputs = gen.getInputs( this ), out

    out = this.inputs[0] === this.inputs[1] ? 1 : `  var ${this.name} = (${inputs[0]} === ${inputs[1]}) | 0\n\n`

    gen.memo[ this.name ] = `${this.name}`

    return [ `${this.name}`, out ]
  },

}

module.exports = ( in1, in2 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ in1, in2 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":30}],26:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'exp',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.exp' : Math.exp })

      out = `${ref}exp( ${inputs[0]} )`

    } else {
      out = Math.exp( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let exp = Object.create( proto )

  exp.inputs = [ x ]

  return exp
}

},{"./gen.js":30}],27:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'floor',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      //gen.closures.add({ [ this.name ]: Math.floor })

      out = `( ${inputs[0]} | 0 )`

    } else {
      out = inputs[0] | 0
    }
    
    return out
  }
}

module.exports = x => {
  let floor = Object.create( proto )

  floor.inputs = [ x ]

  return floor
}

},{"./gen.js":30}],28:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'fold',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        out

    out = this.createCallback( inputs[0], this.min, this.max ) 

    gen.memo[ this.name ] = this.name + '_value'

    return [ this.name + '_value', out ]
  },

  createCallback( v, lo, hi ) {
    let out =
` var ${this.name}_value = ${v},
      ${this.name}_range = ${hi} - ${lo},
      ${this.name}_numWraps = 0

  if(${this.name}_value >= ${hi}){
    ${this.name}_value -= ${this.name}_range
    if(${this.name}_value >= ${hi}){
      ${this.name}_numWraps = ((${this.name}_value - ${lo}) / ${this.name}_range) | 0
      ${this.name}_value -= ${this.name}_range * ${this.name}_numWraps
    }
    ${this.name}_numWraps++
  } else if(${this.name}_value < ${lo}){
    ${this.name}_value += ${this.name}_range
    if(${this.name}_value < ${lo}){
      ${this.name}_numWraps = ((${this.name}_value - ${lo}) / ${this.name}_range- 1) | 0
      ${this.name}_value -= ${this.name}_range * ${this.name}_numWraps
    }
    ${this.name}_numWraps--
  }
  if(${this.name}_numWraps & 1) ${this.name}_value = ${hi} + ${lo} - ${this.name}_value
`
    return ' ' + out
  }
}

module.exports = ( in1, min=0, max=1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    min, 
    max,
    uid:    gen.getUID(),
    inputs: [ in1 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":30}],29:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'gate',
  controlString:null, // insert into output codegen for determining indexing
  gen() {
    let inputs = gen.getInputs( this ), out
    
    gen.requestMemory( this.memory )
    
    let lastInputMemoryIdx = 'memory[ ' + this.memory.lastInput.idx + ' ]',
        outputMemoryStartIdx = this.memory.lastInput.idx + 1,
        inputSignal = inputs[0],
        controlSignal = inputs[1]
    
    /* 
     * we check to see if the current control inputs equals our last input
     * if so, we store the signal input in the memory associated with the currently
     * selected index. If not, we put 0 in the memory associated with the last selected index,
     * change the selected index, and then store the signal in put in the memery assoicated
     * with the newly selected index
     */
    
    out =

` if( ${controlSignal} !== ${lastInputMemoryIdx} ) {
    memory[ ${lastInputMemoryIdx} + ${outputMemoryStartIdx}  ] = 0 
    ${lastInputMemoryIdx} = ${controlSignal}
  }
  memory[ ${outputMemoryStartIdx} + ${controlSignal} ] = ${inputSignal}

`
    this.controlString = inputs[1]
    this.initialized = true

    gen.memo[ this.name ] = this.name

    this.outputs.forEach( v => v.gen() )

    return [ null, ' ' + out ]
  },

  childgen() {
    if( this.parent.initialized === false ) {
      gen.getInputs( this ) // parent gate is only input of a gate output, should only be gen'd once.
    }

    if( gen.memo[ this.name ] === undefined ) {
      gen.requestMemory( this.memory )

      gen.memo[ this.name ] = `memory[ ${this.memory.value.idx} ]`
    }
    
    return  `memory[ ${this.memory.value.idx} ]`
  }
}

module.exports = ( control, in1, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { count: 2 }

  if( typeof properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, {
    outputs: [],
    uid:     gen.getUID(),
    inputs:  [ in1, control ],
    memory: {
      lastInput: { length:1, idx:null }
    },
    initialized:false
  },
  defaults )
  
  ugen.name = `${ugen.basename}${gen.getUID()}`

  for( let i = 0; i < ugen.count; i++ ) {
    ugen.outputs.push({
      index:i,
      gen: proto.childgen,
      parent:ugen,
      inputs: [ ugen ],
      memory: {
        value: { length:1, idx:null }
      },
      initialized:false,
      name: `${ugen.name}_out${gen.getUID()}`
    })
  }

  return ugen
}

},{"./gen.js":30}],30:[function(require,module,exports){
'use strict'

/* gen.js
 *
 * low-level code generation for unit generators
 *
 */

let MemoryHelper = require( 'memory-helper' )

let gen = {

  accum:0,
  getUID() { return this.accum++ },
  debug:false,
  samplerate: 44100, // change on audiocontext creation
  shouldLocalize: false,
  globals:{
    windows: {},
  },
  mode:'worklet',
  
  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
   */

  closures: new Set(),
  params:   new Set(),
  inputs:   new Set(),

  parameters: new Set(),
  endBlock: new Set(),
  histories: new Map(),

  memo: {},

  //data: {},
  
  /* export
   *
   * place gen functions into another object for easier reference
   */

  export( obj ) {},

  addToEndBlock( v ) {
    this.endBlock.add( '  ' + v )
  },
  
  requestMemory( memorySpec, immutable=false ) {
    for( let key in memorySpec ) {
      let request = memorySpec[ key ]

      //console.log( 'requesting ' + key + ':' , JSON.stringify( request ) )

      if( request.length === undefined ) {
        console.log( 'undefined length for:', key )

        continue
      }

      request.idx = gen.memory.alloc( request.length, immutable )
    }
  },

  createMemory( amount, type ) {
    const mem = MemoryHelper.create( mem, type )
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
  
  createCallback( ugen, mem, debug = false, shouldInlineMemory=false, memType = Float64Array ) {
    let isStereo = Array.isArray( ugen ) && ugen.length > 1,
        callback, 
        channel1, channel2

    if( typeof mem === 'number' || mem === undefined ) {
      mem = MemoryHelper.create( mem, memType )
    }
    
    //console.log( 'cb memory:', mem )
    this.memory = mem
    this.outputIdx = this.memory.alloc( 2, true )
    this.memo = {} 
    this.endBlock.clear()
    this.closures.clear()
    this.inputs.clear()
    this.params.clear()
    //this.globals = { windows:{} }
    
    this.parameters.clear()
    
    this.functionBody = "  'use strict'\n"
    if( shouldInlineMemory===false ) {
      this.functionBody += this.mode === 'worklet' ? 
        "  var memory = this.memory\n\n" :
        "  var memory = gen.memory\n\n"
    }

    // call .gen() on the head of the graph we are generating the callback for
    //console.log( 'HEAD', ugen )
    for( let i = 0; i < 1 + isStereo; i++ ) {
      if( typeof ugen[i] === 'number' ) continue

      //let channel = isStereo ? ugen[i].gen() : ugen.gen(),
      let channel = isStereo ? this.getInput( ugen[i] ) : this.getInput( ugen ), 
          body = ''

      // if .gen() returns array, add ugen callback (graphOutput[1]) to our output functions body
      // and then return name of ugen. If .gen() only generates a number (for really simple graphs)
      // just return that number (graphOutput[0]).
      body += Array.isArray( channel ) ? channel[1] + '\n' + channel[0] : channel

      // split body to inject return keyword on last line
      body = body.split('\n')
     
      //if( debug ) console.log( 'functionBody length', body )
      
      // next line is to accommodate memo as graph head
      if( body[ body.length -1 ].trim().indexOf('let') > -1 ) { body.push( '\n' ) } 

      // get index of last line
      let lastidx = body.length - 1

      // insert return keyword
      body[ lastidx ] = '  memory[' + (this.outputIdx + i) + ']  = ' + body[ lastidx ] + '\n'

      this.functionBody += body.join('\n')
    }
    
    this.histories.forEach( value => {
      if( value !== null )
        value.gen()      
    })

    const returnStatement = isStereo ? `  return [ memory[${this.outputIdx}], memory[${this.outputIdx + 1}] ]` : `  return memory[${this.outputIdx}]`
    
    this.functionBody = this.functionBody.split('\n')

    if( this.endBlock.size ) { 
      this.functionBody = this.functionBody.concat( Array.from( this.endBlock ) )
      this.functionBody.push( returnStatement )
    }else{
      this.functionBody.push( returnStatement )
    }
    // reassemble function body
    this.functionBody = this.functionBody.join('\n')

    // we can only dynamically create a named function by dynamically creating another function
    // to construct the named function! sheesh...
    //
    if( shouldInlineMemory === true ) {
      this.parameters.add( 'memory' )
    }

    let paramString = ''
    if( this.mode === 'worklet' ) {
      for( let name of this.parameters.values() ) {
        paramString += name + ','
      }
      paramString = paramString.slice(0,-1)
    }

    const separator = this.parameters.size !== 0 && this.inputs.size > 0 ? ', ' : ''

    let inputString = ''
    if( this.mode === 'worklet' ) {
      for( let ugen of this.inputs.values() ) {
        inputString+= ugen.name + ','
      }
      inputString = inputString.slice(0,-1)
    }

    let buildString = this.mode === 'worklet'
      ? `return function( ${inputString} ${separator} ${paramString} ){ \n${ this.functionBody }\n}`
      : `return function gen( ${ [...this.parameters].join(',') } ){ \n${ this.functionBody }\n}`
    
    if( this.debug || debug ) console.log( buildString ) 

    callback = new Function( buildString )()

    // assign properties to named function
    for( let dict of this.closures.values() ) {
      let name = Object.keys( dict )[0],
          value = dict[ name ]

      callback[ name ] = value
    }

    for( let dict of this.params.values() ) {
      let name = Object.keys( dict )[0],
          ugen = dict[ name ]
      
      Object.defineProperty( callback, name, {
        configurable: true,
        get() { return ugen.value },
        set(v){ ugen.value = v }
      })
      //callback[ name ] = value
    }

    callback.members = this.closures
    callback.data = this.data
    callback.params = this.params
    callback.inputs = this.inputs
    callback.parameters = this.parameters//.slice( 0 )
    callback.isStereo = isStereo

    //if( MemoryHelper.isPrototypeOf( this.memory ) ) 
    callback.memory = this.memory.heap

    this.histories.clear()

    return callback
  },
  
  /* getInputs
   *
   * Called by each individual ugen when their .gen() method is called to resolve their various inputs.
   * If an input is a number, return the number. If
   * it is an ugen, call .gen() on the ugen, memoize the result and return the result. If the
   * ugen has previously been memoized return the memoized value.
   *
   */
  getInputs( ugen ) {
    return ugen.inputs.map( gen.getInput ) 
  },

  getInput( input ) {
    let isObject = typeof input === 'object',
        processedInput

    if( isObject ) { // if input is a ugen... 
      //console.log( input.name, gen.memo[ input.name ] )
      if( gen.memo[ input.name ] ) { // if it has been memoized...
        processedInput = gen.memo[ input.name ]
      }else if( Array.isArray( input ) ) {
        gen.getInput( input[0] )
        gen.getInput( input[1] )
      }else{ // if not memoized generate code  
        if( typeof input.gen !== 'function' ) {
          console.log( 'no gen found:', input, input.gen )
        }
        let code = input.gen()
        //if( code.indexOf( 'Object' ) > -1 ) console.log( 'bad input:', input, code )
        
        if( Array.isArray( code ) ) {
          if( !gen.shouldLocalize ) {
            gen.functionBody += code[1]
          }else{
            gen.codeName = code[0]
            gen.localizedCode.push( code[1] )
          }
          //console.log( 'after GEN' , this.functionBody )
          processedInput = code[0]
        }else{
          processedInput = code
        }
      }
    }else{ // it input is a number
      processedInput = input
    }

    return processedInput
  },

  startLocalize() {
    this.localizedCode = []
    this.shouldLocalize = true
  },
  endLocalize() {
    this.shouldLocalize = false

    return [ this.codeName, this.localizedCode.slice(0) ]
  },

  free( graph ) {
    if( Array.isArray( graph ) ) { // stereo ugen
      for( let channel of graph ) {
        this.free( channel )
      }
    } else {
      if( typeof graph === 'object' ) {
        if( graph.memory !== undefined ) {
          for( let memoryKey in graph.memory ) {
            this.memory.free( graph.memory[ memoryKey ].idx )
          }
        }
        if( Array.isArray( graph.inputs ) ) {
          for( let ugen of graph.inputs ) {
            this.free( ugen )
          }
        }
      }
    }
  }
}

module.exports = gen

},{"memory-helper":141}],31:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'gt',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    out = `  var ${this.name} = `  

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out += `(( ${inputs[0]} > ${inputs[1]}) | 0 )`
    } else {
      out += inputs[0] > inputs[1] ? 1 : 0 
    }
    out += '\n\n'

    gen.memo[ this.name ] = this.name

    return [this.name, out]
  }
}

module.exports = (x,y) => {
  let gt = Object.create( proto )

  gt.inputs = [ x,y ]
  gt.name = gt.basename + gen.getUID()

  return gt
}

},{"./gen.js":30}],32:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  name:'gte',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    out = `  var ${this.name} = `  

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out += `( ${inputs[0]} >= ${inputs[1]} | 0 )`
    } else {
      out += inputs[0] >= inputs[1] ? 1 : 0 
    }
    out += '\n\n'

    gen.memo[ this.name ] = this.name

    return [this.name, out]
  }
}

module.exports = (x,y) => {
  let gt = Object.create( proto )

  gt.inputs = [ x,y ]
  gt.name = 'gte' + gen.getUID()

  return gt
}

},{"./gen.js":30}],33:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'gtp',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out = `(${inputs[ 0 ]} * ( ( ${inputs[0]} > ${inputs[1]} ) | 0 ) )` 
    } else {
      out = inputs[0] * ( ( inputs[0] > inputs[1] ) | 0 )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let gtp = Object.create( proto )

  gtp.inputs = [ x,y ]

  return gtp
}

},{"./gen.js":30}],34:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

module.exports = ( in1=0 ) => {
  let ugen = {
    inputs: [ in1 ],
    memory: { value: { length:1, idx: null } },
    recorder: null,

    in( v ) {
      if( gen.histories.has( v ) ){
        let memoHistory = gen.histories.get( v )
        ugen.name = memoHistory.name
        return memoHistory
      }

      let obj = {
        gen() {
          let inputs = gen.getInputs( ugen )

          if( ugen.memory.value.idx === null ) {
            gen.requestMemory( ugen.memory )
            gen.memory.heap[ ugen.memory.value.idx ] = in1
          }

          let idx = ugen.memory.value.idx
          
          gen.addToEndBlock( 'memory[ ' + idx + ' ] = ' + inputs[ 0 ] )
          
          // return ugen that is being recorded instead of ssd.
          // this effectively makes a call to ssd.record() transparent to the graph.
          // recording is triggered by prior call to gen.addToEndBlock.
          gen.histories.set( v, obj )

          return inputs[ 0 ]
        },
        name: ugen.name + '_in'+gen.getUID(),
        memory: ugen.memory
      }

      this.inputs[ 0 ] = v
      
      ugen.recorder = obj

      return obj
    },
    
    out: {
            
      gen() {
        if( ugen.memory.value.idx === null ) {
          if( gen.histories.get( ugen.inputs[0] ) === undefined ) {
            gen.histories.set( ugen.inputs[0], ugen.recorder )
          }
          gen.requestMemory( ugen.memory )
          gen.memory.heap[ ugen.memory.value.idx ] = parseFloat( in1 )
        }
        let idx = ugen.memory.value.idx
         
        return 'memory[ ' + idx + ' ] '
      },
    },

    uid: gen.getUID(),
  }
  
  ugen.out.memory = ugen.memory 

  ugen.name = 'history' + ugen.uid
  ugen.out.name = ugen.name + '_out'
  ugen.in._name  = ugen.name = '_in'

  Object.defineProperty( ugen, 'value', {
    get() {
      if( this.memory.value.idx !== null ) {
        return gen.memory.heap[ this.memory.value.idx ]
      }
    },
    set( v ) {
      if( this.memory.value.idx !== null ) {
        gen.memory.heap[ this.memory.value.idx ] = v 
      }
    }
  })

  return ugen
}

},{"./gen.js":30}],35:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'ifelse',

  gen() {
    let conditionals = this.inputs[0],
        defaultValue = gen.getInput( conditionals[ conditionals.length - 1] ),
        out = `  var ${this.name}_out = ${defaultValue}\n` 

    //console.log( 'conditionals:', this.name, conditionals )

    //console.log( 'defaultValue:', defaultValue )

    for( let i = 0; i < conditionals.length - 2; i+= 2 ) {
      let isEndBlock = i === conditionals.length - 3,
          cond  = gen.getInput( conditionals[ i ] ),
          preblock = conditionals[ i+1 ],
          block, blockName, output

      //console.log( 'pb', preblock )

      if( typeof preblock === 'number' ){
        block = preblock
        blockName = null
      }else{
        if( gen.memo[ preblock.name ] === undefined ) {
          // used to place all code dependencies in appropriate blocks
          gen.startLocalize()

          gen.getInput( preblock )

          block = gen.endLocalize()
          blockName = block[0]
          block = block[ 1 ].join('')
          block = '  ' + block.replace( /\n/gi, '\n  ' )
        }else{
          block = ''
          blockName = gen.memo[ preblock.name ]
        }
      }

      output = blockName === null ? 
        `  ${this.name}_out = ${block}` :
        `${block}  ${this.name}_out = ${blockName}`
      
      if( i===0 ) out += ' '
      out += 
` if( ${cond} === 1 ) {
${output}
  }`

      if( !isEndBlock ) {
        out += ` else`
      }else{
        out += `\n`
      }
    }

    gen.memo[ this.name ] = `${this.name}_out`

    return [ `${this.name}_out`, out ]
  }
}

module.exports = ( ...args  ) => {
  let ugen = Object.create( proto ),
      conditions = Array.isArray( args[0] ) ? args[0] : args

  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ conditions ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":30}],36:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  basename:'in',

  gen() {
    const isWorklet = gen.mode === 'worklet'

    if( isWorklet ) {
      gen.inputs.add( this )
    }else{
      gen.parameters.add( this.name )
    }

    gen.memo[ this.name ] = isWorklet ? this.name + '[i]' : this.name

    return this.name
  } 
}

module.exports = ( name, inputNumber=0, channelNumber=0 ) => {
  let input = Object.create( proto )

  input.id   = gen.getUID()
  input.name = name !== undefined ? name : `${input.basename}${input.id}`
  input.inputNumber = inputNumber
  input.channelNumber = channelNumber

  input[0] = {
    gen() {
      if( ! gen.parameters.has( input.name ) ) gen.parameters.add( input.name )
      return input.name + '[0]'
    }
  }
  input[1] = {
    gen() {
      if( ! gen.parameters.has( input.name ) ) gen.parameters.add( input.name )
      return input.name + '[1]'
    }
  }


  return input
}

},{"./gen.js":30}],37:[function(require,module,exports){
'use strict'

const library = {
  export( destination ) {
    if( destination === window ) {
      destination.ssd = library.history    // history is window object property, so use ssd as alias
      destination.input = library.in       // in is a keyword in javascript
      destination.ternary = library.switch // switch is a keyword in javascript

      delete library.history
      delete library.in
      delete library.switch
    }

    Object.assign( destination, library )

    Object.defineProperty( library, 'samplerate', {
      get() { return library.gen.samplerate },
      set(v) {}
    })

    library.in = destination.input
    library.history = destination.ssd
    library.switch = destination.ternary

    destination.clip = library.clamp
  },

  gen:      require( './gen.js' ),
  
  abs:      require( './abs.js' ),
  round:    require( './round.js' ),
  param:    require( './param.js' ),
  add:      require( './add.js' ),
  sub:      require( './sub.js' ),
  mul:      require( './mul.js' ),
  div:      require( './div.js' ),
  accum:    require( './accum.js' ),
  counter:  require( './counter.js' ),
  sin:      require( './sin.js' ),
  cos:      require( './cos.js' ),
  tan:      require( './tan.js' ),
  tanh:     require( './tanh.js' ),
  asin:     require( './asin.js' ),
  acos:     require( './acos.js' ),
  atan:     require( './atan.js' ),  
  phasor:   require( './phasor.js' ),
  data:     require( './data.js' ),
  peek:     require( './peek.js' ),
  cycle:    require( './cycle.js' ),
  history:  require( './history.js' ),
  delta:    require( './delta.js' ),
  floor:    require( './floor.js' ),
  ceil:     require( './ceil.js' ),
  min:      require( './min.js' ),
  max:      require( './max.js' ),
  sign:     require( './sign.js' ),
  dcblock:  require( './dcblock.js' ),
  memo:     require( './memo.js' ),
  rate:     require( './rate.js' ),
  wrap:     require( './wrap.js' ),
  mix:      require( './mix.js' ),
  clamp:    require( './clamp.js' ),
  poke:     require( './poke.js' ),
  delay:    require( './delay.js' ),
  fold:     require( './fold.js' ),
  mod :     require( './mod.js' ),
  sah :     require( './sah.js' ),
  noise:    require( './noise.js' ),
  not:      require( './not.js' ),
  gt:       require( './gt.js' ),
  gte:      require( './gte.js' ),
  lt:       require( './lt.js' ), 
  lte:      require( './lte.js' ), 
  bool:     require( './bool.js' ),
  gate:     require( './gate.js' ),
  train:    require( './train.js' ),
  slide:    require( './slide.js' ),
  in:       require( './in.js' ),
  t60:      require( './t60.js'),
  mtof:     require( './mtof.js'),
  ltp:      require( './ltp.js'),        // TODO: test
  gtp:      require( './gtp.js'),        // TODO: test
  switch:   require( './switch.js' ),
  mstosamps:require( './mstosamps.js' ), // TODO: needs test,
  selector: require( './selector.js' ),
  utilities:require( './utilities.js' ),
  pow:      require( './pow.js' ),
  attack:   require( './attack.js' ),
  decay:    require( './decay.js' ),
  windows:  require( './windows.js' ),
  env:      require( './env.js' ),
  ad:       require( './ad.js'  ),
  adsr:     require( './adsr.js' ),
  ifelse:   require( './ifelseif.js' ),
  bang:     require( './bang.js' ),
  and:      require( './and.js' ),
  pan:      require( './pan.js' ),
  eq:       require( './eq.js' ),
  neq:      require( './neq.js' ),
  exp:      require( './exp.js' ),
  seq:      require( './seq.js' )
}

library.gen.lib = library

module.exports = library

},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./ad.js":4,"./add.js":5,"./adsr.js":6,"./and.js":7,"./asin.js":8,"./atan.js":9,"./attack.js":10,"./bang.js":11,"./bool.js":12,"./ceil.js":13,"./clamp.js":14,"./cos.js":15,"./counter.js":16,"./cycle.js":17,"./data.js":18,"./dcblock.js":19,"./decay.js":20,"./delay.js":21,"./delta.js":22,"./div.js":23,"./env.js":24,"./eq.js":25,"./exp.js":26,"./floor.js":27,"./fold.js":28,"./gate.js":29,"./gen.js":30,"./gt.js":31,"./gte.js":32,"./gtp.js":33,"./history.js":34,"./ifelseif.js":35,"./in.js":36,"./lt.js":38,"./lte.js":39,"./ltp.js":40,"./max.js":41,"./memo.js":42,"./min.js":43,"./mix.js":44,"./mod.js":45,"./mstosamps.js":46,"./mtof.js":47,"./mul.js":48,"./neq.js":49,"./noise.js":50,"./not.js":51,"./pan.js":52,"./param.js":53,"./peek.js":54,"./phasor.js":55,"./poke.js":56,"./pow.js":57,"./rate.js":58,"./round.js":59,"./sah.js":60,"./selector.js":61,"./seq.js":62,"./sign.js":63,"./sin.js":64,"./slide.js":65,"./sub.js":66,"./switch.js":67,"./t60.js":68,"./tan.js":69,"./tanh.js":70,"./train.js":71,"./utilities.js":72,"./windows.js":73,"./wrap.js":74}],38:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'lt',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    out = `  var ${this.name} = `  

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out += `(( ${inputs[0]} < ${inputs[1]}) | 0  )`
    } else {
      out += inputs[0] < inputs[1] ? 1 : 0 
    }
    out += '\n'

    gen.memo[ this.name ] = this.name

    return [this.name, out]
    
    return out
  }
}

module.exports = (x,y) => {
  let lt = Object.create( proto )

  lt.inputs = [ x,y ]
  lt.name = lt.basename + gen.getUID()

  return lt
}

},{"./gen.js":30}],39:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'lte',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    out = `  var ${this.name} = `  

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out += `( ${inputs[0]} <= ${inputs[1]} | 0  )`
    } else {
      out += inputs[0] <= inputs[1] ? 1 : 0 
    }
    out += '\n'

    gen.memo[ this.name ] = this.name

    return [this.name, out]
    
    return out
  }
}

module.exports = (x,y) => {
  let lt = Object.create( proto )

  lt.inputs = [ x,y ]
  lt.name = 'lte' + gen.getUID()

  return lt
}

},{"./gen.js":30}],40:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'ltp',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out = `(${inputs[ 0 ]} * (( ${inputs[0]} < ${inputs[1]} ) | 0 ) )` 
    } else {
      out = inputs[0] * (( inputs[0] < inputs[1] ) | 0 )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let ltp = Object.create( proto )

  ltp.inputs = [ x,y ]

  return ltp
}

},{"./gen.js":30}],41:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'max',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.max' : Math.max })

      out = `${ref}max( ${inputs[0]}, ${inputs[1]} )`

    } else {
      out = Math.max( parseFloat( inputs[0] ), parseFloat( inputs[1] ) )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let max = Object.create( proto )

  max.inputs = [ x,y ]

  return max
}

},{"./gen.js":30}],42:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  basename:'memo',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    out = `  var ${this.name} = ${inputs[0]}\n`

    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  } 
}

module.exports = (in1,memoName) => {
  let memo = Object.create( proto )
  
  memo.inputs = [ in1 ]
  memo.id   = gen.getUID()
  memo.name = memoName !== undefined ? memoName + '_' + gen.getUID() : `${memo.basename}${memo.id}`

  return memo
}

},{"./gen.js":30}],43:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'min',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.min' : Math.min })

      out = `${ref}min( ${inputs[0]}, ${inputs[1]} )`

    } else {
      out = Math.min( parseFloat( inputs[0] ), parseFloat( inputs[1] ) )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let min = Object.create( proto )

  min.inputs = [ x,y ]

  return min
}

},{"./gen.js":30}],44:[function(require,module,exports){
'use strict'

let gen = require('./gen.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    memo= require('./memo.js')

module.exports = ( in1, in2, t=.5 ) => {
  let ugen = memo( add( mul(in1, sub(1,t ) ), mul( in2, t ) ) )
  ugen.name = 'mix' + gen.getUID()

  return ugen
}

},{"./add.js":5,"./gen.js":30,"./memo.js":42,"./mul.js":48,"./sub.js":66}],45:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

module.exports = (...args) => {
  let mod = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out='(',
          diff = 0, 
          numCount = 0,
          lastNumber = inputs[ 0 ],
          lastNumberIsUgen = isNaN( lastNumber ), 
          modAtEnd = false

      inputs.forEach( (v,i) => {
        if( i === 0 ) return

        let isNumberUgen = isNaN( v ),
            isFinalIdx   = i === inputs.length - 1

        if( !lastNumberIsUgen && !isNumberUgen ) {
          lastNumber = lastNumber % v
          out += lastNumber
        }else{
          out += `${lastNumber} % ${v}`
        }

        if( !isFinalIdx ) out += ' % ' 
      })

      out += ')'

      return out
    }
  }
  
  return mod
}

},{"./gen.js":30}],46:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'mstosamps',

  gen() {
    let out,
        inputs = gen.getInputs( this ),
        returnValue

    if( isNaN( inputs[0] ) ) {
      out = `  var ${this.name } = ${gen.samplerate} / 1000 * ${inputs[0]} \n\n`
     
      gen.memo[ this.name ] = out
      
      returnValue = [ this.name, out ]
    } else {
      out = gen.samplerate / 1000 * this.inputs[0]

      returnValue = out
    }    

    return returnValue
  }
}

module.exports = x => {
  let mstosamps = Object.create( proto )

  mstosamps.inputs = [ x ]
  mstosamps.name = proto.basename + gen.getUID()

  return mstosamps
}

},{"./gen.js":30}],47:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'mtof',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.exp })

      out = `( ${this.tuning} * gen.exp( .057762265 * (${inputs[0]} - 69) ) )`

    } else {
      out = this.tuning * Math.exp( .057762265 * ( inputs[0] - 69) )
    }
    
    return out
  }
}

module.exports = ( x, props ) => {
  let ugen = Object.create( proto ),
      defaults = { tuning:440 }
  
  if( props !== undefined ) Object.assign( props.defaults )

  Object.assign( ugen, defaults )
  ugen.inputs = [ x ]
  

  return ugen
}

},{"./gen.js":30}],48:[function(require,module,exports){
'use strict'

const gen = require('./gen.js')

const proto = {
  basename: 'mul',

  gen() {
    let inputs = gen.getInputs( this ),
        out = `  var ${this.name} = `,
        sum = 1, numCount = 0, mulAtEnd = false, alreadyFullSummed = true

    inputs.forEach( (v,i) => {
      if( isNaN( v ) ) {
        out += v
        if( i < inputs.length -1 ) {
          mulAtEnd = true
          out += ' * '
        }
        alreadyFullSummed = false
      }else{
        if( i === 0 ) {
          sum = v
        }else{
          sum *= parseFloat( v )
        }
        numCount++
      }
    })

    if( numCount > 0 ) {
      out += mulAtEnd || alreadyFullSummed ? sum : ' * ' + sum
    }

    out += '\n'

    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  }
}

module.exports = ( ...args ) => {
  const mul = Object.create( proto )
  
  Object.assign( mul, {
      id:     gen.getUID(),
      inputs: args,
  })
  
  mul.name = mul.basename + mul.id

  return mul
}

},{"./gen.js":30}],49:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'neq',

  gen() {
    let inputs = gen.getInputs( this ), out

    out = /*this.inputs[0] !== this.inputs[1] ? 1 :*/ `  var ${this.name} = (${inputs[0]} !== ${inputs[1]}) | 0\n\n`

    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  },

}

module.exports = ( in1, in2 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ in1, in2 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":30}],50:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'noise',

  gen() {
    let out

    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    gen.closures.add({ 'noise' : isWorklet ? 'Math.random' : Math.random })

    out = `  var ${this.name} = ${ref}noise()\n`
    
    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  }
}

module.exports = x => {
  let noise = Object.create( proto )
  noise.name = proto.name + gen.getUID()

  return noise
}

},{"./gen.js":30}],51:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'not',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( this.inputs[0] ) ) {
      out = `( ${inputs[0]} === 0 ? 1 : 0 )`
    } else {
      out = !inputs[0] === 0 ? 1 : 0
    }
    
    return out
  }
}

module.exports = x => {
  let not = Object.create( proto )

  not.inputs = [ x ]

  return not
}

},{"./gen.js":30}],52:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' ),
    data = require( './data.js' ),
    peek = require( './peek.js' ),
    mul  = require( './mul.js' )

let proto = {
  basename:'pan', 
  initTable() {    
    let bufferL = new Float32Array( 1024 ),
        bufferR = new Float32Array( 1024 )

    const angToRad = Math.PI / 180
    for( let i = 0; i < 1024; i++ ) { 
      let pan = i * ( 90 / 1024 )
      bufferL[i] = Math.cos( pan * angToRad ) 
      bufferR[i] = Math.sin( pan * angToRad )
    }

    gen.globals.panL = data( bufferL, 1, { immutable:true })
    gen.globals.panR = data( bufferR, 1, { immutable:true })
  }

}

module.exports = ( leftInput, rightInput, pan =.5, properties ) => {
  if( gen.globals.panL === undefined ) proto.initTable()

  let ugen = Object.create( proto )

  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ leftInput, rightInput ],
    left:    mul( leftInput, peek( gen.globals.panL, pan, { boundmode:'clamp' }) ),
    right:   mul( rightInput, peek( gen.globals.panR, pan, { boundmode:'clamp' }) )
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./data.js":18,"./gen.js":30,"./mul.js":48,"./peek.js":54}],53:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  basename: 'param',

  gen() {
    gen.requestMemory( this.memory )
    
    gen.params.add( this )

    const isWorklet = gen.mode === 'worklet'

    if( isWorklet ) gen.parameters.add( this.name )

    this.value = this.initialValue

    gen.memo[ this.name ] = isWorklet ? this.name + '[i]' : `memory[${this.memory.value.idx}]`

    return gen.memo[ this.name ]
  } 
}

module.exports = ( propName=0, value=0, min=0, max=1 ) => {
  let ugen = Object.create( proto )
  
  if( typeof propName !== 'string' ) {
    ugen.name = ugen.basename + gen.getUID()
    ugen.initialValue = propName
  }else{
    ugen.name = propName
    ugen.initialValue = value
  }

  ugen.min = min
  ugen.max = max

  // for storing worklet nodes once they're instantiated
  ugen.waapi = null

  ugen.isWorklet = gen.mode === 'worklet'

  Object.defineProperty( ugen, 'value', {
    get() {
      if( this.memory.value.idx !== null ) {
        return gen.memory.heap[ this.memory.value.idx ]
      }
    },
    set( v ) {
      if( this.memory.value.idx !== null ) {
        if( this.isWorklet && this.waapi !== null ) {
          this.waapi.value = v
        }else{
          gen.memory.heap[ this.memory.value.idx ] = v
        } 
      }
    }
  })

  ugen.memory = {
    value: { length:1, idx:null }
  }

  return ugen
}

},{"./gen.js":30}],54:[function(require,module,exports){
'use strict'

const gen  = require('./gen.js'),
      dataUgen = require('./data.js')

let proto = {
  basename:'peek',

  gen() {
    let genName = 'gen.' + this.name,
        inputs = gen.getInputs( this ),
        out, functionBody, next, lengthIsLog2, idx
    
    idx = inputs[1]
    lengthIsLog2 = (Math.log2( this.data.buffer.length ) | 0)  === Math.log2( this.data.buffer.length )

    if( this.mode !== 'simple' ) {

    functionBody = `  var ${this.name}_dataIdx  = ${idx}, 
      ${this.name}_phase = ${this.mode === 'samples' ? inputs[0] : inputs[0] + ' * ' + (this.data.buffer.length) }, 
      ${this.name}_index = ${this.name}_phase | 0,\n`

    if( this.boundmode === 'wrap' ) {
      next = lengthIsLog2 ?
      `( ${this.name}_index + 1 ) & (${this.data.buffer.length} - 1)` :
      `${this.name}_index + 1 >= ${this.data.buffer.length} ? ${this.name}_index + 1 - ${this.data.buffer.length} : ${this.name}_index + 1`
    }else if( this.boundmode === 'clamp' ) {
      next = 
        `${this.name}_index + 1 >= ${this.data.buffer.length - 1} ? ${this.data.buffer.length - 1} : ${this.name}_index + 1`
    } else if( this.boundmode === 'fold' || this.boundmode === 'mirror' ) {
      next = 
        `${this.name}_index + 1 >= ${this.data.buffer.length - 1} ? ${this.name}_index - ${this.data.buffer.length - 1} : ${this.name}_index + 1`
    }else{
       next = 
      `${this.name}_index + 1`     
    }

    if( this.interp === 'linear' ) {      
    functionBody += `      ${this.name}_frac  = ${this.name}_phase - ${this.name}_index,
      ${this.name}_base  = memory[ ${this.name}_dataIdx +  ${this.name}_index ],
      ${this.name}_next  = ${next},`
      
      if( this.boundmode === 'ignore' ) {
        functionBody += `
      ${this.name}_out   = ${this.name}_index >= ${this.data.buffer.length - 1} || ${this.name}_index < 0 ? 0 : ${this.name}_base + ${this.name}_frac * ( memory[ ${this.name}_dataIdx + ${this.name}_next ] - ${this.name}_base )\n\n`
      }else{
        functionBody += `
      ${this.name}_out   = ${this.name}_base + ${this.name}_frac * ( memory[ ${this.name}_dataIdx + ${this.name}_next ] - ${this.name}_base )\n\n`
      }
    }else{
      functionBody += `      ${this.name}_out = memory[ ${this.name}_dataIdx + ${this.name}_index ]\n\n`
    }

    } else { // mode is simple
      functionBody = `memory[ ${idx} + ${ inputs[0] } ]`
      
      return functionBody
    }

    gen.memo[ this.name ] = this.name + '_out'

    return [ this.name+'_out', functionBody ]
  },

  defaults : { channels:1, mode:'phase', interp:'linear', boundmode:'wrap' }
}

module.exports = ( input_data, index=0, properties ) => {
  let ugen = Object.create( proto )

  //console.log( dataUgen, gen.data )

  // XXX why is dataUgen not the actual function? some type of browserify nonsense...
  const finalData = typeof input_data.basename === 'undefined' ? gen.lib.data( input_data ) : input_data

  Object.assign( ugen, 
    { 
      'data':     finalData,
      dataName:   finalData.name,
      uid:        gen.getUID(),
      inputs:     [ index, finalData ],
    },
    proto.defaults,
    properties 
  )
  
  ugen.name = ugen.basename + ugen.uid

  return ugen
}

},{"./data.js":18,"./gen.js":30}],55:[function(require,module,exports){
'use strict'

let gen   = require( './gen.js' ),
    accum = require( './accum.js' ),
    mul   = require( './mul.js' ),
    proto = { basename:'phasor' },
    div   = require( './div.js' )

const defaults = { min: -1, max: 1 }

module.exports = ( frequency = 1, reset = 0, _props ) => {
  const props = Object.assign( {}, defaults, _props )

  const range = props.max - props.min

  const ugen = typeof frequency === 'number' 
    ? accum( (frequency * range) / gen.samplerate, reset, props ) 
    : accum( 
        div( 
          mul( frequency, range ),
          gen.samplerate
        ), 
        reset, props 
    )

  ugen.name = proto.basename + gen.getUID()

  return ugen
}

},{"./accum.js":2,"./div.js":23,"./gen.js":30,"./mul.js":48}],56:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js'),
    mul  = require('./mul.js'),
    wrap = require('./wrap.js')

let proto = {
  basename:'poke',

  gen() {
    let dataName = 'memory',
        inputs = gen.getInputs( this ),
        idx, out, wrapped
    
    idx = this.data.gen()

    //gen.requestMemory( this.memory )
    //wrapped = wrap( this.inputs[1], 0, this.dataLength ).gen()
    //idx = wrapped[0]
    //gen.functionBody += wrapped[1]
    let outputStr = this.inputs[1] === 0 ?
      `  ${dataName}[ ${idx} ] = ${inputs[0]}\n` :
      `  ${dataName}[ ${idx} + ${inputs[1]} ] = ${inputs[0]}\n`

    if( this.inline === undefined ) {
      gen.functionBody += outputStr
    }else{
      return [ this.inline, outputStr ]
    }
  }
}
module.exports = ( data, value, index, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { channels:1 } 

  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, { 
    data,
    dataName:   data.name,
    dataLength: data.buffer.length,
    uid:        gen.getUID(),
    inputs:     [ value, index ],
  },
  defaults )


  ugen.name = ugen.basename + ugen.uid
  
  gen.histories.set( ugen.name, ugen )

  return ugen
}

},{"./gen.js":30,"./mul.js":48,"./wrap.js":74}],57:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'pow',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
      gen.closures.add({ 'pow': isWorklet ? 'Math.pow' : Math.pow })

      out = `${ref}pow( ${inputs[0]}, ${inputs[1]} )` 

    } else {
      if( typeof inputs[0] === 'string' && inputs[0][0] === '(' ) {
        inputs[0] = inputs[0].slice(1,-1)
      }
      if( typeof inputs[1] === 'string' && inputs[1][0] === '(' ) {
        inputs[1] = inputs[1].slice(1,-1)
      }

      out = Math.pow( parseFloat( inputs[0] ), parseFloat( inputs[1]) )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let pow = Object.create( proto )

  pow.inputs = [ x,y ]
  pow.id = gen.getUID()
  pow.name = `${pow.basename}{pow.id}`

  return pow
}

},{"./gen.js":30}],58:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' ),
    add     = require( './add.js' ),
    mul     = require( './mul.js' ),
    memo    = require( './memo.js' ),
    delta   = require( './delta.js' ),
    wrap    = require( './wrap.js' )

let proto = {
  basename:'rate',

  gen() {
    let inputs = gen.getInputs( this ),
        phase  = history(),
        inMinus1 = history(),
        genName = 'gen.' + this.name,
        filter, sum, out

    gen.closures.add({ [ this.name ]: this }) 

    out = 
` var ${this.name}_diff = ${inputs[0]} - ${genName}.lastSample
  if( ${this.name}_diff < -.5 ) ${this.name}_diff += 1
  ${genName}.phase += ${this.name}_diff * ${inputs[1]}
  if( ${genName}.phase > 1 ) ${genName}.phase -= 1
  ${genName}.lastSample = ${inputs[0]}
`
    out = ' ' + out

    return [ genName + '.phase', out ]
  }
}

module.exports = ( in1, rate ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    phase:      0,
    lastSample: 0,
    uid:        gen.getUID(),
    inputs:     [ in1, rate ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./add.js":5,"./delta.js":22,"./gen.js":30,"./history.js":34,"./memo.js":42,"./mul.js":48,"./sub.js":66,"./wrap.js":74}],59:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'round',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.round' : Math.round })

      out = `${ref}round( ${inputs[0]} )`

    } else {
      out = Math.round( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let round = Object.create( proto )

  round.inputs = [ x ]

  return round
}

},{"./gen.js":30}],60:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' )

let proto = {
  basename:'sah',

  gen() {
    let inputs = gen.getInputs( this ), out

    //gen.data[ this.name ] = 0
    //gen.data[ this.name + '_control' ] = 0

    gen.requestMemory( this.memory )


    out = 
` var ${this.name}_control = memory[${this.memory.control.idx}],
      ${this.name}_trigger = ${inputs[1]} > ${inputs[2]} ? 1 : 0

  if( ${this.name}_trigger !== ${this.name}_control  ) {
    if( ${this.name}_trigger === 1 ) 
      memory[${this.memory.value.idx}] = ${inputs[0]}
    
    memory[${this.memory.control.idx}] = ${this.name}_trigger
  }
`
    
    gen.memo[ this.name ] = `memory[${this.memory.value.idx}]`//`gen.data.${this.name}`

    return [ `memory[${this.memory.value.idx}]`, ' ' +out ]
  }
}

module.exports = ( in1, control, threshold=0, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { init:0 }

  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, { 
    lastSample: 0,
    uid:        gen.getUID(),
    inputs:     [ in1, control,threshold ],
    memory: {
      control: { idx:null, length:1 },
      value:   { idx:null, length:1 },
    }
  },
  defaults )
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":30}],61:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'selector',

  gen() {
    let inputs = gen.getInputs( this ), out, returnValue = 0
    
    switch( inputs.length ) {
      case 2 :
        returnValue = inputs[1]
        break;
      case 3 :
        out = `  var ${this.name}_out = ${inputs[0]} === 1 ? ${inputs[1]} : ${inputs[2]}\n\n`;
        returnValue = [ this.name + '_out', out ]
        break;  
      default:
        out = 
` var ${this.name}_out = 0
  switch( ${inputs[0]} + 1 ) {\n`

        for( let i = 1; i < inputs.length; i++ ){
          out +=`    case ${i}: ${this.name}_out = ${inputs[i]}; break;\n` 
        }

        out += '  }\n\n'
        
        returnValue = [ this.name + '_out', ' ' + out ]
    }

    gen.memo[ this.name ] = this.name + '_out'

    return returnValue
  },
}

module.exports = ( ...inputs ) => {
  let ugen = Object.create( proto )
  
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":30}],62:[function(require,module,exports){
'use strict'

let gen   = require( './gen.js' ),
    accum = require( './accum.js' ),
    counter= require( './counter.js' ),
    peek  = require( './peek.js' ),
    ssd   = require( './history.js' ),
    data  = require( './data.js' ),
    proto = { basename:'seq' }

module.exports = ( durations = 11025, values = [0,1], phaseIncrement = 1) => {
  let clock
  
  if( Array.isArray( durations ) ) {
    // we want a counter that is using our current
    // rate value, but we want the rate value to be derived from
    // the counter. must insert a single-sample dealy to avoid
    // infinite loop.
    const clock2 = counter( 0, 0, durations.length )
    const __durations = peek( data( durations ), clock2, { mode:'simple' }) 
    clock = counter( phaseIncrement, 0, __durations )
    
    // add one sample delay to avoid codegen loop
    const s = ssd()
    s.in( clock.wrap )
    clock2.inputs[0] = s.out
  }else{
    // if the rate argument is a single value we don't need to
    // do anything tricky.
    clock = counter( phaseIncrement, 0, durations )
  }
  
  const stepper = accum( clock.wrap, 0, { min:0, max:values.length })
   
  const ugen = peek( data( values ), stepper, { mode:'simple' })

  ugen.name = proto.basename + gen.getUID()

  return ugen
}

},{"./accum.js":2,"./counter.js":16,"./data.js":18,"./gen.js":30,"./history.js":34,"./peek.js":54}],63:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'sign',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: isWorklet ? 'Math.sign' : Math.sign })

      out = `${ref}sign( ${inputs[0]} )`

    } else {
      out = Math.sign( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let sign = Object.create( proto )

  sign.inputs = [ x ]

  return sign
}

},{"./gen.js":30}],64:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'sin',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'sin': isWorklet ? 'Math.sin' : Math.sin })

      out = `${ref}sin( ${inputs[0]} )` 

    } else {
      out = Math.sin( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let sin = Object.create( proto )

  sin.inputs = [ x ]
  sin.id = gen.getUID()
  sin.name = `${sin.basename}{sin.id}`

  return sin
}

},{"./gen.js":30}],65:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' ),
    add     = require( './add.js' ),
    mul     = require( './mul.js' ),
    memo    = require( './memo.js' ),
    gt      = require( './gt.js' ),
    div     = require( './div.js' ),
    _switch = require( './switch.js' )

module.exports = ( in1, slideUp = 1, slideDown = 1 ) => {
  let y1 = history(0),
      filter, slideAmount

  //y (n) = y (n-1) + ((x (n) - y (n-1))/slide) 
  slideAmount = _switch( gt(in1,y1.out), slideUp, slideDown )

  filter = memo( add( y1.out, div( sub( in1, y1.out ), slideAmount ) ) )

  y1.in( filter )

  return filter
}

},{"./add.js":5,"./div.js":23,"./gen.js":30,"./gt.js":31,"./history.js":34,"./memo.js":42,"./mul.js":48,"./sub.js":66,"./switch.js":67}],66:[function(require,module,exports){
'use strict'

const gen = require('./gen.js')

const proto = {
  basename:'sub',
  gen() {
    let inputs = gen.getInputs( this ),
        out=0,
        diff = 0,
        needsParens = false, 
        numCount = 0,
        lastNumber = inputs[ 0 ],
        lastNumberIsUgen = isNaN( lastNumber ), 
        subAtEnd = false,
        hasUgens = false,
        returnValue = 0

    this.inputs.forEach( value => { if( isNaN( value ) ) hasUgens = true })

    out = '  var ' + this.name + ' = '

    inputs.forEach( (v,i) => {
      if( i === 0 ) return

      let isNumberUgen = isNaN( v ),
          isFinalIdx   = i === inputs.length - 1

      if( !lastNumberIsUgen && !isNumberUgen ) {
        lastNumber = lastNumber - v
        out += lastNumber
        return
      }else{
        needsParens = true
        out += `${lastNumber} - ${v}`
      }

      if( !isFinalIdx ) out += ' - ' 
    })

    out += '\n'

    returnValue = [ this.name, out ]

    gen.memo[ this.name ] = this.name

    return returnValue
  }

}

module.exports = ( ...args ) => {
  let sub = Object.create( proto )

  Object.assign( sub, {
    id:     gen.getUID(),
    inputs: args
  })
       
  sub.name = 'sub' + sub.id

  return sub
}

},{"./gen.js":30}],67:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'switch',

  gen() {
    let inputs = gen.getInputs( this ), out

    if( inputs[1] === inputs[2] ) return inputs[1] // if both potential outputs are the same just return one of them
    
    out = `  var ${this.name}_out = ${inputs[0]} === 1 ? ${inputs[1]} : ${inputs[2]}\n`

    gen.memo[ this.name ] = `${this.name}_out`

    return [ `${this.name}_out`, out ]
  },

}

module.exports = ( control, in1 = 1, in2 = 0 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ control, in1, in2 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":30}],68:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'t60',

  gen() {
    let out,
        inputs = gen.getInputs( this ),
        returnValue

    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ 'exp' ]: isWorklet ? 'Math.exp' : Math.exp })

      out = `  var ${this.name} = ${ref}exp( -6.907755278921 / ${inputs[0]} )\n\n`
     
      gen.memo[ this.name ] = out
      
      returnValue = [ this.name, out ]
    } else {
      out = Math.exp( -6.907755278921 / inputs[0] )

      returnValue = out
    }    

    return returnValue
  }
}

module.exports = x => {
  let t60 = Object.create( proto )

  t60.inputs = [ x ]
  t60.name = proto.basename + gen.getUID()

  return t60
}

},{"./gen.js":30}],69:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'tan',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'tan': isWorklet ? 'Math.tan' : Math.tan })

      out = `${ref}tan( ${inputs[0]} )` 

    } else {
      out = Math.tan( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let tan = Object.create( proto )

  tan.inputs = [ x ]
  tan.id = gen.getUID()
  tan.name = `${tan.basename}{tan.id}`

  return tan
}

},{"./gen.js":30}],70:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'tanh',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'tanh': isWorklet ? 'Math.tan' : Math.tanh })

      out = `${ref}tanh( ${inputs[0]} )` 

    } else {
      out = Math.tanh( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let tanh = Object.create( proto )

  tanh.inputs = [ x ]
  tanh.id = gen.getUID()
  tanh.name = `${tanh.basename}{tanh.id}`

  return tanh
}

},{"./gen.js":30}],71:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    lt      = require( './lt.js' ),
    phasor  = require( './phasor.js' )

module.exports = ( frequency=440, pulsewidth=.5 ) => {
  let graph = lt( accum( div( frequency, 44100 ) ), .5 )

  graph.name = `train${gen.getUID()}`

  return graph
}


},{"./gen.js":30,"./lt.js":38,"./phasor.js":55}],72:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' ),
    data = require( './data.js' )

let isStereo = false

let utilities = {
  ctx: null,

  clear() {
    if( this.workletNode !== undefined ) {
      this.workletNode.disconnect()
    }else{
      this.callback = () => 0
    }
    this.clear.callbacks.forEach( v => v() )
    this.clear.callbacks.length = 0
  },

  createContext() {
    let AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext
    this.ctx = new AC()

    gen.samplerate = this.ctx.sampleRate

    let start = () => {
      if( typeof AC !== 'undefined' ) {
        if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
          window.removeEventListener( 'touchstart', start )

          if( 'ontouchstart' in document.documentElement ) { // required to start audio under iOS 6
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

    return this
  },

  createScriptProcessor() {
    this.node = this.ctx.createScriptProcessor( 1024, 0, 2 )
    this.clearFunction = function() { return 0 }
    if( typeof this.callback === 'undefined' ) this.callback = this.clearFunction

    this.node.onaudioprocess = function( audioProcessingEvent ) {
      var outputBuffer = audioProcessingEvent.outputBuffer;

      var left = outputBuffer.getChannelData( 0 ),
          right= outputBuffer.getChannelData( 1 ),
          isStereo = utilities.isStereo

     for( var sample = 0; sample < left.length; sample++ ) {
        var out = utilities.callback()

        if( isStereo === false ) {
          left[ sample ] = right[ sample ] = out 
        }else{
          left[ sample  ] = out[0]
          right[ sample ] = out[1]
        }
      }
    }

    this.node.connect( this.ctx.destination )

    return this
  },

  // remove starting stuff and add tabs
  prettyPrintCallback( cb ) {
    // get rid of "function gen" and start with parenthesis
    // const shortendCB = cb.toString().slice(9)
    const cbSplit = cb.toString().split('\n')
    const cbTrim = cbSplit.slice( 3, -2 )
    const cbTabbed = cbTrim.map( v => '      ' + v ) 
    
    return cbTabbed.join('\n')
  },

  createParameterDescriptors( cb ) {
    // [{name: 'amplitude', defaultValue: 0.25, minValue: 0, maxValue: 1}];
    let paramStr = ''

    for( let ugen of cb.params.values() ) {
      paramStr += `{ name:'${ugen.name}', defaultValue:${ugen.value}, minValue:${ugen.min}, maxValue:${ugen.max} },\n      `
    }

    return paramStr
  },

  createParameterDereferences( cb ) {
    let str = cb.params.size > 0 ? '\n      ' : ''
    for( let ugen of cb.params.values() ) {
      str += `const ${ugen.name} = parameters.${ugen.name}\n      `
    }

    return str
  },

  createParameterArguments( cb ) {
    let  paramList = ''
    for( let ugen of cb.params.values() ) {
      paramList += ugen.name + '[i],'
    }
    paramList = paramList.slice( 0, -1 )

    return paramList
  },

  createInputDereferences( cb ) {
    let str = cb.inputs.size > 0 ? '\n' : ''
    for( let input of  cb.inputs.values() ) {
      str += `const ${input.name} = inputs[ ${input.inputNumber} ][ ${input.channelNumber} ]\n      `
    }

    return str
  },


  createInputArguments( cb ) {
    let  paramList = ''
    for( let input of cb.inputs.values() ) {
      paramList += input.name + '[i],'
    }
    paramList = paramList.slice( 0, -1 )

    return paramList
  },
      
  createFunctionDereferences( cb ) {
    let memberString = cb.members.size > 0 ? '\n' : ''
    let memo = {}
    for( let dict of cb.members.values() ) {
      const name = Object.keys( dict )[0],
            value = dict[ name ]

      if( memo[ name ] !== undefined ) continue
      memo[ name ] = true

      memberString += `      const ${name} = ${value}\n`
    }

    return memberString
  },

  createWorkletProcessor( graph, name, debug, mem=44100*10 ) {
    //const mem = MemoryHelper.create( 4096, Float64Array )
    const cb = gen.createCallback( graph, mem, debug )
    const inputs = cb.inputs

    // get all inputs and create appropriate audioparam initializers
    const parameterDescriptors = this.createParameterDescriptors( cb )
    const parameterDereferences = this.createParameterDereferences( cb )
    const paramList = this.createParameterArguments( cb )
    const inputDereferences = this.createInputDereferences( cb )
    const inputList = this.createInputArguments( cb )   
    const memberString = this.createFunctionDereferences( cb )

    // get references to Math functions as needed
    // these references are added to the callback during codegen.

    // change output based on number of channels.
    const genishOutputLine = cb.isStereo === false
      ? `left[ i ] = memory[0]`
      : `left[ i ] = memory[0];\n\t\tright[ i ] = memory[1]\n`

    const prettyCallback = this.prettyPrintCallback( cb )


    /***** begin callback code ****/
    // note that we have to check to see that memory has been passed
    // to the worker before running the callback function, otherwise
    // it can be past too slowly and fail on occassion

    const workletCode = `
class ${name}Processor extends AudioWorkletProcessor {

  static get parameterDescriptors() {
    const params = [
      ${ parameterDescriptors }      
    ]
    return params
  }
 
  constructor( options ) {
    super( options )
    this.port.onmessage = this.handleMessage.bind( this )
    this.initialized = false
  }

  handleMessage( event ) {
    if( event.data.key === 'init' ) {
      this.memory = event.data.memory
      this.initialized = true
    }else if( event.data.key === 'set' ) {
      this.memory[ event.data.idx ] = event.data.value
    }else if( event.data.key === 'get' ) {
      this.port.postMessage({ key:'return', idx:event.data.idx, value:this.memory[event.data.idx] })     
    }
  }

  process( inputs, outputs, parameters ) {
    if( this.initialized === true ) {
      const output = outputs[0]
      const left   = output[ 0 ]
      const right  = output[ 1 ]
      const len    = left.length
      const memory = this.memory ${parameterDereferences}${inputDereferences}${memberString}

      for( let i = 0; i < len; ++i ) {
        ${prettyCallback}
        ${genishOutputLine}
      }
    }
    return true
  }
}
    
registerProcessor( '${name}', ${name}Processor)`

    
    /***** end callback code *****/


    if( debug === true ) console.log( workletCode )

    const url = window.URL.createObjectURL(
      new Blob(
        [ workletCode ], 
        { type: 'text/javascript' }
      )
    )

    return [ url, workletCode, inputs, cb.params, cb.isStereo ] 
  },

  registeredForNodeAssignment: [],
  register( ugen ) {
    if( this.registeredForNodeAssignment.indexOf( ugen ) === -1 ) {
      this.registeredForNodeAssignment.push( ugen )
    }
  },

  playWorklet( graph, name, debug=false, mem=44100 * 10 ) {
    utilities.clear()

    const [ url, codeString, inputs, params, isStereo ] = utilities.createWorkletProcessor( graph, name, debug, mem )

    const nodePromise = new Promise( (resolve,reject) => {
   
      utilities.ctx.audioWorklet.addModule( url ).then( ()=> {
        const workletNode = new AudioWorkletNode( utilities.ctx, name, { outputChannelCount:[ isStereo ? 2 : 1 ] })
        workletNode.connect( utilities.ctx.destination )

        workletNode.callbacks = {}
        workletNode.onmessage = function( event ) {
          if( event.data.message === 'return' ) {
            workletNode.callbacks[ event.data.idx ]( event.data.value )
            delete workletNode.callbacks[ event.data.idx ]
          }
        }

        workletNode.getMemoryValue = function( idx, cb ) {
          this.workletCallbacks[ idx ] = cb
          this.workletNode.port.postMessage({ key:'get', idx: idx })
        }
        
        workletNode.port.postMessage({ key:'init', memory:gen.memory.heap })
        utilities.workletNode = workletNode

        utilities.registeredForNodeAssignment.forEach( ugen => ugen.node = workletNode )
        utilities.registeredForNodeAssignment.length = 0

        // assign all params as properties of node for easier reference 
        for( let dict of inputs.values() ) {
          const name = Object.keys( dict )[0]
          const param = workletNode.parameters.get( name )
      
          Object.defineProperty( workletNode, name, {
            set( v ) {
              param.value = v
            },
            get() {
              return param.value
            }
          })
        }

        for( let ugen of params.values() ) {
          const name = ugen.name
          const param = workletNode.parameters.get( name )
          ugen.waapi = param 

          Object.defineProperty( workletNode, name, {
            set( v ) {
              param.value = v
            },
            get() {
              return param.value
            }
          })
        }

        if( utilities.console ) utilities.console.setValue( codeString )

        resolve( workletNode )
      })

    })

    return nodePromise
  },
  
  playGraph( graph, debug, mem=44100*10, memType=Float32Array ) {
    utilities.clear()
    if( debug === undefined ) debug = false
          
    this.isStereo = Array.isArray( graph )

    utilities.callback = gen.createCallback( graph, mem, debug, false, memType )
    
    if( utilities.console ) utilities.console.setValue( utilities.callback.toString() )

    return utilities.callback
  },

  loadSample( soundFilePath, data ) {
    let req = new XMLHttpRequest()
    req.open( 'GET', soundFilePath, true )
    req.responseType = 'arraybuffer' 
    
    let promise = new Promise( (resolve,reject) => {
      req.onload = function() {
        var audioData = req.response

        utilities.ctx.decodeAudioData( audioData, (buffer) => {
          data.buffer = buffer.getChannelData(0)
          resolve( data.buffer )
        })
      }
    })

    req.send()

    return promise
  }

}

utilities.clear.callbacks = []

module.exports = utilities

},{"./data.js":18,"./gen.js":30}],73:[function(require,module,exports){
'use strict'

/*
 * many windows here adapted from https://github.com/corbanbrook/dsp.js/blob/master/dsp.js
 * starting at line 1427
 * taken 8/15/16
*/ 

const windows = module.exports = { 
  bartlett( length, index ) {
    return 2 / (length - 1) * ((length - 1) / 2 - Math.abs(index - (length - 1) / 2)) 
  },

  bartlettHann( length, index ) {
    return 0.62 - 0.48 * Math.abs(index / (length - 1) - 0.5) - 0.38 * Math.cos( 2 * Math.PI * index / (length - 1))
  },

  blackman( length, index, alpha ) {
    let a0 = (1 - alpha) / 2,
        a1 = 0.5,
        a2 = alpha / 2

    return a0 - a1 * Math.cos(2 * Math.PI * index / (length - 1)) + a2 * Math.cos(4 * Math.PI * index / (length - 1))
  },

  cosine( length, index ) {
    return Math.cos(Math.PI * index / (length - 1) - Math.PI / 2)
  },

  gauss( length, index, alpha ) {
    return Math.pow(Math.E, -0.5 * Math.pow((index - (length - 1) / 2) / (alpha * (length - 1) / 2), 2))
  },

  hamming( length, index ) {
    return 0.54 - 0.46 * Math.cos( Math.PI * 2 * index / (length - 1))
  },

  hann( length, index ) {
    return 0.5 * (1 - Math.cos( Math.PI * 2 * index / (length - 1)) )
  },

  lanczos( length, index ) {
    let x = 2 * index / (length - 1) - 1;
    return Math.sin(Math.PI * x) / (Math.PI * x)
  },

  rectangular( length, index ) {
    return 1
  },

  triangular( length, index ) {
    return 2 / length * (length / 2 - Math.abs(index - (length - 1) / 2))
  },

  // parabola
  welch( length, _index, ignore, shift=0 ) {
    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
    const index = shift === 0 ? _index : (_index + Math.floor( shift * length )) % length
    const n_1_over2 = (length - 1) / 2 

    return 1 - Math.pow( ( index - n_1_over2 ) / n_1_over2, 2 )
  },
  inversewelch( length, _index, ignore, shift=0 ) {
    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
    let index = shift === 0 ? _index : (_index + Math.floor( shift * length )) % length
    const n_1_over2 = (length - 1) / 2

    return Math.pow( ( index - n_1_over2 ) / n_1_over2, 2 )
  },

  parabola( length, index ) {
    if( index <= length / 2 ) {
      return windows.inversewelch( length / 2, index ) - 1
    }else{
      return 1 - windows.inversewelch( length / 2, index - length / 2 )
    }
  },

  exponential( length, index, alpha ) {
    return Math.pow( index / length, alpha )
  },

  linear( length, index ) {
    return index / length
  }
}

},{}],74:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js'),
    floor= require('./floor.js'),
    sub  = require('./sub.js'),
    memo = require('./memo.js')

let proto = {
  basename:'wrap',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        signal = inputs[0], min = inputs[1], max = inputs[2],
        out, diff

    //out = `(((${inputs[0]} - ${this.min}) % ${diff}  + ${diff}) % ${diff} + ${this.min})`
    //const long numWraps = long((v-lo)/range) - (v < lo);
    //return v - range * double(numWraps);   
    
    if( this.min === 0 ) {
      diff = max
    }else if ( isNaN( max ) || isNaN( min ) ) {
      diff = `${max} - ${min}`
    }else{
      diff = max - min
    }

    out =
` var ${this.name} = ${inputs[0]}
  if( ${this.name} < ${this.min} ) ${this.name} += ${diff}
  else if( ${this.name} > ${this.max} ) ${this.name} -= ${diff}

`

    return [ this.name, ' ' + out ]
  },
}

module.exports = ( in1, min=0, max=1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    min, 
    max,
    uid:    gen.getUID(),
    inputs: [ in1, min, max ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./floor.js":27,"./gen.js":30,"./memo.js":42,"./sub.js":66}],75:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let analyzer = Object.create( ugen )

Object.assign( analyzer, {
  __type__: 'analyzer',
})

module.exports = analyzer

},{"../ugen.js":135}],76:[function(require,module,exports){
module.exports = function( Gibberish ) {

  const analyzers = {
    SSD:    require( './singlesampledelay.js'  )( Gibberish ),
    Follow: require( './follow.js'  )( Gibberish )
  }

  analyzers.export = target => {
    for( let key in analyzers ) {
      if( key !== 'export' ) {
        target[ key ] = analyzers[ key ]
      }
    }
  }

return analyzers

}

},{"./follow.js":77,"./singlesampledelay.js":78}],77:[function(require,module,exports){
const g = require('genish.js'),
      analyzer = require('./analyzer.js'),
      ugen = require('../ugen.js');

const genish = g;

module.exports = function (Gibberish) {

  const Follow = inputProps => {

    // main follow object is also the output
    const follow = Object.create(analyzer);
    follow.in = Object.create(ugen);
    follow.id = Gibberish.factory.getUID();

    const props = Object.assign({}, inputProps, Follow.defaults);
    let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true;

    // the input to the follow ugen is buffered in this ugen
    follow.buffer = g.data(props.bufferSize, 1);

    let avg; // output; make available outside jsdsp block
    const _input = g.in('input');
    const input = isStereo ? g.add(_input[0], _input[1]) : _input;

    {
      "use jsdsp";
      // phase to write to follow buffer
      const bufferPhaseOut = g.accum(1, 0, { max: props.bufferSize, min: 0 });

      // hold running sum
      const sum = g.data(1, 1, { meta: true });

      sum[0] = genish.sub(genish.add(sum[0], input), g.peek(follow.buffer, bufferPhaseOut, { mode: 'simple' }));

      avg = genish.div(sum[0], props.bufferSize);
    }

    if (!isStereo) {
      Gibberish.factory(follow, avg, 'follow_out', props);

      follow.callback.ugenName = follow.ugenName = `follow_out_${ follow.id }`;

      // have to write custom callback for input to reuse components from output,
      // specifically the memory from our buffer
      let idx = follow.buffer.memory.values.idx;
      let phase = 0;
      let abs = Math.abs;
      let callback = function (input, memory) {
        'use strict';

        memory[genish.add(idx, phase)] = abs(input);
        phase++;
        if (phase > genish.sub(props.bufferSize, 1)) {
          phase = 0;
        }

        return 0;
      };

      Gibberish.factory(follow.in, input, 'follow_in', props, callback);

      // lots of nonsense to make our custom function work
      follow.in.callback.ugenName = follow.in.ugenName = `follow_in_${ follow.id }`;
      follow.in.inputNames = ['input'];
      follow.in.inputs = [input];
      follow.in.input = props.input;
      follow.in.type = 'analysis';

      if (Gibberish.analyzers.indexOf(follow.in) === -1) {
        Gibberish.analyzers.push(follow.in);
      }

      Gibberish.dirty(Gibberish.analyzers);
    }

    return follow;
  };

  Follow.defaults = {
    bufferSize: 8192
  };

  return Follow;
};
},{"../ugen.js":135,"./analyzer.js":75,"genish.js":37}],78:[function(require,module,exports){
const g = require( 'genish.js' ),
      analyzer = require( './analyzer.js' ),
      proxy    = require( '../workletProxy.js' ),
      ugen     = require( '../ugen.js' )

module.exports = function( Gibberish ) {
 
const Delay = inputProps => {
  let ssd = Object.create( analyzer )
  ssd.__in  = Object.create( ugen )
  ssd.__out = Object.create( ugen )

  ssd.id = Gibberish.factory.getUID()

  let props = Object.assign({}, Delay.defaults, inputProps )
  let isStereo = props.isStereo 
  
  let input = g.in( 'input' )
    
  let historyL = g.history()

  if( isStereo ) {
    // right channel
    let historyR = g.history()

    Gibberish.factory( 
      ssd.__out,
      [ historyL.out, historyR.out ], 
      'ssd_out', 
      props,
      null,
      false
    )

    ssd.__out.callback.ugenName = ssd.__out.ugenName = 'ssd_out' + ssd.id

    const idxL = ssd.__out.graph.memory.value.idx, 
          idxR = idxL + 1,
          memory = Gibberish.genish.gen.memory.heap

    const callback = function( input ) {
      'use strict'
      memory[ idxL ] = input[0]
      memory[ idxR ] = input[1]
      return 0     
    }
    
    Gibberish.factory( ssd.in, [ input[0],input[1] ], 'ssd_in', props, callback, false )

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
    Gibberish.factory( ssd.__out, historyL.out, 'ssd_out', props, null, false )

    ssd.__out.callback.ugenName = ssd.__out.ugenName = 'ssd_out' + ssd.id

    let idx = ssd.__out.graph.memory.value.idx 
    let memory = Gibberish.genish.gen.memory.heap
    let callback = function( input ) {
      'use strict'
      memory[ idx ] = input
      return 0     
    }
    
    Gibberish.factory( ssd.__in, input, 'ssd_in', {}, callback, false )

    callback.ugenName = ssd.__in.ugenName = 'ssd_in_' + ssd.id
    ssd.__in.inputNames = [ 'input' ]
    ssd.__in.inputs = [ props.input ]
    ssd.__in.input = props.input
    ssd.type = 'analysis'

    ssd.__in.listen = function( ugen ) {
      //console.log( 'listening:', ugen, Gibberish.mode )
      if( ugen !== undefined ) {
        ssd.__in.input = ugen
        ssd.__in.inputs = [ ugen ]
      }

      if( Gibberish.analyzers.indexOf( ssd.__in ) === -1 ) {
        if( Gibberish.mode === 'worklet' ) {
          Gibberish.analyzers.push( { id:ssd.id, prop:'in' })
        }else{
          Gibberish.analyzers.push( ssd.__in )
        }
      }

      Gibberish.dirty( Gibberish.analyzers )
      //console.log( 'in:', ssd.__in )
    }

  }

  ssd.listen = ssd.__in.listen
  ssd.__in.type = 'analysis'

 
  ssd.__out.inputs = []

  const out =  proxy( ['analysis','SSD'], props, ssd )
  
  Object.defineProperties( out, {
    'out': {
      set(v) {},
      get() {
        if( Gibberish.mode === 'worklet' ) {
          return { id:out.id, prop:'out' }
        }else{
          return out.__out
        }
      }
    },
    //'in': {
    //  set(v) {},
    //  get() {
    //    if( Gibberish.mode === 'worklet' ) {
    //      console.log( 'returning ssd in' )
    //      return { id:out.id, prop:'in' }
    //    }else{
    //      return out.__in
    //    }
    //  }
    //},

  })

  return out
}

Delay.defaults = {
  input:0,
  isStereo:false
}

return Delay

}

},{"../ugen.js":135,"../workletProxy.js":138,"./analyzer.js":75,"genish.js":37}],79:[function(require,module,exports){
const ugen = require( '../ugen.js' ),
      g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  const AD = function( argumentProps ) {
    const ad = Object.create( ugen ),
          attack  = g.in( 'attack' ),
          decay   = g.in( 'decay' )

    const props = Object.assign( {}, AD.defaults, argumentProps )

    const graph = g.ad( attack, decay, { shape:props.shape, alpha:props.alpha })

    ad.trigger = graph.trigger
    
    const __out = Gibberish.factory( ad, graph, ['envelopes','AD'], props )

    return __out
  }

  AD.defaults = { attack:44100, decay:44100, shape:'exponential', alpha:5 } 

  return AD

}

},{"../ugen.js":135,"genish.js":37}],80:[function(require,module,exports){
const ugen = require( '../ugen.js' ),
      g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  const ADSR = function( argumentProps ) {
    const adsr  = Object.create( ugen ),
          attack  = g.in( 'attack' ),
          decay   = g.in( 'decay' ),
          sustain = g.in( 'sustain' ),
          release = g.in( 'release' ),
          sustainLevel = g.in( 'sustainLevel' )

    const props = Object.assign( {}, ADSR.defaults, argumentProps )

    Object.assign( adsr, props )

    const graph = g.adsr( 
      attack, decay, sustain, sustainLevel, release, 
      { triggerRelease: props.triggerRelease, shape:props.shape, alpha:props.alpha } 
    )

    adsr.trigger = graph.trigger
    adsr.advance = graph.release

    const __out = Gibberish.factory( adsr, graph, ['envelopes','ADSR'], props )

    return __out 
  }

  ADSR.defaults = { 
    attack:22050, 
    decay:22050, 
    sustain:44100, 
    sustainLevel:.6, 
    release: 44100, 
    triggerRelease:false,
    shape:'exponential',
    alpha:5 
  } 

  return ADSR
}

},{"../ugen.js":135,"genish.js":37}],81:[function(require,module,exports){
const g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  const Envelopes = {
    AD     : require( './ad.js' )( Gibberish ),
    ADSR   : require( './adsr.js' )( Gibberish ),
    Ramp   : require( './ramp.js' )( Gibberish ),

    export : target => {
      for( let key in Envelopes ) {
        if( key !== 'export' && key !== 'factory' ) {
          target[ key ] = Envelopes[ key ]
        }
      }
    },

    factory( useADSR, shape, attack, decay, sustain, sustainLevel, release, triggerRelease=false ) {
      let env

      // deliberate use of single = to accomodate both 1 and true
      if( useADSR != true ) {
        env = g.ad( attack, decay, { shape }) 
      }else {
        env = g.adsr( attack, decay, sustain, sustainLevel, release, { shape, triggerRelease })
      }

      return env
    }
  } 

  return Envelopes
}

},{"./ad.js":79,"./adsr.js":80,"./ramp.js":82,"genish.js":37}],82:[function(require,module,exports){
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
        
    ramp.trigger = reset.trigger

    const out = Gibberish.factory( ramp, graph, ['envelopes','ramp'], props )


    return out
  }

  Ramp.defaults = { from:0, to:1, length:g.gen.samplerate, shouldLoop:false }

  return Ramp

}

},{"../ugen.js":135,"genish.js":37}],83:[function(require,module,exports){
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

},{}],84:[function(require,module,exports){
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

},{"genish.js":37}],85:[function(require,module,exports){
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
    let props = Object.assign( {}, Biquad.defaults, inputProps ) 
    
    Object.assign( biquad, props )

    let isStereo = biquad.input.isStereo

    biquad.__createGraph = function() {
      biquad.graph = Gibberish.genish.biquad( g.in('input'), g.mul( g.in('cutoff'), g.gen.samplerate / 4 ),  g.in('Q'), biquad.mode, isStereo )
    }

    biquad.__createGraph()
    biquad.__requiresRecompilation = [ 'mode' ]

    const __out = Gibberish.factory(
      biquad,
      biquad.graph,
      ['filters','Filter12Biquad'], 
      props
    )

    return __out
  }

  Biquad.defaults = {
    input:0,
    Q: .15,
    cutoff:.05,
    mode:0
  }

  return Biquad

}


},{"./filter.js":88,"genish.js":37}],86:[function(require,module,exports){
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

},{"genish.js":37}],87:[function(require,module,exports){
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
    //returnValue = klp
    
    return klp//returnValue// klp//returnValue
 }

  const DiodeZDF = inputProps => {
    const zdf      = Object.create( filter )
    const props    = Object.assign( {}, DiodeZDF.defaults, filter.defaults, inputProps )
    const isStereo = props.input.isStereo 

    Object.assign( zdf, props )

    const __out = Gibberish.factory(
      zdf, 
      Gibberish.genish.diodeZDF( g.in('input'), g.in('Q'), g.in('cutoff'), g.in('saturation'), isStereo ), 
      ['filters','Filter24TB303'],
      props
    )

    return __out 
  }

  DiodeZDF.defaults = {
    input:0,
    Q: .65,
    saturation: 1,
    cutoff: 880,
  }

  return DiodeZDF

}

},{"./filter.js":88,"genish.js":37}],88:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let filter = Object.create( ugen )

Object.assign( filter, {
  defaults: { bypass:false } 
})

module.exports = filter

},{"../ugen.js":135}],89:[function(require,module,exports){
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
    let props    = Object.assign( {}, Filter24.defaults, filter.defaults, inputProps )
    let isStereo = props.input.isStereo 

    const __out = Gibberish.factory(
      filter24, 
      Gibberish.genish.filter24( g.in('input'), g.in('Q'), g.in('cutoff'), g.in('isLowPass'), isStereo ), 
      ['filters','Filter24Classic'],
      props
    )

    return __out
  }


  Filter24.defaults = {
    input:0,
    Q: .25,
    cutoff: 880,
    isLowPass:1
  }

  return Filter24

}


},{"./filter.js":88,"genish.js":37}],90:[function(require,module,exports){
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
          //isLowPass = g.param( 'lowPass', 1 ),
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

},{"./allpass.js":84,"./biquad.js":85,"./combfilter.js":86,"./diodeFilterZDF.js":87,"./filter24.js":89,"./ladderFilterZeroDelay.js":91,"./svf.js":92}],91:[function(require,module,exports){
const g = require( 'genish.js' ),
      filterProto = require( './filter.js' )

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
    }//else{
      //returnValue = klp
    //}

    return klp//returnValue
  }

  const Zd24 = inputProps => {
    const filter   = Object.create( filterProto )
    const props    = Object.assign( {}, Zd24.defaults, filter.defaults, inputProps )
    const isStereo = props.input.isStereo 

    const __out = Gibberish.factory(
      filter, 
      Gibberish.genish.zd24( g.in('input'), g.in('Q'), g.in('cutoff'), isStereo ), 
      ['filters','Filter24Moog'],
      props
    )

    return __out
  }


  Zd24.defaults = {
    input:0,
    Q: .75,
    cutoff: 440,
  }

  return Zd24

}


},{"./filter.js":88,"genish.js":37}],92:[function(require,module,exports){
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
    const props = Object.assign( {}, SVF.defaults, filter.defaults, inputProps ) 

    const isStereo = props.input.isStereo
    
    // XXX NEEDS REFACTORING
    const __out = Gibberish.factory( 
      svf,
      Gibberish.genish.svf( g.in('input'), g.mul( g.in('cutoff'), g.gen.samplerate / 5 ), g.sub( 1, g.in('Q') ), g.in('mode'), isStereo ), 
      ['filters','Filter12SVF'], 
      props
    )

    return __out
  }


  SVF.defaults = {
    input:0,
    Q: .65,
    cutoff:440,
    mode:0
  }

  return SVF

}


},{"./filter.js":88,"genish.js":37}],93:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let BitCrusher = inputProps => {
  let props = Object.assign( { bitCrusherLength: 44100 }, BitCrusher.defaults, effect.defaults, inputProps ),
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

  let out
  if( isStereo ) {
    let storeR = g.history(0)
    let crushedR = g.div( g.floor( g.mul( rightInput, bitMult ) ), bitMult )

    let outR = ternary( 
      sampleReduxCounter.wrap,
      crushedR,
      storeL.out
    )

    out = Gibberish.factory( 
      bitCrusher,
      [ outL, outR ], 
      ['fx','bitCrusher'], 
      props 
    )
  }else{
    out = Gibberish.factory( bitCrusher, outL, ['fx','bitCrusher'], props )
  }
  
  return out 
}

BitCrusher.defaults = {
  input:0,
  bitDepth:.5,
  sampleRate: .5
}

return BitCrusher

}

},{"./effect.js":99,"genish.js":37}],94:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
  let proto = Object.create( effect )

  let Shuffler = inputProps => {
    let bufferShuffler = Object.create( proto ),
        bufferSize = 88200

    let props = Object.assign( {}, Shuffler.defaults, effect.defaults, inputProps )

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
    
    let out = Gibberish.factory( 
      bufferShuffler,
      [panner.left, panner.right],
      ['fx','shuffler'], 
      props 
    ) 

    return out 
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

},{"./effect.js":99,"genish.js":37}],95:[function(require,module,exports){
const g = require( 'genish.js' ),
      effect = require( './effect.js' )
  
module.exports = function( Gibberish ) {
 
let Chorus = inputProps => {
  const props = Object.assign({}, Chorus.defaults, effect.defaults, inputProps )
  
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

  let sampleRate = Gibberish.mode === 'processor' ? Gibberish.processor.sampleRate : Gibberish.ctx.sampleRate
   
  const ms = sampleRate / 1000 
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
    const rightOutput = g.add( delay1R, delay2L, delay3R )
    chorus.graph = [ g.add( delay1L, delay2R, delay3L ), rightOutput ]
  }else{
    chorus.graph = leftOutput
  }
  
  const out = Gibberish.factory( chorus, chorus.graph, ['fx','chorus'], props )

  return out 
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

},{"./effect.js":99,"genish.js":37}],96:[function(require,module,exports){
const g = require('genish.js'),
      effect = require('./effect.js');

const genish = g;

"use jsdsp";

const AllPassChain = (in1, in2, in3) => {
  "use jsdsp";

  /* in1 = predelay_out */
  /* in2 = indiffusion1 */
  /* in3 = indiffusion2 */

  const sub1 = genish.sub(in1, 0);
  const d1 = g.delay(sub1, 142);
  sub1.inputs[1] = genish.mul(d1, in2);
  const ap1_out = genish.add(genish.mul(sub1, in2), d1);

  const sub2 = genish.sub(ap1_out, 0);
  const d2 = g.delay(sub2, 107);
  sub2.inputs[1] = genish.mul(d2, in2);
  const ap2_out = genish.add(genish.mul(sub2, in2), d2);

  const sub3 = genish.sub(ap2_out, 0);
  const d3 = g.delay(sub3, 379);
  sub3.inputs[1] = genish.mul(d3, in3);
  const ap3_out = genish.add(genish.mul(sub3, in3), d3);

  const sub4 = genish.sub(ap3_out, 0);
  const d4 = g.delay(sub4, 277);
  sub4.inputs[1] = genish.mul(d4, in3);
  const ap4_out = genish.add(genish.mul(sub4, in3), d4);

  return ap4_out;
};

/*const tank_outs = Tank( ap_out, decaydiffusion1, decaydiffusion2, damping, decay )*/
const Tank = function (in1, in2, in3, in4, in5) {
  "use jsdsp";

  const outs = [[], [], [], [], []];

  /* LEFT CHANNEL */
  const leftStart = genish.add(in1, 0);
  const delayInput = genish.add(leftStart, 0);
  const delay1 = g.delay(delayInput, [genish.add(genish.mul(g.cycle(.1), 16), 672)], { size: 688 });
  delayInput.inputs[1] = genish.mul(delay1, in2);
  const delayOut = genish.sub(delay1, genish.mul(delayInput, in2));

  const delay2 = g.delay(delayOut, [4453, 353, 3627, 1190]);
  outs[3].push(genish.add(delay2.outputs[1], delay2.outputs[2]));
  outs[2].push(delay2.outputs[3]);

  const mz = g.history(0);
  const ml = g.mix(delay2, mz.out, in4);
  mz.in(ml);

  const mout = genish.mul(ml, in5);

  const s1 = genish.sub(mout, 0);
  const delay3 = g.delay(s1, [1800, 187, 1228]);
  outs[2].push(delay3.outputs[1]);
  outs[4].push(delay3.outputs[2]);
  s1.inputs[1] = genish.mul(delay3, in3);
  const m2 = genish.mul(s1, in3);
  const dl2_out = genish.add(delay3, m2);

  const delay4 = g.delay(dl2_out, [3720, 1066, 2673]);
  outs[2].push(delay4.outputs[1]);
  outs[3].push(delay4.outputs[2]);

  /* RIGHT CHANNEL */
  const rightStart = genish.add(genish.mul(delay4, in5), in1);
  const delayInputR = genish.add(rightStart, 0);
  const delay1R = g.delay(delayInputR, genish.add(genish.mul(g.cycle(.07), 16), 908), { size: 924 });
  delayInputR.inputs[1] = genish.mul(delay1R, in2);
  const delayOutR = genish.sub(delay1R, genish.mul(delayInputR, in2));

  const delay2R = g.delay(delayOutR, [4217, 266, 2974, 2111]);
  outs[1].push(genish.add(delay2R.outputs[1], delay2R.outputs[2]));
  outs[4].push(delay2R.outputs[3]);

  const mzR = g.history(0);
  const mlR = g.mix(delay2R, mzR.out, in4);
  mzR.in(mlR);

  const moutR = genish.mul(mlR, in5);

  const s1R = genish.sub(moutR, 0);
  const delay3R = g.delay(s1R, [2656, 335, 1913]);
  outs[4].push(delay3R.outputs[1]);
  outs[2].push(delay3R.outputs[2]);
  s1R.inputs[1] = genish.mul(delay3R, in3);
  const m2R = genish.mul(s1R, in3);
  const dl2_outR = genish.add(delay3R, m2R);

  const delay4R = g.delay(dl2_outR, [3163, 121, 1996]);
  outs[4].push(delay4.outputs[1]);
  outs[1].push(delay4.outputs[2]);

  leftStart.inputs[1] = genish.mul(delay4R, in5);

  outs[1] = g.add(...outs[1]);
  outs[2] = g.add(...outs[2]);
  outs[3] = g.add(...outs[3]);
  outs[4] = g.add(...outs[4]);
  return outs;
};

module.exports = function (Gibberish) {

  const Reverb = inputProps => {
    const props = Object.assign({}, Reverb.defaults, effect.defaults, inputProps),
          reverb = Object.create(effect);

    const isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true;

    const input = g.in('input'),
          damping = g.in('damping'),
          drywet = g.in('drywet'),
          decay = g.in('decay'),
          predelay = g.in('predelay'),
          inbandwidth = g.in('inbandwidth'),
          decaydiffusion1 = g.in('decaydiffusion1'),
          decaydiffusion2 = g.in('decaydiffusion2'),
          indiffusion1 = g.in('indiffusion1'),
          indiffusion2 = g.in('indiffusion2');

    const summedInput = isStereo === true ? g.add(input[0], input[1]) : input;
    let out;
    {
      'use jsdsp';

      // calculcate predelay
      const predelay_samps = g.mstosamps(predelay);
      const predelay_delay = g.delay(summedInput, predelay_samps, { size: 4410 });
      const z_pd = g.history(0);
      const mix1 = g.mix(z_pd.out, predelay_delay, inbandwidth);
      z_pd.in(mix1);

      const predelay_out = mix1;

      // run input + predelay through all-pass chain
      const ap_out = AllPassChain(predelay_out, indiffusion1, indiffusion2);

      // run filtered signal into "tank" model
      const tank_outs = Tank(ap_out, decaydiffusion1, decaydiffusion2, damping, decay);

      const leftWet = genish.mul(genish.sub(tank_outs[1], tank_outs[2]), .6);
      const rightWet = genish.mul(genish.sub(tank_outs[3], tank_outs[4]), .6);

      // mix wet and dry signal for final output
      const left = g.mix(isStereo ? input[0] : input, leftWet, drywet);
      const right = g.mix(isStereo ? input[1] : input, rightWet, drywet);

      out = Gibberish.factory(reverb, [left, right], ['fx', 'plate'], props);
    }

    return out;
  };

  Reverb.defaults = {
    input: 0,
    damping: .5,
    drywet: .5,
    decay: .5,
    predelay: 10,
    inbandwidth: .5,
    indiffusion1: .75,
    indiffusion2: .625,
    decaydiffusion1: .7,
    decaydiffusion2: .5
  };

  return Reverb;
};
},{"./effect.js":99,"genish.js":37}],97:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Delay = inputProps => {
  let props = Object.assign( { delayLength: 44100 }, Delay.defaults, inputProps ),
      delay = Object.create( effect )

  let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : false 
  
  let input      = g.in( 'input' ),
      delayTime  = g.in( 'time' ),
      wetdry     = g.in( 'wetdry' ),
      leftInput  = isStereo ? input[ 0 ] : input,
      rightInput = isStereo ? input[ 1 ] : null
    
  let feedback = g.in( 'feedback' )

  // left channel
  let feedbackHistoryL = g.history()
  let echoL = g.delay( g.add( leftInput, g.mul( feedbackHistoryL.out, feedback ) ), delayTime, { size:props.delayLength })
  feedbackHistoryL.in( echoL )
  let left = g.mix( leftInput, echoL, wetdry )

  let out
  if( isStereo ) {
    // right channel
    let feedbackHistoryR = g.history()
    let echoR = g.delay( g.add( rightInput, g.mul( feedbackHistoryR.out, feedback ) ), delayTime, { size:props.delayLength })
    feedbackHistoryR.in( echoR )
    const right = g.mix( rightInput, echoR, wetdry )

    out = Gibberish.factory( 
      delay,
      [ left, right ], 
      ['fx','delay'], 
      props 
    )
  }else{
    out = Gibberish.factory( delay, left, ['fx','delay'], props )
  }
  
  return out
}

Delay.defaults = {
  input:0,
  feedback:.75,
  time: 11025,
  wetdry: .5
}

return Delay

}

},{"./effect.js":99,"genish.js":37}],98:[function(require,module,exports){
const g = require('genish.js'),
      effect = require('./effect.js');

const genish = g;

/*

         exp(asig * (shape1 + pregain)) - exp(asig * (shape2 - pregain))
  aout = ---------------------------------------------------------------
         exp(asig * pregain)            + exp(-asig * pregain)

*/

module.exports = function (Gibberish) {

  let Distortion = inputProps => {
    let props = Object.assign({}, Distortion.defaults, effect.defaults, inputProps),
        distortion = Object.create(effect);

    let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : true;

    const input = g.in('input'),
          shape1 = g.in('shape1'),
          shape2 = g.in('shape2'),
          pregain = g.in('pregain'),
          postgain = g.in('postgain');

    let lout, out;
    {
      'use jsdsp';
      const linput = isStereo ? input[0] : input;
      const ltop = genish.sub(g.exp(genish.mul(linput, genish.add(shape1, pregain))), g.exp(genish.mul(linput, genish.sub(shape2, pregain))));
      const lbottom = genish.add(g.exp(genish.mul(linput, pregain)), g.exp(genish.mul(genish.mul(-1, linput), pregain)));
      lout = genish.mul(genish.div(ltop, lbottom), postgain);
    }

    if (isStereo) {
      let rout;
      {
        'use jsdsp';
        const rinput = isStereo ? input[1] : input;
        const rtop = genish.sub(g.exp(genish.mul(rinput, genish.add(shape1, pregain))), g.exp(genish.mul(rinput, genish.sub(shape2, pregain))));
        const rbottom = genish.add(g.exp(genish.mul(rinput, pregain)), g.exp(genish.mul(genish.mul(-1, rinput), pregain)));
        rout = genish.mul(genish.div(rtop, rbottom), postgain);
      }

      out = Gibberish.factory(distortion, [lout, rout], ['fx', 'distortion'], props);
    } else {
      out = Gibberish.factory(distortion, lout, ['fx', 'distortion'], props);
    }

    return out;
  };

  Distortion.defaults = {
    input: 0,
    shape1: .1,
    shape2: .1,
    pregain: 5,
    postgain: .5
  };

  return Distortion;
};
},{"./effect.js":99,"genish.js":37}],99:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let effect = Object.create( ugen )

Object.assign( effect, {
  defaults: { bypass:false }
})

module.exports = effect

},{"../ugen.js":135}],100:[function(require,module,exports){
module.exports = function( Gibberish ) {

  const effects = {
    Freeverb    : require( './freeverb.js'  )( Gibberish ),
    Plate       : require( './dattorro.js'  )( Gibberish ),
    Flanger     : require( './flanger.js'   )( Gibberish ),
    Vibrato     : require( './vibrato.js'   )( Gibberish ),
    Delay       : require( './delay.js'     )( Gibberish ),
    BitCrusher  : require( './bitCrusher.js')( Gibberish ),
    Distortion  : require( './distortion.js')( Gibberish ),
    RingMod     : require( './ringMod.js'   )( Gibberish ),
    Tremolo     : require( './tremolo.js'   )( Gibberish ),
    Chorus      : require( './chorus.js'    )( Gibberish ),
    Shuffler    : require( './bufferShuffler.js'  )( Gibberish ),
    //Gate        : require( './gate.js'      )( Gibberish ),
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

},{"./bitCrusher.js":93,"./bufferShuffler.js":94,"./chorus.js":95,"./dattorro.js":96,"./delay.js":97,"./distortion.js":98,"./flanger.js":101,"./freeverb.js":102,"./ringMod.js":103,"./tremolo.js":104,"./vibrato.js":105}],101:[function(require,module,exports){
let g = require( 'genish.js' ),
    proto = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Flanger = inputProps => {
  let props   = Object.assign( { delayLength:44100 }, Flanger.defaults, proto.defaults, inputProps ),
      flanger = Object.create( proto )

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
      right, out


  if( isStereo === true ) {
    rightInput = input[1]
    delayBufferR = g.data( delayLength )
    
    let delayedOutR = g.peek( delayBufferR, readIdx, { interp:'linear', mode:'samples' })

    g.poke( delayBufferR, g.add( rightInput, g.mul( delayedOutR, feedbackCoeff ) ), writeIdx )
    right = g.add( rightInput, delayedOutR )

    out = Gibberish.factory( 
      flanger,
      [ left, right ], 
      ['fx','flanger'], 
      props 
    )

  }else{
    out = Gibberish.factory( flanger, left, ['fx','flanger'], props )
  }
  
  return out 
}

Flanger.defaults = {
  input:0,
  feedback:.01,
  offset:.25,
  frequency:.5
}

return Flanger

}

},{"./effect.js":99,"genish.js":37}],102:[function(require,module,exports){
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
  let props = Object.assign( {}, Freeverb.defaults, effect.defaults, inputProps ),
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

  const out = Gibberish.factory( reverb, [ outputL, outputR ], ['fx','freeverb'], props )

  return out
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


},{"./effect.js":99,"genish.js":37}],103:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let RingMod = inputProps => {
  let props   = Object.assign( {}, RingMod.defaults, effect.defaults, inputProps ),
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

  let out
  if( isStereo === true ) {
    let rightInput = input[1]
    right = g.add( g.mul( rightInput, g.sub( 1, mix )), g.mul( g.mul( rightInput, sine ), mix ) ) 
    
    out = Gibberish.factory( 
      ringMod,
      [ left, right ], 
      'ringMod', 
      props 
    )
  }else{
    out = Gibberish.factory( ringMod, left, ['fx','ringMod'], props )
  }
  
  return out 
}

RingMod.defaults = {
  input:0,
  frequency:220,
  gain: 1, 
  mix:1
}

return RingMod

}

},{"./effect.js":99,"genish.js":37}],104:[function(require,module,exports){
const g = require( 'genish.js' ),
      effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
const Tremolo = inputProps => {
  const props   = Object.assign( {}, Tremolo.defaults, effect.defaults, inputProps ),
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
      right, out

  if( isStereo === true ) {
    let rightInput = input[1]
    right = g.mul( rightInput, mod )

    out = Gibberish.factory( 
      tremolo,
      [ left, right ], 
      ['fx','tremolo'], 
      props 
    )
  }else{
    out = Gibberish.factory( tremolo, left, ['fx','tremolo'], props )
  }
  
  return out 
}

Tremolo.defaults = {
  input:0,
  frequency:2,
  amount: 1, 
  shape:'sine'
}

return Tremolo

}

},{"./effect.js":99,"genish.js":37}],105:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Vibrato = inputProps => {
  let props   = Object.assign( {}, Vibrato.defaults, effect.defaults, inputProps ),
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
      right, out

  if( isStereo === true ) {
    rightInput = input[1]
    delayBufferR = g.data( delayLength )
    
    let delayedOutR = g.peek( delayBufferR, readIdx, { interp:'linear', mode:'samples' })

    g.poke( delayBufferR, g.add( rightInput, mul( delayedOutR, feedbackCoeff ) ), writeIdx )
    right = delayedOutR

    out = Gibberish.factory( 
      vibrato,
      [ left, right ], 
      [ 'fx', 'vibrato'], 
      props 
    )
  }else{
    out = Gibberish.factory( vibrato, left, ['fx','vibrato'], props )
  }
  
  return out 
}

Vibrato.defaults = {
  input:0,
  //feedback:.01,
  amount:.5,
  frequency:4
}

return Vibrato

}

},{"./effect.js":99,"genish.js":37}],106:[function(require,module,exports){
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
  id: -1,
  preventProxy:false,

  output: null,

  memory : null, // 20 minutes by default?
  factory: null, 
  genish,
  scheduler: require( './scheduling/scheduler.js' ),
  //workletProcessorLoader: require( './workletProcessor.js' ),
  workletProcessor: null,

  memoed: {},
  mode:'scriptProcessor',

  prototypes: {
    ugen: require('./ugen.js'),
    instrument: require( './instruments/instrument.js' ),
    effect: require( './fx/effect.js' ),
  },

  mixins: {
    polyinstrument: require( './instruments/polyMixin.js' )
  },

  workletPath: './gibberish_worklet.js',
  init( memAmount, ctx, mode ) {

    let numBytes = isNaN( memAmount ) ? 20 * 60 * 44100 : memAmount

    // regardless of whether or not gibberish is using worklets,
    // we still want genish to output vanilla js functions instead
    // of audio worklet classes; these functions will be called
    // from within the gibberish audioworklet processor node.
    this.genish.gen.mode = 'scriptProcessor'

    this.memory = MemoryHelper.create( numBytes )

    this.mode = window.AudioWorklet !== undefined ? 'worklet' : 'scriptprocessor'
    if( mode !== undefined ) this.mode = mode

    this.hasWorklet = window.AudioWorklet !== undefined && typeof window.AudioWorklet === 'function'

    const startup = this.hasWorklet ? this.utilities.createWorklet : this.utilities.createScriptProcessor
    
    this.analyzers.dirty = false

    if( this.mode === 'worklet' ) {

      const p = new Promise( (resolve, reject ) => {

        const pp = new Promise( (__resolve, __reject ) => {
          this.utilities.createContext( ctx, startup.bind( this.utilities ), __resolve )
        }).then( ()=> {
          Gibberish.preventProxy = true
          Gibberish.load()
          Gibberish.output = this.Bus2()
          Gibberish.preventProxy = false

          resolve()
        })

      })
      return p
    }else if( this.mode === 'processor' ) {
      Gibberish.load()
      Gibberish.output = this.Bus2()
    }


  },

  load() {
    this.factory = require( './ugenTemplate.js' )( this )

    this.Panner       = require( './misc/panner.js' )( this )
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
    this.analysis     = require( './analysis/analyzers.js' )( this )
    this.time         = require( './misc/time.js' )( this )
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
    this.analysis.export( target )
    target.Sequencer = this.Sequencer
    target.Sequencer2 = this.Sequencer2
    target.Bus = this.Bus
    target.Bus2 = this.Bus2
    target.Scheduler = this.scheduler
    this.time.export( target )
    this.utilities.export( target )
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
    //this.output.inputNames.length = 0
    this.analyzers.length = 0
    this.scheduler.clear()
    this.dirty( this.output )
    if( this.mode === 'worklet' ) {
      this.worklet.port.postMessage({ 
        address:'method', 
        object:this.id,
        name:'clear',
        args:[]
      })
    }
  },

  generateCallback() {
    if( this.mode === 'worklet' ) {
      Gibberish.callback = function() { return 0 }
      return Gibberish.callback
    }
    let uid = 0,
        callbackBody, lastLine, analysis=''

    this.memoed = {}

    callbackBody = this.processGraph( this.output )
    lastLine = callbackBody[ callbackBody.length - 1]
    callbackBody.unshift( "\t'use strict'" )

    this.analyzers.forEach( v=> {
      const analysisBlock = Gibberish.processUgen( v )
      //if( Gibberish.mode === 'processor' ) {
      //  console.log( 'analysis:', analysisBlock, v  )
      //}
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
  proxyReplace( obj ) {
    if( typeof obj === 'object' ) {
      if( obj.id !== undefined ) {
        const __obj = processor.ugens.get( obj.id )
        //console.log( 'retrieved:', __obj.name )

        //if( obj.prop !== undefined ) console.log( 'got a ssd.out', obj )
        return obj.prop !== undefined ? __obj[ obj.prop ] : __obj
      } 
    }

    return obj
  },
  processUgen( ugen, block ) {
    if( block === undefined ) block = []

    let dirtyIdx = Gibberish.dirtyUgens.indexOf( ugen )

    //console.log( 'ugenName:', ugen.ugenName )
    let memo = Gibberish.memoed[ ugen.ugenName ]

    if( memo !== undefined ) {
      return memo
    } else if (ugen === true || ugen === false) {
      throw "Why is ugen a boolean? [true] or [false]";
    } else if( ugen.block === undefined || dirtyIndex !== -1 ) {

  
      let line = `\tvar v_${ugen.id} = ` 
      
      if( !ugen.binop ) line += `${ugen.ugenName}( `

      // must get array so we can keep track of length for comma insertion
      let keys,err
      
      //try {
      keys = ugen.binop === true || ugen.type === 'bus' || ugen.type === 'analysis' ? Object.keys( ugen.inputs ) : [...ugen.inputNames ] 

      //}catch( e ){

      //  console.log( e )
      //  err = true
      //}
      
      //if( err === true ) return

      for( let i = 0; i < keys.length; i++ ) {
        let key = keys[ i ]
        // binop.inputs is actual values, not just property names
        let input 
        if( ugen.binop || ugen.type ==='bus' || ugen.type === 'analysis' ) {
          input = ugen.inputs[ key ]
        }else{
          //if( key === 'memory' ) continue;
  
          input = ugen[ key ] 
        }

        //if( Gibberish.mode === 'processor' ) console.log( 'processor input:', input, key, ugen )
        if( input !== undefined ) { 
          if( input.bypass === true ) {
            // loop through inputs of chain until one is found
            // that is not being bypassed

            let found = false

            while( input.input !== 'undefined' && found === false ) {
              if( typeof input.input.bypass !== 'undefined' ) {
                input = input.input
                if( input.bypass === false ) found = true
              }else{
                input = input.input
                found = true
              }
            }
          }

          if( typeof input === 'number' ) {
              line += input
          } else if( typeof input === 'boolean' ) {
              line += '' + input
          }else{
            //console.log( 'key:', key, 'input:', ugen.inputs, ugen.inputs[ key ] ) 
            // XXX not sure why this has to be here, but somehow non-processed objects
            // that only contain id numbers are being passed here...

            if( Gibberish.mode === 'processor' ) {
              if( input.ugenName === undefined && input.id !== undefined ) {
                input = Gibberish.processor.ugens.get( input.id )
              }
            }

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
            input.__varname = `v_${input.id}`
          }

          if( i < keys.length - 1 ) {
            line += ugen.binop ? ' ' + ugen.op + ' ' : ', ' 
          }
        }
      }
      
      //if( ugen.type === 'bus' ) line += ', ' 
      if( ugen.type === 'analysis' || (ugen.type === 'bus' && keys.length > 0) ) line += ', '
      if( !ugen.binop && ugen.type !== 'seq' ) line += 'memory'
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

},{"./analysis/analyzers.js":76,"./envelopes/envelopes.js":81,"./filters/filters.js":90,"./fx/effect.js":99,"./fx/effects.js":100,"./instruments/instrument.js":111,"./instruments/instruments.js":112,"./instruments/polyMixin.js":116,"./instruments/polytemplate.js":117,"./misc/binops.js":121,"./misc/bus.js":122,"./misc/bus2.js":123,"./misc/monops.js":124,"./misc/panner.js":125,"./misc/time.js":126,"./oscillators/oscillators.js":129,"./scheduling/scheduler.js":132,"./scheduling/seq2.js":133,"./scheduling/sequencer.js":134,"./ugen.js":135,"./ugenTemplate.js":136,"./utilities.js":137,"genish.js":37,"memory-helper":141}],107:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const Conga = argumentProps => {
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
    

    conga.env = trigger
    Gibberish.factory( conga, out, ['instruments','conga'], props  )

    return conga
  }
  
  Conga.defaults = {
    gain: .25,
    frequency:190,
    decay: .85
  }

  return Conga

}

},{"./instrument.js":111,"genish.js":37}],108:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const Cowbell = argumentProps => {
    let cowbell = Object.create( instrument )
    
    const decay   = g.in( 'decay' ),
          gain    = g.in( 'gain' )

    const props = Object.assign( {}, Cowbell.defaults, argumentProps )

    const bpfCutoff = g.param( 'bpfc', 1000 ),
          s1 = Gibberish.oscillators.factory( 'square', 560 ),
          s2 = Gibberish.oscillators.factory( 'square', 845 ),
          eg = g.decay( g.mul( decay, g.gen.samplerate * 2 ) ), 
          bpf = g.svf( g.add( s1,s2 ), bpfCutoff, 3, 2, false ),
          envBpf = g.mul( bpf, eg ),
          out = g.mul( envBpf, gain )

    cowbell.env = eg 

    cowbell.isStereo = false

    cowbell = Gibberish.factory( cowbell, out, ['insturments', 'cowbell'], props  )
    
    return cowbell
  }
  
  Cowbell.defaults = {
    gain: 1,
    decay:.5
  }

  return Cowbell

}

},{"./instrument.js":111,"genish.js":37}],109:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let FM = inputProps => {
    let syn = Object.create( instrument )

    let frequency = g.in( 'frequency' ),
        glide = g.in( 'glide' ),
        slidingFreq = g.slide( frequency, glide, glide ),
        cmRatio = g.in( 'cmRatio' ),
        index = g.in( 'index' ),
        feedback = g.in( 'feedback' ),
        attack = g.in( 'attack' ), decay = g.in( 'decay' ),
        sustain = g.in( 'sustain' ), sustainLevel = g.in( 'sustainLevel' ),
        release = g.in( 'release' )

    const props = Object.assign( {}, FM.defaults, inputProps )
    Object.assign( syn, props )

    syn.__createGraph = function() {
      const env = Gibberish.envelopes.factory( 
        props.useADSR, 
        props.shape, 
        attack, decay, 
        sustain, sustainLevel, 
        release, 
        props.triggerRelease
      )

      const feedbackssd = g.history( 0 )

      const modOsc = Gibberish.oscillators.factory( 
              syn.modulatorWaveform, 
              g.add( g.mul( slidingFreq, cmRatio ), g.mul( feedbackssd.out, feedback, index ) ), 
              syn.antialias 
            )

      const modOscWithIndex = g.mul( modOsc, g.mul( slidingFreq, index ) )
      const modOscWithEnv   = g.mul( modOscWithIndex, env )
      
      const modOscWithEnvAvg = g.mul( .5, g.add( modOscWithEnv, feedbackssd.out ) )

      feedbackssd.in( modOscWithEnvAvg )

      const carrierOsc = Gibberish.oscillators.factory( syn.carrierWaveform, g.add( slidingFreq, modOscWithEnvAvg ), syn.antialias )
      const carrierOscWithEnv = g.mul( carrierOsc, env )

      const baseCutoffFreq = g.mul( g.in('cutoff'), frequency )
      const cutoff = g.mul( g.mul( baseCutoffFreq, g.pow( 2, g.in('filterMult') )), env )
      //const cutoff = g.add( g.in('cutoff'), g.mul( g.in('filterMult'), env ) )
      const filteredOsc = Gibberish.filters.factory( carrierOscWithEnv, cutoff, g.in('Q'), g.in('saturation'), syn )

      const synthWithGain = g.mul( filteredOsc, g.in( 'gain' ) )
      
      let panner
      if( props.panVoices === true ) { 
        panner = g.pan( synthWithGain, synthWithGain, g.in( 'pan' ) ) 
        syn.graph = [panner.left, panner.right ]
      }else{
        syn.graph = synthWithGain
      }

      syn.env = env
    }
    
    syn.__requiresRecompilation = [ 'carrierWaveform', 'modulatorWaveform', 'antialias', 'filterType', 'filterMode' ]
    syn.__createGraph()

    const out = Gibberish.factory( syn, syn.graph , ['instruments','FM'], props )

    return out
  }

  FM.defaults = {
    carrierWaveform:'sine',
    modulatorWaveform:'sine',
    attack: 44,
    feedback: 0,
    decay: 22050,
    sustain:44100,
    sustainLevel:.6,
    release:22050,
    useADSR:false,
    shape:'linear',
    triggerRelease:false,
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
    filterMult:1.5,
    Q:.25,
    cutoff:.35,
    filterType:0,
    filterMode:0,
    isLowPass:1
  }

  let PolyFM = Gibberish.PolyTemplate( FM, ['glide','frequency','attack','decay','pulsewidth','pan','gain','cmRatio','index', 'saturation', 'filterMult', 'Q', 'cutoff', 'antialias', 'filterType', 'carrierWaveform', 'modulatorWaveform','filterMode', 'feedback', 'useADSR', 'sustain', 'release', 'sustainLevel' ] ) 

  return [ FM, PolyFM ]

}

},{"./instrument.js":111,"genish.js":37}],110:[function(require,module,exports){
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

    hat.env = eg 
    hat.isStereo = false

    const __hat = Gibberish.factory( hat, out, ['instruments','hat'], props  )
    

    return __hat
  }
  
  Hat.defaults = {
    gain:  1,
    tune: .6,
    decay:.1,
  }

  return Hat

}

},{"./instrument.js":111,"genish.js":37}],111:[function(require,module,exports){
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

},{"../ugen.js":135,"genish.js":37}],112:[function(require,module,exports){
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

},{"./conga.js":107,"./cowbell.js":108,"./fm.js":109,"./hat.js":110,"./karplusstrong.js":113,"./kick.js":114,"./monosynth.js":115,"./sampler.js":118,"./snare.js":119,"./synth.js":120}],113:[function(require,module,exports){
const g = require( 'genish.js' ),
      instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const KPS = inputProps => {

    const props = Object.assign( {}, KPS.defaults, inputProps )
    let syn = Object.create( instrument )
    
    let sampleRate = Gibberish.mode === 'processor' ? Gibberish.processor.sampleRate : Gibberish.ctx.sampleRate

    const trigger = g.bang(),
          phase = g.accum( 1, trigger, { max:Infinity } ),
          env = g.gtp( g.sub( 1, g.div( phase, 200 ) ), 0 ),
          impulse = g.mul( g.noise(), env ),
          feedback = g.history(),
          frequency = g.in('frequency'),
          glide = g.in( 'glide' ),
          slidingFrequency = g.slide( frequency, glide, glide ),
          delay = g.delay( g.add( impulse, feedback.out ), g.div( sampleRate, slidingFrequency ), { size:2048 }),
          decayed = g.mul( delay, g.t60( g.mul( g.in('decay'), slidingFrequency ) ) ),
          damped =  g.mix( decayed, feedback.out, g.in('damping') ),
          withGain = g.mul( damped, g.in('gain') )

    feedback.in( damped )

    const properties = Object.assign( {}, KPS.defaults, props )

    Object.assign( syn, {
      properties : props,

      env : trigger,
      phase,

      getPhase() {
        return Gibberish.memory.heap[ phase.memory.value.idx ]
      },
    })

    if( properties.panVoices ) {  
      const panner = g.pan( withGain, withGain, g.in( 'pan' ) )
      syn = Gibberish.factory( syn, [panner.left, panner.right], ['instruments','karplus'], props  )
    }else{
      syn = Gibberish.factory( syn, withGain, ['instruments','karplus'], props )
    }

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
          endTime = synth.decay * sampleRate

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

},{"./instrument.js":111,"genish.js":37}],114:[function(require,module,exports){
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
    Object.assign( kick, props )

    // create DSP graph
    let trigger = g.bang(),
        impulse = g.mul( trigger, 60 ),
        scaledDecay = g.sub( 1.005, decay ), // -> range { .005, 1.005 }
        scaledTone = g.add( 50, g.mul( tone, 4000 ) ), // -> range { 50, 4050 }
        bpf = g.svf( impulse, frequency, scaledDecay, 2, false ),
        lpf = g.svf( bpf, scaledTone, .5, 0, false ),
        graph = g.mul( lpf, gain )
    
    kick.env = trigger
    const out = Gibberish.factory( kick, graph, ['instruments','kick'], props  )

    return out
  }
  
  Kick.defaults = {
    gain: 1,
    frequency:85,
    tone: .25,
    decay:.9
  }

  return Kick

}

},{"./instrument.js":111,"genish.js":37}],115:[function(require,module,exports){
const g = require( 'genish.js' ),
      instrument = require( './instrument.js' ),
      feedbackOsc = require( '../oscillators/fmfeedbackosc.js' )

module.exports = function( Gibberish ) {

  const Synth = argumentProps => {
    const syn = Object.create( instrument ),
          oscs = [], 
          frequency = g.in( 'frequency' ),
          glide = g.in( 'glide' ),
          slidingFreq = g.memo( g.slide( frequency, glide, glide ) ),
          attack = g.in( 'attack' ), decay = g.in( 'decay' ),
          sustain = g.in( 'sustain' ), sustainLevel = g.in( 'sustainLevel' ),
          release = g.in( 'release' )

    const props = Object.assign( {}, Synth.defaults, argumentProps )
    Object.assign( syn, props )

    syn.__createGraph = function() {
      const env = Gibberish.envelopes.factory( 
        props.useADSR, 
        props.shape, 
        attack, decay, 
        sustain, sustainLevel, 
        release, 
        props.triggerRelease
      )

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
            freq = slidingFreq
        }

        osc = Gibberish.oscillators.factory( syn.waveform, freq, syn.antialias )
        
        oscs[ i ] = osc
      }

      const oscSum = g.add( ...oscs ),
            oscWithGain = g.mul( g.mul( oscSum, env ), g.in( 'gain' ) ),
            baseCutoffFreq = g.mul( g.in('cutoff'), frequency ),
            cutoff = g.mul( g.mul( baseCutoffFreq, g.pow( 2, g.in('filterMult') )), env ),
            filteredOsc = Gibberish.filters.factory( oscWithGain, cutoff, g.in('Q'), g.in('saturation'), syn )
        
      if( props.panVoices ) {  
        const panner = g.pan( filteredOsc,filteredOsc, g.in( 'pan' ) )
        syn.graph = [ panner.left, panner.right ]
      }else{
        syn.graph = filteredOsc
      }

      syn.env = env
    }

    syn.__requiresRecompilation = [ 'waveform', 'antialias', 'filterType', 'filterMode' ]
    syn.__createGraph()

    const out = Gibberish.factory( syn, syn.graph, ['instruments','Monosynth'], props )

    return out
  }
  
  Synth.defaults = {
    waveform: 'saw',
    attack: 44,
    decay: 22050,
    sustain:44100,
    sustainLevel:.6,
    release:22050,
    useADSR:false,
    shape:'linear',
    triggerRelease:false,
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

},{"../oscillators/fmfeedbackosc.js":128,"./instrument.js":111,"genish.js":37}],116:[function(require,module,exports){
module.exports = {
  note( freq, gain ) {
    // will be sent to processor node via proxy method...
    if( Gibberish.mode !== 'worklet' ) {
      let voice = this.__getVoice__()
      Object.assign( voice, this.properties )
      if( gain === undefined ) gain = this.gain
      voice.gain = gain
      voice.note( freq )
      this.__runVoice__( voice, this )
      this.triggerNote = freq
    }
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
      voice.connect( _poly )
      voice.isConnected = true
    }

    let envCheck
    if( _poly.envCheck === undefined ) {
      envCheck = function() {
        if( voice.env.isComplete() ) {
          _poly.disconnectUgen( voice )
          voice.isConnected = false
        }else{
          Gibberish.blockCallbacks.push( envCheck )
        }
      }
    }else{
      envCheck = _poly.envCheck( voice, _poly )
    }

    Gibberish.blockCallbacks.push( envCheck )
  },

  __getVoice__() {
    return this.voices[ this.voiceCount++ % this.voices.length ]
  },

  chord( frequencies ) {
    // will be sent to processor node via proxy method...
    if( Gibberish.mode !== 'worklet' ) {
      frequencies.forEach( v => this.note( v ) )
      this.triggerChord = frequencies
    }
  },

  free() {
    for( let child of this.voices ) child.free()
  }
}

},{}],117:[function(require,module,exports){
/*
 * This files creates a factory generating polysynth constructors.
 */

const g = require( 'genish.js' )
const proxy = require( '../workletProxy.js' )

module.exports = function( Gibberish ) {

  const TemplateFactory = ( ugen, propertyList, _envCheck ) => {
    /* 
     * polysynths are basically busses that connect child synth voices.
     * We create separate prototypes for mono vs stereo instances.
     */

    const monoProto   = Object.create( Gibberish.Bus() ),
          stereoProto = Object.create( Gibberish.Bus2() )

    // since there are two prototypes we can't assign directly to one of them...
    Object.assign( monoProto,   Gibberish.mixins.polyinstrument )
    Object.assign( stereoProto, Gibberish.mixins.polyinstrument )

    const Template = props => {
      const properties = Object.assign( {}, { isStereo:true }, props )

      const synth = properties.isStereo === true ? Object.create( stereoProto ) : Object.create( monoProto )

      Object.assign( synth, {
        voices: [],
        maxVoices: properties.maxVoices !== undefined ? properties.maxVoices : 16,
        voiceCount: 0,
        envCheck: _envCheck,
        id: Gibberish.factory.getUID(),
        dirty: true,
        type: 'bus',
        ugenName: 'poly' + ugen.name + '_' + synth.id,
        inputs:[],
        inputNames:[], //['input', 'gain'],
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

      return proxy( ['instruments', 'Poly'+ugen.name], properties, synth ) 
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

},{"../workletProxy.js":138,"genish.js":37}],118:[function(require,module,exports){
const g = require( 'genish.js' ),
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
    },
  })

  const Sampler = inputProps => {
    const syn = Object.create( proto )

    const props = Object.assign( { onload:null }, Sampler.defaults, inputProps )

    syn.isStereo = props.isStereo !== undefined ? props.isStereo : false

    const start = g.in( 'start' ), end = g.in( 'end' ), 
          rate = g.in( 'rate' ), shouldLoop = g.in( 'loops' )

    /* 
     * create dummy ugen until data for sampler is loaded...
     * this will be overridden by a call to Gibberish.factory on load 
     */

    syn.callback = function() { return 0 }
    syn.id = Gibberish.factory.getUID()
    syn.ugenName = syn.callback.ugenName = 'sampler_' + syn.id
    syn.inputNames = []

    /* end dummy ugen */

    syn.__bang__ = g.bang()
    syn.trigger = syn.__bang__.trigger

    Object.assign( syn, props )

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
    end:-999999999,
  }

  const envCheckFactory = function( voice, _poly ) {

    const envCheck = () => {
      const phase = Gibberish.memory.heap[ voice.__phase__.memory.value.idx ]
      if( ( voice.rate > 0 && phase > voice.end ) || ( voice.rate < 0 && phase < 0 ) ) {
        _poly.disconnectUgen.call( _poly, voice )
        voice.isConnected = false
      }else{
        Gibberish.blockCallbacks.push( envCheck )
      }
    }

    return envCheck
  }

  const PolySampler = Gibberish.PolyTemplate( Sampler, ['rate','pan','gain','start','end','loops'], envCheckFactory ) 

  return [ Sampler, PolySampler ]
}

},{"./instrument.js":111,"genish.js":37}],119:[function(require,module,exports){
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
    
    snare.env = eg 
    snare = Gibberish.factory( snare, ife, ['instruments','snare'], props  )
    
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

},{"./instrument.js":111,"genish.js":37}],120:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const Synth = inputProps => {
    const syn = Object.create( instrument )

    const frequency = g.in( 'frequency' ),
          loudness  = g.in( 'loudness' ), 
          glide = g.in( 'glide' ),
          slidingFreq = g.slide( frequency, glide, glide ),
          attack = g.in( 'attack' ), decay = g.in( 'decay' ),
          sustain = g.in( 'sustain' ), sustainLevel = g.in( 'sustainLevel' ),
          release = g.in( 'release' )

    const props = Object.assign( {}, Synth.defaults, inputProps )
    Object.assign( syn, props )

    syn.__createGraph = function() {
      const osc = Gibberish.oscillators.factory( syn.waveform, slidingFreq, syn.antialias )

      const env = Gibberish.envelopes.factory( 
        props.useADSR, 
        props.shape, 
        attack, decay, 
        sustain, sustainLevel, 
        release, 
        props.triggerRelease
      )

      // below doesn't work as it attempts to assign to release property triggering codegen...
      // syn.release = ()=> { syn.env.release() }

      let oscWithEnv = g.mul( g.mul( osc, env, loudness ) ),
          panner
  
      const baseCutoffFreq = g.mul( g.in('cutoff'), frequency )
      const cutoff = g.mul( g.mul( baseCutoffFreq, g.pow( 2, g.in('filterMult') )), env )
      const filteredOsc = Gibberish.filters.factory( oscWithEnv, cutoff, g.in('Q'), g.in('saturation'), props )

      let synthWithGain = g.mul( filteredOsc, g.in( 'gain' ) )
  
      if( syn.panVoices === true ) { 
        panner = g.pan( synthWithGain, synthWithGain, g.in( 'pan' ) ) 
        syn.graph = [ panner.left, panner.right ]
      }else{
        syn.graph = synthWithGain
      }

      syn.env = env
      syn.osc = osc
      syn.filter = filteredOsc

    }
    
    syn.__requiresRecompilation = [ 'waveform', 'antialias', 'filterType','filterMode', 'useADSR', 'shape' ]
    syn.__createGraph()

    const out = Gibberish.factory( syn, syn.graph, ['instruments', 'synth'], props  )

    return out
  }
  
  Synth.defaults = {
    waveform:'saw',
    attack: 44,
    decay: 22050,
    sustain:44100,
    sustainLevel:.6,
    release:22050,
    useADSR:false,
    shape:'linear',
    triggerRelease:false,
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

},{"./instrument.js":111,"genish.js":37}],121:[function(require,module,exports){
const ugenproto = require( '../ugen.js' )
const proxy     = require( '../workletProxy.js' )

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
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { binop:true, op:'+', inputs:args, ugenName:'add' + id, id } )

      return proxy( ['binops','Add'], { binop:true, inputs:args }, ugen )
    },

    Sub( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { binop:true, op:'-', inputs:args, ugenName:'sub' + id, id } )

      return proxy( ['binops','Sub'], { binop:true, inputs:args }, ugen )
    },

    Mul( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { binop:true, op:'*', inputs:args, ugenName:'mul' + id, id } )

      return proxy( ['binops','Mul'], { binop:true, inputs:args }, ugen )
    },

    Div( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { binop:true, op:'/', inputs:args, ugenName:'div' + id, id } )
    
      return proxy( ['binops','Div'], { binop:true, inputs:args }, ugen )
    },

    Mod( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { binop:true, op:'%', inputs:args, ugenName:'mod' + id, id } )

      return proxy( ['binops','Mod'], { binop:true, inputs:args }, ugen )
    },   
  }

  return Binops
}

},{"../ugen.js":135,"../workletProxy.js":138}],122:[function(require,module,exports){
let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' ),
    proxy= require( '../workletProxy.js' )

module.exports = function( Gibberish ) {
  
  const Bus = Object.create( ugen )

  Object.assign( Bus, {
    __gain : {
      set( v ) {
        this.mul.inputs[ 1 ] = v
        Gibberish.dirty( this )
      },
      get() {
        return this.mul[ 1 ]
      }
    },

    __addInput( input ) {
      this.sum.inputs.push( input )
      Gibberish.dirty( this )
    },

    create( _props ) {
      const props = Object.assign({}, Bus.defaults, _props )

      const sum = Gibberish.binops.Add( ...props.inputs )
      const mul = Gibberish.binops.Mul( sum, props.gain )

      const graph = Gibberish.Panner({ input:mul, pan: props.pan })
      

      graph.sum = sum
      graph.mul = mul
      graph.disconnectUgen = Bus.disconnectUgen

      Object.defineProperty( graph, 'gain', Bus.__gain )

      graph.__properties__ = props

      const out = proxy( ['Bus'], props, graph )


      if( false && Gibberish.preventProxy === false && Gibberish.mode === 'worklet' ) {
        const meta = {
          address:'add',
          name:['Bus'],
          props, 
          id:graph.id
        }
        Gibberish.worklet.port.postMessage( meta )
        Gibberish.worklet.port.postMessage({ 
          address:'method', 
          object:graph.id,
          name:'connect',
          args:[]
        })
      }

      return out 
    },

    disconnectUgen( ugen ) {
      let removeIdx = this.sum.inputs.indexOf( ugen )

      if( removeIdx !== -1 ) {
        this.sum.inputs.splice( removeIdx, 1 )
        Gibberish.dirty( this )
      }
    },

    defaults: { gain:1, inputs:[0], pan:.5 }
  })

  return Bus.create.bind( Bus )

}


},{"../ugen.js":135,"../workletProxy.js":138,"genish.js":37}],123:[function(require,module,exports){
/*let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {
  
  const Bus2 = Object.create( ugen )

  Object.assign( Bus2, {
    __gain : {
      set( v ) {
        this.mul.inputs[ 1 ] = v
        Gibberish.dirty( this )

      },
      get() {
        return this.mul[ 1 ]
      }
    },

    __addInput( input ) {
      if( input.isStereo || Array.isArray( input ) ) {
        console.log('stereo', input )
        this.sumL.inputs.push( input[0] )
        this.sumR.inputs.push( input[0] )        
      }else{
        console.log( 'mono', input )
        this.sumL.inputs.push( input )
        this.sumR.inputs.push( input )
      }

      Gibberish.dirty( this )
    },

    create( _props ) {
      const props = Object.assign({}, Bus2.defaults, _props )

      const inputsL = [], inputsR = []

      props.inputs.forEach( i => {
        if( i.isStereo || Array.isArray( i ) ) {
          inputsL.push( i[0] ) 
          inputsR.push( i[1] )
        }else{ 
          inputsL.push( i ) 
          inputsR.push( i )
        }  
      })

      const sumL = Gibberish.binops.Add( ...inputsL )
      const mulL = Gibberish.binops.Mul( sumL, props.gain )
      const sumR = Gibberish.binops.Add( ...inputsR )
      const mulR = Gibberish.binops.Mul( sumR, props.gain )

      const graph = Gibberish.Panner({ input:mulL, pan: props.pan })

      Object.assign( graph, { sumL, mulL, sumR, mulR, __addInput:Bus2.__addInput, disconnectUgen:Bus2.disconnectUgen  })

      graph.isStereo = true
      graph.inputs = props.inputs
      //graph.type = 'bus'

      Object.defineProperty( graph, 'gain', Bus2.__gain )

      return graph
    },

    disconnectUgen( ugen ) {
      let removeIdx = this.sum.inputs.indexOf( ugen )

      if( removeIdx !== -1 ) {
        this.sum.inputs.splice( removeIdx, 1 )
        Gibberish.dirty( this )
      }
    },

    defaults: { gain:1, inputs:[0], pan:.5 }
  })

  return Bus2.create.bind( Bus2 )

}
*/


const g = require( 'genish.js' ),
      ugen = require( '../ugen.js' ),
      proxy = require( '../workletProxy.js' )

module.exports = function( Gibberish ) {
  const Bus2 = Object.create( ugen )

  let bufferL, bufferR
  
  Object.assign( Bus2, { 
    create( props ) {

      if( bufferL === undefined ) {
        bufferL = Gibberish.genish.gen.globals.panL.memory.values.idx
        bufferR = Gibberish.genish.gen.globals.panR.memory.values.idx
      }

      var output = [0,0] 

      var bus = Object.create( Bus2 )

      Object.assign( 
        bus,

        {
          callback() {
            output[ 0 ] = output[ 1 ] = 0
            var lastIdx = arguments.length - 1
            var memory  = arguments[ lastIdx ]

            for( var i = 0; i < lastIdx; i++ ) {
              var input = arguments[ i ],
                  isArray = Array.isArray( input )//input instanceof Float32Array

              output[ 0 ] += isArray ? input[ 0 ] : input
              output[ 1 ] += isArray ? input[ 1 ] : input
            }

            var panRawIndex  = .5 * 1023,
                panBaseIndex = panRawIndex | 0,
                panNextIndex = (panBaseIndex + 1) & 1023,
                interpAmount = panRawIndex - panBaseIndex,
                panL = memory[ bufferL + panBaseIndex ] 
                  + ( interpAmount * ( memory[ bufferL + panNextIndex ] - memory[ bufferL + panBaseIndex ] ) ),
                panR = memory[ bufferR + panBaseIndex ] 
                  + ( interpAmount * ( memory[ bufferR + panNextIndex ] - memory[ bufferR + panBaseIndex ] ) )
            
            output[0] *= bus.gain * panL
            output[1] *= bus.gain * panR

            return output
          },
          id : Gibberish.factory.getUID(),
          dirty : false,
          type : 'bus',
          inputs:[],
          __properties__:props
        },

        Bus2.defaults,

        props
      )

      bus.ugenName = bus.callback.ugenName = 'bus2_' + bus.id

      const out = proxy( ['Bus2'], props, bus )

      return out
    },
    
    disconnectUgen( ugen ) {
      let removeIdx = this.inputs.indexOf( ugen )

      if( removeIdx !== -1 ) {
        this.inputs.splice( removeIdx, 1 )
        Gibberish.dirty( this )
      }
    },

    defaults: { gain:1, pan:.5 }
  })

  return Bus2.create.bind( Bus2 )

}


},{"../ugen.js":135,"../workletProxy.js":138,"genish.js":37}],124:[function(require,module,exports){
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
      
      const __out = Gibberish.factory( abs, graph, ['monops','abs'], Object.assign({}, Monops.defaults, { input, binop:true }) )

      return __out
    },

    Pow( input, exponent ) {
      const pow = Object.create( ugen )
      const graph = g.pow( g.in('input'), g.in('exponent') )
      
      Gibberish.factory( pow, graph, ['monops','pow'], Object.assign({}, Monops.defaults, { input, exponent }) )

      return pow
    },
    Clamp( input, min, max ) {
      const clamp = Object.create( ugen )
      const graph = g.clamp( g.in('input'), g.in('min'), g.in('max') )
      
      const __out = Gibberish.factory( clamp, graph, ['monops','clamp'], Object.assign({}, Monops.defaults, { input, min, max }) )

      return __out
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

},{"../ugen.js":135,"genish.js":37}],125:[function(require,module,exports){
const g = require( 'genish.js' )

const ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {
 
let Panner = inputProps => {
  const props  = Object.assign( {}, Panner.defaults, inputProps ),
        panner = Object.create( ugen )

  const isStereo = props.input.isStereo !== undefined ? props.input.isStereo : Array.isArray( props.input ) 
  
  const input = g.in( 'input' ),
        pan   = g.in( 'pan' )

  let graph 
  if( isStereo ) {
    graph = g.pan( input[0], input[1], pan )  
  }else{
    graph = g.pan( input, input, pan )
  }

  Gibberish.factory( panner, [ graph.left, graph.right], 'panner', props )
  
  return panner
}

Panner.defaults = {
  input:0,
  pan:.5
}

return Panner 

}

},{"../ugen.js":135,"genish.js":37}],126:[function(require,module,exports){
module.exports = function( Gibberish ) {

  const Time = {
    bpm: 120,

    export: function(target) {
      Object.assign( target, Time )
    },

    ms : function(val) {
      return val * Gibberish.ctx.sampleRate / 1000;
    },

    seconds : function(val) {
      return val * Gibberish.ctx.sampleRate;
    },

    beats : function(val) {
      return function() { 
        var samplesPerBeat = Gibberish.ctx.sampleRate / ( Gibberish.Time.bpm / 60 ) ;
        return samplesPerBeat * val ;
      }
    }
  }

  return Time
}

},{}],127:[function(require,module,exports){
const genish = require('genish.js'),
      ssd = genish.history,
      noise = genish.noise;

module.exports = function () {
  "use jsdsp";

  const last = ssd(0);

  const white = genish.sub(genish.mul(noise(), 2), 1);

  let out = genish.add(last.out, genish.div(genish.mul(.02, white), 1.02));

  last.in(out);

  out = genish.mul(out, 3.5);

  return out;
};
},{"genish.js":37}],128:[function(require,module,exports){
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

},{"genish.js":37}],129:[function(require,module,exports){
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

      const out = Gibberish.factory( sqr, graph, ['oscillators','square'], props )

      return out
    },

    Triangle( inputProps ) {
      const tri= Object.create( ugen ) 
      const props = Object.assign({ antialias:false }, Oscillators.defaults, inputProps )
      const osc   = Oscillators.factory( 'triangle', g.in( 'frequency' ), props.antialias )
      const graph = g.mul( osc, g.in('gain' ) )

      const out =Gibberish.factory( tri, graph, ['oscillators','triangle'], props )

      return out
    },

    PWM( inputProps ) {
      const pwm   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false, pulsewidth:.25 }, Oscillators.defaults, inputProps )
      const osc   = Oscillators.factory( 'pwm', g.in( 'frequency' ), props.antialias )
      const graph = g.mul( osc, g.in('gain' ) )

      const out = Gibberish.factory( pwm, graph, ['oscillators','PWM'], props )

      return out
    },

    Sine( inputProps ) {
      const sine  = Object.create( ugen )
      const props = Object.assign({}, Oscillators.defaults, inputProps )
      const graph = g.mul( g.cycle( g.in('frequency') ), g.in('gain') )

      const out = Gibberish.factory( sine, graph, ['oscillators','sine'], props )
      
      return out
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

      const out = Gibberish.factory( noise, graph, ['oscillators','noise'], props )

      return out
    },

    Saw( inputProps ) {
      const saw   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false }, Oscillators.defaults, inputProps )
      const osc   = Oscillators.factory( 'saw', g.in( 'frequency' ), props.antialias )
      const graph = g.mul( osc, g.in('gain' ) )

      const out = Gibberish.factory( saw, graph, ['oscillators','saw'], props )

      return out
    },

    ReverseSaw( inputProps ) {
      const saw   = Object.create( ugen ) 
      const props = Object.assign({ antialias:false }, Oscillators.defaults, inputProps )
      const osc   = g.sub( 1, Oscillators.factory( 'saw', g.in( 'frequency' ), props.antialias ) )
      const graph = g.mul( osc, g.in( 'gain' ) )

      const out = Gibberish.factory( saw, graph, ['oscillators','ReverseSaw'], props )
      
      return out
    },

    factory( type, frequency, antialias=false ) {
      let osc

      switch( type ) {
        case 'pwm':
          let pulsewidth = g.in('pulsewidth')
          if( antialias === true ) {
            osc = feedbackOsc( frequency, 1, pulsewidth, { type:1 })
          }else{
            let phase = g.phasor( frequency, 0, { min:0 } )
            osc = g.lt( phase, pulsewidth )
          }
          break;
        case 'saw':
          if( antialias === false ) {
            osc = g.phasor( frequency )
          }else{
            osc = feedbackOsc( frequency, 1 )
          }
          break;
        case 'sine':
          osc = g.cycle( frequency )
          break;
        case 'square':
          if( antialias === true ) {
            osc = feedbackOsc( frequency, 1, .5, { type:1 })
          }else{
            osc = g.wavetable( frequency, { buffer:Oscillators.Square.buffer, name:'square' } )
          }
          break;
        case 'triangle':
          osc = g.wavetable( frequency, { buffer:Oscillators.Triangle.buffer, name:'triangle' } )
          break;
      }

      return osc
    }
  }

  Oscillators.Square.buffer = new Float32Array( 1024 )

  for( let i = 1023; i >= 0; i-- ) { 
    Oscillators.Square.buffer [ i ] = i / 1024 > .5 ? 1 : -1
  }

  Oscillators.Triangle.buffer = new Float32Array( 1024 )

  
  for( let i = 1024; i--; i = i ) { Oscillators.Triangle.buffer[i] = 1 - 4 * Math.abs(( (i / 1024) + 0.25) % 1 - 0.5); }

  Oscillators.defaults = {
    frequency: 440,
    gain: 1
  }

  return Oscillators

}

},{"../ugen.js":135,"./brownnoise.js":127,"./fmfeedbackosc.js":128,"./pinknoise.js":130,"./wavetable.js":131,"genish.js":37}],130:[function(require,module,exports){
const genish = require('genish.js'),
      ssd = genish.history,
      data = genish.data,
      noise = genish.noise;

module.exports = function () {
  "use jsdsp";

  const b = data(8, 1, { meta: true });
  const white = genish.sub(genish.mul(noise(), 2), 1);

  b[0] = genish.add(genish.mul(.99886, b[0]), genish.mul(white, .0555179));
  b[1] = genish.add(genish.mul(.99332, b[1]), genish.mul(white, .0750579));
  b[2] = genish.add(genish.mul(.96900, b[2]), genish.mul(white, .1538520));
  b[3] = genish.add(genish.mul(.88650, b[3]), genish.mul(white, .3104856));
  b[4] = genish.add(genish.mul(.55000, b[4]), genish.mul(white, .5329522));
  b[5] = genish.sub(genish.mul(-.7616, b[5]), genish.mul(white, .0168980));

  const out = genish.mul(genish.add(genish.add(genish.add(genish.add(genish.add(genish.add(genish.add(b[0], b[1]), b[2]), b[3]), b[4]), b[5]), b[6]), genish.mul(white, .5362)), .11);

  b[6] = genish.mul(white, .115926);

  return out;
};
},{"genish.js":37}],131:[function(require,module,exports){
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

},{"../ugen.js":135,"genish.js":37}],132:[function(require,module,exports){
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

},{"../external/priorityqueue.js":83,"big.js":139}],133:[function(require,module,exports){
const g = require( 'genish.js' ),
      proxy = require( '../workletProxy.js' ),
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
      seq.__properties__ = props

      if( props.target === undefined ) {
        seq.anonFunction = true
      }else{ 
        seq.anonFunction = false
        seq.callFunction = typeof props.target[ props.key ] === 'function'
      }

      props.id = Gibberish.factory.getUID()

      // need a separate reference to the properties for worklet meta-programming
      const properties = Object.assign( {}, Seq2.defaults, props )
      Object.assign( seq, properties ) 
      seq.__properties__ = properties

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

      return proxy( ['Sequencer2'], props, seq ) 
    }
  }

  Seq2.defaults = { rate: 1 }

  return Seq2.create

}


},{"../ugen.js":135,"../workletProxy.js":138,"genish.js":37}],134:[function(require,module,exports){
const Queue = require( '../external/priorityqueue.js' )
const Big   = require( 'big.js' )
const proxy = require( '../workletProxy.js' )

module.exports = function( Gibberish ) {

let Sequencer = props => {
  let seq = {
    __isRunning:false,

    __valuesPhase:  0,
    __timingsPhase: 0,
    __type:'seq',

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

  props.id = Gibberish.factory.getUID()

  // need a separate reference to the properties for worklet meta-programming
  const properties = Object.assign( {}, Sequencer.defaults, props )
  Object.assign( seq, properties ) 
  seq.__properties__ = properties

  return proxy( ['Sequencer'], properties, seq )
}

Sequencer.defaults = { priority:0 }

Sequencer.make = function( values, timings, target, key ) {
  return Sequencer({ values, timings, target, key })
}

return Sequencer

}

},{"../external/priorityqueue.js":83,"../workletProxy.js":138,"big.js":139}],135:[function(require,module,exports){
const replace = obj => {
  if( typeof obj === 'object' ) {
    if( obj.id !== undefined ) {
      return processor.ugens.get( obj.id )
    } 
  }

  return obj
}

let ugen = {
  free:function() {
    Gibberish.genish.gen.free( this.graph )
  },

  print:function() {
    console.log( this.callback.toString() )
  },

  connect:function( target, level=1 ) {
    if( this.connected === undefined ) this.connected = []


    let input = level === 1 ? this : Gibberish.binops.Mul( this, level )

    if( target === undefined || target === null ) target = Gibberish.output 


    if( typeof target.__addInput == 'function' ) {
      target.__addInput( input )
    } else if( target.sum && target.sum.inputs ) {
      target.sum.inputs.push( input )
    } else if( target.inputs ) {
      target.inputs.push( input )
    } else {
      target.input = input
    }

    Gibberish.dirty( target )

    this.connected.push([ target, input ])
    
    return this
  },

  disconnect:function( target ) {
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

  chain:function( target, level=1 ) {
    this.connect( target,level )

    return target
  },

  __redoGraph:function() {
    this.__createGraph()
    this.callback = Gibberish.genish.gen.createCallback( this.graph, Gibberish.memory, false, true )
    this.inputNames = new Set( Gibberish.genish.gen.parameters ) 
    this.callback.ugenName = this.ugenName
    Gibberish.dirty( this )
  },
}

module.exports = ugen

},{}],136:[function(require,module,exports){
const proxy = require( './workletProxy.js' )

module.exports = function( Gibberish ) {
  let uid = 0

  const factory = function( ugen, graph, __name, values, cb=null, shouldProxy = true ) {
    ugen.callback = cb === null ? Gibberish.genish.gen.createCallback( graph, Gibberish.memory, false, true ) : cb

    let name = Array.isArray( __name ) ? __name[ __name.length - 1 ] : __name

    Object.assign( ugen, {
      type: 'ugen',
      id: factory.getUID(), 
      ugenName: name + '_',
      graph: graph,
      inputNames: new Set( Gibberish.genish.gen.parameters ),
      isStereo: Array.isArray( graph ),
      dirty: true,
      __properties__:values
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
              
              // needed for filterType at the very least, becauae the props
              // are reused when re-creating the graph. This seems like a cheaper
              // way to solve this problem.
              values[ prop ] = v

              if( Gibberish.mode !== 'worklet' ) console.log( 'redoing graph!', v )
              this.__redoGraph()
            }
          }
        })
      })
    }

    // will only create proxy if worklets are being used
    // otherwise will return unaltered ugen
    return shouldProxy ? proxy( __name, values, ugen ) : ugen
  }

  factory.getUID = () => uid++

  return factory
}

},{"./workletProxy.js":138}],137:[function(require,module,exports){
let genish = require( 'genish.js' )

module.exports = function( Gibberish ) {

let utilities = {
  createContext( ctx, cb, resolve ) {
    let AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext

    let start = () => {
      if( typeof AC !== 'undefined' ) {
        Gibberish.ctx = ctx === undefined ? new AC() : ctx
        genish.gen.samplerate = Gibberish.ctx.sampleRate
        genish.utilities.ctx = Gibberish.ctx

        if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
          window.removeEventListener( 'touchstart', start )

          if( 'ontouchstart' in document.documentElement ){ // required to start audio under iOS 6
            let mySource = utilities.ctx.createBufferSource()
            mySource.connect( utilities.ctx.destination )
            mySource.noteOn( 0 )
          }
        }else{
          window.removeEventListener( 'mousedown', start )
        }
      }

      if( typeof cb === 'function' ) cb( resolve )
    }

    if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
      window.addEventListener( 'touchstart', start )
    }else{
      window.addEventListener( 'mousedown', start )
    }

    return Gibberish.ctx
  },

  createScriptProcessor( resolve ) {
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

    resolve()

    return Gibberish.node
  }, 

  createWorklet( resolve ) {
    Gibberish.ctx.audioWorklet.addModule( Gibberish.workletPath ).then( () => {
      Gibberish.worklet = new AudioWorkletNode( Gibberish.ctx, 'gibberish' )
      Gibberish.worklet.connect( Gibberish.ctx.destination )
      Gibberish.worklet.port.onmessage = event => {
        switch( event.data.address ) {
          case 'get':
            let name = event.data.name
            let value
            if( name[0] === 'Gibberish' ) {
              value = Gibberish
              name.shift()
            }
            for( let segment of name ) {
              value = value[ segment ]
            }

            Gibberish.worklet.port.postMessage({
              address:'set',
              name:'Gibberish.' + name.join('.'),
              value
            })

            break;
        }
      }
      resolve()
    })
  },

  wrap( func ) {
    const out = {
      action:'wrap',
      value:func    
    }
    return out
  },

  export( obj ) {
    obj.wrap = this.wrap
  }
}

return utilities

}

},{"genish.js":37}],138:[function(require,module,exports){
const serialize = require('serialize-javascript')

const replaceObj = obj => {
  if( typeof obj === 'object' && obj.id !== undefined ) {
    if( obj.__type !== 'seq' ) { // XXX why?
      return { id:obj.id, prop:obj.prop }
    }else{
      // shouldn't I be serializing most objects, not just seqs?
      return serialize( obj )
    }
  }
  return obj
}

const makeAndSendObject = function( __name, values, obj ) {
  const properties = {}
  for( let key in values ) {
    if( typeof values[ key ] === 'object' && values[ key ].__meta__ !== undefined ) {
      properties[ key ] = values[ key ].__meta__
    }else if( Array.isArray( values[ key ] ) ) {
      const arr = []
      for( let i = 0; i < values[ key ].length; i++ ) {
        arr[ i ] = replaceObj( values[ key ][i] )
      }
      properties[ key ] = arr
    }else if( typeof values[key] === 'object' ){
      properties[ key ] = replaceObj( values[ key ] )
    }else{
      properties[ key ] = values[ key ]
    }
  }

  let serializedProperties = serialize( properties )

  if( Array.isArray( __name ) ) {
    const oldName = __name[ __name.length - 1 ]
    __name[ __name.length - 1 ] = oldName[0].toUpperCase() + oldName.substring(1)
  }else{
    __name = [ __name[0].toUpperCase() + __name.substring(1) ]
  }

  obj.__meta__ = {
    address:'add',
    name:__name,
    properties:serializedProperties, 
    id:obj.id
  }

  //console.log( obj.__meta__ )

  Gibberish.worklet.port.postMessage( obj.__meta__ )

}

module.exports = function( __name, values, obj ) {

  if( Gibberish.mode === 'worklet' && Gibberish.preventProxy === false ) {

    makeAndSendObject( __name, values, obj )

    // proxy for all method calls to send to worklet
    const proxy = new Proxy( obj, {
      get( target, prop, receiver ) {
        if( typeof target[ prop ] === 'function' && prop.indexOf('__') === -1) {
          const proxy = new Proxy( target[ prop ], {
            apply( __target, thisArg, args ) {
              const __args = args.map( replaceObj )
              //if( prop === 'connect' ) console.log( 'proxy connect:', __args )

              Gibberish.worklet.port.postMessage({ 
                address:'method', 
                object:obj.id,
                name:prop,
                args:__args
              })

              return target[ prop ].apply( thisArg, args )
            }
          })
          
          return proxy
        }

        return target[ prop ]
      },
      set( target, prop, value, receiver ) {
        if( prop !== 'connected' ) {
          const __value = replaceObj( value )
          console.log( 'setter:', prop, __value )

          Gibberish.worklet.port.postMessage({ 
            address:'set', 
            object:obj.id,
            name:prop,
            value:__value
          })
        }

        target[ prop ] = value
      }
    })

    // XXX XXX XXX XXX XXX XXX
    // REMEMBER THAT YOU MUST ASSIGNED THE RETURNED VALUE TO YOUR UGEN,
    // YOU CANNOT USE THIS FUNCTION TO MODIFY A UGEN IN PLACE.
    // XXX XXX XXX XXX XXX XXX

    return proxy
  }

  return obj
}

},{"serialize-javascript":140}],139:[function(require,module,exports){
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

},{}],140:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

'use strict';

// Generate an internal UID to make the regexp pattern harder to guess.
var UID                 = Math.floor(Math.random() * 0x10000000000).toString(16);
var PLACE_HOLDER_REGEXP = new RegExp('"@__(F|R|D)-' + UID + '-(\\d+)__@"', 'g');

var IS_NATIVE_CODE_REGEXP = /\{\s*\[native code\]\s*\}/g;
var UNSAFE_CHARS_REGEXP   = /[<>\/\u2028\u2029]/g;

// Mapping of unsafe HTML and invalid JavaScript line terminator chars to their
// Unicode char counterparts which are safe to use in JavaScript strings.
var ESCAPED_CHARS = {
    '<'     : '\\u003C',
    '>'     : '\\u003E',
    '/'     : '\\u002F',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};

function escapeUnsafeChars(unsafeChar) {
    return ESCAPED_CHARS[unsafeChar];
}

module.exports = function serialize(obj, options) {
    options || (options = {});

    // Backwards-compatibility for `space` as the second argument.
    if (typeof options === 'number' || typeof options === 'string') {
        options = {space: options};
    }

    var functions = [];
    var regexps   = [];
    var dates     = [];

    // Returns placeholders for functions and regexps (identified by index)
    // which are later replaced by their string representation.
    function replacer(key, value) {
        if (!value) {
            return value;
        }

        // If the value is an object w/ a toJSON method, toJSON is called before
        // the replacer runs, so we use this[key] to get the non-toJSONed value.
        var origValue = this[key];
        var type = typeof origValue;

        if (type === 'object') {
            if(origValue instanceof RegExp) {
                return '@__R-' + UID + '-' + (regexps.push(origValue) - 1) + '__@';
            }

            if(origValue instanceof Date) {
                return '@__D-' + UID + '-' + (dates.push(origValue) - 1) + '__@';
            }
        }

        if (type === 'function') {
            return '@__F-' + UID + '-' + (functions.push(origValue) - 1) + '__@';
        }

        return value;
    }

    var str;

    // Creates a JSON string representation of the value.
    // NOTE: Node 0.12 goes into slow mode with extra JSON.stringify() args.
    if (options.isJSON && !options.space) {
        str = JSON.stringify(obj);
    } else {
        str = JSON.stringify(obj, options.isJSON ? null : replacer, options.space);
    }

    // Protects against `JSON.stringify()` returning `undefined`, by serializing
    // to the literal string: "undefined".
    if (typeof str !== 'string') {
        return String(str);
    }

    // Replace unsafe HTML and invalid JavaScript line terminator chars with
    // their safe Unicode char counterpart. This _must_ happen before the
    // regexps and functions are serialized and added back to the string.
    if (options.unsafe !== true) {
        str = str.replace(UNSAFE_CHARS_REGEXP, escapeUnsafeChars);
    }

    if (functions.length === 0 && regexps.length === 0 && dates.length === 0) {
        return str;
    }

    // Replaces all occurrences of function, regexp and date placeholders in the
    // JSON string with their string representations. If the original value can
    // not be found, then `undefined` is used.
    return str.replace(PLACE_HOLDER_REGEXP, function (match, type, valueIndex) {
        if (type === 'D') {
            return "new Date(\"" + dates[valueIndex].toISOString() + "\")";
        }

        if (type === 'R') {
            return regexps[valueIndex].toString();
        }

        var fn           = functions[valueIndex];
        var serializedFn = fn.toString();

        if (IS_NATIVE_CODE_REGEXP.test(serializedFn)) {
            throw new TypeError('Serializing native function: ' + fn.name);
        }

        return serializedFn;
    });
}

},{}],141:[function(require,module,exports){
'use strict'

let MemoryHelper = {
  create( sizeOrBuffer=4096, memtype=Float32Array ) {
    let helper = Object.create( this )

    // conveniently, buffer constructors accept either a size or an array buffer to use...
    // so, no matter which is passed to sizeOrBuffer it should work.
    Object.assign( helper, {
      heap: new memtype( sizeOrBuffer ),
      list: {},
      freeList: {}
    })

    return helper
  },

  alloc( size, immutable ) {
    let idx = -1

    if( size > this.heap.length ) {
      throw Error( 'Allocation request is larger than heap size of ' + this.heap.length )
    }

    for( let key in this.freeList ) {
      let candidate = this.freeList[ key ]

      if( candidate.size >= size ) {
        idx = key

        this.list[ idx ] = { size, immutable, references:1 }

        if( candidate.size !== size ) {
          let newIndex = idx + size,
              newFreeSize

          for( let key in this.list ) {
            if( key > newIndex ) {
              newFreeSize = key - newIndex
              this.freeList[ newIndex ] = newFreeSize
            }
          }
        }

        break
      }
    }

    if( idx !== -1 ) delete this.freeList[ idx ]

    if( idx === -1 ) {
      let keys = Object.keys( this.list ),
          lastIndex

      if( keys.length ) { // if not first allocation...
        lastIndex = parseInt( keys[ keys.length - 1 ] )

        idx = lastIndex + this.list[ lastIndex ].size
      }else{
        idx = 0
      }

      this.list[ idx ] = { size, immutable, references:1 }
    }

    if( idx + size >= this.heap.length ) {
      throw Error( 'No available blocks remain sufficient for allocation request.' )
    }
    return idx
  },

  addReference( index ) {
    if( this.list[ index ] !== undefined ) { 
      this.list[ index ].references++
    }
  },

  free( index ) {
    if( this.list[ index ] === undefined ) {
      throw Error( 'Calling free() on non-existing block.' )
    }

    let slot = this.list[ index ]
    if( slot === 0 ) return
    slot.references--

    if( slot.references === 0 && slot.immutable !== true ) {    
      this.list[ index ] = 0

      let freeBlockSize = 0
      for( let key in this.list ) {
        if( key > index ) {
          freeBlockSize = key - index
          break
        }
      }

      this.freeList[ index ] = freeBlockSize
    }
  },
}

module.exports = MemoryHelper

},{}]},{},[106])(106)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9nZW5pc2guanMvanMvYWJzLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2FjY3VtLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Fjb3MuanMiLCIuLi9nZW5pc2guanMvanMvYWQuanMiLCIuLi9nZW5pc2guanMvanMvYWRkLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Fkc3IuanMiLCIuLi9nZW5pc2guanMvanMvYW5kLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2FzaW4uanMiLCIuLi9nZW5pc2guanMvanMvYXRhbi5qcyIsIi4uL2dlbmlzaC5qcy9qcy9hdHRhY2suanMiLCIuLi9nZW5pc2guanMvanMvYmFuZy5qcyIsIi4uL2dlbmlzaC5qcy9qcy9ib29sLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2NlaWwuanMiLCIuLi9nZW5pc2guanMvanMvY2xhbXAuanMiLCIuLi9nZW5pc2guanMvanMvY29zLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2NvdW50ZXIuanMiLCIuLi9nZW5pc2guanMvanMvY3ljbGUuanMiLCIuLi9nZW5pc2guanMvanMvZGF0YS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9kY2Jsb2NrLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2RlY2F5LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2RlbGF5LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2RlbHRhLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Rpdi5qcyIsIi4uL2dlbmlzaC5qcy9qcy9lbnYuanMiLCIuLi9nZW5pc2guanMvanMvZXEuanMiLCIuLi9nZW5pc2guanMvanMvZXhwLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Zsb29yLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2ZvbGQuanMiLCIuLi9nZW5pc2guanMvanMvZ2F0ZS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9nZW4uanMiLCIuLi9nZW5pc2guanMvanMvZ3QuanMiLCIuLi9nZW5pc2guanMvanMvZ3RlLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2d0cC5qcyIsIi4uL2dlbmlzaC5qcy9qcy9oaXN0b3J5LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2lmZWxzZWlmLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2luLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2luZGV4LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2x0LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2x0ZS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9sdHAuanMiLCIuLi9nZW5pc2guanMvanMvbWF4LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL21lbW8uanMiLCIuLi9nZW5pc2guanMvanMvbWluLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL21peC5qcyIsIi4uL2dlbmlzaC5qcy9qcy9tb2QuanMiLCIuLi9nZW5pc2guanMvanMvbXN0b3NhbXBzLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL210b2YuanMiLCIuLi9nZW5pc2guanMvanMvbXVsLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL25lcS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9ub2lzZS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9ub3QuanMiLCIuLi9nZW5pc2guanMvanMvcGFuLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3BhcmFtLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3BlZWsuanMiLCIuLi9nZW5pc2guanMvanMvcGhhc29yLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3Bva2UuanMiLCIuLi9nZW5pc2guanMvanMvcG93LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3JhdGUuanMiLCIuLi9nZW5pc2guanMvanMvcm91bmQuanMiLCIuLi9nZW5pc2guanMvanMvc2FoLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3NlbGVjdG9yLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3NlcS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9zaWduLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3Npbi5qcyIsIi4uL2dlbmlzaC5qcy9qcy9zbGlkZS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9zdWIuanMiLCIuLi9nZW5pc2guanMvanMvc3dpdGNoLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3Q2MC5qcyIsIi4uL2dlbmlzaC5qcy9qcy90YW4uanMiLCIuLi9nZW5pc2guanMvanMvdGFuaC5qcyIsIi4uL2dlbmlzaC5qcy9qcy90cmFpbi5qcyIsIi4uL2dlbmlzaC5qcy9qcy91dGlsaXRpZXMuanMiLCIuLi9nZW5pc2guanMvanMvd2luZG93cy5qcyIsIi4uL2dlbmlzaC5qcy9qcy93cmFwLmpzIiwianMvYW5hbHlzaXMvYW5hbHl6ZXIuanMiLCJqcy9hbmFseXNpcy9hbmFseXplcnMuanMiLCJqcy9hbmFseXNpcy9mb2xsb3cuanMiLCJqcy9hbmFseXNpcy9zaW5nbGVzYW1wbGVkZWxheS5qcyIsImpzL2VudmVsb3Blcy9hZC5qcyIsImpzL2VudmVsb3Blcy9hZHNyLmpzIiwianMvZW52ZWxvcGVzL2VudmVsb3Blcy5qcyIsImpzL2VudmVsb3Blcy9yYW1wLmpzIiwianMvZXh0ZXJuYWwvcHJpb3JpdHlxdWV1ZS5qcyIsImpzL2ZpbHRlcnMvYWxscGFzcy5qcyIsImpzL2ZpbHRlcnMvYmlxdWFkLmpzIiwianMvZmlsdGVycy9jb21iZmlsdGVyLmpzIiwianMvZmlsdGVycy9kaW9kZUZpbHRlclpERi5qcyIsImpzL2ZpbHRlcnMvZmlsdGVyLmpzIiwianMvZmlsdGVycy9maWx0ZXIyNC5qcyIsImpzL2ZpbHRlcnMvZmlsdGVycy5qcyIsImpzL2ZpbHRlcnMvbGFkZGVyRmlsdGVyWmVyb0RlbGF5LmpzIiwianMvZmlsdGVycy9zdmYuanMiLCJqcy9meC9iaXRDcnVzaGVyLmpzIiwianMvZngvYnVmZmVyU2h1ZmZsZXIuanMiLCJqcy9meC9jaG9ydXMuanMiLCJqcy9meC9kYXR0b3Jyby5qcyIsImpzL2Z4L2RlbGF5LmpzIiwianMvZngvZGlzdG9ydGlvbi5qcyIsImpzL2Z4L2VmZmVjdC5qcyIsImpzL2Z4L2VmZmVjdHMuanMiLCJqcy9meC9mbGFuZ2VyLmpzIiwianMvZngvZnJlZXZlcmIuanMiLCJqcy9meC9yaW5nTW9kLmpzIiwianMvZngvdHJlbW9sby5qcyIsImpzL2Z4L3ZpYnJhdG8uanMiLCJqcy9pbmRleC5qcyIsImpzL2luc3RydW1lbnRzL2NvbmdhLmpzIiwianMvaW5zdHJ1bWVudHMvY293YmVsbC5qcyIsImpzL2luc3RydW1lbnRzL2ZtLmpzIiwianMvaW5zdHJ1bWVudHMvaGF0LmpzIiwianMvaW5zdHJ1bWVudHMvaW5zdHJ1bWVudC5qcyIsImpzL2luc3RydW1lbnRzL2luc3RydW1lbnRzLmpzIiwianMvaW5zdHJ1bWVudHMva2FycGx1c3N0cm9uZy5qcyIsImpzL2luc3RydW1lbnRzL2tpY2suanMiLCJqcy9pbnN0cnVtZW50cy9tb25vc3ludGguanMiLCJqcy9pbnN0cnVtZW50cy9wb2x5TWl4aW4uanMiLCJqcy9pbnN0cnVtZW50cy9wb2x5dGVtcGxhdGUuanMiLCJqcy9pbnN0cnVtZW50cy9zYW1wbGVyLmpzIiwianMvaW5zdHJ1bWVudHMvc25hcmUuanMiLCJqcy9pbnN0cnVtZW50cy9zeW50aC5qcyIsImpzL21pc2MvYmlub3BzLmpzIiwianMvbWlzYy9idXMuanMiLCJqcy9taXNjL2J1czIuanMiLCJqcy9taXNjL21vbm9wcy5qcyIsImpzL21pc2MvcGFubmVyLmpzIiwianMvbWlzYy90aW1lLmpzIiwianMvb3NjaWxsYXRvcnMvYnJvd25ub2lzZS5qcyIsImpzL29zY2lsbGF0b3JzL2ZtZmVlZGJhY2tvc2MuanMiLCJqcy9vc2NpbGxhdG9ycy9vc2NpbGxhdG9ycy5qcyIsImpzL29zY2lsbGF0b3JzL3Bpbmtub2lzZS5qcyIsImpzL29zY2lsbGF0b3JzL3dhdmV0YWJsZS5qcyIsImpzL3NjaGVkdWxpbmcvc2NoZWR1bGVyLmpzIiwianMvc2NoZWR1bGluZy9zZXEyLmpzIiwianMvc2NoZWR1bGluZy9zZXF1ZW5jZXIuanMiLCJqcy91Z2VuLmpzIiwianMvdWdlblRlbXBsYXRlLmpzIiwianMvdXRpbGl0aWVzLmpzIiwianMvd29ya2xldFByb3h5LmpzIiwibm9kZV9tb2R1bGVzL2JpZy5qcy9iaWcuanMiLCJub2RlX21vZHVsZXMvc2VyaWFsaXplLWphdmFzY3JpcHQvaW5kZXguanMiLCIuLi9tZW1vcnktaGVscGVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0bkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonYWJzJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0ID8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGguYWJzJyA6IE1hdGguYWJzIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1hYnMoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYWJzKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYWJzID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGFicy5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBhYnNcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYWNjdW0nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHlcblxuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG5cbiAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdGhpcy5pbml0aWFsVmFsdWVcblxuICAgIGZ1bmN0aW9uQm9keSA9IHRoaXMuY2FsbGJhY2soIGdlbk5hbWUsIGlucHV0c1swXSwgaW5wdXRzWzFdLCBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gIClcblxuICAgIC8vZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuICAgIFxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGNhbGxiYWNrKCBfbmFtZSwgX2luY3IsIF9yZXNldCwgdmFsdWVSZWYgKSB7XG4gICAgbGV0IGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSAnJyxcbiAgICAgICAgd3JhcCA9ICcnXG4gICAgXG4gICAgLyogdGhyZWUgZGlmZmVyZW50IG1ldGhvZHMgb2Ygd3JhcHBpbmcsIHRoaXJkIGlzIG1vc3QgZXhwZW5zaXZlOlxuICAgICAqXG4gICAgICogMTogcmFuZ2UgezAsMX06IHkgPSB4IC0gKHggfCAwKVxuICAgICAqIDI6IGxvZzIodGhpcy5tYXgpID09IGludGVnZXI6IHkgPSB4ICYgKHRoaXMubWF4IC0gMSlcbiAgICAgKiAzOiBhbGwgb3RoZXJzOiBpZiggeCA+PSB0aGlzLm1heCApIHkgPSB0aGlzLm1heCAteFxuICAgICAqXG4gICAgICovXG5cbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzFdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1sxXSA8IDEpICkgeyBcbiAgICAgIGlmKCB0aGlzLnJlc2V0VmFsdWUgIT09IHRoaXMubWluICkge1xuXG4gICAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLnJlc2V0VmFsdWV9XFxuXFxuYFxuICAgICAgICAvL291dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLm1pbn1cXG5cXG5gXG4gICAgICB9ZWxzZXtcbiAgICAgICAgb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMubWlufVxcblxcbmBcbiAgICAgICAgLy9vdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PTEgKSAke3ZhbHVlUmVmfSA9ICR7dGhpcy5pbml0aWFsVmFsdWV9XFxuXFxuYFxuICAgICAgfVxuICAgIH1cblxuICAgIG91dCArPSBgICB2YXIgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHt2YWx1ZVJlZn1cXG5gXG4gICAgXG4gICAgaWYoIHRoaXMuc2hvdWxkV3JhcCA9PT0gZmFsc2UgJiYgdGhpcy5zaG91bGRDbGFtcCA9PT0gdHJ1ZSApIHtcbiAgICAgIG91dCArPSBgICBpZiggJHt2YWx1ZVJlZn0gPCAke3RoaXMubWF4IH0gKSAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmBcbiAgICB9ZWxzZXtcbiAgICAgIG91dCArPSBgICAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmAgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuICAgIH1cblxuICAgIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgICYmIHRoaXMuc2hvdWxkV3JhcE1heCApIHdyYXAgKz0gYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICkgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxcbmBcbiAgICBpZiggdGhpcy5taW4gIT09IC1JbmZpbml0eSAmJiB0aGlzLnNob3VsZFdyYXBNaW4gKSB3cmFwICs9IGAgIGlmKCAke3ZhbHVlUmVmfSA8ICR7dGhpcy5taW59ICkgJHt2YWx1ZVJlZn0gKz0gJHtkaWZmfVxcbmBcblxuICAgIC8vaWYoIHRoaXMubWluID09PSAwICYmIHRoaXMubWF4ID09PSAxICkgeyBcbiAgICAvLyAgd3JhcCA9ICBgICAke3ZhbHVlUmVmfSA9ICR7dmFsdWVSZWZ9IC0gKCR7dmFsdWVSZWZ9IHwgMClcXG5cXG5gXG4gICAgLy99IGVsc2UgaWYoIHRoaXMubWluID09PSAwICYmICggTWF0aC5sb2cyKCB0aGlzLm1heCApIHwgMCApID09PSBNYXRoLmxvZzIoIHRoaXMubWF4ICkgKSB7XG4gICAgLy8gIHdyYXAgPSAgYCAgJHt2YWx1ZVJlZn0gPSAke3ZhbHVlUmVmfSAmICgke3RoaXMubWF4fSAtIDEpXFxuXFxuYFxuICAgIC8vfSBlbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgKXtcbiAgICAvLyAgd3JhcCA9IGAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSApICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cXG5cXG5gXG4gICAgLy99XG5cbiAgICBvdXQgPSBvdXQgKyB3cmFwICsgJ1xcbidcblxuICAgIHJldHVybiBvdXRcbiAgfSxcblxuICBkZWZhdWx0cyA6IHsgbWluOjAsIG1heDoxLCByZXNldFZhbHVlOjAsIGluaXRpYWxWYWx1ZTowLCBzaG91bGRXcmFwOnRydWUsIHNob3VsZFdyYXBNYXg6IHRydWUsIHNob3VsZFdyYXBNaW46dHJ1ZSwgc2hvdWxkQ2xhbXA6ZmFsc2UgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5jciwgcmVzZXQ9MCwgcHJvcGVydGllcyApID0+IHtcbiAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgICAgIFxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBcbiAgICB7IFxuICAgICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgICBpbnB1dHM6IFsgaW5jciwgcmVzZXQgXSxcbiAgICAgIG1lbW9yeToge1xuICAgICAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcHJvdG8uZGVmYXVsdHMsXG4gICAgcHJvcGVydGllcyBcbiAgKVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5zaG91bGRXcmFwTWF4ID09PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5zaG91bGRXcmFwTWluID09PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIHByb3BlcnRpZXMuc2hvdWxkV3JhcCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgdWdlbi5zaG91bGRXcmFwTWluID0gdWdlbi5zaG91bGRXcmFwTWF4ID0gcHJvcGVydGllcy5zaG91bGRXcmFwXG4gICAgfVxuICB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLnJlc2V0VmFsdWUgPT09IHVuZGVmaW5lZCApIHtcbiAgICB1Z2VuLnJlc2V0VmFsdWUgPSB1Z2VuLm1pblxuICB9XG5cbiAgaWYoIHVnZW4uaW5pdGlhbFZhbHVlID09PSB1bmRlZmluZWQgKSB1Z2VuLmluaXRpYWxWYWx1ZSA9IHVnZW4ubWluXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkgIHsgXG4gICAgICAvL2NvbnNvbGUubG9nKCAnZ2VuOicsIGdlbiwgZ2VuLm1lbW9yeSApXG4gICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSBcbiAgICB9LFxuICAgIHNldCh2KSB7IGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IH1cbiAgfSlcblxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Fjb3MnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcblxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQgPyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnYWNvcyc6IGlzV29ya2xldCA/ICdNYXRoLmFjb3MnIDpNYXRoLmFjb3MgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWFjb3MoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFjb3MoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhY29zID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGFjb3MuaW5wdXRzID0gWyB4IF1cbiAgYWNvcy5pZCA9IGdlbi5nZXRVSUQoKVxuICBhY29zLm5hbWUgPSBgJHthY29zLmJhc2VuYW1lfXthY29zLmlkfWBcblxuICByZXR1cm4gYWNvc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBtdWwgICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBzdWIgICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBkaXYgICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgICBkYXRhICAgICA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayAgICAgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIGFjY3VtICAgID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgaWZlbHNlICAgPSByZXF1aXJlKCAnLi9pZmVsc2VpZi5qcycgKSxcbiAgICBsdCAgICAgICA9IHJlcXVpcmUoICcuL2x0LmpzJyApLFxuICAgIGJhbmcgICAgID0gcmVxdWlyZSggJy4vYmFuZy5qcycgKSxcbiAgICBlbnYgICAgICA9IHJlcXVpcmUoICcuL2Vudi5qcycgKSxcbiAgICBhZGQgICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBwb2tlICAgICA9IHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gICAgbmVxICAgICAgPSByZXF1aXJlKCAnLi9uZXEuanMnICksXG4gICAgYW5kICAgICAgPSByZXF1aXJlKCAnLi9hbmQuanMnICksXG4gICAgZ3RlICAgICAgPSByZXF1aXJlKCAnLi9ndGUuanMnICksXG4gICAgbWVtbyAgICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIHV0aWxpdGllcz0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBhdHRhY2tUaW1lID0gNDQxMDAsIGRlY2F5VGltZSA9IDQ0MTAwLCBfcHJvcHMgKSA9PiB7XG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBzaGFwZTonZXhwb25lbnRpYWwnLCBhbHBoYTo1LCB0cmlnZ2VyOm51bGwgfSwgX3Byb3BzIClcbiAgY29uc3QgX2JhbmcgPSBwcm9wcy50cmlnZ2VyICE9PSBudWxsID8gcHJvcHMudHJpZ2dlciA6IGJhbmcoKSxcbiAgICAgICAgcGhhc2UgPSBhY2N1bSggMSwgX2JhbmcsIHsgbWluOjAsIG1heDogSW5maW5pdHksIGluaXRpYWxWYWx1ZTotSW5maW5pdHksIHNob3VsZFdyYXA6ZmFsc2UgfSlcbiAgICAgIFxuICBsZXQgYnVmZmVyRGF0YSwgYnVmZmVyRGF0YVJldmVyc2UsIGRlY2F5RGF0YSwgb3V0LCBidWZmZXJcblxuICAvL2NvbnNvbGUubG9nKCAnc2hhcGU6JywgcHJvcHMuc2hhcGUsICdhdHRhY2sgdGltZTonLCBhdHRhY2tUaW1lLCAnZGVjYXkgdGltZTonLCBkZWNheVRpbWUgKVxuICBsZXQgY29tcGxldGVGbGFnID0gZGF0YSggWzBdIClcbiAgXG4gIC8vIHNsaWdodGx5IG1vcmUgZWZmaWNpZW50IHRvIHVzZSBleGlzdGluZyBwaGFzZSBhY2N1bXVsYXRvciBmb3IgbGluZWFyIGVudmVsb3Blc1xuICBpZiggcHJvcHMuc2hhcGUgPT09ICdsaW5lYXInICkge1xuICAgIG91dCA9IGlmZWxzZSggXG4gICAgICBhbmQoIGd0ZSggcGhhc2UsIDApLCBsdCggcGhhc2UsIGF0dGFja1RpbWUgKSksXG4gICAgICBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICksXG5cbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksICBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lICkgKSApLFxuICAgICAgc3ViKCAxLCBkaXYoIHN1YiggcGhhc2UsIGF0dGFja1RpbWUgKSwgZGVjYXlUaW1lICkgKSxcbiAgICAgIFxuICAgICAgbmVxKCBwaGFzZSwgLUluZmluaXR5KSxcbiAgICAgIHBva2UoIGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6MCB9KSxcblxuICAgICAgMCBcbiAgICApXG4gIH0gZWxzZSB7XG4gICAgYnVmZmVyRGF0YSA9IGVudih7IGxlbmd0aDoxMDI0LCB0eXBlOnByb3BzLnNoYXBlLCBhbHBoYTpwcm9wcy5hbHBoYSB9KVxuICAgIGJ1ZmZlckRhdGFSZXZlcnNlID0gZW52KHsgbGVuZ3RoOjEwMjQsIHR5cGU6cHJvcHMuc2hhcGUsIGFscGhhOnByb3BzLmFscGhhLCByZXZlcnNlOnRydWUgfSlcblxuICAgIG91dCA9IGlmZWxzZSggXG4gICAgICBhbmQoIGd0ZSggcGhhc2UsIDApLCBsdCggcGhhc2UsIGF0dGFja1RpbWUgKSApLCBcbiAgICAgIHBlZWsoIGJ1ZmZlckRhdGEsIGRpdiggcGhhc2UsIGF0dGFja1RpbWUgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9ICksIFxuXG4gICAgICBhbmQoIGd0ZShwaGFzZSwwKSwgbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSApICkgKSwgXG4gICAgICBwZWVrKCBidWZmZXJEYXRhUmV2ZXJzZSwgZGl2KCBzdWIoIHBoYXNlLCBhdHRhY2tUaW1lICksIGRlY2F5VGltZSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pLFxuXG4gICAgICBuZXEoIHBoYXNlLCAtSW5maW5pdHkgKSxcbiAgICAgIHBva2UoIGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6MCB9KSxcblxuICAgICAgMFxuICAgIClcbiAgfVxuXG4gIGNvbnN0IHVzaW5nV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgaWYoIHVzaW5nV29ya2xldCA9PT0gdHJ1ZSApIHtcbiAgICBvdXQubm9kZSA9IG51bGxcbiAgICB1dGlsaXRpZXMucmVnaXN0ZXIoIG91dCApXG4gIH1cblxuICAvLyBuZWVkZWQgZm9yIGdpYmJlcmlzaC4uLiBnZXR0aW5nIHRoaXMgdG8gd29yayByaWdodCB3aXRoIHdvcmtsZXRzXG4gIC8vIHZpYSBwcm9taXNlcyB3aWxsIHByb2JhYmx5IGJlIHRyaWNreVxuICBvdXQuaXNDb21wbGV0ZSA9ICgpPT4ge1xuICAgIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgJiYgb3V0Lm5vZGUgIT09IG51bGwgKSB7XG4gICAgICBjb25zdCBwID0gbmV3IFByb21pc2UoIHJlc29sdmUgPT4ge1xuICAgICAgICBvdXQubm9kZS5nZXRNZW1vcnlWYWx1ZSggY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4LCByZXNvbHZlIClcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBwXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyBjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHggXVxuICAgIH1cbiAgfVxuXG4gIG91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgaWYoIHVzaW5nV29ya2xldCA9PT0gdHJ1ZSAmJiBvdXQubm9kZSAhPT0gbnVsbCApIHtcbiAgICAgIG91dC5ub2RlLnBvcnQucG9zdE1lc3NhZ2UoeyBrZXk6J3NldCcsIGlkeDpjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHgsIHZhbHVlOjAgfSlcbiAgICB9ZWxzZXtcbiAgICAgIGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF0gPSAwXG4gICAgfVxuICAgIF9iYW5nLnRyaWdnZXIoKVxuICB9XG5cbiAgcmV0dXJuIG91dCBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmNvbnN0IHByb3RvID0geyBcbiAgYmFzZW5hbWU6J2FkZCcsXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQ9JycsXG4gICAgICAgIHN1bSA9IDAsIG51bUNvdW50ID0gMCwgYWRkZXJBdEVuZCA9IGZhbHNlLCBhbHJlYWR5RnVsbFN1bW1lZCA9IHRydWVcblxuICAgIGlmKCBpbnB1dHMubGVuZ3RoID09PSAwICkgcmV0dXJuIDBcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGlzTmFOKCB2ICkgKSB7XG4gICAgICAgIG91dCArPSB2XG4gICAgICAgIGlmKCBpIDwgaW5wdXRzLmxlbmd0aCAtMSApIHtcbiAgICAgICAgICBhZGRlckF0RW5kID0gdHJ1ZVxuICAgICAgICAgIG91dCArPSAnICsgJ1xuICAgICAgICB9XG4gICAgICAgIGFscmVhZHlGdWxsU3VtbWVkID0gZmFsc2VcbiAgICAgIH1lbHNle1xuICAgICAgICBzdW0gKz0gcGFyc2VGbG9hdCggdiApXG4gICAgICAgIG51bUNvdW50KytcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYoIG51bUNvdW50ID4gMCApIHtcbiAgICAgIG91dCArPSBhZGRlckF0RW5kIHx8IGFscmVhZHlGdWxsU3VtbWVkID8gc3VtIDogJyArICcgKyBzdW1cbiAgICB9XG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5hcmdzICkgPT4ge1xuICBjb25zdCBhZGQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIGFkZC5pZCA9IGdlbi5nZXRVSUQoKVxuICBhZGQubmFtZSA9IGFkZC5iYXNlbmFtZSArIGFkZC5pZFxuICBhZGQuaW5wdXRzID0gYXJnc1xuXG4gIHJldHVybiBhZGRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbXVsICAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgZGl2ICAgICAgPSByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gICAgZGF0YSAgICAgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgICAgID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBhY2N1bSAgICA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGlmZWxzZSAgID0gcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gICAgbHQgICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBiYW5nICAgICA9IHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gICAgZW52ICAgICAgPSByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gICAgcGFyYW0gICAgPSByZXF1aXJlKCAnLi9wYXJhbS5qcycgKSxcbiAgICBhZGQgICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBndHAgICAgICA9IHJlcXVpcmUoICcuL2d0cC5qcycgKSxcbiAgICBub3QgICAgICA9IHJlcXVpcmUoICcuL25vdC5qcycgKSxcbiAgICBhbmQgICAgICA9IHJlcXVpcmUoICcuL2FuZC5qcycgKSxcbiAgICBuZXEgICAgICA9IHJlcXVpcmUoICcuL25lcS5qcycgKSxcbiAgICBwb2tlICAgICA9IHJlcXVpcmUoICcuL3Bva2UuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGF0dGFja1RpbWU9NDQsIGRlY2F5VGltZT0yMjA1MCwgc3VzdGFpblRpbWU9NDQxMDAsIHN1c3RhaW5MZXZlbD0uNiwgcmVsZWFzZVRpbWU9NDQxMDAsIF9wcm9wcyApID0+IHtcbiAgbGV0IGVudlRyaWdnZXIgPSBiYW5nKCksXG4gICAgICBwaGFzZSA9IGFjY3VtKCAxLCBlbnZUcmlnZ2VyLCB7IG1heDogSW5maW5pdHksIHNob3VsZFdyYXA6ZmFsc2UsIGluaXRpYWxWYWx1ZTpJbmZpbml0eSB9KSxcbiAgICAgIHNob3VsZFN1c3RhaW4gPSBwYXJhbSggMSApLFxuICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICBzaGFwZTogJ2V4cG9uZW50aWFsJyxcbiAgICAgICAgIGFscGhhOiA1LFxuICAgICAgICAgdHJpZ2dlclJlbGVhc2U6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIF9wcm9wcyApLFxuICAgICAgYnVmZmVyRGF0YSwgZGVjYXlEYXRhLCBvdXQsIGJ1ZmZlciwgc3VzdGFpbkNvbmRpdGlvbiwgcmVsZWFzZUFjY3VtLCByZWxlYXNlQ29uZGl0aW9uXG5cblxuICBjb25zdCBjb21wbGV0ZUZsYWcgPSBkYXRhKCBbMF0gKVxuXG4gIGJ1ZmZlckRhdGEgPSBlbnYoeyBsZW5ndGg6MTAyNCwgYWxwaGE6cHJvcHMuYWxwaGEsIHNoaWZ0OjAsIHR5cGU6cHJvcHMuc2hhcGUgfSlcblxuICBzdXN0YWluQ29uZGl0aW9uID0gcHJvcHMudHJpZ2dlclJlbGVhc2UgXG4gICAgPyBzaG91bGRTdXN0YWluXG4gICAgOiBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSApIClcblxuICByZWxlYXNlQWNjdW0gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZVxuICAgID8gZ3RwKCBzdWIoIHN1c3RhaW5MZXZlbCwgYWNjdW0oIGRpdiggc3VzdGFpbkxldmVsLCByZWxlYXNlVGltZSApICwgMCwgeyBzaG91bGRXcmFwOmZhbHNlIH0pICksIDAgKVxuICAgIDogc3ViKCBzdXN0YWluTGV2ZWwsIG11bCggZGl2KCBzdWIoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSwgc3VzdGFpblRpbWUgKSApLCByZWxlYXNlVGltZSApLCBzdXN0YWluTGV2ZWwgKSApLCBcblxuICByZWxlYXNlQ29uZGl0aW9uID0gcHJvcHMudHJpZ2dlclJlbGVhc2VcbiAgICA/IG5vdCggc2hvdWxkU3VzdGFpbiApXG4gICAgOiBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSwgcmVsZWFzZVRpbWUgKSApXG5cbiAgb3V0ID0gaWZlbHNlKFxuICAgIC8vIGF0dGFjayBcbiAgICBsdCggcGhhc2UsICBhdHRhY2tUaW1lICksIFxuICAgIHBlZWsoIGJ1ZmZlckRhdGEsIGRpdiggcGhhc2UsIGF0dGFja1RpbWUgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9ICksIFxuXG4gICAgLy8gZGVjYXlcbiAgICBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lICkgKSwgXG4gICAgcGVlayggYnVmZmVyRGF0YSwgc3ViKCAxLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgIGF0dGFja1RpbWUgKSwgIGRlY2F5VGltZSApLCBzdWIoIDEsICBzdXN0YWluTGV2ZWwgKSApICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSksXG5cbiAgICAvLyBzdXN0YWluXG4gICAgYW5kKCBzdXN0YWluQ29uZGl0aW9uLCBuZXEoIHBoYXNlLCBJbmZpbml0eSApICksXG4gICAgcGVlayggYnVmZmVyRGF0YSwgIHN1c3RhaW5MZXZlbCApLFxuXG4gICAgLy8gcmVsZWFzZVxuICAgIHJlbGVhc2VDb25kaXRpb24sIC8vbHQoIHBoYXNlLCAgYXR0YWNrVGltZSArICBkZWNheVRpbWUgKyAgc3VzdGFpblRpbWUgKyAgcmVsZWFzZVRpbWUgKSxcbiAgICBwZWVrKCBcbiAgICAgIGJ1ZmZlckRhdGEsXG4gICAgICByZWxlYXNlQWNjdW0sIFxuICAgICAgLy9zdWIoICBzdXN0YWluTGV2ZWwsIG11bCggZGl2KCBzdWIoIHBoYXNlLCAgYXR0YWNrVGltZSArICBkZWNheVRpbWUgKyAgc3VzdGFpblRpbWUpLCAgcmVsZWFzZVRpbWUgKSwgIHN1c3RhaW5MZXZlbCApICksIFxuICAgICAgeyBib3VuZG1vZGU6J2NsYW1wJyB9XG4gICAgKSxcblxuICAgIG5lcSggcGhhc2UsIEluZmluaXR5ICksXG4gICAgcG9rZSggY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTowIH0pLFxuXG4gICAgMFxuICApXG4gICBcbiAgY29uc3QgdXNpbmdXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICBpZiggdXNpbmdXb3JrbGV0ID09PSB0cnVlICkge1xuICAgIG91dC5ub2RlID0gbnVsbFxuICAgIHV0aWxpdGllcy5yZWdpc3Rlciggb3V0IClcbiAgfVxuXG4gIG91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc2hvdWxkU3VzdGFpbi52YWx1ZSA9IDFcbiAgICBlbnZUcmlnZ2VyLnRyaWdnZXIoKVxuICB9XG4gXG4gIC8vIG5lZWRlZCBmb3IgZ2liYmVyaXNoLi4uIGdldHRpbmcgdGhpcyB0byB3b3JrIHJpZ2h0IHdpdGggd29ya2xldHNcbiAgLy8gdmlhIHByb21pc2VzIHdpbGwgcHJvYmFibHkgYmUgdHJpY2t5XG4gIG91dC5pc0NvbXBsZXRlID0gKCk9PiB7XG4gICAgaWYoIHVzaW5nV29ya2xldCA9PT0gdHJ1ZSAmJiBvdXQubm9kZSAhPT0gbnVsbCApIHtcbiAgICAgIGNvbnN0IHAgPSBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgIG91dC5ub2RlLmdldE1lbW9yeVZhbHVlKCBjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHgsIHJlc29sdmUgKVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHBcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCBdXG4gICAgfVxuICB9XG5cblxuICBvdXQucmVsZWFzZSA9ICgpPT4ge1xuICAgIHNob3VsZFN1c3RhaW4udmFsdWUgPSAwXG4gICAgLy8gWFhYIHByZXR0eSBuYXN0eS4uLiBncmFicyBhY2N1bSBpbnNpZGUgb2YgZ3RwIGFuZCByZXNldHMgdmFsdWUgbWFudWFsbHlcbiAgICAvLyB1bmZvcnR1bmF0ZWx5IGVudlRyaWdnZXIgd29uJ3Qgd29yayBhcyBpdCdzIGJhY2sgdG8gMCBieSB0aGUgdGltZSB0aGUgcmVsZWFzZSBibG9jayBpcyB0cmlnZ2VyZWQuLi5cbiAgICBpZiggdXNpbmdXb3JrbGV0ICYmIG91dC5ub2RlICE9PSBudWxsICkge1xuICAgICAgY29uc29sZS5sb2coICd3b3JrbGV0Pz8nIClcbiAgICAgIG91dC5ub2RlLnBvcnQucG9zdE1lc3NhZ2UoeyBrZXk6J3NldCcsIGlkeDpyZWxlYXNlQWNjdW0uaW5wdXRzWzBdLmlucHV0c1sxXS5tZW1vcnkudmFsdWUuaWR4LCB2YWx1ZTowIH0pXG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmxvZyggJ25vbi13b3JrbGV0Li4uJyApXG4gICAgICBnZW4ubWVtb3J5LmhlYXBbIHJlbGVhc2VBY2N1bS5pbnB1dHNbMF0uaW5wdXRzWzFdLm1lbW9yeS52YWx1ZS5pZHggXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYW5kJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSAhPT0gMCAmJiAke2lucHV0c1sxXX0gIT09IDApIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXNpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQgPyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnYXNpbic6IGlzV29ya2xldCA/ICdNYXRoLnNpbicgOiBNYXRoLmFzaW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWFzaW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFzaW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGFzaW4uaW5wdXRzID0gWyB4IF1cbiAgYXNpbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBhc2luLm5hbWUgPSBgJHthc2luLmJhc2VuYW1lfXthc2luLmlkfWBcblxuICByZXR1cm4gYXNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhdGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldCA/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhdGFuJzogaXNXb3JrbGV0ID8gJ01hdGguYXRhbicgOiBNYXRoLmF0YW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWF0YW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmF0YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhdGFuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGF0YW4uaW5wdXRzID0gWyB4IF1cbiAgYXRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBhdGFuLm5hbWUgPSBgJHthdGFuLmJhc2VuYW1lfXthdGFuLmlkfWBcblxuICByZXR1cm4gYXRhblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZGVjYXlUaW1lID0gNDQxMDAgKSA9PiB7XG4gIGxldCBzc2QgPSBoaXN0b3J5ICggMSApLFxuICAgICAgdDYwID0gTWF0aC5leHAoIC02LjkwNzc1NTI3ODkyMSAvIGRlY2F5VGltZSApXG5cbiAgc3NkLmluKCBtdWwoIHNzZC5vdXQsIHQ2MCApIClcblxuICBzc2Qub3V0LnRyaWdnZXIgPSAoKT0+IHtcbiAgICBzc2QudmFsdWUgPSAxXG4gIH1cblxuICByZXR1cm4gc3ViKCAxLCBzc2Qub3V0IClcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGdlbigpIHtcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGxldCBvdXQgPSBcbmAgIHZhciAke3RoaXMubmFtZX0gPSBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XVxuICBpZiggJHt0aGlzLm5hbWV9ID09PSAxICkgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV0gPSAwICAgICAgXG4gICAgICBcbmBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIF9wcm9wcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG1pbjowLCBtYXg6MSB9LCBfcHJvcHMgKVxuXG4gIHVnZW4ubmFtZSA9ICdiYW5nJyArIGdlbi5nZXRVSUQoKVxuXG4gIHVnZW4ubWluID0gcHJvcHMubWluXG4gIHVnZW4ubWF4ID0gcHJvcHMubWF4XG5cbiAgY29uc3QgdXNpbmdXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICBpZiggdXNpbmdXb3JrbGV0ID09PSB0cnVlICkge1xuICAgIHVnZW4ubm9kZSA9IG51bGxcbiAgICB1dGlsaXRpZXMucmVnaXN0ZXIoIHVnZW4gKVxuICB9XG5cbiAgdWdlbi50cmlnZ2VyID0gKCkgPT4ge1xuICAgIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgJiYgdWdlbi5ub2RlICE9PSBudWxsICkge1xuICAgICAgdWdlbi5ub2RlLnBvcnQucG9zdE1lc3NhZ2UoeyBrZXk6J3NldCcsIGlkeDp1Z2VuLm1lbW9yeS52YWx1ZS5pZHgsIHZhbHVlOnVnZW4ubWF4IH0pXG4gICAgfWVsc2V7XG4gICAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gdWdlbi5tYXggXG4gICAgfVxuICB9XG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidib29sJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBgJHtpbnB1dHNbMF19ID09PSAwID8gMCA6IDFgXG4gICAgXG4gICAgLy9nZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YFxuXG4gICAgLy9yZXR1cm4gWyBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YCwgJyAnICtvdXQgXVxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonY2VpbCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldCA/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLmNlaWwnIDogTWF0aC5jZWlsIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1jZWlsKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmNlaWwoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBjZWlsID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGNlaWwuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gY2VpbFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBmbG9vcj0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiAgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjbGlwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0XG5cbiAgICBvdXQgPVxuXG5gIHZhciAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cbiAgaWYoICR7dGhpcy5uYW1lfSA+ICR7aW5wdXRzWzJdfSApICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzJdfVxuICBlbHNlIGlmKCAke3RoaXMubmFtZX0gPCAke2lucHV0c1sxXX0gKSAke3RoaXMubmFtZX0gPSAke2lucHV0c1sxXX1cbmBcbiAgICBvdXQgPSAnICcgKyBvdXRcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPS0xLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xLCBtaW4sIG1heCBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjb3MnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG5cbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQgPyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnY29zJzogaXNXb3JrbGV0ID8gJ01hdGguY29zJyA6IE1hdGguY29zIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1jb3MoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmNvcyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNvcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBjb3MuaW5wdXRzID0gWyB4IF1cbiAgY29zLmlkID0gZ2VuLmdldFVJRCgpXG4gIGNvcy5uYW1lID0gYCR7Y29zLmJhc2VuYW1lfXtjb3MuaWR9YFxuXG4gIHJldHVybiBjb3Ncbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY291bnRlcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keVxuICAgICAgIFxuICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIGZ1bmN0aW9uQm9keSAgPSB0aGlzLmNhbGxiYWNrKCBnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSwgaW5wdXRzWzJdLCBpbnB1dHNbM10sIGlucHV0c1s0XSwgIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAsIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS53cmFwLmlkeH1dYCAgKVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcbiAgIFxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy53cmFwLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkgdGhpcy53cmFwLmdlbigpXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfbWluLCBfbWF4LCBfcmVzZXQsIGxvb3BzLCB2YWx1ZVJlZiwgd3JhcFJlZiApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJydcbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzNdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1szXSA8IDEpICkgeyBcbiAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49IDEgKSAke3ZhbHVlUmVmfSA9ICR7X21pbn1cXG5gXG4gICAgfVxuXG4gICAgb3V0ICs9IGAgIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3ZhbHVlUmVmfTtcXG4gICR7dmFsdWVSZWZ9ICs9ICR7X2luY3J9XFxuYCAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyAgXG4gICAgXG4gICAgaWYoIHR5cGVvZiB0aGlzLm1heCA9PT0gJ251bWJlcicgJiYgdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHR5cGVvZiB0aGlzLm1pbiAhPT0gJ251bWJlcicgKSB7XG4gICAgICB3cmFwID0gXG5gICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgJiYgdGhpcy5taW4gIT09IEluZmluaXR5ICkge1xuICAgICAgd3JhcCA9IFxuYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7X21heH0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9IC09ICR7X21heH0gLSAke19taW59XG4gICAgJHt3cmFwUmVmfSA9IDFcbiAgfWVsc2UgaWYoICR7dmFsdWVSZWZ9IDwgJHtfbWlufSAmJiAgJHtsb29wc30gPiAwKSB7XG4gICAgJHt2YWx1ZVJlZn0gKz0gJHtfbWF4fSAtICR7X21pbn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNle1xuICAgICAgb3V0ICs9ICdcXG4nXG4gICAgfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcFxuXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyPTEsIG1pbj0wLCBtYXg9SW5maW5pdHksIHJlc2V0PTAsIGxvb3BzPTEsICBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgaW5pdGlhbFZhbHVlOiAwLCBzaG91bGRXcmFwOnRydWUgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW46ICAgIG1pbiwgXG4gICAgbWF4OiAgICBtYXgsXG4gICAgdmFsdWU6ICBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluY3IsIG1pbiwgbWF4LCByZXNldCwgbG9vcHMgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSxcbiAgICAgIHdyYXA6ICB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSBcbiAgICB9LFxuICAgIHdyYXAgOiB7XG4gICAgICBnZW4oKSB7IFxuICAgICAgICBpZiggdWdlbi5tZW1vcnkud3JhcC5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgfVxuICAgICAgICBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVsgJHt1Z2VuLm1lbW9yeS53cmFwLmlkeH0gXWBcbiAgICAgICAgcmV0dXJuIGBtZW1vcnlbICR7dWdlbi5tZW1vcnkud3JhcC5pZHh9IF1gIFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZGVmYXVsdHMgKVxuIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgXG4gICAgICB9XG4gICAgfVxuICB9KVxuICBcbiAgdWdlbi53cmFwLmlucHV0cyA9IFsgdWdlbiBdXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG4gIHVnZW4ud3JhcC5uYW1lID0gdWdlbi5uYW1lICsgJ193cmFwJ1xuICByZXR1cm4gdWdlblxufSBcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bT0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgcGhhc29yPXJlcXVpcmUoICcuL3BoYXNvci5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2N5Y2xlJyxcblxuICBpbml0VGFibGUoKSB7ICAgIFxuICAgIGxldCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICAgIGZvciggbGV0IGkgPSAwLCBsID0gYnVmZmVyLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gTWF0aC5zaW4oICggaSAvIGwgKSAqICggTWF0aC5QSSAqIDIgKSApXG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMuY3ljbGUgPSBkYXRhKCBidWZmZXIsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSApXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTEsIHJlc2V0PTAsIF9wcm9wcyApID0+IHtcbiAgaWYoIHR5cGVvZiBnZW4uZ2xvYmFscy5jeWNsZSA9PT0gJ3VuZGVmaW5lZCcgKSBwcm90by5pbml0VGFibGUoKSBcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG1pbjowIH0sIF9wcm9wcyApXG5cbiAgY29uc3QgdWdlbiA9IHBlZWsoIGdlbi5nbG9iYWxzLmN5Y2xlLCBwaGFzb3IoIGZyZXF1ZW5jeSwgcmVzZXQsIHByb3BzICkpXG4gIHVnZW4ubmFtZSA9ICdjeWNsZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgdXRpbGl0aWVzID0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApLFxuICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gIHBva2UgPSByZXF1aXJlKCcuL3Bva2UuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkYXRhJyxcbiAgZ2xvYmFsczoge30sXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpZHhcbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMubmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBsZXQgdWdlbiA9IHRoaXNcbiAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSwgdGhpcy5pbW11dGFibGUgKSBcbiAgICAgIGlkeCA9IHRoaXMubWVtb3J5LnZhbHVlcy5pZHhcbiAgICAgIHRyeSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcC5zZXQoIHRoaXMuYnVmZmVyLCBpZHggKVxuICAgICAgfWNhdGNoKCBlICkge1xuICAgICAgICBjb25zb2xlLmxvZyggZSApXG4gICAgICAgIHRocm93IEVycm9yKCAnZXJyb3Igd2l0aCByZXF1ZXN0LiBhc2tpbmcgZm9yICcgKyB0aGlzLmJ1ZmZlci5sZW5ndGggKycuIGN1cnJlbnQgaW5kZXg6ICcgKyBnZW4ubWVtb3J5SW5kZXggKyAnIG9mICcgKyBnZW4ubWVtb3J5LmhlYXAubGVuZ3RoIClcbiAgICAgIH1cbiAgICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSBdID0gdGhpc1xuICAgICAgLy9yZXR1cm4gJ2dlbi5tZW1vcnknICsgdGhpcy5uYW1lICsgJy5idWZmZXInXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpZHhcbiAgICB9ZWxzZXtcbiAgICAgIGlkeCA9IGdlbi5tZW1vWyB0aGlzLm5hbWUgXVxuICAgIH1cbiAgICByZXR1cm4gaWR4XG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCB4LCB5PTEsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuLCBidWZmZXIsIHNob3VsZExvYWQgPSBmYWxzZVxuICBcbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkICkge1xuICAgIGlmKCBnZW4uZ2xvYmFsc1sgcHJvcGVydGllcy5nbG9iYWwgXSApIHtcbiAgICAgIHJldHVybiBnZW4uZ2xvYmFsc1sgcHJvcGVydGllcy5nbG9iYWwgXVxuICAgIH1cbiAgfVxuXG4gIGlmKCB0eXBlb2YgeCA9PT0gJ251bWJlcicgKSB7XG4gICAgaWYoIHkgIT09IDEgKSB7XG4gICAgICBidWZmZXIgPSBbXVxuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB5OyBpKysgKSB7XG4gICAgICAgIGJ1ZmZlclsgaSBdID0gbmV3IEZsb2F0MzJBcnJheSggeCApXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCB4IClcbiAgICB9XG4gIH1lbHNlIGlmKCBBcnJheS5pc0FycmF5KCB4ICkgKSB7IC8vISAoeCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSApICkge1xuICAgIGxldCBzaXplID0geC5sZW5ndGhcbiAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCBzaXplIClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKysgKSB7XG4gICAgICBidWZmZXJbIGkgXSA9IHhbIGkgXVxuICAgIH1cbiAgfWVsc2UgaWYoIHR5cGVvZiB4ID09PSAnc3RyaW5nJyApIHtcbiAgICBidWZmZXIgPSB7IGxlbmd0aDogeSA+IDEgPyB5IDogZ2VuLnNhbXBsZXJhdGUgKiA2MCB9IC8vIFhYWCB3aGF0Pz8/XG4gICAgc2hvdWxkTG9hZCA9IHRydWVcbiAgfWVsc2UgaWYoIHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSB7XG4gICAgYnVmZmVyID0geFxuICB9XG4gIFxuICB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgYnVmZmVyLFxuICAgIG5hbWU6IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpLFxuICAgIGRpbTogIGJ1ZmZlci5sZW5ndGgsIC8vIFhYWCBob3cgZG8gd2UgZHluYW1pY2FsbHkgYWxsb2NhdGUgdGhpcz9cbiAgICBjaGFubmVscyA6IDEsXG4gICAgb25sb2FkOiBudWxsLFxuICAgIHRoZW4oIGZuYyApIHtcbiAgICAgIHVnZW4ub25sb2FkID0gZm5jXG4gICAgICByZXR1cm4gdWdlblxuICAgIH0sXG4gICAgaW1tdXRhYmxlOiBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5pbW11dGFibGUgPT09IHRydWUgPyB0cnVlIDogZmFsc2UsXG4gICAgbG9hZCggZmlsZW5hbWUgKSB7XG4gICAgICBsZXQgcHJvbWlzZSA9IHV0aWxpdGllcy5sb2FkU2FtcGxlKCBmaWxlbmFtZSwgdWdlbiApXG4gICAgICBwcm9taXNlLnRoZW4oICggX2J1ZmZlciApPT4geyBcbiAgICAgICAgdWdlbi5tZW1vcnkudmFsdWVzLmxlbmd0aCA9IHVnZW4uZGltID0gX2J1ZmZlci5sZW5ndGggICAgIFxuICAgICAgICB1Z2VuLm9ubG9hZCgpIFxuICAgICAgfSlcbiAgICB9LFxuICAgIG1lbW9yeSA6IHtcbiAgICAgIHZhbHVlczogeyBsZW5ndGg6YnVmZmVyLmxlbmd0aCwgaWR4Om51bGwgfVxuICAgIH1cbiAgfSlcblxuICBpZiggc2hvdWxkTG9hZCApIHVnZW4ubG9hZCggeCApXG4gIFxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkge1xuICAgIGlmKCBwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF0gPSB1Z2VuXG4gICAgfVxuICAgIGlmKCBwcm9wZXJ0aWVzLm1ldGEgPT09IHRydWUgKSB7XG4gICAgICBmb3IoIGxldCBpID0gMCwgbGVuZ3RoID0gdWdlbi5idWZmZXIubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgaSwge1xuICAgICAgICAgIGdldCAoKSB7XG4gICAgICAgICAgICByZXR1cm4gcGVlayggdWdlbiwgaSwgeyBtb2RlOidzaW1wbGUnLCBpbnRlcnA6J25vbmUnIH0gKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgICAgcmV0dXJuIHBva2UoIHVnZW4sIHYsIGkgKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB4MSA9IGhpc3RvcnkoKSxcbiAgICAgIHkxID0gaGlzdG9yeSgpLFxuICAgICAgZmlsdGVyXG5cbiAgLy9IaXN0b3J5IHgxLCB5MTsgeSA9IGluMSAtIHgxICsgeTEqMC45OTk3OyB4MSA9IGluMTsgeTEgPSB5OyBvdXQxID0geTtcbiAgZmlsdGVyID0gbWVtbyggYWRkKCBzdWIoIGluMSwgeDEub3V0ICksIG11bCggeTEub3V0LCAuOTk5NyApICkgKVxuICB4MS5pbiggaW4xIClcbiAgeTEuaW4oIGZpbHRlciApXG5cbiAgcmV0dXJuIGZpbHRlclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgdDYwICAgICA9IHJlcXVpcmUoICcuL3Q2MC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZGVjYXlUaW1lID0gNDQxMDAsIHByb3BzICkgPT4ge1xuICBsZXQgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgaW5pdFZhbHVlOjEgfSwgcHJvcHMgKSxcbiAgICAgIHNzZCA9IGhpc3RvcnkgKCBwcm9wZXJ0aWVzLmluaXRWYWx1ZSApXG5cbiAgc3NkLmluKCBtdWwoIHNzZC5vdXQsIHQ2MCggZGVjYXlUaW1lICkgKSApXG5cbiAgc3NkLm91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc3NkLnZhbHVlID0gMVxuICB9XG5cbiAgcmV0dXJuIHNzZC5vdXQgXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuICA9IHJlcXVpcmUoICcuL2dlbi5qcycgICksXG4gICAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICAgIHBva2UgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICAgICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgICBzdWIgID0gcmVxdWlyZSggJy4vc3ViLmpzJyAgKSxcbiAgICAgIHdyYXAgPSByZXF1aXJlKCAnLi93cmFwLmpzJyApLFxuICAgICAgYWNjdW09IHJlcXVpcmUoICcuL2FjY3VtLmpzJyksXG4gICAgICBtZW1vID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RlbGF5JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlucHV0c1swXVxuICAgIFxuICAgIHJldHVybiBpbnB1dHNbMF1cbiAgfSxcbn1cblxuY29uc3QgZGVmYXVsdHMgPSB7IHNpemU6IDUxMiwgaW50ZXJwOidub25lJyB9XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIHRhcHMsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGNvbnN0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIGxldCB3cml0ZUlkeCwgcmVhZElkeCwgZGVsYXlkYXRhXG5cbiAgaWYoIEFycmF5LmlzQXJyYXkoIHRhcHMgKSA9PT0gZmFsc2UgKSB0YXBzID0gWyB0YXBzIF1cbiAgXG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBjb25zdCBtYXhUYXBTaXplID0gTWF0aC5tYXgoIC4uLnRhcHMgKVxuICBpZiggcHJvcHMuc2l6ZSA8IG1heFRhcFNpemUgKSBwcm9wcy5zaXplID0gbWF4VGFwU2l6ZVxuXG4gIGRlbGF5ZGF0YSA9IGRhdGEoIHByb3BzLnNpemUgKVxuICBcbiAgdWdlbi5pbnB1dHMgPSBbXVxuXG4gIHdyaXRlSWR4ID0gYWNjdW0oIDEsIDAsIHsgbWF4OnByb3BzLnNpemUsIG1pbjowIH0pXG4gIFxuICBmb3IoIGxldCBpID0gMDsgaSA8IHRhcHMubGVuZ3RoOyBpKysgKSB7XG4gICAgdWdlbi5pbnB1dHNbIGkgXSA9IHBlZWsoIGRlbGF5ZGF0YSwgd3JhcCggc3ViKCB3cml0ZUlkeCwgdGFwc1tpXSApLCAwLCBwcm9wcy5zaXplICkseyBtb2RlOidzYW1wbGVzJywgaW50ZXJwOnByb3BzLmludGVycCB9KVxuICB9XG4gIFxuICB1Z2VuLm91dHB1dHMgPSB1Z2VuLmlucHV0cyAvLyBYWFggdWdoLCBVZ2gsIFVHSCEgYnV0IGkgZ3Vlc3MgaXQgd29ya3MuXG5cbiAgcG9rZSggZGVsYXlkYXRhLCBpbjEsIHdyaXRlSWR4IClcblxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7Z2VuLmdldFVJRCgpfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSApID0+IHtcbiAgbGV0IG4xID0gaGlzdG9yeSgpXG4gICAgXG4gIG4xLmluKCBpbjEgKVxuXG4gIGxldCB1Z2VuID0gc3ViKCBpbjEsIG4xLm91dCApXG4gIHVnZW4ubmFtZSA9ICdkZWx0YScrZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RpdicsXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQ9YCAgdmFyICR7dGhpcy5uYW1lfSA9IGAsXG4gICAgICAgIGRpZmYgPSAwLCBcbiAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgIGxhc3ROdW1iZXJJc1VnZW4gPSBpc05hTiggbGFzdE51bWJlciApLCBcbiAgICAgICAgZGl2QXRFbmQgPSBmYWxzZVxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpID09PSAwICkgcmV0dXJuXG5cbiAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICBpc0ZpbmFsSWR4ICAgPSBpID09PSBpbnB1dHMubGVuZ3RoIC0gMVxuXG4gICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgLyB2XG4gICAgICAgIG91dCArPSBsYXN0TnVtYmVyXG4gICAgICB9ZWxzZXtcbiAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9IC8gJHt2fWBcbiAgICAgIH1cblxuICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLyAnIFxuICAgIH0pXG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgY29uc3QgZGl2ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgT2JqZWN0LmFzc2lnbiggZGl2LCB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuICB9KVxuXG4gIGRpdi5uYW1lID0gZGl2LmJhc2VuYW1lICsgZGl2LmlkXG4gIFxuICByZXR1cm4gZGl2XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4nICksXG4gICAgd2luZG93cyA9IHJlcXVpcmUoICcuL3dpbmRvd3MnICksXG4gICAgZGF0YSAgICA9IHJlcXVpcmUoICcuL2RhdGEnICksXG4gICAgcGVlayAgICA9IHJlcXVpcmUoICcuL3BlZWsnICksXG4gICAgcGhhc29yICA9IHJlcXVpcmUoICcuL3BoYXNvcicgKSxcbiAgICBkZWZhdWx0cyA9IHtcbiAgICAgIHR5cGU6J3RyaWFuZ3VsYXInLCBsZW5ndGg6MTAyNCwgYWxwaGE6LjE1LCBzaGlmdDowLCByZXZlcnNlOmZhbHNlIFxuICAgIH1cblxubW9kdWxlLmV4cG9ydHMgPSBwcm9wcyA9PiB7XG4gIFxuICBsZXQgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBkZWZhdWx0cywgcHJvcHMgKVxuICBsZXQgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggcHJvcGVydGllcy5sZW5ndGggKVxuXG4gIGxldCBuYW1lID0gcHJvcGVydGllcy50eXBlICsgJ18nICsgcHJvcGVydGllcy5sZW5ndGggKyAnXycgKyBwcm9wZXJ0aWVzLnNoaWZ0ICsgJ18nICsgcHJvcGVydGllcy5yZXZlcnNlICsgJ18nICsgcHJvcGVydGllcy5hbHBoYVxuICBpZiggdHlwZW9mIGdlbi5nbG9iYWxzLndpbmRvd3NbIG5hbWUgXSA9PT0gJ3VuZGVmaW5lZCcgKSB7IFxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSB3aW5kb3dzWyBwcm9wZXJ0aWVzLnR5cGUgXSggcHJvcGVydGllcy5sZW5ndGgsIGksIHByb3BlcnRpZXMuYWxwaGEsIHByb3BlcnRpZXMuc2hpZnQgKVxuICAgIH1cblxuICAgIGlmKCBwcm9wZXJ0aWVzLnJldmVyc2UgPT09IHRydWUgKSB7IFxuICAgICAgYnVmZmVyLnJldmVyc2UoKVxuICAgIH1cbiAgICBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gPSBkYXRhKCBidWZmZXIgKVxuICB9XG5cbiAgbGV0IHVnZW4gPSBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gXG4gIHVnZW4ubmFtZSA9ICdlbnYnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2VxJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSB0aGlzLmlucHV0c1swXSA9PT0gdGhpcy5pbnB1dHNbMV0gPyAxIDogYCAgdmFyICR7dGhpcy5uYW1lfSA9ICgke2lucHV0c1swXX0gPT09ICR7aW5wdXRzWzFdfSkgfCAwXFxuXFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1gLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2V4cCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGguZXhwJyA6IE1hdGguZXhwIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1leHAoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguZXhwKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgZXhwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGV4cC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBleHBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidmbG9vcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIC8vZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguZmxvb3IgfSlcblxuICAgICAgb3V0ID0gYCggJHtpbnB1dHNbMF19IHwgMCApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSB8IDBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBmbG9vciA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBmbG9vci5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBmbG9vclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidmb2xkJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0XG5cbiAgICBvdXQgPSB0aGlzLmNyZWF0ZUNhbGxiYWNrKCBpbnB1dHNbMF0sIHRoaXMubWluLCB0aGlzLm1heCApIFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBvdXQgXVxuICB9LFxuXG4gIGNyZWF0ZUNhbGxiYWNrKCB2LCBsbywgaGkgKSB7XG4gICAgbGV0IG91dCA9XG5gIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3Z9LFxuICAgICAgJHt0aGlzLm5hbWV9X3JhbmdlID0gJHtoaX0gLSAke2xvfSxcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9IDBcblxuICBpZigke3RoaXMubmFtZX1fdmFsdWUgPj0gJHtoaX0pe1xuICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2VcbiAgICBpZigke3RoaXMubmFtZX1fdmFsdWUgPj0gJHtoaX0pe1xuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gKCgke3RoaXMubmFtZX1fdmFsdWUgLSAke2xvfSkgLyAke3RoaXMubmFtZX1fcmFuZ2UpIHwgMFxuICAgICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZSAqICR7dGhpcy5uYW1lfV9udW1XcmFwc1xuICAgIH1cbiAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMrK1xuICB9IGVsc2UgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlIDwgJHtsb30pe1xuICAgICR7dGhpcy5uYW1lfV92YWx1ZSArPSAke3RoaXMubmFtZX1fcmFuZ2VcbiAgICBpZigke3RoaXMubmFtZX1fdmFsdWUgPCAke2xvfSl7XG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAoKCR7dGhpcy5uYW1lfV92YWx1ZSAtICR7bG99KSAvICR7dGhpcy5uYW1lfV9yYW5nZS0gMSkgfCAwXG4gICAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlICogJHt0aGlzLm5hbWV9X251bVdyYXBzXG4gICAgfVxuICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcy0tXG4gIH1cbiAgaWYoJHt0aGlzLm5hbWV9X251bVdyYXBzICYgMSkgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHtoaX0gKyAke2xvfSAtICR7dGhpcy5uYW1lfV92YWx1ZVxuYFxuICAgIHJldHVybiAnICcgKyBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZ2F0ZScsXG4gIGNvbnRyb2xTdHJpbmc6bnVsbCwgLy8gaW5zZXJ0IGludG8gb3V0cHV0IGNvZGVnZW4gZm9yIGRldGVybWluaW5nIGluZGV4aW5nXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcbiAgICBcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGxldCBsYXN0SW5wdXRNZW1vcnlJZHggPSAnbWVtb3J5WyAnICsgdGhpcy5tZW1vcnkubGFzdElucHV0LmlkeCArICcgXScsXG4gICAgICAgIG91dHB1dE1lbW9yeVN0YXJ0SWR4ID0gdGhpcy5tZW1vcnkubGFzdElucHV0LmlkeCArIDEsXG4gICAgICAgIGlucHV0U2lnbmFsID0gaW5wdXRzWzBdLFxuICAgICAgICBjb250cm9sU2lnbmFsID0gaW5wdXRzWzFdXG4gICAgXG4gICAgLyogXG4gICAgICogd2UgY2hlY2sgdG8gc2VlIGlmIHRoZSBjdXJyZW50IGNvbnRyb2wgaW5wdXRzIGVxdWFscyBvdXIgbGFzdCBpbnB1dFxuICAgICAqIGlmIHNvLCB3ZSBzdG9yZSB0aGUgc2lnbmFsIGlucHV0IGluIHRoZSBtZW1vcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBjdXJyZW50bHlcbiAgICAgKiBzZWxlY3RlZCBpbmRleC4gSWYgbm90LCB3ZSBwdXQgMCBpbiB0aGUgbWVtb3J5IGFzc29jaWF0ZWQgd2l0aCB0aGUgbGFzdCBzZWxlY3RlZCBpbmRleCxcbiAgICAgKiBjaGFuZ2UgdGhlIHNlbGVjdGVkIGluZGV4LCBhbmQgdGhlbiBzdG9yZSB0aGUgc2lnbmFsIGluIHB1dCBpbiB0aGUgbWVtZXJ5IGFzc29pY2F0ZWRcbiAgICAgKiB3aXRoIHRoZSBuZXdseSBzZWxlY3RlZCBpbmRleFxuICAgICAqL1xuICAgIFxuICAgIG91dCA9XG5cbmAgaWYoICR7Y29udHJvbFNpZ25hbH0gIT09ICR7bGFzdElucHV0TWVtb3J5SWR4fSApIHtcbiAgICBtZW1vcnlbICR7bGFzdElucHV0TWVtb3J5SWR4fSArICR7b3V0cHV0TWVtb3J5U3RhcnRJZHh9ICBdID0gMCBcbiAgICAke2xhc3RJbnB1dE1lbW9yeUlkeH0gPSAke2NvbnRyb2xTaWduYWx9XG4gIH1cbiAgbWVtb3J5WyAke291dHB1dE1lbW9yeVN0YXJ0SWR4fSArICR7Y29udHJvbFNpZ25hbH0gXSA9ICR7aW5wdXRTaWduYWx9XG5cbmBcbiAgICB0aGlzLmNvbnRyb2xTdHJpbmcgPSBpbnB1dHNbMV1cbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICB0aGlzLm91dHB1dHMuZm9yRWFjaCggdiA9PiB2LmdlbigpIClcblxuICAgIHJldHVybiBbIG51bGwsICcgJyArIG91dCBdXG4gIH0sXG5cbiAgY2hpbGRnZW4oKSB7XG4gICAgaWYoIHRoaXMucGFyZW50LmluaXRpYWxpemVkID09PSBmYWxzZSApIHtcbiAgICAgIGdlbi5nZXRJbnB1dHMoIHRoaXMgKSAvLyBwYXJlbnQgZ2F0ZSBpcyBvbmx5IGlucHV0IG9mIGEgZ2F0ZSBvdXRwdXQsIHNob3VsZCBvbmx5IGJlIGdlbidkIG9uY2UuXG4gICAgfVxuXG4gICAgaWYoIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVsgJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9IF1gXG4gICAgfVxuICAgIFxuICAgIHJldHVybiAgYG1lbW9yeVsgJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9IF1gXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGNvbnRyb2wsIGluMSwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGNvdW50OiAyIH1cblxuICBpZiggdHlwZW9mIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgb3V0cHV0czogW10sXG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBjb250cm9sIF0sXG4gICAgbWVtb3J5OiB7XG4gICAgICBsYXN0SW5wdXQ6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICB9LFxuICAgIGluaXRpYWxpemVkOmZhbHNlXG4gIH0sXG4gIGRlZmF1bHRzIClcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHtnZW4uZ2V0VUlEKCl9YFxuXG4gIGZvciggbGV0IGkgPSAwOyBpIDwgdWdlbi5jb3VudDsgaSsrICkge1xuICAgIHVnZW4ub3V0cHV0cy5wdXNoKHtcbiAgICAgIGluZGV4OmksXG4gICAgICBnZW46IHByb3RvLmNoaWxkZ2VuLFxuICAgICAgcGFyZW50OnVnZW4sXG4gICAgICBpbnB1dHM6IFsgdWdlbiBdLFxuICAgICAgbWVtb3J5OiB7XG4gICAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gICAgICB9LFxuICAgICAgaW5pdGlhbGl6ZWQ6ZmFsc2UsXG4gICAgICBuYW1lOiBgJHt1Z2VuLm5hbWV9X291dCR7Z2VuLmdldFVJRCgpfWBcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG4vKiBnZW4uanNcbiAqXG4gKiBsb3ctbGV2ZWwgY29kZSBnZW5lcmF0aW9uIGZvciB1bml0IGdlbmVyYXRvcnNcbiAqXG4gKi9cblxubGV0IE1lbW9yeUhlbHBlciA9IHJlcXVpcmUoICdtZW1vcnktaGVscGVyJyApXG5cbmxldCBnZW4gPSB7XG5cbiAgYWNjdW06MCxcbiAgZ2V0VUlEKCkgeyByZXR1cm4gdGhpcy5hY2N1bSsrIH0sXG4gIGRlYnVnOmZhbHNlLFxuICBzYW1wbGVyYXRlOiA0NDEwMCwgLy8gY2hhbmdlIG9uIGF1ZGlvY29udGV4dCBjcmVhdGlvblxuICBzaG91bGRMb2NhbGl6ZTogZmFsc2UsXG4gIGdsb2JhbHM6e1xuICAgIHdpbmRvd3M6IHt9LFxuICB9LFxuICBtb2RlOid3b3JrbGV0JyxcbiAgXG4gIC8qIGNsb3N1cmVzXG4gICAqXG4gICAqIEZ1bmN0aW9ucyB0aGF0IGFyZSBpbmNsdWRlZCBhcyBhcmd1bWVudHMgdG8gbWFzdGVyIGNhbGxiYWNrLiBFeGFtcGxlczogTWF0aC5hYnMsIE1hdGgucmFuZG9tIGV0Yy5cbiAgICogWFhYIFNob3VsZCBwcm9iYWJseSBiZSByZW5hbWVkIGNhbGxiYWNrUHJvcGVydGllcyBvciBzb21ldGhpbmcgc2ltaWxhci4uLiBjbG9zdXJlcyBhcmUgbm8gbG9uZ2VyIHVzZWQuXG4gICAqL1xuXG4gIGNsb3N1cmVzOiBuZXcgU2V0KCksXG4gIHBhcmFtczogICBuZXcgU2V0KCksXG4gIGlucHV0czogICBuZXcgU2V0KCksXG5cbiAgcGFyYW1ldGVyczogbmV3IFNldCgpLFxuICBlbmRCbG9jazogbmV3IFNldCgpLFxuICBoaXN0b3JpZXM6IG5ldyBNYXAoKSxcblxuICBtZW1vOiB7fSxcblxuICAvL2RhdGE6IHt9LFxuICBcbiAgLyogZXhwb3J0XG4gICAqXG4gICAqIHBsYWNlIGdlbiBmdW5jdGlvbnMgaW50byBhbm90aGVyIG9iamVjdCBmb3IgZWFzaWVyIHJlZmVyZW5jZVxuICAgKi9cblxuICBleHBvcnQoIG9iaiApIHt9LFxuXG4gIGFkZFRvRW5kQmxvY2soIHYgKSB7XG4gICAgdGhpcy5lbmRCbG9jay5hZGQoICcgICcgKyB2IClcbiAgfSxcbiAgXG4gIHJlcXVlc3RNZW1vcnkoIG1lbW9yeVNwZWMsIGltbXV0YWJsZT1mYWxzZSApIHtcbiAgICBmb3IoIGxldCBrZXkgaW4gbWVtb3J5U3BlYyApIHtcbiAgICAgIGxldCByZXF1ZXN0ID0gbWVtb3J5U3BlY1sga2V5IF1cblxuICAgICAgLy9jb25zb2xlLmxvZyggJ3JlcXVlc3RpbmcgJyArIGtleSArICc6JyAsIEpTT04uc3RyaW5naWZ5KCByZXF1ZXN0ICkgKVxuXG4gICAgICBpZiggcmVxdWVzdC5sZW5ndGggPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgY29uc29sZS5sb2coICd1bmRlZmluZWQgbGVuZ3RoIGZvcjonLCBrZXkgKVxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaWR4ID0gZ2VuLm1lbW9yeS5hbGxvYyggcmVxdWVzdC5sZW5ndGgsIGltbXV0YWJsZSApXG4gICAgfVxuICB9LFxuXG4gIGNyZWF0ZU1lbW9yeSggYW1vdW50LCB0eXBlICkge1xuICAgIGNvbnN0IG1lbSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIG1lbSwgdHlwZSApXG4gIH0sXG5cbiAgLyogY3JlYXRlQ2FsbGJhY2tcbiAgICpcbiAgICogcGFyYW0gdWdlbiAtIEhlYWQgb2YgZ3JhcGggdG8gYmUgY29kZWdlbidkXG4gICAqXG4gICAqIEdlbmVyYXRlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBhIHBhcnRpY3VsYXIgdWdlbiBncmFwaC5cbiAgICogVGhlIGdlbi5jbG9zdXJlcyBwcm9wZXJ0eSBzdG9yZXMgZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZVxuICAgKiBwYXNzZWQgYXMgYXJndW1lbnRzIHRvIHRoZSBmaW5hbCBmdW5jdGlvbjsgdGhlc2UgYXJlIHByZWZpeGVkXG4gICAqIGJlZm9yZSBhbnkgZGVmaW5lZCBwYXJhbXMgdGhlIGdyYXBoIGV4cG9zZXMuIEZvciBleGFtcGxlLCBnaXZlbjpcbiAgICpcbiAgICogZ2VuLmNyZWF0ZUNhbGxiYWNrKCBhYnMoIHBhcmFtKCkgKSApXG4gICAqXG4gICAqIC4uLiB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIHdpbGwgaGF2ZSBhIHNpZ25hdHVyZSBvZiAoIGFicywgcDAgKS5cbiAgICovXG4gIFxuICBjcmVhdGVDYWxsYmFjayggdWdlbiwgbWVtLCBkZWJ1ZyA9IGZhbHNlLCBzaG91bGRJbmxpbmVNZW1vcnk9ZmFsc2UsIG1lbVR5cGUgPSBGbG9hdDY0QXJyYXkgKSB7XG4gICAgbGV0IGlzU3RlcmVvID0gQXJyYXkuaXNBcnJheSggdWdlbiApICYmIHVnZW4ubGVuZ3RoID4gMSxcbiAgICAgICAgY2FsbGJhY2ssIFxuICAgICAgICBjaGFubmVsMSwgY2hhbm5lbDJcblxuICAgIGlmKCB0eXBlb2YgbWVtID09PSAnbnVtYmVyJyB8fCBtZW0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIG1lbSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIG1lbSwgbWVtVHlwZSApXG4gICAgfVxuICAgIFxuICAgIC8vY29uc29sZS5sb2coICdjYiBtZW1vcnk6JywgbWVtIClcbiAgICB0aGlzLm1lbW9yeSA9IG1lbVxuICAgIHRoaXMub3V0cHV0SWR4ID0gdGhpcy5tZW1vcnkuYWxsb2MoIDIsIHRydWUgKVxuICAgIHRoaXMubWVtbyA9IHt9IFxuICAgIHRoaXMuZW5kQmxvY2suY2xlYXIoKVxuICAgIHRoaXMuY2xvc3VyZXMuY2xlYXIoKVxuICAgIHRoaXMuaW5wdXRzLmNsZWFyKClcbiAgICB0aGlzLnBhcmFtcy5jbGVhcigpXG4gICAgLy90aGlzLmdsb2JhbHMgPSB7IHdpbmRvd3M6e30gfVxuICAgIFxuICAgIHRoaXMucGFyYW1ldGVycy5jbGVhcigpXG4gICAgXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSBcIiAgJ3VzZSBzdHJpY3QnXFxuXCJcbiAgICBpZiggc2hvdWxkSW5saW5lTWVtb3J5PT09ZmFsc2UgKSB7XG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keSArPSB0aGlzLm1vZGUgPT09ICd3b3JrbGV0JyA/IFxuICAgICAgICBcIiAgdmFyIG1lbW9yeSA9IHRoaXMubWVtb3J5XFxuXFxuXCIgOlxuICAgICAgICBcIiAgdmFyIG1lbW9yeSA9IGdlbi5tZW1vcnlcXG5cXG5cIlxuICAgIH1cblxuICAgIC8vIGNhbGwgLmdlbigpIG9uIHRoZSBoZWFkIG9mIHRoZSBncmFwaCB3ZSBhcmUgZ2VuZXJhdGluZyB0aGUgY2FsbGJhY2sgZm9yXG4gICAgLy9jb25zb2xlLmxvZyggJ0hFQUQnLCB1Z2VuIClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IDEgKyBpc1N0ZXJlbzsgaSsrICkge1xuICAgICAgaWYoIHR5cGVvZiB1Z2VuW2ldID09PSAnbnVtYmVyJyApIGNvbnRpbnVlXG5cbiAgICAgIC8vbGV0IGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHVnZW5baV0uZ2VuKCkgOiB1Z2VuLmdlbigpLFxuICAgICAgbGV0IGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHRoaXMuZ2V0SW5wdXQoIHVnZW5baV0gKSA6IHRoaXMuZ2V0SW5wdXQoIHVnZW4gKSwgXG4gICAgICAgICAgYm9keSA9ICcnXG5cbiAgICAgIC8vIGlmIC5nZW4oKSByZXR1cm5zIGFycmF5LCBhZGQgdWdlbiBjYWxsYmFjayAoZ3JhcGhPdXRwdXRbMV0pIHRvIG91ciBvdXRwdXQgZnVuY3Rpb25zIGJvZHlcbiAgICAgIC8vIGFuZCB0aGVuIHJldHVybiBuYW1lIG9mIHVnZW4uIElmIC5nZW4oKSBvbmx5IGdlbmVyYXRlcyBhIG51bWJlciAoZm9yIHJlYWxseSBzaW1wbGUgZ3JhcGhzKVxuICAgICAgLy8ganVzdCByZXR1cm4gdGhhdCBudW1iZXIgKGdyYXBoT3V0cHV0WzBdKS5cbiAgICAgIGJvZHkgKz0gQXJyYXkuaXNBcnJheSggY2hhbm5lbCApID8gY2hhbm5lbFsxXSArICdcXG4nICsgY2hhbm5lbFswXSA6IGNoYW5uZWxcblxuICAgICAgLy8gc3BsaXQgYm9keSB0byBpbmplY3QgcmV0dXJuIGtleXdvcmQgb24gbGFzdCBsaW5lXG4gICAgICBib2R5ID0gYm9keS5zcGxpdCgnXFxuJylcbiAgICAgXG4gICAgICAvL2lmKCBkZWJ1ZyApIGNvbnNvbGUubG9nKCAnZnVuY3Rpb25Cb2R5IGxlbmd0aCcsIGJvZHkgKVxuICAgICAgXG4gICAgICAvLyBuZXh0IGxpbmUgaXMgdG8gYWNjb21tb2RhdGUgbWVtbyBhcyBncmFwaCBoZWFkXG4gICAgICBpZiggYm9keVsgYm9keS5sZW5ndGggLTEgXS50cmltKCkuaW5kZXhPZignbGV0JykgPiAtMSApIHsgYm9keS5wdXNoKCAnXFxuJyApIH0gXG5cbiAgICAgIC8vIGdldCBpbmRleCBvZiBsYXN0IGxpbmVcbiAgICAgIGxldCBsYXN0aWR4ID0gYm9keS5sZW5ndGggLSAxXG5cbiAgICAgIC8vIGluc2VydCByZXR1cm4ga2V5d29yZFxuICAgICAgYm9keVsgbGFzdGlkeCBdID0gJyAgbWVtb3J5WycgKyAodGhpcy5vdXRwdXRJZHggKyBpKSArICddICA9ICcgKyBib2R5WyBsYXN0aWR4IF0gKyAnXFxuJ1xuXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keSArPSBib2R5LmpvaW4oJ1xcbicpXG4gICAgfVxuICAgIFxuICAgIHRoaXMuaGlzdG9yaWVzLmZvckVhY2goIHZhbHVlID0+IHtcbiAgICAgIGlmKCB2YWx1ZSAhPT0gbnVsbCApXG4gICAgICAgIHZhbHVlLmdlbigpICAgICAgXG4gICAgfSlcblxuICAgIGNvbnN0IHJldHVyblN0YXRlbWVudCA9IGlzU3RlcmVvID8gYCAgcmV0dXJuIFsgbWVtb3J5WyR7dGhpcy5vdXRwdXRJZHh9XSwgbWVtb3J5WyR7dGhpcy5vdXRwdXRJZHggKyAxfV0gXWAgOiBgICByZXR1cm4gbWVtb3J5WyR7dGhpcy5vdXRwdXRJZHh9XWBcbiAgICBcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LnNwbGl0KCdcXG4nKVxuXG4gICAgaWYoIHRoaXMuZW5kQmxvY2suc2l6ZSApIHsgXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmNvbmNhdCggQXJyYXkuZnJvbSggdGhpcy5lbmRCbG9jayApIClcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2goIHJldHVyblN0YXRlbWVudCApXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKCByZXR1cm5TdGF0ZW1lbnQgKVxuICAgIH1cbiAgICAvLyByZWFzc2VtYmxlIGZ1bmN0aW9uIGJvZHlcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmpvaW4oJ1xcbicpXG5cbiAgICAvLyB3ZSBjYW4gb25seSBkeW5hbWljYWxseSBjcmVhdGUgYSBuYW1lZCBmdW5jdGlvbiBieSBkeW5hbWljYWxseSBjcmVhdGluZyBhbm90aGVyIGZ1bmN0aW9uXG4gICAgLy8gdG8gY29uc3RydWN0IHRoZSBuYW1lZCBmdW5jdGlvbiEgc2hlZXNoLi4uXG4gICAgLy9cbiAgICBpZiggc2hvdWxkSW5saW5lTWVtb3J5ID09PSB0cnVlICkge1xuICAgICAgdGhpcy5wYXJhbWV0ZXJzLmFkZCggJ21lbW9yeScgKVxuICAgIH1cblxuICAgIGxldCBwYXJhbVN0cmluZyA9ICcnXG4gICAgaWYoIHRoaXMubW9kZSA9PT0gJ3dvcmtsZXQnICkge1xuICAgICAgZm9yKCBsZXQgbmFtZSBvZiB0aGlzLnBhcmFtZXRlcnMudmFsdWVzKCkgKSB7XG4gICAgICAgIHBhcmFtU3RyaW5nICs9IG5hbWUgKyAnLCdcbiAgICAgIH1cbiAgICAgIHBhcmFtU3RyaW5nID0gcGFyYW1TdHJpbmcuc2xpY2UoMCwtMSlcbiAgICB9XG5cbiAgICBjb25zdCBzZXBhcmF0b3IgPSB0aGlzLnBhcmFtZXRlcnMuc2l6ZSAhPT0gMCAmJiB0aGlzLmlucHV0cy5zaXplID4gMCA/ICcsICcgOiAnJ1xuXG4gICAgbGV0IGlucHV0U3RyaW5nID0gJydcbiAgICBpZiggdGhpcy5tb2RlID09PSAnd29ya2xldCcgKSB7XG4gICAgICBmb3IoIGxldCB1Z2VuIG9mIHRoaXMuaW5wdXRzLnZhbHVlcygpICkge1xuICAgICAgICBpbnB1dFN0cmluZys9IHVnZW4ubmFtZSArICcsJ1xuICAgICAgfVxuICAgICAgaW5wdXRTdHJpbmcgPSBpbnB1dFN0cmluZy5zbGljZSgwLC0xKVxuICAgIH1cblxuICAgIGxldCBidWlsZFN0cmluZyA9IHRoaXMubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgICA/IGByZXR1cm4gZnVuY3Rpb24oICR7aW5wdXRTdHJpbmd9ICR7c2VwYXJhdG9yfSAke3BhcmFtU3RyaW5nfSApeyBcXG4keyB0aGlzLmZ1bmN0aW9uQm9keSB9XFxufWBcbiAgICAgIDogYHJldHVybiBmdW5jdGlvbiBnZW4oICR7IFsuLi50aGlzLnBhcmFtZXRlcnNdLmpvaW4oJywnKSB9ICl7IFxcbiR7IHRoaXMuZnVuY3Rpb25Cb2R5IH1cXG59YFxuICAgIFxuICAgIGlmKCB0aGlzLmRlYnVnIHx8IGRlYnVnICkgY29uc29sZS5sb2coIGJ1aWxkU3RyaW5nICkgXG5cbiAgICBjYWxsYmFjayA9IG5ldyBGdW5jdGlvbiggYnVpbGRTdHJpbmcgKSgpXG5cbiAgICAvLyBhc3NpZ24gcHJvcGVydGllcyB0byBuYW1lZCBmdW5jdGlvblxuICAgIGZvciggbGV0IGRpY3Qgb2YgdGhpcy5jbG9zdXJlcy52YWx1ZXMoKSApIHtcbiAgICAgIGxldCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICB2YWx1ZSA9IGRpY3RbIG5hbWUgXVxuXG4gICAgICBjYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG5cbiAgICBmb3IoIGxldCBkaWN0IG9mIHRoaXMucGFyYW1zLnZhbHVlcygpICkge1xuICAgICAgbGV0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdLFxuICAgICAgICAgIHVnZW4gPSBkaWN0WyBuYW1lIF1cbiAgICAgIFxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBjYWxsYmFjaywgbmFtZSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHVnZW4udmFsdWUgfSxcbiAgICAgICAgc2V0KHYpeyB1Z2VuLnZhbHVlID0gdiB9XG4gICAgICB9KVxuICAgICAgLy9jYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG5cbiAgICBjYWxsYmFjay5tZW1iZXJzID0gdGhpcy5jbG9zdXJlc1xuICAgIGNhbGxiYWNrLmRhdGEgPSB0aGlzLmRhdGFcbiAgICBjYWxsYmFjay5wYXJhbXMgPSB0aGlzLnBhcmFtc1xuICAgIGNhbGxiYWNrLmlucHV0cyA9IHRoaXMuaW5wdXRzXG4gICAgY2FsbGJhY2sucGFyYW1ldGVycyA9IHRoaXMucGFyYW1ldGVycy8vLnNsaWNlKCAwIClcbiAgICBjYWxsYmFjay5pc1N0ZXJlbyA9IGlzU3RlcmVvXG5cbiAgICAvL2lmKCBNZW1vcnlIZWxwZXIuaXNQcm90b3R5cGVPZiggdGhpcy5tZW1vcnkgKSApIFxuICAgIGNhbGxiYWNrLm1lbW9yeSA9IHRoaXMubWVtb3J5LmhlYXBcblxuICAgIHRoaXMuaGlzdG9yaWVzLmNsZWFyKClcblxuICAgIHJldHVybiBjYWxsYmFja1xuICB9LFxuICBcbiAgLyogZ2V0SW5wdXRzXG4gICAqXG4gICAqIENhbGxlZCBieSBlYWNoIGluZGl2aWR1YWwgdWdlbiB3aGVuIHRoZWlyIC5nZW4oKSBtZXRob2QgaXMgY2FsbGVkIHRvIHJlc29sdmUgdGhlaXIgdmFyaW91cyBpbnB1dHMuXG4gICAqIElmIGFuIGlucHV0IGlzIGEgbnVtYmVyLCByZXR1cm4gdGhlIG51bWJlci4gSWZcbiAgICogaXQgaXMgYW4gdWdlbiwgY2FsbCAuZ2VuKCkgb24gdGhlIHVnZW4sIG1lbW9pemUgdGhlIHJlc3VsdCBhbmQgcmV0dXJuIHRoZSByZXN1bHQuIElmIHRoZVxuICAgKiB1Z2VuIGhhcyBwcmV2aW91c2x5IGJlZW4gbWVtb2l6ZWQgcmV0dXJuIHRoZSBtZW1vaXplZCB2YWx1ZS5cbiAgICpcbiAgICovXG4gIGdldElucHV0cyggdWdlbiApIHtcbiAgICByZXR1cm4gdWdlbi5pbnB1dHMubWFwKCBnZW4uZ2V0SW5wdXQgKSBcbiAgfSxcblxuICBnZXRJbnB1dCggaW5wdXQgKSB7XG4gICAgbGV0IGlzT2JqZWN0ID0gdHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyxcbiAgICAgICAgcHJvY2Vzc2VkSW5wdXRcblxuICAgIGlmKCBpc09iamVjdCApIHsgLy8gaWYgaW5wdXQgaXMgYSB1Z2VuLi4uIFxuICAgICAgLy9jb25zb2xlLmxvZyggaW5wdXQubmFtZSwgZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXSApXG4gICAgICBpZiggZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXSApIHsgLy8gaWYgaXQgaGFzIGJlZW4gbWVtb2l6ZWQuLi5cbiAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBnZW4ubWVtb1sgaW5wdXQubmFtZSBdXG4gICAgICB9ZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaW5wdXQgKSApIHtcbiAgICAgICAgZ2VuLmdldElucHV0KCBpbnB1dFswXSApXG4gICAgICAgIGdlbi5nZXRJbnB1dCggaW5wdXRbMV0gKVxuICAgICAgfWVsc2V7IC8vIGlmIG5vdCBtZW1vaXplZCBnZW5lcmF0ZSBjb2RlICBcbiAgICAgICAgaWYoIHR5cGVvZiBpbnB1dC5nZW4gIT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coICdubyBnZW4gZm91bmQ6JywgaW5wdXQsIGlucHV0LmdlbiApXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvZGUgPSBpbnB1dC5nZW4oKVxuICAgICAgICAvL2lmKCBjb2RlLmluZGV4T2YoICdPYmplY3QnICkgPiAtMSApIGNvbnNvbGUubG9nKCAnYmFkIGlucHV0OicsIGlucHV0LCBjb2RlIClcbiAgICAgICAgXG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCBjb2RlICkgKSB7XG4gICAgICAgICAgaWYoICFnZW4uc2hvdWxkTG9jYWxpemUgKSB7XG4gICAgICAgICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGdlbi5jb2RlTmFtZSA9IGNvZGVbMF1cbiAgICAgICAgICAgIGdlbi5sb2NhbGl6ZWRDb2RlLnB1c2goIGNvZGVbMV0gKVxuICAgICAgICAgIH1cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnYWZ0ZXIgR0VOJyAsIHRoaXMuZnVuY3Rpb25Cb2R5IClcbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVbMF1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ZWxzZXsgLy8gaXQgaW5wdXQgaXMgYSBudW1iZXJcbiAgICAgIHByb2Nlc3NlZElucHV0ID0gaW5wdXRcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvY2Vzc2VkSW5wdXRcbiAgfSxcblxuICBzdGFydExvY2FsaXplKCkge1xuICAgIHRoaXMubG9jYWxpemVkQ29kZSA9IFtdXG4gICAgdGhpcy5zaG91bGRMb2NhbGl6ZSA9IHRydWVcbiAgfSxcbiAgZW5kTG9jYWxpemUoKSB7XG4gICAgdGhpcy5zaG91bGRMb2NhbGl6ZSA9IGZhbHNlXG5cbiAgICByZXR1cm4gWyB0aGlzLmNvZGVOYW1lLCB0aGlzLmxvY2FsaXplZENvZGUuc2xpY2UoMCkgXVxuICB9LFxuXG4gIGZyZWUoIGdyYXBoICkge1xuICAgIGlmKCBBcnJheS5pc0FycmF5KCBncmFwaCApICkgeyAvLyBzdGVyZW8gdWdlblxuICAgICAgZm9yKCBsZXQgY2hhbm5lbCBvZiBncmFwaCApIHtcbiAgICAgICAgdGhpcy5mcmVlKCBjaGFubmVsIClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIHR5cGVvZiBncmFwaCA9PT0gJ29iamVjdCcgKSB7XG4gICAgICAgIGlmKCBncmFwaC5tZW1vcnkgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICBmb3IoIGxldCBtZW1vcnlLZXkgaW4gZ3JhcGgubWVtb3J5ICkge1xuICAgICAgICAgICAgdGhpcy5tZW1vcnkuZnJlZSggZ3JhcGgubWVtb3J5WyBtZW1vcnlLZXkgXS5pZHggKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggZ3JhcGguaW5wdXRzICkgKSB7XG4gICAgICAgICAgZm9yKCBsZXQgdWdlbiBvZiBncmFwaC5pbnB1dHMgKSB7XG4gICAgICAgICAgICB0aGlzLmZyZWUoIHVnZW4gKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdlblxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidndCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCggJHtpbnB1dHNbMF19ID4gJHtpbnB1dHNbMV19KSB8IDAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA+IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0LmlucHV0cyA9IFsgeCx5IF1cbiAgZ3QubmFtZSA9IGd0LmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGd0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidndGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCggJHtpbnB1dHNbMF19ID49ICR7aW5wdXRzWzFdfSB8IDAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA+PSBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG5cXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBndCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBndC5pbnB1dHMgPSBbIHgseSBdXG4gIGd0Lm5hbWUgPSAnZ3RlJyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBndFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2d0cCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ID0gYCgke2lucHV0c1sgMCBdfSAqICggKCAke2lucHV0c1swXX0gPiAke2lucHV0c1sxXX0gKSB8IDAgKSApYCBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKCAoIGlucHV0c1swXSA+IGlucHV0c1sxXSApIHwgMCApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0cCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBndHAuaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBndHBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMT0wICkgPT4ge1xuICBsZXQgdWdlbiA9IHtcbiAgICBpbnB1dHM6IFsgaW4xIF0sXG4gICAgbWVtb3J5OiB7IHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSB9LFxuICAgIHJlY29yZGVyOiBudWxsLFxuXG4gICAgaW4oIHYgKSB7XG4gICAgICBpZiggZ2VuLmhpc3Rvcmllcy5oYXMoIHYgKSApe1xuICAgICAgICBsZXQgbWVtb0hpc3RvcnkgPSBnZW4uaGlzdG9yaWVzLmdldCggdiApXG4gICAgICAgIHVnZW4ubmFtZSA9IG1lbW9IaXN0b3J5Lm5hbWVcbiAgICAgICAgcmV0dXJuIG1lbW9IaXN0b3J5XG4gICAgICB9XG5cbiAgICAgIGxldCBvYmogPSB7XG4gICAgICAgIGdlbigpIHtcbiAgICAgICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdWdlbiApXG5cbiAgICAgICAgICBpZiggdWdlbi5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkge1xuICAgICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdWdlbi5tZW1vcnkudmFsdWUuaWR4IF0gPSBpbjFcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4XG4gICAgICAgICAgXG4gICAgICAgICAgZ2VuLmFkZFRvRW5kQmxvY2soICdtZW1vcnlbICcgKyBpZHggKyAnIF0gPSAnICsgaW5wdXRzWyAwIF0gKVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIHJldHVybiB1Z2VuIHRoYXQgaXMgYmVpbmcgcmVjb3JkZWQgaW5zdGVhZCBvZiBzc2QuXG4gICAgICAgICAgLy8gdGhpcyBlZmZlY3RpdmVseSBtYWtlcyBhIGNhbGwgdG8gc3NkLnJlY29yZCgpIHRyYW5zcGFyZW50IHRvIHRoZSBncmFwaC5cbiAgICAgICAgICAvLyByZWNvcmRpbmcgaXMgdHJpZ2dlcmVkIGJ5IHByaW9yIGNhbGwgdG8gZ2VuLmFkZFRvRW5kQmxvY2suXG4gICAgICAgICAgZ2VuLmhpc3Rvcmllcy5zZXQoIHYsIG9iaiApXG5cbiAgICAgICAgICByZXR1cm4gaW5wdXRzWyAwIF1cbiAgICAgICAgfSxcbiAgICAgICAgbmFtZTogdWdlbi5uYW1lICsgJ19pbicrZ2VuLmdldFVJRCgpLFxuICAgICAgICBtZW1vcnk6IHVnZW4ubWVtb3J5XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5wdXRzWyAwIF0gPSB2XG4gICAgICBcbiAgICAgIHVnZW4ucmVjb3JkZXIgPSBvYmpcblxuICAgICAgcmV0dXJuIG9ialxuICAgIH0sXG4gICAgXG4gICAgb3V0OiB7XG4gICAgICAgICAgICBcbiAgICAgIGdlbigpIHtcbiAgICAgICAgaWYoIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCApIHtcbiAgICAgICAgICBpZiggZ2VuLmhpc3Rvcmllcy5nZXQoIHVnZW4uaW5wdXRzWzBdICkgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGdlbi5oaXN0b3JpZXMuc2V0KCB1Z2VuLmlucHV0c1swXSwgdWdlbi5yZWNvcmRlciApXG4gICAgICAgICAgfVxuICAgICAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB1Z2VuLm1lbW9yeSApXG4gICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggXSA9IHBhcnNlRmxvYXQoIGluMSApXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGlkeCA9IHVnZW4ubWVtb3J5LnZhbHVlLmlkeFxuICAgICAgICAgXG4gICAgICAgIHJldHVybiAnbWVtb3J5WyAnICsgaWR4ICsgJyBdICdcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIHVpZDogZ2VuLmdldFVJRCgpLFxuICB9XG4gIFxuICB1Z2VuLm91dC5tZW1vcnkgPSB1Z2VuLm1lbW9yeSBcblxuICB1Z2VuLm5hbWUgPSAnaGlzdG9yeScgKyB1Z2VuLnVpZFxuICB1Z2VuLm91dC5uYW1lID0gdWdlbi5uYW1lICsgJ19vdXQnXG4gIHVnZW4uaW4uX25hbWUgID0gdWdlbi5uYW1lID0gJ19pbidcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidpZmVsc2UnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29uZGl0aW9uYWxzID0gdGhpcy5pbnB1dHNbMF0sXG4gICAgICAgIGRlZmF1bHRWYWx1ZSA9IGdlbi5nZXRJbnB1dCggY29uZGl0aW9uYWxzWyBjb25kaXRpb25hbHMubGVuZ3RoIC0gMV0gKSxcbiAgICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAke2RlZmF1bHRWYWx1ZX1cXG5gIFxuXG4gICAgLy9jb25zb2xlLmxvZyggJ2NvbmRpdGlvbmFsczonLCB0aGlzLm5hbWUsIGNvbmRpdGlvbmFscyApXG5cbiAgICAvL2NvbnNvbGUubG9nKCAnZGVmYXVsdFZhbHVlOicsIGRlZmF1bHRWYWx1ZSApXG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IGNvbmRpdGlvbmFscy5sZW5ndGggLSAyOyBpKz0gMiApIHtcbiAgICAgIGxldCBpc0VuZEJsb2NrID0gaSA9PT0gY29uZGl0aW9uYWxzLmxlbmd0aCAtIDMsXG4gICAgICAgICAgY29uZCAgPSBnZW4uZ2V0SW5wdXQoIGNvbmRpdGlvbmFsc1sgaSBdICksXG4gICAgICAgICAgcHJlYmxvY2sgPSBjb25kaXRpb25hbHNbIGkrMSBdLFxuICAgICAgICAgIGJsb2NrLCBibG9ja05hbWUsIG91dHB1dFxuXG4gICAgICAvL2NvbnNvbGUubG9nKCAncGInLCBwcmVibG9jayApXG5cbiAgICAgIGlmKCB0eXBlb2YgcHJlYmxvY2sgPT09ICdudW1iZXInICl7XG4gICAgICAgIGJsb2NrID0gcHJlYmxvY2tcbiAgICAgICAgYmxvY2tOYW1lID0gbnVsbFxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCBnZW4ubWVtb1sgcHJlYmxvY2submFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgLy8gdXNlZCB0byBwbGFjZSBhbGwgY29kZSBkZXBlbmRlbmNpZXMgaW4gYXBwcm9wcmlhdGUgYmxvY2tzXG4gICAgICAgICAgZ2VuLnN0YXJ0TG9jYWxpemUoKVxuXG4gICAgICAgICAgZ2VuLmdldElucHV0KCBwcmVibG9jayApXG5cbiAgICAgICAgICBibG9jayA9IGdlbi5lbmRMb2NhbGl6ZSgpXG4gICAgICAgICAgYmxvY2tOYW1lID0gYmxvY2tbMF1cbiAgICAgICAgICBibG9jayA9IGJsb2NrWyAxIF0uam9pbignJylcbiAgICAgICAgICBibG9jayA9ICcgICcgKyBibG9jay5yZXBsYWNlKCAvXFxuL2dpLCAnXFxuICAnIClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYmxvY2sgPSAnJ1xuICAgICAgICAgIGJsb2NrTmFtZSA9IGdlbi5tZW1vWyBwcmVibG9jay5uYW1lIF1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvdXRwdXQgPSBibG9ja05hbWUgPT09IG51bGwgPyBcbiAgICAgICAgYCAgJHt0aGlzLm5hbWV9X291dCA9ICR7YmxvY2t9YCA6XG4gICAgICAgIGAke2Jsb2NrfSAgJHt0aGlzLm5hbWV9X291dCA9ICR7YmxvY2tOYW1lfWBcbiAgICAgIFxuICAgICAgaWYoIGk9PT0wICkgb3V0ICs9ICcgJ1xuICAgICAgb3V0ICs9IFxuYCBpZiggJHtjb25kfSA9PT0gMSApIHtcbiR7b3V0cHV0fVxuICB9YFxuXG4gICAgICBpZiggIWlzRW5kQmxvY2sgKSB7XG4gICAgICAgIG91dCArPSBgIGVsc2VgXG4gICAgICB9ZWxzZXtcbiAgICAgICAgb3V0ICs9IGBcXG5gXG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfV9vdXRgXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9X291dGAsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBjb25kaXRpb25zID0gQXJyYXkuaXNBcnJheSggYXJnc1swXSApID8gYXJnc1swXSA6IGFyZ3NcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgY29uZGl0aW9ucyBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2luJyxcblxuICBnZW4oKSB7XG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuXG4gICAgaWYoIGlzV29ya2xldCApIHtcbiAgICAgIGdlbi5pbnB1dHMuYWRkKCB0aGlzIClcbiAgICB9ZWxzZXtcbiAgICAgIGdlbi5wYXJhbWV0ZXJzLmFkZCggdGhpcy5uYW1lIClcbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpc1dvcmtsZXQgPyB0aGlzLm5hbWUgKyAnW2ldJyA6IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIHRoaXMubmFtZVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggbmFtZSwgaW5wdXROdW1iZXI9MCwgY2hhbm5lbE51bWJlcj0wICkgPT4ge1xuICBsZXQgaW5wdXQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgaW5wdXQuaWQgICA9IGdlbi5nZXRVSUQoKVxuICBpbnB1dC5uYW1lID0gbmFtZSAhPT0gdW5kZWZpbmVkID8gbmFtZSA6IGAke2lucHV0LmJhc2VuYW1lfSR7aW5wdXQuaWR9YFxuICBpbnB1dC5pbnB1dE51bWJlciA9IGlucHV0TnVtYmVyXG4gIGlucHV0LmNoYW5uZWxOdW1iZXIgPSBjaGFubmVsTnVtYmVyXG5cbiAgaW5wdXRbMF0gPSB7XG4gICAgZ2VuKCkge1xuICAgICAgaWYoICEgZ2VuLnBhcmFtZXRlcnMuaGFzKCBpbnB1dC5uYW1lICkgKSBnZW4ucGFyYW1ldGVycy5hZGQoIGlucHV0Lm5hbWUgKVxuICAgICAgcmV0dXJuIGlucHV0Lm5hbWUgKyAnWzBdJ1xuICAgIH1cbiAgfVxuICBpbnB1dFsxXSA9IHtcbiAgICBnZW4oKSB7XG4gICAgICBpZiggISBnZW4ucGFyYW1ldGVycy5oYXMoIGlucHV0Lm5hbWUgKSApIGdlbi5wYXJhbWV0ZXJzLmFkZCggaW5wdXQubmFtZSApXG4gICAgICByZXR1cm4gaW5wdXQubmFtZSArICdbMV0nXG4gICAgfVxuICB9XG5cblxuICByZXR1cm4gaW5wdXRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBsaWJyYXJ5ID0ge1xuICBleHBvcnQoIGRlc3RpbmF0aW9uICkge1xuICAgIGlmKCBkZXN0aW5hdGlvbiA9PT0gd2luZG93ICkge1xuICAgICAgZGVzdGluYXRpb24uc3NkID0gbGlicmFyeS5oaXN0b3J5ICAgIC8vIGhpc3RvcnkgaXMgd2luZG93IG9iamVjdCBwcm9wZXJ0eSwgc28gdXNlIHNzZCBhcyBhbGlhc1xuICAgICAgZGVzdGluYXRpb24uaW5wdXQgPSBsaWJyYXJ5LmluICAgICAgIC8vIGluIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG4gICAgICBkZXN0aW5hdGlvbi50ZXJuYXJ5ID0gbGlicmFyeS5zd2l0Y2ggLy8gc3dpdGNoIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG5cbiAgICAgIGRlbGV0ZSBsaWJyYXJ5Lmhpc3RvcnlcbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LmluXG4gICAgICBkZWxldGUgbGlicmFyeS5zd2l0Y2hcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKCBkZXN0aW5hdGlvbiwgbGlicmFyeSApXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGxpYnJhcnksICdzYW1wbGVyYXRlJywge1xuICAgICAgZ2V0KCkgeyByZXR1cm4gbGlicmFyeS5nZW4uc2FtcGxlcmF0ZSB9LFxuICAgICAgc2V0KHYpIHt9XG4gICAgfSlcblxuICAgIGxpYnJhcnkuaW4gPSBkZXN0aW5hdGlvbi5pbnB1dFxuICAgIGxpYnJhcnkuaGlzdG9yeSA9IGRlc3RpbmF0aW9uLnNzZFxuICAgIGxpYnJhcnkuc3dpdGNoID0gZGVzdGluYXRpb24udGVybmFyeVxuXG4gICAgZGVzdGluYXRpb24uY2xpcCA9IGxpYnJhcnkuY2xhbXBcbiAgfSxcblxuICBnZW46ICAgICAgcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICBcbiAgYWJzOiAgICAgIHJlcXVpcmUoICcuL2Ficy5qcycgKSxcbiAgcm91bmQ6ICAgIHJlcXVpcmUoICcuL3JvdW5kLmpzJyApLFxuICBwYXJhbTogICAgcmVxdWlyZSggJy4vcGFyYW0uanMnICksXG4gIGFkZDogICAgICByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gIHN1YjogICAgICByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gIG11bDogICAgICByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gIGRpdjogICAgICByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gIGFjY3VtOiAgICByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgY291bnRlcjogIHJlcXVpcmUoICcuL2NvdW50ZXIuanMnICksXG4gIHNpbjogICAgICByZXF1aXJlKCAnLi9zaW4uanMnICksXG4gIGNvczogICAgICByZXF1aXJlKCAnLi9jb3MuanMnICksXG4gIHRhbjogICAgICByZXF1aXJlKCAnLi90YW4uanMnICksXG4gIHRhbmg6ICAgICByZXF1aXJlKCAnLi90YW5oLmpzJyApLFxuICBhc2luOiAgICAgcmVxdWlyZSggJy4vYXNpbi5qcycgKSxcbiAgYWNvczogICAgIHJlcXVpcmUoICcuL2Fjb3MuanMnICksXG4gIGF0YW46ICAgICByZXF1aXJlKCAnLi9hdGFuLmpzJyApLCAgXG4gIHBoYXNvcjogICByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gIGRhdGE6ICAgICByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICBwZWVrOiAgICAgcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgY3ljbGU6ICAgIHJlcXVpcmUoICcuL2N5Y2xlLmpzJyApLFxuICBoaXN0b3J5OiAgcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgZGVsdGE6ICAgIHJlcXVpcmUoICcuL2RlbHRhLmpzJyApLFxuICBmbG9vcjogICAgcmVxdWlyZSggJy4vZmxvb3IuanMnICksXG4gIGNlaWw6ICAgICByZXF1aXJlKCAnLi9jZWlsLmpzJyApLFxuICBtaW46ICAgICAgcmVxdWlyZSggJy4vbWluLmpzJyApLFxuICBtYXg6ICAgICAgcmVxdWlyZSggJy4vbWF4LmpzJyApLFxuICBzaWduOiAgICAgcmVxdWlyZSggJy4vc2lnbi5qcycgKSxcbiAgZGNibG9jazogIHJlcXVpcmUoICcuL2RjYmxvY2suanMnICksXG4gIG1lbW86ICAgICByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICByYXRlOiAgICAgcmVxdWlyZSggJy4vcmF0ZS5qcycgKSxcbiAgd3JhcDogICAgIHJlcXVpcmUoICcuL3dyYXAuanMnICksXG4gIG1peDogICAgICByZXF1aXJlKCAnLi9taXguanMnICksXG4gIGNsYW1wOiAgICByZXF1aXJlKCAnLi9jbGFtcC5qcycgKSxcbiAgcG9rZTogICAgIHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gIGRlbGF5OiAgICByZXF1aXJlKCAnLi9kZWxheS5qcycgKSxcbiAgZm9sZDogICAgIHJlcXVpcmUoICcuL2ZvbGQuanMnICksXG4gIG1vZCA6ICAgICByZXF1aXJlKCAnLi9tb2QuanMnICksXG4gIHNhaCA6ICAgICByZXF1aXJlKCAnLi9zYWguanMnICksXG4gIG5vaXNlOiAgICByZXF1aXJlKCAnLi9ub2lzZS5qcycgKSxcbiAgbm90OiAgICAgIHJlcXVpcmUoICcuL25vdC5qcycgKSxcbiAgZ3Q6ICAgICAgIHJlcXVpcmUoICcuL2d0LmpzJyApLFxuICBndGU6ICAgICAgcmVxdWlyZSggJy4vZ3RlLmpzJyApLFxuICBsdDogICAgICAgcmVxdWlyZSggJy4vbHQuanMnICksIFxuICBsdGU6ICAgICAgcmVxdWlyZSggJy4vbHRlLmpzJyApLCBcbiAgYm9vbDogICAgIHJlcXVpcmUoICcuL2Jvb2wuanMnICksXG4gIGdhdGU6ICAgICByZXF1aXJlKCAnLi9nYXRlLmpzJyApLFxuICB0cmFpbjogICAgcmVxdWlyZSggJy4vdHJhaW4uanMnICksXG4gIHNsaWRlOiAgICByZXF1aXJlKCAnLi9zbGlkZS5qcycgKSxcbiAgaW46ICAgICAgIHJlcXVpcmUoICcuL2luLmpzJyApLFxuICB0NjA6ICAgICAgcmVxdWlyZSggJy4vdDYwLmpzJyksXG4gIG10b2Y6ICAgICByZXF1aXJlKCAnLi9tdG9mLmpzJyksXG4gIGx0cDogICAgICByZXF1aXJlKCAnLi9sdHAuanMnKSwgICAgICAgIC8vIFRPRE86IHRlc3RcbiAgZ3RwOiAgICAgIHJlcXVpcmUoICcuL2d0cC5qcycpLCAgICAgICAgLy8gVE9ETzogdGVzdFxuICBzd2l0Y2g6ICAgcmVxdWlyZSggJy4vc3dpdGNoLmpzJyApLFxuICBtc3Rvc2FtcHM6cmVxdWlyZSggJy4vbXN0b3NhbXBzLmpzJyApLCAvLyBUT0RPOiBuZWVkcyB0ZXN0LFxuICBzZWxlY3RvcjogcmVxdWlyZSggJy4vc2VsZWN0b3IuanMnICksXG4gIHV0aWxpdGllczpyZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnICksXG4gIHBvdzogICAgICByZXF1aXJlKCAnLi9wb3cuanMnICksXG4gIGF0dGFjazogICByZXF1aXJlKCAnLi9hdHRhY2suanMnICksXG4gIGRlY2F5OiAgICByZXF1aXJlKCAnLi9kZWNheS5qcycgKSxcbiAgd2luZG93czogIHJlcXVpcmUoICcuL3dpbmRvd3MuanMnICksXG4gIGVudjogICAgICByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gIGFkOiAgICAgICByZXF1aXJlKCAnLi9hZC5qcycgICksXG4gIGFkc3I6ICAgICByZXF1aXJlKCAnLi9hZHNyLmpzJyApLFxuICBpZmVsc2U6ICAgcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gIGJhbmc6ICAgICByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICBhbmQ6ICAgICAgcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICBwYW46ICAgICAgcmVxdWlyZSggJy4vcGFuLmpzJyApLFxuICBlcTogICAgICAgcmVxdWlyZSggJy4vZXEuanMnICksXG4gIG5lcTogICAgICByZXF1aXJlKCAnLi9uZXEuanMnICksXG4gIGV4cDogICAgICByZXF1aXJlKCAnLi9leHAuanMnICksXG4gIHNlcTogICAgICByZXF1aXJlKCAnLi9zZXEuanMnIClcbn1cblxubGlicmFyeS5nZW4ubGliID0gbGlicmFyeVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpYnJhcnlcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbHQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCggJHtpbnB1dHNbMF19IDwgJHtpbnB1dHNbMV19KSB8IDAgIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPCBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gbHQuYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPD0gJHtpbnB1dHNbMV19IHwgMCAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8PSBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gJ2x0ZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoJHtpbnB1dHNbIDAgXX0gKiAoKCAke2lucHV0c1swXX0gPCAke2lucHV0c1sxXX0gKSB8IDAgKSApYCBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKCggaW5wdXRzWzBdIDwgaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHRwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGx0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21heCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLm1heCcgOiBNYXRoLm1heCB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9bWF4KCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgubWF4KCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBtYXggPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbWF4LmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gbWF4XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbWVtbycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoaW4xLG1lbW9OYW1lKSA9PiB7XG4gIGxldCBtZW1vID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgbWVtby5pbnB1dHMgPSBbIGluMSBdXG4gIG1lbW8uaWQgICA9IGdlbi5nZXRVSUQoKVxuICBtZW1vLm5hbWUgPSBtZW1vTmFtZSAhPT0gdW5kZWZpbmVkID8gbWVtb05hbWUgKyAnXycgKyBnZW4uZ2V0VUlEKCkgOiBgJHttZW1vLmJhc2VuYW1lfSR7bWVtby5pZH1gXG5cbiAgcmV0dXJuIG1lbW9cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidtaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBpc1dvcmtsZXQgPyAnTWF0aC5taW4nIDogTWF0aC5taW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfW1pbiggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLm1pbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICksIHBhcnNlRmxvYXQoIGlucHV0c1sxXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbWluID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1pbi5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIG1pblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW89IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiwgdD0uNSApID0+IHtcbiAgbGV0IHVnZW4gPSBtZW1vKCBhZGQoIG11bChpbjEsIHN1YigxLHQgKSApLCBtdWwoIGluMiwgdCApICkgKVxuICB1Z2VuLm5hbWUgPSAnbWl4JyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBsZXQgbW9kID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0PScoJyxcbiAgICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgICAgbW9kQXRFbmQgPSBmYWxzZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAlIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gJSAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgJSAnIFxuICAgICAgfSlcblxuICAgICAgb3V0ICs9ICcpJ1xuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gbW9kXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J21zdG9zYW1wcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcmV0dXJuVmFsdWVcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWUgfSA9ICR7Z2VuLnNhbXBsZXJhdGV9IC8gMTAwMCAqICR7aW5wdXRzWzBdfSBcXG5cXG5gXG4gICAgIFxuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gb3V0XG4gICAgICBcbiAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGdlbi5zYW1wbGVyYXRlIC8gMTAwMCAqIHRoaXMuaW5wdXRzWzBdXG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0XG4gICAgfSAgICBcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBtc3Rvc2FtcHMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbXN0b3NhbXBzLmlucHV0cyA9IFsgeCBdXG4gIG1zdG9zYW1wcy5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbXN0b3NhbXBzXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbXRvZicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgKCAke3RoaXMudHVuaW5nfSAqIGdlbi5leHAoIC4wNTc3NjIyNjUgKiAoJHtpbnB1dHNbMF19IC0gNjkpICkgKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSB0aGlzLnR1bmluZyAqIE1hdGguZXhwKCAuMDU3NzYyMjY1ICogKCBpbnB1dHNbMF0gLSA2OSkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHgsIHByb3BzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgdHVuaW5nOjQ0MCB9XG4gIFxuICBpZiggcHJvcHMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIHByb3BzLmRlZmF1bHRzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBkZWZhdWx0cyApXG4gIHVnZW4uaW5wdXRzID0gWyB4IF1cbiAgXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTogJ211bCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgLFxuICAgICAgICBzdW0gPSAxLCBudW1Db3VudCA9IDAsIG11bEF0RW5kID0gZmFsc2UsIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZVxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICBvdXQgKz0gdlxuICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgbXVsQXRFbmQgPSB0cnVlXG4gICAgICAgICAgb3V0ICs9ICcgKiAnXG4gICAgICAgIH1cbiAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCBpID09PSAwICkge1xuICAgICAgICAgIHN1bSA9IHZcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3VtICo9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICB9XG4gICAgICAgIG51bUNvdW50KytcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYoIG51bUNvdW50ID4gMCApIHtcbiAgICAgIG91dCArPSBtdWxBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKiAnICsgc3VtXG4gICAgfVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgY29uc3QgbXVsID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgT2JqZWN0LmFzc2lnbiggbXVsLCB7XG4gICAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICAgIGlucHV0czogYXJncyxcbiAgfSlcbiAgXG4gIG11bC5uYW1lID0gbXVsLmJhc2VuYW1lICsgbXVsLmlkXG5cbiAgcmV0dXJuIG11bFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbmVxJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSAvKnRoaXMuaW5wdXRzWzBdICE9PSB0aGlzLmlucHV0c1sxXSA/IDEgOiovIGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ICE9PSAke2lucHV0c1sxXX0pIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J25vaXNlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dFxuXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnbm9pc2UnIDogaXNXb3JrbGV0ID8gJ01hdGgucmFuZG9tJyA6IE1hdGgucmFuZG9tIH0pXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gJHtyZWZ9bm9pc2UoKVxcbmBcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbm9pc2UgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIG5vaXNlLm5hbWUgPSBwcm90by5uYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG5vaXNlXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbm90JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgKSB7XG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gPT09IDAgPyAxIDogMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSAhaW5wdXRzWzBdID09PSAwID8gMSA6IDBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBub3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbm90LmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIG5vdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwYW4nLCBcbiAgaW5pdFRhYmxlKCkgeyAgICBcbiAgICBsZXQgYnVmZmVyTCA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKSxcbiAgICAgICAgYnVmZmVyUiA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gICAgY29uc3QgYW5nVG9SYWQgPSBNYXRoLlBJIC8gMTgwXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCAxMDI0OyBpKysgKSB7IFxuICAgICAgbGV0IHBhbiA9IGkgKiAoIDkwIC8gMTAyNCApXG4gICAgICBidWZmZXJMW2ldID0gTWF0aC5jb3MoIHBhbiAqIGFuZ1RvUmFkICkgXG4gICAgICBidWZmZXJSW2ldID0gTWF0aC5zaW4oIHBhbiAqIGFuZ1RvUmFkIClcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5wYW5MID0gZGF0YSggYnVmZmVyTCwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9KVxuICAgIGdlbi5nbG9iYWxzLnBhblIgPSBkYXRhKCBidWZmZXJSLCAxLCB7IGltbXV0YWJsZTp0cnVlIH0pXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggbGVmdElucHV0LCByaWdodElucHV0LCBwYW4gPS41LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBpZiggZ2VuLmdsb2JhbHMucGFuTCA9PT0gdW5kZWZpbmVkICkgcHJvdG8uaW5pdFRhYmxlKClcblxuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgbGVmdElucHV0LCByaWdodElucHV0IF0sXG4gICAgbGVmdDogICAgbXVsKCBsZWZ0SW5wdXQsIHBlZWsoIGdlbi5nbG9iYWxzLnBhbkwsIHBhbiwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSApLFxuICAgIHJpZ2h0OiAgIG11bCggcmlnaHRJbnB1dCwgcGVlayggZ2VuLmdsb2JhbHMucGFuUiwgcGFuLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pIClcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncGFyYW0nLFxuXG4gIGdlbigpIHtcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGdlbi5wYXJhbXMuYWRkKCB0aGlzIClcblxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcblxuICAgIGlmKCBpc1dvcmtsZXQgKSBnZW4ucGFyYW1ldGVycy5hZGQoIHRoaXMubmFtZSApXG5cbiAgICB0aGlzLnZhbHVlID0gdGhpcy5pbml0aWFsVmFsdWVcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlzV29ya2xldCA/IHRoaXMubmFtZSArICdbaV0nIDogYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYFxuXG4gICAgcmV0dXJuIGdlbi5tZW1vWyB0aGlzLm5hbWUgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggcHJvcE5hbWU9MCwgdmFsdWU9MCwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIGlmKCB0eXBlb2YgcHJvcE5hbWUgIT09ICdzdHJpbmcnICkge1xuICAgIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcbiAgICB1Z2VuLmluaXRpYWxWYWx1ZSA9IHByb3BOYW1lXG4gIH1lbHNle1xuICAgIHVnZW4ubmFtZSA9IHByb3BOYW1lXG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSB2YWx1ZVxuICB9XG5cbiAgdWdlbi5taW4gPSBtaW5cbiAgdWdlbi5tYXggPSBtYXhcblxuICAvLyBmb3Igc3RvcmluZyB3b3JrbGV0IG5vZGVzIG9uY2UgdGhleSdyZSBpbnN0YW50aWF0ZWRcbiAgdWdlbi53YWFwaSA9IG51bGxcblxuICB1Z2VuLmlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgaWYoIHRoaXMuaXNXb3JrbGV0ICYmIHRoaXMud2FhcGkgIT09IG51bGwgKSB7XG4gICAgICAgICAgdGhpcy53YWFwaS52YWx1ZSA9IHZcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHZcbiAgICAgICAgfSBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgICBkYXRhVWdlbiA9IHJlcXVpcmUoJy4vZGF0YS5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BlZWsnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQsIGZ1bmN0aW9uQm9keSwgbmV4dCwgbGVuZ3RoSXNMb2cyLCBpZHhcbiAgICBcbiAgICBpZHggPSBpbnB1dHNbMV1cbiAgICBsZW5ndGhJc0xvZzIgPSAoTWF0aC5sb2cyKCB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCApIHwgMCkgID09PSBNYXRoLmxvZzIoIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIClcblxuICAgIGlmKCB0aGlzLm1vZGUgIT09ICdzaW1wbGUnICkge1xuXG4gICAgZnVuY3Rpb25Cb2R5ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9kYXRhSWR4ICA9ICR7aWR4fSwgXG4gICAgICAke3RoaXMubmFtZX1fcGhhc2UgPSAke3RoaXMubW9kZSA9PT0gJ3NhbXBsZXMnID8gaW5wdXRzWzBdIDogaW5wdXRzWzBdICsgJyAqICcgKyAodGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGgpIH0sIFxuICAgICAgJHt0aGlzLm5hbWV9X2luZGV4ID0gJHt0aGlzLm5hbWV9X3BoYXNlIHwgMCxcXG5gXG5cbiAgICBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICd3cmFwJyApIHtcbiAgICAgIG5leHQgPSBsZW5ndGhJc0xvZzIgP1xuICAgICAgYCggJHt0aGlzLm5hbWV9X2luZGV4ICsgMSApICYgKCR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IC0gMSlgIDpcbiAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9ID8gJHt0aGlzLm5hbWV9X2luZGV4ICsgMSAtICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9ZWxzZSBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdjbGFtcCcgKSB7XG4gICAgICBuZXh0ID0gXG4gICAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA/ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG4gICAgfSBlbHNlIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2ZvbGQnIHx8IHRoaXMuYm91bmRtb2RlID09PSAnbWlycm9yJyApIHtcbiAgICAgIG5leHQgPSBcbiAgICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDEgPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9ID8gJHt0aGlzLm5hbWV9X2luZGV4IC0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9ZWxzZXtcbiAgICAgICBuZXh0ID0gXG4gICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMWAgICAgIFxuICAgIH1cblxuICAgIGlmKCB0aGlzLmludGVycCA9PT0gJ2xpbmVhcicgKSB7ICAgICAgXG4gICAgZnVuY3Rpb25Cb2R5ICs9IGAgICAgICAke3RoaXMubmFtZX1fZnJhYyAgPSAke3RoaXMubmFtZX1fcGhhc2UgLSAke3RoaXMubmFtZX1faW5kZXgsXG4gICAgICAke3RoaXMubmFtZX1fYmFzZSAgPSBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgICR7dGhpcy5uYW1lfV9pbmRleCBdLFxuICAgICAgJHt0aGlzLm5hbWV9X25leHQgID0gJHtuZXh0fSxgXG4gICAgICBcbiAgICAgIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2lnbm9yZScgKSB7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSBgXG4gICAgICAke3RoaXMubmFtZX1fb3V0ICAgPSAke3RoaXMubmFtZX1faW5kZXggPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9IHx8ICR7dGhpcy5uYW1lfV9pbmRleCA8IDAgPyAwIDogJHt0aGlzLm5hbWV9X2Jhc2UgKyAke3RoaXMubmFtZX1fZnJhYyAqICggbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICR7dGhpcy5uYW1lfV9uZXh0IF0gLSAke3RoaXMubmFtZX1fYmFzZSApXFxuXFxuYFxuICAgICAgfWVsc2V7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSBgXG4gICAgICAke3RoaXMubmFtZX1fb3V0ICAgPSAke3RoaXMubmFtZX1fYmFzZSArICR7dGhpcy5uYW1lfV9mcmFjICogKCBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X25leHQgXSAtICR7dGhpcy5uYW1lfV9iYXNlIClcXG5cXG5gXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBmdW5jdGlvbkJvZHkgKz0gYCAgICAgICR7dGhpcy5uYW1lfV9vdXQgPSBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X2luZGV4IF1cXG5cXG5gXG4gICAgfVxuXG4gICAgfSBlbHNlIHsgLy8gbW9kZSBpcyBzaW1wbGVcbiAgICAgIGZ1bmN0aW9uQm9keSA9IGBtZW1vcnlbICR7aWR4fSArICR7IGlucHV0c1swXSB9IF1gXG4gICAgICBcbiAgICAgIHJldHVybiBmdW5jdGlvbkJvZHlcbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX291dCdcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSsnX291dCcsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgZGVmYXVsdHMgOiB7IGNoYW5uZWxzOjEsIG1vZGU6J3BoYXNlJywgaW50ZXJwOidsaW5lYXInLCBib3VuZG1vZGU6J3dyYXAnIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGlucHV0X2RhdGEsIGluZGV4PTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIC8vY29uc29sZS5sb2coIGRhdGFVZ2VuLCBnZW4uZGF0YSApXG5cbiAgLy8gWFhYIHdoeSBpcyBkYXRhVWdlbiBub3QgdGhlIGFjdHVhbCBmdW5jdGlvbj8gc29tZSB0eXBlIG9mIGJyb3dzZXJpZnkgbm9uc2Vuc2UuLi5cbiAgY29uc3QgZmluYWxEYXRhID0gdHlwZW9mIGlucHV0X2RhdGEuYmFzZW5hbWUgPT09ICd1bmRlZmluZWQnID8gZ2VuLmxpYi5kYXRhKCBpbnB1dF9kYXRhICkgOiBpbnB1dF9kYXRhXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgXG4gICAgeyBcbiAgICAgICdkYXRhJzogICAgIGZpbmFsRGF0YSxcbiAgICAgIGRhdGFOYW1lOiAgIGZpbmFsRGF0YS5uYW1lLFxuICAgICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgICAgaW5wdXRzOiAgICAgWyBpbmRleCwgZmluYWxEYXRhIF0sXG4gICAgfSxcbiAgICBwcm90by5kZWZhdWx0cyxcbiAgICBwcm9wZXJ0aWVzIFxuICApXG4gIFxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIG11bCAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHByb3RvID0geyBiYXNlbmFtZToncGhhc29yJyB9LFxuICAgIGRpdiAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApXG5cbmNvbnN0IGRlZmF1bHRzID0geyBtaW46IC0xLCBtYXg6IDEgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5ID0gMSwgcmVzZXQgPSAwLCBfcHJvcHMgKSA9PiB7XG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBfcHJvcHMgKVxuXG4gIGNvbnN0IHJhbmdlID0gcHJvcHMubWF4IC0gcHJvcHMubWluXG5cbiAgY29uc3QgdWdlbiA9IHR5cGVvZiBmcmVxdWVuY3kgPT09ICdudW1iZXInIFxuICAgID8gYWNjdW0oIChmcmVxdWVuY3kgKiByYW5nZSkgLyBnZW4uc2FtcGxlcmF0ZSwgcmVzZXQsIHByb3BzICkgXG4gICAgOiBhY2N1bSggXG4gICAgICAgIGRpdiggXG4gICAgICAgICAgbXVsKCBmcmVxdWVuY3ksIHJhbmdlICksXG4gICAgICAgICAgZ2VuLnNhbXBsZXJhdGVcbiAgICAgICAgKSwgXG4gICAgICAgIHJlc2V0LCBwcm9wcyBcbiAgICApXG5cbiAgdWdlbi5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBtdWwgID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICB3cmFwID0gcmVxdWlyZSgnLi93cmFwLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncG9rZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBkYXRhTmFtZSA9ICdtZW1vcnknLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGlkeCwgb3V0LCB3cmFwcGVkXG4gICAgXG4gICAgaWR4ID0gdGhpcy5kYXRhLmdlbigpXG5cbiAgICAvL2dlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgLy93cmFwcGVkID0gd3JhcCggdGhpcy5pbnB1dHNbMV0sIDAsIHRoaXMuZGF0YUxlbmd0aCApLmdlbigpXG4gICAgLy9pZHggPSB3cmFwcGVkWzBdXG4gICAgLy9nZW4uZnVuY3Rpb25Cb2R5ICs9IHdyYXBwZWRbMV1cbiAgICBsZXQgb3V0cHV0U3RyID0gdGhpcy5pbnB1dHNbMV0gPT09IDAgP1xuICAgICAgYCAgJHtkYXRhTmFtZX1bICR7aWR4fSBdID0gJHtpbnB1dHNbMF19XFxuYCA6XG4gICAgICBgICAke2RhdGFOYW1lfVsgJHtpZHh9ICsgJHtpbnB1dHNbMV19IF0gPSAke2lucHV0c1swXX1cXG5gXG5cbiAgICBpZiggdGhpcy5pbmxpbmUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGdlbi5mdW5jdGlvbkJvZHkgKz0gb3V0cHV0U3RyXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gWyB0aGlzLmlubGluZSwgb3V0cHV0U3RyIF1cbiAgICB9XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gKCBkYXRhLCB2YWx1ZSwgaW5kZXgsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBjaGFubmVsczoxIH0gXG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGRhdGEsXG4gICAgZGF0YU5hbWU6ICAgZGF0YS5uYW1lLFxuICAgIGRhdGFMZW5ndGg6IGRhdGEuYnVmZmVyLmxlbmd0aCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyB2YWx1ZSwgaW5kZXggXSxcbiAgfSxcbiAgZGVmYXVsdHMgKVxuXG5cbiAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkXG4gIFxuICBnZW4uaGlzdG9yaWVzLnNldCggdWdlbi5uYW1lLCB1Z2VuIClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwb3cnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Bvdyc6IGlzV29ya2xldCA/ICdNYXRoLnBvdycgOiBNYXRoLnBvdyB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9cG93KCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggdHlwZW9mIGlucHV0c1swXSA9PT0gJ3N0cmluZycgJiYgaW5wdXRzWzBdWzBdID09PSAnKCcgKSB7XG4gICAgICAgIGlucHV0c1swXSA9IGlucHV0c1swXS5zbGljZSgxLC0xKVxuICAgICAgfVxuICAgICAgaWYoIHR5cGVvZiBpbnB1dHNbMV0gPT09ICdzdHJpbmcnICYmIGlucHV0c1sxXVswXSA9PT0gJygnICkge1xuICAgICAgICBpbnB1dHNbMV0gPSBpbnB1dHNbMV0uc2xpY2UoMSwtMSlcbiAgICAgIH1cblxuICAgICAgb3V0ID0gTWF0aC5wb3coIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0pIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgcG93ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHBvdy5pbnB1dHMgPSBbIHgseSBdXG4gIHBvdy5pZCA9IGdlbi5nZXRVSUQoKVxuICBwb3cubmFtZSA9IGAke3Bvdy5iYXNlbmFtZX17cG93LmlkfWBcblxuICByZXR1cm4gcG93XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBhZGQgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgbWVtbyAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gICAgZGVsdGEgICA9IHJlcXVpcmUoICcuL2RlbHRhLmpzJyApLFxuICAgIHdyYXAgICAgPSByZXF1aXJlKCAnLi93cmFwLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3JhdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBwaGFzZSAgPSBoaXN0b3J5KCksXG4gICAgICAgIGluTWludXMxID0gaGlzdG9yeSgpLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmaWx0ZXIsIHN1bSwgb3V0XG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIG91dCA9IFxuYCB2YXIgJHt0aGlzLm5hbWV9X2RpZmYgPSAke2lucHV0c1swXX0gLSAke2dlbk5hbWV9Lmxhc3RTYW1wbGVcbiAgaWYoICR7dGhpcy5uYW1lfV9kaWZmIDwgLS41ICkgJHt0aGlzLm5hbWV9X2RpZmYgKz0gMVxuICAke2dlbk5hbWV9LnBoYXNlICs9ICR7dGhpcy5uYW1lfV9kaWZmICogJHtpbnB1dHNbMV19XG4gIGlmKCAke2dlbk5hbWV9LnBoYXNlID4gMSApICR7Z2VuTmFtZX0ucGhhc2UgLT0gMVxuICAke2dlbk5hbWV9Lmxhc3RTYW1wbGUgPSAke2lucHV0c1swXX1cbmBcbiAgICBvdXQgPSAnICcgKyBvdXRcblxuICAgIHJldHVybiBbIGdlbk5hbWUgKyAnLnBoYXNlJywgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCByYXRlICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHBoYXNlOiAgICAgIDAsXG4gICAgbGFzdFNhbXBsZTogMCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEsIHJhdGUgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidyb3VuZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGgucm91bmQnIDogTWF0aC5yb3VuZCB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9cm91bmQoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgucm91bmQoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCByb3VuZCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICByb3VuZC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiByb3VuZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NhaCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lIF0gPSAwXG4gICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lICsgJ19jb250cm9sJyBdID0gMFxuXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuXG4gICAgb3V0ID0gXG5gIHZhciAke3RoaXMubmFtZX1fY29udHJvbCA9IG1lbW9yeVske3RoaXMubWVtb3J5LmNvbnRyb2wuaWR4fV0sXG4gICAgICAke3RoaXMubmFtZX1fdHJpZ2dlciA9ICR7aW5wdXRzWzFdfSA+ICR7aW5wdXRzWzJdfSA/IDEgOiAwXG5cbiAgaWYoICR7dGhpcy5uYW1lfV90cmlnZ2VyICE9PSAke3RoaXMubmFtZX1fY29udHJvbCAgKSB7XG4gICAgaWYoICR7dGhpcy5uYW1lfV90cmlnZ2VyID09PSAxICkgXG4gICAgICBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XSA9ICR7aW5wdXRzWzBdfVxuICAgIFxuICAgIG1lbW9yeVske3RoaXMubWVtb3J5LmNvbnRyb2wuaWR4fV0gPSAke3RoaXMubmFtZX1fdHJpZ2dlclxuICB9XG5gXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYC8vYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAsICcgJyArb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBjb250cm9sLCB0aHJlc2hvbGQ9MCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXQ6MCB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xLCBjb250cm9sLHRocmVzaG9sZCBdLFxuICAgIG1lbW9yeToge1xuICAgICAgY29udHJvbDogeyBpZHg6bnVsbCwgbGVuZ3RoOjEgfSxcbiAgICAgIHZhbHVlOiAgIHsgaWR4Om51bGwsIGxlbmd0aDoxIH0sXG4gICAgfVxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzZWxlY3RvcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dCwgcmV0dXJuVmFsdWUgPSAwXG4gICAgXG4gICAgc3dpdGNoKCBpbnB1dHMubGVuZ3RoICkge1xuICAgICAgY2FzZSAyIDpcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBpbnB1dHNbMV1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDMgOlxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcblxcbmA7XG4gICAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUgKyAnX291dCcsIG91dCBdXG4gICAgICAgIGJyZWFrOyAgXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAwXG4gIHN3aXRjaCggJHtpbnB1dHNbMF19ICsgMSApIHtcXG5gXG5cbiAgICAgICAgZm9yKCBsZXQgaSA9IDE7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKysgKXtcbiAgICAgICAgICBvdXQgKz1gICAgIGNhc2UgJHtpfTogJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzW2ldfTsgYnJlYWs7XFxuYCBcbiAgICAgICAgfVxuXG4gICAgICAgIG91dCArPSAnICB9XFxuXFxuJ1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSArICdfb3V0JywgJyAnICsgb3V0IF1cbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX291dCdcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uaW5wdXRzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgY291bnRlcj0gcmVxdWlyZSggJy4vY291bnRlci5qcycgKSxcbiAgICBwZWVrICA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgc3NkICAgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIGRhdGEgID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwcm90byA9IHsgYmFzZW5hbWU6J3NlcScgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZHVyYXRpb25zID0gMTEwMjUsIHZhbHVlcyA9IFswLDFdLCBwaGFzZUluY3JlbWVudCA9IDEpID0+IHtcbiAgbGV0IGNsb2NrXG4gIFxuICBpZiggQXJyYXkuaXNBcnJheSggZHVyYXRpb25zICkgKSB7XG4gICAgLy8gd2Ugd2FudCBhIGNvdW50ZXIgdGhhdCBpcyB1c2luZyBvdXIgY3VycmVudFxuICAgIC8vIHJhdGUgdmFsdWUsIGJ1dCB3ZSB3YW50IHRoZSByYXRlIHZhbHVlIHRvIGJlIGRlcml2ZWQgZnJvbVxuICAgIC8vIHRoZSBjb3VudGVyLiBtdXN0IGluc2VydCBhIHNpbmdsZS1zYW1wbGUgZGVhbHkgdG8gYXZvaWRcbiAgICAvLyBpbmZpbml0ZSBsb29wLlxuICAgIGNvbnN0IGNsb2NrMiA9IGNvdW50ZXIoIDAsIDAsIGR1cmF0aW9ucy5sZW5ndGggKVxuICAgIGNvbnN0IF9fZHVyYXRpb25zID0gcGVlayggZGF0YSggZHVyYXRpb25zICksIGNsb2NrMiwgeyBtb2RlOidzaW1wbGUnIH0pIFxuICAgIGNsb2NrID0gY291bnRlciggcGhhc2VJbmNyZW1lbnQsIDAsIF9fZHVyYXRpb25zIClcbiAgICBcbiAgICAvLyBhZGQgb25lIHNhbXBsZSBkZWxheSB0byBhdm9pZCBjb2RlZ2VuIGxvb3BcbiAgICBjb25zdCBzID0gc3NkKClcbiAgICBzLmluKCBjbG9jay53cmFwIClcbiAgICBjbG9jazIuaW5wdXRzWzBdID0gcy5vdXRcbiAgfWVsc2V7XG4gICAgLy8gaWYgdGhlIHJhdGUgYXJndW1lbnQgaXMgYSBzaW5nbGUgdmFsdWUgd2UgZG9uJ3QgbmVlZCB0b1xuICAgIC8vIGRvIGFueXRoaW5nIHRyaWNreS5cbiAgICBjbG9jayA9IGNvdW50ZXIoIHBoYXNlSW5jcmVtZW50LCAwLCBkdXJhdGlvbnMgKVxuICB9XG4gIFxuICBjb25zdCBzdGVwcGVyID0gYWNjdW0oIGNsb2NrLndyYXAsIDAsIHsgbWluOjAsIG1heDp2YWx1ZXMubGVuZ3RoIH0pXG4gICBcbiAgY29uc3QgdWdlbiA9IHBlZWsoIGRhdGEoIHZhbHVlcyApLCBzdGVwcGVyLCB7IG1vZGU6J3NpbXBsZScgfSlcblxuICB1Z2VuLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonc2lnbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGguc2lnbicgOiBNYXRoLnNpZ24gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXNpZ24oICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2lnbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHNpZ24gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgc2lnbi5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBzaWduXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdzaW4nOiBpc1dvcmtsZXQgPyAnTWF0aC5zaW4nIDogTWF0aC5zaW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXNpbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpbi5pbnB1dHMgPSBbIHggXVxuICBzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgc2luLm5hbWUgPSBgJHtzaW4uYmFzZW5hbWV9e3Npbi5pZH1gXG5cbiAgcmV0dXJuIHNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGd0ICAgICAgPSByZXF1aXJlKCAnLi9ndC5qcycgKSxcbiAgICBkaXYgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIF9zd2l0Y2ggPSByZXF1aXJlKCAnLi9zd2l0Y2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgc2xpZGVVcCA9IDEsIHNsaWRlRG93biA9IDEgKSA9PiB7XG4gIGxldCB5MSA9IGhpc3RvcnkoMCksXG4gICAgICBmaWx0ZXIsIHNsaWRlQW1vdW50XG5cbiAgLy95IChuKSA9IHkgKG4tMSkgKyAoKHggKG4pIC0geSAobi0xKSkvc2xpZGUpIFxuICBzbGlkZUFtb3VudCA9IF9zd2l0Y2goIGd0KGluMSx5MS5vdXQpLCBzbGlkZVVwLCBzbGlkZURvd24gKVxuXG4gIGZpbHRlciA9IG1lbW8oIGFkZCggeTEub3V0LCBkaXYoIHN1YiggaW4xLCB5MS5vdXQgKSwgc2xpZGVBbW91bnQgKSApIClcblxuICB5MS5pbiggZmlsdGVyIClcblxuICByZXR1cm4gZmlsdGVyXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3N1YicsXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQ9MCxcbiAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgIG5lZWRzUGFyZW5zID0gZmFsc2UsIFxuICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICBzdWJBdEVuZCA9IGZhbHNlLFxuICAgICAgICBoYXNVZ2VucyA9IGZhbHNlLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IDBcblxuICAgIHRoaXMuaW5wdXRzLmZvckVhY2goIHZhbHVlID0+IHsgaWYoIGlzTmFOKCB2YWx1ZSApICkgaGFzVWdlbnMgPSB0cnVlIH0pXG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC0gdlxuICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICByZXR1cm5cbiAgICAgIH1lbHNle1xuICAgICAgICBuZWVkc1BhcmVucyA9IHRydWVcbiAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9IC0gJHt2fWBcbiAgICAgIH1cblxuICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLSAnIFxuICAgIH0pXG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGxldCBzdWIgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggc3ViLCB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzXG4gIH0pXG4gICAgICAgXG4gIHN1Yi5uYW1lID0gJ3N1YicgKyBzdWIuaWRcblxuICByZXR1cm4gc3ViXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzd2l0Y2gnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIGlmKCBpbnB1dHNbMV0gPT09IGlucHV0c1syXSApIHJldHVybiBpbnB1dHNbMV0gLy8gaWYgYm90aCBwb3RlbnRpYWwgb3V0cHV0cyBhcmUgdGhlIHNhbWUganVzdCByZXR1cm4gb25lIG9mIHRoZW1cbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1fb3V0YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfV9vdXRgLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBjb250cm9sLCBpbjEgPSAxLCBpbjIgPSAwICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGNvbnRyb2wsIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3Q2MCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcmV0dXJuVmFsdWVcblxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgJ2V4cCcgXTogaXNXb3JrbGV0ID8gJ01hdGguZXhwJyA6IE1hdGguZXhwIH0pXG5cbiAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSAke3JlZn1leHAoIC02LjkwNzc1NTI3ODkyMSAvICR7aW5wdXRzWzBdfSApXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gaW5wdXRzWzBdIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBvdXRcbiAgICB9ICAgIFxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHQ2MCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0NjAuaW5wdXRzID0gWyB4IF1cbiAgdDYwLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB0NjBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Rhbic6IGlzV29ya2xldCA/ICdNYXRoLnRhbicgOiBNYXRoLnRhbiB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9dGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdGFuLmlucHV0cyA9IFsgeCBdXG4gIHRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW4ubmFtZSA9IGAke3Rhbi5iYXNlbmFtZX17dGFuLmlkfWBcblxuICByZXR1cm4gdGFuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3RhbmgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAndGFuaCc6IGlzV29ya2xldCA/ICdNYXRoLnRhbicgOiBNYXRoLnRhbmggfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXRhbmgoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnRhbmgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW5oID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHRhbmguaW5wdXRzID0gWyB4IF1cbiAgdGFuaC5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW5oLm5hbWUgPSBgJHt0YW5oLmJhc2VuYW1lfXt0YW5oLmlkfWBcblxuICByZXR1cm4gdGFuaFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGx0ICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBwaGFzb3IgID0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9NDQwLCBwdWxzZXdpZHRoPS41ICkgPT4ge1xuICBsZXQgZ3JhcGggPSBsdCggYWNjdW0oIGRpdiggZnJlcXVlbmN5LCA0NDEwMCApICksIC41IClcblxuICBncmFwaC5uYW1lID0gYHRyYWluJHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiBncmFwaFxufVxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKVxuXG5sZXQgaXNTdGVyZW8gPSBmYWxzZVxuXG5sZXQgdXRpbGl0aWVzID0ge1xuICBjdHg6IG51bGwsXG5cbiAgY2xlYXIoKSB7XG4gICAgaWYoIHRoaXMud29ya2xldE5vZGUgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHRoaXMud29ya2xldE5vZGUuZGlzY29ubmVjdCgpXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmNhbGxiYWNrID0gKCkgPT4gMFxuICAgIH1cbiAgICB0aGlzLmNsZWFyLmNhbGxiYWNrcy5mb3JFYWNoKCB2ID0+IHYoKSApXG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MubGVuZ3RoID0gMFxuICB9LFxuXG4gIGNyZWF0ZUNvbnRleHQoKSB7XG4gICAgbGV0IEFDID0gdHlwZW9mIEF1ZGlvQ29udGV4dCA9PT0gJ3VuZGVmaW5lZCcgPyB3ZWJraXRBdWRpb0NvbnRleHQgOiBBdWRpb0NvbnRleHRcbiAgICB0aGlzLmN0eCA9IG5ldyBBQygpXG5cbiAgICBnZW4uc2FtcGxlcmF0ZSA9IHRoaXMuY3R4LnNhbXBsZVJhdGVcblxuICAgIGxldCBzdGFydCA9ICgpID0+IHtcbiAgICAgIGlmKCB0eXBlb2YgQUMgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICBpZiggZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG5cbiAgICAgICAgICBpZiggJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkgeyAvLyByZXF1aXJlZCB0byBzdGFydCBhdWRpbyB1bmRlciBpT1MgNlxuICAgICAgICAgICAgIGxldCBteVNvdXJjZSA9IHV0aWxpdGllcy5jdHguY3JlYXRlQnVmZmVyU291cmNlKClcbiAgICAgICAgICAgICBteVNvdXJjZS5jb25uZWN0KCB1dGlsaXRpZXMuY3R4LmRlc3RpbmF0aW9uIClcbiAgICAgICAgICAgICBteVNvdXJjZS5ub3RlT24oIDAgKVxuICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcblxuICBjcmVhdGVTY3JpcHRQcm9jZXNzb3IoKSB7XG4gICAgdGhpcy5ub2RlID0gdGhpcy5jdHguY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCAxMDI0LCAwLCAyIClcbiAgICB0aGlzLmNsZWFyRnVuY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIDAgfVxuICAgIGlmKCB0eXBlb2YgdGhpcy5jYWxsYmFjayA9PT0gJ3VuZGVmaW5lZCcgKSB0aGlzLmNhbGxiYWNrID0gdGhpcy5jbGVhckZ1bmN0aW9uXG5cbiAgICB0aGlzLm5vZGUub25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbiggYXVkaW9Qcm9jZXNzaW5nRXZlbnQgKSB7XG4gICAgICB2YXIgb3V0cHV0QnVmZmVyID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQub3V0cHV0QnVmZmVyO1xuXG4gICAgICB2YXIgbGVmdCA9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMCApLFxuICAgICAgICAgIHJpZ2h0PSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDEgKSxcbiAgICAgICAgICBpc1N0ZXJlbyA9IHV0aWxpdGllcy5pc1N0ZXJlb1xuXG4gICAgIGZvciggdmFyIHNhbXBsZSA9IDA7IHNhbXBsZSA8IGxlZnQubGVuZ3RoOyBzYW1wbGUrKyApIHtcbiAgICAgICAgdmFyIG91dCA9IHV0aWxpdGllcy5jYWxsYmFjaygpXG5cbiAgICAgICAgaWYoIGlzU3RlcmVvID09PSBmYWxzZSApIHtcbiAgICAgICAgICBsZWZ0WyBzYW1wbGUgXSA9IHJpZ2h0WyBzYW1wbGUgXSA9IG91dCBcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgbGVmdFsgc2FtcGxlICBdID0gb3V0WzBdXG4gICAgICAgICAgcmlnaHRbIHNhbXBsZSBdID0gb3V0WzFdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm5vZGUuY29ubmVjdCggdGhpcy5jdHguZGVzdGluYXRpb24gKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcblxuICAvLyByZW1vdmUgc3RhcnRpbmcgc3R1ZmYgYW5kIGFkZCB0YWJzXG4gIHByZXR0eVByaW50Q2FsbGJhY2soIGNiICkge1xuICAgIC8vIGdldCByaWQgb2YgXCJmdW5jdGlvbiBnZW5cIiBhbmQgc3RhcnQgd2l0aCBwYXJlbnRoZXNpc1xuICAgIC8vIGNvbnN0IHNob3J0ZW5kQ0IgPSBjYi50b1N0cmluZygpLnNsaWNlKDkpXG4gICAgY29uc3QgY2JTcGxpdCA9IGNiLnRvU3RyaW5nKCkuc3BsaXQoJ1xcbicpXG4gICAgY29uc3QgY2JUcmltID0gY2JTcGxpdC5zbGljZSggMywgLTIgKVxuICAgIGNvbnN0IGNiVGFiYmVkID0gY2JUcmltLm1hcCggdiA9PiAnICAgICAgJyArIHYgKSBcbiAgICBcbiAgICByZXR1cm4gY2JUYWJiZWQuam9pbignXFxuJylcbiAgfSxcblxuICBjcmVhdGVQYXJhbWV0ZXJEZXNjcmlwdG9ycyggY2IgKSB7XG4gICAgLy8gW3tuYW1lOiAnYW1wbGl0dWRlJywgZGVmYXVsdFZhbHVlOiAwLjI1LCBtaW5WYWx1ZTogMCwgbWF4VmFsdWU6IDF9XTtcbiAgICBsZXQgcGFyYW1TdHIgPSAnJ1xuXG4gICAgZm9yKCBsZXQgdWdlbiBvZiBjYi5wYXJhbXMudmFsdWVzKCkgKSB7XG4gICAgICBwYXJhbVN0ciArPSBgeyBuYW1lOicke3VnZW4ubmFtZX0nLCBkZWZhdWx0VmFsdWU6JHt1Z2VuLnZhbHVlfSwgbWluVmFsdWU6JHt1Z2VuLm1pbn0sIG1heFZhbHVlOiR7dWdlbi5tYXh9IH0sXFxuICAgICAgYFxuICAgIH1cblxuICAgIHJldHVybiBwYXJhbVN0clxuICB9LFxuXG4gIGNyZWF0ZVBhcmFtZXRlckRlcmVmZXJlbmNlcyggY2IgKSB7XG4gICAgbGV0IHN0ciA9IGNiLnBhcmFtcy5zaXplID4gMCA/ICdcXG4gICAgICAnIDogJydcbiAgICBmb3IoIGxldCB1Z2VuIG9mIGNiLnBhcmFtcy52YWx1ZXMoKSApIHtcbiAgICAgIHN0ciArPSBgY29uc3QgJHt1Z2VuLm5hbWV9ID0gcGFyYW1ldGVycy4ke3VnZW4ubmFtZX1cXG4gICAgICBgXG4gICAgfVxuXG4gICAgcmV0dXJuIHN0clxuICB9LFxuXG4gIGNyZWF0ZVBhcmFtZXRlckFyZ3VtZW50cyggY2IgKSB7XG4gICAgbGV0ICBwYXJhbUxpc3QgPSAnJ1xuICAgIGZvciggbGV0IHVnZW4gb2YgY2IucGFyYW1zLnZhbHVlcygpICkge1xuICAgICAgcGFyYW1MaXN0ICs9IHVnZW4ubmFtZSArICdbaV0sJ1xuICAgIH1cbiAgICBwYXJhbUxpc3QgPSBwYXJhbUxpc3Quc2xpY2UoIDAsIC0xIClcblxuICAgIHJldHVybiBwYXJhbUxpc3RcbiAgfSxcblxuICBjcmVhdGVJbnB1dERlcmVmZXJlbmNlcyggY2IgKSB7XG4gICAgbGV0IHN0ciA9IGNiLmlucHV0cy5zaXplID4gMCA/ICdcXG4nIDogJydcbiAgICBmb3IoIGxldCBpbnB1dCBvZiAgY2IuaW5wdXRzLnZhbHVlcygpICkge1xuICAgICAgc3RyICs9IGBjb25zdCAke2lucHV0Lm5hbWV9ID0gaW5wdXRzWyAke2lucHV0LmlucHV0TnVtYmVyfSBdWyAke2lucHV0LmNoYW5uZWxOdW1iZXJ9IF1cXG4gICAgICBgXG4gICAgfVxuXG4gICAgcmV0dXJuIHN0clxuICB9LFxuXG5cbiAgY3JlYXRlSW5wdXRBcmd1bWVudHMoIGNiICkge1xuICAgIGxldCAgcGFyYW1MaXN0ID0gJydcbiAgICBmb3IoIGxldCBpbnB1dCBvZiBjYi5pbnB1dHMudmFsdWVzKCkgKSB7XG4gICAgICBwYXJhbUxpc3QgKz0gaW5wdXQubmFtZSArICdbaV0sJ1xuICAgIH1cbiAgICBwYXJhbUxpc3QgPSBwYXJhbUxpc3Quc2xpY2UoIDAsIC0xIClcblxuICAgIHJldHVybiBwYXJhbUxpc3RcbiAgfSxcbiAgICAgIFxuICBjcmVhdGVGdW5jdGlvbkRlcmVmZXJlbmNlcyggY2IgKSB7XG4gICAgbGV0IG1lbWJlclN0cmluZyA9IGNiLm1lbWJlcnMuc2l6ZSA+IDAgPyAnXFxuJyA6ICcnXG4gICAgbGV0IG1lbW8gPSB7fVxuICAgIGZvciggbGV0IGRpY3Qgb2YgY2IubWVtYmVycy52YWx1ZXMoKSApIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdLFxuICAgICAgICAgICAgdmFsdWUgPSBkaWN0WyBuYW1lIF1cblxuICAgICAgaWYoIG1lbW9bIG5hbWUgXSAhPT0gdW5kZWZpbmVkICkgY29udGludWVcbiAgICAgIG1lbW9bIG5hbWUgXSA9IHRydWVcblxuICAgICAgbWVtYmVyU3RyaW5nICs9IGAgICAgICBjb25zdCAke25hbWV9ID0gJHt2YWx1ZX1cXG5gXG4gICAgfVxuXG4gICAgcmV0dXJuIG1lbWJlclN0cmluZ1xuICB9LFxuXG4gIGNyZWF0ZVdvcmtsZXRQcm9jZXNzb3IoIGdyYXBoLCBuYW1lLCBkZWJ1ZywgbWVtPTQ0MTAwKjEwICkge1xuICAgIC8vY29uc3QgbWVtID0gTWVtb3J5SGVscGVyLmNyZWF0ZSggNDA5NiwgRmxvYXQ2NEFycmF5IClcbiAgICBjb25zdCBjYiA9IGdlbi5jcmVhdGVDYWxsYmFjayggZ3JhcGgsIG1lbSwgZGVidWcgKVxuICAgIGNvbnN0IGlucHV0cyA9IGNiLmlucHV0c1xuXG4gICAgLy8gZ2V0IGFsbCBpbnB1dHMgYW5kIGNyZWF0ZSBhcHByb3ByaWF0ZSBhdWRpb3BhcmFtIGluaXRpYWxpemVyc1xuICAgIGNvbnN0IHBhcmFtZXRlckRlc2NyaXB0b3JzID0gdGhpcy5jcmVhdGVQYXJhbWV0ZXJEZXNjcmlwdG9ycyggY2IgKVxuICAgIGNvbnN0IHBhcmFtZXRlckRlcmVmZXJlbmNlcyA9IHRoaXMuY3JlYXRlUGFyYW1ldGVyRGVyZWZlcmVuY2VzKCBjYiApXG4gICAgY29uc3QgcGFyYW1MaXN0ID0gdGhpcy5jcmVhdGVQYXJhbWV0ZXJBcmd1bWVudHMoIGNiIClcbiAgICBjb25zdCBpbnB1dERlcmVmZXJlbmNlcyA9IHRoaXMuY3JlYXRlSW5wdXREZXJlZmVyZW5jZXMoIGNiIClcbiAgICBjb25zdCBpbnB1dExpc3QgPSB0aGlzLmNyZWF0ZUlucHV0QXJndW1lbnRzKCBjYiApICAgXG4gICAgY29uc3QgbWVtYmVyU3RyaW5nID0gdGhpcy5jcmVhdGVGdW5jdGlvbkRlcmVmZXJlbmNlcyggY2IgKVxuXG4gICAgLy8gZ2V0IHJlZmVyZW5jZXMgdG8gTWF0aCBmdW5jdGlvbnMgYXMgbmVlZGVkXG4gICAgLy8gdGhlc2UgcmVmZXJlbmNlcyBhcmUgYWRkZWQgdG8gdGhlIGNhbGxiYWNrIGR1cmluZyBjb2RlZ2VuLlxuXG4gICAgLy8gY2hhbmdlIG91dHB1dCBiYXNlZCBvbiBudW1iZXIgb2YgY2hhbm5lbHMuXG4gICAgY29uc3QgZ2VuaXNoT3V0cHV0TGluZSA9IGNiLmlzU3RlcmVvID09PSBmYWxzZVxuICAgICAgPyBgbGVmdFsgaSBdID0gbWVtb3J5WzBdYFxuICAgICAgOiBgbGVmdFsgaSBdID0gbWVtb3J5WzBdO1xcblxcdFxcdHJpZ2h0WyBpIF0gPSBtZW1vcnlbMV1cXG5gXG5cbiAgICBjb25zdCBwcmV0dHlDYWxsYmFjayA9IHRoaXMucHJldHR5UHJpbnRDYWxsYmFjayggY2IgKVxuXG5cbiAgICAvKioqKiogYmVnaW4gY2FsbGJhY2sgY29kZSAqKioqL1xuICAgIC8vIG5vdGUgdGhhdCB3ZSBoYXZlIHRvIGNoZWNrIHRvIHNlZSB0aGF0IG1lbW9yeSBoYXMgYmVlbiBwYXNzZWRcbiAgICAvLyB0byB0aGUgd29ya2VyIGJlZm9yZSBydW5uaW5nIHRoZSBjYWxsYmFjayBmdW5jdGlvbiwgb3RoZXJ3aXNlXG4gICAgLy8gaXQgY2FuIGJlIHBhc3QgdG9vIHNsb3dseSBhbmQgZmFpbCBvbiBvY2Nhc3Npb25cblxuICAgIGNvbnN0IHdvcmtsZXRDb2RlID0gYFxuY2xhc3MgJHtuYW1lfVByb2Nlc3NvciBleHRlbmRzIEF1ZGlvV29ya2xldFByb2Nlc3NvciB7XG5cbiAgc3RhdGljIGdldCBwYXJhbWV0ZXJEZXNjcmlwdG9ycygpIHtcbiAgICBjb25zdCBwYXJhbXMgPSBbXG4gICAgICAkeyBwYXJhbWV0ZXJEZXNjcmlwdG9ycyB9ICAgICAgXG4gICAgXVxuICAgIHJldHVybiBwYXJhbXNcbiAgfVxuIFxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcbiAgICBzdXBlciggb3B0aW9ucyApXG4gICAgdGhpcy5wb3J0Lm9ubWVzc2FnZSA9IHRoaXMuaGFuZGxlTWVzc2FnZS5iaW5kKCB0aGlzIClcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2VcbiAgfVxuXG4gIGhhbmRsZU1lc3NhZ2UoIGV2ZW50ICkge1xuICAgIGlmKCBldmVudC5kYXRhLmtleSA9PT0gJ2luaXQnICkge1xuICAgICAgdGhpcy5tZW1vcnkgPSBldmVudC5kYXRhLm1lbW9yeVxuICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWVcbiAgICB9ZWxzZSBpZiggZXZlbnQuZGF0YS5rZXkgPT09ICdzZXQnICkge1xuICAgICAgdGhpcy5tZW1vcnlbIGV2ZW50LmRhdGEuaWR4IF0gPSBldmVudC5kYXRhLnZhbHVlXG4gICAgfWVsc2UgaWYoIGV2ZW50LmRhdGEua2V5ID09PSAnZ2V0JyApIHtcbiAgICAgIHRoaXMucG9ydC5wb3N0TWVzc2FnZSh7IGtleToncmV0dXJuJywgaWR4OmV2ZW50LmRhdGEuaWR4LCB2YWx1ZTp0aGlzLm1lbW9yeVtldmVudC5kYXRhLmlkeF0gfSkgICAgIFxuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3MoIGlucHV0cywgb3V0cHV0cywgcGFyYW1ldGVycyApIHtcbiAgICBpZiggdGhpcy5pbml0aWFsaXplZCA9PT0gdHJ1ZSApIHtcbiAgICAgIGNvbnN0IG91dHB1dCA9IG91dHB1dHNbMF1cbiAgICAgIGNvbnN0IGxlZnQgICA9IG91dHB1dFsgMCBdXG4gICAgICBjb25zdCByaWdodCAgPSBvdXRwdXRbIDEgXVxuICAgICAgY29uc3QgbGVuICAgID0gbGVmdC5sZW5ndGhcbiAgICAgIGNvbnN0IG1lbW9yeSA9IHRoaXMubWVtb3J5ICR7cGFyYW1ldGVyRGVyZWZlcmVuY2VzfSR7aW5wdXREZXJlZmVyZW5jZXN9JHttZW1iZXJTdHJpbmd9XG5cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgbGVuOyArK2kgKSB7XG4gICAgICAgICR7cHJldHR5Q2FsbGJhY2t9XG4gICAgICAgICR7Z2VuaXNoT3V0cHV0TGluZX1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxufVxuICAgIFxucmVnaXN0ZXJQcm9jZXNzb3IoICcke25hbWV9JywgJHtuYW1lfVByb2Nlc3NvcilgXG5cbiAgICBcbiAgICAvKioqKiogZW5kIGNhbGxiYWNrIGNvZGUgKioqKiovXG5cblxuICAgIGlmKCBkZWJ1ZyA9PT0gdHJ1ZSApIGNvbnNvbGUubG9nKCB3b3JrbGV0Q29kZSApXG5cbiAgICBjb25zdCB1cmwgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChcbiAgICAgIG5ldyBCbG9iKFxuICAgICAgICBbIHdvcmtsZXRDb2RlIF0sIFxuICAgICAgICB7IHR5cGU6ICd0ZXh0L2phdmFzY3JpcHQnIH1cbiAgICAgIClcbiAgICApXG5cbiAgICByZXR1cm4gWyB1cmwsIHdvcmtsZXRDb2RlLCBpbnB1dHMsIGNiLnBhcmFtcywgY2IuaXNTdGVyZW8gXSBcbiAgfSxcblxuICByZWdpc3RlcmVkRm9yTm9kZUFzc2lnbm1lbnQ6IFtdLFxuICByZWdpc3RlciggdWdlbiApIHtcbiAgICBpZiggdGhpcy5yZWdpc3RlcmVkRm9yTm9kZUFzc2lnbm1lbnQuaW5kZXhPZiggdWdlbiApID09PSAtMSApIHtcbiAgICAgIHRoaXMucmVnaXN0ZXJlZEZvck5vZGVBc3NpZ25tZW50LnB1c2goIHVnZW4gKVxuICAgIH1cbiAgfSxcblxuICBwbGF5V29ya2xldCggZ3JhcGgsIG5hbWUsIGRlYnVnPWZhbHNlLCBtZW09NDQxMDAgKiAxMCApIHtcbiAgICB1dGlsaXRpZXMuY2xlYXIoKVxuXG4gICAgY29uc3QgWyB1cmwsIGNvZGVTdHJpbmcsIGlucHV0cywgcGFyYW1zLCBpc1N0ZXJlbyBdID0gdXRpbGl0aWVzLmNyZWF0ZVdvcmtsZXRQcm9jZXNzb3IoIGdyYXBoLCBuYW1lLCBkZWJ1ZywgbWVtIClcblxuICAgIGNvbnN0IG5vZGVQcm9taXNlID0gbmV3IFByb21pc2UoIChyZXNvbHZlLHJlamVjdCkgPT4ge1xuICAgXG4gICAgICB1dGlsaXRpZXMuY3R4LmF1ZGlvV29ya2xldC5hZGRNb2R1bGUoIHVybCApLnRoZW4oICgpPT4ge1xuICAgICAgICBjb25zdCB3b3JrbGV0Tm9kZSA9IG5ldyBBdWRpb1dvcmtsZXROb2RlKCB1dGlsaXRpZXMuY3R4LCBuYW1lLCB7IG91dHB1dENoYW5uZWxDb3VudDpbIGlzU3RlcmVvID8gMiA6IDEgXSB9KVxuICAgICAgICB3b3JrbGV0Tm9kZS5jb25uZWN0KCB1dGlsaXRpZXMuY3R4LmRlc3RpbmF0aW9uIClcblxuICAgICAgICB3b3JrbGV0Tm9kZS5jYWxsYmFja3MgPSB7fVxuICAgICAgICB3b3JrbGV0Tm9kZS5vbm1lc3NhZ2UgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgICAgaWYoIGV2ZW50LmRhdGEubWVzc2FnZSA9PT0gJ3JldHVybicgKSB7XG4gICAgICAgICAgICB3b3JrbGV0Tm9kZS5jYWxsYmFja3NbIGV2ZW50LmRhdGEuaWR4IF0oIGV2ZW50LmRhdGEudmFsdWUgKVxuICAgICAgICAgICAgZGVsZXRlIHdvcmtsZXROb2RlLmNhbGxiYWNrc1sgZXZlbnQuZGF0YS5pZHggXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHdvcmtsZXROb2RlLmdldE1lbW9yeVZhbHVlID0gZnVuY3Rpb24oIGlkeCwgY2IgKSB7XG4gICAgICAgICAgdGhpcy53b3JrbGV0Q2FsbGJhY2tzWyBpZHggXSA9IGNiXG4gICAgICAgICAgdGhpcy53b3JrbGV0Tm9kZS5wb3J0LnBvc3RNZXNzYWdlKHsga2V5OidnZXQnLCBpZHg6IGlkeCB9KVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB3b3JrbGV0Tm9kZS5wb3J0LnBvc3RNZXNzYWdlKHsga2V5Oidpbml0JywgbWVtb3J5Omdlbi5tZW1vcnkuaGVhcCB9KVxuICAgICAgICB1dGlsaXRpZXMud29ya2xldE5vZGUgPSB3b3JrbGV0Tm9kZVxuXG4gICAgICAgIHV0aWxpdGllcy5yZWdpc3RlcmVkRm9yTm9kZUFzc2lnbm1lbnQuZm9yRWFjaCggdWdlbiA9PiB1Z2VuLm5vZGUgPSB3b3JrbGV0Tm9kZSApXG4gICAgICAgIHV0aWxpdGllcy5yZWdpc3RlcmVkRm9yTm9kZUFzc2lnbm1lbnQubGVuZ3RoID0gMFxuXG4gICAgICAgIC8vIGFzc2lnbiBhbGwgcGFyYW1zIGFzIHByb3BlcnRpZXMgb2Ygbm9kZSBmb3IgZWFzaWVyIHJlZmVyZW5jZSBcbiAgICAgICAgZm9yKCBsZXQgZGljdCBvZiBpbnB1dHMudmFsdWVzKCkgKSB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF1cbiAgICAgICAgICBjb25zdCBwYXJhbSA9IHdvcmtsZXROb2RlLnBhcmFtZXRlcnMuZ2V0KCBuYW1lIClcbiAgICAgIFxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggd29ya2xldE5vZGUsIG5hbWUsIHtcbiAgICAgICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICAgICAgcGFyYW0udmFsdWUgPSB2XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICByZXR1cm4gcGFyYW0udmFsdWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yKCBsZXQgdWdlbiBvZiBwYXJhbXMudmFsdWVzKCkgKSB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IHVnZW4ubmFtZVxuICAgICAgICAgIGNvbnN0IHBhcmFtID0gd29ya2xldE5vZGUucGFyYW1ldGVycy5nZXQoIG5hbWUgKVxuICAgICAgICAgIHVnZW4ud2FhcGkgPSBwYXJhbSBcblxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggd29ya2xldE5vZGUsIG5hbWUsIHtcbiAgICAgICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICAgICAgcGFyYW0udmFsdWUgPSB2XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICByZXR1cm4gcGFyYW0udmFsdWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoIHV0aWxpdGllcy5jb25zb2xlICkgdXRpbGl0aWVzLmNvbnNvbGUuc2V0VmFsdWUoIGNvZGVTdHJpbmcgKVxuXG4gICAgICAgIHJlc29sdmUoIHdvcmtsZXROb2RlIClcbiAgICAgIH0pXG5cbiAgICB9KVxuXG4gICAgcmV0dXJuIG5vZGVQcm9taXNlXG4gIH0sXG4gIFxuICBwbGF5R3JhcGgoIGdyYXBoLCBkZWJ1ZywgbWVtPTQ0MTAwKjEwLCBtZW1UeXBlPUZsb2F0MzJBcnJheSApIHtcbiAgICB1dGlsaXRpZXMuY2xlYXIoKVxuICAgIGlmKCBkZWJ1ZyA9PT0gdW5kZWZpbmVkICkgZGVidWcgPSBmYWxzZVxuICAgICAgICAgIFxuICAgIHRoaXMuaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KCBncmFwaCApXG5cbiAgICB1dGlsaXRpZXMuY2FsbGJhY2sgPSBnZW4uY3JlYXRlQ2FsbGJhY2soIGdyYXBoLCBtZW0sIGRlYnVnLCBmYWxzZSwgbWVtVHlwZSApXG4gICAgXG4gICAgaWYoIHV0aWxpdGllcy5jb25zb2xlICkgdXRpbGl0aWVzLmNvbnNvbGUuc2V0VmFsdWUoIHV0aWxpdGllcy5jYWxsYmFjay50b1N0cmluZygpIClcblxuICAgIHJldHVybiB1dGlsaXRpZXMuY2FsbGJhY2tcbiAgfSxcblxuICBsb2FkU2FtcGxlKCBzb3VuZEZpbGVQYXRoLCBkYXRhICkge1xuICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIHJlcS5vcGVuKCAnR0VUJywgc291bmRGaWxlUGF0aCwgdHJ1ZSApXG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcicgXG4gICAgXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUscmVqZWN0KSA9PiB7XG4gICAgICByZXEub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhdWRpb0RhdGEgPSByZXEucmVzcG9uc2VcblxuICAgICAgICB1dGlsaXRpZXMuY3R4LmRlY29kZUF1ZGlvRGF0YSggYXVkaW9EYXRhLCAoYnVmZmVyKSA9PiB7XG4gICAgICAgICAgZGF0YS5idWZmZXIgPSBidWZmZXIuZ2V0Q2hhbm5lbERhdGEoMClcbiAgICAgICAgICByZXNvbHZlKCBkYXRhLmJ1ZmZlciApXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJlcS5zZW5kKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxufVxuXG51dGlsaXRpZXMuY2xlYXIuY2FsbGJhY2tzID0gW11cblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsaXRpZXNcbiIsIid1c2Ugc3RyaWN0J1xuXG4vKlxuICogbWFueSB3aW5kb3dzIGhlcmUgYWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9jb3JiYW5icm9vay9kc3AuanMvYmxvYi9tYXN0ZXIvZHNwLmpzXG4gKiBzdGFydGluZyBhdCBsaW5lIDE0MjdcbiAqIHRha2VuIDgvMTUvMTZcbiovIFxuXG5jb25zdCB3aW5kb3dzID0gbW9kdWxlLmV4cG9ydHMgPSB7IFxuICBiYXJ0bGV0dCggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMiAvIChsZW5ndGggLSAxKSAqICgobGVuZ3RoIC0gMSkgLyAyIC0gTWF0aC5hYnMoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSkgXG4gIH0sXG5cbiAgYmFydGxldHRIYW5uKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjYyIC0gMC40OCAqIE1hdGguYWJzKGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMC41KSAtIDAuMzggKiBNYXRoLmNvcyggMiAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBibGFja21hbiggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgbGV0IGEwID0gKDEgLSBhbHBoYSkgLyAyLFxuICAgICAgICBhMSA9IDAuNSxcbiAgICAgICAgYTIgPSBhbHBoYSAvIDJcblxuICAgIHJldHVybiBhMCAtIGExICogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSkgKyBhMiAqIE1hdGguY29zKDQgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgY29zaW5lKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiBNYXRoLmNvcyhNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSBNYXRoLlBJIC8gMilcbiAgfSxcblxuICBnYXVzcyggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KE1hdGguRSwgLTAuNSAqIE1hdGgucG93KChpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpIC8gKGFscGhhICogKGxlbmd0aCAtIDEpIC8gMiksIDIpKVxuICB9LFxuXG4gIGhhbW1pbmcoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNTQgLSAwLjQ2ICogTWF0aC5jb3MoIE1hdGguUEkgKiAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgaGFubiggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyggTWF0aC5QSSAqIDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSkgKVxuICB9LFxuXG4gIGxhbmN6b3MoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgbGV0IHggPSAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSAxO1xuICAgIHJldHVybiBNYXRoLnNpbihNYXRoLlBJICogeCkgLyAoTWF0aC5QSSAqIHgpXG4gIH0sXG5cbiAgcmVjdGFuZ3VsYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDFcbiAgfSxcblxuICB0cmlhbmd1bGFyKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAyIC8gbGVuZ3RoICogKGxlbmd0aCAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKVxuICB9LFxuXG4gIC8vIHBhcmFib2xhXG4gIHdlbGNoKCBsZW5ndGgsIF9pbmRleCwgaWdub3JlLCBzaGlmdD0wICkge1xuICAgIC8vd1tuXSA9IDEgLSBNYXRoLnBvdyggKCBuIC0gKCAoTi0xKSAvIDIgKSApIC8gKCggTi0xICkgLyAyICksIDIgKVxuICAgIGNvbnN0IGluZGV4ID0gc2hpZnQgPT09IDAgPyBfaW5kZXggOiAoX2luZGV4ICsgTWF0aC5mbG9vciggc2hpZnQgKiBsZW5ndGggKSkgJSBsZW5ndGhcbiAgICBjb25zdCBuXzFfb3ZlcjIgPSAobGVuZ3RoIC0gMSkgLyAyIFxuXG4gICAgcmV0dXJuIDEgLSBNYXRoLnBvdyggKCBpbmRleCAtIG5fMV9vdmVyMiApIC8gbl8xX292ZXIyLCAyIClcbiAgfSxcbiAgaW52ZXJzZXdlbGNoKCBsZW5ndGgsIF9pbmRleCwgaWdub3JlLCBzaGlmdD0wICkge1xuICAgIC8vd1tuXSA9IDEgLSBNYXRoLnBvdyggKCBuIC0gKCAoTi0xKSAvIDIgKSApIC8gKCggTi0xICkgLyAyICksIDIgKVxuICAgIGxldCBpbmRleCA9IHNoaWZ0ID09PSAwID8gX2luZGV4IDogKF9pbmRleCArIE1hdGguZmxvb3IoIHNoaWZ0ICogbGVuZ3RoICkpICUgbGVuZ3RoXG4gICAgY29uc3Qgbl8xX292ZXIyID0gKGxlbmd0aCAtIDEpIC8gMlxuXG4gICAgcmV0dXJuIE1hdGgucG93KCAoIGluZGV4IC0gbl8xX292ZXIyICkgLyBuXzFfb3ZlcjIsIDIgKVxuICB9LFxuXG4gIHBhcmFib2xhKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIGlmKCBpbmRleCA8PSBsZW5ndGggLyAyICkge1xuICAgICAgcmV0dXJuIHdpbmRvd3MuaW52ZXJzZXdlbGNoKCBsZW5ndGggLyAyLCBpbmRleCApIC0gMVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIDEgLSB3aW5kb3dzLmludmVyc2V3ZWxjaCggbGVuZ3RoIC8gMiwgaW5kZXggLSBsZW5ndGggLyAyIClcbiAgICB9XG4gIH0sXG5cbiAgZXhwb25lbnRpYWwoIGxlbmd0aCwgaW5kZXgsIGFscGhhICkge1xuICAgIHJldHVybiBNYXRoLnBvdyggaW5kZXggLyBsZW5ndGgsIGFscGhhIClcbiAgfSxcblxuICBsaW5lYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIGluZGV4IC8gbGVuZ3RoXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZmxvb3I9IHJlcXVpcmUoJy4vZmxvb3IuanMnKSxcbiAgICBzdWIgID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTond3JhcCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHNpZ25hbCA9IGlucHV0c1swXSwgbWluID0gaW5wdXRzWzFdLCBtYXggPSBpbnB1dHNbMl0sXG4gICAgICAgIG91dCwgZGlmZlxuXG4gICAgLy9vdXQgPSBgKCgoJHtpbnB1dHNbMF19IC0gJHt0aGlzLm1pbn0pICUgJHtkaWZmfSAgKyAke2RpZmZ9KSAlICR7ZGlmZn0gKyAke3RoaXMubWlufSlgXG4gICAgLy9jb25zdCBsb25nIG51bVdyYXBzID0gbG9uZygodi1sbykvcmFuZ2UpIC0gKHYgPCBsbyk7XG4gICAgLy9yZXR1cm4gdiAtIHJhbmdlICogZG91YmxlKG51bVdyYXBzKTsgICBcbiAgICBcbiAgICBpZiggdGhpcy5taW4gPT09IDAgKSB7XG4gICAgICBkaWZmID0gbWF4XG4gICAgfWVsc2UgaWYgKCBpc05hTiggbWF4ICkgfHwgaXNOYU4oIG1pbiApICkge1xuICAgICAgZGlmZiA9IGAke21heH0gLSAke21pbn1gXG4gICAgfWVsc2V7XG4gICAgICBkaWZmID0gbWF4IC0gbWluXG4gICAgfVxuXG4gICAgb3V0ID1cbmAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9IDwgJHt0aGlzLm1pbn0gKSAke3RoaXMubmFtZX0gKz0gJHtkaWZmfVxuICBlbHNlIGlmKCAke3RoaXMubmFtZX0gPiAke3RoaXMubWF4fSApICR7dGhpcy5uYW1lfSAtPSAke2RpZmZ9XG5cbmBcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgJyAnICsgb3V0IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCJsZXQgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbmxldCBhbmFseXplciA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG5PYmplY3QuYXNzaWduKCBhbmFseXplciwge1xuICBfX3R5cGVfXzogJ2FuYWx5emVyJyxcbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gYW5hbHl6ZXJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBhbmFseXplcnMgPSB7XG4gICAgU1NEOiAgICByZXF1aXJlKCAnLi9zaW5nbGVzYW1wbGVkZWxheS5qcycgICkoIEdpYmJlcmlzaCApLFxuICAgIEZvbGxvdzogcmVxdWlyZSggJy4vZm9sbG93LmpzJyAgKSggR2liYmVyaXNoIClcbiAgfVxuXG4gIGFuYWx5emVycy5leHBvcnQgPSB0YXJnZXQgPT4ge1xuICAgIGZvciggbGV0IGtleSBpbiBhbmFseXplcnMgKSB7XG4gICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyApIHtcbiAgICAgICAgdGFyZ2V0WyBrZXkgXSA9IGFuYWx5emVyc1sga2V5IF1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxucmV0dXJuIGFuYWx5emVyc1xuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSgnZ2VuaXNoLmpzJyksXG4gICAgICBhbmFseXplciA9IHJlcXVpcmUoJy4vYW5hbHl6ZXIuanMnKSxcbiAgICAgIHVnZW4gPSByZXF1aXJlKCcuLi91Z2VuLmpzJyk7XG5cbmNvbnN0IGdlbmlzaCA9IGc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEdpYmJlcmlzaCkge1xuXG4gIGNvbnN0IEZvbGxvdyA9IGlucHV0UHJvcHMgPT4ge1xuXG4gICAgLy8gbWFpbiBmb2xsb3cgb2JqZWN0IGlzIGFsc28gdGhlIG91dHB1dFxuICAgIGNvbnN0IGZvbGxvdyA9IE9iamVjdC5jcmVhdGUoYW5hbHl6ZXIpO1xuICAgIGZvbGxvdy5pbiA9IE9iamVjdC5jcmVhdGUodWdlbik7XG4gICAgZm9sbG93LmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKCk7XG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGlucHV0UHJvcHMsIEZvbGxvdy5kZWZhdWx0cyk7XG4gICAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZTtcblxuICAgIC8vIHRoZSBpbnB1dCB0byB0aGUgZm9sbG93IHVnZW4gaXMgYnVmZmVyZWQgaW4gdGhpcyB1Z2VuXG4gICAgZm9sbG93LmJ1ZmZlciA9IGcuZGF0YShwcm9wcy5idWZmZXJTaXplLCAxKTtcblxuICAgIGxldCBhdmc7IC8vIG91dHB1dDsgbWFrZSBhdmFpbGFibGUgb3V0c2lkZSBqc2RzcCBibG9ja1xuICAgIGNvbnN0IF9pbnB1dCA9IGcuaW4oJ2lucHV0Jyk7XG4gICAgY29uc3QgaW5wdXQgPSBpc1N0ZXJlbyA/IGcuYWRkKF9pbnB1dFswXSwgX2lucHV0WzFdKSA6IF9pbnB1dDtcblxuICAgIHtcbiAgICAgIFwidXNlIGpzZHNwXCI7XG4gICAgICAvLyBwaGFzZSB0byB3cml0ZSB0byBmb2xsb3cgYnVmZmVyXG4gICAgICBjb25zdCBidWZmZXJQaGFzZU91dCA9IGcuYWNjdW0oMSwgMCwgeyBtYXg6IHByb3BzLmJ1ZmZlclNpemUsIG1pbjogMCB9KTtcblxuICAgICAgLy8gaG9sZCBydW5uaW5nIHN1bVxuICAgICAgY29uc3Qgc3VtID0gZy5kYXRhKDEsIDEsIHsgbWV0YTogdHJ1ZSB9KTtcblxuICAgICAgc3VtWzBdID0gZ2VuaXNoLnN1YihnZW5pc2guYWRkKHN1bVswXSwgaW5wdXQpLCBnLnBlZWsoZm9sbG93LmJ1ZmZlciwgYnVmZmVyUGhhc2VPdXQsIHsgbW9kZTogJ3NpbXBsZScgfSkpO1xuXG4gICAgICBhdmcgPSBnZW5pc2guZGl2KHN1bVswXSwgcHJvcHMuYnVmZmVyU2l6ZSk7XG4gICAgfVxuXG4gICAgaWYgKCFpc1N0ZXJlbykge1xuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoZm9sbG93LCBhdmcsICdmb2xsb3dfb3V0JywgcHJvcHMpO1xuXG4gICAgICBmb2xsb3cuY2FsbGJhY2sudWdlbk5hbWUgPSBmb2xsb3cudWdlbk5hbWUgPSBgZm9sbG93X291dF8keyBmb2xsb3cuaWQgfWA7XG5cbiAgICAgIC8vIGhhdmUgdG8gd3JpdGUgY3VzdG9tIGNhbGxiYWNrIGZvciBpbnB1dCB0byByZXVzZSBjb21wb25lbnRzIGZyb20gb3V0cHV0LFxuICAgICAgLy8gc3BlY2lmaWNhbGx5IHRoZSBtZW1vcnkgZnJvbSBvdXIgYnVmZmVyXG4gICAgICBsZXQgaWR4ID0gZm9sbG93LmJ1ZmZlci5tZW1vcnkudmFsdWVzLmlkeDtcbiAgICAgIGxldCBwaGFzZSA9IDA7XG4gICAgICBsZXQgYWJzID0gTWF0aC5hYnM7XG4gICAgICBsZXQgY2FsbGJhY2sgPSBmdW5jdGlvbiAoaW5wdXQsIG1lbW9yeSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG5cbiAgICAgICAgbWVtb3J5W2dlbmlzaC5hZGQoaWR4LCBwaGFzZSldID0gYWJzKGlucHV0KTtcbiAgICAgICAgcGhhc2UrKztcbiAgICAgICAgaWYgKHBoYXNlID4gZ2VuaXNoLnN1Yihwcm9wcy5idWZmZXJTaXplLCAxKSkge1xuICAgICAgICAgIHBoYXNlID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfTtcblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoZm9sbG93LmluLCBpbnB1dCwgJ2ZvbGxvd19pbicsIHByb3BzLCBjYWxsYmFjayk7XG5cbiAgICAgIC8vIGxvdHMgb2Ygbm9uc2Vuc2UgdG8gbWFrZSBvdXIgY3VzdG9tIGZ1bmN0aW9uIHdvcmtcbiAgICAgIGZvbGxvdy5pbi5jYWxsYmFjay51Z2VuTmFtZSA9IGZvbGxvdy5pbi51Z2VuTmFtZSA9IGBmb2xsb3dfaW5fJHsgZm9sbG93LmlkIH1gO1xuICAgICAgZm9sbG93LmluLmlucHV0TmFtZXMgPSBbJ2lucHV0J107XG4gICAgICBmb2xsb3cuaW4uaW5wdXRzID0gW2lucHV0XTtcbiAgICAgIGZvbGxvdy5pbi5pbnB1dCA9IHByb3BzLmlucHV0O1xuICAgICAgZm9sbG93LmluLnR5cGUgPSAnYW5hbHlzaXMnO1xuXG4gICAgICBpZiAoR2liYmVyaXNoLmFuYWx5emVycy5pbmRleE9mKGZvbGxvdy5pbikgPT09IC0xKSB7XG4gICAgICAgIEdpYmJlcmlzaC5hbmFseXplcnMucHVzaChmb2xsb3cuaW4pO1xuICAgICAgfVxuXG4gICAgICBHaWJiZXJpc2guZGlydHkoR2liYmVyaXNoLmFuYWx5emVycyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZvbGxvdztcbiAgfTtcblxuICBGb2xsb3cuZGVmYXVsdHMgPSB7XG4gICAgYnVmZmVyU2l6ZTogODE5MlxuICB9O1xuXG4gIHJldHVybiBGb2xsb3c7XG59OyIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgYW5hbHl6ZXIgPSByZXF1aXJlKCAnLi9hbmFseXplci5qcycgKSxcbiAgICAgIHByb3h5ICAgID0gcmVxdWlyZSggJy4uL3dvcmtsZXRQcm94eS5qcycgKSxcbiAgICAgIHVnZW4gICAgID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxuY29uc3QgRGVsYXkgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHNzZCA9IE9iamVjdC5jcmVhdGUoIGFuYWx5emVyIClcbiAgc3NkLl9faW4gID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gIHNzZC5fX291dCA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG4gIHNzZC5pZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG5cbiAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgRGVsYXkuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pc1N0ZXJlbyBcbiAgXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKVxuICAgIFxuICBsZXQgaGlzdG9yeUwgPSBnLmhpc3RvcnkoKVxuXG4gIGlmKCBpc1N0ZXJlbyApIHtcbiAgICAvLyByaWdodCBjaGFubmVsXG4gICAgbGV0IGhpc3RvcnlSID0gZy5oaXN0b3J5KClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIHNzZC5fX291dCxcbiAgICAgIFsgaGlzdG9yeUwub3V0LCBoaXN0b3J5Ui5vdXQgXSwgXG4gICAgICAnc3NkX291dCcsIFxuICAgICAgcHJvcHMsXG4gICAgICBudWxsLFxuICAgICAgZmFsc2VcbiAgICApXG5cbiAgICBzc2QuX19vdXQuY2FsbGJhY2sudWdlbk5hbWUgPSBzc2QuX19vdXQudWdlbk5hbWUgPSAnc3NkX291dCcgKyBzc2QuaWRcblxuICAgIGNvbnN0IGlkeEwgPSBzc2QuX19vdXQuZ3JhcGgubWVtb3J5LnZhbHVlLmlkeCwgXG4gICAgICAgICAgaWR4UiA9IGlkeEwgKyAxLFxuICAgICAgICAgIG1lbW9yeSA9IEdpYmJlcmlzaC5nZW5pc2guZ2VuLm1lbW9yeS5oZWFwXG5cbiAgICBjb25zdCBjYWxsYmFjayA9IGZ1bmN0aW9uKCBpbnB1dCApIHtcbiAgICAgICd1c2Ugc3RyaWN0J1xuICAgICAgbWVtb3J5WyBpZHhMIF0gPSBpbnB1dFswXVxuICAgICAgbWVtb3J5WyBpZHhSIF0gPSBpbnB1dFsxXVxuICAgICAgcmV0dXJuIDAgICAgIFxuICAgIH1cbiAgICBcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggc3NkLmluLCBbIGlucHV0WzBdLGlucHV0WzFdIF0sICdzc2RfaW4nLCBwcm9wcywgY2FsbGJhY2ssIGZhbHNlIClcblxuICAgIGNhbGxiYWNrLnVnZW5OYW1lID0gc3NkLmluLnVnZW5OYW1lID0gJ3NzZF9pbl8nICsgc3NkLmlkXG4gICAgc3NkLmluLmlucHV0TmFtZXMgPSBbICdpbnB1dCcgXVxuICAgIHNzZC5pbi5pbnB1dHMgPSBbIHByb3BzLmlucHV0IF1cbiAgICBzc2QuaW4uaW5wdXQgPSBwcm9wcy5pbnB1dFxuICAgIHNzZC50eXBlID0gJ2FuYWx5c2lzJ1xuXG4gICAgc3NkLmluLmxpc3RlbiA9IGZ1bmN0aW9uKCB1Z2VuICkge1xuICAgICAgaWYoIHVnZW4gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc3NkLmluLmlucHV0ID0gdWdlblxuICAgICAgICBzc2QuaW4uaW5wdXRzID0gWyB1Z2VuIF1cbiAgICAgIH1cblxuICAgICAgaWYoIEdpYmJlcmlzaC5hbmFseXplcnMuaW5kZXhPZiggc3NkLmluICkgPT09IC0xICkge1xuICAgICAgICBHaWJiZXJpc2guYW5hbHl6ZXJzLnB1c2goIHNzZC5pbiApXG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC5kaXJ0eSggR2liYmVyaXNoLmFuYWx5emVycyApXG4gICAgfVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggc3NkLl9fb3V0LCBoaXN0b3J5TC5vdXQsICdzc2Rfb3V0JywgcHJvcHMsIG51bGwsIGZhbHNlIClcblxuICAgIHNzZC5fX291dC5jYWxsYmFjay51Z2VuTmFtZSA9IHNzZC5fX291dC51Z2VuTmFtZSA9ICdzc2Rfb3V0JyArIHNzZC5pZFxuXG4gICAgbGV0IGlkeCA9IHNzZC5fX291dC5ncmFwaC5tZW1vcnkudmFsdWUuaWR4IFxuICAgIGxldCBtZW1vcnkgPSBHaWJiZXJpc2guZ2VuaXNoLmdlbi5tZW1vcnkuaGVhcFxuICAgIGxldCBjYWxsYmFjayA9IGZ1bmN0aW9uKCBpbnB1dCApIHtcbiAgICAgICd1c2Ugc3RyaWN0J1xuICAgICAgbWVtb3J5WyBpZHggXSA9IGlucHV0XG4gICAgICByZXR1cm4gMCAgICAgXG4gICAgfVxuICAgIFxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzc2QuX19pbiwgaW5wdXQsICdzc2RfaW4nLCB7fSwgY2FsbGJhY2ssIGZhbHNlIClcblxuICAgIGNhbGxiYWNrLnVnZW5OYW1lID0gc3NkLl9faW4udWdlbk5hbWUgPSAnc3NkX2luXycgKyBzc2QuaWRcbiAgICBzc2QuX19pbi5pbnB1dE5hbWVzID0gWyAnaW5wdXQnIF1cbiAgICBzc2QuX19pbi5pbnB1dHMgPSBbIHByb3BzLmlucHV0IF1cbiAgICBzc2QuX19pbi5pbnB1dCA9IHByb3BzLmlucHV0XG4gICAgc3NkLnR5cGUgPSAnYW5hbHlzaXMnXG5cbiAgICBzc2QuX19pbi5saXN0ZW4gPSBmdW5jdGlvbiggdWdlbiApIHtcbiAgICAgIC8vY29uc29sZS5sb2coICdsaXN0ZW5pbmc6JywgdWdlbiwgR2liYmVyaXNoLm1vZGUgKVxuICAgICAgaWYoIHVnZW4gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc3NkLl9faW4uaW5wdXQgPSB1Z2VuXG4gICAgICAgIHNzZC5fX2luLmlucHV0cyA9IFsgdWdlbiBdXG4gICAgICB9XG5cbiAgICAgIGlmKCBHaWJiZXJpc2guYW5hbHl6ZXJzLmluZGV4T2YoIHNzZC5fX2luICkgPT09IC0xICkge1xuICAgICAgICBpZiggR2liYmVyaXNoLm1vZGUgPT09ICd3b3JrbGV0JyApIHtcbiAgICAgICAgICBHaWJiZXJpc2guYW5hbHl6ZXJzLnB1c2goIHsgaWQ6c3NkLmlkLCBwcm9wOidpbicgfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgR2liYmVyaXNoLmFuYWx5emVycy5wdXNoKCBzc2QuX19pbiApXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgR2liYmVyaXNoLmRpcnR5KCBHaWJiZXJpc2guYW5hbHl6ZXJzIClcbiAgICAgIC8vY29uc29sZS5sb2coICdpbjonLCBzc2QuX19pbiApXG4gICAgfVxuXG4gIH1cblxuICBzc2QubGlzdGVuID0gc3NkLl9faW4ubGlzdGVuXG4gIHNzZC5fX2luLnR5cGUgPSAnYW5hbHlzaXMnXG5cbiBcbiAgc3NkLl9fb3V0LmlucHV0cyA9IFtdXG5cbiAgY29uc3Qgb3V0ID0gIHByb3h5KCBbJ2FuYWx5c2lzJywnU1NEJ10sIHByb3BzLCBzc2QgKVxuICBcbiAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIG91dCwge1xuICAgICdvdXQnOiB7XG4gICAgICBzZXQodikge30sXG4gICAgICBnZXQoKSB7XG4gICAgICAgIGlmKCBHaWJiZXJpc2gubW9kZSA9PT0gJ3dvcmtsZXQnICkge1xuICAgICAgICAgIHJldHVybiB7IGlkOm91dC5pZCwgcHJvcDonb3V0JyB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHJldHVybiBvdXQuX19vdXRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgLy8naW4nOiB7XG4gICAgLy8gIHNldCh2KSB7fSxcbiAgICAvLyAgZ2V0KCkge1xuICAgIC8vICAgIGlmKCBHaWJiZXJpc2gubW9kZSA9PT0gJ3dvcmtsZXQnICkge1xuICAgIC8vICAgICAgY29uc29sZS5sb2coICdyZXR1cm5pbmcgc3NkIGluJyApXG4gICAgLy8gICAgICByZXR1cm4geyBpZDpvdXQuaWQsIHByb3A6J2luJyB9XG4gICAgLy8gICAgfWVsc2V7XG4gICAgLy8gICAgICByZXR1cm4gb3V0Ll9faW5cbiAgICAvLyAgICB9XG4gICAgLy8gIH1cbiAgICAvL30sXG5cbiAgfSlcblxuICByZXR1cm4gb3V0XG59XG5cbkRlbGF5LmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBpc1N0ZXJlbzpmYWxzZVxufVxuXG5yZXR1cm4gRGVsYXlcblxufVxuIiwiY29uc3QgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IEFEID0gZnVuY3Rpb24oIGFyZ3VtZW50UHJvcHMgKSB7XG4gICAgY29uc3QgYWQgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICksXG4gICAgICAgICAgYXR0YWNrICA9IGcuaW4oICdhdHRhY2snICksXG4gICAgICAgICAgZGVjYXkgICA9IGcuaW4oICdkZWNheScgKVxuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQUQuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgY29uc3QgZ3JhcGggPSBnLmFkKCBhdHRhY2ssIGRlY2F5LCB7IHNoYXBlOnByb3BzLnNoYXBlLCBhbHBoYTpwcm9wcy5hbHBoYSB9KVxuXG4gICAgYWQudHJpZ2dlciA9IGdyYXBoLnRyaWdnZXJcbiAgICBcbiAgICBjb25zdCBfX291dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBhZCwgZ3JhcGgsIFsnZW52ZWxvcGVzJywnQUQnXSwgcHJvcHMgKVxuXG4gICAgcmV0dXJuIF9fb3V0XG4gIH1cblxuICBBRC5kZWZhdWx0cyA9IHsgYXR0YWNrOjQ0MTAwLCBkZWNheTo0NDEwMCwgc2hhcGU6J2V4cG9uZW50aWFsJywgYWxwaGE6NSB9IFxuXG4gIHJldHVybiBBRFxuXG59XG4iLCJjb25zdCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICksXG4gICAgICBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgQURTUiA9IGZ1bmN0aW9uKCBhcmd1bWVudFByb3BzICkge1xuICAgIGNvbnN0IGFkc3IgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApLFxuICAgICAgICAgIGF0dGFjayAgPSBnLmluKCAnYXR0YWNrJyApLFxuICAgICAgICAgIGRlY2F5ICAgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgICAgc3VzdGFpbiA9IGcuaW4oICdzdXN0YWluJyApLFxuICAgICAgICAgIHJlbGVhc2UgPSBnLmluKCAncmVsZWFzZScgKSxcbiAgICAgICAgICBzdXN0YWluTGV2ZWwgPSBnLmluKCAnc3VzdGFpbkxldmVsJyApXG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBBRFNSLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIE9iamVjdC5hc3NpZ24oIGFkc3IsIHByb3BzIClcblxuICAgIGNvbnN0IGdyYXBoID0gZy5hZHNyKCBcbiAgICAgIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHN1c3RhaW5MZXZlbCwgcmVsZWFzZSwgXG4gICAgICB7IHRyaWdnZXJSZWxlYXNlOiBwcm9wcy50cmlnZ2VyUmVsZWFzZSwgc2hhcGU6cHJvcHMuc2hhcGUsIGFscGhhOnByb3BzLmFscGhhIH0gXG4gICAgKVxuXG4gICAgYWRzci50cmlnZ2VyID0gZ3JhcGgudHJpZ2dlclxuICAgIGFkc3IuYWR2YW5jZSA9IGdyYXBoLnJlbGVhc2VcblxuICAgIGNvbnN0IF9fb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIGFkc3IsIGdyYXBoLCBbJ2VudmVsb3BlcycsJ0FEU1InXSwgcHJvcHMgKVxuXG4gICAgcmV0dXJuIF9fb3V0IFxuICB9XG5cbiAgQURTUi5kZWZhdWx0cyA9IHsgXG4gICAgYXR0YWNrOjIyMDUwLCBcbiAgICBkZWNheToyMjA1MCwgXG4gICAgc3VzdGFpbjo0NDEwMCwgXG4gICAgc3VzdGFpbkxldmVsOi42LCBcbiAgICByZWxlYXNlOiA0NDEwMCwgXG4gICAgdHJpZ2dlclJlbGVhc2U6ZmFsc2UsXG4gICAgc2hhcGU6J2V4cG9uZW50aWFsJyxcbiAgICBhbHBoYTo1IFxuICB9IFxuXG4gIHJldHVybiBBRFNSXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgRW52ZWxvcGVzID0ge1xuICAgIEFEICAgICA6IHJlcXVpcmUoICcuL2FkLmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgICBBRFNSICAgOiByZXF1aXJlKCAnLi9hZHNyLmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgICBSYW1wICAgOiByZXF1aXJlKCAnLi9yYW1wLmpzJyApKCBHaWJiZXJpc2ggKSxcblxuICAgIGV4cG9ydCA6IHRhcmdldCA9PiB7XG4gICAgICBmb3IoIGxldCBrZXkgaW4gRW52ZWxvcGVzICkge1xuICAgICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyAmJiBrZXkgIT09ICdmYWN0b3J5JyApIHtcbiAgICAgICAgICB0YXJnZXRbIGtleSBdID0gRW52ZWxvcGVzWyBrZXkgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGZhY3RvcnkoIHVzZUFEU1IsIHNoYXBlLCBhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCBzdXN0YWluTGV2ZWwsIHJlbGVhc2UsIHRyaWdnZXJSZWxlYXNlPWZhbHNlICkge1xuICAgICAgbGV0IGVudlxuXG4gICAgICAvLyBkZWxpYmVyYXRlIHVzZSBvZiBzaW5nbGUgPSB0byBhY2NvbW9kYXRlIGJvdGggMSBhbmQgdHJ1ZVxuICAgICAgaWYoIHVzZUFEU1IgIT0gdHJ1ZSApIHtcbiAgICAgICAgZW52ID0gZy5hZCggYXR0YWNrLCBkZWNheSwgeyBzaGFwZSB9KSBcbiAgICAgIH1lbHNlIHtcbiAgICAgICAgZW52ID0gZy5hZHNyKCBhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCBzdXN0YWluTGV2ZWwsIHJlbGVhc2UsIHsgc2hhcGUsIHRyaWdnZXJSZWxlYXNlIH0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBlbnZcbiAgICB9XG4gIH0gXG5cbiAgcmV0dXJuIEVudmVsb3Blc1xufVxuIiwiY29uc3QgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IFJhbXAgPSBmdW5jdGlvbiggYXJndW1lbnRQcm9wcyApIHtcbiAgICBjb25zdCByYW1wICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICksXG4gICAgICAgICAgbGVuZ3RoID0gZy5pbiggJ2xlbmd0aCcgKSxcbiAgICAgICAgICBmcm9tICAgPSBnLmluKCAnZnJvbScgKSxcbiAgICAgICAgICB0byAgICAgPSBnLmluKCAndG8nIClcblxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgUmFtcC5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBjb25zdCByZXNldCA9IGcuYmFuZygpXG5cbiAgICBjb25zdCBwaGFzZSA9IGcuYWNjdW0oIGcuZGl2KCAxLCBsZW5ndGggKSwgcmVzZXQsIHsgc2hvdWxkV3JhcDpwcm9wcy5zaG91bGRMb29wLCBzaG91bGRDbGFtcDp0cnVlIH0pLFxuICAgICAgICAgIGRpZmYgPSBnLnN1YiggdG8sIGZyb20gKSxcbiAgICAgICAgICBncmFwaCA9IGcuYWRkKCBmcm9tLCBnLm11bCggcGhhc2UsIGRpZmYgKSApXG4gICAgICAgIFxuICAgIHJhbXAudHJpZ2dlciA9IHJlc2V0LnRyaWdnZXJcblxuICAgIGNvbnN0IG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCByYW1wLCBncmFwaCwgWydlbnZlbG9wZXMnLCdyYW1wJ10sIHByb3BzIClcblxuXG4gICAgcmV0dXJuIG91dFxuICB9XG5cbiAgUmFtcC5kZWZhdWx0cyA9IHsgZnJvbTowLCB0bzoxLCBsZW5ndGg6Zy5nZW4uc2FtcGxlcmF0ZSwgc2hvdWxkTG9vcDpmYWxzZSB9XG5cbiAgcmV0dXJuIFJhbXBcblxufVxuIiwiLypcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRpbWF0dGVyMTUvaGVhcHF1ZXVlLmpzL2Jsb2IvbWFzdGVyL2hlYXBxdWV1ZS5qc1xuICpcbiAqIFRoaXMgaW1wbGVtZW50YXRpb24gaXMgdmVyeSBsb29zZWx5IGJhc2VkIG9mZiBqcy1wcmlvcml0eS1xdWV1ZVxuICogYnkgQWRhbSBIb29wZXIgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYWRhbWhvb3Blci9qcy1wcmlvcml0eS1xdWV1ZVxuICpcbiAqIFRoZSBqcy1wcmlvcml0eS1xdWV1ZSBpbXBsZW1lbnRhdGlvbiBzZWVtZWQgYSB0ZWVuc3kgYml0IGJsb2F0ZWRcbiAqIHdpdGggaXRzIHJlcXVpcmUuanMgZGVwZW5kZW5jeSBhbmQgbXVsdGlwbGUgc3RvcmFnZSBzdHJhdGVnaWVzXG4gKiB3aGVuIGFsbCBidXQgb25lIHdlcmUgc3Ryb25nbHkgZGlzY291cmFnZWQuIFNvIGhlcmUgaXMgYSBraW5kIG9mXG4gKiBjb25kZW5zZWQgdmVyc2lvbiBvZiB0aGUgZnVuY3Rpb25hbGl0eSB3aXRoIG9ubHkgdGhlIGZlYXR1cmVzIHRoYXRcbiAqIEkgcGFydGljdWxhcmx5IG5lZWRlZC5cbiAqXG4gKiBVc2luZyBpdCBpcyBwcmV0dHkgc2ltcGxlLCB5b3UganVzdCBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgSGVhcFF1ZXVlXG4gKiB3aGlsZSBvcHRpb25hbGx5IHNwZWNpZnlpbmcgYSBjb21wYXJhdG9yIGFzIHRoZSBhcmd1bWVudDpcbiAqXG4gKiB2YXIgaGVhcHEgPSBuZXcgSGVhcFF1ZXVlKCk7XG4gKlxuICogdmFyIGN1c3RvbXEgPSBuZXcgSGVhcFF1ZXVlKGZ1bmN0aW9uKGEsIGIpe1xuICogICAvLyBpZiBiID4gYSwgcmV0dXJuIG5lZ2F0aXZlXG4gKiAgIC8vIG1lYW5zIHRoYXQgaXQgc3BpdHMgb3V0IHRoZSBzbWFsbGVzdCBpdGVtIGZpcnN0XG4gKiAgIHJldHVybiBhIC0gYjtcbiAqIH0pO1xuICpcbiAqIE5vdGUgdGhhdCBpbiB0aGlzIGNhc2UsIHRoZSBkZWZhdWx0IGNvbXBhcmF0b3IgaXMgaWRlbnRpY2FsIHRvXG4gKiB0aGUgY29tcGFyYXRvciB3aGljaCBpcyB1c2VkIGV4cGxpY2l0bHkgaW4gdGhlIHNlY29uZCBxdWV1ZS5cbiAqXG4gKiBPbmNlIHlvdSd2ZSBpbml0aWFsaXplZCB0aGUgaGVhcHF1ZXVlLCB5b3UgY2FuIHBsb3Agc29tZSBuZXdcbiAqIGVsZW1lbnRzIGludG8gdGhlIHF1ZXVlIHdpdGggdGhlIHB1c2ggbWV0aG9kICh2YWd1ZWx5IHJlbWluaXNjZW50XG4gKiBvZiB0eXBpY2FsIGphdmFzY3JpcHQgYXJheXMpXG4gKlxuICogaGVhcHEucHVzaCg0Mik7XG4gKiBoZWFwcS5wdXNoKFwia2l0dGVuXCIpO1xuICpcbiAqIFRoZSBwdXNoIG1ldGhvZCByZXR1cm5zIHRoZSBuZXcgbnVtYmVyIG9mIGVsZW1lbnRzIG9mIHRoZSBxdWV1ZS5cbiAqXG4gKiBZb3UgY2FuIHB1c2ggYW55dGhpbmcgeW91J2QgbGlrZSBvbnRvIHRoZSBxdWV1ZSwgc28gbG9uZyBhcyB5b3VyXG4gKiBjb21wYXJhdG9yIGZ1bmN0aW9uIGlzIGNhcGFibGUgb2YgaGFuZGxpbmcgaXQuIFRoZSBkZWZhdWx0XG4gKiBjb21wYXJhdG9yIGlzIHJlYWxseSBzdHVwaWQgc28gaXQgd29uJ3QgYmUgYWJsZSB0byBoYW5kbGUgYW55dGhpbmdcbiAqIG90aGVyIHRoYW4gYW4gbnVtYmVyIGJ5IGRlZmF1bHQuXG4gKlxuICogWW91IGNhbiBwcmV2aWV3IHRoZSBzbWFsbGVzdCBpdGVtIGJ5IHVzaW5nIHBlZWsuXG4gKlxuICogaGVhcHEucHVzaCgtOTk5OSk7XG4gKiBoZWFwcS5wZWVrKCk7IC8vID09PiAtOTk5OVxuICpcbiAqIFRoZSB1c2VmdWwgY29tcGxlbWVudCB0byB0byB0aGUgcHVzaCBtZXRob2QgaXMgdGhlIHBvcCBtZXRob2QsXG4gKiB3aGljaCByZXR1cm5zIHRoZSBzbWFsbGVzdCBpdGVtIGFuZCB0aGVuIHJlbW92ZXMgaXQgZnJvbSB0aGVcbiAqIHF1ZXVlLlxuICpcbiAqIGhlYXBxLnB1c2goMSk7XG4gKiBoZWFwcS5wdXNoKDIpO1xuICogaGVhcHEucHVzaCgzKTtcbiAqIGhlYXBxLnBvcCgpOyAvLyA9PT4gMVxuICogaGVhcHEucG9wKCk7IC8vID09PiAyXG4gKiBoZWFwcS5wb3AoKTsgLy8gPT0+IDNcbiAqL1xubGV0IEhlYXBRdWV1ZSA9IGZ1bmN0aW9uKGNtcCl7XG4gIHRoaXMuY21wID0gKGNtcCB8fCBmdW5jdGlvbihhLCBiKXsgcmV0dXJuIGEgLSBiOyB9KTtcbiAgdGhpcy5sZW5ndGggPSAwO1xuICB0aGlzLmRhdGEgPSBbXTtcbn1cbkhlYXBRdWV1ZS5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0aGlzLmRhdGFbMF07XG59O1xuSGVhcFF1ZXVlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24odmFsdWUpe1xuICB0aGlzLmRhdGEucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIHBvcyA9IHRoaXMuZGF0YS5sZW5ndGggLSAxLFxuICBwYXJlbnQsIHg7XG5cbiAgd2hpbGUocG9zID4gMCl7XG4gICAgcGFyZW50ID0gKHBvcyAtIDEpID4+PiAxO1xuICAgIGlmKHRoaXMuY21wKHRoaXMuZGF0YVtwb3NdLCB0aGlzLmRhdGFbcGFyZW50XSkgPCAwKXtcbiAgICAgIHggPSB0aGlzLmRhdGFbcGFyZW50XTtcbiAgICAgIHRoaXMuZGF0YVtwYXJlbnRdID0gdGhpcy5kYXRhW3Bvc107XG4gICAgICB0aGlzLmRhdGFbcG9zXSA9IHg7XG4gICAgICBwb3MgPSBwYXJlbnQ7XG4gICAgfWVsc2UgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIHRoaXMubGVuZ3RoKys7XG59O1xuSGVhcFF1ZXVlLnByb3RvdHlwZS5wb3AgPSBmdW5jdGlvbigpe1xuICB2YXIgbGFzdF92YWwgPSB0aGlzLmRhdGEucG9wKCksXG4gIHJldCA9IHRoaXMuZGF0YVswXTtcbiAgaWYodGhpcy5kYXRhLmxlbmd0aCA+IDApe1xuICAgIHRoaXMuZGF0YVswXSA9IGxhc3RfdmFsO1xuICAgIHZhciBwb3MgPSAwLFxuICAgIGxhc3QgPSB0aGlzLmRhdGEubGVuZ3RoIC0gMSxcbiAgICBsZWZ0LCByaWdodCwgbWluSW5kZXgsIHg7XG4gICAgd2hpbGUoMSl7XG4gICAgICBsZWZ0ID0gKHBvcyA8PCAxKSArIDE7XG4gICAgICByaWdodCA9IGxlZnQgKyAxO1xuICAgICAgbWluSW5kZXggPSBwb3M7XG4gICAgICBpZihsZWZ0IDw9IGxhc3QgJiYgdGhpcy5jbXAodGhpcy5kYXRhW2xlZnRdLCB0aGlzLmRhdGFbbWluSW5kZXhdKSA8IDApIG1pbkluZGV4ID0gbGVmdDtcbiAgICAgIGlmKHJpZ2h0IDw9IGxhc3QgJiYgdGhpcy5jbXAodGhpcy5kYXRhW3JpZ2h0XSwgdGhpcy5kYXRhW21pbkluZGV4XSkgPCAwKSBtaW5JbmRleCA9IHJpZ2h0O1xuICAgICAgaWYobWluSW5kZXggIT09IHBvcyl7XG4gICAgICAgIHggPSB0aGlzLmRhdGFbbWluSW5kZXhdO1xuICAgICAgICB0aGlzLmRhdGFbbWluSW5kZXhdID0gdGhpcy5kYXRhW3Bvc107XG4gICAgICAgIHRoaXMuZGF0YVtwb3NdID0geDtcbiAgICAgICAgcG9zID0gbWluSW5kZXg7XG4gICAgICB9ZWxzZSBicmVhaztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0ID0gbGFzdF92YWw7XG4gIH1cbiAgdGhpcy5sZW5ndGgtLTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhcFF1ZXVlXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcbiBcbi8vIGNvbnN0cnVjdG9yIGZvciBzY2hyb2VkZXIgYWxscGFzcyBmaWx0ZXJzXG5sZXQgYWxsUGFzcyA9IGZ1bmN0aW9uKCBfaW5wdXQsIGxlbmd0aD01MDAsIGZlZWRiYWNrPS41ICkge1xuICBsZXQgaW5kZXggID0gZy5jb3VudGVyKCAxLDAsbGVuZ3RoICksXG4gICAgICBidWZmZXIgPSBnLmRhdGEoIGxlbmd0aCApLFxuICAgICAgYnVmZmVyU2FtcGxlID0gZy5wZWVrKCBidWZmZXIsIGluZGV4LCB7IGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pLFxuICAgICAgb3V0ID0gZy5tZW1vKCBnLmFkZCggZy5tdWwoIC0xLCBfaW5wdXQpLCBidWZmZXJTYW1wbGUgKSApXG4gICAgICAgICAgICAgICAgXG4gIGcucG9rZSggYnVmZmVyLCBnLmFkZCggX2lucHV0LCBnLm11bCggYnVmZmVyU2FtcGxlLCBmZWVkYmFjayApICksIGluZGV4IClcbiBcbiAgcmV0dXJuIG91dFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFsbFBhc3NcbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBmaWx0ZXIgPSByZXF1aXJlKCAnLi9maWx0ZXIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIEdpYmJlcmlzaC5nZW5pc2guYmlxdWFkID0gKCBpbnB1dCwgY3V0b2ZmLCBfUSwgbW9kZSwgaXNTdGVyZW8gKSA9PiB7XG4gICAgbGV0IGEwLGExLGEyLGMsYjEsYjIsXG4gICAgICAgIGluMWEwLHgxYTEseDJhMix5MWIxLHkyYjIsXG4gICAgICAgIGluMWEwXzEseDFhMV8xLHgyYTJfMSx5MWIxXzEseTJiMl8xXG5cbiAgICBsZXQgcmV0dXJuVmFsdWVcbiAgICBcbiAgICBjb25zdCBRID0gZy5tZW1vKCBnLmFkZCggLjUsIGcubXVsKCBfUSwgMjIgKSApIClcbiAgICBsZXQgeDEgPSBnLmhpc3RvcnkoKSwgeDIgPSBnLmhpc3RvcnkoKSwgeTEgPSBnLmhpc3RvcnkoKSwgeTIgPSBnLmhpc3RvcnkoKVxuICAgIFxuICAgIGxldCB3MCA9IGcubWVtbyggZy5tdWwoIDIgKiBNYXRoLlBJLCBnLmRpdiggY3V0b2ZmLCAgZy5nZW4uc2FtcGxlcmF0ZSApICkgKSxcbiAgICAgICAgc2ludzAgPSBnLnNpbiggdzAgKSxcbiAgICAgICAgY29zdzAgPSBnLmNvcyggdzAgKSxcbiAgICAgICAgYWxwaGEgPSBnLm1lbW8oIGcuZGl2KCBzaW53MCwgZy5tdWwoIDIsIFEgKSApIClcblxuICAgIGxldCBvbmVNaW51c0Nvc1cgPSBnLnN1YiggMSwgY29zdzAgKVxuXG4gICAgc3dpdGNoKCBtb2RlICkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBhMCA9IGcubWVtbyggZy5kaXYoIGcuYWRkKCAxLCBjb3N3MCkgLCAyKSApXG4gICAgICAgIGExID0gZy5tdWwoIGcuYWRkKCAxLCBjb3N3MCApLCAtMSApXG4gICAgICAgIGEyID0gYTBcbiAgICAgICAgYyAgPSBnLmFkZCggMSwgYWxwaGEgKVxuICAgICAgICBiMSA9IGcubXVsKCAtMiAsIGNvc3cwIClcbiAgICAgICAgYjIgPSBnLnN1YiggMSwgYWxwaGEgKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgYTAgPSBnLm11bCggUSwgYWxwaGEgKVxuICAgICAgICBhMSA9IDBcbiAgICAgICAgYTIgPSBnLm11bCggYTAsIC0xIClcbiAgICAgICAgYyAgPSBnLmFkZCggMSwgYWxwaGEgKVxuICAgICAgICBiMSA9IGcubXVsKCAtMiAsIGNvc3cwIClcbiAgICAgICAgYjIgPSBnLnN1YiggMSwgYWxwaGEgKVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6IC8vIExQXG4gICAgICAgIGEwID0gZy5tZW1vKCBnLmRpdiggb25lTWludXNDb3NXLCAyKSApXG4gICAgICAgIGExID0gb25lTWludXNDb3NXXG4gICAgICAgIGEyID0gYTBcbiAgICAgICAgYyAgPSBnLmFkZCggMSwgYWxwaGEgKVxuICAgICAgICBiMSA9IGcubXVsKCAtMiAsIGNvc3cwIClcbiAgICAgICAgYjIgPSBnLnN1YiggMSwgYWxwaGEgKVxuICAgIH1cblxuICAgIGEwID0gZy5kaXYoIGEwLCBjICk7IGExID0gZy5kaXYoIGExLCBjICk7IGEyID0gZy5kaXYoIGEyLCBjIClcbiAgICBiMSA9IGcuZGl2KCBiMSwgYyApOyBiMiA9IGcuZGl2KCBiMiwgYyApXG5cbiAgICBpbjFhMCA9IGcubXVsKCB4MS5pbiggaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0ICksIGEwIClcbiAgICB4MWExICA9IGcubXVsKCB4Mi5pbiggeDEub3V0ICksIGExIClcbiAgICB4MmEyICA9IGcubXVsKCB4Mi5vdXQsICAgICAgICAgIGEyIClcblxuICAgIGxldCBzdW1MZWZ0ID0gZy5hZGQoIGluMWEwLCB4MWExLCB4MmEyIClcblxuICAgIHkxYjEgPSBnLm11bCggeTIuaW4oIHkxLm91dCApLCBiMSApXG4gICAgeTJiMiA9IGcubXVsKCB5Mi5vdXQsIGIyIClcblxuICAgIGxldCBzdW1SaWdodCA9IGcuYWRkKCB5MWIxLCB5MmIyIClcblxuICAgIGxldCBkaWZmID0gZy5zdWIoIHN1bUxlZnQsIHN1bVJpZ2h0IClcblxuICAgIHkxLmluKCBkaWZmIClcblxuICAgIGlmKCBpc1N0ZXJlbyApIHtcbiAgICAgIGxldCB4MV8xID0gZy5oaXN0b3J5KCksIHgyXzEgPSBnLmhpc3RvcnkoKSwgeTFfMSA9IGcuaGlzdG9yeSgpLCB5Ml8xID0gZy5oaXN0b3J5KClcblxuICAgICAgaW4xYTBfMSA9IGcubXVsKCB4MV8xLmluKCBpbnB1dFsxXSApLCBhMCApXG4gICAgICB4MWExXzEgID0gZy5tdWwoIHgyXzEuaW4oIHgxXzEub3V0ICksIGExIClcbiAgICAgIHgyYTJfMSAgPSBnLm11bCggeDJfMS5vdXQsICAgICAgICAgICAgYTIgKVxuXG4gICAgICBsZXQgc3VtTGVmdF8xID0gZy5hZGQoIGluMWEwXzEsIHgxYTFfMSwgeDJhMl8xIClcblxuICAgICAgeTFiMV8xID0gZy5tdWwoIHkyXzEuaW4oIHkxXzEub3V0ICksIGIxIClcbiAgICAgIHkyYjJfMSA9IGcubXVsKCB5Ml8xLm91dCwgYjIgKVxuXG4gICAgICBsZXQgc3VtUmlnaHRfMSA9IGcuYWRkKCB5MWIxXzEsIHkyYjJfMSApXG5cbiAgICAgIGxldCBkaWZmXzEgPSBnLnN1Yiggc3VtTGVmdF8xLCBzdW1SaWdodF8xIClcblxuICAgICAgeTFfMS5pbiggZGlmZl8xIClcbiAgICAgIFxuICAgICAgcmV0dXJuVmFsdWUgPSBbIGRpZmYsIGRpZmZfMSBdXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm5WYWx1ZSA9IGRpZmZcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxuXG4gIGxldCBCaXF1YWQgPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgYmlxdWFkID0gT2JqZWN0LmNyZWF0ZSggZmlsdGVyIClcbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQmlxdWFkLmRlZmF1bHRzLCBpbnB1dFByb3BzICkgXG4gICAgXG4gICAgT2JqZWN0LmFzc2lnbiggYmlxdWFkLCBwcm9wcyApXG5cbiAgICBsZXQgaXNTdGVyZW8gPSBiaXF1YWQuaW5wdXQuaXNTdGVyZW9cblxuICAgIGJpcXVhZC5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgICBiaXF1YWQuZ3JhcGggPSBHaWJiZXJpc2guZ2VuaXNoLmJpcXVhZCggZy5pbignaW5wdXQnKSwgZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBnLmdlbi5zYW1wbGVyYXRlIC8gNCApLCAgZy5pbignUScpLCBiaXF1YWQubW9kZSwgaXNTdGVyZW8gKVxuICAgIH1cblxuICAgIGJpcXVhZC5fX2NyZWF0ZUdyYXBoKClcbiAgICBiaXF1YWQuX19yZXF1aXJlc1JlY29tcGlsYXRpb24gPSBbICdtb2RlJyBdXG5cbiAgICBjb25zdCBfX291dCA9IEdpYmJlcmlzaC5mYWN0b3J5KFxuICAgICAgYmlxdWFkLFxuICAgICAgYmlxdWFkLmdyYXBoLFxuICAgICAgWydmaWx0ZXJzJywnRmlsdGVyMTJCaXF1YWQnXSwgXG4gICAgICBwcm9wc1xuICAgIClcblxuICAgIHJldHVybiBfX291dFxuICB9XG5cbiAgQmlxdWFkLmRlZmF1bHRzID0ge1xuICAgIGlucHV0OjAsXG4gICAgUTogLjE1LFxuICAgIGN1dG9mZjouMDUsXG4gICAgbW9kZTowXG4gIH1cblxuICByZXR1cm4gQmlxdWFkXG5cbn1cblxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbmxldCBjb21iRmlsdGVyID0gZnVuY3Rpb24oIF9pbnB1dCwgY29tYkxlbmd0aCwgZGFtcGluZz0uNSouNCwgZmVlZGJhY2tDb2VmZj0uODQgKSB7XG4gIGxldCBsYXN0U2FtcGxlICAgPSBnLmhpc3RvcnkoKSxcbiAgXHQgIHJlYWRXcml0ZUlkeCA9IGcuY291bnRlciggMSwwLGNvbWJMZW5ndGggKSxcbiAgICAgIGNvbWJCdWZmZXIgICA9IGcuZGF0YSggY29tYkxlbmd0aCApLFxuXHQgICAgb3V0ICAgICAgICAgID0gZy5wZWVrKCBjb21iQnVmZmVyLCByZWFkV3JpdGVJZHgsIHsgaW50ZXJwOidub25lJywgbW9kZTonc2FtcGxlcycgfSksXG4gICAgICBzdG9yZUlucHV0ICAgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggb3V0LCBnLnN1YiggMSwgZGFtcGluZykpLCBnLm11bCggbGFzdFNhbXBsZS5vdXQsIGRhbXBpbmcgKSApIClcbiAgICAgIFxuICBsYXN0U2FtcGxlLmluKCBzdG9yZUlucHV0IClcbiBcbiAgZy5wb2tlKCBjb21iQnVmZmVyLCBnLmFkZCggX2lucHV0LCBnLm11bCggc3RvcmVJbnB1dCwgZmVlZGJhY2tDb2VmZiApICksIHJlYWRXcml0ZUlkeCApXG4gXG4gIHJldHVybiBvdXRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb21iRmlsdGVyXG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGZpbHRlciA9IHJlcXVpcmUoICcuL2ZpbHRlci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIEdpYmJlcmlzaC5nZW5pc2guZGlvZGVaREYgPSAoIGlucHV0LCBfUSwgZnJlcSwgc2F0dXJhdGlvbiwgaXNTdGVyZW89ZmFsc2UgKSA9PiB7XG4gICAgY29uc3QgaVQgPSAxIC8gZy5nZW4uc2FtcGxlcmF0ZSxcbiAgICAgICAgICBrejEgPSBnLmhpc3RvcnkoMCksXG4gICAgICAgICAga3oyID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIGt6MyA9IGcuaGlzdG9yeSgwKSxcbiAgICAgICAgICBrejQgPSBnLmhpc3RvcnkoMClcblxuICAgIGxldCAgIGthMSA9IDEuMCxcbiAgICAgICAgICBrYTIgPSAwLjUsXG4gICAgICAgICAga2EzID0gMC41LFxuICAgICAgICAgIGthNCA9IDAuNSxcbiAgICAgICAgICBraW5keCA9IDAgICBcblxuICAgIGNvbnN0IFEgPSBnLm1lbW8oIGcuYWRkKCAuNSwgZy5tdWwoIF9RLCAxMSApICkgKVxuICAgIC8vIGt3ZCA9IDIgKiAkTV9QSSAqIGFjZltraW5keF1cbiAgICBjb25zdCBrd2QgPSBnLm1lbW8oIGcubXVsKCBNYXRoLlBJICogMiwgZnJlcSApIClcblxuICAgIC8vIGt3YSA9ICgyL2lUKSAqIHRhbihrd2QgKiBpVC8yKSBcbiAgICBjb25zdCBrd2EgPWcubWVtbyggZy5tdWwoIDIvaVQsIGcudGFuKCBnLm11bCgga3dkLCBpVC8yICkgKSApIClcblxuICAgIC8vIGtHICA9IGt3YSAqIGlULzIgXG4gICAgY29uc3Qga2cgPSBnLm1lbW8oIGcubXVsKCBrd2EsIGlULzIgKSApXG4gICAgXG4gICAgY29uc3Qga0c0ID0gZy5tZW1vKCBnLm11bCggLjUsIGcuZGl2KCBrZywgZy5hZGQoIDEsIGtnICkgKSApIClcbiAgICBjb25zdCBrRzMgPSBnLm1lbW8oIGcubXVsKCAuNSwgZy5kaXYoIGtnLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBnLm11bCggLjUsIGtnICksIGtHNCApICkgKSApIClcbiAgICBjb25zdCBrRzIgPSBnLm1lbW8oIGcubXVsKCAuNSwgZy5kaXYoIGtnLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBnLm11bCggLjUsIGtnICksIGtHMyApICkgKSApIClcbiAgICBjb25zdCBrRzEgPSBnLm1lbW8oIGcuZGl2KCBrZywgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCgga2csIGtHMiApICkgKSApXG5cbiAgICBjb25zdCBrR0FNTUEgPSBnLm1lbW8oIGcubXVsKCBnLm11bCgga0c0LCBrRzMgKSAsIGcubXVsKCBrRzIsIGtHMSApICkgKVxuXG4gICAgY29uc3Qga1NHMSA9IGcubWVtbyggZy5tdWwoIGcubXVsKCBrRzQsIGtHMyApLCBrRzIgKSApIFxuXG4gICAgY29uc3Qga1NHMiA9IGcubWVtbyggZy5tdWwoIGtHNCwga0czKSApICBcbiAgICBjb25zdCBrU0czID0ga0c0IFxuICAgIGxldCBrU0c0ID0gMS4wIFxuICAgIC8vIGtrID0gNC4wKihrUSAtIDAuNSkvKDI1LjAgLSAwLjUpXG4gICAgY29uc3Qga2FscGhhID0gZy5tZW1vKCBnLmRpdigga2csIGcuYWRkKDEuMCwga2cpICkgKVxuXG4gICAgY29uc3Qga2JldGExID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBrZywga0cyICkgKSApIClcbiAgICBjb25zdCBrYmV0YTIgPSBnLm1lbW8oIGcuZGl2KCAxLjAsIGcuc3ViKCBnLmFkZCggMSwga2cgKSwgZy5tdWwoIGcubXVsKCAuNSwga2cgKSwga0czICkgKSApIClcbiAgICBjb25zdCBrYmV0YTMgPSBnLm1lbW8oIGcuZGl2KCAxLjAsIGcuc3ViKCBnLmFkZCggMSwga2cgKSwgZy5tdWwoIGcubXVsKCAuNSwga2cgKSwga0c0ICkgKSApIClcbiAgICBjb25zdCBrYmV0YTQgPSBnLm1lbW8oIGcuZGl2KCAxLjAsIGcuYWRkKCAxLCBrZyApICkgKSBcblxuICAgIGNvbnN0IGtnYW1tYTEgPSBnLm1lbW8oIGcuYWRkKCAxLCBnLm11bCgga0cxLCBrRzIgKSApIClcbiAgICBjb25zdCBrZ2FtbWEyID0gZy5tZW1vKCBnLmFkZCggMSwgZy5tdWwoIGtHMiwga0czICkgKSApXG4gICAgY29uc3Qga2dhbW1hMyA9IGcubWVtbyggZy5hZGQoIDEsIGcubXVsKCBrRzMsIGtHNCApICkgKVxuXG4gICAgY29uc3Qga2RlbHRhMSA9IGtnXG4gICAgY29uc3Qga2RlbHRhMiA9IGcubWVtbyggZy5tdWwoIDAuNSwga2cgKSApXG4gICAgY29uc3Qga2RlbHRhMyA9IGcubWVtbyggZy5tdWwoIDAuNSwga2cgKSApXG5cbiAgICBjb25zdCBrZXBzaWxvbjEgPSBrRzJcbiAgICBjb25zdCBrZXBzaWxvbjIgPSBrRzNcbiAgICBjb25zdCBrZXBzaWxvbjMgPSBrRzRcblxuICAgIGNvbnN0IGtsYXN0Y3V0ID0gZnJlcVxuXG4gICAgLy87OyBmZWVkYmFjayBpbnB1dHMgXG4gICAgY29uc3Qga2ZiNCA9IGcubWVtbyggZy5tdWwoIGtiZXRhNCAsIGt6NC5vdXQgKSApIFxuICAgIGNvbnN0IGtmYjMgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTMsIGcuYWRkKCBrejMub3V0LCBnLm11bCgga2ZiNCwga2RlbHRhMyApICkgKSApXG4gICAgY29uc3Qga2ZiMiA9IGcubWVtbyggZy5tdWwoIGtiZXRhMiwgZy5hZGQoIGt6Mi5vdXQsIGcubXVsKCBrZmIzLCBrZGVsdGEyICkgKSApIClcblxuICAgIC8vOzsgZmVlZGJhY2sgcHJvY2Vzc1xuXG4gICAgY29uc3Qga2ZibzEgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTEsIGcuYWRkKCBrejEub3V0LCBnLm11bCgga2ZiMiwga2RlbHRhMSApICkgKSApIFxuICAgIGNvbnN0IGtmYm8yID0gZy5tZW1vKCBnLm11bCgga2JldGEyLCBnLmFkZCgga3oyLm91dCwgZy5tdWwoIGtmYjMsIGtkZWx0YTIgKSApICkgKSBcbiAgICBjb25zdCBrZmJvMyA9IGcubWVtbyggZy5tdWwoIGtiZXRhMywgZy5hZGQoIGt6My5vdXQsIGcubXVsKCBrZmI0LCBrZGVsdGEzICkgKSApICkgXG4gICAgY29uc3Qga2ZibzQgPSBrZmI0XG5cbiAgICBjb25zdCBrU0lHTUEgPSBnLm1lbW8oIFxuICAgICAgZy5hZGQoIFxuICAgICAgICBnLmFkZCggXG4gICAgICAgICAgZy5tdWwoIGtTRzEsIGtmYm8xICksIFxuICAgICAgICAgIGcubXVsKCBrU0cyLCBrZmJvMiApXG4gICAgICAgICksIFxuICAgICAgICBnLmFkZChcbiAgICAgICAgICBnLm11bCgga1NHMywga2ZibzMgKSwgXG4gICAgICAgICAgZy5tdWwoIGtTRzQsIGtmYm80IClcbiAgICAgICAgKSBcbiAgICAgICkgXG4gICAgKVxuXG4gICAgLy9jb25zdCBrU0lHTUEgPSAxXG4gICAgLy87OyBub24tbGluZWFyIHByb2Nlc3NpbmdcbiAgICAvL2lmIChrbmxwID09IDEpIHRoZW5cbiAgICAvLyAga2luID0gKDEuMCAvIHRhbmgoa3NhdHVyYXRpb24pKSAqIHRhbmgoa3NhdHVyYXRpb24gKiBraW4pXG4gICAgLy9lbHNlaWYgKGtubHAgPT0gMikgdGhlblxuICAgIC8vICBraW4gPSB0YW5oKGtzYXR1cmF0aW9uICoga2luKSBcbiAgICAvL2VuZGlmXG4gICAgLy9cbiAgICAvL2NvbnN0IGtpbiA9IGlucHV0IFxuICAgIGxldCBraW4gPSBpbnB1dC8vZy5tZW1vKCBnLm11bCggZy5kaXYoIDEsIGcudGFuaCggc2F0dXJhdGlvbiApICksIGcudGFuaCggZy5tdWwoIHNhdHVyYXRpb24sIGlucHV0ICkgKSApIClcbiAgICBraW4gPSBnLnRhbmgoIGcubXVsKCBzYXR1cmF0aW9uLCBraW4gKSApXG5cbiAgICBjb25zdCBrdW4gPSBnLmRpdiggZy5zdWIoIGtpbiwgZy5tdWwoIFEsIGtTSUdNQSApICksIGcuYWRkKCAxLCBnLm11bCggUSwga0dBTU1BICkgKSApXG4gICAgLy9jb25zdCBrdW4gPSBnLmRpdiggMSwgZy5hZGQoIDEsIGcubXVsKCBRLCBrR0FNTUEgKSApIClcbiAgICAgICAgLy8oa2luIC0ga2sgKiBrU0lHTUEpIC8gKDEuMCArIGtrICoga0dBTU1BKVxuXG4gICAgLy87OyAxc3Qgc3RhZ2VcbiAgICBsZXQga3hpbiA9IGcubWVtbyggZy5hZGQoIGcuYWRkKCBnLm11bCgga3VuLCBrZ2FtbWExICksIGtmYjIpLCBnLm11bCgga2Vwc2lsb24xLCBrZmJvMSApICkgKVxuICAgIC8vIChrdW4gKiBrZ2FtbWExICsga2ZiMiArIGtlcHNpbG9uMSAqIGtmYm8xKVxuICAgIGxldCBrdiA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBnLm11bCgga2ExLCBreGluICksIGt6MS5vdXQgKSwga2FscGhhICkgKVxuICAgIC8va3YgPSAoa2ExICoga3hpbiAtIGt6MSkgKiBrYWxwaGEgXG4gICAgbGV0IGtscCA9IGcuYWRkKCBrdiwga3oxLm91dCApXG4gICAgLy9rbHAgPSBrdiArIGt6MVxuICAgIGt6MS5pbiggZy5hZGQoIGtscCwga3YgKSApIFxuICAgIC8va3oxID0ga2xwICsga3ZcblxuICAgICAgICAvLzs7IDJuZCBzdGFnZVxuICAgIC8va3hpbiA9IChrbHAgKiBrZ2FtbWEyICsga2ZiMyArIGtlcHNpbG9uMiAqIGtmYm8yKVxuICAgIC8va3YgPSAoa2EyICoga3hpbiAtIGt6MikgKiBrYWxwaGEgXG4gICAgLy9rbHAgPSBrdiArIGt6MlxuICAgIC8va3oyID0ga2xwICsga3ZcblxuICAgIGt4aW4gPSBnLm1lbW8oIGcuYWRkKCBnLmFkZCggZy5tdWwoIGtscCwga2dhbW1hMiApLCBrZmIzKSwgZy5tdWwoIGtlcHNpbG9uMiwga2ZibzIgKSApIClcbiAgICAvLyAoa3VuICoga2dhbW1hMSArIGtmYjIgKyBrZXBzaWxvbjEgKiBrZmJvMSlcbiAgICBrdiA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBnLm11bCgga2EyLCBreGluICksIGt6Mi5vdXQgKSwga2FscGhhICkgKVxuICAgIC8va3YgPSAoa2ExICoga3hpbiAtIGt6MSkgKiBrYWxwaGEgXG4gICAga2xwID0gZy5hZGQoIGt2LCBrejIub3V0ICkgXG4gICAgLy9rbHAgPSBrdiArIGt6MVxuICAgIGt6Mi5pbiggZy5hZGQoIGtscCwga3YgKSApIFxuICAgIC8va3oxID0ga2xwICsga3ZcblxuICAgIC8vOzsgM3JkIHN0YWdlXG4gICAgLy9reGluID0gKGtscCAqIGtnYW1tYTMgKyBrZmI0ICsga2Vwc2lsb24zICoga2ZibzMpXG4gICAgLy9rdiA9IChrYTMgKiBreGluIC0ga3ozKSAqIGthbHBoYSBcbiAgICAvL2tscCA9IGt2ICsga3ozXG4gICAgLy9rejMgPSBrbHAgKyBrdlxuXG4gICAga3hpbiA9IGcubWVtbyggZy5hZGQoIGcuYWRkKCBnLm11bCgga2xwLCBrZ2FtbWEzICksIGtmYjQpLCBnLm11bCgga2Vwc2lsb24zLCBrZmJvMyApICkgKVxuICAgIC8vIChrdW4gKiBrZ2FtbWExICsga2ZiMiArIGtlcHNpbG9uMSAqIGtmYm8xKVxuICAgIGt2ID0gZy5tZW1vKCBnLm11bCggZy5zdWIoIGcubXVsKCBrYTMsIGt4aW4gKSwga3ozLm91dCApLCBrYWxwaGEgKSApXG4gICAgLy9rdiA9IChrYTEgKiBreGluIC0ga3oxKSAqIGthbHBoYSBcbiAgICBrbHAgPSBnLmFkZCgga3YsIGt6My5vdXQgKVxuICAgIC8va2xwID0ga3YgKyBrejFcbiAgICBrejMuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKVxuICAgIC8va3oxID0ga2xwICsga3ZcblxuICAgIC8vOzsgNHRoIHN0YWdlXG4gICAgLy9rdiA9IChrYTQgKiBrbHAgLSBrejQpICoga2FscGhhIFxuICAgIC8va2xwID0ga3YgKyBrejRcbiAgICAvL2t6NCA9IGtscCArIGt2XG5cbiAgICAvLyAoa3VuICoga2dhbW1hMSArIGtmYjIgKyBrZXBzaWxvbjEgKiBrZmJvMSlcbiAgICBrdiA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBnLm11bCgga2E0LCBreGluICksIGt6NC5vdXQgKSwga2FscGhhICkgKVxuICAgIC8va3YgPSAoa2ExICoga3hpbiAtIGt6MSkgKiBrYWxwaGEgXG4gICAga2xwID0gZy5hZGQoIGt2LCBrejQub3V0IClcbiAgICAvL2tscCA9IGt2ICsga3oxXG4gICAga3o0LmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIC8va3oxID0ga2xwICsga3ZcbiAgICBpZiggaXNTdGVyZW8gKSB7XG4gICAgICAvL2xldCBwb2xlc1IgPSBnLmRhdGEoWyAwLDAsMCwwIF0sIDEsIHsgbWV0YTp0cnVlIH0pLFxuICAgICAgLy8gICAgcmV6elIgPSBnLmNsYW1wKCBnLm11bCggcG9sZXNSWzNdLCByZXogKSApLFxuICAgICAgLy8gICAgb3V0cHV0UiA9IGcuc3ViKCBpbnB1dFsxXSwgcmV6elIgKSAgICAgICAgIFxuXG4gICAgICAvL3BvbGVzUlswXSA9IGcuYWRkKCBwb2xlc1JbMF0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlswXSApLCBvdXRwdXRSICAgKSwgY3V0b2ZmICkpXG4gICAgICAvL3BvbGVzUlsxXSA9IGcuYWRkKCBwb2xlc1JbMV0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlsxXSApLCBwb2xlc1JbMF0gKSwgY3V0b2ZmICkpXG4gICAgICAvL3BvbGVzUlsyXSA9IGcuYWRkKCBwb2xlc1JbMl0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlsyXSApLCBwb2xlc1JbMV0gKSwgY3V0b2ZmICkpXG4gICAgICAvL3BvbGVzUlszXSA9IGcuYWRkKCBwb2xlc1JbM10sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlszXSApLCBwb2xlc1JbMl0gKSwgY3V0b2ZmICkpXG5cbiAgICAgIC8vbGV0IHJpZ2h0ID0gZy5zd2l0Y2goIGlzTG93UGFzcywgcG9sZXNSWzNdLCBnLnN1Yiggb3V0cHV0UiwgcG9sZXNSWzNdICkgKVxuXG4gICAgICAvL3JldHVyblZhbHVlID0gW2xlZnQsIHJpZ2h0XVxuICAgIH1lbHNle1xuICAgICAvLyByZXR1cm5WYWx1ZSA9IGtscFxuICAgIH1cbiAgICAvL3JldHVyblZhbHVlID0ga2xwXG4gICAgXG4gICAgcmV0dXJuIGtscC8vcmV0dXJuVmFsdWUvLyBrbHAvL3JldHVyblZhbHVlXG4gfVxuXG4gIGNvbnN0IERpb2RlWkRGID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgY29uc3QgemRmICAgICAgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIGNvbnN0IHByb3BzICAgID0gT2JqZWN0LmFzc2lnbigge30sIERpb2RlWkRGLmRlZmF1bHRzLCBmaWx0ZXIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gXG5cbiAgICBPYmplY3QuYXNzaWduKCB6ZGYsIHByb3BzIClcblxuICAgIGNvbnN0IF9fb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoXG4gICAgICB6ZGYsIFxuICAgICAgR2liYmVyaXNoLmdlbmlzaC5kaW9kZVpERiggZy5pbignaW5wdXQnKSwgZy5pbignUScpLCBnLmluKCdjdXRvZmYnKSwgZy5pbignc2F0dXJhdGlvbicpLCBpc1N0ZXJlbyApLCBcbiAgICAgIFsnZmlsdGVycycsJ0ZpbHRlcjI0VEIzMDMnXSxcbiAgICAgIHByb3BzXG4gICAgKVxuXG4gICAgcmV0dXJuIF9fb3V0IFxuICB9XG5cbiAgRGlvZGVaREYuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICBROiAuNjUsXG4gICAgc2F0dXJhdGlvbjogMSxcbiAgICBjdXRvZmY6IDg4MCxcbiAgfVxuXG4gIHJldHVybiBEaW9kZVpERlxuXG59XG4iLCJsZXQgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbmxldCBmaWx0ZXIgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuT2JqZWN0LmFzc2lnbiggZmlsdGVyLCB7XG4gIGRlZmF1bHRzOiB7IGJ5cGFzczpmYWxzZSB9IFxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBmaWx0ZXJcbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBmaWx0ZXIgPSByZXF1aXJlKCAnLi9maWx0ZXIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIEdpYmJlcmlzaC5nZW5pc2guZmlsdGVyMjQgPSAoIGlucHV0LCBfcmV6LCBfY3V0b2ZmLCBpc0xvd1Bhc3MsIGlzU3RlcmVvPWZhbHNlICkgPT4ge1xuICAgIGxldCByZXR1cm5WYWx1ZSxcbiAgICAgICAgcG9sZXNMID0gZy5kYXRhKFsgMCwwLDAsMCBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgICAgcGVla1Byb3BzID0geyBpbnRlcnA6J25vbmUnLCBtb2RlOidzaW1wbGUnIH0sXG4gICAgICAgIHJleiA9IGcubWVtbyggZy5tdWwoIF9yZXosIDUgKSApLFxuICAgICAgICBjdXRvZmYgPSBnLm1lbW8oIGcuZGl2KCBfY3V0b2ZmLCAxMTAyNSApICksXG4gICAgICAgIHJlenpMID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzTFszXSwgcmV6ICkgKSxcbiAgICAgICAgb3V0cHV0TCA9IGcuc3ViKCBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXQsIHJlenpMICkgXG5cbiAgICBwb2xlc0xbMF0gPSBnLmFkZCggcG9sZXNMWzBdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc0xbMF0gKSwgb3V0cHV0TCAgICksIGN1dG9mZiApKVxuICAgIHBvbGVzTFsxXSA9IGcuYWRkKCBwb2xlc0xbMV0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzTFsxXSApLCBwb2xlc0xbMF0gKSwgY3V0b2ZmICkpXG4gICAgcG9sZXNMWzJdID0gZy5hZGQoIHBvbGVzTFsyXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNMWzJdICksIHBvbGVzTFsxXSApLCBjdXRvZmYgKSlcbiAgICBwb2xlc0xbM10gPSBnLmFkZCggcG9sZXNMWzNdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc0xbM10gKSwgcG9sZXNMWzJdICksIGN1dG9mZiApKVxuICAgIFxuICAgIGxldCBsZWZ0ID0gZy5zd2l0Y2goIGlzTG93UGFzcywgcG9sZXNMWzNdLCBnLnN1Yiggb3V0cHV0TCwgcG9sZXNMWzNdICkgKVxuXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgbGV0IHBvbGVzUiA9IGcuZGF0YShbIDAsMCwwLDAgXSwgMSwgeyBtZXRhOnRydWUgfSksXG4gICAgICAgICAgcmV6elIgPSBnLmNsYW1wKCBnLm11bCggcG9sZXNSWzNdLCByZXogKSApLFxuICAgICAgICAgIG91dHB1dFIgPSBnLnN1YiggaW5wdXRbMV0sIHJlenpSICkgICAgICAgICBcblxuICAgICAgcG9sZXNSWzBdID0gZy5hZGQoIHBvbGVzUlswXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNSWzBdICksIG91dHB1dFIgICApLCBjdXRvZmYgKSlcbiAgICAgIHBvbGVzUlsxXSA9IGcuYWRkKCBwb2xlc1JbMV0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlsxXSApLCBwb2xlc1JbMF0gKSwgY3V0b2ZmICkpXG4gICAgICBwb2xlc1JbMl0gPSBnLmFkZCggcG9sZXNSWzJdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMl0gKSwgcG9sZXNSWzFdICksIGN1dG9mZiApKVxuICAgICAgcG9sZXNSWzNdID0gZy5hZGQoIHBvbGVzUlszXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNSWzNdICksIHBvbGVzUlsyXSApLCBjdXRvZmYgKSlcblxuICAgICAgbGV0IHJpZ2h0ID0gZy5zd2l0Y2goIGlzTG93UGFzcywgcG9sZXNSWzNdLCBnLnN1Yiggb3V0cHV0UiwgcG9sZXNSWzNdICkgKVxuXG4gICAgICByZXR1cm5WYWx1ZSA9IFtsZWZ0LCByaWdodF1cbiAgICB9ZWxzZXtcbiAgICAgIHJldHVyblZhbHVlID0gbGVmdFxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbiAgbGV0IEZpbHRlcjI0ID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgbGV0IGZpbHRlcjI0ICAgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIGxldCBwcm9wcyAgICA9IE9iamVjdC5hc3NpZ24oIHt9LCBGaWx0ZXIyNC5kZWZhdWx0cywgZmlsdGVyLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyBcblxuICAgIGNvbnN0IF9fb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoXG4gICAgICBmaWx0ZXIyNCwgXG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLmZpbHRlcjI0KCBnLmluKCdpbnB1dCcpLCBnLmluKCdRJyksIGcuaW4oJ2N1dG9mZicpLCBnLmluKCdpc0xvd1Bhc3MnKSwgaXNTdGVyZW8gKSwgXG4gICAgICBbJ2ZpbHRlcnMnLCdGaWx0ZXIyNENsYXNzaWMnXSxcbiAgICAgIHByb3BzXG4gICAgKVxuXG4gICAgcmV0dXJuIF9fb3V0XG4gIH1cblxuXG4gIEZpbHRlcjI0LmRlZmF1bHRzID0ge1xuICAgIGlucHV0OjAsXG4gICAgUTogLjI1LFxuICAgIGN1dG9mZjogODgwLFxuICAgIGlzTG93UGFzczoxXG4gIH1cblxuICByZXR1cm4gRmlsdGVyMjRcblxufVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgZyA9IEdpYmJlcmlzaC5nZW5pc2hcblxuICBjb25zdCBmaWx0ZXJzID0ge1xuICAgIEZpbHRlcjI0Q2xhc3NpYyA6IHJlcXVpcmUoICcuL2ZpbHRlcjI0LmpzJyAgKSggR2liYmVyaXNoICksXG4gICAgRmlsdGVyMjRNb29nICAgIDogcmVxdWlyZSggJy4vbGFkZGVyRmlsdGVyWmVyb0RlbGF5LmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgICBGaWx0ZXIyNFRCMzAzICAgOiByZXF1aXJlKCAnLi9kaW9kZUZpbHRlclpERi5qcycgKSggR2liYmVyaXNoICksXG4gICAgRmlsdGVyMTJCaXF1YWQgIDogcmVxdWlyZSggJy4vYmlxdWFkLmpzJyAgICApKCBHaWJiZXJpc2ggKSxcbiAgICBGaWx0ZXIxMlNWRiAgICAgOiByZXF1aXJlKCAnLi9zdmYuanMnICAgICAgICkoIEdpYmJlcmlzaCApLFxuICAgIFxuICAgIC8vIG5vdCBmb3IgdXNlIGJ5IGVuZC11c2Vyc1xuICAgIGdlbmlzaDoge1xuICAgICAgQ29tYiAgICAgICAgOiByZXF1aXJlKCAnLi9jb21iZmlsdGVyLmpzJyApLFxuICAgICAgQWxsUGFzcyAgICAgOiByZXF1aXJlKCAnLi9hbGxwYXNzLmpzJyApXG4gICAgfSxcblxuICAgIGZhY3RvcnkoIGlucHV0LCBjdXRvZmYsIHJlc29uYW5jZSwgc2F0dXJhdGlvbiA9IG51bGwsIF9wcm9wcywgaXNTdGVyZW8gPSBmYWxzZSApIHtcbiAgICAgIGxldCBmaWx0ZXJlZE9zYyBcblxuICAgICAgLy9pZiggcHJvcHMuZmlsdGVyVHlwZSA9PT0gMSApIHtcbiAgICAgIC8vICBpZiggdHlwZW9mIHByb3BzLmN1dG9mZiAhPT0gJ29iamVjdCcgJiYgcHJvcHMuY3V0b2ZmID4gMSApIHtcbiAgICAgIC8vICAgIHByb3BzLmN1dG9mZiA9IC4yNVxuICAgICAgLy8gIH1cbiAgICAgIC8vICBpZiggdHlwZW9mIHByb3BzLmN1dG9mZiAhPT0gJ29iamVjdCcgJiYgcHJvcHMuZmlsdGVyTXVsdCA+IC41ICkge1xuICAgICAgLy8gICAgcHJvcHMuZmlsdGVyTXVsdCA9IC4xXG4gICAgICAvLyAgfVxuICAgICAgLy99XG4gICAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBmaWx0ZXJzLmRlZmF1bHRzLCBfcHJvcHMgKVxuXG4gICAgICBzd2l0Y2goIHByb3BzLmZpbHRlclR5cGUgKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAvL2lzTG93UGFzcyA9IGcucGFyYW0oICdsb3dQYXNzJywgMSApLFxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gZy5maWx0ZXIyNCggaW5wdXQsIGcuaW4oJ1EnKSwgY3V0b2ZmLCBwcm9wcy5maWx0ZXJNb2RlLCBpc1N0ZXJlbyApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBmaWx0ZXJlZE9zYyA9IGcuemQyNCggaW5wdXQsIGcuaW4oJ1EnKSwgY3V0b2ZmIClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gZy5kaW9kZVpERiggaW5wdXQsIGcuaW4oJ1EnKSwgY3V0b2ZmLCBnLmluKCdzYXR1cmF0aW9uJyksIGlzU3RlcmVvICkgXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBmaWx0ZXJlZE9zYyA9IGcuc3ZmKCBpbnB1dCwgY3V0b2ZmLCBnLnN1YiggMSwgZy5pbignUScpKSwgcHJvcHMuZmlsdGVyTW9kZSwgaXNTdGVyZW8gKSBcbiAgICAgICAgICBicmVhazsgXG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICBmaWx0ZXJlZE9zYyA9IGcuYmlxdWFkKCBpbnB1dCwgY3V0b2ZmLCAgZy5pbignUScpLCBwcm9wcy5maWx0ZXJNb2RlLCBpc1N0ZXJlbyApIFxuICAgICAgICAgIGJyZWFrOyBcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvLyByZXR1cm4gdW5maWx0ZXJlZCBzaWduYWxcbiAgICAgICAgICBmaWx0ZXJlZE9zYyA9IGlucHV0IC8vZy5maWx0ZXIyNCggb3NjV2l0aEdhaW4sIGcuaW4oJ3Jlc29uYW5jZScpLCBjdXRvZmYsIGlzTG93UGFzcyApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmaWx0ZXJlZE9zY1xuICAgIH0sXG5cbiAgICBkZWZhdWx0czogeyBmaWx0ZXJNb2RlOiAwLCBmaWx0ZXJUeXBlOjAgfVxuICB9XG5cbiAgZmlsdGVycy5leHBvcnQgPSB0YXJnZXQgPT4ge1xuICAgIGZvciggbGV0IGtleSBpbiBmaWx0ZXJzICkge1xuICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgJiYga2V5ICE9PSAnZ2VuaXNoJyApIHtcbiAgICAgICAgdGFyZ2V0WyBrZXkgXSA9IGZpbHRlcnNbIGtleSBdXG4gICAgICB9XG4gICAgfVxuICB9XG5cbnJldHVybiBmaWx0ZXJzXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZmlsdGVyUHJvdG8gPSByZXF1aXJlKCAnLi9maWx0ZXIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIEdpYmJlcmlzaC5nZW5pc2guemQyNCA9ICggaW5wdXQsIF9RLCBmcmVxLCBpc1N0ZXJlbz1mYWxzZSApID0+IHtcbiAgICBjb25zdCBpVCA9IDEgLyBnLmdlbi5zYW1wbGVyYXRlLFxuICAgICAgICAgIHoxID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIHoyID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIHozID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIHo0ID0gZy5oaXN0b3J5KDApXG4gICAgXG4gICAgY29uc3QgUSA9IGcubWVtbyggZy5hZGQoIC41LCBnLm11bCggX1EsIDIzICkgKSApXG4gICAgLy8ga3dkID0gMiAqICRNX1BJICogYWNmW2tpbmR4XVxuICAgIGNvbnN0IGt3ZCA9IGcubWVtbyggZy5tdWwoIE1hdGguUEkgKiAyLCBmcmVxICkgKVxuXG4gICAgLy8ga3dhID0gKDIvaVQpICogdGFuKGt3ZCAqIGlULzIpIFxuICAgIGNvbnN0IGt3YSA9Zy5tZW1vKCBnLm11bCggMi9pVCwgZy50YW4oIGcubXVsKCBrd2QsIGlULzIgKSApICkgKVxuXG4gICAgLy8ga0cgID0ga3dhICogaVQvMiBcbiAgICBjb25zdCBrZyA9IGcubWVtbyggZy5tdWwoIGt3YSwgaVQvMiApIClcblxuICAgIC8vIGtrID0gNC4wKihrUSAtIDAuNSkvKDI1LjAgLSAwLjUpXG4gICAgY29uc3Qga2sgPSBnLm1lbW8oIGcubXVsKCA0LCBnLmRpdiggZy5zdWIoIFEsIC41ICksIDI0LjUgKSApIClcblxuICAgIC8vIGtnX3BsdXNfMSA9ICgxLjAgKyBrZylcbiAgICBjb25zdCBrZ19wbHVzXzEgPSBnLmFkZCggMSwga2cgKVxuXG4gICAgLy8ga0cgPSBrZyAvIGtnX3BsdXNfMSBcbiAgICBjb25zdCBrRyAgICAgPSBnLm1lbW8oIGcuZGl2KCBrZywga2dfcGx1c18xICkgKSxcbiAgICAgICAgICBrR18yICAgPSBnLm1lbW8oIGcubXVsKCBrRywga0cgKSApLFxuICAgICAgICAgIGtHXzMgICA9IGcubXVsKCBrR18yLCBrRyApLFxuICAgICAgICAgIGtHQU1NQSA9IGcubXVsKCBrR18yLCBrR18yIClcblxuICAgIGNvbnN0IGtTMSA9IGcuZGl2KCB6MS5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTMiA9IGcuZGl2KCB6Mi5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTMyA9IGcuZGl2KCB6My5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTNCA9IGcuZGl2KCB6NC5vdXQsIGtnX3BsdXNfMSApXG5cbiAgICAvL2tTID0ga0dfMyAqIGtTMSAgKyBrR18yICoga1MyICsga0cgKiBrUzMgKyBrUzQgXG4gICAgY29uc3Qga1MgPSBnLm1lbW8oIFxuICAgICAgZy5hZGQoXG4gICAgICAgIGcuYWRkKCBnLm11bChrR18zLCBrUzEpLCBnLm11bCgga0dfMiwga1MyKSApLFxuICAgICAgICBnLmFkZCggZy5tdWwoa0csIGtTMyksIGtTNCApXG4gICAgICApXG4gICAgKVxuXG4gICAgLy9rdSA9IChraW4gLSBrayAqICBrUykgLyAoMSArIGtrICoga0dBTU1BKVxuICAgIGNvbnN0IGt1MSA9IGcuc3ViKCBpbnB1dCwgZy5tdWwoIGtrLCBrUyApIClcbiAgICBjb25zdCBrdTIgPSBnLm1lbW8oIGcuYWRkKCAxLCBnLm11bCgga2ssIGtHQU1NQSApICkgKVxuICAgIGNvbnN0IGt1ICA9IGcubWVtbyggZy5kaXYoIGt1MSwga3UyICkgKVxuXG4gICAgbGV0IGt2ID0gIGcubWVtbyggZy5tdWwoIGcuc3ViKCBrdSwgejEub3V0ICksIGtHICkgKVxuICAgIGxldCBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejEub3V0ICkgKVxuICAgIHoxLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHoyLm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejIub3V0ICkgKVxuICAgIHoyLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHozLm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejMub3V0ICkgKVxuICAgIHozLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHo0Lm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejQub3V0ICkgKVxuICAgIHo0LmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgLy9sZXQgcG9sZXNSID0gZy5kYXRhKFsgMCwwLDAsMCBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgIC8vICAgIHJlenpSID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzUlszXSwgcmV6ICkgKSxcbiAgICAgIC8vICAgIG91dHB1dFIgPSBnLnN1YiggaW5wdXRbMV0sIHJlenpSICkgICAgICAgICBcblxuICAgICAgLy9wb2xlc1JbMF0gPSBnLmFkZCggcG9sZXNSWzBdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMF0gKSwgb3V0cHV0UiAgICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMV0gPSBnLmFkZCggcG9sZXNSWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMV0gKSwgcG9sZXNSWzBdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMl0gPSBnLmFkZCggcG9sZXNSWzJdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMl0gKSwgcG9sZXNSWzFdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbM10gPSBnLmFkZCggcG9sZXNSWzNdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbM10gKSwgcG9sZXNSWzJdICksIGN1dG9mZiApKVxuXG4gICAgICAvL2xldCByaWdodCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzUlszXSwgZy5zdWIoIG91dHB1dFIsIHBvbGVzUlszXSApIClcblxuICAgICAgLy9yZXR1cm5WYWx1ZSA9IFtsZWZ0LCByaWdodF1cbiAgICB9Ly9lbHNle1xuICAgICAgLy9yZXR1cm5WYWx1ZSA9IGtscFxuICAgIC8vfVxuXG4gICAgcmV0dXJuIGtscC8vcmV0dXJuVmFsdWVcbiAgfVxuXG4gIGNvbnN0IFpkMjQgPSBpbnB1dFByb3BzID0+IHtcbiAgICBjb25zdCBmaWx0ZXIgICA9IE9iamVjdC5jcmVhdGUoIGZpbHRlclByb3RvIClcbiAgICBjb25zdCBwcm9wcyAgICA9IE9iamVjdC5hc3NpZ24oIHt9LCBaZDI0LmRlZmF1bHRzLCBmaWx0ZXIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gXG5cbiAgICBjb25zdCBfX291dCA9IEdpYmJlcmlzaC5mYWN0b3J5KFxuICAgICAgZmlsdGVyLCBcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guemQyNCggZy5pbignaW5wdXQnKSwgZy5pbignUScpLCBnLmluKCdjdXRvZmYnKSwgaXNTdGVyZW8gKSwgXG4gICAgICBbJ2ZpbHRlcnMnLCdGaWx0ZXIyNE1vb2cnXSxcbiAgICAgIHByb3BzXG4gICAgKVxuXG4gICAgcmV0dXJuIF9fb3V0XG4gIH1cblxuXG4gIFpkMjQuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICBROiAuNzUsXG4gICAgY3V0b2ZmOiA0NDAsXG4gIH1cblxuICByZXR1cm4gWmQyNFxuXG59XG5cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZmlsdGVyID0gcmVxdWlyZSggJy4vZmlsdGVyLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgR2liYmVyaXNoLmdlbmlzaC5zdmYgPSAoIGlucHV0LCBjdXRvZmYsIFEsIG1vZGUsIGlzU3RlcmVvICkgPT4ge1xuICAgIGxldCBkMSA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSksIGQyID0gZy5kYXRhKFswLDBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgICAgcGVla1Byb3BzID0geyBtb2RlOidzaW1wbGUnLCBpbnRlcnA6J25vbmUnIH1cblxuICAgIGxldCBmMSA9IGcubWVtbyggZy5tdWwoIDIgKiBNYXRoLlBJLCBnLmRpdiggY3V0b2ZmLCBnLmdlbi5zYW1wbGVyYXRlICkgKSApXG4gICAgbGV0IG9uZU92ZXJRID0gZy5tZW1vKCBnLmRpdiggMSwgUSApIClcbiAgICBsZXQgbCA9IGcubWVtbyggZy5hZGQoIGQyWzBdLCBnLm11bCggZjEsIGQxWzBdICkgKSApLFxuICAgICAgICBoID0gZy5tZW1vKCBnLnN1YiggZy5zdWIoIGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dCwgbCApLCBnLm11bCggUSwgZDFbMF0gKSApICksXG4gICAgICAgIGIgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggZjEsIGggKSwgZDFbMF0gKSApLFxuICAgICAgICBuID0gZy5tZW1vKCBnLmFkZCggaCwgbCApIClcblxuICAgIGQxWzBdID0gYlxuICAgIGQyWzBdID0gbFxuXG4gICAgbGV0IG91dCA9IGcuc2VsZWN0b3IoIG1vZGUsIGwsIGgsIGIsIG4gKVxuXG4gICAgbGV0IHJldHVyblZhbHVlXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgbGV0IGQxMiA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSksIGQyMiA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSlcbiAgICAgIGxldCBsMiA9IGcubWVtbyggZy5hZGQoIGQyMlswXSwgZy5tdWwoIGYxLCBkMTJbMF0gKSApICksXG4gICAgICAgICAgaDIgPSBnLm1lbW8oIGcuc3ViKCBnLnN1YiggaW5wdXRbMV0sIGwyICksIGcubXVsKCBRLCBkMTJbMF0gKSApICksXG4gICAgICAgICAgYjIgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggZjEsIGgyICksIGQxMlswXSApICksXG4gICAgICAgICAgbjIgPSBnLm1lbW8oIGcuYWRkKCBoMiwgbDIgKSApXG5cbiAgICAgIGQxMlswXSA9IGIyXG4gICAgICBkMjJbMF0gPSBsMlxuXG4gICAgICBsZXQgb3V0MiA9IGcuc2VsZWN0b3IoIG1vZGUsIGwyLCBoMiwgYjIsIG4yIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBbIG91dCwgb3V0MiBdXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbiAgbGV0IFNWRiA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGNvbnN0IHN2ZiA9IE9iamVjdC5jcmVhdGUoIGZpbHRlciApXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgU1ZGLmRlZmF1bHRzLCBmaWx0ZXIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSBcblxuICAgIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW9cbiAgICBcbiAgICAvLyBYWFggTkVFRFMgUkVGQUNUT1JJTkdcbiAgICBjb25zdCBfX291dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIHN2ZixcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guc3ZmKCBnLmluKCdpbnB1dCcpLCBnLm11bCggZy5pbignY3V0b2ZmJyksIGcuZ2VuLnNhbXBsZXJhdGUgLyA1ICksIGcuc3ViKCAxLCBnLmluKCdRJykgKSwgZy5pbignbW9kZScpLCBpc1N0ZXJlbyApLCBcbiAgICAgIFsnZmlsdGVycycsJ0ZpbHRlcjEyU1ZGJ10sIFxuICAgICAgcHJvcHNcbiAgICApXG5cbiAgICByZXR1cm4gX19vdXRcbiAgfVxuXG5cbiAgU1ZGLmRlZmF1bHRzID0ge1xuICAgIGlucHV0OjAsXG4gICAgUTogLjY1LFxuICAgIGN1dG9mZjo0NDAsXG4gICAgbW9kZTowXG4gIH1cblxuICByZXR1cm4gU1ZGXG5cbn1cblxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgQml0Q3J1c2hlciA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7IGJpdENydXNoZXJMZW5ndGg6IDQ0MTAwIH0sIEJpdENydXNoZXIuZGVmYXVsdHMsIGVmZmVjdC5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgYml0Q3J1c2hlciA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIGJpdERlcHRoID0gZy5pbiggJ2JpdERlcHRoJyApLFxuICAgICAgc2FtcGxlUmF0ZSA9IGcuaW4oICdzYW1wbGVSYXRlJyApLFxuICAgICAgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMCBdIDogaW5wdXQsXG4gICAgICByaWdodElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMSBdIDogbnVsbFxuICBcbiAgbGV0IHN0b3JlTCA9IGcuaGlzdG9yeSgwKVxuICBsZXQgc2FtcGxlUmVkdXhDb3VudGVyID0gZy5jb3VudGVyKCBzYW1wbGVSYXRlLCAwLCAxIClcblxuICBsZXQgYml0TXVsdCA9IGcucG93KCBnLm11bCggYml0RGVwdGgsIDE2ICksIDIgKVxuICBsZXQgY3J1c2hlZEwgPSBnLmRpdiggZy5mbG9vciggZy5tdWwoIGxlZnRJbnB1dCwgYml0TXVsdCApICksIGJpdE11bHQgKVxuXG4gIGxldCBvdXRMID0gZy5zd2l0Y2goXG4gICAgc2FtcGxlUmVkdXhDb3VudGVyLndyYXAsXG4gICAgY3J1c2hlZEwsXG4gICAgc3RvcmVMLm91dFxuICApXG5cbiAgbGV0IG91dFxuICBpZiggaXNTdGVyZW8gKSB7XG4gICAgbGV0IHN0b3JlUiA9IGcuaGlzdG9yeSgwKVxuICAgIGxldCBjcnVzaGVkUiA9IGcuZGl2KCBnLmZsb29yKCBnLm11bCggcmlnaHRJbnB1dCwgYml0TXVsdCApICksIGJpdE11bHQgKVxuXG4gICAgbGV0IG91dFIgPSB0ZXJuYXJ5KCBcbiAgICAgIHNhbXBsZVJlZHV4Q291bnRlci53cmFwLFxuICAgICAgY3J1c2hlZFIsXG4gICAgICBzdG9yZUwub3V0XG4gICAgKVxuXG4gICAgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgYml0Q3J1c2hlcixcbiAgICAgIFsgb3V0TCwgb3V0UiBdLCBcbiAgICAgIFsnZngnLCdiaXRDcnVzaGVyJ10sIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeSggYml0Q3J1c2hlciwgb3V0TCwgWydmeCcsJ2JpdENydXNoZXInXSwgcHJvcHMgKVxuICB9XG4gIFxuICByZXR1cm4gb3V0IFxufVxuXG5CaXRDcnVzaGVyLmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBiaXREZXB0aDouNSxcbiAgc2FtcGxlUmF0ZTogLjVcbn1cblxucmV0dXJuIEJpdENydXNoZXJcblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIGxldCBwcm90byA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgbGV0IFNodWZmbGVyID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgbGV0IGJ1ZmZlclNodWZmbGVyID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgICAgYnVmZmVyU2l6ZSA9IDg4MjAwXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgU2h1ZmZsZXIuZGVmYXVsdHMsIGVmZmVjdC5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG5cbiAgICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiBmYWxzZVxuICAgIGxldCBwaGFzZSA9IGcuYWNjdW0oIDEsMCx7IHNob3VsZFdyYXA6IGZhbHNlIH0pXG5cbiAgICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICAgIGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbIDAgXSA6IGlucHV0LFxuICAgICAgICByaWdodElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMSBdIDogbnVsbCxcbiAgICAgICAgcmF0ZU9mU2h1ZmZsaW5nID0gZy5pbiggJ3JhdGUnICksXG4gICAgICAgIGNoYW5jZU9mU2h1ZmZsaW5nID0gZy5pbiggJ2NoYW5jZScgKSxcbiAgICAgICAgcmV2ZXJzZUNoYW5jZSA9IGcuaW4oICdyZXZlcnNlQ2hhbmNlJyApLFxuICAgICAgICByZXBpdGNoQ2hhbmNlID0gZy5pbiggJ3JlcGl0Y2hDaGFuY2UnICksXG4gICAgICAgIHJlcGl0Y2hNaW4gPSBnLmluKCAncmVwaXRjaE1pbicgKSxcbiAgICAgICAgcmVwaXRjaE1heCA9IGcuaW4oICdyZXBpdGNoTWF4JyApXG5cbiAgICBsZXQgcGl0Y2hNZW1vcnkgPSBnLmhpc3RvcnkoMSlcblxuICAgIGxldCBzaG91bGRTaHVmZmxlQ2hlY2sgPSBnLmVxKCBnLm1vZCggcGhhc2UsIHJhdGVPZlNodWZmbGluZyApLCAwIClcbiAgICBsZXQgaXNTaHVmZmxpbmcgPSBnLm1lbW8oIGcuc2FoKCBnLmx0KCBnLm5vaXNlKCksIGNoYW5jZU9mU2h1ZmZsaW5nICksIHNob3VsZFNodWZmbGVDaGVjaywgMCApICkgXG5cbiAgICAvLyBpZiB3ZSBhcmUgc2h1ZmZsaW5nIGFuZCBvbiBhIHJlcGVhdCBib3VuZGFyeS4uLlxuICAgIGxldCBzaHVmZmxlQ2hhbmdlZCA9IGcubWVtbyggZy5hbmQoIHNob3VsZFNodWZmbGVDaGVjaywgaXNTaHVmZmxpbmcgKSApXG4gICAgbGV0IHNob3VsZFJldmVyc2UgPSBnLmx0KCBnLm5vaXNlKCksIHJldmVyc2VDaGFuY2UgKSxcbiAgICAgICAgcmV2ZXJzZU1vZCA9IGcuc3dpdGNoKCBzaG91bGRSZXZlcnNlLCAtMSwgMSApXG5cbiAgICBsZXQgcGl0Y2ggPSBnLmlmZWxzZSggXG4gICAgICBnLmFuZCggc2h1ZmZsZUNoYW5nZWQsIGcubHQoIGcubm9pc2UoKSwgcmVwaXRjaENoYW5jZSApICksXG4gICAgICBnLm1lbW8oIGcubXVsKCBnLmFkZCggcmVwaXRjaE1pbiwgZy5tdWwoIGcuc3ViKCByZXBpdGNoTWF4LCByZXBpdGNoTWluICksIGcubm9pc2UoKSApICksIHJldmVyc2VNb2QgKSApLFxuICAgICAgcmV2ZXJzZU1vZFxuICAgIClcbiAgICBcbiAgICAvLyBvbmx5IHN3aXRjaCBwaXRjaGVzIG9uIHJlcGVhdCBib3VuZGFyaWVzXG4gICAgcGl0Y2hNZW1vcnkuaW4oIGcuc3dpdGNoKCBzaHVmZmxlQ2hhbmdlZCwgcGl0Y2gsIHBpdGNoTWVtb3J5Lm91dCApIClcblxuICAgIGxldCBmYWRlTGVuZ3RoID0gZy5tZW1vKCBnLmRpdiggcmF0ZU9mU2h1ZmZsaW5nLCAxMDAgKSApLFxuICAgICAgICBmYWRlSW5jciA9IGcubWVtbyggZy5kaXYoIDEsIGZhZGVMZW5ndGggKSApXG5cbiAgICBsZXQgYnVmZmVyTCA9IGcuZGF0YSggYnVmZmVyU2l6ZSApLCBidWZmZXJSID0gaXNTdGVyZW8gPyBnLmRhdGEoIGJ1ZmZlclNpemUgKSA6IG51bGxcbiAgICBsZXQgcmVhZFBoYXNlID0gZy5hY2N1bSggcGl0Y2hNZW1vcnkub3V0LCAwLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSkgXG4gICAgbGV0IHN0dXR0ZXIgPSBnLndyYXAoIGcuc3ViKCBnLm1vZCggcmVhZFBoYXNlLCBidWZmZXJTaXplICksIDIyMDUwICksIDAsIGJ1ZmZlclNpemUgKVxuXG4gICAgbGV0IG5vcm1hbFNhbXBsZSA9IGcucGVlayggYnVmZmVyTCwgZy5hY2N1bSggMSwgMCwgeyBtYXg6ODgyMDAgfSksIHsgbW9kZTonc2ltcGxlJyB9KVxuXG4gICAgbGV0IHN0dXR0ZXJTYW1wbGVQaGFzZSA9IGcuc3dpdGNoKCBpc1NodWZmbGluZywgc3R1dHRlciwgZy5tb2QoIHJlYWRQaGFzZSwgYnVmZmVyU2l6ZSApIClcbiAgICBsZXQgc3R1dHRlclNhbXBsZSA9IGcubWVtbyggZy5wZWVrKCBcbiAgICAgIGJ1ZmZlckwsIFxuICAgICAgc3R1dHRlclNhbXBsZVBoYXNlLFxuICAgICAgeyBtb2RlOidzYW1wbGVzJyB9XG4gICAgKSApXG4gICAgXG4gICAgbGV0IHN0dXR0ZXJTaG91bGRGYWRlSW4gPSBnLmFuZCggc2h1ZmZsZUNoYW5nZWQsIGlzU2h1ZmZsaW5nIClcbiAgICBsZXQgc3R1dHRlclBoYXNlID0gZy5hY2N1bSggMSwgc2h1ZmZsZUNoYW5nZWQsIHsgc2hvdWxkV3JhcDogZmFsc2UgfSlcblxuICAgIGxldCBmYWRlSW5BbW91bnQgPSBnLm1lbW8oIGcuZGl2KCBzdHV0dGVyUGhhc2UsIGZhZGVMZW5ndGggKSApXG4gICAgbGV0IGZhZGVPdXRBbW91bnQgPSBnLmRpdiggZy5zdWIoIHJhdGVPZlNodWZmbGluZywgc3R1dHRlclBoYXNlICksIGcuc3ViKCByYXRlT2ZTaHVmZmxpbmcsIGZhZGVMZW5ndGggKSApXG4gICAgXG4gICAgbGV0IGZhZGVkU3R1dHRlciA9IGcuaWZlbHNlKFxuICAgICAgZy5sdCggc3R1dHRlclBoYXNlLCBmYWRlTGVuZ3RoICksXG4gICAgICBnLm1lbW8oIGcubXVsKCBnLnN3aXRjaCggZy5sdCggZmFkZUluQW1vdW50LCAxICksIGZhZGVJbkFtb3VudCwgMSApLCBzdHV0dGVyU2FtcGxlICkgKSxcbiAgICAgIGcuZ3QoIHN0dXR0ZXJQaGFzZSwgZy5zdWIoIHJhdGVPZlNodWZmbGluZywgZmFkZUxlbmd0aCApICksXG4gICAgICBnLm1lbW8oIGcubXVsKCBnLmd0cCggZmFkZU91dEFtb3VudCwgMCApLCBzdHV0dGVyU2FtcGxlICkgKSxcbiAgICAgIHN0dXR0ZXJTYW1wbGVcbiAgICApXG4gICAgXG4gICAgbGV0IG91dHB1dEwgPSBnLm1peCggbm9ybWFsU2FtcGxlLCBmYWRlZFN0dXR0ZXIsIGlzU2h1ZmZsaW5nICkgXG5cbiAgICBsZXQgcG9rZUwgPSBnLnBva2UoIGJ1ZmZlckwsIGxlZnRJbnB1dCwgZy5tb2QoIGcuYWRkKCBwaGFzZSwgNDQxMDAgKSwgODgyMDAgKSApXG5cbiAgICBsZXQgcGFubmVyID0gZy5wYW4oIG91dHB1dEwsIG91dHB1dEwsIGcuaW4oICdwYW4nICkgKVxuICAgIFxuICAgIGxldCBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICBidWZmZXJTaHVmZmxlcixcbiAgICAgIFtwYW5uZXIubGVmdCwgcGFubmVyLnJpZ2h0XSxcbiAgICAgIFsnZngnLCdzaHVmZmxlciddLCBcbiAgICAgIHByb3BzIFxuICAgICkgXG5cbiAgICByZXR1cm4gb3V0IFxuICB9XG4gIFxuICBTaHVmZmxlci5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIHJhdGU6MjIwNTAsXG4gICAgY2hhbmNlOi4yNSxcbiAgICByZXZlcnNlQ2hhbmNlOi41LFxuICAgIHJlcGl0Y2hDaGFuY2U6LjUsXG4gICAgcmVwaXRjaE1pbjouNSxcbiAgICByZXBpdGNoTWF4OjIsXG4gICAgcGFuOi41LFxuICAgIG1peDouNVxuICB9XG5cbiAgcmV0dXJuIFNodWZmbGVyIFxufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcbiAgXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgQ2hvcnVzID0gaW5wdXRQcm9wcyA9PiB7XG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgQ2hvcnVzLmRlZmF1bHRzLCBlZmZlY3QuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICBcbiAgY29uc3QgY2hvcnVzID0gT2JqZWN0LmNyZWF0ZSggR2liYmVyaXNoLnByb3RvdHlwZXMudWdlbiApXG5cbiAgY29uc3QgaW5wdXQgPSBnLmluKCdpbnB1dCcpLFxuICAgICAgICBmcmVxMSA9IGcuaW4oJ3Nsb3dGcmVxdWVuY3knKSxcbiAgICAgICAgZnJlcTIgPSBnLmluKCdmYXN0RnJlcXVlbmN5JyksXG4gICAgICAgIGFtcDEgID0gZy5pbignc2xvd0dhaW4nKSxcbiAgICAgICAgYW1wMiAgPSBnLmluKCdmYXN0R2FpbicpXG5cbiAgY29uc3QgaXNTdGVyZW8gPSB0eXBlb2YgcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09ICd1bmRlZmluZWQnID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuXG4gIGNvbnN0IGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dFxuXG4gIGNvbnN0IHdpbjAgICA9IGcuZW52KCAnaW52ZXJzZXdlbGNoJywgMTAyNCApLFxuICAgICAgICB3aW4xMjAgPSBnLmVudiggJ2ludmVyc2V3ZWxjaCcsIDEwMjQsIDAsIC4zMzMgKSxcbiAgICAgICAgd2luMjQwID0gZy5lbnYoICdpbnZlcnNld2VsY2gnLCAxMDI0LCAwLCAuNjY2IClcbiAgXG4gIGNvbnN0IHNsb3dQaGFzb3IgPSBnLnBoYXNvciggZnJlcTEsIDAsIHsgbWluOjAgfSksXG4gIFx0XHQgIHNsb3dQZWVrMSAgPSBnLm11bCggZy5wZWVrKCB3aW4wLCAgIHNsb3dQaGFzb3IgKSwgYW1wMSApLFxuICAgICAgICBzbG93UGVlazIgID0gZy5tdWwoIGcucGVlayggd2luMTIwLCBzbG93UGhhc29yICksIGFtcDEgKSxcbiAgICAgICAgc2xvd1BlZWszICA9IGcubXVsKCBnLnBlZWsoIHdpbjI0MCwgc2xvd1BoYXNvciApLCBhbXAxIClcbiAgXG4gIGNvbnN0IGZhc3RQaGFzb3IgPSBnLnBoYXNvciggZnJlcTIsIDAsIHsgbWluOjAgfSksXG4gIFx0ICBcdGZhc3RQZWVrMSAgPSBnLm11bCggZy5wZWVrKCB3aW4wLCAgIGZhc3RQaGFzb3IgKSwgYW1wMiApLFxuICAgICAgICBmYXN0UGVlazIgID0gZy5tdWwoIGcucGVlayggd2luMTIwLCBmYXN0UGhhc29yICksIGFtcDIgKSxcbiAgICAgICAgZmFzdFBlZWszICA9IGcubXVsKCBnLnBlZWsoIHdpbjI0MCwgZmFzdFBoYXNvciApLCBhbXAyIClcblxuICBsZXQgc2FtcGxlUmF0ZSA9IEdpYmJlcmlzaC5tb2RlID09PSAncHJvY2Vzc29yJyA/IEdpYmJlcmlzaC5wcm9jZXNzb3Iuc2FtcGxlUmF0ZSA6IEdpYmJlcmlzaC5jdHguc2FtcGxlUmF0ZVxuICAgXG4gIGNvbnN0IG1zID0gc2FtcGxlUmF0ZSAvIDEwMDAgXG4gIGNvbnN0IG1heERlbGF5VGltZSA9IDEwMCAqIG1zXG5cbiAgY29uc3QgdGltZTEgPSAgZy5tdWwoIGcuYWRkKCBzbG93UGVlazEsIGZhc3RQZWVrMSwgNSApLCBtcyApLFxuICAgICAgICB0aW1lMiA9ICBnLm11bCggZy5hZGQoIHNsb3dQZWVrMiwgZmFzdFBlZWsyLCA1ICksIG1zICksXG4gICAgICAgIHRpbWUzID0gIGcubXVsKCBnLmFkZCggc2xvd1BlZWszLCBmYXN0UGVlazMsIDUgKSwgbXMgKVxuXG4gIGNvbnN0IGRlbGF5MUwgPSBnLmRlbGF5KCBsZWZ0SW5wdXQsIHRpbWUxLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pLFxuICAgICAgICBkZWxheTJMID0gZy5kZWxheSggbGVmdElucHV0LCB0aW1lMiwgeyBzaXplOm1heERlbGF5VGltZSB9KSxcbiAgICAgICAgZGVsYXkzTCA9IGcuZGVsYXkoIGxlZnRJbnB1dCwgdGltZTMsIHsgc2l6ZTptYXhEZWxheVRpbWUgfSlcblxuICBcbiAgY29uc3QgbGVmdE91dHB1dCA9IGcuYWRkKCBkZWxheTFMLCBkZWxheTJMLCBkZWxheTNMIClcbiAgaWYoIGlzU3RlcmVvICkge1xuICAgIGNvbnN0IHJpZ2h0SW5wdXQgPSBpbnB1dFsxXVxuICAgIGNvbnN0IGRlbGF5MVIgPSBnLmRlbGF5KHJpZ2h0SW5wdXQsIHRpbWUxLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pLFxuICAgICAgICAgIGRlbGF5MlIgPSBnLmRlbGF5KHJpZ2h0SW5wdXQsIHRpbWUyLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pLFxuICAgICAgICAgIGRlbGF5M1IgPSBnLmRlbGF5KHJpZ2h0SW5wdXQsIHRpbWUzLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pXG5cbiAgICAvLyBmbGlwIGEgY291cGxlIGRlbGF5IGxpbmVzIGZvciBzdGVyZW8gZWZmZWN0P1xuICAgIGNvbnN0IHJpZ2h0T3V0cHV0ID0gZy5hZGQoIGRlbGF5MVIsIGRlbGF5MkwsIGRlbGF5M1IgKVxuICAgIGNob3J1cy5ncmFwaCA9IFsgZy5hZGQoIGRlbGF5MUwsIGRlbGF5MlIsIGRlbGF5M0wgKSwgcmlnaHRPdXRwdXQgXVxuICB9ZWxzZXtcbiAgICBjaG9ydXMuZ3JhcGggPSBsZWZ0T3V0cHV0XG4gIH1cbiAgXG4gIGNvbnN0IG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBjaG9ydXMsIGNob3J1cy5ncmFwaCwgWydmeCcsJ2Nob3J1cyddLCBwcm9wcyApXG5cbiAgcmV0dXJuIG91dCBcbn1cblxuQ2hvcnVzLmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBzbG93RnJlcXVlbmN5OiAuMTgsXG4gIHNsb3dHYWluOjEsXG4gIGZhc3RGcmVxdWVuY3k6NixcbiAgZmFzdEdhaW46LjJcbn1cblxucmV0dXJuIENob3J1c1xuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSgnZ2VuaXNoLmpzJyksXG4gICAgICBlZmZlY3QgPSByZXF1aXJlKCcuL2VmZmVjdC5qcycpO1xuXG5jb25zdCBnZW5pc2ggPSBnO1xuXG5cInVzZSBqc2RzcFwiO1xuXG5jb25zdCBBbGxQYXNzQ2hhaW4gPSAoaW4xLCBpbjIsIGluMykgPT4ge1xuICBcInVzZSBqc2RzcFwiO1xuXG4gIC8qIGluMSA9IHByZWRlbGF5X291dCAqL1xuICAvKiBpbjIgPSBpbmRpZmZ1c2lvbjEgKi9cbiAgLyogaW4zID0gaW5kaWZmdXNpb24yICovXG5cbiAgY29uc3Qgc3ViMSA9IGdlbmlzaC5zdWIoaW4xLCAwKTtcbiAgY29uc3QgZDEgPSBnLmRlbGF5KHN1YjEsIDE0Mik7XG4gIHN1YjEuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkMSwgaW4yKTtcbiAgY29uc3QgYXAxX291dCA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bChzdWIxLCBpbjIpLCBkMSk7XG5cbiAgY29uc3Qgc3ViMiA9IGdlbmlzaC5zdWIoYXAxX291dCwgMCk7XG4gIGNvbnN0IGQyID0gZy5kZWxheShzdWIyLCAxMDcpO1xuICBzdWIyLmlucHV0c1sxXSA9IGdlbmlzaC5tdWwoZDIsIGluMik7XG4gIGNvbnN0IGFwMl9vdXQgPSBnZW5pc2guYWRkKGdlbmlzaC5tdWwoc3ViMiwgaW4yKSwgZDIpO1xuXG4gIGNvbnN0IHN1YjMgPSBnZW5pc2guc3ViKGFwMl9vdXQsIDApO1xuICBjb25zdCBkMyA9IGcuZGVsYXkoc3ViMywgMzc5KTtcbiAgc3ViMy5pbnB1dHNbMV0gPSBnZW5pc2gubXVsKGQzLCBpbjMpO1xuICBjb25zdCBhcDNfb3V0ID0gZ2VuaXNoLmFkZChnZW5pc2gubXVsKHN1YjMsIGluMyksIGQzKTtcblxuICBjb25zdCBzdWI0ID0gZ2VuaXNoLnN1YihhcDNfb3V0LCAwKTtcbiAgY29uc3QgZDQgPSBnLmRlbGF5KHN1YjQsIDI3Nyk7XG4gIHN1YjQuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkNCwgaW4zKTtcbiAgY29uc3QgYXA0X291dCA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bChzdWI0LCBpbjMpLCBkNCk7XG5cbiAgcmV0dXJuIGFwNF9vdXQ7XG59O1xuXG4vKmNvbnN0IHRhbmtfb3V0cyA9IFRhbmsoIGFwX291dCwgZGVjYXlkaWZmdXNpb24xLCBkZWNheWRpZmZ1c2lvbjIsIGRhbXBpbmcsIGRlY2F5ICkqL1xuY29uc3QgVGFuayA9IGZ1bmN0aW9uIChpbjEsIGluMiwgaW4zLCBpbjQsIGluNSkge1xuICBcInVzZSBqc2RzcFwiO1xuXG4gIGNvbnN0IG91dHMgPSBbW10sIFtdLCBbXSwgW10sIFtdXTtcblxuICAvKiBMRUZUIENIQU5ORUwgKi9cbiAgY29uc3QgbGVmdFN0YXJ0ID0gZ2VuaXNoLmFkZChpbjEsIDApO1xuICBjb25zdCBkZWxheUlucHV0ID0gZ2VuaXNoLmFkZChsZWZ0U3RhcnQsIDApO1xuICBjb25zdCBkZWxheTEgPSBnLmRlbGF5KGRlbGF5SW5wdXQsIFtnZW5pc2guYWRkKGdlbmlzaC5tdWwoZy5jeWNsZSguMSksIDE2KSwgNjcyKV0sIHsgc2l6ZTogNjg4IH0pO1xuICBkZWxheUlucHV0LmlucHV0c1sxXSA9IGdlbmlzaC5tdWwoZGVsYXkxLCBpbjIpO1xuICBjb25zdCBkZWxheU91dCA9IGdlbmlzaC5zdWIoZGVsYXkxLCBnZW5pc2gubXVsKGRlbGF5SW5wdXQsIGluMikpO1xuXG4gIGNvbnN0IGRlbGF5MiA9IGcuZGVsYXkoZGVsYXlPdXQsIFs0NDUzLCAzNTMsIDM2MjcsIDExOTBdKTtcbiAgb3V0c1szXS5wdXNoKGdlbmlzaC5hZGQoZGVsYXkyLm91dHB1dHNbMV0sIGRlbGF5Mi5vdXRwdXRzWzJdKSk7XG4gIG91dHNbMl0ucHVzaChkZWxheTIub3V0cHV0c1szXSk7XG5cbiAgY29uc3QgbXogPSBnLmhpc3RvcnkoMCk7XG4gIGNvbnN0IG1sID0gZy5taXgoZGVsYXkyLCBtei5vdXQsIGluNCk7XG4gIG16LmluKG1sKTtcblxuICBjb25zdCBtb3V0ID0gZ2VuaXNoLm11bChtbCwgaW41KTtcblxuICBjb25zdCBzMSA9IGdlbmlzaC5zdWIobW91dCwgMCk7XG4gIGNvbnN0IGRlbGF5MyA9IGcuZGVsYXkoczEsIFsxODAwLCAxODcsIDEyMjhdKTtcbiAgb3V0c1syXS5wdXNoKGRlbGF5My5vdXRwdXRzWzFdKTtcbiAgb3V0c1s0XS5wdXNoKGRlbGF5My5vdXRwdXRzWzJdKTtcbiAgczEuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkZWxheTMsIGluMyk7XG4gIGNvbnN0IG0yID0gZ2VuaXNoLm11bChzMSwgaW4zKTtcbiAgY29uc3QgZGwyX291dCA9IGdlbmlzaC5hZGQoZGVsYXkzLCBtMik7XG5cbiAgY29uc3QgZGVsYXk0ID0gZy5kZWxheShkbDJfb3V0LCBbMzcyMCwgMTA2NiwgMjY3M10pO1xuICBvdXRzWzJdLnB1c2goZGVsYXk0Lm91dHB1dHNbMV0pO1xuICBvdXRzWzNdLnB1c2goZGVsYXk0Lm91dHB1dHNbMl0pO1xuXG4gIC8qIFJJR0hUIENIQU5ORUwgKi9cbiAgY29uc3QgcmlnaHRTdGFydCA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bChkZWxheTQsIGluNSksIGluMSk7XG4gIGNvbnN0IGRlbGF5SW5wdXRSID0gZ2VuaXNoLmFkZChyaWdodFN0YXJ0LCAwKTtcbiAgY29uc3QgZGVsYXkxUiA9IGcuZGVsYXkoZGVsYXlJbnB1dFIsIGdlbmlzaC5hZGQoZ2VuaXNoLm11bChnLmN5Y2xlKC4wNyksIDE2KSwgOTA4KSwgeyBzaXplOiA5MjQgfSk7XG4gIGRlbGF5SW5wdXRSLmlucHV0c1sxXSA9IGdlbmlzaC5tdWwoZGVsYXkxUiwgaW4yKTtcbiAgY29uc3QgZGVsYXlPdXRSID0gZ2VuaXNoLnN1YihkZWxheTFSLCBnZW5pc2gubXVsKGRlbGF5SW5wdXRSLCBpbjIpKTtcblxuICBjb25zdCBkZWxheTJSID0gZy5kZWxheShkZWxheU91dFIsIFs0MjE3LCAyNjYsIDI5NzQsIDIxMTFdKTtcbiAgb3V0c1sxXS5wdXNoKGdlbmlzaC5hZGQoZGVsYXkyUi5vdXRwdXRzWzFdLCBkZWxheTJSLm91dHB1dHNbMl0pKTtcbiAgb3V0c1s0XS5wdXNoKGRlbGF5MlIub3V0cHV0c1szXSk7XG5cbiAgY29uc3QgbXpSID0gZy5oaXN0b3J5KDApO1xuICBjb25zdCBtbFIgPSBnLm1peChkZWxheTJSLCBtelIub3V0LCBpbjQpO1xuICBtelIuaW4obWxSKTtcblxuICBjb25zdCBtb3V0UiA9IGdlbmlzaC5tdWwobWxSLCBpbjUpO1xuXG4gIGNvbnN0IHMxUiA9IGdlbmlzaC5zdWIobW91dFIsIDApO1xuICBjb25zdCBkZWxheTNSID0gZy5kZWxheShzMVIsIFsyNjU2LCAzMzUsIDE5MTNdKTtcbiAgb3V0c1s0XS5wdXNoKGRlbGF5M1Iub3V0cHV0c1sxXSk7XG4gIG91dHNbMl0ucHVzaChkZWxheTNSLm91dHB1dHNbMl0pO1xuICBzMVIuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkZWxheTNSLCBpbjMpO1xuICBjb25zdCBtMlIgPSBnZW5pc2gubXVsKHMxUiwgaW4zKTtcbiAgY29uc3QgZGwyX291dFIgPSBnZW5pc2guYWRkKGRlbGF5M1IsIG0yUik7XG5cbiAgY29uc3QgZGVsYXk0UiA9IGcuZGVsYXkoZGwyX291dFIsIFszMTYzLCAxMjEsIDE5OTZdKTtcbiAgb3V0c1s0XS5wdXNoKGRlbGF5NC5vdXRwdXRzWzFdKTtcbiAgb3V0c1sxXS5wdXNoKGRlbGF5NC5vdXRwdXRzWzJdKTtcblxuICBsZWZ0U3RhcnQuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkZWxheTRSLCBpbjUpO1xuXG4gIG91dHNbMV0gPSBnLmFkZCguLi5vdXRzWzFdKTtcbiAgb3V0c1syXSA9IGcuYWRkKC4uLm91dHNbMl0pO1xuICBvdXRzWzNdID0gZy5hZGQoLi4ub3V0c1szXSk7XG4gIG91dHNbNF0gPSBnLmFkZCguLi5vdXRzWzRdKTtcbiAgcmV0dXJuIG91dHM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChHaWJiZXJpc2gpIHtcblxuICBjb25zdCBSZXZlcmIgPSBpbnB1dFByb3BzID0+IHtcbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIFJldmVyYi5kZWZhdWx0cywgZWZmZWN0LmRlZmF1bHRzLCBpbnB1dFByb3BzKSxcbiAgICAgICAgICByZXZlcmIgPSBPYmplY3QuY3JlYXRlKGVmZmVjdCk7XG5cbiAgICBjb25zdCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWU7XG5cbiAgICBjb25zdCBpbnB1dCA9IGcuaW4oJ2lucHV0JyksXG4gICAgICAgICAgZGFtcGluZyA9IGcuaW4oJ2RhbXBpbmcnKSxcbiAgICAgICAgICBkcnl3ZXQgPSBnLmluKCdkcnl3ZXQnKSxcbiAgICAgICAgICBkZWNheSA9IGcuaW4oJ2RlY2F5JyksXG4gICAgICAgICAgcHJlZGVsYXkgPSBnLmluKCdwcmVkZWxheScpLFxuICAgICAgICAgIGluYmFuZHdpZHRoID0gZy5pbignaW5iYW5kd2lkdGgnKSxcbiAgICAgICAgICBkZWNheWRpZmZ1c2lvbjEgPSBnLmluKCdkZWNheWRpZmZ1c2lvbjEnKSxcbiAgICAgICAgICBkZWNheWRpZmZ1c2lvbjIgPSBnLmluKCdkZWNheWRpZmZ1c2lvbjInKSxcbiAgICAgICAgICBpbmRpZmZ1c2lvbjEgPSBnLmluKCdpbmRpZmZ1c2lvbjEnKSxcbiAgICAgICAgICBpbmRpZmZ1c2lvbjIgPSBnLmluKCdpbmRpZmZ1c2lvbjInKTtcblxuICAgIGNvbnN0IHN1bW1lZElucHV0ID0gaXNTdGVyZW8gPT09IHRydWUgPyBnLmFkZChpbnB1dFswXSwgaW5wdXRbMV0pIDogaW5wdXQ7XG4gICAgbGV0IG91dDtcbiAgICB7XG4gICAgICAndXNlIGpzZHNwJztcblxuICAgICAgLy8gY2FsY3VsY2F0ZSBwcmVkZWxheVxuICAgICAgY29uc3QgcHJlZGVsYXlfc2FtcHMgPSBnLm1zdG9zYW1wcyhwcmVkZWxheSk7XG4gICAgICBjb25zdCBwcmVkZWxheV9kZWxheSA9IGcuZGVsYXkoc3VtbWVkSW5wdXQsIHByZWRlbGF5X3NhbXBzLCB7IHNpemU6IDQ0MTAgfSk7XG4gICAgICBjb25zdCB6X3BkID0gZy5oaXN0b3J5KDApO1xuICAgICAgY29uc3QgbWl4MSA9IGcubWl4KHpfcGQub3V0LCBwcmVkZWxheV9kZWxheSwgaW5iYW5kd2lkdGgpO1xuICAgICAgel9wZC5pbihtaXgxKTtcblxuICAgICAgY29uc3QgcHJlZGVsYXlfb3V0ID0gbWl4MTtcblxuICAgICAgLy8gcnVuIGlucHV0ICsgcHJlZGVsYXkgdGhyb3VnaCBhbGwtcGFzcyBjaGFpblxuICAgICAgY29uc3QgYXBfb3V0ID0gQWxsUGFzc0NoYWluKHByZWRlbGF5X291dCwgaW5kaWZmdXNpb24xLCBpbmRpZmZ1c2lvbjIpO1xuXG4gICAgICAvLyBydW4gZmlsdGVyZWQgc2lnbmFsIGludG8gXCJ0YW5rXCIgbW9kZWxcbiAgICAgIGNvbnN0IHRhbmtfb3V0cyA9IFRhbmsoYXBfb3V0LCBkZWNheWRpZmZ1c2lvbjEsIGRlY2F5ZGlmZnVzaW9uMiwgZGFtcGluZywgZGVjYXkpO1xuXG4gICAgICBjb25zdCBsZWZ0V2V0ID0gZ2VuaXNoLm11bChnZW5pc2guc3ViKHRhbmtfb3V0c1sxXSwgdGFua19vdXRzWzJdKSwgLjYpO1xuICAgICAgY29uc3QgcmlnaHRXZXQgPSBnZW5pc2gubXVsKGdlbmlzaC5zdWIodGFua19vdXRzWzNdLCB0YW5rX291dHNbNF0pLCAuNik7XG5cbiAgICAgIC8vIG1peCB3ZXQgYW5kIGRyeSBzaWduYWwgZm9yIGZpbmFsIG91dHB1dFxuICAgICAgY29uc3QgbGVmdCA9IGcubWl4KGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dCwgbGVmdFdldCwgZHJ5d2V0KTtcbiAgICAgIGNvbnN0IHJpZ2h0ID0gZy5taXgoaXNTdGVyZW8gPyBpbnB1dFsxXSA6IGlucHV0LCByaWdodFdldCwgZHJ5d2V0KTtcblxuICAgICAgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkocmV2ZXJiLCBbbGVmdCwgcmlnaHRdLCBbJ2Z4JywgJ3BsYXRlJ10sIHByb3BzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9O1xuXG4gIFJldmVyYi5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDogMCxcbiAgICBkYW1waW5nOiAuNSxcbiAgICBkcnl3ZXQ6IC41LFxuICAgIGRlY2F5OiAuNSxcbiAgICBwcmVkZWxheTogMTAsXG4gICAgaW5iYW5kd2lkdGg6IC41LFxuICAgIGluZGlmZnVzaW9uMTogLjc1LFxuICAgIGluZGlmZnVzaW9uMjogLjYyNSxcbiAgICBkZWNheWRpZmZ1c2lvbjE6IC43LFxuICAgIGRlY2F5ZGlmZnVzaW9uMjogLjVcbiAgfTtcblxuICByZXR1cm4gUmV2ZXJiO1xufTsiLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBEZWxheSA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7IGRlbGF5TGVuZ3RoOiA0NDEwMCB9LCBEZWxheS5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgZGVsYXkgPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IGZhbHNlIFxuICBcbiAgbGV0IGlucHV0ICAgICAgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICBkZWxheVRpbWUgID0gZy5pbiggJ3RpbWUnICksXG4gICAgICB3ZXRkcnkgICAgID0gZy5pbiggJ3dldGRyeScgKSxcbiAgICAgIGxlZnRJbnB1dCAgPSBpc1N0ZXJlbyA/IGlucHV0WyAwIF0gOiBpbnB1dCxcbiAgICAgIHJpZ2h0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WyAxIF0gOiBudWxsXG4gICAgXG4gIGxldCBmZWVkYmFjayA9IGcuaW4oICdmZWVkYmFjaycgKVxuXG4gIC8vIGxlZnQgY2hhbm5lbFxuICBsZXQgZmVlZGJhY2tIaXN0b3J5TCA9IGcuaGlzdG9yeSgpXG4gIGxldCBlY2hvTCA9IGcuZGVsYXkoIGcuYWRkKCBsZWZ0SW5wdXQsIGcubXVsKCBmZWVkYmFja0hpc3RvcnlMLm91dCwgZmVlZGJhY2sgKSApLCBkZWxheVRpbWUsIHsgc2l6ZTpwcm9wcy5kZWxheUxlbmd0aCB9KVxuICBmZWVkYmFja0hpc3RvcnlMLmluKCBlY2hvTCApXG4gIGxldCBsZWZ0ID0gZy5taXgoIGxlZnRJbnB1dCwgZWNob0wsIHdldGRyeSApXG5cbiAgbGV0IG91dFxuICBpZiggaXNTdGVyZW8gKSB7XG4gICAgLy8gcmlnaHQgY2hhbm5lbFxuICAgIGxldCBmZWVkYmFja0hpc3RvcnlSID0gZy5oaXN0b3J5KClcbiAgICBsZXQgZWNob1IgPSBnLmRlbGF5KCBnLmFkZCggcmlnaHRJbnB1dCwgZy5tdWwoIGZlZWRiYWNrSGlzdG9yeVIub3V0LCBmZWVkYmFjayApICksIGRlbGF5VGltZSwgeyBzaXplOnByb3BzLmRlbGF5TGVuZ3RoIH0pXG4gICAgZmVlZGJhY2tIaXN0b3J5Ui5pbiggZWNob1IgKVxuICAgIGNvbnN0IHJpZ2h0ID0gZy5taXgoIHJpZ2h0SW5wdXQsIGVjaG9SLCB3ZXRkcnkgKVxuXG4gICAgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgZGVsYXksXG4gICAgICBbIGxlZnQsIHJpZ2h0IF0sIFxuICAgICAgWydmeCcsJ2RlbGF5J10sIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeSggZGVsYXksIGxlZnQsIFsnZngnLCdkZWxheSddLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiBvdXRcbn1cblxuRGVsYXkuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIGZlZWRiYWNrOi43NSxcbiAgdGltZTogMTEwMjUsXG4gIHdldGRyeTogLjVcbn1cblxucmV0dXJuIERlbGF5XG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCdnZW5pc2guanMnKSxcbiAgICAgIGVmZmVjdCA9IHJlcXVpcmUoJy4vZWZmZWN0LmpzJyk7XG5cbmNvbnN0IGdlbmlzaCA9IGc7XG5cbi8qXG5cbiAgICAgICAgIGV4cChhc2lnICogKHNoYXBlMSArIHByZWdhaW4pKSAtIGV4cChhc2lnICogKHNoYXBlMiAtIHByZWdhaW4pKVxuICBhb3V0ID0gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICBleHAoYXNpZyAqIHByZWdhaW4pICAgICAgICAgICAgKyBleHAoLWFzaWcgKiBwcmVnYWluKVxuXG4qL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChHaWJiZXJpc2gpIHtcblxuICBsZXQgRGlzdG9ydGlvbiA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIERpc3RvcnRpb24uZGVmYXVsdHMsIGVmZmVjdC5kZWZhdWx0cywgaW5wdXRQcm9wcyksXG4gICAgICAgIGRpc3RvcnRpb24gPSBPYmplY3QuY3JlYXRlKGVmZmVjdCk7XG5cbiAgICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlO1xuXG4gICAgY29uc3QgaW5wdXQgPSBnLmluKCdpbnB1dCcpLFxuICAgICAgICAgIHNoYXBlMSA9IGcuaW4oJ3NoYXBlMScpLFxuICAgICAgICAgIHNoYXBlMiA9IGcuaW4oJ3NoYXBlMicpLFxuICAgICAgICAgIHByZWdhaW4gPSBnLmluKCdwcmVnYWluJyksXG4gICAgICAgICAgcG9zdGdhaW4gPSBnLmluKCdwb3N0Z2FpbicpO1xuXG4gICAgbGV0IGxvdXQsIG91dDtcbiAgICB7XG4gICAgICAndXNlIGpzZHNwJztcbiAgICAgIGNvbnN0IGxpbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dDtcbiAgICAgIGNvbnN0IGx0b3AgPSBnZW5pc2guc3ViKGcuZXhwKGdlbmlzaC5tdWwobGlucHV0LCBnZW5pc2guYWRkKHNoYXBlMSwgcHJlZ2FpbikpKSwgZy5leHAoZ2VuaXNoLm11bChsaW5wdXQsIGdlbmlzaC5zdWIoc2hhcGUyLCBwcmVnYWluKSkpKTtcbiAgICAgIGNvbnN0IGxib3R0b20gPSBnZW5pc2guYWRkKGcuZXhwKGdlbmlzaC5tdWwobGlucHV0LCBwcmVnYWluKSksIGcuZXhwKGdlbmlzaC5tdWwoZ2VuaXNoLm11bCgtMSwgbGlucHV0KSwgcHJlZ2FpbikpKTtcbiAgICAgIGxvdXQgPSBnZW5pc2gubXVsKGdlbmlzaC5kaXYobHRvcCwgbGJvdHRvbSksIHBvc3RnYWluKTtcbiAgICB9XG5cbiAgICBpZiAoaXNTdGVyZW8pIHtcbiAgICAgIGxldCByb3V0O1xuICAgICAge1xuICAgICAgICAndXNlIGpzZHNwJztcbiAgICAgICAgY29uc3QgcmlucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsxXSA6IGlucHV0O1xuICAgICAgICBjb25zdCBydG9wID0gZ2VuaXNoLnN1YihnLmV4cChnZW5pc2gubXVsKHJpbnB1dCwgZ2VuaXNoLmFkZChzaGFwZTEsIHByZWdhaW4pKSksIGcuZXhwKGdlbmlzaC5tdWwocmlucHV0LCBnZW5pc2guc3ViKHNoYXBlMiwgcHJlZ2FpbikpKSk7XG4gICAgICAgIGNvbnN0IHJib3R0b20gPSBnZW5pc2guYWRkKGcuZXhwKGdlbmlzaC5tdWwocmlucHV0LCBwcmVnYWluKSksIGcuZXhwKGdlbmlzaC5tdWwoZ2VuaXNoLm11bCgtMSwgcmlucHV0KSwgcHJlZ2FpbikpKTtcbiAgICAgICAgcm91dCA9IGdlbmlzaC5tdWwoZ2VuaXNoLmRpdihydG9wLCByYm90dG9tKSwgcG9zdGdhaW4pO1xuICAgICAgfVxuXG4gICAgICBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeShkaXN0b3J0aW9uLCBbbG91dCwgcm91dF0sIFsnZngnLCAnZGlzdG9ydGlvbiddLCBwcm9wcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KGRpc3RvcnRpb24sIGxvdXQsIFsnZngnLCAnZGlzdG9ydGlvbiddLCBwcm9wcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfTtcblxuICBEaXN0b3J0aW9uLmRlZmF1bHRzID0ge1xuICAgIGlucHV0OiAwLFxuICAgIHNoYXBlMTogLjEsXG4gICAgc2hhcGUyOiAuMSxcbiAgICBwcmVnYWluOiA1LFxuICAgIHBvc3RnYWluOiAuNVxuICB9O1xuXG4gIHJldHVybiBEaXN0b3J0aW9uO1xufTsiLCJsZXQgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbmxldCBlZmZlY3QgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuT2JqZWN0LmFzc2lnbiggZWZmZWN0LCB7XG4gIGRlZmF1bHRzOiB7IGJ5cGFzczpmYWxzZSB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVmZmVjdFxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IGVmZmVjdHMgPSB7XG4gICAgRnJlZXZlcmIgICAgOiByZXF1aXJlKCAnLi9mcmVldmVyYi5qcycgICkoIEdpYmJlcmlzaCApLFxuICAgIFBsYXRlICAgICAgIDogcmVxdWlyZSggJy4vZGF0dG9ycm8uanMnICApKCBHaWJiZXJpc2ggKSxcbiAgICBGbGFuZ2VyICAgICA6IHJlcXVpcmUoICcuL2ZsYW5nZXIuanMnICAgKSggR2liYmVyaXNoICksXG4gICAgVmlicmF0byAgICAgOiByZXF1aXJlKCAnLi92aWJyYXRvLmpzJyAgICkoIEdpYmJlcmlzaCApLFxuICAgIERlbGF5ICAgICAgIDogcmVxdWlyZSggJy4vZGVsYXkuanMnICAgICApKCBHaWJiZXJpc2ggKSxcbiAgICBCaXRDcnVzaGVyICA6IHJlcXVpcmUoICcuL2JpdENydXNoZXIuanMnKSggR2liYmVyaXNoICksXG4gICAgRGlzdG9ydGlvbiAgOiByZXF1aXJlKCAnLi9kaXN0b3J0aW9uLmpzJykoIEdpYmJlcmlzaCApLFxuICAgIFJpbmdNb2QgICAgIDogcmVxdWlyZSggJy4vcmluZ01vZC5qcycgICApKCBHaWJiZXJpc2ggKSxcbiAgICBUcmVtb2xvICAgICA6IHJlcXVpcmUoICcuL3RyZW1vbG8uanMnICAgKSggR2liYmVyaXNoICksXG4gICAgQ2hvcnVzICAgICAgOiByZXF1aXJlKCAnLi9jaG9ydXMuanMnICAgICkoIEdpYmJlcmlzaCApLFxuICAgIFNodWZmbGVyICAgIDogcmVxdWlyZSggJy4vYnVmZmVyU2h1ZmZsZXIuanMnICApKCBHaWJiZXJpc2ggKSxcbiAgICAvL0dhdGUgICAgICAgIDogcmVxdWlyZSggJy4vZ2F0ZS5qcycgICAgICApKCBHaWJiZXJpc2ggKSxcbiAgfVxuXG4gIGVmZmVjdHMuZXhwb3J0ID0gdGFyZ2V0ID0+IHtcbiAgICBmb3IoIGxldCBrZXkgaW4gZWZmZWN0cyApIHtcbiAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgICB0YXJnZXRbIGtleSBdID0gZWZmZWN0c1sga2V5IF1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxucmV0dXJuIGVmZmVjdHNcblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIHByb3RvID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBGbGFuZ2VyID0gaW5wdXRQcm9wcyA9PiB7XG4gIGxldCBwcm9wcyAgID0gT2JqZWN0LmFzc2lnbiggeyBkZWxheUxlbmd0aDo0NDEwMCB9LCBGbGFuZ2VyLmRlZmF1bHRzLCBwcm90by5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgZmxhbmdlciA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuICBcbiAgbGV0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgZGVsYXlMZW5ndGggPSBwcm9wcy5kZWxheUxlbmd0aCxcbiAgICAgIGZlZWRiYWNrQ29lZmYgPSBnLmluKCAnZmVlZGJhY2snICksXG4gICAgICBtb2RBbW91bnQgPSBnLmluKCAnb2Zmc2V0JyApLFxuICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgIGRlbGF5QnVmZmVyTCA9IGcuZGF0YSggZGVsYXlMZW5ndGggKSxcbiAgICAgIGRlbGF5QnVmZmVyUlxuXG4gIGxldCB3cml0ZUlkeCA9IGcuYWNjdW0oIDEsMCwgeyBtaW46MCwgbWF4OmRlbGF5TGVuZ3RoLCBpbnRlcnA6J25vbmUnLCBtb2RlOidzYW1wbGVzJyB9KVxuICBcbiAgbGV0IG9mZnNldCA9IGcubXVsKCBtb2RBbW91bnQsIDUwMCApXG5cbiAgbGV0IG1vZCA9IHByb3BzLm1vZCA9PT0gdW5kZWZpbmVkID8gZy5jeWNsZSggZnJlcXVlbmN5ICkgOiBwcm9wcy5tb2RcbiAgXG4gIGxldCByZWFkSWR4ID0gZy53cmFwKCBcbiAgICBnLmFkZCggXG4gICAgICBnLnN1Yiggd3JpdGVJZHgsIG9mZnNldCApLCBcbiAgICAgIG1vZC8vZy5tdWwoIG1vZCwgZy5zdWIoIG9mZnNldCwgMSApICkgXG4gICAgKSwgXG5cdCAgMCwgXG4gICAgZGVsYXlMZW5ndGhcbiAgKVxuXG4gIGxldCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXRcblxuICBsZXQgZGVsYXllZE91dEwgPSBnLnBlZWsoIGRlbGF5QnVmZmVyTCwgcmVhZElkeCwgeyBpbnRlcnA6J2xpbmVhcicsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBnLnBva2UoIGRlbGF5QnVmZmVyTCwgZy5hZGQoIGxlZnRJbnB1dCwgZy5tdWwoIGRlbGF5ZWRPdXRMLCBmZWVkYmFja0NvZWZmICkgKSwgd3JpdGVJZHggKVxuXG4gIGxldCBsZWZ0ID0gZy5hZGQoIGxlZnRJbnB1dCwgZGVsYXllZE91dEwgKSxcbiAgICAgIHJpZ2h0LCBvdXRcblxuXG4gIGlmKCBpc1N0ZXJlbyA9PT0gdHJ1ZSApIHtcbiAgICByaWdodElucHV0ID0gaW5wdXRbMV1cbiAgICBkZWxheUJ1ZmZlclIgPSBnLmRhdGEoIGRlbGF5TGVuZ3RoIClcbiAgICBcbiAgICBsZXQgZGVsYXllZE91dFIgPSBnLnBlZWsoIGRlbGF5QnVmZmVyUiwgcmVhZElkeCwgeyBpbnRlcnA6J2xpbmVhcicsIG1vZGU6J3NhbXBsZXMnIH0pXG5cbiAgICBnLnBva2UoIGRlbGF5QnVmZmVyUiwgZy5hZGQoIHJpZ2h0SW5wdXQsIGcubXVsKCBkZWxheWVkT3V0UiwgZmVlZGJhY2tDb2VmZiApICksIHdyaXRlSWR4IClcbiAgICByaWdodCA9IGcuYWRkKCByaWdodElucHV0LCBkZWxheWVkT3V0UiApXG5cbiAgICBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICBmbGFuZ2VyLFxuICAgICAgWyBsZWZ0LCByaWdodCBdLCBcbiAgICAgIFsnZngnLCdmbGFuZ2VyJ10sIFxuICAgICAgcHJvcHMgXG4gICAgKVxuXG4gIH1lbHNle1xuICAgIG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBmbGFuZ2VyLCBsZWZ0LCBbJ2Z4JywnZmxhbmdlciddLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiBvdXQgXG59XG5cbkZsYW5nZXIuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIGZlZWRiYWNrOi4wMSxcbiAgb2Zmc2V0Oi4yNSxcbiAgZnJlcXVlbmN5Oi41XG59XG5cbnJldHVybiBGbGFuZ2VyXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgXG5jb25zdCBhbGxQYXNzID0gR2liYmVyaXNoLmZpbHRlcnMuZ2VuaXNoLkFsbFBhc3NcbmNvbnN0IGNvbWJGaWx0ZXIgPSBHaWJiZXJpc2guZmlsdGVycy5nZW5pc2guQ29tYlxuXG5jb25zdCB0dW5pbmcgPSB7XG4gIGNvbWJDb3VudDpcdCAgXHQ4LFxuICBjb21iVHVuaW5nOiBcdFx0WyAxMTE2LCAxMTg4LCAxMjc3LCAxMzU2LCAxNDIyLCAxNDkxLCAxNTU3LCAxNjE3IF0sICAgICAgICAgICAgICAgICAgICBcbiAgYWxsUGFzc0NvdW50OiBcdDQsXG4gIGFsbFBhc3NUdW5pbmc6XHRbIDIyNSwgNTU2LCA0NDEsIDM0MSBdLFxuICBhbGxQYXNzRmVlZGJhY2s6MC41LFxuICBmaXhlZEdhaW46IFx0XHQgIDAuMDE1LFxuICBzY2FsZURhbXBpbmc6IFx0MC40LFxuICBzY2FsZVJvb206IFx0XHQgIDAuMjgsXG4gIG9mZnNldFJvb206IFx0ICAwLjcsXG4gIHN0ZXJlb1NwcmVhZDogICAyM1xufVxuXG5jb25zdCBGcmVldmVyYiA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgRnJlZXZlcmIuZGVmYXVsdHMsIGVmZmVjdC5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgcmV2ZXJiID0gT2JqZWN0LmNyZWF0ZSggZWZmZWN0ICkgXG4gICBcbiAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGxldCBjb21ic0wgPSBbXSwgY29tYnNSID0gW11cblxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICB3ZXQxID0gZy5pbiggJ3dldDEnKSwgd2V0MiA9IGcuaW4oICd3ZXQyJyApLCAgZHJ5ID0gZy5pbiggJ2RyeScgKSwgXG4gICAgICByb29tU2l6ZSA9IGcuaW4oICdyb29tU2l6ZScgKSwgZGFtcGluZyA9IGcuaW4oICdkYW1waW5nJyApXG4gIFxuICBsZXQgc3VtbWVkSW5wdXQgPSBpc1N0ZXJlbyA9PT0gdHJ1ZSA/IGcuYWRkKCBpbnB1dFswXSwgaW5wdXRbMV0gKSA6IGlucHV0LFxuICAgICAgYXR0ZW51YXRlZElucHV0ID0gZy5tZW1vKCBnLm11bCggc3VtbWVkSW5wdXQsIHR1bmluZy5maXhlZEdhaW4gKSApXG4gIFxuICAvLyBjcmVhdGUgY29tYiBmaWx0ZXJzIGluIHBhcmFsbGVsLi4uXG4gIGZvciggbGV0IGkgPSAwOyBpIDwgODsgaSsrICkgeyBcbiAgICBjb21ic0wucHVzaCggXG4gICAgICBjb21iRmlsdGVyKCBhdHRlbnVhdGVkSW5wdXQsIHR1bmluZy5jb21iVHVuaW5nW2ldLCBnLm11bChkYW1waW5nLC40KSwgZy5tdWwoIHR1bmluZy5zY2FsZVJvb20gKyB0dW5pbmcub2Zmc2V0Um9vbSwgcm9vbVNpemUgKSApIFxuICAgIClcbiAgICBjb21ic1IucHVzaCggXG4gICAgICBjb21iRmlsdGVyKCBhdHRlbnVhdGVkSW5wdXQsIHR1bmluZy5jb21iVHVuaW5nW2ldICsgdHVuaW5nLnN0ZXJlb1NwcmVhZCwgZy5tdWwoZGFtcGluZywuNCksIGcubXVsKCB0dW5pbmcuc2NhbGVSb29tICsgdHVuaW5nLm9mZnNldFJvb20sIHJvb21TaXplICkgKSBcbiAgICApXG4gIH1cbiAgXG4gIC8vIC4uLiBhbmQgc3VtIHRoZW0gd2l0aCBhdHRlbnVhdGVkIGlucHV0XG4gIGxldCBvdXRMID0gZy5hZGQoIGF0dGVudWF0ZWRJbnB1dCwgLi4uY29tYnNMIClcbiAgbGV0IG91dFIgPSBnLmFkZCggYXR0ZW51YXRlZElucHV0LCAuLi5jb21ic1IgKVxuICBcbiAgLy8gcnVuIHRocm91Z2ggYWxscGFzcyBmaWx0ZXJzIGluIHNlcmllc1xuICBmb3IoIGxldCBpID0gMDsgaSA8IDQ7IGkrKyApIHsgXG4gICAgb3V0TCA9IGFsbFBhc3MoIG91dEwsIHR1bmluZy5hbGxQYXNzVHVuaW5nWyBpIF0gKyB0dW5pbmcuc3RlcmVvU3ByZWFkIClcbiAgICBvdXRSID0gYWxsUGFzcyggb3V0UiwgdHVuaW5nLmFsbFBhc3NUdW5pbmdbIGkgXSArIHR1bmluZy5zdGVyZW9TcHJlYWQgKVxuICB9XG4gIFxuICBsZXQgb3V0cHV0TCA9IGcuYWRkKCBnLm11bCggb3V0TCwgd2V0MSApLCBnLm11bCggb3V0Uiwgd2V0MiApLCBnLm11bCggaXNTdGVyZW8gPT09IHRydWUgPyBpbnB1dFswXSA6IGlucHV0LCBkcnkgKSApLFxuICAgICAgb3V0cHV0UiA9IGcuYWRkKCBnLm11bCggb3V0Uiwgd2V0MSApLCBnLm11bCggb3V0TCwgd2V0MiApLCBnLm11bCggaXNTdGVyZW8gPT09IHRydWUgPyBpbnB1dFsxXSA6IGlucHV0LCBkcnkgKSApXG5cbiAgY29uc3Qgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIHJldmVyYiwgWyBvdXRwdXRMLCBvdXRwdXRSIF0sIFsnZngnLCdmcmVldmVyYiddLCBwcm9wcyApXG5cbiAgcmV0dXJuIG91dFxufVxuXG5cbkZyZWV2ZXJiLmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICB3ZXQxOiAxLFxuICB3ZXQyOiAwLFxuICBkcnk6IC41LFxuICByb29tU2l6ZTogLjg0LFxuICBkYW1waW5nOiAgLjVcbn1cblxucmV0dXJuIEZyZWV2ZXJiIFxuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IFJpbmdNb2QgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzICAgPSBPYmplY3QuYXNzaWduKCB7fSwgUmluZ01vZC5kZWZhdWx0cywgZWZmZWN0LmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICByaW5nTW9kID0gT2JqZWN0LmNyZWF0ZSggZWZmZWN0IClcblxuICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuICBcbiAgbGV0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgIGdhaW4gPSBnLmluKCAnZ2FpbicgKSxcbiAgICAgIG1peCA9IGcuaW4oICdtaXgnIClcbiAgXG4gIGxldCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXQsXG4gICAgICBzaW5lID0gZy5tdWwoIGcuY3ljbGUoIGZyZXF1ZW5jeSApLCBnYWluIClcbiBcbiAgbGV0IGxlZnQgPSBnLmFkZCggZy5tdWwoIGxlZnRJbnB1dCwgZy5zdWIoIDEsIG1peCApKSwgZy5tdWwoIGcubXVsKCBsZWZ0SW5wdXQsIHNpbmUgKSwgbWl4ICkgKSwgXG4gICAgICByaWdodFxuXG4gIGxldCBvdXRcbiAgaWYoIGlzU3RlcmVvID09PSB0cnVlICkge1xuICAgIGxldCByaWdodElucHV0ID0gaW5wdXRbMV1cbiAgICByaWdodCA9IGcuYWRkKCBnLm11bCggcmlnaHRJbnB1dCwgZy5zdWIoIDEsIG1peCApKSwgZy5tdWwoIGcubXVsKCByaWdodElucHV0LCBzaW5lICksIG1peCApICkgXG4gICAgXG4gICAgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgcmluZ01vZCxcbiAgICAgIFsgbGVmdCwgcmlnaHQgXSwgXG4gICAgICAncmluZ01vZCcsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeSggcmluZ01vZCwgbGVmdCwgWydmeCcsJ3JpbmdNb2QnXSwgcHJvcHMgKVxuICB9XG4gIFxuICByZXR1cm4gb3V0IFxufVxuXG5SaW5nTW9kLmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBmcmVxdWVuY3k6MjIwLFxuICBnYWluOiAxLCBcbiAgbWl4OjFcbn1cblxucmV0dXJuIFJpbmdNb2RcblxufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxuY29uc3QgVHJlbW9sbyA9IGlucHV0UHJvcHMgPT4ge1xuICBjb25zdCBwcm9wcyAgID0gT2JqZWN0LmFzc2lnbigge30sIFRyZW1vbG8uZGVmYXVsdHMsIGVmZmVjdC5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgICB0cmVtb2xvID0gT2JqZWN0LmNyZWF0ZSggZWZmZWN0IClcblxuICBjb25zdCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBjb25zdCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgYW1vdW50ID0gZy5pbiggJ2Ftb3VudCcgKVxuICBcbiAgY29uc3QgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0XG5cbiAgbGV0IG9zY1xuICBpZiggcHJvcHMuc2hhcGUgPT09ICdzcXVhcmUnICkge1xuICAgIG9zYyA9IGcuZ3QoIGcucGhhc29yKCBmcmVxdWVuY3kgKSwgMCApXG4gIH1lbHNlIGlmKCBwcm9wcy5zaGFwZSA9PT0gJ3NhdycgKSB7XG4gICAgb3NjID0gZy5ndHAoIGcucGhhc29yKCBmcmVxdWVuY3kgKSwgMCApXG4gIH1lbHNle1xuICAgIG9zYyA9IGcuY3ljbGUoIGZyZXF1ZW5jeSApXG4gIH1cblxuICBjb25zdCBtb2QgPSBnLm11bCggb3NjLCBhbW91bnQgKVxuIFxuICBsZXQgbGVmdCA9IGcuc3ViKCBsZWZ0SW5wdXQsIGcubXVsKCBsZWZ0SW5wdXQsIG1vZCApICksIFxuICAgICAgcmlnaHQsIG91dFxuXG4gIGlmKCBpc1N0ZXJlbyA9PT0gdHJ1ZSApIHtcbiAgICBsZXQgcmlnaHRJbnB1dCA9IGlucHV0WzFdXG4gICAgcmlnaHQgPSBnLm11bCggcmlnaHRJbnB1dCwgbW9kIClcblxuICAgIG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIHRyZW1vbG8sXG4gICAgICBbIGxlZnQsIHJpZ2h0IF0sIFxuICAgICAgWydmeCcsJ3RyZW1vbG8nXSwgXG4gICAgICBwcm9wcyBcbiAgICApXG4gIH1lbHNle1xuICAgIG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCB0cmVtb2xvLCBsZWZ0LCBbJ2Z4JywndHJlbW9sbyddLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiBvdXQgXG59XG5cblRyZW1vbG8uZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIGZyZXF1ZW5jeToyLFxuICBhbW91bnQ6IDEsIFxuICBzaGFwZTonc2luZSdcbn1cblxucmV0dXJuIFRyZW1vbG9cblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgVmlicmF0byA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgICA9IE9iamVjdC5hc3NpZ24oIHt9LCBWaWJyYXRvLmRlZmF1bHRzLCBlZmZlY3QuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgIHZpYnJhdG8gPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICBkZWxheUxlbmd0aCA9IDQ0MTAwLFxuICAgICAgZmVlZGJhY2tDb2VmZiA9IC4wMSwvL2cuaW4oICdmZWVkYmFjaycgKSxcbiAgICAgIG1vZEFtb3VudCA9IGcuaW4oICdhbW91bnQnICksXG4gICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgZGVsYXlCdWZmZXJMID0gZy5kYXRhKCBkZWxheUxlbmd0aCApLFxuICAgICAgZGVsYXlCdWZmZXJSXG5cbiAgbGV0IHdyaXRlSWR4ID0gZy5hY2N1bSggMSwwLCB7IG1pbjowLCBtYXg6ZGVsYXlMZW5ndGgsIGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBsZXQgb2Zmc2V0ID0gZy5tdWwoIG1vZEFtb3VudCwgNTAwIClcbiAgXG4gIGxldCByZWFkSWR4ID0gZy53cmFwKCBcbiAgICBnLmFkZCggXG4gICAgICBnLnN1Yiggd3JpdGVJZHgsIG9mZnNldCApLCBcbiAgICAgIGcubXVsKCBnLmN5Y2xlKCBmcmVxdWVuY3kgKSwgZy5zdWIoIG9mZnNldCwgMSApICkgXG4gICAgKSwgXG5cdCAgMCwgXG4gICAgZGVsYXlMZW5ndGhcbiAgKVxuXG4gIGxldCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXRcblxuICBsZXQgZGVsYXllZE91dEwgPSBnLnBlZWsoIGRlbGF5QnVmZmVyTCwgcmVhZElkeCwgeyBpbnRlcnA6J2xpbmVhcicsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBnLnBva2UoIGRlbGF5QnVmZmVyTCwgZy5hZGQoIGxlZnRJbnB1dCwgZy5tdWwoIGRlbGF5ZWRPdXRMLCBmZWVkYmFja0NvZWZmICkgKSwgd3JpdGVJZHggKVxuXG4gIGxldCBsZWZ0ID0gZGVsYXllZE91dEwsXG4gICAgICByaWdodCwgb3V0XG5cbiAgaWYoIGlzU3RlcmVvID09PSB0cnVlICkge1xuICAgIHJpZ2h0SW5wdXQgPSBpbnB1dFsxXVxuICAgIGRlbGF5QnVmZmVyUiA9IGcuZGF0YSggZGVsYXlMZW5ndGggKVxuICAgIFxuICAgIGxldCBkZWxheWVkT3V0UiA9IGcucGVlayggZGVsYXlCdWZmZXJSLCByZWFkSWR4LCB7IGludGVycDonbGluZWFyJywgbW9kZTonc2FtcGxlcycgfSlcblxuICAgIGcucG9rZSggZGVsYXlCdWZmZXJSLCBnLmFkZCggcmlnaHRJbnB1dCwgbXVsKCBkZWxheWVkT3V0UiwgZmVlZGJhY2tDb2VmZiApICksIHdyaXRlSWR4IClcbiAgICByaWdodCA9IGRlbGF5ZWRPdXRSXG5cbiAgICBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICB2aWJyYXRvLFxuICAgICAgWyBsZWZ0LCByaWdodCBdLCBcbiAgICAgIFsgJ2Z4JywgJ3ZpYnJhdG8nXSwgXG4gICAgICBwcm9wcyBcbiAgICApXG4gIH1lbHNle1xuICAgIG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCB2aWJyYXRvLCBsZWZ0LCBbJ2Z4JywndmlicmF0byddLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiBvdXQgXG59XG5cblZpYnJhdG8uZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIC8vZmVlZGJhY2s6LjAxLFxuICBhbW91bnQ6LjUsXG4gIGZyZXF1ZW5jeTo0XG59XG5cbnJldHVybiBWaWJyYXRvXG5cbn1cbiIsImxldCBNZW1vcnlIZWxwZXIgPSByZXF1aXJlKCAnbWVtb3J5LWhlbHBlcicgKSxcbiAgICBnZW5pc2ggICAgICAgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG4gICAgXG5sZXQgR2liYmVyaXNoID0ge1xuICBibG9ja0NhbGxiYWNrczogW10sIC8vIGNhbGxlZCBldmVyeSBibG9ja1xuICBkaXJ0eVVnZW5zOiBbXSxcbiAgY2FsbGJhY2tVZ2VuczogW10sXG4gIGNhbGxiYWNrTmFtZXM6IFtdLFxuICBhbmFseXplcnM6IFtdLFxuICBncmFwaElzRGlydHk6IGZhbHNlLFxuICB1Z2Vuczoge30sXG4gIGRlYnVnOiBmYWxzZSxcbiAgaWQ6IC0xLFxuICBwcmV2ZW50UHJveHk6ZmFsc2UsXG5cbiAgb3V0cHV0OiBudWxsLFxuXG4gIG1lbW9yeSA6IG51bGwsIC8vIDIwIG1pbnV0ZXMgYnkgZGVmYXVsdD9cbiAgZmFjdG9yeTogbnVsbCwgXG4gIGdlbmlzaCxcbiAgc2NoZWR1bGVyOiByZXF1aXJlKCAnLi9zY2hlZHVsaW5nL3NjaGVkdWxlci5qcycgKSxcbiAgLy93b3JrbGV0UHJvY2Vzc29yTG9hZGVyOiByZXF1aXJlKCAnLi93b3JrbGV0UHJvY2Vzc29yLmpzJyApLFxuICB3b3JrbGV0UHJvY2Vzc29yOiBudWxsLFxuXG4gIG1lbW9lZDoge30sXG4gIG1vZGU6J3NjcmlwdFByb2Nlc3NvcicsXG5cbiAgcHJvdG90eXBlczoge1xuICAgIHVnZW46IHJlcXVpcmUoJy4vdWdlbi5qcycpLFxuICAgIGluc3RydW1lbnQ6IHJlcXVpcmUoICcuL2luc3RydW1lbnRzL2luc3RydW1lbnQuanMnICksXG4gICAgZWZmZWN0OiByZXF1aXJlKCAnLi9meC9lZmZlY3QuanMnICksXG4gIH0sXG5cbiAgbWl4aW5zOiB7XG4gICAgcG9seWluc3RydW1lbnQ6IHJlcXVpcmUoICcuL2luc3RydW1lbnRzL3BvbHlNaXhpbi5qcycgKVxuICB9LFxuXG4gIHdvcmtsZXRQYXRoOiAnLi9naWJiZXJpc2hfd29ya2xldC5qcycsXG4gIGluaXQoIG1lbUFtb3VudCwgY3R4LCBtb2RlICkge1xuXG4gICAgbGV0IG51bUJ5dGVzID0gaXNOYU4oIG1lbUFtb3VudCApID8gMjAgKiA2MCAqIDQ0MTAwIDogbWVtQW1vdW50XG5cbiAgICAvLyByZWdhcmRsZXNzIG9mIHdoZXRoZXIgb3Igbm90IGdpYmJlcmlzaCBpcyB1c2luZyB3b3JrbGV0cyxcbiAgICAvLyB3ZSBzdGlsbCB3YW50IGdlbmlzaCB0byBvdXRwdXQgdmFuaWxsYSBqcyBmdW5jdGlvbnMgaW5zdGVhZFxuICAgIC8vIG9mIGF1ZGlvIHdvcmtsZXQgY2xhc3NlczsgdGhlc2UgZnVuY3Rpb25zIHdpbGwgYmUgY2FsbGVkXG4gICAgLy8gZnJvbSB3aXRoaW4gdGhlIGdpYmJlcmlzaCBhdWRpb3dvcmtsZXQgcHJvY2Vzc29yIG5vZGUuXG4gICAgdGhpcy5nZW5pc2guZ2VuLm1vZGUgPSAnc2NyaXB0UHJvY2Vzc29yJ1xuXG4gICAgdGhpcy5tZW1vcnkgPSBNZW1vcnlIZWxwZXIuY3JlYXRlKCBudW1CeXRlcyApXG5cbiAgICB0aGlzLm1vZGUgPSB3aW5kb3cuQXVkaW9Xb3JrbGV0ICE9PSB1bmRlZmluZWQgPyAnd29ya2xldCcgOiAnc2NyaXB0cHJvY2Vzc29yJ1xuICAgIGlmKCBtb2RlICE9PSB1bmRlZmluZWQgKSB0aGlzLm1vZGUgPSBtb2RlXG5cbiAgICB0aGlzLmhhc1dvcmtsZXQgPSB3aW5kb3cuQXVkaW9Xb3JrbGV0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHdpbmRvdy5BdWRpb1dvcmtsZXQgPT09ICdmdW5jdGlvbidcblxuICAgIGNvbnN0IHN0YXJ0dXAgPSB0aGlzLmhhc1dvcmtsZXQgPyB0aGlzLnV0aWxpdGllcy5jcmVhdGVXb3JrbGV0IDogdGhpcy51dGlsaXRpZXMuY3JlYXRlU2NyaXB0UHJvY2Vzc29yXG4gICAgXG4gICAgdGhpcy5hbmFseXplcnMuZGlydHkgPSBmYWxzZVxuXG4gICAgaWYoIHRoaXMubW9kZSA9PT0gJ3dvcmtsZXQnICkge1xuXG4gICAgICBjb25zdCBwID0gbmV3IFByb21pc2UoIChyZXNvbHZlLCByZWplY3QgKSA9PiB7XG5cbiAgICAgICAgY29uc3QgcHAgPSBuZXcgUHJvbWlzZSggKF9fcmVzb2x2ZSwgX19yZWplY3QgKSA9PiB7XG4gICAgICAgICAgdGhpcy51dGlsaXRpZXMuY3JlYXRlQ29udGV4dCggY3R4LCBzdGFydHVwLmJpbmQoIHRoaXMudXRpbGl0aWVzICksIF9fcmVzb2x2ZSApXG4gICAgICAgIH0pLnRoZW4oICgpPT4ge1xuICAgICAgICAgIEdpYmJlcmlzaC5wcmV2ZW50UHJveHkgPSB0cnVlXG4gICAgICAgICAgR2liYmVyaXNoLmxvYWQoKVxuICAgICAgICAgIEdpYmJlcmlzaC5vdXRwdXQgPSB0aGlzLkJ1czIoKVxuICAgICAgICAgIEdpYmJlcmlzaC5wcmV2ZW50UHJveHkgPSBmYWxzZVxuXG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgIH0pXG4gICAgICByZXR1cm4gcFxuICAgIH1lbHNlIGlmKCB0aGlzLm1vZGUgPT09ICdwcm9jZXNzb3InICkge1xuICAgICAgR2liYmVyaXNoLmxvYWQoKVxuICAgICAgR2liYmVyaXNoLm91dHB1dCA9IHRoaXMuQnVzMigpXG4gICAgfVxuXG5cbiAgfSxcblxuICBsb2FkKCkge1xuICAgIHRoaXMuZmFjdG9yeSA9IHJlcXVpcmUoICcuL3VnZW5UZW1wbGF0ZS5qcycgKSggdGhpcyApXG5cbiAgICB0aGlzLlBhbm5lciAgICAgICA9IHJlcXVpcmUoICcuL21pc2MvcGFubmVyLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLlBvbHlUZW1wbGF0ZSA9IHJlcXVpcmUoICcuL2luc3RydW1lbnRzL3BvbHl0ZW1wbGF0ZS5qcycgKSggdGhpcyApXG4gICAgdGhpcy5vc2NpbGxhdG9ycyAgPSByZXF1aXJlKCAnLi9vc2NpbGxhdG9ycy9vc2NpbGxhdG9ycy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5maWx0ZXJzICAgICAgPSByZXF1aXJlKCAnLi9maWx0ZXJzL2ZpbHRlcnMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuYmlub3BzICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9iaW5vcHMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMubW9ub3BzICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9tb25vcHMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuQnVzICAgICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9idXMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuQnVzMiAgICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9idXMyLmpzJyApKCB0aGlzICk7XG4gICAgdGhpcy5pbnN0cnVtZW50cyAgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50cy9pbnN0cnVtZW50cy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5meCAgICAgICAgICAgPSByZXF1aXJlKCAnLi9meC9lZmZlY3RzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLlNlcXVlbmNlciAgICA9IHJlcXVpcmUoICcuL3NjaGVkdWxpbmcvc2VxdWVuY2VyLmpzJyApKCB0aGlzICk7XG4gICAgdGhpcy5TZXF1ZW5jZXIyICAgPSByZXF1aXJlKCAnLi9zY2hlZHVsaW5nL3NlcTIuanMnICkoIHRoaXMgKTtcbiAgICB0aGlzLmVudmVsb3BlcyAgICA9IHJlcXVpcmUoICcuL2VudmVsb3Blcy9lbnZlbG9wZXMuanMnICkoIHRoaXMgKTtcbiAgICB0aGlzLmFuYWx5c2lzICAgICA9IHJlcXVpcmUoICcuL2FuYWx5c2lzL2FuYWx5emVycy5qcycgKSggdGhpcyApXG4gICAgdGhpcy50aW1lICAgICAgICAgPSByZXF1aXJlKCAnLi9taXNjL3RpbWUuanMnICkoIHRoaXMgKVxuICB9LFxuXG4gIGV4cG9ydCggdGFyZ2V0LCBzaG91bGRFeHBvcnRHZW5pc2g9ZmFsc2UgKSB7XG4gICAgaWYoIHRhcmdldCA9PT0gdW5kZWZpbmVkICkgdGhyb3cgRXJyb3IoJ1lvdSBtdXN0IGRlZmluZSBhIHRhcmdldCBvYmplY3QgZm9yIEdpYmJlcmlzaCB0byBleHBvcnQgdmFyaWFibGVzIHRvLicpXG5cbiAgICBpZiggc2hvdWxkRXhwb3J0R2VuaXNoICkgdGhpcy5nZW5pc2guZXhwb3J0KCB0YXJnZXQgKVxuXG4gICAgdGhpcy5pbnN0cnVtZW50cy5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5meC5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5maWx0ZXJzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLm9zY2lsbGF0b3JzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLmJpbm9wcy5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5tb25vcHMuZXhwb3J0KCB0YXJnZXQgKVxuICAgIHRoaXMuZW52ZWxvcGVzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLmFuYWx5c2lzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0YXJnZXQuU2VxdWVuY2VyID0gdGhpcy5TZXF1ZW5jZXJcbiAgICB0YXJnZXQuU2VxdWVuY2VyMiA9IHRoaXMuU2VxdWVuY2VyMlxuICAgIHRhcmdldC5CdXMgPSB0aGlzLkJ1c1xuICAgIHRhcmdldC5CdXMyID0gdGhpcy5CdXMyXG4gICAgdGFyZ2V0LlNjaGVkdWxlciA9IHRoaXMuc2NoZWR1bGVyXG4gICAgdGhpcy50aW1lLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLnV0aWxpdGllcy5leHBvcnQoIHRhcmdldCApXG4gIH0sXG5cbiAgcHJpbnQoKSB7XG4gICAgY29uc29sZS5sb2coIHRoaXMuY2FsbGJhY2sudG9TdHJpbmcoKSApXG4gIH0sXG5cbiAgZGlydHkoIHVnZW4gKSB7XG4gICAgaWYoIHVnZW4gPT09IHRoaXMuYW5hbHl6ZXJzICkge1xuICAgICAgdGhpcy5ncmFwaElzRGlydHkgPSB0cnVlXG4gICAgICB0aGlzLmFuYWx5emVycy5kaXJ0eSA9IHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kaXJ0eVVnZW5zLnB1c2goIHVnZW4gKVxuICAgICAgdGhpcy5ncmFwaElzRGlydHkgPSB0cnVlXG4gICAgICBpZiggdGhpcy5tZW1vZWRbIHVnZW4udWdlbk5hbWUgXSApIHtcbiAgICAgICAgZGVsZXRlIHRoaXMubWVtb2VkWyB1Z2VuLnVnZW5OYW1lIF1cbiAgICAgIH1cbiAgICB9IFxuICB9LFxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMub3V0cHV0LmlucHV0cyA9IFswXVxuICAgIC8vdGhpcy5vdXRwdXQuaW5wdXROYW1lcy5sZW5ndGggPSAwXG4gICAgdGhpcy5hbmFseXplcnMubGVuZ3RoID0gMFxuICAgIHRoaXMuc2NoZWR1bGVyLmNsZWFyKClcbiAgICB0aGlzLmRpcnR5KCB0aGlzLm91dHB1dCApXG4gICAgaWYoIHRoaXMubW9kZSA9PT0gJ3dvcmtsZXQnICkge1xuICAgICAgdGhpcy53b3JrbGV0LnBvcnQucG9zdE1lc3NhZ2UoeyBcbiAgICAgICAgYWRkcmVzczonbWV0aG9kJywgXG4gICAgICAgIG9iamVjdDp0aGlzLmlkLFxuICAgICAgICBuYW1lOidjbGVhcicsXG4gICAgICAgIGFyZ3M6W11cbiAgICAgIH0pXG4gICAgfVxuICB9LFxuXG4gIGdlbmVyYXRlQ2FsbGJhY2soKSB7XG4gICAgaWYoIHRoaXMubW9kZSA9PT0gJ3dvcmtsZXQnICkge1xuICAgICAgR2liYmVyaXNoLmNhbGxiYWNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwIH1cbiAgICAgIHJldHVybiBHaWJiZXJpc2guY2FsbGJhY2tcbiAgICB9XG4gICAgbGV0IHVpZCA9IDAsXG4gICAgICAgIGNhbGxiYWNrQm9keSwgbGFzdExpbmUsIGFuYWx5c2lzPScnXG5cbiAgICB0aGlzLm1lbW9lZCA9IHt9XG5cbiAgICBjYWxsYmFja0JvZHkgPSB0aGlzLnByb2Nlc3NHcmFwaCggdGhpcy5vdXRwdXQgKVxuICAgIGxhc3RMaW5lID0gY2FsbGJhY2tCb2R5WyBjYWxsYmFja0JvZHkubGVuZ3RoIC0gMV1cbiAgICBjYWxsYmFja0JvZHkudW5zaGlmdCggXCJcXHQndXNlIHN0cmljdCdcIiApXG5cbiAgICB0aGlzLmFuYWx5emVycy5mb3JFYWNoKCB2PT4ge1xuICAgICAgY29uc3QgYW5hbHlzaXNCbG9jayA9IEdpYmJlcmlzaC5wcm9jZXNzVWdlbiggdiApXG4gICAgICAvL2lmKCBHaWJiZXJpc2gubW9kZSA9PT0gJ3Byb2Nlc3NvcicgKSB7XG4gICAgICAvLyAgY29uc29sZS5sb2coICdhbmFseXNpczonLCBhbmFseXNpc0Jsb2NrLCB2ICApXG4gICAgICAvL31cbiAgICAgIGNvbnN0IGFuYWx5c2lzTGluZSA9IGFuYWx5c2lzQmxvY2sucG9wKClcblxuICAgICAgYW5hbHlzaXNCbG9jay5mb3JFYWNoKCB2PT4ge1xuICAgICAgICBjYWxsYmFja0JvZHkuc3BsaWNlKCBjYWxsYmFja0JvZHkubGVuZ3RoIC0gMSwgMCwgdiApXG4gICAgICB9KVxuXG4gICAgICBjYWxsYmFja0JvZHkucHVzaCggYW5hbHlzaXNMaW5lIClcbiAgICB9KVxuXG4gICAgdGhpcy5hbmFseXplcnMuZm9yRWFjaCggdiA9PiB7XG4gICAgICBpZiggdGhpcy5jYWxsYmFja1VnZW5zLmluZGV4T2YoIHYuY2FsbGJhY2sgKSA9PT0gLTEgKVxuICAgICAgICB0aGlzLmNhbGxiYWNrVWdlbnMucHVzaCggdi5jYWxsYmFjayApXG4gICAgfSlcbiAgICB0aGlzLmNhbGxiYWNrTmFtZXMgPSB0aGlzLmNhbGxiYWNrVWdlbnMubWFwKCB2ID0+IHYudWdlbk5hbWUgKVxuXG4gICAgY2FsbGJhY2tCb2R5LnB1c2goICdcXG5cXHRyZXR1cm4gJyArIGxhc3RMaW5lLnNwbGl0KCAnPScgKVswXS5zcGxpdCggJyAnIClbMV0gKVxuXG4gICAgaWYoIHRoaXMuZGVidWcgKSBjb25zb2xlLmxvZyggJ2NhbGxiYWNrOlxcbicsIGNhbGxiYWNrQm9keS5qb2luKCdcXG4nKSApXG4gICAgdGhpcy5jYWxsYmFja05hbWVzLnB1c2goICdtZW1vcnknIClcbiAgICB0aGlzLmNhbGxiYWNrVWdlbnMucHVzaCggdGhpcy5tZW1vcnkuaGVhcCApXG4gICAgdGhpcy5jYWxsYmFjayA9IEZ1bmN0aW9uKCAuLi50aGlzLmNhbGxiYWNrTmFtZXMsIGNhbGxiYWNrQm9keS5qb2luKCAnXFxuJyApIClcbiAgICB0aGlzLmNhbGxiYWNrLm91dCA9IFtdXG5cbiAgICBpZiggdGhpcy5vbmNhbGxiYWNrICkgdGhpcy5vbmNhbGxiYWNrKCB0aGlzLmNhbGxiYWNrIClcblxuICAgIHJldHVybiB0aGlzLmNhbGxiYWNrIFxuICB9LFxuXG4gIHByb2Nlc3NHcmFwaCggb3V0cHV0ICkge1xuICAgIHRoaXMuY2FsbGJhY2tVZ2Vucy5sZW5ndGggPSAwXG4gICAgdGhpcy5jYWxsYmFja05hbWVzLmxlbmd0aCA9IDBcblxuICAgIHRoaXMuY2FsbGJhY2tVZ2Vucy5wdXNoKCBvdXRwdXQuY2FsbGJhY2sgKVxuXG4gICAgbGV0IGJvZHkgPSB0aGlzLnByb2Nlc3NVZ2VuKCBvdXRwdXQgKVxuICAgIFxuXG4gICAgdGhpcy5kaXJ0eVVnZW5zLmxlbmd0aCA9IDBcbiAgICB0aGlzLmdyYXBoSXNEaXJ0eSA9IGZhbHNlXG5cbiAgICByZXR1cm4gYm9keVxuICB9LFxuICBwcm94eVJlcGxhY2UoIG9iaiApIHtcbiAgICBpZiggdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgKSB7XG4gICAgICBpZiggb2JqLmlkICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIGNvbnN0IF9fb2JqID0gcHJvY2Vzc29yLnVnZW5zLmdldCggb2JqLmlkIClcbiAgICAgICAgLy9jb25zb2xlLmxvZyggJ3JldHJpZXZlZDonLCBfX29iai5uYW1lIClcblxuICAgICAgICAvL2lmKCBvYmoucHJvcCAhPT0gdW5kZWZpbmVkICkgY29uc29sZS5sb2coICdnb3QgYSBzc2Qub3V0Jywgb2JqIClcbiAgICAgICAgcmV0dXJuIG9iai5wcm9wICE9PSB1bmRlZmluZWQgPyBfX29ialsgb2JqLnByb3AgXSA6IF9fb2JqXG4gICAgICB9IFxuICAgIH1cblxuICAgIHJldHVybiBvYmpcbiAgfSxcbiAgcHJvY2Vzc1VnZW4oIHVnZW4sIGJsb2NrICkge1xuICAgIGlmKCBibG9jayA9PT0gdW5kZWZpbmVkICkgYmxvY2sgPSBbXVxuXG4gICAgbGV0IGRpcnR5SWR4ID0gR2liYmVyaXNoLmRpcnR5VWdlbnMuaW5kZXhPZiggdWdlbiApXG5cbiAgICAvL2NvbnNvbGUubG9nKCAndWdlbk5hbWU6JywgdWdlbi51Z2VuTmFtZSApXG4gICAgbGV0IG1lbW8gPSBHaWJiZXJpc2gubWVtb2VkWyB1Z2VuLnVnZW5OYW1lIF1cblxuICAgIGlmKCBtZW1vICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0gZWxzZSBpZiAodWdlbiA9PT0gdHJ1ZSB8fCB1Z2VuID09PSBmYWxzZSkge1xuICAgICAgdGhyb3cgXCJXaHkgaXMgdWdlbiBhIGJvb2xlYW4/IFt0cnVlXSBvciBbZmFsc2VdXCI7XG4gICAgfSBlbHNlIGlmKCB1Z2VuLmJsb2NrID09PSB1bmRlZmluZWQgfHwgZGlydHlJbmRleCAhPT0gLTEgKSB7XG5cbiAgXG4gICAgICBsZXQgbGluZSA9IGBcXHR2YXIgdl8ke3VnZW4uaWR9ID0gYCBcbiAgICAgIFxuICAgICAgaWYoICF1Z2VuLmJpbm9wICkgbGluZSArPSBgJHt1Z2VuLnVnZW5OYW1lfSggYFxuXG4gICAgICAvLyBtdXN0IGdldCBhcnJheSBzbyB3ZSBjYW4ga2VlcCB0cmFjayBvZiBsZW5ndGggZm9yIGNvbW1hIGluc2VydGlvblxuICAgICAgbGV0IGtleXMsZXJyXG4gICAgICBcbiAgICAgIC8vdHJ5IHtcbiAgICAgIGtleXMgPSB1Z2VuLmJpbm9wID09PSB0cnVlIHx8IHVnZW4udHlwZSA9PT0gJ2J1cycgfHwgdWdlbi50eXBlID09PSAnYW5hbHlzaXMnID8gT2JqZWN0LmtleXMoIHVnZW4uaW5wdXRzICkgOiBbLi4udWdlbi5pbnB1dE5hbWVzIF0gXG5cbiAgICAgIC8vfWNhdGNoKCBlICl7XG5cbiAgICAgIC8vICBjb25zb2xlLmxvZyggZSApXG4gICAgICAvLyAgZXJyID0gdHJ1ZVxuICAgICAgLy99XG4gICAgICBcbiAgICAgIC8vaWYoIGVyciA9PT0gdHJ1ZSApIHJldHVyblxuXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGxldCBrZXkgPSBrZXlzWyBpIF1cbiAgICAgICAgLy8gYmlub3AuaW5wdXRzIGlzIGFjdHVhbCB2YWx1ZXMsIG5vdCBqdXN0IHByb3BlcnR5IG5hbWVzXG4gICAgICAgIGxldCBpbnB1dCBcbiAgICAgICAgaWYoIHVnZW4uYmlub3AgfHwgdWdlbi50eXBlID09PSdidXMnIHx8IHVnZW4udHlwZSA9PT0gJ2FuYWx5c2lzJyApIHtcbiAgICAgICAgICBpbnB1dCA9IHVnZW4uaW5wdXRzWyBrZXkgXVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAvL2lmKCBrZXkgPT09ICdtZW1vcnknICkgY29udGludWU7XG4gIFxuICAgICAgICAgIGlucHV0ID0gdWdlblsga2V5IF0gXG4gICAgICAgIH1cblxuICAgICAgICAvL2lmKCBHaWJiZXJpc2gubW9kZSA9PT0gJ3Byb2Nlc3NvcicgKSBjb25zb2xlLmxvZyggJ3Byb2Nlc3NvciBpbnB1dDonLCBpbnB1dCwga2V5LCB1Z2VuIClcbiAgICAgICAgaWYoIGlucHV0ICE9PSB1bmRlZmluZWQgKSB7IFxuICAgICAgICAgIGlmKCBpbnB1dC5ieXBhc3MgPT09IHRydWUgKSB7XG4gICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggaW5wdXRzIG9mIGNoYWluIHVudGlsIG9uZSBpcyBmb3VuZFxuICAgICAgICAgICAgLy8gdGhhdCBpcyBub3QgYmVpbmcgYnlwYXNzZWRcblxuICAgICAgICAgICAgbGV0IGZvdW5kID0gZmFsc2VcblxuICAgICAgICAgICAgd2hpbGUoIGlucHV0LmlucHV0ICE9PSAndW5kZWZpbmVkJyAmJiBmb3VuZCA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICAgIGlmKCB0eXBlb2YgaW5wdXQuaW5wdXQuYnlwYXNzICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IGlucHV0LmlucHV0XG4gICAgICAgICAgICAgICAgaWYoIGlucHV0LmJ5cGFzcyA9PT0gZmFsc2UgKSBmb3VuZCA9IHRydWVcbiAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBpbnB1dC5pbnB1dFxuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoIHR5cGVvZiBpbnB1dCA9PT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgICAgIGxpbmUgKz0gaW5wdXRcbiAgICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiBpbnB1dCA9PT0gJ2Jvb2xlYW4nICkge1xuICAgICAgICAgICAgICBsaW5lICs9ICcnICsgaW5wdXRcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdrZXk6Jywga2V5LCAnaW5wdXQ6JywgdWdlbi5pbnB1dHMsIHVnZW4uaW5wdXRzWyBrZXkgXSApIFxuICAgICAgICAgICAgLy8gWFhYIG5vdCBzdXJlIHdoeSB0aGlzIGhhcyB0byBiZSBoZXJlLCBidXQgc29tZWhvdyBub24tcHJvY2Vzc2VkIG9iamVjdHNcbiAgICAgICAgICAgIC8vIHRoYXQgb25seSBjb250YWluIGlkIG51bWJlcnMgYXJlIGJlaW5nIHBhc3NlZCBoZXJlLi4uXG5cbiAgICAgICAgICAgIGlmKCBHaWJiZXJpc2gubW9kZSA9PT0gJ3Byb2Nlc3NvcicgKSB7XG4gICAgICAgICAgICAgIGlmKCBpbnB1dC51Z2VuTmFtZSA9PT0gdW5kZWZpbmVkICYmIGlucHV0LmlkICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBHaWJiZXJpc2gucHJvY2Vzc29yLnVnZW5zLmdldCggaW5wdXQuaWQgKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIEdpYmJlcmlzaC5wcm9jZXNzVWdlbiggaW5wdXQsIGJsb2NrIClcblxuICAgICAgICAgICAgLy9pZiggaW5wdXQuY2FsbGJhY2sgPT09IHVuZGVmaW5lZCApIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlmKCAhaW5wdXQuYmlub3AgKSB7XG4gICAgICAgICAgICAgIC8vIGNoZWNrIGlzIG5lZWRlZCBzbyB0aGF0IGdyYXBocyB3aXRoIHNzZHMgdGhhdCByZWZlciB0byB0aGVtc2VsdmVzXG4gICAgICAgICAgICAgIC8vIGRvbid0IGFkZCB0aGUgc3NkIGluIG1vcmUgdGhhbiBvbmNlXG4gICAgICAgICAgICAgIGlmKCBHaWJiZXJpc2guY2FsbGJhY2tVZ2Vucy5pbmRleE9mKCBpbnB1dC5jYWxsYmFjayApID09PSAtMSApIHtcbiAgICAgICAgICAgICAgICBHaWJiZXJpc2guY2FsbGJhY2tVZ2Vucy5wdXNoKCBpbnB1dC5jYWxsYmFjayApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGluZSArPSBgdl8ke2lucHV0LmlkfWBcbiAgICAgICAgICAgIGlucHV0Ll9fdmFybmFtZSA9IGB2XyR7aW5wdXQuaWR9YFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKCBpIDwga2V5cy5sZW5ndGggLSAxICkge1xuICAgICAgICAgICAgbGluZSArPSB1Z2VuLmJpbm9wID8gJyAnICsgdWdlbi5vcCArICcgJyA6ICcsICcgXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vaWYoIHVnZW4udHlwZSA9PT0gJ2J1cycgKSBsaW5lICs9ICcsICcgXG4gICAgICBpZiggdWdlbi50eXBlID09PSAnYW5hbHlzaXMnIHx8ICh1Z2VuLnR5cGUgPT09ICdidXMnICYmIGtleXMubGVuZ3RoID4gMCkgKSBsaW5lICs9ICcsICdcbiAgICAgIGlmKCAhdWdlbi5iaW5vcCAmJiB1Z2VuLnR5cGUgIT09ICdzZXEnICkgbGluZSArPSAnbWVtb3J5J1xuICAgICAgbGluZSArPSB1Z2VuLmJpbm9wID8gJycgOiAnICknXG5cbiAgICAgIGJsb2NrLnB1c2goIGxpbmUgKVxuICAgICAgXG4gICAgICAvL2NvbnNvbGUubG9nKCAnbWVtbzonLCB1Z2VuLnVnZW5OYW1lIClcbiAgICAgIEdpYmJlcmlzaC5tZW1vZWRbIHVnZW4udWdlbk5hbWUgXSA9IGB2XyR7dWdlbi5pZH1gXG5cbiAgICAgIGlmKCBkaXJ0eUlkeCAhPT0gLTEgKSB7XG4gICAgICAgIEdpYmJlcmlzaC5kaXJ0eVVnZW5zLnNwbGljZSggZGlydHlJZHgsIDEgKVxuICAgICAgfVxuXG4gICAgfWVsc2UgaWYoIHVnZW4uYmxvY2sgKSB7XG4gICAgICByZXR1cm4gdWdlbi5ibG9ja1xuICAgIH1cblxuICAgIHJldHVybiBibG9ja1xuICB9LFxuICAgIFxufVxuXG5HaWJiZXJpc2gudXRpbGl0aWVzID0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApKCBHaWJiZXJpc2ggKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gR2liYmVyaXNoXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IENvbmdhID0gYXJndW1lbnRQcm9wcyA9PiB7XG4gICAgbGV0IGNvbmdhID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApLFxuICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICBkZWNheSA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgZ2FpbiAgPSBnLmluKCAnZ2FpbicgKVxuXG4gICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIENvbmdhLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGxldCB0cmlnZ2VyID0gZy5iYW5nKCksXG4gICAgICAgIGltcHVsc2UgPSBnLm11bCggdHJpZ2dlciwgNjAgKSxcbiAgICAgICAgX2RlY2F5ID0gIGcuc3ViKCAuMTAxLCBnLmRpdiggZGVjYXksIDEwICkgKSwgLy8gY3JlYXRlIHJhbmdlIG9mIC4wMDEgLSAuMDk5XG4gICAgICAgIGJwZiA9IGcuc3ZmKCBpbXB1bHNlLCBmcmVxdWVuY3ksIF9kZWNheSwgMiwgZmFsc2UgKSxcbiAgICAgICAgb3V0ID0gZy5tdWwoIGJwZiwgZ2FpbiApXG4gICAgXG5cbiAgICBjb25nYS5lbnYgPSB0cmlnZ2VyXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIGNvbmdhLCBvdXQsIFsnaW5zdHJ1bWVudHMnLCdjb25nYSddLCBwcm9wcyAgKVxuXG4gICAgcmV0dXJuIGNvbmdhXG4gIH1cbiAgXG4gIENvbmdhLmRlZmF1bHRzID0ge1xuICAgIGdhaW46IC4yNSxcbiAgICBmcmVxdWVuY3k6MTkwLFxuICAgIGRlY2F5OiAuODVcbiAgfVxuXG4gIHJldHVybiBDb25nYVxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IENvd2JlbGwgPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBsZXQgY293YmVsbCA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKVxuICAgIFxuICAgIGNvbnN0IGRlY2F5ICAgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgICAgZ2FpbiAgICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBDb3diZWxsLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGNvbnN0IGJwZkN1dG9mZiA9IGcucGFyYW0oICdicGZjJywgMTAwMCApLFxuICAgICAgICAgIHMxID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCA1NjAgKSxcbiAgICAgICAgICBzMiA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgODQ1ICksXG4gICAgICAgICAgZWcgPSBnLmRlY2F5KCBnLm11bCggZGVjYXksIGcuZ2VuLnNhbXBsZXJhdGUgKiAyICkgKSwgXG4gICAgICAgICAgYnBmID0gZy5zdmYoIGcuYWRkKCBzMSxzMiApLCBicGZDdXRvZmYsIDMsIDIsIGZhbHNlICksXG4gICAgICAgICAgZW52QnBmID0gZy5tdWwoIGJwZiwgZWcgKSxcbiAgICAgICAgICBvdXQgPSBnLm11bCggZW52QnBmLCBnYWluIClcblxuICAgIGNvd2JlbGwuZW52ID0gZWcgXG5cbiAgICBjb3diZWxsLmlzU3RlcmVvID0gZmFsc2VcblxuICAgIGNvd2JlbGwgPSBHaWJiZXJpc2guZmFjdG9yeSggY293YmVsbCwgb3V0LCBbJ2luc3R1cm1lbnRzJywgJ2Nvd2JlbGwnXSwgcHJvcHMgIClcbiAgICBcbiAgICByZXR1cm4gY293YmVsbFxuICB9XG4gIFxuICBDb3diZWxsLmRlZmF1bHRzID0ge1xuICAgIGdhaW46IDEsXG4gICAgZGVjYXk6LjVcbiAgfVxuXG4gIHJldHVybiBDb3diZWxsXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IEZNID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgbGV0IHN5biA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKVxuXG4gICAgbGV0IGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgIGdsaWRlID0gZy5pbiggJ2dsaWRlJyApLFxuICAgICAgICBzbGlkaW5nRnJlcSA9IGcuc2xpZGUoIGZyZXF1ZW5jeSwgZ2xpZGUsIGdsaWRlICksXG4gICAgICAgIGNtUmF0aW8gPSBnLmluKCAnY21SYXRpbycgKSxcbiAgICAgICAgaW5kZXggPSBnLmluKCAnaW5kZXgnICksXG4gICAgICAgIGZlZWRiYWNrID0gZy5pbiggJ2ZlZWRiYWNrJyApLFxuICAgICAgICBhdHRhY2sgPSBnLmluKCAnYXR0YWNrJyApLCBkZWNheSA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgc3VzdGFpbiA9IGcuaW4oICdzdXN0YWluJyApLCBzdXN0YWluTGV2ZWwgPSBnLmluKCAnc3VzdGFpbkxldmVsJyApLFxuICAgICAgICByZWxlYXNlID0gZy5pbiggJ3JlbGVhc2UnIClcblxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIEZNLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBPYmplY3QuYXNzaWduKCBzeW4sIHByb3BzIClcblxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBlbnYgPSBHaWJiZXJpc2guZW52ZWxvcGVzLmZhY3RvcnkoIFxuICAgICAgICBwcm9wcy51c2VBRFNSLCBcbiAgICAgICAgcHJvcHMuc2hhcGUsIFxuICAgICAgICBhdHRhY2ssIGRlY2F5LCBcbiAgICAgICAgc3VzdGFpbiwgc3VzdGFpbkxldmVsLCBcbiAgICAgICAgcmVsZWFzZSwgXG4gICAgICAgIHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgICApXG5cbiAgICAgIGNvbnN0IGZlZWRiYWNrc3NkID0gZy5oaXN0b3J5KCAwIClcblxuICAgICAgY29uc3QgbW9kT3NjID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoIFxuICAgICAgICAgICAgICBzeW4ubW9kdWxhdG9yV2F2ZWZvcm0sIFxuICAgICAgICAgICAgICBnLmFkZCggZy5tdWwoIHNsaWRpbmdGcmVxLCBjbVJhdGlvICksIGcubXVsKCBmZWVkYmFja3NzZC5vdXQsIGZlZWRiYWNrLCBpbmRleCApICksIFxuICAgICAgICAgICAgICBzeW4uYW50aWFsaWFzIFxuICAgICAgICAgICAgKVxuXG4gICAgICBjb25zdCBtb2RPc2NXaXRoSW5kZXggPSBnLm11bCggbW9kT3NjLCBnLm11bCggc2xpZGluZ0ZyZXEsIGluZGV4ICkgKVxuICAgICAgY29uc3QgbW9kT3NjV2l0aEVudiAgID0gZy5tdWwoIG1vZE9zY1dpdGhJbmRleCwgZW52IClcbiAgICAgIFxuICAgICAgY29uc3QgbW9kT3NjV2l0aEVudkF2ZyA9IGcubXVsKCAuNSwgZy5hZGQoIG1vZE9zY1dpdGhFbnYsIGZlZWRiYWNrc3NkLm91dCApIClcblxuICAgICAgZmVlZGJhY2tzc2QuaW4oIG1vZE9zY1dpdGhFbnZBdmcgKVxuXG4gICAgICBjb25zdCBjYXJyaWVyT3NjID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoIHN5bi5jYXJyaWVyV2F2ZWZvcm0sIGcuYWRkKCBzbGlkaW5nRnJlcSwgbW9kT3NjV2l0aEVudkF2ZyApLCBzeW4uYW50aWFsaWFzIClcbiAgICAgIGNvbnN0IGNhcnJpZXJPc2NXaXRoRW52ID0gZy5tdWwoIGNhcnJpZXJPc2MsIGVudiApXG5cbiAgICAgIGNvbnN0IGJhc2VDdXRvZmZGcmVxID0gZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBmcmVxdWVuY3kgKVxuICAgICAgY29uc3QgY3V0b2ZmID0gZy5tdWwoIGcubXVsKCBiYXNlQ3V0b2ZmRnJlcSwgZy5wb3coIDIsIGcuaW4oJ2ZpbHRlck11bHQnKSApKSwgZW52IClcbiAgICAgIC8vY29uc3QgY3V0b2ZmID0gZy5hZGQoIGcuaW4oJ2N1dG9mZicpLCBnLm11bCggZy5pbignZmlsdGVyTXVsdCcpLCBlbnYgKSApXG4gICAgICBjb25zdCBmaWx0ZXJlZE9zYyA9IEdpYmJlcmlzaC5maWx0ZXJzLmZhY3RvcnkoIGNhcnJpZXJPc2NXaXRoRW52LCBjdXRvZmYsIGcuaW4oJ1EnKSwgZy5pbignc2F0dXJhdGlvbicpLCBzeW4gKVxuXG4gICAgICBjb25zdCBzeW50aFdpdGhHYWluID0gZy5tdWwoIGZpbHRlcmVkT3NjLCBnLmluKCAnZ2FpbicgKSApXG4gICAgICBcbiAgICAgIGxldCBwYW5uZXJcbiAgICAgIGlmKCBwcm9wcy5wYW5Wb2ljZXMgPT09IHRydWUgKSB7IFxuICAgICAgICBwYW5uZXIgPSBnLnBhbiggc3ludGhXaXRoR2Fpbiwgc3ludGhXaXRoR2FpbiwgZy5pbiggJ3BhbicgKSApIFxuICAgICAgICBzeW4uZ3JhcGggPSBbcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodCBdXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc3luLmdyYXBoID0gc3ludGhXaXRoR2FpblxuICAgICAgfVxuXG4gICAgICBzeW4uZW52ID0gZW52XG4gICAgfVxuICAgIFxuICAgIHN5bi5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiA9IFsgJ2NhcnJpZXJXYXZlZm9ybScsICdtb2R1bGF0b3JXYXZlZm9ybScsICdhbnRpYWxpYXMnLCAnZmlsdGVyVHlwZScsICdmaWx0ZXJNb2RlJyBdXG4gICAgc3luLl9fY3JlYXRlR3JhcGgoKVxuXG4gICAgY29uc3Qgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgc3luLmdyYXBoICwgWydpbnN0cnVtZW50cycsJ0ZNJ10sIHByb3BzIClcblxuICAgIHJldHVybiBvdXRcbiAgfVxuXG4gIEZNLmRlZmF1bHRzID0ge1xuICAgIGNhcnJpZXJXYXZlZm9ybTonc2luZScsXG4gICAgbW9kdWxhdG9yV2F2ZWZvcm06J3NpbmUnLFxuICAgIGF0dGFjazogNDQsXG4gICAgZmVlZGJhY2s6IDAsXG4gICAgZGVjYXk6IDIyMDUwLFxuICAgIHN1c3RhaW46NDQxMDAsXG4gICAgc3VzdGFpbkxldmVsOi42LFxuICAgIHJlbGVhc2U6MjIwNTAsXG4gICAgdXNlQURTUjpmYWxzZSxcbiAgICBzaGFwZTonbGluZWFyJyxcbiAgICB0cmlnZ2VyUmVsZWFzZTpmYWxzZSxcbiAgICBnYWluOiAxLFxuICAgIGNtUmF0aW86MixcbiAgICBpbmRleDo1LFxuICAgIHB1bHNld2lkdGg6LjI1LFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBhbnRpYWxpYXM6ZmFsc2UsXG4gICAgcGFuVm9pY2VzOmZhbHNlLFxuICAgIGdsaWRlOjEsXG4gICAgc2F0dXJhdGlvbjoxLFxuICAgIGZpbHRlck11bHQ6MS41LFxuICAgIFE6LjI1LFxuICAgIGN1dG9mZjouMzUsXG4gICAgZmlsdGVyVHlwZTowLFxuICAgIGZpbHRlck1vZGU6MCxcbiAgICBpc0xvd1Bhc3M6MVxuICB9XG5cbiAgbGV0IFBvbHlGTSA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIEZNLCBbJ2dsaWRlJywnZnJlcXVlbmN5JywnYXR0YWNrJywnZGVjYXknLCdwdWxzZXdpZHRoJywncGFuJywnZ2FpbicsJ2NtUmF0aW8nLCdpbmRleCcsICdzYXR1cmF0aW9uJywgJ2ZpbHRlck11bHQnLCAnUScsICdjdXRvZmYnLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnY2FycmllcldhdmVmb3JtJywgJ21vZHVsYXRvcldhdmVmb3JtJywnZmlsdGVyTW9kZScsICdmZWVkYmFjaycsICd1c2VBRFNSJywgJ3N1c3RhaW4nLCAncmVsZWFzZScsICdzdXN0YWluTGV2ZWwnIF0gKSBcblxuICByZXR1cm4gWyBGTSwgUG9seUZNIF1cblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgSGF0ID0gYXJndW1lbnRQcm9wcyA9PiB7XG4gICAgbGV0IGhhdCA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgdHVuZSAgPSBnLmluKCAndHVuZScgKSxcbiAgICAgICAgc2NhbGVkVHVuZSA9IGcubWVtbyggZy5hZGQoIC40LCB0dW5lICkgKSxcbiAgICAgICAgZGVjYXkgID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgSGF0LmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGxldCBiYXNlRnJlcSA9IGcubXVsKCAzMjUsIHNjYWxlZFR1bmUgKSwgLy8gcmFuZ2Ugb2YgMTYyLjUgLSA0ODcuNVxuICAgICAgICBicGZDdXRvZmYgPSBnLm11bCggZy5wYXJhbSggJ2JwZmMnLCA3MDAwICksIHNjYWxlZFR1bmUgKSxcbiAgICAgICAgaHBmQ3V0b2ZmID0gZy5tdWwoIGcucGFyYW0oICdocGZjJywgMTEwMDAgKSwgc2NhbGVkVHVuZSApLCAgXG4gICAgICAgIHMxID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBiYXNlRnJlcSwgZmFsc2UgKSxcbiAgICAgICAgczIgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGcubXVsKCBiYXNlRnJlcSwxLjQ0NzEgKSApLFxuICAgICAgICBzMyA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5tdWwoIGJhc2VGcmVxLDEuNjE3MCApICksXG4gICAgICAgIHM0ID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBnLm11bCggYmFzZUZyZXEsMS45MjY1ICkgKSxcbiAgICAgICAgczUgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGcubXVsKCBiYXNlRnJlcSwyLjUwMjggKSApLFxuICAgICAgICBzNiA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5tdWwoIGJhc2VGcmVxLDIuNjYzNyApICksXG4gICAgICAgIHN1bSA9IGcuYWRkKCBzMSxzMixzMyxzNCxzNSxzNiApLFxuICAgICAgICBlZyA9IGcuZGVjYXkoIGcubXVsKCBkZWNheSwgZy5nZW4uc2FtcGxlcmF0ZSAqIDIgKSApLCBcbiAgICAgICAgYnBmID0gZy5zdmYoIHN1bSwgYnBmQ3V0b2ZmLCAuNSwgMiwgZmFsc2UgKSxcbiAgICAgICAgZW52QnBmID0gZy5tdWwoIGJwZiwgZWcgKSxcbiAgICAgICAgaHBmID0gZy5maWx0ZXIyNCggZW52QnBmLCAwLCBocGZDdXRvZmYsIDAgKSxcbiAgICAgICAgb3V0ID0gZy5tdWwoIGhwZiwgZ2FpbiApXG5cbiAgICBoYXQuZW52ID0gZWcgXG4gICAgaGF0LmlzU3RlcmVvID0gZmFsc2VcblxuICAgIGNvbnN0IF9faGF0ID0gR2liYmVyaXNoLmZhY3RvcnkoIGhhdCwgb3V0LCBbJ2luc3RydW1lbnRzJywnaGF0J10sIHByb3BzICApXG4gICAgXG5cbiAgICByZXR1cm4gX19oYXRcbiAgfVxuICBcbiAgSGF0LmRlZmF1bHRzID0ge1xuICAgIGdhaW46ICAxLFxuICAgIHR1bmU6IC42LFxuICAgIGRlY2F5Oi4xLFxuICB9XG5cbiAgcmV0dXJuIEhhdFxuXG59XG4iLCJsZXQgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgIGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbmxldCBpbnN0cnVtZW50ID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbk9iamVjdC5hc3NpZ24oIGluc3RydW1lbnQsIHtcbiAgbm90ZSggZnJlcSApIHtcbiAgICB0aGlzLmZyZXF1ZW5jeSA9IGZyZXFcbiAgICB0aGlzLmVudi50cmlnZ2VyKClcbiAgfSxcblxuICB0cmlnZ2VyKCBfZ2FpbiA9IDEgKSB7XG4gICAgdGhpcy5nYWluID0gX2dhaW5cbiAgICB0aGlzLmVudi50cmlnZ2VyKClcbiAgfSxcblxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBpbnN0cnVtZW50XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbmNvbnN0IGluc3RydW1lbnRzID0ge1xuICBLaWNrICAgICAgICA6IHJlcXVpcmUoICcuL2tpY2suanMnICkoIEdpYmJlcmlzaCApLFxuICBDb25nYSAgICAgICA6IHJlcXVpcmUoICcuL2NvbmdhLmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgQ2xhdmUgICAgICAgOiByZXF1aXJlKCAnLi9jb25nYS5qcycgKSggR2liYmVyaXNoICksIC8vIGNsYXZlIGlzIHNhbWUgYXMgY29uZ2Egd2l0aCBkaWZmZXJlbnQgZGVmYXVsdHMsIHNlZSBiZWxvd1xuICBIYXQgICAgICAgICA6IHJlcXVpcmUoICcuL2hhdC5qcycgKSggR2liYmVyaXNoICksXG4gIFNuYXJlICAgICAgIDogcmVxdWlyZSggJy4vc25hcmUuanMnICkoIEdpYmJlcmlzaCApLFxuICBDb3diZWxsICAgICA6IHJlcXVpcmUoICcuL2Nvd2JlbGwuanMnICkoIEdpYmJlcmlzaCApXG59XG5cbmluc3RydW1lbnRzLkNsYXZlLmRlZmF1bHRzLmZyZXF1ZW5jeSA9IDI1MDBcbmluc3RydW1lbnRzLkNsYXZlLmRlZmF1bHRzLmRlY2F5ID0gLjU7XG5cblsgaW5zdHJ1bWVudHMuU3ludGgsIGluc3RydW1lbnRzLlBvbHlTeW50aCBdICAgICA9IHJlcXVpcmUoICcuL3N5bnRoLmpzJyApKCBHaWJiZXJpc2ggKTtcblsgaW5zdHJ1bWVudHMuTW9ub3N5bnRoLCBpbnN0cnVtZW50cy5Qb2x5TW9ubyBdICA9IHJlcXVpcmUoICcuL21vbm9zeW50aC5qcycgKSggR2liYmVyaXNoICk7XG5bIGluc3RydW1lbnRzLkZNLCBpbnN0cnVtZW50cy5Qb2x5Rk0gXSAgICAgICAgICAgPSByZXF1aXJlKCAnLi9mbS5qcycgKSggR2liYmVyaXNoICk7XG5bIGluc3RydW1lbnRzLlNhbXBsZXIsIGluc3RydW1lbnRzLlBvbHlTYW1wbGVyIF0gPSByZXF1aXJlKCAnLi9zYW1wbGVyLmpzJyApKCBHaWJiZXJpc2ggKTtcblsgaW5zdHJ1bWVudHMuS2FycGx1cywgaW5zdHJ1bWVudHMuUG9seUthcnBsdXMgXSA9IHJlcXVpcmUoICcuL2thcnBsdXNzdHJvbmcuanMnICkoIEdpYmJlcmlzaCApO1xuXG5pbnN0cnVtZW50cy5leHBvcnQgPSB0YXJnZXQgPT4ge1xuICBmb3IoIGxldCBrZXkgaW4gaW5zdHJ1bWVudHMgKSB7XG4gICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICB0YXJnZXRbIGtleSBdID0gaW5zdHJ1bWVudHNbIGtleSBdXG4gICAgfVxuICB9XG59XG5cbnJldHVybiBpbnN0cnVtZW50c1xuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBLUFMgPSBpbnB1dFByb3BzID0+IHtcblxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIEtQUy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgbGV0IHN5biA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKVxuICAgIFxuICAgIGxldCBzYW1wbGVSYXRlID0gR2liYmVyaXNoLm1vZGUgPT09ICdwcm9jZXNzb3InID8gR2liYmVyaXNoLnByb2Nlc3Nvci5zYW1wbGVSYXRlIDogR2liYmVyaXNoLmN0eC5zYW1wbGVSYXRlXG5cbiAgICBjb25zdCB0cmlnZ2VyID0gZy5iYW5nKCksXG4gICAgICAgICAgcGhhc2UgPSBnLmFjY3VtKCAxLCB0cmlnZ2VyLCB7IG1heDpJbmZpbml0eSB9ICksXG4gICAgICAgICAgZW52ID0gZy5ndHAoIGcuc3ViKCAxLCBnLmRpdiggcGhhc2UsIDIwMCApICksIDAgKSxcbiAgICAgICAgICBpbXB1bHNlID0gZy5tdWwoIGcubm9pc2UoKSwgZW52ICksXG4gICAgICAgICAgZmVlZGJhY2sgPSBnLmhpc3RvcnkoKSxcbiAgICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCdmcmVxdWVuY3knKSxcbiAgICAgICAgICBnbGlkZSA9IGcuaW4oICdnbGlkZScgKSxcbiAgICAgICAgICBzbGlkaW5nRnJlcXVlbmN5ID0gZy5zbGlkZSggZnJlcXVlbmN5LCBnbGlkZSwgZ2xpZGUgKSxcbiAgICAgICAgICBkZWxheSA9IGcuZGVsYXkoIGcuYWRkKCBpbXB1bHNlLCBmZWVkYmFjay5vdXQgKSwgZy5kaXYoIHNhbXBsZVJhdGUsIHNsaWRpbmdGcmVxdWVuY3kgKSwgeyBzaXplOjIwNDggfSksXG4gICAgICAgICAgZGVjYXllZCA9IGcubXVsKCBkZWxheSwgZy50NjAoIGcubXVsKCBnLmluKCdkZWNheScpLCBzbGlkaW5nRnJlcXVlbmN5ICkgKSApLFxuICAgICAgICAgIGRhbXBlZCA9ICBnLm1peCggZGVjYXllZCwgZmVlZGJhY2sub3V0LCBnLmluKCdkYW1waW5nJykgKSxcbiAgICAgICAgICB3aXRoR2FpbiA9IGcubXVsKCBkYW1wZWQsIGcuaW4oJ2dhaW4nKSApXG5cbiAgICBmZWVkYmFjay5pbiggZGFtcGVkIClcblxuICAgIGNvbnN0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgS1BTLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBPYmplY3QuYXNzaWduKCBzeW4sIHtcbiAgICAgIHByb3BlcnRpZXMgOiBwcm9wcyxcblxuICAgICAgZW52IDogdHJpZ2dlcixcbiAgICAgIHBoYXNlLFxuXG4gICAgICBnZXRQaGFzZSgpIHtcbiAgICAgICAgcmV0dXJuIEdpYmJlcmlzaC5tZW1vcnkuaGVhcFsgcGhhc2UubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICBpZiggcHJvcGVydGllcy5wYW5Wb2ljZXMgKSB7ICBcbiAgICAgIGNvbnN0IHBhbm5lciA9IGcucGFuKCB3aXRoR2Fpbiwgd2l0aEdhaW4sIGcuaW4oICdwYW4nICkgKVxuICAgICAgc3luID0gR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdLCBbJ2luc3RydW1lbnRzJywna2FycGx1cyddLCBwcm9wcyAgKVxuICAgIH1lbHNle1xuICAgICAgc3luID0gR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgd2l0aEdhaW4sIFsnaW5zdHJ1bWVudHMnLCdrYXJwbHVzJ10sIHByb3BzIClcbiAgICB9XG5cbiAgICByZXR1cm4gc3luXG4gIH1cbiAgXG4gIEtQUy5kZWZhdWx0cyA9IHtcbiAgICBkZWNheTogLjk3LFxuICAgIGRhbXBpbmc6LjIsXG4gICAgZ2FpbjogMSxcbiAgICBmcmVxdWVuY3k6MjIwLFxuICAgIHBhbjogLjUsXG4gICAgZ2xpZGU6MSxcbiAgICBwYW5Wb2ljZXM6ZmFsc2VcbiAgfVxuXG4gIGxldCBlbnZDaGVja0ZhY3RvcnkgPSAoIHN5bixzeW50aCApID0+IHtcbiAgICBsZXQgZW52Q2hlY2sgPSAoKT0+IHtcbiAgICAgIGxldCBwaGFzZSA9IHN5bi5nZXRQaGFzZSgpLFxuICAgICAgICAgIGVuZFRpbWUgPSBzeW50aC5kZWNheSAqIHNhbXBsZVJhdGVcblxuICAgICAgaWYoIHBoYXNlID4gZW5kVGltZSApIHtcbiAgICAgICAgc3ludGguZGlzY29ubmVjdFVnZW4oIHN5biApXG4gICAgICAgIHN5bi5pc0Nvbm5lY3RlZCA9IGZhbHNlXG4gICAgICAgIEdpYmJlcmlzaC5tZW1vcnkuaGVhcFsgc3luLnBoYXNlLm1lbW9yeS52YWx1ZS5pZHggXSA9IDAgLy8gdHJpZ2dlciBkb2Vzbid0IHNlZW0gdG8gcmVzZXQgZm9yIHNvbWUgcmVhc29uXG4gICAgICB9ZWxzZXtcbiAgICAgICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLnB1c2goIGVudkNoZWNrIClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVudkNoZWNrXG4gIH1cblxuICBsZXQgUG9seUtQUyA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIEtQUywgWydmcmVxdWVuY3knLCdkZWNheScsJ2RhbXBpbmcnLCdwYW4nLCdnYWluJywgJ2dsaWRlJ10sIGVudkNoZWNrRmFjdG9yeSApIFxuXG4gIHJldHVybiBbIEtQUywgUG9seUtQUyBdXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IEtpY2sgPSBpbnB1dFByb3BzID0+IHtcbiAgICAvLyBlc3RhYmxpc2ggcHJvdG90eXBlIGNoYWluXG4gICAgbGV0IGtpY2sgPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50IClcblxuICAgIC8vIGRlZmluZSBpbnB1dHNcbiAgICBsZXQgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgZGVjYXkgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgIHRvbmUgID0gZy5pbiggJ3RvbmUnICksXG4gICAgICAgIGdhaW4gID0gZy5pbiggJ2dhaW4nIClcbiAgICBcbiAgICAvLyBjcmVhdGUgaW5pdGlhbCBwcm9wZXJ0eSBzZXRcbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgS2ljay5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgT2JqZWN0LmFzc2lnbigga2ljaywgcHJvcHMgKVxuXG4gICAgLy8gY3JlYXRlIERTUCBncmFwaFxuICAgIGxldCB0cmlnZ2VyID0gZy5iYW5nKCksXG4gICAgICAgIGltcHVsc2UgPSBnLm11bCggdHJpZ2dlciwgNjAgKSxcbiAgICAgICAgc2NhbGVkRGVjYXkgPSBnLnN1YiggMS4wMDUsIGRlY2F5ICksIC8vIC0+IHJhbmdlIHsgLjAwNSwgMS4wMDUgfVxuICAgICAgICBzY2FsZWRUb25lID0gZy5hZGQoIDUwLCBnLm11bCggdG9uZSwgNDAwMCApICksIC8vIC0+IHJhbmdlIHsgNTAsIDQwNTAgfVxuICAgICAgICBicGYgPSBnLnN2ZiggaW1wdWxzZSwgZnJlcXVlbmN5LCBzY2FsZWREZWNheSwgMiwgZmFsc2UgKSxcbiAgICAgICAgbHBmID0gZy5zdmYoIGJwZiwgc2NhbGVkVG9uZSwgLjUsIDAsIGZhbHNlICksXG4gICAgICAgIGdyYXBoID0gZy5tdWwoIGxwZiwgZ2FpbiApXG4gICAgXG4gICAga2ljay5lbnYgPSB0cmlnZ2VyXG4gICAgY29uc3Qgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIGtpY2ssIGdyYXBoLCBbJ2luc3RydW1lbnRzJywna2ljayddLCBwcm9wcyAgKVxuXG4gICAgcmV0dXJuIG91dFxuICB9XG4gIFxuICBLaWNrLmRlZmF1bHRzID0ge1xuICAgIGdhaW46IDEsXG4gICAgZnJlcXVlbmN5Ojg1LFxuICAgIHRvbmU6IC4yNSxcbiAgICBkZWNheTouOVxuICB9XG5cbiAgcmV0dXJuIEtpY2tcblxufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKSxcbiAgICAgIGZlZWRiYWNrT3NjID0gcmVxdWlyZSggJy4uL29zY2lsbGF0b3JzL2ZtZmVlZGJhY2tvc2MuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IFN5bnRoID0gYXJndW1lbnRQcm9wcyA9PiB7XG4gICAgY29uc3Qgc3luID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApLFxuICAgICAgICAgIG9zY3MgPSBbXSwgXG4gICAgICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgICBnbGlkZSA9IGcuaW4oICdnbGlkZScgKSxcbiAgICAgICAgICBzbGlkaW5nRnJlcSA9IGcubWVtbyggZy5zbGlkZSggZnJlcXVlbmN5LCBnbGlkZSwgZ2xpZGUgKSApLFxuICAgICAgICAgIGF0dGFjayA9IGcuaW4oICdhdHRhY2snICksIGRlY2F5ID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICAgIHN1c3RhaW4gPSBnLmluKCAnc3VzdGFpbicgKSwgc3VzdGFpbkxldmVsID0gZy5pbiggJ3N1c3RhaW5MZXZlbCcgKSxcbiAgICAgICAgICByZWxlYXNlID0gZy5pbiggJ3JlbGVhc2UnIClcblxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIFN5bnRoLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcbiAgICBPYmplY3QuYXNzaWduKCBzeW4sIHByb3BzIClcblxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBlbnYgPSBHaWJiZXJpc2guZW52ZWxvcGVzLmZhY3RvcnkoIFxuICAgICAgICBwcm9wcy51c2VBRFNSLCBcbiAgICAgICAgcHJvcHMuc2hhcGUsIFxuICAgICAgICBhdHRhY2ssIGRlY2F5LCBcbiAgICAgICAgc3VzdGFpbiwgc3VzdGFpbkxldmVsLCBcbiAgICAgICAgcmVsZWFzZSwgXG4gICAgICAgIHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgICApXG5cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgMzsgaSsrICkge1xuICAgICAgICBsZXQgb3NjLCBmcmVxXG5cbiAgICAgICAgc3dpdGNoKCBpICkge1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGZyZXEgPSBnLmFkZCggc2xpZGluZ0ZyZXEsIGcubXVsKCBzbGlkaW5nRnJlcSwgZy5pbignZGV0dW5lMicpICkgKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgZnJlcSA9IGcuYWRkKCBzbGlkaW5nRnJlcSwgZy5tdWwoIHNsaWRpbmdGcmVxLCBnLmluKCdkZXR1bmUzJykgKSApXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgZnJlcSA9IHNsaWRpbmdGcmVxXG4gICAgICAgIH1cblxuICAgICAgICBvc2MgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggc3luLndhdmVmb3JtLCBmcmVxLCBzeW4uYW50aWFsaWFzIClcbiAgICAgICAgXG4gICAgICAgIG9zY3NbIGkgXSA9IG9zY1xuICAgICAgfVxuXG4gICAgICBjb25zdCBvc2NTdW0gPSBnLmFkZCggLi4ub3NjcyApLFxuICAgICAgICAgICAgb3NjV2l0aEdhaW4gPSBnLm11bCggZy5tdWwoIG9zY1N1bSwgZW52ICksIGcuaW4oICdnYWluJyApICksXG4gICAgICAgICAgICBiYXNlQ3V0b2ZmRnJlcSA9IGcubXVsKCBnLmluKCdjdXRvZmYnKSwgZnJlcXVlbmN5ICksXG4gICAgICAgICAgICBjdXRvZmYgPSBnLm11bCggZy5tdWwoIGJhc2VDdXRvZmZGcmVxLCBnLnBvdyggMiwgZy5pbignZmlsdGVyTXVsdCcpICkpLCBlbnYgKSxcbiAgICAgICAgICAgIGZpbHRlcmVkT3NjID0gR2liYmVyaXNoLmZpbHRlcnMuZmFjdG9yeSggb3NjV2l0aEdhaW4sIGN1dG9mZiwgZy5pbignUScpLCBnLmluKCdzYXR1cmF0aW9uJyksIHN5biApXG4gICAgICAgIFxuICAgICAgaWYoIHByb3BzLnBhblZvaWNlcyApIHsgIFxuICAgICAgICBjb25zdCBwYW5uZXIgPSBnLnBhbiggZmlsdGVyZWRPc2MsZmlsdGVyZWRPc2MsIGcuaW4oICdwYW4nICkgKVxuICAgICAgICBzeW4uZ3JhcGggPSBbIHBhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHQgXVxuICAgICAgfWVsc2V7XG4gICAgICAgIHN5bi5ncmFwaCA9IGZpbHRlcmVkT3NjXG4gICAgICB9XG5cbiAgICAgIHN5bi5lbnYgPSBlbnZcbiAgICB9XG5cbiAgICBzeW4uX19yZXF1aXJlc1JlY29tcGlsYXRpb24gPSBbICd3YXZlZm9ybScsICdhbnRpYWxpYXMnLCAnZmlsdGVyVHlwZScsICdmaWx0ZXJNb2RlJyBdXG4gICAgc3luLl9fY3JlYXRlR3JhcGgoKVxuXG4gICAgY29uc3Qgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgc3luLmdyYXBoLCBbJ2luc3RydW1lbnRzJywnTW9ub3N5bnRoJ10sIHByb3BzIClcblxuICAgIHJldHVybiBvdXRcbiAgfVxuICBcbiAgU3ludGguZGVmYXVsdHMgPSB7XG4gICAgd2F2ZWZvcm06ICdzYXcnLFxuICAgIGF0dGFjazogNDQsXG4gICAgZGVjYXk6IDIyMDUwLFxuICAgIHN1c3RhaW46NDQxMDAsXG4gICAgc3VzdGFpbkxldmVsOi42LFxuICAgIHJlbGVhc2U6MjIwNTAsXG4gICAgdXNlQURTUjpmYWxzZSxcbiAgICBzaGFwZTonbGluZWFyJyxcbiAgICB0cmlnZ2VyUmVsZWFzZTpmYWxzZSxcbiAgICBnYWluOiAuMjUsXG4gICAgcHVsc2V3aWR0aDouMjUsXG4gICAgZnJlcXVlbmN5OjIyMCxcbiAgICBwYW46IC41LFxuICAgIGRldHVuZTI6LjAwNSxcbiAgICBkZXR1bmUzOi0uMDA1LFxuICAgIGN1dG9mZjogMSxcbiAgICByZXNvbmFuY2U6LjI1LFxuICAgIFE6IC41LFxuICAgIHBhblZvaWNlczpmYWxzZSxcbiAgICBnbGlkZTogMSxcbiAgICBhbnRpYWxpYXM6ZmFsc2UsXG4gICAgZmlsdGVyVHlwZTogMixcbiAgICBmaWx0ZXJNb2RlOiAwLCAvLyAwID0gTFAsIDEgPSBIUCwgMiA9IEJQLCAzID0gTm90Y2hcbiAgICBzYXR1cmF0aW9uOi41LFxuICAgIGZpbHRlck11bHQ6IDQsXG4gICAgaXNMb3dQYXNzOnRydWVcbiAgfVxuXG4gIGxldCBQb2x5TW9ubyA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIFN5bnRoLCBcbiAgICBbJ2ZyZXF1ZW5jeScsJ2F0dGFjaycsJ2RlY2F5JywnY3V0b2ZmJywnUScsXG4gICAgICdkZXR1bmUyJywnZGV0dW5lMycsJ3B1bHNld2lkdGgnLCdwYW4nLCdnYWluJywgJ2dsaWRlJywgJ3NhdHVyYXRpb24nLCAnZmlsdGVyTXVsdCcsICAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnd2F2ZWZvcm0nLCAnZmlsdGVyTW9kZSddXG4gICkgXG5cbiAgcmV0dXJuIFsgU3ludGgsIFBvbHlNb25vIF1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBub3RlKCBmcmVxLCBnYWluICkge1xuICAgIC8vIHdpbGwgYmUgc2VudCB0byBwcm9jZXNzb3Igbm9kZSB2aWEgcHJveHkgbWV0aG9kLi4uXG4gICAgaWYoIEdpYmJlcmlzaC5tb2RlICE9PSAnd29ya2xldCcgKSB7XG4gICAgICBsZXQgdm9pY2UgPSB0aGlzLl9fZ2V0Vm9pY2VfXygpXG4gICAgICBPYmplY3QuYXNzaWduKCB2b2ljZSwgdGhpcy5wcm9wZXJ0aWVzIClcbiAgICAgIGlmKCBnYWluID09PSB1bmRlZmluZWQgKSBnYWluID0gdGhpcy5nYWluXG4gICAgICB2b2ljZS5nYWluID0gZ2FpblxuICAgICAgdm9pY2Uubm90ZSggZnJlcSApXG4gICAgICB0aGlzLl9fcnVuVm9pY2VfXyggdm9pY2UsIHRoaXMgKVxuICAgICAgdGhpcy50cmlnZ2VyTm90ZSA9IGZyZXFcbiAgICB9XG4gIH0sXG5cbiAgLy8gWFhYIHRoaXMgaXMgbm90IHBhcnRpY3VsYXJseSBzYXRpc2Z5aW5nLi4uXG4gIC8vIG11c3QgY2hlY2sgZm9yIGJvdGggbm90ZXMgYW5kIGNob3Jkc1xuICB0cmlnZ2VyKCBnYWluICkge1xuICAgIGlmKCB0aGlzLnRyaWdnZXJDaG9yZCAhPT0gbnVsbCApIHtcbiAgICAgIHRoaXMudHJpZ2dlckNob3JkLmZvckVhY2goIHYgPT4ge1xuICAgICAgICBsZXQgdm9pY2UgPSB0aGlzLl9fZ2V0Vm9pY2VfXygpXG4gICAgICAgIE9iamVjdC5hc3NpZ24oIHZvaWNlLCB0aGlzLnByb3BlcnRpZXMgKVxuICAgICAgICB2b2ljZS5ub3RlKCB2IClcbiAgICAgICAgdm9pY2UuZ2FpbiA9IGdhaW5cbiAgICAgICAgdGhpcy5fX3J1blZvaWNlX18oIHZvaWNlLCB0aGlzIClcbiAgICAgIH0pXG4gICAgfWVsc2UgaWYoIHRoaXMudHJpZ2dlck5vdGUgIT09IG51bGwgKSB7XG4gICAgICBsZXQgdm9pY2UgPSB0aGlzLl9fZ2V0Vm9pY2VfXygpXG4gICAgICBPYmplY3QuYXNzaWduKCB2b2ljZSwgdGhpcy5wcm9wZXJ0aWVzIClcbiAgICAgIHZvaWNlLm5vdGUoIHRoaXMudHJpZ2dlck5vdGUgKVxuICAgICAgdm9pY2UuZ2FpbiA9IGdhaW5cbiAgICAgIHRoaXMuX19ydW5Wb2ljZV9fKCB2b2ljZSwgdGhpcyApXG4gICAgfWVsc2V7XG4gICAgICBsZXQgdm9pY2UgPSB0aGlzLl9fZ2V0Vm9pY2VfXygpXG4gICAgICBPYmplY3QuYXNzaWduKCB2b2ljZSwgdGhpcy5wcm9wZXJ0aWVzIClcbiAgICAgIHZvaWNlLnRyaWdnZXIoIGdhaW4gKVxuICAgICAgdGhpcy5fX3J1blZvaWNlX18oIHZvaWNlLCB0aGlzIClcbiAgICB9XG4gIH0sXG5cbiAgX19ydW5Wb2ljZV9fKCB2b2ljZSwgX3BvbHkgKSB7XG4gICAgaWYoICF2b2ljZS5pc0Nvbm5lY3RlZCApIHtcbiAgICAgIHZvaWNlLmNvbm5lY3QoIF9wb2x5IClcbiAgICAgIHZvaWNlLmlzQ29ubmVjdGVkID0gdHJ1ZVxuICAgIH1cblxuICAgIGxldCBlbnZDaGVja1xuICAgIGlmKCBfcG9seS5lbnZDaGVjayA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgZW52Q2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYoIHZvaWNlLmVudi5pc0NvbXBsZXRlKCkgKSB7XG4gICAgICAgICAgX3BvbHkuZGlzY29ubmVjdFVnZW4oIHZvaWNlIClcbiAgICAgICAgICB2b2ljZS5pc0Nvbm5lY3RlZCA9IGZhbHNlXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5wdXNoKCBlbnZDaGVjayApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGVudkNoZWNrID0gX3BvbHkuZW52Q2hlY2soIHZvaWNlLCBfcG9seSApXG4gICAgfVxuXG4gICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLnB1c2goIGVudkNoZWNrIClcbiAgfSxcblxuICBfX2dldFZvaWNlX18oKSB7XG4gICAgcmV0dXJuIHRoaXMudm9pY2VzWyB0aGlzLnZvaWNlQ291bnQrKyAlIHRoaXMudm9pY2VzLmxlbmd0aCBdXG4gIH0sXG5cbiAgY2hvcmQoIGZyZXF1ZW5jaWVzICkge1xuICAgIC8vIHdpbGwgYmUgc2VudCB0byBwcm9jZXNzb3Igbm9kZSB2aWEgcHJveHkgbWV0aG9kLi4uXG4gICAgaWYoIEdpYmJlcmlzaC5tb2RlICE9PSAnd29ya2xldCcgKSB7XG4gICAgICBmcmVxdWVuY2llcy5mb3JFYWNoKCB2ID0+IHRoaXMubm90ZSggdiApIClcbiAgICAgIHRoaXMudHJpZ2dlckNob3JkID0gZnJlcXVlbmNpZXNcbiAgICB9XG4gIH0sXG5cbiAgZnJlZSgpIHtcbiAgICBmb3IoIGxldCBjaGlsZCBvZiB0aGlzLnZvaWNlcyApIGNoaWxkLmZyZWUoKVxuICB9XG59XG4iLCIvKlxuICogVGhpcyBmaWxlcyBjcmVhdGVzIGEgZmFjdG9yeSBnZW5lcmF0aW5nIHBvbHlzeW50aCBjb25zdHJ1Y3RvcnMuXG4gKi9cblxuY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcbmNvbnN0IHByb3h5ID0gcmVxdWlyZSggJy4uL3dvcmtsZXRQcm94eS5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgVGVtcGxhdGVGYWN0b3J5ID0gKCB1Z2VuLCBwcm9wZXJ0eUxpc3QsIF9lbnZDaGVjayApID0+IHtcbiAgICAvKiBcbiAgICAgKiBwb2x5c3ludGhzIGFyZSBiYXNpY2FsbHkgYnVzc2VzIHRoYXQgY29ubmVjdCBjaGlsZCBzeW50aCB2b2ljZXMuXG4gICAgICogV2UgY3JlYXRlIHNlcGFyYXRlIHByb3RvdHlwZXMgZm9yIG1vbm8gdnMgc3RlcmVvIGluc3RhbmNlcy5cbiAgICAgKi9cblxuICAgIGNvbnN0IG1vbm9Qcm90byAgID0gT2JqZWN0LmNyZWF0ZSggR2liYmVyaXNoLkJ1cygpICksXG4gICAgICAgICAgc3RlcmVvUHJvdG8gPSBPYmplY3QuY3JlYXRlKCBHaWJiZXJpc2guQnVzMigpIClcblxuICAgIC8vIHNpbmNlIHRoZXJlIGFyZSB0d28gcHJvdG90eXBlcyB3ZSBjYW4ndCBhc3NpZ24gZGlyZWN0bHkgdG8gb25lIG9mIHRoZW0uLi5cbiAgICBPYmplY3QuYXNzaWduKCBtb25vUHJvdG8sICAgR2liYmVyaXNoLm1peGlucy5wb2x5aW5zdHJ1bWVudCApXG4gICAgT2JqZWN0LmFzc2lnbiggc3RlcmVvUHJvdG8sIEdpYmJlcmlzaC5taXhpbnMucG9seWluc3RydW1lbnQgKVxuXG4gICAgY29uc3QgVGVtcGxhdGUgPSBwcm9wcyA9PiB7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbigge30sIHsgaXNTdGVyZW86dHJ1ZSB9LCBwcm9wcyApXG5cbiAgICAgIGNvbnN0IHN5bnRoID0gcHJvcGVydGllcy5pc1N0ZXJlbyA9PT0gdHJ1ZSA/IE9iamVjdC5jcmVhdGUoIHN0ZXJlb1Byb3RvICkgOiBPYmplY3QuY3JlYXRlKCBtb25vUHJvdG8gKVxuXG4gICAgICBPYmplY3QuYXNzaWduKCBzeW50aCwge1xuICAgICAgICB2b2ljZXM6IFtdLFxuICAgICAgICBtYXhWb2ljZXM6IHByb3BlcnRpZXMubWF4Vm9pY2VzICE9PSB1bmRlZmluZWQgPyBwcm9wZXJ0aWVzLm1heFZvaWNlcyA6IDE2LFxuICAgICAgICB2b2ljZUNvdW50OiAwLFxuICAgICAgICBlbnZDaGVjazogX2VudkNoZWNrLFxuICAgICAgICBpZDogR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKCksXG4gICAgICAgIGRpcnR5OiB0cnVlLFxuICAgICAgICB0eXBlOiAnYnVzJyxcbiAgICAgICAgdWdlbk5hbWU6ICdwb2x5JyArIHVnZW4ubmFtZSArICdfJyArIHN5bnRoLmlkLFxuICAgICAgICBpbnB1dHM6W10sXG4gICAgICAgIGlucHV0TmFtZXM6W10sIC8vWydpbnB1dCcsICdnYWluJ10sXG4gICAgICAgIHByb3BlcnRpZXNcbiAgICAgIH0pXG5cbiAgICAgIHByb3BlcnRpZXMucGFuVm9pY2VzID0gcHJvcGVydGllcy5pc1N0ZXJlb1xuICAgICAgc3ludGguY2FsbGJhY2sudWdlbk5hbWUgPSBzeW50aC51Z2VuTmFtZVxuXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHN5bnRoLm1heFZvaWNlczsgaSsrICkge1xuICAgICAgICBzeW50aC52b2ljZXNbaV0gPSB1Z2VuKCBwcm9wZXJ0aWVzIClcbiAgICAgICAgc3ludGgudm9pY2VzW2ldLmNhbGxiYWNrLnVnZW5OYW1lID0gc3ludGgudm9pY2VzW2ldLnVnZW5OYW1lXG4gICAgICAgIHN5bnRoLnZvaWNlc1tpXS5pc0Nvbm5lY3RlZCA9IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGxldCBfcHJvcGVydHlMaXN0IFxuICAgICAgaWYoIHByb3BlcnRpZXMuaXNTdGVyZW8gPT09IGZhbHNlICkge1xuICAgICAgICBfcHJvcGVydHlMaXN0ID0gcHJvcGVydHlMaXN0LnNsaWNlKCAwIClcbiAgICAgICAgY29uc3QgaWR4ID0gIF9wcm9wZXJ0eUxpc3QuaW5kZXhPZiggJ3BhbicgKVxuICAgICAgICBpZiggaWR4ICA+IC0xICkgX3Byb3BlcnR5TGlzdC5zcGxpY2UoIGlkeCwgMSApXG4gICAgICB9XG5cbiAgICAgIFRlbXBsYXRlRmFjdG9yeS5zZXR1cFByb3BlcnRpZXMoIHN5bnRoLCB1Z2VuLCBwcm9wZXJ0aWVzLmlzU3RlcmVvID8gcHJvcGVydHlMaXN0IDogX3Byb3BlcnR5TGlzdCApXG5cbiAgICAgIHJldHVybiBwcm94eSggWydpbnN0cnVtZW50cycsICdQb2x5Jyt1Z2VuLm5hbWVdLCBwcm9wZXJ0aWVzLCBzeW50aCApIFxuICAgIH1cblxuICAgIHJldHVybiBUZW1wbGF0ZVxuICB9XG5cbiAgVGVtcGxhdGVGYWN0b3J5LnNldHVwUHJvcGVydGllcyA9IGZ1bmN0aW9uKCBzeW50aCwgdWdlbiwgcHJvcHMgKSB7XG4gICAgZm9yKCBsZXQgcHJvcGVydHkgb2YgcHJvcHMgKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHN5bnRoLCBwcm9wZXJ0eSwge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHN5bnRoLnByb3BlcnRpZXNbIHByb3BlcnR5IF0gfHwgdWdlbi5kZWZhdWx0c1sgcHJvcGVydHkgXVxuICAgICAgICB9LFxuICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgc3ludGgucHJvcGVydGllc1sgcHJvcGVydHkgXSA9IHZcbiAgICAgICAgICBmb3IoIGxldCBjaGlsZCBvZiBzeW50aC5pbnB1dHMgKSB7XG4gICAgICAgICAgICBjaGlsZFsgcHJvcGVydHkgXSA9IHZcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFRlbXBsYXRlRmFjdG9yeVxuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgbGV0IHByb3RvID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApXG5cbiAgT2JqZWN0LmFzc2lnbiggcHJvdG8sIHtcbiAgICBub3RlKCByYXRlICkge1xuICAgICAgdGhpcy5yYXRlID0gcmF0ZVxuICAgICAgaWYoIHJhdGUgPiAwICkge1xuICAgICAgICB0aGlzLnRyaWdnZXIoKVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuX19waGFzZV9fLnZhbHVlID0gdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxIFxuICAgICAgfVxuICAgIH0sXG4gIH0pXG5cbiAgY29uc3QgU2FtcGxlciA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGNvbnN0IHN5biA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbiggeyBvbmxvYWQ6bnVsbCB9LCBTYW1wbGVyLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgIHN5bi5pc1N0ZXJlbyA9IHByb3BzLmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pc1N0ZXJlbyA6IGZhbHNlXG5cbiAgICBjb25zdCBzdGFydCA9IGcuaW4oICdzdGFydCcgKSwgZW5kID0gZy5pbiggJ2VuZCcgKSwgXG4gICAgICAgICAgcmF0ZSA9IGcuaW4oICdyYXRlJyApLCBzaG91bGRMb29wID0gZy5pbiggJ2xvb3BzJyApXG5cbiAgICAvKiBcbiAgICAgKiBjcmVhdGUgZHVtbXkgdWdlbiB1bnRpbCBkYXRhIGZvciBzYW1wbGVyIGlzIGxvYWRlZC4uLlxuICAgICAqIHRoaXMgd2lsbCBiZSBvdmVycmlkZGVuIGJ5IGEgY2FsbCB0byBHaWJiZXJpc2guZmFjdG9yeSBvbiBsb2FkIFxuICAgICAqL1xuXG4gICAgc3luLmNhbGxiYWNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwIH1cbiAgICBzeW4uaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgIHN5bi51Z2VuTmFtZSA9IHN5bi5jYWxsYmFjay51Z2VuTmFtZSA9ICdzYW1wbGVyXycgKyBzeW4uaWRcbiAgICBzeW4uaW5wdXROYW1lcyA9IFtdXG5cbiAgICAvKiBlbmQgZHVtbXkgdWdlbiAqL1xuXG4gICAgc3luLl9fYmFuZ19fID0gZy5iYW5nKClcbiAgICBzeW4udHJpZ2dlciA9IHN5bi5fX2JhbmdfXy50cmlnZ2VyXG5cbiAgICBPYmplY3QuYXNzaWduKCBzeW4sIHByb3BzIClcblxuICAgIGlmKCBwcm9wcy5maWxlbmFtZSApIHtcbiAgICAgIHN5bi5kYXRhID0gZy5kYXRhKCBwcm9wcy5maWxlbmFtZSApXG5cbiAgICAgIHN5bi5kYXRhLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgc3luLl9fcGhhc2VfXyA9IGcuY291bnRlciggcmF0ZSwgc3RhcnQsIGVuZCwgc3luLl9fYmFuZ19fLCBzaG91bGRMb29wLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSlcblxuICAgICAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICAgICAgc3luLFxuICAgICAgICAgIGcubXVsKCBcbiAgICAgICAgICBnLmlmZWxzZSggXG4gICAgICAgICAgICBnLmFuZCggZy5ndGUoIHN5bi5fX3BoYXNlX18sIHN0YXJ0ICksIGcubHQoIHN5bi5fX3BoYXNlX18sIGVuZCApICksXG4gICAgICAgICAgICBnLnBlZWsoIFxuICAgICAgICAgICAgICBzeW4uZGF0YSwgXG4gICAgICAgICAgICAgIHN5bi5fX3BoYXNlX18sXG4gICAgICAgICAgICAgIHsgbW9kZTonc2FtcGxlcycgfVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIDBcbiAgICAgICAgICApLCBnLmluKCdnYWluJykgKSxcbiAgICAgICAgICAnc2FtcGxlcicsIFxuICAgICAgICAgIHByb3BzIFxuICAgICAgICApIFxuXG4gICAgICAgIGlmKCBzeW4uZW5kID09PSAtOTk5OTk5OTk5ICkgc3luLmVuZCA9IHN5bi5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxXG5cbiAgICAgICAgaWYoIHN5bi5vbmxvYWQgIT09IG51bGwgKSB7IHN5bi5vbmxvYWQoKSB9XG5cbiAgICAgICAgR2liYmVyaXNoLmRpcnR5KCBzeW4gKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzeW5cbiAgfVxuICBcblxuICBTYW1wbGVyLmRlZmF1bHRzID0ge1xuICAgIGdhaW46IDEsXG4gICAgcGFuOiAuNSxcbiAgICByYXRlOiAxLFxuICAgIHBhblZvaWNlczpmYWxzZSxcbiAgICBsb29wczogMCxcbiAgICBzdGFydDowLFxuICAgIGVuZDotOTk5OTk5OTk5LFxuICB9XG5cbiAgY29uc3QgZW52Q2hlY2tGYWN0b3J5ID0gZnVuY3Rpb24oIHZvaWNlLCBfcG9seSApIHtcblxuICAgIGNvbnN0IGVudkNoZWNrID0gKCkgPT4ge1xuICAgICAgY29uc3QgcGhhc2UgPSBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIHZvaWNlLl9fcGhhc2VfXy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIGlmKCAoIHZvaWNlLnJhdGUgPiAwICYmIHBoYXNlID4gdm9pY2UuZW5kICkgfHwgKCB2b2ljZS5yYXRlIDwgMCAmJiBwaGFzZSA8IDAgKSApIHtcbiAgICAgICAgX3BvbHkuZGlzY29ubmVjdFVnZW4uY2FsbCggX3BvbHksIHZvaWNlIClcbiAgICAgICAgdm9pY2UuaXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5wdXNoKCBlbnZDaGVjayApXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudkNoZWNrXG4gIH1cblxuICBjb25zdCBQb2x5U2FtcGxlciA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIFNhbXBsZXIsIFsncmF0ZScsJ3BhbicsJ2dhaW4nLCdzdGFydCcsJ2VuZCcsJ2xvb3BzJ10sIGVudkNoZWNrRmFjdG9yeSApIFxuXG4gIHJldHVybiBbIFNhbXBsZXIsIFBvbHlTYW1wbGVyIF1cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuICBcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgU25hcmUgPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBsZXQgc25hcmUgPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgIGRlY2F5ID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICBzY2FsZWREZWNheSA9IGcubXVsKCBkZWNheSwgZy5nZW4uc2FtcGxlcmF0ZSAqIDIgKSxcbiAgICAgICAgc25hcHB5PSBnLmluKCAnc25hcHB5JyApLFxuICAgICAgICB0dW5lICA9IGcuaW4oICd0dW5lJyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgU25hcmUuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgbGV0IGVnID0gZy5kZWNheSggc2NhbGVkRGVjYXksIHsgaW5pdFZhbHVlOjAgfSApLCBcbiAgICAgICAgY2hlY2sgPSBnLm1lbW8oIGcuZ3QoIGVnLCAuMDAwNSApICksXG4gICAgICAgIHJuZCA9IGcubXVsKCBnLm5vaXNlKCksIGVnICksXG4gICAgICAgIGhwZiA9IGcuc3ZmKCBybmQsIGcuYWRkKCAxMDAwLCBnLm11bCggZy5hZGQoIDEsIHR1bmUpLCAxMDAwICkgKSwgLjUsIDEsIGZhbHNlICksXG4gICAgICAgIHNuYXAgPSBnLmd0cCggZy5tdWwoIGhwZiwgc25hcHB5ICksIDAgKSwgLy8gcmVjdGlmeVxuICAgICAgICBicGYxID0gZy5zdmYoIGVnLCBnLm11bCggMTgwLCBnLmFkZCggdHVuZSwgMSApICksIC4wNSwgMiwgZmFsc2UgKSxcbiAgICAgICAgYnBmMiA9IGcuc3ZmKCBlZywgZy5tdWwoIDMzMCwgZy5hZGQoIHR1bmUsIDEgKSApLCAuMDUsIDIsIGZhbHNlICksXG4gICAgICAgIG91dCAgPSBnLm1lbW8oIGcuYWRkKCBzbmFwLCBicGYxLCBnLm11bCggYnBmMiwgLjggKSApICksIC8vWFhYIHdoeSBpcyBtZW1vIG5lZWRlZD9cbiAgICAgICAgc2NhbGVkT3V0ID0gZy5tdWwoIG91dCwgZ2FpbiApXG4gICAgXG4gICAgLy8gWFhYIFRPRE8gOiBtYWtlIHRoaXMgd29yayB3aXRoIGlmZWxzZS4gdGhlIHByb2JsZW0gaXMgdGhhdCBwb2tlIHVnZW5zIHB1dCB0aGVpclxuICAgIC8vIGNvZGUgYXQgdGhlIGJvdHRvbSBvZiB0aGUgY2FsbGJhY2sgZnVuY3Rpb24sIGluc3RlYWQgb2YgYXQgdGhlIGVuZCBvZiB0aGVcbiAgICAvLyBhc3NvY2lhdGVkIGlmL2Vsc2UgYmxvY2suXG4gICAgbGV0IGlmZSA9IGcuc3dpdGNoKCBjaGVjaywgc2NhbGVkT3V0LCAwIClcbiAgICAvL2xldCBpZmUgPSBnLmlmZWxzZSggZy5ndCggZWcsIC4wMDUgKSwgY3ljbGUoNDQwKSwgMCApXG4gICAgXG4gICAgc25hcmUuZW52ID0gZWcgXG4gICAgc25hcmUgPSBHaWJiZXJpc2guZmFjdG9yeSggc25hcmUsIGlmZSwgWydpbnN0cnVtZW50cycsJ3NuYXJlJ10sIHByb3BzICApXG4gICAgXG4gICAgcmV0dXJuIHNuYXJlXG4gIH1cbiAgXG4gIFNuYXJlLmRlZmF1bHRzID0ge1xuICAgIGdhaW46IDEsXG4gICAgZnJlcXVlbmN5OjEwMDAsXG4gICAgdHVuZTowLFxuICAgIHNuYXBweTogMSxcbiAgICBkZWNheTouMVxuICB9XG5cbiAgcmV0dXJuIFNuYXJlXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgU3ludGggPSBpbnB1dFByb3BzID0+IHtcbiAgICBjb25zdCBzeW4gPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50IClcblxuICAgIGNvbnN0IGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgICAgbG91ZG5lc3MgID0gZy5pbiggJ2xvdWRuZXNzJyApLCBcbiAgICAgICAgICBnbGlkZSA9IGcuaW4oICdnbGlkZScgKSxcbiAgICAgICAgICBzbGlkaW5nRnJlcSA9IGcuc2xpZGUoIGZyZXF1ZW5jeSwgZ2xpZGUsIGdsaWRlICksXG4gICAgICAgICAgYXR0YWNrID0gZy5pbiggJ2F0dGFjaycgKSwgZGVjYXkgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgICAgc3VzdGFpbiA9IGcuaW4oICdzdXN0YWluJyApLCBzdXN0YWluTGV2ZWwgPSBnLmluKCAnc3VzdGFpbkxldmVsJyApLFxuICAgICAgICAgIHJlbGVhc2UgPSBnLmluKCAncmVsZWFzZScgKVxuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgU3ludGguZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgIE9iamVjdC5hc3NpZ24oIHN5biwgcHJvcHMgKVxuXG4gICAgc3luLl9fY3JlYXRlR3JhcGggPSBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG9zYyA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCBzeW4ud2F2ZWZvcm0sIHNsaWRpbmdGcmVxLCBzeW4uYW50aWFsaWFzIClcblxuICAgICAgY29uc3QgZW52ID0gR2liYmVyaXNoLmVudmVsb3Blcy5mYWN0b3J5KCBcbiAgICAgICAgcHJvcHMudXNlQURTUiwgXG4gICAgICAgIHByb3BzLnNoYXBlLCBcbiAgICAgICAgYXR0YWNrLCBkZWNheSwgXG4gICAgICAgIHN1c3RhaW4sIHN1c3RhaW5MZXZlbCwgXG4gICAgICAgIHJlbGVhc2UsIFxuICAgICAgICBwcm9wcy50cmlnZ2VyUmVsZWFzZVxuICAgICAgKVxuXG4gICAgICAvLyBiZWxvdyBkb2Vzbid0IHdvcmsgYXMgaXQgYXR0ZW1wdHMgdG8gYXNzaWduIHRvIHJlbGVhc2UgcHJvcGVydHkgdHJpZ2dlcmluZyBjb2RlZ2VuLi4uXG4gICAgICAvLyBzeW4ucmVsZWFzZSA9ICgpPT4geyBzeW4uZW52LnJlbGVhc2UoKSB9XG5cbiAgICAgIGxldCBvc2NXaXRoRW52ID0gZy5tdWwoIGcubXVsKCBvc2MsIGVudiwgbG91ZG5lc3MgKSApLFxuICAgICAgICAgIHBhbm5lclxuICBcbiAgICAgIGNvbnN0IGJhc2VDdXRvZmZGcmVxID0gZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBmcmVxdWVuY3kgKVxuICAgICAgY29uc3QgY3V0b2ZmID0gZy5tdWwoIGcubXVsKCBiYXNlQ3V0b2ZmRnJlcSwgZy5wb3coIDIsIGcuaW4oJ2ZpbHRlck11bHQnKSApKSwgZW52IClcbiAgICAgIGNvbnN0IGZpbHRlcmVkT3NjID0gR2liYmVyaXNoLmZpbHRlcnMuZmFjdG9yeSggb3NjV2l0aEVudiwgY3V0b2ZmLCBnLmluKCdRJyksIGcuaW4oJ3NhdHVyYXRpb24nKSwgcHJvcHMgKVxuXG4gICAgICBsZXQgc3ludGhXaXRoR2FpbiA9IGcubXVsKCBmaWx0ZXJlZE9zYywgZy5pbiggJ2dhaW4nICkgKVxuICBcbiAgICAgIGlmKCBzeW4ucGFuVm9pY2VzID09PSB0cnVlICkgeyBcbiAgICAgICAgcGFubmVyID0gZy5wYW4oIHN5bnRoV2l0aEdhaW4sIHN5bnRoV2l0aEdhaW4sIGcuaW4oICdwYW4nICkgKSBcbiAgICAgICAgc3luLmdyYXBoID0gWyBwYW5uZXIubGVmdCwgcGFubmVyLnJpZ2h0IF1cbiAgICAgIH1lbHNle1xuICAgICAgICBzeW4uZ3JhcGggPSBzeW50aFdpdGhHYWluXG4gICAgICB9XG5cbiAgICAgIHN5bi5lbnYgPSBlbnZcbiAgICAgIHN5bi5vc2MgPSBvc2NcbiAgICAgIHN5bi5maWx0ZXIgPSBmaWx0ZXJlZE9zY1xuXG4gICAgfVxuICAgIFxuICAgIHN5bi5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiA9IFsgJ3dhdmVmb3JtJywgJ2FudGlhbGlhcycsICdmaWx0ZXJUeXBlJywnZmlsdGVyTW9kZScsICd1c2VBRFNSJywgJ3NoYXBlJyBdXG4gICAgc3luLl9fY3JlYXRlR3JhcGgoKVxuXG4gICAgY29uc3Qgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgc3luLmdyYXBoLCBbJ2luc3RydW1lbnRzJywgJ3N5bnRoJ10sIHByb3BzICApXG5cbiAgICByZXR1cm4gb3V0XG4gIH1cbiAgXG4gIFN5bnRoLmRlZmF1bHRzID0ge1xuICAgIHdhdmVmb3JtOidzYXcnLFxuICAgIGF0dGFjazogNDQsXG4gICAgZGVjYXk6IDIyMDUwLFxuICAgIHN1c3RhaW46NDQxMDAsXG4gICAgc3VzdGFpbkxldmVsOi42LFxuICAgIHJlbGVhc2U6MjIwNTAsXG4gICAgdXNlQURTUjpmYWxzZSxcbiAgICBzaGFwZTonbGluZWFyJyxcbiAgICB0cmlnZ2VyUmVsZWFzZTpmYWxzZSxcbiAgICBnYWluOiAxLFxuICAgIHB1bHNld2lkdGg6LjI1LFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBhbnRpYWxpYXM6ZmFsc2UsXG4gICAgcGFuVm9pY2VzOmZhbHNlLFxuICAgIGxvdWRuZXNzOjEsXG4gICAgZ2xpZGU6MSxcbiAgICBzYXR1cmF0aW9uOjEsXG4gICAgZmlsdGVyTXVsdDoyLFxuICAgIFE6LjI1LFxuICAgIGN1dG9mZjouNSxcbiAgICBmaWx0ZXJUeXBlOjAsXG4gICAgZmlsdGVyTW9kZTowLFxuICAgIGlzTG93UGFzczoxXG4gIH1cblxuICAvLyBkbyBub3QgaW5jbHVkZSB2ZWxvY2l0eSwgd2hpY2ggc2hvdWRsIGFsd2F5cyBiZSBwZXIgdm9pY2VcbiAgbGV0IFBvbHlTeW50aCA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIFN5bnRoLCBbJ2ZyZXF1ZW5jeScsJ2F0dGFjaycsJ2RlY2F5JywncHVsc2V3aWR0aCcsJ3BhbicsJ2dhaW4nLCdnbGlkZScsICdzYXR1cmF0aW9uJywgJ2ZpbHRlck11bHQnLCAnUScsICdjdXRvZmYnLCAncmVzb25hbmNlJywgJ2FudGlhbGlhcycsICdmaWx0ZXJUeXBlJywgJ3dhdmVmb3JtJywgJ2ZpbHRlck1vZGUnXSApIFxuXG4gIHJldHVybiBbIFN5bnRoLCBQb2x5U3ludGggXVxuXG59XG4iLCJjb25zdCB1Z2VucHJvdG8gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuY29uc3QgcHJveHkgICAgID0gcmVxdWlyZSggJy4uL3dvcmtsZXRQcm94eS5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IEJpbm9wcyA9IHtcbiAgICBleHBvcnQoIG9iaiApIHtcbiAgICAgIGZvciggbGV0IGtleSBpbiBCaW5vcHMgKSB7XG4gICAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgICAgIG9ialsga2V5IF0gPSBCaW5vcHNbIGtleSBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIEFkZCggLi4uYXJncyApIHtcbiAgICAgIGNvbnN0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIGNvbnN0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCB1Z2VucHJvdG8gKVxuICAgICAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBiaW5vcDp0cnVlLCBvcDonKycsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonYWRkJyArIGlkLCBpZCB9IClcblxuICAgICAgcmV0dXJuIHByb3h5KCBbJ2Jpbm9wcycsJ0FkZCddLCB7IGJpbm9wOnRydWUsIGlucHV0czphcmdzIH0sIHVnZW4gKVxuICAgIH0sXG5cbiAgICBTdWIoIC4uLmFyZ3MgKSB7XG4gICAgICBjb25zdCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICBjb25zdCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggdWdlbnByb3RvIClcbiAgICAgIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgYmlub3A6dHJ1ZSwgb3A6Jy0nLCBpbnB1dHM6YXJncywgdWdlbk5hbWU6J3N1YicgKyBpZCwgaWQgfSApXG5cbiAgICAgIHJldHVybiBwcm94eSggWydiaW5vcHMnLCdTdWInXSwgeyBiaW5vcDp0cnVlLCBpbnB1dHM6YXJncyB9LCB1Z2VuIClcbiAgICB9LFxuXG4gICAgTXVsKCAuLi5hcmdzICkge1xuICAgICAgY29uc3QgaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHVnZW5wcm90byApXG4gICAgICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IGJpbm9wOnRydWUsIG9wOicqJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidtdWwnICsgaWQsIGlkIH0gKVxuXG4gICAgICByZXR1cm4gcHJveHkoIFsnYmlub3BzJywnTXVsJ10sIHsgYmlub3A6dHJ1ZSwgaW5wdXRzOmFyZ3MgfSwgdWdlbiApXG4gICAgfSxcblxuICAgIERpdiggLi4uYXJncyApIHtcbiAgICAgIGNvbnN0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIGNvbnN0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCB1Z2VucHJvdG8gKVxuICAgICAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBiaW5vcDp0cnVlLCBvcDonLycsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonZGl2JyArIGlkLCBpZCB9IClcbiAgICBcbiAgICAgIHJldHVybiBwcm94eSggWydiaW5vcHMnLCdEaXYnXSwgeyBiaW5vcDp0cnVlLCBpbnB1dHM6YXJncyB9LCB1Z2VuIClcbiAgICB9LFxuXG4gICAgTW9kKCAuLi5hcmdzICkge1xuICAgICAgY29uc3QgaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHVnZW5wcm90byApXG4gICAgICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IGJpbm9wOnRydWUsIG9wOiclJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidtb2QnICsgaWQsIGlkIH0gKVxuXG4gICAgICByZXR1cm4gcHJveHkoIFsnYmlub3BzJywnTW9kJ10sIHsgYmlub3A6dHJ1ZSwgaW5wdXRzOmFyZ3MgfSwgdWdlbiApXG4gICAgfSwgICBcbiAgfVxuXG4gIHJldHVybiBCaW5vcHNcbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICksXG4gICAgcHJveHk9IHJlcXVpcmUoICcuLi93b3JrbGV0UHJveHkuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBcbiAgY29uc3QgQnVzID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbiAgT2JqZWN0LmFzc2lnbiggQnVzLCB7XG4gICAgX19nYWluIDoge1xuICAgICAgc2V0KCB2ICkge1xuICAgICAgICB0aGlzLm11bC5pbnB1dHNbIDEgXSA9IHZcbiAgICAgICAgR2liYmVyaXNoLmRpcnR5KCB0aGlzIClcbiAgICAgIH0sXG4gICAgICBnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm11bFsgMSBdXG4gICAgICB9XG4gICAgfSxcblxuICAgIF9fYWRkSW5wdXQoIGlucHV0ICkge1xuICAgICAgdGhpcy5zdW0uaW5wdXRzLnB1c2goIGlucHV0IClcbiAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdGhpcyApXG4gICAgfSxcblxuICAgIGNyZWF0ZSggX3Byb3BzICkge1xuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBCdXMuZGVmYXVsdHMsIF9wcm9wcyApXG5cbiAgICAgIGNvbnN0IHN1bSA9IEdpYmJlcmlzaC5iaW5vcHMuQWRkKCAuLi5wcm9wcy5pbnB1dHMgKVxuICAgICAgY29uc3QgbXVsID0gR2liYmVyaXNoLmJpbm9wcy5NdWwoIHN1bSwgcHJvcHMuZ2FpbiApXG5cbiAgICAgIGNvbnN0IGdyYXBoID0gR2liYmVyaXNoLlBhbm5lcih7IGlucHV0Om11bCwgcGFuOiBwcm9wcy5wYW4gfSlcbiAgICAgIFxuXG4gICAgICBncmFwaC5zdW0gPSBzdW1cbiAgICAgIGdyYXBoLm11bCA9IG11bFxuICAgICAgZ3JhcGguZGlzY29ubmVjdFVnZW4gPSBCdXMuZGlzY29ubmVjdFVnZW5cblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBncmFwaCwgJ2dhaW4nLCBCdXMuX19nYWluIClcblxuICAgICAgZ3JhcGguX19wcm9wZXJ0aWVzX18gPSBwcm9wc1xuXG4gICAgICBjb25zdCBvdXQgPSBwcm94eSggWydCdXMnXSwgcHJvcHMsIGdyYXBoIClcblxuXG4gICAgICBpZiggZmFsc2UgJiYgR2liYmVyaXNoLnByZXZlbnRQcm94eSA9PT0gZmFsc2UgJiYgR2liYmVyaXNoLm1vZGUgPT09ICd3b3JrbGV0JyApIHtcbiAgICAgICAgY29uc3QgbWV0YSA9IHtcbiAgICAgICAgICBhZGRyZXNzOidhZGQnLFxuICAgICAgICAgIG5hbWU6WydCdXMnXSxcbiAgICAgICAgICBwcm9wcywgXG4gICAgICAgICAgaWQ6Z3JhcGguaWRcbiAgICAgICAgfVxuICAgICAgICBHaWJiZXJpc2gud29ya2xldC5wb3J0LnBvc3RNZXNzYWdlKCBtZXRhIClcbiAgICAgICAgR2liYmVyaXNoLndvcmtsZXQucG9ydC5wb3N0TWVzc2FnZSh7IFxuICAgICAgICAgIGFkZHJlc3M6J21ldGhvZCcsIFxuICAgICAgICAgIG9iamVjdDpncmFwaC5pZCxcbiAgICAgICAgICBuYW1lOidjb25uZWN0JyxcbiAgICAgICAgICBhcmdzOltdXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvdXQgXG4gICAgfSxcblxuICAgIGRpc2Nvbm5lY3RVZ2VuKCB1Z2VuICkge1xuICAgICAgbGV0IHJlbW92ZUlkeCA9IHRoaXMuc3VtLmlucHV0cy5pbmRleE9mKCB1Z2VuIClcblxuICAgICAgaWYoIHJlbW92ZUlkeCAhPT0gLTEgKSB7XG4gICAgICAgIHRoaXMuc3VtLmlucHV0cy5zcGxpY2UoIHJlbW92ZUlkeCwgMSApXG4gICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdGhpcyApXG4gICAgICB9XG4gICAgfSxcblxuICAgIGRlZmF1bHRzOiB7IGdhaW46MSwgaW5wdXRzOlswXSwgcGFuOi41IH1cbiAgfSlcblxuICByZXR1cm4gQnVzLmNyZWF0ZS5iaW5kKCBCdXMgKVxuXG59XG5cbiIsIi8qbGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIFxuICBjb25zdCBCdXMyID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbiAgT2JqZWN0LmFzc2lnbiggQnVzMiwge1xuICAgIF9fZ2FpbiA6IHtcbiAgICAgIHNldCggdiApIHtcbiAgICAgICAgdGhpcy5tdWwuaW5wdXRzWyAxIF0gPSB2XG4gICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdGhpcyApXG5cbiAgICAgIH0sXG4gICAgICBnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm11bFsgMSBdXG4gICAgICB9XG4gICAgfSxcblxuICAgIF9fYWRkSW5wdXQoIGlucHV0ICkge1xuICAgICAgaWYoIGlucHV0LmlzU3RlcmVvIHx8IEFycmF5LmlzQXJyYXkoIGlucHV0ICkgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzdGVyZW8nLCBpbnB1dCApXG4gICAgICAgIHRoaXMuc3VtTC5pbnB1dHMucHVzaCggaW5wdXRbMF0gKVxuICAgICAgICB0aGlzLnN1bVIuaW5wdXRzLnB1c2goIGlucHV0WzBdICkgICAgICAgIFxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnbW9ubycsIGlucHV0IClcbiAgICAgICAgdGhpcy5zdW1MLmlucHV0cy5wdXNoKCBpbnB1dCApXG4gICAgICAgIHRoaXMuc3VtUi5pbnB1dHMucHVzaCggaW5wdXQgKVxuICAgICAgfVxuXG4gICAgICBHaWJiZXJpc2guZGlydHkoIHRoaXMgKVxuICAgIH0sXG5cbiAgICBjcmVhdGUoIF9wcm9wcyApIHtcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgQnVzMi5kZWZhdWx0cywgX3Byb3BzIClcblxuICAgICAgY29uc3QgaW5wdXRzTCA9IFtdLCBpbnB1dHNSID0gW11cblxuICAgICAgcHJvcHMuaW5wdXRzLmZvckVhY2goIGkgPT4ge1xuICAgICAgICBpZiggaS5pc1N0ZXJlbyB8fCBBcnJheS5pc0FycmF5KCBpICkgKSB7XG4gICAgICAgICAgaW5wdXRzTC5wdXNoKCBpWzBdICkgXG4gICAgICAgICAgaW5wdXRzUi5wdXNoKCBpWzFdIClcbiAgICAgICAgfWVsc2V7IFxuICAgICAgICAgIGlucHV0c0wucHVzaCggaSApIFxuICAgICAgICAgIGlucHV0c1IucHVzaCggaSApXG4gICAgICAgIH0gIFxuICAgICAgfSlcblxuICAgICAgY29uc3Qgc3VtTCA9IEdpYmJlcmlzaC5iaW5vcHMuQWRkKCAuLi5pbnB1dHNMIClcbiAgICAgIGNvbnN0IG11bEwgPSBHaWJiZXJpc2guYmlub3BzLk11bCggc3VtTCwgcHJvcHMuZ2FpbiApXG4gICAgICBjb25zdCBzdW1SID0gR2liYmVyaXNoLmJpbm9wcy5BZGQoIC4uLmlucHV0c1IgKVxuICAgICAgY29uc3QgbXVsUiA9IEdpYmJlcmlzaC5iaW5vcHMuTXVsKCBzdW1SLCBwcm9wcy5nYWluIClcblxuICAgICAgY29uc3QgZ3JhcGggPSBHaWJiZXJpc2guUGFubmVyKHsgaW5wdXQ6bXVsTCwgcGFuOiBwcm9wcy5wYW4gfSlcblxuICAgICAgT2JqZWN0LmFzc2lnbiggZ3JhcGgsIHsgc3VtTCwgbXVsTCwgc3VtUiwgbXVsUiwgX19hZGRJbnB1dDpCdXMyLl9fYWRkSW5wdXQsIGRpc2Nvbm5lY3RVZ2VuOkJ1czIuZGlzY29ubmVjdFVnZW4gIH0pXG5cbiAgICAgIGdyYXBoLmlzU3RlcmVvID0gdHJ1ZVxuICAgICAgZ3JhcGguaW5wdXRzID0gcHJvcHMuaW5wdXRzXG4gICAgICAvL2dyYXBoLnR5cGUgPSAnYnVzJ1xuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGdyYXBoLCAnZ2FpbicsIEJ1czIuX19nYWluIClcblxuICAgICAgcmV0dXJuIGdyYXBoXG4gICAgfSxcblxuICAgIGRpc2Nvbm5lY3RVZ2VuKCB1Z2VuICkge1xuICAgICAgbGV0IHJlbW92ZUlkeCA9IHRoaXMuc3VtLmlucHV0cy5pbmRleE9mKCB1Z2VuIClcblxuICAgICAgaWYoIHJlbW92ZUlkeCAhPT0gLTEgKSB7XG4gICAgICAgIHRoaXMuc3VtLmlucHV0cy5zcGxpY2UoIHJlbW92ZUlkeCwgMSApXG4gICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdGhpcyApXG4gICAgICB9XG4gICAgfSxcblxuICAgIGRlZmF1bHRzOiB7IGdhaW46MSwgaW5wdXRzOlswXSwgcGFuOi41IH1cbiAgfSlcblxuICByZXR1cm4gQnVzMi5jcmVhdGUuYmluZCggQnVzMiApXG5cbn1cbiovXG5cblxuY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICksXG4gICAgICBwcm94eSA9IHJlcXVpcmUoICcuLi93b3JrbGV0UHJveHkuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBjb25zdCBCdXMyID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbiAgbGV0IGJ1ZmZlckwsIGJ1ZmZlclJcbiAgXG4gIE9iamVjdC5hc3NpZ24oIEJ1czIsIHsgXG4gICAgY3JlYXRlKCBwcm9wcyApIHtcblxuICAgICAgaWYoIGJ1ZmZlckwgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgYnVmZmVyTCA9IEdpYmJlcmlzaC5nZW5pc2guZ2VuLmdsb2JhbHMucGFuTC5tZW1vcnkudmFsdWVzLmlkeFxuICAgICAgICBidWZmZXJSID0gR2liYmVyaXNoLmdlbmlzaC5nZW4uZ2xvYmFscy5wYW5SLm1lbW9yeS52YWx1ZXMuaWR4XG4gICAgICB9XG5cbiAgICAgIHZhciBvdXRwdXQgPSBbMCwwXSBcblxuICAgICAgdmFyIGJ1cyA9IE9iamVjdC5jcmVhdGUoIEJ1czIgKVxuXG4gICAgICBPYmplY3QuYXNzaWduKCBcbiAgICAgICAgYnVzLFxuXG4gICAgICAgIHtcbiAgICAgICAgICBjYWxsYmFjaygpIHtcbiAgICAgICAgICAgIG91dHB1dFsgMCBdID0gb3V0cHV0WyAxIF0gPSAwXG4gICAgICAgICAgICB2YXIgbGFzdElkeCA9IGFyZ3VtZW50cy5sZW5ndGggLSAxXG4gICAgICAgICAgICB2YXIgbWVtb3J5ICA9IGFyZ3VtZW50c1sgbGFzdElkeCBdXG5cbiAgICAgICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgbGFzdElkeDsgaSsrICkge1xuICAgICAgICAgICAgICB2YXIgaW5wdXQgPSBhcmd1bWVudHNbIGkgXSxcbiAgICAgICAgICAgICAgICAgIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5KCBpbnB1dCApLy9pbnB1dCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheVxuXG4gICAgICAgICAgICAgIG91dHB1dFsgMCBdICs9IGlzQXJyYXkgPyBpbnB1dFsgMCBdIDogaW5wdXRcbiAgICAgICAgICAgICAgb3V0cHV0WyAxIF0gKz0gaXNBcnJheSA/IGlucHV0WyAxIF0gOiBpbnB1dFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcGFuUmF3SW5kZXggID0gLjUgKiAxMDIzLFxuICAgICAgICAgICAgICAgIHBhbkJhc2VJbmRleCA9IHBhblJhd0luZGV4IHwgMCxcbiAgICAgICAgICAgICAgICBwYW5OZXh0SW5kZXggPSAocGFuQmFzZUluZGV4ICsgMSkgJiAxMDIzLFxuICAgICAgICAgICAgICAgIGludGVycEFtb3VudCA9IHBhblJhd0luZGV4IC0gcGFuQmFzZUluZGV4LFxuICAgICAgICAgICAgICAgIHBhbkwgPSBtZW1vcnlbIGJ1ZmZlckwgKyBwYW5CYXNlSW5kZXggXSBcbiAgICAgICAgICAgICAgICAgICsgKCBpbnRlcnBBbW91bnQgKiAoIG1lbW9yeVsgYnVmZmVyTCArIHBhbk5leHRJbmRleCBdIC0gbWVtb3J5WyBidWZmZXJMICsgcGFuQmFzZUluZGV4IF0gKSApLFxuICAgICAgICAgICAgICAgIHBhblIgPSBtZW1vcnlbIGJ1ZmZlclIgKyBwYW5CYXNlSW5kZXggXSBcbiAgICAgICAgICAgICAgICAgICsgKCBpbnRlcnBBbW91bnQgKiAoIG1lbW9yeVsgYnVmZmVyUiArIHBhbk5leHRJbmRleCBdIC0gbWVtb3J5WyBidWZmZXJSICsgcGFuQmFzZUluZGV4IF0gKSApXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG91dHB1dFswXSAqPSBidXMuZ2FpbiAqIHBhbkxcbiAgICAgICAgICAgIG91dHB1dFsxXSAqPSBidXMuZ2FpbiAqIHBhblJcblxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWQgOiBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKSxcbiAgICAgICAgICBkaXJ0eSA6IGZhbHNlLFxuICAgICAgICAgIHR5cGUgOiAnYnVzJyxcbiAgICAgICAgICBpbnB1dHM6W10sXG4gICAgICAgICAgX19wcm9wZXJ0aWVzX186cHJvcHNcbiAgICAgICAgfSxcblxuICAgICAgICBCdXMyLmRlZmF1bHRzLFxuXG4gICAgICAgIHByb3BzXG4gICAgICApXG5cbiAgICAgIGJ1cy51Z2VuTmFtZSA9IGJ1cy5jYWxsYmFjay51Z2VuTmFtZSA9ICdidXMyXycgKyBidXMuaWRcblxuICAgICAgY29uc3Qgb3V0ID0gcHJveHkoIFsnQnVzMiddLCBwcm9wcywgYnVzIClcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH0sXG4gICAgXG4gICAgZGlzY29ubmVjdFVnZW4oIHVnZW4gKSB7XG4gICAgICBsZXQgcmVtb3ZlSWR4ID0gdGhpcy5pbnB1dHMuaW5kZXhPZiggdWdlbiApXG5cbiAgICAgIGlmKCByZW1vdmVJZHggIT09IC0xICkge1xuICAgICAgICB0aGlzLmlucHV0cy5zcGxpY2UoIHJlbW92ZUlkeCwgMSApXG4gICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdGhpcyApXG4gICAgICB9XG4gICAgfSxcblxuICAgIGRlZmF1bHRzOiB7IGdhaW46MSwgcGFuOi41IH1cbiAgfSlcblxuICByZXR1cm4gQnVzMi5jcmVhdGUuYmluZCggQnVzMiApXG5cbn1cblxuIiwiY29uc3QgIGcgICAgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyAgKSxcbiAgICAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IE1vbm9wcyA9IHtcbiAgICBleHBvcnQoIG9iaiApIHtcbiAgICAgIGZvciggbGV0IGtleSBpbiBNb25vcHMgKSB7XG4gICAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgICAgIG9ialsga2V5IF0gPSBNb25vcHNbIGtleSBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIEFicyggaW5wdXQgKSB7XG4gICAgICBjb25zdCBhYnMgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5hYnMoIGcuaW4oJ2lucHV0JykgKVxuICAgICAgXG4gICAgICBjb25zdCBfX291dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBhYnMsIGdyYXBoLCBbJ21vbm9wcycsJ2FicyddLCBPYmplY3QuYXNzaWduKHt9LCBNb25vcHMuZGVmYXVsdHMsIHsgaW5wdXQsIGJpbm9wOnRydWUgfSkgKVxuXG4gICAgICByZXR1cm4gX19vdXRcbiAgICB9LFxuXG4gICAgUG93KCBpbnB1dCwgZXhwb25lbnQgKSB7XG4gICAgICBjb25zdCBwb3cgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5wb3coIGcuaW4oJ2lucHV0JyksIGcuaW4oJ2V4cG9uZW50JykgKVxuICAgICAgXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggcG93LCBncmFwaCwgWydtb25vcHMnLCdwb3cnXSwgT2JqZWN0LmFzc2lnbih7fSwgTW9ub3BzLmRlZmF1bHRzLCB7IGlucHV0LCBleHBvbmVudCB9KSApXG5cbiAgICAgIHJldHVybiBwb3dcbiAgICB9LFxuICAgIENsYW1wKCBpbnB1dCwgbWluLCBtYXggKSB7XG4gICAgICBjb25zdCBjbGFtcCA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLmNsYW1wKCBnLmluKCdpbnB1dCcpLCBnLmluKCdtaW4nKSwgZy5pbignbWF4JykgKVxuICAgICAgXG4gICAgICBjb25zdCBfX291dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBjbGFtcCwgZ3JhcGgsIFsnbW9ub3BzJywnY2xhbXAnXSwgT2JqZWN0LmFzc2lnbih7fSwgTW9ub3BzLmRlZmF1bHRzLCB7IGlucHV0LCBtaW4sIG1heCB9KSApXG5cbiAgICAgIHJldHVybiBfX291dFxuICAgIH0sXG5cbiAgICBNZXJnZSggaW5wdXQgKSB7XG4gICAgICBjb25zdCBtZXJnZXIgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgICAgIGNvbnN0IGNiID0gZnVuY3Rpb24oIF9pbnB1dCApIHtcbiAgICAgICAgcmV0dXJuIF9pbnB1dFswXSArIF9pbnB1dFsxXVxuICAgICAgfVxuXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggbWVyZ2VyLCBnLmluKCAnaW5wdXQnICksICdtZXJnZScsIHsgaW5wdXQgfSwgY2IgKVxuICAgICAgbWVyZ2VyLnR5cGUgPSAnYW5hbHlzaXMnXG4gICAgICBtZXJnZXIuaW5wdXROYW1lcyA9IFsgJ2lucHV0JyBdXG4gICAgICBtZXJnZXIuaW5wdXRzID0gWyBpbnB1dCBdXG4gICAgICBtZXJnZXIuaW5wdXQgPSBpbnB1dFxuICAgICAgXG4gICAgICByZXR1cm4gbWVyZ2VyXG4gICAgfSxcbiAgfVxuXG4gIE1vbm9wcy5kZWZhdWx0cyA9IHsgaW5wdXQ6MCB9XG5cbiAgcmV0dXJuIE1vbm9wc1xufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxuY29uc3QgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBQYW5uZXIgPSBpbnB1dFByb3BzID0+IHtcbiAgY29uc3QgcHJvcHMgID0gT2JqZWN0LmFzc2lnbigge30sIFBhbm5lci5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgICBwYW5uZXIgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuICBjb25zdCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IEFycmF5LmlzQXJyYXkoIHByb3BzLmlucHV0ICkgXG4gIFxuICBjb25zdCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgICAgcGFuICAgPSBnLmluKCAncGFuJyApXG5cbiAgbGV0IGdyYXBoIFxuICBpZiggaXNTdGVyZW8gKSB7XG4gICAgZ3JhcGggPSBnLnBhbiggaW5wdXRbMF0sIGlucHV0WzFdLCBwYW4gKSAgXG4gIH1lbHNle1xuICAgIGdyYXBoID0gZy5wYW4oIGlucHV0LCBpbnB1dCwgcGFuIClcbiAgfVxuXG4gIEdpYmJlcmlzaC5mYWN0b3J5KCBwYW5uZXIsIFsgZ3JhcGgubGVmdCwgZ3JhcGgucmlnaHRdLCAncGFubmVyJywgcHJvcHMgKVxuICBcbiAgcmV0dXJuIHBhbm5lclxufVxuXG5QYW5uZXIuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIHBhbjouNVxufVxuXG5yZXR1cm4gUGFubmVyIFxuXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgVGltZSA9IHtcbiAgICBicG06IDEyMCxcblxuICAgIGV4cG9ydDogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBPYmplY3QuYXNzaWduKCB0YXJnZXQsIFRpbWUgKVxuICAgIH0sXG5cbiAgICBtcyA6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHZhbCAqIEdpYmJlcmlzaC5jdHguc2FtcGxlUmF0ZSAvIDEwMDA7XG4gICAgfSxcblxuICAgIHNlY29uZHMgOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB2YWwgKiBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGU7XG4gICAgfSxcblxuICAgIGJlYXRzIDogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7IFxuICAgICAgICB2YXIgc2FtcGxlc1BlckJlYXQgPSBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGUgLyAoIEdpYmJlcmlzaC5UaW1lLmJwbSAvIDYwICkgO1xuICAgICAgICByZXR1cm4gc2FtcGxlc1BlckJlYXQgKiB2YWwgO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBUaW1lXG59XG4iLCJjb25zdCBnZW5pc2ggPSByZXF1aXJlKCdnZW5pc2guanMnKSxcbiAgICAgIHNzZCA9IGdlbmlzaC5oaXN0b3J5LFxuICAgICAgbm9pc2UgPSBnZW5pc2gubm9pc2U7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBcInVzZSBqc2RzcFwiO1xuXG4gIGNvbnN0IGxhc3QgPSBzc2QoMCk7XG5cbiAgY29uc3Qgd2hpdGUgPSBnZW5pc2guc3ViKGdlbmlzaC5tdWwobm9pc2UoKSwgMiksIDEpO1xuXG4gIGxldCBvdXQgPSBnZW5pc2guYWRkKGxhc3Qub3V0LCBnZW5pc2guZGl2KGdlbmlzaC5tdWwoLjAyLCB3aGl0ZSksIDEuMDIpKTtcblxuICBsYXN0LmluKG91dCk7XG5cbiAgb3V0ID0gZ2VuaXNoLm11bChvdXQsIDMuNSk7XG5cbiAgcmV0dXJuIG91dDtcbn07IiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbmxldCBmZWVkYmFja09zYyA9IGZ1bmN0aW9uKCBmcmVxdWVuY3ksIGZpbHRlciwgcHVsc2V3aWR0aD0uNSwgYXJndW1lbnRQcm9wcyApIHtcbiAgaWYoIGFyZ3VtZW50UHJvcHMgPT09IHVuZGVmaW5lZCApIGFyZ3VtZW50UHJvcHMgPSB7IHR5cGU6IDAgfVxuXG4gIGxldCBsYXN0U2FtcGxlID0gZy5oaXN0b3J5KCksXG4gICAgICAvLyBkZXRlcm1pbmUgcGhhc2UgaW5jcmVtZW50IGFuZCBtZW1vaXplIHJlc3VsdFxuICAgICAgdyA9IGcubWVtbyggZy5kaXYoIGZyZXF1ZW5jeSwgZy5nZW4uc2FtcGxlcmF0ZSApICksXG4gICAgICAvLyBjcmVhdGUgc2NhbGluZyBmYWN0b3JcbiAgICAgIG4gPSBnLnN1YiggLS41LCB3ICksXG4gICAgICBzY2FsaW5nID0gZy5tdWwoIGcubXVsKCAxMywgZmlsdGVyICksIGcucG93KCBuLCA1ICkgKSxcbiAgICAgIC8vIGNhbGN1bGF0ZSBkYyBvZmZzZXQgYW5kIG5vcm1hbGl6YXRpb24gZmFjdG9yc1xuICAgICAgREMgPSBnLnN1YiggLjM3NiwgZy5tdWwoIHcsIC43NTIgKSApLFxuICAgICAgbm9ybSA9IGcuc3ViKCAxLCBnLm11bCggMiwgdyApICksXG4gICAgICAvLyBkZXRlcm1pbmUgcGhhc2VcbiAgICAgIG9zYzFQaGFzZSA9IGcuYWNjdW0oIHcsIDAsIHsgbWluOi0xIH0pLFxuICAgICAgb3NjMSwgb3V0XG5cbiAgLy8gY3JlYXRlIGN1cnJlbnQgc2FtcGxlLi4uIGZyb20gdGhlIHBhcGVyOlxuICAvLyBvc2MgPSAob3NjICsgc2luKDIqcGkqKHBoYXNlICsgb3NjKnNjYWxpbmcpKSkqMC41ZjtcbiAgb3NjMSA9IGcubWVtbyggXG4gICAgZy5tdWwoXG4gICAgICBnLmFkZChcbiAgICAgICAgbGFzdFNhbXBsZS5vdXQsXG4gICAgICAgIGcuc2luKFxuICAgICAgICAgIGcubXVsKFxuICAgICAgICAgICAgTWF0aC5QSSAqIDIsXG4gICAgICAgICAgICBnLm1lbW8oIGcuYWRkKCBvc2MxUGhhc2UsIGcubXVsKCBsYXN0U2FtcGxlLm91dCwgc2NhbGluZyApICkgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIC41XG4gICAgKVxuICApXG5cbiAgLy8gc3RvcmUgc2FtcGxlIHRvIHVzZSBhcyBtb2R1bGF0aW9uXG4gIGxhc3RTYW1wbGUuaW4oIG9zYzEgKVxuXG4gIC8vIGlmIHB3bSAvIHNxdWFyZSB3YXZlZm9ybSBpbnN0ZWFkIG9mIHNhd3Rvb3RoLi4uXG4gIGlmKCBhcmd1bWVudFByb3BzLnR5cGUgPT09IDEgKSB7IFxuICAgIGNvbnN0IGxhc3RTYW1wbGUyID0gZy5oaXN0b3J5KCkgLy8gZm9yIG9zYyAyXG4gICAgY29uc3QgbGFzdFNhbXBsZU1hc3RlciA9IGcuaGlzdG9yeSgpIC8vIGZvciBzdW0gb2Ygb3NjMSxvc2MyXG5cbiAgICBjb25zdCBvc2MyID0gZy5tdWwoXG4gICAgICBnLmFkZChcbiAgICAgICAgbGFzdFNhbXBsZTIub3V0LFxuICAgICAgICBnLnNpbihcbiAgICAgICAgICBnLm11bChcbiAgICAgICAgICAgIE1hdGguUEkgKiAyLFxuICAgICAgICAgICAgZy5tZW1vKCBnLmFkZCggb3NjMVBoYXNlLCBnLm11bCggbGFzdFNhbXBsZTIub3V0LCBzY2FsaW5nICksIHB1bHNld2lkdGggKSApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApLFxuICAgICAgLjVcbiAgICApXG5cbiAgICBsYXN0U2FtcGxlMi5pbiggb3NjMiApXG4gICAgb3V0ID0gZy5tZW1vKCBnLnN1YiggbGFzdFNhbXBsZS5vdXQsIGxhc3RTYW1wbGUyLm91dCApIClcbiAgICBvdXQgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggMi41LCBvdXQgKSwgZy5tdWwoIC0xLjUsIGxhc3RTYW1wbGVNYXN0ZXIub3V0ICkgKSApXG4gICAgXG4gICAgbGFzdFNhbXBsZU1hc3Rlci5pbiggZy5zdWIoIG9zYzEsIG9zYzIgKSApXG5cbiAgfWVsc2V7XG4gICAgIC8vIG9mZnNldCBhbmQgbm9ybWFsaXplXG4gICAgb3NjMSA9IGcuYWRkKCBnLm11bCggMi41LCBvc2MxICksIGcubXVsKCAtMS41LCBsYXN0U2FtcGxlLm91dCApIClcbiAgICBvc2MxID0gZy5hZGQoIG9zYzEsIERDIClcbiBcbiAgICBvdXQgPSBvc2MxXG4gIH1cblxuICByZXR1cm4gZy5tdWwoIG91dCwgbm9ybSApXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmVlZGJhY2tPc2NcbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgICAgZmVlZGJhY2tPc2MgPSByZXF1aXJlKCAnLi9mbWZlZWRiYWNrb3NjLmpzJyApXG5cbi8vICBfX21ha2VPc2NpbGxhdG9yX18oIHR5cGUsIGZyZXF1ZW5jeSwgYW50aWFsaWFzICkge1xuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBsZXQgT3NjaWxsYXRvcnMgPSB7XG4gICAgZXhwb3J0KCBvYmogKSB7XG4gICAgICBmb3IoIGxldCBrZXkgaW4gT3NjaWxsYXRvcnMgKSB7XG4gICAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICkge1xuICAgICAgICAgIG9ialsga2V5IF0gPSBPc2NpbGxhdG9yc1sga2V5IF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBnZW5pc2g6IHtcbiAgICAgIEJyb3duOiByZXF1aXJlKCAnLi9icm93bm5vaXNlLmpzJyApLFxuICAgICAgUGluazogIHJlcXVpcmUoICcuL3Bpbmtub2lzZS5qcycgIClcbiAgICB9LFxuXG4gICAgV2F2ZXRhYmxlOiByZXF1aXJlKCAnLi93YXZldGFibGUuanMnICkoIEdpYmJlcmlzaCApLFxuICAgIFxuICAgIFNxdWFyZSggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHNxciAgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApIFxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHsgYW50aWFsaWFzOmZhbHNlIH0sIE9zY2lsbGF0b3JzLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICAgIGNvbnN0IG9zYyAgID0gT3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGcuaW4oICdmcmVxdWVuY3knICksIHByb3BzLmFudGlhbGlhcyApXG4gICAgICBjb25zdCBncmFwaCA9IGcubXVsKCBvc2MsIGcuaW4oJ2dhaW4nICkgKVxuXG4gICAgICBjb25zdCBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeSggc3FyLCBncmFwaCwgWydvc2NpbGxhdG9ycycsJ3NxdWFyZSddLCBwcm9wcyApXG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9LFxuXG4gICAgVHJpYW5nbGUoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCB0cmk9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSBcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7IGFudGlhbGlhczpmYWxzZSB9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgICBjb25zdCBvc2MgICA9IE9zY2lsbGF0b3JzLmZhY3RvcnkoICd0cmlhbmdsZScsIGcuaW4oICdmcmVxdWVuY3knICksIHByb3BzLmFudGlhbGlhcyApXG4gICAgICBjb25zdCBncmFwaCA9IGcubXVsKCBvc2MsIGcuaW4oJ2dhaW4nICkgKVxuXG4gICAgICBjb25zdCBvdXQgPUdpYmJlcmlzaC5mYWN0b3J5KCB0cmksIGdyYXBoLCBbJ29zY2lsbGF0b3JzJywndHJpYW5nbGUnXSwgcHJvcHMgKVxuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfSxcblxuICAgIFBXTSggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHB3bSAgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApIFxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHsgYW50aWFsaWFzOmZhbHNlLCBwdWxzZXdpZHRoOi4yNSB9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgICBjb25zdCBvc2MgICA9IE9zY2lsbGF0b3JzLmZhY3RvcnkoICdwd20nLCBnLmluKCAnZnJlcXVlbmN5JyApLCBwcm9wcy5hbnRpYWxpYXMgKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLm11bCggb3NjLCBnLmluKCdnYWluJyApIClcblxuICAgICAgY29uc3Qgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIHB3bSwgZ3JhcGgsIFsnb3NjaWxsYXRvcnMnLCdQV00nXSwgcHJvcHMgKVxuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfSxcblxuICAgIFNpbmUoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBzaW5lICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgICBjb25zdCBncmFwaCA9IGcubXVsKCBnLmN5Y2xlKCBnLmluKCdmcmVxdWVuY3knKSApLCBnLmluKCdnYWluJykgKVxuXG4gICAgICBjb25zdCBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeSggc2luZSwgZ3JhcGgsIFsnb3NjaWxsYXRvcnMnLCdzaW5lJ10sIHByb3BzIClcbiAgICAgIFxuICAgICAgcmV0dXJuIG91dFxuICAgIH0sXG5cbiAgICBOb2lzZSggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IG5vaXNlID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCB7IGdhaW46IDEsIGNvbG9yOid3aGl0ZScgfSwgaW5wdXRQcm9wcyApXG4gICAgICBsZXQgZ3JhcGggXG5cbiAgICAgIHN3aXRjaCggcHJvcHMuY29sb3IgKSB7XG4gICAgICAgIGNhc2UgJ2Jyb3duJzpcbiAgICAgICAgICBncmFwaCA9IGcubXVsKCBPc2NpbGxhdG9ycy5nZW5pc2guQnJvd24oKSwgZy5pbignZ2FpbicpIClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncGluayc6XG4gICAgICAgICAgZ3JhcGggPSBnLm11bCggT3NjaWxsYXRvcnMuZ2VuaXNoLlBpbmsoKSwgZy5pbignZ2FpbicpIClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBncmFwaCA9IGcubXVsKCBnLm5vaXNlKCksIGcuaW4oJ2dhaW4nKSApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBub2lzZSwgZ3JhcGgsIFsnb3NjaWxsYXRvcnMnLCdub2lzZSddLCBwcm9wcyApXG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9LFxuXG4gICAgU2F3KCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3Qgc2F3ICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICkgXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oeyBhbnRpYWxpYXM6ZmFsc2UgfSwgT3NjaWxsYXRvcnMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgICAgY29uc3Qgb3NjICAgPSBPc2NpbGxhdG9ycy5mYWN0b3J5KCAnc2F3JywgZy5pbiggJ2ZyZXF1ZW5jeScgKSwgcHJvcHMuYW50aWFsaWFzIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIG9zYywgZy5pbignZ2FpbicgKSApXG5cbiAgICAgIGNvbnN0IG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBzYXcsIGdyYXBoLCBbJ29zY2lsbGF0b3JzJywnc2F3J10sIHByb3BzIClcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH0sXG5cbiAgICBSZXZlcnNlU2F3KCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3Qgc2F3ICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICkgXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oeyBhbnRpYWxpYXM6ZmFsc2UgfSwgT3NjaWxsYXRvcnMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgICAgY29uc3Qgb3NjICAgPSBnLnN1YiggMSwgT3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NhdycsIGcuaW4oICdmcmVxdWVuY3knICksIHByb3BzLmFudGlhbGlhcyApIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIG9zYywgZy5pbiggJ2dhaW4nICkgKVxuXG4gICAgICBjb25zdCBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeSggc2F3LCBncmFwaCwgWydvc2NpbGxhdG9ycycsJ1JldmVyc2VTYXcnXSwgcHJvcHMgKVxuICAgICAgXG4gICAgICByZXR1cm4gb3V0XG4gICAgfSxcblxuICAgIGZhY3RvcnkoIHR5cGUsIGZyZXF1ZW5jeSwgYW50aWFsaWFzPWZhbHNlICkge1xuICAgICAgbGV0IG9zY1xuXG4gICAgICBzd2l0Y2goIHR5cGUgKSB7XG4gICAgICAgIGNhc2UgJ3B3bSc6XG4gICAgICAgICAgbGV0IHB1bHNld2lkdGggPSBnLmluKCdwdWxzZXdpZHRoJylcbiAgICAgICAgICBpZiggYW50aWFsaWFzID09PSB0cnVlICkge1xuICAgICAgICAgICAgb3NjID0gZmVlZGJhY2tPc2MoIGZyZXF1ZW5jeSwgMSwgcHVsc2V3aWR0aCwgeyB0eXBlOjEgfSlcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGxldCBwaGFzZSA9IGcucGhhc29yKCBmcmVxdWVuY3ksIDAsIHsgbWluOjAgfSApXG4gICAgICAgICAgICBvc2MgPSBnLmx0KCBwaGFzZSwgcHVsc2V3aWR0aCApXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzYXcnOlxuICAgICAgICAgIGlmKCBhbnRpYWxpYXMgPT09IGZhbHNlICkge1xuICAgICAgICAgICAgb3NjID0gZy5waGFzb3IoIGZyZXF1ZW5jeSApXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBvc2MgPSBmZWVkYmFja09zYyggZnJlcXVlbmN5LCAxIClcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NpbmUnOlxuICAgICAgICAgIG9zYyA9IGcuY3ljbGUoIGZyZXF1ZW5jeSApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICAgICAgaWYoIGFudGlhbGlhcyA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICAgIG9zYyA9IGZlZWRiYWNrT3NjKCBmcmVxdWVuY3ksIDEsIC41LCB7IHR5cGU6MSB9KVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgb3NjID0gZy53YXZldGFibGUoIGZyZXF1ZW5jeSwgeyBidWZmZXI6T3NjaWxsYXRvcnMuU3F1YXJlLmJ1ZmZlciwgbmFtZTonc3F1YXJlJyB9IClcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3RyaWFuZ2xlJzpcbiAgICAgICAgICBvc2MgPSBnLndhdmV0YWJsZSggZnJlcXVlbmN5LCB7IGJ1ZmZlcjpPc2NpbGxhdG9ycy5UcmlhbmdsZS5idWZmZXIsIG5hbWU6J3RyaWFuZ2xlJyB9IClcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9zY1xuICAgIH1cbiAgfVxuXG4gIE9zY2lsbGF0b3JzLlNxdWFyZS5idWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICBmb3IoIGxldCBpID0gMTAyMzsgaSA+PSAwOyBpLS0gKSB7IFxuICAgIE9zY2lsbGF0b3JzLlNxdWFyZS5idWZmZXIgWyBpIF0gPSBpIC8gMTAyNCA+IC41ID8gMSA6IC0xXG4gIH1cblxuICBPc2NpbGxhdG9ycy5UcmlhbmdsZS5idWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICBcbiAgZm9yKCBsZXQgaSA9IDEwMjQ7IGktLTsgaSA9IGkgKSB7IE9zY2lsbGF0b3JzLlRyaWFuZ2xlLmJ1ZmZlcltpXSA9IDEgLSA0ICogTWF0aC5hYnMoKCAoaSAvIDEwMjQpICsgMC4yNSkgJSAxIC0gMC41KTsgfVxuXG4gIE9zY2lsbGF0b3JzLmRlZmF1bHRzID0ge1xuICAgIGZyZXF1ZW5jeTogNDQwLFxuICAgIGdhaW46IDFcbiAgfVxuXG4gIHJldHVybiBPc2NpbGxhdG9yc1xuXG59XG4iLCJjb25zdCBnZW5pc2ggPSByZXF1aXJlKCdnZW5pc2guanMnKSxcbiAgICAgIHNzZCA9IGdlbmlzaC5oaXN0b3J5LFxuICAgICAgZGF0YSA9IGdlbmlzaC5kYXRhLFxuICAgICAgbm9pc2UgPSBnZW5pc2gubm9pc2U7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBcInVzZSBqc2RzcFwiO1xuXG4gIGNvbnN0IGIgPSBkYXRhKDgsIDEsIHsgbWV0YTogdHJ1ZSB9KTtcbiAgY29uc3Qgd2hpdGUgPSBnZW5pc2guc3ViKGdlbmlzaC5tdWwobm9pc2UoKSwgMiksIDEpO1xuXG4gIGJbMF0gPSBnZW5pc2guYWRkKGdlbmlzaC5tdWwoLjk5ODg2LCBiWzBdKSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjA1NTUxNzkpKTtcbiAgYlsxXSA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bCguOTkzMzIsIGJbMV0pLCBnZW5pc2gubXVsKHdoaXRlLCAuMDc1MDU3OSkpO1xuICBiWzJdID0gZ2VuaXNoLmFkZChnZW5pc2gubXVsKC45NjkwMCwgYlsyXSksIGdlbmlzaC5tdWwod2hpdGUsIC4xNTM4NTIwKSk7XG4gIGJbM10gPSBnZW5pc2guYWRkKGdlbmlzaC5tdWwoLjg4NjUwLCBiWzNdKSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjMxMDQ4NTYpKTtcbiAgYls0XSA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bCguNTUwMDAsIGJbNF0pLCBnZW5pc2gubXVsKHdoaXRlLCAuNTMyOTUyMikpO1xuICBiWzVdID0gZ2VuaXNoLnN1YihnZW5pc2gubXVsKC0uNzYxNiwgYls1XSksIGdlbmlzaC5tdWwod2hpdGUsIC4wMTY4OTgwKSk7XG5cbiAgY29uc3Qgb3V0ID0gZ2VuaXNoLm11bChnZW5pc2guYWRkKGdlbmlzaC5hZGQoZ2VuaXNoLmFkZChnZW5pc2guYWRkKGdlbmlzaC5hZGQoZ2VuaXNoLmFkZChnZW5pc2guYWRkKGJbMF0sIGJbMV0pLCBiWzJdKSwgYlszXSksIGJbNF0pLCBiWzVdKSwgYls2XSksIGdlbmlzaC5tdWwod2hpdGUsIC41MzYyKSksIC4xMSk7XG5cbiAgYls2XSA9IGdlbmlzaC5tdWwod2hpdGUsIC4xMTU5MjYpO1xuXG4gIHJldHVybiBvdXQ7XG59OyIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IFdhdmV0YWJsZSA9IGZ1bmN0aW9uKCBpbnB1dFByb3BzICkge1xuICAgIGNvbnN0IHdhdmV0YWJsZSA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgIGNvbnN0IHByb3BzICA9IE9iamVjdC5hc3NpZ24oe30sIEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgY29uc3Qgb3NjID0gZy53YXZldGFibGUoIGcuaW4oJ2ZyZXF1ZW5jeScpLCBwcm9wcyApXG4gICAgY29uc3QgZ3JhcGggPSBnLm11bCggXG4gICAgICBvc2MsIFxuICAgICAgZy5pbiggJ2dhaW4nIClcbiAgICApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggd2F2ZXRhYmxlLCBncmFwaCwgJ3dhdmV0YWJsZScsIHByb3BzIClcblxuICAgIHJldHVybiB3YXZldGFibGVcbiAgfVxuXG4gIGcud2F2ZXRhYmxlID0gZnVuY3Rpb24oIGZyZXF1ZW5jeSwgcHJvcHMgKSB7XG4gICAgbGV0IGRhdGFQcm9wcyA9IHsgaW1tdXRhYmxlOnRydWUgfVxuXG4gICAgLy8gdXNlIGdsb2JhbCByZWZlcmVuY2VzIGlmIGFwcGxpY2FibGVcbiAgICBpZiggcHJvcHMubmFtZSAhPT0gdW5kZWZpbmVkICkgZGF0YVByb3BzLmdsb2JhbCA9IHByb3BzLm5hbWVcblxuICAgIGNvbnN0IGJ1ZmZlciA9IGcuZGF0YSggcHJvcHMuYnVmZmVyLCAxLCBkYXRhUHJvcHMgKVxuXG4gICAgcmV0dXJuIGcucGVlayggYnVmZmVyLCBnLnBoYXNvciggZnJlcXVlbmN5LCAwLCB7IG1pbjowIH0gKSApXG4gIH1cblxuICByZXR1cm4gV2F2ZXRhYmxlXG59XG4iLCJjb25zdCBRdWV1ZSA9IHJlcXVpcmUoICcuLi9leHRlcm5hbC9wcmlvcml0eXF1ZXVlLmpzJyApXG5jb25zdCBCaWcgICA9IHJlcXVpcmUoICdiaWcuanMnIClcblxubGV0IFNjaGVkdWxlciA9IHtcbiAgcGhhc2U6IDAsXG5cbiAgcXVldWU6IG5ldyBRdWV1ZSggKCBhLCBiICkgPT4ge1xuICAgIGlmKCBhLnRpbWUgPT09IGIudGltZSApIHsgLy9hLnRpbWUuZXEoIGIudGltZSApICkge1xuICAgICAgcmV0dXJuIGIucHJpb3JpdHkgLSBhLnByaW9yaXR5XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gYS50aW1lIC0gYi50aW1lIC8vYS50aW1lLm1pbnVzKCBiLnRpbWUgKVxuICAgIH1cbiAgfSksXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5xdWV1ZS5kYXRhLmxlbmd0aCA9IDBcbiAgICB0aGlzLnF1ZXVlLmxlbmd0aCA9IDBcbiAgfSxcblxuICBhZGQoIHRpbWUsIGZ1bmMsIHByaW9yaXR5ID0gMCApIHtcbiAgICB0aW1lICs9IHRoaXMucGhhc2VcblxuICAgIHRoaXMucXVldWUucHVzaCh7IHRpbWUsIGZ1bmMsIHByaW9yaXR5IH0pXG4gIH0sXG5cbiAgdGljaygpIHtcbiAgICBpZiggdGhpcy5xdWV1ZS5sZW5ndGggKSB7XG4gICAgICBsZXQgbmV4dCA9IHRoaXMucXVldWUucGVlaygpXG5cbiAgICAgIHdoaWxlKCB0aGlzLnBoYXNlID49IG5leHQudGltZSApIHtcbiAgICAgICAgbmV4dC5mdW5jKClcbiAgICAgICAgdGhpcy5xdWV1ZS5wb3AoKVxuICAgICAgICBuZXh0ID0gdGhpcy5xdWV1ZS5wZWVrKClcbiAgICAgIH1cblxuICAgIH1cblxuICAgIHRoaXMucGhhc2UrK1xuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjaGVkdWxlclxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBwcm94eSA9IHJlcXVpcmUoICcuLi93b3JrbGV0UHJveHkuanMnICksXG4gICAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBjb25zdCBfX3Byb3RvX18gPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuICBPYmplY3QuYXNzaWduKCBfX3Byb3RvX18sIHtcbiAgICBzdGFydCgpIHtcbiAgICAgIHRoaXMuY29ubmVjdCgpXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG4gICAgc3RvcCgpIHtcbiAgICAgIHRoaXMuZGlzY29ubmVjdCgpXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgfSlcblxuICBjb25zdCBTZXEyID0geyBcbiAgICBjcmVhdGUoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBzZXEgPSBPYmplY3QuY3JlYXRlKCBfX3Byb3RvX18gKSxcbiAgICAgICAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgU2VxMi5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG5cbiAgICAgIHNlcS5waGFzZSA9IDBcbiAgICAgIHNlcS5pbnB1dE5hbWVzID0gWyAncmF0ZScgXVxuICAgICAgc2VxLmlucHV0cyA9IFsgMSBdXG4gICAgICBzZXEubmV4dFRpbWUgPSAwXG4gICAgICBzZXEudmFsdWVzUGhhc2UgPSAwXG4gICAgICBzZXEudGltaW5nc1BoYXNlID0gMFxuICAgICAgc2VxLmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHNlcS5kaXJ0eSA9IHRydWVcbiAgICAgIHNlcS50eXBlID0gJ3NlcSdcbiAgICAgIHNlcS5fX3Byb3BlcnRpZXNfXyA9IHByb3BzXG5cbiAgICAgIGlmKCBwcm9wcy50YXJnZXQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc2VxLmFub25GdW5jdGlvbiA9IHRydWVcbiAgICAgIH1lbHNleyBcbiAgICAgICAgc2VxLmFub25GdW5jdGlvbiA9IGZhbHNlXG4gICAgICAgIHNlcS5jYWxsRnVuY3Rpb24gPSB0eXBlb2YgcHJvcHMudGFyZ2V0WyBwcm9wcy5rZXkgXSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgfVxuXG4gICAgICBwcm9wcy5pZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG5cbiAgICAgIC8vIG5lZWQgYSBzZXBhcmF0ZSByZWZlcmVuY2UgdG8gdGhlIHByb3BlcnRpZXMgZm9yIHdvcmtsZXQgbWV0YS1wcm9ncmFtbWluZ1xuICAgICAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBTZXEyLmRlZmF1bHRzLCBwcm9wcyApXG4gICAgICBPYmplY3QuYXNzaWduKCBzZXEsIHByb3BlcnRpZXMgKSBcbiAgICAgIHNlcS5fX3Byb3BlcnRpZXNfXyA9IHByb3BlcnRpZXNcblxuICAgICAgc2VxLmNhbGxiYWNrID0gZnVuY3Rpb24oIHJhdGUgKSB7XG4gICAgICAgIGlmKCBzZXEucGhhc2UgPj0gc2VxLm5leHRUaW1lICkge1xuICAgICAgICAgIGxldCB2YWx1ZSA9IHNlcS52YWx1ZXNbIHNlcS52YWx1ZXNQaGFzZSsrICUgc2VxLnZhbHVlcy5sZW5ndGggXVxuXG4gICAgICAgICAgaWYoIHNlcS5hbm9uRnVuY3Rpb24gfHwgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICkgdmFsdWUgPSB2YWx1ZSgpXG4gICAgICAgICAgXG4gICAgICAgICAgaWYoIHNlcS5hbm9uRnVuY3Rpb24gPT09IGZhbHNlICkge1xuICAgICAgICAgICAgaWYoIHNlcS5jYWxsRnVuY3Rpb24gPT09IGZhbHNlICkge1xuICAgICAgICAgICAgICBzZXEudGFyZ2V0WyBzZXEua2V5IF0gPSB2YWx1ZVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIHNlcS50YXJnZXRbIHNlcS5rZXkgXSggdmFsdWUgKSBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZXEucGhhc2UgLT0gc2VxLm5leHRUaW1lXG5cbiAgICAgICAgICBsZXQgdGltaW5nID0gc2VxLnRpbWluZ3NbIHNlcS50aW1pbmdzUGhhc2UrKyAlIHNlcS50aW1pbmdzLmxlbmd0aCBdXG4gICAgICAgICAgaWYoIHR5cGVvZiB0aW1pbmcgPT09ICdmdW5jdGlvbicgKSB0aW1pbmcgPSB0aW1pbmcoKVxuXG4gICAgICAgICAgc2VxLm5leHRUaW1lID0gdGltaW5nXG4gICAgICAgIH1cblxuICAgICAgICBzZXEucGhhc2UgKz0gcmF0ZVxuXG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG5cbiAgICAgIHNlcS51Z2VuTmFtZSA9IHNlcS5jYWxsYmFjay51Z2VuTmFtZSA9ICdzZXFfJyArIHNlcS5pZFxuICAgICAgXG4gICAgICBsZXQgdmFsdWUgPSBzZXEucmF0ZVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBzZXEsICdyYXRlJywge1xuICAgICAgICBnZXQoKSB7IHJldHVybiB2YWx1ZSB9LFxuICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgaWYoIHZhbHVlICE9PSB2ICkge1xuICAgICAgICAgICAgR2liYmVyaXNoLmRpcnR5KCBzZXEgKVxuICAgICAgICAgICAgdmFsdWUgPSB2XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gcHJveHkoIFsnU2VxdWVuY2VyMiddLCBwcm9wcywgc2VxICkgXG4gICAgfVxuICB9XG5cbiAgU2VxMi5kZWZhdWx0cyA9IHsgcmF0ZTogMSB9XG5cbiAgcmV0dXJuIFNlcTIuY3JlYXRlXG5cbn1cblxuIiwiY29uc3QgUXVldWUgPSByZXF1aXJlKCAnLi4vZXh0ZXJuYWwvcHJpb3JpdHlxdWV1ZS5qcycgKVxuY29uc3QgQmlnICAgPSByZXF1aXJlKCAnYmlnLmpzJyApXG5jb25zdCBwcm94eSA9IHJlcXVpcmUoICcuLi93b3JrbGV0UHJveHkuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG5sZXQgU2VxdWVuY2VyID0gcHJvcHMgPT4ge1xuICBsZXQgc2VxID0ge1xuICAgIF9faXNSdW5uaW5nOmZhbHNlLFxuXG4gICAgX192YWx1ZXNQaGFzZTogIDAsXG4gICAgX190aW1pbmdzUGhhc2U6IDAsXG4gICAgX190eXBlOidzZXEnLFxuXG4gICAgdGljaygpIHtcbiAgICAgIGxldCB2YWx1ZSAgPSBzZXEudmFsdWVzWyAgc2VxLl9fdmFsdWVzUGhhc2UrKyAgJSBzZXEudmFsdWVzLmxlbmd0aCAgXSxcbiAgICAgICAgICB0aW1pbmcgPSBzZXEudGltaW5nc1sgc2VxLl9fdGltaW5nc1BoYXNlKysgJSBzZXEudGltaW5ncy5sZW5ndGggXVxuXG4gICAgICBpZiggdHlwZW9mIHRpbWluZyA9PT0gJ2Z1bmN0aW9uJyApIHRpbWluZyA9IHRpbWluZygpXG5cbiAgICAgIGlmKCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgJiYgc2VxLnRhcmdldCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICB2YWx1ZSgpXG4gICAgICB9ZWxzZSBpZiggdHlwZW9mIHNlcS50YXJnZXRbIHNlcS5rZXkgXSA9PT0gJ2Z1bmN0aW9uJyApIHtcbiAgICAgICAgaWYoIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyApIHZhbHVlID0gdmFsdWUoKVxuICAgICAgICBzZXEudGFyZ2V0WyBzZXEua2V5IF0oIHZhbHVlIClcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICkgdmFsdWUgPSB2YWx1ZSgpXG4gICAgICAgIHNlcS50YXJnZXRbIHNlcS5rZXkgXSA9IHZhbHVlXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmKCBzZXEuX19pc1J1bm5pbmcgPT09IHRydWUgKSB7XG4gICAgICAgIEdpYmJlcmlzaC5zY2hlZHVsZXIuYWRkKCB0aW1pbmcsIHNlcS50aWNrLCBzZXEucHJpb3JpdHkgKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdGFydCggZGVsYXkgPSAwICkge1xuICAgICAgc2VxLl9faXNSdW5uaW5nID0gdHJ1ZVxuICAgICAgR2liYmVyaXNoLnNjaGVkdWxlci5hZGQoIGRlbGF5LCBzZXEudGljaywgc2VxLnByaW9yaXR5IClcbiAgICAgIHJldHVybiBzZXFcbiAgICB9LFxuXG4gICAgc3RvcCgpIHtcbiAgICAgIHNlcS5fX2lzUnVubmluZyA9IGZhbHNlXG4gICAgICByZXR1cm4gc2VxXG4gICAgfVxuICB9XG5cbiAgcHJvcHMuaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuXG4gIC8vIG5lZWQgYSBzZXBhcmF0ZSByZWZlcmVuY2UgdG8gdGhlIHByb3BlcnRpZXMgZm9yIHdvcmtsZXQgbWV0YS1wcm9ncmFtbWluZ1xuICBjb25zdCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbigge30sIFNlcXVlbmNlci5kZWZhdWx0cywgcHJvcHMgKVxuICBPYmplY3QuYXNzaWduKCBzZXEsIHByb3BlcnRpZXMgKSBcbiAgc2VxLl9fcHJvcGVydGllc19fID0gcHJvcGVydGllc1xuXG4gIHJldHVybiBwcm94eSggWydTZXF1ZW5jZXInXSwgcHJvcGVydGllcywgc2VxIClcbn1cblxuU2VxdWVuY2VyLmRlZmF1bHRzID0geyBwcmlvcml0eTowIH1cblxuU2VxdWVuY2VyLm1ha2UgPSBmdW5jdGlvbiggdmFsdWVzLCB0aW1pbmdzLCB0YXJnZXQsIGtleSApIHtcbiAgcmV0dXJuIFNlcXVlbmNlcih7IHZhbHVlcywgdGltaW5ncywgdGFyZ2V0LCBrZXkgfSlcbn1cblxucmV0dXJuIFNlcXVlbmNlclxuXG59XG4iLCJjb25zdCByZXBsYWNlID0gb2JqID0+IHtcbiAgaWYoIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICkge1xuICAgIGlmKCBvYmouaWQgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHJldHVybiBwcm9jZXNzb3IudWdlbnMuZ2V0KCBvYmouaWQgKVxuICAgIH0gXG4gIH1cblxuICByZXR1cm4gb2JqXG59XG5cbmxldCB1Z2VuID0ge1xuICBmcmVlOmZ1bmN0aW9uKCkge1xuICAgIEdpYmJlcmlzaC5nZW5pc2guZ2VuLmZyZWUoIHRoaXMuZ3JhcGggKVxuICB9LFxuXG4gIHByaW50OmZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCB0aGlzLmNhbGxiYWNrLnRvU3RyaW5nKCkgKVxuICB9LFxuXG4gIGNvbm5lY3Q6ZnVuY3Rpb24oIHRhcmdldCwgbGV2ZWw9MSApIHtcbiAgICBpZiggdGhpcy5jb25uZWN0ZWQgPT09IHVuZGVmaW5lZCApIHRoaXMuY29ubmVjdGVkID0gW11cblxuXG4gICAgbGV0IGlucHV0ID0gbGV2ZWwgPT09IDEgPyB0aGlzIDogR2liYmVyaXNoLmJpbm9wcy5NdWwoIHRoaXMsIGxldmVsIClcblxuICAgIGlmKCB0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwgKSB0YXJnZXQgPSBHaWJiZXJpc2gub3V0cHV0IFxuXG5cbiAgICBpZiggdHlwZW9mIHRhcmdldC5fX2FkZElucHV0ID09ICdmdW5jdGlvbicgKSB7XG4gICAgICB0YXJnZXQuX19hZGRJbnB1dCggaW5wdXQgKVxuICAgIH0gZWxzZSBpZiggdGFyZ2V0LnN1bSAmJiB0YXJnZXQuc3VtLmlucHV0cyApIHtcbiAgICAgIHRhcmdldC5zdW0uaW5wdXRzLnB1c2goIGlucHV0IClcbiAgICB9IGVsc2UgaWYoIHRhcmdldC5pbnB1dHMgKSB7XG4gICAgICB0YXJnZXQuaW5wdXRzLnB1c2goIGlucHV0IClcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0LmlucHV0ID0gaW5wdXRcbiAgICB9XG5cbiAgICBHaWJiZXJpc2guZGlydHkoIHRhcmdldCApXG5cbiAgICB0aGlzLmNvbm5lY3RlZC5wdXNoKFsgdGFyZ2V0LCBpbnB1dCBdKVxuICAgIFxuICAgIHJldHVybiB0aGlzXG4gIH0sXG5cbiAgZGlzY29ubmVjdDpmdW5jdGlvbiggdGFyZ2V0ICkge1xuICAgIGlmKCB0YXJnZXQgPT09IHVuZGVmaW5lZCApe1xuICAgICAgZm9yKCBsZXQgY29ubmVjdGlvbiBvZiB0aGlzLmNvbm5lY3RlZCApIHtcbiAgICAgICAgY29ubmVjdGlvblswXS5kaXNjb25uZWN0VWdlbiggY29ubmVjdGlvblsxXSApXG4gICAgICB9XG4gICAgICB0aGlzLmNvbm5lY3RlZC5sZW5ndGggPSAwXG4gICAgfWVsc2V7XG4gICAgICBjb25zdCBjb25uZWN0aW9uID0gdGhpcy5jb25uZWN0ZWQuZmluZCggdiA9PiB2WzBdID09PSB0YXJnZXQgKVxuICAgICAgdGFyZ2V0LmRpc2Nvbm5lY3RVZ2VuKCBjb25uZWN0aW9uWzFdIClcbiAgICAgIGNvbnN0IHRhcmdldElkeCA9IHRoaXMuY29ubmVjdGVkLmluZGV4T2YoIGNvbm5lY3Rpb24gKVxuICAgICAgdGhpcy5jb25uZWN0ZWQuc3BsaWNlKCB0YXJnZXRJZHgsIDEgKVxuICAgIH1cbiAgfSxcblxuICBjaGFpbjpmdW5jdGlvbiggdGFyZ2V0LCBsZXZlbD0xICkge1xuICAgIHRoaXMuY29ubmVjdCggdGFyZ2V0LGxldmVsIClcblxuICAgIHJldHVybiB0YXJnZXRcbiAgfSxcblxuICBfX3JlZG9HcmFwaDpmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9fY3JlYXRlR3JhcGgoKVxuICAgIHRoaXMuY2FsbGJhY2sgPSBHaWJiZXJpc2guZ2VuaXNoLmdlbi5jcmVhdGVDYWxsYmFjayggdGhpcy5ncmFwaCwgR2liYmVyaXNoLm1lbW9yeSwgZmFsc2UsIHRydWUgKVxuICAgIHRoaXMuaW5wdXROYW1lcyA9IG5ldyBTZXQoIEdpYmJlcmlzaC5nZW5pc2guZ2VuLnBhcmFtZXRlcnMgKSBcbiAgICB0aGlzLmNhbGxiYWNrLnVnZW5OYW1lID0gdGhpcy51Z2VuTmFtZVxuICAgIEdpYmJlcmlzaC5kaXJ0eSggdGhpcyApXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gdWdlblxuIiwiY29uc3QgcHJveHkgPSByZXF1aXJlKCAnLi93b3JrbGV0UHJveHkuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBsZXQgdWlkID0gMFxuXG4gIGNvbnN0IGZhY3RvcnkgPSBmdW5jdGlvbiggdWdlbiwgZ3JhcGgsIF9fbmFtZSwgdmFsdWVzLCBjYj1udWxsLCBzaG91bGRQcm94eSA9IHRydWUgKSB7XG4gICAgdWdlbi5jYWxsYmFjayA9IGNiID09PSBudWxsID8gR2liYmVyaXNoLmdlbmlzaC5nZW4uY3JlYXRlQ2FsbGJhY2soIGdyYXBoLCBHaWJiZXJpc2gubWVtb3J5LCBmYWxzZSwgdHJ1ZSApIDogY2JcblxuICAgIGxldCBuYW1lID0gQXJyYXkuaXNBcnJheSggX19uYW1lICkgPyBfX25hbWVbIF9fbmFtZS5sZW5ndGggLSAxIF0gOiBfX25hbWVcblxuICAgIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICAgIHR5cGU6ICd1Z2VuJyxcbiAgICAgIGlkOiBmYWN0b3J5LmdldFVJRCgpLCBcbiAgICAgIHVnZW5OYW1lOiBuYW1lICsgJ18nLFxuICAgICAgZ3JhcGg6IGdyYXBoLFxuICAgICAgaW5wdXROYW1lczogbmV3IFNldCggR2liYmVyaXNoLmdlbmlzaC5nZW4ucGFyYW1ldGVycyApLFxuICAgICAgaXNTdGVyZW86IEFycmF5LmlzQXJyYXkoIGdyYXBoICksXG4gICAgICBkaXJ0eTogdHJ1ZSxcbiAgICAgIF9fcHJvcGVydGllc19fOnZhbHVlc1xuICAgIH0pXG4gICAgXG4gICAgdWdlbi51Z2VuTmFtZSArPSB1Z2VuLmlkXG4gICAgdWdlbi5jYWxsYmFjay51Z2VuTmFtZSA9IHVnZW4udWdlbk5hbWUgLy8gWFhYIGhhY2t5XG5cbiAgICBmb3IoIGxldCBwYXJhbSBvZiB1Z2VuLmlucHV0TmFtZXMgKSB7XG4gICAgICBpZiggcGFyYW0gPT09ICdtZW1vcnknICkgY29udGludWVcblxuICAgICAgbGV0IHZhbHVlID0gdmFsdWVzWyBwYXJhbSBdXG5cbiAgICAgIC8vIFRPRE86IGRvIHdlIG5lZWQgdG8gY2hlY2sgZm9yIGEgc2V0dGVyP1xuICAgICAgbGV0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKCB1Z2VuLCBwYXJhbSApLFxuICAgICAgICAgIHNldHRlclxuXG4gICAgICBpZiggZGVzYyAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICBzZXR0ZXIgPSBkZXNjLnNldFxuICAgICAgfVxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sIHBhcmFtLCB7XG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHZhbHVlIH0sXG4gICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICBpZiggdmFsdWUgIT09IHYgKSB7XG4gICAgICAgICAgICBHaWJiZXJpc2guZGlydHkoIHVnZW4gKVxuICAgICAgICAgICAgaWYoIHNldHRlciAhPT0gdW5kZWZpbmVkICkgc2V0dGVyKCB2IClcbiAgICAgICAgICAgIHZhbHVlID0gdlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiggdWdlbi5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgdWdlbi5fX3JlcXVpcmVzUmVjb21waWxhdGlvbi5mb3JFYWNoKCBwcm9wID0+IHtcbiAgICAgICAgbGV0IHZhbHVlID0gdWdlblsgcHJvcCBdXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgcHJvcCwge1xuICAgICAgICAgIGdldCgpIHsgcmV0dXJuIHZhbHVlIH0sXG4gICAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgICAgaWYoIHZhbHVlICE9PSB2ICkge1xuICAgICAgICAgICAgICB2YWx1ZSA9IHZcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIC8vIG5lZWRlZCBmb3IgZmlsdGVyVHlwZSBhdCB0aGUgdmVyeSBsZWFzdCwgYmVjYXVhZSB0aGUgcHJvcHNcbiAgICAgICAgICAgICAgLy8gYXJlIHJldXNlZCB3aGVuIHJlLWNyZWF0aW5nIHRoZSBncmFwaC4gVGhpcyBzZWVtcyBsaWtlIGEgY2hlYXBlclxuICAgICAgICAgICAgICAvLyB3YXkgdG8gc29sdmUgdGhpcyBwcm9ibGVtLlxuICAgICAgICAgICAgICB2YWx1ZXNbIHByb3AgXSA9IHZcblxuICAgICAgICAgICAgICBpZiggR2liYmVyaXNoLm1vZGUgIT09ICd3b3JrbGV0JyApIGNvbnNvbGUubG9nKCAncmVkb2luZyBncmFwaCEnLCB2IClcbiAgICAgICAgICAgICAgdGhpcy5fX3JlZG9HcmFwaCgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyB3aWxsIG9ubHkgY3JlYXRlIHByb3h5IGlmIHdvcmtsZXRzIGFyZSBiZWluZyB1c2VkXG4gICAgLy8gb3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHVuYWx0ZXJlZCB1Z2VuXG4gICAgcmV0dXJuIHNob3VsZFByb3h5ID8gcHJveHkoIF9fbmFtZSwgdmFsdWVzLCB1Z2VuICkgOiB1Z2VuXG4gIH1cblxuICBmYWN0b3J5LmdldFVJRCA9ICgpID0+IHVpZCsrXG5cbiAgcmV0dXJuIGZhY3Rvcnlcbn1cbiIsImxldCBnZW5pc2ggPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxubGV0IHV0aWxpdGllcyA9IHtcbiAgY3JlYXRlQ29udGV4dCggY3R4LCBjYiwgcmVzb2x2ZSApIHtcbiAgICBsZXQgQUMgPSB0eXBlb2YgQXVkaW9Db250ZXh0ID09PSAndW5kZWZpbmVkJyA/IHdlYmtpdEF1ZGlvQ29udGV4dCA6IEF1ZGlvQ29udGV4dFxuXG4gICAgbGV0IHN0YXJ0ID0gKCkgPT4ge1xuICAgICAgaWYoIHR5cGVvZiBBQyAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgIEdpYmJlcmlzaC5jdHggPSBjdHggPT09IHVuZGVmaW5lZCA/IG5ldyBBQygpIDogY3R4XG4gICAgICAgIGdlbmlzaC5nZW4uc2FtcGxlcmF0ZSA9IEdpYmJlcmlzaC5jdHguc2FtcGxlUmF0ZVxuICAgICAgICBnZW5pc2gudXRpbGl0aWVzLmN0eCA9IEdpYmJlcmlzaC5jdHhcblxuICAgICAgICBpZiggZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG5cbiAgICAgICAgICBpZiggJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICl7IC8vIHJlcXVpcmVkIHRvIHN0YXJ0IGF1ZGlvIHVuZGVyIGlPUyA2XG4gICAgICAgICAgICBsZXQgbXlTb3VyY2UgPSB1dGlsaXRpZXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICAgICAgICBteVNvdXJjZS5jb25uZWN0KCB1dGlsaXRpZXMuY3R4LmRlc3RpbmF0aW9uIClcbiAgICAgICAgICAgIG15U291cmNlLm5vdGVPbiggMCApXG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIHN0YXJ0IClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiggdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nICkgY2IoIHJlc29sdmUgKVxuICAgIH1cblxuICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuICAgIH1lbHNle1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBzdGFydCApXG4gICAgfVxuXG4gICAgcmV0dXJuIEdpYmJlcmlzaC5jdHhcbiAgfSxcblxuICBjcmVhdGVTY3JpcHRQcm9jZXNzb3IoIHJlc29sdmUgKSB7XG4gICAgR2liYmVyaXNoLm5vZGUgPSBHaWJiZXJpc2guY3R4LmNyZWF0ZVNjcmlwdFByb2Nlc3NvciggMTAyNCwgMCwgMiApLFxuICAgIEdpYmJlcmlzaC5jbGVhckZ1bmN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiAwIH0sXG4gICAgR2liYmVyaXNoLmNhbGxiYWNrID0gR2liYmVyaXNoLmNsZWFyRnVuY3Rpb25cblxuICAgIEdpYmJlcmlzaC5ub2RlLm9uYXVkaW9wcm9jZXNzID0gZnVuY3Rpb24oIGF1ZGlvUHJvY2Vzc2luZ0V2ZW50ICkge1xuICAgICAgbGV0IGdpYmJlcmlzaCA9IEdpYmJlcmlzaCxcbiAgICAgICAgICBjYWxsYmFjayAgPSBnaWJiZXJpc2guY2FsbGJhY2ssXG4gICAgICAgICAgb3V0cHV0QnVmZmVyID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQub3V0cHV0QnVmZmVyLFxuICAgICAgICAgIHNjaGVkdWxlciA9IEdpYmJlcmlzaC5zY2hlZHVsZXIsXG4gICAgICAgICAgLy9vYmpzID0gZ2liYmVyaXNoLmNhbGxiYWNrVWdlbnMuc2xpY2UoIDAgKSxcbiAgICAgICAgICBsZW5ndGhcblxuICAgICAgbGV0IGxlZnQgPSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDAgKSxcbiAgICAgICAgICByaWdodD0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAxIClcblxuICAgICAgbGV0IGNhbGxiYWNrbGVuZ3RoID0gR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLmxlbmd0aFxuICAgICAgXG4gICAgICBpZiggY2FsbGJhY2tsZW5ndGggIT09IDAgKSB7XG4gICAgICAgIGZvciggbGV0IGk9MDsgaTwgY2FsbGJhY2tsZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3NbIGkgXSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBjYW4ndCBqdXN0IHNldCBsZW5ndGggdG8gMCBhcyBjYWxsYmFja3MgbWlnaHQgYmUgYWRkZWQgZHVyaW5nIGZvciBsb29wLCBzbyBzcGxpY2UgcHJlLWV4aXN0aW5nIGZ1bmN0aW9uc1xuICAgICAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3Muc3BsaWNlKCAwLCBjYWxsYmFja2xlbmd0aCApXG4gICAgICB9XG5cbiAgICAgIGZvciAobGV0IHNhbXBsZSA9IDAsIGxlbmd0aCA9IGxlZnQubGVuZ3RoOyBzYW1wbGUgPCBsZW5ndGg7IHNhbXBsZSsrKSB7XG4gICAgICAgIHNjaGVkdWxlci50aWNrKClcblxuICAgICAgICBpZiggZ2liYmVyaXNoLmdyYXBoSXNEaXJ0eSApIHsgXG4gICAgICAgICAgY2FsbGJhY2sgPSBnaWJiZXJpc2guZ2VuZXJhdGVDYWxsYmFjaygpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFhYWCBjYW50IHVzZSBkZXN0cnVjdHVyaW5nLCBiYWJlbCBtYWtlcyBpdCBzb21ldGhpbmcgaW5lZmZpY2llbnQuLi5cbiAgICAgICAgbGV0IG91dCA9IGNhbGxiYWNrLmFwcGx5KCBudWxsLCBnaWJiZXJpc2guY2FsbGJhY2tVZ2VucyApXG5cbiAgICAgICAgbGVmdFsgc2FtcGxlICBdID0gb3V0WzBdXG4gICAgICAgIHJpZ2h0WyBzYW1wbGUgXSA9IG91dFsxXVxuICAgICAgfVxuICAgIH1cblxuICAgIEdpYmJlcmlzaC5ub2RlLmNvbm5lY3QoIEdpYmJlcmlzaC5jdHguZGVzdGluYXRpb24gKVxuXG4gICAgcmVzb2x2ZSgpXG5cbiAgICByZXR1cm4gR2liYmVyaXNoLm5vZGVcbiAgfSwgXG5cbiAgY3JlYXRlV29ya2xldCggcmVzb2x2ZSApIHtcbiAgICBHaWJiZXJpc2guY3R4LmF1ZGlvV29ya2xldC5hZGRNb2R1bGUoIEdpYmJlcmlzaC53b3JrbGV0UGF0aCApLnRoZW4oICgpID0+IHtcbiAgICAgIEdpYmJlcmlzaC53b3JrbGV0ID0gbmV3IEF1ZGlvV29ya2xldE5vZGUoIEdpYmJlcmlzaC5jdHgsICdnaWJiZXJpc2gnIClcbiAgICAgIEdpYmJlcmlzaC53b3JrbGV0LmNvbm5lY3QoIEdpYmJlcmlzaC5jdHguZGVzdGluYXRpb24gKVxuICAgICAgR2liYmVyaXNoLndvcmtsZXQucG9ydC5vbm1lc3NhZ2UgPSBldmVudCA9PiB7XG4gICAgICAgIHN3aXRjaCggZXZlbnQuZGF0YS5hZGRyZXNzICkge1xuICAgICAgICAgIGNhc2UgJ2dldCc6XG4gICAgICAgICAgICBsZXQgbmFtZSA9IGV2ZW50LmRhdGEubmFtZVxuICAgICAgICAgICAgbGV0IHZhbHVlXG4gICAgICAgICAgICBpZiggbmFtZVswXSA9PT0gJ0dpYmJlcmlzaCcgKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gR2liYmVyaXNoXG4gICAgICAgICAgICAgIG5hbWUuc2hpZnQoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yKCBsZXQgc2VnbWVudCBvZiBuYW1lICkge1xuICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlWyBzZWdtZW50IF1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgR2liYmVyaXNoLndvcmtsZXQucG9ydC5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgIGFkZHJlc3M6J3NldCcsXG4gICAgICAgICAgICAgIG5hbWU6J0dpYmJlcmlzaC4nICsgbmFtZS5qb2luKCcuJyksXG4gICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVzb2x2ZSgpXG4gICAgfSlcbiAgfSxcblxuICB3cmFwKCBmdW5jICkge1xuICAgIGNvbnN0IG91dCA9IHtcbiAgICAgIGFjdGlvbjond3JhcCcsXG4gICAgICB2YWx1ZTpmdW5jICAgIFxuICAgIH1cbiAgICByZXR1cm4gb3V0XG4gIH0sXG5cbiAgZXhwb3J0KCBvYmogKSB7XG4gICAgb2JqLndyYXAgPSB0aGlzLndyYXBcbiAgfVxufVxuXG5yZXR1cm4gdXRpbGl0aWVzXG5cbn1cbiIsImNvbnN0IHNlcmlhbGl6ZSA9IHJlcXVpcmUoJ3NlcmlhbGl6ZS1qYXZhc2NyaXB0JylcblxuY29uc3QgcmVwbGFjZU9iaiA9IG9iaiA9PiB7XG4gIGlmKCB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmouaWQgIT09IHVuZGVmaW5lZCApIHtcbiAgICBpZiggb2JqLl9fdHlwZSAhPT0gJ3NlcScgKSB7IC8vIFhYWCB3aHk/XG4gICAgICByZXR1cm4geyBpZDpvYmouaWQsIHByb3A6b2JqLnByb3AgfVxuICAgIH1lbHNle1xuICAgICAgLy8gc2hvdWxkbid0IEkgYmUgc2VyaWFsaXppbmcgbW9zdCBvYmplY3RzLCBub3QganVzdCBzZXFzP1xuICAgICAgcmV0dXJuIHNlcmlhbGl6ZSggb2JqIClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9ialxufVxuXG5jb25zdCBtYWtlQW5kU2VuZE9iamVjdCA9IGZ1bmN0aW9uKCBfX25hbWUsIHZhbHVlcywgb2JqICkge1xuICBjb25zdCBwcm9wZXJ0aWVzID0ge31cbiAgZm9yKCBsZXQga2V5IGluIHZhbHVlcyApIHtcbiAgICBpZiggdHlwZW9mIHZhbHVlc1sga2V5IF0gPT09ICdvYmplY3QnICYmIHZhbHVlc1sga2V5IF0uX19tZXRhX18gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHByb3BlcnRpZXNbIGtleSBdID0gdmFsdWVzWyBrZXkgXS5fX21ldGFfX1xuICAgIH1lbHNlIGlmKCBBcnJheS5pc0FycmF5KCB2YWx1ZXNbIGtleSBdICkgKSB7XG4gICAgICBjb25zdCBhcnIgPSBbXVxuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB2YWx1ZXNbIGtleSBdLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBhcnJbIGkgXSA9IHJlcGxhY2VPYmooIHZhbHVlc1sga2V5IF1baV0gKVxuICAgICAgfVxuICAgICAgcHJvcGVydGllc1sga2V5IF0gPSBhcnJcbiAgICB9ZWxzZSBpZiggdHlwZW9mIHZhbHVlc1trZXldID09PSAnb2JqZWN0JyApe1xuICAgICAgcHJvcGVydGllc1sga2V5IF0gPSByZXBsYWNlT2JqKCB2YWx1ZXNbIGtleSBdIClcbiAgICB9ZWxzZXtcbiAgICAgIHByb3BlcnRpZXNbIGtleSBdID0gdmFsdWVzWyBrZXkgXVxuICAgIH1cbiAgfVxuXG4gIGxldCBzZXJpYWxpemVkUHJvcGVydGllcyA9IHNlcmlhbGl6ZSggcHJvcGVydGllcyApXG5cbiAgaWYoIEFycmF5LmlzQXJyYXkoIF9fbmFtZSApICkge1xuICAgIGNvbnN0IG9sZE5hbWUgPSBfX25hbWVbIF9fbmFtZS5sZW5ndGggLSAxIF1cbiAgICBfX25hbWVbIF9fbmFtZS5sZW5ndGggLSAxIF0gPSBvbGROYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyBvbGROYW1lLnN1YnN0cmluZygxKVxuICB9ZWxzZXtcbiAgICBfX25hbWUgPSBbIF9fbmFtZVswXS50b1VwcGVyQ2FzZSgpICsgX19uYW1lLnN1YnN0cmluZygxKSBdXG4gIH1cblxuICBvYmouX19tZXRhX18gPSB7XG4gICAgYWRkcmVzczonYWRkJyxcbiAgICBuYW1lOl9fbmFtZSxcbiAgICBwcm9wZXJ0aWVzOnNlcmlhbGl6ZWRQcm9wZXJ0aWVzLCBcbiAgICBpZDpvYmouaWRcbiAgfVxuXG4gIC8vY29uc29sZS5sb2coIG9iai5fX21ldGFfXyApXG5cbiAgR2liYmVyaXNoLndvcmtsZXQucG9ydC5wb3N0TWVzc2FnZSggb2JqLl9fbWV0YV9fIClcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBfX25hbWUsIHZhbHVlcywgb2JqICkge1xuXG4gIGlmKCBHaWJiZXJpc2gubW9kZSA9PT0gJ3dvcmtsZXQnICYmIEdpYmJlcmlzaC5wcmV2ZW50UHJveHkgPT09IGZhbHNlICkge1xuXG4gICAgbWFrZUFuZFNlbmRPYmplY3QoIF9fbmFtZSwgdmFsdWVzLCBvYmogKVxuXG4gICAgLy8gcHJveHkgZm9yIGFsbCBtZXRob2QgY2FsbHMgdG8gc2VuZCB0byB3b3JrbGV0XG4gICAgY29uc3QgcHJveHkgPSBuZXcgUHJveHkoIG9iaiwge1xuICAgICAgZ2V0KCB0YXJnZXQsIHByb3AsIHJlY2VpdmVyICkge1xuICAgICAgICBpZiggdHlwZW9mIHRhcmdldFsgcHJvcCBdID09PSAnZnVuY3Rpb24nICYmIHByb3AuaW5kZXhPZignX18nKSA9PT0gLTEpIHtcbiAgICAgICAgICBjb25zdCBwcm94eSA9IG5ldyBQcm94eSggdGFyZ2V0WyBwcm9wIF0sIHtcbiAgICAgICAgICAgIGFwcGx5KCBfX3RhcmdldCwgdGhpc0FyZywgYXJncyApIHtcbiAgICAgICAgICAgICAgY29uc3QgX19hcmdzID0gYXJncy5tYXAoIHJlcGxhY2VPYmogKVxuICAgICAgICAgICAgICAvL2lmKCBwcm9wID09PSAnY29ubmVjdCcgKSBjb25zb2xlLmxvZyggJ3Byb3h5IGNvbm5lY3Q6JywgX19hcmdzIClcblxuICAgICAgICAgICAgICBHaWJiZXJpc2gud29ya2xldC5wb3J0LnBvc3RNZXNzYWdlKHsgXG4gICAgICAgICAgICAgICAgYWRkcmVzczonbWV0aG9kJywgXG4gICAgICAgICAgICAgICAgb2JqZWN0Om9iai5pZCxcbiAgICAgICAgICAgICAgICBuYW1lOnByb3AsXG4gICAgICAgICAgICAgICAgYXJnczpfX2FyZ3NcbiAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0WyBwcm9wIF0uYXBwbHkoIHRoaXNBcmcsIGFyZ3MgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgXG4gICAgICAgICAgcmV0dXJuIHByb3h5XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0WyBwcm9wIF1cbiAgICAgIH0sXG4gICAgICBzZXQoIHRhcmdldCwgcHJvcCwgdmFsdWUsIHJlY2VpdmVyICkge1xuICAgICAgICBpZiggcHJvcCAhPT0gJ2Nvbm5lY3RlZCcgKSB7XG4gICAgICAgICAgY29uc3QgX192YWx1ZSA9IHJlcGxhY2VPYmooIHZhbHVlIClcbiAgICAgICAgICBjb25zb2xlLmxvZyggJ3NldHRlcjonLCBwcm9wLCBfX3ZhbHVlIClcblxuICAgICAgICAgIEdpYmJlcmlzaC53b3JrbGV0LnBvcnQucG9zdE1lc3NhZ2UoeyBcbiAgICAgICAgICAgIGFkZHJlc3M6J3NldCcsIFxuICAgICAgICAgICAgb2JqZWN0Om9iai5pZCxcbiAgICAgICAgICAgIG5hbWU6cHJvcCxcbiAgICAgICAgICAgIHZhbHVlOl9fdmFsdWVcbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgdGFyZ2V0WyBwcm9wIF0gPSB2YWx1ZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBYWFggWFhYIFhYWCBYWFggWFhYIFhYWFxuICAgIC8vIFJFTUVNQkVSIFRIQVQgWU9VIE1VU1QgQVNTSUdORUQgVEhFIFJFVFVSTkVEIFZBTFVFIFRPIFlPVVIgVUdFTixcbiAgICAvLyBZT1UgQ0FOTk9UIFVTRSBUSElTIEZVTkNUSU9OIFRPIE1PRElGWSBBIFVHRU4gSU4gUExBQ0UuXG4gICAgLy8gWFhYIFhYWCBYWFggWFhYIFhYWCBYWFhcblxuICAgIHJldHVybiBwcm94eVxuICB9XG5cbiAgcmV0dXJuIG9ialxufVxuIiwiLyogYmlnLmpzIHYzLjEuMyBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWcuanMvTElDRU5DRSAqL1xyXG47KGZ1bmN0aW9uIChnbG9iYWwpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbi8qXHJcbiAgYmlnLmpzIHYzLjEuM1xyXG4gIEEgc21hbGwsIGZhc3QsIGVhc3ktdG8tdXNlIGxpYnJhcnkgZm9yIGFyYml0cmFyeS1wcmVjaXNpb24gZGVjaW1hbCBhcml0aG1ldGljLlxyXG4gIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZy5qcy9cclxuICBDb3B5cmlnaHQgKGMpIDIwMTQgTWljaGFlbCBNY2xhdWdobGluIDxNOGNoODhsQGdtYWlsLmNvbT5cclxuICBNSVQgRXhwYXQgTGljZW5jZVxyXG4qL1xyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqIEVESVRBQkxFIERFRkFVTFRTICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZXMgYmVsb3cgbXVzdCBiZSBpbnRlZ2VycyB3aXRoaW4gdGhlIHN0YXRlZCByYW5nZXMuXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBvZiB0aGUgcmVzdWx0cyBvZiBvcGVyYXRpb25zXHJcbiAgICAgKiBpbnZvbHZpbmcgZGl2aXNpb246IGRpdiBhbmQgc3FydCwgYW5kIHBvdyB3aXRoIG5lZ2F0aXZlIGV4cG9uZW50cy5cclxuICAgICAqL1xyXG4gICAgdmFyIERQID0gMjAsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byBNQVhfRFBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgcm91bmRpbmcgbW9kZSB1c2VkIHdoZW4gcm91bmRpbmcgdG8gdGhlIGFib3ZlIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogMCBUb3dhcmRzIHplcm8gKGkuZS4gdHJ1bmNhdGUsIG5vIHJvdW5kaW5nKS4gICAgICAgKFJPVU5EX0RPV04pXHJcbiAgICAgICAgICogMSBUbyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHJvdW5kIHVwLiAgKFJPVU5EX0hBTEZfVVApXHJcbiAgICAgICAgICogMiBUbyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHRvIGV2ZW4uICAgKFJPVU5EX0hBTEZfRVZFTilcclxuICAgICAgICAgKiAzIEF3YXkgZnJvbSB6ZXJvLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoUk9VTkRfVVApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUk0gPSAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwLCAxLCAyIG9yIDNcclxuXHJcbiAgICAgICAgLy8gVGhlIG1heGltdW0gdmFsdWUgb2YgRFAgYW5kIEJpZy5EUC5cclxuICAgICAgICBNQVhfRFAgPSAxRTYsICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gMTAwMDAwMFxyXG5cclxuICAgICAgICAvLyBUaGUgbWF4aW11bSBtYWduaXR1ZGUgb2YgdGhlIGV4cG9uZW50IGFyZ3VtZW50IHRvIHRoZSBwb3cgbWV0aG9kLlxyXG4gICAgICAgIE1BWF9QT1dFUiA9IDFFNiwgICAgICAgICAgICAgICAgICAgLy8gMSB0byAxMDAwMDAwXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBiZW5lYXRoIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKiBKYXZhU2NyaXB0J3MgTnVtYmVyIHR5cGU6IC03XHJcbiAgICAgICAgICogLTEwMDAwMDAgaXMgdGhlIG1pbmltdW0gcmVjb21tZW5kZWQgZXhwb25lbnQgdmFsdWUgb2YgYSBCaWcuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgRV9ORUcgPSAtNywgICAgICAgICAgICAgICAgICAgLy8gMCB0byAtMTAwMDAwMFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYWJvdmUgd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqIEphdmFTY3JpcHQncyBOdW1iZXIgdHlwZTogMjFcclxuICAgICAgICAgKiAxMDAwMDAwIGlzIHRoZSBtYXhpbXVtIHJlY29tbWVuZGVkIGV4cG9uZW50IHZhbHVlIG9mIGEgQmlnLlxyXG4gICAgICAgICAqIChUaGlzIGxpbWl0IGlzIG5vdCBlbmZvcmNlZCBvciBjaGVja2VkLilcclxuICAgICAgICAgKi9cclxuICAgICAgICBFX1BPUyA9IDIxLCAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDEwMDAwMDBcclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgICAgIC8vIFRoZSBzaGFyZWQgcHJvdG90eXBlIG9iamVjdC5cclxuICAgICAgICBQID0ge30sXHJcbiAgICAgICAgaXNWYWxpZCA9IC9eLT8oXFxkKyhcXC5cXGQqKT98XFwuXFxkKykoZVsrLV0/XFxkKyk/JC9pLFxyXG4gICAgICAgIEJpZztcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgQmlnIGNvbnN0cnVjdG9yLlxyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gYmlnRmFjdG9yeSgpIHtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgQmlnIGNvbnN0cnVjdG9yIGFuZCBleHBvcnRlZCBmdW5jdGlvbi5cclxuICAgICAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIG5ldyBpbnN0YW5jZSBvZiBhIEJpZyBudW1iZXIgb2JqZWN0LlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogbiB7bnVtYmVyfHN0cmluZ3xCaWd9IEEgbnVtZXJpYyB2YWx1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBCaWcobikge1xyXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICAvLyBFbmFibGUgY29uc3RydWN0b3IgdXNhZ2Ugd2l0aG91dCBuZXcuXHJcbiAgICAgICAgICAgIGlmICghKHggaW5zdGFuY2VvZiBCaWcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbiA9PT0gdm9pZCAwID8gYmlnRmFjdG9yeSgpIDogbmV3IEJpZyhuKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRHVwbGljYXRlLlxyXG4gICAgICAgICAgICBpZiAobiBpbnN0YW5jZW9mIEJpZykge1xyXG4gICAgICAgICAgICAgICAgeC5zID0gbi5zO1xyXG4gICAgICAgICAgICAgICAgeC5lID0gbi5lO1xyXG4gICAgICAgICAgICAgICAgeC5jID0gbi5jLnNsaWNlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZSh4LCBuKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogUmV0YWluIGEgcmVmZXJlbmNlIHRvIHRoaXMgQmlnIGNvbnN0cnVjdG9yLCBhbmQgc2hhZG93XHJcbiAgICAgICAgICAgICAqIEJpZy5wcm90b3R5cGUuY29uc3RydWN0b3Igd2hpY2ggcG9pbnRzIHRvIE9iamVjdC5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHguY29uc3RydWN0b3IgPSBCaWc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBCaWcucHJvdG90eXBlID0gUDtcclxuICAgICAgICBCaWcuRFAgPSBEUDtcclxuICAgICAgICBCaWcuUk0gPSBSTTtcclxuICAgICAgICBCaWcuRV9ORUcgPSBFX05FRztcclxuICAgICAgICBCaWcuRV9QT1MgPSBFX1BPUztcclxuXHJcbiAgICAgICAgcmV0dXJuIEJpZztcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUHJpdmF0ZSBmdW5jdGlvbnNcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIEJpZyB4IGluIG5vcm1hbCBvciBleHBvbmVudGlhbFxyXG4gICAgICogbm90YXRpb24gdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgb3Igc2lnbmlmaWNhbnQgZGlnaXRzLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gVGhlIEJpZyB0byBmb3JtYXQuXHJcbiAgICAgKiBkcCB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiB0b0Uge251bWJlcn0gMSAodG9FeHBvbmVudGlhbCksIDIgKHRvUHJlY2lzaW9uKSBvciB1bmRlZmluZWQgKHRvRml4ZWQpLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBmb3JtYXQoeCwgZHAsIHRvRSkge1xyXG4gICAgICAgIHZhciBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG5cclxuICAgICAgICAgICAgLy8gVGhlIGluZGV4IChub3JtYWwgbm90YXRpb24pIG9mIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBpID0gZHAgLSAoeCA9IG5ldyBCaWcoeCkpLmUsXHJcbiAgICAgICAgICAgIGMgPSB4LmM7XHJcblxyXG4gICAgICAgIC8vIFJvdW5kP1xyXG4gICAgICAgIGlmIChjLmxlbmd0aCA+ICsrZHApIHtcclxuICAgICAgICAgICAgcm5kKHgsIGksIEJpZy5STSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWNbMF0pIHtcclxuICAgICAgICAgICAgKytpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodG9FKSB7XHJcbiAgICAgICAgICAgIGkgPSBkcDtcclxuXHJcbiAgICAgICAgLy8gdG9GaXhlZFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGMgPSB4LmM7XHJcblxyXG4gICAgICAgICAgICAvLyBSZWNhbGN1bGF0ZSBpIGFzIHguZSBtYXkgaGF2ZSBjaGFuZ2VkIGlmIHZhbHVlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIGkgPSB4LmUgKyBpICsgMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGVuZCB6ZXJvcz9cclxuICAgICAgICBmb3IgKDsgYy5sZW5ndGggPCBpOyBjLnB1c2goMCkpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgaSA9IHguZTtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiB0b1ByZWNpc2lvbiByZXR1cm5zIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoZSBudW1iZXIgb2ZcclxuICAgICAgICAgKiBzaWduaWZpY2FudCBkaWdpdHMgc3BlY2lmaWVkIGlzIGxlc3MgdGhhbiB0aGUgbnVtYmVyIG9mIGRpZ2l0c1xyXG4gICAgICAgICAqIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGUgdmFsdWUgaW4gbm9ybWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcmV0dXJuIHRvRSA9PT0gMSB8fCB0b0UgJiYgKGRwIDw9IGkgfHwgaSA8PSBCaWcuRV9ORUcpID9cclxuXHJcbiAgICAgICAgICAvLyBFeHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICAgICh4LnMgPCAwICYmIGNbMF0gPyAnLScgOiAnJykgK1xyXG4gICAgICAgICAgICAoYy5sZW5ndGggPiAxID8gY1swXSArICcuJyArIGMuam9pbignJykuc2xpY2UoMSkgOiBjWzBdKSArXHJcbiAgICAgICAgICAgICAgKGkgPCAwID8gJ2UnIDogJ2UrJykgKyBpXHJcblxyXG4gICAgICAgICAgLy8gTm9ybWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgOiB4LnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBQYXJzZSB0aGUgbnVtYmVyIG9yIHN0cmluZyB2YWx1ZSBwYXNzZWQgdG8gYSBCaWcgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBBIEJpZyBudW1iZXIgaW5zdGFuY2UuXHJcbiAgICAgKiBuIHtudW1iZXJ8c3RyaW5nfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHBhcnNlKHgsIG4pIHtcclxuICAgICAgICB2YXIgZSwgaSwgbkw7XHJcblxyXG4gICAgICAgIC8vIE1pbnVzIHplcm8/XHJcbiAgICAgICAgaWYgKG4gPT09IDAgJiYgMSAvIG4gPCAwKSB7XHJcbiAgICAgICAgICAgIG4gPSAnLTAnO1xyXG5cclxuICAgICAgICAvLyBFbnN1cmUgbiBpcyBzdHJpbmcgYW5kIGNoZWNrIHZhbGlkaXR5LlxyXG4gICAgICAgIH0gZWxzZSBpZiAoIWlzVmFsaWQudGVzdChuICs9ICcnKSkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHNpZ24uXHJcbiAgICAgICAgeC5zID0gbi5jaGFyQXQoMCkgPT0gJy0nID8gKG4gPSBuLnNsaWNlKDEpLCAtMSkgOiAxO1xyXG5cclxuICAgICAgICAvLyBEZWNpbWFsIHBvaW50P1xyXG4gICAgICAgIGlmICgoZSA9IG4uaW5kZXhPZignLicpKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIG4gPSBuLnJlcGxhY2UoJy4nLCAnJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFeHBvbmVudGlhbCBmb3JtP1xyXG4gICAgICAgIGlmICgoaSA9IG4uc2VhcmNoKC9lL2kpKSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSBleHBvbmVudC5cclxuICAgICAgICAgICAgaWYgKGUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBlID0gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlICs9ICtuLnNsaWNlKGkgKyAxKTtcclxuICAgICAgICAgICAgbiA9IG4uc3Vic3RyaW5nKDAsIGkpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJbnRlZ2VyLlxyXG4gICAgICAgICAgICBlID0gbi5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGkgPSAwOyBuLmNoYXJBdChpKSA9PSAnMCc7IGkrKykge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGkgPT0gKG5MID0gbi5sZW5ndGgpKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICB4LmMgPSBbIHguZSA9IDAgXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKDsgbi5jaGFyQXQoLS1uTCkgPT0gJzAnOykge1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB4LmUgPSBlIC0gaSAtIDE7XHJcbiAgICAgICAgICAgIHguYyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29udmVydCBzdHJpbmcgdG8gYXJyYXkgb2YgZGlnaXRzIHdpdGhvdXQgbGVhZGluZy90cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yIChlID0gMDsgaSA8PSBuTDsgeC5jW2UrK10gPSArbi5jaGFyQXQoaSsrKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJvdW5kIEJpZyB4IHRvIGEgbWF4aW11bSBvZiBkcCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLlxyXG4gICAgICogQ2FsbGVkIGJ5IGRpdiwgc3FydCBhbmQgcm91bmQuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBUaGUgQmlnIHRvIHJvdW5kLlxyXG4gICAgICogZHAge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogcm0ge251bWJlcn0gMCwgMSwgMiBvciAzIChET1dOLCBIQUxGX1VQLCBIQUxGX0VWRU4sIFVQKVxyXG4gICAgICogW21vcmVdIHtib29sZWFufSBXaGV0aGVyIHRoZSByZXN1bHQgb2YgZGl2aXNpb24gd2FzIHRydW5jYXRlZC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcm5kKHgsIGRwLCBybSwgbW9yZSkge1xyXG4gICAgICAgIHZhciB1LFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgaSA9IHguZSArIGRwICsgMTtcclxuXHJcbiAgICAgICAgaWYgKHJtID09PSAxKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB4Y1tpXSBpcyB0aGUgZGlnaXQgYWZ0ZXIgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIG1vcmUgPSB4Y1tpXSA+PSA1O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm0gPT09IDIpIHtcclxuICAgICAgICAgICAgbW9yZSA9IHhjW2ldID4gNSB8fCB4Y1tpXSA9PSA1ICYmXHJcbiAgICAgICAgICAgICAgKG1vcmUgfHwgaSA8IDAgfHwgeGNbaSArIDFdICE9PSB1IHx8IHhjW2kgLSAxXSAmIDEpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm0gPT09IDMpIHtcclxuICAgICAgICAgICAgbW9yZSA9IG1vcmUgfHwgeGNbaV0gIT09IHUgfHwgaSA8IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbW9yZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJtICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycignIUJpZy5STSEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGkgPCAxIHx8ICF4Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKG1vcmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAxLCAwLjEsIDAuMDEsIDAuMDAxLCAwLjAwMDEgZXRjLlxyXG4gICAgICAgICAgICAgICAgeC5lID0gLWRwO1xyXG4gICAgICAgICAgICAgICAgeC5jID0gWzFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgICAgICB4LmMgPSBbeC5lID0gMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGFueSBkaWdpdHMgYWZ0ZXIgdGhlIHJlcXVpcmVkIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAgICB4Yy5sZW5ndGggPSBpLS07XHJcblxyXG4gICAgICAgICAgICAvLyBSb3VuZCB1cD9cclxuICAgICAgICAgICAgaWYgKG1vcmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSb3VuZGluZyB1cCBtYXkgbWVhbiB0aGUgcHJldmlvdXMgZGlnaXQgaGFzIHRvIGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgICAgICBmb3IgKDsgKyt4Y1tpXSA+IDk7KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeGNbaV0gPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWktLSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArK3guZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGMudW5zaGlmdCgxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yIChpID0geGMubGVuZ3RoOyAheGNbLS1pXTsgeGMucG9wKCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaHJvdyBhIEJpZ0Vycm9yLlxyXG4gICAgICpcclxuICAgICAqIG1lc3NhZ2Uge3N0cmluZ30gVGhlIGVycm9yIG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHRocm93RXJyKG1lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgICAgIGVyci5uYW1lID0gJ0JpZ0Vycm9yJztcclxuXHJcbiAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBQcm90b3R5cGUvaW5zdGFuY2UgbWV0aG9kc1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBCaWcuXHJcbiAgICAgKi9cclxuICAgIFAuYWJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB4ID0gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcyk7XHJcbiAgICAgICAgeC5zID0gMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuXHJcbiAgICAgKiAxIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogLTEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksIG9yXHJcbiAgICAgKiAwIGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSB2YWx1ZS5cclxuICAgICovXHJcbiAgICBQLmNtcCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHhOZWcsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSAoeSA9IG5ldyB4LmNvbnN0cnVjdG9yKHkpKS5jLFxyXG4gICAgICAgICAgICBpID0geC5zLFxyXG4gICAgICAgICAgICBqID0geS5zLFxyXG4gICAgICAgICAgICBrID0geC5lLFxyXG4gICAgICAgICAgICBsID0geS5lO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gIXhjWzBdID8gIXljWzBdID8gMCA6IC1qIDogaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoaSAhPSBqKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4TmVnID0gaSA8IDA7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmIChrICE9IGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGsgPiBsIF4geE5lZyA/IDEgOiAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSAtMTtcclxuICAgICAgICBqID0gKGsgPSB4Yy5sZW5ndGgpIDwgKGwgPSB5Yy5sZW5ndGgpID8gayA6IGw7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgZm9yICg7ICsraSA8IGo7KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoeGNbaV0gIT0geWNbaV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4Y1tpXSA+IHljW2ldIF4geE5lZyA/IDEgOiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBsZW5ndGhzLlxyXG4gICAgICAgIHJldHVybiBrID09IGwgPyAwIDogayA+IGwgXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGRpdmlkZWQgYnkgdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeSwgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWxcclxuICAgICAqIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqL1xyXG4gICAgUC5kaXYgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgLy8gZGl2aWRlbmRcclxuICAgICAgICAgICAgZHZkID0geC5jLFxyXG4gICAgICAgICAgICAvL2Rpdmlzb3JcclxuICAgICAgICAgICAgZHZzID0gKHkgPSBuZXcgQmlnKHkpKS5jLFxyXG4gICAgICAgICAgICBzID0geC5zID09IHkucyA/IDEgOiAtMSxcclxuICAgICAgICAgICAgZHAgPSBCaWcuRFA7XHJcblxyXG4gICAgICAgIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFCaWcuRFAhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFaXRoZXIgMD9cclxuICAgICAgICBpZiAoIWR2ZFswXSB8fCAhZHZzWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBib3RoIGFyZSAwLCB0aHJvdyBOYU5cclxuICAgICAgICAgICAgaWYgKGR2ZFswXSA9PSBkdnNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGR2cyBpcyAwLCB0aHJvdyArLUluZmluaXR5LlxyXG4gICAgICAgICAgICBpZiAoIWR2c1swXSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIocyAvIDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBkdmQgaXMgMCwgcmV0dXJuICstMC5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcocyAqIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGR2c0wsIGR2c1QsIG5leHQsIGNtcCwgcmVtSSwgdSxcclxuICAgICAgICAgICAgZHZzWiA9IGR2cy5zbGljZSgpLFxyXG4gICAgICAgICAgICBkdmRJID0gZHZzTCA9IGR2cy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGR2ZEwgPSBkdmQubGVuZ3RoLFxyXG4gICAgICAgICAgICAvLyByZW1haW5kZXJcclxuICAgICAgICAgICAgcmVtID0gZHZkLnNsaWNlKDAsIGR2c0wpLFxyXG4gICAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aCxcclxuICAgICAgICAgICAgLy8gcXVvdGllbnRcclxuICAgICAgICAgICAgcSA9IHksXHJcbiAgICAgICAgICAgIHFjID0gcS5jID0gW10sXHJcbiAgICAgICAgICAgIHFpID0gMCxcclxuICAgICAgICAgICAgZGlnaXRzID0gZHAgKyAocS5lID0geC5lIC0geS5lKSArIDE7XHJcblxyXG4gICAgICAgIHEucyA9IHM7XHJcbiAgICAgICAgcyA9IGRpZ2l0cyA8IDAgPyAwIDogZGlnaXRzO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdmVyc2lvbiBvZiBkaXZpc29yIHdpdGggbGVhZGluZyB6ZXJvLlxyXG4gICAgICAgIGR2c1oudW5zaGlmdCgwKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHplcm9zIHRvIG1ha2UgcmVtYWluZGVyIGFzIGxvbmcgYXMgZGl2aXNvci5cclxuICAgICAgICBmb3IgKDsgcmVtTCsrIDwgZHZzTDsgcmVtLnB1c2goMCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRvIHtcclxuXHJcbiAgICAgICAgICAgIC8vICduZXh0JyBpcyBob3cgbWFueSB0aW1lcyB0aGUgZGl2aXNvciBnb2VzIGludG8gY3VycmVudCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGZvciAobmV4dCA9IDA7IG5leHQgPCAxMDsgbmV4dCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29tcGFyZSBkaXZpc29yIGFuZCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoZHZzTCAhPSAocmVtTCA9IHJlbS5sZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY21wID0gZHZzTCA+IHJlbUwgPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHJlbUkgPSAtMSwgY21wID0gMDsgKytyZW1JIDwgZHZzTDspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkdnNbcmVtSV0gIT0gcmVtW3JlbUldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbXAgPSBkdnNbcmVtSV0gPiByZW1bcmVtSV0gPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBkaXZpc29yIDwgcmVtYWluZGVyLCBzdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGNtcCA8IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtYWluZGVyIGNhbid0IGJlIG1vcmUgdGhhbiAxIGRpZ2l0IGxvbmdlciB0aGFuIGRpdmlzb3IuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXF1YWxpc2UgbGVuZ3RocyB1c2luZyBkaXZpc29yIHdpdGggZXh0cmEgbGVhZGluZyB6ZXJvP1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoZHZzVCA9IHJlbUwgPT0gZHZzTCA/IGR2cyA6IGR2c1o7IHJlbUw7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtWy0tcmVtTF0gPCBkdnNUW3JlbUxdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1JID0gcmVtTDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKDsgcmVtSSAmJiAhcmVtWy0tcmVtSV07IHJlbVtyZW1JXSA9IDkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0tcmVtW3JlbUldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtW3JlbUxdICs9IDEwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbVtyZW1MXSAtPSBkdnNUW3JlbUxdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgIXJlbVswXTsgcmVtLnNoaWZ0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgdGhlICduZXh0JyBkaWdpdCB0byB0aGUgcmVzdWx0IGFycmF5LlxyXG4gICAgICAgICAgICBxY1txaSsrXSA9IGNtcCA/IG5leHQgOiArK25leHQ7XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgaWYgKHJlbVswXSAmJiBjbXApIHtcclxuICAgICAgICAgICAgICAgIHJlbVtyZW1MXSA9IGR2ZFtkdmRJXSB8fCAwO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVtID0gWyBkdmRbZHZkSV0gXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IHdoaWxlICgoZHZkSSsrIDwgZHZkTCB8fCByZW1bMF0gIT09IHUpICYmIHMtLSk7XHJcblxyXG4gICAgICAgIC8vIExlYWRpbmcgemVybz8gRG8gbm90IHJlbW92ZSBpZiByZXN1bHQgaXMgc2ltcGx5IHplcm8gKHFpID09IDEpLlxyXG4gICAgICAgIGlmICghcWNbMF0gJiYgcWkgIT0gMSkge1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlcmUgY2FuJ3QgYmUgbW9yZSB0aGFuIG9uZSB6ZXJvLlxyXG4gICAgICAgICAgICBxYy5zaGlmdCgpO1xyXG4gICAgICAgICAgICBxLmUtLTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJvdW5kP1xyXG4gICAgICAgIGlmIChxaSA+IGRpZ2l0cykge1xyXG4gICAgICAgICAgICBybmQocSwgZHAsIEJpZy5STSwgcmVtWzBdICE9PSB1KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBxO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBlcXVhbCB0byB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5lcSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmNtcCh5KTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmd0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZ3RlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAtMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmx0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPCAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAubHRlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBtaW51cyB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLnN1YiA9IFAubWludXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciBpLCBqLCB0LCB4TFR5LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgIHJldHVybiB4LnBsdXMoeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgeGMgPSB4LmMuc2xpY2UoKSxcclxuICAgICAgICAgICAgeGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHljID0geS5jLFxyXG4gICAgICAgICAgICB5ZSA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHkgaXMgbm9uLXplcm8/IHggaXMgbm9uLXplcm8/IE9yIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgIHJldHVybiB5Y1swXSA/ICh5LnMgPSAtYiwgeSkgOiBuZXcgQmlnKHhjWzBdID8geCA6IDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIGlzIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhMVHkgPSBhIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIGZvciAoYiA9IGE7IGItLTsgdC5wdXNoKDApKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEV4cG9uZW50cyBlcXVhbC4gQ2hlY2sgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgICAgIGogPSAoKHhMVHkgPSB4Yy5sZW5ndGggPCB5Yy5sZW5ndGgpID8geGMgOiB5YykubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yIChhID0gYiA9IDA7IGIgPCBqOyBiKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoeGNbYl0gIT0geWNbYl0pIHtcclxuICAgICAgICAgICAgICAgICAgICB4TFR5ID0geGNbYl0gPCB5Y1tiXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8geCA8IHk/IFBvaW50IHhjIHRvIHRoZSBhcnJheSBvZiB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICBpZiAoeExUeSkge1xyXG4gICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIHhjID0geWM7XHJcbiAgICAgICAgICAgIHljID0gdDtcclxuICAgICAgICAgICAgeS5zID0gLXkucztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogQXBwZW5kIHplcm9zIHRvIHhjIGlmIHNob3J0ZXIuIE5vIG5lZWQgdG8gYWRkIHplcm9zIHRvIHljIGlmIHNob3J0ZXJcclxuICAgICAgICAgKiBhcyBzdWJ0cmFjdGlvbiBvbmx5IG5lZWRzIHRvIHN0YXJ0IGF0IHljLmxlbmd0aC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpZiAoKCBiID0gKGogPSB5Yy5sZW5ndGgpIC0gKGkgPSB4Yy5sZW5ndGgpICkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKDsgYi0tOyB4Y1tpKytdID0gMCkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTdWJ0cmFjdCB5YyBmcm9tIHhjLlxyXG4gICAgICAgIGZvciAoYiA9IGk7IGogPiBhOyl7XHJcblxyXG4gICAgICAgICAgICBpZiAoeGNbLS1qXSA8IHljW2pdKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gajsgaSAmJiAheGNbLS1pXTsgeGNbaV0gPSA5KSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAtLXhjW2ldO1xyXG4gICAgICAgICAgICAgICAgeGNbal0gKz0gMTA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeGNbal0gLT0geWNbal07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yICg7IHhjWy0tYl0gPT09IDA7IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgICAgIGZvciAoOyB4Y1swXSA9PT0gMDspIHtcclxuICAgICAgICAgICAgeGMuc2hpZnQoKTtcclxuICAgICAgICAgICAgLS15ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIG4gLSBuID0gKzBcclxuICAgICAgICAgICAgeS5zID0gMTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlc3VsdCBtdXN0IGJlIHplcm8uXHJcbiAgICAgICAgICAgIHhjID0gW3llID0gMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB5LmMgPSB4YztcclxuICAgICAgICB5LmUgPSB5ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgbW9kdWxvIHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAubW9kID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeUdUeCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIGlmICgheS5jWzBdKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB4LnMgPSB5LnMgPSAxO1xyXG4gICAgICAgIHlHVHggPSB5LmNtcCh4KSA9PSAxO1xyXG4gICAgICAgIHgucyA9IGE7XHJcbiAgICAgICAgeS5zID0gYjtcclxuXHJcbiAgICAgICAgaWYgKHlHVHgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhID0gQmlnLkRQO1xyXG4gICAgICAgIGIgPSBCaWcuUk07XHJcbiAgICAgICAgQmlnLkRQID0gQmlnLlJNID0gMDtcclxuICAgICAgICB4ID0geC5kaXYoeSk7XHJcbiAgICAgICAgQmlnLkRQID0gYTtcclxuICAgICAgICBCaWcuUk0gPSBiO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5taW51cyggeC50aW1lcyh5KSApO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHBsdXMgdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5hZGQgPSBQLnBsdXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB0LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgIHJldHVybiB4Lm1pbnVzKHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHhlID0geC5lLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWUgPSB5LmUsXHJcbiAgICAgICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8geSBpcyBub24temVybz8geCBpcyBub24temVybz8gT3IgYm90aCBhcmUgemVyby5cclxuICAgICAgICAgICAgcmV0dXJuIHljWzBdID8geSA6IG5ldyBCaWcoeGNbMF0gPyB4IDogYSAqIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4YyA9IHhjLnNsaWNlKCk7XHJcblxyXG4gICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgIC8vIE5vdGU6IEZhc3RlciB0byB1c2UgcmV2ZXJzZSB0aGVuIGRvIHVuc2hpZnRzLlxyXG4gICAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGEgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB5ZSA9IHhlO1xyXG4gICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgZm9yICg7IGEtLTsgdC5wdXNoKDApKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBQb2ludCB4YyB0byB0aGUgbG9uZ2VyIGFycmF5LlxyXG4gICAgICAgIGlmICh4Yy5sZW5ndGggLSB5Yy5sZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgeWMgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBhID0geWMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIE9ubHkgc3RhcnQgYWRkaW5nIGF0IHljLmxlbmd0aCAtIDEgYXMgdGhlIGZ1cnRoZXIgZGlnaXRzIG9mIHhjIGNhbiBiZVxyXG4gICAgICAgICAqIGxlZnQgYXMgdGhleSBhcmUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9yIChiID0gMDsgYTspIHtcclxuICAgICAgICAgICAgYiA9ICh4Y1stLWFdID0geGNbYV0gKyB5Y1thXSArIGIpIC8gMTAgfCAwO1xyXG4gICAgICAgICAgICB4Y1thXSAlPSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5vIG5lZWQgdG8gY2hlY2sgZm9yIHplcm8sIGFzICt4ICsgK3kgIT0gMCAmJiAteCArIC15ICE9IDBcclxuXHJcbiAgICAgICAgaWYgKGIpIHtcclxuICAgICAgICAgICAgeGMudW5zaGlmdChiKTtcclxuICAgICAgICAgICAgKyt5ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChhID0geGMubGVuZ3RoOyB4Y1stLWFdID09PSAwOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeS5jID0geGM7XHJcbiAgICAgICAgeS5lID0geWU7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcmFpc2VkIHRvIHRoZSBwb3dlciBuLlxyXG4gICAgICogSWYgbiBpcyBuZWdhdGl2ZSwgcm91bmQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsXHJcbiAgICAgKiBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogbiB7bnVtYmVyfSBJbnRlZ2VyLCAtTUFYX1BPV0VSIHRvIE1BWF9QT1dFUiBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAucG93ID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIG9uZSA9IG5ldyB4LmNvbnN0cnVjdG9yKDEpLFxyXG4gICAgICAgICAgICB5ID0gb25lLFxyXG4gICAgICAgICAgICBpc05lZyA9IG4gPCAwO1xyXG5cclxuICAgICAgICBpZiAobiAhPT0gfn5uIHx8IG4gPCAtTUFYX1BPV0VSIHx8IG4gPiBNQVhfUE9XRVIpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFwb3chJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuID0gaXNOZWcgPyAtbiA6IG47XHJcblxyXG4gICAgICAgIGZvciAoOzspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChuICYgMSkge1xyXG4gICAgICAgICAgICAgICAgeSA9IHkudGltZXMoeCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbiA+Pj0gMTtcclxuXHJcbiAgICAgICAgICAgIGlmICghbikge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeCA9IHgudGltZXMoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaXNOZWcgPyBvbmUuZGl2KHkpIDogeTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIGFcclxuICAgICAqIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS5cclxuICAgICAqIElmIGRwIGlzIG5vdCBzcGVjaWZpZWQsIHJvdW5kIHRvIDAgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgKiBJZiBybSBpcyBub3Qgc3BlY2lmaWVkLCB1c2UgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogW3JtXSAwLCAxLCAyIG9yIDMgKFJPVU5EX0RPV04sIFJPVU5EX0hBTEZfVVAsIFJPVU5EX0hBTEZfRVZFTiwgUk9VTkRfVVApXHJcbiAgICAgKi9cclxuICAgIFAucm91bmQgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBkcCA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFyb3VuZCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcm5kKHggPSBuZXcgQmlnKHgpLCBkcCwgcm0gPT0gbnVsbCA/IEJpZy5STSA6IHJtKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhlIHZhbHVlIG9mIHRoaXMgQmlnLFxyXG4gICAgICogcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWwgcGxhY2VzIHVzaW5nXHJcbiAgICAgKiByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqL1xyXG4gICAgUC5zcXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlc3RpbWF0ZSwgciwgYXBwcm94LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIGkgPSB4LnMsXHJcbiAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgIGhhbGYgPSBuZXcgQmlnKCcwLjUnKTtcclxuXHJcbiAgICAgICAgLy8gWmVybz9cclxuICAgICAgICBpZiAoIXhjWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgbmVnYXRpdmUsIHRocm93IE5hTi5cclxuICAgICAgICBpZiAoaSA8IDApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEVzdGltYXRlLlxyXG4gICAgICAgIGkgPSBNYXRoLnNxcnQoeC50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgLy8gTWF0aC5zcXJ0IHVuZGVyZmxvdy9vdmVyZmxvdz9cclxuICAgICAgICAvLyBQYXNzIHggdG8gTWF0aC5zcXJ0IGFzIGludGVnZXIsIHRoZW4gYWRqdXN0IHRoZSByZXN1bHQgZXhwb25lbnQuXHJcbiAgICAgICAgaWYgKGkgPT09IDAgfHwgaSA9PT0gMSAvIDApIHtcclxuICAgICAgICAgICAgZXN0aW1hdGUgPSB4Yy5qb2luKCcnKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghKGVzdGltYXRlLmxlbmd0aCArIGUgJiAxKSkge1xyXG4gICAgICAgICAgICAgICAgZXN0aW1hdGUgKz0gJzAnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByID0gbmV3IEJpZyggTWF0aC5zcXJ0KGVzdGltYXRlKS50b1N0cmluZygpICk7XHJcbiAgICAgICAgICAgIHIuZSA9ICgoZSArIDEpIC8gMiB8IDApIC0gKGUgPCAwIHx8IGUgJiAxKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByID0gbmV3IEJpZyhpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSA9IHIuZSArIChCaWcuRFAgKz0gNCk7XHJcblxyXG4gICAgICAgIC8vIE5ld3Rvbi1SYXBoc29uIGl0ZXJhdGlvbi5cclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGFwcHJveCA9IHI7XHJcbiAgICAgICAgICAgIHIgPSBoYWxmLnRpbWVzKCBhcHByb3gucGx1cyggeC5kaXYoYXBwcm94KSApICk7XHJcbiAgICAgICAgfSB3aGlsZSAoIGFwcHJveC5jLnNsaWNlKDAsIGkpLmpvaW4oJycpICE9PVxyXG4gICAgICAgICAgICAgICAgICAgICAgIHIuYy5zbGljZSgwLCBpKS5qb2luKCcnKSApO1xyXG5cclxuICAgICAgICBybmQociwgQmlnLkRQIC09IDQsIEJpZy5STSk7XHJcblxyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHRpbWVzIHRoZSB2YWx1ZSBvZlxyXG4gICAgICogQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAubXVsID0gUC50aW1lcyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIGMsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSAoeSA9IG5ldyBCaWcoeSkpLmMsXHJcbiAgICAgICAgICAgIGEgPSB4Yy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGIgPSB5Yy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGkgPSB4LmUsXHJcbiAgICAgICAgICAgIGogPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBzaWduIG9mIHJlc3VsdC5cclxuICAgICAgICB5LnMgPSB4LnMgPT0geS5zID8gMSA6IC0xO1xyXG5cclxuICAgICAgICAvLyBSZXR1cm4gc2lnbmVkIDAgaWYgZWl0aGVyIDAuXHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeS5zICogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXNlIGV4cG9uZW50IG9mIHJlc3VsdCBhcyB4LmUgKyB5LmUuXHJcbiAgICAgICAgeS5lID0gaSArIGo7XHJcblxyXG4gICAgICAgIC8vIElmIGFycmF5IHhjIGhhcyBmZXdlciBkaWdpdHMgdGhhbiB5Yywgc3dhcCB4YyBhbmQgeWMsIGFuZCBsZW5ndGhzLlxyXG4gICAgICAgIGlmIChhIDwgYikge1xyXG4gICAgICAgICAgICBjID0geGM7XHJcbiAgICAgICAgICAgIHhjID0geWM7XHJcbiAgICAgICAgICAgIHljID0gYztcclxuICAgICAgICAgICAgaiA9IGE7XHJcbiAgICAgICAgICAgIGEgPSBiO1xyXG4gICAgICAgICAgICBiID0gajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpc2UgY29lZmZpY2llbnQgYXJyYXkgb2YgcmVzdWx0IHdpdGggemVyb3MuXHJcbiAgICAgICAgZm9yIChjID0gbmV3IEFycmF5KGogPSBhICsgYik7IGotLTsgY1tqXSA9IDApIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE11bHRpcGx5LlxyXG5cclxuICAgICAgICAvLyBpIGlzIGluaXRpYWxseSB4Yy5sZW5ndGguXHJcbiAgICAgICAgZm9yIChpID0gYjsgaS0tOykge1xyXG4gICAgICAgICAgICBiID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIGEgaXMgeWMubGVuZ3RoLlxyXG4gICAgICAgICAgICBmb3IgKGogPSBhICsgaTsgaiA+IGk7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3VycmVudCBzdW0gb2YgcHJvZHVjdHMgYXQgdGhpcyBkaWdpdCBwb3NpdGlvbiwgcGx1cyBjYXJyeS5cclxuICAgICAgICAgICAgICAgIGIgPSBjW2pdICsgeWNbaV0gKiB4Y1tqIC0gaSAtIDFdICsgYjtcclxuICAgICAgICAgICAgICAgIGNbai0tXSA9IGIgJSAxMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjYXJyeVxyXG4gICAgICAgICAgICAgICAgYiA9IGIgLyAxMCB8IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY1tqXSA9IChjW2pdICsgYikgJSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluY3JlbWVudCByZXN1bHQgZXhwb25lbnQgaWYgdGhlcmUgaXMgYSBmaW5hbCBjYXJyeS5cclxuICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICArK3kuZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBhbnkgbGVhZGluZyB6ZXJvLlxyXG4gICAgICAgIGlmICghY1swXSkge1xyXG4gICAgICAgICAgICBjLnNoaWZ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChpID0gYy5sZW5ndGg7ICFjWy0taV07IGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgeS5jID0gYztcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcuXHJcbiAgICAgKiBSZXR1cm4gZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhpcyBCaWcgaGFzIGEgcG9zaXRpdmUgZXhwb25lbnQgZXF1YWwgdG9cclxuICAgICAqIG9yIGdyZWF0ZXIgdGhhbiBCaWcuRV9QT1MsIG9yIGEgbmVnYXRpdmUgZXhwb25lbnQgZXF1YWwgdG8gb3IgbGVzcyB0aGFuXHJcbiAgICAgKiBCaWcuRV9ORUcuXHJcbiAgICAgKi9cclxuICAgIFAudG9TdHJpbmcgPSBQLnZhbHVlT2YgPSBQLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHN0ciA9IHguYy5qb2luKCcnKSxcclxuICAgICAgICAgICAgc3RyTCA9IHN0ci5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uP1xyXG4gICAgICAgIGlmIChlIDw9IEJpZy5FX05FRyB8fCBlID49IEJpZy5FX1BPUykge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgKHN0ckwgPiAxID8gJy4nICsgc3RyLnNsaWNlKDEpIDogJycpICtcclxuICAgICAgICAgICAgICAoZSA8IDAgPyAnZScgOiAnZSsnKSArIGU7XHJcblxyXG4gICAgICAgIC8vIE5lZ2F0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBlbmQgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoOyArK2U7IHN0ciA9ICcwJyArIHN0cikge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0ciA9ICcwLicgKyBzdHI7XHJcblxyXG4gICAgICAgIC8vIFBvc2l0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGlmICgrK2UgPiBzdHJMKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQXBwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgZm9yIChlIC09IHN0ckw7IGUtLSA7IHN0ciArPSAnMCcpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlIDwgc3RyTCkge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnNsaWNlKDAsIGUpICsgJy4nICsgc3RyLnNsaWNlKGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50IHplcm8uXHJcbiAgICAgICAgfSBlbHNlIGlmIChzdHJMID4gMSkge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgJy4nICsgc3RyLnNsaWNlKDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXZvaWQgJy0wJ1xyXG4gICAgICAgIHJldHVybiB4LnMgPCAwICYmIHguY1swXSA/ICctJyArIHN0ciA6IHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKiBJZiB0b0V4cG9uZW50aWFsLCB0b0ZpeGVkLCB0b1ByZWNpc2lvbiBhbmQgZm9ybWF0IGFyZSBub3QgcmVxdWlyZWQgdGhleVxyXG4gICAgICogY2FuIHNhZmVseSBiZSBjb21tZW50ZWQtb3V0IG9yIGRlbGV0ZWQuIE5vIHJlZHVuZGFudCBjb2RlIHdpbGwgYmUgbGVmdC5cclxuICAgICAqIGZvcm1hdCBpcyB1c2VkIG9ubHkgYnkgdG9FeHBvbmVudGlhbCwgdG9GaXhlZCBhbmQgdG9QcmVjaXNpb24uXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGluIGV4cG9uZW50aWFsXHJcbiAgICAgKiBub3RhdGlvbiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB1c2luZ1xyXG4gICAgICogQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvRXhwb25lbnRpYWwgPSBmdW5jdGlvbiAoZHApIHtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgZHAgPSB0aGlzLmMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvRXhwIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBkcCwgMSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaW4gbm9ybWFsIG5vdGF0aW9uXHJcbiAgICAgKiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB1c2luZyBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9GaXhlZCA9IGZ1bmN0aW9uIChkcCkge1xyXG4gICAgICAgIHZhciBzdHIsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBuZWcgPSBCaWcuRV9ORUcsXHJcbiAgICAgICAgICAgIHBvcyA9IEJpZy5FX1BPUztcclxuXHJcbiAgICAgICAgLy8gUHJldmVudCB0aGUgcG9zc2liaWxpdHkgb2YgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgQmlnLkVfTkVHID0gLShCaWcuRV9QT1MgPSAxIC8gMCk7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHgudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwID09PSB+fmRwICYmIGRwID49IDAgJiYgZHAgPD0gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IGZvcm1hdCh4LCB4LmUgKyBkcCk7XHJcblxyXG4gICAgICAgICAgICAvLyAoLTApLnRvRml4ZWQoKSBpcyAnMCcsIGJ1dCAoLTAuMSkudG9GaXhlZCgpIGlzICctMCcuXHJcbiAgICAgICAgICAgIC8vICgtMCkudG9GaXhlZCgxKSBpcyAnMC4wJywgYnV0ICgtMC4wMSkudG9GaXhlZCgxKSBpcyAnLTAuMCcuXHJcbiAgICAgICAgICAgIGlmICh4LnMgPCAwICYmIHguY1swXSAmJiBzdHIuaW5kZXhPZignLScpIDwgMCkge1xyXG4gICAgICAgIC8vRS5nLiAtMC41IGlmIHJvdW5kZWQgdG8gLTAgd2lsbCBjYXVzZSB0b1N0cmluZyB0byBvbWl0IHRoZSBtaW51cyBzaWduLlxyXG4gICAgICAgICAgICAgICAgc3RyID0gJy0nICsgc3RyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEJpZy5FX05FRyA9IG5lZztcclxuICAgICAgICBCaWcuRV9QT1MgPSBwb3M7XHJcblxyXG4gICAgICAgIGlmICghc3RyKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9GaXghJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJvdW5kZWQgdG8gc2RcclxuICAgICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyBCaWcuUk0uIFVzZSBleHBvbmVudGlhbCBub3RhdGlvbiBpZiBzZCBpcyBsZXNzXHJcbiAgICAgKiB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGVcclxuICAgICAqIHZhbHVlIGluIG5vcm1hbCBub3RhdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBzZCB7bnVtYmVyfSBJbnRlZ2VyLCAxIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9QcmVjaXNpb24gPSBmdW5jdGlvbiAoc2QpIHtcclxuXHJcbiAgICAgICAgaWYgKHNkID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNkICE9PSB+fnNkIHx8IHNkIDwgMSB8fCBzZCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvUHJlIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBzZCAtIDEsIDIpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLy8gRXhwb3J0XHJcblxyXG5cclxuICAgIEJpZyA9IGJpZ0ZhY3RvcnkoKTtcclxuXHJcbiAgICAvL0FNRC5cclxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQmlnO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIC8vIE5vZGUgYW5kIG90aGVyIENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cy5cclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IEJpZztcclxuXHJcbiAgICAvL0Jyb3dzZXIuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGdsb2JhbC5CaWcgPSBCaWc7XHJcbiAgICB9XHJcbn0pKHRoaXMpO1xyXG4iLCIvKlxuQ29weXJpZ2h0IChjKSAyMDE0LCBZYWhvbyEgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuQ29weXJpZ2h0cyBsaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBMaWNlbnNlLlxuU2VlIHRoZSBhY2NvbXBhbnlpbmcgTElDRU5TRSBmaWxlIGZvciB0ZXJtcy5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gR2VuZXJhdGUgYW4gaW50ZXJuYWwgVUlEIHRvIG1ha2UgdGhlIHJlZ2V4cCBwYXR0ZXJuIGhhcmRlciB0byBndWVzcy5cbnZhciBVSUQgICAgICAgICAgICAgICAgID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDAwMCkudG9TdHJpbmcoMTYpO1xudmFyIFBMQUNFX0hPTERFUl9SRUdFWFAgPSBuZXcgUmVnRXhwKCdcIkBfXyhGfFJ8RCktJyArIFVJRCArICctKFxcXFxkKylfX0BcIicsICdnJyk7XG5cbnZhciBJU19OQVRJVkVfQ09ERV9SRUdFWFAgPSAvXFx7XFxzKlxcW25hdGl2ZSBjb2RlXFxdXFxzKlxcfS9nO1xudmFyIFVOU0FGRV9DSEFSU19SRUdFWFAgICA9IC9bPD5cXC9cXHUyMDI4XFx1MjAyOV0vZztcblxuLy8gTWFwcGluZyBvZiB1bnNhZmUgSFRNTCBhbmQgaW52YWxpZCBKYXZhU2NyaXB0IGxpbmUgdGVybWluYXRvciBjaGFycyB0byB0aGVpclxuLy8gVW5pY29kZSBjaGFyIGNvdW50ZXJwYXJ0cyB3aGljaCBhcmUgc2FmZSB0byB1c2UgaW4gSmF2YVNjcmlwdCBzdHJpbmdzLlxudmFyIEVTQ0FQRURfQ0hBUlMgPSB7XG4gICAgJzwnICAgICA6ICdcXFxcdTAwM0MnLFxuICAgICc+JyAgICAgOiAnXFxcXHUwMDNFJyxcbiAgICAnLycgICAgIDogJ1xcXFx1MDAyRicsXG4gICAgJ1xcdTIwMjgnOiAnXFxcXHUyMDI4JyxcbiAgICAnXFx1MjAyOSc6ICdcXFxcdTIwMjknXG59O1xuXG5mdW5jdGlvbiBlc2NhcGVVbnNhZmVDaGFycyh1bnNhZmVDaGFyKSB7XG4gICAgcmV0dXJuIEVTQ0FQRURfQ0hBUlNbdW5zYWZlQ2hhcl07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2VyaWFsaXplKG9iaiwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG5cbiAgICAvLyBCYWNrd2FyZHMtY29tcGF0aWJpbGl0eSBmb3IgYHNwYWNlYCBhcyB0aGUgc2Vjb25kIGFyZ3VtZW50LlxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ251bWJlcicgfHwgdHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7c3BhY2U6IG9wdGlvbnN9O1xuICAgIH1cblxuICAgIHZhciBmdW5jdGlvbnMgPSBbXTtcbiAgICB2YXIgcmVnZXhwcyAgID0gW107XG4gICAgdmFyIGRhdGVzICAgICA9IFtdO1xuXG4gICAgLy8gUmV0dXJucyBwbGFjZWhvbGRlcnMgZm9yIGZ1bmN0aW9ucyBhbmQgcmVnZXhwcyAoaWRlbnRpZmllZCBieSBpbmRleClcbiAgICAvLyB3aGljaCBhcmUgbGF0ZXIgcmVwbGFjZWQgYnkgdGhlaXIgc3RyaW5nIHJlcHJlc2VudGF0aW9uLlxuICAgIGZ1bmN0aW9uIHJlcGxhY2VyKGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIHZhbHVlIGlzIGFuIG9iamVjdCB3LyBhIHRvSlNPTiBtZXRob2QsIHRvSlNPTiBpcyBjYWxsZWQgYmVmb3JlXG4gICAgICAgIC8vIHRoZSByZXBsYWNlciBydW5zLCBzbyB3ZSB1c2UgdGhpc1trZXldIHRvIGdldCB0aGUgbm9uLXRvSlNPTmVkIHZhbHVlLlxuICAgICAgICB2YXIgb3JpZ1ZhbHVlID0gdGhpc1trZXldO1xuICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBvcmlnVmFsdWU7XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBpZihvcmlnVmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0BfX1ItJyArIFVJRCArICctJyArIChyZWdleHBzLnB1c2gob3JpZ1ZhbHVlKSAtIDEpICsgJ19fQCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKG9yaWdWYWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ0BfX0QtJyArIFVJRCArICctJyArIChkYXRlcy5wdXNoKG9yaWdWYWx1ZSkgLSAxKSArICdfX0AnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiAnQF9fRi0nICsgVUlEICsgJy0nICsgKGZ1bmN0aW9ucy5wdXNoKG9yaWdWYWx1ZSkgLSAxKSArICdfX0AnO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIHZhciBzdHI7XG5cbiAgICAvLyBDcmVhdGVzIGEgSlNPTiBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZhbHVlLlxuICAgIC8vIE5PVEU6IE5vZGUgMC4xMiBnb2VzIGludG8gc2xvdyBtb2RlIHdpdGggZXh0cmEgSlNPTi5zdHJpbmdpZnkoKSBhcmdzLlxuICAgIGlmIChvcHRpb25zLmlzSlNPTiAmJiAhb3B0aW9ucy5zcGFjZSkge1xuICAgICAgICBzdHIgPSBKU09OLnN0cmluZ2lmeShvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IEpTT04uc3RyaW5naWZ5KG9iaiwgb3B0aW9ucy5pc0pTT04gPyBudWxsIDogcmVwbGFjZXIsIG9wdGlvbnMuc3BhY2UpO1xuICAgIH1cblxuICAgIC8vIFByb3RlY3RzIGFnYWluc3QgYEpTT04uc3RyaW5naWZ5KClgIHJldHVybmluZyBgdW5kZWZpbmVkYCwgYnkgc2VyaWFsaXppbmdcbiAgICAvLyB0byB0aGUgbGl0ZXJhbCBzdHJpbmc6IFwidW5kZWZpbmVkXCIuXG4gICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcoc3RyKTtcbiAgICB9XG5cbiAgICAvLyBSZXBsYWNlIHVuc2FmZSBIVE1MIGFuZCBpbnZhbGlkIEphdmFTY3JpcHQgbGluZSB0ZXJtaW5hdG9yIGNoYXJzIHdpdGhcbiAgICAvLyB0aGVpciBzYWZlIFVuaWNvZGUgY2hhciBjb3VudGVycGFydC4gVGhpcyBfbXVzdF8gaGFwcGVuIGJlZm9yZSB0aGVcbiAgICAvLyByZWdleHBzIGFuZCBmdW5jdGlvbnMgYXJlIHNlcmlhbGl6ZWQgYW5kIGFkZGVkIGJhY2sgdG8gdGhlIHN0cmluZy5cbiAgICBpZiAob3B0aW9ucy51bnNhZmUgIT09IHRydWUpIHtcbiAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoVU5TQUZFX0NIQVJTX1JFR0VYUCwgZXNjYXBlVW5zYWZlQ2hhcnMpO1xuICAgIH1cblxuICAgIGlmIChmdW5jdGlvbnMubGVuZ3RoID09PSAwICYmIHJlZ2V4cHMubGVuZ3RoID09PSAwICYmIGRhdGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cblxuICAgIC8vIFJlcGxhY2VzIGFsbCBvY2N1cnJlbmNlcyBvZiBmdW5jdGlvbiwgcmVnZXhwIGFuZCBkYXRlIHBsYWNlaG9sZGVycyBpbiB0aGVcbiAgICAvLyBKU09OIHN0cmluZyB3aXRoIHRoZWlyIHN0cmluZyByZXByZXNlbnRhdGlvbnMuIElmIHRoZSBvcmlnaW5hbCB2YWx1ZSBjYW5cbiAgICAvLyBub3QgYmUgZm91bmQsIHRoZW4gYHVuZGVmaW5lZGAgaXMgdXNlZC5cbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoUExBQ0VfSE9MREVSX1JFR0VYUCwgZnVuY3Rpb24gKG1hdGNoLCB0eXBlLCB2YWx1ZUluZGV4KSB7XG4gICAgICAgIGlmICh0eXBlID09PSAnRCcpIHtcbiAgICAgICAgICAgIHJldHVybiBcIm5ldyBEYXRlKFxcXCJcIiArIGRhdGVzW3ZhbHVlSW5kZXhdLnRvSVNPU3RyaW5nKCkgKyBcIlxcXCIpXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZSA9PT0gJ1InKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVnZXhwc1t2YWx1ZUluZGV4XS50b1N0cmluZygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZuICAgICAgICAgICA9IGZ1bmN0aW9uc1t2YWx1ZUluZGV4XTtcbiAgICAgICAgdmFyIHNlcmlhbGl6ZWRGbiA9IGZuLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgaWYgKElTX05BVElWRV9DT0RFX1JFR0VYUC50ZXN0KHNlcmlhbGl6ZWRGbikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1NlcmlhbGl6aW5nIG5hdGl2ZSBmdW5jdGlvbjogJyArIGZuLm5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZWRGbjtcbiAgICB9KTtcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgTWVtb3J5SGVscGVyID0ge1xuICBjcmVhdGUoIHNpemVPckJ1ZmZlcj00MDk2LCBtZW10eXBlPUZsb2F0MzJBcnJheSApIHtcbiAgICBsZXQgaGVscGVyID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG5cbiAgICAvLyBjb252ZW5pZW50bHksIGJ1ZmZlciBjb25zdHJ1Y3RvcnMgYWNjZXB0IGVpdGhlciBhIHNpemUgb3IgYW4gYXJyYXkgYnVmZmVyIHRvIHVzZS4uLlxuICAgIC8vIHNvLCBubyBtYXR0ZXIgd2hpY2ggaXMgcGFzc2VkIHRvIHNpemVPckJ1ZmZlciBpdCBzaG91bGQgd29yay5cbiAgICBPYmplY3QuYXNzaWduKCBoZWxwZXIsIHtcbiAgICAgIGhlYXA6IG5ldyBtZW10eXBlKCBzaXplT3JCdWZmZXIgKSxcbiAgICAgIGxpc3Q6IHt9LFxuICAgICAgZnJlZUxpc3Q6IHt9XG4gICAgfSlcblxuICAgIHJldHVybiBoZWxwZXJcbiAgfSxcblxuICBhbGxvYyggc2l6ZSwgaW1tdXRhYmxlICkge1xuICAgIGxldCBpZHggPSAtMVxuXG4gICAgaWYoIHNpemUgPiB0aGlzLmhlYXAubGVuZ3RoICkge1xuICAgICAgdGhyb3cgRXJyb3IoICdBbGxvY2F0aW9uIHJlcXVlc3QgaXMgbGFyZ2VyIHRoYW4gaGVhcCBzaXplIG9mICcgKyB0aGlzLmhlYXAubGVuZ3RoIClcbiAgICB9XG5cbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5mcmVlTGlzdCApIHtcbiAgICAgIGxldCBjYW5kaWRhdGUgPSB0aGlzLmZyZWVMaXN0WyBrZXkgXVxuXG4gICAgICBpZiggY2FuZGlkYXRlLnNpemUgPj0gc2l6ZSApIHtcbiAgICAgICAgaWR4ID0ga2V5XG5cbiAgICAgICAgdGhpcy5saXN0WyBpZHggXSA9IHsgc2l6ZSwgaW1tdXRhYmxlLCByZWZlcmVuY2VzOjEgfVxuXG4gICAgICAgIGlmKCBjYW5kaWRhdGUuc2l6ZSAhPT0gc2l6ZSApIHtcbiAgICAgICAgICBsZXQgbmV3SW5kZXggPSBpZHggKyBzaXplLFxuICAgICAgICAgICAgICBuZXdGcmVlU2l6ZVxuXG4gICAgICAgICAgZm9yKCBsZXQga2V5IGluIHRoaXMubGlzdCApIHtcbiAgICAgICAgICAgIGlmKCBrZXkgPiBuZXdJbmRleCApIHtcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemUgPSBrZXkgLSBuZXdJbmRleFxuICAgICAgICAgICAgICB0aGlzLmZyZWVMaXN0WyBuZXdJbmRleCBdID0gbmV3RnJlZVNpemVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBpZHggIT09IC0xICkgZGVsZXRlIHRoaXMuZnJlZUxpc3RbIGlkeCBdXG5cbiAgICBpZiggaWR4ID09PSAtMSApIHtcbiAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMoIHRoaXMubGlzdCApLFxuICAgICAgICAgIGxhc3RJbmRleFxuXG4gICAgICBpZigga2V5cy5sZW5ndGggKSB7IC8vIGlmIG5vdCBmaXJzdCBhbGxvY2F0aW9uLi4uXG4gICAgICAgIGxhc3RJbmRleCA9IHBhcnNlSW50KCBrZXlzWyBrZXlzLmxlbmd0aCAtIDEgXSApXG5cbiAgICAgICAgaWR4ID0gbGFzdEluZGV4ICsgdGhpcy5saXN0WyBsYXN0SW5kZXggXS5zaXplXG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWR4ID0gMFxuICAgICAgfVxuXG4gICAgICB0aGlzLmxpc3RbIGlkeCBdID0geyBzaXplLCBpbW11dGFibGUsIHJlZmVyZW5jZXM6MSB9XG4gICAgfVxuXG4gICAgaWYoIGlkeCArIHNpemUgPj0gdGhpcy5oZWFwLmxlbmd0aCApIHtcbiAgICAgIHRocm93IEVycm9yKCAnTm8gYXZhaWxhYmxlIGJsb2NrcyByZW1haW4gc3VmZmljaWVudCBmb3IgYWxsb2NhdGlvbiByZXF1ZXN0LicgKVxuICAgIH1cbiAgICByZXR1cm4gaWR4XG4gIH0sXG5cbiAgYWRkUmVmZXJlbmNlKCBpbmRleCApIHtcbiAgICBpZiggdGhpcy5saXN0WyBpbmRleCBdICE9PSB1bmRlZmluZWQgKSB7IFxuICAgICAgdGhpcy5saXN0WyBpbmRleCBdLnJlZmVyZW5jZXMrK1xuICAgIH1cbiAgfSxcblxuICBmcmVlKCBpbmRleCApIHtcbiAgICBpZiggdGhpcy5saXN0WyBpbmRleCBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICB0aHJvdyBFcnJvciggJ0NhbGxpbmcgZnJlZSgpIG9uIG5vbi1leGlzdGluZyBibG9jay4nIClcbiAgICB9XG5cbiAgICBsZXQgc2xvdCA9IHRoaXMubGlzdFsgaW5kZXggXVxuICAgIGlmKCBzbG90ID09PSAwICkgcmV0dXJuXG4gICAgc2xvdC5yZWZlcmVuY2VzLS1cblxuICAgIGlmKCBzbG90LnJlZmVyZW5jZXMgPT09IDAgJiYgc2xvdC5pbW11dGFibGUgIT09IHRydWUgKSB7ICAgIFxuICAgICAgdGhpcy5saXN0WyBpbmRleCBdID0gMFxuXG4gICAgICBsZXQgZnJlZUJsb2NrU2l6ZSA9IDBcbiAgICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmxpc3QgKSB7XG4gICAgICAgIGlmKCBrZXkgPiBpbmRleCApIHtcbiAgICAgICAgICBmcmVlQmxvY2tTaXplID0ga2V5IC0gaW5kZXhcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZnJlZUxpc3RbIGluZGV4IF0gPSBmcmVlQmxvY2tTaXplXG4gICAgfVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUhlbHBlclxuIl19
let processor = null

class GibberishProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {}

  constructor(options) {
    super(options);
    Gibberish = window.Gibberish
    Gibberish.genish.hasWorklet = false
    Gibberish.preventProxy = true
    Gibberish.init( undefined, undefined, 'processor' )
    Gibberish.preventProxy = false
    Gibberish.debug = true
    Gibberish.processor = this
    this.port.onmessage = this.handleMessage.bind( this )
    this.ugens = new Map()
    this.ugens.set( Gibberish.id, Gibberish )
    processor = this
    this.port.postMessage({ 
      address:'get', 
      name:['Gibberish', 'ctx', 'sampleRate']
    })
  }

  replaceProperties( obj ) {
    if( Array.isArray( obj ) ) {
      const out = []
      for( let i = 0; i < obj.length; i++ ){
        const prop = obj[ i ]
        //console.log( 'PROP:', prop )
        if( typeof prop === 'object' && prop.id !== undefined ) {
          let objCheck = this.ugens.get( prop.id )

          if( objCheck !== undefined ) {
            out[ i ] = prop.prop !== undefined ? objCheck[ prop.prop ] : objCheck

            if( prop.prop !== undefined ) console.log( 'got a ssd.out', prop, objCheck )
          }else{
            out[ i ]= prop
          }
        }else{
          if( typeof prop === 'object' && prop.action === 'wrap' ) {
            out[ i  ] = prop.value()
          }else if( Array.isArray( prop ) ) {
            out[ i ] = this.replaceProperties( prop )
          }else{
            out[ i ] = prop
          }
        }
      }

      return out
    }else{
      const properties = obj
      for( let key in properties) {
        let prop = properties[ key ]
        if( typeof prop === 'object' && prop.id !== undefined ) {
          let objCheck = this.ugens.get( prop.id )
          if( objCheck !== undefined ) {
            properties[ key ] = objCheck
          } 
        }else if( Array.isArray( prop ) ) {
          properties[ key ] = this.replaceProperties( prop )
        }else{
          if( typeof prop === 'object' && prop.action === 'wrap' ) {
            properties[ key ] = prop.value()
            console.log( 'returning wrapped value!', properties[ key ] )
          }
        }
      } 
      return properties
    }
    return obj
  }

  handleMessage( event ) {
    if( event.data.address === 'add' ) {

      const rep = event.data
      let constructor = Gibberish

      //console.log( 'add:', rep.name )
      for( let i = 0; i < rep.name.length; i++ ) { constructor = constructor[ rep.name[ i ] ] }

      let properties = this.replaceProperties(  eval( '(' + rep.properties + ')' ) )

      let ugen = properties.binop !== undefined ? constructor( ...properties.inputs ) :  constructor( properties )

      if( rep.post ) {
        ugen[ rep.post ]()
      }

      this.ugens.set( rep.id, ugen )

      initialized = true

    }else if( event.data.address === 'method' ) {
      //console.log( 'method:', event.data.name )
      //console.log( event.data.address, event.data.name, event.data.args, this.ugens )
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      obj[ dict.name ]( ...dict.args.map( Gibberish.proxyReplace ) ) 
    }else if( event.data.address === 'property' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      obj[ dict.name ] = dict.value
    }else if( event.data.address === 'print' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      console.log( 'printing', dict.object, obj )
    }else if( event.data.address === 'set' ) {
      if( event.data.name === 'Gibberish.ctx.sampleRate' ) {
        processor.sampleRate = event.data.value
      }else{
        const dict = event.data
        const obj = this.ugens.get( dict.object )
        obj[ dict.name ] = dict.value
      }
    }  
  }

  process(inputs, outputs, parameters) {
    if( initialized === true ) {
      const gibberish = Gibberish
      const scheduler = gibberish.scheduler
      let   callback  = this.callback
      let   ugens     = gibberish.callbackUgens 

      // XXX is there some way to optimize this out?
      if( callback === undefined && gibberish.graphIsDirty === false ) return true

      let callbacklength = gibberish.blockCallbacks.length

      if( callbacklength !== 0 ) {
        for( let i=0; i< callbacklength; i++ ) {
          gibberish.blockCallbacks[ i ]()
        }

        // can't just set length to 0 as callbacks might be added during for loop,
        // so splice pre-existing functions
        gibberish.blockCallbacks.splice( 0, callbacklength )
      }

      const output = outputs[ 0 ]
      const len = outputs[0][0].length
      for (let i = 0; i < len; ++i) {
        scheduler.tick()

        if( gibberish.graphIsDirty ) {
          const oldCallback = callback
          const oldUgens = ugens

          try{
            this.callback = callback = gibberish.generateCallback()
            ugens = gibberish.callbackUgens
            // XXX should we try/catch the callback here?
            //const out = callback.apply( null, ugens )
            //output[0][ i ] = out[0]
            //output[1][ i ] = out[1] 
          }catch(e) {

            console.log( 'callback error:', e, callback.toString() )
            this.callback = callback = oldCallback
            ugens = gibberish.callbackUgens = oldUgens
            gibberish.callbackNames = ugens.map( v => v.ugenName )
          }
        }
        const out = callback.apply( null, ugens )
        output[0][ i ] = out[0]
        //output[1][ i ] = out[1] 
      }

    }

    // make sure this is always returned or the callback ceases!!!
    return true
  }
}
window.Gibberish.workletProcessor = GibberishProcessor 
           registerProcessor( 'gibberish', window.Gibberish.workletProcessor );

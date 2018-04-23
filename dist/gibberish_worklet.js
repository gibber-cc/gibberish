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
      out.node.port.postMessage({ key:'set', idx:releaseAccum.inputs[0].inputs[1].memory.value.idx, value:0 })
    }else{
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
    this.memory.alloc( 2, true )
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
      body[ lastidx ] = '  memory[' + i + ']  = ' + body[ lastidx ] + '\n'

      this.functionBody += body.join('\n')
    }
    
    this.histories.forEach( value => {
      if( value !== null )
        value.gen()      
    })

    const returnStatement = isStereo ? '  return memory' : '  return memory[0]'
    
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

},{"memory-helper":140}],31:[function(require,module,exports){
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
      if( ! gen.parameters.includes( input.name ) ) gen.parameters.push( input.name )
      return input.name + '[0]'
    }
  }
  input[1] = {
    gen() {
      if( ! gen.parameters.includes( input.name ) ) gen.parameters.push( input.name )
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
      ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {
 
const Delay = inputProps => {
  let ssd = Object.create( analyzer )
  ssd.in  = Object.create( ugen )
  ssd.out = Object.create( ugen )

  ssd.id = Gibberish.factory.getUID()

  let props = Object.assign({}, Delay.defaults, inputProps )
  let isStereo = props.isStereo !== undefined ? props.isStereo : true 
  
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

  ssd.listen = ssd.in.listen
  ssd.in.type = 'analysis'
 
  ssd.out.inputs = []

  return ssd
}

Delay.defaults = {
  input:0,
  isStereo:false
}

return Delay

}

},{"../ugen.js":135,"./analyzer.js":75,"genish.js":37}],79:[function(require,module,exports){
const ugen = require( '../ugen.js' ),
      g = require( 'genish.js' )

module.exports = function( Gibberish ) {

  const AD = function( argumentProps ) {
    const ad = Object.create( ugen ),
          attack  = g.in( 'attack' ),
          decay   = g.in( 'decay' )

    const props = Object.assign( {}, AD.defaults, argumentProps )

    const graph = g.ad( attack, decay, { shape:props.shape, alpha:props.alpha })

    Gibberish.factory( ad, graph, 'ad', props )

    ad.trigger = graph.trigger

    return ad
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

    const graph = g.adsr( 
      attack, decay, sustain, sustainLevel, release, 
      { triggerRelease: props.triggerRelease, shape:props.shape, alpha:props.alpha } 
    )

    Gibberish.factory( adsr, graph, 'adsr', props )

    adsr.trigger = graph.trigger
    adsr.advance = graph.release

    return adsr
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

    Gibberish.factory( ramp, graph, 'ramp', props )

    ramp.trigger = reset.trigger

    return ramp
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
    returnValue = klp
    
    return returnValue// klp//returnValue
 }

  const DiodeZDF = inputProps => {
    const zdf      = Object.create( filter )
    const props    = Object.assign( {}, DiodeZDF.defaults, filter.defaults, inputProps )
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

},{"./allpass.js":84,"./biquad.js":85,"./combfilter.js":86,"./diodeFilterZDF.js":87,"./filter24.js":89,"./ladderFilterZeroDelay.js":91,"./svf.js":92}],91:[function(require,module,exports){
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
    const props    = Object.assign( {}, Zd24.defaults, filter.defaults, inputProps )
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

},{"./effect.js":99,"genish.js":37}],95:[function(require,module,exports){
let g = require( 'genish.js' ),
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
    const rightOutput = g.add( delay1R, delay2L, delay3R )
    chorus.graph = [ g.add( delay1L, delay2R, delay3L ), rightOutput ]
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

      Gibberish.factory(reverb, [left, right], 'dattorro', props);
    }

    return reverb;
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

  if( isStereo ) {
    // right channel
    let feedbackHistoryR = g.history()
    let echoR = g.delay( g.add( rightInput, g.mul( feedbackHistoryR.out, feedback ) ), delayTime, { size:props.delayLength })
    feedbackHistoryR.in( echoR )
    const right = g.mix( rightInput, echoR, wetdry )

    Gibberish.factory( 
      delay,
      [ left, right ], 
      'delay', 
      props 
    )
  }else{
    Gibberish.factory( delay, left, 'delay', props )
  }
  
  return delay
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

    let lout;
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

      Gibberish.factory(distortion, [lout, rout], 'distortion', props);
    } else {
      Gibberish.factory(distortion, lout, 'distortion', props);
    }

    return distortion;
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
          console.log( 'LOADING' )
          Gibberish.load()
          Gibberish.output = this.Bus2()
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
  },

  generateCallback() {
    let uid = 0,
        callbackBody, lastLine, analysis=''

    this.memoed = {}

    callbackBody = this.processGraph( this.output )
    lastLine = callbackBody[ callbackBody.length - 1]
    callbackBody.unshift( "\t'use strict'" )

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
    } else if (ugen === true || ugen === false) {
      throw "Why is ugen a boolean? [true] or [false]";
    } else if( ugen.block === undefined || dirtyIndex !== -1 ) {

  
      let line = `\tvar v_${ugen.id} = ` 
      
      if( !ugen.binop ) line += `${ugen.ugenName}( `

      // must get array so we can keep track of length for comma insertion
      let keys,err
      
      //try {
      keys = ugen.binop || ugen.type === 'bus' || ugen.type === 'analysis' ? Object.keys( ugen.inputs ) : [...ugen.inputNames ] 

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
  
          input = ugen[ key ] 
        }

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

},{"./analysis/analyzers.js":76,"./envelopes/envelopes.js":81,"./filters/filters.js":90,"./fx/effect.js":99,"./fx/effects.js":100,"./instruments/instrument.js":111,"./instruments/instruments.js":112,"./instruments/polyMixin.js":116,"./instruments/polytemplate.js":117,"./misc/binops.js":121,"./misc/bus.js":122,"./misc/bus2.js":123,"./misc/monops.js":124,"./misc/panner.js":125,"./misc/time.js":126,"./oscillators/oscillators.js":129,"./scheduling/scheduler.js":132,"./scheduling/seq2.js":133,"./scheduling/sequencer.js":134,"./ugen.js":135,"./ugenTemplate.js":136,"./utilities.js":137,"genish.js":37,"memory-helper":140}],107:[function(require,module,exports){
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

},{"./instrument.js":111,"genish.js":37}],108:[function(require,module,exports){
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

    const props = Object.assign( {}, Synth.defaults, inputProps )
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

    Gibberish.factory( syn, syn.graph , 'fm', syn )

    return syn
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

    Gibberish.factory( syn, syn.graph, 'mono', props )


    return syn
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
    let voice = this.__getVoice__()
    Object.assign( voice, this.properties )
    if( gain === undefined ) gain = this.gain
    voice.gain = gain
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
      envCheck = _poly.envCheck( voice, _poly )
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

},{}],117:[function(require,module,exports){
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
          stereoProto = Object.create( Gibberish.Bus2() )

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
        inputs:[],
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

},{"genish.js":37}],118:[function(require,module,exports){
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

      return ugen
    },

    Sub( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { binop:true, op:'-', inputs:args, ugenName:'sub' + id, id } )

      return ugen
    },

    Mul( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { binop:true, op:'*', inputs:args, ugenName:'mul' + id, id } )

      return ugen
    },

    Div( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { binop:true, op:'/', inputs:args, ugenName:'div' + id, id } )
    
      return ugen
    },

    Mod( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { binop:true, op:'%', inputs:args, ugenName:'mod' + id, id } )

      return ugen
    },   
  }

  return Binops
}

},{"../ugen.js":135}],122:[function(require,module,exports){
let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

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

  return Bus.create.bind( Bus )

}


},{"../ugen.js":135,"genish.js":37}],123:[function(require,module,exports){
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
      ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {
  const Bus2 = Object.create( ugen )

  let bufferL, bufferR
  
  Object.assign( Bus2, { 
    create( props ) {
      if( bufferL === undefined ) {
        bufferL = Gibberish.genish.gen.globals.panL.memory.values.idx
        bufferR = Gibberish.genish.gen.globals.panR.memory.values.idx
      }

      var output = new Float32Array( 2 )

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
                  isArray = input instanceof Float32Array

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
          dirty : true,
          type : 'bus',
          inputs:[],
          __properties__:props
        },

        Bus2.defaults,

        props
      )

      bus.ugenName = bus.callback.ugenName = 'bus2_' + bus.id

      return bus
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


},{"../ugen.js":135,"genish.js":37}],124:[function(require,module,exports){
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
      
      Gibberish.factory( pow, graph, 'pow', Object.assign({}, Monops.defaults, { input, exponent }) )

      return pow
    },
    Clamp( input, min, max ) {
      const clamp = Object.create( ugen )
      const graph = g.clamp( g.in('input'), g.in('min'), g.in('max') )
      
      Gibberish.factory( clamp, graph, 'clamp', Object.assign({}, Monops.defaults, { input, min, max }) )

      return clamp
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

      Gibberish.factory( sqr, graph, 'sqr', props )

      return sqr
    },

    Triangle( inputProps ) {
      const tri= Object.create( ugen ) 
      const props = Object.assign({ antialias:false }, Oscillators.defaults, inputProps )
      const osc   = Oscillators.factory( 'triangle', g.in( 'frequency' ), props.antialias )
      const graph = g.mul( osc, g.in('gain' ) )

      Gibberish.factory( tri, graph, 'tri', props )

      return tri
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

      return seq
    }
  }

  Seq2.defaults = { rate: 1 }

  return Seq2.create

}


},{"../ugen.js":135,"genish.js":37}],134:[function(require,module,exports){
const Queue = require( '../external/priorityqueue.js' )
const Big   = require( 'big.js' )
const proxy = require( '../workletProxy.js' )

module.exports = function( Gibberish ) {

let Sequencer = props => {
  let seq = {
    __isRunning:false,

    __valuesPhase:  0,
    __timingsPhase: 0,

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


    if( typeof target.__addInput == 'function' ) {
      //console.log( '__addInput', input.isStereo )
      //target.__addInput( input )
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

},{}],136:[function(require,module,exports){
const proxy = require( './workletProxy.js' )

module.exports = function( Gibberish ) {
  let uid = 0

  let factory = function( ugen, graph, __name, values, cb ) {
    ugen.callback = cb === undefined ? Gibberish.genish.gen.createCallback( graph, Gibberish.memory, false, true ) : cb

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
              this.__redoGraph()
            }
          }
        })
      })      
    }

    // will only create proxy if worklets are being used
    // otherwise will return unaltered ugen
    return proxy( __name, values, ugen ) 
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
      resolve()
    })
  }

}

return utilities

}

},{"genish.js":37}],138:[function(require,module,exports){
module.exports = function( __name, values, obj ) {
  
  if( Gibberish.mode === 'worklet' ) {
    const properties = {}
    for( let key in values ) {
      if( typeof values[ key ] === 'object' && values[ key ].__meta__ !== undefined ) {
        properties[ key ] = values[ key ].__meta__
      }else{
        properties[ key ] = values[ key ]
      }
    }

    if( Array.isArray( __name ) ) {
      const oldName = __name[ __name.length - 1 ]
      __name[ __name.length - 1 ] = oldName[0].toUpperCase() + oldName.substring(1)
    }else{
      __name = [ __name[0].toUpperCase() + __name.substring(1) ]
    }

    obj.__meta__ = {
      address:'add',
      name:__name,
      properties, 
      id:obj.id
    }

    Gibberish.worklet.port.postMessage( obj.__meta__ )

    // proxy for all method calls to send to worklet
    const proxy = new Proxy( obj, {
      get( target, prop, receiver ) {
        if( typeof target[ prop ] === 'function' ) {
          const proxy = new Proxy( target[ prop ], {
            apply( __target, thisArg, args ) {
              Gibberish.worklet.port.postMessage({ 
                address:'method', 
                object:obj.id,
                name:prop,
                args
              })

              return target[ prop ].apply( thisArg, args )
            }
          })
          
          return proxy
        }

        return target[ prop ]
      }
    })

    return proxy
  }

  return obj
}

},{}],139:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9nZW5pc2guanMvanMvYWJzLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2FjY3VtLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Fjb3MuanMiLCIuLi9nZW5pc2guanMvanMvYWQuanMiLCIuLi9nZW5pc2guanMvanMvYWRkLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Fkc3IuanMiLCIuLi9nZW5pc2guanMvanMvYW5kLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2FzaW4uanMiLCIuLi9nZW5pc2guanMvanMvYXRhbi5qcyIsIi4uL2dlbmlzaC5qcy9qcy9hdHRhY2suanMiLCIuLi9nZW5pc2guanMvanMvYmFuZy5qcyIsIi4uL2dlbmlzaC5qcy9qcy9ib29sLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2NlaWwuanMiLCIuLi9nZW5pc2guanMvanMvY2xhbXAuanMiLCIuLi9nZW5pc2guanMvanMvY29zLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2NvdW50ZXIuanMiLCIuLi9nZW5pc2guanMvanMvY3ljbGUuanMiLCIuLi9nZW5pc2guanMvanMvZGF0YS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9kY2Jsb2NrLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2RlY2F5LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2RlbGF5LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2RlbHRhLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Rpdi5qcyIsIi4uL2dlbmlzaC5qcy9qcy9lbnYuanMiLCIuLi9nZW5pc2guanMvanMvZXEuanMiLCIuLi9nZW5pc2guanMvanMvZXhwLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Zsb29yLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2ZvbGQuanMiLCIuLi9nZW5pc2guanMvanMvZ2F0ZS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9nZW4uanMiLCIuLi9nZW5pc2guanMvanMvZ3QuanMiLCIuLi9nZW5pc2guanMvanMvZ3RlLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2d0cC5qcyIsIi4uL2dlbmlzaC5qcy9qcy9oaXN0b3J5LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2lmZWxzZWlmLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2luLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2luZGV4LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2x0LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2x0ZS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9sdHAuanMiLCIuLi9nZW5pc2guanMvanMvbWF4LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL21lbW8uanMiLCIuLi9nZW5pc2guanMvanMvbWluLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL21peC5qcyIsIi4uL2dlbmlzaC5qcy9qcy9tb2QuanMiLCIuLi9nZW5pc2guanMvanMvbXN0b3NhbXBzLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL210b2YuanMiLCIuLi9nZW5pc2guanMvanMvbXVsLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL25lcS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9ub2lzZS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9ub3QuanMiLCIuLi9nZW5pc2guanMvanMvcGFuLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3BhcmFtLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3BlZWsuanMiLCIuLi9nZW5pc2guanMvanMvcGhhc29yLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3Bva2UuanMiLCIuLi9nZW5pc2guanMvanMvcG93LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3JhdGUuanMiLCIuLi9nZW5pc2guanMvanMvcm91bmQuanMiLCIuLi9nZW5pc2guanMvanMvc2FoLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3NlbGVjdG9yLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3NlcS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9zaWduLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3Npbi5qcyIsIi4uL2dlbmlzaC5qcy9qcy9zbGlkZS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9zdWIuanMiLCIuLi9nZW5pc2guanMvanMvc3dpdGNoLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3Q2MC5qcyIsIi4uL2dlbmlzaC5qcy9qcy90YW4uanMiLCIuLi9nZW5pc2guanMvanMvdGFuaC5qcyIsIi4uL2dlbmlzaC5qcy9qcy90cmFpbi5qcyIsIi4uL2dlbmlzaC5qcy9qcy91dGlsaXRpZXMuanMiLCIuLi9nZW5pc2guanMvanMvd2luZG93cy5qcyIsIi4uL2dlbmlzaC5qcy9qcy93cmFwLmpzIiwianMvYW5hbHlzaXMvYW5hbHl6ZXIuanMiLCJqcy9hbmFseXNpcy9hbmFseXplcnMuanMiLCJqcy9hbmFseXNpcy9mb2xsb3cuanMiLCJqcy9hbmFseXNpcy9zaW5nbGVzYW1wbGVkZWxheS5qcyIsImpzL2VudmVsb3Blcy9hZC5qcyIsImpzL2VudmVsb3Blcy9hZHNyLmpzIiwianMvZW52ZWxvcGVzL2VudmVsb3Blcy5qcyIsImpzL2VudmVsb3Blcy9yYW1wLmpzIiwianMvZXh0ZXJuYWwvcHJpb3JpdHlxdWV1ZS5qcyIsImpzL2ZpbHRlcnMvYWxscGFzcy5qcyIsImpzL2ZpbHRlcnMvYmlxdWFkLmpzIiwianMvZmlsdGVycy9jb21iZmlsdGVyLmpzIiwianMvZmlsdGVycy9kaW9kZUZpbHRlclpERi5qcyIsImpzL2ZpbHRlcnMvZmlsdGVyLmpzIiwianMvZmlsdGVycy9maWx0ZXIyNC5qcyIsImpzL2ZpbHRlcnMvZmlsdGVycy5qcyIsImpzL2ZpbHRlcnMvbGFkZGVyRmlsdGVyWmVyb0RlbGF5LmpzIiwianMvZmlsdGVycy9zdmYuanMiLCJqcy9meC9iaXRDcnVzaGVyLmpzIiwianMvZngvYnVmZmVyU2h1ZmZsZXIuanMiLCJqcy9meC9jaG9ydXMuanMiLCJqcy9meC9kYXR0b3Jyby5qcyIsImpzL2Z4L2RlbGF5LmpzIiwianMvZngvZGlzdG9ydGlvbi5qcyIsImpzL2Z4L2VmZmVjdC5qcyIsImpzL2Z4L2VmZmVjdHMuanMiLCJqcy9meC9mbGFuZ2VyLmpzIiwianMvZngvZnJlZXZlcmIuanMiLCJqcy9meC9yaW5nTW9kLmpzIiwianMvZngvdHJlbW9sby5qcyIsImpzL2Z4L3ZpYnJhdG8uanMiLCJqcy9pbmRleC5qcyIsImpzL2luc3RydW1lbnRzL2NvbmdhLmpzIiwianMvaW5zdHJ1bWVudHMvY293YmVsbC5qcyIsImpzL2luc3RydW1lbnRzL2ZtLmpzIiwianMvaW5zdHJ1bWVudHMvaGF0LmpzIiwianMvaW5zdHJ1bWVudHMvaW5zdHJ1bWVudC5qcyIsImpzL2luc3RydW1lbnRzL2luc3RydW1lbnRzLmpzIiwianMvaW5zdHJ1bWVudHMva2FycGx1c3N0cm9uZy5qcyIsImpzL2luc3RydW1lbnRzL2tpY2suanMiLCJqcy9pbnN0cnVtZW50cy9tb25vc3ludGguanMiLCJqcy9pbnN0cnVtZW50cy9wb2x5TWl4aW4uanMiLCJqcy9pbnN0cnVtZW50cy9wb2x5dGVtcGxhdGUuanMiLCJqcy9pbnN0cnVtZW50cy9zYW1wbGVyLmpzIiwianMvaW5zdHJ1bWVudHMvc25hcmUuanMiLCJqcy9pbnN0cnVtZW50cy9zeW50aC5qcyIsImpzL21pc2MvYmlub3BzLmpzIiwianMvbWlzYy9idXMuanMiLCJqcy9taXNjL2J1czIuanMiLCJqcy9taXNjL21vbm9wcy5qcyIsImpzL21pc2MvcGFubmVyLmpzIiwianMvbWlzYy90aW1lLmpzIiwianMvb3NjaWxsYXRvcnMvYnJvd25ub2lzZS5qcyIsImpzL29zY2lsbGF0b3JzL2ZtZmVlZGJhY2tvc2MuanMiLCJqcy9vc2NpbGxhdG9ycy9vc2NpbGxhdG9ycy5qcyIsImpzL29zY2lsbGF0b3JzL3Bpbmtub2lzZS5qcyIsImpzL29zY2lsbGF0b3JzL3dhdmV0YWJsZS5qcyIsImpzL3NjaGVkdWxpbmcvc2NoZWR1bGVyLmpzIiwianMvc2NoZWR1bGluZy9zZXEyLmpzIiwianMvc2NoZWR1bGluZy9zZXF1ZW5jZXIuanMiLCJqcy91Z2VuLmpzIiwianMvdWdlblRlbXBsYXRlLmpzIiwianMvdXRpbGl0aWVzLmpzIiwianMvd29ya2xldFByb3h5LmpzIiwibm9kZV9tb2R1bGVzL2JpZy5qcy9iaWcuanMiLCIuLi9tZW1vcnktaGVscGVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonYWJzJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0ID8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGguYWJzJyA6IE1hdGguYWJzIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1hYnMoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYWJzKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYWJzID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGFicy5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBhYnNcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYWNjdW0nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHlcblxuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG5cbiAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdGhpcy5pbml0aWFsVmFsdWVcblxuICAgIGZ1bmN0aW9uQm9keSA9IHRoaXMuY2FsbGJhY2soIGdlbk5hbWUsIGlucHV0c1swXSwgaW5wdXRzWzFdLCBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gIClcblxuICAgIC8vZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuICAgIFxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGNhbGxiYWNrKCBfbmFtZSwgX2luY3IsIF9yZXNldCwgdmFsdWVSZWYgKSB7XG4gICAgbGV0IGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSAnJyxcbiAgICAgICAgd3JhcCA9ICcnXG4gICAgXG4gICAgLyogdGhyZWUgZGlmZmVyZW50IG1ldGhvZHMgb2Ygd3JhcHBpbmcsIHRoaXJkIGlzIG1vc3QgZXhwZW5zaXZlOlxuICAgICAqXG4gICAgICogMTogcmFuZ2UgezAsMX06IHkgPSB4IC0gKHggfCAwKVxuICAgICAqIDI6IGxvZzIodGhpcy5tYXgpID09IGludGVnZXI6IHkgPSB4ICYgKHRoaXMubWF4IC0gMSlcbiAgICAgKiAzOiBhbGwgb3RoZXJzOiBpZiggeCA+PSB0aGlzLm1heCApIHkgPSB0aGlzLm1heCAteFxuICAgICAqXG4gICAgICovXG5cbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzFdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1sxXSA8IDEpICkgeyBcbiAgICAgIGlmKCB0aGlzLnJlc2V0VmFsdWUgIT09IHRoaXMubWluICkge1xuXG4gICAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLnJlc2V0VmFsdWV9XFxuXFxuYFxuICAgICAgICAvL291dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLm1pbn1cXG5cXG5gXG4gICAgICB9ZWxzZXtcbiAgICAgICAgb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMubWlufVxcblxcbmBcbiAgICAgICAgLy9vdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PTEgKSAke3ZhbHVlUmVmfSA9ICR7dGhpcy5pbml0aWFsVmFsdWV9XFxuXFxuYFxuICAgICAgfVxuICAgIH1cblxuICAgIG91dCArPSBgICB2YXIgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHt2YWx1ZVJlZn1cXG5gXG4gICAgXG4gICAgaWYoIHRoaXMuc2hvdWxkV3JhcCA9PT0gZmFsc2UgJiYgdGhpcy5zaG91bGRDbGFtcCA9PT0gdHJ1ZSApIHtcbiAgICAgIG91dCArPSBgICBpZiggJHt2YWx1ZVJlZn0gPCAke3RoaXMubWF4IH0gKSAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmBcbiAgICB9ZWxzZXtcbiAgICAgIG91dCArPSBgICAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmAgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuICAgIH1cblxuICAgIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgICYmIHRoaXMuc2hvdWxkV3JhcE1heCApIHdyYXAgKz0gYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICkgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxcbmBcbiAgICBpZiggdGhpcy5taW4gIT09IC1JbmZpbml0eSAmJiB0aGlzLnNob3VsZFdyYXBNaW4gKSB3cmFwICs9IGAgIGlmKCAke3ZhbHVlUmVmfSA8ICR7dGhpcy5taW59ICkgJHt2YWx1ZVJlZn0gKz0gJHtkaWZmfVxcbmBcblxuICAgIC8vaWYoIHRoaXMubWluID09PSAwICYmIHRoaXMubWF4ID09PSAxICkgeyBcbiAgICAvLyAgd3JhcCA9ICBgICAke3ZhbHVlUmVmfSA9ICR7dmFsdWVSZWZ9IC0gKCR7dmFsdWVSZWZ9IHwgMClcXG5cXG5gXG4gICAgLy99IGVsc2UgaWYoIHRoaXMubWluID09PSAwICYmICggTWF0aC5sb2cyKCB0aGlzLm1heCApIHwgMCApID09PSBNYXRoLmxvZzIoIHRoaXMubWF4ICkgKSB7XG4gICAgLy8gIHdyYXAgPSAgYCAgJHt2YWx1ZVJlZn0gPSAke3ZhbHVlUmVmfSAmICgke3RoaXMubWF4fSAtIDEpXFxuXFxuYFxuICAgIC8vfSBlbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgKXtcbiAgICAvLyAgd3JhcCA9IGAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSApICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cXG5cXG5gXG4gICAgLy99XG5cbiAgICBvdXQgPSBvdXQgKyB3cmFwICsgJ1xcbidcblxuICAgIHJldHVybiBvdXRcbiAgfSxcblxuICBkZWZhdWx0cyA6IHsgbWluOjAsIG1heDoxLCByZXNldFZhbHVlOjAsIGluaXRpYWxWYWx1ZTowLCBzaG91bGRXcmFwOnRydWUsIHNob3VsZFdyYXBNYXg6IHRydWUsIHNob3VsZFdyYXBNaW46dHJ1ZSwgc2hvdWxkQ2xhbXA6ZmFsc2UgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5jciwgcmVzZXQ9MCwgcHJvcGVydGllcyApID0+IHtcbiAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgICAgIFxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBcbiAgICB7IFxuICAgICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgICBpbnB1dHM6IFsgaW5jciwgcmVzZXQgXSxcbiAgICAgIG1lbW9yeToge1xuICAgICAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcHJvdG8uZGVmYXVsdHMsXG4gICAgcHJvcGVydGllcyBcbiAgKVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5zaG91bGRXcmFwTWF4ID09PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5zaG91bGRXcmFwTWluID09PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIHByb3BlcnRpZXMuc2hvdWxkV3JhcCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgdWdlbi5zaG91bGRXcmFwTWluID0gdWdlbi5zaG91bGRXcmFwTWF4ID0gcHJvcGVydGllcy5zaG91bGRXcmFwXG4gICAgfVxuICB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLnJlc2V0VmFsdWUgPT09IHVuZGVmaW5lZCApIHtcbiAgICB1Z2VuLnJlc2V0VmFsdWUgPSB1Z2VuLm1pblxuICB9XG5cbiAgaWYoIHVnZW4uaW5pdGlhbFZhbHVlID09PSB1bmRlZmluZWQgKSB1Z2VuLmluaXRpYWxWYWx1ZSA9IHVnZW4ubWluXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkgIHsgXG4gICAgICAvL2NvbnNvbGUubG9nKCAnZ2VuOicsIGdlbiwgZ2VuLm1lbW9yeSApXG4gICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSBcbiAgICB9LFxuICAgIHNldCh2KSB7IGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IH1cbiAgfSlcblxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Fjb3MnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcblxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQgPyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnYWNvcyc6IGlzV29ya2xldCA/ICdNYXRoLmFjb3MnIDpNYXRoLmFjb3MgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWFjb3MoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFjb3MoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhY29zID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGFjb3MuaW5wdXRzID0gWyB4IF1cbiAgYWNvcy5pZCA9IGdlbi5nZXRVSUQoKVxuICBhY29zLm5hbWUgPSBgJHthY29zLmJhc2VuYW1lfXthY29zLmlkfWBcblxuICByZXR1cm4gYWNvc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBtdWwgICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBzdWIgICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBkaXYgICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgICBkYXRhICAgICA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayAgICAgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIGFjY3VtICAgID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgaWZlbHNlICAgPSByZXF1aXJlKCAnLi9pZmVsc2VpZi5qcycgKSxcbiAgICBsdCAgICAgICA9IHJlcXVpcmUoICcuL2x0LmpzJyApLFxuICAgIGJhbmcgICAgID0gcmVxdWlyZSggJy4vYmFuZy5qcycgKSxcbiAgICBlbnYgICAgICA9IHJlcXVpcmUoICcuL2Vudi5qcycgKSxcbiAgICBhZGQgICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBwb2tlICAgICA9IHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gICAgbmVxICAgICAgPSByZXF1aXJlKCAnLi9uZXEuanMnICksXG4gICAgYW5kICAgICAgPSByZXF1aXJlKCAnLi9hbmQuanMnICksXG4gICAgZ3RlICAgICAgPSByZXF1aXJlKCAnLi9ndGUuanMnICksXG4gICAgbWVtbyAgICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIHV0aWxpdGllcz0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBhdHRhY2tUaW1lID0gNDQxMDAsIGRlY2F5VGltZSA9IDQ0MTAwLCBfcHJvcHMgKSA9PiB7XG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBzaGFwZTonZXhwb25lbnRpYWwnLCBhbHBoYTo1LCB0cmlnZ2VyOm51bGwgfSwgX3Byb3BzIClcbiAgY29uc3QgX2JhbmcgPSBwcm9wcy50cmlnZ2VyICE9PSBudWxsID8gcHJvcHMudHJpZ2dlciA6IGJhbmcoKSxcbiAgICAgICAgcGhhc2UgPSBhY2N1bSggMSwgX2JhbmcsIHsgbWluOjAsIG1heDogSW5maW5pdHksIGluaXRpYWxWYWx1ZTotSW5maW5pdHksIHNob3VsZFdyYXA6ZmFsc2UgfSlcbiAgICAgIFxuICBsZXQgYnVmZmVyRGF0YSwgYnVmZmVyRGF0YVJldmVyc2UsIGRlY2F5RGF0YSwgb3V0LCBidWZmZXJcblxuICAvL2NvbnNvbGUubG9nKCAnc2hhcGU6JywgcHJvcHMuc2hhcGUsICdhdHRhY2sgdGltZTonLCBhdHRhY2tUaW1lLCAnZGVjYXkgdGltZTonLCBkZWNheVRpbWUgKVxuICBsZXQgY29tcGxldGVGbGFnID0gZGF0YSggWzBdIClcbiAgXG4gIC8vIHNsaWdodGx5IG1vcmUgZWZmaWNpZW50IHRvIHVzZSBleGlzdGluZyBwaGFzZSBhY2N1bXVsYXRvciBmb3IgbGluZWFyIGVudmVsb3Blc1xuICBpZiggcHJvcHMuc2hhcGUgPT09ICdsaW5lYXInICkge1xuICAgIG91dCA9IGlmZWxzZSggXG4gICAgICBhbmQoIGd0ZSggcGhhc2UsIDApLCBsdCggcGhhc2UsIGF0dGFja1RpbWUgKSksXG4gICAgICBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICksXG5cbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksICBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lICkgKSApLFxuICAgICAgc3ViKCAxLCBkaXYoIHN1YiggcGhhc2UsIGF0dGFja1RpbWUgKSwgZGVjYXlUaW1lICkgKSxcbiAgICAgIFxuICAgICAgbmVxKCBwaGFzZSwgLUluZmluaXR5KSxcbiAgICAgIHBva2UoIGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6MCB9KSxcblxuICAgICAgMCBcbiAgICApXG4gIH0gZWxzZSB7XG4gICAgYnVmZmVyRGF0YSA9IGVudih7IGxlbmd0aDoxMDI0LCB0eXBlOnByb3BzLnNoYXBlLCBhbHBoYTpwcm9wcy5hbHBoYSB9KVxuICAgIGJ1ZmZlckRhdGFSZXZlcnNlID0gZW52KHsgbGVuZ3RoOjEwMjQsIHR5cGU6cHJvcHMuc2hhcGUsIGFscGhhOnByb3BzLmFscGhhLCByZXZlcnNlOnRydWUgfSlcblxuICAgIG91dCA9IGlmZWxzZSggXG4gICAgICBhbmQoIGd0ZSggcGhhc2UsIDApLCBsdCggcGhhc2UsIGF0dGFja1RpbWUgKSApLCBcbiAgICAgIHBlZWsoIGJ1ZmZlckRhdGEsIGRpdiggcGhhc2UsIGF0dGFja1RpbWUgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9ICksIFxuXG4gICAgICBhbmQoIGd0ZShwaGFzZSwwKSwgbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSApICkgKSwgXG4gICAgICBwZWVrKCBidWZmZXJEYXRhUmV2ZXJzZSwgZGl2KCBzdWIoIHBoYXNlLCBhdHRhY2tUaW1lICksIGRlY2F5VGltZSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pLFxuXG4gICAgICBuZXEoIHBoYXNlLCAtSW5maW5pdHkgKSxcbiAgICAgIHBva2UoIGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6MCB9KSxcblxuICAgICAgMFxuICAgIClcbiAgfVxuXG4gIGNvbnN0IHVzaW5nV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgaWYoIHVzaW5nV29ya2xldCA9PT0gdHJ1ZSApIHtcbiAgICBvdXQubm9kZSA9IG51bGxcbiAgICB1dGlsaXRpZXMucmVnaXN0ZXIoIG91dCApXG4gIH1cblxuICAvLyBuZWVkZWQgZm9yIGdpYmJlcmlzaC4uLiBnZXR0aW5nIHRoaXMgdG8gd29yayByaWdodCB3aXRoIHdvcmtsZXRzXG4gIC8vIHZpYSBwcm9taXNlcyB3aWxsIHByb2JhYmx5IGJlIHRyaWNreVxuICBvdXQuaXNDb21wbGV0ZSA9ICgpPT4ge1xuICAgIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgJiYgb3V0Lm5vZGUgIT09IG51bGwgKSB7XG4gICAgICBjb25zdCBwID0gbmV3IFByb21pc2UoIHJlc29sdmUgPT4ge1xuICAgICAgICBvdXQubm9kZS5nZXRNZW1vcnlWYWx1ZSggY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4LCByZXNvbHZlIClcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBwXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyBjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHggXVxuICAgIH1cbiAgfVxuXG4gIG91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgaWYoIHVzaW5nV29ya2xldCA9PT0gdHJ1ZSAmJiBvdXQubm9kZSAhPT0gbnVsbCApIHtcbiAgICAgIG91dC5ub2RlLnBvcnQucG9zdE1lc3NhZ2UoeyBrZXk6J3NldCcsIGlkeDpjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHgsIHZhbHVlOjAgfSlcbiAgICB9ZWxzZXtcbiAgICAgIGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF0gPSAwXG4gICAgfVxuICAgIF9iYW5nLnRyaWdnZXIoKVxuICB9XG5cbiAgcmV0dXJuIG91dCBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmNvbnN0IHByb3RvID0geyBcbiAgYmFzZW5hbWU6J2FkZCcsXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQ9JycsXG4gICAgICAgIHN1bSA9IDAsIG51bUNvdW50ID0gMCwgYWRkZXJBdEVuZCA9IGZhbHNlLCBhbHJlYWR5RnVsbFN1bW1lZCA9IHRydWVcblxuICAgIGlmKCBpbnB1dHMubGVuZ3RoID09PSAwICkgcmV0dXJuIDBcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGlzTmFOKCB2ICkgKSB7XG4gICAgICAgIG91dCArPSB2XG4gICAgICAgIGlmKCBpIDwgaW5wdXRzLmxlbmd0aCAtMSApIHtcbiAgICAgICAgICBhZGRlckF0RW5kID0gdHJ1ZVxuICAgICAgICAgIG91dCArPSAnICsgJ1xuICAgICAgICB9XG4gICAgICAgIGFscmVhZHlGdWxsU3VtbWVkID0gZmFsc2VcbiAgICAgIH1lbHNle1xuICAgICAgICBzdW0gKz0gcGFyc2VGbG9hdCggdiApXG4gICAgICAgIG51bUNvdW50KytcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYoIG51bUNvdW50ID4gMCApIHtcbiAgICAgIG91dCArPSBhZGRlckF0RW5kIHx8IGFscmVhZHlGdWxsU3VtbWVkID8gc3VtIDogJyArICcgKyBzdW1cbiAgICB9XG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5hcmdzICkgPT4ge1xuICBjb25zdCBhZGQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIGFkZC5pZCA9IGdlbi5nZXRVSUQoKVxuICBhZGQubmFtZSA9IGFkZC5iYXNlbmFtZSArIGFkZC5pZFxuICBhZGQuaW5wdXRzID0gYXJnc1xuXG4gIHJldHVybiBhZGRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbXVsICAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgZGl2ICAgICAgPSByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gICAgZGF0YSAgICAgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgICAgID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBhY2N1bSAgICA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGlmZWxzZSAgID0gcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gICAgbHQgICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBiYW5nICAgICA9IHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gICAgZW52ICAgICAgPSByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gICAgcGFyYW0gICAgPSByZXF1aXJlKCAnLi9wYXJhbS5qcycgKSxcbiAgICBhZGQgICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBndHAgICAgICA9IHJlcXVpcmUoICcuL2d0cC5qcycgKSxcbiAgICBub3QgICAgICA9IHJlcXVpcmUoICcuL25vdC5qcycgKSxcbiAgICBhbmQgICAgICA9IHJlcXVpcmUoICcuL2FuZC5qcycgKSxcbiAgICBuZXEgICAgICA9IHJlcXVpcmUoICcuL25lcS5qcycgKSxcbiAgICBwb2tlICAgICA9IHJlcXVpcmUoICcuL3Bva2UuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGF0dGFja1RpbWU9NDQsIGRlY2F5VGltZT0yMjA1MCwgc3VzdGFpblRpbWU9NDQxMDAsIHN1c3RhaW5MZXZlbD0uNiwgcmVsZWFzZVRpbWU9NDQxMDAsIF9wcm9wcyApID0+IHtcbiAgbGV0IGVudlRyaWdnZXIgPSBiYW5nKCksXG4gICAgICBwaGFzZSA9IGFjY3VtKCAxLCBlbnZUcmlnZ2VyLCB7IG1heDogSW5maW5pdHksIHNob3VsZFdyYXA6ZmFsc2UsIGluaXRpYWxWYWx1ZTpJbmZpbml0eSB9KSxcbiAgICAgIHNob3VsZFN1c3RhaW4gPSBwYXJhbSggMSApLFxuICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICBzaGFwZTogJ2V4cG9uZW50aWFsJyxcbiAgICAgICAgIGFscGhhOiA1LFxuICAgICAgICAgdHJpZ2dlclJlbGVhc2U6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIF9wcm9wcyApLFxuICAgICAgYnVmZmVyRGF0YSwgZGVjYXlEYXRhLCBvdXQsIGJ1ZmZlciwgc3VzdGFpbkNvbmRpdGlvbiwgcmVsZWFzZUFjY3VtLCByZWxlYXNlQ29uZGl0aW9uXG5cblxuICBjb25zdCBjb21wbGV0ZUZsYWcgPSBkYXRhKCBbMF0gKVxuXG4gIGJ1ZmZlckRhdGEgPSBlbnYoeyBsZW5ndGg6MTAyNCwgYWxwaGE6cHJvcHMuYWxwaGEsIHNoaWZ0OjAsIHR5cGU6cHJvcHMuc2hhcGUgfSlcblxuICBzdXN0YWluQ29uZGl0aW9uID0gcHJvcHMudHJpZ2dlclJlbGVhc2UgXG4gICAgPyBzaG91bGRTdXN0YWluXG4gICAgOiBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSApIClcblxuICByZWxlYXNlQWNjdW0gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZVxuICAgID8gZ3RwKCBzdWIoIHN1c3RhaW5MZXZlbCwgYWNjdW0oIGRpdiggc3VzdGFpbkxldmVsLCByZWxlYXNlVGltZSApICwgMCwgeyBzaG91bGRXcmFwOmZhbHNlIH0pICksIDAgKVxuICAgIDogc3ViKCBzdXN0YWluTGV2ZWwsIG11bCggZGl2KCBzdWIoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSwgc3VzdGFpblRpbWUgKSApLCByZWxlYXNlVGltZSApLCBzdXN0YWluTGV2ZWwgKSApLCBcblxuICByZWxlYXNlQ29uZGl0aW9uID0gcHJvcHMudHJpZ2dlclJlbGVhc2VcbiAgICA/IG5vdCggc2hvdWxkU3VzdGFpbiApXG4gICAgOiBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSwgcmVsZWFzZVRpbWUgKSApXG5cbiAgb3V0ID0gaWZlbHNlKFxuICAgIC8vIGF0dGFjayBcbiAgICBsdCggcGhhc2UsICBhdHRhY2tUaW1lICksIFxuICAgIHBlZWsoIGJ1ZmZlckRhdGEsIGRpdiggcGhhc2UsIGF0dGFja1RpbWUgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9ICksIFxuXG4gICAgLy8gZGVjYXlcbiAgICBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lICkgKSwgXG4gICAgcGVlayggYnVmZmVyRGF0YSwgc3ViKCAxLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgIGF0dGFja1RpbWUgKSwgIGRlY2F5VGltZSApLCBzdWIoIDEsICBzdXN0YWluTGV2ZWwgKSApICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSksXG5cbiAgICAvLyBzdXN0YWluXG4gICAgYW5kKCBzdXN0YWluQ29uZGl0aW9uLCBuZXEoIHBoYXNlLCBJbmZpbml0eSApICksXG4gICAgcGVlayggYnVmZmVyRGF0YSwgIHN1c3RhaW5MZXZlbCApLFxuXG4gICAgLy8gcmVsZWFzZVxuICAgIHJlbGVhc2VDb25kaXRpb24sIC8vbHQoIHBoYXNlLCAgYXR0YWNrVGltZSArICBkZWNheVRpbWUgKyAgc3VzdGFpblRpbWUgKyAgcmVsZWFzZVRpbWUgKSxcbiAgICBwZWVrKCBcbiAgICAgIGJ1ZmZlckRhdGEsXG4gICAgICByZWxlYXNlQWNjdW0sIFxuICAgICAgLy9zdWIoICBzdXN0YWluTGV2ZWwsIG11bCggZGl2KCBzdWIoIHBoYXNlLCAgYXR0YWNrVGltZSArICBkZWNheVRpbWUgKyAgc3VzdGFpblRpbWUpLCAgcmVsZWFzZVRpbWUgKSwgIHN1c3RhaW5MZXZlbCApICksIFxuICAgICAgeyBib3VuZG1vZGU6J2NsYW1wJyB9XG4gICAgKSxcblxuICAgIG5lcSggcGhhc2UsIEluZmluaXR5ICksXG4gICAgcG9rZSggY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTowIH0pLFxuXG4gICAgMFxuICApXG4gICBcbiAgY29uc3QgdXNpbmdXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICBpZiggdXNpbmdXb3JrbGV0ID09PSB0cnVlICkge1xuICAgIG91dC5ub2RlID0gbnVsbFxuICAgIHV0aWxpdGllcy5yZWdpc3Rlciggb3V0IClcbiAgfVxuXG4gIG91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc2hvdWxkU3VzdGFpbi52YWx1ZSA9IDFcbiAgICBlbnZUcmlnZ2VyLnRyaWdnZXIoKVxuICB9XG4gXG4gIC8vIG5lZWRlZCBmb3IgZ2liYmVyaXNoLi4uIGdldHRpbmcgdGhpcyB0byB3b3JrIHJpZ2h0IHdpdGggd29ya2xldHNcbiAgLy8gdmlhIHByb21pc2VzIHdpbGwgcHJvYmFibHkgYmUgdHJpY2t5XG4gIG91dC5pc0NvbXBsZXRlID0gKCk9PiB7XG4gICAgaWYoIHVzaW5nV29ya2xldCA9PT0gdHJ1ZSAmJiBvdXQubm9kZSAhPT0gbnVsbCApIHtcbiAgICAgIGNvbnN0IHAgPSBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgIG91dC5ub2RlLmdldE1lbW9yeVZhbHVlKCBjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHgsIHJlc29sdmUgKVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHBcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCBdXG4gICAgfVxuICB9XG5cblxuICBvdXQucmVsZWFzZSA9ICgpPT4ge1xuICAgIHNob3VsZFN1c3RhaW4udmFsdWUgPSAwXG4gICAgLy8gWFhYIHByZXR0eSBuYXN0eS4uLiBncmFicyBhY2N1bSBpbnNpZGUgb2YgZ3RwIGFuZCByZXNldHMgdmFsdWUgbWFudWFsbHlcbiAgICAvLyB1bmZvcnR1bmF0ZWx5IGVudlRyaWdnZXIgd29uJ3Qgd29yayBhcyBpdCdzIGJhY2sgdG8gMCBieSB0aGUgdGltZSB0aGUgcmVsZWFzZSBibG9jayBpcyB0cmlnZ2VyZWQuLi5cbiAgICBpZiggdXNpbmdXb3JrbGV0ICYmIG91dC5ub2RlICE9PSBudWxsICkge1xuICAgICAgb3V0Lm5vZGUucG9ydC5wb3N0TWVzc2FnZSh7IGtleTonc2V0JywgaWR4OnJlbGVhc2VBY2N1bS5pbnB1dHNbMF0uaW5wdXRzWzFdLm1lbW9yeS52YWx1ZS5pZHgsIHZhbHVlOjAgfSlcbiAgICB9ZWxzZXtcbiAgICAgIGdlbi5tZW1vcnkuaGVhcFsgcmVsZWFzZUFjY3VtLmlucHV0c1swXS5pbnB1dHNbMV0ubWVtb3J5LnZhbHVlLmlkeCBdID0gMFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXQgXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhbmQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ICE9PSAwICYmICR7aW5wdXRzWzFdfSAhPT0gMCkgfCAwXFxuXFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1gLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhc2luJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldCA/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhc2luJzogaXNXb3JrbGV0ID8gJ01hdGguc2luJyA6IE1hdGguYXNpbiB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9YXNpbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYXNpbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFzaW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYXNpbi5pbnB1dHMgPSBbIHggXVxuICBhc2luLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFzaW4ubmFtZSA9IGAke2FzaW4uYmFzZW5hbWV9e2FzaW4uaWR9YFxuXG4gIHJldHVybiBhc2luXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2F0YW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0ID8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2F0YW4nOiBpc1dvcmtsZXQgPyAnTWF0aC5hdGFuJyA6IE1hdGguYXRhbiB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9YXRhbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYXRhbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGF0YW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYXRhbi5pbnB1dHMgPSBbIHggXVxuICBhdGFuLmlkID0gZ2VuLmdldFVJRCgpXG4gIGF0YW4ubmFtZSA9IGAke2F0YW4uYmFzZW5hbWV9e2F0YW4uaWR9YFxuXG4gIHJldHVybiBhdGFuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkZWNheVRpbWUgPSA0NDEwMCApID0+IHtcbiAgbGV0IHNzZCA9IGhpc3RvcnkgKCAxICksXG4gICAgICB0NjAgPSBNYXRoLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gZGVjYXlUaW1lIClcblxuICBzc2QuaW4oIG11bCggc3NkLm91dCwgdDYwICkgKVxuXG4gIHNzZC5vdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNzZC52YWx1ZSA9IDFcbiAgfVxuXG4gIHJldHVybiBzdWIoIDEsIHNzZC5vdXQgKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgZ2VuKCkge1xuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgXG4gICAgbGV0IG91dCA9IFxuYCAgdmFyICR7dGhpcy5uYW1lfSA9IG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dXG4gIGlmKCAke3RoaXMubmFtZX0gPT09IDEgKSBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XSA9IDAgICAgICBcbiAgICAgIFxuYFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggX3Byb3BzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgbWluOjAsIG1heDoxIH0sIF9wcm9wcyApXG5cbiAgdWdlbi5uYW1lID0gJ2JhbmcnICsgZ2VuLmdldFVJRCgpXG5cbiAgdWdlbi5taW4gPSBwcm9wcy5taW5cbiAgdWdlbi5tYXggPSBwcm9wcy5tYXhcblxuICBjb25zdCB1c2luZ1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgKSB7XG4gICAgdWdlbi5ub2RlID0gbnVsbFxuICAgIHV0aWxpdGllcy5yZWdpc3RlciggdWdlbiApXG4gIH1cblxuICB1Z2VuLnRyaWdnZXIgPSAoKSA9PiB7XG4gICAgaWYoIHVzaW5nV29ya2xldCA9PT0gdHJ1ZSAmJiB1Z2VuLm5vZGUgIT09IG51bGwgKSB7XG4gICAgICB1Z2VuLm5vZGUucG9ydC5wb3N0TWVzc2FnZSh7IGtleTonc2V0JywgaWR4OnVnZW4ubWVtb3J5LnZhbHVlLmlkeCwgdmFsdWU6dWdlbi5tYXggfSlcbiAgICB9ZWxzZXtcbiAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdWdlbi5tZW1vcnkudmFsdWUuaWR4IF0gPSB1Z2VuLm1heCBcbiAgICB9XG4gIH1cblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Jvb2wnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IGAke2lucHV0c1swXX0gPT09IDAgPyAwIDogMWBcbiAgICBcbiAgICAvL2dlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICAvL3JldHVybiBbIGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gLCAnICcgK291dCBdXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidjZWlsJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0ID8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGguY2VpbCcgOiBNYXRoLmNlaWwgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWNlaWwoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY2VpbCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNlaWwgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY2VpbC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBjZWlsXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViICA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NsaXAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcblxuICAgIG91dCA9XG5cbmAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9ID4gJHtpbnB1dHNbMl19ICkgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMl19XG4gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA8ICR7aW5wdXRzWzFdfSApICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzFdfVxuYFxuICAgIG91dCA9ICcgJyArIG91dFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49LTEsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcblxuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldCA/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdjb3MnOiBpc1dvcmtsZXQgPyAnTWF0aC5jb3MnIDogTWF0aC5jb3MgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWNvcyggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY29zKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgY29zID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGNvcy5pbnB1dHMgPSBbIHggXVxuICBjb3MuaWQgPSBnZW4uZ2V0VUlEKClcbiAgY29zLm5hbWUgPSBgJHtjb3MuYmFzZW5hbWV9e2Nvcy5pZH1gXG5cbiAgcmV0dXJuIGNvc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjb3VudGVyJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5XG4gICAgICAgXG4gICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCApIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgZnVuY3Rpb25Cb2R5ICA9IHRoaXMuY2FsbGJhY2soIGdlbk5hbWUsIGlucHV0c1swXSwgaW5wdXRzWzFdLCBpbnB1dHNbMl0sIGlucHV0c1szXSwgaW5wdXRzWzRdLCAgYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYCwgYG1lbW9yeVske3RoaXMubWVtb3J5LndyYXAuaWR4fV1gICApXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuICAgXG4gICAgaWYoIGdlbi5tZW1vWyB0aGlzLndyYXAubmFtZSBdID09PSB1bmRlZmluZWQgKSB0aGlzLndyYXAuZ2VuKClcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGNhbGxiYWNrKCBfbmFtZSwgX2luY3IsIF9taW4sIF9tYXgsIF9yZXNldCwgbG9vcHMsIHZhbHVlUmVmLCB3cmFwUmVmICkge1xuICAgIGxldCBkaWZmID0gdGhpcy5tYXggLSB0aGlzLm1pbixcbiAgICAgICAgb3V0ID0gJycsXG4gICAgICAgIHdyYXAgPSAnJ1xuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiggISh0eXBlb2YgdGhpcy5pbnB1dHNbM10gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzNdIDwgMSkgKSB7IFxuICAgICAgb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0gMSApICR7dmFsdWVSZWZ9ID0gJHtfbWlufVxcbmBcbiAgICB9XG5cbiAgICBvdXQgKz0gYCAgdmFyICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7dmFsdWVSZWZ9O1xcbiAgJHt2YWx1ZVJlZn0gKz0gJHtfaW5jcn1cXG5gIC8vIHN0b3JlIG91dHB1dCB2YWx1ZSBiZWZvcmUgYWNjdW11bGF0aW5nICBcbiAgICBcbiAgICBpZiggdHlwZW9mIHRoaXMubWF4ID09PSAnbnVtYmVyJyAmJiB0aGlzLm1heCAhPT0gSW5maW5pdHkgJiYgdHlwZW9mIHRoaXMubWluICE9PSAnbnVtYmVyJyApIHtcbiAgICAgIHdyYXAgPSBcbmAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSAmJiAgJHtsb29wc30gPiAwKSB7XG4gICAgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxuICAgICR7d3JhcFJlZn0gPSAxXG4gIH1lbHNle1xuICAgICR7d3JhcFJlZn0gPSAwXG4gIH1cXG5gXG4gICAgfWVsc2UgaWYoIHRoaXMubWF4ICE9PSBJbmZpbml0eSAmJiB0aGlzLm1pbiAhPT0gSW5maW5pdHkgKSB7XG4gICAgICB3cmFwID0gXG5gICBpZiggJHt2YWx1ZVJlZn0gPj0gJHtfbWF4fSAmJiAgJHtsb29wc30gPiAwKSB7XG4gICAgJHt2YWx1ZVJlZn0gLT0gJHtfbWF4fSAtICR7X21pbn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZSBpZiggJHt2YWx1ZVJlZn0gPCAke19taW59ICYmICAke2xvb3BzfSA+IDApIHtcbiAgICAke3ZhbHVlUmVmfSArPSAke19tYXh9IC0gJHtfbWlufVxuICAgICR7d3JhcFJlZn0gPSAxXG4gIH1lbHNle1xuICAgICR7d3JhcFJlZn0gPSAwXG4gIH1cXG5gXG4gICAgfWVsc2V7XG4gICAgICBvdXQgKz0gJ1xcbidcbiAgICB9XG5cbiAgICBvdXQgPSBvdXQgKyB3cmFwXG5cbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluY3I9MSwgbWluPTAsIG1heD1JbmZpbml0eSwgcmVzZXQ9MCwgbG9vcHM9MSwgIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBpbml0aWFsVmFsdWU6IDAsIHNob3VsZFdyYXA6dHJ1ZSB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbjogICAgbWluLCBcbiAgICBtYXg6ICAgIG1heCxcbiAgICB2YWx1ZTogIGRlZmF1bHRzLmluaXRpYWxWYWx1ZSxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW5jciwgbWluLCBtYXgsIHJlc2V0LCBsb29wcyBdLFxuICAgIG1lbW9yeToge1xuICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9LFxuICAgICAgd3JhcDogIHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9IFxuICAgIH0sXG4gICAgd3JhcCA6IHtcbiAgICAgIGdlbigpIHsgXG4gICAgICAgIGlmKCB1Z2VuLm1lbW9yeS53cmFwLmlkeCA9PT0gbnVsbCApIHtcbiAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICB9XG4gICAgICAgIGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyAke3VnZW4ubWVtb3J5LndyYXAuaWR4fSBdYFxuICAgICAgICByZXR1cm4gYG1lbW9yeVsgJHt1Z2VuLm1lbW9yeS53cmFwLmlkeH0gXWAgXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBkZWZhdWx0cyApXG4gXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIFxuICB1Z2VuLndyYXAuaW5wdXRzID0gWyB1Z2VuIF1cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcbiAgdWdlbi53cmFwLm5hbWUgPSB1Z2VuLm5hbWUgKyAnX3dyYXAnXG4gIHJldHVybiB1Z2VuXG59IFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBwaGFzb3I9cmVxdWlyZSggJy4vcGhhc29yLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY3ljbGUnLFxuXG4gIGluaXRUYWJsZSgpIHsgICAgXG4gICAgbGV0IGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gICAgZm9yKCBsZXQgaSA9IDAsIGwgPSBidWZmZXIubGVuZ3RoOyBpIDwgbDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSBNYXRoLnNpbiggKCBpIC8gbCApICogKCBNYXRoLlBJICogMiApIClcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5jeWNsZSA9IGRhdGEoIGJ1ZmZlciwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9IClcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9MSwgcmVzZXQ9MCwgX3Byb3BzICkgPT4ge1xuICBpZiggdHlwZW9mIGdlbi5nbG9iYWxzLmN5Y2xlID09PSAndW5kZWZpbmVkJyApIHByb3RvLmluaXRUYWJsZSgpIFxuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgbWluOjAgfSwgX3Byb3BzIClcblxuICBjb25zdCB1Z2VuID0gcGVlayggZ2VuLmdsb2JhbHMuY3ljbGUsIHBoYXNvciggZnJlcXVlbmN5LCByZXNldCwgcHJvcHMgKSlcbiAgdWdlbi5uYW1lID0gJ2N5Y2xlJyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICB1dGlsaXRpZXMgPSByZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnICksXG4gIHBlZWsgPSByZXF1aXJlKCcuL3BlZWsuanMnKSxcbiAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RhdGEnLFxuICBnbG9iYWxzOiB7fSxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlkeFxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGxldCB1Z2VuID0gdGhpc1xuICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5LCB0aGlzLmltbXV0YWJsZSApIFxuICAgICAgaWR4ID0gdGhpcy5tZW1vcnkudmFsdWVzLmlkeFxuICAgICAgdHJ5IHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwLnNldCggdGhpcy5idWZmZXIsIGlkeCApXG4gICAgICB9Y2F0Y2goIGUgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCBlIClcbiAgICAgICAgdGhyb3cgRXJyb3IoICdlcnJvciB3aXRoIHJlcXVlc3QuIGFza2luZyBmb3IgJyArIHRoaXMuYnVmZmVyLmxlbmd0aCArJy4gY3VycmVudCBpbmRleDogJyArIGdlbi5tZW1vcnlJbmRleCArICcgb2YgJyArIGdlbi5tZW1vcnkuaGVhcC5sZW5ndGggKVxuICAgICAgfVxuICAgICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lIF0gPSB0aGlzXG4gICAgICAvL3JldHVybiAnZ2VuLm1lbW9yeScgKyB0aGlzLm5hbWUgKyAnLmJ1ZmZlcidcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlkeFxuICAgIH1lbHNle1xuICAgICAgaWR4ID0gZ2VuLm1lbW9bIHRoaXMubmFtZSBdXG4gICAgfVxuICAgIHJldHVybiBpZHhcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHgsIHk9MSwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4sIGJ1ZmZlciwgc2hvdWxkTG9hZCA9IGZhbHNlXG4gIFxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuZ2xvYmFsICE9PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdICkge1xuICAgICAgcmV0dXJuIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdXG4gICAgfVxuICB9XG5cbiAgaWYoIHR5cGVvZiB4ID09PSAnbnVtYmVyJyApIHtcbiAgICBpZiggeSAhPT0gMSApIHtcbiAgICAgIGJ1ZmZlciA9IFtdXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHk7IGkrKyApIHtcbiAgICAgICAgYnVmZmVyWyBpIF0gPSBuZXcgRmxvYXQzMkFycmF5KCB4IClcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIHggKVxuICAgIH1cbiAgfWVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIHggKSApIHsgLy8hICh4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkgKSB7XG4gICAgbGV0IHNpemUgPSB4Lmxlbmd0aFxuICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIHNpemUgKVxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0geFsgaSBdXG4gICAgfVxuICB9ZWxzZSBpZiggdHlwZW9mIHggPT09ICdzdHJpbmcnICkge1xuICAgIGJ1ZmZlciA9IHsgbGVuZ3RoOiB5ID4gMSA/IHkgOiBnZW4uc2FtcGxlcmF0ZSAqIDYwIH0gLy8gWFhYIHdoYXQ/Pz9cbiAgICBzaG91bGRMb2FkID0gdHJ1ZVxuICB9ZWxzZSBpZiggeCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSApIHtcbiAgICBidWZmZXIgPSB4XG4gIH1cbiAgXG4gIHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBidWZmZXIsXG4gICAgbmFtZTogcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKCksXG4gICAgZGltOiAgYnVmZmVyLmxlbmd0aCwgLy8gWFhYIGhvdyBkbyB3ZSBkeW5hbWljYWxseSBhbGxvY2F0ZSB0aGlzP1xuICAgIGNoYW5uZWxzIDogMSxcbiAgICBvbmxvYWQ6IG51bGwsXG4gICAgdGhlbiggZm5jICkge1xuICAgICAgdWdlbi5vbmxvYWQgPSBmbmNcbiAgICAgIHJldHVybiB1Z2VuXG4gICAgfSxcbiAgICBpbW11dGFibGU6IHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLmltbXV0YWJsZSA9PT0gdHJ1ZSA/IHRydWUgOiBmYWxzZSxcbiAgICBsb2FkKCBmaWxlbmFtZSApIHtcbiAgICAgIGxldCBwcm9taXNlID0gdXRpbGl0aWVzLmxvYWRTYW1wbGUoIGZpbGVuYW1lLCB1Z2VuIClcbiAgICAgIHByb21pc2UudGhlbiggKCBfYnVmZmVyICk9PiB7IFxuICAgICAgICB1Z2VuLm1lbW9yeS52YWx1ZXMubGVuZ3RoID0gdWdlbi5kaW0gPSBfYnVmZmVyLmxlbmd0aCAgICAgXG4gICAgICAgIHVnZW4ub25sb2FkKCkgXG4gICAgICB9KVxuICAgIH0sXG4gICAgbWVtb3J5IDoge1xuICAgICAgdmFsdWVzOiB7IGxlbmd0aDpidWZmZXIubGVuZ3RoLCBpZHg6bnVsbCB9XG4gICAgfVxuICB9KVxuXG4gIGlmKCBzaG91bGRMb2FkICkgdWdlbi5sb2FkKCB4IClcbiAgXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIHByb3BlcnRpZXMuZ2xvYmFsICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4uZ2xvYmFsc1sgcHJvcGVydGllcy5nbG9iYWwgXSA9IHVnZW5cbiAgICB9XG4gICAgaWYoIHByb3BlcnRpZXMubWV0YSA9PT0gdHJ1ZSApIHtcbiAgICAgIGZvciggbGV0IGkgPSAwLCBsZW5ndGggPSB1Z2VuLmJ1ZmZlci5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKyApIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCBpLCB7XG4gICAgICAgICAgZ2V0ICgpIHtcbiAgICAgICAgICAgIHJldHVybiBwZWVrKCB1Z2VuLCBpLCB7IG1vZGU6J3NpbXBsZScsIGludGVycDonbm9uZScgfSApXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgICByZXR1cm4gcG9rZSggdWdlbiwgdiwgaSApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBhZGQgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgbWVtbyAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSApID0+IHtcbiAgbGV0IHgxID0gaGlzdG9yeSgpLFxuICAgICAgeTEgPSBoaXN0b3J5KCksXG4gICAgICBmaWx0ZXJcblxuICAvL0hpc3RvcnkgeDEsIHkxOyB5ID0gaW4xIC0geDEgKyB5MSowLjk5OTc7IHgxID0gaW4xOyB5MSA9IHk7IG91dDEgPSB5O1xuICBmaWx0ZXIgPSBtZW1vKCBhZGQoIHN1YiggaW4xLCB4MS5vdXQgKSwgbXVsKCB5MS5vdXQsIC45OTk3ICkgKSApXG4gIHgxLmluKCBpbjEgKVxuICB5MS5pbiggZmlsdGVyIClcblxuICByZXR1cm4gZmlsdGVyXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICB0NjAgICAgID0gcmVxdWlyZSggJy4vdDYwLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkZWNheVRpbWUgPSA0NDEwMCwgcHJvcHMgKSA9PiB7XG4gIGxldCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBpbml0VmFsdWU6MSB9LCBwcm9wcyApLFxuICAgICAgc3NkID0gaGlzdG9yeSAoIHByb3BlcnRpZXMuaW5pdFZhbHVlIClcblxuICBzc2QuaW4oIG11bCggc3NkLm91dCwgdDYwKCBkZWNheVRpbWUgKSApIClcblxuICBzc2Qub3V0LnRyaWdnZXIgPSAoKT0+IHtcbiAgICBzc2QudmFsdWUgPSAxXG4gIH1cblxuICByZXR1cm4gc3NkLm91dCBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyAgKSxcbiAgICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgICAgcG9rZSA9IHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gICAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICAgIHN1YiAgPSByZXF1aXJlKCAnLi9zdWIuanMnICApLFxuICAgICAgd3JhcCA9IHJlcXVpcmUoICcuL3dyYXAuanMnICksXG4gICAgICBhY2N1bT0gcmVxdWlyZSggJy4vYWNjdW0uanMnKSxcbiAgICAgIG1lbW8gPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGVsYXknLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gaW5wdXRzWzBdXG4gICAgXG4gICAgcmV0dXJuIGlucHV0c1swXVxuICB9LFxufVxuXG5jb25zdCBkZWZhdWx0cyA9IHsgc2l6ZTogNTEyLCBpbnRlcnA6J25vbmUnIH1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgdGFwcywgcHJvcGVydGllcyApID0+IHtcbiAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgbGV0IHdyaXRlSWR4LCByZWFkSWR4LCBkZWxheWRhdGFcblxuICBpZiggQXJyYXkuaXNBcnJheSggdGFwcyApID09PSBmYWxzZSApIHRhcHMgPSBbIHRhcHMgXVxuICBcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIGNvbnN0IG1heFRhcFNpemUgPSBNYXRoLm1heCggLi4udGFwcyApXG4gIGlmKCBwcm9wcy5zaXplIDwgbWF4VGFwU2l6ZSApIHByb3BzLnNpemUgPSBtYXhUYXBTaXplXG5cbiAgZGVsYXlkYXRhID0gZGF0YSggcHJvcHMuc2l6ZSApXG4gIFxuICB1Z2VuLmlucHV0cyA9IFtdXG5cbiAgd3JpdGVJZHggPSBhY2N1bSggMSwgMCwgeyBtYXg6cHJvcHMuc2l6ZSwgbWluOjAgfSlcbiAgXG4gIGZvciggbGV0IGkgPSAwOyBpIDwgdGFwcy5sZW5ndGg7IGkrKyApIHtcbiAgICB1Z2VuLmlucHV0c1sgaSBdID0gcGVlayggZGVsYXlkYXRhLCB3cmFwKCBzdWIoIHdyaXRlSWR4LCB0YXBzW2ldICksIDAsIHByb3BzLnNpemUgKSx7IG1vZGU6J3NhbXBsZXMnLCBpbnRlcnA6cHJvcHMuaW50ZXJwIH0pXG4gIH1cbiAgXG4gIHVnZW4ub3V0cHV0cyA9IHVnZW4uaW5wdXRzIC8vIFhYWCB1Z2gsIFVnaCwgVUdIISBidXQgaSBndWVzcyBpdCB3b3Jrcy5cblxuICBwb2tlKCBkZWxheWRhdGEsIGluMSwgd3JpdGVJZHggKVxuXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgbjEgPSBoaXN0b3J5KClcbiAgICBcbiAgbjEuaW4oIGluMSApXG5cbiAgbGV0IHVnZW4gPSBzdWIoIGluMSwgbjEub3V0IClcbiAgdWdlbi5uYW1lID0gJ2RlbHRhJytnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGl2JyxcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dD1gICB2YXIgJHt0aGlzLm5hbWV9ID0gYCxcbiAgICAgICAgZGlmZiA9IDAsIFxuICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICBkaXZBdEVuZCA9IGZhbHNlXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgIGlmKCAhbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuICkge1xuICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAvIHZcbiAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gLyAke3Z9YFxuICAgICAgfVxuXG4gICAgICBpZiggIWlzRmluYWxJZHggKSBvdXQgKz0gJyAvICcgXG4gICAgfSlcblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBjb25zdCBkaXYgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBPYmplY3QuYXNzaWduKCBkaXYsIHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG4gIH0pXG5cbiAgZGl2Lm5hbWUgPSBkaXYuYmFzZW5hbWUgKyBkaXYuaWRcbiAgXG4gIHJldHVybiBkaXZcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbicgKSxcbiAgICB3aW5kb3dzID0gcmVxdWlyZSggJy4vd2luZG93cycgKSxcbiAgICBkYXRhICAgID0gcmVxdWlyZSggJy4vZGF0YScgKSxcbiAgICBwZWVrICAgID0gcmVxdWlyZSggJy4vcGVlaycgKSxcbiAgICBwaGFzb3IgID0gcmVxdWlyZSggJy4vcGhhc29yJyApLFxuICAgIGRlZmF1bHRzID0ge1xuICAgICAgdHlwZTondHJpYW5ndWxhcicsIGxlbmd0aDoxMDI0LCBhbHBoYTouMTUsIHNoaWZ0OjAsIHJldmVyc2U6ZmFsc2UgXG4gICAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByb3BzID0+IHtcbiAgXG4gIGxldCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBwcm9wcyApXG4gIGxldCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCBwcm9wZXJ0aWVzLmxlbmd0aCApXG5cbiAgbGV0IG5hbWUgPSBwcm9wZXJ0aWVzLnR5cGUgKyAnXycgKyBwcm9wZXJ0aWVzLmxlbmd0aCArICdfJyArIHByb3BlcnRpZXMuc2hpZnQgKyAnXycgKyBwcm9wZXJ0aWVzLnJldmVyc2UgKyAnXycgKyBwcm9wZXJ0aWVzLmFscGhhXG4gIGlmKCB0eXBlb2YgZ2VuLmdsb2JhbHMud2luZG93c1sgbmFtZSBdID09PSAndW5kZWZpbmVkJyApIHsgXG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBidWZmZXJbIGkgXSA9IHdpbmRvd3NbIHByb3BlcnRpZXMudHlwZSBdKCBwcm9wZXJ0aWVzLmxlbmd0aCwgaSwgcHJvcGVydGllcy5hbHBoYSwgcHJvcGVydGllcy5zaGlmdCApXG4gICAgfVxuXG4gICAgaWYoIHByb3BlcnRpZXMucmV2ZXJzZSA9PT0gdHJ1ZSApIHsgXG4gICAgICBidWZmZXIucmV2ZXJzZSgpXG4gICAgfVxuICAgIGdlbi5nbG9iYWxzLndpbmRvd3NbIG5hbWUgXSA9IGRhdGEoIGJ1ZmZlciApXG4gIH1cblxuICBsZXQgdWdlbiA9IGdlbi5nbG9iYWxzLndpbmRvd3NbIG5hbWUgXSBcbiAgdWdlbi5uYW1lID0gJ2VudicgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZXEnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IHRoaXMuaW5wdXRzWzBdID09PSB0aGlzLmlucHV0c1sxXSA/IDEgOiBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSA9PT0gJHtpbnB1dHNbMV19KSB8IDBcXG5cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfWAsIG91dCBdXG4gIH0sXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgaW4yICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZXhwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBpc1dvcmtsZXQgPyAnTWF0aC5leHAnIDogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWV4cCggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5leHAoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBleHAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZXhwLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGV4cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2Zsb29yJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgLy9nZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5mbG9vciB9KVxuXG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gfCAwIClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdIHwgMFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGZsb29yID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGZsb29yLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGZsb29yXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2ZvbGQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcblxuICAgIG91dCA9IHRoaXMuY3JlYXRlQ2FsbGJhY2soIGlucHV0c1swXSwgdGhpcy5taW4sIHRoaXMubWF4ICkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIG91dCBdXG4gIH0sXG5cbiAgY3JlYXRlQ2FsbGJhY2soIHYsIGxvLCBoaSApIHtcbiAgICBsZXQgb3V0ID1cbmAgdmFyICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7dn0sXG4gICAgICAke3RoaXMubmFtZX1fcmFuZ2UgPSAke2hpfSAtICR7bG99LFxuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gMFxuXG4gIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA+PSAke2hpfSl7XG4gICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZVxuICAgIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA+PSAke2hpfSl7XG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAoKCR7dGhpcy5uYW1lfV92YWx1ZSAtICR7bG99KSAvICR7dGhpcy5uYW1lfV9yYW5nZSkgfCAwXG4gICAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlICogJHt0aGlzLm5hbWV9X251bVdyYXBzXG4gICAgfVxuICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcysrXG4gIH0gZWxzZSBpZigke3RoaXMubmFtZX1fdmFsdWUgPCAke2xvfSl7XG4gICAgJHt0aGlzLm5hbWV9X3ZhbHVlICs9ICR7dGhpcy5uYW1lfV9yYW5nZVxuICAgIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA8ICR7bG99KXtcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9ICgoJHt0aGlzLm5hbWV9X3ZhbHVlIC0gJHtsb30pIC8gJHt0aGlzLm5hbWV9X3JhbmdlLSAxKSB8IDBcbiAgICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2UgKiAke3RoaXMubmFtZX1fbnVtV3JhcHNcbiAgICB9XG4gICAgJHt0aGlzLm5hbWV9X251bVdyYXBzLS1cbiAgfVxuICBpZigke3RoaXMubmFtZX1fbnVtV3JhcHMgJiAxKSAke3RoaXMubmFtZX1fdmFsdWUgPSAke2hpfSArICR7bG99IC0gJHt0aGlzLm5hbWV9X3ZhbHVlXG5gXG4gICAgcmV0dXJuICcgJyArIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidnYXRlJyxcbiAgY29udHJvbFN0cmluZzpudWxsLCAvLyBpbnNlcnQgaW50byBvdXRwdXQgY29kZWdlbiBmb3IgZGV0ZXJtaW5pbmcgaW5kZXhpbmdcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuICAgIFxuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgXG4gICAgbGV0IGxhc3RJbnB1dE1lbW9yeUlkeCA9ICdtZW1vcnlbICcgKyB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgJyBdJyxcbiAgICAgICAgb3V0cHV0TWVtb3J5U3RhcnRJZHggPSB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgMSxcbiAgICAgICAgaW5wdXRTaWduYWwgPSBpbnB1dHNbMF0sXG4gICAgICAgIGNvbnRyb2xTaWduYWwgPSBpbnB1dHNbMV1cbiAgICBcbiAgICAvKiBcbiAgICAgKiB3ZSBjaGVjayB0byBzZWUgaWYgdGhlIGN1cnJlbnQgY29udHJvbCBpbnB1dHMgZXF1YWxzIG91ciBsYXN0IGlucHV0XG4gICAgICogaWYgc28sIHdlIHN0b3JlIHRoZSBzaWduYWwgaW5wdXQgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnRseVxuICAgICAqIHNlbGVjdGVkIGluZGV4LiBJZiBub3QsIHdlIHB1dCAwIGluIHRoZSBtZW1vcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBsYXN0IHNlbGVjdGVkIGluZGV4LFxuICAgICAqIGNoYW5nZSB0aGUgc2VsZWN0ZWQgaW5kZXgsIGFuZCB0aGVuIHN0b3JlIHRoZSBzaWduYWwgaW4gcHV0IGluIHRoZSBtZW1lcnkgYXNzb2ljYXRlZFxuICAgICAqIHdpdGggdGhlIG5ld2x5IHNlbGVjdGVkIGluZGV4XG4gICAgICovXG4gICAgXG4gICAgb3V0ID1cblxuYCBpZiggJHtjb250cm9sU2lnbmFsfSAhPT0gJHtsYXN0SW5wdXRNZW1vcnlJZHh9ICkge1xuICAgIG1lbW9yeVsgJHtsYXN0SW5wdXRNZW1vcnlJZHh9ICsgJHtvdXRwdXRNZW1vcnlTdGFydElkeH0gIF0gPSAwIFxuICAgICR7bGFzdElucHV0TWVtb3J5SWR4fSA9ICR7Y29udHJvbFNpZ25hbH1cbiAgfVxuICBtZW1vcnlbICR7b3V0cHV0TWVtb3J5U3RhcnRJZHh9ICsgJHtjb250cm9sU2lnbmFsfSBdID0gJHtpbnB1dFNpZ25hbH1cblxuYFxuICAgIHRoaXMuY29udHJvbFN0cmluZyA9IGlucHV0c1sxXVxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHRoaXMub3V0cHV0cy5mb3JFYWNoKCB2ID0+IHYuZ2VuKCkgKVxuXG4gICAgcmV0dXJuIFsgbnVsbCwgJyAnICsgb3V0IF1cbiAgfSxcblxuICBjaGlsZGdlbigpIHtcbiAgICBpZiggdGhpcy5wYXJlbnQuaW5pdGlhbGl6ZWQgPT09IGZhbHNlICkge1xuICAgICAgZ2VuLmdldElucHV0cyggdGhpcyApIC8vIHBhcmVudCBnYXRlIGlzIG9ubHkgaW5wdXQgb2YgYSBnYXRlIG91dHB1dCwgc2hvdWxkIG9ubHkgYmUgZ2VuJ2Qgb25jZS5cbiAgICB9XG5cbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMubmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyAke3RoaXMubWVtb3J5LnZhbHVlLmlkeH0gXWBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuICBgbWVtb3J5WyAke3RoaXMubWVtb3J5LnZhbHVlLmlkeH0gXWBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggY29udHJvbCwgaW4xLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY291bnQ6IDIgfVxuXG4gIGlmKCB0eXBlb2YgcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICBvdXRwdXRzOiBbXSxcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGNvbnRyb2wgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIGxhc3RJbnB1dDogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgIH0sXG4gICAgaW5pdGlhbGl6ZWQ6ZmFsc2VcbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke2dlbi5nZXRVSUQoKX1gXG5cbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCB1Z2VuLmNvdW50OyBpKysgKSB7XG4gICAgdWdlbi5vdXRwdXRzLnB1c2goe1xuICAgICAgaW5kZXg6aSxcbiAgICAgIGdlbjogcHJvdG8uY2hpbGRnZW4sXG4gICAgICBwYXJlbnQ6dWdlbixcbiAgICAgIGlucHV0czogWyB1Z2VuIF0sXG4gICAgICBtZW1vcnk6IHtcbiAgICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICAgIH0sXG4gICAgICBpbml0aWFsaXplZDpmYWxzZSxcbiAgICAgIG5hbWU6IGAke3VnZW4ubmFtZX1fb3V0JHtnZW4uZ2V0VUlEKCl9YFxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qIGdlbi5qc1xuICpcbiAqIGxvdy1sZXZlbCBjb2RlIGdlbmVyYXRpb24gZm9yIHVuaXQgZ2VuZXJhdG9yc1xuICpcbiAqL1xuXG5sZXQgTWVtb3J5SGVscGVyID0gcmVxdWlyZSggJ21lbW9yeS1oZWxwZXInIClcblxubGV0IGdlbiA9IHtcblxuICBhY2N1bTowLFxuICBnZXRVSUQoKSB7IHJldHVybiB0aGlzLmFjY3VtKysgfSxcbiAgZGVidWc6ZmFsc2UsXG4gIHNhbXBsZXJhdGU6IDQ0MTAwLCAvLyBjaGFuZ2Ugb24gYXVkaW9jb250ZXh0IGNyZWF0aW9uXG4gIHNob3VsZExvY2FsaXplOiBmYWxzZSxcbiAgZ2xvYmFsczp7XG4gICAgd2luZG93czoge30sXG4gIH0sXG4gIG1vZGU6J3dvcmtsZXQnLFxuICBcbiAgLyogY2xvc3VyZXNcbiAgICpcbiAgICogRnVuY3Rpb25zIHRoYXQgYXJlIGluY2x1ZGVkIGFzIGFyZ3VtZW50cyB0byBtYXN0ZXIgY2FsbGJhY2suIEV4YW1wbGVzOiBNYXRoLmFicywgTWF0aC5yYW5kb20gZXRjLlxuICAgKiBYWFggU2hvdWxkIHByb2JhYmx5IGJlIHJlbmFtZWQgY2FsbGJhY2tQcm9wZXJ0aWVzIG9yIHNvbWV0aGluZyBzaW1pbGFyLi4uIGNsb3N1cmVzIGFyZSBubyBsb25nZXIgdXNlZC5cbiAgICovXG5cbiAgY2xvc3VyZXM6IG5ldyBTZXQoKSxcbiAgcGFyYW1zOiAgIG5ldyBTZXQoKSxcbiAgaW5wdXRzOiAgIG5ldyBTZXQoKSxcblxuICBwYXJhbWV0ZXJzOiBuZXcgU2V0KCksXG4gIGVuZEJsb2NrOiBuZXcgU2V0KCksXG4gIGhpc3RvcmllczogbmV3IE1hcCgpLFxuXG4gIG1lbW86IHt9LFxuXG4gIC8vZGF0YToge30sXG4gIFxuICAvKiBleHBvcnRcbiAgICpcbiAgICogcGxhY2UgZ2VuIGZ1bmN0aW9ucyBpbnRvIGFub3RoZXIgb2JqZWN0IGZvciBlYXNpZXIgcmVmZXJlbmNlXG4gICAqL1xuXG4gIGV4cG9ydCggb2JqICkge30sXG5cbiAgYWRkVG9FbmRCbG9jayggdiApIHtcbiAgICB0aGlzLmVuZEJsb2NrLmFkZCggJyAgJyArIHYgKVxuICB9LFxuICBcbiAgcmVxdWVzdE1lbW9yeSggbWVtb3J5U3BlYywgaW1tdXRhYmxlPWZhbHNlICkge1xuICAgIGZvciggbGV0IGtleSBpbiBtZW1vcnlTcGVjICkge1xuICAgICAgbGV0IHJlcXVlc3QgPSBtZW1vcnlTcGVjWyBrZXkgXVxuXG4gICAgICAvL2NvbnNvbGUubG9nKCAncmVxdWVzdGluZyAnICsga2V5ICsgJzonICwgSlNPTi5zdHJpbmdpZnkoIHJlcXVlc3QgKSApXG5cbiAgICAgIGlmKCByZXF1ZXN0Lmxlbmd0aCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICBjb25zb2xlLmxvZyggJ3VuZGVmaW5lZCBsZW5ndGggZm9yOicsIGtleSApXG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5pZHggPSBnZW4ubWVtb3J5LmFsbG9jKCByZXF1ZXN0Lmxlbmd0aCwgaW1tdXRhYmxlIClcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlTWVtb3J5KCBhbW91bnQsIHR5cGUgKSB7XG4gICAgY29uc3QgbWVtID0gTWVtb3J5SGVscGVyLmNyZWF0ZSggbWVtLCB0eXBlIClcbiAgfSxcblxuICAvKiBjcmVhdGVDYWxsYmFja1xuICAgKlxuICAgKiBwYXJhbSB1Z2VuIC0gSGVhZCBvZiBncmFwaCB0byBiZSBjb2RlZ2VuJ2RcbiAgICpcbiAgICogR2VuZXJhdGUgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGEgcGFydGljdWxhciB1Z2VuIGdyYXBoLlxuICAgKiBUaGUgZ2VuLmNsb3N1cmVzIHByb3BlcnR5IHN0b3JlcyBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlXG4gICAqIHBhc3NlZCBhcyBhcmd1bWVudHMgdG8gdGhlIGZpbmFsIGZ1bmN0aW9uOyB0aGVzZSBhcmUgcHJlZml4ZWRcbiAgICogYmVmb3JlIGFueSBkZWZpbmVkIHBhcmFtcyB0aGUgZ3JhcGggZXhwb3Nlcy4gRm9yIGV4YW1wbGUsIGdpdmVuOlxuICAgKlxuICAgKiBnZW4uY3JlYXRlQ2FsbGJhY2soIGFicyggcGFyYW0oKSApIClcbiAgICpcbiAgICogLi4uIHRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gd2lsbCBoYXZlIGEgc2lnbmF0dXJlIG9mICggYWJzLCBwMCApLlxuICAgKi9cbiAgXG4gIGNyZWF0ZUNhbGxiYWNrKCB1Z2VuLCBtZW0sIGRlYnVnID0gZmFsc2UsIHNob3VsZElubGluZU1lbW9yeT1mYWxzZSwgbWVtVHlwZSA9IEZsb2F0NjRBcnJheSApIHtcbiAgICBsZXQgaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KCB1Z2VuICkgJiYgdWdlbi5sZW5ndGggPiAxLFxuICAgICAgICBjYWxsYmFjaywgXG4gICAgICAgIGNoYW5uZWwxLCBjaGFubmVsMlxuXG4gICAgaWYoIHR5cGVvZiBtZW0gPT09ICdudW1iZXInIHx8IG1lbSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgbWVtID0gTWVtb3J5SGVscGVyLmNyZWF0ZSggbWVtLCBtZW1UeXBlIClcbiAgICB9XG4gICAgXG4gICAgLy9jb25zb2xlLmxvZyggJ2NiIG1lbW9yeTonLCBtZW0gKVxuICAgIHRoaXMubWVtb3J5ID0gbWVtXG4gICAgdGhpcy5tZW1vcnkuYWxsb2MoIDIsIHRydWUgKVxuICAgIHRoaXMubWVtbyA9IHt9IFxuICAgIHRoaXMuZW5kQmxvY2suY2xlYXIoKVxuICAgIHRoaXMuY2xvc3VyZXMuY2xlYXIoKVxuICAgIHRoaXMuaW5wdXRzLmNsZWFyKClcbiAgICB0aGlzLnBhcmFtcy5jbGVhcigpXG4gICAgLy90aGlzLmdsb2JhbHMgPSB7IHdpbmRvd3M6e30gfVxuICAgIFxuICAgIHRoaXMucGFyYW1ldGVycy5jbGVhcigpXG4gICAgXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSBcIiAgJ3VzZSBzdHJpY3QnXFxuXCJcbiAgICBpZiggc2hvdWxkSW5saW5lTWVtb3J5PT09ZmFsc2UgKSB7XG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keSArPSB0aGlzLm1vZGUgPT09ICd3b3JrbGV0JyA/IFxuICAgICAgICBcIiAgdmFyIG1lbW9yeSA9IHRoaXMubWVtb3J5XFxuXFxuXCIgOlxuICAgICAgICBcIiAgdmFyIG1lbW9yeSA9IGdlbi5tZW1vcnlcXG5cXG5cIlxuICAgIH1cblxuICAgIC8vIGNhbGwgLmdlbigpIG9uIHRoZSBoZWFkIG9mIHRoZSBncmFwaCB3ZSBhcmUgZ2VuZXJhdGluZyB0aGUgY2FsbGJhY2sgZm9yXG4gICAgLy9jb25zb2xlLmxvZyggJ0hFQUQnLCB1Z2VuIClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IDEgKyBpc1N0ZXJlbzsgaSsrICkge1xuICAgICAgaWYoIHR5cGVvZiB1Z2VuW2ldID09PSAnbnVtYmVyJyApIGNvbnRpbnVlXG5cbiAgICAgIC8vbGV0IGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHVnZW5baV0uZ2VuKCkgOiB1Z2VuLmdlbigpLFxuICAgICAgbGV0IGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHRoaXMuZ2V0SW5wdXQoIHVnZW5baV0gKSA6IHRoaXMuZ2V0SW5wdXQoIHVnZW4gKSwgXG4gICAgICAgICAgYm9keSA9ICcnXG5cbiAgICAgIC8vIGlmIC5nZW4oKSByZXR1cm5zIGFycmF5LCBhZGQgdWdlbiBjYWxsYmFjayAoZ3JhcGhPdXRwdXRbMV0pIHRvIG91ciBvdXRwdXQgZnVuY3Rpb25zIGJvZHlcbiAgICAgIC8vIGFuZCB0aGVuIHJldHVybiBuYW1lIG9mIHVnZW4uIElmIC5nZW4oKSBvbmx5IGdlbmVyYXRlcyBhIG51bWJlciAoZm9yIHJlYWxseSBzaW1wbGUgZ3JhcGhzKVxuICAgICAgLy8ganVzdCByZXR1cm4gdGhhdCBudW1iZXIgKGdyYXBoT3V0cHV0WzBdKS5cbiAgICAgIGJvZHkgKz0gQXJyYXkuaXNBcnJheSggY2hhbm5lbCApID8gY2hhbm5lbFsxXSArICdcXG4nICsgY2hhbm5lbFswXSA6IGNoYW5uZWxcblxuICAgICAgLy8gc3BsaXQgYm9keSB0byBpbmplY3QgcmV0dXJuIGtleXdvcmQgb24gbGFzdCBsaW5lXG4gICAgICBib2R5ID0gYm9keS5zcGxpdCgnXFxuJylcbiAgICAgXG4gICAgICAvL2lmKCBkZWJ1ZyApIGNvbnNvbGUubG9nKCAnZnVuY3Rpb25Cb2R5IGxlbmd0aCcsIGJvZHkgKVxuICAgICAgXG4gICAgICAvLyBuZXh0IGxpbmUgaXMgdG8gYWNjb21tb2RhdGUgbWVtbyBhcyBncmFwaCBoZWFkXG4gICAgICBpZiggYm9keVsgYm9keS5sZW5ndGggLTEgXS50cmltKCkuaW5kZXhPZignbGV0JykgPiAtMSApIHsgYm9keS5wdXNoKCAnXFxuJyApIH0gXG5cbiAgICAgIC8vIGdldCBpbmRleCBvZiBsYXN0IGxpbmVcbiAgICAgIGxldCBsYXN0aWR4ID0gYm9keS5sZW5ndGggLSAxXG5cbiAgICAgIC8vIGluc2VydCByZXR1cm4ga2V5d29yZFxuICAgICAgYm9keVsgbGFzdGlkeCBdID0gJyAgbWVtb3J5WycgKyBpICsgJ10gID0gJyArIGJvZHlbIGxhc3RpZHggXSArICdcXG4nXG5cbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IGJvZHkuam9pbignXFxuJylcbiAgICB9XG4gICAgXG4gICAgdGhpcy5oaXN0b3JpZXMuZm9yRWFjaCggdmFsdWUgPT4ge1xuICAgICAgaWYoIHZhbHVlICE9PSBudWxsIClcbiAgICAgICAgdmFsdWUuZ2VuKCkgICAgICBcbiAgICB9KVxuXG4gICAgY29uc3QgcmV0dXJuU3RhdGVtZW50ID0gaXNTdGVyZW8gPyAnICByZXR1cm4gbWVtb3J5JyA6ICcgIHJldHVybiBtZW1vcnlbMF0nXG4gICAgXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5zcGxpdCgnXFxuJylcblxuICAgIGlmKCB0aGlzLmVuZEJsb2NrLnNpemUgKSB7IFxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5jb25jYXQoIEFycmF5LmZyb20oIHRoaXMuZW5kQmxvY2sgKSApXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKCByZXR1cm5TdGF0ZW1lbnQgKVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggcmV0dXJuU3RhdGVtZW50IClcbiAgICB9XG4gICAgLy8gcmVhc3NlbWJsZSBmdW5jdGlvbiBib2R5XG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5qb2luKCdcXG4nKVxuXG4gICAgLy8gd2UgY2FuIG9ubHkgZHluYW1pY2FsbHkgY3JlYXRlIGEgbmFtZWQgZnVuY3Rpb24gYnkgZHluYW1pY2FsbHkgY3JlYXRpbmcgYW5vdGhlciBmdW5jdGlvblxuICAgIC8vIHRvIGNvbnN0cnVjdCB0aGUgbmFtZWQgZnVuY3Rpb24hIHNoZWVzaC4uLlxuICAgIC8vXG4gICAgaWYoIHNob3VsZElubGluZU1lbW9yeSA9PT0gdHJ1ZSApIHtcbiAgICAgIHRoaXMucGFyYW1ldGVycy5hZGQoICdtZW1vcnknIClcbiAgICB9XG5cbiAgICBsZXQgcGFyYW1TdHJpbmcgPSAnJ1xuICAgIGlmKCB0aGlzLm1vZGUgPT09ICd3b3JrbGV0JyApIHtcbiAgICAgIGZvciggbGV0IG5hbWUgb2YgdGhpcy5wYXJhbWV0ZXJzLnZhbHVlcygpICkge1xuICAgICAgICBwYXJhbVN0cmluZyArPSBuYW1lICsgJywnXG4gICAgICB9XG4gICAgICBwYXJhbVN0cmluZyA9IHBhcmFtU3RyaW5nLnNsaWNlKDAsLTEpXG4gICAgfVxuXG4gICAgY29uc3Qgc2VwYXJhdG9yID0gdGhpcy5wYXJhbWV0ZXJzLnNpemUgIT09IDAgJiYgdGhpcy5pbnB1dHMuc2l6ZSA+IDAgPyAnLCAnIDogJydcblxuICAgIGxldCBpbnB1dFN0cmluZyA9ICcnXG4gICAgaWYoIHRoaXMubW9kZSA9PT0gJ3dvcmtsZXQnICkge1xuICAgICAgZm9yKCBsZXQgdWdlbiBvZiB0aGlzLmlucHV0cy52YWx1ZXMoKSApIHtcbiAgICAgICAgaW5wdXRTdHJpbmcrPSB1Z2VuLm5hbWUgKyAnLCdcbiAgICAgIH1cbiAgICAgIGlucHV0U3RyaW5nID0gaW5wdXRTdHJpbmcuc2xpY2UoMCwtMSlcbiAgICB9XG5cbiAgICBsZXQgYnVpbGRTdHJpbmcgPSB0aGlzLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgICAgPyBgcmV0dXJuIGZ1bmN0aW9uKCAke2lucHV0U3RyaW5nfSAke3NlcGFyYXRvcn0gJHtwYXJhbVN0cmluZ30gKXsgXFxuJHsgdGhpcy5mdW5jdGlvbkJvZHkgfVxcbn1gXG4gICAgICA6IGByZXR1cm4gZnVuY3Rpb24gZ2VuKCAkeyBbLi4udGhpcy5wYXJhbWV0ZXJzXS5qb2luKCcsJykgfSApeyBcXG4keyB0aGlzLmZ1bmN0aW9uQm9keSB9XFxufWBcbiAgICBcbiAgICBpZiggdGhpcy5kZWJ1ZyB8fCBkZWJ1ZyApIGNvbnNvbGUubG9nKCBidWlsZFN0cmluZyApIFxuXG4gICAgY2FsbGJhY2sgPSBuZXcgRnVuY3Rpb24oIGJ1aWxkU3RyaW5nICkoKVxuXG4gICAgLy8gYXNzaWduIHByb3BlcnRpZXMgdG8gbmFtZWQgZnVuY3Rpb25cbiAgICBmb3IoIGxldCBkaWN0IG9mIHRoaXMuY2xvc3VyZXMudmFsdWVzKCkgKSB7XG4gICAgICBsZXQgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF0sXG4gICAgICAgICAgdmFsdWUgPSBkaWN0WyBuYW1lIF1cblxuICAgICAgY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgZm9yKCBsZXQgZGljdCBvZiB0aGlzLnBhcmFtcy52YWx1ZXMoKSApIHtcbiAgICAgIGxldCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICB1Z2VuID0gZGljdFsgbmFtZSBdXG4gICAgICBcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggY2FsbGJhY2ssIG5hbWUsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7IHJldHVybiB1Z2VuLnZhbHVlIH0sXG4gICAgICAgIHNldCh2KXsgdWdlbi52YWx1ZSA9IHYgfVxuICAgICAgfSlcbiAgICAgIC8vY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgY2FsbGJhY2subWVtYmVycyA9IHRoaXMuY2xvc3VyZXNcbiAgICBjYWxsYmFjay5kYXRhID0gdGhpcy5kYXRhXG4gICAgY2FsbGJhY2sucGFyYW1zID0gdGhpcy5wYXJhbXNcbiAgICBjYWxsYmFjay5pbnB1dHMgPSB0aGlzLmlucHV0c1xuICAgIGNhbGxiYWNrLnBhcmFtZXRlcnMgPSB0aGlzLnBhcmFtZXRlcnMvLy5zbGljZSggMCApXG4gICAgY2FsbGJhY2suaXNTdGVyZW8gPSBpc1N0ZXJlb1xuXG4gICAgLy9pZiggTWVtb3J5SGVscGVyLmlzUHJvdG90eXBlT2YoIHRoaXMubWVtb3J5ICkgKSBcbiAgICBjYWxsYmFjay5tZW1vcnkgPSB0aGlzLm1lbW9yeS5oZWFwXG5cbiAgICB0aGlzLmhpc3Rvcmllcy5jbGVhcigpXG5cbiAgICByZXR1cm4gY2FsbGJhY2tcbiAgfSxcbiAgXG4gIC8qIGdldElucHV0c1xuICAgKlxuICAgKiBDYWxsZWQgYnkgZWFjaCBpbmRpdmlkdWFsIHVnZW4gd2hlbiB0aGVpciAuZ2VuKCkgbWV0aG9kIGlzIGNhbGxlZCB0byByZXNvbHZlIHRoZWlyIHZhcmlvdXMgaW5wdXRzLlxuICAgKiBJZiBhbiBpbnB1dCBpcyBhIG51bWJlciwgcmV0dXJuIHRoZSBudW1iZXIuIElmXG4gICAqIGl0IGlzIGFuIHVnZW4sIGNhbGwgLmdlbigpIG9uIHRoZSB1Z2VuLCBtZW1vaXplIHRoZSByZXN1bHQgYW5kIHJldHVybiB0aGUgcmVzdWx0LiBJZiB0aGVcbiAgICogdWdlbiBoYXMgcHJldmlvdXNseSBiZWVuIG1lbW9pemVkIHJldHVybiB0aGUgbWVtb2l6ZWQgdmFsdWUuXG4gICAqXG4gICAqL1xuICBnZXRJbnB1dHMoIHVnZW4gKSB7XG4gICAgcmV0dXJuIHVnZW4uaW5wdXRzLm1hcCggZ2VuLmdldElucHV0ICkgXG4gIH0sXG5cbiAgZ2V0SW5wdXQoIGlucHV0ICkge1xuICAgIGxldCBpc09iamVjdCA9IHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcsXG4gICAgICAgIHByb2Nlc3NlZElucHV0XG5cbiAgICBpZiggaXNPYmplY3QgKSB7IC8vIGlmIGlucHV0IGlzIGEgdWdlbi4uLiBcbiAgICAgIC8vY29uc29sZS5sb2coIGlucHV0Lm5hbWUsIGdlbi5tZW1vWyBpbnB1dC5uYW1lIF0gKVxuICAgICAgaWYoIGdlbi5tZW1vWyBpbnB1dC5uYW1lIF0gKSB7IC8vIGlmIGl0IGhhcyBiZWVuIG1lbW9pemVkLi4uXG4gICAgICAgIHByb2Nlc3NlZElucHV0ID0gZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXVxuICAgICAgfWVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGlucHV0ICkgKSB7XG4gICAgICAgIGdlbi5nZXRJbnB1dCggaW5wdXRbMF0gKVxuICAgICAgICBnZW4uZ2V0SW5wdXQoIGlucHV0WzFdIClcbiAgICAgIH1lbHNleyAvLyBpZiBub3QgbWVtb2l6ZWQgZ2VuZXJhdGUgY29kZSAgXG4gICAgICAgIGlmKCB0eXBlb2YgaW5wdXQuZ2VuICE9PSAnZnVuY3Rpb24nICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCAnbm8gZ2VuIGZvdW5kOicsIGlucHV0LCBpbnB1dC5nZW4gKVxuICAgICAgICB9XG4gICAgICAgIGxldCBjb2RlID0gaW5wdXQuZ2VuKClcbiAgICAgICAgLy9pZiggY29kZS5pbmRleE9mKCAnT2JqZWN0JyApID4gLTEgKSBjb25zb2xlLmxvZyggJ2JhZCBpbnB1dDonLCBpbnB1dCwgY29kZSApXG4gICAgICAgIFxuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggY29kZSApICkge1xuICAgICAgICAgIGlmKCAhZ2VuLnNob3VsZExvY2FsaXplICkge1xuICAgICAgICAgICAgZ2VuLmZ1bmN0aW9uQm9keSArPSBjb2RlWzFdXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBnZW4uY29kZU5hbWUgPSBjb2RlWzBdXG4gICAgICAgICAgICBnZW4ubG9jYWxpemVkQ29kZS5wdXNoKCBjb2RlWzFdIClcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyggJ2FmdGVyIEdFTicgLCB0aGlzLmZ1bmN0aW9uQm9keSApXG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlWzBdXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gY29kZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfWVsc2V7IC8vIGl0IGlucHV0IGlzIGEgbnVtYmVyXG4gICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2Nlc3NlZElucHV0XG4gIH0sXG5cbiAgc3RhcnRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLmxvY2FsaXplZENvZGUgPSBbXVxuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSB0cnVlXG4gIH0sXG4gIGVuZExvY2FsaXplKCkge1xuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSBmYWxzZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5jb2RlTmFtZSwgdGhpcy5sb2NhbGl6ZWRDb2RlLnNsaWNlKDApIF1cbiAgfSxcblxuICBmcmVlKCBncmFwaCApIHtcbiAgICBpZiggQXJyYXkuaXNBcnJheSggZ3JhcGggKSApIHsgLy8gc3RlcmVvIHVnZW5cbiAgICAgIGZvciggbGV0IGNoYW5uZWwgb2YgZ3JhcGggKSB7XG4gICAgICAgIHRoaXMuZnJlZSggY2hhbm5lbCApXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKCB0eXBlb2YgZ3JhcGggPT09ICdvYmplY3QnICkge1xuICAgICAgICBpZiggZ3JhcGgubWVtb3J5ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgZm9yKCBsZXQgbWVtb3J5S2V5IGluIGdyYXBoLm1lbW9yeSApIHtcbiAgICAgICAgICAgIHRoaXMubWVtb3J5LmZyZWUoIGdyYXBoLm1lbW9yeVsgbWVtb3J5S2V5IF0uaWR4IClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGdyYXBoLmlucHV0cyApICkge1xuICAgICAgICAgIGZvciggbGV0IHVnZW4gb2YgZ3JhcGguaW5wdXRzICkge1xuICAgICAgICAgICAgdGhpcy5mcmVlKCB1Z2VuIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZW5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZ3QnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCgoICR7aW5wdXRzWzBdfSA+ICR7aW5wdXRzWzFdfSkgfCAwIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPiBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG5cXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBndCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBndC5pbnB1dHMgPSBbIHgseSBdXG4gIGd0Lm5hbWUgPSBndC5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBndFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZ3RlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoICR7aW5wdXRzWzBdfSA+PSAke2lucHV0c1sxXX0gfCAwIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPj0gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3QuaW5wdXRzID0gWyB4LHkgXVxuICBndC5uYW1lID0gJ2d0ZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gZ3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidndHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoJHtpbnB1dHNbIDAgXX0gKiAoICggJHtpbnB1dHNbMF19ID4gJHtpbnB1dHNbMV19ICkgfCAwICkgKWAgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSAqICggKCBpbnB1dHNbMF0gPiBpbnB1dHNbMV0gKSB8IDAgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBndHAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3RwLmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gZ3RwXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjE9MCApID0+IHtcbiAgbGV0IHVnZW4gPSB7XG4gICAgaW5wdXRzOiBbIGluMSBdLFxuICAgIG1lbW9yeTogeyB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4OiBudWxsIH0gfSxcbiAgICByZWNvcmRlcjogbnVsbCxcblxuICAgIGluKCB2ICkge1xuICAgICAgaWYoIGdlbi5oaXN0b3JpZXMuaGFzKCB2ICkgKXtcbiAgICAgICAgbGV0IG1lbW9IaXN0b3J5ID0gZ2VuLmhpc3Rvcmllcy5nZXQoIHYgKVxuICAgICAgICB1Z2VuLm5hbWUgPSBtZW1vSGlzdG9yeS5uYW1lXG4gICAgICAgIHJldHVybiBtZW1vSGlzdG9yeVxuICAgICAgfVxuXG4gICAgICBsZXQgb2JqID0ge1xuICAgICAgICBnZW4oKSB7XG4gICAgICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHVnZW4gKVxuXG4gICAgICAgICAgaWYoIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCApIHtcbiAgICAgICAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB1Z2VuLm1lbW9yeSApXG4gICAgICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gaW4xXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IGlkeCA9IHVnZW4ubWVtb3J5LnZhbHVlLmlkeFxuICAgICAgICAgIFxuICAgICAgICAgIGdlbi5hZGRUb0VuZEJsb2NrKCAnbWVtb3J5WyAnICsgaWR4ICsgJyBdID0gJyArIGlucHV0c1sgMCBdIClcbiAgICAgICAgICBcbiAgICAgICAgICAvLyByZXR1cm4gdWdlbiB0aGF0IGlzIGJlaW5nIHJlY29yZGVkIGluc3RlYWQgb2Ygc3NkLlxuICAgICAgICAgIC8vIHRoaXMgZWZmZWN0aXZlbHkgbWFrZXMgYSBjYWxsIHRvIHNzZC5yZWNvcmQoKSB0cmFuc3BhcmVudCB0byB0aGUgZ3JhcGguXG4gICAgICAgICAgLy8gcmVjb3JkaW5nIGlzIHRyaWdnZXJlZCBieSBwcmlvciBjYWxsIHRvIGdlbi5hZGRUb0VuZEJsb2NrLlxuICAgICAgICAgIGdlbi5oaXN0b3JpZXMuc2V0KCB2LCBvYmogKVxuXG4gICAgICAgICAgcmV0dXJuIGlucHV0c1sgMCBdXG4gICAgICAgIH0sXG4gICAgICAgIG5hbWU6IHVnZW4ubmFtZSArICdfaW4nK2dlbi5nZXRVSUQoKSxcbiAgICAgICAgbWVtb3J5OiB1Z2VuLm1lbW9yeVxuICAgICAgfVxuXG4gICAgICB0aGlzLmlucHV0c1sgMCBdID0gdlxuICAgICAgXG4gICAgICB1Z2VuLnJlY29yZGVyID0gb2JqXG5cbiAgICAgIHJldHVybiBvYmpcbiAgICB9LFxuICAgIFxuICAgIG91dDoge1xuICAgICAgICAgICAgXG4gICAgICBnZW4oKSB7XG4gICAgICAgIGlmKCB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgaWYoIGdlbi5oaXN0b3JpZXMuZ2V0KCB1Z2VuLmlucHV0c1swXSApID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBnZW4uaGlzdG9yaWVzLnNldCggdWdlbi5pbnB1dHNbMF0sIHVnZW4ucmVjb3JkZXIgKVxuICAgICAgICAgIH1cbiAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdWdlbi5tZW1vcnkudmFsdWUuaWR4IF0gPSBwYXJzZUZsb2F0KCBpbjEgKVxuICAgICAgICB9XG4gICAgICAgIGxldCBpZHggPSB1Z2VuLm1lbW9yeS52YWx1ZS5pZHhcbiAgICAgICAgIFxuICAgICAgICByZXR1cm4gJ21lbW9yeVsgJyArIGlkeCArICcgXSAnXG4gICAgICB9LFxuICAgIH0sXG5cbiAgICB1aWQ6IGdlbi5nZXRVSUQoKSxcbiAgfVxuICBcbiAgdWdlbi5vdXQubWVtb3J5ID0gdWdlbi5tZW1vcnkgXG5cbiAgdWdlbi5uYW1lID0gJ2hpc3RvcnknICsgdWdlbi51aWRcbiAgdWdlbi5vdXQubmFtZSA9IHVnZW4ubmFtZSArICdfb3V0J1xuICB1Z2VuLmluLl9uYW1lICA9IHVnZW4ubmFtZSA9ICdfaW4nXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldCggdiApIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IFxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonaWZlbHNlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvbmRpdGlvbmFscyA9IHRoaXMuaW5wdXRzWzBdLFxuICAgICAgICBkZWZhdWx0VmFsdWUgPSBnZW4uZ2V0SW5wdXQoIGNvbmRpdGlvbmFsc1sgY29uZGl0aW9uYWxzLmxlbmd0aCAtIDFdICksXG4gICAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX1fb3V0ID0gJHtkZWZhdWx0VmFsdWV9XFxuYCBcblxuICAgIC8vY29uc29sZS5sb2coICdjb25kaXRpb25hbHM6JywgdGhpcy5uYW1lLCBjb25kaXRpb25hbHMgKVxuXG4gICAgLy9jb25zb2xlLmxvZyggJ2RlZmF1bHRWYWx1ZTonLCBkZWZhdWx0VmFsdWUgKVxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBjb25kaXRpb25hbHMubGVuZ3RoIC0gMjsgaSs9IDIgKSB7XG4gICAgICBsZXQgaXNFbmRCbG9jayA9IGkgPT09IGNvbmRpdGlvbmFscy5sZW5ndGggLSAzLFxuICAgICAgICAgIGNvbmQgID0gZ2VuLmdldElucHV0KCBjb25kaXRpb25hbHNbIGkgXSApLFxuICAgICAgICAgIHByZWJsb2NrID0gY29uZGl0aW9uYWxzWyBpKzEgXSxcbiAgICAgICAgICBibG9jaywgYmxvY2tOYW1lLCBvdXRwdXRcblxuICAgICAgLy9jb25zb2xlLmxvZyggJ3BiJywgcHJlYmxvY2sgKVxuXG4gICAgICBpZiggdHlwZW9mIHByZWJsb2NrID09PSAnbnVtYmVyJyApe1xuICAgICAgICBibG9jayA9IHByZWJsb2NrXG4gICAgICAgIGJsb2NrTmFtZSA9IG51bGxcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggZ2VuLm1lbW9bIHByZWJsb2NrLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIC8vIHVzZWQgdG8gcGxhY2UgYWxsIGNvZGUgZGVwZW5kZW5jaWVzIGluIGFwcHJvcHJpYXRlIGJsb2Nrc1xuICAgICAgICAgIGdlbi5zdGFydExvY2FsaXplKClcblxuICAgICAgICAgIGdlbi5nZXRJbnB1dCggcHJlYmxvY2sgKVxuXG4gICAgICAgICAgYmxvY2sgPSBnZW4uZW5kTG9jYWxpemUoKVxuICAgICAgICAgIGJsb2NrTmFtZSA9IGJsb2NrWzBdXG4gICAgICAgICAgYmxvY2sgPSBibG9ja1sgMSBdLmpvaW4oJycpXG4gICAgICAgICAgYmxvY2sgPSAnICAnICsgYmxvY2sucmVwbGFjZSggL1xcbi9naSwgJ1xcbiAgJyApXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJsb2NrID0gJydcbiAgICAgICAgICBibG9ja05hbWUgPSBnZW4ubWVtb1sgcHJlYmxvY2submFtZSBdXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb3V0cHV0ID0gYmxvY2tOYW1lID09PSBudWxsID8gXG4gICAgICAgIGAgICR7dGhpcy5uYW1lfV9vdXQgPSAke2Jsb2NrfWAgOlxuICAgICAgICBgJHtibG9ja30gICR7dGhpcy5uYW1lfV9vdXQgPSAke2Jsb2NrTmFtZX1gXG4gICAgICBcbiAgICAgIGlmKCBpPT09MCApIG91dCArPSAnICdcbiAgICAgIG91dCArPSBcbmAgaWYoICR7Y29uZH0gPT09IDEgKSB7XG4ke291dHB1dH1cbiAgfWBcblxuICAgICAgaWYoICFpc0VuZEJsb2NrICkge1xuICAgICAgICBvdXQgKz0gYCBlbHNlYFxuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCArPSBgXFxuYFxuICAgICAgfVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1fb3V0YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfV9vdXRgLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5hcmdzICApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgY29uZGl0aW9ucyA9IEFycmF5LmlzQXJyYXkoIGFyZ3NbMF0gKSA/IGFyZ3NbMF0gOiBhcmdzXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGNvbmRpdGlvbnMgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidpbicsXG5cbiAgZ2VuKCkge1xuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcblxuICAgIGlmKCBpc1dvcmtsZXQgKSB7XG4gICAgICBnZW4uaW5wdXRzLmFkZCggdGhpcyApXG4gICAgfWVsc2V7XG4gICAgICBnZW4ucGFyYW1ldGVycy5hZGQoIHRoaXMubmFtZSApXG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gaXNXb3JrbGV0ID8gdGhpcy5uYW1lICsgJ1tpXScgOiB0aGlzLm5hbWVcblxuICAgIHJldHVybiB0aGlzLm5hbWVcbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIG5hbWUsIGlucHV0TnVtYmVyPTAsIGNoYW5uZWxOdW1iZXI9MCApID0+IHtcbiAgbGV0IGlucHV0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGlucHV0LmlkICAgPSBnZW4uZ2V0VUlEKClcbiAgaW5wdXQubmFtZSA9IG5hbWUgIT09IHVuZGVmaW5lZCA/IG5hbWUgOiBgJHtpbnB1dC5iYXNlbmFtZX0ke2lucHV0LmlkfWBcbiAgaW5wdXQuaW5wdXROdW1iZXIgPSBpbnB1dE51bWJlclxuICBpbnB1dC5jaGFubmVsTnVtYmVyID0gY2hhbm5lbE51bWJlclxuXG4gIGlucHV0WzBdID0ge1xuICAgIGdlbigpIHtcbiAgICAgIGlmKCAhIGdlbi5wYXJhbWV0ZXJzLmluY2x1ZGVzKCBpbnB1dC5uYW1lICkgKSBnZW4ucGFyYW1ldGVycy5wdXNoKCBpbnB1dC5uYW1lIClcbiAgICAgIHJldHVybiBpbnB1dC5uYW1lICsgJ1swXSdcbiAgICB9XG4gIH1cbiAgaW5wdXRbMV0gPSB7XG4gICAgZ2VuKCkge1xuICAgICAgaWYoICEgZ2VuLnBhcmFtZXRlcnMuaW5jbHVkZXMoIGlucHV0Lm5hbWUgKSApIGdlbi5wYXJhbWV0ZXJzLnB1c2goIGlucHV0Lm5hbWUgKVxuICAgICAgcmV0dXJuIGlucHV0Lm5hbWUgKyAnWzFdJ1xuICAgIH1cbiAgfVxuXG5cbiAgcmV0dXJuIGlucHV0XG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgbGlicmFyeSA9IHtcbiAgZXhwb3J0KCBkZXN0aW5hdGlvbiApIHtcbiAgICBpZiggZGVzdGluYXRpb24gPT09IHdpbmRvdyApIHtcbiAgICAgIGRlc3RpbmF0aW9uLnNzZCA9IGxpYnJhcnkuaGlzdG9yeSAgICAvLyBoaXN0b3J5IGlzIHdpbmRvdyBvYmplY3QgcHJvcGVydHksIHNvIHVzZSBzc2QgYXMgYWxpYXNcbiAgICAgIGRlc3RpbmF0aW9uLmlucHV0ID0gbGlicmFyeS5pbiAgICAgICAvLyBpbiBpcyBhIGtleXdvcmQgaW4gamF2YXNjcmlwdFxuICAgICAgZGVzdGluYXRpb24udGVybmFyeSA9IGxpYnJhcnkuc3dpdGNoIC8vIHN3aXRjaCBpcyBhIGtleXdvcmQgaW4gamF2YXNjcmlwdFxuXG4gICAgICBkZWxldGUgbGlicmFyeS5oaXN0b3J5XG4gICAgICBkZWxldGUgbGlicmFyeS5pblxuICAgICAgZGVsZXRlIGxpYnJhcnkuc3dpdGNoXG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbiggZGVzdGluYXRpb24sIGxpYnJhcnkgKVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBsaWJyYXJ5LCAnc2FtcGxlcmF0ZScsIHtcbiAgICAgIGdldCgpIHsgcmV0dXJuIGxpYnJhcnkuZ2VuLnNhbXBsZXJhdGUgfSxcbiAgICAgIHNldCh2KSB7fVxuICAgIH0pXG5cbiAgICBsaWJyYXJ5LmluID0gZGVzdGluYXRpb24uaW5wdXRcbiAgICBsaWJyYXJ5Lmhpc3RvcnkgPSBkZXN0aW5hdGlvbi5zc2RcbiAgICBsaWJyYXJ5LnN3aXRjaCA9IGRlc3RpbmF0aW9uLnRlcm5hcnlcblxuICAgIGRlc3RpbmF0aW9uLmNsaXAgPSBsaWJyYXJ5LmNsYW1wXG4gIH0sXG5cbiAgZ2VuOiAgICAgIHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgXG4gIGFiczogICAgICByZXF1aXJlKCAnLi9hYnMuanMnICksXG4gIHJvdW5kOiAgICByZXF1aXJlKCAnLi9yb3VuZC5qcycgKSxcbiAgcGFyYW06ICAgIHJlcXVpcmUoICcuL3BhcmFtLmpzJyApLFxuICBhZGQ6ICAgICAgcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICBzdWI6ICAgICAgcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICBtdWw6ICAgICAgcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICBkaXY6ICAgICAgcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICBhY2N1bTogICAgcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gIGNvdW50ZXI6ICByZXF1aXJlKCAnLi9jb3VudGVyLmpzJyApLFxuICBzaW46ICAgICAgcmVxdWlyZSggJy4vc2luLmpzJyApLFxuICBjb3M6ICAgICAgcmVxdWlyZSggJy4vY29zLmpzJyApLFxuICB0YW46ICAgICAgcmVxdWlyZSggJy4vdGFuLmpzJyApLFxuICB0YW5oOiAgICAgcmVxdWlyZSggJy4vdGFuaC5qcycgKSxcbiAgYXNpbjogICAgIHJlcXVpcmUoICcuL2FzaW4uanMnICksXG4gIGFjb3M6ICAgICByZXF1aXJlKCAnLi9hY29zLmpzJyApLFxuICBhdGFuOiAgICAgcmVxdWlyZSggJy4vYXRhbi5qcycgKSwgIFxuICBwaGFzb3I6ICAgcmVxdWlyZSggJy4vcGhhc29yLmpzJyApLFxuICBkYXRhOiAgICAgcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgcGVlazogICAgIHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gIGN5Y2xlOiAgICByZXF1aXJlKCAnLi9jeWNsZS5qcycgKSxcbiAgaGlzdG9yeTogIHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gIGRlbHRhOiAgICByZXF1aXJlKCAnLi9kZWx0YS5qcycgKSxcbiAgZmxvb3I6ICAgIHJlcXVpcmUoICcuL2Zsb29yLmpzJyApLFxuICBjZWlsOiAgICAgcmVxdWlyZSggJy4vY2VpbC5qcycgKSxcbiAgbWluOiAgICAgIHJlcXVpcmUoICcuL21pbi5qcycgKSxcbiAgbWF4OiAgICAgIHJlcXVpcmUoICcuL21heC5qcycgKSxcbiAgc2lnbjogICAgIHJlcXVpcmUoICcuL3NpZ24uanMnICksXG4gIGRjYmxvY2s6ICByZXF1aXJlKCAnLi9kY2Jsb2NrLmpzJyApLFxuICBtZW1vOiAgICAgcmVxdWlyZSggJy4vbWVtby5qcycgKSxcbiAgcmF0ZTogICAgIHJlcXVpcmUoICcuL3JhdGUuanMnICksXG4gIHdyYXA6ICAgICByZXF1aXJlKCAnLi93cmFwLmpzJyApLFxuICBtaXg6ICAgICAgcmVxdWlyZSggJy4vbWl4LmpzJyApLFxuICBjbGFtcDogICAgcmVxdWlyZSggJy4vY2xhbXAuanMnICksXG4gIHBva2U6ICAgICByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICBkZWxheTogICAgcmVxdWlyZSggJy4vZGVsYXkuanMnICksXG4gIGZvbGQ6ICAgICByZXF1aXJlKCAnLi9mb2xkLmpzJyApLFxuICBtb2QgOiAgICAgcmVxdWlyZSggJy4vbW9kLmpzJyApLFxuICBzYWggOiAgICAgcmVxdWlyZSggJy4vc2FoLmpzJyApLFxuICBub2lzZTogICAgcmVxdWlyZSggJy4vbm9pc2UuanMnICksXG4gIG5vdDogICAgICByZXF1aXJlKCAnLi9ub3QuanMnICksXG4gIGd0OiAgICAgICByZXF1aXJlKCAnLi9ndC5qcycgKSxcbiAgZ3RlOiAgICAgIHJlcXVpcmUoICcuL2d0ZS5qcycgKSxcbiAgbHQ6ICAgICAgIHJlcXVpcmUoICcuL2x0LmpzJyApLCBcbiAgbHRlOiAgICAgIHJlcXVpcmUoICcuL2x0ZS5qcycgKSwgXG4gIGJvb2w6ICAgICByZXF1aXJlKCAnLi9ib29sLmpzJyApLFxuICBnYXRlOiAgICAgcmVxdWlyZSggJy4vZ2F0ZS5qcycgKSxcbiAgdHJhaW46ICAgIHJlcXVpcmUoICcuL3RyYWluLmpzJyApLFxuICBzbGlkZTogICAgcmVxdWlyZSggJy4vc2xpZGUuanMnICksXG4gIGluOiAgICAgICByZXF1aXJlKCAnLi9pbi5qcycgKSxcbiAgdDYwOiAgICAgIHJlcXVpcmUoICcuL3Q2MC5qcycpLFxuICBtdG9mOiAgICAgcmVxdWlyZSggJy4vbXRvZi5qcycpLFxuICBsdHA6ICAgICAgcmVxdWlyZSggJy4vbHRwLmpzJyksICAgICAgICAvLyBUT0RPOiB0ZXN0XG4gIGd0cDogICAgICByZXF1aXJlKCAnLi9ndHAuanMnKSwgICAgICAgIC8vIFRPRE86IHRlc3RcbiAgc3dpdGNoOiAgIHJlcXVpcmUoICcuL3N3aXRjaC5qcycgKSxcbiAgbXN0b3NhbXBzOnJlcXVpcmUoICcuL21zdG9zYW1wcy5qcycgKSwgLy8gVE9ETzogbmVlZHMgdGVzdCxcbiAgc2VsZWN0b3I6IHJlcXVpcmUoICcuL3NlbGVjdG9yLmpzJyApLFxuICB1dGlsaXRpZXM6cmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApLFxuICBwb3c6ICAgICAgcmVxdWlyZSggJy4vcG93LmpzJyApLFxuICBhdHRhY2s6ICAgcmVxdWlyZSggJy4vYXR0YWNrLmpzJyApLFxuICBkZWNheTogICAgcmVxdWlyZSggJy4vZGVjYXkuanMnICksXG4gIHdpbmRvd3M6ICByZXF1aXJlKCAnLi93aW5kb3dzLmpzJyApLFxuICBlbnY6ICAgICAgcmVxdWlyZSggJy4vZW52LmpzJyApLFxuICBhZDogICAgICAgcmVxdWlyZSggJy4vYWQuanMnICApLFxuICBhZHNyOiAgICAgcmVxdWlyZSggJy4vYWRzci5qcycgKSxcbiAgaWZlbHNlOiAgIHJlcXVpcmUoICcuL2lmZWxzZWlmLmpzJyApLFxuICBiYW5nOiAgICAgcmVxdWlyZSggJy4vYmFuZy5qcycgKSxcbiAgYW5kOiAgICAgIHJlcXVpcmUoICcuL2FuZC5qcycgKSxcbiAgcGFuOiAgICAgIHJlcXVpcmUoICcuL3Bhbi5qcycgKSxcbiAgZXE6ICAgICAgIHJlcXVpcmUoICcuL2VxLmpzJyApLFxuICBuZXE6ICAgICAgcmVxdWlyZSggJy4vbmVxLmpzJyApLFxuICBleHA6ICAgICAgcmVxdWlyZSggJy4vZXhwLmpzJyApLFxuICBzZXE6ICAgICAgcmVxdWlyZSggJy4vc2VxLmpzJyApXG59XG5cbmxpYnJhcnkuZ2VuLmxpYiA9IGxpYnJhcnlcblxubW9kdWxlLmV4cG9ydHMgPSBsaWJyYXJ5XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2x0JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCgoICR7aW5wdXRzWzBdfSA8ICR7aW5wdXRzWzFdfSkgfCAwICApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdIDwgaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGx0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0LmlucHV0cyA9IFsgeCx5IF1cbiAgbHQubmFtZSA9IGx0LmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGx0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbHRlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCggJHtpbnB1dHNbMF19IDw9ICR7aW5wdXRzWzFdfSB8IDAgIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPD0gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGx0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0LmlucHV0cyA9IFsgeCx5IF1cbiAgbHQubmFtZSA9ICdsdGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGx0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbHRwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgPSBgKCR7aW5wdXRzWyAwIF19ICogKCggJHtpbnB1dHNbMF19IDwgJHtpbnB1dHNbMV19ICkgfCAwICkgKWAgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSAqICgoIGlucHV0c1swXSA8IGlucHV0c1sxXSApIHwgMCApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGx0cCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBsdHAuaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBsdHBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidtYXgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBpc1dvcmtsZXQgPyAnTWF0aC5tYXgnIDogTWF0aC5tYXggfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfW1heCggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLm1heCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICksIHBhcnNlRmxvYXQoIGlucHV0c1sxXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbWF4ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1heC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIG1heFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J21lbW8nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKGluMSxtZW1vTmFtZSkgPT4ge1xuICBsZXQgbWVtbyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIG1lbW8uaW5wdXRzID0gWyBpbjEgXVxuICBtZW1vLmlkICAgPSBnZW4uZ2V0VUlEKClcbiAgbWVtby5uYW1lID0gbWVtb05hbWUgIT09IHVuZGVmaW5lZCA/IG1lbW9OYW1lICsgJ18nICsgZ2VuLmdldFVJRCgpIDogYCR7bWVtby5iYXNlbmFtZX0ke21lbW8uaWR9YFxuXG4gIHJldHVybiBtZW1vXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbWluJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGgubWluJyA6IE1hdGgubWluIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1taW4oICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5taW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IG1pbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtaW4uaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBtaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBhZGQgPSByZXF1aXJlKCcuL2FkZC5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIsIHQ9LjUgKSA9PiB7XG4gIGxldCB1Z2VuID0gbWVtbyggYWRkKCBtdWwoaW4xLCBzdWIoMSx0ICkgKSwgbXVsKCBpbjIsIHQgKSApIClcbiAgdWdlbi5uYW1lID0gJ21peCcgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IG1vZCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgZGlmZiA9IDAsIFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICAgIG1vZEF0RW5kID0gZmFsc2VcblxuICAgICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgICBsZXQgaXNOdW1iZXJVZ2VuID0gaXNOYU4oIHYgKSxcbiAgICAgICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgJSB2XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9ICUgJHt2fWBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnICUgJyBcbiAgICAgIH0pXG5cbiAgICAgIG91dCArPSAnKSdcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIG1vZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidtc3Rvc2FtcHMnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHJldHVyblZhbHVlXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lIH0gPSAke2dlbi5zYW1wbGVyYXRlfSAvIDEwMDAgKiAke2lucHV0c1swXX0gXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBnZW4uc2FtcGxlcmF0ZSAvIDEwMDAgKiB0aGlzLmlucHV0c1swXVxuXG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH0gICAgXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbXN0b3NhbXBzID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1zdG9zYW1wcy5pbnB1dHMgPSBbIHggXVxuICBtc3Rvc2FtcHMubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG1zdG9zYW1wc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J210b2YnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYCggJHt0aGlzLnR1bmluZ30gKiBnZW4uZXhwKCAuMDU3NzYyMjY1ICogKCR7aW5wdXRzWzBdfSAtIDY5KSApIClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gdGhpcy50dW5pbmcgKiBNYXRoLmV4cCggLjA1Nzc2MjI2NSAqICggaW5wdXRzWzBdIC0gNjkpIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCB4LCBwcm9wcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IHR1bmluZzo0NDAgfVxuICBcbiAgaWYoIHByb3BzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBwcm9wcy5kZWZhdWx0cyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgZGVmYXVsdHMgKVxuICB1Z2VuLmlucHV0cyA9IFsgeCBdXG4gIFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdtdWwnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCxcbiAgICAgICAgc3VtID0gMSwgbnVtQ291bnQgPSAwLCBtdWxBdEVuZCA9IGZhbHNlLCBhbHJlYWR5RnVsbFN1bW1lZCA9IHRydWVcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaXNOYU4oIHYgKSApIHtcbiAgICAgICAgb3V0ICs9IHZcbiAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgIG11bEF0RW5kID0gdHJ1ZVxuICAgICAgICAgIG91dCArPSAnICogJ1xuICAgICAgICB9XG4gICAgICAgIGFscmVhZHlGdWxsU3VtbWVkID0gZmFsc2VcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggaSA9PT0gMCApIHtcbiAgICAgICAgICBzdW0gPSB2XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHN1bSAqPSBwYXJzZUZsb2F0KCB2IClcbiAgICAgICAgfVxuICAgICAgICBudW1Db3VudCsrXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmKCBudW1Db3VudCA+IDAgKSB7XG4gICAgICBvdXQgKz0gbXVsQXRFbmQgfHwgYWxyZWFkeUZ1bGxTdW1tZWQgPyBzdW0gOiAnICogJyArIHN1bVxuICAgIH1cblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGNvbnN0IG11bCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIG11bCwge1xuICAgICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgICBpbnB1dHM6IGFyZ3MsXG4gIH0pXG4gIFxuICBtdWwubmFtZSA9IG11bC5iYXNlbmFtZSArIG11bC5pZFxuXG4gIHJldHVybiBtdWxcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J25lcScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gLyp0aGlzLmlucHV0c1swXSAhPT0gdGhpcy5pbnB1dHNbMV0gPyAxIDoqLyBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSAhPT0gJHtpbnB1dHNbMV19KSB8IDBcXG5cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidub2lzZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXRcblxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ25vaXNlJyA6IGlzV29ya2xldCA/ICdNYXRoLnJhbmRvbScgOiBNYXRoLnJhbmRvbSB9KVxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9ICR7cmVmfW5vaXNlKClcXG5gXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IG5vaXNlID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBub2lzZS5uYW1lID0gcHJvdG8ubmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBub2lzZVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J25vdCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApICkge1xuICAgICAgb3V0ID0gYCggJHtpbnB1dHNbMF19ID09PSAwID8gMSA6IDAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gIWlucHV0c1swXSA9PT0gMCA/IDEgOiAwXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbm90ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG5vdC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBub3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGFuJywgXG4gIGluaXRUYWJsZSgpIHsgICAgXG4gICAgbGV0IGJ1ZmZlckwgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0ICksXG4gICAgICAgIGJ1ZmZlclIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICAgIGNvbnN0IGFuZ1RvUmFkID0gTWF0aC5QSSAvIDE4MFxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgMTAyNDsgaSsrICkgeyBcbiAgICAgIGxldCBwYW4gPSBpICogKCA5MCAvIDEwMjQgKVxuICAgICAgYnVmZmVyTFtpXSA9IE1hdGguY29zKCBwYW4gKiBhbmdUb1JhZCApIFxuICAgICAgYnVmZmVyUltpXSA9IE1hdGguc2luKCBwYW4gKiBhbmdUb1JhZCApXG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMucGFuTCA9IGRhdGEoIGJ1ZmZlckwsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSlcbiAgICBnZW4uZ2xvYmFscy5wYW5SID0gZGF0YSggYnVmZmVyUiwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9KVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGxlZnRJbnB1dCwgcmlnaHRJbnB1dCwgcGFuID0uNSwgcHJvcGVydGllcyApID0+IHtcbiAgaWYoIGdlbi5nbG9iYWxzLnBhbkwgPT09IHVuZGVmaW5lZCApIHByb3RvLmluaXRUYWJsZSgpXG5cbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGxlZnRJbnB1dCwgcmlnaHRJbnB1dCBdLFxuICAgIGxlZnQ6ICAgIG11bCggbGVmdElucHV0LCBwZWVrKCBnZW4uZ2xvYmFscy5wYW5MLCBwYW4sIHsgYm91bmRtb2RlOidjbGFtcCcgfSkgKSxcbiAgICByaWdodDogICBtdWwoIHJpZ2h0SW5wdXQsIHBlZWsoIGdlbi5nbG9iYWxzLnBhblIsIHBhbiwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSApXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3BhcmFtJyxcblxuICBnZW4oKSB7XG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBcbiAgICBnZW4ucGFyYW1zLmFkZCggdGhpcyApXG5cbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG5cbiAgICBpZiggaXNXb3JrbGV0ICkgZ2VuLnBhcmFtZXRlcnMuYWRkKCB0aGlzLm5hbWUgKVxuXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMuaW5pdGlhbFZhbHVlXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpc1dvcmtsZXQgPyB0aGlzLm5hbWUgKyAnW2ldJyA6IGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWBcblxuICAgIHJldHVybiBnZW4ubWVtb1sgdGhpcy5uYW1lIF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHByb3BOYW1lPTAsIHZhbHVlPTAsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBpZiggdHlwZW9mIHByb3BOYW1lICE9PSAnc3RyaW5nJyApIHtcbiAgICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSBwcm9wTmFtZVxuICB9ZWxzZXtcbiAgICB1Z2VuLm5hbWUgPSBwcm9wTmFtZVxuICAgIHVnZW4uaW5pdGlhbFZhbHVlID0gdmFsdWVcbiAgfVxuXG4gIHVnZW4ubWluID0gbWluXG4gIHVnZW4ubWF4ID0gbWF4XG5cbiAgLy8gZm9yIHN0b3Jpbmcgd29ya2xldCBub2RlcyBvbmNlIHRoZXkncmUgaW5zdGFudGlhdGVkXG4gIHVnZW4ud2FhcGkgPSBudWxsXG5cbiAgdWdlbi5pc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldCggdiApIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIGlmKCB0aGlzLmlzV29ya2xldCAmJiB0aGlzLndhYXBpICE9PSBudWxsICkge1xuICAgICAgICAgIHRoaXMud2FhcGkudmFsdWUgPSB2XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2XG4gICAgICAgIH0gXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgICAgZGF0YVVnZW4gPSByZXF1aXJlKCcuL2RhdGEuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwZWVrJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0LCBmdW5jdGlvbkJvZHksIG5leHQsIGxlbmd0aElzTG9nMiwgaWR4XG4gICAgXG4gICAgaWR4ID0gaW5wdXRzWzFdXG4gICAgbGVuZ3RoSXNMb2cyID0gKE1hdGgubG9nMiggdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKSB8IDApICA9PT0gTWF0aC5sb2cyKCB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCApXG5cbiAgICBpZiggdGhpcy5tb2RlICE9PSAnc2ltcGxlJyApIHtcblxuICAgIGZ1bmN0aW9uQm9keSA9IGAgIHZhciAke3RoaXMubmFtZX1fZGF0YUlkeCAgPSAke2lkeH0sIFxuICAgICAgJHt0aGlzLm5hbWV9X3BoYXNlID0gJHt0aGlzLm1vZGUgPT09ICdzYW1wbGVzJyA/IGlucHV0c1swXSA6IGlucHV0c1swXSArICcgKiAnICsgKHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoKSB9LCBcbiAgICAgICR7dGhpcy5uYW1lfV9pbmRleCA9ICR7dGhpcy5uYW1lfV9waGFzZSB8IDAsXFxuYFxuXG4gICAgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnd3JhcCcgKSB7XG4gICAgICBuZXh0ID0gbGVuZ3RoSXNMb2cyID9cbiAgICAgIGAoICR7dGhpcy5uYW1lfV9pbmRleCArIDEgKSAmICgke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSAtIDEpYCA6XG4gICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMSA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSA/ICR7dGhpcy5uYW1lfV9pbmRleCArIDEgLSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG4gICAgfWVsc2UgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnY2xhbXAnICkge1xuICAgICAgbmV4dCA9IFxuICAgICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMSA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gPyAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gOiAke3RoaXMubmFtZX1faW5kZXggKyAxYFxuICAgIH0gZWxzZSBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdmb2xkJyB8fCB0aGlzLmJvdW5kbW9kZSA9PT0gJ21pcnJvcicgKSB7XG4gICAgICBuZXh0ID0gXG4gICAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA/ICR7dGhpcy5uYW1lfV9pbmRleCAtICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG4gICAgfWVsc2V7XG4gICAgICAgbmV4dCA9IFxuICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDFgICAgICBcbiAgICB9XG5cbiAgICBpZiggdGhpcy5pbnRlcnAgPT09ICdsaW5lYXInICkgeyAgICAgIFxuICAgIGZ1bmN0aW9uQm9keSArPSBgICAgICAgJHt0aGlzLm5hbWV9X2ZyYWMgID0gJHt0aGlzLm5hbWV9X3BoYXNlIC0gJHt0aGlzLm5hbWV9X2luZGV4LFxuICAgICAgJHt0aGlzLm5hbWV9X2Jhc2UgID0gbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICAke3RoaXMubmFtZX1faW5kZXggXSxcbiAgICAgICR7dGhpcy5uYW1lfV9uZXh0ICA9ICR7bmV4dH0sYFxuICAgICAgXG4gICAgICBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdpZ25vcmUnICkge1xuICAgICAgICBmdW5jdGlvbkJvZHkgKz0gYFxuICAgICAgJHt0aGlzLm5hbWV9X291dCAgID0gJHt0aGlzLm5hbWV9X2luZGV4ID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSB8fCAke3RoaXMubmFtZX1faW5kZXggPCAwID8gMCA6ICR7dGhpcy5uYW1lfV9iYXNlICsgJHt0aGlzLm5hbWV9X2ZyYWMgKiAoIG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAke3RoaXMubmFtZX1fbmV4dCBdIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKVxcblxcbmBcbiAgICAgIH1lbHNle1xuICAgICAgICBmdW5jdGlvbkJvZHkgKz0gYFxuICAgICAgJHt0aGlzLm5hbWV9X291dCAgID0gJHt0aGlzLm5hbWV9X2Jhc2UgKyAke3RoaXMubmFtZX1fZnJhYyAqICggbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICR7dGhpcy5uYW1lfV9uZXh0IF0gLSAke3RoaXMubmFtZX1fYmFzZSApXFxuXFxuYFxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgZnVuY3Rpb25Cb2R5ICs9IGAgICAgICAke3RoaXMubmFtZX1fb3V0ID0gbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICR7dGhpcy5uYW1lfV9pbmRleCBdXFxuXFxuYFxuICAgIH1cblxuICAgIH0gZWxzZSB7IC8vIG1vZGUgaXMgc2ltcGxlXG4gICAgICBmdW5jdGlvbkJvZHkgPSBgbWVtb3J5WyAke2lkeH0gKyAkeyBpbnB1dHNbMF0gfSBdYFxuICAgICAgXG4gICAgICByZXR1cm4gZnVuY3Rpb25Cb2R5XG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ19vdXQnXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUrJ19vdXQnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGRlZmF1bHRzIDogeyBjaGFubmVsczoxLCBtb2RlOidwaGFzZScsIGludGVycDonbGluZWFyJywgYm91bmRtb2RlOid3cmFwJyB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbnB1dF9kYXRhLCBpbmRleD0wLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICAvL2NvbnNvbGUubG9nKCBkYXRhVWdlbiwgZ2VuLmRhdGEgKVxuXG4gIC8vIFhYWCB3aHkgaXMgZGF0YVVnZW4gbm90IHRoZSBhY3R1YWwgZnVuY3Rpb24/IHNvbWUgdHlwZSBvZiBicm93c2VyaWZ5IG5vbnNlbnNlLi4uXG4gIGNvbnN0IGZpbmFsRGF0YSA9IHR5cGVvZiBpbnB1dF9kYXRhLmJhc2VuYW1lID09PSAndW5kZWZpbmVkJyA/IGdlbi5saWIuZGF0YSggaW5wdXRfZGF0YSApIDogaW5wdXRfZGF0YVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIFxuICAgIHsgXG4gICAgICAnZGF0YSc6ICAgICBmaW5hbERhdGEsXG4gICAgICBkYXRhTmFtZTogICBmaW5hbERhdGEubmFtZSxcbiAgICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICAgIGlucHV0czogICAgIFsgaW5kZXgsIGZpbmFsRGF0YSBdLFxuICAgIH0sXG4gICAgcHJvdG8uZGVmYXVsdHMsXG4gICAgcHJvcGVydGllcyBcbiAgKVxuICBcbiAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW0gPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBtdWwgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBwcm90byA9IHsgYmFzZW5hbWU6J3BoYXNvcicgfSxcbiAgICBkaXYgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKVxuXG5jb25zdCBkZWZhdWx0cyA9IHsgbWluOiAtMSwgbWF4OiAxIH1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeSA9IDEsIHJlc2V0ID0gMCwgX3Byb3BzICkgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBkZWZhdWx0cywgX3Byb3BzIClcblxuICBjb25zdCByYW5nZSA9IHByb3BzLm1heCAtIHByb3BzLm1pblxuXG4gIGNvbnN0IHVnZW4gPSB0eXBlb2YgZnJlcXVlbmN5ID09PSAnbnVtYmVyJyBcbiAgICA/IGFjY3VtKCAoZnJlcXVlbmN5ICogcmFuZ2UpIC8gZ2VuLnNhbXBsZXJhdGUsIHJlc2V0LCBwcm9wcyApIFxuICAgIDogYWNjdW0oIFxuICAgICAgICBkaXYoIFxuICAgICAgICAgIG11bCggZnJlcXVlbmN5LCByYW5nZSApLFxuICAgICAgICAgIGdlbi5zYW1wbGVyYXRlXG4gICAgICAgICksIFxuICAgICAgICByZXNldCwgcHJvcHMgXG4gICAgKVxuXG4gIHVnZW4ubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsICA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgd3JhcCA9IHJlcXVpcmUoJy4vd3JhcC5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3Bva2UnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZGF0YU5hbWUgPSAnbWVtb3J5JyxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBpZHgsIG91dCwgd3JhcHBlZFxuICAgIFxuICAgIGlkeCA9IHRoaXMuZGF0YS5nZW4oKVxuXG4gICAgLy9nZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIC8vd3JhcHBlZCA9IHdyYXAoIHRoaXMuaW5wdXRzWzFdLCAwLCB0aGlzLmRhdGFMZW5ndGggKS5nZW4oKVxuICAgIC8vaWR4ID0gd3JhcHBlZFswXVxuICAgIC8vZ2VuLmZ1bmN0aW9uQm9keSArPSB3cmFwcGVkWzFdXG4gICAgbGV0IG91dHB1dFN0ciA9IHRoaXMuaW5wdXRzWzFdID09PSAwID9cbiAgICAgIGAgICR7ZGF0YU5hbWV9WyAke2lkeH0gXSA9ICR7aW5wdXRzWzBdfVxcbmAgOlxuICAgICAgYCAgJHtkYXRhTmFtZX1bICR7aWR4fSArICR7aW5wdXRzWzFdfSBdID0gJHtpbnB1dHNbMF19XFxuYFxuXG4gICAgaWYoIHRoaXMuaW5saW5lID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IG91dHB1dFN0clxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIFsgdGhpcy5pbmxpbmUsIG91dHB1dFN0ciBdXG4gICAgfVxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9ICggZGF0YSwgdmFsdWUsIGluZGV4LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY2hhbm5lbHM6MSB9IFxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBkYXRhLFxuICAgIGRhdGFOYW1lOiAgIGRhdGEubmFtZSxcbiAgICBkYXRhTGVuZ3RoOiBkYXRhLmJ1ZmZlci5sZW5ndGgsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgdmFsdWUsIGluZGV4IF0sXG4gIH0sXG4gIGRlZmF1bHRzIClcblxuXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZFxuICBcbiAgZ2VuLmhpc3Rvcmllcy5zZXQoIHVnZW4ubmFtZSwgdWdlbiApXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncG93JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdwb3cnOiBpc1dvcmtsZXQgPyAnTWF0aC5wb3cnIDogTWF0aC5wb3cgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXBvdyggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIHR5cGVvZiBpbnB1dHNbMF0gPT09ICdzdHJpbmcnICYmIGlucHV0c1swXVswXSA9PT0gJygnICkge1xuICAgICAgICBpbnB1dHNbMF0gPSBpbnB1dHNbMF0uc2xpY2UoMSwtMSlcbiAgICAgIH1cbiAgICAgIGlmKCB0eXBlb2YgaW5wdXRzWzFdID09PSAnc3RyaW5nJyAmJiBpbnB1dHNbMV1bMF0gPT09ICcoJyApIHtcbiAgICAgICAgaW5wdXRzWzFdID0gaW5wdXRzWzFdLnNsaWNlKDEsLTEpXG4gICAgICB9XG5cbiAgICAgIG91dCA9IE1hdGgucG93KCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IHBvdyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBwb3cuaW5wdXRzID0gWyB4LHkgXVxuICBwb3cuaWQgPSBnZW4uZ2V0VUlEKClcbiAgcG93Lm5hbWUgPSBgJHtwb3cuYmFzZW5hbWV9e3Bvdy5pZH1gXG5cbiAgcmV0dXJuIHBvd1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGRlbHRhICAgPSByZXF1aXJlKCAnLi9kZWx0YS5qcycgKSxcbiAgICB3cmFwICAgID0gcmVxdWlyZSggJy4vd3JhcC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidyYXRlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcGhhc2UgID0gaGlzdG9yeSgpLFxuICAgICAgICBpbk1pbnVzMSA9IGhpc3RvcnkoKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZmlsdGVyLCBzdW0sIG91dFxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9kaWZmID0gJHtpbnB1dHNbMF19IC0gJHtnZW5OYW1lfS5sYXN0U2FtcGxlXG4gIGlmKCAke3RoaXMubmFtZX1fZGlmZiA8IC0uNSApICR7dGhpcy5uYW1lfV9kaWZmICs9IDFcbiAgJHtnZW5OYW1lfS5waGFzZSArPSAke3RoaXMubmFtZX1fZGlmZiAqICR7aW5wdXRzWzFdfVxuICBpZiggJHtnZW5OYW1lfS5waGFzZSA+IDEgKSAke2dlbk5hbWV9LnBoYXNlIC09IDFcbiAgJHtnZW5OYW1lfS5sYXN0U2FtcGxlID0gJHtpbnB1dHNbMF19XG5gXG4gICAgb3V0ID0gJyAnICsgb3V0XG5cbiAgICByZXR1cm4gWyBnZW5OYW1lICsgJy5waGFzZScsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgcmF0ZSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBwaGFzZTogICAgICAwLFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xLCByYXRlIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZToncm91bmQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLnJvdW5kJyA6IE1hdGgucm91bmQgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXJvdW5kKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnJvdW5kKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgcm91bmQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgcm91bmQuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gcm91bmRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzYWgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSBdID0gMFxuICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSArICdfY29udHJvbCcgXSA9IDBcblxuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG5cblxuICAgIG91dCA9IFxuYCB2YXIgJHt0aGlzLm5hbWV9X2NvbnRyb2wgPSBtZW1vcnlbJHt0aGlzLm1lbW9yeS5jb250cm9sLmlkeH1dLFxuICAgICAgJHt0aGlzLm5hbWV9X3RyaWdnZXIgPSAke2lucHV0c1sxXX0gPiAke2lucHV0c1syXX0gPyAxIDogMFxuXG4gIGlmKCAke3RoaXMubmFtZX1fdHJpZ2dlciAhPT0gJHt0aGlzLm5hbWV9X2NvbnRyb2wgICkge1xuICAgIGlmKCAke3RoaXMubmFtZX1fdHJpZ2dlciA9PT0gMSApIFxuICAgICAgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV0gPSAke2lucHV0c1swXX1cbiAgICBcbiAgICBtZW1vcnlbJHt0aGlzLm1lbW9yeS5jb250cm9sLmlkeH1dID0gJHt0aGlzLm5hbWV9X3RyaWdnZXJcbiAgfVxuYFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAvL2BnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gLCAnICcgK291dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgY29udHJvbCwgdGhyZXNob2xkPTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBpbml0OjAgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBsYXN0U2FtcGxlOiAwLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSwgY29udHJvbCx0aHJlc2hvbGQgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIGNvbnRyb2w6IHsgaWR4Om51bGwsIGxlbmd0aDoxIH0sXG4gICAgICB2YWx1ZTogICB7IGlkeDpudWxsLCBsZW5ndGg6MSB9LFxuICAgIH1cbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc2VsZWN0b3InLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXQsIHJldHVyblZhbHVlID0gMFxuICAgIFxuICAgIHN3aXRjaCggaW5wdXRzLmxlbmd0aCApIHtcbiAgICAgIGNhc2UgMiA6XG4gICAgICAgIHJldHVyblZhbHVlID0gaW5wdXRzWzFdXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzIDpcbiAgICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAke2lucHV0c1swXX0gPT09IDEgPyAke2lucHV0c1sxXX0gOiAke2lucHV0c1syXX1cXG5cXG5gO1xuICAgICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lICsgJ19vdXQnLCBvdXQgXVxuICAgICAgICBicmVhazsgIFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgb3V0ID0gXG5gIHZhciAke3RoaXMubmFtZX1fb3V0ID0gMFxuICBzd2l0Y2goICR7aW5wdXRzWzBdfSArIDEgKSB7XFxuYFxuXG4gICAgICAgIGZvciggbGV0IGkgPSAxOyBpIDwgaW5wdXRzLmxlbmd0aDsgaSsrICl7XG4gICAgICAgICAgb3V0ICs9YCAgICBjYXNlICR7aX06ICR7dGhpcy5uYW1lfV9vdXQgPSAke2lucHV0c1tpXX07IGJyZWFrO1xcbmAgXG4gICAgICAgIH1cblxuICAgICAgICBvdXQgKz0gJyAgfVxcblxcbidcbiAgICAgICAgXG4gICAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUgKyAnX291dCcsICcgJyArIG91dCBdXG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ19vdXQnXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmlucHV0cyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0c1xuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGNvdW50ZXI9IHJlcXVpcmUoICcuL2NvdW50ZXIuanMnICksXG4gICAgcGVlayAgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIHNzZCAgID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBkYXRhICA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcHJvdG8gPSB7IGJhc2VuYW1lOidzZXEnIH1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGR1cmF0aW9ucyA9IDExMDI1LCB2YWx1ZXMgPSBbMCwxXSwgcGhhc2VJbmNyZW1lbnQgPSAxKSA9PiB7XG4gIGxldCBjbG9ja1xuICBcbiAgaWYoIEFycmF5LmlzQXJyYXkoIGR1cmF0aW9ucyApICkge1xuICAgIC8vIHdlIHdhbnQgYSBjb3VudGVyIHRoYXQgaXMgdXNpbmcgb3VyIGN1cnJlbnRcbiAgICAvLyByYXRlIHZhbHVlLCBidXQgd2Ugd2FudCB0aGUgcmF0ZSB2YWx1ZSB0byBiZSBkZXJpdmVkIGZyb21cbiAgICAvLyB0aGUgY291bnRlci4gbXVzdCBpbnNlcnQgYSBzaW5nbGUtc2FtcGxlIGRlYWx5IHRvIGF2b2lkXG4gICAgLy8gaW5maW5pdGUgbG9vcC5cbiAgICBjb25zdCBjbG9jazIgPSBjb3VudGVyKCAwLCAwLCBkdXJhdGlvbnMubGVuZ3RoIClcbiAgICBjb25zdCBfX2R1cmF0aW9ucyA9IHBlZWsoIGRhdGEoIGR1cmF0aW9ucyApLCBjbG9jazIsIHsgbW9kZTonc2ltcGxlJyB9KSBcbiAgICBjbG9jayA9IGNvdW50ZXIoIHBoYXNlSW5jcmVtZW50LCAwLCBfX2R1cmF0aW9ucyApXG4gICAgXG4gICAgLy8gYWRkIG9uZSBzYW1wbGUgZGVsYXkgdG8gYXZvaWQgY29kZWdlbiBsb29wXG4gICAgY29uc3QgcyA9IHNzZCgpXG4gICAgcy5pbiggY2xvY2sud3JhcCApXG4gICAgY2xvY2syLmlucHV0c1swXSA9IHMub3V0XG4gIH1lbHNle1xuICAgIC8vIGlmIHRoZSByYXRlIGFyZ3VtZW50IGlzIGEgc2luZ2xlIHZhbHVlIHdlIGRvbid0IG5lZWQgdG9cbiAgICAvLyBkbyBhbnl0aGluZyB0cmlja3kuXG4gICAgY2xvY2sgPSBjb3VudGVyKCBwaGFzZUluY3JlbWVudCwgMCwgZHVyYXRpb25zIClcbiAgfVxuICBcbiAgY29uc3Qgc3RlcHBlciA9IGFjY3VtKCBjbG9jay53cmFwLCAwLCB7IG1pbjowLCBtYXg6dmFsdWVzLmxlbmd0aCB9KVxuICAgXG4gIGNvbnN0IHVnZW4gPSBwZWVrKCBkYXRhKCB2YWx1ZXMgKSwgc3RlcHBlciwgeyBtb2RlOidzaW1wbGUnIH0pXG5cbiAgdWdlbi5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J3NpZ24nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLnNpZ24nIDogTWF0aC5zaWduIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1zaWduKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpZ24oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBzaWduID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpZ24uaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gc2lnblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnc2luJzogaXNXb3JrbGV0ID8gJ01hdGguc2luJyA6IE1hdGguc2luIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1zaW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHNpbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBzaW4uaW5wdXRzID0gWyB4IF1cbiAgc2luLmlkID0gZ2VuLmdldFVJRCgpXG4gIHNpbi5uYW1lID0gYCR7c2luLmJhc2VuYW1lfXtzaW4uaWR9YFxuXG4gIHJldHVybiBzaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKSxcbiAgICBndCAgICAgID0gcmVxdWlyZSggJy4vZ3QuanMnICksXG4gICAgZGl2ICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgICBfc3dpdGNoID0gcmVxdWlyZSggJy4vc3dpdGNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIHNsaWRlVXAgPSAxLCBzbGlkZURvd24gPSAxICkgPT4ge1xuICBsZXQgeTEgPSBoaXN0b3J5KDApLFxuICAgICAgZmlsdGVyLCBzbGlkZUFtb3VudFxuXG4gIC8veSAobikgPSB5IChuLTEpICsgKCh4IChuKSAtIHkgKG4tMSkpL3NsaWRlKSBcbiAgc2xpZGVBbW91bnQgPSBfc3dpdGNoKCBndChpbjEseTEub3V0KSwgc2xpZGVVcCwgc2xpZGVEb3duIClcblxuICBmaWx0ZXIgPSBtZW1vKCBhZGQoIHkxLm91dCwgZGl2KCBzdWIoIGluMSwgeTEub3V0ICksIHNsaWRlQW1vdW50ICkgKSApXG5cbiAgeTEuaW4oIGZpbHRlciApXG5cbiAgcmV0dXJuIGZpbHRlclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxuY29uc3QgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzdWInLFxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0PTAsXG4gICAgICAgIGRpZmYgPSAwLFxuICAgICAgICBuZWVkc1BhcmVucyA9IGZhbHNlLCBcbiAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgIGxhc3ROdW1iZXJJc1VnZW4gPSBpc05hTiggbGFzdE51bWJlciApLCBcbiAgICAgICAgc3ViQXRFbmQgPSBmYWxzZSxcbiAgICAgICAgaGFzVWdlbnMgPSBmYWxzZSxcbiAgICAgICAgcmV0dXJuVmFsdWUgPSAwXG5cbiAgICB0aGlzLmlucHV0cy5mb3JFYWNoKCB2YWx1ZSA9PiB7IGlmKCBpc05hTiggdmFsdWUgKSApIGhhc1VnZW5zID0gdHJ1ZSB9KVxuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJ1xuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpID09PSAwICkgcmV0dXJuXG5cbiAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgIGlmKCAhbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuICkge1xuICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAtIHZcbiAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgICAgcmV0dXJuXG4gICAgICB9ZWxzZXtcbiAgICAgICAgbmVlZHNQYXJlbnMgPSB0cnVlXG4gICAgICAgIG91dCArPSBgJHtsYXN0TnVtYmVyfSAtICR7dn1gXG4gICAgICB9XG5cbiAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnIC0gJyBcbiAgICB9KVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5hcmdzICkgPT4ge1xuICBsZXQgc3ViID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHN1Yiwge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJnc1xuICB9KVxuICAgICAgIFxuICBzdWIubmFtZSA9ICdzdWInICsgc3ViLmlkXG5cbiAgcmV0dXJuIHN1YlxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc3dpdGNoJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBpZiggaW5wdXRzWzFdID09PSBpbnB1dHNbMl0gKSByZXR1cm4gaW5wdXRzWzFdIC8vIGlmIGJvdGggcG90ZW50aWFsIG91dHB1dHMgYXJlIHRoZSBzYW1lIGp1c3QgcmV0dXJuIG9uZSBvZiB0aGVtXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAke2lucHV0c1swXX0gPT09IDEgPyAke2lucHV0c1sxXX0gOiAke2lucHV0c1syXX1cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9X291dGBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1fb3V0YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggY29udHJvbCwgaW4xID0gMSwgaW4yID0gMCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBjb250cm9sLCBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid0NjAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHJldHVyblZhbHVlXG5cbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbICdleHAnIF06IGlzV29ya2xldCA/ICdNYXRoLmV4cCcgOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gJHtyZWZ9ZXhwKCAtNi45MDc3NTUyNzg5MjEgLyAke2lucHV0c1swXX0gKVxcblxcbmBcbiAgICAgXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBvdXRcbiAgICAgIFxuICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSwgb3V0IF1cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5leHAoIC02LjkwNzc1NTI3ODkyMSAvIGlucHV0c1swXSApXG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0XG4gICAgfSAgICBcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0NjAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdDYwLmlucHV0cyA9IFsgeCBdXG4gIHQ2MC5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdDYwXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3RhbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICd0YW4nOiBpc1dvcmtsZXQgPyAnTWF0aC50YW4nIDogTWF0aC50YW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXRhbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgudGFuKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgdGFuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHRhbi5pbnB1dHMgPSBbIHggXVxuICB0YW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgdGFuLm5hbWUgPSBgJHt0YW4uYmFzZW5hbWV9e3Rhbi5pZH1gXG5cbiAgcmV0dXJuIHRhblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid0YW5oJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3RhbmgnOiBpc1dvcmtsZXQgPyAnTWF0aC50YW4nIDogTWF0aC50YW5oIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn10YW5oKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW5oKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgdGFuaCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0YW5oLmlucHV0cyA9IFsgeCBdXG4gIHRhbmguaWQgPSBnZW4uZ2V0VUlEKClcbiAgdGFuaC5uYW1lID0gYCR7dGFuaC5iYXNlbmFtZX17dGFuaC5pZH1gXG5cbiAgcmV0dXJuIHRhbmhcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBsdCAgICAgID0gcmVxdWlyZSggJy4vbHQuanMnICksXG4gICAgcGhhc29yICA9IHJlcXVpcmUoICcuL3BoYXNvci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTQ0MCwgcHVsc2V3aWR0aD0uNSApID0+IHtcbiAgbGV0IGdyYXBoID0gbHQoIGFjY3VtKCBkaXYoIGZyZXF1ZW5jeSwgNDQxMDAgKSApLCAuNSApXG5cbiAgZ3JhcGgubmFtZSA9IGB0cmFpbiR7Z2VuLmdldFVJRCgpfWBcblxuICByZXR1cm4gZ3JhcGhcbn1cblxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnIClcblxubGV0IGlzU3RlcmVvID0gZmFsc2VcblxubGV0IHV0aWxpdGllcyA9IHtcbiAgY3R4OiBudWxsLFxuXG4gIGNsZWFyKCkge1xuICAgIGlmKCB0aGlzLndvcmtsZXROb2RlICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICB0aGlzLndvcmtsZXROb2RlLmRpc2Nvbm5lY3QoKVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5jYWxsYmFjayA9ICgpID0+IDBcbiAgICB9XG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MuZm9yRWFjaCggdiA9PiB2KCkgKVxuICAgIHRoaXMuY2xlYXIuY2FsbGJhY2tzLmxlbmd0aCA9IDBcbiAgfSxcblxuICBjcmVhdGVDb250ZXh0KCkge1xuICAgIGxldCBBQyA9IHR5cGVvZiBBdWRpb0NvbnRleHQgPT09ICd1bmRlZmluZWQnID8gd2Via2l0QXVkaW9Db250ZXh0IDogQXVkaW9Db250ZXh0XG4gICAgdGhpcy5jdHggPSBuZXcgQUMoKVxuXG4gICAgZ2VuLnNhbXBsZXJhdGUgPSB0aGlzLmN0eC5zYW1wbGVSYXRlXG5cbiAgICBsZXQgc3RhcnQgPSAoKSA9PiB7XG4gICAgICBpZiggdHlwZW9mIEFDICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuXG4gICAgICAgICAgaWYoICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHsgLy8gcmVxdWlyZWQgdG8gc3RhcnQgYXVkaW8gdW5kZXIgaU9TIDZcbiAgICAgICAgICAgICBsZXQgbXlTb3VyY2UgPSB1dGlsaXRpZXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICAgICAgICAgbXlTb3VyY2UuY29ubmVjdCggdXRpbGl0aWVzLmN0eC5kZXN0aW5hdGlvbiApXG4gICAgICAgICAgICAgbXlTb3VyY2Uubm90ZU9uKCAwIClcbiAgICAgICAgICAgfVxuICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH0sXG5cbiAgY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCkge1xuICAgIHRoaXMubm9kZSA9IHRoaXMuY3R4LmNyZWF0ZVNjcmlwdFByb2Nlc3NvciggMTAyNCwgMCwgMiApXG4gICAgdGhpcy5jbGVhckZ1bmN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiAwIH1cbiAgICBpZiggdHlwZW9mIHRoaXMuY2FsbGJhY2sgPT09ICd1bmRlZmluZWQnICkgdGhpcy5jYWxsYmFjayA9IHRoaXMuY2xlYXJGdW5jdGlvblxuXG4gICAgdGhpcy5ub2RlLm9uYXVkaW9wcm9jZXNzID0gZnVuY3Rpb24oIGF1ZGlvUHJvY2Vzc2luZ0V2ZW50ICkge1xuICAgICAgdmFyIG91dHB1dEJ1ZmZlciA9IGF1ZGlvUHJvY2Vzc2luZ0V2ZW50Lm91dHB1dEJ1ZmZlcjtcblxuICAgICAgdmFyIGxlZnQgPSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDAgKSxcbiAgICAgICAgICByaWdodD0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAxICksXG4gICAgICAgICAgaXNTdGVyZW8gPSB1dGlsaXRpZXMuaXNTdGVyZW9cblxuICAgICBmb3IoIHZhciBzYW1wbGUgPSAwOyBzYW1wbGUgPCBsZWZ0Lmxlbmd0aDsgc2FtcGxlKysgKSB7XG4gICAgICAgIHZhciBvdXQgPSB1dGlsaXRpZXMuY2FsbGJhY2soKVxuXG4gICAgICAgIGlmKCBpc1N0ZXJlbyA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgbGVmdFsgc2FtcGxlIF0gPSByaWdodFsgc2FtcGxlIF0gPSBvdXQgXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGxlZnRbIHNhbXBsZSAgXSA9IG91dFswXVxuICAgICAgICAgIHJpZ2h0WyBzYW1wbGUgXSA9IG91dFsxXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ub2RlLmNvbm5lY3QoIHRoaXMuY3R4LmRlc3RpbmF0aW9uIClcblxuICAgIHJldHVybiB0aGlzXG4gIH0sXG5cbiAgLy8gcmVtb3ZlIHN0YXJ0aW5nIHN0dWZmIGFuZCBhZGQgdGFic1xuICBwcmV0dHlQcmludENhbGxiYWNrKCBjYiApIHtcbiAgICAvLyBnZXQgcmlkIG9mIFwiZnVuY3Rpb24gZ2VuXCIgYW5kIHN0YXJ0IHdpdGggcGFyZW50aGVzaXNcbiAgICAvLyBjb25zdCBzaG9ydGVuZENCID0gY2IudG9TdHJpbmcoKS5zbGljZSg5KVxuICAgIGNvbnN0IGNiU3BsaXQgPSBjYi50b1N0cmluZygpLnNwbGl0KCdcXG4nKVxuICAgIGNvbnN0IGNiVHJpbSA9IGNiU3BsaXQuc2xpY2UoIDMsIC0yIClcbiAgICBjb25zdCBjYlRhYmJlZCA9IGNiVHJpbS5tYXAoIHYgPT4gJyAgICAgICcgKyB2ICkgXG4gICAgXG4gICAgcmV0dXJuIGNiVGFiYmVkLmpvaW4oJ1xcbicpXG4gIH0sXG5cbiAgY3JlYXRlUGFyYW1ldGVyRGVzY3JpcHRvcnMoIGNiICkge1xuICAgIC8vIFt7bmFtZTogJ2FtcGxpdHVkZScsIGRlZmF1bHRWYWx1ZTogMC4yNSwgbWluVmFsdWU6IDAsIG1heFZhbHVlOiAxfV07XG4gICAgbGV0IHBhcmFtU3RyID0gJydcblxuICAgIGZvciggbGV0IHVnZW4gb2YgY2IucGFyYW1zLnZhbHVlcygpICkge1xuICAgICAgcGFyYW1TdHIgKz0gYHsgbmFtZTonJHt1Z2VuLm5hbWV9JywgZGVmYXVsdFZhbHVlOiR7dWdlbi52YWx1ZX0sIG1pblZhbHVlOiR7dWdlbi5taW59LCBtYXhWYWx1ZToke3VnZW4ubWF4fSB9LFxcbiAgICAgIGBcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyYW1TdHJcbiAgfSxcblxuICBjcmVhdGVQYXJhbWV0ZXJEZXJlZmVyZW5jZXMoIGNiICkge1xuICAgIGxldCBzdHIgPSBjYi5wYXJhbXMuc2l6ZSA+IDAgPyAnXFxuICAgICAgJyA6ICcnXG4gICAgZm9yKCBsZXQgdWdlbiBvZiBjYi5wYXJhbXMudmFsdWVzKCkgKSB7XG4gICAgICBzdHIgKz0gYGNvbnN0ICR7dWdlbi5uYW1lfSA9IHBhcmFtZXRlcnMuJHt1Z2VuLm5hbWV9XFxuICAgICAgYFxuICAgIH1cblxuICAgIHJldHVybiBzdHJcbiAgfSxcblxuICBjcmVhdGVQYXJhbWV0ZXJBcmd1bWVudHMoIGNiICkge1xuICAgIGxldCAgcGFyYW1MaXN0ID0gJydcbiAgICBmb3IoIGxldCB1Z2VuIG9mIGNiLnBhcmFtcy52YWx1ZXMoKSApIHtcbiAgICAgIHBhcmFtTGlzdCArPSB1Z2VuLm5hbWUgKyAnW2ldLCdcbiAgICB9XG4gICAgcGFyYW1MaXN0ID0gcGFyYW1MaXN0LnNsaWNlKCAwLCAtMSApXG5cbiAgICByZXR1cm4gcGFyYW1MaXN0XG4gIH0sXG5cbiAgY3JlYXRlSW5wdXREZXJlZmVyZW5jZXMoIGNiICkge1xuICAgIGxldCBzdHIgPSBjYi5pbnB1dHMuc2l6ZSA+IDAgPyAnXFxuJyA6ICcnXG4gICAgZm9yKCBsZXQgaW5wdXQgb2YgIGNiLmlucHV0cy52YWx1ZXMoKSApIHtcbiAgICAgIHN0ciArPSBgY29uc3QgJHtpbnB1dC5uYW1lfSA9IGlucHV0c1sgJHtpbnB1dC5pbnB1dE51bWJlcn0gXVsgJHtpbnB1dC5jaGFubmVsTnVtYmVyfSBdXFxuICAgICAgYFxuICAgIH1cblxuICAgIHJldHVybiBzdHJcbiAgfSxcblxuXG4gIGNyZWF0ZUlucHV0QXJndW1lbnRzKCBjYiApIHtcbiAgICBsZXQgIHBhcmFtTGlzdCA9ICcnXG4gICAgZm9yKCBsZXQgaW5wdXQgb2YgY2IuaW5wdXRzLnZhbHVlcygpICkge1xuICAgICAgcGFyYW1MaXN0ICs9IGlucHV0Lm5hbWUgKyAnW2ldLCdcbiAgICB9XG4gICAgcGFyYW1MaXN0ID0gcGFyYW1MaXN0LnNsaWNlKCAwLCAtMSApXG5cbiAgICByZXR1cm4gcGFyYW1MaXN0XG4gIH0sXG4gICAgICBcbiAgY3JlYXRlRnVuY3Rpb25EZXJlZmVyZW5jZXMoIGNiICkge1xuICAgIGxldCBtZW1iZXJTdHJpbmcgPSBjYi5tZW1iZXJzLnNpemUgPiAwID8gJ1xcbicgOiAnJ1xuICAgIGxldCBtZW1vID0ge31cbiAgICBmb3IoIGxldCBkaWN0IG9mIGNiLm1lbWJlcnMudmFsdWVzKCkgKSB7XG4gICAgICBjb25zdCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICAgIHZhbHVlID0gZGljdFsgbmFtZSBdXG5cbiAgICAgIGlmKCBtZW1vWyBuYW1lIF0gIT09IHVuZGVmaW5lZCApIGNvbnRpbnVlXG4gICAgICBtZW1vWyBuYW1lIF0gPSB0cnVlXG5cbiAgICAgIG1lbWJlclN0cmluZyArPSBgICAgICAgY29uc3QgJHtuYW1lfSA9ICR7dmFsdWV9XFxuYFxuICAgIH1cblxuICAgIHJldHVybiBtZW1iZXJTdHJpbmdcbiAgfSxcblxuICBjcmVhdGVXb3JrbGV0UHJvY2Vzc29yKCBncmFwaCwgbmFtZSwgZGVidWcsIG1lbT00NDEwMCoxMCApIHtcbiAgICAvL2NvbnN0IG1lbSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIDQwOTYsIEZsb2F0NjRBcnJheSApXG4gICAgY29uc3QgY2IgPSBnZW4uY3JlYXRlQ2FsbGJhY2soIGdyYXBoLCBtZW0sIGRlYnVnIClcbiAgICBjb25zdCBpbnB1dHMgPSBjYi5pbnB1dHNcblxuICAgIC8vIGdldCBhbGwgaW5wdXRzIGFuZCBjcmVhdGUgYXBwcm9wcmlhdGUgYXVkaW9wYXJhbSBpbml0aWFsaXplcnNcbiAgICBjb25zdCBwYXJhbWV0ZXJEZXNjcmlwdG9ycyA9IHRoaXMuY3JlYXRlUGFyYW1ldGVyRGVzY3JpcHRvcnMoIGNiIClcbiAgICBjb25zdCBwYXJhbWV0ZXJEZXJlZmVyZW5jZXMgPSB0aGlzLmNyZWF0ZVBhcmFtZXRlckRlcmVmZXJlbmNlcyggY2IgKVxuICAgIGNvbnN0IHBhcmFtTGlzdCA9IHRoaXMuY3JlYXRlUGFyYW1ldGVyQXJndW1lbnRzKCBjYiApXG4gICAgY29uc3QgaW5wdXREZXJlZmVyZW5jZXMgPSB0aGlzLmNyZWF0ZUlucHV0RGVyZWZlcmVuY2VzKCBjYiApXG4gICAgY29uc3QgaW5wdXRMaXN0ID0gdGhpcy5jcmVhdGVJbnB1dEFyZ3VtZW50cyggY2IgKSAgIFxuICAgIGNvbnN0IG1lbWJlclN0cmluZyA9IHRoaXMuY3JlYXRlRnVuY3Rpb25EZXJlZmVyZW5jZXMoIGNiIClcblxuICAgIC8vIGdldCByZWZlcmVuY2VzIHRvIE1hdGggZnVuY3Rpb25zIGFzIG5lZWRlZFxuICAgIC8vIHRoZXNlIHJlZmVyZW5jZXMgYXJlIGFkZGVkIHRvIHRoZSBjYWxsYmFjayBkdXJpbmcgY29kZWdlbi5cblxuICAgIC8vIGNoYW5nZSBvdXRwdXQgYmFzZWQgb24gbnVtYmVyIG9mIGNoYW5uZWxzLlxuICAgIGNvbnN0IGdlbmlzaE91dHB1dExpbmUgPSBjYi5pc1N0ZXJlbyA9PT0gZmFsc2VcbiAgICAgID8gYGxlZnRbIGkgXSA9IG1lbW9yeVswXWBcbiAgICAgIDogYGxlZnRbIGkgXSA9IG1lbW9yeVswXTtcXG5cXHRcXHRyaWdodFsgaSBdID0gbWVtb3J5WzFdXFxuYFxuXG4gICAgY29uc3QgcHJldHR5Q2FsbGJhY2sgPSB0aGlzLnByZXR0eVByaW50Q2FsbGJhY2soIGNiIClcblxuXG4gICAgLyoqKioqIGJlZ2luIGNhbGxiYWNrIGNvZGUgKioqKi9cbiAgICAvLyBub3RlIHRoYXQgd2UgaGF2ZSB0byBjaGVjayB0byBzZWUgdGhhdCBtZW1vcnkgaGFzIGJlZW4gcGFzc2VkXG4gICAgLy8gdG8gdGhlIHdvcmtlciBiZWZvcmUgcnVubmluZyB0aGUgY2FsbGJhY2sgZnVuY3Rpb24sIG90aGVyd2lzZVxuICAgIC8vIGl0IGNhbiBiZSBwYXN0IHRvbyBzbG93bHkgYW5kIGZhaWwgb24gb2NjYXNzaW9uXG5cbiAgICBjb25zdCB3b3JrbGV0Q29kZSA9IGBcbmNsYXNzICR7bmFtZX1Qcm9jZXNzb3IgZXh0ZW5kcyBBdWRpb1dvcmtsZXRQcm9jZXNzb3Ige1xuXG4gIHN0YXRpYyBnZXQgcGFyYW1ldGVyRGVzY3JpcHRvcnMoKSB7XG4gICAgY29uc3QgcGFyYW1zID0gW1xuICAgICAgJHsgcGFyYW1ldGVyRGVzY3JpcHRvcnMgfSAgICAgIFxuICAgIF1cbiAgICByZXR1cm4gcGFyYW1zXG4gIH1cbiBcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XG4gICAgc3VwZXIoIG9wdGlvbnMgKVxuICAgIHRoaXMucG9ydC5vbm1lc3NhZ2UgPSB0aGlzLmhhbmRsZU1lc3NhZ2UuYmluZCggdGhpcyApXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlXG4gIH1cblxuICBoYW5kbGVNZXNzYWdlKCBldmVudCApIHtcbiAgICBpZiggZXZlbnQuZGF0YS5rZXkgPT09ICdpbml0JyApIHtcbiAgICAgIHRoaXMubWVtb3J5ID0gZXZlbnQuZGF0YS5tZW1vcnlcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgfWVsc2UgaWYoIGV2ZW50LmRhdGEua2V5ID09PSAnc2V0JyApIHtcbiAgICAgIHRoaXMubWVtb3J5WyBldmVudC5kYXRhLmlkeCBdID0gZXZlbnQuZGF0YS52YWx1ZVxuICAgIH1lbHNlIGlmKCBldmVudC5kYXRhLmtleSA9PT0gJ2dldCcgKSB7XG4gICAgICB0aGlzLnBvcnQucG9zdE1lc3NhZ2UoeyBrZXk6J3JldHVybicsIGlkeDpldmVudC5kYXRhLmlkeCwgdmFsdWU6dGhpcy5tZW1vcnlbZXZlbnQuZGF0YS5pZHhdIH0pICAgICBcbiAgICB9XG4gIH1cblxuICBwcm9jZXNzKCBpbnB1dHMsIG91dHB1dHMsIHBhcmFtZXRlcnMgKSB7XG4gICAgaWYoIHRoaXMuaW5pdGlhbGl6ZWQgPT09IHRydWUgKSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBvdXRwdXRzWzBdXG4gICAgICBjb25zdCBsZWZ0ICAgPSBvdXRwdXRbIDAgXVxuICAgICAgY29uc3QgcmlnaHQgID0gb3V0cHV0WyAxIF1cbiAgICAgIGNvbnN0IGxlbiAgICA9IGxlZnQubGVuZ3RoXG4gICAgICBjb25zdCBtZW1vcnkgPSB0aGlzLm1lbW9yeSAke3BhcmFtZXRlckRlcmVmZXJlbmNlc30ke2lucHV0RGVyZWZlcmVuY2VzfSR7bWVtYmVyU3RyaW5nfVxuXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IGxlbjsgKytpICkge1xuICAgICAgICAke3ByZXR0eUNhbGxiYWNrfVxuICAgICAgICAke2dlbmlzaE91dHB1dExpbmV9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cbiAgICBcbnJlZ2lzdGVyUHJvY2Vzc29yKCAnJHtuYW1lfScsICR7bmFtZX1Qcm9jZXNzb3IpYFxuXG4gICAgXG4gICAgLyoqKioqIGVuZCBjYWxsYmFjayBjb2RlICoqKioqL1xuXG5cbiAgICBpZiggZGVidWcgPT09IHRydWUgKSBjb25zb2xlLmxvZyggd29ya2xldENvZGUgKVxuXG4gICAgY29uc3QgdXJsID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoXG4gICAgICBuZXcgQmxvYihcbiAgICAgICAgWyB3b3JrbGV0Q29kZSBdLCBcbiAgICAgICAgeyB0eXBlOiAndGV4dC9qYXZhc2NyaXB0JyB9XG4gICAgICApXG4gICAgKVxuXG4gICAgcmV0dXJuIFsgdXJsLCB3b3JrbGV0Q29kZSwgaW5wdXRzLCBjYi5wYXJhbXMsIGNiLmlzU3RlcmVvIF0gXG4gIH0sXG5cbiAgcmVnaXN0ZXJlZEZvck5vZGVBc3NpZ25tZW50OiBbXSxcbiAgcmVnaXN0ZXIoIHVnZW4gKSB7XG4gICAgaWYoIHRoaXMucmVnaXN0ZXJlZEZvck5vZGVBc3NpZ25tZW50LmluZGV4T2YoIHVnZW4gKSA9PT0gLTEgKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyZWRGb3JOb2RlQXNzaWdubWVudC5wdXNoKCB1Z2VuIClcbiAgICB9XG4gIH0sXG5cbiAgcGxheVdvcmtsZXQoIGdyYXBoLCBuYW1lLCBkZWJ1Zz1mYWxzZSwgbWVtPTQ0MTAwICogMTAgKSB7XG4gICAgdXRpbGl0aWVzLmNsZWFyKClcblxuICAgIGNvbnN0IFsgdXJsLCBjb2RlU3RyaW5nLCBpbnB1dHMsIHBhcmFtcywgaXNTdGVyZW8gXSA9IHV0aWxpdGllcy5jcmVhdGVXb3JrbGV0UHJvY2Vzc29yKCBncmFwaCwgbmFtZSwgZGVidWcsIG1lbSApXG5cbiAgICBjb25zdCBub2RlUHJvbWlzZSA9IG5ldyBQcm9taXNlKCAocmVzb2x2ZSxyZWplY3QpID0+IHtcbiAgIFxuICAgICAgdXRpbGl0aWVzLmN0eC5hdWRpb1dvcmtsZXQuYWRkTW9kdWxlKCB1cmwgKS50aGVuKCAoKT0+IHtcbiAgICAgICAgY29uc3Qgd29ya2xldE5vZGUgPSBuZXcgQXVkaW9Xb3JrbGV0Tm9kZSggdXRpbGl0aWVzLmN0eCwgbmFtZSwgeyBvdXRwdXRDaGFubmVsQ291bnQ6WyBpc1N0ZXJlbyA/IDIgOiAxIF0gfSlcbiAgICAgICAgd29ya2xldE5vZGUuY29ubmVjdCggdXRpbGl0aWVzLmN0eC5kZXN0aW5hdGlvbiApXG5cbiAgICAgICAgd29ya2xldE5vZGUuY2FsbGJhY2tzID0ge31cbiAgICAgICAgd29ya2xldE5vZGUub25tZXNzYWdlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICAgIGlmKCBldmVudC5kYXRhLm1lc3NhZ2UgPT09ICdyZXR1cm4nICkge1xuICAgICAgICAgICAgd29ya2xldE5vZGUuY2FsbGJhY2tzWyBldmVudC5kYXRhLmlkeCBdKCBldmVudC5kYXRhLnZhbHVlIClcbiAgICAgICAgICAgIGRlbGV0ZSB3b3JrbGV0Tm9kZS5jYWxsYmFja3NbIGV2ZW50LmRhdGEuaWR4IF1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB3b3JrbGV0Tm9kZS5nZXRNZW1vcnlWYWx1ZSA9IGZ1bmN0aW9uKCBpZHgsIGNiICkge1xuICAgICAgICAgIHRoaXMud29ya2xldENhbGxiYWNrc1sgaWR4IF0gPSBjYlxuICAgICAgICAgIHRoaXMud29ya2xldE5vZGUucG9ydC5wb3N0TWVzc2FnZSh7IGtleTonZ2V0JywgaWR4OiBpZHggfSlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgd29ya2xldE5vZGUucG9ydC5wb3N0TWVzc2FnZSh7IGtleTonaW5pdCcsIG1lbW9yeTpnZW4ubWVtb3J5LmhlYXAgfSlcbiAgICAgICAgdXRpbGl0aWVzLndvcmtsZXROb2RlID0gd29ya2xldE5vZGVcblxuICAgICAgICB1dGlsaXRpZXMucmVnaXN0ZXJlZEZvck5vZGVBc3NpZ25tZW50LmZvckVhY2goIHVnZW4gPT4gdWdlbi5ub2RlID0gd29ya2xldE5vZGUgKVxuICAgICAgICB1dGlsaXRpZXMucmVnaXN0ZXJlZEZvck5vZGVBc3NpZ25tZW50Lmxlbmd0aCA9IDBcblxuICAgICAgICAvLyBhc3NpZ24gYWxsIHBhcmFtcyBhcyBwcm9wZXJ0aWVzIG9mIG5vZGUgZm9yIGVhc2llciByZWZlcmVuY2UgXG4gICAgICAgIGZvciggbGV0IGRpY3Qgb2YgaW5wdXRzLnZhbHVlcygpICkge1xuICAgICAgICAgIGNvbnN0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdXG4gICAgICAgICAgY29uc3QgcGFyYW0gPSB3b3JrbGV0Tm9kZS5wYXJhbWV0ZXJzLmdldCggbmFtZSApXG4gICAgICBcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHdvcmtsZXROb2RlLCBuYW1lLCB7XG4gICAgICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgICAgIHBhcmFtLnZhbHVlID0gdlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtLnZhbHVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciggbGV0IHVnZW4gb2YgcGFyYW1zLnZhbHVlcygpICkge1xuICAgICAgICAgIGNvbnN0IG5hbWUgPSB1Z2VuLm5hbWVcbiAgICAgICAgICBjb25zdCBwYXJhbSA9IHdvcmtsZXROb2RlLnBhcmFtZXRlcnMuZ2V0KCBuYW1lIClcbiAgICAgICAgICB1Z2VuLndhYXBpID0gcGFyYW0gXG5cbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHdvcmtsZXROb2RlLCBuYW1lLCB7XG4gICAgICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgICAgIHBhcmFtLnZhbHVlID0gdlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtLnZhbHVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCB1dGlsaXRpZXMuY29uc29sZSApIHV0aWxpdGllcy5jb25zb2xlLnNldFZhbHVlKCBjb2RlU3RyaW5nIClcblxuICAgICAgICByZXNvbHZlKCB3b3JrbGV0Tm9kZSApXG4gICAgICB9KVxuXG4gICAgfSlcblxuICAgIHJldHVybiBub2RlUHJvbWlzZVxuICB9LFxuICBcbiAgcGxheUdyYXBoKCBncmFwaCwgZGVidWcsIG1lbT00NDEwMCoxMCwgbWVtVHlwZT1GbG9hdDMyQXJyYXkgKSB7XG4gICAgdXRpbGl0aWVzLmNsZWFyKClcbiAgICBpZiggZGVidWcgPT09IHVuZGVmaW5lZCApIGRlYnVnID0gZmFsc2VcbiAgICAgICAgICBcbiAgICB0aGlzLmlzU3RlcmVvID0gQXJyYXkuaXNBcnJheSggZ3JhcGggKVxuXG4gICAgdXRpbGl0aWVzLmNhbGxiYWNrID0gZ2VuLmNyZWF0ZUNhbGxiYWNrKCBncmFwaCwgbWVtLCBkZWJ1ZywgZmFsc2UsIG1lbVR5cGUgKVxuICAgIFxuICAgIGlmKCB1dGlsaXRpZXMuY29uc29sZSApIHV0aWxpdGllcy5jb25zb2xlLnNldFZhbHVlKCB1dGlsaXRpZXMuY2FsbGJhY2sudG9TdHJpbmcoKSApXG5cbiAgICByZXR1cm4gdXRpbGl0aWVzLmNhbGxiYWNrXG4gIH0sXG5cbiAgbG9hZFNhbXBsZSggc291bmRGaWxlUGF0aCwgZGF0YSApIHtcbiAgICBsZXQgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICByZXEub3BlbiggJ0dFVCcsIHNvdW5kRmlsZVBhdGgsIHRydWUgKVxuICAgIHJlcS5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInIFxuICAgIFxuICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoIChyZXNvbHZlLHJlamVjdCkgPT4ge1xuICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXVkaW9EYXRhID0gcmVxLnJlc3BvbnNlXG5cbiAgICAgICAgdXRpbGl0aWVzLmN0eC5kZWNvZGVBdWRpb0RhdGEoIGF1ZGlvRGF0YSwgKGJ1ZmZlcikgPT4ge1xuICAgICAgICAgIGRhdGEuYnVmZmVyID0gYnVmZmVyLmdldENoYW5uZWxEYXRhKDApXG4gICAgICAgICAgcmVzb2x2ZSggZGF0YS5idWZmZXIgKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXEuc2VuZCgpXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbn1cblxudXRpbGl0aWVzLmNsZWFyLmNhbGxiYWNrcyA9IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbGl0aWVzXG4iLCIndXNlIHN0cmljdCdcblxuLypcbiAqIG1hbnkgd2luZG93cyBoZXJlIGFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vY29yYmFuYnJvb2svZHNwLmpzL2Jsb2IvbWFzdGVyL2RzcC5qc1xuICogc3RhcnRpbmcgYXQgbGluZSAxNDI3XG4gKiB0YWtlbiA4LzE1LzE2XG4qLyBcblxuY29uc3Qgd2luZG93cyA9IG1vZHVsZS5leHBvcnRzID0geyBcbiAgYmFydGxldHQoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDIgLyAobGVuZ3RoIC0gMSkgKiAoKGxlbmd0aCAtIDEpIC8gMiAtIE1hdGguYWJzKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikpIFxuICB9LFxuXG4gIGJhcnRsZXR0SGFubiggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC42MiAtIDAuNDggKiBNYXRoLmFicyhpbmRleCAvIChsZW5ndGggLSAxKSAtIDAuNSkgLSAwLjM4ICogTWF0aC5jb3MoIDIgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgYmxhY2ttYW4oIGxlbmd0aCwgaW5kZXgsIGFscGhhICkge1xuICAgIGxldCBhMCA9ICgxIC0gYWxwaGEpIC8gMixcbiAgICAgICAgYTEgPSAwLjUsXG4gICAgICAgIGEyID0gYWxwaGEgLyAyXG5cbiAgICByZXR1cm4gYTAgLSBhMSAqIE1hdGguY29zKDIgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpICsgYTIgKiBNYXRoLmNvcyg0ICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKVxuICB9LFxuXG4gIGNvc2luZSggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gTWF0aC5jb3MoTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gTWF0aC5QSSAvIDIpXG4gIH0sXG5cbiAgZ2F1c3MoIGxlbmd0aCwgaW5kZXgsIGFscGhhICkge1xuICAgIHJldHVybiBNYXRoLnBvdyhNYXRoLkUsIC0wLjUgKiBNYXRoLnBvdygoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSAvIChhbHBoYSAqIChsZW5ndGggLSAxKSAvIDIpLCAyKSlcbiAgfSxcblxuICBoYW1taW5nKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjU0IC0gMC40NiAqIE1hdGguY29zKCBNYXRoLlBJICogMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKVxuICB9LFxuXG4gIGhhbm4oIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNSAqICgxIC0gTWF0aC5jb3MoIE1hdGguUEkgKiAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkpIClcbiAgfSxcblxuICBsYW5jem9zKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIGxldCB4ID0gMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMTtcbiAgICByZXR1cm4gTWF0aC5zaW4oTWF0aC5QSSAqIHgpIC8gKE1hdGguUEkgKiB4KVxuICB9LFxuXG4gIHJlY3Rhbmd1bGFyKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAxXG4gIH0sXG5cbiAgdHJpYW5ndWxhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMiAvIGxlbmd0aCAqIChsZW5ndGggLyAyIC0gTWF0aC5hYnMoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSlcbiAgfSxcblxuICAvLyBwYXJhYm9sYVxuICB3ZWxjaCggbGVuZ3RoLCBfaW5kZXgsIGlnbm9yZSwgc2hpZnQ9MCApIHtcbiAgICAvL3dbbl0gPSAxIC0gTWF0aC5wb3coICggbiAtICggKE4tMSkgLyAyICkgKSAvICgoIE4tMSApIC8gMiApLCAyIClcbiAgICBjb25zdCBpbmRleCA9IHNoaWZ0ID09PSAwID8gX2luZGV4IDogKF9pbmRleCArIE1hdGguZmxvb3IoIHNoaWZ0ICogbGVuZ3RoICkpICUgbGVuZ3RoXG4gICAgY29uc3Qgbl8xX292ZXIyID0gKGxlbmd0aCAtIDEpIC8gMiBcblxuICAgIHJldHVybiAxIC0gTWF0aC5wb3coICggaW5kZXggLSBuXzFfb3ZlcjIgKSAvIG5fMV9vdmVyMiwgMiApXG4gIH0sXG4gIGludmVyc2V3ZWxjaCggbGVuZ3RoLCBfaW5kZXgsIGlnbm9yZSwgc2hpZnQ9MCApIHtcbiAgICAvL3dbbl0gPSAxIC0gTWF0aC5wb3coICggbiAtICggKE4tMSkgLyAyICkgKSAvICgoIE4tMSApIC8gMiApLCAyIClcbiAgICBsZXQgaW5kZXggPSBzaGlmdCA9PT0gMCA/IF9pbmRleCA6IChfaW5kZXggKyBNYXRoLmZsb29yKCBzaGlmdCAqIGxlbmd0aCApKSAlIGxlbmd0aFxuICAgIGNvbnN0IG5fMV9vdmVyMiA9IChsZW5ndGggLSAxKSAvIDJcblxuICAgIHJldHVybiBNYXRoLnBvdyggKCBpbmRleCAtIG5fMV9vdmVyMiApIC8gbl8xX292ZXIyLCAyIClcbiAgfSxcblxuICBwYXJhYm9sYSggbGVuZ3RoLCBpbmRleCApIHtcbiAgICBpZiggaW5kZXggPD0gbGVuZ3RoIC8gMiApIHtcbiAgICAgIHJldHVybiB3aW5kb3dzLmludmVyc2V3ZWxjaCggbGVuZ3RoIC8gMiwgaW5kZXggKSAtIDFcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiAxIC0gd2luZG93cy5pbnZlcnNld2VsY2goIGxlbmd0aCAvIDIsIGluZGV4IC0gbGVuZ3RoIC8gMiApXG4gICAgfVxuICB9LFxuXG4gIGV4cG9uZW50aWFsKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICByZXR1cm4gTWF0aC5wb3coIGluZGV4IC8gbGVuZ3RoLCBhbHBoYSApXG4gIH0sXG5cbiAgbGluZWFyKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiBpbmRleCAvIGxlbmd0aFxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViICA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3dyYXAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBzaWduYWwgPSBpbnB1dHNbMF0sIG1pbiA9IGlucHV0c1sxXSwgbWF4ID0gaW5wdXRzWzJdLFxuICAgICAgICBvdXQsIGRpZmZcblxuICAgIC8vb3V0ID0gYCgoKCR7aW5wdXRzWzBdfSAtICR7dGhpcy5taW59KSAlICR7ZGlmZn0gICsgJHtkaWZmfSkgJSAke2RpZmZ9ICsgJHt0aGlzLm1pbn0pYFxuICAgIC8vY29uc3QgbG9uZyBudW1XcmFwcyA9IGxvbmcoKHYtbG8pL3JhbmdlKSAtICh2IDwgbG8pO1xuICAgIC8vcmV0dXJuIHYgLSByYW5nZSAqIGRvdWJsZShudW1XcmFwcyk7ICAgXG4gICAgXG4gICAgaWYoIHRoaXMubWluID09PSAwICkge1xuICAgICAgZGlmZiA9IG1heFxuICAgIH1lbHNlIGlmICggaXNOYU4oIG1heCApIHx8IGlzTmFOKCBtaW4gKSApIHtcbiAgICAgIGRpZmYgPSBgJHttYXh9IC0gJHttaW59YFxuICAgIH1lbHNle1xuICAgICAgZGlmZiA9IG1heCAtIG1pblxuICAgIH1cblxuICAgIG91dCA9XG5gIHZhciAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cbiAgaWYoICR7dGhpcy5uYW1lfSA8ICR7dGhpcy5taW59ICkgJHt0aGlzLm5hbWV9ICs9ICR7ZGlmZn1cbiAgZWxzZSBpZiggJHt0aGlzLm5hbWV9ID4gJHt0aGlzLm1heH0gKSAke3RoaXMubmFtZX0gLT0gJHtkaWZmfVxuXG5gXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsICcgJyArIG91dCBdXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xLCBtaW4sIG1heCBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwibGV0IHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5sZXQgYW5hbHl6ZXIgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuT2JqZWN0LmFzc2lnbiggYW5hbHl6ZXIsIHtcbiAgX190eXBlX186ICdhbmFseXplcicsXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFuYWx5emVyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgYW5hbHl6ZXJzID0ge1xuICAgIFNTRDogICAgcmVxdWlyZSggJy4vc2luZ2xlc2FtcGxlZGVsYXkuanMnICApKCBHaWJiZXJpc2ggKSxcbiAgICBGb2xsb3c6IHJlcXVpcmUoICcuL2ZvbGxvdy5qcycgICkoIEdpYmJlcmlzaCApXG4gIH1cblxuICBhbmFseXplcnMuZXhwb3J0ID0gdGFyZ2V0ID0+IHtcbiAgICBmb3IoIGxldCBrZXkgaW4gYW5hbHl6ZXJzICkge1xuICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgIHRhcmdldFsga2V5IF0gPSBhbmFseXplcnNbIGtleSBdXG4gICAgICB9XG4gICAgfVxuICB9XG5cbnJldHVybiBhbmFseXplcnNcblxufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoJ2dlbmlzaC5qcycpLFxuICAgICAgYW5hbHl6ZXIgPSByZXF1aXJlKCcuL2FuYWx5emVyLmpzJyksXG4gICAgICB1Z2VuID0gcmVxdWlyZSgnLi4vdWdlbi5qcycpO1xuXG5jb25zdCBnZW5pc2ggPSBnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChHaWJiZXJpc2gpIHtcblxuICBjb25zdCBGb2xsb3cgPSBpbnB1dFByb3BzID0+IHtcblxuICAgIC8vIG1haW4gZm9sbG93IG9iamVjdCBpcyBhbHNvIHRoZSBvdXRwdXRcbiAgICBjb25zdCBmb2xsb3cgPSBPYmplY3QuY3JlYXRlKGFuYWx5emVyKTtcbiAgICBmb2xsb3cuaW4gPSBPYmplY3QuY3JlYXRlKHVnZW4pO1xuICAgIGZvbGxvdy5pZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpO1xuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBpbnB1dFByb3BzLCBGb2xsb3cuZGVmYXVsdHMpO1xuICAgIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWU7XG5cbiAgICAvLyB0aGUgaW5wdXQgdG8gdGhlIGZvbGxvdyB1Z2VuIGlzIGJ1ZmZlcmVkIGluIHRoaXMgdWdlblxuICAgIGZvbGxvdy5idWZmZXIgPSBnLmRhdGEocHJvcHMuYnVmZmVyU2l6ZSwgMSk7XG5cbiAgICBsZXQgYXZnOyAvLyBvdXRwdXQ7IG1ha2UgYXZhaWxhYmxlIG91dHNpZGUganNkc3AgYmxvY2tcbiAgICBjb25zdCBfaW5wdXQgPSBnLmluKCdpbnB1dCcpO1xuICAgIGNvbnN0IGlucHV0ID0gaXNTdGVyZW8gPyBnLmFkZChfaW5wdXRbMF0sIF9pbnB1dFsxXSkgOiBfaW5wdXQ7XG5cbiAgICB7XG4gICAgICBcInVzZSBqc2RzcFwiO1xuICAgICAgLy8gcGhhc2UgdG8gd3JpdGUgdG8gZm9sbG93IGJ1ZmZlclxuICAgICAgY29uc3QgYnVmZmVyUGhhc2VPdXQgPSBnLmFjY3VtKDEsIDAsIHsgbWF4OiBwcm9wcy5idWZmZXJTaXplLCBtaW46IDAgfSk7XG5cbiAgICAgIC8vIGhvbGQgcnVubmluZyBzdW1cbiAgICAgIGNvbnN0IHN1bSA9IGcuZGF0YSgxLCAxLCB7IG1ldGE6IHRydWUgfSk7XG5cbiAgICAgIHN1bVswXSA9IGdlbmlzaC5zdWIoZ2VuaXNoLmFkZChzdW1bMF0sIGlucHV0KSwgZy5wZWVrKGZvbGxvdy5idWZmZXIsIGJ1ZmZlclBoYXNlT3V0LCB7IG1vZGU6ICdzaW1wbGUnIH0pKTtcblxuICAgICAgYXZnID0gZ2VuaXNoLmRpdihzdW1bMF0sIHByb3BzLmJ1ZmZlclNpemUpO1xuICAgIH1cblxuICAgIGlmICghaXNTdGVyZW8pIHtcbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KGZvbGxvdywgYXZnLCAnZm9sbG93X291dCcsIHByb3BzKTtcblxuICAgICAgZm9sbG93LmNhbGxiYWNrLnVnZW5OYW1lID0gZm9sbG93LnVnZW5OYW1lID0gYGZvbGxvd19vdXRfJHsgZm9sbG93LmlkIH1gO1xuXG4gICAgICAvLyBoYXZlIHRvIHdyaXRlIGN1c3RvbSBjYWxsYmFjayBmb3IgaW5wdXQgdG8gcmV1c2UgY29tcG9uZW50cyBmcm9tIG91dHB1dCxcbiAgICAgIC8vIHNwZWNpZmljYWxseSB0aGUgbWVtb3J5IGZyb20gb3VyIGJ1ZmZlclxuICAgICAgbGV0IGlkeCA9IGZvbGxvdy5idWZmZXIubWVtb3J5LnZhbHVlcy5pZHg7XG4gICAgICBsZXQgcGhhc2UgPSAwO1xuICAgICAgbGV0IGFicyA9IE1hdGguYWJzO1xuICAgICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24gKGlucHV0LCBtZW1vcnkpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgICAgIG1lbW9yeVtnZW5pc2guYWRkKGlkeCwgcGhhc2UpXSA9IGFicyhpbnB1dCk7XG4gICAgICAgIHBoYXNlKys7XG4gICAgICAgIGlmIChwaGFzZSA+IGdlbmlzaC5zdWIocHJvcHMuYnVmZmVyU2l6ZSwgMSkpIHtcbiAgICAgICAgICBwaGFzZSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH07XG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KGZvbGxvdy5pbiwgaW5wdXQsICdmb2xsb3dfaW4nLCBwcm9wcywgY2FsbGJhY2spO1xuXG4gICAgICAvLyBsb3RzIG9mIG5vbnNlbnNlIHRvIG1ha2Ugb3VyIGN1c3RvbSBmdW5jdGlvbiB3b3JrXG4gICAgICBmb2xsb3cuaW4uY2FsbGJhY2sudWdlbk5hbWUgPSBmb2xsb3cuaW4udWdlbk5hbWUgPSBgZm9sbG93X2luXyR7IGZvbGxvdy5pZCB9YDtcbiAgICAgIGZvbGxvdy5pbi5pbnB1dE5hbWVzID0gWydpbnB1dCddO1xuICAgICAgZm9sbG93LmluLmlucHV0cyA9IFtpbnB1dF07XG4gICAgICBmb2xsb3cuaW4uaW5wdXQgPSBwcm9wcy5pbnB1dDtcbiAgICAgIGZvbGxvdy5pbi50eXBlID0gJ2FuYWx5c2lzJztcblxuICAgICAgaWYgKEdpYmJlcmlzaC5hbmFseXplcnMuaW5kZXhPZihmb2xsb3cuaW4pID09PSAtMSkge1xuICAgICAgICBHaWJiZXJpc2guYW5hbHl6ZXJzLnB1c2goZm9sbG93LmluKTtcbiAgICAgIH1cblxuICAgICAgR2liYmVyaXNoLmRpcnR5KEdpYmJlcmlzaC5hbmFseXplcnMpO1xuICAgIH1cblxuICAgIHJldHVybiBmb2xsb3c7XG4gIH07XG5cbiAgRm9sbG93LmRlZmF1bHRzID0ge1xuICAgIGJ1ZmZlclNpemU6IDgxOTJcbiAgfTtcblxuICByZXR1cm4gRm9sbG93O1xufTsiLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGFuYWx5emVyID0gcmVxdWlyZSggJy4vYW5hbHl6ZXIuanMnICksXG4gICAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxuY29uc3QgRGVsYXkgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHNzZCA9IE9iamVjdC5jcmVhdGUoIGFuYWx5emVyIClcbiAgc3NkLmluICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICBzc2Qub3V0ID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbiAgc3NkLmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcblxuICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBEZWxheS5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnIClcbiAgICBcbiAgbGV0IGhpc3RvcnlMID0gZy5oaXN0b3J5KClcblxuICBpZiggaXNTdGVyZW8gKSB7XG4gICAgLy8gcmlnaHQgY2hhbm5lbFxuICAgIGxldCBoaXN0b3J5UiA9IGcuaGlzdG9yeSgpXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICBzc2Qub3V0LFxuICAgICAgWyBoaXN0b3J5TC5vdXQsIGhpc3RvcnlSLm91dCBdLCBcbiAgICAgICdzc2Rfb3V0JywgXG4gICAgICBwcm9wcyBcbiAgICApXG5cbiAgICBzc2Qub3V0LmNhbGxiYWNrLnVnZW5OYW1lID0gc3NkLm91dC51Z2VuTmFtZSA9ICdzc2Rfb3V0XycgKyBzc2QuaWRcblxuICAgIGNvbnN0IGlkeEwgPSBzc2Qub3V0LmdyYXBoLm1lbW9yeS52YWx1ZS5pZHgsIFxuICAgICAgICAgIGlkeFIgPSBpZHhMICsgMSxcbiAgICAgICAgICBtZW1vcnkgPSBHaWJiZXJpc2guZ2VuaXNoLmdlbi5tZW1vcnkuaGVhcFxuXG4gICAgY29uc3QgY2FsbGJhY2sgPSBmdW5jdGlvbiggaW5wdXQgKSB7XG4gICAgICAndXNlIHN0cmljdCdcbiAgICAgIG1lbW9yeVsgaWR4TCBdID0gaW5wdXRbMF1cbiAgICAgIG1lbW9yeVsgaWR4UiBdID0gaW5wdXRbMV1cbiAgICAgIHJldHVybiAwICAgICBcbiAgICB9XG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHNzZC5pbiwgWyBpbnB1dFswXSxpbnB1dFsxXSBdLCAnc3NkX2luJywgcHJvcHMsIGNhbGxiYWNrIClcblxuICAgIGNhbGxiYWNrLnVnZW5OYW1lID0gc3NkLmluLnVnZW5OYW1lID0gJ3NzZF9pbl8nICsgc3NkLmlkXG4gICAgc3NkLmluLmlucHV0TmFtZXMgPSBbICdpbnB1dCcgXVxuICAgIHNzZC5pbi5pbnB1dHMgPSBbIHByb3BzLmlucHV0IF1cbiAgICBzc2QuaW4uaW5wdXQgPSBwcm9wcy5pbnB1dFxuICAgIHNzZC50eXBlID0gJ2FuYWx5c2lzJ1xuXG4gICAgc3NkLmluLmxpc3RlbiA9IGZ1bmN0aW9uKCB1Z2VuICkge1xuICAgICAgaWYoIHVnZW4gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc3NkLmluLmlucHV0ID0gdWdlblxuICAgICAgICBzc2QuaW4uaW5wdXRzID0gWyB1Z2VuIF1cbiAgICAgIH1cblxuICAgICAgaWYoIEdpYmJlcmlzaC5hbmFseXplcnMuaW5kZXhPZiggc3NkLmluICkgPT09IC0xICkge1xuICAgICAgICBHaWJiZXJpc2guYW5hbHl6ZXJzLnB1c2goIHNzZC5pbiApXG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC5kaXJ0eSggR2liYmVyaXNoLmFuYWx5emVycyApXG4gICAgfVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggc3NkLm91dCwgaGlzdG9yeUwub3V0LCAnc3NkX291dCcsIHByb3BzIClcblxuICAgIHNzZC5vdXQuY2FsbGJhY2sudWdlbk5hbWUgPSBzc2Qub3V0LnVnZW5OYW1lID0gJ3NzZF9vdXRfJyArIHNzZC5pZFxuXG4gICAgbGV0IGlkeCA9IHNzZC5vdXQuZ3JhcGgubWVtb3J5LnZhbHVlLmlkeCBcbiAgICBsZXQgbWVtb3J5ID0gR2liYmVyaXNoLmdlbmlzaC5nZW4ubWVtb3J5LmhlYXBcbiAgICBsZXQgY2FsbGJhY2sgPSBmdW5jdGlvbiggaW5wdXQgKSB7XG4gICAgICAndXNlIHN0cmljdCdcbiAgICAgIG1lbW9yeVsgaWR4IF0gPSBpbnB1dFxuICAgICAgcmV0dXJuIDAgICAgIFxuICAgIH1cbiAgICBcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggc3NkLmluLCBpbnB1dCwgJ3NzZF9pbicsIHByb3BzLCBjYWxsYmFjayApXG5cbiAgICBjYWxsYmFjay51Z2VuTmFtZSA9IHNzZC5pbi51Z2VuTmFtZSA9ICdzc2RfaW5fJyArIHNzZC5pZFxuICAgIHNzZC5pbi5pbnB1dE5hbWVzID0gWyAnaW5wdXQnIF1cbiAgICBzc2QuaW4uaW5wdXRzID0gWyBwcm9wcy5pbnB1dCBdXG4gICAgc3NkLmluLmlucHV0ID0gcHJvcHMuaW5wdXRcbiAgICBzc2QudHlwZSA9ICdhbmFseXNpcydcblxuICAgIHNzZC5pbi5saXN0ZW4gPSBmdW5jdGlvbiggdWdlbiApIHtcbiAgICAgIGlmKCB1Z2VuICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHNzZC5pbi5pbnB1dCA9IHVnZW5cbiAgICAgICAgc3NkLmluLmlucHV0cyA9IFsgdWdlbiBdXG4gICAgICB9XG5cbiAgICAgIGlmKCBHaWJiZXJpc2guYW5hbHl6ZXJzLmluZGV4T2YoIHNzZC5pbiApID09PSAtMSApIHtcbiAgICAgICAgR2liYmVyaXNoLmFuYWx5emVycy5wdXNoKCBzc2QuaW4gKVxuICAgICAgfVxuXG4gICAgICBHaWJiZXJpc2guZGlydHkoIEdpYmJlcmlzaC5hbmFseXplcnMgKVxuICAgIH1cblxuICB9XG5cbiAgc3NkLmxpc3RlbiA9IHNzZC5pbi5saXN0ZW5cbiAgc3NkLmluLnR5cGUgPSAnYW5hbHlzaXMnXG4gXG4gIHNzZC5vdXQuaW5wdXRzID0gW11cblxuICByZXR1cm4gc3NkXG59XG5cbkRlbGF5LmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBpc1N0ZXJlbzpmYWxzZVxufVxuXG5yZXR1cm4gRGVsYXlcblxufVxuIiwiY29uc3QgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IEFEID0gZnVuY3Rpb24oIGFyZ3VtZW50UHJvcHMgKSB7XG4gICAgY29uc3QgYWQgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICksXG4gICAgICAgICAgYXR0YWNrICA9IGcuaW4oICdhdHRhY2snICksXG4gICAgICAgICAgZGVjYXkgICA9IGcuaW4oICdkZWNheScgKVxuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQUQuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgY29uc3QgZ3JhcGggPSBnLmFkKCBhdHRhY2ssIGRlY2F5LCB7IHNoYXBlOnByb3BzLnNoYXBlLCBhbHBoYTpwcm9wcy5hbHBoYSB9KVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIGFkLCBncmFwaCwgJ2FkJywgcHJvcHMgKVxuXG4gICAgYWQudHJpZ2dlciA9IGdyYXBoLnRyaWdnZXJcblxuICAgIHJldHVybiBhZFxuICB9XG5cbiAgQUQuZGVmYXVsdHMgPSB7IGF0dGFjazo0NDEwMCwgZGVjYXk6NDQxMDAsIHNoYXBlOidleHBvbmVudGlhbCcsIGFscGhhOjUgfSBcblxuICByZXR1cm4gQURcblxufVxuIiwiY29uc3QgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IEFEU1IgPSBmdW5jdGlvbiggYXJndW1lbnRQcm9wcyApIHtcbiAgICBjb25zdCBhZHNyICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSxcbiAgICAgICAgICBhdHRhY2sgID0gZy5pbiggJ2F0dGFjaycgKSxcbiAgICAgICAgICBkZWNheSAgID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICAgIHN1c3RhaW4gPSBnLmluKCAnc3VzdGFpbicgKSxcbiAgICAgICAgICByZWxlYXNlID0gZy5pbiggJ3JlbGVhc2UnICksXG4gICAgICAgICAgc3VzdGFpbkxldmVsID0gZy5pbiggJ3N1c3RhaW5MZXZlbCcgKVxuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQURTUi5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBjb25zdCBncmFwaCA9IGcuYWRzciggXG4gICAgICBhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCBzdXN0YWluTGV2ZWwsIHJlbGVhc2UsIFxuICAgICAgeyB0cmlnZ2VyUmVsZWFzZTogcHJvcHMudHJpZ2dlclJlbGVhc2UsIHNoYXBlOnByb3BzLnNoYXBlLCBhbHBoYTpwcm9wcy5hbHBoYSB9IFxuICAgIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBhZHNyLCBncmFwaCwgJ2Fkc3InLCBwcm9wcyApXG5cbiAgICBhZHNyLnRyaWdnZXIgPSBncmFwaC50cmlnZ2VyXG4gICAgYWRzci5hZHZhbmNlID0gZ3JhcGgucmVsZWFzZVxuXG4gICAgcmV0dXJuIGFkc3JcbiAgfVxuXG4gIEFEU1IuZGVmYXVsdHMgPSB7IFxuICAgIGF0dGFjazoyMjA1MCwgXG4gICAgZGVjYXk6MjIwNTAsIFxuICAgIHN1c3RhaW46NDQxMDAsIFxuICAgIHN1c3RhaW5MZXZlbDouNiwgXG4gICAgcmVsZWFzZTogNDQxMDAsIFxuICAgIHRyaWdnZXJSZWxlYXNlOmZhbHNlLFxuICAgIHNoYXBlOidleHBvbmVudGlhbCcsXG4gICAgYWxwaGE6NSBcbiAgfSBcblxuICByZXR1cm4gQURTUlxufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IEVudmVsb3BlcyA9IHtcbiAgICBBRCAgICAgOiByZXF1aXJlKCAnLi9hZC5qcycgKSggR2liYmVyaXNoICksXG4gICAgQURTUiAgIDogcmVxdWlyZSggJy4vYWRzci5qcycgKSggR2liYmVyaXNoICksXG4gICAgUmFtcCAgIDogcmVxdWlyZSggJy4vcmFtcC5qcycgKSggR2liYmVyaXNoICksXG5cbiAgICBleHBvcnQgOiB0YXJnZXQgPT4ge1xuICAgICAgZm9yKCBsZXQga2V5IGluIEVudmVsb3BlcyApIHtcbiAgICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgJiYga2V5ICE9PSAnZmFjdG9yeScgKSB7XG4gICAgICAgICAgdGFyZ2V0WyBrZXkgXSA9IEVudmVsb3Blc1sga2V5IF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBmYWN0b3J5KCB1c2VBRFNSLCBzaGFwZSwgYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgc3VzdGFpbkxldmVsLCByZWxlYXNlLCB0cmlnZ2VyUmVsZWFzZT1mYWxzZSApIHtcbiAgICAgIGxldCBlbnZcblxuICAgICAgLy8gZGVsaWJlcmF0ZSB1c2Ugb2Ygc2luZ2xlID0gdG8gYWNjb21vZGF0ZSBib3RoIDEgYW5kIHRydWVcbiAgICAgIGlmKCB1c2VBRFNSICE9IHRydWUgKSB7XG4gICAgICAgIGVudiA9IGcuYWQoIGF0dGFjaywgZGVjYXksIHsgc2hhcGUgfSkgXG4gICAgICB9ZWxzZSB7XG4gICAgICAgIGVudiA9IGcuYWRzciggYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgc3VzdGFpbkxldmVsLCByZWxlYXNlLCB7IHNoYXBlLCB0cmlnZ2VyUmVsZWFzZSB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZW52XG4gICAgfVxuICB9IFxuXG4gIHJldHVybiBFbnZlbG9wZXNcbn1cbiIsImNvbnN0IHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKSxcbiAgICAgIGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBSYW1wID0gZnVuY3Rpb24oIGFyZ3VtZW50UHJvcHMgKSB7XG4gICAgY29uc3QgcmFtcCAgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApLFxuICAgICAgICAgIGxlbmd0aCA9IGcuaW4oICdsZW5ndGgnICksXG4gICAgICAgICAgZnJvbSAgID0gZy5pbiggJ2Zyb20nICksXG4gICAgICAgICAgdG8gICAgID0gZy5pbiggJ3RvJyApXG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIFJhbXAuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgY29uc3QgcmVzZXQgPSBnLmJhbmcoKVxuXG4gICAgY29uc3QgcGhhc2UgPSBnLmFjY3VtKCBnLmRpdiggMSwgbGVuZ3RoICksIHJlc2V0LCB7IHNob3VsZFdyYXA6cHJvcHMuc2hvdWxkTG9vcCwgc2hvdWxkQ2xhbXA6dHJ1ZSB9KSxcbiAgICAgICAgICBkaWZmID0gZy5zdWIoIHRvLCBmcm9tICksXG4gICAgICAgICAgZ3JhcGggPSBnLmFkZCggZnJvbSwgZy5tdWwoIHBoYXNlLCBkaWZmICkgKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHJhbXAsIGdyYXBoLCAncmFtcCcsIHByb3BzIClcblxuICAgIHJhbXAudHJpZ2dlciA9IHJlc2V0LnRyaWdnZXJcblxuICAgIHJldHVybiByYW1wXG4gIH1cblxuICBSYW1wLmRlZmF1bHRzID0geyBmcm9tOjAsIHRvOjEsIGxlbmd0aDpnLmdlbi5zYW1wbGVyYXRlLCBzaG91bGRMb29wOmZhbHNlIH1cblxuICByZXR1cm4gUmFtcFxuXG59XG4iLCIvKlxuICogaHR0cHM6Ly9naXRodWIuY29tL2FudGltYXR0ZXIxNS9oZWFwcXVldWUuanMvYmxvYi9tYXN0ZXIvaGVhcHF1ZXVlLmpzXG4gKlxuICogVGhpcyBpbXBsZW1lbnRhdGlvbiBpcyB2ZXJ5IGxvb3NlbHkgYmFzZWQgb2ZmIGpzLXByaW9yaXR5LXF1ZXVlXG4gKiBieSBBZGFtIEhvb3BlciBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9hZGFtaG9vcGVyL2pzLXByaW9yaXR5LXF1ZXVlXG4gKlxuICogVGhlIGpzLXByaW9yaXR5LXF1ZXVlIGltcGxlbWVudGF0aW9uIHNlZW1lZCBhIHRlZW5zeSBiaXQgYmxvYXRlZFxuICogd2l0aCBpdHMgcmVxdWlyZS5qcyBkZXBlbmRlbmN5IGFuZCBtdWx0aXBsZSBzdG9yYWdlIHN0cmF0ZWdpZXNcbiAqIHdoZW4gYWxsIGJ1dCBvbmUgd2VyZSBzdHJvbmdseSBkaXNjb3VyYWdlZC4gU28gaGVyZSBpcyBhIGtpbmQgb2ZcbiAqIGNvbmRlbnNlZCB2ZXJzaW9uIG9mIHRoZSBmdW5jdGlvbmFsaXR5IHdpdGggb25seSB0aGUgZmVhdHVyZXMgdGhhdFxuICogSSBwYXJ0aWN1bGFybHkgbmVlZGVkLlxuICpcbiAqIFVzaW5nIGl0IGlzIHByZXR0eSBzaW1wbGUsIHlvdSBqdXN0IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiBIZWFwUXVldWVcbiAqIHdoaWxlIG9wdGlvbmFsbHkgc3BlY2lmeWluZyBhIGNvbXBhcmF0b3IgYXMgdGhlIGFyZ3VtZW50OlxuICpcbiAqIHZhciBoZWFwcSA9IG5ldyBIZWFwUXVldWUoKTtcbiAqXG4gKiB2YXIgY3VzdG9tcSA9IG5ldyBIZWFwUXVldWUoZnVuY3Rpb24oYSwgYil7XG4gKiAgIC8vIGlmIGIgPiBhLCByZXR1cm4gbmVnYXRpdmVcbiAqICAgLy8gbWVhbnMgdGhhdCBpdCBzcGl0cyBvdXQgdGhlIHNtYWxsZXN0IGl0ZW0gZmlyc3RcbiAqICAgcmV0dXJuIGEgLSBiO1xuICogfSk7XG4gKlxuICogTm90ZSB0aGF0IGluIHRoaXMgY2FzZSwgdGhlIGRlZmF1bHQgY29tcGFyYXRvciBpcyBpZGVudGljYWwgdG9cbiAqIHRoZSBjb21wYXJhdG9yIHdoaWNoIGlzIHVzZWQgZXhwbGljaXRseSBpbiB0aGUgc2Vjb25kIHF1ZXVlLlxuICpcbiAqIE9uY2UgeW91J3ZlIGluaXRpYWxpemVkIHRoZSBoZWFwcXVldWUsIHlvdSBjYW4gcGxvcCBzb21lIG5ld1xuICogZWxlbWVudHMgaW50byB0aGUgcXVldWUgd2l0aCB0aGUgcHVzaCBtZXRob2QgKHZhZ3VlbHkgcmVtaW5pc2NlbnRcbiAqIG9mIHR5cGljYWwgamF2YXNjcmlwdCBhcmF5cylcbiAqXG4gKiBoZWFwcS5wdXNoKDQyKTtcbiAqIGhlYXBxLnB1c2goXCJraXR0ZW5cIik7XG4gKlxuICogVGhlIHB1c2ggbWV0aG9kIHJldHVybnMgdGhlIG5ldyBudW1iZXIgb2YgZWxlbWVudHMgb2YgdGhlIHF1ZXVlLlxuICpcbiAqIFlvdSBjYW4gcHVzaCBhbnl0aGluZyB5b3UnZCBsaWtlIG9udG8gdGhlIHF1ZXVlLCBzbyBsb25nIGFzIHlvdXJcbiAqIGNvbXBhcmF0b3IgZnVuY3Rpb24gaXMgY2FwYWJsZSBvZiBoYW5kbGluZyBpdC4gVGhlIGRlZmF1bHRcbiAqIGNvbXBhcmF0b3IgaXMgcmVhbGx5IHN0dXBpZCBzbyBpdCB3b24ndCBiZSBhYmxlIHRvIGhhbmRsZSBhbnl0aGluZ1xuICogb3RoZXIgdGhhbiBhbiBudW1iZXIgYnkgZGVmYXVsdC5cbiAqXG4gKiBZb3UgY2FuIHByZXZpZXcgdGhlIHNtYWxsZXN0IGl0ZW0gYnkgdXNpbmcgcGVlay5cbiAqXG4gKiBoZWFwcS5wdXNoKC05OTk5KTtcbiAqIGhlYXBxLnBlZWsoKTsgLy8gPT0+IC05OTk5XG4gKlxuICogVGhlIHVzZWZ1bCBjb21wbGVtZW50IHRvIHRvIHRoZSBwdXNoIG1ldGhvZCBpcyB0aGUgcG9wIG1ldGhvZCxcbiAqIHdoaWNoIHJldHVybnMgdGhlIHNtYWxsZXN0IGl0ZW0gYW5kIHRoZW4gcmVtb3ZlcyBpdCBmcm9tIHRoZVxuICogcXVldWUuXG4gKlxuICogaGVhcHEucHVzaCgxKTtcbiAqIGhlYXBxLnB1c2goMik7XG4gKiBoZWFwcS5wdXNoKDMpO1xuICogaGVhcHEucG9wKCk7IC8vID09PiAxXG4gKiBoZWFwcS5wb3AoKTsgLy8gPT0+IDJcbiAqIGhlYXBxLnBvcCgpOyAvLyA9PT4gM1xuICovXG5sZXQgSGVhcFF1ZXVlID0gZnVuY3Rpb24oY21wKXtcbiAgdGhpcy5jbXAgPSAoY21wIHx8IGZ1bmN0aW9uKGEsIGIpeyByZXR1cm4gYSAtIGI7IH0pO1xuICB0aGlzLmxlbmd0aCA9IDA7XG4gIHRoaXMuZGF0YSA9IFtdO1xufVxuSGVhcFF1ZXVlLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMuZGF0YVswXTtcbn07XG5IZWFwUXVldWUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbih2YWx1ZSl7XG4gIHRoaXMuZGF0YS5wdXNoKHZhbHVlKTtcblxuICB2YXIgcG9zID0gdGhpcy5kYXRhLmxlbmd0aCAtIDEsXG4gIHBhcmVudCwgeDtcblxuICB3aGlsZShwb3MgPiAwKXtcbiAgICBwYXJlbnQgPSAocG9zIC0gMSkgPj4+IDE7XG4gICAgaWYodGhpcy5jbXAodGhpcy5kYXRhW3Bvc10sIHRoaXMuZGF0YVtwYXJlbnRdKSA8IDApe1xuICAgICAgeCA9IHRoaXMuZGF0YVtwYXJlbnRdO1xuICAgICAgdGhpcy5kYXRhW3BhcmVudF0gPSB0aGlzLmRhdGFbcG9zXTtcbiAgICAgIHRoaXMuZGF0YVtwb3NdID0geDtcbiAgICAgIHBvcyA9IHBhcmVudDtcbiAgICB9ZWxzZSBicmVhaztcbiAgfVxuICByZXR1cm4gdGhpcy5sZW5ndGgrKztcbn07XG5IZWFwUXVldWUucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBsYXN0X3ZhbCA9IHRoaXMuZGF0YS5wb3AoKSxcbiAgcmV0ID0gdGhpcy5kYXRhWzBdO1xuICBpZih0aGlzLmRhdGEubGVuZ3RoID4gMCl7XG4gICAgdGhpcy5kYXRhWzBdID0gbGFzdF92YWw7XG4gICAgdmFyIHBvcyA9IDAsXG4gICAgbGFzdCA9IHRoaXMuZGF0YS5sZW5ndGggLSAxLFxuICAgIGxlZnQsIHJpZ2h0LCBtaW5JbmRleCwgeDtcbiAgICB3aGlsZSgxKXtcbiAgICAgIGxlZnQgPSAocG9zIDw8IDEpICsgMTtcbiAgICAgIHJpZ2h0ID0gbGVmdCArIDE7XG4gICAgICBtaW5JbmRleCA9IHBvcztcbiAgICAgIGlmKGxlZnQgPD0gbGFzdCAmJiB0aGlzLmNtcCh0aGlzLmRhdGFbbGVmdF0sIHRoaXMuZGF0YVttaW5JbmRleF0pIDwgMCkgbWluSW5kZXggPSBsZWZ0O1xuICAgICAgaWYocmlnaHQgPD0gbGFzdCAmJiB0aGlzLmNtcCh0aGlzLmRhdGFbcmlnaHRdLCB0aGlzLmRhdGFbbWluSW5kZXhdKSA8IDApIG1pbkluZGV4ID0gcmlnaHQ7XG4gICAgICBpZihtaW5JbmRleCAhPT0gcG9zKXtcbiAgICAgICAgeCA9IHRoaXMuZGF0YVttaW5JbmRleF07XG4gICAgICAgIHRoaXMuZGF0YVttaW5JbmRleF0gPSB0aGlzLmRhdGFbcG9zXTtcbiAgICAgICAgdGhpcy5kYXRhW3Bvc10gPSB4O1xuICAgICAgICBwb3MgPSBtaW5JbmRleDtcbiAgICAgIH1lbHNlIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXQgPSBsYXN0X3ZhbDtcbiAgfVxuICB0aGlzLmxlbmd0aC0tO1xuICByZXR1cm4gcmV0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFwUXVldWVcbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuIFxuLy8gY29uc3RydWN0b3IgZm9yIHNjaHJvZWRlciBhbGxwYXNzIGZpbHRlcnNcbmxldCBhbGxQYXNzID0gZnVuY3Rpb24oIF9pbnB1dCwgbGVuZ3RoPTUwMCwgZmVlZGJhY2s9LjUgKSB7XG4gIGxldCBpbmRleCAgPSBnLmNvdW50ZXIoIDEsMCxsZW5ndGggKSxcbiAgICAgIGJ1ZmZlciA9IGcuZGF0YSggbGVuZ3RoICksXG4gICAgICBidWZmZXJTYW1wbGUgPSBnLnBlZWsoIGJ1ZmZlciwgaW5kZXgsIHsgaW50ZXJwOidub25lJywgbW9kZTonc2FtcGxlcycgfSksXG4gICAgICBvdXQgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggLTEsIF9pbnB1dCksIGJ1ZmZlclNhbXBsZSApIClcbiAgICAgICAgICAgICAgICBcbiAgZy5wb2tlKCBidWZmZXIsIGcuYWRkKCBfaW5wdXQsIGcubXVsKCBidWZmZXJTYW1wbGUsIGZlZWRiYWNrICkgKSwgaW5kZXggKVxuIFxuICByZXR1cm4gb3V0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWxsUGFzc1xuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGZpbHRlciA9IHJlcXVpcmUoICcuL2ZpbHRlci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgR2liYmVyaXNoLmdlbmlzaC5iaXF1YWQgPSAoIGlucHV0LCBjdXRvZmYsIF9RLCBtb2RlLCBpc1N0ZXJlbyApID0+IHtcbiAgICBsZXQgYTAsYTEsYTIsYyxiMSxiMixcbiAgICAgICAgaW4xYTAseDFhMSx4MmEyLHkxYjEseTJiMixcbiAgICAgICAgaW4xYTBfMSx4MWExXzEseDJhMl8xLHkxYjFfMSx5MmIyXzFcblxuICAgIGxldCByZXR1cm5WYWx1ZVxuICAgIFxuICAgIGNvbnN0IFEgPSBnLm1lbW8oIGcuYWRkKCAuNSwgZy5tdWwoIF9RLCAyMiApICkgKVxuICAgIGxldCB4MSA9IGcuaGlzdG9yeSgpLCB4MiA9IGcuaGlzdG9yeSgpLCB5MSA9IGcuaGlzdG9yeSgpLCB5MiA9IGcuaGlzdG9yeSgpXG4gICAgXG4gICAgbGV0IHcwID0gZy5tZW1vKCBnLm11bCggMiAqIE1hdGguUEksIGcuZGl2KCBjdXRvZmYsICBnLmdlbi5zYW1wbGVyYXRlICkgKSApLFxuICAgICAgICBzaW53MCA9IGcuc2luKCB3MCApLFxuICAgICAgICBjb3N3MCA9IGcuY29zKCB3MCApLFxuICAgICAgICBhbHBoYSA9IGcubWVtbyggZy5kaXYoIHNpbncwLCBnLm11bCggMiwgUSApICkgKVxuXG4gICAgbGV0IG9uZU1pbnVzQ29zVyA9IGcuc3ViKCAxLCBjb3N3MCApXG5cbiAgICBzd2l0Y2goIG1vZGUgKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGEwID0gZy5tZW1vKCBnLmRpdiggZy5hZGQoIDEsIGNvc3cwKSAsIDIpIClcbiAgICAgICAgYTEgPSBnLm11bCggZy5hZGQoIDEsIGNvc3cwICksIC0xIClcbiAgICAgICAgYTIgPSBhMFxuICAgICAgICBjICA9IGcuYWRkKCAxLCBhbHBoYSApXG4gICAgICAgIGIxID0gZy5tdWwoIC0yICwgY29zdzAgKVxuICAgICAgICBiMiA9IGcuc3ViKCAxLCBhbHBoYSApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBhMCA9IGcubXVsKCBRLCBhbHBoYSApXG4gICAgICAgIGExID0gMFxuICAgICAgICBhMiA9IGcubXVsKCBhMCwgLTEgKVxuICAgICAgICBjICA9IGcuYWRkKCAxLCBhbHBoYSApXG4gICAgICAgIGIxID0gZy5tdWwoIC0yICwgY29zdzAgKVxuICAgICAgICBiMiA9IGcuc3ViKCAxLCBhbHBoYSApXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDogLy8gTFBcbiAgICAgICAgYTAgPSBnLm1lbW8oIGcuZGl2KCBvbmVNaW51c0Nvc1csIDIpIClcbiAgICAgICAgYTEgPSBvbmVNaW51c0Nvc1dcbiAgICAgICAgYTIgPSBhMFxuICAgICAgICBjICA9IGcuYWRkKCAxLCBhbHBoYSApXG4gICAgICAgIGIxID0gZy5tdWwoIC0yICwgY29zdzAgKVxuICAgICAgICBiMiA9IGcuc3ViKCAxLCBhbHBoYSApXG4gICAgfVxuXG4gICAgYTAgPSBnLmRpdiggYTAsIGMgKTsgYTEgPSBnLmRpdiggYTEsIGMgKTsgYTIgPSBnLmRpdiggYTIsIGMgKVxuICAgIGIxID0gZy5kaXYoIGIxLCBjICk7IGIyID0gZy5kaXYoIGIyLCBjIClcblxuICAgIGluMWEwID0gZy5tdWwoIHgxLmluKCBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXQgKSwgYTAgKVxuICAgIHgxYTEgID0gZy5tdWwoIHgyLmluKCB4MS5vdXQgKSwgYTEgKVxuICAgIHgyYTIgID0gZy5tdWwoIHgyLm91dCwgICAgICAgICAgYTIgKVxuXG4gICAgbGV0IHN1bUxlZnQgPSBnLmFkZCggaW4xYTAsIHgxYTEsIHgyYTIgKVxuXG4gICAgeTFiMSA9IGcubXVsKCB5Mi5pbiggeTEub3V0ICksIGIxIClcbiAgICB5MmIyID0gZy5tdWwoIHkyLm91dCwgYjIgKVxuXG4gICAgbGV0IHN1bVJpZ2h0ID0gZy5hZGQoIHkxYjEsIHkyYjIgKVxuXG4gICAgbGV0IGRpZmYgPSBnLnN1Yiggc3VtTGVmdCwgc3VtUmlnaHQgKVxuXG4gICAgeTEuaW4oIGRpZmYgKVxuXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgbGV0IHgxXzEgPSBnLmhpc3RvcnkoKSwgeDJfMSA9IGcuaGlzdG9yeSgpLCB5MV8xID0gZy5oaXN0b3J5KCksIHkyXzEgPSBnLmhpc3RvcnkoKVxuXG4gICAgICBpbjFhMF8xID0gZy5tdWwoIHgxXzEuaW4oIGlucHV0WzFdICksIGEwIClcbiAgICAgIHgxYTFfMSAgPSBnLm11bCggeDJfMS5pbiggeDFfMS5vdXQgKSwgYTEgKVxuICAgICAgeDJhMl8xICA9IGcubXVsKCB4Ml8xLm91dCwgICAgICAgICAgICBhMiApXG5cbiAgICAgIGxldCBzdW1MZWZ0XzEgPSBnLmFkZCggaW4xYTBfMSwgeDFhMV8xLCB4MmEyXzEgKVxuXG4gICAgICB5MWIxXzEgPSBnLm11bCggeTJfMS5pbiggeTFfMS5vdXQgKSwgYjEgKVxuICAgICAgeTJiMl8xID0gZy5tdWwoIHkyXzEub3V0LCBiMiApXG5cbiAgICAgIGxldCBzdW1SaWdodF8xID0gZy5hZGQoIHkxYjFfMSwgeTJiMl8xIClcblxuICAgICAgbGV0IGRpZmZfMSA9IGcuc3ViKCBzdW1MZWZ0XzEsIHN1bVJpZ2h0XzEgKVxuXG4gICAgICB5MV8xLmluKCBkaWZmXzEgKVxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgZGlmZiwgZGlmZl8xIF1cbiAgICB9ZWxzZXtcbiAgICAgIHJldHVyblZhbHVlID0gZGlmZlxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbiAgbGV0IEJpcXVhZCA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGxldCBiaXF1YWQgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIE9iamVjdC5hc3NpZ24oIGJpcXVhZCwgQmlxdWFkLmRlZmF1bHRzLCBpbnB1dFByb3BzICkgXG5cbiAgICBsZXQgaXNTdGVyZW8gPSBiaXF1YWQuaW5wdXQuaXNTdGVyZW9cblxuICAgIGJpcXVhZC5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgICBiaXF1YWQuZ3JhcGggPSBHaWJiZXJpc2guZ2VuaXNoLmJpcXVhZCggZy5pbignaW5wdXQnKSwgZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBnLmdlbi5zYW1wbGVyYXRlIC8gNCApLCAgZy5pbignUScpLCBiaXF1YWQubW9kZSwgaXNTdGVyZW8gKVxuICAgIH1cblxuICAgIGJpcXVhZC5fX2NyZWF0ZUdyYXBoKClcbiAgICBiaXF1YWQuX19yZXF1aXJlc1JlY29tcGlsYXRpb24gPSBbICdtb2RlJyBdXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIGJpcXVhZCxcbiAgICAgIGJpcXVhZC5ncmFwaCxcbiAgICAgICdiaXF1YWQnLCBcbiAgICAgIGJpcXVhZFxuICAgIClcblxuICAgIHJldHVybiBiaXF1YWRcbiAgfVxuXG4gIEJpcXVhZC5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIFE6IC4xNSxcbiAgICBjdXRvZmY6LjA1LFxuICAgIG1vZGU6MFxuICB9XG5cbiAgcmV0dXJuIEJpcXVhZFxuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5sZXQgY29tYkZpbHRlciA9IGZ1bmN0aW9uKCBfaW5wdXQsIGNvbWJMZW5ndGgsIGRhbXBpbmc9LjUqLjQsIGZlZWRiYWNrQ29lZmY9Ljg0ICkge1xuICBsZXQgbGFzdFNhbXBsZSAgID0gZy5oaXN0b3J5KCksXG4gIFx0ICByZWFkV3JpdGVJZHggPSBnLmNvdW50ZXIoIDEsMCxjb21iTGVuZ3RoICksXG4gICAgICBjb21iQnVmZmVyICAgPSBnLmRhdGEoIGNvbWJMZW5ndGggKSxcblx0ICAgIG91dCAgICAgICAgICA9IGcucGVlayggY29tYkJ1ZmZlciwgcmVhZFdyaXRlSWR4LCB7IGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pLFxuICAgICAgc3RvcmVJbnB1dCAgID0gZy5tZW1vKCBnLmFkZCggZy5tdWwoIG91dCwgZy5zdWIoIDEsIGRhbXBpbmcpKSwgZy5tdWwoIGxhc3RTYW1wbGUub3V0LCBkYW1waW5nICkgKSApXG4gICAgICBcbiAgbGFzdFNhbXBsZS5pbiggc3RvcmVJbnB1dCApXG4gXG4gIGcucG9rZSggY29tYkJ1ZmZlciwgZy5hZGQoIF9pbnB1dCwgZy5tdWwoIHN0b3JlSW5wdXQsIGZlZWRiYWNrQ29lZmYgKSApLCByZWFkV3JpdGVJZHggKVxuIFxuICByZXR1cm4gb3V0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29tYkZpbHRlclxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBmaWx0ZXIgPSByZXF1aXJlKCAnLi9maWx0ZXIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBHaWJiZXJpc2guZ2VuaXNoLmRpb2RlWkRGID0gKCBpbnB1dCwgX1EsIGZyZXEsIHNhdHVyYXRpb24sIGlzU3RlcmVvPWZhbHNlICkgPT4ge1xuICAgIGNvbnN0IGlUID0gMSAvIGcuZ2VuLnNhbXBsZXJhdGUsXG4gICAgICAgICAga3oxID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIGt6MiA9IGcuaGlzdG9yeSgwKSxcbiAgICAgICAgICBrejMgPSBnLmhpc3RvcnkoMCksXG4gICAgICAgICAga3o0ID0gZy5oaXN0b3J5KDApXG5cbiAgICBsZXQgICBrYTEgPSAxLjAsXG4gICAgICAgICAga2EyID0gMC41LFxuICAgICAgICAgIGthMyA9IDAuNSxcbiAgICAgICAgICBrYTQgPSAwLjUsXG4gICAgICAgICAga2luZHggPSAwICAgXG5cbiAgICBjb25zdCBRID0gZy5tZW1vKCBnLmFkZCggLjUsIGcubXVsKCBfUSwgMTEgKSApIClcbiAgICAvLyBrd2QgPSAyICogJE1fUEkgKiBhY2Zba2luZHhdXG4gICAgY29uc3Qga3dkID0gZy5tZW1vKCBnLm11bCggTWF0aC5QSSAqIDIsIGZyZXEgKSApXG5cbiAgICAvLyBrd2EgPSAoMi9pVCkgKiB0YW4oa3dkICogaVQvMikgXG4gICAgY29uc3Qga3dhID1nLm1lbW8oIGcubXVsKCAyL2lULCBnLnRhbiggZy5tdWwoIGt3ZCwgaVQvMiApICkgKSApXG5cbiAgICAvLyBrRyAgPSBrd2EgKiBpVC8yIFxuICAgIGNvbnN0IGtnID0gZy5tZW1vKCBnLm11bCgga3dhLCBpVC8yICkgKVxuICAgIFxuICAgIGNvbnN0IGtHNCA9IGcubWVtbyggZy5tdWwoIC41LCBnLmRpdigga2csIGcuYWRkKCAxLCBrZyApICkgKSApXG4gICAgY29uc3Qga0czID0gZy5tZW1vKCBnLm11bCggLjUsIGcuZGl2KCBrZywgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCggZy5tdWwoIC41LCBrZyApLCBrRzQgKSApICkgKSApXG4gICAgY29uc3Qga0cyID0gZy5tZW1vKCBnLm11bCggLjUsIGcuZGl2KCBrZywgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCggZy5tdWwoIC41LCBrZyApLCBrRzMgKSApICkgKSApXG4gICAgY29uc3Qga0cxID0gZy5tZW1vKCBnLmRpdigga2csIGcuc3ViKCBnLmFkZCggMSwga2cgKSwgZy5tdWwoIGtnLCBrRzIgKSApICkgKVxuXG4gICAgY29uc3Qga0dBTU1BID0gZy5tZW1vKCBnLm11bCggZy5tdWwoIGtHNCwga0czICkgLCBnLm11bCgga0cyLCBrRzEgKSApIClcblxuICAgIGNvbnN0IGtTRzEgPSBnLm1lbW8oIGcubXVsKCBnLm11bCgga0c0LCBrRzMgKSwga0cyICkgKSBcblxuICAgIGNvbnN0IGtTRzIgPSBnLm1lbW8oIGcubXVsKCBrRzQsIGtHMykgKSAgXG4gICAgY29uc3Qga1NHMyA9IGtHNCBcbiAgICBsZXQga1NHNCA9IDEuMCBcbiAgICAvLyBrayA9IDQuMCooa1EgLSAwLjUpLygyNS4wIC0gMC41KVxuICAgIGNvbnN0IGthbHBoYSA9IGcubWVtbyggZy5kaXYoIGtnLCBnLmFkZCgxLjAsIGtnKSApIClcblxuICAgIGNvbnN0IGtiZXRhMSA9IGcubWVtbyggZy5kaXYoIDEuMCwgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCgga2csIGtHMiApICkgKSApXG4gICAgY29uc3Qga2JldGEyID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBnLm11bCggLjUsIGtnICksIGtHMyApICkgKSApXG4gICAgY29uc3Qga2JldGEzID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBnLm11bCggLjUsIGtnICksIGtHNCApICkgKSApXG4gICAgY29uc3Qga2JldGE0ID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLmFkZCggMSwga2cgKSApICkgXG5cbiAgICBjb25zdCBrZ2FtbWExID0gZy5tZW1vKCBnLmFkZCggMSwgZy5tdWwoIGtHMSwga0cyICkgKSApXG4gICAgY29uc3Qga2dhbW1hMiA9IGcubWVtbyggZy5hZGQoIDEsIGcubXVsKCBrRzIsIGtHMyApICkgKVxuICAgIGNvbnN0IGtnYW1tYTMgPSBnLm1lbW8oIGcuYWRkKCAxLCBnLm11bCgga0czLCBrRzQgKSApIClcblxuICAgIGNvbnN0IGtkZWx0YTEgPSBrZ1xuICAgIGNvbnN0IGtkZWx0YTIgPSBnLm1lbW8oIGcubXVsKCAwLjUsIGtnICkgKVxuICAgIGNvbnN0IGtkZWx0YTMgPSBnLm1lbW8oIGcubXVsKCAwLjUsIGtnICkgKVxuXG4gICAgY29uc3Qga2Vwc2lsb24xID0ga0cyXG4gICAgY29uc3Qga2Vwc2lsb24yID0ga0czXG4gICAgY29uc3Qga2Vwc2lsb24zID0ga0c0XG5cbiAgICBjb25zdCBrbGFzdGN1dCA9IGZyZXFcblxuICAgIC8vOzsgZmVlZGJhY2sgaW5wdXRzIFxuICAgIGNvbnN0IGtmYjQgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTQgLCBrejQub3V0ICkgKSBcbiAgICBjb25zdCBrZmIzID0gZy5tZW1vKCBnLm11bCgga2JldGEzLCBnLmFkZCgga3ozLm91dCwgZy5tdWwoIGtmYjQsIGtkZWx0YTMgKSApICkgKVxuICAgIGNvbnN0IGtmYjIgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTIsIGcuYWRkKCBrejIub3V0LCBnLm11bCgga2ZiMywga2RlbHRhMiApICkgKSApXG5cbiAgICAvLzs7IGZlZWRiYWNrIHByb2Nlc3NcblxuICAgIGNvbnN0IGtmYm8xID0gZy5tZW1vKCBnLm11bCgga2JldGExLCBnLmFkZCgga3oxLm91dCwgZy5tdWwoIGtmYjIsIGtkZWx0YTEgKSApICkgKSBcbiAgICBjb25zdCBrZmJvMiA9IGcubWVtbyggZy5tdWwoIGtiZXRhMiwgZy5hZGQoIGt6Mi5vdXQsIGcubXVsKCBrZmIzLCBrZGVsdGEyICkgKSApICkgXG4gICAgY29uc3Qga2ZibzMgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTMsIGcuYWRkKCBrejMub3V0LCBnLm11bCgga2ZiNCwga2RlbHRhMyApICkgKSApIFxuICAgIGNvbnN0IGtmYm80ID0ga2ZiNFxuXG4gICAgY29uc3Qga1NJR01BID0gZy5tZW1vKCBcbiAgICAgIGcuYWRkKCBcbiAgICAgICAgZy5hZGQoIFxuICAgICAgICAgIGcubXVsKCBrU0cxLCBrZmJvMSApLCBcbiAgICAgICAgICBnLm11bCgga1NHMiwga2ZibzIgKVxuICAgICAgICApLCBcbiAgICAgICAgZy5hZGQoXG4gICAgICAgICAgZy5tdWwoIGtTRzMsIGtmYm8zICksIFxuICAgICAgICAgIGcubXVsKCBrU0c0LCBrZmJvNCApXG4gICAgICAgICkgXG4gICAgICApIFxuICAgIClcblxuICAgIC8vY29uc3Qga1NJR01BID0gMVxuICAgIC8vOzsgbm9uLWxpbmVhciBwcm9jZXNzaW5nXG4gICAgLy9pZiAoa25scCA9PSAxKSB0aGVuXG4gICAgLy8gIGtpbiA9ICgxLjAgLyB0YW5oKGtzYXR1cmF0aW9uKSkgKiB0YW5oKGtzYXR1cmF0aW9uICoga2luKVxuICAgIC8vZWxzZWlmIChrbmxwID09IDIpIHRoZW5cbiAgICAvLyAga2luID0gdGFuaChrc2F0dXJhdGlvbiAqIGtpbikgXG4gICAgLy9lbmRpZlxuICAgIC8vXG4gICAgLy9jb25zdCBraW4gPSBpbnB1dCBcbiAgICBsZXQga2luID0gaW5wdXQvL2cubWVtbyggZy5tdWwoIGcuZGl2KCAxLCBnLnRhbmgoIHNhdHVyYXRpb24gKSApLCBnLnRhbmgoIGcubXVsKCBzYXR1cmF0aW9uLCBpbnB1dCApICkgKSApXG4gICAga2luID0gZy50YW5oKCBnLm11bCggc2F0dXJhdGlvbiwga2luICkgKVxuXG4gICAgY29uc3Qga3VuID0gZy5kaXYoIGcuc3ViKCBraW4sIGcubXVsKCBRLCBrU0lHTUEgKSApLCBnLmFkZCggMSwgZy5tdWwoIFEsIGtHQU1NQSApICkgKVxuICAgIC8vY29uc3Qga3VuID0gZy5kaXYoIDEsIGcuYWRkKCAxLCBnLm11bCggUSwga0dBTU1BICkgKSApXG4gICAgICAgIC8vKGtpbiAtIGtrICoga1NJR01BKSAvICgxLjAgKyBrayAqIGtHQU1NQSlcblxuICAgIC8vOzsgMXN0IHN0YWdlXG4gICAgbGV0IGt4aW4gPSBnLm1lbW8oIGcuYWRkKCBnLmFkZCggZy5tdWwoIGt1biwga2dhbW1hMSApLCBrZmIyKSwgZy5tdWwoIGtlcHNpbG9uMSwga2ZibzEgKSApIClcbiAgICAvLyAoa3VuICoga2dhbW1hMSArIGtmYjIgKyBrZXBzaWxvbjEgKiBrZmJvMSlcbiAgICBsZXQga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthMSwga3hpbiApLCBrejEub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGxldCBrbHAgPSBnLmFkZCgga3YsIGt6MS5vdXQgKVxuICAgIC8va2xwID0ga3YgKyBrejFcbiAgICBrejEuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKSBcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAgICAgLy87OyAybmQgc3RhZ2VcbiAgICAvL2t4aW4gPSAoa2xwICoga2dhbW1hMiArIGtmYjMgKyBrZXBzaWxvbjIgKiBrZmJvMilcbiAgICAvL2t2ID0gKGthMiAqIGt4aW4gLSBrejIpICoga2FscGhhIFxuICAgIC8va2xwID0ga3YgKyBrejJcbiAgICAvL2t6MiA9IGtscCArIGt2XG5cbiAgICBreGluID0gZy5tZW1vKCBnLmFkZCggZy5hZGQoIGcubXVsKCBrbHAsIGtnYW1tYTIgKSwga2ZiMyksIGcubXVsKCBrZXBzaWxvbjIsIGtmYm8yICkgKSApXG4gICAgLy8gKGt1biAqIGtnYW1tYTEgKyBrZmIyICsga2Vwc2lsb24xICoga2ZibzEpXG4gICAga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthMiwga3hpbiApLCBrejIub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGtscCA9IGcuYWRkKCBrdiwga3oyLm91dCApIFxuICAgIC8va2xwID0ga3YgKyBrejFcbiAgICBrejIuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKSBcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAvLzs7IDNyZCBzdGFnZVxuICAgIC8va3hpbiA9IChrbHAgKiBrZ2FtbWEzICsga2ZiNCArIGtlcHNpbG9uMyAqIGtmYm8zKVxuICAgIC8va3YgPSAoa2EzICoga3hpbiAtIGt6MykgKiBrYWxwaGEgXG4gICAgLy9rbHAgPSBrdiArIGt6M1xuICAgIC8va3ozID0ga2xwICsga3ZcblxuICAgIGt4aW4gPSBnLm1lbW8oIGcuYWRkKCBnLmFkZCggZy5tdWwoIGtscCwga2dhbW1hMyApLCBrZmI0KSwgZy5tdWwoIGtlcHNpbG9uMywga2ZibzMgKSApIClcbiAgICAvLyAoa3VuICoga2dhbW1hMSArIGtmYjIgKyBrZXBzaWxvbjEgKiBrZmJvMSlcbiAgICBrdiA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBnLm11bCgga2EzLCBreGluICksIGt6My5vdXQgKSwga2FscGhhICkgKVxuICAgIC8va3YgPSAoa2ExICoga3hpbiAtIGt6MSkgKiBrYWxwaGEgXG4gICAga2xwID0gZy5hZGQoIGt2LCBrejMub3V0IClcbiAgICAvL2tscCA9IGt2ICsga3oxXG4gICAga3ozLmluKCBnLmFkZCgga2xwLCBrdiApIClcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAvLzs7IDR0aCBzdGFnZVxuICAgIC8va3YgPSAoa2E0ICoga2xwIC0ga3o0KSAqIGthbHBoYSBcbiAgICAvL2tscCA9IGt2ICsga3o0XG4gICAgLy9rejQgPSBrbHAgKyBrdlxuXG4gICAgLy8gKGt1biAqIGtnYW1tYTEgKyBrZmIyICsga2Vwc2lsb24xICoga2ZibzEpXG4gICAga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthNCwga3hpbiApLCBrejQub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGtscCA9IGcuYWRkKCBrdiwga3o0Lm91dCApXG4gICAgLy9rbHAgPSBrdiArIGt6MVxuICAgIGt6NC5pbiggZy5hZGQoIGtscCwga3YgKSApXG5cbiAgICAvL2t6MSA9IGtscCArIGt2XG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgLy9sZXQgcG9sZXNSID0gZy5kYXRhKFsgMCwwLDAsMCBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgIC8vICAgIHJlenpSID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzUlszXSwgcmV6ICkgKSxcbiAgICAgIC8vICAgIG91dHB1dFIgPSBnLnN1YiggaW5wdXRbMV0sIHJlenpSICkgICAgICAgICBcblxuICAgICAgLy9wb2xlc1JbMF0gPSBnLmFkZCggcG9sZXNSWzBdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMF0gKSwgb3V0cHV0UiAgICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMV0gPSBnLmFkZCggcG9sZXNSWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMV0gKSwgcG9sZXNSWzBdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMl0gPSBnLmFkZCggcG9sZXNSWzJdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMl0gKSwgcG9sZXNSWzFdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbM10gPSBnLmFkZCggcG9sZXNSWzNdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbM10gKSwgcG9sZXNSWzJdICksIGN1dG9mZiApKVxuXG4gICAgICAvL2xldCByaWdodCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzUlszXSwgZy5zdWIoIG91dHB1dFIsIHBvbGVzUlszXSApIClcblxuICAgICAgLy9yZXR1cm5WYWx1ZSA9IFtsZWZ0LCByaWdodF1cbiAgICB9ZWxzZXtcbiAgICAgLy8gcmV0dXJuVmFsdWUgPSBrbHBcbiAgICB9XG4gICAgcmV0dXJuVmFsdWUgPSBrbHBcbiAgICBcbiAgICByZXR1cm4gcmV0dXJuVmFsdWUvLyBrbHAvL3JldHVyblZhbHVlXG4gfVxuXG4gIGNvbnN0IERpb2RlWkRGID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgY29uc3QgemRmICAgICAgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIGNvbnN0IHByb3BzICAgID0gT2JqZWN0LmFzc2lnbigge30sIERpb2RlWkRGLmRlZmF1bHRzLCBmaWx0ZXIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIHpkZiwgXG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLmRpb2RlWkRGKCBnLmluKCdpbnB1dCcpLCBnLmluKCdRJyksIGcuaW4oJ2N1dG9mZicpLCBnLmluKCdzYXR1cmF0aW9uJyksIGlzU3RlcmVvICksIFxuICAgICAgJ2Rpb2RlWkRGJyxcbiAgICAgIHByb3BzXG4gICAgKVxuXG4gICAgcmV0dXJuIHpkZlxuICB9XG5cbiAgRGlvZGVaREYuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICBROiA1LFxuICAgIHNhdHVyYXRpb246IDEsXG4gICAgY3V0b2ZmOiA0NDAsXG4gIH1cblxuICByZXR1cm4gRGlvZGVaREZcblxufVxuIiwibGV0IHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5sZXQgZmlsdGVyID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbk9iamVjdC5hc3NpZ24oIGZpbHRlciwge1xuICBkZWZhdWx0czogeyBieXBhc3M6ZmFsc2UgfSBcbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gZmlsdGVyXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZmlsdGVyID0gcmVxdWlyZSggJy4vZmlsdGVyLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBHaWJiZXJpc2guZ2VuaXNoLmZpbHRlcjI0ID0gKCBpbnB1dCwgX3JleiwgX2N1dG9mZiwgaXNMb3dQYXNzLCBpc1N0ZXJlbz1mYWxzZSApID0+IHtcbiAgICBsZXQgcmV0dXJuVmFsdWUsXG4gICAgICAgIHBvbGVzTCA9IGcuZGF0YShbIDAsMCwwLDAgXSwgMSwgeyBtZXRhOnRydWUgfSksXG4gICAgICAgIHBlZWtQcm9wcyA9IHsgaW50ZXJwOidub25lJywgbW9kZTonc2ltcGxlJyB9LFxuICAgICAgICByZXogPSBnLm1lbW8oIGcubXVsKCBfcmV6LCA1ICkgKSxcbiAgICAgICAgY3V0b2ZmID0gZy5tZW1vKCBnLmRpdiggX2N1dG9mZiwgMTEwMjUgKSApLFxuICAgICAgICByZXp6TCA9IGcuY2xhbXAoIGcubXVsKCBwb2xlc0xbM10sIHJleiApICksXG4gICAgICAgIG91dHB1dEwgPSBnLnN1YiggaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0LCByZXp6TCApIFxuXG4gICAgcG9sZXNMWzBdID0gZy5hZGQoIHBvbGVzTFswXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNMWzBdICksIG91dHB1dEwgICApLCBjdXRvZmYgKSlcbiAgICBwb2xlc0xbMV0gPSBnLmFkZCggcG9sZXNMWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc0xbMV0gKSwgcG9sZXNMWzBdICksIGN1dG9mZiApKVxuICAgIHBvbGVzTFsyXSA9IGcuYWRkKCBwb2xlc0xbMl0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzTFsyXSApLCBwb2xlc0xbMV0gKSwgY3V0b2ZmICkpXG4gICAgcG9sZXNMWzNdID0gZy5hZGQoIHBvbGVzTFszXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNMWzNdICksIHBvbGVzTFsyXSApLCBjdXRvZmYgKSlcbiAgICBcbiAgICBsZXQgbGVmdCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzTFszXSwgZy5zdWIoIG91dHB1dEwsIHBvbGVzTFszXSApIClcblxuICAgIGlmKCBpc1N0ZXJlbyApIHtcbiAgICAgIGxldCBwb2xlc1IgPSBnLmRhdGEoWyAwLDAsMCwwIF0sIDEsIHsgbWV0YTp0cnVlIH0pLFxuICAgICAgICAgIHJlenpSID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzUlszXSwgcmV6ICkgKSxcbiAgICAgICAgICBvdXRwdXRSID0gZy5zdWIoIGlucHV0WzFdLCByZXp6UiApICAgICAgICAgXG5cbiAgICAgIHBvbGVzUlswXSA9IGcuYWRkKCBwb2xlc1JbMF0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlswXSApLCBvdXRwdXRSICAgKSwgY3V0b2ZmICkpXG4gICAgICBwb2xlc1JbMV0gPSBnLmFkZCggcG9sZXNSWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMV0gKSwgcG9sZXNSWzBdICksIGN1dG9mZiApKVxuICAgICAgcG9sZXNSWzJdID0gZy5hZGQoIHBvbGVzUlsyXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNSWzJdICksIHBvbGVzUlsxXSApLCBjdXRvZmYgKSlcbiAgICAgIHBvbGVzUlszXSA9IGcuYWRkKCBwb2xlc1JbM10sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlszXSApLCBwb2xlc1JbMl0gKSwgY3V0b2ZmICkpXG5cbiAgICAgIGxldCByaWdodCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzUlszXSwgZy5zdWIoIG91dHB1dFIsIHBvbGVzUlszXSApIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBbbGVmdCwgcmlnaHRdXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm5WYWx1ZSA9IGxlZnRcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxuXG4gIGxldCBGaWx0ZXIyNCA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGxldCBmaWx0ZXIyNCAgID0gT2JqZWN0LmNyZWF0ZSggZmlsdGVyIClcbiAgICBsZXQgcHJvcHMgICAgPSBPYmplY3QuYXNzaWduKCB7fSwgRmlsdGVyMjQuZGVmYXVsdHMsIGZpbHRlci5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIGZpbHRlcjI0LCBcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guZmlsdGVyMjQoIGcuaW4oJ2lucHV0JyksIGcuaW4oJ1EnKSwgZy5pbignY3V0b2ZmJyksIGcuaW4oJ2lzTG93UGFzcycpLCBpc1N0ZXJlbyApLCBcbiAgICAgICdmaWx0ZXIyNCcsXG4gICAgICBwcm9wc1xuICAgIClcblxuICAgIHJldHVybiBmaWx0ZXIyNFxuICB9XG5cblxuICBGaWx0ZXIyNC5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIFE6IC4yNSxcbiAgICBjdXRvZmY6IDg4MCxcbiAgICBpc0xvd1Bhc3M6MVxuICB9XG5cbiAgcmV0dXJuIEZpbHRlcjI0XG5cbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IGcgPSBHaWJiZXJpc2guZ2VuaXNoXG5cbiAgY29uc3QgZmlsdGVycyA9IHtcbiAgICBGaWx0ZXIyNENsYXNzaWMgOiByZXF1aXJlKCAnLi9maWx0ZXIyNC5qcycgICkoIEdpYmJlcmlzaCApLFxuICAgIEZpbHRlcjI0TW9vZyAgICA6IHJlcXVpcmUoICcuL2xhZGRlckZpbHRlclplcm9EZWxheS5qcycgKSggR2liYmVyaXNoICksXG4gICAgRmlsdGVyMjRUQjMwMyAgIDogcmVxdWlyZSggJy4vZGlvZGVGaWx0ZXJaREYuanMnICkoIEdpYmJlcmlzaCApLFxuICAgIEZpbHRlcjEyQmlxdWFkICA6IHJlcXVpcmUoICcuL2JpcXVhZC5qcycgICAgKSggR2liYmVyaXNoICksXG4gICAgRmlsdGVyMTJTVkYgICAgIDogcmVxdWlyZSggJy4vc3ZmLmpzJyAgICAgICApKCBHaWJiZXJpc2ggKSxcbiAgICBcbiAgICAvLyBub3QgZm9yIHVzZSBieSBlbmQtdXNlcnNcbiAgICBnZW5pc2g6IHtcbiAgICAgIENvbWIgICAgICAgIDogcmVxdWlyZSggJy4vY29tYmZpbHRlci5qcycgKSxcbiAgICAgIEFsbFBhc3MgICAgIDogcmVxdWlyZSggJy4vYWxscGFzcy5qcycgKVxuICAgIH0sXG5cbiAgICBmYWN0b3J5KCBpbnB1dCwgY3V0b2ZmLCByZXNvbmFuY2UsIHNhdHVyYXRpb24gPSBudWxsLCBfcHJvcHMsIGlzU3RlcmVvID0gZmFsc2UgKSB7XG4gICAgICBsZXQgZmlsdGVyZWRPc2MgXG5cbiAgICAgIC8vaWYoIHByb3BzLmZpbHRlclR5cGUgPT09IDEgKSB7XG4gICAgICAvLyAgaWYoIHR5cGVvZiBwcm9wcy5jdXRvZmYgIT09ICdvYmplY3QnICYmIHByb3BzLmN1dG9mZiA+IDEgKSB7XG4gICAgICAvLyAgICBwcm9wcy5jdXRvZmYgPSAuMjVcbiAgICAgIC8vICB9XG4gICAgICAvLyAgaWYoIHR5cGVvZiBwcm9wcy5jdXRvZmYgIT09ICdvYmplY3QnICYmIHByb3BzLmZpbHRlck11bHQgPiAuNSApIHtcbiAgICAgIC8vICAgIHByb3BzLmZpbHRlck11bHQgPSAuMVxuICAgICAgLy8gIH1cbiAgICAgIC8vfVxuICAgICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgZmlsdGVycy5kZWZhdWx0cywgX3Byb3BzIClcblxuICAgICAgc3dpdGNoKCBwcm9wcy5maWx0ZXJUeXBlICkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgaXNMb3dQYXNzID0gZy5wYXJhbSggJ2xvd1Bhc3MnLCAxICksXG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBnLmZpbHRlcjI0KCBpbnB1dCwgZy5pbignUScpLCBjdXRvZmYsIHByb3BzLmZpbHRlck1vZGUsIGlzU3RlcmVvIClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gZy56ZDI0KCBpbnB1dCwgZy5pbignUScpLCBjdXRvZmYgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBnLmRpb2RlWkRGKCBpbnB1dCwgZy5pbignUScpLCBjdXRvZmYsIGcuaW4oJ3NhdHVyYXRpb24nKSwgaXNTdGVyZW8gKSBcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gZy5zdmYoIGlucHV0LCBjdXRvZmYsIGcuc3ViKCAxLCBnLmluKCdRJykpLCBwcm9wcy5maWx0ZXJNb2RlLCBpc1N0ZXJlbyApIFxuICAgICAgICAgIGJyZWFrOyBcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gZy5iaXF1YWQoIGlucHV0LCBjdXRvZmYsICBnLmluKCdRJyksIHByb3BzLmZpbHRlck1vZGUsIGlzU3RlcmVvICkgXG4gICAgICAgICAgYnJlYWs7IFxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vIHJldHVybiB1bmZpbHRlcmVkIHNpZ25hbFxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gaW5wdXQgLy9nLmZpbHRlcjI0KCBvc2NXaXRoR2FpbiwgZy5pbigncmVzb25hbmNlJyksIGN1dG9mZiwgaXNMb3dQYXNzIClcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZpbHRlcmVkT3NjXG4gICAgfSxcblxuICAgIGRlZmF1bHRzOiB7IGZpbHRlck1vZGU6IDAsIGZpbHRlclR5cGU6MCB9XG4gIH1cblxuICBmaWx0ZXJzLmV4cG9ydCA9IHRhcmdldCA9PiB7XG4gICAgZm9yKCBsZXQga2V5IGluIGZpbHRlcnMgKSB7XG4gICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyAmJiBrZXkgIT09ICdnZW5pc2gnICkge1xuICAgICAgICB0YXJnZXRbIGtleSBdID0gZmlsdGVyc1sga2V5IF1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxucmV0dXJuIGZpbHRlcnNcblxufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBmaWx0ZXIgPSByZXF1aXJlKCAnLi9maWx0ZXIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIEdpYmJlcmlzaC5nZW5pc2guemQyNCA9ICggaW5wdXQsIF9RLCBmcmVxLCBpc1N0ZXJlbz1mYWxzZSApID0+IHtcbiAgICBjb25zdCBpVCA9IDEgLyBnLmdlbi5zYW1wbGVyYXRlLFxuICAgICAgICAgIHoxID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIHoyID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIHozID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIHo0ID0gZy5oaXN0b3J5KDApXG4gICAgXG4gICAgY29uc3QgUSA9IGcubWVtbyggZy5hZGQoIC41LCBnLm11bCggX1EsIDIzICkgKSApXG4gICAgLy8ga3dkID0gMiAqICRNX1BJICogYWNmW2tpbmR4XVxuICAgIGNvbnN0IGt3ZCA9IGcubWVtbyggZy5tdWwoIE1hdGguUEkgKiAyLCBmcmVxICkgKVxuXG4gICAgLy8ga3dhID0gKDIvaVQpICogdGFuKGt3ZCAqIGlULzIpIFxuICAgIGNvbnN0IGt3YSA9Zy5tZW1vKCBnLm11bCggMi9pVCwgZy50YW4oIGcubXVsKCBrd2QsIGlULzIgKSApICkgKVxuXG4gICAgLy8ga0cgID0ga3dhICogaVQvMiBcbiAgICBjb25zdCBrZyA9IGcubWVtbyggZy5tdWwoIGt3YSwgaVQvMiApIClcblxuICAgIC8vIGtrID0gNC4wKihrUSAtIDAuNSkvKDI1LjAgLSAwLjUpXG4gICAgY29uc3Qga2sgPSBnLm1lbW8oIGcubXVsKCA0LCBnLmRpdiggZy5zdWIoIFEsIC41ICksIDI0LjUgKSApIClcblxuICAgIC8vIGtnX3BsdXNfMSA9ICgxLjAgKyBrZylcbiAgICBjb25zdCBrZ19wbHVzXzEgPSBnLmFkZCggMSwga2cgKVxuXG4gICAgLy8ga0cgPSBrZyAvIGtnX3BsdXNfMSBcbiAgICBjb25zdCBrRyAgICAgPSBnLm1lbW8oIGcuZGl2KCBrZywga2dfcGx1c18xICkgKSxcbiAgICAgICAgICBrR18yICAgPSBnLm1lbW8oIGcubXVsKCBrRywga0cgKSApLFxuICAgICAgICAgIGtHXzMgICA9IGcubXVsKCBrR18yLCBrRyApLFxuICAgICAgICAgIGtHQU1NQSA9IGcubXVsKCBrR18yLCBrR18yIClcblxuICAgIGNvbnN0IGtTMSA9IGcuZGl2KCB6MS5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTMiA9IGcuZGl2KCB6Mi5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTMyA9IGcuZGl2KCB6My5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTNCA9IGcuZGl2KCB6NC5vdXQsIGtnX3BsdXNfMSApXG5cbiAgICAvL2tTID0ga0dfMyAqIGtTMSAgKyBrR18yICoga1MyICsga0cgKiBrUzMgKyBrUzQgXG4gICAgY29uc3Qga1MgPSBnLm1lbW8oIFxuICAgICAgZy5hZGQoXG4gICAgICAgIGcuYWRkKCBnLm11bChrR18zLCBrUzEpLCBnLm11bCgga0dfMiwga1MyKSApLFxuICAgICAgICBnLmFkZCggZy5tdWwoa0csIGtTMyksIGtTNCApXG4gICAgICApXG4gICAgKVxuXG4gICAgLy9rdSA9IChraW4gLSBrayAqICBrUykgLyAoMSArIGtrICoga0dBTU1BKVxuICAgIGNvbnN0IGt1MSA9IGcuc3ViKCBpbnB1dCwgZy5tdWwoIGtrLCBrUyApIClcbiAgICBjb25zdCBrdTIgPSBnLm1lbW8oIGcuYWRkKCAxLCBnLm11bCgga2ssIGtHQU1NQSApICkgKVxuICAgIGNvbnN0IGt1ICA9IGcubWVtbyggZy5kaXYoIGt1MSwga3UyICkgKVxuXG4gICAgbGV0IGt2ID0gIGcubWVtbyggZy5tdWwoIGcuc3ViKCBrdSwgejEub3V0ICksIGtHICkgKVxuICAgIGxldCBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejEub3V0ICkgKVxuICAgIHoxLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHoyLm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejIub3V0ICkgKVxuICAgIHoyLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHozLm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejMub3V0ICkgKVxuICAgIHozLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHo0Lm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejQub3V0ICkgKVxuICAgIHo0LmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgLy9sZXQgcG9sZXNSID0gZy5kYXRhKFsgMCwwLDAsMCBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgIC8vICAgIHJlenpSID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzUlszXSwgcmV6ICkgKSxcbiAgICAgIC8vICAgIG91dHB1dFIgPSBnLnN1YiggaW5wdXRbMV0sIHJlenpSICkgICAgICAgICBcblxuICAgICAgLy9wb2xlc1JbMF0gPSBnLmFkZCggcG9sZXNSWzBdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMF0gKSwgb3V0cHV0UiAgICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMV0gPSBnLmFkZCggcG9sZXNSWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMV0gKSwgcG9sZXNSWzBdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMl0gPSBnLmFkZCggcG9sZXNSWzJdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMl0gKSwgcG9sZXNSWzFdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbM10gPSBnLmFkZCggcG9sZXNSWzNdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbM10gKSwgcG9sZXNSWzJdICksIGN1dG9mZiApKVxuXG4gICAgICAvL2xldCByaWdodCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzUlszXSwgZy5zdWIoIG91dHB1dFIsIHBvbGVzUlszXSApIClcblxuICAgICAgLy9yZXR1cm5WYWx1ZSA9IFtsZWZ0LCByaWdodF1cbiAgICB9ZWxzZXtcbiAgICAgIHJldHVyblZhbHVlID0ga2xwXG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cblxuICBjb25zdCBaZDI0ID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgY29uc3QgZmlsdGVyICAgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIGNvbnN0IHByb3BzICAgID0gT2JqZWN0LmFzc2lnbigge30sIFpkMjQuZGVmYXVsdHMsIGZpbHRlci5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgY29uc3QgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyBcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KFxuICAgICAgZmlsdGVyLCBcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guemQyNCggZy5pbignaW5wdXQnKSwgZy5pbignUScpLCBnLmluKCdjdXRvZmYnKSwgaXNTdGVyZW8gKSwgXG4gICAgICAnemQyNCcsXG4gICAgICBwcm9wc1xuICAgIClcblxuICAgIHJldHVybiBmaWx0ZXJcbiAgfVxuXG5cbiAgWmQyNC5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIFE6IDUsXG4gICAgY3V0b2ZmOiA0NDAsXG4gIH1cblxuICByZXR1cm4gWmQyNFxuXG59XG5cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZmlsdGVyID0gcmVxdWlyZSggJy4vZmlsdGVyLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgR2liYmVyaXNoLmdlbmlzaC5zdmYgPSAoIGlucHV0LCBjdXRvZmYsIFEsIG1vZGUsIGlzU3RlcmVvICkgPT4ge1xuICAgIGxldCBkMSA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSksIGQyID0gZy5kYXRhKFswLDBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgICAgcGVla1Byb3BzID0geyBtb2RlOidzaW1wbGUnLCBpbnRlcnA6J25vbmUnIH1cblxuICAgIGxldCBmMSA9IGcubWVtbyggZy5tdWwoIDIgKiBNYXRoLlBJLCBnLmRpdiggY3V0b2ZmLCBnLmdlbi5zYW1wbGVyYXRlICkgKSApXG4gICAgbGV0IG9uZU92ZXJRID0gZy5tZW1vKCBnLmRpdiggMSwgUSApIClcbiAgICBsZXQgbCA9IGcubWVtbyggZy5hZGQoIGQyWzBdLCBnLm11bCggZjEsIGQxWzBdICkgKSApLFxuICAgICAgICBoID0gZy5tZW1vKCBnLnN1YiggZy5zdWIoIGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dCwgbCApLCBnLm11bCggUSwgZDFbMF0gKSApICksXG4gICAgICAgIGIgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggZjEsIGggKSwgZDFbMF0gKSApLFxuICAgICAgICBuID0gZy5tZW1vKCBnLmFkZCggaCwgbCApIClcblxuICAgIGQxWzBdID0gYlxuICAgIGQyWzBdID0gbFxuXG4gICAgbGV0IG91dCA9IGcuc2VsZWN0b3IoIG1vZGUsIGwsIGgsIGIsIG4gKVxuXG4gICAgbGV0IHJldHVyblZhbHVlXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgbGV0IGQxMiA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSksIGQyMiA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSlcbiAgICAgIGxldCBsMiA9IGcubWVtbyggZy5hZGQoIGQyMlswXSwgZy5tdWwoIGYxLCBkMTJbMF0gKSApICksXG4gICAgICAgICAgaDIgPSBnLm1lbW8oIGcuc3ViKCBnLnN1YiggaW5wdXRbMV0sIGwyICksIGcubXVsKCBRLCBkMTJbMF0gKSApICksXG4gICAgICAgICAgYjIgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggZjEsIGgyICksIGQxMlswXSApICksXG4gICAgICAgICAgbjIgPSBnLm1lbW8oIGcuYWRkKCBoMiwgbDIgKSApXG5cbiAgICAgIGQxMlswXSA9IGIyXG4gICAgICBkMjJbMF0gPSBsMlxuXG4gICAgICBsZXQgb3V0MiA9IGcuc2VsZWN0b3IoIG1vZGUsIGwyLCBoMiwgYjIsIG4yIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBbIG91dCwgb3V0MiBdXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbiAgbGV0IFNWRiA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGNvbnN0IHN2ZiA9IE9iamVjdC5jcmVhdGUoIGZpbHRlciApXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgU1ZGLmRlZmF1bHRzLCBmaWx0ZXIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSBcblxuICAgIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW9cbiAgICBcbiAgICAvLyBYWFggTkVFRFMgUkVGQUNUT1JJTkdcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICBzdmYsXG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLnN2ZiggZy5pbignaW5wdXQnKSwgZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBnLmdlbi5zYW1wbGVyYXRlIC8gNSApLCBnLnN1YiggMSwgZy5pbignUScpICksIGcuaW4oJ21vZGUnKSwgaXNTdGVyZW8gKSwgXG4gICAgICAnc3ZmJywgXG4gICAgICBwcm9wc1xuICAgIClcblxuICAgIHJldHVybiBzdmZcbiAgfVxuXG5cbiAgU1ZGLmRlZmF1bHRzID0ge1xuICAgIGlucHV0OjAsXG4gICAgUTogLjc1LFxuICAgIGN1dG9mZjouMzUsXG4gICAgbW9kZTowXG4gIH1cblxuICByZXR1cm4gU1ZGXG5cbn1cblxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgQml0Q3J1c2hlciA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7IGJpdENydXNoZXJMZW5ndGg6IDQ0MTAwIH0sIEJpdENydXNoZXIuZGVmYXVsdHMsIGVmZmVjdC5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgYml0Q3J1c2hlciA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIGJpdERlcHRoID0gZy5pbiggJ2JpdERlcHRoJyApLFxuICAgICAgc2FtcGxlUmF0ZSA9IGcuaW4oICdzYW1wbGVSYXRlJyApLFxuICAgICAgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMCBdIDogaW5wdXQsXG4gICAgICByaWdodElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMSBdIDogbnVsbFxuICBcbiAgbGV0IHN0b3JlTCA9IGcuaGlzdG9yeSgwKVxuICBsZXQgc2FtcGxlUmVkdXhDb3VudGVyID0gZy5jb3VudGVyKCBzYW1wbGVSYXRlLCAwLCAxIClcblxuICBsZXQgYml0TXVsdCA9IGcucG93KCBnLm11bCggYml0RGVwdGgsIDE2ICksIDIgKVxuICBsZXQgY3J1c2hlZEwgPSBnLmRpdiggZy5mbG9vciggZy5tdWwoIGxlZnRJbnB1dCwgYml0TXVsdCApICksIGJpdE11bHQgKVxuXG4gIGxldCBvdXRMID0gZy5zd2l0Y2goXG4gICAgc2FtcGxlUmVkdXhDb3VudGVyLndyYXAsXG4gICAgY3J1c2hlZEwsXG4gICAgc3RvcmVMLm91dFxuICApXG5cbiAgaWYoIGlzU3RlcmVvICkge1xuICAgIGxldCBzdG9yZVIgPSBnLmhpc3RvcnkoMClcbiAgICBsZXQgY3J1c2hlZFIgPSBnLmRpdiggZy5mbG9vciggZy5tdWwoIHJpZ2h0SW5wdXQsIGJpdE11bHQgKSApLCBiaXRNdWx0IClcblxuICAgIGxldCBvdXRSID0gdGVybmFyeSggXG4gICAgICBzYW1wbGVSZWR1eENvdW50ZXIud3JhcCxcbiAgICAgIGNydXNoZWRSLFxuICAgICAgc3RvcmVMLm91dFxuICAgIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIGJpdENydXNoZXIsXG4gICAgICBbIG91dEwsIG91dFIgXSwgXG4gICAgICAnYml0Q3J1c2hlcicsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggYml0Q3J1c2hlciwgb3V0TCwgJ2JpdENydXNoZXInLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiBiaXRDcnVzaGVyXG59XG5cbkJpdENydXNoZXIuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIGJpdERlcHRoOi41LFxuICBzYW1wbGVSYXRlOiAuNVxufVxuXG5yZXR1cm4gQml0Q3J1c2hlclxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgbGV0IHByb3RvID0gT2JqZWN0LmNyZWF0ZSggZWZmZWN0IClcblxuICBsZXQgU2h1ZmZsZXIgPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgYnVmZmVyU2h1ZmZsZXIgPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgICBidWZmZXJTaXplID0gODgyMDBcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBTaHVmZmxlci5kZWZhdWx0cywgZWZmZWN0LmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IGZhbHNlXG4gICAgbGV0IHBoYXNlID0gZy5hY2N1bSggMSwwLHsgc2hvdWxkV3JhcDogZmFsc2UgfSlcblxuICAgIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgICAgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMCBdIDogaW5wdXQsXG4gICAgICAgIHJpZ2h0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WyAxIF0gOiBudWxsLFxuICAgICAgICByYXRlT2ZTaHVmZmxpbmcgPSBnLmluKCAncmF0ZScgKSxcbiAgICAgICAgY2hhbmNlT2ZTaHVmZmxpbmcgPSBnLmluKCAnY2hhbmNlJyApLFxuICAgICAgICByZXZlcnNlQ2hhbmNlID0gZy5pbiggJ3JldmVyc2VDaGFuY2UnICksXG4gICAgICAgIHJlcGl0Y2hDaGFuY2UgPSBnLmluKCAncmVwaXRjaENoYW5jZScgKSxcbiAgICAgICAgcmVwaXRjaE1pbiA9IGcuaW4oICdyZXBpdGNoTWluJyApLFxuICAgICAgICByZXBpdGNoTWF4ID0gZy5pbiggJ3JlcGl0Y2hNYXgnIClcblxuICAgIGxldCBwaXRjaE1lbW9yeSA9IGcuaGlzdG9yeSgxKVxuXG4gICAgbGV0IHNob3VsZFNodWZmbGVDaGVjayA9IGcuZXEoIGcubW9kKCBwaGFzZSwgcmF0ZU9mU2h1ZmZsaW5nICksIDAgKVxuICAgIGxldCBpc1NodWZmbGluZyA9IGcubWVtbyggZy5zYWgoIGcubHQoIGcubm9pc2UoKSwgY2hhbmNlT2ZTaHVmZmxpbmcgKSwgc2hvdWxkU2h1ZmZsZUNoZWNrLCAwICkgKSBcblxuICAgIC8vIGlmIHdlIGFyZSBzaHVmZmxpbmcgYW5kIG9uIGEgcmVwZWF0IGJvdW5kYXJ5Li4uXG4gICAgbGV0IHNodWZmbGVDaGFuZ2VkID0gZy5tZW1vKCBnLmFuZCggc2hvdWxkU2h1ZmZsZUNoZWNrLCBpc1NodWZmbGluZyApIClcbiAgICBsZXQgc2hvdWxkUmV2ZXJzZSA9IGcubHQoIGcubm9pc2UoKSwgcmV2ZXJzZUNoYW5jZSApLFxuICAgICAgICByZXZlcnNlTW9kID0gZy5zd2l0Y2goIHNob3VsZFJldmVyc2UsIC0xLCAxIClcblxuICAgIGxldCBwaXRjaCA9IGcuaWZlbHNlKCBcbiAgICAgIGcuYW5kKCBzaHVmZmxlQ2hhbmdlZCwgZy5sdCggZy5ub2lzZSgpLCByZXBpdGNoQ2hhbmNlICkgKSxcbiAgICAgIGcubWVtbyggZy5tdWwoIGcuYWRkKCByZXBpdGNoTWluLCBnLm11bCggZy5zdWIoIHJlcGl0Y2hNYXgsIHJlcGl0Y2hNaW4gKSwgZy5ub2lzZSgpICkgKSwgcmV2ZXJzZU1vZCApICksXG4gICAgICByZXZlcnNlTW9kXG4gICAgKVxuICAgIFxuICAgIC8vIG9ubHkgc3dpdGNoIHBpdGNoZXMgb24gcmVwZWF0IGJvdW5kYXJpZXNcbiAgICBwaXRjaE1lbW9yeS5pbiggZy5zd2l0Y2goIHNodWZmbGVDaGFuZ2VkLCBwaXRjaCwgcGl0Y2hNZW1vcnkub3V0ICkgKVxuXG4gICAgbGV0IGZhZGVMZW5ndGggPSBnLm1lbW8oIGcuZGl2KCByYXRlT2ZTaHVmZmxpbmcsIDEwMCApICksXG4gICAgICAgIGZhZGVJbmNyID0gZy5tZW1vKCBnLmRpdiggMSwgZmFkZUxlbmd0aCApIClcblxuICAgIGxldCBidWZmZXJMID0gZy5kYXRhKCBidWZmZXJTaXplICksIGJ1ZmZlclIgPSBpc1N0ZXJlbyA/IGcuZGF0YSggYnVmZmVyU2l6ZSApIDogbnVsbFxuICAgIGxldCByZWFkUGhhc2UgPSBnLmFjY3VtKCBwaXRjaE1lbW9yeS5vdXQsIDAsIHsgc2hvdWxkV3JhcDpmYWxzZSB9KSBcbiAgICBsZXQgc3R1dHRlciA9IGcud3JhcCggZy5zdWIoIGcubW9kKCByZWFkUGhhc2UsIGJ1ZmZlclNpemUgKSwgMjIwNTAgKSwgMCwgYnVmZmVyU2l6ZSApXG5cbiAgICBsZXQgbm9ybWFsU2FtcGxlID0gZy5wZWVrKCBidWZmZXJMLCBnLmFjY3VtKCAxLCAwLCB7IG1heDo4ODIwMCB9KSwgeyBtb2RlOidzaW1wbGUnIH0pXG5cbiAgICBsZXQgc3R1dHRlclNhbXBsZVBoYXNlID0gZy5zd2l0Y2goIGlzU2h1ZmZsaW5nLCBzdHV0dGVyLCBnLm1vZCggcmVhZFBoYXNlLCBidWZmZXJTaXplICkgKVxuICAgIGxldCBzdHV0dGVyU2FtcGxlID0gZy5tZW1vKCBnLnBlZWsoIFxuICAgICAgYnVmZmVyTCwgXG4gICAgICBzdHV0dGVyU2FtcGxlUGhhc2UsXG4gICAgICB7IG1vZGU6J3NhbXBsZXMnIH1cbiAgICApIClcbiAgICBcbiAgICBsZXQgc3R1dHRlclNob3VsZEZhZGVJbiA9IGcuYW5kKCBzaHVmZmxlQ2hhbmdlZCwgaXNTaHVmZmxpbmcgKVxuICAgIGxldCBzdHV0dGVyUGhhc2UgPSBnLmFjY3VtKCAxLCBzaHVmZmxlQ2hhbmdlZCwgeyBzaG91bGRXcmFwOiBmYWxzZSB9KVxuXG4gICAgbGV0IGZhZGVJbkFtb3VudCA9IGcubWVtbyggZy5kaXYoIHN0dXR0ZXJQaGFzZSwgZmFkZUxlbmd0aCApIClcbiAgICBsZXQgZmFkZU91dEFtb3VudCA9IGcuZGl2KCBnLnN1YiggcmF0ZU9mU2h1ZmZsaW5nLCBzdHV0dGVyUGhhc2UgKSwgZy5zdWIoIHJhdGVPZlNodWZmbGluZywgZmFkZUxlbmd0aCApIClcbiAgICBcbiAgICBsZXQgZmFkZWRTdHV0dGVyID0gZy5pZmVsc2UoXG4gICAgICBnLmx0KCBzdHV0dGVyUGhhc2UsIGZhZGVMZW5ndGggKSxcbiAgICAgIGcubWVtbyggZy5tdWwoIGcuc3dpdGNoKCBnLmx0KCBmYWRlSW5BbW91bnQsIDEgKSwgZmFkZUluQW1vdW50LCAxICksIHN0dXR0ZXJTYW1wbGUgKSApLFxuICAgICAgZy5ndCggc3R1dHRlclBoYXNlLCBnLnN1YiggcmF0ZU9mU2h1ZmZsaW5nLCBmYWRlTGVuZ3RoICkgKSxcbiAgICAgIGcubWVtbyggZy5tdWwoIGcuZ3RwKCBmYWRlT3V0QW1vdW50LCAwICksIHN0dXR0ZXJTYW1wbGUgKSApLFxuICAgICAgc3R1dHRlclNhbXBsZVxuICAgIClcbiAgICBcbiAgICBsZXQgb3V0cHV0TCA9IGcubWl4KCBub3JtYWxTYW1wbGUsIGZhZGVkU3R1dHRlciwgaXNTaHVmZmxpbmcgKSBcblxuICAgIGxldCBwb2tlTCA9IGcucG9rZSggYnVmZmVyTCwgbGVmdElucHV0LCBnLm1vZCggZy5hZGQoIHBoYXNlLCA0NDEwMCApLCA4ODIwMCApIClcblxuICAgIGxldCBwYW5uZXIgPSBnLnBhbiggb3V0cHV0TCwgb3V0cHV0TCwgZy5pbiggJ3BhbicgKSApXG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgYnVmZmVyU2h1ZmZsZXIsXG4gICAgICBbcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodF0sXG4gICAgICAnc2h1ZmZsZXInLCBcbiAgICAgIHByb3BzIFxuICAgICkgXG5cbiAgICByZXR1cm4gYnVmZmVyU2h1ZmZsZXJcbiAgfVxuICBcbiAgU2h1ZmZsZXIuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICByYXRlOjIyMDUwLFxuICAgIGNoYW5jZTouMjUsXG4gICAgcmV2ZXJzZUNoYW5jZTouNSxcbiAgICByZXBpdGNoQ2hhbmNlOi41LFxuICAgIHJlcGl0Y2hNaW46LjUsXG4gICAgcmVwaXRjaE1heDoyLFxuICAgIHBhbjouNSxcbiAgICBtaXg6LjVcbiAgfVxuXG4gIHJldHVybiBTaHVmZmxlciBcbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IENob3J1cyA9IGlucHV0UHJvcHMgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIENob3J1cy5kZWZhdWx0cywgZWZmZWN0LmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgXG4gIGNvbnN0IGNob3J1cyA9IE9iamVjdC5jcmVhdGUoIEdpYmJlcmlzaC5wcm90b3R5cGVzLnVnZW4gKVxuXG4gIGNvbnN0IGlucHV0ID0gZy5pbignaW5wdXQnKSxcbiAgICAgICAgZnJlcTEgPSBnLmluKCdzbG93RnJlcXVlbmN5JyksXG4gICAgICAgIGZyZXEyID0gZy5pbignZmFzdEZyZXF1ZW5jeScpLFxuICAgICAgICBhbXAxICA9IGcuaW4oJ3Nsb3dHYWluJyksXG4gICAgICAgIGFtcDIgID0gZy5pbignZmFzdEdhaW4nKVxuXG4gIGNvbnN0IGlzU3RlcmVvID0gdHlwZW9mIHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSAndW5kZWZpbmVkJyA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcblxuICBjb25zdCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXRcblxuICBjb25zdCB3aW4wICAgPSBnLmVudiggJ2ludmVyc2V3ZWxjaCcsIDEwMjQgKSxcbiAgICAgICAgd2luMTIwID0gZy5lbnYoICdpbnZlcnNld2VsY2gnLCAxMDI0LCAwLCAuMzMzICksXG4gICAgICAgIHdpbjI0MCA9IGcuZW52KCAnaW52ZXJzZXdlbGNoJywgMTAyNCwgMCwgLjY2NiApXG4gIFxuICBjb25zdCBzbG93UGhhc29yID0gZy5waGFzb3IoIGZyZXExLCAwLCB7IG1pbjowIH0pLFxuICBcdFx0ICBzbG93UGVlazEgID0gZy5tdWwoIGcucGVlayggd2luMCwgICBzbG93UGhhc29yICksIGFtcDEgKSxcbiAgICAgICAgc2xvd1BlZWsyICA9IGcubXVsKCBnLnBlZWsoIHdpbjEyMCwgc2xvd1BoYXNvciApLCBhbXAxICksXG4gICAgICAgIHNsb3dQZWVrMyAgPSBnLm11bCggZy5wZWVrKCB3aW4yNDAsIHNsb3dQaGFzb3IgKSwgYW1wMSApXG4gIFxuICBjb25zdCBmYXN0UGhhc29yID0gZy5waGFzb3IoIGZyZXEyLCAwLCB7IG1pbjowIH0pLFxuICBcdCAgXHRmYXN0UGVlazEgID0gZy5tdWwoIGcucGVlayggd2luMCwgICBmYXN0UGhhc29yICksIGFtcDIgKSxcbiAgICAgICAgZmFzdFBlZWsyICA9IGcubXVsKCBnLnBlZWsoIHdpbjEyMCwgZmFzdFBoYXNvciApLCBhbXAyICksXG4gICAgICAgIGZhc3RQZWVrMyAgPSBnLm11bCggZy5wZWVrKCB3aW4yNDAsIGZhc3RQaGFzb3IgKSwgYW1wMiApXG5cbiAgY29uc3QgbXMgPSBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGUgLyAxMDAwIFxuICBjb25zdCBtYXhEZWxheVRpbWUgPSAxMDAgKiBtc1xuXG4gIGNvbnN0IHRpbWUxID0gIGcubXVsKCBnLmFkZCggc2xvd1BlZWsxLCBmYXN0UGVlazEsIDUgKSwgbXMgKSxcbiAgICAgICAgdGltZTIgPSAgZy5tdWwoIGcuYWRkKCBzbG93UGVlazIsIGZhc3RQZWVrMiwgNSApLCBtcyApLFxuICAgICAgICB0aW1lMyA9ICBnLm11bCggZy5hZGQoIHNsb3dQZWVrMywgZmFzdFBlZWszLCA1ICksIG1zIClcblxuICBjb25zdCBkZWxheTFMID0gZy5kZWxheSggbGVmdElucHV0LCB0aW1lMSwgeyBzaXplOm1heERlbGF5VGltZSB9KSxcbiAgICAgICAgZGVsYXkyTCA9IGcuZGVsYXkoIGxlZnRJbnB1dCwgdGltZTIsIHsgc2l6ZTptYXhEZWxheVRpbWUgfSksXG4gICAgICAgIGRlbGF5M0wgPSBnLmRlbGF5KCBsZWZ0SW5wdXQsIHRpbWUzLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pXG5cbiAgXG4gIGNvbnN0IGxlZnRPdXRwdXQgPSBnLmFkZCggZGVsYXkxTCwgZGVsYXkyTCwgZGVsYXkzTCApXG4gIGlmKCBpc1N0ZXJlbyApIHtcbiAgICBjb25zdCByaWdodElucHV0ID0gaW5wdXRbMV1cbiAgICBjb25zdCBkZWxheTFSID0gZy5kZWxheShyaWdodElucHV0LCB0aW1lMSwgeyBzaXplOm1heERlbGF5VGltZSB9KSxcbiAgICAgICAgICBkZWxheTJSID0gZy5kZWxheShyaWdodElucHV0LCB0aW1lMiwgeyBzaXplOm1heERlbGF5VGltZSB9KSxcbiAgICAgICAgICBkZWxheTNSID0gZy5kZWxheShyaWdodElucHV0LCB0aW1lMywgeyBzaXplOm1heERlbGF5VGltZSB9KVxuXG4gICAgLy8gZmxpcCBhIGNvdXBsZSBkZWxheSBsaW5lcyBmb3Igc3RlcmVvIGVmZmVjdD9cbiAgICBjb25zdCByaWdodE91dHB1dCA9IGcuYWRkKCBkZWxheTFSLCBkZWxheTJMLCBkZWxheTNSIClcbiAgICBjaG9ydXMuZ3JhcGggPSBbIGcuYWRkKCBkZWxheTFMLCBkZWxheTJSLCBkZWxheTNMICksIHJpZ2h0T3V0cHV0IF1cbiAgfWVsc2V7XG4gICAgY2hvcnVzLmdyYXBoID0gbGVmdE91dHB1dFxuICB9XG4gIFxuICBHaWJiZXJpc2guZmFjdG9yeSggY2hvcnVzLCBjaG9ydXMuZ3JhcGgsICdjaG9ydXMnLCBwcm9wcyApXG5cbiAgcmV0dXJuIGNob3J1c1xufVxuXG5DaG9ydXMuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIHNsb3dGcmVxdWVuY3k6IC4xOCxcbiAgc2xvd0dhaW46MSxcbiAgZmFzdEZyZXF1ZW5jeTo2LFxuICBmYXN0R2FpbjouMlxufVxuXG5yZXR1cm4gQ2hvcnVzXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCdnZW5pc2guanMnKSxcbiAgICAgIGVmZmVjdCA9IHJlcXVpcmUoJy4vZWZmZWN0LmpzJyk7XG5cbmNvbnN0IGdlbmlzaCA9IGc7XG5cblwidXNlIGpzZHNwXCI7XG5cbmNvbnN0IEFsbFBhc3NDaGFpbiA9IChpbjEsIGluMiwgaW4zKSA9PiB7XG4gIFwidXNlIGpzZHNwXCI7XG5cbiAgLyogaW4xID0gcHJlZGVsYXlfb3V0ICovXG4gIC8qIGluMiA9IGluZGlmZnVzaW9uMSAqL1xuICAvKiBpbjMgPSBpbmRpZmZ1c2lvbjIgKi9cblxuICBjb25zdCBzdWIxID0gZ2VuaXNoLnN1YihpbjEsIDApO1xuICBjb25zdCBkMSA9IGcuZGVsYXkoc3ViMSwgMTQyKTtcbiAgc3ViMS5pbnB1dHNbMV0gPSBnZW5pc2gubXVsKGQxLCBpbjIpO1xuICBjb25zdCBhcDFfb3V0ID0gZ2VuaXNoLmFkZChnZW5pc2gubXVsKHN1YjEsIGluMiksIGQxKTtcblxuICBjb25zdCBzdWIyID0gZ2VuaXNoLnN1YihhcDFfb3V0LCAwKTtcbiAgY29uc3QgZDIgPSBnLmRlbGF5KHN1YjIsIDEwNyk7XG4gIHN1YjIuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkMiwgaW4yKTtcbiAgY29uc3QgYXAyX291dCA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bChzdWIyLCBpbjIpLCBkMik7XG5cbiAgY29uc3Qgc3ViMyA9IGdlbmlzaC5zdWIoYXAyX291dCwgMCk7XG4gIGNvbnN0IGQzID0gZy5kZWxheShzdWIzLCAzNzkpO1xuICBzdWIzLmlucHV0c1sxXSA9IGdlbmlzaC5tdWwoZDMsIGluMyk7XG4gIGNvbnN0IGFwM19vdXQgPSBnZW5pc2guYWRkKGdlbmlzaC5tdWwoc3ViMywgaW4zKSwgZDMpO1xuXG4gIGNvbnN0IHN1YjQgPSBnZW5pc2guc3ViKGFwM19vdXQsIDApO1xuICBjb25zdCBkNCA9IGcuZGVsYXkoc3ViNCwgMjc3KTtcbiAgc3ViNC5pbnB1dHNbMV0gPSBnZW5pc2gubXVsKGQ0LCBpbjMpO1xuICBjb25zdCBhcDRfb3V0ID0gZ2VuaXNoLmFkZChnZW5pc2gubXVsKHN1YjQsIGluMyksIGQ0KTtcblxuICByZXR1cm4gYXA0X291dDtcbn07XG5cbi8qY29uc3QgdGFua19vdXRzID0gVGFuayggYXBfb3V0LCBkZWNheWRpZmZ1c2lvbjEsIGRlY2F5ZGlmZnVzaW9uMiwgZGFtcGluZywgZGVjYXkgKSovXG5jb25zdCBUYW5rID0gZnVuY3Rpb24gKGluMSwgaW4yLCBpbjMsIGluNCwgaW41KSB7XG4gIFwidXNlIGpzZHNwXCI7XG5cbiAgY29uc3Qgb3V0cyA9IFtbXSwgW10sIFtdLCBbXSwgW11dO1xuXG4gIC8qIExFRlQgQ0hBTk5FTCAqL1xuICBjb25zdCBsZWZ0U3RhcnQgPSBnZW5pc2guYWRkKGluMSwgMCk7XG4gIGNvbnN0IGRlbGF5SW5wdXQgPSBnZW5pc2guYWRkKGxlZnRTdGFydCwgMCk7XG4gIGNvbnN0IGRlbGF5MSA9IGcuZGVsYXkoZGVsYXlJbnB1dCwgW2dlbmlzaC5hZGQoZ2VuaXNoLm11bChnLmN5Y2xlKC4xKSwgMTYpLCA2NzIpXSwgeyBzaXplOiA2ODggfSk7XG4gIGRlbGF5SW5wdXQuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkZWxheTEsIGluMik7XG4gIGNvbnN0IGRlbGF5T3V0ID0gZ2VuaXNoLnN1YihkZWxheTEsIGdlbmlzaC5tdWwoZGVsYXlJbnB1dCwgaW4yKSk7XG5cbiAgY29uc3QgZGVsYXkyID0gZy5kZWxheShkZWxheU91dCwgWzQ0NTMsIDM1MywgMzYyNywgMTE5MF0pO1xuICBvdXRzWzNdLnB1c2goZ2VuaXNoLmFkZChkZWxheTIub3V0cHV0c1sxXSwgZGVsYXkyLm91dHB1dHNbMl0pKTtcbiAgb3V0c1syXS5wdXNoKGRlbGF5Mi5vdXRwdXRzWzNdKTtcblxuICBjb25zdCBteiA9IGcuaGlzdG9yeSgwKTtcbiAgY29uc3QgbWwgPSBnLm1peChkZWxheTIsIG16Lm91dCwgaW40KTtcbiAgbXouaW4obWwpO1xuXG4gIGNvbnN0IG1vdXQgPSBnZW5pc2gubXVsKG1sLCBpbjUpO1xuXG4gIGNvbnN0IHMxID0gZ2VuaXNoLnN1Yihtb3V0LCAwKTtcbiAgY29uc3QgZGVsYXkzID0gZy5kZWxheShzMSwgWzE4MDAsIDE4NywgMTIyOF0pO1xuICBvdXRzWzJdLnB1c2goZGVsYXkzLm91dHB1dHNbMV0pO1xuICBvdXRzWzRdLnB1c2goZGVsYXkzLm91dHB1dHNbMl0pO1xuICBzMS5pbnB1dHNbMV0gPSBnZW5pc2gubXVsKGRlbGF5MywgaW4zKTtcbiAgY29uc3QgbTIgPSBnZW5pc2gubXVsKHMxLCBpbjMpO1xuICBjb25zdCBkbDJfb3V0ID0gZ2VuaXNoLmFkZChkZWxheTMsIG0yKTtcblxuICBjb25zdCBkZWxheTQgPSBnLmRlbGF5KGRsMl9vdXQsIFszNzIwLCAxMDY2LCAyNjczXSk7XG4gIG91dHNbMl0ucHVzaChkZWxheTQub3V0cHV0c1sxXSk7XG4gIG91dHNbM10ucHVzaChkZWxheTQub3V0cHV0c1syXSk7XG5cbiAgLyogUklHSFQgQ0hBTk5FTCAqL1xuICBjb25zdCByaWdodFN0YXJ0ID0gZ2VuaXNoLmFkZChnZW5pc2gubXVsKGRlbGF5NCwgaW41KSwgaW4xKTtcbiAgY29uc3QgZGVsYXlJbnB1dFIgPSBnZW5pc2guYWRkKHJpZ2h0U3RhcnQsIDApO1xuICBjb25zdCBkZWxheTFSID0gZy5kZWxheShkZWxheUlucHV0UiwgZ2VuaXNoLmFkZChnZW5pc2gubXVsKGcuY3ljbGUoLjA3KSwgMTYpLCA5MDgpLCB7IHNpemU6IDkyNCB9KTtcbiAgZGVsYXlJbnB1dFIuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkZWxheTFSLCBpbjIpO1xuICBjb25zdCBkZWxheU91dFIgPSBnZW5pc2guc3ViKGRlbGF5MVIsIGdlbmlzaC5tdWwoZGVsYXlJbnB1dFIsIGluMikpO1xuXG4gIGNvbnN0IGRlbGF5MlIgPSBnLmRlbGF5KGRlbGF5T3V0UiwgWzQyMTcsIDI2NiwgMjk3NCwgMjExMV0pO1xuICBvdXRzWzFdLnB1c2goZ2VuaXNoLmFkZChkZWxheTJSLm91dHB1dHNbMV0sIGRlbGF5MlIub3V0cHV0c1syXSkpO1xuICBvdXRzWzRdLnB1c2goZGVsYXkyUi5vdXRwdXRzWzNdKTtcblxuICBjb25zdCBtelIgPSBnLmhpc3RvcnkoMCk7XG4gIGNvbnN0IG1sUiA9IGcubWl4KGRlbGF5MlIsIG16Ui5vdXQsIGluNCk7XG4gIG16Ui5pbihtbFIpO1xuXG4gIGNvbnN0IG1vdXRSID0gZ2VuaXNoLm11bChtbFIsIGluNSk7XG5cbiAgY29uc3QgczFSID0gZ2VuaXNoLnN1Yihtb3V0UiwgMCk7XG4gIGNvbnN0IGRlbGF5M1IgPSBnLmRlbGF5KHMxUiwgWzI2NTYsIDMzNSwgMTkxM10pO1xuICBvdXRzWzRdLnB1c2goZGVsYXkzUi5vdXRwdXRzWzFdKTtcbiAgb3V0c1syXS5wdXNoKGRlbGF5M1Iub3V0cHV0c1syXSk7XG4gIHMxUi5pbnB1dHNbMV0gPSBnZW5pc2gubXVsKGRlbGF5M1IsIGluMyk7XG4gIGNvbnN0IG0yUiA9IGdlbmlzaC5tdWwoczFSLCBpbjMpO1xuICBjb25zdCBkbDJfb3V0UiA9IGdlbmlzaC5hZGQoZGVsYXkzUiwgbTJSKTtcblxuICBjb25zdCBkZWxheTRSID0gZy5kZWxheShkbDJfb3V0UiwgWzMxNjMsIDEyMSwgMTk5Nl0pO1xuICBvdXRzWzRdLnB1c2goZGVsYXk0Lm91dHB1dHNbMV0pO1xuICBvdXRzWzFdLnB1c2goZGVsYXk0Lm91dHB1dHNbMl0pO1xuXG4gIGxlZnRTdGFydC5pbnB1dHNbMV0gPSBnZW5pc2gubXVsKGRlbGF5NFIsIGluNSk7XG5cbiAgb3V0c1sxXSA9IGcuYWRkKC4uLm91dHNbMV0pO1xuICBvdXRzWzJdID0gZy5hZGQoLi4ub3V0c1syXSk7XG4gIG91dHNbM10gPSBnLmFkZCguLi5vdXRzWzNdKTtcbiAgb3V0c1s0XSA9IGcuYWRkKC4uLm91dHNbNF0pO1xuICByZXR1cm4gb3V0cztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEdpYmJlcmlzaCkge1xuXG4gIGNvbnN0IFJldmVyYiA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgUmV2ZXJiLmRlZmF1bHRzLCBlZmZlY3QuZGVmYXVsdHMsIGlucHV0UHJvcHMpLFxuICAgICAgICAgIHJldmVyYiA9IE9iamVjdC5jcmVhdGUoZWZmZWN0KTtcblxuICAgIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZTtcblxuICAgIGNvbnN0IGlucHV0ID0gZy5pbignaW5wdXQnKSxcbiAgICAgICAgICBkYW1waW5nID0gZy5pbignZGFtcGluZycpLFxuICAgICAgICAgIGRyeXdldCA9IGcuaW4oJ2RyeXdldCcpLFxuICAgICAgICAgIGRlY2F5ID0gZy5pbignZGVjYXknKSxcbiAgICAgICAgICBwcmVkZWxheSA9IGcuaW4oJ3ByZWRlbGF5JyksXG4gICAgICAgICAgaW5iYW5kd2lkdGggPSBnLmluKCdpbmJhbmR3aWR0aCcpLFxuICAgICAgICAgIGRlY2F5ZGlmZnVzaW9uMSA9IGcuaW4oJ2RlY2F5ZGlmZnVzaW9uMScpLFxuICAgICAgICAgIGRlY2F5ZGlmZnVzaW9uMiA9IGcuaW4oJ2RlY2F5ZGlmZnVzaW9uMicpLFxuICAgICAgICAgIGluZGlmZnVzaW9uMSA9IGcuaW4oJ2luZGlmZnVzaW9uMScpLFxuICAgICAgICAgIGluZGlmZnVzaW9uMiA9IGcuaW4oJ2luZGlmZnVzaW9uMicpO1xuXG4gICAgY29uc3Qgc3VtbWVkSW5wdXQgPSBpc1N0ZXJlbyA9PT0gdHJ1ZSA/IGcuYWRkKGlucHV0WzBdLCBpbnB1dFsxXSkgOiBpbnB1dDtcblxuICAgIHtcbiAgICAgICd1c2UganNkc3AnO1xuXG4gICAgICAvLyBjYWxjdWxjYXRlIHByZWRlbGF5XG4gICAgICBjb25zdCBwcmVkZWxheV9zYW1wcyA9IGcubXN0b3NhbXBzKHByZWRlbGF5KTtcbiAgICAgIGNvbnN0IHByZWRlbGF5X2RlbGF5ID0gZy5kZWxheShzdW1tZWRJbnB1dCwgcHJlZGVsYXlfc2FtcHMsIHsgc2l6ZTogNDQxMCB9KTtcbiAgICAgIGNvbnN0IHpfcGQgPSBnLmhpc3RvcnkoMCk7XG4gICAgICBjb25zdCBtaXgxID0gZy5taXgoel9wZC5vdXQsIHByZWRlbGF5X2RlbGF5LCBpbmJhbmR3aWR0aCk7XG4gICAgICB6X3BkLmluKG1peDEpO1xuXG4gICAgICBjb25zdCBwcmVkZWxheV9vdXQgPSBtaXgxO1xuXG4gICAgICAvLyBydW4gaW5wdXQgKyBwcmVkZWxheSB0aHJvdWdoIGFsbC1wYXNzIGNoYWluXG4gICAgICBjb25zdCBhcF9vdXQgPSBBbGxQYXNzQ2hhaW4ocHJlZGVsYXlfb3V0LCBpbmRpZmZ1c2lvbjEsIGluZGlmZnVzaW9uMik7XG5cbiAgICAgIC8vIHJ1biBmaWx0ZXJlZCBzaWduYWwgaW50byBcInRhbmtcIiBtb2RlbFxuICAgICAgY29uc3QgdGFua19vdXRzID0gVGFuayhhcF9vdXQsIGRlY2F5ZGlmZnVzaW9uMSwgZGVjYXlkaWZmdXNpb24yLCBkYW1waW5nLCBkZWNheSk7XG5cbiAgICAgIGNvbnN0IGxlZnRXZXQgPSBnZW5pc2gubXVsKGdlbmlzaC5zdWIodGFua19vdXRzWzFdLCB0YW5rX291dHNbMl0pLCAuNik7XG4gICAgICBjb25zdCByaWdodFdldCA9IGdlbmlzaC5tdWwoZ2VuaXNoLnN1Yih0YW5rX291dHNbM10sIHRhbmtfb3V0c1s0XSksIC42KTtcblxuICAgICAgLy8gbWl4IHdldCBhbmQgZHJ5IHNpZ25hbCBmb3IgZmluYWwgb3V0cHV0XG4gICAgICBjb25zdCBsZWZ0ID0gZy5taXgoaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0LCBsZWZ0V2V0LCBkcnl3ZXQpO1xuICAgICAgY29uc3QgcmlnaHQgPSBnLm1peChpc1N0ZXJlbyA/IGlucHV0WzFdIDogaW5wdXQsIHJpZ2h0V2V0LCBkcnl3ZXQpO1xuXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeShyZXZlcmIsIFtsZWZ0LCByaWdodF0sICdkYXR0b3JybycsIHByb3BzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV2ZXJiO1xuICB9O1xuXG4gIFJldmVyYi5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDogMCxcbiAgICBkYW1waW5nOiAuNSxcbiAgICBkcnl3ZXQ6IC41LFxuICAgIGRlY2F5OiAuNSxcbiAgICBwcmVkZWxheTogMTAsXG4gICAgaW5iYW5kd2lkdGg6IC41LFxuICAgIGluZGlmZnVzaW9uMTogLjc1LFxuICAgIGluZGlmZnVzaW9uMjogLjYyNSxcbiAgICBkZWNheWRpZmZ1c2lvbjE6IC43LFxuICAgIGRlY2F5ZGlmZnVzaW9uMjogLjVcbiAgfTtcblxuICByZXR1cm4gUmV2ZXJiO1xufTsiLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBEZWxheSA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7IGRlbGF5TGVuZ3RoOiA0NDEwMCB9LCBEZWxheS5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgZGVsYXkgPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IGZhbHNlIFxuICBcbiAgbGV0IGlucHV0ICAgICAgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICBkZWxheVRpbWUgID0gZy5pbiggJ3RpbWUnICksXG4gICAgICB3ZXRkcnkgICAgID0gZy5pbiggJ3dldGRyeScgKSxcbiAgICAgIGxlZnRJbnB1dCAgPSBpc1N0ZXJlbyA/IGlucHV0WyAwIF0gOiBpbnB1dCxcbiAgICAgIHJpZ2h0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WyAxIF0gOiBudWxsXG4gICAgXG4gIGxldCBmZWVkYmFjayA9IGcuaW4oICdmZWVkYmFjaycgKVxuXG4gIC8vIGxlZnQgY2hhbm5lbFxuICBsZXQgZmVlZGJhY2tIaXN0b3J5TCA9IGcuaGlzdG9yeSgpXG4gIGxldCBlY2hvTCA9IGcuZGVsYXkoIGcuYWRkKCBsZWZ0SW5wdXQsIGcubXVsKCBmZWVkYmFja0hpc3RvcnlMLm91dCwgZmVlZGJhY2sgKSApLCBkZWxheVRpbWUsIHsgc2l6ZTpwcm9wcy5kZWxheUxlbmd0aCB9KVxuICBmZWVkYmFja0hpc3RvcnlMLmluKCBlY2hvTCApXG4gIGxldCBsZWZ0ID0gZy5taXgoIGxlZnRJbnB1dCwgZWNob0wsIHdldGRyeSApXG5cbiAgaWYoIGlzU3RlcmVvICkge1xuICAgIC8vIHJpZ2h0IGNoYW5uZWxcbiAgICBsZXQgZmVlZGJhY2tIaXN0b3J5UiA9IGcuaGlzdG9yeSgpXG4gICAgbGV0IGVjaG9SID0gZy5kZWxheSggZy5hZGQoIHJpZ2h0SW5wdXQsIGcubXVsKCBmZWVkYmFja0hpc3RvcnlSLm91dCwgZmVlZGJhY2sgKSApLCBkZWxheVRpbWUsIHsgc2l6ZTpwcm9wcy5kZWxheUxlbmd0aCB9KVxuICAgIGZlZWRiYWNrSGlzdG9yeVIuaW4oIGVjaG9SIClcbiAgICBjb25zdCByaWdodCA9IGcubWl4KCByaWdodElucHV0LCBlY2hvUiwgd2V0ZHJ5IClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIGRlbGF5LFxuICAgICAgWyBsZWZ0LCByaWdodCBdLCBcbiAgICAgICdkZWxheScsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggZGVsYXksIGxlZnQsICdkZWxheScsIHByb3BzIClcbiAgfVxuICBcbiAgcmV0dXJuIGRlbGF5XG59XG5cbkRlbGF5LmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBmZWVkYmFjazouNzUsXG4gIHRpbWU6IDExMDI1LFxuICB3ZXRkcnk6IC41XG59XG5cbnJldHVybiBEZWxheVxuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSgnZ2VuaXNoLmpzJyksXG4gICAgICBlZmZlY3QgPSByZXF1aXJlKCcuL2VmZmVjdC5qcycpO1xuXG5jb25zdCBnZW5pc2ggPSBnO1xuXG4vKlxuXG4gICAgICAgICBleHAoYXNpZyAqIChzaGFwZTEgKyBwcmVnYWluKSkgLSBleHAoYXNpZyAqIChzaGFwZTIgLSBwcmVnYWluKSlcbiAgYW91dCA9IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgZXhwKGFzaWcgKiBwcmVnYWluKSAgICAgICAgICAgICsgZXhwKC1hc2lnICogcHJlZ2FpbilcblxuKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoR2liYmVyaXNoKSB7XG5cbiAgbGV0IERpc3RvcnRpb24gPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBEaXN0b3J0aW9uLmRlZmF1bHRzLCBlZmZlY3QuZGVmYXVsdHMsIGlucHV0UHJvcHMpLFxuICAgICAgICBkaXN0b3J0aW9uID0gT2JqZWN0LmNyZWF0ZShlZmZlY3QpO1xuXG4gICAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZTtcblxuICAgIGNvbnN0IGlucHV0ID0gZy5pbignaW5wdXQnKSxcbiAgICAgICAgICBzaGFwZTEgPSBnLmluKCdzaGFwZTEnKSxcbiAgICAgICAgICBzaGFwZTIgPSBnLmluKCdzaGFwZTInKSxcbiAgICAgICAgICBwcmVnYWluID0gZy5pbigncHJlZ2FpbicpLFxuICAgICAgICAgIHBvc3RnYWluID0gZy5pbigncG9zdGdhaW4nKTtcblxuICAgIGxldCBsb3V0O1xuICAgIHtcbiAgICAgICd1c2UganNkc3AnO1xuICAgICAgY29uc3QgbGlucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0O1xuICAgICAgY29uc3QgbHRvcCA9IGdlbmlzaC5zdWIoZy5leHAoZ2VuaXNoLm11bChsaW5wdXQsIGdlbmlzaC5hZGQoc2hhcGUxLCBwcmVnYWluKSkpLCBnLmV4cChnZW5pc2gubXVsKGxpbnB1dCwgZ2VuaXNoLnN1YihzaGFwZTIsIHByZWdhaW4pKSkpO1xuICAgICAgY29uc3QgbGJvdHRvbSA9IGdlbmlzaC5hZGQoZy5leHAoZ2VuaXNoLm11bChsaW5wdXQsIHByZWdhaW4pKSwgZy5leHAoZ2VuaXNoLm11bChnZW5pc2gubXVsKC0xLCBsaW5wdXQpLCBwcmVnYWluKSkpO1xuICAgICAgbG91dCA9IGdlbmlzaC5tdWwoZ2VuaXNoLmRpdihsdG9wLCBsYm90dG9tKSwgcG9zdGdhaW4pO1xuICAgIH1cblxuICAgIGlmIChpc1N0ZXJlbykge1xuICAgICAgbGV0IHJvdXQ7XG4gICAgICB7XG4gICAgICAgICd1c2UganNkc3AnO1xuICAgICAgICBjb25zdCByaW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzFdIDogaW5wdXQ7XG4gICAgICAgIGNvbnN0IHJ0b3AgPSBnZW5pc2guc3ViKGcuZXhwKGdlbmlzaC5tdWwocmlucHV0LCBnZW5pc2guYWRkKHNoYXBlMSwgcHJlZ2FpbikpKSwgZy5leHAoZ2VuaXNoLm11bChyaW5wdXQsIGdlbmlzaC5zdWIoc2hhcGUyLCBwcmVnYWluKSkpKTtcbiAgICAgICAgY29uc3QgcmJvdHRvbSA9IGdlbmlzaC5hZGQoZy5leHAoZ2VuaXNoLm11bChyaW5wdXQsIHByZWdhaW4pKSwgZy5leHAoZ2VuaXNoLm11bChnZW5pc2gubXVsKC0xLCByaW5wdXQpLCBwcmVnYWluKSkpO1xuICAgICAgICByb3V0ID0gZ2VuaXNoLm11bChnZW5pc2guZGl2KHJ0b3AsIHJib3R0b20pLCBwb3N0Z2Fpbik7XG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KGRpc3RvcnRpb24sIFtsb3V0LCByb3V0XSwgJ2Rpc3RvcnRpb24nLCBwcm9wcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KGRpc3RvcnRpb24sIGxvdXQsICdkaXN0b3J0aW9uJywgcHJvcHMpO1xuICAgIH1cblxuICAgIHJldHVybiBkaXN0b3J0aW9uO1xuICB9O1xuXG4gIERpc3RvcnRpb24uZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6IDAsXG4gICAgc2hhcGUxOiAuMSxcbiAgICBzaGFwZTI6IC4xLFxuICAgIHByZWdhaW46IDUsXG4gICAgcG9zdGdhaW46IC41XG4gIH07XG5cbiAgcmV0dXJuIERpc3RvcnRpb247XG59OyIsImxldCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubGV0IGVmZmVjdCA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG5PYmplY3QuYXNzaWduKCBlZmZlY3QsIHtcbiAgZGVmYXVsdHM6IHsgYnlwYXNzOmZhbHNlIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gZWZmZWN0XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgZWZmZWN0cyA9IHtcbiAgICBGcmVldmVyYiAgICA6IHJlcXVpcmUoICcuL2ZyZWV2ZXJiLmpzJyAgKSggR2liYmVyaXNoICksXG4gICAgUGxhdGUgICAgICAgOiByZXF1aXJlKCAnLi9kYXR0b3Jyby5qcycgICkoIEdpYmJlcmlzaCApLFxuICAgIEZsYW5nZXIgICAgIDogcmVxdWlyZSggJy4vZmxhbmdlci5qcycgICApKCBHaWJiZXJpc2ggKSxcbiAgICBWaWJyYXRvICAgICA6IHJlcXVpcmUoICcuL3ZpYnJhdG8uanMnICAgKSggR2liYmVyaXNoICksXG4gICAgRGVsYXkgICAgICAgOiByZXF1aXJlKCAnLi9kZWxheS5qcycgICAgICkoIEdpYmJlcmlzaCApLFxuICAgIEJpdENydXNoZXIgIDogcmVxdWlyZSggJy4vYml0Q3J1c2hlci5qcycpKCBHaWJiZXJpc2ggKSxcbiAgICBEaXN0b3J0aW9uICA6IHJlcXVpcmUoICcuL2Rpc3RvcnRpb24uanMnKSggR2liYmVyaXNoICksXG4gICAgUmluZ01vZCAgICAgOiByZXF1aXJlKCAnLi9yaW5nTW9kLmpzJyAgICkoIEdpYmJlcmlzaCApLFxuICAgIFRyZW1vbG8gICAgIDogcmVxdWlyZSggJy4vdHJlbW9sby5qcycgICApKCBHaWJiZXJpc2ggKSxcbiAgICBDaG9ydXMgICAgICA6IHJlcXVpcmUoICcuL2Nob3J1cy5qcycgICAgKSggR2liYmVyaXNoICksXG4gICAgU2h1ZmZsZXIgICAgOiByZXF1aXJlKCAnLi9idWZmZXJTaHVmZmxlci5qcycgICkoIEdpYmJlcmlzaCApLFxuICAgIC8vR2F0ZSAgICAgICAgOiByZXF1aXJlKCAnLi9nYXRlLmpzJyAgICAgICkoIEdpYmJlcmlzaCApLFxuICB9XG5cbiAgZWZmZWN0cy5leHBvcnQgPSB0YXJnZXQgPT4ge1xuICAgIGZvciggbGV0IGtleSBpbiBlZmZlY3RzICkge1xuICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgIHRhcmdldFsga2V5IF0gPSBlZmZlY3RzWyBrZXkgXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5yZXR1cm4gZWZmZWN0c1xuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgcHJvdG8gPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IEZsYW5nZXIgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzICAgPSBPYmplY3QuYXNzaWduKCB7IGRlbGF5TGVuZ3RoOjQ0MTAwIH0sIEZsYW5nZXIuZGVmYXVsdHMsIHByb3RvLmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICBmbGFuZ2VyID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICBkZWxheUxlbmd0aCA9IHByb3BzLmRlbGF5TGVuZ3RoLFxuICAgICAgZmVlZGJhY2tDb2VmZiA9IGcuaW4oICdmZWVkYmFjaycgKSxcbiAgICAgIG1vZEFtb3VudCA9IGcuaW4oICdvZmZzZXQnICksXG4gICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgZGVsYXlCdWZmZXJMID0gZy5kYXRhKCBkZWxheUxlbmd0aCApLFxuICAgICAgZGVsYXlCdWZmZXJSXG5cbiAgbGV0IHdyaXRlSWR4ID0gZy5hY2N1bSggMSwwLCB7IG1pbjowLCBtYXg6ZGVsYXlMZW5ndGgsIGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBsZXQgb2Zmc2V0ID0gZy5tdWwoIG1vZEFtb3VudCwgNTAwIClcblxuICBsZXQgbW9kID0gcHJvcHMubW9kID09PSB1bmRlZmluZWQgPyBnLmN5Y2xlKCBmcmVxdWVuY3kgKSA6IHByb3BzLm1vZFxuICBcbiAgbGV0IHJlYWRJZHggPSBnLndyYXAoIFxuICAgIGcuYWRkKCBcbiAgICAgIGcuc3ViKCB3cml0ZUlkeCwgb2Zmc2V0ICksIFxuICAgICAgbW9kLy9nLm11bCggbW9kLCBnLnN1Yiggb2Zmc2V0LCAxICkgKSBcbiAgICApLCBcblx0ICAwLCBcbiAgICBkZWxheUxlbmd0aFxuICApXG5cbiAgbGV0IGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dFxuXG4gIGxldCBkZWxheWVkT3V0TCA9IGcucGVlayggZGVsYXlCdWZmZXJMLCByZWFkSWR4LCB7IGludGVycDonbGluZWFyJywgbW9kZTonc2FtcGxlcycgfSlcbiAgXG4gIGcucG9rZSggZGVsYXlCdWZmZXJMLCBnLmFkZCggbGVmdElucHV0LCBnLm11bCggZGVsYXllZE91dEwsIGZlZWRiYWNrQ29lZmYgKSApLCB3cml0ZUlkeCApXG5cbiAgbGV0IGxlZnQgPSBnLmFkZCggbGVmdElucHV0LCBkZWxheWVkT3V0TCApLFxuICAgICAgcmlnaHRcblxuICBpZiggaXNTdGVyZW8gPT09IHRydWUgKSB7XG4gICAgcmlnaHRJbnB1dCA9IGlucHV0WzFdXG4gICAgZGVsYXlCdWZmZXJSID0gZy5kYXRhKCBkZWxheUxlbmd0aCApXG4gICAgXG4gICAgbGV0IGRlbGF5ZWRPdXRSID0gZy5wZWVrKCBkZWxheUJ1ZmZlclIsIHJlYWRJZHgsIHsgaW50ZXJwOidsaW5lYXInLCBtb2RlOidzYW1wbGVzJyB9KVxuXG4gICAgZy5wb2tlKCBkZWxheUJ1ZmZlclIsIGcuYWRkKCByaWdodElucHV0LCBnLm11bCggZGVsYXllZE91dFIsIGZlZWRiYWNrQ29lZmYgKSApLCB3cml0ZUlkeCApXG4gICAgcmlnaHQgPSBnLmFkZCggcmlnaHRJbnB1dCwgZGVsYXllZE91dFIgKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgZmxhbmdlcixcbiAgICAgIFsgbGVmdCwgcmlnaHQgXSwgXG4gICAgICAnZmxhbmdlcicsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuXG4gIH1lbHNle1xuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBmbGFuZ2VyLCBsZWZ0LCAnZmxhbmdlcicsIHByb3BzIClcbiAgfVxuICBcbiAgcmV0dXJuIGZsYW5nZXJcbn1cblxuRmxhbmdlci5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgZmVlZGJhY2s6LjAxLFxuICBvZmZzZXQ6LjI1LFxuICBmcmVxdWVuY3k6LjVcbn1cblxucmV0dXJuIEZsYW5nZXJcblxufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBcbmNvbnN0IGFsbFBhc3MgPSBHaWJiZXJpc2guZmlsdGVycy5nZW5pc2guQWxsUGFzc1xuY29uc3QgY29tYkZpbHRlciA9IEdpYmJlcmlzaC5maWx0ZXJzLmdlbmlzaC5Db21iXG5cbmNvbnN0IHR1bmluZyA9IHtcbiAgY29tYkNvdW50Olx0ICBcdDgsXG4gIGNvbWJUdW5pbmc6IFx0XHRbIDExMTYsIDExODgsIDEyNzcsIDEzNTYsIDE0MjIsIDE0OTEsIDE1NTcsIDE2MTcgXSwgICAgICAgICAgICAgICAgICAgIFxuICBhbGxQYXNzQ291bnQ6IFx0NCxcbiAgYWxsUGFzc1R1bmluZzpcdFsgMjI1LCA1NTYsIDQ0MSwgMzQxIF0sXG4gIGFsbFBhc3NGZWVkYmFjazowLjUsXG4gIGZpeGVkR2FpbjogXHRcdCAgMC4wMTUsXG4gIHNjYWxlRGFtcGluZzogXHQwLjQsXG4gIHNjYWxlUm9vbTogXHRcdCAgMC4yOCxcbiAgb2Zmc2V0Um9vbTogXHQgIDAuNyxcbiAgc3RlcmVvU3ByZWFkOiAgIDIzXG59XG5cbmNvbnN0IEZyZWV2ZXJiID0gaW5wdXRQcm9wcyA9PiB7XG4gIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBGcmVldmVyYi5kZWZhdWx0cywgZWZmZWN0LmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICByZXZlcmIgPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKSBcbiAgIFxuICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuICBcbiAgbGV0IGNvbWJzTCA9IFtdLCBjb21ic1IgPSBbXVxuXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIHdldDEgPSBnLmluKCAnd2V0MScpLCB3ZXQyID0gZy5pbiggJ3dldDInICksICBkcnkgPSBnLmluKCAnZHJ5JyApLCBcbiAgICAgIHJvb21TaXplID0gZy5pbiggJ3Jvb21TaXplJyApLCBkYW1waW5nID0gZy5pbiggJ2RhbXBpbmcnIClcbiAgXG4gIGxldCBzdW1tZWRJbnB1dCA9IGlzU3RlcmVvID09PSB0cnVlID8gZy5hZGQoIGlucHV0WzBdLCBpbnB1dFsxXSApIDogaW5wdXQsXG4gICAgICBhdHRlbnVhdGVkSW5wdXQgPSBnLm1lbW8oIGcubXVsKCBzdW1tZWRJbnB1dCwgdHVuaW5nLmZpeGVkR2FpbiApIClcbiAgXG4gIC8vIGNyZWF0ZSBjb21iIGZpbHRlcnMgaW4gcGFyYWxsZWwuLi5cbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCA4OyBpKysgKSB7IFxuICAgIGNvbWJzTC5wdXNoKCBcbiAgICAgIGNvbWJGaWx0ZXIoIGF0dGVudWF0ZWRJbnB1dCwgdHVuaW5nLmNvbWJUdW5pbmdbaV0sIGcubXVsKGRhbXBpbmcsLjQpLCBnLm11bCggdHVuaW5nLnNjYWxlUm9vbSArIHR1bmluZy5vZmZzZXRSb29tLCByb29tU2l6ZSApICkgXG4gICAgKVxuICAgIGNvbWJzUi5wdXNoKCBcbiAgICAgIGNvbWJGaWx0ZXIoIGF0dGVudWF0ZWRJbnB1dCwgdHVuaW5nLmNvbWJUdW5pbmdbaV0gKyB0dW5pbmcuc3RlcmVvU3ByZWFkLCBnLm11bChkYW1waW5nLC40KSwgZy5tdWwoIHR1bmluZy5zY2FsZVJvb20gKyB0dW5pbmcub2Zmc2V0Um9vbSwgcm9vbVNpemUgKSApIFxuICAgIClcbiAgfVxuICBcbiAgLy8gLi4uIGFuZCBzdW0gdGhlbSB3aXRoIGF0dGVudWF0ZWQgaW5wdXRcbiAgbGV0IG91dEwgPSBnLmFkZCggYXR0ZW51YXRlZElucHV0LCAuLi5jb21ic0wgKVxuICBsZXQgb3V0UiA9IGcuYWRkKCBhdHRlbnVhdGVkSW5wdXQsIC4uLmNvbWJzUiApXG4gIFxuICAvLyBydW4gdGhyb3VnaCBhbGxwYXNzIGZpbHRlcnMgaW4gc2VyaWVzXG4gIGZvciggbGV0IGkgPSAwOyBpIDwgNDsgaSsrICkgeyBcbiAgICBvdXRMID0gYWxsUGFzcyggb3V0TCwgdHVuaW5nLmFsbFBhc3NUdW5pbmdbIGkgXSArIHR1bmluZy5zdGVyZW9TcHJlYWQgKVxuICAgIG91dFIgPSBhbGxQYXNzKCBvdXRSLCB0dW5pbmcuYWxsUGFzc1R1bmluZ1sgaSBdICsgdHVuaW5nLnN0ZXJlb1NwcmVhZCApXG4gIH1cbiAgXG4gIGxldCBvdXRwdXRMID0gZy5hZGQoIGcubXVsKCBvdXRMLCB3ZXQxICksIGcubXVsKCBvdXRSLCB3ZXQyICksIGcubXVsKCBpc1N0ZXJlbyA9PT0gdHJ1ZSA/IGlucHV0WzBdIDogaW5wdXQsIGRyeSApICksXG4gICAgICBvdXRwdXRSID0gZy5hZGQoIGcubXVsKCBvdXRSLCB3ZXQxICksIGcubXVsKCBvdXRMLCB3ZXQyICksIGcubXVsKCBpc1N0ZXJlbyA9PT0gdHJ1ZSA/IGlucHV0WzFdIDogaW5wdXQsIGRyeSApIClcblxuICBHaWJiZXJpc2guZmFjdG9yeSggcmV2ZXJiLCBbIG91dHB1dEwsIG91dHB1dFIgXSwgJ2ZyZWV2ZXJiJywgcHJvcHMgKVxuXG4gIHJldHVybiByZXZlcmJcbn1cblxuXG5GcmVldmVyYi5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgd2V0MTogMSxcbiAgd2V0MjogMCxcbiAgZHJ5OiAuNSxcbiAgcm9vbVNpemU6IC44NCxcbiAgZGFtcGluZzogIC41XG59XG5cbnJldHVybiBGcmVldmVyYiBcblxufVxuXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBSaW5nTW9kID0gaW5wdXRQcm9wcyA9PiB7XG4gIGxldCBwcm9wcyAgID0gT2JqZWN0LmFzc2lnbigge30sIFJpbmdNb2QuZGVmYXVsdHMsIGVmZmVjdC5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgcmluZ01vZCA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICBnYWluID0gZy5pbiggJ2dhaW4nICksXG4gICAgICBtaXggPSBnLmluKCAnbWl4JyApXG4gIFxuICBsZXQgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0LFxuICAgICAgc2luZSA9IGcubXVsKCBnLmN5Y2xlKCBmcmVxdWVuY3kgKSwgZ2FpbiApXG4gXG4gIGxldCBsZWZ0ID0gZy5hZGQoIGcubXVsKCBsZWZ0SW5wdXQsIGcuc3ViKCAxLCBtaXggKSksIGcubXVsKCBnLm11bCggbGVmdElucHV0LCBzaW5lICksIG1peCApICksIFxuICAgICAgcmlnaHRcblxuICBpZiggaXNTdGVyZW8gPT09IHRydWUgKSB7XG4gICAgbGV0IHJpZ2h0SW5wdXQgPSBpbnB1dFsxXVxuICAgIHJpZ2h0ID0gZy5hZGQoIGcubXVsKCByaWdodElucHV0LCBnLnN1YiggMSwgbWl4ICkpLCBnLm11bCggZy5tdWwoIHJpZ2h0SW5wdXQsIHNpbmUgKSwgbWl4ICkgKSBcbiAgICBcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICByaW5nTW9kLFxuICAgICAgWyBsZWZ0LCByaWdodCBdLCBcbiAgICAgICdyaW5nTW9kJywgXG4gICAgICBwcm9wcyBcbiAgICApXG4gIH1lbHNle1xuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCByaW5nTW9kLCBsZWZ0LCAncmluZ01vZCcsIHByb3BzIClcbiAgfVxuICBcbiAgcmV0dXJuIHJpbmdNb2Rcbn1cblxuUmluZ01vZC5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgZnJlcXVlbmN5OjIyMCxcbiAgZ2FpbjogMSwgXG4gIG1peDoxXG59XG5cbnJldHVybiBSaW5nTW9kXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmNvbnN0IFRyZW1vbG8gPSBpbnB1dFByb3BzID0+IHtcbiAgY29uc3QgcHJvcHMgICA9IE9iamVjdC5hc3NpZ24oIHt9LCBUcmVtb2xvLmRlZmF1bHRzLCBlZmZlY3QuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgICAgdHJlbW9sbyA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgY29uc3QgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuICBcbiAgY29uc3QgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgIGFtb3VudCA9IGcuaW4oICdhbW91bnQnIClcbiAgXG4gIGNvbnN0IGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dFxuXG4gIGxldCBvc2NcbiAgaWYoIHByb3BzLnNoYXBlID09PSAnc3F1YXJlJyApIHtcbiAgICBvc2MgPSBnLmd0KCBnLnBoYXNvciggZnJlcXVlbmN5ICksIDAgKVxuICB9ZWxzZSBpZiggcHJvcHMuc2hhcGUgPT09ICdzYXcnICkge1xuICAgIG9zYyA9IGcuZ3RwKCBnLnBoYXNvciggZnJlcXVlbmN5ICksIDAgKVxuICB9ZWxzZXtcbiAgICBvc2MgPSBnLmN5Y2xlKCBmcmVxdWVuY3kgKVxuICB9XG5cbiAgY29uc3QgbW9kID0gZy5tdWwoIG9zYywgYW1vdW50IClcbiBcbiAgbGV0IGxlZnQgPSBnLnN1YiggbGVmdElucHV0LCBnLm11bCggbGVmdElucHV0LCBtb2QgKSApLCBcbiAgICAgIHJpZ2h0XG5cbiAgaWYoIGlzU3RlcmVvID09PSB0cnVlICkge1xuICAgIGxldCByaWdodElucHV0ID0gaW5wdXRbMV1cbiAgICByaWdodCA9IGcubXVsKCByaWdodElucHV0LCBtb2QgKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgdHJlbW9sbyxcbiAgICAgIFsgbGVmdCwgcmlnaHQgXSwgXG4gICAgICAndHJlbW9sbycsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggdHJlbW9sbywgbGVmdCwgJ3RyZW1vbG8nLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiB0cmVtb2xvXG59XG5cblRyZW1vbG8uZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIGZyZXF1ZW5jeToyLFxuICBhbW91bnQ6IDEsIFxuICBzaGFwZTonc2luZSdcbn1cblxucmV0dXJuIFRyZW1vbG9cblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgVmlicmF0byA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgICA9IE9iamVjdC5hc3NpZ24oIHt9LCBWaWJyYXRvLmRlZmF1bHRzLCBlZmZlY3QuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgIHZpYnJhdG8gPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICBkZWxheUxlbmd0aCA9IDQ0MTAwLFxuICAgICAgZmVlZGJhY2tDb2VmZiA9IC4wMSwvL2cuaW4oICdmZWVkYmFjaycgKSxcbiAgICAgIG1vZEFtb3VudCA9IGcuaW4oICdhbW91bnQnICksXG4gICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgZGVsYXlCdWZmZXJMID0gZy5kYXRhKCBkZWxheUxlbmd0aCApLFxuICAgICAgZGVsYXlCdWZmZXJSXG5cbiAgbGV0IHdyaXRlSWR4ID0gZy5hY2N1bSggMSwwLCB7IG1pbjowLCBtYXg6ZGVsYXlMZW5ndGgsIGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBsZXQgb2Zmc2V0ID0gZy5tdWwoIG1vZEFtb3VudCwgNTAwIClcbiAgXG4gIGxldCByZWFkSWR4ID0gZy53cmFwKCBcbiAgICBnLmFkZCggXG4gICAgICBnLnN1Yiggd3JpdGVJZHgsIG9mZnNldCApLCBcbiAgICAgIGcubXVsKCBnLmN5Y2xlKCBmcmVxdWVuY3kgKSwgZy5zdWIoIG9mZnNldCwgMSApICkgXG4gICAgKSwgXG5cdCAgMCwgXG4gICAgZGVsYXlMZW5ndGhcbiAgKVxuXG4gIGxldCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXRcblxuICBsZXQgZGVsYXllZE91dEwgPSBnLnBlZWsoIGRlbGF5QnVmZmVyTCwgcmVhZElkeCwgeyBpbnRlcnA6J2xpbmVhcicsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBnLnBva2UoIGRlbGF5QnVmZmVyTCwgZy5hZGQoIGxlZnRJbnB1dCwgZy5tdWwoIGRlbGF5ZWRPdXRMLCBmZWVkYmFja0NvZWZmICkgKSwgd3JpdGVJZHggKVxuXG4gIGxldCBsZWZ0ID0gZGVsYXllZE91dEwsXG4gICAgICByaWdodFxuXG4gIGlmKCBpc1N0ZXJlbyA9PT0gdHJ1ZSApIHtcbiAgICByaWdodElucHV0ID0gaW5wdXRbMV1cbiAgICBkZWxheUJ1ZmZlclIgPSBnLmRhdGEoIGRlbGF5TGVuZ3RoIClcbiAgICBcbiAgICBsZXQgZGVsYXllZE91dFIgPSBnLnBlZWsoIGRlbGF5QnVmZmVyUiwgcmVhZElkeCwgeyBpbnRlcnA6J2xpbmVhcicsIG1vZGU6J3NhbXBsZXMnIH0pXG5cbiAgICBnLnBva2UoIGRlbGF5QnVmZmVyUiwgZy5hZGQoIHJpZ2h0SW5wdXQsIG11bCggZGVsYXllZE91dFIsIGZlZWRiYWNrQ29lZmYgKSApLCB3cml0ZUlkeCApXG4gICAgcmlnaHQgPSBkZWxheWVkT3V0UlxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgdmlicmF0byxcbiAgICAgIFsgbGVmdCwgcmlnaHQgXSwgXG4gICAgICAndmlicmF0bycsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggdmlicmF0bywgbGVmdCwgJ3ZpYnJhdG8nLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiB2aWJyYXRvXG59XG5cblZpYnJhdG8uZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIC8vZmVlZGJhY2s6LjAxLFxuICBhbW91bnQ6LjUsXG4gIGZyZXF1ZW5jeTo0XG59XG5cbnJldHVybiBWaWJyYXRvXG5cbn1cbiIsImxldCBNZW1vcnlIZWxwZXIgPSByZXF1aXJlKCAnbWVtb3J5LWhlbHBlcicgKSxcbiAgICBnZW5pc2ggICAgICAgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG4gICAgXG5sZXQgR2liYmVyaXNoID0ge1xuICBibG9ja0NhbGxiYWNrczogW10sIC8vIGNhbGxlZCBldmVyeSBibG9ja1xuICBkaXJ0eVVnZW5zOiBbXSxcbiAgY2FsbGJhY2tVZ2VuczogW10sXG4gIGNhbGxiYWNrTmFtZXM6IFtdLFxuICBhbmFseXplcnM6IFtdLFxuICBncmFwaElzRGlydHk6IGZhbHNlLFxuICB1Z2Vuczoge30sXG4gIGRlYnVnOiBmYWxzZSxcblxuICBvdXRwdXQ6IG51bGwsXG5cbiAgbWVtb3J5IDogbnVsbCwgLy8gMjAgbWludXRlcyBieSBkZWZhdWx0P1xuICBmYWN0b3J5OiBudWxsLCBcbiAgZ2VuaXNoLFxuICBzY2hlZHVsZXI6IHJlcXVpcmUoICcuL3NjaGVkdWxpbmcvc2NoZWR1bGVyLmpzJyApLFxuICAvL3dvcmtsZXRQcm9jZXNzb3JMb2FkZXI6IHJlcXVpcmUoICcuL3dvcmtsZXRQcm9jZXNzb3IuanMnICksXG4gIHdvcmtsZXRQcm9jZXNzb3I6IG51bGwsXG5cbiAgbWVtb2VkOiB7fSxcbiAgbW9kZTonc2NyaXB0UHJvY2Vzc29yJyxcblxuICBwcm90b3R5cGVzOiB7XG4gICAgdWdlbjogcmVxdWlyZSgnLi91Z2VuLmpzJyksXG4gICAgaW5zdHJ1bWVudDogcmVxdWlyZSggJy4vaW5zdHJ1bWVudHMvaW5zdHJ1bWVudC5qcycgKSxcbiAgICBlZmZlY3Q6IHJlcXVpcmUoICcuL2Z4L2VmZmVjdC5qcycgKSxcbiAgfSxcblxuICBtaXhpbnM6IHtcbiAgICBwb2x5aW5zdHJ1bWVudDogcmVxdWlyZSggJy4vaW5zdHJ1bWVudHMvcG9seU1peGluLmpzJyApXG4gIH0sXG5cbiAgd29ya2xldFBhdGg6ICcuL2dpYmJlcmlzaF93b3JrbGV0LmpzJyxcbiAgaW5pdCggbWVtQW1vdW50LCBjdHgsIG1vZGUgKSB7XG5cbiAgICBsZXQgbnVtQnl0ZXMgPSBpc05hTiggbWVtQW1vdW50ICkgPyAyMCAqIDYwICogNDQxMDAgOiBtZW1BbW91bnRcblxuICAgIHRoaXMuZ2VuaXNoLmdlbi5tb2RlID0gJ3NjcmlwdFByb2Nlc3NvcidcblxuICAgIHRoaXMubWVtb3J5ID0gTWVtb3J5SGVscGVyLmNyZWF0ZSggbnVtQnl0ZXMgKVxuXG4gICAgdGhpcy5tb2RlID0gd2luZG93LkF1ZGlvV29ya2xldCAhPT0gdW5kZWZpbmVkID8gJ3dvcmtsZXQnIDogJ3NjcmlwdHByb2Nlc3NvcidcbiAgICBpZiggbW9kZSAhPT0gdW5kZWZpbmVkICkgdGhpcy5tb2RlID0gbW9kZVxuXG4gICAgdGhpcy5oYXNXb3JrbGV0ID0gd2luZG93LkF1ZGlvV29ya2xldCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB3aW5kb3cuQXVkaW9Xb3JrbGV0ID09PSAnZnVuY3Rpb24nXG5cbiAgICBjb25zdCBzdGFydHVwID0gdGhpcy5oYXNXb3JrbGV0ID8gdGhpcy51dGlsaXRpZXMuY3JlYXRlV29ya2xldCA6IHRoaXMudXRpbGl0aWVzLmNyZWF0ZVNjcmlwdFByb2Nlc3NvclxuICAgIFxuICAgIHRoaXMuYW5hbHl6ZXJzLmRpcnR5ID0gZmFsc2VcblxuICAgIGlmKCB0aGlzLm1vZGUgPT09ICd3b3JrbGV0JyApIHtcbiAgICAgIGNvbnN0IHAgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUsIHJlamVjdCApID0+IHtcblxuICAgICAgICBjb25zdCBwcCA9IG5ldyBQcm9taXNlKCAoX19yZXNvbHZlLCBfX3JlamVjdCApID0+IHtcbiAgICAgICAgICB0aGlzLnV0aWxpdGllcy5jcmVhdGVDb250ZXh0KCBjdHgsIHN0YXJ0dXAuYmluZCggdGhpcy51dGlsaXRpZXMgKSwgX19yZXNvbHZlIClcbiAgICAgICAgICBjb25zb2xlLmxvZyggJ0xPQURJTkcnIClcbiAgICAgICAgICBHaWJiZXJpc2gubG9hZCgpXG4gICAgICAgICAgR2liYmVyaXNoLm91dHB1dCA9IHRoaXMuQnVzMigpXG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgIH0pXG4gICAgICByZXR1cm4gcFxuICAgIH1lbHNlIGlmKCB0aGlzLm1vZGUgPT09ICdwcm9jZXNzb3InICkge1xuICAgICAgR2liYmVyaXNoLmxvYWQoKVxuICAgICAgR2liYmVyaXNoLm91dHB1dCA9IHRoaXMuQnVzMigpXG4gICAgfVxuXG5cbiAgfSxcblxuICBsb2FkKCkge1xuICAgIHRoaXMuZmFjdG9yeSA9IHJlcXVpcmUoICcuL3VnZW5UZW1wbGF0ZS5qcycgKSggdGhpcyApXG5cbiAgICB0aGlzLlBhbm5lciAgICAgICA9IHJlcXVpcmUoICcuL21pc2MvcGFubmVyLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLlBvbHlUZW1wbGF0ZSA9IHJlcXVpcmUoICcuL2luc3RydW1lbnRzL3BvbHl0ZW1wbGF0ZS5qcycgKSggdGhpcyApXG4gICAgdGhpcy5vc2NpbGxhdG9ycyAgPSByZXF1aXJlKCAnLi9vc2NpbGxhdG9ycy9vc2NpbGxhdG9ycy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5maWx0ZXJzICAgICAgPSByZXF1aXJlKCAnLi9maWx0ZXJzL2ZpbHRlcnMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuYmlub3BzICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9iaW5vcHMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMubW9ub3BzICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9tb25vcHMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuQnVzICAgICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9idXMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuQnVzMiAgICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9idXMyLmpzJyApKCB0aGlzICk7XG4gICAgdGhpcy5pbnN0cnVtZW50cyAgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50cy9pbnN0cnVtZW50cy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5meCAgICAgICAgICAgPSByZXF1aXJlKCAnLi9meC9lZmZlY3RzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLlNlcXVlbmNlciAgICA9IHJlcXVpcmUoICcuL3NjaGVkdWxpbmcvc2VxdWVuY2VyLmpzJyApKCB0aGlzICk7XG4gICAgdGhpcy5TZXF1ZW5jZXIyICAgPSByZXF1aXJlKCAnLi9zY2hlZHVsaW5nL3NlcTIuanMnICkoIHRoaXMgKTtcbiAgICB0aGlzLmVudmVsb3BlcyAgICA9IHJlcXVpcmUoICcuL2VudmVsb3Blcy9lbnZlbG9wZXMuanMnICkoIHRoaXMgKTtcbiAgICB0aGlzLmFuYWx5c2lzICAgICA9IHJlcXVpcmUoICcuL2FuYWx5c2lzL2FuYWx5emVycy5qcycgKSggdGhpcyApXG4gICAgdGhpcy50aW1lICAgICAgICAgPSByZXF1aXJlKCAnLi9taXNjL3RpbWUuanMnICkoIHRoaXMgKVxuICB9LFxuXG4gIGV4cG9ydCggdGFyZ2V0LCBzaG91bGRFeHBvcnRHZW5pc2g9ZmFsc2UgKSB7XG4gICAgaWYoIHRhcmdldCA9PT0gdW5kZWZpbmVkICkgdGhyb3cgRXJyb3IoJ1lvdSBtdXN0IGRlZmluZSBhIHRhcmdldCBvYmplY3QgZm9yIEdpYmJlcmlzaCB0byBleHBvcnQgdmFyaWFibGVzIHRvLicpXG5cbiAgICBpZiggc2hvdWxkRXhwb3J0R2VuaXNoICkgdGhpcy5nZW5pc2guZXhwb3J0KCB0YXJnZXQgKVxuXG4gICAgdGhpcy5pbnN0cnVtZW50cy5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5meC5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5maWx0ZXJzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLm9zY2lsbGF0b3JzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLmJpbm9wcy5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5tb25vcHMuZXhwb3J0KCB0YXJnZXQgKVxuICAgIHRoaXMuZW52ZWxvcGVzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLmFuYWx5c2lzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0YXJnZXQuU2VxdWVuY2VyID0gdGhpcy5TZXF1ZW5jZXJcbiAgICB0YXJnZXQuU2VxdWVuY2VyMiA9IHRoaXMuU2VxdWVuY2VyMlxuICAgIHRhcmdldC5CdXMgPSB0aGlzLkJ1c1xuICAgIHRhcmdldC5CdXMyID0gdGhpcy5CdXMyXG4gICAgdGFyZ2V0LlNjaGVkdWxlciA9IHRoaXMuc2NoZWR1bGVyXG4gICAgdGhpcy50aW1lLmV4cG9ydCggdGFyZ2V0IClcbiAgfSxcblxuICBwcmludCgpIHtcbiAgICBjb25zb2xlLmxvZyggdGhpcy5jYWxsYmFjay50b1N0cmluZygpIClcbiAgfSxcblxuICBkaXJ0eSggdWdlbiApIHtcbiAgICBpZiggdWdlbiA9PT0gdGhpcy5hbmFseXplcnMgKSB7XG4gICAgICB0aGlzLmdyYXBoSXNEaXJ0eSA9IHRydWVcbiAgICAgIHRoaXMuYW5hbHl6ZXJzLmRpcnR5ID0gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRpcnR5VWdlbnMucHVzaCggdWdlbiApXG4gICAgICB0aGlzLmdyYXBoSXNEaXJ0eSA9IHRydWVcbiAgICAgIGlmKCB0aGlzLm1lbW9lZFsgdWdlbi51Z2VuTmFtZSBdICkge1xuICAgICAgICBkZWxldGUgdGhpcy5tZW1vZWRbIHVnZW4udWdlbk5hbWUgXVxuICAgICAgfVxuICAgIH0gXG4gIH0sXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5vdXRwdXQuaW5wdXRzID0gWzBdXG4gICAgLy90aGlzLm91dHB1dC5pbnB1dE5hbWVzLmxlbmd0aCA9IDBcbiAgICB0aGlzLmFuYWx5emVycy5sZW5ndGggPSAwXG4gICAgdGhpcy5zY2hlZHVsZXIuY2xlYXIoKVxuICAgIHRoaXMuZGlydHkoIHRoaXMub3V0cHV0IClcbiAgfSxcblxuICBnZW5lcmF0ZUNhbGxiYWNrKCkge1xuICAgIGxldCB1aWQgPSAwLFxuICAgICAgICBjYWxsYmFja0JvZHksIGxhc3RMaW5lLCBhbmFseXNpcz0nJ1xuXG4gICAgdGhpcy5tZW1vZWQgPSB7fVxuXG4gICAgY2FsbGJhY2tCb2R5ID0gdGhpcy5wcm9jZXNzR3JhcGgoIHRoaXMub3V0cHV0IClcbiAgICBsYXN0TGluZSA9IGNhbGxiYWNrQm9keVsgY2FsbGJhY2tCb2R5Lmxlbmd0aCAtIDFdXG4gICAgY2FsbGJhY2tCb2R5LnVuc2hpZnQoIFwiXFx0J3VzZSBzdHJpY3QnXCIgKVxuXG4gICAgdGhpcy5hbmFseXplcnMuZm9yRWFjaCggdj0+IHtcbiAgICAgIGNvbnN0IGFuYWx5c2lzQmxvY2sgPSBHaWJiZXJpc2gucHJvY2Vzc1VnZW4oIHYgKVxuICAgICAgY29uc3QgYW5hbHlzaXNMaW5lID0gYW5hbHlzaXNCbG9jay5wb3AoKVxuXG4gICAgICBhbmFseXNpc0Jsb2NrLmZvckVhY2goIHY9PiB7XG4gICAgICAgIGNhbGxiYWNrQm9keS5zcGxpY2UoIGNhbGxiYWNrQm9keS5sZW5ndGggLSAxLCAwLCB2IClcbiAgICAgIH0pXG5cbiAgICAgIGNhbGxiYWNrQm9keS5wdXNoKCBhbmFseXNpc0xpbmUgKVxuICAgIH0pXG5cbiAgICB0aGlzLmFuYWx5emVycy5mb3JFYWNoKCB2ID0+IHtcbiAgICAgIGlmKCB0aGlzLmNhbGxiYWNrVWdlbnMuaW5kZXhPZiggdi5jYWxsYmFjayApID09PSAtMSApXG4gICAgICAgIHRoaXMuY2FsbGJhY2tVZ2Vucy5wdXNoKCB2LmNhbGxiYWNrIClcbiAgICB9KVxuICAgIHRoaXMuY2FsbGJhY2tOYW1lcyA9IHRoaXMuY2FsbGJhY2tVZ2Vucy5tYXAoIHYgPT4gdi51Z2VuTmFtZSApXG5cbiAgICBjYWxsYmFja0JvZHkucHVzaCggJ1xcblxcdHJldHVybiAnICsgbGFzdExpbmUuc3BsaXQoICc9JyApWzBdLnNwbGl0KCAnICcgKVsxXSApXG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCAnY2FsbGJhY2s6XFxuJywgY2FsbGJhY2tCb2R5LmpvaW4oJ1xcbicpIClcbiAgICB0aGlzLmNhbGxiYWNrTmFtZXMucHVzaCggJ21lbW9yeScgKVxuICAgIHRoaXMuY2FsbGJhY2tVZ2Vucy5wdXNoKCB0aGlzLm1lbW9yeS5oZWFwIClcbiAgICB0aGlzLmNhbGxiYWNrID0gRnVuY3Rpb24oIC4uLnRoaXMuY2FsbGJhY2tOYW1lcywgY2FsbGJhY2tCb2R5LmpvaW4oICdcXG4nICkgKVxuICAgIHRoaXMuY2FsbGJhY2sub3V0ID0gW11cblxuICAgIGlmKCB0aGlzLm9uY2FsbGJhY2sgKSB0aGlzLm9uY2FsbGJhY2soIHRoaXMuY2FsbGJhY2sgKVxuXG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2sgXG4gIH0sXG5cbiAgcHJvY2Vzc0dyYXBoKCBvdXRwdXQgKSB7XG4gICAgdGhpcy5jYWxsYmFja1VnZW5zLmxlbmd0aCA9IDBcbiAgICB0aGlzLmNhbGxiYWNrTmFtZXMubGVuZ3RoID0gMFxuXG4gICAgdGhpcy5jYWxsYmFja1VnZW5zLnB1c2goIG91dHB1dC5jYWxsYmFjayApXG5cbiAgICBsZXQgYm9keSA9IHRoaXMucHJvY2Vzc1VnZW4oIG91dHB1dCApXG4gICAgXG5cbiAgICB0aGlzLmRpcnR5VWdlbnMubGVuZ3RoID0gMFxuICAgIHRoaXMuZ3JhcGhJc0RpcnR5ID0gZmFsc2VcblxuICAgIHJldHVybiBib2R5XG4gIH0sXG5cbiAgcHJvY2Vzc1VnZW4oIHVnZW4sIGJsb2NrICkge1xuICAgIGlmKCBibG9jayA9PT0gdW5kZWZpbmVkICkgYmxvY2sgPSBbXVxuXG4gICAgbGV0IGRpcnR5SWR4ID0gR2liYmVyaXNoLmRpcnR5VWdlbnMuaW5kZXhPZiggdWdlbiApXG5cbiAgICAvL2NvbnNvbGUubG9nKCAndWdlbk5hbWU6JywgdWdlbi51Z2VuTmFtZSApXG4gICAgbGV0IG1lbW8gPSBHaWJiZXJpc2gubWVtb2VkWyB1Z2VuLnVnZW5OYW1lIF1cblxuICAgIGlmKCBtZW1vICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0gZWxzZSBpZiAodWdlbiA9PT0gdHJ1ZSB8fCB1Z2VuID09PSBmYWxzZSkge1xuICAgICAgdGhyb3cgXCJXaHkgaXMgdWdlbiBhIGJvb2xlYW4/IFt0cnVlXSBvciBbZmFsc2VdXCI7XG4gICAgfSBlbHNlIGlmKCB1Z2VuLmJsb2NrID09PSB1bmRlZmluZWQgfHwgZGlydHlJbmRleCAhPT0gLTEgKSB7XG5cbiAgXG4gICAgICBsZXQgbGluZSA9IGBcXHR2YXIgdl8ke3VnZW4uaWR9ID0gYCBcbiAgICAgIFxuICAgICAgaWYoICF1Z2VuLmJpbm9wICkgbGluZSArPSBgJHt1Z2VuLnVnZW5OYW1lfSggYFxuXG4gICAgICAvLyBtdXN0IGdldCBhcnJheSBzbyB3ZSBjYW4ga2VlcCB0cmFjayBvZiBsZW5ndGggZm9yIGNvbW1hIGluc2VydGlvblxuICAgICAgbGV0IGtleXMsZXJyXG4gICAgICBcbiAgICAgIC8vdHJ5IHtcbiAgICAgIGtleXMgPSB1Z2VuLmJpbm9wIHx8IHVnZW4udHlwZSA9PT0gJ2J1cycgfHwgdWdlbi50eXBlID09PSAnYW5hbHlzaXMnID8gT2JqZWN0LmtleXMoIHVnZW4uaW5wdXRzICkgOiBbLi4udWdlbi5pbnB1dE5hbWVzIF0gXG5cbiAgICAgIC8vfWNhdGNoKCBlICl7XG5cbiAgICAgIC8vICBjb25zb2xlLmxvZyggZSApXG4gICAgICAvLyAgZXJyID0gdHJ1ZVxuICAgICAgLy99XG4gICAgICBcbiAgICAgIC8vaWYoIGVyciA9PT0gdHJ1ZSApIHJldHVyblxuXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGxldCBrZXkgPSBrZXlzWyBpIF1cbiAgICAgICAgLy8gYmlub3AuaW5wdXRzIGlzIGFjdHVhbCB2YWx1ZXMsIG5vdCBqdXN0IHByb3BlcnR5IG5hbWVzXG4gICAgICAgIGxldCBpbnB1dCBcbiAgICAgICAgaWYoIHVnZW4uYmlub3AgfHwgdWdlbi50eXBlID09PSdidXMnICkge1xuICAgICAgICAgIGlucHV0ID0gdWdlbi5pbnB1dHNbIGtleSBdXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIC8vaWYoIGtleSA9PT0gJ21lbW9yeScgKSBjb250aW51ZTtcbiAgXG4gICAgICAgICAgaW5wdXQgPSB1Z2VuWyBrZXkgXSBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCBpbnB1dCAhPT0gdW5kZWZpbmVkICkgeyBcbiAgICAgICAgICBpZiggaW5wdXQuYnlwYXNzID09PSB0cnVlICkge1xuICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIGlucHV0cyBvZiBjaGFpbiB1bnRpbCBvbmUgaXMgZm91bmRcbiAgICAgICAgICAgIC8vIHRoYXQgaXMgbm90IGJlaW5nIGJ5cGFzc2VkXG5cbiAgICAgICAgICAgIGxldCBmb3VuZCA9IGZhbHNlXG5cbiAgICAgICAgICAgIHdoaWxlKCBpbnB1dC5pbnB1dCAhPT0gJ3VuZGVmaW5lZCcgJiYgZm91bmQgPT09IGZhbHNlICkge1xuICAgICAgICAgICAgICBpZiggdHlwZW9mIGlucHV0LmlucHV0LmJ5cGFzcyAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBpbnB1dC5pbnB1dFxuICAgICAgICAgICAgICAgIGlmKCBpbnB1dC5ieXBhc3MgPT09IGZhbHNlICkgZm91bmQgPSB0cnVlXG4gICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGlucHV0ID0gaW5wdXQuaW5wdXRcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKCB0eXBlb2YgaW5wdXQgPT09ICdudW1iZXInICkge1xuICAgICAgICAgICAgICBsaW5lICs9IGlucHV0XG4gICAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgaW5wdXQgPT09ICdib29sZWFuJyApIHtcbiAgICAgICAgICAgICAgbGluZSArPSAnJyArIGlucHV0XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAna2V5OicsIGtleSwgJ2lucHV0OicsIHVnZW4uaW5wdXRzLCB1Z2VuLmlucHV0c1sga2V5IF0gKSBcblxuICAgICAgICAgICAgR2liYmVyaXNoLnByb2Nlc3NVZ2VuKCBpbnB1dCwgYmxvY2sgKVxuXG4gICAgICAgICAgICAvL2lmKCBpbnB1dC5jYWxsYmFjayA9PT0gdW5kZWZpbmVkICkgY29udGludWVcblxuICAgICAgICAgICAgaWYoICFpbnB1dC5iaW5vcCApIHtcbiAgICAgICAgICAgICAgLy8gY2hlY2sgaXMgbmVlZGVkIHNvIHRoYXQgZ3JhcGhzIHdpdGggc3NkcyB0aGF0IHJlZmVyIHRvIHRoZW1zZWx2ZXNcbiAgICAgICAgICAgICAgLy8gZG9uJ3QgYWRkIHRoZSBzc2QgaW4gbW9yZSB0aGFuIG9uY2VcbiAgICAgICAgICAgICAgaWYoIEdpYmJlcmlzaC5jYWxsYmFja1VnZW5zLmluZGV4T2YoIGlucHV0LmNhbGxiYWNrICkgPT09IC0xICkge1xuICAgICAgICAgICAgICAgIEdpYmJlcmlzaC5jYWxsYmFja1VnZW5zLnB1c2goIGlucHV0LmNhbGxiYWNrIClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsaW5lICs9IGB2XyR7aW5wdXQuaWR9YFxuICAgICAgICAgICAgaW5wdXQuX192YXJuYW1lID0gYHZfJHtpbnB1dC5pZH1gXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoIGkgPCBrZXlzLmxlbmd0aCAtIDEgKSB7XG4gICAgICAgICAgICBsaW5lICs9IHVnZW4uYmlub3AgPyAnICcgKyB1Z2VuLm9wICsgJyAnIDogJywgJyBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy9pZiggdWdlbi50eXBlID09PSAnYnVzJyApIGxpbmUgKz0gJywgJyBcbiAgICAgIGlmKCB1Z2VuLnR5cGUgPT09ICdhbmFseXNpcycgfHwgKHVnZW4udHlwZSA9PT0gJ2J1cycgJiYga2V5cy5sZW5ndGggPiAwKSApIGxpbmUgKz0gJywgJ1xuICAgICAgaWYoICF1Z2VuLmJpbm9wICYmIHVnZW4udHlwZSAhPT0gJ3NlcScgKSBsaW5lICs9ICdtZW1vcnknXG4gICAgICBsaW5lICs9IHVnZW4uYmlub3AgPyAnJyA6ICcgKSdcblxuICAgICAgYmxvY2sucHVzaCggbGluZSApXG4gICAgICBcbiAgICAgIC8vY29uc29sZS5sb2coICdtZW1vOicsIHVnZW4udWdlbk5hbWUgKVxuICAgICAgR2liYmVyaXNoLm1lbW9lZFsgdWdlbi51Z2VuTmFtZSBdID0gYHZfJHt1Z2VuLmlkfWBcblxuICAgICAgaWYoIGRpcnR5SWR4ICE9PSAtMSApIHtcbiAgICAgICAgR2liYmVyaXNoLmRpcnR5VWdlbnMuc3BsaWNlKCBkaXJ0eUlkeCwgMSApXG4gICAgICB9XG5cbiAgICB9ZWxzZSBpZiggdWdlbi5ibG9jayApIHtcbiAgICAgIHJldHVybiB1Z2VuLmJsb2NrXG4gICAgfVxuXG4gICAgcmV0dXJuIGJsb2NrXG4gIH0sXG4gICAgXG59XG5cbkdpYmJlcmlzaC51dGlsaXRpZXMgPSByZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnICkoIEdpYmJlcmlzaCApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBHaWJiZXJpc2hcbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IENvbmdhID0gYXJndW1lbnRQcm9wcyA9PiB7XG4gICAgbGV0IGNvbmdhID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApLFxuICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICBkZWNheSA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgZ2FpbiAgPSBnLmluKCAnZ2FpbicgKVxuXG4gICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIENvbmdhLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGxldCB0cmlnZ2VyID0gZy5iYW5nKCksXG4gICAgICAgIGltcHVsc2UgPSBnLm11bCggdHJpZ2dlciwgNjAgKSxcbiAgICAgICAgX2RlY2F5ID0gIGcuc3ViKCAuMTAxLCBnLmRpdiggZGVjYXksIDEwICkgKSwgLy8gY3JlYXRlIHJhbmdlIG9mIC4wMDEgLSAuMDk5XG4gICAgICAgIGJwZiA9IGcuc3ZmKCBpbXB1bHNlLCBmcmVxdWVuY3ksIF9kZWNheSwgMiwgZmFsc2UgKSxcbiAgICAgICAgb3V0ID0gZy5tdWwoIGJwZiwgZ2FpbiApXG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIGNvbmdhLCBvdXQsICdjb25nYScsIHByb3BzICApXG4gICAgXG4gICAgY29uZ2EuZW52ID0gdHJpZ2dlclxuXG4gICAgcmV0dXJuIGNvbmdhXG4gIH1cbiAgXG4gIENvbmdhLmRlZmF1bHRzID0ge1xuICAgIGdhaW46IC4yNSxcbiAgICBmcmVxdWVuY3k6MTkwLFxuICAgIGRlY2F5OiAuODVcbiAgfVxuXG4gIHJldHVybiBDb25nYVxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IENvd2JlbGwgPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBjb25zdCBjb3diZWxsID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApLFxuICAgICAgICAgIGRlY2F5ICAgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgICAgZ2FpbiAgICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBDb3diZWxsLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGNvbnN0IGJwZkN1dG9mZiA9IGcucGFyYW0oICdicGZjJywgMTAwMCApLFxuICAgICAgICAgIHMxID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCA1NjAgKSxcbiAgICAgICAgICBzMiA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgODQ1ICksXG4gICAgICAgICAgZWcgPSBnLmRlY2F5KCBnLm11bCggZGVjYXksIGcuZ2VuLnNhbXBsZXJhdGUgKiAyICkgKSwgXG4gICAgICAgICAgYnBmID0gZy5zdmYoIGcuYWRkKCBzMSxzMiApLCBicGZDdXRvZmYsIDMsIDIsIGZhbHNlICksXG4gICAgICAgICAgZW52QnBmID0gZy5tdWwoIGJwZiwgZWcgKSxcbiAgICAgICAgICBvdXQgPSBnLm11bCggZW52QnBmLCBnYWluIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBjb3diZWxsLCBvdXQsICdjb3diZWxsJywgcHJvcHMgIClcbiAgICBcbiAgICBjb3diZWxsLmVudiA9IGVnIFxuXG4gICAgY293YmVsbC5pc1N0ZXJlbyA9IGZhbHNlXG5cbiAgICByZXR1cm4gY293YmVsbFxuICB9XG4gIFxuICBDb3diZWxsLmRlZmF1bHRzID0ge1xuICAgIGdhaW46IDEsXG4gICAgZGVjYXk6LjVcbiAgfVxuXG4gIHJldHVybiBDb3diZWxsXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IEZNID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgbGV0IHN5biA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKVxuXG4gICAgbGV0IGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgIGdsaWRlID0gZy5pbiggJ2dsaWRlJyApLFxuICAgICAgICBzbGlkaW5nRnJlcSA9IGcuc2xpZGUoIGZyZXF1ZW5jeSwgZ2xpZGUsIGdsaWRlICksXG4gICAgICAgIGNtUmF0aW8gPSBnLmluKCAnY21SYXRpbycgKSxcbiAgICAgICAgaW5kZXggPSBnLmluKCAnaW5kZXgnICksXG4gICAgICAgIGZlZWRiYWNrID0gZy5pbiggJ2ZlZWRiYWNrJyApLFxuICAgICAgICBhdHRhY2sgPSBnLmluKCAnYXR0YWNrJyApLCBkZWNheSA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgc3VzdGFpbiA9IGcuaW4oICdzdXN0YWluJyApLCBzdXN0YWluTGV2ZWwgPSBnLmluKCAnc3VzdGFpbkxldmVsJyApLFxuICAgICAgICByZWxlYXNlID0gZy5pbiggJ3JlbGVhc2UnIClcblxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIFN5bnRoLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBPYmplY3QuYXNzaWduKCBzeW4sIHByb3BzIClcblxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBlbnYgPSBHaWJiZXJpc2guZW52ZWxvcGVzLmZhY3RvcnkoIFxuICAgICAgICBwcm9wcy51c2VBRFNSLCBcbiAgICAgICAgcHJvcHMuc2hhcGUsIFxuICAgICAgICBhdHRhY2ssIGRlY2F5LCBcbiAgICAgICAgc3VzdGFpbiwgc3VzdGFpbkxldmVsLCBcbiAgICAgICAgcmVsZWFzZSwgXG4gICAgICAgIHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgICApXG5cbiAgICAgIGNvbnN0IGZlZWRiYWNrc3NkID0gZy5oaXN0b3J5KCAwIClcblxuICAgICAgY29uc3QgbW9kT3NjID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoIFxuICAgICAgICAgICAgICBzeW4ubW9kdWxhdG9yV2F2ZWZvcm0sIFxuICAgICAgICAgICAgICBnLmFkZCggZy5tdWwoIHNsaWRpbmdGcmVxLCBjbVJhdGlvICksIGcubXVsKCBmZWVkYmFja3NzZC5vdXQsIGZlZWRiYWNrLCBpbmRleCApICksIFxuICAgICAgICAgICAgICBzeW4uYW50aWFsaWFzIFxuICAgICAgICAgICAgKVxuXG4gICAgICBjb25zdCBtb2RPc2NXaXRoSW5kZXggPSBnLm11bCggbW9kT3NjLCBnLm11bCggc2xpZGluZ0ZyZXEsIGluZGV4ICkgKVxuICAgICAgY29uc3QgbW9kT3NjV2l0aEVudiAgID0gZy5tdWwoIG1vZE9zY1dpdGhJbmRleCwgZW52IClcbiAgICAgIFxuICAgICAgY29uc3QgbW9kT3NjV2l0aEVudkF2ZyA9IGcubXVsKCAuNSwgZy5hZGQoIG1vZE9zY1dpdGhFbnYsIGZlZWRiYWNrc3NkLm91dCApIClcblxuICAgICAgZmVlZGJhY2tzc2QuaW4oIG1vZE9zY1dpdGhFbnZBdmcgKVxuXG4gICAgICBjb25zdCBjYXJyaWVyT3NjID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoIHN5bi5jYXJyaWVyV2F2ZWZvcm0sIGcuYWRkKCBzbGlkaW5nRnJlcSwgbW9kT3NjV2l0aEVudkF2ZyApLCBzeW4uYW50aWFsaWFzIClcbiAgICAgIGNvbnN0IGNhcnJpZXJPc2NXaXRoRW52ID0gZy5tdWwoIGNhcnJpZXJPc2MsIGVudiApXG5cbiAgICAgIGNvbnN0IGJhc2VDdXRvZmZGcmVxID0gZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBmcmVxdWVuY3kgKVxuICAgICAgY29uc3QgY3V0b2ZmID0gZy5tdWwoIGcubXVsKCBiYXNlQ3V0b2ZmRnJlcSwgZy5wb3coIDIsIGcuaW4oJ2ZpbHRlck11bHQnKSApKSwgZW52IClcbiAgICAgIC8vY29uc3QgY3V0b2ZmID0gZy5hZGQoIGcuaW4oJ2N1dG9mZicpLCBnLm11bCggZy5pbignZmlsdGVyTXVsdCcpLCBlbnYgKSApXG4gICAgICBjb25zdCBmaWx0ZXJlZE9zYyA9IEdpYmJlcmlzaC5maWx0ZXJzLmZhY3RvcnkoIGNhcnJpZXJPc2NXaXRoRW52LCBjdXRvZmYsIGcuaW4oJ1EnKSwgZy5pbignc2F0dXJhdGlvbicpLCBzeW4gKVxuXG4gICAgICBjb25zdCBzeW50aFdpdGhHYWluID0gZy5tdWwoIGZpbHRlcmVkT3NjLCBnLmluKCAnZ2FpbicgKSApXG4gICAgICBcbiAgICAgIGxldCBwYW5uZXJcbiAgICAgIGlmKCBwcm9wcy5wYW5Wb2ljZXMgPT09IHRydWUgKSB7IFxuICAgICAgICBwYW5uZXIgPSBnLnBhbiggc3ludGhXaXRoR2Fpbiwgc3ludGhXaXRoR2FpbiwgZy5pbiggJ3BhbicgKSApIFxuICAgICAgICBzeW4uZ3JhcGggPSBbcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodCBdXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc3luLmdyYXBoID0gc3ludGhXaXRoR2FpblxuICAgICAgfVxuXG4gICAgICBzeW4uZW52ID0gZW52XG4gICAgfVxuICAgIFxuICAgIHN5bi5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiA9IFsgJ2NhcnJpZXJXYXZlZm9ybScsICdtb2R1bGF0b3JXYXZlZm9ybScsICdhbnRpYWxpYXMnLCAnZmlsdGVyVHlwZScsICdmaWx0ZXJNb2RlJyBdXG4gICAgc3luLl9fY3JlYXRlR3JhcGgoKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgc3luLmdyYXBoICwgJ2ZtJywgc3luIClcblxuICAgIHJldHVybiBzeW5cbiAgfVxuXG4gIEZNLmRlZmF1bHRzID0ge1xuICAgIGNhcnJpZXJXYXZlZm9ybTonc2luZScsXG4gICAgbW9kdWxhdG9yV2F2ZWZvcm06J3NpbmUnLFxuICAgIGF0dGFjazogNDQsXG4gICAgZmVlZGJhY2s6IDAsXG4gICAgZGVjYXk6IDIyMDUwLFxuICAgIHN1c3RhaW46NDQxMDAsXG4gICAgc3VzdGFpbkxldmVsOi42LFxuICAgIHJlbGVhc2U6MjIwNTAsXG4gICAgdXNlQURTUjpmYWxzZSxcbiAgICBzaGFwZTonbGluZWFyJyxcbiAgICB0cmlnZ2VyUmVsZWFzZTpmYWxzZSxcbiAgICBnYWluOiAxLFxuICAgIGNtUmF0aW86MixcbiAgICBpbmRleDo1LFxuICAgIHB1bHNld2lkdGg6LjI1LFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBhbnRpYWxpYXM6ZmFsc2UsXG4gICAgcGFuVm9pY2VzOmZhbHNlLFxuICAgIGdsaWRlOjEsXG4gICAgc2F0dXJhdGlvbjoxLFxuICAgIGZpbHRlck11bHQ6MS41LFxuICAgIFE6LjI1LFxuICAgIGN1dG9mZjouMzUsXG4gICAgZmlsdGVyVHlwZTowLFxuICAgIGZpbHRlck1vZGU6MCxcbiAgICBpc0xvd1Bhc3M6MVxuICB9XG5cbiAgbGV0IFBvbHlGTSA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIEZNLCBbJ2dsaWRlJywnZnJlcXVlbmN5JywnYXR0YWNrJywnZGVjYXknLCdwdWxzZXdpZHRoJywncGFuJywnZ2FpbicsJ2NtUmF0aW8nLCdpbmRleCcsICdzYXR1cmF0aW9uJywgJ2ZpbHRlck11bHQnLCAnUScsICdjdXRvZmYnLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnY2FycmllcldhdmVmb3JtJywgJ21vZHVsYXRvcldhdmVmb3JtJywnZmlsdGVyTW9kZScsICdmZWVkYmFjaycsICd1c2VBRFNSJywgJ3N1c3RhaW4nLCAncmVsZWFzZScsICdzdXN0YWluTGV2ZWwnIF0gKSBcblxuICByZXR1cm4gWyBGTSwgUG9seUZNIF1cblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgSGF0ID0gYXJndW1lbnRQcm9wcyA9PiB7XG4gICAgbGV0IGhhdCA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgdHVuZSAgPSBnLmluKCAndHVuZScgKSxcbiAgICAgICAgc2NhbGVkVHVuZSA9IGcubWVtbyggZy5hZGQoIC40LCB0dW5lICkgKSxcbiAgICAgICAgZGVjYXkgID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgSGF0LmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGxldCBiYXNlRnJlcSA9IGcubXVsKCAzMjUsIHNjYWxlZFR1bmUgKSwgLy8gcmFuZ2Ugb2YgMTYyLjUgLSA0ODcuNVxuICAgICAgICBicGZDdXRvZmYgPSBnLm11bCggZy5wYXJhbSggJ2JwZmMnLCA3MDAwICksIHNjYWxlZFR1bmUgKSxcbiAgICAgICAgaHBmQ3V0b2ZmID0gZy5tdWwoIGcucGFyYW0oICdocGZjJywgMTEwMDAgKSwgc2NhbGVkVHVuZSApLCAgXG4gICAgICAgIHMxID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBiYXNlRnJlcSwgZmFsc2UgKSxcbiAgICAgICAgczIgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGcubXVsKCBiYXNlRnJlcSwxLjQ0NzEgKSApLFxuICAgICAgICBzMyA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5tdWwoIGJhc2VGcmVxLDEuNjE3MCApICksXG4gICAgICAgIHM0ID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBnLm11bCggYmFzZUZyZXEsMS45MjY1ICkgKSxcbiAgICAgICAgczUgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGcubXVsKCBiYXNlRnJlcSwyLjUwMjggKSApLFxuICAgICAgICBzNiA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5tdWwoIGJhc2VGcmVxLDIuNjYzNyApICksXG4gICAgICAgIHN1bSA9IGcuYWRkKCBzMSxzMixzMyxzNCxzNSxzNiApLFxuICAgICAgICBlZyA9IGcuZGVjYXkoIGcubXVsKCBkZWNheSwgZy5nZW4uc2FtcGxlcmF0ZSAqIDIgKSApLCBcbiAgICAgICAgYnBmID0gZy5zdmYoIHN1bSwgYnBmQ3V0b2ZmLCAuNSwgMiwgZmFsc2UgKSxcbiAgICAgICAgZW52QnBmID0gZy5tdWwoIGJwZiwgZWcgKSxcbiAgICAgICAgaHBmID0gZy5maWx0ZXIyNCggZW52QnBmLCAwLCBocGZDdXRvZmYsIDAgKSxcbiAgICAgICAgb3V0ID0gZy5tdWwoIGhwZiwgZ2FpbiApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggaGF0LCBvdXQsICdoYXQnLCBwcm9wcyAgKVxuICAgIFxuICAgIGhhdC5lbnYgPSBlZyBcblxuICAgIGhhdC5pc1N0ZXJlbyA9IGZhbHNlXG4gICAgcmV0dXJuIGhhdFxuICB9XG4gIFxuICBIYXQuZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogIDEsXG4gICAgdHVuZTogLjYsXG4gICAgZGVjYXk6LjEsXG4gIH1cblxuICByZXR1cm4gSGF0XG5cbn1cbiIsImxldCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICksXG4gICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubGV0IGluc3RydW1lbnQgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuT2JqZWN0LmFzc2lnbiggaW5zdHJ1bWVudCwge1xuICBub3RlKCBmcmVxICkge1xuICAgIHRoaXMuZnJlcXVlbmN5ID0gZnJlcVxuICAgIHRoaXMuZW52LnRyaWdnZXIoKVxuICB9LFxuXG4gIHRyaWdnZXIoIF9nYWluID0gMSApIHtcbiAgICB0aGlzLmdhaW4gPSBfZ2FpblxuICAgIHRoaXMuZW52LnRyaWdnZXIoKVxuICB9LFxuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc3RydW1lbnRcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuY29uc3QgaW5zdHJ1bWVudHMgPSB7XG4gIEtpY2sgICAgICAgIDogcmVxdWlyZSggJy4va2ljay5qcycgKSggR2liYmVyaXNoICksXG4gIENvbmdhICAgICAgIDogcmVxdWlyZSggJy4vY29uZ2EuanMnICkoIEdpYmJlcmlzaCApLFxuICBDbGF2ZSAgICAgICA6IHJlcXVpcmUoICcuL2NvbmdhLmpzJyApKCBHaWJiZXJpc2ggKSwgLy8gY2xhdmUgaXMgc2FtZSBhcyBjb25nYSB3aXRoIGRpZmZlcmVudCBkZWZhdWx0cywgc2VlIGJlbG93XG4gIEhhdCAgICAgICAgIDogcmVxdWlyZSggJy4vaGF0LmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgU25hcmUgICAgICAgOiByZXF1aXJlKCAnLi9zbmFyZS5qcycgKSggR2liYmVyaXNoICksXG4gIENvd2JlbGwgICAgIDogcmVxdWlyZSggJy4vY293YmVsbC5qcycgKSggR2liYmVyaXNoIClcbn1cblxuaW5zdHJ1bWVudHMuQ2xhdmUuZGVmYXVsdHMuZnJlcXVlbmN5ID0gMjUwMFxuaW5zdHJ1bWVudHMuQ2xhdmUuZGVmYXVsdHMuZGVjYXkgPSAuNTtcblxuWyBpbnN0cnVtZW50cy5TeW50aCwgaW5zdHJ1bWVudHMuUG9seVN5bnRoIF0gICAgID0gcmVxdWlyZSggJy4vc3ludGguanMnICkoIEdpYmJlcmlzaCApO1xuWyBpbnN0cnVtZW50cy5Nb25vc3ludGgsIGluc3RydW1lbnRzLlBvbHlNb25vIF0gID0gcmVxdWlyZSggJy4vbW9ub3N5bnRoLmpzJyApKCBHaWJiZXJpc2ggKTtcblsgaW5zdHJ1bWVudHMuRk0sIGluc3RydW1lbnRzLlBvbHlGTSBdICAgICAgICAgICA9IHJlcXVpcmUoICcuL2ZtLmpzJyApKCBHaWJiZXJpc2ggKTtcblsgaW5zdHJ1bWVudHMuU2FtcGxlciwgaW5zdHJ1bWVudHMuUG9seVNhbXBsZXIgXSA9IHJlcXVpcmUoICcuL3NhbXBsZXIuanMnICkoIEdpYmJlcmlzaCApO1xuWyBpbnN0cnVtZW50cy5LYXJwbHVzLCBpbnN0cnVtZW50cy5Qb2x5S2FycGx1cyBdID0gcmVxdWlyZSggJy4va2FycGx1c3N0cm9uZy5qcycgKSggR2liYmVyaXNoICk7XG5cbmluc3RydW1lbnRzLmV4cG9ydCA9IHRhcmdldCA9PiB7XG4gIGZvciggbGV0IGtleSBpbiBpbnN0cnVtZW50cyApIHtcbiAgICBpZigga2V5ICE9PSAnZXhwb3J0JyApIHtcbiAgICAgIHRhcmdldFsga2V5IF0gPSBpbnN0cnVtZW50c1sga2V5IF1cbiAgICB9XG4gIH1cbn1cblxucmV0dXJuIGluc3RydW1lbnRzXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IEtQUyA9IGlucHV0UHJvcHMgPT4ge1xuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgS1BTLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBjb25zdCBzeW4gPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgICAgdHJpZ2dlciA9IGcuYmFuZygpLFxuICAgICAgICAgIHBoYXNlID0gZy5hY2N1bSggMSwgdHJpZ2dlciwgeyBtYXg6SW5maW5pdHkgfSApLFxuICAgICAgICAgIGVudiA9IGcuZ3RwKCBnLnN1YiggMSwgZy5kaXYoIHBoYXNlLCAyMDAgKSApLCAwICksXG4gICAgICAgICAgaW1wdWxzZSA9IGcubXVsKCBnLm5vaXNlKCksIGVudiApLFxuICAgICAgICAgIGZlZWRiYWNrID0gZy5oaXN0b3J5KCksXG4gICAgICAgICAgZnJlcXVlbmN5ID0gZy5pbignZnJlcXVlbmN5JyksXG4gICAgICAgICAgZ2xpZGUgPSBnLmluKCAnZ2xpZGUnICksXG4gICAgICAgICAgc2xpZGluZ0ZyZXF1ZW5jeSA9IGcuc2xpZGUoIGZyZXF1ZW5jeSwgZ2xpZGUsIGdsaWRlICksXG4gICAgICAgICAgZGVsYXkgPSBnLmRlbGF5KCBnLmFkZCggaW1wdWxzZSwgZmVlZGJhY2sub3V0ICksIGcuZGl2KCBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGUsIHNsaWRpbmdGcmVxdWVuY3kgKSwgeyBzaXplOjIwNDggfSksXG4gICAgICAgICAgZGVjYXllZCA9IGcubXVsKCBkZWxheSwgZy50NjAoIGcubXVsKCBnLmluKCdkZWNheScpLCBzbGlkaW5nRnJlcXVlbmN5ICkgKSApLFxuICAgICAgICAgIGRhbXBlZCA9ICBnLm1peCggZGVjYXllZCwgZmVlZGJhY2sub3V0LCBnLmluKCdkYW1waW5nJykgKSxcbiAgICAgICAgICB3aXRoR2FpbiA9IGcubXVsKCBkYW1wZWQsIGcuaW4oJ2dhaW4nKSApXG5cbiAgICBmZWVkYmFjay5pbiggZGFtcGVkIClcblxuICAgIGNvbnN0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgS1BTLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBpZiggcHJvcGVydGllcy5wYW5Wb2ljZXMgKSB7ICBcbiAgICAgIGNvbnN0IHBhbm5lciA9IGcucGFuKCB3aXRoR2Fpbiwgd2l0aEdhaW4sIGcuaW4oICdwYW4nICkgKVxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdLCAna2FycGx1cycsIHByb3BzICApXG4gICAgfWVsc2V7XG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc3luLCB3aXRoR2FpbiwgJ2thcnBsdXMnLCBwcm9wcyApXG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbiggc3luLCB7XG4gICAgICBwcm9wZXJ0aWVzIDogcHJvcHMsXG5cbiAgICAgIGVudiA6IHRyaWdnZXIsXG4gICAgICBwaGFzZSxcblxuICAgICAgZ2V0UGhhc2UoKSB7XG4gICAgICAgIHJldHVybiBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIHBoYXNlLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfSxcbiAgICB9KVxuICAgIHJldHVybiBzeW5cbiAgfVxuICBcbiAgS1BTLmRlZmF1bHRzID0ge1xuICAgIGRlY2F5OiAuOTcsXG4gICAgZGFtcGluZzouMixcbiAgICBnYWluOiAxLFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBnbGlkZToxLFxuICAgIHBhblZvaWNlczpmYWxzZVxuICB9XG5cbiAgbGV0IGVudkNoZWNrRmFjdG9yeSA9ICggc3luLHN5bnRoICkgPT4ge1xuICAgIGxldCBlbnZDaGVjayA9ICgpPT4ge1xuICAgICAgbGV0IHBoYXNlID0gc3luLmdldFBoYXNlKCksXG4gICAgICAgICAgZW5kVGltZSA9IHN5bnRoLmRlY2F5ICogR2liYmVyaXNoLmN0eC5zYW1wbGVSYXRlXG5cbiAgICAgIGlmKCBwaGFzZSA+IGVuZFRpbWUgKSB7XG4gICAgICAgIHN5bnRoLmRpc2Nvbm5lY3RVZ2VuKCBzeW4gKVxuICAgICAgICBzeW4uaXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgICAgICBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIHN5bi5waGFzZS5tZW1vcnkudmFsdWUuaWR4IF0gPSAwIC8vIHRyaWdnZXIgZG9lc24ndCBzZWVtIHRvIHJlc2V0IGZvciBzb21lIHJlYXNvblxuICAgICAgfWVsc2V7XG4gICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5wdXNoKCBlbnZDaGVjayApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbnZDaGVja1xuICB9XG5cbiAgbGV0IFBvbHlLUFMgPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBLUFMsIFsnZnJlcXVlbmN5JywnZGVjYXknLCdkYW1waW5nJywncGFuJywnZ2FpbicsICdnbGlkZSddLCBlbnZDaGVja0ZhY3RvcnkgKSBcblxuICByZXR1cm4gWyBLUFMsIFBvbHlLUFMgXVxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBLaWNrID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgLy8gZXN0YWJsaXNoIHByb3RvdHlwZSBjaGFpblxuICAgIGxldCBraWNrID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApXG5cbiAgICAvLyBkZWZpbmUgaW5wdXRzXG4gICAgbGV0IGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgIGRlY2F5ID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICB0b25lICA9IGcuaW4oICd0b25lJyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG4gICAgXG4gICAgLy8gY3JlYXRlIGluaXRpYWwgcHJvcGVydHkgc2V0XG4gICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIEtpY2suZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuXG4gICAgLy8gY3JlYXRlIERTUCBncmFwaFxuICAgIGxldCB0cmlnZ2VyID0gZy5iYW5nKCksXG4gICAgICAgIGltcHVsc2UgPSBnLm11bCggdHJpZ2dlciwgNjAgKSxcbiAgICAgICAgc2NhbGVkRGVjYXkgPSBnLnN1YiggMS4wMDUsIGRlY2F5ICksIC8vIC0+IHJhbmdlIHsgLjAwNSwgMS4wMDUgfVxuICAgICAgICBzY2FsZWRUb25lID0gZy5hZGQoIDUwLCBnLm11bCggdG9uZSwgNDAwMCApICksIC8vIC0+IHJhbmdlIHsgNTAsIDQwNTAgfVxuICAgICAgICBicGYgPSBnLnN2ZiggaW1wdWxzZSwgZnJlcXVlbmN5LCBzY2FsZWREZWNheSwgMiwgZmFsc2UgKSxcbiAgICAgICAgbHBmID0gZy5zdmYoIGJwZiwgc2NhbGVkVG9uZSwgLjUsIDAsIGZhbHNlICksXG4gICAgICAgIGdyYXBoID0gZy5tdWwoIGxwZiwgZ2FpbiApXG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIGtpY2ssIGdyYXBoLCAna2ljaycsIHByb3BzICApXG5cbiAgICBraWNrLmVudiA9IHRyaWdnZXJcblxuICAgIHJldHVybiBraWNrXG4gIH1cbiAgXG4gIEtpY2suZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogMSxcbiAgICBmcmVxdWVuY3k6ODUsXG4gICAgdG9uZTogLjI1LFxuICAgIGRlY2F5Oi45XG4gIH1cblxuICByZXR1cm4gS2lja1xuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApLFxuICAgICAgZmVlZGJhY2tPc2MgPSByZXF1aXJlKCAnLi4vb3NjaWxsYXRvcnMvZm1mZWVkYmFja29zYy5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgU3ludGggPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBjb25zdCBzeW4gPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgICAgb3NjcyA9IFtdLCBcbiAgICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICAgIGdsaWRlID0gZy5pbiggJ2dsaWRlJyApLFxuICAgICAgICAgIHNsaWRpbmdGcmVxID0gZy5tZW1vKCBnLnNsaWRlKCBmcmVxdWVuY3ksIGdsaWRlLCBnbGlkZSApICksXG4gICAgICAgICAgYXR0YWNrID0gZy5pbiggJ2F0dGFjaycgKSwgZGVjYXkgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgICAgc3VzdGFpbiA9IGcuaW4oICdzdXN0YWluJyApLCBzdXN0YWluTGV2ZWwgPSBnLmluKCAnc3VzdGFpbkxldmVsJyApLFxuICAgICAgICAgIHJlbGVhc2UgPSBnLmluKCAncmVsZWFzZScgKVxuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgU3ludGguZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuICAgIE9iamVjdC5hc3NpZ24oIHN5biwgcHJvcHMgKVxuXG4gICAgc3luLl9fY3JlYXRlR3JhcGggPSBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGVudiA9IEdpYmJlcmlzaC5lbnZlbG9wZXMuZmFjdG9yeSggXG4gICAgICAgIHByb3BzLnVzZUFEU1IsIFxuICAgICAgICBwcm9wcy5zaGFwZSwgXG4gICAgICAgIGF0dGFjaywgZGVjYXksIFxuICAgICAgICBzdXN0YWluLCBzdXN0YWluTGV2ZWwsIFxuICAgICAgICByZWxlYXNlLCBcbiAgICAgICAgcHJvcHMudHJpZ2dlclJlbGVhc2VcbiAgICAgIClcblxuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCAzOyBpKysgKSB7XG4gICAgICAgIGxldCBvc2MsIGZyZXFcblxuICAgICAgICBzd2l0Y2goIGkgKSB7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgZnJlcSA9IGcuYWRkKCBzbGlkaW5nRnJlcSwgZy5tdWwoIHNsaWRpbmdGcmVxLCBnLmluKCdkZXR1bmUyJykgKSApXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBmcmVxID0gZy5hZGQoIHNsaWRpbmdGcmVxLCBnLm11bCggc2xpZGluZ0ZyZXEsIGcuaW4oJ2RldHVuZTMnKSApIClcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBmcmVxID0gc2xpZGluZ0ZyZXFcbiAgICAgICAgfVxuXG4gICAgICAgIG9zYyA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCBzeW4ud2F2ZWZvcm0sIGZyZXEsIHN5bi5hbnRpYWxpYXMgKVxuICAgICAgICBcbiAgICAgICAgb3Njc1sgaSBdID0gb3NjXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9zY1N1bSA9IGcuYWRkKCAuLi5vc2NzICksXG4gICAgICAgICAgICBvc2NXaXRoR2FpbiA9IGcubXVsKCBnLm11bCggb3NjU3VtLCBlbnYgKSwgZy5pbiggJ2dhaW4nICkgKSxcbiAgICAgICAgICAgIGJhc2VDdXRvZmZGcmVxID0gZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBmcmVxdWVuY3kgKSxcbiAgICAgICAgICAgIGN1dG9mZiA9IGcubXVsKCBnLm11bCggYmFzZUN1dG9mZkZyZXEsIGcucG93KCAyLCBnLmluKCdmaWx0ZXJNdWx0JykgKSksIGVudiApLFxuICAgICAgICAgICAgZmlsdGVyZWRPc2MgPSBHaWJiZXJpc2guZmlsdGVycy5mYWN0b3J5KCBvc2NXaXRoR2FpbiwgY3V0b2ZmLCBnLmluKCdRJyksIGcuaW4oJ3NhdHVyYXRpb24nKSwgc3luIClcbiAgICAgICAgXG4gICAgICBpZiggcHJvcHMucGFuVm9pY2VzICkgeyAgXG4gICAgICAgIGNvbnN0IHBhbm5lciA9IGcucGFuKCBmaWx0ZXJlZE9zYyxmaWx0ZXJlZE9zYywgZy5pbiggJ3BhbicgKSApXG4gICAgICAgIHN5bi5ncmFwaCA9IFsgcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodCBdXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc3luLmdyYXBoID0gZmlsdGVyZWRPc2NcbiAgICAgIH1cblxuICAgICAgc3luLmVudiA9IGVudlxuICAgIH1cblxuICAgIHN5bi5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiA9IFsgJ3dhdmVmb3JtJywgJ2FudGlhbGlhcycsICdmaWx0ZXJUeXBlJywgJ2ZpbHRlck1vZGUnIF1cbiAgICBzeW4uX19jcmVhdGVHcmFwaCgpXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggc3luLCBzeW4uZ3JhcGgsICdtb25vJywgcHJvcHMgKVxuXG5cbiAgICByZXR1cm4gc3luXG4gIH1cbiAgXG4gIFN5bnRoLmRlZmF1bHRzID0ge1xuICAgIHdhdmVmb3JtOiAnc2F3JyxcbiAgICBhdHRhY2s6IDQ0LFxuICAgIGRlY2F5OiAyMjA1MCxcbiAgICBzdXN0YWluOjQ0MTAwLFxuICAgIHN1c3RhaW5MZXZlbDouNixcbiAgICByZWxlYXNlOjIyMDUwLFxuICAgIHVzZUFEU1I6ZmFsc2UsXG4gICAgc2hhcGU6J2xpbmVhcicsXG4gICAgdHJpZ2dlclJlbGVhc2U6ZmFsc2UsXG4gICAgZ2FpbjogLjI1LFxuICAgIHB1bHNld2lkdGg6LjI1LFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBkZXR1bmUyOi4wMDUsXG4gICAgZGV0dW5lMzotLjAwNSxcbiAgICBjdXRvZmY6IDEsXG4gICAgcmVzb25hbmNlOi4yNSxcbiAgICBROiAuNSxcbiAgICBwYW5Wb2ljZXM6ZmFsc2UsXG4gICAgZ2xpZGU6IDEsXG4gICAgYW50aWFsaWFzOmZhbHNlLFxuICAgIGZpbHRlclR5cGU6IDIsXG4gICAgZmlsdGVyTW9kZTogMCwgLy8gMCA9IExQLCAxID0gSFAsIDIgPSBCUCwgMyA9IE5vdGNoXG4gICAgc2F0dXJhdGlvbjouNSxcbiAgICBmaWx0ZXJNdWx0OiA0LFxuICAgIGlzTG93UGFzczp0cnVlXG4gIH1cblxuICBsZXQgUG9seU1vbm8gPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBTeW50aCwgXG4gICAgWydmcmVxdWVuY3knLCdhdHRhY2snLCdkZWNheScsJ2N1dG9mZicsJ1EnLFxuICAgICAnZGV0dW5lMicsJ2RldHVuZTMnLCdwdWxzZXdpZHRoJywncGFuJywnZ2FpbicsICdnbGlkZScsICdzYXR1cmF0aW9uJywgJ2ZpbHRlck11bHQnLCAgJ2FudGlhbGlhcycsICdmaWx0ZXJUeXBlJywgJ3dhdmVmb3JtJywgJ2ZpbHRlck1vZGUnXVxuICApIFxuXG4gIHJldHVybiBbIFN5bnRoLCBQb2x5TW9ubyBdXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgbm90ZSggZnJlcSwgZ2FpbiApIHtcbiAgICBsZXQgdm9pY2UgPSB0aGlzLl9fZ2V0Vm9pY2VfXygpXG4gICAgT2JqZWN0LmFzc2lnbiggdm9pY2UsIHRoaXMucHJvcGVydGllcyApXG4gICAgaWYoIGdhaW4gPT09IHVuZGVmaW5lZCApIGdhaW4gPSB0aGlzLmdhaW5cbiAgICB2b2ljZS5nYWluID0gZ2FpblxuICAgIHZvaWNlLm5vdGUoIGZyZXEgKVxuICAgIHRoaXMuX19ydW5Wb2ljZV9fKCB2b2ljZSwgdGhpcyApXG4gICAgdGhpcy50cmlnZ2VyTm90ZSA9IGZyZXFcbiAgfSxcblxuICAvLyBYWFggdGhpcyBpcyBub3QgcGFydGljdWxhcmx5IHNhdGlzZnlpbmcuLi5cbiAgLy8gbXVzdCBjaGVjayBmb3IgYm90aCBub3RlcyBhbmQgY2hvcmRzXG4gIHRyaWdnZXIoIGdhaW4gKSB7XG4gICAgaWYoIHRoaXMudHJpZ2dlckNob3JkICE9PSBudWxsICkge1xuICAgICAgdGhpcy50cmlnZ2VyQ2hvcmQuZm9yRWFjaCggdiA9PiB7XG4gICAgICAgIGxldCB2b2ljZSA9IHRoaXMuX19nZXRWb2ljZV9fKClcbiAgICAgICAgT2JqZWN0LmFzc2lnbiggdm9pY2UsIHRoaXMucHJvcGVydGllcyApXG4gICAgICAgIHZvaWNlLm5vdGUoIHYgKVxuICAgICAgICB2b2ljZS5nYWluID0gZ2FpblxuICAgICAgICB0aGlzLl9fcnVuVm9pY2VfXyggdm9pY2UsIHRoaXMgKVxuICAgICAgfSlcbiAgICB9ZWxzZSBpZiggdGhpcy50cmlnZ2VyTm90ZSAhPT0gbnVsbCApIHtcbiAgICAgIGxldCB2b2ljZSA9IHRoaXMuX19nZXRWb2ljZV9fKClcbiAgICAgIE9iamVjdC5hc3NpZ24oIHZvaWNlLCB0aGlzLnByb3BlcnRpZXMgKVxuICAgICAgdm9pY2Uubm90ZSggdGhpcy50cmlnZ2VyTm90ZSApXG4gICAgICB2b2ljZS5nYWluID0gZ2FpblxuICAgICAgdGhpcy5fX3J1blZvaWNlX18oIHZvaWNlLCB0aGlzIClcbiAgICB9ZWxzZXtcbiAgICAgIGxldCB2b2ljZSA9IHRoaXMuX19nZXRWb2ljZV9fKClcbiAgICAgIE9iamVjdC5hc3NpZ24oIHZvaWNlLCB0aGlzLnByb3BlcnRpZXMgKVxuICAgICAgdm9pY2UudHJpZ2dlciggZ2FpbiApXG4gICAgICB0aGlzLl9fcnVuVm9pY2VfXyggdm9pY2UsIHRoaXMgKVxuICAgIH1cbiAgfSxcblxuICBfX3J1blZvaWNlX18oIHZvaWNlLCBfcG9seSApIHtcbiAgICBpZiggIXZvaWNlLmlzQ29ubmVjdGVkICkge1xuICAgICAgdm9pY2UuY29ubmVjdCggX3BvbHksIDEgKVxuICAgICAgdm9pY2UuaXNDb25uZWN0ZWQgPSB0cnVlXG4gICAgfVxuXG4gICAgbGV0IGVudkNoZWNrXG4gICAgaWYoIF9wb2x5LmVudkNoZWNrID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBlbnZDaGVjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiggdm9pY2UuZW52LmlzQ29tcGxldGUoKSApIHtcbiAgICAgICAgICBfcG9seS5kaXNjb25uZWN0VWdlbi5jYWxsKCBfcG9seSwgdm9pY2UgKVxuICAgICAgICAgIHZvaWNlLmlzQ29ubmVjdGVkID0gZmFsc2VcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLnB1c2goIGVudkNoZWNrIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgZW52Q2hlY2sgPSBfcG9seS5lbnZDaGVjayggdm9pY2UsIF9wb2x5IClcbiAgICB9XG5cbiAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3MucHVzaCggZW52Q2hlY2sgKVxuICB9LFxuXG4gIF9fZ2V0Vm9pY2VfXygpIHtcbiAgICByZXR1cm4gdGhpcy52b2ljZXNbIHRoaXMudm9pY2VDb3VudCsrICUgdGhpcy52b2ljZXMubGVuZ3RoIF1cbiAgfSxcblxuICBjaG9yZCggZnJlcXVlbmNpZXMgKSB7XG4gICAgZnJlcXVlbmNpZXMuZm9yRWFjaCggdiA9PiB0aGlzLm5vdGUoIHYgKSApXG4gICAgdGhpcy50cmlnZ2VyQ2hvcmQgPSBmcmVxdWVuY2llc1xuICB9LFxuXG4gIGZyZWUoKSB7XG4gICAgZm9yKCBsZXQgY2hpbGQgb2YgdGhpcy52b2ljZXMgKSBjaGlsZC5mcmVlKClcbiAgfVxufVxuIiwiLypcbiAqIFRoaXMgZmlsZXMgY3JlYXRlcyBhIGZhY3RvcnkgZ2VuZXJhdGluZyBwb2x5c3ludGggY29uc3RydWN0b3JzLlxuICovXG5cbmNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBUZW1wbGF0ZUZhY3RvcnkgPSAoIHVnZW4sIHByb3BlcnR5TGlzdCwgX2VudkNoZWNrICkgPT4ge1xuICAgIC8qIFxuICAgICAqIHBvbHlzeW50aHMgYXJlIGJhc2ljYWxseSBidXNzZXMgdGhhdCBjb25uZWN0IGNoaWxkIHN5bnRoIHZvaWNlcy5cbiAgICAgKiBXZSBjcmVhdGUgc2VwYXJhdGUgcHJvdG90eXBlcyBmb3IgbW9ubyB2cyBzdGVyZW8gaW5zdGFuY2VzLlxuICAgICAqL1xuXG4gICAgY29uc3QgbW9ub1Byb3RvICAgPSBPYmplY3QuY3JlYXRlKCBHaWJiZXJpc2guQnVzKCkgKSxcbiAgICAgICAgICBzdGVyZW9Qcm90byA9IE9iamVjdC5jcmVhdGUoIEdpYmJlcmlzaC5CdXMyKCkgKVxuXG4gICAgLy8gc2luY2UgdGhlcmUgYXJlIHR3byBwcm90b3R5cGVzIHdlIGNhbid0IGFzc2lnbiBkaXJlY3RseSB0byBvbmUgb2YgdGhlbS4uLlxuICAgIE9iamVjdC5hc3NpZ24oIG1vbm9Qcm90bywgICBHaWJiZXJpc2gubWl4aW5zLnBvbHlpbnN0cnVtZW50IClcbiAgICBPYmplY3QuYXNzaWduKCBzdGVyZW9Qcm90bywgR2liYmVyaXNoLm1peGlucy5wb2x5aW5zdHJ1bWVudCApXG5cbiAgICBjb25zdCBUZW1wbGF0ZSA9IHByb3BzID0+IHtcbiAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgeyBpc1N0ZXJlbzp0cnVlIH0sIHByb3BzIClcblxuICAgICAgY29uc3Qgc3ludGggPSBwcm9wZXJ0aWVzLmlzU3RlcmVvID8gT2JqZWN0LmNyZWF0ZSggc3RlcmVvUHJvdG8gKSA6IE9iamVjdC5jcmVhdGUoIG1vbm9Qcm90byApXG5cbiAgICAgIE9iamVjdC5hc3NpZ24oIHN5bnRoLCB7XG4gICAgICAgIHZvaWNlczogW10sXG4gICAgICAgIG1heFZvaWNlczogcHJvcGVydGllcy5tYXhWb2ljZXMgIT09IHVuZGVmaW5lZCA/IHByb3BlcnRpZXMubWF4Vm9pY2VzIDogMTYsXG4gICAgICAgIHZvaWNlQ291bnQ6IDAsXG4gICAgICAgIGVudkNoZWNrOiBfZW52Q2hlY2ssXG4gICAgICAgIGlkOiBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKSxcbiAgICAgICAgZGlydHk6IHRydWUsXG4gICAgICAgIHR5cGU6ICdidXMnLFxuICAgICAgICB1Z2VuTmFtZTogJ3BvbHknICsgdWdlbi5uYW1lICsgJ18nICsgc3ludGguaWQsXG4gICAgICAgIGlucHV0czpbXSxcbiAgICAgICAgaW5wdXROYW1lczogW10sXG4gICAgICAgIHByb3BlcnRpZXNcbiAgICAgIH0pXG5cbiAgICAgIHByb3BlcnRpZXMucGFuVm9pY2VzID0gcHJvcGVydGllcy5pc1N0ZXJlb1xuICAgICAgc3ludGguY2FsbGJhY2sudWdlbk5hbWUgPSBzeW50aC51Z2VuTmFtZVxuXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHN5bnRoLm1heFZvaWNlczsgaSsrICkge1xuICAgICAgICBzeW50aC52b2ljZXNbaV0gPSB1Z2VuKCBwcm9wZXJ0aWVzIClcbiAgICAgICAgc3ludGgudm9pY2VzW2ldLmNhbGxiYWNrLnVnZW5OYW1lID0gc3ludGgudm9pY2VzW2ldLnVnZW5OYW1lXG4gICAgICAgIHN5bnRoLnZvaWNlc1tpXS5pc0Nvbm5lY3RlZCA9IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGxldCBfcHJvcGVydHlMaXN0IFxuICAgICAgaWYoIHByb3BlcnRpZXMuaXNTdGVyZW8gPT09IGZhbHNlICkge1xuICAgICAgICBfcHJvcGVydHlMaXN0ID0gcHJvcGVydHlMaXN0LnNsaWNlKCAwIClcbiAgICAgICAgY29uc3QgaWR4ID0gIF9wcm9wZXJ0eUxpc3QuaW5kZXhPZiggJ3BhbicgKVxuICAgICAgICBpZiggaWR4ICA+IC0xICkgX3Byb3BlcnR5TGlzdC5zcGxpY2UoIGlkeCwgMSApXG4gICAgICB9XG5cbiAgICAgIFRlbXBsYXRlRmFjdG9yeS5zZXR1cFByb3BlcnRpZXMoIHN5bnRoLCB1Z2VuLCBwcm9wZXJ0aWVzLmlzU3RlcmVvID8gcHJvcGVydHlMaXN0IDogX3Byb3BlcnR5TGlzdCApXG5cbiAgICAgIHJldHVybiBzeW50aFxuICAgIH1cblxuICAgIHJldHVybiBUZW1wbGF0ZVxuICB9XG5cbiAgVGVtcGxhdGVGYWN0b3J5LnNldHVwUHJvcGVydGllcyA9IGZ1bmN0aW9uKCBzeW50aCwgdWdlbiwgcHJvcHMgKSB7XG4gICAgZm9yKCBsZXQgcHJvcGVydHkgb2YgcHJvcHMgKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHN5bnRoLCBwcm9wZXJ0eSwge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHN5bnRoLnByb3BlcnRpZXNbIHByb3BlcnR5IF0gfHwgdWdlbi5kZWZhdWx0c1sgcHJvcGVydHkgXVxuICAgICAgICB9LFxuICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgc3ludGgucHJvcGVydGllc1sgcHJvcGVydHkgXSA9IHZcbiAgICAgICAgICBmb3IoIGxldCBjaGlsZCBvZiBzeW50aC5pbnB1dHMgKSB7XG4gICAgICAgICAgICBjaGlsZFsgcHJvcGVydHkgXSA9IHZcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFRlbXBsYXRlRmFjdG9yeVxuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgbGV0IHByb3RvID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApXG5cbiAgT2JqZWN0LmFzc2lnbiggcHJvdG8sIHtcbiAgICBub3RlKCByYXRlICkge1xuICAgICAgdGhpcy5yYXRlID0gcmF0ZVxuICAgICAgaWYoIHJhdGUgPiAwICkge1xuICAgICAgICB0aGlzLnRyaWdnZXIoKVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuX19waGFzZV9fLnZhbHVlID0gdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxIFxuICAgICAgfVxuICAgIH0sXG4gIH0pXG5cbiAgY29uc3QgU2FtcGxlciA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGNvbnN0IHN5biA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbiggeyBvbmxvYWQ6bnVsbCB9LCBTYW1wbGVyLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgIHN5bi5pc1N0ZXJlbyA9IHByb3BzLmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pc1N0ZXJlbyA6IGZhbHNlXG5cbiAgICBjb25zdCBzdGFydCA9IGcuaW4oICdzdGFydCcgKSwgZW5kID0gZy5pbiggJ2VuZCcgKSwgXG4gICAgICAgICAgcmF0ZSA9IGcuaW4oICdyYXRlJyApLCBzaG91bGRMb29wID0gZy5pbiggJ2xvb3BzJyApXG5cbiAgICAvKiBcbiAgICAgKiBjcmVhdGUgZHVtbXkgdWdlbiB1bnRpbCBkYXRhIGZvciBzYW1wbGVyIGlzIGxvYWRlZC4uLlxuICAgICAqIHRoaXMgd2lsbCBiZSBvdmVycmlkZGVuIGJ5IGEgY2FsbCB0byBHaWJiZXJpc2guZmFjdG9yeSBvbiBsb2FkIFxuICAgICAqL1xuXG4gICAgc3luLmNhbGxiYWNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwIH1cbiAgICBzeW4uaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgIHN5bi51Z2VuTmFtZSA9IHN5bi5jYWxsYmFjay51Z2VuTmFtZSA9ICdzYW1wbGVyXycgKyBzeW4uaWRcbiAgICBzeW4uaW5wdXROYW1lcyA9IFtdXG5cbiAgICAvKiBlbmQgZHVtbXkgdWdlbiAqL1xuXG4gICAgc3luLl9fYmFuZ19fID0gZy5iYW5nKClcbiAgICBzeW4udHJpZ2dlciA9IHN5bi5fX2JhbmdfXy50cmlnZ2VyXG5cbiAgICBPYmplY3QuYXNzaWduKCBzeW4sIHByb3BzIClcblxuICAgIGlmKCBwcm9wcy5maWxlbmFtZSApIHtcbiAgICAgIHN5bi5kYXRhID0gZy5kYXRhKCBwcm9wcy5maWxlbmFtZSApXG5cbiAgICAgIHN5bi5kYXRhLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgc3luLl9fcGhhc2VfXyA9IGcuY291bnRlciggcmF0ZSwgc3RhcnQsIGVuZCwgc3luLl9fYmFuZ19fLCBzaG91bGRMb29wLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSlcblxuICAgICAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICAgICAgc3luLFxuICAgICAgICAgIGcubXVsKCBcbiAgICAgICAgICBnLmlmZWxzZSggXG4gICAgICAgICAgICBnLmFuZCggZy5ndGUoIHN5bi5fX3BoYXNlX18sIHN0YXJ0ICksIGcubHQoIHN5bi5fX3BoYXNlX18sIGVuZCApICksXG4gICAgICAgICAgICBnLnBlZWsoIFxuICAgICAgICAgICAgICBzeW4uZGF0YSwgXG4gICAgICAgICAgICAgIHN5bi5fX3BoYXNlX18sXG4gICAgICAgICAgICAgIHsgbW9kZTonc2FtcGxlcycgfVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIDBcbiAgICAgICAgICApLCBnLmluKCdnYWluJykgKSxcbiAgICAgICAgICAnc2FtcGxlcicsIFxuICAgICAgICAgIHByb3BzIFxuICAgICAgICApIFxuXG4gICAgICAgIGlmKCBzeW4uZW5kID09PSAtOTk5OTk5OTk5ICkgc3luLmVuZCA9IHN5bi5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxXG5cbiAgICAgICAgaWYoIHN5bi5vbmxvYWQgIT09IG51bGwgKSB7IHN5bi5vbmxvYWQoKSB9XG5cbiAgICAgICAgR2liYmVyaXNoLmRpcnR5KCBzeW4gKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzeW5cbiAgfVxuICBcblxuICBTYW1wbGVyLmRlZmF1bHRzID0ge1xuICAgIGdhaW46IDEsXG4gICAgcGFuOiAuNSxcbiAgICByYXRlOiAxLFxuICAgIHBhblZvaWNlczpmYWxzZSxcbiAgICBsb29wczogMCxcbiAgICBzdGFydDowLFxuICAgIGVuZDotOTk5OTk5OTk5LFxuICB9XG5cbiAgY29uc3QgZW52Q2hlY2tGYWN0b3J5ID0gZnVuY3Rpb24oIHZvaWNlLCBfcG9seSApIHtcblxuICAgIGNvbnN0IGVudkNoZWNrID0gKCkgPT4ge1xuICAgICAgY29uc3QgcGhhc2UgPSBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIHZvaWNlLl9fcGhhc2VfXy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIGlmKCAoIHZvaWNlLnJhdGUgPiAwICYmIHBoYXNlID4gdm9pY2UuZW5kICkgfHwgKCB2b2ljZS5yYXRlIDwgMCAmJiBwaGFzZSA8IDAgKSApIHtcbiAgICAgICAgX3BvbHkuZGlzY29ubmVjdFVnZW4uY2FsbCggX3BvbHksIHZvaWNlIClcbiAgICAgICAgdm9pY2UuaXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5wdXNoKCBlbnZDaGVjayApXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudkNoZWNrXG4gIH1cblxuICBjb25zdCBQb2x5U2FtcGxlciA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIFNhbXBsZXIsIFsncmF0ZScsJ3BhbicsJ2dhaW4nLCdzdGFydCcsJ2VuZCcsJ2xvb3BzJ10sIGVudkNoZWNrRmFjdG9yeSApIFxuXG4gIHJldHVybiBbIFNhbXBsZXIsIFBvbHlTYW1wbGVyIF1cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuICBcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgU25hcmUgPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBsZXQgc25hcmUgPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgIGRlY2F5ID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICBzY2FsZWREZWNheSA9IGcubXVsKCBkZWNheSwgZy5nZW4uc2FtcGxlcmF0ZSAqIDIgKSxcbiAgICAgICAgc25hcHB5PSBnLmluKCAnc25hcHB5JyApLFxuICAgICAgICB0dW5lICA9IGcuaW4oICd0dW5lJyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgU25hcmUuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgbGV0IGVnID0gZy5kZWNheSggc2NhbGVkRGVjYXksIHsgaW5pdFZhbHVlOjAgfSApLCBcbiAgICAgICAgY2hlY2sgPSBnLm1lbW8oIGcuZ3QoIGVnLCAuMDAwNSApICksXG4gICAgICAgIHJuZCA9IGcubXVsKCBnLm5vaXNlKCksIGVnICksXG4gICAgICAgIGhwZiA9IGcuc3ZmKCBybmQsIGcuYWRkKCAxMDAwLCBnLm11bCggZy5hZGQoIDEsIHR1bmUpLCAxMDAwICkgKSwgLjUsIDEsIGZhbHNlICksXG4gICAgICAgIHNuYXAgPSBnLmd0cCggZy5tdWwoIGhwZiwgc25hcHB5ICksIDAgKSwgLy8gcmVjdGlmeVxuICAgICAgICBicGYxID0gZy5zdmYoIGVnLCBnLm11bCggMTgwLCBnLmFkZCggdHVuZSwgMSApICksIC4wNSwgMiwgZmFsc2UgKSxcbiAgICAgICAgYnBmMiA9IGcuc3ZmKCBlZywgZy5tdWwoIDMzMCwgZy5hZGQoIHR1bmUsIDEgKSApLCAuMDUsIDIsIGZhbHNlICksXG4gICAgICAgIG91dCAgPSBnLm1lbW8oIGcuYWRkKCBzbmFwLCBicGYxLCBnLm11bCggYnBmMiwgLjggKSApICksIC8vWFhYIHdoeSBpcyBtZW1vIG5lZWRlZD9cbiAgICAgICAgc2NhbGVkT3V0ID0gZy5tdWwoIG91dCwgZ2FpbiApXG4gICAgXG4gICAgLy8gWFhYIFRPRE8gOiBtYWtlIHRoaXMgd29yayB3aXRoIGlmZWxzZS4gdGhlIHByb2JsZW0gaXMgdGhhdCBwb2tlIHVnZW5zIHB1dCB0aGVpclxuICAgIC8vIGNvZGUgYXQgdGhlIGJvdHRvbSBvZiB0aGUgY2FsbGJhY2sgZnVuY3Rpb24sIGluc3RlYWQgb2YgYXQgdGhlIGVuZCBvZiB0aGVcbiAgICAvLyBhc3NvY2lhdGVkIGlmL2Vsc2UgYmxvY2suXG4gICAgbGV0IGlmZSA9IGcuc3dpdGNoKCBjaGVjaywgc2NhbGVkT3V0LCAwIClcbiAgICAvL2xldCBpZmUgPSBnLmlmZWxzZSggZy5ndCggZWcsIC4wMDUgKSwgY3ljbGUoNDQwKSwgMCApXG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHNuYXJlLCBpZmUsICdzbmFyZScsIHByb3BzICApXG4gICAgXG4gICAgc25hcmUuZW52ID0gZWcgXG5cbiAgICByZXR1cm4gc25hcmVcbiAgfVxuICBcbiAgU25hcmUuZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogMSxcbiAgICBmcmVxdWVuY3k6MTAwMCxcbiAgICB0dW5lOjAsXG4gICAgc25hcHB5OiAxLFxuICAgIGRlY2F5Oi4xXG4gIH1cblxuICByZXR1cm4gU25hcmVcblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBTeW50aCA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGNvbnN0IHN5biA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKVxuXG4gICAgY29uc3QgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgICBsb3VkbmVzcyAgPSBnLmluKCAnbG91ZG5lc3MnICksIFxuICAgICAgICAgIGdsaWRlID0gZy5pbiggJ2dsaWRlJyApLFxuICAgICAgICAgIHNsaWRpbmdGcmVxID0gZy5zbGlkZSggZnJlcXVlbmN5LCBnbGlkZSwgZ2xpZGUgKSxcbiAgICAgICAgICBhdHRhY2sgPSBnLmluKCAnYXR0YWNrJyApLCBkZWNheSA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgICBzdXN0YWluID0gZy5pbiggJ3N1c3RhaW4nICksIHN1c3RhaW5MZXZlbCA9IGcuaW4oICdzdXN0YWluTGV2ZWwnICksXG4gICAgICAgICAgcmVsZWFzZSA9IGcuaW4oICdyZWxlYXNlJyApXG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBTeW50aC5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgT2JqZWN0LmFzc2lnbiggc3luLCBwcm9wcyApXG5cbiAgICBzeW4uX19jcmVhdGVHcmFwaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3Qgb3NjID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoIHN5bi53YXZlZm9ybSwgc2xpZGluZ0ZyZXEsIHN5bi5hbnRpYWxpYXMgKVxuXG4gICAgICBjb25zdCBlbnYgPSBHaWJiZXJpc2guZW52ZWxvcGVzLmZhY3RvcnkoIFxuICAgICAgICBwcm9wcy51c2VBRFNSLCBcbiAgICAgICAgcHJvcHMuc2hhcGUsIFxuICAgICAgICBhdHRhY2ssIGRlY2F5LCBcbiAgICAgICAgc3VzdGFpbiwgc3VzdGFpbkxldmVsLCBcbiAgICAgICAgcmVsZWFzZSwgXG4gICAgICAgIHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgICApXG5cbiAgICAgIC8vIGJlbG93IGRvZXNuJ3Qgd29yayBhcyBpdCBhdHRlbXB0cyB0byBhc3NpZ24gdG8gcmVsZWFzZSBwcm9wZXJ0eSB0cmlnZ2VyaW5nIGNvZGVnZW4uLi5cbiAgICAgIC8vIHN5bi5yZWxlYXNlID0gKCk9PiB7IHN5bi5lbnYucmVsZWFzZSgpIH1cblxuICAgICAgbGV0IG9zY1dpdGhFbnYgPSBnLm11bCggZy5tdWwoIG9zYywgZW52LCBsb3VkbmVzcyApICksXG4gICAgICAgICAgcGFubmVyXG4gIFxuICAgICAgY29uc3QgYmFzZUN1dG9mZkZyZXEgPSBnLm11bCggZy5pbignY3V0b2ZmJyksIGZyZXF1ZW5jeSApXG4gICAgICBjb25zdCBjdXRvZmYgPSBnLm11bCggZy5tdWwoIGJhc2VDdXRvZmZGcmVxLCBnLnBvdyggMiwgZy5pbignZmlsdGVyTXVsdCcpICkpLCBlbnYgKVxuICAgICAgY29uc3QgZmlsdGVyZWRPc2MgPSBHaWJiZXJpc2guZmlsdGVycy5mYWN0b3J5KCBvc2NXaXRoRW52LCBjdXRvZmYsIGcuaW4oJ1EnKSwgZy5pbignc2F0dXJhdGlvbicpLCBwcm9wcyApXG5cbiAgICAgIGxldCBzeW50aFdpdGhHYWluID0gZy5tdWwoIGZpbHRlcmVkT3NjLCBnLmluKCAnZ2FpbicgKSApXG4gIFxuICAgICAgaWYoIHN5bi5wYW5Wb2ljZXMgPT09IHRydWUgKSB7IFxuICAgICAgICBwYW5uZXIgPSBnLnBhbiggc3ludGhXaXRoR2Fpbiwgc3ludGhXaXRoR2FpbiwgZy5pbiggJ3BhbicgKSApIFxuICAgICAgICBzeW4uZ3JhcGggPSBbIHBhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHQgXVxuICAgICAgfWVsc2V7XG4gICAgICAgIHN5bi5ncmFwaCA9IHN5bnRoV2l0aEdhaW5cbiAgICAgIH1cblxuICAgICAgc3luLmVudiA9IGVudlxuICAgICAgc3luLm9zYyA9IG9zY1xuICAgICAgc3luLmZpbHRlciA9IGZpbHRlcmVkT3NjXG5cbiAgICB9XG4gICAgXG4gICAgc3luLl9fcmVxdWlyZXNSZWNvbXBpbGF0aW9uID0gWyAnd2F2ZWZvcm0nLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCdmaWx0ZXJNb2RlJywgJ3VzZUFEU1InLCAnc2hhcGUnIF1cbiAgICBzeW4uX19jcmVhdGVHcmFwaCgpXG5cbiAgICBjb25zdCBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeSggc3luLCBzeW4uZ3JhcGgsIFsnaW5zdHJ1bWVudHMnLCAnc3ludGgnXSwgcHJvcHMgIClcblxuICAgIHJldHVybiBvdXRcbiAgfVxuICBcbiAgU3ludGguZGVmYXVsdHMgPSB7XG4gICAgd2F2ZWZvcm06J3NhdycsXG4gICAgYXR0YWNrOiA0NCxcbiAgICBkZWNheTogMjIwNTAsXG4gICAgc3VzdGFpbjo0NDEwMCxcbiAgICBzdXN0YWluTGV2ZWw6LjYsXG4gICAgcmVsZWFzZToyMjA1MCxcbiAgICB1c2VBRFNSOmZhbHNlLFxuICAgIHNoYXBlOidsaW5lYXInLFxuICAgIHRyaWdnZXJSZWxlYXNlOmZhbHNlLFxuICAgIGdhaW46IDEsXG4gICAgcHVsc2V3aWR0aDouMjUsXG4gICAgZnJlcXVlbmN5OjIyMCxcbiAgICBwYW46IC41LFxuICAgIGFudGlhbGlhczpmYWxzZSxcbiAgICBwYW5Wb2ljZXM6ZmFsc2UsXG4gICAgbG91ZG5lc3M6MSxcbiAgICBnbGlkZToxLFxuICAgIHNhdHVyYXRpb246MSxcbiAgICBmaWx0ZXJNdWx0OjIsXG4gICAgUTouMjUsXG4gICAgY3V0b2ZmOi41LFxuICAgIGZpbHRlclR5cGU6MCxcbiAgICBmaWx0ZXJNb2RlOjAsXG4gICAgaXNMb3dQYXNzOjFcbiAgfVxuXG4gIC8vIGRvIG5vdCBpbmNsdWRlIHZlbG9jaXR5LCB3aGljaCBzaG91ZGwgYWx3YXlzIGJlIHBlciB2b2ljZVxuICBsZXQgUG9seVN5bnRoID0gR2liYmVyaXNoLlBvbHlUZW1wbGF0ZSggU3ludGgsIFsnZnJlcXVlbmN5JywnYXR0YWNrJywnZGVjYXknLCdwdWxzZXdpZHRoJywncGFuJywnZ2FpbicsJ2dsaWRlJywgJ3NhdHVyYXRpb24nLCAnZmlsdGVyTXVsdCcsICdRJywgJ2N1dG9mZicsICdyZXNvbmFuY2UnLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnd2F2ZWZvcm0nLCAnZmlsdGVyTW9kZSddICkgXG5cbiAgcmV0dXJuIFsgU3ludGgsIFBvbHlTeW50aCBdXG5cbn1cbiIsImNvbnN0IHVnZW5wcm90byA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgQmlub3BzID0ge1xuICAgIGV4cG9ydCggb2JqICkge1xuICAgICAgZm9yKCBsZXQga2V5IGluIEJpbm9wcyApIHtcbiAgICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgICAgb2JqWyBrZXkgXSA9IEJpbm9wc1sga2V5IF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgQWRkKCAuLi5hcmdzICkge1xuICAgICAgY29uc3QgaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHVnZW5wcm90byApXG4gICAgICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IGJpbm9wOnRydWUsIG9wOicrJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidhZGQnICsgaWQsIGlkIH0gKVxuXG4gICAgICByZXR1cm4gdWdlblxuICAgIH0sXG5cbiAgICBTdWIoIC4uLmFyZ3MgKSB7XG4gICAgICBjb25zdCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICBjb25zdCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggdWdlbnByb3RvIClcbiAgICAgIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgYmlub3A6dHJ1ZSwgb3A6Jy0nLCBpbnB1dHM6YXJncywgdWdlbk5hbWU6J3N1YicgKyBpZCwgaWQgfSApXG5cbiAgICAgIHJldHVybiB1Z2VuXG4gICAgfSxcblxuICAgIE11bCggLi4uYXJncyApIHtcbiAgICAgIGNvbnN0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIGNvbnN0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCB1Z2VucHJvdG8gKVxuICAgICAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBiaW5vcDp0cnVlLCBvcDonKicsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonbXVsJyArIGlkLCBpZCB9IClcblxuICAgICAgcmV0dXJuIHVnZW5cbiAgICB9LFxuXG4gICAgRGl2KCAuLi5hcmdzICkge1xuICAgICAgY29uc3QgaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHVnZW5wcm90byApXG4gICAgICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IGJpbm9wOnRydWUsIG9wOicvJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidkaXYnICsgaWQsIGlkIH0gKVxuICAgIFxuICAgICAgcmV0dXJuIHVnZW5cbiAgICB9LFxuXG4gICAgTW9kKCAuLi5hcmdzICkge1xuICAgICAgY29uc3QgaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHVnZW5wcm90byApXG4gICAgICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IGJpbm9wOnRydWUsIG9wOiclJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidtb2QnICsgaWQsIGlkIH0gKVxuXG4gICAgICByZXR1cm4gdWdlblxuICAgIH0sICAgXG4gIH1cblxuICByZXR1cm4gQmlub3BzXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgXG4gIGNvbnN0IEJ1cyA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG4gIE9iamVjdC5hc3NpZ24oIEJ1cywge1xuICAgIF9fZ2FpbiA6IHtcbiAgICAgIHNldCggdiApIHtcbiAgICAgICAgdGhpcy5tdWwuaW5wdXRzWyAxIF0gPSB2XG4gICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdGhpcyApXG4gICAgICB9LFxuICAgICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tdWxbIDEgXVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBfX2FkZElucHV0KCBpbnB1dCApIHtcbiAgICAgIHRoaXMuc3VtLmlucHV0cy5wdXNoKCBpbnB1dCApXG4gICAgICBHaWJiZXJpc2guZGlydHkoIHRoaXMgKVxuICAgIH0sXG5cbiAgICBjcmVhdGUoIF9wcm9wcyApIHtcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgQnVzLmRlZmF1bHRzLCBfcHJvcHMgKVxuXG4gICAgICBjb25zdCBzdW0gPSBHaWJiZXJpc2guYmlub3BzLkFkZCggLi4ucHJvcHMuaW5wdXRzIClcbiAgICAgIGNvbnN0IG11bCA9IEdpYmJlcmlzaC5iaW5vcHMuTXVsKCBzdW0sIHByb3BzLmdhaW4gKVxuXG4gICAgICBjb25zdCBncmFwaCA9IEdpYmJlcmlzaC5QYW5uZXIoeyBpbnB1dDptdWwsIHBhbjogcHJvcHMucGFuIH0pXG5cbiAgICAgIGdyYXBoLnN1bSA9IHN1bVxuICAgICAgZ3JhcGgubXVsID0gbXVsXG4gICAgICBncmFwaC5kaXNjb25uZWN0VWdlbiA9IEJ1cy5kaXNjb25uZWN0VWdlblxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGdyYXBoLCAnZ2FpbicsIEJ1cy5fX2dhaW4gKVxuXG4gICAgICBncmFwaC5fX3Byb3BlcnRpZXNfXyA9IHByb3BzXG5cbiAgICAgIHJldHVybiBncmFwaFxuICAgIH0sXG5cbiAgICBkaXNjb25uZWN0VWdlbiggdWdlbiApIHtcbiAgICAgIGxldCByZW1vdmVJZHggPSB0aGlzLnN1bS5pbnB1dHMuaW5kZXhPZiggdWdlbiApXG5cbiAgICAgIGlmKCByZW1vdmVJZHggIT09IC0xICkge1xuICAgICAgICB0aGlzLnN1bS5pbnB1dHMuc3BsaWNlKCByZW1vdmVJZHgsIDEgKVxuICAgICAgICBHaWJiZXJpc2guZGlydHkoIHRoaXMgKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBkZWZhdWx0czogeyBnYWluOjEsIGlucHV0czpbMF0sIHBhbjouNSB9XG4gIH0pXG5cbiAgcmV0dXJuIEJ1cy5jcmVhdGUuYmluZCggQnVzIClcblxufVxuXG4iLCIvKmxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBcbiAgY29uc3QgQnVzMiA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG4gIE9iamVjdC5hc3NpZ24oIEJ1czIsIHtcbiAgICBfX2dhaW4gOiB7XG4gICAgICBzZXQoIHYgKSB7XG4gICAgICAgIHRoaXMubXVsLmlucHV0c1sgMSBdID0gdlxuICAgICAgICBHaWJiZXJpc2guZGlydHkoIHRoaXMgKVxuXG4gICAgICB9LFxuICAgICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tdWxbIDEgXVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBfX2FkZElucHV0KCBpbnB1dCApIHtcbiAgICAgIGlmKCBpbnB1dC5pc1N0ZXJlbyB8fCBBcnJheS5pc0FycmF5KCBpbnB1dCApICkge1xuICAgICAgICBjb25zb2xlLmxvZygnc3RlcmVvJywgaW5wdXQgKVxuICAgICAgICB0aGlzLnN1bUwuaW5wdXRzLnB1c2goIGlucHV0WzBdIClcbiAgICAgICAgdGhpcy5zdW1SLmlucHV0cy5wdXNoKCBpbnB1dFswXSApICAgICAgICBcbiAgICAgIH1lbHNle1xuICAgICAgICBjb25zb2xlLmxvZyggJ21vbm8nLCBpbnB1dCApXG4gICAgICAgIHRoaXMuc3VtTC5pbnB1dHMucHVzaCggaW5wdXQgKVxuICAgICAgICB0aGlzLnN1bVIuaW5wdXRzLnB1c2goIGlucHV0IClcbiAgICAgIH1cblxuICAgICAgR2liYmVyaXNoLmRpcnR5KCB0aGlzIClcbiAgICB9LFxuXG4gICAgY3JlYXRlKCBfcHJvcHMgKSB7XG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIEJ1czIuZGVmYXVsdHMsIF9wcm9wcyApXG5cbiAgICAgIGNvbnN0IGlucHV0c0wgPSBbXSwgaW5wdXRzUiA9IFtdXG5cbiAgICAgIHByb3BzLmlucHV0cy5mb3JFYWNoKCBpID0+IHtcbiAgICAgICAgaWYoIGkuaXNTdGVyZW8gfHwgQXJyYXkuaXNBcnJheSggaSApICkge1xuICAgICAgICAgIGlucHV0c0wucHVzaCggaVswXSApIFxuICAgICAgICAgIGlucHV0c1IucHVzaCggaVsxXSApXG4gICAgICAgIH1lbHNleyBcbiAgICAgICAgICBpbnB1dHNMLnB1c2goIGkgKSBcbiAgICAgICAgICBpbnB1dHNSLnB1c2goIGkgKVxuICAgICAgICB9ICBcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IHN1bUwgPSBHaWJiZXJpc2guYmlub3BzLkFkZCggLi4uaW5wdXRzTCApXG4gICAgICBjb25zdCBtdWxMID0gR2liYmVyaXNoLmJpbm9wcy5NdWwoIHN1bUwsIHByb3BzLmdhaW4gKVxuICAgICAgY29uc3Qgc3VtUiA9IEdpYmJlcmlzaC5iaW5vcHMuQWRkKCAuLi5pbnB1dHNSIClcbiAgICAgIGNvbnN0IG11bFIgPSBHaWJiZXJpc2guYmlub3BzLk11bCggc3VtUiwgcHJvcHMuZ2FpbiApXG5cbiAgICAgIGNvbnN0IGdyYXBoID0gR2liYmVyaXNoLlBhbm5lcih7IGlucHV0Om11bEwsIHBhbjogcHJvcHMucGFuIH0pXG5cbiAgICAgIE9iamVjdC5hc3NpZ24oIGdyYXBoLCB7IHN1bUwsIG11bEwsIHN1bVIsIG11bFIsIF9fYWRkSW5wdXQ6QnVzMi5fX2FkZElucHV0LCBkaXNjb25uZWN0VWdlbjpCdXMyLmRpc2Nvbm5lY3RVZ2VuICB9KVxuXG4gICAgICBncmFwaC5pc1N0ZXJlbyA9IHRydWVcbiAgICAgIGdyYXBoLmlucHV0cyA9IHByb3BzLmlucHV0c1xuICAgICAgLy9ncmFwaC50eXBlID0gJ2J1cydcblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBncmFwaCwgJ2dhaW4nLCBCdXMyLl9fZ2FpbiApXG5cbiAgICAgIHJldHVybiBncmFwaFxuICAgIH0sXG5cbiAgICBkaXNjb25uZWN0VWdlbiggdWdlbiApIHtcbiAgICAgIGxldCByZW1vdmVJZHggPSB0aGlzLnN1bS5pbnB1dHMuaW5kZXhPZiggdWdlbiApXG5cbiAgICAgIGlmKCByZW1vdmVJZHggIT09IC0xICkge1xuICAgICAgICB0aGlzLnN1bS5pbnB1dHMuc3BsaWNlKCByZW1vdmVJZHgsIDEgKVxuICAgICAgICBHaWJiZXJpc2guZGlydHkoIHRoaXMgKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBkZWZhdWx0czogeyBnYWluOjEsIGlucHV0czpbMF0sIHBhbjouNSB9XG4gIH0pXG5cbiAgcmV0dXJuIEJ1czIuY3JlYXRlLmJpbmQoIEJ1czIgKVxuXG59XG4qL1xuXG5cbmNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgY29uc3QgQnVzMiA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG4gIGxldCBidWZmZXJMLCBidWZmZXJSXG4gIFxuICBPYmplY3QuYXNzaWduKCBCdXMyLCB7IFxuICAgIGNyZWF0ZSggcHJvcHMgKSB7XG4gICAgICBpZiggYnVmZmVyTCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICBidWZmZXJMID0gR2liYmVyaXNoLmdlbmlzaC5nZW4uZ2xvYmFscy5wYW5MLm1lbW9yeS52YWx1ZXMuaWR4XG4gICAgICAgIGJ1ZmZlclIgPSBHaWJiZXJpc2guZ2VuaXNoLmdlbi5nbG9iYWxzLnBhblIubWVtb3J5LnZhbHVlcy5pZHhcbiAgICAgIH1cblxuICAgICAgdmFyIG91dHB1dCA9IG5ldyBGbG9hdDMyQXJyYXkoIDIgKVxuXG4gICAgICB2YXIgYnVzID0gT2JqZWN0LmNyZWF0ZSggQnVzMiApXG5cbiAgICAgIE9iamVjdC5hc3NpZ24oIFxuICAgICAgICBidXMsXG5cbiAgICAgICAge1xuICAgICAgICAgIGNhbGxiYWNrKCkge1xuICAgICAgICAgICAgb3V0cHV0WyAwIF0gPSBvdXRwdXRbIDEgXSA9IDBcbiAgICAgICAgICAgIHZhciBsYXN0SWR4ID0gYXJndW1lbnRzLmxlbmd0aCAtIDFcbiAgICAgICAgICAgIHZhciBtZW1vcnkgID0gYXJndW1lbnRzWyBsYXN0SWR4IF1cblxuICAgICAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBsYXN0SWR4OyBpKysgKSB7XG4gICAgICAgICAgICAgIHZhciBpbnB1dCA9IGFyZ3VtZW50c1sgaSBdLFxuICAgICAgICAgICAgICAgICAgaXNBcnJheSA9IGlucHV0IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5XG5cbiAgICAgICAgICAgICAgb3V0cHV0WyAwIF0gKz0gaXNBcnJheSA/IGlucHV0WyAwIF0gOiBpbnB1dFxuICAgICAgICAgICAgICBvdXRwdXRbIDEgXSArPSBpc0FycmF5ID8gaW5wdXRbIDEgXSA6IGlucHV0XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwYW5SYXdJbmRleCAgPSAuNSAqIDEwMjMsXG4gICAgICAgICAgICAgICAgcGFuQmFzZUluZGV4ID0gcGFuUmF3SW5kZXggfCAwLFxuICAgICAgICAgICAgICAgIHBhbk5leHRJbmRleCA9IChwYW5CYXNlSW5kZXggKyAxKSAmIDEwMjMsXG4gICAgICAgICAgICAgICAgaW50ZXJwQW1vdW50ID0gcGFuUmF3SW5kZXggLSBwYW5CYXNlSW5kZXgsXG4gICAgICAgICAgICAgICAgcGFuTCA9IG1lbW9yeVsgYnVmZmVyTCArIHBhbkJhc2VJbmRleCBdIFxuICAgICAgICAgICAgICAgICAgKyAoIGludGVycEFtb3VudCAqICggbWVtb3J5WyBidWZmZXJMICsgcGFuTmV4dEluZGV4IF0gLSBtZW1vcnlbIGJ1ZmZlckwgKyBwYW5CYXNlSW5kZXggXSApICksXG4gICAgICAgICAgICAgICAgcGFuUiA9IG1lbW9yeVsgYnVmZmVyUiArIHBhbkJhc2VJbmRleCBdIFxuICAgICAgICAgICAgICAgICAgKyAoIGludGVycEFtb3VudCAqICggbWVtb3J5WyBidWZmZXJSICsgcGFuTmV4dEluZGV4IF0gLSBtZW1vcnlbIGJ1ZmZlclIgKyBwYW5CYXNlSW5kZXggXSApIClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb3V0cHV0WzBdICo9IGJ1cy5nYWluICogcGFuTFxuICAgICAgICAgICAgb3V0cHV0WzFdICo9IGJ1cy5nYWluICogcGFuUlxuXG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0XG4gICAgICAgICAgfSxcbiAgICAgICAgICBpZCA6IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpLFxuICAgICAgICAgIGRpcnR5IDogdHJ1ZSxcbiAgICAgICAgICB0eXBlIDogJ2J1cycsXG4gICAgICAgICAgaW5wdXRzOltdLFxuICAgICAgICAgIF9fcHJvcGVydGllc19fOnByb3BzXG4gICAgICAgIH0sXG5cbiAgICAgICAgQnVzMi5kZWZhdWx0cyxcblxuICAgICAgICBwcm9wc1xuICAgICAgKVxuXG4gICAgICBidXMudWdlbk5hbWUgPSBidXMuY2FsbGJhY2sudWdlbk5hbWUgPSAnYnVzMl8nICsgYnVzLmlkXG5cbiAgICAgIHJldHVybiBidXNcbiAgICB9LFxuICAgIFxuICAgIGRpc2Nvbm5lY3RVZ2VuKCB1Z2VuICkge1xuICAgICAgbGV0IHJlbW92ZUlkeCA9IHRoaXMuaW5wdXRzLmluZGV4T2YoIHVnZW4gKVxuXG4gICAgICBpZiggcmVtb3ZlSWR4ICE9PSAtMSApIHtcbiAgICAgICAgdGhpcy5pbnB1dHMuc3BsaWNlKCByZW1vdmVJZHgsIDEgKVxuICAgICAgICBHaWJiZXJpc2guZGlydHkoIHRoaXMgKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBkZWZhdWx0czogeyBnYWluOjEsIHBhbjouNSB9XG4gIH0pXG5cbiAgcmV0dXJuIEJ1czIuY3JlYXRlLmJpbmQoIEJ1czIgKVxuXG59XG5cbiIsImNvbnN0ICBnICAgID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgICksXG4gICAgICAgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBNb25vcHMgPSB7XG4gICAgZXhwb3J0KCBvYmogKSB7XG4gICAgICBmb3IoIGxldCBrZXkgaW4gTW9ub3BzICkge1xuICAgICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyApIHtcbiAgICAgICAgICBvYmpbIGtleSBdID0gTW9ub3BzWyBrZXkgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBBYnMoIGlucHV0ICkge1xuICAgICAgY29uc3QgYWJzID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBncmFwaCA9IGcuYWJzKCBnLmluKCdpbnB1dCcpIClcbiAgICAgIFxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIGFicywgZ3JhcGgsICdhYnMnLCBPYmplY3QuYXNzaWduKHt9LCBNb25vcHMuZGVmYXVsdHMsIHsgaW5wdXQgfSkgKVxuXG4gICAgICByZXR1cm4gYWJzXG4gICAgfSxcblxuICAgIFBvdyggaW5wdXQsIGV4cG9uZW50ICkge1xuICAgICAgY29uc3QgcG93ID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBncmFwaCA9IGcucG93KCBnLmluKCdpbnB1dCcpLCBnLmluKCdleHBvbmVudCcpIClcbiAgICAgIFxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHBvdywgZ3JhcGgsICdwb3cnLCBPYmplY3QuYXNzaWduKHt9LCBNb25vcHMuZGVmYXVsdHMsIHsgaW5wdXQsIGV4cG9uZW50IH0pIClcblxuICAgICAgcmV0dXJuIHBvd1xuICAgIH0sXG4gICAgQ2xhbXAoIGlucHV0LCBtaW4sIG1heCApIHtcbiAgICAgIGNvbnN0IGNsYW1wID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBncmFwaCA9IGcuY2xhbXAoIGcuaW4oJ2lucHV0JyksIGcuaW4oJ21pbicpLCBnLmluKCdtYXgnKSApXG4gICAgICBcbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBjbGFtcCwgZ3JhcGgsICdjbGFtcCcsIE9iamVjdC5hc3NpZ24oe30sIE1vbm9wcy5kZWZhdWx0cywgeyBpbnB1dCwgbWluLCBtYXggfSkgKVxuXG4gICAgICByZXR1cm4gY2xhbXBcbiAgICB9LFxuXG4gICAgTWVyZ2UoIGlucHV0ICkge1xuICAgICAgY29uc3QgbWVyZ2VyID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBjYiA9IGZ1bmN0aW9uKCBfaW5wdXQgKSB7XG4gICAgICAgIHJldHVybiBfaW5wdXRbMF0gKyBfaW5wdXRbMV1cbiAgICAgIH1cblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIG1lcmdlciwgZy5pbiggJ2lucHV0JyApLCAnbWVyZ2UnLCB7IGlucHV0IH0sIGNiIClcbiAgICAgIG1lcmdlci50eXBlID0gJ2FuYWx5c2lzJ1xuICAgICAgbWVyZ2VyLmlucHV0TmFtZXMgPSBbICdpbnB1dCcgXVxuICAgICAgbWVyZ2VyLmlucHV0cyA9IFsgaW5wdXQgXVxuICAgICAgbWVyZ2VyLmlucHV0ID0gaW5wdXRcbiAgICAgIFxuICAgICAgcmV0dXJuIG1lcmdlclxuICAgIH0sXG4gIH1cblxuICBNb25vcHMuZGVmYXVsdHMgPSB7IGlucHV0OjAgfVxuXG4gIHJldHVybiBNb25vcHNcbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbmNvbnN0IHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgUGFubmVyID0gaW5wdXRQcm9wcyA9PiB7XG4gIGNvbnN0IHByb3BzICA9IE9iamVjdC5hc3NpZ24oIHt9LCBQYW5uZXIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgICAgcGFubmVyID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbiAgY29uc3QgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiBBcnJheS5pc0FycmF5KCBwcm9wcy5pbnB1dCApIFxuICBcbiAgY29uc3QgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICAgIHBhbiAgID0gZy5pbiggJ3BhbicgKVxuXG4gIGxldCBncmFwaCBcbiAgaWYoIGlzU3RlcmVvICkge1xuICAgIGdyYXBoID0gZy5wYW4oIGlucHV0WzBdLCBpbnB1dFsxXSwgcGFuICkgIFxuICB9ZWxzZXtcbiAgICBncmFwaCA9IGcucGFuKCBpbnB1dCwgaW5wdXQsIHBhbiApXG4gIH1cblxuICBHaWJiZXJpc2guZmFjdG9yeSggcGFubmVyLCBbIGdyYXBoLmxlZnQsIGdyYXBoLnJpZ2h0XSwgJ3Bhbm5lcicsIHByb3BzIClcbiAgXG4gIHJldHVybiBwYW5uZXJcbn1cblxuUGFubmVyLmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBwYW46LjVcbn1cblxucmV0dXJuIFBhbm5lciBcblxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IFRpbWUgPSB7XG4gICAgYnBtOiAxMjAsXG5cbiAgICBleHBvcnQ6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgT2JqZWN0LmFzc2lnbiggdGFyZ2V0LCBUaW1lIClcbiAgICB9LFxuXG4gICAgbXMgOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB2YWwgKiBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGUgLyAxMDAwO1xuICAgIH0sXG5cbiAgICBzZWNvbmRzIDogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdmFsICogR2liYmVyaXNoLmN0eC5zYW1wbGVSYXRlO1xuICAgIH0sXG5cbiAgICBiZWF0cyA6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkgeyBcbiAgICAgICAgdmFyIHNhbXBsZXNQZXJCZWF0ID0gR2liYmVyaXNoLmN0eC5zYW1wbGVSYXRlIC8gKCBHaWJiZXJpc2guVGltZS5icG0gLyA2MCApIDtcbiAgICAgICAgcmV0dXJuIHNhbXBsZXNQZXJCZWF0ICogdmFsIDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gVGltZVxufVxuIiwiY29uc3QgZ2VuaXNoID0gcmVxdWlyZSgnZ2VuaXNoLmpzJyksXG4gICAgICBzc2QgPSBnZW5pc2guaGlzdG9yeSxcbiAgICAgIG5vaXNlID0gZ2VuaXNoLm5vaXNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgXCJ1c2UganNkc3BcIjtcblxuICBjb25zdCBsYXN0ID0gc3NkKDApO1xuXG4gIGNvbnN0IHdoaXRlID0gZ2VuaXNoLnN1YihnZW5pc2gubXVsKG5vaXNlKCksIDIpLCAxKTtcblxuICBsZXQgb3V0ID0gZ2VuaXNoLmFkZChsYXN0Lm91dCwgZ2VuaXNoLmRpdihnZW5pc2gubXVsKC4wMiwgd2hpdGUpLCAxLjAyKSk7XG5cbiAgbGFzdC5pbihvdXQpO1xuXG4gIG91dCA9IGdlbmlzaC5tdWwob3V0LCAzLjUpO1xuXG4gIHJldHVybiBvdXQ7XG59OyIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5sZXQgZmVlZGJhY2tPc2MgPSBmdW5jdGlvbiggZnJlcXVlbmN5LCBmaWx0ZXIsIHB1bHNld2lkdGg9LjUsIGFyZ3VtZW50UHJvcHMgKSB7XG4gIGlmKCBhcmd1bWVudFByb3BzID09PSB1bmRlZmluZWQgKSBhcmd1bWVudFByb3BzID0geyB0eXBlOiAwIH1cblxuICBsZXQgbGFzdFNhbXBsZSA9IGcuaGlzdG9yeSgpLFxuICAgICAgLy8gZGV0ZXJtaW5lIHBoYXNlIGluY3JlbWVudCBhbmQgbWVtb2l6ZSByZXN1bHRcbiAgICAgIHcgPSBnLm1lbW8oIGcuZGl2KCBmcmVxdWVuY3ksIGcuZ2VuLnNhbXBsZXJhdGUgKSApLFxuICAgICAgLy8gY3JlYXRlIHNjYWxpbmcgZmFjdG9yXG4gICAgICBuID0gZy5zdWIoIC0uNSwgdyApLFxuICAgICAgc2NhbGluZyA9IGcubXVsKCBnLm11bCggMTMsIGZpbHRlciApLCBnLnBvdyggbiwgNSApICksXG4gICAgICAvLyBjYWxjdWxhdGUgZGMgb2Zmc2V0IGFuZCBub3JtYWxpemF0aW9uIGZhY3RvcnNcbiAgICAgIERDID0gZy5zdWIoIC4zNzYsIGcubXVsKCB3LCAuNzUyICkgKSxcbiAgICAgIG5vcm0gPSBnLnN1YiggMSwgZy5tdWwoIDIsIHcgKSApLFxuICAgICAgLy8gZGV0ZXJtaW5lIHBoYXNlXG4gICAgICBvc2MxUGhhc2UgPSBnLmFjY3VtKCB3LCAwLCB7IG1pbjotMSB9KSxcbiAgICAgIG9zYzEsIG91dFxuXG4gIC8vIGNyZWF0ZSBjdXJyZW50IHNhbXBsZS4uLiBmcm9tIHRoZSBwYXBlcjpcbiAgLy8gb3NjID0gKG9zYyArIHNpbigyKnBpKihwaGFzZSArIG9zYypzY2FsaW5nKSkpKjAuNWY7XG4gIG9zYzEgPSBnLm1lbW8oIFxuICAgIGcubXVsKFxuICAgICAgZy5hZGQoXG4gICAgICAgIGxhc3RTYW1wbGUub3V0LFxuICAgICAgICBnLnNpbihcbiAgICAgICAgICBnLm11bChcbiAgICAgICAgICAgIE1hdGguUEkgKiAyLFxuICAgICAgICAgICAgZy5tZW1vKCBnLmFkZCggb3NjMVBoYXNlLCBnLm11bCggbGFzdFNhbXBsZS5vdXQsIHNjYWxpbmcgKSApIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICksXG4gICAgICAuNVxuICAgIClcbiAgKVxuXG4gIC8vIHN0b3JlIHNhbXBsZSB0byB1c2UgYXMgbW9kdWxhdGlvblxuICBsYXN0U2FtcGxlLmluKCBvc2MxIClcblxuICAvLyBpZiBwd20gLyBzcXVhcmUgd2F2ZWZvcm0gaW5zdGVhZCBvZiBzYXd0b290aC4uLlxuICBpZiggYXJndW1lbnRQcm9wcy50eXBlID09PSAxICkgeyBcbiAgICBjb25zdCBsYXN0U2FtcGxlMiA9IGcuaGlzdG9yeSgpIC8vIGZvciBvc2MgMlxuICAgIGNvbnN0IGxhc3RTYW1wbGVNYXN0ZXIgPSBnLmhpc3RvcnkoKSAvLyBmb3Igc3VtIG9mIG9zYzEsb3NjMlxuXG4gICAgY29uc3Qgb3NjMiA9IGcubXVsKFxuICAgICAgZy5hZGQoXG4gICAgICAgIGxhc3RTYW1wbGUyLm91dCxcbiAgICAgICAgZy5zaW4oXG4gICAgICAgICAgZy5tdWwoXG4gICAgICAgICAgICBNYXRoLlBJICogMixcbiAgICAgICAgICAgIGcubWVtbyggZy5hZGQoIG9zYzFQaGFzZSwgZy5tdWwoIGxhc3RTYW1wbGUyLm91dCwgc2NhbGluZyApLCBwdWxzZXdpZHRoICkgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIC41XG4gICAgKVxuXG4gICAgbGFzdFNhbXBsZTIuaW4oIG9zYzIgKVxuICAgIG91dCA9IGcubWVtbyggZy5zdWIoIGxhc3RTYW1wbGUub3V0LCBsYXN0U2FtcGxlMi5vdXQgKSApXG4gICAgb3V0ID0gZy5tZW1vKCBnLmFkZCggZy5tdWwoIDIuNSwgb3V0ICksIGcubXVsKCAtMS41LCBsYXN0U2FtcGxlTWFzdGVyLm91dCApICkgKVxuICAgIFxuICAgIGxhc3RTYW1wbGVNYXN0ZXIuaW4oIGcuc3ViKCBvc2MxLCBvc2MyICkgKVxuXG4gIH1lbHNle1xuICAgICAvLyBvZmZzZXQgYW5kIG5vcm1hbGl6ZVxuICAgIG9zYzEgPSBnLmFkZCggZy5tdWwoIDIuNSwgb3NjMSApLCBnLm11bCggLTEuNSwgbGFzdFNhbXBsZS5vdXQgKSApXG4gICAgb3NjMSA9IGcuYWRkKCBvc2MxLCBEQyApXG4gXG4gICAgb3V0ID0gb3NjMVxuICB9XG5cbiAgcmV0dXJuIGcubXVsKCBvdXQsIG5vcm0gKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZlZWRiYWNrT3NjXG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKSxcbiAgICAgIGZlZWRiYWNrT3NjID0gcmVxdWlyZSggJy4vZm1mZWVkYmFja29zYy5qcycgKVxuXG4vLyAgX19tYWtlT3NjaWxsYXRvcl9fKCB0eXBlLCBmcmVxdWVuY3ksIGFudGlhbGlhcyApIHtcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgbGV0IE9zY2lsbGF0b3JzID0ge1xuICAgIGV4cG9ydCggb2JqICkge1xuICAgICAgZm9yKCBsZXQga2V5IGluIE9zY2lsbGF0b3JzICkge1xuICAgICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyApIHtcbiAgICAgICAgICBvYmpbIGtleSBdID0gT3NjaWxsYXRvcnNbIGtleSBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2VuaXNoOiB7XG4gICAgICBCcm93bjogcmVxdWlyZSggJy4vYnJvd25ub2lzZS5qcycgKSxcbiAgICAgIFBpbms6ICByZXF1aXJlKCAnLi9waW5rbm9pc2UuanMnICApXG4gICAgfSxcblxuICAgIFdhdmV0YWJsZTogcmVxdWlyZSggJy4vd2F2ZXRhYmxlLmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgICBcbiAgICBTcXVhcmUoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBzcXIgICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSBcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7IGFudGlhbGlhczpmYWxzZSB9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgICBjb25zdCBvc2MgICA9IE9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBnLmluKCAnZnJlcXVlbmN5JyApLCBwcm9wcy5hbnRpYWxpYXMgKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLm11bCggb3NjLCBnLmluKCdnYWluJyApIClcblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHNxciwgZ3JhcGgsICdzcXInLCBwcm9wcyApXG5cbiAgICAgIHJldHVybiBzcXJcbiAgICB9LFxuXG4gICAgVHJpYW5nbGUoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCB0cmk9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSBcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7IGFudGlhbGlhczpmYWxzZSB9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgICBjb25zdCBvc2MgICA9IE9zY2lsbGF0b3JzLmZhY3RvcnkoICd0cmlhbmdsZScsIGcuaW4oICdmcmVxdWVuY3knICksIHByb3BzLmFudGlhbGlhcyApXG4gICAgICBjb25zdCBncmFwaCA9IGcubXVsKCBvc2MsIGcuaW4oJ2dhaW4nICkgKVxuXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggdHJpLCBncmFwaCwgJ3RyaScsIHByb3BzIClcblxuICAgICAgcmV0dXJuIHRyaVxuICAgIH0sXG5cbiAgICBQV00oIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBwd20gICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSBcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7IGFudGlhbGlhczpmYWxzZSwgcHVsc2V3aWR0aDouMjUgfSwgT3NjaWxsYXRvcnMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgICAgY29uc3Qgb3NjICAgPSBPc2NpbGxhdG9ycy5mYWN0b3J5KCAncHdtJywgZy5pbiggJ2ZyZXF1ZW5jeScgKSwgcHJvcHMuYW50aWFsaWFzIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIG9zYywgZy5pbignZ2FpbicgKSApXG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBwd20sIGdyYXBoLCAncHdtJywgcHJvcHMgKVxuXG4gICAgICByZXR1cm4gcHdtXG4gICAgfSxcblxuICAgIFNpbmUoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBzaW5lICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgICBjb25zdCBncmFwaCA9IGcubXVsKCBnLmN5Y2xlKCBnLmluKCdmcmVxdWVuY3knKSApLCBnLmluKCdnYWluJykgKVxuXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc2luZSwgZ3JhcGgsICdzaW5lJywgcHJvcHMgKVxuICAgICAgXG4gICAgICByZXR1cm4gc2luZVxuICAgIH0sXG5cbiAgICBOb2lzZSggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IG5vaXNlID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCB7IGdhaW46IDEsIGNvbG9yOid3aGl0ZScgfSwgaW5wdXRQcm9wcyApXG4gICAgICBsZXQgZ3JhcGggXG5cbiAgICAgIHN3aXRjaCggcHJvcHMuY29sb3IgKSB7XG4gICAgICAgIGNhc2UgJ2Jyb3duJzpcbiAgICAgICAgICBncmFwaCA9IGcubXVsKCBPc2NpbGxhdG9ycy5nZW5pc2guQnJvd24oKSwgZy5pbignZ2FpbicpIClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncGluayc6XG4gICAgICAgICAgZ3JhcGggPSBnLm11bCggT3NjaWxsYXRvcnMuZ2VuaXNoLlBpbmsoKSwgZy5pbignZ2FpbicpIClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBncmFwaCA9IGcubXVsKCBnLm5vaXNlKCksIGcuaW4oJ2dhaW4nKSApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBub2lzZSwgZ3JhcGgsICdub2lzZScsIHByb3BzIClcblxuICAgICAgcmV0dXJuIG5vaXNlXG4gICAgfSxcblxuICAgIFNhdyggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHNhdyAgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApIFxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHsgYW50aWFsaWFzOmZhbHNlIH0sIE9zY2lsbGF0b3JzLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICAgIGNvbnN0IG9zYyAgID0gT3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NhdycsIGcuaW4oICdmcmVxdWVuY3knICksIHByb3BzLmFudGlhbGlhcyApXG4gICAgICBjb25zdCBncmFwaCA9IGcubXVsKCBvc2MsIGcuaW4oJ2dhaW4nICkgKVxuXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc2F3LCBncmFwaCwgJ3NhdycsIHByb3BzIClcblxuICAgICAgcmV0dXJuIHNhd1xuICAgIH0sXG5cbiAgICBSZXZlcnNlU2F3KCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3Qgc2F3ICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICkgXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oeyBhbnRpYWxpYXM6ZmFsc2UgfSwgT3NjaWxsYXRvcnMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgICAgY29uc3Qgb3NjICAgPSBnLnN1YiggMSwgT3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NhdycsIGcuaW4oICdmcmVxdWVuY3knICksIHByb3BzLmFudGlhbGlhcyApIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIG9zYywgZy5pbiggJ2dhaW4nICkgKVxuXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc2F3LCBncmFwaCwgJ3JzYXcnLCBwcm9wcyApXG4gICAgICBcbiAgICAgIHJldHVybiBzYXdcbiAgICB9LFxuXG4gICAgZmFjdG9yeSggdHlwZSwgZnJlcXVlbmN5LCBhbnRpYWxpYXM9ZmFsc2UgKSB7XG4gICAgICBsZXQgb3NjXG5cbiAgICAgIHN3aXRjaCggdHlwZSApIHtcbiAgICAgICAgY2FzZSAncHdtJzpcbiAgICAgICAgICBsZXQgcHVsc2V3aWR0aCA9IGcuaW4oJ3B1bHNld2lkdGgnKVxuICAgICAgICAgIGlmKCBhbnRpYWxpYXMgPT09IHRydWUgKSB7XG4gICAgICAgICAgICBvc2MgPSBmZWVkYmFja09zYyggZnJlcXVlbmN5LCAxLCBwdWxzZXdpZHRoLCB7IHR5cGU6MSB9KVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgbGV0IHBoYXNlID0gZy5waGFzb3IoIGZyZXF1ZW5jeSwgMCwgeyBtaW46MCB9IClcbiAgICAgICAgICAgIG9zYyA9IGcubHQoIHBoYXNlLCBwdWxzZXdpZHRoIClcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3Nhdyc6XG4gICAgICAgICAgaWYoIGFudGlhbGlhcyA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICBvc2MgPSBnLnBoYXNvciggZnJlcXVlbmN5IClcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIG9zYyA9IGZlZWRiYWNrT3NjKCBmcmVxdWVuY3ksIDEgKVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2luZSc6XG4gICAgICAgICAgb3NjID0gZy5jeWNsZSggZnJlcXVlbmN5IClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgICBpZiggYW50aWFsaWFzID09PSB0cnVlICkge1xuICAgICAgICAgICAgb3NjID0gZmVlZGJhY2tPc2MoIGZyZXF1ZW5jeSwgMSwgLjUsIHsgdHlwZToxIH0pXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBvc2MgPSBnLndhdmV0YWJsZSggZnJlcXVlbmN5LCB7IGJ1ZmZlcjpPc2NpbGxhdG9ycy5TcXVhcmUuYnVmZmVyLCBuYW1lOidzcXVhcmUnIH0gKVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndHJpYW5nbGUnOlxuICAgICAgICAgIG9zYyA9IGcud2F2ZXRhYmxlKCBmcmVxdWVuY3ksIHsgYnVmZmVyOk9zY2lsbGF0b3JzLlRyaWFuZ2xlLmJ1ZmZlciwgbmFtZTondHJpYW5nbGUnIH0gKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3NjXG4gICAgfVxuICB9XG5cbiAgT3NjaWxsYXRvcnMuU3F1YXJlLmJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gIGZvciggbGV0IGkgPSAxMDIzOyBpID49IDA7IGktLSApIHsgXG4gICAgT3NjaWxsYXRvcnMuU3F1YXJlLmJ1ZmZlciBbIGkgXSA9IGkgLyAxMDI0ID4gLjUgPyAxIDogLTFcbiAgfVxuXG4gIE9zY2lsbGF0b3JzLlRyaWFuZ2xlLmJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gIFxuICBmb3IoIGxldCBpID0gMTAyNDsgaS0tOyBpID0gaSApIHsgT3NjaWxsYXRvcnMuVHJpYW5nbGUuYnVmZmVyW2ldID0gMSAtIDQgKiBNYXRoLmFicygoIChpIC8gMTAyNCkgKyAwLjI1KSAlIDEgLSAwLjUpOyB9XG5cbiAgT3NjaWxsYXRvcnMuZGVmYXVsdHMgPSB7XG4gICAgZnJlcXVlbmN5OiA0NDAsXG4gICAgZ2FpbjogMVxuICB9XG5cbiAgcmV0dXJuIE9zY2lsbGF0b3JzXG5cbn1cbiIsImNvbnN0IGdlbmlzaCA9IHJlcXVpcmUoJ2dlbmlzaC5qcycpLFxuICAgICAgc3NkID0gZ2VuaXNoLmhpc3RvcnksXG4gICAgICBkYXRhID0gZ2VuaXNoLmRhdGEsXG4gICAgICBub2lzZSA9IGdlbmlzaC5ub2lzZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIFwidXNlIGpzZHNwXCI7XG5cbiAgY29uc3QgYiA9IGRhdGEoOCwgMSwgeyBtZXRhOiB0cnVlIH0pO1xuICBjb25zdCB3aGl0ZSA9IGdlbmlzaC5zdWIoZ2VuaXNoLm11bChub2lzZSgpLCAyKSwgMSk7XG5cbiAgYlswXSA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bCguOTk4ODYsIGJbMF0pLCBnZW5pc2gubXVsKHdoaXRlLCAuMDU1NTE3OSkpO1xuICBiWzFdID0gZ2VuaXNoLmFkZChnZW5pc2gubXVsKC45OTMzMiwgYlsxXSksIGdlbmlzaC5tdWwod2hpdGUsIC4wNzUwNTc5KSk7XG4gIGJbMl0gPSBnZW5pc2guYWRkKGdlbmlzaC5tdWwoLjk2OTAwLCBiWzJdKSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjE1Mzg1MjApKTtcbiAgYlszXSA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bCguODg2NTAsIGJbM10pLCBnZW5pc2gubXVsKHdoaXRlLCAuMzEwNDg1NikpO1xuICBiWzRdID0gZ2VuaXNoLmFkZChnZW5pc2gubXVsKC41NTAwMCwgYls0XSksIGdlbmlzaC5tdWwod2hpdGUsIC41MzI5NTIyKSk7XG4gIGJbNV0gPSBnZW5pc2guc3ViKGdlbmlzaC5tdWwoLS43NjE2LCBiWzVdKSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjAxNjg5ODApKTtcblxuICBjb25zdCBvdXQgPSBnZW5pc2gubXVsKGdlbmlzaC5hZGQoZ2VuaXNoLmFkZChnZW5pc2guYWRkKGdlbmlzaC5hZGQoZ2VuaXNoLmFkZChnZW5pc2guYWRkKGdlbmlzaC5hZGQoYlswXSwgYlsxXSksIGJbMl0pLCBiWzNdKSwgYls0XSksIGJbNV0pLCBiWzZdKSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjUzNjIpKSwgLjExKTtcblxuICBiWzZdID0gZ2VuaXNoLm11bCh3aGl0ZSwgLjExNTkyNik7XG5cbiAgcmV0dXJuIG91dDtcbn07IiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgV2F2ZXRhYmxlID0gZnVuY3Rpb24oIGlucHV0UHJvcHMgKSB7XG4gICAgY29uc3Qgd2F2ZXRhYmxlID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgY29uc3QgcHJvcHMgID0gT2JqZWN0LmFzc2lnbih7fSwgR2liYmVyaXNoLm9zY2lsbGF0b3JzLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBjb25zdCBvc2MgPSBnLndhdmV0YWJsZSggZy5pbignZnJlcXVlbmN5JyksIHByb3BzIClcbiAgICBjb25zdCBncmFwaCA9IGcubXVsKCBcbiAgICAgIG9zYywgXG4gICAgICBnLmluKCAnZ2FpbicgKVxuICAgIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCB3YXZldGFibGUsIGdyYXBoLCAnd2F2ZXRhYmxlJywgcHJvcHMgKVxuXG4gICAgcmV0dXJuIHdhdmV0YWJsZVxuICB9XG5cbiAgZy53YXZldGFibGUgPSBmdW5jdGlvbiggZnJlcXVlbmN5LCBwcm9wcyApIHtcbiAgICBsZXQgZGF0YVByb3BzID0geyBpbW11dGFibGU6dHJ1ZSB9XG5cbiAgICAvLyB1c2UgZ2xvYmFsIHJlZmVyZW5jZXMgaWYgYXBwbGljYWJsZVxuICAgIGlmKCBwcm9wcy5uYW1lICE9PSB1bmRlZmluZWQgKSBkYXRhUHJvcHMuZ2xvYmFsID0gcHJvcHMubmFtZVxuXG4gICAgY29uc3QgYnVmZmVyID0gZy5kYXRhKCBwcm9wcy5idWZmZXIsIDEsIGRhdGFQcm9wcyApXG5cbiAgICByZXR1cm4gZy5wZWVrKCBidWZmZXIsIGcucGhhc29yKCBmcmVxdWVuY3ksIDAsIHsgbWluOjAgfSApIClcbiAgfVxuXG4gIHJldHVybiBXYXZldGFibGVcbn1cbiIsImNvbnN0IFF1ZXVlID0gcmVxdWlyZSggJy4uL2V4dGVybmFsL3ByaW9yaXR5cXVldWUuanMnIClcbmNvbnN0IEJpZyAgID0gcmVxdWlyZSggJ2JpZy5qcycgKVxuXG5sZXQgU2NoZWR1bGVyID0ge1xuICBwaGFzZTogMCxcblxuICBxdWV1ZTogbmV3IFF1ZXVlKCAoIGEsIGIgKSA9PiB7XG4gICAgaWYoIGEudGltZSA9PT0gYi50aW1lICkgeyAvL2EudGltZS5lcSggYi50aW1lICkgKSB7XG4gICAgICByZXR1cm4gYi5wcmlvcml0eSAtIGEucHJpb3JpdHlcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBhLnRpbWUgLSBiLnRpbWUgLy9hLnRpbWUubWludXMoIGIudGltZSApXG4gICAgfVxuICB9KSxcblxuICBjbGVhcigpIHtcbiAgICB0aGlzLnF1ZXVlLmRhdGEubGVuZ3RoID0gMFxuICAgIHRoaXMucXVldWUubGVuZ3RoID0gMFxuICB9LFxuXG4gIGFkZCggdGltZSwgZnVuYywgcHJpb3JpdHkgPSAwICkge1xuICAgIHRpbWUgKz0gdGhpcy5waGFzZVxuXG4gICAgdGhpcy5xdWV1ZS5wdXNoKHsgdGltZSwgZnVuYywgcHJpb3JpdHkgfSlcbiAgfSxcblxuICB0aWNrKCkge1xuICAgIGlmKCB0aGlzLnF1ZXVlLmxlbmd0aCApIHtcbiAgICAgIGxldCBuZXh0ID0gdGhpcy5xdWV1ZS5wZWVrKClcblxuICAgICAgd2hpbGUoIHRoaXMucGhhc2UgPj0gbmV4dC50aW1lICkge1xuICAgICAgICBuZXh0LmZ1bmMoKVxuICAgICAgICB0aGlzLnF1ZXVlLnBvcCgpXG4gICAgICAgIG5leHQgPSB0aGlzLnF1ZXVlLnBlZWsoKVxuICAgICAgfVxuXG4gICAgfVxuXG4gICAgdGhpcy5waGFzZSsrXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2NoZWR1bGVyXG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIGNvbnN0IF9fcHJvdG9fXyA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG4gIE9iamVjdC5hc3NpZ24oIF9fcHJvdG9fXywge1xuICAgIHN0YXJ0KCkge1xuICAgICAgdGhpcy5jb25uZWN0KClcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfSxcbiAgICBzdG9wKCkge1xuICAgICAgdGhpcy5kaXNjb25uZWN0KClcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICB9KVxuXG4gIGNvbnN0IFNlcTIgPSB7IFxuICAgIGNyZWF0ZSggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHNlcSA9IE9iamVjdC5jcmVhdGUoIF9fcHJvdG9fXyApLFxuICAgICAgICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBTZXEyLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgICAgc2VxLnBoYXNlID0gMFxuICAgICAgc2VxLmlucHV0TmFtZXMgPSBbICdyYXRlJyBdXG4gICAgICBzZXEuaW5wdXRzID0gWyAxIF1cbiAgICAgIHNlcS5uZXh0VGltZSA9IDBcbiAgICAgIHNlcS52YWx1ZXNQaGFzZSA9IDBcbiAgICAgIHNlcS50aW1pbmdzUGhhc2UgPSAwXG4gICAgICBzZXEuaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgc2VxLmRpcnR5ID0gdHJ1ZVxuICAgICAgc2VxLnR5cGUgPSAnc2VxJ1xuICAgICAgc2VxLl9fcHJvcGVydGllc19fID0gcHJvcHNcblxuICAgICAgaWYoIHByb3BzLnRhcmdldCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICBzZXEuYW5vbkZ1bmN0aW9uID0gdHJ1ZVxuICAgICAgfWVsc2V7IFxuICAgICAgICBzZXEuYW5vbkZ1bmN0aW9uID0gZmFsc2VcbiAgICAgICAgc2VxLmNhbGxGdW5jdGlvbiA9IHR5cGVvZiBwcm9wcy50YXJnZXRbIHByb3BzLmtleSBdID09PSAnZnVuY3Rpb24nXG4gICAgICB9XG5cbiAgICAgIHByb3BzLmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcblxuICAgICAgLy8gbmVlZCBhIHNlcGFyYXRlIHJlZmVyZW5jZSB0byB0aGUgcHJvcGVydGllcyBmb3Igd29ya2xldCBtZXRhLXByb2dyYW1taW5nXG4gICAgICBjb25zdCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbigge30sIFNlcTIuZGVmYXVsdHMsIHByb3BzIClcbiAgICAgIE9iamVjdC5hc3NpZ24oIHNlcSwgcHJvcGVydGllcyApIFxuICAgICAgc2VxLl9fcHJvcGVydGllc19fID0gcHJvcGVydGllc1xuXG4gICAgICBzZXEuY2FsbGJhY2sgPSBmdW5jdGlvbiggcmF0ZSApIHtcbiAgICAgICAgaWYoIHNlcS5waGFzZSA+PSBzZXEubmV4dFRpbWUgKSB7XG4gICAgICAgICAgbGV0IHZhbHVlID0gc2VxLnZhbHVlc1sgc2VxLnZhbHVlc1BoYXNlKysgJSBzZXEudmFsdWVzLmxlbmd0aCBdXG5cbiAgICAgICAgICBpZiggc2VxLmFub25GdW5jdGlvbiB8fCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgKSB2YWx1ZSA9IHZhbHVlKClcbiAgICAgICAgICBcbiAgICAgICAgICBpZiggc2VxLmFub25GdW5jdGlvbiA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICBpZiggc2VxLmNhbGxGdW5jdGlvbiA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICAgIHNlcS50YXJnZXRbIHNlcS5rZXkgXSA9IHZhbHVlXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgc2VxLnRhcmdldFsgc2VxLmtleSBdKCB2YWx1ZSApIFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlcS5waGFzZSAtPSBzZXEubmV4dFRpbWVcblxuICAgICAgICAgIGxldCB0aW1pbmcgPSBzZXEudGltaW5nc1sgc2VxLnRpbWluZ3NQaGFzZSsrICUgc2VxLnRpbWluZ3MubGVuZ3RoIF1cbiAgICAgICAgICBpZiggdHlwZW9mIHRpbWluZyA9PT0gJ2Z1bmN0aW9uJyApIHRpbWluZyA9IHRpbWluZygpXG5cbiAgICAgICAgICBzZXEubmV4dFRpbWUgPSB0aW1pbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHNlcS5waGFzZSArPSByYXRlXG5cbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cblxuICAgICAgc2VxLnVnZW5OYW1lID0gc2VxLmNhbGxiYWNrLnVnZW5OYW1lID0gJ3NlcV8nICsgc2VxLmlkXG4gICAgICBcbiAgICAgIGxldCB2YWx1ZSA9IHNlcS5yYXRlXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHNlcSwgJ3JhdGUnLCB7XG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHZhbHVlIH0sXG4gICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICBpZiggdmFsdWUgIT09IHYgKSB7XG4gICAgICAgICAgICBHaWJiZXJpc2guZGlydHkoIHNlcSApXG4gICAgICAgICAgICB2YWx1ZSA9IHZcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBzZXFcbiAgICB9XG4gIH1cblxuICBTZXEyLmRlZmF1bHRzID0geyByYXRlOiAxIH1cblxuICByZXR1cm4gU2VxMi5jcmVhdGVcblxufVxuXG4iLCJjb25zdCBRdWV1ZSA9IHJlcXVpcmUoICcuLi9leHRlcm5hbC9wcmlvcml0eXF1ZXVlLmpzJyApXG5jb25zdCBCaWcgICA9IHJlcXVpcmUoICdiaWcuanMnIClcbmNvbnN0IHByb3h5ID0gcmVxdWlyZSggJy4uL3dvcmtsZXRQcm94eS5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbmxldCBTZXF1ZW5jZXIgPSBwcm9wcyA9PiB7XG4gIGxldCBzZXEgPSB7XG4gICAgX19pc1J1bm5pbmc6ZmFsc2UsXG5cbiAgICBfX3ZhbHVlc1BoYXNlOiAgMCxcbiAgICBfX3RpbWluZ3NQaGFzZTogMCxcblxuICAgIHRpY2soKSB7XG4gICAgICBsZXQgdmFsdWUgID0gc2VxLnZhbHVlc1sgIHNlcS5fX3ZhbHVlc1BoYXNlKysgICUgc2VxLnZhbHVlcy5sZW5ndGggIF0sXG4gICAgICAgICAgdGltaW5nID0gc2VxLnRpbWluZ3NbIHNlcS5fX3RpbWluZ3NQaGFzZSsrICUgc2VxLnRpbWluZ3MubGVuZ3RoIF1cblxuICAgICAgaWYoIHR5cGVvZiB0aW1pbmcgPT09ICdmdW5jdGlvbicgKSB0aW1pbmcgPSB0aW1pbmcoKVxuXG4gICAgICBpZiggdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICYmIHNlcS50YXJnZXQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgdmFsdWUoKVxuICAgICAgfWVsc2UgaWYoIHR5cGVvZiBzZXEudGFyZ2V0WyBzZXEua2V5IF0gPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgIGlmKCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgKSB2YWx1ZSA9IHZhbHVlKClcbiAgICAgICAgc2VxLnRhcmdldFsgc2VxLmtleSBdKCB2YWx1ZSApXG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYoIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyApIHZhbHVlID0gdmFsdWUoKVxuICAgICAgICBzZXEudGFyZ2V0WyBzZXEua2V5IF0gPSB2YWx1ZVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiggc2VxLl9faXNSdW5uaW5nID09PSB0cnVlICkge1xuICAgICAgICBHaWJiZXJpc2guc2NoZWR1bGVyLmFkZCggdGltaW5nLCBzZXEudGljaywgc2VxLnByaW9yaXR5IClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RhcnQoIGRlbGF5ID0gMCApIHtcbiAgICAgIHNlcS5fX2lzUnVubmluZyA9IHRydWVcbiAgICAgIEdpYmJlcmlzaC5zY2hlZHVsZXIuYWRkKCBkZWxheSwgc2VxLnRpY2ssIHNlcS5wcmlvcml0eSApXG4gICAgICByZXR1cm4gc2VxXG4gICAgfSxcblxuICAgIHN0b3AoKSB7XG4gICAgICBzZXEuX19pc1J1bm5pbmcgPSBmYWxzZVxuICAgICAgcmV0dXJuIHNlcVxuICAgIH1cbiAgfVxuXG4gIHByb3BzLmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcblxuICAvLyBuZWVkIGEgc2VwYXJhdGUgcmVmZXJlbmNlIHRvIHRoZSBwcm9wZXJ0aWVzIGZvciB3b3JrbGV0IG1ldGEtcHJvZ3JhbW1pbmdcbiAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBTZXF1ZW5jZXIuZGVmYXVsdHMsIHByb3BzIClcbiAgT2JqZWN0LmFzc2lnbiggc2VxLCBwcm9wZXJ0aWVzICkgXG4gIHNlcS5fX3Byb3BlcnRpZXNfXyA9IHByb3BlcnRpZXNcblxuICByZXR1cm4gcHJveHkoIFsnU2VxdWVuY2VyJ10sIHByb3BlcnRpZXMsIHNlcSApXG59XG5cblNlcXVlbmNlci5kZWZhdWx0cyA9IHsgcHJpb3JpdHk6MCB9XG5cblNlcXVlbmNlci5tYWtlID0gZnVuY3Rpb24oIHZhbHVlcywgdGltaW5ncywgdGFyZ2V0LCBrZXkgKSB7XG4gIHJldHVybiBTZXF1ZW5jZXIoeyB2YWx1ZXMsIHRpbWluZ3MsIHRhcmdldCwga2V5IH0pXG59XG5cbnJldHVybiBTZXF1ZW5jZXJcblxufVxuIiwibGV0IHVnZW4gPSB7XG4gIGZyZWUoKSB7XG4gICAgR2liYmVyaXNoLmdlbmlzaC5nZW4uZnJlZSggdGhpcy5ncmFwaCApXG4gIH0sXG5cbiAgcHJpbnQoKSB7XG4gICAgY29uc29sZS5sb2coIHRoaXMuY2FsbGJhY2sudG9TdHJpbmcoKSApXG4gIH0sXG5cbiAgY29ubmVjdCggdGFyZ2V0LCBsZXZlbD0xICkge1xuICAgIGlmKCB0aGlzLmNvbm5lY3RlZCA9PT0gdW5kZWZpbmVkICkgdGhpcy5jb25uZWN0ZWQgPSBbXVxuXG4gICAgbGV0IGlucHV0ID0gbGV2ZWwgPT09IDEgPyB0aGlzIDogR2liYmVyaXNoLmJpbm9wcy5NdWwoIHRoaXMsIGxldmVsIClcblxuICAgIGlmKCB0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwgKSB0YXJnZXQgPSBHaWJiZXJpc2gub3V0cHV0IFxuXG5cbiAgICBpZiggdHlwZW9mIHRhcmdldC5fX2FkZElucHV0ID09ICdmdW5jdGlvbicgKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKCAnX19hZGRJbnB1dCcsIGlucHV0LmlzU3RlcmVvIClcbiAgICAgIC8vdGFyZ2V0Ll9fYWRkSW5wdXQoIGlucHV0IClcbiAgICB9IGVsc2UgaWYoIHRhcmdldC5zdW0gJiYgdGFyZ2V0LnN1bS5pbnB1dHMgKSB7XG4gICAgICB0YXJnZXQuc3VtLmlucHV0cy5wdXNoKCBpbnB1dCApXG4gICAgfSBlbHNlIGlmKCB0YXJnZXQuaW5wdXRzICkge1xuICAgICAgdGFyZ2V0LmlucHV0cy5wdXNoKCBpbnB1dCApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldC5pbnB1dCA9IGlucHV0XG4gICAgfVxuXG4gICAgR2liYmVyaXNoLmRpcnR5KCB0YXJnZXQgKVxuXG4gICAgdGhpcy5jb25uZWN0ZWQucHVzaChbIHRhcmdldCwgaW5wdXQgXSlcbiAgICBcbiAgICByZXR1cm4gdGhpc1xuICB9LFxuXG4gIGRpc2Nvbm5lY3QoIHRhcmdldCApIHtcbiAgICBpZiggdGFyZ2V0ID09PSB1bmRlZmluZWQgKXtcbiAgICAgIGZvciggbGV0IGNvbm5lY3Rpb24gb2YgdGhpcy5jb25uZWN0ZWQgKSB7XG4gICAgICAgIGNvbm5lY3Rpb25bMF0uZGlzY29ubmVjdFVnZW4oIGNvbm5lY3Rpb25bMV0gKVxuICAgICAgfVxuICAgICAgdGhpcy5jb25uZWN0ZWQubGVuZ3RoID0gMFxuICAgIH1lbHNle1xuICAgICAgY29uc3QgY29ubmVjdGlvbiA9IHRoaXMuY29ubmVjdGVkLmZpbmQoIHYgPT4gdlswXSA9PT0gdGFyZ2V0IClcbiAgICAgIHRhcmdldC5kaXNjb25uZWN0VWdlbiggY29ubmVjdGlvblsxXSApXG4gICAgICBjb25zdCB0YXJnZXRJZHggPSB0aGlzLmNvbm5lY3RlZC5pbmRleE9mKCBjb25uZWN0aW9uIClcbiAgICAgIHRoaXMuY29ubmVjdGVkLnNwbGljZSggdGFyZ2V0SWR4LCAxIClcbiAgICB9XG4gIH0sXG5cbiAgY2hhaW4oIHRhcmdldCwgbGV2ZWw9MSApIHtcbiAgICB0aGlzLmNvbm5lY3QoIHRhcmdldCxsZXZlbCApXG5cbiAgICByZXR1cm4gdGFyZ2V0XG4gIH0sXG5cbiAgX19yZWRvR3JhcGgoKSB7XG4gICAgdGhpcy5fX2NyZWF0ZUdyYXBoKClcbiAgICB0aGlzLmNhbGxiYWNrID0gR2liYmVyaXNoLmdlbmlzaC5nZW4uY3JlYXRlQ2FsbGJhY2soIHRoaXMuZ3JhcGgsIEdpYmJlcmlzaC5tZW1vcnksIGZhbHNlLCB0cnVlIClcbiAgICB0aGlzLmlucHV0TmFtZXMgPSBHaWJiZXJpc2guZ2VuaXNoLmdlbi5wYXJhbWV0ZXJzLnNsaWNlKDApXG4gICAgdGhpcy5jYWxsYmFjay51Z2VuTmFtZSA9IHRoaXMudWdlbk5hbWVcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB1Z2VuXG4iLCJjb25zdCBwcm94eSA9IHJlcXVpcmUoICcuL3dvcmtsZXRQcm94eS5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIGxldCB1aWQgPSAwXG5cbiAgbGV0IGZhY3RvcnkgPSBmdW5jdGlvbiggdWdlbiwgZ3JhcGgsIF9fbmFtZSwgdmFsdWVzLCBjYiApIHtcbiAgICB1Z2VuLmNhbGxiYWNrID0gY2IgPT09IHVuZGVmaW5lZCA/IEdpYmJlcmlzaC5nZW5pc2guZ2VuLmNyZWF0ZUNhbGxiYWNrKCBncmFwaCwgR2liYmVyaXNoLm1lbW9yeSwgZmFsc2UsIHRydWUgKSA6IGNiXG5cbiAgICBsZXQgbmFtZSA9IEFycmF5LmlzQXJyYXkoIF9fbmFtZSApID8gX19uYW1lWyBfX25hbWUubGVuZ3RoIC0gMSBdIDogX19uYW1lXG5cbiAgICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgICB0eXBlOiAndWdlbicsXG4gICAgICBpZDogZmFjdG9yeS5nZXRVSUQoKSwgXG4gICAgICB1Z2VuTmFtZTogbmFtZSArICdfJyxcbiAgICAgIGdyYXBoOiBncmFwaCxcbiAgICAgIGlucHV0TmFtZXM6IG5ldyBTZXQoIEdpYmJlcmlzaC5nZW5pc2guZ2VuLnBhcmFtZXRlcnMgKSxcbiAgICAgIGlzU3RlcmVvOiBBcnJheS5pc0FycmF5KCBncmFwaCApLFxuICAgICAgZGlydHk6IHRydWUsXG4gICAgICBfX3Byb3BlcnRpZXNfXzp2YWx1ZXNcbiAgICB9KVxuICAgIFxuICAgIHVnZW4udWdlbk5hbWUgKz0gdWdlbi5pZFxuICAgIHVnZW4uY2FsbGJhY2sudWdlbk5hbWUgPSB1Z2VuLnVnZW5OYW1lIC8vIFhYWCBoYWNreVxuXG4gICAgZm9yKCBsZXQgcGFyYW0gb2YgdWdlbi5pbnB1dE5hbWVzICkge1xuICAgICAgaWYoIHBhcmFtID09PSAnbWVtb3J5JyApIGNvbnRpbnVlXG5cbiAgICAgIGxldCB2YWx1ZSA9IHZhbHVlc1sgcGFyYW0gXVxuXG4gICAgICAvLyBUT0RPOiBkbyB3ZSBuZWVkIHRvIGNoZWNrIGZvciBhIHNldHRlcj9cbiAgICAgIGxldCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciggdWdlbiwgcGFyYW0gKSxcbiAgICAgICAgICBzZXR0ZXJcblxuICAgICAgaWYoIGRlc2MgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc2V0dGVyID0gZGVzYy5zZXRcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCBwYXJhbSwge1xuICAgICAgICBnZXQoKSB7IHJldHVybiB2YWx1ZSB9LFxuICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgaWYoIHZhbHVlICE9PSB2ICkge1xuICAgICAgICAgICAgR2liYmVyaXNoLmRpcnR5KCB1Z2VuIClcbiAgICAgICAgICAgIGlmKCBzZXR0ZXIgIT09IHVuZGVmaW5lZCApIHNldHRlciggdiApXG4gICAgICAgICAgICB2YWx1ZSA9IHZcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYoIHVnZW4uX19yZXF1aXJlc1JlY29tcGlsYXRpb24gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHVnZW4uX19yZXF1aXJlc1JlY29tcGlsYXRpb24uZm9yRWFjaCggcHJvcCA9PiB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHVnZW5bIHByb3AgXVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sIHByb3AsIHtcbiAgICAgICAgICBnZXQoKSB7IHJldHVybiB2YWx1ZSB9LFxuICAgICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICAgIGlmKCB2YWx1ZSAhPT0gdiApIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSB2XG4gICAgICAgICAgICAgIHRoaXMuX19yZWRvR3JhcGgoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0pICAgICAgXG4gICAgfVxuXG4gICAgLy8gd2lsbCBvbmx5IGNyZWF0ZSBwcm94eSBpZiB3b3JrbGV0cyBhcmUgYmVpbmcgdXNlZFxuICAgIC8vIG90aGVyd2lzZSB3aWxsIHJldHVybiB1bmFsdGVyZWQgdWdlblxuICAgIHJldHVybiBwcm94eSggX19uYW1lLCB2YWx1ZXMsIHVnZW4gKSBcbiAgfVxuXG4gIGZhY3RvcnkuZ2V0VUlEID0gKCkgPT4gdWlkKytcblxuICBcblxuICByZXR1cm4gZmFjdG9yeVxufVxuIiwibGV0IGdlbmlzaCA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG5sZXQgdXRpbGl0aWVzID0ge1xuICBjcmVhdGVDb250ZXh0KCBjdHgsIGNiLCByZXNvbHZlICkge1xuICAgIGxldCBBQyA9IHR5cGVvZiBBdWRpb0NvbnRleHQgPT09ICd1bmRlZmluZWQnID8gd2Via2l0QXVkaW9Db250ZXh0IDogQXVkaW9Db250ZXh0XG5cbiAgICBsZXQgc3RhcnQgPSAoKSA9PiB7XG4gICAgICBpZiggdHlwZW9mIEFDICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgR2liYmVyaXNoLmN0eCA9IGN0eCA9PT0gdW5kZWZpbmVkID8gbmV3IEFDKCkgOiBjdHhcbiAgICAgICAgZ2VuaXNoLmdlbi5zYW1wbGVyYXRlID0gR2liYmVyaXNoLmN0eC5zYW1wbGVSYXRlXG4gICAgICAgIGdlbmlzaC51dGlsaXRpZXMuY3R4ID0gR2liYmVyaXNoLmN0eFxuXG4gICAgICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHN0YXJ0IClcblxuICAgICAgICAgIGlmKCAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKXsgLy8gcmVxdWlyZWQgdG8gc3RhcnQgYXVkaW8gdW5kZXIgaU9TIDZcbiAgICAgICAgICAgIGxldCBteVNvdXJjZSA9IHV0aWxpdGllcy5jdHguY3JlYXRlQnVmZmVyU291cmNlKClcbiAgICAgICAgICAgIG15U291cmNlLmNvbm5lY3QoIHV0aWxpdGllcy5jdHguZGVzdGluYXRpb24gKVxuICAgICAgICAgICAgbXlTb3VyY2Uubm90ZU9uKCAwIClcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgc3RhcnQgKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKCB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicgKSBjYiggcmVzb2x2ZSApXG4gICAgfVxuXG4gICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG4gICAgfWVsc2V7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIHN0YXJ0IClcbiAgICB9XG5cbiAgICByZXR1cm4gR2liYmVyaXNoLmN0eFxuICB9LFxuXG4gIGNyZWF0ZVNjcmlwdFByb2Nlc3NvciggcmVzb2x2ZSApIHtcbiAgICBHaWJiZXJpc2gubm9kZSA9IEdpYmJlcmlzaC5jdHguY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCAxMDI0LCAwLCAyICksXG4gICAgR2liYmVyaXNoLmNsZWFyRnVuY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIDAgfSxcbiAgICBHaWJiZXJpc2guY2FsbGJhY2sgPSBHaWJiZXJpc2guY2xlYXJGdW5jdGlvblxuXG4gICAgR2liYmVyaXNoLm5vZGUub25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbiggYXVkaW9Qcm9jZXNzaW5nRXZlbnQgKSB7XG4gICAgICBsZXQgZ2liYmVyaXNoID0gR2liYmVyaXNoLFxuICAgICAgICAgIGNhbGxiYWNrICA9IGdpYmJlcmlzaC5jYWxsYmFjayxcbiAgICAgICAgICBvdXRwdXRCdWZmZXIgPSBhdWRpb1Byb2Nlc3NpbmdFdmVudC5vdXRwdXRCdWZmZXIsXG4gICAgICAgICAgc2NoZWR1bGVyID0gR2liYmVyaXNoLnNjaGVkdWxlcixcbiAgICAgICAgICAvL29ianMgPSBnaWJiZXJpc2guY2FsbGJhY2tVZ2Vucy5zbGljZSggMCApLFxuICAgICAgICAgIGxlbmd0aFxuXG4gICAgICBsZXQgbGVmdCA9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMCApLFxuICAgICAgICAgIHJpZ2h0PSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDEgKVxuXG4gICAgICBsZXQgY2FsbGJhY2tsZW5ndGggPSBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3MubGVuZ3RoXG4gICAgICBcbiAgICAgIGlmKCBjYWxsYmFja2xlbmd0aCAhPT0gMCApIHtcbiAgICAgICAgZm9yKCBsZXQgaT0wOyBpPCBjYWxsYmFja2xlbmd0aDsgaSsrICkge1xuICAgICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrc1sgaSBdKClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhbid0IGp1c3Qgc2V0IGxlbmd0aCB0byAwIGFzIGNhbGxiYWNrcyBtaWdodCBiZSBhZGRlZCBkdXJpbmcgZm9yIGxvb3AsIHNvIHNwbGljZSBwcmUtZXhpc3RpbmcgZnVuY3Rpb25zXG4gICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5zcGxpY2UoIDAsIGNhbGxiYWNrbGVuZ3RoIClcbiAgICAgIH1cblxuICAgICAgZm9yIChsZXQgc2FtcGxlID0gMCwgbGVuZ3RoID0gbGVmdC5sZW5ndGg7IHNhbXBsZSA8IGxlbmd0aDsgc2FtcGxlKyspIHtcbiAgICAgICAgc2NoZWR1bGVyLnRpY2soKVxuXG4gICAgICAgIGlmKCBnaWJiZXJpc2guZ3JhcGhJc0RpcnR5ICkgeyBcbiAgICAgICAgICBjYWxsYmFjayA9IGdpYmJlcmlzaC5nZW5lcmF0ZUNhbGxiYWNrKClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gWFhYIGNhbnQgdXNlIGRlc3RydWN0dXJpbmcsIGJhYmVsIG1ha2VzIGl0IHNvbWV0aGluZyBpbmVmZmljaWVudC4uLlxuICAgICAgICBsZXQgb3V0ID0gY2FsbGJhY2suYXBwbHkoIG51bGwsIGdpYmJlcmlzaC5jYWxsYmFja1VnZW5zIClcblxuICAgICAgICBsZWZ0WyBzYW1wbGUgIF0gPSBvdXRbMF1cbiAgICAgICAgcmlnaHRbIHNhbXBsZSBdID0gb3V0WzFdXG4gICAgICB9XG4gICAgfVxuXG4gICAgR2liYmVyaXNoLm5vZGUuY29ubmVjdCggR2liYmVyaXNoLmN0eC5kZXN0aW5hdGlvbiApXG5cbiAgICByZXNvbHZlKClcblxuICAgIHJldHVybiBHaWJiZXJpc2gubm9kZVxuICB9LCBcblxuICBjcmVhdGVXb3JrbGV0KCByZXNvbHZlICkge1xuICAgIEdpYmJlcmlzaC5jdHguYXVkaW9Xb3JrbGV0LmFkZE1vZHVsZSggR2liYmVyaXNoLndvcmtsZXRQYXRoICkudGhlbiggKCkgPT4ge1xuICAgICAgR2liYmVyaXNoLndvcmtsZXQgPSBuZXcgQXVkaW9Xb3JrbGV0Tm9kZSggR2liYmVyaXNoLmN0eCwgJ2dpYmJlcmlzaCcgKVxuICAgICAgR2liYmVyaXNoLndvcmtsZXQuY29ubmVjdCggR2liYmVyaXNoLmN0eC5kZXN0aW5hdGlvbiApXG4gICAgICByZXNvbHZlKClcbiAgICB9KVxuICB9XG5cbn1cblxucmV0dXJuIHV0aWxpdGllc1xuXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBfX25hbWUsIHZhbHVlcywgb2JqICkge1xuICBcbiAgaWYoIEdpYmJlcmlzaC5tb2RlID09PSAnd29ya2xldCcgKSB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IHt9XG4gICAgZm9yKCBsZXQga2V5IGluIHZhbHVlcyApIHtcbiAgICAgIGlmKCB0eXBlb2YgdmFsdWVzWyBrZXkgXSA9PT0gJ29iamVjdCcgJiYgdmFsdWVzWyBrZXkgXS5fX21ldGFfXyAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICBwcm9wZXJ0aWVzWyBrZXkgXSA9IHZhbHVlc1sga2V5IF0uX19tZXRhX19cbiAgICAgIH1lbHNle1xuICAgICAgICBwcm9wZXJ0aWVzWyBrZXkgXSA9IHZhbHVlc1sga2V5IF1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiggQXJyYXkuaXNBcnJheSggX19uYW1lICkgKSB7XG4gICAgICBjb25zdCBvbGROYW1lID0gX19uYW1lWyBfX25hbWUubGVuZ3RoIC0gMSBdXG4gICAgICBfX25hbWVbIF9fbmFtZS5sZW5ndGggLSAxIF0gPSBvbGROYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyBvbGROYW1lLnN1YnN0cmluZygxKVxuICAgIH1lbHNle1xuICAgICAgX19uYW1lID0gWyBfX25hbWVbMF0udG9VcHBlckNhc2UoKSArIF9fbmFtZS5zdWJzdHJpbmcoMSkgXVxuICAgIH1cblxuICAgIG9iai5fX21ldGFfXyA9IHtcbiAgICAgIGFkZHJlc3M6J2FkZCcsXG4gICAgICBuYW1lOl9fbmFtZSxcbiAgICAgIHByb3BlcnRpZXMsIFxuICAgICAgaWQ6b2JqLmlkXG4gICAgfVxuXG4gICAgR2liYmVyaXNoLndvcmtsZXQucG9ydC5wb3N0TWVzc2FnZSggb2JqLl9fbWV0YV9fIClcblxuICAgIC8vIHByb3h5IGZvciBhbGwgbWV0aG9kIGNhbGxzIHRvIHNlbmQgdG8gd29ya2xldFxuICAgIGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KCBvYmosIHtcbiAgICAgIGdldCggdGFyZ2V0LCBwcm9wLCByZWNlaXZlciApIHtcbiAgICAgICAgaWYoIHR5cGVvZiB0YXJnZXRbIHByb3AgXSA9PT0gJ2Z1bmN0aW9uJyApIHtcbiAgICAgICAgICBjb25zdCBwcm94eSA9IG5ldyBQcm94eSggdGFyZ2V0WyBwcm9wIF0sIHtcbiAgICAgICAgICAgIGFwcGx5KCBfX3RhcmdldCwgdGhpc0FyZywgYXJncyApIHtcbiAgICAgICAgICAgICAgR2liYmVyaXNoLndvcmtsZXQucG9ydC5wb3N0TWVzc2FnZSh7IFxuICAgICAgICAgICAgICAgIGFkZHJlc3M6J21ldGhvZCcsIFxuICAgICAgICAgICAgICAgIG9iamVjdDpvYmouaWQsXG4gICAgICAgICAgICAgICAgbmFtZTpwcm9wLFxuICAgICAgICAgICAgICAgIGFyZ3NcbiAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0WyBwcm9wIF0uYXBwbHkoIHRoaXNBcmcsIGFyZ3MgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgXG4gICAgICAgICAgcmV0dXJuIHByb3h5XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0WyBwcm9wIF1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHByb3h5XG4gIH1cblxuICByZXR1cm4gb2JqXG59XG4iLCIvKiBiaWcuanMgdjMuMS4zIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZy5qcy9MSUNFTkNFICovXHJcbjsoZnVuY3Rpb24gKGdsb2JhbCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuLypcclxuICBiaWcuanMgdjMuMS4zXHJcbiAgQSBzbWFsbCwgZmFzdCwgZWFzeS10by11c2UgbGlicmFyeSBmb3IgYXJiaXRyYXJ5LXByZWNpc2lvbiBkZWNpbWFsIGFyaXRobWV0aWMuXHJcbiAgaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnLmpzL1xyXG4gIENvcHlyaWdodCAoYykgMjAxNCBNaWNoYWVsIE1jbGF1Z2hsaW4gPE04Y2g4OGxAZ21haWwuY29tPlxyXG4gIE1JVCBFeHBhdCBMaWNlbmNlXHJcbiovXHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogRURJVEFCTEUgREVGQVVMVFMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlcyBiZWxvdyBtdXN0IGJlIGludGVnZXJzIHdpdGhpbiB0aGUgc3RhdGVkIHJhbmdlcy5cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIG1heGltdW0gbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIG9mIHRoZSByZXN1bHRzIG9mIG9wZXJhdGlvbnNcclxuICAgICAqIGludm9sdmluZyBkaXZpc2lvbjogZGl2IGFuZCBzcXJ0LCBhbmQgcG93IHdpdGggbmVnYXRpdmUgZXhwb25lbnRzLlxyXG4gICAgICovXHJcbiAgICB2YXIgRFAgPSAyMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIE1BWF9EUFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSByb3VuZGluZyBtb2RlIHVzZWQgd2hlbiByb3VuZGluZyB0byB0aGUgYWJvdmUgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAwIFRvd2FyZHMgemVybyAoaS5lLiB0cnVuY2F0ZSwgbm8gcm91bmRpbmcpLiAgICAgICAoUk9VTkRfRE9XTilcclxuICAgICAgICAgKiAxIFRvIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgcm91bmQgdXAuICAoUk9VTkRfSEFMRl9VUClcclxuICAgICAgICAgKiAyIFRvIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG8gZXZlbi4gICAoUk9VTkRfSEFMRl9FVkVOKVxyXG4gICAgICAgICAqIDMgQXdheSBmcm9tIHplcm8uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChST1VORF9VUClcclxuICAgICAgICAgKi9cclxuICAgICAgICBSTSA9IDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAsIDEsIDIgb3IgM1xyXG5cclxuICAgICAgICAvLyBUaGUgbWF4aW11bSB2YWx1ZSBvZiBEUCBhbmQgQmlnLkRQLlxyXG4gICAgICAgIE1BWF9EUCA9IDFFNiwgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byAxMDAwMDAwXHJcblxyXG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIG1hZ25pdHVkZSBvZiB0aGUgZXhwb25lbnQgYXJndW1lbnQgdG8gdGhlIHBvdyBtZXRob2QuXHJcbiAgICAgICAgTUFYX1BPV0VSID0gMUU2LCAgICAgICAgICAgICAgICAgICAvLyAxIHRvIDEwMDAwMDBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGJlbmVhdGggd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqIEphdmFTY3JpcHQncyBOdW1iZXIgdHlwZTogLTdcclxuICAgICAgICAgKiAtMTAwMDAwMCBpcyB0aGUgbWluaW11bSByZWNvbW1lbmRlZCBleHBvbmVudCB2YWx1ZSBvZiBhIEJpZy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBFX05FRyA9IC03LCAgICAgICAgICAgICAgICAgICAvLyAwIHRvIC0xMDAwMDAwXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBhYm92ZSB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICogSmF2YVNjcmlwdCdzIE51bWJlciB0eXBlOiAyMVxyXG4gICAgICAgICAqIDEwMDAwMDAgaXMgdGhlIG1heGltdW0gcmVjb21tZW5kZWQgZXhwb25lbnQgdmFsdWUgb2YgYSBCaWcuXHJcbiAgICAgICAgICogKFRoaXMgbGltaXQgaXMgbm90IGVuZm9yY2VkIG9yIGNoZWNrZWQuKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEVfUE9TID0gMjEsICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gMTAwMDAwMFxyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgICAgICAgLy8gVGhlIHNoYXJlZCBwcm90b3R5cGUgb2JqZWN0LlxyXG4gICAgICAgIFAgPSB7fSxcclxuICAgICAgICBpc1ZhbGlkID0gL14tPyhcXGQrKFxcLlxcZCopP3xcXC5cXGQrKShlWystXT9cXGQrKT8kL2ksXHJcbiAgICAgICAgQmlnO1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBCaWcgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBiaWdGYWN0b3J5KCkge1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBCaWcgY29uc3RydWN0b3IgYW5kIGV4cG9ydGVkIGZ1bmN0aW9uLlxyXG4gICAgICAgICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgbmV3IGluc3RhbmNlIG9mIGEgQmlnIG51bWJlciBvYmplY3QuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBuIHtudW1iZXJ8c3RyaW5nfEJpZ30gQSBudW1lcmljIHZhbHVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIEJpZyhuKSB7XHJcbiAgICAgICAgICAgIHZhciB4ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIC8vIEVuYWJsZSBjb25zdHJ1Y3RvciB1c2FnZSB3aXRob3V0IG5ldy5cclxuICAgICAgICAgICAgaWYgKCEoeCBpbnN0YW5jZW9mIEJpZykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuID09PSB2b2lkIDAgPyBiaWdGYWN0b3J5KCkgOiBuZXcgQmlnKG4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEdXBsaWNhdGUuXHJcbiAgICAgICAgICAgIGlmIChuIGluc3RhbmNlb2YgQmlnKSB7XHJcbiAgICAgICAgICAgICAgICB4LnMgPSBuLnM7XHJcbiAgICAgICAgICAgICAgICB4LmUgPSBuLmU7XHJcbiAgICAgICAgICAgICAgICB4LmMgPSBuLmMuc2xpY2UoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBhcnNlKHgsIG4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBSZXRhaW4gYSByZWZlcmVuY2UgdG8gdGhpcyBCaWcgY29uc3RydWN0b3IsIGFuZCBzaGFkb3dcclxuICAgICAgICAgICAgICogQmlnLnByb3RvdHlwZS5jb25zdHJ1Y3RvciB3aGljaCBwb2ludHMgdG8gT2JqZWN0LlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgeC5jb25zdHJ1Y3RvciA9IEJpZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEJpZy5wcm90b3R5cGUgPSBQO1xyXG4gICAgICAgIEJpZy5EUCA9IERQO1xyXG4gICAgICAgIEJpZy5STSA9IFJNO1xyXG4gICAgICAgIEJpZy5FX05FRyA9IEVfTkVHO1xyXG4gICAgICAgIEJpZy5FX1BPUyA9IEVfUE9TO1xyXG5cclxuICAgICAgICByZXR1cm4gQmlnO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBQcml2YXRlIGZ1bmN0aW9uc1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgQmlnIHggaW4gbm9ybWFsIG9yIGV4cG9uZW50aWFsXHJcbiAgICAgKiBub3RhdGlvbiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBvciBzaWduaWZpY2FudCBkaWdpdHMuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBUaGUgQmlnIHRvIGZvcm1hdC5cclxuICAgICAqIGRwIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIHRvRSB7bnVtYmVyfSAxICh0b0V4cG9uZW50aWFsKSwgMiAodG9QcmVjaXNpb24pIG9yIHVuZGVmaW5lZCAodG9GaXhlZCkuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGZvcm1hdCh4LCBkcCwgdG9FKSB7XHJcbiAgICAgICAgdmFyIEJpZyA9IHguY29uc3RydWN0b3IsXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgaW5kZXggKG5vcm1hbCBub3RhdGlvbikgb2YgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIGkgPSBkcCAtICh4ID0gbmV3IEJpZyh4KSkuZSxcclxuICAgICAgICAgICAgYyA9IHguYztcclxuXHJcbiAgICAgICAgLy8gUm91bmQ/XHJcbiAgICAgICAgaWYgKGMubGVuZ3RoID4gKytkcCkge1xyXG4gICAgICAgICAgICBybmQoeCwgaSwgQmlnLlJNKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghY1swXSkge1xyXG4gICAgICAgICAgICArK2k7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0b0UpIHtcclxuICAgICAgICAgICAgaSA9IGRwO1xyXG5cclxuICAgICAgICAvLyB0b0ZpeGVkXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYyA9IHguYztcclxuXHJcbiAgICAgICAgICAgIC8vIFJlY2FsY3VsYXRlIGkgYXMgeC5lIG1heSBoYXZlIGNoYW5nZWQgaWYgdmFsdWUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgaSA9IHguZSArIGkgKyAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIHplcm9zP1xyXG4gICAgICAgIGZvciAoOyBjLmxlbmd0aCA8IGk7IGMucHVzaCgwKSkge1xyXG4gICAgICAgIH1cclxuICAgICAgICBpID0geC5lO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIHRvUHJlY2lzaW9uIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhlIG51bWJlciBvZlxyXG4gICAgICAgICAqIHNpZ25pZmljYW50IGRpZ2l0cyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzXHJcbiAgICAgICAgICogbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgaW50ZWdlciBwYXJ0IG9mIHRoZSB2YWx1ZSBpbiBub3JtYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICByZXR1cm4gdG9FID09PSAxIHx8IHRvRSAmJiAoZHAgPD0gaSB8fCBpIDw9IEJpZy5FX05FRykgP1xyXG5cclxuICAgICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgKHgucyA8IDAgJiYgY1swXSA/ICctJyA6ICcnKSArXHJcbiAgICAgICAgICAgIChjLmxlbmd0aCA+IDEgPyBjWzBdICsgJy4nICsgYy5qb2luKCcnKS5zbGljZSgxKSA6IGNbMF0pICtcclxuICAgICAgICAgICAgICAoaSA8IDAgPyAnZScgOiAnZSsnKSArIGlcclxuXHJcbiAgICAgICAgICAvLyBOb3JtYWwgbm90YXRpb24uXHJcbiAgICAgICAgICA6IHgudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFBhcnNlIHRoZSBudW1iZXIgb3Igc3RyaW5nIHZhbHVlIHBhc3NlZCB0byBhIEJpZyBjb25zdHJ1Y3Rvci5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IEEgQmlnIG51bWJlciBpbnN0YW5jZS5cclxuICAgICAqIG4ge251bWJlcnxzdHJpbmd9IEEgbnVtZXJpYyB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcGFyc2UoeCwgbikge1xyXG4gICAgICAgIHZhciBlLCBpLCBuTDtcclxuXHJcbiAgICAgICAgLy8gTWludXMgemVybz9cclxuICAgICAgICBpZiAobiA9PT0gMCAmJiAxIC8gbiA8IDApIHtcclxuICAgICAgICAgICAgbiA9ICctMCc7XHJcblxyXG4gICAgICAgIC8vIEVuc3VyZSBuIGlzIHN0cmluZyBhbmQgY2hlY2sgdmFsaWRpdHkuXHJcbiAgICAgICAgfSBlbHNlIGlmICghaXNWYWxpZC50ZXN0KG4gKz0gJycpKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgc2lnbi5cclxuICAgICAgICB4LnMgPSBuLmNoYXJBdCgwKSA9PSAnLScgPyAobiA9IG4uc2xpY2UoMSksIC0xKSA6IDE7XHJcblxyXG4gICAgICAgIC8vIERlY2ltYWwgcG9pbnQ/XHJcbiAgICAgICAgaWYgKChlID0gbi5pbmRleE9mKCcuJykpID4gLTEpIHtcclxuICAgICAgICAgICAgbiA9IG4ucmVwbGFjZSgnLicsICcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIGZvcm0/XHJcbiAgICAgICAgaWYgKChpID0gbi5zZWFyY2goL2UvaSkpID4gMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGV4cG9uZW50LlxyXG4gICAgICAgICAgICBpZiAoZSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGUgPSBpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUgKz0gK24uc2xpY2UoaSArIDEpO1xyXG4gICAgICAgICAgICBuID0gbi5zdWJzdHJpbmcoMCwgaSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEludGVnZXIuXHJcbiAgICAgICAgICAgIGUgPSBuLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBsZWFkaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoaSA9IDA7IG4uY2hhckF0KGkpID09ICcwJzsgaSsrKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSA9PSAobkwgPSBuLmxlbmd0aCkpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgIHguYyA9IFsgeC5lID0gMCBdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoOyBuLmNoYXJBdCgtLW5MKSA9PSAnMCc7KSB7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHguZSA9IGUgLSBpIC0gMTtcclxuICAgICAgICAgICAgeC5jID0gW107XHJcblxyXG4gICAgICAgICAgICAvLyBDb252ZXJ0IHN0cmluZyB0byBhcnJheSBvZiBkaWdpdHMgd2l0aG91dCBsZWFkaW5nL3RyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKGUgPSAwOyBpIDw9IG5MOyB4LmNbZSsrXSA9ICtuLmNoYXJBdChpKyspKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUm91bmQgQmlnIHggdG8gYSBtYXhpbXVtIG9mIGRwIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgcm0uXHJcbiAgICAgKiBDYWxsZWQgYnkgZGl2LCBzcXJ0IGFuZCByb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IFRoZSBCaWcgdG8gcm91bmQuXHJcbiAgICAgKiBkcCB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiBybSB7bnVtYmVyfSAwLCAxLCAyIG9yIDMgKERPV04sIEhBTEZfVVAsIEhBTEZfRVZFTiwgVVApXHJcbiAgICAgKiBbbW9yZV0ge2Jvb2xlYW59IFdoZXRoZXIgdGhlIHJlc3VsdCBvZiBkaXZpc2lvbiB3YXMgdHJ1bmNhdGVkLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBybmQoeCwgZHAsIHJtLCBtb3JlKSB7XHJcbiAgICAgICAgdmFyIHUsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICBpID0geC5lICsgZHAgKyAxO1xyXG5cclxuICAgICAgICBpZiAocm0gPT09IDEpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHhjW2ldIGlzIHRoZSBkaWdpdCBhZnRlciB0aGUgZGlnaXQgdGhhdCBtYXkgYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgbW9yZSA9IHhjW2ldID49IDU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChybSA9PT0gMikge1xyXG4gICAgICAgICAgICBtb3JlID0geGNbaV0gPiA1IHx8IHhjW2ldID09IDUgJiZcclxuICAgICAgICAgICAgICAobW9yZSB8fCBpIDwgMCB8fCB4Y1tpICsgMV0gIT09IHUgfHwgeGNbaSAtIDFdICYgMSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChybSA9PT0gMykge1xyXG4gICAgICAgICAgICBtb3JlID0gbW9yZSB8fCB4Y1tpXSAhPT0gdSB8fCBpIDwgMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBtb3JlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAocm0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKCchQmlnLlJNIScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSA8IDEgfHwgIXhjWzBdKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobW9yZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIDEsIDAuMSwgMC4wMSwgMC4wMDEsIDAuMDAwMSBldGMuXHJcbiAgICAgICAgICAgICAgICB4LmUgPSAtZHA7XHJcbiAgICAgICAgICAgICAgICB4LmMgPSBbMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgICAgIHguYyA9IFt4LmUgPSAwXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgYW55IGRpZ2l0cyBhZnRlciB0aGUgcmVxdWlyZWQgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgICAgICAgIHhjLmxlbmd0aCA9IGktLTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJvdW5kIHVwP1xyXG4gICAgICAgICAgICBpZiAobW9yZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJvdW5kaW5nIHVwIG1heSBtZWFuIHRoZSBwcmV2aW91cyBkaWdpdCBoYXMgdG8gYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgICAgIGZvciAoOyArK3hjW2ldID4gOTspIHtcclxuICAgICAgICAgICAgICAgICAgICB4Y1tpXSA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsreC5lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4Yy51bnNoaWZ0KDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKGkgPSB4Yy5sZW5ndGg7ICF4Y1stLWldOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFRocm93IGEgQmlnRXJyb3IuXHJcbiAgICAgKlxyXG4gICAgICogbWVzc2FnZSB7c3RyaW5nfSBUaGUgZXJyb3IgbWVzc2FnZS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdGhyb3dFcnIobWVzc2FnZSkge1xyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IobWVzc2FnZSk7XHJcbiAgICAgICAgZXJyLm5hbWUgPSAnQmlnRXJyb3InO1xyXG5cclxuICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIFByb3RvdHlwZS9pbnN0YW5jZSBtZXRob2RzXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGlzIEJpZy5cclxuICAgICAqL1xyXG4gICAgUC5hYnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHggPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKTtcclxuICAgICAgICB4LnMgPSAxO1xyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm5cclxuICAgICAqIDEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiAtMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSwgb3JcclxuICAgICAqIDAgaWYgdGhleSBoYXZlIHRoZSBzYW1lIHZhbHVlLlxyXG4gICAgKi9cclxuICAgIFAuY21wID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeE5lZyxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5YyA9ICh5ID0gbmV3IHguY29uc3RydWN0b3IoeSkpLmMsXHJcbiAgICAgICAgICAgIGkgPSB4LnMsXHJcbiAgICAgICAgICAgIGogPSB5LnMsXHJcbiAgICAgICAgICAgIGsgPSB4LmUsXHJcbiAgICAgICAgICAgIGwgPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAheGNbMF0gPyAheWNbMF0gPyAwIDogLWogOiBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChpICE9IGopIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHhOZWcgPSBpIDwgMDtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBleHBvbmVudHMuXHJcbiAgICAgICAgaWYgKGsgIT0gbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gayA+IGwgXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSA9IC0xO1xyXG4gICAgICAgIGogPSAoayA9IHhjLmxlbmd0aCkgPCAobCA9IHljLmxlbmd0aCkgPyBrIDogbDtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBkaWdpdCBieSBkaWdpdC5cclxuICAgICAgICBmb3IgKDsgKytpIDwgajspIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh4Y1tpXSAhPSB5Y1tpXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHhjW2ldID4geWNbaV0gXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGxlbmd0aHMuXHJcbiAgICAgICAgcmV0dXJuIGsgPT0gbCA/IDAgOiBrID4gbCBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgZGl2aWRlZCBieSB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbFxyXG4gICAgICogcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICovXHJcbiAgICBQLmRpdiA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICAvLyBkaXZpZGVuZFxyXG4gICAgICAgICAgICBkdmQgPSB4LmMsXHJcbiAgICAgICAgICAgIC8vZGl2aXNvclxyXG4gICAgICAgICAgICBkdnMgPSAoeSA9IG5ldyBCaWcoeSkpLmMsXHJcbiAgICAgICAgICAgIHMgPSB4LnMgPT0geS5zID8gMSA6IC0xLFxyXG4gICAgICAgICAgICBkcCA9IEJpZy5EUDtcclxuXHJcbiAgICAgICAgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIUJpZy5EUCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciAwP1xyXG4gICAgICAgIGlmICghZHZkWzBdIHx8ICFkdnNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIGJvdGggYXJlIDAsIHRocm93IE5hTlxyXG4gICAgICAgICAgICBpZiAoZHZkWzBdID09IGR2c1swXSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgZHZzIGlzIDAsIHRocm93ICstSW5maW5pdHkuXHJcbiAgICAgICAgICAgIGlmICghZHZzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycihzIC8gMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGR2ZCBpcyAwLCByZXR1cm4gKy0wLlxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyhzICogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZHZzTCwgZHZzVCwgbmV4dCwgY21wLCByZW1JLCB1LFxyXG4gICAgICAgICAgICBkdnNaID0gZHZzLnNsaWNlKCksXHJcbiAgICAgICAgICAgIGR2ZEkgPSBkdnNMID0gZHZzLmxlbmd0aCxcclxuICAgICAgICAgICAgZHZkTCA9IGR2ZC5sZW5ndGgsXHJcbiAgICAgICAgICAgIC8vIHJlbWFpbmRlclxyXG4gICAgICAgICAgICByZW0gPSBkdmQuc2xpY2UoMCwgZHZzTCksXHJcbiAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoLFxyXG4gICAgICAgICAgICAvLyBxdW90aWVudFxyXG4gICAgICAgICAgICBxID0geSxcclxuICAgICAgICAgICAgcWMgPSBxLmMgPSBbXSxcclxuICAgICAgICAgICAgcWkgPSAwLFxyXG4gICAgICAgICAgICBkaWdpdHMgPSBkcCArIChxLmUgPSB4LmUgLSB5LmUpICsgMTtcclxuXHJcbiAgICAgICAgcS5zID0gcztcclxuICAgICAgICBzID0gZGlnaXRzIDwgMCA/IDAgOiBkaWdpdHM7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB2ZXJzaW9uIG9mIGRpdmlzb3Igd2l0aCBsZWFkaW5nIHplcm8uXHJcbiAgICAgICAgZHZzWi51bnNoaWZ0KDApO1xyXG5cclxuICAgICAgICAvLyBBZGQgemVyb3MgdG8gbWFrZSByZW1haW5kZXIgYXMgbG9uZyBhcyBkaXZpc29yLlxyXG4gICAgICAgIGZvciAoOyByZW1MKysgPCBkdnNMOyByZW0ucHVzaCgwKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZG8ge1xyXG5cclxuICAgICAgICAgICAgLy8gJ25leHQnIGlzIGhvdyBtYW55IHRpbWVzIHRoZSBkaXZpc29yIGdvZXMgaW50byBjdXJyZW50IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgZm9yIChuZXh0ID0gMDsgbmV4dCA8IDEwOyBuZXh0KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDb21wYXJlIGRpdmlzb3IgYW5kIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIGlmIChkdnNMICE9IChyZW1MID0gcmVtLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbXAgPSBkdnNMID4gcmVtTCA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAocmVtSSA9IC0xLCBjbXAgPSAwOyArK3JlbUkgPCBkdnNMOykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGR2c1tyZW1JXSAhPSByZW1bcmVtSV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNtcCA9IGR2c1tyZW1JXSA+IHJlbVtyZW1JXSA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIElmIGRpdmlzb3IgPCByZW1haW5kZXIsIHN1YnRyYWN0IGRpdmlzb3IgZnJvbSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoY21wIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1haW5kZXIgY2FuJ3QgYmUgbW9yZSB0aGFuIDEgZGlnaXQgbG9uZ2VyIHRoYW4gZGl2aXNvci5cclxuICAgICAgICAgICAgICAgICAgICAvLyBFcXVhbGlzZSBsZW5ndGhzIHVzaW5nIGRpdmlzb3Igd2l0aCBleHRyYSBsZWFkaW5nIHplcm8/XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChkdnNUID0gcmVtTCA9PSBkdnNMID8gZHZzIDogZHZzWjsgcmVtTDspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1bLS1yZW1MXSA8IGR2c1RbcmVtTF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbUkgPSByZW1MO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoOyByZW1JICYmICFyZW1bLS1yZW1JXTsgcmVtW3JlbUldID0gOSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLS1yZW1bcmVtSV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1bcmVtTF0gKz0gMTA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtW3JlbUxdIC09IGR2c1RbcmVtTF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoOyAhcmVtWzBdOyByZW0uc2hpZnQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgJ25leHQnIGRpZ2l0IHRvIHRoZSByZXN1bHQgYXJyYXkuXHJcbiAgICAgICAgICAgIHFjW3FpKytdID0gY21wID8gbmV4dCA6ICsrbmV4dDtcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBpZiAocmVtWzBdICYmIGNtcCkge1xyXG4gICAgICAgICAgICAgICAgcmVtW3JlbUxdID0gZHZkW2R2ZEldIHx8IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZW0gPSBbIGR2ZFtkdmRJXSBdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gd2hpbGUgKChkdmRJKysgPCBkdmRMIHx8IHJlbVswXSAhPT0gdSkgJiYgcy0tKTtcclxuXHJcbiAgICAgICAgLy8gTGVhZGluZyB6ZXJvPyBEbyBub3QgcmVtb3ZlIGlmIHJlc3VsdCBpcyBzaW1wbHkgemVybyAocWkgPT0gMSkuXHJcbiAgICAgICAgaWYgKCFxY1swXSAmJiBxaSAhPSAxKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGVyZSBjYW4ndCBiZSBtb3JlIHRoYW4gb25lIHplcm8uXHJcbiAgICAgICAgICAgIHFjLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIHEuZS0tO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUm91bmQ/XHJcbiAgICAgICAgaWYgKHFpID4gZGlnaXRzKSB7XHJcbiAgICAgICAgICAgIHJuZChxLCBkcCwgQmlnLlJNLCByZW1bMF0gIT09IHUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGVxdWFsIHRvIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmVxID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuY21wKHkpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZ3QgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA+IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5ndGUgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA+IC0xO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAubHQgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA8IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5sdGUgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPCAxO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIG1pbnVzIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAuc3ViID0gUC5taW51cyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIGksIGosIHQsIHhMVHksXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGEgIT0gYikge1xyXG4gICAgICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICAgICAgcmV0dXJuIHgucGx1cyh5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB4YyA9IHguYy5zbGljZSgpLFxyXG4gICAgICAgICAgICB4ZSA9IHguZSxcclxuICAgICAgICAgICAgeWMgPSB5LmMsXHJcbiAgICAgICAgICAgIHllID0geS5lO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8geSBpcyBub24temVybz8geCBpcyBub24temVybz8gT3IgYm90aCBhcmUgemVyby5cclxuICAgICAgICAgICAgcmV0dXJuIHljWzBdID8gKHkucyA9IC1iLCB5KSA6IG5ldyBCaWcoeGNbMF0gPyB4IDogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggaXMgdGhlIGJpZ2dlciBudW1iZXIuXHJcbiAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcyB0byBlcXVhbGlzZSBleHBvbmVudHMuXHJcbiAgICAgICAgaWYgKGEgPSB4ZSAtIHllKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoeExUeSA9IGEgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBhID0gLWE7XHJcbiAgICAgICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB5ZSA9IHhlO1xyXG4gICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgZm9yIChiID0gYTsgYi0tOyB0LnB1c2goMCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gRXhwb25lbnRzIGVxdWFsLiBDaGVjayBkaWdpdCBieSBkaWdpdC5cclxuICAgICAgICAgICAgaiA9ICgoeExUeSA9IHhjLmxlbmd0aCA8IHljLmxlbmd0aCkgPyB4YyA6IHljKS5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGEgPSBiID0gMDsgYiA8IGo7IGIrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh4Y1tiXSAhPSB5Y1tiXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHhMVHkgPSB4Y1tiXSA8IHljW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB4IDwgeT8gUG9pbnQgeGMgdG8gdGhlIGFycmF5IG9mIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgIGlmICh4TFR5KSB7XHJcbiAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB5YztcclxuICAgICAgICAgICAgeWMgPSB0O1xyXG4gICAgICAgICAgICB5LnMgPSAteS5zO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBBcHBlbmQgemVyb3MgdG8geGMgaWYgc2hvcnRlci4gTm8gbmVlZCB0byBhZGQgemVyb3MgdG8geWMgaWYgc2hvcnRlclxyXG4gICAgICAgICAqIGFzIHN1YnRyYWN0aW9uIG9ubHkgbmVlZHMgdG8gc3RhcnQgYXQgeWMubGVuZ3RoLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlmICgoIGIgPSAoaiA9IHljLmxlbmd0aCkgLSAoaSA9IHhjLmxlbmd0aCkgKSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAoOyBiLS07IHhjW2krK10gPSAwKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN1YnRyYWN0IHljIGZyb20geGMuXHJcbiAgICAgICAgZm9yIChiID0gaTsgaiA+IGE7KXtcclxuXHJcbiAgICAgICAgICAgIGlmICh4Y1stLWpdIDwgeWNbal0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSBqOyBpICYmICF4Y1stLWldOyB4Y1tpXSA9IDkpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC0teGNbaV07XHJcbiAgICAgICAgICAgICAgICB4Y1tqXSArPSAxMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB4Y1tqXSAtPSB5Y1tqXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKDsgeGNbLS1iXSA9PT0gMDsgeGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIHplcm9zIGFuZCBhZGp1c3QgZXhwb25lbnQgYWNjb3JkaW5nbHkuXHJcbiAgICAgICAgZm9yICg7IHhjWzBdID09PSAwOykge1xyXG4gICAgICAgICAgICB4Yy5zaGlmdCgpO1xyXG4gICAgICAgICAgICAtLXllO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF4Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8gbiAtIG4gPSArMFxyXG4gICAgICAgICAgICB5LnMgPSAxO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVzdWx0IG11c3QgYmUgemVyby5cclxuICAgICAgICAgICAgeGMgPSBbeWUgPSAwXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHkuYyA9IHhjO1xyXG4gICAgICAgIHkuZSA9IHllO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBtb2R1bG8gdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5tb2QgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB5R1R4LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgaWYgKCF5LmNbMF0pIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHgucyA9IHkucyA9IDE7XHJcbiAgICAgICAgeUdUeCA9IHkuY21wKHgpID09IDE7XHJcbiAgICAgICAgeC5zID0gYTtcclxuICAgICAgICB5LnMgPSBiO1xyXG5cclxuICAgICAgICBpZiAoeUdUeCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGEgPSBCaWcuRFA7XHJcbiAgICAgICAgYiA9IEJpZy5STTtcclxuICAgICAgICBCaWcuRFAgPSBCaWcuUk0gPSAwO1xyXG4gICAgICAgIHggPSB4LmRpdih5KTtcclxuICAgICAgICBCaWcuRFAgPSBhO1xyXG4gICAgICAgIEJpZy5STSA9IGI7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbnVzKCB4LnRpbWVzKHkpICk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcGx1cyB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLmFkZCA9IFAucGx1cyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHQsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGEgIT0gYikge1xyXG4gICAgICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICAgICAgcmV0dXJuIHgubWludXMoeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgeGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5ZSA9IHkuZSxcclxuICAgICAgICAgICAgeWMgPSB5LmM7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB5IGlzIG5vbi16ZXJvPyB4IGlzIG5vbi16ZXJvPyBPciBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgICByZXR1cm4geWNbMF0gPyB5IDogbmV3IEJpZyh4Y1swXSA/IHggOiBhICogMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHhjID0geGMuc2xpY2UoKTtcclxuXHJcbiAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcyB0byBlcXVhbGlzZSBleHBvbmVudHMuXHJcbiAgICAgICAgLy8gTm90ZTogRmFzdGVyIHRvIHVzZSByZXZlcnNlIHRoZW4gZG8gdW5zaGlmdHMuXHJcbiAgICAgICAgaWYgKGEgPSB4ZSAtIHllKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoYSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHllID0geGU7XHJcbiAgICAgICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhID0gLWE7XHJcbiAgICAgICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICBmb3IgKDsgYS0tOyB0LnB1c2goMCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFBvaW50IHhjIHRvIHRoZSBsb25nZXIgYXJyYXkuXHJcbiAgICAgICAgaWYgKHhjLmxlbmd0aCAtIHljLmxlbmd0aCA8IDApIHtcclxuICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGEgPSB5Yy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogT25seSBzdGFydCBhZGRpbmcgYXQgeWMubGVuZ3RoIC0gMSBhcyB0aGUgZnVydGhlciBkaWdpdHMgb2YgeGMgY2FuIGJlXHJcbiAgICAgICAgICogbGVmdCBhcyB0aGV5IGFyZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmb3IgKGIgPSAwOyBhOykge1xyXG4gICAgICAgICAgICBiID0gKHhjWy0tYV0gPSB4Y1thXSArIHljW2FdICsgYikgLyAxMCB8IDA7XHJcbiAgICAgICAgICAgIHhjW2FdICU9IDEwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTm8gbmVlZCB0byBjaGVjayBmb3IgemVybywgYXMgK3ggKyAreSAhPSAwICYmIC14ICsgLXkgIT0gMFxyXG5cclxuICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICB4Yy51bnNoaWZ0KGIpO1xyXG4gICAgICAgICAgICArK3llO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGEgPSB4Yy5sZW5ndGg7IHhjWy0tYV0gPT09IDA7IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB5LmMgPSB4YztcclxuICAgICAgICB5LmUgPSB5ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByYWlzZWQgdG8gdGhlIHBvd2VyIG4uXHJcbiAgICAgKiBJZiBuIGlzIG5lZ2F0aXZlLCByb3VuZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWxcclxuICAgICAqIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBuIHtudW1iZXJ9IEludGVnZXIsIC1NQVhfUE9XRVIgdG8gTUFYX1BPV0VSIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC5wb3cgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgb25lID0gbmV3IHguY29uc3RydWN0b3IoMSksXHJcbiAgICAgICAgICAgIHkgPSBvbmUsXHJcbiAgICAgICAgICAgIGlzTmVnID0gbiA8IDA7XHJcblxyXG4gICAgICAgIGlmIChuICE9PSB+fm4gfHwgbiA8IC1NQVhfUE9XRVIgfHwgbiA+IE1BWF9QT1dFUikge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXBvdyEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG4gPSBpc05lZyA/IC1uIDogbjtcclxuXHJcbiAgICAgICAgZm9yICg7Oykge1xyXG5cclxuICAgICAgICAgICAgaWYgKG4gJiAxKSB7XHJcbiAgICAgICAgICAgICAgICB5ID0geS50aW1lcyh4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBuID4+PSAxO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFuKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB4ID0geC50aW1lcyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpc05lZyA/IG9uZS5kaXYoeSkgOiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJvdW5kZWQgdG8gYVxyXG4gICAgICogbWF4aW11bSBvZiBkcCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLlxyXG4gICAgICogSWYgZHAgaXMgbm90IHNwZWNpZmllZCwgcm91bmQgdG8gMCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAqIElmIHJtIGlzIG5vdCBzcGVjaWZpZWQsIHVzZSBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiBbcm1dIDAsIDEsIDIgb3IgMyAoUk9VTkRfRE9XTiwgUk9VTkRfSEFMRl9VUCwgUk9VTkRfSEFMRl9FVkVOLCBST1VORF9VUClcclxuICAgICAqL1xyXG4gICAgUC5yb3VuZCA9IGZ1bmN0aW9uIChkcCwgcm0pIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGRwID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXJvdW5kIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBybmQoeCA9IG5ldyBCaWcoeCksIGRwLCBybSA9PSBudWxsID8gQmlnLlJNIDogcm0pO1xyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSBzcXVhcmUgcm9vdCBvZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcsXHJcbiAgICAgKiByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbCBwbGFjZXMgdXNpbmdcclxuICAgICAqIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICovXHJcbiAgICBQLnNxcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVzdGltYXRlLCByLCBhcHByb3gsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgaSA9IHgucyxcclxuICAgICAgICAgICAgZSA9IHguZSxcclxuICAgICAgICAgICAgaGFsZiA9IG5ldyBCaWcoJzAuNScpO1xyXG5cclxuICAgICAgICAvLyBaZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBuZWdhdGl2ZSwgdGhyb3cgTmFOLlxyXG4gICAgICAgIGlmIChpIDwgMCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXN0aW1hdGUuXHJcbiAgICAgICAgaSA9IE1hdGguc3FydCh4LnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAvLyBNYXRoLnNxcnQgdW5kZXJmbG93L292ZXJmbG93P1xyXG4gICAgICAgIC8vIFBhc3MgeCB0byBNYXRoLnNxcnQgYXMgaW50ZWdlciwgdGhlbiBhZGp1c3QgdGhlIHJlc3VsdCBleHBvbmVudC5cclxuICAgICAgICBpZiAoaSA9PT0gMCB8fCBpID09PSAxIC8gMCkge1xyXG4gICAgICAgICAgICBlc3RpbWF0ZSA9IHhjLmpvaW4oJycpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCEoZXN0aW1hdGUubGVuZ3RoICsgZSAmIDEpKSB7XHJcbiAgICAgICAgICAgICAgICBlc3RpbWF0ZSArPSAnMCc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHIgPSBuZXcgQmlnKCBNYXRoLnNxcnQoZXN0aW1hdGUpLnRvU3RyaW5nKCkgKTtcclxuICAgICAgICAgICAgci5lID0gKChlICsgMSkgLyAyIHwgMCkgLSAoZSA8IDAgfHwgZSAmIDEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIgPSBuZXcgQmlnKGkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpID0gci5lICsgKEJpZy5EUCArPSA0KTtcclxuXHJcbiAgICAgICAgLy8gTmV3dG9uLVJhcGhzb24gaXRlcmF0aW9uLlxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgYXBwcm94ID0gcjtcclxuICAgICAgICAgICAgciA9IGhhbGYudGltZXMoIGFwcHJveC5wbHVzKCB4LmRpdihhcHByb3gpICkgKTtcclxuICAgICAgICB9IHdoaWxlICggYXBwcm94LmMuc2xpY2UoMCwgaSkuam9pbignJykgIT09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgci5jLnNsaWNlKDAsIGkpLmpvaW4oJycpICk7XHJcblxyXG4gICAgICAgIHJuZChyLCBCaWcuRFAgLT0gNCwgQmlnLlJNKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgdGltZXMgdGhlIHZhbHVlIG9mXHJcbiAgICAgKiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5tdWwgPSBQLnRpbWVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgYyxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5YyA9ICh5ID0gbmV3IEJpZyh5KSkuYyxcclxuICAgICAgICAgICAgYSA9IHhjLmxlbmd0aCxcclxuICAgICAgICAgICAgYiA9IHljLmxlbmd0aCxcclxuICAgICAgICAgICAgaSA9IHguZSxcclxuICAgICAgICAgICAgaiA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHNpZ24gb2YgcmVzdWx0LlxyXG4gICAgICAgIHkucyA9IHgucyA9PSB5LnMgPyAxIDogLTE7XHJcblxyXG4gICAgICAgIC8vIFJldHVybiBzaWduZWQgMCBpZiBlaXRoZXIgMC5cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh5LnMgKiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpc2UgZXhwb25lbnQgb2YgcmVzdWx0IGFzIHguZSArIHkuZS5cclxuICAgICAgICB5LmUgPSBpICsgajtcclxuXHJcbiAgICAgICAgLy8gSWYgYXJyYXkgeGMgaGFzIGZld2VyIGRpZ2l0cyB0aGFuIHljLCBzd2FwIHhjIGFuZCB5YywgYW5kIGxlbmd0aHMuXHJcbiAgICAgICAgaWYgKGEgPCBiKSB7XHJcbiAgICAgICAgICAgIGMgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB5YztcclxuICAgICAgICAgICAgeWMgPSBjO1xyXG4gICAgICAgICAgICBqID0gYTtcclxuICAgICAgICAgICAgYSA9IGI7XHJcbiAgICAgICAgICAgIGIgPSBqO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGlzZSBjb2VmZmljaWVudCBhcnJheSBvZiByZXN1bHQgd2l0aCB6ZXJvcy5cclxuICAgICAgICBmb3IgKGMgPSBuZXcgQXJyYXkoaiA9IGEgKyBiKTsgai0tOyBjW2pdID0gMCkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTXVsdGlwbHkuXHJcblxyXG4gICAgICAgIC8vIGkgaXMgaW5pdGlhbGx5IHhjLmxlbmd0aC5cclxuICAgICAgICBmb3IgKGkgPSBiOyBpLS07KSB7XHJcbiAgICAgICAgICAgIGIgPSAwO1xyXG5cclxuICAgICAgICAgICAgLy8gYSBpcyB5Yy5sZW5ndGguXHJcbiAgICAgICAgICAgIGZvciAoaiA9IGEgKyBpOyBqID4gaTspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDdXJyZW50IHN1bSBvZiBwcm9kdWN0cyBhdCB0aGlzIGRpZ2l0IHBvc2l0aW9uLCBwbHVzIGNhcnJ5LlxyXG4gICAgICAgICAgICAgICAgYiA9IGNbal0gKyB5Y1tpXSAqIHhjW2ogLSBpIC0gMV0gKyBiO1xyXG4gICAgICAgICAgICAgICAgY1tqLS1dID0gYiAlIDEwO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGNhcnJ5XHJcbiAgICAgICAgICAgICAgICBiID0gYiAvIDEwIHwgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjW2pdID0gKGNbal0gKyBiKSAlIDEwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5jcmVtZW50IHJlc3VsdCBleHBvbmVudCBpZiB0aGVyZSBpcyBhIGZpbmFsIGNhcnJ5LlxyXG4gICAgICAgIGlmIChiKSB7XHJcbiAgICAgICAgICAgICsreS5lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGFueSBsZWFkaW5nIHplcm8uXHJcbiAgICAgICAgaWYgKCFjWzBdKSB7XHJcbiAgICAgICAgICAgIGMuc2hpZnQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGkgPSBjLmxlbmd0aDsgIWNbLS1pXTsgYy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuICAgICAgICB5LmMgPSBjO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZy5cclxuICAgICAqIFJldHVybiBleHBvbmVudGlhbCBub3RhdGlvbiBpZiB0aGlzIEJpZyBoYXMgYSBwb3NpdGl2ZSBleHBvbmVudCBlcXVhbCB0b1xyXG4gICAgICogb3IgZ3JlYXRlciB0aGFuIEJpZy5FX1BPUywgb3IgYSBuZWdhdGl2ZSBleHBvbmVudCBlcXVhbCB0byBvciBsZXNzIHRoYW5cclxuICAgICAqIEJpZy5FX05FRy5cclxuICAgICAqL1xyXG4gICAgUC50b1N0cmluZyA9IFAudmFsdWVPZiA9IFAudG9KU09OID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgZSA9IHguZSxcclxuICAgICAgICAgICAgc3RyID0geC5jLmpvaW4oJycpLFxyXG4gICAgICAgICAgICBzdHJMID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24/XHJcbiAgICAgICAgaWYgKGUgPD0gQmlnLkVfTkVHIHx8IGUgPj0gQmlnLkVfUE9TKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5jaGFyQXQoMCkgKyAoc3RyTCA+IDEgPyAnLicgKyBzdHIuc2xpY2UoMSkgOiAnJykgK1xyXG4gICAgICAgICAgICAgIChlIDwgMCA/ICdlJyA6ICdlKycpICsgZTtcclxuXHJcbiAgICAgICAgLy8gTmVnYXRpdmUgZXhwb25lbnQ/XHJcbiAgICAgICAgfSBlbHNlIGlmIChlIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICg7ICsrZTsgc3RyID0gJzAnICsgc3RyKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RyID0gJzAuJyArIHN0cjtcclxuXHJcbiAgICAgICAgLy8gUG9zaXRpdmUgZXhwb25lbnQ/XHJcbiAgICAgICAgfSBlbHNlIGlmIChlID4gMCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCsrZSA+IHN0ckwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBcHBlbmQgemVyb3MuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGUgLT0gc3RyTDsgZS0tIDsgc3RyICs9ICcwJykge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUgPCBzdHJMKSB7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIuc2xpY2UoMCwgZSkgKyAnLicgKyBzdHIuc2xpY2UoZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnQgemVyby5cclxuICAgICAgICB9IGVsc2UgaWYgKHN0ckwgPiAxKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5jaGFyQXQoMCkgKyAnLicgKyBzdHIuc2xpY2UoMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBdm9pZCAnLTAnXHJcbiAgICAgICAgcmV0dXJuIHgucyA8IDAgJiYgeC5jWzBdID8gJy0nICsgc3RyIDogc3RyO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqIElmIHRvRXhwb25lbnRpYWwsIHRvRml4ZWQsIHRvUHJlY2lzaW9uIGFuZCBmb3JtYXQgYXJlIG5vdCByZXF1aXJlZCB0aGV5XHJcbiAgICAgKiBjYW4gc2FmZWx5IGJlIGNvbW1lbnRlZC1vdXQgb3IgZGVsZXRlZC4gTm8gcmVkdW5kYW50IGNvZGUgd2lsbCBiZSBsZWZ0LlxyXG4gICAgICogZm9ybWF0IGlzIHVzZWQgb25seSBieSB0b0V4cG9uZW50aWFsLCB0b0ZpeGVkIGFuZCB0b1ByZWNpc2lvbi5cclxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqL1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaW4gZXhwb25lbnRpYWxcclxuICAgICAqIG5vdGF0aW9uIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIGFuZCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHVzaW5nXHJcbiAgICAgKiBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9FeHBvbmVudGlhbCA9IGZ1bmN0aW9uIChkcCkge1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBkcCA9IHRoaXMuYy5sZW5ndGggLSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9FeHAhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZm9ybWF0KHRoaXMsIGRwLCAxKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpbiBub3JtYWwgbm90YXRpb25cclxuICAgICAqIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIGFuZCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHVzaW5nIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b0ZpeGVkID0gZnVuY3Rpb24gKGRwKSB7XHJcbiAgICAgICAgdmFyIHN0cixcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIG5lZyA9IEJpZy5FX05FRyxcclxuICAgICAgICAgICAgcG9zID0gQmlnLkVfUE9TO1xyXG5cclxuICAgICAgICAvLyBQcmV2ZW50IHRoZSBwb3NzaWJpbGl0eSBvZiBleHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICBCaWcuRV9ORUcgPSAtKEJpZy5FX1BPUyA9IDEgLyAwKTtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgc3RyID0geC50b1N0cmluZygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgPT09IH5+ZHAgJiYgZHAgPj0gMCAmJiBkcCA8PSBNQVhfRFApIHtcclxuICAgICAgICAgICAgc3RyID0gZm9ybWF0KHgsIHguZSArIGRwKTtcclxuXHJcbiAgICAgICAgICAgIC8vICgtMCkudG9GaXhlZCgpIGlzICcwJywgYnV0ICgtMC4xKS50b0ZpeGVkKCkgaXMgJy0wJy5cclxuICAgICAgICAgICAgLy8gKC0wKS50b0ZpeGVkKDEpIGlzICcwLjAnLCBidXQgKC0wLjAxKS50b0ZpeGVkKDEpIGlzICctMC4wJy5cclxuICAgICAgICAgICAgaWYgKHgucyA8IDAgJiYgeC5jWzBdICYmIHN0ci5pbmRleE9mKCctJykgPCAwKSB7XHJcbiAgICAgICAgLy9FLmcuIC0wLjUgaWYgcm91bmRlZCB0byAtMCB3aWxsIGNhdXNlIHRvU3RyaW5nIHRvIG9taXQgdGhlIG1pbnVzIHNpZ24uXHJcbiAgICAgICAgICAgICAgICBzdHIgPSAnLScgKyBzdHI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgQmlnLkVfTkVHID0gbmVnO1xyXG4gICAgICAgIEJpZy5FX1BPUyA9IHBvcztcclxuXHJcbiAgICAgICAgaWYgKCFzdHIpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b0ZpeCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcm91bmRlZCB0byBzZFxyXG4gICAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIEJpZy5STS4gVXNlIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHNkIGlzIGxlc3NcclxuICAgICAqIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHMgbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgaW50ZWdlciBwYXJ0IG9mIHRoZVxyXG4gICAgICogdmFsdWUgaW4gbm9ybWFsIG5vdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIHNkIHtudW1iZXJ9IEludGVnZXIsIDEgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b1ByZWNpc2lvbiA9IGZ1bmN0aW9uIChzZCkge1xyXG5cclxuICAgICAgICBpZiAoc2QgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2QgIT09IH5+c2QgfHwgc2QgPCAxIHx8IHNkID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9QcmUhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZm9ybWF0KHRoaXMsIHNkIC0gMSwgMik7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvLyBFeHBvcnRcclxuXHJcblxyXG4gICAgQmlnID0gYmlnRmFjdG9yeSgpO1xyXG5cclxuICAgIC8vQU1ELlxyXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCaWc7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgLy8gTm9kZSBhbmQgb3RoZXIgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLlxyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xyXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gQmlnO1xyXG5cclxuICAgIC8vQnJvd3Nlci5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZ2xvYmFsLkJpZyA9IEJpZztcclxuICAgIH1cclxufSkodGhpcyk7XHJcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgTWVtb3J5SGVscGVyID0ge1xuICBjcmVhdGUoIHNpemVPckJ1ZmZlcj00MDk2LCBtZW10eXBlPUZsb2F0MzJBcnJheSApIHtcbiAgICBsZXQgaGVscGVyID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG5cbiAgICAvLyBjb252ZW5pZW50bHksIGJ1ZmZlciBjb25zdHJ1Y3RvcnMgYWNjZXB0IGVpdGhlciBhIHNpemUgb3IgYW4gYXJyYXkgYnVmZmVyIHRvIHVzZS4uLlxuICAgIC8vIHNvLCBubyBtYXR0ZXIgd2hpY2ggaXMgcGFzc2VkIHRvIHNpemVPckJ1ZmZlciBpdCBzaG91bGQgd29yay5cbiAgICBPYmplY3QuYXNzaWduKCBoZWxwZXIsIHtcbiAgICAgIGhlYXA6IG5ldyBtZW10eXBlKCBzaXplT3JCdWZmZXIgKSxcbiAgICAgIGxpc3Q6IHt9LFxuICAgICAgZnJlZUxpc3Q6IHt9XG4gICAgfSlcblxuICAgIHJldHVybiBoZWxwZXJcbiAgfSxcblxuICBhbGxvYyggc2l6ZSwgaW1tdXRhYmxlICkge1xuICAgIGxldCBpZHggPSAtMVxuXG4gICAgaWYoIHNpemUgPiB0aGlzLmhlYXAubGVuZ3RoICkge1xuICAgICAgdGhyb3cgRXJyb3IoICdBbGxvY2F0aW9uIHJlcXVlc3QgaXMgbGFyZ2VyIHRoYW4gaGVhcCBzaXplIG9mICcgKyB0aGlzLmhlYXAubGVuZ3RoIClcbiAgICB9XG5cbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5mcmVlTGlzdCApIHtcbiAgICAgIGxldCBjYW5kaWRhdGUgPSB0aGlzLmZyZWVMaXN0WyBrZXkgXVxuXG4gICAgICBpZiggY2FuZGlkYXRlLnNpemUgPj0gc2l6ZSApIHtcbiAgICAgICAgaWR4ID0ga2V5XG5cbiAgICAgICAgdGhpcy5saXN0WyBpZHggXSA9IHsgc2l6ZSwgaW1tdXRhYmxlLCByZWZlcmVuY2VzOjEgfVxuXG4gICAgICAgIGlmKCBjYW5kaWRhdGUuc2l6ZSAhPT0gc2l6ZSApIHtcbiAgICAgICAgICBsZXQgbmV3SW5kZXggPSBpZHggKyBzaXplLFxuICAgICAgICAgICAgICBuZXdGcmVlU2l6ZVxuXG4gICAgICAgICAgZm9yKCBsZXQga2V5IGluIHRoaXMubGlzdCApIHtcbiAgICAgICAgICAgIGlmKCBrZXkgPiBuZXdJbmRleCApIHtcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemUgPSBrZXkgLSBuZXdJbmRleFxuICAgICAgICAgICAgICB0aGlzLmZyZWVMaXN0WyBuZXdJbmRleCBdID0gbmV3RnJlZVNpemVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBpZHggIT09IC0xICkgZGVsZXRlIHRoaXMuZnJlZUxpc3RbIGlkeCBdXG5cbiAgICBpZiggaWR4ID09PSAtMSApIHtcbiAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMoIHRoaXMubGlzdCApLFxuICAgICAgICAgIGxhc3RJbmRleFxuXG4gICAgICBpZigga2V5cy5sZW5ndGggKSB7IC8vIGlmIG5vdCBmaXJzdCBhbGxvY2F0aW9uLi4uXG4gICAgICAgIGxhc3RJbmRleCA9IHBhcnNlSW50KCBrZXlzWyBrZXlzLmxlbmd0aCAtIDEgXSApXG5cbiAgICAgICAgaWR4ID0gbGFzdEluZGV4ICsgdGhpcy5saXN0WyBsYXN0SW5kZXggXS5zaXplXG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWR4ID0gMFxuICAgICAgfVxuXG4gICAgICB0aGlzLmxpc3RbIGlkeCBdID0geyBzaXplLCBpbW11dGFibGUsIHJlZmVyZW5jZXM6MSB9XG4gICAgfVxuXG4gICAgaWYoIGlkeCArIHNpemUgPj0gdGhpcy5oZWFwLmxlbmd0aCApIHtcbiAgICAgIHRocm93IEVycm9yKCAnTm8gYXZhaWxhYmxlIGJsb2NrcyByZW1haW4gc3VmZmljaWVudCBmb3IgYWxsb2NhdGlvbiByZXF1ZXN0LicgKVxuICAgIH1cbiAgICByZXR1cm4gaWR4XG4gIH0sXG5cbiAgYWRkUmVmZXJlbmNlKCBpbmRleCApIHtcbiAgICBpZiggdGhpcy5saXN0WyBpbmRleCBdICE9PSB1bmRlZmluZWQgKSB7IFxuICAgICAgdGhpcy5saXN0WyBpbmRleCBdLnJlZmVyZW5jZXMrK1xuICAgIH1cbiAgfSxcblxuICBmcmVlKCBpbmRleCApIHtcbiAgICBpZiggdGhpcy5saXN0WyBpbmRleCBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICB0aHJvdyBFcnJvciggJ0NhbGxpbmcgZnJlZSgpIG9uIG5vbi1leGlzdGluZyBibG9jay4nIClcbiAgICB9XG5cbiAgICBsZXQgc2xvdCA9IHRoaXMubGlzdFsgaW5kZXggXVxuICAgIGlmKCBzbG90ID09PSAwICkgcmV0dXJuXG4gICAgc2xvdC5yZWZlcmVuY2VzLS1cblxuICAgIGlmKCBzbG90LnJlZmVyZW5jZXMgPT09IDAgJiYgc2xvdC5pbW11dGFibGUgIT09IHRydWUgKSB7ICAgIFxuICAgICAgdGhpcy5saXN0WyBpbmRleCBdID0gMFxuXG4gICAgICBsZXQgZnJlZUJsb2NrU2l6ZSA9IDBcbiAgICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmxpc3QgKSB7XG4gICAgICAgIGlmKCBrZXkgPiBpbmRleCApIHtcbiAgICAgICAgICBmcmVlQmxvY2tTaXplID0ga2V5IC0gaW5kZXhcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZnJlZUxpc3RbIGluZGV4IF0gPSBmcmVlQmxvY2tTaXplXG4gICAgfVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUhlbHBlclxuIl19
class GibberishProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {}

  constructor(options) {
    super(options);
    Gibberish = window.Gibberish
    Gibberish.genish.hasWorklet = false
    Gibberish.init( undefined, undefined, 'processor' )
    this.port.onmessage = this.handleMessage.bind( this )
    this.ugens = new Map()
  }

  handleMessage( event ) {
    if( event.data.address === 'add' ) {

      const rep = event.data
      let constructor = Gibberish
      for( let i = 0; i < rep.name.length; i++ ) { constructor = constructor[ rep.name[ i ] ] }

      for( let key in rep.properties) {
        let prop = rep.properties[ key ]
        if( typeof prop === 'object' && prop.id !== undefined ) {
          let objCheck = this.ugens.get( prop.id )
          if( objCheck !== undefined ) {
            rep.properties[ key ] = objCheck
            //console.log( key, objCheck )
          } 
        }
      } 

      const ugen = constructor( rep.properties )

      if( rep.post ) {
        ugen[ rep.post ]()
      }

      this.ugens.set( rep.id, ugen )

      initialized = true

    }else if( event.data.address === 'method' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      obj[ dict.name ]( ...dict.args )
    }else if( event.data.address === 'property' ) {
      const dict = event.data
      const obj  = this.ugens.get( dict.object )
      obj[ dict.name ] = dict.value
    }else if( event.data.address === 'set' ) {
      this.memory[ event.data.idx ] = event.data.value
    }else if( event.data.address === 'get' ) {
      this.port.postMessage({ address:'return', idx:event.data.idx, value:this.memory[event.data.idx] })     
    }
  }

  deserialize( __arg ) {
    const arg = JSON.parse( __arg )
    const obj = {}
    for( let key in arg ) {
      if( typeof arg[ key ] === 'string' ) {
        obj[ key ] = eval( arg[key] )
      }else{
        obj[ key ] = arg[ key ]
      }
    }
    return obj
  }

  process(inputs, outputs, parameters) {
    if( initialized === true ) {
      const gibberish = Gibberish
      const scheduler = gibberish.scheduler
      let   callback  = this.callback
      let   ugens     = gibberish.callbackUgens 

      let callbacklength = gibberish.blockCallbacks.length

      if( callbacklength !== 0 ) {
        for( let i=0; i< callbacklength; i++ ) {
          gibberish.blockCallbacks[ i ]()
        }

        // can't just set length to 0 as callbacks might be added during for loop,
        // so splice pre-existing functions
        gibberish.blockCallbacks.splice( 0, callbacklength )
      }

      let outputChannel = outputs[ 0 ][ 0 ]
      for (let i = 0; i < outputChannel.length; ++i) {
        scheduler.tick()

        if( gibberish.graphIsDirty ) {
          this.callback = callback = gibberish.generateCallback()
          ugens = gibberish.callbackUgens
        }
        outputChannel[ i ] = callback.apply( null, ugens )[0]
      }

    }

    // make sure this is always returned or the callback ceases!!!
    return true
  }
}
window.Gibberish.workletProcessor = GibberishProcessor 
           registerProcessor( 'gibberish', window.Gibberish.workletProcessor );

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Gibberish = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'abs',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.abs })

      out = `gen.abs( ${inputs[0]} )`

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

    gen.closures.add({ [ this.name ]: this }) 

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
    
    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'acos': Math.acos })

      out = `gen.acos( ${inputs[0]} )` 

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
    memo     = require( './memo.js' )

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

  out.isComplete = ()=> gen.memory.heap[ completeFlag.memory.values.idx ]

  out.trigger = ()=> {
    gen.memory.heap[ completeFlag.memory.values.idx ] = 0
    _bang.trigger()
  }

  return out 
}

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":30,"./gte.js":32,"./ifelseif.js":35,"./lt.js":38,"./memo.js":42,"./mul.js":48,"./neq.js":49,"./peek.js":54,"./poke.js":56,"./sub.js":65}],5:[function(require,module,exports){
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
   
  out.trigger = ()=> {
    shouldSustain.value = 1
    envTrigger.trigger()
  }

  out.isComplete = ()=> gen.memory.heap[ completeFlag.memory.values.idx ]

  out.release = ()=> {
    shouldSustain.value = 0
    // XXX pretty nasty... grabs accum inside of gtp and resets value manually
    // unfortunately envTrigger won't work as it's back to 0 by the time the release block is triggered...
    gen.memory.heap[ releaseAccum.inputs[0].inputs[1].memory.value.idx ] = 0
  }

  return out 
}

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":30,"./gtp.js":33,"./ifelseif.js":35,"./lt.js":38,"./mul.js":48,"./neq.js":49,"./not.js":51,"./param.js":53,"./peek.js":54,"./poke.js":56,"./sub.js":65}],7:[function(require,module,exports){
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
    
    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'asin': Math.asin })

      out = `gen.asin( ${inputs[0]} )` 

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
    
    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'atan': Math.atan })

      out = `gen.atan( ${inputs[0]} )` 

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

},{"./gen.js":30,"./history.js":34,"./mul.js":48,"./sub.js":65}],11:[function(require,module,exports){
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

  ugen.trigger = () => {
    gen.memory.heap[ ugen.memory.value.idx ] = ugen.max 
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

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.ceil })

      out = `gen.ceil( ${inputs[0]} )`

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

},{"./floor.js":27,"./gen.js":30,"./memo.js":42,"./sub.js":65}],15:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'cos',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'cos': Math.cos })

      out = `gen.cos( ${inputs[0]} )` 

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

    gen.closures.add({ [ this.name ]: this }) 

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

},{"./gen.js":30,"./peek.js":54,"./poke.js":56,"./utilities.js":71}],19:[function(require,module,exports){
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

},{"./add.js":5,"./gen.js":30,"./history.js":34,"./memo.js":42,"./mul.js":48,"./sub.js":65}],20:[function(require,module,exports){
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

},{"./gen.js":30,"./history.js":34,"./mul.js":48,"./t60.js":67}],21:[function(require,module,exports){
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

},{"./accum.js":2,"./data.js":18,"./gen.js":30,"./memo.js":42,"./peek.js":54,"./poke.js":56,"./sub.js":65,"./wrap.js":73}],22:[function(require,module,exports){
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

},{"./gen.js":30,"./history.js":34,"./sub.js":65}],23:[function(require,module,exports){
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

},{"./data":18,"./gen":30,"./peek":54,"./phasor":55,"./windows":72}],25:[function(require,module,exports){
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

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.exp })

      out = `gen.exp( ${inputs[0]} )`

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
  
  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
   */

  closures: new Set(),
  params:   new Set(),

  parameters:[],
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
    const mem = MemoryHelper.create( amount, type )
    return mem
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
  
  createCallback( ugen, mem, debug = false, shouldInlineMemory=false, memType = Float32Array ) {
    let isStereo = Array.isArray( ugen ) && ugen.length > 1,
        callback, 
        channel1, channel2

    if( typeof mem === 'number' || mem === undefined ) {
      mem = MemoryHelper.create( mem, memType )
    }
    
    //console.log( 'cb memory:', mem )
    this.memory = mem
    this.memo = {} 
    this.endBlock.clear()
    this.closures.clear()
    this.params.clear()
    //this.globals = { windows:{} }
    
    this.parameters.length = 0
    
    this.functionBody = "  'use strict'\n"
    if( shouldInlineMemory===false ) this.functionBody += "  var memory = gen.memory\n\n" 

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
      body[ lastidx ] = '  gen.out[' + i + ']  = ' + body[ lastidx ] + '\n'

      this.functionBody += body.join('\n')
    }
    
    this.histories.forEach( value => {
      if( value !== null )
        value.gen()      
    })

    let returnStatement = isStereo ? '  return gen.out' : '  return gen.out[0]'
    
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
      this.parameters.push( 'memory' )
    }
    let buildString = `return function gen( ${ this.parameters.join(',') } ){ \n${ this.functionBody }\n}`
    
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

    callback.data = this.data
    callback.out  = new Float32Array( 2 )
    callback.parameters = this.parameters.slice( 0 )

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

},{"memory-helper":138}],31:[function(require,module,exports){
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
    gen.parameters.push( this.name )
    
    gen.memo[ this.name ] = this.name

    return this.name
  } 
}

module.exports = ( name ) => {
  let input = Object.create( proto )

  input.id   = gen.getUID()
  input.name = name !== undefined ? name : `${input.basename}${input.id}`
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

let library = {
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
  exp:      require( './exp.js' )
}

library.gen.lib = library

module.exports = library

},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./ad.js":4,"./add.js":5,"./adsr.js":6,"./and.js":7,"./asin.js":8,"./atan.js":9,"./attack.js":10,"./bang.js":11,"./bool.js":12,"./ceil.js":13,"./clamp.js":14,"./cos.js":15,"./counter.js":16,"./cycle.js":17,"./data.js":18,"./dcblock.js":19,"./decay.js":20,"./delay.js":21,"./delta.js":22,"./div.js":23,"./env.js":24,"./eq.js":25,"./exp.js":26,"./floor.js":27,"./fold.js":28,"./gate.js":29,"./gen.js":30,"./gt.js":31,"./gte.js":32,"./gtp.js":33,"./history.js":34,"./ifelseif.js":35,"./in.js":36,"./lt.js":38,"./lte.js":39,"./ltp.js":40,"./max.js":41,"./memo.js":42,"./min.js":43,"./mix.js":44,"./mod.js":45,"./mstosamps.js":46,"./mtof.js":47,"./mul.js":48,"./neq.js":49,"./noise.js":50,"./not.js":51,"./pan.js":52,"./param.js":53,"./peek.js":54,"./phasor.js":55,"./poke.js":56,"./pow.js":57,"./rate.js":58,"./round.js":59,"./sah.js":60,"./selector.js":61,"./sign.js":62,"./sin.js":63,"./slide.js":64,"./sub.js":65,"./switch.js":66,"./t60.js":67,"./tan.js":68,"./tanh.js":69,"./train.js":70,"./utilities.js":71,"./windows.js":72,"./wrap.js":73}],38:[function(require,module,exports){
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

    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
      gen.closures.add({ [ this.name ]: Math.max })

      out = `gen.max( ${inputs[0]}, ${inputs[1]} )`

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

    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
      gen.closures.add({ [ this.name ]: Math.min })

      out = `gen.min( ${inputs[0]}, ${inputs[1]} )`

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

},{"./add.js":5,"./gen.js":30,"./memo.js":42,"./mul.js":48,"./sub.js":65}],45:[function(require,module,exports){
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

    gen.closures.add({ 'noise' : Math.random })

    out = `  var ${this.name} = gen.noise()\n`
    
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
    
    gen.params.add({ [this.name]: this })

    this.value = this.initialValue

    gen.memo[ this.name ] = `memory[${this.memory.value.idx}]`

    return gen.memo[ this.name ]
  } 
}

module.exports = ( propName=0, value=0 ) => {
  let ugen = Object.create( proto )
  
  if( typeof propName !== 'string' ) {
    ugen.name = ugen.basename + gen.getUID()
    ugen.initialValue = propName
  }else{
    ugen.name = propName
    ugen.initialValue = value
  }

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
      ${this.name}_phase = ${this.mode === 'samples' ? inputs[0] : inputs[0] + ' * ' + (this.data.buffer.length - 1) }, 
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

},{"./gen.js":30,"./mul.js":48,"./wrap.js":73}],57:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'pow',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
      gen.closures.add({ 'pow': Math.pow })

      out = `gen.pow( ${inputs[0]}, ${inputs[1]} )` 

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

},{"./add.js":5,"./delta.js":22,"./gen.js":30,"./history.js":34,"./memo.js":42,"./mul.js":48,"./sub.js":65,"./wrap.js":73}],59:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'round',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.round })

      out = `gen.round( ${inputs[0]} )`

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
    
    gen.memo[ this.name ] = `gen.data.${this.name}`

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

let gen  = require('./gen.js')

let proto = {
  name:'sign',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.sign })

      out = `gen.sign( ${inputs[0]} )`

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

},{"./gen.js":30}],63:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'sin',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'sin': Math.sin })

      out = `gen.sin( ${inputs[0]} )` 

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

},{"./gen.js":30}],64:[function(require,module,exports){
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

},{"./add.js":5,"./div.js":23,"./gen.js":30,"./gt.js":31,"./history.js":34,"./memo.js":42,"./mul.js":48,"./sub.js":65,"./switch.js":66}],65:[function(require,module,exports){
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

},{"./gen.js":30}],66:[function(require,module,exports){
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

},{"./gen.js":30}],67:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'t60',

  gen() {
    let out,
        inputs = gen.getInputs( this ),
        returnValue

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ 'exp' ]: Math.exp })

      out = `  var ${this.name} = gen.exp( -6.907755278921 / ${inputs[0]} )\n\n`
     
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

},{"./gen.js":30}],68:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'tan',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'tan': Math.tan })

      out = `gen.tan( ${inputs[0]} )` 

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

},{"./gen.js":30}],69:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'tanh',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'tanh': Math.tanh })

      out = `gen.tanh( ${inputs[0]} )` 

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

},{"./gen.js":30}],70:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    lt      = require( './lt.js' ),
    phasor  = require( './phasor.js' )

module.exports = ( frequency=440, pulsewidth=.5 ) => {
  let graph = lt( accum( div( frequency, 44100 ) ), .5 )

  graph.name = `train${gen.getUID()}`

  return graph
}


},{"./gen.js":30,"./lt.js":38,"./phasor.js":55}],71:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' ),
    data = require( './data.js' )

let isStereo = false

let utilities = {
  ctx: null,

  clear() {
    this.callback = () => 0
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

},{"./data.js":18,"./gen.js":30}],72:[function(require,module,exports){
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

},{}],73:[function(require,module,exports){
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

},{"./floor.js":27,"./gen.js":30,"./memo.js":42,"./sub.js":65}],74:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let analyzer = Object.create( ugen )

Object.assign( analyzer, {
  __type__: 'analyzer',
})

module.exports = analyzer

},{"../ugen.js":134}],75:[function(require,module,exports){
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

},{"./follow.js":76,"./singlesampledelay.js":77}],76:[function(require,module,exports){
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
},{"../ugen.js":134,"./analyzer.js":74,"genish.js":37}],77:[function(require,module,exports){
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

},{"../ugen.js":134,"./analyzer.js":74,"genish.js":37}],78:[function(require,module,exports){
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

},{"../ugen.js":134,"genish.js":37}],79:[function(require,module,exports){
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

},{"../ugen.js":134,"genish.js":37}],80:[function(require,module,exports){
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

},{"./ad.js":78,"./adsr.js":79,"./ramp.js":81,"genish.js":37}],81:[function(require,module,exports){
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

},{"../ugen.js":134,"genish.js":37}],82:[function(require,module,exports){
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

},{}],83:[function(require,module,exports){
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

},{"genish.js":37}],84:[function(require,module,exports){
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


},{"./filter.js":87,"genish.js":37}],85:[function(require,module,exports){
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

},{"genish.js":37}],86:[function(require,module,exports){
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

},{"./filter.js":87,"genish.js":37}],87:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let filter = Object.create( ugen )

Object.assign( filter, {
  defaults: { bypass:false } 
})

module.exports = filter

},{"../ugen.js":134}],88:[function(require,module,exports){
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


},{"./filter.js":87,"genish.js":37}],89:[function(require,module,exports){
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

},{"./allpass.js":83,"./biquad.js":84,"./combfilter.js":85,"./diodeFilterZDF.js":86,"./filter24.js":88,"./ladderFilterZeroDelay.js":90,"./svf.js":91}],90:[function(require,module,exports){
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


},{"./filter.js":87,"genish.js":37}],91:[function(require,module,exports){
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


},{"./filter.js":87,"genish.js":37}],92:[function(require,module,exports){
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

},{"./effect.js":98,"genish.js":37}],93:[function(require,module,exports){
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

},{"./effect.js":98,"genish.js":37}],94:[function(require,module,exports){
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

},{"./effect.js":98,"genish.js":37}],95:[function(require,module,exports){
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
},{"./effect.js":98,"genish.js":37}],96:[function(require,module,exports){
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

},{"./effect.js":98,"genish.js":37}],97:[function(require,module,exports){
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
},{"./effect.js":98,"genish.js":37}],98:[function(require,module,exports){
let ugen = require( '../ugen.js' )

let effect = Object.create( ugen )

Object.assign( effect, {
  defaults: { bypass:false }
})

module.exports = effect

},{"../ugen.js":134}],99:[function(require,module,exports){
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

},{"./bitCrusher.js":92,"./bufferShuffler.js":93,"./chorus.js":94,"./dattorro.js":95,"./delay.js":96,"./distortion.js":97,"./flanger.js":100,"./freeverb.js":101,"./ringMod.js":102,"./tremolo.js":103,"./vibrato.js":104}],100:[function(require,module,exports){
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

},{"./effect.js":98,"genish.js":37}],101:[function(require,module,exports){
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


},{"./effect.js":98,"genish.js":37}],102:[function(require,module,exports){
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

},{"./effect.js":98,"genish.js":37}],103:[function(require,module,exports){
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

},{"./effect.js":98,"genish.js":37}],104:[function(require,module,exports){
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

},{"./effect.js":98,"genish.js":37}],105:[function(require,module,exports){
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

  init( memAmount, ctx ) {
    let numBytes = isNaN( memAmount ) ? 20 * 60 * 44100 : memAmount

    this.memory = MemoryHelper.create( numBytes )

    this.load()
    
    this.output = this.Bus2()

    this.utilities.createContext( ctx, this.utilities.createScriptProcessor.bind( this.utilities ) )

    this.analyzers.dirty = false

    // XXX FOR DEVELOPMENT AND TESTING ONLY... REMOVE FOR PRODUCTION
    this.export( window )
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
      keys = ugen.binop || ugen.type === 'bus' || ugen.type === 'analysis' ? Object.keys( ugen.inputs ) : Object.keys( ugen.inputNames )

      //}catch( e ){

      //  console.log( e )
      //  err = true
      //}
      //console.log( 'keys:', ugen.inputs, keys.length )

      
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

},{"./analysis/analyzers.js":75,"./envelopes/envelopes.js":80,"./filters/filters.js":89,"./fx/effect.js":98,"./fx/effects.js":99,"./instruments/instrument.js":110,"./instruments/instruments.js":111,"./instruments/polyMixin.js":115,"./instruments/polytemplate.js":116,"./misc/binops.js":120,"./misc/bus.js":121,"./misc/bus2.js":122,"./misc/monops.js":123,"./misc/panner.js":124,"./misc/time.js":125,"./oscillators/oscillators.js":128,"./scheduling/scheduler.js":131,"./scheduling/seq2.js":132,"./scheduling/sequencer.js":133,"./ugen.js":134,"./ugenTemplate.js":135,"./utilities.js":136,"genish.js":37,"memory-helper":138}],106:[function(require,module,exports){
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

},{"./instrument.js":110,"genish.js":37}],107:[function(require,module,exports){
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

},{"./instrument.js":110,"genish.js":37}],108:[function(require,module,exports){
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

    let props = Object.assign( syn, FM.defaults, inputProps )

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

},{"./instrument.js":110,"genish.js":37}],109:[function(require,module,exports){
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

},{"./instrument.js":110,"genish.js":37}],110:[function(require,module,exports){
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

},{"../ugen.js":134,"genish.js":37}],111:[function(require,module,exports){
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

},{"./conga.js":106,"./cowbell.js":107,"./fm.js":108,"./hat.js":109,"./karplusstrong.js":112,"./kick.js":113,"./monosynth.js":114,"./sampler.js":117,"./snare.js":118,"./synth.js":119}],112:[function(require,module,exports){
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

},{"./instrument.js":110,"genish.js":37}],113:[function(require,module,exports){
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

},{"./instrument.js":110,"genish.js":37}],114:[function(require,module,exports){
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

    const props = Object.assign( syn, Synth.defaults, argumentProps )

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

},{"../oscillators/fmfeedbackosc.js":127,"./instrument.js":110,"genish.js":37}],115:[function(require,module,exports){
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

},{}],116:[function(require,module,exports){
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

},{"genish.js":37}],117:[function(require,module,exports){
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

},{"./instrument.js":110,"genish.js":37}],118:[function(require,module,exports){
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

},{"./instrument.js":110,"genish.js":37}],119:[function(require,module,exports){
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

    const props = Object.assign( syn, Synth.defaults, inputProps )

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

    Gibberish.factory( syn, syn.graph, 'synth', props  )

    return syn
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

},{"./instrument.js":110,"genish.js":37}],120:[function(require,module,exports){
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

},{"../ugen.js":134}],121:[function(require,module,exports){
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


},{"../ugen.js":134,"genish.js":37}],122:[function(require,module,exports){
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
          inputs:[]
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


},{"../ugen.js":134,"genish.js":37}],123:[function(require,module,exports){
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

},{"../ugen.js":134,"genish.js":37}],124:[function(require,module,exports){
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
    console.log( input[0], input[1] )
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

},{"../ugen.js":134,"genish.js":37}],125:[function(require,module,exports){
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

},{}],126:[function(require,module,exports){
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
},{"genish.js":37}],127:[function(require,module,exports){
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

},{"genish.js":37}],128:[function(require,module,exports){
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

},{"../ugen.js":134,"./brownnoise.js":126,"./fmfeedbackosc.js":127,"./pinknoise.js":129,"./wavetable.js":130,"genish.js":37}],129:[function(require,module,exports){
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
},{"genish.js":37}],130:[function(require,module,exports){
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

},{"../ugen.js":134,"genish.js":37}],131:[function(require,module,exports){
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

},{"../external/priorityqueue.js":82,"big.js":137}],132:[function(require,module,exports){
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


},{"../ugen.js":134,"genish.js":37}],133:[function(require,module,exports){
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

},{"../external/priorityqueue.js":82,"big.js":137}],134:[function(require,module,exports){
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

},{}],135:[function(require,module,exports){
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

},{}],136:[function(require,module,exports){
let genish = require( 'genish.js' )

module.exports = function( Gibberish ) {

let utilities = {
  createContext( ctx, cb ) {
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

      if( typeof cb === 'function' ) cb()
    }

    if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
      window.addEventListener( 'touchstart', start )
    }else{
      window.addEventListener( 'mousedown', start )
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

},{"genish.js":37}],137:[function(require,module,exports){
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

},{}],138:[function(require,module,exports){
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

},{}]},{},[105])(105)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9nZW5pc2guanMvanMvYWJzLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2FjY3VtLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Fjb3MuanMiLCIuLi9nZW5pc2guanMvanMvYWQuanMiLCIuLi9nZW5pc2guanMvanMvYWRkLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Fkc3IuanMiLCIuLi9nZW5pc2guanMvanMvYW5kLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2FzaW4uanMiLCIuLi9nZW5pc2guanMvanMvYXRhbi5qcyIsIi4uL2dlbmlzaC5qcy9qcy9hdHRhY2suanMiLCIuLi9nZW5pc2guanMvanMvYmFuZy5qcyIsIi4uL2dlbmlzaC5qcy9qcy9ib29sLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2NlaWwuanMiLCIuLi9nZW5pc2guanMvanMvY2xhbXAuanMiLCIuLi9nZW5pc2guanMvanMvY29zLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2NvdW50ZXIuanMiLCIuLi9nZW5pc2guanMvanMvY3ljbGUuanMiLCIuLi9nZW5pc2guanMvanMvZGF0YS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9kY2Jsb2NrLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2RlY2F5LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2RlbGF5LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2RlbHRhLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Rpdi5qcyIsIi4uL2dlbmlzaC5qcy9qcy9lbnYuanMiLCIuLi9nZW5pc2guanMvanMvZXEuanMiLCIuLi9nZW5pc2guanMvanMvZXhwLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Zsb29yLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2ZvbGQuanMiLCIuLi9nZW5pc2guanMvanMvZ2F0ZS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9nZW4uanMiLCIuLi9nZW5pc2guanMvanMvZ3QuanMiLCIuLi9nZW5pc2guanMvanMvZ3RlLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2d0cC5qcyIsIi4uL2dlbmlzaC5qcy9qcy9oaXN0b3J5LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2lmZWxzZWlmLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2luLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2luZGV4LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2x0LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2x0ZS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9sdHAuanMiLCIuLi9nZW5pc2guanMvanMvbWF4LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL21lbW8uanMiLCIuLi9nZW5pc2guanMvanMvbWluLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL21peC5qcyIsIi4uL2dlbmlzaC5qcy9qcy9tb2QuanMiLCIuLi9nZW5pc2guanMvanMvbXN0b3NhbXBzLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL210b2YuanMiLCIuLi9nZW5pc2guanMvanMvbXVsLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL25lcS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9ub2lzZS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9ub3QuanMiLCIuLi9nZW5pc2guanMvanMvcGFuLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3BhcmFtLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3BlZWsuanMiLCIuLi9nZW5pc2guanMvanMvcGhhc29yLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3Bva2UuanMiLCIuLi9nZW5pc2guanMvanMvcG93LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3JhdGUuanMiLCIuLi9nZW5pc2guanMvanMvcm91bmQuanMiLCIuLi9nZW5pc2guanMvanMvc2FoLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3NlbGVjdG9yLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3NpZ24uanMiLCIuLi9nZW5pc2guanMvanMvc2luLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3NsaWRlLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3N1Yi5qcyIsIi4uL2dlbmlzaC5qcy9qcy9zd2l0Y2guanMiLCIuLi9nZW5pc2guanMvanMvdDYwLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3Rhbi5qcyIsIi4uL2dlbmlzaC5qcy9qcy90YW5oLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3RyYWluLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3V0aWxpdGllcy5qcyIsIi4uL2dlbmlzaC5qcy9qcy93aW5kb3dzLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3dyYXAuanMiLCJqcy9hbmFseXNpcy9hbmFseXplci5qcyIsImpzL2FuYWx5c2lzL2FuYWx5emVycy5qcyIsImpzL2FuYWx5c2lzL2ZvbGxvdy5qcyIsImpzL2FuYWx5c2lzL3NpbmdsZXNhbXBsZWRlbGF5LmpzIiwianMvZW52ZWxvcGVzL2FkLmpzIiwianMvZW52ZWxvcGVzL2Fkc3IuanMiLCJqcy9lbnZlbG9wZXMvZW52ZWxvcGVzLmpzIiwianMvZW52ZWxvcGVzL3JhbXAuanMiLCJqcy9leHRlcm5hbC9wcmlvcml0eXF1ZXVlLmpzIiwianMvZmlsdGVycy9hbGxwYXNzLmpzIiwianMvZmlsdGVycy9iaXF1YWQuanMiLCJqcy9maWx0ZXJzL2NvbWJmaWx0ZXIuanMiLCJqcy9maWx0ZXJzL2Rpb2RlRmlsdGVyWkRGLmpzIiwianMvZmlsdGVycy9maWx0ZXIuanMiLCJqcy9maWx0ZXJzL2ZpbHRlcjI0LmpzIiwianMvZmlsdGVycy9maWx0ZXJzLmpzIiwianMvZmlsdGVycy9sYWRkZXJGaWx0ZXJaZXJvRGVsYXkuanMiLCJqcy9maWx0ZXJzL3N2Zi5qcyIsImpzL2Z4L2JpdENydXNoZXIuanMiLCJqcy9meC9idWZmZXJTaHVmZmxlci5qcyIsImpzL2Z4L2Nob3J1cy5qcyIsImpzL2Z4L2RhdHRvcnJvLmpzIiwianMvZngvZGVsYXkuanMiLCJqcy9meC9kaXN0b3J0aW9uLmpzIiwianMvZngvZWZmZWN0LmpzIiwianMvZngvZWZmZWN0cy5qcyIsImpzL2Z4L2ZsYW5nZXIuanMiLCJqcy9meC9mcmVldmVyYi5qcyIsImpzL2Z4L3JpbmdNb2QuanMiLCJqcy9meC90cmVtb2xvLmpzIiwianMvZngvdmlicmF0by5qcyIsImpzL2luZGV4LmpzIiwianMvaW5zdHJ1bWVudHMvY29uZ2EuanMiLCJqcy9pbnN0cnVtZW50cy9jb3diZWxsLmpzIiwianMvaW5zdHJ1bWVudHMvZm0uanMiLCJqcy9pbnN0cnVtZW50cy9oYXQuanMiLCJqcy9pbnN0cnVtZW50cy9pbnN0cnVtZW50LmpzIiwianMvaW5zdHJ1bWVudHMvaW5zdHJ1bWVudHMuanMiLCJqcy9pbnN0cnVtZW50cy9rYXJwbHVzc3Ryb25nLmpzIiwianMvaW5zdHJ1bWVudHMva2ljay5qcyIsImpzL2luc3RydW1lbnRzL21vbm9zeW50aC5qcyIsImpzL2luc3RydW1lbnRzL3BvbHlNaXhpbi5qcyIsImpzL2luc3RydW1lbnRzL3BvbHl0ZW1wbGF0ZS5qcyIsImpzL2luc3RydW1lbnRzL3NhbXBsZXIuanMiLCJqcy9pbnN0cnVtZW50cy9zbmFyZS5qcyIsImpzL2luc3RydW1lbnRzL3N5bnRoLmpzIiwianMvbWlzYy9iaW5vcHMuanMiLCJqcy9taXNjL2J1cy5qcyIsImpzL21pc2MvYnVzMi5qcyIsImpzL21pc2MvbW9ub3BzLmpzIiwianMvbWlzYy9wYW5uZXIuanMiLCJqcy9taXNjL3RpbWUuanMiLCJqcy9vc2NpbGxhdG9ycy9icm93bm5vaXNlLmpzIiwianMvb3NjaWxsYXRvcnMvZm1mZWVkYmFja29zYy5qcyIsImpzL29zY2lsbGF0b3JzL29zY2lsbGF0b3JzLmpzIiwianMvb3NjaWxsYXRvcnMvcGlua25vaXNlLmpzIiwianMvb3NjaWxsYXRvcnMvd2F2ZXRhYmxlLmpzIiwianMvc2NoZWR1bGluZy9zY2hlZHVsZXIuanMiLCJqcy9zY2hlZHVsaW5nL3NlcTIuanMiLCJqcy9zY2hlZHVsaW5nL3NlcXVlbmNlci5qcyIsImpzL3VnZW4uanMiLCJqcy91Z2VuVGVtcGxhdGUuanMiLCJqcy91dGlsaXRpZXMuanMiLCJub2RlX21vZHVsZXMvYmlnLmpzL2JpZy5qcyIsIi4uL21lbW9yeS1oZWxwZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25TQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0bkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2FicycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmFicyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmFicyggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hYnMoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhYnMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWJzLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGFic1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhY2N1bScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keVxuXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB0aGlzLmluaXRpYWxWYWx1ZVxuXG4gICAgZnVuY3Rpb25Cb2R5ID0gdGhpcy5jYWxsYmFjayggZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAgKVxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuICAgIFxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGNhbGxiYWNrKCBfbmFtZSwgX2luY3IsIF9yZXNldCwgdmFsdWVSZWYgKSB7XG4gICAgbGV0IGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSAnJyxcbiAgICAgICAgd3JhcCA9ICcnXG4gICAgXG4gICAgLyogdGhyZWUgZGlmZmVyZW50IG1ldGhvZHMgb2Ygd3JhcHBpbmcsIHRoaXJkIGlzIG1vc3QgZXhwZW5zaXZlOlxuICAgICAqXG4gICAgICogMTogcmFuZ2UgezAsMX06IHkgPSB4IC0gKHggfCAwKVxuICAgICAqIDI6IGxvZzIodGhpcy5tYXgpID09IGludGVnZXI6IHkgPSB4ICYgKHRoaXMubWF4IC0gMSlcbiAgICAgKiAzOiBhbGwgb3RoZXJzOiBpZiggeCA+PSB0aGlzLm1heCApIHkgPSB0aGlzLm1heCAteFxuICAgICAqXG4gICAgICovXG5cbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzFdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1sxXSA8IDEpICkgeyBcbiAgICAgIGlmKCB0aGlzLnJlc2V0VmFsdWUgIT09IHRoaXMubWluICkge1xuXG4gICAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLnJlc2V0VmFsdWV9XFxuXFxuYFxuICAgICAgICAvL291dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLm1pbn1cXG5cXG5gXG4gICAgICB9ZWxzZXtcbiAgICAgICAgb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMubWlufVxcblxcbmBcbiAgICAgICAgLy9vdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PTEgKSAke3ZhbHVlUmVmfSA9ICR7dGhpcy5pbml0aWFsVmFsdWV9XFxuXFxuYFxuICAgICAgfVxuICAgIH1cblxuICAgIG91dCArPSBgICB2YXIgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHt2YWx1ZVJlZn1cXG5gXG4gICAgXG4gICAgaWYoIHRoaXMuc2hvdWxkV3JhcCA9PT0gZmFsc2UgJiYgdGhpcy5zaG91bGRDbGFtcCA9PT0gdHJ1ZSApIHtcbiAgICAgIG91dCArPSBgICBpZiggJHt2YWx1ZVJlZn0gPCAke3RoaXMubWF4IH0gKSAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmBcbiAgICB9ZWxzZXtcbiAgICAgIG91dCArPSBgICAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmAgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuICAgIH1cblxuICAgIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgICYmIHRoaXMuc2hvdWxkV3JhcE1heCApIHdyYXAgKz0gYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICkgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxcbmBcbiAgICBpZiggdGhpcy5taW4gIT09IC1JbmZpbml0eSAmJiB0aGlzLnNob3VsZFdyYXBNaW4gKSB3cmFwICs9IGAgIGlmKCAke3ZhbHVlUmVmfSA8ICR7dGhpcy5taW59ICkgJHt2YWx1ZVJlZn0gKz0gJHtkaWZmfVxcbmBcblxuICAgIC8vaWYoIHRoaXMubWluID09PSAwICYmIHRoaXMubWF4ID09PSAxICkgeyBcbiAgICAvLyAgd3JhcCA9ICBgICAke3ZhbHVlUmVmfSA9ICR7dmFsdWVSZWZ9IC0gKCR7dmFsdWVSZWZ9IHwgMClcXG5cXG5gXG4gICAgLy99IGVsc2UgaWYoIHRoaXMubWluID09PSAwICYmICggTWF0aC5sb2cyKCB0aGlzLm1heCApIHwgMCApID09PSBNYXRoLmxvZzIoIHRoaXMubWF4ICkgKSB7XG4gICAgLy8gIHdyYXAgPSAgYCAgJHt2YWx1ZVJlZn0gPSAke3ZhbHVlUmVmfSAmICgke3RoaXMubWF4fSAtIDEpXFxuXFxuYFxuICAgIC8vfSBlbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgKXtcbiAgICAvLyAgd3JhcCA9IGAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSApICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cXG5cXG5gXG4gICAgLy99XG5cbiAgICBvdXQgPSBvdXQgKyB3cmFwICsgJ1xcbidcblxuICAgIHJldHVybiBvdXRcbiAgfSxcblxuICBkZWZhdWx0cyA6IHsgbWluOjAsIG1heDoxLCByZXNldFZhbHVlOjAsIGluaXRpYWxWYWx1ZTowLCBzaG91bGRXcmFwOnRydWUsIHNob3VsZFdyYXBNYXg6IHRydWUsIHNob3VsZFdyYXBNaW46dHJ1ZSwgc2hvdWxkQ2xhbXA6ZmFsc2UgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5jciwgcmVzZXQ9MCwgcHJvcGVydGllcyApID0+IHtcbiAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgICAgIFxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBcbiAgICB7IFxuICAgICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgICBpbnB1dHM6IFsgaW5jciwgcmVzZXQgXSxcbiAgICAgIG1lbW9yeToge1xuICAgICAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcHJvdG8uZGVmYXVsdHMsXG4gICAgcHJvcGVydGllcyBcbiAgKVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5zaG91bGRXcmFwTWF4ID09PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5zaG91bGRXcmFwTWluID09PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIHByb3BlcnRpZXMuc2hvdWxkV3JhcCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgdWdlbi5zaG91bGRXcmFwTWluID0gdWdlbi5zaG91bGRXcmFwTWF4ID0gcHJvcGVydGllcy5zaG91bGRXcmFwXG4gICAgfVxuICB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLnJlc2V0VmFsdWUgPT09IHVuZGVmaW5lZCApIHtcbiAgICB1Z2VuLnJlc2V0VmFsdWUgPSB1Z2VuLm1pblxuICB9XG5cbiAgaWYoIHVnZW4uaW5pdGlhbFZhbHVlID09PSB1bmRlZmluZWQgKSB1Z2VuLmluaXRpYWxWYWx1ZSA9IHVnZW4ubWluXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkgIHsgXG4gICAgICAvL2NvbnNvbGUubG9nKCAnZ2VuOicsIGdlbiwgZ2VuLm1lbW9yeSApXG4gICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSBcbiAgICB9LFxuICAgIHNldCh2KSB7IGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IH1cbiAgfSlcblxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Fjb3MnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhY29zJzogTWF0aC5hY29zIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uYWNvcyggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYWNvcyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFjb3MgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWNvcy5pbnB1dHMgPSBbIHggXVxuICBhY29zLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFjb3MubmFtZSA9IGAke2Fjb3MuYmFzZW5hbWV9e2Fjb3MuaWR9YFxuXG4gIHJldHVybiBhY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIG11bCAgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGRpdiAgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIGRhdGEgICAgID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrICAgICA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgYWNjdW0gICAgPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBpZmVsc2UgICA9IHJlcXVpcmUoICcuL2lmZWxzZWlmLmpzJyApLFxuICAgIGx0ICAgICAgID0gcmVxdWlyZSggJy4vbHQuanMnICksXG4gICAgYmFuZyAgICAgPSByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICAgIGVudiAgICAgID0gcmVxdWlyZSggJy4vZW52LmpzJyApLFxuICAgIGFkZCAgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIHBva2UgICAgID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgICBuZXEgICAgICA9IHJlcXVpcmUoICcuL25lcS5qcycgKSxcbiAgICBhbmQgICAgICA9IHJlcXVpcmUoICcuL2FuZC5qcycgKSxcbiAgICBndGUgICAgICA9IHJlcXVpcmUoICcuL2d0ZS5qcycgKSxcbiAgICBtZW1vICAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGF0dGFja1RpbWUgPSA0NDEwMCwgZGVjYXlUaW1lID0gNDQxMDAsIF9wcm9wcyApID0+IHtcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNoYXBlOidleHBvbmVudGlhbCcsIGFscGhhOjUsIHRyaWdnZXI6bnVsbCB9LCBfcHJvcHMgKVxuICBjb25zdCBfYmFuZyA9IHByb3BzLnRyaWdnZXIgIT09IG51bGwgPyBwcm9wcy50cmlnZ2VyIDogYmFuZygpLFxuICAgICAgICBwaGFzZSA9IGFjY3VtKCAxLCBfYmFuZywgeyBtaW46MCwgbWF4OiBJbmZpbml0eSwgaW5pdGlhbFZhbHVlOi1JbmZpbml0eSwgc2hvdWxkV3JhcDpmYWxzZSB9KVxuICAgICAgXG4gIGxldCBidWZmZXJEYXRhLCBidWZmZXJEYXRhUmV2ZXJzZSwgZGVjYXlEYXRhLCBvdXQsIGJ1ZmZlclxuXG4gIC8vY29uc29sZS5sb2coICdzaGFwZTonLCBwcm9wcy5zaGFwZSwgJ2F0dGFjayB0aW1lOicsIGF0dGFja1RpbWUsICdkZWNheSB0aW1lOicsIGRlY2F5VGltZSApXG4gIGxldCBjb21wbGV0ZUZsYWcgPSBkYXRhKCBbMF0gKVxuICBcbiAgLy8gc2xpZ2h0bHkgbW9yZSBlZmZpY2llbnQgdG8gdXNlIGV4aXN0aW5nIHBoYXNlIGFjY3VtdWxhdG9yIGZvciBsaW5lYXIgZW52ZWxvcGVzXG4gIGlmKCBwcm9wcy5zaGFwZSA9PT0gJ2xpbmVhcicgKSB7XG4gICAgb3V0ID0gaWZlbHNlKCBcbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksIGx0KCBwaGFzZSwgYXR0YWNrVGltZSApKSxcbiAgICAgIGRpdiggcGhhc2UsIGF0dGFja1RpbWUgKSxcblxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApICksXG4gICAgICBzdWIoIDEsIGRpdiggc3ViKCBwaGFzZSwgYXR0YWNrVGltZSApLCBkZWNheVRpbWUgKSApLFxuICAgICAgXG4gICAgICBuZXEoIHBoYXNlLCAtSW5maW5pdHkpLFxuICAgICAgcG9rZSggY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTowIH0pLFxuXG4gICAgICAwIFxuICAgIClcbiAgfSBlbHNlIHtcbiAgICBidWZmZXJEYXRhID0gZW52KHsgbGVuZ3RoOjEwMjQsIHR5cGU6cHJvcHMuc2hhcGUsIGFscGhhOnByb3BzLmFscGhhIH0pXG4gICAgYnVmZmVyRGF0YVJldmVyc2UgPSBlbnYoeyBsZW5ndGg6MTAyNCwgdHlwZTpwcm9wcy5zaGFwZSwgYWxwaGE6cHJvcHMuYWxwaGEsIHJldmVyc2U6dHJ1ZSB9KVxuXG4gICAgb3V0ID0gaWZlbHNlKCBcbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksIGx0KCBwaGFzZSwgYXR0YWNrVGltZSApICksIFxuICAgICAgcGVlayggYnVmZmVyRGF0YSwgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0gKSwgXG5cbiAgICAgIGFuZCggZ3RlKHBoYXNlLDApLCBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lICkgKSApLCBcbiAgICAgIHBlZWsoIGJ1ZmZlckRhdGFSZXZlcnNlLCBkaXYoIHN1YiggcGhhc2UsIGF0dGFja1RpbWUgKSwgZGVjYXlUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSksXG5cbiAgICAgIG5lcSggcGhhc2UsIC1JbmZpbml0eSApLFxuICAgICAgcG9rZSggY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTowIH0pLFxuXG4gICAgICAwXG4gICAgKVxuICB9XG5cbiAgb3V0LmlzQ29tcGxldGUgPSAoKT0+IGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF1cblxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF0gPSAwXG4gICAgX2JhbmcudHJpZ2dlcigpXG4gIH1cblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxuY29uc3QgcHJvdG8gPSB7IFxuICBiYXNlbmFtZTonYWRkJyxcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dD0nJyxcbiAgICAgICAgc3VtID0gMCwgbnVtQ291bnQgPSAwLCBhZGRlckF0RW5kID0gZmFsc2UsIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZVxuXG4gICAgaWYoIGlucHV0cy5sZW5ndGggPT09IDAgKSByZXR1cm4gMFxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGBcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaXNOYU4oIHYgKSApIHtcbiAgICAgICAgb3V0ICs9IHZcbiAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgIGFkZGVyQXRFbmQgPSB0cnVlXG4gICAgICAgICAgb3V0ICs9ICcgKyAnXG4gICAgICAgIH1cbiAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICAgIHN1bSArPSBwYXJzZUZsb2F0KCB2IClcbiAgICAgICAgbnVtQ291bnQrK1xuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiggbnVtQ291bnQgPiAwICkge1xuICAgICAgb3V0ICs9IGFkZGVyQXRFbmQgfHwgYWxyZWFkeUZ1bGxTdW1tZWQgPyBzdW0gOiAnICsgJyArIHN1bVxuICAgIH1cblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGNvbnN0IGFkZCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgYWRkLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFkZC5uYW1lID0gYWRkLmJhc2VuYW1lICsgYWRkLmlkXG4gIGFkZC5pbnB1dHMgPSBhcmdzXG5cbiAgcmV0dXJuIGFkZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBtdWwgICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBzdWIgICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBkaXYgICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgICBkYXRhICAgICA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayAgICAgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIGFjY3VtICAgID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgaWZlbHNlICAgPSByZXF1aXJlKCAnLi9pZmVsc2VpZi5qcycgKSxcbiAgICBsdCAgICAgICA9IHJlcXVpcmUoICcuL2x0LmpzJyApLFxuICAgIGJhbmcgICAgID0gcmVxdWlyZSggJy4vYmFuZy5qcycgKSxcbiAgICBlbnYgICAgICA9IHJlcXVpcmUoICcuL2Vudi5qcycgKSxcbiAgICBwYXJhbSAgICA9IHJlcXVpcmUoICcuL3BhcmFtLmpzJyApLFxuICAgIGFkZCAgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIGd0cCAgICAgID0gcmVxdWlyZSggJy4vZ3RwLmpzJyApLFxuICAgIG5vdCAgICAgID0gcmVxdWlyZSggJy4vbm90LmpzJyApLFxuICAgIGFuZCAgICAgID0gcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICAgIG5lcSAgICAgID0gcmVxdWlyZSggJy4vbmVxLmpzJyApLFxuICAgIHBva2UgICAgID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggYXR0YWNrVGltZT00NCwgZGVjYXlUaW1lPTIyMDUwLCBzdXN0YWluVGltZT00NDEwMCwgc3VzdGFpbkxldmVsPS42LCByZWxlYXNlVGltZT00NDEwMCwgX3Byb3BzICkgPT4ge1xuICBsZXQgZW52VHJpZ2dlciA9IGJhbmcoKSxcbiAgICAgIHBoYXNlID0gYWNjdW0oIDEsIGVudlRyaWdnZXIsIHsgbWF4OiBJbmZpbml0eSwgc2hvdWxkV3JhcDpmYWxzZSwgaW5pdGlhbFZhbHVlOkluZmluaXR5IH0pLFxuICAgICAgc2hvdWxkU3VzdGFpbiA9IHBhcmFtKCAxICksXG4gICAgICBkZWZhdWx0cyA9IHtcbiAgICAgICAgIHNoYXBlOiAnZXhwb25lbnRpYWwnLFxuICAgICAgICAgYWxwaGE6IDUsXG4gICAgICAgICB0cmlnZ2VyUmVsZWFzZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgX3Byb3BzICksXG4gICAgICBidWZmZXJEYXRhLCBkZWNheURhdGEsIG91dCwgYnVmZmVyLCBzdXN0YWluQ29uZGl0aW9uLCByZWxlYXNlQWNjdW0sIHJlbGVhc2VDb25kaXRpb25cblxuXG4gIGNvbnN0IGNvbXBsZXRlRmxhZyA9IGRhdGEoIFswXSApXG5cbiAgYnVmZmVyRGF0YSA9IGVudih7IGxlbmd0aDoxMDI0LCBhbHBoYTpwcm9wcy5hbHBoYSwgc2hpZnQ6MCwgdHlwZTpwcm9wcy5zaGFwZSB9KVxuXG4gIHN1c3RhaW5Db25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZSBcbiAgICA/IHNob3VsZFN1c3RhaW5cbiAgICA6IGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lICkgKVxuXG4gIHJlbGVhc2VBY2N1bSA9IHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgPyBndHAoIHN1Yiggc3VzdGFpbkxldmVsLCBhY2N1bSggZGl2KCBzdXN0YWluTGV2ZWwsIHJlbGVhc2VUaW1lICkgLCAwLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSkgKSwgMCApXG4gICAgOiBzdWIoIHN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSApICksIHJlbGVhc2VUaW1lICksIHN1c3RhaW5MZXZlbCApICksIFxuXG4gIHJlbGVhc2VDb25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZVxuICAgID8gbm90KCBzaG91bGRTdXN0YWluIClcbiAgICA6IGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lLCByZWxlYXNlVGltZSApIClcblxuICBvdXQgPSBpZmVsc2UoXG4gICAgLy8gYXR0YWNrIFxuICAgIGx0KCBwaGFzZSwgIGF0dGFja1RpbWUgKSwgXG4gICAgcGVlayggYnVmZmVyRGF0YSwgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0gKSwgXG5cbiAgICAvLyBkZWNheVxuICAgIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApLCBcbiAgICBwZWVrKCBidWZmZXJEYXRhLCBzdWIoIDEsIG11bCggZGl2KCBzdWIoIHBoYXNlLCAgYXR0YWNrVGltZSApLCAgZGVjYXlUaW1lICksIHN1YiggMSwgIHN1c3RhaW5MZXZlbCApICkgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSxcblxuICAgIC8vIHN1c3RhaW5cbiAgICBhbmQoIHN1c3RhaW5Db25kaXRpb24sIG5lcSggcGhhc2UsIEluZmluaXR5ICkgKSxcbiAgICBwZWVrKCBidWZmZXJEYXRhLCAgc3VzdGFpbkxldmVsICksXG5cbiAgICAvLyByZWxlYXNlXG4gICAgcmVsZWFzZUNvbmRpdGlvbiwgLy9sdCggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSArICByZWxlYXNlVGltZSApLFxuICAgIHBlZWsoIFxuICAgICAgYnVmZmVyRGF0YSxcbiAgICAgIHJlbGVhc2VBY2N1bSwgXG4gICAgICAvL3N1YiggIHN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSksICByZWxlYXNlVGltZSApLCAgc3VzdGFpbkxldmVsICkgKSwgXG4gICAgICB7IGJvdW5kbW9kZTonY2xhbXAnIH1cbiAgICApLFxuXG4gICAgbmVxKCBwaGFzZSwgSW5maW5pdHkgKSxcbiAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAwXG4gIClcbiAgIFxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNob3VsZFN1c3RhaW4udmFsdWUgPSAxXG4gICAgZW52VHJpZ2dlci50cmlnZ2VyKClcbiAgfVxuXG4gIG91dC5pc0NvbXBsZXRlID0gKCk9PiBnZW4ubWVtb3J5LmhlYXBbIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCBdXG5cbiAgb3V0LnJlbGVhc2UgPSAoKT0+IHtcbiAgICBzaG91bGRTdXN0YWluLnZhbHVlID0gMFxuICAgIC8vIFhYWCBwcmV0dHkgbmFzdHkuLi4gZ3JhYnMgYWNjdW0gaW5zaWRlIG9mIGd0cCBhbmQgcmVzZXRzIHZhbHVlIG1hbnVhbGx5XG4gICAgLy8gdW5mb3J0dW5hdGVseSBlbnZUcmlnZ2VyIHdvbid0IHdvcmsgYXMgaXQncyBiYWNrIHRvIDAgYnkgdGhlIHRpbWUgdGhlIHJlbGVhc2UgYmxvY2sgaXMgdHJpZ2dlcmVkLi4uXG4gICAgZ2VuLm1lbW9yeS5oZWFwWyByZWxlYXNlQWNjdW0uaW5wdXRzWzBdLmlucHV0c1sxXS5tZW1vcnkudmFsdWUuaWR4IF0gPSAwXG4gIH1cblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYW5kJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSAhPT0gMCAmJiAke2lucHV0c1sxXX0gIT09IDApIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXNpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2FzaW4nOiBNYXRoLmFzaW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5hc2luKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYXNpbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhc2luLmlucHV0cyA9IFsgeCBdXG4gIGFzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgYXNpbi5uYW1lID0gYCR7YXNpbi5iYXNlbmFtZX17YXNpbi5pZH1gXG5cbiAgcmV0dXJuIGFzaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXRhbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2F0YW4nOiBNYXRoLmF0YW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5hdGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hdGFuKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYXRhbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhdGFuLmlucHV0cyA9IFsgeCBdXG4gIGF0YW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgYXRhbi5uYW1lID0gYCR7YXRhbi5iYXNlbmFtZX17YXRhbi5pZH1gXG5cbiAgcmV0dXJuIGF0YW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRlY2F5VGltZSA9IDQ0MTAwICkgPT4ge1xuICBsZXQgc3NkID0gaGlzdG9yeSAoIDEgKSxcbiAgICAgIHQ2MCA9IE1hdGguZXhwKCAtNi45MDc3NTUyNzg5MjEgLyBkZWNheVRpbWUgKVxuXG4gIHNzZC5pbiggbXVsKCBzc2Qub3V0LCB0NjAgKSApXG5cbiAgc3NkLm91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc3NkLnZhbHVlID0gMVxuICB9XG5cbiAgcmV0dXJuIHN1YiggMSwgc3NkLm91dCApXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBnZW4oKSB7XG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBcbiAgICBsZXQgb3V0ID0gXG5gICB2YXIgJHt0aGlzLm5hbWV9ID0gbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1cbiAgaWYoICR7dGhpcy5uYW1lfSA9PT0gMSApIG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dID0gMCAgICAgIFxuICAgICAgXG5gXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBfcHJvcHMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBtaW46MCwgbWF4OjEgfSwgX3Byb3BzIClcblxuICB1Z2VuLm5hbWUgPSAnYmFuZycgKyBnZW4uZ2V0VUlEKClcblxuICB1Z2VuLm1pbiA9IHByb3BzLm1pblxuICB1Z2VuLm1heCA9IHByb3BzLm1heFxuXG4gIHVnZW4udHJpZ2dlciA9ICgpID0+IHtcbiAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gdWdlbi5tYXggXG4gIH1cblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Jvb2wnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IGAke2lucHV0c1swXX0gPT09IDAgPyAwIDogMWBcbiAgICBcbiAgICAvL2dlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICAvL3JldHVybiBbIGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gLCAnICcgK291dCBdXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidjZWlsJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguY2VpbCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmNlaWwoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY2VpbCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNlaWwgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY2VpbC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBjZWlsXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViICA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NsaXAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcblxuICAgIG91dCA9XG5cbmAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9ID4gJHtpbnB1dHNbMl19ICkgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMl19XG4gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA8ICR7aW5wdXRzWzFdfSApICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzFdfVxuYFxuICAgIG91dCA9ICcgJyArIG91dFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49LTEsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2Nvcyc6IE1hdGguY29zIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uY29zKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5jb3MoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBjb3MgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY29zLmlucHV0cyA9IFsgeCBdXG4gIGNvcy5pZCA9IGdlbi5nZXRVSUQoKVxuICBjb3MubmFtZSA9IGAke2Nvcy5iYXNlbmFtZX17Y29zLmlkfWBcblxuICByZXR1cm4gY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvdW50ZXInLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHlcbiAgICAgICBcbiAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBmdW5jdGlvbkJvZHkgID0gdGhpcy5jYWxsYmFjayggZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sIGlucHV0c1syXSwgaW5wdXRzWzNdLCBpbnB1dHNbNF0sICBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gLCBgbWVtb3J5WyR7dGhpcy5tZW1vcnkud3JhcC5pZHh9XWAgIClcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiB0aGlzIH0pIFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcbiAgIFxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy53cmFwLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkgdGhpcy53cmFwLmdlbigpXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfbWluLCBfbWF4LCBfcmVzZXQsIGxvb3BzLCB2YWx1ZVJlZiwgd3JhcFJlZiApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJydcbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzNdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1szXSA8IDEpICkgeyBcbiAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49IDEgKSAke3ZhbHVlUmVmfSA9ICR7X21pbn1cXG5gXG4gICAgfVxuXG4gICAgb3V0ICs9IGAgIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3ZhbHVlUmVmfTtcXG4gICR7dmFsdWVSZWZ9ICs9ICR7X2luY3J9XFxuYCAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyAgXG4gICAgXG4gICAgaWYoIHR5cGVvZiB0aGlzLm1heCA9PT0gJ251bWJlcicgJiYgdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHR5cGVvZiB0aGlzLm1pbiAhPT0gJ251bWJlcicgKSB7XG4gICAgICB3cmFwID0gXG5gICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgJiYgdGhpcy5taW4gIT09IEluZmluaXR5ICkge1xuICAgICAgd3JhcCA9IFxuYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7X21heH0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9IC09ICR7X21heH0gLSAke19taW59XG4gICAgJHt3cmFwUmVmfSA9IDFcbiAgfWVsc2UgaWYoICR7dmFsdWVSZWZ9IDwgJHtfbWlufSAmJiAgJHtsb29wc30gPiAwKSB7XG4gICAgJHt2YWx1ZVJlZn0gKz0gJHtfbWF4fSAtICR7X21pbn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNle1xuICAgICAgb3V0ICs9ICdcXG4nXG4gICAgfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcFxuXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyPTEsIG1pbj0wLCBtYXg9SW5maW5pdHksIHJlc2V0PTAsIGxvb3BzPTEsICBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgaW5pdGlhbFZhbHVlOiAwLCBzaG91bGRXcmFwOnRydWUgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW46ICAgIG1pbiwgXG4gICAgbWF4OiAgICBtYXgsXG4gICAgdmFsdWU6ICBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluY3IsIG1pbiwgbWF4LCByZXNldCwgbG9vcHMgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSxcbiAgICAgIHdyYXA6ICB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSBcbiAgICB9LFxuICAgIHdyYXAgOiB7XG4gICAgICBnZW4oKSB7IFxuICAgICAgICBpZiggdWdlbi5tZW1vcnkud3JhcC5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgfVxuICAgICAgICBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVsgJHt1Z2VuLm1lbW9yeS53cmFwLmlkeH0gXWBcbiAgICAgICAgcmV0dXJuIGBtZW1vcnlbICR7dWdlbi5tZW1vcnkud3JhcC5pZHh9IF1gIFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZGVmYXVsdHMgKVxuIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgXG4gICAgICB9XG4gICAgfVxuICB9KVxuICBcbiAgdWdlbi53cmFwLmlucHV0cyA9IFsgdWdlbiBdXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG4gIHVnZW4ud3JhcC5uYW1lID0gdWdlbi5uYW1lICsgJ193cmFwJ1xuICByZXR1cm4gdWdlblxufSBcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bT0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgcGhhc29yPXJlcXVpcmUoICcuL3BoYXNvci5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2N5Y2xlJyxcblxuICBpbml0VGFibGUoKSB7ICAgIFxuICAgIGxldCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICAgIGZvciggbGV0IGkgPSAwLCBsID0gYnVmZmVyLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gTWF0aC5zaW4oICggaSAvIGwgKSAqICggTWF0aC5QSSAqIDIgKSApXG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMuY3ljbGUgPSBkYXRhKCBidWZmZXIsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSApXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTEsIHJlc2V0PTAsIF9wcm9wcyApID0+IHtcbiAgaWYoIHR5cGVvZiBnZW4uZ2xvYmFscy5jeWNsZSA9PT0gJ3VuZGVmaW5lZCcgKSBwcm90by5pbml0VGFibGUoKSBcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG1pbjowIH0sIF9wcm9wcyApXG5cbiAgY29uc3QgdWdlbiA9IHBlZWsoIGdlbi5nbG9iYWxzLmN5Y2xlLCBwaGFzb3IoIGZyZXF1ZW5jeSwgcmVzZXQsIHByb3BzICkpXG4gIHVnZW4ubmFtZSA9ICdjeWNsZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgdXRpbGl0aWVzID0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApLFxuICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gIHBva2UgPSByZXF1aXJlKCcuL3Bva2UuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkYXRhJyxcbiAgZ2xvYmFsczoge30sXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpZHhcbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMubmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBsZXQgdWdlbiA9IHRoaXNcbiAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSwgdGhpcy5pbW11dGFibGUgKSBcbiAgICAgIGlkeCA9IHRoaXMubWVtb3J5LnZhbHVlcy5pZHhcbiAgICAgIHRyeSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcC5zZXQoIHRoaXMuYnVmZmVyLCBpZHggKVxuICAgICAgfWNhdGNoKCBlICkge1xuICAgICAgICBjb25zb2xlLmxvZyggZSApXG4gICAgICAgIHRocm93IEVycm9yKCAnZXJyb3Igd2l0aCByZXF1ZXN0LiBhc2tpbmcgZm9yICcgKyB0aGlzLmJ1ZmZlci5sZW5ndGggKycuIGN1cnJlbnQgaW5kZXg6ICcgKyBnZW4ubWVtb3J5SW5kZXggKyAnIG9mICcgKyBnZW4ubWVtb3J5LmhlYXAubGVuZ3RoIClcbiAgICAgIH1cbiAgICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSBdID0gdGhpc1xuICAgICAgLy9yZXR1cm4gJ2dlbi5tZW1vcnknICsgdGhpcy5uYW1lICsgJy5idWZmZXInXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpZHhcbiAgICB9ZWxzZXtcbiAgICAgIGlkeCA9IGdlbi5tZW1vWyB0aGlzLm5hbWUgXVxuICAgIH1cbiAgICByZXR1cm4gaWR4XG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCB4LCB5PTEsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuLCBidWZmZXIsIHNob3VsZExvYWQgPSBmYWxzZVxuICBcbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkICkge1xuICAgIGlmKCBnZW4uZ2xvYmFsc1sgcHJvcGVydGllcy5nbG9iYWwgXSApIHtcbiAgICAgIHJldHVybiBnZW4uZ2xvYmFsc1sgcHJvcGVydGllcy5nbG9iYWwgXVxuICAgIH1cbiAgfVxuXG4gIGlmKCB0eXBlb2YgeCA9PT0gJ251bWJlcicgKSB7XG4gICAgaWYoIHkgIT09IDEgKSB7XG4gICAgICBidWZmZXIgPSBbXVxuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB5OyBpKysgKSB7XG4gICAgICAgIGJ1ZmZlclsgaSBdID0gbmV3IEZsb2F0MzJBcnJheSggeCApXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCB4IClcbiAgICB9XG4gIH1lbHNlIGlmKCBBcnJheS5pc0FycmF5KCB4ICkgKSB7IC8vISAoeCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSApICkge1xuICAgIGxldCBzaXplID0geC5sZW5ndGhcbiAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCBzaXplIClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKysgKSB7XG4gICAgICBidWZmZXJbIGkgXSA9IHhbIGkgXVxuICAgIH1cbiAgfWVsc2UgaWYoIHR5cGVvZiB4ID09PSAnc3RyaW5nJyApIHtcbiAgICBidWZmZXIgPSB7IGxlbmd0aDogeSA+IDEgPyB5IDogZ2VuLnNhbXBsZXJhdGUgKiA2MCB9IC8vIFhYWCB3aGF0Pz8/XG4gICAgc2hvdWxkTG9hZCA9IHRydWVcbiAgfWVsc2UgaWYoIHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSB7XG4gICAgYnVmZmVyID0geFxuICB9XG4gIFxuICB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgYnVmZmVyLFxuICAgIG5hbWU6IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpLFxuICAgIGRpbTogIGJ1ZmZlci5sZW5ndGgsIC8vIFhYWCBob3cgZG8gd2UgZHluYW1pY2FsbHkgYWxsb2NhdGUgdGhpcz9cbiAgICBjaGFubmVscyA6IDEsXG4gICAgb25sb2FkOiBudWxsLFxuICAgIHRoZW4oIGZuYyApIHtcbiAgICAgIHVnZW4ub25sb2FkID0gZm5jXG4gICAgICByZXR1cm4gdWdlblxuICAgIH0sXG4gICAgaW1tdXRhYmxlOiBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5pbW11dGFibGUgPT09IHRydWUgPyB0cnVlIDogZmFsc2UsXG4gICAgbG9hZCggZmlsZW5hbWUgKSB7XG4gICAgICBsZXQgcHJvbWlzZSA9IHV0aWxpdGllcy5sb2FkU2FtcGxlKCBmaWxlbmFtZSwgdWdlbiApXG4gICAgICBwcm9taXNlLnRoZW4oICggX2J1ZmZlciApPT4geyBcbiAgICAgICAgdWdlbi5tZW1vcnkudmFsdWVzLmxlbmd0aCA9IHVnZW4uZGltID0gX2J1ZmZlci5sZW5ndGggICAgIFxuICAgICAgICB1Z2VuLm9ubG9hZCgpIFxuICAgICAgfSlcbiAgICB9LFxuICAgIG1lbW9yeSA6IHtcbiAgICAgIHZhbHVlczogeyBsZW5ndGg6YnVmZmVyLmxlbmd0aCwgaWR4Om51bGwgfVxuICAgIH1cbiAgfSlcblxuICBpZiggc2hvdWxkTG9hZCApIHVnZW4ubG9hZCggeCApXG4gIFxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkge1xuICAgIGlmKCBwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF0gPSB1Z2VuXG4gICAgfVxuICAgIGlmKCBwcm9wZXJ0aWVzLm1ldGEgPT09IHRydWUgKSB7XG4gICAgICBmb3IoIGxldCBpID0gMCwgbGVuZ3RoID0gdWdlbi5idWZmZXIubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgaSwge1xuICAgICAgICAgIGdldCAoKSB7XG4gICAgICAgICAgICByZXR1cm4gcGVlayggdWdlbiwgaSwgeyBtb2RlOidzaW1wbGUnLCBpbnRlcnA6J25vbmUnIH0gKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgICAgcmV0dXJuIHBva2UoIHVnZW4sIHYsIGkgKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB4MSA9IGhpc3RvcnkoKSxcbiAgICAgIHkxID0gaGlzdG9yeSgpLFxuICAgICAgZmlsdGVyXG5cbiAgLy9IaXN0b3J5IHgxLCB5MTsgeSA9IGluMSAtIHgxICsgeTEqMC45OTk3OyB4MSA9IGluMTsgeTEgPSB5OyBvdXQxID0geTtcbiAgZmlsdGVyID0gbWVtbyggYWRkKCBzdWIoIGluMSwgeDEub3V0ICksIG11bCggeTEub3V0LCAuOTk5NyApICkgKVxuICB4MS5pbiggaW4xIClcbiAgeTEuaW4oIGZpbHRlciApXG5cbiAgcmV0dXJuIGZpbHRlclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgdDYwICAgICA9IHJlcXVpcmUoICcuL3Q2MC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZGVjYXlUaW1lID0gNDQxMDAsIHByb3BzICkgPT4ge1xuICBsZXQgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgaW5pdFZhbHVlOjEgfSwgcHJvcHMgKSxcbiAgICAgIHNzZCA9IGhpc3RvcnkgKCBwcm9wZXJ0aWVzLmluaXRWYWx1ZSApXG5cbiAgc3NkLmluKCBtdWwoIHNzZC5vdXQsIHQ2MCggZGVjYXlUaW1lICkgKSApXG5cbiAgc3NkLm91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc3NkLnZhbHVlID0gMVxuICB9XG5cbiAgcmV0dXJuIHNzZC5vdXQgXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuICA9IHJlcXVpcmUoICcuL2dlbi5qcycgICksXG4gICAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICAgIHBva2UgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICAgICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgICBzdWIgID0gcmVxdWlyZSggJy4vc3ViLmpzJyAgKSxcbiAgICAgIHdyYXAgPSByZXF1aXJlKCAnLi93cmFwLmpzJyApLFxuICAgICAgYWNjdW09IHJlcXVpcmUoICcuL2FjY3VtLmpzJyksXG4gICAgICBtZW1vID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RlbGF5JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlucHV0c1swXVxuICAgIFxuICAgIHJldHVybiBpbnB1dHNbMF1cbiAgfSxcbn1cblxuY29uc3QgZGVmYXVsdHMgPSB7IHNpemU6IDUxMiwgaW50ZXJwOidub25lJyB9XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIHRhcHMsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGNvbnN0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIGxldCB3cml0ZUlkeCwgcmVhZElkeCwgZGVsYXlkYXRhXG5cbiAgaWYoIEFycmF5LmlzQXJyYXkoIHRhcHMgKSA9PT0gZmFsc2UgKSB0YXBzID0gWyB0YXBzIF1cbiAgXG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBjb25zdCBtYXhUYXBTaXplID0gTWF0aC5tYXgoIC4uLnRhcHMgKVxuICBpZiggcHJvcHMuc2l6ZSA8IG1heFRhcFNpemUgKSBwcm9wcy5zaXplID0gbWF4VGFwU2l6ZVxuXG4gIGRlbGF5ZGF0YSA9IGRhdGEoIHByb3BzLnNpemUgKVxuICBcbiAgdWdlbi5pbnB1dHMgPSBbXVxuXG4gIHdyaXRlSWR4ID0gYWNjdW0oIDEsIDAsIHsgbWF4OnByb3BzLnNpemUsIG1pbjowIH0pXG4gIFxuICBmb3IoIGxldCBpID0gMDsgaSA8IHRhcHMubGVuZ3RoOyBpKysgKSB7XG4gICAgdWdlbi5pbnB1dHNbIGkgXSA9IHBlZWsoIGRlbGF5ZGF0YSwgd3JhcCggc3ViKCB3cml0ZUlkeCwgdGFwc1tpXSApLCAwLCBwcm9wcy5zaXplICkseyBtb2RlOidzYW1wbGVzJywgaW50ZXJwOnByb3BzLmludGVycCB9KVxuICB9XG4gIFxuICB1Z2VuLm91dHB1dHMgPSB1Z2VuLmlucHV0cyAvLyBYWFggdWdoLCBVZ2gsIFVHSCEgYnV0IGkgZ3Vlc3MgaXQgd29ya3MuXG5cbiAgcG9rZSggZGVsYXlkYXRhLCBpbjEsIHdyaXRlSWR4IClcblxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7Z2VuLmdldFVJRCgpfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSApID0+IHtcbiAgbGV0IG4xID0gaGlzdG9yeSgpXG4gICAgXG4gIG4xLmluKCBpbjEgKVxuXG4gIGxldCB1Z2VuID0gc3ViKCBpbjEsIG4xLm91dCApXG4gIHVnZW4ubmFtZSA9ICdkZWx0YScrZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RpdicsXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQ9YCAgdmFyICR7dGhpcy5uYW1lfSA9IGAsXG4gICAgICAgIGRpZmYgPSAwLCBcbiAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgIGxhc3ROdW1iZXJJc1VnZW4gPSBpc05hTiggbGFzdE51bWJlciApLCBcbiAgICAgICAgZGl2QXRFbmQgPSBmYWxzZVxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpID09PSAwICkgcmV0dXJuXG5cbiAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICBpc0ZpbmFsSWR4ICAgPSBpID09PSBpbnB1dHMubGVuZ3RoIC0gMVxuXG4gICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgLyB2XG4gICAgICAgIG91dCArPSBsYXN0TnVtYmVyXG4gICAgICB9ZWxzZXtcbiAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9IC8gJHt2fWBcbiAgICAgIH1cblxuICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLyAnIFxuICAgIH0pXG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgY29uc3QgZGl2ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgT2JqZWN0LmFzc2lnbiggZGl2LCB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuICB9KVxuXG4gIGRpdi5uYW1lID0gZGl2LmJhc2VuYW1lICsgZGl2LmlkXG4gIFxuICByZXR1cm4gZGl2XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4nICksXG4gICAgd2luZG93cyA9IHJlcXVpcmUoICcuL3dpbmRvd3MnICksXG4gICAgZGF0YSAgICA9IHJlcXVpcmUoICcuL2RhdGEnICksXG4gICAgcGVlayAgICA9IHJlcXVpcmUoICcuL3BlZWsnICksXG4gICAgcGhhc29yICA9IHJlcXVpcmUoICcuL3BoYXNvcicgKSxcbiAgICBkZWZhdWx0cyA9IHtcbiAgICAgIHR5cGU6J3RyaWFuZ3VsYXInLCBsZW5ndGg6MTAyNCwgYWxwaGE6LjE1LCBzaGlmdDowLCByZXZlcnNlOmZhbHNlIFxuICAgIH1cblxubW9kdWxlLmV4cG9ydHMgPSBwcm9wcyA9PiB7XG4gIFxuICBsZXQgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBkZWZhdWx0cywgcHJvcHMgKVxuICBsZXQgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggcHJvcGVydGllcy5sZW5ndGggKVxuXG4gIGxldCBuYW1lID0gcHJvcGVydGllcy50eXBlICsgJ18nICsgcHJvcGVydGllcy5sZW5ndGggKyAnXycgKyBwcm9wZXJ0aWVzLnNoaWZ0ICsgJ18nICsgcHJvcGVydGllcy5yZXZlcnNlICsgJ18nICsgcHJvcGVydGllcy5hbHBoYVxuICBpZiggdHlwZW9mIGdlbi5nbG9iYWxzLndpbmRvd3NbIG5hbWUgXSA9PT0gJ3VuZGVmaW5lZCcgKSB7IFxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSB3aW5kb3dzWyBwcm9wZXJ0aWVzLnR5cGUgXSggcHJvcGVydGllcy5sZW5ndGgsIGksIHByb3BlcnRpZXMuYWxwaGEsIHByb3BlcnRpZXMuc2hpZnQgKVxuICAgIH1cblxuICAgIGlmKCBwcm9wZXJ0aWVzLnJldmVyc2UgPT09IHRydWUgKSB7IFxuICAgICAgYnVmZmVyLnJldmVyc2UoKVxuICAgIH1cbiAgICBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gPSBkYXRhKCBidWZmZXIgKVxuICB9XG5cbiAgbGV0IHVnZW4gPSBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gXG4gIHVnZW4ubmFtZSA9ICdlbnYnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2VxJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSB0aGlzLmlucHV0c1swXSA9PT0gdGhpcy5pbnB1dHNbMV0gPyAxIDogYCAgdmFyICR7dGhpcy5uYW1lfSA9ICgke2lucHV0c1swXX0gPT09ICR7aW5wdXRzWzFdfSkgfCAwXFxuXFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1gLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2V4cCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmV4cCggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5leHAoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBleHAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZXhwLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGV4cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2Zsb29yJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgLy9nZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5mbG9vciB9KVxuXG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gfCAwIClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdIHwgMFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGZsb29yID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGZsb29yLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGZsb29yXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2ZvbGQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcblxuICAgIG91dCA9IHRoaXMuY3JlYXRlQ2FsbGJhY2soIGlucHV0c1swXSwgdGhpcy5taW4sIHRoaXMubWF4ICkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIG91dCBdXG4gIH0sXG5cbiAgY3JlYXRlQ2FsbGJhY2soIHYsIGxvLCBoaSApIHtcbiAgICBsZXQgb3V0ID1cbmAgdmFyICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7dn0sXG4gICAgICAke3RoaXMubmFtZX1fcmFuZ2UgPSAke2hpfSAtICR7bG99LFxuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gMFxuXG4gIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA+PSAke2hpfSl7XG4gICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZVxuICAgIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA+PSAke2hpfSl7XG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAoKCR7dGhpcy5uYW1lfV92YWx1ZSAtICR7bG99KSAvICR7dGhpcy5uYW1lfV9yYW5nZSkgfCAwXG4gICAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlICogJHt0aGlzLm5hbWV9X251bVdyYXBzXG4gICAgfVxuICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcysrXG4gIH0gZWxzZSBpZigke3RoaXMubmFtZX1fdmFsdWUgPCAke2xvfSl7XG4gICAgJHt0aGlzLm5hbWV9X3ZhbHVlICs9ICR7dGhpcy5uYW1lfV9yYW5nZVxuICAgIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA8ICR7bG99KXtcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9ICgoJHt0aGlzLm5hbWV9X3ZhbHVlIC0gJHtsb30pIC8gJHt0aGlzLm5hbWV9X3JhbmdlLSAxKSB8IDBcbiAgICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2UgKiAke3RoaXMubmFtZX1fbnVtV3JhcHNcbiAgICB9XG4gICAgJHt0aGlzLm5hbWV9X251bVdyYXBzLS1cbiAgfVxuICBpZigke3RoaXMubmFtZX1fbnVtV3JhcHMgJiAxKSAke3RoaXMubmFtZX1fdmFsdWUgPSAke2hpfSArICR7bG99IC0gJHt0aGlzLm5hbWV9X3ZhbHVlXG5gXG4gICAgcmV0dXJuICcgJyArIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidnYXRlJyxcbiAgY29udHJvbFN0cmluZzpudWxsLCAvLyBpbnNlcnQgaW50byBvdXRwdXQgY29kZWdlbiBmb3IgZGV0ZXJtaW5pbmcgaW5kZXhpbmdcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuICAgIFxuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgXG4gICAgbGV0IGxhc3RJbnB1dE1lbW9yeUlkeCA9ICdtZW1vcnlbICcgKyB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgJyBdJyxcbiAgICAgICAgb3V0cHV0TWVtb3J5U3RhcnRJZHggPSB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgMSxcbiAgICAgICAgaW5wdXRTaWduYWwgPSBpbnB1dHNbMF0sXG4gICAgICAgIGNvbnRyb2xTaWduYWwgPSBpbnB1dHNbMV1cbiAgICBcbiAgICAvKiBcbiAgICAgKiB3ZSBjaGVjayB0byBzZWUgaWYgdGhlIGN1cnJlbnQgY29udHJvbCBpbnB1dHMgZXF1YWxzIG91ciBsYXN0IGlucHV0XG4gICAgICogaWYgc28sIHdlIHN0b3JlIHRoZSBzaWduYWwgaW5wdXQgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnRseVxuICAgICAqIHNlbGVjdGVkIGluZGV4LiBJZiBub3QsIHdlIHB1dCAwIGluIHRoZSBtZW1vcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBsYXN0IHNlbGVjdGVkIGluZGV4LFxuICAgICAqIGNoYW5nZSB0aGUgc2VsZWN0ZWQgaW5kZXgsIGFuZCB0aGVuIHN0b3JlIHRoZSBzaWduYWwgaW4gcHV0IGluIHRoZSBtZW1lcnkgYXNzb2ljYXRlZFxuICAgICAqIHdpdGggdGhlIG5ld2x5IHNlbGVjdGVkIGluZGV4XG4gICAgICovXG4gICAgXG4gICAgb3V0ID1cblxuYCBpZiggJHtjb250cm9sU2lnbmFsfSAhPT0gJHtsYXN0SW5wdXRNZW1vcnlJZHh9ICkge1xuICAgIG1lbW9yeVsgJHtsYXN0SW5wdXRNZW1vcnlJZHh9ICsgJHtvdXRwdXRNZW1vcnlTdGFydElkeH0gIF0gPSAwIFxuICAgICR7bGFzdElucHV0TWVtb3J5SWR4fSA9ICR7Y29udHJvbFNpZ25hbH1cbiAgfVxuICBtZW1vcnlbICR7b3V0cHV0TWVtb3J5U3RhcnRJZHh9ICsgJHtjb250cm9sU2lnbmFsfSBdID0gJHtpbnB1dFNpZ25hbH1cblxuYFxuICAgIHRoaXMuY29udHJvbFN0cmluZyA9IGlucHV0c1sxXVxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHRoaXMub3V0cHV0cy5mb3JFYWNoKCB2ID0+IHYuZ2VuKCkgKVxuXG4gICAgcmV0dXJuIFsgbnVsbCwgJyAnICsgb3V0IF1cbiAgfSxcblxuICBjaGlsZGdlbigpIHtcbiAgICBpZiggdGhpcy5wYXJlbnQuaW5pdGlhbGl6ZWQgPT09IGZhbHNlICkge1xuICAgICAgZ2VuLmdldElucHV0cyggdGhpcyApIC8vIHBhcmVudCBnYXRlIGlzIG9ubHkgaW5wdXQgb2YgYSBnYXRlIG91dHB1dCwgc2hvdWxkIG9ubHkgYmUgZ2VuJ2Qgb25jZS5cbiAgICB9XG5cbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMubmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyAke3RoaXMubWVtb3J5LnZhbHVlLmlkeH0gXWBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuICBgbWVtb3J5WyAke3RoaXMubWVtb3J5LnZhbHVlLmlkeH0gXWBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggY29udHJvbCwgaW4xLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY291bnQ6IDIgfVxuXG4gIGlmKCB0eXBlb2YgcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICBvdXRwdXRzOiBbXSxcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGNvbnRyb2wgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIGxhc3RJbnB1dDogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgIH0sXG4gICAgaW5pdGlhbGl6ZWQ6ZmFsc2VcbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke2dlbi5nZXRVSUQoKX1gXG5cbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCB1Z2VuLmNvdW50OyBpKysgKSB7XG4gICAgdWdlbi5vdXRwdXRzLnB1c2goe1xuICAgICAgaW5kZXg6aSxcbiAgICAgIGdlbjogcHJvdG8uY2hpbGRnZW4sXG4gICAgICBwYXJlbnQ6dWdlbixcbiAgICAgIGlucHV0czogWyB1Z2VuIF0sXG4gICAgICBtZW1vcnk6IHtcbiAgICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICAgIH0sXG4gICAgICBpbml0aWFsaXplZDpmYWxzZSxcbiAgICAgIG5hbWU6IGAke3VnZW4ubmFtZX1fb3V0JHtnZW4uZ2V0VUlEKCl9YFxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qIGdlbi5qc1xuICpcbiAqIGxvdy1sZXZlbCBjb2RlIGdlbmVyYXRpb24gZm9yIHVuaXQgZ2VuZXJhdG9yc1xuICpcbiAqL1xuXG5sZXQgTWVtb3J5SGVscGVyID0gcmVxdWlyZSggJ21lbW9yeS1oZWxwZXInIClcblxubGV0IGdlbiA9IHtcblxuICBhY2N1bTowLFxuICBnZXRVSUQoKSB7IHJldHVybiB0aGlzLmFjY3VtKysgfSxcbiAgZGVidWc6ZmFsc2UsXG4gIHNhbXBsZXJhdGU6IDQ0MTAwLCAvLyBjaGFuZ2Ugb24gYXVkaW9jb250ZXh0IGNyZWF0aW9uXG4gIHNob3VsZExvY2FsaXplOiBmYWxzZSxcbiAgZ2xvYmFsczp7XG4gICAgd2luZG93czoge30sXG4gIH0sXG4gIFxuICAvKiBjbG9zdXJlc1xuICAgKlxuICAgKiBGdW5jdGlvbnMgdGhhdCBhcmUgaW5jbHVkZWQgYXMgYXJndW1lbnRzIHRvIG1hc3RlciBjYWxsYmFjay4gRXhhbXBsZXM6IE1hdGguYWJzLCBNYXRoLnJhbmRvbSBldGMuXG4gICAqIFhYWCBTaG91bGQgcHJvYmFibHkgYmUgcmVuYW1lZCBjYWxsYmFja1Byb3BlcnRpZXMgb3Igc29tZXRoaW5nIHNpbWlsYXIuLi4gY2xvc3VyZXMgYXJlIG5vIGxvbmdlciB1c2VkLlxuICAgKi9cblxuICBjbG9zdXJlczogbmV3IFNldCgpLFxuICBwYXJhbXM6ICAgbmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6W10sXG4gIGVuZEJsb2NrOiBuZXcgU2V0KCksXG4gIGhpc3RvcmllczogbmV3IE1hcCgpLFxuXG4gIG1lbW86IHt9LFxuXG4gIC8vZGF0YToge30sXG4gIFxuICAvKiBleHBvcnRcbiAgICpcbiAgICogcGxhY2UgZ2VuIGZ1bmN0aW9ucyBpbnRvIGFub3RoZXIgb2JqZWN0IGZvciBlYXNpZXIgcmVmZXJlbmNlXG4gICAqL1xuXG4gIGV4cG9ydCggb2JqICkge30sXG5cbiAgYWRkVG9FbmRCbG9jayggdiApIHtcbiAgICB0aGlzLmVuZEJsb2NrLmFkZCggJyAgJyArIHYgKVxuICB9LFxuICBcbiAgcmVxdWVzdE1lbW9yeSggbWVtb3J5U3BlYywgaW1tdXRhYmxlPWZhbHNlICkge1xuICAgIGZvciggbGV0IGtleSBpbiBtZW1vcnlTcGVjICkge1xuICAgICAgbGV0IHJlcXVlc3QgPSBtZW1vcnlTcGVjWyBrZXkgXVxuXG4gICAgICAvL2NvbnNvbGUubG9nKCAncmVxdWVzdGluZyAnICsga2V5ICsgJzonICwgSlNPTi5zdHJpbmdpZnkoIHJlcXVlc3QgKSApXG5cbiAgICAgIGlmKCByZXF1ZXN0Lmxlbmd0aCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICBjb25zb2xlLmxvZyggJ3VuZGVmaW5lZCBsZW5ndGggZm9yOicsIGtleSApXG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5pZHggPSBnZW4ubWVtb3J5LmFsbG9jKCByZXF1ZXN0Lmxlbmd0aCwgaW1tdXRhYmxlIClcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlTWVtb3J5KCBhbW91bnQsIHR5cGUgKSB7XG4gICAgY29uc3QgbWVtID0gTWVtb3J5SGVscGVyLmNyZWF0ZSggYW1vdW50LCB0eXBlIClcbiAgICByZXR1cm4gbWVtXG4gIH0sXG5cbiAgLyogY3JlYXRlQ2FsbGJhY2tcbiAgICpcbiAgICogcGFyYW0gdWdlbiAtIEhlYWQgb2YgZ3JhcGggdG8gYmUgY29kZWdlbidkXG4gICAqXG4gICAqIEdlbmVyYXRlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBhIHBhcnRpY3VsYXIgdWdlbiBncmFwaC5cbiAgICogVGhlIGdlbi5jbG9zdXJlcyBwcm9wZXJ0eSBzdG9yZXMgZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZVxuICAgKiBwYXNzZWQgYXMgYXJndW1lbnRzIHRvIHRoZSBmaW5hbCBmdW5jdGlvbjsgdGhlc2UgYXJlIHByZWZpeGVkXG4gICAqIGJlZm9yZSBhbnkgZGVmaW5lZCBwYXJhbXMgdGhlIGdyYXBoIGV4cG9zZXMuIEZvciBleGFtcGxlLCBnaXZlbjpcbiAgICpcbiAgICogZ2VuLmNyZWF0ZUNhbGxiYWNrKCBhYnMoIHBhcmFtKCkgKSApXG4gICAqXG4gICAqIC4uLiB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIHdpbGwgaGF2ZSBhIHNpZ25hdHVyZSBvZiAoIGFicywgcDAgKS5cbiAgICovXG4gIFxuICBjcmVhdGVDYWxsYmFjayggdWdlbiwgbWVtLCBkZWJ1ZyA9IGZhbHNlLCBzaG91bGRJbmxpbmVNZW1vcnk9ZmFsc2UsIG1lbVR5cGUgPSBGbG9hdDMyQXJyYXkgKSB7XG4gICAgbGV0IGlzU3RlcmVvID0gQXJyYXkuaXNBcnJheSggdWdlbiApICYmIHVnZW4ubGVuZ3RoID4gMSxcbiAgICAgICAgY2FsbGJhY2ssIFxuICAgICAgICBjaGFubmVsMSwgY2hhbm5lbDJcblxuICAgIGlmKCB0eXBlb2YgbWVtID09PSAnbnVtYmVyJyB8fCBtZW0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIG1lbSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIG1lbSwgbWVtVHlwZSApXG4gICAgfVxuICAgIFxuICAgIC8vY29uc29sZS5sb2coICdjYiBtZW1vcnk6JywgbWVtIClcbiAgICB0aGlzLm1lbW9yeSA9IG1lbVxuICAgIHRoaXMubWVtbyA9IHt9IFxuICAgIHRoaXMuZW5kQmxvY2suY2xlYXIoKVxuICAgIHRoaXMuY2xvc3VyZXMuY2xlYXIoKVxuICAgIHRoaXMucGFyYW1zLmNsZWFyKClcbiAgICAvL3RoaXMuZ2xvYmFscyA9IHsgd2luZG93czp7fSB9XG4gICAgXG4gICAgdGhpcy5wYXJhbWV0ZXJzLmxlbmd0aCA9IDBcbiAgICBcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IFwiICAndXNlIHN0cmljdCdcXG5cIlxuICAgIGlmKCBzaG91bGRJbmxpbmVNZW1vcnk9PT1mYWxzZSApIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IFwiICB2YXIgbWVtb3J5ID0gZ2VuLm1lbW9yeVxcblxcblwiIFxuXG4gICAgLy8gY2FsbCAuZ2VuKCkgb24gdGhlIGhlYWQgb2YgdGhlIGdyYXBoIHdlIGFyZSBnZW5lcmF0aW5nIHRoZSBjYWxsYmFjayBmb3JcbiAgICAvL2NvbnNvbGUubG9nKCAnSEVBRCcsIHVnZW4gKVxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgMSArIGlzU3RlcmVvOyBpKysgKSB7XG4gICAgICBpZiggdHlwZW9mIHVnZW5baV0gPT09ICdudW1iZXInICkgY29udGludWVcblxuICAgICAgLy9sZXQgY2hhbm5lbCA9IGlzU3RlcmVvID8gdWdlbltpXS5nZW4oKSA6IHVnZW4uZ2VuKCksXG4gICAgICBsZXQgY2hhbm5lbCA9IGlzU3RlcmVvID8gdGhpcy5nZXRJbnB1dCggdWdlbltpXSApIDogdGhpcy5nZXRJbnB1dCggdWdlbiApLCBcbiAgICAgICAgICBib2R5ID0gJydcblxuICAgICAgLy8gaWYgLmdlbigpIHJldHVybnMgYXJyYXksIGFkZCB1Z2VuIGNhbGxiYWNrIChncmFwaE91dHB1dFsxXSkgdG8gb3VyIG91dHB1dCBmdW5jdGlvbnMgYm9keVxuICAgICAgLy8gYW5kIHRoZW4gcmV0dXJuIG5hbWUgb2YgdWdlbi4gSWYgLmdlbigpIG9ubHkgZ2VuZXJhdGVzIGEgbnVtYmVyIChmb3IgcmVhbGx5IHNpbXBsZSBncmFwaHMpXG4gICAgICAvLyBqdXN0IHJldHVybiB0aGF0IG51bWJlciAoZ3JhcGhPdXRwdXRbMF0pLlxuICAgICAgYm9keSArPSBBcnJheS5pc0FycmF5KCBjaGFubmVsICkgPyBjaGFubmVsWzFdICsgJ1xcbicgKyBjaGFubmVsWzBdIDogY2hhbm5lbFxuXG4gICAgICAvLyBzcGxpdCBib2R5IHRvIGluamVjdCByZXR1cm4ga2V5d29yZCBvbiBsYXN0IGxpbmVcbiAgICAgIGJvZHkgPSBib2R5LnNwbGl0KCdcXG4nKVxuICAgICBcbiAgICAgIC8vaWYoIGRlYnVnICkgY29uc29sZS5sb2coICdmdW5jdGlvbkJvZHkgbGVuZ3RoJywgYm9keSApXG4gICAgICBcbiAgICAgIC8vIG5leHQgbGluZSBpcyB0byBhY2NvbW1vZGF0ZSBtZW1vIGFzIGdyYXBoIGhlYWRcbiAgICAgIGlmKCBib2R5WyBib2R5Lmxlbmd0aCAtMSBdLnRyaW0oKS5pbmRleE9mKCdsZXQnKSA+IC0xICkgeyBib2R5LnB1c2goICdcXG4nICkgfSBcblxuICAgICAgLy8gZ2V0IGluZGV4IG9mIGxhc3QgbGluZVxuICAgICAgbGV0IGxhc3RpZHggPSBib2R5Lmxlbmd0aCAtIDFcblxuICAgICAgLy8gaW5zZXJ0IHJldHVybiBrZXl3b3JkXG4gICAgICBib2R5WyBsYXN0aWR4IF0gPSAnICBnZW4ub3V0WycgKyBpICsgJ10gID0gJyArIGJvZHlbIGxhc3RpZHggXSArICdcXG4nXG5cbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IGJvZHkuam9pbignXFxuJylcbiAgICB9XG4gICAgXG4gICAgdGhpcy5oaXN0b3JpZXMuZm9yRWFjaCggdmFsdWUgPT4ge1xuICAgICAgaWYoIHZhbHVlICE9PSBudWxsIClcbiAgICAgICAgdmFsdWUuZ2VuKCkgICAgICBcbiAgICB9KVxuXG4gICAgbGV0IHJldHVyblN0YXRlbWVudCA9IGlzU3RlcmVvID8gJyAgcmV0dXJuIGdlbi5vdXQnIDogJyAgcmV0dXJuIGdlbi5vdXRbMF0nXG4gICAgXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5zcGxpdCgnXFxuJylcblxuICAgIGlmKCB0aGlzLmVuZEJsb2NrLnNpemUgKSB7IFxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5jb25jYXQoIEFycmF5LmZyb20oIHRoaXMuZW5kQmxvY2sgKSApXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKCByZXR1cm5TdGF0ZW1lbnQgKVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggcmV0dXJuU3RhdGVtZW50IClcbiAgICB9XG4gICAgLy8gcmVhc3NlbWJsZSBmdW5jdGlvbiBib2R5XG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5qb2luKCdcXG4nKVxuXG4gICAgLy8gd2UgY2FuIG9ubHkgZHluYW1pY2FsbHkgY3JlYXRlIGEgbmFtZWQgZnVuY3Rpb24gYnkgZHluYW1pY2FsbHkgY3JlYXRpbmcgYW5vdGhlciBmdW5jdGlvblxuICAgIC8vIHRvIGNvbnN0cnVjdCB0aGUgbmFtZWQgZnVuY3Rpb24hIHNoZWVzaC4uLlxuICAgIC8vXG4gICAgaWYoIHNob3VsZElubGluZU1lbW9yeSA9PT0gdHJ1ZSApIHtcbiAgICAgIHRoaXMucGFyYW1ldGVycy5wdXNoKCAnbWVtb3J5JyApXG4gICAgfVxuICAgIGxldCBidWlsZFN0cmluZyA9IGByZXR1cm4gZnVuY3Rpb24gZ2VuKCAkeyB0aGlzLnBhcmFtZXRlcnMuam9pbignLCcpIH0gKXsgXFxuJHsgdGhpcy5mdW5jdGlvbkJvZHkgfVxcbn1gXG4gICAgXG4gICAgaWYoIHRoaXMuZGVidWcgfHwgZGVidWcgKSBjb25zb2xlLmxvZyggYnVpbGRTdHJpbmcgKSBcblxuICAgIGNhbGxiYWNrID0gbmV3IEZ1bmN0aW9uKCBidWlsZFN0cmluZyApKClcblxuICAgIFxuICAgIC8vIGFzc2lnbiBwcm9wZXJ0aWVzIHRvIG5hbWVkIGZ1bmN0aW9uXG4gICAgZm9yKCBsZXQgZGljdCBvZiB0aGlzLmNsb3N1cmVzLnZhbHVlcygpICkge1xuICAgICAgbGV0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdLFxuICAgICAgICAgIHZhbHVlID0gZGljdFsgbmFtZSBdXG5cbiAgICAgIGNhbGxiYWNrWyBuYW1lIF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIGZvciggbGV0IGRpY3Qgb2YgdGhpcy5wYXJhbXMudmFsdWVzKCkgKSB7XG4gICAgICBsZXQgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF0sXG4gICAgICAgICAgdWdlbiA9IGRpY3RbIG5hbWUgXVxuICAgICAgXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGNhbGxiYWNrLCBuYW1lLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gdWdlbi52YWx1ZSB9LFxuICAgICAgICBzZXQodil7IHVnZW4udmFsdWUgPSB2IH1cbiAgICAgIH0pXG4gICAgICAvL2NhbGxiYWNrWyBuYW1lIF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIGNhbGxiYWNrLmRhdGEgPSB0aGlzLmRhdGFcbiAgICBjYWxsYmFjay5vdXQgID0gbmV3IEZsb2F0MzJBcnJheSggMiApXG4gICAgY2FsbGJhY2sucGFyYW1ldGVycyA9IHRoaXMucGFyYW1ldGVycy5zbGljZSggMCApXG5cbiAgICAvL2lmKCBNZW1vcnlIZWxwZXIuaXNQcm90b3R5cGVPZiggdGhpcy5tZW1vcnkgKSApIFxuICAgIGNhbGxiYWNrLm1lbW9yeSA9IHRoaXMubWVtb3J5LmhlYXBcblxuICAgIHRoaXMuaGlzdG9yaWVzLmNsZWFyKClcblxuICAgIHJldHVybiBjYWxsYmFja1xuICB9LFxuICBcbiAgLyogZ2V0SW5wdXRzXG4gICAqXG4gICAqIENhbGxlZCBieSBlYWNoIGluZGl2aWR1YWwgdWdlbiB3aGVuIHRoZWlyIC5nZW4oKSBtZXRob2QgaXMgY2FsbGVkIHRvIHJlc29sdmUgdGhlaXIgdmFyaW91cyBpbnB1dHMuXG4gICAqIElmIGFuIGlucHV0IGlzIGEgbnVtYmVyLCByZXR1cm4gdGhlIG51bWJlci4gSWZcbiAgICogaXQgaXMgYW4gdWdlbiwgY2FsbCAuZ2VuKCkgb24gdGhlIHVnZW4sIG1lbW9pemUgdGhlIHJlc3VsdCBhbmQgcmV0dXJuIHRoZSByZXN1bHQuIElmIHRoZVxuICAgKiB1Z2VuIGhhcyBwcmV2aW91c2x5IGJlZW4gbWVtb2l6ZWQgcmV0dXJuIHRoZSBtZW1vaXplZCB2YWx1ZS5cbiAgICpcbiAgICovXG4gIGdldElucHV0cyggdWdlbiApIHtcbiAgICByZXR1cm4gdWdlbi5pbnB1dHMubWFwKCBnZW4uZ2V0SW5wdXQgKSBcbiAgfSxcblxuICBnZXRJbnB1dCggaW5wdXQgKSB7XG4gICAgbGV0IGlzT2JqZWN0ID0gdHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyxcbiAgICAgICAgcHJvY2Vzc2VkSW5wdXRcblxuICAgIGlmKCBpc09iamVjdCApIHsgLy8gaWYgaW5wdXQgaXMgYSB1Z2VuLi4uIFxuICAgICAgLy9jb25zb2xlLmxvZyggaW5wdXQubmFtZSwgZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXSApXG4gICAgICBpZiggZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXSApIHsgLy8gaWYgaXQgaGFzIGJlZW4gbWVtb2l6ZWQuLi5cbiAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBnZW4ubWVtb1sgaW5wdXQubmFtZSBdXG4gICAgICB9ZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaW5wdXQgKSApIHtcbiAgICAgICAgZ2VuLmdldElucHV0KCBpbnB1dFswXSApXG4gICAgICAgIGdlbi5nZXRJbnB1dCggaW5wdXRbMV0gKVxuICAgICAgfWVsc2V7IC8vIGlmIG5vdCBtZW1vaXplZCBnZW5lcmF0ZSBjb2RlICBcbiAgICAgICAgaWYoIHR5cGVvZiBpbnB1dC5nZW4gIT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coICdubyBnZW4gZm91bmQ6JywgaW5wdXQsIGlucHV0LmdlbiApXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvZGUgPSBpbnB1dC5nZW4oKVxuICAgICAgICAvL2lmKCBjb2RlLmluZGV4T2YoICdPYmplY3QnICkgPiAtMSApIGNvbnNvbGUubG9nKCAnYmFkIGlucHV0OicsIGlucHV0LCBjb2RlIClcbiAgICAgICAgXG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCBjb2RlICkgKSB7XG4gICAgICAgICAgaWYoICFnZW4uc2hvdWxkTG9jYWxpemUgKSB7XG4gICAgICAgICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGdlbi5jb2RlTmFtZSA9IGNvZGVbMF1cbiAgICAgICAgICAgIGdlbi5sb2NhbGl6ZWRDb2RlLnB1c2goIGNvZGVbMV0gKVxuICAgICAgICAgIH1cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnYWZ0ZXIgR0VOJyAsIHRoaXMuZnVuY3Rpb25Cb2R5IClcbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVbMF1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ZWxzZXsgLy8gaXQgaW5wdXQgaXMgYSBudW1iZXJcbiAgICAgIHByb2Nlc3NlZElucHV0ID0gaW5wdXRcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvY2Vzc2VkSW5wdXRcbiAgfSxcblxuICBzdGFydExvY2FsaXplKCkge1xuICAgIHRoaXMubG9jYWxpemVkQ29kZSA9IFtdXG4gICAgdGhpcy5zaG91bGRMb2NhbGl6ZSA9IHRydWVcbiAgfSxcbiAgZW5kTG9jYWxpemUoKSB7XG4gICAgdGhpcy5zaG91bGRMb2NhbGl6ZSA9IGZhbHNlXG5cbiAgICByZXR1cm4gWyB0aGlzLmNvZGVOYW1lLCB0aGlzLmxvY2FsaXplZENvZGUuc2xpY2UoMCkgXVxuICB9LFxuXG4gIGZyZWUoIGdyYXBoICkge1xuICAgIGlmKCBBcnJheS5pc0FycmF5KCBncmFwaCApICkgeyAvLyBzdGVyZW8gdWdlblxuICAgICAgZm9yKCBsZXQgY2hhbm5lbCBvZiBncmFwaCApIHtcbiAgICAgICAgdGhpcy5mcmVlKCBjaGFubmVsIClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIHR5cGVvZiBncmFwaCA9PT0gJ29iamVjdCcgKSB7XG4gICAgICAgIGlmKCBncmFwaC5tZW1vcnkgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICBmb3IoIGxldCBtZW1vcnlLZXkgaW4gZ3JhcGgubWVtb3J5ICkge1xuICAgICAgICAgICAgdGhpcy5tZW1vcnkuZnJlZSggZ3JhcGgubWVtb3J5WyBtZW1vcnlLZXkgXS5pZHggKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggZ3JhcGguaW5wdXRzICkgKSB7XG4gICAgICAgICAgZm9yKCBsZXQgdWdlbiBvZiBncmFwaC5pbnB1dHMgKSB7XG4gICAgICAgICAgICB0aGlzLmZyZWUoIHVnZW4gKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdlblxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidndCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCggJHtpbnB1dHNbMF19ID4gJHtpbnB1dHNbMV19KSB8IDAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA+IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0LmlucHV0cyA9IFsgeCx5IF1cbiAgZ3QubmFtZSA9IGd0LmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGd0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidndGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCggJHtpbnB1dHNbMF19ID49ICR7aW5wdXRzWzFdfSB8IDAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA+PSBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG5cXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBndCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBndC5pbnB1dHMgPSBbIHgseSBdXG4gIGd0Lm5hbWUgPSAnZ3RlJyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBndFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2d0cCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ID0gYCgke2lucHV0c1sgMCBdfSAqICggKCAke2lucHV0c1swXX0gPiAke2lucHV0c1sxXX0gKSB8IDAgKSApYCBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKCAoIGlucHV0c1swXSA+IGlucHV0c1sxXSApIHwgMCApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0cCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBndHAuaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBndHBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMT0wICkgPT4ge1xuICBsZXQgdWdlbiA9IHtcbiAgICBpbnB1dHM6IFsgaW4xIF0sXG4gICAgbWVtb3J5OiB7IHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSB9LFxuICAgIHJlY29yZGVyOiBudWxsLFxuXG4gICAgaW4oIHYgKSB7XG4gICAgICBpZiggZ2VuLmhpc3Rvcmllcy5oYXMoIHYgKSApe1xuICAgICAgICBsZXQgbWVtb0hpc3RvcnkgPSBnZW4uaGlzdG9yaWVzLmdldCggdiApXG4gICAgICAgIHVnZW4ubmFtZSA9IG1lbW9IaXN0b3J5Lm5hbWVcbiAgICAgICAgcmV0dXJuIG1lbW9IaXN0b3J5XG4gICAgICB9XG5cbiAgICAgIGxldCBvYmogPSB7XG4gICAgICAgIGdlbigpIHtcbiAgICAgICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdWdlbiApXG5cbiAgICAgICAgICBpZiggdWdlbi5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkge1xuICAgICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdWdlbi5tZW1vcnkudmFsdWUuaWR4IF0gPSBpbjFcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4XG4gICAgICAgICAgXG4gICAgICAgICAgZ2VuLmFkZFRvRW5kQmxvY2soICdtZW1vcnlbICcgKyBpZHggKyAnIF0gPSAnICsgaW5wdXRzWyAwIF0gKVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIHJldHVybiB1Z2VuIHRoYXQgaXMgYmVpbmcgcmVjb3JkZWQgaW5zdGVhZCBvZiBzc2QuXG4gICAgICAgICAgLy8gdGhpcyBlZmZlY3RpdmVseSBtYWtlcyBhIGNhbGwgdG8gc3NkLnJlY29yZCgpIHRyYW5zcGFyZW50IHRvIHRoZSBncmFwaC5cbiAgICAgICAgICAvLyByZWNvcmRpbmcgaXMgdHJpZ2dlcmVkIGJ5IHByaW9yIGNhbGwgdG8gZ2VuLmFkZFRvRW5kQmxvY2suXG4gICAgICAgICAgZ2VuLmhpc3Rvcmllcy5zZXQoIHYsIG9iaiApXG5cbiAgICAgICAgICByZXR1cm4gaW5wdXRzWyAwIF1cbiAgICAgICAgfSxcbiAgICAgICAgbmFtZTogdWdlbi5uYW1lICsgJ19pbicrZ2VuLmdldFVJRCgpLFxuICAgICAgICBtZW1vcnk6IHVnZW4ubWVtb3J5XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5wdXRzWyAwIF0gPSB2XG4gICAgICBcbiAgICAgIHVnZW4ucmVjb3JkZXIgPSBvYmpcblxuICAgICAgcmV0dXJuIG9ialxuICAgIH0sXG4gICAgXG4gICAgb3V0OiB7XG4gICAgICAgICAgICBcbiAgICAgIGdlbigpIHtcbiAgICAgICAgaWYoIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCApIHtcbiAgICAgICAgICBpZiggZ2VuLmhpc3Rvcmllcy5nZXQoIHVnZW4uaW5wdXRzWzBdICkgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGdlbi5oaXN0b3JpZXMuc2V0KCB1Z2VuLmlucHV0c1swXSwgdWdlbi5yZWNvcmRlciApXG4gICAgICAgICAgfVxuICAgICAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB1Z2VuLm1lbW9yeSApXG4gICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggXSA9IHBhcnNlRmxvYXQoIGluMSApXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGlkeCA9IHVnZW4ubWVtb3J5LnZhbHVlLmlkeFxuICAgICAgICAgXG4gICAgICAgIHJldHVybiAnbWVtb3J5WyAnICsgaWR4ICsgJyBdICdcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIHVpZDogZ2VuLmdldFVJRCgpLFxuICB9XG4gIFxuICB1Z2VuLm91dC5tZW1vcnkgPSB1Z2VuLm1lbW9yeSBcblxuICB1Z2VuLm5hbWUgPSAnaGlzdG9yeScgKyB1Z2VuLnVpZFxuICB1Z2VuLm91dC5uYW1lID0gdWdlbi5uYW1lICsgJ19vdXQnXG4gIHVnZW4uaW4uX25hbWUgID0gdWdlbi5uYW1lID0gJ19pbidcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidpZmVsc2UnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29uZGl0aW9uYWxzID0gdGhpcy5pbnB1dHNbMF0sXG4gICAgICAgIGRlZmF1bHRWYWx1ZSA9IGdlbi5nZXRJbnB1dCggY29uZGl0aW9uYWxzWyBjb25kaXRpb25hbHMubGVuZ3RoIC0gMV0gKSxcbiAgICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAke2RlZmF1bHRWYWx1ZX1cXG5gIFxuXG4gICAgLy9jb25zb2xlLmxvZyggJ2NvbmRpdGlvbmFsczonLCB0aGlzLm5hbWUsIGNvbmRpdGlvbmFscyApXG5cbiAgICAvL2NvbnNvbGUubG9nKCAnZGVmYXVsdFZhbHVlOicsIGRlZmF1bHRWYWx1ZSApXG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IGNvbmRpdGlvbmFscy5sZW5ndGggLSAyOyBpKz0gMiApIHtcbiAgICAgIGxldCBpc0VuZEJsb2NrID0gaSA9PT0gY29uZGl0aW9uYWxzLmxlbmd0aCAtIDMsXG4gICAgICAgICAgY29uZCAgPSBnZW4uZ2V0SW5wdXQoIGNvbmRpdGlvbmFsc1sgaSBdICksXG4gICAgICAgICAgcHJlYmxvY2sgPSBjb25kaXRpb25hbHNbIGkrMSBdLFxuICAgICAgICAgIGJsb2NrLCBibG9ja05hbWUsIG91dHB1dFxuXG4gICAgICAvL2NvbnNvbGUubG9nKCAncGInLCBwcmVibG9jayApXG5cbiAgICAgIGlmKCB0eXBlb2YgcHJlYmxvY2sgPT09ICdudW1iZXInICl7XG4gICAgICAgIGJsb2NrID0gcHJlYmxvY2tcbiAgICAgICAgYmxvY2tOYW1lID0gbnVsbFxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCBnZW4ubWVtb1sgcHJlYmxvY2submFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgLy8gdXNlZCB0byBwbGFjZSBhbGwgY29kZSBkZXBlbmRlbmNpZXMgaW4gYXBwcm9wcmlhdGUgYmxvY2tzXG4gICAgICAgICAgZ2VuLnN0YXJ0TG9jYWxpemUoKVxuXG4gICAgICAgICAgZ2VuLmdldElucHV0KCBwcmVibG9jayApXG5cbiAgICAgICAgICBibG9jayA9IGdlbi5lbmRMb2NhbGl6ZSgpXG4gICAgICAgICAgYmxvY2tOYW1lID0gYmxvY2tbMF1cbiAgICAgICAgICBibG9jayA9IGJsb2NrWyAxIF0uam9pbignJylcbiAgICAgICAgICBibG9jayA9ICcgICcgKyBibG9jay5yZXBsYWNlKCAvXFxuL2dpLCAnXFxuICAnIClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYmxvY2sgPSAnJ1xuICAgICAgICAgIGJsb2NrTmFtZSA9IGdlbi5tZW1vWyBwcmVibG9jay5uYW1lIF1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvdXRwdXQgPSBibG9ja05hbWUgPT09IG51bGwgPyBcbiAgICAgICAgYCAgJHt0aGlzLm5hbWV9X291dCA9ICR7YmxvY2t9YCA6XG4gICAgICAgIGAke2Jsb2NrfSAgJHt0aGlzLm5hbWV9X291dCA9ICR7YmxvY2tOYW1lfWBcbiAgICAgIFxuICAgICAgaWYoIGk9PT0wICkgb3V0ICs9ICcgJ1xuICAgICAgb3V0ICs9IFxuYCBpZiggJHtjb25kfSA9PT0gMSApIHtcbiR7b3V0cHV0fVxuICB9YFxuXG4gICAgICBpZiggIWlzRW5kQmxvY2sgKSB7XG4gICAgICAgIG91dCArPSBgIGVsc2VgXG4gICAgICB9ZWxzZXtcbiAgICAgICAgb3V0ICs9IGBcXG5gXG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfV9vdXRgXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9X291dGAsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBjb25kaXRpb25zID0gQXJyYXkuaXNBcnJheSggYXJnc1swXSApID8gYXJnc1swXSA6IGFyZ3NcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgY29uZGl0aW9ucyBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2luJyxcblxuICBnZW4oKSB7XG4gICAgZ2VuLnBhcmFtZXRlcnMucHVzaCggdGhpcy5uYW1lIClcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiB0aGlzLm5hbWVcbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIG5hbWUgKSA9PiB7XG4gIGxldCBpbnB1dCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBpbnB1dC5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIGlucHV0Lm5hbWUgPSBuYW1lICE9PSB1bmRlZmluZWQgPyBuYW1lIDogYCR7aW5wdXQuYmFzZW5hbWV9JHtpbnB1dC5pZH1gXG4gIGlucHV0WzBdID0ge1xuICAgIGdlbigpIHtcbiAgICAgIGlmKCAhIGdlbi5wYXJhbWV0ZXJzLmluY2x1ZGVzKCBpbnB1dC5uYW1lICkgKSBnZW4ucGFyYW1ldGVycy5wdXNoKCBpbnB1dC5uYW1lIClcbiAgICAgIHJldHVybiBpbnB1dC5uYW1lICsgJ1swXSdcbiAgICB9XG4gIH1cbiAgaW5wdXRbMV0gPSB7XG4gICAgZ2VuKCkge1xuICAgICAgaWYoICEgZ2VuLnBhcmFtZXRlcnMuaW5jbHVkZXMoIGlucHV0Lm5hbWUgKSApIGdlbi5wYXJhbWV0ZXJzLnB1c2goIGlucHV0Lm5hbWUgKVxuICAgICAgcmV0dXJuIGlucHV0Lm5hbWUgKyAnWzFdJ1xuICAgIH1cbiAgfVxuXG5cbiAgcmV0dXJuIGlucHV0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGxpYnJhcnkgPSB7XG4gIGV4cG9ydCggZGVzdGluYXRpb24gKSB7XG4gICAgaWYoIGRlc3RpbmF0aW9uID09PSB3aW5kb3cgKSB7XG4gICAgICBkZXN0aW5hdGlvbi5zc2QgPSBsaWJyYXJ5Lmhpc3RvcnkgICAgLy8gaGlzdG9yeSBpcyB3aW5kb3cgb2JqZWN0IHByb3BlcnR5LCBzbyB1c2Ugc3NkIGFzIGFsaWFzXG4gICAgICBkZXN0aW5hdGlvbi5pbnB1dCA9IGxpYnJhcnkuaW4gICAgICAgLy8gaW4gaXMgYSBrZXl3b3JkIGluIGphdmFzY3JpcHRcbiAgICAgIGRlc3RpbmF0aW9uLnRlcm5hcnkgPSBsaWJyYXJ5LnN3aXRjaCAvLyBzd2l0Y2ggaXMgYSBrZXl3b3JkIGluIGphdmFzY3JpcHRcblxuICAgICAgZGVsZXRlIGxpYnJhcnkuaGlzdG9yeVxuICAgICAgZGVsZXRlIGxpYnJhcnkuaW5cbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LnN3aXRjaFxuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24oIGRlc3RpbmF0aW9uLCBsaWJyYXJ5IClcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggbGlicmFyeSwgJ3NhbXBsZXJhdGUnLCB7XG4gICAgICBnZXQoKSB7IHJldHVybiBsaWJyYXJ5Lmdlbi5zYW1wbGVyYXRlIH0sXG4gICAgICBzZXQodikge31cbiAgICB9KVxuXG4gICAgbGlicmFyeS5pbiA9IGRlc3RpbmF0aW9uLmlucHV0XG4gICAgbGlicmFyeS5oaXN0b3J5ID0gZGVzdGluYXRpb24uc3NkXG4gICAgbGlicmFyeS5zd2l0Y2ggPSBkZXN0aW5hdGlvbi50ZXJuYXJ5XG5cbiAgICBkZXN0aW5hdGlvbi5jbGlwID0gbGlicmFyeS5jbGFtcFxuICB9LFxuXG4gIGdlbjogICAgICByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gIFxuICBhYnM6ICAgICAgcmVxdWlyZSggJy4vYWJzLmpzJyApLFxuICByb3VuZDogICAgcmVxdWlyZSggJy4vcm91bmQuanMnICksXG4gIHBhcmFtOiAgICByZXF1aXJlKCAnLi9wYXJhbS5qcycgKSxcbiAgYWRkOiAgICAgIHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgc3ViOiAgICAgIHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgbXVsOiAgICAgIHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgZGl2OiAgICAgIHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgYWNjdW06ICAgIHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICBjb3VudGVyOiAgcmVxdWlyZSggJy4vY291bnRlci5qcycgKSxcbiAgc2luOiAgICAgIHJlcXVpcmUoICcuL3Npbi5qcycgKSxcbiAgY29zOiAgICAgIHJlcXVpcmUoICcuL2Nvcy5qcycgKSxcbiAgdGFuOiAgICAgIHJlcXVpcmUoICcuL3Rhbi5qcycgKSxcbiAgdGFuaDogICAgIHJlcXVpcmUoICcuL3RhbmguanMnICksXG4gIGFzaW46ICAgICByZXF1aXJlKCAnLi9hc2luLmpzJyApLFxuICBhY29zOiAgICAgcmVxdWlyZSggJy4vYWNvcy5qcycgKSxcbiAgYXRhbjogICAgIHJlcXVpcmUoICcuL2F0YW4uanMnICksICBcbiAgcGhhc29yOiAgIHJlcXVpcmUoICcuL3BoYXNvci5qcycgKSxcbiAgZGF0YTogICAgIHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gIHBlZWs6ICAgICByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICBjeWNsZTogICAgcmVxdWlyZSggJy4vY3ljbGUuanMnICksXG4gIGhpc3Rvcnk6ICByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICBkZWx0YTogICAgcmVxdWlyZSggJy4vZGVsdGEuanMnICksXG4gIGZsb29yOiAgICByZXF1aXJlKCAnLi9mbG9vci5qcycgKSxcbiAgY2VpbDogICAgIHJlcXVpcmUoICcuL2NlaWwuanMnICksXG4gIG1pbjogICAgICByZXF1aXJlKCAnLi9taW4uanMnICksXG4gIG1heDogICAgICByZXF1aXJlKCAnLi9tYXguanMnICksXG4gIHNpZ246ICAgICByZXF1aXJlKCAnLi9zaWduLmpzJyApLFxuICBkY2Jsb2NrOiAgcmVxdWlyZSggJy4vZGNibG9jay5qcycgKSxcbiAgbWVtbzogICAgIHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gIHJhdGU6ICAgICByZXF1aXJlKCAnLi9yYXRlLmpzJyApLFxuICB3cmFwOiAgICAgcmVxdWlyZSggJy4vd3JhcC5qcycgKSxcbiAgbWl4OiAgICAgIHJlcXVpcmUoICcuL21peC5qcycgKSxcbiAgY2xhbXA6ICAgIHJlcXVpcmUoICcuL2NsYW1wLmpzJyApLFxuICBwb2tlOiAgICAgcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgZGVsYXk6ICAgIHJlcXVpcmUoICcuL2RlbGF5LmpzJyApLFxuICBmb2xkOiAgICAgcmVxdWlyZSggJy4vZm9sZC5qcycgKSxcbiAgbW9kIDogICAgIHJlcXVpcmUoICcuL21vZC5qcycgKSxcbiAgc2FoIDogICAgIHJlcXVpcmUoICcuL3NhaC5qcycgKSxcbiAgbm9pc2U6ICAgIHJlcXVpcmUoICcuL25vaXNlLmpzJyApLFxuICBub3Q6ICAgICAgcmVxdWlyZSggJy4vbm90LmpzJyApLFxuICBndDogICAgICAgcmVxdWlyZSggJy4vZ3QuanMnICksXG4gIGd0ZTogICAgICByZXF1aXJlKCAnLi9ndGUuanMnICksXG4gIGx0OiAgICAgICByZXF1aXJlKCAnLi9sdC5qcycgKSwgXG4gIGx0ZTogICAgICByZXF1aXJlKCAnLi9sdGUuanMnICksIFxuICBib29sOiAgICAgcmVxdWlyZSggJy4vYm9vbC5qcycgKSxcbiAgZ2F0ZTogICAgIHJlcXVpcmUoICcuL2dhdGUuanMnICksXG4gIHRyYWluOiAgICByZXF1aXJlKCAnLi90cmFpbi5qcycgKSxcbiAgc2xpZGU6ICAgIHJlcXVpcmUoICcuL3NsaWRlLmpzJyApLFxuICBpbjogICAgICAgcmVxdWlyZSggJy4vaW4uanMnICksXG4gIHQ2MDogICAgICByZXF1aXJlKCAnLi90NjAuanMnKSxcbiAgbXRvZjogICAgIHJlcXVpcmUoICcuL210b2YuanMnKSxcbiAgbHRwOiAgICAgIHJlcXVpcmUoICcuL2x0cC5qcycpLCAgICAgICAgLy8gVE9ETzogdGVzdFxuICBndHA6ICAgICAgcmVxdWlyZSggJy4vZ3RwLmpzJyksICAgICAgICAvLyBUT0RPOiB0ZXN0XG4gIHN3aXRjaDogICByZXF1aXJlKCAnLi9zd2l0Y2guanMnICksXG4gIG1zdG9zYW1wczpyZXF1aXJlKCAnLi9tc3Rvc2FtcHMuanMnICksIC8vIFRPRE86IG5lZWRzIHRlc3QsXG4gIHNlbGVjdG9yOiByZXF1aXJlKCAnLi9zZWxlY3Rvci5qcycgKSxcbiAgdXRpbGl0aWVzOnJlcXVpcmUoICcuL3V0aWxpdGllcy5qcycgKSxcbiAgcG93OiAgICAgIHJlcXVpcmUoICcuL3Bvdy5qcycgKSxcbiAgYXR0YWNrOiAgIHJlcXVpcmUoICcuL2F0dGFjay5qcycgKSxcbiAgZGVjYXk6ICAgIHJlcXVpcmUoICcuL2RlY2F5LmpzJyApLFxuICB3aW5kb3dzOiAgcmVxdWlyZSggJy4vd2luZG93cy5qcycgKSxcbiAgZW52OiAgICAgIHJlcXVpcmUoICcuL2Vudi5qcycgKSxcbiAgYWQ6ICAgICAgIHJlcXVpcmUoICcuL2FkLmpzJyAgKSxcbiAgYWRzcjogICAgIHJlcXVpcmUoICcuL2Fkc3IuanMnICksXG4gIGlmZWxzZTogICByZXF1aXJlKCAnLi9pZmVsc2VpZi5qcycgKSxcbiAgYmFuZzogICAgIHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gIGFuZDogICAgICByZXF1aXJlKCAnLi9hbmQuanMnICksXG4gIHBhbjogICAgICByZXF1aXJlKCAnLi9wYW4uanMnICksXG4gIGVxOiAgICAgICByZXF1aXJlKCAnLi9lcS5qcycgKSxcbiAgbmVxOiAgICAgIHJlcXVpcmUoICcuL25lcS5qcycgKSxcbiAgZXhwOiAgICAgIHJlcXVpcmUoICcuL2V4cC5qcycgKVxufVxuXG5saWJyYXJ5Lmdlbi5saWIgPSBsaWJyYXJ5XG5cbm1vZHVsZS5leHBvcnRzID0gbGlicmFyeVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidsdCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoKCAke2lucHV0c1swXX0gPCAke2lucHV0c1sxXX0pIHwgMCAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBsdCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBsdC5pbnB1dHMgPSBbIHgseSBdXG4gIGx0Lm5hbWUgPSBsdC5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBsdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2x0ZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoICR7aW5wdXRzWzBdfSA8PSAke2lucHV0c1sxXX0gfCAwICApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdIDw9IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBsdCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBsdC5pbnB1dHMgPSBbIHgseSBdXG4gIGx0Lm5hbWUgPSAnbHRlJyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBsdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2x0cCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ID0gYCgke2lucHV0c1sgMCBdfSAqICgoICR7aW5wdXRzWzBdfSA8ICR7aW5wdXRzWzFdfSApIHwgMCApIClgIFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gKiAoKCBpbnB1dHNbMF0gPCBpbnB1dHNbMV0gKSB8IDAgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBsdHAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHRwLmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gbHRwXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbWF4JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLm1heCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLm1heCggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLm1heCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICksIHBhcnNlRmxvYXQoIGlucHV0c1sxXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbWF4ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1heC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIG1heFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J21lbW8nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKGluMSxtZW1vTmFtZSkgPT4ge1xuICBsZXQgbWVtbyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIG1lbW8uaW5wdXRzID0gWyBpbjEgXVxuICBtZW1vLmlkICAgPSBnZW4uZ2V0VUlEKClcbiAgbWVtby5uYW1lID0gbWVtb05hbWUgIT09IHVuZGVmaW5lZCA/IG1lbW9OYW1lICsgJ18nICsgZ2VuLmdldFVJRCgpIDogYCR7bWVtby5iYXNlbmFtZX0ke21lbW8uaWR9YFxuXG4gIHJldHVybiBtZW1vXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbWluJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLm1pbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLm1pbiggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLm1pbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICksIHBhcnNlRmxvYXQoIGlucHV0c1sxXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbWluID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1pbi5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIG1pblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW89IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiwgdD0uNSApID0+IHtcbiAgbGV0IHVnZW4gPSBtZW1vKCBhZGQoIG11bChpbjEsIHN1YigxLHQgKSApLCBtdWwoIGluMiwgdCApICkgKVxuICB1Z2VuLm5hbWUgPSAnbWl4JyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBsZXQgbW9kID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0PScoJyxcbiAgICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgICAgbW9kQXRFbmQgPSBmYWxzZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAlIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gJSAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgJSAnIFxuICAgICAgfSlcblxuICAgICAgb3V0ICs9ICcpJ1xuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gbW9kXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J21zdG9zYW1wcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcmV0dXJuVmFsdWVcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWUgfSA9ICR7Z2VuLnNhbXBsZXJhdGV9IC8gMTAwMCAqICR7aW5wdXRzWzBdfSBcXG5cXG5gXG4gICAgIFxuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gb3V0XG4gICAgICBcbiAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGdlbi5zYW1wbGVyYXRlIC8gMTAwMCAqIHRoaXMuaW5wdXRzWzBdXG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0XG4gICAgfSAgICBcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBtc3Rvc2FtcHMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbXN0b3NhbXBzLmlucHV0cyA9IFsgeCBdXG4gIG1zdG9zYW1wcy5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbXN0b3NhbXBzXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbXRvZicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgKCAke3RoaXMudHVuaW5nfSAqIGdlbi5leHAoIC4wNTc3NjIyNjUgKiAoJHtpbnB1dHNbMF19IC0gNjkpICkgKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSB0aGlzLnR1bmluZyAqIE1hdGguZXhwKCAuMDU3NzYyMjY1ICogKCBpbnB1dHNbMF0gLSA2OSkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHgsIHByb3BzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgdHVuaW5nOjQ0MCB9XG4gIFxuICBpZiggcHJvcHMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIHByb3BzLmRlZmF1bHRzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBkZWZhdWx0cyApXG4gIHVnZW4uaW5wdXRzID0gWyB4IF1cbiAgXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTogJ211bCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgLFxuICAgICAgICBzdW0gPSAxLCBudW1Db3VudCA9IDAsIG11bEF0RW5kID0gZmFsc2UsIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZVxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICBvdXQgKz0gdlxuICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgbXVsQXRFbmQgPSB0cnVlXG4gICAgICAgICAgb3V0ICs9ICcgKiAnXG4gICAgICAgIH1cbiAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCBpID09PSAwICkge1xuICAgICAgICAgIHN1bSA9IHZcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3VtICo9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICB9XG4gICAgICAgIG51bUNvdW50KytcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYoIG51bUNvdW50ID4gMCApIHtcbiAgICAgIG91dCArPSBtdWxBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKiAnICsgc3VtXG4gICAgfVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgY29uc3QgbXVsID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgT2JqZWN0LmFzc2lnbiggbXVsLCB7XG4gICAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICAgIGlucHV0czogYXJncyxcbiAgfSlcbiAgXG4gIG11bC5uYW1lID0gbXVsLmJhc2VuYW1lICsgbXVsLmlkXG5cbiAgcmV0dXJuIG11bFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbmVxJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSAvKnRoaXMuaW5wdXRzWzBdICE9PSB0aGlzLmlucHV0c1sxXSA/IDEgOiovIGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ICE9PSAke2lucHV0c1sxXX0pIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J25vaXNlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dFxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdub2lzZScgOiBNYXRoLnJhbmRvbSB9KVxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGdlbi5ub2lzZSgpXFxuYFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBub2lzZSA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgbm9pc2UubmFtZSA9IHByb3RvLm5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbm9pc2Vcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidub3QnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSApIHtcbiAgICAgIG91dCA9IGAoICR7aW5wdXRzWzBdfSA9PT0gMCA/IDEgOiAwIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9ICFpbnB1dHNbMF0gPT09IDAgPyAxIDogMFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IG5vdCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBub3QuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gbm90XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBtdWwgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BhbicsIFxuICBpbml0VGFibGUoKSB7ICAgIFxuICAgIGxldCBidWZmZXJMID0gbmV3IEZsb2F0MzJBcnJheSggMTAyNCApLFxuICAgICAgICBidWZmZXJSID0gbmV3IEZsb2F0MzJBcnJheSggMTAyNCApXG5cbiAgICBjb25zdCBhbmdUb1JhZCA9IE1hdGguUEkgLyAxODBcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IDEwMjQ7IGkrKyApIHsgXG4gICAgICBsZXQgcGFuID0gaSAqICggOTAgLyAxMDI0IClcbiAgICAgIGJ1ZmZlckxbaV0gPSBNYXRoLmNvcyggcGFuICogYW5nVG9SYWQgKSBcbiAgICAgIGJ1ZmZlclJbaV0gPSBNYXRoLnNpbiggcGFuICogYW5nVG9SYWQgKVxuICAgIH1cblxuICAgIGdlbi5nbG9iYWxzLnBhbkwgPSBkYXRhKCBidWZmZXJMLCAxLCB7IGltbXV0YWJsZTp0cnVlIH0pXG4gICAgZ2VuLmdsb2JhbHMucGFuUiA9IGRhdGEoIGJ1ZmZlclIsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSlcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBsZWZ0SW5wdXQsIHJpZ2h0SW5wdXQsIHBhbiA9LjUsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGlmKCBnZW4uZ2xvYmFscy5wYW5MID09PSB1bmRlZmluZWQgKSBwcm90by5pbml0VGFibGUoKVxuXG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBsZWZ0SW5wdXQsIHJpZ2h0SW5wdXQgXSxcbiAgICBsZWZ0OiAgICBtdWwoIGxlZnRJbnB1dCwgcGVlayggZ2VuLmdsb2JhbHMucGFuTCwgcGFuLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pICksXG4gICAgcmlnaHQ6ICAgbXVsKCByaWdodElucHV0LCBwZWVrKCBnZW4uZ2xvYmFscy5wYW5SLCBwYW4sIHsgYm91bmRtb2RlOidjbGFtcCcgfSkgKVxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdwYXJhbScsXG5cbiAgZ2VuKCkge1xuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgXG4gICAgZ2VuLnBhcmFtcy5hZGQoeyBbdGhpcy5uYW1lXTogdGhpcyB9KVxuXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMuaW5pdGlhbFZhbHVlXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gXG5cbiAgICByZXR1cm4gZ2VuLm1lbW9bIHRoaXMubmFtZSBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBwcm9wTmFtZT0wLCB2YWx1ZT0wICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIGlmKCB0eXBlb2YgcHJvcE5hbWUgIT09ICdzdHJpbmcnICkge1xuICAgIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcbiAgICB1Z2VuLmluaXRpYWxWYWx1ZSA9IHByb3BOYW1lXG4gIH1lbHNle1xuICAgIHVnZW4ubmFtZSA9IHByb3BOYW1lXG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSB2YWx1ZVxuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldCggdiApIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IFxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICAgIGRhdGFVZ2VuID0gcmVxdWlyZSgnLi9kYXRhLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGVlaycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCwgZnVuY3Rpb25Cb2R5LCBuZXh0LCBsZW5ndGhJc0xvZzIsIGlkeFxuICAgIFxuICAgIGlkeCA9IGlucHV0c1sxXVxuICAgIGxlbmd0aElzTG9nMiA9IChNYXRoLmxvZzIoIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoICkgfCAwKSAgPT09IE1hdGgubG9nMiggdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKVxuXG4gICAgaWYoIHRoaXMubW9kZSAhPT0gJ3NpbXBsZScgKSB7XG5cbiAgICBmdW5jdGlvbkJvZHkgPSBgICB2YXIgJHt0aGlzLm5hbWV9X2RhdGFJZHggID0gJHtpZHh9LCBcbiAgICAgICR7dGhpcy5uYW1lfV9waGFzZSA9ICR7dGhpcy5tb2RlID09PSAnc2FtcGxlcycgPyBpbnB1dHNbMF0gOiBpbnB1dHNbMF0gKyAnICogJyArICh0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDEpIH0sIFxuICAgICAgJHt0aGlzLm5hbWV9X2luZGV4ID0gJHt0aGlzLm5hbWV9X3BoYXNlIHwgMCxcXG5gXG5cbiAgICBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICd3cmFwJyApIHtcbiAgICAgIG5leHQgPSBsZW5ndGhJc0xvZzIgP1xuICAgICAgYCggJHt0aGlzLm5hbWV9X2luZGV4ICsgMSApICYgKCR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IC0gMSlgIDpcbiAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9ID8gJHt0aGlzLm5hbWV9X2luZGV4ICsgMSAtICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9ZWxzZSBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdjbGFtcCcgKSB7XG4gICAgICBuZXh0ID0gXG4gICAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA/ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG4gICAgfSBlbHNlIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2ZvbGQnIHx8IHRoaXMuYm91bmRtb2RlID09PSAnbWlycm9yJyApIHtcbiAgICAgIG5leHQgPSBcbiAgICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDEgPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9ID8gJHt0aGlzLm5hbWV9X2luZGV4IC0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9ZWxzZXtcbiAgICAgICBuZXh0ID0gXG4gICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMWAgICAgIFxuICAgIH1cblxuICAgIGlmKCB0aGlzLmludGVycCA9PT0gJ2xpbmVhcicgKSB7ICAgICAgXG4gICAgZnVuY3Rpb25Cb2R5ICs9IGAgICAgICAke3RoaXMubmFtZX1fZnJhYyAgPSAke3RoaXMubmFtZX1fcGhhc2UgLSAke3RoaXMubmFtZX1faW5kZXgsXG4gICAgICAke3RoaXMubmFtZX1fYmFzZSAgPSBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgICR7dGhpcy5uYW1lfV9pbmRleCBdLFxuICAgICAgJHt0aGlzLm5hbWV9X25leHQgID0gJHtuZXh0fSxgXG4gICAgICBcbiAgICAgIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2lnbm9yZScgKSB7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSBgXG4gICAgICAke3RoaXMubmFtZX1fb3V0ICAgPSAke3RoaXMubmFtZX1faW5kZXggPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9IHx8ICR7dGhpcy5uYW1lfV9pbmRleCA8IDAgPyAwIDogJHt0aGlzLm5hbWV9X2Jhc2UgKyAke3RoaXMubmFtZX1fZnJhYyAqICggbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICR7dGhpcy5uYW1lfV9uZXh0IF0gLSAke3RoaXMubmFtZX1fYmFzZSApXFxuXFxuYFxuICAgICAgfWVsc2V7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSBgXG4gICAgICAke3RoaXMubmFtZX1fb3V0ICAgPSAke3RoaXMubmFtZX1fYmFzZSArICR7dGhpcy5uYW1lfV9mcmFjICogKCBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X25leHQgXSAtICR7dGhpcy5uYW1lfV9iYXNlIClcXG5cXG5gXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBmdW5jdGlvbkJvZHkgKz0gYCAgICAgICR7dGhpcy5uYW1lfV9vdXQgPSBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X2luZGV4IF1cXG5cXG5gXG4gICAgfVxuXG4gICAgfSBlbHNlIHsgLy8gbW9kZSBpcyBzaW1wbGVcbiAgICAgIGZ1bmN0aW9uQm9keSA9IGBtZW1vcnlbICR7aWR4fSArICR7IGlucHV0c1swXSB9IF1gXG4gICAgICBcbiAgICAgIHJldHVybiBmdW5jdGlvbkJvZHlcbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX291dCdcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSsnX291dCcsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgZGVmYXVsdHMgOiB7IGNoYW5uZWxzOjEsIG1vZGU6J3BoYXNlJywgaW50ZXJwOidsaW5lYXInLCBib3VuZG1vZGU6J3dyYXAnIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGlucHV0X2RhdGEsIGluZGV4PTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIC8vY29uc29sZS5sb2coIGRhdGFVZ2VuLCBnZW4uZGF0YSApXG5cbiAgLy8gWFhYIHdoeSBpcyBkYXRhVWdlbiBub3QgdGhlIGFjdHVhbCBmdW5jdGlvbj8gc29tZSB0eXBlIG9mIGJyb3dzZXJpZnkgbm9uc2Vuc2UuLi5cbiAgY29uc3QgZmluYWxEYXRhID0gdHlwZW9mIGlucHV0X2RhdGEuYmFzZW5hbWUgPT09ICd1bmRlZmluZWQnID8gZ2VuLmxpYi5kYXRhKCBpbnB1dF9kYXRhICkgOiBpbnB1dF9kYXRhXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgXG4gICAgeyBcbiAgICAgICdkYXRhJzogICAgIGZpbmFsRGF0YSxcbiAgICAgIGRhdGFOYW1lOiAgIGZpbmFsRGF0YS5uYW1lLFxuICAgICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgICAgaW5wdXRzOiAgICAgWyBpbmRleCwgZmluYWxEYXRhIF0sXG4gICAgfSxcbiAgICBwcm90by5kZWZhdWx0cyxcbiAgICBwcm9wZXJ0aWVzIFxuICApXG4gIFxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIG11bCAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHByb3RvID0geyBiYXNlbmFtZToncGhhc29yJyB9LFxuICAgIGRpdiAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApXG5cbmNvbnN0IGRlZmF1bHRzID0geyBtaW46IC0xLCBtYXg6IDEgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5ID0gMSwgcmVzZXQgPSAwLCBfcHJvcHMgKSA9PiB7XG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBfcHJvcHMgKVxuXG4gIGNvbnN0IHJhbmdlID0gcHJvcHMubWF4IC0gcHJvcHMubWluXG5cbiAgY29uc3QgdWdlbiA9IHR5cGVvZiBmcmVxdWVuY3kgPT09ICdudW1iZXInIFxuICAgID8gYWNjdW0oIChmcmVxdWVuY3kgKiByYW5nZSkgLyBnZW4uc2FtcGxlcmF0ZSwgcmVzZXQsIHByb3BzICkgXG4gICAgOiBhY2N1bSggXG4gICAgICAgIGRpdiggXG4gICAgICAgICAgbXVsKCBmcmVxdWVuY3ksIHJhbmdlICksXG4gICAgICAgICAgZ2VuLnNhbXBsZXJhdGVcbiAgICAgICAgKSwgXG4gICAgICAgIHJlc2V0LCBwcm9wcyBcbiAgICApXG5cbiAgdWdlbi5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBtdWwgID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICB3cmFwID0gcmVxdWlyZSgnLi93cmFwLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncG9rZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBkYXRhTmFtZSA9ICdtZW1vcnknLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGlkeCwgb3V0LCB3cmFwcGVkXG4gICAgXG4gICAgaWR4ID0gdGhpcy5kYXRhLmdlbigpXG5cbiAgICAvL2dlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgLy93cmFwcGVkID0gd3JhcCggdGhpcy5pbnB1dHNbMV0sIDAsIHRoaXMuZGF0YUxlbmd0aCApLmdlbigpXG4gICAgLy9pZHggPSB3cmFwcGVkWzBdXG4gICAgLy9nZW4uZnVuY3Rpb25Cb2R5ICs9IHdyYXBwZWRbMV1cbiAgICBsZXQgb3V0cHV0U3RyID0gdGhpcy5pbnB1dHNbMV0gPT09IDAgP1xuICAgICAgYCAgJHtkYXRhTmFtZX1bICR7aWR4fSBdID0gJHtpbnB1dHNbMF19XFxuYCA6XG4gICAgICBgICAke2RhdGFOYW1lfVsgJHtpZHh9ICsgJHtpbnB1dHNbMV19IF0gPSAke2lucHV0c1swXX1cXG5gXG5cbiAgICBpZiggdGhpcy5pbmxpbmUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGdlbi5mdW5jdGlvbkJvZHkgKz0gb3V0cHV0U3RyXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gWyB0aGlzLmlubGluZSwgb3V0cHV0U3RyIF1cbiAgICB9XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gKCBkYXRhLCB2YWx1ZSwgaW5kZXgsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBjaGFubmVsczoxIH0gXG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGRhdGEsXG4gICAgZGF0YU5hbWU6ICAgZGF0YS5uYW1lLFxuICAgIGRhdGFMZW5ndGg6IGRhdGEuYnVmZmVyLmxlbmd0aCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyB2YWx1ZSwgaW5kZXggXSxcbiAgfSxcbiAgZGVmYXVsdHMgKVxuXG5cbiAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkXG4gIFxuICBnZW4uaGlzdG9yaWVzLnNldCggdWdlbi5uYW1lLCB1Z2VuIClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwb3cnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAncG93JzogTWF0aC5wb3cgfSlcblxuICAgICAgb3V0ID0gYGdlbi5wb3coICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKCB0eXBlb2YgaW5wdXRzWzBdID09PSAnc3RyaW5nJyAmJiBpbnB1dHNbMF1bMF0gPT09ICcoJyApIHtcbiAgICAgICAgaW5wdXRzWzBdID0gaW5wdXRzWzBdLnNsaWNlKDEsLTEpXG4gICAgICB9XG4gICAgICBpZiggdHlwZW9mIGlucHV0c1sxXSA9PT0gJ3N0cmluZycgJiYgaW5wdXRzWzFdWzBdID09PSAnKCcgKSB7XG4gICAgICAgIGlucHV0c1sxXSA9IGlucHV0c1sxXS5zbGljZSgxLC0xKVxuICAgICAgfVxuXG4gICAgICBvdXQgPSBNYXRoLnBvdyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICksIHBhcnNlRmxvYXQoIGlucHV0c1sxXSkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBwb3cgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgcG93LmlucHV0cyA9IFsgeCx5IF1cbiAgcG93LmlkID0gZ2VuLmdldFVJRCgpXG4gIHBvdy5uYW1lID0gYCR7cG93LmJhc2VuYW1lfXtwb3cuaWR9YFxuXG4gIHJldHVybiBwb3dcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKSxcbiAgICBkZWx0YSAgID0gcmVxdWlyZSggJy4vZGVsdGEuanMnICksXG4gICAgd3JhcCAgICA9IHJlcXVpcmUoICcuL3dyYXAuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncmF0ZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHBoYXNlICA9IGhpc3RvcnkoKSxcbiAgICAgICAgaW5NaW51czEgPSBoaXN0b3J5KCksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZpbHRlciwgc3VtLCBvdXRcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiB0aGlzIH0pIFxuXG4gICAgb3V0ID0gXG5gIHZhciAke3RoaXMubmFtZX1fZGlmZiA9ICR7aW5wdXRzWzBdfSAtICR7Z2VuTmFtZX0ubGFzdFNhbXBsZVxuICBpZiggJHt0aGlzLm5hbWV9X2RpZmYgPCAtLjUgKSAke3RoaXMubmFtZX1fZGlmZiArPSAxXG4gICR7Z2VuTmFtZX0ucGhhc2UgKz0gJHt0aGlzLm5hbWV9X2RpZmYgKiAke2lucHV0c1sxXX1cbiAgaWYoICR7Z2VuTmFtZX0ucGhhc2UgPiAxICkgJHtnZW5OYW1lfS5waGFzZSAtPSAxXG4gICR7Z2VuTmFtZX0ubGFzdFNhbXBsZSA9ICR7aW5wdXRzWzBdfVxuYFxuICAgIG91dCA9ICcgJyArIG91dFxuXG4gICAgcmV0dXJuIFsgZ2VuTmFtZSArICcucGhhc2UnLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIHJhdGUgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgcGhhc2U6ICAgICAgMCxcbiAgICBsYXN0U2FtcGxlOiAwLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSwgcmF0ZSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J3JvdW5kJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGgucm91bmQgfSlcblxuICAgICAgb3V0ID0gYGdlbi5yb3VuZCggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5yb3VuZCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHJvdW5kID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHJvdW5kLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIHJvdW5kXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc2FoJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICAvL2dlbi5kYXRhWyB0aGlzLm5hbWUgXSA9IDBcbiAgICAvL2dlbi5kYXRhWyB0aGlzLm5hbWUgKyAnX2NvbnRyb2wnIF0gPSAwXG5cbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuXG5cbiAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9jb250cm9sID0gbWVtb3J5WyR7dGhpcy5tZW1vcnkuY29udHJvbC5pZHh9XSxcbiAgICAgICR7dGhpcy5uYW1lfV90cmlnZ2VyID0gJHtpbnB1dHNbMV19ID4gJHtpbnB1dHNbMl19ID8gMSA6IDBcblxuICBpZiggJHt0aGlzLm5hbWV9X3RyaWdnZXIgIT09ICR7dGhpcy5uYW1lfV9jb250cm9sICApIHtcbiAgICBpZiggJHt0aGlzLm5hbWV9X3RyaWdnZXIgPT09IDEgKSBcbiAgICAgIG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dID0gJHtpbnB1dHNbMF19XG4gICAgXG4gICAgbWVtb3J5WyR7dGhpcy5tZW1vcnkuY29udHJvbC5pZHh9XSA9ICR7dGhpcy5uYW1lfV90cmlnZ2VyXG4gIH1cbmBcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YFxuXG4gICAgcmV0dXJuIFsgYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYCwgJyAnICtvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGNvbnRyb2wsIHRocmVzaG9sZD0wLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgaW5pdDowIH1cblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbGFzdFNhbXBsZTogMCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEsIGNvbnRyb2wsdGhyZXNob2xkIF0sXG4gICAgbWVtb3J5OiB7XG4gICAgICBjb250cm9sOiB7IGlkeDpudWxsLCBsZW5ndGg6MSB9LFxuICAgICAgdmFsdWU6ICAgeyBpZHg6bnVsbCwgbGVuZ3RoOjEgfSxcbiAgICB9XG4gIH0sXG4gIGRlZmF1bHRzIClcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NlbGVjdG9yJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0LCByZXR1cm5WYWx1ZSA9IDBcbiAgICBcbiAgICBzd2l0Y2goIGlucHV0cy5sZW5ndGggKSB7XG4gICAgICBjYXNlIDIgOlxuICAgICAgICByZXR1cm5WYWx1ZSA9IGlucHV0c1sxXVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMyA6XG4gICAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX1fb3V0ID0gJHtpbnB1dHNbMF19ID09PSAxID8gJHtpbnB1dHNbMV19IDogJHtpbnB1dHNbMl19XFxuXFxuYDtcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSArICdfb3V0Jywgb3V0IF1cbiAgICAgICAgYnJlYWs7ICBcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIG91dCA9IFxuYCB2YXIgJHt0aGlzLm5hbWV9X291dCA9IDBcbiAgc3dpdGNoKCAke2lucHV0c1swXX0gKyAxICkge1xcbmBcblxuICAgICAgICBmb3IoIGxldCBpID0gMTsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKyApe1xuICAgICAgICAgIG91dCArPWAgICAgY2FzZSAke2l9OiAke3RoaXMubmFtZX1fb3V0ID0gJHtpbnB1dHNbaV19OyBicmVhaztcXG5gIFxuICAgICAgICB9XG5cbiAgICAgICAgb3V0ICs9ICcgIH1cXG5cXG4nXG4gICAgICAgIFxuICAgICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lICsgJ19vdXQnLCAnICcgKyBvdXQgXVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfb3V0J1xuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5pbnB1dHMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHNcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidzaWduJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguc2lnbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnNpZ24oICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2lnbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHNpZ24gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgc2lnbi5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBzaWduXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Npbic6IE1hdGguc2luIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uc2luKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5zaW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBzaW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgc2luLmlucHV0cyA9IFsgeCBdXG4gIHNpbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBzaW4ubmFtZSA9IGAke3Npbi5iYXNlbmFtZX17c2luLmlkfWBcblxuICByZXR1cm4gc2luXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBhZGQgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgbWVtbyAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gICAgZ3QgICAgICA9IHJlcXVpcmUoICcuL2d0LmpzJyApLFxuICAgIGRpdiAgICAgPSByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gICAgX3N3aXRjaCA9IHJlcXVpcmUoICcuL3N3aXRjaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBzbGlkZVVwID0gMSwgc2xpZGVEb3duID0gMSApID0+IHtcbiAgbGV0IHkxID0gaGlzdG9yeSgwKSxcbiAgICAgIGZpbHRlciwgc2xpZGVBbW91bnRcblxuICAvL3kgKG4pID0geSAobi0xKSArICgoeCAobikgLSB5IChuLTEpKS9zbGlkZSkgXG4gIHNsaWRlQW1vdW50ID0gX3N3aXRjaCggZ3QoaW4xLHkxLm91dCksIHNsaWRlVXAsIHNsaWRlRG93biApXG5cbiAgZmlsdGVyID0gbWVtbyggYWRkKCB5MS5vdXQsIGRpdiggc3ViKCBpbjEsIHkxLm91dCApLCBzbGlkZUFtb3VudCApICkgKVxuXG4gIHkxLmluKCBmaWx0ZXIgKVxuXG4gIHJldHVybiBmaWx0ZXJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc3ViJyxcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dD0wLFxuICAgICAgICBkaWZmID0gMCxcbiAgICAgICAgbmVlZHNQYXJlbnMgPSBmYWxzZSwgXG4gICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgbGFzdE51bWJlciA9IGlucHV0c1sgMCBdLFxuICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgIHN1YkF0RW5kID0gZmFsc2UsXG4gICAgICAgIGhhc1VnZW5zID0gZmFsc2UsXG4gICAgICAgIHJldHVyblZhbHVlID0gMFxuXG4gICAgdGhpcy5pbnB1dHMuZm9yRWFjaCggdmFsdWUgPT4geyBpZiggaXNOYU4oIHZhbHVlICkgKSBoYXNVZ2VucyA9IHRydWUgfSlcblxuICAgIG91dCA9ICcgIHZhciAnICsgdGhpcy5uYW1lICsgJyA9ICdcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICBsZXQgaXNOdW1iZXJVZ2VuID0gaXNOYU4oIHYgKSxcbiAgICAgICAgICBpc0ZpbmFsSWR4ICAgPSBpID09PSBpbnB1dHMubGVuZ3RoIC0gMVxuXG4gICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgLSB2XG4gICAgICAgIG91dCArPSBsYXN0TnVtYmVyXG4gICAgICAgIHJldHVyblxuICAgICAgfWVsc2V7XG4gICAgICAgIG5lZWRzUGFyZW5zID0gdHJ1ZVxuICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gLSAke3Z9YFxuICAgICAgfVxuXG4gICAgICBpZiggIWlzRmluYWxJZHggKSBvdXQgKz0gJyAtICcgXG4gICAgfSlcblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSwgb3V0IF1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgbGV0IHN1YiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCBzdWIsIHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3NcbiAgfSlcbiAgICAgICBcbiAgc3ViLm5hbWUgPSAnc3ViJyArIHN1Yi5pZFxuXG4gIHJldHVybiBzdWJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3N3aXRjaCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgaWYoIGlucHV0c1sxXSA9PT0gaW5wdXRzWzJdICkgcmV0dXJuIGlucHV0c1sxXSAvLyBpZiBib3RoIHBvdGVudGlhbCBvdXRwdXRzIGFyZSB0aGUgc2FtZSBqdXN0IHJldHVybiBvbmUgb2YgdGhlbVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX1fb3V0ID0gJHtpbnB1dHNbMF19ID09PSAxID8gJHtpbnB1dHNbMV19IDogJHtpbnB1dHNbMl19XFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfV9vdXRgXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9X291dGAsIG91dCBdXG4gIH0sXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGNvbnRyb2wsIGluMSA9IDEsIGluMiA9IDAgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgY29udHJvbCwgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondDYwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICByZXR1cm5WYWx1ZVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbICdleHAnIF06IE1hdGguZXhwIH0pXG5cbiAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBnZW4uZXhwKCAtNi45MDc3NTUyNzg5MjEgLyAke2lucHV0c1swXX0gKVxcblxcbmBcbiAgICAgXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBvdXRcbiAgICAgIFxuICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSwgb3V0IF1cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5leHAoIC02LjkwNzc1NTI3ODkyMSAvIGlucHV0c1swXSApXG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0XG4gICAgfSAgICBcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0NjAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdDYwLmlucHV0cyA9IFsgeCBdXG4gIHQ2MC5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdDYwXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3RhbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Rhbic6IE1hdGgudGFuIH0pXG5cbiAgICAgIG91dCA9IGBnZW4udGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdGFuLmlucHV0cyA9IFsgeCBdXG4gIHRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW4ubmFtZSA9IGAke3Rhbi5iYXNlbmFtZX17dGFuLmlkfWBcblxuICByZXR1cm4gdGFuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3RhbmgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICd0YW5oJzogTWF0aC50YW5oIH0pXG5cbiAgICAgIG91dCA9IGBnZW4udGFuaCggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgudGFuaCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHRhbmggPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdGFuaC5pbnB1dHMgPSBbIHggXVxuICB0YW5oLmlkID0gZ2VuLmdldFVJRCgpXG4gIHRhbmgubmFtZSA9IGAke3RhbmguYmFzZW5hbWV9e3RhbmguaWR9YFxuXG4gIHJldHVybiB0YW5oXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbHQgICAgICA9IHJlcXVpcmUoICcuL2x0LmpzJyApLFxuICAgIHBoYXNvciAgPSByZXF1aXJlKCAnLi9waGFzb3IuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeT00NDAsIHB1bHNld2lkdGg9LjUgKSA9PiB7XG4gIGxldCBncmFwaCA9IGx0KCBhY2N1bSggZGl2KCBmcmVxdWVuY3ksIDQ0MTAwICkgKSwgLjUgKVxuXG4gIGdyYXBoLm5hbWUgPSBgdHJhaW4ke2dlbi5nZXRVSUQoKX1gXG5cbiAgcmV0dXJuIGdyYXBoXG59XG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApXG5cbmxldCBpc1N0ZXJlbyA9IGZhbHNlXG5cbmxldCB1dGlsaXRpZXMgPSB7XG4gIGN0eDogbnVsbCxcblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmNhbGxiYWNrID0gKCkgPT4gMFxuICAgIHRoaXMuY2xlYXIuY2FsbGJhY2tzLmZvckVhY2goIHYgPT4gdigpIClcbiAgICB0aGlzLmNsZWFyLmNhbGxiYWNrcy5sZW5ndGggPSAwXG4gIH0sXG5cbiAgY3JlYXRlQ29udGV4dCgpIHtcbiAgICBsZXQgQUMgPSB0eXBlb2YgQXVkaW9Db250ZXh0ID09PSAndW5kZWZpbmVkJyA/IHdlYmtpdEF1ZGlvQ29udGV4dCA6IEF1ZGlvQ29udGV4dFxuICAgIHRoaXMuY3R4ID0gbmV3IEFDKClcblxuICAgIGdlbi5zYW1wbGVyYXRlID0gdGhpcy5jdHguc2FtcGxlUmF0ZVxuXG4gICAgbGV0IHN0YXJ0ID0gKCkgPT4ge1xuICAgICAgaWYoIHR5cGVvZiBBQyAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHN0YXJ0IClcblxuICAgICAgICAgIGlmKCAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7IC8vIHJlcXVpcmVkIHRvIHN0YXJ0IGF1ZGlvIHVuZGVyIGlPUyA2XG4gICAgICAgICAgICAgbGV0IG15U291cmNlID0gdXRpbGl0aWVzLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuICAgICAgICAgICAgIG15U291cmNlLmNvbm5lY3QoIHV0aWxpdGllcy5jdHguZGVzdGluYXRpb24gKVxuICAgICAgICAgICAgIG15U291cmNlLm5vdGVPbiggMCApXG4gICAgICAgICAgIH1cbiAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiggZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHN0YXJ0IClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuXG4gIGNyZWF0ZVNjcmlwdFByb2Nlc3NvcigpIHtcbiAgICB0aGlzLm5vZGUgPSB0aGlzLmN0eC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoIDEwMjQsIDAsIDIgKVxuICAgIHRoaXMuY2xlYXJGdW5jdGlvbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMCB9XG4gICAgaWYoIHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSAndW5kZWZpbmVkJyApIHRoaXMuY2FsbGJhY2sgPSB0aGlzLmNsZWFyRnVuY3Rpb25cblxuICAgIHRoaXMubm9kZS5vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uKCBhdWRpb1Byb2Nlc3NpbmdFdmVudCApIHtcbiAgICAgIHZhciBvdXRwdXRCdWZmZXIgPSBhdWRpb1Byb2Nlc3NpbmdFdmVudC5vdXRwdXRCdWZmZXI7XG5cbiAgICAgIHZhciBsZWZ0ID0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAwICksXG4gICAgICAgICAgcmlnaHQ9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMSApLFxuICAgICAgICAgIGlzU3RlcmVvID0gdXRpbGl0aWVzLmlzU3RlcmVvXG5cbiAgICAgZm9yKCB2YXIgc2FtcGxlID0gMDsgc2FtcGxlIDwgbGVmdC5sZW5ndGg7IHNhbXBsZSsrICkge1xuICAgICAgICB2YXIgb3V0ID0gdXRpbGl0aWVzLmNhbGxiYWNrKClcblxuICAgICAgICBpZiggaXNTdGVyZW8gPT09IGZhbHNlICkge1xuICAgICAgICAgIGxlZnRbIHNhbXBsZSBdID0gcmlnaHRbIHNhbXBsZSBdID0gb3V0IFxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBsZWZ0WyBzYW1wbGUgIF0gPSBvdXRbMF1cbiAgICAgICAgICByaWdodFsgc2FtcGxlIF0gPSBvdXRbMV1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubm9kZS5jb25uZWN0KCB0aGlzLmN0eC5kZXN0aW5hdGlvbiApXG5cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuICBcbiAgcGxheUdyYXBoKCBncmFwaCwgZGVidWcsIG1lbT00NDEwMCoxMCwgbWVtVHlwZT1GbG9hdDMyQXJyYXkgKSB7XG4gICAgdXRpbGl0aWVzLmNsZWFyKClcbiAgICBpZiggZGVidWcgPT09IHVuZGVmaW5lZCApIGRlYnVnID0gZmFsc2VcbiAgICAgICAgICBcbiAgICB0aGlzLmlzU3RlcmVvID0gQXJyYXkuaXNBcnJheSggZ3JhcGggKVxuXG4gICAgdXRpbGl0aWVzLmNhbGxiYWNrID0gZ2VuLmNyZWF0ZUNhbGxiYWNrKCBncmFwaCwgbWVtLCBkZWJ1ZywgZmFsc2UsIG1lbVR5cGUgKVxuICAgIFxuICAgIGlmKCB1dGlsaXRpZXMuY29uc29sZSApIHV0aWxpdGllcy5jb25zb2xlLnNldFZhbHVlKCB1dGlsaXRpZXMuY2FsbGJhY2sudG9TdHJpbmcoKSApXG5cbiAgICByZXR1cm4gdXRpbGl0aWVzLmNhbGxiYWNrXG4gIH0sXG5cbiAgbG9hZFNhbXBsZSggc291bmRGaWxlUGF0aCwgZGF0YSApIHtcbiAgICBsZXQgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICByZXEub3BlbiggJ0dFVCcsIHNvdW5kRmlsZVBhdGgsIHRydWUgKVxuICAgIHJlcS5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInIFxuICAgIFxuICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoIChyZXNvbHZlLHJlamVjdCkgPT4ge1xuICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXVkaW9EYXRhID0gcmVxLnJlc3BvbnNlXG5cbiAgICAgICAgdXRpbGl0aWVzLmN0eC5kZWNvZGVBdWRpb0RhdGEoIGF1ZGlvRGF0YSwgKGJ1ZmZlcikgPT4ge1xuICAgICAgICAgIGRhdGEuYnVmZmVyID0gYnVmZmVyLmdldENoYW5uZWxEYXRhKDApXG4gICAgICAgICAgcmVzb2x2ZSggZGF0YS5idWZmZXIgKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXEuc2VuZCgpXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbn1cblxudXRpbGl0aWVzLmNsZWFyLmNhbGxiYWNrcyA9IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbGl0aWVzXG4iLCIndXNlIHN0cmljdCdcblxuLypcbiAqIG1hbnkgd2luZG93cyBoZXJlIGFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vY29yYmFuYnJvb2svZHNwLmpzL2Jsb2IvbWFzdGVyL2RzcC5qc1xuICogc3RhcnRpbmcgYXQgbGluZSAxNDI3XG4gKiB0YWtlbiA4LzE1LzE2XG4qLyBcblxuY29uc3Qgd2luZG93cyA9IG1vZHVsZS5leHBvcnRzID0geyBcbiAgYmFydGxldHQoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDIgLyAobGVuZ3RoIC0gMSkgKiAoKGxlbmd0aCAtIDEpIC8gMiAtIE1hdGguYWJzKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikpIFxuICB9LFxuXG4gIGJhcnRsZXR0SGFubiggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC42MiAtIDAuNDggKiBNYXRoLmFicyhpbmRleCAvIChsZW5ndGggLSAxKSAtIDAuNSkgLSAwLjM4ICogTWF0aC5jb3MoIDIgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgYmxhY2ttYW4oIGxlbmd0aCwgaW5kZXgsIGFscGhhICkge1xuICAgIGxldCBhMCA9ICgxIC0gYWxwaGEpIC8gMixcbiAgICAgICAgYTEgPSAwLjUsXG4gICAgICAgIGEyID0gYWxwaGEgLyAyXG5cbiAgICByZXR1cm4gYTAgLSBhMSAqIE1hdGguY29zKDIgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpICsgYTIgKiBNYXRoLmNvcyg0ICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKVxuICB9LFxuXG4gIGNvc2luZSggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gTWF0aC5jb3MoTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gTWF0aC5QSSAvIDIpXG4gIH0sXG5cbiAgZ2F1c3MoIGxlbmd0aCwgaW5kZXgsIGFscGhhICkge1xuICAgIHJldHVybiBNYXRoLnBvdyhNYXRoLkUsIC0wLjUgKiBNYXRoLnBvdygoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSAvIChhbHBoYSAqIChsZW5ndGggLSAxKSAvIDIpLCAyKSlcbiAgfSxcblxuICBoYW1taW5nKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjU0IC0gMC40NiAqIE1hdGguY29zKCBNYXRoLlBJICogMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKVxuICB9LFxuXG4gIGhhbm4oIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNSAqICgxIC0gTWF0aC5jb3MoIE1hdGguUEkgKiAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkpIClcbiAgfSxcblxuICBsYW5jem9zKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIGxldCB4ID0gMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMTtcbiAgICByZXR1cm4gTWF0aC5zaW4oTWF0aC5QSSAqIHgpIC8gKE1hdGguUEkgKiB4KVxuICB9LFxuXG4gIHJlY3Rhbmd1bGFyKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAxXG4gIH0sXG5cbiAgdHJpYW5ndWxhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMiAvIGxlbmd0aCAqIChsZW5ndGggLyAyIC0gTWF0aC5hYnMoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSlcbiAgfSxcblxuICAvLyBwYXJhYm9sYVxuICB3ZWxjaCggbGVuZ3RoLCBfaW5kZXgsIGlnbm9yZSwgc2hpZnQ9MCApIHtcbiAgICAvL3dbbl0gPSAxIC0gTWF0aC5wb3coICggbiAtICggKE4tMSkgLyAyICkgKSAvICgoIE4tMSApIC8gMiApLCAyIClcbiAgICBjb25zdCBpbmRleCA9IHNoaWZ0ID09PSAwID8gX2luZGV4IDogKF9pbmRleCArIE1hdGguZmxvb3IoIHNoaWZ0ICogbGVuZ3RoICkpICUgbGVuZ3RoXG4gICAgY29uc3Qgbl8xX292ZXIyID0gKGxlbmd0aCAtIDEpIC8gMiBcblxuICAgIHJldHVybiAxIC0gTWF0aC5wb3coICggaW5kZXggLSBuXzFfb3ZlcjIgKSAvIG5fMV9vdmVyMiwgMiApXG4gIH0sXG4gIGludmVyc2V3ZWxjaCggbGVuZ3RoLCBfaW5kZXgsIGlnbm9yZSwgc2hpZnQ9MCApIHtcbiAgICAvL3dbbl0gPSAxIC0gTWF0aC5wb3coICggbiAtICggKE4tMSkgLyAyICkgKSAvICgoIE4tMSApIC8gMiApLCAyIClcbiAgICBsZXQgaW5kZXggPSBzaGlmdCA9PT0gMCA/IF9pbmRleCA6IChfaW5kZXggKyBNYXRoLmZsb29yKCBzaGlmdCAqIGxlbmd0aCApKSAlIGxlbmd0aFxuICAgIGNvbnN0IG5fMV9vdmVyMiA9IChsZW5ndGggLSAxKSAvIDJcblxuICAgIHJldHVybiBNYXRoLnBvdyggKCBpbmRleCAtIG5fMV9vdmVyMiApIC8gbl8xX292ZXIyLCAyIClcbiAgfSxcblxuICBwYXJhYm9sYSggbGVuZ3RoLCBpbmRleCApIHtcbiAgICBpZiggaW5kZXggPD0gbGVuZ3RoIC8gMiApIHtcbiAgICAgIHJldHVybiB3aW5kb3dzLmludmVyc2V3ZWxjaCggbGVuZ3RoIC8gMiwgaW5kZXggKSAtIDFcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiAxIC0gd2luZG93cy5pbnZlcnNld2VsY2goIGxlbmd0aCAvIDIsIGluZGV4IC0gbGVuZ3RoIC8gMiApXG4gICAgfVxuICB9LFxuXG4gIGV4cG9uZW50aWFsKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICByZXR1cm4gTWF0aC5wb3coIGluZGV4IC8gbGVuZ3RoLCBhbHBoYSApXG4gIH0sXG5cbiAgbGluZWFyKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiBpbmRleCAvIGxlbmd0aFxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViICA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3dyYXAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBzaWduYWwgPSBpbnB1dHNbMF0sIG1pbiA9IGlucHV0c1sxXSwgbWF4ID0gaW5wdXRzWzJdLFxuICAgICAgICBvdXQsIGRpZmZcblxuICAgIC8vb3V0ID0gYCgoKCR7aW5wdXRzWzBdfSAtICR7dGhpcy5taW59KSAlICR7ZGlmZn0gICsgJHtkaWZmfSkgJSAke2RpZmZ9ICsgJHt0aGlzLm1pbn0pYFxuICAgIC8vY29uc3QgbG9uZyBudW1XcmFwcyA9IGxvbmcoKHYtbG8pL3JhbmdlKSAtICh2IDwgbG8pO1xuICAgIC8vcmV0dXJuIHYgLSByYW5nZSAqIGRvdWJsZShudW1XcmFwcyk7ICAgXG4gICAgXG4gICAgaWYoIHRoaXMubWluID09PSAwICkge1xuICAgICAgZGlmZiA9IG1heFxuICAgIH1lbHNlIGlmICggaXNOYU4oIG1heCApIHx8IGlzTmFOKCBtaW4gKSApIHtcbiAgICAgIGRpZmYgPSBgJHttYXh9IC0gJHttaW59YFxuICAgIH1lbHNle1xuICAgICAgZGlmZiA9IG1heCAtIG1pblxuICAgIH1cblxuICAgIG91dCA9XG5gIHZhciAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cbiAgaWYoICR7dGhpcy5uYW1lfSA8ICR7dGhpcy5taW59ICkgJHt0aGlzLm5hbWV9ICs9ICR7ZGlmZn1cbiAgZWxzZSBpZiggJHt0aGlzLm5hbWV9ID4gJHt0aGlzLm1heH0gKSAke3RoaXMubmFtZX0gLT0gJHtkaWZmfVxuXG5gXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsICcgJyArIG91dCBdXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xLCBtaW4sIG1heCBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwibGV0IHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5sZXQgYW5hbHl6ZXIgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuT2JqZWN0LmFzc2lnbiggYW5hbHl6ZXIsIHtcbiAgX190eXBlX186ICdhbmFseXplcicsXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFuYWx5emVyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgYW5hbHl6ZXJzID0ge1xuICAgIFNTRDogICAgcmVxdWlyZSggJy4vc2luZ2xlc2FtcGxlZGVsYXkuanMnICApKCBHaWJiZXJpc2ggKSxcbiAgICBGb2xsb3c6IHJlcXVpcmUoICcuL2ZvbGxvdy5qcycgICkoIEdpYmJlcmlzaCApXG4gIH1cblxuICBhbmFseXplcnMuZXhwb3J0ID0gdGFyZ2V0ID0+IHtcbiAgICBmb3IoIGxldCBrZXkgaW4gYW5hbHl6ZXJzICkge1xuICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgIHRhcmdldFsga2V5IF0gPSBhbmFseXplcnNbIGtleSBdXG4gICAgICB9XG4gICAgfVxuICB9XG5cbnJldHVybiBhbmFseXplcnNcblxufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoJ2dlbmlzaC5qcycpLFxuICAgICAgYW5hbHl6ZXIgPSByZXF1aXJlKCcuL2FuYWx5emVyLmpzJyksXG4gICAgICB1Z2VuID0gcmVxdWlyZSgnLi4vdWdlbi5qcycpO1xuXG5jb25zdCBnZW5pc2ggPSBnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChHaWJiZXJpc2gpIHtcblxuICBjb25zdCBGb2xsb3cgPSBpbnB1dFByb3BzID0+IHtcblxuICAgIC8vIG1haW4gZm9sbG93IG9iamVjdCBpcyBhbHNvIHRoZSBvdXRwdXRcbiAgICBjb25zdCBmb2xsb3cgPSBPYmplY3QuY3JlYXRlKGFuYWx5emVyKTtcbiAgICBmb2xsb3cuaW4gPSBPYmplY3QuY3JlYXRlKHVnZW4pO1xuICAgIGZvbGxvdy5pZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpO1xuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBpbnB1dFByb3BzLCBGb2xsb3cuZGVmYXVsdHMpO1xuICAgIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWU7XG5cbiAgICAvLyB0aGUgaW5wdXQgdG8gdGhlIGZvbGxvdyB1Z2VuIGlzIGJ1ZmZlcmVkIGluIHRoaXMgdWdlblxuICAgIGZvbGxvdy5idWZmZXIgPSBnLmRhdGEocHJvcHMuYnVmZmVyU2l6ZSwgMSk7XG5cbiAgICBsZXQgYXZnOyAvLyBvdXRwdXQ7IG1ha2UgYXZhaWxhYmxlIG91dHNpZGUganNkc3AgYmxvY2tcbiAgICBjb25zdCBfaW5wdXQgPSBnLmluKCdpbnB1dCcpO1xuICAgIGNvbnN0IGlucHV0ID0gaXNTdGVyZW8gPyBnLmFkZChfaW5wdXRbMF0sIF9pbnB1dFsxXSkgOiBfaW5wdXQ7XG5cbiAgICB7XG4gICAgICBcInVzZSBqc2RzcFwiO1xuICAgICAgLy8gcGhhc2UgdG8gd3JpdGUgdG8gZm9sbG93IGJ1ZmZlclxuICAgICAgY29uc3QgYnVmZmVyUGhhc2VPdXQgPSBnLmFjY3VtKDEsIDAsIHsgbWF4OiBwcm9wcy5idWZmZXJTaXplLCBtaW46IDAgfSk7XG5cbiAgICAgIC8vIGhvbGQgcnVubmluZyBzdW1cbiAgICAgIGNvbnN0IHN1bSA9IGcuZGF0YSgxLCAxLCB7IG1ldGE6IHRydWUgfSk7XG5cbiAgICAgIHN1bVswXSA9IGdlbmlzaC5zdWIoZ2VuaXNoLmFkZChzdW1bMF0sIGlucHV0KSwgZy5wZWVrKGZvbGxvdy5idWZmZXIsIGJ1ZmZlclBoYXNlT3V0LCB7IG1vZGU6ICdzaW1wbGUnIH0pKTtcblxuICAgICAgYXZnID0gZ2VuaXNoLmRpdihzdW1bMF0sIHByb3BzLmJ1ZmZlclNpemUpO1xuICAgIH1cblxuICAgIGlmICghaXNTdGVyZW8pIHtcbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KGZvbGxvdywgYXZnLCAnZm9sbG93X291dCcsIHByb3BzKTtcblxuICAgICAgZm9sbG93LmNhbGxiYWNrLnVnZW5OYW1lID0gZm9sbG93LnVnZW5OYW1lID0gYGZvbGxvd19vdXRfJHsgZm9sbG93LmlkIH1gO1xuXG4gICAgICAvLyBoYXZlIHRvIHdyaXRlIGN1c3RvbSBjYWxsYmFjayBmb3IgaW5wdXQgdG8gcmV1c2UgY29tcG9uZW50cyBmcm9tIG91dHB1dCxcbiAgICAgIC8vIHNwZWNpZmljYWxseSB0aGUgbWVtb3J5IGZyb20gb3VyIGJ1ZmZlclxuICAgICAgbGV0IGlkeCA9IGZvbGxvdy5idWZmZXIubWVtb3J5LnZhbHVlcy5pZHg7XG4gICAgICBsZXQgcGhhc2UgPSAwO1xuICAgICAgbGV0IGFicyA9IE1hdGguYWJzO1xuICAgICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24gKGlucHV0LCBtZW1vcnkpIHtcbiAgICAgICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgICAgIG1lbW9yeVtnZW5pc2guYWRkKGlkeCwgcGhhc2UpXSA9IGFicyhpbnB1dCk7XG4gICAgICAgIHBoYXNlKys7XG4gICAgICAgIGlmIChwaGFzZSA+IGdlbmlzaC5zdWIocHJvcHMuYnVmZmVyU2l6ZSwgMSkpIHtcbiAgICAgICAgICBwaGFzZSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH07XG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KGZvbGxvdy5pbiwgaW5wdXQsICdmb2xsb3dfaW4nLCBwcm9wcywgY2FsbGJhY2spO1xuXG4gICAgICAvLyBsb3RzIG9mIG5vbnNlbnNlIHRvIG1ha2Ugb3VyIGN1c3RvbSBmdW5jdGlvbiB3b3JrXG4gICAgICBmb2xsb3cuaW4uY2FsbGJhY2sudWdlbk5hbWUgPSBmb2xsb3cuaW4udWdlbk5hbWUgPSBgZm9sbG93X2luXyR7IGZvbGxvdy5pZCB9YDtcbiAgICAgIGZvbGxvdy5pbi5pbnB1dE5hbWVzID0gWydpbnB1dCddO1xuICAgICAgZm9sbG93LmluLmlucHV0cyA9IFtpbnB1dF07XG4gICAgICBmb2xsb3cuaW4uaW5wdXQgPSBwcm9wcy5pbnB1dDtcbiAgICAgIGZvbGxvdy5pbi50eXBlID0gJ2FuYWx5c2lzJztcblxuICAgICAgaWYgKEdpYmJlcmlzaC5hbmFseXplcnMuaW5kZXhPZihmb2xsb3cuaW4pID09PSAtMSkge1xuICAgICAgICBHaWJiZXJpc2guYW5hbHl6ZXJzLnB1c2goZm9sbG93LmluKTtcbiAgICAgIH1cblxuICAgICAgR2liYmVyaXNoLmRpcnR5KEdpYmJlcmlzaC5hbmFseXplcnMpO1xuICAgIH1cblxuICAgIHJldHVybiBmb2xsb3c7XG4gIH07XG5cbiAgRm9sbG93LmRlZmF1bHRzID0ge1xuICAgIGJ1ZmZlclNpemU6IDgxOTJcbiAgfTtcblxuICByZXR1cm4gRm9sbG93O1xufTsiLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGFuYWx5emVyID0gcmVxdWlyZSggJy4vYW5hbHl6ZXIuanMnICksXG4gICAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxuY29uc3QgRGVsYXkgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHNzZCA9IE9iamVjdC5jcmVhdGUoIGFuYWx5emVyIClcbiAgc3NkLmluICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICBzc2Qub3V0ID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbiAgc3NkLmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcblxuICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBEZWxheS5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnIClcbiAgICBcbiAgbGV0IGhpc3RvcnlMID0gZy5oaXN0b3J5KClcblxuICBpZiggaXNTdGVyZW8gKSB7XG4gICAgLy8gcmlnaHQgY2hhbm5lbFxuICAgIGxldCBoaXN0b3J5UiA9IGcuaGlzdG9yeSgpXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICBzc2Qub3V0LFxuICAgICAgWyBoaXN0b3J5TC5vdXQsIGhpc3RvcnlSLm91dCBdLCBcbiAgICAgICdzc2Rfb3V0JywgXG4gICAgICBwcm9wcyBcbiAgICApXG5cbiAgICBzc2Qub3V0LmNhbGxiYWNrLnVnZW5OYW1lID0gc3NkLm91dC51Z2VuTmFtZSA9ICdzc2Rfb3V0XycgKyBzc2QuaWRcblxuICAgIGNvbnN0IGlkeEwgPSBzc2Qub3V0LmdyYXBoLm1lbW9yeS52YWx1ZS5pZHgsIFxuICAgICAgICAgIGlkeFIgPSBpZHhMICsgMSxcbiAgICAgICAgICBtZW1vcnkgPSBHaWJiZXJpc2guZ2VuaXNoLmdlbi5tZW1vcnkuaGVhcFxuXG4gICAgY29uc3QgY2FsbGJhY2sgPSBmdW5jdGlvbiggaW5wdXQgKSB7XG4gICAgICAndXNlIHN0cmljdCdcbiAgICAgIG1lbW9yeVsgaWR4TCBdID0gaW5wdXRbMF1cbiAgICAgIG1lbW9yeVsgaWR4UiBdID0gaW5wdXRbMV1cbiAgICAgIHJldHVybiAwICAgICBcbiAgICB9XG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHNzZC5pbiwgWyBpbnB1dFswXSxpbnB1dFsxXSBdLCAnc3NkX2luJywgcHJvcHMsIGNhbGxiYWNrIClcblxuICAgIGNhbGxiYWNrLnVnZW5OYW1lID0gc3NkLmluLnVnZW5OYW1lID0gJ3NzZF9pbl8nICsgc3NkLmlkXG4gICAgc3NkLmluLmlucHV0TmFtZXMgPSBbICdpbnB1dCcgXVxuICAgIHNzZC5pbi5pbnB1dHMgPSBbIHByb3BzLmlucHV0IF1cbiAgICBzc2QuaW4uaW5wdXQgPSBwcm9wcy5pbnB1dFxuICAgIHNzZC50eXBlID0gJ2FuYWx5c2lzJ1xuXG4gICAgc3NkLmluLmxpc3RlbiA9IGZ1bmN0aW9uKCB1Z2VuICkge1xuICAgICAgaWYoIHVnZW4gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc3NkLmluLmlucHV0ID0gdWdlblxuICAgICAgICBzc2QuaW4uaW5wdXRzID0gWyB1Z2VuIF1cbiAgICAgIH1cblxuICAgICAgaWYoIEdpYmJlcmlzaC5hbmFseXplcnMuaW5kZXhPZiggc3NkLmluICkgPT09IC0xICkge1xuICAgICAgICBHaWJiZXJpc2guYW5hbHl6ZXJzLnB1c2goIHNzZC5pbiApXG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC5kaXJ0eSggR2liYmVyaXNoLmFuYWx5emVycyApXG4gICAgfVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggc3NkLm91dCwgaGlzdG9yeUwub3V0LCAnc3NkX291dCcsIHByb3BzIClcblxuICAgIHNzZC5vdXQuY2FsbGJhY2sudWdlbk5hbWUgPSBzc2Qub3V0LnVnZW5OYW1lID0gJ3NzZF9vdXRfJyArIHNzZC5pZFxuXG4gICAgbGV0IGlkeCA9IHNzZC5vdXQuZ3JhcGgubWVtb3J5LnZhbHVlLmlkeCBcbiAgICBsZXQgbWVtb3J5ID0gR2liYmVyaXNoLmdlbmlzaC5nZW4ubWVtb3J5LmhlYXBcbiAgICBsZXQgY2FsbGJhY2sgPSBmdW5jdGlvbiggaW5wdXQgKSB7XG4gICAgICAndXNlIHN0cmljdCdcbiAgICAgIG1lbW9yeVsgaWR4IF0gPSBpbnB1dFxuICAgICAgcmV0dXJuIDAgICAgIFxuICAgIH1cbiAgICBcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggc3NkLmluLCBpbnB1dCwgJ3NzZF9pbicsIHByb3BzLCBjYWxsYmFjayApXG5cbiAgICBjYWxsYmFjay51Z2VuTmFtZSA9IHNzZC5pbi51Z2VuTmFtZSA9ICdzc2RfaW5fJyArIHNzZC5pZFxuICAgIHNzZC5pbi5pbnB1dE5hbWVzID0gWyAnaW5wdXQnIF1cbiAgICBzc2QuaW4uaW5wdXRzID0gWyBwcm9wcy5pbnB1dCBdXG4gICAgc3NkLmluLmlucHV0ID0gcHJvcHMuaW5wdXRcbiAgICBzc2QudHlwZSA9ICdhbmFseXNpcydcblxuICAgIHNzZC5pbi5saXN0ZW4gPSBmdW5jdGlvbiggdWdlbiApIHtcbiAgICAgIGlmKCB1Z2VuICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHNzZC5pbi5pbnB1dCA9IHVnZW5cbiAgICAgICAgc3NkLmluLmlucHV0cyA9IFsgdWdlbiBdXG4gICAgICB9XG5cbiAgICAgIGlmKCBHaWJiZXJpc2guYW5hbHl6ZXJzLmluZGV4T2YoIHNzZC5pbiApID09PSAtMSApIHtcbiAgICAgICAgR2liYmVyaXNoLmFuYWx5emVycy5wdXNoKCBzc2QuaW4gKVxuICAgICAgfVxuXG4gICAgICBHaWJiZXJpc2guZGlydHkoIEdpYmJlcmlzaC5hbmFseXplcnMgKVxuICAgIH1cblxuICB9XG5cbiAgc3NkLmxpc3RlbiA9IHNzZC5pbi5saXN0ZW5cbiAgc3NkLmluLnR5cGUgPSAnYW5hbHlzaXMnXG4gXG4gIHNzZC5vdXQuaW5wdXRzID0gW11cblxuICByZXR1cm4gc3NkXG59XG5cbkRlbGF5LmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBpc1N0ZXJlbzpmYWxzZVxufVxuXG5yZXR1cm4gRGVsYXlcblxufVxuIiwiY29uc3QgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IEFEID0gZnVuY3Rpb24oIGFyZ3VtZW50UHJvcHMgKSB7XG4gICAgY29uc3QgYWQgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICksXG4gICAgICAgICAgYXR0YWNrICA9IGcuaW4oICdhdHRhY2snICksXG4gICAgICAgICAgZGVjYXkgICA9IGcuaW4oICdkZWNheScgKVxuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQUQuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgY29uc3QgZ3JhcGggPSBnLmFkKCBhdHRhY2ssIGRlY2F5LCB7IHNoYXBlOnByb3BzLnNoYXBlLCBhbHBoYTpwcm9wcy5hbHBoYSB9KVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIGFkLCBncmFwaCwgJ2FkJywgcHJvcHMgKVxuXG4gICAgYWQudHJpZ2dlciA9IGdyYXBoLnRyaWdnZXJcblxuICAgIHJldHVybiBhZFxuICB9XG5cbiAgQUQuZGVmYXVsdHMgPSB7IGF0dGFjazo0NDEwMCwgZGVjYXk6NDQxMDAsIHNoYXBlOidleHBvbmVudGlhbCcsIGFscGhhOjUgfSBcblxuICByZXR1cm4gQURcblxufVxuIiwiY29uc3QgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IEFEU1IgPSBmdW5jdGlvbiggYXJndW1lbnRQcm9wcyApIHtcbiAgICBjb25zdCBhZHNyICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSxcbiAgICAgICAgICBhdHRhY2sgID0gZy5pbiggJ2F0dGFjaycgKSxcbiAgICAgICAgICBkZWNheSAgID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICAgIHN1c3RhaW4gPSBnLmluKCAnc3VzdGFpbicgKSxcbiAgICAgICAgICByZWxlYXNlID0gZy5pbiggJ3JlbGVhc2UnICksXG4gICAgICAgICAgc3VzdGFpbkxldmVsID0gZy5pbiggJ3N1c3RhaW5MZXZlbCcgKVxuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQURTUi5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBjb25zdCBncmFwaCA9IGcuYWRzciggXG4gICAgICBhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCBzdXN0YWluTGV2ZWwsIHJlbGVhc2UsIFxuICAgICAgeyB0cmlnZ2VyUmVsZWFzZTogcHJvcHMudHJpZ2dlclJlbGVhc2UsIHNoYXBlOnByb3BzLnNoYXBlLCBhbHBoYTpwcm9wcy5hbHBoYSB9IFxuICAgIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBhZHNyLCBncmFwaCwgJ2Fkc3InLCBwcm9wcyApXG5cbiAgICBhZHNyLnRyaWdnZXIgPSBncmFwaC50cmlnZ2VyXG4gICAgYWRzci5hZHZhbmNlID0gZ3JhcGgucmVsZWFzZVxuXG4gICAgcmV0dXJuIGFkc3JcbiAgfVxuXG4gIEFEU1IuZGVmYXVsdHMgPSB7IFxuICAgIGF0dGFjazoyMjA1MCwgXG4gICAgZGVjYXk6MjIwNTAsIFxuICAgIHN1c3RhaW46NDQxMDAsIFxuICAgIHN1c3RhaW5MZXZlbDouNiwgXG4gICAgcmVsZWFzZTogNDQxMDAsIFxuICAgIHRyaWdnZXJSZWxlYXNlOmZhbHNlLFxuICAgIHNoYXBlOidleHBvbmVudGlhbCcsXG4gICAgYWxwaGE6NSBcbiAgfSBcblxuICByZXR1cm4gQURTUlxufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IEVudmVsb3BlcyA9IHtcbiAgICBBRCAgICAgOiByZXF1aXJlKCAnLi9hZC5qcycgKSggR2liYmVyaXNoICksXG4gICAgQURTUiAgIDogcmVxdWlyZSggJy4vYWRzci5qcycgKSggR2liYmVyaXNoICksXG4gICAgUmFtcCAgIDogcmVxdWlyZSggJy4vcmFtcC5qcycgKSggR2liYmVyaXNoICksXG5cbiAgICBleHBvcnQgOiB0YXJnZXQgPT4ge1xuICAgICAgZm9yKCBsZXQga2V5IGluIEVudmVsb3BlcyApIHtcbiAgICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgJiYga2V5ICE9PSAnZmFjdG9yeScgKSB7XG4gICAgICAgICAgdGFyZ2V0WyBrZXkgXSA9IEVudmVsb3Blc1sga2V5IF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBmYWN0b3J5KCB1c2VBRFNSLCBzaGFwZSwgYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgc3VzdGFpbkxldmVsLCByZWxlYXNlLCB0cmlnZ2VyUmVsZWFzZT1mYWxzZSApIHtcbiAgICAgIGxldCBlbnZcblxuICAgICAgLy8gZGVsaWJlcmF0ZSB1c2Ugb2Ygc2luZ2xlID0gdG8gYWNjb21vZGF0ZSBib3RoIDEgYW5kIHRydWVcbiAgICAgIGlmKCB1c2VBRFNSICE9IHRydWUgKSB7XG4gICAgICAgIGVudiA9IGcuYWQoIGF0dGFjaywgZGVjYXksIHsgc2hhcGUgfSkgXG4gICAgICB9ZWxzZSB7XG4gICAgICAgIGVudiA9IGcuYWRzciggYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgc3VzdGFpbkxldmVsLCByZWxlYXNlLCB7IHNoYXBlLCB0cmlnZ2VyUmVsZWFzZSB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZW52XG4gICAgfVxuICB9IFxuXG4gIHJldHVybiBFbnZlbG9wZXNcbn1cbiIsImNvbnN0IHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKSxcbiAgICAgIGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBSYW1wID0gZnVuY3Rpb24oIGFyZ3VtZW50UHJvcHMgKSB7XG4gICAgY29uc3QgcmFtcCAgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApLFxuICAgICAgICAgIGxlbmd0aCA9IGcuaW4oICdsZW5ndGgnICksXG4gICAgICAgICAgZnJvbSAgID0gZy5pbiggJ2Zyb20nICksXG4gICAgICAgICAgdG8gICAgID0gZy5pbiggJ3RvJyApXG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIFJhbXAuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgY29uc3QgcmVzZXQgPSBnLmJhbmcoKVxuXG4gICAgY29uc3QgcGhhc2UgPSBnLmFjY3VtKCBnLmRpdiggMSwgbGVuZ3RoICksIHJlc2V0LCB7IHNob3VsZFdyYXA6cHJvcHMuc2hvdWxkTG9vcCwgc2hvdWxkQ2xhbXA6dHJ1ZSB9KSxcbiAgICAgICAgICBkaWZmID0gZy5zdWIoIHRvLCBmcm9tICksXG4gICAgICAgICAgZ3JhcGggPSBnLmFkZCggZnJvbSwgZy5tdWwoIHBoYXNlLCBkaWZmICkgKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHJhbXAsIGdyYXBoLCAncmFtcCcsIHByb3BzIClcblxuICAgIHJhbXAudHJpZ2dlciA9IHJlc2V0LnRyaWdnZXJcblxuICAgIHJldHVybiByYW1wXG4gIH1cblxuICBSYW1wLmRlZmF1bHRzID0geyBmcm9tOjAsIHRvOjEsIGxlbmd0aDpnLmdlbi5zYW1wbGVyYXRlLCBzaG91bGRMb29wOmZhbHNlIH1cblxuICByZXR1cm4gUmFtcFxuXG59XG4iLCIvKlxuICogaHR0cHM6Ly9naXRodWIuY29tL2FudGltYXR0ZXIxNS9oZWFwcXVldWUuanMvYmxvYi9tYXN0ZXIvaGVhcHF1ZXVlLmpzXG4gKlxuICogVGhpcyBpbXBsZW1lbnRhdGlvbiBpcyB2ZXJ5IGxvb3NlbHkgYmFzZWQgb2ZmIGpzLXByaW9yaXR5LXF1ZXVlXG4gKiBieSBBZGFtIEhvb3BlciBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9hZGFtaG9vcGVyL2pzLXByaW9yaXR5LXF1ZXVlXG4gKlxuICogVGhlIGpzLXByaW9yaXR5LXF1ZXVlIGltcGxlbWVudGF0aW9uIHNlZW1lZCBhIHRlZW5zeSBiaXQgYmxvYXRlZFxuICogd2l0aCBpdHMgcmVxdWlyZS5qcyBkZXBlbmRlbmN5IGFuZCBtdWx0aXBsZSBzdG9yYWdlIHN0cmF0ZWdpZXNcbiAqIHdoZW4gYWxsIGJ1dCBvbmUgd2VyZSBzdHJvbmdseSBkaXNjb3VyYWdlZC4gU28gaGVyZSBpcyBhIGtpbmQgb2ZcbiAqIGNvbmRlbnNlZCB2ZXJzaW9uIG9mIHRoZSBmdW5jdGlvbmFsaXR5IHdpdGggb25seSB0aGUgZmVhdHVyZXMgdGhhdFxuICogSSBwYXJ0aWN1bGFybHkgbmVlZGVkLlxuICpcbiAqIFVzaW5nIGl0IGlzIHByZXR0eSBzaW1wbGUsIHlvdSBqdXN0IGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiBIZWFwUXVldWVcbiAqIHdoaWxlIG9wdGlvbmFsbHkgc3BlY2lmeWluZyBhIGNvbXBhcmF0b3IgYXMgdGhlIGFyZ3VtZW50OlxuICpcbiAqIHZhciBoZWFwcSA9IG5ldyBIZWFwUXVldWUoKTtcbiAqXG4gKiB2YXIgY3VzdG9tcSA9IG5ldyBIZWFwUXVldWUoZnVuY3Rpb24oYSwgYil7XG4gKiAgIC8vIGlmIGIgPiBhLCByZXR1cm4gbmVnYXRpdmVcbiAqICAgLy8gbWVhbnMgdGhhdCBpdCBzcGl0cyBvdXQgdGhlIHNtYWxsZXN0IGl0ZW0gZmlyc3RcbiAqICAgcmV0dXJuIGEgLSBiO1xuICogfSk7XG4gKlxuICogTm90ZSB0aGF0IGluIHRoaXMgY2FzZSwgdGhlIGRlZmF1bHQgY29tcGFyYXRvciBpcyBpZGVudGljYWwgdG9cbiAqIHRoZSBjb21wYXJhdG9yIHdoaWNoIGlzIHVzZWQgZXhwbGljaXRseSBpbiB0aGUgc2Vjb25kIHF1ZXVlLlxuICpcbiAqIE9uY2UgeW91J3ZlIGluaXRpYWxpemVkIHRoZSBoZWFwcXVldWUsIHlvdSBjYW4gcGxvcCBzb21lIG5ld1xuICogZWxlbWVudHMgaW50byB0aGUgcXVldWUgd2l0aCB0aGUgcHVzaCBtZXRob2QgKHZhZ3VlbHkgcmVtaW5pc2NlbnRcbiAqIG9mIHR5cGljYWwgamF2YXNjcmlwdCBhcmF5cylcbiAqXG4gKiBoZWFwcS5wdXNoKDQyKTtcbiAqIGhlYXBxLnB1c2goXCJraXR0ZW5cIik7XG4gKlxuICogVGhlIHB1c2ggbWV0aG9kIHJldHVybnMgdGhlIG5ldyBudW1iZXIgb2YgZWxlbWVudHMgb2YgdGhlIHF1ZXVlLlxuICpcbiAqIFlvdSBjYW4gcHVzaCBhbnl0aGluZyB5b3UnZCBsaWtlIG9udG8gdGhlIHF1ZXVlLCBzbyBsb25nIGFzIHlvdXJcbiAqIGNvbXBhcmF0b3IgZnVuY3Rpb24gaXMgY2FwYWJsZSBvZiBoYW5kbGluZyBpdC4gVGhlIGRlZmF1bHRcbiAqIGNvbXBhcmF0b3IgaXMgcmVhbGx5IHN0dXBpZCBzbyBpdCB3b24ndCBiZSBhYmxlIHRvIGhhbmRsZSBhbnl0aGluZ1xuICogb3RoZXIgdGhhbiBhbiBudW1iZXIgYnkgZGVmYXVsdC5cbiAqXG4gKiBZb3UgY2FuIHByZXZpZXcgdGhlIHNtYWxsZXN0IGl0ZW0gYnkgdXNpbmcgcGVlay5cbiAqXG4gKiBoZWFwcS5wdXNoKC05OTk5KTtcbiAqIGhlYXBxLnBlZWsoKTsgLy8gPT0+IC05OTk5XG4gKlxuICogVGhlIHVzZWZ1bCBjb21wbGVtZW50IHRvIHRvIHRoZSBwdXNoIG1ldGhvZCBpcyB0aGUgcG9wIG1ldGhvZCxcbiAqIHdoaWNoIHJldHVybnMgdGhlIHNtYWxsZXN0IGl0ZW0gYW5kIHRoZW4gcmVtb3ZlcyBpdCBmcm9tIHRoZVxuICogcXVldWUuXG4gKlxuICogaGVhcHEucHVzaCgxKTtcbiAqIGhlYXBxLnB1c2goMik7XG4gKiBoZWFwcS5wdXNoKDMpO1xuICogaGVhcHEucG9wKCk7IC8vID09PiAxXG4gKiBoZWFwcS5wb3AoKTsgLy8gPT0+IDJcbiAqIGhlYXBxLnBvcCgpOyAvLyA9PT4gM1xuICovXG5sZXQgSGVhcFF1ZXVlID0gZnVuY3Rpb24oY21wKXtcbiAgdGhpcy5jbXAgPSAoY21wIHx8IGZ1bmN0aW9uKGEsIGIpeyByZXR1cm4gYSAtIGI7IH0pO1xuICB0aGlzLmxlbmd0aCA9IDA7XG4gIHRoaXMuZGF0YSA9IFtdO1xufVxuSGVhcFF1ZXVlLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMuZGF0YVswXTtcbn07XG5IZWFwUXVldWUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbih2YWx1ZSl7XG4gIHRoaXMuZGF0YS5wdXNoKHZhbHVlKTtcblxuICB2YXIgcG9zID0gdGhpcy5kYXRhLmxlbmd0aCAtIDEsXG4gIHBhcmVudCwgeDtcblxuICB3aGlsZShwb3MgPiAwKXtcbiAgICBwYXJlbnQgPSAocG9zIC0gMSkgPj4+IDE7XG4gICAgaWYodGhpcy5jbXAodGhpcy5kYXRhW3Bvc10sIHRoaXMuZGF0YVtwYXJlbnRdKSA8IDApe1xuICAgICAgeCA9IHRoaXMuZGF0YVtwYXJlbnRdO1xuICAgICAgdGhpcy5kYXRhW3BhcmVudF0gPSB0aGlzLmRhdGFbcG9zXTtcbiAgICAgIHRoaXMuZGF0YVtwb3NdID0geDtcbiAgICAgIHBvcyA9IHBhcmVudDtcbiAgICB9ZWxzZSBicmVhaztcbiAgfVxuICByZXR1cm4gdGhpcy5sZW5ndGgrKztcbn07XG5IZWFwUXVldWUucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBsYXN0X3ZhbCA9IHRoaXMuZGF0YS5wb3AoKSxcbiAgcmV0ID0gdGhpcy5kYXRhWzBdO1xuICBpZih0aGlzLmRhdGEubGVuZ3RoID4gMCl7XG4gICAgdGhpcy5kYXRhWzBdID0gbGFzdF92YWw7XG4gICAgdmFyIHBvcyA9IDAsXG4gICAgbGFzdCA9IHRoaXMuZGF0YS5sZW5ndGggLSAxLFxuICAgIGxlZnQsIHJpZ2h0LCBtaW5JbmRleCwgeDtcbiAgICB3aGlsZSgxKXtcbiAgICAgIGxlZnQgPSAocG9zIDw8IDEpICsgMTtcbiAgICAgIHJpZ2h0ID0gbGVmdCArIDE7XG4gICAgICBtaW5JbmRleCA9IHBvcztcbiAgICAgIGlmKGxlZnQgPD0gbGFzdCAmJiB0aGlzLmNtcCh0aGlzLmRhdGFbbGVmdF0sIHRoaXMuZGF0YVttaW5JbmRleF0pIDwgMCkgbWluSW5kZXggPSBsZWZ0O1xuICAgICAgaWYocmlnaHQgPD0gbGFzdCAmJiB0aGlzLmNtcCh0aGlzLmRhdGFbcmlnaHRdLCB0aGlzLmRhdGFbbWluSW5kZXhdKSA8IDApIG1pbkluZGV4ID0gcmlnaHQ7XG4gICAgICBpZihtaW5JbmRleCAhPT0gcG9zKXtcbiAgICAgICAgeCA9IHRoaXMuZGF0YVttaW5JbmRleF07XG4gICAgICAgIHRoaXMuZGF0YVttaW5JbmRleF0gPSB0aGlzLmRhdGFbcG9zXTtcbiAgICAgICAgdGhpcy5kYXRhW3Bvc10gPSB4O1xuICAgICAgICBwb3MgPSBtaW5JbmRleDtcbiAgICAgIH1lbHNlIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXQgPSBsYXN0X3ZhbDtcbiAgfVxuICB0aGlzLmxlbmd0aC0tO1xuICByZXR1cm4gcmV0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFwUXVldWVcbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuIFxuLy8gY29uc3RydWN0b3IgZm9yIHNjaHJvZWRlciBhbGxwYXNzIGZpbHRlcnNcbmxldCBhbGxQYXNzID0gZnVuY3Rpb24oIF9pbnB1dCwgbGVuZ3RoPTUwMCwgZmVlZGJhY2s9LjUgKSB7XG4gIGxldCBpbmRleCAgPSBnLmNvdW50ZXIoIDEsMCxsZW5ndGggKSxcbiAgICAgIGJ1ZmZlciA9IGcuZGF0YSggbGVuZ3RoICksXG4gICAgICBidWZmZXJTYW1wbGUgPSBnLnBlZWsoIGJ1ZmZlciwgaW5kZXgsIHsgaW50ZXJwOidub25lJywgbW9kZTonc2FtcGxlcycgfSksXG4gICAgICBvdXQgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggLTEsIF9pbnB1dCksIGJ1ZmZlclNhbXBsZSApIClcbiAgICAgICAgICAgICAgICBcbiAgZy5wb2tlKCBidWZmZXIsIGcuYWRkKCBfaW5wdXQsIGcubXVsKCBidWZmZXJTYW1wbGUsIGZlZWRiYWNrICkgKSwgaW5kZXggKVxuIFxuICByZXR1cm4gb3V0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWxsUGFzc1xuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGZpbHRlciA9IHJlcXVpcmUoICcuL2ZpbHRlci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgR2liYmVyaXNoLmdlbmlzaC5iaXF1YWQgPSAoIGlucHV0LCBjdXRvZmYsIF9RLCBtb2RlLCBpc1N0ZXJlbyApID0+IHtcbiAgICBsZXQgYTAsYTEsYTIsYyxiMSxiMixcbiAgICAgICAgaW4xYTAseDFhMSx4MmEyLHkxYjEseTJiMixcbiAgICAgICAgaW4xYTBfMSx4MWExXzEseDJhMl8xLHkxYjFfMSx5MmIyXzFcblxuICAgIGxldCByZXR1cm5WYWx1ZVxuICAgIFxuICAgIGNvbnN0IFEgPSBnLm1lbW8oIGcuYWRkKCAuNSwgZy5tdWwoIF9RLCAyMiApICkgKVxuICAgIGxldCB4MSA9IGcuaGlzdG9yeSgpLCB4MiA9IGcuaGlzdG9yeSgpLCB5MSA9IGcuaGlzdG9yeSgpLCB5MiA9IGcuaGlzdG9yeSgpXG4gICAgXG4gICAgbGV0IHcwID0gZy5tZW1vKCBnLm11bCggMiAqIE1hdGguUEksIGcuZGl2KCBjdXRvZmYsICBnLmdlbi5zYW1wbGVyYXRlICkgKSApLFxuICAgICAgICBzaW53MCA9IGcuc2luKCB3MCApLFxuICAgICAgICBjb3N3MCA9IGcuY29zKCB3MCApLFxuICAgICAgICBhbHBoYSA9IGcubWVtbyggZy5kaXYoIHNpbncwLCBnLm11bCggMiwgUSApICkgKVxuXG4gICAgbGV0IG9uZU1pbnVzQ29zVyA9IGcuc3ViKCAxLCBjb3N3MCApXG5cbiAgICBzd2l0Y2goIG1vZGUgKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGEwID0gZy5tZW1vKCBnLmRpdiggZy5hZGQoIDEsIGNvc3cwKSAsIDIpIClcbiAgICAgICAgYTEgPSBnLm11bCggZy5hZGQoIDEsIGNvc3cwICksIC0xIClcbiAgICAgICAgYTIgPSBhMFxuICAgICAgICBjICA9IGcuYWRkKCAxLCBhbHBoYSApXG4gICAgICAgIGIxID0gZy5tdWwoIC0yICwgY29zdzAgKVxuICAgICAgICBiMiA9IGcuc3ViKCAxLCBhbHBoYSApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBhMCA9IGcubXVsKCBRLCBhbHBoYSApXG4gICAgICAgIGExID0gMFxuICAgICAgICBhMiA9IGcubXVsKCBhMCwgLTEgKVxuICAgICAgICBjICA9IGcuYWRkKCAxLCBhbHBoYSApXG4gICAgICAgIGIxID0gZy5tdWwoIC0yICwgY29zdzAgKVxuICAgICAgICBiMiA9IGcuc3ViKCAxLCBhbHBoYSApXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDogLy8gTFBcbiAgICAgICAgYTAgPSBnLm1lbW8oIGcuZGl2KCBvbmVNaW51c0Nvc1csIDIpIClcbiAgICAgICAgYTEgPSBvbmVNaW51c0Nvc1dcbiAgICAgICAgYTIgPSBhMFxuICAgICAgICBjICA9IGcuYWRkKCAxLCBhbHBoYSApXG4gICAgICAgIGIxID0gZy5tdWwoIC0yICwgY29zdzAgKVxuICAgICAgICBiMiA9IGcuc3ViKCAxLCBhbHBoYSApXG4gICAgfVxuXG4gICAgYTAgPSBnLmRpdiggYTAsIGMgKTsgYTEgPSBnLmRpdiggYTEsIGMgKTsgYTIgPSBnLmRpdiggYTIsIGMgKVxuICAgIGIxID0gZy5kaXYoIGIxLCBjICk7IGIyID0gZy5kaXYoIGIyLCBjIClcblxuICAgIGluMWEwID0gZy5tdWwoIHgxLmluKCBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXQgKSwgYTAgKVxuICAgIHgxYTEgID0gZy5tdWwoIHgyLmluKCB4MS5vdXQgKSwgYTEgKVxuICAgIHgyYTIgID0gZy5tdWwoIHgyLm91dCwgICAgICAgICAgYTIgKVxuXG4gICAgbGV0IHN1bUxlZnQgPSBnLmFkZCggaW4xYTAsIHgxYTEsIHgyYTIgKVxuXG4gICAgeTFiMSA9IGcubXVsKCB5Mi5pbiggeTEub3V0ICksIGIxIClcbiAgICB5MmIyID0gZy5tdWwoIHkyLm91dCwgYjIgKVxuXG4gICAgbGV0IHN1bVJpZ2h0ID0gZy5hZGQoIHkxYjEsIHkyYjIgKVxuXG4gICAgbGV0IGRpZmYgPSBnLnN1Yiggc3VtTGVmdCwgc3VtUmlnaHQgKVxuXG4gICAgeTEuaW4oIGRpZmYgKVxuXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgbGV0IHgxXzEgPSBnLmhpc3RvcnkoKSwgeDJfMSA9IGcuaGlzdG9yeSgpLCB5MV8xID0gZy5oaXN0b3J5KCksIHkyXzEgPSBnLmhpc3RvcnkoKVxuXG4gICAgICBpbjFhMF8xID0gZy5tdWwoIHgxXzEuaW4oIGlucHV0WzFdICksIGEwIClcbiAgICAgIHgxYTFfMSAgPSBnLm11bCggeDJfMS5pbiggeDFfMS5vdXQgKSwgYTEgKVxuICAgICAgeDJhMl8xICA9IGcubXVsKCB4Ml8xLm91dCwgICAgICAgICAgICBhMiApXG5cbiAgICAgIGxldCBzdW1MZWZ0XzEgPSBnLmFkZCggaW4xYTBfMSwgeDFhMV8xLCB4MmEyXzEgKVxuXG4gICAgICB5MWIxXzEgPSBnLm11bCggeTJfMS5pbiggeTFfMS5vdXQgKSwgYjEgKVxuICAgICAgeTJiMl8xID0gZy5tdWwoIHkyXzEub3V0LCBiMiApXG5cbiAgICAgIGxldCBzdW1SaWdodF8xID0gZy5hZGQoIHkxYjFfMSwgeTJiMl8xIClcblxuICAgICAgbGV0IGRpZmZfMSA9IGcuc3ViKCBzdW1MZWZ0XzEsIHN1bVJpZ2h0XzEgKVxuXG4gICAgICB5MV8xLmluKCBkaWZmXzEgKVxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgZGlmZiwgZGlmZl8xIF1cbiAgICB9ZWxzZXtcbiAgICAgIHJldHVyblZhbHVlID0gZGlmZlxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbiAgbGV0IEJpcXVhZCA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGxldCBiaXF1YWQgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIE9iamVjdC5hc3NpZ24oIGJpcXVhZCwgQmlxdWFkLmRlZmF1bHRzLCBpbnB1dFByb3BzICkgXG5cbiAgICBsZXQgaXNTdGVyZW8gPSBiaXF1YWQuaW5wdXQuaXNTdGVyZW9cblxuICAgIGJpcXVhZC5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgICBiaXF1YWQuZ3JhcGggPSBHaWJiZXJpc2guZ2VuaXNoLmJpcXVhZCggZy5pbignaW5wdXQnKSwgZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBnLmdlbi5zYW1wbGVyYXRlIC8gNCApLCAgZy5pbignUScpLCBiaXF1YWQubW9kZSwgaXNTdGVyZW8gKVxuICAgIH1cblxuICAgIGJpcXVhZC5fX2NyZWF0ZUdyYXBoKClcbiAgICBiaXF1YWQuX19yZXF1aXJlc1JlY29tcGlsYXRpb24gPSBbICdtb2RlJyBdXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIGJpcXVhZCxcbiAgICAgIGJpcXVhZC5ncmFwaCxcbiAgICAgICdiaXF1YWQnLCBcbiAgICAgIGJpcXVhZFxuICAgIClcblxuICAgIHJldHVybiBiaXF1YWRcbiAgfVxuXG4gIEJpcXVhZC5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIFE6IC4xNSxcbiAgICBjdXRvZmY6LjA1LFxuICAgIG1vZGU6MFxuICB9XG5cbiAgcmV0dXJuIEJpcXVhZFxuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5sZXQgY29tYkZpbHRlciA9IGZ1bmN0aW9uKCBfaW5wdXQsIGNvbWJMZW5ndGgsIGRhbXBpbmc9LjUqLjQsIGZlZWRiYWNrQ29lZmY9Ljg0ICkge1xuICBsZXQgbGFzdFNhbXBsZSAgID0gZy5oaXN0b3J5KCksXG4gIFx0ICByZWFkV3JpdGVJZHggPSBnLmNvdW50ZXIoIDEsMCxjb21iTGVuZ3RoICksXG4gICAgICBjb21iQnVmZmVyICAgPSBnLmRhdGEoIGNvbWJMZW5ndGggKSxcblx0ICAgIG91dCAgICAgICAgICA9IGcucGVlayggY29tYkJ1ZmZlciwgcmVhZFdyaXRlSWR4LCB7IGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pLFxuICAgICAgc3RvcmVJbnB1dCAgID0gZy5tZW1vKCBnLmFkZCggZy5tdWwoIG91dCwgZy5zdWIoIDEsIGRhbXBpbmcpKSwgZy5tdWwoIGxhc3RTYW1wbGUub3V0LCBkYW1waW5nICkgKSApXG4gICAgICBcbiAgbGFzdFNhbXBsZS5pbiggc3RvcmVJbnB1dCApXG4gXG4gIGcucG9rZSggY29tYkJ1ZmZlciwgZy5hZGQoIF9pbnB1dCwgZy5tdWwoIHN0b3JlSW5wdXQsIGZlZWRiYWNrQ29lZmYgKSApLCByZWFkV3JpdGVJZHggKVxuIFxuICByZXR1cm4gb3V0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29tYkZpbHRlclxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBmaWx0ZXIgPSByZXF1aXJlKCAnLi9maWx0ZXIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBHaWJiZXJpc2guZ2VuaXNoLmRpb2RlWkRGID0gKCBpbnB1dCwgX1EsIGZyZXEsIHNhdHVyYXRpb24sIGlzU3RlcmVvPWZhbHNlICkgPT4ge1xuICAgIGNvbnN0IGlUID0gMSAvIGcuZ2VuLnNhbXBsZXJhdGUsXG4gICAgICAgICAga3oxID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIGt6MiA9IGcuaGlzdG9yeSgwKSxcbiAgICAgICAgICBrejMgPSBnLmhpc3RvcnkoMCksXG4gICAgICAgICAga3o0ID0gZy5oaXN0b3J5KDApXG5cbiAgICBsZXQgICBrYTEgPSAxLjAsXG4gICAgICAgICAga2EyID0gMC41LFxuICAgICAgICAgIGthMyA9IDAuNSxcbiAgICAgICAgICBrYTQgPSAwLjUsXG4gICAgICAgICAga2luZHggPSAwICAgXG5cbiAgICBjb25zdCBRID0gZy5tZW1vKCBnLmFkZCggLjUsIGcubXVsKCBfUSwgMTEgKSApIClcbiAgICAvLyBrd2QgPSAyICogJE1fUEkgKiBhY2Zba2luZHhdXG4gICAgY29uc3Qga3dkID0gZy5tZW1vKCBnLm11bCggTWF0aC5QSSAqIDIsIGZyZXEgKSApXG5cbiAgICAvLyBrd2EgPSAoMi9pVCkgKiB0YW4oa3dkICogaVQvMikgXG4gICAgY29uc3Qga3dhID1nLm1lbW8oIGcubXVsKCAyL2lULCBnLnRhbiggZy5tdWwoIGt3ZCwgaVQvMiApICkgKSApXG5cbiAgICAvLyBrRyAgPSBrd2EgKiBpVC8yIFxuICAgIGNvbnN0IGtnID0gZy5tZW1vKCBnLm11bCgga3dhLCBpVC8yICkgKVxuICAgIFxuICAgIGNvbnN0IGtHNCA9IGcubWVtbyggZy5tdWwoIC41LCBnLmRpdigga2csIGcuYWRkKCAxLCBrZyApICkgKSApXG4gICAgY29uc3Qga0czID0gZy5tZW1vKCBnLm11bCggLjUsIGcuZGl2KCBrZywgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCggZy5tdWwoIC41LCBrZyApLCBrRzQgKSApICkgKSApXG4gICAgY29uc3Qga0cyID0gZy5tZW1vKCBnLm11bCggLjUsIGcuZGl2KCBrZywgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCggZy5tdWwoIC41LCBrZyApLCBrRzMgKSApICkgKSApXG4gICAgY29uc3Qga0cxID0gZy5tZW1vKCBnLmRpdigga2csIGcuc3ViKCBnLmFkZCggMSwga2cgKSwgZy5tdWwoIGtnLCBrRzIgKSApICkgKVxuXG4gICAgY29uc3Qga0dBTU1BID0gZy5tZW1vKCBnLm11bCggZy5tdWwoIGtHNCwga0czICkgLCBnLm11bCgga0cyLCBrRzEgKSApIClcblxuICAgIGNvbnN0IGtTRzEgPSBnLm1lbW8oIGcubXVsKCBnLm11bCgga0c0LCBrRzMgKSwga0cyICkgKSBcblxuICAgIGNvbnN0IGtTRzIgPSBnLm1lbW8oIGcubXVsKCBrRzQsIGtHMykgKSAgXG4gICAgY29uc3Qga1NHMyA9IGtHNCBcbiAgICBsZXQga1NHNCA9IDEuMCBcbiAgICAvLyBrayA9IDQuMCooa1EgLSAwLjUpLygyNS4wIC0gMC41KVxuICAgIGNvbnN0IGthbHBoYSA9IGcubWVtbyggZy5kaXYoIGtnLCBnLmFkZCgxLjAsIGtnKSApIClcblxuICAgIGNvbnN0IGtiZXRhMSA9IGcubWVtbyggZy5kaXYoIDEuMCwgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCgga2csIGtHMiApICkgKSApXG4gICAgY29uc3Qga2JldGEyID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBnLm11bCggLjUsIGtnICksIGtHMyApICkgKSApXG4gICAgY29uc3Qga2JldGEzID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBnLm11bCggLjUsIGtnICksIGtHNCApICkgKSApXG4gICAgY29uc3Qga2JldGE0ID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLmFkZCggMSwga2cgKSApICkgXG5cbiAgICBjb25zdCBrZ2FtbWExID0gZy5tZW1vKCBnLmFkZCggMSwgZy5tdWwoIGtHMSwga0cyICkgKSApXG4gICAgY29uc3Qga2dhbW1hMiA9IGcubWVtbyggZy5hZGQoIDEsIGcubXVsKCBrRzIsIGtHMyApICkgKVxuICAgIGNvbnN0IGtnYW1tYTMgPSBnLm1lbW8oIGcuYWRkKCAxLCBnLm11bCgga0czLCBrRzQgKSApIClcblxuICAgIGNvbnN0IGtkZWx0YTEgPSBrZ1xuICAgIGNvbnN0IGtkZWx0YTIgPSBnLm1lbW8oIGcubXVsKCAwLjUsIGtnICkgKVxuICAgIGNvbnN0IGtkZWx0YTMgPSBnLm1lbW8oIGcubXVsKCAwLjUsIGtnICkgKVxuXG4gICAgY29uc3Qga2Vwc2lsb24xID0ga0cyXG4gICAgY29uc3Qga2Vwc2lsb24yID0ga0czXG4gICAgY29uc3Qga2Vwc2lsb24zID0ga0c0XG5cbiAgICBjb25zdCBrbGFzdGN1dCA9IGZyZXFcblxuICAgIC8vOzsgZmVlZGJhY2sgaW5wdXRzIFxuICAgIGNvbnN0IGtmYjQgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTQgLCBrejQub3V0ICkgKSBcbiAgICBjb25zdCBrZmIzID0gZy5tZW1vKCBnLm11bCgga2JldGEzLCBnLmFkZCgga3ozLm91dCwgZy5tdWwoIGtmYjQsIGtkZWx0YTMgKSApICkgKVxuICAgIGNvbnN0IGtmYjIgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTIsIGcuYWRkKCBrejIub3V0LCBnLm11bCgga2ZiMywga2RlbHRhMiApICkgKSApXG5cbiAgICAvLzs7IGZlZWRiYWNrIHByb2Nlc3NcblxuICAgIGNvbnN0IGtmYm8xID0gZy5tZW1vKCBnLm11bCgga2JldGExLCBnLmFkZCgga3oxLm91dCwgZy5tdWwoIGtmYjIsIGtkZWx0YTEgKSApICkgKSBcbiAgICBjb25zdCBrZmJvMiA9IGcubWVtbyggZy5tdWwoIGtiZXRhMiwgZy5hZGQoIGt6Mi5vdXQsIGcubXVsKCBrZmIzLCBrZGVsdGEyICkgKSApICkgXG4gICAgY29uc3Qga2ZibzMgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTMsIGcuYWRkKCBrejMub3V0LCBnLm11bCgga2ZiNCwga2RlbHRhMyApICkgKSApIFxuICAgIGNvbnN0IGtmYm80ID0ga2ZiNFxuXG4gICAgY29uc3Qga1NJR01BID0gZy5tZW1vKCBcbiAgICAgIGcuYWRkKCBcbiAgICAgICAgZy5hZGQoIFxuICAgICAgICAgIGcubXVsKCBrU0cxLCBrZmJvMSApLCBcbiAgICAgICAgICBnLm11bCgga1NHMiwga2ZibzIgKVxuICAgICAgICApLCBcbiAgICAgICAgZy5hZGQoXG4gICAgICAgICAgZy5tdWwoIGtTRzMsIGtmYm8zICksIFxuICAgICAgICAgIGcubXVsKCBrU0c0LCBrZmJvNCApXG4gICAgICAgICkgXG4gICAgICApIFxuICAgIClcblxuICAgIC8vY29uc3Qga1NJR01BID0gMVxuICAgIC8vOzsgbm9uLWxpbmVhciBwcm9jZXNzaW5nXG4gICAgLy9pZiAoa25scCA9PSAxKSB0aGVuXG4gICAgLy8gIGtpbiA9ICgxLjAgLyB0YW5oKGtzYXR1cmF0aW9uKSkgKiB0YW5oKGtzYXR1cmF0aW9uICoga2luKVxuICAgIC8vZWxzZWlmIChrbmxwID09IDIpIHRoZW5cbiAgICAvLyAga2luID0gdGFuaChrc2F0dXJhdGlvbiAqIGtpbikgXG4gICAgLy9lbmRpZlxuICAgIC8vXG4gICAgLy9jb25zdCBraW4gPSBpbnB1dCBcbiAgICBsZXQga2luID0gaW5wdXQvL2cubWVtbyggZy5tdWwoIGcuZGl2KCAxLCBnLnRhbmgoIHNhdHVyYXRpb24gKSApLCBnLnRhbmgoIGcubXVsKCBzYXR1cmF0aW9uLCBpbnB1dCApICkgKSApXG4gICAga2luID0gZy50YW5oKCBnLm11bCggc2F0dXJhdGlvbiwga2luICkgKVxuXG4gICAgY29uc3Qga3VuID0gZy5kaXYoIGcuc3ViKCBraW4sIGcubXVsKCBRLCBrU0lHTUEgKSApLCBnLmFkZCggMSwgZy5tdWwoIFEsIGtHQU1NQSApICkgKVxuICAgIC8vY29uc3Qga3VuID0gZy5kaXYoIDEsIGcuYWRkKCAxLCBnLm11bCggUSwga0dBTU1BICkgKSApXG4gICAgICAgIC8vKGtpbiAtIGtrICoga1NJR01BKSAvICgxLjAgKyBrayAqIGtHQU1NQSlcblxuICAgIC8vOzsgMXN0IHN0YWdlXG4gICAgbGV0IGt4aW4gPSBnLm1lbW8oIGcuYWRkKCBnLmFkZCggZy5tdWwoIGt1biwga2dhbW1hMSApLCBrZmIyKSwgZy5tdWwoIGtlcHNpbG9uMSwga2ZibzEgKSApIClcbiAgICAvLyAoa3VuICoga2dhbW1hMSArIGtmYjIgKyBrZXBzaWxvbjEgKiBrZmJvMSlcbiAgICBsZXQga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthMSwga3hpbiApLCBrejEub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGxldCBrbHAgPSBnLmFkZCgga3YsIGt6MS5vdXQgKVxuICAgIC8va2xwID0ga3YgKyBrejFcbiAgICBrejEuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKSBcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAgICAgLy87OyAybmQgc3RhZ2VcbiAgICAvL2t4aW4gPSAoa2xwICoga2dhbW1hMiArIGtmYjMgKyBrZXBzaWxvbjIgKiBrZmJvMilcbiAgICAvL2t2ID0gKGthMiAqIGt4aW4gLSBrejIpICoga2FscGhhIFxuICAgIC8va2xwID0ga3YgKyBrejJcbiAgICAvL2t6MiA9IGtscCArIGt2XG5cbiAgICBreGluID0gZy5tZW1vKCBnLmFkZCggZy5hZGQoIGcubXVsKCBrbHAsIGtnYW1tYTIgKSwga2ZiMyksIGcubXVsKCBrZXBzaWxvbjIsIGtmYm8yICkgKSApXG4gICAgLy8gKGt1biAqIGtnYW1tYTEgKyBrZmIyICsga2Vwc2lsb24xICoga2ZibzEpXG4gICAga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthMiwga3hpbiApLCBrejIub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGtscCA9IGcuYWRkKCBrdiwga3oyLm91dCApIFxuICAgIC8va2xwID0ga3YgKyBrejFcbiAgICBrejIuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKSBcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAvLzs7IDNyZCBzdGFnZVxuICAgIC8va3hpbiA9IChrbHAgKiBrZ2FtbWEzICsga2ZiNCArIGtlcHNpbG9uMyAqIGtmYm8zKVxuICAgIC8va3YgPSAoa2EzICoga3hpbiAtIGt6MykgKiBrYWxwaGEgXG4gICAgLy9rbHAgPSBrdiArIGt6M1xuICAgIC8va3ozID0ga2xwICsga3ZcblxuICAgIGt4aW4gPSBnLm1lbW8oIGcuYWRkKCBnLmFkZCggZy5tdWwoIGtscCwga2dhbW1hMyApLCBrZmI0KSwgZy5tdWwoIGtlcHNpbG9uMywga2ZibzMgKSApIClcbiAgICAvLyAoa3VuICoga2dhbW1hMSArIGtmYjIgKyBrZXBzaWxvbjEgKiBrZmJvMSlcbiAgICBrdiA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBnLm11bCgga2EzLCBreGluICksIGt6My5vdXQgKSwga2FscGhhICkgKVxuICAgIC8va3YgPSAoa2ExICoga3hpbiAtIGt6MSkgKiBrYWxwaGEgXG4gICAga2xwID0gZy5hZGQoIGt2LCBrejMub3V0IClcbiAgICAvL2tscCA9IGt2ICsga3oxXG4gICAga3ozLmluKCBnLmFkZCgga2xwLCBrdiApIClcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAvLzs7IDR0aCBzdGFnZVxuICAgIC8va3YgPSAoa2E0ICoga2xwIC0ga3o0KSAqIGthbHBoYSBcbiAgICAvL2tscCA9IGt2ICsga3o0XG4gICAgLy9rejQgPSBrbHAgKyBrdlxuXG4gICAgLy8gKGt1biAqIGtnYW1tYTEgKyBrZmIyICsga2Vwc2lsb24xICoga2ZibzEpXG4gICAga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthNCwga3hpbiApLCBrejQub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGtscCA9IGcuYWRkKCBrdiwga3o0Lm91dCApXG4gICAgLy9rbHAgPSBrdiArIGt6MVxuICAgIGt6NC5pbiggZy5hZGQoIGtscCwga3YgKSApXG5cbiAgICAvL2t6MSA9IGtscCArIGt2XG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgLy9sZXQgcG9sZXNSID0gZy5kYXRhKFsgMCwwLDAsMCBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgIC8vICAgIHJlenpSID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzUlszXSwgcmV6ICkgKSxcbiAgICAgIC8vICAgIG91dHB1dFIgPSBnLnN1YiggaW5wdXRbMV0sIHJlenpSICkgICAgICAgICBcblxuICAgICAgLy9wb2xlc1JbMF0gPSBnLmFkZCggcG9sZXNSWzBdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMF0gKSwgb3V0cHV0UiAgICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMV0gPSBnLmFkZCggcG9sZXNSWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMV0gKSwgcG9sZXNSWzBdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMl0gPSBnLmFkZCggcG9sZXNSWzJdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMl0gKSwgcG9sZXNSWzFdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbM10gPSBnLmFkZCggcG9sZXNSWzNdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbM10gKSwgcG9sZXNSWzJdICksIGN1dG9mZiApKVxuXG4gICAgICAvL2xldCByaWdodCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzUlszXSwgZy5zdWIoIG91dHB1dFIsIHBvbGVzUlszXSApIClcblxuICAgICAgLy9yZXR1cm5WYWx1ZSA9IFtsZWZ0LCByaWdodF1cbiAgICB9ZWxzZXtcbiAgICAgLy8gcmV0dXJuVmFsdWUgPSBrbHBcbiAgICB9XG4gICAgcmV0dXJuVmFsdWUgPSBrbHBcbiAgICBcbiAgICByZXR1cm4gcmV0dXJuVmFsdWUvLyBrbHAvL3JldHVyblZhbHVlXG4gfVxuXG4gIGNvbnN0IERpb2RlWkRGID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgY29uc3QgemRmICAgICAgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIGNvbnN0IHByb3BzICAgID0gT2JqZWN0LmFzc2lnbigge30sIERpb2RlWkRGLmRlZmF1bHRzLCBmaWx0ZXIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIHpkZiwgXG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLmRpb2RlWkRGKCBnLmluKCdpbnB1dCcpLCBnLmluKCdRJyksIGcuaW4oJ2N1dG9mZicpLCBnLmluKCdzYXR1cmF0aW9uJyksIGlzU3RlcmVvICksIFxuICAgICAgJ2Rpb2RlWkRGJyxcbiAgICAgIHByb3BzXG4gICAgKVxuXG4gICAgcmV0dXJuIHpkZlxuICB9XG5cbiAgRGlvZGVaREYuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICBROiA1LFxuICAgIHNhdHVyYXRpb246IDEsXG4gICAgY3V0b2ZmOiA0NDAsXG4gIH1cblxuICByZXR1cm4gRGlvZGVaREZcblxufVxuIiwibGV0IHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5sZXQgZmlsdGVyID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbk9iamVjdC5hc3NpZ24oIGZpbHRlciwge1xuICBkZWZhdWx0czogeyBieXBhc3M6ZmFsc2UgfSBcbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gZmlsdGVyXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZmlsdGVyID0gcmVxdWlyZSggJy4vZmlsdGVyLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBHaWJiZXJpc2guZ2VuaXNoLmZpbHRlcjI0ID0gKCBpbnB1dCwgX3JleiwgX2N1dG9mZiwgaXNMb3dQYXNzLCBpc1N0ZXJlbz1mYWxzZSApID0+IHtcbiAgICBsZXQgcmV0dXJuVmFsdWUsXG4gICAgICAgIHBvbGVzTCA9IGcuZGF0YShbIDAsMCwwLDAgXSwgMSwgeyBtZXRhOnRydWUgfSksXG4gICAgICAgIHBlZWtQcm9wcyA9IHsgaW50ZXJwOidub25lJywgbW9kZTonc2ltcGxlJyB9LFxuICAgICAgICByZXogPSBnLm1lbW8oIGcubXVsKCBfcmV6LCA1ICkgKSxcbiAgICAgICAgY3V0b2ZmID0gZy5tZW1vKCBnLmRpdiggX2N1dG9mZiwgMTEwMjUgKSApLFxuICAgICAgICByZXp6TCA9IGcuY2xhbXAoIGcubXVsKCBwb2xlc0xbM10sIHJleiApICksXG4gICAgICAgIG91dHB1dEwgPSBnLnN1YiggaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0LCByZXp6TCApIFxuXG4gICAgcG9sZXNMWzBdID0gZy5hZGQoIHBvbGVzTFswXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNMWzBdICksIG91dHB1dEwgICApLCBjdXRvZmYgKSlcbiAgICBwb2xlc0xbMV0gPSBnLmFkZCggcG9sZXNMWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc0xbMV0gKSwgcG9sZXNMWzBdICksIGN1dG9mZiApKVxuICAgIHBvbGVzTFsyXSA9IGcuYWRkKCBwb2xlc0xbMl0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzTFsyXSApLCBwb2xlc0xbMV0gKSwgY3V0b2ZmICkpXG4gICAgcG9sZXNMWzNdID0gZy5hZGQoIHBvbGVzTFszXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNMWzNdICksIHBvbGVzTFsyXSApLCBjdXRvZmYgKSlcbiAgICBcbiAgICBsZXQgbGVmdCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzTFszXSwgZy5zdWIoIG91dHB1dEwsIHBvbGVzTFszXSApIClcblxuICAgIGlmKCBpc1N0ZXJlbyApIHtcbiAgICAgIGxldCBwb2xlc1IgPSBnLmRhdGEoWyAwLDAsMCwwIF0sIDEsIHsgbWV0YTp0cnVlIH0pLFxuICAgICAgICAgIHJlenpSID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzUlszXSwgcmV6ICkgKSxcbiAgICAgICAgICBvdXRwdXRSID0gZy5zdWIoIGlucHV0WzFdLCByZXp6UiApICAgICAgICAgXG5cbiAgICAgIHBvbGVzUlswXSA9IGcuYWRkKCBwb2xlc1JbMF0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlswXSApLCBvdXRwdXRSICAgKSwgY3V0b2ZmICkpXG4gICAgICBwb2xlc1JbMV0gPSBnLmFkZCggcG9sZXNSWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMV0gKSwgcG9sZXNSWzBdICksIGN1dG9mZiApKVxuICAgICAgcG9sZXNSWzJdID0gZy5hZGQoIHBvbGVzUlsyXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNSWzJdICksIHBvbGVzUlsxXSApLCBjdXRvZmYgKSlcbiAgICAgIHBvbGVzUlszXSA9IGcuYWRkKCBwb2xlc1JbM10sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlszXSApLCBwb2xlc1JbMl0gKSwgY3V0b2ZmICkpXG5cbiAgICAgIGxldCByaWdodCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzUlszXSwgZy5zdWIoIG91dHB1dFIsIHBvbGVzUlszXSApIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBbbGVmdCwgcmlnaHRdXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm5WYWx1ZSA9IGxlZnRcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxuXG4gIGxldCBGaWx0ZXIyNCA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGxldCBmaWx0ZXIyNCAgID0gT2JqZWN0LmNyZWF0ZSggZmlsdGVyIClcbiAgICBsZXQgcHJvcHMgICAgPSBPYmplY3QuYXNzaWduKCB7fSwgRmlsdGVyMjQuZGVmYXVsdHMsIGZpbHRlci5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIGZpbHRlcjI0LCBcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guZmlsdGVyMjQoIGcuaW4oJ2lucHV0JyksIGcuaW4oJ1EnKSwgZy5pbignY3V0b2ZmJyksIGcuaW4oJ2lzTG93UGFzcycpLCBpc1N0ZXJlbyApLCBcbiAgICAgICdmaWx0ZXIyNCcsXG4gICAgICBwcm9wc1xuICAgIClcblxuICAgIHJldHVybiBmaWx0ZXIyNFxuICB9XG5cblxuICBGaWx0ZXIyNC5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIFE6IC4yNSxcbiAgICBjdXRvZmY6IDg4MCxcbiAgICBpc0xvd1Bhc3M6MVxuICB9XG5cbiAgcmV0dXJuIEZpbHRlcjI0XG5cbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IGcgPSBHaWJiZXJpc2guZ2VuaXNoXG5cbiAgY29uc3QgZmlsdGVycyA9IHtcbiAgICBGaWx0ZXIyNENsYXNzaWMgOiByZXF1aXJlKCAnLi9maWx0ZXIyNC5qcycgICkoIEdpYmJlcmlzaCApLFxuICAgIEZpbHRlcjI0TW9vZyAgICA6IHJlcXVpcmUoICcuL2xhZGRlckZpbHRlclplcm9EZWxheS5qcycgKSggR2liYmVyaXNoICksXG4gICAgRmlsdGVyMjRUQjMwMyAgIDogcmVxdWlyZSggJy4vZGlvZGVGaWx0ZXJaREYuanMnICkoIEdpYmJlcmlzaCApLFxuICAgIEZpbHRlcjEyQmlxdWFkICA6IHJlcXVpcmUoICcuL2JpcXVhZC5qcycgICAgKSggR2liYmVyaXNoICksXG4gICAgRmlsdGVyMTJTVkYgICAgIDogcmVxdWlyZSggJy4vc3ZmLmpzJyAgICAgICApKCBHaWJiZXJpc2ggKSxcbiAgICBcbiAgICAvLyBub3QgZm9yIHVzZSBieSBlbmQtdXNlcnNcbiAgICBnZW5pc2g6IHtcbiAgICAgIENvbWIgICAgICAgIDogcmVxdWlyZSggJy4vY29tYmZpbHRlci5qcycgKSxcbiAgICAgIEFsbFBhc3MgICAgIDogcmVxdWlyZSggJy4vYWxscGFzcy5qcycgKVxuICAgIH0sXG5cbiAgICBmYWN0b3J5KCBpbnB1dCwgY3V0b2ZmLCByZXNvbmFuY2UsIHNhdHVyYXRpb24gPSBudWxsLCBfcHJvcHMsIGlzU3RlcmVvID0gZmFsc2UgKSB7XG4gICAgICBsZXQgZmlsdGVyZWRPc2MgXG5cbiAgICAgIC8vaWYoIHByb3BzLmZpbHRlclR5cGUgPT09IDEgKSB7XG4gICAgICAvLyAgaWYoIHR5cGVvZiBwcm9wcy5jdXRvZmYgIT09ICdvYmplY3QnICYmIHByb3BzLmN1dG9mZiA+IDEgKSB7XG4gICAgICAvLyAgICBwcm9wcy5jdXRvZmYgPSAuMjVcbiAgICAgIC8vICB9XG4gICAgICAvLyAgaWYoIHR5cGVvZiBwcm9wcy5jdXRvZmYgIT09ICdvYmplY3QnICYmIHByb3BzLmZpbHRlck11bHQgPiAuNSApIHtcbiAgICAgIC8vICAgIHByb3BzLmZpbHRlck11bHQgPSAuMVxuICAgICAgLy8gIH1cbiAgICAgIC8vfVxuICAgICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgZmlsdGVycy5kZWZhdWx0cywgX3Byb3BzIClcblxuICAgICAgc3dpdGNoKCBwcm9wcy5maWx0ZXJUeXBlICkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgaXNMb3dQYXNzID0gZy5wYXJhbSggJ2xvd1Bhc3MnLCAxICksXG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBnLmZpbHRlcjI0KCBpbnB1dCwgZy5pbignUScpLCBjdXRvZmYsIHByb3BzLmZpbHRlck1vZGUsIGlzU3RlcmVvIClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gZy56ZDI0KCBpbnB1dCwgZy5pbignUScpLCBjdXRvZmYgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBnLmRpb2RlWkRGKCBpbnB1dCwgZy5pbignUScpLCBjdXRvZmYsIGcuaW4oJ3NhdHVyYXRpb24nKSwgaXNTdGVyZW8gKSBcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gZy5zdmYoIGlucHV0LCBjdXRvZmYsIGcuc3ViKCAxLCBnLmluKCdRJykpLCBwcm9wcy5maWx0ZXJNb2RlLCBpc1N0ZXJlbyApIFxuICAgICAgICAgIGJyZWFrOyBcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gZy5iaXF1YWQoIGlucHV0LCBjdXRvZmYsICBnLmluKCdRJyksIHByb3BzLmZpbHRlck1vZGUsIGlzU3RlcmVvICkgXG4gICAgICAgICAgYnJlYWs7IFxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vIHJldHVybiB1bmZpbHRlcmVkIHNpZ25hbFxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gaW5wdXQgLy9nLmZpbHRlcjI0KCBvc2NXaXRoR2FpbiwgZy5pbigncmVzb25hbmNlJyksIGN1dG9mZiwgaXNMb3dQYXNzIClcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZpbHRlcmVkT3NjXG4gICAgfSxcblxuICAgIGRlZmF1bHRzOiB7IGZpbHRlck1vZGU6IDAsIGZpbHRlclR5cGU6MCB9XG4gIH1cblxuICBmaWx0ZXJzLmV4cG9ydCA9IHRhcmdldCA9PiB7XG4gICAgZm9yKCBsZXQga2V5IGluIGZpbHRlcnMgKSB7XG4gICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyAmJiBrZXkgIT09ICdnZW5pc2gnICkge1xuICAgICAgICB0YXJnZXRbIGtleSBdID0gZmlsdGVyc1sga2V5IF1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxucmV0dXJuIGZpbHRlcnNcblxufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBmaWx0ZXIgPSByZXF1aXJlKCAnLi9maWx0ZXIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIEdpYmJlcmlzaC5nZW5pc2guemQyNCA9ICggaW5wdXQsIF9RLCBmcmVxLCBpc1N0ZXJlbz1mYWxzZSApID0+IHtcbiAgICBjb25zdCBpVCA9IDEgLyBnLmdlbi5zYW1wbGVyYXRlLFxuICAgICAgICAgIHoxID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIHoyID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIHozID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIHo0ID0gZy5oaXN0b3J5KDApXG4gICAgXG4gICAgY29uc3QgUSA9IGcubWVtbyggZy5hZGQoIC41LCBnLm11bCggX1EsIDIzICkgKSApXG4gICAgLy8ga3dkID0gMiAqICRNX1BJICogYWNmW2tpbmR4XVxuICAgIGNvbnN0IGt3ZCA9IGcubWVtbyggZy5tdWwoIE1hdGguUEkgKiAyLCBmcmVxICkgKVxuXG4gICAgLy8ga3dhID0gKDIvaVQpICogdGFuKGt3ZCAqIGlULzIpIFxuICAgIGNvbnN0IGt3YSA9Zy5tZW1vKCBnLm11bCggMi9pVCwgZy50YW4oIGcubXVsKCBrd2QsIGlULzIgKSApICkgKVxuXG4gICAgLy8ga0cgID0ga3dhICogaVQvMiBcbiAgICBjb25zdCBrZyA9IGcubWVtbyggZy5tdWwoIGt3YSwgaVQvMiApIClcblxuICAgIC8vIGtrID0gNC4wKihrUSAtIDAuNSkvKDI1LjAgLSAwLjUpXG4gICAgY29uc3Qga2sgPSBnLm1lbW8oIGcubXVsKCA0LCBnLmRpdiggZy5zdWIoIFEsIC41ICksIDI0LjUgKSApIClcblxuICAgIC8vIGtnX3BsdXNfMSA9ICgxLjAgKyBrZylcbiAgICBjb25zdCBrZ19wbHVzXzEgPSBnLmFkZCggMSwga2cgKVxuXG4gICAgLy8ga0cgPSBrZyAvIGtnX3BsdXNfMSBcbiAgICBjb25zdCBrRyAgICAgPSBnLm1lbW8oIGcuZGl2KCBrZywga2dfcGx1c18xICkgKSxcbiAgICAgICAgICBrR18yICAgPSBnLm1lbW8oIGcubXVsKCBrRywga0cgKSApLFxuICAgICAgICAgIGtHXzMgICA9IGcubXVsKCBrR18yLCBrRyApLFxuICAgICAgICAgIGtHQU1NQSA9IGcubXVsKCBrR18yLCBrR18yIClcblxuICAgIGNvbnN0IGtTMSA9IGcuZGl2KCB6MS5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTMiA9IGcuZGl2KCB6Mi5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTMyA9IGcuZGl2KCB6My5vdXQsIGtnX3BsdXNfMSApLFxuICAgICAgICAgIGtTNCA9IGcuZGl2KCB6NC5vdXQsIGtnX3BsdXNfMSApXG5cbiAgICAvL2tTID0ga0dfMyAqIGtTMSAgKyBrR18yICoga1MyICsga0cgKiBrUzMgKyBrUzQgXG4gICAgY29uc3Qga1MgPSBnLm1lbW8oIFxuICAgICAgZy5hZGQoXG4gICAgICAgIGcuYWRkKCBnLm11bChrR18zLCBrUzEpLCBnLm11bCgga0dfMiwga1MyKSApLFxuICAgICAgICBnLmFkZCggZy5tdWwoa0csIGtTMyksIGtTNCApXG4gICAgICApXG4gICAgKVxuXG4gICAgLy9rdSA9IChraW4gLSBrayAqICBrUykgLyAoMSArIGtrICoga0dBTU1BKVxuICAgIGNvbnN0IGt1MSA9IGcuc3ViKCBpbnB1dCwgZy5tdWwoIGtrLCBrUyApIClcbiAgICBjb25zdCBrdTIgPSBnLm1lbW8oIGcuYWRkKCAxLCBnLm11bCgga2ssIGtHQU1NQSApICkgKVxuICAgIGNvbnN0IGt1ICA9IGcubWVtbyggZy5kaXYoIGt1MSwga3UyICkgKVxuXG4gICAgbGV0IGt2ID0gIGcubWVtbyggZy5tdWwoIGcuc3ViKCBrdSwgejEub3V0ICksIGtHICkgKVxuICAgIGxldCBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejEub3V0ICkgKVxuICAgIHoxLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHoyLm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejIub3V0ICkgKVxuICAgIHoyLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHozLm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejMub3V0ICkgKVxuICAgIHozLmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuICAgIGt2ICA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBrbHAsIHo0Lm91dCApLCBrRyApIClcbiAgICBrbHAgPSBnLm1lbW8oIGcuYWRkKCBrdiwgejQub3V0ICkgKVxuICAgIHo0LmluKCBnLmFkZCgga2xwLCBrdiApIClcblxuXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgLy9sZXQgcG9sZXNSID0gZy5kYXRhKFsgMCwwLDAsMCBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgIC8vICAgIHJlenpSID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzUlszXSwgcmV6ICkgKSxcbiAgICAgIC8vICAgIG91dHB1dFIgPSBnLnN1YiggaW5wdXRbMV0sIHJlenpSICkgICAgICAgICBcblxuICAgICAgLy9wb2xlc1JbMF0gPSBnLmFkZCggcG9sZXNSWzBdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMF0gKSwgb3V0cHV0UiAgICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMV0gPSBnLmFkZCggcG9sZXNSWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMV0gKSwgcG9sZXNSWzBdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMl0gPSBnLmFkZCggcG9sZXNSWzJdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMl0gKSwgcG9sZXNSWzFdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbM10gPSBnLmFkZCggcG9sZXNSWzNdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbM10gKSwgcG9sZXNSWzJdICksIGN1dG9mZiApKVxuXG4gICAgICAvL2xldCByaWdodCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzUlszXSwgZy5zdWIoIG91dHB1dFIsIHBvbGVzUlszXSApIClcblxuICAgICAgLy9yZXR1cm5WYWx1ZSA9IFtsZWZ0LCByaWdodF1cbiAgICB9ZWxzZXtcbiAgICAgIHJldHVyblZhbHVlID0ga2xwXG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cblxuICBjb25zdCBaZDI0ID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgY29uc3QgZmlsdGVyICAgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIGNvbnN0IHByb3BzICAgID0gT2JqZWN0LmFzc2lnbigge30sIFpkMjQuZGVmYXVsdHMsIGZpbHRlci5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgY29uc3QgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyBcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KFxuICAgICAgZmlsdGVyLCBcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guemQyNCggZy5pbignaW5wdXQnKSwgZy5pbignUScpLCBnLmluKCdjdXRvZmYnKSwgaXNTdGVyZW8gKSwgXG4gICAgICAnemQyNCcsXG4gICAgICBwcm9wc1xuICAgIClcblxuICAgIHJldHVybiBmaWx0ZXJcbiAgfVxuXG5cbiAgWmQyNC5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIFE6IDUsXG4gICAgY3V0b2ZmOiA0NDAsXG4gIH1cblxuICByZXR1cm4gWmQyNFxuXG59XG5cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZmlsdGVyID0gcmVxdWlyZSggJy4vZmlsdGVyLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgR2liYmVyaXNoLmdlbmlzaC5zdmYgPSAoIGlucHV0LCBjdXRvZmYsIFEsIG1vZGUsIGlzU3RlcmVvICkgPT4ge1xuICAgIGxldCBkMSA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSksIGQyID0gZy5kYXRhKFswLDBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgICAgcGVla1Byb3BzID0geyBtb2RlOidzaW1wbGUnLCBpbnRlcnA6J25vbmUnIH1cblxuICAgIGxldCBmMSA9IGcubWVtbyggZy5tdWwoIDIgKiBNYXRoLlBJLCBnLmRpdiggY3V0b2ZmLCBnLmdlbi5zYW1wbGVyYXRlICkgKSApXG4gICAgbGV0IG9uZU92ZXJRID0gZy5tZW1vKCBnLmRpdiggMSwgUSApIClcbiAgICBsZXQgbCA9IGcubWVtbyggZy5hZGQoIGQyWzBdLCBnLm11bCggZjEsIGQxWzBdICkgKSApLFxuICAgICAgICBoID0gZy5tZW1vKCBnLnN1YiggZy5zdWIoIGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dCwgbCApLCBnLm11bCggUSwgZDFbMF0gKSApICksXG4gICAgICAgIGIgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggZjEsIGggKSwgZDFbMF0gKSApLFxuICAgICAgICBuID0gZy5tZW1vKCBnLmFkZCggaCwgbCApIClcblxuICAgIGQxWzBdID0gYlxuICAgIGQyWzBdID0gbFxuXG4gICAgbGV0IG91dCA9IGcuc2VsZWN0b3IoIG1vZGUsIGwsIGgsIGIsIG4gKVxuXG4gICAgbGV0IHJldHVyblZhbHVlXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgbGV0IGQxMiA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSksIGQyMiA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSlcbiAgICAgIGxldCBsMiA9IGcubWVtbyggZy5hZGQoIGQyMlswXSwgZy5tdWwoIGYxLCBkMTJbMF0gKSApICksXG4gICAgICAgICAgaDIgPSBnLm1lbW8oIGcuc3ViKCBnLnN1YiggaW5wdXRbMV0sIGwyICksIGcubXVsKCBRLCBkMTJbMF0gKSApICksXG4gICAgICAgICAgYjIgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggZjEsIGgyICksIGQxMlswXSApICksXG4gICAgICAgICAgbjIgPSBnLm1lbW8oIGcuYWRkKCBoMiwgbDIgKSApXG5cbiAgICAgIGQxMlswXSA9IGIyXG4gICAgICBkMjJbMF0gPSBsMlxuXG4gICAgICBsZXQgb3V0MiA9IGcuc2VsZWN0b3IoIG1vZGUsIGwyLCBoMiwgYjIsIG4yIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBbIG91dCwgb3V0MiBdXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbiAgbGV0IFNWRiA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGNvbnN0IHN2ZiA9IE9iamVjdC5jcmVhdGUoIGZpbHRlciApXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgU1ZGLmRlZmF1bHRzLCBmaWx0ZXIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSBcblxuICAgIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW9cbiAgICBcbiAgICAvLyBYWFggTkVFRFMgUkVGQUNUT1JJTkdcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICBzdmYsXG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLnN2ZiggZy5pbignaW5wdXQnKSwgZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBnLmdlbi5zYW1wbGVyYXRlIC8gNSApLCBnLnN1YiggMSwgZy5pbignUScpICksIGcuaW4oJ21vZGUnKSwgaXNTdGVyZW8gKSwgXG4gICAgICAnc3ZmJywgXG4gICAgICBwcm9wc1xuICAgIClcblxuICAgIHJldHVybiBzdmZcbiAgfVxuXG5cbiAgU1ZGLmRlZmF1bHRzID0ge1xuICAgIGlucHV0OjAsXG4gICAgUTogLjc1LFxuICAgIGN1dG9mZjouMzUsXG4gICAgbW9kZTowXG4gIH1cblxuICByZXR1cm4gU1ZGXG5cbn1cblxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgQml0Q3J1c2hlciA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7IGJpdENydXNoZXJMZW5ndGg6IDQ0MTAwIH0sIEJpdENydXNoZXIuZGVmYXVsdHMsIGVmZmVjdC5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgYml0Q3J1c2hlciA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIGJpdERlcHRoID0gZy5pbiggJ2JpdERlcHRoJyApLFxuICAgICAgc2FtcGxlUmF0ZSA9IGcuaW4oICdzYW1wbGVSYXRlJyApLFxuICAgICAgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMCBdIDogaW5wdXQsXG4gICAgICByaWdodElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMSBdIDogbnVsbFxuICBcbiAgbGV0IHN0b3JlTCA9IGcuaGlzdG9yeSgwKVxuICBsZXQgc2FtcGxlUmVkdXhDb3VudGVyID0gZy5jb3VudGVyKCBzYW1wbGVSYXRlLCAwLCAxIClcblxuICBsZXQgYml0TXVsdCA9IGcucG93KCBnLm11bCggYml0RGVwdGgsIDE2ICksIDIgKVxuICBsZXQgY3J1c2hlZEwgPSBnLmRpdiggZy5mbG9vciggZy5tdWwoIGxlZnRJbnB1dCwgYml0TXVsdCApICksIGJpdE11bHQgKVxuXG4gIGxldCBvdXRMID0gZy5zd2l0Y2goXG4gICAgc2FtcGxlUmVkdXhDb3VudGVyLndyYXAsXG4gICAgY3J1c2hlZEwsXG4gICAgc3RvcmVMLm91dFxuICApXG5cbiAgaWYoIGlzU3RlcmVvICkge1xuICAgIGxldCBzdG9yZVIgPSBnLmhpc3RvcnkoMClcbiAgICBsZXQgY3J1c2hlZFIgPSBnLmRpdiggZy5mbG9vciggZy5tdWwoIHJpZ2h0SW5wdXQsIGJpdE11bHQgKSApLCBiaXRNdWx0IClcblxuICAgIGxldCBvdXRSID0gdGVybmFyeSggXG4gICAgICBzYW1wbGVSZWR1eENvdW50ZXIud3JhcCxcbiAgICAgIGNydXNoZWRSLFxuICAgICAgc3RvcmVMLm91dFxuICAgIClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIGJpdENydXNoZXIsXG4gICAgICBbIG91dEwsIG91dFIgXSwgXG4gICAgICAnYml0Q3J1c2hlcicsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggYml0Q3J1c2hlciwgb3V0TCwgJ2JpdENydXNoZXInLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiBiaXRDcnVzaGVyXG59XG5cbkJpdENydXNoZXIuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIGJpdERlcHRoOi41LFxuICBzYW1wbGVSYXRlOiAuNVxufVxuXG5yZXR1cm4gQml0Q3J1c2hlclxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgbGV0IHByb3RvID0gT2JqZWN0LmNyZWF0ZSggZWZmZWN0IClcblxuICBsZXQgU2h1ZmZsZXIgPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgYnVmZmVyU2h1ZmZsZXIgPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgICBidWZmZXJTaXplID0gODgyMDBcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBTaHVmZmxlci5kZWZhdWx0cywgZWZmZWN0LmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IGZhbHNlXG4gICAgbGV0IHBoYXNlID0gZy5hY2N1bSggMSwwLHsgc2hvdWxkV3JhcDogZmFsc2UgfSlcblxuICAgIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgICAgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMCBdIDogaW5wdXQsXG4gICAgICAgIHJpZ2h0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WyAxIF0gOiBudWxsLFxuICAgICAgICByYXRlT2ZTaHVmZmxpbmcgPSBnLmluKCAncmF0ZScgKSxcbiAgICAgICAgY2hhbmNlT2ZTaHVmZmxpbmcgPSBnLmluKCAnY2hhbmNlJyApLFxuICAgICAgICByZXZlcnNlQ2hhbmNlID0gZy5pbiggJ3JldmVyc2VDaGFuY2UnICksXG4gICAgICAgIHJlcGl0Y2hDaGFuY2UgPSBnLmluKCAncmVwaXRjaENoYW5jZScgKSxcbiAgICAgICAgcmVwaXRjaE1pbiA9IGcuaW4oICdyZXBpdGNoTWluJyApLFxuICAgICAgICByZXBpdGNoTWF4ID0gZy5pbiggJ3JlcGl0Y2hNYXgnIClcblxuICAgIGxldCBwaXRjaE1lbW9yeSA9IGcuaGlzdG9yeSgxKVxuXG4gICAgbGV0IHNob3VsZFNodWZmbGVDaGVjayA9IGcuZXEoIGcubW9kKCBwaGFzZSwgcmF0ZU9mU2h1ZmZsaW5nICksIDAgKVxuICAgIGxldCBpc1NodWZmbGluZyA9IGcubWVtbyggZy5zYWgoIGcubHQoIGcubm9pc2UoKSwgY2hhbmNlT2ZTaHVmZmxpbmcgKSwgc2hvdWxkU2h1ZmZsZUNoZWNrLCAwICkgKSBcblxuICAgIC8vIGlmIHdlIGFyZSBzaHVmZmxpbmcgYW5kIG9uIGEgcmVwZWF0IGJvdW5kYXJ5Li4uXG4gICAgbGV0IHNodWZmbGVDaGFuZ2VkID0gZy5tZW1vKCBnLmFuZCggc2hvdWxkU2h1ZmZsZUNoZWNrLCBpc1NodWZmbGluZyApIClcbiAgICBsZXQgc2hvdWxkUmV2ZXJzZSA9IGcubHQoIGcubm9pc2UoKSwgcmV2ZXJzZUNoYW5jZSApLFxuICAgICAgICByZXZlcnNlTW9kID0gZy5zd2l0Y2goIHNob3VsZFJldmVyc2UsIC0xLCAxIClcblxuICAgIGxldCBwaXRjaCA9IGcuaWZlbHNlKCBcbiAgICAgIGcuYW5kKCBzaHVmZmxlQ2hhbmdlZCwgZy5sdCggZy5ub2lzZSgpLCByZXBpdGNoQ2hhbmNlICkgKSxcbiAgICAgIGcubWVtbyggZy5tdWwoIGcuYWRkKCByZXBpdGNoTWluLCBnLm11bCggZy5zdWIoIHJlcGl0Y2hNYXgsIHJlcGl0Y2hNaW4gKSwgZy5ub2lzZSgpICkgKSwgcmV2ZXJzZU1vZCApICksXG4gICAgICByZXZlcnNlTW9kXG4gICAgKVxuICAgIFxuICAgIC8vIG9ubHkgc3dpdGNoIHBpdGNoZXMgb24gcmVwZWF0IGJvdW5kYXJpZXNcbiAgICBwaXRjaE1lbW9yeS5pbiggZy5zd2l0Y2goIHNodWZmbGVDaGFuZ2VkLCBwaXRjaCwgcGl0Y2hNZW1vcnkub3V0ICkgKVxuXG4gICAgbGV0IGZhZGVMZW5ndGggPSBnLm1lbW8oIGcuZGl2KCByYXRlT2ZTaHVmZmxpbmcsIDEwMCApICksXG4gICAgICAgIGZhZGVJbmNyID0gZy5tZW1vKCBnLmRpdiggMSwgZmFkZUxlbmd0aCApIClcblxuICAgIGxldCBidWZmZXJMID0gZy5kYXRhKCBidWZmZXJTaXplICksIGJ1ZmZlclIgPSBpc1N0ZXJlbyA/IGcuZGF0YSggYnVmZmVyU2l6ZSApIDogbnVsbFxuICAgIGxldCByZWFkUGhhc2UgPSBnLmFjY3VtKCBwaXRjaE1lbW9yeS5vdXQsIDAsIHsgc2hvdWxkV3JhcDpmYWxzZSB9KSBcbiAgICBsZXQgc3R1dHRlciA9IGcud3JhcCggZy5zdWIoIGcubW9kKCByZWFkUGhhc2UsIGJ1ZmZlclNpemUgKSwgMjIwNTAgKSwgMCwgYnVmZmVyU2l6ZSApXG5cbiAgICBsZXQgbm9ybWFsU2FtcGxlID0gZy5wZWVrKCBidWZmZXJMLCBnLmFjY3VtKCAxLCAwLCB7IG1heDo4ODIwMCB9KSwgeyBtb2RlOidzaW1wbGUnIH0pXG5cbiAgICBsZXQgc3R1dHRlclNhbXBsZVBoYXNlID0gZy5zd2l0Y2goIGlzU2h1ZmZsaW5nLCBzdHV0dGVyLCBnLm1vZCggcmVhZFBoYXNlLCBidWZmZXJTaXplICkgKVxuICAgIGxldCBzdHV0dGVyU2FtcGxlID0gZy5tZW1vKCBnLnBlZWsoIFxuICAgICAgYnVmZmVyTCwgXG4gICAgICBzdHV0dGVyU2FtcGxlUGhhc2UsXG4gICAgICB7IG1vZGU6J3NhbXBsZXMnIH1cbiAgICApIClcbiAgICBcbiAgICBsZXQgc3R1dHRlclNob3VsZEZhZGVJbiA9IGcuYW5kKCBzaHVmZmxlQ2hhbmdlZCwgaXNTaHVmZmxpbmcgKVxuICAgIGxldCBzdHV0dGVyUGhhc2UgPSBnLmFjY3VtKCAxLCBzaHVmZmxlQ2hhbmdlZCwgeyBzaG91bGRXcmFwOiBmYWxzZSB9KVxuXG4gICAgbGV0IGZhZGVJbkFtb3VudCA9IGcubWVtbyggZy5kaXYoIHN0dXR0ZXJQaGFzZSwgZmFkZUxlbmd0aCApIClcbiAgICBsZXQgZmFkZU91dEFtb3VudCA9IGcuZGl2KCBnLnN1YiggcmF0ZU9mU2h1ZmZsaW5nLCBzdHV0dGVyUGhhc2UgKSwgZy5zdWIoIHJhdGVPZlNodWZmbGluZywgZmFkZUxlbmd0aCApIClcbiAgICBcbiAgICBsZXQgZmFkZWRTdHV0dGVyID0gZy5pZmVsc2UoXG4gICAgICBnLmx0KCBzdHV0dGVyUGhhc2UsIGZhZGVMZW5ndGggKSxcbiAgICAgIGcubWVtbyggZy5tdWwoIGcuc3dpdGNoKCBnLmx0KCBmYWRlSW5BbW91bnQsIDEgKSwgZmFkZUluQW1vdW50LCAxICksIHN0dXR0ZXJTYW1wbGUgKSApLFxuICAgICAgZy5ndCggc3R1dHRlclBoYXNlLCBnLnN1YiggcmF0ZU9mU2h1ZmZsaW5nLCBmYWRlTGVuZ3RoICkgKSxcbiAgICAgIGcubWVtbyggZy5tdWwoIGcuZ3RwKCBmYWRlT3V0QW1vdW50LCAwICksIHN0dXR0ZXJTYW1wbGUgKSApLFxuICAgICAgc3R1dHRlclNhbXBsZVxuICAgIClcbiAgICBcbiAgICBsZXQgb3V0cHV0TCA9IGcubWl4KCBub3JtYWxTYW1wbGUsIGZhZGVkU3R1dHRlciwgaXNTaHVmZmxpbmcgKSBcblxuICAgIGxldCBwb2tlTCA9IGcucG9rZSggYnVmZmVyTCwgbGVmdElucHV0LCBnLm1vZCggZy5hZGQoIHBoYXNlLCA0NDEwMCApLCA4ODIwMCApIClcblxuICAgIGxldCBwYW5uZXIgPSBnLnBhbiggb3V0cHV0TCwgb3V0cHV0TCwgZy5pbiggJ3BhbicgKSApXG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgYnVmZmVyU2h1ZmZsZXIsXG4gICAgICBbcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodF0sXG4gICAgICAnc2h1ZmZsZXInLCBcbiAgICAgIHByb3BzIFxuICAgICkgXG5cbiAgICByZXR1cm4gYnVmZmVyU2h1ZmZsZXJcbiAgfVxuICBcbiAgU2h1ZmZsZXIuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICByYXRlOjIyMDUwLFxuICAgIGNoYW5jZTouMjUsXG4gICAgcmV2ZXJzZUNoYW5jZTouNSxcbiAgICByZXBpdGNoQ2hhbmNlOi41LFxuICAgIHJlcGl0Y2hNaW46LjUsXG4gICAgcmVwaXRjaE1heDoyLFxuICAgIHBhbjouNSxcbiAgICBtaXg6LjVcbiAgfVxuXG4gIHJldHVybiBTaHVmZmxlciBcbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IENob3J1cyA9IGlucHV0UHJvcHMgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIENob3J1cy5kZWZhdWx0cywgZWZmZWN0LmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgXG4gIGNvbnN0IGNob3J1cyA9IE9iamVjdC5jcmVhdGUoIEdpYmJlcmlzaC5wcm90b3R5cGVzLnVnZW4gKVxuXG4gIGNvbnN0IGlucHV0ID0gZy5pbignaW5wdXQnKSxcbiAgICAgICAgZnJlcTEgPSBnLmluKCdzbG93RnJlcXVlbmN5JyksXG4gICAgICAgIGZyZXEyID0gZy5pbignZmFzdEZyZXF1ZW5jeScpLFxuICAgICAgICBhbXAxICA9IGcuaW4oJ3Nsb3dHYWluJyksXG4gICAgICAgIGFtcDIgID0gZy5pbignZmFzdEdhaW4nKVxuXG4gIGNvbnN0IGlzU3RlcmVvID0gdHlwZW9mIHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSAndW5kZWZpbmVkJyA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcblxuICBjb25zdCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXRcblxuICBjb25zdCB3aW4wICAgPSBnLmVudiggJ2ludmVyc2V3ZWxjaCcsIDEwMjQgKSxcbiAgICAgICAgd2luMTIwID0gZy5lbnYoICdpbnZlcnNld2VsY2gnLCAxMDI0LCAwLCAuMzMzICksXG4gICAgICAgIHdpbjI0MCA9IGcuZW52KCAnaW52ZXJzZXdlbGNoJywgMTAyNCwgMCwgLjY2NiApXG4gIFxuICBjb25zdCBzbG93UGhhc29yID0gZy5waGFzb3IoIGZyZXExLCAwLCB7IG1pbjowIH0pLFxuICBcdFx0ICBzbG93UGVlazEgID0gZy5tdWwoIGcucGVlayggd2luMCwgICBzbG93UGhhc29yICksIGFtcDEgKSxcbiAgICAgICAgc2xvd1BlZWsyICA9IGcubXVsKCBnLnBlZWsoIHdpbjEyMCwgc2xvd1BoYXNvciApLCBhbXAxICksXG4gICAgICAgIHNsb3dQZWVrMyAgPSBnLm11bCggZy5wZWVrKCB3aW4yNDAsIHNsb3dQaGFzb3IgKSwgYW1wMSApXG4gIFxuICBjb25zdCBmYXN0UGhhc29yID0gZy5waGFzb3IoIGZyZXEyLCAwLCB7IG1pbjowIH0pLFxuICBcdCAgXHRmYXN0UGVlazEgID0gZy5tdWwoIGcucGVlayggd2luMCwgICBmYXN0UGhhc29yICksIGFtcDIgKSxcbiAgICAgICAgZmFzdFBlZWsyICA9IGcubXVsKCBnLnBlZWsoIHdpbjEyMCwgZmFzdFBoYXNvciApLCBhbXAyICksXG4gICAgICAgIGZhc3RQZWVrMyAgPSBnLm11bCggZy5wZWVrKCB3aW4yNDAsIGZhc3RQaGFzb3IgKSwgYW1wMiApXG5cbiAgY29uc3QgbXMgPSBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGUgLyAxMDAwIFxuICBjb25zdCBtYXhEZWxheVRpbWUgPSAxMDAgKiBtc1xuXG4gIGNvbnN0IHRpbWUxID0gIGcubXVsKCBnLmFkZCggc2xvd1BlZWsxLCBmYXN0UGVlazEsIDUgKSwgbXMgKSxcbiAgICAgICAgdGltZTIgPSAgZy5tdWwoIGcuYWRkKCBzbG93UGVlazIsIGZhc3RQZWVrMiwgNSApLCBtcyApLFxuICAgICAgICB0aW1lMyA9ICBnLm11bCggZy5hZGQoIHNsb3dQZWVrMywgZmFzdFBlZWszLCA1ICksIG1zIClcblxuICBjb25zdCBkZWxheTFMID0gZy5kZWxheSggbGVmdElucHV0LCB0aW1lMSwgeyBzaXplOm1heERlbGF5VGltZSB9KSxcbiAgICAgICAgZGVsYXkyTCA9IGcuZGVsYXkoIGxlZnRJbnB1dCwgdGltZTIsIHsgc2l6ZTptYXhEZWxheVRpbWUgfSksXG4gICAgICAgIGRlbGF5M0wgPSBnLmRlbGF5KCBsZWZ0SW5wdXQsIHRpbWUzLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pXG5cbiAgXG4gIGNvbnN0IGxlZnRPdXRwdXQgPSBnLmFkZCggZGVsYXkxTCwgZGVsYXkyTCwgZGVsYXkzTCApXG4gIGlmKCBpc1N0ZXJlbyApIHtcbiAgICBjb25zdCByaWdodElucHV0ID0gaW5wdXRbMV1cbiAgICBjb25zdCBkZWxheTFSID0gZy5kZWxheShyaWdodElucHV0LCB0aW1lMSwgeyBzaXplOm1heERlbGF5VGltZSB9KSxcbiAgICAgICAgICBkZWxheTJSID0gZy5kZWxheShyaWdodElucHV0LCB0aW1lMiwgeyBzaXplOm1heERlbGF5VGltZSB9KSxcbiAgICAgICAgICBkZWxheTNSID0gZy5kZWxheShyaWdodElucHV0LCB0aW1lMywgeyBzaXplOm1heERlbGF5VGltZSB9KVxuXG4gICAgLy8gZmxpcCBhIGNvdXBsZSBkZWxheSBsaW5lcyBmb3Igc3RlcmVvIGVmZmVjdD9cbiAgICBjb25zdCByaWdodE91dHB1dCA9IGcuYWRkKCBkZWxheTFSLCBkZWxheTJMLCBkZWxheTNSIClcbiAgICBjaG9ydXMuZ3JhcGggPSBbIGcuYWRkKCBkZWxheTFMLCBkZWxheTJSLCBkZWxheTNMICksIHJpZ2h0T3V0cHV0IF1cbiAgfWVsc2V7XG4gICAgY2hvcnVzLmdyYXBoID0gbGVmdE91dHB1dFxuICB9XG4gIFxuICBHaWJiZXJpc2guZmFjdG9yeSggY2hvcnVzLCBjaG9ydXMuZ3JhcGgsICdjaG9ydXMnLCBwcm9wcyApXG5cbiAgcmV0dXJuIGNob3J1c1xufVxuXG5DaG9ydXMuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIHNsb3dGcmVxdWVuY3k6IC4xOCxcbiAgc2xvd0dhaW46MSxcbiAgZmFzdEZyZXF1ZW5jeTo2LFxuICBmYXN0R2FpbjouMlxufVxuXG5yZXR1cm4gQ2hvcnVzXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCdnZW5pc2guanMnKSxcbiAgICAgIGVmZmVjdCA9IHJlcXVpcmUoJy4vZWZmZWN0LmpzJyk7XG5cbmNvbnN0IGdlbmlzaCA9IGc7XG5cblwidXNlIGpzZHNwXCI7XG5cbmNvbnN0IEFsbFBhc3NDaGFpbiA9IChpbjEsIGluMiwgaW4zKSA9PiB7XG4gIFwidXNlIGpzZHNwXCI7XG5cbiAgLyogaW4xID0gcHJlZGVsYXlfb3V0ICovXG4gIC8qIGluMiA9IGluZGlmZnVzaW9uMSAqL1xuICAvKiBpbjMgPSBpbmRpZmZ1c2lvbjIgKi9cblxuICBjb25zdCBzdWIxID0gZ2VuaXNoLnN1YihpbjEsIDApO1xuICBjb25zdCBkMSA9IGcuZGVsYXkoc3ViMSwgMTQyKTtcbiAgc3ViMS5pbnB1dHNbMV0gPSBnZW5pc2gubXVsKGQxLCBpbjIpO1xuICBjb25zdCBhcDFfb3V0ID0gZ2VuaXNoLmFkZChnZW5pc2gubXVsKHN1YjEsIGluMiksIGQxKTtcblxuICBjb25zdCBzdWIyID0gZ2VuaXNoLnN1YihhcDFfb3V0LCAwKTtcbiAgY29uc3QgZDIgPSBnLmRlbGF5KHN1YjIsIDEwNyk7XG4gIHN1YjIuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkMiwgaW4yKTtcbiAgY29uc3QgYXAyX291dCA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bChzdWIyLCBpbjIpLCBkMik7XG5cbiAgY29uc3Qgc3ViMyA9IGdlbmlzaC5zdWIoYXAyX291dCwgMCk7XG4gIGNvbnN0IGQzID0gZy5kZWxheShzdWIzLCAzNzkpO1xuICBzdWIzLmlucHV0c1sxXSA9IGdlbmlzaC5tdWwoZDMsIGluMyk7XG4gIGNvbnN0IGFwM19vdXQgPSBnZW5pc2guYWRkKGdlbmlzaC5tdWwoc3ViMywgaW4zKSwgZDMpO1xuXG4gIGNvbnN0IHN1YjQgPSBnZW5pc2guc3ViKGFwM19vdXQsIDApO1xuICBjb25zdCBkNCA9IGcuZGVsYXkoc3ViNCwgMjc3KTtcbiAgc3ViNC5pbnB1dHNbMV0gPSBnZW5pc2gubXVsKGQ0LCBpbjMpO1xuICBjb25zdCBhcDRfb3V0ID0gZ2VuaXNoLmFkZChnZW5pc2gubXVsKHN1YjQsIGluMyksIGQ0KTtcblxuICByZXR1cm4gYXA0X291dDtcbn07XG5cbi8qY29uc3QgdGFua19vdXRzID0gVGFuayggYXBfb3V0LCBkZWNheWRpZmZ1c2lvbjEsIGRlY2F5ZGlmZnVzaW9uMiwgZGFtcGluZywgZGVjYXkgKSovXG5jb25zdCBUYW5rID0gZnVuY3Rpb24gKGluMSwgaW4yLCBpbjMsIGluNCwgaW41KSB7XG4gIFwidXNlIGpzZHNwXCI7XG5cbiAgY29uc3Qgb3V0cyA9IFtbXSwgW10sIFtdLCBbXSwgW11dO1xuXG4gIC8qIExFRlQgQ0hBTk5FTCAqL1xuICBjb25zdCBsZWZ0U3RhcnQgPSBnZW5pc2guYWRkKGluMSwgMCk7XG4gIGNvbnN0IGRlbGF5SW5wdXQgPSBnZW5pc2guYWRkKGxlZnRTdGFydCwgMCk7XG4gIGNvbnN0IGRlbGF5MSA9IGcuZGVsYXkoZGVsYXlJbnB1dCwgW2dlbmlzaC5hZGQoZ2VuaXNoLm11bChnLmN5Y2xlKC4xKSwgMTYpLCA2NzIpXSwgeyBzaXplOiA2ODggfSk7XG4gIGRlbGF5SW5wdXQuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkZWxheTEsIGluMik7XG4gIGNvbnN0IGRlbGF5T3V0ID0gZ2VuaXNoLnN1YihkZWxheTEsIGdlbmlzaC5tdWwoZGVsYXlJbnB1dCwgaW4yKSk7XG5cbiAgY29uc3QgZGVsYXkyID0gZy5kZWxheShkZWxheU91dCwgWzQ0NTMsIDM1MywgMzYyNywgMTE5MF0pO1xuICBvdXRzWzNdLnB1c2goZ2VuaXNoLmFkZChkZWxheTIub3V0cHV0c1sxXSwgZGVsYXkyLm91dHB1dHNbMl0pKTtcbiAgb3V0c1syXS5wdXNoKGRlbGF5Mi5vdXRwdXRzWzNdKTtcblxuICBjb25zdCBteiA9IGcuaGlzdG9yeSgwKTtcbiAgY29uc3QgbWwgPSBnLm1peChkZWxheTIsIG16Lm91dCwgaW40KTtcbiAgbXouaW4obWwpO1xuXG4gIGNvbnN0IG1vdXQgPSBnZW5pc2gubXVsKG1sLCBpbjUpO1xuXG4gIGNvbnN0IHMxID0gZ2VuaXNoLnN1Yihtb3V0LCAwKTtcbiAgY29uc3QgZGVsYXkzID0gZy5kZWxheShzMSwgWzE4MDAsIDE4NywgMTIyOF0pO1xuICBvdXRzWzJdLnB1c2goZGVsYXkzLm91dHB1dHNbMV0pO1xuICBvdXRzWzRdLnB1c2goZGVsYXkzLm91dHB1dHNbMl0pO1xuICBzMS5pbnB1dHNbMV0gPSBnZW5pc2gubXVsKGRlbGF5MywgaW4zKTtcbiAgY29uc3QgbTIgPSBnZW5pc2gubXVsKHMxLCBpbjMpO1xuICBjb25zdCBkbDJfb3V0ID0gZ2VuaXNoLmFkZChkZWxheTMsIG0yKTtcblxuICBjb25zdCBkZWxheTQgPSBnLmRlbGF5KGRsMl9vdXQsIFszNzIwLCAxMDY2LCAyNjczXSk7XG4gIG91dHNbMl0ucHVzaChkZWxheTQub3V0cHV0c1sxXSk7XG4gIG91dHNbM10ucHVzaChkZWxheTQub3V0cHV0c1syXSk7XG5cbiAgLyogUklHSFQgQ0hBTk5FTCAqL1xuICBjb25zdCByaWdodFN0YXJ0ID0gZ2VuaXNoLmFkZChnZW5pc2gubXVsKGRlbGF5NCwgaW41KSwgaW4xKTtcbiAgY29uc3QgZGVsYXlJbnB1dFIgPSBnZW5pc2guYWRkKHJpZ2h0U3RhcnQsIDApO1xuICBjb25zdCBkZWxheTFSID0gZy5kZWxheShkZWxheUlucHV0UiwgZ2VuaXNoLmFkZChnZW5pc2gubXVsKGcuY3ljbGUoLjA3KSwgMTYpLCA5MDgpLCB7IHNpemU6IDkyNCB9KTtcbiAgZGVsYXlJbnB1dFIuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkZWxheTFSLCBpbjIpO1xuICBjb25zdCBkZWxheU91dFIgPSBnZW5pc2guc3ViKGRlbGF5MVIsIGdlbmlzaC5tdWwoZGVsYXlJbnB1dFIsIGluMikpO1xuXG4gIGNvbnN0IGRlbGF5MlIgPSBnLmRlbGF5KGRlbGF5T3V0UiwgWzQyMTcsIDI2NiwgMjk3NCwgMjExMV0pO1xuICBvdXRzWzFdLnB1c2goZ2VuaXNoLmFkZChkZWxheTJSLm91dHB1dHNbMV0sIGRlbGF5MlIub3V0cHV0c1syXSkpO1xuICBvdXRzWzRdLnB1c2goZGVsYXkyUi5vdXRwdXRzWzNdKTtcblxuICBjb25zdCBtelIgPSBnLmhpc3RvcnkoMCk7XG4gIGNvbnN0IG1sUiA9IGcubWl4KGRlbGF5MlIsIG16Ui5vdXQsIGluNCk7XG4gIG16Ui5pbihtbFIpO1xuXG4gIGNvbnN0IG1vdXRSID0gZ2VuaXNoLm11bChtbFIsIGluNSk7XG5cbiAgY29uc3QgczFSID0gZ2VuaXNoLnN1Yihtb3V0UiwgMCk7XG4gIGNvbnN0IGRlbGF5M1IgPSBnLmRlbGF5KHMxUiwgWzI2NTYsIDMzNSwgMTkxM10pO1xuICBvdXRzWzRdLnB1c2goZGVsYXkzUi5vdXRwdXRzWzFdKTtcbiAgb3V0c1syXS5wdXNoKGRlbGF5M1Iub3V0cHV0c1syXSk7XG4gIHMxUi5pbnB1dHNbMV0gPSBnZW5pc2gubXVsKGRlbGF5M1IsIGluMyk7XG4gIGNvbnN0IG0yUiA9IGdlbmlzaC5tdWwoczFSLCBpbjMpO1xuICBjb25zdCBkbDJfb3V0UiA9IGdlbmlzaC5hZGQoZGVsYXkzUiwgbTJSKTtcblxuICBjb25zdCBkZWxheTRSID0gZy5kZWxheShkbDJfb3V0UiwgWzMxNjMsIDEyMSwgMTk5Nl0pO1xuICBvdXRzWzRdLnB1c2goZGVsYXk0Lm91dHB1dHNbMV0pO1xuICBvdXRzWzFdLnB1c2goZGVsYXk0Lm91dHB1dHNbMl0pO1xuXG4gIGxlZnRTdGFydC5pbnB1dHNbMV0gPSBnZW5pc2gubXVsKGRlbGF5NFIsIGluNSk7XG5cbiAgb3V0c1sxXSA9IGcuYWRkKC4uLm91dHNbMV0pO1xuICBvdXRzWzJdID0gZy5hZGQoLi4ub3V0c1syXSk7XG4gIG91dHNbM10gPSBnLmFkZCguLi5vdXRzWzNdKTtcbiAgb3V0c1s0XSA9IGcuYWRkKC4uLm91dHNbNF0pO1xuICByZXR1cm4gb3V0cztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEdpYmJlcmlzaCkge1xuXG4gIGNvbnN0IFJldmVyYiA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgUmV2ZXJiLmRlZmF1bHRzLCBlZmZlY3QuZGVmYXVsdHMsIGlucHV0UHJvcHMpLFxuICAgICAgICAgIHJldmVyYiA9IE9iamVjdC5jcmVhdGUoZWZmZWN0KTtcblxuICAgIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZTtcblxuICAgIGNvbnN0IGlucHV0ID0gZy5pbignaW5wdXQnKSxcbiAgICAgICAgICBkYW1waW5nID0gZy5pbignZGFtcGluZycpLFxuICAgICAgICAgIGRyeXdldCA9IGcuaW4oJ2RyeXdldCcpLFxuICAgICAgICAgIGRlY2F5ID0gZy5pbignZGVjYXknKSxcbiAgICAgICAgICBwcmVkZWxheSA9IGcuaW4oJ3ByZWRlbGF5JyksXG4gICAgICAgICAgaW5iYW5kd2lkdGggPSBnLmluKCdpbmJhbmR3aWR0aCcpLFxuICAgICAgICAgIGRlY2F5ZGlmZnVzaW9uMSA9IGcuaW4oJ2RlY2F5ZGlmZnVzaW9uMScpLFxuICAgICAgICAgIGRlY2F5ZGlmZnVzaW9uMiA9IGcuaW4oJ2RlY2F5ZGlmZnVzaW9uMicpLFxuICAgICAgICAgIGluZGlmZnVzaW9uMSA9IGcuaW4oJ2luZGlmZnVzaW9uMScpLFxuICAgICAgICAgIGluZGlmZnVzaW9uMiA9IGcuaW4oJ2luZGlmZnVzaW9uMicpO1xuXG4gICAgY29uc3Qgc3VtbWVkSW5wdXQgPSBpc1N0ZXJlbyA9PT0gdHJ1ZSA/IGcuYWRkKGlucHV0WzBdLCBpbnB1dFsxXSkgOiBpbnB1dDtcblxuICAgIHtcbiAgICAgICd1c2UganNkc3AnO1xuXG4gICAgICAvLyBjYWxjdWxjYXRlIHByZWRlbGF5XG4gICAgICBjb25zdCBwcmVkZWxheV9zYW1wcyA9IGcubXN0b3NhbXBzKHByZWRlbGF5KTtcbiAgICAgIGNvbnN0IHByZWRlbGF5X2RlbGF5ID0gZy5kZWxheShzdW1tZWRJbnB1dCwgcHJlZGVsYXlfc2FtcHMsIHsgc2l6ZTogNDQxMCB9KTtcbiAgICAgIGNvbnN0IHpfcGQgPSBnLmhpc3RvcnkoMCk7XG4gICAgICBjb25zdCBtaXgxID0gZy5taXgoel9wZC5vdXQsIHByZWRlbGF5X2RlbGF5LCBpbmJhbmR3aWR0aCk7XG4gICAgICB6X3BkLmluKG1peDEpO1xuXG4gICAgICBjb25zdCBwcmVkZWxheV9vdXQgPSBtaXgxO1xuXG4gICAgICAvLyBydW4gaW5wdXQgKyBwcmVkZWxheSB0aHJvdWdoIGFsbC1wYXNzIGNoYWluXG4gICAgICBjb25zdCBhcF9vdXQgPSBBbGxQYXNzQ2hhaW4ocHJlZGVsYXlfb3V0LCBpbmRpZmZ1c2lvbjEsIGluZGlmZnVzaW9uMik7XG5cbiAgICAgIC8vIHJ1biBmaWx0ZXJlZCBzaWduYWwgaW50byBcInRhbmtcIiBtb2RlbFxuICAgICAgY29uc3QgdGFua19vdXRzID0gVGFuayhhcF9vdXQsIGRlY2F5ZGlmZnVzaW9uMSwgZGVjYXlkaWZmdXNpb24yLCBkYW1waW5nLCBkZWNheSk7XG5cbiAgICAgIGNvbnN0IGxlZnRXZXQgPSBnZW5pc2gubXVsKGdlbmlzaC5zdWIodGFua19vdXRzWzFdLCB0YW5rX291dHNbMl0pLCAuNik7XG4gICAgICBjb25zdCByaWdodFdldCA9IGdlbmlzaC5tdWwoZ2VuaXNoLnN1Yih0YW5rX291dHNbM10sIHRhbmtfb3V0c1s0XSksIC42KTtcblxuICAgICAgLy8gbWl4IHdldCBhbmQgZHJ5IHNpZ25hbCBmb3IgZmluYWwgb3V0cHV0XG4gICAgICBjb25zdCBsZWZ0ID0gZy5taXgoaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0LCBsZWZ0V2V0LCBkcnl3ZXQpO1xuICAgICAgY29uc3QgcmlnaHQgPSBnLm1peChpc1N0ZXJlbyA/IGlucHV0WzFdIDogaW5wdXQsIHJpZ2h0V2V0LCBkcnl3ZXQpO1xuXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeShyZXZlcmIsIFtsZWZ0LCByaWdodF0sICdkYXR0b3JybycsIHByb3BzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV2ZXJiO1xuICB9O1xuXG4gIFJldmVyYi5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDogMCxcbiAgICBkYW1waW5nOiAuNSxcbiAgICBkcnl3ZXQ6IC41LFxuICAgIGRlY2F5OiAuNSxcbiAgICBwcmVkZWxheTogMTAsXG4gICAgaW5iYW5kd2lkdGg6IC41LFxuICAgIGluZGlmZnVzaW9uMTogLjc1LFxuICAgIGluZGlmZnVzaW9uMjogLjYyNSxcbiAgICBkZWNheWRpZmZ1c2lvbjE6IC43LFxuICAgIGRlY2F5ZGlmZnVzaW9uMjogLjVcbiAgfTtcblxuICByZXR1cm4gUmV2ZXJiO1xufTsiLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBEZWxheSA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7IGRlbGF5TGVuZ3RoOiA0NDEwMCB9LCBEZWxheS5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgZGVsYXkgPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IGZhbHNlIFxuICBcbiAgbGV0IGlucHV0ICAgICAgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICBkZWxheVRpbWUgID0gZy5pbiggJ3RpbWUnICksXG4gICAgICB3ZXRkcnkgICAgID0gZy5pbiggJ3dldGRyeScgKSxcbiAgICAgIGxlZnRJbnB1dCAgPSBpc1N0ZXJlbyA/IGlucHV0WyAwIF0gOiBpbnB1dCxcbiAgICAgIHJpZ2h0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WyAxIF0gOiBudWxsXG4gICAgXG4gIGxldCBmZWVkYmFjayA9IGcuaW4oICdmZWVkYmFjaycgKVxuXG4gIC8vIGxlZnQgY2hhbm5lbFxuICBsZXQgZmVlZGJhY2tIaXN0b3J5TCA9IGcuaGlzdG9yeSgpXG4gIGxldCBlY2hvTCA9IGcuZGVsYXkoIGcuYWRkKCBsZWZ0SW5wdXQsIGcubXVsKCBmZWVkYmFja0hpc3RvcnlMLm91dCwgZmVlZGJhY2sgKSApLCBkZWxheVRpbWUsIHsgc2l6ZTpwcm9wcy5kZWxheUxlbmd0aCB9KVxuICBmZWVkYmFja0hpc3RvcnlMLmluKCBlY2hvTCApXG4gIGxldCBsZWZ0ID0gZy5taXgoIGxlZnRJbnB1dCwgZWNob0wsIHdldGRyeSApXG5cbiAgaWYoIGlzU3RlcmVvICkge1xuICAgIC8vIHJpZ2h0IGNoYW5uZWxcbiAgICBsZXQgZmVlZGJhY2tIaXN0b3J5UiA9IGcuaGlzdG9yeSgpXG4gICAgbGV0IGVjaG9SID0gZy5kZWxheSggZy5hZGQoIHJpZ2h0SW5wdXQsIGcubXVsKCBmZWVkYmFja0hpc3RvcnlSLm91dCwgZmVlZGJhY2sgKSApLCBkZWxheVRpbWUsIHsgc2l6ZTpwcm9wcy5kZWxheUxlbmd0aCB9KVxuICAgIGZlZWRiYWNrSGlzdG9yeVIuaW4oIGVjaG9SIClcbiAgICBjb25zdCByaWdodCA9IGcubWl4KCByaWdodElucHV0LCBlY2hvUiwgd2V0ZHJ5IClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIGRlbGF5LFxuICAgICAgWyBsZWZ0LCByaWdodCBdLCBcbiAgICAgICdkZWxheScsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggZGVsYXksIGxlZnQsICdkZWxheScsIHByb3BzIClcbiAgfVxuICBcbiAgcmV0dXJuIGRlbGF5XG59XG5cbkRlbGF5LmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBmZWVkYmFjazouNzUsXG4gIHRpbWU6IDExMDI1LFxuICB3ZXRkcnk6IC41XG59XG5cbnJldHVybiBEZWxheVxuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSgnZ2VuaXNoLmpzJyksXG4gICAgICBlZmZlY3QgPSByZXF1aXJlKCcuL2VmZmVjdC5qcycpO1xuXG5jb25zdCBnZW5pc2ggPSBnO1xuXG4vKlxuXG4gICAgICAgICBleHAoYXNpZyAqIChzaGFwZTEgKyBwcmVnYWluKSkgLSBleHAoYXNpZyAqIChzaGFwZTIgLSBwcmVnYWluKSlcbiAgYW91dCA9IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgZXhwKGFzaWcgKiBwcmVnYWluKSAgICAgICAgICAgICsgZXhwKC1hc2lnICogcHJlZ2FpbilcblxuKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoR2liYmVyaXNoKSB7XG5cbiAgbGV0IERpc3RvcnRpb24gPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBEaXN0b3J0aW9uLmRlZmF1bHRzLCBlZmZlY3QuZGVmYXVsdHMsIGlucHV0UHJvcHMpLFxuICAgICAgICBkaXN0b3J0aW9uID0gT2JqZWN0LmNyZWF0ZShlZmZlY3QpO1xuXG4gICAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZTtcblxuICAgIGNvbnN0IGlucHV0ID0gZy5pbignaW5wdXQnKSxcbiAgICAgICAgICBzaGFwZTEgPSBnLmluKCdzaGFwZTEnKSxcbiAgICAgICAgICBzaGFwZTIgPSBnLmluKCdzaGFwZTInKSxcbiAgICAgICAgICBwcmVnYWluID0gZy5pbigncHJlZ2FpbicpLFxuICAgICAgICAgIHBvc3RnYWluID0gZy5pbigncG9zdGdhaW4nKTtcblxuICAgIGxldCBsb3V0O1xuICAgIHtcbiAgICAgICd1c2UganNkc3AnO1xuICAgICAgY29uc3QgbGlucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0O1xuICAgICAgY29uc3QgbHRvcCA9IGdlbmlzaC5zdWIoZy5leHAoZ2VuaXNoLm11bChsaW5wdXQsIGdlbmlzaC5hZGQoc2hhcGUxLCBwcmVnYWluKSkpLCBnLmV4cChnZW5pc2gubXVsKGxpbnB1dCwgZ2VuaXNoLnN1YihzaGFwZTIsIHByZWdhaW4pKSkpO1xuICAgICAgY29uc3QgbGJvdHRvbSA9IGdlbmlzaC5hZGQoZy5leHAoZ2VuaXNoLm11bChsaW5wdXQsIHByZWdhaW4pKSwgZy5leHAoZ2VuaXNoLm11bChnZW5pc2gubXVsKC0xLCBsaW5wdXQpLCBwcmVnYWluKSkpO1xuICAgICAgbG91dCA9IGdlbmlzaC5tdWwoZ2VuaXNoLmRpdihsdG9wLCBsYm90dG9tKSwgcG9zdGdhaW4pO1xuICAgIH1cblxuICAgIGlmIChpc1N0ZXJlbykge1xuICAgICAgbGV0IHJvdXQ7XG4gICAgICB7XG4gICAgICAgICd1c2UganNkc3AnO1xuICAgICAgICBjb25zdCByaW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzFdIDogaW5wdXQ7XG4gICAgICAgIGNvbnN0IHJ0b3AgPSBnZW5pc2guc3ViKGcuZXhwKGdlbmlzaC5tdWwocmlucHV0LCBnZW5pc2guYWRkKHNoYXBlMSwgcHJlZ2FpbikpKSwgZy5leHAoZ2VuaXNoLm11bChyaW5wdXQsIGdlbmlzaC5zdWIoc2hhcGUyLCBwcmVnYWluKSkpKTtcbiAgICAgICAgY29uc3QgcmJvdHRvbSA9IGdlbmlzaC5hZGQoZy5leHAoZ2VuaXNoLm11bChyaW5wdXQsIHByZWdhaW4pKSwgZy5leHAoZ2VuaXNoLm11bChnZW5pc2gubXVsKC0xLCByaW5wdXQpLCBwcmVnYWluKSkpO1xuICAgICAgICByb3V0ID0gZ2VuaXNoLm11bChnZW5pc2guZGl2KHJ0b3AsIHJib3R0b20pLCBwb3N0Z2Fpbik7XG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KGRpc3RvcnRpb24sIFtsb3V0LCByb3V0XSwgJ2Rpc3RvcnRpb24nLCBwcm9wcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KGRpc3RvcnRpb24sIGxvdXQsICdkaXN0b3J0aW9uJywgcHJvcHMpO1xuICAgIH1cblxuICAgIHJldHVybiBkaXN0b3J0aW9uO1xuICB9O1xuXG4gIERpc3RvcnRpb24uZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6IDAsXG4gICAgc2hhcGUxOiAuMSxcbiAgICBzaGFwZTI6IC4xLFxuICAgIHByZWdhaW46IDUsXG4gICAgcG9zdGdhaW46IC41XG4gIH07XG5cbiAgcmV0dXJuIERpc3RvcnRpb247XG59OyIsImxldCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubGV0IGVmZmVjdCA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG5PYmplY3QuYXNzaWduKCBlZmZlY3QsIHtcbiAgZGVmYXVsdHM6IHsgYnlwYXNzOmZhbHNlIH1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gZWZmZWN0XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgZWZmZWN0cyA9IHtcbiAgICBGcmVldmVyYiAgICA6IHJlcXVpcmUoICcuL2ZyZWV2ZXJiLmpzJyAgKSggR2liYmVyaXNoICksXG4gICAgUGxhdGUgICAgICAgOiByZXF1aXJlKCAnLi9kYXR0b3Jyby5qcycgICkoIEdpYmJlcmlzaCApLFxuICAgIEZsYW5nZXIgICAgIDogcmVxdWlyZSggJy4vZmxhbmdlci5qcycgICApKCBHaWJiZXJpc2ggKSxcbiAgICBWaWJyYXRvICAgICA6IHJlcXVpcmUoICcuL3ZpYnJhdG8uanMnICAgKSggR2liYmVyaXNoICksXG4gICAgRGVsYXkgICAgICAgOiByZXF1aXJlKCAnLi9kZWxheS5qcycgICAgICkoIEdpYmJlcmlzaCApLFxuICAgIEJpdENydXNoZXIgIDogcmVxdWlyZSggJy4vYml0Q3J1c2hlci5qcycpKCBHaWJiZXJpc2ggKSxcbiAgICBEaXN0b3J0aW9uICA6IHJlcXVpcmUoICcuL2Rpc3RvcnRpb24uanMnKSggR2liYmVyaXNoICksXG4gICAgUmluZ01vZCAgICAgOiByZXF1aXJlKCAnLi9yaW5nTW9kLmpzJyAgICkoIEdpYmJlcmlzaCApLFxuICAgIFRyZW1vbG8gICAgIDogcmVxdWlyZSggJy4vdHJlbW9sby5qcycgICApKCBHaWJiZXJpc2ggKSxcbiAgICBDaG9ydXMgICAgICA6IHJlcXVpcmUoICcuL2Nob3J1cy5qcycgICAgKSggR2liYmVyaXNoICksXG4gICAgU2h1ZmZsZXIgICAgOiByZXF1aXJlKCAnLi9idWZmZXJTaHVmZmxlci5qcycgICkoIEdpYmJlcmlzaCApLFxuICAgIC8vR2F0ZSAgICAgICAgOiByZXF1aXJlKCAnLi9nYXRlLmpzJyAgICAgICkoIEdpYmJlcmlzaCApLFxuICB9XG5cbiAgZWZmZWN0cy5leHBvcnQgPSB0YXJnZXQgPT4ge1xuICAgIGZvciggbGV0IGtleSBpbiBlZmZlY3RzICkge1xuICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgIHRhcmdldFsga2V5IF0gPSBlZmZlY3RzWyBrZXkgXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5yZXR1cm4gZWZmZWN0c1xuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgcHJvdG8gPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IEZsYW5nZXIgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzICAgPSBPYmplY3QuYXNzaWduKCB7IGRlbGF5TGVuZ3RoOjQ0MTAwIH0sIEZsYW5nZXIuZGVmYXVsdHMsIHByb3RvLmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICBmbGFuZ2VyID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICBkZWxheUxlbmd0aCA9IHByb3BzLmRlbGF5TGVuZ3RoLFxuICAgICAgZmVlZGJhY2tDb2VmZiA9IGcuaW4oICdmZWVkYmFjaycgKSxcbiAgICAgIG1vZEFtb3VudCA9IGcuaW4oICdvZmZzZXQnICksXG4gICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgZGVsYXlCdWZmZXJMID0gZy5kYXRhKCBkZWxheUxlbmd0aCApLFxuICAgICAgZGVsYXlCdWZmZXJSXG5cbiAgbGV0IHdyaXRlSWR4ID0gZy5hY2N1bSggMSwwLCB7IG1pbjowLCBtYXg6ZGVsYXlMZW5ndGgsIGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBsZXQgb2Zmc2V0ID0gZy5tdWwoIG1vZEFtb3VudCwgNTAwIClcblxuICBsZXQgbW9kID0gcHJvcHMubW9kID09PSB1bmRlZmluZWQgPyBnLmN5Y2xlKCBmcmVxdWVuY3kgKSA6IHByb3BzLm1vZFxuICBcbiAgbGV0IHJlYWRJZHggPSBnLndyYXAoIFxuICAgIGcuYWRkKCBcbiAgICAgIGcuc3ViKCB3cml0ZUlkeCwgb2Zmc2V0ICksIFxuICAgICAgbW9kLy9nLm11bCggbW9kLCBnLnN1Yiggb2Zmc2V0LCAxICkgKSBcbiAgICApLCBcblx0ICAwLCBcbiAgICBkZWxheUxlbmd0aFxuICApXG5cbiAgbGV0IGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dFxuXG4gIGxldCBkZWxheWVkT3V0TCA9IGcucGVlayggZGVsYXlCdWZmZXJMLCByZWFkSWR4LCB7IGludGVycDonbGluZWFyJywgbW9kZTonc2FtcGxlcycgfSlcbiAgXG4gIGcucG9rZSggZGVsYXlCdWZmZXJMLCBnLmFkZCggbGVmdElucHV0LCBnLm11bCggZGVsYXllZE91dEwsIGZlZWRiYWNrQ29lZmYgKSApLCB3cml0ZUlkeCApXG5cbiAgbGV0IGxlZnQgPSBnLmFkZCggbGVmdElucHV0LCBkZWxheWVkT3V0TCApLFxuICAgICAgcmlnaHRcblxuICBpZiggaXNTdGVyZW8gPT09IHRydWUgKSB7XG4gICAgcmlnaHRJbnB1dCA9IGlucHV0WzFdXG4gICAgZGVsYXlCdWZmZXJSID0gZy5kYXRhKCBkZWxheUxlbmd0aCApXG4gICAgXG4gICAgbGV0IGRlbGF5ZWRPdXRSID0gZy5wZWVrKCBkZWxheUJ1ZmZlclIsIHJlYWRJZHgsIHsgaW50ZXJwOidsaW5lYXInLCBtb2RlOidzYW1wbGVzJyB9KVxuXG4gICAgZy5wb2tlKCBkZWxheUJ1ZmZlclIsIGcuYWRkKCByaWdodElucHV0LCBnLm11bCggZGVsYXllZE91dFIsIGZlZWRiYWNrQ29lZmYgKSApLCB3cml0ZUlkeCApXG4gICAgcmlnaHQgPSBnLmFkZCggcmlnaHRJbnB1dCwgZGVsYXllZE91dFIgKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgZmxhbmdlcixcbiAgICAgIFsgbGVmdCwgcmlnaHQgXSwgXG4gICAgICAnZmxhbmdlcicsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuXG4gIH1lbHNle1xuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBmbGFuZ2VyLCBsZWZ0LCAnZmxhbmdlcicsIHByb3BzIClcbiAgfVxuICBcbiAgcmV0dXJuIGZsYW5nZXJcbn1cblxuRmxhbmdlci5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgZmVlZGJhY2s6LjAxLFxuICBvZmZzZXQ6LjI1LFxuICBmcmVxdWVuY3k6LjVcbn1cblxucmV0dXJuIEZsYW5nZXJcblxufVxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBcbmNvbnN0IGFsbFBhc3MgPSBHaWJiZXJpc2guZmlsdGVycy5nZW5pc2guQWxsUGFzc1xuY29uc3QgY29tYkZpbHRlciA9IEdpYmJlcmlzaC5maWx0ZXJzLmdlbmlzaC5Db21iXG5cbmNvbnN0IHR1bmluZyA9IHtcbiAgY29tYkNvdW50Olx0ICBcdDgsXG4gIGNvbWJUdW5pbmc6IFx0XHRbIDExMTYsIDExODgsIDEyNzcsIDEzNTYsIDE0MjIsIDE0OTEsIDE1NTcsIDE2MTcgXSwgICAgICAgICAgICAgICAgICAgIFxuICBhbGxQYXNzQ291bnQ6IFx0NCxcbiAgYWxsUGFzc1R1bmluZzpcdFsgMjI1LCA1NTYsIDQ0MSwgMzQxIF0sXG4gIGFsbFBhc3NGZWVkYmFjazowLjUsXG4gIGZpeGVkR2FpbjogXHRcdCAgMC4wMTUsXG4gIHNjYWxlRGFtcGluZzogXHQwLjQsXG4gIHNjYWxlUm9vbTogXHRcdCAgMC4yOCxcbiAgb2Zmc2V0Um9vbTogXHQgIDAuNyxcbiAgc3RlcmVvU3ByZWFkOiAgIDIzXG59XG5cbmNvbnN0IEZyZWV2ZXJiID0gaW5wdXRQcm9wcyA9PiB7XG4gIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBGcmVldmVyYi5kZWZhdWx0cywgZWZmZWN0LmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICByZXZlcmIgPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKSBcbiAgIFxuICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuICBcbiAgbGV0IGNvbWJzTCA9IFtdLCBjb21ic1IgPSBbXVxuXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIHdldDEgPSBnLmluKCAnd2V0MScpLCB3ZXQyID0gZy5pbiggJ3dldDInICksICBkcnkgPSBnLmluKCAnZHJ5JyApLCBcbiAgICAgIHJvb21TaXplID0gZy5pbiggJ3Jvb21TaXplJyApLCBkYW1waW5nID0gZy5pbiggJ2RhbXBpbmcnIClcbiAgXG4gIGxldCBzdW1tZWRJbnB1dCA9IGlzU3RlcmVvID09PSB0cnVlID8gZy5hZGQoIGlucHV0WzBdLCBpbnB1dFsxXSApIDogaW5wdXQsXG4gICAgICBhdHRlbnVhdGVkSW5wdXQgPSBnLm1lbW8oIGcubXVsKCBzdW1tZWRJbnB1dCwgdHVuaW5nLmZpeGVkR2FpbiApIClcbiAgXG4gIC8vIGNyZWF0ZSBjb21iIGZpbHRlcnMgaW4gcGFyYWxsZWwuLi5cbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCA4OyBpKysgKSB7IFxuICAgIGNvbWJzTC5wdXNoKCBcbiAgICAgIGNvbWJGaWx0ZXIoIGF0dGVudWF0ZWRJbnB1dCwgdHVuaW5nLmNvbWJUdW5pbmdbaV0sIGcubXVsKGRhbXBpbmcsLjQpLCBnLm11bCggdHVuaW5nLnNjYWxlUm9vbSArIHR1bmluZy5vZmZzZXRSb29tLCByb29tU2l6ZSApICkgXG4gICAgKVxuICAgIGNvbWJzUi5wdXNoKCBcbiAgICAgIGNvbWJGaWx0ZXIoIGF0dGVudWF0ZWRJbnB1dCwgdHVuaW5nLmNvbWJUdW5pbmdbaV0gKyB0dW5pbmcuc3RlcmVvU3ByZWFkLCBnLm11bChkYW1waW5nLC40KSwgZy5tdWwoIHR1bmluZy5zY2FsZVJvb20gKyB0dW5pbmcub2Zmc2V0Um9vbSwgcm9vbVNpemUgKSApIFxuICAgIClcbiAgfVxuICBcbiAgLy8gLi4uIGFuZCBzdW0gdGhlbSB3aXRoIGF0dGVudWF0ZWQgaW5wdXRcbiAgbGV0IG91dEwgPSBnLmFkZCggYXR0ZW51YXRlZElucHV0LCAuLi5jb21ic0wgKVxuICBsZXQgb3V0UiA9IGcuYWRkKCBhdHRlbnVhdGVkSW5wdXQsIC4uLmNvbWJzUiApXG4gIFxuICAvLyBydW4gdGhyb3VnaCBhbGxwYXNzIGZpbHRlcnMgaW4gc2VyaWVzXG4gIGZvciggbGV0IGkgPSAwOyBpIDwgNDsgaSsrICkgeyBcbiAgICBvdXRMID0gYWxsUGFzcyggb3V0TCwgdHVuaW5nLmFsbFBhc3NUdW5pbmdbIGkgXSArIHR1bmluZy5zdGVyZW9TcHJlYWQgKVxuICAgIG91dFIgPSBhbGxQYXNzKCBvdXRSLCB0dW5pbmcuYWxsUGFzc1R1bmluZ1sgaSBdICsgdHVuaW5nLnN0ZXJlb1NwcmVhZCApXG4gIH1cbiAgXG4gIGxldCBvdXRwdXRMID0gZy5hZGQoIGcubXVsKCBvdXRMLCB3ZXQxICksIGcubXVsKCBvdXRSLCB3ZXQyICksIGcubXVsKCBpc1N0ZXJlbyA9PT0gdHJ1ZSA/IGlucHV0WzBdIDogaW5wdXQsIGRyeSApICksXG4gICAgICBvdXRwdXRSID0gZy5hZGQoIGcubXVsKCBvdXRSLCB3ZXQxICksIGcubXVsKCBvdXRMLCB3ZXQyICksIGcubXVsKCBpc1N0ZXJlbyA9PT0gdHJ1ZSA/IGlucHV0WzFdIDogaW5wdXQsIGRyeSApIClcblxuICBHaWJiZXJpc2guZmFjdG9yeSggcmV2ZXJiLCBbIG91dHB1dEwsIG91dHB1dFIgXSwgJ2ZyZWV2ZXJiJywgcHJvcHMgKVxuXG4gIHJldHVybiByZXZlcmJcbn1cblxuXG5GcmVldmVyYi5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgd2V0MTogMSxcbiAgd2V0MjogMCxcbiAgZHJ5OiAuNSxcbiAgcm9vbVNpemU6IC44NCxcbiAgZGFtcGluZzogIC41XG59XG5cbnJldHVybiBGcmVldmVyYiBcblxufVxuXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBSaW5nTW9kID0gaW5wdXRQcm9wcyA9PiB7XG4gIGxldCBwcm9wcyAgID0gT2JqZWN0LmFzc2lnbigge30sIFJpbmdNb2QuZGVmYXVsdHMsIGVmZmVjdC5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgcmluZ01vZCA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICBnYWluID0gZy5pbiggJ2dhaW4nICksXG4gICAgICBtaXggPSBnLmluKCAnbWl4JyApXG4gIFxuICBsZXQgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFswXSA6IGlucHV0LFxuICAgICAgc2luZSA9IGcubXVsKCBnLmN5Y2xlKCBmcmVxdWVuY3kgKSwgZ2FpbiApXG4gXG4gIGxldCBsZWZ0ID0gZy5hZGQoIGcubXVsKCBsZWZ0SW5wdXQsIGcuc3ViKCAxLCBtaXggKSksIGcubXVsKCBnLm11bCggbGVmdElucHV0LCBzaW5lICksIG1peCApICksIFxuICAgICAgcmlnaHRcblxuICBpZiggaXNTdGVyZW8gPT09IHRydWUgKSB7XG4gICAgbGV0IHJpZ2h0SW5wdXQgPSBpbnB1dFsxXVxuICAgIHJpZ2h0ID0gZy5hZGQoIGcubXVsKCByaWdodElucHV0LCBnLnN1YiggMSwgbWl4ICkpLCBnLm11bCggZy5tdWwoIHJpZ2h0SW5wdXQsIHNpbmUgKSwgbWl4ICkgKSBcbiAgICBcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICByaW5nTW9kLFxuICAgICAgWyBsZWZ0LCByaWdodCBdLCBcbiAgICAgICdyaW5nTW9kJywgXG4gICAgICBwcm9wcyBcbiAgICApXG4gIH1lbHNle1xuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCByaW5nTW9kLCBsZWZ0LCAncmluZ01vZCcsIHByb3BzIClcbiAgfVxuICBcbiAgcmV0dXJuIHJpbmdNb2Rcbn1cblxuUmluZ01vZC5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgZnJlcXVlbmN5OjIyMCxcbiAgZ2FpbjogMSwgXG4gIG1peDoxXG59XG5cbnJldHVybiBSaW5nTW9kXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmNvbnN0IFRyZW1vbG8gPSBpbnB1dFByb3BzID0+IHtcbiAgY29uc3QgcHJvcHMgICA9IE9iamVjdC5hc3NpZ24oIHt9LCBUcmVtb2xvLmRlZmF1bHRzLCBlZmZlY3QuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgICAgdHJlbW9sbyA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG5cbiAgY29uc3QgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiB0cnVlIFxuICBcbiAgY29uc3QgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgIGFtb3VudCA9IGcuaW4oICdhbW91bnQnIClcbiAgXG4gIGNvbnN0IGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dFxuXG4gIGxldCBvc2NcbiAgaWYoIHByb3BzLnNoYXBlID09PSAnc3F1YXJlJyApIHtcbiAgICBvc2MgPSBnLmd0KCBnLnBoYXNvciggZnJlcXVlbmN5ICksIDAgKVxuICB9ZWxzZSBpZiggcHJvcHMuc2hhcGUgPT09ICdzYXcnICkge1xuICAgIG9zYyA9IGcuZ3RwKCBnLnBoYXNvciggZnJlcXVlbmN5ICksIDAgKVxuICB9ZWxzZXtcbiAgICBvc2MgPSBnLmN5Y2xlKCBmcmVxdWVuY3kgKVxuICB9XG5cbiAgY29uc3QgbW9kID0gZy5tdWwoIG9zYywgYW1vdW50IClcbiBcbiAgbGV0IGxlZnQgPSBnLnN1YiggbGVmdElucHV0LCBnLm11bCggbGVmdElucHV0LCBtb2QgKSApLCBcbiAgICAgIHJpZ2h0XG5cbiAgaWYoIGlzU3RlcmVvID09PSB0cnVlICkge1xuICAgIGxldCByaWdodElucHV0ID0gaW5wdXRbMV1cbiAgICByaWdodCA9IGcubXVsKCByaWdodElucHV0LCBtb2QgKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgdHJlbW9sbyxcbiAgICAgIFsgbGVmdCwgcmlnaHQgXSwgXG4gICAgICAndHJlbW9sbycsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggdHJlbW9sbywgbGVmdCwgJ3RyZW1vbG8nLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiB0cmVtb2xvXG59XG5cblRyZW1vbG8uZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIGZyZXF1ZW5jeToyLFxuICBhbW91bnQ6IDEsIFxuICBzaGFwZTonc2luZSdcbn1cblxucmV0dXJuIFRyZW1vbG9cblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgVmlicmF0byA9IGlucHV0UHJvcHMgPT4ge1xuICBsZXQgcHJvcHMgICA9IE9iamVjdC5hc3NpZ24oIHt9LCBWaWJyYXRvLmRlZmF1bHRzLCBlZmZlY3QuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgIHZpYnJhdG8gPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IHRydWUgXG4gIFxuICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICBkZWxheUxlbmd0aCA9IDQ0MTAwLFxuICAgICAgZmVlZGJhY2tDb2VmZiA9IC4wMSwvL2cuaW4oICdmZWVkYmFjaycgKSxcbiAgICAgIG1vZEFtb3VudCA9IGcuaW4oICdhbW91bnQnICksXG4gICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgZGVsYXlCdWZmZXJMID0gZy5kYXRhKCBkZWxheUxlbmd0aCApLFxuICAgICAgZGVsYXlCdWZmZXJSXG5cbiAgbGV0IHdyaXRlSWR4ID0gZy5hY2N1bSggMSwwLCB7IG1pbjowLCBtYXg6ZGVsYXlMZW5ndGgsIGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBsZXQgb2Zmc2V0ID0gZy5tdWwoIG1vZEFtb3VudCwgNTAwIClcbiAgXG4gIGxldCByZWFkSWR4ID0gZy53cmFwKCBcbiAgICBnLmFkZCggXG4gICAgICBnLnN1Yiggd3JpdGVJZHgsIG9mZnNldCApLCBcbiAgICAgIGcubXVsKCBnLmN5Y2xlKCBmcmVxdWVuY3kgKSwgZy5zdWIoIG9mZnNldCwgMSApICkgXG4gICAgKSwgXG5cdCAgMCwgXG4gICAgZGVsYXlMZW5ndGhcbiAgKVxuXG4gIGxldCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXRcblxuICBsZXQgZGVsYXllZE91dEwgPSBnLnBlZWsoIGRlbGF5QnVmZmVyTCwgcmVhZElkeCwgeyBpbnRlcnA6J2xpbmVhcicsIG1vZGU6J3NhbXBsZXMnIH0pXG4gIFxuICBnLnBva2UoIGRlbGF5QnVmZmVyTCwgZy5hZGQoIGxlZnRJbnB1dCwgZy5tdWwoIGRlbGF5ZWRPdXRMLCBmZWVkYmFja0NvZWZmICkgKSwgd3JpdGVJZHggKVxuXG4gIGxldCBsZWZ0ID0gZGVsYXllZE91dEwsXG4gICAgICByaWdodFxuXG4gIGlmKCBpc1N0ZXJlbyA9PT0gdHJ1ZSApIHtcbiAgICByaWdodElucHV0ID0gaW5wdXRbMV1cbiAgICBkZWxheUJ1ZmZlclIgPSBnLmRhdGEoIGRlbGF5TGVuZ3RoIClcbiAgICBcbiAgICBsZXQgZGVsYXllZE91dFIgPSBnLnBlZWsoIGRlbGF5QnVmZmVyUiwgcmVhZElkeCwgeyBpbnRlcnA6J2xpbmVhcicsIG1vZGU6J3NhbXBsZXMnIH0pXG5cbiAgICBnLnBva2UoIGRlbGF5QnVmZmVyUiwgZy5hZGQoIHJpZ2h0SW5wdXQsIG11bCggZGVsYXllZE91dFIsIGZlZWRiYWNrQ29lZmYgKSApLCB3cml0ZUlkeCApXG4gICAgcmlnaHQgPSBkZWxheWVkT3V0UlxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgdmlicmF0byxcbiAgICAgIFsgbGVmdCwgcmlnaHQgXSwgXG4gICAgICAndmlicmF0bycsIFxuICAgICAgcHJvcHMgXG4gICAgKVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggdmlicmF0bywgbGVmdCwgJ3ZpYnJhdG8nLCBwcm9wcyApXG4gIH1cbiAgXG4gIHJldHVybiB2aWJyYXRvXG59XG5cblZpYnJhdG8uZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIC8vZmVlZGJhY2s6LjAxLFxuICBhbW91bnQ6LjUsXG4gIGZyZXF1ZW5jeTo0XG59XG5cbnJldHVybiBWaWJyYXRvXG5cbn1cbiIsImxldCBNZW1vcnlIZWxwZXIgPSByZXF1aXJlKCAnbWVtb3J5LWhlbHBlcicgKSxcbiAgICBnZW5pc2ggICAgICAgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG4gICAgXG5sZXQgR2liYmVyaXNoID0ge1xuICBibG9ja0NhbGxiYWNrczogW10sIC8vIGNhbGxlZCBldmVyeSBibG9ja1xuICBkaXJ0eVVnZW5zOiBbXSxcbiAgY2FsbGJhY2tVZ2VuczogW10sXG4gIGNhbGxiYWNrTmFtZXM6IFtdLFxuICBhbmFseXplcnM6IFtdLFxuICBncmFwaElzRGlydHk6IGZhbHNlLFxuICB1Z2Vuczoge30sXG4gIGRlYnVnOiBmYWxzZSxcblxuICBvdXRwdXQ6IG51bGwsXG5cbiAgbWVtb3J5IDogbnVsbCwgLy8gMjAgbWludXRlcyBieSBkZWZhdWx0P1xuICBmYWN0b3J5OiBudWxsLCBcbiAgZ2VuaXNoLFxuICBzY2hlZHVsZXI6IHJlcXVpcmUoICcuL3NjaGVkdWxpbmcvc2NoZWR1bGVyLmpzJyApLFxuXG4gIG1lbW9lZDoge30sXG5cbiAgcHJvdG90eXBlczoge1xuICAgIHVnZW46IHJlcXVpcmUoJy4vdWdlbi5qcycpLFxuICAgIGluc3RydW1lbnQ6IHJlcXVpcmUoICcuL2luc3RydW1lbnRzL2luc3RydW1lbnQuanMnICksXG4gICAgZWZmZWN0OiByZXF1aXJlKCAnLi9meC9lZmZlY3QuanMnICksXG4gIH0sXG5cbiAgbWl4aW5zOiB7XG4gICAgcG9seWluc3RydW1lbnQ6IHJlcXVpcmUoICcuL2luc3RydW1lbnRzL3BvbHlNaXhpbi5qcycgKVxuICB9LFxuXG4gIGluaXQoIG1lbUFtb3VudCwgY3R4ICkge1xuICAgIGxldCBudW1CeXRlcyA9IGlzTmFOKCBtZW1BbW91bnQgKSA/IDIwICogNjAgKiA0NDEwMCA6IG1lbUFtb3VudFxuXG4gICAgdGhpcy5tZW1vcnkgPSBNZW1vcnlIZWxwZXIuY3JlYXRlKCBudW1CeXRlcyApXG5cbiAgICB0aGlzLmxvYWQoKVxuICAgIFxuICAgIHRoaXMub3V0cHV0ID0gdGhpcy5CdXMyKClcblxuICAgIHRoaXMudXRpbGl0aWVzLmNyZWF0ZUNvbnRleHQoIGN0eCwgdGhpcy51dGlsaXRpZXMuY3JlYXRlU2NyaXB0UHJvY2Vzc29yLmJpbmQoIHRoaXMudXRpbGl0aWVzICkgKVxuXG4gICAgdGhpcy5hbmFseXplcnMuZGlydHkgPSBmYWxzZVxuXG4gICAgLy8gWFhYIEZPUiBERVZFTE9QTUVOVCBBTkQgVEVTVElORyBPTkxZLi4uIFJFTU9WRSBGT1IgUFJPRFVDVElPTlxuICAgIHRoaXMuZXhwb3J0KCB3aW5kb3cgKVxuICB9LFxuXG4gIGxvYWQoKSB7XG4gICAgdGhpcy5mYWN0b3J5ID0gcmVxdWlyZSggJy4vdWdlblRlbXBsYXRlLmpzJyApKCB0aGlzIClcblxuICAgIHRoaXMuUGFubmVyICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9wYW5uZXIuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuUG9seVRlbXBsYXRlID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudHMvcG9seXRlbXBsYXRlLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLm9zY2lsbGF0b3JzICA9IHJlcXVpcmUoICcuL29zY2lsbGF0b3JzL29zY2lsbGF0b3JzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLmZpbHRlcnMgICAgICA9IHJlcXVpcmUoICcuL2ZpbHRlcnMvZmlsdGVycy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5iaW5vcHMgICAgICAgPSByZXF1aXJlKCAnLi9taXNjL2Jpbm9wcy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5tb25vcHMgICAgICAgPSByZXF1aXJlKCAnLi9taXNjL21vbm9wcy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5CdXMgICAgICAgICAgPSByZXF1aXJlKCAnLi9taXNjL2J1cy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5CdXMyICAgICAgICAgPSByZXF1aXJlKCAnLi9taXNjL2J1czIuanMnICkoIHRoaXMgKTtcbiAgICB0aGlzLmluc3RydW1lbnRzICA9IHJlcXVpcmUoICcuL2luc3RydW1lbnRzL2luc3RydW1lbnRzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLmZ4ICAgICAgICAgICA9IHJlcXVpcmUoICcuL2Z4L2VmZmVjdHMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuU2VxdWVuY2VyICAgID0gcmVxdWlyZSggJy4vc2NoZWR1bGluZy9zZXF1ZW5jZXIuanMnICkoIHRoaXMgKTtcbiAgICB0aGlzLlNlcXVlbmNlcjIgICA9IHJlcXVpcmUoICcuL3NjaGVkdWxpbmcvc2VxMi5qcycgKSggdGhpcyApO1xuICAgIHRoaXMuZW52ZWxvcGVzICAgID0gcmVxdWlyZSggJy4vZW52ZWxvcGVzL2VudmVsb3Blcy5qcycgKSggdGhpcyApO1xuICAgIHRoaXMuYW5hbHlzaXMgICAgID0gcmVxdWlyZSggJy4vYW5hbHlzaXMvYW5hbHl6ZXJzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLnRpbWUgICAgICAgICA9IHJlcXVpcmUoICcuL21pc2MvdGltZS5qcycgKSggdGhpcyApXG4gIH0sXG5cbiAgZXhwb3J0KCB0YXJnZXQsIHNob3VsZEV4cG9ydEdlbmlzaD1mYWxzZSApIHtcbiAgICBpZiggdGFyZ2V0ID09PSB1bmRlZmluZWQgKSB0aHJvdyBFcnJvcignWW91IG11c3QgZGVmaW5lIGEgdGFyZ2V0IG9iamVjdCBmb3IgR2liYmVyaXNoIHRvIGV4cG9ydCB2YXJpYWJsZXMgdG8uJylcblxuICAgIGlmKCBzaG91bGRFeHBvcnRHZW5pc2ggKSB0aGlzLmdlbmlzaC5leHBvcnQoIHRhcmdldCApXG5cbiAgICB0aGlzLmluc3RydW1lbnRzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLmZ4LmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLmZpbHRlcnMuZXhwb3J0KCB0YXJnZXQgKVxuICAgIHRoaXMub3NjaWxsYXRvcnMuZXhwb3J0KCB0YXJnZXQgKVxuICAgIHRoaXMuYmlub3BzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLm1vbm9wcy5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5lbnZlbG9wZXMuZXhwb3J0KCB0YXJnZXQgKVxuICAgIHRoaXMuYW5hbHlzaXMuZXhwb3J0KCB0YXJnZXQgKVxuICAgIHRhcmdldC5TZXF1ZW5jZXIgPSB0aGlzLlNlcXVlbmNlclxuICAgIHRhcmdldC5TZXF1ZW5jZXIyID0gdGhpcy5TZXF1ZW5jZXIyXG4gICAgdGFyZ2V0LkJ1cyA9IHRoaXMuQnVzXG4gICAgdGFyZ2V0LkJ1czIgPSB0aGlzLkJ1czJcbiAgICB0YXJnZXQuU2NoZWR1bGVyID0gdGhpcy5zY2hlZHVsZXJcbiAgICB0aGlzLnRpbWUuZXhwb3J0KCB0YXJnZXQgKVxuICB9LFxuXG4gIHByaW50KCkge1xuICAgIGNvbnNvbGUubG9nKCB0aGlzLmNhbGxiYWNrLnRvU3RyaW5nKCkgKVxuICB9LFxuXG4gIGRpcnR5KCB1Z2VuICkge1xuICAgIGlmKCB1Z2VuID09PSB0aGlzLmFuYWx5emVycyApIHtcbiAgICAgIHRoaXMuZ3JhcGhJc0RpcnR5ID0gdHJ1ZVxuICAgICAgdGhpcy5hbmFseXplcnMuZGlydHkgPSB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGlydHlVZ2Vucy5wdXNoKCB1Z2VuIClcbiAgICAgIHRoaXMuZ3JhcGhJc0RpcnR5ID0gdHJ1ZVxuICAgICAgaWYoIHRoaXMubWVtb2VkWyB1Z2VuLnVnZW5OYW1lIF0gKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLm1lbW9lZFsgdWdlbi51Z2VuTmFtZSBdXG4gICAgICB9XG4gICAgfSBcbiAgfSxcblxuICBjbGVhcigpIHtcbiAgICB0aGlzLm91dHB1dC5pbnB1dHMgPSBbMF1cbiAgICAvL3RoaXMub3V0cHV0LmlucHV0TmFtZXMubGVuZ3RoID0gMFxuICAgIHRoaXMuYW5hbHl6ZXJzLmxlbmd0aCA9IDBcbiAgICB0aGlzLnNjaGVkdWxlci5jbGVhcigpXG4gICAgdGhpcy5kaXJ0eSggdGhpcy5vdXRwdXQgKVxuICB9LFxuXG4gIGdlbmVyYXRlQ2FsbGJhY2soKSB7XG4gICAgbGV0IHVpZCA9IDAsXG4gICAgICAgIGNhbGxiYWNrQm9keSwgbGFzdExpbmUsIGFuYWx5c2lzPScnXG5cbiAgICB0aGlzLm1lbW9lZCA9IHt9XG5cbiAgICBjYWxsYmFja0JvZHkgPSB0aGlzLnByb2Nlc3NHcmFwaCggdGhpcy5vdXRwdXQgKVxuICAgIGxhc3RMaW5lID0gY2FsbGJhY2tCb2R5WyBjYWxsYmFja0JvZHkubGVuZ3RoIC0gMV1cbiAgICBjYWxsYmFja0JvZHkudW5zaGlmdCggXCJcXHQndXNlIHN0cmljdCdcIiApXG5cbiAgICB0aGlzLmFuYWx5emVycy5mb3JFYWNoKCB2PT4ge1xuICAgICAgY29uc3QgYW5hbHlzaXNCbG9jayA9IEdpYmJlcmlzaC5wcm9jZXNzVWdlbiggdiApXG4gICAgICBjb25zdCBhbmFseXNpc0xpbmUgPSBhbmFseXNpc0Jsb2NrLnBvcCgpXG5cbiAgICAgIGFuYWx5c2lzQmxvY2suZm9yRWFjaCggdj0+IHtcbiAgICAgICAgY2FsbGJhY2tCb2R5LnNwbGljZSggY2FsbGJhY2tCb2R5Lmxlbmd0aCAtIDEsIDAsIHYgKVxuICAgICAgfSlcblxuICAgICAgY2FsbGJhY2tCb2R5LnB1c2goIGFuYWx5c2lzTGluZSApXG4gICAgfSlcblxuICAgIHRoaXMuYW5hbHl6ZXJzLmZvckVhY2goIHYgPT4ge1xuICAgICAgaWYoIHRoaXMuY2FsbGJhY2tVZ2Vucy5pbmRleE9mKCB2LmNhbGxiYWNrICkgPT09IC0xIClcbiAgICAgICAgdGhpcy5jYWxsYmFja1VnZW5zLnB1c2goIHYuY2FsbGJhY2sgKVxuICAgIH0pXG4gICAgdGhpcy5jYWxsYmFja05hbWVzID0gdGhpcy5jYWxsYmFja1VnZW5zLm1hcCggdiA9PiB2LnVnZW5OYW1lIClcblxuICAgIGNhbGxiYWNrQm9keS5wdXNoKCAnXFxuXFx0cmV0dXJuICcgKyBsYXN0TGluZS5zcGxpdCggJz0nIClbMF0uc3BsaXQoICcgJyApWzFdIClcblxuICAgIGlmKCB0aGlzLmRlYnVnICkgY29uc29sZS5sb2coICdjYWxsYmFjazpcXG4nLCBjYWxsYmFja0JvZHkuam9pbignXFxuJykgKVxuICAgIHRoaXMuY2FsbGJhY2tOYW1lcy5wdXNoKCAnbWVtb3J5JyApXG4gICAgdGhpcy5jYWxsYmFja1VnZW5zLnB1c2goIHRoaXMubWVtb3J5LmhlYXAgKVxuICAgIHRoaXMuY2FsbGJhY2sgPSBGdW5jdGlvbiggLi4udGhpcy5jYWxsYmFja05hbWVzLCBjYWxsYmFja0JvZHkuam9pbiggJ1xcbicgKSApXG4gICAgdGhpcy5jYWxsYmFjay5vdXQgPSBbXVxuXG4gICAgaWYoIHRoaXMub25jYWxsYmFjayApIHRoaXMub25jYWxsYmFjayggdGhpcy5jYWxsYmFjayApXG5cbiAgICByZXR1cm4gdGhpcy5jYWxsYmFjayBcbiAgfSxcblxuICBwcm9jZXNzR3JhcGgoIG91dHB1dCApIHtcbiAgICB0aGlzLmNhbGxiYWNrVWdlbnMubGVuZ3RoID0gMFxuICAgIHRoaXMuY2FsbGJhY2tOYW1lcy5sZW5ndGggPSAwXG5cbiAgICB0aGlzLmNhbGxiYWNrVWdlbnMucHVzaCggb3V0cHV0LmNhbGxiYWNrIClcblxuICAgIGxldCBib2R5ID0gdGhpcy5wcm9jZXNzVWdlbiggb3V0cHV0IClcbiAgICBcblxuICAgIHRoaXMuZGlydHlVZ2Vucy5sZW5ndGggPSAwXG4gICAgdGhpcy5ncmFwaElzRGlydHkgPSBmYWxzZVxuXG4gICAgcmV0dXJuIGJvZHlcbiAgfSxcblxuICBwcm9jZXNzVWdlbiggdWdlbiwgYmxvY2sgKSB7XG4gICAgaWYoIGJsb2NrID09PSB1bmRlZmluZWQgKSBibG9jayA9IFtdXG5cbiAgICBsZXQgZGlydHlJZHggPSBHaWJiZXJpc2guZGlydHlVZ2Vucy5pbmRleE9mKCB1Z2VuIClcblxuICAgIC8vY29uc29sZS5sb2coICd1Z2VuTmFtZTonLCB1Z2VuLnVnZW5OYW1lIClcbiAgICBsZXQgbWVtbyA9IEdpYmJlcmlzaC5tZW1vZWRbIHVnZW4udWdlbk5hbWUgXVxuXG4gICAgaWYoIG1lbW8gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHJldHVybiBtZW1vXG4gICAgfSBlbHNlIGlmICh1Z2VuID09PSB0cnVlIHx8IHVnZW4gPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBcIldoeSBpcyB1Z2VuIGEgYm9vbGVhbj8gW3RydWVdIG9yIFtmYWxzZV1cIjtcbiAgICB9IGVsc2UgaWYoIHVnZW4uYmxvY2sgPT09IHVuZGVmaW5lZCB8fCBkaXJ0eUluZGV4ICE9PSAtMSApIHtcblxuICBcbiAgICAgIGxldCBsaW5lID0gYFxcdHZhciB2XyR7dWdlbi5pZH0gPSBgIFxuICAgICAgXG4gICAgICBpZiggIXVnZW4uYmlub3AgKSBsaW5lICs9IGAke3VnZW4udWdlbk5hbWV9KCBgXG5cbiAgICAgIC8vIG11c3QgZ2V0IGFycmF5IHNvIHdlIGNhbiBrZWVwIHRyYWNrIG9mIGxlbmd0aCBmb3IgY29tbWEgaW5zZXJ0aW9uXG4gICAgICBsZXQga2V5cyxlcnJcbiAgICAgIFxuICAgICAgLy90cnkge1xuICAgICAga2V5cyA9IHVnZW4uYmlub3AgfHwgdWdlbi50eXBlID09PSAnYnVzJyB8fCB1Z2VuLnR5cGUgPT09ICdhbmFseXNpcycgPyBPYmplY3Qua2V5cyggdWdlbi5pbnB1dHMgKSA6IE9iamVjdC5rZXlzKCB1Z2VuLmlucHV0TmFtZXMgKVxuXG4gICAgICAvL31jYXRjaCggZSApe1xuXG4gICAgICAvLyAgY29uc29sZS5sb2coIGUgKVxuICAgICAgLy8gIGVyciA9IHRydWVcbiAgICAgIC8vfVxuICAgICAgLy9jb25zb2xlLmxvZyggJ2tleXM6JywgdWdlbi5pbnB1dHMsIGtleXMubGVuZ3RoIClcblxuICAgICAgXG4gICAgICAvL2lmKCBlcnIgPT09IHRydWUgKSByZXR1cm5cblxuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBsZXQga2V5ID0ga2V5c1sgaSBdXG4gICAgICAgIC8vIGJpbm9wLmlucHV0cyBpcyBhY3R1YWwgdmFsdWVzLCBub3QganVzdCBwcm9wZXJ0eSBuYW1lc1xuICAgICAgICBsZXQgaW5wdXQgXG4gICAgICAgIGlmKCB1Z2VuLmJpbm9wIHx8IHVnZW4udHlwZSA9PT0nYnVzJyApIHtcbiAgICAgICAgICBpbnB1dCA9IHVnZW4uaW5wdXRzWyBrZXkgXVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAvL2lmKCBrZXkgPT09ICdtZW1vcnknICkgY29udGludWU7XG4gIFxuICAgICAgICAgIGlucHV0ID0gdWdlblsgdWdlbi5pbnB1dE5hbWVzWyBrZXkgXSBdXG4gICAgICAgIH1cblxuICAgICAgICBpZiggaW5wdXQgIT09IHVuZGVmaW5lZCApIHsgXG4gICAgICAgICAgaWYoIGlucHV0LmJ5cGFzcyA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCBpbnB1dHMgb2YgY2hhaW4gdW50aWwgb25lIGlzIGZvdW5kXG4gICAgICAgICAgICAvLyB0aGF0IGlzIG5vdCBiZWluZyBieXBhc3NlZFxuXG4gICAgICAgICAgICBsZXQgZm91bmQgPSBmYWxzZVxuXG4gICAgICAgICAgICB3aGlsZSggaW5wdXQuaW5wdXQgIT09ICd1bmRlZmluZWQnICYmIGZvdW5kID09PSBmYWxzZSApIHtcbiAgICAgICAgICAgICAgaWYoIHR5cGVvZiBpbnB1dC5pbnB1dC5ieXBhc3MgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICAgICAgICAgIGlucHV0ID0gaW5wdXQuaW5wdXRcbiAgICAgICAgICAgICAgICBpZiggaW5wdXQuYnlwYXNzID09PSBmYWxzZSApIGZvdW5kID0gdHJ1ZVxuICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IGlucHV0LmlucHV0XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiggdHlwZW9mIGlucHV0ID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgICAgbGluZSArPSBpbnB1dFxuICAgICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIGlucHV0ID09PSAnYm9vbGVhbicgKSB7XG4gICAgICAgICAgICAgIGxpbmUgKz0gJycgKyBpbnB1dFxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ2tleTonLCBrZXksICdpbnB1dDonLCB1Z2VuLmlucHV0cywgdWdlbi5pbnB1dHNbIGtleSBdICkgXG5cbiAgICAgICAgICAgIEdpYmJlcmlzaC5wcm9jZXNzVWdlbiggaW5wdXQsIGJsb2NrIClcblxuICAgICAgICAgICAgLy9pZiggaW5wdXQuY2FsbGJhY2sgPT09IHVuZGVmaW5lZCApIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlmKCAhaW5wdXQuYmlub3AgKSB7XG4gICAgICAgICAgICAgIC8vIGNoZWNrIGlzIG5lZWRlZCBzbyB0aGF0IGdyYXBocyB3aXRoIHNzZHMgdGhhdCByZWZlciB0byB0aGVtc2VsdmVzXG4gICAgICAgICAgICAgIC8vIGRvbid0IGFkZCB0aGUgc3NkIGluIG1vcmUgdGhhbiBvbmNlXG4gICAgICAgICAgICAgIGlmKCBHaWJiZXJpc2guY2FsbGJhY2tVZ2Vucy5pbmRleE9mKCBpbnB1dC5jYWxsYmFjayApID09PSAtMSApIHtcbiAgICAgICAgICAgICAgICBHaWJiZXJpc2guY2FsbGJhY2tVZ2Vucy5wdXNoKCBpbnB1dC5jYWxsYmFjayApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGluZSArPSBgdl8ke2lucHV0LmlkfWBcbiAgICAgICAgICAgIGlucHV0Ll9fdmFybmFtZSA9IGB2XyR7aW5wdXQuaWR9YFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKCBpIDwga2V5cy5sZW5ndGggLSAxICkge1xuICAgICAgICAgICAgbGluZSArPSB1Z2VuLmJpbm9wID8gJyAnICsgdWdlbi5vcCArICcgJyA6ICcsICcgXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vaWYoIHVnZW4udHlwZSA9PT0gJ2J1cycgKSBsaW5lICs9ICcsICcgXG4gICAgICBpZiggdWdlbi50eXBlID09PSAnYW5hbHlzaXMnIHx8ICh1Z2VuLnR5cGUgPT09ICdidXMnICYmIGtleXMubGVuZ3RoID4gMCkgKSBsaW5lICs9ICcsICdcbiAgICAgIGlmKCAhdWdlbi5iaW5vcCAmJiB1Z2VuLnR5cGUgIT09ICdzZXEnICkgbGluZSArPSAnbWVtb3J5J1xuICAgICAgbGluZSArPSB1Z2VuLmJpbm9wID8gJycgOiAnICknXG5cbiAgICAgIGJsb2NrLnB1c2goIGxpbmUgKVxuICAgICAgXG4gICAgICAvL2NvbnNvbGUubG9nKCAnbWVtbzonLCB1Z2VuLnVnZW5OYW1lIClcbiAgICAgIEdpYmJlcmlzaC5tZW1vZWRbIHVnZW4udWdlbk5hbWUgXSA9IGB2XyR7dWdlbi5pZH1gXG5cbiAgICAgIGlmKCBkaXJ0eUlkeCAhPT0gLTEgKSB7XG4gICAgICAgIEdpYmJlcmlzaC5kaXJ0eVVnZW5zLnNwbGljZSggZGlydHlJZHgsIDEgKVxuICAgICAgfVxuXG4gICAgfWVsc2UgaWYoIHVnZW4uYmxvY2sgKSB7XG4gICAgICByZXR1cm4gdWdlbi5ibG9ja1xuICAgIH1cblxuICAgIHJldHVybiBibG9ja1xuICB9LFxuICAgIFxufVxuXG5HaWJiZXJpc2gudXRpbGl0aWVzID0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApKCBHaWJiZXJpc2ggKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gR2liYmVyaXNoXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBDb25nYSA9IGFyZ3VtZW50UHJvcHMgPT4ge1xuICAgIGxldCBjb25nYSA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgZGVjYXkgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgIGdhaW4gID0gZy5pbiggJ2dhaW4nIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBDb25nYS5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBsZXQgdHJpZ2dlciA9IGcuYmFuZygpLFxuICAgICAgICBpbXB1bHNlID0gZy5tdWwoIHRyaWdnZXIsIDYwICksXG4gICAgICAgIF9kZWNheSA9ICBnLnN1YiggLjEwMSwgZy5kaXYoIGRlY2F5LCAxMCApICksIC8vIGNyZWF0ZSByYW5nZSBvZiAuMDAxIC0gLjA5OVxuICAgICAgICBicGYgPSBnLnN2ZiggaW1wdWxzZSwgZnJlcXVlbmN5LCBfZGVjYXksIDIsIGZhbHNlICksXG4gICAgICAgIG91dCA9IGcubXVsKCBicGYsIGdhaW4gKVxuICAgIFxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBjb25nYSwgb3V0LCAnY29uZ2EnLCBwcm9wcyAgKVxuICAgIFxuICAgIGNvbmdhLmVudiA9IHRyaWdnZXJcblxuICAgIHJldHVybiBjb25nYVxuICB9XG4gIFxuICBDb25nYS5kZWZhdWx0cyA9IHtcbiAgICBnYWluOiAuMjUsXG4gICAgZnJlcXVlbmN5OjE5MCxcbiAgICBkZWNheTogLjg1XG4gIH1cblxuICByZXR1cm4gQ29uZ2FcblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBDb3diZWxsID0gYXJndW1lbnRQcm9wcyA9PiB7XG4gICAgY29uc3QgY293YmVsbCA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgICBkZWNheSAgID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICAgIGdhaW4gICAgPSBnLmluKCAnZ2FpbicgKVxuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQ293YmVsbC5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBjb25zdCBicGZDdXRvZmYgPSBnLnBhcmFtKCAnYnBmYycsIDEwMDAgKSxcbiAgICAgICAgICBzMSA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgNTYwICksXG4gICAgICAgICAgczIgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIDg0NSApLFxuICAgICAgICAgIGVnID0gZy5kZWNheSggZy5tdWwoIGRlY2F5LCBnLmdlbi5zYW1wbGVyYXRlICogMiApICksIFxuICAgICAgICAgIGJwZiA9IGcuc3ZmKCBnLmFkZCggczEsczIgKSwgYnBmQ3V0b2ZmLCAzLCAyLCBmYWxzZSApLFxuICAgICAgICAgIGVudkJwZiA9IGcubXVsKCBicGYsIGVnICksXG4gICAgICAgICAgb3V0ID0gZy5tdWwoIGVudkJwZiwgZ2FpbiApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggY293YmVsbCwgb3V0LCAnY293YmVsbCcsIHByb3BzICApXG4gICAgXG4gICAgY293YmVsbC5lbnYgPSBlZyBcblxuICAgIGNvd2JlbGwuaXNTdGVyZW8gPSBmYWxzZVxuXG4gICAgcmV0dXJuIGNvd2JlbGxcbiAgfVxuICBcbiAgQ293YmVsbC5kZWZhdWx0cyA9IHtcbiAgICBnYWluOiAxLFxuICAgIGRlY2F5Oi41XG4gIH1cblxuICByZXR1cm4gQ293YmVsbFxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBGTSA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGxldCBzeW4gPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50IClcblxuICAgIGxldCBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICBnbGlkZSA9IGcuaW4oICdnbGlkZScgKSxcbiAgICAgICAgc2xpZGluZ0ZyZXEgPSBnLnNsaWRlKCBmcmVxdWVuY3ksIGdsaWRlLCBnbGlkZSApLFxuICAgICAgICBjbVJhdGlvID0gZy5pbiggJ2NtUmF0aW8nICksXG4gICAgICAgIGluZGV4ID0gZy5pbiggJ2luZGV4JyApLFxuICAgICAgICBmZWVkYmFjayA9IGcuaW4oICdmZWVkYmFjaycgKSxcbiAgICAgICAgYXR0YWNrID0gZy5pbiggJ2F0dGFjaycgKSwgZGVjYXkgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgIHN1c3RhaW4gPSBnLmluKCAnc3VzdGFpbicgKSwgc3VzdGFpbkxldmVsID0gZy5pbiggJ3N1c3RhaW5MZXZlbCcgKSxcbiAgICAgICAgcmVsZWFzZSA9IGcuaW4oICdyZWxlYXNlJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCBzeW4sIEZNLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBlbnYgPSBHaWJiZXJpc2guZW52ZWxvcGVzLmZhY3RvcnkoIFxuICAgICAgICBwcm9wcy51c2VBRFNSLCBcbiAgICAgICAgcHJvcHMuc2hhcGUsIFxuICAgICAgICBhdHRhY2ssIGRlY2F5LCBcbiAgICAgICAgc3VzdGFpbiwgc3VzdGFpbkxldmVsLCBcbiAgICAgICAgcmVsZWFzZSwgXG4gICAgICAgIHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgICApXG5cbiAgICAgIGNvbnN0IGZlZWRiYWNrc3NkID0gZy5oaXN0b3J5KCAwIClcblxuICAgICAgY29uc3QgbW9kT3NjID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoIFxuICAgICAgICAgICAgICBzeW4ubW9kdWxhdG9yV2F2ZWZvcm0sIFxuICAgICAgICAgICAgICBnLmFkZCggZy5tdWwoIHNsaWRpbmdGcmVxLCBjbVJhdGlvICksIGcubXVsKCBmZWVkYmFja3NzZC5vdXQsIGZlZWRiYWNrLCBpbmRleCApICksIFxuICAgICAgICAgICAgICBzeW4uYW50aWFsaWFzIFxuICAgICAgICAgICAgKVxuXG4gICAgICBjb25zdCBtb2RPc2NXaXRoSW5kZXggPSBnLm11bCggbW9kT3NjLCBnLm11bCggc2xpZGluZ0ZyZXEsIGluZGV4ICkgKVxuICAgICAgY29uc3QgbW9kT3NjV2l0aEVudiAgID0gZy5tdWwoIG1vZE9zY1dpdGhJbmRleCwgZW52IClcbiAgICAgIFxuICAgICAgY29uc3QgbW9kT3NjV2l0aEVudkF2ZyA9IGcubXVsKCAuNSwgZy5hZGQoIG1vZE9zY1dpdGhFbnYsIGZlZWRiYWNrc3NkLm91dCApIClcblxuICAgICAgZmVlZGJhY2tzc2QuaW4oIG1vZE9zY1dpdGhFbnZBdmcgKVxuXG4gICAgICBjb25zdCBjYXJyaWVyT3NjID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoIHN5bi5jYXJyaWVyV2F2ZWZvcm0sIGcuYWRkKCBzbGlkaW5nRnJlcSwgbW9kT3NjV2l0aEVudkF2ZyApLCBzeW4uYW50aWFsaWFzIClcbiAgICAgIGNvbnN0IGNhcnJpZXJPc2NXaXRoRW52ID0gZy5tdWwoIGNhcnJpZXJPc2MsIGVudiApXG5cbiAgICAgIGNvbnN0IGJhc2VDdXRvZmZGcmVxID0gZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBmcmVxdWVuY3kgKVxuICAgICAgY29uc3QgY3V0b2ZmID0gZy5tdWwoIGcubXVsKCBiYXNlQ3V0b2ZmRnJlcSwgZy5wb3coIDIsIGcuaW4oJ2ZpbHRlck11bHQnKSApKSwgZW52IClcbiAgICAgIC8vY29uc3QgY3V0b2ZmID0gZy5hZGQoIGcuaW4oJ2N1dG9mZicpLCBnLm11bCggZy5pbignZmlsdGVyTXVsdCcpLCBlbnYgKSApXG4gICAgICBjb25zdCBmaWx0ZXJlZE9zYyA9IEdpYmJlcmlzaC5maWx0ZXJzLmZhY3RvcnkoIGNhcnJpZXJPc2NXaXRoRW52LCBjdXRvZmYsIGcuaW4oJ1EnKSwgZy5pbignc2F0dXJhdGlvbicpLCBzeW4gKVxuXG4gICAgICBjb25zdCBzeW50aFdpdGhHYWluID0gZy5tdWwoIGZpbHRlcmVkT3NjLCBnLmluKCAnZ2FpbicgKSApXG4gICAgICBcbiAgICAgIGxldCBwYW5uZXJcbiAgICAgIGlmKCBwcm9wcy5wYW5Wb2ljZXMgPT09IHRydWUgKSB7IFxuICAgICAgICBwYW5uZXIgPSBnLnBhbiggc3ludGhXaXRoR2Fpbiwgc3ludGhXaXRoR2FpbiwgZy5pbiggJ3BhbicgKSApIFxuICAgICAgICBzeW4uZ3JhcGggPSBbcGFubmVyLmxlZnQsIHBhbm5lci5yaWdodCBdXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc3luLmdyYXBoID0gc3ludGhXaXRoR2FpblxuICAgICAgfVxuXG4gICAgICBzeW4uZW52ID0gZW52XG4gICAgfVxuICAgIFxuICAgIHN5bi5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiA9IFsgJ2NhcnJpZXJXYXZlZm9ybScsICdtb2R1bGF0b3JXYXZlZm9ybScsICdhbnRpYWxpYXMnLCAnZmlsdGVyVHlwZScsICdmaWx0ZXJNb2RlJyBdXG4gICAgc3luLl9fY3JlYXRlR3JhcGgoKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgc3luLmdyYXBoICwgJ2ZtJywgc3luIClcblxuICAgIHJldHVybiBzeW5cbiAgfVxuXG4gIEZNLmRlZmF1bHRzID0ge1xuICAgIGNhcnJpZXJXYXZlZm9ybTonc2luZScsXG4gICAgbW9kdWxhdG9yV2F2ZWZvcm06J3NpbmUnLFxuICAgIGF0dGFjazogNDQsXG4gICAgZmVlZGJhY2s6IDAsXG4gICAgZGVjYXk6IDIyMDUwLFxuICAgIHN1c3RhaW46NDQxMDAsXG4gICAgc3VzdGFpbkxldmVsOi42LFxuICAgIHJlbGVhc2U6MjIwNTAsXG4gICAgdXNlQURTUjpmYWxzZSxcbiAgICBzaGFwZTonbGluZWFyJyxcbiAgICB0cmlnZ2VyUmVsZWFzZTpmYWxzZSxcbiAgICBnYWluOiAxLFxuICAgIGNtUmF0aW86MixcbiAgICBpbmRleDo1LFxuICAgIHB1bHNld2lkdGg6LjI1LFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBhbnRpYWxpYXM6ZmFsc2UsXG4gICAgcGFuVm9pY2VzOmZhbHNlLFxuICAgIGdsaWRlOjEsXG4gICAgc2F0dXJhdGlvbjoxLFxuICAgIGZpbHRlck11bHQ6MS41LFxuICAgIFE6LjI1LFxuICAgIGN1dG9mZjouMzUsXG4gICAgZmlsdGVyVHlwZTowLFxuICAgIGZpbHRlck1vZGU6MCxcbiAgICBpc0xvd1Bhc3M6MVxuICB9XG5cbiAgbGV0IFBvbHlGTSA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIEZNLCBbJ2dsaWRlJywnZnJlcXVlbmN5JywnYXR0YWNrJywnZGVjYXknLCdwdWxzZXdpZHRoJywncGFuJywnZ2FpbicsJ2NtUmF0aW8nLCdpbmRleCcsICdzYXR1cmF0aW9uJywgJ2ZpbHRlck11bHQnLCAnUScsICdjdXRvZmYnLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnY2FycmllcldhdmVmb3JtJywgJ21vZHVsYXRvcldhdmVmb3JtJywnZmlsdGVyTW9kZScsICdmZWVkYmFjaycsICd1c2VBRFNSJywgJ3N1c3RhaW4nLCAncmVsZWFzZScsICdzdXN0YWluTGV2ZWwnIF0gKSBcblxuICByZXR1cm4gWyBGTSwgUG9seUZNIF1cblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgSGF0ID0gYXJndW1lbnRQcm9wcyA9PiB7XG4gICAgbGV0IGhhdCA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgdHVuZSAgPSBnLmluKCAndHVuZScgKSxcbiAgICAgICAgc2NhbGVkVHVuZSA9IGcubWVtbyggZy5hZGQoIC40LCB0dW5lICkgKSxcbiAgICAgICAgZGVjYXkgID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgSGF0LmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGxldCBiYXNlRnJlcSA9IGcubXVsKCAzMjUsIHNjYWxlZFR1bmUgKSwgLy8gcmFuZ2Ugb2YgMTYyLjUgLSA0ODcuNVxuICAgICAgICBicGZDdXRvZmYgPSBnLm11bCggZy5wYXJhbSggJ2JwZmMnLCA3MDAwICksIHNjYWxlZFR1bmUgKSxcbiAgICAgICAgaHBmQ3V0b2ZmID0gZy5tdWwoIGcucGFyYW0oICdocGZjJywgMTEwMDAgKSwgc2NhbGVkVHVuZSApLCAgXG4gICAgICAgIHMxID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBiYXNlRnJlcSwgZmFsc2UgKSxcbiAgICAgICAgczIgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGcubXVsKCBiYXNlRnJlcSwxLjQ0NzEgKSApLFxuICAgICAgICBzMyA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5tdWwoIGJhc2VGcmVxLDEuNjE3MCApICksXG4gICAgICAgIHM0ID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBnLm11bCggYmFzZUZyZXEsMS45MjY1ICkgKSxcbiAgICAgICAgczUgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGcubXVsKCBiYXNlRnJlcSwyLjUwMjggKSApLFxuICAgICAgICBzNiA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5tdWwoIGJhc2VGcmVxLDIuNjYzNyApICksXG4gICAgICAgIHN1bSA9IGcuYWRkKCBzMSxzMixzMyxzNCxzNSxzNiApLFxuICAgICAgICBlZyA9IGcuZGVjYXkoIGcubXVsKCBkZWNheSwgZy5nZW4uc2FtcGxlcmF0ZSAqIDIgKSApLCBcbiAgICAgICAgYnBmID0gZy5zdmYoIHN1bSwgYnBmQ3V0b2ZmLCAuNSwgMiwgZmFsc2UgKSxcbiAgICAgICAgZW52QnBmID0gZy5tdWwoIGJwZiwgZWcgKSxcbiAgICAgICAgaHBmID0gZy5maWx0ZXIyNCggZW52QnBmLCAwLCBocGZDdXRvZmYsIDAgKSxcbiAgICAgICAgb3V0ID0gZy5tdWwoIGhwZiwgZ2FpbiApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggaGF0LCBvdXQsICdoYXQnLCBwcm9wcyAgKVxuICAgIFxuICAgIGhhdC5lbnYgPSBlZyBcblxuICAgIGhhdC5pc1N0ZXJlbyA9IGZhbHNlXG4gICAgcmV0dXJuIGhhdFxuICB9XG4gIFxuICBIYXQuZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogIDEsXG4gICAgdHVuZTogLjYsXG4gICAgZGVjYXk6LjEsXG4gIH1cblxuICByZXR1cm4gSGF0XG5cbn1cbiIsImxldCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICksXG4gICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubGV0IGluc3RydW1lbnQgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuT2JqZWN0LmFzc2lnbiggaW5zdHJ1bWVudCwge1xuICBub3RlKCBmcmVxICkge1xuICAgIHRoaXMuZnJlcXVlbmN5ID0gZnJlcVxuICAgIHRoaXMuZW52LnRyaWdnZXIoKVxuICB9LFxuXG4gIHRyaWdnZXIoIF9nYWluID0gMSApIHtcbiAgICB0aGlzLmdhaW4gPSBfZ2FpblxuICAgIHRoaXMuZW52LnRyaWdnZXIoKVxuICB9LFxuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc3RydW1lbnRcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuY29uc3QgaW5zdHJ1bWVudHMgPSB7XG4gIEtpY2sgICAgICAgIDogcmVxdWlyZSggJy4va2ljay5qcycgKSggR2liYmVyaXNoICksXG4gIENvbmdhICAgICAgIDogcmVxdWlyZSggJy4vY29uZ2EuanMnICkoIEdpYmJlcmlzaCApLFxuICBDbGF2ZSAgICAgICA6IHJlcXVpcmUoICcuL2NvbmdhLmpzJyApKCBHaWJiZXJpc2ggKSwgLy8gY2xhdmUgaXMgc2FtZSBhcyBjb25nYSB3aXRoIGRpZmZlcmVudCBkZWZhdWx0cywgc2VlIGJlbG93XG4gIEhhdCAgICAgICAgIDogcmVxdWlyZSggJy4vaGF0LmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgU25hcmUgICAgICAgOiByZXF1aXJlKCAnLi9zbmFyZS5qcycgKSggR2liYmVyaXNoICksXG4gIENvd2JlbGwgICAgIDogcmVxdWlyZSggJy4vY293YmVsbC5qcycgKSggR2liYmVyaXNoIClcbn1cblxuaW5zdHJ1bWVudHMuQ2xhdmUuZGVmYXVsdHMuZnJlcXVlbmN5ID0gMjUwMFxuaW5zdHJ1bWVudHMuQ2xhdmUuZGVmYXVsdHMuZGVjYXkgPSAuNTtcblxuWyBpbnN0cnVtZW50cy5TeW50aCwgaW5zdHJ1bWVudHMuUG9seVN5bnRoIF0gICAgID0gcmVxdWlyZSggJy4vc3ludGguanMnICkoIEdpYmJlcmlzaCApO1xuWyBpbnN0cnVtZW50cy5Nb25vc3ludGgsIGluc3RydW1lbnRzLlBvbHlNb25vIF0gID0gcmVxdWlyZSggJy4vbW9ub3N5bnRoLmpzJyApKCBHaWJiZXJpc2ggKTtcblsgaW5zdHJ1bWVudHMuRk0sIGluc3RydW1lbnRzLlBvbHlGTSBdICAgICAgICAgICA9IHJlcXVpcmUoICcuL2ZtLmpzJyApKCBHaWJiZXJpc2ggKTtcblsgaW5zdHJ1bWVudHMuU2FtcGxlciwgaW5zdHJ1bWVudHMuUG9seVNhbXBsZXIgXSA9IHJlcXVpcmUoICcuL3NhbXBsZXIuanMnICkoIEdpYmJlcmlzaCApO1xuWyBpbnN0cnVtZW50cy5LYXJwbHVzLCBpbnN0cnVtZW50cy5Qb2x5S2FycGx1cyBdID0gcmVxdWlyZSggJy4va2FycGx1c3N0cm9uZy5qcycgKSggR2liYmVyaXNoICk7XG5cbmluc3RydW1lbnRzLmV4cG9ydCA9IHRhcmdldCA9PiB7XG4gIGZvciggbGV0IGtleSBpbiBpbnN0cnVtZW50cyApIHtcbiAgICBpZigga2V5ICE9PSAnZXhwb3J0JyApIHtcbiAgICAgIHRhcmdldFsga2V5IF0gPSBpbnN0cnVtZW50c1sga2V5IF1cbiAgICB9XG4gIH1cbn1cblxucmV0dXJuIGluc3RydW1lbnRzXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IEtQUyA9IGlucHV0UHJvcHMgPT4ge1xuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgS1BTLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBjb25zdCBzeW4gPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgICAgdHJpZ2dlciA9IGcuYmFuZygpLFxuICAgICAgICAgIHBoYXNlID0gZy5hY2N1bSggMSwgdHJpZ2dlciwgeyBtYXg6SW5maW5pdHkgfSApLFxuICAgICAgICAgIGVudiA9IGcuZ3RwKCBnLnN1YiggMSwgZy5kaXYoIHBoYXNlLCAyMDAgKSApLCAwICksXG4gICAgICAgICAgaW1wdWxzZSA9IGcubXVsKCBnLm5vaXNlKCksIGVudiApLFxuICAgICAgICAgIGZlZWRiYWNrID0gZy5oaXN0b3J5KCksXG4gICAgICAgICAgZnJlcXVlbmN5ID0gZy5pbignZnJlcXVlbmN5JyksXG4gICAgICAgICAgZ2xpZGUgPSBnLmluKCAnZ2xpZGUnICksXG4gICAgICAgICAgc2xpZGluZ0ZyZXF1ZW5jeSA9IGcuc2xpZGUoIGZyZXF1ZW5jeSwgZ2xpZGUsIGdsaWRlICksXG4gICAgICAgICAgZGVsYXkgPSBnLmRlbGF5KCBnLmFkZCggaW1wdWxzZSwgZmVlZGJhY2sub3V0ICksIGcuZGl2KCBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGUsIHNsaWRpbmdGcmVxdWVuY3kgKSwgeyBzaXplOjIwNDggfSksXG4gICAgICAgICAgZGVjYXllZCA9IGcubXVsKCBkZWxheSwgZy50NjAoIGcubXVsKCBnLmluKCdkZWNheScpLCBzbGlkaW5nRnJlcXVlbmN5ICkgKSApLFxuICAgICAgICAgIGRhbXBlZCA9ICBnLm1peCggZGVjYXllZCwgZmVlZGJhY2sub3V0LCBnLmluKCdkYW1waW5nJykgKSxcbiAgICAgICAgICB3aXRoR2FpbiA9IGcubXVsKCBkYW1wZWQsIGcuaW4oJ2dhaW4nKSApXG5cbiAgICBmZWVkYmFjay5pbiggZGFtcGVkIClcblxuICAgIGNvbnN0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgS1BTLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBpZiggcHJvcGVydGllcy5wYW5Wb2ljZXMgKSB7ICBcbiAgICAgIGNvbnN0IHBhbm5lciA9IGcucGFuKCB3aXRoR2Fpbiwgd2l0aEdhaW4sIGcuaW4oICdwYW4nICkgKVxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdLCAna2FycGx1cycsIHByb3BzICApXG4gICAgfWVsc2V7XG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggc3luLCB3aXRoR2FpbiwgJ2thcnBsdXMnLCBwcm9wcyApXG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbiggc3luLCB7XG4gICAgICBwcm9wZXJ0aWVzIDogcHJvcHMsXG5cbiAgICAgIGVudiA6IHRyaWdnZXIsXG4gICAgICBwaGFzZSxcblxuICAgICAgZ2V0UGhhc2UoKSB7XG4gICAgICAgIHJldHVybiBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIHBoYXNlLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfSxcbiAgICB9KVxuICAgIHJldHVybiBzeW5cbiAgfVxuICBcbiAgS1BTLmRlZmF1bHRzID0ge1xuICAgIGRlY2F5OiAuOTcsXG4gICAgZGFtcGluZzouMixcbiAgICBnYWluOiAxLFxuICAgIGZyZXF1ZW5jeToyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBnbGlkZToxLFxuICAgIHBhblZvaWNlczpmYWxzZVxuICB9XG5cbiAgbGV0IGVudkNoZWNrRmFjdG9yeSA9ICggc3luLHN5bnRoICkgPT4ge1xuICAgIGxldCBlbnZDaGVjayA9ICgpPT4ge1xuICAgICAgbGV0IHBoYXNlID0gc3luLmdldFBoYXNlKCksXG4gICAgICAgICAgZW5kVGltZSA9IHN5bnRoLmRlY2F5ICogR2liYmVyaXNoLmN0eC5zYW1wbGVSYXRlXG5cbiAgICAgIGlmKCBwaGFzZSA+IGVuZFRpbWUgKSB7XG4gICAgICAgIHN5bnRoLmRpc2Nvbm5lY3RVZ2VuKCBzeW4gKVxuICAgICAgICBzeW4uaXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgICAgICBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIHN5bi5waGFzZS5tZW1vcnkudmFsdWUuaWR4IF0gPSAwIC8vIHRyaWdnZXIgZG9lc24ndCBzZWVtIHRvIHJlc2V0IGZvciBzb21lIHJlYXNvblxuICAgICAgfWVsc2V7XG4gICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5wdXNoKCBlbnZDaGVjayApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlbnZDaGVja1xuICB9XG5cbiAgbGV0IFBvbHlLUFMgPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBLUFMsIFsnZnJlcXVlbmN5JywnZGVjYXknLCdkYW1waW5nJywncGFuJywnZ2FpbicsICdnbGlkZSddLCBlbnZDaGVja0ZhY3RvcnkgKSBcblxuICByZXR1cm4gWyBLUFMsIFBvbHlLUFMgXVxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBLaWNrID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgLy8gZXN0YWJsaXNoIHByb3RvdHlwZSBjaGFpblxuICAgIGxldCBraWNrID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApXG5cbiAgICAvLyBkZWZpbmUgaW5wdXRzXG4gICAgbGV0IGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgIGRlY2F5ID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICB0b25lICA9IGcuaW4oICd0b25lJyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG4gICAgXG4gICAgLy8gY3JlYXRlIGluaXRpYWwgcHJvcGVydHkgc2V0XG4gICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIEtpY2suZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuXG4gICAgLy8gY3JlYXRlIERTUCBncmFwaFxuICAgIGxldCB0cmlnZ2VyID0gZy5iYW5nKCksXG4gICAgICAgIGltcHVsc2UgPSBnLm11bCggdHJpZ2dlciwgNjAgKSxcbiAgICAgICAgc2NhbGVkRGVjYXkgPSBnLnN1YiggMS4wMDUsIGRlY2F5ICksIC8vIC0+IHJhbmdlIHsgLjAwNSwgMS4wMDUgfVxuICAgICAgICBzY2FsZWRUb25lID0gZy5hZGQoIDUwLCBnLm11bCggdG9uZSwgNDAwMCApICksIC8vIC0+IHJhbmdlIHsgNTAsIDQwNTAgfVxuICAgICAgICBicGYgPSBnLnN2ZiggaW1wdWxzZSwgZnJlcXVlbmN5LCBzY2FsZWREZWNheSwgMiwgZmFsc2UgKSxcbiAgICAgICAgbHBmID0gZy5zdmYoIGJwZiwgc2NhbGVkVG9uZSwgLjUsIDAsIGZhbHNlICksXG4gICAgICAgIGdyYXBoID0gZy5tdWwoIGxwZiwgZ2FpbiApXG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIGtpY2ssIGdyYXBoLCAna2ljaycsIHByb3BzICApXG5cbiAgICBraWNrLmVudiA9IHRyaWdnZXJcblxuICAgIHJldHVybiBraWNrXG4gIH1cbiAgXG4gIEtpY2suZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogMSxcbiAgICBmcmVxdWVuY3k6ODUsXG4gICAgdG9uZTogLjI1LFxuICAgIGRlY2F5Oi45XG4gIH1cblxuICByZXR1cm4gS2lja1xuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApLFxuICAgICAgZmVlZGJhY2tPc2MgPSByZXF1aXJlKCAnLi4vb3NjaWxsYXRvcnMvZm1mZWVkYmFja29zYy5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgU3ludGggPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBjb25zdCBzeW4gPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgICAgb3NjcyA9IFtdLCBcbiAgICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICAgIGdsaWRlID0gZy5pbiggJ2dsaWRlJyApLFxuICAgICAgICAgIHNsaWRpbmdGcmVxID0gZy5tZW1vKCBnLnNsaWRlKCBmcmVxdWVuY3ksIGdsaWRlLCBnbGlkZSApICksXG4gICAgICAgICAgYXR0YWNrID0gZy5pbiggJ2F0dGFjaycgKSwgZGVjYXkgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgICAgc3VzdGFpbiA9IGcuaW4oICdzdXN0YWluJyApLCBzdXN0YWluTGV2ZWwgPSBnLmluKCAnc3VzdGFpbkxldmVsJyApLFxuICAgICAgICAgIHJlbGVhc2UgPSBnLmluKCAncmVsZWFzZScgKVxuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCBzeW4sIFN5bnRoLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBlbnYgPSBHaWJiZXJpc2guZW52ZWxvcGVzLmZhY3RvcnkoIFxuICAgICAgICBwcm9wcy51c2VBRFNSLCBcbiAgICAgICAgcHJvcHMuc2hhcGUsIFxuICAgICAgICBhdHRhY2ssIGRlY2F5LCBcbiAgICAgICAgc3VzdGFpbiwgc3VzdGFpbkxldmVsLCBcbiAgICAgICAgcmVsZWFzZSwgXG4gICAgICAgIHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgICApXG5cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgMzsgaSsrICkge1xuICAgICAgICBsZXQgb3NjLCBmcmVxXG5cbiAgICAgICAgc3dpdGNoKCBpICkge1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGZyZXEgPSBnLmFkZCggc2xpZGluZ0ZyZXEsIGcubXVsKCBzbGlkaW5nRnJlcSwgZy5pbignZGV0dW5lMicpICkgKVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgZnJlcSA9IGcuYWRkKCBzbGlkaW5nRnJlcSwgZy5tdWwoIHNsaWRpbmdGcmVxLCBnLmluKCdkZXR1bmUzJykgKSApXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgZnJlcSA9IHNsaWRpbmdGcmVxXG4gICAgICAgIH1cblxuICAgICAgICBvc2MgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggc3luLndhdmVmb3JtLCBmcmVxLCBzeW4uYW50aWFsaWFzIClcbiAgICAgICAgXG4gICAgICAgIG9zY3NbIGkgXSA9IG9zY1xuICAgICAgfVxuXG4gICAgICBjb25zdCBvc2NTdW0gPSBnLmFkZCggLi4ub3NjcyApLFxuICAgICAgICAgICAgb3NjV2l0aEdhaW4gPSBnLm11bCggZy5tdWwoIG9zY1N1bSwgZW52ICksIGcuaW4oICdnYWluJyApICksXG4gICAgICAgICAgICBiYXNlQ3V0b2ZmRnJlcSA9IGcubXVsKCBnLmluKCdjdXRvZmYnKSwgZnJlcXVlbmN5ICksXG4gICAgICAgICAgICBjdXRvZmYgPSBnLm11bCggZy5tdWwoIGJhc2VDdXRvZmZGcmVxLCBnLnBvdyggMiwgZy5pbignZmlsdGVyTXVsdCcpICkpLCBlbnYgKSxcbiAgICAgICAgICAgIGZpbHRlcmVkT3NjID0gR2liYmVyaXNoLmZpbHRlcnMuZmFjdG9yeSggb3NjV2l0aEdhaW4sIGN1dG9mZiwgZy5pbignUScpLCBnLmluKCdzYXR1cmF0aW9uJyksIHN5biApXG4gICAgICAgIFxuICAgICAgaWYoIHByb3BzLnBhblZvaWNlcyApIHsgIFxuICAgICAgICBjb25zdCBwYW5uZXIgPSBnLnBhbiggZmlsdGVyZWRPc2MsZmlsdGVyZWRPc2MsIGcuaW4oICdwYW4nICkgKVxuICAgICAgICBzeW4uZ3JhcGggPSBbIHBhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHQgXVxuICAgICAgfWVsc2V7XG4gICAgICAgIHN5bi5ncmFwaCA9IGZpbHRlcmVkT3NjXG4gICAgICB9XG5cbiAgICAgIHN5bi5lbnYgPSBlbnZcbiAgICB9XG5cbiAgICBzeW4uX19yZXF1aXJlc1JlY29tcGlsYXRpb24gPSBbICd3YXZlZm9ybScsICdhbnRpYWxpYXMnLCAnZmlsdGVyVHlwZScsICdmaWx0ZXJNb2RlJyBdXG4gICAgc3luLl9fY3JlYXRlR3JhcGgoKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgc3luLmdyYXBoLCAnbW9ubycsIHByb3BzIClcblxuXG4gICAgcmV0dXJuIHN5blxuICB9XG4gIFxuICBTeW50aC5kZWZhdWx0cyA9IHtcbiAgICB3YXZlZm9ybTogJ3NhdycsXG4gICAgYXR0YWNrOiA0NCxcbiAgICBkZWNheTogMjIwNTAsXG4gICAgc3VzdGFpbjo0NDEwMCxcbiAgICBzdXN0YWluTGV2ZWw6LjYsXG4gICAgcmVsZWFzZToyMjA1MCxcbiAgICB1c2VBRFNSOmZhbHNlLFxuICAgIHNoYXBlOidsaW5lYXInLFxuICAgIHRyaWdnZXJSZWxlYXNlOmZhbHNlLFxuICAgIGdhaW46IC4yNSxcbiAgICBwdWxzZXdpZHRoOi4yNSxcbiAgICBmcmVxdWVuY3k6MjIwLFxuICAgIHBhbjogLjUsXG4gICAgZGV0dW5lMjouMDA1LFxuICAgIGRldHVuZTM6LS4wMDUsXG4gICAgY3V0b2ZmOiAxLFxuICAgIHJlc29uYW5jZTouMjUsXG4gICAgUTogLjUsXG4gICAgcGFuVm9pY2VzOmZhbHNlLFxuICAgIGdsaWRlOiAxLFxuICAgIGFudGlhbGlhczpmYWxzZSxcbiAgICBmaWx0ZXJUeXBlOiAyLFxuICAgIGZpbHRlck1vZGU6IDAsIC8vIDAgPSBMUCwgMSA9IEhQLCAyID0gQlAsIDMgPSBOb3RjaFxuICAgIHNhdHVyYXRpb246LjUsXG4gICAgZmlsdGVyTXVsdDogNCxcbiAgICBpc0xvd1Bhc3M6dHJ1ZVxuICB9XG5cbiAgbGV0IFBvbHlNb25vID0gR2liYmVyaXNoLlBvbHlUZW1wbGF0ZSggU3ludGgsIFxuICAgIFsnZnJlcXVlbmN5JywnYXR0YWNrJywnZGVjYXknLCdjdXRvZmYnLCdRJyxcbiAgICAgJ2RldHVuZTInLCdkZXR1bmUzJywncHVsc2V3aWR0aCcsJ3BhbicsJ2dhaW4nLCAnZ2xpZGUnLCAnc2F0dXJhdGlvbicsICdmaWx0ZXJNdWx0JywgICdhbnRpYWxpYXMnLCAnZmlsdGVyVHlwZScsICd3YXZlZm9ybScsICdmaWx0ZXJNb2RlJ11cbiAgKSBcblxuICByZXR1cm4gWyBTeW50aCwgUG9seU1vbm8gXVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5vdGUoIGZyZXEsIGdhaW4gKSB7XG4gICAgbGV0IHZvaWNlID0gdGhpcy5fX2dldFZvaWNlX18oKVxuICAgIE9iamVjdC5hc3NpZ24oIHZvaWNlLCB0aGlzLnByb3BlcnRpZXMgKVxuICAgIGlmKCBnYWluID09PSB1bmRlZmluZWQgKSBnYWluID0gdGhpcy5nYWluXG4gICAgdm9pY2UuZ2FpbiA9IGdhaW5cbiAgICB2b2ljZS5ub3RlKCBmcmVxIClcbiAgICB0aGlzLl9fcnVuVm9pY2VfXyggdm9pY2UsIHRoaXMgKVxuICAgIHRoaXMudHJpZ2dlck5vdGUgPSBmcmVxXG4gIH0sXG5cbiAgLy8gWFhYIHRoaXMgaXMgbm90IHBhcnRpY3VsYXJseSBzYXRpc2Z5aW5nLi4uXG4gIC8vIG11c3QgY2hlY2sgZm9yIGJvdGggbm90ZXMgYW5kIGNob3Jkc1xuICB0cmlnZ2VyKCBnYWluICkge1xuICAgIGlmKCB0aGlzLnRyaWdnZXJDaG9yZCAhPT0gbnVsbCApIHtcbiAgICAgIHRoaXMudHJpZ2dlckNob3JkLmZvckVhY2goIHYgPT4ge1xuICAgICAgICBsZXQgdm9pY2UgPSB0aGlzLl9fZ2V0Vm9pY2VfXygpXG4gICAgICAgIE9iamVjdC5hc3NpZ24oIHZvaWNlLCB0aGlzLnByb3BlcnRpZXMgKVxuICAgICAgICB2b2ljZS5ub3RlKCB2IClcbiAgICAgICAgdm9pY2UuZ2FpbiA9IGdhaW5cbiAgICAgICAgdGhpcy5fX3J1blZvaWNlX18oIHZvaWNlLCB0aGlzIClcbiAgICAgIH0pXG4gICAgfWVsc2UgaWYoIHRoaXMudHJpZ2dlck5vdGUgIT09IG51bGwgKSB7XG4gICAgICBsZXQgdm9pY2UgPSB0aGlzLl9fZ2V0Vm9pY2VfXygpXG4gICAgICBPYmplY3QuYXNzaWduKCB2b2ljZSwgdGhpcy5wcm9wZXJ0aWVzIClcbiAgICAgIHZvaWNlLm5vdGUoIHRoaXMudHJpZ2dlck5vdGUgKVxuICAgICAgdm9pY2UuZ2FpbiA9IGdhaW5cbiAgICAgIHRoaXMuX19ydW5Wb2ljZV9fKCB2b2ljZSwgdGhpcyApXG4gICAgfWVsc2V7XG4gICAgICBsZXQgdm9pY2UgPSB0aGlzLl9fZ2V0Vm9pY2VfXygpXG4gICAgICBPYmplY3QuYXNzaWduKCB2b2ljZSwgdGhpcy5wcm9wZXJ0aWVzIClcbiAgICAgIHZvaWNlLnRyaWdnZXIoIGdhaW4gKVxuICAgICAgdGhpcy5fX3J1blZvaWNlX18oIHZvaWNlLCB0aGlzIClcbiAgICB9XG4gIH0sXG5cbiAgX19ydW5Wb2ljZV9fKCB2b2ljZSwgX3BvbHkgKSB7XG4gICAgaWYoICF2b2ljZS5pc0Nvbm5lY3RlZCApIHtcbiAgICAgIHZvaWNlLmNvbm5lY3QoIF9wb2x5LCAxIClcbiAgICAgIHZvaWNlLmlzQ29ubmVjdGVkID0gdHJ1ZVxuICAgIH1cblxuICAgIGxldCBlbnZDaGVja1xuICAgIGlmKCBfcG9seS5lbnZDaGVjayA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgZW52Q2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYoIHZvaWNlLmVudi5pc0NvbXBsZXRlKCkgKSB7XG4gICAgICAgICAgX3BvbHkuZGlzY29ubmVjdFVnZW4uY2FsbCggX3BvbHksIHZvaWNlIClcbiAgICAgICAgICB2b2ljZS5pc0Nvbm5lY3RlZCA9IGZhbHNlXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5wdXNoKCBlbnZDaGVjayApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGVudkNoZWNrID0gX3BvbHkuZW52Q2hlY2soIHZvaWNlLCBfcG9seSApXG4gICAgfVxuXG4gICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLnB1c2goIGVudkNoZWNrIClcbiAgfSxcblxuICBfX2dldFZvaWNlX18oKSB7XG4gICAgcmV0dXJuIHRoaXMudm9pY2VzWyB0aGlzLnZvaWNlQ291bnQrKyAlIHRoaXMudm9pY2VzLmxlbmd0aCBdXG4gIH0sXG5cbiAgY2hvcmQoIGZyZXF1ZW5jaWVzICkge1xuICAgIGZyZXF1ZW5jaWVzLmZvckVhY2goIHYgPT4gdGhpcy5ub3RlKCB2ICkgKVxuICAgIHRoaXMudHJpZ2dlckNob3JkID0gZnJlcXVlbmNpZXNcbiAgfSxcblxuICBmcmVlKCkge1xuICAgIGZvciggbGV0IGNoaWxkIG9mIHRoaXMudm9pY2VzICkgY2hpbGQuZnJlZSgpXG4gIH1cbn1cbiIsIi8qXG4gKiBUaGlzIGZpbGVzIGNyZWF0ZXMgYSBmYWN0b3J5IGdlbmVyYXRpbmcgcG9seXN5bnRoIGNvbnN0cnVjdG9ycy5cbiAqL1xuXG5jb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgVGVtcGxhdGVGYWN0b3J5ID0gKCB1Z2VuLCBwcm9wZXJ0eUxpc3QsIF9lbnZDaGVjayApID0+IHtcbiAgICAvKiBcbiAgICAgKiBwb2x5c3ludGhzIGFyZSBiYXNpY2FsbHkgYnVzc2VzIHRoYXQgY29ubmVjdCBjaGlsZCBzeW50aCB2b2ljZXMuXG4gICAgICogV2UgY3JlYXRlIHNlcGFyYXRlIHByb3RvdHlwZXMgZm9yIG1vbm8gdnMgc3RlcmVvIGluc3RhbmNlcy5cbiAgICAgKi9cblxuICAgIGNvbnN0IG1vbm9Qcm90byAgID0gT2JqZWN0LmNyZWF0ZSggR2liYmVyaXNoLkJ1cygpICksXG4gICAgICAgICAgc3RlcmVvUHJvdG8gPSBPYmplY3QuY3JlYXRlKCBHaWJiZXJpc2guQnVzMigpKVxuXG4gICAgLy8gc2luY2UgdGhlcmUgYXJlIHR3byBwcm90b3R5cGVzIHdlIGNhbid0IGFzc2lnbiBkaXJlY3RseSB0byBvbmUgb2YgdGhlbS4uLlxuICAgIE9iamVjdC5hc3NpZ24oIG1vbm9Qcm90bywgICBHaWJiZXJpc2gubWl4aW5zLnBvbHlpbnN0cnVtZW50IClcbiAgICBPYmplY3QuYXNzaWduKCBzdGVyZW9Qcm90bywgR2liYmVyaXNoLm1peGlucy5wb2x5aW5zdHJ1bWVudCApXG5cbiAgICBjb25zdCBUZW1wbGF0ZSA9IHByb3BzID0+IHtcbiAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgeyBpc1N0ZXJlbzp0cnVlIH0sIHByb3BzIClcblxuICAgICAgY29uc3Qgc3ludGggPSBwcm9wZXJ0aWVzLmlzU3RlcmVvID8gT2JqZWN0LmNyZWF0ZSggc3RlcmVvUHJvdG8gKSA6IE9iamVjdC5jcmVhdGUoIG1vbm9Qcm90byApXG5cbiAgICAgIE9iamVjdC5hc3NpZ24oIHN5bnRoLCB7XG4gICAgICAgIHZvaWNlczogW10sXG4gICAgICAgIG1heFZvaWNlczogcHJvcGVydGllcy5tYXhWb2ljZXMgIT09IHVuZGVmaW5lZCA/IHByb3BlcnRpZXMubWF4Vm9pY2VzIDogMTYsXG4gICAgICAgIHZvaWNlQ291bnQ6IDAsXG4gICAgICAgIGVudkNoZWNrOiBfZW52Q2hlY2ssXG4gICAgICAgIGlkOiBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKSxcbiAgICAgICAgZGlydHk6IHRydWUsXG4gICAgICAgIHR5cGU6ICdidXMnLFxuICAgICAgICB1Z2VuTmFtZTogJ3BvbHknICsgdWdlbi5uYW1lICsgJ18nICsgc3ludGguaWQsXG4gICAgICAgIGlucHV0czpbXSxcbiAgICAgICAgaW5wdXROYW1lczogW10sXG4gICAgICAgIHByb3BlcnRpZXNcbiAgICAgIH0pXG5cbiAgICAgIHByb3BlcnRpZXMucGFuVm9pY2VzID0gcHJvcGVydGllcy5pc1N0ZXJlb1xuICAgICAgc3ludGguY2FsbGJhY2sudWdlbk5hbWUgPSBzeW50aC51Z2VuTmFtZVxuXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHN5bnRoLm1heFZvaWNlczsgaSsrICkge1xuICAgICAgICBzeW50aC52b2ljZXNbaV0gPSB1Z2VuKCBwcm9wZXJ0aWVzIClcbiAgICAgICAgc3ludGgudm9pY2VzW2ldLmNhbGxiYWNrLnVnZW5OYW1lID0gc3ludGgudm9pY2VzW2ldLnVnZW5OYW1lXG4gICAgICAgIHN5bnRoLnZvaWNlc1tpXS5pc0Nvbm5lY3RlZCA9IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGxldCBfcHJvcGVydHlMaXN0IFxuICAgICAgaWYoIHByb3BlcnRpZXMuaXNTdGVyZW8gPT09IGZhbHNlICkge1xuICAgICAgICBfcHJvcGVydHlMaXN0ID0gcHJvcGVydHlMaXN0LnNsaWNlKCAwIClcbiAgICAgICAgY29uc3QgaWR4ID0gIF9wcm9wZXJ0eUxpc3QuaW5kZXhPZiggJ3BhbicgKVxuICAgICAgICBpZiggaWR4ICA+IC0xICkgX3Byb3BlcnR5TGlzdC5zcGxpY2UoIGlkeCwgMSApXG4gICAgICB9XG5cbiAgICAgIFRlbXBsYXRlRmFjdG9yeS5zZXR1cFByb3BlcnRpZXMoIHN5bnRoLCB1Z2VuLCBwcm9wZXJ0aWVzLmlzU3RlcmVvID8gcHJvcGVydHlMaXN0IDogX3Byb3BlcnR5TGlzdCApXG5cbiAgICAgIHJldHVybiBzeW50aFxuICAgIH1cblxuICAgIHJldHVybiBUZW1wbGF0ZVxuICB9XG5cbiAgVGVtcGxhdGVGYWN0b3J5LnNldHVwUHJvcGVydGllcyA9IGZ1bmN0aW9uKCBzeW50aCwgdWdlbiwgcHJvcHMgKSB7XG4gICAgZm9yKCBsZXQgcHJvcGVydHkgb2YgcHJvcHMgKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHN5bnRoLCBwcm9wZXJ0eSwge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHN5bnRoLnByb3BlcnRpZXNbIHByb3BlcnR5IF0gfHwgdWdlbi5kZWZhdWx0c1sgcHJvcGVydHkgXVxuICAgICAgICB9LFxuICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgc3ludGgucHJvcGVydGllc1sgcHJvcGVydHkgXSA9IHZcbiAgICAgICAgICBmb3IoIGxldCBjaGlsZCBvZiBzeW50aC5pbnB1dHMgKSB7XG4gICAgICAgICAgICBjaGlsZFsgcHJvcGVydHkgXSA9IHZcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFRlbXBsYXRlRmFjdG9yeVxuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgbGV0IHByb3RvID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApXG5cbiAgT2JqZWN0LmFzc2lnbiggcHJvdG8sIHtcbiAgICBub3RlKCByYXRlICkge1xuICAgICAgdGhpcy5yYXRlID0gcmF0ZVxuICAgICAgaWYoIHJhdGUgPiAwICkge1xuICAgICAgICB0aGlzLnRyaWdnZXIoKVxuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuX19waGFzZV9fLnZhbHVlID0gdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxIFxuICAgICAgfVxuICAgIH0sXG4gIH0pXG5cbiAgY29uc3QgU2FtcGxlciA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGNvbnN0IHN5biA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbiggeyBvbmxvYWQ6bnVsbCB9LCBTYW1wbGVyLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgIHN5bi5pc1N0ZXJlbyA9IHByb3BzLmlzU3RlcmVvICE9PSB1bmRlZmluZWQgPyBwcm9wcy5pc1N0ZXJlbyA6IGZhbHNlXG5cbiAgICBjb25zdCBzdGFydCA9IGcuaW4oICdzdGFydCcgKSwgZW5kID0gZy5pbiggJ2VuZCcgKSwgXG4gICAgICAgICAgcmF0ZSA9IGcuaW4oICdyYXRlJyApLCBzaG91bGRMb29wID0gZy5pbiggJ2xvb3BzJyApXG5cbiAgICAvKiBcbiAgICAgKiBjcmVhdGUgZHVtbXkgdWdlbiB1bnRpbCBkYXRhIGZvciBzYW1wbGVyIGlzIGxvYWRlZC4uLlxuICAgICAqIHRoaXMgd2lsbCBiZSBvdmVycmlkZGVuIGJ5IGEgY2FsbCB0byBHaWJiZXJpc2guZmFjdG9yeSBvbiBsb2FkIFxuICAgICAqL1xuXG4gICAgc3luLmNhbGxiYWNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwIH1cbiAgICBzeW4uaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgIHN5bi51Z2VuTmFtZSA9IHN5bi5jYWxsYmFjay51Z2VuTmFtZSA9ICdzYW1wbGVyXycgKyBzeW4uaWRcbiAgICBzeW4uaW5wdXROYW1lcyA9IFtdXG5cbiAgICAvKiBlbmQgZHVtbXkgdWdlbiAqL1xuXG4gICAgc3luLl9fYmFuZ19fID0gZy5iYW5nKClcbiAgICBzeW4udHJpZ2dlciA9IHN5bi5fX2JhbmdfXy50cmlnZ2VyXG5cbiAgICBPYmplY3QuYXNzaWduKCBzeW4sIHByb3BzIClcblxuICAgIGlmKCBwcm9wcy5maWxlbmFtZSApIHtcbiAgICAgIHN5bi5kYXRhID0gZy5kYXRhKCBwcm9wcy5maWxlbmFtZSApXG5cbiAgICAgIHN5bi5kYXRhLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgc3luLl9fcGhhc2VfXyA9IGcuY291bnRlciggcmF0ZSwgc3RhcnQsIGVuZCwgc3luLl9fYmFuZ19fLCBzaG91bGRMb29wLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSlcblxuICAgICAgICBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICAgICAgc3luLFxuICAgICAgICAgIGcubXVsKCBcbiAgICAgICAgICBnLmlmZWxzZSggXG4gICAgICAgICAgICBnLmFuZCggZy5ndGUoIHN5bi5fX3BoYXNlX18sIHN0YXJ0ICksIGcubHQoIHN5bi5fX3BoYXNlX18sIGVuZCApICksXG4gICAgICAgICAgICBnLnBlZWsoIFxuICAgICAgICAgICAgICBzeW4uZGF0YSwgXG4gICAgICAgICAgICAgIHN5bi5fX3BoYXNlX18sXG4gICAgICAgICAgICAgIHsgbW9kZTonc2FtcGxlcycgfVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIDBcbiAgICAgICAgICApLCBnLmluKCdnYWluJykgKSxcbiAgICAgICAgICAnc2FtcGxlcicsIFxuICAgICAgICAgIHByb3BzIFxuICAgICAgICApIFxuXG4gICAgICAgIGlmKCBzeW4uZW5kID09PSAtOTk5OTk5OTk5ICkgc3luLmVuZCA9IHN5bi5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxXG5cbiAgICAgICAgaWYoIHN5bi5vbmxvYWQgIT09IG51bGwgKSB7IHN5bi5vbmxvYWQoKSB9XG5cbiAgICAgICAgR2liYmVyaXNoLmRpcnR5KCBzeW4gKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzeW5cbiAgfVxuICBcblxuICBTYW1wbGVyLmRlZmF1bHRzID0ge1xuICAgIGdhaW46IDEsXG4gICAgcGFuOiAuNSxcbiAgICByYXRlOiAxLFxuICAgIHBhblZvaWNlczpmYWxzZSxcbiAgICBsb29wczogMCxcbiAgICBzdGFydDowLFxuICAgIGVuZDotOTk5OTk5OTk5LFxuICB9XG5cbiAgY29uc3QgZW52Q2hlY2tGYWN0b3J5ID0gZnVuY3Rpb24oIHZvaWNlLCBfcG9seSApIHtcblxuICAgIGNvbnN0IGVudkNoZWNrID0gKCkgPT4ge1xuICAgICAgY29uc3QgcGhhc2UgPSBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIHZvaWNlLl9fcGhhc2VfXy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIGlmKCAoIHZvaWNlLnJhdGUgPiAwICYmIHBoYXNlID4gdm9pY2UuZW5kICkgfHwgKCB2b2ljZS5yYXRlIDwgMCAmJiBwaGFzZSA8IDAgKSApIHtcbiAgICAgICAgX3BvbHkuZGlzY29ubmVjdFVnZW4uY2FsbCggX3BvbHksIHZvaWNlIClcbiAgICAgICAgdm9pY2UuaXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5wdXNoKCBlbnZDaGVjayApXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudkNoZWNrXG4gIH1cblxuICBjb25zdCBQb2x5U2FtcGxlciA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoIFNhbXBsZXIsIFsncmF0ZScsJ3BhbicsJ2dhaW4nLCdzdGFydCcsJ2VuZCcsJ2xvb3BzJ10sIGVudkNoZWNrRmFjdG9yeSApIFxuXG4gIHJldHVybiBbIFNhbXBsZXIsIFBvbHlTYW1wbGVyIF1cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuICBcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgU25hcmUgPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBsZXQgc25hcmUgPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50ICksXG4gICAgICAgIGRlY2F5ID0gZy5pbiggJ2RlY2F5JyApLFxuICAgICAgICBzY2FsZWREZWNheSA9IGcubXVsKCBkZWNheSwgZy5nZW4uc2FtcGxlcmF0ZSAqIDIgKSxcbiAgICAgICAgc25hcHB5PSBnLmluKCAnc25hcHB5JyApLFxuICAgICAgICB0dW5lICA9IGcuaW4oICd0dW5lJyApLFxuICAgICAgICBnYWluICA9IGcuaW4oICdnYWluJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgU25hcmUuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgbGV0IGVnID0gZy5kZWNheSggc2NhbGVkRGVjYXksIHsgaW5pdFZhbHVlOjAgfSApLCBcbiAgICAgICAgY2hlY2sgPSBnLm1lbW8oIGcuZ3QoIGVnLCAuMDAwNSApICksXG4gICAgICAgIHJuZCA9IGcubXVsKCBnLm5vaXNlKCksIGVnICksXG4gICAgICAgIGhwZiA9IGcuc3ZmKCBybmQsIGcuYWRkKCAxMDAwLCBnLm11bCggZy5hZGQoIDEsIHR1bmUpLCAxMDAwICkgKSwgLjUsIDEsIGZhbHNlICksXG4gICAgICAgIHNuYXAgPSBnLmd0cCggZy5tdWwoIGhwZiwgc25hcHB5ICksIDAgKSwgLy8gcmVjdGlmeVxuICAgICAgICBicGYxID0gZy5zdmYoIGVnLCBnLm11bCggMTgwLCBnLmFkZCggdHVuZSwgMSApICksIC4wNSwgMiwgZmFsc2UgKSxcbiAgICAgICAgYnBmMiA9IGcuc3ZmKCBlZywgZy5tdWwoIDMzMCwgZy5hZGQoIHR1bmUsIDEgKSApLCAuMDUsIDIsIGZhbHNlICksXG4gICAgICAgIG91dCAgPSBnLm1lbW8oIGcuYWRkKCBzbmFwLCBicGYxLCBnLm11bCggYnBmMiwgLjggKSApICksIC8vWFhYIHdoeSBpcyBtZW1vIG5lZWRlZD9cbiAgICAgICAgc2NhbGVkT3V0ID0gZy5tdWwoIG91dCwgZ2FpbiApXG4gICAgXG4gICAgLy8gWFhYIFRPRE8gOiBtYWtlIHRoaXMgd29yayB3aXRoIGlmZWxzZS4gdGhlIHByb2JsZW0gaXMgdGhhdCBwb2tlIHVnZW5zIHB1dCB0aGVpclxuICAgIC8vIGNvZGUgYXQgdGhlIGJvdHRvbSBvZiB0aGUgY2FsbGJhY2sgZnVuY3Rpb24sIGluc3RlYWQgb2YgYXQgdGhlIGVuZCBvZiB0aGVcbiAgICAvLyBhc3NvY2lhdGVkIGlmL2Vsc2UgYmxvY2suXG4gICAgbGV0IGlmZSA9IGcuc3dpdGNoKCBjaGVjaywgc2NhbGVkT3V0LCAwIClcbiAgICAvL2xldCBpZmUgPSBnLmlmZWxzZSggZy5ndCggZWcsIC4wMDUgKSwgY3ljbGUoNDQwKSwgMCApXG4gICAgXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHNuYXJlLCBpZmUsICdzbmFyZScsIHByb3BzICApXG4gICAgXG4gICAgc25hcmUuZW52ID0gZWcgXG5cbiAgICByZXR1cm4gc25hcmVcbiAgfVxuICBcbiAgU25hcmUuZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogMSxcbiAgICBmcmVxdWVuY3k6MTAwMCxcbiAgICB0dW5lOjAsXG4gICAgc25hcHB5OiAxLFxuICAgIGRlY2F5Oi4xXG4gIH1cblxuICByZXR1cm4gU25hcmVcblxufVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBTeW50aCA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGNvbnN0IHN5biA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKVxuXG4gICAgY29uc3QgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgICBsb3VkbmVzcyAgPSBnLmluKCAnbG91ZG5lc3MnICksIFxuICAgICAgICAgIGdsaWRlID0gZy5pbiggJ2dsaWRlJyApLFxuICAgICAgICAgIHNsaWRpbmdGcmVxID0gZy5zbGlkZSggZnJlcXVlbmN5LCBnbGlkZSwgZ2xpZGUgKSxcbiAgICAgICAgICBhdHRhY2sgPSBnLmluKCAnYXR0YWNrJyApLCBkZWNheSA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgICBzdXN0YWluID0gZy5pbiggJ3N1c3RhaW4nICksIHN1c3RhaW5MZXZlbCA9IGcuaW4oICdzdXN0YWluTGV2ZWwnICksXG4gICAgICAgICAgcmVsZWFzZSA9IGcuaW4oICdyZWxlYXNlJyApXG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHN5biwgU3ludGguZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuXG4gICAgc3luLl9fY3JlYXRlR3JhcGggPSBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG9zYyA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCBzeW4ud2F2ZWZvcm0sIHNsaWRpbmdGcmVxLCBzeW4uYW50aWFsaWFzIClcblxuICAgICAgY29uc3QgZW52ID0gR2liYmVyaXNoLmVudmVsb3Blcy5mYWN0b3J5KCBcbiAgICAgICAgcHJvcHMudXNlQURTUiwgXG4gICAgICAgIHByb3BzLnNoYXBlLCBcbiAgICAgICAgYXR0YWNrLCBkZWNheSwgXG4gICAgICAgIHN1c3RhaW4sIHN1c3RhaW5MZXZlbCwgXG4gICAgICAgIHJlbGVhc2UsIFxuICAgICAgICBwcm9wcy50cmlnZ2VyUmVsZWFzZVxuICAgICAgKVxuXG4gICAgICAvLyBiZWxvdyBkb2Vzbid0IHdvcmsgYXMgaXQgYXR0ZW1wdHMgdG8gYXNzaWduIHRvIHJlbGVhc2UgcHJvcGVydHkgdHJpZ2dlcmluZyBjb2RlZ2VuLi4uXG4gICAgICAvLyBzeW4ucmVsZWFzZSA9ICgpPT4geyBzeW4uZW52LnJlbGVhc2UoKSB9XG5cbiAgICAgIGxldCBvc2NXaXRoRW52ID0gZy5tdWwoIGcubXVsKCBvc2MsIGVudiwgbG91ZG5lc3MgKSApLFxuICAgICAgICAgIHBhbm5lclxuICBcbiAgICAgIGNvbnN0IGJhc2VDdXRvZmZGcmVxID0gZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBmcmVxdWVuY3kgKVxuICAgICAgY29uc3QgY3V0b2ZmID0gZy5tdWwoIGcubXVsKCBiYXNlQ3V0b2ZmRnJlcSwgZy5wb3coIDIsIGcuaW4oJ2ZpbHRlck11bHQnKSApKSwgZW52IClcbiAgICAgIGNvbnN0IGZpbHRlcmVkT3NjID0gR2liYmVyaXNoLmZpbHRlcnMuZmFjdG9yeSggb3NjV2l0aEVudiwgY3V0b2ZmLCBnLmluKCdRJyksIGcuaW4oJ3NhdHVyYXRpb24nKSwgcHJvcHMgKVxuXG4gICAgICBsZXQgc3ludGhXaXRoR2FpbiA9IGcubXVsKCBmaWx0ZXJlZE9zYywgZy5pbiggJ2dhaW4nICkgKVxuICBcbiAgICAgIGlmKCBzeW4ucGFuVm9pY2VzID09PSB0cnVlICkgeyBcbiAgICAgICAgcGFubmVyID0gZy5wYW4oIHN5bnRoV2l0aEdhaW4sIHN5bnRoV2l0aEdhaW4sIGcuaW4oICdwYW4nICkgKSBcbiAgICAgICAgc3luLmdyYXBoID0gWyBwYW5uZXIubGVmdCwgcGFubmVyLnJpZ2h0IF1cbiAgICAgIH1lbHNle1xuICAgICAgICBzeW4uZ3JhcGggPSBzeW50aFdpdGhHYWluXG4gICAgICB9XG5cbiAgICAgIHN5bi5lbnYgPSBlbnZcbiAgICAgIHN5bi5vc2MgPSBvc2NcbiAgICAgIHN5bi5maWx0ZXIgPSBmaWx0ZXJlZE9zY1xuICAgIH1cbiAgICBcbiAgICBzeW4uX19yZXF1aXJlc1JlY29tcGlsYXRpb24gPSBbICd3YXZlZm9ybScsICdhbnRpYWxpYXMnLCAnZmlsdGVyVHlwZScsJ2ZpbHRlck1vZGUnLCAndXNlQURTUicsICdzaGFwZScgXVxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoKClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzeW4sIHN5bi5ncmFwaCwgJ3N5bnRoJywgcHJvcHMgIClcblxuICAgIHJldHVybiBzeW5cbiAgfVxuICBcbiAgU3ludGguZGVmYXVsdHMgPSB7XG4gICAgd2F2ZWZvcm06J3NhdycsXG4gICAgYXR0YWNrOiA0NCxcbiAgICBkZWNheTogMjIwNTAsXG4gICAgc3VzdGFpbjo0NDEwMCxcbiAgICBzdXN0YWluTGV2ZWw6LjYsXG4gICAgcmVsZWFzZToyMjA1MCxcbiAgICB1c2VBRFNSOmZhbHNlLFxuICAgIHNoYXBlOidsaW5lYXInLFxuICAgIHRyaWdnZXJSZWxlYXNlOmZhbHNlLFxuICAgIGdhaW46IDEsXG4gICAgcHVsc2V3aWR0aDouMjUsXG4gICAgZnJlcXVlbmN5OjIyMCxcbiAgICBwYW46IC41LFxuICAgIGFudGlhbGlhczpmYWxzZSxcbiAgICBwYW5Wb2ljZXM6ZmFsc2UsXG4gICAgbG91ZG5lc3M6MSxcbiAgICBnbGlkZToxLFxuICAgIHNhdHVyYXRpb246MSxcbiAgICBmaWx0ZXJNdWx0OjIsXG4gICAgUTouMjUsXG4gICAgY3V0b2ZmOi41LFxuICAgIGZpbHRlclR5cGU6MCxcbiAgICBmaWx0ZXJNb2RlOjAsXG4gICAgaXNMb3dQYXNzOjFcbiAgfVxuXG4gIC8vIGRvIG5vdCBpbmNsdWRlIHZlbG9jaXR5LCB3aGljaCBzaG91ZGwgYWx3YXlzIGJlIHBlciB2b2ljZVxuICBsZXQgUG9seVN5bnRoID0gR2liYmVyaXNoLlBvbHlUZW1wbGF0ZSggU3ludGgsIFsnZnJlcXVlbmN5JywnYXR0YWNrJywnZGVjYXknLCdwdWxzZXdpZHRoJywncGFuJywnZ2FpbicsJ2dsaWRlJywgJ3NhdHVyYXRpb24nLCAnZmlsdGVyTXVsdCcsICdRJywgJ2N1dG9mZicsICdyZXNvbmFuY2UnLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnd2F2ZWZvcm0nLCAnZmlsdGVyTW9kZSddICkgXG5cbiAgcmV0dXJuIFsgU3ludGgsIFBvbHlTeW50aCBdXG5cbn1cbiIsImNvbnN0IHVnZW5wcm90byA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBsZXQgQmlub3BzID0ge1xuICAgIGV4cG9ydCggb2JqICkge1xuICAgICAgZm9yKCBsZXQga2V5IGluIEJpbm9wcyApIHtcbiAgICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgICAgb2JqWyBrZXkgXSA9IEJpbm9wc1sga2V5IF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgQWRkKCAuLi5hcmdzICkge1xuICAgICAgY29uc3QgaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHVnZW5wcm90byApXG4gICAgICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IGJpbm9wOnRydWUsIG9wOicrJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidhZGQnICsgaWQsIGlkIH0gKVxuXG4gICAgICByZXR1cm4gdWdlblxuICAgIH0sXG5cbiAgICBTdWIoIC4uLmFyZ3MgKSB7XG4gICAgICBjb25zdCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICBjb25zdCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggdWdlbnByb3RvIClcbiAgICAgIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgYmlub3A6dHJ1ZSwgb3A6Jy0nLCBpbnB1dHM6YXJncywgdWdlbk5hbWU6J3N1YicgKyBpZCwgaWQgfSApXG5cbiAgICAgIHJldHVybiB1Z2VuXG4gICAgfSxcblxuICAgIE11bCggLi4uYXJncyApIHtcbiAgICAgIGNvbnN0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIGNvbnN0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCB1Z2VucHJvdG8gKVxuICAgICAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBiaW5vcDp0cnVlLCBvcDonKicsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonbXVsJyArIGlkLCBpZCB9IClcblxuICAgICAgcmV0dXJuIHVnZW5cbiAgICB9LFxuXG4gICAgRGl2KCAuLi5hcmdzICkge1xuICAgICAgY29uc3QgaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHVnZW5wcm90byApXG4gICAgICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IGJpbm9wOnRydWUsIG9wOicvJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidkaXYnICsgaWQsIGlkIH0gKVxuICAgIFxuICAgICAgcmV0dXJuIHVnZW5cbiAgICB9LFxuXG4gICAgTW9kKCAuLi5hcmdzICkge1xuICAgICAgY29uc3QgaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHVnZW5wcm90byApXG4gICAgICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IGJpbm9wOnRydWUsIG9wOiclJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidtb2QnICsgaWQsIGlkIH0gKVxuXG4gICAgICByZXR1cm4gdWdlblxuICAgIH0sICAgXG4gIH1cblxuICByZXR1cm4gQmlub3BzXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgXG4gIGNvbnN0IEJ1cyA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG4gIE9iamVjdC5hc3NpZ24oIEJ1cywge1xuICAgIF9fZ2FpbiA6IHtcbiAgICAgIHNldCggdiApIHtcbiAgICAgICAgdGhpcy5tdWwuaW5wdXRzWyAxIF0gPSB2XG4gICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdGhpcyApXG4gICAgICB9LFxuICAgICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tdWxbIDEgXVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBfX2FkZElucHV0KCBpbnB1dCApIHtcbiAgICAgIHRoaXMuc3VtLmlucHV0cy5wdXNoKCBpbnB1dCApXG4gICAgICBHaWJiZXJpc2guZGlydHkoIHRoaXMgKVxuICAgIH0sXG5cbiAgICBjcmVhdGUoIF9wcm9wcyApIHtcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgQnVzLmRlZmF1bHRzLCBfcHJvcHMgKVxuXG4gICAgICBjb25zdCBzdW0gPSBHaWJiZXJpc2guYmlub3BzLkFkZCggLi4ucHJvcHMuaW5wdXRzIClcbiAgICAgIGNvbnN0IG11bCA9IEdpYmJlcmlzaC5iaW5vcHMuTXVsKCBzdW0sIHByb3BzLmdhaW4gKVxuXG4gICAgICBjb25zdCBncmFwaCA9IEdpYmJlcmlzaC5QYW5uZXIoeyBpbnB1dDptdWwsIHBhbjogcHJvcHMucGFuIH0pXG5cbiAgICAgIGdyYXBoLnN1bSA9IHN1bVxuICAgICAgZ3JhcGgubXVsID0gbXVsXG4gICAgICBncmFwaC5kaXNjb25uZWN0VWdlbiA9IEJ1cy5kaXNjb25uZWN0VWdlblxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGdyYXBoLCAnZ2FpbicsIEJ1cy5fX2dhaW4gKVxuXG4gICAgICByZXR1cm4gZ3JhcGhcbiAgICB9LFxuXG4gICAgZGlzY29ubmVjdFVnZW4oIHVnZW4gKSB7XG4gICAgICBsZXQgcmVtb3ZlSWR4ID0gdGhpcy5zdW0uaW5wdXRzLmluZGV4T2YoIHVnZW4gKVxuXG4gICAgICBpZiggcmVtb3ZlSWR4ICE9PSAtMSApIHtcbiAgICAgICAgdGhpcy5zdW0uaW5wdXRzLnNwbGljZSggcmVtb3ZlSWR4LCAxIClcbiAgICAgICAgR2liYmVyaXNoLmRpcnR5KCB0aGlzIClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVmYXVsdHM6IHsgZ2FpbjoxLCBpbnB1dHM6WzBdLCBwYW46LjUgfVxuICB9KVxuXG4gIHJldHVybiBCdXMuY3JlYXRlLmJpbmQoIEJ1cyApXG5cbn1cblxuIiwiLypsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgXG4gIGNvbnN0IEJ1czIgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuICBPYmplY3QuYXNzaWduKCBCdXMyLCB7XG4gICAgX19nYWluIDoge1xuICAgICAgc2V0KCB2ICkge1xuICAgICAgICB0aGlzLm11bC5pbnB1dHNbIDEgXSA9IHZcbiAgICAgICAgR2liYmVyaXNoLmRpcnR5KCB0aGlzIClcblxuICAgICAgfSxcbiAgICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubXVsWyAxIF1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX19hZGRJbnB1dCggaW5wdXQgKSB7XG4gICAgICBpZiggaW5wdXQuaXNTdGVyZW8gfHwgQXJyYXkuaXNBcnJheSggaW5wdXQgKSApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3N0ZXJlbycsIGlucHV0IClcbiAgICAgICAgdGhpcy5zdW1MLmlucHV0cy5wdXNoKCBpbnB1dFswXSApXG4gICAgICAgIHRoaXMuc3VtUi5pbnB1dHMucHVzaCggaW5wdXRbMF0gKSAgICAgICAgXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc29sZS5sb2coICdtb25vJywgaW5wdXQgKVxuICAgICAgICB0aGlzLnN1bUwuaW5wdXRzLnB1c2goIGlucHV0IClcbiAgICAgICAgdGhpcy5zdW1SLmlucHV0cy5wdXNoKCBpbnB1dCApXG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdGhpcyApXG4gICAgfSxcblxuICAgIGNyZWF0ZSggX3Byb3BzICkge1xuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBCdXMyLmRlZmF1bHRzLCBfcHJvcHMgKVxuXG4gICAgICBjb25zdCBpbnB1dHNMID0gW10sIGlucHV0c1IgPSBbXVxuXG4gICAgICBwcm9wcy5pbnB1dHMuZm9yRWFjaCggaSA9PiB7XG4gICAgICAgIGlmKCBpLmlzU3RlcmVvIHx8IEFycmF5LmlzQXJyYXkoIGkgKSApIHtcbiAgICAgICAgICBpbnB1dHNMLnB1c2goIGlbMF0gKSBcbiAgICAgICAgICBpbnB1dHNSLnB1c2goIGlbMV0gKVxuICAgICAgICB9ZWxzZXsgXG4gICAgICAgICAgaW5wdXRzTC5wdXNoKCBpICkgXG4gICAgICAgICAgaW5wdXRzUi5wdXNoKCBpIClcbiAgICAgICAgfSAgXG4gICAgICB9KVxuXG4gICAgICBjb25zdCBzdW1MID0gR2liYmVyaXNoLmJpbm9wcy5BZGQoIC4uLmlucHV0c0wgKVxuICAgICAgY29uc3QgbXVsTCA9IEdpYmJlcmlzaC5iaW5vcHMuTXVsKCBzdW1MLCBwcm9wcy5nYWluIClcbiAgICAgIGNvbnN0IHN1bVIgPSBHaWJiZXJpc2guYmlub3BzLkFkZCggLi4uaW5wdXRzUiApXG4gICAgICBjb25zdCBtdWxSID0gR2liYmVyaXNoLmJpbm9wcy5NdWwoIHN1bVIsIHByb3BzLmdhaW4gKVxuXG4gICAgICBjb25zdCBncmFwaCA9IEdpYmJlcmlzaC5QYW5uZXIoeyBpbnB1dDptdWxMLCBwYW46IHByb3BzLnBhbiB9KVxuXG4gICAgICBPYmplY3QuYXNzaWduKCBncmFwaCwgeyBzdW1MLCBtdWxMLCBzdW1SLCBtdWxSLCBfX2FkZElucHV0OkJ1czIuX19hZGRJbnB1dCwgZGlzY29ubmVjdFVnZW46QnVzMi5kaXNjb25uZWN0VWdlbiAgfSlcblxuICAgICAgZ3JhcGguaXNTdGVyZW8gPSB0cnVlXG4gICAgICBncmFwaC5pbnB1dHMgPSBwcm9wcy5pbnB1dHNcbiAgICAgIC8vZ3JhcGgudHlwZSA9ICdidXMnXG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggZ3JhcGgsICdnYWluJywgQnVzMi5fX2dhaW4gKVxuXG4gICAgICByZXR1cm4gZ3JhcGhcbiAgICB9LFxuXG4gICAgZGlzY29ubmVjdFVnZW4oIHVnZW4gKSB7XG4gICAgICBsZXQgcmVtb3ZlSWR4ID0gdGhpcy5zdW0uaW5wdXRzLmluZGV4T2YoIHVnZW4gKVxuXG4gICAgICBpZiggcmVtb3ZlSWR4ICE9PSAtMSApIHtcbiAgICAgICAgdGhpcy5zdW0uaW5wdXRzLnNwbGljZSggcmVtb3ZlSWR4LCAxIClcbiAgICAgICAgR2liYmVyaXNoLmRpcnR5KCB0aGlzIClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVmYXVsdHM6IHsgZ2FpbjoxLCBpbnB1dHM6WzBdLCBwYW46LjUgfVxuICB9KVxuXG4gIHJldHVybiBCdXMyLmNyZWF0ZS5iaW5kKCBCdXMyIClcblxufVxuKi9cblxuXG5jb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIGNvbnN0IEJ1czIgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuICBsZXQgYnVmZmVyTCwgYnVmZmVyUlxuICBcbiAgT2JqZWN0LmFzc2lnbiggQnVzMiwgeyBcbiAgICBjcmVhdGUoIHByb3BzICkge1xuICAgICAgaWYoIGJ1ZmZlckwgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgYnVmZmVyTCA9IEdpYmJlcmlzaC5nZW5pc2guZ2VuLmdsb2JhbHMucGFuTC5tZW1vcnkudmFsdWVzLmlkeFxuICAgICAgICBidWZmZXJSID0gR2liYmVyaXNoLmdlbmlzaC5nZW4uZ2xvYmFscy5wYW5SLm1lbW9yeS52YWx1ZXMuaWR4XG4gICAgICB9XG5cbiAgICAgIHZhciBvdXRwdXQgPSBuZXcgRmxvYXQzMkFycmF5KCAyIClcblxuICAgICAgdmFyIGJ1cyA9IE9iamVjdC5jcmVhdGUoIEJ1czIgKVxuXG4gICAgICBPYmplY3QuYXNzaWduKCBcbiAgICAgICAgYnVzLFxuXG4gICAgICAgIHtcbiAgICAgICAgICBjYWxsYmFjaygpIHtcbiAgICAgICAgICAgIG91dHB1dFsgMCBdID0gb3V0cHV0WyAxIF0gPSAwXG4gICAgICAgICAgICB2YXIgbGFzdElkeCA9IGFyZ3VtZW50cy5sZW5ndGggLSAxXG4gICAgICAgICAgICB2YXIgbWVtb3J5ICA9IGFyZ3VtZW50c1sgbGFzdElkeCBdXG5cbiAgICAgICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgbGFzdElkeDsgaSsrICkge1xuICAgICAgICAgICAgICB2YXIgaW5wdXQgPSBhcmd1bWVudHNbIGkgXSxcbiAgICAgICAgICAgICAgICAgIGlzQXJyYXkgPSBpbnB1dCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheVxuXG4gICAgICAgICAgICAgIG91dHB1dFsgMCBdICs9IGlzQXJyYXkgPyBpbnB1dFsgMCBdIDogaW5wdXRcbiAgICAgICAgICAgICAgb3V0cHV0WyAxIF0gKz0gaXNBcnJheSA/IGlucHV0WyAxIF0gOiBpbnB1dFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcGFuUmF3SW5kZXggID0gLjUgKiAxMDIzLFxuICAgICAgICAgICAgICAgIHBhbkJhc2VJbmRleCA9IHBhblJhd0luZGV4IHwgMCxcbiAgICAgICAgICAgICAgICBwYW5OZXh0SW5kZXggPSAocGFuQmFzZUluZGV4ICsgMSkgJiAxMDIzLFxuICAgICAgICAgICAgICAgIGludGVycEFtb3VudCA9IHBhblJhd0luZGV4IC0gcGFuQmFzZUluZGV4LFxuICAgICAgICAgICAgICAgIHBhbkwgPSBtZW1vcnlbIGJ1ZmZlckwgKyBwYW5CYXNlSW5kZXggXSBcbiAgICAgICAgICAgICAgICAgICsgKCBpbnRlcnBBbW91bnQgKiAoIG1lbW9yeVsgYnVmZmVyTCArIHBhbk5leHRJbmRleCBdIC0gbWVtb3J5WyBidWZmZXJMICsgcGFuQmFzZUluZGV4IF0gKSApLFxuICAgICAgICAgICAgICAgIHBhblIgPSBtZW1vcnlbIGJ1ZmZlclIgKyBwYW5CYXNlSW5kZXggXSBcbiAgICAgICAgICAgICAgICAgICsgKCBpbnRlcnBBbW91bnQgKiAoIG1lbW9yeVsgYnVmZmVyUiArIHBhbk5leHRJbmRleCBdIC0gbWVtb3J5WyBidWZmZXJSICsgcGFuQmFzZUluZGV4IF0gKSApXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG91dHB1dFswXSAqPSBidXMuZ2FpbiAqIHBhbkxcbiAgICAgICAgICAgIG91dHB1dFsxXSAqPSBidXMuZ2FpbiAqIHBhblJcblxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWQgOiBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKSxcbiAgICAgICAgICBkaXJ0eSA6IHRydWUsXG4gICAgICAgICAgdHlwZSA6ICdidXMnLFxuICAgICAgICAgIGlucHV0czpbXVxuICAgICAgICB9LFxuXG4gICAgICAgIEJ1czIuZGVmYXVsdHMsXG5cbiAgICAgICAgcHJvcHNcbiAgICAgIClcblxuICAgICAgYnVzLnVnZW5OYW1lID0gYnVzLmNhbGxiYWNrLnVnZW5OYW1lID0gJ2J1czJfJyArIGJ1cy5pZFxuXG4gICAgICByZXR1cm4gYnVzXG4gICAgfSxcbiAgICBcbiAgICBkaXNjb25uZWN0VWdlbiggdWdlbiApIHtcbiAgICAgIGxldCByZW1vdmVJZHggPSB0aGlzLmlucHV0cy5pbmRleE9mKCB1Z2VuIClcblxuICAgICAgaWYoIHJlbW92ZUlkeCAhPT0gLTEgKSB7XG4gICAgICAgIHRoaXMuaW5wdXRzLnNwbGljZSggcmVtb3ZlSWR4LCAxIClcbiAgICAgICAgR2liYmVyaXNoLmRpcnR5KCB0aGlzIClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVmYXVsdHM6IHsgZ2FpbjoxLCBwYW46LjUgfVxuICB9KVxuXG4gIHJldHVybiBCdXMyLmNyZWF0ZS5iaW5kKCBCdXMyIClcblxufVxuXG4iLCJjb25zdCAgZyAgICA9IHJlcXVpcmUoICdnZW5pc2guanMnICApLFxuICAgICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgTW9ub3BzID0ge1xuICAgIGV4cG9ydCggb2JqICkge1xuICAgICAgZm9yKCBsZXQga2V5IGluIE1vbm9wcyApIHtcbiAgICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgICAgb2JqWyBrZXkgXSA9IE1vbm9wc1sga2V5IF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgQWJzKCBpbnB1dCApIHtcbiAgICAgIGNvbnN0IGFicyA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLmFicyggZy5pbignaW5wdXQnKSApXG4gICAgICBcbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBhYnMsIGdyYXBoLCAnYWJzJywgT2JqZWN0LmFzc2lnbih7fSwgTW9ub3BzLmRlZmF1bHRzLCB7IGlucHV0IH0pIClcblxuICAgICAgcmV0dXJuIGFic1xuICAgIH0sXG5cbiAgICBQb3coIGlucHV0LCBleHBvbmVudCApIHtcbiAgICAgIGNvbnN0IHBvdyA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLnBvdyggZy5pbignaW5wdXQnKSwgZy5pbignZXhwb25lbnQnKSApXG4gICAgICBcbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBwb3csIGdyYXBoLCAncG93JywgT2JqZWN0LmFzc2lnbih7fSwgTW9ub3BzLmRlZmF1bHRzLCB7IGlucHV0LCBleHBvbmVudCB9KSApXG5cbiAgICAgIHJldHVybiBwb3dcbiAgICB9LFxuICAgIENsYW1wKCBpbnB1dCwgbWluLCBtYXggKSB7XG4gICAgICBjb25zdCBjbGFtcCA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLmNsYW1wKCBnLmluKCdpbnB1dCcpLCBnLmluKCdtaW4nKSwgZy5pbignbWF4JykgKVxuICAgICAgXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggY2xhbXAsIGdyYXBoLCAnY2xhbXAnLCBPYmplY3QuYXNzaWduKHt9LCBNb25vcHMuZGVmYXVsdHMsIHsgaW5wdXQsIG1pbiwgbWF4IH0pIClcblxuICAgICAgcmV0dXJuIGNsYW1wXG4gICAgfSxcblxuICAgIE1lcmdlKCBpbnB1dCApIHtcbiAgICAgIGNvbnN0IG1lcmdlciA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgICAgY29uc3QgY2IgPSBmdW5jdGlvbiggX2lucHV0ICkge1xuICAgICAgICByZXR1cm4gX2lucHV0WzBdICsgX2lucHV0WzFdXG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBtZXJnZXIsIGcuaW4oICdpbnB1dCcgKSwgJ21lcmdlJywgeyBpbnB1dCB9LCBjYiApXG4gICAgICBtZXJnZXIudHlwZSA9ICdhbmFseXNpcydcbiAgICAgIG1lcmdlci5pbnB1dE5hbWVzID0gWyAnaW5wdXQnIF1cbiAgICAgIG1lcmdlci5pbnB1dHMgPSBbIGlucHV0IF1cbiAgICAgIG1lcmdlci5pbnB1dCA9IGlucHV0XG4gICAgICBcbiAgICAgIHJldHVybiBtZXJnZXJcbiAgICB9LFxuICB9XG5cbiAgTW9ub3BzLmRlZmF1bHRzID0geyBpbnB1dDowIH1cblxuICByZXR1cm4gTW9ub3BzXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5jb25zdCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IFBhbm5lciA9IGlucHV0UHJvcHMgPT4ge1xuICBjb25zdCBwcm9wcyAgPSBPYmplY3QuYXNzaWduKCB7fSwgUGFubmVyLmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICAgIHBhbm5lciA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG4gIGNvbnN0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogQXJyYXkuaXNBcnJheSggcHJvcHMuaW5wdXQgKSBcbiAgXG4gIGNvbnN0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgICBwYW4gICA9IGcuaW4oICdwYW4nIClcblxuICBsZXQgZ3JhcGggXG4gIGlmKCBpc1N0ZXJlbyApIHtcbiAgICBjb25zb2xlLmxvZyggaW5wdXRbMF0sIGlucHV0WzFdIClcbiAgICBncmFwaCA9IGcucGFuKCBpbnB1dFswXSwgaW5wdXRbMV0sIHBhbiApICBcbiAgfWVsc2V7XG4gICAgZ3JhcGggPSBnLnBhbiggaW5wdXQsIGlucHV0LCBwYW4gKVxuICB9XG5cbiAgR2liYmVyaXNoLmZhY3RvcnkoIHBhbm5lciwgWyBncmFwaC5sZWZ0LCBncmFwaC5yaWdodF0sICdwYW5uZXInLCBwcm9wcyApXG4gIFxuICByZXR1cm4gcGFubmVyXG59XG5cblBhbm5lci5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgcGFuOi41XG59XG5cbnJldHVybiBQYW5uZXIgXG5cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBUaW1lID0ge1xuICAgIGJwbTogMTIwLFxuXG4gICAgZXhwb3J0OiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24oIHRhcmdldCwgVGltZSApXG4gICAgfSxcblxuICAgIG1zIDogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdmFsICogR2liYmVyaXNoLmN0eC5zYW1wbGVSYXRlIC8gMTAwMDtcbiAgICB9LFxuXG4gICAgc2Vjb25kcyA6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHZhbCAqIEdpYmJlcmlzaC5jdHguc2FtcGxlUmF0ZTtcbiAgICB9LFxuXG4gICAgYmVhdHMgOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHsgXG4gICAgICAgIHZhciBzYW1wbGVzUGVyQmVhdCA9IEdpYmJlcmlzaC5jdHguc2FtcGxlUmF0ZSAvICggR2liYmVyaXNoLlRpbWUuYnBtIC8gNjAgKSA7XG4gICAgICAgIHJldHVybiBzYW1wbGVzUGVyQmVhdCAqIHZhbCA7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFRpbWVcbn1cbiIsImNvbnN0IGdlbmlzaCA9IHJlcXVpcmUoJ2dlbmlzaC5qcycpLFxuICAgICAgc3NkID0gZ2VuaXNoLmhpc3RvcnksXG4gICAgICBub2lzZSA9IGdlbmlzaC5ub2lzZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIFwidXNlIGpzZHNwXCI7XG5cbiAgY29uc3QgbGFzdCA9IHNzZCgwKTtcblxuICBjb25zdCB3aGl0ZSA9IGdlbmlzaC5zdWIoZ2VuaXNoLm11bChub2lzZSgpLCAyKSwgMSk7XG5cbiAgbGV0IG91dCA9IGdlbmlzaC5hZGQobGFzdC5vdXQsIGdlbmlzaC5kaXYoZ2VuaXNoLm11bCguMDIsIHdoaXRlKSwgMS4wMikpO1xuXG4gIGxhc3QuaW4ob3V0KTtcblxuICBvdXQgPSBnZW5pc2gubXVsKG91dCwgMy41KTtcblxuICByZXR1cm4gb3V0O1xufTsiLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubGV0IGZlZWRiYWNrT3NjID0gZnVuY3Rpb24oIGZyZXF1ZW5jeSwgZmlsdGVyLCBwdWxzZXdpZHRoPS41LCBhcmd1bWVudFByb3BzICkge1xuICBpZiggYXJndW1lbnRQcm9wcyA9PT0gdW5kZWZpbmVkICkgYXJndW1lbnRQcm9wcyA9IHsgdHlwZTogMCB9XG5cbiAgbGV0IGxhc3RTYW1wbGUgPSBnLmhpc3RvcnkoKSxcbiAgICAgIC8vIGRldGVybWluZSBwaGFzZSBpbmNyZW1lbnQgYW5kIG1lbW9pemUgcmVzdWx0XG4gICAgICB3ID0gZy5tZW1vKCBnLmRpdiggZnJlcXVlbmN5LCBnLmdlbi5zYW1wbGVyYXRlICkgKSxcbiAgICAgIC8vIGNyZWF0ZSBzY2FsaW5nIGZhY3RvclxuICAgICAgbiA9IGcuc3ViKCAtLjUsIHcgKSxcbiAgICAgIHNjYWxpbmcgPSBnLm11bCggZy5tdWwoIDEzLCBmaWx0ZXIgKSwgZy5wb3coIG4sIDUgKSApLFxuICAgICAgLy8gY2FsY3VsYXRlIGRjIG9mZnNldCBhbmQgbm9ybWFsaXphdGlvbiBmYWN0b3JzXG4gICAgICBEQyA9IGcuc3ViKCAuMzc2LCBnLm11bCggdywgLjc1MiApICksXG4gICAgICBub3JtID0gZy5zdWIoIDEsIGcubXVsKCAyLCB3ICkgKSxcbiAgICAgIC8vIGRldGVybWluZSBwaGFzZVxuICAgICAgb3NjMVBoYXNlID0gZy5hY2N1bSggdywgMCwgeyBtaW46LTEgfSksXG4gICAgICBvc2MxLCBvdXRcblxuICAvLyBjcmVhdGUgY3VycmVudCBzYW1wbGUuLi4gZnJvbSB0aGUgcGFwZXI6XG4gIC8vIG9zYyA9IChvc2MgKyBzaW4oMipwaSoocGhhc2UgKyBvc2Mqc2NhbGluZykpKSowLjVmO1xuICBvc2MxID0gZy5tZW1vKCBcbiAgICBnLm11bChcbiAgICAgIGcuYWRkKFxuICAgICAgICBsYXN0U2FtcGxlLm91dCxcbiAgICAgICAgZy5zaW4oXG4gICAgICAgICAgZy5tdWwoXG4gICAgICAgICAgICBNYXRoLlBJICogMixcbiAgICAgICAgICAgIGcubWVtbyggZy5hZGQoIG9zYzFQaGFzZSwgZy5tdWwoIGxhc3RTYW1wbGUub3V0LCBzY2FsaW5nICkgKSApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApLFxuICAgICAgLjVcbiAgICApXG4gIClcblxuICAvLyBzdG9yZSBzYW1wbGUgdG8gdXNlIGFzIG1vZHVsYXRpb25cbiAgbGFzdFNhbXBsZS5pbiggb3NjMSApXG5cbiAgLy8gaWYgcHdtIC8gc3F1YXJlIHdhdmVmb3JtIGluc3RlYWQgb2Ygc2F3dG9vdGguLi5cbiAgaWYoIGFyZ3VtZW50UHJvcHMudHlwZSA9PT0gMSApIHsgXG4gICAgY29uc3QgbGFzdFNhbXBsZTIgPSBnLmhpc3RvcnkoKSAvLyBmb3Igb3NjIDJcbiAgICBjb25zdCBsYXN0U2FtcGxlTWFzdGVyID0gZy5oaXN0b3J5KCkgLy8gZm9yIHN1bSBvZiBvc2MxLG9zYzJcblxuICAgIGNvbnN0IG9zYzIgPSBnLm11bChcbiAgICAgIGcuYWRkKFxuICAgICAgICBsYXN0U2FtcGxlMi5vdXQsXG4gICAgICAgIGcuc2luKFxuICAgICAgICAgIGcubXVsKFxuICAgICAgICAgICAgTWF0aC5QSSAqIDIsXG4gICAgICAgICAgICBnLm1lbW8oIGcuYWRkKCBvc2MxUGhhc2UsIGcubXVsKCBsYXN0U2FtcGxlMi5vdXQsIHNjYWxpbmcgKSwgcHVsc2V3aWR0aCApIClcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICksXG4gICAgICAuNVxuICAgIClcblxuICAgIGxhc3RTYW1wbGUyLmluKCBvc2MyIClcbiAgICBvdXQgPSBnLm1lbW8oIGcuc3ViKCBsYXN0U2FtcGxlLm91dCwgbGFzdFNhbXBsZTIub3V0ICkgKVxuICAgIG91dCA9IGcubWVtbyggZy5hZGQoIGcubXVsKCAyLjUsIG91dCApLCBnLm11bCggLTEuNSwgbGFzdFNhbXBsZU1hc3Rlci5vdXQgKSApIClcbiAgICBcbiAgICBsYXN0U2FtcGxlTWFzdGVyLmluKCBnLnN1Yiggb3NjMSwgb3NjMiApIClcblxuICB9ZWxzZXtcbiAgICAgLy8gb2Zmc2V0IGFuZCBub3JtYWxpemVcbiAgICBvc2MxID0gZy5hZGQoIGcubXVsKCAyLjUsIG9zYzEgKSwgZy5tdWwoIC0xLjUsIGxhc3RTYW1wbGUub3V0ICkgKVxuICAgIG9zYzEgPSBnLmFkZCggb3NjMSwgREMgKVxuIFxuICAgIG91dCA9IG9zYzFcbiAgfVxuXG4gIHJldHVybiBnLm11bCggb3V0LCBub3JtIClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmZWVkYmFja09zY1xuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICksXG4gICAgICBmZWVkYmFja09zYyA9IHJlcXVpcmUoICcuL2ZtZmVlZGJhY2tvc2MuanMnIClcblxuLy8gIF9fbWFrZU9zY2lsbGF0b3JfXyggdHlwZSwgZnJlcXVlbmN5LCBhbnRpYWxpYXMgKSB7XG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIGxldCBPc2NpbGxhdG9ycyA9IHtcbiAgICBleHBvcnQoIG9iaiApIHtcbiAgICAgIGZvciggbGV0IGtleSBpbiBPc2NpbGxhdG9ycyApIHtcbiAgICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgICAgb2JqWyBrZXkgXSA9IE9zY2lsbGF0b3JzWyBrZXkgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGdlbmlzaDoge1xuICAgICAgQnJvd246IHJlcXVpcmUoICcuL2Jyb3dubm9pc2UuanMnICksXG4gICAgICBQaW5rOiAgcmVxdWlyZSggJy4vcGlua25vaXNlLmpzJyAgKVxuICAgIH0sXG5cbiAgICBXYXZldGFibGU6IHJlcXVpcmUoICcuL3dhdmV0YWJsZS5qcycgKSggR2liYmVyaXNoICksXG4gICAgXG4gICAgU3F1YXJlKCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3Qgc3FyICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICkgXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oeyBhbnRpYWxpYXM6ZmFsc2UgfSwgT3NjaWxsYXRvcnMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgICAgY29uc3Qgb3NjICAgPSBPc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5pbiggJ2ZyZXF1ZW5jeScgKSwgcHJvcHMuYW50aWFsaWFzIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIG9zYywgZy5pbignZ2FpbicgKSApXG5cbiAgICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzcXIsIGdyYXBoLCAnc3FyJywgcHJvcHMgKVxuXG4gICAgICByZXR1cm4gc3FyXG4gICAgfSxcblxuICAgIFRyaWFuZ2xlKCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3QgdHJpPSBPYmplY3QuY3JlYXRlKCB1Z2VuICkgXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oeyBhbnRpYWxpYXM6ZmFsc2UgfSwgT3NjaWxsYXRvcnMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgICAgY29uc3Qgb3NjICAgPSBPc2NpbGxhdG9ycy5mYWN0b3J5KCAndHJpYW5nbGUnLCBnLmluKCAnZnJlcXVlbmN5JyApLCBwcm9wcy5hbnRpYWxpYXMgKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLm11bCggb3NjLCBnLmluKCdnYWluJyApIClcblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHRyaSwgZ3JhcGgsICd0cmknLCBwcm9wcyApXG5cbiAgICAgIHJldHVybiB0cmlcbiAgICB9LFxuXG4gICAgUFdNKCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3QgcHdtICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICkgXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oeyBhbnRpYWxpYXM6ZmFsc2UsIHB1bHNld2lkdGg6LjI1IH0sIE9zY2lsbGF0b3JzLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICAgIGNvbnN0IG9zYyAgID0gT3NjaWxsYXRvcnMuZmFjdG9yeSggJ3B3bScsIGcuaW4oICdmcmVxdWVuY3knICksIHByb3BzLmFudGlhbGlhcyApXG4gICAgICBjb25zdCBncmFwaCA9IGcubXVsKCBvc2MsIGcuaW4oJ2dhaW4nICkgKVxuXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggcHdtLCBncmFwaCwgJ3B3bScsIHByb3BzIClcblxuICAgICAgcmV0dXJuIHB3bVxuICAgIH0sXG5cbiAgICBTaW5lKCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3Qgc2luZSAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgT3NjaWxsYXRvcnMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLm11bCggZy5jeWNsZSggZy5pbignZnJlcXVlbmN5JykgKSwgZy5pbignZ2FpbicpIClcblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHNpbmUsIGdyYXBoLCAnc2luZScsIHByb3BzIClcbiAgICAgIFxuICAgICAgcmV0dXJuIHNpbmVcbiAgICB9LFxuXG4gICAgTm9pc2UoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBub2lzZSA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgeyBnYWluOiAxLCBjb2xvcjond2hpdGUnIH0sIGlucHV0UHJvcHMgKVxuICAgICAgbGV0IGdyYXBoIFxuXG4gICAgICBzd2l0Y2goIHByb3BzLmNvbG9yICkge1xuICAgICAgICBjYXNlICdicm93bic6XG4gICAgICAgICAgZ3JhcGggPSBnLm11bCggT3NjaWxsYXRvcnMuZ2VuaXNoLkJyb3duKCksIGcuaW4oJ2dhaW4nKSApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3BpbmsnOlxuICAgICAgICAgIGdyYXBoID0gZy5tdWwoIE9zY2lsbGF0b3JzLmdlbmlzaC5QaW5rKCksIGcuaW4oJ2dhaW4nKSApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgZ3JhcGggPSBnLm11bCggZy5ub2lzZSgpLCBnLmluKCdnYWluJykgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggbm9pc2UsIGdyYXBoLCAnbm9pc2UnLCBwcm9wcyApXG5cbiAgICAgIHJldHVybiBub2lzZVxuICAgIH0sXG5cbiAgICBTYXcoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBzYXcgICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSBcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7IGFudGlhbGlhczpmYWxzZSB9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgICBjb25zdCBvc2MgICA9IE9zY2lsbGF0b3JzLmZhY3RvcnkoICdzYXcnLCBnLmluKCAnZnJlcXVlbmN5JyApLCBwcm9wcy5hbnRpYWxpYXMgKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLm11bCggb3NjLCBnLmluKCdnYWluJyApIClcblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHNhdywgZ3JhcGgsICdzYXcnLCBwcm9wcyApXG5cbiAgICAgIHJldHVybiBzYXdcbiAgICB9LFxuXG4gICAgUmV2ZXJzZVNhdyggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHNhdyAgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApIFxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHsgYW50aWFsaWFzOmZhbHNlIH0sIE9zY2lsbGF0b3JzLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICAgIGNvbnN0IG9zYyAgID0gZy5zdWIoIDEsIE9zY2lsbGF0b3JzLmZhY3RvcnkoICdzYXcnLCBnLmluKCAnZnJlcXVlbmN5JyApLCBwcm9wcy5hbnRpYWxpYXMgKSApXG4gICAgICBjb25zdCBncmFwaCA9IGcubXVsKCBvc2MsIGcuaW4oICdnYWluJyApIClcblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIHNhdywgZ3JhcGgsICdyc2F3JywgcHJvcHMgKVxuICAgICAgXG4gICAgICByZXR1cm4gc2F3XG4gICAgfSxcblxuICAgIGZhY3RvcnkoIHR5cGUsIGZyZXF1ZW5jeSwgYW50aWFsaWFzPWZhbHNlICkge1xuICAgICAgbGV0IG9zY1xuXG4gICAgICBzd2l0Y2goIHR5cGUgKSB7XG4gICAgICAgIGNhc2UgJ3B3bSc6XG4gICAgICAgICAgbGV0IHB1bHNld2lkdGggPSBnLmluKCdwdWxzZXdpZHRoJylcbiAgICAgICAgICBpZiggYW50aWFsaWFzID09PSB0cnVlICkge1xuICAgICAgICAgICAgb3NjID0gZmVlZGJhY2tPc2MoIGZyZXF1ZW5jeSwgMSwgcHVsc2V3aWR0aCwgeyB0eXBlOjEgfSlcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGxldCBwaGFzZSA9IGcucGhhc29yKCBmcmVxdWVuY3ksIDAsIHsgbWluOjAgfSApXG4gICAgICAgICAgICBvc2MgPSBnLmx0KCBwaGFzZSwgcHVsc2V3aWR0aCApXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzYXcnOlxuICAgICAgICAgIGlmKCBhbnRpYWxpYXMgPT09IGZhbHNlICkge1xuICAgICAgICAgICAgb3NjID0gZy5waGFzb3IoIGZyZXF1ZW5jeSApXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBvc2MgPSBmZWVkYmFja09zYyggZnJlcXVlbmN5LCAxIClcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NpbmUnOlxuICAgICAgICAgIG9zYyA9IGcuY3ljbGUoIGZyZXF1ZW5jeSApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICAgICAgaWYoIGFudGlhbGlhcyA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICAgIG9zYyA9IGZlZWRiYWNrT3NjKCBmcmVxdWVuY3ksIDEsIC41LCB7IHR5cGU6MSB9KVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgb3NjID0gZy53YXZldGFibGUoIGZyZXF1ZW5jeSwgeyBidWZmZXI6T3NjaWxsYXRvcnMuU3F1YXJlLmJ1ZmZlciwgbmFtZTonc3F1YXJlJyB9IClcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3RyaWFuZ2xlJzpcbiAgICAgICAgICBvc2MgPSBnLndhdmV0YWJsZSggZnJlcXVlbmN5LCB7IGJ1ZmZlcjpPc2NpbGxhdG9ycy5UcmlhbmdsZS5idWZmZXIsIG5hbWU6J3RyaWFuZ2xlJyB9IClcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9zY1xuICAgIH1cbiAgfVxuXG4gIE9zY2lsbGF0b3JzLlNxdWFyZS5idWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICBmb3IoIGxldCBpID0gMTAyMzsgaSA+PSAwOyBpLS0gKSB7IFxuICAgIE9zY2lsbGF0b3JzLlNxdWFyZS5idWZmZXIgWyBpIF0gPSBpIC8gMTAyNCA+IC41ID8gMSA6IC0xXG4gIH1cblxuICBPc2NpbGxhdG9ycy5UcmlhbmdsZS5idWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICBcbiAgZm9yKCBsZXQgaSA9IDEwMjQ7IGktLTsgaSA9IGkgKSB7IE9zY2lsbGF0b3JzLlRyaWFuZ2xlLmJ1ZmZlcltpXSA9IDEgLSA0ICogTWF0aC5hYnMoKCAoaSAvIDEwMjQpICsgMC4yNSkgJSAxIC0gMC41KTsgfVxuXG4gIE9zY2lsbGF0b3JzLmRlZmF1bHRzID0ge1xuICAgIGZyZXF1ZW5jeTogNDQwLFxuICAgIGdhaW46IDFcbiAgfVxuXG4gIHJldHVybiBPc2NpbGxhdG9yc1xuXG59XG4iLCJjb25zdCBnZW5pc2ggPSByZXF1aXJlKCdnZW5pc2guanMnKSxcbiAgICAgIHNzZCA9IGdlbmlzaC5oaXN0b3J5LFxuICAgICAgZGF0YSA9IGdlbmlzaC5kYXRhLFxuICAgICAgbm9pc2UgPSBnZW5pc2gubm9pc2U7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBcInVzZSBqc2RzcFwiO1xuXG4gIGNvbnN0IGIgPSBkYXRhKDgsIDEsIHsgbWV0YTogdHJ1ZSB9KTtcbiAgY29uc3Qgd2hpdGUgPSBnZW5pc2guc3ViKGdlbmlzaC5tdWwobm9pc2UoKSwgMiksIDEpO1xuXG4gIGJbMF0gPSBnZW5pc2guYWRkKGdlbmlzaC5tdWwoLjk5ODg2LCBiWzBdKSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjA1NTUxNzkpKTtcbiAgYlsxXSA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bCguOTkzMzIsIGJbMV0pLCBnZW5pc2gubXVsKHdoaXRlLCAuMDc1MDU3OSkpO1xuICBiWzJdID0gZ2VuaXNoLmFkZChnZW5pc2gubXVsKC45NjkwMCwgYlsyXSksIGdlbmlzaC5tdWwod2hpdGUsIC4xNTM4NTIwKSk7XG4gIGJbM10gPSBnZW5pc2guYWRkKGdlbmlzaC5tdWwoLjg4NjUwLCBiWzNdKSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjMxMDQ4NTYpKTtcbiAgYls0XSA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bCguNTUwMDAsIGJbNF0pLCBnZW5pc2gubXVsKHdoaXRlLCAuNTMyOTUyMikpO1xuICBiWzVdID0gZ2VuaXNoLnN1YihnZW5pc2gubXVsKC0uNzYxNiwgYls1XSksIGdlbmlzaC5tdWwod2hpdGUsIC4wMTY4OTgwKSk7XG5cbiAgY29uc3Qgb3V0ID0gZ2VuaXNoLm11bChnZW5pc2guYWRkKGdlbmlzaC5hZGQoZ2VuaXNoLmFkZChnZW5pc2guYWRkKGdlbmlzaC5hZGQoZ2VuaXNoLmFkZChnZW5pc2guYWRkKGJbMF0sIGJbMV0pLCBiWzJdKSwgYlszXSksIGJbNF0pLCBiWzVdKSwgYls2XSksIGdlbmlzaC5tdWwod2hpdGUsIC41MzYyKSksIC4xMSk7XG5cbiAgYls2XSA9IGdlbmlzaC5tdWwod2hpdGUsIC4xMTU5MjYpO1xuXG4gIHJldHVybiBvdXQ7XG59OyIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IFdhdmV0YWJsZSA9IGZ1bmN0aW9uKCBpbnB1dFByb3BzICkge1xuICAgIGNvbnN0IHdhdmV0YWJsZSA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuICAgIGNvbnN0IHByb3BzICA9IE9iamVjdC5hc3NpZ24oe30sIEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgY29uc3Qgb3NjID0gZy53YXZldGFibGUoIGcuaW4oJ2ZyZXF1ZW5jeScpLCBwcm9wcyApXG4gICAgY29uc3QgZ3JhcGggPSBnLm11bCggXG4gICAgICBvc2MsIFxuICAgICAgZy5pbiggJ2dhaW4nIClcbiAgICApXG5cbiAgICBHaWJiZXJpc2guZmFjdG9yeSggd2F2ZXRhYmxlLCBncmFwaCwgJ3dhdmV0YWJsZScsIHByb3BzIClcblxuICAgIHJldHVybiB3YXZldGFibGVcbiAgfVxuXG4gIGcud2F2ZXRhYmxlID0gZnVuY3Rpb24oIGZyZXF1ZW5jeSwgcHJvcHMgKSB7XG4gICAgbGV0IGRhdGFQcm9wcyA9IHsgaW1tdXRhYmxlOnRydWUgfVxuXG4gICAgLy8gdXNlIGdsb2JhbCByZWZlcmVuY2VzIGlmIGFwcGxpY2FibGVcbiAgICBpZiggcHJvcHMubmFtZSAhPT0gdW5kZWZpbmVkICkgZGF0YVByb3BzLmdsb2JhbCA9IHByb3BzLm5hbWVcblxuICAgIGNvbnN0IGJ1ZmZlciA9IGcuZGF0YSggcHJvcHMuYnVmZmVyLCAxLCBkYXRhUHJvcHMgKVxuXG4gICAgcmV0dXJuIGcucGVlayggYnVmZmVyLCBnLnBoYXNvciggZnJlcXVlbmN5LCAwLCB7IG1pbjowIH0gKSApXG4gIH1cblxuICByZXR1cm4gV2F2ZXRhYmxlXG59XG4iLCJjb25zdCBRdWV1ZSA9IHJlcXVpcmUoICcuLi9leHRlcm5hbC9wcmlvcml0eXF1ZXVlLmpzJyApXG5jb25zdCBCaWcgICA9IHJlcXVpcmUoICdiaWcuanMnIClcblxubGV0IFNjaGVkdWxlciA9IHtcbiAgcGhhc2U6IDAsXG5cbiAgcXVldWU6IG5ldyBRdWV1ZSggKCBhLCBiICkgPT4ge1xuICAgIGlmKCBhLnRpbWUgPT09IGIudGltZSApIHsgLy9hLnRpbWUuZXEoIGIudGltZSApICkge1xuICAgICAgcmV0dXJuIGIucHJpb3JpdHkgLSBhLnByaW9yaXR5XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gYS50aW1lIC0gYi50aW1lIC8vYS50aW1lLm1pbnVzKCBiLnRpbWUgKVxuICAgIH1cbiAgfSksXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5xdWV1ZS5kYXRhLmxlbmd0aCA9IDBcbiAgICB0aGlzLnF1ZXVlLmxlbmd0aCA9IDBcbiAgfSxcblxuICBhZGQoIHRpbWUsIGZ1bmMsIHByaW9yaXR5ID0gMCApIHtcbiAgICB0aW1lICs9IHRoaXMucGhhc2VcblxuICAgIHRoaXMucXVldWUucHVzaCh7IHRpbWUsIGZ1bmMsIHByaW9yaXR5IH0pXG4gIH0sXG5cbiAgdGljaygpIHtcbiAgICBpZiggdGhpcy5xdWV1ZS5sZW5ndGggKSB7XG4gICAgICBsZXQgbmV4dCA9IHRoaXMucXVldWUucGVlaygpXG5cbiAgICAgIHdoaWxlKCB0aGlzLnBoYXNlID49IG5leHQudGltZSApIHtcbiAgICAgICAgbmV4dC5mdW5jKClcbiAgICAgICAgdGhpcy5xdWV1ZS5wb3AoKVxuICAgICAgICBuZXh0ID0gdGhpcy5xdWV1ZS5wZWVrKClcbiAgICAgIH1cblxuICAgIH1cblxuICAgIHRoaXMucGhhc2UrK1xuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjaGVkdWxlclxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBjb25zdCBfX3Byb3RvX18gPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuICBPYmplY3QuYXNzaWduKCBfX3Byb3RvX18sIHtcbiAgICBzdGFydCgpIHtcbiAgICAgIHRoaXMuY29ubmVjdCgpXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG4gICAgc3RvcCgpIHtcbiAgICAgIHRoaXMuZGlzY29ubmVjdCgpXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgfSlcblxuICBjb25zdCBTZXEyID0geyBcbiAgICBjcmVhdGUoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBzZXEgPSBPYmplY3QuY3JlYXRlKCBfX3Byb3RvX18gKSxcbiAgICAgICAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgU2VxMi5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG5cbiAgICAgIHNlcS5waGFzZSA9IDBcbiAgICAgIHNlcS5pbnB1dE5hbWVzID0gWyAncmF0ZScgXVxuICAgICAgc2VxLmlucHV0cyA9IFsgMSBdXG4gICAgICBzZXEubmV4dFRpbWUgPSAwXG4gICAgICBzZXEudmFsdWVzUGhhc2UgPSAwXG4gICAgICBzZXEudGltaW5nc1BoYXNlID0gMFxuICAgICAgc2VxLmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHNlcS5kaXJ0eSA9IHRydWVcbiAgICAgIHNlcS50eXBlID0gJ3NlcSdcblxuICAgICAgaWYoIHByb3BzLnRhcmdldCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICBzZXEuYW5vbkZ1bmN0aW9uID0gdHJ1ZVxuICAgICAgfWVsc2V7IFxuICAgICAgICBzZXEuYW5vbkZ1bmN0aW9uID0gZmFsc2VcbiAgICAgICAgc2VxLmNhbGxGdW5jdGlvbiA9IHR5cGVvZiBwcm9wcy50YXJnZXRbIHByb3BzLmtleSBdID09PSAnZnVuY3Rpb24nXG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5hc3NpZ24oIHNlcSwgcHJvcHMgKVxuXG4gICAgICBzZXEuY2FsbGJhY2sgPSBmdW5jdGlvbiggcmF0ZSApIHtcbiAgICAgICAgaWYoIHNlcS5waGFzZSA+PSBzZXEubmV4dFRpbWUgKSB7XG4gICAgICAgICAgbGV0IHZhbHVlID0gc2VxLnZhbHVlc1sgc2VxLnZhbHVlc1BoYXNlKysgJSBzZXEudmFsdWVzLmxlbmd0aCBdXG5cbiAgICAgICAgICBpZiggc2VxLmFub25GdW5jdGlvbiB8fCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgKSB2YWx1ZSA9IHZhbHVlKClcbiAgICAgICAgICBcbiAgICAgICAgICBpZiggc2VxLmFub25GdW5jdGlvbiA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICBpZiggc2VxLmNhbGxGdW5jdGlvbiA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICAgIHNlcS50YXJnZXRbIHNlcS5rZXkgXSA9IHZhbHVlXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgc2VxLnRhcmdldFsgc2VxLmtleSBdKCB2YWx1ZSApIFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlcS5waGFzZSAtPSBzZXEubmV4dFRpbWVcblxuICAgICAgICAgIGxldCB0aW1pbmcgPSBzZXEudGltaW5nc1sgc2VxLnRpbWluZ3NQaGFzZSsrICUgc2VxLnRpbWluZ3MubGVuZ3RoIF1cbiAgICAgICAgICBpZiggdHlwZW9mIHRpbWluZyA9PT0gJ2Z1bmN0aW9uJyApIHRpbWluZyA9IHRpbWluZygpXG5cbiAgICAgICAgICBzZXEubmV4dFRpbWUgPSB0aW1pbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHNlcS5waGFzZSArPSByYXRlXG5cbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cblxuICAgICAgc2VxLnVnZW5OYW1lID0gc2VxLmNhbGxiYWNrLnVnZW5OYW1lID0gJ3NlcV8nICsgc2VxLmlkXG4gICAgICBcbiAgICAgIGxldCB2YWx1ZSA9IHNlcS5yYXRlXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHNlcSwgJ3JhdGUnLCB7XG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHZhbHVlIH0sXG4gICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICBpZiggdmFsdWUgIT09IHYgKSB7XG4gICAgICAgICAgICBHaWJiZXJpc2guZGlydHkoIHNlcSApXG4gICAgICAgICAgICB2YWx1ZSA9IHZcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBzZXFcbiAgICB9XG4gIH1cblxuICBTZXEyLmRlZmF1bHRzID0geyByYXRlOiAxIH1cblxuICByZXR1cm4gU2VxMi5jcmVhdGVcblxufVxuXG4iLCJjb25zdCBRdWV1ZSA9IHJlcXVpcmUoICcuLi9leHRlcm5hbC9wcmlvcml0eXF1ZXVlLmpzJyApXG5jb25zdCBCaWcgICA9IHJlcXVpcmUoICdiaWcuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG5sZXQgU2VxdWVuY2VyID0gcHJvcHMgPT4ge1xuICBsZXQgc2VxID0ge1xuICAgIF9faXNSdW5uaW5nOmZhbHNlLFxuICAgIGtleTogcHJvcHMua2V5LCBcbiAgICB0YXJnZXQ6ICBwcm9wcy50YXJnZXQsXG4gICAgdmFsdWVzOiAgcHJvcHMudmFsdWVzLFxuICAgIHRpbWluZ3M6IHByb3BzLnRpbWluZ3MsXG4gICAgX192YWx1ZXNQaGFzZTogIDAsXG4gICAgX190aW1pbmdzUGhhc2U6IDAsXG4gICAgcHJpb3JpdHk6IHByb3BzLnByaW9yaXR5ID09PSB1bmRlZmluZWQgPyAwIDogcHJvcHMucHJpb3JpdHksXG5cbiAgICB0aWNrKCkge1xuICAgICAgbGV0IHZhbHVlICA9IHNlcS52YWx1ZXNbICBzZXEuX192YWx1ZXNQaGFzZSsrICAlIHNlcS52YWx1ZXMubGVuZ3RoICBdLFxuICAgICAgICAgIHRpbWluZyA9IHNlcS50aW1pbmdzWyBzZXEuX190aW1pbmdzUGhhc2UrKyAlIHNlcS50aW1pbmdzLmxlbmd0aCBdXG5cbiAgICAgIGlmKCB0eXBlb2YgdGltaW5nID09PSAnZnVuY3Rpb24nICkgdGltaW5nID0gdGltaW5nKClcblxuICAgICAgaWYoIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBzZXEudGFyZ2V0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHZhbHVlKClcbiAgICAgIH1lbHNlIGlmKCB0eXBlb2Ygc2VxLnRhcmdldFsgc2VxLmtleSBdID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgICBpZiggdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICkgdmFsdWUgPSB2YWx1ZSgpXG4gICAgICAgIHNlcS50YXJnZXRbIHNlcS5rZXkgXSggdmFsdWUgKVxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgKSB2YWx1ZSA9IHZhbHVlKClcbiAgICAgICAgc2VxLnRhcmdldFsgc2VxLmtleSBdID0gdmFsdWVcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYoIHNlcS5fX2lzUnVubmluZyA9PT0gdHJ1ZSApIHtcbiAgICAgICAgR2liYmVyaXNoLnNjaGVkdWxlci5hZGQoIHRpbWluZywgc2VxLnRpY2ssIHNlcS5wcmlvcml0eSApXG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0YXJ0KCBkZWxheSA9IDAgKSB7XG4gICAgICBzZXEuX19pc1J1bm5pbmcgPSB0cnVlXG4gICAgICBHaWJiZXJpc2guc2NoZWR1bGVyLmFkZCggZGVsYXksIHNlcS50aWNrLCBzZXEucHJpb3JpdHkgKVxuICAgICAgcmV0dXJuIHNlcVxuICAgIH0sXG5cbiAgICBzdG9wKCkge1xuICAgICAgc2VxLl9faXNSdW5uaW5nID0gZmFsc2VcbiAgICAgIHJldHVybiBzZXFcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc2VxIFxufVxuXG5TZXF1ZW5jZXIubWFrZSA9IGZ1bmN0aW9uKCB2YWx1ZXMsIHRpbWluZ3MsIHRhcmdldCwga2V5ICkge1xuICByZXR1cm4gU2VxdWVuY2VyKHsgdmFsdWVzLCB0aW1pbmdzLCB0YXJnZXQsIGtleSB9KVxufVxuXG5yZXR1cm4gU2VxdWVuY2VyXG5cbn1cbiIsImxldCB1Z2VuID0ge1xuICBmcmVlKCkge1xuICAgIEdpYmJlcmlzaC5nZW5pc2guZ2VuLmZyZWUoIHRoaXMuZ3JhcGggKVxuICB9LFxuXG4gIHByaW50KCkge1xuICAgIGNvbnNvbGUubG9nKCB0aGlzLmNhbGxiYWNrLnRvU3RyaW5nKCkgKVxuICB9LFxuXG4gIGNvbm5lY3QoIHRhcmdldCwgbGV2ZWw9MSApIHtcbiAgICBpZiggdGhpcy5jb25uZWN0ZWQgPT09IHVuZGVmaW5lZCApIHRoaXMuY29ubmVjdGVkID0gW11cblxuICAgIGxldCBpbnB1dCA9IGxldmVsID09PSAxID8gdGhpcyA6IEdpYmJlcmlzaC5iaW5vcHMuTXVsKCB0aGlzLCBsZXZlbCApXG5cbiAgICBpZiggdGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsICkgdGFyZ2V0ID0gR2liYmVyaXNoLm91dHB1dCBcblxuXG4gICAgaWYoIHR5cGVvZiB0YXJnZXQuX19hZGRJbnB1dCA9PSAnZnVuY3Rpb24nICkge1xuICAgICAgLy9jb25zb2xlLmxvZyggJ19fYWRkSW5wdXQnLCBpbnB1dC5pc1N0ZXJlbyApXG4gICAgICAvL3RhcmdldC5fX2FkZElucHV0KCBpbnB1dCApXG4gICAgfSBlbHNlIGlmKCB0YXJnZXQuc3VtICYmIHRhcmdldC5zdW0uaW5wdXRzICkge1xuICAgICAgdGFyZ2V0LnN1bS5pbnB1dHMucHVzaCggaW5wdXQgKVxuICAgIH0gZWxzZSBpZiggdGFyZ2V0LmlucHV0cyApIHtcbiAgICAgIHRhcmdldC5pbnB1dHMucHVzaCggaW5wdXQgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXQuaW5wdXQgPSBpbnB1dFxuICAgIH1cblxuICAgIEdpYmJlcmlzaC5kaXJ0eSggdGFyZ2V0IClcblxuICAgIHRoaXMuY29ubmVjdGVkLnB1c2goWyB0YXJnZXQsIGlucHV0IF0pXG4gICAgXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcblxuICBkaXNjb25uZWN0KCB0YXJnZXQgKSB7XG4gICAgaWYoIHRhcmdldCA9PT0gdW5kZWZpbmVkICl7XG4gICAgICBmb3IoIGxldCBjb25uZWN0aW9uIG9mIHRoaXMuY29ubmVjdGVkICkge1xuICAgICAgICBjb25uZWN0aW9uWzBdLmRpc2Nvbm5lY3RVZ2VuKCBjb25uZWN0aW9uWzFdIClcbiAgICAgIH1cbiAgICAgIHRoaXMuY29ubmVjdGVkLmxlbmd0aCA9IDBcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSB0aGlzLmNvbm5lY3RlZC5maW5kKCB2ID0+IHZbMF0gPT09IHRhcmdldCApXG4gICAgICB0YXJnZXQuZGlzY29ubmVjdFVnZW4oIGNvbm5lY3Rpb25bMV0gKVxuICAgICAgY29uc3QgdGFyZ2V0SWR4ID0gdGhpcy5jb25uZWN0ZWQuaW5kZXhPZiggY29ubmVjdGlvbiApXG4gICAgICB0aGlzLmNvbm5lY3RlZC5zcGxpY2UoIHRhcmdldElkeCwgMSApXG4gICAgfVxuICB9LFxuXG4gIGNoYWluKCB0YXJnZXQsIGxldmVsPTEgKSB7XG4gICAgdGhpcy5jb25uZWN0KCB0YXJnZXQsbGV2ZWwgKVxuXG4gICAgcmV0dXJuIHRhcmdldFxuICB9LFxuXG4gIF9fcmVkb0dyYXBoKCkge1xuICAgIHRoaXMuX19jcmVhdGVHcmFwaCgpXG4gICAgdGhpcy5jYWxsYmFjayA9IEdpYmJlcmlzaC5nZW5pc2guZ2VuLmNyZWF0ZUNhbGxiYWNrKCB0aGlzLmdyYXBoLCBHaWJiZXJpc2gubWVtb3J5LCBmYWxzZSwgdHJ1ZSApXG4gICAgdGhpcy5pbnB1dE5hbWVzID0gR2liYmVyaXNoLmdlbmlzaC5nZW4ucGFyYW1ldGVycy5zbGljZSgwKVxuICAgIHRoaXMuY2FsbGJhY2sudWdlbk5hbWUgPSB0aGlzLnVnZW5OYW1lXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gdWdlblxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBsZXQgdWlkID0gMFxuXG4gIGxldCBmYWN0b3J5ID0gZnVuY3Rpb24oIHVnZW4sIGdyYXBoLCBuYW1lLCB2YWx1ZXMsIGNiICkge1xuICAgIHVnZW4uY2FsbGJhY2sgPSBjYiA9PT0gdW5kZWZpbmVkID8gR2liYmVyaXNoLmdlbmlzaC5nZW4uY3JlYXRlQ2FsbGJhY2soIGdyYXBoLCBHaWJiZXJpc2gubWVtb3J5LCBmYWxzZSwgdHJ1ZSApIDogY2JcblxuICAgIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICAgIHR5cGU6ICd1Z2VuJyxcbiAgICAgIGlkOiBmYWN0b3J5LmdldFVJRCgpLCBcbiAgICAgIHVnZW5OYW1lOiBuYW1lICsgJ18nLFxuICAgICAgZ3JhcGg6IGdyYXBoLFxuICAgICAgaW5wdXROYW1lczogR2liYmVyaXNoLmdlbmlzaC5nZW4ucGFyYW1ldGVycy5zbGljZSgwKSxcbiAgICAgIGlzU3RlcmVvOiBBcnJheS5pc0FycmF5KCBncmFwaCApLFxuICAgICAgZGlydHk6IHRydWVcbiAgICB9KVxuICAgIFxuICAgIHVnZW4udWdlbk5hbWUgKz0gdWdlbi5pZFxuICAgIHVnZW4uY2FsbGJhY2sudWdlbk5hbWUgPSB1Z2VuLnVnZW5OYW1lIC8vIFhYWCBoYWNreVxuXG4gICAgZm9yKCBsZXQgcGFyYW0gb2YgdWdlbi5pbnB1dE5hbWVzICkge1xuICAgICAgaWYoIHBhcmFtID09PSAnbWVtb3J5JyApIGNvbnRpbnVlXG5cbiAgICAgIGxldCB2YWx1ZSA9IHZhbHVlc1sgcGFyYW0gXVxuXG4gICAgICAvLyBUT0RPOiBkbyB3ZSBuZWVkIHRvIGNoZWNrIGZvciBhIHNldHRlcj9cbiAgICAgIGxldCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciggdWdlbiwgcGFyYW0gKSxcbiAgICAgICAgICBzZXR0ZXJcblxuICAgICAgaWYoIGRlc2MgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc2V0dGVyID0gZGVzYy5zZXRcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCBwYXJhbSwge1xuICAgICAgICBnZXQoKSB7IHJldHVybiB2YWx1ZSB9LFxuICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgaWYoIHZhbHVlICE9PSB2ICkge1xuICAgICAgICAgICAgR2liYmVyaXNoLmRpcnR5KCB1Z2VuIClcbiAgICAgICAgICAgIGlmKCBzZXR0ZXIgIT09IHVuZGVmaW5lZCApIHNldHRlciggdiApXG4gICAgICAgICAgICB2YWx1ZSA9IHZcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYoIHVnZW4uX19yZXF1aXJlc1JlY29tcGlsYXRpb24gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHVnZW4uX19yZXF1aXJlc1JlY29tcGlsYXRpb24uZm9yRWFjaCggcHJvcCA9PiB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHVnZW5bIHByb3AgXVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sIHByb3AsIHtcbiAgICAgICAgICBnZXQoKSB7IHJldHVybiB2YWx1ZSB9LFxuICAgICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICAgIGlmKCB2YWx1ZSAhPT0gdiApIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSB2XG4gICAgICAgICAgICAgIHRoaXMuX19yZWRvR3JhcGgoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0pICAgICAgXG4gICAgfVxuICAgIHJldHVybiB1Z2VuXG4gIH1cblxuICBmYWN0b3J5LmdldFVJRCA9ICgpID0+IHVpZCsrXG5cbiAgcmV0dXJuIGZhY3Rvcnlcbn1cbiIsImxldCBnZW5pc2ggPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxubGV0IHV0aWxpdGllcyA9IHtcbiAgY3JlYXRlQ29udGV4dCggY3R4LCBjYiApIHtcbiAgICBsZXQgQUMgPSB0eXBlb2YgQXVkaW9Db250ZXh0ID09PSAndW5kZWZpbmVkJyA/IHdlYmtpdEF1ZGlvQ29udGV4dCA6IEF1ZGlvQ29udGV4dFxuXG4gICAgbGV0IHN0YXJ0ID0gKCkgPT4ge1xuICAgICAgaWYoIHR5cGVvZiBBQyAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgIEdpYmJlcmlzaC5jdHggPSBjdHggPT09IHVuZGVmaW5lZCA/IG5ldyBBQygpIDogY3R4XG4gICAgICAgIGdlbmlzaC5nZW4uc2FtcGxlcmF0ZSA9IEdpYmJlcmlzaC5jdHguc2FtcGxlUmF0ZVxuICAgICAgICBnZW5pc2gudXRpbGl0aWVzLmN0eCA9IEdpYmJlcmlzaC5jdHhcblxuICAgICAgICBpZiggZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG5cbiAgICAgICAgICBpZiggJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICl7IC8vIHJlcXVpcmVkIHRvIHN0YXJ0IGF1ZGlvIHVuZGVyIGlPUyA2XG4gICAgICAgICAgICBsZXQgbXlTb3VyY2UgPSB1dGlsaXRpZXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICAgICAgICBteVNvdXJjZS5jb25uZWN0KCB1dGlsaXRpZXMuY3R4LmRlc3RpbmF0aW9uIClcbiAgICAgICAgICAgIG15U291cmNlLm5vdGVPbiggMCApXG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIHN0YXJ0IClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiggdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nICkgY2IoKVxuICAgIH1cblxuICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuICAgIH1lbHNle1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBzdGFydCApXG4gICAgfVxuXG4gICAgcmV0dXJuIEdpYmJlcmlzaC5jdHhcbiAgfSxcblxuICBjcmVhdGVTY3JpcHRQcm9jZXNzb3IoKSB7XG4gICAgR2liYmVyaXNoLm5vZGUgPSBHaWJiZXJpc2guY3R4LmNyZWF0ZVNjcmlwdFByb2Nlc3NvciggMTAyNCwgMCwgMiApLFxuICAgIEdpYmJlcmlzaC5jbGVhckZ1bmN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiAwIH0sXG4gICAgR2liYmVyaXNoLmNhbGxiYWNrID0gR2liYmVyaXNoLmNsZWFyRnVuY3Rpb25cblxuICAgIEdpYmJlcmlzaC5ub2RlLm9uYXVkaW9wcm9jZXNzID0gZnVuY3Rpb24oIGF1ZGlvUHJvY2Vzc2luZ0V2ZW50ICkge1xuICAgICAgbGV0IGdpYmJlcmlzaCA9IEdpYmJlcmlzaCxcbiAgICAgICAgICBjYWxsYmFjayAgPSBnaWJiZXJpc2guY2FsbGJhY2ssXG4gICAgICAgICAgb3V0cHV0QnVmZmVyID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQub3V0cHV0QnVmZmVyLFxuICAgICAgICAgIHNjaGVkdWxlciA9IEdpYmJlcmlzaC5zY2hlZHVsZXIsXG4gICAgICAgICAgLy9vYmpzID0gZ2liYmVyaXNoLmNhbGxiYWNrVWdlbnMuc2xpY2UoIDAgKSxcbiAgICAgICAgICBsZW5ndGhcblxuICAgICAgbGV0IGxlZnQgPSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDAgKSxcbiAgICAgICAgICByaWdodD0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAxIClcblxuICAgICAgbGV0IGNhbGxiYWNrbGVuZ3RoID0gR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLmxlbmd0aFxuICAgICAgXG4gICAgICBpZiggY2FsbGJhY2tsZW5ndGggIT09IDAgKSB7XG4gICAgICAgIGZvciggbGV0IGk9MDsgaTwgY2FsbGJhY2tsZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3NbIGkgXSgpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBjYW4ndCBqdXN0IHNldCBsZW5ndGggdG8gMCBhcyBjYWxsYmFja3MgbWlnaHQgYmUgYWRkZWQgZHVyaW5nIGZvciBsb29wLCBzbyBzcGxpY2UgcHJlLWV4aXN0aW5nIGZ1bmN0aW9uc1xuICAgICAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3Muc3BsaWNlKCAwLCBjYWxsYmFja2xlbmd0aCApXG4gICAgICB9XG5cbiAgICAgIGZvciAobGV0IHNhbXBsZSA9IDAsIGxlbmd0aCA9IGxlZnQubGVuZ3RoOyBzYW1wbGUgPCBsZW5ndGg7IHNhbXBsZSsrKSB7XG4gICAgICAgIHNjaGVkdWxlci50aWNrKClcblxuICAgICAgICBpZiggZ2liYmVyaXNoLmdyYXBoSXNEaXJ0eSApIHsgXG4gICAgICAgICAgY2FsbGJhY2sgPSBnaWJiZXJpc2guZ2VuZXJhdGVDYWxsYmFjaygpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFhYWCBjYW50IHVzZSBkZXN0cnVjdHVyaW5nLCBiYWJlbCBtYWtlcyBpdCBzb21ldGhpbmcgaW5lZmZpY2llbnQuLi5cbiAgICAgICAgbGV0IG91dCA9IGNhbGxiYWNrLmFwcGx5KCBudWxsLCBnaWJiZXJpc2guY2FsbGJhY2tVZ2VucyApXG5cbiAgICAgICAgbGVmdFsgc2FtcGxlICBdID0gb3V0WzBdXG4gICAgICAgIHJpZ2h0WyBzYW1wbGUgXSA9IG91dFsxXVxuICAgICAgfVxuICAgIH1cblxuICAgIEdpYmJlcmlzaC5ub2RlLmNvbm5lY3QoIEdpYmJlcmlzaC5jdHguZGVzdGluYXRpb24gKVxuXG4gICAgcmV0dXJuIEdpYmJlcmlzaC5ub2RlXG4gIH0sIFxufVxuXG5yZXR1cm4gdXRpbGl0aWVzXG59XG4iLCIvKiBiaWcuanMgdjMuMS4zIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZy5qcy9MSUNFTkNFICovXHJcbjsoZnVuY3Rpb24gKGdsb2JhbCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuLypcclxuICBiaWcuanMgdjMuMS4zXHJcbiAgQSBzbWFsbCwgZmFzdCwgZWFzeS10by11c2UgbGlicmFyeSBmb3IgYXJiaXRyYXJ5LXByZWNpc2lvbiBkZWNpbWFsIGFyaXRobWV0aWMuXHJcbiAgaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnLmpzL1xyXG4gIENvcHlyaWdodCAoYykgMjAxNCBNaWNoYWVsIE1jbGF1Z2hsaW4gPE04Y2g4OGxAZ21haWwuY29tPlxyXG4gIE1JVCBFeHBhdCBMaWNlbmNlXHJcbiovXHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogRURJVEFCTEUgREVGQVVMVFMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlcyBiZWxvdyBtdXN0IGJlIGludGVnZXJzIHdpdGhpbiB0aGUgc3RhdGVkIHJhbmdlcy5cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIG1heGltdW0gbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIG9mIHRoZSByZXN1bHRzIG9mIG9wZXJhdGlvbnNcclxuICAgICAqIGludm9sdmluZyBkaXZpc2lvbjogZGl2IGFuZCBzcXJ0LCBhbmQgcG93IHdpdGggbmVnYXRpdmUgZXhwb25lbnRzLlxyXG4gICAgICovXHJcbiAgICB2YXIgRFAgPSAyMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIE1BWF9EUFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSByb3VuZGluZyBtb2RlIHVzZWQgd2hlbiByb3VuZGluZyB0byB0aGUgYWJvdmUgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAwIFRvd2FyZHMgemVybyAoaS5lLiB0cnVuY2F0ZSwgbm8gcm91bmRpbmcpLiAgICAgICAoUk9VTkRfRE9XTilcclxuICAgICAgICAgKiAxIFRvIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgcm91bmQgdXAuICAoUk9VTkRfSEFMRl9VUClcclxuICAgICAgICAgKiAyIFRvIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG8gZXZlbi4gICAoUk9VTkRfSEFMRl9FVkVOKVxyXG4gICAgICAgICAqIDMgQXdheSBmcm9tIHplcm8uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChST1VORF9VUClcclxuICAgICAgICAgKi9cclxuICAgICAgICBSTSA9IDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAsIDEsIDIgb3IgM1xyXG5cclxuICAgICAgICAvLyBUaGUgbWF4aW11bSB2YWx1ZSBvZiBEUCBhbmQgQmlnLkRQLlxyXG4gICAgICAgIE1BWF9EUCA9IDFFNiwgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byAxMDAwMDAwXHJcblxyXG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIG1hZ25pdHVkZSBvZiB0aGUgZXhwb25lbnQgYXJndW1lbnQgdG8gdGhlIHBvdyBtZXRob2QuXHJcbiAgICAgICAgTUFYX1BPV0VSID0gMUU2LCAgICAgICAgICAgICAgICAgICAvLyAxIHRvIDEwMDAwMDBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGJlbmVhdGggd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqIEphdmFTY3JpcHQncyBOdW1iZXIgdHlwZTogLTdcclxuICAgICAgICAgKiAtMTAwMDAwMCBpcyB0aGUgbWluaW11bSByZWNvbW1lbmRlZCBleHBvbmVudCB2YWx1ZSBvZiBhIEJpZy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBFX05FRyA9IC03LCAgICAgICAgICAgICAgICAgICAvLyAwIHRvIC0xMDAwMDAwXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBhYm92ZSB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICogSmF2YVNjcmlwdCdzIE51bWJlciB0eXBlOiAyMVxyXG4gICAgICAgICAqIDEwMDAwMDAgaXMgdGhlIG1heGltdW0gcmVjb21tZW5kZWQgZXhwb25lbnQgdmFsdWUgb2YgYSBCaWcuXHJcbiAgICAgICAgICogKFRoaXMgbGltaXQgaXMgbm90IGVuZm9yY2VkIG9yIGNoZWNrZWQuKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEVfUE9TID0gMjEsICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gMTAwMDAwMFxyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgICAgICAgLy8gVGhlIHNoYXJlZCBwcm90b3R5cGUgb2JqZWN0LlxyXG4gICAgICAgIFAgPSB7fSxcclxuICAgICAgICBpc1ZhbGlkID0gL14tPyhcXGQrKFxcLlxcZCopP3xcXC5cXGQrKShlWystXT9cXGQrKT8kL2ksXHJcbiAgICAgICAgQmlnO1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBCaWcgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBiaWdGYWN0b3J5KCkge1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBCaWcgY29uc3RydWN0b3IgYW5kIGV4cG9ydGVkIGZ1bmN0aW9uLlxyXG4gICAgICAgICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgbmV3IGluc3RhbmNlIG9mIGEgQmlnIG51bWJlciBvYmplY3QuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBuIHtudW1iZXJ8c3RyaW5nfEJpZ30gQSBudW1lcmljIHZhbHVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIEJpZyhuKSB7XHJcbiAgICAgICAgICAgIHZhciB4ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIC8vIEVuYWJsZSBjb25zdHJ1Y3RvciB1c2FnZSB3aXRob3V0IG5ldy5cclxuICAgICAgICAgICAgaWYgKCEoeCBpbnN0YW5jZW9mIEJpZykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuID09PSB2b2lkIDAgPyBiaWdGYWN0b3J5KCkgOiBuZXcgQmlnKG4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEdXBsaWNhdGUuXHJcbiAgICAgICAgICAgIGlmIChuIGluc3RhbmNlb2YgQmlnKSB7XHJcbiAgICAgICAgICAgICAgICB4LnMgPSBuLnM7XHJcbiAgICAgICAgICAgICAgICB4LmUgPSBuLmU7XHJcbiAgICAgICAgICAgICAgICB4LmMgPSBuLmMuc2xpY2UoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBhcnNlKHgsIG4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBSZXRhaW4gYSByZWZlcmVuY2UgdG8gdGhpcyBCaWcgY29uc3RydWN0b3IsIGFuZCBzaGFkb3dcclxuICAgICAgICAgICAgICogQmlnLnByb3RvdHlwZS5jb25zdHJ1Y3RvciB3aGljaCBwb2ludHMgdG8gT2JqZWN0LlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgeC5jb25zdHJ1Y3RvciA9IEJpZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEJpZy5wcm90b3R5cGUgPSBQO1xyXG4gICAgICAgIEJpZy5EUCA9IERQO1xyXG4gICAgICAgIEJpZy5STSA9IFJNO1xyXG4gICAgICAgIEJpZy5FX05FRyA9IEVfTkVHO1xyXG4gICAgICAgIEJpZy5FX1BPUyA9IEVfUE9TO1xyXG5cclxuICAgICAgICByZXR1cm4gQmlnO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBQcml2YXRlIGZ1bmN0aW9uc1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgQmlnIHggaW4gbm9ybWFsIG9yIGV4cG9uZW50aWFsXHJcbiAgICAgKiBub3RhdGlvbiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBvciBzaWduaWZpY2FudCBkaWdpdHMuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBUaGUgQmlnIHRvIGZvcm1hdC5cclxuICAgICAqIGRwIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIHRvRSB7bnVtYmVyfSAxICh0b0V4cG9uZW50aWFsKSwgMiAodG9QcmVjaXNpb24pIG9yIHVuZGVmaW5lZCAodG9GaXhlZCkuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGZvcm1hdCh4LCBkcCwgdG9FKSB7XHJcbiAgICAgICAgdmFyIEJpZyA9IHguY29uc3RydWN0b3IsXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgaW5kZXggKG5vcm1hbCBub3RhdGlvbikgb2YgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIGkgPSBkcCAtICh4ID0gbmV3IEJpZyh4KSkuZSxcclxuICAgICAgICAgICAgYyA9IHguYztcclxuXHJcbiAgICAgICAgLy8gUm91bmQ/XHJcbiAgICAgICAgaWYgKGMubGVuZ3RoID4gKytkcCkge1xyXG4gICAgICAgICAgICBybmQoeCwgaSwgQmlnLlJNKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghY1swXSkge1xyXG4gICAgICAgICAgICArK2k7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0b0UpIHtcclxuICAgICAgICAgICAgaSA9IGRwO1xyXG5cclxuICAgICAgICAvLyB0b0ZpeGVkXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYyA9IHguYztcclxuXHJcbiAgICAgICAgICAgIC8vIFJlY2FsY3VsYXRlIGkgYXMgeC5lIG1heSBoYXZlIGNoYW5nZWQgaWYgdmFsdWUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgaSA9IHguZSArIGkgKyAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIHplcm9zP1xyXG4gICAgICAgIGZvciAoOyBjLmxlbmd0aCA8IGk7IGMucHVzaCgwKSkge1xyXG4gICAgICAgIH1cclxuICAgICAgICBpID0geC5lO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIHRvUHJlY2lzaW9uIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhlIG51bWJlciBvZlxyXG4gICAgICAgICAqIHNpZ25pZmljYW50IGRpZ2l0cyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzXHJcbiAgICAgICAgICogbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgaW50ZWdlciBwYXJ0IG9mIHRoZSB2YWx1ZSBpbiBub3JtYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICByZXR1cm4gdG9FID09PSAxIHx8IHRvRSAmJiAoZHAgPD0gaSB8fCBpIDw9IEJpZy5FX05FRykgP1xyXG5cclxuICAgICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgKHgucyA8IDAgJiYgY1swXSA/ICctJyA6ICcnKSArXHJcbiAgICAgICAgICAgIChjLmxlbmd0aCA+IDEgPyBjWzBdICsgJy4nICsgYy5qb2luKCcnKS5zbGljZSgxKSA6IGNbMF0pICtcclxuICAgICAgICAgICAgICAoaSA8IDAgPyAnZScgOiAnZSsnKSArIGlcclxuXHJcbiAgICAgICAgICAvLyBOb3JtYWwgbm90YXRpb24uXHJcbiAgICAgICAgICA6IHgudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFBhcnNlIHRoZSBudW1iZXIgb3Igc3RyaW5nIHZhbHVlIHBhc3NlZCB0byBhIEJpZyBjb25zdHJ1Y3Rvci5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IEEgQmlnIG51bWJlciBpbnN0YW5jZS5cclxuICAgICAqIG4ge251bWJlcnxzdHJpbmd9IEEgbnVtZXJpYyB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcGFyc2UoeCwgbikge1xyXG4gICAgICAgIHZhciBlLCBpLCBuTDtcclxuXHJcbiAgICAgICAgLy8gTWludXMgemVybz9cclxuICAgICAgICBpZiAobiA9PT0gMCAmJiAxIC8gbiA8IDApIHtcclxuICAgICAgICAgICAgbiA9ICctMCc7XHJcblxyXG4gICAgICAgIC8vIEVuc3VyZSBuIGlzIHN0cmluZyBhbmQgY2hlY2sgdmFsaWRpdHkuXHJcbiAgICAgICAgfSBlbHNlIGlmICghaXNWYWxpZC50ZXN0KG4gKz0gJycpKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgc2lnbi5cclxuICAgICAgICB4LnMgPSBuLmNoYXJBdCgwKSA9PSAnLScgPyAobiA9IG4uc2xpY2UoMSksIC0xKSA6IDE7XHJcblxyXG4gICAgICAgIC8vIERlY2ltYWwgcG9pbnQ/XHJcbiAgICAgICAgaWYgKChlID0gbi5pbmRleE9mKCcuJykpID4gLTEpIHtcclxuICAgICAgICAgICAgbiA9IG4ucmVwbGFjZSgnLicsICcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIGZvcm0/XHJcbiAgICAgICAgaWYgKChpID0gbi5zZWFyY2goL2UvaSkpID4gMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGV4cG9uZW50LlxyXG4gICAgICAgICAgICBpZiAoZSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGUgPSBpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUgKz0gK24uc2xpY2UoaSArIDEpO1xyXG4gICAgICAgICAgICBuID0gbi5zdWJzdHJpbmcoMCwgaSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEludGVnZXIuXHJcbiAgICAgICAgICAgIGUgPSBuLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBsZWFkaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoaSA9IDA7IG4uY2hhckF0KGkpID09ICcwJzsgaSsrKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSA9PSAobkwgPSBuLmxlbmd0aCkpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgIHguYyA9IFsgeC5lID0gMCBdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoOyBuLmNoYXJBdCgtLW5MKSA9PSAnMCc7KSB7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHguZSA9IGUgLSBpIC0gMTtcclxuICAgICAgICAgICAgeC5jID0gW107XHJcblxyXG4gICAgICAgICAgICAvLyBDb252ZXJ0IHN0cmluZyB0byBhcnJheSBvZiBkaWdpdHMgd2l0aG91dCBsZWFkaW5nL3RyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKGUgPSAwOyBpIDw9IG5MOyB4LmNbZSsrXSA9ICtuLmNoYXJBdChpKyspKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUm91bmQgQmlnIHggdG8gYSBtYXhpbXVtIG9mIGRwIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgcm0uXHJcbiAgICAgKiBDYWxsZWQgYnkgZGl2LCBzcXJ0IGFuZCByb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IFRoZSBCaWcgdG8gcm91bmQuXHJcbiAgICAgKiBkcCB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiBybSB7bnVtYmVyfSAwLCAxLCAyIG9yIDMgKERPV04sIEhBTEZfVVAsIEhBTEZfRVZFTiwgVVApXHJcbiAgICAgKiBbbW9yZV0ge2Jvb2xlYW59IFdoZXRoZXIgdGhlIHJlc3VsdCBvZiBkaXZpc2lvbiB3YXMgdHJ1bmNhdGVkLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBybmQoeCwgZHAsIHJtLCBtb3JlKSB7XHJcbiAgICAgICAgdmFyIHUsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICBpID0geC5lICsgZHAgKyAxO1xyXG5cclxuICAgICAgICBpZiAocm0gPT09IDEpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHhjW2ldIGlzIHRoZSBkaWdpdCBhZnRlciB0aGUgZGlnaXQgdGhhdCBtYXkgYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgbW9yZSA9IHhjW2ldID49IDU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChybSA9PT0gMikge1xyXG4gICAgICAgICAgICBtb3JlID0geGNbaV0gPiA1IHx8IHhjW2ldID09IDUgJiZcclxuICAgICAgICAgICAgICAobW9yZSB8fCBpIDwgMCB8fCB4Y1tpICsgMV0gIT09IHUgfHwgeGNbaSAtIDFdICYgMSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChybSA9PT0gMykge1xyXG4gICAgICAgICAgICBtb3JlID0gbW9yZSB8fCB4Y1tpXSAhPT0gdSB8fCBpIDwgMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBtb3JlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAocm0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKCchQmlnLlJNIScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSA8IDEgfHwgIXhjWzBdKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobW9yZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIDEsIDAuMSwgMC4wMSwgMC4wMDEsIDAuMDAwMSBldGMuXHJcbiAgICAgICAgICAgICAgICB4LmUgPSAtZHA7XHJcbiAgICAgICAgICAgICAgICB4LmMgPSBbMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgICAgIHguYyA9IFt4LmUgPSAwXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgYW55IGRpZ2l0cyBhZnRlciB0aGUgcmVxdWlyZWQgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgICAgICAgIHhjLmxlbmd0aCA9IGktLTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJvdW5kIHVwP1xyXG4gICAgICAgICAgICBpZiAobW9yZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJvdW5kaW5nIHVwIG1heSBtZWFuIHRoZSBwcmV2aW91cyBkaWdpdCBoYXMgdG8gYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgICAgIGZvciAoOyArK3hjW2ldID4gOTspIHtcclxuICAgICAgICAgICAgICAgICAgICB4Y1tpXSA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsreC5lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4Yy51bnNoaWZ0KDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKGkgPSB4Yy5sZW5ndGg7ICF4Y1stLWldOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFRocm93IGEgQmlnRXJyb3IuXHJcbiAgICAgKlxyXG4gICAgICogbWVzc2FnZSB7c3RyaW5nfSBUaGUgZXJyb3IgbWVzc2FnZS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdGhyb3dFcnIobWVzc2FnZSkge1xyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IobWVzc2FnZSk7XHJcbiAgICAgICAgZXJyLm5hbWUgPSAnQmlnRXJyb3InO1xyXG5cclxuICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIFByb3RvdHlwZS9pbnN0YW5jZSBtZXRob2RzXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGlzIEJpZy5cclxuICAgICAqL1xyXG4gICAgUC5hYnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHggPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKTtcclxuICAgICAgICB4LnMgPSAxO1xyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm5cclxuICAgICAqIDEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiAtMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSwgb3JcclxuICAgICAqIDAgaWYgdGhleSBoYXZlIHRoZSBzYW1lIHZhbHVlLlxyXG4gICAgKi9cclxuICAgIFAuY21wID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeE5lZyxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5YyA9ICh5ID0gbmV3IHguY29uc3RydWN0b3IoeSkpLmMsXHJcbiAgICAgICAgICAgIGkgPSB4LnMsXHJcbiAgICAgICAgICAgIGogPSB5LnMsXHJcbiAgICAgICAgICAgIGsgPSB4LmUsXHJcbiAgICAgICAgICAgIGwgPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAheGNbMF0gPyAheWNbMF0gPyAwIDogLWogOiBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChpICE9IGopIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHhOZWcgPSBpIDwgMDtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBleHBvbmVudHMuXHJcbiAgICAgICAgaWYgKGsgIT0gbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gayA+IGwgXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSA9IC0xO1xyXG4gICAgICAgIGogPSAoayA9IHhjLmxlbmd0aCkgPCAobCA9IHljLmxlbmd0aCkgPyBrIDogbDtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBkaWdpdCBieSBkaWdpdC5cclxuICAgICAgICBmb3IgKDsgKytpIDwgajspIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh4Y1tpXSAhPSB5Y1tpXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHhjW2ldID4geWNbaV0gXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGxlbmd0aHMuXHJcbiAgICAgICAgcmV0dXJuIGsgPT0gbCA/IDAgOiBrID4gbCBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgZGl2aWRlZCBieSB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbFxyXG4gICAgICogcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICovXHJcbiAgICBQLmRpdiA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICAvLyBkaXZpZGVuZFxyXG4gICAgICAgICAgICBkdmQgPSB4LmMsXHJcbiAgICAgICAgICAgIC8vZGl2aXNvclxyXG4gICAgICAgICAgICBkdnMgPSAoeSA9IG5ldyBCaWcoeSkpLmMsXHJcbiAgICAgICAgICAgIHMgPSB4LnMgPT0geS5zID8gMSA6IC0xLFxyXG4gICAgICAgICAgICBkcCA9IEJpZy5EUDtcclxuXHJcbiAgICAgICAgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIUJpZy5EUCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciAwP1xyXG4gICAgICAgIGlmICghZHZkWzBdIHx8ICFkdnNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIGJvdGggYXJlIDAsIHRocm93IE5hTlxyXG4gICAgICAgICAgICBpZiAoZHZkWzBdID09IGR2c1swXSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgZHZzIGlzIDAsIHRocm93ICstSW5maW5pdHkuXHJcbiAgICAgICAgICAgIGlmICghZHZzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycihzIC8gMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGR2ZCBpcyAwLCByZXR1cm4gKy0wLlxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyhzICogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZHZzTCwgZHZzVCwgbmV4dCwgY21wLCByZW1JLCB1LFxyXG4gICAgICAgICAgICBkdnNaID0gZHZzLnNsaWNlKCksXHJcbiAgICAgICAgICAgIGR2ZEkgPSBkdnNMID0gZHZzLmxlbmd0aCxcclxuICAgICAgICAgICAgZHZkTCA9IGR2ZC5sZW5ndGgsXHJcbiAgICAgICAgICAgIC8vIHJlbWFpbmRlclxyXG4gICAgICAgICAgICByZW0gPSBkdmQuc2xpY2UoMCwgZHZzTCksXHJcbiAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoLFxyXG4gICAgICAgICAgICAvLyBxdW90aWVudFxyXG4gICAgICAgICAgICBxID0geSxcclxuICAgICAgICAgICAgcWMgPSBxLmMgPSBbXSxcclxuICAgICAgICAgICAgcWkgPSAwLFxyXG4gICAgICAgICAgICBkaWdpdHMgPSBkcCArIChxLmUgPSB4LmUgLSB5LmUpICsgMTtcclxuXHJcbiAgICAgICAgcS5zID0gcztcclxuICAgICAgICBzID0gZGlnaXRzIDwgMCA/IDAgOiBkaWdpdHM7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB2ZXJzaW9uIG9mIGRpdmlzb3Igd2l0aCBsZWFkaW5nIHplcm8uXHJcbiAgICAgICAgZHZzWi51bnNoaWZ0KDApO1xyXG5cclxuICAgICAgICAvLyBBZGQgemVyb3MgdG8gbWFrZSByZW1haW5kZXIgYXMgbG9uZyBhcyBkaXZpc29yLlxyXG4gICAgICAgIGZvciAoOyByZW1MKysgPCBkdnNMOyByZW0ucHVzaCgwKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZG8ge1xyXG5cclxuICAgICAgICAgICAgLy8gJ25leHQnIGlzIGhvdyBtYW55IHRpbWVzIHRoZSBkaXZpc29yIGdvZXMgaW50byBjdXJyZW50IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgZm9yIChuZXh0ID0gMDsgbmV4dCA8IDEwOyBuZXh0KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDb21wYXJlIGRpdmlzb3IgYW5kIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIGlmIChkdnNMICE9IChyZW1MID0gcmVtLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbXAgPSBkdnNMID4gcmVtTCA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAocmVtSSA9IC0xLCBjbXAgPSAwOyArK3JlbUkgPCBkdnNMOykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGR2c1tyZW1JXSAhPSByZW1bcmVtSV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNtcCA9IGR2c1tyZW1JXSA+IHJlbVtyZW1JXSA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIElmIGRpdmlzb3IgPCByZW1haW5kZXIsIHN1YnRyYWN0IGRpdmlzb3IgZnJvbSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoY21wIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1haW5kZXIgY2FuJ3QgYmUgbW9yZSB0aGFuIDEgZGlnaXQgbG9uZ2VyIHRoYW4gZGl2aXNvci5cclxuICAgICAgICAgICAgICAgICAgICAvLyBFcXVhbGlzZSBsZW5ndGhzIHVzaW5nIGRpdmlzb3Igd2l0aCBleHRyYSBsZWFkaW5nIHplcm8/XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChkdnNUID0gcmVtTCA9PSBkdnNMID8gZHZzIDogZHZzWjsgcmVtTDspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1bLS1yZW1MXSA8IGR2c1RbcmVtTF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbUkgPSByZW1MO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoOyByZW1JICYmICFyZW1bLS1yZW1JXTsgcmVtW3JlbUldID0gOSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLS1yZW1bcmVtSV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1bcmVtTF0gKz0gMTA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtW3JlbUxdIC09IGR2c1RbcmVtTF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoOyAhcmVtWzBdOyByZW0uc2hpZnQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgJ25leHQnIGRpZ2l0IHRvIHRoZSByZXN1bHQgYXJyYXkuXHJcbiAgICAgICAgICAgIHFjW3FpKytdID0gY21wID8gbmV4dCA6ICsrbmV4dDtcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBpZiAocmVtWzBdICYmIGNtcCkge1xyXG4gICAgICAgICAgICAgICAgcmVtW3JlbUxdID0gZHZkW2R2ZEldIHx8IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZW0gPSBbIGR2ZFtkdmRJXSBdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gd2hpbGUgKChkdmRJKysgPCBkdmRMIHx8IHJlbVswXSAhPT0gdSkgJiYgcy0tKTtcclxuXHJcbiAgICAgICAgLy8gTGVhZGluZyB6ZXJvPyBEbyBub3QgcmVtb3ZlIGlmIHJlc3VsdCBpcyBzaW1wbHkgemVybyAocWkgPT0gMSkuXHJcbiAgICAgICAgaWYgKCFxY1swXSAmJiBxaSAhPSAxKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGVyZSBjYW4ndCBiZSBtb3JlIHRoYW4gb25lIHplcm8uXHJcbiAgICAgICAgICAgIHFjLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIHEuZS0tO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUm91bmQ/XHJcbiAgICAgICAgaWYgKHFpID4gZGlnaXRzKSB7XHJcbiAgICAgICAgICAgIHJuZChxLCBkcCwgQmlnLlJNLCByZW1bMF0gIT09IHUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGVxdWFsIHRvIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmVxID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuY21wKHkpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZ3QgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA+IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5ndGUgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA+IC0xO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAubHQgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA8IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5sdGUgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPCAxO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIG1pbnVzIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAuc3ViID0gUC5taW51cyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIGksIGosIHQsIHhMVHksXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGEgIT0gYikge1xyXG4gICAgICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICAgICAgcmV0dXJuIHgucGx1cyh5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB4YyA9IHguYy5zbGljZSgpLFxyXG4gICAgICAgICAgICB4ZSA9IHguZSxcclxuICAgICAgICAgICAgeWMgPSB5LmMsXHJcbiAgICAgICAgICAgIHllID0geS5lO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8geSBpcyBub24temVybz8geCBpcyBub24temVybz8gT3IgYm90aCBhcmUgemVyby5cclxuICAgICAgICAgICAgcmV0dXJuIHljWzBdID8gKHkucyA9IC1iLCB5KSA6IG5ldyBCaWcoeGNbMF0gPyB4IDogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggaXMgdGhlIGJpZ2dlciBudW1iZXIuXHJcbiAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcyB0byBlcXVhbGlzZSBleHBvbmVudHMuXHJcbiAgICAgICAgaWYgKGEgPSB4ZSAtIHllKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoeExUeSA9IGEgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBhID0gLWE7XHJcbiAgICAgICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB5ZSA9IHhlO1xyXG4gICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgZm9yIChiID0gYTsgYi0tOyB0LnB1c2goMCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gRXhwb25lbnRzIGVxdWFsLiBDaGVjayBkaWdpdCBieSBkaWdpdC5cclxuICAgICAgICAgICAgaiA9ICgoeExUeSA9IHhjLmxlbmd0aCA8IHljLmxlbmd0aCkgPyB4YyA6IHljKS5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGEgPSBiID0gMDsgYiA8IGo7IGIrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh4Y1tiXSAhPSB5Y1tiXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHhMVHkgPSB4Y1tiXSA8IHljW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB4IDwgeT8gUG9pbnQgeGMgdG8gdGhlIGFycmF5IG9mIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgIGlmICh4TFR5KSB7XHJcbiAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB5YztcclxuICAgICAgICAgICAgeWMgPSB0O1xyXG4gICAgICAgICAgICB5LnMgPSAteS5zO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBBcHBlbmQgemVyb3MgdG8geGMgaWYgc2hvcnRlci4gTm8gbmVlZCB0byBhZGQgemVyb3MgdG8geWMgaWYgc2hvcnRlclxyXG4gICAgICAgICAqIGFzIHN1YnRyYWN0aW9uIG9ubHkgbmVlZHMgdG8gc3RhcnQgYXQgeWMubGVuZ3RoLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlmICgoIGIgPSAoaiA9IHljLmxlbmd0aCkgLSAoaSA9IHhjLmxlbmd0aCkgKSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAoOyBiLS07IHhjW2krK10gPSAwKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN1YnRyYWN0IHljIGZyb20geGMuXHJcbiAgICAgICAgZm9yIChiID0gaTsgaiA+IGE7KXtcclxuXHJcbiAgICAgICAgICAgIGlmICh4Y1stLWpdIDwgeWNbal0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSBqOyBpICYmICF4Y1stLWldOyB4Y1tpXSA9IDkpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC0teGNbaV07XHJcbiAgICAgICAgICAgICAgICB4Y1tqXSArPSAxMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB4Y1tqXSAtPSB5Y1tqXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKDsgeGNbLS1iXSA9PT0gMDsgeGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIHplcm9zIGFuZCBhZGp1c3QgZXhwb25lbnQgYWNjb3JkaW5nbHkuXHJcbiAgICAgICAgZm9yICg7IHhjWzBdID09PSAwOykge1xyXG4gICAgICAgICAgICB4Yy5zaGlmdCgpO1xyXG4gICAgICAgICAgICAtLXllO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF4Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8gbiAtIG4gPSArMFxyXG4gICAgICAgICAgICB5LnMgPSAxO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVzdWx0IG11c3QgYmUgemVyby5cclxuICAgICAgICAgICAgeGMgPSBbeWUgPSAwXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHkuYyA9IHhjO1xyXG4gICAgICAgIHkuZSA9IHllO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBtb2R1bG8gdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5tb2QgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB5R1R4LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgaWYgKCF5LmNbMF0pIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHgucyA9IHkucyA9IDE7XHJcbiAgICAgICAgeUdUeCA9IHkuY21wKHgpID09IDE7XHJcbiAgICAgICAgeC5zID0gYTtcclxuICAgICAgICB5LnMgPSBiO1xyXG5cclxuICAgICAgICBpZiAoeUdUeCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGEgPSBCaWcuRFA7XHJcbiAgICAgICAgYiA9IEJpZy5STTtcclxuICAgICAgICBCaWcuRFAgPSBCaWcuUk0gPSAwO1xyXG4gICAgICAgIHggPSB4LmRpdih5KTtcclxuICAgICAgICBCaWcuRFAgPSBhO1xyXG4gICAgICAgIEJpZy5STSA9IGI7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbnVzKCB4LnRpbWVzKHkpICk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcGx1cyB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLmFkZCA9IFAucGx1cyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHQsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGEgIT0gYikge1xyXG4gICAgICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICAgICAgcmV0dXJuIHgubWludXMoeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgeGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5ZSA9IHkuZSxcclxuICAgICAgICAgICAgeWMgPSB5LmM7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB5IGlzIG5vbi16ZXJvPyB4IGlzIG5vbi16ZXJvPyBPciBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgICByZXR1cm4geWNbMF0gPyB5IDogbmV3IEJpZyh4Y1swXSA/IHggOiBhICogMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHhjID0geGMuc2xpY2UoKTtcclxuXHJcbiAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcyB0byBlcXVhbGlzZSBleHBvbmVudHMuXHJcbiAgICAgICAgLy8gTm90ZTogRmFzdGVyIHRvIHVzZSByZXZlcnNlIHRoZW4gZG8gdW5zaGlmdHMuXHJcbiAgICAgICAgaWYgKGEgPSB4ZSAtIHllKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoYSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHllID0geGU7XHJcbiAgICAgICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhID0gLWE7XHJcbiAgICAgICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICBmb3IgKDsgYS0tOyB0LnB1c2goMCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFBvaW50IHhjIHRvIHRoZSBsb25nZXIgYXJyYXkuXHJcbiAgICAgICAgaWYgKHhjLmxlbmd0aCAtIHljLmxlbmd0aCA8IDApIHtcclxuICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGEgPSB5Yy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogT25seSBzdGFydCBhZGRpbmcgYXQgeWMubGVuZ3RoIC0gMSBhcyB0aGUgZnVydGhlciBkaWdpdHMgb2YgeGMgY2FuIGJlXHJcbiAgICAgICAgICogbGVmdCBhcyB0aGV5IGFyZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmb3IgKGIgPSAwOyBhOykge1xyXG4gICAgICAgICAgICBiID0gKHhjWy0tYV0gPSB4Y1thXSArIHljW2FdICsgYikgLyAxMCB8IDA7XHJcbiAgICAgICAgICAgIHhjW2FdICU9IDEwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTm8gbmVlZCB0byBjaGVjayBmb3IgemVybywgYXMgK3ggKyAreSAhPSAwICYmIC14ICsgLXkgIT0gMFxyXG5cclxuICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICB4Yy51bnNoaWZ0KGIpO1xyXG4gICAgICAgICAgICArK3llO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGEgPSB4Yy5sZW5ndGg7IHhjWy0tYV0gPT09IDA7IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB5LmMgPSB4YztcclxuICAgICAgICB5LmUgPSB5ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByYWlzZWQgdG8gdGhlIHBvd2VyIG4uXHJcbiAgICAgKiBJZiBuIGlzIG5lZ2F0aXZlLCByb3VuZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWxcclxuICAgICAqIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBuIHtudW1iZXJ9IEludGVnZXIsIC1NQVhfUE9XRVIgdG8gTUFYX1BPV0VSIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC5wb3cgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgb25lID0gbmV3IHguY29uc3RydWN0b3IoMSksXHJcbiAgICAgICAgICAgIHkgPSBvbmUsXHJcbiAgICAgICAgICAgIGlzTmVnID0gbiA8IDA7XHJcblxyXG4gICAgICAgIGlmIChuICE9PSB+fm4gfHwgbiA8IC1NQVhfUE9XRVIgfHwgbiA+IE1BWF9QT1dFUikge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXBvdyEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG4gPSBpc05lZyA/IC1uIDogbjtcclxuXHJcbiAgICAgICAgZm9yICg7Oykge1xyXG5cclxuICAgICAgICAgICAgaWYgKG4gJiAxKSB7XHJcbiAgICAgICAgICAgICAgICB5ID0geS50aW1lcyh4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBuID4+PSAxO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFuKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB4ID0geC50aW1lcyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpc05lZyA/IG9uZS5kaXYoeSkgOiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJvdW5kZWQgdG8gYVxyXG4gICAgICogbWF4aW11bSBvZiBkcCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLlxyXG4gICAgICogSWYgZHAgaXMgbm90IHNwZWNpZmllZCwgcm91bmQgdG8gMCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAqIElmIHJtIGlzIG5vdCBzcGVjaWZpZWQsIHVzZSBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiBbcm1dIDAsIDEsIDIgb3IgMyAoUk9VTkRfRE9XTiwgUk9VTkRfSEFMRl9VUCwgUk9VTkRfSEFMRl9FVkVOLCBST1VORF9VUClcclxuICAgICAqL1xyXG4gICAgUC5yb3VuZCA9IGZ1bmN0aW9uIChkcCwgcm0pIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGRwID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXJvdW5kIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBybmQoeCA9IG5ldyBCaWcoeCksIGRwLCBybSA9PSBudWxsID8gQmlnLlJNIDogcm0pO1xyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSBzcXVhcmUgcm9vdCBvZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcsXHJcbiAgICAgKiByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbCBwbGFjZXMgdXNpbmdcclxuICAgICAqIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICovXHJcbiAgICBQLnNxcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVzdGltYXRlLCByLCBhcHByb3gsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgaSA9IHgucyxcclxuICAgICAgICAgICAgZSA9IHguZSxcclxuICAgICAgICAgICAgaGFsZiA9IG5ldyBCaWcoJzAuNScpO1xyXG5cclxuICAgICAgICAvLyBaZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBuZWdhdGl2ZSwgdGhyb3cgTmFOLlxyXG4gICAgICAgIGlmIChpIDwgMCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXN0aW1hdGUuXHJcbiAgICAgICAgaSA9IE1hdGguc3FydCh4LnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAvLyBNYXRoLnNxcnQgdW5kZXJmbG93L292ZXJmbG93P1xyXG4gICAgICAgIC8vIFBhc3MgeCB0byBNYXRoLnNxcnQgYXMgaW50ZWdlciwgdGhlbiBhZGp1c3QgdGhlIHJlc3VsdCBleHBvbmVudC5cclxuICAgICAgICBpZiAoaSA9PT0gMCB8fCBpID09PSAxIC8gMCkge1xyXG4gICAgICAgICAgICBlc3RpbWF0ZSA9IHhjLmpvaW4oJycpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCEoZXN0aW1hdGUubGVuZ3RoICsgZSAmIDEpKSB7XHJcbiAgICAgICAgICAgICAgICBlc3RpbWF0ZSArPSAnMCc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHIgPSBuZXcgQmlnKCBNYXRoLnNxcnQoZXN0aW1hdGUpLnRvU3RyaW5nKCkgKTtcclxuICAgICAgICAgICAgci5lID0gKChlICsgMSkgLyAyIHwgMCkgLSAoZSA8IDAgfHwgZSAmIDEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIgPSBuZXcgQmlnKGkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpID0gci5lICsgKEJpZy5EUCArPSA0KTtcclxuXHJcbiAgICAgICAgLy8gTmV3dG9uLVJhcGhzb24gaXRlcmF0aW9uLlxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgYXBwcm94ID0gcjtcclxuICAgICAgICAgICAgciA9IGhhbGYudGltZXMoIGFwcHJveC5wbHVzKCB4LmRpdihhcHByb3gpICkgKTtcclxuICAgICAgICB9IHdoaWxlICggYXBwcm94LmMuc2xpY2UoMCwgaSkuam9pbignJykgIT09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgci5jLnNsaWNlKDAsIGkpLmpvaW4oJycpICk7XHJcblxyXG4gICAgICAgIHJuZChyLCBCaWcuRFAgLT0gNCwgQmlnLlJNKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgdGltZXMgdGhlIHZhbHVlIG9mXHJcbiAgICAgKiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5tdWwgPSBQLnRpbWVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgYyxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5YyA9ICh5ID0gbmV3IEJpZyh5KSkuYyxcclxuICAgICAgICAgICAgYSA9IHhjLmxlbmd0aCxcclxuICAgICAgICAgICAgYiA9IHljLmxlbmd0aCxcclxuICAgICAgICAgICAgaSA9IHguZSxcclxuICAgICAgICAgICAgaiA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHNpZ24gb2YgcmVzdWx0LlxyXG4gICAgICAgIHkucyA9IHgucyA9PSB5LnMgPyAxIDogLTE7XHJcblxyXG4gICAgICAgIC8vIFJldHVybiBzaWduZWQgMCBpZiBlaXRoZXIgMC5cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh5LnMgKiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpc2UgZXhwb25lbnQgb2YgcmVzdWx0IGFzIHguZSArIHkuZS5cclxuICAgICAgICB5LmUgPSBpICsgajtcclxuXHJcbiAgICAgICAgLy8gSWYgYXJyYXkgeGMgaGFzIGZld2VyIGRpZ2l0cyB0aGFuIHljLCBzd2FwIHhjIGFuZCB5YywgYW5kIGxlbmd0aHMuXHJcbiAgICAgICAgaWYgKGEgPCBiKSB7XHJcbiAgICAgICAgICAgIGMgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB5YztcclxuICAgICAgICAgICAgeWMgPSBjO1xyXG4gICAgICAgICAgICBqID0gYTtcclxuICAgICAgICAgICAgYSA9IGI7XHJcbiAgICAgICAgICAgIGIgPSBqO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGlzZSBjb2VmZmljaWVudCBhcnJheSBvZiByZXN1bHQgd2l0aCB6ZXJvcy5cclxuICAgICAgICBmb3IgKGMgPSBuZXcgQXJyYXkoaiA9IGEgKyBiKTsgai0tOyBjW2pdID0gMCkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTXVsdGlwbHkuXHJcblxyXG4gICAgICAgIC8vIGkgaXMgaW5pdGlhbGx5IHhjLmxlbmd0aC5cclxuICAgICAgICBmb3IgKGkgPSBiOyBpLS07KSB7XHJcbiAgICAgICAgICAgIGIgPSAwO1xyXG5cclxuICAgICAgICAgICAgLy8gYSBpcyB5Yy5sZW5ndGguXHJcbiAgICAgICAgICAgIGZvciAoaiA9IGEgKyBpOyBqID4gaTspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDdXJyZW50IHN1bSBvZiBwcm9kdWN0cyBhdCB0aGlzIGRpZ2l0IHBvc2l0aW9uLCBwbHVzIGNhcnJ5LlxyXG4gICAgICAgICAgICAgICAgYiA9IGNbal0gKyB5Y1tpXSAqIHhjW2ogLSBpIC0gMV0gKyBiO1xyXG4gICAgICAgICAgICAgICAgY1tqLS1dID0gYiAlIDEwO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGNhcnJ5XHJcbiAgICAgICAgICAgICAgICBiID0gYiAvIDEwIHwgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjW2pdID0gKGNbal0gKyBiKSAlIDEwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5jcmVtZW50IHJlc3VsdCBleHBvbmVudCBpZiB0aGVyZSBpcyBhIGZpbmFsIGNhcnJ5LlxyXG4gICAgICAgIGlmIChiKSB7XHJcbiAgICAgICAgICAgICsreS5lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGFueSBsZWFkaW5nIHplcm8uXHJcbiAgICAgICAgaWYgKCFjWzBdKSB7XHJcbiAgICAgICAgICAgIGMuc2hpZnQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGkgPSBjLmxlbmd0aDsgIWNbLS1pXTsgYy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuICAgICAgICB5LmMgPSBjO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZy5cclxuICAgICAqIFJldHVybiBleHBvbmVudGlhbCBub3RhdGlvbiBpZiB0aGlzIEJpZyBoYXMgYSBwb3NpdGl2ZSBleHBvbmVudCBlcXVhbCB0b1xyXG4gICAgICogb3IgZ3JlYXRlciB0aGFuIEJpZy5FX1BPUywgb3IgYSBuZWdhdGl2ZSBleHBvbmVudCBlcXVhbCB0byBvciBsZXNzIHRoYW5cclxuICAgICAqIEJpZy5FX05FRy5cclxuICAgICAqL1xyXG4gICAgUC50b1N0cmluZyA9IFAudmFsdWVPZiA9IFAudG9KU09OID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgZSA9IHguZSxcclxuICAgICAgICAgICAgc3RyID0geC5jLmpvaW4oJycpLFxyXG4gICAgICAgICAgICBzdHJMID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24/XHJcbiAgICAgICAgaWYgKGUgPD0gQmlnLkVfTkVHIHx8IGUgPj0gQmlnLkVfUE9TKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5jaGFyQXQoMCkgKyAoc3RyTCA+IDEgPyAnLicgKyBzdHIuc2xpY2UoMSkgOiAnJykgK1xyXG4gICAgICAgICAgICAgIChlIDwgMCA/ICdlJyA6ICdlKycpICsgZTtcclxuXHJcbiAgICAgICAgLy8gTmVnYXRpdmUgZXhwb25lbnQ/XHJcbiAgICAgICAgfSBlbHNlIGlmIChlIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICg7ICsrZTsgc3RyID0gJzAnICsgc3RyKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RyID0gJzAuJyArIHN0cjtcclxuXHJcbiAgICAgICAgLy8gUG9zaXRpdmUgZXhwb25lbnQ/XHJcbiAgICAgICAgfSBlbHNlIGlmIChlID4gMCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCsrZSA+IHN0ckwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBcHBlbmQgemVyb3MuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGUgLT0gc3RyTDsgZS0tIDsgc3RyICs9ICcwJykge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUgPCBzdHJMKSB7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIuc2xpY2UoMCwgZSkgKyAnLicgKyBzdHIuc2xpY2UoZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnQgemVyby5cclxuICAgICAgICB9IGVsc2UgaWYgKHN0ckwgPiAxKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5jaGFyQXQoMCkgKyAnLicgKyBzdHIuc2xpY2UoMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBdm9pZCAnLTAnXHJcbiAgICAgICAgcmV0dXJuIHgucyA8IDAgJiYgeC5jWzBdID8gJy0nICsgc3RyIDogc3RyO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqIElmIHRvRXhwb25lbnRpYWwsIHRvRml4ZWQsIHRvUHJlY2lzaW9uIGFuZCBmb3JtYXQgYXJlIG5vdCByZXF1aXJlZCB0aGV5XHJcbiAgICAgKiBjYW4gc2FmZWx5IGJlIGNvbW1lbnRlZC1vdXQgb3IgZGVsZXRlZC4gTm8gcmVkdW5kYW50IGNvZGUgd2lsbCBiZSBsZWZ0LlxyXG4gICAgICogZm9ybWF0IGlzIHVzZWQgb25seSBieSB0b0V4cG9uZW50aWFsLCB0b0ZpeGVkIGFuZCB0b1ByZWNpc2lvbi5cclxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqL1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaW4gZXhwb25lbnRpYWxcclxuICAgICAqIG5vdGF0aW9uIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIGFuZCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHVzaW5nXHJcbiAgICAgKiBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9FeHBvbmVudGlhbCA9IGZ1bmN0aW9uIChkcCkge1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBkcCA9IHRoaXMuYy5sZW5ndGggLSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9FeHAhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZm9ybWF0KHRoaXMsIGRwLCAxKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpbiBub3JtYWwgbm90YXRpb25cclxuICAgICAqIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIGFuZCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHVzaW5nIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b0ZpeGVkID0gZnVuY3Rpb24gKGRwKSB7XHJcbiAgICAgICAgdmFyIHN0cixcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIG5lZyA9IEJpZy5FX05FRyxcclxuICAgICAgICAgICAgcG9zID0gQmlnLkVfUE9TO1xyXG5cclxuICAgICAgICAvLyBQcmV2ZW50IHRoZSBwb3NzaWJpbGl0eSBvZiBleHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICBCaWcuRV9ORUcgPSAtKEJpZy5FX1BPUyA9IDEgLyAwKTtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgc3RyID0geC50b1N0cmluZygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgPT09IH5+ZHAgJiYgZHAgPj0gMCAmJiBkcCA8PSBNQVhfRFApIHtcclxuICAgICAgICAgICAgc3RyID0gZm9ybWF0KHgsIHguZSArIGRwKTtcclxuXHJcbiAgICAgICAgICAgIC8vICgtMCkudG9GaXhlZCgpIGlzICcwJywgYnV0ICgtMC4xKS50b0ZpeGVkKCkgaXMgJy0wJy5cclxuICAgICAgICAgICAgLy8gKC0wKS50b0ZpeGVkKDEpIGlzICcwLjAnLCBidXQgKC0wLjAxKS50b0ZpeGVkKDEpIGlzICctMC4wJy5cclxuICAgICAgICAgICAgaWYgKHgucyA8IDAgJiYgeC5jWzBdICYmIHN0ci5pbmRleE9mKCctJykgPCAwKSB7XHJcbiAgICAgICAgLy9FLmcuIC0wLjUgaWYgcm91bmRlZCB0byAtMCB3aWxsIGNhdXNlIHRvU3RyaW5nIHRvIG9taXQgdGhlIG1pbnVzIHNpZ24uXHJcbiAgICAgICAgICAgICAgICBzdHIgPSAnLScgKyBzdHI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgQmlnLkVfTkVHID0gbmVnO1xyXG4gICAgICAgIEJpZy5FX1BPUyA9IHBvcztcclxuXHJcbiAgICAgICAgaWYgKCFzdHIpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b0ZpeCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcm91bmRlZCB0byBzZFxyXG4gICAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIEJpZy5STS4gVXNlIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHNkIGlzIGxlc3NcclxuICAgICAqIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHMgbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgaW50ZWdlciBwYXJ0IG9mIHRoZVxyXG4gICAgICogdmFsdWUgaW4gbm9ybWFsIG5vdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIHNkIHtudW1iZXJ9IEludGVnZXIsIDEgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b1ByZWNpc2lvbiA9IGZ1bmN0aW9uIChzZCkge1xyXG5cclxuICAgICAgICBpZiAoc2QgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2QgIT09IH5+c2QgfHwgc2QgPCAxIHx8IHNkID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9QcmUhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZm9ybWF0KHRoaXMsIHNkIC0gMSwgMik7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvLyBFeHBvcnRcclxuXHJcblxyXG4gICAgQmlnID0gYmlnRmFjdG9yeSgpO1xyXG5cclxuICAgIC8vQU1ELlxyXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCaWc7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgLy8gTm9kZSBhbmQgb3RoZXIgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLlxyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xyXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gQmlnO1xyXG5cclxuICAgIC8vQnJvd3Nlci5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZ2xvYmFsLkJpZyA9IEJpZztcclxuICAgIH1cclxufSkodGhpcyk7XHJcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgTWVtb3J5SGVscGVyID0ge1xuICBjcmVhdGUoIHNpemVPckJ1ZmZlcj00MDk2LCBtZW10eXBlPUZsb2F0MzJBcnJheSApIHtcbiAgICBsZXQgaGVscGVyID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG5cbiAgICAvLyBjb252ZW5pZW50bHksIGJ1ZmZlciBjb25zdHJ1Y3RvcnMgYWNjZXB0IGVpdGhlciBhIHNpemUgb3IgYW4gYXJyYXkgYnVmZmVyIHRvIHVzZS4uLlxuICAgIC8vIHNvLCBubyBtYXR0ZXIgd2hpY2ggaXMgcGFzc2VkIHRvIHNpemVPckJ1ZmZlciBpdCBzaG91bGQgd29yay5cbiAgICBPYmplY3QuYXNzaWduKCBoZWxwZXIsIHtcbiAgICAgIGhlYXA6IG5ldyBtZW10eXBlKCBzaXplT3JCdWZmZXIgKSxcbiAgICAgIGxpc3Q6IHt9LFxuICAgICAgZnJlZUxpc3Q6IHt9XG4gICAgfSlcblxuICAgIHJldHVybiBoZWxwZXJcbiAgfSxcblxuICBhbGxvYyggc2l6ZSwgaW1tdXRhYmxlICkge1xuICAgIGxldCBpZHggPSAtMVxuXG4gICAgaWYoIHNpemUgPiB0aGlzLmhlYXAubGVuZ3RoICkge1xuICAgICAgdGhyb3cgRXJyb3IoICdBbGxvY2F0aW9uIHJlcXVlc3QgaXMgbGFyZ2VyIHRoYW4gaGVhcCBzaXplIG9mICcgKyB0aGlzLmhlYXAubGVuZ3RoIClcbiAgICB9XG5cbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5mcmVlTGlzdCApIHtcbiAgICAgIGxldCBjYW5kaWRhdGUgPSB0aGlzLmZyZWVMaXN0WyBrZXkgXVxuXG4gICAgICBpZiggY2FuZGlkYXRlLnNpemUgPj0gc2l6ZSApIHtcbiAgICAgICAgaWR4ID0ga2V5XG5cbiAgICAgICAgdGhpcy5saXN0WyBpZHggXSA9IHsgc2l6ZSwgaW1tdXRhYmxlLCByZWZlcmVuY2VzOjEgfVxuXG4gICAgICAgIGlmKCBjYW5kaWRhdGUuc2l6ZSAhPT0gc2l6ZSApIHtcbiAgICAgICAgICBsZXQgbmV3SW5kZXggPSBpZHggKyBzaXplLFxuICAgICAgICAgICAgICBuZXdGcmVlU2l6ZVxuXG4gICAgICAgICAgZm9yKCBsZXQga2V5IGluIHRoaXMubGlzdCApIHtcbiAgICAgICAgICAgIGlmKCBrZXkgPiBuZXdJbmRleCApIHtcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemUgPSBrZXkgLSBuZXdJbmRleFxuICAgICAgICAgICAgICB0aGlzLmZyZWVMaXN0WyBuZXdJbmRleCBdID0gbmV3RnJlZVNpemVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBpZHggIT09IC0xICkgZGVsZXRlIHRoaXMuZnJlZUxpc3RbIGlkeCBdXG5cbiAgICBpZiggaWR4ID09PSAtMSApIHtcbiAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMoIHRoaXMubGlzdCApLFxuICAgICAgICAgIGxhc3RJbmRleFxuXG4gICAgICBpZigga2V5cy5sZW5ndGggKSB7IC8vIGlmIG5vdCBmaXJzdCBhbGxvY2F0aW9uLi4uXG4gICAgICAgIGxhc3RJbmRleCA9IHBhcnNlSW50KCBrZXlzWyBrZXlzLmxlbmd0aCAtIDEgXSApXG5cbiAgICAgICAgaWR4ID0gbGFzdEluZGV4ICsgdGhpcy5saXN0WyBsYXN0SW5kZXggXS5zaXplXG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWR4ID0gMFxuICAgICAgfVxuXG4gICAgICB0aGlzLmxpc3RbIGlkeCBdID0geyBzaXplLCBpbW11dGFibGUsIHJlZmVyZW5jZXM6MSB9XG4gICAgfVxuXG4gICAgaWYoIGlkeCArIHNpemUgPj0gdGhpcy5oZWFwLmxlbmd0aCApIHtcbiAgICAgIHRocm93IEVycm9yKCAnTm8gYXZhaWxhYmxlIGJsb2NrcyByZW1haW4gc3VmZmljaWVudCBmb3IgYWxsb2NhdGlvbiByZXF1ZXN0LicgKVxuICAgIH1cbiAgICByZXR1cm4gaWR4XG4gIH0sXG5cbiAgYWRkUmVmZXJlbmNlKCBpbmRleCApIHtcbiAgICBpZiggdGhpcy5saXN0WyBpbmRleCBdICE9PSB1bmRlZmluZWQgKSB7IFxuICAgICAgdGhpcy5saXN0WyBpbmRleCBdLnJlZmVyZW5jZXMrK1xuICAgIH1cbiAgfSxcblxuICBmcmVlKCBpbmRleCApIHtcbiAgICBpZiggdGhpcy5saXN0WyBpbmRleCBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICB0aHJvdyBFcnJvciggJ0NhbGxpbmcgZnJlZSgpIG9uIG5vbi1leGlzdGluZyBibG9jay4nIClcbiAgICB9XG5cbiAgICBsZXQgc2xvdCA9IHRoaXMubGlzdFsgaW5kZXggXVxuICAgIGlmKCBzbG90ID09PSAwICkgcmV0dXJuXG4gICAgc2xvdC5yZWZlcmVuY2VzLS1cblxuICAgIGlmKCBzbG90LnJlZmVyZW5jZXMgPT09IDAgJiYgc2xvdC5pbW11dGFibGUgIT09IHRydWUgKSB7ICAgIFxuICAgICAgdGhpcy5saXN0WyBpbmRleCBdID0gMFxuXG4gICAgICBsZXQgZnJlZUJsb2NrU2l6ZSA9IDBcbiAgICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmxpc3QgKSB7XG4gICAgICAgIGlmKCBrZXkgPiBpbmRleCApIHtcbiAgICAgICAgICBmcmVlQmxvY2tTaXplID0ga2V5IC0gaW5kZXhcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZnJlZUxpc3RbIGluZGV4IF0gPSBmcmVlQmxvY2tTaXplXG4gICAgfVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUhlbHBlclxuIl19

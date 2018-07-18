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
    gen.memory.heap[ this.memory.value.idx ] = this.initialValue
    
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
      defaults = Object.assign( { initialValue: 0, shouldWrap:true }, properties )

  Object.assign( ugen, { 
    min:    min, 
    max:    max,
    initialValue: defaults.initialValue,
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
        if( typeof ugen.onload === 'function' ) ugen.onload() 
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
  
  createCallback( ugen, mem, debug = false, shouldInlineMemory=false, memType = Float64Array ) {
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
    callback.out  = new Float64Array( 2 )
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
    accum   = require( './accum.js' ),
    div     = require( './div.js' )

module.exports = ( frequency=440, pulsewidth=.5 ) => {
  let graph = lt( accum( div( frequency, 44100 ) ), pulsewidth )

  graph.name = `train${gen.getUID()}`

  return graph
}


},{"./accum.js":2,"./div.js":23,"./gen.js":30,"./lt.js":38}],71:[function(require,module,exports){
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

},{"../ugen.js":134,"../workletProxy.js":137,"./analyzer.js":74,"genish.js":37}],78:[function(require,module,exports){
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
        
    ramp.trigger = reset.trigger

    const out = Gibberish.factory( ramp, graph, ['envelopes','ramp'], props )


    return out
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
 * //IF NEGATIVE, RETURN A
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
const HeapQueue = function(cmp){
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

    // XXX this is where the magic number hapens for Q...
    const Q = g.memo( g.add( .5, g.mul( _Q, g.add( 5, g.sub( 5, g.mul( g.div( freq, 20000  ), 5 ) ) ) ) ) )
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
    cutoff:.5 
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
          filteredOsc = g.zd24( input, g.min( g.in('Q'), .9999 ),  g.min( cutoff, 20000 ) )
          break;
        case 2:
          filteredOsc = g.diodeZDF( input, g.min( g.in('Q'), .9999 ), g.min( cutoff, 20000 ), g.in('saturation'), isStereo ) 
          break;
        case 3:
          filteredOsc = g.svf( input, cutoff, g.sub( 1, g.in('Q')), props.filterMode, isStereo ) 
          break; 
        case 4:
          filteredOsc = g.biquad( input, cutoff,  g.in('Q'), props.filterMode, isStereo ) 
          break; 
        case 5:
          //isLowPass = g.param( 'lowPass', 1 ),
          filteredOsc = g.filter24( input, g.in('Q'), cutoff, props.filterMode, isStereo )
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


},{"./filter.js":87,"genish.js":37}],92:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let BitCrusher = inputProps => {
  const  props = Object.assign( { bitCrusherLength: 44100 }, BitCrusher.defaults, effect.defaults, inputProps ),
         bitCrusher = Object.create( effect )

  let out

  bitCrusher.__createGraph = function() {
    let isStereo = false
    if( out === undefined ) {
      isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false 
    }else{
      isStereo = out.input.isStereo
      out.isStereo = isStereo
    }

    let input = g.in( 'input' ),
        inputGain = g.in( 'inputGain' ),
        bitDepth = g.in( 'bitDepth' ),
        sampleRate = g.in( 'sampleRate' ),
        leftInput = isStereo ? input[ 0 ] : input,
        rightInput = isStereo ? input[ 1 ] : null
    
    let storeL = g.history(0)
    let sampleReduxCounter = g.counter( sampleRate, 0, 1 )

    let bitMult = g.pow( g.mul( bitDepth, 16 ), 2 )
    let crushedL = g.div( g.floor( g.mul( g.mul( leftInput, inputGain ), bitMult ) ), bitMult )

    let outL = g.switch(
      sampleReduxCounter.wrap,
      crushedL,
      storeL.out
    )

    if( isStereo ) {
      let storeR = g.history(0)
      let crushedR = g.div( g.floor( g.mul( g.mul( rightInput, inputGain ), bitMult ) ), bitMult )

      let outR = g.ternary( 
        sampleReduxCounter.wrap,
        crushedR,
        storeL.out
      )

      bitCrusher.graph = [ outL, outR ]
    }else{
      bitCrusher.graph = outL
    }
  }

  bitCrusher.__createGraph()
  bitCrusher.__requiresRecompilation = [ 'input' ]

  out = Gibberish.factory( 
    bitCrusher,
    bitCrusher.graph,
    ['fx','bitCrusher'], 
    props 
  )
  return out 
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

    const props = Object.assign( {}, Shuffler.defaults, effect.defaults, inputProps )
    
    let out
    bufferShuffler.__createGraph = function() {
      let isStereo = false
      if( out === undefined ) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : true 
      }else{
        isStereo = out.input.isStereo
        //out.isStereo = isStereo
      }      
      
      const phase = g.accum( 1,0,{ shouldWrap: false })

      const input = g.in( 'input' ),
            inputGain = g.in( 'inputGain' ),
            __leftInput = isStereo ? input[ 0 ] : input,
            __rightInput = isStereo ? input[ 1 ] : null,
            leftInput = g.mul( __leftInput, inputGain ),
            rightInput = g.mul( __rightInput, inputGain ),
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

      const bufferL = g.data( bufferSize )
      const bufferR = isStereo ? g.data( bufferSize ) : null
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
      
      bufferShuffler.graph = [ panner.left, panner.right ]
    }

    bufferShuffler.__createGraph()
    bufferShuffler.__requiresRecompilation = [ 'input' ]
    
    out = Gibberish.factory( 
      bufferShuffler,
      bufferShuffler.graph,
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

},{"./effect.js":98,"genish.js":37}],94:[function(require,module,exports){
const g = require( 'genish.js' ),
      effect = require( './effect.js' )
  
module.exports = function( Gibberish ) {
 
let __Chorus = inputProps => {
  const props = Object.assign({}, __Chorus.defaults, effect.defaults, inputProps )
  let out
  
  const chorus = Object.create( effect )

  chorus.__createGraph = function() {
    const input = g.in('input'),
          inputGain = g.in( 'inputGain' ),
          freq1 = g.in('slowFrequency'),
          freq2 = g.in('fastFrequency'),
          amp1  = g.in('slowGain'),
          amp2  = g.in('fastGain')

    let isStereo = false
    if( out === undefined ) {
      isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false 
    }else{
      isStereo = out.input.isStereo
      out.isStereo = isStereo
    }

    const leftInput = isStereo ? g.mul( input[0], inputGain ) : g.mul( input, inputGain )

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


    let sampleRate = Gibberish.ctx.sampleRate
     
    const ms = sampleRate / 1000 
    const maxDelayTime = 1000 * ms

    //console.log( 'sr:', sampleRate, 'ms:', ms, 'maxDelayTime:', maxDelayTime )

    const time1 =  g.mul( g.add( slowPeek1, fastPeek1, 5 ), ms ),
          time2 =  g.mul( g.add( slowPeek2, fastPeek2, 5 ), ms ),
          time3 =  g.mul( g.add( slowPeek3, fastPeek3, 5 ), ms )

    const delay1L = g.delay( leftInput, time1, { size:maxDelayTime }),
          delay2L = g.delay( leftInput, time2, { size:maxDelayTime }),
          delay3L = g.delay( leftInput, time3, { size:maxDelayTime })

    
    const leftOutput = g.add( delay1L, delay2L, delay3L )
    if( isStereo ) {
      const rightInput = g.mul( input[1], inputGain )
      const delay1R = g.delay(rightInput, time1, { size:maxDelayTime }),
            delay2R = g.delay(rightInput, time2, { size:maxDelayTime }),
            delay3R = g.delay(rightInput, time3, { size:maxDelayTime })

      // flip a couple delay lines for stereo effect?
      const rightOutput = g.add( delay1R, delay2L, delay3R )
      chorus.graph = [ g.add( delay1L, delay2R, delay3L), rightOutput ]
    }else{
      chorus.graph = leftOutput
    }
  }

  chorus.__createGraph()
  chorus.__requiresRecompilation = [ 'input' ]

  out = Gibberish.factory( chorus, chorus.graph, ['fx','chorus'], props )

  return out 
}

__Chorus.defaults = {
  input:0,
  slowFrequency: .18,
  slowGain:3,
  fastFrequency:6,
  fastGain:1,
  inputGain:1
}

return __Chorus

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

    let out;

    reverb.__createGraph = function () {
      let isStereo = false;
      if (out === undefined) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false;
      } else {
        isStereo = out.input.isStereo;
        out.isStereo = isStereo;
      }

      const input = g.in('input'),
            inputGain = g.in('inputGain'),
            damping = g.in('damping'),
            drywet = g.in('drywet'),
            decay = g.in('decay'),
            predelay = g.in('predelay'),
            inbandwidth = g.in('inbandwidth'),
            decaydiffusion1 = g.in('decaydiffusion1'),
            decaydiffusion2 = g.in('decaydiffusion2'),
            indiffusion1 = g.in('indiffusion1'),
            indiffusion2 = g.in('indiffusion2');

      const summedInput = isStereo === true ? g.mul(g.add(input[0], input[1]), inputGain) : g.mul(input, inputGain);
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
        const left = g.mix(isStereo ? g.mul(input[0], inputGain) : g.mul(input, inputGain), leftWet, drywet);
        const right = g.mix(isStereo ? g.mul(input[1], inputGain) : g.mul(input, inputGain), rightWet, drywet);

        reverb.graph = [left, right];
      }
    };

    reverb.__createGraph();
    reverb.__requiresRecompilation = ['input'];

    out = Gibberish.factory(reverb, reverb.graph, ['fx', 'plate'], props);

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
},{"./effect.js":98,"genish.js":37}],96:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Delay = inputProps => {
  let props = Object.assign( { delayLength: 44100 }, effect.defaults, Delay.defaults, inputProps ),
      delay = Object.create( effect )

  let out
  delay.__createGraph = function() {
    let isStereo = false
    if( out === undefined ) {
      isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false 
    }else{
      isStereo = out.input.isStereo
      out.isStereo = isStereo
    }    

    const input      = g.in( 'input' ),
          inputGain  = g.in( 'inputGain' ),
          delayTime  = g.in( 'time' ),
          wetdry     = g.in( 'wetdry' ),
          leftInput  = isStereo ? g.mul( input[ 0 ], inputGain ) : g.mul( input, inputGain ),
          rightInput = isStereo ? g.mul( input[ 1 ], inputGain ) : null
      
    const feedback = g.in( 'feedback' )

    // left channel
    const feedbackHistoryL = g.history()
    const echoL = g.delay( g.add( leftInput, g.mul( feedbackHistoryL.out, feedback ) ), delayTime, { size:props.delayLength })
    feedbackHistoryL.in( echoL )
    const left = g.mix( leftInput, echoL, wetdry )

    if( isStereo ) {
      // right channel
      const feedbackHistoryR = g.history()
      const echoR = g.delay( g.add( rightInput, g.mul( feedbackHistoryR.out, feedback ) ), delayTime, { size:props.delayLength })
      feedbackHistoryR.in( echoR )
      const right = g.mix( rightInput, echoR, wetdry )

      delay.graph = [ left, right ]
    }else{
      delay.graph = left 
    }
  }

  delay.__createGraph()
  delay.__requiresRecompilation = [ 'input' ]
  
  out = Gibberish.factory( 
    delay,
    delay.graph, 
    ['fx','delay'], 
    props 
  )

  return out
}

Delay.defaults = {
  input:0,
  feedback:.5,
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
    let props = Object.assign({}, effect.defaults, Distortion.defaults, inputProps),
        distortion = Object.create(effect),
        out;

    distortion.__createGraph = function () {
      let isStereo = false;
      if (out === undefined) {
        isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false;
      } else {
        isStereo = out.input.isStereo;
        out.isStereo = isStereo;
      }

      const input = g.in('input'),
            inputGain = g.in('inputGain'),
            shape1 = g.in('shape1'),
            shape2 = g.in('shape2'),
            pregain = g.in('pregain'),
            postgain = g.in('postgain');

      let lout;
      {
        'use jsdsp';
        const linput = isStereo ? g.mul(input[0], inputGain) : g.mul(input, inputGain);
        const ltop = genish.sub(g.exp(genish.mul(linput, genish.add(shape1, pregain))), g.exp(genish.mul(linput, genish.sub(shape2, pregain))));
        const lbottom = genish.add(g.exp(genish.mul(linput, pregain)), g.exp(genish.mul(genish.mul(-1, linput), pregain)));
        lout = genish.mul(genish.div(ltop, lbottom), postgain);
      }

      if (isStereo) {
        let rout;
        {
          'use jsdsp';
          const rinput = isStereo ? g.mul(input[1], inputGain) : g.mul(input, inputGain);
          const rtop = genish.sub(g.exp(genish.mul(rinput, genish.add(shape1, pregain))), g.exp(genish.mul(rinput, genish.sub(shape2, pregain))));
          const rbottom = genish.add(g.exp(genish.mul(rinput, pregain)), g.exp(genish.mul(genish.mul(-1, rinput), pregain)));
          rout = genish.mul(genish.div(rtop, rbottom), postgain);
        }

        distortion.graph = [lout, rout];
      } else {
        distortion.graph = lout;
      }
    };

    distortion.__createGraph();
    distortion.__requiresRecompilation = ['input'];

    out = Gibberish.factory(distortion, distortion.graph, ['fx', 'distortion'], props);
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
},{"./effect.js":98,"genish.js":37}],98:[function(require,module,exports){
let ugen = require( '../ugen.js' )()

let effect = Object.create( ugen )

Object.assign( effect, {
  defaults: { bypass:false, inputGain:1 },
  type:'effect'
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
      flanger = Object.create( proto ),
      out

  flanger.__createGraph = function() {
    let isStereo = false
    if( out === undefined ) {
      isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false 
    }else{
      isStereo = out.input.isStereo
      out.isStereo = isStereo
    }

    const input = g.in( 'input' ),
          inputGain = g.in( 'inputGain' ),
          delayLength = props.delayLength,
          feedbackCoeff = g.in( 'feedback' ),
          modAmount = g.in( 'offset' ),
          frequency = g.in( 'frequency' ),
          delayBufferL = g.data( delayLength )

    const writeIdx = g.accum( 1,0, { min:0, max:delayLength, interp:'none', mode:'samples' })
    
    const offset = g.mul( modAmount, 500 )

    const mod = props.mod === undefined ? g.cycle( frequency ) : props.mod
    
    const readIdx = g.wrap( 
      g.add( 
        g.sub( writeIdx, offset ), 
        mod//g.mul( mod, g.sub( offset, 1 ) ) 
      ), 
      0, 
      delayLength
    )

    const leftInput = isStereo ? input[0] : input

    const delayedOutL = g.peek( delayBufferL, readIdx, { interp:'linear', mode:'samples' })
    
    g.poke( delayBufferL, g.add( leftInput, g.mul( delayedOutL, feedbackCoeff ) ), writeIdx )

    const left = g.add( leftInput, delayedOutL )

    if( isStereo === true ) {
      const rightInput = input[1]
      const delayBufferR = g.data( delayLength )
      
      let delayedOutR = g.peek( delayBufferR, readIdx, { interp:'linear', mode:'samples' })

      g.poke( delayBufferR, g.add( rightInput, g.mul( delayedOutR, feedbackCoeff ) ), writeIdx )
      const right = g.add( rightInput, delayedOutR )

      flanger.graph = [ left, right ]

    }else{
      flanger.graph = left
    }
  }

  flanger.__createGraph()
  flanger.__requiresRecompilation = [ 'input' ]

  out = Gibberish.factory( 
    flanger,
    flanger.graph, 
    ['fx','flanger'], 
    props 
  ) 

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
  const props = Object.assign( {}, effect.defaults, Freeverb.defaults, inputProps ),
        reverb = Object.create( effect ) 

  let out 
  reverb.__createGraph = function() {
    let isStereo = false
    if( out === undefined ) {
      isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false 
    }else{
      isStereo = out.input.isStereo
    }    

    const combsL = [], combsR = []

    const input = g.in( 'input' ),
          inputGain = g.in( 'inputGain' ),
          wet1 = g.in( 'wet1'),
          wet2 = g.in( 'wet2' ),  
          dry = g.in( 'dry' ), 
          roomSize = g.in( 'roomSize' ), 
          damping = g.in( 'damping' )
    
    const __summedInput = isStereo === true ? g.add( input[0], input[1] ) : input,
         summedInput = g.mul( __summedInput, inputGain ),
         attenuatedInput = g.memo( g.mul( summedInput, tuning.fixedGain ) )
    
    // create comb filters in parallel...
    for( let i = 0; i < 8; i++ ) { 
      combsL.push( 
        combFilter( 
          attenuatedInput, 
          tuning.combTuning[i], 
          g.mul(damping,.4),
          g.mul( tuning.scaleRoom + tuning.offsetRoom, roomSize ) 
        ) 
      )
      combsR.push( 
        combFilter( 
          attenuatedInput, 
          tuning.combTuning[i] + tuning.stereoSpread, 
          g.mul(damping,.4), 
          g.mul( tuning.scaleRoom + tuning.offsetRoom, roomSize ) 
        ) 
      )
    }
    
    // ... and sum them with attenuated input, use of let is deliberate here
    let outL = g.add( attenuatedInput, ...combsL )
    let outR = g.add( attenuatedInput, ...combsR )
    
    // run through allpass filters in series
    for( let i = 0; i < 4; i++ ) { 
      outL = allPass( outL, tuning.allPassTuning[ i ] + tuning.stereoSpread )
      outR = allPass( outR, tuning.allPassTuning[ i ] + tuning.stereoSpread )
    }
    
    const outputL = g.add( g.mul( outL, wet1 ), g.mul( outR, wet2 ), g.mul( isStereo === true ? input[0] : input, dry ) ),
          outputR = g.add( g.mul( outR, wet1 ), g.mul( outL, wet2 ), g.mul( isStereo === true ? input[1] : input, dry ) )

    reverb.graph = [ outputL, outputR ]
  }

  reverb.__createGraph()
  reverb.__requiresRecompilation = [ 'input' ]

  out = Gibberish.factory( reverb, reverb.graph, ['fx','freeverb'], props )

  return out
}


Freeverb.defaults = {
  input: 0,
  wet1: 1,
  wet2: 0,
  dry: .5,
  roomSize: .925,
  damping:  .5,
}

return Freeverb 

}


},{"./effect.js":98,"genish.js":37}],102:[function(require,module,exports){
let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let RingMod = inputProps => {
  let props   = Object.assign( {}, RingMod.defaults, effect.defaults, inputProps ),
      ringMod = Object.create( effect ),
      out

  ringMod.__createGraph = function() {
    let isStereo = false
    if( out === undefined ) {
      isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false 
    }else{
      isStereo = out.input.isStereo
      out.isStereo = isStereo
    }    

    const input = g.in( 'input' ),
          inputGain = g.in( 'inputGain' ),
          frequency = g.in( 'frequency' ),
          gain = g.in( 'gain' ),
          mix = g.in( 'mix' )
    
    const leftInput = isStereo ? g.mul( input[0], inputGain ) : g.mul( input, inputGain ),
          sine = g.mul( g.cycle( frequency ), gain )
   
    const left = g.add( g.mul( leftInput, g.sub( 1, mix )), g.mul( g.mul( leftInput, sine ), mix ) ) 
        
    if( isStereo === true ) {
      const rightInput = g.mul( input[1], inputGain ),
            right = g.add( g.mul( rightInput, g.sub( 1, mix )), g.mul( g.mul( rightInput, sine ), mix ) ) 
      
      ringMod.graph = [ left, right ]
    }else{
      ringMod.graph = left
    }
  }

  ringMod.__createGraph() 
  ringMod.__requiresRecompilation = [ 'input' ]

  out = Gibberish.factory( 
    ringMod,
    ringMod.graph, 
    [ 'fx','ringMod'], 
    props 
  )
  
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

},{"./effect.js":98,"genish.js":37}],103:[function(require,module,exports){
const g = require( 'genish.js' ),
      effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
const Tremolo = inputProps => {
  const props   = Object.assign( {}, Tremolo.defaults, effect.defaults, inputProps ),
        tremolo = Object.create( effect )
  
  let out
  tremolo.__createGraph = function() {
    let isStereo = false
    if( out === undefined ) {
      isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false 
    }else{
      isStereo = out.input.isStereo
      out.isStereo = isStereo
    }    

    const input = g.in( 'input' ),
          inputGain = g.in( 'inputGain' ),
          frequency = g.in( 'frequency' ),
          amount = g.in( 'amount' )
    
    const leftInput = isStereo ? g.mul( input[0], inputGain ) : g.mul( input, inputGain )

    let osc
    if( props.shape === 'square' ) {
      osc = g.gt( g.phasor( frequency ), 0 )
    }else if( props.shape === 'saw' ) {
      osc = g.gtp( g.phasor( frequency ), 0 )
    }else{
      osc = g.cycle( frequency )
    }

    const mod = g.mul( osc, amount )
   
    const left = g.sub( leftInput, g.mul( leftInput, mod ) )

    if( isStereo === true ) {
      const rightInput = g.mul( input[1], inputGain ),
            right = g.mul( rightInput, mod )

      tremolo.graph = [ left, right ]
    }else{
      tremolo.graph = left
    }
  }
  
  tremolo.__createGraph()
  tremolo.__requiresRecompilation = [ 'input' ]

  out = Gibberish.factory( 
    tremolo,
    tremolo.graph,
    ['fx','tremolo'], 
    props 
  ) 
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

},{"./effect.js":98,"genish.js":37}],104:[function(require,module,exports){
const g = require( 'genish.js' ),
      effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
const Vibrato = inputProps => {
  const props   = Object.assign( {}, Vibrato.defaults, effect.defaults, inputProps ),
        vibrato = Object.create( effect )

  let out
  vibrato.__createGraph = function() {
    let isStereo = false
    if( out === undefined ) {
      isStereo = typeof props.input.isStereo !== 'undefined' ? props.input.isStereo : false 
    }else{
      isStereo = out.input.isStereo
      out.isStereo = isStereo
    }    

    const input = g.in( 'input' ),
          inputGain = g.in( 'inputGain' ),
          delayLength = 44100,
          feedbackCoeff = g.in( 'feedback' ),
          modAmount = g.in( 'amount' ),
          frequency = g.in( 'frequency' ),
          delayBufferL = g.data( delayLength )

    const writeIdx = g.accum( 1,0, { min:0, max:delayLength, interp:'none', mode:'samples' })
    
    const offset = g.mul( modAmount, 500 )
    
    const readIdx = g.wrap( 
      g.add( 
        g.sub( writeIdx, offset ), 
        g.mul( g.cycle( frequency ), g.sub( offset, 1 ) ) 
      ), 
      0, 
      delayLength
    )

    const leftInput = isStereo ? g.mul( input[0], inputGain ) : g.mul( input, inputGain )

    const delayedOutL = g.peek( delayBufferL, readIdx, { interp:'linear', mode:'samples' })
    
    g.poke( delayBufferL, g.add( leftInput, g.mul( delayedOutL, feedbackCoeff ) ), writeIdx )

    const left = delayedOutL

    if( isStereo === true ) {
      const rightInput = g.mul( input[1], inputGain )
      const delayBufferR = g.data( delayLength )
      
      const delayedOutR = g.peek( delayBufferR, readIdx, { interp:'linear', mode:'samples' })

      g.poke( delayBufferR, g.add( rightInput, mul( delayedOutR, feedbackCoeff ) ), writeIdx )
      const right = delayedOutR

      vibrato.graph = [ left, right ]
    }else{
      vibrato.graph = left 
    }
  }

  vibrato.__createGraph()
  vibrato.__requiresRecompilation = [ 'input' ]

  out = Gibberish.factory( 
    vibrato,
    vibrato.graph,    
    [ 'fx', 'vibrato' ], 
    props 
  ) 
  return out 
}

Vibrato.defaults = {
  input:0,
  feedback:.01,
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
  id: -1,
  preventProxy:false,
  proxyEnabled: true,

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
    ugen: null,//require('./ugen.js'),
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

    this.memory = MemoryHelper.create( numBytes, Float64Array )

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
      Gibberish.callback = Gibberish.generateCallback()
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
    this.Proxy        = require( './workletProxy.js' )( this )
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
    // do not delete the gain and the pan of the master bus 
    this.output.inputs.splice( 0, this.output.inputs.length - 2 )
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
      // clear memory... XXX should this be a MemoryHelper function?
    //this.memory.heap.fill(0)
    //this.memory.list = {}
    //Gibberish.output = this.Bus2()
    
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

    if( this.debug === true ) console.log( 'callback:\n', callbackBody.join('\n') )
    this.callbackNames.push( 'mem' )
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
    if( typeof obj === 'object' && obj !== null ) {
      if( obj.id !== undefined ) {
        const __obj = processor.ugens.get( obj.id )
        //console.log( 'retrieved:', __obj.name )

        //if( obj.prop !== undefined ) console.log( 'got a ssd.out', obj )
        return obj.prop !== undefined ? __obj[ obj.prop ] : __obj
      }else if( obj.isFunc === true ) {
        let func =  eval( '(' + obj.value + ')' )

        //console.log( 'replacing function:', func )

        return func
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
      
      if( !ugen.isop ) line += `${ugen.ugenName}( `

      // must get array so we can keep track of length for comma insertion
      let keys,err

      //try {
      keys = ugen.isop === true || ugen.type === 'bus' || ugen.type === 'analysis' ? Object.keys( ugen.inputs ) : [...ugen.inputNames ] 

      //}catch( e ){

      //  console.log( e )
      //  err = true
      //}
      
      //if( err === true ) return

      for( let i = 0; i < keys.length; i++ ) {
        let key = keys[ i ]
        // binop.inputs is actual values, not just property names
        let input 
        if( ugen.isop || ugen.type ==='bus' || ugen.type === 'analysis' ) {
          input = ugen.inputs[ key ]
        }else{
          //if( key === 'memory' ) continue;
  
          //console.log( 'ugen:', ugen, 'key:', key )
          input = ugen[ key ] 
        }

        //if( Gibberish.mode === 'processor' ) console.log( 'processor input:', key, input )
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
            if( isNaN(key) ) {
              line += `mem[${ugen.__addresses__[ key ]}]`//input
            }else{
              line += input
            }
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

            if( !input.isop ) {
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
            line += ugen.isop ? ' ' + ugen.op + ' ' : ', ' 
          }
        }
      }
      
      //if( ugen.type === 'bus' ) line += ', ' 
      if( ugen.type === 'analysis' || (ugen.type === 'bus' && keys.length > 0) ) line += ', '
      if( !ugen.isop && ugen.type !== 'seq' ) line += 'mem'
      line += ugen.isop ? '' : ' )'

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

Gibberish.prototypes.Ugen = require( './ugen.js' )( Gibberish )
Gibberish.utilities = require( './utilities.js' )( Gibberish )


module.exports = Gibberish

},{"./analysis/analyzers.js":75,"./envelopes/envelopes.js":80,"./filters/filters.js":89,"./fx/effect.js":98,"./fx/effects.js":99,"./instruments/instrument.js":110,"./instruments/instruments.js":111,"./instruments/polyMixin.js":115,"./instruments/polytemplate.js":116,"./misc/binops.js":120,"./misc/bus.js":121,"./misc/bus2.js":122,"./misc/monops.js":123,"./misc/panner.js":124,"./misc/time.js":125,"./oscillators/oscillators.js":128,"./scheduling/scheduler.js":131,"./scheduling/seq2.js":132,"./scheduling/sequencer.js":133,"./ugen.js":134,"./ugenTemplate.js":135,"./utilities.js":136,"./workletProxy.js":137,"genish.js":37,"memory-helper":140}],106:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const Conga = argumentProps => {
    let conga = Object.create( instrument ),
        frequency = g.in( 'frequency' ),
        decay = g.in( 'decay' ),
        gain  = g.in( 'gain' ),
        loudness = g.in( 'loudness' )

    let props = Object.assign( {}, Conga.defaults, argumentProps )

    let trigger = g.bang(),
        impulse = g.mul( trigger, 60 ),
        _decay =  g.sub( .101, g.div( decay, 10 ) ), // create range of .001 - .099
        bpf = g.svf( impulse, frequency, _decay, 2, false ),
        out = g.mul( bpf, g.mul( loudness, gain ) )
    

    conga.env = trigger
    Gibberish.factory( conga, out, ['instruments','conga'], props  )

    return conga
  }
  
  Conga.defaults = {
    gain: .25,
    frequency:190,
    decay: .85,
    loudness: 1
  }

  return Conga

}

},{"./instrument.js":110,"genish.js":37}],107:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const Cowbell = argumentProps => {
    let cowbell = Object.create( instrument )
    
    const decay   = g.in( 'decay' ),
          gain    = g.in( 'gain' ),
          loudness = g.in( 'loudness' )

    const props = Object.assign( {}, Cowbell.defaults, argumentProps )

    const bpfCutoff = g.param( 'bpfc', 1000 ),
          s1 = Gibberish.oscillators.factory( 'square', 560 ),
          s2 = Gibberish.oscillators.factory( 'square', 845 ),
          eg = g.decay( g.mul( decay, g.gen.samplerate * 2 ) ), 
          bpf = g.svf( g.add( s1,s2 ), bpfCutoff, 3, 2, false ),
          envBpf = g.mul( bpf, eg ),
          out = g.mul( envBpf, g.mul( gain, loudness ) )

    cowbell.env = eg 

    cowbell.isStereo = false

    cowbell = Gibberish.factory( cowbell, out, ['insturments', 'cowbell'], props  )
    
    return cowbell
  }
  
  Cowbell.defaults = {
    gain: 1,
    decay:.5,
    loudness:1
  }

  return Cowbell

}

},{"./instrument.js":110,"genish.js":37}],108:[function(require,module,exports){
const g = require('genish.js'),
      instrument = require('./instrument.js');

const genish = g;

module.exports = function (Gibberish) {

  const FM = inputProps => {
    let syn = Object.create(instrument);

    let frequency = g.in('frequency'),
        glide = g.in('glide'),
        slidingFreq = g.slide(frequency, glide, glide),
        cmRatio = g.in('cmRatio'),
        index = g.in('index'),
        feedback = g.in('feedback'),
        attack = g.in('attack'),
        decay = g.in('decay'),
        sustain = g.in('sustain'),
        sustainLevel = g.in('sustainLevel'),
        release = g.in('release'),
        loudness = g.in('loudness');

    const props = Object.assign({}, FM.defaults, inputProps);
    Object.assign(syn, props);

    syn.__createGraph = function () {
      const env = Gibberish.envelopes.factory(props.useADSR, props.shape, attack, decay, sustain, sustainLevel, release, props.triggerRelease);

      const feedbackssd = g.history(0);

      const modOsc = Gibberish.oscillators.factory(syn.modulatorWaveform, g.add(g.mul(slidingFreq, cmRatio), g.mul(feedbackssd.out, feedback, index)), syn.antialias);

      {
        'use jsdsp';
        const modOscWithIndex = genish.mul(genish.mul(genish.mul(modOsc, slidingFreq), index), loudness);
        const modOscWithEnv = genish.mul(modOscWithIndex, env);

        const modOscWithEnvAvg = genish.mul(.5, genish.add(modOscWithEnv, feedbackssd.out));

        feedbackssd.in(modOscWithEnvAvg);

        const carrierOsc = Gibberish.oscillators.factory(syn.carrierWaveform, g.add(slidingFreq, modOscWithEnvAvg), syn.antialias);
        const carrierOscWithEnv = genish.mul(carrierOsc, env);

        const baseCutoffFreq = genish.mul(g.in('cutoff'), frequency);
        const cutoff = genish.mul(genish.mul(baseCutoffFreq, g.pow(2, genish.mul(g.in('filterMult'), loudness))), env);
        //const cutoff = g.add( g.in('cutoff'), g.mul( g.in('filterMult'), env ) )
        const filteredOsc = Gibberish.filters.factory(carrierOscWithEnv, cutoff, g.in('Q'), g.in('saturation'), syn);

        const synthWithGain = genish.mul(genish.mul(filteredOsc, g.in('gain')), loudness);

        let panner;
        if (props.panVoices === true) {
          panner = g.pan(synthWithGain, synthWithGain, g.in('pan'));
          syn.graph = [panner.left, panner.right];
        } else {
          syn.graph = synthWithGain;
        }
      }

      syn.env = env;
    };

    syn.__requiresRecompilation = ['carrierWaveform', 'modulatorWaveform', 'antialias', 'filterType', 'filterMode'];
    syn.__createGraph();

    const out = Gibberish.factory(syn, syn.graph, ['instruments', 'FM'], props);

    return out;
  };

  FM.defaults = {
    carrierWaveform: 'sine',
    modulatorWaveform: 'sine',
    attack: 44,
    feedback: 0,
    decay: 22050,
    sustain: 44100,
    sustainLevel: .6,
    release: 22050,
    useADSR: false,
    shape: 'linear',
    triggerRelease: false,
    gain: .25,
    cmRatio: 2,
    index: 5,
    pulsewidth: .25,
    frequency: 220,
    pan: .5,
    antialias: false,
    panVoices: false,
    glide: 1,
    saturation: 1,
    filterMult: 1.5,
    Q: .25,
    cutoff: .35,
    filterType: 0,
    filterMode: 0,
    isLowPass: 1,
    loudness: 1

  };

  const PolyFM = Gibberish.PolyTemplate(FM, ['glide', 'frequency', 'attack', 'decay', 'pulsewidth', 'pan', 'gain', 'cmRatio', 'index', 'saturation', 'filterMult', 'Q', 'cutoff', 'antialias', 'filterType', 'carrierWaveform', 'modulatorWaveform', 'filterMode', 'feedback', 'useADSR', 'sustain', 'release', 'sustainLevel']);
  PolyFM.defaults = FM.defaults;

  return [FM, PolyFM];
};
},{"./instrument.js":110,"genish.js":37}],109:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  let Hat = argumentProps => {
    let hat = Object.create( instrument ),
        tune  = g.in( 'tune' ),
        scaledTune = g.memo( g.add( .4, tune ) ),
        decay  = g.in( 'decay' ),
        gain  = g.in( 'gain' ),
        loudness = g.in( 'loudness' )

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
        eg = g.decay( g.mul( decay, g.gen.samplerate * 2 ), { initValue:0 }), 
        bpf = g.svf( sum, bpfCutoff, .5, 2, false ),
        envBpf = g.mul( bpf, eg ),
        hpf = g.filter24( envBpf, 0, hpfCutoff, 0 ),
        out = g.mul( hpf, g.mul( gain, loudness ) )

    hat.env = eg 
    hat.isStereo = false

    const __hat = Gibberish.factory( hat, out, ['instruments','hat'], props  )
    

    return __hat
  }
  
  Hat.defaults = {
    gain:  .5,
    tune: .6,
    decay:.1,
    loudness:1
  }

  return Hat

}

},{"./instrument.js":110,"genish.js":37}],110:[function(require,module,exports){
const ugen = require( '../ugen.js' )()

const instrument = Object.create( ugen )

Object.assign( instrument, {
  type:'instrument',

  note( freq, loudness=null ) {
    // if binop is should be used...
    if( isNaN( this.frequency ) ) { 
      // and if we are assigning binop for the first time...
      if( this.frequency.isop !== true ) {
        let obj = Gibberish.processor.ugens.get( this.frequency.id )
        obj.inputs[0] = freq
        this.frequency = obj
      }else{
        this.frequency.inputs[0] = freq
        Gibberish.dirty( this )
      }
    }else{
      this.frequency = freq
    }

    if( loudness !== null ) this.loudness = loudness 

    this.env.trigger()
  },

  trigger( loudness = 1 ) {
    this.loudness = loudness
    this.env.trigger()
  },

})

module.exports = instrument

},{"../ugen.js":134}],111:[function(require,module,exports){
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
          withGain = g.mul( damped, g.mul( g.in('loudness'),g.in('gain')) )

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
    panVoices:false,
    loudness:1
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

  const PolyKPS = Gibberish.PolyTemplate( KPS, ['frequency','decay','damping','pan','gain', 'glide'], envCheckFactory ) 
  PolyKPS.defaults = KPS.defaults

  return [ KPS, PolyKPS ]

}

},{"./instrument.js":110,"genish.js":37}],113:[function(require,module,exports){
let g = require( 'genish.js' ),
    instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {

  const Kick = inputProps => {
    // establish prototype chain
    const kick = Object.create( instrument )

    // define inputs
    const frequency = g.in( 'frequency' ),
          decay = g.in( 'decay' ),
          tone  = g.in( 'tone' ),
          gain  = g.in( 'gain' ),
          loudness = g.in( 'loudness' )
    
    // create initial property set
    const props = Object.assign( {}, Kick.defaults, inputProps )
    Object.assign( kick, props )

    // create DSP graph
    const trigger = g.bang(),
          impulse = g.mul( trigger, 60 ),
          scaledDecay = g.sub( 1.005, decay ), // -> range { .005, 1.005 }
          scaledTone = g.add( 50, g.mul( tone, g.mul(4000, loudness) ) ), // -> range { 50, 4050 }
          bpf = g.svf( impulse, frequency, scaledDecay, 2, false ),
          lpf = g.svf( bpf, scaledTone, .5, 0, false ),
          graph = g.mul( lpf, g.mul(gain, loudness) )
    
    kick.env = trigger
    const out = Gibberish.factory( kick, graph, ['instruments','kick'], props  )

    return out
  }
  
  Kick.defaults = {
    gain: 1,
    frequency:85,
    tone: .25,
    decay:.9,
    loudness:1
  }

  return Kick

}

},{"./instrument.js":110,"genish.js":37}],114:[function(require,module,exports){
const g = require('genish.js'),
      instrument = require('./instrument.js'),
      feedbackOsc = require('../oscillators/fmfeedbackosc.js');

module.exports = function (Gibberish) {

  const Synth = argumentProps => {
    const syn = Object.create(instrument),
          oscs = [],
          frequency = g.in('frequency'),
          glide = g.in('glide'),
          slidingFreq = g.memo(g.slide(frequency, glide, glide)),
          attack = g.in('attack'),
          decay = g.in('decay'),
          sustain = g.in('sustain'),
          sustainLevel = g.in('sustainLevel'),
          release = g.in('release'),
          loudness = g.in('loudness');

    const props = Object.assign({}, Synth.defaults, argumentProps);
    Object.assign(syn, props);

    syn.__createGraph = function () {
      const env = Gibberish.envelopes.factory(props.useADSR, props.shape, attack, decay, sustain, sustainLevel, release, props.triggerRelease);

      for (let i = 0; i < 3; i++) {
        let osc, freq;

        switch (i) {
          case 1:
            freq = g.add(slidingFreq, g.mul(slidingFreq, g.in('detune2')));
            break;
          case 2:
            freq = g.add(slidingFreq, g.mul(slidingFreq, g.in('detune3')));
            break;
          default:
            freq = slidingFreq;
        }

        osc = Gibberish.oscillators.factory(syn.waveform, freq, syn.antialias);

        oscs[i] = osc;
      }

      const oscSum = g.add(...oscs),
            oscWithEnv = g.mul(oscSum, env),
            baseCutoffFreq = g.mul(g.in('cutoff'), frequency),
            cutoff = g.mul(g.mul(baseCutoffFreq, g.pow(2, g.mul(g.in('filterMult'), loudness))), env),
            filteredOsc = Gibberish.filters.factory(oscWithEnv, cutoff, g.in('Q'), g.in('saturation'), syn);

      if (props.panVoices) {
        const panner = g.pan(filteredOsc, filteredOsc, g.in('pan'));
        syn.graph = [g.mul(panner.left, g.in('gain'), loudness), g.mul(panner.right, g.in('gain'), loudness)];
      } else {
        syn.graph = g.mul(filteredOsc, g.in('gain'), loudness);
      }

      syn.env = env;
    };

    syn.__requiresRecompilation = ['waveform', 'antialias', 'filterType', 'filterMode'];
    syn.__createGraph();

    const out = Gibberish.factory(syn, syn.graph, ['instruments', 'Monosynth'], props);

    return out;
  };

  Synth.defaults = {
    waveform: 'saw',
    attack: 44,
    decay: 22050,
    sustain: 44100,
    sustainLevel: .6,
    release: 22050,
    useADSR: false,
    shape: 'linear',
    triggerRelease: false,
    gain: .25,
    pulsewidth: .25,
    frequency: 220,
    pan: .5,
    detune2: .005,
    detune3: -.005,
    cutoff: 1,
    resonance: .25,
    Q: .5,
    panVoices: false,
    glide: 1,
    antialias: false,
    filterType: 1,
    filterMode: 0, // 0 = LP, 1 = HP, 2 = BP, 3 = Notch
    saturation: .5,
    filterMult: 4,
    isLowPass: true,
    loudness: 1
  };

  let PolyMono = Gibberish.PolyTemplate(Synth, ['frequency', 'attack', 'decay', 'cutoff', 'Q', 'detune2', 'detune3', 'pulsewidth', 'pan', 'gain', 'glide', 'saturation', 'filterMult', 'antialias', 'filterType', 'waveform', 'filterMode']);
  PolyMono.defaults = Synth.defaults;

  return [Synth, PolyMono];
};
},{"../oscillators/fmfeedbackosc.js":127,"./instrument.js":110,"genish.js":37}],115:[function(require,module,exports){
// XXX TOO MANY GLOBAL GIBBERISH VALUES

const Gibberish = require( '../index.js' )

module.exports = {
  note( freq, gain ) {
    // will be sent to processor node via proxy method...
    if( Gibberish.mode !== 'worklet' ) {
      let voice = this.__getVoice__()
      //Object.assign( voice, this.properties )
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

    // XXX uncomment this line to turn on dynamically connecting
    // disconnecting individual voices from graph
    //Gibberish.blockCallbacks.push( envCheck )
  },

  __getVoice__() {
    return this.voices[ this.voiceCount++ % this.voices.length ]
  },

  chord( frequencies ) {
    // will be sent to processor node via proxy method...
    if( Gibberish !== undefined && Gibberish.mode !== 'worklet' ) {
      frequencies.forEach( v => this.note( v ) )
      this.triggerChord = frequencies
    }
  },

  free() {
    for( let child of this.voices ) child.free()
  }
}

},{"../index.js":105}],116:[function(require,module,exports){
/*
 * This files creates a factory generating polysynth constructors.
 */

const g = require( 'genish.js' )
const __proxy = require( '../workletProxy.js' )

module.exports = function( Gibberish ) {
  const proxy = __proxy( Gibberish )

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
      const properties = Object.assign( {}, { isStereo:true, maxVoices:4 }, props )

      //const synth = properties.isStereo === true ? Object.create( stereoProto ) : Object.create( monoProto )
      const synth = properties.isStereo === true ? Gibberish.Bus2({ __useProxy__:false }) : Gibberish.Bus({ __useProxy__:false }) 

      Object.assign( 
        synth, 

        {
          voices: [],
          maxVoices: properties.maxVoices, 
          voiceCount: 0,
          envCheck: _envCheck,
          dirty: true,
          ugenName: 'poly' + ugen.name + '_' + synth.id + '_' + ( properties.isStereo ? 2 : 1 ),
          properties
        },

        Gibberish.mixins.polyinstrument
      )

      properties.panVoices = true//false//properties.isStereo
      synth.callback.ugenName = synth.ugenName

      const storedId = properties.id
      if( properties.id !== undefined ) delete properties.id 

      for( let i = 0; i < synth.maxVoices; i++ ) {
        properties.id = synth.id +'_'+i
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

      properties.id = storedId

      TemplateFactory.setupProperties( synth, ugen, properties.isStereo ? propertyList : _propertyList )

      return proxy( ['instruments', 'Poly'+ugen.name], properties, synth ) 
    }

    return Template
  }

  TemplateFactory.setupProperties = function( synth, ugen, props ) {
    for( let property of props ) {
      if( property === 'pan' || property === 'id' ) continue
      Object.defineProperty( synth, property, {
        get() {
          return synth.properties[ property ] || ugen.defaults[ property ]
        },
        set( v ) {
          synth.properties[ property ] = v
          for( let child of synth.voices ) {
            child[ property ] = v
          }
        }
      })
    }
  }

  return TemplateFactory

}

},{"../workletProxy.js":137,"genish.js":37}],117:[function(require,module,exports){
const g = require( 'genish.js' ),
      instrument = require( './instrument.js' )

module.exports = function( Gibberish ) {
  let proto = Object.create( instrument )

  Object.assign( proto, {
    note( rate ) {
      this.rate = rate
      if( rate > 0 ) {
        this.__trigger()
      }else{
        this.__phase__.value = this.data.buffer.length - 1 
      }
    },
    trigger( volume ) {
      if( volume !== undefined ) this.gain = volume

      // if we're playing the sample forwards...
      if( Gibberish.memory.heap[ this.__rateStorage__.memory.values.idx ] > 0 ) {
        this.__trigger()
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
          rate = g.in( 'rate' ), shouldLoop = g.in( 'loops' ),
          loudness = g.in( 'loudness' ),
          // rate storage is used to determine whether we're playing
          // the sample forward or in reverse, for use in the 'trigger' method.
          rateStorage = g.data([0], 1, { meta:true })

    Object.assign( syn, props )

    if( Gibberish.mode === 'worklet' ) {
      syn.__meta__ = {
        address:'add',
        name: ['instruments', 'Sampler'],
        properties: JSON.stringify(props), 
        id: syn.id
      }

      Gibberish.worklet.ugens.set( syn.id, syn )

      Gibberish.worklet.port.postMessage( syn.__meta__ )
    }

    syn.__createGraph = function() {
      syn.__bang__ = g.bang()
      syn.__trigger = syn.__bang__.trigger

      syn.__phase__ = g.counter( rate, start, end, syn.__bang__, shouldLoop, { shouldWrap:false, initialValue:9999999 })
      
      syn.__rateStorage__ = rateStorage
      rateStorage[0] = rate

      // XXX we added our recorded 'rate' param and then effectively substract it,
      // so that its presence in the graph will force genish to actually record the 
      // rate as the input. this is extremely hacky... there should be a way to record
      // value without having to include it in the graph!
      syn.graph = g.add( g.mul( 
        g.ifelse( 
          g.and( g.gte( syn.__phase__, start ), g.lt( syn.__phase__, end ) ),
          g.peek( 
            syn.data, 
            syn.__phase__,
            { mode:'samples' }
          ),
          0
        ), 
        g.mul( loudness, g.in('gain') )
      ), rateStorage[0], g.mul( rateStorage[0], -1 ) )
    }

    const onload = buffer => {
      if( Gibberish.mode === 'worklet' ) {
        const memIdx = Gibberish.memory.alloc( syn.data.memory.values.length, true )

        Gibberish.worklet.port.postMessage({
          address:'copy',
          id: syn.id,
          idx: memIdx,
          buffer: syn.data.buffer
        })

      }else if ( Gibberish.mode === 'processor' ) {
        syn.data.buffer = buffer
        syn.data.memory.values.length = syn.data.dim = buffer.length
        syn.__redoGraph() 
      }

      if( typeof syn.onload === 'function' ){  
        syn.onload( buffer || syn.data.buffer )
      }
      if( syn.end === -999999999 ) syn.end = syn.data.buffer.length - 1
    }

    //if( props.filename ) {
    syn.loadFile = function( filename ) {
      if( Gibberish.mode !== 'processor' ) { 
        syn.data = g.data( filename )
      }else{
        syn.data = g.data( new Float32Array() )
      }

      syn.data.onload = onload
    }

    syn.loadBuffer = function( buffer ) {
      if( Gibberish.mode === 'processor' ) {
        syn.data.buffer = buffer
        syn.data.memory.values.length = syn.data.dim = buffer.length
        syn.__redoGraph() 
      }
    }

    if( props.filename !== undefined ) {
      syn.loadFile( props.filename )
    }else{
      syn.data = g.data( new Float32Array() )
    }

    syn.data.onload = onload

    syn.__createGraph()
    
    const out = Gibberish.factory( 
      syn,
      syn.graph,
      ['instruments','sampler'], 
      props 
    ) 

    return out
  }

  Sampler.defaults = {
    gain: 1,
    pan: .5,
    rate: 1,
    panVoices:false,
    loops: 0,
    start:0,
    end:-999999999,
    loudness:1
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
        gain  = g.in( 'gain' ),
        loudness = g.in( 'loudness' )

    let props = Object.assign( {}, Snare.defaults, argumentProps )

    let eg = g.decay( scaledDecay, { initValue:0 } ), 
        check = g.memo( g.gt( eg, .0005 ) ),
        rnd = g.mul( g.noise(), eg ),
        hpf = g.svf( rnd, g.add( 1000, g.mul( g.add( 1, tune), 1000 ) ), .5, 1, false ),
        snap = g.mul( g.gtp( g.mul( hpf, snappy ), 0 ), loudness ), // rectify
        bpf1 = g.svf( eg, g.mul( 180, g.add( tune, 1 ) ), .05, 2, false ),
        bpf2 = g.svf( eg, g.mul( 330, g.add( tune, 1 ) ), .05, 2, false ),
        out  = g.memo( g.add( snap, bpf1, g.mul( bpf2, .8 ) ) ), //XXX why is memo needed?
        scaledOut = g.mul( out, g.mul( gain, loudness ) )
    
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
    gain: .5,
    frequency:1000,
    tune:0,
    snappy: 1,
    decay:.1,
    loudness:1
  }

  return Snare

}

},{"./instrument.js":110,"genish.js":37}],119:[function(require,module,exports){
const g = require('genish.js'),
      instrument = require('./instrument.js');

const genish = g;

module.exports = function (Gibberish) {

  const Synth = inputProps => {
    const syn = Object.create(instrument);

    const frequency = g.in('frequency'),
          loudness = g.in('loudness'),
          glide = g.in('glide'),
          slidingFreq = g.slide(frequency, glide, glide),
          attack = g.in('attack'),
          decay = g.in('decay'),
          sustain = g.in('sustain'),
          sustainLevel = g.in('sustainLevel'),
          release = g.in('release');

    const props = Object.assign({}, Synth.defaults, inputProps);
    Object.assign(syn, props);

    syn.__createGraph = function () {
      const osc = Gibberish.oscillators.factory(syn.waveform, slidingFreq, syn.antialias);

      const env = Gibberish.envelopes.factory(props.useADSR, props.shape, attack, decay, sustain, sustainLevel, release, props.triggerRelease);

      // below doesn't work as it attempts to assign to release property triggering codegen...
      // syn.release = ()=> { syn.env.release() }

      {
        'use jsdsp';
        let oscWithEnv = genish.mul(genish.mul(osc, env), loudness),
            panner;

        const baseCutoffFreq = genish.mul(g.in('cutoff'), frequency);
        const cutoff = genish.mul(genish.mul(baseCutoffFreq, g.pow(2, genish.mul(g.in('filterMult'), loudness))), env);
        const filteredOsc = Gibberish.filters.factory(oscWithEnv, cutoff, g.in('Q'), g.in('saturation'), props);

        let synthWithGain = genish.mul(filteredOsc, g.in('gain'));

        if (syn.panVoices === true) {
          panner = g.pan(synthWithGain, synthWithGain, g.in('pan'));
          syn.graph = [panner.left, panner.right];
        } else {
          syn.graph = synthWithGain;
        }

        syn.env = env;
        syn.osc = osc;
        syn.filter = filteredOsc;
      }
    };

    syn.__requiresRecompilation = ['waveform', 'antialias', 'filterType', 'filterMode', 'useADSR', 'shape'];
    syn.__createGraph();

    const out = Gibberish.factory(syn, syn.graph, ['instruments', 'synth'], props);

    return out;
  };

  Synth.defaults = {
    waveform: 'saw',
    attack: 44,
    decay: 22050,
    sustain: 44100,
    sustainLevel: .6,
    release: 22050,
    useADSR: false,
    shape: 'linear',
    triggerRelease: false,
    gain: .5,
    pulsewidth: .25,
    frequency: 220,
    pan: .5,
    antialias: false,
    panVoices: false,
    loudness: 1,
    glide: 1,
    saturation: 1,
    filterMult: 2,
    Q: .25,
    cutoff: .5,
    filterType: 0,
    filterMode: 0,
    isLowPass: 1
  };

  // do not include velocity, which shoudl always be per voice
  let PolySynth = Gibberish.PolyTemplate(Synth, ['frequency', 'attack', 'decay', 'pulsewidth', 'pan', 'gain', 'glide', 'saturation', 'filterMult', 'Q', 'cutoff', 'resonance', 'antialias', 'filterType', 'waveform', 'filterMode']);
  PolySynth.defaults = Synth.defaults;

  return [Synth, PolySynth];
};
},{"./instrument.js":110,"genish.js":37}],120:[function(require,module,exports){
const ugenproto = require( '../ugen.js' )()
const __proxy     = require( '../workletProxy.js' )

module.exports = function( Gibberish ) {
  const proxy = __proxy( Gibberish )

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
      Object.assign( ugen, { isop:true, op:'+', inputs:args, ugenName:'add' + id, id } )

      return proxy( ['binops','Add'], { isop:true, inputs:args }, ugen )
    },

    Sub( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { isop:true, op:'-', inputs:args, ugenName:'sub' + id, id } )

      return proxy( ['binops','Sub'], { isop:true, inputs:args }, ugen )
    },

    Mul( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { isop:true, op:'*', inputs:args, ugenName:'mul' + id, id } )

      return proxy( ['binops','Mul'], { isop:true, inputs:args }, ugen )
    },

    Div( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { isop:true, op:'/', inputs:args, ugenName:'div' + id, id } )
    
      return proxy( ['binops','Div'], { isop:true, inputs:args }, ugen )
    },

    Mod( ...args ) {
      const id = Gibberish.factory.getUID()
      const ugen = Object.create( ugenproto )
      Object.assign( ugen, { isop:true, op:'%', inputs:args, ugenName:'mod' + id, id } )

      return proxy( ['binops','Mod'], { isop:true, inputs:args }, ugen )
    },   
  }

  return Binops
}

},{"../ugen.js":134,"../workletProxy.js":137}],121:[function(require,module,exports){
let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )(),
    __proxy= require( '../workletProxy.js' )

module.exports = function( Gibberish ) {
  const proxy = __proxy( Gibberish )
  const Bus = Object.create( ugen )

  Object.assign( Bus, {
    gain: {
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
      const props = Object.assign({}, Bus.defaults, { inputs:[0] }, _props )

      const sum = Gibberish.binops.Add( ...props.inputs )
      const mul = Gibberish.binops.Mul( sum, props.gain )

      const graph = Gibberish.Panner({ input:mul, pan: props.pan })

      graph.sum = sum
      graph.mul = mul
      graph.disconnectUgen = Bus.disconnectUgen

      graph.__properties__ = props

      const out = props.__useProxy__ === true ? proxy( ['Bus'], props, graph ) : graph

      Object.defineProperty( out, 'gain', Bus.gain )

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

    // can't include inputs here as it will be sucked up by Gibber,
    // instead pass during Object.assign() after defaults.
    defaults: { gain:1, pan:.5, __useProxy__:true }
  })

  const constructor = Bus.create.bind( Bus )
  constructor.defaults = Bus.defaults

  return constructor
}


},{"../ugen.js":134,"../workletProxy.js":137,"genish.js":37}],122:[function(require,module,exports){
const g = require( 'genish.js' ),
      ugen = require( '../ugen.js' )(),
      __proxy = require( '../workletProxy.js' )

module.exports = function( Gibberish ) {
  const Bus2 = Object.create( ugen )
  const proxy = __proxy( Gibberish )

  let bufferL, bufferR
  
  Object.assign( Bus2, { 
    create( __props ) {

      if( bufferL === undefined ) {
        bufferL = Gibberish.genish.gen.globals.panL.memory.values.idx
        bufferR = Gibberish.genish.gen.globals.panR.memory.values.idx
      }

      // XXX must be same type as what is returned by genish for type checks to work correctly
      const output = new Float64Array( 2 ) 

      const bus = Object.create( Bus2 )

      let init = false

      const props = Object.assign({}, Bus2.defaults, __props )

      Object.assign( 
        bus,

        {
          callback() {
            output[ 0 ] = output[ 1 ] = 0
            const lastIdx = arguments.length - 1
            const memory  = arguments[ lastIdx ]
            const pan  = arguments[ lastIdx - 1 ]
            const gain = arguments[ lastIdx - 2 ]

            for( let i = 0; i < lastIdx - 2; i+= 3 ) {
              const input = arguments[ i ],
                    level = arguments[ i + 1 ],
                    isStereo = arguments[ i + 2 ]

              output[ 0 ] += isStereo === true ? input[ 0 ] * level : input * level

              output[ 1 ] += isStereo === true ? input[ 1 ] * level : input * level
            }

            const panRawIndex  = pan * 1023,
                  panBaseIndex = panRawIndex | 0,
                  panNextIndex = (panBaseIndex + 1) & 1023,
                  interpAmount = panRawIndex - panBaseIndex,
                  panL = memory[ bufferL + panBaseIndex ] 
                    + ( interpAmount * ( memory[ bufferL + panNextIndex ] - memory[ bufferL + panBaseIndex ] ) ),
                  panR = memory[ bufferR + panBaseIndex ] 
                    + ( interpAmount * ( memory[ bufferR + panNextIndex ] - memory[ bufferR + panBaseIndex ] ) )
            
            output[0] *= gain * panL
            output[1] *= gain * panR

            return output
          },
          id : Gibberish.factory.getUID(),
          dirty : false,
          type : 'bus',
          inputs:[ 1, .5 ],
          isStereo: true,
          __properties__:props
        },

        Bus2.defaults,

        props
      )

      bus.ugenName = bus.callback.ugenName = 'bus2_' + bus.id

      const out = bus.__useProxy__ === true ? proxy( ['Bus2'], props, bus ) : bus


      // we have to include custom properties for these as the argument list for
      // the compiled output function is variable
      // so codegen can't know the correct argument order for the function
      let pan = .5
      Object.defineProperty( out, 'pan', {
        get() { return pan },
        set(v){ 
          pan = v
          out.inputs[ out.inputs.length - 1 ] = pan
          Gibberish.dirty( out )
        }
      })

      let gain = 1
      Object.defineProperty( out, 'gain', {
        get() { return pan },
        set(v){ 
          gain = v
          out.inputs[ out.inputs.length - 2 ] = gain
          Gibberish.dirty( out )
        }
      })

      return out
    },
    
    disconnectUgen( ugen ) {
      let removeIdx = this.inputs.indexOf( ugen )

      if( removeIdx !== -1 ) {
        this.inputs.splice( removeIdx, 3 )
        Gibberish.dirty( this )
      }
    },

    defaults: { gain:1, pan:.5, __useProxy__:true }
  })

  const constructor = Bus2.create.bind( Bus2 )
  constructor.defaults = Bus2.defaults

  return constructor

}

},{"../ugen.js":134,"../workletProxy.js":137,"genish.js":37}],123:[function(require,module,exports){
const  g    = require( 'genish.js'  ),
       ugen = require( '../ugen.js' )()

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
      
      const __out = Gibberish.factory( abs, graph, ['monops','abs'], Object.assign({}, Monops.defaults, { inputs:[input], isop:true }) )

      return __out
    },

    Pow( input, exponent ) {
      const pow = Object.create( ugen )
      const graph = g.pow( g.in('input'), g.in('exponent') )
      
      Gibberish.factory( pow, graph, ['monops','pow'], Object.assign({}, Monops.defaults, { inputs:[input], exponent, isop:true }) )

      return pow
    },
    Clamp( input, min, max ) {
      const clamp = Object.create( ugen )
      const graph = g.clamp( g.in('input'), g.in('min'), g.in('max') )
      
      const __out = Gibberish.factory( clamp, graph, ['monops','clamp'], Object.assign({}, Monops.defaults, { inputs:[input], isop:true, min, max }) )

      return __out
    },

    Merge( input ) {
      const merger = Object.create( ugen )
      const cb = function( _input ) {
        return _input[0] + _input[1]
      }

      Gibberish.factory( merger, g.in( 'input' ), ['monops','merge'], { inputs:[input], isop:true }, cb )
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

const ugen = require( '../ugen.js' )()

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

  Gibberish.factory( panner, [ graph.left, graph.right], ['panner'], props )
  
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
      ugen = require( '../ugen.js' )(),
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
    ugen = require( '../ugen.js' )()

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
      return a.priority < b.priority ? -1 : a.priority > b.priority ? 1 : 0;
//b.priority - a.priority 

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

      if( isNaN( next.time ) ) {
        this.queue.pop()
      }
      
      while( this.phase >= next.time ) {
        next.func( next.priority )
        this.queue.pop()
        next = this.queue.peek()

        // XXX this happens when calling sequencer.stop()... why?
        if( next === undefined ) break
      }
    }

    this.phase++
  },
}

module.exports = Scheduler

},{"../external/priorityqueue.js":82,"big.js":138}],132:[function(require,module,exports){
const g = require( 'genish.js' ),
      __proxy = require( '../workletProxy.js' ),
      ugen = require( '../ugen.js' )()

module.exports = function( Gibberish ) {
  const __proto__ = Object.create( ugen )

  const proxy = __proxy( Gibberish )

  Object.assign( __proto__, {
    start() {
      Gibberish.analyzers.push( this )
      Gibberish.dirty( Gibberish.analyzers )
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
            properties = Object.assign({}, Seq2.defaults, inputProps )

      seq.phase = 0
      seq.inputNames = [ 'rate' ]
      seq.inputs = [ 1 ]
      seq.nextTime = 0
      seq.__valuesPhase = 0
      seq.__timingsPhase = 0
      seq.id = Gibberish.factory.getUID()
      seq.dirty = true
      seq.type = 'seq'
      seq.__addresses__ = {}

      if( properties.target === undefined ) {
        seq.anonFunction = true
      }else{ 
        seq.anonFunction = false
        seq.callFunction = typeof properties.target[ properties.key ] === 'function'
      }

      properties.id = Gibberish.factory.getUID()

      // need a separate reference to the properties for worklet meta-programming
      Object.assign( seq, properties ) 
      seq.__properties__ = properties

      seq.callback = function( rate ) {
        if( seq.phase >= seq.nextTime ) {
          //let value = seq.values[ seq.valuesPhase++ % seq.values.length ]

          //if( seq.anonFunction || typeof value === 'function' ) {
          //  value = value()
          //} else { 
          //  if( seq.anonFunction === false ) {
          //    if( seq.callFunction === false ) {
          //      seq.target[ seq.key ] = value
          //    }else{
          //      seq.target[ seq.key ]( value ) 
          //    }
          //  }
          //}

          //seq.phase -= seq.nextTime

          //let timing = seq.timings[ seq.timingsPhase++ % seq.timings.length ]
          //if( typeof timing === 'function' ) timing = timing()

          //seq.nextTime = timing
          let value  = typeof seq.values  === 'function' ? seq.values  : seq.values[  seq.__valuesPhase++  % seq.values.length  ],
          timing = typeof seq.timings === 'function' ? seq.timings : seq.timings[ seq.__timingsPhase++ % seq.timings.length ],
          shouldRun = true

          if( typeof timing === 'function' ) timing = timing()

          // XXX this supports an edge case in Gibber, where patterns like Euclid / Hex return
          // objects indicating both whether or not they should should trigger values as well
          // as the next time they should run. perhaps this could be made more generalizable?
          if( typeof timing === 'object' ) {
            if( timing.shouldExecute === 1 ) {
              shouldRun = true
            }else{
              shouldRun = false
            }
            timing = timing.time 
          }

          if( shouldRun ) {
            if( typeof value === 'function' && seq.target === undefined ) {
              value()
            }else if( typeof seq.target[ seq.key ] === 'function' ) {
              if( typeof value === 'function' ) {
                value = value()
              }
              seq.target[ seq.key ]( value )
            }else{
              if( typeof value === 'function' ) value = value()
              seq.target[ seq.key ] = value
            }
          }

          seq.phase -= seq.nextTime
          seq.nextTime = timing
          
          //if( Gibberish.mode === 'processor' ) {
          //  if( seq.__isRunning === true && !isNaN( timing ) ) {
          //    Gibberish.scheduler.add( timing, seq.tick, seq.priority )
          //  }
          //}
        }

        seq.phase += rate

        return 0
      }

      seq.ugenName = seq.callback.ugenName = 'seq_' + seq.id
      
      const idx = Gibberish.memory.alloc( 1 )
      Gibberish.memory.heap[ idx ] = seq.rate
      seq.__addresses__.rate = idx

      let value = seq.rate
      Object.defineProperty( seq, 'rate', {
        get() { return value },
        set( v ) {
          if( value !== v ) {
            Gibberish.memory.heap[ idx ] = v
            Gibberish.dirty( Gibberish.analyzers )
            value = v
          }
        }
      })

      return proxy( ['Sequencer2'], properties, seq ) 
    }
  }

  Seq2.defaults = { rate: 1 }

  return Seq2.create

}


},{"../ugen.js":134,"../workletProxy.js":137,"genish.js":37}],133:[function(require,module,exports){
const __proxy = require( '../workletProxy.js' )

module.exports = function( Gibberish ) {

const proxy = __proxy( Gibberish )

const Sequencer = props => {
  let __seq
  const seq = {
    __isRunning:false,

    __valuesPhase:  0,
    __timingsPhase: 0,
    __type:'seq',

    tick( priority ) {
      let value  = typeof seq.values  === 'function' ? seq.values  : seq.values[  seq.__valuesPhase++  % seq.values.length  ],
          timing = typeof seq.timings === 'function' ? seq.timings : seq.timings[ seq.__timingsPhase++ % seq.timings.length ],
          shouldRun = true

      if( typeof timing === 'function' ) timing = timing()

      // XXX this supports an edge case in Gibber, where patterns like Euclid / Hex return
      // objects indicating both whether or not they should should trigger values as well
      // as the next time they should run. perhaps this could be made more generalizable?
      if( typeof timing === 'object' ) {
        if( timing.shouldExecute === 1 ) {
          shouldRun = true
        }else{
          shouldRun = false
        }
        timing = timing.time 
      }

      timing *= seq.rate

      if( shouldRun ) {
        if( typeof value === 'function' && seq.target === undefined ) {
          value()
        }else if( typeof seq.target[ seq.key ] === 'function' ) {
          if( typeof value === 'function' ) value = value()
          seq.target[ seq.key ]( value )
        }else{
          if( typeof value === 'function' ) value = value()
          seq.target[ seq.key ] = value
        }
      }
      
      if( Gibberish.mode === 'processor' ) {
        if( seq.__isRunning === true && !isNaN( timing ) ) {
          Gibberish.scheduler.add( timing, seq.tick, seq.priority )
        }
      }
    },

    start( delay = 0 ) {
      seq.__isRunning = true
      Gibberish.scheduler.add( delay, seq.tick, seq.priority )
      return __seq
    },

    stop() {
      seq.__isRunning = false
      return __seq
    }
  }

  props.id = Gibberish.factory.getUID()

  // need a separate reference to the properties for worklet meta-programming
  const properties = Object.assign( {}, Sequencer.defaults, props )
  Object.assign( seq, properties ) 
  seq.__properties__ = properties

  __seq =  proxy( ['Sequencer'], properties, seq )

  return __seq
}

Sequencer.defaults = { priority:100000, values:[], timings:[], rate:1 }

Sequencer.make = function( values, timings, target, key, priority ) {
  return Sequencer({ values, timings, target, key, priority })
}

return Sequencer

}

},{"../workletProxy.js":137}],134:[function(require,module,exports){
let Gibberish = null

const __ugen = function( __Gibberish ) {
  if( __Gibberish !== undefined && Gibberish == null ) Gibberish = __Gibberish
 
  const replace = obj => {
    if( typeof obj === 'object' ) {
      if( obj.id !== undefined ) {
        return processor.ugens.get( obj.id )
      } 
    }

    return obj
  }

  const ugen = {
    __Gibberish:Gibberish,

    free:function() {
      Gibberish.genish.gen.free( this.graph )
    },

    print:function() {
      console.log( this.callback.toString() )
    },

    connect:function( target, level=1 ) {
      if( this.connected === undefined ) this.connected = []

      //let input = level === 1 ? this : Gibberish.binops.Mul( this, level )
      let input = this

      if( target === undefined || target === null ) target = Gibberish.output 


      // XXX I forgot, where is __addInput found? Can we control the
      // level of the input?
      if( typeof target.__addInput == 'function' ) {
        target.__addInput( input )
      } else if( target.sum && target.sum.inputs ) {
        target.sum.inputs.push( input )
      } else if( target.inputs ) {
        const idx = target.inputs.indexOf( input )

        // if no connection exists...
        if( idx === -1 ) {
          target.inputs.unshift( input, level, input.isStereo )
        }else{
          // ... otherwise update the connection's level, which is stored
          // one index higher in the input list.
          target.inputs[ idx + 1 ] = level
        }
      } else {
        target.input = input
        target.inputGain = level
      }

      Gibberish.dirty( target )

      this.connected.push([ target, input, level ])
      
      return this
    },

    disconnect:function( target ) {
      if( target === undefined ){
        if( Array.isArray( this.connected ) ) {
          for( let connection of this.connected ) {
            if( connection[0].disconnectUgen !== undefined ) {
              connection[0].disconnectUgen( connection[1] )
            }else if( connection[0].input === this ) {
              connection[0].input = 0
            }
          }
          this.connected.length = 0
        }
      }else{
        const connection = this.connected.find( v => v[0] === target )
        // if target is a bus...
        if( target.disconnectUgen !== undefined ) {
          if( connection !== undefined ) {
            target.disconnectUgen( connection[1] )
          }
        }else{
          // must be an effect, set input to 0
          target.input = 0
        }

        const targetIdx = this.connected.indexOf( connection )

        if( targetIdx !== -1 ) {
          this.connected.splice( targetIdx, 1 )
        }
      }
    },

    chain:function( target, level=1 ) {
      this.connect( target,level )

      return target
    },

    __redoGraph:function() {
      let isStereo = this.isStereo
      this.__createGraph()
      this.callback = Gibberish.genish.gen.createCallback( this.graph, Gibberish.memory, false, true )
      this.inputNames = new Set( Gibberish.genish.gen.parameters ) 
      this.callback.ugenName = this.ugenName
      Gibberish.dirty( this )

      // if channel count has changed after recompiling graph...
      if( isStereo !== this.isStereo ) {
        //console.log( 'CHANGING STEREO:', isStereo )

        // check for any connections before iterating...
        if( this.connected === undefined ) return
        // loop through all busses the ugen is connected to
        for( let connection of this.connected ) {
          // set the dirty flag of the bus
          Gibberish.dirty( connection[ 0 ] )

          // check for inputs array, which indicates connection is to a bus
          if( connection[0].inputs !== undefined ) {
            // find the input in the busses 'inputs' array
            const inputIdx = connection[ 0 ].inputs.indexOf( connection[ 1 ] )

            // assumiing it is found...
            if( inputIdx !== -1 ) {
              // change stereo field
              connection[ 0 ].inputs[ inputIdx + 2 ] = this.isStereo
            }
          }else if( connection[0].input !== undefined ) {
            if( connection[0].__redoGraph !== undefined ) {
              connection[0].__redoGraph()
            }
          }
        }
      }
    },
  }

  return ugen

}

module.exports = __ugen

},{}],135:[function(require,module,exports){
const __proxy = require( './workletProxy.js' )
const effectProto = require( './fx/effect.js' )

module.exports = function( Gibberish ) {
  const proxy = __proxy( Gibberish )
  
  const factory = function( ugen, graph, __name, values, cb=null, shouldProxy = true ) {
    ugen.callback = cb === null ? Gibberish.genish.gen.createCallback( graph, Gibberish.memory, false, true ) : cb

    let name = Array.isArray( __name ) ? __name[ __name.length - 1 ] : __name

    Object.assign( ugen, {
      //type: 'ugen',
      id: values.id || Gibberish.utilities.getUID(), 
      ugenName: name + '_',
      graph: graph,
      inputNames: new Set( Gibberish.genish.gen.parameters ),
      isStereo: Array.isArray( graph ),
      dirty: true,
      __properties__:values,
      __addresses__:{}
    })
    
    ugen.ugenName += ugen.id
    ugen.callback.ugenName = ugen.ugenName // XXX hacky
    ugen.callback.id = ugen.id

    for( let param of ugen.inputNames ) {
      if( param === 'memory' ) continue

      let value = values[ param ],
          isNumber = !isNaN( value ),
          idx

      if( isNumber ) { 
        idx = Gibberish.memory.alloc( 1 )
        Gibberish.memory.heap[ idx ] = value
        ugen.__addresses__[ param ] = idx
      }

      // TODO: do we need to check for a setter?
      let desc = Object.getOwnPropertyDescriptor( ugen, param ),
          setter

      if( desc !== undefined ) {
        setter = desc.set
      }

      Object.defineProperty( ugen, param, {
        configurable:true,
        get() { 
          if( isNumber ) {
            return Gibberish.memory.heap[ idx ]
          }else{
            return value 
          }
        },
        set( v ) {
          //if( param === 'input' ) console.log( 'INPUT:', v, isNumber )
          if( value !== v ) {
            if( setter !== undefined ) setter( v )
            if( !isNaN( v ) ) {
              Gibberish.memory.heap[ idx ] = value = v
              if( isNumber === false ) Gibberish.dirty( ugen )
              isNumber = true
            }else{
              value = v
              /*if( isNumber === true )*/ Gibberish.dirty( ugen )
              //console.log( 'switching from number:', param, value )
              isNumber = false
            }
          }
        }
      })
    }

    // add bypass 
    if( effectProto.isPrototypeOf( ugen ) ) {
      let value = ugen.bypass
      Object.defineProperty( ugen, 'bypass', {
        configurable:true,
        get() { return value },
        set( v ) {
          if( value !== v ) {
            Gibberish.dirty( ugen )
            value = v
          }
        }
      })

    }

    if( ugen.__requiresRecompilation !== undefined ) {
      ugen.__requiresRecompilation.forEach( prop => {
        let value = values[ prop ]
        let isNumber = !isNaN( value )

        Object.defineProperty( ugen, prop, {
          configurable:true,
          get() { 
            if( isNumber ) {
              let idx = ugen.__addresses__[ prop ]
              return Gibberish.memory.heap[ idx ]
            }else{
              //console.log( 'returning:', prop, value, Gibberish.mode )
              return value 
            }
          },
          set( v ) {
            if( value !== v ) {
              if( !isNaN( v ) ) {
                let idx = ugen.__addresses__[ prop ]
                if( idx === undefined ){
                  idx = Gibberish.memory.alloc( 1 )
                  ugen.__addresses__[ prop ] = idx
                }
                value = values[ prop ] = Gibberish.memory.heap[ idx ] = v
                isNumber = true
              }else{
                value = values[ prop ] = v
                isNumber = false
                //console.log( 'setting ugen', value, Gibberish.mode )
                Gibberish.dirty( ugen )
              }

              //console.log( 'SETTING REDO GRAPH', prop, Gibberish.mode )
              
              // needed for filterType at the very least, becauae the props
              // are reused when re-creating the graph. This seems like a cheaper
              // way to solve this problem.
              //values[ prop ] = v

              this.__redoGraph()
            }
          }
        })
      })
    }

    // will only create proxy if worklets are being used
    // otherwise will return unaltered ugen

    if( values.shouldAddToUgen === true ) Object.assign( ugen, values )

    return shouldProxy ? proxy( __name, values, ugen ) : ugen
  }

  factory.getUID = () => { return Gibberish.utilities.getUID() }

  return factory
}

},{"./fx/effect.js":98,"./workletProxy.js":137}],136:[function(require,module,exports){
const genish = require( 'genish.js' )

module.exports = function( Gibberish ) {

let uid = 0

const utilities = {
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
          window.removeEventListener( 'keydown', start )
        }
      }

      if( typeof cb === 'function' ) cb( resolve )
    }

    if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
      window.addEventListener( 'touchstart', start )
    }else{
      window.addEventListener( 'mousedown', start )
      window.addEventListener( 'keydown', start )
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
      Gibberish.worklet = new AudioWorkletNode( Gibberish.ctx, 'gibberish', { outputChannelCount:[2] } )
      Gibberish.worklet.connect( Gibberish.ctx.destination )
      Gibberish.worklet.port.onmessage = event => {
        Gibberish.utilities.workletHandlers[ event.data.address ]( event )        
      }
      Gibberish.worklet.ugens = new Map()

      resolve()
    })
  },

  workletHandlers: {
    get( event ) {
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
    },
    state( event ){
      const messages = event.data.messages
      if( messages.length === 0 ) return

      // XXX is preventProxy actually used?
      Gibberish.preventProxy = true
      Gibberish.proxyEnabled = false
      for( let i = 0; i < messages.length; i+= 3 ) {
        const id = messages[ i ] 
        const propName = messages[ i + 1 ]
        const value = messages[ i + 2 ]
        const obj = Gibberish.worklet.ugens.get( id )

        if( obj !== undefined && propName.indexOf('.') === -1 && propName !== 'id' ) { 
          if( obj[ propName ] !== undefined ) {
            if( typeof obj[ propName ] !== 'function' ) {
              obj[ propName ] = value
            }else{
              obj[ propName ]( value )
            }
          }else{
            obj[ propName ] = value
          }
        }else if( obj !== undefined ) {
          const propSplit = propName.split('.')
          if( obj[ propSplit[ 0 ] ] !== undefined ) {
            if( typeof obj[ propSplit[ 0 ] ][ propSplit[ 1 ] ] !== 'function' ) {
              obj[ propSplit[ 0 ] ][ propSplit[ 1 ] ] = value
            }else{
              obj[ propSplit[ 0 ] ][ propSplit[ 1 ] ]( value )
            }
          }else{
            //console.log( 'undefined split property!', id, propSplit[0], propSplit[1], value, obj )
          }
        }
        // XXX double check and make sure this isn't getting sent back to processornode...
        // console.log( propName, value, obj )
      }
      Gibberish.preventProxy = false
      Gibberish.proxyEnabled = true
    }
  },

  wrap( func, ...args ) {
    const out = {
      action:'wrap',
      value:func,
      // must return objects containing only the id number to avoid
      // creating circular JSON references that would result from passing actual ugens
      args: args.map( v => { return { id:v.id } })
    }
    return out
  },

  export( obj ) {
    obj.wrap = this.wrap
  },

  getUID() { return uid++ }
}

return utilities

}

},{"genish.js":37}],137:[function(require,module,exports){
const serialize = require('serialize-javascript')

module.exports = function( Gibberish ) {

const replaceObj = function( obj, shouldSerializeFunctions = true ) {
  if( typeof obj === 'object' && obj !== null && obj.id !== undefined ) {
    if( obj.__type !== 'seq' ) { // XXX why?
      return { id:obj.id, prop:obj.prop }
    }else{
      // shouldn't I be serializing most objects, not just seqs?
      return serialize( obj )
    }
  }else if( typeof obj === 'function' && shouldSerializeFunctions === true ) {
    return { isFunc:true, value:serialize( obj ) }
  }
  return obj
}

const makeAndSendObject = function( __name, values, obj ) {
  const properties = {}

  // object has already been sent through messageport...

  for( let key in values ) {
    const alreadyProcessed = (typeof values[ key ] === 'object' && values[ key ] !== null && values[ key ].__meta__ !== undefined) ||
      (typeof values[key] === 'function' && values[ key ].__meta__ !== undefined )

    if( alreadyProcessed ) { 
      properties[ key ] = { id:values[ key ].__meta__.id }
    }else if( Array.isArray( values[ key ] ) ) {
      const arr = []
      for( let i = 0; i < values[ key ].length; i++ ) {
        arr[ i ] = replaceObj( values[ key ][i], false  )
      }
      properties[ key ] = arr
    }else if( typeof values[key] === 'object' && values[key] !== null ){
      properties[ key ] = replaceObj( values[ key ], false )
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

  Gibberish.worklet.ugens.set( obj.id, obj )

  Gibberish.worklet.port.postMessage( obj.__meta__ )

}

const __proxy = function( __name, values, obj ) {

  if( Gibberish.mode === 'worklet' && Gibberish.preventProxy === false ) {

    makeAndSendObject( __name, values, obj )

    // proxy for all method calls to send to worklet
    const proxy = new Proxy( obj, {
      get( target, prop, receiver ) {
        if( typeof target[ prop ] === 'function' && prop.indexOf('__') === -1) {
          const proxy = new Proxy( target[ prop ], {
            apply( __target, thisArg, args ) {

              if( Gibberish.proxyEnabled === true ) {
                const __args = args.map( __value => replaceObj( __value, true ) )
                //if( prop === 'connect' ) console.log( 'proxy connect:', __args )

                Gibberish.worklet.port.postMessage({ 
                  address:'method', 
                  object:obj.id,
                  name:prop,
                  args:__args
                })
              }

              const temp = Gibberish.proxyEnabled
              Gibberish.proxyEnabled = false
              const out =  __target.apply( thisArg, args )
              Gibberish.proxyEnabled = temp
              return out
            }
          })
          
          return proxy
        }

        return target[ prop ]
      },
      set( target, prop, value, receiver ) {
        if( prop !== 'connected' && prop !== 'input' && prop !== 'callback' && prop !== 'inputNames' ) {
          if( Gibberish.proxyEnabled === true ) {
            const __value = replaceObj( value )

            if( __value !== undefined ) {
              Gibberish.worklet.port.postMessage({ 
                address:'set', 
                object:obj.id,
                name:prop,
                value:__value
              })
            }
          }
        }

        target[ prop ] = value

        // must return true for any ES6 proxy setter
        return true
      }
    })

    // XXX XXX XXX XXX XXX XXX
    // REMEMBER THAT YOU MUST ASSIGNED THE RETURNED VALUE TO YOUR UGEN,
    // YOU CANNOT USE THIS FUNCTION TO MODIFY A UGEN IN PLACE.
    // XXX XXX XXX XXX XXX XXX

    return proxy
  }else if( Gibberish.mode === 'processor' && Gibberish.preventProxy === false ) {

    const proxy = new Proxy( obj, {
      //get( target, prop, receiver ) { return target[ prop ] },
      set( target, prop, value, receiver ) {
        let valueType = typeof value
        if( prop.indexOf('__') === -1 && valueType !== 'function' && valueType !== 'object' ) {
          if( Gibberish.processor !== undefined ) { 
            Gibberish.processor.messages.push( obj.id, prop, value )
          }
        }
        target[ prop ] = value

        // must return true for any ES6 proxy setter
        return true
      }
    })

    return proxy
  }

  return obj
}

return __proxy

}

},{"serialize-javascript":139}],138:[function(require,module,exports){
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

},{}],139:[function(require,module,exports){
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

},{}]},{},[105])(105)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9nZW5pc2guanMvanMvYWJzLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2FjY3VtLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Fjb3MuanMiLCIuLi9nZW5pc2guanMvanMvYWQuanMiLCIuLi9nZW5pc2guanMvanMvYWRkLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Fkc3IuanMiLCIuLi9nZW5pc2guanMvanMvYW5kLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2FzaW4uanMiLCIuLi9nZW5pc2guanMvanMvYXRhbi5qcyIsIi4uL2dlbmlzaC5qcy9qcy9hdHRhY2suanMiLCIuLi9nZW5pc2guanMvanMvYmFuZy5qcyIsIi4uL2dlbmlzaC5qcy9qcy9ib29sLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2NlaWwuanMiLCIuLi9nZW5pc2guanMvanMvY2xhbXAuanMiLCIuLi9nZW5pc2guanMvanMvY29zLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2NvdW50ZXIuanMiLCIuLi9nZW5pc2guanMvanMvY3ljbGUuanMiLCIuLi9nZW5pc2guanMvanMvZGF0YS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9kY2Jsb2NrLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2RlY2F5LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2RlbGF5LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2RlbHRhLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Rpdi5qcyIsIi4uL2dlbmlzaC5qcy9qcy9lbnYuanMiLCIuLi9nZW5pc2guanMvanMvZXEuanMiLCIuLi9nZW5pc2guanMvanMvZXhwLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2Zsb29yLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2ZvbGQuanMiLCIuLi9nZW5pc2guanMvanMvZ2F0ZS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9nZW4uanMiLCIuLi9nZW5pc2guanMvanMvZ3QuanMiLCIuLi9nZW5pc2guanMvanMvZ3RlLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2d0cC5qcyIsIi4uL2dlbmlzaC5qcy9qcy9oaXN0b3J5LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2lmZWxzZWlmLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2luLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2luZGV4LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2x0LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL2x0ZS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9sdHAuanMiLCIuLi9nZW5pc2guanMvanMvbWF4LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL21lbW8uanMiLCIuLi9nZW5pc2guanMvanMvbWluLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL21peC5qcyIsIi4uL2dlbmlzaC5qcy9qcy9tb2QuanMiLCIuLi9nZW5pc2guanMvanMvbXN0b3NhbXBzLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL210b2YuanMiLCIuLi9nZW5pc2guanMvanMvbXVsLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL25lcS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9ub2lzZS5qcyIsIi4uL2dlbmlzaC5qcy9qcy9ub3QuanMiLCIuLi9nZW5pc2guanMvanMvcGFuLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3BhcmFtLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3BlZWsuanMiLCIuLi9nZW5pc2guanMvanMvcGhhc29yLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3Bva2UuanMiLCIuLi9nZW5pc2guanMvanMvcG93LmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3JhdGUuanMiLCIuLi9nZW5pc2guanMvanMvcm91bmQuanMiLCIuLi9nZW5pc2guanMvanMvc2FoLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3NlbGVjdG9yLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3NpZ24uanMiLCIuLi9nZW5pc2guanMvanMvc2luLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3NsaWRlLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3N1Yi5qcyIsIi4uL2dlbmlzaC5qcy9qcy9zd2l0Y2guanMiLCIuLi9nZW5pc2guanMvanMvdDYwLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3Rhbi5qcyIsIi4uL2dlbmlzaC5qcy9qcy90YW5oLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3RyYWluLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3V0aWxpdGllcy5qcyIsIi4uL2dlbmlzaC5qcy9qcy93aW5kb3dzLmpzIiwiLi4vZ2VuaXNoLmpzL2pzL3dyYXAuanMiLCJqcy9hbmFseXNpcy9hbmFseXplci5qcyIsImpzL2FuYWx5c2lzL2FuYWx5emVycy5qcyIsImpzL2FuYWx5c2lzL2ZvbGxvdy5qcyIsImpzL2FuYWx5c2lzL3NpbmdsZXNhbXBsZWRlbGF5LmpzIiwianMvZW52ZWxvcGVzL2FkLmpzIiwianMvZW52ZWxvcGVzL2Fkc3IuanMiLCJqcy9lbnZlbG9wZXMvZW52ZWxvcGVzLmpzIiwianMvZW52ZWxvcGVzL3JhbXAuanMiLCJqcy9leHRlcm5hbC9wcmlvcml0eXF1ZXVlLmpzIiwianMvZmlsdGVycy9hbGxwYXNzLmpzIiwianMvZmlsdGVycy9iaXF1YWQuanMiLCJqcy9maWx0ZXJzL2NvbWJmaWx0ZXIuanMiLCJqcy9maWx0ZXJzL2Rpb2RlRmlsdGVyWkRGLmpzIiwianMvZmlsdGVycy9maWx0ZXIuanMiLCJqcy9maWx0ZXJzL2ZpbHRlcjI0LmpzIiwianMvZmlsdGVycy9maWx0ZXJzLmpzIiwianMvZmlsdGVycy9sYWRkZXJGaWx0ZXJaZXJvRGVsYXkuanMiLCJqcy9maWx0ZXJzL3N2Zi5qcyIsImpzL2Z4L2JpdENydXNoZXIuanMiLCJqcy9meC9idWZmZXJTaHVmZmxlci5qcyIsImpzL2Z4L2Nob3J1cy5qcyIsImpzL2Z4L2RhdHRvcnJvLmpzIiwianMvZngvZGVsYXkuanMiLCJqcy9meC9kaXN0b3J0aW9uLmpzIiwianMvZngvZWZmZWN0LmpzIiwianMvZngvZWZmZWN0cy5qcyIsImpzL2Z4L2ZsYW5nZXIuanMiLCJqcy9meC9mcmVldmVyYi5qcyIsImpzL2Z4L3JpbmdNb2QuanMiLCJqcy9meC90cmVtb2xvLmpzIiwianMvZngvdmlicmF0by5qcyIsImpzL2luZGV4LmpzIiwianMvaW5zdHJ1bWVudHMvY29uZ2EuanMiLCJqcy9pbnN0cnVtZW50cy9jb3diZWxsLmpzIiwianMvaW5zdHJ1bWVudHMvZm0uanMiLCJqcy9pbnN0cnVtZW50cy9oYXQuanMiLCJqcy9pbnN0cnVtZW50cy9pbnN0cnVtZW50LmpzIiwianMvaW5zdHJ1bWVudHMvaW5zdHJ1bWVudHMuanMiLCJqcy9pbnN0cnVtZW50cy9rYXJwbHVzc3Ryb25nLmpzIiwianMvaW5zdHJ1bWVudHMva2ljay5qcyIsImpzL2luc3RydW1lbnRzL21vbm9zeW50aC5qcyIsImpzL2luc3RydW1lbnRzL3BvbHlNaXhpbi5qcyIsImpzL2luc3RydW1lbnRzL3BvbHl0ZW1wbGF0ZS5qcyIsImpzL2luc3RydW1lbnRzL3NhbXBsZXIuanMiLCJqcy9pbnN0cnVtZW50cy9zbmFyZS5qcyIsImpzL2luc3RydW1lbnRzL3N5bnRoLmpzIiwianMvbWlzYy9iaW5vcHMuanMiLCJqcy9taXNjL2J1cy5qcyIsImpzL21pc2MvYnVzMi5qcyIsImpzL21pc2MvbW9ub3BzLmpzIiwianMvbWlzYy9wYW5uZXIuanMiLCJqcy9taXNjL3RpbWUuanMiLCJqcy9vc2NpbGxhdG9ycy9icm93bm5vaXNlLmpzIiwianMvb3NjaWxsYXRvcnMvZm1mZWVkYmFja29zYy5qcyIsImpzL29zY2lsbGF0b3JzL29zY2lsbGF0b3JzLmpzIiwianMvb3NjaWxsYXRvcnMvcGlua25vaXNlLmpzIiwianMvb3NjaWxsYXRvcnMvd2F2ZXRhYmxlLmpzIiwianMvc2NoZWR1bGluZy9zY2hlZHVsZXIuanMiLCJqcy9zY2hlZHVsaW5nL3NlcTIuanMiLCJqcy9zY2hlZHVsaW5nL3NlcXVlbmNlci5qcyIsImpzL3VnZW4uanMiLCJqcy91Z2VuVGVtcGxhdGUuanMiLCJqcy91dGlsaXRpZXMuanMiLCJqcy93b3JrbGV0UHJveHkuanMiLCJub2RlX21vZHVsZXMvYmlnLmpzL2JpZy5qcyIsIm5vZGVfbW9kdWxlcy9zZXJpYWxpemUtamF2YXNjcmlwdC9pbmRleC5qcyIsIi4uL21lbW9yeS1oZWxwZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdG5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2FicycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmFicyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmFicyggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hYnMoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhYnMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWJzLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGFic1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhY2N1bScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keVxuXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB0aGlzLmluaXRpYWxWYWx1ZVxuXG4gICAgZnVuY3Rpb25Cb2R5ID0gdGhpcy5jYWxsYmFjayggZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAgKVxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuICAgIFxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGNhbGxiYWNrKCBfbmFtZSwgX2luY3IsIF9yZXNldCwgdmFsdWVSZWYgKSB7XG4gICAgbGV0IGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSAnJyxcbiAgICAgICAgd3JhcCA9ICcnXG4gICAgXG4gICAgLyogdGhyZWUgZGlmZmVyZW50IG1ldGhvZHMgb2Ygd3JhcHBpbmcsIHRoaXJkIGlzIG1vc3QgZXhwZW5zaXZlOlxuICAgICAqXG4gICAgICogMTogcmFuZ2UgezAsMX06IHkgPSB4IC0gKHggfCAwKVxuICAgICAqIDI6IGxvZzIodGhpcy5tYXgpID09IGludGVnZXI6IHkgPSB4ICYgKHRoaXMubWF4IC0gMSlcbiAgICAgKiAzOiBhbGwgb3RoZXJzOiBpZiggeCA+PSB0aGlzLm1heCApIHkgPSB0aGlzLm1heCAteFxuICAgICAqXG4gICAgICovXG5cbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzFdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1sxXSA8IDEpICkgeyBcbiAgICAgIGlmKCB0aGlzLnJlc2V0VmFsdWUgIT09IHRoaXMubWluICkge1xuXG4gICAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLnJlc2V0VmFsdWV9XFxuXFxuYFxuICAgICAgICAvL291dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLm1pbn1cXG5cXG5gXG4gICAgICB9ZWxzZXtcbiAgICAgICAgb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMubWlufVxcblxcbmBcbiAgICAgICAgLy9vdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PTEgKSAke3ZhbHVlUmVmfSA9ICR7dGhpcy5pbml0aWFsVmFsdWV9XFxuXFxuYFxuICAgICAgfVxuICAgIH1cblxuICAgIG91dCArPSBgICB2YXIgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHt2YWx1ZVJlZn1cXG5gXG4gICAgXG4gICAgaWYoIHRoaXMuc2hvdWxkV3JhcCA9PT0gZmFsc2UgJiYgdGhpcy5zaG91bGRDbGFtcCA9PT0gdHJ1ZSApIHtcbiAgICAgIG91dCArPSBgICBpZiggJHt2YWx1ZVJlZn0gPCAke3RoaXMubWF4IH0gKSAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmBcbiAgICB9ZWxzZXtcbiAgICAgIG91dCArPSBgICAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmAgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuICAgIH1cblxuICAgIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgICYmIHRoaXMuc2hvdWxkV3JhcE1heCApIHdyYXAgKz0gYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICkgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxcbmBcbiAgICBpZiggdGhpcy5taW4gIT09IC1JbmZpbml0eSAmJiB0aGlzLnNob3VsZFdyYXBNaW4gKSB3cmFwICs9IGAgIGlmKCAke3ZhbHVlUmVmfSA8ICR7dGhpcy5taW59ICkgJHt2YWx1ZVJlZn0gKz0gJHtkaWZmfVxcbmBcblxuICAgIC8vaWYoIHRoaXMubWluID09PSAwICYmIHRoaXMubWF4ID09PSAxICkgeyBcbiAgICAvLyAgd3JhcCA9ICBgICAke3ZhbHVlUmVmfSA9ICR7dmFsdWVSZWZ9IC0gKCR7dmFsdWVSZWZ9IHwgMClcXG5cXG5gXG4gICAgLy99IGVsc2UgaWYoIHRoaXMubWluID09PSAwICYmICggTWF0aC5sb2cyKCB0aGlzLm1heCApIHwgMCApID09PSBNYXRoLmxvZzIoIHRoaXMubWF4ICkgKSB7XG4gICAgLy8gIHdyYXAgPSAgYCAgJHt2YWx1ZVJlZn0gPSAke3ZhbHVlUmVmfSAmICgke3RoaXMubWF4fSAtIDEpXFxuXFxuYFxuICAgIC8vfSBlbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgKXtcbiAgICAvLyAgd3JhcCA9IGAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSApICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cXG5cXG5gXG4gICAgLy99XG5cbiAgICBvdXQgPSBvdXQgKyB3cmFwICsgJ1xcbidcblxuICAgIHJldHVybiBvdXRcbiAgfSxcblxuICBkZWZhdWx0cyA6IHsgbWluOjAsIG1heDoxLCByZXNldFZhbHVlOjAsIGluaXRpYWxWYWx1ZTowLCBzaG91bGRXcmFwOnRydWUsIHNob3VsZFdyYXBNYXg6IHRydWUsIHNob3VsZFdyYXBNaW46dHJ1ZSwgc2hvdWxkQ2xhbXA6ZmFsc2UgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5jciwgcmVzZXQ9MCwgcHJvcGVydGllcyApID0+IHtcbiAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgICAgIFxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBcbiAgICB7IFxuICAgICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgICBpbnB1dHM6IFsgaW5jciwgcmVzZXQgXSxcbiAgICAgIG1lbW9yeToge1xuICAgICAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcHJvdG8uZGVmYXVsdHMsXG4gICAgcHJvcGVydGllcyBcbiAgKVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5zaG91bGRXcmFwTWF4ID09PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5zaG91bGRXcmFwTWluID09PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIHByb3BlcnRpZXMuc2hvdWxkV3JhcCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgdWdlbi5zaG91bGRXcmFwTWluID0gdWdlbi5zaG91bGRXcmFwTWF4ID0gcHJvcGVydGllcy5zaG91bGRXcmFwXG4gICAgfVxuICB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLnJlc2V0VmFsdWUgPT09IHVuZGVmaW5lZCApIHtcbiAgICB1Z2VuLnJlc2V0VmFsdWUgPSB1Z2VuLm1pblxuICB9XG5cbiAgaWYoIHVnZW4uaW5pdGlhbFZhbHVlID09PSB1bmRlZmluZWQgKSB1Z2VuLmluaXRpYWxWYWx1ZSA9IHVnZW4ubWluXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkgIHsgXG4gICAgICAvL2NvbnNvbGUubG9nKCAnZ2VuOicsIGdlbiwgZ2VuLm1lbW9yeSApXG4gICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSBcbiAgICB9LFxuICAgIHNldCh2KSB7IGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IH1cbiAgfSlcblxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Fjb3MnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhY29zJzogTWF0aC5hY29zIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uYWNvcyggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYWNvcyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFjb3MgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWNvcy5pbnB1dHMgPSBbIHggXVxuICBhY29zLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFjb3MubmFtZSA9IGAke2Fjb3MuYmFzZW5hbWV9e2Fjb3MuaWR9YFxuXG4gIHJldHVybiBhY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIG11bCAgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGRpdiAgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIGRhdGEgICAgID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrICAgICA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgYWNjdW0gICAgPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBpZmVsc2UgICA9IHJlcXVpcmUoICcuL2lmZWxzZWlmLmpzJyApLFxuICAgIGx0ICAgICAgID0gcmVxdWlyZSggJy4vbHQuanMnICksXG4gICAgYmFuZyAgICAgPSByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICAgIGVudiAgICAgID0gcmVxdWlyZSggJy4vZW52LmpzJyApLFxuICAgIGFkZCAgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIHBva2UgICAgID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgICBuZXEgICAgICA9IHJlcXVpcmUoICcuL25lcS5qcycgKSxcbiAgICBhbmQgICAgICA9IHJlcXVpcmUoICcuL2FuZC5qcycgKSxcbiAgICBndGUgICAgICA9IHJlcXVpcmUoICcuL2d0ZS5qcycgKSxcbiAgICBtZW1vICAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGF0dGFja1RpbWUgPSA0NDEwMCwgZGVjYXlUaW1lID0gNDQxMDAsIF9wcm9wcyApID0+IHtcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNoYXBlOidleHBvbmVudGlhbCcsIGFscGhhOjUsIHRyaWdnZXI6bnVsbCB9LCBfcHJvcHMgKVxuICBjb25zdCBfYmFuZyA9IHByb3BzLnRyaWdnZXIgIT09IG51bGwgPyBwcm9wcy50cmlnZ2VyIDogYmFuZygpLFxuICAgICAgICBwaGFzZSA9IGFjY3VtKCAxLCBfYmFuZywgeyBtaW46MCwgbWF4OiBJbmZpbml0eSwgaW5pdGlhbFZhbHVlOi1JbmZpbml0eSwgc2hvdWxkV3JhcDpmYWxzZSB9KVxuICAgICAgXG4gIGxldCBidWZmZXJEYXRhLCBidWZmZXJEYXRhUmV2ZXJzZSwgZGVjYXlEYXRhLCBvdXQsIGJ1ZmZlclxuXG4gIC8vY29uc29sZS5sb2coICdzaGFwZTonLCBwcm9wcy5zaGFwZSwgJ2F0dGFjayB0aW1lOicsIGF0dGFja1RpbWUsICdkZWNheSB0aW1lOicsIGRlY2F5VGltZSApXG4gIGxldCBjb21wbGV0ZUZsYWcgPSBkYXRhKCBbMF0gKVxuICBcbiAgLy8gc2xpZ2h0bHkgbW9yZSBlZmZpY2llbnQgdG8gdXNlIGV4aXN0aW5nIHBoYXNlIGFjY3VtdWxhdG9yIGZvciBsaW5lYXIgZW52ZWxvcGVzXG4gIGlmKCBwcm9wcy5zaGFwZSA9PT0gJ2xpbmVhcicgKSB7XG4gICAgb3V0ID0gaWZlbHNlKCBcbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksIGx0KCBwaGFzZSwgYXR0YWNrVGltZSApKSxcbiAgICAgIGRpdiggcGhhc2UsIGF0dGFja1RpbWUgKSxcblxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApICksXG4gICAgICBzdWIoIDEsIGRpdiggc3ViKCBwaGFzZSwgYXR0YWNrVGltZSApLCBkZWNheVRpbWUgKSApLFxuICAgICAgXG4gICAgICBuZXEoIHBoYXNlLCAtSW5maW5pdHkpLFxuICAgICAgcG9rZSggY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTowIH0pLFxuXG4gICAgICAwIFxuICAgIClcbiAgfSBlbHNlIHtcbiAgICBidWZmZXJEYXRhID0gZW52KHsgbGVuZ3RoOjEwMjQsIHR5cGU6cHJvcHMuc2hhcGUsIGFscGhhOnByb3BzLmFscGhhIH0pXG4gICAgYnVmZmVyRGF0YVJldmVyc2UgPSBlbnYoeyBsZW5ndGg6MTAyNCwgdHlwZTpwcm9wcy5zaGFwZSwgYWxwaGE6cHJvcHMuYWxwaGEsIHJldmVyc2U6dHJ1ZSB9KVxuXG4gICAgb3V0ID0gaWZlbHNlKCBcbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksIGx0KCBwaGFzZSwgYXR0YWNrVGltZSApICksIFxuICAgICAgcGVlayggYnVmZmVyRGF0YSwgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0gKSwgXG5cbiAgICAgIGFuZCggZ3RlKHBoYXNlLDApLCBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lICkgKSApLCBcbiAgICAgIHBlZWsoIGJ1ZmZlckRhdGFSZXZlcnNlLCBkaXYoIHN1YiggcGhhc2UsIGF0dGFja1RpbWUgKSwgZGVjYXlUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSksXG5cbiAgICAgIG5lcSggcGhhc2UsIC1JbmZpbml0eSApLFxuICAgICAgcG9rZSggY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTowIH0pLFxuXG4gICAgICAwXG4gICAgKVxuICB9XG5cbiAgb3V0LmlzQ29tcGxldGUgPSAoKT0+IGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF1cblxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF0gPSAwXG4gICAgX2JhbmcudHJpZ2dlcigpXG4gIH1cblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxuY29uc3QgcHJvdG8gPSB7IFxuICBiYXNlbmFtZTonYWRkJyxcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dD0nJyxcbiAgICAgICAgc3VtID0gMCwgbnVtQ291bnQgPSAwLCBhZGRlckF0RW5kID0gZmFsc2UsIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZVxuXG4gICAgaWYoIGlucHV0cy5sZW5ndGggPT09IDAgKSByZXR1cm4gMFxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGBcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaXNOYU4oIHYgKSApIHtcbiAgICAgICAgb3V0ICs9IHZcbiAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgIGFkZGVyQXRFbmQgPSB0cnVlXG4gICAgICAgICAgb3V0ICs9ICcgKyAnXG4gICAgICAgIH1cbiAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICAgIHN1bSArPSBwYXJzZUZsb2F0KCB2IClcbiAgICAgICAgbnVtQ291bnQrK1xuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiggbnVtQ291bnQgPiAwICkge1xuICAgICAgb3V0ICs9IGFkZGVyQXRFbmQgfHwgYWxyZWFkeUZ1bGxTdW1tZWQgPyBzdW0gOiAnICsgJyArIHN1bVxuICAgIH1cblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGNvbnN0IGFkZCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgYWRkLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFkZC5uYW1lID0gYWRkLmJhc2VuYW1lICsgYWRkLmlkXG4gIGFkZC5pbnB1dHMgPSBhcmdzXG5cbiAgcmV0dXJuIGFkZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBtdWwgICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBzdWIgICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBkaXYgICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgICBkYXRhICAgICA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayAgICAgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIGFjY3VtICAgID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgaWZlbHNlICAgPSByZXF1aXJlKCAnLi9pZmVsc2VpZi5qcycgKSxcbiAgICBsdCAgICAgICA9IHJlcXVpcmUoICcuL2x0LmpzJyApLFxuICAgIGJhbmcgICAgID0gcmVxdWlyZSggJy4vYmFuZy5qcycgKSxcbiAgICBlbnYgICAgICA9IHJlcXVpcmUoICcuL2Vudi5qcycgKSxcbiAgICBwYXJhbSAgICA9IHJlcXVpcmUoICcuL3BhcmFtLmpzJyApLFxuICAgIGFkZCAgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIGd0cCAgICAgID0gcmVxdWlyZSggJy4vZ3RwLmpzJyApLFxuICAgIG5vdCAgICAgID0gcmVxdWlyZSggJy4vbm90LmpzJyApLFxuICAgIGFuZCAgICAgID0gcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICAgIG5lcSAgICAgID0gcmVxdWlyZSggJy4vbmVxLmpzJyApLFxuICAgIHBva2UgICAgID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggYXR0YWNrVGltZT00NCwgZGVjYXlUaW1lPTIyMDUwLCBzdXN0YWluVGltZT00NDEwMCwgc3VzdGFpbkxldmVsPS42LCByZWxlYXNlVGltZT00NDEwMCwgX3Byb3BzICkgPT4ge1xuICBsZXQgZW52VHJpZ2dlciA9IGJhbmcoKSxcbiAgICAgIHBoYXNlID0gYWNjdW0oIDEsIGVudlRyaWdnZXIsIHsgbWF4OiBJbmZpbml0eSwgc2hvdWxkV3JhcDpmYWxzZSwgaW5pdGlhbFZhbHVlOkluZmluaXR5IH0pLFxuICAgICAgc2hvdWxkU3VzdGFpbiA9IHBhcmFtKCAxICksXG4gICAgICBkZWZhdWx0cyA9IHtcbiAgICAgICAgIHNoYXBlOiAnZXhwb25lbnRpYWwnLFxuICAgICAgICAgYWxwaGE6IDUsXG4gICAgICAgICB0cmlnZ2VyUmVsZWFzZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgX3Byb3BzICksXG4gICAgICBidWZmZXJEYXRhLCBkZWNheURhdGEsIG91dCwgYnVmZmVyLCBzdXN0YWluQ29uZGl0aW9uLCByZWxlYXNlQWNjdW0sIHJlbGVhc2VDb25kaXRpb25cblxuXG4gIGNvbnN0IGNvbXBsZXRlRmxhZyA9IGRhdGEoIFswXSApXG5cbiAgYnVmZmVyRGF0YSA9IGVudih7IGxlbmd0aDoxMDI0LCBhbHBoYTpwcm9wcy5hbHBoYSwgc2hpZnQ6MCwgdHlwZTpwcm9wcy5zaGFwZSB9KVxuXG4gIHN1c3RhaW5Db25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZSBcbiAgICA/IHNob3VsZFN1c3RhaW5cbiAgICA6IGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lICkgKVxuXG4gIHJlbGVhc2VBY2N1bSA9IHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgPyBndHAoIHN1Yiggc3VzdGFpbkxldmVsLCBhY2N1bSggZGl2KCBzdXN0YWluTGV2ZWwsIHJlbGVhc2VUaW1lICkgLCAwLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSkgKSwgMCApXG4gICAgOiBzdWIoIHN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSApICksIHJlbGVhc2VUaW1lICksIHN1c3RhaW5MZXZlbCApICksIFxuXG4gIHJlbGVhc2VDb25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZVxuICAgID8gbm90KCBzaG91bGRTdXN0YWluIClcbiAgICA6IGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lLCByZWxlYXNlVGltZSApIClcblxuICBvdXQgPSBpZmVsc2UoXG4gICAgLy8gYXR0YWNrIFxuICAgIGx0KCBwaGFzZSwgIGF0dGFja1RpbWUgKSwgXG4gICAgcGVlayggYnVmZmVyRGF0YSwgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0gKSwgXG5cbiAgICAvLyBkZWNheVxuICAgIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApLCBcbiAgICBwZWVrKCBidWZmZXJEYXRhLCBzdWIoIDEsIG11bCggZGl2KCBzdWIoIHBoYXNlLCAgYXR0YWNrVGltZSApLCAgZGVjYXlUaW1lICksIHN1YiggMSwgIHN1c3RhaW5MZXZlbCApICkgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSxcblxuICAgIC8vIHN1c3RhaW5cbiAgICBhbmQoIHN1c3RhaW5Db25kaXRpb24sIG5lcSggcGhhc2UsIEluZmluaXR5ICkgKSxcbiAgICBwZWVrKCBidWZmZXJEYXRhLCAgc3VzdGFpbkxldmVsICksXG5cbiAgICAvLyByZWxlYXNlXG4gICAgcmVsZWFzZUNvbmRpdGlvbiwgLy9sdCggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSArICByZWxlYXNlVGltZSApLFxuICAgIHBlZWsoIFxuICAgICAgYnVmZmVyRGF0YSxcbiAgICAgIHJlbGVhc2VBY2N1bSwgXG4gICAgICAvL3N1YiggIHN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSksICByZWxlYXNlVGltZSApLCAgc3VzdGFpbkxldmVsICkgKSwgXG4gICAgICB7IGJvdW5kbW9kZTonY2xhbXAnIH1cbiAgICApLFxuXG4gICAgbmVxKCBwaGFzZSwgSW5maW5pdHkgKSxcbiAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAwXG4gIClcbiAgIFxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNob3VsZFN1c3RhaW4udmFsdWUgPSAxXG4gICAgZW52VHJpZ2dlci50cmlnZ2VyKClcbiAgfVxuXG4gIG91dC5pc0NvbXBsZXRlID0gKCk9PiBnZW4ubWVtb3J5LmhlYXBbIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCBdXG5cbiAgb3V0LnJlbGVhc2UgPSAoKT0+IHtcbiAgICBzaG91bGRTdXN0YWluLnZhbHVlID0gMFxuICAgIC8vIFhYWCBwcmV0dHkgbmFzdHkuLi4gZ3JhYnMgYWNjdW0gaW5zaWRlIG9mIGd0cCBhbmQgcmVzZXRzIHZhbHVlIG1hbnVhbGx5XG4gICAgLy8gdW5mb3J0dW5hdGVseSBlbnZUcmlnZ2VyIHdvbid0IHdvcmsgYXMgaXQncyBiYWNrIHRvIDAgYnkgdGhlIHRpbWUgdGhlIHJlbGVhc2UgYmxvY2sgaXMgdHJpZ2dlcmVkLi4uXG4gICAgZ2VuLm1lbW9yeS5oZWFwWyByZWxlYXNlQWNjdW0uaW5wdXRzWzBdLmlucHV0c1sxXS5tZW1vcnkudmFsdWUuaWR4IF0gPSAwXG4gIH1cblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYW5kJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSAhPT0gMCAmJiAke2lucHV0c1sxXX0gIT09IDApIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXNpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2FzaW4nOiBNYXRoLmFzaW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5hc2luKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYXNpbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhc2luLmlucHV0cyA9IFsgeCBdXG4gIGFzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgYXNpbi5uYW1lID0gYCR7YXNpbi5iYXNlbmFtZX17YXNpbi5pZH1gXG5cbiAgcmV0dXJuIGFzaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXRhbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2F0YW4nOiBNYXRoLmF0YW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5hdGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hdGFuKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYXRhbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhdGFuLmlucHV0cyA9IFsgeCBdXG4gIGF0YW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgYXRhbi5uYW1lID0gYCR7YXRhbi5iYXNlbmFtZX17YXRhbi5pZH1gXG5cbiAgcmV0dXJuIGF0YW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRlY2F5VGltZSA9IDQ0MTAwICkgPT4ge1xuICBsZXQgc3NkID0gaGlzdG9yeSAoIDEgKSxcbiAgICAgIHQ2MCA9IE1hdGguZXhwKCAtNi45MDc3NTUyNzg5MjEgLyBkZWNheVRpbWUgKVxuXG4gIHNzZC5pbiggbXVsKCBzc2Qub3V0LCB0NjAgKSApXG5cbiAgc3NkLm91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc3NkLnZhbHVlID0gMVxuICB9XG5cbiAgcmV0dXJuIHN1YiggMSwgc3NkLm91dCApXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBnZW4oKSB7XG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBcbiAgICBsZXQgb3V0ID0gXG5gICB2YXIgJHt0aGlzLm5hbWV9ID0gbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1cbiAgaWYoICR7dGhpcy5uYW1lfSA9PT0gMSApIG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dID0gMCAgICAgIFxuICAgICAgXG5gXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBfcHJvcHMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBtaW46MCwgbWF4OjEgfSwgX3Byb3BzIClcblxuICB1Z2VuLm5hbWUgPSAnYmFuZycgKyBnZW4uZ2V0VUlEKClcblxuICB1Z2VuLm1pbiA9IHByb3BzLm1pblxuICB1Z2VuLm1heCA9IHByb3BzLm1heFxuXG4gIHVnZW4udHJpZ2dlciA9ICgpID0+IHtcbiAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gdWdlbi5tYXggXG4gIH1cblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Jvb2wnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IGAke2lucHV0c1swXX0gPT09IDAgPyAwIDogMWBcbiAgICBcbiAgICAvL2dlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICAvL3JldHVybiBbIGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gLCAnICcgK291dCBdXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidjZWlsJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguY2VpbCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmNlaWwoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY2VpbCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNlaWwgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY2VpbC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBjZWlsXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViICA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NsaXAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcblxuICAgIG91dCA9XG5cbmAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9ID4gJHtpbnB1dHNbMl19ICkgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMl19XG4gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA8ICR7aW5wdXRzWzFdfSApICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzFdfVxuYFxuICAgIG91dCA9ICcgJyArIG91dFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49LTEsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2Nvcyc6IE1hdGguY29zIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uY29zKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5jb3MoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBjb3MgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY29zLmlucHV0cyA9IFsgeCBdXG4gIGNvcy5pZCA9IGdlbi5nZXRVSUQoKVxuICBjb3MubmFtZSA9IGAke2Nvcy5iYXNlbmFtZX17Y29zLmlkfWBcblxuICByZXR1cm4gY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvdW50ZXInLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHlcbiAgICAgICBcbiAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdGhpcy5pbml0aWFsVmFsdWVcbiAgICBcbiAgICBmdW5jdGlvbkJvZHkgID0gdGhpcy5jYWxsYmFjayggZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sIGlucHV0c1syXSwgaW5wdXRzWzNdLCBpbnB1dHNbNF0sICBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gLCBgbWVtb3J5WyR7dGhpcy5tZW1vcnkud3JhcC5pZHh9XWAgIClcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiB0aGlzIH0pIFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcbiAgIFxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy53cmFwLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkgdGhpcy53cmFwLmdlbigpXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfbWluLCBfbWF4LCBfcmVzZXQsIGxvb3BzLCB2YWx1ZVJlZiwgd3JhcFJlZiApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJydcbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzNdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1szXSA8IDEpICkgeyBcbiAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49IDEgKSAke3ZhbHVlUmVmfSA9ICR7X21pbn1cXG5gXG4gICAgfVxuXG4gICAgb3V0ICs9IGAgIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3ZhbHVlUmVmfTtcXG4gICR7dmFsdWVSZWZ9ICs9ICR7X2luY3J9XFxuYCAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyAgXG4gICAgXG4gICAgaWYoIHR5cGVvZiB0aGlzLm1heCA9PT0gJ251bWJlcicgJiYgdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHR5cGVvZiB0aGlzLm1pbiAhPT0gJ251bWJlcicgKSB7XG4gICAgICB3cmFwID0gXG5gICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgJiYgdGhpcy5taW4gIT09IEluZmluaXR5ICkge1xuICAgICAgd3JhcCA9IFxuYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7X21heH0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9IC09ICR7X21heH0gLSAke19taW59XG4gICAgJHt3cmFwUmVmfSA9IDFcbiAgfWVsc2UgaWYoICR7dmFsdWVSZWZ9IDwgJHtfbWlufSAmJiAgJHtsb29wc30gPiAwKSB7XG4gICAgJHt2YWx1ZVJlZn0gKz0gJHtfbWF4fSAtICR7X21pbn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNle1xuICAgICAgb3V0ICs9ICdcXG4nXG4gICAgfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcFxuXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyPTEsIG1pbj0wLCBtYXg9SW5maW5pdHksIHJlc2V0PTAsIGxvb3BzPTEsICBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IE9iamVjdC5hc3NpZ24oIHsgaW5pdGlhbFZhbHVlOiAwLCBzaG91bGRXcmFwOnRydWUgfSwgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW46ICAgIG1pbiwgXG4gICAgbWF4OiAgICBtYXgsXG4gICAgaW5pdGlhbFZhbHVlOiBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdmFsdWU6ICBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluY3IsIG1pbiwgbWF4LCByZXNldCwgbG9vcHMgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSxcbiAgICAgIHdyYXA6ICB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSBcbiAgICB9LFxuICAgIHdyYXAgOiB7XG4gICAgICBnZW4oKSB7IFxuICAgICAgICBpZiggdWdlbi5tZW1vcnkud3JhcC5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgfVxuICAgICAgICBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVsgJHt1Z2VuLm1lbW9yeS53cmFwLmlkeH0gXWBcbiAgICAgICAgcmV0dXJuIGBtZW1vcnlbICR7dWdlbi5tZW1vcnkud3JhcC5pZHh9IF1gIFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZGVmYXVsdHMgKVxuIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgXG4gICAgICB9XG4gICAgfVxuICB9KVxuICBcbiAgdWdlbi53cmFwLmlucHV0cyA9IFsgdWdlbiBdXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG4gIHVnZW4ud3JhcC5uYW1lID0gdWdlbi5uYW1lICsgJ193cmFwJ1xuICByZXR1cm4gdWdlblxufSBcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bT0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgcGhhc29yPXJlcXVpcmUoICcuL3BoYXNvci5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2N5Y2xlJyxcblxuICBpbml0VGFibGUoKSB7ICAgIFxuICAgIGxldCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICAgIGZvciggbGV0IGkgPSAwLCBsID0gYnVmZmVyLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gTWF0aC5zaW4oICggaSAvIGwgKSAqICggTWF0aC5QSSAqIDIgKSApXG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMuY3ljbGUgPSBkYXRhKCBidWZmZXIsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSApXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTEsIHJlc2V0PTAsIF9wcm9wcyApID0+IHtcbiAgaWYoIHR5cGVvZiBnZW4uZ2xvYmFscy5jeWNsZSA9PT0gJ3VuZGVmaW5lZCcgKSBwcm90by5pbml0VGFibGUoKSBcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG1pbjowIH0sIF9wcm9wcyApXG5cbiAgY29uc3QgdWdlbiA9IHBlZWsoIGdlbi5nbG9iYWxzLmN5Y2xlLCBwaGFzb3IoIGZyZXF1ZW5jeSwgcmVzZXQsIHByb3BzICkpXG4gIHVnZW4ubmFtZSA9ICdjeWNsZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgdXRpbGl0aWVzID0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApLFxuICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gIHBva2UgPSByZXF1aXJlKCcuL3Bva2UuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkYXRhJyxcbiAgZ2xvYmFsczoge30sXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpZHhcbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMubmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBsZXQgdWdlbiA9IHRoaXNcbiAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSwgdGhpcy5pbW11dGFibGUgKSBcbiAgICAgIGlkeCA9IHRoaXMubWVtb3J5LnZhbHVlcy5pZHhcbiAgICAgIHRyeSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcC5zZXQoIHRoaXMuYnVmZmVyLCBpZHggKVxuICAgICAgfWNhdGNoKCBlICkge1xuICAgICAgICBjb25zb2xlLmxvZyggZSApXG4gICAgICAgIHRocm93IEVycm9yKCAnZXJyb3Igd2l0aCByZXF1ZXN0LiBhc2tpbmcgZm9yICcgKyB0aGlzLmJ1ZmZlci5sZW5ndGggKycuIGN1cnJlbnQgaW5kZXg6ICcgKyBnZW4ubWVtb3J5SW5kZXggKyAnIG9mICcgKyBnZW4ubWVtb3J5LmhlYXAubGVuZ3RoIClcbiAgICAgIH1cbiAgICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSBdID0gdGhpc1xuICAgICAgLy9yZXR1cm4gJ2dlbi5tZW1vcnknICsgdGhpcy5uYW1lICsgJy5idWZmZXInXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpZHhcbiAgICB9ZWxzZXtcbiAgICAgIGlkeCA9IGdlbi5tZW1vWyB0aGlzLm5hbWUgXVxuICAgIH1cbiAgICByZXR1cm4gaWR4XG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCB4LCB5PTEsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuLCBidWZmZXIsIHNob3VsZExvYWQgPSBmYWxzZVxuICBcbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkICkge1xuICAgIGlmKCBnZW4uZ2xvYmFsc1sgcHJvcGVydGllcy5nbG9iYWwgXSApIHtcbiAgICAgIHJldHVybiBnZW4uZ2xvYmFsc1sgcHJvcGVydGllcy5nbG9iYWwgXVxuICAgIH1cbiAgfVxuXG4gIGlmKCB0eXBlb2YgeCA9PT0gJ251bWJlcicgKSB7XG4gICAgaWYoIHkgIT09IDEgKSB7XG4gICAgICBidWZmZXIgPSBbXVxuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB5OyBpKysgKSB7XG4gICAgICAgIGJ1ZmZlclsgaSBdID0gbmV3IEZsb2F0MzJBcnJheSggeCApXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCB4IClcbiAgICB9XG4gIH1lbHNlIGlmKCBBcnJheS5pc0FycmF5KCB4ICkgKSB7IC8vISAoeCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSApICkge1xuICAgIGxldCBzaXplID0geC5sZW5ndGhcbiAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCBzaXplIClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKysgKSB7XG4gICAgICBidWZmZXJbIGkgXSA9IHhbIGkgXVxuICAgIH1cbiAgfWVsc2UgaWYoIHR5cGVvZiB4ID09PSAnc3RyaW5nJyApIHtcbiAgICBidWZmZXIgPSB7IGxlbmd0aDogeSA+IDEgPyB5IDogZ2VuLnNhbXBsZXJhdGUgKiA2MCB9IC8vIFhYWCB3aGF0Pz8/XG4gICAgc2hvdWxkTG9hZCA9IHRydWVcbiAgfWVsc2UgaWYoIHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSB7XG4gICAgYnVmZmVyID0geFxuICB9XG4gIFxuICB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgYnVmZmVyLFxuICAgIG5hbWU6IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpLFxuICAgIGRpbTogIGJ1ZmZlci5sZW5ndGgsIC8vIFhYWCBob3cgZG8gd2UgZHluYW1pY2FsbHkgYWxsb2NhdGUgdGhpcz9cbiAgICBjaGFubmVscyA6IDEsXG4gICAgb25sb2FkOiBudWxsLFxuICAgIHRoZW4oIGZuYyApIHtcbiAgICAgIHVnZW4ub25sb2FkID0gZm5jXG4gICAgICByZXR1cm4gdWdlblxuICAgIH0sXG4gICAgaW1tdXRhYmxlOiBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5pbW11dGFibGUgPT09IHRydWUgPyB0cnVlIDogZmFsc2UsXG4gICAgbG9hZCggZmlsZW5hbWUgKSB7XG4gICAgICBsZXQgcHJvbWlzZSA9IHV0aWxpdGllcy5sb2FkU2FtcGxlKCBmaWxlbmFtZSwgdWdlbiApXG4gICAgICBwcm9taXNlLnRoZW4oICggX2J1ZmZlciApPT4geyBcbiAgICAgICAgdWdlbi5tZW1vcnkudmFsdWVzLmxlbmd0aCA9IHVnZW4uZGltID0gX2J1ZmZlci5sZW5ndGhcbiAgICAgICAgaWYoIHR5cGVvZiB1Z2VuLm9ubG9hZCA9PT0gJ2Z1bmN0aW9uJyApIHVnZW4ub25sb2FkKCkgXG4gICAgICB9KVxuICAgIH0sXG4gICAgbWVtb3J5IDoge1xuICAgICAgdmFsdWVzOiB7IGxlbmd0aDpidWZmZXIubGVuZ3RoLCBpZHg6bnVsbCB9XG4gICAgfVxuICB9KVxuXG4gIGlmKCBzaG91bGRMb2FkICkgdWdlbi5sb2FkKCB4IClcbiAgXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIHByb3BlcnRpZXMuZ2xvYmFsICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4uZ2xvYmFsc1sgcHJvcGVydGllcy5nbG9iYWwgXSA9IHVnZW5cbiAgICB9XG4gICAgaWYoIHByb3BlcnRpZXMubWV0YSA9PT0gdHJ1ZSApIHtcbiAgICAgIGZvciggbGV0IGkgPSAwLCBsZW5ndGggPSB1Z2VuLmJ1ZmZlci5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKyApIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCBpLCB7XG4gICAgICAgICAgZ2V0ICgpIHtcbiAgICAgICAgICAgIHJldHVybiBwZWVrKCB1Z2VuLCBpLCB7IG1vZGU6J3NpbXBsZScsIGludGVycDonbm9uZScgfSApXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgICByZXR1cm4gcG9rZSggdWdlbiwgdiwgaSApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBhZGQgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgbWVtbyAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSApID0+IHtcbiAgbGV0IHgxID0gaGlzdG9yeSgpLFxuICAgICAgeTEgPSBoaXN0b3J5KCksXG4gICAgICBmaWx0ZXJcblxuICAvL0hpc3RvcnkgeDEsIHkxOyB5ID0gaW4xIC0geDEgKyB5MSowLjk5OTc7IHgxID0gaW4xOyB5MSA9IHk7IG91dDEgPSB5O1xuICBmaWx0ZXIgPSBtZW1vKCBhZGQoIHN1YiggaW4xLCB4MS5vdXQgKSwgbXVsKCB5MS5vdXQsIC45OTk3ICkgKSApXG4gIHgxLmluKCBpbjEgKVxuICB5MS5pbiggZmlsdGVyIClcblxuICByZXR1cm4gZmlsdGVyXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICB0NjAgICAgID0gcmVxdWlyZSggJy4vdDYwLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkZWNheVRpbWUgPSA0NDEwMCwgcHJvcHMgKSA9PiB7XG4gIGxldCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBpbml0VmFsdWU6MSB9LCBwcm9wcyApLFxuICAgICAgc3NkID0gaGlzdG9yeSAoIHByb3BlcnRpZXMuaW5pdFZhbHVlIClcblxuICBzc2QuaW4oIG11bCggc3NkLm91dCwgdDYwKCBkZWNheVRpbWUgKSApIClcblxuICBzc2Qub3V0LnRyaWdnZXIgPSAoKT0+IHtcbiAgICBzc2QudmFsdWUgPSAxXG4gIH1cblxuICByZXR1cm4gc3NkLm91dCBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyAgKSxcbiAgICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgICAgcG9rZSA9IHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gICAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICAgIHN1YiAgPSByZXF1aXJlKCAnLi9zdWIuanMnICApLFxuICAgICAgd3JhcCA9IHJlcXVpcmUoICcuL3dyYXAuanMnICksXG4gICAgICBhY2N1bT0gcmVxdWlyZSggJy4vYWNjdW0uanMnKSxcbiAgICAgIG1lbW8gPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGVsYXknLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gaW5wdXRzWzBdXG4gICAgXG4gICAgcmV0dXJuIGlucHV0c1swXVxuICB9LFxufVxuXG5jb25zdCBkZWZhdWx0cyA9IHsgc2l6ZTogNTEyLCBpbnRlcnA6J25vbmUnIH1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgdGFwcywgcHJvcGVydGllcyApID0+IHtcbiAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgbGV0IHdyaXRlSWR4LCByZWFkSWR4LCBkZWxheWRhdGFcblxuICBpZiggQXJyYXkuaXNBcnJheSggdGFwcyApID09PSBmYWxzZSApIHRhcHMgPSBbIHRhcHMgXVxuICBcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIGNvbnN0IG1heFRhcFNpemUgPSBNYXRoLm1heCggLi4udGFwcyApXG4gIGlmKCBwcm9wcy5zaXplIDwgbWF4VGFwU2l6ZSApIHByb3BzLnNpemUgPSBtYXhUYXBTaXplXG5cbiAgZGVsYXlkYXRhID0gZGF0YSggcHJvcHMuc2l6ZSApXG4gIFxuICB1Z2VuLmlucHV0cyA9IFtdXG5cbiAgd3JpdGVJZHggPSBhY2N1bSggMSwgMCwgeyBtYXg6cHJvcHMuc2l6ZSwgbWluOjAgfSlcbiAgXG4gIGZvciggbGV0IGkgPSAwOyBpIDwgdGFwcy5sZW5ndGg7IGkrKyApIHtcbiAgICB1Z2VuLmlucHV0c1sgaSBdID0gcGVlayggZGVsYXlkYXRhLCB3cmFwKCBzdWIoIHdyaXRlSWR4LCB0YXBzW2ldICksIDAsIHByb3BzLnNpemUgKSx7IG1vZGU6J3NhbXBsZXMnLCBpbnRlcnA6cHJvcHMuaW50ZXJwIH0pXG4gIH1cbiAgXG4gIHVnZW4ub3V0cHV0cyA9IHVnZW4uaW5wdXRzIC8vIFhYWCB1Z2gsIFVnaCwgVUdIISBidXQgaSBndWVzcyBpdCB3b3Jrcy5cblxuICBwb2tlKCBkZWxheWRhdGEsIGluMSwgd3JpdGVJZHggKVxuXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgbjEgPSBoaXN0b3J5KClcbiAgICBcbiAgbjEuaW4oIGluMSApXG5cbiAgbGV0IHVnZW4gPSBzdWIoIGluMSwgbjEub3V0IClcbiAgdWdlbi5uYW1lID0gJ2RlbHRhJytnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGl2JyxcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dD1gICB2YXIgJHt0aGlzLm5hbWV9ID0gYCxcbiAgICAgICAgZGlmZiA9IDAsIFxuICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICBkaXZBdEVuZCA9IGZhbHNlXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgIGlmKCAhbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuICkge1xuICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAvIHZcbiAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gLyAke3Z9YFxuICAgICAgfVxuXG4gICAgICBpZiggIWlzRmluYWxJZHggKSBvdXQgKz0gJyAvICcgXG4gICAgfSlcblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBjb25zdCBkaXYgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBPYmplY3QuYXNzaWduKCBkaXYsIHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG4gIH0pXG5cbiAgZGl2Lm5hbWUgPSBkaXYuYmFzZW5hbWUgKyBkaXYuaWRcbiAgXG4gIHJldHVybiBkaXZcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbicgKSxcbiAgICB3aW5kb3dzID0gcmVxdWlyZSggJy4vd2luZG93cycgKSxcbiAgICBkYXRhICAgID0gcmVxdWlyZSggJy4vZGF0YScgKSxcbiAgICBwZWVrICAgID0gcmVxdWlyZSggJy4vcGVlaycgKSxcbiAgICBwaGFzb3IgID0gcmVxdWlyZSggJy4vcGhhc29yJyApLFxuICAgIGRlZmF1bHRzID0ge1xuICAgICAgdHlwZTondHJpYW5ndWxhcicsIGxlbmd0aDoxMDI0LCBhbHBoYTouMTUsIHNoaWZ0OjAsIHJldmVyc2U6ZmFsc2UgXG4gICAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByb3BzID0+IHtcbiAgXG4gIGxldCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBwcm9wcyApXG4gIGxldCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCBwcm9wZXJ0aWVzLmxlbmd0aCApXG5cbiAgbGV0IG5hbWUgPSBwcm9wZXJ0aWVzLnR5cGUgKyAnXycgKyBwcm9wZXJ0aWVzLmxlbmd0aCArICdfJyArIHByb3BlcnRpZXMuc2hpZnQgKyAnXycgKyBwcm9wZXJ0aWVzLnJldmVyc2UgKyAnXycgKyBwcm9wZXJ0aWVzLmFscGhhXG4gIGlmKCB0eXBlb2YgZ2VuLmdsb2JhbHMud2luZG93c1sgbmFtZSBdID09PSAndW5kZWZpbmVkJyApIHsgXG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBidWZmZXJbIGkgXSA9IHdpbmRvd3NbIHByb3BlcnRpZXMudHlwZSBdKCBwcm9wZXJ0aWVzLmxlbmd0aCwgaSwgcHJvcGVydGllcy5hbHBoYSwgcHJvcGVydGllcy5zaGlmdCApXG4gICAgfVxuXG4gICAgaWYoIHByb3BlcnRpZXMucmV2ZXJzZSA9PT0gdHJ1ZSApIHsgXG4gICAgICBidWZmZXIucmV2ZXJzZSgpXG4gICAgfVxuICAgIGdlbi5nbG9iYWxzLndpbmRvd3NbIG5hbWUgXSA9IGRhdGEoIGJ1ZmZlciApXG4gIH1cblxuICBsZXQgdWdlbiA9IGdlbi5nbG9iYWxzLndpbmRvd3NbIG5hbWUgXSBcbiAgdWdlbi5uYW1lID0gJ2VudicgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZXEnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IHRoaXMuaW5wdXRzWzBdID09PSB0aGlzLmlucHV0c1sxXSA/IDEgOiBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSA9PT0gJHtpbnB1dHNbMV19KSB8IDBcXG5cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfWAsIG91dCBdXG4gIH0sXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgaW4yICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZXhwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguZXhwIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uZXhwKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmV4cCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGV4cCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBleHAuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gZXhwXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZmxvb3InLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICAvL2dlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmZsb29yIH0pXG5cbiAgICAgIG91dCA9IGAoICR7aW5wdXRzWzBdfSB8IDAgKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gfCAwXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgZmxvb3IgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZmxvb3IuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gZmxvb3Jcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZm9sZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dFxuXG4gICAgb3V0ID0gdGhpcy5jcmVhdGVDYWxsYmFjayggaW5wdXRzWzBdLCB0aGlzLm1pbiwgdGhpcy5tYXggKSBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfdmFsdWUnXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgb3V0IF1cbiAgfSxcblxuICBjcmVhdGVDYWxsYmFjayggdiwgbG8sIGhpICkge1xuICAgIGxldCBvdXQgPVxuYCB2YXIgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHt2fSxcbiAgICAgICR7dGhpcy5uYW1lfV9yYW5nZSA9ICR7aGl9IC0gJHtsb30sXG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAwXG5cbiAgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlID49ICR7aGl9KXtcbiAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlXG4gICAgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlID49ICR7aGl9KXtcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9ICgoJHt0aGlzLm5hbWV9X3ZhbHVlIC0gJHtsb30pIC8gJHt0aGlzLm5hbWV9X3JhbmdlKSB8IDBcbiAgICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2UgKiAke3RoaXMubmFtZX1fbnVtV3JhcHNcbiAgICB9XG4gICAgJHt0aGlzLm5hbWV9X251bVdyYXBzKytcbiAgfSBlbHNlIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA8ICR7bG99KXtcbiAgICAke3RoaXMubmFtZX1fdmFsdWUgKz0gJHt0aGlzLm5hbWV9X3JhbmdlXG4gICAgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlIDwgJHtsb30pe1xuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gKCgke3RoaXMubmFtZX1fdmFsdWUgLSAke2xvfSkgLyAke3RoaXMubmFtZX1fcmFuZ2UtIDEpIHwgMFxuICAgICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZSAqICR7dGhpcy5uYW1lfV9udW1XcmFwc1xuICAgIH1cbiAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMtLVxuICB9XG4gIGlmKCR7dGhpcy5uYW1lfV9udW1XcmFwcyAmIDEpICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7aGl9ICsgJHtsb30gLSAke3RoaXMubmFtZX1fdmFsdWVcbmBcbiAgICByZXR1cm4gJyAnICsgb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2dhdGUnLFxuICBjb250cm9sU3RyaW5nOm51bGwsIC8vIGluc2VydCBpbnRvIG91dHB1dCBjb2RlZ2VuIGZvciBkZXRlcm1pbmluZyBpbmRleGluZ1xuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG4gICAgXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBcbiAgICBsZXQgbGFzdElucHV0TWVtb3J5SWR4ID0gJ21lbW9yeVsgJyArIHRoaXMubWVtb3J5Lmxhc3RJbnB1dC5pZHggKyAnIF0nLFxuICAgICAgICBvdXRwdXRNZW1vcnlTdGFydElkeCA9IHRoaXMubWVtb3J5Lmxhc3RJbnB1dC5pZHggKyAxLFxuICAgICAgICBpbnB1dFNpZ25hbCA9IGlucHV0c1swXSxcbiAgICAgICAgY29udHJvbFNpZ25hbCA9IGlucHV0c1sxXVxuICAgIFxuICAgIC8qIFxuICAgICAqIHdlIGNoZWNrIHRvIHNlZSBpZiB0aGUgY3VycmVudCBjb250cm9sIGlucHV0cyBlcXVhbHMgb3VyIGxhc3QgaW5wdXRcbiAgICAgKiBpZiBzbywgd2Ugc3RvcmUgdGhlIHNpZ25hbCBpbnB1dCBpbiB0aGUgbWVtb3J5IGFzc29jaWF0ZWQgd2l0aCB0aGUgY3VycmVudGx5XG4gICAgICogc2VsZWN0ZWQgaW5kZXguIElmIG5vdCwgd2UgcHV0IDAgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGxhc3Qgc2VsZWN0ZWQgaW5kZXgsXG4gICAgICogY2hhbmdlIHRoZSBzZWxlY3RlZCBpbmRleCwgYW5kIHRoZW4gc3RvcmUgdGhlIHNpZ25hbCBpbiBwdXQgaW4gdGhlIG1lbWVyeSBhc3NvaWNhdGVkXG4gICAgICogd2l0aCB0aGUgbmV3bHkgc2VsZWN0ZWQgaW5kZXhcbiAgICAgKi9cbiAgICBcbiAgICBvdXQgPVxuXG5gIGlmKCAke2NvbnRyb2xTaWduYWx9ICE9PSAke2xhc3RJbnB1dE1lbW9yeUlkeH0gKSB7XG4gICAgbWVtb3J5WyAke2xhc3RJbnB1dE1lbW9yeUlkeH0gKyAke291dHB1dE1lbW9yeVN0YXJ0SWR4fSAgXSA9IDAgXG4gICAgJHtsYXN0SW5wdXRNZW1vcnlJZHh9ID0gJHtjb250cm9sU2lnbmFsfVxuICB9XG4gIG1lbW9yeVsgJHtvdXRwdXRNZW1vcnlTdGFydElkeH0gKyAke2NvbnRyb2xTaWduYWx9IF0gPSAke2lucHV0U2lnbmFsfVxuXG5gXG4gICAgdGhpcy5jb250cm9sU3RyaW5nID0gaW5wdXRzWzFdXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWVcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgdGhpcy5vdXRwdXRzLmZvckVhY2goIHYgPT4gdi5nZW4oKSApXG5cbiAgICByZXR1cm4gWyBudWxsLCAnICcgKyBvdXQgXVxuICB9LFxuXG4gIGNoaWxkZ2VuKCkge1xuICAgIGlmKCB0aGlzLnBhcmVudC5pbml0aWFsaXplZCA9PT0gZmFsc2UgKSB7XG4gICAgICBnZW4uZ2V0SW5wdXRzKCB0aGlzICkgLy8gcGFyZW50IGdhdGUgaXMgb25seSBpbnB1dCBvZiBhIGdhdGUgb3V0cHV0LCBzaG91bGQgb25seSBiZSBnZW4nZCBvbmNlLlxuICAgIH1cblxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG5cbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBtZW1vcnlbICR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fSBdYFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gIGBtZW1vcnlbICR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fSBdYFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBjb250cm9sLCBpbjEsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBjb3VudDogMiB9XG5cbiAgaWYoIHR5cGVvZiBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIG91dHB1dHM6IFtdLFxuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGluMSwgY29udHJvbCBdLFxuICAgIG1lbW9yeToge1xuICAgICAgbGFzdElucHV0OiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gICAgfSxcbiAgICBpbml0aWFsaXplZDpmYWxzZVxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7Z2VuLmdldFVJRCgpfWBcblxuICBmb3IoIGxldCBpID0gMDsgaSA8IHVnZW4uY291bnQ7IGkrKyApIHtcbiAgICB1Z2VuLm91dHB1dHMucHVzaCh7XG4gICAgICBpbmRleDppLFxuICAgICAgZ2VuOiBwcm90by5jaGlsZGdlbixcbiAgICAgIHBhcmVudDp1Z2VuLFxuICAgICAgaW5wdXRzOiBbIHVnZW4gXSxcbiAgICAgIG1lbW9yeToge1xuICAgICAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgICAgfSxcbiAgICAgIGluaXRpYWxpemVkOmZhbHNlLFxuICAgICAgbmFtZTogYCR7dWdlbi5uYW1lfV9vdXQke2dlbi5nZXRVSUQoKX1gXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuLyogZ2VuLmpzXG4gKlxuICogbG93LWxldmVsIGNvZGUgZ2VuZXJhdGlvbiBmb3IgdW5pdCBnZW5lcmF0b3JzXG4gKlxuICovXG5cbmxldCBNZW1vcnlIZWxwZXIgPSByZXF1aXJlKCAnbWVtb3J5LWhlbHBlcicgKVxuXG5sZXQgZ2VuID0ge1xuXG4gIGFjY3VtOjAsXG4gIGdldFVJRCgpIHsgcmV0dXJuIHRoaXMuYWNjdW0rKyB9LFxuICBkZWJ1ZzpmYWxzZSxcbiAgc2FtcGxlcmF0ZTogNDQxMDAsIC8vIGNoYW5nZSBvbiBhdWRpb2NvbnRleHQgY3JlYXRpb25cbiAgc2hvdWxkTG9jYWxpemU6IGZhbHNlLFxuICBnbG9iYWxzOntcbiAgICB3aW5kb3dzOiB7fSxcbiAgfSxcbiAgXG4gIC8qIGNsb3N1cmVzXG4gICAqXG4gICAqIEZ1bmN0aW9ucyB0aGF0IGFyZSBpbmNsdWRlZCBhcyBhcmd1bWVudHMgdG8gbWFzdGVyIGNhbGxiYWNrLiBFeGFtcGxlczogTWF0aC5hYnMsIE1hdGgucmFuZG9tIGV0Yy5cbiAgICogWFhYIFNob3VsZCBwcm9iYWJseSBiZSByZW5hbWVkIGNhbGxiYWNrUHJvcGVydGllcyBvciBzb21ldGhpbmcgc2ltaWxhci4uLiBjbG9zdXJlcyBhcmUgbm8gbG9uZ2VyIHVzZWQuXG4gICAqL1xuXG4gIGNsb3N1cmVzOiBuZXcgU2V0KCksXG4gIHBhcmFtczogICBuZXcgU2V0KCksXG5cbiAgcGFyYW1ldGVyczpbXSxcbiAgZW5kQmxvY2s6IG5ldyBTZXQoKSxcbiAgaGlzdG9yaWVzOiBuZXcgTWFwKCksXG5cbiAgbWVtbzoge30sXG5cbiAgLy9kYXRhOiB7fSxcbiAgXG4gIC8qIGV4cG9ydFxuICAgKlxuICAgKiBwbGFjZSBnZW4gZnVuY3Rpb25zIGludG8gYW5vdGhlciBvYmplY3QgZm9yIGVhc2llciByZWZlcmVuY2VcbiAgICovXG5cbiAgZXhwb3J0KCBvYmogKSB7fSxcblxuICBhZGRUb0VuZEJsb2NrKCB2ICkge1xuICAgIHRoaXMuZW5kQmxvY2suYWRkKCAnICAnICsgdiApXG4gIH0sXG4gIFxuICByZXF1ZXN0TWVtb3J5KCBtZW1vcnlTcGVjLCBpbW11dGFibGU9ZmFsc2UgKSB7XG4gICAgZm9yKCBsZXQga2V5IGluIG1lbW9yeVNwZWMgKSB7XG4gICAgICBsZXQgcmVxdWVzdCA9IG1lbW9yeVNwZWNbIGtleSBdXG5cbiAgICAgIC8vY29uc29sZS5sb2coICdyZXF1ZXN0aW5nICcgKyBrZXkgKyAnOicgLCBKU09OLnN0cmluZ2lmeSggcmVxdWVzdCApIClcblxuICAgICAgaWYoIHJlcXVlc3QubGVuZ3RoID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAndW5kZWZpbmVkIGxlbmd0aCBmb3I6Jywga2V5IClcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmlkeCA9IGdlbi5tZW1vcnkuYWxsb2MoIHJlcXVlc3QubGVuZ3RoLCBpbW11dGFibGUgKVxuICAgIH1cbiAgfSxcblxuICBjcmVhdGVNZW1vcnkoIGFtb3VudCwgdHlwZSApIHtcbiAgICBjb25zdCBtZW0gPSBNZW1vcnlIZWxwZXIuY3JlYXRlKCBhbW91bnQsIHR5cGUgKVxuICAgIHJldHVybiBtZW1cbiAgfSxcblxuICAvKiBjcmVhdGVDYWxsYmFja1xuICAgKlxuICAgKiBwYXJhbSB1Z2VuIC0gSGVhZCBvZiBncmFwaCB0byBiZSBjb2RlZ2VuJ2RcbiAgICpcbiAgICogR2VuZXJhdGUgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGEgcGFydGljdWxhciB1Z2VuIGdyYXBoLlxuICAgKiBUaGUgZ2VuLmNsb3N1cmVzIHByb3BlcnR5IHN0b3JlcyBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlXG4gICAqIHBhc3NlZCBhcyBhcmd1bWVudHMgdG8gdGhlIGZpbmFsIGZ1bmN0aW9uOyB0aGVzZSBhcmUgcHJlZml4ZWRcbiAgICogYmVmb3JlIGFueSBkZWZpbmVkIHBhcmFtcyB0aGUgZ3JhcGggZXhwb3Nlcy4gRm9yIGV4YW1wbGUsIGdpdmVuOlxuICAgKlxuICAgKiBnZW4uY3JlYXRlQ2FsbGJhY2soIGFicyggcGFyYW0oKSApIClcbiAgICpcbiAgICogLi4uIHRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gd2lsbCBoYXZlIGEgc2lnbmF0dXJlIG9mICggYWJzLCBwMCApLlxuICAgKi9cbiAgXG4gIGNyZWF0ZUNhbGxiYWNrKCB1Z2VuLCBtZW0sIGRlYnVnID0gZmFsc2UsIHNob3VsZElubGluZU1lbW9yeT1mYWxzZSwgbWVtVHlwZSA9IEZsb2F0NjRBcnJheSApIHtcbiAgICBsZXQgaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KCB1Z2VuICkgJiYgdWdlbi5sZW5ndGggPiAxLFxuICAgICAgICBjYWxsYmFjaywgXG4gICAgICAgIGNoYW5uZWwxLCBjaGFubmVsMlxuXG4gICAgaWYoIHR5cGVvZiBtZW0gPT09ICdudW1iZXInIHx8IG1lbSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgbWVtID0gTWVtb3J5SGVscGVyLmNyZWF0ZSggbWVtLCBtZW1UeXBlIClcbiAgICB9XG4gICAgXG4gICAgLy9jb25zb2xlLmxvZyggJ2NiIG1lbW9yeTonLCBtZW0gKVxuICAgIHRoaXMubWVtb3J5ID0gbWVtXG4gICAgdGhpcy5tZW1vID0ge30gXG4gICAgdGhpcy5lbmRCbG9jay5jbGVhcigpXG4gICAgdGhpcy5jbG9zdXJlcy5jbGVhcigpXG4gICAgdGhpcy5wYXJhbXMuY2xlYXIoKVxuICAgIC8vdGhpcy5nbG9iYWxzID0geyB3aW5kb3dzOnt9IH1cbiAgICBcbiAgICB0aGlzLnBhcmFtZXRlcnMubGVuZ3RoID0gMFxuICAgIFxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gXCIgICd1c2Ugc3RyaWN0J1xcblwiXG4gICAgaWYoIHNob3VsZElubGluZU1lbW9yeT09PWZhbHNlICkgdGhpcy5mdW5jdGlvbkJvZHkgKz0gXCIgIHZhciBtZW1vcnkgPSBnZW4ubWVtb3J5XFxuXFxuXCIgXG5cbiAgICAvLyBjYWxsIC5nZW4oKSBvbiB0aGUgaGVhZCBvZiB0aGUgZ3JhcGggd2UgYXJlIGdlbmVyYXRpbmcgdGhlIGNhbGxiYWNrIGZvclxuICAgIC8vY29uc29sZS5sb2coICdIRUFEJywgdWdlbiApXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCAxICsgaXNTdGVyZW87IGkrKyApIHtcbiAgICAgIGlmKCB0eXBlb2YgdWdlbltpXSA9PT0gJ251bWJlcicgKSBjb250aW51ZVxuXG4gICAgICAvL2xldCBjaGFubmVsID0gaXNTdGVyZW8gPyB1Z2VuW2ldLmdlbigpIDogdWdlbi5nZW4oKSxcbiAgICAgIGxldCBjaGFubmVsID0gaXNTdGVyZW8gPyB0aGlzLmdldElucHV0KCB1Z2VuW2ldICkgOiB0aGlzLmdldElucHV0KCB1Z2VuICksIFxuICAgICAgICAgIGJvZHkgPSAnJ1xuXG4gICAgICAvLyBpZiAuZ2VuKCkgcmV0dXJucyBhcnJheSwgYWRkIHVnZW4gY2FsbGJhY2sgKGdyYXBoT3V0cHV0WzFdKSB0byBvdXIgb3V0cHV0IGZ1bmN0aW9ucyBib2R5XG4gICAgICAvLyBhbmQgdGhlbiByZXR1cm4gbmFtZSBvZiB1Z2VuLiBJZiAuZ2VuKCkgb25seSBnZW5lcmF0ZXMgYSBudW1iZXIgKGZvciByZWFsbHkgc2ltcGxlIGdyYXBocylcbiAgICAgIC8vIGp1c3QgcmV0dXJuIHRoYXQgbnVtYmVyIChncmFwaE91dHB1dFswXSkuXG4gICAgICBib2R5ICs9IEFycmF5LmlzQXJyYXkoIGNoYW5uZWwgKSA/IGNoYW5uZWxbMV0gKyAnXFxuJyArIGNoYW5uZWxbMF0gOiBjaGFubmVsXG5cbiAgICAgIC8vIHNwbGl0IGJvZHkgdG8gaW5qZWN0IHJldHVybiBrZXl3b3JkIG9uIGxhc3QgbGluZVxuICAgICAgYm9keSA9IGJvZHkuc3BsaXQoJ1xcbicpXG4gICAgIFxuICAgICAgLy9pZiggZGVidWcgKSBjb25zb2xlLmxvZyggJ2Z1bmN0aW9uQm9keSBsZW5ndGgnLCBib2R5IClcbiAgICAgIFxuICAgICAgLy8gbmV4dCBsaW5lIGlzIHRvIGFjY29tbW9kYXRlIG1lbW8gYXMgZ3JhcGggaGVhZFxuICAgICAgaWYoIGJvZHlbIGJvZHkubGVuZ3RoIC0xIF0udHJpbSgpLmluZGV4T2YoJ2xldCcpID4gLTEgKSB7IGJvZHkucHVzaCggJ1xcbicgKSB9IFxuXG4gICAgICAvLyBnZXQgaW5kZXggb2YgbGFzdCBsaW5lXG4gICAgICBsZXQgbGFzdGlkeCA9IGJvZHkubGVuZ3RoIC0gMVxuXG4gICAgICAvLyBpbnNlcnQgcmV0dXJuIGtleXdvcmRcbiAgICAgIGJvZHlbIGxhc3RpZHggXSA9ICcgIGdlbi5vdXRbJyArIGkgKyAnXSAgPSAnICsgYm9keVsgbGFzdGlkeCBdICsgJ1xcbidcblxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gYm9keS5qb2luKCdcXG4nKVxuICAgIH1cbiAgICBcbiAgICB0aGlzLmhpc3Rvcmllcy5mb3JFYWNoKCB2YWx1ZSA9PiB7XG4gICAgICBpZiggdmFsdWUgIT09IG51bGwgKVxuICAgICAgICB2YWx1ZS5nZW4oKSAgICAgIFxuICAgIH0pXG5cbiAgICBsZXQgcmV0dXJuU3RhdGVtZW50ID0gaXNTdGVyZW8gPyAnICByZXR1cm4gZ2VuLm91dCcgOiAnICByZXR1cm4gZ2VuLm91dFswXSdcbiAgICBcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LnNwbGl0KCdcXG4nKVxuXG4gICAgaWYoIHRoaXMuZW5kQmxvY2suc2l6ZSApIHsgXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmNvbmNhdCggQXJyYXkuZnJvbSggdGhpcy5lbmRCbG9jayApIClcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2goIHJldHVyblN0YXRlbWVudCApXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKCByZXR1cm5TdGF0ZW1lbnQgKVxuICAgIH1cbiAgICAvLyByZWFzc2VtYmxlIGZ1bmN0aW9uIGJvZHlcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmpvaW4oJ1xcbicpXG5cbiAgICAvLyB3ZSBjYW4gb25seSBkeW5hbWljYWxseSBjcmVhdGUgYSBuYW1lZCBmdW5jdGlvbiBieSBkeW5hbWljYWxseSBjcmVhdGluZyBhbm90aGVyIGZ1bmN0aW9uXG4gICAgLy8gdG8gY29uc3RydWN0IHRoZSBuYW1lZCBmdW5jdGlvbiEgc2hlZXNoLi4uXG4gICAgLy9cbiAgICBpZiggc2hvdWxkSW5saW5lTWVtb3J5ID09PSB0cnVlICkge1xuICAgICAgdGhpcy5wYXJhbWV0ZXJzLnB1c2goICdtZW1vcnknIClcbiAgICB9XG4gICAgbGV0IGJ1aWxkU3RyaW5nID0gYHJldHVybiBmdW5jdGlvbiBnZW4oICR7IHRoaXMucGFyYW1ldGVycy5qb2luKCcsJykgfSApeyBcXG4keyB0aGlzLmZ1bmN0aW9uQm9keSB9XFxufWBcbiAgICBcbiAgICBpZiggdGhpcy5kZWJ1ZyB8fCBkZWJ1ZyApIGNvbnNvbGUubG9nKCBidWlsZFN0cmluZyApIFxuXG4gICAgY2FsbGJhY2sgPSBuZXcgRnVuY3Rpb24oIGJ1aWxkU3RyaW5nICkoKVxuXG4gICAgXG4gICAgLy8gYXNzaWduIHByb3BlcnRpZXMgdG8gbmFtZWQgZnVuY3Rpb25cbiAgICBmb3IoIGxldCBkaWN0IG9mIHRoaXMuY2xvc3VyZXMudmFsdWVzKCkgKSB7XG4gICAgICBsZXQgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF0sXG4gICAgICAgICAgdmFsdWUgPSBkaWN0WyBuYW1lIF1cblxuICAgICAgY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgZm9yKCBsZXQgZGljdCBvZiB0aGlzLnBhcmFtcy52YWx1ZXMoKSApIHtcbiAgICAgIGxldCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICB1Z2VuID0gZGljdFsgbmFtZSBdXG4gICAgICBcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggY2FsbGJhY2ssIG5hbWUsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7IHJldHVybiB1Z2VuLnZhbHVlIH0sXG4gICAgICAgIHNldCh2KXsgdWdlbi52YWx1ZSA9IHYgfVxuICAgICAgfSlcbiAgICAgIC8vY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgY2FsbGJhY2suZGF0YSA9IHRoaXMuZGF0YVxuICAgIGNhbGxiYWNrLm91dCAgPSBuZXcgRmxvYXQ2NEFycmF5KCAyIClcbiAgICBjYWxsYmFjay5wYXJhbWV0ZXJzID0gdGhpcy5wYXJhbWV0ZXJzLnNsaWNlKCAwIClcblxuICAgIC8vaWYoIE1lbW9yeUhlbHBlci5pc1Byb3RvdHlwZU9mKCB0aGlzLm1lbW9yeSApICkgXG4gICAgY2FsbGJhY2subWVtb3J5ID0gdGhpcy5tZW1vcnkuaGVhcFxuXG4gICAgdGhpcy5oaXN0b3JpZXMuY2xlYXIoKVxuXG4gICAgcmV0dXJuIGNhbGxiYWNrXG4gIH0sXG4gIFxuICAvKiBnZXRJbnB1dHNcbiAgICpcbiAgICogQ2FsbGVkIGJ5IGVhY2ggaW5kaXZpZHVhbCB1Z2VuIHdoZW4gdGhlaXIgLmdlbigpIG1ldGhvZCBpcyBjYWxsZWQgdG8gcmVzb2x2ZSB0aGVpciB2YXJpb3VzIGlucHV0cy5cbiAgICogSWYgYW4gaW5wdXQgaXMgYSBudW1iZXIsIHJldHVybiB0aGUgbnVtYmVyLiBJZlxuICAgKiBpdCBpcyBhbiB1Z2VuLCBjYWxsIC5nZW4oKSBvbiB0aGUgdWdlbiwgbWVtb2l6ZSB0aGUgcmVzdWx0IGFuZCByZXR1cm4gdGhlIHJlc3VsdC4gSWYgdGhlXG4gICAqIHVnZW4gaGFzIHByZXZpb3VzbHkgYmVlbiBtZW1vaXplZCByZXR1cm4gdGhlIG1lbW9pemVkIHZhbHVlLlxuICAgKlxuICAgKi9cbiAgZ2V0SW5wdXRzKCB1Z2VuICkge1xuICAgIHJldHVybiB1Z2VuLmlucHV0cy5tYXAoIGdlbi5nZXRJbnB1dCApIFxuICB9LFxuXG4gIGdldElucHV0KCBpbnB1dCApIHtcbiAgICBsZXQgaXNPYmplY3QgPSB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnLFxuICAgICAgICBwcm9jZXNzZWRJbnB1dFxuXG4gICAgaWYoIGlzT2JqZWN0ICkgeyAvLyBpZiBpbnB1dCBpcyBhIHVnZW4uLi4gXG4gICAgICAvL2NvbnNvbGUubG9nKCBpbnB1dC5uYW1lLCBnZW4ubWVtb1sgaW5wdXQubmFtZSBdIClcbiAgICAgIGlmKCBnZW4ubWVtb1sgaW5wdXQubmFtZSBdICkgeyAvLyBpZiBpdCBoYXMgYmVlbiBtZW1vaXplZC4uLlxuICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGdlbi5tZW1vWyBpbnB1dC5uYW1lIF1cbiAgICAgIH1lbHNlIGlmKCBBcnJheS5pc0FycmF5KCBpbnB1dCApICkge1xuICAgICAgICBnZW4uZ2V0SW5wdXQoIGlucHV0WzBdIClcbiAgICAgICAgZ2VuLmdldElucHV0KCBpbnB1dFsxXSApXG4gICAgICB9ZWxzZXsgLy8gaWYgbm90IG1lbW9pemVkIGdlbmVyYXRlIGNvZGUgIFxuICAgICAgICBpZiggdHlwZW9mIGlucHV0LmdlbiAhPT0gJ2Z1bmN0aW9uJyApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggJ25vIGdlbiBmb3VuZDonLCBpbnB1dCwgaW5wdXQuZ2VuIClcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29kZSA9IGlucHV0LmdlbigpXG4gICAgICAgIC8vaWYoIGNvZGUuaW5kZXhPZiggJ09iamVjdCcgKSA+IC0xICkgY29uc29sZS5sb2coICdiYWQgaW5wdXQ6JywgaW5wdXQsIGNvZGUgKVxuICAgICAgICBcbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGNvZGUgKSApIHtcbiAgICAgICAgICBpZiggIWdlbi5zaG91bGRMb2NhbGl6ZSApIHtcbiAgICAgICAgICAgIGdlbi5mdW5jdGlvbkJvZHkgKz0gY29kZVsxXVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgZ2VuLmNvZGVOYW1lID0gY29kZVswXVxuICAgICAgICAgICAgZ2VuLmxvY2FsaXplZENvZGUucHVzaCggY29kZVsxXSApXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vY29uc29sZS5sb2coICdhZnRlciBHRU4nICwgdGhpcy5mdW5jdGlvbkJvZHkgKVxuICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gY29kZVswXVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1lbHNleyAvLyBpdCBpbnB1dCBpcyBhIG51bWJlclxuICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBpbnB1dFxuICAgIH1cblxuICAgIHJldHVybiBwcm9jZXNzZWRJbnB1dFxuICB9LFxuXG4gIHN0YXJ0TG9jYWxpemUoKSB7XG4gICAgdGhpcy5sb2NhbGl6ZWRDb2RlID0gW11cbiAgICB0aGlzLnNob3VsZExvY2FsaXplID0gdHJ1ZVxuICB9LFxuICBlbmRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLnNob3VsZExvY2FsaXplID0gZmFsc2VcblxuICAgIHJldHVybiBbIHRoaXMuY29kZU5hbWUsIHRoaXMubG9jYWxpemVkQ29kZS5zbGljZSgwKSBdXG4gIH0sXG5cbiAgZnJlZSggZ3JhcGggKSB7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIGdyYXBoICkgKSB7IC8vIHN0ZXJlbyB1Z2VuXG4gICAgICBmb3IoIGxldCBjaGFubmVsIG9mIGdyYXBoICkge1xuICAgICAgICB0aGlzLmZyZWUoIGNoYW5uZWwgKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggdHlwZW9mIGdyYXBoID09PSAnb2JqZWN0JyApIHtcbiAgICAgICAgaWYoIGdyYXBoLm1lbW9yeSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIGZvciggbGV0IG1lbW9yeUtleSBpbiBncmFwaC5tZW1vcnkgKSB7XG4gICAgICAgICAgICB0aGlzLm1lbW9yeS5mcmVlKCBncmFwaC5tZW1vcnlbIG1lbW9yeUtleSBdLmlkeCApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCBncmFwaC5pbnB1dHMgKSApIHtcbiAgICAgICAgICBmb3IoIGxldCB1Z2VuIG9mIGdyYXBoLmlucHV0cyApIHtcbiAgICAgICAgICAgIHRoaXMuZnJlZSggdWdlbiApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2d0JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoKCAke2lucHV0c1swXX0gPiAke2lucHV0c1sxXX0pIHwgMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID4gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3QuaW5wdXRzID0gWyB4LHkgXVxuICBndC5uYW1lID0gZ3QuYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gZ3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2d0ZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPj0gJHtpbnB1dHNbMV19IHwgMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID49IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0LmlucHV0cyA9IFsgeCx5IF1cbiAgZ3QubmFtZSA9ICdndGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGd0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZ3RwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgPSBgKCR7aW5wdXRzWyAwIF19ICogKCAoICR7aW5wdXRzWzBdfSA+ICR7aW5wdXRzWzFdfSApIHwgMCApIClgIFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gKiAoICggaW5wdXRzWzBdID4gaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3RwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGd0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xPTAgKSA9PiB7XG4gIGxldCB1Z2VuID0ge1xuICAgIGlucHV0czogWyBpbjEgXSxcbiAgICBtZW1vcnk6IHsgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9IH0sXG4gICAgcmVjb3JkZXI6IG51bGwsXG5cbiAgICBpbiggdiApIHtcbiAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmhhcyggdiApICl7XG4gICAgICAgIGxldCBtZW1vSGlzdG9yeSA9IGdlbi5oaXN0b3JpZXMuZ2V0KCB2IClcbiAgICAgICAgdWdlbi5uYW1lID0gbWVtb0hpc3RvcnkubmFtZVxuICAgICAgICByZXR1cm4gbWVtb0hpc3RvcnlcbiAgICAgIH1cblxuICAgICAgbGV0IG9iaiA9IHtcbiAgICAgICAgZ2VuKCkge1xuICAgICAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB1Z2VuIClcblxuICAgICAgICAgIGlmKCB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggXSA9IGluMVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBpZHggPSB1Z2VuLm1lbW9yeS52YWx1ZS5pZHhcbiAgICAgICAgICBcbiAgICAgICAgICBnZW4uYWRkVG9FbmRCbG9jayggJ21lbW9yeVsgJyArIGlkeCArICcgXSA9ICcgKyBpbnB1dHNbIDAgXSApXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gcmV0dXJuIHVnZW4gdGhhdCBpcyBiZWluZyByZWNvcmRlZCBpbnN0ZWFkIG9mIHNzZC5cbiAgICAgICAgICAvLyB0aGlzIGVmZmVjdGl2ZWx5IG1ha2VzIGEgY2FsbCB0byBzc2QucmVjb3JkKCkgdHJhbnNwYXJlbnQgdG8gdGhlIGdyYXBoLlxuICAgICAgICAgIC8vIHJlY29yZGluZyBpcyB0cmlnZ2VyZWQgYnkgcHJpb3IgY2FsbCB0byBnZW4uYWRkVG9FbmRCbG9jay5cbiAgICAgICAgICBnZW4uaGlzdG9yaWVzLnNldCggdiwgb2JqIClcblxuICAgICAgICAgIHJldHVybiBpbnB1dHNbIDAgXVxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiB1Z2VuLm5hbWUgKyAnX2luJytnZW4uZ2V0VUlEKCksXG4gICAgICAgIG1lbW9yeTogdWdlbi5tZW1vcnlcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnB1dHNbIDAgXSA9IHZcbiAgICAgIFxuICAgICAgdWdlbi5yZWNvcmRlciA9IG9ialxuXG4gICAgICByZXR1cm4gb2JqXG4gICAgfSxcbiAgICBcbiAgICBvdXQ6IHtcbiAgICAgICAgICAgIFxuICAgICAgZ2VuKCkge1xuICAgICAgICBpZiggdWdlbi5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkge1xuICAgICAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmdldCggdWdlbi5pbnB1dHNbMF0gKSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgZ2VuLmhpc3Rvcmllcy5zZXQoIHVnZW4uaW5wdXRzWzBdLCB1Z2VuLnJlY29yZGVyIClcbiAgICAgICAgICB9XG4gICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gcGFyc2VGbG9hdCggaW4xIClcbiAgICAgICAgfVxuICAgICAgICBsZXQgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4XG4gICAgICAgICBcbiAgICAgICAgcmV0dXJuICdtZW1vcnlbICcgKyBpZHggKyAnIF0gJ1xuICAgICAgfSxcbiAgICB9LFxuXG4gICAgdWlkOiBnZW4uZ2V0VUlEKCksXG4gIH1cbiAgXG4gIHVnZW4ub3V0Lm1lbW9yeSA9IHVnZW4ubWVtb3J5IFxuXG4gIHVnZW4ubmFtZSA9ICdoaXN0b3J5JyArIHVnZW4udWlkXG4gIHVnZW4ub3V0Lm5hbWUgPSB1Z2VuLm5hbWUgKyAnX291dCdcbiAgdWdlbi5pbi5fbmFtZSAgPSB1Z2VuLm5hbWUgPSAnX2luJ1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2lmZWxzZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb25kaXRpb25hbHMgPSB0aGlzLmlucHV0c1swXSxcbiAgICAgICAgZGVmYXVsdFZhbHVlID0gZ2VuLmdldElucHV0KCBjb25kaXRpb25hbHNbIGNvbmRpdGlvbmFscy5sZW5ndGggLSAxXSApLFxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7ZGVmYXVsdFZhbHVlfVxcbmAgXG5cbiAgICAvL2NvbnNvbGUubG9nKCAnY29uZGl0aW9uYWxzOicsIHRoaXMubmFtZSwgY29uZGl0aW9uYWxzIClcblxuICAgIC8vY29uc29sZS5sb2coICdkZWZhdWx0VmFsdWU6JywgZGVmYXVsdFZhbHVlIClcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgY29uZGl0aW9uYWxzLmxlbmd0aCAtIDI7IGkrPSAyICkge1xuICAgICAgbGV0IGlzRW5kQmxvY2sgPSBpID09PSBjb25kaXRpb25hbHMubGVuZ3RoIC0gMyxcbiAgICAgICAgICBjb25kICA9IGdlbi5nZXRJbnB1dCggY29uZGl0aW9uYWxzWyBpIF0gKSxcbiAgICAgICAgICBwcmVibG9jayA9IGNvbmRpdGlvbmFsc1sgaSsxIF0sXG4gICAgICAgICAgYmxvY2ssIGJsb2NrTmFtZSwgb3V0cHV0XG5cbiAgICAgIC8vY29uc29sZS5sb2coICdwYicsIHByZWJsb2NrIClcblxuICAgICAgaWYoIHR5cGVvZiBwcmVibG9jayA9PT0gJ251bWJlcicgKXtcbiAgICAgICAgYmxvY2sgPSBwcmVibG9ja1xuICAgICAgICBibG9ja05hbWUgPSBudWxsXG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYoIGdlbi5tZW1vWyBwcmVibG9jay5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAvLyB1c2VkIHRvIHBsYWNlIGFsbCBjb2RlIGRlcGVuZGVuY2llcyBpbiBhcHByb3ByaWF0ZSBibG9ja3NcbiAgICAgICAgICBnZW4uc3RhcnRMb2NhbGl6ZSgpXG5cbiAgICAgICAgICBnZW4uZ2V0SW5wdXQoIHByZWJsb2NrIClcblxuICAgICAgICAgIGJsb2NrID0gZ2VuLmVuZExvY2FsaXplKClcbiAgICAgICAgICBibG9ja05hbWUgPSBibG9ja1swXVxuICAgICAgICAgIGJsb2NrID0gYmxvY2tbIDEgXS5qb2luKCcnKVxuICAgICAgICAgIGJsb2NrID0gJyAgJyArIGJsb2NrLnJlcGxhY2UoIC9cXG4vZ2ksICdcXG4gICcgKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBibG9jayA9ICcnXG4gICAgICAgICAgYmxvY2tOYW1lID0gZ2VuLm1lbW9bIHByZWJsb2NrLm5hbWUgXVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG91dHB1dCA9IGJsb2NrTmFtZSA9PT0gbnVsbCA/IFxuICAgICAgICBgICAke3RoaXMubmFtZX1fb3V0ID0gJHtibG9ja31gIDpcbiAgICAgICAgYCR7YmxvY2t9ICAke3RoaXMubmFtZX1fb3V0ID0gJHtibG9ja05hbWV9YFxuICAgICAgXG4gICAgICBpZiggaT09PTAgKSBvdXQgKz0gJyAnXG4gICAgICBvdXQgKz0gXG5gIGlmKCAke2NvbmR9ID09PSAxICkge1xuJHtvdXRwdXR9XG4gIH1gXG5cbiAgICAgIGlmKCAhaXNFbmRCbG9jayApIHtcbiAgICAgICAgb3V0ICs9IGAgZWxzZWBcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgKz0gYFxcbmBcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9X291dGBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1fb3V0YCwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyAgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGNvbmRpdGlvbnMgPSBBcnJheS5pc0FycmF5KCBhcmdzWzBdICkgPyBhcmdzWzBdIDogYXJnc1xuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBjb25kaXRpb25zIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonaW4nLFxuXG4gIGdlbigpIHtcbiAgICBnZW4ucGFyYW1ldGVycy5wdXNoKCB0aGlzLm5hbWUgKVxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIHRoaXMubmFtZVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggbmFtZSApID0+IHtcbiAgbGV0IGlucHV0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGlucHV0LmlkICAgPSBnZW4uZ2V0VUlEKClcbiAgaW5wdXQubmFtZSA9IG5hbWUgIT09IHVuZGVmaW5lZCA/IG5hbWUgOiBgJHtpbnB1dC5iYXNlbmFtZX0ke2lucHV0LmlkfWBcbiAgaW5wdXRbMF0gPSB7XG4gICAgZ2VuKCkge1xuICAgICAgaWYoICEgZ2VuLnBhcmFtZXRlcnMuaW5jbHVkZXMoIGlucHV0Lm5hbWUgKSApIGdlbi5wYXJhbWV0ZXJzLnB1c2goIGlucHV0Lm5hbWUgKVxuICAgICAgcmV0dXJuIGlucHV0Lm5hbWUgKyAnWzBdJ1xuICAgIH1cbiAgfVxuICBpbnB1dFsxXSA9IHtcbiAgICBnZW4oKSB7XG4gICAgICBpZiggISBnZW4ucGFyYW1ldGVycy5pbmNsdWRlcyggaW5wdXQubmFtZSApICkgZ2VuLnBhcmFtZXRlcnMucHVzaCggaW5wdXQubmFtZSApXG4gICAgICByZXR1cm4gaW5wdXQubmFtZSArICdbMV0nXG4gICAgfVxuICB9XG5cblxuICByZXR1cm4gaW5wdXRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgbGlicmFyeSA9IHtcbiAgZXhwb3J0KCBkZXN0aW5hdGlvbiApIHtcbiAgICBpZiggZGVzdGluYXRpb24gPT09IHdpbmRvdyApIHtcbiAgICAgIGRlc3RpbmF0aW9uLnNzZCA9IGxpYnJhcnkuaGlzdG9yeSAgICAvLyBoaXN0b3J5IGlzIHdpbmRvdyBvYmplY3QgcHJvcGVydHksIHNvIHVzZSBzc2QgYXMgYWxpYXNcbiAgICAgIGRlc3RpbmF0aW9uLmlucHV0ID0gbGlicmFyeS5pbiAgICAgICAvLyBpbiBpcyBhIGtleXdvcmQgaW4gamF2YXNjcmlwdFxuICAgICAgZGVzdGluYXRpb24udGVybmFyeSA9IGxpYnJhcnkuc3dpdGNoIC8vIHN3aXRjaCBpcyBhIGtleXdvcmQgaW4gamF2YXNjcmlwdFxuXG4gICAgICBkZWxldGUgbGlicmFyeS5oaXN0b3J5XG4gICAgICBkZWxldGUgbGlicmFyeS5pblxuICAgICAgZGVsZXRlIGxpYnJhcnkuc3dpdGNoXG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbiggZGVzdGluYXRpb24sIGxpYnJhcnkgKVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBsaWJyYXJ5LCAnc2FtcGxlcmF0ZScsIHtcbiAgICAgIGdldCgpIHsgcmV0dXJuIGxpYnJhcnkuZ2VuLnNhbXBsZXJhdGUgfSxcbiAgICAgIHNldCh2KSB7fVxuICAgIH0pXG5cbiAgICBsaWJyYXJ5LmluID0gZGVzdGluYXRpb24uaW5wdXRcbiAgICBsaWJyYXJ5Lmhpc3RvcnkgPSBkZXN0aW5hdGlvbi5zc2RcbiAgICBsaWJyYXJ5LnN3aXRjaCA9IGRlc3RpbmF0aW9uLnRlcm5hcnlcblxuICAgIGRlc3RpbmF0aW9uLmNsaXAgPSBsaWJyYXJ5LmNsYW1wXG4gIH0sXG5cbiAgZ2VuOiAgICAgIHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgXG4gIGFiczogICAgICByZXF1aXJlKCAnLi9hYnMuanMnICksXG4gIHJvdW5kOiAgICByZXF1aXJlKCAnLi9yb3VuZC5qcycgKSxcbiAgcGFyYW06ICAgIHJlcXVpcmUoICcuL3BhcmFtLmpzJyApLFxuICBhZGQ6ICAgICAgcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICBzdWI6ICAgICAgcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICBtdWw6ICAgICAgcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICBkaXY6ICAgICAgcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICBhY2N1bTogICAgcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gIGNvdW50ZXI6ICByZXF1aXJlKCAnLi9jb3VudGVyLmpzJyApLFxuICBzaW46ICAgICAgcmVxdWlyZSggJy4vc2luLmpzJyApLFxuICBjb3M6ICAgICAgcmVxdWlyZSggJy4vY29zLmpzJyApLFxuICB0YW46ICAgICAgcmVxdWlyZSggJy4vdGFuLmpzJyApLFxuICB0YW5oOiAgICAgcmVxdWlyZSggJy4vdGFuaC5qcycgKSxcbiAgYXNpbjogICAgIHJlcXVpcmUoICcuL2FzaW4uanMnICksXG4gIGFjb3M6ICAgICByZXF1aXJlKCAnLi9hY29zLmpzJyApLFxuICBhdGFuOiAgICAgcmVxdWlyZSggJy4vYXRhbi5qcycgKSwgIFxuICBwaGFzb3I6ICAgcmVxdWlyZSggJy4vcGhhc29yLmpzJyApLFxuICBkYXRhOiAgICAgcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgcGVlazogICAgIHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gIGN5Y2xlOiAgICByZXF1aXJlKCAnLi9jeWNsZS5qcycgKSxcbiAgaGlzdG9yeTogIHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gIGRlbHRhOiAgICByZXF1aXJlKCAnLi9kZWx0YS5qcycgKSxcbiAgZmxvb3I6ICAgIHJlcXVpcmUoICcuL2Zsb29yLmpzJyApLFxuICBjZWlsOiAgICAgcmVxdWlyZSggJy4vY2VpbC5qcycgKSxcbiAgbWluOiAgICAgIHJlcXVpcmUoICcuL21pbi5qcycgKSxcbiAgbWF4OiAgICAgIHJlcXVpcmUoICcuL21heC5qcycgKSxcbiAgc2lnbjogICAgIHJlcXVpcmUoICcuL3NpZ24uanMnICksXG4gIGRjYmxvY2s6ICByZXF1aXJlKCAnLi9kY2Jsb2NrLmpzJyApLFxuICBtZW1vOiAgICAgcmVxdWlyZSggJy4vbWVtby5qcycgKSxcbiAgcmF0ZTogICAgIHJlcXVpcmUoICcuL3JhdGUuanMnICksXG4gIHdyYXA6ICAgICByZXF1aXJlKCAnLi93cmFwLmpzJyApLFxuICBtaXg6ICAgICAgcmVxdWlyZSggJy4vbWl4LmpzJyApLFxuICBjbGFtcDogICAgcmVxdWlyZSggJy4vY2xhbXAuanMnICksXG4gIHBva2U6ICAgICByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICBkZWxheTogICAgcmVxdWlyZSggJy4vZGVsYXkuanMnICksXG4gIGZvbGQ6ICAgICByZXF1aXJlKCAnLi9mb2xkLmpzJyApLFxuICBtb2QgOiAgICAgcmVxdWlyZSggJy4vbW9kLmpzJyApLFxuICBzYWggOiAgICAgcmVxdWlyZSggJy4vc2FoLmpzJyApLFxuICBub2lzZTogICAgcmVxdWlyZSggJy4vbm9pc2UuanMnICksXG4gIG5vdDogICAgICByZXF1aXJlKCAnLi9ub3QuanMnICksXG4gIGd0OiAgICAgICByZXF1aXJlKCAnLi9ndC5qcycgKSxcbiAgZ3RlOiAgICAgIHJlcXVpcmUoICcuL2d0ZS5qcycgKSxcbiAgbHQ6ICAgICAgIHJlcXVpcmUoICcuL2x0LmpzJyApLCBcbiAgbHRlOiAgICAgIHJlcXVpcmUoICcuL2x0ZS5qcycgKSwgXG4gIGJvb2w6ICAgICByZXF1aXJlKCAnLi9ib29sLmpzJyApLFxuICBnYXRlOiAgICAgcmVxdWlyZSggJy4vZ2F0ZS5qcycgKSxcbiAgdHJhaW46ICAgIHJlcXVpcmUoICcuL3RyYWluLmpzJyApLFxuICBzbGlkZTogICAgcmVxdWlyZSggJy4vc2xpZGUuanMnICksXG4gIGluOiAgICAgICByZXF1aXJlKCAnLi9pbi5qcycgKSxcbiAgdDYwOiAgICAgIHJlcXVpcmUoICcuL3Q2MC5qcycpLFxuICBtdG9mOiAgICAgcmVxdWlyZSggJy4vbXRvZi5qcycpLFxuICBsdHA6ICAgICAgcmVxdWlyZSggJy4vbHRwLmpzJyksICAgICAgICAvLyBUT0RPOiB0ZXN0XG4gIGd0cDogICAgICByZXF1aXJlKCAnLi9ndHAuanMnKSwgICAgICAgIC8vIFRPRE86IHRlc3RcbiAgc3dpdGNoOiAgIHJlcXVpcmUoICcuL3N3aXRjaC5qcycgKSxcbiAgbXN0b3NhbXBzOnJlcXVpcmUoICcuL21zdG9zYW1wcy5qcycgKSwgLy8gVE9ETzogbmVlZHMgdGVzdCxcbiAgc2VsZWN0b3I6IHJlcXVpcmUoICcuL3NlbGVjdG9yLmpzJyApLFxuICB1dGlsaXRpZXM6cmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApLFxuICBwb3c6ICAgICAgcmVxdWlyZSggJy4vcG93LmpzJyApLFxuICBhdHRhY2s6ICAgcmVxdWlyZSggJy4vYXR0YWNrLmpzJyApLFxuICBkZWNheTogICAgcmVxdWlyZSggJy4vZGVjYXkuanMnICksXG4gIHdpbmRvd3M6ICByZXF1aXJlKCAnLi93aW5kb3dzLmpzJyApLFxuICBlbnY6ICAgICAgcmVxdWlyZSggJy4vZW52LmpzJyApLFxuICBhZDogICAgICAgcmVxdWlyZSggJy4vYWQuanMnICApLFxuICBhZHNyOiAgICAgcmVxdWlyZSggJy4vYWRzci5qcycgKSxcbiAgaWZlbHNlOiAgIHJlcXVpcmUoICcuL2lmZWxzZWlmLmpzJyApLFxuICBiYW5nOiAgICAgcmVxdWlyZSggJy4vYmFuZy5qcycgKSxcbiAgYW5kOiAgICAgIHJlcXVpcmUoICcuL2FuZC5qcycgKSxcbiAgcGFuOiAgICAgIHJlcXVpcmUoICcuL3Bhbi5qcycgKSxcbiAgZXE6ICAgICAgIHJlcXVpcmUoICcuL2VxLmpzJyApLFxuICBuZXE6ICAgICAgcmVxdWlyZSggJy4vbmVxLmpzJyApLFxuICBleHA6ICAgICAgcmVxdWlyZSggJy4vZXhwLmpzJyApXG59XG5cbmxpYnJhcnkuZ2VuLmxpYiA9IGxpYnJhcnlcblxubW9kdWxlLmV4cG9ydHMgPSBsaWJyYXJ5XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2x0JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCgoICR7aW5wdXRzWzBdfSA8ICR7aW5wdXRzWzFdfSkgfCAwICApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdIDwgaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGx0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0LmlucHV0cyA9IFsgeCx5IF1cbiAgbHQubmFtZSA9IGx0LmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGx0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbHRlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCggJHtpbnB1dHNbMF19IDw9ICR7aW5wdXRzWzFdfSB8IDAgIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPD0gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGx0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0LmlucHV0cyA9IFsgeCx5IF1cbiAgbHQubmFtZSA9ICdsdGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGx0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbHRwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgPSBgKCR7aW5wdXRzWyAwIF19ICogKCggJHtpbnB1dHNbMF19IDwgJHtpbnB1dHNbMV19ICkgfCAwICkgKWAgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSAqICgoIGlucHV0c1swXSA8IGlucHV0c1sxXSApIHwgMCApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGx0cCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBsdHAuaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBsdHBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidtYXgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGgubWF4IH0pXG5cbiAgICAgIG91dCA9IGBnZW4ubWF4KCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgubWF4KCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBtYXggPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbWF4LmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gbWF4XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbWVtbycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoaW4xLG1lbW9OYW1lKSA9PiB7XG4gIGxldCBtZW1vID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgbWVtby5pbnB1dHMgPSBbIGluMSBdXG4gIG1lbW8uaWQgICA9IGdlbi5nZXRVSUQoKVxuICBtZW1vLm5hbWUgPSBtZW1vTmFtZSAhPT0gdW5kZWZpbmVkID8gbWVtb05hbWUgKyAnXycgKyBnZW4uZ2V0VUlEKCkgOiBgJHttZW1vLmJhc2VuYW1lfSR7bWVtby5pZH1gXG5cbiAgcmV0dXJuIG1lbW9cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidtaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGgubWluIH0pXG5cbiAgICAgIG91dCA9IGBnZW4ubWluKCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgubWluKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBtaW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbWluLmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gbWluXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbz0gcmVxdWlyZSgnLi9tZW1vLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgaW4yLCB0PS41ICkgPT4ge1xuICBsZXQgdWdlbiA9IG1lbW8oIGFkZCggbXVsKGluMSwgc3ViKDEsdCApICksIG11bCggaW4yLCB0ICkgKSApXG4gIHVnZW4ubmFtZSA9ICdtaXgnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICguLi5hcmdzKSA9PiB7XG4gIGxldCBtb2QgPSB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuKCkge1xuICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgICBvdXQ9JygnLFxuICAgICAgICAgIGRpZmYgPSAwLCBcbiAgICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgICAgbGFzdE51bWJlciA9IGlucHV0c1sgMCBdLFxuICAgICAgICAgIGxhc3ROdW1iZXJJc1VnZW4gPSBpc05hTiggbGFzdE51bWJlciApLCBcbiAgICAgICAgICBtb2RBdEVuZCA9IGZhbHNlXG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICAgIGlmKCBpID09PSAwICkgcmV0dXJuXG5cbiAgICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgICAgICBpc0ZpbmFsSWR4ICAgPSBpID09PSBpbnB1dHMubGVuZ3RoIC0gMVxuXG4gICAgICAgIGlmKCAhbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuICkge1xuICAgICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyICUgdlxuICAgICAgICAgIG91dCArPSBsYXN0TnVtYmVyXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIG91dCArPSBgJHtsYXN0TnVtYmVyfSAlICR7dn1gXG4gICAgICAgIH1cblxuICAgICAgICBpZiggIWlzRmluYWxJZHggKSBvdXQgKz0gJyAlICcgXG4gICAgICB9KVxuXG4gICAgICBvdXQgKz0gJyknXG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBtb2Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbXN0b3NhbXBzJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICByZXR1cm5WYWx1ZVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZSB9ID0gJHtnZW4uc2FtcGxlcmF0ZX0gLyAxMDAwICogJHtpbnB1dHNbMF19IFxcblxcbmBcbiAgICAgXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBvdXRcbiAgICAgIFxuICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSwgb3V0IF1cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gZ2VuLnNhbXBsZXJhdGUgLyAxMDAwICogdGhpcy5pbnB1dHNbMF1cblxuICAgICAgcmV0dXJuVmFsdWUgPSBvdXRcbiAgICB9ICAgIFxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IG1zdG9zYW1wcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtc3Rvc2FtcHMuaW5wdXRzID0gWyB4IF1cbiAgbXN0b3NhbXBzLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBtc3Rvc2FtcHNcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidtdG9mJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguZXhwIH0pXG5cbiAgICAgIG91dCA9IGAoICR7dGhpcy50dW5pbmd9ICogZ2VuLmV4cCggLjA1Nzc2MjI2NSAqICgke2lucHV0c1swXX0gLSA2OSkgKSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IHRoaXMudHVuaW5nICogTWF0aC5leHAoIC4wNTc3NjIyNjUgKiAoIGlucHV0c1swXSAtIDY5KSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggeCwgcHJvcHMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyB0dW5pbmc6NDQwIH1cbiAgXG4gIGlmKCBwcm9wcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggcHJvcHMuZGVmYXVsdHMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIGRlZmF1bHRzIClcbiAgdWdlbi5pbnB1dHMgPSBbIHggXVxuICBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxuY29uc3QgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAnbXVsJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAsXG4gICAgICAgIHN1bSA9IDEsIG51bUNvdW50ID0gMCwgbXVsQXRFbmQgPSBmYWxzZSwgYWxyZWFkeUZ1bGxTdW1tZWQgPSB0cnVlXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGlzTmFOKCB2ICkgKSB7XG4gICAgICAgIG91dCArPSB2XG4gICAgICAgIGlmKCBpIDwgaW5wdXRzLmxlbmd0aCAtMSApIHtcbiAgICAgICAgICBtdWxBdEVuZCA9IHRydWVcbiAgICAgICAgICBvdXQgKz0gJyAqICdcbiAgICAgICAgfVxuICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IGZhbHNlXG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYoIGkgPT09IDAgKSB7XG4gICAgICAgICAgc3VtID0gdlxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdW0gKj0gcGFyc2VGbG9hdCggdiApXG4gICAgICAgIH1cbiAgICAgICAgbnVtQ291bnQrK1xuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiggbnVtQ291bnQgPiAwICkge1xuICAgICAgb3V0ICs9IG11bEF0RW5kIHx8IGFscmVhZHlGdWxsU3VtbWVkID8gc3VtIDogJyAqICcgKyBzdW1cbiAgICB9XG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5hcmdzICkgPT4ge1xuICBjb25zdCBtdWwgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBPYmplY3QuYXNzaWduKCBtdWwsIHtcbiAgICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgICAgaW5wdXRzOiBhcmdzLFxuICB9KVxuICBcbiAgbXVsLm5hbWUgPSBtdWwuYmFzZW5hbWUgKyBtdWwuaWRcblxuICByZXR1cm4gbXVsXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiduZXEnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IC8qdGhpcy5pbnB1dHNbMF0gIT09IHRoaXMuaW5wdXRzWzFdID8gMSA6Ki8gYCAgdmFyICR7dGhpcy5uYW1lfSA9ICgke2lucHV0c1swXX0gIT09ICR7aW5wdXRzWzFdfSkgfCAwXFxuXFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0sXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgaW4yICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbm9pc2UnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0XG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ25vaXNlJyA6IE1hdGgucmFuZG9tIH0pXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gZ2VuLm5vaXNlKClcXG5gXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IG5vaXNlID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBub2lzZS5uYW1lID0gcHJvdG8ubmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBub2lzZVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J25vdCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApICkge1xuICAgICAgb3V0ID0gYCggJHtpbnB1dHNbMF19ID09PSAwID8gMSA6IDAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gIWlucHV0c1swXSA9PT0gMCA/IDEgOiAwXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbm90ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG5vdC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBub3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGFuJywgXG4gIGluaXRUYWJsZSgpIHsgICAgXG4gICAgbGV0IGJ1ZmZlckwgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0ICksXG4gICAgICAgIGJ1ZmZlclIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICAgIGNvbnN0IGFuZ1RvUmFkID0gTWF0aC5QSSAvIDE4MFxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgMTAyNDsgaSsrICkgeyBcbiAgICAgIGxldCBwYW4gPSBpICogKCA5MCAvIDEwMjQgKVxuICAgICAgYnVmZmVyTFtpXSA9IE1hdGguY29zKCBwYW4gKiBhbmdUb1JhZCApIFxuICAgICAgYnVmZmVyUltpXSA9IE1hdGguc2luKCBwYW4gKiBhbmdUb1JhZCApXG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMucGFuTCA9IGRhdGEoIGJ1ZmZlckwsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSlcbiAgICBnZW4uZ2xvYmFscy5wYW5SID0gZGF0YSggYnVmZmVyUiwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9KVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGxlZnRJbnB1dCwgcmlnaHRJbnB1dCwgcGFuID0uNSwgcHJvcGVydGllcyApID0+IHtcbiAgaWYoIGdlbi5nbG9iYWxzLnBhbkwgPT09IHVuZGVmaW5lZCApIHByb3RvLmluaXRUYWJsZSgpXG5cbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGxlZnRJbnB1dCwgcmlnaHRJbnB1dCBdLFxuICAgIGxlZnQ6ICAgIG11bCggbGVmdElucHV0LCBwZWVrKCBnZW4uZ2xvYmFscy5wYW5MLCBwYW4sIHsgYm91bmRtb2RlOidjbGFtcCcgfSkgKSxcbiAgICByaWdodDogICBtdWwoIHJpZ2h0SW5wdXQsIHBlZWsoIGdlbi5nbG9iYWxzLnBhblIsIHBhbiwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSApXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3BhcmFtJyxcblxuICBnZW4oKSB7XG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBcbiAgICBnZW4ucGFyYW1zLmFkZCh7IFt0aGlzLm5hbWVdOiB0aGlzIH0pXG5cbiAgICB0aGlzLnZhbHVlID0gdGhpcy5pbml0aWFsVmFsdWVcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWBcblxuICAgIHJldHVybiBnZW4ubWVtb1sgdGhpcy5uYW1lIF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHByb3BOYW1lPTAsIHZhbHVlPTAgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgaWYoIHR5cGVvZiBwcm9wTmFtZSAhPT0gJ3N0cmluZycgKSB7XG4gICAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuICAgIHVnZW4uaW5pdGlhbFZhbHVlID0gcHJvcE5hbWVcbiAgfWVsc2V7XG4gICAgdWdlbi5uYW1lID0gcHJvcE5hbWVcbiAgICB1Z2VuLmluaXRpYWxWYWx1ZSA9IHZhbHVlXG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgICAgZGF0YVVnZW4gPSByZXF1aXJlKCcuL2RhdGEuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwZWVrJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0LCBmdW5jdGlvbkJvZHksIG5leHQsIGxlbmd0aElzTG9nMiwgaWR4XG4gICAgXG4gICAgaWR4ID0gaW5wdXRzWzFdXG4gICAgbGVuZ3RoSXNMb2cyID0gKE1hdGgubG9nMiggdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKSB8IDApICA9PT0gTWF0aC5sb2cyKCB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCApXG5cbiAgICBpZiggdGhpcy5tb2RlICE9PSAnc2ltcGxlJyApIHtcblxuICAgIGZ1bmN0aW9uQm9keSA9IGAgIHZhciAke3RoaXMubmFtZX1fZGF0YUlkeCAgPSAke2lkeH0sIFxuICAgICAgJHt0aGlzLm5hbWV9X3BoYXNlID0gJHt0aGlzLm1vZGUgPT09ICdzYW1wbGVzJyA/IGlucHV0c1swXSA6IGlucHV0c1swXSArICcgKiAnICsgKHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMSkgfSwgXG4gICAgICAke3RoaXMubmFtZX1faW5kZXggPSAke3RoaXMubmFtZX1fcGhhc2UgfCAwLFxcbmBcblxuICAgIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ3dyYXAnICkge1xuICAgICAgbmV4dCA9IGxlbmd0aElzTG9nMiA/XG4gICAgICBgKCAke3RoaXMubmFtZX1faW5kZXggKyAxICkgJiAoJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aH0gLSAxKWAgOlxuICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDEgPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aH0gPyAke3RoaXMubmFtZX1faW5kZXggKyAxIC0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aH0gOiAke3RoaXMubmFtZX1faW5kZXggKyAxYFxuICAgIH1lbHNlIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2NsYW1wJyApIHtcbiAgICAgIG5leHQgPSBcbiAgICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDEgPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9ID8gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9IGVsc2UgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnZm9sZCcgfHwgdGhpcy5ib3VuZG1vZGUgPT09ICdtaXJyb3InICkge1xuICAgICAgbmV4dCA9IFxuICAgICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMSA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gPyAke3RoaXMubmFtZX1faW5kZXggLSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gOiAke3RoaXMubmFtZX1faW5kZXggKyAxYFxuICAgIH1lbHNle1xuICAgICAgIG5leHQgPSBcbiAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxYCAgICAgXG4gICAgfVxuXG4gICAgaWYoIHRoaXMuaW50ZXJwID09PSAnbGluZWFyJyApIHsgICAgICBcbiAgICBmdW5jdGlvbkJvZHkgKz0gYCAgICAgICR7dGhpcy5uYW1lfV9mcmFjICA9ICR7dGhpcy5uYW1lfV9waGFzZSAtICR7dGhpcy5uYW1lfV9pbmRleCxcbiAgICAgICR7dGhpcy5uYW1lfV9iYXNlICA9IG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAgJHt0aGlzLm5hbWV9X2luZGV4IF0sXG4gICAgICAke3RoaXMubmFtZX1fbmV4dCAgPSAke25leHR9LGBcbiAgICAgIFxuICAgICAgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnaWdub3JlJyApIHtcbiAgICAgICAgZnVuY3Rpb25Cb2R5ICs9IGBcbiAgICAgICR7dGhpcy5uYW1lfV9vdXQgICA9ICR7dGhpcy5uYW1lfV9pbmRleCA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gfHwgJHt0aGlzLm5hbWV9X2luZGV4IDwgMCA/IDAgOiAke3RoaXMubmFtZX1fYmFzZSArICR7dGhpcy5uYW1lfV9mcmFjICogKCBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X25leHQgXSAtICR7dGhpcy5uYW1lfV9iYXNlIClcXG5cXG5gXG4gICAgICB9ZWxzZXtcbiAgICAgICAgZnVuY3Rpb25Cb2R5ICs9IGBcbiAgICAgICR7dGhpcy5uYW1lfV9vdXQgICA9ICR7dGhpcy5uYW1lfV9iYXNlICsgJHt0aGlzLm5hbWV9X2ZyYWMgKiAoIG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAke3RoaXMubmFtZX1fbmV4dCBdIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKVxcblxcbmBcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGZ1bmN0aW9uQm9keSArPSBgICAgICAgJHt0aGlzLm5hbWV9X291dCA9IG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAke3RoaXMubmFtZX1faW5kZXggXVxcblxcbmBcbiAgICB9XG5cbiAgICB9IGVsc2UgeyAvLyBtb2RlIGlzIHNpbXBsZVxuICAgICAgZnVuY3Rpb25Cb2R5ID0gYG1lbW9yeVsgJHtpZHh9ICsgJHsgaW5wdXRzWzBdIH0gXWBcbiAgICAgIFxuICAgICAgcmV0dXJuIGZ1bmN0aW9uQm9keVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfb3V0J1xuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lKydfb3V0JywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBkZWZhdWx0cyA6IHsgY2hhbm5lbHM6MSwgbW9kZToncGhhc2UnLCBpbnRlcnA6J2xpbmVhcicsIGJvdW5kbW9kZTond3JhcCcgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5wdXRfZGF0YSwgaW5kZXg9MCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgLy9jb25zb2xlLmxvZyggZGF0YVVnZW4sIGdlbi5kYXRhIClcblxuICAvLyBYWFggd2h5IGlzIGRhdGFVZ2VuIG5vdCB0aGUgYWN0dWFsIGZ1bmN0aW9uPyBzb21lIHR5cGUgb2YgYnJvd3NlcmlmeSBub25zZW5zZS4uLlxuICBjb25zdCBmaW5hbERhdGEgPSB0eXBlb2YgaW5wdXRfZGF0YS5iYXNlbmFtZSA9PT0gJ3VuZGVmaW5lZCcgPyBnZW4ubGliLmRhdGEoIGlucHV0X2RhdGEgKSA6IGlucHV0X2RhdGFcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBcbiAgICB7IFxuICAgICAgJ2RhdGEnOiAgICAgZmluYWxEYXRhLFxuICAgICAgZGF0YU5hbWU6ICAgZmluYWxEYXRhLm5hbWUsXG4gICAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgICBpbnB1dHM6ICAgICBbIGluZGV4LCBmaW5hbERhdGEgXSxcbiAgICB9LFxuICAgIHByb3RvLmRlZmF1bHRzLFxuICAgIHByb3BlcnRpZXMgXG4gIClcbiAgXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgbXVsICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgcHJvdG8gPSB7IGJhc2VuYW1lOidwaGFzb3InIH0sXG4gICAgZGl2ICAgPSByZXF1aXJlKCAnLi9kaXYuanMnIClcblxuY29uc3QgZGVmYXVsdHMgPSB7IG1pbjogLTEsIG1heDogMSB9XG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3kgPSAxLCByZXNldCA9IDAsIF9wcm9wcyApID0+IHtcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgZGVmYXVsdHMsIF9wcm9wcyApXG5cbiAgY29uc3QgcmFuZ2UgPSBwcm9wcy5tYXggLSBwcm9wcy5taW5cblxuICBjb25zdCB1Z2VuID0gdHlwZW9mIGZyZXF1ZW5jeSA9PT0gJ251bWJlcicgXG4gICAgPyBhY2N1bSggKGZyZXF1ZW5jeSAqIHJhbmdlKSAvIGdlbi5zYW1wbGVyYXRlLCByZXNldCwgcHJvcHMgKSBcbiAgICA6IGFjY3VtKCBcbiAgICAgICAgZGl2KCBcbiAgICAgICAgICBtdWwoIGZyZXF1ZW5jeSwgcmFuZ2UgKSxcbiAgICAgICAgICBnZW4uc2FtcGxlcmF0ZVxuICAgICAgICApLCBcbiAgICAgICAgcmVzZXQsIHByb3BzIFxuICAgIClcblxuICB1Z2VuLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIG11bCAgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHdyYXAgPSByZXF1aXJlKCcuL3dyYXAuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwb2tlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGRhdGFOYW1lID0gJ21lbW9yeScsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgaWR4LCBvdXQsIHdyYXBwZWRcbiAgICBcbiAgICBpZHggPSB0aGlzLmRhdGEuZ2VuKClcblxuICAgIC8vZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICAvL3dyYXBwZWQgPSB3cmFwKCB0aGlzLmlucHV0c1sxXSwgMCwgdGhpcy5kYXRhTGVuZ3RoICkuZ2VuKClcbiAgICAvL2lkeCA9IHdyYXBwZWRbMF1cbiAgICAvL2dlbi5mdW5jdGlvbkJvZHkgKz0gd3JhcHBlZFsxXVxuICAgIGxldCBvdXRwdXRTdHIgPSB0aGlzLmlucHV0c1sxXSA9PT0gMCA/XG4gICAgICBgICAke2RhdGFOYW1lfVsgJHtpZHh9IF0gPSAke2lucHV0c1swXX1cXG5gIDpcbiAgICAgIGAgICR7ZGF0YU5hbWV9WyAke2lkeH0gKyAke2lucHV0c1sxXX0gXSA9ICR7aW5wdXRzWzBdfVxcbmBcblxuICAgIGlmKCB0aGlzLmlubGluZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgZ2VuLmZ1bmN0aW9uQm9keSArPSBvdXRwdXRTdHJcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBbIHRoaXMuaW5saW5lLCBvdXRwdXRTdHIgXVxuICAgIH1cbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSAoIGRhdGEsIHZhbHVlLCBpbmRleCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGNoYW5uZWxzOjEgfSBcblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgZGF0YSxcbiAgICBkYXRhTmFtZTogICBkYXRhLm5hbWUsXG4gICAgZGF0YUxlbmd0aDogZGF0YS5idWZmZXIubGVuZ3RoLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIHZhbHVlLCBpbmRleCBdLFxuICB9LFxuICBkZWZhdWx0cyApXG5cblxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcbiAgXG4gIGdlbi5oaXN0b3JpZXMuc2V0KCB1Z2VuLm5hbWUsIHVnZW4gKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BvdycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdwb3cnOiBNYXRoLnBvdyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnBvdyggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIHR5cGVvZiBpbnB1dHNbMF0gPT09ICdzdHJpbmcnICYmIGlucHV0c1swXVswXSA9PT0gJygnICkge1xuICAgICAgICBpbnB1dHNbMF0gPSBpbnB1dHNbMF0uc2xpY2UoMSwtMSlcbiAgICAgIH1cbiAgICAgIGlmKCB0eXBlb2YgaW5wdXRzWzFdID09PSAnc3RyaW5nJyAmJiBpbnB1dHNbMV1bMF0gPT09ICcoJyApIHtcbiAgICAgICAgaW5wdXRzWzFdID0gaW5wdXRzWzFdLnNsaWNlKDEsLTEpXG4gICAgICB9XG5cbiAgICAgIG91dCA9IE1hdGgucG93KCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IHBvdyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBwb3cuaW5wdXRzID0gWyB4LHkgXVxuICBwb3cuaWQgPSBnZW4uZ2V0VUlEKClcbiAgcG93Lm5hbWUgPSBgJHtwb3cuYmFzZW5hbWV9e3Bvdy5pZH1gXG5cbiAgcmV0dXJuIHBvd1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGRlbHRhICAgPSByZXF1aXJlKCAnLi9kZWx0YS5qcycgKSxcbiAgICB3cmFwICAgID0gcmVxdWlyZSggJy4vd3JhcC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidyYXRlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcGhhc2UgID0gaGlzdG9yeSgpLFxuICAgICAgICBpbk1pbnVzMSA9IGhpc3RvcnkoKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZmlsdGVyLCBzdW0sIG91dFxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9kaWZmID0gJHtpbnB1dHNbMF19IC0gJHtnZW5OYW1lfS5sYXN0U2FtcGxlXG4gIGlmKCAke3RoaXMubmFtZX1fZGlmZiA8IC0uNSApICR7dGhpcy5uYW1lfV9kaWZmICs9IDFcbiAgJHtnZW5OYW1lfS5waGFzZSArPSAke3RoaXMubmFtZX1fZGlmZiAqICR7aW5wdXRzWzFdfVxuICBpZiggJHtnZW5OYW1lfS5waGFzZSA+IDEgKSAke2dlbk5hbWV9LnBoYXNlIC09IDFcbiAgJHtnZW5OYW1lfS5sYXN0U2FtcGxlID0gJHtpbnB1dHNbMF19XG5gXG4gICAgb3V0ID0gJyAnICsgb3V0XG5cbiAgICByZXR1cm4gWyBnZW5OYW1lICsgJy5waGFzZScsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgcmF0ZSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBwaGFzZTogICAgICAwLFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xLCByYXRlIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZToncm91bmQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5yb3VuZCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnJvdW5kKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnJvdW5kKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgcm91bmQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgcm91bmQuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gcm91bmRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzYWgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSBdID0gMFxuICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSArICdfY29udHJvbCcgXSA9IDBcblxuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG5cblxuICAgIG91dCA9IFxuYCB2YXIgJHt0aGlzLm5hbWV9X2NvbnRyb2wgPSBtZW1vcnlbJHt0aGlzLm1lbW9yeS5jb250cm9sLmlkeH1dLFxuICAgICAgJHt0aGlzLm5hbWV9X3RyaWdnZXIgPSAke2lucHV0c1sxXX0gPiAke2lucHV0c1syXX0gPyAxIDogMFxuXG4gIGlmKCAke3RoaXMubmFtZX1fdHJpZ2dlciAhPT0gJHt0aGlzLm5hbWV9X2NvbnRyb2wgICkge1xuICAgIGlmKCAke3RoaXMubmFtZX1fdHJpZ2dlciA9PT0gMSApIFxuICAgICAgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV0gPSAke2lucHV0c1swXX1cbiAgICBcbiAgICBtZW1vcnlbJHt0aGlzLm1lbW9yeS5jb250cm9sLmlkeH1dID0gJHt0aGlzLm5hbWV9X3RyaWdnZXJcbiAgfVxuYFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gLCAnICcgK291dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgY29udHJvbCwgdGhyZXNob2xkPTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBpbml0OjAgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBsYXN0U2FtcGxlOiAwLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSwgY29udHJvbCx0aHJlc2hvbGQgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIGNvbnRyb2w6IHsgaWR4Om51bGwsIGxlbmd0aDoxIH0sXG4gICAgICB2YWx1ZTogICB7IGlkeDpudWxsLCBsZW5ndGg6MSB9LFxuICAgIH1cbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc2VsZWN0b3InLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXQsIHJldHVyblZhbHVlID0gMFxuICAgIFxuICAgIHN3aXRjaCggaW5wdXRzLmxlbmd0aCApIHtcbiAgICAgIGNhc2UgMiA6XG4gICAgICAgIHJldHVyblZhbHVlID0gaW5wdXRzWzFdXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzIDpcbiAgICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAke2lucHV0c1swXX0gPT09IDEgPyAke2lucHV0c1sxXX0gOiAke2lucHV0c1syXX1cXG5cXG5gO1xuICAgICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lICsgJ19vdXQnLCBvdXQgXVxuICAgICAgICBicmVhazsgIFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgb3V0ID0gXG5gIHZhciAke3RoaXMubmFtZX1fb3V0ID0gMFxuICBzd2l0Y2goICR7aW5wdXRzWzBdfSArIDEgKSB7XFxuYFxuXG4gICAgICAgIGZvciggbGV0IGkgPSAxOyBpIDwgaW5wdXRzLmxlbmd0aDsgaSsrICl7XG4gICAgICAgICAgb3V0ICs9YCAgICBjYXNlICR7aX06ICR7dGhpcy5uYW1lfV9vdXQgPSAke2lucHV0c1tpXX07IGJyZWFrO1xcbmAgXG4gICAgICAgIH1cblxuICAgICAgICBvdXQgKz0gJyAgfVxcblxcbidcbiAgICAgICAgXG4gICAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUgKyAnX291dCcsICcgJyArIG91dCBdXG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ19vdXQnXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmlucHV0cyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0c1xuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J3NpZ24nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5zaWduIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uc2lnbiggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5zaWduKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2lnbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBzaWduLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIHNpZ25cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc2luJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnc2luJzogTWF0aC5zaW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5zaW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHNpbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBzaW4uaW5wdXRzID0gWyB4IF1cbiAgc2luLmlkID0gZ2VuLmdldFVJRCgpXG4gIHNpbi5uYW1lID0gYCR7c2luLmJhc2VuYW1lfXtzaW4uaWR9YFxuXG4gIHJldHVybiBzaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKSxcbiAgICBndCAgICAgID0gcmVxdWlyZSggJy4vZ3QuanMnICksXG4gICAgZGl2ICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgICBfc3dpdGNoID0gcmVxdWlyZSggJy4vc3dpdGNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIHNsaWRlVXAgPSAxLCBzbGlkZURvd24gPSAxICkgPT4ge1xuICBsZXQgeTEgPSBoaXN0b3J5KDApLFxuICAgICAgZmlsdGVyLCBzbGlkZUFtb3VudFxuXG4gIC8veSAobikgPSB5IChuLTEpICsgKCh4IChuKSAtIHkgKG4tMSkpL3NsaWRlKSBcbiAgc2xpZGVBbW91bnQgPSBfc3dpdGNoKCBndChpbjEseTEub3V0KSwgc2xpZGVVcCwgc2xpZGVEb3duIClcblxuICBmaWx0ZXIgPSBtZW1vKCBhZGQoIHkxLm91dCwgZGl2KCBzdWIoIGluMSwgeTEub3V0ICksIHNsaWRlQW1vdW50ICkgKSApXG5cbiAgeTEuaW4oIGZpbHRlciApXG5cbiAgcmV0dXJuIGZpbHRlclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxuY29uc3QgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzdWInLFxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0PTAsXG4gICAgICAgIGRpZmYgPSAwLFxuICAgICAgICBuZWVkc1BhcmVucyA9IGZhbHNlLCBcbiAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgIGxhc3ROdW1iZXJJc1VnZW4gPSBpc05hTiggbGFzdE51bWJlciApLCBcbiAgICAgICAgc3ViQXRFbmQgPSBmYWxzZSxcbiAgICAgICAgaGFzVWdlbnMgPSBmYWxzZSxcbiAgICAgICAgcmV0dXJuVmFsdWUgPSAwXG5cbiAgICB0aGlzLmlucHV0cy5mb3JFYWNoKCB2YWx1ZSA9PiB7IGlmKCBpc05hTiggdmFsdWUgKSApIGhhc1VnZW5zID0gdHJ1ZSB9KVxuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJ1xuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpID09PSAwICkgcmV0dXJuXG5cbiAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgIGlmKCAhbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuICkge1xuICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAtIHZcbiAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgICAgcmV0dXJuXG4gICAgICB9ZWxzZXtcbiAgICAgICAgbmVlZHNQYXJlbnMgPSB0cnVlXG4gICAgICAgIG91dCArPSBgJHtsYXN0TnVtYmVyfSAtICR7dn1gXG4gICAgICB9XG5cbiAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnIC0gJyBcbiAgICB9KVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5hcmdzICkgPT4ge1xuICBsZXQgc3ViID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHN1Yiwge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJnc1xuICB9KVxuICAgICAgIFxuICBzdWIubmFtZSA9ICdzdWInICsgc3ViLmlkXG5cbiAgcmV0dXJuIHN1YlxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc3dpdGNoJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBpZiggaW5wdXRzWzFdID09PSBpbnB1dHNbMl0gKSByZXR1cm4gaW5wdXRzWzFdIC8vIGlmIGJvdGggcG90ZW50aWFsIG91dHB1dHMgYXJlIHRoZSBzYW1lIGp1c3QgcmV0dXJuIG9uZSBvZiB0aGVtXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAke2lucHV0c1swXX0gPT09IDEgPyAke2lucHV0c1sxXX0gOiAke2lucHV0c1syXX1cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9X291dGBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1fb3V0YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggY29udHJvbCwgaW4xID0gMSwgaW4yID0gMCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBjb250cm9sLCBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid0NjAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHJldHVyblZhbHVlXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgJ2V4cCcgXTogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGdlbi5leHAoIC02LjkwNzc1NTI3ODkyMSAvICR7aW5wdXRzWzBdfSApXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gaW5wdXRzWzBdIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBvdXRcbiAgICB9ICAgIFxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHQ2MCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0NjAuaW5wdXRzID0gWyB4IF1cbiAgdDYwLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB0NjBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAndGFuJzogTWF0aC50YW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi50YW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnRhbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHRhbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0YW4uaW5wdXRzID0gWyB4IF1cbiAgdGFuLmlkID0gZ2VuLmdldFVJRCgpXG4gIHRhbi5uYW1lID0gYCR7dGFuLmJhc2VuYW1lfXt0YW4uaWR9YFxuXG4gIHJldHVybiB0YW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondGFuaCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3RhbmgnOiBNYXRoLnRhbmggfSlcblxuICAgICAgb3V0ID0gYGdlbi50YW5oKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW5oKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgdGFuaCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0YW5oLmlucHV0cyA9IFsgeCBdXG4gIHRhbmguaWQgPSBnZW4uZ2V0VUlEKClcbiAgdGFuaC5uYW1lID0gYCR7dGFuaC5iYXNlbmFtZX17dGFuaC5pZH1gXG5cbiAgcmV0dXJuIHRhbmhcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBsdCAgICAgID0gcmVxdWlyZSggJy4vbHQuanMnICksXG4gICAgYWNjdW0gICA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGRpdiAgICAgPSByZXF1aXJlKCAnLi9kaXYuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeT00NDAsIHB1bHNld2lkdGg9LjUgKSA9PiB7XG4gIGxldCBncmFwaCA9IGx0KCBhY2N1bSggZGl2KCBmcmVxdWVuY3ksIDQ0MTAwICkgKSwgcHVsc2V3aWR0aCApXG5cbiAgZ3JhcGgubmFtZSA9IGB0cmFpbiR7Z2VuLmdldFVJRCgpfWBcblxuICByZXR1cm4gZ3JhcGhcbn1cblxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnIClcblxubGV0IGlzU3RlcmVvID0gZmFsc2VcblxubGV0IHV0aWxpdGllcyA9IHtcbiAgY3R4OiBudWxsLFxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuY2FsbGJhY2sgPSAoKSA9PiAwXG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MuZm9yRWFjaCggdiA9PiB2KCkgKVxuICAgIHRoaXMuY2xlYXIuY2FsbGJhY2tzLmxlbmd0aCA9IDBcbiAgfSxcblxuICBjcmVhdGVDb250ZXh0KCkge1xuICAgIGxldCBBQyA9IHR5cGVvZiBBdWRpb0NvbnRleHQgPT09ICd1bmRlZmluZWQnID8gd2Via2l0QXVkaW9Db250ZXh0IDogQXVkaW9Db250ZXh0XG4gICAgdGhpcy5jdHggPSBuZXcgQUMoKVxuXG4gICAgZ2VuLnNhbXBsZXJhdGUgPSB0aGlzLmN0eC5zYW1wbGVSYXRlXG5cbiAgICBsZXQgc3RhcnQgPSAoKSA9PiB7XG4gICAgICBpZiggdHlwZW9mIEFDICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuXG4gICAgICAgICAgaWYoICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHsgLy8gcmVxdWlyZWQgdG8gc3RhcnQgYXVkaW8gdW5kZXIgaU9TIDZcbiAgICAgICAgICAgICBsZXQgbXlTb3VyY2UgPSB1dGlsaXRpZXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICAgICAgICAgbXlTb3VyY2UuY29ubmVjdCggdXRpbGl0aWVzLmN0eC5kZXN0aW5hdGlvbiApXG4gICAgICAgICAgICAgbXlTb3VyY2Uubm90ZU9uKCAwIClcbiAgICAgICAgICAgfVxuICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH0sXG5cbiAgY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCkge1xuICAgIHRoaXMubm9kZSA9IHRoaXMuY3R4LmNyZWF0ZVNjcmlwdFByb2Nlc3NvciggMTAyNCwgMCwgMiApXG4gICAgdGhpcy5jbGVhckZ1bmN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiAwIH1cbiAgICBpZiggdHlwZW9mIHRoaXMuY2FsbGJhY2sgPT09ICd1bmRlZmluZWQnICkgdGhpcy5jYWxsYmFjayA9IHRoaXMuY2xlYXJGdW5jdGlvblxuXG4gICAgdGhpcy5ub2RlLm9uYXVkaW9wcm9jZXNzID0gZnVuY3Rpb24oIGF1ZGlvUHJvY2Vzc2luZ0V2ZW50ICkge1xuICAgICAgdmFyIG91dHB1dEJ1ZmZlciA9IGF1ZGlvUHJvY2Vzc2luZ0V2ZW50Lm91dHB1dEJ1ZmZlcjtcblxuICAgICAgdmFyIGxlZnQgPSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDAgKSxcbiAgICAgICAgICByaWdodD0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAxICksXG4gICAgICAgICAgaXNTdGVyZW8gPSB1dGlsaXRpZXMuaXNTdGVyZW9cblxuICAgICBmb3IoIHZhciBzYW1wbGUgPSAwOyBzYW1wbGUgPCBsZWZ0Lmxlbmd0aDsgc2FtcGxlKysgKSB7XG4gICAgICAgIHZhciBvdXQgPSB1dGlsaXRpZXMuY2FsbGJhY2soKVxuXG4gICAgICAgIGlmKCBpc1N0ZXJlbyA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgbGVmdFsgc2FtcGxlIF0gPSByaWdodFsgc2FtcGxlIF0gPSBvdXQgXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGxlZnRbIHNhbXBsZSAgXSA9IG91dFswXVxuICAgICAgICAgIHJpZ2h0WyBzYW1wbGUgXSA9IG91dFsxXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ub2RlLmNvbm5lY3QoIHRoaXMuY3R4LmRlc3RpbmF0aW9uIClcblxuICAgIHJldHVybiB0aGlzXG4gIH0sXG4gIFxuICBwbGF5R3JhcGgoIGdyYXBoLCBkZWJ1ZywgbWVtPTQ0MTAwKjEwLCBtZW1UeXBlPUZsb2F0MzJBcnJheSApIHtcbiAgICB1dGlsaXRpZXMuY2xlYXIoKVxuICAgIGlmKCBkZWJ1ZyA9PT0gdW5kZWZpbmVkICkgZGVidWcgPSBmYWxzZVxuICAgICAgICAgIFxuICAgIHRoaXMuaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KCBncmFwaCApXG5cbiAgICB1dGlsaXRpZXMuY2FsbGJhY2sgPSBnZW4uY3JlYXRlQ2FsbGJhY2soIGdyYXBoLCBtZW0sIGRlYnVnLCBmYWxzZSwgbWVtVHlwZSApXG4gICAgXG4gICAgaWYoIHV0aWxpdGllcy5jb25zb2xlICkgdXRpbGl0aWVzLmNvbnNvbGUuc2V0VmFsdWUoIHV0aWxpdGllcy5jYWxsYmFjay50b1N0cmluZygpIClcblxuICAgIHJldHVybiB1dGlsaXRpZXMuY2FsbGJhY2tcbiAgfSxcblxuICBsb2FkU2FtcGxlKCBzb3VuZEZpbGVQYXRoLCBkYXRhICkge1xuICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIHJlcS5vcGVuKCAnR0VUJywgc291bmRGaWxlUGF0aCwgdHJ1ZSApXG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcicgXG4gICAgXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUscmVqZWN0KSA9PiB7XG4gICAgICByZXEub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhdWRpb0RhdGEgPSByZXEucmVzcG9uc2VcblxuICAgICAgICB1dGlsaXRpZXMuY3R4LmRlY29kZUF1ZGlvRGF0YSggYXVkaW9EYXRhLCAoYnVmZmVyKSA9PiB7XG4gICAgICAgICAgZGF0YS5idWZmZXIgPSBidWZmZXIuZ2V0Q2hhbm5lbERhdGEoMClcbiAgICAgICAgICByZXNvbHZlKCBkYXRhLmJ1ZmZlciApXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJlcS5zZW5kKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxufVxuXG51dGlsaXRpZXMuY2xlYXIuY2FsbGJhY2tzID0gW11cblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsaXRpZXNcbiIsIid1c2Ugc3RyaWN0J1xuXG4vKlxuICogbWFueSB3aW5kb3dzIGhlcmUgYWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9jb3JiYW5icm9vay9kc3AuanMvYmxvYi9tYXN0ZXIvZHNwLmpzXG4gKiBzdGFydGluZyBhdCBsaW5lIDE0MjdcbiAqIHRha2VuIDgvMTUvMTZcbiovIFxuXG5jb25zdCB3aW5kb3dzID0gbW9kdWxlLmV4cG9ydHMgPSB7IFxuICBiYXJ0bGV0dCggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMiAvIChsZW5ndGggLSAxKSAqICgobGVuZ3RoIC0gMSkgLyAyIC0gTWF0aC5hYnMoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSkgXG4gIH0sXG5cbiAgYmFydGxldHRIYW5uKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjYyIC0gMC40OCAqIE1hdGguYWJzKGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMC41KSAtIDAuMzggKiBNYXRoLmNvcyggMiAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBibGFja21hbiggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgbGV0IGEwID0gKDEgLSBhbHBoYSkgLyAyLFxuICAgICAgICBhMSA9IDAuNSxcbiAgICAgICAgYTIgPSBhbHBoYSAvIDJcblxuICAgIHJldHVybiBhMCAtIGExICogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSkgKyBhMiAqIE1hdGguY29zKDQgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgY29zaW5lKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiBNYXRoLmNvcyhNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSBNYXRoLlBJIC8gMilcbiAgfSxcblxuICBnYXVzcyggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KE1hdGguRSwgLTAuNSAqIE1hdGgucG93KChpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpIC8gKGFscGhhICogKGxlbmd0aCAtIDEpIC8gMiksIDIpKVxuICB9LFxuXG4gIGhhbW1pbmcoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNTQgLSAwLjQ2ICogTWF0aC5jb3MoIE1hdGguUEkgKiAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgaGFubiggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyggTWF0aC5QSSAqIDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSkgKVxuICB9LFxuXG4gIGxhbmN6b3MoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgbGV0IHggPSAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSAxO1xuICAgIHJldHVybiBNYXRoLnNpbihNYXRoLlBJICogeCkgLyAoTWF0aC5QSSAqIHgpXG4gIH0sXG5cbiAgcmVjdGFuZ3VsYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDFcbiAgfSxcblxuICB0cmlhbmd1bGFyKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAyIC8gbGVuZ3RoICogKGxlbmd0aCAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKVxuICB9LFxuXG4gIC8vIHBhcmFib2xhXG4gIHdlbGNoKCBsZW5ndGgsIF9pbmRleCwgaWdub3JlLCBzaGlmdD0wICkge1xuICAgIC8vd1tuXSA9IDEgLSBNYXRoLnBvdyggKCBuIC0gKCAoTi0xKSAvIDIgKSApIC8gKCggTi0xICkgLyAyICksIDIgKVxuICAgIGNvbnN0IGluZGV4ID0gc2hpZnQgPT09IDAgPyBfaW5kZXggOiAoX2luZGV4ICsgTWF0aC5mbG9vciggc2hpZnQgKiBsZW5ndGggKSkgJSBsZW5ndGhcbiAgICBjb25zdCBuXzFfb3ZlcjIgPSAobGVuZ3RoIC0gMSkgLyAyIFxuXG4gICAgcmV0dXJuIDEgLSBNYXRoLnBvdyggKCBpbmRleCAtIG5fMV9vdmVyMiApIC8gbl8xX292ZXIyLCAyIClcbiAgfSxcbiAgaW52ZXJzZXdlbGNoKCBsZW5ndGgsIF9pbmRleCwgaWdub3JlLCBzaGlmdD0wICkge1xuICAgIC8vd1tuXSA9IDEgLSBNYXRoLnBvdyggKCBuIC0gKCAoTi0xKSAvIDIgKSApIC8gKCggTi0xICkgLyAyICksIDIgKVxuICAgIGxldCBpbmRleCA9IHNoaWZ0ID09PSAwID8gX2luZGV4IDogKF9pbmRleCArIE1hdGguZmxvb3IoIHNoaWZ0ICogbGVuZ3RoICkpICUgbGVuZ3RoXG4gICAgY29uc3Qgbl8xX292ZXIyID0gKGxlbmd0aCAtIDEpIC8gMlxuXG4gICAgcmV0dXJuIE1hdGgucG93KCAoIGluZGV4IC0gbl8xX292ZXIyICkgLyBuXzFfb3ZlcjIsIDIgKVxuICB9LFxuXG4gIHBhcmFib2xhKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIGlmKCBpbmRleCA8PSBsZW5ndGggLyAyICkge1xuICAgICAgcmV0dXJuIHdpbmRvd3MuaW52ZXJzZXdlbGNoKCBsZW5ndGggLyAyLCBpbmRleCApIC0gMVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIDEgLSB3aW5kb3dzLmludmVyc2V3ZWxjaCggbGVuZ3RoIC8gMiwgaW5kZXggLSBsZW5ndGggLyAyIClcbiAgICB9XG4gIH0sXG5cbiAgZXhwb25lbnRpYWwoIGxlbmd0aCwgaW5kZXgsIGFscGhhICkge1xuICAgIHJldHVybiBNYXRoLnBvdyggaW5kZXggLyBsZW5ndGgsIGFscGhhIClcbiAgfSxcblxuICBsaW5lYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIGluZGV4IC8gbGVuZ3RoXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZmxvb3I9IHJlcXVpcmUoJy4vZmxvb3IuanMnKSxcbiAgICBzdWIgID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTond3JhcCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHNpZ25hbCA9IGlucHV0c1swXSwgbWluID0gaW5wdXRzWzFdLCBtYXggPSBpbnB1dHNbMl0sXG4gICAgICAgIG91dCwgZGlmZlxuXG4gICAgLy9vdXQgPSBgKCgoJHtpbnB1dHNbMF19IC0gJHt0aGlzLm1pbn0pICUgJHtkaWZmfSAgKyAke2RpZmZ9KSAlICR7ZGlmZn0gKyAke3RoaXMubWlufSlgXG4gICAgLy9jb25zdCBsb25nIG51bVdyYXBzID0gbG9uZygodi1sbykvcmFuZ2UpIC0gKHYgPCBsbyk7XG4gICAgLy9yZXR1cm4gdiAtIHJhbmdlICogZG91YmxlKG51bVdyYXBzKTsgICBcbiAgICBcbiAgICBpZiggdGhpcy5taW4gPT09IDAgKSB7XG4gICAgICBkaWZmID0gbWF4XG4gICAgfWVsc2UgaWYgKCBpc05hTiggbWF4ICkgfHwgaXNOYU4oIG1pbiApICkge1xuICAgICAgZGlmZiA9IGAke21heH0gLSAke21pbn1gXG4gICAgfWVsc2V7XG4gICAgICBkaWZmID0gbWF4IC0gbWluXG4gICAgfVxuXG4gICAgb3V0ID1cbmAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9IDwgJHt0aGlzLm1pbn0gKSAke3RoaXMubmFtZX0gKz0gJHtkaWZmfVxuICBlbHNlIGlmKCAke3RoaXMubmFtZX0gPiAke3RoaXMubWF4fSApICR7dGhpcy5uYW1lfSAtPSAke2RpZmZ9XG5cbmBcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgJyAnICsgb3V0IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCJsZXQgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApXG5cbmxldCBhbmFseXplciA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG5PYmplY3QuYXNzaWduKCBhbmFseXplciwge1xuICBfX3R5cGVfXzogJ2FuYWx5emVyJyxcbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gYW5hbHl6ZXJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBhbmFseXplcnMgPSB7XG4gICAgU1NEOiAgICByZXF1aXJlKCAnLi9zaW5nbGVzYW1wbGVkZWxheS5qcycgICkoIEdpYmJlcmlzaCApLFxuICAgIEZvbGxvdzogcmVxdWlyZSggJy4vZm9sbG93LmpzJyAgKSggR2liYmVyaXNoIClcbiAgfVxuXG4gIGFuYWx5emVycy5leHBvcnQgPSB0YXJnZXQgPT4ge1xuICAgIGZvciggbGV0IGtleSBpbiBhbmFseXplcnMgKSB7XG4gICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyApIHtcbiAgICAgICAgdGFyZ2V0WyBrZXkgXSA9IGFuYWx5emVyc1sga2V5IF1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxucmV0dXJuIGFuYWx5emVyc1xuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSgnZ2VuaXNoLmpzJyksXG4gICAgICBhbmFseXplciA9IHJlcXVpcmUoJy4vYW5hbHl6ZXIuanMnKSxcbiAgICAgIHVnZW4gPSByZXF1aXJlKCcuLi91Z2VuLmpzJyk7XG5cbmNvbnN0IGdlbmlzaCA9IGc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEdpYmJlcmlzaCkge1xuXG4gIGNvbnN0IEZvbGxvdyA9IGlucHV0UHJvcHMgPT4ge1xuXG4gICAgLy8gbWFpbiBmb2xsb3cgb2JqZWN0IGlzIGFsc28gdGhlIG91dHB1dFxuICAgIGNvbnN0IGZvbGxvdyA9IE9iamVjdC5jcmVhdGUoYW5hbHl6ZXIpO1xuICAgIGZvbGxvdy5pbiA9IE9iamVjdC5jcmVhdGUodWdlbik7XG4gICAgZm9sbG93LmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKCk7XG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGlucHV0UHJvcHMsIEZvbGxvdy5kZWZhdWx0cyk7XG4gICAgbGV0IGlzU3RlcmVvID0gcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZTtcblxuICAgIC8vIHRoZSBpbnB1dCB0byB0aGUgZm9sbG93IHVnZW4gaXMgYnVmZmVyZWQgaW4gdGhpcyB1Z2VuXG4gICAgZm9sbG93LmJ1ZmZlciA9IGcuZGF0YShwcm9wcy5idWZmZXJTaXplLCAxKTtcblxuICAgIGxldCBhdmc7IC8vIG91dHB1dDsgbWFrZSBhdmFpbGFibGUgb3V0c2lkZSBqc2RzcCBibG9ja1xuICAgIGNvbnN0IF9pbnB1dCA9IGcuaW4oJ2lucHV0Jyk7XG4gICAgY29uc3QgaW5wdXQgPSBpc1N0ZXJlbyA/IGcuYWRkKF9pbnB1dFswXSwgX2lucHV0WzFdKSA6IF9pbnB1dDtcblxuICAgIHtcbiAgICAgIFwidXNlIGpzZHNwXCI7XG4gICAgICAvLyBwaGFzZSB0byB3cml0ZSB0byBmb2xsb3cgYnVmZmVyXG4gICAgICBjb25zdCBidWZmZXJQaGFzZU91dCA9IGcuYWNjdW0oMSwgMCwgeyBtYXg6IHByb3BzLmJ1ZmZlclNpemUsIG1pbjogMCB9KTtcblxuICAgICAgLy8gaG9sZCBydW5uaW5nIHN1bVxuICAgICAgY29uc3Qgc3VtID0gZy5kYXRhKDEsIDEsIHsgbWV0YTogdHJ1ZSB9KTtcblxuICAgICAgc3VtWzBdID0gZ2VuaXNoLnN1YihnZW5pc2guYWRkKHN1bVswXSwgaW5wdXQpLCBnLnBlZWsoZm9sbG93LmJ1ZmZlciwgYnVmZmVyUGhhc2VPdXQsIHsgbW9kZTogJ3NpbXBsZScgfSkpO1xuXG4gICAgICBhdmcgPSBnZW5pc2guZGl2KHN1bVswXSwgcHJvcHMuYnVmZmVyU2l6ZSk7XG4gICAgfVxuXG4gICAgaWYgKCFpc1N0ZXJlbykge1xuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoZm9sbG93LCBhdmcsICdmb2xsb3dfb3V0JywgcHJvcHMpO1xuXG4gICAgICBmb2xsb3cuY2FsbGJhY2sudWdlbk5hbWUgPSBmb2xsb3cudWdlbk5hbWUgPSBgZm9sbG93X291dF8keyBmb2xsb3cuaWQgfWA7XG5cbiAgICAgIC8vIGhhdmUgdG8gd3JpdGUgY3VzdG9tIGNhbGxiYWNrIGZvciBpbnB1dCB0byByZXVzZSBjb21wb25lbnRzIGZyb20gb3V0cHV0LFxuICAgICAgLy8gc3BlY2lmaWNhbGx5IHRoZSBtZW1vcnkgZnJvbSBvdXIgYnVmZmVyXG4gICAgICBsZXQgaWR4ID0gZm9sbG93LmJ1ZmZlci5tZW1vcnkudmFsdWVzLmlkeDtcbiAgICAgIGxldCBwaGFzZSA9IDA7XG4gICAgICBsZXQgYWJzID0gTWF0aC5hYnM7XG4gICAgICBsZXQgY2FsbGJhY2sgPSBmdW5jdGlvbiAoaW5wdXQsIG1lbW9yeSkge1xuICAgICAgICAndXNlIHN0cmljdCc7XG5cbiAgICAgICAgbWVtb3J5W2dlbmlzaC5hZGQoaWR4LCBwaGFzZSldID0gYWJzKGlucHV0KTtcbiAgICAgICAgcGhhc2UrKztcbiAgICAgICAgaWYgKHBoYXNlID4gZ2VuaXNoLnN1Yihwcm9wcy5idWZmZXJTaXplLCAxKSkge1xuICAgICAgICAgIHBoYXNlID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfTtcblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoZm9sbG93LmluLCBpbnB1dCwgJ2ZvbGxvd19pbicsIHByb3BzLCBjYWxsYmFjayk7XG5cbiAgICAgIC8vIGxvdHMgb2Ygbm9uc2Vuc2UgdG8gbWFrZSBvdXIgY3VzdG9tIGZ1bmN0aW9uIHdvcmtcbiAgICAgIGZvbGxvdy5pbi5jYWxsYmFjay51Z2VuTmFtZSA9IGZvbGxvdy5pbi51Z2VuTmFtZSA9IGBmb2xsb3dfaW5fJHsgZm9sbG93LmlkIH1gO1xuICAgICAgZm9sbG93LmluLmlucHV0TmFtZXMgPSBbJ2lucHV0J107XG4gICAgICBmb2xsb3cuaW4uaW5wdXRzID0gW2lucHV0XTtcbiAgICAgIGZvbGxvdy5pbi5pbnB1dCA9IHByb3BzLmlucHV0O1xuICAgICAgZm9sbG93LmluLnR5cGUgPSAnYW5hbHlzaXMnO1xuXG4gICAgICBpZiAoR2liYmVyaXNoLmFuYWx5emVycy5pbmRleE9mKGZvbGxvdy5pbikgPT09IC0xKSB7XG4gICAgICAgIEdpYmJlcmlzaC5hbmFseXplcnMucHVzaChmb2xsb3cuaW4pO1xuICAgICAgfVxuXG4gICAgICBHaWJiZXJpc2guZGlydHkoR2liYmVyaXNoLmFuYWx5emVycyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZvbGxvdztcbiAgfTtcblxuICBGb2xsb3cuZGVmYXVsdHMgPSB7XG4gICAgYnVmZmVyU2l6ZTogODE5MlxuICB9O1xuXG4gIHJldHVybiBGb2xsb3c7XG59OyIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgYW5hbHl6ZXIgPSByZXF1aXJlKCAnLi9hbmFseXplci5qcycgKSxcbiAgICAgIHByb3h5ICAgID0gcmVxdWlyZSggJy4uL3dvcmtsZXRQcm94eS5qcycgKSxcbiAgICAgIHVnZW4gICAgID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxuY29uc3QgRGVsYXkgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHNzZCA9IE9iamVjdC5jcmVhdGUoIGFuYWx5emVyIClcbiAgc3NkLl9faW4gID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gIHNzZC5fX291dCA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG4gIHNzZC5pZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG5cbiAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgRGVsYXkuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICBsZXQgaXNTdGVyZW8gPSBwcm9wcy5pc1N0ZXJlbyBcbiAgXG4gIGxldCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKVxuICAgIFxuICBsZXQgaGlzdG9yeUwgPSBnLmhpc3RvcnkoKVxuXG4gIGlmKCBpc1N0ZXJlbyApIHtcbiAgICAvLyByaWdodCBjaGFubmVsXG4gICAgbGV0IGhpc3RvcnlSID0gZy5oaXN0b3J5KClcblxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICAgIHNzZC5fX291dCxcbiAgICAgIFsgaGlzdG9yeUwub3V0LCBoaXN0b3J5Ui5vdXQgXSwgXG4gICAgICAnc3NkX291dCcsIFxuICAgICAgcHJvcHMsXG4gICAgICBudWxsLFxuICAgICAgZmFsc2VcbiAgICApXG5cbiAgICBzc2QuX19vdXQuY2FsbGJhY2sudWdlbk5hbWUgPSBzc2QuX19vdXQudWdlbk5hbWUgPSAnc3NkX291dCcgKyBzc2QuaWRcblxuICAgIGNvbnN0IGlkeEwgPSBzc2QuX19vdXQuZ3JhcGgubWVtb3J5LnZhbHVlLmlkeCwgXG4gICAgICAgICAgaWR4UiA9IGlkeEwgKyAxLFxuICAgICAgICAgIG1lbW9yeSA9IEdpYmJlcmlzaC5nZW5pc2guZ2VuLm1lbW9yeS5oZWFwXG5cbiAgICBjb25zdCBjYWxsYmFjayA9IGZ1bmN0aW9uKCBpbnB1dCApIHtcbiAgICAgICd1c2Ugc3RyaWN0J1xuICAgICAgbWVtb3J5WyBpZHhMIF0gPSBpbnB1dFswXVxuICAgICAgbWVtb3J5WyBpZHhSIF0gPSBpbnB1dFsxXVxuICAgICAgcmV0dXJuIDAgICAgIFxuICAgIH1cbiAgICBcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggc3NkLmluLCBbIGlucHV0WzBdLGlucHV0WzFdIF0sICdzc2RfaW4nLCBwcm9wcywgY2FsbGJhY2ssIGZhbHNlIClcblxuICAgIGNhbGxiYWNrLnVnZW5OYW1lID0gc3NkLmluLnVnZW5OYW1lID0gJ3NzZF9pbl8nICsgc3NkLmlkXG4gICAgc3NkLmluLmlucHV0TmFtZXMgPSBbICdpbnB1dCcgXVxuICAgIHNzZC5pbi5pbnB1dHMgPSBbIHByb3BzLmlucHV0IF1cbiAgICBzc2QuaW4uaW5wdXQgPSBwcm9wcy5pbnB1dFxuICAgIHNzZC50eXBlID0gJ2FuYWx5c2lzJ1xuXG4gICAgc3NkLmluLmxpc3RlbiA9IGZ1bmN0aW9uKCB1Z2VuICkge1xuICAgICAgaWYoIHVnZW4gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc3NkLmluLmlucHV0ID0gdWdlblxuICAgICAgICBzc2QuaW4uaW5wdXRzID0gWyB1Z2VuIF1cbiAgICAgIH1cblxuICAgICAgaWYoIEdpYmJlcmlzaC5hbmFseXplcnMuaW5kZXhPZiggc3NkLmluICkgPT09IC0xICkge1xuICAgICAgICBHaWJiZXJpc2guYW5hbHl6ZXJzLnB1c2goIHNzZC5pbiApXG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC5kaXJ0eSggR2liYmVyaXNoLmFuYWx5emVycyApXG4gICAgfVxuICB9ZWxzZXtcbiAgICBHaWJiZXJpc2guZmFjdG9yeSggc3NkLl9fb3V0LCBoaXN0b3J5TC5vdXQsICdzc2Rfb3V0JywgcHJvcHMsIG51bGwsIGZhbHNlIClcblxuICAgIHNzZC5fX291dC5jYWxsYmFjay51Z2VuTmFtZSA9IHNzZC5fX291dC51Z2VuTmFtZSA9ICdzc2Rfb3V0JyArIHNzZC5pZFxuXG4gICAgbGV0IGlkeCA9IHNzZC5fX291dC5ncmFwaC5tZW1vcnkudmFsdWUuaWR4IFxuICAgIGxldCBtZW1vcnkgPSBHaWJiZXJpc2guZ2VuaXNoLmdlbi5tZW1vcnkuaGVhcFxuICAgIGxldCBjYWxsYmFjayA9IGZ1bmN0aW9uKCBpbnB1dCApIHtcbiAgICAgICd1c2Ugc3RyaWN0J1xuICAgICAgbWVtb3J5WyBpZHggXSA9IGlucHV0XG4gICAgICByZXR1cm4gMCAgICAgXG4gICAgfVxuICAgIFxuICAgIEdpYmJlcmlzaC5mYWN0b3J5KCBzc2QuX19pbiwgaW5wdXQsICdzc2RfaW4nLCB7fSwgY2FsbGJhY2ssIGZhbHNlIClcblxuICAgIGNhbGxiYWNrLnVnZW5OYW1lID0gc3NkLl9faW4udWdlbk5hbWUgPSAnc3NkX2luXycgKyBzc2QuaWRcbiAgICBzc2QuX19pbi5pbnB1dE5hbWVzID0gWyAnaW5wdXQnIF1cbiAgICBzc2QuX19pbi5pbnB1dHMgPSBbIHByb3BzLmlucHV0IF1cbiAgICBzc2QuX19pbi5pbnB1dCA9IHByb3BzLmlucHV0XG4gICAgc3NkLnR5cGUgPSAnYW5hbHlzaXMnXG5cbiAgICBzc2QuX19pbi5saXN0ZW4gPSBmdW5jdGlvbiggdWdlbiApIHtcbiAgICAgIC8vY29uc29sZS5sb2coICdsaXN0ZW5pbmc6JywgdWdlbiwgR2liYmVyaXNoLm1vZGUgKVxuICAgICAgaWYoIHVnZW4gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgc3NkLl9faW4uaW5wdXQgPSB1Z2VuXG4gICAgICAgIHNzZC5fX2luLmlucHV0cyA9IFsgdWdlbiBdXG4gICAgICB9XG5cbiAgICAgIGlmKCBHaWJiZXJpc2guYW5hbHl6ZXJzLmluZGV4T2YoIHNzZC5fX2luICkgPT09IC0xICkge1xuICAgICAgICBpZiggR2liYmVyaXNoLm1vZGUgPT09ICd3b3JrbGV0JyApIHtcbiAgICAgICAgICBHaWJiZXJpc2guYW5hbHl6ZXJzLnB1c2goIHsgaWQ6c3NkLmlkLCBwcm9wOidpbicgfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgR2liYmVyaXNoLmFuYWx5emVycy5wdXNoKCBzc2QuX19pbiApXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgR2liYmVyaXNoLmRpcnR5KCBHaWJiZXJpc2guYW5hbHl6ZXJzIClcbiAgICAgIC8vY29uc29sZS5sb2coICdpbjonLCBzc2QuX19pbiApXG4gICAgfVxuXG4gIH1cblxuICBzc2QubGlzdGVuID0gc3NkLl9faW4ubGlzdGVuXG4gIHNzZC5fX2luLnR5cGUgPSAnYW5hbHlzaXMnXG5cbiBcbiAgc3NkLl9fb3V0LmlucHV0cyA9IFtdXG5cbiAgY29uc3Qgb3V0ID0gIHByb3h5KCBbJ2FuYWx5c2lzJywnU1NEJ10sIHByb3BzLCBzc2QgKVxuICBcbiAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIG91dCwge1xuICAgICdvdXQnOiB7XG4gICAgICBzZXQodikge30sXG4gICAgICBnZXQoKSB7XG4gICAgICAgIGlmKCBHaWJiZXJpc2gubW9kZSA9PT0gJ3dvcmtsZXQnICkge1xuICAgICAgICAgIHJldHVybiB7IGlkOm91dC5pZCwgcHJvcDonb3V0JyB9XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHJldHVybiBvdXQuX19vdXRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgLy8naW4nOiB7XG4gICAgLy8gIHNldCh2KSB7fSxcbiAgICAvLyAgZ2V0KCkge1xuICAgIC8vICAgIGlmKCBHaWJiZXJpc2gubW9kZSA9PT0gJ3dvcmtsZXQnICkge1xuICAgIC8vICAgICAgY29uc29sZS5sb2coICdyZXR1cm5pbmcgc3NkIGluJyApXG4gICAgLy8gICAgICByZXR1cm4geyBpZDpvdXQuaWQsIHByb3A6J2luJyB9XG4gICAgLy8gICAgfWVsc2V7XG4gICAgLy8gICAgICByZXR1cm4gb3V0Ll9faW5cbiAgICAvLyAgICB9XG4gICAgLy8gIH1cbiAgICAvL30sXG5cbiAgfSlcblxuICByZXR1cm4gb3V0XG59XG5cbkRlbGF5LmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBpc1N0ZXJlbzpmYWxzZVxufVxuXG5yZXR1cm4gRGVsYXlcblxufVxuIiwiY29uc3QgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IEFEID0gZnVuY3Rpb24oIGFyZ3VtZW50UHJvcHMgKSB7XG4gICAgY29uc3QgYWQgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICksXG4gICAgICAgICAgYXR0YWNrICA9IGcuaW4oICdhdHRhY2snICksXG4gICAgICAgICAgZGVjYXkgICA9IGcuaW4oICdkZWNheScgKVxuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQUQuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgY29uc3QgZ3JhcGggPSBnLmFkKCBhdHRhY2ssIGRlY2F5LCB7IHNoYXBlOnByb3BzLnNoYXBlLCBhbHBoYTpwcm9wcy5hbHBoYSB9KVxuXG4gICAgYWQudHJpZ2dlciA9IGdyYXBoLnRyaWdnZXJcbiAgICBcbiAgICBjb25zdCBfX291dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBhZCwgZ3JhcGgsIFsnZW52ZWxvcGVzJywnQUQnXSwgcHJvcHMgKVxuXG4gICAgcmV0dXJuIF9fb3V0XG4gIH1cblxuICBBRC5kZWZhdWx0cyA9IHsgYXR0YWNrOjQ0MTAwLCBkZWNheTo0NDEwMCwgc2hhcGU6J2V4cG9uZW50aWFsJywgYWxwaGE6NSB9IFxuXG4gIHJldHVybiBBRFxuXG59XG4iLCJjb25zdCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICksXG4gICAgICBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgQURTUiA9IGZ1bmN0aW9uKCBhcmd1bWVudFByb3BzICkge1xuICAgIGNvbnN0IGFkc3IgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApLFxuICAgICAgICAgIGF0dGFjayAgPSBnLmluKCAnYXR0YWNrJyApLFxuICAgICAgICAgIGRlY2F5ICAgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgICAgc3VzdGFpbiA9IGcuaW4oICdzdXN0YWluJyApLFxuICAgICAgICAgIHJlbGVhc2UgPSBnLmluKCAncmVsZWFzZScgKSxcbiAgICAgICAgICBzdXN0YWluTGV2ZWwgPSBnLmluKCAnc3VzdGFpbkxldmVsJyApXG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBBRFNSLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIE9iamVjdC5hc3NpZ24oIGFkc3IsIHByb3BzIClcblxuICAgIGNvbnN0IGdyYXBoID0gZy5hZHNyKCBcbiAgICAgIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHN1c3RhaW5MZXZlbCwgcmVsZWFzZSwgXG4gICAgICB7IHRyaWdnZXJSZWxlYXNlOiBwcm9wcy50cmlnZ2VyUmVsZWFzZSwgc2hhcGU6cHJvcHMuc2hhcGUsIGFscGhhOnByb3BzLmFscGhhIH0gXG4gICAgKVxuXG4gICAgYWRzci50cmlnZ2VyID0gZ3JhcGgudHJpZ2dlclxuICAgIGFkc3IuYWR2YW5jZSA9IGdyYXBoLnJlbGVhc2VcblxuICAgIGNvbnN0IF9fb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIGFkc3IsIGdyYXBoLCBbJ2VudmVsb3BlcycsJ0FEU1InXSwgcHJvcHMgKVxuXG4gICAgcmV0dXJuIF9fb3V0IFxuICB9XG5cbiAgQURTUi5kZWZhdWx0cyA9IHsgXG4gICAgYXR0YWNrOjIyMDUwLCBcbiAgICBkZWNheToyMjA1MCwgXG4gICAgc3VzdGFpbjo0NDEwMCwgXG4gICAgc3VzdGFpbkxldmVsOi42LCBcbiAgICByZWxlYXNlOiA0NDEwMCwgXG4gICAgdHJpZ2dlclJlbGVhc2U6ZmFsc2UsXG4gICAgc2hhcGU6J2V4cG9uZW50aWFsJyxcbiAgICBhbHBoYTo1IFxuICB9IFxuXG4gIHJldHVybiBBRFNSXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgRW52ZWxvcGVzID0ge1xuICAgIEFEICAgICA6IHJlcXVpcmUoICcuL2FkLmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgICBBRFNSICAgOiByZXF1aXJlKCAnLi9hZHNyLmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgICBSYW1wICAgOiByZXF1aXJlKCAnLi9yYW1wLmpzJyApKCBHaWJiZXJpc2ggKSxcblxuICAgIGV4cG9ydCA6IHRhcmdldCA9PiB7XG4gICAgICBmb3IoIGxldCBrZXkgaW4gRW52ZWxvcGVzICkge1xuICAgICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyAmJiBrZXkgIT09ICdmYWN0b3J5JyApIHtcbiAgICAgICAgICB0YXJnZXRbIGtleSBdID0gRW52ZWxvcGVzWyBrZXkgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGZhY3RvcnkoIHVzZUFEU1IsIHNoYXBlLCBhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCBzdXN0YWluTGV2ZWwsIHJlbGVhc2UsIHRyaWdnZXJSZWxlYXNlPWZhbHNlICkge1xuICAgICAgbGV0IGVudlxuXG4gICAgICAvLyBkZWxpYmVyYXRlIHVzZSBvZiBzaW5nbGUgPSB0byBhY2NvbW9kYXRlIGJvdGggMSBhbmQgdHJ1ZVxuICAgICAgaWYoIHVzZUFEU1IgIT0gdHJ1ZSApIHtcbiAgICAgICAgZW52ID0gZy5hZCggYXR0YWNrLCBkZWNheSwgeyBzaGFwZSB9KSBcbiAgICAgIH1lbHNlIHtcbiAgICAgICAgZW52ID0gZy5hZHNyKCBhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCBzdXN0YWluTGV2ZWwsIHJlbGVhc2UsIHsgc2hhcGUsIHRyaWdnZXJSZWxlYXNlIH0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBlbnZcbiAgICB9XG4gIH0gXG5cbiAgcmV0dXJuIEVudmVsb3Blc1xufVxuIiwiY29uc3QgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApLFxuICAgICAgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IFJhbXAgPSBmdW5jdGlvbiggYXJndW1lbnRQcm9wcyApIHtcbiAgICBjb25zdCByYW1wICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICksXG4gICAgICAgICAgbGVuZ3RoID0gZy5pbiggJ2xlbmd0aCcgKSxcbiAgICAgICAgICBmcm9tICAgPSBnLmluKCAnZnJvbScgKSxcbiAgICAgICAgICB0byAgICAgPSBnLmluKCAndG8nIClcblxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgUmFtcC5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBjb25zdCByZXNldCA9IGcuYmFuZygpXG5cbiAgICBjb25zdCBwaGFzZSA9IGcuYWNjdW0oIGcuZGl2KCAxLCBsZW5ndGggKSwgcmVzZXQsIHsgc2hvdWxkV3JhcDpwcm9wcy5zaG91bGRMb29wLCBzaG91bGRDbGFtcDp0cnVlIH0pLFxuICAgICAgICAgIGRpZmYgPSBnLnN1YiggdG8sIGZyb20gKSxcbiAgICAgICAgICBncmFwaCA9IGcuYWRkKCBmcm9tLCBnLm11bCggcGhhc2UsIGRpZmYgKSApXG4gICAgICAgIFxuICAgIHJhbXAudHJpZ2dlciA9IHJlc2V0LnRyaWdnZXJcblxuICAgIGNvbnN0IG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCByYW1wLCBncmFwaCwgWydlbnZlbG9wZXMnLCdyYW1wJ10sIHByb3BzIClcblxuXG4gICAgcmV0dXJuIG91dFxuICB9XG5cbiAgUmFtcC5kZWZhdWx0cyA9IHsgZnJvbTowLCB0bzoxLCBsZW5ndGg6Zy5nZW4uc2FtcGxlcmF0ZSwgc2hvdWxkTG9vcDpmYWxzZSB9XG5cbiAgcmV0dXJuIFJhbXBcblxufVxuIiwiLypcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRpbWF0dGVyMTUvaGVhcHF1ZXVlLmpzL2Jsb2IvbWFzdGVyL2hlYXBxdWV1ZS5qc1xuICpcbiAqIFRoaXMgaW1wbGVtZW50YXRpb24gaXMgdmVyeSBsb29zZWx5IGJhc2VkIG9mZiBqcy1wcmlvcml0eS1xdWV1ZVxuICogYnkgQWRhbSBIb29wZXIgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYWRhbWhvb3Blci9qcy1wcmlvcml0eS1xdWV1ZVxuICpcbiAqIFRoZSBqcy1wcmlvcml0eS1xdWV1ZSBpbXBsZW1lbnRhdGlvbiBzZWVtZWQgYSB0ZWVuc3kgYml0IGJsb2F0ZWRcbiAqIHdpdGggaXRzIHJlcXVpcmUuanMgZGVwZW5kZW5jeSBhbmQgbXVsdGlwbGUgc3RvcmFnZSBzdHJhdGVnaWVzXG4gKiB3aGVuIGFsbCBidXQgb25lIHdlcmUgc3Ryb25nbHkgZGlzY291cmFnZWQuIFNvIGhlcmUgaXMgYSBraW5kIG9mXG4gKiBjb25kZW5zZWQgdmVyc2lvbiBvZiB0aGUgZnVuY3Rpb25hbGl0eSB3aXRoIG9ubHkgdGhlIGZlYXR1cmVzIHRoYXRcbiAqIEkgcGFydGljdWxhcmx5IG5lZWRlZC5cbiAqXG4gKiBVc2luZyBpdCBpcyBwcmV0dHkgc2ltcGxlLCB5b3UganVzdCBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgSGVhcFF1ZXVlXG4gKiB3aGlsZSBvcHRpb25hbGx5IHNwZWNpZnlpbmcgYSBjb21wYXJhdG9yIGFzIHRoZSBhcmd1bWVudDpcbiAqXG4gKiB2YXIgaGVhcHEgPSBuZXcgSGVhcFF1ZXVlKCk7XG4gKlxuICogLy9JRiBORUdBVElWRSwgUkVUVVJOIEFcbiAqXG4gKiB2YXIgY3VzdG9tcSA9IG5ldyBIZWFwUXVldWUoZnVuY3Rpb24oYSwgYil7XG4gKiAgIC8vIGlmIGIgPiBhLCByZXR1cm4gbmVnYXRpdmVcbiAqICAgLy8gbWVhbnMgdGhhdCBpdCBzcGl0cyBvdXQgdGhlIHNtYWxsZXN0IGl0ZW0gZmlyc3RcbiAqICAgcmV0dXJuIGEgLSBiO1xuICogfSk7XG4gKlxuICogTm90ZSB0aGF0IGluIHRoaXMgY2FzZSwgdGhlIGRlZmF1bHQgY29tcGFyYXRvciBpcyBpZGVudGljYWwgdG9cbiAqIHRoZSBjb21wYXJhdG9yIHdoaWNoIGlzIHVzZWQgZXhwbGljaXRseSBpbiB0aGUgc2Vjb25kIHF1ZXVlLlxuICpcbiAqIE9uY2UgeW91J3ZlIGluaXRpYWxpemVkIHRoZSBoZWFwcXVldWUsIHlvdSBjYW4gcGxvcCBzb21lIG5ld1xuICogZWxlbWVudHMgaW50byB0aGUgcXVldWUgd2l0aCB0aGUgcHVzaCBtZXRob2QgKHZhZ3VlbHkgcmVtaW5pc2NlbnRcbiAqIG9mIHR5cGljYWwgamF2YXNjcmlwdCBhcmF5cylcbiAqXG4gKiBoZWFwcS5wdXNoKDQyKTtcbiAqIGhlYXBxLnB1c2goXCJraXR0ZW5cIik7XG4gKlxuICogVGhlIHB1c2ggbWV0aG9kIHJldHVybnMgdGhlIG5ldyBudW1iZXIgb2YgZWxlbWVudHMgb2YgdGhlIHF1ZXVlLlxuICpcbiAqIFlvdSBjYW4gcHVzaCBhbnl0aGluZyB5b3UnZCBsaWtlIG9udG8gdGhlIHF1ZXVlLCBzbyBsb25nIGFzIHlvdXJcbiAqIGNvbXBhcmF0b3IgZnVuY3Rpb24gaXMgY2FwYWJsZSBvZiBoYW5kbGluZyBpdC4gVGhlIGRlZmF1bHRcbiAqIGNvbXBhcmF0b3IgaXMgcmVhbGx5IHN0dXBpZCBzbyBpdCB3b24ndCBiZSBhYmxlIHRvIGhhbmRsZSBhbnl0aGluZ1xuICogb3RoZXIgdGhhbiBhbiBudW1iZXIgYnkgZGVmYXVsdC5cbiAqXG4gKiBZb3UgY2FuIHByZXZpZXcgdGhlIHNtYWxsZXN0IGl0ZW0gYnkgdXNpbmcgcGVlay5cbiAqXG4gKiBoZWFwcS5wdXNoKC05OTk5KTtcbiAqIGhlYXBxLnBlZWsoKTsgLy8gPT0+IC05OTk5XG4gKlxuICogVGhlIHVzZWZ1bCBjb21wbGVtZW50IHRvIHRvIHRoZSBwdXNoIG1ldGhvZCBpcyB0aGUgcG9wIG1ldGhvZCxcbiAqIHdoaWNoIHJldHVybnMgdGhlIHNtYWxsZXN0IGl0ZW0gYW5kIHRoZW4gcmVtb3ZlcyBpdCBmcm9tIHRoZVxuICogcXVldWUuXG4gKlxuICogaGVhcHEucHVzaCgxKTtcbiAqIGhlYXBxLnB1c2goMik7XG4gKiBoZWFwcS5wdXNoKDMpO1xuICogaGVhcHEucG9wKCk7IC8vID09PiAxXG4gKiBoZWFwcS5wb3AoKTsgLy8gPT0+IDJcbiAqIGhlYXBxLnBvcCgpOyAvLyA9PT4gM1xuICovXG5jb25zdCBIZWFwUXVldWUgPSBmdW5jdGlvbihjbXApe1xuICB0aGlzLmNtcCA9IChjbXAgfHwgZnVuY3Rpb24oYSwgYil7IHJldHVybiBhIC0gYjsgfSk7XG4gIHRoaXMubGVuZ3RoID0gMDtcbiAgdGhpcy5kYXRhID0gW107XG59XG5IZWFwUXVldWUucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gdGhpcy5kYXRhWzBdO1xufTtcbkhlYXBRdWV1ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgdGhpcy5kYXRhLnB1c2godmFsdWUpO1xuXG4gIHZhciBwb3MgPSB0aGlzLmRhdGEubGVuZ3RoIC0gMSxcbiAgcGFyZW50LCB4O1xuXG4gIHdoaWxlKHBvcyA+IDApe1xuICAgIHBhcmVudCA9IChwb3MgLSAxKSA+Pj4gMTtcbiAgICBpZih0aGlzLmNtcCh0aGlzLmRhdGFbcG9zXSwgdGhpcy5kYXRhW3BhcmVudF0pIDwgMCl7XG4gICAgICB4ID0gdGhpcy5kYXRhW3BhcmVudF07XG4gICAgICB0aGlzLmRhdGFbcGFyZW50XSA9IHRoaXMuZGF0YVtwb3NdO1xuICAgICAgdGhpcy5kYXRhW3Bvc10gPSB4O1xuICAgICAgcG9zID0gcGFyZW50O1xuICAgIH1lbHNlIGJyZWFrO1xuICB9XG4gIHJldHVybiB0aGlzLmxlbmd0aCsrO1xufTtcbkhlYXBRdWV1ZS5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24oKXtcbiAgdmFyIGxhc3RfdmFsID0gdGhpcy5kYXRhLnBvcCgpLFxuICByZXQgPSB0aGlzLmRhdGFbMF07XG4gIGlmKHRoaXMuZGF0YS5sZW5ndGggPiAwKXtcbiAgICB0aGlzLmRhdGFbMF0gPSBsYXN0X3ZhbDtcbiAgICB2YXIgcG9zID0gMCxcbiAgICBsYXN0ID0gdGhpcy5kYXRhLmxlbmd0aCAtIDEsXG4gICAgbGVmdCwgcmlnaHQsIG1pbkluZGV4LCB4O1xuICAgIHdoaWxlKDEpe1xuICAgICAgbGVmdCA9IChwb3MgPDwgMSkgKyAxO1xuICAgICAgcmlnaHQgPSBsZWZ0ICsgMTtcbiAgICAgIG1pbkluZGV4ID0gcG9zO1xuICAgICAgaWYobGVmdCA8PSBsYXN0ICYmIHRoaXMuY21wKHRoaXMuZGF0YVtsZWZ0XSwgdGhpcy5kYXRhW21pbkluZGV4XSkgPCAwKSBtaW5JbmRleCA9IGxlZnQ7XG4gICAgICBpZihyaWdodCA8PSBsYXN0ICYmIHRoaXMuY21wKHRoaXMuZGF0YVtyaWdodF0sIHRoaXMuZGF0YVttaW5JbmRleF0pIDwgMCkgbWluSW5kZXggPSByaWdodDtcbiAgICAgIGlmKG1pbkluZGV4ICE9PSBwb3Mpe1xuICAgICAgICB4ID0gdGhpcy5kYXRhW21pbkluZGV4XTtcbiAgICAgICAgdGhpcy5kYXRhW21pbkluZGV4XSA9IHRoaXMuZGF0YVtwb3NdO1xuICAgICAgICB0aGlzLmRhdGFbcG9zXSA9IHg7XG4gICAgICAgIHBvcyA9IG1pbkluZGV4O1xuICAgICAgfWVsc2UgYnJlYWs7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldCA9IGxhc3RfdmFsO1xuICB9XG4gIHRoaXMubGVuZ3RoLS07XG4gIHJldHVybiByZXQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlYXBRdWV1ZVxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG4gXG4vLyBjb25zdHJ1Y3RvciBmb3Igc2Nocm9lZGVyIGFsbHBhc3MgZmlsdGVyc1xubGV0IGFsbFBhc3MgPSBmdW5jdGlvbiggX2lucHV0LCBsZW5ndGg9NTAwLCBmZWVkYmFjaz0uNSApIHtcbiAgbGV0IGluZGV4ICA9IGcuY291bnRlciggMSwwLGxlbmd0aCApLFxuICAgICAgYnVmZmVyID0gZy5kYXRhKCBsZW5ndGggKSxcbiAgICAgIGJ1ZmZlclNhbXBsZSA9IGcucGVlayggYnVmZmVyLCBpbmRleCwgeyBpbnRlcnA6J25vbmUnLCBtb2RlOidzYW1wbGVzJyB9KSxcbiAgICAgIG91dCA9IGcubWVtbyggZy5hZGQoIGcubXVsKCAtMSwgX2lucHV0KSwgYnVmZmVyU2FtcGxlICkgKVxuICAgICAgICAgICAgICAgIFxuICBnLnBva2UoIGJ1ZmZlciwgZy5hZGQoIF9pbnB1dCwgZy5tdWwoIGJ1ZmZlclNhbXBsZSwgZmVlZGJhY2sgKSApLCBpbmRleCApXG4gXG4gIHJldHVybiBvdXRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhbGxQYXNzXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgZmlsdGVyID0gcmVxdWlyZSggJy4vZmlsdGVyLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBHaWJiZXJpc2guZ2VuaXNoLmJpcXVhZCA9ICggaW5wdXQsIGN1dG9mZiwgX1EsIG1vZGUsIGlzU3RlcmVvICkgPT4ge1xuICAgIGxldCBhMCxhMSxhMixjLGIxLGIyLFxuICAgICAgICBpbjFhMCx4MWExLHgyYTIseTFiMSx5MmIyLFxuICAgICAgICBpbjFhMF8xLHgxYTFfMSx4MmEyXzEseTFiMV8xLHkyYjJfMVxuXG4gICAgbGV0IHJldHVyblZhbHVlXG4gICAgXG4gICAgY29uc3QgUSA9IGcubWVtbyggZy5hZGQoIC41LCBnLm11bCggX1EsIDIyICkgKSApXG4gICAgbGV0IHgxID0gZy5oaXN0b3J5KCksIHgyID0gZy5oaXN0b3J5KCksIHkxID0gZy5oaXN0b3J5KCksIHkyID0gZy5oaXN0b3J5KClcbiAgICBcbiAgICBsZXQgdzAgPSBnLm1lbW8oIGcubXVsKCAyICogTWF0aC5QSSwgZy5kaXYoIGN1dG9mZiwgIGcuZ2VuLnNhbXBsZXJhdGUgKSApICksXG4gICAgICAgIHNpbncwID0gZy5zaW4oIHcwICksXG4gICAgICAgIGNvc3cwID0gZy5jb3MoIHcwICksXG4gICAgICAgIGFscGhhID0gZy5tZW1vKCBnLmRpdiggc2ludzAsIGcubXVsKCAyLCBRICkgKSApXG5cbiAgICBsZXQgb25lTWludXNDb3NXID0gZy5zdWIoIDEsIGNvc3cwIClcblxuICAgIHN3aXRjaCggbW9kZSApIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgYTAgPSBnLm1lbW8oIGcuZGl2KCBnLmFkZCggMSwgY29zdzApICwgMikgKVxuICAgICAgICBhMSA9IGcubXVsKCBnLmFkZCggMSwgY29zdzAgKSwgLTEgKVxuICAgICAgICBhMiA9IGEwXG4gICAgICAgIGMgID0gZy5hZGQoIDEsIGFscGhhIClcbiAgICAgICAgYjEgPSBnLm11bCggLTIgLCBjb3N3MCApXG4gICAgICAgIGIyID0gZy5zdWIoIDEsIGFscGhhIClcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGEwID0gZy5tdWwoIFEsIGFscGhhIClcbiAgICAgICAgYTEgPSAwXG4gICAgICAgIGEyID0gZy5tdWwoIGEwLCAtMSApXG4gICAgICAgIGMgID0gZy5hZGQoIDEsIGFscGhhIClcbiAgICAgICAgYjEgPSBnLm11bCggLTIgLCBjb3N3MCApXG4gICAgICAgIGIyID0gZy5zdWIoIDEsIGFscGhhIClcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiAvLyBMUFxuICAgICAgICBhMCA9IGcubWVtbyggZy5kaXYoIG9uZU1pbnVzQ29zVywgMikgKVxuICAgICAgICBhMSA9IG9uZU1pbnVzQ29zV1xuICAgICAgICBhMiA9IGEwXG4gICAgICAgIGMgID0gZy5hZGQoIDEsIGFscGhhIClcbiAgICAgICAgYjEgPSBnLm11bCggLTIgLCBjb3N3MCApXG4gICAgICAgIGIyID0gZy5zdWIoIDEsIGFscGhhIClcbiAgICB9XG5cbiAgICBhMCA9IGcuZGl2KCBhMCwgYyApOyBhMSA9IGcuZGl2KCBhMSwgYyApOyBhMiA9IGcuZGl2KCBhMiwgYyApXG4gICAgYjEgPSBnLmRpdiggYjEsIGMgKTsgYjIgPSBnLmRpdiggYjIsIGMgKVxuXG4gICAgaW4xYTAgPSBnLm11bCggeDEuaW4oIGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dCApLCBhMCApXG4gICAgeDFhMSAgPSBnLm11bCggeDIuaW4oIHgxLm91dCApLCBhMSApXG4gICAgeDJhMiAgPSBnLm11bCggeDIub3V0LCAgICAgICAgICBhMiApXG5cbiAgICBsZXQgc3VtTGVmdCA9IGcuYWRkKCBpbjFhMCwgeDFhMSwgeDJhMiApXG5cbiAgICB5MWIxID0gZy5tdWwoIHkyLmluKCB5MS5vdXQgKSwgYjEgKVxuICAgIHkyYjIgPSBnLm11bCggeTIub3V0LCBiMiApXG5cbiAgICBsZXQgc3VtUmlnaHQgPSBnLmFkZCggeTFiMSwgeTJiMiApXG5cbiAgICBsZXQgZGlmZiA9IGcuc3ViKCBzdW1MZWZ0LCBzdW1SaWdodCApXG5cbiAgICB5MS5pbiggZGlmZiApXG5cbiAgICBpZiggaXNTdGVyZW8gKSB7XG4gICAgICBsZXQgeDFfMSA9IGcuaGlzdG9yeSgpLCB4Ml8xID0gZy5oaXN0b3J5KCksIHkxXzEgPSBnLmhpc3RvcnkoKSwgeTJfMSA9IGcuaGlzdG9yeSgpXG5cbiAgICAgIGluMWEwXzEgPSBnLm11bCggeDFfMS5pbiggaW5wdXRbMV0gKSwgYTAgKVxuICAgICAgeDFhMV8xICA9IGcubXVsKCB4Ml8xLmluKCB4MV8xLm91dCApLCBhMSApXG4gICAgICB4MmEyXzEgID0gZy5tdWwoIHgyXzEub3V0LCAgICAgICAgICAgIGEyIClcblxuICAgICAgbGV0IHN1bUxlZnRfMSA9IGcuYWRkKCBpbjFhMF8xLCB4MWExXzEsIHgyYTJfMSApXG5cbiAgICAgIHkxYjFfMSA9IGcubXVsKCB5Ml8xLmluKCB5MV8xLm91dCApLCBiMSApXG4gICAgICB5MmIyXzEgPSBnLm11bCggeTJfMS5vdXQsIGIyIClcblxuICAgICAgbGV0IHN1bVJpZ2h0XzEgPSBnLmFkZCggeTFiMV8xLCB5MmIyXzEgKVxuXG4gICAgICBsZXQgZGlmZl8xID0gZy5zdWIoIHN1bUxlZnRfMSwgc3VtUmlnaHRfMSApXG5cbiAgICAgIHkxXzEuaW4oIGRpZmZfMSApXG4gICAgICBcbiAgICAgIHJldHVyblZhbHVlID0gWyBkaWZmLCBkaWZmXzEgXVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuVmFsdWUgPSBkaWZmXG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cblxuICBsZXQgQmlxdWFkID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgbGV0IGJpcXVhZCA9IE9iamVjdC5jcmVhdGUoIGZpbHRlciApXG4gICAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIEJpcXVhZC5kZWZhdWx0cywgaW5wdXRQcm9wcyApIFxuICAgIFxuICAgIE9iamVjdC5hc3NpZ24oIGJpcXVhZCwgcHJvcHMgKVxuXG4gICAgbGV0IGlzU3RlcmVvID0gYmlxdWFkLmlucHV0LmlzU3RlcmVvXG5cbiAgICBiaXF1YWQuX19jcmVhdGVHcmFwaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgYmlxdWFkLmdyYXBoID0gR2liYmVyaXNoLmdlbmlzaC5iaXF1YWQoIGcuaW4oJ2lucHV0JyksIGcubXVsKCBnLmluKCdjdXRvZmYnKSwgZy5nZW4uc2FtcGxlcmF0ZSAvIDQgKSwgIGcuaW4oJ1EnKSwgYmlxdWFkLm1vZGUsIGlzU3RlcmVvIClcbiAgICB9XG5cbiAgICBiaXF1YWQuX19jcmVhdGVHcmFwaCgpXG4gICAgYmlxdWFkLl9fcmVxdWlyZXNSZWNvbXBpbGF0aW9uID0gWyAnbW9kZScgXVxuXG4gICAgY29uc3QgX19vdXQgPSBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIGJpcXVhZCxcbiAgICAgIGJpcXVhZC5ncmFwaCxcbiAgICAgIFsnZmlsdGVycycsJ0ZpbHRlcjEyQmlxdWFkJ10sIFxuICAgICAgcHJvcHNcbiAgICApXG5cbiAgICByZXR1cm4gX19vdXRcbiAgfVxuXG4gIEJpcXVhZC5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIFE6IC4xNSxcbiAgICBjdXRvZmY6LjA1LFxuICAgIG1vZGU6MFxuICB9XG5cbiAgcmV0dXJuIEJpcXVhZFxuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5sZXQgY29tYkZpbHRlciA9IGZ1bmN0aW9uKCBfaW5wdXQsIGNvbWJMZW5ndGgsIGRhbXBpbmc9LjUqLjQsIGZlZWRiYWNrQ29lZmY9Ljg0ICkge1xuICBsZXQgbGFzdFNhbXBsZSAgID0gZy5oaXN0b3J5KCksXG4gIFx0ICByZWFkV3JpdGVJZHggPSBnLmNvdW50ZXIoIDEsMCxjb21iTGVuZ3RoICksXG4gICAgICBjb21iQnVmZmVyICAgPSBnLmRhdGEoIGNvbWJMZW5ndGggKSxcblx0ICAgIG91dCAgICAgICAgICA9IGcucGVlayggY29tYkJ1ZmZlciwgcmVhZFdyaXRlSWR4LCB7IGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pLFxuICAgICAgc3RvcmVJbnB1dCAgID0gZy5tZW1vKCBnLmFkZCggZy5tdWwoIG91dCwgZy5zdWIoIDEsIGRhbXBpbmcpKSwgZy5tdWwoIGxhc3RTYW1wbGUub3V0LCBkYW1waW5nICkgKSApXG4gICAgICBcbiAgbGFzdFNhbXBsZS5pbiggc3RvcmVJbnB1dCApXG4gXG4gIGcucG9rZSggY29tYkJ1ZmZlciwgZy5hZGQoIF9pbnB1dCwgZy5tdWwoIHN0b3JlSW5wdXQsIGZlZWRiYWNrQ29lZmYgKSApLCByZWFkV3JpdGVJZHggKVxuIFxuICByZXR1cm4gb3V0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29tYkZpbHRlclxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBmaWx0ZXIgPSByZXF1aXJlKCAnLi9maWx0ZXIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBHaWJiZXJpc2guZ2VuaXNoLmRpb2RlWkRGID0gKCBpbnB1dCwgX1EsIGZyZXEsIHNhdHVyYXRpb24sIGlzU3RlcmVvPWZhbHNlICkgPT4ge1xuICAgIGNvbnN0IGlUID0gMSAvIGcuZ2VuLnNhbXBsZXJhdGUsXG4gICAgICAgICAga3oxID0gZy5oaXN0b3J5KDApLFxuICAgICAgICAgIGt6MiA9IGcuaGlzdG9yeSgwKSxcbiAgICAgICAgICBrejMgPSBnLmhpc3RvcnkoMCksXG4gICAgICAgICAga3o0ID0gZy5oaXN0b3J5KDApXG5cbiAgICBsZXQgICBrYTEgPSAxLjAsXG4gICAgICAgICAga2EyID0gMC41LFxuICAgICAgICAgIGthMyA9IDAuNSxcbiAgICAgICAgICBrYTQgPSAwLjUsXG4gICAgICAgICAga2luZHggPSAwICAgXG5cbiAgICAvLyBYWFggdGhpcyBpcyB3aGVyZSB0aGUgbWFnaWMgbnVtYmVyIGhhcGVucyBmb3IgUS4uLlxuICAgIGNvbnN0IFEgPSBnLm1lbW8oIGcuYWRkKCAuNSwgZy5tdWwoIF9RLCBnLmFkZCggNSwgZy5zdWIoIDUsIGcubXVsKCBnLmRpdiggZnJlcSwgMjAwMDAgICksIDUgKSApICkgKSApIClcbiAgICAvLyBrd2QgPSAyICogJE1fUEkgKiBhY2Zba2luZHhdXG4gICAgY29uc3Qga3dkID0gZy5tZW1vKCBnLm11bCggTWF0aC5QSSAqIDIsIGZyZXEgKSApXG5cbiAgICAvLyBrd2EgPSAoMi9pVCkgKiB0YW4oa3dkICogaVQvMikgXG4gICAgY29uc3Qga3dhID1nLm1lbW8oIGcubXVsKCAyL2lULCBnLnRhbiggZy5tdWwoIGt3ZCwgaVQvMiApICkgKSApXG5cbiAgICAvLyBrRyAgPSBrd2EgKiBpVC8yIFxuICAgIGNvbnN0IGtnID0gZy5tZW1vKCBnLm11bCgga3dhLCBpVC8yICkgKVxuICAgIFxuICAgIGNvbnN0IGtHNCA9IGcubWVtbyggZy5tdWwoIC41LCBnLmRpdigga2csIGcuYWRkKCAxLCBrZyApICkgKSApXG4gICAgY29uc3Qga0czID0gZy5tZW1vKCBnLm11bCggLjUsIGcuZGl2KCBrZywgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCggZy5tdWwoIC41LCBrZyApLCBrRzQgKSApICkgKSApXG4gICAgY29uc3Qga0cyID0gZy5tZW1vKCBnLm11bCggLjUsIGcuZGl2KCBrZywgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCggZy5tdWwoIC41LCBrZyApLCBrRzMgKSApICkgKSApXG4gICAgY29uc3Qga0cxID0gZy5tZW1vKCBnLmRpdigga2csIGcuc3ViKCBnLmFkZCggMSwga2cgKSwgZy5tdWwoIGtnLCBrRzIgKSApICkgKVxuXG4gICAgY29uc3Qga0dBTU1BID0gZy5tZW1vKCBnLm11bCggZy5tdWwoIGtHNCwga0czICkgLCBnLm11bCgga0cyLCBrRzEgKSApIClcblxuICAgIGNvbnN0IGtTRzEgPSBnLm1lbW8oIGcubXVsKCBnLm11bCgga0c0LCBrRzMgKSwga0cyICkgKSBcblxuICAgIGNvbnN0IGtTRzIgPSBnLm1lbW8oIGcubXVsKCBrRzQsIGtHMykgKSAgXG4gICAgY29uc3Qga1NHMyA9IGtHNCBcbiAgICBsZXQga1NHNCA9IDEuMCBcbiAgICAvLyBrayA9IDQuMCooa1EgLSAwLjUpLygyNS4wIC0gMC41KVxuICAgIGNvbnN0IGthbHBoYSA9IGcubWVtbyggZy5kaXYoIGtnLCBnLmFkZCgxLjAsIGtnKSApIClcblxuICAgIGNvbnN0IGtiZXRhMSA9IGcubWVtbyggZy5kaXYoIDEuMCwgZy5zdWIoIGcuYWRkKCAxLCBrZyApLCBnLm11bCgga2csIGtHMiApICkgKSApXG4gICAgY29uc3Qga2JldGEyID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBnLm11bCggLjUsIGtnICksIGtHMyApICkgKSApXG4gICAgY29uc3Qga2JldGEzID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLnN1YiggZy5hZGQoIDEsIGtnICksIGcubXVsKCBnLm11bCggLjUsIGtnICksIGtHNCApICkgKSApXG4gICAgY29uc3Qga2JldGE0ID0gZy5tZW1vKCBnLmRpdiggMS4wLCBnLmFkZCggMSwga2cgKSApICkgXG5cbiAgICBjb25zdCBrZ2FtbWExID0gZy5tZW1vKCBnLmFkZCggMSwgZy5tdWwoIGtHMSwga0cyICkgKSApXG4gICAgY29uc3Qga2dhbW1hMiA9IGcubWVtbyggZy5hZGQoIDEsIGcubXVsKCBrRzIsIGtHMyApICkgKVxuICAgIGNvbnN0IGtnYW1tYTMgPSBnLm1lbW8oIGcuYWRkKCAxLCBnLm11bCgga0czLCBrRzQgKSApIClcblxuICAgIGNvbnN0IGtkZWx0YTEgPSBrZ1xuICAgIGNvbnN0IGtkZWx0YTIgPSBnLm1lbW8oIGcubXVsKCAwLjUsIGtnICkgKVxuICAgIGNvbnN0IGtkZWx0YTMgPSBnLm1lbW8oIGcubXVsKCAwLjUsIGtnICkgKVxuXG4gICAgY29uc3Qga2Vwc2lsb24xID0ga0cyXG4gICAgY29uc3Qga2Vwc2lsb24yID0ga0czXG4gICAgY29uc3Qga2Vwc2lsb24zID0ga0c0XG5cbiAgICBjb25zdCBrbGFzdGN1dCA9IGZyZXFcblxuICAgIC8vOzsgZmVlZGJhY2sgaW5wdXRzIFxuICAgIGNvbnN0IGtmYjQgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTQgLCBrejQub3V0ICkgKSBcbiAgICBjb25zdCBrZmIzID0gZy5tZW1vKCBnLm11bCgga2JldGEzLCBnLmFkZCgga3ozLm91dCwgZy5tdWwoIGtmYjQsIGtkZWx0YTMgKSApICkgKVxuICAgIGNvbnN0IGtmYjIgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTIsIGcuYWRkKCBrejIub3V0LCBnLm11bCgga2ZiMywga2RlbHRhMiApICkgKSApXG5cbiAgICAvLzs7IGZlZWRiYWNrIHByb2Nlc3NcblxuICAgIGNvbnN0IGtmYm8xID0gZy5tZW1vKCBnLm11bCgga2JldGExLCBnLmFkZCgga3oxLm91dCwgZy5tdWwoIGtmYjIsIGtkZWx0YTEgKSApICkgKSBcbiAgICBjb25zdCBrZmJvMiA9IGcubWVtbyggZy5tdWwoIGtiZXRhMiwgZy5hZGQoIGt6Mi5vdXQsIGcubXVsKCBrZmIzLCBrZGVsdGEyICkgKSApICkgXG4gICAgY29uc3Qga2ZibzMgPSBnLm1lbW8oIGcubXVsKCBrYmV0YTMsIGcuYWRkKCBrejMub3V0LCBnLm11bCgga2ZiNCwga2RlbHRhMyApICkgKSApIFxuICAgIGNvbnN0IGtmYm80ID0ga2ZiNFxuXG4gICAgY29uc3Qga1NJR01BID0gZy5tZW1vKCBcbiAgICAgIGcuYWRkKCBcbiAgICAgICAgZy5hZGQoIFxuICAgICAgICAgIGcubXVsKCBrU0cxLCBrZmJvMSApLCBcbiAgICAgICAgICBnLm11bCgga1NHMiwga2ZibzIgKVxuICAgICAgICApLCBcbiAgICAgICAgZy5hZGQoXG4gICAgICAgICAgZy5tdWwoIGtTRzMsIGtmYm8zICksIFxuICAgICAgICAgIGcubXVsKCBrU0c0LCBrZmJvNCApXG4gICAgICAgICkgXG4gICAgICApIFxuICAgIClcblxuICAgIC8vY29uc3Qga1NJR01BID0gMVxuICAgIC8vOzsgbm9uLWxpbmVhciBwcm9jZXNzaW5nXG4gICAgLy9pZiAoa25scCA9PSAxKSB0aGVuXG4gICAgLy8gIGtpbiA9ICgxLjAgLyB0YW5oKGtzYXR1cmF0aW9uKSkgKiB0YW5oKGtzYXR1cmF0aW9uICoga2luKVxuICAgIC8vZWxzZWlmIChrbmxwID09IDIpIHRoZW5cbiAgICAvLyAga2luID0gdGFuaChrc2F0dXJhdGlvbiAqIGtpbikgXG4gICAgLy9lbmRpZlxuICAgIC8vXG4gICAgLy9jb25zdCBraW4gPSBpbnB1dCBcbiAgICBsZXQga2luID0gaW5wdXQvL2cubWVtbyggZy5tdWwoIGcuZGl2KCAxLCBnLnRhbmgoIHNhdHVyYXRpb24gKSApLCBnLnRhbmgoIGcubXVsKCBzYXR1cmF0aW9uLCBpbnB1dCApICkgKSApXG4gICAga2luID0gZy50YW5oKCBnLm11bCggc2F0dXJhdGlvbiwga2luICkgKVxuXG4gICAgY29uc3Qga3VuID0gZy5kaXYoIGcuc3ViKCBraW4sIGcubXVsKCBRLCBrU0lHTUEgKSApLCBnLmFkZCggMSwgZy5tdWwoIFEsIGtHQU1NQSApICkgKVxuICAgIC8vY29uc3Qga3VuID0gZy5kaXYoIDEsIGcuYWRkKCAxLCBnLm11bCggUSwga0dBTU1BICkgKSApXG4gICAgICAgIC8vKGtpbiAtIGtrICoga1NJR01BKSAvICgxLjAgKyBrayAqIGtHQU1NQSlcblxuICAgIC8vOzsgMXN0IHN0YWdlXG4gICAgbGV0IGt4aW4gPSBnLm1lbW8oIGcuYWRkKCBnLmFkZCggZy5tdWwoIGt1biwga2dhbW1hMSApLCBrZmIyKSwgZy5tdWwoIGtlcHNpbG9uMSwga2ZibzEgKSApIClcbiAgICAvLyAoa3VuICoga2dhbW1hMSArIGtmYjIgKyBrZXBzaWxvbjEgKiBrZmJvMSlcbiAgICBsZXQga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthMSwga3hpbiApLCBrejEub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGxldCBrbHAgPSBnLmFkZCgga3YsIGt6MS5vdXQgKVxuICAgIC8va2xwID0ga3YgKyBrejFcbiAgICBrejEuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKSBcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAgICAgLy87OyAybmQgc3RhZ2VcbiAgICAvL2t4aW4gPSAoa2xwICoga2dhbW1hMiArIGtmYjMgKyBrZXBzaWxvbjIgKiBrZmJvMilcbiAgICAvL2t2ID0gKGthMiAqIGt4aW4gLSBrejIpICoga2FscGhhIFxuICAgIC8va2xwID0ga3YgKyBrejJcbiAgICAvL2t6MiA9IGtscCArIGt2XG5cbiAgICBreGluID0gZy5tZW1vKCBnLmFkZCggZy5hZGQoIGcubXVsKCBrbHAsIGtnYW1tYTIgKSwga2ZiMyksIGcubXVsKCBrZXBzaWxvbjIsIGtmYm8yICkgKSApXG4gICAgLy8gKGt1biAqIGtnYW1tYTEgKyBrZmIyICsga2Vwc2lsb24xICoga2ZibzEpXG4gICAga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthMiwga3hpbiApLCBrejIub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGtscCA9IGcuYWRkKCBrdiwga3oyLm91dCApIFxuICAgIC8va2xwID0ga3YgKyBrejFcbiAgICBrejIuaW4oIGcuYWRkKCBrbHAsIGt2ICkgKSBcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAvLzs7IDNyZCBzdGFnZVxuICAgIC8va3hpbiA9IChrbHAgKiBrZ2FtbWEzICsga2ZiNCArIGtlcHNpbG9uMyAqIGtmYm8zKVxuICAgIC8va3YgPSAoa2EzICoga3hpbiAtIGt6MykgKiBrYWxwaGEgXG4gICAgLy9rbHAgPSBrdiArIGt6M1xuICAgIC8va3ozID0ga2xwICsga3ZcblxuICAgIGt4aW4gPSBnLm1lbW8oIGcuYWRkKCBnLmFkZCggZy5tdWwoIGtscCwga2dhbW1hMyApLCBrZmI0KSwgZy5tdWwoIGtlcHNpbG9uMywga2ZibzMgKSApIClcbiAgICAvLyAoa3VuICoga2dhbW1hMSArIGtmYjIgKyBrZXBzaWxvbjEgKiBrZmJvMSlcbiAgICBrdiA9IGcubWVtbyggZy5tdWwoIGcuc3ViKCBnLm11bCgga2EzLCBreGluICksIGt6My5vdXQgKSwga2FscGhhICkgKVxuICAgIC8va3YgPSAoa2ExICoga3hpbiAtIGt6MSkgKiBrYWxwaGEgXG4gICAga2xwID0gZy5hZGQoIGt2LCBrejMub3V0IClcbiAgICAvL2tscCA9IGt2ICsga3oxXG4gICAga3ozLmluKCBnLmFkZCgga2xwLCBrdiApIClcbiAgICAvL2t6MSA9IGtscCArIGt2XG5cbiAgICAvLzs7IDR0aCBzdGFnZVxuICAgIC8va3YgPSAoa2E0ICoga2xwIC0ga3o0KSAqIGthbHBoYSBcbiAgICAvL2tscCA9IGt2ICsga3o0XG4gICAgLy9rejQgPSBrbHAgKyBrdlxuXG4gICAgLy8gKGt1biAqIGtnYW1tYTEgKyBrZmIyICsga2Vwc2lsb24xICoga2ZibzEpXG4gICAga3YgPSBnLm1lbW8oIGcubXVsKCBnLnN1YiggZy5tdWwoIGthNCwga3hpbiApLCBrejQub3V0ICksIGthbHBoYSApIClcbiAgICAvL2t2ID0gKGthMSAqIGt4aW4gLSBrejEpICoga2FscGhhIFxuICAgIGtscCA9IGcuYWRkKCBrdiwga3o0Lm91dCApXG4gICAgLy9rbHAgPSBrdiArIGt6MVxuICAgIGt6NC5pbiggZy5hZGQoIGtscCwga3YgKSApXG5cbiAgICAvL2t6MSA9IGtscCArIGt2XG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgLy9sZXQgcG9sZXNSID0gZy5kYXRhKFsgMCwwLDAsMCBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgIC8vICAgIHJlenpSID0gZy5jbGFtcCggZy5tdWwoIHBvbGVzUlszXSwgcmV6ICkgKSxcbiAgICAgIC8vICAgIG91dHB1dFIgPSBnLnN1YiggaW5wdXRbMV0sIHJlenpSICkgICAgICAgICBcblxuICAgICAgLy9wb2xlc1JbMF0gPSBnLmFkZCggcG9sZXNSWzBdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMF0gKSwgb3V0cHV0UiAgICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMV0gPSBnLmFkZCggcG9sZXNSWzFdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMV0gKSwgcG9sZXNSWzBdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbMl0gPSBnLmFkZCggcG9sZXNSWzJdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMl0gKSwgcG9sZXNSWzFdICksIGN1dG9mZiApKVxuICAgICAgLy9wb2xlc1JbM10gPSBnLmFkZCggcG9sZXNSWzNdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbM10gKSwgcG9sZXNSWzJdICksIGN1dG9mZiApKVxuXG4gICAgICAvL2xldCByaWdodCA9IGcuc3dpdGNoKCBpc0xvd1Bhc3MsIHBvbGVzUlszXSwgZy5zdWIoIG91dHB1dFIsIHBvbGVzUlszXSApIClcblxuICAgICAgLy9yZXR1cm5WYWx1ZSA9IFtsZWZ0LCByaWdodF1cbiAgICB9ZWxzZXtcbiAgICAgLy8gcmV0dXJuVmFsdWUgPSBrbHBcbiAgICB9XG4gICAgLy9yZXR1cm5WYWx1ZSA9IGtscFxuICAgIFxuICAgIHJldHVybiBrbHAvL3JldHVyblZhbHVlLy8ga2xwLy9yZXR1cm5WYWx1ZVxuIH1cblxuICBjb25zdCBEaW9kZVpERiA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGNvbnN0IHpkZiAgICAgID0gT2JqZWN0LmNyZWF0ZSggZmlsdGVyIClcbiAgICBjb25zdCBwcm9wcyAgICA9IE9iamVjdC5hc3NpZ24oIHt9LCBEaW9kZVpERi5kZWZhdWx0cywgZmlsdGVyLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBjb25zdCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvIFxuXG4gICAgT2JqZWN0LmFzc2lnbiggemRmLCBwcm9wcyApXG5cbiAgICBjb25zdCBfX291dCA9IEdpYmJlcmlzaC5mYWN0b3J5KFxuICAgICAgemRmLCBcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guZGlvZGVaREYoIGcuaW4oJ2lucHV0JyksIGcuaW4oJ1EnKSwgZy5pbignY3V0b2ZmJyksIGcuaW4oJ3NhdHVyYXRpb24nKSwgaXNTdGVyZW8gKSwgXG4gICAgICBbJ2ZpbHRlcnMnLCdGaWx0ZXIyNFRCMzAzJ10sXG4gICAgICBwcm9wc1xuICAgIClcblxuICAgIHJldHVybiBfX291dCBcbiAgfVxuXG4gIERpb2RlWkRGLmRlZmF1bHRzID0ge1xuICAgIGlucHV0OjAsXG4gICAgUTogLjY1LFxuICAgIHNhdHVyYXRpb246IDEsXG4gICAgY3V0b2ZmOi41IFxuICB9XG5cbiAgcmV0dXJuIERpb2RlWkRGXG5cbn1cbiIsImxldCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnIClcblxubGV0IGZpbHRlciA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG5PYmplY3QuYXNzaWduKCBmaWx0ZXIsIHtcbiAgZGVmYXVsdHM6IHsgYnlwYXNzOmZhbHNlIH0gXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZpbHRlclxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGZpbHRlciA9IHJlcXVpcmUoICcuL2ZpbHRlci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgR2liYmVyaXNoLmdlbmlzaC5maWx0ZXIyNCA9ICggaW5wdXQsIF9yZXosIF9jdXRvZmYsIGlzTG93UGFzcywgaXNTdGVyZW89ZmFsc2UgKSA9PiB7XG4gICAgbGV0IHJldHVyblZhbHVlLFxuICAgICAgICBwb2xlc0wgPSBnLmRhdGEoWyAwLDAsMCwwIF0sIDEsIHsgbWV0YTp0cnVlIH0pLFxuICAgICAgICBwZWVrUHJvcHMgPSB7IGludGVycDonbm9uZScsIG1vZGU6J3NpbXBsZScgfSxcbiAgICAgICAgcmV6ID0gZy5tZW1vKCBnLm11bCggX3JleiwgNSApICksXG4gICAgICAgIGN1dG9mZiA9IGcubWVtbyggZy5kaXYoIF9jdXRvZmYsIDExMDI1ICkgKSxcbiAgICAgICAgcmV6ekwgPSBnLmNsYW1wKCBnLm11bCggcG9sZXNMWzNdLCByZXogKSApLFxuICAgICAgICBvdXRwdXRMID0gZy5zdWIoIGlzU3RlcmVvID8gaW5wdXRbMF0gOiBpbnB1dCwgcmV6ekwgKSBcblxuICAgIHBvbGVzTFswXSA9IGcuYWRkKCBwb2xlc0xbMF0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzTFswXSApLCBvdXRwdXRMICAgKSwgY3V0b2ZmICkpXG4gICAgcG9sZXNMWzFdID0gZy5hZGQoIHBvbGVzTFsxXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNMWzFdICksIHBvbGVzTFswXSApLCBjdXRvZmYgKSlcbiAgICBwb2xlc0xbMl0gPSBnLmFkZCggcG9sZXNMWzJdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc0xbMl0gKSwgcG9sZXNMWzFdICksIGN1dG9mZiApKVxuICAgIHBvbGVzTFszXSA9IGcuYWRkKCBwb2xlc0xbM10sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzTFszXSApLCBwb2xlc0xbMl0gKSwgY3V0b2ZmICkpXG4gICAgXG4gICAgbGV0IGxlZnQgPSBnLnN3aXRjaCggaXNMb3dQYXNzLCBwb2xlc0xbM10sIGcuc3ViKCBvdXRwdXRMLCBwb2xlc0xbM10gKSApXG5cbiAgICBpZiggaXNTdGVyZW8gKSB7XG4gICAgICBsZXQgcG9sZXNSID0gZy5kYXRhKFsgMCwwLDAsMCBdLCAxLCB7IG1ldGE6dHJ1ZSB9KSxcbiAgICAgICAgICByZXp6UiA9IGcuY2xhbXAoIGcubXVsKCBwb2xlc1JbM10sIHJleiApICksXG4gICAgICAgICAgb3V0cHV0UiA9IGcuc3ViKCBpbnB1dFsxXSwgcmV6elIgKSAgICAgICAgIFxuXG4gICAgICBwb2xlc1JbMF0gPSBnLmFkZCggcG9sZXNSWzBdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbMF0gKSwgb3V0cHV0UiAgICksIGN1dG9mZiApKVxuICAgICAgcG9sZXNSWzFdID0gZy5hZGQoIHBvbGVzUlsxXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNSWzFdICksIHBvbGVzUlswXSApLCBjdXRvZmYgKSlcbiAgICAgIHBvbGVzUlsyXSA9IGcuYWRkKCBwb2xlc1JbMl0sIGcubXVsKCBnLmFkZCggZy5tdWwoLTEsIHBvbGVzUlsyXSApLCBwb2xlc1JbMV0gKSwgY3V0b2ZmICkpXG4gICAgICBwb2xlc1JbM10gPSBnLmFkZCggcG9sZXNSWzNdLCBnLm11bCggZy5hZGQoIGcubXVsKC0xLCBwb2xlc1JbM10gKSwgcG9sZXNSWzJdICksIGN1dG9mZiApKVxuXG4gICAgICBsZXQgcmlnaHQgPSBnLnN3aXRjaCggaXNMb3dQYXNzLCBwb2xlc1JbM10sIGcuc3ViKCBvdXRwdXRSLCBwb2xlc1JbM10gKSApXG5cbiAgICAgIHJldHVyblZhbHVlID0gW2xlZnQsIHJpZ2h0XVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuVmFsdWUgPSBsZWZ0XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cblxuICBsZXQgRmlsdGVyMjQgPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgZmlsdGVyMjQgICA9IE9iamVjdC5jcmVhdGUoIGZpbHRlciApXG4gICAgbGV0IHByb3BzICAgID0gT2JqZWN0LmFzc2lnbigge30sIEZpbHRlcjI0LmRlZmF1bHRzLCBmaWx0ZXIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgIGxldCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvIFxuXG4gICAgY29uc3QgX19vdXQgPSBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIGZpbHRlcjI0LCBcbiAgICAgIEdpYmJlcmlzaC5nZW5pc2guZmlsdGVyMjQoIGcuaW4oJ2lucHV0JyksIGcuaW4oJ1EnKSwgZy5pbignY3V0b2ZmJyksIGcuaW4oJ2lzTG93UGFzcycpLCBpc1N0ZXJlbyApLCBcbiAgICAgIFsnZmlsdGVycycsJ0ZpbHRlcjI0Q2xhc3NpYyddLFxuICAgICAgcHJvcHNcbiAgICApXG5cbiAgICByZXR1cm4gX19vdXRcbiAgfVxuXG5cbiAgRmlsdGVyMjQuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6MCxcbiAgICBROiAuMjUsXG4gICAgY3V0b2ZmOiA4ODAsXG4gICAgaXNMb3dQYXNzOjFcbiAgfVxuXG4gIHJldHVybiBGaWx0ZXIyNFxuXG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBnID0gR2liYmVyaXNoLmdlbmlzaFxuXG4gIGNvbnN0IGZpbHRlcnMgPSB7XG4gICAgRmlsdGVyMjRDbGFzc2ljIDogcmVxdWlyZSggJy4vZmlsdGVyMjQuanMnICApKCBHaWJiZXJpc2ggKSxcbiAgICBGaWx0ZXIyNE1vb2cgICAgOiByZXF1aXJlKCAnLi9sYWRkZXJGaWx0ZXJaZXJvRGVsYXkuanMnICkoIEdpYmJlcmlzaCApLFxuICAgIEZpbHRlcjI0VEIzMDMgICA6IHJlcXVpcmUoICcuL2Rpb2RlRmlsdGVyWkRGLmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgICBGaWx0ZXIxMkJpcXVhZCAgOiByZXF1aXJlKCAnLi9iaXF1YWQuanMnICAgICkoIEdpYmJlcmlzaCApLFxuICAgIEZpbHRlcjEyU1ZGICAgICA6IHJlcXVpcmUoICcuL3N2Zi5qcycgICAgICAgKSggR2liYmVyaXNoICksXG4gICAgXG4gICAgLy8gbm90IGZvciB1c2UgYnkgZW5kLXVzZXJzXG4gICAgZ2VuaXNoOiB7XG4gICAgICBDb21iICAgICAgICA6IHJlcXVpcmUoICcuL2NvbWJmaWx0ZXIuanMnICksXG4gICAgICBBbGxQYXNzICAgICA6IHJlcXVpcmUoICcuL2FsbHBhc3MuanMnIClcbiAgICB9LFxuXG4gICAgZmFjdG9yeSggaW5wdXQsIGN1dG9mZiwgcmVzb25hbmNlLCBzYXR1cmF0aW9uID0gbnVsbCwgX3Byb3BzLCBpc1N0ZXJlbyA9IGZhbHNlICkge1xuICAgICAgbGV0IGZpbHRlcmVkT3NjIFxuXG4gICAgICAvL2lmKCBwcm9wcy5maWx0ZXJUeXBlID09PSAxICkge1xuICAgICAgLy8gIGlmKCB0eXBlb2YgcHJvcHMuY3V0b2ZmICE9PSAnb2JqZWN0JyAmJiBwcm9wcy5jdXRvZmYgPiAxICkge1xuICAgICAgLy8gICAgcHJvcHMuY3V0b2ZmID0gLjI1XG4gICAgICAvLyAgfVxuICAgICAgLy8gIGlmKCB0eXBlb2YgcHJvcHMuY3V0b2ZmICE9PSAnb2JqZWN0JyAmJiBwcm9wcy5maWx0ZXJNdWx0ID4gLjUgKSB7XG4gICAgICAvLyAgICBwcm9wcy5maWx0ZXJNdWx0ID0gLjFcbiAgICAgIC8vICB9XG4gICAgICAvL31cbiAgICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGZpbHRlcnMuZGVmYXVsdHMsIF9wcm9wcyApXG5cbiAgICAgIHN3aXRjaCggcHJvcHMuZmlsdGVyVHlwZSApIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gZy56ZDI0KCBpbnB1dCwgZy5taW4oIGcuaW4oJ1EnKSwgLjk5OTkgKSwgIGcubWluKCBjdXRvZmYsIDIwMDAwICkgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBnLmRpb2RlWkRGKCBpbnB1dCwgZy5taW4oIGcuaW4oJ1EnKSwgLjk5OTkgKSwgZy5taW4oIGN1dG9mZiwgMjAwMDAgKSwgZy5pbignc2F0dXJhdGlvbicpLCBpc1N0ZXJlbyApIFxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBnLnN2ZiggaW5wdXQsIGN1dG9mZiwgZy5zdWIoIDEsIGcuaW4oJ1EnKSksIHByb3BzLmZpbHRlck1vZGUsIGlzU3RlcmVvICkgXG4gICAgICAgICAgYnJlYWs7IFxuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBnLmJpcXVhZCggaW5wdXQsIGN1dG9mZiwgIGcuaW4oJ1EnKSwgcHJvcHMuZmlsdGVyTW9kZSwgaXNTdGVyZW8gKSBcbiAgICAgICAgICBicmVhazsgXG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAvL2lzTG93UGFzcyA9IGcucGFyYW0oICdsb3dQYXNzJywgMSApLFxuICAgICAgICAgIGZpbHRlcmVkT3NjID0gZy5maWx0ZXIyNCggaW5wdXQsIGcuaW4oJ1EnKSwgY3V0b2ZmLCBwcm9wcy5maWx0ZXJNb2RlLCBpc1N0ZXJlbyApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy8gcmV0dXJuIHVuZmlsdGVyZWQgc2lnbmFsXG4gICAgICAgICAgZmlsdGVyZWRPc2MgPSBpbnB1dCAvL2cuZmlsdGVyMjQoIG9zY1dpdGhHYWluLCBnLmluKCdyZXNvbmFuY2UnKSwgY3V0b2ZmLCBpc0xvd1Bhc3MgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmlsdGVyZWRPc2NcbiAgICB9LFxuXG4gICAgZGVmYXVsdHM6IHsgZmlsdGVyTW9kZTogMCwgZmlsdGVyVHlwZTowIH1cbiAgfVxuXG4gIGZpbHRlcnMuZXhwb3J0ID0gdGFyZ2V0ID0+IHtcbiAgICBmb3IoIGxldCBrZXkgaW4gZmlsdGVycyApIHtcbiAgICAgIGlmKCBrZXkgIT09ICdleHBvcnQnICYmIGtleSAhPT0gJ2dlbmlzaCcgKSB7XG4gICAgICAgIHRhcmdldFsga2V5IF0gPSBmaWx0ZXJzWyBrZXkgXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5yZXR1cm4gZmlsdGVyc1xuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGZpbHRlclByb3RvID0gcmVxdWlyZSggJy4vZmlsdGVyLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBHaWJiZXJpc2guZ2VuaXNoLnpkMjQgPSAoIGlucHV0LCBfUSwgZnJlcSwgaXNTdGVyZW89ZmFsc2UgKSA9PiB7XG4gICAgY29uc3QgaVQgPSAxIC8gZy5nZW4uc2FtcGxlcmF0ZSxcbiAgICAgICAgICB6MSA9IGcuaGlzdG9yeSgwKSxcbiAgICAgICAgICB6MiA9IGcuaGlzdG9yeSgwKSxcbiAgICAgICAgICB6MyA9IGcuaGlzdG9yeSgwKSxcbiAgICAgICAgICB6NCA9IGcuaGlzdG9yeSgwKVxuICAgIFxuICAgIGNvbnN0IFEgPSBnLm1lbW8oIGcuYWRkKCAuNSwgZy5tdWwoIF9RLCAyMyApICkgKVxuICAgIC8vIGt3ZCA9IDIgKiAkTV9QSSAqIGFjZltraW5keF1cbiAgICBjb25zdCBrd2QgPSBnLm1lbW8oIGcubXVsKCBNYXRoLlBJICogMiwgZnJlcSApIClcblxuICAgIC8vIGt3YSA9ICgyL2lUKSAqIHRhbihrd2QgKiBpVC8yKSBcbiAgICBjb25zdCBrd2EgPWcubWVtbyggZy5tdWwoIDIvaVQsIGcudGFuKCBnLm11bCgga3dkLCBpVC8yICkgKSApIClcblxuICAgIC8vIGtHICA9IGt3YSAqIGlULzIgXG4gICAgY29uc3Qga2cgPSBnLm1lbW8oIGcubXVsKCBrd2EsIGlULzIgKSApXG5cbiAgICAvLyBrayA9IDQuMCooa1EgLSAwLjUpLygyNS4wIC0gMC41KVxuICAgIGNvbnN0IGtrID0gZy5tZW1vKCBnLm11bCggNCwgZy5kaXYoIGcuc3ViKCBRLCAuNSApLCAyNC41ICkgKSApXG5cbiAgICAvLyBrZ19wbHVzXzEgPSAoMS4wICsga2cpXG4gICAgY29uc3Qga2dfcGx1c18xID0gZy5hZGQoIDEsIGtnIClcblxuICAgIC8vIGtHID0ga2cgLyBrZ19wbHVzXzEgXG4gICAgY29uc3Qga0cgICAgID0gZy5tZW1vKCBnLmRpdigga2csIGtnX3BsdXNfMSApICksXG4gICAgICAgICAga0dfMiAgID0gZy5tZW1vKCBnLm11bCgga0csIGtHICkgKSxcbiAgICAgICAgICBrR18zICAgPSBnLm11bCgga0dfMiwga0cgKSxcbiAgICAgICAgICBrR0FNTUEgPSBnLm11bCgga0dfMiwga0dfMiApXG5cbiAgICBjb25zdCBrUzEgPSBnLmRpdiggejEub3V0LCBrZ19wbHVzXzEgKSxcbiAgICAgICAgICBrUzIgPSBnLmRpdiggejIub3V0LCBrZ19wbHVzXzEgKSxcbiAgICAgICAgICBrUzMgPSBnLmRpdiggejMub3V0LCBrZ19wbHVzXzEgKSxcbiAgICAgICAgICBrUzQgPSBnLmRpdiggejQub3V0LCBrZ19wbHVzXzEgKVxuXG4gICAgLy9rUyA9IGtHXzMgKiBrUzEgICsga0dfMiAqIGtTMiArIGtHICoga1MzICsga1M0IFxuICAgIGNvbnN0IGtTID0gZy5tZW1vKCBcbiAgICAgIGcuYWRkKFxuICAgICAgICBnLmFkZCggZy5tdWwoa0dfMywga1MxKSwgZy5tdWwoIGtHXzIsIGtTMikgKSxcbiAgICAgICAgZy5hZGQoIGcubXVsKGtHLCBrUzMpLCBrUzQgKVxuICAgICAgKVxuICAgIClcblxuICAgIC8va3UgPSAoa2luIC0ga2sgKiAga1MpIC8gKDEgKyBrayAqIGtHQU1NQSlcbiAgICBjb25zdCBrdTEgPSBnLnN1YiggaW5wdXQsIGcubXVsKCBraywga1MgKSApXG4gICAgY29uc3Qga3UyID0gZy5tZW1vKCBnLmFkZCggMSwgZy5tdWwoIGtrLCBrR0FNTUEgKSApIClcbiAgICBjb25zdCBrdSAgPSBnLm1lbW8oIGcuZGl2KCBrdTEsIGt1MiApIClcblxuICAgIGxldCBrdiA9ICBnLm1lbW8oIGcubXVsKCBnLnN1Yigga3UsIHoxLm91dCApLCBrRyApIClcbiAgICBsZXQga2xwID0gZy5tZW1vKCBnLmFkZCgga3YsIHoxLm91dCApIClcbiAgICB6MS5pbiggZy5hZGQoIGtscCwga3YgKSApXG5cbiAgICBrdiAgPSBnLm1lbW8oIGcubXVsKCBnLnN1Yigga2xwLCB6Mi5vdXQgKSwga0cgKSApXG4gICAga2xwID0gZy5tZW1vKCBnLmFkZCgga3YsIHoyLm91dCApIClcbiAgICB6Mi5pbiggZy5hZGQoIGtscCwga3YgKSApXG5cbiAgICBrdiAgPSBnLm1lbW8oIGcubXVsKCBnLnN1Yigga2xwLCB6My5vdXQgKSwga0cgKSApXG4gICAga2xwID0gZy5tZW1vKCBnLmFkZCgga3YsIHozLm91dCApIClcbiAgICB6My5pbiggZy5hZGQoIGtscCwga3YgKSApXG5cbiAgICBrdiAgPSBnLm1lbW8oIGcubXVsKCBnLnN1Yigga2xwLCB6NC5vdXQgKSwga0cgKSApXG4gICAga2xwID0gZy5tZW1vKCBnLmFkZCgga3YsIHo0Lm91dCApIClcbiAgICB6NC5pbiggZy5hZGQoIGtscCwga3YgKSApXG5cblxuICAgIGlmKCBpc1N0ZXJlbyApIHtcbiAgICAgIC8vbGV0IHBvbGVzUiA9IGcuZGF0YShbIDAsMCwwLDAgXSwgMSwgeyBtZXRhOnRydWUgfSksXG4gICAgICAvLyAgICByZXp6UiA9IGcuY2xhbXAoIGcubXVsKCBwb2xlc1JbM10sIHJleiApICksXG4gICAgICAvLyAgICBvdXRwdXRSID0gZy5zdWIoIGlucHV0WzFdLCByZXp6UiApICAgICAgICAgXG5cbiAgICAgIC8vcG9sZXNSWzBdID0gZy5hZGQoIHBvbGVzUlswXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNSWzBdICksIG91dHB1dFIgICApLCBjdXRvZmYgKSlcbiAgICAgIC8vcG9sZXNSWzFdID0gZy5hZGQoIHBvbGVzUlsxXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNSWzFdICksIHBvbGVzUlswXSApLCBjdXRvZmYgKSlcbiAgICAgIC8vcG9sZXNSWzJdID0gZy5hZGQoIHBvbGVzUlsyXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNSWzJdICksIHBvbGVzUlsxXSApLCBjdXRvZmYgKSlcbiAgICAgIC8vcG9sZXNSWzNdID0gZy5hZGQoIHBvbGVzUlszXSwgZy5tdWwoIGcuYWRkKCBnLm11bCgtMSwgcG9sZXNSWzNdICksIHBvbGVzUlsyXSApLCBjdXRvZmYgKSlcblxuICAgICAgLy9sZXQgcmlnaHQgPSBnLnN3aXRjaCggaXNMb3dQYXNzLCBwb2xlc1JbM10sIGcuc3ViKCBvdXRwdXRSLCBwb2xlc1JbM10gKSApXG5cbiAgICAgIC8vcmV0dXJuVmFsdWUgPSBbbGVmdCwgcmlnaHRdXG4gICAgfS8vZWxzZXtcbiAgICAgIC8vcmV0dXJuVmFsdWUgPSBrbHBcbiAgICAvL31cblxuICAgIHJldHVybiBrbHAvL3JldHVyblZhbHVlXG4gIH1cblxuICBjb25zdCBaZDI0ID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgY29uc3QgZmlsdGVyICAgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXJQcm90byApXG4gICAgY29uc3QgcHJvcHMgICAgPSBPYmplY3QuYXNzaWduKCB7fSwgWmQyNC5kZWZhdWx0cywgZmlsdGVyLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBjb25zdCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvIFxuXG4gICAgY29uc3QgX19vdXQgPSBHaWJiZXJpc2guZmFjdG9yeShcbiAgICAgIGZpbHRlciwgXG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLnpkMjQoIGcuaW4oJ2lucHV0JyksIGcuaW4oJ1EnKSwgZy5pbignY3V0b2ZmJyksIGlzU3RlcmVvICksIFxuICAgICAgWydmaWx0ZXJzJywnRmlsdGVyMjRNb29nJ10sXG4gICAgICBwcm9wc1xuICAgIClcblxuICAgIHJldHVybiBfX291dFxuICB9XG5cblxuICBaZDI0LmRlZmF1bHRzID0ge1xuICAgIGlucHV0OjAsXG4gICAgUTogLjc1LFxuICAgIGN1dG9mZjogNDQwLFxuICB9XG5cbiAgcmV0dXJuIFpkMjRcblxufVxuXG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGZpbHRlciA9IHJlcXVpcmUoICcuL2ZpbHRlci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIEdpYmJlcmlzaC5nZW5pc2guc3ZmID0gKCBpbnB1dCwgY3V0b2ZmLCBRLCBtb2RlLCBpc1N0ZXJlbyApID0+IHtcbiAgICBsZXQgZDEgPSBnLmRhdGEoWzAsMF0sIDEsIHsgbWV0YTp0cnVlIH0pLCBkMiA9IGcuZGF0YShbMCwwXSwgMSwgeyBtZXRhOnRydWUgfSksXG4gICAgICAgIHBlZWtQcm9wcyA9IHsgbW9kZTonc2ltcGxlJywgaW50ZXJwOidub25lJyB9XG5cbiAgICBsZXQgZjEgPSBnLm1lbW8oIGcubXVsKCAyICogTWF0aC5QSSwgZy5kaXYoIGN1dG9mZiwgZy5nZW4uc2FtcGxlcmF0ZSApICkgKVxuICAgIGxldCBvbmVPdmVyUSA9IGcubWVtbyggZy5kaXYoIDEsIFEgKSApXG4gICAgbGV0IGwgPSBnLm1lbW8oIGcuYWRkKCBkMlswXSwgZy5tdWwoIGYxLCBkMVswXSApICkgKSxcbiAgICAgICAgaCA9IGcubWVtbyggZy5zdWIoIGcuc3ViKCBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXQsIGwgKSwgZy5tdWwoIFEsIGQxWzBdICkgKSApLFxuICAgICAgICBiID0gZy5tZW1vKCBnLmFkZCggZy5tdWwoIGYxLCBoICksIGQxWzBdICkgKSxcbiAgICAgICAgbiA9IGcubWVtbyggZy5hZGQoIGgsIGwgKSApXG5cbiAgICBkMVswXSA9IGJcbiAgICBkMlswXSA9IGxcblxuICAgIGxldCBvdXQgPSBnLnNlbGVjdG9yKCBtb2RlLCBsLCBoLCBiLCBuIClcblxuICAgIGxldCByZXR1cm5WYWx1ZVxuICAgIGlmKCBpc1N0ZXJlbyApIHtcbiAgICAgIGxldCBkMTIgPSBnLmRhdGEoWzAsMF0sIDEsIHsgbWV0YTp0cnVlIH0pLCBkMjIgPSBnLmRhdGEoWzAsMF0sIDEsIHsgbWV0YTp0cnVlIH0pXG4gICAgICBsZXQgbDIgPSBnLm1lbW8oIGcuYWRkKCBkMjJbMF0sIGcubXVsKCBmMSwgZDEyWzBdICkgKSApLFxuICAgICAgICAgIGgyID0gZy5tZW1vKCBnLnN1YiggZy5zdWIoIGlucHV0WzFdLCBsMiApLCBnLm11bCggUSwgZDEyWzBdICkgKSApLFxuICAgICAgICAgIGIyID0gZy5tZW1vKCBnLmFkZCggZy5tdWwoIGYxLCBoMiApLCBkMTJbMF0gKSApLFxuICAgICAgICAgIG4yID0gZy5tZW1vKCBnLmFkZCggaDIsIGwyICkgKVxuXG4gICAgICBkMTJbMF0gPSBiMlxuICAgICAgZDIyWzBdID0gbDJcblxuICAgICAgbGV0IG91dDIgPSBnLnNlbGVjdG9yKCBtb2RlLCBsMiwgaDIsIGIyLCBuMiApXG5cbiAgICAgIHJldHVyblZhbHVlID0gWyBvdXQsIG91dDIgXVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuVmFsdWUgPSBvdXRcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxuXG4gIGxldCBTVkYgPSBpbnB1dFByb3BzID0+IHtcbiAgICBjb25zdCBzdmYgPSBPYmplY3QuY3JlYXRlKCBmaWx0ZXIgKVxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIFNWRi5kZWZhdWx0cywgZmlsdGVyLmRlZmF1bHRzLCBpbnB1dFByb3BzICkgXG5cbiAgICBjb25zdCBpc1N0ZXJlbyA9IHByb3BzLmlucHV0LmlzU3RlcmVvXG4gICAgXG4gICAgLy8gWFhYIE5FRURTIFJFRkFDVE9SSU5HXG4gICAgY29uc3QgX19vdXQgPSBHaWJiZXJpc2guZmFjdG9yeSggXG4gICAgICBzdmYsXG4gICAgICBHaWJiZXJpc2guZ2VuaXNoLnN2ZiggZy5pbignaW5wdXQnKSwgZy5tdWwoIGcuaW4oJ2N1dG9mZicpLCBnLmdlbi5zYW1wbGVyYXRlIC8gNSApLCBnLnN1YiggMSwgZy5pbignUScpICksIGcuaW4oJ21vZGUnKSwgaXNTdGVyZW8gKSwgXG4gICAgICBbJ2ZpbHRlcnMnLCdGaWx0ZXIxMlNWRiddLCBcbiAgICAgIHByb3BzXG4gICAgKVxuXG4gICAgcmV0dXJuIF9fb3V0XG4gIH1cblxuXG4gIFNWRi5kZWZhdWx0cyA9IHtcbiAgICBpbnB1dDowLFxuICAgIFE6IC42NSxcbiAgICBjdXRvZmY6NDQwLFxuICAgIG1vZGU6MFxuICB9XG5cbiAgcmV0dXJuIFNWRlxuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IEJpdENydXNoZXIgPSBpbnB1dFByb3BzID0+IHtcbiAgY29uc3QgIHByb3BzID0gT2JqZWN0LmFzc2lnbiggeyBiaXRDcnVzaGVyTGVuZ3RoOiA0NDEwMCB9LCBCaXRDcnVzaGVyLmRlZmF1bHRzLCBlZmZlY3QuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgICAgIGJpdENydXNoZXIgPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBvdXRcblxuICBiaXRDcnVzaGVyLl9fY3JlYXRlR3JhcGggPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgaXNTdGVyZW8gPSBmYWxzZVxuICAgIGlmKCBvdXQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGlzU3RlcmVvID0gdHlwZW9mIHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSAndW5kZWZpbmVkJyA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogZmFsc2UgXG4gICAgfWVsc2V7XG4gICAgICBpc1N0ZXJlbyA9IG91dC5pbnB1dC5pc1N0ZXJlb1xuICAgICAgb3V0LmlzU3RlcmVvID0gaXNTdGVyZW9cbiAgICB9XG5cbiAgICBsZXQgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICAgIGlucHV0R2FpbiA9IGcuaW4oICdpbnB1dEdhaW4nICksXG4gICAgICAgIGJpdERlcHRoID0gZy5pbiggJ2JpdERlcHRoJyApLFxuICAgICAgICBzYW1wbGVSYXRlID0gZy5pbiggJ3NhbXBsZVJhdGUnICksXG4gICAgICAgIGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbIDAgXSA6IGlucHV0LFxuICAgICAgICByaWdodElucHV0ID0gaXNTdGVyZW8gPyBpbnB1dFsgMSBdIDogbnVsbFxuICAgIFxuICAgIGxldCBzdG9yZUwgPSBnLmhpc3RvcnkoMClcbiAgICBsZXQgc2FtcGxlUmVkdXhDb3VudGVyID0gZy5jb3VudGVyKCBzYW1wbGVSYXRlLCAwLCAxIClcblxuICAgIGxldCBiaXRNdWx0ID0gZy5wb3coIGcubXVsKCBiaXREZXB0aCwgMTYgKSwgMiApXG4gICAgbGV0IGNydXNoZWRMID0gZy5kaXYoIGcuZmxvb3IoIGcubXVsKCBnLm11bCggbGVmdElucHV0LCBpbnB1dEdhaW4gKSwgYml0TXVsdCApICksIGJpdE11bHQgKVxuXG4gICAgbGV0IG91dEwgPSBnLnN3aXRjaChcbiAgICAgIHNhbXBsZVJlZHV4Q291bnRlci53cmFwLFxuICAgICAgY3J1c2hlZEwsXG4gICAgICBzdG9yZUwub3V0XG4gICAgKVxuXG4gICAgaWYoIGlzU3RlcmVvICkge1xuICAgICAgbGV0IHN0b3JlUiA9IGcuaGlzdG9yeSgwKVxuICAgICAgbGV0IGNydXNoZWRSID0gZy5kaXYoIGcuZmxvb3IoIGcubXVsKCBnLm11bCggcmlnaHRJbnB1dCwgaW5wdXRHYWluICksIGJpdE11bHQgKSApLCBiaXRNdWx0IClcblxuICAgICAgbGV0IG91dFIgPSBnLnRlcm5hcnkoIFxuICAgICAgICBzYW1wbGVSZWR1eENvdW50ZXIud3JhcCxcbiAgICAgICAgY3J1c2hlZFIsXG4gICAgICAgIHN0b3JlTC5vdXRcbiAgICAgIClcblxuICAgICAgYml0Q3J1c2hlci5ncmFwaCA9IFsgb3V0TCwgb3V0UiBdXG4gICAgfWVsc2V7XG4gICAgICBiaXRDcnVzaGVyLmdyYXBoID0gb3V0TFxuICAgIH1cbiAgfVxuXG4gIGJpdENydXNoZXIuX19jcmVhdGVHcmFwaCgpXG4gIGJpdENydXNoZXIuX19yZXF1aXJlc1JlY29tcGlsYXRpb24gPSBbICdpbnB1dCcgXVxuXG4gIG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICBiaXRDcnVzaGVyLFxuICAgIGJpdENydXNoZXIuZ3JhcGgsXG4gICAgWydmeCcsJ2JpdENydXNoZXInXSwgXG4gICAgcHJvcHMgXG4gIClcbiAgcmV0dXJuIG91dCBcbn1cblxuQml0Q3J1c2hlci5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgYml0RGVwdGg6LjUsXG4gIHNhbXBsZVJhdGU6IC41XG59XG5cbnJldHVybiBCaXRDcnVzaGVyXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBsZXQgcHJvdG8gPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBTaHVmZmxlciA9IGlucHV0UHJvcHMgPT4ge1xuICAgIGxldCBidWZmZXJTaHVmZmxlciA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICAgIGJ1ZmZlclNpemUgPSA4ODIwMFxuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgU2h1ZmZsZXIuZGVmYXVsdHMsIGVmZmVjdC5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgXG4gICAgbGV0IG91dFxuICAgIGJ1ZmZlclNodWZmbGVyLl9fY3JlYXRlR3JhcGggPSBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBpc1N0ZXJlbyA9IGZhbHNlXG4gICAgICBpZiggb3V0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIGlzU3RlcmVvID0gdHlwZW9mIHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSAndW5kZWZpbmVkJyA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogdHJ1ZSBcbiAgICAgIH1lbHNle1xuICAgICAgICBpc1N0ZXJlbyA9IG91dC5pbnB1dC5pc1N0ZXJlb1xuICAgICAgICAvL291dC5pc1N0ZXJlbyA9IGlzU3RlcmVvXG4gICAgICB9ICAgICAgXG4gICAgICBcbiAgICAgIGNvbnN0IHBoYXNlID0gZy5hY2N1bSggMSwwLHsgc2hvdWxkV3JhcDogZmFsc2UgfSlcblxuICAgICAgY29uc3QgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICAgICAgICBpbnB1dEdhaW4gPSBnLmluKCAnaW5wdXRHYWluJyApLFxuICAgICAgICAgICAgX19sZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WyAwIF0gOiBpbnB1dCxcbiAgICAgICAgICAgIF9fcmlnaHRJbnB1dCA9IGlzU3RlcmVvID8gaW5wdXRbIDEgXSA6IG51bGwsXG4gICAgICAgICAgICBsZWZ0SW5wdXQgPSBnLm11bCggX19sZWZ0SW5wdXQsIGlucHV0R2FpbiApLFxuICAgICAgICAgICAgcmlnaHRJbnB1dCA9IGcubXVsKCBfX3JpZ2h0SW5wdXQsIGlucHV0R2FpbiApLFxuICAgICAgICAgICAgcmF0ZU9mU2h1ZmZsaW5nID0gZy5pbiggJ3JhdGUnICksXG4gICAgICAgICAgICBjaGFuY2VPZlNodWZmbGluZyA9IGcuaW4oICdjaGFuY2UnICksXG4gICAgICAgICAgICByZXZlcnNlQ2hhbmNlID0gZy5pbiggJ3JldmVyc2VDaGFuY2UnICksXG4gICAgICAgICAgICByZXBpdGNoQ2hhbmNlID0gZy5pbiggJ3JlcGl0Y2hDaGFuY2UnICksXG4gICAgICAgICAgICByZXBpdGNoTWluID0gZy5pbiggJ3JlcGl0Y2hNaW4nICksXG4gICAgICAgICAgICByZXBpdGNoTWF4ID0gZy5pbiggJ3JlcGl0Y2hNYXgnIClcblxuICAgICAgbGV0IHBpdGNoTWVtb3J5ID0gZy5oaXN0b3J5KDEpXG5cbiAgICAgIGxldCBzaG91bGRTaHVmZmxlQ2hlY2sgPSBnLmVxKCBnLm1vZCggcGhhc2UsIHJhdGVPZlNodWZmbGluZyApLCAwIClcbiAgICAgIGxldCBpc1NodWZmbGluZyA9IGcubWVtbyggZy5zYWgoIGcubHQoIGcubm9pc2UoKSwgY2hhbmNlT2ZTaHVmZmxpbmcgKSwgc2hvdWxkU2h1ZmZsZUNoZWNrLCAwICkgKSBcblxuICAgICAgLy8gaWYgd2UgYXJlIHNodWZmbGluZyBhbmQgb24gYSByZXBlYXQgYm91bmRhcnkuLi5cbiAgICAgIGxldCBzaHVmZmxlQ2hhbmdlZCA9IGcubWVtbyggZy5hbmQoIHNob3VsZFNodWZmbGVDaGVjaywgaXNTaHVmZmxpbmcgKSApXG4gICAgICBsZXQgc2hvdWxkUmV2ZXJzZSA9IGcubHQoIGcubm9pc2UoKSwgcmV2ZXJzZUNoYW5jZSApLFxuICAgICAgICAgIHJldmVyc2VNb2QgPSBnLnN3aXRjaCggc2hvdWxkUmV2ZXJzZSwgLTEsIDEgKVxuXG4gICAgICBsZXQgcGl0Y2ggPSBnLmlmZWxzZSggXG4gICAgICAgIGcuYW5kKCBzaHVmZmxlQ2hhbmdlZCwgZy5sdCggZy5ub2lzZSgpLCByZXBpdGNoQ2hhbmNlICkgKSxcbiAgICAgICAgZy5tZW1vKCBnLm11bCggZy5hZGQoIHJlcGl0Y2hNaW4sIGcubXVsKCBnLnN1YiggcmVwaXRjaE1heCwgcmVwaXRjaE1pbiApLCBnLm5vaXNlKCkgKSApLCByZXZlcnNlTW9kICkgKSxcbiAgICAgICAgcmV2ZXJzZU1vZFxuICAgICAgKVxuICAgICAgXG4gICAgICAvLyBvbmx5IHN3aXRjaCBwaXRjaGVzIG9uIHJlcGVhdCBib3VuZGFyaWVzXG4gICAgICBwaXRjaE1lbW9yeS5pbiggZy5zd2l0Y2goIHNodWZmbGVDaGFuZ2VkLCBwaXRjaCwgcGl0Y2hNZW1vcnkub3V0ICkgKVxuXG4gICAgICBsZXQgZmFkZUxlbmd0aCA9IGcubWVtbyggZy5kaXYoIHJhdGVPZlNodWZmbGluZywgMTAwICkgKSxcbiAgICAgICAgICBmYWRlSW5jciA9IGcubWVtbyggZy5kaXYoIDEsIGZhZGVMZW5ndGggKSApXG5cbiAgICAgIGNvbnN0IGJ1ZmZlckwgPSBnLmRhdGEoIGJ1ZmZlclNpemUgKVxuICAgICAgY29uc3QgYnVmZmVyUiA9IGlzU3RlcmVvID8gZy5kYXRhKCBidWZmZXJTaXplICkgOiBudWxsXG4gICAgICBsZXQgcmVhZFBoYXNlID0gZy5hY2N1bSggcGl0Y2hNZW1vcnkub3V0LCAwLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSkgXG4gICAgICBsZXQgc3R1dHRlciA9IGcud3JhcCggZy5zdWIoIGcubW9kKCByZWFkUGhhc2UsIGJ1ZmZlclNpemUgKSwgMjIwNTAgKSwgMCwgYnVmZmVyU2l6ZSApXG5cbiAgICAgIGxldCBub3JtYWxTYW1wbGUgPSBnLnBlZWsoIGJ1ZmZlckwsIGcuYWNjdW0oIDEsIDAsIHsgbWF4Ojg4MjAwIH0pLCB7IG1vZGU6J3NpbXBsZScgfSlcblxuICAgICAgbGV0IHN0dXR0ZXJTYW1wbGVQaGFzZSA9IGcuc3dpdGNoKCBpc1NodWZmbGluZywgc3R1dHRlciwgZy5tb2QoIHJlYWRQaGFzZSwgYnVmZmVyU2l6ZSApIClcbiAgICAgIGxldCBzdHV0dGVyU2FtcGxlID0gZy5tZW1vKCBnLnBlZWsoIFxuICAgICAgICBidWZmZXJMLCBcbiAgICAgICAgc3R1dHRlclNhbXBsZVBoYXNlLFxuICAgICAgICB7IG1vZGU6J3NhbXBsZXMnIH1cbiAgICAgICkgKVxuICAgICAgXG4gICAgICBsZXQgc3R1dHRlclNob3VsZEZhZGVJbiA9IGcuYW5kKCBzaHVmZmxlQ2hhbmdlZCwgaXNTaHVmZmxpbmcgKVxuICAgICAgbGV0IHN0dXR0ZXJQaGFzZSA9IGcuYWNjdW0oIDEsIHNodWZmbGVDaGFuZ2VkLCB7IHNob3VsZFdyYXA6IGZhbHNlIH0pXG5cbiAgICAgIGxldCBmYWRlSW5BbW91bnQgPSBnLm1lbW8oIGcuZGl2KCBzdHV0dGVyUGhhc2UsIGZhZGVMZW5ndGggKSApXG4gICAgICBsZXQgZmFkZU91dEFtb3VudCA9IGcuZGl2KCBnLnN1YiggcmF0ZU9mU2h1ZmZsaW5nLCBzdHV0dGVyUGhhc2UgKSwgZy5zdWIoIHJhdGVPZlNodWZmbGluZywgZmFkZUxlbmd0aCApIClcbiAgICAgIFxuICAgICAgbGV0IGZhZGVkU3R1dHRlciA9IGcuaWZlbHNlKFxuICAgICAgICBnLmx0KCBzdHV0dGVyUGhhc2UsIGZhZGVMZW5ndGggKSxcbiAgICAgICAgZy5tZW1vKCBnLm11bCggZy5zd2l0Y2goIGcubHQoIGZhZGVJbkFtb3VudCwgMSApLCBmYWRlSW5BbW91bnQsIDEgKSwgc3R1dHRlclNhbXBsZSApICksXG4gICAgICAgIGcuZ3QoIHN0dXR0ZXJQaGFzZSwgZy5zdWIoIHJhdGVPZlNodWZmbGluZywgZmFkZUxlbmd0aCApICksXG4gICAgICAgIGcubWVtbyggZy5tdWwoIGcuZ3RwKCBmYWRlT3V0QW1vdW50LCAwICksIHN0dXR0ZXJTYW1wbGUgKSApLFxuICAgICAgICBzdHV0dGVyU2FtcGxlXG4gICAgICApXG4gICAgICBcbiAgICAgIGxldCBvdXRwdXRMID0gZy5taXgoIG5vcm1hbFNhbXBsZSwgZmFkZWRTdHV0dGVyLCBpc1NodWZmbGluZyApIFxuXG4gICAgICBsZXQgcG9rZUwgPSBnLnBva2UoIGJ1ZmZlckwsIGxlZnRJbnB1dCwgZy5tb2QoIGcuYWRkKCBwaGFzZSwgNDQxMDAgKSwgODgyMDAgKSApXG5cbiAgICAgIGxldCBwYW5uZXIgPSBnLnBhbiggb3V0cHV0TCwgb3V0cHV0TCwgZy5pbiggJ3BhbicgKSApXG4gICAgICBcbiAgICAgIGJ1ZmZlclNodWZmbGVyLmdyYXBoID0gWyBwYW5uZXIubGVmdCwgcGFubmVyLnJpZ2h0IF1cbiAgICB9XG5cbiAgICBidWZmZXJTaHVmZmxlci5fX2NyZWF0ZUdyYXBoKClcbiAgICBidWZmZXJTaHVmZmxlci5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiA9IFsgJ2lucHV0JyBdXG4gICAgXG4gICAgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgYnVmZmVyU2h1ZmZsZXIsXG4gICAgICBidWZmZXJTaHVmZmxlci5ncmFwaCxcbiAgICAgIFsnZngnLCdzaHVmZmxlciddLCBcbiAgICAgIHByb3BzIFxuICAgIClcblxuICAgIHJldHVybiBvdXQgXG4gIH1cbiAgXG4gIFNodWZmbGVyLmRlZmF1bHRzID0ge1xuICAgIGlucHV0OjAsXG4gICAgcmF0ZToyMjA1MCxcbiAgICBjaGFuY2U6LjI1LFxuICAgIHJldmVyc2VDaGFuY2U6LjUsXG4gICAgcmVwaXRjaENoYW5jZTouNSxcbiAgICByZXBpdGNoTWluOi41LFxuICAgIHJlcGl0Y2hNYXg6MixcbiAgICBwYW46LjUsXG4gICAgbWl4Oi41XG4gIH1cblxuICByZXR1cm4gU2h1ZmZsZXIgXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuICBcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmxldCBfX0Nob3J1cyA9IGlucHV0UHJvcHMgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIF9fQ2hvcnVzLmRlZmF1bHRzLCBlZmZlY3QuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICBsZXQgb3V0XG4gIFxuICBjb25zdCBjaG9ydXMgPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGNob3J1cy5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgaW5wdXQgPSBnLmluKCdpbnB1dCcpLFxuICAgICAgICAgIGlucHV0R2FpbiA9IGcuaW4oICdpbnB1dEdhaW4nICksXG4gICAgICAgICAgZnJlcTEgPSBnLmluKCdzbG93RnJlcXVlbmN5JyksXG4gICAgICAgICAgZnJlcTIgPSBnLmluKCdmYXN0RnJlcXVlbmN5JyksXG4gICAgICAgICAgYW1wMSAgPSBnLmluKCdzbG93R2FpbicpLFxuICAgICAgICAgIGFtcDIgID0gZy5pbignZmFzdEdhaW4nKVxuXG4gICAgbGV0IGlzU3RlcmVvID0gZmFsc2VcbiAgICBpZiggb3V0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBpc1N0ZXJlbyA9IHR5cGVvZiBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gJ3VuZGVmaW5lZCcgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IGZhbHNlIFxuICAgIH1lbHNle1xuICAgICAgaXNTdGVyZW8gPSBvdXQuaW5wdXQuaXNTdGVyZW9cbiAgICAgIG91dC5pc1N0ZXJlbyA9IGlzU3RlcmVvXG4gICAgfVxuXG4gICAgY29uc3QgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBnLm11bCggaW5wdXRbMF0sIGlucHV0R2FpbiApIDogZy5tdWwoIGlucHV0LCBpbnB1dEdhaW4gKVxuXG4gICAgY29uc3Qgd2luMCAgID0gZy5lbnYoICdpbnZlcnNld2VsY2gnLCAxMDI0ICksXG4gICAgICAgICAgd2luMTIwID0gZy5lbnYoICdpbnZlcnNld2VsY2gnLCAxMDI0LCAwLCAuMzMzICksXG4gICAgICAgICAgd2luMjQwID0gZy5lbnYoICdpbnZlcnNld2VsY2gnLCAxMDI0LCAwLCAuNjY2IClcbiAgICBcbiAgICBjb25zdCBzbG93UGhhc29yID0gZy5waGFzb3IoIGZyZXExLCAwLCB7IG1pbjowIH0pLFxuICAgICAgICAgIHNsb3dQZWVrMSAgPSBnLm11bCggZy5wZWVrKCB3aW4wLCAgIHNsb3dQaGFzb3IgKSwgYW1wMSApLFxuICAgICAgICAgIHNsb3dQZWVrMiAgPSBnLm11bCggZy5wZWVrKCB3aW4xMjAsIHNsb3dQaGFzb3IgKSwgYW1wMSApLFxuICAgICAgICAgIHNsb3dQZWVrMyAgPSBnLm11bCggZy5wZWVrKCB3aW4yNDAsIHNsb3dQaGFzb3IgKSwgYW1wMSApXG4gICAgXG4gICAgY29uc3QgZmFzdFBoYXNvciA9IGcucGhhc29yKCBmcmVxMiwgMCwgeyBtaW46MCB9KSxcbiAgICAgICAgICBmYXN0UGVlazEgID0gZy5tdWwoIGcucGVlayggd2luMCwgICBmYXN0UGhhc29yICksIGFtcDIgKSxcbiAgICAgICAgICBmYXN0UGVlazIgID0gZy5tdWwoIGcucGVlayggd2luMTIwLCBmYXN0UGhhc29yICksIGFtcDIgKSxcbiAgICAgICAgICBmYXN0UGVlazMgID0gZy5tdWwoIGcucGVlayggd2luMjQwLCBmYXN0UGhhc29yICksIGFtcDIgKVxuXG5cbiAgICBsZXQgc2FtcGxlUmF0ZSA9IEdpYmJlcmlzaC5jdHguc2FtcGxlUmF0ZVxuICAgICBcbiAgICBjb25zdCBtcyA9IHNhbXBsZVJhdGUgLyAxMDAwIFxuICAgIGNvbnN0IG1heERlbGF5VGltZSA9IDEwMDAgKiBtc1xuXG4gICAgLy9jb25zb2xlLmxvZyggJ3NyOicsIHNhbXBsZVJhdGUsICdtczonLCBtcywgJ21heERlbGF5VGltZTonLCBtYXhEZWxheVRpbWUgKVxuXG4gICAgY29uc3QgdGltZTEgPSAgZy5tdWwoIGcuYWRkKCBzbG93UGVlazEsIGZhc3RQZWVrMSwgNSApLCBtcyApLFxuICAgICAgICAgIHRpbWUyID0gIGcubXVsKCBnLmFkZCggc2xvd1BlZWsyLCBmYXN0UGVlazIsIDUgKSwgbXMgKSxcbiAgICAgICAgICB0aW1lMyA9ICBnLm11bCggZy5hZGQoIHNsb3dQZWVrMywgZmFzdFBlZWszLCA1ICksIG1zIClcblxuICAgIGNvbnN0IGRlbGF5MUwgPSBnLmRlbGF5KCBsZWZ0SW5wdXQsIHRpbWUxLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pLFxuICAgICAgICAgIGRlbGF5MkwgPSBnLmRlbGF5KCBsZWZ0SW5wdXQsIHRpbWUyLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pLFxuICAgICAgICAgIGRlbGF5M0wgPSBnLmRlbGF5KCBsZWZ0SW5wdXQsIHRpbWUzLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pXG5cbiAgICBcbiAgICBjb25zdCBsZWZ0T3V0cHV0ID0gZy5hZGQoIGRlbGF5MUwsIGRlbGF5MkwsIGRlbGF5M0wgKVxuICAgIGlmKCBpc1N0ZXJlbyApIHtcbiAgICAgIGNvbnN0IHJpZ2h0SW5wdXQgPSBnLm11bCggaW5wdXRbMV0sIGlucHV0R2FpbiApXG4gICAgICBjb25zdCBkZWxheTFSID0gZy5kZWxheShyaWdodElucHV0LCB0aW1lMSwgeyBzaXplOm1heERlbGF5VGltZSB9KSxcbiAgICAgICAgICAgIGRlbGF5MlIgPSBnLmRlbGF5KHJpZ2h0SW5wdXQsIHRpbWUyLCB7IHNpemU6bWF4RGVsYXlUaW1lIH0pLFxuICAgICAgICAgICAgZGVsYXkzUiA9IGcuZGVsYXkocmlnaHRJbnB1dCwgdGltZTMsIHsgc2l6ZTptYXhEZWxheVRpbWUgfSlcblxuICAgICAgLy8gZmxpcCBhIGNvdXBsZSBkZWxheSBsaW5lcyBmb3Igc3RlcmVvIGVmZmVjdD9cbiAgICAgIGNvbnN0IHJpZ2h0T3V0cHV0ID0gZy5hZGQoIGRlbGF5MVIsIGRlbGF5MkwsIGRlbGF5M1IgKVxuICAgICAgY2hvcnVzLmdyYXBoID0gWyBnLmFkZCggZGVsYXkxTCwgZGVsYXkyUiwgZGVsYXkzTCksIHJpZ2h0T3V0cHV0IF1cbiAgICB9ZWxzZXtcbiAgICAgIGNob3J1cy5ncmFwaCA9IGxlZnRPdXRwdXRcbiAgICB9XG4gIH1cblxuICBjaG9ydXMuX19jcmVhdGVHcmFwaCgpXG4gIGNob3J1cy5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiA9IFsgJ2lucHV0JyBdXG5cbiAgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIGNob3J1cywgY2hvcnVzLmdyYXBoLCBbJ2Z4JywnY2hvcnVzJ10sIHByb3BzIClcblxuICByZXR1cm4gb3V0IFxufVxuXG5fX0Nob3J1cy5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgc2xvd0ZyZXF1ZW5jeTogLjE4LFxuICBzbG93R2FpbjozLFxuICBmYXN0RnJlcXVlbmN5OjYsXG4gIGZhc3RHYWluOjEsXG4gIGlucHV0R2FpbjoxXG59XG5cbnJldHVybiBfX0Nob3J1c1xuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSgnZ2VuaXNoLmpzJyksXG4gICAgICBlZmZlY3QgPSByZXF1aXJlKCcuL2VmZmVjdC5qcycpO1xuXG5jb25zdCBnZW5pc2ggPSBnO1xuXG5cInVzZSBqc2RzcFwiO1xuXG5jb25zdCBBbGxQYXNzQ2hhaW4gPSAoaW4xLCBpbjIsIGluMykgPT4ge1xuICBcInVzZSBqc2RzcFwiO1xuXG4gIC8qIGluMSA9IHByZWRlbGF5X291dCAqL1xuICAvKiBpbjIgPSBpbmRpZmZ1c2lvbjEgKi9cbiAgLyogaW4zID0gaW5kaWZmdXNpb24yICovXG5cbiAgY29uc3Qgc3ViMSA9IGdlbmlzaC5zdWIoaW4xLCAwKTtcbiAgY29uc3QgZDEgPSBnLmRlbGF5KHN1YjEsIDE0Mik7XG4gIHN1YjEuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkMSwgaW4yKTtcbiAgY29uc3QgYXAxX291dCA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bChzdWIxLCBpbjIpLCBkMSk7XG5cbiAgY29uc3Qgc3ViMiA9IGdlbmlzaC5zdWIoYXAxX291dCwgMCk7XG4gIGNvbnN0IGQyID0gZy5kZWxheShzdWIyLCAxMDcpO1xuICBzdWIyLmlucHV0c1sxXSA9IGdlbmlzaC5tdWwoZDIsIGluMik7XG4gIGNvbnN0IGFwMl9vdXQgPSBnZW5pc2guYWRkKGdlbmlzaC5tdWwoc3ViMiwgaW4yKSwgZDIpO1xuXG4gIGNvbnN0IHN1YjMgPSBnZW5pc2guc3ViKGFwMl9vdXQsIDApO1xuICBjb25zdCBkMyA9IGcuZGVsYXkoc3ViMywgMzc5KTtcbiAgc3ViMy5pbnB1dHNbMV0gPSBnZW5pc2gubXVsKGQzLCBpbjMpO1xuICBjb25zdCBhcDNfb3V0ID0gZ2VuaXNoLmFkZChnZW5pc2gubXVsKHN1YjMsIGluMyksIGQzKTtcblxuICBjb25zdCBzdWI0ID0gZ2VuaXNoLnN1YihhcDNfb3V0LCAwKTtcbiAgY29uc3QgZDQgPSBnLmRlbGF5KHN1YjQsIDI3Nyk7XG4gIHN1YjQuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkNCwgaW4zKTtcbiAgY29uc3QgYXA0X291dCA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bChzdWI0LCBpbjMpLCBkNCk7XG5cbiAgcmV0dXJuIGFwNF9vdXQ7XG59O1xuXG4vKmNvbnN0IHRhbmtfb3V0cyA9IFRhbmsoIGFwX291dCwgZGVjYXlkaWZmdXNpb24xLCBkZWNheWRpZmZ1c2lvbjIsIGRhbXBpbmcsIGRlY2F5ICkqL1xuY29uc3QgVGFuayA9IGZ1bmN0aW9uIChpbjEsIGluMiwgaW4zLCBpbjQsIGluNSkge1xuICBcInVzZSBqc2RzcFwiO1xuXG4gIGNvbnN0IG91dHMgPSBbW10sIFtdLCBbXSwgW10sIFtdXTtcblxuICAvKiBMRUZUIENIQU5ORUwgKi9cbiAgY29uc3QgbGVmdFN0YXJ0ID0gZ2VuaXNoLmFkZChpbjEsIDApO1xuICBjb25zdCBkZWxheUlucHV0ID0gZ2VuaXNoLmFkZChsZWZ0U3RhcnQsIDApO1xuICBjb25zdCBkZWxheTEgPSBnLmRlbGF5KGRlbGF5SW5wdXQsIFtnZW5pc2guYWRkKGdlbmlzaC5tdWwoZy5jeWNsZSguMSksIDE2KSwgNjcyKV0sIHsgc2l6ZTogNjg4IH0pO1xuICBkZWxheUlucHV0LmlucHV0c1sxXSA9IGdlbmlzaC5tdWwoZGVsYXkxLCBpbjIpO1xuICBjb25zdCBkZWxheU91dCA9IGdlbmlzaC5zdWIoZGVsYXkxLCBnZW5pc2gubXVsKGRlbGF5SW5wdXQsIGluMikpO1xuXG4gIGNvbnN0IGRlbGF5MiA9IGcuZGVsYXkoZGVsYXlPdXQsIFs0NDUzLCAzNTMsIDM2MjcsIDExOTBdKTtcbiAgb3V0c1szXS5wdXNoKGdlbmlzaC5hZGQoZGVsYXkyLm91dHB1dHNbMV0sIGRlbGF5Mi5vdXRwdXRzWzJdKSk7XG4gIG91dHNbMl0ucHVzaChkZWxheTIub3V0cHV0c1szXSk7XG5cbiAgY29uc3QgbXogPSBnLmhpc3RvcnkoMCk7XG4gIGNvbnN0IG1sID0gZy5taXgoZGVsYXkyLCBtei5vdXQsIGluNCk7XG4gIG16LmluKG1sKTtcblxuICBjb25zdCBtb3V0ID0gZ2VuaXNoLm11bChtbCwgaW41KTtcblxuICBjb25zdCBzMSA9IGdlbmlzaC5zdWIobW91dCwgMCk7XG4gIGNvbnN0IGRlbGF5MyA9IGcuZGVsYXkoczEsIFsxODAwLCAxODcsIDEyMjhdKTtcbiAgb3V0c1syXS5wdXNoKGRlbGF5My5vdXRwdXRzWzFdKTtcbiAgb3V0c1s0XS5wdXNoKGRlbGF5My5vdXRwdXRzWzJdKTtcbiAgczEuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkZWxheTMsIGluMyk7XG4gIGNvbnN0IG0yID0gZ2VuaXNoLm11bChzMSwgaW4zKTtcbiAgY29uc3QgZGwyX291dCA9IGdlbmlzaC5hZGQoZGVsYXkzLCBtMik7XG5cbiAgY29uc3QgZGVsYXk0ID0gZy5kZWxheShkbDJfb3V0LCBbMzcyMCwgMTA2NiwgMjY3M10pO1xuICBvdXRzWzJdLnB1c2goZGVsYXk0Lm91dHB1dHNbMV0pO1xuICBvdXRzWzNdLnB1c2goZGVsYXk0Lm91dHB1dHNbMl0pO1xuXG4gIC8qIFJJR0hUIENIQU5ORUwgKi9cbiAgY29uc3QgcmlnaHRTdGFydCA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bChkZWxheTQsIGluNSksIGluMSk7XG4gIGNvbnN0IGRlbGF5SW5wdXRSID0gZ2VuaXNoLmFkZChyaWdodFN0YXJ0LCAwKTtcbiAgY29uc3QgZGVsYXkxUiA9IGcuZGVsYXkoZGVsYXlJbnB1dFIsIGdlbmlzaC5hZGQoZ2VuaXNoLm11bChnLmN5Y2xlKC4wNyksIDE2KSwgOTA4KSwgeyBzaXplOiA5MjQgfSk7XG4gIGRlbGF5SW5wdXRSLmlucHV0c1sxXSA9IGdlbmlzaC5tdWwoZGVsYXkxUiwgaW4yKTtcbiAgY29uc3QgZGVsYXlPdXRSID0gZ2VuaXNoLnN1YihkZWxheTFSLCBnZW5pc2gubXVsKGRlbGF5SW5wdXRSLCBpbjIpKTtcblxuICBjb25zdCBkZWxheTJSID0gZy5kZWxheShkZWxheU91dFIsIFs0MjE3LCAyNjYsIDI5NzQsIDIxMTFdKTtcbiAgb3V0c1sxXS5wdXNoKGdlbmlzaC5hZGQoZGVsYXkyUi5vdXRwdXRzWzFdLCBkZWxheTJSLm91dHB1dHNbMl0pKTtcbiAgb3V0c1s0XS5wdXNoKGRlbGF5MlIub3V0cHV0c1szXSk7XG5cbiAgY29uc3QgbXpSID0gZy5oaXN0b3J5KDApO1xuICBjb25zdCBtbFIgPSBnLm1peChkZWxheTJSLCBtelIub3V0LCBpbjQpO1xuICBtelIuaW4obWxSKTtcblxuICBjb25zdCBtb3V0UiA9IGdlbmlzaC5tdWwobWxSLCBpbjUpO1xuXG4gIGNvbnN0IHMxUiA9IGdlbmlzaC5zdWIobW91dFIsIDApO1xuICBjb25zdCBkZWxheTNSID0gZy5kZWxheShzMVIsIFsyNjU2LCAzMzUsIDE5MTNdKTtcbiAgb3V0c1s0XS5wdXNoKGRlbGF5M1Iub3V0cHV0c1sxXSk7XG4gIG91dHNbMl0ucHVzaChkZWxheTNSLm91dHB1dHNbMl0pO1xuICBzMVIuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkZWxheTNSLCBpbjMpO1xuICBjb25zdCBtMlIgPSBnZW5pc2gubXVsKHMxUiwgaW4zKTtcbiAgY29uc3QgZGwyX291dFIgPSBnZW5pc2guYWRkKGRlbGF5M1IsIG0yUik7XG5cbiAgY29uc3QgZGVsYXk0UiA9IGcuZGVsYXkoZGwyX291dFIsIFszMTYzLCAxMjEsIDE5OTZdKTtcbiAgb3V0c1s0XS5wdXNoKGRlbGF5NC5vdXRwdXRzWzFdKTtcbiAgb3V0c1sxXS5wdXNoKGRlbGF5NC5vdXRwdXRzWzJdKTtcblxuICBsZWZ0U3RhcnQuaW5wdXRzWzFdID0gZ2VuaXNoLm11bChkZWxheTRSLCBpbjUpO1xuXG4gIG91dHNbMV0gPSBnLmFkZCguLi5vdXRzWzFdKTtcbiAgb3V0c1syXSA9IGcuYWRkKC4uLm91dHNbMl0pO1xuICBvdXRzWzNdID0gZy5hZGQoLi4ub3V0c1szXSk7XG4gIG91dHNbNF0gPSBnLmFkZCguLi5vdXRzWzRdKTtcbiAgcmV0dXJuIG91dHM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChHaWJiZXJpc2gpIHtcblxuICBjb25zdCBSZXZlcmIgPSBpbnB1dFByb3BzID0+IHtcbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIFJldmVyYi5kZWZhdWx0cywgZWZmZWN0LmRlZmF1bHRzLCBpbnB1dFByb3BzKSxcbiAgICAgICAgICByZXZlcmIgPSBPYmplY3QuY3JlYXRlKGVmZmVjdCk7XG5cbiAgICBsZXQgb3V0O1xuXG4gICAgcmV2ZXJiLl9fY3JlYXRlR3JhcGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgaXNTdGVyZW8gPSBmYWxzZTtcbiAgICAgIGlmIChvdXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpc1N0ZXJlbyA9IHR5cGVvZiBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gJ3VuZGVmaW5lZCcgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNTdGVyZW8gPSBvdXQuaW5wdXQuaXNTdGVyZW87XG4gICAgICAgIG91dC5pc1N0ZXJlbyA9IGlzU3RlcmVvO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpbnB1dCA9IGcuaW4oJ2lucHV0JyksXG4gICAgICAgICAgICBpbnB1dEdhaW4gPSBnLmluKCdpbnB1dEdhaW4nKSxcbiAgICAgICAgICAgIGRhbXBpbmcgPSBnLmluKCdkYW1waW5nJyksXG4gICAgICAgICAgICBkcnl3ZXQgPSBnLmluKCdkcnl3ZXQnKSxcbiAgICAgICAgICAgIGRlY2F5ID0gZy5pbignZGVjYXknKSxcbiAgICAgICAgICAgIHByZWRlbGF5ID0gZy5pbigncHJlZGVsYXknKSxcbiAgICAgICAgICAgIGluYmFuZHdpZHRoID0gZy5pbignaW5iYW5kd2lkdGgnKSxcbiAgICAgICAgICAgIGRlY2F5ZGlmZnVzaW9uMSA9IGcuaW4oJ2RlY2F5ZGlmZnVzaW9uMScpLFxuICAgICAgICAgICAgZGVjYXlkaWZmdXNpb24yID0gZy5pbignZGVjYXlkaWZmdXNpb24yJyksXG4gICAgICAgICAgICBpbmRpZmZ1c2lvbjEgPSBnLmluKCdpbmRpZmZ1c2lvbjEnKSxcbiAgICAgICAgICAgIGluZGlmZnVzaW9uMiA9IGcuaW4oJ2luZGlmZnVzaW9uMicpO1xuXG4gICAgICBjb25zdCBzdW1tZWRJbnB1dCA9IGlzU3RlcmVvID09PSB0cnVlID8gZy5tdWwoZy5hZGQoaW5wdXRbMF0sIGlucHV0WzFdKSwgaW5wdXRHYWluKSA6IGcubXVsKGlucHV0LCBpbnB1dEdhaW4pO1xuICAgICAge1xuICAgICAgICAndXNlIGpzZHNwJztcblxuICAgICAgICAvLyBjYWxjdWxjYXRlIHByZWRlbGF5XG4gICAgICAgIGNvbnN0IHByZWRlbGF5X3NhbXBzID0gZy5tc3Rvc2FtcHMocHJlZGVsYXkpO1xuICAgICAgICBjb25zdCBwcmVkZWxheV9kZWxheSA9IGcuZGVsYXkoc3VtbWVkSW5wdXQsIHByZWRlbGF5X3NhbXBzLCB7IHNpemU6IDQ0MTAgfSk7XG4gICAgICAgIGNvbnN0IHpfcGQgPSBnLmhpc3RvcnkoMCk7XG4gICAgICAgIGNvbnN0IG1peDEgPSBnLm1peCh6X3BkLm91dCwgcHJlZGVsYXlfZGVsYXksIGluYmFuZHdpZHRoKTtcbiAgICAgICAgel9wZC5pbihtaXgxKTtcblxuICAgICAgICBjb25zdCBwcmVkZWxheV9vdXQgPSBtaXgxO1xuXG4gICAgICAgIC8vIHJ1biBpbnB1dCArIHByZWRlbGF5IHRocm91Z2ggYWxsLXBhc3MgY2hhaW5cbiAgICAgICAgY29uc3QgYXBfb3V0ID0gQWxsUGFzc0NoYWluKHByZWRlbGF5X291dCwgaW5kaWZmdXNpb24xLCBpbmRpZmZ1c2lvbjIpO1xuXG4gICAgICAgIC8vIHJ1biBmaWx0ZXJlZCBzaWduYWwgaW50byBcInRhbmtcIiBtb2RlbFxuICAgICAgICBjb25zdCB0YW5rX291dHMgPSBUYW5rKGFwX291dCwgZGVjYXlkaWZmdXNpb24xLCBkZWNheWRpZmZ1c2lvbjIsIGRhbXBpbmcsIGRlY2F5KTtcblxuICAgICAgICBjb25zdCBsZWZ0V2V0ID0gZ2VuaXNoLm11bChnZW5pc2guc3ViKHRhbmtfb3V0c1sxXSwgdGFua19vdXRzWzJdKSwgLjYpO1xuICAgICAgICBjb25zdCByaWdodFdldCA9IGdlbmlzaC5tdWwoZ2VuaXNoLnN1Yih0YW5rX291dHNbM10sIHRhbmtfb3V0c1s0XSksIC42KTtcblxuICAgICAgICAvLyBtaXggd2V0IGFuZCBkcnkgc2lnbmFsIGZvciBmaW5hbCBvdXRwdXRcbiAgICAgICAgY29uc3QgbGVmdCA9IGcubWl4KGlzU3RlcmVvID8gZy5tdWwoaW5wdXRbMF0sIGlucHV0R2FpbikgOiBnLm11bChpbnB1dCwgaW5wdXRHYWluKSwgbGVmdFdldCwgZHJ5d2V0KTtcbiAgICAgICAgY29uc3QgcmlnaHQgPSBnLm1peChpc1N0ZXJlbyA/IGcubXVsKGlucHV0WzFdLCBpbnB1dEdhaW4pIDogZy5tdWwoaW5wdXQsIGlucHV0R2FpbiksIHJpZ2h0V2V0LCBkcnl3ZXQpO1xuXG4gICAgICAgIHJldmVyYi5ncmFwaCA9IFtsZWZ0LCByaWdodF07XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldmVyYi5fX2NyZWF0ZUdyYXBoKCk7XG4gICAgcmV2ZXJiLl9fcmVxdWlyZXNSZWNvbXBpbGF0aW9uID0gWydpbnB1dCddO1xuXG4gICAgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkocmV2ZXJiLCByZXZlcmIuZ3JhcGgsIFsnZngnLCAncGxhdGUnXSwgcHJvcHMpO1xuXG4gICAgcmV0dXJuIG91dDtcbiAgfTtcblxuICBSZXZlcmIuZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6IDAsXG4gICAgZGFtcGluZzogLjUsXG4gICAgZHJ5d2V0OiAuNSxcbiAgICBkZWNheTogLjUsXG4gICAgcHJlZGVsYXk6IDEwLFxuICAgIGluYmFuZHdpZHRoOiAuNSxcbiAgICBpbmRpZmZ1c2lvbjE6IC43NSxcbiAgICBpbmRpZmZ1c2lvbjI6IC42MjUsXG4gICAgZGVjYXlkaWZmdXNpb24xOiAuNyxcbiAgICBkZWNheWRpZmZ1c2lvbjI6IC41XG4gIH07XG5cbiAgcmV0dXJuIFJldmVyYjtcbn07IiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgRGVsYXkgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzID0gT2JqZWN0LmFzc2lnbiggeyBkZWxheUxlbmd0aDogNDQxMDAgfSwgZWZmZWN0LmRlZmF1bHRzLCBEZWxheS5kZWZhdWx0cywgaW5wdXRQcm9wcyApLFxuICAgICAgZGVsYXkgPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBvdXRcbiAgZGVsYXkuX19jcmVhdGVHcmFwaCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBpc1N0ZXJlbyA9IGZhbHNlXG4gICAgaWYoIG91dCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgaXNTdGVyZW8gPSB0eXBlb2YgcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09ICd1bmRlZmluZWQnID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiBmYWxzZSBcbiAgICB9ZWxzZXtcbiAgICAgIGlzU3RlcmVvID0gb3V0LmlucHV0LmlzU3RlcmVvXG4gICAgICBvdXQuaXNTdGVyZW8gPSBpc1N0ZXJlb1xuICAgIH0gICAgXG5cbiAgICBjb25zdCBpbnB1dCAgICAgID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgICAgIGlucHV0R2FpbiAgPSBnLmluKCAnaW5wdXRHYWluJyApLFxuICAgICAgICAgIGRlbGF5VGltZSAgPSBnLmluKCAndGltZScgKSxcbiAgICAgICAgICB3ZXRkcnkgICAgID0gZy5pbiggJ3dldGRyeScgKSxcbiAgICAgICAgICBsZWZ0SW5wdXQgID0gaXNTdGVyZW8gPyBnLm11bCggaW5wdXRbIDAgXSwgaW5wdXRHYWluICkgOiBnLm11bCggaW5wdXQsIGlucHV0R2FpbiApLFxuICAgICAgICAgIHJpZ2h0SW5wdXQgPSBpc1N0ZXJlbyA/IGcubXVsKCBpbnB1dFsgMSBdLCBpbnB1dEdhaW4gKSA6IG51bGxcbiAgICAgIFxuICAgIGNvbnN0IGZlZWRiYWNrID0gZy5pbiggJ2ZlZWRiYWNrJyApXG5cbiAgICAvLyBsZWZ0IGNoYW5uZWxcbiAgICBjb25zdCBmZWVkYmFja0hpc3RvcnlMID0gZy5oaXN0b3J5KClcbiAgICBjb25zdCBlY2hvTCA9IGcuZGVsYXkoIGcuYWRkKCBsZWZ0SW5wdXQsIGcubXVsKCBmZWVkYmFja0hpc3RvcnlMLm91dCwgZmVlZGJhY2sgKSApLCBkZWxheVRpbWUsIHsgc2l6ZTpwcm9wcy5kZWxheUxlbmd0aCB9KVxuICAgIGZlZWRiYWNrSGlzdG9yeUwuaW4oIGVjaG9MIClcbiAgICBjb25zdCBsZWZ0ID0gZy5taXgoIGxlZnRJbnB1dCwgZWNob0wsIHdldGRyeSApXG5cbiAgICBpZiggaXNTdGVyZW8gKSB7XG4gICAgICAvLyByaWdodCBjaGFubmVsXG4gICAgICBjb25zdCBmZWVkYmFja0hpc3RvcnlSID0gZy5oaXN0b3J5KClcbiAgICAgIGNvbnN0IGVjaG9SID0gZy5kZWxheSggZy5hZGQoIHJpZ2h0SW5wdXQsIGcubXVsKCBmZWVkYmFja0hpc3RvcnlSLm91dCwgZmVlZGJhY2sgKSApLCBkZWxheVRpbWUsIHsgc2l6ZTpwcm9wcy5kZWxheUxlbmd0aCB9KVxuICAgICAgZmVlZGJhY2tIaXN0b3J5Ui5pbiggZWNob1IgKVxuICAgICAgY29uc3QgcmlnaHQgPSBnLm1peCggcmlnaHRJbnB1dCwgZWNob1IsIHdldGRyeSApXG5cbiAgICAgIGRlbGF5LmdyYXBoID0gWyBsZWZ0LCByaWdodCBdXG4gICAgfWVsc2V7XG4gICAgICBkZWxheS5ncmFwaCA9IGxlZnQgXG4gICAgfVxuICB9XG5cbiAgZGVsYXkuX19jcmVhdGVHcmFwaCgpXG4gIGRlbGF5Ll9fcmVxdWlyZXNSZWNvbXBpbGF0aW9uID0gWyAnaW5wdXQnIF1cbiAgXG4gIG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICBkZWxheSxcbiAgICBkZWxheS5ncmFwaCwgXG4gICAgWydmeCcsJ2RlbGF5J10sIFxuICAgIHByb3BzIFxuICApXG5cbiAgcmV0dXJuIG91dFxufVxuXG5EZWxheS5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgZmVlZGJhY2s6LjUsXG4gIHRpbWU6IDExMDI1LFxuICB3ZXRkcnk6IC41XG59XG5cbnJldHVybiBEZWxheVxuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSgnZ2VuaXNoLmpzJyksXG4gICAgICBlZmZlY3QgPSByZXF1aXJlKCcuL2VmZmVjdC5qcycpO1xuXG5jb25zdCBnZW5pc2ggPSBnO1xuXG4vKlxuXG4gICAgICAgICBleHAoYXNpZyAqIChzaGFwZTEgKyBwcmVnYWluKSkgLSBleHAoYXNpZyAqIChzaGFwZTIgLSBwcmVnYWluKSlcbiAgYW91dCA9IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgZXhwKGFzaWcgKiBwcmVnYWluKSAgICAgICAgICAgICsgZXhwKC1hc2lnICogcHJlZ2FpbilcblxuKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoR2liYmVyaXNoKSB7XG5cbiAgbGV0IERpc3RvcnRpb24gPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBlZmZlY3QuZGVmYXVsdHMsIERpc3RvcnRpb24uZGVmYXVsdHMsIGlucHV0UHJvcHMpLFxuICAgICAgICBkaXN0b3J0aW9uID0gT2JqZWN0LmNyZWF0ZShlZmZlY3QpLFxuICAgICAgICBvdXQ7XG5cbiAgICBkaXN0b3J0aW9uLl9fY3JlYXRlR3JhcGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgaXNTdGVyZW8gPSBmYWxzZTtcbiAgICAgIGlmIChvdXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpc1N0ZXJlbyA9IHR5cGVvZiBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gJ3VuZGVmaW5lZCcgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNTdGVyZW8gPSBvdXQuaW5wdXQuaXNTdGVyZW87XG4gICAgICAgIG91dC5pc1N0ZXJlbyA9IGlzU3RlcmVvO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpbnB1dCA9IGcuaW4oJ2lucHV0JyksXG4gICAgICAgICAgICBpbnB1dEdhaW4gPSBnLmluKCdpbnB1dEdhaW4nKSxcbiAgICAgICAgICAgIHNoYXBlMSA9IGcuaW4oJ3NoYXBlMScpLFxuICAgICAgICAgICAgc2hhcGUyID0gZy5pbignc2hhcGUyJyksXG4gICAgICAgICAgICBwcmVnYWluID0gZy5pbigncHJlZ2FpbicpLFxuICAgICAgICAgICAgcG9zdGdhaW4gPSBnLmluKCdwb3N0Z2FpbicpO1xuXG4gICAgICBsZXQgbG91dDtcbiAgICAgIHtcbiAgICAgICAgJ3VzZSBqc2RzcCc7XG4gICAgICAgIGNvbnN0IGxpbnB1dCA9IGlzU3RlcmVvID8gZy5tdWwoaW5wdXRbMF0sIGlucHV0R2FpbikgOiBnLm11bChpbnB1dCwgaW5wdXRHYWluKTtcbiAgICAgICAgY29uc3QgbHRvcCA9IGdlbmlzaC5zdWIoZy5leHAoZ2VuaXNoLm11bChsaW5wdXQsIGdlbmlzaC5hZGQoc2hhcGUxLCBwcmVnYWluKSkpLCBnLmV4cChnZW5pc2gubXVsKGxpbnB1dCwgZ2VuaXNoLnN1YihzaGFwZTIsIHByZWdhaW4pKSkpO1xuICAgICAgICBjb25zdCBsYm90dG9tID0gZ2VuaXNoLmFkZChnLmV4cChnZW5pc2gubXVsKGxpbnB1dCwgcHJlZ2FpbikpLCBnLmV4cChnZW5pc2gubXVsKGdlbmlzaC5tdWwoLTEsIGxpbnB1dCksIHByZWdhaW4pKSk7XG4gICAgICAgIGxvdXQgPSBnZW5pc2gubXVsKGdlbmlzaC5kaXYobHRvcCwgbGJvdHRvbSksIHBvc3RnYWluKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzU3RlcmVvKSB7XG4gICAgICAgIGxldCByb3V0O1xuICAgICAgICB7XG4gICAgICAgICAgJ3VzZSBqc2RzcCc7XG4gICAgICAgICAgY29uc3QgcmlucHV0ID0gaXNTdGVyZW8gPyBnLm11bChpbnB1dFsxXSwgaW5wdXRHYWluKSA6IGcubXVsKGlucHV0LCBpbnB1dEdhaW4pO1xuICAgICAgICAgIGNvbnN0IHJ0b3AgPSBnZW5pc2guc3ViKGcuZXhwKGdlbmlzaC5tdWwocmlucHV0LCBnZW5pc2guYWRkKHNoYXBlMSwgcHJlZ2FpbikpKSwgZy5leHAoZ2VuaXNoLm11bChyaW5wdXQsIGdlbmlzaC5zdWIoc2hhcGUyLCBwcmVnYWluKSkpKTtcbiAgICAgICAgICBjb25zdCByYm90dG9tID0gZ2VuaXNoLmFkZChnLmV4cChnZW5pc2gubXVsKHJpbnB1dCwgcHJlZ2FpbikpLCBnLmV4cChnZW5pc2gubXVsKGdlbmlzaC5tdWwoLTEsIHJpbnB1dCksIHByZWdhaW4pKSk7XG4gICAgICAgICAgcm91dCA9IGdlbmlzaC5tdWwoZ2VuaXNoLmRpdihydG9wLCByYm90dG9tKSwgcG9zdGdhaW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgZGlzdG9ydGlvbi5ncmFwaCA9IFtsb3V0LCByb3V0XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRpc3RvcnRpb24uZ3JhcGggPSBsb3V0O1xuICAgICAgfVxuICAgIH07XG5cbiAgICBkaXN0b3J0aW9uLl9fY3JlYXRlR3JhcGgoKTtcbiAgICBkaXN0b3J0aW9uLl9fcmVxdWlyZXNSZWNvbXBpbGF0aW9uID0gWydpbnB1dCddO1xuXG4gICAgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoZGlzdG9ydGlvbiwgZGlzdG9ydGlvbi5ncmFwaCwgWydmeCcsICdkaXN0b3J0aW9uJ10sIHByb3BzKTtcbiAgICByZXR1cm4gb3V0O1xuICB9O1xuXG4gIERpc3RvcnRpb24uZGVmYXVsdHMgPSB7XG4gICAgaW5wdXQ6IDAsXG4gICAgc2hhcGUxOiAuMSxcbiAgICBzaGFwZTI6IC4xLFxuICAgIHByZWdhaW46IDUsXG4gICAgcG9zdGdhaW46IC41XG4gIH07XG5cbiAgcmV0dXJuIERpc3RvcnRpb247XG59OyIsImxldCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICkoKVxuXG5sZXQgZWZmZWN0ID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbk9iamVjdC5hc3NpZ24oIGVmZmVjdCwge1xuICBkZWZhdWx0czogeyBieXBhc3M6ZmFsc2UsIGlucHV0R2FpbjoxIH0sXG4gIHR5cGU6J2VmZmVjdCdcbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gZWZmZWN0XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgZWZmZWN0cyA9IHtcbiAgICBGcmVldmVyYiAgICA6IHJlcXVpcmUoICcuL2ZyZWV2ZXJiLmpzJyAgKSggR2liYmVyaXNoICksXG4gICAgUGxhdGUgICAgICAgOiByZXF1aXJlKCAnLi9kYXR0b3Jyby5qcycgICkoIEdpYmJlcmlzaCApLFxuICAgIEZsYW5nZXIgICAgIDogcmVxdWlyZSggJy4vZmxhbmdlci5qcycgICApKCBHaWJiZXJpc2ggKSxcbiAgICBWaWJyYXRvICAgICA6IHJlcXVpcmUoICcuL3ZpYnJhdG8uanMnICAgKSggR2liYmVyaXNoICksXG4gICAgRGVsYXkgICAgICAgOiByZXF1aXJlKCAnLi9kZWxheS5qcycgICAgICkoIEdpYmJlcmlzaCApLFxuICAgIEJpdENydXNoZXIgIDogcmVxdWlyZSggJy4vYml0Q3J1c2hlci5qcycpKCBHaWJiZXJpc2ggKSxcbiAgICBEaXN0b3J0aW9uICA6IHJlcXVpcmUoICcuL2Rpc3RvcnRpb24uanMnKSggR2liYmVyaXNoICksXG4gICAgUmluZ01vZCAgICAgOiByZXF1aXJlKCAnLi9yaW5nTW9kLmpzJyAgICkoIEdpYmJlcmlzaCApLFxuICAgIFRyZW1vbG8gICAgIDogcmVxdWlyZSggJy4vdHJlbW9sby5qcycgICApKCBHaWJiZXJpc2ggKSxcbiAgICBDaG9ydXMgICAgICA6IHJlcXVpcmUoICcuL2Nob3J1cy5qcycgICAgKSggR2liYmVyaXNoICksXG4gICAgU2h1ZmZsZXIgICAgOiByZXF1aXJlKCAnLi9idWZmZXJTaHVmZmxlci5qcycgICkoIEdpYmJlcmlzaCApLFxuICAgIC8vR2F0ZSAgICAgICAgOiByZXF1aXJlKCAnLi9nYXRlLmpzJyAgICAgICkoIEdpYmJlcmlzaCApLFxuICB9XG5cbiAgZWZmZWN0cy5leHBvcnQgPSB0YXJnZXQgPT4ge1xuICAgIGZvciggbGV0IGtleSBpbiBlZmZlY3RzICkge1xuICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgIHRhcmdldFsga2V5IF0gPSBlZmZlY3RzWyBrZXkgXVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5yZXR1cm4gZWZmZWN0c1xuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgcHJvdG8gPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IEZsYW5nZXIgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzICAgPSBPYmplY3QuYXNzaWduKCB7IGRlbGF5TGVuZ3RoOjQ0MTAwIH0sIEZsYW5nZXIuZGVmYXVsdHMsIHByb3RvLmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICBmbGFuZ2VyID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIG91dFxuXG4gIGZsYW5nZXIuX19jcmVhdGVHcmFwaCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBpc1N0ZXJlbyA9IGZhbHNlXG4gICAgaWYoIG91dCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgaXNTdGVyZW8gPSB0eXBlb2YgcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09ICd1bmRlZmluZWQnID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiBmYWxzZSBcbiAgICB9ZWxzZXtcbiAgICAgIGlzU3RlcmVvID0gb3V0LmlucHV0LmlzU3RlcmVvXG4gICAgICBvdXQuaXNTdGVyZW8gPSBpc1N0ZXJlb1xuICAgIH1cblxuICAgIGNvbnN0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgICAgIGlucHV0R2FpbiA9IGcuaW4oICdpbnB1dEdhaW4nICksXG4gICAgICAgICAgZGVsYXlMZW5ndGggPSBwcm9wcy5kZWxheUxlbmd0aCxcbiAgICAgICAgICBmZWVkYmFja0NvZWZmID0gZy5pbiggJ2ZlZWRiYWNrJyApLFxuICAgICAgICAgIG1vZEFtb3VudCA9IGcuaW4oICdvZmZzZXQnICksXG4gICAgICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgICBkZWxheUJ1ZmZlckwgPSBnLmRhdGEoIGRlbGF5TGVuZ3RoIClcblxuICAgIGNvbnN0IHdyaXRlSWR4ID0gZy5hY2N1bSggMSwwLCB7IG1pbjowLCBtYXg6ZGVsYXlMZW5ndGgsIGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pXG4gICAgXG4gICAgY29uc3Qgb2Zmc2V0ID0gZy5tdWwoIG1vZEFtb3VudCwgNTAwIClcblxuICAgIGNvbnN0IG1vZCA9IHByb3BzLm1vZCA9PT0gdW5kZWZpbmVkID8gZy5jeWNsZSggZnJlcXVlbmN5ICkgOiBwcm9wcy5tb2RcbiAgICBcbiAgICBjb25zdCByZWFkSWR4ID0gZy53cmFwKCBcbiAgICAgIGcuYWRkKCBcbiAgICAgICAgZy5zdWIoIHdyaXRlSWR4LCBvZmZzZXQgKSwgXG4gICAgICAgIG1vZC8vZy5tdWwoIG1vZCwgZy5zdWIoIG9mZnNldCwgMSApICkgXG4gICAgICApLCBcbiAgICAgIDAsIFxuICAgICAgZGVsYXlMZW5ndGhcbiAgICApXG5cbiAgICBjb25zdCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGlucHV0WzBdIDogaW5wdXRcblxuICAgIGNvbnN0IGRlbGF5ZWRPdXRMID0gZy5wZWVrKCBkZWxheUJ1ZmZlckwsIHJlYWRJZHgsIHsgaW50ZXJwOidsaW5lYXInLCBtb2RlOidzYW1wbGVzJyB9KVxuICAgIFxuICAgIGcucG9rZSggZGVsYXlCdWZmZXJMLCBnLmFkZCggbGVmdElucHV0LCBnLm11bCggZGVsYXllZE91dEwsIGZlZWRiYWNrQ29lZmYgKSApLCB3cml0ZUlkeCApXG5cbiAgICBjb25zdCBsZWZ0ID0gZy5hZGQoIGxlZnRJbnB1dCwgZGVsYXllZE91dEwgKVxuXG4gICAgaWYoIGlzU3RlcmVvID09PSB0cnVlICkge1xuICAgICAgY29uc3QgcmlnaHRJbnB1dCA9IGlucHV0WzFdXG4gICAgICBjb25zdCBkZWxheUJ1ZmZlclIgPSBnLmRhdGEoIGRlbGF5TGVuZ3RoIClcbiAgICAgIFxuICAgICAgbGV0IGRlbGF5ZWRPdXRSID0gZy5wZWVrKCBkZWxheUJ1ZmZlclIsIHJlYWRJZHgsIHsgaW50ZXJwOidsaW5lYXInLCBtb2RlOidzYW1wbGVzJyB9KVxuXG4gICAgICBnLnBva2UoIGRlbGF5QnVmZmVyUiwgZy5hZGQoIHJpZ2h0SW5wdXQsIGcubXVsKCBkZWxheWVkT3V0UiwgZmVlZGJhY2tDb2VmZiApICksIHdyaXRlSWR4IClcbiAgICAgIGNvbnN0IHJpZ2h0ID0gZy5hZGQoIHJpZ2h0SW5wdXQsIGRlbGF5ZWRPdXRSIClcblxuICAgICAgZmxhbmdlci5ncmFwaCA9IFsgbGVmdCwgcmlnaHQgXVxuXG4gICAgfWVsc2V7XG4gICAgICBmbGFuZ2VyLmdyYXBoID0gbGVmdFxuICAgIH1cbiAgfVxuXG4gIGZsYW5nZXIuX19jcmVhdGVHcmFwaCgpXG4gIGZsYW5nZXIuX19yZXF1aXJlc1JlY29tcGlsYXRpb24gPSBbICdpbnB1dCcgXVxuXG4gIG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICBmbGFuZ2VyLFxuICAgIGZsYW5nZXIuZ3JhcGgsIFxuICAgIFsnZngnLCdmbGFuZ2VyJ10sIFxuICAgIHByb3BzIFxuICApIFxuXG4gIHJldHVybiBvdXQgXG59XG5cbkZsYW5nZXIuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIGZlZWRiYWNrOi4wMSxcbiAgb2Zmc2V0Oi4yNSxcbiAgZnJlcXVlbmN5Oi41XG59XG5cbnJldHVybiBGbGFuZ2VyXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgXG5jb25zdCBhbGxQYXNzID0gR2liYmVyaXNoLmZpbHRlcnMuZ2VuaXNoLkFsbFBhc3NcbmNvbnN0IGNvbWJGaWx0ZXIgPSBHaWJiZXJpc2guZmlsdGVycy5nZW5pc2guQ29tYlxuXG5jb25zdCB0dW5pbmcgPSB7XG4gIGNvbWJDb3VudDpcdCAgXHQ4LFxuICBjb21iVHVuaW5nOiBcdFx0WyAxMTE2LCAxMTg4LCAxMjc3LCAxMzU2LCAxNDIyLCAxNDkxLCAxNTU3LCAxNjE3IF0sICAgICAgICAgICAgICAgICAgICBcbiAgYWxsUGFzc0NvdW50OiBcdDQsXG4gIGFsbFBhc3NUdW5pbmc6XHRbIDIyNSwgNTU2LCA0NDEsIDM0MSBdLFxuICBhbGxQYXNzRmVlZGJhY2s6MC41LFxuICBmaXhlZEdhaW46IFx0XHQgIDAuMDE1LFxuICBzY2FsZURhbXBpbmc6IFx0MC40LFxuICBzY2FsZVJvb206IFx0XHQgIDAuMjgsXG4gIG9mZnNldFJvb206IFx0ICAwLjcsXG4gIHN0ZXJlb1NwcmVhZDogICAyM1xufVxuXG5jb25zdCBGcmVldmVyYiA9IGlucHV0UHJvcHMgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBlZmZlY3QuZGVmYXVsdHMsIEZyZWV2ZXJiLmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICAgIHJldmVyYiA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApIFxuXG4gIGxldCBvdXQgXG4gIHJldmVyYi5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGlzU3RlcmVvID0gZmFsc2VcbiAgICBpZiggb3V0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBpc1N0ZXJlbyA9IHR5cGVvZiBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gJ3VuZGVmaW5lZCcgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IGZhbHNlIFxuICAgIH1lbHNle1xuICAgICAgaXNTdGVyZW8gPSBvdXQuaW5wdXQuaXNTdGVyZW9cbiAgICB9ICAgIFxuXG4gICAgY29uc3QgY29tYnNMID0gW10sIGNvbWJzUiA9IFtdXG5cbiAgICBjb25zdCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgICAgICBpbnB1dEdhaW4gPSBnLmluKCAnaW5wdXRHYWluJyApLFxuICAgICAgICAgIHdldDEgPSBnLmluKCAnd2V0MScpLFxuICAgICAgICAgIHdldDIgPSBnLmluKCAnd2V0MicgKSwgIFxuICAgICAgICAgIGRyeSA9IGcuaW4oICdkcnknICksIFxuICAgICAgICAgIHJvb21TaXplID0gZy5pbiggJ3Jvb21TaXplJyApLCBcbiAgICAgICAgICBkYW1waW5nID0gZy5pbiggJ2RhbXBpbmcnIClcbiAgICBcbiAgICBjb25zdCBfX3N1bW1lZElucHV0ID0gaXNTdGVyZW8gPT09IHRydWUgPyBnLmFkZCggaW5wdXRbMF0sIGlucHV0WzFdICkgOiBpbnB1dCxcbiAgICAgICAgIHN1bW1lZElucHV0ID0gZy5tdWwoIF9fc3VtbWVkSW5wdXQsIGlucHV0R2FpbiApLFxuICAgICAgICAgYXR0ZW51YXRlZElucHV0ID0gZy5tZW1vKCBnLm11bCggc3VtbWVkSW5wdXQsIHR1bmluZy5maXhlZEdhaW4gKSApXG4gICAgXG4gICAgLy8gY3JlYXRlIGNvbWIgZmlsdGVycyBpbiBwYXJhbGxlbC4uLlxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgODsgaSsrICkgeyBcbiAgICAgIGNvbWJzTC5wdXNoKCBcbiAgICAgICAgY29tYkZpbHRlciggXG4gICAgICAgICAgYXR0ZW51YXRlZElucHV0LCBcbiAgICAgICAgICB0dW5pbmcuY29tYlR1bmluZ1tpXSwgXG4gICAgICAgICAgZy5tdWwoZGFtcGluZywuNCksXG4gICAgICAgICAgZy5tdWwoIHR1bmluZy5zY2FsZVJvb20gKyB0dW5pbmcub2Zmc2V0Um9vbSwgcm9vbVNpemUgKSBcbiAgICAgICAgKSBcbiAgICAgIClcbiAgICAgIGNvbWJzUi5wdXNoKCBcbiAgICAgICAgY29tYkZpbHRlciggXG4gICAgICAgICAgYXR0ZW51YXRlZElucHV0LCBcbiAgICAgICAgICB0dW5pbmcuY29tYlR1bmluZ1tpXSArIHR1bmluZy5zdGVyZW9TcHJlYWQsIFxuICAgICAgICAgIGcubXVsKGRhbXBpbmcsLjQpLCBcbiAgICAgICAgICBnLm11bCggdHVuaW5nLnNjYWxlUm9vbSArIHR1bmluZy5vZmZzZXRSb29tLCByb29tU2l6ZSApIFxuICAgICAgICApIFxuICAgICAgKVxuICAgIH1cbiAgICBcbiAgICAvLyAuLi4gYW5kIHN1bSB0aGVtIHdpdGggYXR0ZW51YXRlZCBpbnB1dCwgdXNlIG9mIGxldCBpcyBkZWxpYmVyYXRlIGhlcmVcbiAgICBsZXQgb3V0TCA9IGcuYWRkKCBhdHRlbnVhdGVkSW5wdXQsIC4uLmNvbWJzTCApXG4gICAgbGV0IG91dFIgPSBnLmFkZCggYXR0ZW51YXRlZElucHV0LCAuLi5jb21ic1IgKVxuICAgIFxuICAgIC8vIHJ1biB0aHJvdWdoIGFsbHBhc3MgZmlsdGVycyBpbiBzZXJpZXNcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IDQ7IGkrKyApIHsgXG4gICAgICBvdXRMID0gYWxsUGFzcyggb3V0TCwgdHVuaW5nLmFsbFBhc3NUdW5pbmdbIGkgXSArIHR1bmluZy5zdGVyZW9TcHJlYWQgKVxuICAgICAgb3V0UiA9IGFsbFBhc3MoIG91dFIsIHR1bmluZy5hbGxQYXNzVHVuaW5nWyBpIF0gKyB0dW5pbmcuc3RlcmVvU3ByZWFkIClcbiAgICB9XG4gICAgXG4gICAgY29uc3Qgb3V0cHV0TCA9IGcuYWRkKCBnLm11bCggb3V0TCwgd2V0MSApLCBnLm11bCggb3V0Uiwgd2V0MiApLCBnLm11bCggaXNTdGVyZW8gPT09IHRydWUgPyBpbnB1dFswXSA6IGlucHV0LCBkcnkgKSApLFxuICAgICAgICAgIG91dHB1dFIgPSBnLmFkZCggZy5tdWwoIG91dFIsIHdldDEgKSwgZy5tdWwoIG91dEwsIHdldDIgKSwgZy5tdWwoIGlzU3RlcmVvID09PSB0cnVlID8gaW5wdXRbMV0gOiBpbnB1dCwgZHJ5ICkgKVxuXG4gICAgcmV2ZXJiLmdyYXBoID0gWyBvdXRwdXRMLCBvdXRwdXRSIF1cbiAgfVxuXG4gIHJldmVyYi5fX2NyZWF0ZUdyYXBoKClcbiAgcmV2ZXJiLl9fcmVxdWlyZXNSZWNvbXBpbGF0aW9uID0gWyAnaW5wdXQnIF1cblxuICBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeSggcmV2ZXJiLCByZXZlcmIuZ3JhcGgsIFsnZngnLCdmcmVldmVyYiddLCBwcm9wcyApXG5cbiAgcmV0dXJuIG91dFxufVxuXG5cbkZyZWV2ZXJiLmRlZmF1bHRzID0ge1xuICBpbnB1dDogMCxcbiAgd2V0MTogMSxcbiAgd2V0MjogMCxcbiAgZHJ5OiAuNSxcbiAgcm9vbVNpemU6IC45MjUsXG4gIGRhbXBpbmc6ICAuNSxcbn1cblxucmV0dXJuIEZyZWV2ZXJiIFxuXG59XG5cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBlZmZlY3QgPSByZXF1aXJlKCAnLi9lZmZlY3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuIFxubGV0IFJpbmdNb2QgPSBpbnB1dFByb3BzID0+IHtcbiAgbGV0IHByb3BzICAgPSBPYmplY3QuYXNzaWduKCB7fSwgUmluZ01vZC5kZWZhdWx0cywgZWZmZWN0LmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICByaW5nTW9kID0gT2JqZWN0LmNyZWF0ZSggZWZmZWN0ICksXG4gICAgICBvdXRcblxuICByaW5nTW9kLl9fY3JlYXRlR3JhcGggPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgaXNTdGVyZW8gPSBmYWxzZVxuICAgIGlmKCBvdXQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGlzU3RlcmVvID0gdHlwZW9mIHByb3BzLmlucHV0LmlzU3RlcmVvICE9PSAndW5kZWZpbmVkJyA/IHByb3BzLmlucHV0LmlzU3RlcmVvIDogZmFsc2UgXG4gICAgfWVsc2V7XG4gICAgICBpc1N0ZXJlbyA9IG91dC5pbnB1dC5pc1N0ZXJlb1xuICAgICAgb3V0LmlzU3RlcmVvID0gaXNTdGVyZW9cbiAgICB9ICAgIFxuXG4gICAgY29uc3QgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICAgICAgaW5wdXRHYWluID0gZy5pbiggJ2lucHV0R2FpbicgKSxcbiAgICAgICAgICBmcmVxdWVuY3kgPSBnLmluKCAnZnJlcXVlbmN5JyApLFxuICAgICAgICAgIGdhaW4gPSBnLmluKCAnZ2FpbicgKSxcbiAgICAgICAgICBtaXggPSBnLmluKCAnbWl4JyApXG4gICAgXG4gICAgY29uc3QgbGVmdElucHV0ID0gaXNTdGVyZW8gPyBnLm11bCggaW5wdXRbMF0sIGlucHV0R2FpbiApIDogZy5tdWwoIGlucHV0LCBpbnB1dEdhaW4gKSxcbiAgICAgICAgICBzaW5lID0gZy5tdWwoIGcuY3ljbGUoIGZyZXF1ZW5jeSApLCBnYWluIClcbiAgIFxuICAgIGNvbnN0IGxlZnQgPSBnLmFkZCggZy5tdWwoIGxlZnRJbnB1dCwgZy5zdWIoIDEsIG1peCApKSwgZy5tdWwoIGcubXVsKCBsZWZ0SW5wdXQsIHNpbmUgKSwgbWl4ICkgKSBcbiAgICAgICAgXG4gICAgaWYoIGlzU3RlcmVvID09PSB0cnVlICkge1xuICAgICAgY29uc3QgcmlnaHRJbnB1dCA9IGcubXVsKCBpbnB1dFsxXSwgaW5wdXRHYWluICksXG4gICAgICAgICAgICByaWdodCA9IGcuYWRkKCBnLm11bCggcmlnaHRJbnB1dCwgZy5zdWIoIDEsIG1peCApKSwgZy5tdWwoIGcubXVsKCByaWdodElucHV0LCBzaW5lICksIG1peCApICkgXG4gICAgICBcbiAgICAgIHJpbmdNb2QuZ3JhcGggPSBbIGxlZnQsIHJpZ2h0IF1cbiAgICB9ZWxzZXtcbiAgICAgIHJpbmdNb2QuZ3JhcGggPSBsZWZ0XG4gICAgfVxuICB9XG5cbiAgcmluZ01vZC5fX2NyZWF0ZUdyYXBoKCkgXG4gIHJpbmdNb2QuX19yZXF1aXJlc1JlY29tcGlsYXRpb24gPSBbICdpbnB1dCcgXVxuXG4gIG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICByaW5nTW9kLFxuICAgIHJpbmdNb2QuZ3JhcGgsIFxuICAgIFsgJ2Z4JywncmluZ01vZCddLCBcbiAgICBwcm9wcyBcbiAgKVxuICBcbiAgcmV0dXJuIG91dCBcbn1cblxuUmluZ01vZC5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgZnJlcXVlbmN5OjIyMCxcbiAgZ2FpbjogMSwgXG4gIG1peDoxXG59XG5cbnJldHVybiBSaW5nTW9kXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgZWZmZWN0ID0gcmVxdWlyZSggJy4vZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiBcbmNvbnN0IFRyZW1vbG8gPSBpbnB1dFByb3BzID0+IHtcbiAgY29uc3QgcHJvcHMgICA9IE9iamVjdC5hc3NpZ24oIHt9LCBUcmVtb2xvLmRlZmF1bHRzLCBlZmZlY3QuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgICAgdHJlbW9sbyA9IE9iamVjdC5jcmVhdGUoIGVmZmVjdCApXG4gIFxuICBsZXQgb3V0XG4gIHRyZW1vbG8uX19jcmVhdGVHcmFwaCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBpc1N0ZXJlbyA9IGZhbHNlXG4gICAgaWYoIG91dCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgaXNTdGVyZW8gPSB0eXBlb2YgcHJvcHMuaW5wdXQuaXNTdGVyZW8gIT09ICd1bmRlZmluZWQnID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiBmYWxzZSBcbiAgICB9ZWxzZXtcbiAgICAgIGlzU3RlcmVvID0gb3V0LmlucHV0LmlzU3RlcmVvXG4gICAgICBvdXQuaXNTdGVyZW8gPSBpc1N0ZXJlb1xuICAgIH0gICAgXG5cbiAgICBjb25zdCBpbnB1dCA9IGcuaW4oICdpbnB1dCcgKSxcbiAgICAgICAgICBpbnB1dEdhaW4gPSBnLmluKCAnaW5wdXRHYWluJyApLFxuICAgICAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oICdmcmVxdWVuY3knICksXG4gICAgICAgICAgYW1vdW50ID0gZy5pbiggJ2Ftb3VudCcgKVxuICAgIFxuICAgIGNvbnN0IGxlZnRJbnB1dCA9IGlzU3RlcmVvID8gZy5tdWwoIGlucHV0WzBdLCBpbnB1dEdhaW4gKSA6IGcubXVsKCBpbnB1dCwgaW5wdXRHYWluIClcblxuICAgIGxldCBvc2NcbiAgICBpZiggcHJvcHMuc2hhcGUgPT09ICdzcXVhcmUnICkge1xuICAgICAgb3NjID0gZy5ndCggZy5waGFzb3IoIGZyZXF1ZW5jeSApLCAwIClcbiAgICB9ZWxzZSBpZiggcHJvcHMuc2hhcGUgPT09ICdzYXcnICkge1xuICAgICAgb3NjID0gZy5ndHAoIGcucGhhc29yKCBmcmVxdWVuY3kgKSwgMCApXG4gICAgfWVsc2V7XG4gICAgICBvc2MgPSBnLmN5Y2xlKCBmcmVxdWVuY3kgKVxuICAgIH1cblxuICAgIGNvbnN0IG1vZCA9IGcubXVsKCBvc2MsIGFtb3VudCApXG4gICBcbiAgICBjb25zdCBsZWZ0ID0gZy5zdWIoIGxlZnRJbnB1dCwgZy5tdWwoIGxlZnRJbnB1dCwgbW9kICkgKVxuXG4gICAgaWYoIGlzU3RlcmVvID09PSB0cnVlICkge1xuICAgICAgY29uc3QgcmlnaHRJbnB1dCA9IGcubXVsKCBpbnB1dFsxXSwgaW5wdXRHYWluICksXG4gICAgICAgICAgICByaWdodCA9IGcubXVsKCByaWdodElucHV0LCBtb2QgKVxuXG4gICAgICB0cmVtb2xvLmdyYXBoID0gWyBsZWZ0LCByaWdodCBdXG4gICAgfWVsc2V7XG4gICAgICB0cmVtb2xvLmdyYXBoID0gbGVmdFxuICAgIH1cbiAgfVxuICBcbiAgdHJlbW9sby5fX2NyZWF0ZUdyYXBoKClcbiAgdHJlbW9sby5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiA9IFsgJ2lucHV0JyBdXG5cbiAgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgIHRyZW1vbG8sXG4gICAgdHJlbW9sby5ncmFwaCxcbiAgICBbJ2Z4JywndHJlbW9sbyddLCBcbiAgICBwcm9wcyBcbiAgKSBcbiAgcmV0dXJuIG91dCBcbn1cblxuVHJlbW9sby5kZWZhdWx0cyA9IHtcbiAgaW5wdXQ6MCxcbiAgZnJlcXVlbmN5OjIsXG4gIGFtb3VudDogMSwgXG4gIHNoYXBlOidzaW5lJ1xufVxuXG5yZXR1cm4gVHJlbW9sb1xuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICAgIGVmZmVjdCA9IHJlcXVpcmUoICcuL2VmZmVjdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5jb25zdCBWaWJyYXRvID0gaW5wdXRQcm9wcyA9PiB7XG4gIGNvbnN0IHByb3BzICAgPSBPYmplY3QuYXNzaWduKCB7fSwgVmlicmF0by5kZWZhdWx0cywgZWZmZWN0LmRlZmF1bHRzLCBpbnB1dFByb3BzICksXG4gICAgICAgIHZpYnJhdG8gPSBPYmplY3QuY3JlYXRlKCBlZmZlY3QgKVxuXG4gIGxldCBvdXRcbiAgdmlicmF0by5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGlzU3RlcmVvID0gZmFsc2VcbiAgICBpZiggb3V0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBpc1N0ZXJlbyA9IHR5cGVvZiBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gJ3VuZGVmaW5lZCcgPyBwcm9wcy5pbnB1dC5pc1N0ZXJlbyA6IGZhbHNlIFxuICAgIH1lbHNle1xuICAgICAgaXNTdGVyZW8gPSBvdXQuaW5wdXQuaXNTdGVyZW9cbiAgICAgIG91dC5pc1N0ZXJlbyA9IGlzU3RlcmVvXG4gICAgfSAgICBcblxuICAgIGNvbnN0IGlucHV0ID0gZy5pbiggJ2lucHV0JyApLFxuICAgICAgICAgIGlucHV0R2FpbiA9IGcuaW4oICdpbnB1dEdhaW4nICksXG4gICAgICAgICAgZGVsYXlMZW5ndGggPSA0NDEwMCxcbiAgICAgICAgICBmZWVkYmFja0NvZWZmID0gZy5pbiggJ2ZlZWRiYWNrJyApLFxuICAgICAgICAgIG1vZEFtb3VudCA9IGcuaW4oICdhbW91bnQnICksXG4gICAgICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgICBkZWxheUJ1ZmZlckwgPSBnLmRhdGEoIGRlbGF5TGVuZ3RoIClcblxuICAgIGNvbnN0IHdyaXRlSWR4ID0gZy5hY2N1bSggMSwwLCB7IG1pbjowLCBtYXg6ZGVsYXlMZW5ndGgsIGludGVycDonbm9uZScsIG1vZGU6J3NhbXBsZXMnIH0pXG4gICAgXG4gICAgY29uc3Qgb2Zmc2V0ID0gZy5tdWwoIG1vZEFtb3VudCwgNTAwIClcbiAgICBcbiAgICBjb25zdCByZWFkSWR4ID0gZy53cmFwKCBcbiAgICAgIGcuYWRkKCBcbiAgICAgICAgZy5zdWIoIHdyaXRlSWR4LCBvZmZzZXQgKSwgXG4gICAgICAgIGcubXVsKCBnLmN5Y2xlKCBmcmVxdWVuY3kgKSwgZy5zdWIoIG9mZnNldCwgMSApICkgXG4gICAgICApLCBcbiAgICAgIDAsIFxuICAgICAgZGVsYXlMZW5ndGhcbiAgICApXG5cbiAgICBjb25zdCBsZWZ0SW5wdXQgPSBpc1N0ZXJlbyA/IGcubXVsKCBpbnB1dFswXSwgaW5wdXRHYWluICkgOiBnLm11bCggaW5wdXQsIGlucHV0R2FpbiApXG5cbiAgICBjb25zdCBkZWxheWVkT3V0TCA9IGcucGVlayggZGVsYXlCdWZmZXJMLCByZWFkSWR4LCB7IGludGVycDonbGluZWFyJywgbW9kZTonc2FtcGxlcycgfSlcbiAgICBcbiAgICBnLnBva2UoIGRlbGF5QnVmZmVyTCwgZy5hZGQoIGxlZnRJbnB1dCwgZy5tdWwoIGRlbGF5ZWRPdXRMLCBmZWVkYmFja0NvZWZmICkgKSwgd3JpdGVJZHggKVxuXG4gICAgY29uc3QgbGVmdCA9IGRlbGF5ZWRPdXRMXG5cbiAgICBpZiggaXNTdGVyZW8gPT09IHRydWUgKSB7XG4gICAgICBjb25zdCByaWdodElucHV0ID0gZy5tdWwoIGlucHV0WzFdLCBpbnB1dEdhaW4gKVxuICAgICAgY29uc3QgZGVsYXlCdWZmZXJSID0gZy5kYXRhKCBkZWxheUxlbmd0aCApXG4gICAgICBcbiAgICAgIGNvbnN0IGRlbGF5ZWRPdXRSID0gZy5wZWVrKCBkZWxheUJ1ZmZlclIsIHJlYWRJZHgsIHsgaW50ZXJwOidsaW5lYXInLCBtb2RlOidzYW1wbGVzJyB9KVxuXG4gICAgICBnLnBva2UoIGRlbGF5QnVmZmVyUiwgZy5hZGQoIHJpZ2h0SW5wdXQsIG11bCggZGVsYXllZE91dFIsIGZlZWRiYWNrQ29lZmYgKSApLCB3cml0ZUlkeCApXG4gICAgICBjb25zdCByaWdodCA9IGRlbGF5ZWRPdXRSXG5cbiAgICAgIHZpYnJhdG8uZ3JhcGggPSBbIGxlZnQsIHJpZ2h0IF1cbiAgICB9ZWxzZXtcbiAgICAgIHZpYnJhdG8uZ3JhcGggPSBsZWZ0IFxuICAgIH1cbiAgfVxuXG4gIHZpYnJhdG8uX19jcmVhdGVHcmFwaCgpXG4gIHZpYnJhdG8uX19yZXF1aXJlc1JlY29tcGlsYXRpb24gPSBbICdpbnB1dCcgXVxuXG4gIG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBcbiAgICB2aWJyYXRvLFxuICAgIHZpYnJhdG8uZ3JhcGgsICAgIFxuICAgIFsgJ2Z4JywgJ3ZpYnJhdG8nIF0sIFxuICAgIHByb3BzIFxuICApIFxuICByZXR1cm4gb3V0IFxufVxuXG5WaWJyYXRvLmRlZmF1bHRzID0ge1xuICBpbnB1dDowLFxuICBmZWVkYmFjazouMDEsXG4gIGFtb3VudDouNSxcbiAgZnJlcXVlbmN5OjRcbn1cblxucmV0dXJuIFZpYnJhdG9cblxufVxuIiwibGV0IE1lbW9yeUhlbHBlciA9IHJlcXVpcmUoICdtZW1vcnktaGVscGVyJyApLFxuICAgIGdlbmlzaCAgICAgICA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcbiAgICBcbmxldCBHaWJiZXJpc2ggPSB7XG4gIGJsb2NrQ2FsbGJhY2tzOiBbXSwgLy8gY2FsbGVkIGV2ZXJ5IGJsb2NrXG4gIGRpcnR5VWdlbnM6IFtdLFxuICBjYWxsYmFja1VnZW5zOiBbXSxcbiAgY2FsbGJhY2tOYW1lczogW10sXG4gIGFuYWx5emVyczogW10sXG4gIGdyYXBoSXNEaXJ0eTogZmFsc2UsXG4gIHVnZW5zOiB7fSxcbiAgZGVidWc6IGZhbHNlLFxuICBpZDogLTEsXG4gIHByZXZlbnRQcm94eTpmYWxzZSxcbiAgcHJveHlFbmFibGVkOiB0cnVlLFxuXG4gIG91dHB1dDogbnVsbCxcblxuICBtZW1vcnkgOiBudWxsLCAvLyAyMCBtaW51dGVzIGJ5IGRlZmF1bHQ/XG4gIGZhY3Rvcnk6IG51bGwsIFxuICBnZW5pc2gsXG4gIHNjaGVkdWxlcjogcmVxdWlyZSggJy4vc2NoZWR1bGluZy9zY2hlZHVsZXIuanMnICksXG4gIC8vd29ya2xldFByb2Nlc3NvckxvYWRlcjogcmVxdWlyZSggJy4vd29ya2xldFByb2Nlc3Nvci5qcycgKSxcbiAgd29ya2xldFByb2Nlc3NvcjogbnVsbCxcblxuICBtZW1vZWQ6IHt9LFxuICBtb2RlOidzY3JpcHRQcm9jZXNzb3InLFxuXG4gIHByb3RvdHlwZXM6IHtcbiAgICB1Z2VuOiBudWxsLC8vcmVxdWlyZSgnLi91Z2VuLmpzJyksXG4gICAgaW5zdHJ1bWVudDogcmVxdWlyZSggJy4vaW5zdHJ1bWVudHMvaW5zdHJ1bWVudC5qcycgKSxcbiAgICBlZmZlY3Q6IHJlcXVpcmUoICcuL2Z4L2VmZmVjdC5qcycgKSxcbiAgfSxcblxuICBtaXhpbnM6IHtcbiAgICBwb2x5aW5zdHJ1bWVudDogcmVxdWlyZSggJy4vaW5zdHJ1bWVudHMvcG9seU1peGluLmpzJyApXG4gIH0sXG5cbiAgd29ya2xldFBhdGg6ICcuL2dpYmJlcmlzaF93b3JrbGV0LmpzJyxcbiAgaW5pdCggbWVtQW1vdW50LCBjdHgsIG1vZGUgKSB7XG5cbiAgICBsZXQgbnVtQnl0ZXMgPSBpc05hTiggbWVtQW1vdW50ICkgPyAyMCAqIDYwICogNDQxMDAgOiBtZW1BbW91bnRcblxuICAgIC8vIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciBvciBub3QgZ2liYmVyaXNoIGlzIHVzaW5nIHdvcmtsZXRzLFxuICAgIC8vIHdlIHN0aWxsIHdhbnQgZ2VuaXNoIHRvIG91dHB1dCB2YW5pbGxhIGpzIGZ1bmN0aW9ucyBpbnN0ZWFkXG4gICAgLy8gb2YgYXVkaW8gd29ya2xldCBjbGFzc2VzOyB0aGVzZSBmdW5jdGlvbnMgd2lsbCBiZSBjYWxsZWRcbiAgICAvLyBmcm9tIHdpdGhpbiB0aGUgZ2liYmVyaXNoIGF1ZGlvd29ya2xldCBwcm9jZXNzb3Igbm9kZS5cbiAgICB0aGlzLmdlbmlzaC5nZW4ubW9kZSA9ICdzY3JpcHRQcm9jZXNzb3InXG5cbiAgICB0aGlzLm1lbW9yeSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIG51bUJ5dGVzLCBGbG9hdDY0QXJyYXkgKVxuXG4gICAgdGhpcy5tb2RlID0gd2luZG93LkF1ZGlvV29ya2xldCAhPT0gdW5kZWZpbmVkID8gJ3dvcmtsZXQnIDogJ3NjcmlwdHByb2Nlc3NvcidcbiAgICBpZiggbW9kZSAhPT0gdW5kZWZpbmVkICkgdGhpcy5tb2RlID0gbW9kZVxuXG4gICAgdGhpcy5oYXNXb3JrbGV0ID0gd2luZG93LkF1ZGlvV29ya2xldCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiB3aW5kb3cuQXVkaW9Xb3JrbGV0ID09PSAnZnVuY3Rpb24nXG5cbiAgICBjb25zdCBzdGFydHVwID0gdGhpcy5oYXNXb3JrbGV0ID8gdGhpcy51dGlsaXRpZXMuY3JlYXRlV29ya2xldCA6IHRoaXMudXRpbGl0aWVzLmNyZWF0ZVNjcmlwdFByb2Nlc3NvclxuICAgIFxuICAgIHRoaXMuYW5hbHl6ZXJzLmRpcnR5ID0gZmFsc2VcblxuICAgIGlmKCB0aGlzLm1vZGUgPT09ICd3b3JrbGV0JyApIHtcblxuICAgICAgY29uc3QgcCA9IG5ldyBQcm9taXNlKCAocmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuXG4gICAgICAgIGNvbnN0IHBwID0gbmV3IFByb21pc2UoIChfX3Jlc29sdmUsIF9fcmVqZWN0ICkgPT4ge1xuICAgICAgICAgIHRoaXMudXRpbGl0aWVzLmNyZWF0ZUNvbnRleHQoIGN0eCwgc3RhcnR1cC5iaW5kKCB0aGlzLnV0aWxpdGllcyApLCBfX3Jlc29sdmUgKVxuICAgICAgICB9KS50aGVuKCAoKT0+IHtcbiAgICAgICAgICBHaWJiZXJpc2gucHJldmVudFByb3h5ID0gdHJ1ZVxuICAgICAgICAgIEdpYmJlcmlzaC5sb2FkKClcbiAgICAgICAgICBHaWJiZXJpc2gub3V0cHV0ID0gdGhpcy5CdXMyKClcbiAgICAgICAgICBHaWJiZXJpc2gucHJldmVudFByb3h5ID0gZmFsc2VcblxuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICB9KVxuXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHBcbiAgICB9ZWxzZSBpZiggdGhpcy5tb2RlID09PSAncHJvY2Vzc29yJyApIHtcbiAgICAgIEdpYmJlcmlzaC5sb2FkKClcbiAgICAgIEdpYmJlcmlzaC5vdXRwdXQgPSB0aGlzLkJ1czIoKVxuICAgICAgR2liYmVyaXNoLmNhbGxiYWNrID0gR2liYmVyaXNoLmdlbmVyYXRlQ2FsbGJhY2soKVxuICAgIH1cblxuXG4gIH0sXG5cbiAgbG9hZCgpIHtcbiAgICB0aGlzLmZhY3RvcnkgPSByZXF1aXJlKCAnLi91Z2VuVGVtcGxhdGUuanMnICkoIHRoaXMgKVxuICAgIFxuICAgIHRoaXMuUGFubmVyICAgICAgID0gcmVxdWlyZSggJy4vbWlzYy9wYW5uZXIuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuUG9seVRlbXBsYXRlID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudHMvcG9seXRlbXBsYXRlLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLm9zY2lsbGF0b3JzICA9IHJlcXVpcmUoICcuL29zY2lsbGF0b3JzL29zY2lsbGF0b3JzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLmZpbHRlcnMgICAgICA9IHJlcXVpcmUoICcuL2ZpbHRlcnMvZmlsdGVycy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5iaW5vcHMgICAgICAgPSByZXF1aXJlKCAnLi9taXNjL2Jpbm9wcy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5tb25vcHMgICAgICAgPSByZXF1aXJlKCAnLi9taXNjL21vbm9wcy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5CdXMgICAgICAgICAgPSByZXF1aXJlKCAnLi9taXNjL2J1cy5qcycgKSggdGhpcyApXG4gICAgdGhpcy5CdXMyICAgICAgICAgPSByZXF1aXJlKCAnLi9taXNjL2J1czIuanMnICkoIHRoaXMgKTtcbiAgICB0aGlzLmluc3RydW1lbnRzICA9IHJlcXVpcmUoICcuL2luc3RydW1lbnRzL2luc3RydW1lbnRzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLmZ4ICAgICAgICAgICA9IHJlcXVpcmUoICcuL2Z4L2VmZmVjdHMuanMnICkoIHRoaXMgKVxuICAgIHRoaXMuU2VxdWVuY2VyICAgID0gcmVxdWlyZSggJy4vc2NoZWR1bGluZy9zZXF1ZW5jZXIuanMnICkoIHRoaXMgKTtcbiAgICB0aGlzLlNlcXVlbmNlcjIgICA9IHJlcXVpcmUoICcuL3NjaGVkdWxpbmcvc2VxMi5qcycgKSggdGhpcyApO1xuICAgIHRoaXMuZW52ZWxvcGVzICAgID0gcmVxdWlyZSggJy4vZW52ZWxvcGVzL2VudmVsb3Blcy5qcycgKSggdGhpcyApO1xuICAgIHRoaXMuYW5hbHlzaXMgICAgID0gcmVxdWlyZSggJy4vYW5hbHlzaXMvYW5hbHl6ZXJzLmpzJyApKCB0aGlzIClcbiAgICB0aGlzLnRpbWUgICAgICAgICA9IHJlcXVpcmUoICcuL21pc2MvdGltZS5qcycgKSggdGhpcyApXG4gICAgdGhpcy5Qcm94eSAgICAgICAgPSByZXF1aXJlKCAnLi93b3JrbGV0UHJveHkuanMnICkoIHRoaXMgKVxuICB9LFxuXG4gIGV4cG9ydCggdGFyZ2V0LCBzaG91bGRFeHBvcnRHZW5pc2g9ZmFsc2UgKSB7XG4gICAgaWYoIHRhcmdldCA9PT0gdW5kZWZpbmVkICkgdGhyb3cgRXJyb3IoJ1lvdSBtdXN0IGRlZmluZSBhIHRhcmdldCBvYmplY3QgZm9yIEdpYmJlcmlzaCB0byBleHBvcnQgdmFyaWFibGVzIHRvLicpXG5cbiAgICBpZiggc2hvdWxkRXhwb3J0R2VuaXNoICkgdGhpcy5nZW5pc2guZXhwb3J0KCB0YXJnZXQgKVxuXG4gICAgdGhpcy5pbnN0cnVtZW50cy5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5meC5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5maWx0ZXJzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLm9zY2lsbGF0b3JzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLmJpbm9wcy5leHBvcnQoIHRhcmdldCApXG4gICAgdGhpcy5tb25vcHMuZXhwb3J0KCB0YXJnZXQgKVxuICAgIHRoaXMuZW52ZWxvcGVzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLmFuYWx5c2lzLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0YXJnZXQuU2VxdWVuY2VyID0gdGhpcy5TZXF1ZW5jZXJcbiAgICB0YXJnZXQuU2VxdWVuY2VyMiA9IHRoaXMuU2VxdWVuY2VyMlxuICAgIHRhcmdldC5CdXMgPSB0aGlzLkJ1c1xuICAgIHRhcmdldC5CdXMyID0gdGhpcy5CdXMyXG4gICAgdGFyZ2V0LlNjaGVkdWxlciA9IHRoaXMuc2NoZWR1bGVyXG4gICAgdGhpcy50aW1lLmV4cG9ydCggdGFyZ2V0IClcbiAgICB0aGlzLnV0aWxpdGllcy5leHBvcnQoIHRhcmdldCApXG4gIH0sXG5cbiAgcHJpbnQoKSB7XG4gICAgY29uc29sZS5sb2coIHRoaXMuY2FsbGJhY2sudG9TdHJpbmcoKSApXG4gIH0sXG5cbiAgZGlydHkoIHVnZW4gKSB7XG4gICAgaWYoIHVnZW4gPT09IHRoaXMuYW5hbHl6ZXJzICkge1xuICAgICAgdGhpcy5ncmFwaElzRGlydHkgPSB0cnVlXG4gICAgICB0aGlzLmFuYWx5emVycy5kaXJ0eSA9IHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kaXJ0eVVnZW5zLnB1c2goIHVnZW4gKVxuICAgICAgdGhpcy5ncmFwaElzRGlydHkgPSB0cnVlXG4gICAgICBpZiggdGhpcy5tZW1vZWRbIHVnZW4udWdlbk5hbWUgXSApIHtcbiAgICAgICAgZGVsZXRlIHRoaXMubWVtb2VkWyB1Z2VuLnVnZW5OYW1lIF1cbiAgICAgIH1cbiAgICB9IFxuICB9LFxuXG4gIGNsZWFyKCkge1xuICAgIC8vIGRvIG5vdCBkZWxldGUgdGhlIGdhaW4gYW5kIHRoZSBwYW4gb2YgdGhlIG1hc3RlciBidXMgXG4gICAgdGhpcy5vdXRwdXQuaW5wdXRzLnNwbGljZSggMCwgdGhpcy5vdXRwdXQuaW5wdXRzLmxlbmd0aCAtIDIgKVxuICAgIC8vdGhpcy5vdXRwdXQuaW5wdXROYW1lcy5sZW5ndGggPSAwXG4gICAgdGhpcy5hbmFseXplcnMubGVuZ3RoID0gMFxuICAgIHRoaXMuc2NoZWR1bGVyLmNsZWFyKClcbiAgICB0aGlzLmRpcnR5KCB0aGlzLm91dHB1dCApXG4gICAgaWYoIHRoaXMubW9kZSA9PT0gJ3dvcmtsZXQnICkge1xuICAgICAgdGhpcy53b3JrbGV0LnBvcnQucG9zdE1lc3NhZ2UoeyBcbiAgICAgICAgYWRkcmVzczonbWV0aG9kJywgXG4gICAgICAgIG9iamVjdDp0aGlzLmlkLFxuICAgICAgICBuYW1lOidjbGVhcicsXG4gICAgICAgIGFyZ3M6W11cbiAgICAgIH0pXG4gICAgfVxuICAgICAgLy8gY2xlYXIgbWVtb3J5Li4uIFhYWCBzaG91bGQgdGhpcyBiZSBhIE1lbW9yeUhlbHBlciBmdW5jdGlvbj9cbiAgICAvL3RoaXMubWVtb3J5LmhlYXAuZmlsbCgwKVxuICAgIC8vdGhpcy5tZW1vcnkubGlzdCA9IHt9XG4gICAgLy9HaWJiZXJpc2gub3V0cHV0ID0gdGhpcy5CdXMyKClcbiAgICBcbiAgfSxcblxuICBnZW5lcmF0ZUNhbGxiYWNrKCkge1xuICAgIGlmKCB0aGlzLm1vZGUgPT09ICd3b3JrbGV0JyApIHtcbiAgICAgIEdpYmJlcmlzaC5jYWxsYmFjayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMCB9XG4gICAgICByZXR1cm4gR2liYmVyaXNoLmNhbGxiYWNrXG4gICAgfVxuICAgIGxldCB1aWQgPSAwLFxuICAgICAgICBjYWxsYmFja0JvZHksIGxhc3RMaW5lLCBhbmFseXNpcz0nJ1xuXG4gICAgdGhpcy5tZW1vZWQgPSB7fVxuXG4gICAgY2FsbGJhY2tCb2R5ID0gdGhpcy5wcm9jZXNzR3JhcGgoIHRoaXMub3V0cHV0IClcbiAgICBsYXN0TGluZSA9IGNhbGxiYWNrQm9keVsgY2FsbGJhY2tCb2R5Lmxlbmd0aCAtIDFdXG4gICAgY2FsbGJhY2tCb2R5LnVuc2hpZnQoIFwiXFx0J3VzZSBzdHJpY3QnXCIgKVxuXG4gICAgdGhpcy5hbmFseXplcnMuZm9yRWFjaCggdj0+IHtcbiAgICAgIGNvbnN0IGFuYWx5c2lzQmxvY2sgPSBHaWJiZXJpc2gucHJvY2Vzc1VnZW4oIHYgKVxuICAgICAgLy9pZiggR2liYmVyaXNoLm1vZGUgPT09ICdwcm9jZXNzb3InICkge1xuICAgICAgLy8gIGNvbnNvbGUubG9nKCAnYW5hbHlzaXM6JywgYW5hbHlzaXNCbG9jaywgdiAgKVxuICAgICAgLy99XG4gICAgICBjb25zdCBhbmFseXNpc0xpbmUgPSBhbmFseXNpc0Jsb2NrLnBvcCgpXG5cbiAgICAgIGFuYWx5c2lzQmxvY2suZm9yRWFjaCggdj0+IHtcbiAgICAgICAgY2FsbGJhY2tCb2R5LnNwbGljZSggY2FsbGJhY2tCb2R5Lmxlbmd0aCAtIDEsIDAsIHYgKVxuICAgICAgfSlcblxuICAgICAgY2FsbGJhY2tCb2R5LnB1c2goIGFuYWx5c2lzTGluZSApXG4gICAgfSlcblxuICAgIHRoaXMuYW5hbHl6ZXJzLmZvckVhY2goIHYgPT4ge1xuICAgICAgaWYoIHRoaXMuY2FsbGJhY2tVZ2Vucy5pbmRleE9mKCB2LmNhbGxiYWNrICkgPT09IC0xIClcbiAgICAgICAgdGhpcy5jYWxsYmFja1VnZW5zLnB1c2goIHYuY2FsbGJhY2sgKVxuICAgIH0pXG4gICAgdGhpcy5jYWxsYmFja05hbWVzID0gdGhpcy5jYWxsYmFja1VnZW5zLm1hcCggdiA9PiB2LnVnZW5OYW1lIClcblxuICAgIGNhbGxiYWNrQm9keS5wdXNoKCAnXFxuXFx0cmV0dXJuICcgKyBsYXN0TGluZS5zcGxpdCggJz0nIClbMF0uc3BsaXQoICcgJyApWzFdIClcblxuICAgIGlmKCB0aGlzLmRlYnVnID09PSB0cnVlICkgY29uc29sZS5sb2coICdjYWxsYmFjazpcXG4nLCBjYWxsYmFja0JvZHkuam9pbignXFxuJykgKVxuICAgIHRoaXMuY2FsbGJhY2tOYW1lcy5wdXNoKCAnbWVtJyApXG4gICAgdGhpcy5jYWxsYmFja1VnZW5zLnB1c2goIHRoaXMubWVtb3J5LmhlYXAgKVxuICAgIHRoaXMuY2FsbGJhY2sgPSBGdW5jdGlvbiggLi4udGhpcy5jYWxsYmFja05hbWVzLCBjYWxsYmFja0JvZHkuam9pbiggJ1xcbicgKSApXG4gICAgdGhpcy5jYWxsYmFjay5vdXQgPSBbXVxuXG4gICAgaWYoIHRoaXMub25jYWxsYmFjayApIHRoaXMub25jYWxsYmFjayggdGhpcy5jYWxsYmFjayApXG5cbiAgICByZXR1cm4gdGhpcy5jYWxsYmFjayBcbiAgfSxcblxuICBwcm9jZXNzR3JhcGgoIG91dHB1dCApIHtcbiAgICB0aGlzLmNhbGxiYWNrVWdlbnMubGVuZ3RoID0gMFxuICAgIHRoaXMuY2FsbGJhY2tOYW1lcy5sZW5ndGggPSAwXG5cbiAgICB0aGlzLmNhbGxiYWNrVWdlbnMucHVzaCggb3V0cHV0LmNhbGxiYWNrIClcblxuICAgIGxldCBib2R5ID0gdGhpcy5wcm9jZXNzVWdlbiggb3V0cHV0IClcbiAgICBcblxuICAgIHRoaXMuZGlydHlVZ2Vucy5sZW5ndGggPSAwXG4gICAgdGhpcy5ncmFwaElzRGlydHkgPSBmYWxzZVxuXG4gICAgcmV0dXJuIGJvZHlcbiAgfSxcbiAgcHJveHlSZXBsYWNlKCBvYmogKSB7XG4gICAgaWYoIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIG9iaiAhPT0gbnVsbCApIHtcbiAgICAgIGlmKCBvYmouaWQgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgY29uc3QgX19vYmogPSBwcm9jZXNzb3IudWdlbnMuZ2V0KCBvYmouaWQgKVxuICAgICAgICAvL2NvbnNvbGUubG9nKCAncmV0cmlldmVkOicsIF9fb2JqLm5hbWUgKVxuXG4gICAgICAgIC8vaWYoIG9iai5wcm9wICE9PSB1bmRlZmluZWQgKSBjb25zb2xlLmxvZyggJ2dvdCBhIHNzZC5vdXQnLCBvYmogKVxuICAgICAgICByZXR1cm4gb2JqLnByb3AgIT09IHVuZGVmaW5lZCA/IF9fb2JqWyBvYmoucHJvcCBdIDogX19vYmpcbiAgICAgIH1lbHNlIGlmKCBvYmouaXNGdW5jID09PSB0cnVlICkge1xuICAgICAgICBsZXQgZnVuYyA9ICBldmFsKCAnKCcgKyBvYmoudmFsdWUgKyAnKScgKVxuXG4gICAgICAgIC8vY29uc29sZS5sb2coICdyZXBsYWNpbmcgZnVuY3Rpb246JywgZnVuYyApXG5cbiAgICAgICAgcmV0dXJuIGZ1bmNcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqXG4gIH0sXG4gIHByb2Nlc3NVZ2VuKCB1Z2VuLCBibG9jayApIHtcbiAgICBpZiggYmxvY2sgPT09IHVuZGVmaW5lZCApIGJsb2NrID0gW11cblxuICAgIGxldCBkaXJ0eUlkeCA9IEdpYmJlcmlzaC5kaXJ0eVVnZW5zLmluZGV4T2YoIHVnZW4gKVxuXG4gICAgLy9jb25zb2xlLmxvZyggJ3VnZW5OYW1lOicsIHVnZW4udWdlbk5hbWUgKVxuICAgIGxldCBtZW1vID0gR2liYmVyaXNoLm1lbW9lZFsgdWdlbi51Z2VuTmFtZSBdXG5cbiAgICBpZiggbWVtbyAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgcmV0dXJuIG1lbW9cbiAgICB9IGVsc2UgaWYgKHVnZW4gPT09IHRydWUgfHwgdWdlbiA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IFwiV2h5IGlzIHVnZW4gYSBib29sZWFuPyBbdHJ1ZV0gb3IgW2ZhbHNlXVwiO1xuICAgIH0gZWxzZSBpZiggdWdlbi5ibG9jayA9PT0gdW5kZWZpbmVkIHx8IGRpcnR5SW5kZXggIT09IC0xICkge1xuXG4gIFxuICAgICAgbGV0IGxpbmUgPSBgXFx0dmFyIHZfJHt1Z2VuLmlkfSA9IGAgXG4gICAgICBcbiAgICAgIGlmKCAhdWdlbi5pc29wICkgbGluZSArPSBgJHt1Z2VuLnVnZW5OYW1lfSggYFxuXG4gICAgICAvLyBtdXN0IGdldCBhcnJheSBzbyB3ZSBjYW4ga2VlcCB0cmFjayBvZiBsZW5ndGggZm9yIGNvbW1hIGluc2VydGlvblxuICAgICAgbGV0IGtleXMsZXJyXG5cbiAgICAgIC8vdHJ5IHtcbiAgICAgIGtleXMgPSB1Z2VuLmlzb3AgPT09IHRydWUgfHwgdWdlbi50eXBlID09PSAnYnVzJyB8fCB1Z2VuLnR5cGUgPT09ICdhbmFseXNpcycgPyBPYmplY3Qua2V5cyggdWdlbi5pbnB1dHMgKSA6IFsuLi51Z2VuLmlucHV0TmFtZXMgXSBcblxuICAgICAgLy99Y2F0Y2goIGUgKXtcblxuICAgICAgLy8gIGNvbnNvbGUubG9nKCBlIClcbiAgICAgIC8vICBlcnIgPSB0cnVlXG4gICAgICAvL31cbiAgICAgIFxuICAgICAgLy9pZiggZXJyID09PSB0cnVlICkgcmV0dXJuXG5cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgbGV0IGtleSA9IGtleXNbIGkgXVxuICAgICAgICAvLyBiaW5vcC5pbnB1dHMgaXMgYWN0dWFsIHZhbHVlcywgbm90IGp1c3QgcHJvcGVydHkgbmFtZXNcbiAgICAgICAgbGV0IGlucHV0IFxuICAgICAgICBpZiggdWdlbi5pc29wIHx8IHVnZW4udHlwZSA9PT0nYnVzJyB8fCB1Z2VuLnR5cGUgPT09ICdhbmFseXNpcycgKSB7XG4gICAgICAgICAgaW5wdXQgPSB1Z2VuLmlucHV0c1sga2V5IF1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgLy9pZigga2V5ID09PSAnbWVtb3J5JyApIGNvbnRpbnVlO1xuICBcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCAndWdlbjonLCB1Z2VuLCAna2V5OicsIGtleSApXG4gICAgICAgICAgaW5wdXQgPSB1Z2VuWyBrZXkgXSBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYoIEdpYmJlcmlzaC5tb2RlID09PSAncHJvY2Vzc29yJyApIGNvbnNvbGUubG9nKCAncHJvY2Vzc29yIGlucHV0OicsIGtleSwgaW5wdXQgKVxuICAgICAgICBpZiggaW5wdXQgIT09IHVuZGVmaW5lZCApIHsgXG4gICAgICAgICAgaWYoIGlucHV0LmJ5cGFzcyA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCBpbnB1dHMgb2YgY2hhaW4gdW50aWwgb25lIGlzIGZvdW5kXG4gICAgICAgICAgICAvLyB0aGF0IGlzIG5vdCBiZWluZyBieXBhc3NlZFxuXG4gICAgICAgICAgICBsZXQgZm91bmQgPSBmYWxzZVxuXG4gICAgICAgICAgICB3aGlsZSggaW5wdXQuaW5wdXQgIT09ICd1bmRlZmluZWQnICYmIGZvdW5kID09PSBmYWxzZSApIHtcbiAgICAgICAgICAgICAgaWYoIHR5cGVvZiBpbnB1dC5pbnB1dC5ieXBhc3MgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICAgICAgICAgIGlucHV0ID0gaW5wdXQuaW5wdXRcbiAgICAgICAgICAgICAgICBpZiggaW5wdXQuYnlwYXNzID09PSBmYWxzZSApIGZvdW5kID0gdHJ1ZVxuICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IGlucHV0LmlucHV0XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiggdHlwZW9mIGlucHV0ID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgIGlmKCBpc05hTihrZXkpICkge1xuICAgICAgICAgICAgICBsaW5lICs9IGBtZW1bJHt1Z2VuLl9fYWRkcmVzc2VzX19bIGtleSBdfV1gLy9pbnB1dFxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIGxpbmUgKz0gaW5wdXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiBpbnB1dCA9PT0gJ2Jvb2xlYW4nICkge1xuICAgICAgICAgICAgICBsaW5lICs9ICcnICsgaW5wdXRcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdrZXk6Jywga2V5LCAnaW5wdXQ6JywgdWdlbi5pbnB1dHMsIHVnZW4uaW5wdXRzWyBrZXkgXSApIFxuICAgICAgICAgICAgLy8gWFhYIG5vdCBzdXJlIHdoeSB0aGlzIGhhcyB0byBiZSBoZXJlLCBidXQgc29tZWhvdyBub24tcHJvY2Vzc2VkIG9iamVjdHNcbiAgICAgICAgICAgIC8vIHRoYXQgb25seSBjb250YWluIGlkIG51bWJlcnMgYXJlIGJlaW5nIHBhc3NlZCBoZXJlLi4uXG5cbiAgICAgICAgICAgIGlmKCBHaWJiZXJpc2gubW9kZSA9PT0gJ3Byb2Nlc3NvcicgKSB7XG4gICAgICAgICAgICAgIGlmKCBpbnB1dC51Z2VuTmFtZSA9PT0gdW5kZWZpbmVkICYmIGlucHV0LmlkICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBHaWJiZXJpc2gucHJvY2Vzc29yLnVnZW5zLmdldCggaW5wdXQuaWQgKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIEdpYmJlcmlzaC5wcm9jZXNzVWdlbiggaW5wdXQsIGJsb2NrIClcblxuICAgICAgICAgICAgLy9pZiggaW5wdXQuY2FsbGJhY2sgPT09IHVuZGVmaW5lZCApIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlmKCAhaW5wdXQuaXNvcCApIHtcbiAgICAgICAgICAgICAgLy8gY2hlY2sgaXMgbmVlZGVkIHNvIHRoYXQgZ3JhcGhzIHdpdGggc3NkcyB0aGF0IHJlZmVyIHRvIHRoZW1zZWx2ZXNcbiAgICAgICAgICAgICAgLy8gZG9uJ3QgYWRkIHRoZSBzc2QgaW4gbW9yZSB0aGFuIG9uY2VcbiAgICAgICAgICAgICAgaWYoIEdpYmJlcmlzaC5jYWxsYmFja1VnZW5zLmluZGV4T2YoIGlucHV0LmNhbGxiYWNrICkgPT09IC0xICkge1xuICAgICAgICAgICAgICAgIEdpYmJlcmlzaC5jYWxsYmFja1VnZW5zLnB1c2goIGlucHV0LmNhbGxiYWNrIClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsaW5lICs9IGB2XyR7aW5wdXQuaWR9YFxuICAgICAgICAgICAgaW5wdXQuX192YXJuYW1lID0gYHZfJHtpbnB1dC5pZH1gXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoIGkgPCBrZXlzLmxlbmd0aCAtIDEgKSB7XG4gICAgICAgICAgICBsaW5lICs9IHVnZW4uaXNvcCA/ICcgJyArIHVnZW4ub3AgKyAnICcgOiAnLCAnIFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICAvL2lmKCB1Z2VuLnR5cGUgPT09ICdidXMnICkgbGluZSArPSAnLCAnIFxuICAgICAgaWYoIHVnZW4udHlwZSA9PT0gJ2FuYWx5c2lzJyB8fCAodWdlbi50eXBlID09PSAnYnVzJyAmJiBrZXlzLmxlbmd0aCA+IDApICkgbGluZSArPSAnLCAnXG4gICAgICBpZiggIXVnZW4uaXNvcCAmJiB1Z2VuLnR5cGUgIT09ICdzZXEnICkgbGluZSArPSAnbWVtJ1xuICAgICAgbGluZSArPSB1Z2VuLmlzb3AgPyAnJyA6ICcgKSdcblxuICAgICAgYmxvY2sucHVzaCggbGluZSApXG4gICAgICBcbiAgICAgIC8vY29uc29sZS5sb2coICdtZW1vOicsIHVnZW4udWdlbk5hbWUgKVxuICAgICAgR2liYmVyaXNoLm1lbW9lZFsgdWdlbi51Z2VuTmFtZSBdID0gYHZfJHt1Z2VuLmlkfWBcblxuICAgICAgaWYoIGRpcnR5SWR4ICE9PSAtMSApIHtcbiAgICAgICAgR2liYmVyaXNoLmRpcnR5VWdlbnMuc3BsaWNlKCBkaXJ0eUlkeCwgMSApXG4gICAgICB9XG5cbiAgICB9ZWxzZSBpZiggdWdlbi5ibG9jayApIHtcbiAgICAgIHJldHVybiB1Z2VuLmJsb2NrXG4gICAgfVxuXG4gICAgcmV0dXJuIGJsb2NrXG4gIH0sXG4gICAgXG59XG5cbkdpYmJlcmlzaC5wcm90b3R5cGVzLlVnZW4gPSByZXF1aXJlKCAnLi91Z2VuLmpzJyApKCBHaWJiZXJpc2ggKVxuR2liYmVyaXNoLnV0aWxpdGllcyA9IHJlcXVpcmUoICcuL3V0aWxpdGllcy5qcycgKSggR2liYmVyaXNoIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEdpYmJlcmlzaFxuIiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCAnLi9pbnN0cnVtZW50LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBDb25nYSA9IGFyZ3VtZW50UHJvcHMgPT4ge1xuICAgIGxldCBjb25nYSA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKSxcbiAgICAgICAgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgZGVjYXkgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgIGdhaW4gID0gZy5pbiggJ2dhaW4nICksXG4gICAgICAgIGxvdWRuZXNzID0gZy5pbiggJ2xvdWRuZXNzJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgQ29uZ2EuZGVmYXVsdHMsIGFyZ3VtZW50UHJvcHMgKVxuXG4gICAgbGV0IHRyaWdnZXIgPSBnLmJhbmcoKSxcbiAgICAgICAgaW1wdWxzZSA9IGcubXVsKCB0cmlnZ2VyLCA2MCApLFxuICAgICAgICBfZGVjYXkgPSAgZy5zdWIoIC4xMDEsIGcuZGl2KCBkZWNheSwgMTAgKSApLCAvLyBjcmVhdGUgcmFuZ2Ugb2YgLjAwMSAtIC4wOTlcbiAgICAgICAgYnBmID0gZy5zdmYoIGltcHVsc2UsIGZyZXF1ZW5jeSwgX2RlY2F5LCAyLCBmYWxzZSApLFxuICAgICAgICBvdXQgPSBnLm11bCggYnBmLCBnLm11bCggbG91ZG5lc3MsIGdhaW4gKSApXG4gICAgXG5cbiAgICBjb25nYS5lbnYgPSB0cmlnZ2VyXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIGNvbmdhLCBvdXQsIFsnaW5zdHJ1bWVudHMnLCdjb25nYSddLCBwcm9wcyAgKVxuXG4gICAgcmV0dXJuIGNvbmdhXG4gIH1cbiAgXG4gIENvbmdhLmRlZmF1bHRzID0ge1xuICAgIGdhaW46IC4yNSxcbiAgICBmcmVxdWVuY3k6MTkwLFxuICAgIGRlY2F5OiAuODUsXG4gICAgbG91ZG5lc3M6IDFcbiAgfVxuXG4gIHJldHVybiBDb25nYVxuXG59XG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IENvd2JlbGwgPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBsZXQgY293YmVsbCA9IE9iamVjdC5jcmVhdGUoIGluc3RydW1lbnQgKVxuICAgIFxuICAgIGNvbnN0IGRlY2F5ICAgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgICAgZ2FpbiAgICA9IGcuaW4oICdnYWluJyApLFxuICAgICAgICAgIGxvdWRuZXNzID0gZy5pbiggJ2xvdWRuZXNzJyApXG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBDb3diZWxsLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGNvbnN0IGJwZkN1dG9mZiA9IGcucGFyYW0oICdicGZjJywgMTAwMCApLFxuICAgICAgICAgIHMxID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCA1NjAgKSxcbiAgICAgICAgICBzMiA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgODQ1ICksXG4gICAgICAgICAgZWcgPSBnLmRlY2F5KCBnLm11bCggZGVjYXksIGcuZ2VuLnNhbXBsZXJhdGUgKiAyICkgKSwgXG4gICAgICAgICAgYnBmID0gZy5zdmYoIGcuYWRkKCBzMSxzMiApLCBicGZDdXRvZmYsIDMsIDIsIGZhbHNlICksXG4gICAgICAgICAgZW52QnBmID0gZy5tdWwoIGJwZiwgZWcgKSxcbiAgICAgICAgICBvdXQgPSBnLm11bCggZW52QnBmLCBnLm11bCggZ2FpbiwgbG91ZG5lc3MgKSApXG5cbiAgICBjb3diZWxsLmVudiA9IGVnIFxuXG4gICAgY293YmVsbC5pc1N0ZXJlbyA9IGZhbHNlXG5cbiAgICBjb3diZWxsID0gR2liYmVyaXNoLmZhY3RvcnkoIGNvd2JlbGwsIG91dCwgWydpbnN0dXJtZW50cycsICdjb3diZWxsJ10sIHByb3BzICApXG4gICAgXG4gICAgcmV0dXJuIGNvd2JlbGxcbiAgfVxuICBcbiAgQ293YmVsbC5kZWZhdWx0cyA9IHtcbiAgICBnYWluOiAxLFxuICAgIGRlY2F5Oi41LFxuICAgIGxvdWRuZXNzOjFcbiAgfVxuXG4gIHJldHVybiBDb3diZWxsXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCdnZW5pc2guanMnKSxcbiAgICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCcuL2luc3RydW1lbnQuanMnKTtcblxuY29uc3QgZ2VuaXNoID0gZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoR2liYmVyaXNoKSB7XG5cbiAgY29uc3QgRk0gPSBpbnB1dFByb3BzID0+IHtcbiAgICBsZXQgc3luID0gT2JqZWN0LmNyZWF0ZShpbnN0cnVtZW50KTtcblxuICAgIGxldCBmcmVxdWVuY3kgPSBnLmluKCdmcmVxdWVuY3knKSxcbiAgICAgICAgZ2xpZGUgPSBnLmluKCdnbGlkZScpLFxuICAgICAgICBzbGlkaW5nRnJlcSA9IGcuc2xpZGUoZnJlcXVlbmN5LCBnbGlkZSwgZ2xpZGUpLFxuICAgICAgICBjbVJhdGlvID0gZy5pbignY21SYXRpbycpLFxuICAgICAgICBpbmRleCA9IGcuaW4oJ2luZGV4JyksXG4gICAgICAgIGZlZWRiYWNrID0gZy5pbignZmVlZGJhY2snKSxcbiAgICAgICAgYXR0YWNrID0gZy5pbignYXR0YWNrJyksXG4gICAgICAgIGRlY2F5ID0gZy5pbignZGVjYXknKSxcbiAgICAgICAgc3VzdGFpbiA9IGcuaW4oJ3N1c3RhaW4nKSxcbiAgICAgICAgc3VzdGFpbkxldmVsID0gZy5pbignc3VzdGFpbkxldmVsJyksXG4gICAgICAgIHJlbGVhc2UgPSBnLmluKCdyZWxlYXNlJyksXG4gICAgICAgIGxvdWRuZXNzID0gZy5pbignbG91ZG5lc3MnKTtcblxuICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgRk0uZGVmYXVsdHMsIGlucHV0UHJvcHMpO1xuICAgIE9iamVjdC5hc3NpZ24oc3luLCBwcm9wcyk7XG5cbiAgICBzeW4uX19jcmVhdGVHcmFwaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGVudiA9IEdpYmJlcmlzaC5lbnZlbG9wZXMuZmFjdG9yeShwcm9wcy51c2VBRFNSLCBwcm9wcy5zaGFwZSwgYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgc3VzdGFpbkxldmVsLCByZWxlYXNlLCBwcm9wcy50cmlnZ2VyUmVsZWFzZSk7XG5cbiAgICAgIGNvbnN0IGZlZWRiYWNrc3NkID0gZy5oaXN0b3J5KDApO1xuXG4gICAgICBjb25zdCBtb2RPc2MgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeShzeW4ubW9kdWxhdG9yV2F2ZWZvcm0sIGcuYWRkKGcubXVsKHNsaWRpbmdGcmVxLCBjbVJhdGlvKSwgZy5tdWwoZmVlZGJhY2tzc2Qub3V0LCBmZWVkYmFjaywgaW5kZXgpKSwgc3luLmFudGlhbGlhcyk7XG5cbiAgICAgIHtcbiAgICAgICAgJ3VzZSBqc2RzcCc7XG4gICAgICAgIGNvbnN0IG1vZE9zY1dpdGhJbmRleCA9IGdlbmlzaC5tdWwoZ2VuaXNoLm11bChnZW5pc2gubXVsKG1vZE9zYywgc2xpZGluZ0ZyZXEpLCBpbmRleCksIGxvdWRuZXNzKTtcbiAgICAgICAgY29uc3QgbW9kT3NjV2l0aEVudiA9IGdlbmlzaC5tdWwobW9kT3NjV2l0aEluZGV4LCBlbnYpO1xuXG4gICAgICAgIGNvbnN0IG1vZE9zY1dpdGhFbnZBdmcgPSBnZW5pc2gubXVsKC41LCBnZW5pc2guYWRkKG1vZE9zY1dpdGhFbnYsIGZlZWRiYWNrc3NkLm91dCkpO1xuXG4gICAgICAgIGZlZWRiYWNrc3NkLmluKG1vZE9zY1dpdGhFbnZBdmcpO1xuXG4gICAgICAgIGNvbnN0IGNhcnJpZXJPc2MgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeShzeW4uY2FycmllcldhdmVmb3JtLCBnLmFkZChzbGlkaW5nRnJlcSwgbW9kT3NjV2l0aEVudkF2ZyksIHN5bi5hbnRpYWxpYXMpO1xuICAgICAgICBjb25zdCBjYXJyaWVyT3NjV2l0aEVudiA9IGdlbmlzaC5tdWwoY2Fycmllck9zYywgZW52KTtcblxuICAgICAgICBjb25zdCBiYXNlQ3V0b2ZmRnJlcSA9IGdlbmlzaC5tdWwoZy5pbignY3V0b2ZmJyksIGZyZXF1ZW5jeSk7XG4gICAgICAgIGNvbnN0IGN1dG9mZiA9IGdlbmlzaC5tdWwoZ2VuaXNoLm11bChiYXNlQ3V0b2ZmRnJlcSwgZy5wb3coMiwgZ2VuaXNoLm11bChnLmluKCdmaWx0ZXJNdWx0JyksIGxvdWRuZXNzKSkpLCBlbnYpO1xuICAgICAgICAvL2NvbnN0IGN1dG9mZiA9IGcuYWRkKCBnLmluKCdjdXRvZmYnKSwgZy5tdWwoIGcuaW4oJ2ZpbHRlck11bHQnKSwgZW52ICkgKVxuICAgICAgICBjb25zdCBmaWx0ZXJlZE9zYyA9IEdpYmJlcmlzaC5maWx0ZXJzLmZhY3RvcnkoY2Fycmllck9zY1dpdGhFbnYsIGN1dG9mZiwgZy5pbignUScpLCBnLmluKCdzYXR1cmF0aW9uJyksIHN5bik7XG5cbiAgICAgICAgY29uc3Qgc3ludGhXaXRoR2FpbiA9IGdlbmlzaC5tdWwoZ2VuaXNoLm11bChmaWx0ZXJlZE9zYywgZy5pbignZ2FpbicpKSwgbG91ZG5lc3MpO1xuXG4gICAgICAgIGxldCBwYW5uZXI7XG4gICAgICAgIGlmIChwcm9wcy5wYW5Wb2ljZXMgPT09IHRydWUpIHtcbiAgICAgICAgICBwYW5uZXIgPSBnLnBhbihzeW50aFdpdGhHYWluLCBzeW50aFdpdGhHYWluLCBnLmluKCdwYW4nKSk7XG4gICAgICAgICAgc3luLmdyYXBoID0gW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN5bi5ncmFwaCA9IHN5bnRoV2l0aEdhaW47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3luLmVudiA9IGVudjtcbiAgICB9O1xuXG4gICAgc3luLl9fcmVxdWlyZXNSZWNvbXBpbGF0aW9uID0gWydjYXJyaWVyV2F2ZWZvcm0nLCAnbW9kdWxhdG9yV2F2ZWZvcm0nLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnZmlsdGVyTW9kZSddO1xuICAgIHN5bi5fX2NyZWF0ZUdyYXBoKCk7XG5cbiAgICBjb25zdCBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeShzeW4sIHN5bi5ncmFwaCwgWydpbnN0cnVtZW50cycsICdGTSddLCBwcm9wcyk7XG5cbiAgICByZXR1cm4gb3V0O1xuICB9O1xuXG4gIEZNLmRlZmF1bHRzID0ge1xuICAgIGNhcnJpZXJXYXZlZm9ybTogJ3NpbmUnLFxuICAgIG1vZHVsYXRvcldhdmVmb3JtOiAnc2luZScsXG4gICAgYXR0YWNrOiA0NCxcbiAgICBmZWVkYmFjazogMCxcbiAgICBkZWNheTogMjIwNTAsXG4gICAgc3VzdGFpbjogNDQxMDAsXG4gICAgc3VzdGFpbkxldmVsOiAuNixcbiAgICByZWxlYXNlOiAyMjA1MCxcbiAgICB1c2VBRFNSOiBmYWxzZSxcbiAgICBzaGFwZTogJ2xpbmVhcicsXG4gICAgdHJpZ2dlclJlbGVhc2U6IGZhbHNlLFxuICAgIGdhaW46IC4yNSxcbiAgICBjbVJhdGlvOiAyLFxuICAgIGluZGV4OiA1LFxuICAgIHB1bHNld2lkdGg6IC4yNSxcbiAgICBmcmVxdWVuY3k6IDIyMCxcbiAgICBwYW46IC41LFxuICAgIGFudGlhbGlhczogZmFsc2UsXG4gICAgcGFuVm9pY2VzOiBmYWxzZSxcbiAgICBnbGlkZTogMSxcbiAgICBzYXR1cmF0aW9uOiAxLFxuICAgIGZpbHRlck11bHQ6IDEuNSxcbiAgICBROiAuMjUsXG4gICAgY3V0b2ZmOiAuMzUsXG4gICAgZmlsdGVyVHlwZTogMCxcbiAgICBmaWx0ZXJNb2RlOiAwLFxuICAgIGlzTG93UGFzczogMSxcbiAgICBsb3VkbmVzczogMVxuXG4gIH07XG5cbiAgY29uc3QgUG9seUZNID0gR2liYmVyaXNoLlBvbHlUZW1wbGF0ZShGTSwgWydnbGlkZScsICdmcmVxdWVuY3knLCAnYXR0YWNrJywgJ2RlY2F5JywgJ3B1bHNld2lkdGgnLCAncGFuJywgJ2dhaW4nLCAnY21SYXRpbycsICdpbmRleCcsICdzYXR1cmF0aW9uJywgJ2ZpbHRlck11bHQnLCAnUScsICdjdXRvZmYnLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnY2FycmllcldhdmVmb3JtJywgJ21vZHVsYXRvcldhdmVmb3JtJywgJ2ZpbHRlck1vZGUnLCAnZmVlZGJhY2snLCAndXNlQURTUicsICdzdXN0YWluJywgJ3JlbGVhc2UnLCAnc3VzdGFpbkxldmVsJ10pO1xuICBQb2x5Rk0uZGVmYXVsdHMgPSBGTS5kZWZhdWx0cztcblxuICByZXR1cm4gW0ZNLCBQb2x5Rk1dO1xufTsiLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGxldCBIYXQgPSBhcmd1bWVudFByb3BzID0+IHtcbiAgICBsZXQgaGF0ID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApLFxuICAgICAgICB0dW5lICA9IGcuaW4oICd0dW5lJyApLFxuICAgICAgICBzY2FsZWRUdW5lID0gZy5tZW1vKCBnLmFkZCggLjQsIHR1bmUgKSApLFxuICAgICAgICBkZWNheSAgPSBnLmluKCAnZGVjYXknICksXG4gICAgICAgIGdhaW4gID0gZy5pbiggJ2dhaW4nICksXG4gICAgICAgIGxvdWRuZXNzID0gZy5pbiggJ2xvdWRuZXNzJyApXG5cbiAgICBsZXQgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgSGF0LmRlZmF1bHRzLCBhcmd1bWVudFByb3BzIClcblxuICAgIGxldCBiYXNlRnJlcSA9IGcubXVsKCAzMjUsIHNjYWxlZFR1bmUgKSwgLy8gcmFuZ2Ugb2YgMTYyLjUgLSA0ODcuNVxuICAgICAgICBicGZDdXRvZmYgPSBnLm11bCggZy5wYXJhbSggJ2JwZmMnLCA3MDAwICksIHNjYWxlZFR1bmUgKSxcbiAgICAgICAgaHBmQ3V0b2ZmID0gZy5tdWwoIGcucGFyYW0oICdocGZjJywgMTEwMDAgKSwgc2NhbGVkVHVuZSApLCAgXG4gICAgICAgIHMxID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBiYXNlRnJlcSwgZmFsc2UgKSxcbiAgICAgICAgczIgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGcubXVsKCBiYXNlRnJlcSwxLjQ0NzEgKSApLFxuICAgICAgICBzMyA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5tdWwoIGJhc2VGcmVxLDEuNjE3MCApICksXG4gICAgICAgIHM0ID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3RvcnkoICdzcXVhcmUnLCBnLm11bCggYmFzZUZyZXEsMS45MjY1ICkgKSxcbiAgICAgICAgczUgPSBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZmFjdG9yeSggJ3NxdWFyZScsIGcubXVsKCBiYXNlRnJlcSwyLjUwMjggKSApLFxuICAgICAgICBzNiA9IEdpYmJlcmlzaC5vc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5tdWwoIGJhc2VGcmVxLDIuNjYzNyApICksXG4gICAgICAgIHN1bSA9IGcuYWRkKCBzMSxzMixzMyxzNCxzNSxzNiApLFxuICAgICAgICBlZyA9IGcuZGVjYXkoIGcubXVsKCBkZWNheSwgZy5nZW4uc2FtcGxlcmF0ZSAqIDIgKSwgeyBpbml0VmFsdWU6MCB9KSwgXG4gICAgICAgIGJwZiA9IGcuc3ZmKCBzdW0sIGJwZkN1dG9mZiwgLjUsIDIsIGZhbHNlICksXG4gICAgICAgIGVudkJwZiA9IGcubXVsKCBicGYsIGVnICksXG4gICAgICAgIGhwZiA9IGcuZmlsdGVyMjQoIGVudkJwZiwgMCwgaHBmQ3V0b2ZmLCAwICksXG4gICAgICAgIG91dCA9IGcubXVsKCBocGYsIGcubXVsKCBnYWluLCBsb3VkbmVzcyApIClcblxuICAgIGhhdC5lbnYgPSBlZyBcbiAgICBoYXQuaXNTdGVyZW8gPSBmYWxzZVxuXG4gICAgY29uc3QgX19oYXQgPSBHaWJiZXJpc2guZmFjdG9yeSggaGF0LCBvdXQsIFsnaW5zdHJ1bWVudHMnLCdoYXQnXSwgcHJvcHMgIClcbiAgICBcblxuICAgIHJldHVybiBfX2hhdFxuICB9XG4gIFxuICBIYXQuZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogIC41LFxuICAgIHR1bmU6IC42LFxuICAgIGRlY2F5Oi4xLFxuICAgIGxvdWRuZXNzOjFcbiAgfVxuXG4gIHJldHVybiBIYXRcblxufVxuIiwiY29uc3QgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApKClcblxuY29uc3QgaW5zdHJ1bWVudCA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKVxuXG5PYmplY3QuYXNzaWduKCBpbnN0cnVtZW50LCB7XG4gIHR5cGU6J2luc3RydW1lbnQnLFxuXG4gIG5vdGUoIGZyZXEsIGxvdWRuZXNzPW51bGwgKSB7XG4gICAgLy8gaWYgYmlub3AgaXMgc2hvdWxkIGJlIHVzZWQuLi5cbiAgICBpZiggaXNOYU4oIHRoaXMuZnJlcXVlbmN5ICkgKSB7IFxuICAgICAgLy8gYW5kIGlmIHdlIGFyZSBhc3NpZ25pbmcgYmlub3AgZm9yIHRoZSBmaXJzdCB0aW1lLi4uXG4gICAgICBpZiggdGhpcy5mcmVxdWVuY3kuaXNvcCAhPT0gdHJ1ZSApIHtcbiAgICAgICAgbGV0IG9iaiA9IEdpYmJlcmlzaC5wcm9jZXNzb3IudWdlbnMuZ2V0KCB0aGlzLmZyZXF1ZW5jeS5pZCApXG4gICAgICAgIG9iai5pbnB1dHNbMF0gPSBmcmVxXG4gICAgICAgIHRoaXMuZnJlcXVlbmN5ID0gb2JqXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5mcmVxdWVuY3kuaW5wdXRzWzBdID0gZnJlcVxuICAgICAgICBHaWJiZXJpc2guZGlydHkoIHRoaXMgKVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5mcmVxdWVuY3kgPSBmcmVxXG4gICAgfVxuXG4gICAgaWYoIGxvdWRuZXNzICE9PSBudWxsICkgdGhpcy5sb3VkbmVzcyA9IGxvdWRuZXNzIFxuXG4gICAgdGhpcy5lbnYudHJpZ2dlcigpXG4gIH0sXG5cbiAgdHJpZ2dlciggbG91ZG5lc3MgPSAxICkge1xuICAgIHRoaXMubG91ZG5lc3MgPSBsb3VkbmVzc1xuICAgIHRoaXMuZW52LnRyaWdnZXIoKVxuICB9LFxuXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc3RydW1lbnRcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuY29uc3QgaW5zdHJ1bWVudHMgPSB7XG4gIEtpY2sgICAgICAgIDogcmVxdWlyZSggJy4va2ljay5qcycgKSggR2liYmVyaXNoICksXG4gIENvbmdhICAgICAgIDogcmVxdWlyZSggJy4vY29uZ2EuanMnICkoIEdpYmJlcmlzaCApLFxuICBDbGF2ZSAgICAgICA6IHJlcXVpcmUoICcuL2NvbmdhLmpzJyApKCBHaWJiZXJpc2ggKSwgLy8gY2xhdmUgaXMgc2FtZSBhcyBjb25nYSB3aXRoIGRpZmZlcmVudCBkZWZhdWx0cywgc2VlIGJlbG93XG4gIEhhdCAgICAgICAgIDogcmVxdWlyZSggJy4vaGF0LmpzJyApKCBHaWJiZXJpc2ggKSxcbiAgU25hcmUgICAgICAgOiByZXF1aXJlKCAnLi9zbmFyZS5qcycgKSggR2liYmVyaXNoICksXG4gIENvd2JlbGwgICAgIDogcmVxdWlyZSggJy4vY293YmVsbC5qcycgKSggR2liYmVyaXNoIClcbn1cblxuaW5zdHJ1bWVudHMuQ2xhdmUuZGVmYXVsdHMuZnJlcXVlbmN5ID0gMjUwMFxuaW5zdHJ1bWVudHMuQ2xhdmUuZGVmYXVsdHMuZGVjYXkgPSAuNTtcblxuWyBpbnN0cnVtZW50cy5TeW50aCwgaW5zdHJ1bWVudHMuUG9seVN5bnRoIF0gICAgID0gcmVxdWlyZSggJy4vc3ludGguanMnICkoIEdpYmJlcmlzaCApO1xuWyBpbnN0cnVtZW50cy5Nb25vc3ludGgsIGluc3RydW1lbnRzLlBvbHlNb25vIF0gID0gcmVxdWlyZSggJy4vbW9ub3N5bnRoLmpzJyApKCBHaWJiZXJpc2ggKTtcblsgaW5zdHJ1bWVudHMuRk0sIGluc3RydW1lbnRzLlBvbHlGTSBdICAgICAgICAgICA9IHJlcXVpcmUoICcuL2ZtLmpzJyApKCBHaWJiZXJpc2ggKTtcblsgaW5zdHJ1bWVudHMuU2FtcGxlciwgaW5zdHJ1bWVudHMuUG9seVNhbXBsZXIgXSA9IHJlcXVpcmUoICcuL3NhbXBsZXIuanMnICkoIEdpYmJlcmlzaCApO1xuWyBpbnN0cnVtZW50cy5LYXJwbHVzLCBpbnN0cnVtZW50cy5Qb2x5S2FycGx1cyBdID0gcmVxdWlyZSggJy4va2FycGx1c3N0cm9uZy5qcycgKSggR2liYmVyaXNoICk7XG5cbmluc3RydW1lbnRzLmV4cG9ydCA9IHRhcmdldCA9PiB7XG4gIGZvciggbGV0IGtleSBpbiBpbnN0cnVtZW50cyApIHtcbiAgICBpZigga2V5ICE9PSAnZXhwb3J0JyApIHtcbiAgICAgIHRhcmdldFsga2V5IF0gPSBpbnN0cnVtZW50c1sga2V5IF1cbiAgICB9XG4gIH1cbn1cblxucmV0dXJuIGluc3RydW1lbnRzXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG4gIGNvbnN0IEtQUyA9IGlucHV0UHJvcHMgPT4ge1xuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgS1BTLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBsZXQgc3luID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApXG4gICAgXG4gICAgbGV0IHNhbXBsZVJhdGUgPSBHaWJiZXJpc2gubW9kZSA9PT0gJ3Byb2Nlc3NvcicgPyBHaWJiZXJpc2gucHJvY2Vzc29yLnNhbXBsZVJhdGUgOiBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGVcblxuICAgIGNvbnN0IHRyaWdnZXIgPSBnLmJhbmcoKSxcbiAgICAgICAgICBwaGFzZSA9IGcuYWNjdW0oIDEsIHRyaWdnZXIsIHsgbWF4OkluZmluaXR5IH0gKSxcbiAgICAgICAgICBlbnYgPSBnLmd0cCggZy5zdWIoIDEsIGcuZGl2KCBwaGFzZSwgMjAwICkgKSwgMCApLFxuICAgICAgICAgIGltcHVsc2UgPSBnLm11bCggZy5ub2lzZSgpLCBlbnYgKSxcbiAgICAgICAgICBmZWVkYmFjayA9IGcuaGlzdG9yeSgpLFxuICAgICAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oJ2ZyZXF1ZW5jeScpLFxuICAgICAgICAgIGdsaWRlID0gZy5pbiggJ2dsaWRlJyApLFxuICAgICAgICAgIHNsaWRpbmdGcmVxdWVuY3kgPSBnLnNsaWRlKCBmcmVxdWVuY3ksIGdsaWRlLCBnbGlkZSApLFxuICAgICAgICAgIGRlbGF5ID0gZy5kZWxheSggZy5hZGQoIGltcHVsc2UsIGZlZWRiYWNrLm91dCApLCBnLmRpdiggc2FtcGxlUmF0ZSwgc2xpZGluZ0ZyZXF1ZW5jeSApLCB7IHNpemU6MjA0OCB9KSxcbiAgICAgICAgICBkZWNheWVkID0gZy5tdWwoIGRlbGF5LCBnLnQ2MCggZy5tdWwoIGcuaW4oJ2RlY2F5JyksIHNsaWRpbmdGcmVxdWVuY3kgKSApICksXG4gICAgICAgICAgZGFtcGVkID0gIGcubWl4KCBkZWNheWVkLCBmZWVkYmFjay5vdXQsIGcuaW4oJ2RhbXBpbmcnKSApLFxuICAgICAgICAgIHdpdGhHYWluID0gZy5tdWwoIGRhbXBlZCwgZy5tdWwoIGcuaW4oJ2xvdWRuZXNzJyksZy5pbignZ2FpbicpKSApXG5cbiAgICBmZWVkYmFjay5pbiggZGFtcGVkIClcblxuICAgIGNvbnN0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgS1BTLmRlZmF1bHRzLCBwcm9wcyApXG5cbiAgICBPYmplY3QuYXNzaWduKCBzeW4sIHtcbiAgICAgIHByb3BlcnRpZXMgOiBwcm9wcyxcblxuICAgICAgZW52IDogdHJpZ2dlcixcbiAgICAgIHBoYXNlLFxuXG4gICAgICBnZXRQaGFzZSgpIHtcbiAgICAgICAgcmV0dXJuIEdpYmJlcmlzaC5tZW1vcnkuaGVhcFsgcGhhc2UubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICBpZiggcHJvcGVydGllcy5wYW5Wb2ljZXMgKSB7ICBcbiAgICAgIGNvbnN0IHBhbm5lciA9IGcucGFuKCB3aXRoR2Fpbiwgd2l0aEdhaW4sIGcuaW4oICdwYW4nICkgKVxuICAgICAgc3luID0gR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdLCBbJ2luc3RydW1lbnRzJywna2FycGx1cyddLCBwcm9wcyAgKVxuICAgIH1lbHNle1xuICAgICAgc3luID0gR2liYmVyaXNoLmZhY3RvcnkoIHN5biwgd2l0aEdhaW4sIFsnaW5zdHJ1bWVudHMnLCdrYXJwbHVzJ10sIHByb3BzIClcbiAgICB9XG5cbiAgICByZXR1cm4gc3luXG4gIH1cbiAgXG4gIEtQUy5kZWZhdWx0cyA9IHtcbiAgICBkZWNheTogLjk3LFxuICAgIGRhbXBpbmc6LjIsXG4gICAgZ2FpbjogMSxcbiAgICBmcmVxdWVuY3k6MjIwLFxuICAgIHBhbjogLjUsXG4gICAgZ2xpZGU6MSxcbiAgICBwYW5Wb2ljZXM6ZmFsc2UsXG4gICAgbG91ZG5lc3M6MVxuICB9XG5cbiAgbGV0IGVudkNoZWNrRmFjdG9yeSA9ICggc3luLHN5bnRoICkgPT4ge1xuICAgIGxldCBlbnZDaGVjayA9ICgpPT4ge1xuICAgICAgbGV0IHBoYXNlID0gc3luLmdldFBoYXNlKCksXG4gICAgICAgICAgZW5kVGltZSA9IHN5bnRoLmRlY2F5ICogc2FtcGxlUmF0ZVxuXG4gICAgICBpZiggcGhhc2UgPiBlbmRUaW1lICkge1xuICAgICAgICBzeW50aC5kaXNjb25uZWN0VWdlbiggc3luIClcbiAgICAgICAgc3luLmlzQ29ubmVjdGVkID0gZmFsc2VcbiAgICAgICAgR2liYmVyaXNoLm1lbW9yeS5oZWFwWyBzeW4ucGhhc2UubWVtb3J5LnZhbHVlLmlkeCBdID0gMCAvLyB0cmlnZ2VyIGRvZXNuJ3Qgc2VlbSB0byByZXNldCBmb3Igc29tZSByZWFzb25cbiAgICAgIH1lbHNle1xuICAgICAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3MucHVzaCggZW52Q2hlY2sgKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZW52Q2hlY2tcbiAgfVxuXG4gIGNvbnN0IFBvbHlLUFMgPSBHaWJiZXJpc2guUG9seVRlbXBsYXRlKCBLUFMsIFsnZnJlcXVlbmN5JywnZGVjYXknLCdkYW1waW5nJywncGFuJywnZ2FpbicsICdnbGlkZSddLCBlbnZDaGVja0ZhY3RvcnkgKSBcbiAgUG9seUtQUy5kZWZhdWx0cyA9IEtQUy5kZWZhdWx0c1xuXG4gIHJldHVybiBbIEtQUywgUG9seUtQUyBdXG5cbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSggJy4vaW5zdHJ1bWVudC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgS2ljayA9IGlucHV0UHJvcHMgPT4ge1xuICAgIC8vIGVzdGFibGlzaCBwcm90b3R5cGUgY2hhaW5cbiAgICBjb25zdCBraWNrID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApXG5cbiAgICAvLyBkZWZpbmUgaW5wdXRzXG4gICAgY29uc3QgZnJlcXVlbmN5ID0gZy5pbiggJ2ZyZXF1ZW5jeScgKSxcbiAgICAgICAgICBkZWNheSA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgICB0b25lICA9IGcuaW4oICd0b25lJyApLFxuICAgICAgICAgIGdhaW4gID0gZy5pbiggJ2dhaW4nICksXG4gICAgICAgICAgbG91ZG5lc3MgPSBnLmluKCAnbG91ZG5lc3MnIClcbiAgICBcbiAgICAvLyBjcmVhdGUgaW5pdGlhbCBwcm9wZXJ0eSBzZXRcbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBLaWNrLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICBPYmplY3QuYXNzaWduKCBraWNrLCBwcm9wcyApXG5cbiAgICAvLyBjcmVhdGUgRFNQIGdyYXBoXG4gICAgY29uc3QgdHJpZ2dlciA9IGcuYmFuZygpLFxuICAgICAgICAgIGltcHVsc2UgPSBnLm11bCggdHJpZ2dlciwgNjAgKSxcbiAgICAgICAgICBzY2FsZWREZWNheSA9IGcuc3ViKCAxLjAwNSwgZGVjYXkgKSwgLy8gLT4gcmFuZ2UgeyAuMDA1LCAxLjAwNSB9XG4gICAgICAgICAgc2NhbGVkVG9uZSA9IGcuYWRkKCA1MCwgZy5tdWwoIHRvbmUsIGcubXVsKDQwMDAsIGxvdWRuZXNzKSApICksIC8vIC0+IHJhbmdlIHsgNTAsIDQwNTAgfVxuICAgICAgICAgIGJwZiA9IGcuc3ZmKCBpbXB1bHNlLCBmcmVxdWVuY3ksIHNjYWxlZERlY2F5LCAyLCBmYWxzZSApLFxuICAgICAgICAgIGxwZiA9IGcuc3ZmKCBicGYsIHNjYWxlZFRvbmUsIC41LCAwLCBmYWxzZSApLFxuICAgICAgICAgIGdyYXBoID0gZy5tdWwoIGxwZiwgZy5tdWwoZ2FpbiwgbG91ZG5lc3MpIClcbiAgICBcbiAgICBraWNrLmVudiA9IHRyaWdnZXJcbiAgICBjb25zdCBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeSgga2ljaywgZ3JhcGgsIFsnaW5zdHJ1bWVudHMnLCdraWNrJ10sIHByb3BzICApXG5cbiAgICByZXR1cm4gb3V0XG4gIH1cbiAgXG4gIEtpY2suZGVmYXVsdHMgPSB7XG4gICAgZ2FpbjogMSxcbiAgICBmcmVxdWVuY3k6ODUsXG4gICAgdG9uZTogLjI1LFxuICAgIGRlY2F5Oi45LFxuICAgIGxvdWRuZXNzOjFcbiAgfVxuXG4gIHJldHVybiBLaWNrXG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCdnZW5pc2guanMnKSxcbiAgICAgIGluc3RydW1lbnQgPSByZXF1aXJlKCcuL2luc3RydW1lbnQuanMnKSxcbiAgICAgIGZlZWRiYWNrT3NjID0gcmVxdWlyZSgnLi4vb3NjaWxsYXRvcnMvZm1mZWVkYmFja29zYy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChHaWJiZXJpc2gpIHtcblxuICBjb25zdCBTeW50aCA9IGFyZ3VtZW50UHJvcHMgPT4ge1xuICAgIGNvbnN0IHN5biA9IE9iamVjdC5jcmVhdGUoaW5zdHJ1bWVudCksXG4gICAgICAgICAgb3NjcyA9IFtdLFxuICAgICAgICAgIGZyZXF1ZW5jeSA9IGcuaW4oJ2ZyZXF1ZW5jeScpLFxuICAgICAgICAgIGdsaWRlID0gZy5pbignZ2xpZGUnKSxcbiAgICAgICAgICBzbGlkaW5nRnJlcSA9IGcubWVtbyhnLnNsaWRlKGZyZXF1ZW5jeSwgZ2xpZGUsIGdsaWRlKSksXG4gICAgICAgICAgYXR0YWNrID0gZy5pbignYXR0YWNrJyksXG4gICAgICAgICAgZGVjYXkgPSBnLmluKCdkZWNheScpLFxuICAgICAgICAgIHN1c3RhaW4gPSBnLmluKCdzdXN0YWluJyksXG4gICAgICAgICAgc3VzdGFpbkxldmVsID0gZy5pbignc3VzdGFpbkxldmVsJyksXG4gICAgICAgICAgcmVsZWFzZSA9IGcuaW4oJ3JlbGVhc2UnKSxcbiAgICAgICAgICBsb3VkbmVzcyA9IGcuaW4oJ2xvdWRuZXNzJyk7XG5cbiAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIFN5bnRoLmRlZmF1bHRzLCBhcmd1bWVudFByb3BzKTtcbiAgICBPYmplY3QuYXNzaWduKHN5biwgcHJvcHMpO1xuXG4gICAgc3luLl9fY3JlYXRlR3JhcGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBlbnYgPSBHaWJiZXJpc2guZW52ZWxvcGVzLmZhY3RvcnkocHJvcHMudXNlQURTUiwgcHJvcHMuc2hhcGUsIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHN1c3RhaW5MZXZlbCwgcmVsZWFzZSwgcHJvcHMudHJpZ2dlclJlbGVhc2UpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICBsZXQgb3NjLCBmcmVxO1xuXG4gICAgICAgIHN3aXRjaCAoaSkge1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGZyZXEgPSBnLmFkZChzbGlkaW5nRnJlcSwgZy5tdWwoc2xpZGluZ0ZyZXEsIGcuaW4oJ2RldHVuZTInKSkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgZnJlcSA9IGcuYWRkKHNsaWRpbmdGcmVxLCBnLm11bChzbGlkaW5nRnJlcSwgZy5pbignZGV0dW5lMycpKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgZnJlcSA9IHNsaWRpbmdGcmVxO1xuICAgICAgICB9XG5cbiAgICAgICAgb3NjID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3Rvcnkoc3luLndhdmVmb3JtLCBmcmVxLCBzeW4uYW50aWFsaWFzKTtcblxuICAgICAgICBvc2NzW2ldID0gb3NjO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBvc2NTdW0gPSBnLmFkZCguLi5vc2NzKSxcbiAgICAgICAgICAgIG9zY1dpdGhFbnYgPSBnLm11bChvc2NTdW0sIGVudiksXG4gICAgICAgICAgICBiYXNlQ3V0b2ZmRnJlcSA9IGcubXVsKGcuaW4oJ2N1dG9mZicpLCBmcmVxdWVuY3kpLFxuICAgICAgICAgICAgY3V0b2ZmID0gZy5tdWwoZy5tdWwoYmFzZUN1dG9mZkZyZXEsIGcucG93KDIsIGcubXVsKGcuaW4oJ2ZpbHRlck11bHQnKSwgbG91ZG5lc3MpKSksIGVudiksXG4gICAgICAgICAgICBmaWx0ZXJlZE9zYyA9IEdpYmJlcmlzaC5maWx0ZXJzLmZhY3Rvcnkob3NjV2l0aEVudiwgY3V0b2ZmLCBnLmluKCdRJyksIGcuaW4oJ3NhdHVyYXRpb24nKSwgc3luKTtcblxuICAgICAgaWYgKHByb3BzLnBhblZvaWNlcykge1xuICAgICAgICBjb25zdCBwYW5uZXIgPSBnLnBhbihmaWx0ZXJlZE9zYywgZmlsdGVyZWRPc2MsIGcuaW4oJ3BhbicpKTtcbiAgICAgICAgc3luLmdyYXBoID0gW2cubXVsKHBhbm5lci5sZWZ0LCBnLmluKCdnYWluJyksIGxvdWRuZXNzKSwgZy5tdWwocGFubmVyLnJpZ2h0LCBnLmluKCdnYWluJyksIGxvdWRuZXNzKV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzeW4uZ3JhcGggPSBnLm11bChmaWx0ZXJlZE9zYywgZy5pbignZ2FpbicpLCBsb3VkbmVzcyk7XG4gICAgICB9XG5cbiAgICAgIHN5bi5lbnYgPSBlbnY7XG4gICAgfTtcblxuICAgIHN5bi5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiA9IFsnd2F2ZWZvcm0nLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnZmlsdGVyTW9kZSddO1xuICAgIHN5bi5fX2NyZWF0ZUdyYXBoKCk7XG5cbiAgICBjb25zdCBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeShzeW4sIHN5bi5ncmFwaCwgWydpbnN0cnVtZW50cycsICdNb25vc3ludGgnXSwgcHJvcHMpO1xuXG4gICAgcmV0dXJuIG91dDtcbiAgfTtcblxuICBTeW50aC5kZWZhdWx0cyA9IHtcbiAgICB3YXZlZm9ybTogJ3NhdycsXG4gICAgYXR0YWNrOiA0NCxcbiAgICBkZWNheTogMjIwNTAsXG4gICAgc3VzdGFpbjogNDQxMDAsXG4gICAgc3VzdGFpbkxldmVsOiAuNixcbiAgICByZWxlYXNlOiAyMjA1MCxcbiAgICB1c2VBRFNSOiBmYWxzZSxcbiAgICBzaGFwZTogJ2xpbmVhcicsXG4gICAgdHJpZ2dlclJlbGVhc2U6IGZhbHNlLFxuICAgIGdhaW46IC4yNSxcbiAgICBwdWxzZXdpZHRoOiAuMjUsXG4gICAgZnJlcXVlbmN5OiAyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBkZXR1bmUyOiAuMDA1LFxuICAgIGRldHVuZTM6IC0uMDA1LFxuICAgIGN1dG9mZjogMSxcbiAgICByZXNvbmFuY2U6IC4yNSxcbiAgICBROiAuNSxcbiAgICBwYW5Wb2ljZXM6IGZhbHNlLFxuICAgIGdsaWRlOiAxLFxuICAgIGFudGlhbGlhczogZmFsc2UsXG4gICAgZmlsdGVyVHlwZTogMSxcbiAgICBmaWx0ZXJNb2RlOiAwLCAvLyAwID0gTFAsIDEgPSBIUCwgMiA9IEJQLCAzID0gTm90Y2hcbiAgICBzYXR1cmF0aW9uOiAuNSxcbiAgICBmaWx0ZXJNdWx0OiA0LFxuICAgIGlzTG93UGFzczogdHJ1ZSxcbiAgICBsb3VkbmVzczogMVxuICB9O1xuXG4gIGxldCBQb2x5TW9ubyA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoU3ludGgsIFsnZnJlcXVlbmN5JywgJ2F0dGFjaycsICdkZWNheScsICdjdXRvZmYnLCAnUScsICdkZXR1bmUyJywgJ2RldHVuZTMnLCAncHVsc2V3aWR0aCcsICdwYW4nLCAnZ2FpbicsICdnbGlkZScsICdzYXR1cmF0aW9uJywgJ2ZpbHRlck11bHQnLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnd2F2ZWZvcm0nLCAnZmlsdGVyTW9kZSddKTtcbiAgUG9seU1vbm8uZGVmYXVsdHMgPSBTeW50aC5kZWZhdWx0cztcblxuICByZXR1cm4gW1N5bnRoLCBQb2x5TW9ub107XG59OyIsIi8vIFhYWCBUT08gTUFOWSBHTE9CQUwgR0lCQkVSSVNIIFZBTFVFU1xuXG5jb25zdCBHaWJiZXJpc2ggPSByZXF1aXJlKCAnLi4vaW5kZXguanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5vdGUoIGZyZXEsIGdhaW4gKSB7XG4gICAgLy8gd2lsbCBiZSBzZW50IHRvIHByb2Nlc3NvciBub2RlIHZpYSBwcm94eSBtZXRob2QuLi5cbiAgICBpZiggR2liYmVyaXNoLm1vZGUgIT09ICd3b3JrbGV0JyApIHtcbiAgICAgIGxldCB2b2ljZSA9IHRoaXMuX19nZXRWb2ljZV9fKClcbiAgICAgIC8vT2JqZWN0LmFzc2lnbiggdm9pY2UsIHRoaXMucHJvcGVydGllcyApXG4gICAgICBpZiggZ2FpbiA9PT0gdW5kZWZpbmVkICkgZ2FpbiA9IHRoaXMuZ2FpblxuICAgICAgdm9pY2UuZ2FpbiA9IGdhaW5cbiAgICAgIHZvaWNlLm5vdGUoIGZyZXEgKVxuICAgICAgdGhpcy5fX3J1blZvaWNlX18oIHZvaWNlLCB0aGlzIClcbiAgICAgIHRoaXMudHJpZ2dlck5vdGUgPSBmcmVxXG4gICAgfVxuICB9LFxuXG4gIC8vIFhYWCB0aGlzIGlzIG5vdCBwYXJ0aWN1bGFybHkgc2F0aXNmeWluZy4uLlxuICAvLyBtdXN0IGNoZWNrIGZvciBib3RoIG5vdGVzIGFuZCBjaG9yZHNcbiAgdHJpZ2dlciggZ2FpbiApIHtcbiAgICBpZiggdGhpcy50cmlnZ2VyQ2hvcmQgIT09IG51bGwgKSB7XG4gICAgICB0aGlzLnRyaWdnZXJDaG9yZC5mb3JFYWNoKCB2ID0+IHtcbiAgICAgICAgbGV0IHZvaWNlID0gdGhpcy5fX2dldFZvaWNlX18oKVxuICAgICAgICBPYmplY3QuYXNzaWduKCB2b2ljZSwgdGhpcy5wcm9wZXJ0aWVzIClcbiAgICAgICAgdm9pY2Uubm90ZSggdiApXG4gICAgICAgIHZvaWNlLmdhaW4gPSBnYWluXG4gICAgICAgIHRoaXMuX19ydW5Wb2ljZV9fKCB2b2ljZSwgdGhpcyApXG4gICAgICB9KVxuICAgIH1lbHNlIGlmKCB0aGlzLnRyaWdnZXJOb3RlICE9PSBudWxsICkge1xuICAgICAgbGV0IHZvaWNlID0gdGhpcy5fX2dldFZvaWNlX18oKVxuICAgICAgT2JqZWN0LmFzc2lnbiggdm9pY2UsIHRoaXMucHJvcGVydGllcyApXG4gICAgICB2b2ljZS5ub3RlKCB0aGlzLnRyaWdnZXJOb3RlIClcbiAgICAgIHZvaWNlLmdhaW4gPSBnYWluXG4gICAgICB0aGlzLl9fcnVuVm9pY2VfXyggdm9pY2UsIHRoaXMgKVxuICAgIH1lbHNle1xuICAgICAgbGV0IHZvaWNlID0gdGhpcy5fX2dldFZvaWNlX18oKVxuICAgICAgT2JqZWN0LmFzc2lnbiggdm9pY2UsIHRoaXMucHJvcGVydGllcyApXG4gICAgICB2b2ljZS50cmlnZ2VyKCBnYWluIClcbiAgICAgIHRoaXMuX19ydW5Wb2ljZV9fKCB2b2ljZSwgdGhpcyApXG4gICAgfVxuICB9LFxuXG4gIF9fcnVuVm9pY2VfXyggdm9pY2UsIF9wb2x5ICkge1xuICAgIGlmKCAhdm9pY2UuaXNDb25uZWN0ZWQgKSB7XG4gICAgICB2b2ljZS5jb25uZWN0KCBfcG9seSApXG4gICAgICB2b2ljZS5pc0Nvbm5lY3RlZCA9IHRydWVcbiAgICB9XG5cbiAgICBsZXQgZW52Q2hlY2tcbiAgICBpZiggX3BvbHkuZW52Q2hlY2sgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGVudkNoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKCB2b2ljZS5lbnYuaXNDb21wbGV0ZSgpICkge1xuICAgICAgICAgIF9wb2x5LmRpc2Nvbm5lY3RVZ2VuKCB2b2ljZSApXG4gICAgICAgICAgdm9pY2UuaXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3MucHVzaCggZW52Q2hlY2sgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBlbnZDaGVjayA9IF9wb2x5LmVudkNoZWNrKCB2b2ljZSwgX3BvbHkgKVxuICAgIH1cblxuICAgIC8vIFhYWCB1bmNvbW1lbnQgdGhpcyBsaW5lIHRvIHR1cm4gb24gZHluYW1pY2FsbHkgY29ubmVjdGluZ1xuICAgIC8vIGRpc2Nvbm5lY3RpbmcgaW5kaXZpZHVhbCB2b2ljZXMgZnJvbSBncmFwaFxuICAgIC8vR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLnB1c2goIGVudkNoZWNrIClcbiAgfSxcblxuICBfX2dldFZvaWNlX18oKSB7XG4gICAgcmV0dXJuIHRoaXMudm9pY2VzWyB0aGlzLnZvaWNlQ291bnQrKyAlIHRoaXMudm9pY2VzLmxlbmd0aCBdXG4gIH0sXG5cbiAgY2hvcmQoIGZyZXF1ZW5jaWVzICkge1xuICAgIC8vIHdpbGwgYmUgc2VudCB0byBwcm9jZXNzb3Igbm9kZSB2aWEgcHJveHkgbWV0aG9kLi4uXG4gICAgaWYoIEdpYmJlcmlzaCAhPT0gdW5kZWZpbmVkICYmIEdpYmJlcmlzaC5tb2RlICE9PSAnd29ya2xldCcgKSB7XG4gICAgICBmcmVxdWVuY2llcy5mb3JFYWNoKCB2ID0+IHRoaXMubm90ZSggdiApIClcbiAgICAgIHRoaXMudHJpZ2dlckNob3JkID0gZnJlcXVlbmNpZXNcbiAgICB9XG4gIH0sXG5cbiAgZnJlZSgpIHtcbiAgICBmb3IoIGxldCBjaGlsZCBvZiB0aGlzLnZvaWNlcyApIGNoaWxkLmZyZWUoKVxuICB9XG59XG4iLCIvKlxuICogVGhpcyBmaWxlcyBjcmVhdGVzIGEgZmFjdG9yeSBnZW5lcmF0aW5nIHBvbHlzeW50aCBjb25zdHJ1Y3RvcnMuXG4gKi9cblxuY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcbmNvbnN0IF9fcHJveHkgPSByZXF1aXJlKCAnLi4vd29ya2xldFByb3h5LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgY29uc3QgcHJveHkgPSBfX3Byb3h5KCBHaWJiZXJpc2ggKVxuXG4gIGNvbnN0IFRlbXBsYXRlRmFjdG9yeSA9ICggdWdlbiwgcHJvcGVydHlMaXN0LCBfZW52Q2hlY2sgKSA9PiB7XG4gICAgLyogXG4gICAgICogcG9seXN5bnRocyBhcmUgYmFzaWNhbGx5IGJ1c3NlcyB0aGF0IGNvbm5lY3QgY2hpbGQgc3ludGggdm9pY2VzLlxuICAgICAqIFdlIGNyZWF0ZSBzZXBhcmF0ZSBwcm90b3R5cGVzIGZvciBtb25vIHZzIHN0ZXJlbyBpbnN0YW5jZXMuXG4gICAgICovXG5cbiAgICBjb25zdCBtb25vUHJvdG8gICA9IE9iamVjdC5jcmVhdGUoIEdpYmJlcmlzaC5CdXMoKSApLFxuICAgICAgICAgIHN0ZXJlb1Byb3RvID0gT2JqZWN0LmNyZWF0ZSggR2liYmVyaXNoLkJ1czIoKSApXG5cbiAgICAvLyBzaW5jZSB0aGVyZSBhcmUgdHdvIHByb3RvdHlwZXMgd2UgY2FuJ3QgYXNzaWduIGRpcmVjdGx5IHRvIG9uZSBvZiB0aGVtLi4uXG4gICAgT2JqZWN0LmFzc2lnbiggbW9ub1Byb3RvLCAgIEdpYmJlcmlzaC5taXhpbnMucG9seWluc3RydW1lbnQgKVxuICAgIE9iamVjdC5hc3NpZ24oIHN0ZXJlb1Byb3RvLCBHaWJiZXJpc2gubWl4aW5zLnBvbHlpbnN0cnVtZW50IClcblxuICAgIGNvbnN0IFRlbXBsYXRlID0gcHJvcHMgPT4ge1xuICAgICAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oIHt9LCB7IGlzU3RlcmVvOnRydWUsIG1heFZvaWNlczo0IH0sIHByb3BzIClcblxuICAgICAgLy9jb25zdCBzeW50aCA9IHByb3BlcnRpZXMuaXNTdGVyZW8gPT09IHRydWUgPyBPYmplY3QuY3JlYXRlKCBzdGVyZW9Qcm90byApIDogT2JqZWN0LmNyZWF0ZSggbW9ub1Byb3RvIClcbiAgICAgIGNvbnN0IHN5bnRoID0gcHJvcGVydGllcy5pc1N0ZXJlbyA9PT0gdHJ1ZSA/IEdpYmJlcmlzaC5CdXMyKHsgX191c2VQcm94eV9fOmZhbHNlIH0pIDogR2liYmVyaXNoLkJ1cyh7IF9fdXNlUHJveHlfXzpmYWxzZSB9KSBcblxuICAgICAgT2JqZWN0LmFzc2lnbiggXG4gICAgICAgIHN5bnRoLCBcblxuICAgICAgICB7XG4gICAgICAgICAgdm9pY2VzOiBbXSxcbiAgICAgICAgICBtYXhWb2ljZXM6IHByb3BlcnRpZXMubWF4Vm9pY2VzLCBcbiAgICAgICAgICB2b2ljZUNvdW50OiAwLFxuICAgICAgICAgIGVudkNoZWNrOiBfZW52Q2hlY2ssXG4gICAgICAgICAgZGlydHk6IHRydWUsXG4gICAgICAgICAgdWdlbk5hbWU6ICdwb2x5JyArIHVnZW4ubmFtZSArICdfJyArIHN5bnRoLmlkICsgJ18nICsgKCBwcm9wZXJ0aWVzLmlzU3RlcmVvID8gMiA6IDEgKSxcbiAgICAgICAgICBwcm9wZXJ0aWVzXG4gICAgICAgIH0sXG5cbiAgICAgICAgR2liYmVyaXNoLm1peGlucy5wb2x5aW5zdHJ1bWVudFxuICAgICAgKVxuXG4gICAgICBwcm9wZXJ0aWVzLnBhblZvaWNlcyA9IHRydWUvL2ZhbHNlLy9wcm9wZXJ0aWVzLmlzU3RlcmVvXG4gICAgICBzeW50aC5jYWxsYmFjay51Z2VuTmFtZSA9IHN5bnRoLnVnZW5OYW1lXG5cbiAgICAgIGNvbnN0IHN0b3JlZElkID0gcHJvcGVydGllcy5pZFxuICAgICAgaWYoIHByb3BlcnRpZXMuaWQgIT09IHVuZGVmaW5lZCApIGRlbGV0ZSBwcm9wZXJ0aWVzLmlkIFxuXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHN5bnRoLm1heFZvaWNlczsgaSsrICkge1xuICAgICAgICBwcm9wZXJ0aWVzLmlkID0gc3ludGguaWQgKydfJytpXG4gICAgICAgIHN5bnRoLnZvaWNlc1tpXSA9IHVnZW4oIHByb3BlcnRpZXMgKVxuICAgICAgICBzeW50aC52b2ljZXNbaV0uY2FsbGJhY2sudWdlbk5hbWUgPSBzeW50aC52b2ljZXNbaV0udWdlbk5hbWVcbiAgICAgICAgc3ludGgudm9pY2VzW2ldLmlzQ29ubmVjdGVkID0gZmFsc2VcbiAgICAgIH1cblxuICAgICAgbGV0IF9wcm9wZXJ0eUxpc3QgXG4gICAgICBpZiggcHJvcGVydGllcy5pc1N0ZXJlbyA9PT0gZmFsc2UgKSB7XG4gICAgICAgIF9wcm9wZXJ0eUxpc3QgPSBwcm9wZXJ0eUxpc3Quc2xpY2UoIDAgKVxuICAgICAgICBjb25zdCBpZHggPSAgX3Byb3BlcnR5TGlzdC5pbmRleE9mKCAncGFuJyApXG4gICAgICAgIGlmKCBpZHggID4gLTEgKSBfcHJvcGVydHlMaXN0LnNwbGljZSggaWR4LCAxIClcbiAgICAgIH1cblxuICAgICAgcHJvcGVydGllcy5pZCA9IHN0b3JlZElkXG5cbiAgICAgIFRlbXBsYXRlRmFjdG9yeS5zZXR1cFByb3BlcnRpZXMoIHN5bnRoLCB1Z2VuLCBwcm9wZXJ0aWVzLmlzU3RlcmVvID8gcHJvcGVydHlMaXN0IDogX3Byb3BlcnR5TGlzdCApXG5cbiAgICAgIHJldHVybiBwcm94eSggWydpbnN0cnVtZW50cycsICdQb2x5Jyt1Z2VuLm5hbWVdLCBwcm9wZXJ0aWVzLCBzeW50aCApIFxuICAgIH1cblxuICAgIHJldHVybiBUZW1wbGF0ZVxuICB9XG5cbiAgVGVtcGxhdGVGYWN0b3J5LnNldHVwUHJvcGVydGllcyA9IGZ1bmN0aW9uKCBzeW50aCwgdWdlbiwgcHJvcHMgKSB7XG4gICAgZm9yKCBsZXQgcHJvcGVydHkgb2YgcHJvcHMgKSB7XG4gICAgICBpZiggcHJvcGVydHkgPT09ICdwYW4nIHx8IHByb3BlcnR5ID09PSAnaWQnICkgY29udGludWVcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggc3ludGgsIHByb3BlcnR5LCB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gc3ludGgucHJvcGVydGllc1sgcHJvcGVydHkgXSB8fCB1Z2VuLmRlZmF1bHRzWyBwcm9wZXJ0eSBdXG4gICAgICAgIH0sXG4gICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICBzeW50aC5wcm9wZXJ0aWVzWyBwcm9wZXJ0eSBdID0gdlxuICAgICAgICAgIGZvciggbGV0IGNoaWxkIG9mIHN5bnRoLnZvaWNlcyApIHtcbiAgICAgICAgICAgIGNoaWxkWyBwcm9wZXJ0eSBdID0gdlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gVGVtcGxhdGVGYWN0b3J5XG5cbn1cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuICBsZXQgcHJvdG8gPSBPYmplY3QuY3JlYXRlKCBpbnN0cnVtZW50IClcblxuICBPYmplY3QuYXNzaWduKCBwcm90bywge1xuICAgIG5vdGUoIHJhdGUgKSB7XG4gICAgICB0aGlzLnJhdGUgPSByYXRlXG4gICAgICBpZiggcmF0ZSA+IDAgKSB7XG4gICAgICAgIHRoaXMuX190cmlnZ2VyKClcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLl9fcGhhc2VfXy52YWx1ZSA9IHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMSBcbiAgICAgIH1cbiAgICB9LFxuICAgIHRyaWdnZXIoIHZvbHVtZSApIHtcbiAgICAgIGlmKCB2b2x1bWUgIT09IHVuZGVmaW5lZCApIHRoaXMuZ2FpbiA9IHZvbHVtZVxuXG4gICAgICAvLyBpZiB3ZSdyZSBwbGF5aW5nIHRoZSBzYW1wbGUgZm9yd2FyZHMuLi5cbiAgICAgIGlmKCBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIHRoaXMuX19yYXRlU3RvcmFnZV9fLm1lbW9yeS52YWx1ZXMuaWR4IF0gPiAwICkge1xuICAgICAgICB0aGlzLl9fdHJpZ2dlcigpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5fX3BoYXNlX18udmFsdWUgPSB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDEgXG4gICAgICB9XG4gICAgfSxcbiAgfSlcblxuICBjb25zdCBTYW1wbGVyID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgY29uc3Qgc3luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7IG9ubG9hZDpudWxsIH0sIFNhbXBsZXIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuXG4gICAgc3luLmlzU3RlcmVvID0gcHJvcHMuaXNTdGVyZW8gIT09IHVuZGVmaW5lZCA/IHByb3BzLmlzU3RlcmVvIDogZmFsc2VcblxuICAgIGNvbnN0IHN0YXJ0ID0gZy5pbiggJ3N0YXJ0JyApLCBlbmQgPSBnLmluKCAnZW5kJyApLCBcbiAgICAgICAgICByYXRlID0gZy5pbiggJ3JhdGUnICksIHNob3VsZExvb3AgPSBnLmluKCAnbG9vcHMnICksXG4gICAgICAgICAgbG91ZG5lc3MgPSBnLmluKCAnbG91ZG5lc3MnICksXG4gICAgICAgICAgLy8gcmF0ZSBzdG9yYWdlIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgd2UncmUgcGxheWluZ1xuICAgICAgICAgIC8vIHRoZSBzYW1wbGUgZm9yd2FyZCBvciBpbiByZXZlcnNlLCBmb3IgdXNlIGluIHRoZSAndHJpZ2dlcicgbWV0aG9kLlxuICAgICAgICAgIHJhdGVTdG9yYWdlID0gZy5kYXRhKFswXSwgMSwgeyBtZXRhOnRydWUgfSlcblxuICAgIE9iamVjdC5hc3NpZ24oIHN5biwgcHJvcHMgKVxuXG4gICAgaWYoIEdpYmJlcmlzaC5tb2RlID09PSAnd29ya2xldCcgKSB7XG4gICAgICBzeW4uX19tZXRhX18gPSB7XG4gICAgICAgIGFkZHJlc3M6J2FkZCcsXG4gICAgICAgIG5hbWU6IFsnaW5zdHJ1bWVudHMnLCAnU2FtcGxlciddLFxuICAgICAgICBwcm9wZXJ0aWVzOiBKU09OLnN0cmluZ2lmeShwcm9wcyksIFxuICAgICAgICBpZDogc3luLmlkXG4gICAgICB9XG5cbiAgICAgIEdpYmJlcmlzaC53b3JrbGV0LnVnZW5zLnNldCggc3luLmlkLCBzeW4gKVxuXG4gICAgICBHaWJiZXJpc2gud29ya2xldC5wb3J0LnBvc3RNZXNzYWdlKCBzeW4uX19tZXRhX18gKVxuICAgIH1cblxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24oKSB7XG4gICAgICBzeW4uX19iYW5nX18gPSBnLmJhbmcoKVxuICAgICAgc3luLl9fdHJpZ2dlciA9IHN5bi5fX2JhbmdfXy50cmlnZ2VyXG5cbiAgICAgIHN5bi5fX3BoYXNlX18gPSBnLmNvdW50ZXIoIHJhdGUsIHN0YXJ0LCBlbmQsIHN5bi5fX2JhbmdfXywgc2hvdWxkTG9vcCwgeyBzaG91bGRXcmFwOmZhbHNlLCBpbml0aWFsVmFsdWU6OTk5OTk5OSB9KVxuICAgICAgXG4gICAgICBzeW4uX19yYXRlU3RvcmFnZV9fID0gcmF0ZVN0b3JhZ2VcbiAgICAgIHJhdGVTdG9yYWdlWzBdID0gcmF0ZVxuXG4gICAgICAvLyBYWFggd2UgYWRkZWQgb3VyIHJlY29yZGVkICdyYXRlJyBwYXJhbSBhbmQgdGhlbiBlZmZlY3RpdmVseSBzdWJzdHJhY3QgaXQsXG4gICAgICAvLyBzbyB0aGF0IGl0cyBwcmVzZW5jZSBpbiB0aGUgZ3JhcGggd2lsbCBmb3JjZSBnZW5pc2ggdG8gYWN0dWFsbHkgcmVjb3JkIHRoZSBcbiAgICAgIC8vIHJhdGUgYXMgdGhlIGlucHV0LiB0aGlzIGlzIGV4dHJlbWVseSBoYWNreS4uLiB0aGVyZSBzaG91bGQgYmUgYSB3YXkgdG8gcmVjb3JkXG4gICAgICAvLyB2YWx1ZSB3aXRob3V0IGhhdmluZyB0byBpbmNsdWRlIGl0IGluIHRoZSBncmFwaCFcbiAgICAgIHN5bi5ncmFwaCA9IGcuYWRkKCBnLm11bCggXG4gICAgICAgIGcuaWZlbHNlKCBcbiAgICAgICAgICBnLmFuZCggZy5ndGUoIHN5bi5fX3BoYXNlX18sIHN0YXJ0ICksIGcubHQoIHN5bi5fX3BoYXNlX18sIGVuZCApICksXG4gICAgICAgICAgZy5wZWVrKCBcbiAgICAgICAgICAgIHN5bi5kYXRhLCBcbiAgICAgICAgICAgIHN5bi5fX3BoYXNlX18sXG4gICAgICAgICAgICB7IG1vZGU6J3NhbXBsZXMnIH1cbiAgICAgICAgICApLFxuICAgICAgICAgIDBcbiAgICAgICAgKSwgXG4gICAgICAgIGcubXVsKCBsb3VkbmVzcywgZy5pbignZ2FpbicpIClcbiAgICAgICksIHJhdGVTdG9yYWdlWzBdLCBnLm11bCggcmF0ZVN0b3JhZ2VbMF0sIC0xICkgKVxuICAgIH1cblxuICAgIGNvbnN0IG9ubG9hZCA9IGJ1ZmZlciA9PiB7XG4gICAgICBpZiggR2liYmVyaXNoLm1vZGUgPT09ICd3b3JrbGV0JyApIHtcbiAgICAgICAgY29uc3QgbWVtSWR4ID0gR2liYmVyaXNoLm1lbW9yeS5hbGxvYyggc3luLmRhdGEubWVtb3J5LnZhbHVlcy5sZW5ndGgsIHRydWUgKVxuXG4gICAgICAgIEdpYmJlcmlzaC53b3JrbGV0LnBvcnQucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgIGFkZHJlc3M6J2NvcHknLFxuICAgICAgICAgIGlkOiBzeW4uaWQsXG4gICAgICAgICAgaWR4OiBtZW1JZHgsXG4gICAgICAgICAgYnVmZmVyOiBzeW4uZGF0YS5idWZmZXJcbiAgICAgICAgfSlcblxuICAgICAgfWVsc2UgaWYgKCBHaWJiZXJpc2gubW9kZSA9PT0gJ3Byb2Nlc3NvcicgKSB7XG4gICAgICAgIHN5bi5kYXRhLmJ1ZmZlciA9IGJ1ZmZlclxuICAgICAgICBzeW4uZGF0YS5tZW1vcnkudmFsdWVzLmxlbmd0aCA9IHN5bi5kYXRhLmRpbSA9IGJ1ZmZlci5sZW5ndGhcbiAgICAgICAgc3luLl9fcmVkb0dyYXBoKCkgXG4gICAgICB9XG5cbiAgICAgIGlmKCB0eXBlb2Ygc3luLm9ubG9hZCA9PT0gJ2Z1bmN0aW9uJyApeyAgXG4gICAgICAgIHN5bi5vbmxvYWQoIGJ1ZmZlciB8fCBzeW4uZGF0YS5idWZmZXIgKVxuICAgICAgfVxuICAgICAgaWYoIHN5bi5lbmQgPT09IC05OTk5OTk5OTkgKSBzeW4uZW5kID0gc3luLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDFcbiAgICB9XG5cbiAgICAvL2lmKCBwcm9wcy5maWxlbmFtZSApIHtcbiAgICBzeW4ubG9hZEZpbGUgPSBmdW5jdGlvbiggZmlsZW5hbWUgKSB7XG4gICAgICBpZiggR2liYmVyaXNoLm1vZGUgIT09ICdwcm9jZXNzb3InICkgeyBcbiAgICAgICAgc3luLmRhdGEgPSBnLmRhdGEoIGZpbGVuYW1lIClcbiAgICAgIH1lbHNle1xuICAgICAgICBzeW4uZGF0YSA9IGcuZGF0YSggbmV3IEZsb2F0MzJBcnJheSgpIClcbiAgICAgIH1cblxuICAgICAgc3luLmRhdGEub25sb2FkID0gb25sb2FkXG4gICAgfVxuXG4gICAgc3luLmxvYWRCdWZmZXIgPSBmdW5jdGlvbiggYnVmZmVyICkge1xuICAgICAgaWYoIEdpYmJlcmlzaC5tb2RlID09PSAncHJvY2Vzc29yJyApIHtcbiAgICAgICAgc3luLmRhdGEuYnVmZmVyID0gYnVmZmVyXG4gICAgICAgIHN5bi5kYXRhLm1lbW9yeS52YWx1ZXMubGVuZ3RoID0gc3luLmRhdGEuZGltID0gYnVmZmVyLmxlbmd0aFxuICAgICAgICBzeW4uX19yZWRvR3JhcGgoKSBcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiggcHJvcHMuZmlsZW5hbWUgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHN5bi5sb2FkRmlsZSggcHJvcHMuZmlsZW5hbWUgKVxuICAgIH1lbHNle1xuICAgICAgc3luLmRhdGEgPSBnLmRhdGEoIG5ldyBGbG9hdDMyQXJyYXkoKSApXG4gICAgfVxuXG4gICAgc3luLmRhdGEub25sb2FkID0gb25sb2FkXG5cbiAgICBzeW4uX19jcmVhdGVHcmFwaCgpXG4gICAgXG4gICAgY29uc3Qgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIFxuICAgICAgc3luLFxuICAgICAgc3luLmdyYXBoLFxuICAgICAgWydpbnN0cnVtZW50cycsJ3NhbXBsZXInXSwgXG4gICAgICBwcm9wcyBcbiAgICApIFxuXG4gICAgcmV0dXJuIG91dFxuICB9XG5cbiAgU2FtcGxlci5kZWZhdWx0cyA9IHtcbiAgICBnYWluOiAxLFxuICAgIHBhbjogLjUsXG4gICAgcmF0ZTogMSxcbiAgICBwYW5Wb2ljZXM6ZmFsc2UsXG4gICAgbG9vcHM6IDAsXG4gICAgc3RhcnQ6MCxcbiAgICBlbmQ6LTk5OTk5OTk5OSxcbiAgICBsb3VkbmVzczoxXG4gIH1cblxuICBjb25zdCBlbnZDaGVja0ZhY3RvcnkgPSBmdW5jdGlvbiggdm9pY2UsIF9wb2x5ICkge1xuXG4gICAgY29uc3QgZW52Q2hlY2sgPSAoKSA9PiB7XG4gICAgICBjb25zdCBwaGFzZSA9IEdpYmJlcmlzaC5tZW1vcnkuaGVhcFsgdm9pY2UuX19waGFzZV9fLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgaWYoICggdm9pY2UucmF0ZSA+IDAgJiYgcGhhc2UgPiB2b2ljZS5lbmQgKSB8fCAoIHZvaWNlLnJhdGUgPCAwICYmIHBoYXNlIDwgMCApICkge1xuICAgICAgICBfcG9seS5kaXNjb25uZWN0VWdlbi5jYWxsKCBfcG9seSwgdm9pY2UgKVxuICAgICAgICB2b2ljZS5pc0Nvbm5lY3RlZCA9IGZhbHNlXG4gICAgICB9ZWxzZXtcbiAgICAgICAgR2liYmVyaXNoLmJsb2NrQ2FsbGJhY2tzLnB1c2goIGVudkNoZWNrIClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZW52Q2hlY2tcbiAgfVxuXG4gIGNvbnN0IFBvbHlTYW1wbGVyID0gR2liYmVyaXNoLlBvbHlUZW1wbGF0ZSggU2FtcGxlciwgWydyYXRlJywncGFuJywnZ2FpbicsJ3N0YXJ0JywnZW5kJywnbG9vcHMnXSwgZW52Q2hlY2tGYWN0b3J5ICkgXG5cbiAgcmV0dXJuIFsgU2FtcGxlciwgUG9seVNhbXBsZXIgXVxufVxuXG4iLCJsZXQgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgaW5zdHJ1bWVudCA9IHJlcXVpcmUoICcuL2luc3RydW1lbnQuanMnIClcbiAgXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgbGV0IFNuYXJlID0gYXJndW1lbnRQcm9wcyA9PiB7XG4gICAgbGV0IHNuYXJlID0gT2JqZWN0LmNyZWF0ZSggaW5zdHJ1bWVudCApLFxuICAgICAgICBkZWNheSA9IGcuaW4oICdkZWNheScgKSxcbiAgICAgICAgc2NhbGVkRGVjYXkgPSBnLm11bCggZGVjYXksIGcuZ2VuLnNhbXBsZXJhdGUgKiAyICksXG4gICAgICAgIHNuYXBweT0gZy5pbiggJ3NuYXBweScgKSxcbiAgICAgICAgdHVuZSAgPSBnLmluKCAndHVuZScgKSxcbiAgICAgICAgZ2FpbiAgPSBnLmluKCAnZ2FpbicgKSxcbiAgICAgICAgbG91ZG5lc3MgPSBnLmluKCAnbG91ZG5lc3MnIClcblxuICAgIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBTbmFyZS5kZWZhdWx0cywgYXJndW1lbnRQcm9wcyApXG5cbiAgICBsZXQgZWcgPSBnLmRlY2F5KCBzY2FsZWREZWNheSwgeyBpbml0VmFsdWU6MCB9ICksIFxuICAgICAgICBjaGVjayA9IGcubWVtbyggZy5ndCggZWcsIC4wMDA1ICkgKSxcbiAgICAgICAgcm5kID0gZy5tdWwoIGcubm9pc2UoKSwgZWcgKSxcbiAgICAgICAgaHBmID0gZy5zdmYoIHJuZCwgZy5hZGQoIDEwMDAsIGcubXVsKCBnLmFkZCggMSwgdHVuZSksIDEwMDAgKSApLCAuNSwgMSwgZmFsc2UgKSxcbiAgICAgICAgc25hcCA9IGcubXVsKCBnLmd0cCggZy5tdWwoIGhwZiwgc25hcHB5ICksIDAgKSwgbG91ZG5lc3MgKSwgLy8gcmVjdGlmeVxuICAgICAgICBicGYxID0gZy5zdmYoIGVnLCBnLm11bCggMTgwLCBnLmFkZCggdHVuZSwgMSApICksIC4wNSwgMiwgZmFsc2UgKSxcbiAgICAgICAgYnBmMiA9IGcuc3ZmKCBlZywgZy5tdWwoIDMzMCwgZy5hZGQoIHR1bmUsIDEgKSApLCAuMDUsIDIsIGZhbHNlICksXG4gICAgICAgIG91dCAgPSBnLm1lbW8oIGcuYWRkKCBzbmFwLCBicGYxLCBnLm11bCggYnBmMiwgLjggKSApICksIC8vWFhYIHdoeSBpcyBtZW1vIG5lZWRlZD9cbiAgICAgICAgc2NhbGVkT3V0ID0gZy5tdWwoIG91dCwgZy5tdWwoIGdhaW4sIGxvdWRuZXNzICkgKVxuICAgIFxuICAgIC8vIFhYWCBUT0RPIDogbWFrZSB0aGlzIHdvcmsgd2l0aCBpZmVsc2UuIHRoZSBwcm9ibGVtIGlzIHRoYXQgcG9rZSB1Z2VucyBwdXQgdGhlaXJcbiAgICAvLyBjb2RlIGF0IHRoZSBib3R0b20gb2YgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLCBpbnN0ZWFkIG9mIGF0IHRoZSBlbmQgb2YgdGhlXG4gICAgLy8gYXNzb2NpYXRlZCBpZi9lbHNlIGJsb2NrLlxuICAgIGxldCBpZmUgPSBnLnN3aXRjaCggY2hlY2ssIHNjYWxlZE91dCwgMCApXG4gICAgLy9sZXQgaWZlID0gZy5pZmVsc2UoIGcuZ3QoIGVnLCAuMDA1ICksIGN5Y2xlKDQ0MCksIDAgKVxuICAgIFxuICAgIHNuYXJlLmVudiA9IGVnIFxuICAgIHNuYXJlID0gR2liYmVyaXNoLmZhY3RvcnkoIHNuYXJlLCBpZmUsIFsnaW5zdHJ1bWVudHMnLCdzbmFyZSddLCBwcm9wcyAgKVxuICAgIFxuICAgIHJldHVybiBzbmFyZVxuICB9XG4gIFxuICBTbmFyZS5kZWZhdWx0cyA9IHtcbiAgICBnYWluOiAuNSxcbiAgICBmcmVxdWVuY3k6MTAwMCxcbiAgICB0dW5lOjAsXG4gICAgc25hcHB5OiAxLFxuICAgIGRlY2F5Oi4xLFxuICAgIGxvdWRuZXNzOjFcbiAgfVxuXG4gIHJldHVybiBTbmFyZVxuXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSgnZ2VuaXNoLmpzJyksXG4gICAgICBpbnN0cnVtZW50ID0gcmVxdWlyZSgnLi9pbnN0cnVtZW50LmpzJyk7XG5cbmNvbnN0IGdlbmlzaCA9IGc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEdpYmJlcmlzaCkge1xuXG4gIGNvbnN0IFN5bnRoID0gaW5wdXRQcm9wcyA9PiB7XG4gICAgY29uc3Qgc3luID0gT2JqZWN0LmNyZWF0ZShpbnN0cnVtZW50KTtcblxuICAgIGNvbnN0IGZyZXF1ZW5jeSA9IGcuaW4oJ2ZyZXF1ZW5jeScpLFxuICAgICAgICAgIGxvdWRuZXNzID0gZy5pbignbG91ZG5lc3MnKSxcbiAgICAgICAgICBnbGlkZSA9IGcuaW4oJ2dsaWRlJyksXG4gICAgICAgICAgc2xpZGluZ0ZyZXEgPSBnLnNsaWRlKGZyZXF1ZW5jeSwgZ2xpZGUsIGdsaWRlKSxcbiAgICAgICAgICBhdHRhY2sgPSBnLmluKCdhdHRhY2snKSxcbiAgICAgICAgICBkZWNheSA9IGcuaW4oJ2RlY2F5JyksXG4gICAgICAgICAgc3VzdGFpbiA9IGcuaW4oJ3N1c3RhaW4nKSxcbiAgICAgICAgICBzdXN0YWluTGV2ZWwgPSBnLmluKCdzdXN0YWluTGV2ZWwnKSxcbiAgICAgICAgICByZWxlYXNlID0gZy5pbigncmVsZWFzZScpO1xuXG4gICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBTeW50aC5kZWZhdWx0cywgaW5wdXRQcm9wcyk7XG4gICAgT2JqZWN0LmFzc2lnbihzeW4sIHByb3BzKTtcblxuICAgIHN5bi5fX2NyZWF0ZUdyYXBoID0gZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3Qgb3NjID0gR2liYmVyaXNoLm9zY2lsbGF0b3JzLmZhY3Rvcnkoc3luLndhdmVmb3JtLCBzbGlkaW5nRnJlcSwgc3luLmFudGlhbGlhcyk7XG5cbiAgICAgIGNvbnN0IGVudiA9IEdpYmJlcmlzaC5lbnZlbG9wZXMuZmFjdG9yeShwcm9wcy51c2VBRFNSLCBwcm9wcy5zaGFwZSwgYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgc3VzdGFpbkxldmVsLCByZWxlYXNlLCBwcm9wcy50cmlnZ2VyUmVsZWFzZSk7XG5cbiAgICAgIC8vIGJlbG93IGRvZXNuJ3Qgd29yayBhcyBpdCBhdHRlbXB0cyB0byBhc3NpZ24gdG8gcmVsZWFzZSBwcm9wZXJ0eSB0cmlnZ2VyaW5nIGNvZGVnZW4uLi5cbiAgICAgIC8vIHN5bi5yZWxlYXNlID0gKCk9PiB7IHN5bi5lbnYucmVsZWFzZSgpIH1cblxuICAgICAge1xuICAgICAgICAndXNlIGpzZHNwJztcbiAgICAgICAgbGV0IG9zY1dpdGhFbnYgPSBnZW5pc2gubXVsKGdlbmlzaC5tdWwob3NjLCBlbnYpLCBsb3VkbmVzcyksXG4gICAgICAgICAgICBwYW5uZXI7XG5cbiAgICAgICAgY29uc3QgYmFzZUN1dG9mZkZyZXEgPSBnZW5pc2gubXVsKGcuaW4oJ2N1dG9mZicpLCBmcmVxdWVuY3kpO1xuICAgICAgICBjb25zdCBjdXRvZmYgPSBnZW5pc2gubXVsKGdlbmlzaC5tdWwoYmFzZUN1dG9mZkZyZXEsIGcucG93KDIsIGdlbmlzaC5tdWwoZy5pbignZmlsdGVyTXVsdCcpLCBsb3VkbmVzcykpKSwgZW52KTtcbiAgICAgICAgY29uc3QgZmlsdGVyZWRPc2MgPSBHaWJiZXJpc2guZmlsdGVycy5mYWN0b3J5KG9zY1dpdGhFbnYsIGN1dG9mZiwgZy5pbignUScpLCBnLmluKCdzYXR1cmF0aW9uJyksIHByb3BzKTtcblxuICAgICAgICBsZXQgc3ludGhXaXRoR2FpbiA9IGdlbmlzaC5tdWwoZmlsdGVyZWRPc2MsIGcuaW4oJ2dhaW4nKSk7XG5cbiAgICAgICAgaWYgKHN5bi5wYW5Wb2ljZXMgPT09IHRydWUpIHtcbiAgICAgICAgICBwYW5uZXIgPSBnLnBhbihzeW50aFdpdGhHYWluLCBzeW50aFdpdGhHYWluLCBnLmluKCdwYW4nKSk7XG4gICAgICAgICAgc3luLmdyYXBoID0gW3Bhbm5lci5sZWZ0LCBwYW5uZXIucmlnaHRdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN5bi5ncmFwaCA9IHN5bnRoV2l0aEdhaW47XG4gICAgICAgIH1cblxuICAgICAgICBzeW4uZW52ID0gZW52O1xuICAgICAgICBzeW4ub3NjID0gb3NjO1xuICAgICAgICBzeW4uZmlsdGVyID0gZmlsdGVyZWRPc2M7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHN5bi5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiA9IFsnd2F2ZWZvcm0nLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnZmlsdGVyTW9kZScsICd1c2VBRFNSJywgJ3NoYXBlJ107XG4gICAgc3luLl9fY3JlYXRlR3JhcGgoKTtcblxuICAgIGNvbnN0IG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KHN5biwgc3luLmdyYXBoLCBbJ2luc3RydW1lbnRzJywgJ3N5bnRoJ10sIHByb3BzKTtcblxuICAgIHJldHVybiBvdXQ7XG4gIH07XG5cbiAgU3ludGguZGVmYXVsdHMgPSB7XG4gICAgd2F2ZWZvcm06ICdzYXcnLFxuICAgIGF0dGFjazogNDQsXG4gICAgZGVjYXk6IDIyMDUwLFxuICAgIHN1c3RhaW46IDQ0MTAwLFxuICAgIHN1c3RhaW5MZXZlbDogLjYsXG4gICAgcmVsZWFzZTogMjIwNTAsXG4gICAgdXNlQURTUjogZmFsc2UsXG4gICAgc2hhcGU6ICdsaW5lYXInLFxuICAgIHRyaWdnZXJSZWxlYXNlOiBmYWxzZSxcbiAgICBnYWluOiAuNSxcbiAgICBwdWxzZXdpZHRoOiAuMjUsXG4gICAgZnJlcXVlbmN5OiAyMjAsXG4gICAgcGFuOiAuNSxcbiAgICBhbnRpYWxpYXM6IGZhbHNlLFxuICAgIHBhblZvaWNlczogZmFsc2UsXG4gICAgbG91ZG5lc3M6IDEsXG4gICAgZ2xpZGU6IDEsXG4gICAgc2F0dXJhdGlvbjogMSxcbiAgICBmaWx0ZXJNdWx0OiAyLFxuICAgIFE6IC4yNSxcbiAgICBjdXRvZmY6IC41LFxuICAgIGZpbHRlclR5cGU6IDAsXG4gICAgZmlsdGVyTW9kZTogMCxcbiAgICBpc0xvd1Bhc3M6IDFcbiAgfTtcblxuICAvLyBkbyBub3QgaW5jbHVkZSB2ZWxvY2l0eSwgd2hpY2ggc2hvdWRsIGFsd2F5cyBiZSBwZXIgdm9pY2VcbiAgbGV0IFBvbHlTeW50aCA9IEdpYmJlcmlzaC5Qb2x5VGVtcGxhdGUoU3ludGgsIFsnZnJlcXVlbmN5JywgJ2F0dGFjaycsICdkZWNheScsICdwdWxzZXdpZHRoJywgJ3BhbicsICdnYWluJywgJ2dsaWRlJywgJ3NhdHVyYXRpb24nLCAnZmlsdGVyTXVsdCcsICdRJywgJ2N1dG9mZicsICdyZXNvbmFuY2UnLCAnYW50aWFsaWFzJywgJ2ZpbHRlclR5cGUnLCAnd2F2ZWZvcm0nLCAnZmlsdGVyTW9kZSddKTtcbiAgUG9seVN5bnRoLmRlZmF1bHRzID0gU3ludGguZGVmYXVsdHM7XG5cbiAgcmV0dXJuIFtTeW50aCwgUG9seVN5bnRoXTtcbn07IiwiY29uc3QgdWdlbnByb3RvID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICkoKVxuY29uc3QgX19wcm94eSAgICAgPSByZXF1aXJlKCAnLi4vd29ya2xldFByb3h5LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgY29uc3QgcHJveHkgPSBfX3Byb3h5KCBHaWJiZXJpc2ggKVxuXG4gIGxldCBCaW5vcHMgPSB7XG4gICAgZXhwb3J0KCBvYmogKSB7XG4gICAgICBmb3IoIGxldCBrZXkgaW4gQmlub3BzICkge1xuICAgICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyApIHtcbiAgICAgICAgICBvYmpbIGtleSBdID0gQmlub3BzWyBrZXkgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBBZGQoIC4uLmFyZ3MgKSB7XG4gICAgICBjb25zdCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICBjb25zdCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggdWdlbnByb3RvIClcbiAgICAgIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgaXNvcDp0cnVlLCBvcDonKycsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonYWRkJyArIGlkLCBpZCB9IClcblxuICAgICAgcmV0dXJuIHByb3h5KCBbJ2Jpbm9wcycsJ0FkZCddLCB7IGlzb3A6dHJ1ZSwgaW5wdXRzOmFyZ3MgfSwgdWdlbiApXG4gICAgfSxcblxuICAgIFN1YiggLi4uYXJncyApIHtcbiAgICAgIGNvbnN0IGlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIGNvbnN0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCB1Z2VucHJvdG8gKVxuICAgICAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBpc29wOnRydWUsIG9wOictJywgaW5wdXRzOmFyZ3MsIHVnZW5OYW1lOidzdWInICsgaWQsIGlkIH0gKVxuXG4gICAgICByZXR1cm4gcHJveHkoIFsnYmlub3BzJywnU3ViJ10sIHsgaXNvcDp0cnVlLCBpbnB1dHM6YXJncyB9LCB1Z2VuIClcbiAgICB9LFxuXG4gICAgTXVsKCAuLi5hcmdzICkge1xuICAgICAgY29uc3QgaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuICAgICAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHVnZW5wcm90byApXG4gICAgICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IGlzb3A6dHJ1ZSwgb3A6JyonLCBpbnB1dHM6YXJncywgdWdlbk5hbWU6J211bCcgKyBpZCwgaWQgfSApXG5cbiAgICAgIHJldHVybiBwcm94eSggWydiaW5vcHMnLCdNdWwnXSwgeyBpc29wOnRydWUsIGlucHV0czphcmdzIH0sIHVnZW4gKVxuICAgIH0sXG5cbiAgICBEaXYoIC4uLmFyZ3MgKSB7XG4gICAgICBjb25zdCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICBjb25zdCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggdWdlbnByb3RvIClcbiAgICAgIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgaXNvcDp0cnVlLCBvcDonLycsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonZGl2JyArIGlkLCBpZCB9IClcbiAgICBcbiAgICAgIHJldHVybiBwcm94eSggWydiaW5vcHMnLCdEaXYnXSwgeyBpc29wOnRydWUsIGlucHV0czphcmdzIH0sIHVnZW4gKVxuICAgIH0sXG5cbiAgICBNb2QoIC4uLmFyZ3MgKSB7XG4gICAgICBjb25zdCBpZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG4gICAgICBjb25zdCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggdWdlbnByb3RvIClcbiAgICAgIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgaXNvcDp0cnVlLCBvcDonJScsIGlucHV0czphcmdzLCB1Z2VuTmFtZTonbW9kJyArIGlkLCBpZCB9IClcblxuICAgICAgcmV0dXJuIHByb3h5KCBbJ2Jpbm9wcycsJ01vZCddLCB7IGlzb3A6dHJ1ZSwgaW5wdXRzOmFyZ3MgfSwgdWdlbiApXG4gICAgfSwgICBcbiAgfVxuXG4gIHJldHVybiBCaW5vcHNcbn1cbiIsImxldCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKSxcbiAgICB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICkoKSxcbiAgICBfX3Byb3h5PSByZXF1aXJlKCAnLi4vd29ya2xldFByb3h5LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgY29uc3QgcHJveHkgPSBfX3Byb3h5KCBHaWJiZXJpc2ggKVxuICBjb25zdCBCdXMgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcblxuICBPYmplY3QuYXNzaWduKCBCdXMsIHtcbiAgICBnYWluOiB7XG4gICAgICBzZXQoIHYgKSB7XG4gICAgICAgIHRoaXMubXVsLmlucHV0c1sgMSBdID0gdlxuICAgICAgICBHaWJiZXJpc2guZGlydHkoIHRoaXMgKVxuICAgICAgfSxcbiAgICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubXVsWyAxIF1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX19hZGRJbnB1dCggaW5wdXQgKSB7XG4gICAgICB0aGlzLnN1bS5pbnB1dHMucHVzaCggaW5wdXQgKVxuICAgICAgR2liYmVyaXNoLmRpcnR5KCB0aGlzIClcbiAgICB9LFxuXG4gICAgY3JlYXRlKCBfcHJvcHMgKSB7XG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIEJ1cy5kZWZhdWx0cywgeyBpbnB1dHM6WzBdIH0sIF9wcm9wcyApXG5cbiAgICAgIGNvbnN0IHN1bSA9IEdpYmJlcmlzaC5iaW5vcHMuQWRkKCAuLi5wcm9wcy5pbnB1dHMgKVxuICAgICAgY29uc3QgbXVsID0gR2liYmVyaXNoLmJpbm9wcy5NdWwoIHN1bSwgcHJvcHMuZ2FpbiApXG5cbiAgICAgIGNvbnN0IGdyYXBoID0gR2liYmVyaXNoLlBhbm5lcih7IGlucHV0Om11bCwgcGFuOiBwcm9wcy5wYW4gfSlcblxuICAgICAgZ3JhcGguc3VtID0gc3VtXG4gICAgICBncmFwaC5tdWwgPSBtdWxcbiAgICAgIGdyYXBoLmRpc2Nvbm5lY3RVZ2VuID0gQnVzLmRpc2Nvbm5lY3RVZ2VuXG5cbiAgICAgIGdyYXBoLl9fcHJvcGVydGllc19fID0gcHJvcHNcblxuICAgICAgY29uc3Qgb3V0ID0gcHJvcHMuX191c2VQcm94eV9fID09PSB0cnVlID8gcHJveHkoIFsnQnVzJ10sIHByb3BzLCBncmFwaCApIDogZ3JhcGhcblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBvdXQsICdnYWluJywgQnVzLmdhaW4gKVxuXG4gICAgICBpZiggZmFsc2UgJiYgR2liYmVyaXNoLnByZXZlbnRQcm94eSA9PT0gZmFsc2UgJiYgR2liYmVyaXNoLm1vZGUgPT09ICd3b3JrbGV0JyApIHtcbiAgICAgICAgY29uc3QgbWV0YSA9IHtcbiAgICAgICAgICBhZGRyZXNzOidhZGQnLFxuICAgICAgICAgIG5hbWU6WydCdXMnXSxcbiAgICAgICAgICBwcm9wcywgXG4gICAgICAgICAgaWQ6Z3JhcGguaWRcbiAgICAgICAgfVxuICAgICAgICBHaWJiZXJpc2gud29ya2xldC5wb3J0LnBvc3RNZXNzYWdlKCBtZXRhIClcbiAgICAgICAgR2liYmVyaXNoLndvcmtsZXQucG9ydC5wb3N0TWVzc2FnZSh7IFxuICAgICAgICAgIGFkZHJlc3M6J21ldGhvZCcsIFxuICAgICAgICAgIG9iamVjdDpncmFwaC5pZCxcbiAgICAgICAgICBuYW1lOidjb25uZWN0JyxcbiAgICAgICAgICBhcmdzOltdXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvdXQgXG4gICAgfSxcblxuICAgIGRpc2Nvbm5lY3RVZ2VuKCB1Z2VuICkge1xuICAgICAgbGV0IHJlbW92ZUlkeCA9IHRoaXMuc3VtLmlucHV0cy5pbmRleE9mKCB1Z2VuIClcblxuICAgICAgaWYoIHJlbW92ZUlkeCAhPT0gLTEgKSB7XG4gICAgICAgIHRoaXMuc3VtLmlucHV0cy5zcGxpY2UoIHJlbW92ZUlkeCwgMSApXG4gICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdGhpcyApXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIGNhbid0IGluY2x1ZGUgaW5wdXRzIGhlcmUgYXMgaXQgd2lsbCBiZSBzdWNrZWQgdXAgYnkgR2liYmVyLFxuICAgIC8vIGluc3RlYWQgcGFzcyBkdXJpbmcgT2JqZWN0LmFzc2lnbigpIGFmdGVyIGRlZmF1bHRzLlxuICAgIGRlZmF1bHRzOiB7IGdhaW46MSwgcGFuOi41LCBfX3VzZVByb3h5X186dHJ1ZSB9XG4gIH0pXG5cbiAgY29uc3QgY29uc3RydWN0b3IgPSBCdXMuY3JlYXRlLmJpbmQoIEJ1cyApXG4gIGNvbnN0cnVjdG9yLmRlZmF1bHRzID0gQnVzLmRlZmF1bHRzXG5cbiAgcmV0dXJuIGNvbnN0cnVjdG9yXG59XG5cbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApKCksXG4gICAgICBfX3Byb3h5ID0gcmVxdWlyZSggJy4uL3dvcmtsZXRQcm94eS5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIGNvbnN0IEJ1czIgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgY29uc3QgcHJveHkgPSBfX3Byb3h5KCBHaWJiZXJpc2ggKVxuXG4gIGxldCBidWZmZXJMLCBidWZmZXJSXG4gIFxuICBPYmplY3QuYXNzaWduKCBCdXMyLCB7IFxuICAgIGNyZWF0ZSggX19wcm9wcyApIHtcblxuICAgICAgaWYoIGJ1ZmZlckwgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgYnVmZmVyTCA9IEdpYmJlcmlzaC5nZW5pc2guZ2VuLmdsb2JhbHMucGFuTC5tZW1vcnkudmFsdWVzLmlkeFxuICAgICAgICBidWZmZXJSID0gR2liYmVyaXNoLmdlbmlzaC5nZW4uZ2xvYmFscy5wYW5SLm1lbW9yeS52YWx1ZXMuaWR4XG4gICAgICB9XG5cbiAgICAgIC8vIFhYWCBtdXN0IGJlIHNhbWUgdHlwZSBhcyB3aGF0IGlzIHJldHVybmVkIGJ5IGdlbmlzaCBmb3IgdHlwZSBjaGVja3MgdG8gd29yayBjb3JyZWN0bHlcbiAgICAgIGNvbnN0IG91dHB1dCA9IG5ldyBGbG9hdDY0QXJyYXkoIDIgKSBcblxuICAgICAgY29uc3QgYnVzID0gT2JqZWN0LmNyZWF0ZSggQnVzMiApXG5cbiAgICAgIGxldCBpbml0ID0gZmFsc2VcblxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBCdXMyLmRlZmF1bHRzLCBfX3Byb3BzIClcblxuICAgICAgT2JqZWN0LmFzc2lnbiggXG4gICAgICAgIGJ1cyxcblxuICAgICAgICB7XG4gICAgICAgICAgY2FsbGJhY2soKSB7XG4gICAgICAgICAgICBvdXRwdXRbIDAgXSA9IG91dHB1dFsgMSBdID0gMFxuICAgICAgICAgICAgY29uc3QgbGFzdElkeCA9IGFyZ3VtZW50cy5sZW5ndGggLSAxXG4gICAgICAgICAgICBjb25zdCBtZW1vcnkgID0gYXJndW1lbnRzWyBsYXN0SWR4IF1cbiAgICAgICAgICAgIGNvbnN0IHBhbiAgPSBhcmd1bWVudHNbIGxhc3RJZHggLSAxIF1cbiAgICAgICAgICAgIGNvbnN0IGdhaW4gPSBhcmd1bWVudHNbIGxhc3RJZHggLSAyIF1cblxuICAgICAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBsYXN0SWR4IC0gMjsgaSs9IDMgKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gYXJndW1lbnRzWyBpIF0sXG4gICAgICAgICAgICAgICAgICAgIGxldmVsID0gYXJndW1lbnRzWyBpICsgMSBdLFxuICAgICAgICAgICAgICAgICAgICBpc1N0ZXJlbyA9IGFyZ3VtZW50c1sgaSArIDIgXVxuXG4gICAgICAgICAgICAgIG91dHB1dFsgMCBdICs9IGlzU3RlcmVvID09PSB0cnVlID8gaW5wdXRbIDAgXSAqIGxldmVsIDogaW5wdXQgKiBsZXZlbFxuXG4gICAgICAgICAgICAgIG91dHB1dFsgMSBdICs9IGlzU3RlcmVvID09PSB0cnVlID8gaW5wdXRbIDEgXSAqIGxldmVsIDogaW5wdXQgKiBsZXZlbFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwYW5SYXdJbmRleCAgPSBwYW4gKiAxMDIzLFxuICAgICAgICAgICAgICAgICAgcGFuQmFzZUluZGV4ID0gcGFuUmF3SW5kZXggfCAwLFxuICAgICAgICAgICAgICAgICAgcGFuTmV4dEluZGV4ID0gKHBhbkJhc2VJbmRleCArIDEpICYgMTAyMyxcbiAgICAgICAgICAgICAgICAgIGludGVycEFtb3VudCA9IHBhblJhd0luZGV4IC0gcGFuQmFzZUluZGV4LFxuICAgICAgICAgICAgICAgICAgcGFuTCA9IG1lbW9yeVsgYnVmZmVyTCArIHBhbkJhc2VJbmRleCBdIFxuICAgICAgICAgICAgICAgICAgICArICggaW50ZXJwQW1vdW50ICogKCBtZW1vcnlbIGJ1ZmZlckwgKyBwYW5OZXh0SW5kZXggXSAtIG1lbW9yeVsgYnVmZmVyTCArIHBhbkJhc2VJbmRleCBdICkgKSxcbiAgICAgICAgICAgICAgICAgIHBhblIgPSBtZW1vcnlbIGJ1ZmZlclIgKyBwYW5CYXNlSW5kZXggXSBcbiAgICAgICAgICAgICAgICAgICAgKyAoIGludGVycEFtb3VudCAqICggbWVtb3J5WyBidWZmZXJSICsgcGFuTmV4dEluZGV4IF0gLSBtZW1vcnlbIGJ1ZmZlclIgKyBwYW5CYXNlSW5kZXggXSApIClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb3V0cHV0WzBdICo9IGdhaW4gKiBwYW5MXG4gICAgICAgICAgICBvdXRwdXRbMV0gKj0gZ2FpbiAqIHBhblJcblxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaWQgOiBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKSxcbiAgICAgICAgICBkaXJ0eSA6IGZhbHNlLFxuICAgICAgICAgIHR5cGUgOiAnYnVzJyxcbiAgICAgICAgICBpbnB1dHM6WyAxLCAuNSBdLFxuICAgICAgICAgIGlzU3RlcmVvOiB0cnVlLFxuICAgICAgICAgIF9fcHJvcGVydGllc19fOnByb3BzXG4gICAgICAgIH0sXG5cbiAgICAgICAgQnVzMi5kZWZhdWx0cyxcblxuICAgICAgICBwcm9wc1xuICAgICAgKVxuXG4gICAgICBidXMudWdlbk5hbWUgPSBidXMuY2FsbGJhY2sudWdlbk5hbWUgPSAnYnVzMl8nICsgYnVzLmlkXG5cbiAgICAgIGNvbnN0IG91dCA9IGJ1cy5fX3VzZVByb3h5X18gPT09IHRydWUgPyBwcm94eSggWydCdXMyJ10sIHByb3BzLCBidXMgKSA6IGJ1c1xuXG5cbiAgICAgIC8vIHdlIGhhdmUgdG8gaW5jbHVkZSBjdXN0b20gcHJvcGVydGllcyBmb3IgdGhlc2UgYXMgdGhlIGFyZ3VtZW50IGxpc3QgZm9yXG4gICAgICAvLyB0aGUgY29tcGlsZWQgb3V0cHV0IGZ1bmN0aW9uIGlzIHZhcmlhYmxlXG4gICAgICAvLyBzbyBjb2RlZ2VuIGNhbid0IGtub3cgdGhlIGNvcnJlY3QgYXJndW1lbnQgb3JkZXIgZm9yIHRoZSBmdW5jdGlvblxuICAgICAgbGV0IHBhbiA9IC41XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIG91dCwgJ3BhbicsIHtcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gcGFuIH0sXG4gICAgICAgIHNldCh2KXsgXG4gICAgICAgICAgcGFuID0gdlxuICAgICAgICAgIG91dC5pbnB1dHNbIG91dC5pbnB1dHMubGVuZ3RoIC0gMSBdID0gcGFuXG4gICAgICAgICAgR2liYmVyaXNoLmRpcnR5KCBvdXQgKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBsZXQgZ2FpbiA9IDFcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggb3V0LCAnZ2FpbicsIHtcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gcGFuIH0sXG4gICAgICAgIHNldCh2KXsgXG4gICAgICAgICAgZ2FpbiA9IHZcbiAgICAgICAgICBvdXQuaW5wdXRzWyBvdXQuaW5wdXRzLmxlbmd0aCAtIDIgXSA9IGdhaW5cbiAgICAgICAgICBHaWJiZXJpc2guZGlydHkoIG91dCApXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9LFxuICAgIFxuICAgIGRpc2Nvbm5lY3RVZ2VuKCB1Z2VuICkge1xuICAgICAgbGV0IHJlbW92ZUlkeCA9IHRoaXMuaW5wdXRzLmluZGV4T2YoIHVnZW4gKVxuXG4gICAgICBpZiggcmVtb3ZlSWR4ICE9PSAtMSApIHtcbiAgICAgICAgdGhpcy5pbnB1dHMuc3BsaWNlKCByZW1vdmVJZHgsIDMgKVxuICAgICAgICBHaWJiZXJpc2guZGlydHkoIHRoaXMgKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBkZWZhdWx0czogeyBnYWluOjEsIHBhbjouNSwgX191c2VQcm94eV9fOnRydWUgfVxuICB9KVxuXG4gIGNvbnN0IGNvbnN0cnVjdG9yID0gQnVzMi5jcmVhdGUuYmluZCggQnVzMiApXG4gIGNvbnN0cnVjdG9yLmRlZmF1bHRzID0gQnVzMi5kZWZhdWx0c1xuXG4gIHJldHVybiBjb25zdHJ1Y3RvclxuXG59XG4iLCJjb25zdCAgZyAgICA9IHJlcXVpcmUoICdnZW5pc2guanMnICApLFxuICAgICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKSgpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBNb25vcHMgPSB7XG4gICAgZXhwb3J0KCBvYmogKSB7XG4gICAgICBmb3IoIGxldCBrZXkgaW4gTW9ub3BzICkge1xuICAgICAgICBpZigga2V5ICE9PSAnZXhwb3J0JyApIHtcbiAgICAgICAgICBvYmpbIGtleSBdID0gTW9ub3BzWyBrZXkgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBBYnMoIGlucHV0ICkge1xuICAgICAgY29uc3QgYWJzID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBncmFwaCA9IGcuYWJzKCBnLmluKCdpbnB1dCcpIClcbiAgICAgIFxuICAgICAgY29uc3QgX19vdXQgPSBHaWJiZXJpc2guZmFjdG9yeSggYWJzLCBncmFwaCwgWydtb25vcHMnLCdhYnMnXSwgT2JqZWN0LmFzc2lnbih7fSwgTW9ub3BzLmRlZmF1bHRzLCB7IGlucHV0czpbaW5wdXRdLCBpc29wOnRydWUgfSkgKVxuXG4gICAgICByZXR1cm4gX19vdXRcbiAgICB9LFxuXG4gICAgUG93KCBpbnB1dCwgZXhwb25lbnQgKSB7XG4gICAgICBjb25zdCBwb3cgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5wb3coIGcuaW4oJ2lucHV0JyksIGcuaW4oJ2V4cG9uZW50JykgKVxuICAgICAgXG4gICAgICBHaWJiZXJpc2guZmFjdG9yeSggcG93LCBncmFwaCwgWydtb25vcHMnLCdwb3cnXSwgT2JqZWN0LmFzc2lnbih7fSwgTW9ub3BzLmRlZmF1bHRzLCB7IGlucHV0czpbaW5wdXRdLCBleHBvbmVudCwgaXNvcDp0cnVlIH0pIClcblxuICAgICAgcmV0dXJuIHBvd1xuICAgIH0sXG4gICAgQ2xhbXAoIGlucHV0LCBtaW4sIG1heCApIHtcbiAgICAgIGNvbnN0IGNsYW1wID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBncmFwaCA9IGcuY2xhbXAoIGcuaW4oJ2lucHV0JyksIGcuaW4oJ21pbicpLCBnLmluKCdtYXgnKSApXG4gICAgICBcbiAgICAgIGNvbnN0IF9fb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIGNsYW1wLCBncmFwaCwgWydtb25vcHMnLCdjbGFtcCddLCBPYmplY3QuYXNzaWduKHt9LCBNb25vcHMuZGVmYXVsdHMsIHsgaW5wdXRzOltpbnB1dF0sIGlzb3A6dHJ1ZSwgbWluLCBtYXggfSkgKVxuXG4gICAgICByZXR1cm4gX19vdXRcbiAgICB9LFxuXG4gICAgTWVyZ2UoIGlucHV0ICkge1xuICAgICAgY29uc3QgbWVyZ2VyID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBjYiA9IGZ1bmN0aW9uKCBfaW5wdXQgKSB7XG4gICAgICAgIHJldHVybiBfaW5wdXRbMF0gKyBfaW5wdXRbMV1cbiAgICAgIH1cblxuICAgICAgR2liYmVyaXNoLmZhY3RvcnkoIG1lcmdlciwgZy5pbiggJ2lucHV0JyApLCBbJ21vbm9wcycsJ21lcmdlJ10sIHsgaW5wdXRzOltpbnB1dF0sIGlzb3A6dHJ1ZSB9LCBjYiApXG4gICAgICBtZXJnZXIudHlwZSA9ICdhbmFseXNpcydcbiAgICAgIG1lcmdlci5pbnB1dE5hbWVzID0gWyAnaW5wdXQnIF1cbiAgICAgIG1lcmdlci5pbnB1dHMgPSBbIGlucHV0IF1cbiAgICAgIG1lcmdlci5pbnB1dCA9IGlucHV0XG4gICAgICBcbiAgICAgIHJldHVybiBtZXJnZXJcbiAgICB9LFxuICB9XG5cbiAgTW9ub3BzLmRlZmF1bHRzID0geyBpbnB1dDowIH1cblxuICByZXR1cm4gTW9ub3BzXG59XG4iLCJjb25zdCBnID0gcmVxdWlyZSggJ2dlbmlzaC5qcycgKVxuXG5jb25zdCB1Z2VuID0gcmVxdWlyZSggJy4uL3VnZW4uanMnICkoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gXG5sZXQgUGFubmVyID0gaW5wdXRQcm9wcyA9PiB7XG4gIGNvbnN0IHByb3BzICA9IE9iamVjdC5hc3NpZ24oIHt9LCBQYW5uZXIuZGVmYXVsdHMsIGlucHV0UHJvcHMgKSxcbiAgICAgICAgcGFubmVyID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbiAgY29uc3QgaXNTdGVyZW8gPSBwcm9wcy5pbnB1dC5pc1N0ZXJlbyAhPT0gdW5kZWZpbmVkID8gcHJvcHMuaW5wdXQuaXNTdGVyZW8gOiBBcnJheS5pc0FycmF5KCBwcm9wcy5pbnB1dCApIFxuICBcbiAgY29uc3QgaW5wdXQgPSBnLmluKCAnaW5wdXQnICksXG4gICAgICAgIHBhbiAgID0gZy5pbiggJ3BhbicgKVxuXG4gIGxldCBncmFwaCBcbiAgaWYoIGlzU3RlcmVvICkge1xuICAgIGdyYXBoID0gZy5wYW4oIGlucHV0WzBdLCBpbnB1dFsxXSwgcGFuICkgIFxuICB9ZWxzZXtcbiAgICBncmFwaCA9IGcucGFuKCBpbnB1dCwgaW5wdXQsIHBhbiApXG4gIH1cblxuICBHaWJiZXJpc2guZmFjdG9yeSggcGFubmVyLCBbIGdyYXBoLmxlZnQsIGdyYXBoLnJpZ2h0XSwgWydwYW5uZXInXSwgcHJvcHMgKVxuICBcbiAgcmV0dXJuIHBhbm5lclxufVxuXG5QYW5uZXIuZGVmYXVsdHMgPSB7XG4gIGlucHV0OjAsXG4gIHBhbjouNVxufVxuXG5yZXR1cm4gUGFubmVyIFxuXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG5cbiAgY29uc3QgVGltZSA9IHtcbiAgICBicG06IDEyMCxcblxuICAgIGV4cG9ydDogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBPYmplY3QuYXNzaWduKCB0YXJnZXQsIFRpbWUgKVxuICAgIH0sXG5cbiAgICBtcyA6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHZhbCAqIEdpYmJlcmlzaC5jdHguc2FtcGxlUmF0ZSAvIDEwMDA7XG4gICAgfSxcblxuICAgIHNlY29uZHMgOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB2YWwgKiBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGU7XG4gICAgfSxcblxuICAgIGJlYXRzIDogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7IFxuICAgICAgICB2YXIgc2FtcGxlc1BlckJlYXQgPSBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGUgLyAoIEdpYmJlcmlzaC5UaW1lLmJwbSAvIDYwICkgO1xuICAgICAgICByZXR1cm4gc2FtcGxlc1BlckJlYXQgKiB2YWwgO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBUaW1lXG59XG4iLCJjb25zdCBnZW5pc2ggPSByZXF1aXJlKCdnZW5pc2guanMnKSxcbiAgICAgIHNzZCA9IGdlbmlzaC5oaXN0b3J5LFxuICAgICAgbm9pc2UgPSBnZW5pc2gubm9pc2U7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBcInVzZSBqc2RzcFwiO1xuXG4gIGNvbnN0IGxhc3QgPSBzc2QoMCk7XG5cbiAgY29uc3Qgd2hpdGUgPSBnZW5pc2guc3ViKGdlbmlzaC5tdWwobm9pc2UoKSwgMiksIDEpO1xuXG4gIGxldCBvdXQgPSBnZW5pc2guYWRkKGxhc3Qub3V0LCBnZW5pc2guZGl2KGdlbmlzaC5tdWwoLjAyLCB3aGl0ZSksIDEuMDIpKTtcblxuICBsYXN0LmluKG91dCk7XG5cbiAgb3V0ID0gZ2VuaXNoLm11bChvdXQsIDMuNSk7XG5cbiAgcmV0dXJuIG91dDtcbn07IiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApXG5cbmxldCBmZWVkYmFja09zYyA9IGZ1bmN0aW9uKCBmcmVxdWVuY3ksIGZpbHRlciwgcHVsc2V3aWR0aD0uNSwgYXJndW1lbnRQcm9wcyApIHtcbiAgaWYoIGFyZ3VtZW50UHJvcHMgPT09IHVuZGVmaW5lZCApIGFyZ3VtZW50UHJvcHMgPSB7IHR5cGU6IDAgfVxuXG4gIGxldCBsYXN0U2FtcGxlID0gZy5oaXN0b3J5KCksXG4gICAgICAvLyBkZXRlcm1pbmUgcGhhc2UgaW5jcmVtZW50IGFuZCBtZW1vaXplIHJlc3VsdFxuICAgICAgdyA9IGcubWVtbyggZy5kaXYoIGZyZXF1ZW5jeSwgZy5nZW4uc2FtcGxlcmF0ZSApICksXG4gICAgICAvLyBjcmVhdGUgc2NhbGluZyBmYWN0b3JcbiAgICAgIG4gPSBnLnN1YiggLS41LCB3ICksXG4gICAgICBzY2FsaW5nID0gZy5tdWwoIGcubXVsKCAxMywgZmlsdGVyICksIGcucG93KCBuLCA1ICkgKSxcbiAgICAgIC8vIGNhbGN1bGF0ZSBkYyBvZmZzZXQgYW5kIG5vcm1hbGl6YXRpb24gZmFjdG9yc1xuICAgICAgREMgPSBnLnN1YiggLjM3NiwgZy5tdWwoIHcsIC43NTIgKSApLFxuICAgICAgbm9ybSA9IGcuc3ViKCAxLCBnLm11bCggMiwgdyApICksXG4gICAgICAvLyBkZXRlcm1pbmUgcGhhc2VcbiAgICAgIG9zYzFQaGFzZSA9IGcuYWNjdW0oIHcsIDAsIHsgbWluOi0xIH0pLFxuICAgICAgb3NjMSwgb3V0XG5cbiAgLy8gY3JlYXRlIGN1cnJlbnQgc2FtcGxlLi4uIGZyb20gdGhlIHBhcGVyOlxuICAvLyBvc2MgPSAob3NjICsgc2luKDIqcGkqKHBoYXNlICsgb3NjKnNjYWxpbmcpKSkqMC41ZjtcbiAgb3NjMSA9IGcubWVtbyggXG4gICAgZy5tdWwoXG4gICAgICBnLmFkZChcbiAgICAgICAgbGFzdFNhbXBsZS5vdXQsXG4gICAgICAgIGcuc2luKFxuICAgICAgICAgIGcubXVsKFxuICAgICAgICAgICAgTWF0aC5QSSAqIDIsXG4gICAgICAgICAgICBnLm1lbW8oIGcuYWRkKCBvc2MxUGhhc2UsIGcubXVsKCBsYXN0U2FtcGxlLm91dCwgc2NhbGluZyApICkgKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgKSxcbiAgICAgIC41XG4gICAgKVxuICApXG5cbiAgLy8gc3RvcmUgc2FtcGxlIHRvIHVzZSBhcyBtb2R1bGF0aW9uXG4gIGxhc3RTYW1wbGUuaW4oIG9zYzEgKVxuXG4gIC8vIGlmIHB3bSAvIHNxdWFyZSB3YXZlZm9ybSBpbnN0ZWFkIG9mIHNhd3Rvb3RoLi4uXG4gIGlmKCBhcmd1bWVudFByb3BzLnR5cGUgPT09IDEgKSB7IFxuICAgIGNvbnN0IGxhc3RTYW1wbGUyID0gZy5oaXN0b3J5KCkgLy8gZm9yIG9zYyAyXG4gICAgY29uc3QgbGFzdFNhbXBsZU1hc3RlciA9IGcuaGlzdG9yeSgpIC8vIGZvciBzdW0gb2Ygb3NjMSxvc2MyXG5cbiAgICBjb25zdCBvc2MyID0gZy5tdWwoXG4gICAgICBnLmFkZChcbiAgICAgICAgbGFzdFNhbXBsZTIub3V0LFxuICAgICAgICBnLnNpbihcbiAgICAgICAgICBnLm11bChcbiAgICAgICAgICAgIE1hdGguUEkgKiAyLFxuICAgICAgICAgICAgZy5tZW1vKCBnLmFkZCggb3NjMVBoYXNlLCBnLm11bCggbGFzdFNhbXBsZTIub3V0LCBzY2FsaW5nICksIHB1bHNld2lkdGggKSApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApLFxuICAgICAgLjVcbiAgICApXG5cbiAgICBsYXN0U2FtcGxlMi5pbiggb3NjMiApXG4gICAgb3V0ID0gZy5tZW1vKCBnLnN1YiggbGFzdFNhbXBsZS5vdXQsIGxhc3RTYW1wbGUyLm91dCApIClcbiAgICBvdXQgPSBnLm1lbW8oIGcuYWRkKCBnLm11bCggMi41LCBvdXQgKSwgZy5tdWwoIC0xLjUsIGxhc3RTYW1wbGVNYXN0ZXIub3V0ICkgKSApXG4gICAgXG4gICAgbGFzdFNhbXBsZU1hc3Rlci5pbiggZy5zdWIoIG9zYzEsIG9zYzIgKSApXG5cbiAgfWVsc2V7XG4gICAgIC8vIG9mZnNldCBhbmQgbm9ybWFsaXplXG4gICAgb3NjMSA9IGcuYWRkKCBnLm11bCggMi41LCBvc2MxICksIGcubXVsKCAtMS41LCBsYXN0U2FtcGxlLm91dCApIClcbiAgICBvc2MxID0gZy5hZGQoIG9zYzEsIERDIClcbiBcbiAgICBvdXQgPSBvc2MxXG4gIH1cblxuICByZXR1cm4gZy5tdWwoIG91dCwgbm9ybSApXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmVlZGJhY2tPc2NcbiIsImNvbnN0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgICAgdWdlbiA9IHJlcXVpcmUoICcuLi91Z2VuLmpzJyApKCksXG4gICAgICBmZWVkYmFja09zYyA9IHJlcXVpcmUoICcuL2ZtZmVlZGJhY2tvc2MuanMnIClcblxuLy8gIF9fbWFrZU9zY2lsbGF0b3JfXyggdHlwZSwgZnJlcXVlbmN5LCBhbnRpYWxpYXMgKSB7XG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBHaWJiZXJpc2ggKSB7XG4gIGxldCBPc2NpbGxhdG9ycyA9IHtcbiAgICBleHBvcnQoIG9iaiApIHtcbiAgICAgIGZvciggbGV0IGtleSBpbiBPc2NpbGxhdG9ycyApIHtcbiAgICAgICAgaWYoIGtleSAhPT0gJ2V4cG9ydCcgKSB7XG4gICAgICAgICAgb2JqWyBrZXkgXSA9IE9zY2lsbGF0b3JzWyBrZXkgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGdlbmlzaDoge1xuICAgICAgQnJvd246IHJlcXVpcmUoICcuL2Jyb3dubm9pc2UuanMnICksXG4gICAgICBQaW5rOiAgcmVxdWlyZSggJy4vcGlua25vaXNlLmpzJyAgKVxuICAgIH0sXG5cbiAgICBXYXZldGFibGU6IHJlcXVpcmUoICcuL3dhdmV0YWJsZS5qcycgKSggR2liYmVyaXNoICksXG4gICAgXG4gICAgU3F1YXJlKCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3Qgc3FyICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICkgXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oeyBhbnRpYWxpYXM6ZmFsc2UgfSwgT3NjaWxsYXRvcnMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgICAgY29uc3Qgb3NjICAgPSBPc2NpbGxhdG9ycy5mYWN0b3J5KCAnc3F1YXJlJywgZy5pbiggJ2ZyZXF1ZW5jeScgKSwgcHJvcHMuYW50aWFsaWFzIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIG9zYywgZy5pbignZ2FpbicgKSApXG5cbiAgICAgIGNvbnN0IG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBzcXIsIGdyYXBoLCBbJ29zY2lsbGF0b3JzJywnc3F1YXJlJ10sIHByb3BzIClcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH0sXG5cbiAgICBUcmlhbmdsZSggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHRyaT0gT2JqZWN0LmNyZWF0ZSggdWdlbiApIFxuICAgICAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHsgYW50aWFsaWFzOmZhbHNlIH0sIE9zY2lsbGF0b3JzLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICAgIGNvbnN0IG9zYyAgID0gT3NjaWxsYXRvcnMuZmFjdG9yeSggJ3RyaWFuZ2xlJywgZy5pbiggJ2ZyZXF1ZW5jeScgKSwgcHJvcHMuYW50aWFsaWFzIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIG9zYywgZy5pbignZ2FpbicgKSApXG5cbiAgICAgIGNvbnN0IG91dCA9R2liYmVyaXNoLmZhY3RvcnkoIHRyaSwgZ3JhcGgsIFsnb3NjaWxsYXRvcnMnLCd0cmlhbmdsZSddLCBwcm9wcyApXG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9LFxuXG4gICAgUFdNKCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3QgcHdtICAgPSBPYmplY3QuY3JlYXRlKCB1Z2VuICkgXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oeyBhbnRpYWxpYXM6ZmFsc2UsIHB1bHNld2lkdGg6LjI1IH0sIE9zY2lsbGF0b3JzLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICAgIGNvbnN0IG9zYyAgID0gT3NjaWxsYXRvcnMuZmFjdG9yeSggJ3B3bScsIGcuaW4oICdmcmVxdWVuY3knICksIHByb3BzLmFudGlhbGlhcyApXG4gICAgICBjb25zdCBncmFwaCA9IGcubXVsKCBvc2MsIGcuaW4oJ2dhaW4nICkgKVxuXG4gICAgICBjb25zdCBvdXQgPSBHaWJiZXJpc2guZmFjdG9yeSggcHdtLCBncmFwaCwgWydvc2NpbGxhdG9ycycsJ1BXTSddLCBwcm9wcyApXG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9LFxuXG4gICAgU2luZSggaW5wdXRQcm9wcyApIHtcbiAgICAgIGNvbnN0IHNpbmUgID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG4gICAgICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIE9zY2lsbGF0b3JzLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcbiAgICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIGcuY3ljbGUoIGcuaW4oJ2ZyZXF1ZW5jeScpICksIGcuaW4oJ2dhaW4nKSApXG5cbiAgICAgIGNvbnN0IG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBzaW5lLCBncmFwaCwgWydvc2NpbGxhdG9ycycsJ3NpbmUnXSwgcHJvcHMgKVxuICAgICAgXG4gICAgICByZXR1cm4gb3V0XG4gICAgfSxcblxuICAgIE5vaXNlKCBpbnB1dFByb3BzICkge1xuICAgICAgY29uc3Qgbm9pc2UgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIHsgZ2FpbjogMSwgY29sb3I6J3doaXRlJyB9LCBpbnB1dFByb3BzIClcbiAgICAgIGxldCBncmFwaCBcblxuICAgICAgc3dpdGNoKCBwcm9wcy5jb2xvciApIHtcbiAgICAgICAgY2FzZSAnYnJvd24nOlxuICAgICAgICAgIGdyYXBoID0gZy5tdWwoIE9zY2lsbGF0b3JzLmdlbmlzaC5Ccm93bigpLCBnLmluKCdnYWluJykgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdwaW5rJzpcbiAgICAgICAgICBncmFwaCA9IGcubXVsKCBPc2NpbGxhdG9ycy5nZW5pc2guUGluaygpLCBnLmluKCdnYWluJykgKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGdyYXBoID0gZy5tdWwoIGcubm9pc2UoKSwgZy5pbignZ2FpbicpIClcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgY29uc3Qgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIG5vaXNlLCBncmFwaCwgWydvc2NpbGxhdG9ycycsJ25vaXNlJ10sIHByb3BzIClcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH0sXG5cbiAgICBTYXcoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBzYXcgICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSBcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7IGFudGlhbGlhczpmYWxzZSB9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgICBjb25zdCBvc2MgICA9IE9zY2lsbGF0b3JzLmZhY3RvcnkoICdzYXcnLCBnLmluKCAnZnJlcXVlbmN5JyApLCBwcm9wcy5hbnRpYWxpYXMgKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLm11bCggb3NjLCBnLmluKCdnYWluJyApIClcblxuICAgICAgY29uc3Qgb3V0ID0gR2liYmVyaXNoLmZhY3RvcnkoIHNhdywgZ3JhcGgsIFsnb3NjaWxsYXRvcnMnLCdzYXcnXSwgcHJvcHMgKVxuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfSxcblxuICAgIFJldmVyc2VTYXcoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBzYXcgICA9IE9iamVjdC5jcmVhdGUoIHVnZW4gKSBcbiAgICAgIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7IGFudGlhbGlhczpmYWxzZSB9LCBPc2NpbGxhdG9ycy5kZWZhdWx0cywgaW5wdXRQcm9wcyApXG4gICAgICBjb25zdCBvc2MgICA9IGcuc3ViKCAxLCBPc2NpbGxhdG9ycy5mYWN0b3J5KCAnc2F3JywgZy5pbiggJ2ZyZXF1ZW5jeScgKSwgcHJvcHMuYW50aWFsaWFzICkgKVxuICAgICAgY29uc3QgZ3JhcGggPSBnLm11bCggb3NjLCBnLmluKCAnZ2FpbicgKSApXG5cbiAgICAgIGNvbnN0IG91dCA9IEdpYmJlcmlzaC5mYWN0b3J5KCBzYXcsIGdyYXBoLCBbJ29zY2lsbGF0b3JzJywnUmV2ZXJzZVNhdyddLCBwcm9wcyApXG4gICAgICBcbiAgICAgIHJldHVybiBvdXRcbiAgICB9LFxuXG4gICAgZmFjdG9yeSggdHlwZSwgZnJlcXVlbmN5LCBhbnRpYWxpYXM9ZmFsc2UgKSB7XG4gICAgICBsZXQgb3NjXG5cbiAgICAgIHN3aXRjaCggdHlwZSApIHtcbiAgICAgICAgY2FzZSAncHdtJzpcbiAgICAgICAgICBsZXQgcHVsc2V3aWR0aCA9IGcuaW4oJ3B1bHNld2lkdGgnKVxuICAgICAgICAgIGlmKCBhbnRpYWxpYXMgPT09IHRydWUgKSB7XG4gICAgICAgICAgICBvc2MgPSBmZWVkYmFja09zYyggZnJlcXVlbmN5LCAxLCBwdWxzZXdpZHRoLCB7IHR5cGU6MSB9KVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgbGV0IHBoYXNlID0gZy5waGFzb3IoIGZyZXF1ZW5jeSwgMCwgeyBtaW46MCB9IClcbiAgICAgICAgICAgIG9zYyA9IGcubHQoIHBoYXNlLCBwdWxzZXdpZHRoIClcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3Nhdyc6XG4gICAgICAgICAgaWYoIGFudGlhbGlhcyA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICBvc2MgPSBnLnBoYXNvciggZnJlcXVlbmN5IClcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIG9zYyA9IGZlZWRiYWNrT3NjKCBmcmVxdWVuY3ksIDEgKVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2luZSc6XG4gICAgICAgICAgb3NjID0gZy5jeWNsZSggZnJlcXVlbmN5IClcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgICBpZiggYW50aWFsaWFzID09PSB0cnVlICkge1xuICAgICAgICAgICAgb3NjID0gZmVlZGJhY2tPc2MoIGZyZXF1ZW5jeSwgMSwgLjUsIHsgdHlwZToxIH0pXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBvc2MgPSBnLndhdmV0YWJsZSggZnJlcXVlbmN5LCB7IGJ1ZmZlcjpPc2NpbGxhdG9ycy5TcXVhcmUuYnVmZmVyLCBuYW1lOidzcXVhcmUnIH0gKVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndHJpYW5nbGUnOlxuICAgICAgICAgIG9zYyA9IGcud2F2ZXRhYmxlKCBmcmVxdWVuY3ksIHsgYnVmZmVyOk9zY2lsbGF0b3JzLlRyaWFuZ2xlLmJ1ZmZlciwgbmFtZTondHJpYW5nbGUnIH0gKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3NjXG4gICAgfVxuICB9XG5cbiAgT3NjaWxsYXRvcnMuU3F1YXJlLmJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gIGZvciggbGV0IGkgPSAxMDIzOyBpID49IDA7IGktLSApIHsgXG4gICAgT3NjaWxsYXRvcnMuU3F1YXJlLmJ1ZmZlciBbIGkgXSA9IGkgLyAxMDI0ID4gLjUgPyAxIDogLTFcbiAgfVxuXG4gIE9zY2lsbGF0b3JzLlRyaWFuZ2xlLmJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gIFxuICBmb3IoIGxldCBpID0gMTAyNDsgaS0tOyBpID0gaSApIHsgT3NjaWxsYXRvcnMuVHJpYW5nbGUuYnVmZmVyW2ldID0gMSAtIDQgKiBNYXRoLmFicygoIChpIC8gMTAyNCkgKyAwLjI1KSAlIDEgLSAwLjUpOyB9XG5cbiAgT3NjaWxsYXRvcnMuZGVmYXVsdHMgPSB7XG4gICAgZnJlcXVlbmN5OiA0NDAsXG4gICAgZ2FpbjogMVxuICB9XG5cbiAgcmV0dXJuIE9zY2lsbGF0b3JzXG5cbn1cbiIsImNvbnN0IGdlbmlzaCA9IHJlcXVpcmUoJ2dlbmlzaC5qcycpLFxuICAgICAgc3NkID0gZ2VuaXNoLmhpc3RvcnksXG4gICAgICBkYXRhID0gZ2VuaXNoLmRhdGEsXG4gICAgICBub2lzZSA9IGdlbmlzaC5ub2lzZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIFwidXNlIGpzZHNwXCI7XG5cbiAgY29uc3QgYiA9IGRhdGEoOCwgMSwgeyBtZXRhOiB0cnVlIH0pO1xuICBjb25zdCB3aGl0ZSA9IGdlbmlzaC5zdWIoZ2VuaXNoLm11bChub2lzZSgpLCAyKSwgMSk7XG5cbiAgYlswXSA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bCguOTk4ODYsIGJbMF0pLCBnZW5pc2gubXVsKHdoaXRlLCAuMDU1NTE3OSkpO1xuICBiWzFdID0gZ2VuaXNoLmFkZChnZW5pc2gubXVsKC45OTMzMiwgYlsxXSksIGdlbmlzaC5tdWwod2hpdGUsIC4wNzUwNTc5KSk7XG4gIGJbMl0gPSBnZW5pc2guYWRkKGdlbmlzaC5tdWwoLjk2OTAwLCBiWzJdKSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjE1Mzg1MjApKTtcbiAgYlszXSA9IGdlbmlzaC5hZGQoZ2VuaXNoLm11bCguODg2NTAsIGJbM10pLCBnZW5pc2gubXVsKHdoaXRlLCAuMzEwNDg1NikpO1xuICBiWzRdID0gZ2VuaXNoLmFkZChnZW5pc2gubXVsKC41NTAwMCwgYls0XSksIGdlbmlzaC5tdWwod2hpdGUsIC41MzI5NTIyKSk7XG4gIGJbNV0gPSBnZW5pc2guc3ViKGdlbmlzaC5tdWwoLS43NjE2LCBiWzVdKSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjAxNjg5ODApKTtcblxuICBjb25zdCBvdXQgPSBnZW5pc2gubXVsKGdlbmlzaC5hZGQoZ2VuaXNoLmFkZChnZW5pc2guYWRkKGdlbmlzaC5hZGQoZ2VuaXNoLmFkZChnZW5pc2guYWRkKGdlbmlzaC5hZGQoYlswXSwgYlsxXSksIGJbMl0pLCBiWzNdKSwgYls0XSksIGJbNV0pLCBiWzZdKSwgZ2VuaXNoLm11bCh3aGl0ZSwgLjUzNjIpKSwgLjExKTtcblxuICBiWzZdID0gZ2VuaXNoLm11bCh3aGl0ZSwgLjExNTkyNik7XG5cbiAgcmV0dXJuIG91dDtcbn07IiwibGV0IGcgPSByZXF1aXJlKCAnZ2VuaXNoLmpzJyApLFxuICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKSgpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuICBjb25zdCBXYXZldGFibGUgPSBmdW5jdGlvbiggaW5wdXRQcm9wcyApIHtcbiAgICBjb25zdCB3YXZldGFibGUgPSBPYmplY3QuY3JlYXRlKCB1Z2VuIClcbiAgICBjb25zdCBwcm9wcyAgPSBPYmplY3QuYXNzaWduKHt9LCBHaWJiZXJpc2gub3NjaWxsYXRvcnMuZGVmYXVsdHMsIGlucHV0UHJvcHMgKVxuICAgIGNvbnN0IG9zYyA9IGcud2F2ZXRhYmxlKCBnLmluKCdmcmVxdWVuY3knKSwgcHJvcHMgKVxuICAgIGNvbnN0IGdyYXBoID0gZy5tdWwoIFxuICAgICAgb3NjLCBcbiAgICAgIGcuaW4oICdnYWluJyApXG4gICAgKVxuXG4gICAgR2liYmVyaXNoLmZhY3RvcnkoIHdhdmV0YWJsZSwgZ3JhcGgsICd3YXZldGFibGUnLCBwcm9wcyApXG5cbiAgICByZXR1cm4gd2F2ZXRhYmxlXG4gIH1cblxuICBnLndhdmV0YWJsZSA9IGZ1bmN0aW9uKCBmcmVxdWVuY3ksIHByb3BzICkge1xuICAgIGxldCBkYXRhUHJvcHMgPSB7IGltbXV0YWJsZTp0cnVlIH1cblxuICAgIC8vIHVzZSBnbG9iYWwgcmVmZXJlbmNlcyBpZiBhcHBsaWNhYmxlXG4gICAgaWYoIHByb3BzLm5hbWUgIT09IHVuZGVmaW5lZCApIGRhdGFQcm9wcy5nbG9iYWwgPSBwcm9wcy5uYW1lXG5cbiAgICBjb25zdCBidWZmZXIgPSBnLmRhdGEoIHByb3BzLmJ1ZmZlciwgMSwgZGF0YVByb3BzIClcblxuICAgIHJldHVybiBnLnBlZWsoIGJ1ZmZlciwgZy5waGFzb3IoIGZyZXF1ZW5jeSwgMCwgeyBtaW46MCB9ICkgKVxuICB9XG5cbiAgcmV0dXJuIFdhdmV0YWJsZVxufVxuIiwiY29uc3QgUXVldWUgPSByZXF1aXJlKCAnLi4vZXh0ZXJuYWwvcHJpb3JpdHlxdWV1ZS5qcycgKVxuY29uc3QgQmlnICAgPSByZXF1aXJlKCAnYmlnLmpzJyApXG5cbmxldCBTY2hlZHVsZXIgPSB7XG4gIHBoYXNlOiAwLFxuXG4gIHF1ZXVlOiBuZXcgUXVldWUoICggYSwgYiApID0+IHtcbiAgICBpZiggYS50aW1lID09PSBiLnRpbWUgKSB7IC8vYS50aW1lLmVxKCBiLnRpbWUgKSApIHtcbiAgICAgIHJldHVybiBhLnByaW9yaXR5IDwgYi5wcmlvcml0eSA/IC0xIDogYS5wcmlvcml0eSA+IGIucHJpb3JpdHkgPyAxIDogMDtcbi8vYi5wcmlvcml0eSAtIGEucHJpb3JpdHkgXG5cbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBhLnRpbWUgLSBiLnRpbWUgLy9hLnRpbWUubWludXMoIGIudGltZSApXG4gICAgfVxuICB9KSxcblxuICBjbGVhcigpIHtcbiAgICB0aGlzLnF1ZXVlLmRhdGEubGVuZ3RoID0gMFxuICAgIHRoaXMucXVldWUubGVuZ3RoID0gMFxuICB9LFxuXG4gIGFkZCggdGltZSwgZnVuYywgcHJpb3JpdHkgPSAwICkge1xuICAgIHRpbWUgKz0gdGhpcy5waGFzZVxuXG4gICAgdGhpcy5xdWV1ZS5wdXNoKHsgdGltZSwgZnVuYywgcHJpb3JpdHkgfSlcbiAgfSxcblxuICB0aWNrKCkge1xuICAgIGlmKCB0aGlzLnF1ZXVlLmxlbmd0aCApIHtcbiAgICAgIGxldCBuZXh0ID0gdGhpcy5xdWV1ZS5wZWVrKClcblxuICAgICAgaWYoIGlzTmFOKCBuZXh0LnRpbWUgKSApIHtcbiAgICAgICAgdGhpcy5xdWV1ZS5wb3AoKVxuICAgICAgfVxuICAgICAgXG4gICAgICB3aGlsZSggdGhpcy5waGFzZSA+PSBuZXh0LnRpbWUgKSB7XG4gICAgICAgIG5leHQuZnVuYyggbmV4dC5wcmlvcml0eSApXG4gICAgICAgIHRoaXMucXVldWUucG9wKClcbiAgICAgICAgbmV4dCA9IHRoaXMucXVldWUucGVlaygpXG5cbiAgICAgICAgLy8gWFhYIHRoaXMgaGFwcGVucyB3aGVuIGNhbGxpbmcgc2VxdWVuY2VyLnN0b3AoKS4uLiB3aHk/XG4gICAgICAgIGlmKCBuZXh0ID09PSB1bmRlZmluZWQgKSBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucGhhc2UrK1xuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjaGVkdWxlclxuIiwiY29uc3QgZyA9IHJlcXVpcmUoICdnZW5pc2guanMnICksXG4gICAgICBfX3Byb3h5ID0gcmVxdWlyZSggJy4uL3dvcmtsZXRQcm94eS5qcycgKSxcbiAgICAgIHVnZW4gPSByZXF1aXJlKCAnLi4vdWdlbi5qcycgKSgpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgY29uc3QgX19wcm90b19fID0gT2JqZWN0LmNyZWF0ZSggdWdlbiApXG5cbiAgY29uc3QgcHJveHkgPSBfX3Byb3h5KCBHaWJiZXJpc2ggKVxuXG4gIE9iamVjdC5hc3NpZ24oIF9fcHJvdG9fXywge1xuICAgIHN0YXJ0KCkge1xuICAgICAgR2liYmVyaXNoLmFuYWx5emVycy5wdXNoKCB0aGlzIClcbiAgICAgIEdpYmJlcmlzaC5kaXJ0eSggR2liYmVyaXNoLmFuYWx5emVycyApXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG4gICAgc3RvcCgpIHtcbiAgICAgIHRoaXMuZGlzY29ubmVjdCgpXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgfSlcblxuICBjb25zdCBTZXEyID0geyBcbiAgICBjcmVhdGUoIGlucHV0UHJvcHMgKSB7XG4gICAgICBjb25zdCBzZXEgPSBPYmplY3QuY3JlYXRlKCBfX3Byb3RvX18gKSxcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCBTZXEyLmRlZmF1bHRzLCBpbnB1dFByb3BzIClcblxuICAgICAgc2VxLnBoYXNlID0gMFxuICAgICAgc2VxLmlucHV0TmFtZXMgPSBbICdyYXRlJyBdXG4gICAgICBzZXEuaW5wdXRzID0gWyAxIF1cbiAgICAgIHNlcS5uZXh0VGltZSA9IDBcbiAgICAgIHNlcS5fX3ZhbHVlc1BoYXNlID0gMFxuICAgICAgc2VxLl9fdGltaW5nc1BoYXNlID0gMFxuICAgICAgc2VxLmlkID0gR2liYmVyaXNoLmZhY3RvcnkuZ2V0VUlEKClcbiAgICAgIHNlcS5kaXJ0eSA9IHRydWVcbiAgICAgIHNlcS50eXBlID0gJ3NlcSdcbiAgICAgIHNlcS5fX2FkZHJlc3Nlc19fID0ge31cblxuICAgICAgaWYoIHByb3BlcnRpZXMudGFyZ2V0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHNlcS5hbm9uRnVuY3Rpb24gPSB0cnVlXG4gICAgICB9ZWxzZXsgXG4gICAgICAgIHNlcS5hbm9uRnVuY3Rpb24gPSBmYWxzZVxuICAgICAgICBzZXEuY2FsbEZ1bmN0aW9uID0gdHlwZW9mIHByb3BlcnRpZXMudGFyZ2V0WyBwcm9wZXJ0aWVzLmtleSBdID09PSAnZnVuY3Rpb24nXG4gICAgICB9XG5cbiAgICAgIHByb3BlcnRpZXMuaWQgPSBHaWJiZXJpc2guZmFjdG9yeS5nZXRVSUQoKVxuXG4gICAgICAvLyBuZWVkIGEgc2VwYXJhdGUgcmVmZXJlbmNlIHRvIHRoZSBwcm9wZXJ0aWVzIGZvciB3b3JrbGV0IG1ldGEtcHJvZ3JhbW1pbmdcbiAgICAgIE9iamVjdC5hc3NpZ24oIHNlcSwgcHJvcGVydGllcyApIFxuICAgICAgc2VxLl9fcHJvcGVydGllc19fID0gcHJvcGVydGllc1xuXG4gICAgICBzZXEuY2FsbGJhY2sgPSBmdW5jdGlvbiggcmF0ZSApIHtcbiAgICAgICAgaWYoIHNlcS5waGFzZSA+PSBzZXEubmV4dFRpbWUgKSB7XG4gICAgICAgICAgLy9sZXQgdmFsdWUgPSBzZXEudmFsdWVzWyBzZXEudmFsdWVzUGhhc2UrKyAlIHNlcS52YWx1ZXMubGVuZ3RoIF1cblxuICAgICAgICAgIC8vaWYoIHNlcS5hbm9uRnVuY3Rpb24gfHwgdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgICAgIC8vICB2YWx1ZSA9IHZhbHVlKClcbiAgICAgICAgICAvL30gZWxzZSB7IFxuICAgICAgICAgIC8vICBpZiggc2VxLmFub25GdW5jdGlvbiA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgLy8gICAgaWYoIHNlcS5jYWxsRnVuY3Rpb24gPT09IGZhbHNlICkge1xuICAgICAgICAgIC8vICAgICAgc2VxLnRhcmdldFsgc2VxLmtleSBdID0gdmFsdWVcbiAgICAgICAgICAvLyAgICB9ZWxzZXtcbiAgICAgICAgICAvLyAgICAgIHNlcS50YXJnZXRbIHNlcS5rZXkgXSggdmFsdWUgKSBcbiAgICAgICAgICAvLyAgICB9XG4gICAgICAgICAgLy8gIH1cbiAgICAgICAgICAvL31cblxuICAgICAgICAgIC8vc2VxLnBoYXNlIC09IHNlcS5uZXh0VGltZVxuXG4gICAgICAgICAgLy9sZXQgdGltaW5nID0gc2VxLnRpbWluZ3NbIHNlcS50aW1pbmdzUGhhc2UrKyAlIHNlcS50aW1pbmdzLmxlbmd0aCBdXG4gICAgICAgICAgLy9pZiggdHlwZW9mIHRpbWluZyA9PT0gJ2Z1bmN0aW9uJyApIHRpbWluZyA9IHRpbWluZygpXG5cbiAgICAgICAgICAvL3NlcS5uZXh0VGltZSA9IHRpbWluZ1xuICAgICAgICAgIGxldCB2YWx1ZSAgPSB0eXBlb2Ygc2VxLnZhbHVlcyAgPT09ICdmdW5jdGlvbicgPyBzZXEudmFsdWVzICA6IHNlcS52YWx1ZXNbICBzZXEuX192YWx1ZXNQaGFzZSsrICAlIHNlcS52YWx1ZXMubGVuZ3RoICBdLFxuICAgICAgICAgIHRpbWluZyA9IHR5cGVvZiBzZXEudGltaW5ncyA9PT0gJ2Z1bmN0aW9uJyA/IHNlcS50aW1pbmdzIDogc2VxLnRpbWluZ3NbIHNlcS5fX3RpbWluZ3NQaGFzZSsrICUgc2VxLnRpbWluZ3MubGVuZ3RoIF0sXG4gICAgICAgICAgc2hvdWxkUnVuID0gdHJ1ZVxuXG4gICAgICAgICAgaWYoIHR5cGVvZiB0aW1pbmcgPT09ICdmdW5jdGlvbicgKSB0aW1pbmcgPSB0aW1pbmcoKVxuXG4gICAgICAgICAgLy8gWFhYIHRoaXMgc3VwcG9ydHMgYW4gZWRnZSBjYXNlIGluIEdpYmJlciwgd2hlcmUgcGF0dGVybnMgbGlrZSBFdWNsaWQgLyBIZXggcmV0dXJuXG4gICAgICAgICAgLy8gb2JqZWN0cyBpbmRpY2F0aW5nIGJvdGggd2hldGhlciBvciBub3QgdGhleSBzaG91bGQgc2hvdWxkIHRyaWdnZXIgdmFsdWVzIGFzIHdlbGxcbiAgICAgICAgICAvLyBhcyB0aGUgbmV4dCB0aW1lIHRoZXkgc2hvdWxkIHJ1bi4gcGVyaGFwcyB0aGlzIGNvdWxkIGJlIG1hZGUgbW9yZSBnZW5lcmFsaXphYmxlP1xuICAgICAgICAgIGlmKCB0eXBlb2YgdGltaW5nID09PSAnb2JqZWN0JyApIHtcbiAgICAgICAgICAgIGlmKCB0aW1pbmcuc2hvdWxkRXhlY3V0ZSA9PT0gMSApIHtcbiAgICAgICAgICAgICAgc2hvdWxkUnVuID0gdHJ1ZVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIHNob3VsZFJ1biA9IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aW1pbmcgPSB0aW1pbmcudGltZSBcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiggc2hvdWxkUnVuICkge1xuICAgICAgICAgICAgaWYoIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBzZXEudGFyZ2V0ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgIHZhbHVlKClcbiAgICAgICAgICAgIH1lbHNlIGlmKCB0eXBlb2Ygc2VxLnRhcmdldFsgc2VxLmtleSBdID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgICAgICAgICBpZiggdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUoKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlcS50YXJnZXRbIHNlcS5rZXkgXSggdmFsdWUgKVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIGlmKCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgKSB2YWx1ZSA9IHZhbHVlKClcbiAgICAgICAgICAgICAgc2VxLnRhcmdldFsgc2VxLmtleSBdID0gdmFsdWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZXEucGhhc2UgLT0gc2VxLm5leHRUaW1lXG4gICAgICAgICAgc2VxLm5leHRUaW1lID0gdGltaW5nXG4gICAgICAgICAgXG4gICAgICAgICAgLy9pZiggR2liYmVyaXNoLm1vZGUgPT09ICdwcm9jZXNzb3InICkge1xuICAgICAgICAgIC8vICBpZiggc2VxLl9faXNSdW5uaW5nID09PSB0cnVlICYmICFpc05hTiggdGltaW5nICkgKSB7XG4gICAgICAgICAgLy8gICAgR2liYmVyaXNoLnNjaGVkdWxlci5hZGQoIHRpbWluZywgc2VxLnRpY2ssIHNlcS5wcmlvcml0eSApXG4gICAgICAgICAgLy8gIH1cbiAgICAgICAgICAvL31cbiAgICAgICAgfVxuXG4gICAgICAgIHNlcS5waGFzZSArPSByYXRlXG5cbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cblxuICAgICAgc2VxLnVnZW5OYW1lID0gc2VxLmNhbGxiYWNrLnVnZW5OYW1lID0gJ3NlcV8nICsgc2VxLmlkXG4gICAgICBcbiAgICAgIGNvbnN0IGlkeCA9IEdpYmJlcmlzaC5tZW1vcnkuYWxsb2MoIDEgKVxuICAgICAgR2liYmVyaXNoLm1lbW9yeS5oZWFwWyBpZHggXSA9IHNlcS5yYXRlXG4gICAgICBzZXEuX19hZGRyZXNzZXNfXy5yYXRlID0gaWR4XG5cbiAgICAgIGxldCB2YWx1ZSA9IHNlcS5yYXRlXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHNlcSwgJ3JhdGUnLCB7XG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHZhbHVlIH0sXG4gICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICBpZiggdmFsdWUgIT09IHYgKSB7XG4gICAgICAgICAgICBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIGlkeCBdID0gdlxuICAgICAgICAgICAgR2liYmVyaXNoLmRpcnR5KCBHaWJiZXJpc2guYW5hbHl6ZXJzIClcbiAgICAgICAgICAgIHZhbHVlID0gdlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHByb3h5KCBbJ1NlcXVlbmNlcjInXSwgcHJvcGVydGllcywgc2VxICkgXG4gICAgfVxuICB9XG5cbiAgU2VxMi5kZWZhdWx0cyA9IHsgcmF0ZTogMSB9XG5cbiAgcmV0dXJuIFNlcTIuY3JlYXRlXG5cbn1cblxuIiwiY29uc3QgX19wcm94eSA9IHJlcXVpcmUoICcuLi93b3JrbGV0UHJveHkuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG5jb25zdCBwcm94eSA9IF9fcHJveHkoIEdpYmJlcmlzaCApXG5cbmNvbnN0IFNlcXVlbmNlciA9IHByb3BzID0+IHtcbiAgbGV0IF9fc2VxXG4gIGNvbnN0IHNlcSA9IHtcbiAgICBfX2lzUnVubmluZzpmYWxzZSxcblxuICAgIF9fdmFsdWVzUGhhc2U6ICAwLFxuICAgIF9fdGltaW5nc1BoYXNlOiAwLFxuICAgIF9fdHlwZTonc2VxJyxcblxuICAgIHRpY2soIHByaW9yaXR5ICkge1xuICAgICAgbGV0IHZhbHVlICA9IHR5cGVvZiBzZXEudmFsdWVzICA9PT0gJ2Z1bmN0aW9uJyA/IHNlcS52YWx1ZXMgIDogc2VxLnZhbHVlc1sgIHNlcS5fX3ZhbHVlc1BoYXNlKysgICUgc2VxLnZhbHVlcy5sZW5ndGggIF0sXG4gICAgICAgICAgdGltaW5nID0gdHlwZW9mIHNlcS50aW1pbmdzID09PSAnZnVuY3Rpb24nID8gc2VxLnRpbWluZ3MgOiBzZXEudGltaW5nc1sgc2VxLl9fdGltaW5nc1BoYXNlKysgJSBzZXEudGltaW5ncy5sZW5ndGggXSxcbiAgICAgICAgICBzaG91bGRSdW4gPSB0cnVlXG5cbiAgICAgIGlmKCB0eXBlb2YgdGltaW5nID09PSAnZnVuY3Rpb24nICkgdGltaW5nID0gdGltaW5nKClcblxuICAgICAgLy8gWFhYIHRoaXMgc3VwcG9ydHMgYW4gZWRnZSBjYXNlIGluIEdpYmJlciwgd2hlcmUgcGF0dGVybnMgbGlrZSBFdWNsaWQgLyBIZXggcmV0dXJuXG4gICAgICAvLyBvYmplY3RzIGluZGljYXRpbmcgYm90aCB3aGV0aGVyIG9yIG5vdCB0aGV5IHNob3VsZCBzaG91bGQgdHJpZ2dlciB2YWx1ZXMgYXMgd2VsbFxuICAgICAgLy8gYXMgdGhlIG5leHQgdGltZSB0aGV5IHNob3VsZCBydW4uIHBlcmhhcHMgdGhpcyBjb3VsZCBiZSBtYWRlIG1vcmUgZ2VuZXJhbGl6YWJsZT9cbiAgICAgIGlmKCB0eXBlb2YgdGltaW5nID09PSAnb2JqZWN0JyApIHtcbiAgICAgICAgaWYoIHRpbWluZy5zaG91bGRFeGVjdXRlID09PSAxICkge1xuICAgICAgICAgIHNob3VsZFJ1biA9IHRydWVcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc2hvdWxkUnVuID0gZmFsc2VcbiAgICAgICAgfVxuICAgICAgICB0aW1pbmcgPSB0aW1pbmcudGltZSBcbiAgICAgIH1cblxuICAgICAgdGltaW5nICo9IHNlcS5yYXRlXG5cbiAgICAgIGlmKCBzaG91bGRSdW4gKSB7XG4gICAgICAgIGlmKCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgJiYgc2VxLnRhcmdldCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIHZhbHVlKClcbiAgICAgICAgfWVsc2UgaWYoIHR5cGVvZiBzZXEudGFyZ2V0WyBzZXEua2V5IF0gPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgaWYoIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyApIHZhbHVlID0gdmFsdWUoKVxuICAgICAgICAgIHNlcS50YXJnZXRbIHNlcS5rZXkgXSggdmFsdWUgKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBpZiggdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nICkgdmFsdWUgPSB2YWx1ZSgpXG4gICAgICAgICAgc2VxLnRhcmdldFsgc2VxLmtleSBdID0gdmFsdWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiggR2liYmVyaXNoLm1vZGUgPT09ICdwcm9jZXNzb3InICkge1xuICAgICAgICBpZiggc2VxLl9faXNSdW5uaW5nID09PSB0cnVlICYmICFpc05hTiggdGltaW5nICkgKSB7XG4gICAgICAgICAgR2liYmVyaXNoLnNjaGVkdWxlci5hZGQoIHRpbWluZywgc2VxLnRpY2ssIHNlcS5wcmlvcml0eSApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RhcnQoIGRlbGF5ID0gMCApIHtcbiAgICAgIHNlcS5fX2lzUnVubmluZyA9IHRydWVcbiAgICAgIEdpYmJlcmlzaC5zY2hlZHVsZXIuYWRkKCBkZWxheSwgc2VxLnRpY2ssIHNlcS5wcmlvcml0eSApXG4gICAgICByZXR1cm4gX19zZXFcbiAgICB9LFxuXG4gICAgc3RvcCgpIHtcbiAgICAgIHNlcS5fX2lzUnVubmluZyA9IGZhbHNlXG4gICAgICByZXR1cm4gX19zZXFcbiAgICB9XG4gIH1cblxuICBwcm9wcy5pZCA9IEdpYmJlcmlzaC5mYWN0b3J5LmdldFVJRCgpXG5cbiAgLy8gbmVlZCBhIHNlcGFyYXRlIHJlZmVyZW5jZSB0byB0aGUgcHJvcGVydGllcyBmb3Igd29ya2xldCBtZXRhLXByb2dyYW1taW5nXG4gIGNvbnN0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgU2VxdWVuY2VyLmRlZmF1bHRzLCBwcm9wcyApXG4gIE9iamVjdC5hc3NpZ24oIHNlcSwgcHJvcGVydGllcyApIFxuICBzZXEuX19wcm9wZXJ0aWVzX18gPSBwcm9wZXJ0aWVzXG5cbiAgX19zZXEgPSAgcHJveHkoIFsnU2VxdWVuY2VyJ10sIHByb3BlcnRpZXMsIHNlcSApXG5cbiAgcmV0dXJuIF9fc2VxXG59XG5cblNlcXVlbmNlci5kZWZhdWx0cyA9IHsgcHJpb3JpdHk6MTAwMDAwLCB2YWx1ZXM6W10sIHRpbWluZ3M6W10sIHJhdGU6MSB9XG5cblNlcXVlbmNlci5tYWtlID0gZnVuY3Rpb24oIHZhbHVlcywgdGltaW5ncywgdGFyZ2V0LCBrZXksIHByaW9yaXR5ICkge1xuICByZXR1cm4gU2VxdWVuY2VyKHsgdmFsdWVzLCB0aW1pbmdzLCB0YXJnZXQsIGtleSwgcHJpb3JpdHkgfSlcbn1cblxucmV0dXJuIFNlcXVlbmNlclxuXG59XG4iLCJsZXQgR2liYmVyaXNoID0gbnVsbFxuXG5jb25zdCBfX3VnZW4gPSBmdW5jdGlvbiggX19HaWJiZXJpc2ggKSB7XG4gIGlmKCBfX0dpYmJlcmlzaCAhPT0gdW5kZWZpbmVkICYmIEdpYmJlcmlzaCA9PSBudWxsICkgR2liYmVyaXNoID0gX19HaWJiZXJpc2hcbiBcbiAgY29uc3QgcmVwbGFjZSA9IG9iaiA9PiB7XG4gICAgaWYoIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICkge1xuICAgICAgaWYoIG9iai5pZCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICByZXR1cm4gcHJvY2Vzc29yLnVnZW5zLmdldCggb2JqLmlkIClcbiAgICAgIH0gXG4gICAgfVxuXG4gICAgcmV0dXJuIG9ialxuICB9XG5cbiAgY29uc3QgdWdlbiA9IHtcbiAgICBfX0dpYmJlcmlzaDpHaWJiZXJpc2gsXG5cbiAgICBmcmVlOmZ1bmN0aW9uKCkge1xuICAgICAgR2liYmVyaXNoLmdlbmlzaC5nZW4uZnJlZSggdGhpcy5ncmFwaCApXG4gICAgfSxcblxuICAgIHByaW50OmZ1bmN0aW9uKCkge1xuICAgICAgY29uc29sZS5sb2coIHRoaXMuY2FsbGJhY2sudG9TdHJpbmcoKSApXG4gICAgfSxcblxuICAgIGNvbm5lY3Q6ZnVuY3Rpb24oIHRhcmdldCwgbGV2ZWw9MSApIHtcbiAgICAgIGlmKCB0aGlzLmNvbm5lY3RlZCA9PT0gdW5kZWZpbmVkICkgdGhpcy5jb25uZWN0ZWQgPSBbXVxuXG4gICAgICAvL2xldCBpbnB1dCA9IGxldmVsID09PSAxID8gdGhpcyA6IEdpYmJlcmlzaC5iaW5vcHMuTXVsKCB0aGlzLCBsZXZlbCApXG4gICAgICBsZXQgaW5wdXQgPSB0aGlzXG5cbiAgICAgIGlmKCB0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwgKSB0YXJnZXQgPSBHaWJiZXJpc2gub3V0cHV0IFxuXG5cbiAgICAgIC8vIFhYWCBJIGZvcmdvdCwgd2hlcmUgaXMgX19hZGRJbnB1dCBmb3VuZD8gQ2FuIHdlIGNvbnRyb2wgdGhlXG4gICAgICAvLyBsZXZlbCBvZiB0aGUgaW5wdXQ/XG4gICAgICBpZiggdHlwZW9mIHRhcmdldC5fX2FkZElucHV0ID09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgIHRhcmdldC5fX2FkZElucHV0KCBpbnB1dCApXG4gICAgICB9IGVsc2UgaWYoIHRhcmdldC5zdW0gJiYgdGFyZ2V0LnN1bS5pbnB1dHMgKSB7XG4gICAgICAgIHRhcmdldC5zdW0uaW5wdXRzLnB1c2goIGlucHV0IClcbiAgICAgIH0gZWxzZSBpZiggdGFyZ2V0LmlucHV0cyApIHtcbiAgICAgICAgY29uc3QgaWR4ID0gdGFyZ2V0LmlucHV0cy5pbmRleE9mKCBpbnB1dCApXG5cbiAgICAgICAgLy8gaWYgbm8gY29ubmVjdGlvbiBleGlzdHMuLi5cbiAgICAgICAgaWYoIGlkeCA9PT0gLTEgKSB7XG4gICAgICAgICAgdGFyZ2V0LmlucHV0cy51bnNoaWZ0KCBpbnB1dCwgbGV2ZWwsIGlucHV0LmlzU3RlcmVvIClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgLy8gLi4uIG90aGVyd2lzZSB1cGRhdGUgdGhlIGNvbm5lY3Rpb24ncyBsZXZlbCwgd2hpY2ggaXMgc3RvcmVkXG4gICAgICAgICAgLy8gb25lIGluZGV4IGhpZ2hlciBpbiB0aGUgaW5wdXQgbGlzdC5cbiAgICAgICAgICB0YXJnZXQuaW5wdXRzWyBpZHggKyAxIF0gPSBsZXZlbFxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YXJnZXQuaW5wdXQgPSBpbnB1dFxuICAgICAgICB0YXJnZXQuaW5wdXRHYWluID0gbGV2ZWxcbiAgICAgIH1cblxuICAgICAgR2liYmVyaXNoLmRpcnR5KCB0YXJnZXQgKVxuXG4gICAgICB0aGlzLmNvbm5lY3RlZC5wdXNoKFsgdGFyZ2V0LCBpbnB1dCwgbGV2ZWwgXSlcbiAgICAgIFxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgZGlzY29ubmVjdDpmdW5jdGlvbiggdGFyZ2V0ICkge1xuICAgICAgaWYoIHRhcmdldCA9PT0gdW5kZWZpbmVkICl7XG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCB0aGlzLmNvbm5lY3RlZCApICkge1xuICAgICAgICAgIGZvciggbGV0IGNvbm5lY3Rpb24gb2YgdGhpcy5jb25uZWN0ZWQgKSB7XG4gICAgICAgICAgICBpZiggY29ubmVjdGlvblswXS5kaXNjb25uZWN0VWdlbiAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICBjb25uZWN0aW9uWzBdLmRpc2Nvbm5lY3RVZ2VuKCBjb25uZWN0aW9uWzFdIClcbiAgICAgICAgICAgIH1lbHNlIGlmKCBjb25uZWN0aW9uWzBdLmlucHV0ID09PSB0aGlzICkge1xuICAgICAgICAgICAgICBjb25uZWN0aW9uWzBdLmlucHV0ID0gMFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmNvbm5lY3RlZC5sZW5ndGggPSAwXG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gdGhpcy5jb25uZWN0ZWQuZmluZCggdiA9PiB2WzBdID09PSB0YXJnZXQgKVxuICAgICAgICAvLyBpZiB0YXJnZXQgaXMgYSBidXMuLi5cbiAgICAgICAgaWYoIHRhcmdldC5kaXNjb25uZWN0VWdlbiAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIGlmKCBjb25uZWN0aW9uICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0YXJnZXQuZGlzY29ubmVjdFVnZW4oIGNvbm5lY3Rpb25bMV0gKVxuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgLy8gbXVzdCBiZSBhbiBlZmZlY3QsIHNldCBpbnB1dCB0byAwXG4gICAgICAgICAgdGFyZ2V0LmlucHV0ID0gMFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0SWR4ID0gdGhpcy5jb25uZWN0ZWQuaW5kZXhPZiggY29ubmVjdGlvbiApXG5cbiAgICAgICAgaWYoIHRhcmdldElkeCAhPT0gLTEgKSB7XG4gICAgICAgICAgdGhpcy5jb25uZWN0ZWQuc3BsaWNlKCB0YXJnZXRJZHgsIDEgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNoYWluOmZ1bmN0aW9uKCB0YXJnZXQsIGxldmVsPTEgKSB7XG4gICAgICB0aGlzLmNvbm5lY3QoIHRhcmdldCxsZXZlbCApXG5cbiAgICAgIHJldHVybiB0YXJnZXRcbiAgICB9LFxuXG4gICAgX19yZWRvR3JhcGg6ZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgaXNTdGVyZW8gPSB0aGlzLmlzU3RlcmVvXG4gICAgICB0aGlzLl9fY3JlYXRlR3JhcGgoKVxuICAgICAgdGhpcy5jYWxsYmFjayA9IEdpYmJlcmlzaC5nZW5pc2guZ2VuLmNyZWF0ZUNhbGxiYWNrKCB0aGlzLmdyYXBoLCBHaWJiZXJpc2gubWVtb3J5LCBmYWxzZSwgdHJ1ZSApXG4gICAgICB0aGlzLmlucHV0TmFtZXMgPSBuZXcgU2V0KCBHaWJiZXJpc2guZ2VuaXNoLmdlbi5wYXJhbWV0ZXJzICkgXG4gICAgICB0aGlzLmNhbGxiYWNrLnVnZW5OYW1lID0gdGhpcy51Z2VuTmFtZVxuICAgICAgR2liYmVyaXNoLmRpcnR5KCB0aGlzIClcblxuICAgICAgLy8gaWYgY2hhbm5lbCBjb3VudCBoYXMgY2hhbmdlZCBhZnRlciByZWNvbXBpbGluZyBncmFwaC4uLlxuICAgICAgaWYoIGlzU3RlcmVvICE9PSB0aGlzLmlzU3RlcmVvICkge1xuICAgICAgICAvL2NvbnNvbGUubG9nKCAnQ0hBTkdJTkcgU1RFUkVPOicsIGlzU3RlcmVvIClcblxuICAgICAgICAvLyBjaGVjayBmb3IgYW55IGNvbm5lY3Rpb25zIGJlZm9yZSBpdGVyYXRpbmcuLi5cbiAgICAgICAgaWYoIHRoaXMuY29ubmVjdGVkID09PSB1bmRlZmluZWQgKSByZXR1cm5cbiAgICAgICAgLy8gbG9vcCB0aHJvdWdoIGFsbCBidXNzZXMgdGhlIHVnZW4gaXMgY29ubmVjdGVkIHRvXG4gICAgICAgIGZvciggbGV0IGNvbm5lY3Rpb24gb2YgdGhpcy5jb25uZWN0ZWQgKSB7XG4gICAgICAgICAgLy8gc2V0IHRoZSBkaXJ0eSBmbGFnIG9mIHRoZSBidXNcbiAgICAgICAgICBHaWJiZXJpc2guZGlydHkoIGNvbm5lY3Rpb25bIDAgXSApXG5cbiAgICAgICAgICAvLyBjaGVjayBmb3IgaW5wdXRzIGFycmF5LCB3aGljaCBpbmRpY2F0ZXMgY29ubmVjdGlvbiBpcyB0byBhIGJ1c1xuICAgICAgICAgIGlmKCBjb25uZWN0aW9uWzBdLmlucHV0cyAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgLy8gZmluZCB0aGUgaW5wdXQgaW4gdGhlIGJ1c3NlcyAnaW5wdXRzJyBhcnJheVxuICAgICAgICAgICAgY29uc3QgaW5wdXRJZHggPSBjb25uZWN0aW9uWyAwIF0uaW5wdXRzLmluZGV4T2YoIGNvbm5lY3Rpb25bIDEgXSApXG5cbiAgICAgICAgICAgIC8vIGFzc3VtaWluZyBpdCBpcyBmb3VuZC4uLlxuICAgICAgICAgICAgaWYoIGlucHV0SWR4ICE9PSAtMSApIHtcbiAgICAgICAgICAgICAgLy8gY2hhbmdlIHN0ZXJlbyBmaWVsZFxuICAgICAgICAgICAgICBjb25uZWN0aW9uWyAwIF0uaW5wdXRzWyBpbnB1dElkeCArIDIgXSA9IHRoaXMuaXNTdGVyZW9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZSBpZiggY29ubmVjdGlvblswXS5pbnB1dCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgaWYoIGNvbm5lY3Rpb25bMF0uX19yZWRvR3JhcGggIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgY29ubmVjdGlvblswXS5fX3JlZG9HcmFwaCgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgfVxuXG4gIHJldHVybiB1Z2VuXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfX3VnZW5cbiIsImNvbnN0IF9fcHJveHkgPSByZXF1aXJlKCAnLi93b3JrbGV0UHJveHkuanMnIClcbmNvbnN0IGVmZmVjdFByb3RvID0gcmVxdWlyZSggJy4vZngvZWZmZWN0LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcbiAgY29uc3QgcHJveHkgPSBfX3Byb3h5KCBHaWJiZXJpc2ggKVxuICBcbiAgY29uc3QgZmFjdG9yeSA9IGZ1bmN0aW9uKCB1Z2VuLCBncmFwaCwgX19uYW1lLCB2YWx1ZXMsIGNiPW51bGwsIHNob3VsZFByb3h5ID0gdHJ1ZSApIHtcbiAgICB1Z2VuLmNhbGxiYWNrID0gY2IgPT09IG51bGwgPyBHaWJiZXJpc2guZ2VuaXNoLmdlbi5jcmVhdGVDYWxsYmFjayggZ3JhcGgsIEdpYmJlcmlzaC5tZW1vcnksIGZhbHNlLCB0cnVlICkgOiBjYlxuXG4gICAgbGV0IG5hbWUgPSBBcnJheS5pc0FycmF5KCBfX25hbWUgKSA/IF9fbmFtZVsgX19uYW1lLmxlbmd0aCAtIDEgXSA6IF9fbmFtZVxuXG4gICAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgICAgLy90eXBlOiAndWdlbicsXG4gICAgICBpZDogdmFsdWVzLmlkIHx8IEdpYmJlcmlzaC51dGlsaXRpZXMuZ2V0VUlEKCksIFxuICAgICAgdWdlbk5hbWU6IG5hbWUgKyAnXycsXG4gICAgICBncmFwaDogZ3JhcGgsXG4gICAgICBpbnB1dE5hbWVzOiBuZXcgU2V0KCBHaWJiZXJpc2guZ2VuaXNoLmdlbi5wYXJhbWV0ZXJzICksXG4gICAgICBpc1N0ZXJlbzogQXJyYXkuaXNBcnJheSggZ3JhcGggKSxcbiAgICAgIGRpcnR5OiB0cnVlLFxuICAgICAgX19wcm9wZXJ0aWVzX186dmFsdWVzLFxuICAgICAgX19hZGRyZXNzZXNfXzp7fVxuICAgIH0pXG4gICAgXG4gICAgdWdlbi51Z2VuTmFtZSArPSB1Z2VuLmlkXG4gICAgdWdlbi5jYWxsYmFjay51Z2VuTmFtZSA9IHVnZW4udWdlbk5hbWUgLy8gWFhYIGhhY2t5XG4gICAgdWdlbi5jYWxsYmFjay5pZCA9IHVnZW4uaWRcblxuICAgIGZvciggbGV0IHBhcmFtIG9mIHVnZW4uaW5wdXROYW1lcyApIHtcbiAgICAgIGlmKCBwYXJhbSA9PT0gJ21lbW9yeScgKSBjb250aW51ZVxuXG4gICAgICBsZXQgdmFsdWUgPSB2YWx1ZXNbIHBhcmFtIF0sXG4gICAgICAgICAgaXNOdW1iZXIgPSAhaXNOYU4oIHZhbHVlICksXG4gICAgICAgICAgaWR4XG5cbiAgICAgIGlmKCBpc051bWJlciApIHsgXG4gICAgICAgIGlkeCA9IEdpYmJlcmlzaC5tZW1vcnkuYWxsb2MoIDEgKVxuICAgICAgICBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIGlkeCBdID0gdmFsdWVcbiAgICAgICAgdWdlbi5fX2FkZHJlc3Nlc19fWyBwYXJhbSBdID0gaWR4XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IGRvIHdlIG5lZWQgdG8gY2hlY2sgZm9yIGEgc2V0dGVyP1xuICAgICAgbGV0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKCB1Z2VuLCBwYXJhbSApLFxuICAgICAgICAgIHNldHRlclxuXG4gICAgICBpZiggZGVzYyAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICBzZXR0ZXIgPSBkZXNjLnNldFxuICAgICAgfVxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sIHBhcmFtLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTp0cnVlLFxuICAgICAgICBnZXQoKSB7IFxuICAgICAgICAgIGlmKCBpc051bWJlciApIHtcbiAgICAgICAgICAgIHJldHVybiBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIGlkeCBdXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgLy9pZiggcGFyYW0gPT09ICdpbnB1dCcgKSBjb25zb2xlLmxvZyggJ0lOUFVUOicsIHYsIGlzTnVtYmVyIClcbiAgICAgICAgICBpZiggdmFsdWUgIT09IHYgKSB7XG4gICAgICAgICAgICBpZiggc2V0dGVyICE9PSB1bmRlZmluZWQgKSBzZXR0ZXIoIHYgKVxuICAgICAgICAgICAgaWYoICFpc05hTiggdiApICkge1xuICAgICAgICAgICAgICBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIGlkeCBdID0gdmFsdWUgPSB2XG4gICAgICAgICAgICAgIGlmKCBpc051bWJlciA9PT0gZmFsc2UgKSBHaWJiZXJpc2guZGlydHkoIHVnZW4gKVxuICAgICAgICAgICAgICBpc051bWJlciA9IHRydWVcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICB2YWx1ZSA9IHZcbiAgICAgICAgICAgICAgLyppZiggaXNOdW1iZXIgPT09IHRydWUgKSovIEdpYmJlcmlzaC5kaXJ0eSggdWdlbiApXG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdzd2l0Y2hpbmcgZnJvbSBudW1iZXI6JywgcGFyYW0sIHZhbHVlIClcbiAgICAgICAgICAgICAgaXNOdW1iZXIgPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBhZGQgYnlwYXNzIFxuICAgIGlmKCBlZmZlY3RQcm90by5pc1Byb3RvdHlwZU9mKCB1Z2VuICkgKSB7XG4gICAgICBsZXQgdmFsdWUgPSB1Z2VuLmJ5cGFzc1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAnYnlwYXNzJywge1xuICAgICAgICBjb25maWd1cmFibGU6dHJ1ZSxcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gdmFsdWUgfSxcbiAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgIGlmKCB2YWx1ZSAhPT0gdiApIHtcbiAgICAgICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdWdlbiApXG4gICAgICAgICAgICB2YWx1ZSA9IHZcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICB9XG5cbiAgICBpZiggdWdlbi5fX3JlcXVpcmVzUmVjb21waWxhdGlvbiAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgdWdlbi5fX3JlcXVpcmVzUmVjb21waWxhdGlvbi5mb3JFYWNoKCBwcm9wID0+IHtcbiAgICAgICAgbGV0IHZhbHVlID0gdmFsdWVzWyBwcm9wIF1cbiAgICAgICAgbGV0IGlzTnVtYmVyID0gIWlzTmFOKCB2YWx1ZSApXG5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCBwcm9wLCB7XG4gICAgICAgICAgY29uZmlndXJhYmxlOnRydWUsXG4gICAgICAgICAgZ2V0KCkgeyBcbiAgICAgICAgICAgIGlmKCBpc051bWJlciApIHtcbiAgICAgICAgICAgICAgbGV0IGlkeCA9IHVnZW4uX19hZGRyZXNzZXNfX1sgcHJvcCBdXG4gICAgICAgICAgICAgIHJldHVybiBHaWJiZXJpc2gubWVtb3J5LmhlYXBbIGlkeCBdXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ3JldHVybmluZzonLCBwcm9wLCB2YWx1ZSwgR2liYmVyaXNoLm1vZGUgKVxuICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgICBpZiggdmFsdWUgIT09IHYgKSB7XG4gICAgICAgICAgICAgIGlmKCAhaXNOYU4oIHYgKSApIHtcbiAgICAgICAgICAgICAgICBsZXQgaWR4ID0gdWdlbi5fX2FkZHJlc3Nlc19fWyBwcm9wIF1cbiAgICAgICAgICAgICAgICBpZiggaWR4ID09PSB1bmRlZmluZWQgKXtcbiAgICAgICAgICAgICAgICAgIGlkeCA9IEdpYmJlcmlzaC5tZW1vcnkuYWxsb2MoIDEgKVxuICAgICAgICAgICAgICAgICAgdWdlbi5fX2FkZHJlc3Nlc19fWyBwcm9wIF0gPSBpZHhcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZXNbIHByb3AgXSA9IEdpYmJlcmlzaC5tZW1vcnkuaGVhcFsgaWR4IF0gPSB2XG4gICAgICAgICAgICAgICAgaXNOdW1iZXIgPSB0cnVlXG4gICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWVzWyBwcm9wIF0gPSB2XG4gICAgICAgICAgICAgICAgaXNOdW1iZXIgPSBmYWxzZVxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdzZXR0aW5nIHVnZW4nLCB2YWx1ZSwgR2liYmVyaXNoLm1vZGUgKVxuICAgICAgICAgICAgICAgIEdpYmJlcmlzaC5kaXJ0eSggdWdlbiApXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnU0VUVElORyBSRURPIEdSQVBIJywgcHJvcCwgR2liYmVyaXNoLm1vZGUgKVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gbmVlZGVkIGZvciBmaWx0ZXJUeXBlIGF0IHRoZSB2ZXJ5IGxlYXN0LCBiZWNhdWFlIHRoZSBwcm9wc1xuICAgICAgICAgICAgICAvLyBhcmUgcmV1c2VkIHdoZW4gcmUtY3JlYXRpbmcgdGhlIGdyYXBoLiBUaGlzIHNlZW1zIGxpa2UgYSBjaGVhcGVyXG4gICAgICAgICAgICAgIC8vIHdheSB0byBzb2x2ZSB0aGlzIHByb2JsZW0uXG4gICAgICAgICAgICAgIC8vdmFsdWVzWyBwcm9wIF0gPSB2XG5cbiAgICAgICAgICAgICAgdGhpcy5fX3JlZG9HcmFwaCgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyB3aWxsIG9ubHkgY3JlYXRlIHByb3h5IGlmIHdvcmtsZXRzIGFyZSBiZWluZyB1c2VkXG4gICAgLy8gb3RoZXJ3aXNlIHdpbGwgcmV0dXJuIHVuYWx0ZXJlZCB1Z2VuXG5cbiAgICBpZiggdmFsdWVzLnNob3VsZEFkZFRvVWdlbiA9PT0gdHJ1ZSApIE9iamVjdC5hc3NpZ24oIHVnZW4sIHZhbHVlcyApXG5cbiAgICByZXR1cm4gc2hvdWxkUHJveHkgPyBwcm94eSggX19uYW1lLCB2YWx1ZXMsIHVnZW4gKSA6IHVnZW5cbiAgfVxuXG4gIGZhY3RvcnkuZ2V0VUlEID0gKCkgPT4geyByZXR1cm4gR2liYmVyaXNoLnV0aWxpdGllcy5nZXRVSUQoKSB9XG5cbiAgcmV0dXJuIGZhY3Rvcnlcbn1cbiIsImNvbnN0IGdlbmlzaCA9IHJlcXVpcmUoICdnZW5pc2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggR2liYmVyaXNoICkge1xuXG5sZXQgdWlkID0gMFxuXG5jb25zdCB1dGlsaXRpZXMgPSB7XG4gIGNyZWF0ZUNvbnRleHQoIGN0eCwgY2IsIHJlc29sdmUgKSB7XG4gICAgbGV0IEFDID0gdHlwZW9mIEF1ZGlvQ29udGV4dCA9PT0gJ3VuZGVmaW5lZCcgPyB3ZWJraXRBdWRpb0NvbnRleHQgOiBBdWRpb0NvbnRleHRcblxuICAgIGxldCBzdGFydCA9ICgpID0+IHtcbiAgICAgIGlmKCB0eXBlb2YgQUMgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICBHaWJiZXJpc2guY3R4ID0gY3R4ID09PSB1bmRlZmluZWQgPyBuZXcgQUMoKSA6IGN0eFxuICAgICAgICBnZW5pc2guZ2VuLnNhbXBsZXJhdGUgPSBHaWJiZXJpc2guY3R4LnNhbXBsZVJhdGVcbiAgICAgICAgZ2VuaXNoLnV0aWxpdGllcy5jdHggPSBHaWJiZXJpc2guY3R4XG5cbiAgICAgICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuXG4gICAgICAgICAgaWYoICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApeyAvLyByZXF1aXJlZCB0byBzdGFydCBhdWRpbyB1bmRlciBpT1MgNlxuICAgICAgICAgICAgbGV0IG15U291cmNlID0gdXRpbGl0aWVzLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuICAgICAgICAgICAgbXlTb3VyY2UuY29ubmVjdCggdXRpbGl0aWVzLmN0eC5kZXN0aW5hdGlvbiApXG4gICAgICAgICAgICBteVNvdXJjZS5ub3RlT24oIDAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBzdGFydCApXG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgc3RhcnQgKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKCB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicgKSBjYiggcmVzb2x2ZSApXG4gICAgfVxuXG4gICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG4gICAgfWVsc2V7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIHN0YXJ0IClcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIHN0YXJ0IClcbiAgICB9XG5cbiAgICByZXR1cm4gR2liYmVyaXNoLmN0eFxuICB9LFxuXG4gIGNyZWF0ZVNjcmlwdFByb2Nlc3NvciggcmVzb2x2ZSApIHtcbiAgICBHaWJiZXJpc2gubm9kZSA9IEdpYmJlcmlzaC5jdHguY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCAxMDI0LCAwLCAyICksXG4gICAgR2liYmVyaXNoLmNsZWFyRnVuY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIDAgfSxcbiAgICBHaWJiZXJpc2guY2FsbGJhY2sgPSBHaWJiZXJpc2guY2xlYXJGdW5jdGlvblxuXG4gICAgR2liYmVyaXNoLm5vZGUub25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbiggYXVkaW9Qcm9jZXNzaW5nRXZlbnQgKSB7XG4gICAgICBsZXQgZ2liYmVyaXNoID0gR2liYmVyaXNoLFxuICAgICAgICAgIGNhbGxiYWNrICA9IGdpYmJlcmlzaC5jYWxsYmFjayxcbiAgICAgICAgICBvdXRwdXRCdWZmZXIgPSBhdWRpb1Byb2Nlc3NpbmdFdmVudC5vdXRwdXRCdWZmZXIsXG4gICAgICAgICAgc2NoZWR1bGVyID0gR2liYmVyaXNoLnNjaGVkdWxlcixcbiAgICAgICAgICAvL29ianMgPSBnaWJiZXJpc2guY2FsbGJhY2tVZ2Vucy5zbGljZSggMCApLFxuICAgICAgICAgIGxlbmd0aFxuXG4gICAgICBsZXQgbGVmdCA9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMCApLFxuICAgICAgICAgIHJpZ2h0PSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDEgKVxuXG4gICAgICBsZXQgY2FsbGJhY2tsZW5ndGggPSBHaWJiZXJpc2guYmxvY2tDYWxsYmFja3MubGVuZ3RoXG4gICAgICBcbiAgICAgIGlmKCBjYWxsYmFja2xlbmd0aCAhPT0gMCApIHtcbiAgICAgICAgZm9yKCBsZXQgaT0wOyBpPCBjYWxsYmFja2xlbmd0aDsgaSsrICkge1xuICAgICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrc1sgaSBdKClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhbid0IGp1c3Qgc2V0IGxlbmd0aCB0byAwIGFzIGNhbGxiYWNrcyBtaWdodCBiZSBhZGRlZCBkdXJpbmcgZm9yIGxvb3AsIHNvIHNwbGljZSBwcmUtZXhpc3RpbmcgZnVuY3Rpb25zXG4gICAgICAgIEdpYmJlcmlzaC5ibG9ja0NhbGxiYWNrcy5zcGxpY2UoIDAsIGNhbGxiYWNrbGVuZ3RoIClcbiAgICAgIH1cblxuICAgICAgZm9yIChsZXQgc2FtcGxlID0gMCwgbGVuZ3RoID0gbGVmdC5sZW5ndGg7IHNhbXBsZSA8IGxlbmd0aDsgc2FtcGxlKyspIHtcbiAgICAgICAgc2NoZWR1bGVyLnRpY2soKVxuXG4gICAgICAgIGlmKCBnaWJiZXJpc2guZ3JhcGhJc0RpcnR5ICkgeyBcbiAgICAgICAgICBjYWxsYmFjayA9IGdpYmJlcmlzaC5nZW5lcmF0ZUNhbGxiYWNrKClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gWFhYIGNhbnQgdXNlIGRlc3RydWN0dXJpbmcsIGJhYmVsIG1ha2VzIGl0IHNvbWV0aGluZyBpbmVmZmljaWVudC4uLlxuICAgICAgICBsZXQgb3V0ID0gY2FsbGJhY2suYXBwbHkoIG51bGwsIGdpYmJlcmlzaC5jYWxsYmFja1VnZW5zIClcblxuICAgICAgICBsZWZ0WyBzYW1wbGUgIF0gPSBvdXRbMF1cbiAgICAgICAgcmlnaHRbIHNhbXBsZSBdID0gb3V0WzFdXG4gICAgICB9XG4gICAgfVxuXG4gICAgR2liYmVyaXNoLm5vZGUuY29ubmVjdCggR2liYmVyaXNoLmN0eC5kZXN0aW5hdGlvbiApXG5cbiAgICByZXNvbHZlKClcblxuICAgIHJldHVybiBHaWJiZXJpc2gubm9kZVxuICB9LCBcblxuICBjcmVhdGVXb3JrbGV0KCByZXNvbHZlICkge1xuICAgIEdpYmJlcmlzaC5jdHguYXVkaW9Xb3JrbGV0LmFkZE1vZHVsZSggR2liYmVyaXNoLndvcmtsZXRQYXRoICkudGhlbiggKCkgPT4ge1xuICAgICAgR2liYmVyaXNoLndvcmtsZXQgPSBuZXcgQXVkaW9Xb3JrbGV0Tm9kZSggR2liYmVyaXNoLmN0eCwgJ2dpYmJlcmlzaCcsIHsgb3V0cHV0Q2hhbm5lbENvdW50OlsyXSB9IClcbiAgICAgIEdpYmJlcmlzaC53b3JrbGV0LmNvbm5lY3QoIEdpYmJlcmlzaC5jdHguZGVzdGluYXRpb24gKVxuICAgICAgR2liYmVyaXNoLndvcmtsZXQucG9ydC5vbm1lc3NhZ2UgPSBldmVudCA9PiB7XG4gICAgICAgIEdpYmJlcmlzaC51dGlsaXRpZXMud29ya2xldEhhbmRsZXJzWyBldmVudC5kYXRhLmFkZHJlc3MgXSggZXZlbnQgKSAgICAgICAgXG4gICAgICB9XG4gICAgICBHaWJiZXJpc2gud29ya2xldC51Z2VucyA9IG5ldyBNYXAoKVxuXG4gICAgICByZXNvbHZlKClcbiAgICB9KVxuICB9LFxuXG4gIHdvcmtsZXRIYW5kbGVyczoge1xuICAgIGdldCggZXZlbnQgKSB7XG4gICAgICBsZXQgbmFtZSA9IGV2ZW50LmRhdGEubmFtZVxuICAgICAgbGV0IHZhbHVlXG4gICAgICBpZiggbmFtZVswXSA9PT0gJ0dpYmJlcmlzaCcgKSB7XG4gICAgICAgIHZhbHVlID0gR2liYmVyaXNoXG4gICAgICAgIG5hbWUuc2hpZnQoKVxuICAgICAgfVxuICAgICAgZm9yKCBsZXQgc2VnbWVudCBvZiBuYW1lICkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlWyBzZWdtZW50IF1cbiAgICAgIH1cblxuICAgICAgR2liYmVyaXNoLndvcmtsZXQucG9ydC5wb3N0TWVzc2FnZSh7XG4gICAgICAgIGFkZHJlc3M6J3NldCcsXG4gICAgICAgIG5hbWU6J0dpYmJlcmlzaC4nICsgbmFtZS5qb2luKCcuJyksXG4gICAgICAgIHZhbHVlXG4gICAgICB9KVxuICAgIH0sXG4gICAgc3RhdGUoIGV2ZW50ICl7XG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGV2ZW50LmRhdGEubWVzc2FnZXNcbiAgICAgIGlmKCBtZXNzYWdlcy5sZW5ndGggPT09IDAgKSByZXR1cm5cblxuICAgICAgLy8gWFhYIGlzIHByZXZlbnRQcm94eSBhY3R1YWxseSB1c2VkP1xuICAgICAgR2liYmVyaXNoLnByZXZlbnRQcm94eSA9IHRydWVcbiAgICAgIEdpYmJlcmlzaC5wcm94eUVuYWJsZWQgPSBmYWxzZVxuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBtZXNzYWdlcy5sZW5ndGg7IGkrPSAzICkge1xuICAgICAgICBjb25zdCBpZCA9IG1lc3NhZ2VzWyBpIF0gXG4gICAgICAgIGNvbnN0IHByb3BOYW1lID0gbWVzc2FnZXNbIGkgKyAxIF1cbiAgICAgICAgY29uc3QgdmFsdWUgPSBtZXNzYWdlc1sgaSArIDIgXVxuICAgICAgICBjb25zdCBvYmogPSBHaWJiZXJpc2gud29ya2xldC51Z2Vucy5nZXQoIGlkIClcblxuICAgICAgICBpZiggb2JqICE9PSB1bmRlZmluZWQgJiYgcHJvcE5hbWUuaW5kZXhPZignLicpID09PSAtMSAmJiBwcm9wTmFtZSAhPT0gJ2lkJyApIHsgXG4gICAgICAgICAgaWYoIG9ialsgcHJvcE5hbWUgXSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgaWYoIHR5cGVvZiBvYmpbIHByb3BOYW1lIF0gIT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgICAgIG9ialsgcHJvcE5hbWUgXSA9IHZhbHVlXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgb2JqWyBwcm9wTmFtZSBdKCB2YWx1ZSApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBvYmpbIHByb3BOYW1lIF0gPSB2YWx1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2UgaWYoIG9iaiAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIGNvbnN0IHByb3BTcGxpdCA9IHByb3BOYW1lLnNwbGl0KCcuJylcbiAgICAgICAgICBpZiggb2JqWyBwcm9wU3BsaXRbIDAgXSBdICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBpZiggdHlwZW9mIG9ialsgcHJvcFNwbGl0WyAwIF0gXVsgcHJvcFNwbGl0WyAxIF0gXSAhPT0gJ2Z1bmN0aW9uJyApIHtcbiAgICAgICAgICAgICAgb2JqWyBwcm9wU3BsaXRbIDAgXSBdWyBwcm9wU3BsaXRbIDEgXSBdID0gdmFsdWVcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBvYmpbIHByb3BTcGxpdFsgMCBdIF1bIHByb3BTcGxpdFsgMSBdIF0oIHZhbHVlIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICd1bmRlZmluZWQgc3BsaXQgcHJvcGVydHkhJywgaWQsIHByb3BTcGxpdFswXSwgcHJvcFNwbGl0WzFdLCB2YWx1ZSwgb2JqIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gWFhYIGRvdWJsZSBjaGVjayBhbmQgbWFrZSBzdXJlIHRoaXMgaXNuJ3QgZ2V0dGluZyBzZW50IGJhY2sgdG8gcHJvY2Vzc29ybm9kZS4uLlxuICAgICAgICAvLyBjb25zb2xlLmxvZyggcHJvcE5hbWUsIHZhbHVlLCBvYmogKVxuICAgICAgfVxuICAgICAgR2liYmVyaXNoLnByZXZlbnRQcm94eSA9IGZhbHNlXG4gICAgICBHaWJiZXJpc2gucHJveHlFbmFibGVkID0gdHJ1ZVxuICAgIH1cbiAgfSxcblxuICB3cmFwKCBmdW5jLCAuLi5hcmdzICkge1xuICAgIGNvbnN0IG91dCA9IHtcbiAgICAgIGFjdGlvbjond3JhcCcsXG4gICAgICB2YWx1ZTpmdW5jLFxuICAgICAgLy8gbXVzdCByZXR1cm4gb2JqZWN0cyBjb250YWluaW5nIG9ubHkgdGhlIGlkIG51bWJlciB0byBhdm9pZFxuICAgICAgLy8gY3JlYXRpbmcgY2lyY3VsYXIgSlNPTiByZWZlcmVuY2VzIHRoYXQgd291bGQgcmVzdWx0IGZyb20gcGFzc2luZyBhY3R1YWwgdWdlbnNcbiAgICAgIGFyZ3M6IGFyZ3MubWFwKCB2ID0+IHsgcmV0dXJuIHsgaWQ6di5pZCB9IH0pXG4gICAgfVxuICAgIHJldHVybiBvdXRcbiAgfSxcblxuICBleHBvcnQoIG9iaiApIHtcbiAgICBvYmoud3JhcCA9IHRoaXMud3JhcFxuICB9LFxuXG4gIGdldFVJRCgpIHsgcmV0dXJuIHVpZCsrIH1cbn1cblxucmV0dXJuIHV0aWxpdGllc1xuXG59XG4iLCJjb25zdCBzZXJpYWxpemUgPSByZXF1aXJlKCdzZXJpYWxpemUtamF2YXNjcmlwdCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIEdpYmJlcmlzaCApIHtcblxuY29uc3QgcmVwbGFjZU9iaiA9IGZ1bmN0aW9uKCBvYmosIHNob3VsZFNlcmlhbGl6ZUZ1bmN0aW9ucyA9IHRydWUgKSB7XG4gIGlmKCB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmogIT09IG51bGwgJiYgb2JqLmlkICE9PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIG9iai5fX3R5cGUgIT09ICdzZXEnICkgeyAvLyBYWFggd2h5P1xuICAgICAgcmV0dXJuIHsgaWQ6b2JqLmlkLCBwcm9wOm9iai5wcm9wIH1cbiAgICB9ZWxzZXtcbiAgICAgIC8vIHNob3VsZG4ndCBJIGJlIHNlcmlhbGl6aW5nIG1vc3Qgb2JqZWN0cywgbm90IGp1c3Qgc2Vxcz9cbiAgICAgIHJldHVybiBzZXJpYWxpemUoIG9iaiApXG4gICAgfVxuICB9ZWxzZSBpZiggdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJyAmJiBzaG91bGRTZXJpYWxpemVGdW5jdGlvbnMgPT09IHRydWUgKSB7XG4gICAgcmV0dXJuIHsgaXNGdW5jOnRydWUsIHZhbHVlOnNlcmlhbGl6ZSggb2JqICkgfVxuICB9XG4gIHJldHVybiBvYmpcbn1cblxuY29uc3QgbWFrZUFuZFNlbmRPYmplY3QgPSBmdW5jdGlvbiggX19uYW1lLCB2YWx1ZXMsIG9iaiApIHtcbiAgY29uc3QgcHJvcGVydGllcyA9IHt9XG5cbiAgLy8gb2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gc2VudCB0aHJvdWdoIG1lc3NhZ2Vwb3J0Li4uXG5cbiAgZm9yKCBsZXQga2V5IGluIHZhbHVlcyApIHtcbiAgICBjb25zdCBhbHJlYWR5UHJvY2Vzc2VkID0gKHR5cGVvZiB2YWx1ZXNbIGtleSBdID09PSAnb2JqZWN0JyAmJiB2YWx1ZXNbIGtleSBdICE9PSBudWxsICYmIHZhbHVlc1sga2V5IF0uX19tZXRhX18gIT09IHVuZGVmaW5lZCkgfHxcbiAgICAgICh0eXBlb2YgdmFsdWVzW2tleV0gPT09ICdmdW5jdGlvbicgJiYgdmFsdWVzWyBrZXkgXS5fX21ldGFfXyAhPT0gdW5kZWZpbmVkIClcblxuICAgIGlmKCBhbHJlYWR5UHJvY2Vzc2VkICkgeyBcbiAgICAgIHByb3BlcnRpZXNbIGtleSBdID0geyBpZDp2YWx1ZXNbIGtleSBdLl9fbWV0YV9fLmlkIH1cbiAgICB9ZWxzZSBpZiggQXJyYXkuaXNBcnJheSggdmFsdWVzWyBrZXkgXSApICkge1xuICAgICAgY29uc3QgYXJyID0gW11cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdmFsdWVzWyBrZXkgXS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgYXJyWyBpIF0gPSByZXBsYWNlT2JqKCB2YWx1ZXNbIGtleSBdW2ldLCBmYWxzZSAgKVxuICAgICAgfVxuICAgICAgcHJvcGVydGllc1sga2V5IF0gPSBhcnJcbiAgICB9ZWxzZSBpZiggdHlwZW9mIHZhbHVlc1trZXldID09PSAnb2JqZWN0JyAmJiB2YWx1ZXNba2V5XSAhPT0gbnVsbCApe1xuICAgICAgcHJvcGVydGllc1sga2V5IF0gPSByZXBsYWNlT2JqKCB2YWx1ZXNbIGtleSBdLCBmYWxzZSApXG4gICAgfWVsc2V7XG4gICAgICBwcm9wZXJ0aWVzWyBrZXkgXSA9IHZhbHVlc1sga2V5IF1cbiAgICB9XG4gIH1cblxuICBsZXQgc2VyaWFsaXplZFByb3BlcnRpZXMgPSBzZXJpYWxpemUoIHByb3BlcnRpZXMgKVxuXG4gIGlmKCBBcnJheS5pc0FycmF5KCBfX25hbWUgKSApIHtcbiAgICBjb25zdCBvbGROYW1lID0gX19uYW1lWyBfX25hbWUubGVuZ3RoIC0gMSBdXG4gICAgX19uYW1lWyBfX25hbWUubGVuZ3RoIC0gMSBdID0gb2xkTmFtZVswXS50b1VwcGVyQ2FzZSgpICsgb2xkTmFtZS5zdWJzdHJpbmcoMSlcbiAgfWVsc2V7XG4gICAgX19uYW1lID0gWyBfX25hbWVbMF0udG9VcHBlckNhc2UoKSArIF9fbmFtZS5zdWJzdHJpbmcoMSkgXVxuICB9XG5cbiAgb2JqLl9fbWV0YV9fID0ge1xuICAgIGFkZHJlc3M6J2FkZCcsXG4gICAgbmFtZTpfX25hbWUsXG4gICAgcHJvcGVydGllczpzZXJpYWxpemVkUHJvcGVydGllcywgXG4gICAgaWQ6b2JqLmlkXG4gIH1cblxuICBHaWJiZXJpc2gud29ya2xldC51Z2Vucy5zZXQoIG9iai5pZCwgb2JqIClcblxuICBHaWJiZXJpc2gud29ya2xldC5wb3J0LnBvc3RNZXNzYWdlKCBvYmouX19tZXRhX18gKVxuXG59XG5cbmNvbnN0IF9fcHJveHkgPSBmdW5jdGlvbiggX19uYW1lLCB2YWx1ZXMsIG9iaiApIHtcblxuICBpZiggR2liYmVyaXNoLm1vZGUgPT09ICd3b3JrbGV0JyAmJiBHaWJiZXJpc2gucHJldmVudFByb3h5ID09PSBmYWxzZSApIHtcblxuICAgIG1ha2VBbmRTZW5kT2JqZWN0KCBfX25hbWUsIHZhbHVlcywgb2JqIClcblxuICAgIC8vIHByb3h5IGZvciBhbGwgbWV0aG9kIGNhbGxzIHRvIHNlbmQgdG8gd29ya2xldFxuICAgIGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KCBvYmosIHtcbiAgICAgIGdldCggdGFyZ2V0LCBwcm9wLCByZWNlaXZlciApIHtcbiAgICAgICAgaWYoIHR5cGVvZiB0YXJnZXRbIHByb3AgXSA9PT0gJ2Z1bmN0aW9uJyAmJiBwcm9wLmluZGV4T2YoJ19fJykgPT09IC0xKSB7XG4gICAgICAgICAgY29uc3QgcHJveHkgPSBuZXcgUHJveHkoIHRhcmdldFsgcHJvcCBdLCB7XG4gICAgICAgICAgICBhcHBseSggX190YXJnZXQsIHRoaXNBcmcsIGFyZ3MgKSB7XG5cbiAgICAgICAgICAgICAgaWYoIEdpYmJlcmlzaC5wcm94eUVuYWJsZWQgPT09IHRydWUgKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgX19hcmdzID0gYXJncy5tYXAoIF9fdmFsdWUgPT4gcmVwbGFjZU9iaiggX192YWx1ZSwgdHJ1ZSApIClcbiAgICAgICAgICAgICAgICAvL2lmKCBwcm9wID09PSAnY29ubmVjdCcgKSBjb25zb2xlLmxvZyggJ3Byb3h5IGNvbm5lY3Q6JywgX19hcmdzIClcblxuICAgICAgICAgICAgICAgIEdpYmJlcmlzaC53b3JrbGV0LnBvcnQucG9zdE1lc3NhZ2UoeyBcbiAgICAgICAgICAgICAgICAgIGFkZHJlc3M6J21ldGhvZCcsIFxuICAgICAgICAgICAgICAgICAgb2JqZWN0Om9iai5pZCxcbiAgICAgICAgICAgICAgICAgIG5hbWU6cHJvcCxcbiAgICAgICAgICAgICAgICAgIGFyZ3M6X19hcmdzXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNvbnN0IHRlbXAgPSBHaWJiZXJpc2gucHJveHlFbmFibGVkXG4gICAgICAgICAgICAgIEdpYmJlcmlzaC5wcm94eUVuYWJsZWQgPSBmYWxzZVxuICAgICAgICAgICAgICBjb25zdCBvdXQgPSAgX190YXJnZXQuYXBwbHkoIHRoaXNBcmcsIGFyZ3MgKVxuICAgICAgICAgICAgICBHaWJiZXJpc2gucHJveHlFbmFibGVkID0gdGVtcFxuICAgICAgICAgICAgICByZXR1cm4gb3V0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICBcbiAgICAgICAgICByZXR1cm4gcHJveHlcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YXJnZXRbIHByb3AgXVxuICAgICAgfSxcbiAgICAgIHNldCggdGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIgKSB7XG4gICAgICAgIGlmKCBwcm9wICE9PSAnY29ubmVjdGVkJyAmJiBwcm9wICE9PSAnaW5wdXQnICYmIHByb3AgIT09ICdjYWxsYmFjaycgJiYgcHJvcCAhPT0gJ2lucHV0TmFtZXMnICkge1xuICAgICAgICAgIGlmKCBHaWJiZXJpc2gucHJveHlFbmFibGVkID09PSB0cnVlICkge1xuICAgICAgICAgICAgY29uc3QgX192YWx1ZSA9IHJlcGxhY2VPYmooIHZhbHVlIClcblxuICAgICAgICAgICAgaWYoIF9fdmFsdWUgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgR2liYmVyaXNoLndvcmtsZXQucG9ydC5wb3N0TWVzc2FnZSh7IFxuICAgICAgICAgICAgICAgIGFkZHJlc3M6J3NldCcsIFxuICAgICAgICAgICAgICAgIG9iamVjdDpvYmouaWQsXG4gICAgICAgICAgICAgICAgbmFtZTpwcm9wLFxuICAgICAgICAgICAgICAgIHZhbHVlOl9fdmFsdWVcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0YXJnZXRbIHByb3AgXSA9IHZhbHVlXG5cbiAgICAgICAgLy8gbXVzdCByZXR1cm4gdHJ1ZSBmb3IgYW55IEVTNiBwcm94eSBzZXR0ZXJcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gWFhYIFhYWCBYWFggWFhYIFhYWCBYWFhcbiAgICAvLyBSRU1FTUJFUiBUSEFUIFlPVSBNVVNUIEFTU0lHTkVEIFRIRSBSRVRVUk5FRCBWQUxVRSBUTyBZT1VSIFVHRU4sXG4gICAgLy8gWU9VIENBTk5PVCBVU0UgVEhJUyBGVU5DVElPTiBUTyBNT0RJRlkgQSBVR0VOIElOIFBMQUNFLlxuICAgIC8vIFhYWCBYWFggWFhYIFhYWCBYWFggWFhYXG5cbiAgICByZXR1cm4gcHJveHlcbiAgfWVsc2UgaWYoIEdpYmJlcmlzaC5tb2RlID09PSAncHJvY2Vzc29yJyAmJiBHaWJiZXJpc2gucHJldmVudFByb3h5ID09PSBmYWxzZSApIHtcblxuICAgIGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KCBvYmosIHtcbiAgICAgIC8vZ2V0KCB0YXJnZXQsIHByb3AsIHJlY2VpdmVyICkgeyByZXR1cm4gdGFyZ2V0WyBwcm9wIF0gfSxcbiAgICAgIHNldCggdGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIgKSB7XG4gICAgICAgIGxldCB2YWx1ZVR5cGUgPSB0eXBlb2YgdmFsdWVcbiAgICAgICAgaWYoIHByb3AuaW5kZXhPZignX18nKSA9PT0gLTEgJiYgdmFsdWVUeXBlICE9PSAnZnVuY3Rpb24nICYmIHZhbHVlVHlwZSAhPT0gJ29iamVjdCcgKSB7XG4gICAgICAgICAgaWYoIEdpYmJlcmlzaC5wcm9jZXNzb3IgIT09IHVuZGVmaW5lZCApIHsgXG4gICAgICAgICAgICBHaWJiZXJpc2gucHJvY2Vzc29yLm1lc3NhZ2VzLnB1c2goIG9iai5pZCwgcHJvcCwgdmFsdWUgKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0YXJnZXRbIHByb3AgXSA9IHZhbHVlXG5cbiAgICAgICAgLy8gbXVzdCByZXR1cm4gdHJ1ZSBmb3IgYW55IEVTNiBwcm94eSBzZXR0ZXJcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHByb3h5XG4gIH1cblxuICByZXR1cm4gb2JqXG59XG5cbnJldHVybiBfX3Byb3h5XG5cbn1cbiIsIi8qIGJpZy5qcyB2My4xLjMgaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnLmpzL0xJQ0VOQ0UgKi9cclxuOyhmdW5jdGlvbiAoZ2xvYmFsKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4vKlxyXG4gIGJpZy5qcyB2My4xLjNcclxuICBBIHNtYWxsLCBmYXN0LCBlYXN5LXRvLXVzZSBsaWJyYXJ5IGZvciBhcmJpdHJhcnktcHJlY2lzaW9uIGRlY2ltYWwgYXJpdGhtZXRpYy5cclxuICBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWcuanMvXHJcbiAgQ29weXJpZ2h0IChjKSAyMDE0IE1pY2hhZWwgTWNsYXVnaGxpbiA8TThjaDg4bEBnbWFpbC5jb20+XHJcbiAgTUlUIEV4cGF0IExpY2VuY2VcclxuKi9cclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBFRElUQUJMRSBERUZBVUxUUyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgLy8gVGhlIGRlZmF1bHQgdmFsdWVzIGJlbG93IG11c3QgYmUgaW50ZWdlcnMgd2l0aGluIHRoZSBzdGF0ZWQgcmFuZ2VzLlxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgbWF4aW11bSBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgb2YgdGhlIHJlc3VsdHMgb2Ygb3BlcmF0aW9uc1xyXG4gICAgICogaW52b2x2aW5nIGRpdmlzaW9uOiBkaXYgYW5kIHNxcnQsIGFuZCBwb3cgd2l0aCBuZWdhdGl2ZSBleHBvbmVudHMuXHJcbiAgICAgKi9cclxuICAgIHZhciBEUCA9IDIwLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gTUFYX0RQXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIHJvdW5kaW5nIG1vZGUgdXNlZCB3aGVuIHJvdW5kaW5nIHRvIHRoZSBhYm92ZSBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIDAgVG93YXJkcyB6ZXJvIChpLmUuIHRydW5jYXRlLCBubyByb3VuZGluZykuICAgICAgIChST1VORF9ET1dOKVxyXG4gICAgICAgICAqIDEgVG8gbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCByb3VuZCB1cC4gIChST1VORF9IQUxGX1VQKVxyXG4gICAgICAgICAqIDIgVG8gbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0byBldmVuLiAgIChST1VORF9IQUxGX0VWRU4pXHJcbiAgICAgICAgICogMyBBd2F5IGZyb20gemVyby4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKFJPVU5EX1VQKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFJNID0gMSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCwgMSwgMiBvciAzXHJcblxyXG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIHZhbHVlIG9mIERQIGFuZCBCaWcuRFAuXHJcbiAgICAgICAgTUFYX0RQID0gMUU2LCAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDEwMDAwMDBcclxuXHJcbiAgICAgICAgLy8gVGhlIG1heGltdW0gbWFnbml0dWRlIG9mIHRoZSBleHBvbmVudCBhcmd1bWVudCB0byB0aGUgcG93IG1ldGhvZC5cclxuICAgICAgICBNQVhfUE9XRVIgPSAxRTYsICAgICAgICAgICAgICAgICAgIC8vIDEgdG8gMTAwMDAwMFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYmVuZWF0aCB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICogSmF2YVNjcmlwdCdzIE51bWJlciB0eXBlOiAtN1xyXG4gICAgICAgICAqIC0xMDAwMDAwIGlzIHRoZSBtaW5pbXVtIHJlY29tbWVuZGVkIGV4cG9uZW50IHZhbHVlIG9mIGEgQmlnLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEVfTkVHID0gLTcsICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gLTEwMDAwMDBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGFib3ZlIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKiBKYXZhU2NyaXB0J3MgTnVtYmVyIHR5cGU6IDIxXHJcbiAgICAgICAgICogMTAwMDAwMCBpcyB0aGUgbWF4aW11bSByZWNvbW1lbmRlZCBleHBvbmVudCB2YWx1ZSBvZiBhIEJpZy5cclxuICAgICAgICAgKiAoVGhpcyBsaW1pdCBpcyBub3QgZW5mb3JjZWQgb3IgY2hlY2tlZC4pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgRV9QT1MgPSAyMSwgICAgICAgICAgICAgICAgICAgLy8gMCB0byAxMDAwMDAwXHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAgICAgICAvLyBUaGUgc2hhcmVkIHByb3RvdHlwZSBvYmplY3QuXHJcbiAgICAgICAgUCA9IHt9LFxyXG4gICAgICAgIGlzVmFsaWQgPSAvXi0/KFxcZCsoXFwuXFxkKik/fFxcLlxcZCspKGVbKy1dP1xcZCspPyQvaSxcclxuICAgICAgICBCaWc7XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIEJpZyBjb25zdHJ1Y3Rvci5cclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGJpZ0ZhY3RvcnkoKSB7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIEJpZyBjb25zdHJ1Y3RvciBhbmQgZXhwb3J0ZWQgZnVuY3Rpb24uXHJcbiAgICAgICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgYSBCaWcgbnVtYmVyIG9iamVjdC5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIG4ge251bWJlcnxzdHJpbmd8QmlnfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gQmlnKG4pIHtcclxuICAgICAgICAgICAgdmFyIHggPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgLy8gRW5hYmxlIGNvbnN0cnVjdG9yIHVzYWdlIHdpdGhvdXQgbmV3LlxyXG4gICAgICAgICAgICBpZiAoISh4IGluc3RhbmNlb2YgQmlnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG4gPT09IHZvaWQgMCA/IGJpZ0ZhY3RvcnkoKSA6IG5ldyBCaWcobik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIER1cGxpY2F0ZS5cclxuICAgICAgICAgICAgaWYgKG4gaW5zdGFuY2VvZiBCaWcpIHtcclxuICAgICAgICAgICAgICAgIHgucyA9IG4ucztcclxuICAgICAgICAgICAgICAgIHguZSA9IG4uZTtcclxuICAgICAgICAgICAgICAgIHguYyA9IG4uYy5zbGljZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGFyc2UoeCwgbik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFJldGFpbiBhIHJlZmVyZW5jZSB0byB0aGlzIEJpZyBjb25zdHJ1Y3RvciwgYW5kIHNoYWRvd1xyXG4gICAgICAgICAgICAgKiBCaWcucHJvdG90eXBlLmNvbnN0cnVjdG9yIHdoaWNoIHBvaW50cyB0byBPYmplY3QuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB4LmNvbnN0cnVjdG9yID0gQmlnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmlnLnByb3RvdHlwZSA9IFA7XHJcbiAgICAgICAgQmlnLkRQID0gRFA7XHJcbiAgICAgICAgQmlnLlJNID0gUk07XHJcbiAgICAgICAgQmlnLkVfTkVHID0gRV9ORUc7XHJcbiAgICAgICAgQmlnLkVfUE9TID0gRV9QT1M7XHJcblxyXG4gICAgICAgIHJldHVybiBCaWc7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIFByaXZhdGUgZnVuY3Rpb25zXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiBCaWcgeCBpbiBub3JtYWwgb3IgZXhwb25lbnRpYWxcclxuICAgICAqIG5vdGF0aW9uIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIG9yIHNpZ25pZmljYW50IGRpZ2l0cy5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IFRoZSBCaWcgdG8gZm9ybWF0LlxyXG4gICAgICogZHAge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogdG9FIHtudW1iZXJ9IDEgKHRvRXhwb25lbnRpYWwpLCAyICh0b1ByZWNpc2lvbikgb3IgdW5kZWZpbmVkICh0b0ZpeGVkKS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZm9ybWF0KHgsIGRwLCB0b0UpIHtcclxuICAgICAgICB2YXIgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBpbmRleCAobm9ybWFsIG5vdGF0aW9uKSBvZiB0aGUgZGlnaXQgdGhhdCBtYXkgYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgaSA9IGRwIC0gKHggPSBuZXcgQmlnKHgpKS5lLFxyXG4gICAgICAgICAgICBjID0geC5jO1xyXG5cclxuICAgICAgICAvLyBSb3VuZD9cclxuICAgICAgICBpZiAoYy5sZW5ndGggPiArK2RwKSB7XHJcbiAgICAgICAgICAgIHJuZCh4LCBpLCBCaWcuUk0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFjWzBdKSB7XHJcbiAgICAgICAgICAgICsraTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRvRSkge1xyXG4gICAgICAgICAgICBpID0gZHA7XHJcblxyXG4gICAgICAgIC8vIHRvRml4ZWRcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjID0geC5jO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVjYWxjdWxhdGUgaSBhcyB4LmUgbWF5IGhhdmUgY2hhbmdlZCBpZiB2YWx1ZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBpID0geC5lICsgaSArIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBcHBlbmQgemVyb3M/XHJcbiAgICAgICAgZm9yICg7IGMubGVuZ3RoIDwgaTsgYy5wdXNoKDApKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGkgPSB4LmU7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogdG9QcmVjaXNpb24gcmV0dXJucyBleHBvbmVudGlhbCBub3RhdGlvbiBpZiB0aGUgbnVtYmVyIG9mXHJcbiAgICAgICAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHNwZWNpZmllZCBpcyBsZXNzIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHNcclxuICAgICAgICAgKiBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlIHZhbHVlIGluIG5vcm1hbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJldHVybiB0b0UgPT09IDEgfHwgdG9FICYmIChkcCA8PSBpIHx8IGkgPD0gQmlnLkVfTkVHKSA/XHJcblxyXG4gICAgICAgICAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgICAoeC5zIDwgMCAmJiBjWzBdID8gJy0nIDogJycpICtcclxuICAgICAgICAgICAgKGMubGVuZ3RoID4gMSA/IGNbMF0gKyAnLicgKyBjLmpvaW4oJycpLnNsaWNlKDEpIDogY1swXSkgK1xyXG4gICAgICAgICAgICAgIChpIDwgMCA/ICdlJyA6ICdlKycpICsgaVxyXG5cclxuICAgICAgICAgIC8vIE5vcm1hbCBub3RhdGlvbi5cclxuICAgICAgICAgIDogeC50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUGFyc2UgdGhlIG51bWJlciBvciBzdHJpbmcgdmFsdWUgcGFzc2VkIHRvIGEgQmlnIGNvbnN0cnVjdG9yLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gQSBCaWcgbnVtYmVyIGluc3RhbmNlLlxyXG4gICAgICogbiB7bnVtYmVyfHN0cmluZ30gQSBudW1lcmljIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBwYXJzZSh4LCBuKSB7XHJcbiAgICAgICAgdmFyIGUsIGksIG5MO1xyXG5cclxuICAgICAgICAvLyBNaW51cyB6ZXJvP1xyXG4gICAgICAgIGlmIChuID09PSAwICYmIDEgLyBuIDwgMCkge1xyXG4gICAgICAgICAgICBuID0gJy0wJztcclxuXHJcbiAgICAgICAgLy8gRW5zdXJlIG4gaXMgc3RyaW5nIGFuZCBjaGVjayB2YWxpZGl0eS5cclxuICAgICAgICB9IGVsc2UgaWYgKCFpc1ZhbGlkLnRlc3QobiArPSAnJykpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBzaWduLlxyXG4gICAgICAgIHgucyA9IG4uY2hhckF0KDApID09ICctJyA/IChuID0gbi5zbGljZSgxKSwgLTEpIDogMTtcclxuXHJcbiAgICAgICAgLy8gRGVjaW1hbCBwb2ludD9cclxuICAgICAgICBpZiAoKGUgPSBuLmluZGV4T2YoJy4nKSkgPiAtMSkge1xyXG4gICAgICAgICAgICBuID0gbi5yZXBsYWNlKCcuJywgJycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnRpYWwgZm9ybT9cclxuICAgICAgICBpZiAoKGkgPSBuLnNlYXJjaCgvZS9pKSkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgZXhwb25lbnQuXHJcbiAgICAgICAgICAgIGlmIChlIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZSA9IGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZSArPSArbi5zbGljZShpICsgMSk7XHJcbiAgICAgICAgICAgIG4gPSBuLnN1YnN0cmluZygwLCBpKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChlIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gSW50ZWdlci5cclxuICAgICAgICAgICAgZSA9IG4ubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChpID0gMDsgbi5jaGFyQXQoaSkgPT0gJzAnOyBpKyspIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpID09IChuTCA9IG4ubGVuZ3RoKSkge1xyXG5cclxuICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgeC5jID0gWyB4LmUgPSAwIF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICg7IG4uY2hhckF0KC0tbkwpID09ICcwJzspIHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgeC5lID0gZSAtIGkgLSAxO1xyXG4gICAgICAgICAgICB4LmMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIC8vIENvbnZlcnQgc3RyaW5nIHRvIGFycmF5IG9mIGRpZ2l0cyB3aXRob3V0IGxlYWRpbmcvdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoZSA9IDA7IGkgPD0gbkw7IHguY1tlKytdID0gK24uY2hhckF0KGkrKykpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSb3VuZCBCaWcgeCB0byBhIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS5cclxuICAgICAqIENhbGxlZCBieSBkaXYsIHNxcnQgYW5kIHJvdW5kLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gVGhlIEJpZyB0byByb3VuZC5cclxuICAgICAqIGRwIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIHJtIHtudW1iZXJ9IDAsIDEsIDIgb3IgMyAoRE9XTiwgSEFMRl9VUCwgSEFMRl9FVkVOLCBVUClcclxuICAgICAqIFttb3JlXSB7Ym9vbGVhbn0gV2hldGhlciB0aGUgcmVzdWx0IG9mIGRpdmlzaW9uIHdhcyB0cnVuY2F0ZWQuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJuZCh4LCBkcCwgcm0sIG1vcmUpIHtcclxuICAgICAgICB2YXIgdSxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIGkgPSB4LmUgKyBkcCArIDE7XHJcblxyXG4gICAgICAgIGlmIChybSA9PT0gMSkge1xyXG5cclxuICAgICAgICAgICAgLy8geGNbaV0gaXMgdGhlIGRpZ2l0IGFmdGVyIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBtb3JlID0geGNbaV0gPj0gNTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJtID09PSAyKSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSB4Y1tpXSA+IDUgfHwgeGNbaV0gPT0gNSAmJlxyXG4gICAgICAgICAgICAgIChtb3JlIHx8IGkgPCAwIHx8IHhjW2kgKyAxXSAhPT0gdSB8fCB4Y1tpIC0gMV0gJiAxKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJtID09PSAzKSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSBtb3JlIHx8IHhjW2ldICE9PSB1IHx8IGkgPCAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChybSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIoJyFCaWcuUk0hJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpIDwgMSB8fCAheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChtb3JlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gMSwgMC4xLCAwLjAxLCAwLjAwMSwgMC4wMDAxIGV0Yy5cclxuICAgICAgICAgICAgICAgIHguZSA9IC1kcDtcclxuICAgICAgICAgICAgICAgIHguYyA9IFsxXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICAgICAgeC5jID0gW3guZSA9IDBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBhbnkgZGlnaXRzIGFmdGVyIHRoZSByZXF1aXJlZCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgICAgeGMubGVuZ3RoID0gaS0tO1xyXG5cclxuICAgICAgICAgICAgLy8gUm91bmQgdXA/XHJcbiAgICAgICAgICAgIGlmIChtb3JlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUm91bmRpbmcgdXAgbWF5IG1lYW4gdGhlIHByZXZpb3VzIGRpZ2l0IGhhcyB0byBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICAgICAgZm9yICg7ICsreGNbaV0gPiA5Oykge1xyXG4gICAgICAgICAgICAgICAgICAgIHhjW2ldID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyt4LmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhjLnVuc2hpZnQoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoaSA9IHhjLmxlbmd0aDsgIXhjWy0taV07IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhyb3cgYSBCaWdFcnJvci5cclxuICAgICAqXHJcbiAgICAgKiBtZXNzYWdlIHtzdHJpbmd9IFRoZSBlcnJvciBtZXNzYWdlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB0aHJvd0VycihtZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcclxuICAgICAgICBlcnIubmFtZSA9ICdCaWdFcnJvcic7XHJcblxyXG4gICAgICAgIHRocm93IGVycjtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUHJvdG90eXBlL2luc3RhbmNlIG1ldGhvZHNcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoaXMgQmlnLlxyXG4gICAgICovXHJcbiAgICBQLmFicyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgeCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpO1xyXG4gICAgICAgIHgucyA9IDE7XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVyblxyXG4gICAgICogMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIC0xIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LCBvclxyXG4gICAgICogMCBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgdmFsdWUuXHJcbiAgICAqL1xyXG4gICAgUC5jbXAgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB4TmVnLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHljID0gKHkgPSBuZXcgeC5jb25zdHJ1Y3Rvcih5KSkuYyxcclxuICAgICAgICAgICAgaSA9IHgucyxcclxuICAgICAgICAgICAgaiA9IHkucyxcclxuICAgICAgICAgICAgayA9IHguZSxcclxuICAgICAgICAgICAgbCA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICF4Y1swXSA/ICF5Y1swXSA/IDAgOiAtaiA6IGk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGkgIT0gaikge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgeE5lZyA9IGkgPCAwO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGV4cG9uZW50cy5cclxuICAgICAgICBpZiAoayAhPSBsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBrID4gbCBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpID0gLTE7XHJcbiAgICAgICAgaiA9IChrID0geGMubGVuZ3RoKSA8IChsID0geWMubGVuZ3RoKSA/IGsgOiBsO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgIGZvciAoOyArK2kgPCBqOykge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhjW2ldICE9IHljW2ldKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geGNbaV0gPiB5Y1tpXSBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgbGVuZ3Rocy5cclxuICAgICAgICByZXR1cm4gayA9PSBsID8gMCA6IGsgPiBsIF4geE5lZyA/IDEgOiAtMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBkaXZpZGVkIGJ5IHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHksIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsXHJcbiAgICAgKiBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKi9cclxuICAgIFAuZGl2ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIC8vIGRpdmlkZW5kXHJcbiAgICAgICAgICAgIGR2ZCA9IHguYyxcclxuICAgICAgICAgICAgLy9kaXZpc29yXHJcbiAgICAgICAgICAgIGR2cyA9ICh5ID0gbmV3IEJpZyh5KSkuYyxcclxuICAgICAgICAgICAgcyA9IHgucyA9PSB5LnMgPyAxIDogLTEsXHJcbiAgICAgICAgICAgIGRwID0gQmlnLkRQO1xyXG5cclxuICAgICAgICBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchQmlnLkRQIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIDA/XHJcbiAgICAgICAgaWYgKCFkdmRbMF0gfHwgIWR2c1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgYm90aCBhcmUgMCwgdGhyb3cgTmFOXHJcbiAgICAgICAgICAgIGlmIChkdmRbMF0gPT0gZHZzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBkdnMgaXMgMCwgdGhyb3cgKy1JbmZpbml0eS5cclxuICAgICAgICAgICAgaWYgKCFkdnNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKHMgLyAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gZHZkIGlzIDAsIHJldHVybiArLTAuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHMgKiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBkdnNMLCBkdnNULCBuZXh0LCBjbXAsIHJlbUksIHUsXHJcbiAgICAgICAgICAgIGR2c1ogPSBkdnMuc2xpY2UoKSxcclxuICAgICAgICAgICAgZHZkSSA9IGR2c0wgPSBkdnMubGVuZ3RoLFxyXG4gICAgICAgICAgICBkdmRMID0gZHZkLmxlbmd0aCxcclxuICAgICAgICAgICAgLy8gcmVtYWluZGVyXHJcbiAgICAgICAgICAgIHJlbSA9IGR2ZC5zbGljZSgwLCBkdnNMKSxcclxuICAgICAgICAgICAgcmVtTCA9IHJlbS5sZW5ndGgsXHJcbiAgICAgICAgICAgIC8vIHF1b3RpZW50XHJcbiAgICAgICAgICAgIHEgPSB5LFxyXG4gICAgICAgICAgICBxYyA9IHEuYyA9IFtdLFxyXG4gICAgICAgICAgICBxaSA9IDAsXHJcbiAgICAgICAgICAgIGRpZ2l0cyA9IGRwICsgKHEuZSA9IHguZSAtIHkuZSkgKyAxO1xyXG5cclxuICAgICAgICBxLnMgPSBzO1xyXG4gICAgICAgIHMgPSBkaWdpdHMgPCAwID8gMCA6IGRpZ2l0cztcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIHZlcnNpb24gb2YgZGl2aXNvciB3aXRoIGxlYWRpbmcgemVyby5cclxuICAgICAgICBkdnNaLnVuc2hpZnQoMCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCB6ZXJvcyB0byBtYWtlIHJlbWFpbmRlciBhcyBsb25nIGFzIGRpdmlzb3IuXHJcbiAgICAgICAgZm9yICg7IHJlbUwrKyA8IGR2c0w7IHJlbS5wdXNoKDApKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkbyB7XHJcblxyXG4gICAgICAgICAgICAvLyAnbmV4dCcgaXMgaG93IG1hbnkgdGltZXMgdGhlIGRpdmlzb3IgZ29lcyBpbnRvIGN1cnJlbnQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBmb3IgKG5leHQgPSAwOyBuZXh0IDwgMTA7IG5leHQrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgZGl2aXNvciBhbmQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGR2c0wgIT0gKHJlbUwgPSByZW0ubGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNtcCA9IGR2c0wgPiByZW1MID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChyZW1JID0gLTEsIGNtcCA9IDA7ICsrcmVtSSA8IGR2c0w7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHZzW3JlbUldICE9IHJlbVtyZW1JXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY21wID0gZHZzW3JlbUldID4gcmVtW3JlbUldID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgZGl2aXNvciA8IHJlbWFpbmRlciwgc3VidHJhY3QgZGl2aXNvciBmcm9tIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIGlmIChjbXAgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbWFpbmRlciBjYW4ndCBiZSBtb3JlIHRoYW4gMSBkaWdpdCBsb25nZXIgdGhhbiBkaXZpc29yLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEVxdWFsaXNlIGxlbmd0aHMgdXNpbmcgZGl2aXNvciB3aXRoIGV4dHJhIGxlYWRpbmcgemVybz9cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGR2c1QgPSByZW1MID09IGR2c0wgPyBkdnMgOiBkdnNaOyByZW1MOykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbVstLXJlbUxdIDwgZHZzVFtyZW1MXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtSSA9IHJlbUw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICg7IHJlbUkgJiYgIXJlbVstLXJlbUldOyByZW1bcmVtSV0gPSA5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAtLXJlbVtyZW1JXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbVtyZW1MXSArPSAxMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1bcmVtTF0gLT0gZHZzVFtyZW1MXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICg7ICFyZW1bMF07IHJlbS5zaGlmdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRoZSAnbmV4dCcgZGlnaXQgdG8gdGhlIHJlc3VsdCBhcnJheS5cclxuICAgICAgICAgICAgcWNbcWkrK10gPSBjbXAgPyBuZXh0IDogKytuZXh0O1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGlmIChyZW1bMF0gJiYgY21wKSB7XHJcbiAgICAgICAgICAgICAgICByZW1bcmVtTF0gPSBkdmRbZHZkSV0gfHwgMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlbSA9IFsgZHZkW2R2ZEldIF07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSB3aGlsZSAoKGR2ZEkrKyA8IGR2ZEwgfHwgcmVtWzBdICE9PSB1KSAmJiBzLS0pO1xyXG5cclxuICAgICAgICAvLyBMZWFkaW5nIHplcm8/IERvIG5vdCByZW1vdmUgaWYgcmVzdWx0IGlzIHNpbXBseSB6ZXJvIChxaSA9PSAxKS5cclxuICAgICAgICBpZiAoIXFjWzBdICYmIHFpICE9IDEpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZXJlIGNhbid0IGJlIG1vcmUgdGhhbiBvbmUgemVyby5cclxuICAgICAgICAgICAgcWMuc2hpZnQoKTtcclxuICAgICAgICAgICAgcS5lLS07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSb3VuZD9cclxuICAgICAgICBpZiAocWkgPiBkaWdpdHMpIHtcclxuICAgICAgICAgICAgcm5kKHEsIGRwLCBCaWcuUk0sIHJlbVswXSAhPT0gdSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZXF1YWwgdG8gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZXEgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5jbXAoeSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5ndCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpID4gMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmd0ZSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpID4gLTE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5sdCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmx0ZSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA8IDE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgbWludXMgdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5zdWIgPSBQLm1pbnVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgaSwgaiwgdCwgeExUeSxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoYSAhPSBiKSB7XHJcbiAgICAgICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgICAgICByZXR1cm4geC5wbHVzKHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHhjID0geC5jLnNsaWNlKCksXHJcbiAgICAgICAgICAgIHhlID0geC5lLFxyXG4gICAgICAgICAgICB5YyA9IHkuYyxcclxuICAgICAgICAgICAgeWUgPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB5IGlzIG5vbi16ZXJvPyB4IGlzIG5vbi16ZXJvPyBPciBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgICByZXR1cm4geWNbMF0gPyAoeS5zID0gLWIsIHkpIDogbmV3IEJpZyh4Y1swXSA/IHggOiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSB3aGljaCBpcyB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgICBpZiAoYSA9IHhlIC0geWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh4TFR5ID0gYSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHllID0geGU7XHJcbiAgICAgICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGIgPSBhOyBiLS07IHQucHVzaCgwKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBFeHBvbmVudHMgZXF1YWwuIENoZWNrIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgICAgICBqID0gKCh4TFR5ID0geGMubGVuZ3RoIDwgeWMubGVuZ3RoKSA/IHhjIDogeWMpLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGZvciAoYSA9IGIgPSAwOyBiIDwgajsgYisrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHhjW2JdICE9IHljW2JdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeExUeSA9IHhjW2JdIDwgeWNbYl07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHggPCB5PyBQb2ludCB4YyB0byB0aGUgYXJyYXkgb2YgdGhlIGJpZ2dlciBudW1iZXIuXHJcbiAgICAgICAgaWYgKHhMVHkpIHtcclxuICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IHQ7XHJcbiAgICAgICAgICAgIHkucyA9IC15LnM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIEFwcGVuZCB6ZXJvcyB0byB4YyBpZiBzaG9ydGVyLiBObyBuZWVkIHRvIGFkZCB6ZXJvcyB0byB5YyBpZiBzaG9ydGVyXHJcbiAgICAgICAgICogYXMgc3VidHJhY3Rpb24gb25seSBuZWVkcyB0byBzdGFydCBhdCB5Yy5sZW5ndGguXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKCggYiA9IChqID0geWMubGVuZ3RoKSAtIChpID0geGMubGVuZ3RoKSApID4gMCkge1xyXG5cclxuICAgICAgICAgICAgZm9yICg7IGItLTsgeGNbaSsrXSA9IDApIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU3VidHJhY3QgeWMgZnJvbSB4Yy5cclxuICAgICAgICBmb3IgKGIgPSBpOyBqID4gYTspe1xyXG5cclxuICAgICAgICAgICAgaWYgKHhjWy0tal0gPCB5Y1tqXSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IGo7IGkgJiYgIXhjWy0taV07IHhjW2ldID0gOSkge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLS14Y1tpXTtcclxuICAgICAgICAgICAgICAgIHhjW2pdICs9IDEwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHhjW2pdIC09IHljW2pdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoOyB4Y1stLWJdID09PSAwOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGxlYWRpbmcgemVyb3MgYW5kIGFkanVzdCBleHBvbmVudCBhY2NvcmRpbmdseS5cclxuICAgICAgICBmb3IgKDsgeGNbMF0gPT09IDA7KSB7XHJcbiAgICAgICAgICAgIHhjLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIC0teWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXhjWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBuIC0gbiA9ICswXHJcbiAgICAgICAgICAgIHkucyA9IDE7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXN1bHQgbXVzdCBiZSB6ZXJvLlxyXG4gICAgICAgICAgICB4YyA9IFt5ZSA9IDBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeS5jID0geGM7XHJcbiAgICAgICAgeS5lID0geWU7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIG1vZHVsbyB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLm1vZCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHlHVHgsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICBpZiAoIXkuY1swXSkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeC5zID0geS5zID0gMTtcclxuICAgICAgICB5R1R4ID0geS5jbXAoeCkgPT0gMTtcclxuICAgICAgICB4LnMgPSBhO1xyXG4gICAgICAgIHkucyA9IGI7XHJcblxyXG4gICAgICAgIGlmICh5R1R4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYSA9IEJpZy5EUDtcclxuICAgICAgICBiID0gQmlnLlJNO1xyXG4gICAgICAgIEJpZy5EUCA9IEJpZy5STSA9IDA7XHJcbiAgICAgICAgeCA9IHguZGl2KHkpO1xyXG4gICAgICAgIEJpZy5EUCA9IGE7XHJcbiAgICAgICAgQmlnLlJNID0gYjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWludXMoIHgudGltZXMoeSkgKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBwbHVzIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAuYWRkID0gUC5wbHVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgdCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoYSAhPSBiKSB7XHJcbiAgICAgICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgICAgICByZXR1cm4geC5taW51cyh5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB4ZSA9IHguZSxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHllID0geS5lLFxyXG4gICAgICAgICAgICB5YyA9IHkuYztcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHkgaXMgbm9uLXplcm8/IHggaXMgbm9uLXplcm8/IE9yIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgIHJldHVybiB5Y1swXSA/IHkgOiBuZXcgQmlnKHhjWzBdID8geCA6IGEgKiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgeGMgPSB4Yy5zbGljZSgpO1xyXG5cclxuICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgICAvLyBOb3RlOiBGYXN0ZXIgdG8gdXNlIHJldmVyc2UgdGhlbiBkbyB1bnNoaWZ0cy5cclxuICAgICAgICBpZiAoYSA9IHhlIC0geWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChhID4gMCkge1xyXG4gICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIGZvciAoOyBhLS07IHQucHVzaCgwKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUG9pbnQgeGMgdG8gdGhlIGxvbmdlciBhcnJheS5cclxuICAgICAgICBpZiAoeGMubGVuZ3RoIC0geWMubGVuZ3RoIDwgMCkge1xyXG4gICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIHljID0geGM7XHJcbiAgICAgICAgICAgIHhjID0gdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgYSA9IHljLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBPbmx5IHN0YXJ0IGFkZGluZyBhdCB5Yy5sZW5ndGggLSAxIGFzIHRoZSBmdXJ0aGVyIGRpZ2l0cyBvZiB4YyBjYW4gYmVcclxuICAgICAgICAgKiBsZWZ0IGFzIHRoZXkgYXJlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZvciAoYiA9IDA7IGE7KSB7XHJcbiAgICAgICAgICAgIGIgPSAoeGNbLS1hXSA9IHhjW2FdICsgeWNbYV0gKyBiKSAvIDEwIHwgMDtcclxuICAgICAgICAgICAgeGNbYV0gJT0gMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBObyBuZWVkIHRvIGNoZWNrIGZvciB6ZXJvLCBhcyAreCArICt5ICE9IDAgJiYgLXggKyAteSAhPSAwXHJcblxyXG4gICAgICAgIGlmIChiKSB7XHJcbiAgICAgICAgICAgIHhjLnVuc2hpZnQoYik7XHJcbiAgICAgICAgICAgICsreWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoYSA9IHhjLmxlbmd0aDsgeGNbLS1hXSA9PT0gMDsgeGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHkuYyA9IHhjO1xyXG4gICAgICAgIHkuZSA9IHllO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJhaXNlZCB0byB0aGUgcG93ZXIgbi5cclxuICAgICAqIElmIG4gaXMgbmVnYXRpdmUsIHJvdW5kLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbFxyXG4gICAgICogcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIG4ge251bWJlcn0gSW50ZWdlciwgLU1BWF9QT1dFUiB0byBNQVhfUE9XRVIgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnBvdyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBvbmUgPSBuZXcgeC5jb25zdHJ1Y3RvcigxKSxcclxuICAgICAgICAgICAgeSA9IG9uZSxcclxuICAgICAgICAgICAgaXNOZWcgPSBuIDwgMDtcclxuXHJcbiAgICAgICAgaWYgKG4gIT09IH5+biB8fCBuIDwgLU1BWF9QT1dFUiB8fCBuID4gTUFYX1BPV0VSKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchcG93IScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbiA9IGlzTmVnID8gLW4gOiBuO1xyXG5cclxuICAgICAgICBmb3IgKDs7KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobiAmIDEpIHtcclxuICAgICAgICAgICAgICAgIHkgPSB5LnRpbWVzKHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG4gPj49IDE7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW4pIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHggPSB4LnRpbWVzKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGlzTmVnID8gb25lLmRpdih5KSA6IHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcm91bmRlZCB0byBhXHJcbiAgICAgKiBtYXhpbXVtIG9mIGRwIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgcm0uXHJcbiAgICAgKiBJZiBkcCBpcyBub3Qgc3BlY2lmaWVkLCByb3VuZCB0byAwIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICogSWYgcm0gaXMgbm90IHNwZWNpZmllZCwgdXNlIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIFtybV0gMCwgMSwgMiBvciAzIChST1VORF9ET1dOLCBST1VORF9IQUxGX1VQLCBST1VORF9IQUxGX0VWRU4sIFJPVU5EX1VQKVxyXG4gICAgICovXHJcbiAgICBQLnJvdW5kID0gZnVuY3Rpb24gKGRwLCBybSkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgZHAgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchcm91bmQhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJuZCh4ID0gbmV3IEJpZyh4KSwgZHAsIHJtID09IG51bGwgPyBCaWcuUk0gOiBybSk7XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHNxdWFyZSByb290IG9mIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyxcclxuICAgICAqIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsIHBsYWNlcyB1c2luZ1xyXG4gICAgICogcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKi9cclxuICAgIFAuc3FydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZXN0aW1hdGUsIHIsIGFwcHJveCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICBpID0geC5zLFxyXG4gICAgICAgICAgICBlID0geC5lLFxyXG4gICAgICAgICAgICBoYWxmID0gbmV3IEJpZygnMC41Jyk7XHJcblxyXG4gICAgICAgIC8vIFplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIG5lZ2F0aXZlLCB0aHJvdyBOYU4uXHJcbiAgICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFc3RpbWF0ZS5cclxuICAgICAgICBpID0gTWF0aC5zcXJ0KHgudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIC8vIE1hdGguc3FydCB1bmRlcmZsb3cvb3ZlcmZsb3c/XHJcbiAgICAgICAgLy8gUGFzcyB4IHRvIE1hdGguc3FydCBhcyBpbnRlZ2VyLCB0aGVuIGFkanVzdCB0aGUgcmVzdWx0IGV4cG9uZW50LlxyXG4gICAgICAgIGlmIChpID09PSAwIHx8IGkgPT09IDEgLyAwKSB7XHJcbiAgICAgICAgICAgIGVzdGltYXRlID0geGMuam9pbignJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIShlc3RpbWF0ZS5sZW5ndGggKyBlICYgMSkpIHtcclxuICAgICAgICAgICAgICAgIGVzdGltYXRlICs9ICcwJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgciA9IG5ldyBCaWcoIE1hdGguc3FydChlc3RpbWF0ZSkudG9TdHJpbmcoKSApO1xyXG4gICAgICAgICAgICByLmUgPSAoKGUgKyAxKSAvIDIgfCAwKSAtIChlIDwgMCB8fCBlICYgMSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgciA9IG5ldyBCaWcoaS50b1N0cmluZygpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSByLmUgKyAoQmlnLkRQICs9IDQpO1xyXG5cclxuICAgICAgICAvLyBOZXd0b24tUmFwaHNvbiBpdGVyYXRpb24uXHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBhcHByb3ggPSByO1xyXG4gICAgICAgICAgICByID0gaGFsZi50aW1lcyggYXBwcm94LnBsdXMoIHguZGl2KGFwcHJveCkgKSApO1xyXG4gICAgICAgIH0gd2hpbGUgKCBhcHByb3guYy5zbGljZSgwLCBpKS5qb2luKCcnKSAhPT1cclxuICAgICAgICAgICAgICAgICAgICAgICByLmMuc2xpY2UoMCwgaSkuam9pbignJykgKTtcclxuXHJcbiAgICAgICAgcm5kKHIsIEJpZy5EUCAtPSA0LCBCaWcuUk0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyB0aW1lcyB0aGUgdmFsdWUgb2ZcclxuICAgICAqIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLm11bCA9IFAudGltZXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciBjLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHljID0gKHkgPSBuZXcgQmlnKHkpKS5jLFxyXG4gICAgICAgICAgICBhID0geGMubGVuZ3RoLFxyXG4gICAgICAgICAgICBiID0geWMubGVuZ3RoLFxyXG4gICAgICAgICAgICBpID0geC5lLFxyXG4gICAgICAgICAgICBqID0geS5lO1xyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgc2lnbiBvZiByZXN1bHQuXHJcbiAgICAgICAgeS5zID0geC5zID09IHkucyA/IDEgOiAtMTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHNpZ25lZCAwIGlmIGVpdGhlciAwLlxyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHkucyAqIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGlzZSBleHBvbmVudCBvZiByZXN1bHQgYXMgeC5lICsgeS5lLlxyXG4gICAgICAgIHkuZSA9IGkgKyBqO1xyXG5cclxuICAgICAgICAvLyBJZiBhcnJheSB4YyBoYXMgZmV3ZXIgZGlnaXRzIHRoYW4geWMsIHN3YXAgeGMgYW5kIHljLCBhbmQgbGVuZ3Rocy5cclxuICAgICAgICBpZiAoYSA8IGIpIHtcclxuICAgICAgICAgICAgYyA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IGM7XHJcbiAgICAgICAgICAgIGogPSBhO1xyXG4gICAgICAgICAgICBhID0gYjtcclxuICAgICAgICAgICAgYiA9IGo7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXNlIGNvZWZmaWNpZW50IGFycmF5IG9mIHJlc3VsdCB3aXRoIHplcm9zLlxyXG4gICAgICAgIGZvciAoYyA9IG5ldyBBcnJheShqID0gYSArIGIpOyBqLS07IGNbal0gPSAwKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBNdWx0aXBseS5cclxuXHJcbiAgICAgICAgLy8gaSBpcyBpbml0aWFsbHkgeGMubGVuZ3RoLlxyXG4gICAgICAgIGZvciAoaSA9IGI7IGktLTspIHtcclxuICAgICAgICAgICAgYiA9IDA7XHJcblxyXG4gICAgICAgICAgICAvLyBhIGlzIHljLmxlbmd0aC5cclxuICAgICAgICAgICAgZm9yIChqID0gYSArIGk7IGogPiBpOykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEN1cnJlbnQgc3VtIG9mIHByb2R1Y3RzIGF0IHRoaXMgZGlnaXQgcG9zaXRpb24sIHBsdXMgY2FycnkuXHJcbiAgICAgICAgICAgICAgICBiID0gY1tqXSArIHljW2ldICogeGNbaiAtIGkgLSAxXSArIGI7XHJcbiAgICAgICAgICAgICAgICBjW2otLV0gPSBiICUgMTA7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY2FycnlcclxuICAgICAgICAgICAgICAgIGIgPSBiIC8gMTAgfCAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNbal0gPSAoY1tqXSArIGIpICUgMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbmNyZW1lbnQgcmVzdWx0IGV4cG9uZW50IGlmIHRoZXJlIGlzIGEgZmluYWwgY2FycnkuXHJcbiAgICAgICAgaWYgKGIpIHtcclxuICAgICAgICAgICAgKyt5LmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgYW55IGxlYWRpbmcgemVyby5cclxuICAgICAgICBpZiAoIWNbMF0pIHtcclxuICAgICAgICAgICAgYy5zaGlmdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoaSA9IGMubGVuZ3RoOyAhY1stLWldOyBjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHkuYyA9IGM7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnLlxyXG4gICAgICogUmV0dXJuIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoaXMgQmlnIGhhcyBhIHBvc2l0aXZlIGV4cG9uZW50IGVxdWFsIHRvXHJcbiAgICAgKiBvciBncmVhdGVyIHRoYW4gQmlnLkVfUE9TLCBvciBhIG5lZ2F0aXZlIGV4cG9uZW50IGVxdWFsIHRvIG9yIGxlc3MgdGhhblxyXG4gICAgICogQmlnLkVfTkVHLlxyXG4gICAgICovXHJcbiAgICBQLnRvU3RyaW5nID0gUC52YWx1ZU9mID0gUC50b0pTT04gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBlID0geC5lLFxyXG4gICAgICAgICAgICBzdHIgPSB4LmMuam9pbignJyksXHJcbiAgICAgICAgICAgIHN0ckwgPSBzdHIubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBFeHBvbmVudGlhbCBub3RhdGlvbj9cclxuICAgICAgICBpZiAoZSA8PSBCaWcuRV9ORUcgfHwgZSA+PSBCaWcuRV9QT1MpIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArIChzdHJMID4gMSA/ICcuJyArIHN0ci5zbGljZSgxKSA6ICcnKSArXHJcbiAgICAgICAgICAgICAgKGUgPCAwID8gJ2UnIDogJ2UrJykgKyBlO1xyXG5cclxuICAgICAgICAvLyBOZWdhdGl2ZSBleHBvbmVudD9cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmVwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKDsgKytlOyBzdHIgPSAnMCcgKyBzdHIpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdHIgPSAnMC4nICsgc3RyO1xyXG5cclxuICAgICAgICAvLyBQb3NpdGl2ZSBleHBvbmVudD9cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoKytlID4gc3RyTCkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFwcGVuZCB6ZXJvcy5cclxuICAgICAgICAgICAgICAgIGZvciAoZSAtPSBzdHJMOyBlLS0gOyBzdHIgKz0gJzAnKSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZSA8IHN0ckwpIHtcclxuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5zbGljZSgwLCBlKSArICcuJyArIHN0ci5zbGljZShlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFeHBvbmVudCB6ZXJvLlxyXG4gICAgICAgIH0gZWxzZSBpZiAoc3RyTCA+IDEpIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArICcuJyArIHN0ci5zbGljZSgxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEF2b2lkICctMCdcclxuICAgICAgICByZXR1cm4geC5zIDwgMCAmJiB4LmNbMF0gPyAnLScgKyBzdHIgOiBzdHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICogSWYgdG9FeHBvbmVudGlhbCwgdG9GaXhlZCwgdG9QcmVjaXNpb24gYW5kIGZvcm1hdCBhcmUgbm90IHJlcXVpcmVkIHRoZXlcclxuICAgICAqIGNhbiBzYWZlbHkgYmUgY29tbWVudGVkLW91dCBvciBkZWxldGVkLiBObyByZWR1bmRhbnQgY29kZSB3aWxsIGJlIGxlZnQuXHJcbiAgICAgKiBmb3JtYXQgaXMgdXNlZCBvbmx5IGJ5IHRvRXhwb25lbnRpYWwsIHRvRml4ZWQgYW5kIHRvUHJlY2lzaW9uLlxyXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICovXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpbiBleHBvbmVudGlhbFxyXG4gICAgICogbm90YXRpb24gdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgYW5kIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdXNpbmdcclxuICAgICAqIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b0V4cG9uZW50aWFsID0gZnVuY3Rpb24gKGRwKSB7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGRwID0gdGhpcy5jLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b0V4cCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmb3JtYXQodGhpcywgZHAsIDEpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGluIG5vcm1hbCBub3RhdGlvblxyXG4gICAgICogdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgYW5kIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdXNpbmcgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvRml4ZWQgPSBmdW5jdGlvbiAoZHApIHtcclxuICAgICAgICB2YXIgc3RyLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgbmVnID0gQmlnLkVfTkVHLFxyXG4gICAgICAgICAgICBwb3MgPSBCaWcuRV9QT1M7XHJcblxyXG4gICAgICAgIC8vIFByZXZlbnQgdGhlIHBvc3NpYmlsaXR5IG9mIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgIEJpZy5FX05FRyA9IC0oQmlnLkVfUE9TID0gMSAvIDApO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBzdHIgPSB4LnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCA9PT0gfn5kcCAmJiBkcCA+PSAwICYmIGRwIDw9IE1BWF9EUCkge1xyXG4gICAgICAgICAgICBzdHIgPSBmb3JtYXQoeCwgeC5lICsgZHApO1xyXG5cclxuICAgICAgICAgICAgLy8gKC0wKS50b0ZpeGVkKCkgaXMgJzAnLCBidXQgKC0wLjEpLnRvRml4ZWQoKSBpcyAnLTAnLlxyXG4gICAgICAgICAgICAvLyAoLTApLnRvRml4ZWQoMSkgaXMgJzAuMCcsIGJ1dCAoLTAuMDEpLnRvRml4ZWQoMSkgaXMgJy0wLjAnLlxyXG4gICAgICAgICAgICBpZiAoeC5zIDwgMCAmJiB4LmNbMF0gJiYgc3RyLmluZGV4T2YoJy0nKSA8IDApIHtcclxuICAgICAgICAvL0UuZy4gLTAuNSBpZiByb3VuZGVkIHRvIC0wIHdpbGwgY2F1c2UgdG9TdHJpbmcgdG8gb21pdCB0aGUgbWludXMgc2lnbi5cclxuICAgICAgICAgICAgICAgIHN0ciA9ICctJyArIHN0cjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBCaWcuRV9ORUcgPSBuZWc7XHJcbiAgICAgICAgQmlnLkVfUE9TID0gcG9zO1xyXG5cclxuICAgICAgICBpZiAoIXN0cikge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvRml4IScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIHNkXHJcbiAgICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgQmlnLlJNLiBVc2UgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgc2QgaXMgbGVzc1xyXG4gICAgICogdGhhbiB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlXHJcbiAgICAgKiB2YWx1ZSBpbiBub3JtYWwgbm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogc2Qge251bWJlcn0gSW50ZWdlciwgMSB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvUHJlY2lzaW9uID0gZnVuY3Rpb24gKHNkKSB7XHJcblxyXG4gICAgICAgIGlmIChzZCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZCAhPT0gfn5zZCB8fCBzZCA8IDEgfHwgc2QgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b1ByZSEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmb3JtYXQodGhpcywgc2QgLSAxLCAyKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vIEV4cG9ydFxyXG5cclxuXHJcbiAgICBCaWcgPSBiaWdGYWN0b3J5KCk7XHJcblxyXG4gICAgLy9BTUQuXHJcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJpZztcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAvLyBOb2RlIGFuZCBvdGhlciBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMuXHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBCaWc7XHJcblxyXG4gICAgLy9Ccm93c2VyLlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBnbG9iYWwuQmlnID0gQmlnO1xyXG4gICAgfVxyXG59KSh0aGlzKTtcclxuIiwiLypcbkNvcHlyaWdodCAoYykgMjAxNCwgWWFob28hIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbkNvcHlyaWdodHMgbGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgTGljZW5zZS5cblNlZSB0aGUgYWNjb21wYW55aW5nIExJQ0VOU0UgZmlsZSBmb3IgdGVybXMuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIEdlbmVyYXRlIGFuIGludGVybmFsIFVJRCB0byBtYWtlIHRoZSByZWdleHAgcGF0dGVybiBoYXJkZXIgdG8gZ3Vlc3MuXG52YXIgVUlEICAgICAgICAgICAgICAgICA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwMDApLnRvU3RyaW5nKDE2KTtcbnZhciBQTEFDRV9IT0xERVJfUkVHRVhQID0gbmV3IFJlZ0V4cCgnXCJAX18oRnxSfEQpLScgKyBVSUQgKyAnLShcXFxcZCspX19AXCInLCAnZycpO1xuXG52YXIgSVNfTkFUSVZFX0NPREVfUkVHRVhQID0gL1xce1xccypcXFtuYXRpdmUgY29kZVxcXVxccypcXH0vZztcbnZhciBVTlNBRkVfQ0hBUlNfUkVHRVhQICAgPSAvWzw+XFwvXFx1MjAyOFxcdTIwMjldL2c7XG5cbi8vIE1hcHBpbmcgb2YgdW5zYWZlIEhUTUwgYW5kIGludmFsaWQgSmF2YVNjcmlwdCBsaW5lIHRlcm1pbmF0b3IgY2hhcnMgdG8gdGhlaXJcbi8vIFVuaWNvZGUgY2hhciBjb3VudGVycGFydHMgd2hpY2ggYXJlIHNhZmUgdG8gdXNlIGluIEphdmFTY3JpcHQgc3RyaW5ncy5cbnZhciBFU0NBUEVEX0NIQVJTID0ge1xuICAgICc8JyAgICAgOiAnXFxcXHUwMDNDJyxcbiAgICAnPicgICAgIDogJ1xcXFx1MDAzRScsXG4gICAgJy8nICAgICA6ICdcXFxcdTAwMkYnLFxuICAgICdcXHUyMDI4JzogJ1xcXFx1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAnXFxcXHUyMDI5J1xufTtcblxuZnVuY3Rpb24gZXNjYXBlVW5zYWZlQ2hhcnModW5zYWZlQ2hhcikge1xuICAgIHJldHVybiBFU0NBUEVEX0NIQVJTW3Vuc2FmZUNoYXJdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNlcmlhbGl6ZShvYmosIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuXG4gICAgLy8gQmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIGBzcGFjZWAgYXMgdGhlIHNlY29uZCBhcmd1bWVudC5cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdudW1iZXInIHx8IHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgICBvcHRpb25zID0ge3NwYWNlOiBvcHRpb25zfTtcbiAgICB9XG5cbiAgICB2YXIgZnVuY3Rpb25zID0gW107XG4gICAgdmFyIHJlZ2V4cHMgICA9IFtdO1xuICAgIHZhciBkYXRlcyAgICAgPSBbXTtcblxuICAgIC8vIFJldHVybnMgcGxhY2Vob2xkZXJzIGZvciBmdW5jdGlvbnMgYW5kIHJlZ2V4cHMgKGlkZW50aWZpZWQgYnkgaW5kZXgpXG4gICAgLy8gd2hpY2ggYXJlIGxhdGVyIHJlcGxhY2VkIGJ5IHRoZWlyIHN0cmluZyByZXByZXNlbnRhdGlvbi5cbiAgICBmdW5jdGlvbiByZXBsYWNlcihrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZSB2YWx1ZSBpcyBhbiBvYmplY3Qgdy8gYSB0b0pTT04gbWV0aG9kLCB0b0pTT04gaXMgY2FsbGVkIGJlZm9yZVxuICAgICAgICAvLyB0aGUgcmVwbGFjZXIgcnVucywgc28gd2UgdXNlIHRoaXNba2V5XSB0byBnZXQgdGhlIG5vbi10b0pTT05lZCB2YWx1ZS5cbiAgICAgICAgdmFyIG9yaWdWYWx1ZSA9IHRoaXNba2V5XTtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2Ygb3JpZ1ZhbHVlO1xuXG4gICAgICAgIGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgaWYob3JpZ1ZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdAX19SLScgKyBVSUQgKyAnLScgKyAocmVnZXhwcy5wdXNoKG9yaWdWYWx1ZSkgLSAxKSArICdfX0AnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihvcmlnVmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdAX19ELScgKyBVSUQgKyAnLScgKyAoZGF0ZXMucHVzaChvcmlnVmFsdWUpIC0gMSkgKyAnX19AJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gJ0BfX0YtJyArIFVJRCArICctJyArIChmdW5jdGlvbnMucHVzaChvcmlnVmFsdWUpIC0gMSkgKyAnX19AJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICB2YXIgc3RyO1xuXG4gICAgLy8gQ3JlYXRlcyBhIEpTT04gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2YWx1ZS5cbiAgICAvLyBOT1RFOiBOb2RlIDAuMTIgZ29lcyBpbnRvIHNsb3cgbW9kZSB3aXRoIGV4dHJhIEpTT04uc3RyaW5naWZ5KCkgYXJncy5cbiAgICBpZiAob3B0aW9ucy5pc0pTT04gJiYgIW9wdGlvbnMuc3BhY2UpIHtcbiAgICAgICAgc3RyID0gSlNPTi5zdHJpbmdpZnkob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBKU09OLnN0cmluZ2lmeShvYmosIG9wdGlvbnMuaXNKU09OID8gbnVsbCA6IHJlcGxhY2VyLCBvcHRpb25zLnNwYWNlKTtcbiAgICB9XG5cbiAgICAvLyBQcm90ZWN0cyBhZ2FpbnN0IGBKU09OLnN0cmluZ2lmeSgpYCByZXR1cm5pbmcgYHVuZGVmaW5lZGAsIGJ5IHNlcmlhbGl6aW5nXG4gICAgLy8gdG8gdGhlIGxpdGVyYWwgc3RyaW5nOiBcInVuZGVmaW5lZFwiLlxuICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gU3RyaW5nKHN0cik7XG4gICAgfVxuXG4gICAgLy8gUmVwbGFjZSB1bnNhZmUgSFRNTCBhbmQgaW52YWxpZCBKYXZhU2NyaXB0IGxpbmUgdGVybWluYXRvciBjaGFycyB3aXRoXG4gICAgLy8gdGhlaXIgc2FmZSBVbmljb2RlIGNoYXIgY291bnRlcnBhcnQuIFRoaXMgX211c3RfIGhhcHBlbiBiZWZvcmUgdGhlXG4gICAgLy8gcmVnZXhwcyBhbmQgZnVuY3Rpb25zIGFyZSBzZXJpYWxpemVkIGFuZCBhZGRlZCBiYWNrIHRvIHRoZSBzdHJpbmcuXG4gICAgaWYgKG9wdGlvbnMudW5zYWZlICE9PSB0cnVlKSB7XG4gICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKFVOU0FGRV9DSEFSU19SRUdFWFAsIGVzY2FwZVVuc2FmZUNoYXJzKTtcbiAgICB9XG5cbiAgICBpZiAoZnVuY3Rpb25zLmxlbmd0aCA9PT0gMCAmJiByZWdleHBzLmxlbmd0aCA9PT0gMCAmJiBkYXRlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG5cbiAgICAvLyBSZXBsYWNlcyBhbGwgb2NjdXJyZW5jZXMgb2YgZnVuY3Rpb24sIHJlZ2V4cCBhbmQgZGF0ZSBwbGFjZWhvbGRlcnMgaW4gdGhlXG4gICAgLy8gSlNPTiBzdHJpbmcgd2l0aCB0aGVpciBzdHJpbmcgcmVwcmVzZW50YXRpb25zLiBJZiB0aGUgb3JpZ2luYWwgdmFsdWUgY2FuXG4gICAgLy8gbm90IGJlIGZvdW5kLCB0aGVuIGB1bmRlZmluZWRgIGlzIHVzZWQuXG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKFBMQUNFX0hPTERFUl9SRUdFWFAsIGZ1bmN0aW9uIChtYXRjaCwgdHlwZSwgdmFsdWVJbmRleCkge1xuICAgICAgICBpZiAodHlwZSA9PT0gJ0QnKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJuZXcgRGF0ZShcXFwiXCIgKyBkYXRlc1t2YWx1ZUluZGV4XS50b0lTT1N0cmluZygpICsgXCJcXFwiKVwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdSJykge1xuICAgICAgICAgICAgcmV0dXJuIHJlZ2V4cHNbdmFsdWVJbmRleF0udG9TdHJpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmbiAgICAgICAgICAgPSBmdW5jdGlvbnNbdmFsdWVJbmRleF07XG4gICAgICAgIHZhciBzZXJpYWxpemVkRm4gPSBmbi50b1N0cmluZygpO1xuXG4gICAgICAgIGlmIChJU19OQVRJVkVfQ09ERV9SRUdFWFAudGVzdChzZXJpYWxpemVkRm4pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdTZXJpYWxpemluZyBuYXRpdmUgZnVuY3Rpb246ICcgKyBmbi5uYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZXJpYWxpemVkRm47XG4gICAgfSk7XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IE1lbW9yeUhlbHBlciA9IHtcbiAgY3JlYXRlKCBzaXplT3JCdWZmZXI9NDA5NiwgbWVtdHlwZT1GbG9hdDMyQXJyYXkgKSB7XG4gICAgbGV0IGhlbHBlciA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuXG4gICAgLy8gY29udmVuaWVudGx5LCBidWZmZXIgY29uc3RydWN0b3JzIGFjY2VwdCBlaXRoZXIgYSBzaXplIG9yIGFuIGFycmF5IGJ1ZmZlciB0byB1c2UuLi5cbiAgICAvLyBzbywgbm8gbWF0dGVyIHdoaWNoIGlzIHBhc3NlZCB0byBzaXplT3JCdWZmZXIgaXQgc2hvdWxkIHdvcmsuXG4gICAgT2JqZWN0LmFzc2lnbiggaGVscGVyLCB7XG4gICAgICBoZWFwOiBuZXcgbWVtdHlwZSggc2l6ZU9yQnVmZmVyICksXG4gICAgICBsaXN0OiB7fSxcbiAgICAgIGZyZWVMaXN0OiB7fVxuICAgIH0pXG5cbiAgICByZXR1cm4gaGVscGVyXG4gIH0sXG5cbiAgYWxsb2MoIHNpemUsIGltbXV0YWJsZSApIHtcbiAgICBsZXQgaWR4ID0gLTFcblxuICAgIGlmKCBzaXplID4gdGhpcy5oZWFwLmxlbmd0aCApIHtcbiAgICAgIHRocm93IEVycm9yKCAnQWxsb2NhdGlvbiByZXF1ZXN0IGlzIGxhcmdlciB0aGFuIGhlYXAgc2l6ZSBvZiAnICsgdGhpcy5oZWFwLmxlbmd0aCApXG4gICAgfVxuXG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZnJlZUxpc3QgKSB7XG4gICAgICBsZXQgY2FuZGlkYXRlID0gdGhpcy5mcmVlTGlzdFsga2V5IF1cblxuICAgICAgaWYoIGNhbmRpZGF0ZS5zaXplID49IHNpemUgKSB7XG4gICAgICAgIGlkeCA9IGtleVxuXG4gICAgICAgIHRoaXMubGlzdFsgaWR4IF0gPSB7IHNpemUsIGltbXV0YWJsZSwgcmVmZXJlbmNlczoxIH1cblxuICAgICAgICBpZiggY2FuZGlkYXRlLnNpemUgIT09IHNpemUgKSB7XG4gICAgICAgICAgbGV0IG5ld0luZGV4ID0gaWR4ICsgc2l6ZSxcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemVcblxuICAgICAgICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmxpc3QgKSB7XG4gICAgICAgICAgICBpZigga2V5ID4gbmV3SW5kZXggKSB7XG4gICAgICAgICAgICAgIG5ld0ZyZWVTaXplID0ga2V5IC0gbmV3SW5kZXhcbiAgICAgICAgICAgICAgdGhpcy5mcmVlTGlzdFsgbmV3SW5kZXggXSA9IG5ld0ZyZWVTaXplXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiggaWR4ICE9PSAtMSApIGRlbGV0ZSB0aGlzLmZyZWVMaXN0WyBpZHggXVxuXG4gICAgaWYoIGlkeCA9PT0gLTEgKSB7XG4gICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKCB0aGlzLmxpc3QgKSxcbiAgICAgICAgICBsYXN0SW5kZXhcblxuICAgICAgaWYoIGtleXMubGVuZ3RoICkgeyAvLyBpZiBub3QgZmlyc3QgYWxsb2NhdGlvbi4uLlxuICAgICAgICBsYXN0SW5kZXggPSBwYXJzZUludCgga2V5c1sga2V5cy5sZW5ndGggLSAxIF0gKVxuXG4gICAgICAgIGlkeCA9IGxhc3RJbmRleCArIHRoaXMubGlzdFsgbGFzdEluZGV4IF0uc2l6ZVxuICAgICAgfWVsc2V7XG4gICAgICAgIGlkeCA9IDBcbiAgICAgIH1cblxuICAgICAgdGhpcy5saXN0WyBpZHggXSA9IHsgc2l6ZSwgaW1tdXRhYmxlLCByZWZlcmVuY2VzOjEgfVxuICAgIH1cblxuICAgIGlmKCBpZHggKyBzaXplID49IHRoaXMuaGVhcC5sZW5ndGggKSB7XG4gICAgICB0aHJvdyBFcnJvciggJ05vIGF2YWlsYWJsZSBibG9ja3MgcmVtYWluIHN1ZmZpY2llbnQgZm9yIGFsbG9jYXRpb24gcmVxdWVzdC4nIClcbiAgICB9XG4gICAgcmV0dXJuIGlkeFxuICB9LFxuXG4gIGFkZFJlZmVyZW5jZSggaW5kZXggKSB7XG4gICAgaWYoIHRoaXMubGlzdFsgaW5kZXggXSAhPT0gdW5kZWZpbmVkICkgeyBcbiAgICAgIHRoaXMubGlzdFsgaW5kZXggXS5yZWZlcmVuY2VzKytcbiAgICB9XG4gIH0sXG5cbiAgZnJlZSggaW5kZXggKSB7XG4gICAgaWYoIHRoaXMubGlzdFsgaW5kZXggXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgdGhyb3cgRXJyb3IoICdDYWxsaW5nIGZyZWUoKSBvbiBub24tZXhpc3RpbmcgYmxvY2suJyApXG4gICAgfVxuXG4gICAgbGV0IHNsb3QgPSB0aGlzLmxpc3RbIGluZGV4IF1cbiAgICBpZiggc2xvdCA9PT0gMCApIHJldHVyblxuICAgIHNsb3QucmVmZXJlbmNlcy0tXG5cbiAgICBpZiggc2xvdC5yZWZlcmVuY2VzID09PSAwICYmIHNsb3QuaW1tdXRhYmxlICE9PSB0cnVlICkgeyAgICBcbiAgICAgIHRoaXMubGlzdFsgaW5kZXggXSA9IDBcblxuICAgICAgbGV0IGZyZWVCbG9ja1NpemUgPSAwXG4gICAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5saXN0ICkge1xuICAgICAgICBpZigga2V5ID4gaW5kZXggKSB7XG4gICAgICAgICAgZnJlZUJsb2NrU2l6ZSA9IGtleSAtIGluZGV4XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmZyZWVMaXN0WyBpbmRleCBdID0gZnJlZUJsb2NrU2l6ZVxuICAgIH1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlIZWxwZXJcbiJdfQ==

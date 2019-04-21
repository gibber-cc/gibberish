const g = require( 'genish.js' ),
      analyzer = require( './analyzer.js' ),
      proxy    = require( '../workletProxy.js' ),
      ugen     = require( '../ugen.js' )

module.exports = function( Gibberish ) {
 
const SSD = inputProps => {
  const ssd = Object.create( analyzer )
  ssd.__in  = Object.create( ugen )
  ssd.__out = Object.create( ugen )

  ssd.id = Gibberish.factory.getUID()

  const props = Object.assign({}, SSD.defaults, inputProps )
  const isStereo = props.isStereo 
  const input    = g.in( 'input' )
  const historyL = g.history()
  historyL.value = 1

  ssd.out = Out( historyL, props )
  ssd.in  =  In( historyL, props )

  ssd.value = historyL.value
  ssd.listen = ssd.in.listen

  return ssd 
}

const Out = (history,props) => {
  if( Gibberish.mode === 'processor' ) {
    const id = history.id
    history = Gibberish.ugens.get( history.id )
    if( history === undefined ) {
      history = g.history( 0 )
      Gibberish.ugens.set( id, history )
    }
    if( props === undefined ) props = { id }
  }else{
  }
  return Gibberish.factory( Object.create( ugen ), history.out, ['analysis','SSD_Out'], props, null )
}

const In = history => {
  const input = g.in( 'input' )
  
  const Gibbs = Gibberish
  if( Gibberish.mode === 'processor' ) {
    history = Gibberish.ugens.get( history.id - 1 )
  }
  const idx = Gibberish.mode === 'processor' ? history.graph.memory.value.idx : history.memory.value.idx
  const memory = Gibberish.genish.gen.memory.heap


  let ssdin = Object.create( ugen )
  ssdin.listen = function( input ) {
    ssdin.input = input
    Gibberish.dirty( Gibberish.analyzers ) 
    //if( Gibberish.mode === 'worklet' ) {
    //  Gibberish.worklet.port.postMessage({
    //    address:'method',
    //    object: ssdin.id,
    //    name:'listen',
    //    args:[ input ]
    //  })
    //}else{
    //  ssdin.input = input
    //  Gibberish.analyzers.push( ssdin )
    //  //Gibberish.dirty( Gibberish.analyzers )
    //}
  }

  //ssdin.inputNames = [ 'input','memory' ]

  //ssdin.inputs = [ 0 ]
  ssdin = Gibberish.factory( ssdin, input, ['analysis','SSD_In'], { 'input':0 } )

  const callback = function( input, memory ) {
    memory[ idx ] = input
    return 0     
  }
  if( Gibberish.mode === 'processor' ) {
    ssdin.callback = callback

    // when each ugen callback is passed to the master callback function
    // it needs to have a ugenName property; we'll just copy this over
    ssdin.callback.ugenName = ssdin.ugenName
  }
  //callback.ugenName = ssd.__in.ugenName = 'ssd_in_' + ssd.__in.id
  //ssd.__in.input = props.input
  ssdin.type = 'analysis'
  Gibberish.analyzers.push( ssdin )

  //ssd.__in.listen = function( ugen ) {
  //  console.log( 'listening:', ugen, Gibberish.mode )
  //  if( ugen !== undefined ) {
  //    ssd.__in.input = ugen
  //    ssd.__in.inputs = [ ugen ]
  //  }

  //  if( Gibberish.analyzers.indexOf( ssd.__in ) === -1 ) {
  //    if( Gibberish.mode === 'worklet' ) {
  //      //Gibberish.analyzers.push( { id:ssd.id, prop:'in' })
  //      Gibberish.worklet.port.postMessage({
  //       address:'eval',
  //       code:`const u = Gibberish.ugens.get( ${ssd.__in.id } ); console.log( ${ssd.__in.id }, u, Gibberish.ugens ); Gibberish.analyzers.push(u  ); Gibberish.dirty( Gibberish.analyzers );`  
  //      })
  //    }else{
  //      //Gibberish.analyzers.push( ssd.__in )
  //    }
  //  }

  //  Gibberish.dirty( Gibberish.analyzers )
  //  //console.log( 'in:', ssd.__in )
  //}

  //ssd.listen = ssd.__in.listen
  //ssd.__in.type = 'analysis'
  return ssdin
}

SSD.defaults = {
  input:0,
  isStereo:false
}

return { In, Out, SSD }
/*const SSDelay = inputProps => {
  let ssd = Object.create( analyzer )
  ssd.__in  = Object.create( ugen )
  ssd.__out = Object.create( ugen )

  ssd.id = Gibberish.factory.getUID()

  let props = Object.assign({}, SSDelay.defaults, inputProps )
  let isStereo = props.isStereo 
  
  let input = g.in( 'input' )
    
  let historyL = g.history()

  if( isStereo ) {
    // right channel
    let historyR = g.history()

    ssd.__out =  proxy( ['analysis','SSD'], props, ssd.__out )

    //Gibberish.factory( 
    //  ssd.__out,
    //  [ historyL.out, historyR.out ], 
    //  'ssd_out', 
    //  props,
    //  null,
    //  false
    //)

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

    ssd.__out = Gibberish.factory( ssd.__out, historyL.out, 'ssd_out', props, null, true )

    ssd.__out.callback.ugenName = ssd.__out.ugenName = 'ssd_out' + ssd.id

    let idx = ssd.__out.graph.memory.value.idx 
    let memory = Gibberish.genish.gen.memory.heap
    let callback = function( input ) {
      'use strict'
      memory[ idx ] = input
      return 0     
    }
    
    //ssd.__in =  proxy( ['analysis','SSD'], props, ssd.__in )
    ssd.__in = Gibberish.factory( ssd.__in, input, 'ssd_in', {}, callback, true )

    console.log( 'id:', ssd.__in.id )
    callback.ugenName = ssd.__in.ugenName = 'ssd_in_' + ssd.__in.id
    ssd.__in.inputNames = [ 'input' ]
    ssd.__in.inputs = [ props.input ]
    ssd.__in.input = props.input
    ssd.type = 'analysis'

    ssd.__in.listen = function( ugen ) {
      console.log( 'listening:', ugen, Gibberish.mode )
      if( ugen !== undefined ) {
        ssd.__in.input = ugen
        ssd.__in.inputs = [ ugen ]
      }

      if( Gibberish.analyzers.indexOf( ssd.__in ) === -1 ) {
        if( Gibberish.mode === 'worklet' ) {
          //Gibberish.analyzers.push( { id:ssd.id, prop:'in' })
          Gibberish.worklet.port.postMessage({
           address:'eval',
           code:`const u = Gibberish.ugens.get( ${ssd.__in.id } ); console.log( ${ssd.__in.id }, u, Gibberish.ugens ); Gibberish.analyzers.push(u  ); Gibberish.dirty( Gibberish.analyzers );`  
          })
        }else{
          //Gibberish.analyzers.push( ssd.__in )
        }
      }

      Gibberish.dirty( Gibberish.analyzers )
      //console.log( 'in:', ssd.__in )
    }

  }

  ssd.listen = ssd.__in.listen
  ssd.__in.type = 'analysis'

 
  ssd.__out.inputs = []
  //ssd.__out.type = 'bus' 

  //const out =  proxy( ['analysis','SSD'], props, ssd )
  
  //out.listen = ssd.__in.listen
  
  //Object.defineProperties( out, {
  //  'out': {
  //    set(v) {},
  //    get() {
        //if( Gibberish.mode === 'worklet' ) {
          //return { id:out.id, prop:'out', type:'bus', inputs:[] }
        //}else{
          //return out.__out
        //}
      //}
//}},
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

  //})

  return ssd
  }
  */

//SSDelay.defaults = {
//  input:0,
//  isStereo:false
//}

//return SSDelay

}

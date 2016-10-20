let ugen = {
  free() {
    Gibberish.genish.gen.free( this.graph )
  },

  print() {
    console.log( this.callback.toString() )
  },

  connect( target, level=1 ) {
    let input = level === 1 ? this : Gibberish.Mul( this, level )

    if( target === undefined ) target = Gibberish.output 

    if( target.inputs )
      target.inputs.push( this )
    else
      target.input = this

    Gibberish.dirty( target )
    
    return this
  },

  chain( target, level=1 ) {
    this.connect( target,level )

    return target
  }
}

module.exports = ugen

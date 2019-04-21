module.exports = function( Gibberish ) {
  const { In, Out, SSD } = require( './singlesampledelay.js'  )( Gibberish )

  const analyzers = {
    SSD,
    SSD_In: In,
    SSD_Out: Out   
    //Follow: require( './follow.js'  )( Gibberish )
  }

  /*analyzers.Follow_out = analyzers.Follow.out
  analyzers.Follow_in  = analyzers.Follow.in
  */

  analyzers.export = target => {
    for( let key in analyzers ) {
      if( key !== 'export' ) {
        target[ key ] = analyzers[ key ]
      }
    }
  }

return analyzers

}

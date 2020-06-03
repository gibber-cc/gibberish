module.exports = {

  prefix:`const window = {}; 
        let Gibberish = null; 
        let initialized = false;\n`,

  postfix:`window.Gibberish.workletProcessor = GibberishProcessor 
           registerProcessor( 'gibberish', window.Gibberish.workletProcessor );\n`

}


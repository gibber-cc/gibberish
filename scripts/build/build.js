// simple concatenation build script taken from this blog entry:
// http://blog.millermedeiros.com/node-js-as-a-build-script/

// settings
var FILE_ENCODING = 'utf-8',
    EOL = '\n';
 
// setup
var _fs = require('fs');
 
function concat(opts) {
    var fileList = opts.src;
    var distPath = opts.dest;
    var out = fileList.map(function(filePath){
      return _fs.readFileSync(filePath, FILE_ENCODING);
    });
    _fs.writeFileSync(distPath, out.join(EOL), FILE_ENCODING);
    console.log(' '+ distPath +' built.');
    return out
}
 
var out = concat({
    src : [
        __dirname + '/../gibberish.js',
        __dirname + '/../utils.js',
        __dirname + '/../proxy.js',        
        __dirname + '/../oscillators.js',
        __dirname + '/../physical_models.js',        
        __dirname + '/../bus.js',
        __dirname + '/../envelopes.js',
        __dirname + '/../analysis.js',
        __dirname + '/../effects.js',
        __dirname + '/../synth.js',
        __dirname + '/../fm_synth.js',
        __dirname + '/../externals/audiofile.js',
        __dirname + '/../sampler.js',
        __dirname + '/../monosynth.js',
        __dirname + '/../binops.js',
        __dirname + '/../time.js',         
        __dirname + '/../sequencer_audio.js',
        __dirname + '/../sequencer.js',                
        __dirname + '/../input.js',         
        __dirname + '/../drums.js',           
        //__dirname + '/../documentation_output.js',
    ],
    dest : __dirname + '/gibberish_2.0.js'
});

//_fs.writeFileSync(__dirname + '/../../../gibber/js/external/gibberish.2.0.min.js', out.join(EOL), FILE_ENCODING);

//uglifyjs gibberish_2.0.js -o gibberish_2.0.min.js -c -m


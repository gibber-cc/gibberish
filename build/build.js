// simple concatenation build script taken from this blog entry:
// http://blog.millermedeiros.com/node-js-as-a-build-script/

// settings
var FILE_ENCODING = 'utf-8',
    EOL = '\n';
 
// setup
var _fs = require('fs'),
    uglify = require('uglify-js')
 
function concat(opts) {
    var fileList = opts.src,
        distPath = opts.dest,
        out = fileList.map(function(filePath){
          return _fs.readFileSync(filePath, FILE_ENCODING);
        });
    
    out = out.join(EOL);
    
    _fs.writeFileSync(distPath + '.js', out, FILE_ENCODING);
    
    var ugly = uglify.minify( out, {fromString: true} );
    
    _fs.writeFileSync(distPath + '.min.js', ugly.code, FILE_ENCODING);
    
    console.log(' '+ distPath +' built.');
    
    return out
}
 
var out = concat({
    src : [
        __dirname + '/../scripts/gibberish.js',
        __dirname + '/../scripts/utils.js',
        __dirname + '/../scripts/proxy.js',
        __dirname + '/../scripts/oscillators.js',
        __dirname + '/../scripts/physical_models.js',
        __dirname + '/../scripts/bus.js',
        __dirname + '/../scripts/envelopes.js',
        __dirname + '/../scripts/analysis.js',
        __dirname + '/../scripts/effects.js',
        __dirname + '/../scripts/synth.js',
        __dirname + '/../scripts/fm_synth.js',
        //__dirname + '/../scripts/externals/audiofile.js',
        __dirname + '/../scripts/sampler.js',
        __dirname + '/../scripts/monosynth.js',
        __dirname + '/../scripts/binops.js',
        __dirname + '/../scripts/time.js',
        __dirname + '/../scripts/sequencer_audio.js',
        __dirname + '/../scripts/sequencer.js',
        __dirname + '/../scripts/polyseq.js',
        __dirname + '/../scripts/input.js',
        __dirname + '/../scripts/drums.js',
        //__dirname + '/../documentation_output.js',
    ],
  // setting gibberish.js to be output to root directory so it's easier to locate so people don't have to search for it if they just want to include it
    dest : __dirname + '/gibberish'
});

//_fs.writeFileSync(__dirname + '/../../../gibber/js/external/gibberish.2.0.min.js', out.join(EOL), FILE_ENCODING);

//uglifyjs gibberish_2.0.js -o gibberish.2.0.min.js -c -m


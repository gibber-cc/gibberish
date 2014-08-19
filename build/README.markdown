# Build Instructions #
-----------------------------------

Gibberish uses a simple node.js script for building. There are no external dependencies
for the core build script. In the terminal, cd in to the build directory and then run:

    node build.js
    
This will create the concatenated library file, gibberishxxxx.js (xxxx depends on version number).

In order to minify the resulting script, I suggest using uglify-js. With uglify globally installed using npm,
enter the following command in the terminal while in the build directory:

    uglifyjs gibberish_2.0.js -o gibberish_2.0.min.js -c -m

The resulting file will be both compressed (-c) and mangled (-m). 
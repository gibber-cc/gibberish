'use strict'

module.exports = function(grunt) { 

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-strip');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    var files = [
        './scripts/gibberish.js',
        './scripts/utils.js',
        './scripts/proxy.js',        
        './scripts/oscillators.js',
        './scripts/physical_models.js',        
        './scripts/bus.js',
        './scripts/envelopes.js',
        './scripts/analysis.js',
        './scripts/effects.js',
        './scripts/synth.js',
        './scripts/fm_synth.js',
        './scripts/externals/audiofile.js',
        './scripts/sampler.js',
        './scripts/monosynth.js',
        './scripts/binops.js',
        './scripts/time.js',         
        './scripts/sequencer_audio.js',
        './scripts/sequencer.js',                
        './scripts/input.js',         
        './scripts/drums.js',           
        //__dirname + '/../documentation_output.js',
    ]

      // Project configuration.
      grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        concat: {
          dist: {
            src: [],
            dest: './build/gibberish.js'
          }
        },
        strip : {
          main : {
            src : '<%= concat.dist.dest %>',
            dest : '<%= concat.dist.dest %>',
          }
        },
        uglify: {
          options: {
              // the banner is inserted at the top of the output
              banner: '/*! <%= pkg.name %> v<%= pkg.version %> built on <%= grunt.template.today("dd-mm-yyyy") %> */\n'
          },
          dist: {
              files: {
                  './build/gibberish.min.js': ['<%= strip.main.dest %>']
              }
          }
      },

      });

      // Default task.
      grunt.registerTask('default', ['concat']);
      grunt.registerTask('build', ['concat', 'strip', 'uglify']);
    };

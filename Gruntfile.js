/*
 * grunt-closure-compiler
 * https://github.com/euskadi31/grunt-closure-compiler
 *
 * Copyright (c) 2014 Axel Etcheverry
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        // Configuration to be run (and then tested).
        closure_compiler: {
            test: {
                options: {
                    banner: '/**\n' +
                        ' * My v<%=pkg.version %>\n' +
                        ' *\n' +
                        ' * @author      Axel Etcheverry\n' +
                        ' * @copyright   Copyright (c) 2014 Axel Etcheverry.\n' +
                        ' */\n',
                    language_in: 'ECMASCRIPT5_STRICT',
                    report: 'gzip'
                },

                src: 'src/my.js',
                dest: 'dist/my.min.js'
            },
            prod: {
                options: {
                    banner: '/**\n' +
                        ' * Hi\n' +
                        ' */\n',
                    language_in: 'ECMASCRIPT5_STRICT'
                },
                src: 'src/my2.js',
                dest: 'dist/my2.min.js'
            }
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'closure_compiler']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint']);

};

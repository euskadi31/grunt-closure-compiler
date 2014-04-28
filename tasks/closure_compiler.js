/*
 * grunt-closure-compiler
 * https://github.com/euskadi31/grunt-closure-compiler
 *
 * Copyright (c) 2014 Axel Etcheverry
 * Licensed under the MIT license.
 */

'use strict';

var shell   = require('shelljs');
var fs      = require('fs');

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('closure_compiler', 'A Grunt task for Closure Compiler.', function() {

        var done = this.async();

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            banner: '',
            compilation_level: 'SIMPLE_OPTIMIZATIONS',
            debug: false,
            define: {},
            externs: [],
            formatting: false,
            generate_exports: false,
            language_in: 'ECMASCRIPT3',
            source_map_format: 'V2',
            report: false
        });

        // Process banner.
        var banner = grunt.template.process(options.banner);

        //returns the 32-bit mode force flags for java compiler if supported, this makes the build much faster
        function java32flags() {
            if (process.platform === "win32") {
                 return [];
            }

            if (shell.exec('java -version -d32 2>&1', {silent: true}).code !== 0) {
                return [];
            }

            return ['-d32', '-client'];
        }

        // Log min and max info
        function gzipSize(src) {
            return src ? require('zlib-browserify').gzipSync(src).length : 0;
        }

        function minMaxInfo(src, dest, report) {
            if (report === 'min' || report === 'gzip') {

                var src_stat = fs.statSync(src);
                var dest_stat = fs.statSync(dest);

                grunt.log.writeln('Original: ' + String(src_stat.size).green + ' bytes.');
                grunt.log.writeln('Minified: ' + String(dest_stat.size).green + ' bytes.');
            }

            if (report === 'gzip') {

                var data = fs.readFileSync(dest);

                // Note this option is pretty slow so it is not enabled by default
                grunt.log.write('Gzipped:  ');
                grunt.log.writeln(String(gzipSize(data)).green + ' bytes.');

            }
        }



        var args = [];

        args = args.concat(java32flags());

        args.push('-Xmx2g');
        args.push('-jar ./bin/compiler.jar');
        args.push('--compilation_level ' + options.compilation_level);
        args.push('--source_map_format=' + options.source_map_format);

        if (options.debug) {
            args.push('--debug');
        }

        for (var key in options.define) {
            switch (typeof options.define[key]) {
                case 'string':
                    args.push('--define ' + key + '=\'' + options.define[key] + '\'');
                    break;
                case 'boolean':
                    if (options.define[key]) {
                        args.push('--define ' + key + '=true');
                    } else {
                        args.push('--define ' + key + '=false');
                    }
                    break;
                case 'integer':
                    args.push('--define ' + key + '=' + options.define[key]);
                    break;
            }
        }

        var i;

        for (i = 0; i < options.externs.length; i++) {
            if (!grunt.file.exists(options.externs[i])) {
                grunt.log.warn('extern file "' + options.externs[i] + '" not found.');
            } else {
                args.push('--externs ' + options.externs[i]);
            }
        }

        var src;
        var dest;

        // Iterate over all specified file groups.
        this.files.forEach(function(f) {

            src = f.src.join('');

            if (!grunt.file.exists(src)) {
                grunt.log.warn('Source file "' + src + '" not found.');
            }

            if (dest === undefined) {
                dest = f.dest;
            }
        });

        args.push('--js ' + src);
        args.push('--js_output_file ' + dest);

        shell.exec(
            'java ' + args.join(' '),
            function(code) {
                if (code !== 0) {
                    grunt.fail.warn('Error minifying ' + dest);
                }

                if (banner.length > 0) {
                    var output = fs.readFileSync(dest);
                    // Write the destination file.
                    grunt.file.write(dest, banner + output);
                }

                // Print a success message.
                grunt.log.ok('File "' + dest + '" created.');

                // ...and report some size information.
                if (options.report) {
                    minMaxInfo(src, dest, options.report);
                }

                done();
            }.bind(this)
        );

    });

};

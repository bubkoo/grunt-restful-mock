/*
 * grunt-restful-mock
 *
 *
 * Copyright (c) 2014 bubkoo
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        // Configuration to be run (and then tested).
        mock: {
            options: {
                debug: true,
                watch: 'grunt/mock.js'
            },

            demo: {
                options: {
                    port: '6001',
                    debug: true,
                    placeholders: {
                        hello: function (name) {
                            return 'hello ' + name;
                        }
                    },
                    rules: {
                        '/demo/for/inline1': {
                            'get': {
                                data: {
                                    'code': '0',
                                    'data': {
                                        'name': 'bubkoo',
                                        'email': 'bubkoo@163.com'
                                    }
                                }
                            }
                        },
                        '/demo/for/inline2': {
                            post: {
                                delay: 3000,
                                data: {
                                    code: '0',
                                    msg: 'delay 3s'
                                }
                            }
                        }
                    }
                },
                cwd: 'mock',
                src: ['*.js', '*.yaml', '*.coffee', '*.json']
            }
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint']);

};

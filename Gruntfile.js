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
                'tasks/**/*.js',
                'test/**/*/js'
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
        mock: {
            options: {
                debug: true,
                // 监视配置文件变化，自动重启服务
                watch: 'grunt/mock.js'
            },

            demo: {
                options: {
                    port: '6001',
                    debug: true,
                    route: {
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
                                    msg: ''
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
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'restful_mock', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};

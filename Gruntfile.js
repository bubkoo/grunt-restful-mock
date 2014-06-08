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
        mock: {
            options: {
                debug: true,
                // 监视配置文件变化，自动重启服务
                watch: 'grunt/mock.js'
            },

            victory: {
                options: {
                    port: '6001',

                    debug: true,

                    route: {

                        '/api/safe_center/state': {
                            'get': {
                                cookies: null,

                                data: {
                                    'code': '0',

                                    'data': {
                                        // 累积收益，最小单位为分，100表示1元
                                        'bind_email': '',
                                        'bind_phone': '',
                                        'set_wallet_pwd': true
                                    }
                                }
                            }
                        },

                        '/api/fund/unbind_cash_card': {
                            post: {
                                delay: 3000,
                                data: {
                                    code: '0',
                                    msg: ''
                                }
                            }
                        },



                        '/api/fund/other_bank_item': {
                            post: {
                                data: {
                                    'code': '0',
                                    'data|0-5': [
                                        {
                                            'agrno': '',
                                            'card': '8558',
                                            'card_bank': 'CNCB',
                                            'card_name': '中信银行信用卡',
                                            'card_type': '2',
                                            'id': '10',
                                            'img': 'cncb.jpg',
                                            'user_id': '60000046'
                                        }
                                    ]
                                }
                            }
                        },

                        '/api/fund/unbind_fast_card': {
                            post: {
                                delay: 3000,
                                data: {
                                    code: '0',
                                    msg: ''
                                }
                            }
                        },

                        '/api/settiing/set_cookie': {
                            'get': {
                                data: {
                                    'asset': {
                                        'is_open_account': true
                                    }
                                }
                            }
                        },

                        '/api/fund/bank_item': {
                            'get': {
                                data: {
                                    'code': '0',
                                    'data|0-1': [
                                        {
                                            // 银行卡号
                                            'bnkNo': '0558',
                                            // 银行卡绑定编号
                                            'bnkBondId': '1111',
                                            // 银行卡名称
                                            'bnkCard': '工商银行',
                                            // 银行卡描述
                                            'bnkDesc': 'desc'
                                        }
                                    ]
                                }
                            }
                        },

                        '/api/fund/unbind_w_card': {
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
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'restful_mock', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};

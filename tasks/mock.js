/*
 *     __  __  ___   ____ _  __
 *    |  \/  |/ _ \ / ___| |/ /
 *    | |\/| | | | | |   | ' /
 *    | |  | | |_| | |___| . \
 *    |_|  |_|\___/ \____|_|\_\
 *
 * Copyright (c) 2014 bubkoo
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {


    var connect = require('connect');
    var http = require('http');
    var https = require('https');
    var portscanner = require('portscanner');
    var async = require('async');
    var Dispatcher = require('./lib/dispatcher');

    grunt.registerMultiTask('mock', 'Start a API mock server.', function () {

        var dispatcher;
        var done = this.async(); // 阻塞式 grunt 任务

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            protocol: 'http',
            port: '',
            hostname: '0.0.0.0',
            delay: 500,
            statusCode: 200,
            timeout: false,
            sensitive: false,   // 当设置为 true, 将区分路由的大小写
            strict: false,      // 当设置为 true, 路由末尾的斜杠将影响匹配
            end: true,          // 当设置为 false, 将只会匹配 url 前缀
            debug: false
        });

        options.debug = grunt.option('debug') || options.debug === true;

        async.waterfall([
            function (next) {

                if (options.protocol !== 'http' && options.protocol !== 'https') {
                    grunt.fatal('protocol option must be \'http\' or \'https\'');
                }
                if (!options.port) {
                    grunt.fatal('must be assign a service port');
                }
                next(null);

            },
            function () {

                var app = connect.apply(null, createMiddleware(connect, options));
                var server = null;

                if (options.protocol === 'http') {
                    server = http.createServer(app);
                } else if (options.protocol === 'https') {

                }


                // Checks the status of a single port
                portscanner.checkPortStatus(options.port, options.hostname, function (error, status) {
                    // Status is 'open' if currently in use or 'closed' if available
                    if ('closed' === status) {
                        server
                            .listen(options.port, options.hostname)
                            .on('listening', function () {

                                var address = server.address();
                                var hostname = options.hostname || '0.0.0.0';
                                var port = address.port === 80 ? '' : ':' + address.port;
                                var target = options.protocol + '://' + hostname + port;

                                // 创建路由分发
                                dispatcher = new Dispatcher(options);

                                consoleLogo(target, options.debug);


//                            grunt.config.set('connect.' + taskTarget + '.options.hostname', hostname);
//                            grunt.config.set('connect.' + taskTarget + '.options.port', address.port);
//                            done();
                            })
                            .on('error', function (err) {
                                if (err.code === 'EADDRINUSE') {
                                    grunt.fatal('Port ' + options.port + ' is already in use by another process.');
                                } else {
                                    grunt.fatal(err);
                                }
                            });
                    }
                    else {
                        grunt.fatal('Port ' + options.port + ' is already in use by another process.');
                    }
                });
            }
        ]);

        function consoleLogo(target, debug) {
            console.log('\n     __  __  ___   ____ _  __'.magenta);
            console.log('    |  \\/  |/ _ \\ / ___| |/ /'.magenta);
            console.log('    | |\\/| | | | | |   | \' /'.magenta);
            console.log('    | |  | | |_| | |___| . \\'.magenta);
            console.log('    |_|  |_|\\___/ \\____|_|\\_\\'.magenta + '\n');
            console.log('Started API mock on ' + target + '\n');
            if (debug === true) {
                console.log('Waiting for request...'.italic.grey);
            }
        }

        function formatJson(obj, space, level) {
            if (!obj) {
                return '';
            }
            if (typeof space === 'undefined') {
                space = '';
            }
            if (typeof level === 'undefined') {
                level = 0;
            }

            var indent = '    ',
                isArr = Array.isArray(obj),
                ret = '',
                key,
                val;

            for (key in obj) {
                if (isArr) {
                    ret += space + indent;
                } else {
                    ret += space + indent + key + ': ';
                }

                val = obj[key];
                if (Array.isArray(val) || typeof val === 'object') {
                    ret += formatJson(val, space + indent, level + 1);
                } else {
                    if (typeof val === 'string') {
                        val = '"' + val + '"';
                    }
                    ret += val + ',\n';
                }
            }
            ret = ret.substr(0, ret.length - 2) + '\n';

            if (typeof key !== 'undefined') {
                if (isArr) {
                    ret = (level > 0 ? '' : space) + '[\n' + ret + space + ']' + (level > 0 ? ',\n' : '');
                }
                else {
                    ret = (level > 0 ? '' : space) + '{\n' + ret + space + '}' + (level > 0 ? ',\n' : '');
                }
            }
            return ret;
        }

        function createMiddleware(connect, options) {

            var middlewares = [],
                debug = options.debug === true;

            // 内置中间件
            middlewares.push(connect.json());
            middlewares.push(connect.urlencoded());
            middlewares.push(connect.query());

            // 输出请求信息
            if (debug) {
                middlewares.push(
                    connect.logger({
                        'format': '\\n[MOCK DEBUG INFO]\\n'.magenta +
                            ' - Request:\\n'.cyan +
                            '     method: '.yellow + ':method HTTP/:http-version\\n' +
                            '     url:    '.yellow + ':url' + '\\n' +
                            '     ref:    '.yellow + ':referrer\\n' +
                            '     uag:    '.yellow + ':user-agent\\n' +
                            '     addr:   '.yellow + ':remote-addr\\n' +
                            '     date:   '.yellow + ':date',
                        'immediate': true
                    }));
            }

            // 根据请求路由，匹配规则，返回数据
            middlewares.push(function (req, res, next) {
                dispatcher.handle(req, res);
                next();
            });

            // 输出响应信息
            if (debug) {
                middlewares.push(function (req, res, next) {
                    console.log('     params: '.yellow);
                    console.log(formatJson(req.params, '         '));
                    console.log(' - Response:'.cyan);
                    console.log('     status: '.yellow + (res.statusCode === 200 ? 200 : (res.statusCode + '').red));
                    next();
                });

                middlewares.push(
                    connect.logger({
                        'format': '' +
                            '     length: '.yellow + ':res[content-length] byte\\n' +
                            '     timing: '.yellow + ':response-time ms',
                        'immediate': true
                    }));

                middlewares.push(function (req, res, next) {
                    var data = formatJson(res.body, '         '),
                        cookies = formatJson(res.cookies, '         ');

                    console.log('     cookies:'.yellow);
                    if (cookies) {
                        console.log(cookies);
                    }

                    console.log('     data:   '.yellow);
                    if (data) {
                        console.log(data);
                    }

                    console.log('\nWaiting for next request...'.italic.grey);

                    next();
                });
            } else {
                middlewares.push(
                    connect.logger({
                        'format': '[:method] :url'.green,
                        'immediate': true
                    }));
            }

            return middlewares;
        };
    });
};
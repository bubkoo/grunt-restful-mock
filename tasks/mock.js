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


    var connect = require('connect'),
        http = require('http'),
        https = require('https'),
        portscanner = require('portscanner'),
        async = require('async');

    grunt.registerMultiTask('mock', 'Start a API mock server.', function () {

        var done = this.async(),

        // Merge task-specific and/or target-specific options with these defaults.
            options = this.options({
                protocol: 'http',
                port: '',
                hostname: '0.0.0.0',
                delay: 500,
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
                                var address = server.address(),
                                    hostname = options.hostname || '0.0.0.0',
                                    port = address.port === 80 ? '' : ':' + address.port,
                                    target = options.protocol + '://' + hostname + port;
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

        function formatJson(obj, space) {
            if (typeof space === 'undefined') {
                space = '';
            }

            var indent = '    ',
                isArr = Array.isArray(obj),
                ret = '',
                key,
                val;

            if (isArr) {
                ret += space + '[\n';
            }
            else {
                ret += space + '{\n';
            }

            for (key in obj) {
                ret += space + indent + key + ': ';
                val = obj[key];
                if (typeof val === 'object' || Array.isArray(val)) {
                    ret += formatJson(val, space + indent);
                } else {
                    ret += val + '\n';
                }
            }

            if (isArr) {
                ret += space + ']\n';
            }
            else {
                ret += space + '}\n';
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
                            '     url:    '.yellow + ':url'.green + '\\n' +
                            '     ref:    '.yellow + ':referrer\\n' +
                            '     uag:    '.yellow + ':user-agent\\n' +
                            '     addr:   '.yellow + ':remote-addr\\n' +
                            '     date:   '.yellow + ':date',
                        'immediate': true
                    }));

                middlewares.push(function (req, res, next) {
                    if (req.method === 'GET') {
                        console.log(('     query:  ').yellow);
                        console.log(formatJson(req.query, '         '));
                    } else {
                        console.log(('     body:   ').yellow);
                        console.log(formatJson(req.body, '         '));
                    }
                    next();
                });

            } else {
                middlewares.push(
                    connect.logger({
                        'format': '[:method] :url'.green,
                        'immediate': true
                    }));
            }

            // 根据请求路由，匹配规则，返回数据
            middlewares.push(function (req, res, next) {
                var body = '{"name":"bub"}',
                    headers = {
                        'Content-Type': 'application/json',
                        'Content-Length': body.length
                    };
                res.writeHead(200, headers);
                res.end(body);
                next();
            });

            // 输出响应信息
            if (debug) {
                middlewares.push(
                    connect.logger({
                        'format': ' - Response:\\n'.cyan +
                            '     status: '.yellow + ':status\\n' +
                            '     length: '.yellow + ':res[content-length] byte\\n' +
                            '     timing: '.yellow + ':response-time ms\\n',
                        'immediate': true
                    }));

                middlewares.push(function (req, res) {
                    console.log('Waiting for next request...'.italic.grey);
                });
            }

            return middlewares;
        };
    });
};
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

    var path = require('path');
    var connect = require('connect');
    var http = require('http');
    var https = require('https');
    var portscanner = require('portscanner');
    var async = require('async');
    var Gaze = require('gaze').Gaze;
    var Dispatcher = require('./lib/dispatcher');
    var formatJson = require('./lib/formatJson');
    var readfile = require('./lib/readfile');


    grunt.registerMultiTask('mock', 'Start a API mock server.', function () {

        var self = this;
        var options;
        var dispatcher;
        var wathcer = null;
        var server = null;
        var sockets = [];
        var reloadTimes = 0;
        var changedFiles = [];
        var done = self.async(); // 阻塞式 grunt 任务

        // bugfix: possible EventEmitter memory leak detected. 11 listeners added.
        // Use emitter.setMaxListeners() to increase limit.
        process.setMaxListeners(0);

        register();

        function register() {

            // Merge task-specific and/or target-specific options with these defaults.
            options = self.options({
                protocol: 'http',
                port: '6000',
                hostname: '127.0.0.1',
                delay: 0,
                statusCode: 200,
                timeout: false,
                sensitive: false,   // 当设置为 true, 将区分路由的大小写
                strict: false,      // 当设置为 true, 路由末尾的斜杠将影响匹配
                end: true,          // 当设置为 false, 将只会匹配 url 前缀
                debug: false,
                watch: []           // 需要监视的文件，文件变化之后自动重启服务
            });
            options.debug = grunt.option('debug') || options.debug === true;

            processRouteFiles.call(self);

            // 检测端口
            if (options.protocol !== 'http' && options.protocol !== 'https') {
                grunt.fatal('protocol option must be \'http\' or \'https\'');
            }
            if (!options.port) {
                grunt.fatal('must be assign a service port');
            }

            var app = connect.apply(null, createMiddleware(connect, options));
            if (options.protocol === 'http') {
                server = http.createServer(app);
            } else if (options.protocol === 'https') {
                server = https.createServer({
                    key: options.key || grunt.file.read(path.join(__dirname, 'certs', 'server.key')).toString(),
                    cert: options.cert || grunt.file.read(path.join(__dirname, 'certs', 'server.crt')).toString(),
                    ca: options.ca || grunt.file.read(path.join(__dirname, 'certs', 'ca.crt')).toString(),
                    passphrase: options.passphrase || 'grunt'
                }, app);
            }

            // Checks the status of a single port
            portscanner.checkPortStatus(options.port, options.hostname, function (error, status) {
                // Status is 'open' if currently in use or 'closed' if available
                if ('closed' === status) {
                    server
                        .listen(options.port, options.hostname)
                        .once('listening', function () {
                            // 创建路由分发
                            dispatcher = new Dispatcher(options);
                            // 监视配置文件变化，自动重启服务
                            watchConfigFile.call(self);
                            // 打印 logo 信息
                            consoleLogo();
                        })
                        .on('connection', function (socket) {
                            sockets.push(socket);
                            socket.once('close', function () {
                                // 销毁已经关闭的连接
                                sockets.splice(sockets.indexOf(socket), 1);
                            });
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

        function reloadTask() {

            // 关闭已经存在的监视
            if (wathcer) {
                wathcer.close();
            }

            // 销毁 socket 连接
            // server 单方面从 server 上 close 了，已经连接的 socket 会进入一个 close_wait 状态
            // 直到客户端关闭浏览器，server 才真正介绍，所以需要手动销毁连接池
            if (sockets && sockets.length) {
                sockets.forEach(function (socket) {
                    socket.destroy();
                });
            }
            server.removeAllListeners();

            server.close(function () {

                server = null;

                // 删除 require 的缓存
                clearFileCache();
                // 重新加载任务的配置文件
                grunt.task.init([self.name]);

                // Run the task again
//                grunt.task.run(self.nameArgs);
//                done();

                reloadTimes++;

                console.log(('\nRestarting mock. Restart times: ').magenta + (reloadTimes + '\n').green);

                register();
            });
        }

        function processRouteFiles() {

            this.files.forEach(function (f) {
                var cwd = f.cwd;

                var src = f.src.filter(function (filepath) {
                    filepath = getRealPath(filepath, cwd);
                    if (!grunt.file.exists(filepath)) {
                        grunt.log.warn('Source file "' + filepath + '" not found.');
                        return false;
                    } else if (grunt.file.isFile(filepath)) {
                        return true;
                    }
                });

                if (src.length === 0) {
                    return;
                }

                var routes = {};
                src.forEach(function (filepath) {

                    var result;
                    try {
                        filepath = getRealPath(filepath, cwd);
                        result = readfile(filepath);
                    } catch (err) {
                        grunt.log.warn(err);
                    }

                    if ('function' === typeof result) {
                        result = result(grunt);
                    }

                    grunt.util._.merge(routes, result);

                });

                grunt.util._.merge(options.route, routes);

            });
        }

        function clearFileCache() {
            if (changedFiles) {

                changedFiles.forEach(function (filepath) {

                    var abspath = path.resolve(filepath);
                    if (require.cache[abspath]) {
                        delete require.cache[abspath];
                    }

                });

                changedFiles = [];
            }
        }

        function watchConfigFile() {

            var files = ['Gruntfile.js', 'Gruntfile.coffee']; // 默认监视 Gruntfile

            if (options.watch) {
                if (Array.isArray(options.watch)) {
                    files = files.concat(options.watch);
                } else {
                    files.push(options.watch);
                }
            }

            if (this.data.src) {
                var cwd = this.data.cwd;
                var src = this.data.src;

                if (Array.isArray(src)) {
                    src.forEach(function (item) {
                        files.push(path.join(cwd || '', item));
                    });
                } else {
                    files.push(path.join(cwd || '', src));
                }
            }

            wathcer = new Gaze(files, {'interval': 1000, 'debounceDelay': 1000}, function (err) {
                if (err) {
                    if (typeof err === 'string') {
                        err = new Error(err);
                    }
                    grunt.log.writeln('ERROR'.red);
                    grunt.fatal(err);
                }

                this.on('error', function (err) {
                    if (typeof err === 'string') {
                        err = new Error(err);
                    }
                    grunt.log.error(err.message);
                });

                this.on('all', function (event, filepath) {
                    console.log(('[' + event + ']: ').yellow + (filepath).grey);
                    if (changedFiles.indexOf(filepath) === -1) {
                        changedFiles.push(filepath);
                        reloadTask();
                    }
                });
            });
        }

        function consoleLogo() {
            var address = server.address();
            var hostname = options.hostname || '0.0.0.0';
            var port = address.port === 80 ? '' : ':' + address.port;
            var target = options.protocol + '://' + hostname + port;

            // 第一次启动才显示 logo 信息
            if (!reloadTimes) {
                console.log('\n     __  __  ___   ____ _  __'.magenta);
                console.log('    |  \\/  |/ _ \\ / ___| |/ /'.magenta);
                console.log('    | |\\/| | | | | |   | \' /'.magenta);
                console.log('    | |  | | |_| | |___| . \\'.magenta);
                console.log('    |_|  |_|\\___/ \\____|_|\\_\\'.magenta + '\n');
            }

            console.log('Started API mock on ' + target + '\n');

            if (options.debug === true) {
                console.log('Waiting for request...\n'.italic.grey);
            }
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
                        'format': '[MOCK DEBUG INFO]\\n'.magenta +
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
                        cookies;

                    if (res.cookies) {
                        cookies = formatJson(res.cookies, '         ');
                        console.log('     cookies:'.yellow);
                        console.log(cookies);
                    }


                    console.log('     data:   '.yellow);
                    if (data) {
                        console.log(data);
                    }

                    console.log('\nWaiting for next request...\n'.italic.grey);

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
        }

        function getRealPath(filepath, cwd) {
            filepath = cwd ? path.join(cwd, filepath) : filepath;
            return path.join(process.cwd(), filepath);
        }

    });
};
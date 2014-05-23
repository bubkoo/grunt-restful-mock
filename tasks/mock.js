/*
 * grunt-restful-mock
 * 
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
                base: '',
                debug: false
            });
        options.base = options.hostname;

        function createMiddleware(connect, options) {
            var middlewares = [],
                debug;

            debug = grunt.option('debug') || options.debug === true;

            if (debug) {

            }

//            if (debug) {
//                connect.logger.format('request', ('[Mock] [:date]\\n').magenta +
//                        (' - Request:\\n').cyan +
//                        ('     method:    ').grey + ':method\\n' +
//                        ('     url:       ').grey + ':url\\n' +
//                        ('     status:    ').grey + ':status\\n' +
//                        ('     length:    ').grey + ':res[content-length]\\n' +
//                        ('     res-time:  ').grey + ':response-time ms'
//                );
//                middlewares.push(connect.logger('request'));
//            }

            middlewares.push(connect.logger());
            middlewares.push(connect.urlencoded());
            middlewares.push(connect.query());

            middlewares.push(function (req, res) {
                console.log('--------------------------------------------------');
                console.log(req.query);
                console.log(req.body);
                grunt.log.writeln(('     data:  ').grey + '');
                grunt.log.writeln((' - Response:').cyan);

                var body = '{"name":"bub"}',
                    headers = {
                        'Content-Type': 'application/json',
                        'Content-Length': body.length
                    };

                res.writeHead(200, headers);
                res.end(body);
            });

            return middlewares;
        };

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
                console.log(options);
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

                                grunt.log.writeln('Started API mock on ' + target);

//                            grunt.config.set('connect.' + taskTarget + '.options.hostname', hostname);
//                            grunt.config.set('connect.' + taskTarget + '.options.port', address.port);

//                                done();
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
    });
};
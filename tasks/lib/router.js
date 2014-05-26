/**
 * Module dependencies.
 */
var Layer = require('./layer');
var mockJson = require('./mockJson');
var parseUrl = require('parseurl');

/**
 * Expose `Router`.
 */
module.exports = Router;

function Router(options) {
    this.delay = options.delay;
    this.timeout = options.timeout;
    this.cookies = options.cookies;

    this.debug = options.debug;

    this.sensitive = options.sensitive;
    this.strict = options.strict;
    this.end = options.end;

    this.stack = [];

    this.add(options.route);
}

Router.prototype.add = function (rules) {

    if ('strng' === typeof rules) {
        rules = {};
        rules[rules] = {
            '*': {
                timeout: this.timeout,
                delay: this.delay,
                cookies: this.cookies,
                data: {
                }
            }
        };
    }

    rules = rules || {};

    var rule,
        methods,
        method,
        options,
        layer;

    for (rule in rules) {

        layer = new Layer(rule, {
            sensitive: this.caseSensitive,
            strict: this.strict,
            end: this.end
        });

        layer.methods = {};

        methods = rules[rule];
        for (method in methods) {

            options = methods[method];

            options.delay = options.delay || this.delay;
            options.timeout = 'undefined' === typeof options.timeout ? this.timeout : options.timeout;
            options.cookies = options.cookies || this.cookies;
            options.data = options.data || {};

            layer.methods[method.toLowerCase()] = options;
        }

        this.stack.push(layer);
    }
};

Router.prototype.handle = function (req, res) {
    var url = parseUrl(req),
        method = req.method.toLowerCase(),

        strict,
        methods,
        params,
        layer,
        options,

        i,
        len = this.stack.length;

    for (i = 0; i < len; i++) {
        layer = this.stack[i];
        methods = layer.methods;

        // 合并参数
        params = merge({}, req.query);
        merge(params, req.body);

        if ((strict = methods.hasOwnProperty(method) || methods.hasOwnProperty('*')) && layer.match(url.pathname)) {

            options = merge({}, strict ? methods[method] : methods['*']);

            // 合并参数
            req.params = merge(params, layer.params);
            // 生成 mock data
            res.body = mockJson(options.data, req.params);
//            res.cookies = mockJson(options.cookies, req.params);

            var body = JSON.stringify(res.body),
                headers = {
                    'Content-Type': 'application/json',
                    'Content-Length': body.length
                };
            res.writeHead(200, headers);
            res.end(body);

            return true;
        }
        else {
            req.params = params;
            res.statusCode = 404;
            res.end();
            return false;
        }
    }

    function merge(target, source) {
        target = target || {};
        source = source || {};

        var key,
            copyIsArray,
            clone,
            src,
            copy;

        for (key in source) {
            src = target[ key ];
            copy = source[ key ];
            if (target === copy) {
                continue;
            }
            if ((copyIsArray = Array.isArray(copy)) || Object.prototype.toString.call(copy) === '[object Object]') {
                if (copyIsArray) {
                    copyIsArray = false;
                    clone = src && Array.isArray(src) ? src : [];
                }
                else {
                    clone = src && typeof src === 'object' ? src : {};
                }
                target[ key ] = merge(clone, copy);
            }
            else if (copy !== undefined) {
                target[ key ] = copy;
            }
        }
        return target;
    }
};


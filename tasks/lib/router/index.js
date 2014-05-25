/**
 * Module dependencies.
 */
var Layer = require('./layer');
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
    var self = this,

        url = parseUrl(req),
        method = req.method.toLowerCase(),

        strict,
        methods,
        params,
        layer,
        options,

        i = 0,
        len = this.stack.length;

    for (; i < len; i++) {
        layer = this.stack[i];
        methods = layer.methods;

        params = merge({}, req.query);
        merge(params, req.body);

        if ((strict = methods.hasOwnProperty(method) || methods.hasOwnProperty('*')) && layer.match(url.pathname)) {
            options = strict ? methods[method] : methods['*'];
            req.params = merge(params, layer.params);
            res.body = options.data;
            res.cookies = options.cookies;

            var body = JSON.stringify(options.data),
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
        for (var key in source) {
            target[key] = source[key];
        }
        return target;
    }
};


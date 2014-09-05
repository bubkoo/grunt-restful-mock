/**
 * Module dependencies.
 */
var async = require('async');
var Layer = require('./layer');
var mockJson = require('./mockJson');
var parseUrl = require('parseurl');
var sign = require('cookie-signature').sign;
var cookie = require('cookie');

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

    // 只提供了路由字符串，返回空对象
    if ('strng' === typeof rules) {
        rules = {};
        rules[rules] = {
            '*': {
                timeout: this.timeout,
                delay  : this.delay,
                cookies: this.cookies,
                data   : {
                }
            }
        };
    }

    rules = rules || {};

    var rule,
        methods,
        method,
        options,
        cookies,
        layer,
        rRule = /(data)\|(?:([\+-]\d+)|(\d+-?\d*)?(?:\.(\d+-?\d*))?)/,
        key,
        val;

    for (rule in rules) {

        layer = new Layer(rule, {
            sensitive: this.caseSensitive,
            strict   : this.strict,
            end      : this.end
        });

        layer.methods = {};

        methods = rules[rule];
        for (method in methods) {

            options = methods[method];

            options.delay = options.delay || this.delay;
            options.timeout = 'undefined' === typeof options.timeout ? this.timeout : options.timeout;

            // cookies 应该是合并式，而不是覆盖式
            if (options.cookies && this.cookies) {
                cookies = merge({}, options.cookies, this.cookies);
            } else {
                cookies = options.cookies || this.cookies;
            }
            options.cookies = cookies;

            // 处理 data 是数组的情况
            // path/to/api: {
            //     get: {
            //         'data:1-10':[
            //
            //         ]
            //     }
            // }
            if (!options.data) {
                for (key in options) {
                    if (Object.prototype.hasOwnProperty.call(options, key)) {
                        if (rRule.test(key)) {
                            options.data = {};
                            options.data[key] = options[key];
                            options.isRaw = true;
                            break;
                        }
                    }
                }
            }

            options.data = options.data || {};


            layer.methods[method.toLowerCase()] = options;
        }

        this.stack.push(layer);
    }
};

Router.prototype.handle = function (req, res) {
    var
        url = parseUrl(req),
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
        if ((strict = methods.hasOwnProperty(method) || methods.hasOwnProperty('*')) && layer.match(url.pathname)) {

            options = merge({}, strict ? methods[method] : methods['*']);

            // 合并参数
            params = merge({}, req.query);
            merge(params, req.body);
            req.params = merge(params, layer.params);

            if (options.statusCode && options.statusCode !== 200) {
                options.statusCode = parseInt(options.statusCode, 10);
                if (isNaN(options.statusCode)) {
                    options.statusCode = 200;
                }
            } else {
                options.statusCode = 200;
            }
            if (options.statusCode >= 400) {
                handleStatusCode(req, res, options.statusCode);
            }
            else if (options.timeout === true || typeof options.timeout === 'number') {
                handleTimeout(req, res, options.timeout);
            } else {
                options.delay = parseInt(options.delay, 10);
                if (options.delay) {
                    delay(options.delay, function () {
                        handle(req, res, options);
                    });
                } else {
                    handle(req, res, options);
                }
            }
            return true;
        }
    }
    handle404(req, res);
    return false;
};

function handle(req, res, options) {
    handleCookies(req, res, options.cookies);
    handleJSON(req, res, options);
}

function handleJSON(req, res, options) {
    // 生成 mock data
    var raw = options.isRaw,
        ret = mockJson(options.data, req.params);
    if (raw) {
        res.body = ret.data;
    } else {
        res.body = ret;
    }
    var body = JSON.stringify(res.body),
        headers = {
            'Content-Type'  : 'application/json',
            'Content-Length': Buffer.byteLength(body)
        };

    res.writeHead(options.statusCode, headers);
    res.end(body);
}

function handleJSONP(req, res, options) {
}

function handleCookies(req, res, cookiesTemplate) {
    var cookies,
        cookie,
        cookieOptions,
        cookieName,
        cookieValue,
        i,
        j;

    if (!cookiesTemplate) {
        return;
    }

    cookies = mockJson(cookiesTemplate, req.params);
    if (!Array.isArray(cookies)) {
        cookies = [ cookies ];
    }
    res.cookies = cookies;
    j = cookies.length;

    for (i = 0; i < j; i++) {
        cookie = cookies[i];
        cookieOptions = cookie.options || {};
        for (cookieName in cookie) {
            if (cookieName !== 'options') {
                cookieValue = cookie[cookieName];
                setCookie(req, res, cookieName, cookieValue, cookieOptions);
            }
        }
    }
}

function handle404(req, res) {
    handleStatusCode(req, res, 404);
}

function handleTimeout(req, res, timeout) {
    if (typeof timeout === 'number' && timeout > 0) {
        delay(timeout, function () {
            handleStatusCode(req, res, 504)
        });
    } else {
        handleStatusCode(req, res, 504);
    }
}

function handleStatusCode(req, res, statusCode) {
    res.statusCode = statusCode;
    res.end();
}

function setCookie(req, res, name, val, options) {
    options = merge({}, options);
    var secret = req.secret;
    var signed = options.signed;

    if (signed && !secret) {
        throw new Error('cookieParser("secret") required for signed cookies');
    }

    if ('number' == typeof val) {
        val = val.toString();
    }
    if ('object' == typeof val) {
        val = 'j:' + JSON.stringify(val);
    }
    if (signed) {
        val = 's:' + sign(val, secret);
    }
    if ('maxAge' in options) {
        options.expires = new Date(Date.now() + options.maxAge);
        options.maxAge /= 1000;
    }
    if (null == options.path) {
        options.path = '/';
    }


    var headerVal = cookie.serialize(name, String(val), options);

    // supports multiple 'res.cookie' calls by getting previous value
    var prev = res.getHeader('Set-Cookie');
    if (prev) {
        if (Array.isArray(prev)) {
            headerVal = prev.concat(headerVal);
        } else {
            headerVal = [prev, headerVal];
        }
    }

    if (Array.isArray(headerVal)) {
        headerVal = headerVal.map(String);
    }
    else {
        headerVal = String(headerVal);
    }

    res.setHeader('Set-Cookie', headerVal);
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

function delay(ms, callback) {
    var now = +new Date(),
        tick = now;
    while (tick - now < ms) {
        tick = +new Date();
    }
    callback();
}
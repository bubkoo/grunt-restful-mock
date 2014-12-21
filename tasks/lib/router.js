var async = require('async');
var Layer = require('./layer');
var mockJSON = require('./mockJSON');
var parseUrl = require('parseurl');
var sign = require('cookie-signature').sign;
var cookie = require('cookie');


function Router(options) {
    // 模拟请求延时
    this.delay = options.delay;
    // 模拟请求超时
    this.timeout = options.timeout;
    // 全局 cookie
    this.cookies = options.cookies;

    // 调试模式
    this.debug = options.debug;

    this.sensitive = options.sensitive;
    this.strict = options.strict;
    this.end = options.end;

    this.stack = [];

    this.add(options.route);
}

Router.prototype.add = function (rules) {

    // 只提供了路由字符串，返回空对象
    if ('string' === typeof rules) {
        rules = {};
        rules[rules] = {
            '*': {
                timeout: this.timeout,
                delay: this.delay,
                cookies: this.cookies,
                data: { }
            }
        };
    }

    rules = rules || {};

    var path;
    var methods;
    var method;
    var options;
    var cookies;
    var layer;
    var rRule = /(data)\|(?:([\+-]\d+)|(\d+-?\d*)?(?:\.(\d+-?\d*))?)/;
    var key;
    var val;

    for (path in rules) {

        if (!rules.hasOwnProperty(path)) {
            continue;
        }

        layer = new Layer(path, {
            sensitive: this.caseSensitive,
            strict: this.strict,
            end: this.end
        });

        layer.methods = {};

        methods = rules[path];
        for (method in methods) {

            if (!methods.hasOwnProperty(method)) {
                continue;
            }

            options = methods[method];

            // 具体每条路由的选项
            options.delay = options.delay || this.delay;
            options.timeout = 'undefined' === typeof options.timeout ? this.timeout : options.timeout;

            // cookies 是合并的，而不是覆盖
            if (options.cookies && this.cookies) {
                cookies = merge({}, options.cookies, this.cookies);
            } else {
                cookies = options.cookies || this.cookies;
            }
            options.cookies = cookies;

            // 处理 data 是数组的情况
            //   path/to/api: {
            //       get: {
            //         'data|1-10':[
            //             ...
            //          ]
            //       }
            //   }
            if (!options.data) {
                for (key in options) {
                    if (Object.prototype.hasOwnProperty.call(options, key)) {
                        if (rRule.test(key)) {
                            options.data = {};
                            options.data[key] = options[key];
                            options.rootShift = true;
                            break;
                        }
                    }
                }
            }

            options.data = options.data || {};

            // method 可以是如下值：
            // get         指定一个 HTTP 谓词
            // get|post    竖线分隔，表示两个谓词共用同一套接口
            // *           代表所有 HTTP 谓词
            // get[param1=value1]
            // get[param1=value1, param2=value2 ...]
            // get|post[param1=value]|get[param2=value]
            layer.methods[method] = options;
        }

        this.stack.push(layer);
    }
};

Router.prototype.handle = function (req, res) {
    var url = parseUrl(req);
    var method = req.method.toLowerCase();

    var strict;
    var methods;
    var params;
    var layer;
    var options;

    for (var i = 0, len = this.stack.length; i < len; i++) {
        layer = this.stack[i];
        methods = layer.methods;
        // just for speed up
        strict = methods.hasOwnProperty(method);

        // url 匹配
        if (layer.match(url.pathname)) {
            // clone query params
            params = merge({}, req.query);
            // request body
            merge(params, req.body);
            // restful 参数
            req.params = merge(params, layer.params); // 注意：这里覆盖了req.params

            options = strict ? methods[method] : getOptions(methods, method, params);

            if (!options) {
                continue;
            }

            options = merge({}, options);

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
                    delay(options.delay, handle.bind(null, req, res, options));
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

// Exports
// -------

module.exports = Router;

// Helpers
// -------

function handle(req, res, options) {
    handleCookies(req, res, options.cookies);
    if (options.jsonp) {
        handleJSONP(req, res, options);
    } else {
        handleJSON(req, res, options);
    }
}

function handleJSON(req, res, options) {
    // 生成 mock data
    res.body = generateJSON(options.data, req.params, options.rootShift);
    var body = JSON.stringify(res.body),
        headers = {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        };

    res.writeHead(options.statusCode, headers);
    res.end(body);
}

function handleJSONP(req, res, options) {
    var body,
        headers,
        key = typeof options.jsonp !== 'string' ? 'callback' : options.jsonp,
        callback = req.params[key];

    res.body = generateJSON(options.data, req.params, options.rootShift);
    body = JSON.stringify(res.body);

    if (callback) {
        body = callback + '(' + body + ')';
    }
    headers = {
        'Content-Type': callback ? 'application/x-javascript' : 'application/json',
        'Content-Length': Buffer.byteLength(body)
    };
    res.writeHead(options.statusCode, headers);
    res.end(body);
}

function generateJSON(tpl, params, shift) {
    var ret = mockJSON(tpl, params);
    return shift ? ret.data : ret;
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

    cookies = mockJSON(cookiesTemplate, req.params);
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
            handleStatusCode(req, res, 504);
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

    if ('number' === typeof val) {
        val = val.toString();
    }
    if ('object' === typeof val) {
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

function getOptions(methods, method, params) {
    method = method.toLowerCase();
    for (var key in methods) {
        if (!methods.hasOwnProperty(key)) {
            continue;
        }

        var sections = key.split(/\s*\|\s*/g);
        var section;
        var matches;
        var innerMethod;
        var innerParams;

        while (section = sections.shift()) {
            matches = section.match(/(get|post|put|delete|head|options|trace|connect)(?:\s*\[\s*([^\]].*?)\s*\]\s*)?/i);
            if (matches) {
                innerMethod = matches[1];
                innerParams = matches[2];

                if (innerMethod && innerMethod.toLowerCase() === method) {
                    if (!innerParams || checkParams(innerParams, params)) {
                        return methods[key];
                    }
                }
            }
        }
    }
    if (methods.hasOwnProperty('*')) {
        return methods['*'];
    }
}

function checkParams(paramStr, params) {
    var parts = paramStr.split(/\s*,\s*/g);
    var part;

    while (part = parts.shift()) {
        var kv = part.split(/\s*=\s*/g);
        var key = kv[0];
        var value = kv[1];
        if (params.hasOwnProperty(key)) {
            // 兼容 get[param] 这种情况，只需要包含某个参数即可
            if (kv.length === 2 && value !== params[key]) {
                return false;
            }
        } else {
            return false;
        }
    }

    return true;
}
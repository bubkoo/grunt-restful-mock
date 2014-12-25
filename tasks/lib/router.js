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

    var rRule = /(data)\|(?:([\+-]\d+)|(\d+-?\d*)?(?:\.(\d+-?\d*))?)/;

    for (var path in rules) {
        if (!rules.hasOwnProperty(path)) {
            continue;
        }

        var layer = new Layer(path, {
            sensitive: this.caseSensitive,
            strict: this.strict,
            end: this.end
        });

        layer.methods = {};

        var methods = rules[path];
        for (var method in methods) {

            if (!methods.hasOwnProperty(method)) {
                continue;
            }

            var options = methods[method];

            // 具体每条路由的选项
            options.delay = options.delay || this.delay;
            options.timeout = 'undefined' === typeof options.timeout ? this.timeout : options.timeout;

            var cookies;
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
                for (var key in options) {
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

    for (var i = 0, len = this.stack.length; i < len; i++) {
        var layer = this.stack[i];
        var methods = layer.methods;
        // just for speed up
        var strict = methods.hasOwnProperty(method);

        // url 匹配
        if (layer.match(url.pathname)) {
            // clone query params
            var params = merge({}, req.query);
            // request body
            merge(params, req.body);
            // restful 参数
            req.params = merge(params, layer.params); // 注意：这里覆盖了req.params

            var options = strict ? methods[method] : getOptions(methods, method, params);
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

    var body = JSON.stringify(res.body);
    var headers = {
        /*
         * 支持跨域请求
         */
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With, accept, origin, content-type',
        'Access-Control-Allow-Methods': 'PUT,GET,POST,DELETE,OPTIONS',

        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
    };

    res.writeHead(options.statusCode, headers);
    res.end(body);
}

function handleJSONP(req, res, options) {
    var key = typeof options.jsonp !== 'string' ? 'callback' : options.jsonp;
    var callback = req.params[key];

    res.body = generateJSON(options.data, req.params, options.rootShift);
    var body = JSON.stringify(res.body);

    if (callback) {
        body = callback + '(' + body + ')';
    }
    var headers = {
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
    if (!cookiesTemplate) {
        return;
    }

    var cookies = mockJSON(cookiesTemplate, req.params);
    if (!Array.isArray(cookies)) {
        cookies = [ cookies ];
    }
    res.cookies = cookies;

    for (var i = 0, j = cookies.length; i < j; i++) {
        var cookie = cookies[i];
        var cookieOptions = cookie.options || {};
        for (var cookieName in cookie) {
            if (cookieName !== 'options') {
                var cookieValue = cookie[cookieName];
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


    for (var key in source) {
        var src = target[ key ];
        var copy = source[ key ];
        if (target === copy) {
            continue;
        }

        var copyIsArray = Array.isArray(copy);
        if (copyIsArray || Object.prototype.toString.call(copy) === '[object Object]') {
            var clone;
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
    var now = +new Date();
    var tick = now;

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

        while (section = sections.shift()) {
            var matches = section.match(/(get|post|put|delete|head|options|trace|connect)(?:\s*\[\s*([^\]].*?)\s*\]\s*)?/i);
            if (matches) {
                var innerMethod = matches[1];
                var innerParams = matches[2];

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

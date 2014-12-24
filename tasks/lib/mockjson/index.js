var random = require('../random');

var rRule = /(.+)\|(?:([\+-]\d+)|(\d+-?\d*)?(?:\.(\d+-?\d*))?)/;
var rPlaceholder = /@(\w[\w|\d]*)(?:\((.*)\)(?![\)\w\d]))?/g;

var handle = {
    'number': function (options) {
        var result, parts;

        // 含有小数部分
        if (options.rule.dRange) {
            // 分隔原数字
            // 1 -> [1]
            // 3.14 -> [3, 14]
            parts = (options.template + '').split('.');

            // 优先使用由规则所产生的整数
            parts[0] = options.rule.iRange ? options.rule.iCount : parts[0];

            // 截取原数字的小数位数到指定的位数
            parts[1] = (parts[1] || '').slice(0, options.rule.dCount);

            // 位数不足时，补全小数部分
            while (parts[1].length < options.rule.dCount) {
                parts[1] += random.char('number');
            }
            result = toFloat(parts.join('.'));
        } else if (options.rule.iRange) {
            // 只包含整数部分
            result = options.rule.iCount;
        }
        else if (options.rule.step !== undefined) {
            // 自增/减
            // TODO: step
            result = options.template + options.rule.step;
        } else {
            result = options.template;
        }

        return result;
    },

    'boolean': function (options) {
        var result = options.template;

        result = options.rule.iMax ?
            random.bool(options.rule.iMin, options.rule.iMax, result) :
            options.rule.iCount ?
                random.bool(1, 1, result) : result;

        return result;
    },

    'array': function (options) {
        var result = [];
        var len = options.template.length;    // 原数组长度
        var count = options.rule.iCount || 0; // 重复次数

        while (count--) {
            var j = 0;
            while (j < len) {
                var item = generate(j, options.template[j], options.data, options.root);
                result.push(item);
                j++;
            }
        }

        return result;
    },

    'object': function (options) {
        var result = {};
        var keys = getKeys(options.template);

        // 随机选取 count 个属性
        if (options.rule.iRange && options.rule.iCount > 0) {
            keys = random.shuffle(keys);
            keys = keys.slice(0, options.rule.iCount);
        }

        for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i];
            var parsedKey = key.replace(rRule, '$1');
            result[parsedKey] = generate(key, options.template[key], options.data, options.root);

            var inc = key.match(rRule);
            if (inc && inc[2] && 'number' === getType(options.template[key])) {
                options.template[key] += toInt(inc[2]);
            }
        }

        return result;
    },

    'function': function (options) {
        var result = options.template(options.data);
        var type = getType(result);

        if (handle[type]) {
            result = handle[type]({
                template: result,
                type: type,
                rule: options.rule,
                root: options.root,
                data: options.data
            });
        }

        return result;
    },

    '_parseString': function (options, raw) {
        var result = options.template;
        var phs = result.match(rPlaceholder) || [];
        var length = phs.length;

        if (raw) {
            result = {
                template: result,
                handled: [],
                placeholders: []
            };
        }

        for (var i = 0; i < length; i++) {
            var ph = phs[i];
            var handed = this.placeholder(ph, options);

            if (raw) {
                result.handled.push(handed);
                result.placeholders.push(ph);
            } else {
                if (length === 1 && ph === result) {
                    result = handed; // 保留原数据格式
                } else {
                    result = result.replace(ph, handed);
                }
            }
        }

        return result;
    },

    'string': function (options) {
        var result = '';
        var length = options.rule.iCount || 1;
        var template = options.template;

        if (template) {
            // 重复字符串
            while (length--) {
                result += template;
            }
            options.template = result;
            result = this._parseString(options);
        } else {
            // 没有提供模板则随机生成长度为 length 的字符串
            result = options.rule.iRange ? random.string(length) : template;
        }
        return result;
    },

    'placeholder': function (placeholder, options) {
        // 全局匹配复位
        rPlaceholder.exec('');

        var result = '';
        var parts = rPlaceholder.exec(placeholder);
        var methodName = parts && parts[1];
        var params = parts && parts[2];

        methodName = methodName.toUpperCase();
        var method = random[methodName];
        if (!method) {
            return placeholder;
        }

        // 尝试获取 placeholder 的参数
        // '1' -> [1]
        // '1, 2, 3' ->[1, 2, 3]
        // '1, "str1"' -> [1,'str1']
        // 如果参数中有嵌套的 placeholder 将获取失败，例如
        // ‘@int’ -> '@int'
        // '@int, 1' -> '@int, 1'
        params = params ? getArguments(params) : [];

        // 如果获取参数成功，那么 params 为参数数组，否则为字符串
        if (typeof params === 'string') {
            params = this._parseString({
                template: params,
                data: options.data,
                root: options.root,
                rule: {}
            }, true);
            params = reGetArguments(params);
        }

        if (getType(method) === 'function') {
            if (methodName === 'FROMDATA') {
                params = options.data;
            }
            result = method.apply(random, params);
            if (isUndefined(result)) {
                result = '';
            }
        } else {
            // 不是 function，直接返回获取到的数据
            result = method;
        }

        return result;
    }
};


function getArguments(paramStr) {
    var fun;

    try {
        fun = new Function('return [' + paramStr + ']');
        return fun();
    } catch (error) {
        // 参数不合法时，抛出异常
        // 包含嵌套的占位符时会抛出异常
        return paramStr;
    }
}

function reGetArguments(rawData) {
    var result = rawData.template;
    var handled = rawData.handled;
    var phs = rawData.placeholders;

    var objParam = [];

    for (var i = 0, l = handled.length; i < l; i++) {
        var type = typeof handled[i];

        type === 'undefined' && (handled[i] = '');
        // 简单类型直接替换
        if (type === 'boolean' || type === 'string' ||
            type === 'number' || type === 'undefined') {
            result = result.replace(phs[i], handled[i]);
        } else {
            // PS:
            //   @randomDate, "YYYY-MM-DD HH:mm:ss"
            result = result.replace(phs[i], '"{[<' + objParam.length + '>]}"');
            objParam.push(handled[i]);
        }
    }

    result = getArguments(result);

    if (typeof result === 'string') {
        // 再次失败，已经无力了，返回空数组
        result = [];
    } else {
        for (i = 0, l = objParam.length; i < l; i++) {
            for (m = 0, n = result.length; m < n; m++) {
                if (result[m] === '{[<' + i + '>]}') {
                    result[m] = objParam[i];
                }
            }
        }
    }

    return result;
}

function getRules(rule) {

    var rRange = /(\d+)-?(\d+)?/,

        matches = ((rule + '') || '').match(rRule),
        // 键
        key = matches && matches[1] || rule,
        //
        step = matches && matches[2] && toInt(matches[2]),

        // 整数部分范围
        iRange = matches && matches[3] && matches[3].match(rRange),
        iMin = iRange && toInt(iRange[1]),
        iMax = iRange && toInt(iRange[2]),
        iCount = iRange ? !iRange[2] && iMin || random.int(iMin, iMax) : undefined,

        // 小数范围
        dRange = matches && matches[4] && matches[4].match(rRange),
        dMin = dRange && toInt(dRange[1]),
        dMax = dRange && toInt(dRange[2]),
        dCount = dRange ? !dRange[2] && dMin || random.int(dMin, dMax) : undefined;

    return {
        rule: rule,
        key: key,
        step: step,
        iRange: iRange,
        iMin: iMin,
        iMax: iMax,
        iCount: iCount,
        dRange: dRange,
        dMin: dMin,
        dMax: dMax,
        dCount: dCount
    };
}

function generate(key, template, data, root) {
    var rule = getRules(key);
    var type = getType(template);

    root = root || template; // 根模板
    if (handle[type]) {
        return handle[type]({
            template: template,
            type: type,
            rule: rule,
            root: root,
            data: data
        });
    }
    return template;
}

module.exports = generate;


// Helpers
// ----------------

function getType(object) {
    if (object === null || object === undefined) {
        return String(object);
    } else {
        return Object.prototype.toString.call(object).match(/\[object (\w+)\]/)[1].toLowerCase();
    }
}

function getKeys(object) {
    var keys = [];
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}

function toInt(value) {
    return parseInt(value, 10);
}

function toFloat(value) {
    return parseFloat(value);
}

function isUndefined(value) {
    return typeof value === 'undefined';
}

function isNumeric(value) {
    if (value === null || value === '') {
        return false;
    }
    return !isNaN(value) && isFinite(value);
}
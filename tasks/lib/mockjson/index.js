var random = require('../random');

var rRule = /(.+)\|(?:([\+-]\d+)|(\d+-?\d*)?(?:\.(\d+-?\d*))?)/;
var rPlaceholder = /(?:[^\\])?@([^@#%&()\?\s\/\.]+)(?:\((.*?)\)(?!\)))?/g;

var handle = {
    'string': function (options) {
        var result = '',
            placeholders,
            placeholder,
            handed,
            i = 0,
            len = options.rule.iCount || 1;

        if (options.template.length) {
            while (len--) {
                result += options.template;
            }
            // 处理模板中的占位符
            placeholders = result.match(rPlaceholder) || [];
            for (i = 0, len = placeholders.length; i < len; i++) {
                placeholder = placeholders[i];
                handed = handle.placeholder(placeholder, options);

                // 有且仅有一个 placeholder, 适当地做类型转换
                if (len === 1 &&
                    result === placeholder &&
                    typeof result !== typeof handed) {
                    if (/^(true|false)$/.test(handed)) {
                        result = handed === 'true' ? true : handed === 'false' ? false : handed;
                    }
                    else if (isNumeric(handed)) {
                        result = toFloat(handed);
                    }
                    else {
                        result = handed;
                    }
                    break;
                }
                result = result.replace(placeholder, handed);
            }
        } else {
            result = options.rule.iRange ? random.string(len) : options.template;
        }

        return result;
    },

    'number': function (options) {
        var result,
            parts;
        // 含有小数部分
        if (options.rule.dRange) {
            parts = (options.template + '').split('.');
            // 优先使用由范围所产生的整数
            parts[0] = options.rule.iRange ? options.rule.iCount : parts[0];
            parts[1] = (parts[1] || '').slice(0, options.rule.dCount);
            // 补全小数部分
            while (parts[1].length < options.rule.dCount) {
                parts[1] += random.char('number');
            }
            result = toFloat(parts.join('.'));
        } else if (options.rule.iRange) {
            // 只包含整数部分
            result = options.rule.iCount;
        }
        else {
            // 自增/减
            result = options.template;
        }
        return result;
    },

    'boolean': function (options) {
        var result;
        result = options.rule.iRange ?
            random.bool(options.rule.iMin, options.rule.iMax, options.template)
            : options.template;
        return result;
    },

    'array': function (options) {
        var result = [],
            item,
            i,
            j,
            len = options.template.length,
            count;
        count = options.rule.iCount || 0;
        for (i = 0; i < count; i++) {
            j = 0;
            while (j < len) {
                item = generate(options.template[j], j, options.data, options.root);
                result.push(item);
                j++;
            }
        }
        return result;
    },

    'object': function (options) {
        var result = {},
            keys,
            key,
            parsedKey,
            inc,
            i,
            length;
        keys = getKeys(options.template);
        // 随机选取 count 个属性
        if (options.rule.iRange && options.rule.iCount > 0) {
            keys = random.shuffle(keys);
            keys = keys.slice(0, options.rule.iCount);
        }
        for (i = 0, length = keys.length; i < length; i++) {
            key = keys[i];
            parsedKey = key.replace(rRule, '$1');
            result[parsedKey] = generate(options.template[key], key, options.data, options.root);

            inc = key.match(rRule);
            if (inc && inc[2] && 'number' === getType(options.template[key])) {
                options.template[key] += toInt(inc[2]);
            }
        }
        return result;
    },

    'function': function (options) {
        var result = options.template(options.data),
            type = getType(result);
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

    'placeholder': function (placeholder, options) {
        // 全局匹配复位
        rPlaceholder.exec('');

        var result = '';
        var parts = rPlaceholder.exec(placeholder);
        var methodName = parts && parts[1];

        methodName = methodName.toUpperCase();

        var method = random[methodName];

        if (!method) {
            return placeholder;
        }

        var params = parts && parts[2];
        var placeholders;
        var handled;

        params = params && params.split(/\s*,\s*/g);
        params = params || [];

        for (var i = 0, len = params.length; i < len; i++) {
            // 优先尝试转换为数字
            if (isNumeric(params[i])) {
                params[i] = toFloat(params[i]);
            } else if (params[i] === 'true' || params[i] === 'false') {
                params[i] = Boolean(params[i]);
            } else {
                // 处理嵌套 placeholder
                placeholders = params[i].match(rPlaceholder);
                if (placeholders) {
                    for (var j = 0, k = placeholders.length; j < k; j++) {
                        handled = handle.placeholder(placeholders[j], options);
                        params[i] = params[i].replace(placeholders[j], handled);
                    }
                } else {
                    // 处理字符串，将字符串首位的引号去掉，因为本来就是字符串
                    // '"param"' -> 'param'
                    // '\'param\'' -> 'param'
                    params[i] = params[i].replace(/^('|")(.*)(\1)$/, '$2');
                }
            }
        }

        switch (getType(method)) {
            case 'array':
                result = random.pick(method);
                break;
            case 'function':
                if (methodName === 'FROMDATA') {
                    params.push(options.data);
                }
                result = method.apply(random, params);
                if (isUndefined(result)) {
                    result = '';
                }
                break;
        }
        return result;
    }
};


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

function generate(template, key, data, root) {
    if (arguments.length === 2) {
        data = key;
        key = null;
    }
    var rule = getRules(key),
        type = getType(template);
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
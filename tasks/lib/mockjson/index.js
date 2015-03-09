var nativeRandom = require('../random');

var rRule = /(.+)\|(?:([\+-]\d+)|(\d+-?\d*)?(?:\.(\d+-?\d*))?)/;
// var rPlaceholder = /@(\w[\w|\d]*)(?:(\(.*\))(?![\)\w\d]))?/g;
// var rPlaceholder = /(?:.)?@([a-zA-Z_]\w*)(?:(\(.*\))(?!\)))?/g;
var rPlaceholder = /(?:.)?@([a-zA-Z_]\w*)(?:\((.*)\)(?!\)))?/g;

var random;
var handle = {
    'number': function (options) {
        var result;

        // 含有小数部分
        if (options.rule.dRange) {
            // 分隔原数字
            // 1 -> [1]
            // 3.14 -> [3, 14]
            var parts = (options.template + '').split('.');

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
        var count = options.rule.iCount || 1; // 重复次数

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
        var keys = Object.keys(options.template);

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

    'string': function (options) {
        var result = '';
        var length = options.rule.iCount || 1;
        var template = options.template;

        if (template) {
            // 重复模板字符串
            while (length--) {
                result += template;
            }
            options.template = result;
            result = renderPlaceholder(result);
        } else {
            // 没有提供模板则随机生成长度为 length 的字符串
            result = options.rule.iRange ? random.string(length) : template;
        }
        return result;
    }
};

function exePlaceholder(template, methodName, argsString) {
    var result = template;
    try {
        methodName = methodName.toUpperCase();
        argsString = renderPlaceholder(argsString || '');
        //        result = random[methodName].apply(random, argsString.split(/\s*,\s*/g));
        var fnBody = 'return ' + 'this.' + methodName + '(' + argsString + ');';
        var fn = new Function(fnBody);
        result = fn.call(random);
    } catch (error) {
        result += ' ERROR: [' + error + ']';
    }
    return result;
}

function renderPlaceholder(template) {
    var result = template;
    var assigned = false;

    if (template.match(rPlaceholder)) {
        template = template.replace(rPlaceholder, function (input, methodName, argsString) {
            var firstChar = input[0];
            var hasSlash = firstChar === '\\';
            var ret = hasSlash
                ? input.substr(1)
                : exePlaceholder(input, methodName, argsString);
            if (template === input) {
                assigned = true;
                result = ret;
            } else {
                if (!hasSlash && firstChar !== '@') {
                    ret = firstChar + ret;
                }
            }
            return ret + '';
        });
        assigned || (result = template);
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
    var type = getType(template);
    var rule = getRules(key);

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

module.exports = function (template, data, placeholders) {
    random = nativeRandom.extend(placeholders);
    // 初始化 formData
    random.params = data;
    return generate(null, template, data, template);
};


// Helpers
// -------

function getType(object) {
    if (object === null || object === undefined) {
        return String(object);
    } else {
        return Object.prototype.toString.call(object).match(/\[object (\w+)\]/)[1].toLowerCase();
    }
}

function toInt(value) {
    return parseInt(value, 10);
}

function toFloat(value) {
    return parseFloat(value);
}
(function (undefined) {

    var rRule = /(.+)\|(?:\([+-]\d+)|(\d+-?\d*)?(?:\.(\d+-?\d*))?)/,
        rPlaceholder = /\\*@([^@#%&()\?\s\/\.]+)(?:\((.*?)\))?/g,
        handle = function () {
            var proto = {
                'extend': extend
            };
            proto.extend({
                'string': function (options) {
                    var result = '',
                        placeholders,
                        placeholder,
                        i = 0,
                        len = options.rule.iCount;

                    if (options.template.length) {
                        while (len--) {
                            result += options.template;
                        }
                        // 处理模板中的占位符
                        placeholders = result.match(rPlaceholder) || [];
                        for (i = 0, len = placeholders.length; i < len; i++) {
                            placeholder = placeholders[i];
                            if (/^\\/.test(placeholder)) {
                                placeholders.splice(i--, 1);
                            } else {

                            }
                        }
                    } else {
                        result = options.rule.iRange
                            ? random.string(len)
                            : options.template
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
                            parts[1] += random.character('number');
                        }
                        result = float(parts.join('.'));
                    } else if (options.rule.iRange) {
                        // 只包含整数部分
                        result = options.rule.iCount;
                    }
                    else {
                        // 自增/减
                        isUndefined(options.rule.step) || (options.template += options.rule.step);
                        result = options.template;
                    }
                    return result;
                },
                'boolean': function (options) {
                    var result;
                    result = options.rule.iRange
                        ? random.bool(options.rule.iMin, options.rule.iMax, options.template)
                        : options.template;
                    return result;
                },
                'array': function (options) {
                    var result = [],
                        i,
                        j,
                        len = options.template.length,
                        count;
                    count = options.rule.iCount || 1;
                    for (i = 0; i < count; i++) {
                        j = 0;
                        while (j < len) {
                            result.push(generate(options.template[j]), j, options.data, options.root);
                            j++;
                        }
                    }
                },
                'object': function (options) {
                    var result = {},
                        keys,
                        key,
                        parsedKey,
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
                    }
                    return result;
                },
                'function': function (options) {

                }
            });

            handle.extend({
                'placeholder': function (placeholder, data) {
                    var parts = rPlaceholder.exec(placeholder),
                        key = parts && parts[1],
                        lKey = key && key.toLowerCase(),
                        params = parts && parts[2] || '';

                    params = params.split(/\s*,\s*/g);
                }
            });

            return proto;
        }(),
        random = function () {
            var proto = {
                'extend': extend
            };
            proto.extend({
                'int': function (min, max) {
                    min = isUndefined(min) ? -9007199254740992 : int(min);
                    max = isUndefined(max) ? 9007199254740992 : int(max);
                    return Math.round(Math.random() * (max - min)) + min;
                },
                'natural': function (min, max) {
                    min = isUndefined(min) ? 0 : int(min);
                    max = isUndefined(max) ? 9007199254740992 : int(max);
                    return Math.round(Math.random() * (max - min)) + min;
                },
                'bool': function (min, max, cur) {
                    if (isUndefined(cur)) {
                        return Math.random() >= 0.5;
                    }
                    min = isUndefined(min) || isNaN(min) ? 1 : int(min);
                    max = isUndefined(max) || isNaN(max) ? 1 : int(max);
                    return Math.random() > min / (min + max) ? !cur : !!cur;
                },
                'float': function () {
                },
                'char': function (pool) {
                    var pools = {
                        lower: 'abcdefghijklmnopqrstuvwxyz',
                        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                        number: '0123456789',
                        symbol: '!@#$%^&*()[]'
                    };
                    pools.alpha = pools.lower + pools.upper;
                    pools['undefined'] = pools.lower + pools.upper + pools.number + pools.symbol;
                    pool = pools[('' + pool).toLowerCase()] || pool;
                    return pool.charAt(random.natural(0, pool.length - 1));
                },
                'string': function (pool, min, max) {
                    var length,
                        result = '',
                        l = arguments.length;

                    if (l === 3) {
                        length = random.natural(min, max);
                    } else if (l === 2) {
                        if ('string' === typeof pool) {
                            length = min;
                        } else {
                            length = random.natural(pool, min);
                            pool = undefined;
                        }
                    } else if (l === 1) {
                        length = pool;
                        pool = undefined;
                    } else {
                        length = random.natural(3, 9);
                    }
                    while (length--) {
                        result += random.char(pool);
                    }
                    return result;
                }
            });
            proto.extend({
                // 首字母大写
                capitalize: function (word) {
                    return (word + '').charAt(0).toUpperCase() + (word + '').substr(1);
                },
                'upper': function (str) {
                    return (str + '').toUpperCase();
                },
                'lower': function (str) {
                    return (str + '').toLowerCase();
                },
                // 返回字符串中的一个字符
                'pick': function (arr) {
                    arr = arr || [];
                    return arr[this.natural(0, arr.length - 1)];
                },
                // 随机打乱数组
                'shuffle': function (arr) {
                    arr = arr || [];
                    var old = arr.slice(0),
                        result = [],
                        index = 0,
                        length = old.length;
                    for (var i = 0; i < length; i++) {
                        index = this.natural(0, old.length - 1);
                        result.push(old[index]);
                        old.splice(index, 1);
                    }
                    return result;
                }
            });
            return proto;
        }();

    function getRules(rule) {

        var rRange = /(\d+)-?(\d+)?/,

            matches = (rule || '').match(rRule),
            key = matches && matches[1] || rule,
            step = matches && matches[2] && int(matches[2]),
            iRange = matches && matches[3] && matches[3].match(rRange),
            iMin = iRange && int(iRange[1], 10),
            iMax = iRange && int(iRange[2], 10),
            iCount = iRange ? !iRange[2] && iMin || random.integer(iMin, iMax) : 1,
            dRange = matches && matches[4] && matches[4].match(rRange),
            dMin = dRange && int(dRange[1], 10),
            dMax = dRange && int(dRange[2], 10),
            dCount = dRange ? !dRange[2] && dMin || random.integer(dMin, dMax) : 1;

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

    // Helpers
    // ----------------

    function getType(value) {
        if (obj === null || obj === undefined) {
            return String(value)
        } else {
            return Object.prototype.toString.call(obj).match(/\[object (\w+)\]/)[1].toLowerCase();
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

    function getValues(object) {
        var values = [];
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                values.push(object[key]);
            }
        }
        return values;
    }

    function int(value) {
        return parseInt(value);
    }

    function float(value) {
        return parseFloat(value, 10);
    }

    function isArray(value) {
        if (Array.isArray) {
            return Array.isArray(value);
        } else {
            return getType(value) === 'array';
        }
    }

    function isObject(value) {
        return typeof value === 'object';
    }

    function isUndefined(value) {
        return typeof value === 'undefined';
    }


    function extend() {
        var target = arguments[0] || {},
            i = 1,
            len = arguments.length,
            copyIsArray,
            source,
            key,
            src,
            copy,
            clone;

        if (len === 1) {
            target = this;
            i = 0;
        }
        for (; i < len; i++) {
            // 忽略 null 或者 undefined 的对象
            if ((source = arguments[i]) != null) {
                for (key in source) {
                    src = target[ key ];
                    copy = source[ key ];
                    if (target === copy) {
                        continue;
                    }
                    if (copyIsArray = isArray(copy) || isObject(copy)) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];
                        }
                        else {
                            clone = src && isObject(src) ? src : {};
                        }
                        target[ key ] = extend(clone, copy);
                    } else if (copy !== undefined) {
                        target[ key ] = copy;
                    }
                }
            }
        }
        return target;
    }
})();
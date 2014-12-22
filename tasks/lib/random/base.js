module.exports = {
    // 随机整数
    'int': function (min, max) {
        min = isNumber(min) ? toInt(min) : -9007199254740992;
        max = isNumber(max) ? toInt(max) : 9007199254740992;
        return Math.round(Math.random() * (max - min)) + min;
    },

    'integer': function (min, max) {
        return this.int(min, max);
    },

    // 随机自然数
    'natural': function (min, max) {
        min = isNumber(min) ? toInt(min) : 0;
        max = isNumber(max) ? toInt(max) : 9007199254740992;
        return Math.round(Math.random() * (max - min)) + min;
    },

    // 随机 boolean
    'bool': function (min, max, cur) {
        if (isUndefined(cur)) {
            return Math.random() >= 0.5;
        }
        min = isNumber(min) ? toInt(min) : 1;
        max = isNumber(max) ? toInt(max) : 1;
        return Math.random() > min / (min + max) ? !cur : !!cur;
    },

    'boolean': function (min, max, cur) {
        return this.bool(min, max, cur);
    },

    'float': function (min, max, dMin, dMax) {
        dMin = isNumber(dMin) ? toInt(dMin) : 0;
        dMin = Math.max(Math.min(dMin, 17), 0);
        dMax = isNumber(dMax) ? toInt(dMax) : 17;
        dMax = Math.max(Math.min(dMax, 17), 0);
        var ret = this.integer(min, max) + '.';
        for (var i = 0, dCount = this.natural(dMin, dMax); i < dCount; i++) {
            ret += this.char('number');
        }
        return toFloat(ret);
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
        return pool.charAt(this.natural(0, pool.length - 1));
    },

    'character': function (pool) {
        return this.char(pool);
    },

    'string': function (pool, min, max) {
        var strLength;
        var result = '';
        var len = arguments.length;

        var typeStr = typeof pool;

        if (len === 3) {
            strLength = this.natural(min, max);
        } else if (len === 2) {
            if ('string' === typeStr) {
                strLength = min;
            } else {
                strLength = this.natural(pool, min);
                pool = undefined;
            }
        } else if (len === 1) {
            if (typeStr === 'number') {
                strLength = pool;
                pool = undefined;
            } else {
                strLength = this.natural(3, 9);
            }
        } else {
            pool = undefined;
            strLength = this.natural(3, 9);
        }

        while (strLength--) {
            result += this.char(pool);
        }

        return result;
    },

    'str': function (pool, min, max) {
        return this.string(pool, min, max);
    },

    // 首字母大写
    'capitalize': function (word) {
        word = word + '';
        return word.charAt(0).toUpperCase() + word.substr(1);
    },

    'upper': function (str) {
        return (str + '').toUpperCase();
    },

    'lower': function (str) {
        return (str + '').toLowerCase();
    }
};


// Helpers
// -------

function isNumber(val) {
    return !isUndefined(val) && !isNaN(val) && isFinite(val);
}

function toInt(val) {
    return parseInt(val, 10);
}

function toFloat(value) {
    return parseFloat(value);
}

function isUndefined(object) {
    return 'undefined' === typeof object;
}
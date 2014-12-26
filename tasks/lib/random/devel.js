var autoIncrementInteger = 0;

module.exports = {
    'formItem': function (keys) {
        var data = this.params || {};
        var result;

        if (typeof keys === 'string') {
            result = data[keys];
        } else if (Object.prototype.toString.call(keys) === 'object Array') {
            result = [];
            keys.forEach(function (key) {
                result.push(data[key]);
            });
        } else {
            result = keys;
        }

        return result;
    },

    'increment': function (start, step) {
        return autoIncrementInteger += +step || 1;
    },

    'inc': function (start, step) {
        return this.increment(step);
    }
};
var autoIncrementInteger = 0;

module.exports = {
    'fromData': function (path, data) {

        var result;
        var copy = data;
        var parts = path.split('.');

        for (var i = 0, l = parts.length; i < l; i++) {
            if (parts[i] in copy) {
                copy = copy[parts[i]];
            }
            if (i === l - 1) {
                result = copy;
            }
        }
        return result;
    },

    'increment': function (step) {
        return autoIncrementInteger += +step || 1;
    },

    'inc': function (step) {
        return this.increment(step);
    }
};


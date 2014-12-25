var autoIncrementInteger = 0;

module.exports = {
    'formItem': function (key) {
        var data = this.formData;
        return data && data[key] || '';
    },

    'increment': function (start, step) {
        return autoIncrementInteger += +step || 1;
    },

    'inc': function (start, step) {
        return this.increment(step);
    }
};


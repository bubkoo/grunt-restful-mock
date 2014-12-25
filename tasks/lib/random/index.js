var random = {
    extend: function () {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this);
        args.unshift({});
        return merge.apply(null, args);
    }
};

'base dx array address datetime form network names article color devel'.split(' ')
    .forEach(function (name) {
        var module = require('./' + name);
        merge(random, module);
    });

module.exports = random;

// Helpers
// -------

function merge() {
    var result = arguments[0] || {};
    for (var i = 1, length = arguments.length; i < length; i++) {
        var source = arguments[i] || {};
        for (var method in source) {
            if (source.hasOwnProperty(method)) {
                result[method] = source[method];
                // to upper case
                var upper = method.toUpperCase();
                if (upper === method) {
                    continue;
                }
                result[upper] = source[method];
            }
        }
    }
    return result;
}

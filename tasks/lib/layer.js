var pathRegexp = require('path-to-regexp');

function Layer(path, options) {
    if (!(this instanceof Layer)) {
        return new Layer(path, options);
    }

    options = options || {};
    this.regexp = pathRegexp(path, this.keys = [], options);
}

/**
 * Check if this route matches `path`, if so populate `.params`.
 *
 * @param {String} path
 * @return {Boolean}
 */

Layer.prototype.match = function (path) {
    var keys = this.keys;
    var params = this.params = {};
    var matches = this.regexp.exec(path);
    var n = 0;

    if (!matches) {
        return false;
    }

    this.path = matches[0];

    for (var i = 1, len = matches.length; i < len; ++i) {
        var key = keys[i - 1];

        var val;
        try {
            val = 'string' === typeof matches[i] ?
                decodeURIComponent(matches[i]) :
                matches[i];
        } catch (e) {
            var err = new Error("Failed to decode param '" + matches[i] + "'");
            err.status = 400;
            throw err;
        }

        if (key) {
            params[key.name] = val;
        } else {
            params[n++] = val;
        }
    }

    return true;
};

module.exports = Layer;
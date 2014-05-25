/**
 * Module dependencies.
 */
var pathRegexp = require('path-to-regexp');

/**
 * Expose `Layer`.
 */

module.exports = Layer;

function Layer(path, options) {
    if (!(this instanceof Layer)) {
        return new Layer(path, options);
    }

    options = options || {};
    this.regexp = pathRegexp(path, this.keys = [], options);
}

/**
 * Check if this route matches `path`, if so
 * populate `.params`.
 *
 * @param {String} path
 * @return {Boolean}
 * @api private
 */

Layer.prototype.match = function (path) {
    var keys = this.keys;
    var params = this.params = {};
    var m = this.regexp.exec(path);
    var n = 0;
    var key;
    var val;

    if (!m) return false;

    this.path = m[0];

    for (var i = 1, len = m.length; i < len; ++i) {
        key = keys[i - 1];

        try {
            val = 'string' == typeof m[i]
                ? decodeURIComponent(m[i])
                : m[i];
        } catch (e) {
            var err = new Error("Failed to decode param '" + m[i] + "'");
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
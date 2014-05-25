/**
 * Module dependencies.
 */
var Router = require('./router');

/**
 * Expose `Application`.
 */
module.exports = Application;

function Application(options) {
    this.options = options;
    this.router = new Router(options);
}

Application.prototype.handle = function (req, res) {
    return this.router.handle(req, res);
};
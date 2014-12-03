
var Router = require('./router');

module.exports = Application;

function Application(options) {
    this.options = options;
    this.router = new Router(options);
}

Application.prototype.handle = function (req, res) {
    return this.router.handle(req, res);
};
[5, 10, 20, 50, 100, 200, 500, 1000].forEach(function (len) {
    exports['d' + len] = function () {
        return this.natural(1, len);
    }
});
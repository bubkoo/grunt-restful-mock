[4, 6, 8, 12, 20, 50, 100, 200, 500, 100].forEach(function (len) {
    exports['d' + len] = function () {
        return this.natural(1, len);
    }
});
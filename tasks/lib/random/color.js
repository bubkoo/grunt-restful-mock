module.exports = {
    // 随机颜色
    color: function () {
        var color = Math.floor(Math.random() * (16 * 16 * 16 * 16 * 16 * 16 - 1)).toString(16);
        color = '#' + ('000000' + color).slice(-6);
        return this.upper(color);
    }

};
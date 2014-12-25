module.exports = {

    // 生成一个数组
    'range': function (start, stop, step) {
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0;
        }
        step = arguments[2] || 1;
        start = +start;
        stop = +stop;
        step = +step;

        var len = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(len);

        while (idx < len) {
            range[idx++] = start;
            start += step;
        }
        return range;
    },

    // 返回字符串中或数组中的一个
    'pickOne': function (arr) {
        arr = arr || [];
        return arr[this.int(0, arr.length - 1)];
    },

    'pickSome': function (arr, count, shuffle) {
        if (!count) {
            count = this.int(1, arr.length);
        } else if (count > arr.length) {
            count = arr.length;
        }

        if (count === 1) {
            return [ this.pickOne(arr) ];
        }

        var idx = [];
        var index;
        while (count) {
            index = this.int(0, arr.length - 1);
            if (idx.indexOf(index) === -1) {
                count -= 1;
                idx.push(index);
            }
        }

        if (!shuffle) {
            idx.sort();
        }

        var result = [];
        while (idx.length) {
            index = idx.shift();
            result.push(arr[index]);
        }
        return result;
    },

    // 随机打乱数组
    'shuffle': function (arr) {
        arr = arr || [];

        var old = arr.slice(0);
        var result = [];
        var index = 0;

        for (var i = 0, length = old.length; i < length; i++) {
            index = this.natural(0, old.length - 1);
            result.push(old[index]);
            old.splice(index, 1);
        }
        return result;
    }

};
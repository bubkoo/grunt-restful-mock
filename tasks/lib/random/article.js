module.exports = {

    'word': function (min, max) {
        var len = arguments.length;

        if (len === 0) {
            len = this.natural(3, 7);
        } else if (len === 1) {
            len = min;
        } else if (len === 2) {
            len = this.natural(min, max);
        }

        var result = '';
        for (var i = 0; i < len; i++) {
            result += this.char('lower');
        }
        return result;
    },

    'sentence': function (min, max) {
        var len = arguments.length;

        if (len === 0) {
            len = this.natural(3, 7);
        } else if (len === 1) {
            len = min;
        } else if (len === 2) {
            len = this.natural(min, max);
        }

        var arr = [];
        for (var i = 0; i < len; i++) {
            arr.push(this.word());
        }
        return this.capitalize(arr.join(' ')) + '.';
    },

    'title': function (min, max) {
        var len = arguments.length;
        var result = [];

        if (len === 0) {
            len = this.natural(3, 7);
        } else if (len === 1) {
            len = min;
        } else if (len === 2) {
            len = this.natural(min, max);
        }
        for (var i = 0; i < len; i++) {
            result.push(this.capitalize(this.word()));
        }
        return result.join(' ');
    },

    'paragraph': function (min, max) {
        var len = arguments.length;

        if (len === 0) {
            len = this.natural(3, 7);
        } else if (len === 1) {
            len = min;
        } else if (len === 2) {
            len = this.natural(min, max);
        }

        var arr = [];
        for (var i = 0; i < len; i++) {
            arr.push(this.sentence());
        }
        return arr.join(' ');
    },

    'lorem': function () {
        var words = ('' +
            'lorem ipsum dolor sit amet consectetur adipisicing elit sed do ' +
            'eiusmod tempor incididunt ut labore et dolore magna aliqua Ut ' +
            'enim ad minim veniam quis nostrud exercitation ullamco laboris ' +
            'nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in ' +
            'reprehenderit in voluptate velit esse cillum dolore eu fugiat ' +
            'nulla pariatur Excepteur sint occaecat cupidatat non proident ' +
            'sunt in culpa qui officia deserunt mollit anim id est laborum').split(' ');

        return this.pickOne(words);
    },

    'lorem_ipsum': function () {
        var words = ('' +
            'lorem ipsum dolor sit amet consectetur adipisicing elit sed do ' +
            'eiusmod tempor incididunt ut labore et dolore magna aliqua Ut ' +
            'enim ad minim veniam quis nostrud exercitation ullamco laboris ' +
            'nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in ' +
            'reprehenderit in voluptate velit esse cillum dolore eu fugiat ' +
            'nulla pariatur Excepteur sint occaecat cupidatat non proident ' +
            'sunt in culpa qui officia deserunt mollit anim id est laborum').split(' ');

        var result = [];
        var length = words.length;
        length = this.int(length / 2, length);
        for (var i = 0; i < length; i++) {
            var index = this.int(0, length);
            result.push(words[index]);
        }
        return result.join(' ');
    },

    'lorems': function () {
        return this.lorem_ipsum();
    }
};
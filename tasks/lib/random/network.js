module.exports = {

    'url': function () {
        return 'http://www.' + this.domain() + '/' + this.word();
    },

    'domain': function (tld) {
        return this.word() + '.' + (tld || this.tld());
    },

    'email': function (domain) {
        domain = domain || this.domain();
        return this.word() + '@' + domain;
    },

    'ip': function () {
        return this.natural(0, 255) + '.' +
            this.natural(0, 255) + '.' +
            this.natural(0, 255) + '.' +
            this.natural(0, 255);
    },

    'tld': function () {

        var tlds = ['com', 'net', 'cn', 'org', 'edu', 'gov', 'co.uk', 'so',
            'io', 'cc', 'name', 'me', 'biz', 'com.cn', '.net.cn', 'org.cn',
            'mobi', 'tel', 'asia', 'tv', 'info'];

        return this.pickOne(tlds);
    }
};
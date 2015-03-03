module.exports = {
    '/demo/for/debug': {
        'get': {
            data: {
                'code': '0',
                'message': '',
                'data': {
                    'name': 'xxx',
                    'num': '@d5',
                    'mobile': '@mobile, @zipcode',
                    'email': 'yyy\\@zzz.com', // 转义的
                    'native1': '\\@native',
                    'native2': '\\@native, \\@d5'
                }
            }
        }
    }
};
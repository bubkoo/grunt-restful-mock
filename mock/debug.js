module.exports = {
    '/demo/for/debug': {
        'get': {
            data: {
//                'code': '0',
//                'message': '',
                'data': {
//                    'name': 'xxx',
//                    'range2': '@range(@int(1,5), @int(6,10), 2)'
//                    'date': '@date("@randomDate", "YYYY-MM-DD")'
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
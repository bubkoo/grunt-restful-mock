module.exports = {
    '/demo/for/cookie': {
        'get': {
            delay: 500,
            cookies: [
                {
                    'id': 123,
                    'options': {
                        maxAge: 1000 * 60 * 60, // cookie 的存活期
                        domain: 'some.com',
                        path: '/cookie/path'
                    }
                }
            ],
            data: {
                'code': '0',
                'data': {
                    'pageSize': 10,        // 每页条数
                    'pageIndex': 2,        // 当前页码
                    'pageCount|0-10': 0,   // 总页数
                    'records|10-10': [
                        {
                            'bankCard': '**JxRX',
                            'bankName': '招商银行',
                            'bankNo': '007',
                            'certId': '',               // 证件号码
                            'certType': '',             // 证件类型
                            'tranAmount|0-10000000': 200,               // 交易金额
                            'tranStatus': '1',                          // 交易状态
                            'tranTime': '@DATE("YYYYMMDDhhmmss")',        // 交易时间
                            'tranType': '1',                            // 交易类型
                            'userId': '111',
                            'userName': 'chen'
                        }
                    ],
                    'recordsCount|0-100': 20
                },
                'message': ''
            }
        }
    }
};
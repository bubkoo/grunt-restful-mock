module.exports = {
    '/demo/for/jsonp': {
        'get': {
            jsonp: 'callback',
            data: {
                'code': '0',
                'message': '',
                'data': {
                    // 累积收益，最小单位为分，100表示1元
                    'earnings|0-10000000': 100,
                    'money|0-10000000': 10000,
                    'history|0-2': [
                        {
                            // 收益记录时间
                            'date': '@DATE("YYYY-MM-DD hh:mm:ss")',
                            // 收益记录收益，最小单位为分，100表示1元
                            'earnings|0-10000000': 10
                        }
                    ]
                }
            }
        }
    }
};
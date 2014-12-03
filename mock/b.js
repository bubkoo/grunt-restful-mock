module.exports = {
    '/api/fund/asset_info': {
        'post': {
            //jsonp: 'callback',
            data: {
                'code': '0',
                'data': {
                    // 累积收益，最小单位为分，100表示1元
                    'earnings|0-10000000': 100,
                    'money|0-10000000': 10000,
                    'earnings_records|0-2': [
                        {
                            // 收益记录时间
                            'date': '@DATE(YYYYMMDDhhmmss)',
                            // 收益记录收益，最小单位为分，100表示1元
                            'earnings|0-10000000': 10
                        }
                    ]
                }
            }
        }
    }
};
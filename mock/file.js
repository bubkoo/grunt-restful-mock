module.exports = {
    '/demo/for/data.json': {
        'get': {
            data: {
                'code': '0',
                'message': '',
                'data': {
                    'earnings|0-10000000': 100,
                    'money|0-10000000': 10000,
                    'history|0-2': [
                        {
                            'date': '@DATE(YYYY-MM-DD hh:mm:ss)',
                            'earnings|0-10000000': 10
                        }
                    ]
                }
            }
        }
    }
};
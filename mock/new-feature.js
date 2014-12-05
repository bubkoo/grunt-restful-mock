module.exports = {
    '/multiple/methods': {
        // 用竖线分隔的谓词
        'get|post': {
            data: {
                name: 'bubkoo',
                email: '@email',
                'count|1-100': 0
            }
        }
    },

    '/method/with/params': {
        'get[type=role]': {
            data: {
                'success': true,
                'data': {
                    'pageSize': 10,          // 每页条数
                    'pageIndex': 2,          // 当前页码
                    'pageCount|0-10': 0,     // 总页数
                    'records|10-10': [
                        {
                            'id|0-100': 0,
                            'name': '@name'
                        }
                    ],
                    'recordCount|0-100': 20
                },
                'message': ''
            }
        },
        'get[type=assigned, pageIndex=1]|post': {
            data: {
                'success': true,
                'data': {
                    'pageSize': 10,          // 每页条数
                    'pageIndex': 1,          // 当前页码
                    'pageCount|0-10': 0,     // 总页数
                    'records|10-10': [
                        {
                            'id|0-100': 0,
                            'name': '@name'
                        }
                    ],
                    'recordCount|0-100': 20
                },
                'message': ''
            }
        }
    }
};
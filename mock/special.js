module.exports = {
    '/demo/for/sp1': {
        'get': {
            // 处理返回数据是数组的情况
            'data|0-10': [
                {
                    'date': '@DATE(YYYY-MM-DD hh:mm:ss)',
                    'count|0-100': 10
                }
            ]
        }
    }
};
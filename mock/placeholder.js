module.exports = {
    '/demo/for/placeholder': {
        'get': {
            'data': {
                'inc': {
                    'inc1|10': [
                        {
                            message:'start 1, step 1',
                            result:'@inc(1, 1)'
                        }
                    ]
                }
            }
        },
        'post': {
            'data': {
                'formItem': '@formItem("message")'
            }
        }
    }
};
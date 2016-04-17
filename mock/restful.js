module.exports = {
    // 路由规则参考 https://github.com/pillarjs/path-to-regexp
    '/demo/for/restful/:id': {
        'get': {
            data: {
                'code': '0',
                'message': '',
                'data': {
                    id: '@formItem("id")'
                }
            }
        }
    }
};
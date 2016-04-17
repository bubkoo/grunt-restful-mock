module.exports = {
    '/demo/for/fromJson': {
        'get': {
            //data: '@fromFile("./mock/data/demo.json")'
            //data: '@fromFile("./mock/data/demo.yaml")'
            //data: '@fromFile("./mock/data/huge.json")'
            data: {
                'code': '0',
                'message': '',
                'data': '@fromFile("./mock/data/huge.json")'
            }
        }
    }
};
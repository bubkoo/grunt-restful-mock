module.exports = {
    '/demo/for/manual1': {
        'get': {
            // 路由内部定义的 placeholder 不共享
            'placeholders': {
                'foo': function () {
                    return 'foo: ' + this.now();
                }
            },
            'data': {
                // 使用全局 placeholder
                'hello': '@hello("bubkoo")',
                // 使用局部 placeholder
                'foo': '@foo',
                'bar': '@bar'
            }
        }
    },
    '/demo/for/manual2': {
        'get': {
            // 路由内部定义的 placeholder 不共享
            'placeholders': {
                'bar': function () {
                    return 'bar: ' + this.now();
                }
            },
            'data': {
                // 使用全局 placeholder
                'hello': '@hello("bubkoo")',
                // 使用局部 placeholder
                'foo': '@foo',
                'bar': '@bar'
            }
        }
    }
};
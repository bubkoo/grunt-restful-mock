module.exports = {
    '/demo/for/random': {
        'get': {
            'data': {
                'base': {
                    'int1': '@int',
                    'int2': '@int(10)',
                    'int3': '@int(10,100)',

                    'natural1': '@natural',
                    'natural2': '@natural(10)',
                    'natural3': '@natural(10, 100)',

                    'boolean1': '@bool',
                    'boolean2': '@bool(1, 5, true)',

                    'float1': '@float',
                    'float2': '@float(1, 10)',
                    'float3': '@float(1, 10, 2)',
                    'float4': '@float(1, 10, 2, 4)',

                    'char1': '@char',
                    'char2': '@char("lower")',
                    'char3': '@char("upper")',
                    'char4': '@char("number")',
                    'char5': '@char("symbol")',

                    'string1': '@string("lower", 2, 10)',
                    'string2': '@string("lower", 2)',
                    'string3': '@string(2, 10)',
                    'string4': '@string("lower")',
                    'string5': '@string(2)',
                    'string6': '@string',

                    'capitalize': '@capitalize("mock")',
                    'upper': '@upper("mock")',
                    'lower': '@lower("MOCK")'
                },

                'd':{
                    'd5':'@d5',
                    'd10':'@d10',
                    'd20':'@d20',
                    'd50':'@d50',
                    'd100':'@d100',
                    'd200':'@d200',
                    'd500':'@d500',
                    'd1000':'@d1000'
                },

                'date': {

                }
            }
        }
    }
};
module.exports = {
    '/demo/for/random': {
        'get': {
            'data': {
                'rules': {
                    'number1|10': 1,        // 返回 10
                    'number2|1-10': 1,      // 返回 1-10 之间的数
                    'number3|1-10.1-4': 1,  // 返回整数部分 1-10 之间，小数位数为 1-4 位
                    'number4|1-10.1-4': 1.123456,  // 返回整数部分 1-10 之间，小数位数为 1-4 位，小数部分来源于原数字
                    'number5|1-10.2': 1,           // 整数部分 1-10，小数固定两位
                    'number6|1-10.2': 1.123456,    // 整数部分 1-10，小数固定两位，小数部分为 12
                    'number7|10.1-4': 1,           // 整数固定为 10，小数位数为 1-4 位
                    'number8|10.2': 1,             // 整数固定为 10，小数位数为 2 位
                    'number9|+1': 1,

                    'string1|1-4': 'Mock',
                    'string2|2': 'Mock',

                    'boolean1|1': true,
                    'boolean2|9-10': true,

                    'array1|2': [1, 2, 3],   // 重复数组 2 次
                    'array2|2-5': [1, 2, 3], // 重复数组 2-5 次

                    'object1|2': {key1: 'value1', key2: 'value2', key3: 'value3'},
                    'object2|1-3': {key1: 'value1', key2: 'value2', key3: 'value3', key4: 'value4'},

                    'function1|2': function () {
                        return 'Mock';
                    }
                },

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

                'dx': {
                    'd5': '@d5',
                    'd10': '@d10',
                    'd20': '@d20',
                    'd50': '@d50',
                    'd100': '@d100',
                    'd200': '@d200',
                    'd500': '@d500',
                    'd1000': '@d1000'
                },

                'array': {
                    'pick1': '@pick([1, 2, 3, 4, 5])',
                    'pick2': '@pickOne([1, 2, 3, 4, 5])',
                    'pick3': '@pickSome([1, 2, 3, 4, 5])',
                },

                'address': {

                },

                'datetime': {
                    'now1': '@now',
                    'now2': '@now("YYYY年MM月DD日 HH时mm分ss秒")',
                    'now3': '@now("month", "YYYY-MM-DD HH:mm:ss")',
                    'randomDate': '@randomDate',
                    'date': '@date(@randomDate, "YYYY-MM-DD")',
                    'time': '@time(@randomDate, "HH:mm:ss")',
                    'datetime': '@datetime(@randomDate, "YYYY-MM-DD HH:mm:ss")',
                    'formatDate': '@formatDate(@randomDate, "YYYY-MM-DD HH:mm:ss")',
                    'parseDate': '@parseDate("2014-12-24 10:56:02")'
                },

                'form': {
                    'guid': '@guid',
                    'id': '@id',
                    'language': '@language',
                    'lang': '@language',
                    'zipcode1': '@zipcode',
                    'zipcode2': '@zipcode(8)',
                    'zip1': '@zipcode',
                    'zip2': '@zipcode(5)',
                    'mobile': '@mobile'
                },

                'names': {
                    'maleFirstName': '@maleFirstName',
                    'femaleFirstName': '@femaleFirstName',
                    'lastName': '@lastName',
                    'name1': '@name',
                    'name2': '@name("Danny")'
                },

                'article': {
                    'word1': '@word',
                    'word2': '@word(5)',
                    'word3': '@word(2, 10)',

                    'sentence1': '@sentence',
                    'sentence2': '@sentence(5)',
                    'sentence3': '@sentence(2, 10)',

                    'title1': '@title',
                    'title2': '@title(5)',
                    'title3': '@title(2, 10)',

                    'paragraph1': '@paragraph',
                    'paragraph2': '@paragraph(5)',
                    'paragraph3': '@paragraph(2, 10)',

                    'lorem': '@lorem',
                    'lorems': '@lorems'

                },

                'network': {
                    'tld': '@tld',
                    'domain1': '@domain',
                    'domain2': '@domain("us")',
                    'email1': '@email',
                    'email2': '@email("163.com")',
                    'url': '@url',
                    'ip': '@ip'
                },

                'color': {
                    'color': '@color'
                },

                'devel': {

                }
            }
        }
    }
};
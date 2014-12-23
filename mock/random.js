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
                    'pick': '@pick([1, 2, 3, 4, 5])'
                },

                'address': {

                },

                'datetime': {

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

                'devel': {}
            }
        }
    }
};
module.exports = {
    '/demo/for/placeholder': {
        'get': {
            'data': {
                'date': '@date(@randomDate, "YYYY-MM-DD")',
                'time': '@time(@randomDate, "HH:mm:ss")',
                'datetime': '@datetime(@randomDate, "YYYY-MM-DD HH:mm:ss")',
                'formatDate': '@formatDate(@randomDate, "YYYY-MM-DD HH:mm:ss")',
                'date1': '@now + @int',
                'int1': '@int(5, 6)',
                'int2': '@int(@int(), @int) + @int',
            }
        }
    }
};
(function () {

    var moment = require('moment'),
        areaList = require('./areaList'),
        rRule = /(.+)\|(?:([\+-]\d+)|(\d+-?\d*)?(?:\.(\d+-?\d*))?)/,
        rPlaceholder = /(?:[^\\])?@([^@#%&()\?\s\/\.]+)(?:\((.*?)\)(?!\)))?/g,
        handle = function () {
            var proto = {
                'extend': extend
            };
            proto.extend({
                'string': function (options) {
                    var result = '',
                        placeholders,
                        placeholder,
                        handed,
                        i = 0,
                        len = options.rule.iCount || 1;

                    if (options.template.length) {
                        while (len--) {
                            result += options.template;
                        }
                        // 处理模板中的占位符
                        placeholders = result.match(rPlaceholder) || [];
                        for (i = 0, len = placeholders.length; i < len; i++) {
                            placeholder = placeholders[i];
                            handed = handle.placeholder(placeholder, options);

                            // 有且仅有一个 placeholder, 适当地做类型转换
                            if (len === 1 &&
                                result === placeholder &&
                                typeof result !== typeof handed) {
                                if (/^(true|false)$/.test(handed)) {
                                    result = handed === 'true' ? true : handed === 'false' ? false : handed;
                                }
                                else if (isNumeric(handed)) {
                                    result = float(handed);
                                }
                                else {
                                    result = handed;
                                }
                                break;
                            }
                            result = result.replace(placeholder, handed);
                        }
                    } else {
                        result = options.rule.iRange
                            ? random.string(len)
                            : options.template
                    }

                    return result;
                },
                'number': function (options) {
                    var result,
                        parts;
                    // 含有小数部分
                    if (options.rule.dRange) {
                        parts = (options.template + '').split('.');
                        // 优先使用由范围所产生的整数
                        parts[0] = options.rule.iRange ? options.rule.iCount : parts[0];
                        parts[1] = (parts[1] || '').slice(0, options.rule.dCount);
                        // 补全小数部分
                        while (parts[1].length < options.rule.dCount) {
                            parts[1] += random.char('number');
                        }
                        result = float(parts.join('.'));
                    } else if (options.rule.iRange) {
                        // 只包含整数部分
                        result = options.rule.iCount;
                    }
                    else {
                        // 自增/减
                        result = options.template;
                    }
                    return result;
                },
                'boolean': function (options) {
                    var result;
                    result = options.rule.iRange
                        ? random.bool(options.rule.iMin, options.rule.iMax, options.template)
                        : options.template;
                    return result;
                },
                'array': function (options) {
                    var result = [],
                        item,
                        i,
                        j,
                        len = options.template.length,
                        count;
                    count = options.rule.iCount || 1;
                    for (i = 0; i < count; i++) {
                        j = 0;
                        while (j < len) {
                            item = generate(options.template[j], j, options.data, options.root);
                            result.push(item);
                            j++;
                        }
                    }
                    return result;
                },
                'object': function (options) {
                    var result = {},
                        keys,
                        key,
                        parsedKey,
                        inc,
                        i,
                        length;
                    keys = getKeys(options.template);
                    // 随机选取 count 个属性
                    if (options.rule.iRange && options.rule.iCount > 0) {
                        keys = random.shuffle(keys);
                        keys = keys.slice(0, options.rule.iCount);
                    }
                    for (i = 0, length = keys.length; i < length; i++) {
                        key = keys[i];
                        parsedKey = key.replace(rRule, '$1');
                        result[parsedKey] = generate(options.template[key], key, options.data, options.root);

                        inc = key.match(rRule);
                        if (inc && inc[2] && 'number' === getType(options.template[key])) {
                            options.template[key] += int(inc[2]);
                        }
                    }
                    return result;
                },
                'function': function (options) {
                    var result = options.template(options.data),
                        type = getType(result);
                    if (handle[type]) {
                        result = handle[type]({
                            template: result,
                            type: type,
                            rule: options.rule,
                            root: options.root,
                            data: options.data
                        })
                    }
                    return result;
                },
                'placeholder': function (placeholder, options) {

                    function getRandonKeys() {
                        var ret = {};
                        for (var name in random) ret[name.toLowerCase()] = name;
                        return ret;
                    }

                    // 全局匹配复位
                    rPlaceholder.exec('');

                    var result = '',
                        parts = rPlaceholder.exec(placeholder),
                        method,
                        methodName = parts && parts[1],
                        lMethodName = methodName && methodName.toLowerCase(),
                        aMethodName = getRandonKeys()[lMethodName],
                        params = parts && parts[2],
                        i,
                        len,
                        placeholders,
                        handled,
                        j,
                        k;

                    if (params) {
                        params = params.split(/\s*,\s*/g);
                        for (i = 0, len = params.length; i < len; i++) {
                            // 处理嵌套 placeholder
                            placeholders = params[i].match(rPlaceholder);
                            if (placeholders) {
                                for (j = 0, k = placeholders.length; j < k; j++) {
                                    handled = handle.placeholder(placeholders[j], options);
                                    params[i] = params[i].replace(placeholders[j], handled);
                                }
                            }
                        }
                    }

                    if (!(aMethodName in random)) {
                        return placeholder;
                    }

                    method = random[aMethodName];
                    switch (getType(method)) {
                        case 'array':
                            result = random.pick(method);
                            break;
                        case 'function':
                            if (aMethodName === 'fromData') {
                                params.push(options.data);
                            }
                            result = method.apply(random, params);
                            if (isUndefined(result)) {
                                result = '';
                            }
                            break;
                    }
                    return result;
                }
            });
            return proto;
        }(),

        random = function () {
            var proto = {
                'extend': extend
            };
            proto.extend({
                'int': function (min, max) {
                    min = isUndefined(min) ? -9007199254740992 : int(min);
                    max = isUndefined(max) ? 9007199254740992 : int(max);
                    return Math.round(Math.random() * (max - min)) + min;
                },
                'integer': function (min, max) {
                    return this.int(min, max);
                },
                'natural': function (min, max) {
                    min = isUndefined(min) ? 0 : int(min);
                    max = isUndefined(max) ? 9007199254740992 : int(max);
                    return Math.round(Math.random() * (max - min)) + min;
                },
                'bool': function (min, max, cur) {
                    if (isUndefined(cur)) {
                        return Math.random() >= 0.5;
                    }
                    min = isUndefined(min) || isNaN(min) ? 1 : int(min);
                    max = isUndefined(max) || isNaN(max) ? 1 : int(max);
                    return Math.random() > min / (min + max) ? !cur : !!cur;
                },
                'boolean': function (min, max, cur) {
                    return this.bool(min, max, cur);
                },
                'float': function (min, max, dMin, dMax) {
                    dMin = isUndefined(dMin) ? 0 : dMin;
                    dMin = Math.max(Math.min(dMin, 17), 0);
                    dMax = isUndefined(dMax) ? 17 : dMax;
                    dMax = Math.max(Math.min(dMax, 17), 0);
                    var ret = this.integer(min, max) + '.';
                    for (var i = 0, dCount = this.natural(dMin, dMax); i < dCount; i++) {
                        ret += this.character('number');
                    }
                    return float(ret);
                },
                'char': function (pool) {
                    var pools = {
                        lower: 'abcdefghijklmnopqrstuvwxyz',
                        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                        number: '0123456789',
                        symbol: '!@#$%^&*()[]'
                    };
                    pools.alpha = pools.lower + pools.upper;
                    pools['undefined'] = pools.lower + pools.upper + pools.number + pools.symbol;
                    pool = pools[('' + pool).toLowerCase()] || pool;
                    return pool.charAt(random.natural(0, pool.length - 1));
                },
                'character': function (pool) {
                    return this.char(pool);
                },
                'string': function (pool, min, max) {
                    var length,
                        result = '',
                        l = arguments.length;

                    if (l === 3) {
                        length = random.natural(min, max);
                    } else if (l === 2) {
                        if ('string' === typeof pool) {
                            length = min;
                        } else {
                            length = random.natural(pool, min);
                            pool = undefined;
                        }
                    } else if (l === 1) {
                        length = pool;
                        pool = undefined;
                    } else {
                        length = random.natural(3, 9);
                    }
                    while (length--) {
                        result += random.char(pool);
                    }
                    return result;
                },
                'str': function (pool, min, max) {
                    return this.string(pool, min, max);
                },
                'range': function (start, stop, step) {
                    if (arguments.length <= 1) {
                        stop = start || 0;
                        start = 0;
                    }
                    step = arguments[2] || 1;
                    start = +start;
                    stop = +stop;
                    step = +step;

                    var len = Math.max(Math.ceil((stop - start) / step), 0),
                        idx = 0,
                        range = new Array(len);

                    while (idx < len) {
                        range[idx++] = start;
                        start += step;
                    }
                    return range;
                }
            });
            proto.extend({
                // 首字母大写
                'capitalize': function (word) {
                    return (word + '').charAt(0).toUpperCase() + (word + '').substr(1);
                },
                'upper': function (str) {
                    return (str + '').toUpperCase();
                },
                'lower': function (str) {
                    return (str + '').toLowerCase();
                },
                // 返回字符串中或数组中的一个
                'pick': function (arr) {
                    arr = arr || [];
                    return arr[this.natural(0, arr.length - 1)];
                },
                // 随机打乱数组
                'shuffle': function (arr) {
                    arr = arr || [];
                    var old = arr.slice(0),
                        result = [],
                        index = 0,
                        length = old.length;
                    for (var i = 0; i < length; i++) {
                        index = this.natural(0, old.length - 1);
                        result.push(old[index]);
                        old.splice(index, 1);
                    }
                    return result;
                }
            });
            proto.extend({
                'parseDate': function () {
                    return moment(arguments);
                },
                'formatDate': function (date, format) {
                    return moment(date).format(format);
                },
                'randomDate': function (min, max) {
                    min = isUndefined(min) ? 0 : min;
                    max = isUndefined(max) ? (+new Date()) : max;
                    return new Date(Math.random() * (max - min));
                },
                'date': function (date, format) {
                    if (arguments.length <= 1) {
                        format = date;
                        date = null;
                    }
                    date = date || this.randomDate();
                    format = format || 'YYYY-MM-DD';
                    return this.formatDate(date, format);
                },
                'time': function (date, format) {
                    if (arguments.length <= 1) {
                        format = date;
                        date = null;
                    }
                    date = date || this.randomDate();
                    format = format || 'HH:mm:ss';
                    return this.formatDate(date, format);
                },
                'datetime': function (date, format) {
                    if (arguments.length <= 1) {
                        format = date;
                        date = null;
                    }
                    date = date || this.randomDate();
                    format = format || 'YYYY-MM-DD HH:mm:ss';
                    return this.formatDate(date, format);
                },
                'now': function (unit, format) {
                    if (arguments.length === 1) {
                        if (!/year|month|week|day|hour|minute|second|week/.test(unit)) {
                            format = unit;
                            unit = '';
                        }
                    }
                    unit = (unit || '').toLowerCase();
                    format = format || 'YYYY-MM-DD HH:mm:ss';
                    var date = new Date();
                    switch (unit) {
                        case 'year':
                            date.setMonth(0);
                            break;
                        case 'month':
                            date.setDate(1);
                            break;
                        case 'week':
                            date.setHours(0);
                            date.setDate(date.getDate() - date.getDay());
                            break;
                        case 'day':
                            date.setHours(0);
                            break;
                        case 'hour':
                            date.setMinutes(0);
                            break;
                        case 'minute':
                            date.setSeconds(0);
                            break;
                        case 'second':
                            date.setMilliseconds(0);
                            break;
                    }
                    return this.format(date, format);
                }
            });
            proto.extend({
                color: function () {
                    var colour = Math.floor(Math.random() * (16 * 16 * 16 * 16 * 16 * 16 - 1)).toString(16);
                    colour = '#' + ('000000' + colour).slice(-6);
                    return this.upper(colour);
                }
            });
            proto.extend({
                'male_first_name': function () {
                    var names = ['James', 'John', 'Robert', 'Michael', 'William', 'David',
                        'Richard', 'Charles', 'Joseph', 'Thomas', 'Christopher', 'Daniel',
                        'Paul', 'Mark', 'Donald', 'George', 'Kenneth', 'Steven', 'Edward',
                        'Brian', 'Ronald', 'Anthony', 'Kevin', 'Jason', 'Matthew', 'Gary',
                        'Timothy', 'Jose', 'Larry', 'Jeffrey', 'Frank', 'Scott', 'Eric'];
                    return this.pick(names);
                },
                'female_first_name': function () {
                    var names = ['Mary', 'Patricia', 'Linda', 'Barbara', 'Elizabeth',
                        'Jennifer', 'Maria', 'Susan', 'Margaret', 'Dorothy', 'Lisa', 'Nancy',
                        'Karen', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon',
                        'Michelle', 'Laura', 'Sarah', 'Kimberly', 'Deborah', 'Jessica',
                        'Shirley', 'Cynthia', 'Angela', 'Melissa', 'Brenda', 'Amy', 'Anna'];
                    return this.pick(names);
                },
                'last_name': function () {
                    var names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller',
                        'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson',
                        'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson',
                        'Thompson', 'White', 'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark',
                        'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall', 'Young', 'Allen'];
                    return this.pick(names);
                },
                'name': function (middle) {
                    return this.bool() ? this.male_first_name() : this.female_first_name() +
                        ' ' + middle ? middle : '' + ' ' + this.last_name();
                }
            });
            proto.extend({
                'word': function (min, max) {
                    var len = arguments.length;
                    if (len === 0) {
                        len = this.natural(3, 7);
                    } else if (len === 1) {
                        len = min;
                    } else if (len === 2) {
                        min = int(min);
                        max = int(max);
                        len = this.natural(min, max);
                    }
                    var result = '';
                    for (var i = 0; i < len; i++) {
                        result += this.char('lower');
                    }
                    return result;
                },
                'sentence': function (min, max) {
                    var len = arguments.length;
                    if (len === 0) {
                        len = this.natural(3, 7);
                    } else if (len === 1) {
                        len = min;
                    } else if (len === 2) {
                        min = int(min);
                        max = int(max);
                        len = this.natural(min, max);
                    }
                    var arr = [];
                    for (var i = 0; i < len; i++) {
                        arr.push(this.word());
                    }
                    return this.capitalize(arr.join(' ')) + '.';
                },
                'title': function (min, max) {
                    var len = arguments.length,
                        result = [];
                    if (len === 0) {
                        len = this.natural(3, 7);
                    } else if (len === 1) {
                        len = min;
                    } else if (len === 2) {
                        min = int(min);
                        max = int(max);
                        len = random.natural(min, max);
                    }
                    for (var i = 0; i < len; i++) {
                        result.push(this.capitalize(this.word()));
                    }
                    return result.join(' ');
                },
                'paragraph': function (min, max) {
                    var len = arguments.length;
                    if (len === 0) {
                        len = this.natural(3, 7);
                    } else if (len === 1) {
                        len = min;
                    } else if (len === 2) {
                        min = int(min);
                        max = int(max);
                        len = this.natural(min, max);
                    }
                    var arr = [];
                    for (var i = 0; i < len; i++) {
                        arr.push(this.sentence());
                    }
                    return arr.join(' ');
                },
                'lorem': function () {
                    var words = 'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');
                    return this.pick(words);
                },
                'lorem_ipsum': function () {
                    var words = 'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');
                    var result = [];
                    var length = words.length;
                    length = this.int(length / 2, length);
                    for (var i = 0; i < length; i++) {
                        var index = this.int(0, length);
                        result.push(words[index]);
                    }
                    return result.join(' ');
                }
            });
            proto.extend({
                'url': function () {
                    return 'http://www.' + this.domain() + '/' + this.word();
                },
                'domain': function (tld) {
                    return this.word() + '.' + (tld || this.tld());
                },
                'email': function (domain) {
                    domain = domain || this.domain();
                    return this.word() + '@' + domain;
                },
                'ip': function () {
                    return this.natural(0, 255) + '.' + this.natural(0, 255) + '.' + this.natural(0, 255) + '.' + this.natural(0, 255);
                },
                'tlds': [ 'com', 'net', 'cn', 'org', 'edu', 'gov', 'co.uk', 'so', 'io', 'cc', 'name',
                    'me', 'biz', 'com.cn', '.net.cn', 'org.cn', 'mobi', 'tel', 'asia', 'tv', 'info'],
                'tld': function () {
                    return this.pick(this.tlds);
                }
            });
            proto.extend({
                'areaList': function (areaCode) {
                    var key ,
                        value,
                        result = [];
                    if (areaCode) {
                        for (key in areaList) {
                            value = areaList[key];
                            if (value && value[1] === areaCode) {
                                if (value.length === 3) {
                                    value.push(key);
                                }
                                result.push(value);
                            }
                        }
                    }
                    return result;
                },
                'areaOne': function (arr, areaName) {
                    arr = arr || [];
                    var result = [];
                    if (areaName) {
                        for (var i = 0, l = arr.length; i < l; i++) {
                            if (areaName === arr[i][0]) {
                                result = arr[i];
                                break;
                            }
                        }
                        result = result || [];
                    } else {
                        result = this.pick(arr);
                    }
                    return result;
                },
                'countryList': function () {
                    return this.areaList('0');
                },
                'country': function (countryName) {
                    var result = this.countryEx(countryName);
                    if (result) {
                        var index = result.indexOf('/');
                        if (index) {
                            result = result.substr(0, index);
                        }
                    }
                    return result;
                },
                'countryEx': function (countryName) {
                    var result = this.areaOne(this.countryList(), countryName);
                    if (result && result.length) {
                        return result[2] + '/' + result[0];
                    }
                    return '';
                },
                'provinceList': function () {
                    return this.areaList('1');
                },
                'province': function (provinceName) {
                    return this.areaOne(this.provinceList(), provinceName);
                },
                'cityList': function (provinceName) {
                    var province = this.province(provinceName),
                        result = [];
                    if (province && province.length) {
                        result = this.areaList(province[3]);
                    }
                    return result;
                },
                'city': function (provinceName, cityName) {
                    return this.areaOne(this.cityList(provinceName), cityName);
                },
                'townList': function (provinceName, cityName) {
                    var city = this.city(provinceName, cityName),
                        result = [];
                    if (city && city.length) {
                        result = this.areaList(city[3]);
                    }
                    return result;
                },
                'town': function (provinceName, cityName, townName) {
                    return this.areaOne(this.townList(provinceName, cityName), townName);
                },
                'randomArea': function (join, overSea) {
                    if (overSea === true) {
                        return this.country();
                    }
                    join = join || '-';
                    var result = '', province, city, town;
                    province = this.province();
                    if (province && province.length) {
                        result += province[0] + join;
                        city = this.city(province[0]);
                        if (city && city.length) {
                            result += city[0] + join;
                            town = this.town(province[0], city[0]);
                            if (town && town.length) {
                                result += town[0];
                            }
                        }
                    }
                    return result;
                },
                'language': function () {
                    var lang = ['Afrikaans', 'Azərbaycan dili (Latın)', 'Bahasa Indonesia', 'Bahasa Melayu', 'Bosanski (Latinica)',
                        'Català', 'Čeština', 'Cymraeg', 'Dansk', 'Deutsch', 'Eesti', 'English (United Kingdom)', 'English (United States)',
                        'Español', 'Euskara', 'Filipino', 'Français', 'Gaeilge', 'Gàidhlig', 'Galego', 'Hausa', 'Hrvatski', 'Igbo',
                        'isiXhosa', 'isiZulu', 'Íslenska', 'Italiano', 'K\'iche\'', 'Kinyarwanda', 'Kiswahili', 'Latviešu', 'Lëtzebuergesch',
                        'Lietuvių', 'Magyar', 'Malti', 'Māori', 'Nederlands', 'Norsk (Bokmål)', 'Norsk (Nynorsk)', 'O‘zbekcha (Lotin)',
                        'Polski', 'Português (Brasil)', 'Português (Portugal)', 'Quechua', 'Română', 'Sesotho sa Leboa', 'Setswana', 'Shqip',
                        'Slovenčina', 'Slovenščina', 'Srpski (Srbija, Crna Gora)', 'Suomi', 'Svenska', 'Tiếng Việt', 'Türkçe', 'Türkmençe',
                        'Valencià', 'Wolof', 'Yorùbá', 'Ελληνικά', 'Беларускі', 'български', 'Кыргызча', 'Қазақ', 'Македонски', 'Монгол (Кирилл)',
                        'Русский', 'српски (Босна и Херцеговина)', 'српски (Србија, Црна Гора)', 'Татарча', 'Тоҷикӣ', 'Українська', 'Հայերեն',
                        'ქართული', 'עברית', 'اردو', 'اللغة العربية', 'پنجابی', 'درى', 'سنڌي', 'فارسی', 'کوردیی ناوەڕاست', 'ئۇيغۇرچە', 'कोंकणी', 'नेपाली', 'मराठी',
                        'हिंदी', 'অসমীয়া', 'বাংলা (বাংলাদেশ)', 'বাংলা (ভারত)', 'ਪੰਜਾਬੀ (ਗੁਰਮੁਖੀ)', ' ગુજરાતી', 'ଓଡ଼ିଆ', 'தமிழ்', 'తెలుగు', 'ಕನ್ನಡ ',
                        'മലയാളം', 'සිංහල', 'ไทย', 'ខ្មែរ', 'ᏣᎳᎩ', 'ትግርኛ', 'አማርኛ', '한국어', '日本語', '简体中文', '繁體中文'];
                    return this.pick(lang);
                },
                'lang': function () {
                    return this.language();
                },
                'zipcode': function (len) {
                    var zip = '';
                    for (var i = 0; i < (len || 6); i++) zip += this.natural(0, 9);
                    return zip;
                },
                'zip': function (len) {
                    return this.zipcode(len);
                },
                'mobile': function () {
                    // 130~139  145,147 15[012356789] 180~189
                    var result = '',
                        isp = [130, 131, 132, 133, 134, 135, 136, 137, 138, 139,
                            145, 147,
                            150, 151, 152, 153, 154, 155, 156, 157, 158, 159,
                            180, 181, 182, 183, 184, 185, 186, 187, 188, 189],
                        i = 8;
                    while (i--) {
                        result += this.natural(0, 9) + '';
                    }
                    result = this.pick(isp) + result;

                    return result;
                }
            });
            proto.extend({
                'd4': function () {
                    return this.natural(1, 4);
                },
                'd6': function () {
                    return this.natural(1, 6);
                },
                'd8': function () {
                    return this.natural(1, 8);
                },
                'd12': function () {
                    return this.natural(1, 12);
                },
                'd20': function () {
                    return this.natural(1, 20);
                },
                'd100': function () {
                    return this.natural(1, 100);
                },
                'guid': function () {
                    var pool = 'ABCDEF1234567890',
                        guid = this.string(pool, 8) + '-'
                            + this.string(pool, 4) + '-'
                            + this.string(pool, 4) + '-'
                            + this.string(pool, 4) + '-'
                            + this.string(pool, 12);
                    return guid;
                },
                'id': function () {
                    var id,
                        sum = 0,
                        rank = [ '7', '9', '10', '5', '8', '4', '2', '1', '6', '3', '7', '9', '10', '5', '8', '4', '2' ],
                        last = [ '1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2' ];
                    id = this.province()[3] + this.date('YYYYMMDD') + this.string('number', 3);
                    for (var i = 0; i < id.length; i++) {
                        sum += id[i] * rank[i];
                    }
                    id += last[sum % 11];
                    return id;
                },
                'autoIncrementInteger': 0,
                'increment': function (step) {
                    return this.autoIncrementInteger += +step || 1;
                },
                'inc': function (step) {
                    return this.increment(step);
                }
            });
            proto.extend({
                    'fromData': function (path, data) {
                        var result,
                            copy = extend({}, data),
                            parts = path.split('.'),
                            i = 0,
                            l = parts.length;
                        for (; i < l; i++) {
                            if (parts[i] in copy) {
                                copy = copy[parts[i]];
                            }
                            if (i === l - 1) {
                                result = copy;
                            }
                        }
                        return result;
                    }
                }
            );
            return proto;
        }();


    function getRules(rule) {

        var rRange = /(\d+)-?(\d+)?/,

            matches = (rule || '').match(rRule),
            key = matches && matches[1] || rule,
            step = matches && matches[2] && int(matches[2]),
            iRange = matches && matches[3] && matches[3].match(rRange),
            iMin = iRange && int(iRange[1], 10),
            iMax = iRange && int(iRange[2], 10),
            iCount = iRange ? !iRange[2] && iMin || random.int(iMin, iMax) : undefined,
            dRange = matches && matches[4] && matches[4].match(rRange),
            dMin = dRange && int(dRange[1], 10),
            dMax = dRange && int(dRange[2], 10),
            dCount = dRange ? !dRange[2] && dMin || random.int(dMin, dMax) : undefined;

        return {
            rule: rule,
            key: key,
            step: step,
            iRange: iRange,
            iMin: iMin,
            iMax: iMax,
            iCount: iCount,
            dRange: dRange,
            dMin: dMin,
            dMax: dMax,
            dCount: dCount
        };
    }

    function generate(template, key, data, root) {
        if (arguments.length === 2) {
            data = key;
            key = null;
        }
        var rule = getRules(key),
            type = getType(template);
        root = root || template; // 根模板
        if (handle[type]) {
            return handle[type]({
                template: template,
                type: type,
                rule: rule,
                root: root,
                data: data
            });
        }
        return template;
    }

    generate.extend = function () {
        random.extend.apply(random, [].prototype.slice.call(arguments));
    };

    module.exports = generate;

// Helpers
// ----------------

    function getType(object) {
        if (object === null || object === undefined) {
            return String(object)
        } else {
            return Object.prototype.toString.call(object).match(/\[object (\w+)\]/)[1].toLowerCase();
        }
    }

    function getKeys(object) {
        var keys = [];
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    }

    function int(value) {
        return parseInt(value);
    }

    function float(value) {
        return parseFloat(value);
    }

    function isArray(value) {
        if (Array.isArray) {
            return Array.isArray(value);
        } else {
            return getType(value) === 'array';
        }
    }

    function isObject(value) {
        return getType(value) === 'object';
    }

    function isUndefined(value) {
        return typeof value === 'undefined';
    }

    function isString(value) {
        return typeof value === 'string';
    }

    function isNumeric(value) {
        if (value === null || value === '') {
            return false;
        }
        return !isNaN(value) && isFinite(value);
    }

    function extend() {
        var target = arguments[0] || {},
            i = 1,
            len = arguments.length,
            copyIsArray,
            source,
            key,
            src,
            copy,
            clone;

        if (len === 1) {
            target = this;
            i = 0;
        }
        for (; i < len; i++) {
            // 忽略 null 或者 undefined 的对象
            if ((source = arguments[i]) != null) {
                for (key in source) {
                    src = target[ key ];
                    copy = source[ key ];
                    if (target === copy) {
                        continue;
                    }
                    if ((copyIsArray = isArray(copy)) || isObject(copy)) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];
                        }
                        else {
                            clone = src && isObject(src) ? src : {};
                        }
                        target[ key ] = extend(clone, copy);
                    } else if (copy !== undefined) {
                        target[ key ] = copy;
                    }
                }
            }
        }
        return target;
    }

})();
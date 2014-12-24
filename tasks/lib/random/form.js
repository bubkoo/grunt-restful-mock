module.exports = {

    'guid': function () {
        var pool = 'ABCDEF1234567890';
        return this.string(pool, 8) + '-' +
            this.string(pool, 4) + '-' +
            this.string(pool, 4) + '-' +
            this.string(pool, 4) + '-' +
            this.string(pool, 12);
    },

    'id': function () {
        var id;
        var sum = 0;
        var rank = [ '7', '9', '10', '5', '8', '4', '2', '1', '6', '3', '7', '9', '10', '5', '8', '4', '2' ];
        var last = [ '1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2' ];

        id = this.province()[3] + this.date('YYYYMMDD') + this.string('number', 3);

        for (var i = 0; i < id.length; i++) {
            sum += id[i] * rank[i];
        }
        id += last[sum % 11];
        return id;
    },

    'language': function () {
        var lang = ['Afrikaans', 'Azərbaycan dili (Latın)', 'Bahasa Indonesia',
            'Bahasa Melayu', 'Bosanski (Latinica)', 'Català', 'Čeština', 'Cymraeg',
            'Dansk', 'Deutsch', 'Eesti', 'English (United Kingdom)',
            'English (United States)', 'Español', 'Euskara', 'Filipino', 'Français',
            'Gaeilge', 'Gàidhlig', 'Galego', 'Hausa', 'Hrvatski', 'Igbo', 'isiXhosa',
            'isiZulu', 'Íslenska', 'Italiano', 'K\'iche\'', 'Kinyarwanda',
            'Kiswahili', 'Latviešu', 'Lëtzebuergesch', 'Lietuvių', 'Magyar', 'Malti',
            'Māori', 'Nederlands', 'Norsk (Bokmål)', 'Norsk (Nynorsk)', 'O‘zbekcha (Lotin)',
            'Polski', 'Português (Brasil)', 'Português (Portugal)', 'Quechua', 'Română',
            'Sesotho sa Leboa', 'Setswana', 'Shqip', 'Slovenčina', 'Slovenščina',
            'Srpski (Srbija, Crna Gora)', 'Suomi', 'Svenska', 'Tiếng Việt', 'Türkçe',
            'Türkmençe', 'Valencià', 'Wolof', 'Yorùbá', 'Ελληνικά', 'Беларускі',
            'български', 'Кыргызча', 'Қазақ', 'Македонски', 'Монгол (Кирилл)',
            'Русский', 'српски (Босна и Херцеговина)', 'српски (Србија, Црна Гора)',
            'Татарча', 'Тоҷикӣ', 'Українська', 'Հայերեն', 'ქართული', 'עברית',
            'اردو', 'اللغة العربية', 'پنجابی', 'درى', 'سنڌي', 'فارسی', 'کوردیی ناوەڕاست',
            'ئۇيغۇرچە', 'कोंकणी', 'नेपाली', 'मराठी', 'हिंदी', 'অসমীয়া', 'বাংলা (বাংলাদেশ)',
            'বাংলা (ভারত)', 'ਪੰਜਾਬੀ (ਗੁਰਮੁਖੀ)', ' ગુજરાતી', 'ଓଡ଼ିଆ', 'தமிழ்', 'తెలుగు',
            'ಕನ್ನಡ ', 'മലയാളം', 'සිංහල', 'ไทย', 'ខ្មែរ', 'ᏣᎳᎩ', 'ትግርኛ',
            'አማርኛ', '한국어', '日本語', '简体中文', '繁體中文'];
        return this.pickOne(lang);
    },

    'lang': function () {
        return this.language();
    },

    'zipcode': function (len) {
        var zip = '';
        for (var i = 0; i < (len || 6); i++) {
            zip += this.natural(0, 9);
        }
        return zip;
    },

    'zip': function (len) {
        return this.zipcode(len);
    },

    'mobile': function () {
        // 130~139  145,147 15[012356789] 180~189
        var result = '',
            isp = [130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 145, 147,
                150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 180, 181,
                182, 183, 184, 185, 186, 187, 188, 189],
            i = 8;
        while (i--) {
            result += this.natural(0, 9) + '';
        }
        result = this.pickOne(isp) + result;

        return result;
    }
};
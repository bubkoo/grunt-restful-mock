var moment = require('moment');

function formatJson(obj, space, level) {
    if (!obj) {
        return;
    }
    if (typeof space === 'undefined') {
        space = '';
    }
    if (typeof level === 'undefined') {
        level = 0;
    }

    var indent = '    ';
    var isArr = Array.isArray(obj);
    var ret = '';
    var val;

    for (var key in obj) {
        if (isArr) {
            ret += space + indent;
        } else {
            ret += space + indent + key + ': ';
        }

        val = obj[ key ];

        if (val instanceof Date || val instanceof moment) {
            val = val.toString();
        }

        if (Array.isArray(val) || typeof val === 'object') {
            ret += formatJson(val, space + indent, level + 1);
        } else {
            if (typeof val === 'string') {
                val = '"' + val + '"';
            }
            ret += val + ',\n';
        }
    }

    if (key && endsWith(ret, ',\n')) {
        ret = ret.substr(0, ret.length - 2) + '\n';
    }

    if (isArr) {
        ret = (level > 0 ? '' : space) + '[\n' + ret + space + ']' + (level > 0 ? ',\n' : '');
    }
    else {
        ret = (level > 0 ? '' : space) + '{\n' + ret + space + '}' + (level > 0 ? ',\n' : '');
    }
    return ret;
}

module.exports = formatJson;


// Helpers
// -------

function endsWith(str, end) {
    var index = str.length - end.length;
    return index >= 0 && str.indexOf(end, index) === index;
}
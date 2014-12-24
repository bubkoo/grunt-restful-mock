var areaList = require('./constants/areas');

module.exports = {

    // 父级区域代码获取区域列表
    'areaList': function (parentAreaCode) {
        var key;
        var value;
        var result = [];

        if (parentAreaCode) {
            for (key in areaList) {
                value = areaList[key];
                if (value && value[1] === parentAreaCode) {
                    // just for speed up
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
            result = this.pickOne(arr);
        }
        return result;
    },

    // 国家列表
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
        var province = this.province(provinceName);
        var result = [];

        if (province && province.length) {
            result = this.areaList(province[3]);
        }
        return result;
    },

    'city': function (provinceName, cityName) {
        return this.areaOne(this.cityList(provinceName), cityName);
    },

    'townList': function (provinceName, cityName) {
        var city = this.city(provinceName, cityName);
        var result = [];

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
    }
};
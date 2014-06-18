module.exports = {
    '/api/fund/asset_records': {
        'get': {
            delay  : 500,
            cookies: [
                {
                    'id'     : 123,
                    'options': {
                        maxAge: 1000 * 60 * 60
                    }
                }
            ],
            data   : {
                'code': '0',
                'data': {
                    'count'        : 10,            // 每页条数
                    'page'         : 2,              // 当前页码
                    'page_num|0-10': 0,     // 总页数
                    'results|10-10': [
                        {
                            'bankCard'             : '**JxRX',
                            'bankName'             : '招商银行',
                            'bankNo'               : '007',
                            'certId'               : '',               // 证件号码
                            'certType'             : '',             // 证件类型
                            'tranAmount|0-10000000': 200,               // 交易金额
                            'tranStatus'           : '1',                          // 交易状态
                            'tranTime'             : '@DATE(YYYYMMDDhhmmss)',        // 交易时间
                            'tranType'             : '1',                            // 交易类型
                            'userId'               : '111',
                            'userName'             : 'chen'
                        }
                    ],
                    'total|0-100'  : 20
                },
                'msg' : ''
            }
        }
    },
    '/home/transaction/order': {
        'get': {
            'data': {
                "code": 200,
                'msg' : 'success',
                "data": [
                    {
                        "address"        : "测试",
                        "amount"         : "60.00",
                        "buyer_name"     : "测试",
                        "carriage"       : "10.00",
                        "channel"        : "1",
                        "date"           : "2014-04-03 21:23:01",
                        "goods_list"     : [
                            {
                                "brand_id"     : "3857",
                                "brand_name"   : "安莉芳EmbryForm",
                                "brand_sort_id": "0",
                                "goods_count"  : 1,
                                "id"           : "563180",
                                "image"        : "http://img2.vip.com/upload/merchandise/3857/EMBRYFORM-FB8927LPK-5.jpg",
                                "market_price" : "159",
                                "name"         : "Fandecie  粉色3/4围简约文胸",
                                "share_images" : [
                                    "http://a.vpimg4.com/upload/merchandise/3857/EMBRYFORM-FB8927LPK-1_1.jpg",
                                    "http://a.vpimg4.com/upload/merchandise/3857/EMBRYFORM-FB8927LPK-2_1.jpg",
                                    "http://a.vpimg4.com/upload/merchandise/3857/EMBRYFORM-FB8927LPK-3_1.jpg",
                                    "http://a.vpimg4.com/upload/merchandise/3857/EMBRYFORM-FB8927LPK-4_1.jpg",
                                    "http://a.vpimg4.com/upload/merchandise/3857/EMBRYFORM-FB8927LPK-15_1.jpg",
                                    "http://a.vpimg4.com/upload/merchandise/3857EMBRYFORM-FB8927LPK-16_1.jpg"
                                ],
                                "size_id"      : "1556639",
                                "size_name"    : "紫色",
                                "sn"           : "FB8927LPK",
                                "vipshop_price": "50"
                            }
                        ],
                        "id"             : "554491396",
                        "mobile"         : "15622728720",
                        "pay_status"     : "0",
                        "pay_status_name": "未支付",
                        "pay_type"       : "8",
                        "pay_type_name"  : "货到付款(现金)",
                        "sn"             : "14040303505413",
                        "source"         : "web",
                        "status"         : "97",
                        "status_name"    : "订单已取消",
                        "tel"            : "",
                        "transport_sn"   : "",
                        "type"           : "0",
                        "type_name"      : "未支付订单",
                        "user_id"        : 36375099,
                        "warehouse"      : "VIP_SH"
                    }
                ]
            }
        }
    }
};
























